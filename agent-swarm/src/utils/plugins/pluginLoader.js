"use strict";
/**
 * Plugin Loader Module
 *
 * This module is responsible for discovering, loading, and validating Claude Code plugins
 * from various sources including marketplaces and git repositories.
 *
 * NPM packages are also supported but must be referenced through marketplaces - the marketplace
 * entry contains the NPM package information.
 *
 * Plugin Discovery Sources (in order of precedence):
 * 1. Marketplace-based plugins (plugin@marketplace format in settings)
 * 2. Session-only plugins (from --plugin-dir CLI flag or SDK plugins option)
 *
 * Plugin Directory Structure:
 * ```
 * my-plugin/
 * ├── plugin.json          # Optional manifest with metadata
 * ├── commands/            # Custom slash commands
 * │   ├── build.md
 * │   └── deploy.md
 * ├── agents/              # Custom AI agents
 * │   └── test-runner.md
 * └── hooks/               # Hook configurations
 *     └── hooks.json       # Hook definitions
 * ```
 *
 * The loader handles:
 * - Plugin manifest validation
 * - Hooks configuration loading and variable resolution
 * - Duplicate name detection
 * - Enable/disable state management
 * - Error collection and reporting
 */
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
exports.loadAllPluginsCacheOnly = exports.loadAllPlugins = void 0;
exports.getPluginCachePath = getPluginCachePath;
exports.getVersionedCachePathIn = getVersionedCachePathIn;
exports.getVersionedCachePath = getVersionedCachePath;
exports.getVersionedZipCachePath = getVersionedZipCachePath;
exports.probeSeedCacheAnyVersion = probeSeedCacheAnyVersion;
exports.getLegacyCachePath = getLegacyCachePath;
exports.resolvePluginPath = resolvePluginPath;
exports.copyDir = copyDir;
exports.copyPluginToVersionedCache = copyPluginToVersionedCache;
exports.installFromNpm = installFromNpm;
exports.gitClone = gitClone;
exports.installFromGitSubdir = installFromGitSubdir;
exports.generateTemporaryCacheNameForPlugin = generateTemporaryCacheNameForPlugin;
exports.cachePlugin = cachePlugin;
exports.loadPluginManifest = loadPluginManifest;
exports.createPluginFromPath = createPluginFromPath;
exports.mergePluginSources = mergePluginSources;
exports.clearPluginCache = clearPluginCache;
exports.cachePluginSettings = cachePluginSettings;
var promises_1 = require("fs/promises");
var memoize_js_1 = require("lodash-es/memoize.js");
var path_1 = require("path");
var state_js_1 = require("../../bootstrap/state.js");
var builtinPlugins_js_1 = require("../../plugins/builtinPlugins.js");
var debug_js_1 = require("../debug.js");
var envUtils_js_1 = require("../envUtils.js");
var errors_js_1 = require("../errors.js");
var execFileNoThrow_js_1 = require("../execFileNoThrow.js");
var file_js_1 = require("../file.js");
var fsOperations_js_1 = require("../fsOperations.js");
var git_js_1 = require("../git.js");
var lazySchema_js_1 = require("../lazySchema.js");
var log_js_1 = require("../log.js");
var settings_js_1 = require("../settings/settings.js");
var settingsCache_js_1 = require("../settings/settingsCache.js");
var types_js_1 = require("../settings/types.js");
var slowOperations_js_1 = require("../slowOperations.js");
var addDirPluginSettings_js_1 = require("./addDirPluginSettings.js");
var dependencyResolver_js_1 = require("./dependencyResolver.js");
var fetchTelemetry_js_1 = require("./fetchTelemetry.js");
var gitAvailability_js_1 = require("./gitAvailability.js");
var installedPluginsManager_js_1 = require("./installedPluginsManager.js");
var managedPlugins_js_1 = require("./managedPlugins.js");
var marketplaceHelpers_js_1 = require("./marketplaceHelpers.js");
var marketplaceManager_js_1 = require("./marketplaceManager.js");
var pluginDirectories_js_1 = require("./pluginDirectories.js");
var pluginIdentifier_js_1 = require("./pluginIdentifier.js");
var pluginInstallationHelpers_js_1 = require("./pluginInstallationHelpers.js");
var pluginVersioning_js_1 = require("./pluginVersioning.js");
var schemas_js_1 = require("./schemas.js");
var zipCache_js_1 = require("./zipCache.js");
/**
 * Get the path where plugin cache is stored
 */
function getPluginCachePath() {
    return (0, path_1.join)((0, pluginDirectories_js_1.getPluginsDirectory)(), 'cache');
}
/**
 * Compute the versioned cache path under a specific base plugins directory.
 * Used to probe both primary and seed caches.
 *
 * @param baseDir - Base plugins directory (e.g. getPluginsDirectory() or seed dir)
 * @param pluginId - Plugin identifier in format "name@marketplace"
 * @param version - Version string (semver, git SHA, etc.)
 * @returns Absolute path to versioned plugin directory under baseDir
 */
function getVersionedCachePathIn(baseDir, pluginId, version) {
    var _a = (0, pluginIdentifier_js_1.parsePluginIdentifier)(pluginId), pluginName = _a.name, marketplace = _a.marketplace;
    var sanitizedMarketplace = (marketplace || 'unknown').replace(/[^a-zA-Z0-9\-_]/g, '-');
    var sanitizedPlugin = (pluginName || pluginId).replace(/[^a-zA-Z0-9\-_]/g, '-');
    // Sanitize version to prevent path traversal attacks
    var sanitizedVersion = version.replace(/[^a-zA-Z0-9\-_.]/g, '-');
    return (0, path_1.join)(baseDir, 'cache', sanitizedMarketplace, sanitizedPlugin, sanitizedVersion);
}
/**
 * Get versioned cache path for a plugin under the primary plugins directory.
 * Format: ~/.claude/plugins/cache/{marketplace}/{plugin}/{version}/
 *
 * @param pluginId - Plugin identifier in format "name@marketplace"
 * @param version - Version string (semver, git SHA, etc.)
 * @returns Absolute path to versioned plugin directory
 */
function getVersionedCachePath(pluginId, version) {
    return getVersionedCachePathIn((0, pluginDirectories_js_1.getPluginsDirectory)(), pluginId, version);
}
/**
 * Get versioned ZIP cache path for a plugin.
 * This is the zip cache variant of getVersionedCachePath.
 */
function getVersionedZipCachePath(pluginId, version) {
    return "".concat(getVersionedCachePath(pluginId, version), ".zip");
}
/**
 * Probe seed directories for a populated cache at this plugin version.
 * Seeds are checked in precedence order; first hit wins. Returns null if no
 * seed is configured or none contains a populated directory at this version.
 */
function probeSeedCache(pluginId, version) {
    return __awaiter(this, void 0, void 0, function () {
        var _i, _a, seedDir, seedPath, entries, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _i = 0, _a = (0, pluginDirectories_js_1.getPluginSeedDirs)();
                    _c.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 6];
                    seedDir = _a[_i];
                    seedPath = getVersionedCachePathIn(seedDir, pluginId, version);
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, promises_1.readdir)(seedPath)];
                case 3:
                    entries = _c.sent();
                    if (entries.length > 0)
                        return [2 /*return*/, seedPath];
                    return [3 /*break*/, 5];
                case 4:
                    _b = _c.sent();
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/, null];
            }
        });
    });
}
/**
 * When the computed version is 'unknown', probe seed/cache/<m>/<p>/ for an
 * actual version dir. Handles the first-boot chicken-and-egg where the
 * version can only be known after cloning, but seed already has the clone.
 *
 * Per seed, only matches when exactly one version exists (typical BYOC case).
 * Multiple versions within a single seed → ambiguous → try next seed.
 * Seeds are checked in precedence order; first match wins.
 */
function probeSeedCacheAnyVersion(pluginId) {
    return __awaiter(this, void 0, void 0, function () {
        var _i, _a, seedDir, pluginDir, versions, versionDir, entries, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _i = 0, _a = (0, pluginDirectories_js_1.getPluginSeedDirs)();
                    _c.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 7];
                    seedDir = _a[_i];
                    pluginDir = (0, path_1.dirname)(getVersionedCachePathIn(seedDir, pluginId, '_'));
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, (0, promises_1.readdir)(pluginDir)];
                case 3:
                    versions = _c.sent();
                    if (versions.length !== 1)
                        return [3 /*break*/, 6];
                    versionDir = (0, path_1.join)(pluginDir, versions[0]);
                    return [4 /*yield*/, (0, promises_1.readdir)(versionDir)];
                case 4:
                    entries = _c.sent();
                    if (entries.length > 0)
                        return [2 /*return*/, versionDir];
                    return [3 /*break*/, 6];
                case 5:
                    _b = _c.sent();
                    return [3 /*break*/, 6];
                case 6:
                    _i++;
                    return [3 /*break*/, 1];
                case 7: return [2 /*return*/, null];
            }
        });
    });
}
/**
 * Get legacy (non-versioned) cache path for a plugin.
 * Format: ~/.claude/plugins/cache/{plugin-name}/
 *
 * Used for backward compatibility with existing installations.
 *
 * @param pluginName - Plugin name (without marketplace suffix)
 * @returns Absolute path to legacy plugin directory
 */
function getLegacyCachePath(pluginName) {
    var cachePath = getPluginCachePath();
    return (0, path_1.join)(cachePath, pluginName.replace(/[^a-zA-Z0-9\-_]/g, '-'));
}
/**
 * Resolve plugin path with fallback to legacy location.
 *
 * Always:
 * 1. Try versioned path first if version is provided
 * 2. Fall back to legacy path for existing installations
 * 3. Return versioned path for new installations
 *
 * @param pluginId - Plugin identifier in format "name@marketplace"
 * @param version - Optional version string
 * @returns Absolute path to plugin directory
 */
function resolvePluginPath(pluginId, version) {
    return __awaiter(this, void 0, void 0, function () {
        var versionedPath, pluginName, legacyPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!version) return [3 /*break*/, 2];
                    versionedPath = getVersionedCachePath(pluginId, version);
                    return [4 /*yield*/, (0, file_js_1.pathExists)(versionedPath)];
                case 1:
                    if (_a.sent()) {
                        return [2 /*return*/, versionedPath];
                    }
                    _a.label = 2;
                case 2:
                    pluginName = (0, pluginIdentifier_js_1.parsePluginIdentifier)(pluginId).name || pluginId;
                    legacyPath = getLegacyCachePath(pluginName);
                    return [4 /*yield*/, (0, file_js_1.pathExists)(legacyPath)];
                case 3:
                    if (_a.sent()) {
                        return [2 /*return*/, legacyPath];
                    }
                    // Return versioned path for new installations
                    return [2 /*return*/, version ? getVersionedCachePath(pluginId, version) : legacyPath];
            }
        });
    });
}
/**
 * Recursively copy a directory.
 * Exported for testing purposes.
 */
function copyDir(src, dest) {
    return __awaiter(this, void 0, void 0, function () {
        var entries, _i, entries_1, entry, srcPath, destPath, linkTarget, resolvedTarget, _a, resolvedSrc, _b, srcPrefix, targetRelativeToSrc, destTargetPath, relativeLinkPath;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, (0, fsOperations_js_1.getFsImplementation)().mkdir(dest)];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, (0, promises_1.readdir)(src, { withFileTypes: true })];
                case 2:
                    entries = _c.sent();
                    _i = 0, entries_1 = entries;
                    _c.label = 3;
                case 3:
                    if (!(_i < entries_1.length)) return [3 /*break*/, 22];
                    entry = entries_1[_i];
                    srcPath = (0, path_1.join)(src, entry.name);
                    destPath = (0, path_1.join)(dest, entry.name);
                    if (!entry.isDirectory()) return [3 /*break*/, 5];
                    return [4 /*yield*/, copyDir(srcPath, destPath)];
                case 4:
                    _c.sent();
                    return [3 /*break*/, 21];
                case 5:
                    if (!entry.isFile()) return [3 /*break*/, 7];
                    return [4 /*yield*/, (0, promises_1.copyFile)(srcPath, destPath)];
                case 6:
                    _c.sent();
                    return [3 /*break*/, 21];
                case 7:
                    if (!entry.isSymbolicLink()) return [3 /*break*/, 21];
                    return [4 /*yield*/, (0, promises_1.readlink)(srcPath)
                        // Resolve the symlink to get the actual target path
                        // This prevents circular symlinks when src and dest overlap (e.g., via symlink chains)
                    ];
                case 8:
                    linkTarget = _c.sent();
                    resolvedTarget = void 0;
                    _c.label = 9;
                case 9:
                    _c.trys.push([9, 11, , 13]);
                    return [4 /*yield*/, (0, promises_1.realpath)(srcPath)];
                case 10:
                    resolvedTarget = _c.sent();
                    return [3 /*break*/, 13];
                case 11:
                    _a = _c.sent();
                    // Broken symlink - copy the raw link target as-is
                    return [4 /*yield*/, (0, promises_1.symlink)(linkTarget, destPath)];
                case 12:
                    // Broken symlink - copy the raw link target as-is
                    _c.sent();
                    return [3 /*break*/, 21];
                case 13:
                    resolvedSrc = void 0;
                    _c.label = 14;
                case 14:
                    _c.trys.push([14, 16, , 17]);
                    return [4 /*yield*/, (0, promises_1.realpath)(src)];
                case 15:
                    resolvedSrc = _c.sent();
                    return [3 /*break*/, 17];
                case 16:
                    _b = _c.sent();
                    resolvedSrc = src;
                    return [3 /*break*/, 17];
                case 17:
                    srcPrefix = resolvedSrc.endsWith(path_1.sep)
                        ? resolvedSrc
                        : resolvedSrc + path_1.sep;
                    if (!(resolvedTarget.startsWith(srcPrefix) ||
                        resolvedTarget === resolvedSrc)) return [3 /*break*/, 19];
                    targetRelativeToSrc = (0, path_1.relative)(resolvedSrc, resolvedTarget);
                    destTargetPath = (0, path_1.join)(dest, targetRelativeToSrc);
                    relativeLinkPath = (0, path_1.relative)((0, path_1.dirname)(destPath), destTargetPath);
                    return [4 /*yield*/, (0, promises_1.symlink)(relativeLinkPath, destPath)];
                case 18:
                    _c.sent();
                    return [3 /*break*/, 21];
                case 19: 
                // Target is outside source tree - use absolute resolved path
                return [4 /*yield*/, (0, promises_1.symlink)(resolvedTarget, destPath)];
                case 20:
                    // Target is outside source tree - use absolute resolved path
                    _c.sent();
                    _c.label = 21;
                case 21:
                    _i++;
                    return [3 /*break*/, 3];
                case 22: return [2 /*return*/];
            }
        });
    });
}
/**
 * Copy plugin files to versioned cache directory.
 *
 * For local plugins: Uses entry.source from marketplace.json as the single source of truth.
 * For remote plugins: Falls back to copying sourcePath (the downloaded content).
 *
 * @param sourcePath - Path to the plugin source (used as fallback for remote plugins)
 * @param pluginId - Plugin identifier in format "name@marketplace"
 * @param version - Version string for versioned path
 * @param entry - Optional marketplace entry containing the source field
 * @param marketplaceDir - Marketplace directory for resolving entry.source (undefined for remote plugins)
 * @returns Path to the cached plugin directory
 * @throws Error if the source directory is not found
 * @throws Error if the destination directory is empty after copy
 */
