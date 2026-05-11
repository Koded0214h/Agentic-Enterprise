"use strict";
/**
 * LocalMainSessionTask - Handles backgrounding the main session query.
 *
 * When user presses Ctrl+B twice during a query, the session is "backgrounded":
 * - The query continues running in the background
 * - The UI clears to a fresh prompt
 * - A notification is sent when the query completes
 *
 * This reuses the LocalAgentTask state structure since the behavior is similar.
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
exports.registerMainSessionTask = registerMainSessionTask;
exports.completeMainSessionTask = completeMainSessionTask;
exports.foregroundMainSessionTask = foregroundMainSessionTask;
exports.isMainSessionTask = isMainSessionTask;
exports.startBackgroundSession = startBackgroundSession;
var crypto_1 = require("crypto");
var xml_js_1 = require("../constants/xml.js");
var query_js_1 = require("../query.js");
var tokenEstimation_js_1 = require("../services/tokenEstimation.js");
var Task_js_1 = require("../Task.js");
var ids_js_1 = require("../types/ids.js");
var abortController_js_1 = require("../utils/abortController.js");
var agentContext_js_1 = require("../utils/agentContext.js");
var cleanupRegistry_js_1 = require("../utils/cleanupRegistry.js");
var debug_js_1 = require("../utils/debug.js");
var log_js_1 = require("../utils/log.js");
var messageQueueManager_js_1 = require("../utils/messageQueueManager.js");
var sdkEventQueue_js_1 = require("../utils/sdkEventQueue.js");
var sessionStorage_js_1 = require("../utils/sessionStorage.js");
var diskOutput_js_1 = require("../utils/task/diskOutput.js");
var framework_js_1 = require("../utils/task/framework.js");
/**
 * Default agent definition for main session tasks when no agent is specified.
 */
var DEFAULT_MAIN_SESSION_AGENT = {
    agentType: 'main-session',
    whenToUse: 'Main session query',
    source: 'userSettings',
    getSystemPrompt: function () { return ''; },
};
/**
 * Generate a unique task ID for main session tasks.
 * Uses 's' prefix to distinguish from agent tasks ('a' prefix).
 */
var TASK_ID_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';
function generateMainSessionTaskId() {
    var bytes = (0, crypto_1.randomBytes)(8);
    var id = 's';
    for (var i = 0; i < 8; i++) {
        id += TASK_ID_ALPHABET[bytes[i] % TASK_ID_ALPHABET.length];
    }
    return id;
}
/**
 * Register a backgrounded main session task.
 * Called when the user backgrounds the current session query.
 *
 * @param description - Description of the task
 * @param setAppState - State setter function
 * @param mainThreadAgentDefinition - Optional agent definition if running with --agent
 * @param existingAbortController - Optional abort controller to reuse (for backgrounding an active query)
 * @returns Object with task ID and abort signal for stopping the background query
 */
function registerMainSessionTask(description, setAppState, mainThreadAgentDefinition, existingAbortController) {
    var _this = this;
    var taskId = generateMainSessionTaskId();
    // Link output to an isolated per-task transcript file (same layout as
    // sub-agents). Do NOT use getTranscriptPath() — that's the main session's
    // file, and writing there from a background query after /clear would corrupt
    // the post-clear conversation. The isolated path lets this task survive
    // /clear: the symlink re-link in clearConversation handles session ID changes.
    void (0, diskOutput_js_1.initTaskOutputAsSymlink)(taskId, (0, sessionStorage_js_1.getAgentTranscriptPath)((0, ids_js_1.asAgentId)(taskId)));
    // Use the existing abort controller if provided (important for backgrounding an active query)
    // This ensures that aborting the task will abort the actual query
    var abortController = existingAbortController !== null && existingAbortController !== void 0 ? existingAbortController : (0, abortController_js_1.createAbortController)();
    var unregisterCleanup = (0, cleanupRegistry_js_1.registerCleanup)(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // Clean up on process exit
            setAppState(function (prev) {
                var _a = prev.tasks, _b = taskId, removed = _a[_b], rest = __rest(_a, [typeof _b === "symbol" ? _b : _b + ""]);
                return __assign(__assign({}, prev), { tasks: rest });
            });
            return [2 /*return*/];
        });
    }); });
    // Use provided agent definition or default
    var selectedAgent = mainThreadAgentDefinition !== null && mainThreadAgentDefinition !== void 0 ? mainThreadAgentDefinition : DEFAULT_MAIN_SESSION_AGENT;
    // Create task state - already backgrounded since this is called when user backgrounds
    var taskState = __assign(__assign({}, (0, Task_js_1.createTaskStateBase)(taskId, 'local_agent', description)), { type: 'local_agent', status: 'running', agentId: taskId, prompt: description, selectedAgent: selectedAgent, agentType: 'main-session', abortController: abortController, unregisterCleanup: unregisterCleanup, retrieved: false, lastReportedToolCount: 0, lastReportedTokenCount: 0, isBackgrounded: true, pendingMessages: [], retain: false, diskLoaded: false });
    (0, debug_js_1.logForDebugging)("[LocalMainSessionTask] Registering task ".concat(taskId, " with description: ").concat(description));
    (0, framework_js_1.registerTask)(taskState, setAppState);
    // Verify task was registered by checking state
    setAppState(function (prev) {
        var hasTask = taskId in prev.tasks;
        (0, debug_js_1.logForDebugging)("[LocalMainSessionTask] After registration, task ".concat(taskId, " exists in state: ").concat(hasTask));
        return prev;
    });
    return { taskId: taskId, abortSignal: abortController.signal };
}
/**
 * Complete the main session task and send notification.
 * Called when the backgrounded query finishes.
 */
