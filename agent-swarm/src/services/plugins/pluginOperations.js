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
exports.VALID_UPDATE_SCOPES = exports.VALID_INSTALLABLE_SCOPES = void 0;
exports.assertInstallableScope = assertInstallableScope;
exports.isInstallableScope = isInstallableScope;
exports.getProjectPathForScope = getProjectPathForScope;
exports.isPluginEnabledAtProjectScope = isPluginEnabledAtProjectScope;
exports.getPluginInstallationFromV2 = getPluginInstallationFromV2;
exports.installPluginOp = installPluginOp;
exports.uninstallPluginOp = uninstallPluginOp;
exports.setPluginEnabledOp = setPluginEnabledOp;
exports.enablePluginOp = enablePluginOp;
exports.disablePluginOp = disablePluginOp;
exports.disableAllPluginsOp = disableAllPluginsOp;
exports.updatePluginOp = updatePluginOp;
/**
 * Core plugin operations (install, uninstall, enable, disable, update)
 *
 * This module provides pure library functions that can be used by both:
 * - CLI commands (`claude plugin install/uninstall/enable/disable/update`)
 * - Interactive UI (ManagePlugins.tsx)
 *
 * Functions in this module:
 * - Do NOT call process.exit()
 * - Do NOT write to console
 * - Return result objects indicating success/failure with messages
 * - Can throw errors for unexpected failures
 */
var path_1 = require("path");
var state_js_1 = require("../../bootstrap/state.js");
var builtinPlugins_js_1 = require("../../plugins/builtinPlugins.js");
var errors_js_1 = require("../../utils/errors.js");
var fsOperations_js_1 = require("../../utils/fsOperations.js");
var log_js_1 = require("../../utils/log.js");
var cacheUtils_js_1 = require("../../utils/plugins/cacheUtils.js");
var dependencyResolver_js_1 = require("../../utils/plugins/dependencyResolver.js");
var installedPluginsManager_js_1 = require("../../utils/plugins/installedPluginsManager.js");
var marketplaceManager_js_1 = require("../../utils/plugins/marketplaceManager.js");
var pluginDirectories_js_1 = require("../../utils/plugins/pluginDirectories.js");
var pluginIdentifier_js_1 = require("../../utils/plugins/pluginIdentifier.js");
var pluginInstallationHelpers_js_1 = require("../../utils/plugins/pluginInstallationHelpers.js");
var pluginLoader_js_1 = require("../../utils/plugins/pluginLoader.js");
var pluginOptionsStorage_js_1 = require("../../utils/plugins/pluginOptionsStorage.js");
var pluginPolicy_js_1 = require("../../utils/plugins/pluginPolicy.js");
var pluginStartupCheck_js_1 = require("../../utils/plugins/pluginStartupCheck.js");
var pluginVersioning_js_1 = require("../../utils/plugins/pluginVersioning.js");
var settings_js_1 = require("../../utils/settings/settings.js");
var stringUtils_js_1 = require("../../utils/stringUtils.js");
/** Valid installable scopes (excludes 'managed' which can only be installed from managed-settings.json) */
exports.VALID_INSTALLABLE_SCOPES = ['user', 'project', 'local'];
/** Valid scopes for update operations (includes 'managed' since managed plugins can be updated) */
exports.VALID_UPDATE_SCOPES = [
    'user',
    'project',
    'local',
    'managed',
];
/**
 * Assert that a scope is a valid installable scope at runtime
 * @param scope The scope to validate
 * @throws Error if scope is not a valid installable scope
 */
function assertInstallableScope(scope) {
    if (!exports.VALID_INSTALLABLE_SCOPES.includes(scope)) {
        throw new Error("Invalid scope \"".concat(scope, "\". Must be one of: ").concat(exports.VALID_INSTALLABLE_SCOPES.join(', ')));
    }
}
/**
 * Type guard to check if a scope is an installable scope (not 'managed').
 * Use this for type narrowing in conditional blocks.
 */
function isInstallableScope(scope) {
    return exports.VALID_INSTALLABLE_SCOPES.includes(scope);
}
/**
 * Get the project path for scopes that are project-specific.
 * Returns the original cwd for 'project' and 'local' scopes, undefined otherwise.
 */
function getProjectPathForScope(scope) {
    return scope === 'project' || scope === 'local' ? (0, state_js_1.getOriginalCwd)() : undefined;
}
/**
 * Is this plugin enabled (value === true) in .claude/settings.json?
 *
 * Distinct from V2 installed_plugins.json scope: that file tracks where a
 * plugin was *installed from*, but the same plugin can also be enabled at
 * project scope via settings. The uninstall UI needs to check THIS, because
 * a user-scope install with a project-scope enablement means "uninstall"
 * would succeed at removing the user install while leaving the project
 * enablement active — the plugin keeps running.
 */