function copyPluginToVersionedCache(sourcePath, pluginId, version, entry, marketplaceDir) {
    return __awaiter(this, void 0, void 0, function () {
        var zipCacheMode, cachePath, zipPath, entries, seedPath, sourceDir, e_1, gitPath, cacheEntries;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    zipCacheMode = (0, zipCache_js_1.isPluginZipCacheEnabled)();
                    cachePath = getVersionedCachePath(pluginId, version);
                    zipPath = getVersionedZipCachePath(pluginId, version);
                    if (!zipCacheMode) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, file_js_1.pathExists)(zipPath)];
                case 1:
                    if (_a.sent()) {
                        (0, debug_js_1.logForDebugging)("Plugin ".concat(pluginId, " version ").concat(version, " already cached at ").concat(zipPath));
                        return [2 /*return*/, zipPath];
                    }
                    return [3 /*break*/, 6];
                case 2: return [4 /*yield*/, (0, file_js_1.pathExists)(cachePath)];
                case 3:
                    if (!_a.sent()) return [3 /*break*/, 6];
                    return [4 /*yield*/, (0, promises_1.readdir)(cachePath)];
                case 4:
                    entries = _a.sent();
                    if (entries.length > 0) {
                        (0, debug_js_1.logForDebugging)("Plugin ".concat(pluginId, " version ").concat(version, " already cached at ").concat(cachePath));
                        return [2 /*return*/, cachePath];
                    }
                    // Directory exists but is empty, remove it so we can recreate with content
                    (0, debug_js_1.logForDebugging)("Removing empty cache directory for ".concat(pluginId, " at ").concat(cachePath));
                    return [4 /*yield*/, (0, promises_1.rmdir)(cachePath)];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6: return [4 /*yield*/, probeSeedCache(pluginId, version)];
                case 7:
                    seedPath = _a.sent();
                    if (seedPath) {
                        (0, debug_js_1.logForDebugging)("Using seed cache for ".concat(pluginId, "@").concat(version, " at ").concat(seedPath));
                        return [2 /*return*/, seedPath];
                    }
                    // Create parent directories
                    return [4 /*yield*/, (0, fsOperations_js_1.getFsImplementation)().mkdir((0, path_1.dirname)(cachePath))
                        // For local plugins: copy entry.source directory (the single source of truth)
                        // For remote plugins: marketplaceDir is undefined, fall back to copying sourcePath
                    ];
                case 8:
                    // Create parent directories
                    _a.sent();
                    if (!(entry && typeof entry.source === 'string' && marketplaceDir)) return [3 /*break*/, 13];
                    sourceDir = (0, pluginInstallationHelpers_js_1.validatePathWithinBase)(marketplaceDir, entry.source);
                    (0, debug_js_1.logForDebugging)("Copying source directory ".concat(entry.source, " for plugin ").concat(pluginId));
                    _a.label = 9;
                case 9:
                    _a.trys.push([9, 11, , 12]);
                    return [4 /*yield*/, copyDir(sourceDir, cachePath)];
                case 10:
                    _a.sent();
                    return [3 /*break*/, 12];
                case 11:
                    e_1 = _a.sent();
                    // Only remap ENOENT from the top-level sourceDir itself — nested ENOENTs
                    // from recursive copyDir (broken symlinks, raced deletes) should preserve
                    // their original path in the error.
                    if ((0, errors_js_1.isENOENT)(e_1) && (0, errors_js_1.getErrnoPath)(e_1) === sourceDir) {
                        throw new Error("Plugin source directory not found: ".concat(sourceDir, " (from entry.source: ").concat(entry.source, ")"));
                    }
                    throw e_1;
                case 12: return [3 /*break*/, 15];
                case 13:
                    // Fallback for remote plugins (already downloaded) or plugins without entry.source
                    (0, debug_js_1.logForDebugging)("Copying plugin ".concat(pluginId, " to versioned cache (fallback to full copy)"));
                    return [4 /*yield*/, copyDir(sourcePath, cachePath)];
                case 14:
                    _a.sent();
                    _a.label = 15;
                case 15:
                    gitPath = (0, path_1.join)(cachePath, '.git');
                    return [4 /*yield*/, (0, promises_1.rm)(gitPath, { recursive: true, force: true })
                        // Validate that cache has content - if empty, throw so fallback can be used
                    ];
                case 16:
                    _a.sent();
                    return [4 /*yield*/, (0, promises_1.readdir)(cachePath)];
                case 17:
                    cacheEntries = _a.sent();
                    if (cacheEntries.length === 0) {
                        throw new Error("Failed to copy plugin ".concat(pluginId, " to versioned cache: destination is empty after copy"));
                    }
                    if (!zipCacheMode) return [3 /*break*/, 19];
                    return [4 /*yield*/, (0, zipCache_js_1.convertDirectoryToZipInPlace)(cachePath, zipPath)];
                case 18:
                    _a.sent();
                    (0, debug_js_1.logForDebugging)("Successfully cached plugin ".concat(pluginId, " as ZIP at ").concat(zipPath));
                    return [2 /*return*/, zipPath];
                case 19:
                    (0, debug_js_1.logForDebugging)("Successfully cached plugin ".concat(pluginId, " at ").concat(cachePath));
                    return [2 /*return*/, cachePath];
            }
        });
    });
}
/**
 * Validate a git URL using Node.js URL parsing
 */
function validateGitUrl(url) {
    try {
        var parsed = new URL(url);
        if (!['https:', 'http:', 'file:'].includes(parsed.protocol)) {
            if (!/^git@[a-zA-Z0-9.-]+:/.test(url)) {
                throw new Error("Invalid git URL protocol: ".concat(parsed.protocol, ". Only HTTPS, HTTP, file:// and SSH (git@) URLs are supported."));
            }
        }
        return url;
    }
    catch (_a) {
        if (/^git@[a-zA-Z0-9.-]+:/.test(url)) {
            return url;
        }
        throw new Error("Invalid git URL: ".concat(url));
    }
}
/**
 * Install a plugin from npm using a global cache (exported for testing)
 */
function installFromNpm(packageName_1, targetPath_1) {
    return __awaiter(this, arguments, void 0, function (packageName, targetPath, options) {
        var npmCachePath, packageSpec, packagePath, needsInstall, args, result;
        if (options === void 0) { options = {}; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    npmCachePath = (0, path_1.join)((0, pluginDirectories_js_1.getPluginsDirectory)(), 'npm-cache');
                    return [4 /*yield*/, (0, fsOperations_js_1.getFsImplementation)().mkdir(npmCachePath)];
                case 1:
                    _a.sent();
                    packageSpec = options.version
                        ? "".concat(packageName, "@").concat(options.version)
                        : packageName;
                    packagePath = (0, path_1.join)(npmCachePath, 'node_modules', packageName);
                    return [4 /*yield*/, (0, file_js_1.pathExists)(packagePath)];
                case 2:
                    needsInstall = !(_a.sent());
                    if (!needsInstall) return [3 /*break*/, 4];
                    (0, debug_js_1.logForDebugging)("Installing npm package ".concat(packageSpec, " to cache"));
                    args = ['install', packageSpec, '--prefix', npmCachePath];
                    if (options.registry) {
                        args.push('--registry', options.registry);
                    }
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('npm', args, { useCwd: false })];
                case 3:
                    result = _a.sent();
                    if (result.code !== 0) {
                        throw new Error("Failed to install npm package: ".concat(result.stderr));
                    }
                    _a.label = 4;
                case 4: return [4 /*yield*/, copyDir(packagePath, targetPath)];
                case 5:
                    _a.sent();
                    (0, debug_js_1.logForDebugging)("Copied npm package ".concat(packageName, " from cache to ").concat(targetPath));
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Clone a git repository (exported for testing)
 *
 * @param gitUrl - The git URL to clone
 * @param targetPath - Where to clone the repository
 * @param ref - Optional branch or tag to checkout
 * @param sha - Optional specific commit SHA to checkout
 */
function gitClone(gitUrl, targetPath, ref, sha) {
    return __awaiter(this, void 0, void 0, function () {
        var args, cloneStarted, cloneResult, shallowFetchResult, unshallowResult, checkoutResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    args = [
                        'clone',
                        '--depth',
                        '1',
                        '--recurse-submodules',
                        '--shallow-submodules',
                    ];
                    // Add --branch flag for specific ref (works for both branches and tags)
                    if (ref) {
                        args.push('--branch', ref);
                    }
                    // If sha is specified, use --no-checkout since we'll checkout the SHA separately
                    if (sha) {
                        args.push('--no-checkout');
                    }
                    args.push(gitUrl, targetPath);
                    cloneStarted = performance.now();
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)((0, git_js_1.gitExe)(), args)];
                case 1:
                    cloneResult = _a.sent();
                    if (cloneResult.code !== 0) {
                        (0, fetchTelemetry_js_1.logPluginFetch)('plugin_clone', gitUrl, 'failure', performance.now() - cloneStarted, (0, fetchTelemetry_js_1.classifyFetchError)(cloneResult.stderr));
                        throw new Error("Failed to clone repository: ".concat(cloneResult.stderr));
                    }
                    if (!sha) return [3 /*break*/, 6];
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), ['fetch', '--depth', '1', 'origin', sha], { cwd: targetPath })];
                case 2:
                    shallowFetchResult = _a.sent();
                    if (!(shallowFetchResult.code !== 0)) return [3 /*break*/, 4];
                    // Some servers don't support fetching arbitrary SHAs
                    // Fall back to unshallow fetch to get full history
                    (0, debug_js_1.logForDebugging)("Shallow fetch of SHA ".concat(sha, " failed, falling back to unshallow fetch"));
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), ['fetch', '--unshallow'], { cwd: targetPath })];
                case 3:
                    unshallowResult = _a.sent();
                    if (unshallowResult.code !== 0) {
                        (0, fetchTelemetry_js_1.logPluginFetch)('plugin_clone', gitUrl, 'failure', performance.now() - cloneStarted, (0, fetchTelemetry_js_1.classifyFetchError)(unshallowResult.stderr));
                        throw new Error("Failed to fetch commit ".concat(sha, ": ").concat(unshallowResult.stderr));
                    }
                    _a.label = 4;
                case 4: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), ['checkout', sha], { cwd: targetPath })];
                case 5:
                    checkoutResult = _a.sent();
                    if (checkoutResult.code !== 0) {
                        (0, fetchTelemetry_js_1.logPluginFetch)('plugin_clone', gitUrl, 'failure', performance.now() - cloneStarted, (0, fetchTelemetry_js_1.classifyFetchError)(checkoutResult.stderr));
                        throw new Error("Failed to checkout commit ".concat(sha, ": ").concat(checkoutResult.stderr));
                    }
                    _a.label = 6;
                case 6:
                    // Fire success only after ALL network ops (clone + optional SHA fetch)
                    // complete — same telemetry-scope discipline as mcpb and marketplace_url.
                    (0, fetchTelemetry_js_1.logPluginFetch)('plugin_clone', gitUrl, 'success', performance.now() - cloneStarted);
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Install a plugin from a git URL
 */
function installFromGit(gitUrl, targetPath, ref, sha) {
    return __awaiter(this, void 0, void 0, function () {
        var safeUrl, refMessage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    safeUrl = validateGitUrl(gitUrl);
                    return [4 /*yield*/, gitClone(safeUrl, targetPath, ref, sha)];
                case 1:
                    _a.sent();
                    refMessage = ref ? " (ref: ".concat(ref, ")") : '';
                    (0, debug_js_1.logForDebugging)("Cloned repository from ".concat(safeUrl).concat(refMessage, " to ").concat(targetPath));
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Install a plugin from GitHub
 */
function installFromGitHub(repo, targetPath, ref, sha) {
    return __awaiter(this, void 0, void 0, function () {
        var gitUrl;
        return __generator(this, function (_a) {
            if (!/^[a-zA-Z0-9-_.]+\/[a-zA-Z0-9-_.]+$/.test(repo)) {
                throw new Error("Invalid GitHub repository format: ".concat(repo, ". Expected format: owner/repo"));
            }
            gitUrl = (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_REMOTE)
                ? "https://github.com/".concat(repo, ".git")
                : "git@github.com:".concat(repo, ".git");
            return [2 /*return*/, installFromGit(gitUrl, targetPath, ref, sha)];
        });
    });
}
/**
 * Resolve a git-subdir `url` field to a clonable git URL.
 * Accepts GitHub owner/repo shorthand (converted to ssh or https depending on
 * CLAUDE_CODE_REMOTE) or any URL that passes validateGitUrl (https, http,
 * file, git@ ssh).
 */
function resolveGitSubdirUrl(url) {
    if (/^[a-zA-Z0-9-_.]+\/[a-zA-Z0-9-_.]+$/.test(url)) {
        return (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_REMOTE)
            ? "https://github.com/".concat(url, ".git")
            : "git@github.com:".concat(url, ".git");
    }
    return validateGitUrl(url);
}
/**
 * Install a plugin from a subdirectory of a git repository (exported for
 * testing).
 *
 * Uses partial clone (--filter=tree:0) + sparse-checkout so only the tree
 * objects along the path and the blobs under it are downloaded. For large
 * monorepos this is dramatically cheaper than a full clone — the tree objects
 * for a million-file repo can be hundreds of MB, all avoided here.
 *
 * Sequence:
 * 1. clone --depth 1 --filter=tree:0 --no-checkout [--branch ref]
 * 2. sparse-checkout set --cone -- <path>
 * 3. If sha: fetch --depth 1 origin <sha> (fallback: --unshallow), then
 *    checkout <sha>. The partial-clone filter is stored in remote config so
 *    subsequent fetches respect it; --unshallow gets all commits but trees
 *    and blobs remain lazy.
 *    If no sha: checkout HEAD (points to ref if --branch was used).
 * 4. Move <cloneDir>/<path> to targetPath and discard the clone.
 *
 * The clone is ephemeral — it goes into a sibling temp directory and is
 * removed after the subdir is extracted. targetPath ends up containing only
 * the plugin files with no .git directory.
 */
function installFromGitSubdir(url, targetPath, subdirPath, ref, sha) {
    return __awaiter(this, void 0, void 0, function () {
        var gitUrl, cloneDir, cloneArgs, cloneResult, sparseResult, resolvedSha, fetchSha, unshallow, checkout, _a, checkout, revParse, resolvedSubdir, e_2, refMsg, shaMsg;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, gitAvailability_js_1.checkGitAvailable)()];
                case 1:
                    if (!(_b.sent())) {
                        throw new Error('git-subdir plugin source requires git to be installed and on PATH. ' +
                            'Install git (version 2.25 or later for sparse-checkout cone mode) and try again.');
                    }
                    gitUrl = resolveGitSubdirUrl(url);
                    cloneDir = "".concat(targetPath, ".clone");
                    cloneArgs = [
                        'clone',
                        '--depth',
                        '1',
                        '--filter=tree:0',
                        '--no-checkout',
                    ];
                    if (ref) {
                        cloneArgs.push('--branch', ref);
                    }
                    cloneArgs.push(gitUrl, cloneDir);
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)((0, git_js_1.gitExe)(), cloneArgs)];
                case 2:
                    cloneResult = _b.sent();
                    if (cloneResult.code !== 0) {
                        throw new Error("Failed to clone repository for git-subdir source: ".concat(cloneResult.stderr));
                    }
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, , 16, 18]);
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), ['sparse-checkout', 'set', '--cone', '--', subdirPath], { cwd: cloneDir })];
                case 4:
                    sparseResult = _b.sent();
                    if (sparseResult.code !== 0) {
                        throw new Error("git sparse-checkout set failed (git >= 2.25 required for cone mode): ".concat(sparseResult.stderr));
                    }
                    resolvedSha = void 0;
                    if (!sha) return [3 /*break*/, 9];
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), ['fetch', '--depth', '1', 'origin', sha], { cwd: cloneDir })];
                case 5:
                    fetchSha = _b.sent();
                    if (!(fetchSha.code !== 0)) return [3 /*break*/, 7];
                    (0, debug_js_1.logForDebugging)("Shallow fetch of SHA ".concat(sha, " failed for git-subdir, falling back to unshallow fetch"));
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), ['fetch', '--unshallow'], { cwd: cloneDir })];
                case 6:
                    unshallow = _b.sent();
                    if (unshallow.code !== 0) {
                        throw new Error("Failed to fetch commit ".concat(sha, ": ").concat(unshallow.stderr));
                    }
                    _b.label = 7;
                case 7: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), ['checkout', sha], { cwd: cloneDir })];
                case 8:
                    checkout = _b.sent();
                    if (checkout.code !== 0) {
                        throw new Error("Failed to checkout commit ".concat(sha, ": ").concat(checkout.stderr));
                    }
                    resolvedSha = sha;
                    return [3 /*break*/, 11];
                case 9: return [4 /*yield*/, Promise.all([
                        (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), ['checkout', 'HEAD'], {
                            cwd: cloneDir,
                        }),
                        (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), ['rev-parse', 'HEAD'], {
                            cwd: cloneDir,
                        }),
                    ])];
                case 10:
                    _a = _b.sent(), checkout = _a[0], revParse = _a[1];
                    if (checkout.code !== 0) {
                        throw new Error("git checkout after sparse-checkout failed: ".concat(checkout.stderr));
                    }
                    if (revParse.code === 0) {
                        resolvedSha = revParse.stdout.trim();
                    }
                    _b.label = 11;
                case 11:
                    resolvedSubdir = (0, pluginInstallationHelpers_js_1.validatePathWithinBase)(cloneDir, subdirPath);
                    _b.label = 12;
                case 12:
                    _b.trys.push([12, 14, , 15]);
                    return [4 /*yield*/, (0, promises_1.rename)(resolvedSubdir, targetPath)];
                case 13:
                    _b.sent();
                    return [3 /*break*/, 15];
                case 14:
                    e_2 = _b.sent();
                    if ((0, errors_js_1.isENOENT)(e_2)) {
                        throw new Error("Subdirectory '".concat(subdirPath, "' not found in repository ").concat(gitUrl).concat(ref ? " (ref: ".concat(ref, ")") : '', ". ") +
                            'Check that the path is correct and exists at the specified ref/sha.');
                    }
                    throw e_2;
                case 15:
                    refMsg = ref ? " ref=".concat(ref) : '';
                    shaMsg = resolvedSha ? " sha=".concat(resolvedSha) : '';
                    (0, debug_js_1.logForDebugging)("Extracted subdir ".concat(subdirPath, " from ").concat(gitUrl).concat(refMsg).concat(shaMsg, " to ").concat(targetPath));
                    return [2 /*return*/, resolvedSha];
                case 16: return [4 /*yield*/, (0, promises_1.rm)(cloneDir, { recursive: true, force: true })];
                case 17:
                    _b.sent();
                    return [7 /*endfinally*/];
                case 18: return [2 /*return*/];
            }
        });
    });
}
/**
 * Install a plugin from a local path
 */
