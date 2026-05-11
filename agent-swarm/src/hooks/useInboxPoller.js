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
exports.useInboxPoller = useInboxPoller;
var crypto_1 = require("crypto");
var react_1 = require("react");
var usehooks_ts_1 = require("usehooks-ts");
var xml_js_1 = require("../constants/xml.js");
var useTerminalNotification_js_1 = require("../ink/useTerminalNotification.js");
var notifier_js_1 = require("../services/notifier.js");
var AppState_js_1 = require("../state/AppState.js");
var Tool_js_1 = require("../Tool.js");
var types_js_1 = require("../tasks/InProcessTeammateTask/types.js");
var tools_js_1 = require("../tools.js");
var debug_js_1 = require("../utils/debug.js");
var inProcessTeammateHelpers_js_1 = require("../utils/inProcessTeammateHelpers.js");
var messages_js_1 = require("../utils/messages.js");
var PermissionMode_js_1 = require("../utils/permissions/PermissionMode.js");
var PermissionUpdate_js_1 = require("../utils/permissions/PermissionUpdate.js");
var slowOperations_js_1 = require("../utils/slowOperations.js");
var detection_js_1 = require("../utils/swarm/backends/detection.js");
var registry_js_1 = require("../utils/swarm/backends/registry.js");
var constants_js_1 = require("../utils/swarm/constants.js");
var leaderPermissionBridge_js_1 = require("../utils/swarm/leaderPermissionBridge.js");
var permissionSync_js_1 = require("../utils/swarm/permissionSync.js");
var teamHelpers_js_1 = require("../utils/swarm/teamHelpers.js");
var tasks_js_1 = require("../utils/tasks.js");
var teammate_js_1 = require("../utils/teammate.js");
var teammateContext_js_1 = require("../utils/teammateContext.js");
var teammateMailbox_js_1 = require("../utils/teammateMailbox.js");
var useSwarmPermissionPoller_js_1 = require("./useSwarmPermissionPoller.js");
/**
 * Get the agent name to poll for messages.
 * - In-process teammates return undefined (they use waitForNextPromptOrShutdown instead)
 * - Process-based teammates use their CLAUDE_CODE_AGENT_NAME
 * - Team leads use their name from teamContext.teammates
 * - Standalone sessions return undefined
 */
function getAgentNameToPoll(appState) {
    var _a;
    // In-process teammates should NOT use useInboxPoller - they have their own
    // polling mechanism via waitForNextPromptOrShutdown() in inProcessRunner.ts.
    // Using useInboxPoller would cause message routing issues since in-process
    // teammates share the same React context and AppState with the leader.
    //
    // Note: This can be called when the leader's REPL re-renders while an
    // in-process teammate's AsyncLocalStorage context is active (due to shared
    // setAppState). We return undefined to gracefully skip polling rather than
    // throwing, since this is a normal occurrence during concurrent execution.
    if ((0, teammateContext_js_1.isInProcessTeammate)()) {
        return undefined;
    }
    if ((0, teammate_js_1.isTeammate)()) {
        return (0, teammate_js_1.getAgentName)();
    }
    // Team lead polls using their agent name (not ID)
    if ((0, teammate_js_1.isTeamLead)(appState.teamContext)) {
        var leadAgentId = appState.teamContext.leadAgentId;
        // Look up the lead's name from teammates map
        var leadName = (_a = appState.teamContext.teammates[leadAgentId]) === null || _a === void 0 ? void 0 : _a.name;
        return leadName || 'team-lead';
    }
    return undefined;
}
var INBOX_POLL_INTERVAL_MS = 1000;
/**
 * Polls the teammate inbox for new messages and submits them as turns.
 *
 * This hook:
 * 1. Polls every 1s for unread messages (teammates or team leads)
 * 2. When idle: submits messages immediately as a new turn
 * 3. When busy: queues messages in AppState.inbox for UI display, delivers when turn ends
 */
