"use strict";
/**
 * Layer-3 refresh primitive: swap active plugin components in the running session.
 *
 * Three-layer model (see reconciler.ts for Layer-2):
 * - Layer 1: intent (settings)
 * - Layer 2: materialization (~/.claude/plugins/) — reconcileMarketplaces()
 * - Layer 3: active components (AppState) — this file
 *
 * Called from:
 * - /reload-plugins command (interactive, user-initiated)
 * - print.ts refreshPluginState() (headless, auto before first query with SYNC_PLUGIN_INSTALL)
 * - performBackgroundPluginInstallations() (background, auto after new marketplace install)
 *
 * NOT called from:
 * - useManagePlugins needsRefresh effect — interactive mode shows a notification;
 *   user explicitly runs /reload-plugins (PR 5c)
 * - /plugin menu — sets needsRefresh, user runs /reload-plugins (PR 5b)
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
exports.refreshActivePlugins = refreshActivePlugins;
var state_js_1 = require("../../bootstrap/state.js");
var manager_js_1 = require("../../services/lsp/manager.js");
var loadAgentsDir_js_1 = require("../../tools/AgentTool/loadAgentsDir.js");
var debug_js_1 = require("../debug.js");
var errors_js_1 = require("../errors.js");
var log_js_1 = require("../log.js");
var cacheUtils_js_1 = require("./cacheUtils.js");
var loadPluginCommands_js_1 = require("./loadPluginCommands.js");
var loadPluginHooks_js_1 = require("./loadPluginHooks.js");
var lspPluginIntegration_js_1 = require("./lspPluginIntegration.js");
var mcpPluginIntegration_js_1 = require("./mcpPluginIntegration.js");
var orphanedPluginFilter_js_1 = require("./orphanedPluginFilter.js");
var pluginLoader_js_1 = require("./pluginLoader.js");
/**
 * Refresh all active plugin components: commands, agents, hooks, MCP-reconnect
 * trigger, AppState plugin arrays. Clears ALL plugin caches (unlike the old
 * needsRefresh path which only cleared loadAllPlugins and returned stale data
 * from downstream memoized loaders).
 *
 * Consumes plugins.needsRefresh (sets to false).
 * Increments mcp.pluginReconnectKey so useManageMCPConnections effects re-run
 * and pick up new plugin MCP servers.
 *
 * LSP: if plugins now contribute LSP servers, reinitializeLspServerManager()
 * re-reads config. Servers are lazy-started so this is just config parsing.
 */
