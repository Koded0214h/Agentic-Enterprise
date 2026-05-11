"use strict";
/**
 * Background plugin autoupdate functionality
 *
 * At startup, this module:
 * 1. First updates marketplaces that have autoUpdate enabled
 * 2. Then checks all installed plugins from those marketplaces and updates them
 *
 * Updates are non-inplace (disk-only), requiring a restart to take effect.
 * Official Anthropic marketplaces have autoUpdate enabled by default,
 * but users can disable it per-marketplace.
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
exports.onPluginsAutoUpdated = onPluginsAutoUpdated;
exports.getAutoUpdatedPluginNames = getAutoUpdatedPluginNames;
exports.updatePluginsForMarketplaces = updatePluginsForMarketplaces;
exports.autoUpdateMarketplacesAndPluginsInBackground = autoUpdateMarketplacesAndPluginsInBackground;
var pluginOperations_js_1 = require("../../services/plugins/pluginOperations.js");
var config_js_1 = require("../config.js");
var debug_js_1 = require("../debug.js");
var errors_js_1 = require("../errors.js");
var log_js_1 = require("../log.js");
var installedPluginsManager_js_1 = require("./installedPluginsManager.js");
var marketplaceManager_js_1 = require("./marketplaceManager.js");
var pluginIdentifier_js_1 = require("./pluginIdentifier.js");
var schemas_js_1 = require("./schemas.js");
// Store callback for plugin update notifications
var pluginUpdateCallback = null;
// Store pending updates that occurred before callback was registered
// This handles the race condition where updates complete before REPL mounts
var pendingNotification = null;
/**
 * Register a callback to be notified when plugins are auto-updated.
 * This is used by the REPL to show restart notifications.
 *
 * If plugins were already updated before the callback was registered,
 * the callback will be invoked immediately with the pending updates.
 */
function onPluginsAutoUpdated(callback) {
    pluginUpdateCallback = callback;
    // If there are pending updates that happened before registration, deliver them now
    if (pendingNotification !== null && pendingNotification.length > 0) {
        callback(pendingNotification);
        pendingNotification = null;
    }
    return function () {
        pluginUpdateCallback = null;
    };
}
/**
 * Check if pending updates came from autoupdate (for notification purposes).
 * Returns the list of plugin names that have pending updates.
 */
function getAutoUpdatedPluginNames() {
    if (!(0, installedPluginsManager_js_1.hasPendingUpdates)()) {
        return [];
    }
    return (0, installedPluginsManager_js_1.getPendingUpdatesDetails)().map(function (d) { return (0, pluginIdentifier_js_1.parsePluginIdentifier)(d.pluginId).name; });
}
/**
 * Get the set of marketplaces that have autoUpdate enabled.
 * Returns the marketplace names that should be auto-updated.
 */
function getAutoUpdateEnabledMarketplaces() {
    return __awaiter(this, void 0, void 0, function () {
        var config, declared, enabled, _i, _a, _b, name_1, entry, declaredAutoUpdate, autoUpdate;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, (0, marketplaceManager_js_1.loadKnownMarketplacesConfig)()];
                case 1:
                    config = _d.sent();
                    declared = (0, marketplaceManager_js_1.getDeclaredMarketplaces)();
                    enabled = new Set();
                    for (_i = 0, _a = Object.entries(config); _i < _a.length; _i++) {
                        _b = _a[_i], name_1 = _b[0], entry = _b[1];
                        declaredAutoUpdate = (_c = declared[name_1]) === null || _c === void 0 ? void 0 : _c.autoUpdate;
                        autoUpdate = declaredAutoUpdate !== undefined
                            ? declaredAutoUpdate
                            : (0, schemas_js_1.isMarketplaceAutoUpdate)(name_1, entry);
                        if (autoUpdate) {
                            enabled.add(name_1.toLowerCase());
                        }
                    }
                    return [2 /*return*/, enabled];
            }
        });
    });
}
/**
 * Update a single plugin's installations.
 * Returns the plugin ID if any installation was updated, null otherwise.
 */
function updatePlugin(pluginId, installations) {
    return __awaiter(this, void 0, void 0, function () {
        var wasUpdated, _i, installations_1, scope, result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    wasUpdated = false;
                    _i = 0, installations_1 = installations;
                    _a.label = 1;
                case 1:
                    if (!(_i < installations_1.length)) return [3 /*break*/, 6];
                    scope = installations_1[_i].scope;
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, pluginOperations_js_1.updatePluginOp)(pluginId, scope)];
                case 3:
                    result = _a.sent();
                    if (result.success && !result.alreadyUpToDate) {
                        wasUpdated = true;
                        (0, debug_js_1.logForDebugging)("Plugin autoupdate: updated ".concat(pluginId, " from ").concat(result.oldVersion, " to ").concat(result.newVersion));
                    }
                    else if (!result.alreadyUpToDate) {
                        (0, debug_js_1.logForDebugging)("Plugin autoupdate: failed to update ".concat(pluginId, ": ").concat(result.message), { level: 'warn' });
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    (0, debug_js_1.logForDebugging)("Plugin autoupdate: error updating ".concat(pluginId, ": ").concat((0, errors_js_1.errorMessage)(error_1)), { level: 'warn' });
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/, wasUpdated ? pluginId : null];
            }
        });
    });
}
/**
 * Update all project-relevant installed plugins from the given marketplaces.
 *
 * Iterates installed_plugins.json, filters to plugins whose marketplace is in
 * the set, further filters each plugin's installations to those relevant to
 * the current project (user/managed scope, or project/local scope matching
 * cwd — see isInstallationRelevantToCurrentProject), then calls updatePluginOp
 * per installation. Already-up-to-date plugins are silently skipped.
 *
 * Called by:
 * - updatePlugins() below — background autoupdate path (autoUpdate-enabled
 *   marketplaces only; third-party marketplaces default autoUpdate: false)
 * - ManageMarketplaces.tsx applyChanges() — user-initiated /plugin marketplace
 *   update. Before #29512 this path only called refreshMarketplace() (git
 *   pull on the marketplace clone), so the loader would create the new
 *   version cache dir but installed_plugins.json stayed on the old version,
 *   and the orphan GC stamped the NEW dir with .orphaned_at on next startup.
 *
 * @param marketplaceNames - lowercase marketplace names to update plugins from
 * @returns plugin IDs that were actually updated (not already up-to-date)
 */
