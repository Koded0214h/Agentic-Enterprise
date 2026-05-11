"use strict";
/**
 * Plugin Version Calculation Module
 *
 * Handles version calculation for plugins from various sources.
 * Versions are used for versioned cache paths and update detection.
 *
 * Version sources (in order of preference):
 * 1. Explicit version from plugin.json
 * 2. Git commit SHA (for git/github sources)
 * 3. Fallback timestamp for local sources
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
exports.calculatePluginVersion = calculatePluginVersion;
exports.getGitCommitSha = getGitCommitSha;
exports.getVersionFromPath = getVersionFromPath;
exports.isVersionedPath = isVersionedPath;
var crypto_1 = require("crypto");
var debug_js_1 = require("../debug.js");
var gitFilesystem_js_1 = require("../git/gitFilesystem.js");
/**
 * Calculate the version for a plugin based on its source.
 *
 * Version sources (in order of priority):
 * 1. plugin.json version field (highest priority)
 * 2. Provided version (typically from marketplace entry)
 * 3. Git commit SHA from install path
 * 4. 'unknown' as last resort
 *
 * @param pluginId - Plugin identifier (e.g., "plugin@marketplace")
 * @param source - Plugin source configuration (used for git-subdir path hashing)
 * @param manifest - Optional plugin manifest with version field
 * @param installPath - Optional path to installed plugin (for git SHA extraction)
 * @param providedVersion - Optional version from marketplace entry or caller
 * @param gitCommitSha - Optional pre-resolved git SHA (for sources like
 *   git-subdir where the clone is discarded and the install path has no .git)
 * @returns Version string (semver, short SHA, or 'unknown')
 */
function calculatePluginVersion(pluginId, source, manifest, installPath, providedVersion, gitCommitSha) {
    return __awaiter(this, void 0, void 0, function () {
        var shortSha, normPath, pathHash, v, sha, shortSha;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // 1. Use explicit version from plugin.json if available
                    if (manifest === null || manifest === void 0 ? void 0 : manifest.version) {
                        (0, debug_js_1.logForDebugging)("Using manifest version for ".concat(pluginId, ": ").concat(manifest.version));
                        return [2 /*return*/, manifest.version];
                    }
                    // 2. Use provided version (typically from marketplace entry)
                    if (providedVersion) {
                        (0, debug_js_1.logForDebugging)("Using provided version for ".concat(pluginId, ": ").concat(providedVersion));
                        return [2 /*return*/, providedVersion];
                    }
                    // 3. Use pre-resolved git SHA if caller captured it before discarding the clone
                    if (gitCommitSha) {
                        shortSha = gitCommitSha.substring(0, 12);
                        if (typeof source === 'object' && source.source === 'git-subdir') {
                            normPath = source.path
                                .replace(/\\/g, '/')
                                .replace(/^\.\//, '')
                                .replace(/\/+$/, '');
                            pathHash = (0, crypto_1.createHash)('sha256')
                                .update(normPath)
                                .digest('hex')
                                .substring(0, 8);
                            v = "".concat(shortSha, "-").concat(pathHash);
                            (0, debug_js_1.logForDebugging)("Using git-subdir SHA+path version for ".concat(pluginId, ": ").concat(v, " (path=").concat(normPath, ")"));
                            return [2 /*return*/, v];
                        }
                        (0, debug_js_1.logForDebugging)("Using pre-resolved git SHA for ".concat(pluginId, ": ").concat(shortSha));
                        return [2 /*return*/, shortSha];
                    }
                    if (!installPath) return [3 /*break*/, 2];
                    return [4 /*yield*/, getGitCommitSha(installPath)];
                case 1:
                    sha = _a.sent();
                    if (sha) {
                        shortSha = sha.substring(0, 12);
                        (0, debug_js_1.logForDebugging)("Using git SHA for ".concat(pluginId, ": ").concat(shortSha));
                        return [2 /*return*/, shortSha];
                    }
                    _a.label = 2;
                case 2:
                    // 5. Return 'unknown' as last resort
                    (0, debug_js_1.logForDebugging)("No version found for ".concat(pluginId, ", using 'unknown'"));
                    return [2 /*return*/, 'unknown'];
            }
        });
    });
}
/**
 * Get the git commit SHA for a directory.
 *
 * @param dirPath - Path to directory (should be a git repository)
 * @returns Full commit SHA or null if not a git repo
 */
function getGitCommitSha(dirPath) {
    return (0, gitFilesystem_js_1.getHeadForDir)(dirPath);
}
/**
 * Extract version from a versioned cache path.
 *
 * Given a path like `~/.claude/plugins/cache/marketplace/plugin/1.0.0`,
 * extracts and returns `1.0.0`.
 *
 * @param installPath - Full path to plugin installation
 * @returns Version string from path, or null if not a versioned path
 */
function getVersionFromPath(installPath) {
    // Versioned paths have format: .../plugins/cache/marketplace/plugin/version/
    var parts = installPath.split('/').filter(Boolean);
    // Find 'cache' index to determine depth
    var cacheIndex = parts.findIndex(function (part, i) { return part === 'cache' && parts[i - 1] === 'plugins'; });
    if (cacheIndex === -1) {
        return null;
    }
    // Versioned path has 3 components after 'cache': marketplace/plugin/version
    var componentsAfterCache = parts.slice(cacheIndex + 1);
    if (componentsAfterCache.length >= 3) {
        return componentsAfterCache[2] || null;
    }
    return null;
}
/**
 * Check if a path is a versioned plugin path.
 *
 * @param path - Path to check
 * @returns True if path follows versioned structure
 */
function isVersionedPath(path) {
    return getVersionFromPath(path) !== null;
}
