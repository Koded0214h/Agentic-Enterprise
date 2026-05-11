"use strict";
/**
 * Safe wrappers for shell-quote library functions that handle errors gracefully
 * These are drop-in replacements for the original functions
 */
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
exports.tryParseShellCommand = tryParseShellCommand;
exports.tryQuoteShellArgs = tryQuoteShellArgs;
exports.hasMalformedTokens = hasMalformedTokens;
exports.hasShellQuoteSingleQuoteBug = hasShellQuoteSingleQuoteBug;
exports.quote = quote;
var shell_quote_1 = require("shell-quote");
var log_js_1 = require("../log.js");
var slowOperations_js_1 = require("../slowOperations.js");
function tryParseShellCommand(cmd, env) {
    try {
        var tokens = typeof env === 'function'
            ? (0, shell_quote_1.parse)(cmd, env)
            : (0, shell_quote_1.parse)(cmd, env);
        return { success: true, tokens: tokens };
    }
    catch (error) {
        if (error instanceof Error) {
            (0, log_js_1.logError)(error);
        }
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown parse error',
        };
    }
}
function tryQuoteShellArgs(args) {
    try {
        var validated = args.map(function (arg, index) {
            if (arg === null || arg === undefined) {
                return String(arg);
            }
            var type = typeof arg;
            if (type === 'string') {
                return arg;
            }
            if (type === 'number' || type === 'boolean') {
                return String(arg);
            }
            if (type === 'object') {
                throw new Error("Cannot quote argument at index ".concat(index, ": object values are not supported"));
            }
            if (type === 'symbol') {
                throw new Error("Cannot quote argument at index ".concat(index, ": symbol values are not supported"));
            }
            if (type === 'function') {
                throw new Error("Cannot quote argument at index ".concat(index, ": function values are not supported"));
            }
            throw new Error("Cannot quote argument at index ".concat(index, ": unsupported type ").concat(type));
        });
        var quoted = (0, shell_quote_1.quote)(validated);
        return { success: true, quoted: quoted };
    }
    catch (error) {
        if (error instanceof Error) {
            (0, log_js_1.logError)(error);
        }
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown quote error',
        };
    }
}
/**
 * Checks if parsed tokens contain malformed entries that suggest shell-quote
 * misinterpreted the command. This happens when input contains ambiguous
 * patterns (like JSON-like strings with semicolons) that shell-quote parses
 * according to shell rules, producing token fragments.
 *
 * For example, `echo {"hi":"hi;evil"}` gets parsed with `;` as an operator,
 * producing tokens like `{hi:"hi` (unbalanced brace). Legitimate commands
 * produce complete, balanced tokens.
 *
 * Also detects unterminated quotes in the original command: shell-quote
 * silently drops an unmatched `"` or `'` and parses the rest as unquoted,
 * leaving no trace in the tokens. `echo "hi;evil | cat` (one unmatched `"`)
 * is a bash syntax error, but shell-quote yields clean tokens with `;` as
 * an operator. The token-level checks below can't catch this, so we walk
 * the original command with bash quote semantics and flag odd parity.
 *
 * Security: This prevents command injection via HackerOne #3482049 where
 * shell-quote's correct parsing of ambiguous input can be exploited.
 */