function isPluginEnabledAtProjectScope(pluginId) {
    var _a, _b;
    return (((_b = (_a = (0, settings_js_1.getSettingsForSource)('projectSettings')) === null || _a === void 0 ? void 0 : _a.enabledPlugins) === null || _b === void 0 ? void 0 : _b[pluginId]) === true);
}
// ============================================================================
// Helper Functions
// ============================================================================
/**
 * Search all editable settings scopes for a plugin ID matching the given input.
 *
 * If `plugin` contains `@`, it's treated as a full pluginId and returned if
 * found in any scope. If `plugin` is a bare name, searches for any key
 * starting with `{plugin}@` in any scope.
 *
 * Returns the most specific scope where the plugin is mentioned (regardless
 * of enabled/disabled state) plus the resolved full pluginId.
 *
 * Precedence: local > project > user (most specific wins).
 */
function findPluginInSettings(plugin) {
    var _a;
    var hasMarketplace = plugin.includes('@');
    // Most specific first — first match wins
    var searchOrder = ['local', 'project', 'user'];
    for (var _i = 0, searchOrder_1 = searchOrder; _i < searchOrder_1.length; _i++) {
        var scope = searchOrder_1[_i];
        var enabledPlugins = (_a = (0, settings_js_1.getSettingsForSource)((0, pluginIdentifier_js_1.scopeToSettingSource)(scope))) === null || _a === void 0 ? void 0 : _a.enabledPlugins;
        if (!enabledPlugins)
            continue;
        for (var _b = 0, _c = Object.keys(enabledPlugins); _b < _c.length; _b++) {
            var key = _c[_b];
            if (hasMarketplace ? key === plugin : key.startsWith("".concat(plugin, "@"))) {
                return { pluginId: key, scope: scope };
            }
        }
    }
    return null;
}
/**
 * Helper function to find a plugin from loaded plugins
 */
function findPluginByIdentifier(plugin, plugins) {
    var _a = (0, pluginIdentifier_js_1.parsePluginIdentifier)(plugin), name = _a.name, marketplace = _a.marketplace;
    return plugins.find(function (p) {
        // Check exact name match
        if (p.name === plugin || p.name === name)
            return true;
        // If marketplace specified, check if it matches the source
        if (marketplace && p.source) {
            return p.name === name && p.source.includes("@".concat(marketplace));
        }
        return false;
    });
}
/**
 * Resolve a plugin ID from V2 installed plugins data for a plugin that may
 * have been delisted from its marketplace. Returns null if the plugin is not
 * found in V2 data.
 */
