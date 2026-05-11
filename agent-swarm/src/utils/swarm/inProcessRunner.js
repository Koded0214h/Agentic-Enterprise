"use strict";
/**
 * In-process teammate runner
 *
 * Wraps runAgent() for in-process teammates, providing:
 * - AsyncLocalStorage-based context isolation via runWithTeammateContext()
 * - Progress tracking and AppState updates
 * - Idle notification to leader when complete
 * - Plan mode approval flow support
 * - Cleanup on completion or abort
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
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
exports.runInProcessTeammate = runInProcessTeammate;
exports.startInProcessTeammate = startInProcessTeammate;
var bun_bundle_1 = require("bun:bundle");
var prompts_js_1 = require("../../constants/prompts.js");
var xml_js_1 = require("../../constants/xml.js");
var useSwarmPermissionPoller_js_1 = require("../../hooks/useSwarmPermissionPoller.js");
var index_js_1 = require("../../services/analytics/index.js");
var autoCompact_js_1 = require("../../services/compact/autoCompact.js");
var compact_js_1 = require("../../services/compact/compact.js");
var microCompact_js_1 = require("../../services/compact/microCompact.js");
var InProcessTeammateTask_js_1 = require("../../tasks/InProcessTeammateTask/InProcessTeammateTask.js");
var types_js_1 = require("../../tasks/InProcessTeammateTask/types.js");
var LocalAgentTask_js_1 = require("../../tasks/LocalAgentTask/LocalAgentTask.js");
var runAgent_js_1 = require("../../tools/AgentTool/runAgent.js");
var bashPermissions_js_1 = require("../../tools/BashTool/bashPermissions.js");
var toolName_js_1 = require("../../tools/BashTool/toolName.js");
var constants_js_1 = require("../../tools/SendMessageTool/constants.js");
var constants_js_2 = require("../../tools/TaskCreateTool/constants.js");
var constants_js_3 = require("../../tools/TaskGetTool/constants.js");
var constants_js_4 = require("../../tools/TaskListTool/constants.js");
var constants_js_5 = require("../../tools/TaskUpdateTool/constants.js");
var constants_js_6 = require("../../tools/TeamCreateTool/constants.js");
var constants_js_7 = require("../../tools/TeamDeleteTool/constants.js");
var messages_js_1 = require("../../utils/messages.js");
var diskOutput_js_1 = require("../../utils/task/diskOutput.js");
var framework_js_1 = require("../../utils/task/framework.js");
var tokens_js_1 = require("../../utils/tokens.js");
var abortController_js_1 = require("../abortController.js");
var agentContext_js_1 = require("../agentContext.js");
var array_js_1 = require("../array.js");
var debug_js_1 = require("../debug.js");
var fileStateCache_js_1 = require("../fileStateCache.js");
var messages_js_2 = require("../messages.js");
var PermissionUpdate_js_1 = require("../permissions/PermissionUpdate.js");
var permissions_js_1 = require("../permissions/permissions.js");
var sdkEventQueue_js_1 = require("../sdkEventQueue.js");
var sleep_js_1 = require("../sleep.js");
var slowOperations_js_1 = require("../slowOperations.js");
var systemPromptType_js_1 = require("../systemPromptType.js");
var tasks_js_1 = require("../tasks.js");
var teammateContext_js_1 = require("../teammateContext.js");
var teammateMailbox_js_1 = require("../teammateMailbox.js");
var perfettoTracing_js_1 = require("../telemetry/perfettoTracing.js");
var toolResultStorage_js_1 = require("../toolResultStorage.js");
var constants_js_8 = require("./constants.js");
var leaderPermissionBridge_js_1 = require("./leaderPermissionBridge.js");
var permissionSync_js_1 = require("./permissionSync.js");
var teammatePromptAddendum_js_1 = require("./teammatePromptAddendum.js");
var PERMISSION_POLL_INTERVAL_MS = 500;
/**
 * Creates a canUseTool function for in-process teammates that properly resolves
 * 'ask' permissions via the UI rather than treating them as denials.
 *
 * Always uses the leader's ToolUseConfirm dialog with a worker badge when
 * the bridge is available, giving teammates the same tool-specific UI
 * (BashPermissionRequest, FileEditToolDiff, etc.) as the leader's own tools.
 *
 * Falls back to the mailbox system when the bridge is unavailable:
 * sends a permission request to the leader's inbox, waits for the response
 * in the teammate's own mailbox.
 */