function hasMalformedTokens(command, parsed) {
    // Check for unterminated quotes in the original command. shell-quote drops
    // an unmatched quote without leaving any trace in the tokens, so this must
    // inspect the raw string. Walk with bash semantics: backslash escapes the
    // next char outside single-quotes; no escapes inside single-quotes.
    var inSingle = false;
    var inDouble = false;
    var doubleCount = 0;
    var singleCount = 0;
    for (var i = 0; i < command.length; i++) {
        var c = command[i];
        if (c === '\\' && !inSingle) {
            i++;
            continue;
        }
        if (c === '"' && !inSingle) {
            doubleCount++;
            inDouble = !inDouble;
        }
        else if (c === "'" && !inDouble) {
            singleCount++;
            inSingle = !inSingle;
        }
    }
    if (doubleCount % 2 !== 0 || singleCount % 2 !== 0)
        return true;
    for (var _i = 0, parsed_1 = parsed; _i < parsed_1.length; _i++) {
        var entry = parsed_1[_i];
        if (typeof entry !== 'string')
            continue;
        // Check for unbalanced curly braces
        var openBraces = (entry.match(/{/g) || []).length;
        var closeBraces = (entry.match(/}/g) || []).length;
        if (openBraces !== closeBraces)
            return true;
        // Check for unbalanced parentheses
        var openParens = (entry.match(/\(/g) || []).length;
        var closeParens = (entry.match(/\)/g) || []).length;
        if (openParens !== closeParens)
            return true;
        // Check for unbalanced square brackets
        var openBrackets = (entry.match(/\[/g) || []).length;
        var closeBrackets = (entry.match(/\]/g) || []).length;
        if (openBrackets !== closeBrackets)
            return true;
        // Check for unbalanced double quotes
        // Count quotes that aren't escaped (preceded by backslash)
        // A token with an odd number of unescaped quotes is malformed
        // eslint-disable-next-line custom-rules/no-lookbehind-regex -- gated by hasCommandSeparator check at caller, runs on short per-token strings
        var doubleQuotes = entry.match(/(?<!\\)"/g) || [];
        if (doubleQuotes.length % 2 !== 0)
            return true;
        // Check for unbalanced single quotes
        // eslint-disable-next-line custom-rules/no-lookbehind-regex -- same as above
        var singleQuotes = entry.match(/(?<!\\)'/g) || [];
        if (singleQuotes.length % 2 !== 0)
            return true;
    }
    return false;
}
/**
 * Detects commands containing '\' patterns that exploit the shell-quote library's
 * incorrect handling of backslashes inside single quotes.
 *
 * In bash, single quotes preserve ALL characters literally - backslash has no
 * special meaning. So '\' is just the string \ (the quote opens, contains \,
 * and the next ' closes it). But shell-quote incorrectly treats \ as an escape
 * character inside single quotes, causing '\' to NOT close the quoted string.
 *
 * This means the pattern '\' <payload> '\' hides <payload> from security checks
 * because shell-quote thinks it's all one single-quoted string.
 */
function hasShellQuoteSingleQuoteBug(command) {
    // Walk the command with correct bash single-quote semantics
    var inSingleQuote = false;
    var inDoubleQuote = false;
    for (var i = 0; i < command.length; i++) {
        var char = command[i];
        // Handle backslash escaping outside of single quotes
        if (char === '\\' && !inSingleQuote) {
            // Skip the next character (it's escaped)
            i++;
            continue;
        }
        if (char === '"' && !inSingleQuote) {
            inDoubleQuote = !inDoubleQuote;
            continue;
        }
        if (char === "'" && !inDoubleQuote) {
            inSingleQuote = !inSingleQuote;
            // Check if we just closed a single quote and the content ends with
            // trailing backslashes. shell-quote's chunker regex '((\\'|[^'])*?)'
            // incorrectly treats \' as an escape sequence inside single quotes,
            // while bash treats backslash as literal. This creates a differential
            // where shell-quote merges tokens that bash treats as separate.
            //
            // Odd trailing \'s = always a bug:
            //   '\' -> shell-quote: \' = literal ', still open. bash: \, closed.
            //   'abc\' -> shell-quote: abc then \' = literal ', still open. bash: abc\, closed.
            //   '\\\'  -> shell-quote: \\ + \', still open. bash: \\\, closed.
            //
            // Even trailing \'s = bug ONLY when a later ' exists in the command:
            //   '\\' alone -> shell-quote backtracks, both parsers agree string closes. OK.
            //   '\\' 'next' -> shell-quote: \' consumes the closing ', finds next ' as
            //                   false close, merges tokens. bash: two separate tokens.
            //
            //   Detail: the regex alternation tries \' before [^']. For '\\', it matches
            //   the first \ via [^'] (next char is \, not '), then the second \ via \'
            //   (next char IS '). This consumes the closing '. The regex continues reading
            //   until it finds another ' to close the match. If none exists, it backtracks
            //   to [^'] for the second \ and closes correctly. If a later ' exists (e.g.,
            //   the opener of the next single-quoted arg), no backtracking occurs and
            //   tokens merge. See H1 report: git ls-remote 'safe\\' '--upload-pack=evil' 'repo'
            //   shell-quote: ["git","ls-remote","safe\\\\ --upload-pack=evil repo"]
            //   bash:        ["git","ls-remote","safe\\\\","--upload-pack=evil","repo"]
            if (!inSingleQuote) {
                var backslashCount = 0;
                var j = i - 1;
                while (j >= 0 && command[j] === '\\') {
                    backslashCount++;
                    j--;
                }
                if (backslashCount > 0 && backslashCount % 2 === 1) {
                    return true;
                }
                // Even trailing backslashes: only a bug when a later ' exists that
                // the chunker regex can use as a false closing quote. We check for
                // ANY later ' because the regex doesn't respect bash quote state
                // (e.g., a ' inside double quotes is also consumable).
                if (backslashCount > 0 &&
                    backslashCount % 2 === 0 &&
                    command.indexOf("'", i + 1) !== -1) {
                    return true;
                }
            }
            continue;
        }
    }
    return false;
}
function quote(args) {
    // First try the strict validation
    var result = tryQuoteShellArgs(__spreadArray([], args, true));
    if (result.success) {
        return result.quoted;
    }
    // If strict validation failed, use lenient fallback
    // This handles objects, symbols, functions, etc. by converting them to strings
    try {
        var stringArgs = args.map(function (arg) {
            if (arg === null || arg === undefined) {
                return String(arg);
            }
            var type = typeof arg;
            if (type === 'string' || type === 'number' || type === 'boolean') {
                return String(arg);
            }
            // For unsupported types, use JSON.stringify as a safe fallback
            // This ensures we don't crash but still get a meaningful representation
            return (0, slowOperations_js_1.jsonStringify)(arg);
        });
        return (0, shell_quote_1.quote)(stringArgs);
    }
    catch (error) {
        // SECURITY: Never use JSON.stringify as a fallback for shell quoting.
        // JSON.stringify uses double quotes which don't prevent shell command execution.
        // For example, jsonStringify(['echo', '$(whoami)']) produces "echo" "$(whoami)"
        if (error instanceof Error) {
            (0, log_js_1.logError)(error);
        }
        throw new Error('Failed to quote shell arguments safely');
    }
}
