"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizePath = void 0;
exports.expandPath = expandPath;
exports.toRelativePath = toRelativePath;
exports.getDirectoryForPath = getDirectoryForPath;
exports.containsPathTraversal = containsPathTraversal;
exports.normalizePathForConfigKey = normalizePathForConfigKey;
var os_1 = require("os");
var path_1 = require("path");
var cwd_js_1 = require("./cwd.js");
var fsOperations_js_1 = require("./fsOperations.js");
var platform_js_1 = require("./platform.js");
var windowsPaths_js_1 = require("./windowsPaths.js");
/**
 * Expands a path that may contain tilde notation (~) to an absolute path.
 *
 * On Windows, POSIX-style paths (e.g., `/c/Users/...`) are automatically converted
 * to Windows format (e.g., `C:\Users\...`). The function always returns paths in
 * the native format for the current platform.
 *
 * @param path - The path to expand, may contain:
 *   - `~` - expands to user's home directory
 *   - `~/path` - expands to path within user's home directory
 *   - absolute paths - returned normalized
 *   - relative paths - resolved relative to baseDir
 *   - POSIX paths on Windows - converted to Windows format
 * @param baseDir - The base directory for resolving relative paths (defaults to current working directory)
 * @returns The expanded absolute path in the native format for the current platform
 *
 * @throws {Error} If path is invalid
 *
 * @example
 * expandPath('~') // '/home/user'
 * expandPath('~/Documents') // '/home/user/Documents'
 * expandPath('./src', '/project') // '/project/src'
 * expandPath('/absolute/path') // '/absolute/path'
 */
function expandPath(path, baseDir) {
    var _a;
    // Set default baseDir to getCwd() if not provided
    var actualBaseDir = (_a = baseDir !== null && baseDir !== void 0 ? baseDir : (0, cwd_js_1.getCwd)()) !== null && _a !== void 0 ? _a : (0, fsOperations_js_1.getFsImplementation)().cwd();
    // Input validation
    if (typeof path !== 'string') {
        throw new TypeError("Path must be a string, received ".concat(typeof path));
    }
    if (typeof actualBaseDir !== 'string') {
        throw new TypeError("Base directory must be a string, received ".concat(typeof actualBaseDir));
    }
    // Security: Check for null bytes
    if (path.includes('\0') || actualBaseDir.includes('\0')) {
        throw new Error('Path contains null bytes');
    }
    // Handle empty or whitespace-only paths
    var trimmedPath = path.trim();
    if (!trimmedPath) {
        return (0, path_1.normalize)(actualBaseDir).normalize('NFC');
    }
    // Handle home directory notation
    if (trimmedPath === '~') {
        return (0, os_1.homedir)().normalize('NFC');
    }
    if (trimmedPath.startsWith('~/')) {
        return (0, path_1.join)((0, os_1.homedir)(), trimmedPath.slice(2)).normalize('NFC');
    }
    // On Windows, convert POSIX-style paths (e.g., /c/Users/...) to Windows format
    var processedPath = trimmedPath;
    if ((0, platform_js_1.getPlatform)() === 'windows' && trimmedPath.match(/^\/[a-z]\//i)) {
        try {
            processedPath = (0, windowsPaths_js_1.posixPathToWindowsPath)(trimmedPath);
        }
        catch (_b) {
            // If conversion fails, use original path
            processedPath = trimmedPath;
        }
    }
    // Handle absolute paths
    if ((0, path_1.isAbsolute)(processedPath)) {
        return (0, path_1.normalize)(processedPath).normalize('NFC');
    }
    // Handle relative paths
    return (0, path_1.resolve)(actualBaseDir, processedPath).normalize('NFC');
}
/**
 * Converts an absolute path to a relative path from cwd, to save tokens in
 * tool output. If the path is outside cwd (relative path would start with ..),
 * returns the absolute path unchanged so it stays unambiguous.
 *
 * @param absolutePath - The absolute path to relativize
 * @returns Relative path if under cwd, otherwise the original absolute path
 */
function toRelativePath(absolutePath) {
    var relativePath = (0, path_1.relative)((0, cwd_js_1.getCwd)(), absolutePath);
    // If the relative path would go outside cwd (starts with ..), keep absolute
    return relativePath.startsWith('..') ? absolutePath : relativePath;
}
/**
 * Gets the directory path for a given file or directory path.
 * If the path is a directory, returns the path itself.
 * If the path is a file or doesn't exist, returns the parent directory.
 *
 * @param path - The file or directory path
 * @returns The directory path
 */
function getDirectoryForPath(path) {
    var absolutePath = expandPath(path);
    // SECURITY: Skip filesystem operations for UNC paths to prevent NTLM credential leaks.
    if (absolutePath.startsWith('\\\\') || absolutePath.startsWith('//')) {
        return (0, path_1.dirname)(absolutePath);
    }
    try {
        var stats = (0, fsOperations_js_1.getFsImplementation)().statSync(absolutePath);
        if (stats.isDirectory()) {
            return absolutePath;
        }
    }
    catch (_a) {
        // Path doesn't exist or can't be accessed
    }
    // If it's not a directory or doesn't exist, return the parent directory
    return (0, path_1.dirname)(absolutePath);
}
/**
 * Checks if a path contains directory traversal patterns that navigate to parent directories.
 *
 * @param path - The path to check for traversal patterns
 * @returns true if the path contains traversal (e.g., '../', '..\', or ends with '..')
 */
function containsPathTraversal(path) {
    return /(?:^|[\\/])\.\.(?:[\\/]|$)/.test(path);
}
// Re-export from the shared zero-dep source.
var sessionStoragePortable_js_1 = require("./sessionStoragePortable.js");
Object.defineProperty(exports, "sanitizePath", { enumerable: true, get: function () { return sessionStoragePortable_js_1.sanitizePath; } });
/**
 * Normalizes a path for use as a JSON config key.
 * On Windows, paths can have inconsistent separators (C:\path vs C:/path)
 * depending on whether they come from git, Node.js APIs, or user input.
 * This normalizes to forward slashes for consistent JSON serialization.
 *
 * @param path - The path to normalize
 * @returns The normalized path with consistent forward slashes
 */
function normalizePathForConfigKey(path) {
    // First use Node's normalize to resolve . and .. segments
    var normalized = (0, path_1.normalize)(path);
    // Then convert all backslashes to forward slashes for consistent JSON keys
    // This is safe because forward slashes work in Windows paths for most operations
    return normalized.replace(/\\/g, '/');
}