function createInProcessCanUseTool(identity, abortController, onPermissionWaitMs) {
    var _this = this;
    return function (tool, input, toolUseContext, assistantMessage, toolUseID, forceDecision) { return __awaiter(_this, void 0, void 0, function () {
        var result, _a, classifierDecision, appState, description, setToolUseConfirmQueue;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(forceDecision !== null && forceDecision !== void 0)) return [3 /*break*/, 1];
                    _a = forceDecision;
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, (0, permissions_js_1.hasPermissionsToUseTool)(tool, input, toolUseContext, assistantMessage, toolUseID)];
                case 2:
                    _a = (_b.sent());
                    _b.label = 3;
                case 3:
                    result = _a;
                    // Pass through allow/deny decisions directly
                    if (result.behavior !== 'ask') {
                        return [2 /*return*/, result];
                    }
                    if (!((0, bun_bundle_1.feature)('BASH_CLASSIFIER') &&
                        tool.name === toolName_js_1.BASH_TOOL_NAME &&
                        result.pendingClassifierCheck)) return [3 /*break*/, 5];
                    return [4 /*yield*/, (0, bashPermissions_js_1.awaitClassifierAutoApproval)(result.pendingClassifierCheck, abortController.signal, toolUseContext.options.isNonInteractiveSession)];
                case 4:
                    classifierDecision = _b.sent();
                    if (classifierDecision) {
                        return [2 /*return*/, {
                                behavior: 'allow',
                                updatedInput: input,
                                decisionReason: classifierDecision,
                            }];
                    }
                    _b.label = 5;
                case 5:
                    // Check if aborted before showing UI
                    if (abortController.signal.aborted) {
                        return [2 /*return*/, { behavior: 'ask', message: messages_js_2.SUBAGENT_REJECT_MESSAGE }];
                    }
                    appState = toolUseContext.getAppState();
                    return [4 /*yield*/, tool.description(input, {
                            isNonInteractiveSession: toolUseContext.options.isNonInteractiveSession,
                            toolPermissionContext: appState.toolPermissionContext,
                            tools: toolUseContext.options.tools,
                        })];
                case 6:
                    description = _b.sent();
                    if (abortController.signal.aborted) {
                        return [2 /*return*/, { behavior: 'ask', message: messages_js_2.SUBAGENT_REJECT_MESSAGE }];
                    }
                    setToolUseConfirmQueue = (0, leaderPermissionBridge_js_1.getLeaderToolUseConfirmQueue)();
                    // Standard path: use ToolUseConfirm dialog with worker badge
                    if (setToolUseConfirmQueue) {
                        return [2 /*return*/, new Promise(function (resolve) {
                                var decisionMade = false;
                                var permissionStartMs = Date.now();
                                // Report permission wait time to the caller so it can be
                                // subtracted from the displayed elapsed time.
                                var reportPermissionWait = function () {
                                    onPermissionWaitMs === null || onPermissionWaitMs === void 0 ? void 0 : onPermissionWaitMs(Date.now() - permissionStartMs);
                                };
                                var onAbortListener = function () {
                                    if (decisionMade)
                                        return;
                                    decisionMade = true;
                                    reportPermissionWait();
                                    resolve({ behavior: 'ask', message: messages_js_2.SUBAGENT_REJECT_MESSAGE });
                                    setToolUseConfirmQueue(function (queue) {
                                        return queue.filter(function (item) { return item.toolUseID !== toolUseID; });
                                    });
                                };
                                abortController.signal.addEventListener('abort', onAbortListener, {
                                    once: true,
                                });
                                setToolUseConfirmQueue(function (queue) { return __spreadArray(__spreadArray([], queue, true), [
                                    {
                                        assistantMessage: assistantMessage,
                                        tool: tool,
                                        description: description,
                                        input: input,
                                        toolUseContext: toolUseContext,
                                        toolUseID: toolUseID,
                                        permissionResult: result,
                                        permissionPromptStartTimeMs: permissionStartMs,
                                        workerBadge: identity.color
                                            ? { name: identity.agentName, color: identity.color }
                                            : undefined,
                                        onUserInteraction: function () {
                                            // No-op for teammates (no classifier auto-approval)
                                        },
                                        onAbort: function () {
                                            if (decisionMade)
                                                return;
                                            decisionMade = true;
                                            abortController.signal.removeEventListener('abort', onAbortListener);
                                            reportPermissionWait();
                                            resolve({ behavior: 'ask', message: messages_js_2.SUBAGENT_REJECT_MESSAGE });
                                        },
                                        onAllow: function (updatedInput, permissionUpdates, feedback, contentBlocks) {
                                            return __awaiter(this, void 0, void 0, function () {
                                                var setToolPermissionContext, currentAppState, updatedContext, trimmedFeedback;
                                                return __generator(this, function (_a) {
                                                    if (decisionMade)
                                                        return [2 /*return*/];
                                                    decisionMade = true;
                                                    abortController.signal.removeEventListener('abort', onAbortListener);
                                                    reportPermissionWait();
                                                    (0, PermissionUpdate_js_1.persistPermissionUpdates)(permissionUpdates);
                                                    // Write back permission updates to the leader's shared context
                                                    if (permissionUpdates.length > 0) {
                                                        setToolPermissionContext = (0, leaderPermissionBridge_js_1.getLeaderSetToolPermissionContext)();
                                                        if (setToolPermissionContext) {
                                                            currentAppState = toolUseContext.getAppState();
                                                            updatedContext = (0, PermissionUpdate_js_1.applyPermissionUpdates)(currentAppState.toolPermissionContext, permissionUpdates);
                                                            // Preserve the leader's mode to prevent workers'
                                                            // transformed 'acceptEdits' context from leaking back
                                                            // to the coordinator
                                                            setToolPermissionContext(updatedContext, {
                                                                preserveMode: true,
                                                            });
                                                        }
                                                    }
                                                    trimmedFeedback = feedback === null || feedback === void 0 ? void 0 : feedback.trim();
                                                    resolve(__assign({ behavior: 'allow', updatedInput: updatedInput, userModified: false, acceptFeedback: trimmedFeedback || undefined }, (contentBlocks &&
                                                        contentBlocks.length > 0 && { contentBlocks: contentBlocks })));
                                                    return [2 /*return*/];
                                                });
                                            });
                                        },
                                        onReject: function (feedback, contentBlocks) {
                                            if (decisionMade)
                                                return;
                                            decisionMade = true;
                                            abortController.signal.removeEventListener('abort', onAbortListener);
                                            reportPermissionWait();
                                            var message = feedback
                                                ? "".concat(messages_js_2.SUBAGENT_REJECT_MESSAGE_WITH_REASON_PREFIX).concat(feedback)
                                                : messages_js_2.SUBAGENT_REJECT_MESSAGE;
                                            resolve({ behavior: 'ask', message: message, contentBlocks: contentBlocks });
                                        },
                                        recheckPermission: function () {
                                            return __awaiter(this, void 0, void 0, function () {
                                                var freshResult;
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0:
                                                            if (decisionMade)
                                                                return [2 /*return*/];
                                                            return [4 /*yield*/, (0, permissions_js_1.hasPermissionsToUseTool)(tool, input, toolUseContext, assistantMessage, toolUseID)];
                                                        case 1:
                                                            freshResult = _a.sent();
                                                            if (freshResult.behavior === 'allow') {
                                                                decisionMade = true;
                                                                abortController.signal.removeEventListener('abort', onAbortListener);
                                                                reportPermissionWait();
                                                                setToolUseConfirmQueue(function (queue) {
                                                                    return queue.filter(function (item) { return item.toolUseID !== toolUseID; });
                                                                });
                                                                resolve(__assign(__assign({}, freshResult), { updatedInput: input, userModified: false }));
                                                            }
                                                            return [2 /*return*/];
                                                    }
                                                });
                                            });
                                        },
                                    },
                                ], false); });
                            })];
                    }
                    // Fallback: use mailbox system when leader UI queue is unavailable
                    return [2 /*return*/, new Promise(function (resolve) {
                            var request = (0, permissionSync_js_1.createPermissionRequest)({
                                toolName: tool.name,
                                toolUseId: toolUseID,
                                input: input,
                                description: description,
                                permissionSuggestions: result.suggestions,
                                workerId: identity.agentId,
                                workerName: identity.agentName,
                                workerColor: identity.color,
                                teamName: identity.teamName,
                            });
                            // Register callback to be invoked when the leader responds
                            (0, useSwarmPermissionPoller_js_1.registerPermissionCallback)({
                                requestId: request.id,
                                toolUseId: toolUseID,
                                onAllow: function (updatedInput, permissionUpdates, _feedback, contentBlocks) {
                                    cleanup();
                                    (0, PermissionUpdate_js_1.persistPermissionUpdates)(permissionUpdates);
                                    var finalInput = updatedInput && Object.keys(updatedInput).length > 0
                                        ? updatedInput
                                        : input;
                                    resolve(__assign({ behavior: 'allow', updatedInput: finalInput, userModified: false }, (contentBlocks && contentBlocks.length > 0 && { contentBlocks: contentBlocks })));
                                },
                                onReject: function (feedback, contentBlocks) {
                                    cleanup();
                                    var message = feedback
                                        ? "".concat(messages_js_2.SUBAGENT_REJECT_MESSAGE_WITH_REASON_PREFIX).concat(feedback)
                                        : messages_js_2.SUBAGENT_REJECT_MESSAGE;
                                    resolve({ behavior: 'ask', message: message, contentBlocks: contentBlocks });
                                },
                            });
                            // Send request to leader's mailbox
                            void (0, permissionSync_js_1.sendPermissionRequestViaMailbox)(request);
                            // Poll teammate's mailbox for the response
                            var pollInterval = setInterval(function (abortController, cleanup, resolve, identity, request) { return __awaiter(_this, void 0, void 0, function () {
                                var allMessages, i, msg, parsed;
                                var _a, _b;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            if (abortController.signal.aborted) {
                                                cleanup();
                                                resolve({ behavior: 'ask', message: messages_js_2.SUBAGENT_REJECT_MESSAGE });
                                                return [2 /*return*/];
                                            }
                                            return [4 /*yield*/, (0, teammateMailbox_js_1.readMailbox)(identity.agentName, identity.teamName)];
                                        case 1:
                                            allMessages = _c.sent();
                                            i = 0;
                                            _c.label = 2;
                                        case 2:
                                            if (!(i < allMessages.length)) return [3 /*break*/, 5];
                                            msg = allMessages[i];
                                            if (!(msg && !msg.read)) return [3 /*break*/, 4];
                                            parsed = (0, teammateMailbox_js_1.isPermissionResponse)(msg.text);
                                            if (!(parsed && parsed.request_id === request.id)) return [3 /*break*/, 4];
                                            return [4 /*yield*/, (0, teammateMailbox_js_1.markMessageAsReadByIndex)(identity.agentName, identity.teamName, i)];
                                        case 3:
                                            _c.sent();
                                            if (parsed.subtype === 'success') {
                                                (0, useSwarmPermissionPoller_js_1.processMailboxPermissionResponse)({
                                                    requestId: parsed.request_id,
                                                    decision: 'approved',
                                                    updatedInput: (_a = parsed.response) === null || _a === void 0 ? void 0 : _a.updated_input,
                                                    permissionUpdates: (_b = parsed.response) === null || _b === void 0 ? void 0 : _b.permission_updates,
                                                });
                                            }
                                            else {
                                                (0, useSwarmPermissionPoller_js_1.processMailboxPermissionResponse)({
                                                    requestId: parsed.request_id,
                                                    decision: 'rejected',
                                                    feedback: parsed.error,
                                                });
                                            }
                                            return [2 /*return*/]; // Callback already resolves the promise
                                        case 4:
                                            i++;
                                            return [3 /*break*/, 2];
                                        case 5: return [2 /*return*/];
                                    }
                                });
                            }); }, PERMISSION_POLL_INTERVAL_MS, abortController, cleanup, resolve, identity, request);
                            var onAbortListener = function () {
                                cleanup();
                                resolve({ behavior: 'ask', message: messages_js_2.SUBAGENT_REJECT_MESSAGE });
                            };
                            abortController.signal.addEventListener('abort', onAbortListener, {
                                once: true,
                            });
                            function cleanup() {
                                clearInterval(pollInterval);
                                (0, useSwarmPermissionPoller_js_1.unregisterPermissionCallback)(request.id);
                                abortController.signal.removeEventListener('abort', onAbortListener);
                            }
                        })];
            }
        });
    }); };
}
/**
 * Formats a message as <teammate-message> XML for injection into the conversation.
 * This ensures the model sees messages in the same format as tmux teammates.
 */