function resolveDelistedPluginId(plugin) {
    var _a;
    var name = (0, pluginIdentifier_js_1.parsePluginIdentifier)(plugin).name;
    var installedData = (0, installedPluginsManager_js_1.loadInstalledPluginsV2)();
    // Try exact match first, then search by name
    if ((_a = installedData.plugins[plugin]) === null || _a === void 0 ? void 0 : _a.length) {
        return { pluginId: plugin, pluginName: name };
    }
    var matchingKey = Object.keys(installedData.plugins).find(function (key) {
        var _a, _b;
        var keyName = (0, pluginIdentifier_js_1.parsePluginIdentifier)(key).name;
        return keyName === name && ((_b = (_a = installedData.plugins[key]) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) > 0;
    });
    if (matchingKey) {
        return { pluginId: matchingKey, pluginName: name };
    }
    return null;
}
/**
 * Get the most relevant installation for a plugin from V2 data.
 * For project/local scoped plugins, prioritizes installations matching the current project.
 * Priority order: local (matching project) > project (matching project) > user > first available
 */
function getPluginInstallationFromV2(pluginId) {
    var installedData = (0, installedPluginsManager_js_1.loadInstalledPluginsV2)();
    var installations = installedData.plugins[pluginId];
    if (!installations || installations.length === 0) {
        return { scope: 'user' };
    }
    var currentProjectPath = (0, state_js_1.getOriginalCwd)();
    // Find installations by priority: local > project > user > managed
    var localInstall = installations.find(function (inst) { return inst.scope === 'local' && inst.projectPath === currentProjectPath; });
    if (localInstall) {
        return { scope: localInstall.scope, projectPath: localInstall.projectPath };
    }
    var projectInstall = installations.find(function (inst) { return inst.scope === 'project' && inst.projectPath === currentProjectPath; });
    if (projectInstall) {
        return {
            scope: projectInstall.scope,
            projectPath: projectInstall.projectPath,
        };
    }
    var userInstall = installations.find(function (inst) { return inst.scope === 'user'; });
    if (userInstall) {
        return { scope: userInstall.scope };
    }
    // Fall back to first installation (could be managed)
    return {
        scope: installations[0].scope,
        projectPath: installations[0].projectPath,
    };
}
// ============================================================================
// Core Operations
// ============================================================================
/**
 * Install a plugin (settings-first).
 *
 * Order of operations:
 *   1. Search materialized marketplaces for the plugin
 *   2. Write settings (THE ACTION — declares intent)
 *   3. Cache plugin + record version hint (materialization)
 *
 * Marketplace reconciliation is NOT this function's responsibility — startup
 * reconcile handles declared-but-not-materialized marketplaces. If the
 * marketplace isn't found, "not found" is the correct error.
 *
 * @param plugin Plugin identifier (name or plugin@marketplace)
 * @param scope Installation scope: user, project, or local (defaults to 'user')
 * @returns Result indicating success/failure
 */
function installPluginOp(plugin_1) {
    return __awaiter(this, arguments, void 0, function (plugin, scope) {
        var _a, pluginName, marketplaceName, foundPlugin, foundMarketplace, marketplaceInstallLocation, pluginInfo, marketplaces, _i, _b, _c, mktName, mktConfig, marketplace, pluginEntry, error_1, location_1, entry, pluginId, result;
        if (scope === void 0) { scope = 'user'; }
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    assertInstallableScope(scope);
                    _a = (0, pluginIdentifier_js_1.parsePluginIdentifier)(plugin), pluginName = _a.name, marketplaceName = _a.marketplace;
                    if (!marketplaceName) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, marketplaceManager_js_1.getPluginById)(plugin)];
                case 1:
                    pluginInfo = _d.sent();
                    if (pluginInfo) {
                        foundPlugin = pluginInfo.entry;
                        foundMarketplace = marketplaceName;
                        marketplaceInstallLocation = pluginInfo.marketplaceInstallLocation;
                    }
                    return [3 /*break*/, 9];
                case 2: return [4 /*yield*/, (0, marketplaceManager_js_1.loadKnownMarketplacesConfig)()];
                case 3:
                    marketplaces = _d.sent();
                    _i = 0, _b = Object.entries(marketplaces);
                    _d.label = 4;
                case 4:
                    if (!(_i < _b.length)) return [3 /*break*/, 9];
                    _c = _b[_i], mktName = _c[0], mktConfig = _c[1];
                    _d.label = 5;
                case 5:
                    _d.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, (0, marketplaceManager_js_1.getMarketplace)(mktName)];
                case 6:
                    marketplace = _d.sent();
                    pluginEntry = marketplace.plugins.find(function (p) { return p.name === pluginName; });
                    if (pluginEntry) {
                        foundPlugin = pluginEntry;
                        foundMarketplace = mktName;
                        marketplaceInstallLocation = mktConfig.installLocation;
                        return [3 /*break*/, 9];
                    }
                    return [3 /*break*/, 8];
                case 7:
                    error_1 = _d.sent();
                    (0, log_js_1.logError)((0, errors_js_1.toError)(error_1));
                    return [3 /*break*/, 8];
                case 8:
                    _i++;
                    return [3 /*break*/, 4];
                case 9:
                    if (!foundPlugin || !foundMarketplace) {
                        location_1 = marketplaceName
                            ? "marketplace \"".concat(marketplaceName, "\"")
                            : 'any configured marketplace';
                        return [2 /*return*/, {
                                success: false,
                                message: "Plugin \"".concat(pluginName, "\" not found in ").concat(location_1),
                            }];
                    }
                    entry = foundPlugin;
                    pluginId = "".concat(entry.name, "@").concat(foundMarketplace);
                    return [4 /*yield*/, (0, pluginInstallationHelpers_js_1.installResolvedPlugin)({
                            pluginId: pluginId,
                            entry: entry,
                            scope: scope,
                            marketplaceInstallLocation: marketplaceInstallLocation,
                        })];
                case 10:
                    result = _d.sent();
                    if (!result.ok) {
                        switch (result.reason) {
                            case 'local-source-no-location':
                                return [2 /*return*/, {
                                        success: false,
                                        message: "Cannot install local plugin \"".concat(result.pluginName, "\" without marketplace install location"),
                                    }];
                            case 'settings-write-failed':
                                return [2 /*return*/, {
                                        success: false,
                                        message: "Failed to update settings: ".concat(result.message),
                                    }];
                            case 'resolution-failed':
                                return [2 /*return*/, {
                                        success: false,
                                        message: (0, pluginInstallationHelpers_js_1.formatResolutionError)(result.resolution),
                                    }];
                            case 'blocked-by-policy':
                                return [2 /*return*/, {
                                        success: false,
                                        message: "Plugin \"".concat(result.pluginName, "\" is blocked by your organization's policy and cannot be installed"),
                                    }];
                            case 'dependency-blocked-by-policy':
                                return [2 /*return*/, {
                                        success: false,
                                        message: "Plugin \"".concat(result.pluginName, "\" depends on \"").concat(result.blockedDependency, "\", which is blocked by your organization's policy"),
                                    }];
                        }
                    }
                    return [2 /*return*/, {
                            success: true,
                            message: "Successfully installed plugin: ".concat(pluginId, " (scope: ").concat(scope, ")").concat(result.depNote),
                            pluginId: pluginId,
                            pluginName: entry.name,
                            scope: scope,
                        }];
            }
        });
    });
}
/**
 * Uninstall a plugin
 *
 * @param plugin Plugin name or plugin@marketplace identifier
 * @param scope Uninstall from scope: user, project, or local (defaults to 'user')
 * @returns Result indicating success/failure
 */
