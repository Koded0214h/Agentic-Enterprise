"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.PathTraversalError = void 0;
exports.isTeamMemoryEnabled = isTeamMemoryEnabled;
exports.getTeamMemPath = getTeamMemPath;
exports.getTeamMemEntrypoint = getTeamMemEntrypoint;
exports.isTeamMemPath = isTeamMemPath;
exports.validateTeamMemWritePath = validateTeamMemWritePath;
exports.validateTeamMemKey = validateTeamMemKey;
exports.isTeamMemFile = isTeamMemFile;
var promises_1 = require("fs/promises");
var path_1 = require("path");
var growthbook_js_1 = require("../services/analytics/growthbook.js");
var errors_js_1 = require("../utils/errors.js");
var paths_js_1 = require("./paths.js");
/**
 * Error thrown when a path validation detects a traversal or injection attempt.
 */
var PathTraversalError = /** @class */ (function (_super) {
    __extends(PathTraversalError, _super);
    function PathTraversalError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = 'PathTraversalError';
        return _this;
    }
    return PathTraversalError;
}(Error));
exports.PathTraversalError = PathTraversalError;
/**
 * Sanitize a file path key by rejecting dangerous patterns.
 * Checks for null bytes, URL-encoded traversals, and other injection vectors.
 * Returns the sanitized string or throws PathTraversalError.
 */
function sanitizePathKey(key) {
    // Null bytes can truncate paths in C-based syscalls
    if (key.includes('\0')) {
        throw new PathTraversalError("Null byte in path key: \"".concat(key, "\""));
    }
    // URL-encoded traversals (e.g. %2e%2e%2f = ../)
    var decoded;
    try {
        decoded = decodeURIComponent(key);
    }
    catch (_a) {
        // Malformed percent-encoding (e.g. %ZZ, lone %) — not valid URL-encoding,
        // so no URL-encoded traversal is possible
        decoded = key;
    }
    if (decoded !== key && (decoded.includes('..') || decoded.includes('/'))) {
        throw new PathTraversalError("URL-encoded traversal in path key: \"".concat(key, "\""));
    }
    // Unicode normalization attacks: fullwidth ．．／ (U+FF0E U+FF0F) normalize
    // to ASCII ../ under NFKC. While path.resolve/fs.writeFile treat these as
    // literal bytes (not separators), downstream layers or filesystems may
    // normalize — reject for defense-in-depth (PSR M22187 vector 4).
    var normalized = key.normalize('NFKC');
    if (normalized !== key &&
        (normalized.includes('..') ||
            normalized.includes('/') ||
            normalized.includes('\\') ||
            normalized.includes('\0'))) {
        throw new PathTraversalError("Unicode-normalized traversal in path key: \"".concat(key, "\""));
    }
    // Reject backslashes (Windows path separator used as traversal vector)
    if (key.includes('\\')) {
        throw new PathTraversalError("Backslash in path key: \"".concat(key, "\""));
    }
    // Reject absolute paths
    if (key.startsWith('/')) {
        throw new PathTraversalError("Absolute path key: \"".concat(key, "\""));
    }
    return key;
}
/**
 * Whether team memory features are enabled.
 * Team memory is a subdirectory of auto memory, so it requires auto memory
 * to be enabled. This keeps all team-memory consumers (prompt, content
 * injection, sync watcher, file detection) consistent when auto memory is
 * disabled via env var or settings.
 */