function updatePluginsForMarketplaces(marketplaceNames) {
    return __awaiter(this, void 0, void 0, function () {
        var installedPlugins, pluginIds, results;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    installedPlugins = (0, installedPluginsManager_js_1.loadInstalledPluginsFromDisk)();
                    pluginIds = Object.keys(installedPlugins.plugins);
                    if (pluginIds.length === 0) {
                        return [2 /*return*/, []];
                    }
                    return [4 /*yield*/, Promise.allSettled(pluginIds.map(function (pluginId) { return __awaiter(_this, void 0, void 0, function () {
                            var marketplace, allInstallations, relevantInstallations;
                            return __generator(this, function (_a) {
                                marketplace = (0, pluginIdentifier_js_1.parsePluginIdentifier)(pluginId).marketplace;
                                if (!marketplace || !marketplaceNames.has(marketplace.toLowerCase())) {
                                    return [2 /*return*/, null];
                                }
                                allInstallations = installedPlugins.plugins[pluginId];
                                if (!allInstallations || allInstallations.length === 0) {
                                    return [2 /*return*/, null];
                                }
                                relevantInstallations = allInstallations.filter(installedPluginsManager_js_1.isInstallationRelevantToCurrentProject);
                                if (relevantInstallations.length === 0) {
                                    return [2 /*return*/, null];
                                }
                                return [2 /*return*/, updatePlugin(pluginId, relevantInstallations)];
                            });
                        }); }))];
                case 1:
                    results = _a.sent();
                    return [2 /*return*/, results
                            .filter(function (r) {
                            return r.status === 'fulfilled' && r.value !== null;
                        })
                            .map(function (r) { return r.value; })];
            }
        });
    });
}
/**
 * Update plugins from marketplaces that have autoUpdate enabled.
 * Returns the list of plugin IDs that were updated.
 */
function updatePlugins(autoUpdateEnabledMarketplaces) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, updatePluginsForMarketplaces(autoUpdateEnabledMarketplaces)];
        });
    });
}
/**
 * Auto-update marketplaces and plugins in the background.
 *
 * This function:
 * 1. Checks which marketplaces have autoUpdate enabled
 * 2. Refreshes only those marketplaces (git pull/re-download)
 * 3. Updates installed plugins from those marketplaces
 * 4. If any plugins were updated, notifies via the registered callback
 *
 * Official Anthropic marketplaces have autoUpdate enabled by default,
 * but users can disable it per-marketplace in the UI.
 *
 * This function runs silently without blocking user interaction.
 * Called from main.tsx during startup as a background job.
 */
function autoUpdateMarketplacesAndPluginsInBackground() {
    var _this = this;
    void (function () { return __awaiter(_this, void 0, void 0, function () {
        var autoUpdateEnabledMarketplaces, refreshResults, failures, updatedPlugins, error_2;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if ((0, config_js_1.shouldSkipPluginAutoupdate)()) {
                        (0, debug_js_1.logForDebugging)('Plugin autoupdate: skipped (auto-updater disabled)');
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, getAutoUpdateEnabledMarketplaces()];
                case 2:
                    autoUpdateEnabledMarketplaces = _a.sent();
                    if (autoUpdateEnabledMarketplaces.size === 0) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, Promise.allSettled(Array.from(autoUpdateEnabledMarketplaces).map(function (name) { return __awaiter(_this, void 0, void 0, function () {
                            var error_3;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, (0, marketplaceManager_js_1.refreshMarketplace)(name, undefined, {
                                                disableCredentialHelper: true,
                                            })];
                                    case 1:
                                        _a.sent();
                                        return [3 /*break*/, 3];
                                    case 2:
                                        error_3 = _a.sent();
                                        (0, debug_js_1.logForDebugging)("Plugin autoupdate: failed to refresh marketplace ".concat(name, ": ").concat((0, errors_js_1.errorMessage)(error_3)), { level: 'warn' });
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); }))
                        // Log any refresh failures
                    ];
                case 3:
                    refreshResults = _a.sent();
                    failures = refreshResults.filter(function (r) { return r.status === 'rejected'; });
                    if (failures.length > 0) {
                        (0, debug_js_1.logForDebugging)("Plugin autoupdate: ".concat(failures.length, " marketplace refresh(es) failed"), { level: 'warn' });
                    }
                    (0, debug_js_1.logForDebugging)('Plugin autoupdate: checking installed plugins');
                    return [4 /*yield*/, updatePlugins(autoUpdateEnabledMarketplaces)];
                case 4:
                    updatedPlugins = _a.sent();
                    if (updatedPlugins.length > 0) {
                        if (pluginUpdateCallback) {
                            // Callback is already registered, invoke it immediately
                            pluginUpdateCallback(updatedPlugins);
                        }
                        else {
                            // Callback not yet registered (REPL not mounted), store for later delivery
                            pendingNotification = updatedPlugins;
                        }
                    }
                    return [3 /*break*/, 6];
                case 5:
                    error_2 = _a.sent();
                    (0, log_js_1.logError)(error_2);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); })();
}
