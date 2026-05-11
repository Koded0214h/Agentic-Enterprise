"use strict";
/**
 * Plugin Zip Cache Module
 *
 * Manages plugins as ZIP archives in a mounted directory (e.g., Filestore).
 * When CLAUDE_CODE_PLUGIN_USE_ZIP_CACHE is enabled and CLAUDE_CODE_PLUGIN_CACHE_DIR
 * is set, plugins are stored as ZIPs in that directory and extracted to a
 * session-local temp directory at startup.
 *
 * Limitations:
 * - Only headless mode is supported
 * - All settings sources are used (same as normal plugin flow)
 * - Only github, git, and url marketplace sources are supported
 * - Only strict:true marketplace entries are supported
 * - Auto-update is non-blocking (background, does not affect current session)
 *
 * Directory structure of the zip cache:
 * /mnt/plugins-cache/
 *   ├── known_marketplaces.json
 *   ├── installed_plugins.json
 *   ├── marketplaces/
 *   │   ├── official-marketplace.json
 *   │   └── company-marketplace.json
 *   └── plugins/
 *       ├── official-marketplace/
 *       │   └── plugin-a/
 *       │       └── 1.0.0.zip
 *       └── company-marketplace/
 *           └── plugin-b/
 *               └── 2.1.3.zip
 */
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
exports.isPluginZipCacheEnabled = isPluginZipCacheEnabled;
exports.getPluginZipCachePath = getPluginZipCachePath;
exports.getZipCacheKnownMarketplacesPath = getZipCacheKnownMarketplacesPath;
exports.getZipCacheInstalledPluginsPath = getZipCacheInstalledPluginsPath;
exports.getZipCacheMarketplacesDir = getZipCacheMarketplacesDir;
exports.getZipCachePluginsDir = getZipCachePluginsDir;
exports.getSessionPluginCachePath = getSessionPluginCachePath;
exports.cleanupSessionPluginCache = cleanupSessionPluginCache;
exports.resetSessionPluginCache = resetSessionPluginCache;
exports.atomicWriteToZipCache = atomicWriteToZipCache;
exports.createZipFromDirectory = createZipFromDirectory;
exports.extractZipToDirectory = extractZipToDirectory;
exports.convertDirectoryToZipInPlace = convertDirectoryToZipInPlace;
exports.getMarketplaceJsonRelativePath = getMarketplaceJsonRelativePath;
exports.isMarketplaceSourceSupportedByZipCache = isMarketplaceSourceSupportedByZipCache;
var crypto_1 = require("crypto");
var promises_1 = require("fs/promises");
var os_1 = require("os");
var path_1 = require("path");
var debug_js_1 = require("../debug.js");
var zip_js_1 = require("../dxt/zip.js");
var envUtils_js_1 = require("../envUtils.js");
var fsOperations_js_1 = require("../fsOperations.js");
var pathValidation_js_1 = require("../permissions/pathValidation.js");
/**
 * Check if the plugin zip cache mode is enabled.
 */
function isPluginZipCacheEnabled() {
    return (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_PLUGIN_USE_ZIP_CACHE);
}
/**
 * Get the path to the zip cache directory.
 * Requires CLAUDE_CODE_PLUGIN_CACHE_DIR to be set.
 * Returns undefined if zip cache is not enabled.
 */
function getPluginZipCachePath() {
    if (!isPluginZipCacheEnabled()) {
        return undefined;
    }
    var dir = process.env.CLAUDE_CODE_PLUGIN_CACHE_DIR;
    return dir ? (0, pathValidation_js_1.expandTilde)(dir) : undefined;
}
/**
 * Get the path to known_marketplaces.json in the zip cache.
 */
function getZipCacheKnownMarketplacesPath() {
    var cachePath = getPluginZipCachePath();
    if (!cachePath) {
        throw new Error('Plugin zip cache is not enabled');
    }
    return (0, path_1.join)(cachePath, 'known_marketplaces.json');
}
/**
 * Get the path to installed_plugins.json in the zip cache.
 */
