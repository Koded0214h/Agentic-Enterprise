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
exports.useRemoteSession = useRemoteSession;
var react_1 = require("react");
var bridgeMessaging_js_1 = require("../bridge/bridgeMessaging.js");
var RemoteSessionManager_js_1 = require("../remote/RemoteSessionManager.js");
var remotePermissionBridge_js_1 = require("../remote/remotePermissionBridge.js");
var sdkMessageAdapter_js_1 = require("../remote/sdkMessageAdapter.js");
var AppState_js_1 = require("../state/AppState.js");
var Tool_js_1 = require("../Tool.js");
var debug_js_1 = require("../utils/debug.js");
var format_js_1 = require("../utils/format.js");
var messages_js_1 = require("../utils/messages.js");
var sessionTitle_js_1 = require("../utils/sessionTitle.js");
var api_js_1 = require("../utils/teleport/api.js");
// How long to wait for a response before showing a warning
var RESPONSE_TIMEOUT_MS = 60000; // 60 seconds
// Extended timeout during compaction — compact API calls take 5-30s and
// block other SDK messages, so the normal 60s timeout isn't enough when
// compaction itself runs close to the edge.
var COMPACTION_TIMEOUT_MS = 180000; // 3 minutes
/**
 * Hook for managing a remote CCR session in the REPL.
 *
 * Handles:
 * - WebSocket connection to CCR
 * - Converting SDK messages to REPL messages
 * - Sending user input to CCR via HTTP POST
 * - Permission request/response flow via existing ToolUseConfirm queue
 */