function uninstallPluginOp(plugin_1) {
    return __awaiter(this, arguments, void 0, function (plugin, scope, deleteDataDir) {
        var _a, enabled, disabled, allPlugins, foundPlugin, settingSource, settings, pluginId, pluginName, resolved, projectPath, installedData, installations, scopeInstallation, actualScope, installPath, newEnabledPlugins, updatedData, remainingInstallations, isLastScope, reverseDependents, depWarn;
        var _b, _c;
        if (scope === void 0) { scope = 'user'; }
        if (deleteDataDir === void 0) { deleteDataDir = true; }
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    // Validate scope at runtime for early error detection
                    assertInstallableScope(scope);
                    return [4 /*yield*/, (0, pluginLoader_js_1.loadAllPlugins)()];
                case 1:
                    _a = _d.sent(), enabled = _a.enabled, disabled = _a.disabled;
                    allPlugins = __spreadArray(__spreadArray([], enabled, true), disabled, true);
                    foundPlugin = findPluginByIdentifier(plugin, allPlugins);
                    settingSource = (0, pluginIdentifier_js_1.scopeToSettingSource)(scope);
                    settings = (0, settings_js_1.getSettingsForSource)(settingSource);
                    if (foundPlugin) {
                        // Find the matching settings key for this plugin (may differ from `plugin`
                        // if user gave short name but settings has plugin@marketplace)
                        pluginId =
                            (_c = Object.keys((_b = settings === null || settings === void 0 ? void 0 : settings.enabledPlugins) !== null && _b !== void 0 ? _b : {}).find(function (k) {
                                return k === plugin ||
                                    k === foundPlugin.name ||
                                    k.startsWith("".concat(foundPlugin.name, "@"));
                            })) !== null && _c !== void 0 ? _c : (plugin.includes('@') ? plugin : foundPlugin.name);
                        pluginName = foundPlugin.name;
                    }
                    else {
                        resolved = resolveDelistedPluginId(plugin);
                        if (!resolved) {
                            return [2 /*return*/, {
                                    success: false,
                                    message: "Plugin \"".concat(plugin, "\" not found in installed plugins"),
                                }];
                        }
                        pluginId = resolved.pluginId;
                        pluginName = resolved.pluginName;
                    }
                    projectPath = getProjectPathForScope(scope);
                    installedData = (0, installedPluginsManager_js_1.loadInstalledPluginsV2)();
                    installations = installedData.plugins[pluginId];
                    scopeInstallation = installations === null || installations === void 0 ? void 0 : installations.find(function (i) { return i.scope === scope && i.projectPath === projectPath; });
                    if (!scopeInstallation) {
                        actualScope = getPluginInstallationFromV2(pluginId).scope;
                        if (actualScope !== scope && installations && installations.length > 0) {
                            // Project scope is special: .claude/settings.json is shared with the team.
                            // Point users at the local-override escape hatch instead of --scope project.
                            if (actualScope === 'project') {
                                return [2 /*return*/, {
                                        success: false,
                                        message: "Plugin \"".concat(plugin, "\" is enabled at project scope (.claude/settings.json, shared with your team). To disable just for you: claude plugin disable ").concat(plugin, " --scope local"),
                                    }];
                            }
                            return [2 /*return*/, {
                                    success: false,
                                    message: "Plugin \"".concat(plugin, "\" is installed in ").concat(actualScope, " scope, not ").concat(scope, ". Use --scope ").concat(actualScope, " to uninstall."),
                                }];
                        }
                        return [2 /*return*/, {
                                success: false,
                                message: "Plugin \"".concat(plugin, "\" is not installed in ").concat(scope, " scope. Use --scope to specify the correct scope."),
                            }];
                    }
                    installPath = scopeInstallation.installPath;
                    newEnabledPlugins = __assign({}, settings === null || settings === void 0 ? void 0 : settings.enabledPlugins);
                    newEnabledPlugins[pluginId] = undefined;
                    (0, settings_js_1.updateSettingsForSource)(settingSource, {
                        enabledPlugins: newEnabledPlugins,
                    });
                    (0, cacheUtils_js_1.clearAllCaches)();
                    // Remove from installed_plugins_v2.json for this scope
                    (0, installedPluginsManager_js_1.removePluginInstallation)(pluginId, scope, projectPath);
                    updatedData = (0, installedPluginsManager_js_1.loadInstalledPluginsV2)();
                    remainingInstallations = updatedData.plugins[pluginId];
                    isLastScope = !remainingInstallations || remainingInstallations.length === 0;
                    if (!(isLastScope && installPath)) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, cacheUtils_js_1.markPluginVersionOrphaned)(installPath)];
                case 2:
                    _d.sent();
                    _d.label = 3;
                case 3:
                    if (!isLastScope) return [3 /*break*/, 5];
                    (0, pluginOptionsStorage_js_1.deletePluginOptions)(pluginId);
                    if (!deleteDataDir) return [3 /*break*/, 5];
                    return [4 /*yield*/, (0, pluginDirectories_js_1.deletePluginDataDir)(pluginId)];
                case 4:
                    _d.sent();
                    _d.label = 5;
                case 5:
                    reverseDependents = (0, dependencyResolver_js_1.findReverseDependents)(pluginId, allPlugins);
                    depWarn = (0, dependencyResolver_js_1.formatReverseDependentsSuffix)(reverseDependents);
                    return [2 /*return*/, {
                            success: true,
                            message: "Successfully uninstalled plugin: ".concat(pluginName, " (scope: ").concat(scope, ")").concat(depWarn),
                            pluginId: pluginId,
                            pluginName: pluginName,
                            scope: scope,
                            reverseDependents: reverseDependents.length > 0 ? reverseDependents : undefined,
                        }];
            }
        });
    });
}
/**
 * Set plugin enabled/disabled status (settings-first).
 *
 * Resolves the plugin ID and scope from settings — does NOT pre-gate on
 * installed_plugins.json. Settings declares intent; if the plugin isn't
 * cached yet, the next load will cache it.
 *
 * @param plugin Plugin name or plugin@marketplace identifier
 * @param enabled true to enable, false to disable
 * @param scope Optional scope. If not provided, auto-detects the most specific
 *   scope where the plugin is mentioned in settings.
 * @returns Result indicating success/failure
 */
