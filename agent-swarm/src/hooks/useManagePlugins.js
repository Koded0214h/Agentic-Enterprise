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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
exports.useManagePlugins = useManagePlugins;
var react_1 = require("react");
var notifications_js_1 = require("../context/notifications.js");
var index_js_1 = require("../services/analytics/index.js");
var manager_js_1 = require("../services/lsp/manager.js");
var AppState_js_1 = require("../state/AppState.js");
var array_js_1 = require("../utils/array.js");
var debug_js_1 = require("../utils/debug.js");
var diagLogs_js_1 = require("../utils/diagLogs.js");
var errors_js_1 = require("../utils/errors.js");
var log_js_1 = require("../utils/log.js");
var loadPluginAgents_js_1 = require("../utils/plugins/loadPluginAgents.js");
var loadPluginCommands_js_1 = require("../utils/plugins/loadPluginCommands.js");
var loadPluginHooks_js_1 = require("../utils/plugins/loadPluginHooks.js");
var lspPluginIntegration_js_1 = require("../utils/plugins/lspPluginIntegration.js");
var mcpPluginIntegration_js_1 = require("../utils/plugins/mcpPluginIntegration.js");
var pluginBlocklist_js_1 = require("../utils/plugins/pluginBlocklist.js");
var pluginFlagging_js_1 = require("../utils/plugins/pluginFlagging.js");
var pluginLoader_js_1 = require("../utils/plugins/pluginLoader.js");
/**
 * Hook to manage plugin state and synchronize with AppState.
 *
 * On mount: loads all plugins, runs delisting enforcement, surfaces flagged-
 * plugin notifications, populates AppState.plugins. This is the initial
 * Layer-3 load — subsequent refresh goes through /reload-plugins.
 *
 * On needsRefresh: shows a notification directing the user to /reload-plugins.
 * Does NOT auto-refresh. All Layer-3 swap (commands, agents, hooks, MCP)
 * goes through refreshActivePlugins() via /reload-plugins for one consistent
 * mental model. See Outline: declarative-settings-hXHBMDIf4b PR 5c.
 */