function useRemoteSession(_a) {
    var _this = this;
    var config = _a.config, setMessages = _a.setMessages, setIsLoading = _a.setIsLoading, onInit = _a.onInit, setToolUseConfirmQueue = _a.setToolUseConfirmQueue, tools = _a.tools, setStreamingToolUses = _a.setStreamingToolUses, setStreamMode = _a.setStreamMode, setInProgressToolUseIDs = _a.setInProgressToolUseIDs;
    var isRemoteMode = !!config;
    var setAppState = (0, AppState_js_1.useSetAppState)();
    var setConnStatus = (0, react_1.useCallback)(function (s) {
        return setAppState(function (prev) {
            return prev.remoteConnectionStatus === s
                ? prev
                : __assign(__assign({}, prev), { remoteConnectionStatus: s });
        });
    }, [setAppState]);
    // Event-sourced count of subagents running inside the remote daemon child.
    // The viewer's own AppState.tasks is empty — tasks live in a different
    // process. task_started/task_notification reach us via the bridge WS.
    var runningTaskIdsRef = (0, react_1.useRef)(new Set());
    var writeTaskCount = (0, react_1.useCallback)(function () {
        var n = runningTaskIdsRef.current.size;
        setAppState(function (prev) {
            return prev.remoteBackgroundTaskCount === n
                ? prev
                : __assign(__assign({}, prev), { remoteBackgroundTaskCount: n });
        });
    }, [setAppState]);
    // Timer for detecting stuck sessions
    var responseTimeoutRef = (0, react_1.useRef)(null);
    // Track whether the remote session is compacting. During compaction the
    // CLI worker is busy with an API call and won't emit messages for a while;
    // use a longer timeout and suppress spurious "unresponsive" warnings.
    var isCompactingRef = (0, react_1.useRef)(false);
    var managerRef = (0, react_1.useRef)(null);
    // Track whether we've already updated the session title (for no-initial-prompt sessions)
    var hasUpdatedTitleRef = (0, react_1.useRef)(false);
    // UUIDs of user messages we POSTed locally — the WS echoes them back and
    // we must filter them out when convertUserTextMessages is on, or the viewer
    // sees every typed message twice (once from local createUserMessage, once
    // from the echo). A single POST can echo MULTIPLE times with the same uuid:
    // the server may broadcast the POST directly to /subscribe, AND the worker
    // (cowork desktop / CLI daemon) echoes it again on its write path. A
    // delete-on-first-match Set would let the second echo through — use a
    // bounded ring instead. Cap is generous: users don't type 50 messages
    // faster than echoes arrive.
    // NOTE: this does NOT dedup history-vs-live overlap at attach time (nothing
    // seeds the set from history UUIDs; only sendMessage populates it).
    var sentUUIDsRef = (0, react_1.useRef)(new bridgeMessaging_js_1.BoundedUUIDSet(50));
    // Keep a ref to tools so the WebSocket callback doesn't go stale
    var toolsRef = (0, react_1.useRef)(tools);
    (0, react_1.useEffect)(function () {
        toolsRef.current = tools;
    }, [tools]);
    // Initialize and connect to remote session
    (0, react_1.useEffect)(function () {
        // Skip if not in remote mode
        if (!config) {
            return;
        }
        (0, debug_js_1.logForDebugging)("[useRemoteSession] Initializing for session ".concat(config.sessionId));
        var manager = new RemoteSessionManager_js_1.RemoteSessionManager(config, {
            onMessage: function (sdkMessage) {
                var _a, _b;
                var parts = ["type=".concat(sdkMessage.type)];
                if ('subtype' in sdkMessage)
                    parts.push("subtype=".concat(sdkMessage.subtype));
                if (sdkMessage.type === 'user') {
                    var c = (_a = sdkMessage.message) === null || _a === void 0 ? void 0 : _a.content;
                    parts.push("content=".concat(Array.isArray(c) ? c.map(function (b) { return b.type; }).join(',') : typeof c));
                }
                (0, debug_js_1.logForDebugging)("[useRemoteSession] Received ".concat(parts.join(' ')));
                // Clear response timeout on any message received — including the WS
                // echo of our own POST, which acts as a heartbeat. This must run
                // BEFORE the echo filter, or slow-to-stream agents (compaction, cold
                // start) spuriously trip the 60s unresponsive warning + reconnect.
                if (responseTimeoutRef.current) {
                    clearTimeout(responseTimeoutRef.current);
                    responseTimeoutRef.current = null;
                }
                // Echo filter: drop user messages we already added locally before POST.
                // The server and/or worker round-trip our own send back on the WS with
                // the same uuid we passed to sendEventToRemoteSession. DO NOT delete on
                // match — the same uuid can echo more than once (server broadcast +
                // worker echo), and BoundedUUIDSet already caps growth via its ring.
                if (sdkMessage.type === 'user' &&
                    sdkMessage.uuid &&
                    sentUUIDsRef.current.has(sdkMessage.uuid)) {
                    (0, debug_js_1.logForDebugging)("[useRemoteSession] Dropping echoed user message ".concat(sdkMessage.uuid));
                    return;
                }
                // Handle init message - extract available slash commands
                if (sdkMessage.type === 'system' &&
                    sdkMessage.subtype === 'init' &&
                    onInit) {
                    (0, debug_js_1.logForDebugging)("[useRemoteSession] Init received with ".concat(sdkMessage.slash_commands.length, " slash commands"));
                    onInit(sdkMessage.slash_commands);
                }
                // Track remote subagent lifecycle for the "N in background" counter.
                // All task types (Agent/teammate/workflow/bash) flow through
                // registerTask() → task_started, and complete via task_notification.
                // Return early — these are status signals, not renderable messages.
                if (sdkMessage.type === 'system') {
                    if (sdkMessage.subtype === 'task_started') {
                        runningTaskIdsRef.current.add(sdkMessage.task_id);
                        writeTaskCount();
                        return;
                    }
                    if (sdkMessage.subtype === 'task_notification') {
                        runningTaskIdsRef.current.delete(sdkMessage.task_id);
                        writeTaskCount();
                        return;
                    }
                    if (sdkMessage.subtype === 'task_progress') {
                        return;
                    }
                    // Track compaction state. The CLI emits status='compacting' at
                    // the start and status=null when done; compact_boundary also
                    // signals completion. Repeated 'compacting' status messages
                    // (keep-alive ticks) update the ref but don't append to messages.
                    if (sdkMessage.subtype === 'status') {
                        var wasCompacting = isCompactingRef.current;
                        isCompactingRef.current = sdkMessage.status === 'compacting';
                        if (wasCompacting && isCompactingRef.current) {
                            return;
                        }
                    }
                    if (sdkMessage.subtype === 'compact_boundary') {
                        isCompactingRef.current = false;
                    }
                }
                // Check if session ended
                if ((0, sdkMessageAdapter_js_1.isSessionEndMessage)(sdkMessage)) {
                    isCompactingRef.current = false;
                    setIsLoading(false);
                }
                // Clear in-progress tool_use IDs when their tool_result arrives.
                // Must read the RAW sdkMessage: in non-viewerOnly mode,
                // convertSDKMessage returns {type:'ignored'} for user messages, so the
                // delete would never fire post-conversion. Mirrors the add site below
                // and inProcessRunner.ts; without this the set grows unbounded for the
                // session lifetime (BQ: CCR cohort shows 5.2x higher RSS slope).
                if (setInProgressToolUseIDs && sdkMessage.type === 'user') {
                    var content = (_b = sdkMessage.message) === null || _b === void 0 ? void 0 : _b.content;
                    if (Array.isArray(content)) {
                        var resultIds_1 = [];
                        for (var _i = 0, content_1 = content; _i < content_1.length; _i++) {
                            var block = content_1[_i];
                            if (block.type === 'tool_result') {
                                resultIds_1.push(block.tool_use_id);
                            }
                        }
                        if (resultIds_1.length > 0) {
                            setInProgressToolUseIDs(function (prev) {
                                var next = new Set(prev);
                                for (var _i = 0, resultIds_2 = resultIds_1; _i < resultIds_2.length; _i++) {
                                    var id = resultIds_2[_i];
                                    next.delete(id);
                                }
                                return next.size === prev.size ? prev : next;
                            });
                        }
                    }
                }
                // Convert SDK message to REPL message. In viewerOnly mode, the
                // remote agent runs BriefTool (SendUserMessage) — its tool_use block
                // renders empty (userFacingName() === ''), actual content is in the
                // tool_result. So we must convert tool_results to render them.
                var converted = (0, sdkMessageAdapter_js_1.convertSDKMessage)(sdkMessage, config.viewerOnly
                    ? { convertToolResults: true, convertUserTextMessages: true }
                    : undefined);
                if (converted.type === 'message') {
                    // When we receive a complete message, clear streaming tool uses
                    // since the complete message replaces the partial streaming state
                    setStreamingToolUses === null || setStreamingToolUses === void 0 ? void 0 : setStreamingToolUses(function (prev) { return (prev.length > 0 ? [] : prev); });
                    // Mark tool_use blocks as in-progress so the UI shows the correct
                    // spinner state instead of "Waiting…" (queued). In local sessions,
                    // toolOrchestration.ts handles this, but remote sessions receive
                    // pre-built assistant messages without running local tool execution.
                    if (setInProgressToolUseIDs &&
                        converted.message.type === 'assistant') {
                        var toolUseIds_1 = converted.message.message.content
                            .filter(function (block) { return block.type === 'tool_use'; })
                            .map(function (block) { return block.id; });
                        if (toolUseIds_1.length > 0) {
                            setInProgressToolUseIDs(function (prev) {
                                var next = new Set(prev);
                                for (var _i = 0, toolUseIds_2 = toolUseIds_1; _i < toolUseIds_2.length; _i++) {
                                    var id = toolUseIds_2[_i];
                                    next.add(id);
                                }
                                return next;
                            });
                        }
                    }
                    setMessages(function (prev) { return __spreadArray(__spreadArray([], prev, true), [converted.message], false); });
                    // Note: Don't stop loading on assistant messages - the agent may still be
                    // working (tool use loops). Loading stops only on session end or permission request.
                }
                else if (converted.type === 'stream_event') {
                    // Process streaming events to update UI in real-time
                    if (setStreamingToolUses && setStreamMode) {
                        (0, messages_js_1.handleMessageFromStream)(converted.event, function (message) { return setMessages(function (prev) { return __spreadArray(__spreadArray([], prev, true), [message], false); }); }, function () {
                            // No-op for response length - remote sessions don't track this
                        }, setStreamMode, setStreamingToolUses);
                    }
                    else {
                        (0, debug_js_1.logForDebugging)("[useRemoteSession] Stream event received but streaming callbacks not provided");
                    }
                }
                // 'ignored' messages are silently dropped
            },
            onPermissionRequest: function (request, requestId) {
                var _a, _b, _c;
                (0, debug_js_1.logForDebugging)("[useRemoteSession] Permission request for tool: ".concat(request.tool_name));
                // Look up the Tool object by name, or create a stub for unknown tools
                var tool = (_a = (0, Tool_js_1.findToolByName)(toolsRef.current, request.tool_name)) !== null && _a !== void 0 ? _a : (0, remotePermissionBridge_js_1.createToolStub)(request.tool_name);
                var syntheticMessage = (0, remotePermissionBridge_js_1.createSyntheticAssistantMessage)(request, requestId);
                var permissionResult = {
                    behavior: 'ask',
                    message: (_b = request.description) !== null && _b !== void 0 ? _b : "".concat(request.tool_name, " requires permission"),
                    suggestions: request.permission_suggestions,
                    blockedPath: request.blocked_path,
                };
                var toolUseConfirm = {
                    assistantMessage: syntheticMessage,
                    tool: tool,
                    description: (_c = request.description) !== null && _c !== void 0 ? _c : "".concat(request.tool_name, " requires permission"),
                    input: request.input,
                    toolUseContext: {},
                    toolUseID: request.tool_use_id,
                    permissionResult: permissionResult,
                    permissionPromptStartTimeMs: Date.now(),
                    onUserInteraction: function () {
                        // No-op for remote — classifier runs on the container
                    },
                    onAbort: function () {
                        var response = {
                            behavior: 'deny',
                            message: 'User aborted',
                        };
                        manager.respondToPermissionRequest(requestId, response);
                        setToolUseConfirmQueue(function (queue) {
                            return queue.filter(function (item) { return item.toolUseID !== request.tool_use_id; });
                        });
                    },
                    onAllow: function (updatedInput, _permissionUpdates, _feedback) {
                        var response = {
                            behavior: 'allow',
                            updatedInput: updatedInput,
                        };
                        manager.respondToPermissionRequest(requestId, response);
                        setToolUseConfirmQueue(function (queue) {
                            return queue.filter(function (item) { return item.toolUseID !== request.tool_use_id; });
                        });
                        // Resume loading indicator after approving
                        setIsLoading(true);
                    },
                    onReject: function (feedback) {
                        var response = {
                            behavior: 'deny',
                            message: feedback !== null && feedback !== void 0 ? feedback : 'User denied permission',
                        };
                        manager.respondToPermissionRequest(requestId, response);
                        setToolUseConfirmQueue(function (queue) {
                            return queue.filter(function (item) { return item.toolUseID !== request.tool_use_id; });
                        });
                    },
                    recheckPermission: function () {
                        return __awaiter(this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                return [2 /*return*/];
                            });
                        });
                    },
                };
                setToolUseConfirmQueue(function (queue) { return __spreadArray(__spreadArray([], queue, true), [toolUseConfirm], false); });
                // Pause loading indicator while waiting for permission
                setIsLoading(false);
            },
            onPermissionCancelled: function (requestId, toolUseId) {
                (0, debug_js_1.logForDebugging)("[useRemoteSession] Permission request cancelled: ".concat(requestId));
                var idToRemove = toolUseId !== null && toolUseId !== void 0 ? toolUseId : requestId;
                setToolUseConfirmQueue(function (queue) {
                    return queue.filter(function (item) { return item.toolUseID !== idToRemove; });
                });
                setIsLoading(true);
            },
            onConnected: function () {
                (0, debug_js_1.logForDebugging)('[useRemoteSession] Connected');
                setConnStatus('connected');
            },
            onReconnecting: function () {
                (0, debug_js_1.logForDebugging)('[useRemoteSession] Reconnecting');
                setConnStatus('reconnecting');
                // WS gap = we may miss task_notification events. Clear rather than
                // drift high forever. Undercounts tasks that span the gap; accepted.
                runningTaskIdsRef.current.clear();
                writeTaskCount();
                // Same for tool_use IDs: missed tool_result during the gap would
                // leave stale spinner state forever.
                setInProgressToolUseIDs === null || setInProgressToolUseIDs === void 0 ? void 0 : setInProgressToolUseIDs(function (prev) { return (prev.size > 0 ? new Set() : prev); });
            },
            onDisconnected: function () {
                (0, debug_js_1.logForDebugging)('[useRemoteSession] Disconnected');
                setConnStatus('disconnected');
                setIsLoading(false);
                runningTaskIdsRef.current.clear();
                writeTaskCount();
                setInProgressToolUseIDs === null || setInProgressToolUseIDs === void 0 ? void 0 : setInProgressToolUseIDs(function (prev) { return (prev.size > 0 ? new Set() : prev); });
            },
            onError: function (error) {
                (0, debug_js_1.logForDebugging)("[useRemoteSession] Error: ".concat(error.message));
            },
        });
        managerRef.current = manager;
        manager.connect();
        return function () {
            (0, debug_js_1.logForDebugging)('[useRemoteSession] Cleanup - disconnecting');
            // Clear any pending timeout
            if (responseTimeoutRef.current) {
                clearTimeout(responseTimeoutRef.current);
                responseTimeoutRef.current = null;
            }
            manager.disconnect();
            managerRef.current = null;
        };
    }, [
        config,
        setMessages,
        setIsLoading,
        onInit,
        setToolUseConfirmQueue,
        setStreamingToolUses,
        setStreamMode,
        setInProgressToolUseIDs,
        setConnStatus,
        writeTaskCount,
    ]);
    // Send a user message to the remote session
    var sendMessage = (0, react_1.useCallback)(function (content, opts) { return __awaiter(_this, void 0, void 0, function () {
        var manager, success, sessionId_1, description_1, timeoutMs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    manager = managerRef.current;
                    if (!manager) {
                        (0, debug_js_1.logForDebugging)('[useRemoteSession] Cannot send - no manager');
                        return [2 /*return*/, false];
                    }
                    // Clear any existing timeout
                    if (responseTimeoutRef.current) {
                        clearTimeout(responseTimeoutRef.current);
                    }
                    setIsLoading(true);
                    // Track locally-added message UUIDs so the WS echo can be filtered.
                    // Must record BEFORE the POST to close the race where the echo arrives
                    // before the POST promise resolves.
                    if (opts === null || opts === void 0 ? void 0 : opts.uuid)
                        sentUUIDsRef.current.add(opts.uuid);
                    return [4 /*yield*/, manager.sendMessage(content, opts)];
                case 1:
                    success = _a.sent();
                    if (!success) {
                        // No need to undo the pre-POST add — BoundedUUIDSet's ring evicts it.
                        setIsLoading(false);
                        return [2 /*return*/, false];
                    }
                    // Update the session title after the first message when no initial prompt was provided.
                    // This gives the session a meaningful title on claude.ai instead of "Background task".
                    // Skip in viewerOnly mode — the remote agent owns the session title.
                    if (!hasUpdatedTitleRef.current &&
                        config &&
                        !config.hasInitialPrompt &&
                        !config.viewerOnly) {
                        hasUpdatedTitleRef.current = true;
                        sessionId_1 = config.sessionId;
                        description_1 = typeof content === 'string'
                            ? content
                            : (0, messages_js_1.extractTextContent)(content, ' ');
                        if (description_1) {
                            // generateSessionTitle never rejects (wraps body in try/catch,
                            // returns null on failure), so no .catch needed on this chain.
                            void (0, sessionTitle_js_1.generateSessionTitle)(description_1, new AbortController().signal).then(function (title) {
                                void (0, api_js_1.updateSessionTitle)(sessionId_1, title !== null && title !== void 0 ? title : (0, format_js_1.truncateToWidth)(description_1, 75));
                            });
                        }
                    }
                    // Start timeout to detect stuck sessions. Skip in viewerOnly mode —
                    // the remote agent may be idle-shut and take >60s to respawn.
                    // Use a longer timeout when the remote session is compacting, since
                    // the CLI worker is busy with an API call and won't emit messages.
                    if (!(config === null || config === void 0 ? void 0 : config.viewerOnly)) {
                        timeoutMs = isCompactingRef.current
                            ? COMPACTION_TIMEOUT_MS
                            : RESPONSE_TIMEOUT_MS;
                        responseTimeoutRef.current = setTimeout(function (setMessages, manager) {
                            (0, debug_js_1.logForDebugging)('[useRemoteSession] Response timeout - attempting reconnect');
                            // Add a warning message to the conversation
                            var warningMessage = (0, messages_js_1.createSystemMessage)('Remote session may be unresponsive. Attempting to reconnect…', 'warning');
                            setMessages(function (prev) { return __spreadArray(__spreadArray([], prev, true), [warningMessage], false); });
                            // Attempt to reconnect the WebSocket - the subscription may have become stale
                            manager.reconnect();
                        }, timeoutMs, setMessages, manager);
                    }
                    return [2 /*return*/, success];
            }
        });
    }); }, [config, setIsLoading, setMessages]);
    // Cancel the current request on the remote session
    var cancelRequest = (0, react_1.useCallback)(function () {
        var _a;
        // Clear any pending timeout
        if (responseTimeoutRef.current) {
            clearTimeout(responseTimeoutRef.current);
            responseTimeoutRef.current = null;
        }
        // Send interrupt signal to CCR. Skip in viewerOnly mode — Ctrl+C
        // should never interrupt the remote agent.
        if (!(config === null || config === void 0 ? void 0 : config.viewerOnly)) {
            (_a = managerRef.current) === null || _a === void 0 ? void 0 : _a.cancelSession();
        }
        setIsLoading(false);
    }, [config, setIsLoading]);
    // Disconnect from the session
    var disconnect = (0, react_1.useCallback)(function () {
        var _a;
        // Clear any pending timeout
        if (responseTimeoutRef.current) {
            clearTimeout(responseTimeoutRef.current);
            responseTimeoutRef.current = null;
        }
        (_a = managerRef.current) === null || _a === void 0 ? void 0 : _a.disconnect();
        managerRef.current = null;
    }, []);
    // All four fields are already stable (boolean derived from a prop that
    // doesn't change mid-session, three useCallbacks with stable deps). The
    // result object is consumed by REPL's onSubmit useCallback deps — without
    // memoization the fresh literal invalidates onSubmit on every REPL render,
    // which in turn churns PromptInput's props and downstream memoization.
    return (0, react_1.useMemo)(function () { return ({ isRemoteMode: isRemoteMode, sendMessage: sendMessage, cancelRequest: cancelRequest, disconnect: disconnect }); }, [isRemoteMode, sendMessage, cancelRequest, disconnect]);
}
