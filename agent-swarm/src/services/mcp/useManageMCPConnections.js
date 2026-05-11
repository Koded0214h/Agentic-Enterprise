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
exports.useManageMCPConnections = useManageMCPConnections;
var bun_bundle_1 = require("bun:bundle");
var path_1 = require("path");
var react_1 = require("react");
var state_js_1 = require("../../bootstrap/state.js");
var client_js_1 = require("./client.js");
/* eslint-disable @typescript-eslint/no-require-imports */
var fetchMcpSkillsForClient = (0, bun_bundle_1.feature)('MCP_SKILLS')
    ? require('../../skills/mcpSkills.js').fetchMcpSkillsForClient
    : null;
var clearSkillIndexCache = (0, bun_bundle_1.feature)('EXPERIMENTAL_SKILL_SEARCH')
    ? require('../skillSearch/localSearch.js').clearSkillIndexCache
    : null;
var types_js_1 = require("@modelcontextprotocol/sdk/types.js");
var omit_js_1 = require("lodash-es/omit.js");
var reject_js_1 = require("lodash-es/reject.js");
var index_js_1 = require("src/services/analytics/index.js");
var config_js_1 = require("src/services/mcp/config.js");
var debug_js_1 = require("src/utils/debug.js");
var state_js_2 = require("../../bootstrap/state.js");
var notifications_js_1 = require("../../context/notifications.js");
var AppState_js_1 = require("../../state/AppState.js");
var errors_js_1 = require("../../utils/errors.js");
/* eslint-enable @typescript-eslint/no-require-imports */
var log_js_1 = require("../../utils/log.js");
var messageQueueManager_js_1 = require("../../utils/messageQueueManager.js");
var channelNotification_js_1 = require("./channelNotification.js");
var channelPermissions_js_1 = require("./channelPermissions.js");
var claudeai_js_1 = require("./claudeai.js");
var elicitationHandler_js_1 = require("./elicitationHandler.js");
var mcpStringUtils_js_1 = require("./mcpStringUtils.js");
var utils_js_1 = require("./utils.js");
// Constants for reconnection with exponential backoff
var MAX_RECONNECT_ATTEMPTS = 5;
var INITIAL_BACKOFF_MS = 1000;
var MAX_BACKOFF_MS = 30000;
/**
 * Create a unique key for a plugin error to enable deduplication
 */
function getErrorKey(error) {
    var plugin = 'plugin' in error ? error.plugin : 'no-plugin';
    return "".concat(error.type, ":").concat(error.source, ":").concat(plugin);
}
/**
 * Add errors to AppState, deduplicating to avoid showing the same error multiple times
 */
function addErrorsToAppState(setAppState, newErrors) {
    if (newErrors.length === 0)
        return;
    setAppState(function (prevState) {
        // Build set of existing error keys
        var existingKeys = new Set(prevState.plugins.errors.map(function (e) { return getErrorKey(e); }));
        // Only add errors that don't already exist
        var uniqueNewErrors = newErrors.filter(function (error) { return !existingKeys.has(getErrorKey(error)); });
        if (uniqueNewErrors.length === 0) {
            return prevState;
        }
        return __assign(__assign({}, prevState), { plugins: __assign(__assign({}, prevState.plugins), { errors: __spreadArray(__spreadArray([], prevState.plugins.errors, true), uniqueNewErrors, true) }) });
    });
}
/**
 * Hook to manage MCP (Model Context Protocol) server connections and updates
 *
 * This hook:
 * 1. Initializes MCP client connections based on config
 * 2. Sets up handlers for connection lifecycle events and sync with app state
 * 3. Manages automatic reconnection for SSE connections
 * 4. Returns a reconnect function
 */