function isTeamMemoryEnabled() {
    if (!(0, paths_js_1.isAutoMemoryEnabled)()) {
        return false;
    }
    return (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_herring_clock', false);
}
/**
 * Returns the team memory path: <memoryBase>/projects/<sanitized-project-root>/memory/team/
 * Lives as a subdirectory of the auto-memory directory, scoped per-project.
 */
function getTeamMemPath() {
    return ((0, path_1.join)((0, paths_js_1.getAutoMemPath)(), 'team') + path_1.sep).normalize('NFC');
}
/**
 * Returns the team memory entrypoint: <memoryBase>/projects/<sanitized-project-root>/memory/team/MEMORY.md
 * Lives as a subdirectory of the auto-memory directory, scoped per-project.
 */
function getTeamMemEntrypoint() {
    return (0, path_1.join)((0, paths_js_1.getAutoMemPath)(), 'team', 'MEMORY.md');
}
/**
 * Resolve symlinks for the deepest existing ancestor of a path.
 * The target file may not exist yet (we may be about to create it), so we
 * walk up the directory tree until realpath() succeeds, then rejoin the
 * non-existing tail onto the resolved ancestor.
 *
 * SECURITY (PSR M22186): path.resolve() does NOT resolve symlinks. An attacker
 * who can place a symlink inside teamDir pointing outside (e.g. to
 * ~/.ssh/authorized_keys) would pass a resolve()-based containment check.
 * Using realpath() on the deepest existing ancestor ensures we compare the
 * actual filesystem location, not the symbolic path.
 *
 */
function realpathDeepestExisting(absolutePath) {
    return __awaiter(this, void 0, void 0, function () {
        var tail, current, parent_1, realCurrent, e_1, code, st, lstatErr_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    tail = [];
                    current = absolutePath;
                    parent_1 = (0, path_1.dirname)(current);
                    _a.label = 1;
                case 1:
                    if (!(current !== parent_1)) return [3 /*break*/, 12];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 11]);
                    return [4 /*yield*/, (0, promises_1.realpath)(current)
                        // Rejoin the non-existing tail in reverse order (deepest popped first)
                    ];
                case 3:
                    realCurrent = _a.sent();
                    // Rejoin the non-existing tail in reverse order (deepest popped first)
                    return [2 /*return*/, tail.length === 0
                            ? realCurrent
                            : path_1.join.apply(void 0, __spreadArray([realCurrent], tail.reverse(), false))];
                case 4:
                    e_1 = _a.sent();
                    code = (0, errors_js_1.getErrnoCode)(e_1);
                    if (!(code === 'ENOENT')) return [3 /*break*/, 9];
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, (0, promises_1.lstat)(current)];
                case 6:
                    st = _a.sent();
                    if (st.isSymbolicLink()) {
                        throw new PathTraversalError("Dangling symlink detected (target does not exist): \"".concat(current, "\""));
                    }
                    return [3 /*break*/, 8];
                case 7:
                    lstatErr_1 = _a.sent();
                    if (lstatErr_1 instanceof PathTraversalError) {
                        throw lstatErr_1;
                    }
                    return [3 /*break*/, 8];
                case 8: return [3 /*break*/, 10];
                case 9:
                    if (code === 'ELOOP') {
                        // Symlink loop — corrupted or malicious filesystem state.
                        throw new PathTraversalError("Symlink loop detected in path: \"".concat(current, "\""));
                    }
                    else if (code !== 'ENOTDIR' && code !== 'ENAMETOOLONG') {
                        // EACCES, EIO, etc. — cannot verify containment. Fail closed by wrapping
                        // as PathTraversalError so the caller can skip this entry gracefully
                        // instead of aborting the entire batch.
                        throw new PathTraversalError("Cannot verify path containment (".concat(code, "): \"").concat(current, "\""));
                    }
                    _a.label = 10;
                case 10:
                    tail.push(current.slice(parent_1.length + path_1.sep.length));
                    current = parent_1;
                    return [3 /*break*/, 11];
                case 11:
                    parent_1 = (0, path_1.dirname)(current);
                    return [3 /*break*/, 1];
                case 12: 
                // Reached filesystem root without finding an existing ancestor (rare —
                // root normally exists). Fall back to the input; containment check will reject.
                return [2 /*return*/, absolutePath];
            }
        });
    });
}
/**
 * Check whether a real (symlink-resolved) path is within the real team
 * memory directory. Both sides are realpath'd so the comparison is between
 * canonical filesystem locations.
 *
 * If teamDir does not exist, returns true (skips the check). This is safe:
 * a symlink escape requires a pre-existing symlink inside teamDir, which
 * requires teamDir to exist. If there's no directory, there's no symlink,
 * and the first-pass string-level containment check is sufficient.
 */