function getZipCacheInstalledPluginsPath() {
    var cachePath = getPluginZipCachePath();
    if (!cachePath) {
        throw new Error('Plugin zip cache is not enabled');
    }
    return (0, path_1.join)(cachePath, 'installed_plugins.json');
}
/**
 * Get the marketplaces directory within the zip cache.
 */
function getZipCacheMarketplacesDir() {
    var cachePath = getPluginZipCachePath();
    if (!cachePath) {
        throw new Error('Plugin zip cache is not enabled');
    }
    return (0, path_1.join)(cachePath, 'marketplaces');
}
/**
 * Get the plugins directory within the zip cache.
 */
function getZipCachePluginsDir() {
    var cachePath = getPluginZipCachePath();
    if (!cachePath) {
        throw new Error('Plugin zip cache is not enabled');
    }
    return (0, path_1.join)(cachePath, 'plugins');
}
// Session plugin cache: a temp directory on local disk (NOT in the mounted zip cache)
// that holds extracted plugins for the duration of the session.
var sessionPluginCachePath = null;
var sessionPluginCachePromise = null;
/**
 * Get or create the session plugin cache directory.
 * This is a temp directory on local disk where plugins are extracted for the session.
 */
function getSessionPluginCachePath() {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            if (sessionPluginCachePath) {
                return [2 /*return*/, sessionPluginCachePath];
            }
            if (!sessionPluginCachePromise) {
                sessionPluginCachePromise = (function () { return __awaiter(_this, void 0, void 0, function () {
                    var suffix, dir;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                suffix = (0, crypto_1.randomBytes)(8).toString('hex');
                                dir = (0, path_1.join)((0, os_1.tmpdir)(), "claude-plugin-session-".concat(suffix));
                                return [4 /*yield*/, (0, fsOperations_js_1.getFsImplementation)().mkdir(dir)];
                            case 1:
                                _a.sent();
                                sessionPluginCachePath = dir;
                                (0, debug_js_1.logForDebugging)("Created session plugin cache at ".concat(dir));
                                return [2 /*return*/, dir];
                        }
                    });
                }); })();
            }
            return [2 /*return*/, sessionPluginCachePromise];
        });
    });
}
/**
 * Clean up the session plugin cache directory.
 * Should be called when the session ends.
 */
function cleanupSessionPluginCache() {
    return __awaiter(this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!sessionPluginCachePath) {
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, (0, promises_1.rm)(sessionPluginCachePath, { recursive: true, force: true })];
                case 2:
                    _a.sent();
                    (0, debug_js_1.logForDebugging)("Cleaned up session plugin cache at ".concat(sessionPluginCachePath));
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    (0, debug_js_1.logForDebugging)("Failed to clean up session plugin cache: ".concat(error_1));
                    return [3 /*break*/, 5];
                case 4:
                    sessionPluginCachePath = null;
                    sessionPluginCachePromise = null;
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Reset the session plugin cache path (for testing).
 */
function resetSessionPluginCache() {
    sessionPluginCachePath = null;
    sessionPluginCachePromise = null;
}
/**
 * Write data to a file in the zip cache atomically.
 * Writes to a temp file in the same directory, then renames.
 */
function atomicWriteToZipCache(targetPath, data) {
    return __awaiter(this, void 0, void 0, function () {
        var dir, tmpName, tmpPath, error_2, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    dir = (0, path_1.dirname)(targetPath);
                    return [4 /*yield*/, (0, fsOperations_js_1.getFsImplementation)().mkdir(dir)];
                case 1:
                    _b.sent();
                    tmpName = ".".concat((0, path_1.basename)(targetPath), ".tmp.").concat((0, crypto_1.randomBytes)(4).toString('hex'));
                    tmpPath = (0, path_1.join)(dir, tmpName);
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 8, , 13]);
                    if (!(typeof data === 'string')) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, promises_1.writeFile)(tmpPath, data, { encoding: 'utf-8' })];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, (0, promises_1.writeFile)(tmpPath, data)];
                case 5:
                    _b.sent();
                    _b.label = 6;
                case 6: return [4 /*yield*/, (0, promises_1.rename)(tmpPath, targetPath)];
                case 7:
                    _b.sent();
                    return [3 /*break*/, 13];
                case 8:
                    error_2 = _b.sent();
                    _b.label = 9;
                case 9:
                    _b.trys.push([9, 11, , 12]);
                    return [4 /*yield*/, (0, promises_1.rm)(tmpPath, { force: true })];
                case 10:
                    _b.sent();
                    return [3 /*break*/, 12];
                case 11:
                    _a = _b.sent();
                    return [3 /*break*/, 12];
                case 12: throw error_2;
                case 13: return [2 /*return*/];
            }
        });
    });
}
/**
 * Create a ZIP archive from a directory.
 * Resolves symlinks to actual file contents (replaces symlinks with real data).
 * Stores Unix mode bits in external_attr so extractZipToDirectory can restore
 * +x — otherwise the round-trip (git clone → zip → extract) loses exec bits.
 *
 * @param sourceDir - Directory to zip
 * @returns ZIP file as Uint8Array
 */
