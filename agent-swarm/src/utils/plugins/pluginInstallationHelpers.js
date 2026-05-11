"use strict";
/**
 * Shared helper functions for plugin installation
 *
 * This module contains common utilities used across the plugin installation
 * system to reduce code duplication and improve maintainability.
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentTimestamp = getCurrentTimestamp;
exports.validatePathWithinBase = validatePathWithinBase;
exports.cacheAndRegisterPlugin = cacheAndRegisterPlugin;
exports.registerPluginInstallation = registerPluginInstallation;
exports.parsePluginId = parsePluginId;
exports.formatResolutionError = formatResolutionError;
exports.installResolvedPlugin = installResolvedPlugin;
exports.installPluginFromMarketplace = installPluginFromMarketplace;
var crypto_1 = require("crypto");
var promises_1 = require("fs/promises");
var path_1 = require("path");
var index_js_1 = require("../../services/analytics/index.js");
var cwd_js_1 = require("../cwd.js");
var errors_js_1 = require("../errors.js");
var fsOperations_js_1 = require("../fsOperations.js");
var log_js_1 = require("../log.js");
var settings_js_1 = require("../settings/settings.js");
var pluginTelemetry_js_1 = require("../telemetry/pluginTelemetry.js");
var cacheUtils_js_1 = require("./cacheUtils.js");
var dependencyResolver_js_1 = require("./dependencyResolver.js");
var installedPluginsManager_js_1 = require("./installedPluginsManager.js");
var managedPlugins_js_1 = require("./managedPlugins.js");
var marketplaceManager_js_1 = require("./marketplaceManager.js");
var pluginIdentifier_js_1 = require("./pluginIdentifier.js");
var pluginLoader_js_1 = require("./pluginLoader.js");
var pluginPolicy_js_1 = require("./pluginPolicy.js");
var pluginVersioning_js_1 = require("./pluginVersioning.js");
var schemas_js_1 = require("./schemas.js");
var zipCache_js_1 = require("./zipCache.js");
/**
 * Get current ISO timestamp
 */
function getCurrentTimestamp() {
    return new Date().toISOString();
}
/**
 * Validate that a resolved path stays within a base directory.
 * Prevents path traversal attacks where malicious paths like './../../../etc/passwd'
 * could escape the expected directory.
 *
 * @param basePath - The base directory that the resolved path must stay within
 * @param relativePath - The relative path to validate
 * @returns The validated absolute path
 * @throws Error if the path would escape the base directory
 */
function validatePathWithinBase(basePath, relativePath) {
    var resolvedPath = (0, path_1.resolve)(basePath, relativePath);
    var normalizedBase = (0, path_1.resolve)(basePath) + path_1.sep;
    // Check if the resolved path starts with the base path
    // Adding sep ensures we don't match partial directory names
    // e.g., /foo/bar should not match /foo/barbaz
    if (!resolvedPath.startsWith(normalizedBase) &&
        resolvedPath !== (0, path_1.resolve)(basePath)) {
        throw new Error("Path traversal detected: \"".concat(relativePath, "\" would escape the base directory"));
    }
    return resolvedPath;
}
/**
 * Cache a plugin (local or external) and add it to installed_plugins.json
 *
 * This function combines the common pattern of:
 * 1. Caching a plugin to ~/.claude/plugins/cache/
 * 2. Adding it to the installed plugins registry
 *
 * Both local plugins (with string source like "./path") and external plugins
 * (with object source like {source: "github", ...}) are cached to the same
 * location to ensure consistent behavior.
 *
 * @param pluginId - Plugin ID in "plugin@marketplace" format
 * @param entry - Plugin marketplace entry
 * @param scope - Installation scope (user, project, local, or managed). Defaults to 'user'.
 *                'managed' scope is used for plugins installed automatically from managed settings.
 * @param projectPath - Project path (required for project/local scopes)
 * @param localSourcePath - For local plugins, the resolved absolute path to the source directory
 * @returns The installation path
 */