function isRealPathWithinTeamDir(realCandidate) {
    return __awaiter(this, void 0, void 0, function () {
        var realTeamDir, e_2, code;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, promises_1.realpath)(getTeamMemPath().replace(/[/\\]+$/, ''))];
                case 1:
                    // getTeamMemPath() includes a trailing separator; strip it because
                    // realpath() rejects trailing separators on some platforms.
                    realTeamDir = _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    e_2 = _a.sent();
                    code = (0, errors_js_1.getErrnoCode)(e_2);
                    if (code === 'ENOENT' || code === 'ENOTDIR') {
                        // Team dir doesn't exist — symlink escape impossible, skip check.
                        return [2 /*return*/, true];
                    }
                    // Unexpected error (EACCES, EIO) — fail closed.
                    return [2 /*return*/, false];
                case 3:
                    if (realCandidate === realTeamDir) {
                        return [2 /*return*/, true];
                    }
                    // Prefix-attack protection: require separator after the prefix so that
                    // "/foo/team-evil" doesn't match "/foo/team".
                    return [2 /*return*/, realCandidate.startsWith(realTeamDir + path_1.sep)];
            }
        });
    });
}
/**
 * Check if a resolved absolute path is within the team memory directory.
 * Uses path.resolve() to convert relative paths and eliminate traversal segments.
 * Does NOT resolve symlinks — for write validation use validateTeamMemWritePath()
 * or validateTeamMemKey() which include symlink resolution.
 */
function isTeamMemPath(filePath) {
    // SECURITY: resolve() converts to absolute and eliminates .. segments,
    // preventing path traversal attacks (e.g. "team/../../etc/passwd")
    var resolvedPath = (0, path_1.resolve)(filePath);
    var teamDir = getTeamMemPath();
    return resolvedPath.startsWith(teamDir);
}
/**
 * Validate that an absolute file path is safe for writing to the team memory directory.
 * Returns the resolved absolute path if valid.
 * Throws PathTraversalError if the path contains injection vectors, escapes the
 * directory via .. segments, or escapes via a symlink (PSR M22186).
 */
function validateTeamMemWritePath(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var resolvedPath, teamDir, realPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (filePath.includes('\0')) {
                        throw new PathTraversalError("Null byte in path: \"".concat(filePath, "\""));
                    }
                    resolvedPath = (0, path_1.resolve)(filePath);
                    teamDir = getTeamMemPath();
                    // Prefix attack protection: teamDir already ends with sep (from getTeamMemPath),
                    // so "team-evil/" won't match "team/"
                    if (!resolvedPath.startsWith(teamDir)) {
                        throw new PathTraversalError("Path escapes team memory directory: \"".concat(filePath, "\""));
                    }
                    return [4 /*yield*/, realpathDeepestExisting(resolvedPath)];
                case 1:
                    realPath = _a.sent();
                    return [4 /*yield*/, isRealPathWithinTeamDir(realPath)];
                case 2:
                    if (!(_a.sent())) {
                        throw new PathTraversalError("Path escapes team memory directory via symlink: \"".concat(filePath, "\""));
                    }
                    return [2 /*return*/, resolvedPath];
            }
        });
    });
}
/**
 * Validate a relative path key from the server against the team memory directory.
 * Sanitizes the key, joins with the team dir, resolves symlinks on the deepest
 * existing ancestor, and verifies containment against the real team dir.
 * Returns the resolved absolute path.
 * Throws PathTraversalError if the key is malicious (PSR M22186).
 */
function validateTeamMemKey(relativeKey) {
    return __awaiter(this, void 0, void 0, function () {
        var teamDir, fullPath, resolvedPath, realPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    sanitizePathKey(relativeKey);
                    teamDir = getTeamMemPath();
                    fullPath = (0, path_1.join)(teamDir, relativeKey);
                    resolvedPath = (0, path_1.resolve)(fullPath);
                    if (!resolvedPath.startsWith(teamDir)) {
                        throw new PathTraversalError("Key escapes team memory directory: \"".concat(relativeKey, "\""));
                    }
                    return [4 /*yield*/, realpathDeepestExisting(resolvedPath)];
                case 1:
                    realPath = _a.sent();
                    return [4 /*yield*/, isRealPathWithinTeamDir(realPath)];
                case 2:
                    if (!(_a.sent())) {
                        throw new PathTraversalError("Key escapes team memory directory via symlink: \"".concat(relativeKey, "\""));
                    }
                    return [2 /*return*/, resolvedPath];
            }
        });
    });
}
/**
 * Check if a file path is within the team memory directory
 * and team memory is enabled.
 */
function isTeamMemFile(filePath) {
    return isTeamMemoryEnabled() && isTeamMemPath(filePath);
}