function installFromLocal(sourcePath, targetPath) {
    return __awaiter(this, void 0, void 0, function () {
        var gitPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, file_js_1.pathExists)(sourcePath)];
                case 1:
                    if (!(_a.sent())) {
                        throw new Error("Source path does not exist: ".concat(sourcePath));
                    }
                    return [4 /*yield*/, copyDir(sourcePath, targetPath)];
                case 2:
                    _a.sent();
                    gitPath = (0, path_1.join)(targetPath, '.git');
                    return [4 /*yield*/, (0, promises_1.rm)(gitPath, { recursive: true, force: true })];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Generate a temporary cache name for a plugin
 */
function generateTemporaryCacheNameForPlugin(source) {
    var timestamp = Date.now();
    var random = Math.random().toString(36).substring(2, 8);
    var prefix;
    if (typeof source === 'string') {
        prefix = 'local';
    }
    else {
        switch (source.source) {
            case 'npm':
                prefix = 'npm';
                break;
            case 'pip':
                prefix = 'pip';
                break;
            case 'github':
                prefix = 'github';
                break;
            case 'url':
                prefix = 'git';
                break;
            case 'git-subdir':
                prefix = 'subdir';
                break;
            default:
                prefix = 'unknown';
        }
    }
    return "temp_".concat(prefix, "_").concat(timestamp, "_").concat(random);
}
/**
 * Cache a plugin from an external source
 */
function cachePlugin(source, options) {
    return __awaiter(this, void 0, void 0, function () {
        var cachePath, tempName, tempPath, shouldCleanup, gitCommitSha, _a, error_1, _b, cleanupError_1, manifestPath, legacyManifestPath, manifest, content, parsed, result, errors, error_2, errorMsg, content, parsed, result, errors, error_3, errorMsg, finalName, finalPath;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    cachePath = getPluginCachePath();
                    return [4 /*yield*/, (0, fsOperations_js_1.getFsImplementation)().mkdir(cachePath)];
                case 1:
                    _c.sent();
                    tempName = generateTemporaryCacheNameForPlugin(source);
                    tempPath = (0, path_1.join)(cachePath, tempName);
                    shouldCleanup = false;
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 16, , 23]);
                    (0, debug_js_1.logForDebugging)("Caching plugin from source: ".concat((0, slowOperations_js_1.jsonStringify)(source), " to temporary path ").concat(tempPath));
                    shouldCleanup = true;
                    if (!(typeof source === 'string')) return [3 /*break*/, 4];
                    return [4 /*yield*/, installFromLocal(source, tempPath)];
                case 3:
                    _c.sent();
                    return [3 /*break*/, 15];
                case 4:
                    _a = source.source;
                    switch (_a) {
                        case 'npm': return [3 /*break*/, 5];
                        case 'github': return [3 /*break*/, 7];
                        case 'url': return [3 /*break*/, 9];
                        case 'git-subdir': return [3 /*break*/, 11];
                        case 'pip': return [3 /*break*/, 13];
                    }
                    return [3 /*break*/, 14];
                case 5: return [4 /*yield*/, installFromNpm(source.package, tempPath, {
                        registry: source.registry,
                        version: source.version,
                    })];
                case 6:
                    _c.sent();
                    return [3 /*break*/, 15];
                case 7: return [4 /*yield*/, installFromGitHub(source.repo, tempPath, source.ref, source.sha)];
                case 8:
                    _c.sent();
                    return [3 /*break*/, 15];
                case 9: return [4 /*yield*/, installFromGit(source.url, tempPath, source.ref, source.sha)];
                case 10:
                    _c.sent();
                    return [3 /*break*/, 15];
                case 11: return [4 /*yield*/, installFromGitSubdir(source.url, tempPath, source.path, source.ref, source.sha)];
                case 12:
                    gitCommitSha = _c.sent();
                    return [3 /*break*/, 15];
                case 13: throw new Error('Python package plugins are not yet supported');
                case 14: throw new Error("Unsupported plugin source type");
                case 15: return [3 /*break*/, 23];
                case 16:
                    error_1 = _c.sent();
                    _b = shouldCleanup;
                    if (!_b) return [3 /*break*/, 18];
                    return [4 /*yield*/, (0, file_js_1.pathExists)(tempPath)];
                case 17:
                    _b = (_c.sent());
                    _c.label = 18;
                case 18:
                    if (!_b) return [3 /*break*/, 22];
                    (0, debug_js_1.logForDebugging)("Cleaning up failed installation at ".concat(tempPath));
                    _c.label = 19;
                case 19:
                    _c.trys.push([19, 21, , 22]);
                    return [4 /*yield*/, (0, promises_1.rm)(tempPath, { recursive: true, force: true })];
                case 20:
                    _c.sent();
                    return [3 /*break*/, 22];
                case 21:
                    cleanupError_1 = _c.sent();
                    (0, debug_js_1.logForDebugging)("Failed to clean up installation: ".concat(cleanupError_1), {
                        level: 'error',
                    });
                    return [3 /*break*/, 22];
                case 22: throw error_1;
                case 23:
                    manifestPath = (0, path_1.join)(tempPath, '.claude-plugin', 'plugin.json');
                    legacyManifestPath = (0, path_1.join)(tempPath, 'plugin.json');
                    return [4 /*yield*/, (0, file_js_1.pathExists)(manifestPath)];
                case 24:
                    if (!_c.sent()) return [3 /*break*/, 29];
                    _c.label = 25;
                case 25:
                    _c.trys.push([25, 27, , 28]);
                    return [4 /*yield*/, (0, promises_1.readFile)(manifestPath, { encoding: 'utf-8' })];
                case 26:
                    content = _c.sent();
                    parsed = (0, slowOperations_js_1.jsonParse)(content);
                    result = (0, schemas_js_1.PluginManifestSchema)().safeParse(parsed);
                    if (result.success) {
                        manifest = result.data;
                    }
                    else {
                        errors = result.error.issues
                            .map(function (err) { return "".concat(err.path.join('.'), ": ").concat(err.message); })
                            .join(', ');
                        (0, debug_js_1.logForDebugging)("Invalid manifest at ".concat(manifestPath, ": ").concat(errors), {
                            level: 'error',
                        });
                        throw new Error("Plugin has an invalid manifest file at ".concat(manifestPath, ". Validation errors: ").concat(errors));
                    }
                    return [3 /*break*/, 28];
                case 27:
                    error_2 = _c.sent();
                    // Check if this is a validation error we just threw
                    if (error_2 instanceof Error &&
                        error_2.message.includes('invalid manifest file')) {
                        throw error_2;
                    }
                    errorMsg = (0, errors_js_1.errorMessage)(error_2);
                    (0, debug_js_1.logForDebugging)("Failed to parse manifest at ".concat(manifestPath, ": ").concat(errorMsg), {
                        level: 'error',
                    });
                    throw new Error("Plugin has a corrupt manifest file at ".concat(manifestPath, ". JSON parse error: ").concat(errorMsg));
                case 28: return [3 /*break*/, 36];
                case 29: return [4 /*yield*/, (0, file_js_1.pathExists)(legacyManifestPath)];
                case 30:
                    if (!_c.sent()) return [3 /*break*/, 35];
                    _c.label = 31;
                case 31:
                    _c.trys.push([31, 33, , 34]);
                    return [4 /*yield*/, (0, promises_1.readFile)(legacyManifestPath, {
                            encoding: 'utf-8',
                        })];
                case 32:
                    content = _c.sent();
                    parsed = (0, slowOperations_js_1.jsonParse)(content);
                    result = (0, schemas_js_1.PluginManifestSchema)().safeParse(parsed);
                    if (result.success) {
                        manifest = result.data;
                    }
                    else {
                        errors = result.error.issues
                            .map(function (err) { return "".concat(err.path.join('.'), ": ").concat(err.message); })
                            .join(', ');
                        (0, debug_js_1.logForDebugging)("Invalid legacy manifest at ".concat(legacyManifestPath, ": ").concat(errors), { level: 'error' });
                        throw new Error("Plugin has an invalid manifest file at ".concat(legacyManifestPath, ". Validation errors: ").concat(errors));
                    }
                    return [3 /*break*/, 34];
                case 33:
                    error_3 = _c.sent();
                    // Check if this is a validation error we just threw
                    if (error_3 instanceof Error &&
                        error_3.message.includes('invalid manifest file')) {
                        throw error_3;
                    }
                    errorMsg = (0, errors_js_1.errorMessage)(error_3);
                    (0, debug_js_1.logForDebugging)("Failed to parse legacy manifest at ".concat(legacyManifestPath, ": ").concat(errorMsg), {
                        level: 'error',
                    });
                    throw new Error("Plugin has a corrupt manifest file at ".concat(legacyManifestPath, ". JSON parse error: ").concat(errorMsg));
                case 34: return [3 /*break*/, 36];
                case 35:
                    manifest = (options === null || options === void 0 ? void 0 : options.manifest) || {
                        name: tempName,
                        description: "Plugin cached from ".concat(typeof source === 'string' ? source : source.source),
                    };
                    _c.label = 36;
                case 36:
                    finalName = manifest.name.replace(/[^a-zA-Z0-9-_]/g, '-');
                    finalPath = (0, path_1.join)(cachePath, finalName);
                    return [4 /*yield*/, (0, file_js_1.pathExists)(finalPath)];
                case 37:
                    if (!_c.sent()) return [3 /*break*/, 39];
                    (0, debug_js_1.logForDebugging)("Removing old cached version at ".concat(finalPath));
                    return [4 /*yield*/, (0, promises_1.rm)(finalPath, { recursive: true, force: true })];
                case 38:
                    _c.sent();
                    _c.label = 39;
                case 39: return [4 /*yield*/, (0, promises_1.rename)(tempPath, finalPath)];
                case 40:
                    _c.sent();
                    (0, debug_js_1.logForDebugging)("Successfully cached plugin ".concat(manifest.name, " to ").concat(finalPath));
                    return [2 /*return*/, __assign({ path: finalPath, manifest: manifest }, (gitCommitSha && { gitCommitSha: gitCommitSha }))];
            }
        });
    });
}
/**
 * Loads and validates a plugin manifest from a JSON file.
 *
 * The manifest provides metadata about the plugin including name, version,
 * description, author, and other optional fields. If no manifest exists,
 * a minimal one is created to allow the plugin to function.
 *
 * Example plugin.json:
 * ```json
 * {
 *   "name": "code-assistant",
 *   "version": "1.2.0",
 *   "description": "AI-powered code assistance tools",
 *   "author": {
 *     "name": "John Doe",
 *     "email": "john@example.com"
 *   },
 *   "keywords": ["coding", "ai", "assistant"],
 *   "homepage": "https://example.com/code-assistant",
 *   "hooks": "./custom-hooks.json",
 *   "commands": ["./extra-commands/*.md"]
 * }
 * ```
 */
/**
 * Loads and validates a plugin manifest from a JSON file.
 *
 * The manifest provides metadata about the plugin including name, version,
 * description, author, and other optional fields. If no manifest exists,
 * a minimal one is created to allow the plugin to function.
 *
 * Unknown keys in the manifest are silently stripped (PluginManifestSchema
 * uses zod's default strip behavior, not .strict()). Type mismatches and
 * other validation errors still fail.
 *
 * Behavior:
 * - Missing file: Creates default with provided name and source
 * - Invalid JSON: Throws error with parse details
 * - Schema validation failure: Throws error with validation details
 *
 * @param manifestPath - Full path to the plugin.json file
 * @param pluginName - Name to use in default manifest (e.g., "my-plugin")
 * @param source - Source description for default manifest (e.g., "git:repo" or ".claude-plugin/name")
 * @returns A valid PluginManifest object (either loaded or default)
 * @throws Error if manifest exists but is invalid (corrupt JSON or schema validation failure)
 */
function loadPluginManifest(manifestPath, pluginName, source) {
    return __awaiter(this, void 0, void 0, function () {
        var content, parsedJson, result, errors, error_4, errorMsg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, file_js_1.pathExists)(manifestPath)];
                case 1:
                    // Check if manifest file exists
                    // If not, create a minimal manifest to allow plugin to function
                    if (!(_a.sent())) {
                        // Return default manifest with provided name and source
                        return [2 /*return*/, {
                                name: pluginName,
                                description: "Plugin from ".concat(source),
                            }];
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, promises_1.readFile)(manifestPath, { encoding: 'utf-8' })];
                case 3:
                    content = _a.sent();
                    parsedJson = (0, slowOperations_js_1.jsonParse)(content);
                    result = (0, schemas_js_1.PluginManifestSchema)().safeParse(parsedJson);
                    if (result.success) {
                        // Valid manifest - return the validated data
                        return [2 /*return*/, result.data];
                    }
                    errors = result.error.issues
                        .map(function (err) {
                        return err.path.length > 0
                            ? "".concat(err.path.join('.'), ": ").concat(err.message)
                            : err.message;
                    })
                        .join(', ');
                    (0, debug_js_1.logForDebugging)("Plugin ".concat(pluginName, " has an invalid manifest file at ").concat(manifestPath, ". Validation errors: ").concat(errors), { level: 'error' });
                    throw new Error("Plugin ".concat(pluginName, " has an invalid manifest file at ").concat(manifestPath, ".\n\nValidation errors: ").concat(errors));
                case 4:
                    error_4 = _a.sent();
                    // Check if this is the error we just threw (validation error)
                    if (error_4 instanceof Error &&
                        error_4.message.includes('invalid manifest file')) {
                        throw error_4;
                    }
                    errorMsg = (0, errors_js_1.errorMessage)(error_4);
                    (0, debug_js_1.logForDebugging)("Plugin ".concat(pluginName, " has a corrupt manifest file at ").concat(manifestPath, ". Parse error: ").concat(errorMsg), { level: 'error' });
                    throw new Error("Plugin ".concat(pluginName, " has a corrupt manifest file at ").concat(manifestPath, ".\n\nJSON parse error: ").concat(errorMsg));
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Loads and validates plugin hooks configuration from a JSON file.
 * IMPORTANT: Only call this when the hooks file is expected to exist.
 *
 * @param hooksConfigPath - Full path to the hooks.json file
 * @param pluginName - Plugin name for error messages
 * @returns Validated HooksSettings
 * @throws Error if file doesn't exist or is invalid
 */
function loadPluginHooks(hooksConfigPath, pluginName) {
    return __awaiter(this, void 0, void 0, function () {
        var content, rawHooksConfig, validatedPluginHooks;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, file_js_1.pathExists)(hooksConfigPath)];
                case 1:
                    if (!(_a.sent())) {
                        throw new Error("Hooks file not found at ".concat(hooksConfigPath, " for plugin ").concat(pluginName, ". If the manifest declares hooks, the file must exist."));
                    }
                    return [4 /*yield*/, (0, promises_1.readFile)(hooksConfigPath, { encoding: 'utf-8' })];
                case 2:
                    content = _a.sent();
                    rawHooksConfig = (0, slowOperations_js_1.jsonParse)(content);
                    validatedPluginHooks = (0, schemas_js_1.PluginHooksSchema)().parse(rawHooksConfig);
                    return [2 /*return*/, validatedPluginHooks.hooks];
            }
        });
    });
}
/**
 * Validate a list of plugin component relative paths by checking existence in parallel.
 *
 * This helper parallelizes the pathExists checks (the expensive async part) while
 * preserving deterministic error/log ordering by iterating results sequentially.
 *
 * Introduced to fix a perf regression from the sync→async fs migration: sequential
 * `for { await pathExists }` loops add ~1-5ms of event-loop overhead per iteration.
 * With many plugins × several component types, this compounds to hundreds of ms.
 *
 * @param relPaths - Relative paths from the manifest/marketplace entry to validate
 * @param pluginPath - Plugin root directory to resolve relative paths against
 * @param pluginName - Plugin name for error messages
 * @param source - Source identifier for PluginError records
 * @param component - Which component these paths belong to (for error records)
 * @param componentLabel - Human-readable label for log messages (e.g. "Agent", "Skill")
 * @param contextLabel - Where the path came from, for log messages
 *   (e.g. "specified in manifest but", "from marketplace entry")
 * @param errors - Error array to push path-not-found errors into (mutated)
 * @returns Array of full paths that exist on disk, in original order
 */