function setPluginEnabledOp(plugin, enabled, scope) {
    return __awaiter(this, void 0, void 0, function () {
        var operation, error_2, pluginName_1, pluginId, resolvedScope, found, settingSource, scopeSettingsValue, SCOPE_PRECEDENCE, isOverride, isCurrentlyEnabled, reverseDependents, _a, loadedEnabled, disabled, rdeps, error, pluginName, depWarn;
        var _b, _c;
        var _d, _e, _f, _g;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    operation = enabled ? 'enable' : 'disable';
                    // Built-in plugins: always use user-scope settings, bypass the normal
                    // scope-resolution + installed_plugins lookup (they're not installed).
                    if ((0, builtinPlugins_js_1.isBuiltinPluginId)(plugin)) {
                        error_2 = (0, settings_js_1.updateSettingsForSource)('userSettings', {
                            enabledPlugins: __assign(__assign({}, (_d = (0, settings_js_1.getSettingsForSource)('userSettings')) === null || _d === void 0 ? void 0 : _d.enabledPlugins), (_b = {}, _b[plugin] = enabled, _b)),
                        }).error;
                        if (error_2) {
                            return [2 /*return*/, {
                                    success: false,
                                    message: "Failed to ".concat(operation, " built-in plugin: ").concat(error_2.message),
                                }];
                        }
                        (0, cacheUtils_js_1.clearAllCaches)();
                        pluginName_1 = (0, pluginIdentifier_js_1.parsePluginIdentifier)(plugin).name;
                        return [2 /*return*/, {
                                success: true,
                                message: "Successfully ".concat(operation, "d built-in plugin: ").concat(pluginName_1),
                                pluginId: plugin,
                                pluginName: pluginName_1,
                                scope: 'user',
                            }];
                    }
                    if (scope) {
                        assertInstallableScope(scope);
                    }
                    found = findPluginInSettings(plugin);
                    if (scope) {
                        // Explicit scope: use it. Resolve pluginId from settings if possible,
                        // otherwise require a full plugin@marketplace identifier.
                        resolvedScope = scope;
                        if (found) {
                            pluginId = found.pluginId;
                        }
                        else if (plugin.includes('@')) {
                            pluginId = plugin;
                        }
                        else {
                            return [2 /*return*/, {
                                    success: false,
                                    message: "Plugin \"".concat(plugin, "\" not found in settings. Use plugin@marketplace format."),
                                }];
                        }
                    }
                    else if (found) {
                        // Auto-detect scope: use the most specific scope where the plugin is
                        // mentioned in settings.
                        pluginId = found.pluginId;
                        resolvedScope = found.scope;
                    }
                    else if (plugin.includes('@')) {
                        // Not in any settings scope, but full pluginId given — default to user
                        // scope (matches install default). This allows enabling a plugin that
                        // was cached but never declared.
                        pluginId = plugin;
                        resolvedScope = 'user';
                    }
                    else {
                        return [2 /*return*/, {
                                success: false,
                                message: "Plugin \"".concat(plugin, "\" not found in any editable settings scope. Use plugin@marketplace format."),
                            }];
                    }
                    // ── Policy guard ──
                    // Org-blocked plugins cannot be enabled at any scope. Check after pluginId
                    // is resolved so we catch both full identifiers and bare-name lookups.
                    if (enabled && (0, pluginPolicy_js_1.isPluginBlockedByPolicy)(pluginId)) {
                        return [2 /*return*/, {
                                success: false,
                                message: "Plugin \"".concat(pluginId, "\" is blocked by your organization's policy and cannot be enabled"),
                            }];
                    }
                    settingSource = (0, pluginIdentifier_js_1.scopeToSettingSource)(resolvedScope);
                    scopeSettingsValue = (_f = (_e = (0, settings_js_1.getSettingsForSource)(settingSource)) === null || _e === void 0 ? void 0 : _e.enabledPlugins) === null || _f === void 0 ? void 0 : _f[pluginId];
                    SCOPE_PRECEDENCE = {
                        user: 0,
                        project: 1,
                        local: 2,
                    };
                    isOverride = scope && found && SCOPE_PRECEDENCE[scope] > SCOPE_PRECEDENCE[found.scope];
                    if (scope &&
                        scopeSettingsValue === undefined &&
                        found &&
                        found.scope !== scope &&
                        !isOverride) {
                        return [2 /*return*/, {
                                success: false,
                                message: "Plugin \"".concat(plugin, "\" is installed at ").concat(found.scope, " scope, not ").concat(scope, ". Use --scope ").concat(found.scope, " or omit --scope to auto-detect."),
                            }];
                    }
                    isCurrentlyEnabled = scope && !isOverride
                        ? scopeSettingsValue === true
                        : (0, pluginStartupCheck_js_1.getPluginEditableScopes)().has(pluginId);
                    if (enabled === isCurrentlyEnabled) {
                        return [2 /*return*/, {
                                success: false,
                                message: "Plugin \"".concat(plugin, "\" is already ").concat(enabled ? 'enabled' : 'disabled').concat(scope ? " at ".concat(scope, " scope") : ''),
                            }];
                    }
                    if (!!enabled) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, pluginLoader_js_1.loadAllPlugins)()];
                case 1:
                    _a = _h.sent(), loadedEnabled = _a.enabled, disabled = _a.disabled;
                    rdeps = (0, dependencyResolver_js_1.findReverseDependents)(pluginId, __spreadArray(__spreadArray([], loadedEnabled, true), disabled, true));
                    if (rdeps.length > 0)
                        reverseDependents = rdeps;
                    _h.label = 2;
                case 2:
                    error = (0, settings_js_1.updateSettingsForSource)(settingSource, {
                        enabledPlugins: __assign(__assign({}, (_g = (0, settings_js_1.getSettingsForSource)(settingSource)) === null || _g === void 0 ? void 0 : _g.enabledPlugins), (_c = {}, _c[pluginId] = enabled, _c)),
                    }).error;
                    if (error) {
                        return [2 /*return*/, {
                                success: false,
                                message: "Failed to ".concat(operation, " plugin: ").concat(error.message),
                            }];
                    }
                    (0, cacheUtils_js_1.clearAllCaches)();
                    pluginName = (0, pluginIdentifier_js_1.parsePluginIdentifier)(pluginId).name;
                    depWarn = (0, dependencyResolver_js_1.formatReverseDependentsSuffix)(reverseDependents);
                    return [2 /*return*/, {
                            success: true,
                            message: "Successfully ".concat(operation, "d plugin: ").concat(pluginName, " (scope: ").concat(resolvedScope, ")").concat(depWarn),
                            pluginId: pluginId,
                            pluginName: pluginName,
                            scope: resolvedScope,
                            reverseDependents: reverseDependents,
                        }];
            }
        });
    });
}
/**
 * Enable a plugin
 *
 * @param plugin Plugin name or plugin@marketplace identifier
 * @param scope Optional scope. If not provided, finds the most specific scope for the current project.
 * @returns Result indicating success/failure
 */
