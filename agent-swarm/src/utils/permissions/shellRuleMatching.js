"use strict";
/**
 * Shared permission rule matching utilities for shell tools.
 *
 * Extracts common logic for:
 * - Parsing permission rules (exact, prefix, wildcard)
 * - Matching commands against rules
 * - Generating permission suggestions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissionRuleExtractPrefix = permissionRuleExtractPrefix;
exports.hasWildcards = hasWildcards;
exports.matchWildcardPattern = matchWildcardPattern;
exports.parsePermissionRule = parsePermissionRule;
exports.suggestionForExactCommand = suggestionForExactCommand;
exports.suggestionForPrefix = suggestionForPrefix;
// Null-byte sentinel placeholders for wildcard pattern escaping — module-level
// so the RegExp objects are compiled once instead of per permission check.
var ESCAPED_STAR_PLACEHOLDER = '\x00ESCAPED_STAR\x00';
var ESCAPED_BACKSLASH_PLACEHOLDER = '\x00ESCAPED_BACKSLASH\x00';
var ESCAPED_STAR_PLACEHOLDER_RE = new RegExp(ESCAPED_STAR_PLACEHOLDER, 'g');
var ESCAPED_BACKSLASH_PLACEHOLDER_RE = new RegExp(ESCAPED_BACKSLASH_PLACEHOLDER, 'g');
/**
 * Extract prefix from legacy :* syntax (e.g., "npm:*" -> "npm")
 * This is maintained for backwards compatibility.
 */
function permissionRuleExtractPrefix(permissionRule) {
    var _a;
    var match = permissionRule.match(/^(.+):\*$/);
    return (_a = match === null || match === void 0 ? void 0 : match[1]) !== null && _a !== void 0 ? _a : null;
}
/**
 * Check if a pattern contains unescaped wildcards (not legacy :* syntax).
 * Returns true if the pattern contains * that are not escaped with \ or part of :* at the end.
 */
function hasWildcards(pattern) {
    // If it ends with :*, it's legacy prefix syntax, not wildcard
    if (pattern.endsWith(':*')) {
        return false;
    }
    // Check for unescaped * anywhere in the pattern
    // An asterisk is unescaped if it's not preceded by a backslash,
    // or if it's preceded by an even number of backslashes (escaped backslashes)
    for (var i = 0; i < pattern.length; i++) {
        if (pattern[i] === '*') {
            // Count backslashes before this asterisk
            var backslashCount = 0;
            var j = i - 1;
            while (j >= 0 && pattern[j] === '\\') {
                backslashCount++;
                j--;
            }
            // If even number of backslashes (including 0), the asterisk is unescaped
            if (backslashCount % 2 === 0) {
                return true;
            }
        }
    }
    return false;
}
/**
 * Match a command against a wildcard pattern.
 * Wildcards (*) match any sequence of characters.
 * Use \* to match a literal asterisk character.
 * Use \\ to match a literal backslash.
 *
 * @param pattern - The permission rule pattern with wildcards
 * @param command - The command to match against
 * @returns true if the command matches the pattern
 */
function matchWildcardPattern(pattern, command, caseInsensitive) {
    if (caseInsensitive === void 0) { caseInsensitive = false; }
    // Trim leading/trailing whitespace from pattern
    var trimmedPattern = pattern.trim();
    // Process the pattern to handle escape sequences: \* and \\
    var processed = '';
    var i = 0;
    while (i < trimmedPattern.length) {
        var char = trimmedPattern[i];
        // Handle escape sequences
        if (char === '\\' && i + 1 < trimmedPattern.length) {
            var nextChar = trimmedPattern[i + 1];
            if (nextChar === '*') {
                // \* -> literal asterisk placeholder
                processed += ESCAPED_STAR_PLACEHOLDER;
                i += 2;
                continue;
            }
            else if (nextChar === '\\') {
                // \\ -> literal backslash placeholder
                processed += ESCAPED_BACKSLASH_PLACEHOLDER;
                i += 2;
                continue;
            }
        }
        processed += char;
        i++;
    }
    // Escape regex special characters except *
    var escaped = processed.replace(/[.+?^${}()|[\]\\'"]/g, '\\$&');
    // Convert unescaped * to .* for wildcard matching
    var withWildcards = escaped.replace(/\*/g, '.*');
    // Convert placeholders back to escaped regex literals
    var regexPattern = withWildcards
        .replace(ESCAPED_STAR_PLACEHOLDER_RE, '\\*')
        .replace(ESCAPED_BACKSLASH_PLACEHOLDER_RE, '\\\\');
    // When a pattern ends with ' *' (space + unescaped wildcard) AND the trailing
    // wildcard is the ONLY unescaped wildcard, make the trailing space-and-args
    // optional so 'git *' matches both 'git add' and bare 'git'.
    // This aligns wildcard matching with prefix rule semantics (git:*).
    // Multi-wildcard patterns like '* run *' are excluded — making the last
    // wildcard optional would incorrectly match 'npm run' (no trailing arg).
    var unescapedStarCount = (processed.match(/\*/g) || []).length;
    if (regexPattern.endsWith(' .*') && unescapedStarCount === 1) {
        regexPattern = regexPattern.slice(0, -3) + '( .*)?';
    }
    // Create regex that matches the entire string.
    // The 's' (dotAll) flag makes '.' match newlines, so wildcards match
    // commands containing embedded newlines (e.g. heredoc content after splitCommand_DEPRECATED).
    var flags = 's' + (caseInsensitive ? 'i' : '');
    var regex = new RegExp("^".concat(regexPattern, "$"), flags);
    return regex.test(command);
}
/**
 * Parse a permission rule string into a structured rule object.
 */
function parsePermissionRule(permissionRule) {
    // Check for legacy :* prefix syntax first (backwards compatibility)
    var prefix = permissionRuleExtractPrefix(permissionRule);
    if (prefix !== null) {
        return {
            type: 'prefix',
            prefix: prefix,
        };
    }
    // Check for new wildcard syntax (contains * but not :* at end)
    if (hasWildcards(permissionRule)) {
        return {
            type: 'wildcard',
            pattern: permissionRule,
        };
    }
    // Otherwise, it's an exact match
    return {
        type: 'exact',
        command: permissionRule,
    };
}
/**
 * Generate permission update suggestion for an exact command match.
 */
function suggestionForExactCommand(toolName, command) {
    return [
        {
            type: 'addRules',
            rules: [
                {
                    toolName: toolName,
                    ruleContent: command,
                },
            ],
            behavior: 'allow',
            destination: 'localSettings',
        },
    ];
}
/**
 * Generate permission update suggestion for a prefix match.
 */
function suggestionForPrefix(toolName, prefix) {
    return [
        {
            type: 'addRules',
            rules: [
                {
                    toolName: toolName,
                    ruleContent: "".concat(prefix, ":*"),
                },
            ],
            behavior: 'allow',
            destination: 'localSettings',
        },
    ];
}
