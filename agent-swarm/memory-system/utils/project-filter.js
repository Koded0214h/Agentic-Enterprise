"use strict";
/**
 * Project Filter Utility
 *
 * Provides glob-based path matching for project exclusion.
 * Supports: ~ (home), * (any chars except /), ** (any path), ? (single char)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isProjectExcluded = isProjectExcluded;
var os_1 = require("os");
/**
 * Convert a glob pattern to a regular expression
 * Supports: ~ (home dir), * (any non-slash), ** (any path), ? (single char)
 */
function globToRegex(pattern) {
    // Expand ~ to home directory
    var expanded = pattern.startsWith('~')
        ? (0, os_1.homedir)() + pattern.slice(1)
        : pattern;
    // Normalize path separators to forward slashes
    expanded = expanded.replace(/\\/g, '/');
    // Escape regex special characters except * and ?
    var regex = expanded.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    // Convert glob patterns to regex:
    // ** matches any path (including /)
    // * matches any characters except /
    // ? matches single character except /
    regex = regex
        .replace(/\*\*/g, '<<<GLOBSTAR>>>') // Temporary placeholder
        .replace(/\*/g, '[^/]*') // * = any non-slash
        .replace(/\?/g, '[^/]') // ? = single non-slash
        .replace(/<<<GLOBSTAR>>>/g, '.*'); // ** = anything
    return new RegExp("^".concat(regex, "$"));
}
/**
 * Check if a path matches any of the exclusion patterns
 *
 * @param projectPath - Current working directory (absolute path)
 * @param exclusionPatterns - Comma-separated glob patterns (e.g., "~/kunden/*,/tmp/*")
 * @returns true if path should be excluded
 */
function isProjectExcluded(projectPath, exclusionPatterns) {
    if (!exclusionPatterns || !exclusionPatterns.trim()) {
        return false;
    }
    // Normalize cwd path separators
    var normalizedProjectPath = projectPath.replace(/\\/g, '/');
    // Parse comma-separated patterns
    var patternList = exclusionPatterns
        .split(',')
        .map(function (p) { return p.trim(); })
        .filter(Boolean);
    for (var _i = 0, patternList_1 = patternList; _i < patternList_1.length; _i++) {
        var pattern = patternList_1[_i];
        try {
            var regex = globToRegex(pattern);
            if (regex.test(normalizedProjectPath)) {
                return true;
            }
        }
        catch (_a) {
            // Invalid pattern, skip it
            continue;
        }
    }
    return false;
}