function cacheAndRegisterPlugin(pluginId_1, entry_1) {
    return __awaiter(this, arguments, void 0, function (pluginId, entry, scope, projectPath, localSourcePath) {
        var source, cacheResult, pathForGitSha, gitCommitSha, _a, now, version, versionedPath, finalPath, normalizedCachePath, isSubdirectory, tempPath, zipPath;
        var _b;
        if (scope === void 0) { scope = 'user'; }
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    source = typeof entry.source === 'string' && localSourcePath
                        ? localSourcePath
                        : entry.source;
                    return [4 /*yield*/, (0, pluginLoader_js_1.cachePlugin)(source, {
                            manifest: entry,
                        })
                        // For local plugins, use the original source path for Git SHA calculation
                        // because the cached temp directory doesn't have .git (it's copied from a
                        // subdirectory of the marketplace git repo). For external plugins, use the
                        // cached path. For git-subdir sources, cachePlugin already captured the SHA
                        // before discarding the ephemeral clone (the extracted subdir has no .git).
                    ];
                case 1:
                    cacheResult = _c.sent();
                    pathForGitSha = localSourcePath || cacheResult.path;
                    if (!((_b = cacheResult.gitCommitSha) !== null && _b !== void 0)) return [3 /*break*/, 2];
                    _a = _b;
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, (0, installedPluginsManager_js_1.getGitCommitSha)(pathForGitSha)];
                case 3:
                    _a = (_c.sent());
                    _c.label = 4;
                case 4:
                    gitCommitSha = _a;
                    now = getCurrentTimestamp();
                    return [4 /*yield*/, (0, pluginVersioning_js_1.calculatePluginVersion)(pluginId, entry.source, cacheResult.manifest, pathForGitSha, entry.version, cacheResult.gitCommitSha)
                        // Move the cached plugin to the versioned path: cache/marketplace/plugin/version/
                    ];
                case 5:
                    version = _c.sent();
                    versionedPath = (0, pluginLoader_js_1.getVersionedCachePath)(pluginId, version);
                    finalPath = cacheResult.path;
                    if (!(cacheResult.path !== versionedPath)) return [3 /*break*/, 14];
                    // Create the versioned directory structure
                    return [4 /*yield*/, (0, fsOperations_js_1.getFsImplementation)().mkdir((0, path_1.dirname)(versionedPath))
                        // Remove existing versioned path if present (force: no-op if missing)
                    ];
                case 6:
                    // Create the versioned directory structure
                    _c.sent();
                    // Remove existing versioned path if present (force: no-op if missing)
                    return [4 /*yield*/, (0, promises_1.rm)(versionedPath, { recursive: true, force: true })
                        // Check if versionedPath is a subdirectory of cacheResult.path
                        // This happens when marketplace name equals plugin name (e.g., "exa-mcp-server@exa-mcp-server")
                        // In this case, we can't directly rename because we'd be moving a directory into itself
                    ];
                case 7:
                    // Remove existing versioned path if present (force: no-op if missing)
                    _c.sent();
                    normalizedCachePath = cacheResult.path.endsWith(path_1.sep)
                        ? cacheResult.path
                        : cacheResult.path + path_1.sep;
                    isSubdirectory = versionedPath.startsWith(normalizedCachePath);
                    if (!isSubdirectory) return [3 /*break*/, 11];
                    tempPath = (0, path_1.join)((0, path_1.dirname)(cacheResult.path), ".claude-plugin-temp-".concat(Date.now(), "-").concat((0, crypto_1.randomBytes)(4).toString('hex')));
                    return [4 /*yield*/, (0, promises_1.rename)(cacheResult.path, tempPath)];
                case 8:
                    _c.sent();
                    return [4 /*yield*/, (0, fsOperations_js_1.getFsImplementation)().mkdir((0, path_1.dirname)(versionedPath))];
                case 9:
                    _c.sent();
                    return [4 /*yield*/, (0, promises_1.rename)(tempPath, versionedPath)];
                case 10:
                    _c.sent();
                    return [3 /*break*/, 13];
                case 11: 
                // Move the cached plugin to the versioned location
                return [4 /*yield*/, (0, promises_1.rename)(cacheResult.path, versionedPath)];
                case 12:
                    // Move the cached plugin to the versioned location
                    _c.sent();
                    _c.label = 13;
                case 13:
                    finalPath = versionedPath;
                    _c.label = 14;
                case 14:
                    if (!(0, zipCache_js_1.isPluginZipCacheEnabled)()) return [3 /*break*/, 16];
                    zipPath = (0, pluginLoader_js_1.getVersionedZipCachePath)(pluginId, version);
                    return [4 /*yield*/, (0, zipCache_js_1.convertDirectoryToZipInPlace)(finalPath, zipPath)];
                case 15:
                    _c.sent();
                    finalPath = zipPath;
                    _c.label = 16;
                case 16:
                    // Add to both V1 and V2 installed_plugins files with correct scope
                    (0, installedPluginsManager_js_1.addInstalledPlugin)(pluginId, {
                        version: version,
                        installedAt: now,
                        lastUpdated: now,
                        installPath: finalPath,
                        gitCommitSha: gitCommitSha,
                    }, scope, projectPath);
                    return [2 /*return*/, finalPath];
            }
        });
    });
}
/**
 * Register a plugin installation without caching
 *
 * Used for local plugins that are already on disk and don't need remote caching.
 * External plugins should use cacheAndRegisterPlugin() instead.
 *
 * @param info - Plugin installation information
 * @param scope - Installation scope (user, project, local, or managed). Defaults to 'user'.
 *                'managed' scope is used for plugins registered from managed settings.
 * @param projectPath - Project path (required for project/local scopes)
 */
