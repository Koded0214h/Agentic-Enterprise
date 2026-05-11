"use strict";
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
exports.checkEnabledPlugins = checkEnabledPlugins;
exports.getPluginEditableScopes = getPluginEditableScopes;
exports.isPersistableScope = isPersistableScope;
exports.settingSourceToScope = settingSourceToScope;
exports.getInstalledPlugins = getInstalledPlugins;
exports.findMissingPlugins = findMissingPlugins;
exports.installSelectedPlugins = installSelectedPlugins;
var path_1 = require("path");
var cwd_js_1 = require("../cwd.js");
var debug_js_1 = require("../debug.js");
var log_js_1 = require("../log.js");
var settings_js_1 = require("../settings/settings.js");
var addDirPluginSettings_js_1 = require("./addDirPluginSettings.js");
var installedPluginsManager_js_1 = require("./installedPluginsManager.js");
var marketplaceManager_js_1 = require("./marketplaceManager.js");
var pluginIdentifier_js_1 = require("./pluginIdentifier.js");
var pluginInstallationHelpers_js_1 = require("./pluginInstallationHelpers.js");
var schemas_js_1 = require("./schemas.js");
/**
 * Checks for enabled plugins across all settings sources, including --add-dir.
 *
 * Uses getInitialSettings() which merges all sources with policy as
 * highest priority, then layers --add-dir plugins underneath. This is the
 * authoritative "is this plugin enabled?" check — don't delegate to
 * getPluginEditableScopes() which serves a different purpose (scope tracking).
 *
 * @returns Array of plugin IDs (plugin@marketplace format) that are enabled
 */
function checkEnabledPlugins() {
    return __awaiter(this, void 0, void 0, function () {
        var settings, enabledPlugins, addDirPlugins, _i, _a, _b, pluginId, value, _c, _d, _e, pluginId, value, idx;
        return __generator(this, function (_f) {
            settings = (0, settings_js_1.getInitialSettings)();
            enabledPlugins = [];
            addDirPlugins = (0, addDirPluginSettings_js_1.getAddDirEnabledPlugins)();
            for (_i = 0, _a = Object.entries(addDirPlugins); _i < _a.length; _i++) {
                _b = _a[_i], pluginId = _b[0], value = _b[1];
                if (pluginId.includes('@') && value) {
                    enabledPlugins.push(pluginId);
                }
            }
            // Merged settings (policy > local > project > user) override --add-dir
            if (settings.enabledPlugins) {
                for (_c = 0, _d = Object.entries(settings.enabledPlugins); _c < _d.length; _c++) {
                    _e = _d[_c], pluginId = _e[0], value = _e[1];
                    if (!pluginId.includes('@')) {
                        continue;
                    }
                    idx = enabledPlugins.indexOf(pluginId);
                    if (value) {
                        if (idx === -1) {
                            enabledPlugins.push(pluginId);
                        }
                    }
                    else {
                        // Explicitly disabled — remove even if --add-dir enabled it
                        if (idx !== -1) {
                            enabledPlugins.splice(idx, 1);
                        }
                    }
                }
            }
            return [2 /*return*/, enabledPlugins];
        });
    });
}
/**
 * Gets the user-editable scope that "owns" each enabled plugin.
 *
 * Used for scope tracking: determining where to write back when a user
 * enables/disables a plugin. Managed (policy) settings are processed first
 * (lowest priority) because the user cannot edit them — the scope should
 * resolve to the highest user-controllable source.
 *
 * NOTE: This is NOT the authoritative "is this plugin enabled?" check.
 * Use checkEnabledPlugins() for that — it uses merged settings where
 * policy has highest priority and can block user-enabled plugins.
 *
 * Precedence (lowest to highest):
 * 0. addDir (--add-dir directories) - session-only, lowest priority
 * 1. managed (policySettings) - not user-editable
 * 2. user (userSettings)
 * 3. project (projectSettings)
 * 4. local (localSettings)
 * 5. flag (flagSettings) - session-only, not persisted
 *
 * @returns Map of plugin ID to the user-editable scope that owns it
 */
