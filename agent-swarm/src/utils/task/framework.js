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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PANEL_GRACE_MS = exports.STOPPED_DISPLAY_MS = exports.POLL_INTERVAL_MS = void 0;
exports.updateTaskState = updateTaskState;
exports.registerTask = registerTask;
exports.evictTerminalTask = evictTerminalTask;
exports.getRunningTasks = getRunningTasks;
exports.generateTaskAttachments = generateTaskAttachments;
exports.applyTaskOffsetsAndEvictions = applyTaskOffsetsAndEvictions;
exports.pollTasks = pollTasks;
var xml_js_1 = require("../../constants/xml.js");
var Task_js_1 = require("../../Task.js");
var messageQueueManager_js_1 = require("../messageQueueManager.js");
var sdkEventQueue_js_1 = require("../sdkEventQueue.js");
var diskOutput_js_1 = require("./diskOutput.js");
// Standard polling interval for all tasks
exports.POLL_INTERVAL_MS = 1000;
// Duration to display killed tasks before eviction
exports.STOPPED_DISPLAY_MS = 3000;
// Grace period for terminal local_agent tasks in the coordinator panel
exports.PANEL_GRACE_MS = 30000;
/**
 * Update a task's state in AppState.
 * Helper function for task implementations.
 * Generic to allow type-safe updates for specific task types.
 */
function updateTaskState(taskId, setAppState, updater) {
    setAppState(function (prev) {
        var _a;
        var _b;
        var task = (_b = prev.tasks) === null || _b === void 0 ? void 0 : _b[taskId];
        if (!task) {
            return prev;
        }
        var updated = updater(task);
        if (updated === task) {
            // Updater returned the same reference (early-return no-op). Skip the
            // spread so s.tasks subscribers don't re-render on unchanged state.
            return prev;
        }
        return __assign(__assign({}, prev), { tasks: __assign(__assign({}, prev.tasks), (_a = {}, _a[taskId] = updated, _a)) });
    });
}
/**
 * Register a new task in AppState.
 */
function registerTask(task, setAppState) {
    var isReplacement = false;
    setAppState(function (prev) {
        var _a;
        var existing = prev.tasks[task.id];
        isReplacement = existing !== undefined;
        // Carry forward UI-held state on re-register (resumeAgentBackground
        // replaces the task; user's retain shouldn't reset). startTime keeps
        // the panel sort stable; messages + diskLoaded preserve the viewed
        // transcript across the replace (the user's just-appended prompt lives
        // in messages and isn't on disk yet).
        var merged = existing && 'retain' in existing
            ? __assign(__assign({}, task), { retain: existing.retain, startTime: existing.startTime, messages: existing.messages, diskLoaded: existing.diskLoaded, pendingMessages: existing.pendingMessages }) : task;
        return __assign(__assign({}, prev), { tasks: __assign(__assign({}, prev.tasks), (_a = {}, _a[task.id] = merged, _a)) });
    });
    // Replacement (resume) — not a new start. Skip to avoid double-emit.
    if (isReplacement)
        return;
    (0, sdkEventQueue_js_1.enqueueSdkEvent)({
        type: 'system',
        subtype: 'task_started',
        task_id: task.id,
        tool_use_id: task.toolUseId,
        description: task.description,
        task_type: task.type,
        workflow_name: 'workflowName' in task
            ? task.workflowName
            : undefined,
        prompt: 'prompt' in task ? task.prompt : undefined,
    });
}
/**
 * Eagerly evict a terminal task from AppState.
 * The task must be in a terminal state (completed/failed/killed) with notified=true.
 * This allows memory to be freed without waiting for the next query loop iteration.
 * The lazy GC in generateTaskAttachments() remains as a safety net.
 */
function evictTerminalTask(taskId, setAppState) {
    setAppState(function (prev) {
        var _a, _b;
        var task = (_a = prev.tasks) === null || _a === void 0 ? void 0 : _a[taskId];
        if (!task)
            return prev;
        if (!(0, Task_js_1.isTerminalTaskStatus)(task.status))
            return prev;
        if (!task.notified)
            return prev;
        // Panel grace period — blocks eviction until deadline passes.
        // 'retain' in task narrows to LocalAgentTaskState (the only type with
        // that field); evictAfter is optional so 'evictAfter' in task would
        // miss tasks that haven't had it set yet.
        if ('retain' in task && ((_b = task.evictAfter) !== null && _b !== void 0 ? _b : Infinity) > Date.now()) {
            return prev;
        }
        var _c = prev.tasks, _d = taskId, _ = _c[_d], remainingTasks = __rest(_c, [typeof _d === "symbol" ? _d : _d + ""]);
        return __assign(__assign({}, prev), { tasks: remainingTasks });
    });
}
/**
 * Get all running tasks.
 */
function getRunningTasks(state) {
    var _a;
    var tasks = (_a = state.tasks) !== null && _a !== void 0 ? _a : {};
    return Object.values(tasks).filter(function (task) { return task.status === 'running'; });
}
/**
 * Generate attachments for tasks with new output or status changes.
 * Called by the framework to create push notifications.
 */