function registerPluginInstallation(info, scope, projectPath) {
    if (scope === void 0) { scope = 'user'; }
    var now = getCurrentTimestamp();
    (0, installedPluginsManager_js_1.addInstalledPlugin)(info.pluginId, {
        version: info.version || 'unknown',
        installedAt: now,
        lastUpdated: now,
        installPath: info.installPath,
    }, scope, projectPath);
}
/**
 * Parse plugin ID into components
 *
 * @param pluginId - Plugin ID in "plugin@marketplace" format
 * @returns Parsed components or null if invalid
 */
function parsePluginId(pluginId) {
    var parts = pluginId.split('@');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
        return null;
    }
    return {
        name: parts[0],
        marketplace: parts[1],
    };
}
/**
 * Format a failed ResolutionResult into a user-facing message. Unified on
 * the richer CLI messages (the "Is the X marketplace added?" hint is useful
 * for UI users too).
 */
function formatResolutionError(r) {
    switch (r.reason) {
        case 'cycle':
            return "Dependency cycle: ".concat(r.chain.join(' → '));
        case 'cross-marketplace': {
            var depMkt = (0, pluginIdentifier_js_1.parsePluginIdentifier)(r.dependency).marketplace;
            var where = depMkt
                ? "marketplace \"".concat(depMkt, "\"")
                : 'a different marketplace';
            var hint = depMkt
                ? " Add \"".concat(depMkt, "\" to allowCrossMarketplaceDependenciesOn in the ROOT marketplace's marketplace.json (the marketplace of the plugin you're installing \u2014 only its allowlist applies; no transitive trust).")
                : '';
            return "Dependency \"".concat(r.dependency, "\" (required by ").concat(r.requiredBy, ") is in ").concat(where, ", which is not in the allowlist \u2014 cross-marketplace dependencies are blocked by default. Install it manually first.").concat(hint);
        }
        case 'not-found': {
            var depMkt = (0, pluginIdentifier_js_1.parsePluginIdentifier)(r.missing).marketplace;
            return depMkt
                ? "Dependency \"".concat(r.missing, "\" (required by ").concat(r.requiredBy, ") not found. Is the \"").concat(depMkt, "\" marketplace added?")
                : "Dependency \"".concat(r.missing, "\" (required by ").concat(r.requiredBy, ") not found in any configured marketplace");
        }
    }
}
/**
 * Core plugin install logic, shared by the CLI path (`installPluginOp`) and
 * the interactive UI path (`installPluginFromMarketplace`). Given a
 * pre-resolved marketplace entry, this:
 *
 *   1. Guards against local-source plugins without a marketplace install
 *      location (would silently no-op otherwise).
 *   2. Resolves the transitive dependency closure (when PLUGIN_DEPENDENCIES
 *      is on; trivial single-plugin closure otherwise).
 *   3. Writes the entire closure to enabledPlugins in one settings update.
 *   4. Caches each closure member (downloads/copies sources as needed).
 *   5. Clears memoization caches.
 *
 * Returns a structured result. Message formatting, analytics, and top-level
 * error wrapping stay in the caller-specific wrappers.
 *
 * @param marketplaceInstallLocation Pass this if the caller already has it
 *   (from a prior marketplace search) to avoid a redundant lookup.
 */