function getPluginEditableScopes() {
    var result = new Map();
    // Process --add-dir directories FIRST (lowest priority, overridden by all standard sources)
    var addDirPlugins = (0, addDirPluginSettings_js_1.getAddDirEnabledPlugins)();
    for (var _i = 0, _a = Object.entries(addDirPlugins); _i < _a.length; _i++) {
        var _b = _a[_i], pluginId = _b[0], value = _b[1];
        if (!pluginId.includes('@')) {
            continue;
        }
        if (value === true) {
            result.set(pluginId, 'flag'); // 'flag' scope = session-only, no write-back
        }
        else if (value === false) {
            result.delete(pluginId);
        }
    }
    // Process standard sources in precedence order (later overrides earlier)
    var scopeSources = [
        { scope: 'managed', source: 'policySettings' },
        { scope: 'user', source: 'userSettings' },
        { scope: 'project', source: 'projectSettings' },
        { scope: 'local', source: 'localSettings' },
        { scope: 'flag', source: 'flagSettings' },
    ];
    for (var _c = 0, scopeSources_1 = scopeSources; _c < scopeSources_1.length; _c++) {
        var _d = scopeSources_1[_c], scope = _d.scope, source = _d.source;
        var settings = (0, settings_js_1.getSettingsForSource)(source);
        if (!(settings === null || settings === void 0 ? void 0 : settings.enabledPlugins)) {
            continue;
        }
        for (var _e = 0, _f = Object.entries(settings.enabledPlugins); _e < _f.length; _e++) {
            var _g = _f[_e], pluginId = _g[0], value = _g[1];
            // Skip invalid format
            if (!pluginId.includes('@')) {
                continue;
            }
            // Log when a standard source overrides an --add-dir plugin
            if (pluginId in addDirPlugins && addDirPlugins[pluginId] !== value) {
                (0, debug_js_1.logForDebugging)("Plugin ".concat(pluginId, " from --add-dir (").concat(addDirPlugins[pluginId], ") overridden by ").concat(source, " (").concat(value, ")"));
            }
            if (value === true) {
                // Plugin enabled at this scope
                result.set(pluginId, scope);
            }
            else if (value === false) {
                // Explicitly disabled - remove from result
                result.delete(pluginId);
            }
            // Note: Other values (like version strings for future P2) are ignored for now
        }
    }
    (0, debug_js_1.logForDebugging)("Found ".concat(result.size, " enabled plugins with scopes: ").concat(Array.from(result.entries())
        .map(function (_a) {
        var id = _a[0], scope = _a[1];
        return "".concat(id, "(").concat(scope, ")");
    })
        .join(', ')));
    return result;
}
/**
 * Check if a scope is persistable (not session-only).
 * @param scope The scope to check
 * @returns true if the scope should be persisted to installed_plugins.json
 */
function isPersistableScope(scope) {
    return scope !== 'flag';
}
/**
 * Convert SettingSource to plugin scope.
 * @param source The settings source
 * @returns The corresponding plugin scope
 */
function settingSourceToScope(source) {
    return pluginIdentifier_js_1.SETTING_SOURCE_TO_SCOPE[source];
}
/**
 * Gets the list of currently installed plugins
 * Reads from installed_plugins.json which tracks global installation state.
 * Automatically runs migration on first call if needed.
 *
 * Always uses V2 format and initializes the in-memory session state
 * (which triggers V1→V2 migration if needed).
 *
 * @returns Array of installed plugin IDs
 */
function getInstalledPlugins() {
    return __awaiter(this, void 0, void 0, function () {
        var v2Data, installed;
        return __generator(this, function (_a) {
            // Trigger sync in background (don't await - don't block startup)
            // This syncs enabledPlugins from settings.json to installed_plugins.json
            void (0, installedPluginsManager_js_1.migrateFromEnabledPlugins)().catch(function (error) {
                (0, log_js_1.logError)(error);
            });
            v2Data = (0, installedPluginsManager_js_1.getInMemoryInstalledPlugins)();
            installed = Object.keys(v2Data.plugins);
            (0, debug_js_1.logForDebugging)("Found ".concat(installed.length, " installed plugins"));
            return [2 /*return*/, installed];
        });
    });
}
/**
 * Finds plugins that are enabled but not installed
 * @param enabledPlugins Array of enabled plugin IDs
 * @returns Array of missing plugin IDs
 */
