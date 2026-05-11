"use strict";
/**
 * Background plugin and marketplace installation manager
 *
 * This module handles automatic installation of plugins and marketplaces
 * from trusted sources (repository and user settings) without blocking startup.
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
exports.performBackgroundPluginInstallations = performBackgroundPluginInstallations;
var debug_js_1 = require("../../utils/debug.js");
var diagLogs_js_1 = require("../../utils/diagLogs.js");
var log_js_1 = require("../../utils/log.js");
var marketplaceManager_js_1 = require("../../utils/plugins/marketplaceManager.js");
var pluginLoader_js_1 = require("../../utils/plugins/pluginLoader.js");
var reconciler_js_1 = require("../../utils/plugins/reconciler.js");
var refresh_js_1 = require("../../utils/plugins/refresh.js");
var index_js_1 = require("../analytics/index.js");
/**
 * Update marketplace installation status in app state
 */
function updateMarketplaceStatus(setAppState, name, status, error) {
    setAppState(function (prevState) { return (__assign(__assign({}, prevState), { plugins: __assign(__assign({}, prevState.plugins), { installationStatus: __assign(__assign({}, prevState.plugins.installationStatus), { marketplaces: prevState.plugins.installationStatus.marketplaces.map(function (m) { return (m.name === name ? __assign(__assign({}, m), { status: status, error: error }) : m); }) }) }) })); });
}
/**
 * Perform background plugin startup checks and installations.
 *
 * This is a thin wrapper around reconcileMarketplaces() that maps onProgress
 * events to AppState updates for the REPL UI. After marketplaces are
 * reconciled:
 * - New installs → auto-refresh plugins (fixes "plugin-not-found" errors
 *   from the initial cache-only load on fresh homespace/cleared cache)
 * - Updates only → set needsRefresh, show notification for /reload-plugins
 */
function performBackgroundPluginInstallations(setAppState) {
    return __awaiter(this, void 0, void 0, function () {
        var declared, materialized, diff, pendingNames_1, result, metrics, refreshError_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, debug_js_1.logForDebugging)('performBackgroundPluginInstallations called');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 10, , 11]);
                    declared = (0, marketplaceManager_js_1.getDeclaredMarketplaces)();
                    return [4 /*yield*/, (0, marketplaceManager_js_1.loadKnownMarketplacesConfig)().catch(function () { return ({}); })];
                case 2:
                    materialized = _a.sent();
                    diff = (0, reconciler_js_1.diffMarketplaces)(declared, materialized);
                    pendingNames_1 = __spreadArray(__spreadArray([], diff.missing, true), diff.sourceChanged.map(function (c) { return c.name; }), true);
                    // Initialize AppState with pending status. No per-plugin pending status —
                    // plugin load is fast (cache hit or local copy); marketplace clone is the
                    // slow part worth showing progress for.
                    setAppState(function (prev) { return (__assign(__assign({}, prev), { plugins: __assign(__assign({}, prev.plugins), { installationStatus: {
                                marketplaces: pendingNames_1.map(function (name) { return ({
                                    name: name,
                                    status: 'pending',
                                }); }),
                                plugins: [],
                            } }) })); });
                    if (pendingNames_1.length === 0) {
                        return [2 /*return*/];
                    }
                    (0, debug_js_1.logForDebugging)("Installing ".concat(pendingNames_1.length, " marketplace(s) in background"));
                    return [4 /*yield*/, (0, reconciler_js_1.reconcileMarketplaces)({
                            onProgress: function (event) {
                                switch (event.type) {
                                    case 'installing':
                                        updateMarketplaceStatus(setAppState, event.name, 'installing');
                                        break;
                                    case 'installed':
                                        updateMarketplaceStatus(setAppState, event.name, 'installed');
                                        break;
                                    case 'failed':
                                        updateMarketplaceStatus(setAppState, event.name, 'failed', event.error);
                                        break;
                                }
                            },
                        })];
                case 3:
                    result = _a.sent();
                    metrics = {
                        installed_count: result.installed.length,
                        updated_count: result.updated.length,
                        failed_count: result.failed.length,
                        up_to_date_count: result.upToDate.length,
                    };
                    (0, index_js_1.logEvent)('tengu_marketplace_background_install', metrics);
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'tengu_marketplace_background_install', metrics);
                    if (!(result.installed.length > 0)) return [3 /*break*/, 8];
                    // New marketplaces were installed — auto-refresh plugins. This fixes
                    // "Plugin not found in marketplace" errors from the initial cache-only
                    // load (e.g., fresh homespace where marketplace cache was empty).
                    // refreshActivePlugins clears all caches, reloads plugins, and bumps
                    // pluginReconnectKey so MCP connections are re-established.
                    (0, marketplaceManager_js_1.clearMarketplacesCache)();
                    (0, debug_js_1.logForDebugging)("Auto-refreshing plugins after ".concat(result.installed.length, " new marketplace(s) installed"));
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, (0, refresh_js_1.refreshActivePlugins)(setAppState)];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 6:
                    refreshError_1 = _a.sent();
                    // If auto-refresh fails, fall back to needsRefresh notification so
                    // the user can manually run /reload-plugins to recover.
                    (0, log_js_1.logError)(refreshError_1);
                    (0, debug_js_1.logForDebugging)("Auto-refresh failed, falling back to needsRefresh: ".concat(refreshError_1), { level: 'warn' });
                    (0, pluginLoader_js_1.clearPluginCache)('performBackgroundPluginInstallations: auto-refresh failed');
                    setAppState(function (prev) {
                        if (prev.plugins.needsRefresh)
                            return prev;
                        return __assign(__assign({}, prev), { plugins: __assign(__assign({}, prev.plugins), { needsRefresh: true }) });
                    });
                    return [3 /*break*/, 7];
                case 7: return [3 /*break*/, 9];
                case 8:
                    if (result.updated.length > 0) {
                        // Existing marketplaces updated — notify user to run /reload-plugins.
                        // Updates are less urgent and the user should choose when to apply them.
                        (0, marketplaceManager_js_1.clearMarketplacesCache)();
                        (0, pluginLoader_js_1.clearPluginCache)('performBackgroundPluginInstallations: marketplaces reconciled');
                        setAppState(function (prev) {
                            if (prev.plugins.needsRefresh)
                                return prev;
                            return __assign(__assign({}, prev), { plugins: __assign(__assign({}, prev.plugins), { needsRefresh: true }) });
                        });
                    }
                    _a.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    error_1 = _a.sent();
                    (0, log_js_1.logError)(error_1);
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
    });
}
