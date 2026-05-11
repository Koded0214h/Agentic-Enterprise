"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FILE_NOT_FOUND_CWD_NOTE = exports.MAX_OUTPUT_SIZE = void 0;
exports.pathExists = pathExists;
exports.readFileSafe = readFileSafe;
exports.getFileModificationTime = getFileModificationTime;
exports.getFileModificationTimeAsync = getFileModificationTimeAsync;
exports.writeTextContent = writeTextContent;
exports.detectFileEncoding = detectFileEncoding;
exports.detectLineEndings = detectLineEndings;
exports.convertLeadingTabsToSpaces = convertLeadingTabsToSpaces;
exports.getAbsoluteAndRelativePaths = getAbsoluteAndRelativePaths;
exports.getDisplayPath = getDisplayPath;
exports.findSimilarFile = findSimilarFile;
exports.suggestPathUnderCwd = suggestPathUnderCwd;
exports.isCompactLinePrefixEnabled = isCompactLinePrefixEnabled;
exports.addLineNumbers = addLineNumbers;
exports.stripLineNumberPrefix = stripLineNumberPrefix;
exports.isDirEmpty = isDirEmpty;
exports.readFileSyncCached = readFileSyncCached;
exports.writeFileSyncAndFlush_DEPRECATED = writeFileSyncAndFlush_DEPRECATED;
exports.getDesktopPath = getDesktopPath;
exports.isFileWithinReadSizeLimit = isFileWithinReadSizeLimit;
exports.normalizePathForComparison = normalizePathForComparison;
exports.pathsEqual = pathsEqual;
var fs_1 = require("fs");
var promises_1 = require("fs/promises");
var os_1 = require("os");
var path_1 = require("path");
var index_js_1 = require("src/services/analytics/index.js");
var growthbook_js_1 = require("../services/analytics/growthbook.js");
var cwd_js_1 = require("../utils/cwd.js");
var debug_js_1 = require("./debug.js");
var errors_js_1 = require("./errors.js");
var fileRead_js_1 = require("./fileRead.js");
var fileReadCache_js_1 = require("./fileReadCache.js");
var fsOperations_js_1 = require("./fsOperations.js");
var log_js_1 = require("./log.js");
var path_js_1 = require("./path.js");
var platform_js_1 = require("./platform.js");
/**
 * Check if a path exists asynchronously.
 */
function pathExists(path) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, promises_1.stat)(path)];
                case 1:
                    _b.sent();
                    return [2 /*return*/, true];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.MAX_OUTPUT_SIZE = 0.25 * 1024 * 1024; // 0.25MB in bytes
function readFileSafe(filepath) {
    try {
        var fs = (0, fsOperations_js_1.getFsImplementation)();
        return fs.readFileSync(filepath, { encoding: 'utf8' });
    }
    catch (error) {
        (0, log_js_1.logError)(error);
        return null;
    }
}
/**
 * Get the normalized modification time of a file in milliseconds.
 * Uses Math.floor to ensure consistent timestamp comparisons across file operations,
 * reducing false positives from sub-millisecond precision changes (e.g., from IDE
 * file watchers that touch files without changing content).
 */
function getFileModificationTime(filePath) {
    var fs = (0, fsOperations_js_1.getFsImplementation)();
    return Math.floor(fs.statSync(filePath).mtimeMs);
}
/**
 * Async variant of getFileModificationTime. Same floor semantics.
 * Use this in async paths (getChangedFiles runs every turn on every readFileState
 * entry — sync statSync there triggers the slow-operation indicator on network/
 * slow disks).
 */