function createZipFromDirectory(sourceDir) {
    return __awaiter(this, void 0, void 0, function () {
        var files, visited, zipSync, zipData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    files = {};
                    visited = new Set();
                    return [4 /*yield*/, collectFilesForZip(sourceDir, '', files, visited)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('fflate'); })];
                case 2:
                    zipSync = (_a.sent()).zipSync;
                    zipData = zipSync(files, { level: 6 });
                    (0, debug_js_1.logForDebugging)("Created ZIP from ".concat(sourceDir, ": ").concat(Object.keys(files).length, " files, ").concat(zipData.length, " bytes"));
                    return [2 /*return*/, zipData];
            }
        });
    });
}
/**
 * Recursively collect files from a directory for zipping.
 * Uses lstat to detect symlinks and tracks visited inodes for cycle detection.
 */
function collectFilesForZip(baseDir, relativePath, files, visited) {
    return __awaiter(this, void 0, void 0, function () {
        var currentDir, entries, _a, dirStat, key, _b, _i, entries_1, entry, fullPath, relPath, fileStat, _c, targetStat, _d, content, error_3;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    currentDir = relativePath ? (0, path_1.join)(baseDir, relativePath) : baseDir;
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readdir)(currentDir)];
                case 2:
                    entries = _e.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = _e.sent();
                    return [2 /*return*/];
                case 4:
                    _e.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, (0, promises_1.stat)(currentDir, { bigint: true })
                        // ReFS (Dev Drive), NFS, some FUSE mounts report dev=0 and ino=0 for
                        // everything. Fail open: skip cycle detection rather than skip the
                        // directory. We already skip symlinked directories unconditionally below,
                        // so the only cycle left here is a bind mount, which we accept.
                    ];
                case 5:
                    dirStat = _e.sent();
                    // ReFS (Dev Drive), NFS, some FUSE mounts report dev=0 and ino=0 for
                    // everything. Fail open: skip cycle detection rather than skip the
                    // directory. We already skip symlinked directories unconditionally below,
                    // so the only cycle left here is a bind mount, which we accept.
                    if (dirStat.dev !== 0n || dirStat.ino !== 0n) {
                        key = "".concat(dirStat.dev, ":").concat(dirStat.ino);
                        if (visited.has(key)) {
                            (0, debug_js_1.logForDebugging)("Skipping symlink cycle at ".concat(currentDir));
                            return [2 /*return*/];
                        }
                        visited.add(key);
                    }
                    return [3 /*break*/, 7];
                case 6:
                    _b = _e.sent();
                    return [2 /*return*/];
                case 7:
                    _i = 0, entries_1 = entries;
                    _e.label = 8;
                case 8:
                    if (!(_i < entries_1.length)) return [3 /*break*/, 23];
                    entry = entries_1[_i];
                    // Skip hidden files that are git-related
                    if (entry === '.git') {
                        return [3 /*break*/, 22];
                    }
                    fullPath = (0, path_1.join)(currentDir, entry);
                    relPath = relativePath ? "".concat(relativePath, "/").concat(entry) : entry;
                    fileStat = void 0;
                    _e.label = 9;
                case 9:
                    _e.trys.push([9, 11, , 12]);
                    return [4 /*yield*/, (0, promises_1.lstat)(fullPath)];
                case 10:
                    fileStat = _e.sent();
                    return [3 /*break*/, 12];
                case 11:
                    _c = _e.sent();
                    return [3 /*break*/, 22];
                case 12:
                    if (!fileStat.isSymbolicLink()) return [3 /*break*/, 16];
                    _e.label = 13;
                case 13:
                    _e.trys.push([13, 15, , 16]);
                    return [4 /*yield*/, (0, promises_1.stat)(fullPath)];
                case 14:
                    targetStat = _e.sent();
                    if (targetStat.isDirectory()) {
                        return [3 /*break*/, 22];
                    }
                    // Symlinked file — read its contents below
                    fileStat = targetStat;
                    return [3 /*break*/, 16];
                case 15:
                    _d = _e.sent();
                    return [3 /*break*/, 22]; // broken symlink
                case 16:
                    if (!fileStat.isDirectory()) return [3 /*break*/, 18];
                    return [4 /*yield*/, collectFilesForZip(baseDir, relPath, files, visited)];
                case 17:
                    _e.sent();
                    return [3 /*break*/, 22];
                case 18:
                    if (!fileStat.isFile()) return [3 /*break*/, 22];
                    _e.label = 19;
                case 19:
                    _e.trys.push([19, 21, , 22]);
                    return [4 /*yield*/, (0, promises_1.readFile)(fullPath)
                        // os=3 (Unix) + st_mode in high 16 bits of external_attr — this is
                        // what parseZipModes reads back on extraction. fileStat is already
                        // in hand from the lstat/stat above, so no extra syscall.
                    ];
                case 20:
                    content = _e.sent();
                    // os=3 (Unix) + st_mode in high 16 bits of external_attr — this is
                    // what parseZipModes reads back on extraction. fileStat is already
                    // in hand from the lstat/stat above, so no extra syscall.
                    files[relPath] = [
                        new Uint8Array(content),
                        { os: 3, attrs: (fileStat.mode & 0xffff) << 16 },
                    ];
                    return [3 /*break*/, 22];
                case 21:
                    error_3 = _e.sent();
                    (0, debug_js_1.logForDebugging)("Failed to read file for zip: ".concat(relPath, ": ").concat(error_3));
                    return [3 /*break*/, 22];
                case 22:
                    _i++;
                    return [3 /*break*/, 8];
                case 23: return [2 /*return*/];
            }
        });
    });
}
/**
 * Extract a ZIP file to a target directory.
 *
 * @param zipPath - Path to the ZIP file
 * @param targetDir - Directory to extract into
 */