function completeMainSessionTask(taskId, success, setAppState) {
    var wasBackgrounded = true;
    var toolUseId;
    (0, framework_js_1.updateTaskState)(taskId, setAppState, function (task) {
        var _a, _b, _c;
        if (task.status !== 'running') {
            return task;
        }
        // Track if task was backgrounded (for notification decision)
        wasBackgrounded = (_a = task.isBackgrounded) !== null && _a !== void 0 ? _a : true;
        toolUseId = task.toolUseId;
        (_b = task.unregisterCleanup) === null || _b === void 0 ? void 0 : _b.call(task);
        return __assign(__assign({}, task), { status: success ? 'completed' : 'failed', endTime: Date.now(), messages: ((_c = task.messages) === null || _c === void 0 ? void 0 : _c.length) ? [task.messages.at(-1)] : undefined });
    });
    void (0, diskOutput_js_1.evictTaskOutput)(taskId);
    // Only send notification if task is still backgrounded (not foregrounded)
    // If foregrounded, user is watching it directly - no notification needed
    if (wasBackgrounded) {
        enqueueMainSessionNotification(taskId, 'Background session', success ? 'completed' : 'failed', setAppState, toolUseId);
    }
    else {
        // Foregrounded: no XML notification (TUI user is watching), but SDK
        // consumers still need to see the task_started bookend close.
        // Set notified so evictTerminalTask/generateTaskAttachments eviction
        // guards pass; the backgrounded path sets this inside
        // enqueueMainSessionNotification's check-and-set.
        (0, framework_js_1.updateTaskState)(taskId, setAppState, function (task) { return (__assign(__assign({}, task), { notified: true })); });
        (0, sdkEventQueue_js_1.emitTaskTerminatedSdk)(taskId, success ? 'completed' : 'failed', {
            toolUseId: toolUseId,
            summary: 'Background session',
        });
    }
}
/**
 * Enqueue a notification about the backgrounded session completing.
 */
function enqueueMainSessionNotification(taskId, description, status, setAppState, toolUseId) {
    // Atomically check and set notified flag to prevent duplicate notifications.
    var shouldEnqueue = false;
    (0, framework_js_1.updateTaskState)(taskId, setAppState, function (task) {
        if (task.notified) {
            return task;
        }
        shouldEnqueue = true;
        return __assign(__assign({}, task), { notified: true });
    });
    if (!shouldEnqueue) {
        return;
    }
    var summary = status === 'completed'
        ? "Background session \"".concat(description, "\" completed")
        : "Background session \"".concat(description, "\" failed");
    var toolUseIdLine = toolUseId
        ? "\n<".concat(xml_js_1.TOOL_USE_ID_TAG, ">").concat(toolUseId, "</").concat(xml_js_1.TOOL_USE_ID_TAG, ">")
        : '';
    var outputPath = (0, diskOutput_js_1.getTaskOutputPath)(taskId);
    var message = "<".concat(xml_js_1.TASK_NOTIFICATION_TAG, ">\n<").concat(xml_js_1.TASK_ID_TAG, ">").concat(taskId, "</").concat(xml_js_1.TASK_ID_TAG, ">").concat(toolUseIdLine, "\n<").concat(xml_js_1.OUTPUT_FILE_TAG, ">").concat(outputPath, "</").concat(xml_js_1.OUTPUT_FILE_TAG, ">\n<").concat(xml_js_1.STATUS_TAG, ">").concat(status, "</").concat(xml_js_1.STATUS_TAG, ">\n<").concat(xml_js_1.SUMMARY_TAG, ">").concat(summary, "</").concat(xml_js_1.SUMMARY_TAG, ">\n</").concat(xml_js_1.TASK_NOTIFICATION_TAG, ">");
    (0, messageQueueManager_js_1.enqueuePendingNotification)({ value: message, mode: 'task-notification' });
}
/**
 * Foreground a main session task - mark it as foregrounded so its output
 * appears in the main view. The background query keeps running.
 * Returns the task's accumulated messages, or undefined if task not found.
 */