function getFileModificationTimeAsync(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var s;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, fsOperations_js_1.getFsImplementation)().stat(filePath)];
                case 1:
                    s = _a.sent();
                    return [2 /*return*/, Math.floor(s.mtimeMs)];
            }
        });
    });
}
function writeTextContent(filePath, content, encoding, endings) {
    var toWrite = content;
    if (endings === 'CRLF') {
        // Normalize any existing CRLF to LF first so a new_string that already
        // contains \r\n (raw model output) doesn't become \r\r\n after the join.
        toWrite = content.replaceAll('\r\n', '\n').split('\n').join('\r\n');
    }
    writeFileSyncAndFlush_DEPRECATED(filePath, toWrite, { encoding: encoding });
}
function detectFileEncoding(filePath) {
    try {
        var fs = (0, fsOperations_js_1.getFsImplementation)();
        var resolvedPath = (0, fsOperations_js_1.safeResolvePath)(fs, filePath).resolvedPath;
        return (0, fileRead_js_1.detectEncodingForResolvedPath)(resolvedPath);
    }
    catch (error) {
        if ((0, errors_js_1.isFsInaccessible)(error)) {
            (0, debug_js_1.logForDebugging)("detectFileEncoding failed for expected reason: ".concat(error.code), {
                level: 'debug',
            });
        }
        else {
            (0, log_js_1.logError)(error);
        }
        return 'utf8';
    }
}
function detectLineEndings(filePath, encoding) {
    if (encoding === void 0) { encoding = 'utf8'; }
    try {
        var fs = (0, fsOperations_js_1.getFsImplementation)();
        var resolvedPath = (0, fsOperations_js_1.safeResolvePath)(fs, filePath).resolvedPath;
        var _a = fs.readSync(resolvedPath, { length: 4096 }), buffer = _a.buffer, bytesRead = _a.bytesRead;
        var content = buffer.toString(encoding, 0, bytesRead);
        return (0, fileRead_js_1.detectLineEndingsForString)(content);
    }
    catch (error) {
        (0, log_js_1.logError)(error);
        return 'LF';
    }
}
function convertLeadingTabsToSpaces(content) {
    // The /gm regex scans every line even on no-match; skip it entirely
    // for the common tab-free case.
    if (!content.includes('\t'))
        return content;
    return content.replace(/^\t+/gm, function (_) { return '  '.repeat(_.length); });
}
function getAbsoluteAndRelativePaths(path) {
    var absolutePath = path ? (0, path_js_1.expandPath)(path) : undefined;
    var relativePath = absolutePath
        ? (0, path_1.relative)((0, cwd_js_1.getCwd)(), absolutePath)
        : undefined;
    return { absolutePath: absolutePath, relativePath: relativePath };
}
function getDisplayPath(filePath) {
    // Use relative path if file is in the current working directory
    var relativePath = getAbsoluteAndRelativePaths(filePath).relativePath;
    if (relativePath && !relativePath.startsWith('..')) {
        return relativePath;
    }
    // Use tilde notation for files in home directory
    var homeDir = (0, os_1.homedir)();
    if (filePath.startsWith(homeDir + path_1.sep)) {
        return '~' + filePath.slice(homeDir.length);
    }
    // Otherwise return the absolute path
    return filePath;
}
/**
 * Find files with the same name but different extensions in the same directory
 * @param filePath The path to the file that doesn't exist
 * @returns The found file with a different extension, or undefined if none found
 */
function findSimilarFile(filePath) {
    var fs = (0, fsOperations_js_1.getFsImplementation)();
    try {
        var dir_1 = (0, path_1.dirname)(filePath);
        var fileBaseName_1 = (0, path_1.basename)(filePath, (0, path_1.extname)(filePath));
        // Get all files in the directory
        var files = fs.readdirSync(dir_1);
        // Find files with the same base name but different extension
        var similarFiles = files.filter(function (file) {
            return (0, path_1.basename)(file.name, (0, path_1.extname)(file.name)) === fileBaseName_1 &&
                (0, path_1.join)(dir_1, file.name) !== filePath;
        });
        // Return just the filename of the first match if found
        var firstMatch = similarFiles[0];
        if (firstMatch) {
            return firstMatch.name;
        }
        return undefined;
    }
    catch (error) {
        // Missing dir (ENOENT) is expected; for other errors log and return undefined
        if (!(0, errors_js_1.isENOENT)(error)) {
            (0, log_js_1.logError)(error);
        }
        return undefined;
    }
}
/**
 * Marker included in file-not-found error messages that contain a cwd note.
 * UI renderers check for this to show a short "File not found" message.
 */
exports.FILE_NOT_FOUND_CWD_NOTE = 'Note: your current working directory is';
/**
 * Suggests a corrected path under the current working directory when a file/directory
 * is not found. Detects the "dropped repo folder" pattern where the model constructs
 * an absolute path missing the repo directory component.
 *
 * Example:
 *   cwd = /Users/zeeg/src/currentRepo
 *   requestedPath = /Users/zeeg/src/foobar           (doesn't exist)
 *   returns        /Users/zeeg/src/currentRepo/foobar (if it exists)
 *
 * @param requestedPath - The absolute path that was not found
 * @returns The corrected path if found under cwd, undefined otherwise
 */