function validatePluginPaths(relPaths, pluginPath, pluginName, source, component, componentLabel, contextLabel, errors) {
    return __awaiter(this, void 0, void 0, function () {
        var checks, validPaths, _i, checks_1, _a, relPath, fullPath, exists;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.all(relPaths.map(function (relPath) { return __awaiter(_this, void 0, void 0, function () {
                        var fullPath;
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    fullPath = (0, path_1.join)(pluginPath, relPath);
                                    _a = { relPath: relPath, fullPath: fullPath };
                                    return [4 /*yield*/, (0, file_js_1.pathExists)(fullPath)];
                                case 1: return [2 /*return*/, (_a.exists = _b.sent(), _a)];
                            }
                        });
                    }); }))
                    // Process results in original order to keep error/log ordering deterministic
                ];
                case 1:
                    checks = _b.sent();
                    validPaths = [];
                    for (_i = 0, checks_1 = checks; _i < checks_1.length; _i++) {
                        _a = checks_1[_i], relPath = _a.relPath, fullPath = _a.fullPath, exists = _a.exists;
                        if (exists) {
                            validPaths.push(fullPath);
                        }
                        else {
                            (0, debug_js_1.logForDebugging)("".concat(componentLabel, " path ").concat(relPath, " ").concat(contextLabel, " not found at ").concat(fullPath, " for ").concat(pluginName), { level: 'warn' });
                            (0, log_js_1.logError)(new Error("Plugin component file not found: ".concat(fullPath, " for ").concat(pluginName)));
                            errors.push({
                                type: 'path-not-found',
                                source: source,
                                plugin: pluginName,
                                path: fullPath,
                                component: component,
                            });
                        }
                    }
                    return [2 /*return*/, validPaths];
            }
        });
    });
}
/**
 * Creates a LoadedPlugin object from a plugin directory path.
 *
 * This is the central function that assembles a complete plugin representation
 * by scanning the plugin directory structure and loading all components.
 * It handles both fully-featured plugins with manifests and minimal plugins
 * with just commands or agents directories.
 *
 * Directory structure it looks for:
 * ```
 * plugin-directory/
 * ├── plugin.json          # Optional: Plugin manifest
 * ├── commands/            # Optional: Custom slash commands
 * │   ├── build.md         # /build command
 * │   └── test.md          # /test command
 * ├── agents/              # Optional: Custom AI agents
 * │   ├── reviewer.md      # Code review agent
 * │   └── optimizer.md     # Performance optimization agent
 * └── hooks/               # Optional: Hook configurations
 *     └── hooks.json       # Hook definitions
 * ```
 *
 * Component detection:
 * - Manifest: Loaded from plugin.json if present, otherwise creates default
 * - Commands: Sets commandsPath if commands/ directory exists
 * - Agents: Sets agentsPath if agents/ directory exists
 * - Hooks: Loads from hooks/hooks.json if present
 *
 * The function is tolerant of missing components - a plugin can have
 * any combination of the above directories/files. Missing component files
 * are reported as errors but don't prevent plugin loading.
 *
 * @param pluginPath - Absolute path to the plugin directory
 * @param source - Source identifier (e.g., "git:repo", ".claude-plugin/my-plugin")
 * @param enabled - Initial enabled state (may be overridden by settings)
 * @param fallbackName - Name to use if manifest doesn't specify one
 * @param strict - When true, adds errors for duplicate hook files (default: true)
 * @returns Object containing the LoadedPlugin and any errors encountered
 */
function createPluginFromPath(pluginPath_1, source_1, enabled_1, fallbackName_1) {
    return __awaiter(this, arguments, void 0, function (pluginPath, source, enabled, fallbackName, strict) {
        var errors, manifestPath, manifest, plugin, _a, commandsDirExists, agentsDirExists, skillsDirExists, outputStylesDirExists, commandsPath, firstValue, commandsMetadata, validPaths, entries, checks, _i, checks_2, check, commandPaths, checks, validPaths, _b, checks_3, check, agentsPath, agentPaths, validPaths, skillsPath, skillPaths, validPaths, outputStylesPath, outputStylePaths, validPaths, mergedHooks, loadedHookPaths, standardHooksPath, _c, _d, _e, error_5, errorMsg, manifestHooksArray, _f, manifestHooksArray_1, hookSpec, hookFilePath, normalizedPath, _g, errorMsg, additionalHooks, mergeErrorMsg, error_6, errorMsg, pluginSettings;
        var _this = this;
        if (strict === void 0) { strict = true; }
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    errors = [];
                    manifestPath = (0, path_1.join)(pluginPath, '.claude-plugin', 'plugin.json');
                    return [4 /*yield*/, loadPluginManifest(manifestPath, fallbackName, source)
                        // Step 2: Create the base plugin object
                        // Start with required fields from manifest and parameters
                    ];
                case 1:
                    manifest = _h.sent();
                    plugin = {
                        name: manifest.name, // Use name from manifest (or fallback)
                        manifest: manifest, // Store full manifest for later use
                        path: pluginPath, // Absolute path to plugin directory
                        source: source, // Source identifier (e.g., "git:repo" or ".claude-plugin/name")
                        repository: source, // For backward compatibility with Plugin Repository
                        enabled: enabled,
                    };
                    return [4 /*yield*/, Promise.all([
                            !manifest.commands ? (0, file_js_1.pathExists)((0, path_1.join)(pluginPath, 'commands')) : false,
                            !manifest.agents ? (0, file_js_1.pathExists)((0, path_1.join)(pluginPath, 'agents')) : false,
                            !manifest.skills ? (0, file_js_1.pathExists)((0, path_1.join)(pluginPath, 'skills')) : false,
                            !manifest.outputStyles
                                ? (0, file_js_1.pathExists)((0, path_1.join)(pluginPath, 'output-styles'))
                                : false,
                        ])];
                case 2:
                    _a = _h.sent(), commandsDirExists = _a[0], agentsDirExists = _a[1], skillsDirExists = _a[2], outputStylesDirExists = _a[3];
                    commandsPath = (0, path_1.join)(pluginPath, 'commands');
                    if (commandsDirExists) {
                        plugin.commandsPath = commandsPath;
                    }
                    if (!manifest.commands) return [3 /*break*/, 6];
                    firstValue = Object.values(manifest.commands)[0];
                    if (!(typeof manifest.commands === 'object' &&
                        !Array.isArray(manifest.commands) &&
                        firstValue &&
                        typeof firstValue === 'object' &&
                        ('source' in firstValue || 'content' in firstValue))) return [3 /*break*/, 4];
                    commandsMetadata = {};
                    validPaths = [];
                    entries = Object.entries(manifest.commands);
                    return [4 /*yield*/, Promise.all(entries.map(function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
                            var fullPath;
                            var _c;
                            var commandName = _b[0], metadata = _b[1];
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0:
                                        if (!metadata || typeof metadata !== 'object') {
                                            return [2 /*return*/, { commandName: commandName, metadata: metadata, kind: 'skip' }];
                                        }
                                        if (!metadata.source) return [3 /*break*/, 2];
                                        fullPath = (0, path_1.join)(pluginPath, metadata.source);
                                        _c = {
                                            commandName: commandName,
                                            metadata: metadata,
                                            kind: 'source',
                                            fullPath: fullPath
                                        };
                                        return [4 /*yield*/, (0, file_js_1.pathExists)(fullPath)];
                                    case 1: return [2 /*return*/, (_c.exists = _d.sent(),
                                            _c)];
                                    case 2:
                                        if (metadata.content) {
                                            return [2 /*return*/, { commandName: commandName, metadata: metadata, kind: 'content' }];
                                        }
                                        return [2 /*return*/, { commandName: commandName, metadata: metadata, kind: 'skip' }];
                                }
                            });
                        }); }))];
                case 3:
                    checks = _h.sent();
                    for (_i = 0, checks_2 = checks; _i < checks_2.length; _i++) {
                        check = checks_2[_i];
                        if (check.kind === 'skip')
                            continue;
                        if (check.kind === 'content') {
                            // For inline content commands, add metadata without path
                            commandsMetadata[check.commandName] = check.metadata;
                            continue;
                        }
                        // kind === 'source'
                        if (check.exists) {
                            validPaths.push(check.fullPath);
                            commandsMetadata[check.commandName] = check.metadata;
                        }
                        else {
                            (0, debug_js_1.logForDebugging)("Command ".concat(check.commandName, " path ").concat(check.metadata.source, " specified in manifest but not found at ").concat(check.fullPath, " for ").concat(manifest.name), { level: 'warn' });
                            (0, log_js_1.logError)(new Error("Plugin component file not found: ".concat(check.fullPath, " for ").concat(manifest.name)));
                            errors.push({
                                type: 'path-not-found',
                                source: source,
                                plugin: manifest.name,
                                path: check.fullPath,
                                component: 'commands',
                            });
                        }
                    }
                    // Set commandsPaths if there are file-based commands
                    if (validPaths.length > 0) {
                        plugin.commandsPaths = validPaths;
                    }
                    // Set commandsMetadata if there are any commands (file-based or inline)
                    if (Object.keys(commandsMetadata).length > 0) {
                        plugin.commandsMetadata = commandsMetadata;
                    }
                    return [3 /*break*/, 6];
                case 4:
                    commandPaths = Array.isArray(manifest.commands)
                        ? manifest.commands
                        : [manifest.commands];
                    return [4 /*yield*/, Promise.all(commandPaths.map(function (cmdPath) { return __awaiter(_this, void 0, void 0, function () {
                            var fullPath;
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        if (typeof cmdPath !== 'string') {
                                            return [2 /*return*/, { cmdPath: cmdPath, kind: 'invalid' }];
                                        }
                                        fullPath = (0, path_1.join)(pluginPath, cmdPath);
                                        _a = {
                                            cmdPath: cmdPath,
                                            kind: 'path',
                                            fullPath: fullPath
                                        };
                                        return [4 /*yield*/, (0, file_js_1.pathExists)(fullPath)];
                                    case 1: return [2 /*return*/, (_a.exists = _b.sent(),
                                            _a)];
                                }
                            });
                        }); }))];
                case 5:
                    checks = _h.sent();
                    validPaths = [];
                    for (_b = 0, checks_3 = checks; _b < checks_3.length; _b++) {
                        check = checks_3[_b];
                        if (check.kind === 'invalid') {
                            (0, debug_js_1.logForDebugging)("Unexpected command format in manifest for ".concat(manifest.name), { level: 'error' });
                            continue;
                        }
                        if (check.exists) {
                            validPaths.push(check.fullPath);
                        }
                        else {
                            (0, debug_js_1.logForDebugging)("Command path ".concat(check.cmdPath, " specified in manifest but not found at ").concat(check.fullPath, " for ").concat(manifest.name), { level: 'warn' });
                            (0, log_js_1.logError)(new Error("Plugin component file not found: ".concat(check.fullPath, " for ").concat(manifest.name)));
                            errors.push({
                                type: 'path-not-found',
                                source: source,
                                plugin: manifest.name,
                                path: check.fullPath,
                                component: 'commands',
                            });
                        }
                    }
                    if (validPaths.length > 0) {
                        plugin.commandsPaths = validPaths;
                    }
                    _h.label = 6;
                case 6:
                    agentsPath = (0, path_1.join)(pluginPath, 'agents');
                    if (agentsDirExists) {
                        plugin.agentsPath = agentsPath;
                    }
                    if (!manifest.agents) return [3 /*break*/, 8];
                    agentPaths = Array.isArray(manifest.agents)
                        ? manifest.agents
                        : [manifest.agents];
                    return [4 /*yield*/, validatePluginPaths(agentPaths, pluginPath, manifest.name, source, 'agents', 'Agent', 'specified in manifest but', errors)];
                case 7:
                    validPaths = _h.sent();
                    if (validPaths.length > 0) {
                        plugin.agentsPaths = validPaths;
                    }
                    _h.label = 8;
                case 8:
                    skillsPath = (0, path_1.join)(pluginPath, 'skills');
                    if (skillsDirExists) {
                        plugin.skillsPath = skillsPath;
                    }
                    if (!manifest.skills) return [3 /*break*/, 10];
                    skillPaths = Array.isArray(manifest.skills)
                        ? manifest.skills
                        : [manifest.skills];
                    return [4 /*yield*/, validatePluginPaths(skillPaths, pluginPath, manifest.name, source, 'skills', 'Skill', 'specified in manifest but', errors)];
                case 9:
                    validPaths = _h.sent();
                    if (validPaths.length > 0) {
                        plugin.skillsPaths = validPaths;
                    }
                    _h.label = 10;
                case 10:
                    outputStylesPath = (0, path_1.join)(pluginPath, 'output-styles');
                    if (outputStylesDirExists) {
                        plugin.outputStylesPath = outputStylesPath;
                    }
                    if (!manifest.outputStyles) return [3 /*break*/, 12];
                    outputStylePaths = Array.isArray(manifest.outputStyles)
                        ? manifest.outputStyles
                        : [manifest.outputStyles];
                    return [4 /*yield*/, validatePluginPaths(outputStylePaths, pluginPath, manifest.name, source, 'output-styles', 'Output style', 'specified in manifest but', errors)];
                case 11:
                    validPaths = _h.sent();
                    if (validPaths.length > 0) {
                        plugin.outputStylesPaths = validPaths;
                    }
                    _h.label = 12;
                case 12:
                    loadedHookPaths = new Set() // Track loaded hook files
                    ;
                    standardHooksPath = (0, path_1.join)(pluginPath, 'hooks', 'hooks.json');
                    return [4 /*yield*/, (0, file_js_1.pathExists)(standardHooksPath)];
                case 13:
                    if (!_h.sent()) return [3 /*break*/, 21];
                    _h.label = 14;
                case 14:
                    _h.trys.push([14, 20, , 21]);
                    return [4 /*yield*/, loadPluginHooks(standardHooksPath, manifest.name)
                        // Track the normalized path to prevent duplicate loading
                    ];
                case 15:
                    mergedHooks = _h.sent();
                    _h.label = 16;
                case 16:
                    _h.trys.push([16, 18, , 19]);
                    _d = (_c = loadedHookPaths).add;
                    return [4 /*yield*/, (0, promises_1.realpath)(standardHooksPath)];
                case 17:
                    _d.apply(_c, [_h.sent()]);
                    return [3 /*break*/, 19];
                case 18:
                    _e = _h.sent();
                    // If realpathSync fails, use original path
                    loadedHookPaths.add(standardHooksPath);
                    return [3 /*break*/, 19];
                case 19:
                    (0, debug_js_1.logForDebugging)("Loaded hooks from standard location for plugin ".concat(manifest.name, ": ").concat(standardHooksPath));
                    return [3 /*break*/, 21];
                case 20:
                    error_5 = _h.sent();
                    errorMsg = (0, errors_js_1.errorMessage)(error_5);
                    (0, debug_js_1.logForDebugging)("Failed to load hooks for ".concat(manifest.name, ": ").concat(errorMsg), {
                        level: 'error',
                    });
                    (0, log_js_1.logError)((0, errors_js_1.toError)(error_5));
                    errors.push({
                        type: 'hook-load-failed',
                        source: source,
                        plugin: manifest.name,
                        hookPath: standardHooksPath,
                        reason: errorMsg,
                    });
                    return [3 /*break*/, 21];
                case 21:
                    if (!manifest.hooks) return [3 /*break*/, 34];
                    manifestHooksArray = Array.isArray(manifest.hooks)
                        ? manifest.hooks
                        : [manifest.hooks];
                    _f = 0, manifestHooksArray_1 = manifestHooksArray;
                    _h.label = 22;
                case 22:
                    if (!(_f < manifestHooksArray_1.length)) return [3 /*break*/, 34];
                    hookSpec = manifestHooksArray_1[_f];
                    if (!(typeof hookSpec === 'string')) return [3 /*break*/, 32];
                    hookFilePath = (0, path_1.join)(pluginPath, hookSpec);
                    return [4 /*yield*/, (0, file_js_1.pathExists)(hookFilePath)];
                case 23:
                    if (!(_h.sent())) {
                        (0, debug_js_1.logForDebugging)("Hooks file ".concat(hookSpec, " specified in manifest but not found at ").concat(hookFilePath, " for ").concat(manifest.name), { level: 'error' });
                        (0, log_js_1.logError)(new Error("Plugin component file not found: ".concat(hookFilePath, " for ").concat(manifest.name)));
                        errors.push({
                            type: 'path-not-found',
                            source: source,
                            plugin: manifest.name,
                            path: hookFilePath,
                            component: 'hooks',
                        });
                        return [3 /*break*/, 33];
                    }
                    normalizedPath = void 0;
                    _h.label = 24;
                case 24:
                    _h.trys.push([24, 26, , 27]);
                    return [4 /*yield*/, (0, promises_1.realpath)(hookFilePath)];
                case 25:
                    normalizedPath = _h.sent();
                    return [3 /*break*/, 27];
                case 26:
                    _g = _h.sent();
                    // If realpathSync fails, use original path
                    normalizedPath = hookFilePath;
                    return [3 /*break*/, 27];
                case 27:
                    if (loadedHookPaths.has(normalizedPath)) {
                        (0, debug_js_1.logForDebugging)("Skipping duplicate hooks file for plugin ".concat(manifest.name, ": ").concat(hookSpec, " ") +
                            "(resolves to already-loaded file: ".concat(normalizedPath, ")"));
                        if (strict) {
                            errorMsg = "Duplicate hooks file detected: ".concat(hookSpec, " resolves to already-loaded file ").concat(normalizedPath, ". The standard hooks/hooks.json is loaded automatically, so manifest.hooks should only reference additional hook files.");
                            (0, log_js_1.logError)(new Error(errorMsg));
                            errors.push({
                                type: 'hook-load-failed',
                                source: source,
                                plugin: manifest.name,
                                hookPath: hookFilePath,
                                reason: errorMsg,
                            });
                        }
                        return [3 /*break*/, 33];
                    }
                    _h.label = 28;
                case 28:
                    _h.trys.push([28, 30, , 31]);
                    return [4 /*yield*/, loadPluginHooks(hookFilePath, manifest.name)];
                case 29:
                    additionalHooks = _h.sent();
                    try {
                        mergedHooks = mergeHooksSettings(mergedHooks, additionalHooks);
                        loadedHookPaths.add(normalizedPath);
                        (0, debug_js_1.logForDebugging)("Loaded and merged hooks from manifest for plugin ".concat(manifest.name, ": ").concat(hookSpec));
                    }
                    catch (mergeError) {
                        mergeErrorMsg = (0, errors_js_1.errorMessage)(mergeError);
                        (0, debug_js_1.logForDebugging)("Failed to merge hooks from ".concat(hookSpec, " for ").concat(manifest.name, ": ").concat(mergeErrorMsg), { level: 'error' });
                        (0, log_js_1.logError)((0, errors_js_1.toError)(mergeError));
                        errors.push({
                            type: 'hook-load-failed',
                            source: source,
                            plugin: manifest.name,
                            hookPath: hookFilePath,
                            reason: "Failed to merge: ".concat(mergeErrorMsg),
                        });
                    }
                    return [3 /*break*/, 31];
                case 30:
                    error_6 = _h.sent();
                    errorMsg = (0, errors_js_1.errorMessage)(error_6);
                    (0, debug_js_1.logForDebugging)("Failed to load hooks from ".concat(hookSpec, " for ").concat(manifest.name, ": ").concat(errorMsg), { level: 'error' });
                    (0, log_js_1.logError)((0, errors_js_1.toError)(error_6));
                    errors.push({
                        type: 'hook-load-failed',
                        source: source,
                        plugin: manifest.name,
                        hookPath: hookFilePath,
                        reason: errorMsg,
                    });
                    return [3 /*break*/, 31];
                case 31: return [3 /*break*/, 33];
                case 32:
                    if (typeof hookSpec === 'object') {
                        // Inline hooks
                        mergedHooks = mergeHooksSettings(mergedHooks, hookSpec);
                    }
                    _h.label = 33;
                case 33:
                    _f++;
                    return [3 /*break*/, 22];
                case 34:
                    if (mergedHooks) {
                        plugin.hooksConfig = mergedHooks;
                    }
                    return [4 /*yield*/, loadPluginSettings(pluginPath, manifest)];
                case 35:
                    pluginSettings = _h.sent();
                    if (pluginSettings) {
                        plugin.settings = pluginSettings;
                    }
                    return [2 /*return*/, { plugin: plugin, errors: errors }];
            }
        });
    });
}
/**
 * Schema derived from SettingsSchema that only keeps keys plugins are allowed to set.
 * Uses .strip() so unknown keys are silently removed during parsing.
 */
var PluginSettingsSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return (0, types_js_1.SettingsSchema)()
        .pick({
        agent: true,
    })
        .strip();
});
/**
 * Parse raw settings through PluginSettingsSchema, returning only allowlisted keys.
 * Returns undefined if parsing fails or all keys are filtered out.
 */
function parsePluginSettings(raw) {
    var result = PluginSettingsSchema().safeParse(raw);
    if (!result.success) {
        return undefined;
    }
    var data = result.data;
    if (Object.keys(data).length === 0) {
        return undefined;
    }
    return data;
}
/**
 * Load plugin settings from settings.json file or manifest.settings.
 * settings.json takes priority over manifest.settings when both exist.
 * Only allowlisted keys are included in the result.
 */
function loadPluginSettings(pluginPath, manifest) {
    return __awaiter(this, void 0, void 0, function () {
        var settingsJsonPath, content, parsed, filtered, e_3, filtered;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    settingsJsonPath = (0, path_1.join)(pluginPath, 'settings.json');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readFile)(settingsJsonPath, { encoding: 'utf-8' })];
                case 2:
                    content = _a.sent();
                    parsed = (0, slowOperations_js_1.jsonParse)(content);
                    if (isRecord(parsed)) {
                        filtered = parsePluginSettings(parsed);
                        if (filtered) {
                            (0, debug_js_1.logForDebugging)("Loaded settings from settings.json for plugin ".concat(manifest.name));
                            return [2 /*return*/, filtered];
                        }
                    }
                    return [3 /*break*/, 4];
                case 3:
                    e_3 = _a.sent();
                    // Missing/inaccessible is expected - settings.json is optional
                    if (!(0, errors_js_1.isFsInaccessible)(e_3)) {
                        (0, debug_js_1.logForDebugging)("Failed to parse settings.json for plugin ".concat(manifest.name, ": ").concat(e_3), { level: 'warn' });
                    }
                    return [3 /*break*/, 4];
                case 4:
                    // Fall back to manifest.settings
                    if (manifest.settings) {
                        filtered = parsePluginSettings(manifest.settings);
                        if (filtered) {
                            (0, debug_js_1.logForDebugging)("Loaded settings from manifest for plugin ".concat(manifest.name));
                            return [2 /*return*/, filtered];
                        }
                    }
                    return [2 /*return*/, undefined];
            }
        });
    });
}
/**
 * Merge two HooksSettings objects
 */
function mergeHooksSettings(base, additional) {
    if (!base) {
        return additional;
    }
    var merged = __assign({}, base);
    for (var _i = 0, _a = Object.entries(additional); _i < _a.length; _i++) {
        var _b = _a[_i], event_1 = _b[0], matchers = _b[1];
        if (!merged[event_1]) {
            merged[event_1] = matchers;
        }
        else {
            // Merge matchers for this event
            merged[event_1] = __spreadArray(__spreadArray([], (merged[event_1] || []), true), matchers, true);
        }
    }
    return merged;
}
/**
 * Shared discovery/policy/merge pipeline for both load modes.
 *
 * Resolves enabledPlugins → marketplace entries, runs enterprise policy
 * checks, pre-loads catalogs, then dispatches each entry to the full or
 * cache-only per-entry loader. The ONLY difference between loadAllPlugins
 * and loadAllPluginsCacheOnly is which loader runs — discovery and policy
 * are identical.
 */
function loadPluginsFromMarketplaces(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var settings, enabledPlugins, plugins, errors, marketplacePluginEntries, knownMarketplaces, strictAllowlist, blocklist, hasEnterprisePolicy, uniqueMarketplaces, marketplaceCatalogs, installedPluginsData, results, _i, _c, _d, i, result, err, pluginId;
        var _this = this;
        var cacheOnly = _b.cacheOnly;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    settings = (0, settings_js_1.getSettings_DEPRECATED)();
                    enabledPlugins = __assign(__assign({}, (0, addDirPluginSettings_js_1.getAddDirEnabledPlugins)()), (settings.enabledPlugins || {}));
                    plugins = [];
                    errors = [];
                    marketplacePluginEntries = Object.entries(enabledPlugins).filter(function (_a) {
                        var key = _a[0], value = _a[1];
                        // Check if it's in plugin@marketplace format (includes both enabled and disabled)
                        var isValidFormat = (0, schemas_js_1.PluginIdSchema)().safeParse(key).success;
                        if (!isValidFormat || value === undefined)
                            return false;
                        // Skip built-in plugins — handled separately by getBuiltinPlugins()
                        var marketplace = (0, pluginIdentifier_js_1.parsePluginIdentifier)(key).marketplace;
                        return marketplace !== builtinPlugins_js_1.BUILTIN_MARKETPLACE_NAME;
                    });
                    return [4 /*yield*/, (0, marketplaceManager_js_1.loadKnownMarketplacesConfigSafe)()
                        // Fail-closed guard for enterprise policy: if a policy IS configured and we
                        // cannot resolve a marketplace's source (config returned {} due to corruption,
                        // or entry missing), we must NOT silently skip the policy check and load the
                        // plugin anyway. Before Safe, a corrupted config crashed everything (loud,
                        // fail-closed). With Safe + no guard, the policy check short-circuits on
                        // undefined marketplaceConfig and the fallback path (getPluginByIdCacheOnly)
                        // loads the plugin unchecked — a silent fail-open. This guard restores
                        // fail-closed: unknown source + active policy → block.
                        //
                        // Allowlist: any value (including []) is active — empty allowlist = deny all.
                        // Blocklist: empty [] is a semantic no-op — only non-empty counts as active.
                    ];
                case 1:
                    knownMarketplaces = _e.sent();
                    strictAllowlist = (0, marketplaceHelpers_js_1.getStrictKnownMarketplaces)();
                    blocklist = (0, marketplaceHelpers_js_1.getBlockedMarketplaces)();
                    hasEnterprisePolicy = strictAllowlist !== null || (blocklist !== null && blocklist.length > 0);
                    uniqueMarketplaces = new Set(marketplacePluginEntries
                        .map(function (_a) {
                        var pluginId = _a[0];
                        return (0, pluginIdentifier_js_1.parsePluginIdentifier)(pluginId).marketplace;
                    })
                        .filter(function (m) { return !!m; }));
                    marketplaceCatalogs = new Map();
                    return [4 /*yield*/, Promise.all(__spreadArray([], uniqueMarketplaces, true).map(function (name) { return __awaiter(_this, void 0, void 0, function () {
                            var _a, _b, _c;
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0:
                                        _b = (_a = marketplaceCatalogs).set;
                                        _c = [name];
                                        return [4 /*yield*/, (0, marketplaceManager_js_1.getMarketplaceCacheOnly)(name)];
                                    case 1:
                                        _b.apply(_a, _c.concat([_d.sent()]));
                                        return [2 /*return*/];
                                }
                            });
                        }); }))
                        // Look up installed versions once so the first-pass ZIP cache check
                        // can hit even when the marketplace entry omits `version`.
                    ];
                case 2:
                    _e.sent();
                    installedPluginsData = (0, installedPluginsManager_js_1.getInMemoryInstalledPlugins)();
                    return [4 /*yield*/, Promise.allSettled(marketplacePluginEntries.map(function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
                            var _c, pluginName, marketplaceName, marketplaceConfig, isBlocked, allowlist, result, marketplace, entry, installEntry;
                            var _d;
                            var pluginId = _b[0], enabledValue = _b[1];
                            return __generator(this, function (_e) {
                                switch (_e.label) {
                                    case 0:
                                        _c = (0, pluginIdentifier_js_1.parsePluginIdentifier)(pluginId), pluginName = _c.name, marketplaceName = _c.marketplace;
                                        marketplaceConfig = knownMarketplaces[marketplaceName];
                                        // Fail-closed: if enterprise policy is active and we can't look up the
                                        // marketplace source (config corrupted/empty, or entry missing), block
                                        // rather than silently skip the policy check. See hasEnterprisePolicy
                                        // comment above for the fail-open hazard this guards against.
                                        //
                                        // This also fires for the "stale enabledPlugins entry with no registered
                                        // marketplace" case, which is a UX trade-off: the user gets a policy
                                        // error instead of plugin-not-found. Accepted because the fallback path
                                        // (getPluginByIdCacheOnly) does a raw cast of known_marketplaces.json
                                        // with NO schema validation — if one entry is malformed enough to fail
                                        // our validation but readable enough for the raw cast, it would load
                                        // unchecked. Unverifiable source + active policy → block, always.
                                        if (!marketplaceConfig && hasEnterprisePolicy) {
                                            // We can't know whether the unverifiable source would actually be in
                                            // the blocklist or not in the allowlist — so pick the error variant
                                            // that matches whichever policy IS configured. If an allowlist exists,
                                            // "not in allowed list" is the right framing; if only a blocklist
                                            // exists, "blocked by blocklist" is less misleading than showing an
                                            // empty allowed-sources list.
                                            errors.push({
                                                type: 'marketplace-blocked-by-policy',
                                                source: pluginId,
                                                plugin: pluginName,
                                                marketplace: marketplaceName,
                                                blockedByBlocklist: strictAllowlist === null,
                                                allowedSources: (strictAllowlist !== null && strictAllowlist !== void 0 ? strictAllowlist : []).map(function (s) {
                                                    return (0, marketplaceHelpers_js_1.formatSourceForDisplay)(s);
                                                }),
                                            });
                                            return [2 /*return*/, null];
                                        }
                                        if (marketplaceConfig &&
                                            !(0, marketplaceHelpers_js_1.isSourceAllowedByPolicy)(marketplaceConfig.source)) {
                                            isBlocked = (0, marketplaceHelpers_js_1.isSourceInBlocklist)(marketplaceConfig.source);
                                            allowlist = (0, marketplaceHelpers_js_1.getStrictKnownMarketplaces)() || [];
                                            errors.push({
                                                type: 'marketplace-blocked-by-policy',
                                                source: pluginId,
                                                plugin: pluginName,
                                                marketplace: marketplaceName,
                                                blockedByBlocklist: isBlocked,
                                                allowedSources: isBlocked
                                                    ? []
                                                    : allowlist.map(function (s) { return (0, marketplaceHelpers_js_1.formatSourceForDisplay)(s); }),
                                            });
                                            return [2 /*return*/, null];
                                        }
                                        result = null;
                                        marketplace = marketplaceCatalogs.get(marketplaceName);
                                        if (!(marketplace && marketplaceConfig)) return [3 /*break*/, 1];
                                        entry = marketplace.plugins.find(function (p) { return p.name === pluginName; });
                                        if (entry) {
                                            result = {
                                                entry: entry,
                                                marketplaceInstallLocation: marketplaceConfig.installLocation,
                                            };
                                        }
                                        return [3 /*break*/, 3];
                                    case 1: return [4 /*yield*/, (0, marketplaceManager_js_1.getPluginByIdCacheOnly)(pluginId)];
                                    case 2:
                                        result = _e.sent();
                                        _e.label = 3;
                                    case 3:
                                        if (!result) {
                                            errors.push({
                                                type: 'plugin-not-found',
                                                source: pluginId,
                                                pluginId: pluginName,
                                                marketplace: marketplaceName,
                                            });
                                            return [2 /*return*/, null];
                                        }
                                        installEntry = (_d = installedPluginsData.plugins[pluginId]) === null || _d === void 0 ? void 0 : _d[0];
                                        return [2 /*return*/, cacheOnly
                                                ? loadPluginFromMarketplaceEntryCacheOnly(result.entry, result.marketplaceInstallLocation, pluginId, enabledValue === true, errors, installEntry === null || installEntry === void 0 ? void 0 : installEntry.installPath)
                                                : loadPluginFromMarketplaceEntry(result.entry, result.marketplaceInstallLocation, pluginId, enabledValue === true, errors, installEntry === null || installEntry === void 0 ? void 0 : installEntry.version)];
                                }
                            });
                        }); }))];
                case 3:
                    results = _e.sent();
                    for (_i = 0, _c = results.entries(); _i < _c.length; _i++) {
                        _d = _c[_i], i = _d[0], result = _d[1];
                        if (result.status === 'fulfilled' && result.value) {
                            plugins.push(result.value);
                        }
                        else if (result.status === 'rejected') {
                            err = (0, errors_js_1.toError)(result.reason);
                            (0, log_js_1.logError)(err);
                            pluginId = marketplacePluginEntries[i][0];
                            errors.push({
                                type: 'generic-error',
                                source: pluginId,
                                plugin: pluginId.split('@')[0],
                                error: err.message,
                            });
                        }
                    }
                    return [2 /*return*/, { plugins: plugins, errors: errors }];
            }
        });
    });
}
/**
 * Cache-only variant of loadPluginFromMarketplaceEntry.
 *
 * Skips network (cachePlugin) and disk-copy (copyPluginToVersionedCache).
 * Reads directly from the recorded installPath; if missing, emits
 * 'plugin-cache-miss'. Still extracts ZIP-cached plugins (local, fast).
 */