function installResolvedPlugin(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var settingSource, depInfo, rootMarketplace, allowedCrossMarketplaces, _c, _d, resolution, _i, _e, id, closureEnabled, _f, _g, id, error, projectPath, _h, _j, id, info, mktLocation, localSourcePath, source, depNote;
        var _this = this;
        var _k, _l, _m, _o;
        var pluginId = _b.pluginId, entry = _b.entry, scope = _b.scope, marketplaceInstallLocation = _b.marketplaceInstallLocation;
        return __generator(this, function (_p) {
            switch (_p.label) {
                case 0:
                    settingSource = (0, pluginIdentifier_js_1.scopeToSettingSource)(scope);
                    // ── Policy guard ──
                    // Org-blocked plugins (managed-settings.json enabledPlugins: false) cannot
                    // be installed. Checked here so all install paths (CLI, UI, hint-triggered)
                    // are covered in one place.
                    if ((0, pluginPolicy_js_1.isPluginBlockedByPolicy)(pluginId)) {
                        return [2 /*return*/, { ok: false, reason: 'blocked-by-policy', pluginName: entry.name }];
                    }
                    depInfo = new Map();
                    // Without this guard, a local-source root with undefined
                    // marketplaceInstallLocation falls through: depInfo isn't seeded, the
                    // materialize loop's `if (!info) continue` skips the root, and the user
                    // sees "Successfully installed" while nothing is cached.
                    if ((0, schemas_js_1.isLocalPluginSource)(entry.source) && !marketplaceInstallLocation) {
                        return [2 /*return*/, {
                                ok: false,
                                reason: 'local-source-no-location',
                                pluginName: entry.name,
                            }];
                    }
                    if (marketplaceInstallLocation) {
                        depInfo.set(pluginId, { entry: entry, marketplaceInstallLocation: marketplaceInstallLocation });
                    }
                    rootMarketplace = (0, pluginIdentifier_js_1.parsePluginIdentifier)(pluginId).marketplace;
                    _c = Set.bind;
                    if (!rootMarketplace) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, marketplaceManager_js_1.getMarketplaceCacheOnly)(rootMarketplace)];
                case 1:
                    _d = (_k = (_p.sent())) === null || _k === void 0 ? void 0 : _k.allowCrossMarketplaceDependenciesOn;
                    return [3 /*break*/, 3];
                case 2:
                    _d = undefined;
                    _p.label = 3;
                case 3:
                    allowedCrossMarketplaces = new (_c.apply(Set, [void 0, (_l = (_d)) !== null && _l !== void 0 ? _l : []]))();
                    return [4 /*yield*/, (0, dependencyResolver_js_1.resolveDependencyClosure)(pluginId, function (id) { return __awaiter(_this, void 0, void 0, function () {
                            var info;
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        if (depInfo.has(id))
                                            return [2 /*return*/, depInfo.get(id).entry];
                                        if (id === pluginId)
                                            return [2 /*return*/, entry];
                                        return [4 /*yield*/, (0, marketplaceManager_js_1.getPluginById)(id)];
                                    case 1:
                                        info = _b.sent();
                                        if (info)
                                            depInfo.set(id, info);
                                        return [2 /*return*/, (_a = info === null || info === void 0 ? void 0 : info.entry) !== null && _a !== void 0 ? _a : null];
                                }
                            });
                        }); }, (0, dependencyResolver_js_1.getEnabledPluginIdsForScope)(settingSource), allowedCrossMarketplaces)];
                case 4:
                    resolution = _p.sent();
                    if (!resolution.ok) {
                        return [2 /*return*/, { ok: false, reason: 'resolution-failed', resolution: resolution }];
                    }
                    // ── Policy guard for transitive dependencies ──
                    // The root plugin was already checked above, but any dependency in the
                    // closure could also be policy-blocked. Check before writing to settings
                    // so a non-blocked plugin can't pull in a blocked dependency.
                    for (_i = 0, _e = resolution.closure; _i < _e.length; _i++) {
                        id = _e[_i];
                        if (id !== pluginId && (0, pluginPolicy_js_1.isPluginBlockedByPolicy)(id)) {
                            return [2 /*return*/, {
                                    ok: false,
                                    reason: 'dependency-blocked-by-policy',
                                    pluginName: entry.name,
                                    blockedDependency: id,
                                }];
                        }
                    }
                    closureEnabled = {};
                    for (_f = 0, _g = resolution.closure; _f < _g.length; _f++) {
                        id = _g[_f];
                        closureEnabled[id] = true;
                    }
                    error = (0, settings_js_1.updateSettingsForSource)(settingSource, {
                        enabledPlugins: __assign(__assign({}, (_m = (0, settings_js_1.getSettingsForSource)(settingSource)) === null || _m === void 0 ? void 0 : _m.enabledPlugins), closureEnabled),
                    }).error;
                    if (error) {
                        return [2 /*return*/, {
                                ok: false,
                                reason: 'settings-write-failed',
                                message: error.message,
                            }];
                    }
                    projectPath = scope !== 'user' ? (0, cwd_js_1.getCwd)() : undefined;
                    _h = 0, _j = resolution.closure;
                    _p.label = 5;
                case 5:
                    if (!(_h < _j.length)) return [3 /*break*/, 10];
                    id = _j[_h];
                    info = depInfo.get(id);
                    if (!(!info && id === pluginId)) return [3 /*break*/, 7];
                    return [4 /*yield*/, (0, marketplaceManager_js_1.getPluginById)(id)];
                case 6:
                    mktLocation = (_o = (_p.sent())) === null || _o === void 0 ? void 0 : _o.marketplaceInstallLocation;
                    if (mktLocation)
                        info = { entry: entry, marketplaceInstallLocation: mktLocation };
                    _p.label = 7;
                case 7:
                    if (!info)
                        return [3 /*break*/, 9];
                    localSourcePath = void 0;
                    source = info.entry.source;
                    if ((0, schemas_js_1.isLocalPluginSource)(source)) {
                        localSourcePath = validatePathWithinBase(info.marketplaceInstallLocation, source);
                    }
                    return [4 /*yield*/, cacheAndRegisterPlugin(id, info.entry, scope, projectPath, localSourcePath)];
                case 8:
                    _p.sent();
                    _p.label = 9;
                case 9:
                    _h++;
                    return [3 /*break*/, 5];
                case 10:
                    (0, cacheUtils_js_1.clearAllCaches)();
                    depNote = (0, dependencyResolver_js_1.formatDependencyCountSuffix)(resolution.closure.filter(function (id) { return id !== pluginId; }));
                    return [2 /*return*/, { ok: true, closure: resolution.closure, depNote: depNote }];
            }
        });
    });
}
/**
 * Install a single plugin from a marketplace with the specified scope.
 * Interactive-UI wrapper around `installResolvedPlugin` — adds try/catch,
 * analytics, and UI-style message formatting.
 */