function suggestPathUnderCwd(requestedPath) {
    return __awaiter(this, void 0, void 0, function () {
        var cwd, cwdParent, resolvedPath, resolvedDir, _a, cwdParentPrefix, relFromParent, correctedPath, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    cwd = (0, cwd_js_1.getCwd)();
                    cwdParent = (0, path_1.dirname)(cwd);
                    resolvedPath = requestedPath;
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.realpath)((0, path_1.dirname)(requestedPath))];
                case 2:
                    resolvedDir = _c.sent();
                    resolvedPath = (0, path_1.join)(resolvedDir, (0, path_1.basename)(requestedPath));
                    return [3 /*break*/, 4];
                case 3:
                    _a = _c.sent();
                    return [3 /*break*/, 4];
                case 4:
                    cwdParentPrefix = cwdParent === path_1.sep ? path_1.sep : cwdParent + path_1.sep;
                    if (!resolvedPath.startsWith(cwdParentPrefix) ||
                        resolvedPath.startsWith(cwd + path_1.sep) ||
                        resolvedPath === cwd) {
                        return [2 /*return*/, undefined];
                    }
                    relFromParent = (0, path_1.relative)(cwdParent, resolvedPath);
                    correctedPath = (0, path_1.join)(cwd, relFromParent);
                    _c.label = 5;
                case 5:
                    _c.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, (0, promises_1.stat)(correctedPath)];
                case 6:
                    _c.sent();
                    return [2 /*return*/, correctedPath];
                case 7:
                    _b = _c.sent();
                    return [2 /*return*/, undefined];
                case 8: return [2 /*return*/];
            }
        });
    });
}
/**
 * Whether to use the compact line-number prefix format (`N\t` instead of
 * `     N→`). The padded-arrow format costs 9 bytes/line overhead; at
 * 1.35B Read calls × 132 lines avg this is 2.18% of fleet uncached input
 * (bq-queries/read_line_prefix_overhead_verify.sql).
 *
 * Ant soak validated no Edit error regression (6.29% vs 6.86% baseline).
 * Killswitch pattern: GB can disable if issues surface externally.
 */