function loadPluginFromMarketplaceEntryCacheOnly(entry, marketplaceInstallLocation, pluginId, enabled, errorsOut, installPath) {
    return __awaiter(this, void 0, void 0, function () {
        var pluginPath, marketplaceDir, _a, _b, sessionDir, extractDir, error_7;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!(typeof entry.source === 'string')) return [3 /*break*/, 5];
                    marketplaceDir = void 0;
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.stat)(marketplaceInstallLocation)];
                case 2:
                    marketplaceDir = (_c.sent()).isDirectory()
                        ? marketplaceInstallLocation
                        : (0, path_1.join)(marketplaceInstallLocation, '..');
                    return [3 /*break*/, 4];
                case 3:
                    _a = _c.sent();
                    errorsOut.push({
                        type: 'plugin-cache-miss',
                        source: pluginId,
                        plugin: entry.name,
                        installPath: marketplaceInstallLocation,
                    });
                    return [2 /*return*/, null];
                case 4:
                    pluginPath = (0, path_1.join)(marketplaceDir, entry.source);
                    return [3 /*break*/, 8];
                case 5:
                    _b = !installPath;
                    if (_b) return [3 /*break*/, 7];
                    return [4 /*yield*/, (0, file_js_1.pathExists)(installPath)];
                case 6:
                    _b = !(_c.sent());
                    _c.label = 7;
                case 7:
                    // External source (npm/github/url/git-subdir) — use recorded installPath.
                    if (_b) {
                        errorsOut.push({
                            type: 'plugin-cache-miss',
                            source: pluginId,
                            plugin: entry.name,
                            installPath: installPath !== null && installPath !== void 0 ? installPath : '(not recorded)',
                        });
                        return [2 /*return*/, null];
                    }
                    pluginPath = installPath;
                    _c.label = 8;
                case 8:
                    if (!((0, zipCache_js_1.isPluginZipCacheEnabled)() && pluginPath.endsWith('.zip'))) return [3 /*break*/, 13];
                    return [4 /*yield*/, (0, zipCache_js_1.getSessionPluginCachePath)()];
                case 9:
                    sessionDir = _c.sent();
                    extractDir = (0, path_1.join)(sessionDir, pluginId.replace(/[^a-zA-Z0-9@\-_]/g, '-'));
                    _c.label = 10;
                case 10:
                    _c.trys.push([10, 12, , 13]);
                    return [4 /*yield*/, (0, zipCache_js_1.extractZipToDirectory)(pluginPath, extractDir)];
                case 11:
                    _c.sent();
                    pluginPath = extractDir;
                    return [3 /*break*/, 13];
                case 12:
                    error_7 = _c.sent();
                    (0, debug_js_1.logForDebugging)("Failed to extract plugin ZIP ".concat(pluginPath, ": ").concat(error_7), {
                        level: 'error',
                    });
                    errorsOut.push({
                        type: 'plugin-cache-miss',
                        source: pluginId,
                        plugin: entry.name,
                        installPath: pluginPath,
                    });
                    return [2 /*return*/, null];
                case 13: 
                // Delegate to the shared tail — identical to the full loader from here
                return [2 /*return*/, finishLoadingPluginFromPath(entry, pluginId, enabled, errorsOut, pluginPath)];
            }
        });
    });
}
/**
 * Load a plugin from a marketplace entry based on its source configuration.
 *
 * Handles different source types:
 * - Relative path: Loads from marketplace repo directory
 * - npm/github/url: Caches then loads from cache
 *
 * @param installedVersion - Version from installed_plugins.json, used as a
 *   first-pass hint for the versioned cache lookup when the marketplace entry
 *   omits `version`. Avoids re-cloning external plugins just to discover the
 *   version we already recorded at install time.
 *
 * Returns both the loaded plugin and any errors encountered during loading.
 * Errors include missing component files and hook load failures.
 */
function loadPluginFromMarketplaceEntry(entry, marketplaceInstallLocation, pluginId, enabled, errorsOut, installedVersion) {
    return __awaiter(this, void 0, void 0, function () {
        var pluginPath, marketplaceDir, sourcePluginPath, error, manifestPath, pluginManifest, _a, version, error_8, errorMsg, version, versionedPath, zipPath, _b, seedPath, _c, _d, cached, actualVersion, _e, error_9, errorMsg, sessionDir, extractDir, error_10;
        var _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    (0, debug_js_1.logForDebugging)("Loading plugin ".concat(entry.name, " from source: ").concat((0, slowOperations_js_1.jsonStringify)(entry.source)));
                    if (!(typeof entry.source === 'string')) return [3 /*break*/, 12];
                    return [4 /*yield*/, (0, promises_1.stat)(marketplaceInstallLocation)];
                case 1:
                    marketplaceDir = (_g.sent()).isDirectory()
                        ? marketplaceInstallLocation
                        : (0, path_1.join)(marketplaceInstallLocation, '..');
                    sourcePluginPath = (0, path_1.join)(marketplaceDir, entry.source);
                    return [4 /*yield*/, (0, file_js_1.pathExists)(sourcePluginPath)];
                case 2:
                    if (!(_g.sent())) {
                        error = new Error("Plugin path not found: ".concat(sourcePluginPath));
                        (0, debug_js_1.logForDebugging)("Plugin path not found: ".concat(sourcePluginPath), {
                            level: 'error',
                        });
                        (0, log_js_1.logError)(error);
                        errorsOut.push({
                            type: 'generic-error',
                            source: pluginId,
                            error: "Plugin directory not found at path: ".concat(sourcePluginPath, ". Check that the marketplace entry has the correct path."),
                        });
                        return [2 /*return*/, null];
                    }
                    _g.label = 3;
                case 3:
                    _g.trys.push([3, 10, , 11]);
                    manifestPath = (0, path_1.join)(sourcePluginPath, '.claude-plugin', 'plugin.json');
                    pluginManifest = void 0;
                    _g.label = 4;
                case 4:
                    _g.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, loadPluginManifest(manifestPath, entry.name, entry.source)];
                case 5:
                    pluginManifest = _g.sent();
                    return [3 /*break*/, 7];
                case 6:
                    _a = _g.sent();
                    return [3 /*break*/, 7];
                case 7: return [4 /*yield*/, (0, pluginVersioning_js_1.calculatePluginVersion)(pluginId, entry.source, pluginManifest, marketplaceDir, entry.version)
                    // Copy to versioned cache
                ];
                case 8:
                    version = _g.sent();
                    return [4 /*yield*/, copyPluginToVersionedCache(sourcePluginPath, pluginId, version, entry, marketplaceDir)];
                case 9:
                    // Copy to versioned cache
                    pluginPath = _g.sent();
                    (0, debug_js_1.logForDebugging)("Resolved local plugin ".concat(entry.name, " to versioned cache: ").concat(pluginPath));
                    return [3 /*break*/, 11];
                case 10:
                    error_8 = _g.sent();
                    errorMsg = (0, errors_js_1.errorMessage)(error_8);
                    (0, debug_js_1.logForDebugging)("Failed to copy plugin ".concat(entry.name, " to versioned cache: ").concat(errorMsg, ". Using marketplace path."), { level: 'warn' });
                    pluginPath = sourcePluginPath;
                    return [3 /*break*/, 11];
                case 11: return [3 /*break*/, 34];
                case 12:
                    _g.trys.push([12, 33, , 34]);
                    return [4 /*yield*/, (0, pluginVersioning_js_1.calculatePluginVersion)(pluginId, entry.source, undefined, undefined, installedVersion !== null && installedVersion !== void 0 ? installedVersion : entry.version, 'sha' in entry.source ? entry.source.sha : undefined)];
                case 13:
                    version = _g.sent();
                    versionedPath = getVersionedCachePath(pluginId, version);
                    zipPath = getVersionedZipCachePath(pluginId, version);
                    _b = (0, zipCache_js_1.isPluginZipCacheEnabled)();
                    if (!_b) return [3 /*break*/, 15];
                    return [4 /*yield*/, (0, file_js_1.pathExists)(zipPath)];
                case 14:
                    _b = (_g.sent());
                    _g.label = 15;
                case 15:
                    if (!_b) return [3 /*break*/, 16];
                    (0, debug_js_1.logForDebugging)("Using versioned cached plugin ZIP ".concat(entry.name, " from ").concat(zipPath));
                    pluginPath = zipPath;
                    return [3 /*break*/, 32];
                case 16: return [4 /*yield*/, (0, file_js_1.pathExists)(versionedPath)];
                case 17:
                    if (!_g.sent()) return [3 /*break*/, 18];
                    (0, debug_js_1.logForDebugging)("Using versioned cached plugin ".concat(entry.name, " from ").concat(versionedPath));
                    pluginPath = versionedPath;
                    return [3 /*break*/, 32];
                case 18: return [4 /*yield*/, probeSeedCache(pluginId, version)];
                case 19:
                    if (!((_f = (_g.sent())) !== null && _f !== void 0)) return [3 /*break*/, 20];
                    _c = _f;
                    return [3 /*break*/, 24];
                case 20:
                    if (!(version === 'unknown')) return [3 /*break*/, 22];
                    return [4 /*yield*/, probeSeedCacheAnyVersion(pluginId)];
                case 21:
                    _d = _g.sent();
                    return [3 /*break*/, 23];
                case 22:
                    _d = null;
                    _g.label = 23;
                case 23:
                    _c = (_d);
                    _g.label = 24;
                case 24:
                    seedPath = _c;
                    if (!seedPath) return [3 /*break*/, 25];
                    pluginPath = seedPath;
                    (0, debug_js_1.logForDebugging)("Using seed cache for external plugin ".concat(entry.name, " at ").concat(seedPath));
                    return [3 /*break*/, 32];
                case 25: return [4 /*yield*/, cachePlugin(entry.source, {
                        manifest: { name: entry.name },
                    })
                    // If the pre-clone version was deterministic (source.sha /
                    // entry.version / installedVersion), REUSE it. The post-clone
                    // recomputation with cached.manifest can return a DIFFERENT value
                    // — manifest.version (step 1) outranks gitCommitSha (step 3) —
                    // which would cache at e.g. "2.0.0/" while every warm start
                    // probes "{sha12}-{hash}/". Mismatched keys = re-clone forever.
                    // Recomputation is only needed when pre-clone was 'unknown'
                    // (ref-tracked, no hints) — the clone is the ONLY way to learn.
                ];
                case 26:
                    cached = _g.sent();
                    if (!(version !== 'unknown')) return [3 /*break*/, 27];
                    _e = version;
                    return [3 /*break*/, 29];
                case 27: return [4 /*yield*/, (0, pluginVersioning_js_1.calculatePluginVersion)(pluginId, entry.source, cached.manifest, cached.path, installedVersion !== null && installedVersion !== void 0 ? installedVersion : entry.version, cached.gitCommitSha)
                    // Copy to versioned cache
                    // For external sources, marketplaceDir is not applicable (already downloaded)
                ];
                case 28:
                    _e = _g.sent();
                    _g.label = 29;
                case 29:
                    actualVersion = _e;
                    return [4 /*yield*/, copyPluginToVersionedCache(cached.path, pluginId, actualVersion, entry, undefined)
                        // Clean up temp path
                    ];
                case 30:
                    // Copy to versioned cache
                    // For external sources, marketplaceDir is not applicable (already downloaded)
                    pluginPath = _g.sent();
                    if (!(cached.path !== pluginPath)) return [3 /*break*/, 32];
                    return [4 /*yield*/, (0, promises_1.rm)(cached.path, { recursive: true, force: true })];
                case 31:
                    _g.sent();
                    _g.label = 32;
                case 32: return [3 /*break*/, 34];
                case 33:
                    error_9 = _g.sent();
                    errorMsg = (0, errors_js_1.errorMessage)(error_9);
                    (0, debug_js_1.logForDebugging)("Failed to cache plugin ".concat(entry.name, ": ").concat(errorMsg), {
                        level: 'error',
                    });
                    (0, log_js_1.logError)((0, errors_js_1.toError)(error_9));
                    errorsOut.push({
                        type: 'generic-error',
                        source: pluginId,
                        error: "Failed to download/cache plugin ".concat(entry.name, ": ").concat(errorMsg),
                    });
                    return [2 /*return*/, null];
                case 34:
                    if (!((0, zipCache_js_1.isPluginZipCacheEnabled)() && pluginPath.endsWith('.zip'))) return [3 /*break*/, 40];
                    return [4 /*yield*/, (0, zipCache_js_1.getSessionPluginCachePath)()];
                case 35:
                    sessionDir = _g.sent();
                    extractDir = (0, path_1.join)(sessionDir, pluginId.replace(/[^a-zA-Z0-9@\-_]/g, '-'));
                    _g.label = 36;
                case 36:
                    _g.trys.push([36, 38, , 40]);
                    return [4 /*yield*/, (0, zipCache_js_1.extractZipToDirectory)(pluginPath, extractDir)];
                case 37:
                    _g.sent();
                    (0, debug_js_1.logForDebugging)("Extracted plugin ZIP to session dir: ".concat(extractDir));
                    pluginPath = extractDir;
                    return [3 /*break*/, 40];
                case 38:
                    error_10 = _g.sent();
                    // Corrupt ZIP: delete it so next install attempt re-creates it
                    (0, debug_js_1.logForDebugging)("Failed to extract plugin ZIP ".concat(pluginPath, ", deleting corrupt file: ").concat(error_10));
                    return [4 /*yield*/, (0, promises_1.rm)(pluginPath, { force: true }).catch(function () { })];
                case 39:
                    _g.sent();
                    throw error_10;
                case 40: return [2 /*return*/, finishLoadingPluginFromPath(entry, pluginId, enabled, errorsOut, pluginPath)];
            }
        });
    });
}
/**
 * Shared tail of both loadPluginFromMarketplaceEntry variants.
 *
 * Once pluginPath is resolved (via clone, cache, or installPath lookup),
 * the rest of the load — manifest probe, createPluginFromPath, marketplace
 * entry supplementation — is identical. Extracted so the cache-only path
 * doesn't duplicate ~500 lines.
 */
