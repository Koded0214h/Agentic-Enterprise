"use strict";
/**
 * Plugin installation for headless/CCR mode.
 *
 * This module provides plugin installation without AppState updates,
 * suitable for non-interactive environments like CCR.
 *
 * When CLAUDE_CODE_PLUGIN_USE_ZIP_CACHE is enabled, plugins are stored as
 * ZIPs on a mounted volume. The storage layer (pluginLoader.ts) handles
 * ZIP creation on install and extraction on load transparently.
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
exports.installPluginsForHeadless = installPluginsForHeadless;
var index_js_1 = require("../../services/analytics/index.js");
var cleanupRegistry_js_1 = require("../cleanupRegistry.js");
var debug_js_1 = require("../debug.js");
var diagLogs_js_1 = require("../diagLogs.js");
var fsOperations_js_1 = require("../fsOperations.js");
var log_js_1 = require("../log.js");
var marketplaceManager_js_1 = require("./marketplaceManager.js");
var pluginBlocklist_js_1 = require("./pluginBlocklist.js");
var pluginLoader_js_1 = require("./pluginLoader.js");
var reconciler_js_1 = require("./reconciler.js");
var zipCache_js_1 = require("./zipCache.js");
var zipCacheAdapters_js_1 = require("./zipCacheAdapters.js");
/**
 * Install plugins for headless/CCR mode.
 *
 * This is the headless equivalent of performBackgroundPluginInstallations(),
 * but without AppState updates (no UI to update in headless mode).
 *
 * @returns true if any plugins were installed (caller should refresh MCP)
 */
function installPluginsForHeadless() {
    return __awaiter(this, void 0, void 0, function () {
        var zipCacheMode, seedChanged, declaredCount, metrics, pluginsChanged, reconcileResult, marketplacesChanged, newlyDelisted, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    zipCacheMode = (0, zipCache_js_1.isPluginZipCacheEnabled)();
                    (0, debug_js_1.logForDebugging)("installPluginsForHeadless: starting".concat(zipCacheMode ? ' (zip cache mode)' : ''));
                    return [4 /*yield*/, (0, marketplaceManager_js_1.registerSeedMarketplaces)()];
                case 1:
                    seedChanged = _a.sent();
                    if (seedChanged) {
                        (0, marketplaceManager_js_1.clearMarketplacesCache)();
                        (0, pluginLoader_js_1.clearPluginCache)('headlessPluginInstall: seed marketplaces registered');
                    }
                    if (!zipCacheMode) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, fsOperations_js_1.getFsImplementation)().mkdir((0, zipCache_js_1.getZipCacheMarketplacesDir)())];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, fsOperations_js_1.getFsImplementation)().mkdir((0, zipCache_js_1.getZipCachePluginsDir)())];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    declaredCount = Object.keys((0, marketplaceManager_js_1.getDeclaredMarketplaces)()).length;
                    metrics = {
                        marketplaces_installed: 0,
                        delisted_count: 0,
                    };
                    pluginsChanged = seedChanged;
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 12, 13, 14]);
                    if (!(declaredCount === 0)) return [3 /*break*/, 6];
                    (0, debug_js_1.logForDebugging)('installPluginsForHeadless: no marketplaces declared');
                    return [3 /*break*/, 8];
                case 6: return [4 /*yield*/, (0, diagLogs_js_1.withDiagnosticsTiming)('headless_marketplace_reconcile', function () {
                        return (0, reconciler_js_1.reconcileMarketplaces)({
                            skip: zipCacheMode
                                ? function (_name, source) {
                                    return !(0, zipCache_js_1.isMarketplaceSourceSupportedByZipCache)(source);
                                }
                                : undefined,
                            onProgress: function (event) {
                                if (event.type === 'installed') {
                                    (0, debug_js_1.logForDebugging)("installPluginsForHeadless: installed marketplace ".concat(event.name));
                                }
                                else if (event.type === 'failed') {
                                    (0, debug_js_1.logForDebugging)("installPluginsForHeadless: failed to install marketplace ".concat(event.name, ": ").concat(event.error));
                                }
                            },
                        });
                    }, function (r) { return ({
                        installed_count: r.installed.length,
                        updated_count: r.updated.length,
                        failed_count: r.failed.length,
                        skipped_count: r.skipped.length,
                    }); })];
                case 7:
                    reconcileResult = _a.sent();
                    if (reconcileResult.skipped.length > 0) {
                        (0, debug_js_1.logForDebugging)("installPluginsForHeadless: skipped ".concat(reconcileResult.skipped.length, " marketplace(s) unsupported by zip cache: ").concat(reconcileResult.skipped.join(', ')));
                    }
                    marketplacesChanged = reconcileResult.installed.length + reconcileResult.updated.length;
                    // Clear caches so newly-installed marketplace plugins are discoverable.
                    // Plugin caching is the loader's job — after caches clear, the caller's
                    // refreshPluginState() → loadAllPlugins() will cache any missing plugins
                    // from the newly-materialized marketplaces.
                    if (marketplacesChanged > 0) {
                        (0, marketplaceManager_js_1.clearMarketplacesCache)();
                        (0, pluginLoader_js_1.clearPluginCache)('headlessPluginInstall: marketplaces reconciled');
                        pluginsChanged = true;
                    }
                    metrics.marketplaces_installed = marketplacesChanged;
                    _a.label = 8;
                case 8:
                    if (!zipCacheMode) return [3 /*break*/, 10];
                    return [4 /*yield*/, (0, zipCacheAdapters_js_1.syncMarketplacesToZipCache)()];
                case 9:
                    _a.sent();
                    _a.label = 10;
                case 10: return [4 /*yield*/, (0, pluginBlocklist_js_1.detectAndUninstallDelistedPlugins)()];
                case 11:
                    newlyDelisted = _a.sent();
                    metrics.delisted_count = newlyDelisted.length;
                    if (newlyDelisted.length > 0) {
                        pluginsChanged = true;
                    }
                    if (pluginsChanged) {
                        (0, pluginLoader_js_1.clearPluginCache)('headlessPluginInstall: plugins changed');
                    }
                    // Zip cache: register session cleanup for extracted plugin temp dirs
                    if (zipCacheMode) {
                        (0, cleanupRegistry_js_1.registerCleanup)(zipCache_js_1.cleanupSessionPluginCache);
                    }
                    return [2 /*return*/, pluginsChanged];
                case 12:
                    error_1 = _a.sent();
                    (0, log_js_1.logError)(error_1);
                    return [2 /*return*/, false];
                case 13:
                    (0, index_js_1.logEvent)('tengu_headless_plugin_install', metrics);
                    return [7 /*endfinally*/];
                case 14: return [2 /*return*/];
            }
        });
    });
}