function formatAsTeammateMessage(from, content, color, summary) {
    var colorAttr = color ? " color=\"".concat(color, "\"") : '';
    var summaryAttr = summary ? " summary=\"".concat(summary, "\"") : '';
    return "<".concat(xml_js_1.TEAMMATE_MESSAGE_TAG, " teammate_id=\"").concat(from, "\"").concat(colorAttr).concat(summaryAttr, ">\n").concat(content, "\n</").concat(xml_js_1.TEAMMATE_MESSAGE_TAG, ">");
}
/**
 * Updates task state in AppState.
 */
function updateTaskState(taskId, updater, setAppState) {
    setAppState(function (prev) {
        var _a;
        var task = prev.tasks[taskId];
        if (!task || task.type !== 'in_process_teammate') {
            return prev;
        }
        var updated = updater(task);
        if (updated === task) {
            return prev;
        }
        return __assign(__assign({}, prev), { tasks: __assign(__assign({}, prev.tasks), (_a = {}, _a[taskId] = updated, _a)) });
    });
}
/**
 * Sends a message to the leader's file-based mailbox.
 * Uses the same mailbox system as tmux teammates for consistency.
 */
function sendMessageToLeader(from, text, color, teamName) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, teammateMailbox_js_1.writeToMailbox)(constants_js_8.TEAM_LEAD_NAME, {
                        from: from,
                        text: text,
                        timestamp: new Date().toISOString(),
                        color: color,
                    }, teamName)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Sends idle notification to the leader via file-based mailbox.
 * Uses agentName (not agentId) for consistency with process-based teammates.
 */