function generateTaskAttachments(state) {
    return __awaiter(this, void 0, void 0, function () {
        var attachments, updatedTaskOffsets, evictedTaskIds, tasks, _i, _a, taskState, delta;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    attachments = [];
                    updatedTaskOffsets = {};
                    evictedTaskIds = [];
                    tasks = (_b = state.tasks) !== null && _b !== void 0 ? _b : {};
                    _i = 0, _a = Object.values(tasks);
                    _c.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    taskState = _a[_i];
                    if (taskState.notified) {
                        switch (taskState.status) {
                            case 'completed':
                            case 'failed':
                            case 'killed':
                                // Evict terminal tasks — they've been consumed and can be GC'd
                                evictedTaskIds.push(taskState.id);
                                return [3 /*break*/, 3];
                            case 'pending':
                                // Keep in map — hasn't run yet, but parent already knows about it
                                return [3 /*break*/, 3];
                            case 'running':
                                // Fall through to running logic below
                                break;
                        }
                    }
                    if (!(taskState.status === 'running')) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, diskOutput_js_1.getTaskOutputDelta)(taskState.id, taskState.outputOffset)];
                case 2:
                    delta = _c.sent();
                    if (delta.content) {
                        updatedTaskOffsets[taskState.id] = delta.newOffset;
                    }
                    _c.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, { attachments: attachments, updatedTaskOffsets: updatedTaskOffsets, evictedTaskIds: evictedTaskIds }];
            }
        });
    });
}
/**
 * Apply the outputOffset patches and evictions from generateTaskAttachments.
 * Merges patches against FRESH prev.tasks (not the stale pre-await snapshot),
 * so concurrent status transitions aren't clobbered.
 */
function applyTaskOffsetsAndEvictions(setAppState, updatedTaskOffsets, evictedTaskIds) {
    var offsetIds = Object.keys(updatedTaskOffsets);
    if (offsetIds.length === 0 && evictedTaskIds.length === 0) {
        return;
    }
    setAppState(function (prev) {
        var _a;
        var changed = false;
        var newTasks = __assign({}, prev.tasks);
        for (var _i = 0, offsetIds_1 = offsetIds; _i < offsetIds_1.length; _i++) {
            var id = offsetIds_1[_i];
            var fresh = newTasks[id];
            // Re-check status on fresh state — task may have completed during the
            // await. If it's no longer running, the offset update is moot.
            if ((fresh === null || fresh === void 0 ? void 0 : fresh.status) === 'running') {
                newTasks[id] = __assign(__assign({}, fresh), { outputOffset: updatedTaskOffsets[id] });
                changed = true;
            }
        }
        for (var _b = 0, evictedTaskIds_1 = evictedTaskIds; _b < evictedTaskIds_1.length; _b++) {
            var id = evictedTaskIds_1[_b];
            var fresh = newTasks[id];
            // Re-check terminal+notified on fresh state (TOCTOU: resume may have
            // replaced the task during the generateTaskAttachments await)
            if (!fresh || !(0, Task_js_1.isTerminalTaskStatus)(fresh.status) || !fresh.notified) {
                continue;
            }
            if ('retain' in fresh && ((_a = fresh.evictAfter) !== null && _a !== void 0 ? _a : Infinity) > Date.now()) {
                continue;
            }
            delete newTasks[id];
            changed = true;
        }
        return changed ? __assign(__assign({}, prev), { tasks: newTasks }) : prev;
    });
}
/**
 * Poll all running tasks and check for updates.
 * This is the main polling loop called by the framework.
 */
function pollTasks(getAppState, setAppState) {
    return __awaiter(this, void 0, void 0, function () {
        var state, _a, attachments, updatedTaskOffsets, evictedTaskIds, _i, attachments_1, attachment;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    state = getAppState();
                    return [4 /*yield*/, generateTaskAttachments(state)];
                case 1:
                    _a = _b.sent(), attachments = _a.attachments, updatedTaskOffsets = _a.updatedTaskOffsets, evictedTaskIds = _a.evictedTaskIds;
                    applyTaskOffsetsAndEvictions(setAppState, updatedTaskOffsets, evictedTaskIds);
                    // Send notifications for completed tasks
                    for (_i = 0, attachments_1 = attachments; _i < attachments_1.length; _i++) {
                        attachment = attachments_1[_i];
                        enqueueTaskNotification(attachment);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Enqueue a task notification to the message queue.
 */
function enqueueTaskNotification(attachment) {
    var statusText = getStatusText(attachment.status);
    var outputPath = (0, diskOutput_js_1.getTaskOutputPath)(attachment.taskId);
    var toolUseIdLine = attachment.toolUseId
        ? "\n<".concat(xml_js_1.TOOL_USE_ID_TAG, ">").concat(attachment.toolUseId, "</").concat(xml_js_1.TOOL_USE_ID_TAG, ">")
        : '';
    var message = "<".concat(xml_js_1.TASK_NOTIFICATION_TAG, ">\n<").concat(xml_js_1.TASK_ID_TAG, ">").concat(attachment.taskId, "</").concat(xml_js_1.TASK_ID_TAG, ">").concat(toolUseIdLine, "\n<").concat(xml_js_1.TASK_TYPE_TAG, ">").concat(attachment.taskType, "</").concat(xml_js_1.TASK_TYPE_TAG, ">\n<").concat(xml_js_1.OUTPUT_FILE_TAG, ">").concat(outputPath, "</").concat(xml_js_1.OUTPUT_FILE_TAG, ">\n<").concat(xml_js_1.STATUS_TAG, ">").concat(attachment.status, "</").concat(xml_js_1.STATUS_TAG, ">\n<").concat(xml_js_1.SUMMARY_TAG, ">Task \"").concat(attachment.description, "\" ").concat(statusText, "</").concat(xml_js_1.SUMMARY_TAG, ">\n</").concat(xml_js_1.TASK_NOTIFICATION_TAG, ">");
    (0, messageQueueManager_js_1.enqueuePendingNotification)({ value: message, mode: 'task-notification' });
}
/**
 * Get human-readable status text.
 */
function getStatusText(status) {
    switch (status) {
        case 'completed':
            return 'completed successfully';
        case 'failed':
            return 'failed';
        case 'killed':
            return 'was stopped';
        case 'running':
            return 'is running';
        case 'pending':
            return 'is pending';
    }
}