function enablePluginOp(plugin, scope) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, setPluginEnabledOp(plugin, true, scope)];
        });
    });
}
/**
 * Disable a plugin
 *
 * @param plugin Plugin name or plugin@marketplace identifier
 * @param scope Optional scope. If not provided, finds the most specific scope for the current project.
 * @returns Result indicating success/failure
 */
function disablePluginOp(plugin, scope) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, setPluginEnabledOp(plugin, false, scope)];
        });
    });
}
/**
 * Disable all enabled plugins
 *
 * @returns Result indicating success/failure with count of disabled plugins
 */
function disableAllPluginsOp() {
    return __awaiter(this, void 0, void 0, function () {
        var enabledPlugins, disabled, errors, _i, enabledPlugins_1, pluginId, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    enabledPlugins = (0, pluginStartupCheck_js_1.getPluginEditableScopes)();
                    if (enabledPlugins.size === 0) {
                        return [2 /*return*/, { success: true, message: 'No enabled plugins to disable' }];
                    }
                    disabled = [];
                    errors = [];
                    _i = 0, enabledPlugins_1 = enabledPlugins;
                    _a.label = 1;
                case 1:
                    if (!(_i < enabledPlugins_1.length)) return [3 /*break*/, 4];
                    pluginId = enabledPlugins_1[_i][0];
                    return [4 /*yield*/, setPluginEnabledOp(pluginId, false)];
                case 2:
                    result = _a.sent();
                    if (result.success) {
                        disabled.push(pluginId);
                    }
                    else {
                        errors.push("".concat(pluginId, ": ").concat(result.message));
                    }
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    if (errors.length > 0) {
                        return [2 /*return*/, {
                                success: false,
                                message: "Disabled ".concat(disabled.length, " ").concat((0, stringUtils_js_1.plural)(disabled.length, 'plugin'), ", ").concat(errors.length, " failed:\n").concat(errors.join('\n')),
                            }];
                    }
                    return [2 /*return*/, {
                            success: true,
                            message: "Disabled ".concat(disabled.length, " ").concat((0, stringUtils_js_1.plural)(disabled.length, 'plugin')),
                        }];
            }
        });
    });
}
/**
 * Update a plugin to the latest version.
 *
 * This function performs a NON-INPLACE update:
 * 1. Gets the plugin info from the marketplace
 * 2. For remote plugins: downloads to temp dir and calculates version
 * 3. For local plugins: calculates version from marketplace source
 * 4. If version differs from currently installed, copies to new versioned cache directory
 * 5. Updates installation in V2 file (memory stays unchanged until restart)
 * 6. Cleans up old version if no longer referenced by any installation
 *
 * @param plugin Plugin name or plugin@marketplace identifier
 * @param scope Scope to update. Unlike install/uninstall/enable/disable, managed scope IS allowed.
 * @returns Result indicating success/failure with version info
 */