function sendIdleNotification(agentName, agentColor, teamName, options) {
    return __awaiter(this, void 0, void 0, function () {
        var notification;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    notification = (0, teammateMailbox_js_1.createIdleNotification)(agentName, options);
                    return [4 /*yield*/, sendMessageToLeader(agentName, (0, slowOperations_js_1.jsonStringify)(notification), agentColor, teamName)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Find an available task from the team's task list.
 * A task is available if it's pending, has no owner, and is not blocked.
 */
function findAvailableTask(tasks) {
    var unresolvedTaskIds = new Set(tasks.filter(function (t) { return t.status !== 'completed'; }).map(function (t) { return t.id; }));
    return tasks.find(function (task) {
        if (task.status !== 'pending')
            return false;
        if (task.owner)
            return false;
        return task.blockedBy.every(function (id) { return !unresolvedTaskIds.has(id); });
    });
}
/**
 * Format a task as a prompt for the teammate to work on.
 */
function formatTaskAsPrompt(task) {
    var prompt = "Complete all open tasks. Start with task #".concat(task.id, ": \n\n ").concat(task.subject);
    if (task.description) {
        prompt += "\n\n".concat(task.description);
    }
    return prompt;
}
/**
 * Try to claim an available task from the team's task list.
 * Returns the formatted prompt if a task was claimed, or undefined if none available.
 */
function tryClaimNextTask(taskListId, agentName) {
    return __awaiter(this, void 0, void 0, function () {
        var tasks, availableTask, result, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, (0, tasks_js_1.listTasks)(taskListId)];
                case 1:
                    tasks = _a.sent();
                    availableTask = findAvailableTask(tasks);
                    if (!availableTask) {
                        return [2 /*return*/, undefined];
                    }
                    return [4 /*yield*/, (0, tasks_js_1.claimTask)(taskListId, availableTask.id, agentName)];
                case 2:
                    result = _a.sent();
                    if (!result.success) {
                        (0, debug_js_1.logForDebugging)("[inProcessRunner] Failed to claim task #".concat(availableTask.id, ": ").concat(result.reason));
                        return [2 /*return*/, undefined];
                    }
                    // Also set status to in_progress so the UI reflects it immediately
                    return [4 /*yield*/, (0, tasks_js_1.updateTask)(taskListId, availableTask.id, { status: 'in_progress' })];
                case 3:
                    // Also set status to in_progress so the UI reflects it immediately
                    _a.sent();
                    (0, debug_js_1.logForDebugging)("[inProcessRunner] Claimed task #".concat(availableTask.id, ": ").concat(availableTask.subject));
                    return [2 /*return*/, formatTaskAsPrompt(availableTask)];
                case 4:
                    err_1 = _a.sent();
                    (0, debug_js_1.logForDebugging)("[inProcessRunner] Error checking task list: ".concat(err_1));
                    return [2 /*return*/, undefined];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Waits for new prompts or shutdown request.
 * Polls the teammate's mailbox every 500ms, checking for:
 * - Shutdown request from leader (returned to caller for model decision)
 * - New messages/prompts from leader
 * - Abort signal
 *
 * This keeps the teammate alive in 'idle' state instead of terminating.
 * Does NOT auto-approve shutdown - the model should make that decision.
 */
function waitForNextPromptOrShutdown(identity, abortController, taskId, getAppState, setAppState, taskListId) {
    return __awaiter(this, void 0, void 0, function () {
        var POLL_INTERVAL_MS, pollCount, appState, task, message, allMessages, shutdownIndex, shutdownParsed, i, m, parsed, msg, skippedUnread, selectedIndex, i, m, msg, err_2, taskPrompt;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    POLL_INTERVAL_MS = 500;
                    (0, debug_js_1.logForDebugging)("[inProcessRunner] ".concat(identity.agentName, " starting poll loop (abort=").concat(abortController.signal.aborted, ")"));
                    pollCount = 0;
                    _a.label = 1;
                case 1:
                    if (!!abortController.signal.aborted) return [3 /*break*/, 13];
                    appState = getAppState();
                    task = appState.tasks[taskId];
                    if (task &&
                        task.type === 'in_process_teammate' &&
                        task.pendingUserMessages.length > 0) {
                        message = task.pendingUserMessages[0] // Safe: checked length > 0
                        ;
                        // Pop the message from the queue
                        setAppState(function (prev) {
                            var _a;
                            var prevTask = prev.tasks[taskId];
                            if (!prevTask || prevTask.type !== 'in_process_teammate') {
                                return prev;
                            }
                            return __assign(__assign({}, prev), { tasks: __assign(__assign({}, prev.tasks), (_a = {}, _a[taskId] = __assign(__assign({}, prevTask), { pendingUserMessages: prevTask.pendingUserMessages.slice(1) }), _a)) });
                        });
                        (0, debug_js_1.logForDebugging)("[inProcessRunner] ".concat(identity.agentName, " found pending user message (poll #").concat(pollCount, ")"));
                        return [2 /*return*/, {
                                type: 'new_message',
                                message: message,
                                from: 'user',
                            }];
                    }
                    if (!(pollCount > 0)) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, sleep_js_1.sleep)(POLL_INTERVAL_MS)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    pollCount++;
                    // Check for abort
                    if (abortController.signal.aborted) {
                        (0, debug_js_1.logForDebugging)("[inProcessRunner] ".concat(identity.agentName, " aborted while waiting (poll #").concat(pollCount, ")"));
                        return [2 /*return*/, { type: 'aborted' }];
                    }
                    // Check for messages in mailbox
                    (0, debug_js_1.logForDebugging)("[inProcessRunner] ".concat(identity.agentName, " poll #").concat(pollCount, ": checking mailbox"));
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 10, , 11]);
                    return [4 /*yield*/, (0, teammateMailbox_js_1.readMailbox)(identity.agentName, identity.teamName)
                        // Scan all unread messages for shutdown requests (highest priority).
                        // readMailbox() already reads all messages from disk, so this scan
                        // adds only ~1-2ms of JSON parsing overhead.
                    ];
                case 5:
                    allMessages = _a.sent();
                    shutdownIndex = -1;
                    shutdownParsed = null;
                    for (i = 0; i < allMessages.length; i++) {
                        m = allMessages[i];
                        if (m && !m.read) {
                            parsed = (0, teammateMailbox_js_1.isShutdownRequest)(m.text);
                            if (parsed) {
                                shutdownIndex = i;
                                shutdownParsed = parsed;
                                break;
                            }
                        }
                    }
                    if (!(shutdownIndex !== -1)) return [3 /*break*/, 7];
                    msg = allMessages[shutdownIndex];
                    skippedUnread = (0, array_js_1.count)(allMessages.slice(0, shutdownIndex), function (m) { return !m.read; });
                    (0, debug_js_1.logForDebugging)("[inProcessRunner] ".concat(identity.agentName, " received shutdown request from ").concat(shutdownParsed === null || shutdownParsed === void 0 ? void 0 : shutdownParsed.from, " (prioritized over ").concat(skippedUnread, " unread messages)"));
                    return [4 /*yield*/, (0, teammateMailbox_js_1.markMessageAsReadByIndex)(identity.agentName, identity.teamName, shutdownIndex)];
                case 6:
                    _a.sent();
                    return [2 /*return*/, {
                            type: 'shutdown_request',
                            request: shutdownParsed,
                            originalMessage: msg.text,
                        }];
                case 7:
                    selectedIndex = -1;
                    // Check for unread team-lead messages first
                    for (i = 0; i < allMessages.length; i++) {
                        m = allMessages[i];
                        if (m && !m.read && m.from === constants_js_8.TEAM_LEAD_NAME) {
                            selectedIndex = i;
                            break;
                        }
                    }
                    // Fall back to first unread message (any sender)
                    if (selectedIndex === -1) {
                        selectedIndex = allMessages.findIndex(function (m) { return !m.read; });
                    }
                    if (!(selectedIndex !== -1)) return [3 /*break*/, 9];
                    msg = allMessages[selectedIndex];
                    if (!msg) return [3 /*break*/, 9];
                    (0, debug_js_1.logForDebugging)("[inProcessRunner] ".concat(identity.agentName, " received new message from ").concat(msg.from, " (index ").concat(selectedIndex, ")"));
                    return [4 /*yield*/, (0, teammateMailbox_js_1.markMessageAsReadByIndex)(identity.agentName, identity.teamName, selectedIndex)];
                case 8:
                    _a.sent();
                    return [2 /*return*/, {
                            type: 'new_message',
                            message: msg.text,
                            from: msg.from,
                            color: msg.color,
                            summary: msg.summary,
                        }];
                case 9: return [3 /*break*/, 11];
                case 10:
                    err_2 = _a.sent();
                    (0, debug_js_1.logForDebugging)("[inProcessRunner] ".concat(identity.agentName, " poll error: ").concat(err_2));
                    return [3 /*break*/, 11];
                case 11: return [4 /*yield*/, tryClaimNextTask(taskListId, identity.agentName)];
                case 12:
                    taskPrompt = _a.sent();
                    if (taskPrompt) {
                        return [2 /*return*/, {
                                type: 'new_message',
                                message: taskPrompt,
                                from: 'task-list',
                            }];
                    }
                    return [3 /*break*/, 1];
                case 13:
                    (0, debug_js_1.logForDebugging)("[inProcessRunner] ".concat(identity.agentName, " exiting poll loop (abort=").concat(abortController.signal.aborted, ", polls=").concat(pollCount, ")"));
                    return [2 /*return*/, { type: 'aborted' }];
            }
        });
    });
}
/**
 * Runs an in-process teammate with a continuous prompt loop.
 *
 * Executes runAgent() within the teammate's AsyncLocalStorage context,
 * tracks progress, updates task state, sends idle notification on completion,
 * then waits for new prompts or shutdown requests.
 *
 * Unlike background tasks, teammates stay alive and can receive multiple prompts.
 * The loop only exits on abort or after shutdown is approved by the model.
 *
 * @param config - Runner configuration
 * @returns Result with messages and success status
 */