function foregroundMainSessionTask(taskId, setAppState) {
    var taskMessages;
    setAppState(function (prev) {
        var _a, _b;
        var task = prev.tasks[taskId];
        if (!task || task.type !== 'local_agent') {
            return prev;
        }
        taskMessages = task.messages;
        // Restore previous foregrounded task to background if it exists
        var prevId = prev.foregroundedTaskId;
        var prevTask = prevId ? prev.tasks[prevId] : undefined;
        var restorePrev = prevId && prevId !== taskId && (prevTask === null || prevTask === void 0 ? void 0 : prevTask.type) === 'local_agent';
        return __assign(__assign({}, prev), { foregroundedTaskId: taskId, tasks: __assign(__assign(__assign({}, prev.tasks), (restorePrev && (_a = {}, _a[prevId] = __assign(__assign({}, prevTask), { isBackgrounded: true }), _a))), (_b = {}, _b[taskId] = __assign(__assign({}, task), { isBackgrounded: false }), _b)) });
    });
    return taskMessages;
}
/**
 * Check if a task is a main session task (vs a regular agent task).
 */
function isMainSessionTask(task) {
    if (typeof task !== 'object' ||
        task === null ||
        !('type' in task) ||
        !('agentType' in task)) {
        return false;
    }
    return (task.type === 'local_agent' &&
        task.agentType === 'main-session');
}
// Max recent activities to keep for display
var MAX_RECENT_ACTIVITIES = 5;
/**
 * Start a fresh background session with the given messages.
 *
 * Spawns an independent query() call with the current messages and registers it
 * as a background task. The caller's foreground query continues running normally.
 */