function useInboxPoller(_a) {
    var _this = this;
    var enabled = _a.enabled, isLoading = _a.isLoading, focusedInputDialog = _a.focusedInputDialog, onSubmitMessage = _a.onSubmitMessage;
    // Assign to original name for clarity within the function
    var onSubmitTeammateMessage = onSubmitMessage;
    var store = (0, AppState_js_1.useAppStateStore)();
    var setAppState = (0, AppState_js_1.useSetAppState)();
    var inboxMessageCount = (0, AppState_js_1.useAppState)(function (s) { return s.inbox.messages.length; });
    var terminal = (0, useTerminalNotification_js_1.useTerminalNotification)();
    var poll = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var currentAppState, agentName, unread, _loop_1, _i, unread_1, msg, markRead, permissionRequests, permissionResponses, sandboxPermissionRequests, sandboxPermissionResponses, shutdownRequests, shutdownApprovals, teamPermissionUpdates, modeSetRequests, planApprovalRequests, regularMessages, _a, unread_2, m, permReq, permResp, sandboxReq, sandboxResp, shutdownReq, shutdownApproval, teamPermUpdate, modeSetReq, planApprovalReq, setToolUseConfirmQueue, teamName_1, _loop_2, _b, permissionRequests_1, m, firstParsed, _c, permissionResponses_1, m, parsed, newSandboxRequests_1, _d, sandboxPermissionRequests_1, m, parsed, firstRequest, _e, sandboxPermissionResponses_1, m, parsed, _loop_3, _f, teamPermissionUpdates_1, m, _loop_4, _g, modeSetRequests_1, m, teamName, leaderExternalMode, modeToInherit, _h, planApprovalRequests_1, m, parsed, approvalResponse, taskId, _j, shutdownRequests_1, m, _loop_5, _k, shutdownApprovals_1, m, formatted, queueMessages, submitted;
        var _this = this;
        var _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
        return __generator(this, function (_1) {
            switch (_1.label) {
                case 0:
                    if (!enabled)
                        return [2 /*return*/];
                    currentAppState = store.getState();
                    agentName = getAgentNameToPoll(currentAppState);
                    if (!agentName)
                        return [2 /*return*/];
                    return [4 /*yield*/, (0, teammateMailbox_js_1.readUnreadMessages)(agentName, (_l = currentAppState.teamContext) === null || _l === void 0 ? void 0 : _l.teamName)];
                case 1:
                    unread = _1.sent();
                    if (unread.length === 0)
                        return [2 /*return*/];
                    (0, debug_js_1.logForDebugging)("[InboxPoller] Found ".concat(unread.length, " unread message(s)"));
                    // Check for plan approval responses and transition out of plan mode if approved
                    // Security: Only accept approval responses from the team lead
                    if ((0, teammate_js_1.isTeammate)() && (0, teammate_js_1.isPlanModeRequired)()) {
                        _loop_1 = function (msg) {
                            var approvalResponse = (0, teammateMailbox_js_1.isPlanApprovalResponse)(msg.text);
                            // Verify the message is from the team lead to prevent teammates from forging approvals
                            if (approvalResponse && msg.from === 'team-lead') {
                                (0, debug_js_1.logForDebugging)("[InboxPoller] Received plan approval response from team-lead: approved=".concat(approvalResponse.approved));
                                if (approvalResponse.approved) {
                                    // Use leader's permission mode if provided, otherwise default
                                    var targetMode_1 = (_m = approvalResponse.permissionMode) !== null && _m !== void 0 ? _m : 'default';
                                    // Transition out of plan mode
                                    setAppState(function (prev) { return (__assign(__assign({}, prev), { toolPermissionContext: (0, PermissionUpdate_js_1.applyPermissionUpdate)(prev.toolPermissionContext, {
                                            type: 'setMode',
                                            mode: (0, PermissionMode_js_1.toExternalPermissionMode)(targetMode_1),
                                            destination: 'session',
                                        }) })); });
                                    (0, debug_js_1.logForDebugging)("[InboxPoller] Plan approved by team lead, exited plan mode to ".concat(targetMode_1));
                                }
                                else {
                                    (0, debug_js_1.logForDebugging)("[InboxPoller] Plan rejected by team lead: ".concat(approvalResponse.feedback || 'No feedback provided'));
                                }
                            }
                            else if (approvalResponse) {
                                (0, debug_js_1.logForDebugging)("[InboxPoller] Ignoring plan approval response from non-team-lead: ".concat(msg.from));
                            }
                        };
                        for (_i = 0, unread_1 = unread; _i < unread_1.length; _i++) {
                            msg = unread_1[_i];
                            _loop_1(msg);
                        }
                    }
                    markRead = function () {
                        var _a;
                        void (0, teammateMailbox_js_1.markMessagesAsRead)(agentName, (_a = currentAppState.teamContext) === null || _a === void 0 ? void 0 : _a.teamName);
                    };
                    permissionRequests = [];
                    permissionResponses = [];
                    sandboxPermissionRequests = [];
                    sandboxPermissionResponses = [];
                    shutdownRequests = [];
                    shutdownApprovals = [];
                    teamPermissionUpdates = [];
                    modeSetRequests = [];
                    planApprovalRequests = [];
                    regularMessages = [];
                    for (_a = 0, unread_2 = unread; _a < unread_2.length; _a++) {
                        m = unread_2[_a];
                        permReq = (0, teammateMailbox_js_1.isPermissionRequest)(m.text);
                        permResp = (0, teammateMailbox_js_1.isPermissionResponse)(m.text);
                        sandboxReq = (0, teammateMailbox_js_1.isSandboxPermissionRequest)(m.text);
                        sandboxResp = (0, teammateMailbox_js_1.isSandboxPermissionResponse)(m.text);
                        shutdownReq = (0, teammateMailbox_js_1.isShutdownRequest)(m.text);
                        shutdownApproval = (0, teammateMailbox_js_1.isShutdownApproved)(m.text);
                        teamPermUpdate = (0, teammateMailbox_js_1.isTeamPermissionUpdate)(m.text);
                        modeSetReq = (0, teammateMailbox_js_1.isModeSetRequest)(m.text);
                        planApprovalReq = (0, teammateMailbox_js_1.isPlanApprovalRequest)(m.text);
                        if (permReq) {
                            permissionRequests.push(m);
                        }
                        else if (permResp) {
                            permissionResponses.push(m);
                        }
                        else if (sandboxReq) {
                            sandboxPermissionRequests.push(m);
                        }
                        else if (sandboxResp) {
                            sandboxPermissionResponses.push(m);
                        }
                        else if (shutdownReq) {
                            shutdownRequests.push(m);
                        }
                        else if (shutdownApproval) {
                            shutdownApprovals.push(m);
                        }
                        else if (teamPermUpdate) {
                            teamPermissionUpdates.push(m);
                        }
                        else if (modeSetReq) {
                            modeSetRequests.push(m);
                        }
                        else if (planApprovalReq) {
                            planApprovalRequests.push(m);
                        }
                        else {
                            regularMessages.push(m);
                        }
                    }
                    // Handle permission requests (leader side) - route to ToolUseConfirmQueue
                    if (permissionRequests.length > 0 &&
                        (0, teammate_js_1.isTeamLead)(currentAppState.teamContext)) {
                        (0, debug_js_1.logForDebugging)("[InboxPoller] Found ".concat(permissionRequests.length, " permission request(s)"));
                        setToolUseConfirmQueue = (0, leaderPermissionBridge_js_1.getLeaderToolUseConfirmQueue)();
                        teamName_1 = (_o = currentAppState.teamContext) === null || _o === void 0 ? void 0 : _o.teamName;
                        _loop_2 = function (m) {
                            var parsed = (0, teammateMailbox_js_1.isPermissionRequest)(m.text);
                            if (!parsed)
                                return "continue";
                            if (setToolUseConfirmQueue) {
                                // Route through the standard ToolUseConfirmQueue so tmux workers
                                // get the same tool-specific UI (BashPermissionRequest, FileEditToolDiff, etc.)
                                // as in-process teammates.
                                var tool = (0, Tool_js_1.findToolByName)((0, tools_js_1.getAllBaseTools)(), parsed.tool_name);
                                if (!tool) {
                                    (0, debug_js_1.logForDebugging)("[InboxPoller] Unknown tool ".concat(parsed.tool_name, ", skipping permission request"));
                                    return "continue";
                                }
                                var entry_1 = {
                                    assistantMessage: (0, messages_js_1.createAssistantMessage)({ content: '' }),
                                    tool: tool,
                                    description: parsed.description,
                                    input: parsed.input,
                                    toolUseContext: {},
                                    toolUseID: parsed.tool_use_id,
                                    permissionResult: {
                                        behavior: 'ask',
                                        message: parsed.description,
                                    },
                                    permissionPromptStartTimeMs: Date.now(),
                                    workerBadge: {
                                        name: parsed.agent_id,
                                        color: 'cyan',
                                    },
                                    onUserInteraction: function () {
                                        // No-op for tmux workers (no classifier auto-approval)
                                    },
                                    onAbort: function () {
                                        void (0, permissionSync_js_1.sendPermissionResponseViaMailbox)(parsed.agent_id, { decision: 'rejected', resolvedBy: 'leader' }, parsed.request_id, teamName_1);
                                    },
                                    onAllow: function (updatedInput, permissionUpdates) {
                                        void (0, permissionSync_js_1.sendPermissionResponseViaMailbox)(parsed.agent_id, {
                                            decision: 'approved',
                                            resolvedBy: 'leader',
                                            updatedInput: updatedInput,
                                            permissionUpdates: permissionUpdates,
                                        }, parsed.request_id, teamName_1);
                                    },
                                    onReject: function (feedback) {
                                        void (0, permissionSync_js_1.sendPermissionResponseViaMailbox)(parsed.agent_id, {
                                            decision: 'rejected',
                                            resolvedBy: 'leader',
                                            feedback: feedback,
                                        }, parsed.request_id, teamName_1);
                                    },
                                    recheckPermission: function () {
                                        return __awaiter(this, void 0, void 0, function () {
                                            return __generator(this, function (_a) {
                                                return [2 /*return*/];
                                            });
                                        });
                                    },
                                };
                                // Deduplicate: if markMessagesAsRead failed on a prior poll,
                                // the same message will be re-read — skip if already queued.
                                setToolUseConfirmQueue(function (queue) {
                                    if (queue.some(function (q) { return q.toolUseID === parsed.tool_use_id; })) {
                                        return queue;
                                    }
                                    return __spreadArray(__spreadArray([], queue, true), [entry_1], false);
                                });
                            }
                            else {
                                (0, debug_js_1.logForDebugging)("[InboxPoller] ToolUseConfirmQueue unavailable, dropping permission request from ".concat(parsed.agent_id));
                            }
                        };
                        for (_b = 0, permissionRequests_1 = permissionRequests; _b < permissionRequests_1.length; _b++) {
                            m = permissionRequests_1[_b];
                            _loop_2(m);
                        }
                        firstParsed = (0, teammateMailbox_js_1.isPermissionRequest)((_q = (_p = permissionRequests[0]) === null || _p === void 0 ? void 0 : _p.text) !== null && _q !== void 0 ? _q : '');
                        if (firstParsed && !isLoading && !focusedInputDialog) {
                            void (0, notifier_js_1.sendNotification)({
                                message: "".concat(firstParsed.agent_id, " needs permission for ").concat(firstParsed.tool_name),
                                notificationType: 'worker_permission_prompt',
                            }, terminal);
                        }
                    }
                    // Handle permission responses (worker side) - invoke registered callbacks
                    if (permissionResponses.length > 0 && (0, teammate_js_1.isTeammate)()) {
                        (0, debug_js_1.logForDebugging)("[InboxPoller] Found ".concat(permissionResponses.length, " permission response(s)"));
                        for (_c = 0, permissionResponses_1 = permissionResponses; _c < permissionResponses_1.length; _c++) {
                            m = permissionResponses_1[_c];
                            parsed = (0, teammateMailbox_js_1.isPermissionResponse)(m.text);
                            if (!parsed)
                                continue;
                            if ((0, useSwarmPermissionPoller_js_1.hasPermissionCallback)(parsed.request_id)) {
                                (0, debug_js_1.logForDebugging)("[InboxPoller] Processing permission response for ".concat(parsed.request_id, ": ").concat(parsed.subtype));
                                if (parsed.subtype === 'success') {
                                    (0, useSwarmPermissionPoller_js_1.processMailboxPermissionResponse)({
                                        requestId: parsed.request_id,
                                        decision: 'approved',
                                        updatedInput: (_r = parsed.response) === null || _r === void 0 ? void 0 : _r.updated_input,
                                        permissionUpdates: (_s = parsed.response) === null || _s === void 0 ? void 0 : _s.permission_updates,
                                    });
                                }
                                else {
                                    (0, useSwarmPermissionPoller_js_1.processMailboxPermissionResponse)({
                                        requestId: parsed.request_id,
                                        decision: 'rejected',
                                        feedback: parsed.error,
                                    });
                                }
                            }
                        }
                    }
                    // Handle sandbox permission requests (leader side) - add to workerSandboxPermissions queue
                    if (sandboxPermissionRequests.length > 0 &&
                        (0, teammate_js_1.isTeamLead)(currentAppState.teamContext)) {
                        (0, debug_js_1.logForDebugging)("[InboxPoller] Found ".concat(sandboxPermissionRequests.length, " sandbox permission request(s)"));
                        newSandboxRequests_1 = [];
                        for (_d = 0, sandboxPermissionRequests_1 = sandboxPermissionRequests; _d < sandboxPermissionRequests_1.length; _d++) {
                            m = sandboxPermissionRequests_1[_d];
                            parsed = (0, teammateMailbox_js_1.isSandboxPermissionRequest)(m.text);
                            if (!parsed)
                                continue;
                            // Validate required nested fields to prevent crashes from malformed messages
                            if (!((_t = parsed.hostPattern) === null || _t === void 0 ? void 0 : _t.host)) {
                                (0, debug_js_1.logForDebugging)("[InboxPoller] Invalid sandbox permission request: missing hostPattern.host");
                                continue;
                            }
                            newSandboxRequests_1.push({
                                requestId: parsed.requestId,
                                workerId: parsed.workerId,
                                workerName: parsed.workerName,
                                workerColor: parsed.workerColor,
                                host: parsed.hostPattern.host,
                                createdAt: parsed.createdAt,
                            });
                        }
                        if (newSandboxRequests_1.length > 0) {
                            setAppState(function (prev) { return (__assign(__assign({}, prev), { workerSandboxPermissions: __assign(__assign({}, prev.workerSandboxPermissions), { queue: __spreadArray(__spreadArray([], prev.workerSandboxPermissions.queue, true), newSandboxRequests_1, true) }) })); });
                            firstRequest = newSandboxRequests_1[0];
                            if (firstRequest && !isLoading && !focusedInputDialog) {
                                void (0, notifier_js_1.sendNotification)({
                                    message: "".concat(firstRequest.workerName, " needs network access to ").concat(firstRequest.host),
                                    notificationType: 'worker_permission_prompt',
                                }, terminal);
                            }
                        }
                    }
                    // Handle sandbox permission responses (worker side) - invoke registered callbacks
                    if (sandboxPermissionResponses.length > 0 && (0, teammate_js_1.isTeammate)()) {
                        (0, debug_js_1.logForDebugging)("[InboxPoller] Found ".concat(sandboxPermissionResponses.length, " sandbox permission response(s)"));
                        for (_e = 0, sandboxPermissionResponses_1 = sandboxPermissionResponses; _e < sandboxPermissionResponses_1.length; _e++) {
                            m = sandboxPermissionResponses_1[_e];
                            parsed = (0, teammateMailbox_js_1.isSandboxPermissionResponse)(m.text);
                            if (!parsed)
                                continue;
                            // Check if we have a registered callback for this request
                            if ((0, useSwarmPermissionPoller_js_1.hasSandboxPermissionCallback)(parsed.requestId)) {
                                (0, debug_js_1.logForDebugging)("[InboxPoller] Processing sandbox permission response for ".concat(parsed.requestId, ": allow=").concat(parsed.allow));
                                // Process the response using the exported function
                                (0, useSwarmPermissionPoller_js_1.processSandboxPermissionResponse)({
                                    requestId: parsed.requestId,
                                    host: parsed.host,
                                    allow: parsed.allow,
                                });
                                // Clear the pending sandbox request indicator
                                setAppState(function (prev) { return (__assign(__assign({}, prev), { pendingSandboxRequest: null })); });
                            }
                        }
                    }
                    // Handle team permission updates (teammate side) - apply permission to context
                    if (teamPermissionUpdates.length > 0 && (0, teammate_js_1.isTeammate)()) {
                        (0, debug_js_1.logForDebugging)("[InboxPoller] Found ".concat(teamPermissionUpdates.length, " team permission update(s)"));
                        _loop_3 = function (m) {
                            var parsed = (0, teammateMailbox_js_1.isTeamPermissionUpdate)(m.text);
                            if (!parsed) {
                                (0, debug_js_1.logForDebugging)("[InboxPoller] Failed to parse team permission update: ".concat(m.text.substring(0, 100)));
                                return "continue";
                            }
                            // Validate required nested fields to prevent crashes from malformed messages
                            if (!((_u = parsed.permissionUpdate) === null || _u === void 0 ? void 0 : _u.rules) ||
                                !((_v = parsed.permissionUpdate) === null || _v === void 0 ? void 0 : _v.behavior)) {
                                (0, debug_js_1.logForDebugging)("[InboxPoller] Invalid team permission update: missing permissionUpdate.rules or permissionUpdate.behavior");
                                return "continue";
                            }
                            // Apply the permission update to the teammate's context
                            (0, debug_js_1.logForDebugging)("[InboxPoller] Applying team permission update: ".concat(parsed.toolName, " allowed in ").concat(parsed.directoryPath));
                            (0, debug_js_1.logForDebugging)("[InboxPoller] Permission update rules: ".concat((0, slowOperations_js_1.jsonStringify)(parsed.permissionUpdate.rules)));
                            setAppState(function (prev) {
                                var updated = (0, PermissionUpdate_js_1.applyPermissionUpdate)(prev.toolPermissionContext, {
                                    type: 'addRules',
                                    rules: parsed.permissionUpdate.rules,
                                    behavior: parsed.permissionUpdate.behavior,
                                    destination: 'session',
                                });
                                (0, debug_js_1.logForDebugging)("[InboxPoller] Updated session allow rules: ".concat((0, slowOperations_js_1.jsonStringify)(updated.alwaysAllowRules.session)));
                                return __assign(__assign({}, prev), { toolPermissionContext: updated });
                            });
                        };
                        for (_f = 0, teamPermissionUpdates_1 = teamPermissionUpdates; _f < teamPermissionUpdates_1.length; _f++) {
                            m = teamPermissionUpdates_1[_f];
                            _loop_3(m);
                        }
                    }
                    // Handle mode set requests (teammate side) - team lead changing teammate's mode
                    if (modeSetRequests.length > 0 && (0, teammate_js_1.isTeammate)()) {
                        (0, debug_js_1.logForDebugging)("[InboxPoller] Found ".concat(modeSetRequests.length, " mode set request(s)"));
                        _loop_4 = function (m) {
                            // Only accept mode changes from team-lead
                            if (m.from !== 'team-lead') {
                                (0, debug_js_1.logForDebugging)("[InboxPoller] Ignoring mode set request from non-team-lead: ".concat(m.from));
                                return "continue";
                            }
                            var parsed = (0, teammateMailbox_js_1.isModeSetRequest)(m.text);
                            if (!parsed) {
                                (0, debug_js_1.logForDebugging)("[InboxPoller] Failed to parse mode set request: ".concat(m.text.substring(0, 100)));
                                return "continue";
                            }
                            var targetMode = (0, PermissionMode_js_1.permissionModeFromString)(parsed.mode);
                            (0, debug_js_1.logForDebugging)("[InboxPoller] Applying mode change from team-lead: ".concat(targetMode));
                            // Update local permission context
                            setAppState(function (prev) { return (__assign(__assign({}, prev), { toolPermissionContext: (0, PermissionUpdate_js_1.applyPermissionUpdate)(prev.toolPermissionContext, {
                                    type: 'setMode',
                                    mode: (0, PermissionMode_js_1.toExternalPermissionMode)(targetMode),
                                    destination: 'session',
                                }) })); });
                            // Update config.json so team lead can see the new mode
                            var teamName = (_w = currentAppState.teamContext) === null || _w === void 0 ? void 0 : _w.teamName;
                            var agentName_1 = (0, teammate_js_1.getAgentName)();
                            if (teamName && agentName_1) {
                                (0, teamHelpers_js_1.setMemberMode)(teamName, agentName_1, targetMode);
                            }
                        };
                        for (_g = 0, modeSetRequests_1 = modeSetRequests; _g < modeSetRequests_1.length; _g++) {
                            m = modeSetRequests_1[_g];
                            _loop_4(m);
                        }
                    }
                    // Handle plan approval requests (leader side) - auto-approve and write response to teammate inbox
                    if (planApprovalRequests.length > 0 &&
                        (0, teammate_js_1.isTeamLead)(currentAppState.teamContext)) {
                        (0, debug_js_1.logForDebugging)("[InboxPoller] Found ".concat(planApprovalRequests.length, " plan approval request(s), auto-approving"));
                        teamName = (_x = currentAppState.teamContext) === null || _x === void 0 ? void 0 : _x.teamName;
                        leaderExternalMode = (0, PermissionMode_js_1.toExternalPermissionMode)(currentAppState.toolPermissionContext.mode);
                        modeToInherit = leaderExternalMode === 'plan' ? 'default' : leaderExternalMode;
                        for (_h = 0, planApprovalRequests_1 = planApprovalRequests; _h < planApprovalRequests_1.length; _h++) {
                            m = planApprovalRequests_1[_h];
                            parsed = (0, teammateMailbox_js_1.isPlanApprovalRequest)(m.text);
                            if (!parsed)
                                continue;
                            approvalResponse = {
                                type: 'plan_approval_response',
                                requestId: parsed.requestId,
                                approved: true,
                                timestamp: new Date().toISOString(),
                                permissionMode: modeToInherit,
                            };
                            void (0, teammateMailbox_js_1.writeToMailbox)(m.from, {
                                from: constants_js_1.TEAM_LEAD_NAME,
                                text: (0, slowOperations_js_1.jsonStringify)(approvalResponse),
                                timestamp: new Date().toISOString(),
                            }, teamName);
                            taskId = (0, inProcessTeammateHelpers_js_1.findInProcessTeammateTaskId)(m.from, currentAppState);
                            if (taskId) {
                                (0, inProcessTeammateHelpers_js_1.handlePlanApprovalResponse)(taskId, {
                                    type: 'plan_approval_response',
                                    requestId: parsed.requestId,
                                    approved: true,
                                    timestamp: new Date().toISOString(),
                                    permissionMode: modeToInherit,
                                }, setAppState);
                            }
                            (0, debug_js_1.logForDebugging)("[InboxPoller] Auto-approved plan from ".concat(m.from, " (request ").concat(parsed.requestId, ")"));
                            // Still pass through as a regular message so the model has context
                            // about what the teammate is doing, but the approval is already sent
                            regularMessages.push(m);
                        }
                    }
                    // Handle shutdown requests (teammate side) - preserve JSON for UI rendering
                    if (shutdownRequests.length > 0 && (0, teammate_js_1.isTeammate)()) {
                        (0, debug_js_1.logForDebugging)("[InboxPoller] Found ".concat(shutdownRequests.length, " shutdown request(s)"));
                        // Pass through shutdown requests - the UI component will render them nicely
                        // and the model will receive instructions via the tool prompt documentation
                        for (_j = 0, shutdownRequests_1 = shutdownRequests; _j < shutdownRequests_1.length; _j++) {
                            m = shutdownRequests_1[_j];
                            regularMessages.push(m);
                        }
                    }
                    if (!(shutdownApprovals.length > 0 &&
                        (0, teammate_js_1.isTeamLead)(currentAppState.teamContext))) return [3 /*break*/, 5];
                    (0, debug_js_1.logForDebugging)("[InboxPoller] Found ".concat(shutdownApprovals.length, " shutdown approval(s)"));
                    _loop_5 = function (m) {
                        var parsed, teammateToRemove, teammateId_1, teamName, notificationMessage_1, _2;
                        return __generator(this, function (_3) {
                            switch (_3.label) {
                                case 0:
                                    parsed = (0, teammateMailbox_js_1.isShutdownApproved)(m.text);
                                    if (!parsed)
                                        return [2 /*return*/, "continue"];
                                    // Kill the pane if we have the info (pane-based teammates)
                                    if (parsed.paneId && parsed.backendType) {
                                        void (function () { return __awaiter(_this, void 0, void 0, function () {
                                            var insideTmux, backend, success, error_1;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        _a.trys.push([0, 4, , 5]);
                                                        // Ensure backend classes are imported (no subprocess probes)
                                                        return [4 /*yield*/, (0, registry_js_1.ensureBackendsRegistered)()];
                                                    case 1:
                                                        // Ensure backend classes are imported (no subprocess probes)
                                                        _a.sent();
                                                        return [4 /*yield*/, (0, detection_js_1.isInsideTmux)()];
                                                    case 2:
                                                        insideTmux = _a.sent();
                                                        backend = (0, registry_js_1.getBackendByType)(parsed.backendType);
                                                        return [4 /*yield*/, (backend === null || backend === void 0 ? void 0 : backend.killPane(parsed.paneId, !insideTmux))];
                                                    case 3:
                                                        success = _a.sent();
                                                        (0, debug_js_1.logForDebugging)("[InboxPoller] Killed pane ".concat(parsed.paneId, " for ").concat(parsed.from, ": ").concat(success));
                                                        return [3 /*break*/, 5];
                                                    case 4:
                                                        error_1 = _a.sent();
                                                        (0, debug_js_1.logForDebugging)("[InboxPoller] Failed to kill pane for ".concat(parsed.from, ": ").concat(error_1));
                                                        return [3 /*break*/, 5];
                                                    case 5: return [2 /*return*/];
                                                }
                                            });
                                        }); })();
                                    }
                                    teammateToRemove = parsed.from;
                                    if (!(teammateToRemove && ((_y = currentAppState.teamContext) === null || _y === void 0 ? void 0 : _y.teammates))) return [3 /*break*/, 4];
                                    teammateId_1 = (_z = Object.entries(currentAppState.teamContext.teammates).find(function (_a) {
                                        var t = _a[1];
                                        return t.name === teammateToRemove;
                                    })) === null || _z === void 0 ? void 0 : _z[0];
                                    if (!teammateId_1) return [3 /*break*/, 4];
                                    teamName = (_0 = currentAppState.teamContext) === null || _0 === void 0 ? void 0 : _0.teamName;
                                    if (teamName) {
                                        (0, teamHelpers_js_1.removeTeammateFromTeamFile)(teamName, {
                                            agentId: teammateId_1,
                                            name: teammateToRemove,
                                        });
                                    }
                                    if (!teamName) return [3 /*break*/, 2];
                                    return [4 /*yield*/, (0, tasks_js_1.unassignTeammateTasks)(teamName, teammateId_1, teammateToRemove, 'shutdown')];
                                case 1:
                                    _2 = _3.sent();
                                    return [3 /*break*/, 3];
                                case 2:
                                    _2 = { notificationMessage: "".concat(teammateToRemove, " has shut down.") };
                                    _3.label = 3;
                                case 3:
                                    notificationMessage_1 = (_2).notificationMessage;
                                    setAppState(function (prev) {
                                        var _a;
                                        if (!((_a = prev.teamContext) === null || _a === void 0 ? void 0 : _a.teammates))
                                            return prev;
                                        if (!(teammateId_1 in prev.teamContext.teammates))
                                            return prev;
                                        var _b = prev.teamContext.teammates, _c = teammateId_1, _ = _b[_c], remainingTeammates = __rest(_b, [typeof _c === "symbol" ? _c : _c + ""]);
                                        // Mark the teammate's task as completed so hasRunningTeammates
                                        // becomes false and the spinner stops. Without this, out-of-process
                                        // (tmux) teammate tasks stay status:'running' forever because
                                        // only in-process teammates have a runner that sets 'completed'.
                                        var updatedTasks = __assign({}, prev.tasks);
                                        for (var _i = 0, _d = Object.entries(updatedTasks); _i < _d.length; _i++) {
                                            var _e = _d[_i], tid = _e[0], task = _e[1];
                                            if ((0, types_js_1.isInProcessTeammateTask)(task) &&
                                                task.identity.agentId === teammateId_1) {
                                                updatedTasks[tid] = __assign(__assign({}, task), { status: 'completed', endTime: Date.now() });
                                            }
                                        }
                                        return __assign(__assign({}, prev), { tasks: updatedTasks, teamContext: __assign(__assign({}, prev.teamContext), { teammates: remainingTeammates }), inbox: {
                                                messages: __spreadArray(__spreadArray([], prev.inbox.messages, true), [
                                                    {
                                                        id: (0, crypto_1.randomUUID)(),
                                                        from: 'system',
                                                        text: (0, slowOperations_js_1.jsonStringify)({
                                                            type: 'teammate_terminated',
                                                            message: notificationMessage_1,
                                                        }),
                                                        timestamp: new Date().toISOString(),
                                                        status: 'pending',
                                                    },
                                                ], false),
                                            } });
                                    });
                                    (0, debug_js_1.logForDebugging)("[InboxPoller] Removed ".concat(teammateToRemove, " (").concat(teammateId_1, ") from teamContext"));
                                    _3.label = 4;
                                case 4:
                                    // Pass through for UI rendering - the component will render it nicely
                                    regularMessages.push(m);
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _k = 0, shutdownApprovals_1 = shutdownApprovals;
                    _1.label = 2;
                case 2:
                    if (!(_k < shutdownApprovals_1.length)) return [3 /*break*/, 5];
                    m = shutdownApprovals_1[_k];
                    return [5 /*yield**/, _loop_5(m)];
                case 3:
                    _1.sent();
                    _1.label = 4;
                case 4:
                    _k++;
                    return [3 /*break*/, 2];
                case 5:
                    // Process regular teammate messages (existing logic)
                    if (regularMessages.length === 0) {
                        // No regular messages, but we may have processed non-regular messages
                        // (permissions, shutdown requests, etc.) above — mark those as read.
                        markRead();
                        return [2 /*return*/];
                    }
                    formatted = regularMessages
                        .map(function (m) {
                        var colorAttr = m.color ? " color=\"".concat(m.color, "\"") : '';
                        var summaryAttr = m.summary ? " summary=\"".concat(m.summary, "\"") : '';
                        var messageContent = m.text;
                        return "<".concat(xml_js_1.TEAMMATE_MESSAGE_TAG, " teammate_id=\"").concat(m.from, "\"").concat(colorAttr).concat(summaryAttr, ">\n").concat(messageContent, "\n</").concat(xml_js_1.TEAMMATE_MESSAGE_TAG, ">");
                    })
                        .join('\n\n');
                    queueMessages = function () {
                        setAppState(function (prev) { return (__assign(__assign({}, prev), { inbox: {
                                messages: __spreadArray(__spreadArray([], prev.inbox.messages, true), regularMessages.map(function (m) { return ({
                                    id: (0, crypto_1.randomUUID)(),
                                    from: m.from,
                                    text: m.text,
                                    timestamp: m.timestamp,
                                    status: 'pending',
                                    color: m.color,
                                    summary: m.summary,
                                }); }), true),
                            } })); });
                    };
                    if (!isLoading && !focusedInputDialog) {
                        // IDLE: Submit as new turn immediately
                        (0, debug_js_1.logForDebugging)("[InboxPoller] Session idle, submitting immediately");
                        submitted = onSubmitTeammateMessage(formatted);
                        if (!submitted) {
                            // Submission rejected (query already running), queue for later
                            (0, debug_js_1.logForDebugging)("[InboxPoller] Submission rejected, queuing for later delivery");
                            queueMessages();
                        }
                    }
                    else {
                        // BUSY: Add to inbox queue for UI display + later delivery
                        (0, debug_js_1.logForDebugging)("[InboxPoller] Session busy, queuing for later delivery");
                        queueMessages();
                    }
                    // Mark messages as read only after they have been successfully delivered
                    // or reliably queued in AppState. This prevents permanent message loss
                    // when the session is busy — if we crash before this point, the messages
                    // will be re-read on the next poll cycle instead of being silently dropped.
                    markRead();
                    return [2 /*return*/];
            }
        });
    }); }, [
        enabled,
        isLoading,
        focusedInputDialog,
        onSubmitTeammateMessage,
        setAppState,
        terminal,
        store,
    ]);
    // When session becomes idle, deliver any pending messages and clean up processed ones
    (0, react_1.useEffect)(function () {
        if (!enabled)
            return;
        // Skip if busy or in a dialog
        if (isLoading || focusedInputDialog) {
            return;
        }
        // Use ref to avoid dependency on appState object (prevents infinite loop)
        var currentAppState = store.getState();
        var agentName = getAgentNameToPoll(currentAppState);
        if (!agentName)
            return;
        var pendingMessages = currentAppState.inbox.messages.filter(function (m) { return m.status === 'pending'; });
        var processedMessages = currentAppState.inbox.messages.filter(function (m) { return m.status === 'processed'; });
        // Clean up processed messages (they were already delivered mid-turn as attachments)
        if (processedMessages.length > 0) {
            (0, debug_js_1.logForDebugging)("[InboxPoller] Cleaning up ".concat(processedMessages.length, " processed message(s) that were delivered mid-turn"));
            var processedIds_1 = new Set(processedMessages.map(function (m) { return m.id; }));
            setAppState(function (prev) { return (__assign(__assign({}, prev), { inbox: {
                    messages: prev.inbox.messages.filter(function (m) { return !processedIds_1.has(m.id); }),
                } })); });
        }
        // No pending messages to deliver
        if (pendingMessages.length === 0)
            return;
        (0, debug_js_1.logForDebugging)("[InboxPoller] Session idle, delivering ".concat(pendingMessages.length, " pending message(s)"));
        // Format messages with XML wrapper for Claude (include color if available)
        var formatted = pendingMessages
            .map(function (m) {
            var colorAttr = m.color ? " color=\"".concat(m.color, "\"") : '';
            var summaryAttr = m.summary ? " summary=\"".concat(m.summary, "\"") : '';
            return "<".concat(xml_js_1.TEAMMATE_MESSAGE_TAG, " teammate_id=\"").concat(m.from, "\"").concat(colorAttr).concat(summaryAttr, ">\n").concat(m.text, "\n</").concat(xml_js_1.TEAMMATE_MESSAGE_TAG, ">");
        })
            .join('\n\n');
        // Try to submit - only clear messages if successful
        var submitted = onSubmitTeammateMessage(formatted);
        if (submitted) {
            // Clear the specific messages we just submitted by their IDs
            var submittedIds_1 = new Set(pendingMessages.map(function (m) { return m.id; }));
            setAppState(function (prev) { return (__assign(__assign({}, prev), { inbox: {
                    messages: prev.inbox.messages.filter(function (m) { return !submittedIds_1.has(m.id); }),
                } })); });
        }
        else {
            (0, debug_js_1.logForDebugging)("[InboxPoller] Submission rejected, keeping messages queued");
        }
    }, [
        enabled,
        isLoading,
        focusedInputDialog,
        onSubmitTeammateMessage,
        setAppState,
        inboxMessageCount,
        store,
    ]);
    // Poll if running as a teammate or as a team lead
    var shouldPoll = enabled && !!getAgentNameToPoll(store.getState());
    (0, usehooks_ts_1.useInterval)(function () { return void poll(); }, shouldPoll ? INBOX_POLL_INTERVAL_MS : null);
    // Initial poll on mount (only once)
    var hasDoneInitialPollRef = (0, react_1.useRef)(false);
    (0, react_1.useEffect)(function () {
        if (!enabled)
            return;
        if (hasDoneInitialPollRef.current)
            return;
        // Use store.getState() to avoid dependency on appState object
        if (getAgentNameToPoll(store.getState())) {
            hasDoneInitialPollRef.current = true;
            void poll();
        }
        // Note: poll uses store.getState() (not appState) so it won't re-run on appState changes
        // The ref guard is a safety measure to ensure initial poll only happens once
    }, [enabled, poll, store]);
}