function refreshActivePlugins(setAppState) {
    return __awaiter(this, void 0, void 0, function () {
        var pluginResult, _a, pluginCommands, agentDefinitions, enabled, disabled, errors, _b, mcpCounts, lspCounts, mcp_count, lsp_count, hook_load_failed, e_1, hook_count;
        var _this = this;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    (0, debug_js_1.logForDebugging)('refreshActivePlugins: clearing all plugin caches');
                    (0, cacheUtils_js_1.clearAllCaches)();
                    // Orphan exclusions are session-frozen by default, but /reload-plugins is
                    // an explicit "disk changed, re-read it" signal — recompute them too.
                    (0, orphanedPluginFilter_js_1.clearPluginCacheExclusions)();
                    return [4 /*yield*/, (0, pluginLoader_js_1.loadAllPlugins)()];
                case 1:
                    pluginResult = _c.sent();
                    return [4 /*yield*/, Promise.all([
                            (0, loadPluginCommands_js_1.getPluginCommands)(),
                            (0, loadAgentsDir_js_1.getAgentDefinitionsWithOverrides)((0, state_js_1.getOriginalCwd)()),
                        ])];
                case 2:
                    _a = _c.sent(), pluginCommands = _a[0], agentDefinitions = _a[1];
                    enabled = pluginResult.enabled, disabled = pluginResult.disabled, errors = pluginResult.errors;
                    return [4 /*yield*/, Promise.all([
                            Promise.all(enabled.map(function (p) { return __awaiter(_this, void 0, void 0, function () {
                                var servers;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (p.mcpServers)
                                                return [2 /*return*/, Object.keys(p.mcpServers).length];
                                            return [4 /*yield*/, (0, mcpPluginIntegration_js_1.loadPluginMcpServers)(p, errors)];
                                        case 1:
                                            servers = _a.sent();
                                            if (servers)
                                                p.mcpServers = servers;
                                            return [2 /*return*/, servers ? Object.keys(servers).length : 0];
                                    }
                                });
                            }); })),
                            Promise.all(enabled.map(function (p) { return __awaiter(_this, void 0, void 0, function () {
                                var servers;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (p.lspServers)
                                                return [2 /*return*/, Object.keys(p.lspServers).length];
                                            return [4 /*yield*/, (0, lspPluginIntegration_js_1.loadPluginLspServers)(p, errors)];
                                        case 1:
                                            servers = _a.sent();
                                            if (servers)
                                                p.lspServers = servers;
                                            return [2 /*return*/, servers ? Object.keys(servers).length : 0];
                                    }
                                });
                            }); })),
                        ])];
                case 3:
                    _b = _c.sent(), mcpCounts = _b[0], lspCounts = _b[1];
                    mcp_count = mcpCounts.reduce(function (sum, n) { return sum + n; }, 0);
                    lsp_count = lspCounts.reduce(function (sum, n) { return sum + n; }, 0);
                    setAppState(function (prev) { return (__assign(__assign({}, prev), { plugins: __assign(__assign({}, prev.plugins), { enabled: enabled, disabled: disabled, commands: pluginCommands, errors: mergePluginErrors(prev.plugins.errors, errors), needsRefresh: false }), agentDefinitions: agentDefinitions, mcp: __assign(__assign({}, prev.mcp), { pluginReconnectKey: prev.mcp.pluginReconnectKey + 1 }) })); });
                    // Re-initialize LSP manager so newly-loaded plugin LSP servers are picked
                    // up. No-op if LSP was never initialized (headless subcommand path).
                    // Unconditional so removing the last LSP plugin also clears stale config.
                    // Fixes issue #15521: LSP manager previously read a stale memoized
                    // loadAllPlugins() result from before marketplaces were reconciled.
                    (0, manager_js_1.reinitializeLspServerManager)();
                    hook_load_failed = false;
                    _c.label = 4;
                case 4:
                    _c.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, (0, loadPluginHooks_js_1.loadPluginHooks)()];
                case 5:
                    _c.sent();
                    return [3 /*break*/, 7];
                case 6:
                    e_1 = _c.sent();
                    hook_load_failed = true;
                    (0, log_js_1.logError)(e_1);
                    (0, debug_js_1.logForDebugging)("refreshActivePlugins: loadPluginHooks failed: ".concat((0, errors_js_1.errorMessage)(e_1)));
                    return [3 /*break*/, 7];
                case 7:
                    hook_count = enabled.reduce(function (sum, p) {
                        if (!p.hooksConfig)
                            return sum;
                        return (sum +
                            Object.values(p.hooksConfig).reduce(function (s, matchers) { var _a; return s + ((_a = matchers === null || matchers === void 0 ? void 0 : matchers.reduce(function (h, m) { return h + m.hooks.length; }, 0)) !== null && _a !== void 0 ? _a : 0); }, 0));
                    }, 0);
                    (0, debug_js_1.logForDebugging)("refreshActivePlugins: ".concat(enabled.length, " enabled, ").concat(pluginCommands.length, " commands, ").concat(agentDefinitions.allAgents.length, " agents, ").concat(hook_count, " hooks, ").concat(mcp_count, " MCP, ").concat(lsp_count, " LSP"));
                    return [2 /*return*/, {
                            enabled_count: enabled.length,
                            disabled_count: disabled.length,
                            command_count: pluginCommands.length,
                            agent_count: agentDefinitions.allAgents.length,
                            hook_count: hook_count,
                            mcp_count: mcp_count,
                            lsp_count: lsp_count,
                            error_count: errors.length + (hook_load_failed ? 1 : 0),
                            agentDefinitions: agentDefinitions,
                            pluginCommands: pluginCommands,
                        }];
            }
        });
    });
}
/**
 * Merge fresh plugin-load errors with existing errors, preserving LSP and
 * plugin-component errors that were recorded by other systems and
 * deduplicating. Same logic as refreshPlugins()/updatePluginState(), extracted
 * so refresh.ts doesn't leave those errors stranded.
 */
function mergePluginErrors(existing, fresh) {
    var preserved = existing.filter(function (e) { return e.source === 'lsp-manager' || e.source.startsWith('plugin:'); });
    var freshKeys = new Set(fresh.map(errorKey));
    var deduped = preserved.filter(function (e) { return !freshKeys.has(errorKey(e)); });
    return __spreadArray(__spreadArray([], deduped, true), fresh, true);
}
function errorKey(e) {
    return e.type === 'generic-error'
        ? "generic-error:".concat(e.source, ":").concat(e.error)
        : "".concat(e.type, ":").concat(e.source);
}