function findMissingPlugins(enabledPlugins) {
    return __awaiter(this, void 0, void 0, function () {
        var installedPlugins_1, notInstalled, lookups, missing, error_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, getInstalledPlugins()
                        // Filter to not-installed synchronously, then look up all in parallel.
                        // Results are collected in original enabledPlugins order.
                    ];
                case 1:
                    installedPlugins_1 = _a.sent();
                    notInstalled = enabledPlugins.filter(function (id) { return !installedPlugins_1.includes(id); });
                    return [4 /*yield*/, Promise.all(notInstalled.map(function (pluginId) { return __awaiter(_this, void 0, void 0, function () {
                            var plugin, error_2;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, (0, marketplaceManager_js_1.getPluginById)(pluginId)];
                                    case 1:
                                        plugin = _a.sent();
                                        return [2 /*return*/, { pluginId: pluginId, found: plugin !== null && plugin !== undefined }];
                                    case 2:
                                        error_2 = _a.sent();
                                        (0, debug_js_1.logForDebugging)("Failed to check plugin ".concat(pluginId, " in marketplace: ").concat(error_2));
                                        // Plugin doesn't exist in any marketplace, will be handled as an error
                                        return [2 /*return*/, { pluginId: pluginId, found: false }];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 2:
                    lookups = _a.sent();
                    missing = lookups
                        .filter(function (_a) {
                        var found = _a.found;
                        return found;
                    })
                        .map(function (_a) {
                        var pluginId = _a.pluginId;
                        return pluginId;
                    });
                    return [2 /*return*/, missing];
                case 3:
                    error_1 = _a.sent();
                    (0, log_js_1.logError)(error_1);
                    return [2 /*return*/, []];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Installs the selected plugins
 * @param pluginsToInstall Array of plugin IDs to install
 * @param onProgress Optional callback for installation progress
 * @param scope Installation scope: user, project, or local (defaults to 'user')
 * @returns Installation results with succeeded and failed plugins
 */
function installSelectedPlugins(pluginsToInstall_1, onProgress_1) {
    return __awaiter(this, arguments, void 0, function (pluginsToInstall, onProgress, scope) {
        var projectPath, settingSource, settings, updatedEnabledPlugins, installed, failed, i, pluginId, pluginInfo, entry, marketplaceInstallLocation, error_3, errorMessage;
        if (scope === void 0) { scope = 'user'; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    projectPath = scope !== 'user' ? (0, cwd_js_1.getCwd)() : undefined;
                    settingSource = (0, pluginIdentifier_js_1.scopeToSettingSource)(scope);
                    settings = (0, settings_js_1.getSettingsForSource)(settingSource);
                    updatedEnabledPlugins = __assign({}, settings === null || settings === void 0 ? void 0 : settings.enabledPlugins);
                    installed = [];
                    failed = [];
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < pluginsToInstall.length)) return [3 /*break*/, 9];
                    pluginId = pluginsToInstall[i];
                    if (!pluginId)
                        return [3 /*break*/, 8];
                    if (onProgress) {
                        onProgress(pluginId, i + 1, pluginsToInstall.length);
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 7, , 8]);
                    return [4 /*yield*/, (0, marketplaceManager_js_1.getPluginById)(pluginId)];
                case 3:
                    pluginInfo = _a.sent();
                    if (!pluginInfo) {
                        failed.push({
                            name: pluginId,
                            error: 'Plugin not found in any marketplace',
                        });
                        return [3 /*break*/, 8];
                    }
                    entry = pluginInfo.entry, marketplaceInstallLocation = pluginInfo.marketplaceInstallLocation;
                    if (!!(0, schemas_js_1.isLocalPluginSource)(entry.source)) return [3 /*break*/, 5];
                    // External plugin - cache and register it with scope
                    return [4 /*yield*/, (0, pluginInstallationHelpers_js_1.cacheAndRegisterPlugin)(pluginId, entry, scope, projectPath)];
                case 4:
                    // External plugin - cache and register it with scope
                    _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    // Local plugin - just register it with the install path and scope
                    (0, pluginInstallationHelpers_js_1.registerPluginInstallation)({
                        pluginId: pluginId,
                        installPath: (0, path_1.join)(marketplaceInstallLocation, entry.source),
                        version: entry.version,
                    }, scope, projectPath);
                    _a.label = 6;
                case 6:
                    // Mark as enabled in settings
                    updatedEnabledPlugins[pluginId] = true;
                    installed.push(pluginId);
                    return [3 /*break*/, 8];
                case 7:
                    error_3 = _a.sent();
                    errorMessage = error_3 instanceof Error ? error_3.message : String(error_3);
                    failed.push({ name: pluginId, error: errorMessage });
                    (0, log_js_1.logError)(error_3);
                    return [3 /*break*/, 8];
                case 8:
                    i++;
                    return [3 /*break*/, 1];
                case 9:
                    // Update settings with newly enabled plugins using the correct settings source
                    (0, settings_js_1.updateSettingsForSource)(settingSource, __assign(__assign({}, settings), { enabledPlugins: updatedEnabledPlugins }));
                    return [2 /*return*/, { installed: installed, failed: failed }];
            }
        });
    });
}