function runInProcessTeammate(config) {
    return __awaiter(this, void 0, void 0, function () {
        var identity, taskId, prompt, description, agentDefinition, teammateContext, toolUseContext, abortController, model, systemPrompt, systemPromptMode, allowedTools, allowPermissionPrompts, invokingRequestId, setAppState, agentContext, teammateSystemPrompt, fullSystemPromptParts, systemPromptParts, customPrompt, resolvedAgentDefinition, allMessages, wrappedInitialPrompt, currentPrompt, shouldExit, teammateReplacementState_1, _loop_1, state_1, alreadyTerminal_1, toolUseId_1, error_1, errorMessage_1, alreadyTerminal_2, toolUseId_2;
        var _this = this;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    identity = config.identity, taskId = config.taskId, prompt = config.prompt, description = config.description, agentDefinition = config.agentDefinition, teammateContext = config.teammateContext, toolUseContext = config.toolUseContext, abortController = config.abortController, model = config.model, systemPrompt = config.systemPrompt, systemPromptMode = config.systemPromptMode, allowedTools = config.allowedTools, allowPermissionPrompts = config.allowPermissionPrompts, invokingRequestId = config.invokingRequestId;
                    setAppState = toolUseContext.setAppState;
                    (0, debug_js_1.logForDebugging)("[inProcessRunner] Starting agent loop for ".concat(identity.agentId));
                    agentContext = {
                        agentId: identity.agentId,
                        parentSessionId: identity.parentSessionId,
                        agentName: identity.agentName,
                        teamName: identity.teamName,
                        agentColor: identity.color,
                        planModeRequired: identity.planModeRequired,
                        isTeamLead: false,
                        agentType: 'teammate',
                        invokingRequestId: invokingRequestId,
                        invocationKind: 'spawn',
                        invocationEmitted: false,
                    };
                    if (!(systemPromptMode === 'replace' && systemPrompt)) return [3 /*break*/, 1];
                    teammateSystemPrompt = systemPrompt;
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, (0, prompts_js_1.getSystemPrompt)(toolUseContext.options.tools, toolUseContext.options.mainLoopModel, undefined, toolUseContext.options.mcpClients)];
                case 2:
                    fullSystemPromptParts = _b.sent();
                    systemPromptParts = __spreadArray(__spreadArray([], fullSystemPromptParts, true), [
                        teammatePromptAddendum_js_1.TEAMMATE_SYSTEM_PROMPT_ADDENDUM,
                    ], false);
                    // If custom agent definition provided, append its prompt
                    if (agentDefinition) {
                        customPrompt = agentDefinition.getSystemPrompt();
                        if (customPrompt) {
                            systemPromptParts.push("\n# Custom Agent Instructions\n".concat(customPrompt));
                        }
                        // Log agent memory loaded event for in-process teammates
                        if (agentDefinition.memory) {
                            (0, index_js_1.logEvent)('tengu_agent_memory_loaded', __assign(__assign({}, (process.env.USER_TYPE === 'ant'
                                ? {
                                    agent_type: agentDefinition.agentType,
                                }
                                : {})), { scope: agentDefinition.memory, source: 'in-process-teammate' }));
                        }
                    }
                    // Append mode: add provided system prompt after default
                    if (systemPromptMode === 'append' && systemPrompt) {
                        systemPromptParts.push(systemPrompt);
                    }
                    teammateSystemPrompt = systemPromptParts.join('\n');
                    _b.label = 3;
                case 3:
                    resolvedAgentDefinition = __assign({ agentType: identity.agentName, whenToUse: "In-process teammate: ".concat(identity.agentName), getSystemPrompt: function () { return teammateSystemPrompt; }, 
                        // Inject team-essential tools so teammates can always respond to
                        // shutdown requests, send messages, and coordinate via the task list,
                        // even with explicit tool lists
                        tools: (agentDefinition === null || agentDefinition === void 0 ? void 0 : agentDefinition.tools)
                            ? __spreadArray([], new Set(__spreadArray(__spreadArray([], agentDefinition.tools, true), [
                                constants_js_1.SEND_MESSAGE_TOOL_NAME,
                                constants_js_6.TEAM_CREATE_TOOL_NAME,
                                constants_js_7.TEAM_DELETE_TOOL_NAME,
                                constants_js_2.TASK_CREATE_TOOL_NAME,
                                constants_js_3.TASK_GET_TOOL_NAME,
                                constants_js_4.TASK_LIST_TOOL_NAME,
                                constants_js_5.TASK_UPDATE_TOOL_NAME,
                            ], false)), true) : ['*'], source: 'projectSettings', permissionMode: 'default' }, ((agentDefinition === null || agentDefinition === void 0 ? void 0 : agentDefinition.model) ? { model: agentDefinition.model } : {}));
                    allMessages = [];
                    wrappedInitialPrompt = formatAsTeammateMessage('team-lead', prompt, undefined, description);
                    currentPrompt = wrappedInitialPrompt;
                    shouldExit = false;
                    // Try to claim an available task immediately so the UI can show activity
                    // from the very start. The idle loop handles claiming for subsequent tasks.
                    // Use parentSessionId as the task list ID since the leader creates tasks
                    // under its session ID, not the team name.
                    return [4 /*yield*/, tryClaimNextTask(identity.parentSessionId, identity.agentName)];
                case 4:
                    // Try to claim an available task immediately so the UI can show activity
                    // from the very start. The idle loop handles claiming for subsequent tasks.
                    // Use parentSessionId as the task list ID since the leader creates tasks
                    // under its session ID, not the team name.
                    _b.sent();
                    _b.label = 5;
                case 5:
                    _b.trys.push([5, 9, , 11]);
                    // Add initial prompt to task.messages for display (wrapped with XML)
                    updateTaskState(taskId, function (task) { return (__assign(__assign({}, task), { messages: (0, types_js_1.appendCappedMessage)(task.messages, (0, messages_js_1.createUserMessage)({ content: wrappedInitialPrompt })) })); }, setAppState);
                    teammateReplacementState_1 = toolUseContext.contentReplacementState
                        ? (0, toolResultStorage_js_1.createContentReplacementState)()
                        : undefined;
                    _loop_1 = function () {
                        var currentWorkAbortController, userMessage, promptMessages, contextMessages, tokenCount, isolatedContext, compactedSummary, forkContextMessages, tracker, resolveActivity, iterationMessages, currentAppState, currentTask, currentPermissionMode, iterationAgentDefinition, workWasAborted, interruptMessage_1, prevAppState, prevTask, wasAlreadyIdle, waitResult;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    (0, debug_js_1.logForDebugging)("[inProcessRunner] ".concat(identity.agentId, " processing prompt: ").concat(currentPrompt.substring(0, 50), "..."));
                                    currentWorkAbortController = (0, abortController_js_1.createAbortController)();
                                    // Store the work controller in task state so UI can abort it
                                    updateTaskState(taskId, function (task) { return (__assign(__assign({}, task), { currentWorkAbortController: currentWorkAbortController })); }, setAppState);
                                    userMessage = (0, messages_js_1.createUserMessage)({ content: currentPrompt });
                                    promptMessages = [userMessage];
                                    contextMessages = allMessages;
                                    tokenCount = (0, tokens_js_1.tokenCountWithEstimation)(allMessages);
                                    if (!(tokenCount >
                                        (0, autoCompact_js_1.getAutoCompactThreshold)(toolUseContext.options.mainLoopModel))) return [3 /*break*/, 2];
                                    (0, debug_js_1.logForDebugging)("[inProcessRunner] ".concat(identity.agentId, " compacting history (").concat(tokenCount, " tokens)"));
                                    isolatedContext = __assign(__assign({}, toolUseContext), { readFileState: (0, fileStateCache_js_1.cloneFileStateCache)(toolUseContext.readFileState), onCompactProgress: undefined, setStreamMode: undefined });
                                    return [4 /*yield*/, (0, compact_js_1.compactConversation)(allMessages, isolatedContext, {
                                            systemPrompt: (0, systemPromptType_js_1.asSystemPrompt)([]),
                                            userContext: {},
                                            systemContext: {},
                                            toolUseContext: isolatedContext,
                                            forkContextMessages: [],
                                        }, true, // suppressFollowUpQuestions
                                        undefined, // customInstructions
                                        true)];
                                case 1:
                                    compactedSummary = _c.sent();
                                    contextMessages = (0, compact_js_1.buildPostCompactMessages)(compactedSummary);
                                    // Reset microcompact state since full compact replaces all
                                    // messages — old tool IDs are no longer relevant
                                    (0, microCompact_js_1.resetMicrocompactState)();
                                    // Reset content replacement state — compact replaces all messages
                                    // so old tool_use_ids are gone. Stale Map entries are harmless
                                    // (UUID keys never match) but accumulate memory over long runs.
                                    if (teammateReplacementState_1) {
                                        teammateReplacementState_1 = (0, toolResultStorage_js_1.createContentReplacementState)();
                                    }
                                    // Update allMessages in place with compacted version
                                    allMessages.length = 0;
                                    allMessages.push.apply(allMessages, contextMessages);
                                    // Mirror compaction into task.messages — otherwise the AppState
                                    // mirror grows unbounded (500 turns = 500+ messages, 10-50MB).
                                    // Replace with the compacted messages, matching allMessages.
                                    updateTaskState(taskId, function (task) { return (__assign(__assign({}, task), { messages: __spreadArray(__spreadArray([], contextMessages, true), [userMessage], false) })); }, setAppState);
                                    _c.label = 2;
                                case 2:
                                    forkContextMessages = contextMessages.length > 0 ? __spreadArray([], contextMessages, true) : undefined;
                                    // Add the user message to allMessages so it's included in future context
                                    // This ensures the full conversation (user + assistant turns) is preserved
                                    allMessages.push(userMessage);
                                    tracker = (0, LocalAgentTask_js_1.createProgressTracker)();
                                    resolveActivity = (0, LocalAgentTask_js_1.createActivityDescriptionResolver)(toolUseContext.options.tools);
                                    iterationMessages = [];
                                    currentAppState = toolUseContext.getAppState();
                                    currentTask = currentAppState.tasks[taskId];
                                    currentPermissionMode = currentTask && currentTask.type === 'in_process_teammate'
                                        ? currentTask.permissionMode
                                        : 'default';
                                    iterationAgentDefinition = __assign(__assign({}, resolvedAgentDefinition), { permissionMode: currentPermissionMode });
                                    workWasAborted = false;
                                    // Run agent within contexts
                                    return [4 /*yield*/, (0, teammateContext_js_1.runWithTeammateContext)(teammateContext, function () { return __awaiter(_this, void 0, void 0, function () {
                                            var _this = this;
                                            return __generator(this, function (_a) {
                                                return [2 /*return*/, (0, agentContext_js_1.runWithAgentContext)(agentContext, function () { return __awaiter(_this, void 0, void 0, function () {
                                                        var _loop_2, _a, _b, _c, state_2, e_1_1;
                                                        var _d, e_1, _e, _f;
                                                        return __generator(this, function (_g) {
                                                            switch (_g.label) {
                                                                case 0:
                                                                    // Mark task as running (not idle)
                                                                    updateTaskState(taskId, function (task) { return (__assign(__assign({}, task), { status: 'running', isIdle: false })); }, setAppState);
                                                                    _g.label = 1;
                                                                case 1:
                                                                    _g.trys.push([1, 6, 7, 12]);
                                                                    _loop_2 = function () {
                                                                        _f = _c.value;
                                                                        _a = false;
                                                                        var message = _f;
                                                                        // Check lifecycle abort first (kills whole teammate)
                                                                        if (abortController.signal.aborted) {
                                                                            (0, debug_js_1.logForDebugging)("[inProcessRunner] ".concat(identity.agentId, " lifecycle aborted"));
                                                                            return "break";
                                                                        }
                                                                        // Check work abort (stops current turn only)
                                                                        if (currentWorkAbortController.signal.aborted) {
                                                                            (0, debug_js_1.logForDebugging)("[inProcessRunner] ".concat(identity.agentId, " current work aborted (Escape pressed)"));
                                                                            workWasAborted = true;
                                                                            return "break";
                                                                        }
                                                                        iterationMessages.push(message);
                                                                        allMessages.push(message);
                                                                        (0, LocalAgentTask_js_1.updateProgressFromMessage)(tracker, message, resolveActivity, toolUseContext.options.tools);
                                                                        var progress = (0, LocalAgentTask_js_1.getProgressUpdate)(tracker);
                                                                        updateTaskState(taskId, function (task) {
                                                                            // Track in-progress tool use IDs for animation in transcript view
                                                                            var inProgressToolUseIDs = task.inProgressToolUseIDs;
                                                                            if (message.type === 'assistant') {
                                                                                for (var _i = 0, _a = message.message.content; _i < _a.length; _i++) {
                                                                                    var block = _a[_i];
                                                                                    if (block.type === 'tool_use') {
                                                                                        inProgressToolUseIDs = new Set(__spreadArray(__spreadArray([], (inProgressToolUseIDs !== null && inProgressToolUseIDs !== void 0 ? inProgressToolUseIDs : []), true), [
                                                                                            block.id,
                                                                                        ], false));
                                                                                    }
                                                                                }
                                                                            }
                                                                            else if (message.type === 'user') {
                                                                                var content = message.message.content;
                                                                                if (Array.isArray(content)) {
                                                                                    for (var _b = 0, content_1 = content; _b < content_1.length; _b++) {
                                                                                        var block = content_1[_b];
                                                                                        if (typeof block === 'object' &&
                                                                                            'type' in block &&
                                                                                            block.type === 'tool_result') {
                                                                                            if (inProgressToolUseIDs) {
                                                                                                inProgressToolUseIDs = new Set(inProgressToolUseIDs);
                                                                                                inProgressToolUseIDs.delete(block.tool_use_id);
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                            return __assign(__assign({}, task), { progress: progress, messages: (0, types_js_1.appendCappedMessage)(task.messages, message), inProgressToolUseIDs: inProgressToolUseIDs });
                                                                        }, setAppState);
                                                                    };
                                                                    _a = true, _b = __asyncValues((0, runAgent_js_1.runAgent)({
                                                                        agentDefinition: iterationAgentDefinition,
                                                                        promptMessages: promptMessages,
                                                                        toolUseContext: toolUseContext,
                                                                        canUseTool: createInProcessCanUseTool(identity, currentWorkAbortController, function (waitMs) {
                                                                            updateTaskState(taskId, function (task) {
                                                                                var _a;
                                                                                return (__assign(__assign({}, task), { totalPausedMs: ((_a = task.totalPausedMs) !== null && _a !== void 0 ? _a : 0) + waitMs }));
                                                                            }, setAppState);
                                                                        }),
                                                                        isAsync: true,
                                                                        canShowPermissionPrompts: allowPermissionPrompts !== null && allowPermissionPrompts !== void 0 ? allowPermissionPrompts : true,
                                                                        forkContextMessages: forkContextMessages,
                                                                        querySource: 'agent:custom',
                                                                        override: { abortController: currentWorkAbortController },
                                                                        model: model,
                                                                        preserveToolUseResults: true,
                                                                        availableTools: toolUseContext.options.tools,
                                                                        allowedTools: allowedTools,
                                                                        contentReplacementState: teammateReplacementState_1,
                                                                    }));
                                                                    _g.label = 2;
                                                                case 2: return [4 /*yield*/, _b.next()];
                                                                case 3:
                                                                    if (!(_c = _g.sent(), _d = _c.done, !_d)) return [3 /*break*/, 5];
                                                                    state_2 = _loop_2();
                                                                    if (state_2 === "break")
                                                                        return [3 /*break*/, 5];
                                                                    _g.label = 4;
                                                                case 4:
                                                                    _a = true;
                                                                    return [3 /*break*/, 2];
                                                                case 5: return [3 /*break*/, 12];
                                                                case 6:
                                                                    e_1_1 = _g.sent();
                                                                    e_1 = { error: e_1_1 };
                                                                    return [3 /*break*/, 12];
                                                                case 7:
                                                                    _g.trys.push([7, , 10, 11]);
                                                                    if (!(!_a && !_d && (_e = _b.return))) return [3 /*break*/, 9];
                                                                    return [4 /*yield*/, _e.call(_b)];
                                                                case 8:
                                                                    _g.sent();
                                                                    _g.label = 9;
                                                                case 9: return [3 /*break*/, 11];
                                                                case 10:
                                                                    if (e_1) throw e_1.error;
                                                                    return [7 /*endfinally*/];
                                                                case 11: return [7 /*endfinally*/];
                                                                case 12: return [2 /*return*/, { success: true, messages: iterationMessages }];
                                                            }
                                                        });
                                                    }); })];
                                            });
                                        }); })
                                        // Clear the work controller from state (it's no longer valid)
                                    ];
                                case 3:
                                    // Run agent within contexts
                                    _c.sent();
                                    // Clear the work controller from state (it's no longer valid)
                                    updateTaskState(taskId, function (task) { return (__assign(__assign({}, task), { currentWorkAbortController: undefined })); }, setAppState);
                                    // Check if lifecycle aborted during agent run (kills whole teammate)
                                    if (abortController.signal.aborted) {
                                        return [2 /*return*/, "break"];
                                    }
                                    // If work was aborted (Escape), log it and add interrupt message, then continue to idle state
                                    if (workWasAborted) {
                                        (0, debug_js_1.logForDebugging)("[inProcessRunner] ".concat(identity.agentId, " work interrupted, returning to idle"));
                                        interruptMessage_1 = (0, messages_js_1.createAssistantAPIErrorMessage)({
                                            content: compact_js_1.ERROR_MESSAGE_USER_ABORT,
                                        });
                                        updateTaskState(taskId, function (task) { return (__assign(__assign({}, task), { messages: (0, types_js_1.appendCappedMessage)(task.messages, interruptMessage_1) })); }, setAppState);
                                    }
                                    prevAppState = toolUseContext.getAppState();
                                    prevTask = prevAppState.tasks[taskId];
                                    wasAlreadyIdle = (prevTask === null || prevTask === void 0 ? void 0 : prevTask.type) === 'in_process_teammate' && prevTask.isIdle;
                                    // Mark task as idle (NOT completed) and notify any waiters
                                    updateTaskState(taskId, function (task) {
                                        var _a;
                                        // Call any registered idle callbacks
                                        (_a = task.onIdleCallbacks) === null || _a === void 0 ? void 0 : _a.forEach(function (cb) { return cb(); });
                                        return __assign(__assign({}, task), { isIdle: true, onIdleCallbacks: [] });
                                    }, setAppState);
                                    if (!!wasAlreadyIdle) return [3 /*break*/, 5];
                                    return [4 /*yield*/, sendIdleNotification(identity.agentName, identity.color, identity.teamName, {
                                            idleReason: workWasAborted ? 'interrupted' : 'available',
                                            summary: (0, teammateMailbox_js_1.getLastPeerDmSummary)(allMessages),
                                        })];
                                case 4:
                                    _c.sent();
                                    return [3 /*break*/, 6];
                                case 5:
                                    (0, debug_js_1.logForDebugging)("[inProcessRunner] Skipping duplicate idle notification for ".concat(identity.agentName));
                                    _c.label = 6;
                                case 6:
                                    (0, debug_js_1.logForDebugging)("[inProcessRunner] ".concat(identity.agentId, " finished prompt, waiting for next"));
                                    return [4 /*yield*/, waitForNextPromptOrShutdown(identity, abortController, taskId, toolUseContext.getAppState, setAppState, identity.parentSessionId)];
                                case 7:
                                    waitResult = _c.sent();
                                    switch (waitResult.type) {
                                        case 'shutdown_request':
                                            // Pass shutdown request to model for decision
                                            // Format as teammate-message for consistency with how tmux teammates receive it
                                            // The model will use approveShutdown or rejectShutdown tool
                                            (0, debug_js_1.logForDebugging)("[inProcessRunner] ".concat(identity.agentId, " received shutdown request - passing to model"));
                                            currentPrompt = formatAsTeammateMessage(((_a = waitResult.request) === null || _a === void 0 ? void 0 : _a.from) || 'team-lead', waitResult.originalMessage);
                                            // Add shutdown request to task.messages for transcript display
                                            (0, InProcessTeammateTask_js_1.appendTeammateMessage)(taskId, (0, messages_js_1.createUserMessage)({ content: currentPrompt }), setAppState);
                                            break;
                                        case 'new_message':
                                            // New prompt from leader or teammate
                                            (0, debug_js_1.logForDebugging)("[inProcessRunner] ".concat(identity.agentId, " received new message from ").concat(waitResult.from));
                                            // Messages from the user should be plain text (not wrapped in XML)
                                            // Messages from other teammates get XML wrapper for identification
                                            if (waitResult.from === 'user') {
                                                currentPrompt = waitResult.message;
                                            }
                                            else {
                                                currentPrompt = formatAsTeammateMessage(waitResult.from, waitResult.message, waitResult.color, waitResult.summary);
                                                // Add to task.messages for transcript display (only for non-user messages)
                                                // Messages from 'user' come from pendingUserMessages which are already
                                                // added by injectUserMessageToTeammate
                                                (0, InProcessTeammateTask_js_1.appendTeammateMessage)(taskId, (0, messages_js_1.createUserMessage)({ content: currentPrompt }), setAppState);
                                            }
                                            break;
                                        case 'aborted':
                                            (0, debug_js_1.logForDebugging)("[inProcessRunner] ".concat(identity.agentId, " aborted while waiting"));
                                            shouldExit = true;
                                            break;
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _b.label = 6;
                case 6:
                    if (!(!abortController.signal.aborted && !shouldExit)) return [3 /*break*/, 8];
                    return [5 /*yield**/, _loop_1()];
                case 7:
                    state_1 = _b.sent();
                    if (state_1 === "break")
                        return [3 /*break*/, 8];
                    return [3 /*break*/, 6];
                case 8:
                    alreadyTerminal_1 = false;
                    updateTaskState(taskId, function (task) {
                        var _a, _b, _c;
                        // killInProcessTeammate may have already set status:killed +
                        // notified:true + cleared fields. Don't overwrite (would flip
                        // killed → completed and double-emit the SDK bookend).
                        if (task.status !== 'running') {
                            alreadyTerminal_1 = true;
                            return task;
                        }
                        toolUseId_1 = task.toolUseId;
                        (_a = task.onIdleCallbacks) === null || _a === void 0 ? void 0 : _a.forEach(function (cb) { return cb(); });
                        (_b = task.unregisterCleanup) === null || _b === void 0 ? void 0 : _b.call(task);
                        return __assign(__assign({}, task), { status: 'completed', notified: true, endTime: Date.now(), messages: ((_c = task.messages) === null || _c === void 0 ? void 0 : _c.length) ? [task.messages.at(-1)] : undefined, pendingUserMessages: [], inProgressToolUseIDs: undefined, abortController: undefined, unregisterCleanup: undefined, currentWorkAbortController: undefined, onIdleCallbacks: [] });
                    }, setAppState);
                    void (0, diskOutput_js_1.evictTaskOutput)(taskId);
                    // Eagerly evict task from AppState since it's been consumed
                    (0, framework_js_1.evictTerminalTask)(taskId, setAppState);
                    // notified:true pre-set → no XML notification → print.ts won't emit
                    // the SDK task_notification. Close the task_started bookend directly.
                    if (!alreadyTerminal_1) {
                        (0, sdkEventQueue_js_1.emitTaskTerminatedSdk)(taskId, 'completed', {
                            toolUseId: toolUseId_1,
                            summary: identity.agentId,
                        });
                    }
                    (0, perfettoTracing_js_1.unregisterAgent)(identity.agentId);
                    return [2 /*return*/, { success: true, messages: allMessages }];
                case 9:
                    error_1 = _b.sent();
                    errorMessage_1 = error_1 instanceof Error ? error_1.message : 'Unknown error';
                    (0, debug_js_1.logForDebugging)("[inProcessRunner] Agent ".concat(identity.agentId, " failed: ").concat(errorMessage_1));
                    alreadyTerminal_2 = false;
                    updateTaskState(taskId, function (task) {
                        var _a, _b, _c;
                        if (task.status !== 'running') {
                            alreadyTerminal_2 = true;
                            return task;
                        }
                        toolUseId_2 = task.toolUseId;
                        (_a = task.onIdleCallbacks) === null || _a === void 0 ? void 0 : _a.forEach(function (cb) { return cb(); });
                        (_b = task.unregisterCleanup) === null || _b === void 0 ? void 0 : _b.call(task);
                        return __assign(__assign({}, task), { status: 'failed', notified: true, error: errorMessage_1, isIdle: true, endTime: Date.now(), onIdleCallbacks: [], messages: ((_c = task.messages) === null || _c === void 0 ? void 0 : _c.length) ? [task.messages.at(-1)] : undefined, pendingUserMessages: [], inProgressToolUseIDs: undefined, abortController: undefined, unregisterCleanup: undefined, currentWorkAbortController: undefined });
                    }, setAppState);
                    void (0, diskOutput_js_1.evictTaskOutput)(taskId);
                    // Eagerly evict task from AppState since it's been consumed
                    (0, framework_js_1.evictTerminalTask)(taskId, setAppState);
                    // notified:true pre-set → no XML notification → close SDK bookend directly.
                    if (!alreadyTerminal_2) {
                        (0, sdkEventQueue_js_1.emitTaskTerminatedSdk)(taskId, 'failed', {
                            toolUseId: toolUseId_2,
                            summary: identity.agentId,
                        });
                    }
                    // Send idle notification with failure via file-based mailbox
                    return [4 /*yield*/, sendIdleNotification(identity.agentName, identity.color, identity.teamName, {
                            idleReason: 'failed',
                            completedStatus: 'failed',
                            failureReason: errorMessage_1,
                        })];
                case 10:
                    // Send idle notification with failure via file-based mailbox
                    _b.sent();
                    (0, perfettoTracing_js_1.unregisterAgent)(identity.agentId);
                    return [2 /*return*/, {
                            success: false,
                            error: errorMessage_1,
                            messages: allMessages,
                        }];
                case 11: return [2 /*return*/];
            }
        });
    });
}
/**
 * Starts an in-process teammate in the background.
 *
 * This is the main entry point called after spawn. It starts the agent
 * execution loop in a fire-and-forget manner.
 *
 * @param config - Runner configuration
 */
function startInProcessTeammate(config) {
    // Extract agentId before the closure so the catch handler doesn't retain
    // the full config object (including toolUseContext) while the promise is
    // pending - which can be hours for a long-running teammate.
    var agentId = config.identity.agentId;
    void runInProcessTeammate(config).catch(function (error) {
        (0, debug_js_1.logForDebugging)("[inProcessRunner] Unhandled error in ".concat(agentId, ": ").concat(error));
    });
}