function useManageMCPConnections(dynamicMcpConfig, isStrictMcpConfig) {
    var _this = this;
    if (isStrictMcpConfig === void 0) { isStrictMcpConfig = false; }
    var store = (0, AppState_js_1.useAppStateStore)();
    var _authVersion = (0, AppState_js_1.useAppState)(function (s) { return s.authVersion; });
    // Incremented by /reload-plugins (refreshActivePlugins) to pick up newly
    // enabled plugin MCP servers. getClaudeCodeMcpConfigs() reads loadAllPlugins()
    // which has been cleared by refreshActivePlugins, so the effects below see
    // fresh plugin data on re-run.
    var _pluginReconnectKey = (0, AppState_js_1.useAppState)(function (s) { return s.mcp.pluginReconnectKey; });
    var setAppState = (0, AppState_js_1.useSetAppState)();
    // Track active reconnection attempts to allow cancellation
    var reconnectTimersRef = (0, react_1.useRef)(new Map());
    // Dedup the --channels blocked warning per skip kind so that a user who
    // sees "run /login" (auth skip), logs in, then hits the policy gate
    // gets a second toast.
    var channelWarnedKindsRef = (0, react_1.useRef)(new Set());
    // Channel permission callbacks — constructed once, stable ref. Stored in
    // AppState so interactiveHandler can subscribe. The pending Map lives inside
    // the closure (not module-level, not AppState — functions-in-state is brittle).
    var channelPermCallbacksRef = (0, react_1.useRef)(null);
    if (((0, bun_bundle_1.feature)('KAIROS') || (0, bun_bundle_1.feature)('KAIROS_CHANNELS')) &&
        channelPermCallbacksRef.current === null) {
        channelPermCallbacksRef.current = (0, channelPermissions_js_1.createChannelPermissionCallbacks)();
    }
    // Store callbacks in AppState so interactiveHandler.ts can reach them via
    // ctx.toolUseContext.getAppState(). One-time set — the ref is stable.
    (0, react_1.useEffect)(function () {
        if ((0, bun_bundle_1.feature)('KAIROS') || (0, bun_bundle_1.feature)('KAIROS_CHANNELS')) {
            var callbacks_1 = channelPermCallbacksRef.current;
            if (!callbacks_1)
                return;
            // GrowthBook runtime gate — separate from channels so channels can
            // ship without this. Checked at mount; mid-session flips need restart.
            // If off, callbacks never go into AppState → interactiveHandler sees
            // undefined → never sends → intercept has nothing pending → "yes tbxkq"
            // flows to Claude as normal chat. One gate, full disable.
            if (!(0, channelPermissions_js_1.isChannelPermissionRelayEnabled)())
                return;
            setAppState(function (prev) {
                if (prev.channelPermissionCallbacks === callbacks_1)
                    return prev;
                return __assign(__assign({}, prev), { channelPermissionCallbacks: callbacks_1 });
            });
            return function () {
                setAppState(function (prev) {
                    if (prev.channelPermissionCallbacks === undefined)
                        return prev;
                    return __assign(__assign({}, prev), { channelPermissionCallbacks: undefined });
                });
            };
        }
    }, [setAppState]);
    var addNotification = (0, notifications_js_1.useNotifications)().addNotification;
    // Batched MCP state updates: queue individual server updates and flush them
    // in a single setAppState call via setTimeout. Using a time-based window
    // (instead of queueMicrotask) ensures updates are batched even when
    // connection callbacks arrive at different times due to network I/O.
    var MCP_BATCH_FLUSH_MS = 16;
    var pendingUpdatesRef = (0, react_1.useRef)([]);
    var flushTimerRef = (0, react_1.useRef)(null);
    var flushPendingUpdates = (0, react_1.useCallback)(function () {
        flushTimerRef.current = null;
        var updates = pendingUpdatesRef.current;
        if (updates.length === 0)
            return;
        pendingUpdatesRef.current = [];
        setAppState(function (prevState) {
            var mcp = prevState.mcp;
            var _loop_1 = function (update) {
                var _a;
                var rawTools = update.tools, rawCmds = update.commands, rawRes = update.resources, client = __rest(update, ["tools", "commands", "resources"]);
                var tools = client.type === 'disabled' || client.type === 'failed'
                    ? (rawTools !== null && rawTools !== void 0 ? rawTools : [])
                    : rawTools;
                var commands = client.type === 'disabled' || client.type === 'failed'
                    ? (rawCmds !== null && rawCmds !== void 0 ? rawCmds : [])
                    : rawCmds;
                var resources = client.type === 'disabled' || client.type === 'failed'
                    ? (rawRes !== null && rawRes !== void 0 ? rawRes : [])
                    : rawRes;
                var prefix = (0, mcpStringUtils_js_1.getMcpPrefix)(client.name);
                var existingClientIndex = mcp.clients.findIndex(function (c) { return c.name === client.name; });
                var updatedClients = existingClientIndex === -1
                    ? __spreadArray(__spreadArray([], mcp.clients, true), [client], false) : mcp.clients.map(function (c) { return (c.name === client.name ? client : c); });
                var updatedTools = tools === undefined
                    ? mcp.tools
                    : __spreadArray(__spreadArray([], (0, reject_js_1.default)(mcp.tools, function (t) { var _a; return (_a = t.name) === null || _a === void 0 ? void 0 : _a.startsWith(prefix); }), true), tools, true);
                var updatedCommands = commands === undefined
                    ? mcp.commands
                    : __spreadArray(__spreadArray([], (0, reject_js_1.default)(mcp.commands, function (c) {
                        return (0, utils_js_1.commandBelongsToServer)(c, client.name);
                    }), true), commands, true);
                var updatedResources = resources === undefined
                    ? mcp.resources
                    : __assign(__assign({}, mcp.resources), (resources.length > 0
                        ? (_a = {}, _a[client.name] = resources, _a) : (0, omit_js_1.default)(mcp.resources, client.name)));
                mcp = __assign(__assign({}, mcp), { clients: updatedClients, tools: updatedTools, commands: updatedCommands, resources: updatedResources });
            };
            for (var _i = 0, updates_1 = updates; _i < updates_1.length; _i++) {
                var update = updates_1[_i];
                _loop_1(update);
            }
            return __assign(__assign({}, prevState), { mcp: mcp });
        });
    }, [setAppState]);
    // Update server state, tools, commands, and resources.
    // When tools, commands, or resources are undefined, the existing values are preserved.
    // When type is 'disabled' or 'failed', tools/commands/resources are automatically cleared.
    // Updates are batched via setTimeout to coalesce updates arriving within MCP_BATCH_FLUSH_MS.
    var updateServer = (0, react_1.useCallback)(function (update) {
        pendingUpdatesRef.current.push(update);
        if (flushTimerRef.current === null) {
            flushTimerRef.current = setTimeout(flushPendingUpdates, MCP_BATCH_FLUSH_MS);
        }
    }, [flushPendingUpdates]);
    var onConnectionAttempt = (0, react_1.useCallback)(function (_a) {
        var _b, _c, _d, _e, _f, _g, _h, _j, _k;
        var client = _a.client, tools = _a.tools, commands = _a.commands, resources = _a.resources;
        updateServer(__assign(__assign({}, client), { tools: tools, commands: commands, resources: resources }));
        // Handle side effects based on client state
        switch (client.type) {
            case 'connected': {
                // Overwrite the default elicitation handler registered in connectToServer
                // with the real one (queues elicitation in AppState for UI). Registering
                // here (once per connect) instead of in a [mcpClients] effect avoids
                // re-running for every already-connected server on each state change.
                (0, elicitationHandler_js_1.registerElicitationHandler)(client.client, client.name, setAppState);
                client.client.onclose = function () {
                    var _a;
                    var configType = (_a = client.config.type) !== null && _a !== void 0 ? _a : 'stdio';
                    (0, client_js_1.clearServerCache)(client.name, client.config).catch(function () {
                        (0, debug_js_1.logForDebugging)("Failed to invalidate the server cache: ".concat(client.name));
                    });
                    // TODO: This really isn't great: ideally we'd check appstate as the source of truth
                    // as to whether it was disconnected due to a disable, but appstate is stale at this
                    // point. Getting a live reference to appstate feels a little hacky, so we'll just
                    // check the disk state. We may want to refactor some of this.
                    if ((0, config_js_1.isMcpServerDisabled)(client.name)) {
                        (0, log_js_1.logMCPDebug)(client.name, "Server is disabled, skipping automatic reconnection");
                        return;
                    }
                    // Handle automatic reconnection for remote transports
                    // Skip stdio (local process) and sdk (internal) - they don't support reconnection
                    if (configType !== 'stdio' && configType !== 'sdk') {
                        var transportType_1 = getTransportDisplayName(configType);
                        (0, log_js_1.logMCPDebug)(client.name, "".concat(transportType_1, " transport closed/disconnected, attempting automatic reconnection"));
                        // Cancel any existing reconnection attempt for this server
                        var existingTimer = reconnectTimersRef.current.get(client.name);
                        if (existingTimer) {
                            clearTimeout(existingTimer);
                            reconnectTimersRef.current.delete(client.name);
                        }
                        // Attempt reconnection with exponential backoff
                        var reconnectWithBackoff = function () { return __awaiter(_this, void 0, void 0, function () {
                            var _loop_2, attempt, state_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _loop_2 = function (attempt) {
                                            var reconnectStartTime, result, elapsed, error_1, elapsed, backoffMs;
                                            return __generator(this, function (_b) {
                                                switch (_b.label) {
                                                    case 0:
                                                        // Check if server was disabled while we were waiting
                                                        if ((0, config_js_1.isMcpServerDisabled)(client.name)) {
                                                            (0, log_js_1.logMCPDebug)(client.name, "Server disabled during reconnection, stopping retry");
                                                            reconnectTimersRef.current.delete(client.name);
                                                            return [2 /*return*/, { value: void 0 }];
                                                        }
                                                        updateServer(__assign(__assign({}, client), { type: 'pending', reconnectAttempt: attempt, maxReconnectAttempts: MAX_RECONNECT_ATTEMPTS }));
                                                        reconnectStartTime = Date.now();
                                                        _b.label = 1;
                                                    case 1:
                                                        _b.trys.push([1, 3, , 4]);
                                                        return [4 /*yield*/, (0, client_js_1.reconnectMcpServerImpl)(client.name, client.config)];
                                                    case 2:
                                                        result = _b.sent();
                                                        elapsed = Date.now() - reconnectStartTime;
                                                        if (result.client.type === 'connected') {
                                                            (0, log_js_1.logMCPDebug)(client.name, "".concat(transportType_1, " reconnection successful after ").concat(elapsed, "ms (attempt ").concat(attempt, ")"));
                                                            reconnectTimersRef.current.delete(client.name);
                                                            onConnectionAttempt(result);
                                                            return [2 /*return*/, { value: void 0 }];
                                                        }
                                                        (0, log_js_1.logMCPDebug)(client.name, "".concat(transportType_1, " reconnection attempt ").concat(attempt, " completed with status: ").concat(result.client.type));
                                                        // On final attempt, update state with the result
                                                        if (attempt === MAX_RECONNECT_ATTEMPTS) {
                                                            (0, log_js_1.logMCPDebug)(client.name, "Max reconnection attempts (".concat(MAX_RECONNECT_ATTEMPTS, ") reached, giving up"));
                                                            reconnectTimersRef.current.delete(client.name);
                                                            onConnectionAttempt(result);
                                                            return [2 /*return*/, { value: void 0 }];
                                                        }
                                                        return [3 /*break*/, 4];
                                                    case 3:
                                                        error_1 = _b.sent();
                                                        elapsed = Date.now() - reconnectStartTime;
                                                        (0, log_js_1.logMCPError)(client.name, "".concat(transportType_1, " reconnection attempt ").concat(attempt, " failed after ").concat(elapsed, "ms: ").concat(error_1));
                                                        // On final attempt, mark as failed
                                                        if (attempt === MAX_RECONNECT_ATTEMPTS) {
                                                            (0, log_js_1.logMCPDebug)(client.name, "Max reconnection attempts (".concat(MAX_RECONNECT_ATTEMPTS, ") reached, giving up"));
                                                            reconnectTimersRef.current.delete(client.name);
                                                            updateServer(__assign(__assign({}, client), { type: 'failed' }));
                                                            return [2 /*return*/, { value: void 0 }];
                                                        }
                                                        return [3 /*break*/, 4];
                                                    case 4:
                                                        backoffMs = Math.min(INITIAL_BACKOFF_MS * Math.pow(2, attempt - 1), MAX_BACKOFF_MS);
                                                        (0, log_js_1.logMCPDebug)(client.name, "Scheduling reconnection attempt ".concat(attempt + 1, " in ").concat(backoffMs, "ms"));
                                                        return [4 /*yield*/, new Promise(function (resolve) {
                                                                // eslint-disable-next-line no-restricted-syntax -- timer stored in ref for cancellation; sleep() doesn't expose the handle
                                                                var timer = setTimeout(resolve, backoffMs);
                                                                reconnectTimersRef.current.set(client.name, timer);
                                                            })];
                                                    case 5:
                                                        _b.sent();
                                                        return [2 /*return*/];
                                                }
                                            });
                                        };
                                        attempt = 1;
                                        _a.label = 1;
                                    case 1:
                                        if (!(attempt <= MAX_RECONNECT_ATTEMPTS)) return [3 /*break*/, 4];
                                        return [5 /*yield**/, _loop_2(attempt)];
                                    case 2:
                                        state_1 = _a.sent();
                                        if (typeof state_1 === "object")
                                            return [2 /*return*/, state_1.value];
                                        _a.label = 3;
                                    case 3:
                                        attempt++;
                                        return [3 /*break*/, 1];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); };
                        void reconnectWithBackoff();
                    }
                    else {
                        updateServer(__assign(__assign({}, client), { type: 'failed' }));
                    }
                };
                // Channel push: notifications/claude/channel → enqueue().
                // Gate decides whether to register the handler; connection stays
                // up either way (allowedMcpServers controls that).
                if ((0, bun_bundle_1.feature)('KAIROS') || (0, bun_bundle_1.feature)('KAIROS_CHANNELS')) {
                    var gate = (0, channelNotification_js_1.gateChannelServer)(client.name, client.capabilities, client.config.pluginSource);
                    var entry_1 = (0, channelNotification_js_1.findChannelEntry)(client.name, (0, state_js_2.getAllowedChannels)());
                    // Plugin identifier for telemetry — log name@marketplace for any
                    // plugin-kind entry (same tier as tengu_plugin_installed, which
                    // logs arbitrary plugin_id+marketplace_name ungated). server-kind
                    // names are MCP-server-name tier; those are opt-in-only elsewhere
                    // (see isAnalyticsToolDetailsLoggingEnabled in metadata.ts) and
                    // stay unlogged here. is_dev/entry_kind segment the rest.
                    var pluginId_1 = (entry_1 === null || entry_1 === void 0 ? void 0 : entry_1.kind) === 'plugin'
                        ? "".concat(entry_1.name, "@").concat(entry_1.marketplace)
                        : undefined;
                    // Skip capability-miss — every non-channel MCP server trips it.
                    if (gate.action === 'register' || gate.kind !== 'capability') {
                        (0, index_js_1.logEvent)('tengu_mcp_channel_gate', {
                            registered: gate.action === 'register',
                            skip_kind: gate.action === 'skip'
                                ? gate.kind
                                : undefined,
                            entry_kind: entry_1 === null || entry_1 === void 0 ? void 0 : entry_1.kind,
                            is_dev: (_b = entry_1 === null || entry_1 === void 0 ? void 0 : entry_1.dev) !== null && _b !== void 0 ? _b : false,
                            plugin: pluginId_1,
                        });
                    }
                    switch (gate.action) {
                        case 'register':
                            (0, log_js_1.logMCPDebug)(client.name, 'Channel notifications registered');
                            client.client.setNotificationHandler((0, channelNotification_js_1.ChannelMessageNotificationSchema)(), function (notification) { return __awaiter(_this, void 0, void 0, function () {
                                var _a, content, meta;
                                var _b;
                                return __generator(this, function (_c) {
                                    _a = notification.params, content = _a.content, meta = _a.meta;
                                    (0, log_js_1.logMCPDebug)(client.name, "notifications/claude/channel: ".concat(content.slice(0, 80)));
                                    (0, index_js_1.logEvent)('tengu_mcp_channel_message', {
                                        content_length: content.length,
                                        meta_key_count: Object.keys(meta !== null && meta !== void 0 ? meta : {}).length,
                                        entry_kind: entry_1 === null || entry_1 === void 0 ? void 0 : entry_1.kind,
                                        is_dev: (_b = entry_1 === null || entry_1 === void 0 ? void 0 : entry_1.dev) !== null && _b !== void 0 ? _b : false,
                                        plugin: pluginId_1,
                                    });
                                    (0, messageQueueManager_js_1.enqueue)({
                                        mode: 'prompt',
                                        value: (0, channelNotification_js_1.wrapChannelMessage)(client.name, content, meta),
                                        priority: 'next',
                                        isMeta: true,
                                        origin: { kind: 'channel', server: client.name },
                                        skipSlashCommands: true,
                                    });
                                    return [2 /*return*/];
                                });
                            }); });
                            // Permission-reply handler — separate event, separate
                            // capability. Only registers if the server declares
                            // claude/channel/permission (same opt-in check as the send
                            // path in interactiveHandler.ts). Server parses the user's
                            // reply and emits {request_id, behavior}; no regex on our
                            // side, text in the general channel can't accidentally match.
                            if (((_d = (_c = client.capabilities) === null || _c === void 0 ? void 0 : _c.experimental) === null || _d === void 0 ? void 0 : _d['claude/channel/permission']) !== undefined) {
                                client.client.setNotificationHandler((0, channelNotification_js_1.ChannelPermissionNotificationSchema)(), function (notification) { return __awaiter(_this, void 0, void 0, function () {
                                    var _a, request_id, behavior, resolved;
                                    var _b, _c;
                                    return __generator(this, function (_d) {
                                        _a = notification.params, request_id = _a.request_id, behavior = _a.behavior;
                                        resolved = (_c = (_b = channelPermCallbacksRef.current) === null || _b === void 0 ? void 0 : _b.resolve(request_id, behavior, client.name)) !== null && _c !== void 0 ? _c : false;
                                        (0, log_js_1.logMCPDebug)(client.name, "notifications/claude/channel/permission: ".concat(request_id, " \u2192 ").concat(behavior, " (").concat(resolved ? 'matched pending' : 'no pending entry — stale or unknown ID', ")"));
                                        return [2 /*return*/];
                                    });
                                }); });
                            }
                            break;
                        case 'skip':
                            // Idempotent teardown so a register→skip re-gate (e.g.
                            // effect re-runs after /logout) actually removes the live
                            // handler. Without this, mid-session demotion is one-way:
                            // the gate says skip but the earlier handler keeps enqueuing.
                            // Map.delete — safe when never registered.
                            client.client.removeNotificationHandler('notifications/claude/channel');
                            client.client.removeNotificationHandler(channelNotification_js_1.CHANNEL_PERMISSION_METHOD);
                            (0, log_js_1.logMCPDebug)(client.name, "Channel notifications skipped: ".concat(gate.reason));
                            // Surface a once-per-kind toast when a channel server is
                            // blocked. This is the only
                            // user-visible signal (logMCPDebug above requires --debug).
                            // Capability/session skips are expected noise and stay
                            // debug-only. marketplace/allowlist run after session — if
                            // we're here with those kinds, the user asked for it.
                            if (gate.kind !== 'capability' &&
                                gate.kind !== 'session' &&
                                !channelWarnedKindsRef.current.has(gate.kind) &&
                                (gate.kind === 'marketplace' ||
                                    gate.kind === 'allowlist' ||
                                    entry_1 !== undefined)) {
                                channelWarnedKindsRef.current.add(gate.kind);
                                // disabled/auth/policy get custom toast copy (shorter, actionable);
                                // marketplace/allowlist reuse the gate's reason verbatim
                                // since it already names the mismatch.
                                var text = gate.kind === 'disabled'
                                    ? 'Channels are not currently available'
                                    : gate.kind === 'auth'
                                        ? 'Channels require claude.ai authentication · run /login'
                                        : gate.kind === 'policy'
                                            ? 'Channels are not enabled for your org · have an administrator set channelsEnabled: true in managed settings'
                                            : gate.reason;
                                addNotification({
                                    key: "channels-blocked-".concat(gate.kind),
                                    priority: 'high',
                                    text: text,
                                    color: 'warning',
                                    timeoutMs: 12000,
                                });
                            }
                            break;
                    }
                }
                // Register notification handlers for list_changed notifications
                // These allow the server to notify us when tools, prompts, or resources change
                if ((_f = (_e = client.capabilities) === null || _e === void 0 ? void 0 : _e.tools) === null || _f === void 0 ? void 0 : _f.listChanged) {
                    client.client.setNotificationHandler(types_js_1.ToolListChangedNotificationSchema, function () { return __awaiter(_this, void 0, void 0, function () {
                        var previousToolsPromise, newTools, newCount_1, error_2;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    (0, log_js_1.logMCPDebug)(client.name, "Received tools/list_changed notification, refreshing tools");
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    previousToolsPromise = client_js_1.fetchToolsForClient.cache.get(client.name);
                                    client_js_1.fetchToolsForClient.cache.delete(client.name);
                                    return [4 /*yield*/, (0, client_js_1.fetchToolsForClient)(client)];
                                case 2:
                                    newTools = _a.sent();
                                    newCount_1 = newTools.length;
                                    if (previousToolsPromise) {
                                        previousToolsPromise.then(function (previousTools) {
                                            (0, index_js_1.logEvent)('tengu_mcp_list_changed', {
                                                type: 'tools',
                                                previousCount: previousTools.length,
                                                newCount: newCount_1,
                                            });
                                        }, function () {
                                            (0, index_js_1.logEvent)('tengu_mcp_list_changed', {
                                                type: 'tools',
                                                newCount: newCount_1,
                                            });
                                        });
                                    }
                                    else {
                                        (0, index_js_1.logEvent)('tengu_mcp_list_changed', {
                                            type: 'tools',
                                            newCount: newCount_1,
                                        });
                                    }
                                    updateServer(__assign(__assign({}, client), { tools: newTools }));
                                    return [3 /*break*/, 4];
                                case 3:
                                    error_2 = _a.sent();
                                    (0, log_js_1.logMCPError)(client.name, "Failed to refresh tools after list_changed notification: ".concat((0, errors_js_1.errorMessage)(error_2)));
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); });
                }
                if ((_h = (_g = client.capabilities) === null || _g === void 0 ? void 0 : _g.prompts) === null || _h === void 0 ? void 0 : _h.listChanged) {
                    client.client.setNotificationHandler(types_js_1.PromptListChangedNotificationSchema, function () { return __awaiter(_this, void 0, void 0, function () {
                        var _a, mcpPrompts, mcpSkills, error_3;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    (0, log_js_1.logMCPDebug)(client.name, "Received prompts/list_changed notification, refreshing prompts");
                                    (0, index_js_1.logEvent)('tengu_mcp_list_changed', {
                                        type: 'prompts',
                                    });
                                    _b.label = 1;
                                case 1:
                                    _b.trys.push([1, 3, , 4]);
                                    // Skills come from resources, not prompts — don't invalidate their
                                    // cache here. fetchMcpSkillsForClient returns the cached result.
                                    client_js_1.fetchCommandsForClient.cache.delete(client.name);
                                    return [4 /*yield*/, Promise.all([
                                            (0, client_js_1.fetchCommandsForClient)(client),
                                            (0, bun_bundle_1.feature)('MCP_SKILLS')
                                                ? fetchMcpSkillsForClient(client)
                                                : Promise.resolve([]),
                                        ])];
                                case 2:
                                    _a = _b.sent(), mcpPrompts = _a[0], mcpSkills = _a[1];
                                    updateServer(__assign(__assign({}, client), { commands: __spreadArray(__spreadArray([], mcpPrompts, true), mcpSkills, true) }));
                                    // MCP skills changed — invalidate skill-search index so
                                    // next discovery rebuilds with the new set.
                                    clearSkillIndexCache === null || clearSkillIndexCache === void 0 ? void 0 : clearSkillIndexCache();
                                    return [3 /*break*/, 4];
                                case 3:
                                    error_3 = _b.sent();
                                    (0, log_js_1.logMCPError)(client.name, "Failed to refresh prompts after list_changed notification: ".concat((0, errors_js_1.errorMessage)(error_3)));
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); });
                }
                if ((_k = (_j = client.capabilities) === null || _j === void 0 ? void 0 : _j.resources) === null || _k === void 0 ? void 0 : _k.listChanged) {
                    client.client.setNotificationHandler(types_js_1.ResourceListChangedNotificationSchema, function () { return __awaiter(_this, void 0, void 0, function () {
                        var _a, newResources, mcpPrompts, mcpSkills, newResources, error_4;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    (0, log_js_1.logMCPDebug)(client.name, "Received resources/list_changed notification, refreshing resources");
                                    (0, index_js_1.logEvent)('tengu_mcp_list_changed', {
                                        type: 'resources',
                                    });
                                    _b.label = 1;
                                case 1:
                                    _b.trys.push([1, 6, , 7]);
                                    client_js_1.fetchResourcesForClient.cache.delete(client.name);
                                    if (!(0, bun_bundle_1.feature)('MCP_SKILLS')) return [3 /*break*/, 3];
                                    // Skills are discovered from resources, so refresh them too.
                                    // Invalidate prompts cache as well: we write commands here,
                                    // and a concurrent prompts/list_changed could otherwise have
                                    // us stomp its fresh result with our cached stale one.
                                    fetchMcpSkillsForClient.cache.delete(client.name);
                                    client_js_1.fetchCommandsForClient.cache.delete(client.name);
                                    return [4 /*yield*/, Promise.all([
                                            (0, client_js_1.fetchResourcesForClient)(client),
                                            (0, client_js_1.fetchCommandsForClient)(client),
                                            fetchMcpSkillsForClient(client),
                                        ])];
                                case 2:
                                    _a = _b.sent(), newResources = _a[0], mcpPrompts = _a[1], mcpSkills = _a[2];
                                    updateServer(__assign(__assign({}, client), { resources: newResources, commands: __spreadArray(__spreadArray([], mcpPrompts, true), mcpSkills, true) }));
                                    // MCP skills changed — invalidate skill-search index so
                                    // next discovery rebuilds with the new set.
                                    clearSkillIndexCache === null || clearSkillIndexCache === void 0 ? void 0 : clearSkillIndexCache();
                                    return [3 /*break*/, 5];
                                case 3: return [4 /*yield*/, (0, client_js_1.fetchResourcesForClient)(client)];
                                case 4:
                                    newResources = _b.sent();
                                    updateServer(__assign(__assign({}, client), { resources: newResources }));
                                    _b.label = 5;
                                case 5: return [3 /*break*/, 7];
                                case 6:
                                    error_4 = _b.sent();
                                    (0, log_js_1.logMCPError)(client.name, "Failed to refresh resources after list_changed notification: ".concat((0, errors_js_1.errorMessage)(error_4)));
                                    return [3 /*break*/, 7];
                                case 7: return [2 /*return*/];
                            }
                        });
                    }); });
                }
                break;
            }
            case 'needs-auth':
            case 'failed':
            case 'pending':
            case 'disabled':
                break;
        }
    }, [updateServer]);
    // Initialize all servers to pending state if they don't exist in appState.
    // Re-runs on session change (/clear) and on /reload-plugins (pluginReconnectKey).
    // On plugin reload, also disconnects stale plugin MCP servers (scope 'dynamic')
    // that no longer appear in configs — prevents ghost tools from disabled plugins.
    // Skip claude.ai dedup here to avoid blocking on the network fetch; the connect
    // useEffect below runs immediately after and dedups before connecting.
    var sessionId = (0, state_js_1.getSessionId)();
    (0, react_1.useEffect)(function () {
        function initializeServersAsPending() {
            return __awaiter(this, void 0, void 0, function () {
                var _a, existingConfigs, mcpErrors, _b, configs;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            if (!isStrictMcpConfig) return [3 /*break*/, 1];
                            _b = { servers: {}, errors: [] };
                            return [3 /*break*/, 3];
                        case 1: return [4 /*yield*/, (0, config_js_1.getClaudeCodeMcpConfigs)(dynamicMcpConfig)];
                        case 2:
                            _b = _c.sent();
                            _c.label = 3;
                        case 3:
                            _a = _b, existingConfigs = _a.servers, mcpErrors = _a.errors;
                            configs = __assign(__assign({}, existingConfigs), dynamicMcpConfig);
                            // Add MCP errors to plugin errors for UI visibility (deduplicated)
                            addErrorsToAppState(setAppState, mcpErrors);
                            setAppState(function (prevState) {
                                // Disconnect MCP servers that are stale: plugin servers removed from
                                // config, or any server whose config hash changed (edited .mcp.json).
                                // Stale servers get re-added as 'pending' below since their name is
                                // now absent from mcpWithoutStale.clients.
                                var _a = (0, utils_js_1.excludeStalePluginClients)(prevState.mcp, configs), stale = _a.stale, mcpWithoutStale = __rest(_a, ["stale"]);
                                // Clean up stale connections. Fire-and-forget — state updaters must
                                // be synchronous. Three hazards to defuse before calling cleanup:
                                //   1. Pending reconnect timer would fire with the OLD config.
                                //   2. onclose (set at L254) starts reconnectWithBackoff with the
                                //      OLD config from its closure — it checks isMcpServerDisabled
                                //      but config-changed servers aren't disabled, so it'd race the
                                //      fresh connection and last updateServer wins.
                                //   3. clearServerCache internally calls connectToServer (memoized).
                                //      For never-connected servers (disabled/pending/failed) the
                                //      cache is empty → real connect attempt → spawn/OAuth just to
                                //      immediately kill it. Only connected servers need cleanup.
                                for (var _i = 0, stale_1 = stale; _i < stale_1.length; _i++) {
                                    var s = stale_1[_i];
                                    var timer = reconnectTimersRef.current.get(s.name);
                                    if (timer) {
                                        clearTimeout(timer);
                                        reconnectTimersRef.current.delete(s.name);
                                    }
                                    if (s.type === 'connected') {
                                        s.client.onclose = undefined;
                                        void (0, client_js_1.clearServerCache)(s.name, s.config).catch(function () { });
                                    }
                                }
                                var existingServerNames = new Set(mcpWithoutStale.clients.map(function (c) { return c.name; }));
                                var newClients = Object.entries(configs)
                                    .filter(function (_a) {
                                    var name = _a[0];
                                    return !existingServerNames.has(name);
                                })
                                    .map(function (_a) {
                                    var name = _a[0], config = _a[1];
                                    return ({
                                        name: name,
                                        type: (0, config_js_1.isMcpServerDisabled)(name)
                                            ? 'disabled'
                                            : 'pending',
                                        config: config,
                                    });
                                });
                                if (newClients.length === 0 && stale.length === 0) {
                                    return prevState;
                                }
                                return __assign(__assign({}, prevState), { mcp: __assign(__assign(__assign({}, prevState.mcp), mcpWithoutStale), { clients: __spreadArray(__spreadArray([], mcpWithoutStale.clients, true), newClients, true) }) });
                            });
                            return [2 /*return*/];
                    }
                });
            });
        }
        void initializeServersAsPending().catch(function (error) {
            (0, log_js_1.logMCPError)('useManageMCPConnections', "Failed to initialize servers as pending: ".concat((0, errors_js_1.errorMessage)(error)));
        });
    }, [
        isStrictMcpConfig,
        dynamicMcpConfig,
        setAppState,
        sessionId,
        _pluginReconnectKey,
    ]);
    // Load MCP configs and connect to servers
    // Two-phase loading: Claude Code configs first (fast), then claude.ai configs (may be slow)
    (0, react_1.useEffect)(function () {
        var cancelled = false;
        function loadAndConnectMcpConfigs() {
            return __awaiter(this, void 0, void 0, function () {
                var claudeaiPromise, _a, claudeCodeConfigs, mcpErrors, _b, configs, enabledConfigs, claudeaiConfigs, _c, dedupedClaudeAi, enabledClaudeaiConfigs, allConfigs, counts, stdioCommands, _i, _d, _e, name_1, serverConfig;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            if (isStrictMcpConfig || (0, config_js_1.doesEnterpriseMcpConfigExist)()) {
                                claudeaiPromise = Promise.resolve({});
                            }
                            else {
                                (0, claudeai_js_1.clearClaudeAIMcpConfigsCache)();
                                claudeaiPromise = (0, claudeai_js_1.fetchClaudeAIMcpConfigsIfEligible)();
                            }
                            if (!isStrictMcpConfig) return [3 /*break*/, 1];
                            _b = { servers: {}, errors: [] };
                            return [3 /*break*/, 3];
                        case 1: return [4 /*yield*/, (0, config_js_1.getClaudeCodeMcpConfigs)(dynamicMcpConfig, claudeaiPromise)];
                        case 2:
                            _b = _f.sent();
                            _f.label = 3;
                        case 3:
                            _a = _b, claudeCodeConfigs = _a.servers, mcpErrors = _a.errors;
                            if (cancelled)
                                return [2 /*return*/];
                            // Add MCP errors to plugin errors for UI visibility (deduplicated)
                            addErrorsToAppState(setAppState, mcpErrors);
                            configs = __assign(__assign({}, claudeCodeConfigs), dynamicMcpConfig);
                            enabledConfigs = Object.fromEntries(Object.entries(configs).filter(function (_a) {
                                var name = _a[0];
                                return !(0, config_js_1.isMcpServerDisabled)(name);
                            }));
                            (0, client_js_1.getMcpToolsCommandsAndResources)(onConnectionAttempt, enabledConfigs).catch(function (error) {
                                (0, log_js_1.logMCPError)('useManageMcpConnections', "Failed to get MCP resources: ".concat((0, errors_js_1.errorMessage)(error)));
                            });
                            claudeaiConfigs = {};
                            if (!!isStrictMcpConfig) return [3 /*break*/, 5];
                            _c = config_js_1.filterMcpServersByPolicy;
                            return [4 /*yield*/, claudeaiPromise];
                        case 4:
                            claudeaiConfigs = _c.apply(void 0, [_f.sent()]).allowed;
                            if (cancelled)
                                return [2 /*return*/];
                            // Suppress claude.ai connectors that duplicate an enabled manual server.
                            // Keys never collide (`slack` vs `claude.ai Slack`) so the merge below
                            // won't catch this — need content-based dedup by URL signature.
                            if (Object.keys(claudeaiConfigs).length > 0) {
                                dedupedClaudeAi = (0, config_js_1.dedupClaudeAiMcpServers)(claudeaiConfigs, configs).servers;
                                claudeaiConfigs = dedupedClaudeAi;
                            }
                            if (Object.keys(claudeaiConfigs).length > 0) {
                                // Add claude.ai servers as pending immediately so they show up in UI
                                setAppState(function (prevState) {
                                    var existingServerNames = new Set(prevState.mcp.clients.map(function (c) { return c.name; }));
                                    var newClients = Object.entries(claudeaiConfigs)
                                        .filter(function (_a) {
                                        var name = _a[0];
                                        return !existingServerNames.has(name);
                                    })
                                        .map(function (_a) {
                                        var name = _a[0], config = _a[1];
                                        return ({
                                            name: name,
                                            type: (0, config_js_1.isMcpServerDisabled)(name)
                                                ? 'disabled'
                                                : 'pending',
                                            config: config,
                                        });
                                    });
                                    if (newClients.length === 0)
                                        return prevState;
                                    return __assign(__assign({}, prevState), { mcp: __assign(__assign({}, prevState.mcp), { clients: __spreadArray(__spreadArray([], prevState.mcp.clients, true), newClients, true) }) });
                                });
                                enabledClaudeaiConfigs = Object.fromEntries(Object.entries(claudeaiConfigs).filter(function (_a) {
                                    var name = _a[0];
                                    return !(0, config_js_1.isMcpServerDisabled)(name);
                                }));
                                (0, client_js_1.getMcpToolsCommandsAndResources)(onConnectionAttempt, enabledClaudeaiConfigs).catch(function (error) {
                                    (0, log_js_1.logMCPError)('useManageMcpConnections', "Failed to get claude.ai MCP resources: ".concat((0, errors_js_1.errorMessage)(error)));
                                });
                            }
                            _f.label = 5;
                        case 5:
                            allConfigs = __assign(__assign({}, configs), claudeaiConfigs);
                            counts = {
                                enterprise: 0,
                                global: 0,
                                project: 0,
                                user: 0,
                                plugin: 0,
                                claudeai: 0,
                            };
                            stdioCommands = [];
                            for (_i = 0, _d = Object.entries(allConfigs); _i < _d.length; _i++) {
                                _e = _d[_i], name_1 = _e[0], serverConfig = _e[1];
                                if (serverConfig.scope === 'enterprise')
                                    counts.enterprise++;
                                else if (serverConfig.scope === 'user')
                                    counts.global++;
                                else if (serverConfig.scope === 'project')
                                    counts.project++;
                                else if (serverConfig.scope === 'local')
                                    counts.user++;
                                else if (serverConfig.scope === 'dynamic')
                                    counts.plugin++;
                                else if (serverConfig.scope === 'claudeai')
                                    counts.claudeai++;
                                if (process.env.USER_TYPE === 'ant' &&
                                    !(0, config_js_1.isMcpServerDisabled)(name_1) &&
                                    (serverConfig.type === undefined || serverConfig.type === 'stdio') &&
                                    'command' in serverConfig) {
                                    stdioCommands.push((0, path_1.basename)(serverConfig.command));
                                }
                            }
                            (0, index_js_1.logEvent)('tengu_mcp_servers', __assign(__assign({}, counts), (process.env.USER_TYPE === 'ant' && stdioCommands.length > 0
                                ? {
                                    stdio_commands: stdioCommands
                                        .sort()
                                        .join(','),
                                }
                                : {})));
                            return [2 /*return*/];
                    }
                });
            });
        }
        void loadAndConnectMcpConfigs();
        return function () {
            cancelled = true;
        };
    }, [
        isStrictMcpConfig,
        dynamicMcpConfig,
        onConnectionAttempt,
        setAppState,
        _authVersion,
        sessionId,
        _pluginReconnectKey,
    ]);
    // Cleanup all timers on unmount
    (0, react_1.useEffect)(function () {
        var timers = reconnectTimersRef.current;
        return function () {
            for (var _i = 0, _a = timers.values(); _i < _a.length; _i++) {
                var timer = _a[_i];
                clearTimeout(timer);
            }
            timers.clear();
            // Flush any pending batched MCP updates before unmount
            if (flushTimerRef.current !== null) {
                clearTimeout(flushTimerRef.current);
                flushTimerRef.current = null;
                flushPendingUpdates();
            }
        };
    }, [flushPendingUpdates]);
    // Expose reconnectMcpServer function for components to use.
    // Reads mcp.clients via store.getState() so this callback stays stable
    // across client state transitions (no need to re-create on every connect).
    var reconnectMcpServer = (0, react_1.useCallback)(function (serverName) { return __awaiter(_this, void 0, void 0, function () {
        var client, existingTimer, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    client = store
                        .getState()
                        .mcp.clients.find(function (c) { return c.name === serverName; });
                    if (!client) {
                        throw new Error("MCP server ".concat(serverName, " not found"));
                    }
                    existingTimer = reconnectTimersRef.current.get(serverName);
                    if (existingTimer) {
                        clearTimeout(existingTimer);
                        reconnectTimersRef.current.delete(serverName);
                    }
                    return [4 /*yield*/, (0, client_js_1.reconnectMcpServerImpl)(serverName, client.config)];
                case 1:
                    result = _a.sent();
                    onConnectionAttempt(result);
                    // Don't throw, just let UI handle the client type in case the reconnect failed
                    // (Detailed logs are within the reconnectMcpServerImpl via --debug)
                    return [2 /*return*/, result];
            }
        });
    }); }, [store, onConnectionAttempt]);
    // Expose function to toggle server enabled/disabled state
    var toggleMcpServer = (0, react_1.useCallback)(function (serverName) { return __awaiter(_this, void 0, void 0, function () {
        var client, isCurrentlyDisabled, existingTimer, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    client = store
                        .getState()
                        .mcp.clients.find(function (c) { return c.name === serverName; });
                    if (!client) {
                        throw new Error("MCP server ".concat(serverName, " not found"));
                    }
                    isCurrentlyDisabled = client.type === 'disabled';
                    if (!!isCurrentlyDisabled) return [3 /*break*/, 3];
                    existingTimer = reconnectTimersRef.current.get(serverName);
                    if (existingTimer) {
                        clearTimeout(existingTimer);
                        reconnectTimersRef.current.delete(serverName);
                    }
                    // Persist disabled state to disk FIRST before clearing cache
                    // This is important because the onclose handler checks disk state
                    (0, config_js_1.setMcpServerEnabled)(serverName, false);
                    if (!(client.type === 'connected')) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, client_js_1.clearServerCache)(serverName, client.config)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    // Update to disabled state (tools/commands/resources auto-cleared)
                    updateServer({
                        name: serverName,
                        type: 'disabled',
                        config: client.config,
                    });
                    return [3 /*break*/, 5];
                case 3:
                    // Enabling: persist enabled state to disk first
                    (0, config_js_1.setMcpServerEnabled)(serverName, true);
                    // Mark as pending and reconnect
                    updateServer({
                        name: serverName,
                        type: 'pending',
                        config: client.config,
                    });
                    return [4 /*yield*/, (0, client_js_1.reconnectMcpServerImpl)(serverName, client.config)];
                case 4:
                    result = _a.sent();
                    onConnectionAttempt(result);
                    _a.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    }); }, [store, updateServer, onConnectionAttempt]);
    return { reconnectMcpServer: reconnectMcpServer, toggleMcpServer: toggleMcpServer };
}
function getTransportDisplayName(type) {
    switch (type) {
        case 'http':
            return 'HTTP';
        case 'ws':
        case 'ws-ide':
            return 'WebSocket';
        default:
            return 'SSE';
    }
}