function isCompactLinePrefixEnabled() {
    // 3P default: killswitch off = compact format enabled. Client-side only —
    // no server support needed, safe for Bedrock/Vertex/Foundry.
    return !(0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_compact_line_prefix_killswitch', false);
}
/**
 * Adds cat -n style line numbers to the content.
 */
function addLineNumbers(_a) {
    var content = _a.content, 
    // 1-indexed
    startLine = _a.startLine;
    if (!content) {
        return '';
    }
    var lines = content.split(/\r?\n/);
    if (isCompactLinePrefixEnabled()) {
        return lines
            .map(function (line, index) { return "".concat(index + startLine, "\t").concat(line); })
            .join('\n');
    }
    return lines
        .map(function (line, index) {
        var numStr = String(index + startLine);
        if (numStr.length >= 6) {
            return "".concat(numStr, "\u2192").concat(line);
        }
        return "".concat(numStr.padStart(6, ' '), "\u2192").concat(line);
    })
        .join('\n');
}
/**
 * Inverse of addLineNumbers — strips the `N→` or `N\t` prefix from a single
 * line. Co-located so format changes here and in addLineNumbers stay in sync.
 */
function stripLineNumberPrefix(line) {
    var _a;
    var match = line.match(/^\s*\d+[\u2192\t](.*)$/);
    return (_a = match === null || match === void 0 ? void 0 : match[1]) !== null && _a !== void 0 ? _a : line;
}
/**
 * Checks if a directory is empty.
 * @param dirPath The path to the directory to check
 * @returns true if the directory is empty or does not exist, false otherwise
 */
function isDirEmpty(dirPath) {
    try {
        return (0, fsOperations_js_1.getFsImplementation)().isDirEmptySync(dirPath);
    }
    catch (e) {
        // ENOENT: directory doesn't exist, consider it empty
        // Other errors (EPERM on macOS protected folders, etc.): assume not empty
        return (0, errors_js_1.isENOENT)(e);
    }
}
/**
 * Reads a file with caching to avoid redundant I/O operations.
 * This is the preferred method for FileEditTool operations.
 */
function readFileSyncCached(filePath) {
    var content = fileReadCache_js_1.fileReadCache.readFile(filePath).content;
    return content;
}
/**
 * Writes to a file and flushes the file to disk
 * @param filePath The path to the file to write to
 * @param content The content to write to the file
 * @param options Options for writing the file, including encoding and mode
 * @deprecated Use `fs.promises.writeFile` with flush option instead for non-blocking writes.
 * Sync file writes block the event loop and cause performance issues.
 */
function writeFileSyncAndFlush_DEPRECATED(filePath, content, options) {
    if (options === void 0) { options = { encoding: 'utf-8' }; }
    var fs = (0, fsOperations_js_1.getFsImplementation)();
    // Check if the target file is a symlink to preserve it for all users
    // Note: We don't use safeResolvePath here because we need to manually handle
    // symlinks to ensure we write to the target while preserving the symlink itself
    var targetPath = filePath;
    try {
        // Try to read the symlink - if successful, it's a symlink
        var linkTarget = fs.readlinkSync(filePath);
        // Resolve to absolute path
        targetPath = (0, path_1.isAbsolute)(linkTarget)
            ? linkTarget
            : (0, path_1.resolve)((0, path_1.dirname)(filePath), linkTarget);
        (0, debug_js_1.logForDebugging)("Writing through symlink: ".concat(filePath, " -> ").concat(targetPath));
    }
    catch (_a) {
        // ENOENT (doesn't exist) or EINVAL (not a symlink) — keep targetPath = filePath
    }
    // Try atomic write first
    var tempPath = "".concat(targetPath, ".tmp.").concat(process.pid, ".").concat(Date.now());
    // Check if target file exists and get its permissions (single stat, reused in both atomic and fallback paths)
    var targetMode;
    var targetExists = false;
    try {
        targetMode = fs.statSync(targetPath).mode;
        targetExists = true;
        (0, debug_js_1.logForDebugging)("Preserving file permissions: ".concat(targetMode.toString(8)));
    }
    catch (e) {
        if (!(0, errors_js_1.isENOENT)(e))
            throw e;
        if (options.mode !== undefined) {
            // Use provided mode for new files
            targetMode = options.mode;
            (0, debug_js_1.logForDebugging)("Setting permissions for new file: ".concat(targetMode.toString(8)));
        }
    }
    try {
        (0, debug_js_1.logForDebugging)("Writing to temp file: ".concat(tempPath));
        // Write to temp file with flush and mode (if specified for new file)
        var writeOptions = {
            encoding: options.encoding,
            flush: true,
        };
        // Only set mode in writeFileSync for new files to ensure atomic permission setting
        if (!targetExists && options.mode !== undefined) {
            writeOptions.mode = options.mode;
        }
        (0, fs_1.writeFileSync)(tempPath, content, writeOptions);
        (0, debug_js_1.logForDebugging)("Temp file written successfully, size: ".concat(content.length, " bytes"));
        // For existing files or if mode was not set atomically, apply permissions
        if (targetExists && targetMode !== undefined) {
            (0, fs_1.chmodSync)(tempPath, targetMode);
            (0, debug_js_1.logForDebugging)("Applied original permissions to temp file");
        }
        // Atomic rename (on POSIX systems, this is atomic)
        // On Windows, this will overwrite the destination if it exists
        (0, debug_js_1.logForDebugging)("Renaming ".concat(tempPath, " to ").concat(targetPath));
        fs.renameSync(tempPath, targetPath);
        (0, debug_js_1.logForDebugging)("File ".concat(targetPath, " written atomically"));
    }
    catch (atomicError) {
        (0, debug_js_1.logForDebugging)("Failed to write file atomically: ".concat(atomicError), {
            level: 'error',
        });
        (0, index_js_1.logEvent)('tengu_atomic_write_error', {});
        // Clean up temp file on error
        try {
            (0, debug_js_1.logForDebugging)("Cleaning up temp file: ".concat(tempPath));
            fs.unlinkSync(tempPath);
        }
        catch (cleanupError) {
            (0, debug_js_1.logForDebugging)("Failed to clean up temp file: ".concat(cleanupError));
        }
        // Fallback to non-atomic write
        (0, debug_js_1.logForDebugging)("Falling back to non-atomic write for ".concat(targetPath));
        try {
            var fallbackOptions = {
                encoding: options.encoding,
                flush: true,
            };
            // Only set mode for new files
            if (!targetExists && options.mode !== undefined) {
                fallbackOptions.mode = options.mode;
            }
            (0, fs_1.writeFileSync)(targetPath, content, fallbackOptions);
            (0, debug_js_1.logForDebugging)("File ".concat(targetPath, " written successfully with non-atomic fallback"));
        }
        catch (fallbackError) {
            (0, debug_js_1.logForDebugging)("Non-atomic write also failed: ".concat(fallbackError));
            throw fallbackError;
        }
    }
}
function getDesktopPath() {
    var platform = (0, platform_js_1.getPlatform)();
    var homeDir = (0, os_1.homedir)();
    if (platform === 'macos') {
        return (0, path_1.join)(homeDir, 'Desktop');
    }
    if (platform === 'windows') {
        // For WSL, try to access Windows desktop
        var windowsHome = process.env.USERPROFILE
            ? process.env.USERPROFILE.replace(/\\/g, '/')
            : null;
        if (windowsHome) {
            var wslPath = windowsHome.replace(/^[A-Z]:/, '');
            var desktopPath_1 = "/mnt/c".concat(wslPath, "/Desktop");
            if ((0, fsOperations_js_1.getFsImplementation)().existsSync(desktopPath_1)) {
                return desktopPath_1;
            }
        }
        // Fallback: try to find desktop in typical Windows user location
        try {
            var usersDir = '/mnt/c/Users';
            var userDirs = (0, fsOperations_js_1.getFsImplementation)().readdirSync(usersDir);
            for (var _i = 0, userDirs_1 = userDirs; _i < userDirs_1.length; _i++) {
                var user = userDirs_1[_i];
                if (user.name === 'Public' ||
                    user.name === 'Default' ||
                    user.name === 'Default User' ||
                    user.name === 'All Users') {
                    continue;
                }
                var potentialDesktopPath = (0, path_1.join)(usersDir, user.name, 'Desktop');
                if ((0, fsOperations_js_1.getFsImplementation)().existsSync(potentialDesktopPath)) {
                    return potentialDesktopPath;
                }
            }
        }
        catch (error) {
            (0, log_js_1.logError)(error);
        }
    }
    // Linux/unknown platform fallback
    var desktopPath = (0, path_1.join)(homeDir, 'Desktop');
    if ((0, fsOperations_js_1.getFsImplementation)().existsSync(desktopPath)) {
        return desktopPath;
    }
    // If Desktop folder doesn't exist, fallback to home directory
    return homeDir;
}
/**
 * Validates that a file size is within the specified limit.
 * Returns true if the file is within the limit, false otherwise.
 *
 * @param filePath The path to the file to validate
 * @param maxSizeBytes The maximum allowed file size in bytes
 * @returns true if file size is within limit, false otherwise
 */
function isFileWithinReadSizeLimit(filePath, maxSizeBytes) {
    if (maxSizeBytes === void 0) { maxSizeBytes = exports.MAX_OUTPUT_SIZE; }
    try {
        var stats = (0, fsOperations_js_1.getFsImplementation)().statSync(filePath);
        return stats.size <= maxSizeBytes;
    }
    catch (_a) {
        // If we can't stat the file, return false to indicate validation failure
        return false;
    }
}
/**
 * Normalize a file path for comparison, handling platform differences.
 * On Windows, normalizes path separators and converts to lowercase for
 * case-insensitive comparison.
 */
function normalizePathForComparison(filePath) {
    // Use path.normalize() to clean up redundant separators and resolve . and ..
    var normalized = (0, path_1.normalize)(filePath);
    // On Windows, normalize for case-insensitive comparison:
    // - Convert forward slashes to backslashes (path.normalize only does this on actual Windows)
    // - Convert to lowercase (Windows paths are case-insensitive)
    if ((0, platform_js_1.getPlatform)() === 'windows') {
        normalized = normalized.replace(/\//g, '\\').toLowerCase();
    }
    return normalized;
}
/**
 * Compare two file paths for equality, handling Windows case-insensitivity.
 */
function pathsEqual(path1, path2) {
    return normalizePathForComparison(path1) === normalizePathForComparison(path2);
}
