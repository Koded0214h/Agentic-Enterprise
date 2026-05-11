"use strict";
/**
 * Frontmatter parser for markdown files
 * Extracts and parses YAML frontmatter between --- delimiters
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FRONTMATTER_REGEX = void 0;
exports.parseFrontmatter = parseFrontmatter;
exports.splitPathInFrontmatter = splitPathInFrontmatter;
exports.parsePositiveIntFromFrontmatter = parsePositiveIntFromFrontmatter;
exports.coerceDescriptionToString = coerceDescriptionToString;
exports.parseBooleanFrontmatter = parseBooleanFrontmatter;
exports.parseShellFrontmatter = parseShellFrontmatter;
var debug_js_1 = require("./debug.js");
var yaml_js_1 = require("./yaml.js");
// Characters that require quoting in YAML values (when unquoted)
// - { } are flow mapping indicators
// - * is anchor/alias indicator
// - [ ] are flow sequence indicators
// - ': ' (colon followed by space) is key indicator — causes 'Nested mappings
//   are not allowed in compact mappings' when it appears mid-value. Match the
//   pattern rather than bare ':' so '12:34' times and 'https://' URLs stay unquoted.
// - # is comment indicator
// - & is anchor indicator
// - ! is tag indicator
// - | > are block scalar indicators (only at start)
// - % is directive indicator (only at start)
// - @ ` are reserved
var YAML_SPECIAL_CHARS = /[{}[\]*&#!|>%@`]|: /;
/**
 * Pre-processes frontmatter text to quote values that contain special YAML characters.
 * This allows glob patterns like **\/*.{ts,tsx} to be parsed correctly.
 */
function quoteProblematicValues(frontmatterText) {
    var lines = frontmatterText.split('\n');
    var result = [];
    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
        var line = lines_1[_i];
        // Match simple key: value lines (not indented, not list items, not block scalars)
        var match = line.match(/^([a-zA-Z_-]+):\s+(.+)$/);
        if (match) {
            var key = match[1], value = match[2];
            if (!key || !value) {
                result.push(line);
                continue;
            }
            // Skip if already quoted
            if ((value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))) {
                result.push(line);
                continue;
            }
            // Quote if contains special YAML characters
            if (YAML_SPECIAL_CHARS.test(value)) {
                // Use double quotes and escape any existing double quotes
                var escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
                result.push("".concat(key, ": \"").concat(escaped, "\""));
                continue;
            }
        }
        result.push(line);
    }
    return result.join('\n');
}
exports.FRONTMATTER_REGEX = /^---\s*\n([\s\S]*?)---\s*\n?/;
/**
 * Parses markdown content to extract frontmatter and content
 * @param markdown The raw markdown content
 * @returns Object containing parsed frontmatter and content without frontmatter
 */
function parseFrontmatter(markdown, sourcePath) {
    var match = markdown.match(exports.FRONTMATTER_REGEX);
    if (!match) {
        // No frontmatter found
        return {
            frontmatter: {},
            content: markdown,
        };
    }
    var frontmatterText = match[1] || '';
    var content = markdown.slice(match[0].length);
    var frontmatter = {};
    try {
        var parsed = (0, yaml_js_1.parseYaml)(frontmatterText);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            frontmatter = parsed;
        }
    }
    catch (_a) {
        // YAML parsing failed - try again after quoting problematic values
        try {
            var quotedText = quoteProblematicValues(frontmatterText);
            var parsed = (0, yaml_js_1.parseYaml)(quotedText);
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                frontmatter = parsed;
            }
        }
        catch (retryError) {
            // Still failed - log for debugging so users can diagnose broken frontmatter
            var location_1 = sourcePath ? " in ".concat(sourcePath) : '';
            (0, debug_js_1.logForDebugging)("Failed to parse YAML frontmatter".concat(location_1, ": ").concat(retryError instanceof Error ? retryError.message : retryError), { level: 'warn' });
        }
    }
    return {
        frontmatter: frontmatter,
        content: content,
    };
}
/**
 * Splits a comma-separated string and expands brace patterns.
 * Commas inside braces are not treated as separators.
 * Also accepts a YAML list (string array) for ergonomic frontmatter.
 * @param input - Comma-separated string, or array of strings, with optional brace patterns
 * @returns Array of expanded strings
 * @example
 * splitPathInFrontmatter("a, b") // returns ["a", "b"]
 * splitPathInFrontmatter("a, src/*.{ts,tsx}") // returns ["a", "src/*.ts", "src/*.tsx"]
 * splitPathInFrontmatter("{a,b}/{c,d}") // returns ["a/c", "a/d", "b/c", "b/d"]
 * splitPathInFrontmatter(["a", "src/*.{ts,tsx}"]) // returns ["a", "src/*.ts", "src/*.tsx"]
 */