function finishLoadingPluginFromPath(entry, pluginId, enabled, errorsOut, pluginPath) {
    return __awaiter(this, void 0, void 0, function () {
        var errors, manifestPath, hasManifest, _a, plugin, pluginErrors, firstValue, commandsMetadata, validPaths, entries, checks, _i, checks_4, check, commandPaths, checks, validPaths, _b, checks_5, check, agentPaths, validPaths, skillPaths, checks, validPaths, _c, checks_6, _d, skillPath, fullPath, exists, outputStylePaths, validPaths, error, firstValue, commandsMetadata, validPaths, entries, checks, _e, checks_7, check, commandPaths, checks, validPaths, _f, checks_8, check, agentPaths, validPaths, skillPaths, validPaths, outputStylePaths, validPaths;
        var _this = this;
        var _g;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    errors = [];
                    manifestPath = (0, path_1.join)(pluginPath, '.claude-plugin', 'plugin.json');
                    return [4 /*yield*/, (0, file_js_1.pathExists)(manifestPath)];
                case 1:
                    hasManifest = _h.sent();
                    return [4 /*yield*/, createPluginFromPath(pluginPath, pluginId, enabled, entry.name, (_g = entry.strict) !== null && _g !== void 0 ? _g : true)];
                case 2:
                    _a = _h.sent(), plugin = _a.plugin, pluginErrors = _a.errors;
                    errors.push.apply(errors, pluginErrors);
                    // Set sha from source if available (for github and url source types)
                    if (typeof entry.source === 'object' &&
                        'sha' in entry.source &&
                        entry.source.sha) {
                        plugin.sha = entry.source.sha;
                    }
                    if (!!hasManifest) return [3 /*break*/, 14];
                    plugin.manifest = __assign(__assign({}, entry), { id: undefined, source: undefined, strict: undefined });
                    plugin.name = plugin.manifest.name;
                    if (!entry.commands) return [3 /*break*/, 6];
                    firstValue = Object.values(entry.commands)[0];
                    if (!(typeof entry.commands === 'object' &&
                        !Array.isArray(entry.commands) &&
                        firstValue &&
                        typeof firstValue === 'object' &&
                        ('source' in firstValue || 'content' in firstValue))) return [3 /*break*/, 4];
                    commandsMetadata = {};
                    validPaths = [];
                    entries = Object.entries(entry.commands);
                    return [4 /*yield*/, Promise.all(entries.map(function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
                            var fullPath;
                            var _c;
                            var commandName = _b[0], metadata = _b[1];
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0:
                                        if (!metadata || typeof metadata !== 'object' || !metadata.source) {
                                            return [2 /*return*/, { commandName: commandName, metadata: metadata, skip: true }];
                                        }
                                        fullPath = (0, path_1.join)(pluginPath, metadata.source);
                                        _c = {
                                            commandName: commandName,
                                            metadata: metadata,
                                            skip: false,
                                            fullPath: fullPath
                                        };
                                        return [4 /*yield*/, (0, file_js_1.pathExists)(fullPath)];
                                    case 1: return [2 /*return*/, (_c.exists = _d.sent(),
                                            _c)];
                                }
                            });
                        }); }))];
                case 3:
                    checks = _h.sent();
                    for (_i = 0, checks_4 = checks; _i < checks_4.length; _i++) {
                        check = checks_4[_i];
                        if (check.skip)
                            continue;
                        if (check.exists) {
                            validPaths.push(check.fullPath);
                            commandsMetadata[check.commandName] = check.metadata;
                        }
                        else {
                            (0, debug_js_1.logForDebugging)("Command ".concat(check.commandName, " path ").concat(check.metadata.source, " from marketplace entry not found at ").concat(check.fullPath, " for ").concat(entry.name), { level: 'warn' });
                            (0, log_js_1.logError)(new Error("Plugin component file not found: ".concat(check.fullPath, " for ").concat(entry.name)));
                            errors.push({
                                type: 'path-not-found',
                                source: pluginId,
                                plugin: entry.name,
                                path: check.fullPath,
                                component: 'commands',
                            });
                        }
                    }
                    if (validPaths.length > 0) {
                        plugin.commandsPaths = validPaths;
                        plugin.commandsMetadata = commandsMetadata;
                    }
                    return [3 /*break*/, 6];
                case 4:
                    commandPaths = Array.isArray(entry.commands)
                        ? entry.commands
                        : [entry.commands];
                    return [4 /*yield*/, Promise.all(commandPaths.map(function (cmdPath) { return __awaiter(_this, void 0, void 0, function () {
                            var fullPath;
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        if (typeof cmdPath !== 'string') {
                                            return [2 /*return*/, { cmdPath: cmdPath, kind: 'invalid' }];
                                        }
                                        fullPath = (0, path_1.join)(pluginPath, cmdPath);
                                        _a = {
                                            cmdPath: cmdPath,
                                            kind: 'path',
                                            fullPath: fullPath
                                        };
                                        return [4 /*yield*/, (0, file_js_1.pathExists)(fullPath)];
                                    case 1: return [2 /*return*/, (_a.exists = _b.sent(),
                                            _a)];
                                }
                            });
                        }); }))];
                case 5:
                    checks = _h.sent();
                    validPaths = [];
                    for (_b = 0, checks_5 = checks; _b < checks_5.length; _b++) {
                        check = checks_5[_b];
                        if (check.kind === 'invalid') {
                            (0, debug_js_1.logForDebugging)("Unexpected command format in marketplace entry for ".concat(entry.name), { level: 'error' });
                            continue;
                        }
                        if (check.exists) {
                            validPaths.push(check.fullPath);
                        }
                        else {
                            (0, debug_js_1.logForDebugging)("Command path ".concat(check.cmdPath, " from marketplace entry not found at ").concat(check.fullPath, " for ").concat(entry.name), { level: 'warn' });
                            (0, log_js_1.logError)(new Error("Plugin component file not found: ".concat(check.fullPath, " for ").concat(entry.name)));
                            errors.push({
                                type: 'path-not-found',
                                source: pluginId,
                                plugin: entry.name,
                                path: check.fullPath,
                                component: 'commands',
                            });
                        }
                    }
                    if (validPaths.length > 0) {
                        plugin.commandsPaths = validPaths;
                    }
                    _h.label = 6;
                case 6:
                    if (!entry.agents) return [3 /*break*/, 8];
                    agentPaths = Array.isArray(entry.agents)
                        ? entry.agents
                        : [entry.agents];
                    return [4 /*yield*/, validatePluginPaths(agentPaths, pluginPath, entry.name, pluginId, 'agents', 'Agent', 'from marketplace entry', errors)];
                case 7:
                    validPaths = _h.sent();
                    if (validPaths.length > 0) {
                        plugin.agentsPaths = validPaths;
                    }
                    _h.label = 8;
                case 8:
                    if (!entry.skills) return [3 /*break*/, 10];
                    (0, debug_js_1.logForDebugging)("Processing ".concat(Array.isArray(entry.skills) ? entry.skills.length : 1, " skill paths for plugin ").concat(entry.name));
                    skillPaths = Array.isArray(entry.skills)
                        ? entry.skills
                        : [entry.skills];
                    return [4 /*yield*/, Promise.all(skillPaths.map(function (skillPath) { return __awaiter(_this, void 0, void 0, function () {
                            var fullPath;
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        fullPath = (0, path_1.join)(pluginPath, skillPath);
                                        _a = { skillPath: skillPath, fullPath: fullPath };
                                        return [4 /*yield*/, (0, file_js_1.pathExists)(fullPath)];
                                    case 1: return [2 /*return*/, (_a.exists = _b.sent(), _a)];
                                }
                            });
                        }); }))];
                case 9:
                    checks = _h.sent();
                    validPaths = [];
                    for (_c = 0, checks_6 = checks; _c < checks_6.length; _c++) {
                        _d = checks_6[_c], skillPath = _d.skillPath, fullPath = _d.fullPath, exists = _d.exists;
                        (0, debug_js_1.logForDebugging)("Checking skill path: ".concat(skillPath, " -> ").concat(fullPath, " (exists: ").concat(exists, ")"));
                        if (exists) {
                            validPaths.push(fullPath);
                        }
                        else {
                            (0, debug_js_1.logForDebugging)("Skill path ".concat(skillPath, " from marketplace entry not found at ").concat(fullPath, " for ").concat(entry.name), { level: 'warn' });
                            (0, log_js_1.logError)(new Error("Plugin component file not found: ".concat(fullPath, " for ").concat(entry.name)));
                            errors.push({
                                type: 'path-not-found',
                                source: pluginId,
                                plugin: entry.name,
                                path: fullPath,
                                component: 'skills',
                            });
                        }
                    }
                    (0, debug_js_1.logForDebugging)("Found ".concat(validPaths.length, " valid skill paths for plugin ").concat(entry.name, ", setting skillsPaths"));
                    if (validPaths.length > 0) {
                        plugin.skillsPaths = validPaths;
                    }
                    return [3 /*break*/, 11];
                case 10:
                    (0, debug_js_1.logForDebugging)("Plugin ".concat(entry.name, " has no entry.skills defined"));
                    _h.label = 11;
                case 11:
                    if (!entry.outputStyles) return [3 /*break*/, 13];
                    outputStylePaths = Array.isArray(entry.outputStyles)
                        ? entry.outputStyles
                        : [entry.outputStyles];
                    return [4 /*yield*/, validatePluginPaths(outputStylePaths, pluginPath, entry.name, pluginId, 'output-styles', 'Output style', 'from marketplace entry', errors)];
                case 12:
                    validPaths = _h.sent();
                    if (validPaths.length > 0) {
                        plugin.outputStylesPaths = validPaths;
                    }
                    _h.label = 13;
                case 13:
                    // Process inline hooks from marketplace entry
                    if (entry.hooks) {
                        plugin.hooksConfig = entry.hooks;
                    }
                    return [3 /*break*/, 26];
                case 14:
                    if (!(!entry.strict &&
                        hasManifest &&
                        (entry.commands ||
                            entry.agents ||
                            entry.skills ||
                            entry.hooks ||
                            entry.outputStyles))) return [3 /*break*/, 15];
                    error = new Error("Plugin ".concat(entry.name, " has both plugin.json and marketplace manifest entries for commands/agents/skills/hooks/outputStyles. This is a conflict."));
                    (0, debug_js_1.logForDebugging)("Plugin ".concat(entry.name, " has both plugin.json and marketplace manifest entries for commands/agents/skills/hooks/outputStyles. This is a conflict."), { level: 'error' });
                    (0, log_js_1.logError)(error);
                    errorsOut.push({
                        type: 'generic-error',
                        source: pluginId,
                        error: "Plugin ".concat(entry.name, " has conflicting manifests: both plugin.json and marketplace entry specify components. Set strict: true in marketplace entry or remove component specs from one location."),
                    });
                    return [2 /*return*/, null];
                case 15:
                    if (!hasManifest) return [3 /*break*/, 26];
                    if (!entry.commands) return [3 /*break*/, 19];
                    firstValue = Object.values(entry.commands)[0];
                    if (!(typeof entry.commands === 'object' &&
                        !Array.isArray(entry.commands) &&
                        firstValue &&
                        typeof firstValue === 'object' &&
                        ('source' in firstValue || 'content' in firstValue))) return [3 /*break*/, 17];
                    commandsMetadata = __assign({}, (plugin.commandsMetadata || {}));
                    validPaths = [];
                    entries = Object.entries(entry.commands);
                    return [4 /*yield*/, Promise.all(entries.map(function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
                            var fullPath;
                            var _c;
                            var commandName = _b[0], metadata = _b[1];
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0:
                                        if (!metadata || typeof metadata !== 'object' || !metadata.source) {
                                            return [2 /*return*/, { commandName: commandName, metadata: metadata, skip: true }];
                                        }
                                        fullPath = (0, path_1.join)(pluginPath, metadata.source);
                                        _c = {
                                            commandName: commandName,
                                            metadata: metadata,
                                            skip: false,
                                            fullPath: fullPath
                                        };
                                        return [4 /*yield*/, (0, file_js_1.pathExists)(fullPath)];
                                    case 1: return [2 /*return*/, (_c.exists = _d.sent(),
                                            _c)];
                                }
                            });
                        }); }))];
                case 16:
                    checks = _h.sent();
                    for (_e = 0, checks_7 = checks; _e < checks_7.length; _e++) {
                        check = checks_7[_e];
                        if (check.skip)
                            continue;
                        if (check.exists) {
                            validPaths.push(check.fullPath);
                            commandsMetadata[check.commandName] = check.metadata;
                        }
                        else {
                            (0, debug_js_1.logForDebugging)("Command ".concat(check.commandName, " path ").concat(check.metadata.source, " from marketplace entry not found at ").concat(check.fullPath, " for ").concat(entry.name), { level: 'warn' });
                            (0, log_js_1.logError)(new Error("Plugin component file not found: ".concat(check.fullPath, " for ").concat(entry.name)));
                            errors.push({
                                type: 'path-not-found',
                                source: pluginId,
                                plugin: entry.name,
                                path: check.fullPath,
                                component: 'commands',
                            });
                        }
                    }
                    if (validPaths.length > 0) {
                        plugin.commandsPaths = __spreadArray(__spreadArray([], (plugin.commandsPaths || []), true), validPaths, true);
                        plugin.commandsMetadata = commandsMetadata;
                    }
                    return [3 /*break*/, 19];
                case 17:
                    commandPaths = Array.isArray(entry.commands)
                        ? entry.commands
                        : [entry.commands];
                    return [4 /*yield*/, Promise.all(commandPaths.map(function (cmdPath) { return __awaiter(_this, void 0, void 0, function () {
                            var fullPath;
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        if (typeof cmdPath !== 'string') {
                                            return [2 /*return*/, { cmdPath: cmdPath, kind: 'invalid' }];
                                        }
                                        fullPath = (0, path_1.join)(pluginPath, cmdPath);
                                        _a = {
                                            cmdPath: cmdPath,
                                            kind: 'path',
                                            fullPath: fullPath
                                        };
                                        return [4 /*yield*/, (0, file_js_1.pathExists)(fullPath)];
                                    case 1: return [2 /*return*/, (_a.exists = _b.sent(),
                                            _a)];
                                }
                            });
                        }); }))];
                case 18:
                    checks = _h.sent();
                    validPaths = [];
                    for (_f = 0, checks_8 = checks; _f < checks_8.length; _f++) {
                        check = checks_8[_f];
                        if (check.kind === 'invalid') {
                            (0, debug_js_1.logForDebugging)("Unexpected command format in marketplace entry for ".concat(entry.name), { level: 'error' });
                            continue;
                        }
                        if (check.exists) {
                            validPaths.push(check.fullPath);
                        }
                        else {
                            (0, debug_js_1.logForDebugging)("Command path ".concat(check.cmdPath, " from marketplace entry not found at ").concat(check.fullPath, " for ").concat(entry.name), { level: 'warn' });
                            (0, log_js_1.logError)(new Error("Plugin component file not found: ".concat(check.fullPath, " for ").concat(entry.name)));
                            errors.push({
                                type: 'path-not-found',
                                source: pluginId,
                                plugin: entry.name,
                                path: check.fullPath,
                                component: 'commands',
                            });
                        }
                    }
                    if (validPaths.length > 0) {
                        plugin.commandsPaths = __spreadArray(__spreadArray([], (plugin.commandsPaths || []), true), validPaths, true);
                    }
                    _h.label = 19;
                case 19:
                    if (!entry.agents) return [3 /*break*/, 21];
                    agentPaths = Array.isArray(entry.agents)
                        ? entry.agents
                        : [entry.agents];
                    return [4 /*yield*/, validatePluginPaths(agentPaths, pluginPath, entry.name, pluginId, 'agents', 'Agent', 'from marketplace entry', errors)];
                case 20:
                    validPaths = _h.sent();
                    if (validPaths.length > 0) {
                        plugin.agentsPaths = __spreadArray(__spreadArray([], (plugin.agentsPaths || []), true), validPaths, true);
                    }
                    _h.label = 21;
                case 21:
                    if (!entry.skills) return [3 /*break*/, 23];
                    skillPaths = Array.isArray(entry.skills)
                        ? entry.skills
                        : [entry.skills];
                    return [4 /*yield*/, validatePluginPaths(skillPaths, pluginPath, entry.name, pluginId, 'skills', 'Skill', 'from marketplace entry', errors)];
                case 22:
                    validPaths = _h.sent();
                    if (validPaths.length > 0) {
                        plugin.skillsPaths = __spreadArray(__spreadArray([], (plugin.skillsPaths || []), true), validPaths, true);
                    }
                    _h.label = 23;
                case 23:
                    if (!entry.outputStyles) return [3 /*break*/, 25];
                    outputStylePaths = Array.isArray(entry.outputStyles)
                        ? entry.outputStyles
                        : [entry.outputStyles];
                    return [4 /*yield*/, validatePluginPaths(outputStylePaths, pluginPath, entry.name, pluginId, 'output-styles', 'Output style', 'from marketplace entry', errors)];
                case 24:
                    validPaths = _h.sent();
                    if (validPaths.length > 0) {
                        plugin.outputStylesPaths = __spreadArray(__spreadArray([], (plugin.outputStylesPaths || []), true), validPaths, true);
                    }
                    _h.label = 25;
                case 25:
                    // Supplement hooks from marketplace entry
                    if (entry.hooks) {
                        plugin.hooksConfig = __assign(__assign({}, (plugin.hooksConfig || {})), entry.hooks);
                    }
                    _h.label = 26;
                case 26:
                    errorsOut.push.apply(errorsOut, errors);
                    return [2 /*return*/, plugin];
            }
        });
    });
}
/**
 * Load session-only plugins from --plugin-dir CLI flag.
 *
 * These plugins are loaded directly without going through the marketplace system.
 * They appear with source='plugin-name@inline' and are always enabled for the current session.
 *
 * @param sessionPluginPaths - Array of plugin directory paths from CLI
 * @returns LoadedPlugin objects and any errors encountered
 */