function useManagePlugins(_a) {
    var _this = this;
    var _b = _a === void 0 ? {} : _a, _c = _b.enabled, enabled = _c === void 0 ? true : _c;
    var setAppState = (0, AppState_js_1.useSetAppState)();
    var needsRefresh = (0, AppState_js_1.useAppState)(function (s) { return s.plugins.needsRefresh; });
    var addNotification = (0, notifications_js_1.useNotifications)().addNotification;
    // Initial plugin load. Runs once on mount. NOT used for refresh — all
    // post-mount refresh goes through /reload-plugins → refreshActivePlugins().
    // Unlike refreshActivePlugins, this also runs delisting enforcement and
    // flagged-plugin notifications (session-start concerns), and does NOT bump
    // mcp.pluginReconnectKey (MCP effects fire on their own mount).
    var initialPluginLoad = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, enabled_1, disabled_1, errors_1, flagged, commands_1, agents, error_1, errorMessage, error_2, errorMessage, error_3, errorMessage, mcpServerCounts, mcp_count, lspServerCounts, lsp_count, hook_count, error_4, errorObj_1;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 15, , 16]);
                    return [4 /*yield*/, (0, pluginLoader_js_1.loadAllPlugins)()
                        // Detect delisted plugins, auto-uninstall them, and record as flagged.
                    ];
                case 1:
                    _a = _b.sent(), enabled_1 = _a.enabled, disabled_1 = _a.disabled, errors_1 = _a.errors;
                    // Detect delisted plugins, auto-uninstall them, and record as flagged.
                    return [4 /*yield*/, (0, pluginBlocklist_js_1.detectAndUninstallDelistedPlugins)()
                        // Notify if there are flagged plugins pending dismissal
                    ];
                case 2:
                    // Detect delisted plugins, auto-uninstall them, and record as flagged.
                    _b.sent();
                    flagged = (0, pluginFlagging_js_1.getFlaggedPlugins)();
                    if (Object.keys(flagged).length > 0) {
                        addNotification({
                            key: 'plugin-delisted-flagged',
                            text: 'Plugins flagged. Check /plugins',
                            color: 'warning',
                            priority: 'high',
                        });
                    }
                    commands_1 = [];
                    agents = [];
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, (0, loadPluginCommands_js_1.getPluginCommands)()];
                case 4:
                    commands_1 = _b.sent();
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _b.sent();
                    errorMessage = error_1 instanceof Error ? error_1.message : String(error_1);
                    errors_1.push({
                        type: 'generic-error',
                        source: 'plugin-commands',
                        error: "Failed to load plugin commands: ".concat(errorMessage),
                    });
                    return [3 /*break*/, 6];
                case 6:
                    _b.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, (0, loadPluginAgents_js_1.loadPluginAgents)()];
                case 7:
                    agents = _b.sent();
                    return [3 /*break*/, 9];
                case 8:
                    error_2 = _b.sent();
                    errorMessage = error_2 instanceof Error ? error_2.message : String(error_2);
                    errors_1.push({
                        type: 'generic-error',
                        source: 'plugin-agents',
                        error: "Failed to load plugin agents: ".concat(errorMessage),
                    });
                    return [3 /*break*/, 9];
                case 9:
                    _b.trys.push([9, 11, , 12]);
                    return [4 /*yield*/, (0, loadPluginHooks_js_1.loadPluginHooks)()];
                case 10:
                    _b.sent();
                    return [3 /*break*/, 12];
                case 11:
                    error_3 = _b.sent();
                    errorMessage = error_3 instanceof Error ? error_3.message : String(error_3);
                    errors_1.push({
                        type: 'generic-error',
                        source: 'plugin-hooks',
                        error: "Failed to load plugin hooks: ".concat(errorMessage),
                    });
                    return [3 /*break*/, 12];
                case 12: return [4 /*yield*/, Promise.all(enabled_1.map(function (p) { return __awaiter(_this, void 0, void 0, function () {
                        var servers;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (p.mcpServers)
                                        return [2 /*return*/, Object.keys(p.mcpServers).length];
                                    return [4 /*yield*/, (0, mcpPluginIntegration_js_1.loadPluginMcpServers)(p, errors_1)];
                                case 1:
                                    servers = _a.sent();
                                    if (servers)
                                        p.mcpServers = servers;
                                    return [2 /*return*/, servers ? Object.keys(servers).length : 0];
                            }
                        });
                    }); }))];
                case 13:
                    mcpServerCounts = _b.sent();
                    mcp_count = mcpServerCounts.reduce(function (sum, n) { return sum + n; }, 0);
                    return [4 /*yield*/, Promise.all(enabled_1.map(function (p) { return __awaiter(_this, void 0, void 0, function () {
                            var servers;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (p.lspServers)
                                            return [2 /*return*/, Object.keys(p.lspServers).length];
                                        return [4 /*yield*/, (0, lspPluginIntegration_js_1.loadPluginLspServers)(p, errors_1)];
                                    case 1:
                                        servers = _a.sent();
                                        if (servers)
                                            p.lspServers = servers;
                                        return [2 /*return*/, servers ? Object.keys(servers).length : 0];
                                }
                            });
                        }); }))];
                case 14:
                    lspServerCounts = _b.sent();
                    lsp_count = lspServerCounts.reduce(function (sum, n) { return sum + n; }, 0);
                    (0, manager_js_1.reinitializeLspServerManager)();
                    // Update AppState - merge errors to preserve LSP errors
                    setAppState(function (prevState) {
                        // Keep existing LSP/non-plugin-loading errors (source 'lsp-manager' or 'plugin:*')
                        var existingLspErrors = prevState.plugins.errors.filter(function (e) { return e.source === 'lsp-manager' || e.source.startsWith('plugin:'); });
                        // Deduplicate: remove existing LSP errors that are also in new errors
                        var newErrorKeys = new Set(errors_1.map(function (e) {
                            return e.type === 'generic-error'
                                ? "generic-error:".concat(e.source, ":").concat(e.error)
                                : "".concat(e.type, ":").concat(e.source);
                        }));
                        var filteredExisting = existingLspErrors.filter(function (e) {
                            var key = e.type === 'generic-error'
                                ? "generic-error:".concat(e.source, ":").concat(e.error)
                                : "".concat(e.type, ":").concat(e.source);
                            return !newErrorKeys.has(key);
                        });
                        var mergedErrors = __spreadArray(__spreadArray([], filteredExisting, true), errors_1, true);
                        return __assign(__assign({}, prevState), { plugins: __assign(__assign({}, prevState.plugins), { enabled: enabled_1, disabled: disabled_1, commands: commands_1, errors: mergedErrors }) });
                    });
                    (0, debug_js_1.logForDebugging)("Loaded plugins - Enabled: ".concat(enabled_1.length, ", Disabled: ").concat(disabled_1.length, ", Commands: ").concat(commands_1.length, ", Agents: ").concat(agents.length, ", Errors: ").concat(errors_1.length));
                    hook_count = enabled_1.reduce(function (sum, p) {
                        if (!p.hooksConfig)
                            return sum;
                        return (sum +
                            Object.values(p.hooksConfig).reduce(function (s, matchers) { var _a; return s + ((_a = matchers === null || matchers === void 0 ? void 0 : matchers.reduce(function (h, m) { return h + m.hooks.length; }, 0)) !== null && _a !== void 0 ? _a : 0); }, 0));
                    }, 0);
                    return [2 /*return*/, {
                            enabled_count: enabled_1.length,
                            disabled_count: disabled_1.length,
                            inline_count: (0, array_js_1.count)(enabled_1, function (p) { return p.source.endsWith('@inline'); }),
                            marketplace_count: (0, array_js_1.count)(enabled_1, function (p) { return !p.source.endsWith('@inline'); }),
                            error_count: errors_1.length,
                            skill_count: commands_1.length,
                            agent_count: agents.length,
                            hook_count: hook_count,
                            mcp_count: mcp_count,
                            lsp_count: lsp_count,
                            // Ant-only: which plugins are enabled, to correlate with RSS/FPS.
                            // Kept separate from base metrics so it doesn't flow into
                            // logForDiagnosticsNoPII.
                            ant_enabled_names: process.env.USER_TYPE === 'ant' && enabled_1.length > 0
                                ? enabled_1
                                    .map(function (p) { return p.name; })
                                    .sort()
                                    .join(',')
                                : undefined,
                        }];
                case 15:
                    error_4 = _b.sent();
                    errorObj_1 = (0, errors_js_1.toError)(error_4);
                    (0, log_js_1.logError)(errorObj_1);
                    (0, debug_js_1.logForDebugging)("Error loading plugins: ".concat(error_4));
                    // Set empty state on error, but preserve LSP errors and add the new error
                    setAppState(function (prevState) {
                        // Keep existing LSP/non-plugin-loading errors
                        var existingLspErrors = prevState.plugins.errors.filter(function (e) { return e.source === 'lsp-manager' || e.source.startsWith('plugin:'); });
                        var newError = {
                            type: 'generic-error',
                            source: 'plugin-system',
                            error: errorObj_1.message,
                        };
                        return __assign(__assign({}, prevState), { plugins: __assign(__assign({}, prevState.plugins), { enabled: [], disabled: [], commands: [], errors: __spreadArray(__spreadArray([], existingLspErrors, true), [newError], false) }) });
                    });
                    return [2 /*return*/, {
                            enabled_count: 0,
                            disabled_count: 0,
                            inline_count: 0,
                            marketplace_count: 0,
                            error_count: 1,
                            skill_count: 0,
                            agent_count: 0,
                            hook_count: 0,
                            mcp_count: 0,
                            lsp_count: 0,
                            load_failed: true,
                            ant_enabled_names: undefined,
                        }];
                case 16: return [2 /*return*/];
            }
        });
    }); }, [setAppState, addNotification]);
    // Load plugins on mount and emit telemetry
    (0, react_1.useEffect)(function () {
        if (!enabled)
            return;
        void initialPluginLoad().then(function (metrics) {
            var ant_enabled_names = metrics.ant_enabled_names, baseMetrics = __rest(metrics, ["ant_enabled_names"]);
            var allMetrics = __assign(__assign({}, baseMetrics), { has_custom_plugin_cache_dir: !!process.env.CLAUDE_CODE_PLUGIN_CACHE_DIR });
            (0, index_js_1.logEvent)('tengu_plugins_loaded', __assign(__assign({}, allMetrics), (ant_enabled_names !== undefined && {
                enabled_names: ant_enabled_names,
            })));
            (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'tengu_plugins_loaded', allMetrics);
        });
    }, [initialPluginLoad, enabled]);
    // Plugin state changed on disk (background reconcile, /plugin menu,
    // external settings edit). Show a notification; user runs /reload-plugins
    // to apply. The previous auto-refresh here had a stale-cache bug (only
    // cleared loadAllPlugins, downstream memoized loaders returned old data)
    // and was incomplete (no MCP, no agentDefinitions). /reload-plugins
    // handles all of that correctly via refreshActivePlugins().
    (0, react_1.useEffect)(function () {
        if (!enabled || !needsRefresh)
            return;
        addNotification({
            key: 'plugin-reload-pending',
            text: 'Plugins changed. Run /reload-plugins to activate.',
            color: 'suggestion',
            priority: 'low',
        });
        // Do NOT auto-refresh. Do NOT reset needsRefresh — /reload-plugins
        // consumes it via refreshActivePlugins().
    }, [enabled, needsRefresh, addNotification]);
}