function extractZipToDirectory(zipPath, targetDir) {
    return __awaiter(this, void 0, void 0, function () {
        var zipBuf, files, modes, _i, _a, _b, relPath, data, fullPath, mode;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, (0, fsOperations_js_1.getFsImplementation)().readFileBytes(zipPath)];
                case 1:
                    zipBuf = _c.sent();
                    return [4 /*yield*/, (0, zip_js_1.unzipFile)(zipBuf)
                        // fflate doesn't surface external_attr — parse the central directory so
                        // exec bits survive extraction (hooks/scripts need +x to run via `sh -c`).
                    ];
                case 2:
                    files = _c.sent();
                    modes = (0, zip_js_1.parseZipModes)(zipBuf);
                    return [4 /*yield*/, (0, fsOperations_js_1.getFsImplementation)().mkdir(targetDir)];
                case 3:
                    _c.sent();
                    _i = 0, _a = Object.entries(files);
                    _c.label = 4;
                case 4:
                    if (!(_i < _a.length)) return [3 /*break*/, 11];
                    _b = _a[_i], relPath = _b[0], data = _b[1];
                    if (!relPath.endsWith('/')) return [3 /*break*/, 6];
                    return [4 /*yield*/, (0, fsOperations_js_1.getFsImplementation)().mkdir((0, path_1.join)(targetDir, relPath))];
                case 5:
                    _c.sent();
                    return [3 /*break*/, 10];
                case 6:
                    fullPath = (0, path_1.join)(targetDir, relPath);
                    return [4 /*yield*/, (0, fsOperations_js_1.getFsImplementation)().mkdir((0, path_1.dirname)(fullPath))];
                case 7:
                    _c.sent();
                    return [4 /*yield*/, (0, promises_1.writeFile)(fullPath, data)];
                case 8:
                    _c.sent();
                    mode = modes[relPath];
                    if (!(mode && mode & 73)) return [3 /*break*/, 10];
                    // Swallow EPERM/ENOTSUP (NFS root_squash, some FUSE mounts) — losing +x
                    // is the pre-PR behavior and better than aborting mid-extraction.
                    return [4 /*yield*/, (0, promises_1.chmod)(fullPath, mode & 511).catch(function () { })];
                case 9:
                    // Swallow EPERM/ENOTSUP (NFS root_squash, some FUSE mounts) — losing +x
                    // is the pre-PR behavior and better than aborting mid-extraction.
                    _c.sent();
                    _c.label = 10;
                case 10:
                    _i++;
                    return [3 /*break*/, 4];
                case 11:
                    (0, debug_js_1.logForDebugging)("Extracted ZIP to ".concat(targetDir, ": ").concat(Object.keys(files).length, " entries"));
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Convert a plugin directory to a ZIP in-place: zip → atomic write → delete dir.
 * Both call sites (cacheAndRegisterPlugin, copyPluginToVersionedCache) need the
 * same sequence; getting it wrong (non-atomic write, forgetting rm) corrupts cache.
 */
function convertDirectoryToZipInPlace(dirPath, zipPath) {
    return __awaiter(this, void 0, void 0, function () {
        var zipData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, createZipFromDirectory(dirPath)];
                case 1:
                    zipData = _a.sent();
                    return [4 /*yield*/, atomicWriteToZipCache(zipPath, zipData)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, promises_1.rm)(dirPath, { recursive: true, force: true })];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Get the relative path for a marketplace JSON file within the zip cache.
 * Format: marketplaces/{marketplace-name}.json
 */
function getMarketplaceJsonRelativePath(marketplaceName) {
    var sanitized = marketplaceName.replace(/[^a-zA-Z0-9\-_]/g, '-');
    return (0, path_1.join)('marketplaces', "".concat(sanitized, ".json"));
}
/**
 * Check if a marketplace source type is supported by zip cache mode.
 *
 * Supported sources write to `join(cacheDir, name)` — syncMarketplacesToZipCache
 * reads marketplace.json from that installLocation, source-type-agnostic.
 * - github/git/url: clone to temp, rename into cacheDir
 * - settings: write synthetic marketplace.json directly to cacheDir (no fetch)
 *
 * Excluded: file/directory (installLocation is the user's path OUTSIDE cacheDir —
 * nonsensical in ephemeral containers), npm (node_modules bloat on Filestore mount).
 */
function isMarketplaceSourceSupportedByZipCache(source) {
    return ['github', 'git', 'url', 'settings'].includes(source.source);
}