function splitPathInFrontmatter(input) {
    if (Array.isArray(input)) {
        return input.flatMap(splitPathInFrontmatter);
    }
    if (typeof input !== 'string') {
        return [];
    }
    // Split by comma while respecting braces
    var parts = [];
    var current = '';
    var braceDepth = 0;
    for (var i = 0; i < input.length; i++) {
        var char = input[i];
        if (char === '{') {
            braceDepth++;
            current += char;
        }
        else if (char === '}') {
            braceDepth--;
            current += char;
        }
        else if (char === ',' && braceDepth === 0) {
            // Split here - we're at a comma outside of braces
            var trimmed_1 = current.trim();
            if (trimmed_1) {
                parts.push(trimmed_1);
            }
            current = '';
        }
        else {
            current += char;
        }
    }
    // Add the last part
    var trimmed = current.trim();
    if (trimmed) {
        parts.push(trimmed);
    }
    // Expand brace patterns in each part
    return parts
        .filter(function (p) { return p.length > 0; })
        .flatMap(function (pattern) { return expandBraces(pattern); });
}
/**
 * Expands brace patterns in a glob string.
 * @example
 * expandBraces("src/*.{ts,tsx}") // returns ["src/*.ts", "src/*.tsx"]
 * expandBraces("{a,b}/{c,d}") // returns ["a/c", "a/d", "b/c", "b/d"]
 */
function expandBraces(pattern) {
    // Find the first brace group
    var braceMatch = pattern.match(/^([^{]*)\{([^}]+)\}(.*)$/);
    if (!braceMatch) {
        // No braces found, return pattern as-is
        return [pattern];
    }
    var prefix = braceMatch[1] || '';
    var alternatives = braceMatch[2] || '';
    var suffix = braceMatch[3] || '';
    // Split alternatives by comma and expand each one
    var parts = alternatives.split(',').map(function (alt) { return alt.trim(); });
    // Recursively expand remaining braces in suffix
    var expanded = [];
    for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
        var part = parts_1[_i];
        var combined = prefix + part + suffix;
        // Recursively handle additional brace groups
        var furtherExpanded = expandBraces(combined);
        expanded.push.apply(expanded, furtherExpanded);
    }
    return expanded;
}
/**
 * Parses a positive integer value from frontmatter.
 * Handles both number and string representations.
 *
 * @param value The raw value from frontmatter (could be number, string, or undefined)
 * @returns The parsed positive integer, or undefined if invalid or not provided
 */
function parsePositiveIntFromFrontmatter(value) {
    if (value === undefined || value === null) {
        return undefined;
    }
    var parsed = typeof value === 'number' ? value : parseInt(String(value), 10);
    if (Number.isInteger(parsed) && parsed > 0) {
        return parsed;
    }
    return undefined;
}
/**
 * Validate and coerce a description value from frontmatter.
 *
 * Strings are returned as-is (trimmed). Primitive values (numbers, booleans)
 * are coerced to strings via String(). Non-scalar values (arrays, objects)
 * are invalid and are logged then omitted. Null, undefined, and
 * empty/whitespace-only strings return null so callers can fall back to
 * a default.
 *
 * @param value - The raw frontmatter description value
 * @param componentName - The skill/command/agent/style name for log messages
 * @param pluginName - The plugin name, if this came from a plugin
 */
function coerceDescriptionToString(value, componentName, pluginName) {
    if (value == null) {
        return null;
    }
    if (typeof value === 'string') {
        return value.trim() || null;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }
    // Non-scalar descriptions (arrays, objects) are invalid — log and omit
    var source = pluginName
        ? "".concat(pluginName, ":").concat(componentName)
        : (componentName !== null && componentName !== void 0 ? componentName : 'unknown');
    (0, debug_js_1.logForDebugging)("Description invalid for ".concat(source, " - omitting"), {
        level: 'warn',
    });
    return null;
}
/**
 * Parse a boolean frontmatter value.
 * Only returns true for literal true or "true" string.
 */
function parseBooleanFrontmatter(value) {
    return value === true || value === 'true';
}
var FRONTMATTER_SHELLS = ['bash', 'powershell'];
/**
 * Parse and validate the `shell:` frontmatter field.
 *
 * Returns undefined for absent/null/empty (caller defaults to bash).
 * Logs a warning and returns undefined for unrecognized values — we fall
 * back to bash rather than failing the skill load, matching how `effort`
 * and other fields degrade.
 */
function parseShellFrontmatter(value, source) {
    if (value == null) {
        return undefined;
    }
    var normalized = String(value).trim().toLowerCase();
    if (normalized === '') {
        return undefined;
    }
    if (FRONTMATTER_SHELLS.includes(normalized)) {
        return normalized;
    }
    (0, debug_js_1.logForDebugging)("Frontmatter 'shell: ".concat(value, "' in ").concat(source, " is not recognized. Valid values: ").concat(FRONTMATTER_SHELLS.join(', '), ". Falling back to bash."), { level: 'warn' });
    return undefined;
}