function startBackgroundSession(_a) {
    var _this = this;
    var messages = _a.messages, queryParams = _a.queryParams, description = _a.description, setAppState = _a.setAppState, agentDefinition = _a.agentDefinition;
    var _b = registerMainSessionTask(description, setAppState, agentDefinition), taskId = _b.taskId, abortSignal = _b.abortSignal;
    // Persist the pre-backgrounding conversation to the task's isolated
    // transcript so TaskOutput shows context immediately. Subsequent messages
    // are written incrementally below.
    void (0, sessionStorage_js_1.recordSidechainTranscript)(messages, taskId).catch(function (err) {
        return (0, debug_js_1.logForDebugging)("bg-session initial transcript write failed: ".concat(err));
    });
    // Wrap in agent context so skill invocations scope to this task's agentId
    // (not null). This lets clearInvokedSkills(preservedAgentIds) selectively
    // preserve this task's skills across /clear. AsyncLocalStorage isolates
    // concurrent async chains — this wrapper doesn't affect the foreground.
    var agentContext = {
        agentId: taskId,
        agentType: 'subagent',
        subagentName: 'main-session',
        isBuiltIn: true,
    };
    void (0, agentContext_js_1.runWithAgentContext)(agentContext, function () { return __awaiter(_this, void 0, void 0, function () {
        var bgMessages_1, recentActivities_1, toolCount_1, tokenCount_1, lastRecordedUuid, _loop_1, _a, _b, _c, state_1, e_1_1, error_1;
        var _d, e_1, _e, _f;
        var _g, _h;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    _j.trys.push([0, 13, , 14]);
                    bgMessages_1 = __spreadArray([], messages, true);
                    recentActivities_1 = [];
                    toolCount_1 = 0;
                    tokenCount_1 = 0;
                    lastRecordedUuid = (_h = (_g = messages.at(-1)) === null || _g === void 0 ? void 0 : _g.uuid) !== null && _h !== void 0 ? _h : null;
                    _j.label = 1;
                case 1:
                    _j.trys.push([1, 6, 7, 12]);
                    _loop_1 = function () {
                        _f = _c.value;
                        _a = false;
                        var event_1 = _f;
                        if (abortSignal.aborted) {
                            // Aborted mid-stream — completeMainSessionTask won't be reached.
                            // chat:killAgents path already marked notified + emitted; stopTask path did not.
                            var alreadyNotified_1 = false;
                            (0, framework_js_1.updateTaskState)(taskId, setAppState, function (task) {
                                alreadyNotified_1 = task.notified === true;
                                return alreadyNotified_1 ? task : __assign(__assign({}, task), { notified: true });
                            });
                            if (!alreadyNotified_1) {
                                (0, sdkEventQueue_js_1.emitTaskTerminatedSdk)(taskId, 'stopped', {
                                    summary: description,
                                });
                            }
                            return { value: void 0 };
                        }
                        if (event_1.type !== 'user' &&
                            event_1.type !== 'assistant' &&
                            event_1.type !== 'system') {
                            return "continue";
                        }
                        bgMessages_1.push(event_1);
                        // Per-message write (matches runAgent.ts pattern) — gives live
                        // TaskOutput progress and keeps the transcript file current even if
                        // /clear re-links the symlink mid-run.
                        void (0, sessionStorage_js_1.recordSidechainTranscript)([event_1], taskId, lastRecordedUuid).catch(function (err) { return (0, debug_js_1.logForDebugging)("bg-session transcript write failed: ".concat(err)); });
                        lastRecordedUuid = event_1.uuid;
                        if (event_1.type === 'assistant') {
                            for (var _i = 0, _k = event_1.message.content; _i < _k.length; _i++) {
                                var block = _k[_i];
                                if (block.type === 'text') {
                                    tokenCount_1 += (0, tokenEstimation_js_1.roughTokenCountEstimation)(block.text);
                                }
                                else if (block.type === 'tool_use') {
                                    toolCount_1++;
                                    var activity = {
                                        toolName: block.name,
                                        input: block.input,
                                    };
                                    recentActivities_1.push(activity);
                                    if (recentActivities_1.length > MAX_RECENT_ACTIVITIES) {
                                        recentActivities_1.shift();
                                    }
                                }
                            }
                        }
                        setAppState(function (prev) {
                            var _a;
                            var task = prev.tasks[taskId];
                            if (!task || task.type !== 'local_agent')
                                return prev;
                            var prevProgress = task.progress;
                            if ((prevProgress === null || prevProgress === void 0 ? void 0 : prevProgress.tokenCount) === tokenCount_1 &&
                                prevProgress.toolUseCount === toolCount_1 &&
                                task.messages === bgMessages_1) {
                                return prev;
                            }
                            return __assign(__assign({}, prev), { tasks: __assign(__assign({}, prev.tasks), (_a = {}, _a[taskId] = __assign(__assign({}, task), { progress: {
                                        tokenCount: tokenCount_1,
                                        toolUseCount: toolCount_1,
                                        recentActivities: (prevProgress === null || prevProgress === void 0 ? void 0 : prevProgress.toolUseCount) === toolCount_1
                                            ? prevProgress.recentActivities
                                            : __spreadArray([], recentActivities_1, true),
                                    }, messages: bgMessages_1 }), _a)) });
                        });
                    };
                    _a = true, _b = __asyncValues((0, query_js_1.query)(__assign({ messages: bgMessages_1 }, queryParams)));
                    _j.label = 2;
                case 2: return [4 /*yield*/, _b.next()];
                case 3:
                    if (!(_c = _j.sent(), _d = _c.done, !_d)) return [3 /*break*/, 5];
                    state_1 = _loop_1();
                    if (typeof state_1 === "object")
                        return [2 /*return*/, state_1.value];
                    _j.label = 4;
                case 4:
                    _a = true;
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 12];
                case 6:
                    e_1_1 = _j.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 12];
                case 7:
                    _j.trys.push([7, , 10, 11]);
                    if (!(!_a && !_d && (_e = _b.return))) return [3 /*break*/, 9];
                    return [4 /*yield*/, _e.call(_b)];
                case 8:
                    _j.sent();
                    _j.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 11: return [7 /*endfinally*/];
                case 12:
                    completeMainSessionTask(taskId, true, setAppState);
                    return [3 /*break*/, 14];
                case 13:
                    error_1 = _j.sent();
                    (0, log_js_1.logError)(error_1);
                    completeMainSessionTask(taskId, false, setAppState);
                    return [3 /*break*/, 14];
                case 14: return [2 /*return*/];
            }
        });
    }); });
    return taskId;
}