function loadSessionOnlyPlugins(sessionPluginPaths) {
    return __awaiter(this, void 0, void 0, function () {
        var plugins, errors, _i, _a, _b, index, pluginPath, resolvedPath, dirName, _c, plugin, pluginErrors, error_11, errorMsg;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (sessionPluginPaths.length === 0) {
                        return [2 /*return*/, { plugins: [], errors: [] }];
                    }
                    plugins = [];
                    errors = [];
                    _i = 0, _a = sessionPluginPaths.entries();
                    _d.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 7];
                    _b = _a[_i], index = _b[0], pluginPath = _b[1];
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, 5, , 6]);
                    resolvedPath = (0, path_1.resolve)(pluginPath);
                    return [4 /*yield*/, (0, file_js_1.pathExists)(resolvedPath)];
                case 3:
                    if (!(_d.sent())) {
                        (0, debug_js_1.logForDebugging)("Plugin path does not exist: ".concat(resolvedPath, ", skipping"), { level: 'warn' });
                        errors.push({
                            type: 'path-not-found',
                            source: "inline[".concat(index, "]"),
                            path: resolvedPath,
                            component: 'commands',
                        });
                        return [3 /*break*/, 6];
                    }
                    dirName = (0, path_1.basename)(resolvedPath);
                    return [4 /*yield*/, createPluginFromPath(resolvedPath, "".concat(dirName, "@inline"), // temporary, will be updated after we know the real name
                        true, // always enabled
                        dirName)
                        // Update source to use the actual plugin name from manifest
                    ];
                case 4:
                    _c = _d.sent(), plugin = _c.plugin, pluginErrors = _c.errors;
                    // Update source to use the actual plugin name from manifest
                    plugin.source = "".concat(plugin.name, "@inline");
                    plugin.repository = "".concat(plugin.name, "@inline");
                    plugins.push(plugin);
                    errors.push.apply(errors, pluginErrors);
                    (0, debug_js_1.logForDebugging)("Loaded inline plugin from path: ".concat(plugin.name));
                    return [3 /*break*/, 6];
                case 5:
                    error_11 = _d.sent();
                    errorMsg = (0, errors_js_1.errorMessage)(error_11);
                    (0, debug_js_1.logForDebugging)("Failed to load session plugin from ".concat(pluginPath, ": ").concat(errorMsg), { level: 'warn' });
                    errors.push({
                        type: 'generic-error',
                        source: "inline[".concat(index, "]"),
                        error: "Failed to load plugin: ".concat(errorMsg),
                    });
                    return [3 /*break*/, 6];
                case 6:
                    _i++;
                    return [3 /*break*/, 1];
                case 7:
                    if (plugins.length > 0) {
                        (0, debug_js_1.logForDebugging)("Loaded ".concat(plugins.length, " session-only plugins from --plugin-dir"));
                    }
                    return [2 /*return*/, { plugins: plugins, errors: errors }];
            }
        });
    });
}
/**
 * Merge plugins from session (--plugin-dir), marketplace (installed), and
 * builtin sources. Session plugins override marketplace plugins with the
 * same name — the user explicitly pointed at a directory for this session.
 *
 * Exception: marketplace plugins locked by managed settings (policySettings)
 * cannot be overridden. Enterprise admin intent beats local dev convenience.
 * When a session plugin collides with a managed one, the session copy is
 * dropped and an error is returned for surfacing.
 *
 * Without this dedup, both versions sat in the array and marketplace won
 * on first-match, making --plugin-dir useless for iterating on an
 * installed plugin.
 */
function mergePluginSources(sources) {
    var errors = [];
    var managed = sources.managedNames;
    // Managed settings win over --plugin-dir. Drop session plugins whose
    // name appears in policySettings.enabledPlugins (whether force-enabled
    // OR force-disabled — both are admin intent that --plugin-dir must not
    // bypass). Surface an error so the user knows why their dev copy was
    // ignored.
    //
    // NOTE: managedNames contains the pluginId prefix (entry.name), which is
    // expected to equal manifest.name by convention (schema description at
    // schemas.ts PluginMarketplaceEntry.name). If a marketplace publishes a
    // plugin where entry.name ≠ manifest.name, this guard will silently miss —
    // but that's a marketplace misconfiguration that breaks other things too
    // (e.g., ManagePlugins constructs pluginIds from manifest.name).
    var sessionPlugins = sources.session.filter(function (p) {
        if (managed === null || managed === void 0 ? void 0 : managed.has(p.name)) {
            (0, debug_js_1.logForDebugging)("Plugin \"".concat(p.name, "\" from --plugin-dir is blocked by managed settings"), { level: 'warn' });
            errors.push({
                type: 'generic-error',
                source: p.source,
                plugin: p.name,
                error: "--plugin-dir copy of \"".concat(p.name, "\" ignored: plugin is locked by managed settings"),
            });
            return false;
        }
        return true;
    });
    var sessionNames = new Set(sessionPlugins.map(function (p) { return p.name; }));
    var marketplacePlugins = sources.marketplace.filter(function (p) {
        if (sessionNames.has(p.name)) {
            (0, debug_js_1.logForDebugging)("Plugin \"".concat(p.name, "\" from --plugin-dir overrides installed version"));
            return false;
        }
        return true;
    });
    // Session first, then non-overridden marketplace, then builtin.
    // Downstream first-match consumers see session plugins before
    // installed ones for any that slipped past the name filter.
    return {
        plugins: __spreadArray(__spreadArray(__spreadArray([], sessionPlugins, true), marketplacePlugins, true), sources.builtin, true),
        errors: errors,
    };
}
/**
 * Main plugin loading function that discovers and loads all plugins.
 *
 * This function is memoized to avoid repeated filesystem scanning and is
 * the primary entry point for the plugin system. It discovers plugins from
 * multiple sources and returns categorized results.
 *
 * Loading order and precedence (see mergePluginSources):
 * 1. Session-only plugins (from --plugin-dir CLI flag) — override
 *    installed plugins with the same name, UNLESS that plugin is
 *    locked by managed settings (policySettings, either force-enabled
 *    or force-disabled)
 * 2. Marketplace-based plugins (plugin@marketplace format from settings)
 * 3. Built-in plugins shipped with the CLI
 *
 * Name collision: session plugin wins over installed. The user explicitly
 * pointed at a directory for this session — that intent beats whatever
 * is installed. Exception: managed settings (enterprise policy) win over
 * --plugin-dir. Admin intent beats local dev convenience.
 *
 * Error collection:
 * - Non-fatal errors are collected and returned
 * - System continues loading other plugins on errors
 * - Errors include source information for debugging
 *
 * @returns Promise resolving to categorized plugin results:
 *   - enabled: Array of enabled LoadedPlugin objects
 *   - disabled: Array of disabled LoadedPlugin objects
 *   - errors: Array of loading errors with source information
 */
exports.loadAllPlugins = (0, memoize_js_1.default)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var result;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, assemblePluginLoadResult(function () {
                    return loadPluginsFromMarketplaces({ cacheOnly: false });
                })
                // A fresh full-load result is strictly valid for cache-only callers
                // (both variants share assemblePluginLoadResult). Warm the separate
                // memoize so refreshActivePlugins()'s downstream getPluginCommands() /
                // getAgentDefinitionsWithOverrides() — which now call
                // loadAllPluginsCacheOnly — see just-cloned plugins instead of reading
                // an installed_plugins.json that nothing writes mid-session.
            ];
            case 1:
                result = _b.sent();
                // A fresh full-load result is strictly valid for cache-only callers
                // (both variants share assemblePluginLoadResult). Warm the separate
                // memoize so refreshActivePlugins()'s downstream getPluginCommands() /
                // getAgentDefinitionsWithOverrides() — which now call
                // loadAllPluginsCacheOnly — see just-cloned plugins instead of reading
                // an installed_plugins.json that nothing writes mid-session.
                (_a = exports.loadAllPluginsCacheOnly.cache) === null || _a === void 0 ? void 0 : _a.set(undefined, Promise.resolve(result));
                return [2 /*return*/, result];
        }
    });
}); });
/**
 * Cache-only variant of loadAllPlugins.
 *
 * Same merge/dependency/settings logic, but the marketplace loader never
 * hits the network (no cachePlugin, no copyPluginToVersionedCache). Reads
 * from installed_plugins.json's installPath. Plugins not on disk emit
 * 'plugin-cache-miss' and are skipped.
 *
 * Use this in startup consumers (getCommands, loadPluginAgents, MCP/LSP
 * config) so interactive startup never blocks on git clones for ref-tracked
 * plugins. Use loadAllPlugins() in explicit refresh paths (/plugins,
 * refresh.ts, headlessPluginInstall) where fresh source is the intent.
 *
 * CLAUDE_CODE_SYNC_PLUGIN_INSTALL=1 delegates to the full loader — that
 * mode explicitly opts into blocking install before first query, and
 * main.tsx's getClaudeCodeMcpConfigs()/getInitialSettings().agent run
 * BEFORE runHeadless() can warm this cache. First-run CCR/headless has
 * no installed_plugins.json, so cache-only would miss plugin MCP servers
 * and plugin settings (the agent key). The interactive startup win is
 * preserved since interactive mode doesn't set SYNC_PLUGIN_INSTALL.
 *
 * Separate memoize cache from loadAllPlugins — a cache-only result must
 * never satisfy a caller that wants fresh source. The reverse IS valid:
 * loadAllPlugins warms this cache on completion so refresh paths that run
 * the full loader don't get plugin-cache-miss from their downstream
 * cache-only consumers.
 */
exports.loadAllPluginsCacheOnly = (0, memoize_js_1.default)(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_SYNC_PLUGIN_INSTALL)) {
            return [2 /*return*/, (0, exports.loadAllPlugins)()];
        }
        return [2 /*return*/, assemblePluginLoadResult(function () {
                return loadPluginsFromMarketplaces({ cacheOnly: true });
            })];
    });
}); });
/**
 * Shared body of loadAllPlugins and loadAllPluginsCacheOnly.
 *
 * The only difference between the two is which marketplace loader runs —
 * session plugins, builtins, merge, verifyAndDemote, and cachePluginSettings
 * are identical (invariants 1-3).
 */
function assemblePluginLoadResult(marketplaceLoader) {
    return __awaiter(this, void 0, void 0, function () {
        var inlinePlugins, _a, marketplaceResult, sessionResult, builtinResult, _b, allPlugins, mergeErrors, allErrors, _c, demoted, depErrors, _i, allPlugins_1, p, enabledPlugins;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    inlinePlugins = (0, state_js_1.getInlinePlugins)();
                    return [4 /*yield*/, Promise.all([
                            marketplaceLoader(),
                            inlinePlugins.length > 0
                                ? loadSessionOnlyPlugins(inlinePlugins)
                                : Promise.resolve({ plugins: [], errors: [] }),
                        ])
                        // 3. Load built-in plugins that ship with the CLI
                    ];
                case 1:
                    _a = _d.sent(), marketplaceResult = _a[0], sessionResult = _a[1];
                    builtinResult = (0, builtinPlugins_js_1.getBuiltinPlugins)();
                    _b = mergePluginSources({
                        session: sessionResult.plugins,
                        marketplace: marketplaceResult.plugins,
                        builtin: __spreadArray(__spreadArray([], builtinResult.enabled, true), builtinResult.disabled, true),
                        managedNames: (0, managedPlugins_js_1.getManagedPluginNames)(),
                    }), allPlugins = _b.plugins, mergeErrors = _b.errors;
                    allErrors = __spreadArray(__spreadArray(__spreadArray([], marketplaceResult.errors, true), sessionResult.errors, true), mergeErrors, true);
                    _c = (0, dependencyResolver_js_1.verifyAndDemote)(allPlugins), demoted = _c.demoted, depErrors = _c.errors;
                    for (_i = 0, allPlugins_1 = allPlugins; _i < allPlugins_1.length; _i++) {
                        p = allPlugins_1[_i];
                        if (demoted.has(p.source))
                            p.enabled = false;
                    }
                    allErrors.push.apply(allErrors, depErrors);
                    enabledPlugins = allPlugins.filter(function (p) { return p.enabled; });
                    (0, debug_js_1.logForDebugging)("Found ".concat(allPlugins.length, " plugins (").concat(enabledPlugins.length, " enabled, ").concat(allPlugins.length - enabledPlugins.length, " disabled)"));
                    // 3. Cache plugin settings for synchronous access by the settings cascade
                    cachePluginSettings(enabledPlugins);
                    return [2 /*return*/, {
                            enabled: enabledPlugins,
                            disabled: allPlugins.filter(function (p) { return !p.enabled; }),
                            errors: allErrors,
                        }];
            }
        });
    });
}
/**
 * Clears the memoized plugin cache.
 *
 * Call this when plugins are installed, removed, or settings change
 * to force a fresh scan on the next loadAllPlugins call.
 *
 * Use cases:
 * - After installing/uninstalling plugins
 * - After modifying .claude-plugin/ directory (for export)
 * - After changing enabledPlugins settings
 * - When debugging plugin loading issues
 */
function clearPluginCache(reason) {
    var _a, _b, _c, _d;
    if (reason) {
        (0, debug_js_1.logForDebugging)("clearPluginCache: invalidating loadAllPlugins cache (".concat(reason, ")"));
    }
    (_b = (_a = exports.loadAllPlugins.cache) === null || _a === void 0 ? void 0 : _a.clear) === null || _b === void 0 ? void 0 : _b.call(_a);
    (_d = (_c = exports.loadAllPluginsCacheOnly.cache) === null || _c === void 0 ? void 0 : _c.clear) === null || _d === void 0 ? void 0 : _d.call(_c);
    // If a plugin previously contributed settings, the session settings cache
    // holds a merged result that includes them. cachePluginSettings() on reload
    // won't bust the cache when the new base is empty (the startup perf win),
    // so bust it here to drop stale plugin overrides. When the base is already
    // undefined (startup, or no prior plugin settings) this is a no-op.
    if ((0, settingsCache_js_1.getPluginSettingsBase)() !== undefined) {
        (0, settingsCache_js_1.resetSettingsCache)();
    }
    (0, settingsCache_js_1.clearPluginSettingsBase)();
    // TODO: Clear installed plugins cache when installedPluginsManager is implemented
}
/**
 * Merge settings from all enabled plugins into a single record.
 * Later plugins override earlier ones for the same key.
 * Only allowlisted keys are included (filtering happens at load time).
 */
function mergePluginSettings(plugins) {
    var merged;
    for (var _i = 0, plugins_1 = plugins; _i < plugins_1.length; _i++) {
        var plugin = plugins_1[_i];
        if (!plugin.settings) {
            continue;
        }
        if (!merged) {
            merged = {};
        }
        for (var _a = 0, _b = Object.entries(plugin.settings); _a < _b.length; _a++) {
            var _c = _b[_a], key = _c[0], value = _c[1];
            if (key in merged) {
                (0, debug_js_1.logForDebugging)("Plugin \"".concat(plugin.name, "\" overrides setting \"").concat(key, "\" (previously set by another plugin)"));
            }
            merged[key] = value;
        }
    }
    return merged;
}
/**
 * Store merged plugin settings in the synchronous cache.
 * Called after loadAllPlugins resolves.
 */
function cachePluginSettings(plugins) {
    var settings = mergePluginSettings(plugins);
    (0, settingsCache_js_1.setPluginSettingsBase)(settings);
    // Only bust the session settings cache if there are actually plugin settings
    // to merge. In the common case (no plugins, or plugins without settings) the
    // base layer is empty and loadSettingsFromDisk would produce the same result
    // anyway — resetting here would waste ~17ms on startup re-reading and
    // re-validating every settings file on the next getSettingsWithErrors() call.
    if (settings && Object.keys(settings).length > 0) {
        (0, settingsCache_js_1.resetSettingsCache)();
        (0, debug_js_1.logForDebugging)("Cached plugin settings with keys: ".concat(Object.keys(settings).join(', ')));
    }
}
/**
 * Type predicate: check if a value is a non-null, non-array object (i.e., a record).
 */
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
