"use strict";
/**
 * Parser for sed edit commands (-i flag substitutions)
 * Extracts file paths and substitution patterns to enable file-edit-style rendering
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSedInPlaceEdit = isSedInPlaceEdit;
exports.parseSedEditCommand = parseSedEditCommand;
exports.applySedSubstitution = applySedSubstitution;
var crypto_1 = require("crypto");
var shellQuote_js_1 = require("../../utils/bash/shellQuote.js");
// BRE→ERE conversion placeholders (null-byte sentinels, never appear in user input)
var BACKSLASH_PLACEHOLDER = '\x00BACKSLASH\x00';
var PLUS_PLACEHOLDER = '\x00PLUS\x00';
var QUESTION_PLACEHOLDER = '\x00QUESTION\x00';
var PIPE_PLACEHOLDER = '\x00PIPE\x00';
var LPAREN_PLACEHOLDER = '\x00LPAREN\x00';
var RPAREN_PLACEHOLDER = '\x00RPAREN\x00';
var BACKSLASH_PLACEHOLDER_RE = new RegExp(BACKSLASH_PLACEHOLDER, 'g');
var PLUS_PLACEHOLDER_RE = new RegExp(PLUS_PLACEHOLDER, 'g');
var QUESTION_PLACEHOLDER_RE = new RegExp(QUESTION_PLACEHOLDER, 'g');
var PIPE_PLACEHOLDER_RE = new RegExp(PIPE_PLACEHOLDER, 'g');
var LPAREN_PLACEHOLDER_RE = new RegExp(LPAREN_PLACEHOLDER, 'g');
var RPAREN_PLACEHOLDER_RE = new RegExp(RPAREN_PLACEHOLDER, 'g');
/**
 * Check if a command is a sed in-place edit command
 * Returns true only for simple sed -i 's/pattern/replacement/flags' file commands
 */
function isSedInPlaceEdit(command) {
    var info = parseSedEditCommand(command);
    return info !== null;
}
/**
 * Parse a sed edit command and extract the edit information
 * Returns null if the command is not a valid sed in-place edit
 */
function parseSedEditCommand(command) {
    var trimmed = command.trim();
    // Must start with sed
    var sedMatch = trimmed.match(/^\s*sed\s+/);
    if (!sedMatch)
        return null;
    var withoutSed = trimmed.slice(sedMatch[0].length);
    var parseResult = (0, shellQuote_js_1.tryParseShellCommand)(withoutSed);
    if (!parseResult.success)
        return null;
    var tokens = parseResult.tokens;
    // Extract string tokens only
    var args = [];
    for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
        var token = tokens_1[_i];
        if (typeof token === 'string') {
            args.push(token);
        }
        else if (typeof token === 'object' &&
            token !== null &&
            'op' in token &&
            token.op === 'glob') {
            // Glob patterns are too complex for this simple parser
            return null;
        }
    }
    // Parse flags and arguments
    var hasInPlaceFlag = false;
    var extendedRegex = false;
    var expression = null;
    var filePath = null;
    var i = 0;
    while (i < args.length) {
        var arg = args[i];
        // Handle -i flag (with or without backup suffix)
        if (arg === '-i' || arg === '--in-place') {
            hasInPlaceFlag = true;
            i++;
            // On macOS, -i requires a suffix argument (even if empty string)
            // Check if next arg looks like a backup suffix (empty, or starts with dot)
            // Don't consume flags (-E, -r) or sed expressions (starting with s, y, d)
            if (i < args.length) {
                var nextArg = args[i];
                // If next arg is empty string or starts with dot, it's a backup suffix
                if (typeof nextArg === 'string' &&
                    !nextArg.startsWith('-') &&
                    (nextArg === '' || nextArg.startsWith('.'))) {
                    i++; // Skip the backup suffix
                }
            }
            continue;
        }
        if (arg.startsWith('-i')) {
            // -i.bak or similar (inline suffix)
            hasInPlaceFlag = true;
            i++;
            continue;
        }
        // Handle extended regex flags
        if (arg === '-E' || arg === '-r' || arg === '--regexp-extended') {
            extendedRegex = true;
            i++;
            continue;
        }
        // Handle -e flag with expression
        if (arg === '-e' || arg === '--expression') {
            if (i + 1 < args.length && typeof args[i + 1] === 'string') {
                // Only support single expression
                if (expression !== null)
                    return null;
                expression = args[i + 1];
                i += 2;
                continue;
            }
            return null;
        }
        if (arg.startsWith('--expression=')) {
            if (expression !== null)
                return null;
            expression = arg.slice('--expression='.length);
            i++;
            continue;
        }
        // Skip other flags we don't understand
        if (arg.startsWith('-')) {
            // Unknown flag - not safe to parse
            return null;
        }
        // Non-flag argument
        if (expression === null) {
            // First non-flag arg is the expression
            expression = arg;
        }
        else if (filePath === null) {
            // Second non-flag arg is the file path
            filePath = arg;
        }
        else {
            // More than one file - not supported for simple rendering
            return null;
        }
        i++;
    }
    // Must have -i flag, expression, and file path
    if (!hasInPlaceFlag || !expression || !filePath) {
        return null;
    }
    // Parse the substitution expression: s/pattern/replacement/flags
    // Only support / as delimiter for simplicity
    var substMatch = expression.match(/^s\//);
    if (!substMatch) {
        return null;
    }
    var rest = expression.slice(2); // Skip 's/'
    // Find pattern and replacement by tracking escaped characters
    var pattern = '';
    var replacement = '';
    var flags = '';
    var state = 'pattern';
    var j = 0;
    while (j < rest.length) {
        var char = rest[j];
        if (char === '\\' && j + 1 < rest.length) {
            // Escaped character
            if (state === 'pattern') {
                pattern += char + rest[j + 1];
            }
            else if (state === 'replacement') {
                replacement += char + rest[j + 1];
            }
            else {
                flags += char + rest[j + 1];
            }
            j += 2;
            continue;
        }
        if (char === '/') {
            if (state === 'pattern') {
                state = 'replacement';
            }
            else if (state === 'replacement') {
                state = 'flags';
            }
            else {
                // Extra delimiter in flags - unexpected
                return null;
            }
            j++;
            continue;
        }
        if (state === 'pattern') {
            pattern += char;
        }
        else if (state === 'replacement') {
            replacement += char;
        }
        else {
            flags += char;
        }
        j++;
    }
    // Must have found all three parts (pattern, replacement delimiter, and optional flags)
    if (state !== 'flags') {
        return null;
    }
    // Validate flags - only allow safe substitution flags
    var validFlags = /^[gpimIM1-9]*$/;
    if (!validFlags.test(flags)) {
        return null;
    }
    return {
        filePath: filePath,
        pattern: pattern,
        replacement: replacement,
        flags: flags,
        extendedRegex: extendedRegex,
    };
}
/**
 * Apply a sed substitution to file content
 * Returns the new content after applying the substitution
 */