function installPluginFromMarketplace(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var pluginInfo, marketplaceInstallLocation, result, err_1, errorMessage;
        var pluginId = _b.pluginId, entry = _b.entry, marketplaceName = _b.marketplaceName, _c = _b.scope, scope = _c === void 0 ? 'user' : _c, _d = _b.trigger, trigger = _d === void 0 ? 'user' : _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, (0, marketplaceManager_js_1.getPluginById)(pluginId)];
                case 1:
                    pluginInfo = _e.sent();
                    marketplaceInstallLocation = pluginInfo === null || pluginInfo === void 0 ? void 0 : pluginInfo.marketplaceInstallLocation;
                    return [4 /*yield*/, installResolvedPlugin({
                            pluginId: pluginId,
                            entry: entry,
                            scope: scope,
                            marketplaceInstallLocation: marketplaceInstallLocation,
                        })];
                case 2:
                    result = _e.sent();
                    if (!result.ok) {
                        switch (result.reason) {
                            case 'local-source-no-location':
                                return [2 /*return*/, {
                                        success: false,
                                        error: "Cannot install local plugin \"".concat(result.pluginName, "\" without marketplace install location"),
                                    }];
                            case 'settings-write-failed':
                                return [2 /*return*/, {
                                        success: false,
                                        error: "Failed to update settings: ".concat(result.message),
                                    }];
                            case 'resolution-failed':
                                return [2 /*return*/, {
                                        success: false,
                                        error: formatResolutionError(result.resolution),
                                    }];
                            case 'blocked-by-policy':
                                return [2 /*return*/, {
                                        success: false,
                                        error: "Plugin \"".concat(result.pluginName, "\" is blocked by your organization's policy and cannot be installed"),
                                    }];
                            case 'dependency-blocked-by-policy':
                                return [2 /*return*/, {
                                        success: false,
                                        error: "Cannot install \"".concat(result.pluginName, "\": dependency \"").concat(result.blockedDependency, "\" is blocked by your organization's policy"),
                                    }];
                        }
                    }
                    // _PROTO_* routes to PII-tagged plugin_name/marketplace_name BQ columns.
                    // plugin_id kept in additional_metadata (redacted to 'third-party' for
                    // non-official) because dbt external_claude_code_plugin_installs.sql
                    // extracts $.plugin_id for official-marketplace install tracking. Other
                    // plugin lifecycle events drop the blob key — no downstream consumers.
                    (0, index_js_1.logEvent)('tengu_plugin_installed', __assign(__assign({ _PROTO_plugin_name: entry.name, _PROTO_marketplace_name: marketplaceName, plugin_id: ((0, pluginIdentifier_js_1.isOfficialMarketplaceName)(marketplaceName)
                            ? pluginId
                            : 'third-party'), trigger: trigger, install_source: (trigger === 'hint'
                            ? 'ui-suggestion'
                            : 'ui-discover') }, (0, pluginTelemetry_js_1.buildPluginTelemetryFields)(entry.name, marketplaceName, (0, managedPlugins_js_1.getManagedPluginNames)())), (entry.version && {
                        version: entry.version,
                    })));
                    return [2 /*return*/, {
                            success: true,
                            message: "\u2713 Installed ".concat(entry.name).concat(result.depNote, ". Run /reload-plugins to activate."),
                        }];
                case 3:
                    err_1 = _e.sent();
                    errorMessage = err_1 instanceof Error ? err_1.message : String(err_1);
                    (0, log_js_1.logError)((0, errors_js_1.toError)(err_1));
                    return [2 /*return*/, { success: false, error: "Failed to install: ".concat(errorMessage) }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