function updatePluginOp(plugin, scope) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, pluginName, marketplaceName, pluginId, pluginInfo, entry, marketplaceInstallLocation, diskData, installations, projectPath, installation, scopeDesc;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = (0, pluginIdentifier_js_1.parsePluginIdentifier)(plugin), pluginName = _a.name, marketplaceName = _a.marketplace;
                    pluginId = marketplaceName ? "".concat(pluginName, "@").concat(marketplaceName) : plugin;
                    return [4 /*yield*/, (0, marketplaceManager_js_1.getPluginById)(plugin)];
                case 1:
                    pluginInfo = _b.sent();
                    if (!pluginInfo) {
                        return [2 /*return*/, {
                                success: false,
                                message: "Plugin \"".concat(pluginName, "\" not found"),
                                pluginId: pluginId,
                                scope: scope,
                            }];
                    }
                    entry = pluginInfo.entry, marketplaceInstallLocation = pluginInfo.marketplaceInstallLocation;
                    diskData = (0, installedPluginsManager_js_1.loadInstalledPluginsFromDisk)();
                    installations = diskData.plugins[pluginId];
                    if (!installations || installations.length === 0) {
                        return [2 /*return*/, {
                                success: false,
                                message: "Plugin \"".concat(pluginName, "\" is not installed"),
                                pluginId: pluginId,
                                scope: scope,
                            }];
                    }
                    projectPath = getProjectPathForScope(scope);
                    installation = installations.find(function (inst) { return inst.scope === scope && inst.projectPath === projectPath; });
                    if (!installation) {
                        scopeDesc = projectPath ? "".concat(scope, " (").concat(projectPath, ")") : scope;
                        return [2 /*return*/, {
                                success: false,
                                message: "Plugin \"".concat(pluginName, "\" is not installed at scope ").concat(scopeDesc),
                                pluginId: pluginId,
                                scope: scope,
                            }];
                    }
                    return [2 /*return*/, performPluginUpdate({
                            pluginId: pluginId,
                            pluginName: pluginName,
                            entry: entry,
                            marketplaceInstallLocation: marketplaceInstallLocation,
                            installation: installation,
                            scope: scope,
                            projectPath: projectPath,
                        })];
            }
        });
    });
}
/**
 * Perform the actual plugin update: fetch source, calculate version, copy to cache, update disk.
 * This is the core update execution extracted from updatePluginOp.
 */