function applySedSubstitution(content, sedInfo) {
    // Convert sed pattern to JavaScript regex
    var regexFlags = '';
    // Handle global flag
    if (sedInfo.flags.includes('g')) {
        regexFlags += 'g';
    }
    // Handle case-insensitive flag (i or I in sed)
    if (sedInfo.flags.includes('i') || sedInfo.flags.includes('I')) {
        regexFlags += 'i';
    }
    // Handle multiline flag (m or M in sed)
    if (sedInfo.flags.includes('m') || sedInfo.flags.includes('M')) {
        regexFlags += 'm';
    }
    // Convert sed pattern to JavaScript regex pattern
    var jsPattern = sedInfo.pattern
        // Unescape \/ to /
        .replace(/\\\//g, '/');
    // In BRE mode (no -E flag), metacharacters have opposite escaping:
    // BRE: \+ means "one or more", + is literal
    // ERE/JS: + means "one or more", \+ is literal
    // We need to convert BRE escaping to ERE for JavaScript regex
    if (!sedInfo.extendedRegex) {
        jsPattern = jsPattern
            // Step 1: Protect literal backslashes (\\) first - in both BRE and ERE, \\ is literal backslash
            .replace(/\\\\/g, BACKSLASH_PLACEHOLDER)
            // Step 2: Replace escaped metacharacters with placeholders (these should become unescaped in JS)
            .replace(/\\\+/g, PLUS_PLACEHOLDER)
            .replace(/\\\?/g, QUESTION_PLACEHOLDER)
            .replace(/\\\|/g, PIPE_PLACEHOLDER)
            .replace(/\\\(/g, LPAREN_PLACEHOLDER)
            .replace(/\\\)/g, RPAREN_PLACEHOLDER)
            // Step 3: Escape unescaped metacharacters (these are literal in BRE)
            .replace(/\+/g, '\\+')
            .replace(/\?/g, '\\?')
            .replace(/\|/g, '\\|')
            .replace(/\(/g, '\\(')
            .replace(/\)/g, '\\)')
            // Step 4: Replace placeholders with their JS equivalents
            .replace(BACKSLASH_PLACEHOLDER_RE, '\\\\')
            .replace(PLUS_PLACEHOLDER_RE, '+')
            .replace(QUESTION_PLACEHOLDER_RE, '?')
            .replace(PIPE_PLACEHOLDER_RE, '|')
            .replace(LPAREN_PLACEHOLDER_RE, '(')
            .replace(RPAREN_PLACEHOLDER_RE, ')');
    }
    // Unescape sed-specific escapes in replacement
    // Convert \n to newline, & to $& (match), etc.
    // Use a unique placeholder with random salt to prevent injection attacks
    var salt = (0, crypto_1.randomBytes)(8).toString('hex');
    var ESCAPED_AMP_PLACEHOLDER = "___ESCAPED_AMPERSAND_".concat(salt, "___");
    var jsReplacement = sedInfo.replacement
        // Unescape \/ to /
        .replace(/\\\//g, '/')
        // First escape \& to a placeholder
        .replace(/\\&/g, ESCAPED_AMP_PLACEHOLDER)
        // Convert & to $& (full match) - use $$& to get literal $& in output
        .replace(/&/g, '$$&')
        // Convert placeholder back to literal &
        .replace(new RegExp(ESCAPED_AMP_PLACEHOLDER, 'g'), '&');
    try {
        var regex = new RegExp(jsPattern, regexFlags);
        return content.replace(regex, jsReplacement);
    }
    catch (_a) {
        // If regex is invalid, return original content
        return content;
    }
}