function performPluginUpdate(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var fs, oldVersion, sourcePath, newVersion, shouldCleanupSource, gitCommitSha, cacheResult, marketplaceStats, e_1, marketplaceDir, e_2, pluginManifest, manifestPath, _c, versionedPath, zipPath, isUpToDate, oldVersionPath_1, updatedDiskData, isOldVersionStillReferenced, scopeDesc, message;
        var pluginId = _b.pluginId, pluginName = _b.pluginName, entry = _b.entry, marketplaceInstallLocation = _b.marketplaceInstallLocation, installation = _b.installation, scope = _b.scope, projectPath = _b.projectPath;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    oldVersion = installation.version;
                    shouldCleanupSource = false;
                    if (!(typeof entry.source !== 'string')) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, pluginLoader_js_1.cachePlugin)(entry.source, {
                            manifest: { name: entry.name },
                        })];
                case 1:
                    cacheResult = _d.sent();
                    sourcePath = cacheResult.path;
                    shouldCleanupSource = true;
                    gitCommitSha = cacheResult.gitCommitSha;
                    return [4 /*yield*/, (0, pluginVersioning_js_1.calculatePluginVersion)(pluginId, entry.source, cacheResult.manifest, cacheResult.path, entry.version, cacheResult.gitCommitSha)];
                case 2:
                    // Calculate version from downloaded plugin. For git-subdir sources,
                    // cachePlugin captured the commit SHA before discarding the ephemeral
                    // clone (the extracted subdir has no .git, so the installPath-based
                    // fallback in calculatePluginVersion can't recover it).
                    newVersion = _d.sent();
                    return [3 /*break*/, 17];
                case 3:
                    marketplaceStats = void 0;
                    _d.label = 4;
                case 4:
                    _d.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, fs.stat(marketplaceInstallLocation)];
                case 5:
                    marketplaceStats = _d.sent();
                    return [3 /*break*/, 7];
                case 6:
                    e_1 = _d.sent();
                    if ((0, errors_js_1.isENOENT)(e_1)) {
                        return [2 /*return*/, {
                                success: false,
                                message: "Marketplace directory not found at ".concat(marketplaceInstallLocation),
                                pluginId: pluginId,
                                scope: scope,
                            }];
                    }
                    throw e_1;
                case 7:
                    marketplaceDir = marketplaceStats.isDirectory()
                        ? marketplaceInstallLocation
                        : (0, path_1.dirname)(marketplaceInstallLocation);
                    sourcePath = (0, path_1.join)(marketplaceDir, entry.source);
                    _d.label = 8;
                case 8:
                    _d.trys.push([8, 10, , 11]);
                    return [4 /*yield*/, fs.stat(sourcePath)];
                case 9:
                    _d.sent();
                    return [3 /*break*/, 11];
                case 10:
                    e_2 = _d.sent();
                    if ((0, errors_js_1.isENOENT)(e_2)) {
                        return [2 /*return*/, {
                                success: false,
                                message: "Plugin source not found at ".concat(sourcePath),
                                pluginId: pluginId,
                                scope: scope,
                            }];
                    }
                    throw e_2;
                case 11:
                    pluginManifest = void 0;
                    manifestPath = (0, path_1.join)(sourcePath, '.claude-plugin', 'plugin.json');
                    _d.label = 12;
                case 12:
                    _d.trys.push([12, 14, , 15]);
                    return [4 /*yield*/, (0, pluginLoader_js_1.loadPluginManifest)(manifestPath, entry.name, entry.source)];
                case 13:
                    pluginManifest = _d.sent();
                    return [3 /*break*/, 15];
                case 14:
                    _c = _d.sent();
                    return [3 /*break*/, 15];
                case 15: return [4 /*yield*/, (0, pluginVersioning_js_1.calculatePluginVersion)(pluginId, entry.source, pluginManifest, sourcePath, entry.version)];
                case 16:
                    // Calculate version from plugin source path
                    newVersion = _d.sent();
                    _d.label = 17;
                case 17:
                    _d.trys.push([17, , 21, 24]);
                    versionedPath = (0, pluginLoader_js_1.getVersionedCachePath)(pluginId, newVersion);
                    zipPath = (0, pluginLoader_js_1.getVersionedZipCachePath)(pluginId, newVersion);
                    isUpToDate = installation.version === newVersion ||
                        installation.installPath === versionedPath ||
                        installation.installPath === zipPath;
                    if (isUpToDate) {
                        return [2 /*return*/, {
                                success: true,
                                message: "".concat(pluginName, " is already at the latest version (").concat(newVersion, ")."),
                                pluginId: pluginId,
                                newVersion: newVersion,
                                oldVersion: oldVersion,
                                alreadyUpToDate: true,
                                scope: scope,
                            }];
                    }
                    return [4 /*yield*/, (0, pluginLoader_js_1.copyPluginToVersionedCache)(sourcePath, pluginId, newVersion, entry)
                        // Store old version path for potential cleanup
                    ];
                case 18:
                    // Copy to versioned cache (returns actual path, which may be .zip)
                    versionedPath = _d.sent();
                    oldVersionPath_1 = installation.installPath;
                    // Update disk JSON file for this installation
                    // (memory stays unchanged until restart)
                    (0, installedPluginsManager_js_1.updateInstallationPathOnDisk)(pluginId, scope, projectPath, versionedPath, newVersion, gitCommitSha);
                    if (!(oldVersionPath_1 && oldVersionPath_1 !== versionedPath)) return [3 /*break*/, 20];
                    updatedDiskData = (0, installedPluginsManager_js_1.loadInstalledPluginsFromDisk)();
                    isOldVersionStillReferenced = Object.values(updatedDiskData.plugins).some(function (pluginInstallations) {
                        return pluginInstallations.some(function (inst) { return inst.installPath === oldVersionPath_1; });
                    });
                    if (!!isOldVersionStillReferenced) return [3 /*break*/, 20];
                    return [4 /*yield*/, (0, cacheUtils_js_1.markPluginVersionOrphaned)(oldVersionPath_1)];
                case 19:
                    _d.sent();
                    _d.label = 20;
                case 20:
                    scopeDesc = projectPath ? "".concat(scope, " (").concat(projectPath, ")") : scope;
                    message = "Plugin \"".concat(pluginName, "\" updated from ").concat(oldVersion || 'unknown', " to ").concat(newVersion, " for scope ").concat(scopeDesc, ". Restart to apply changes.");
                    return [2 /*return*/, {
                            success: true,
                            message: message,
                            pluginId: pluginId,
                            newVersion: newVersion,
                            oldVersion: oldVersion,
                            scope: scope,
                        }];
                case 21:
                    if (!(shouldCleanupSource &&
                        sourcePath !== (0, pluginLoader_js_1.getVersionedCachePath)(pluginId, newVersion))) return [3 /*break*/, 23];
                    return [4 /*yield*/, fs.rm(sourcePath, { recursive: true, force: true })];
                case 22:
                    _d.sent();
                    _d.label = 23;
                case 23: return [7 /*endfinally*/];
                case 24: return [2 /*return*/];
            }
        });
    });
}
