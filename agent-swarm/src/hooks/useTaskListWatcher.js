"use strict";
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
exports.useTaskListWatcher = useTaskListWatcher;
var fs_1 = require("fs");
var react_1 = require("react");
var debug_js_1 = require("../utils/debug.js");
var tasks_js_1 = require("../utils/tasks.js");
var DEBOUNCE_MS = 1000;
/**
 * Hook that watches a task list directory and automatically picks up
 * open, unowned tasks to work on.
 *
 * This enables "tasks mode" where Claude watches for externally-created
 * tasks and processes them one at a time.
 */
function useTaskListWatcher(_a) {
    var _this = this;
    var taskListId = _a.taskListId, isLoading = _a.isLoading, onSubmitTask = _a.onSubmitTask;
    var currentTaskRef = (0, react_1.useRef)(null);
    var debounceTimerRef = (0, react_1.useRef)(null);
    // Stabilize unstable props via refs so the watcher effect doesn't depend on
    // them. isLoading flips every turn, and onSubmitTask's identity changes
    // whenever onQuery's deps change. Without this, the watcher effect re-runs
    // on every turn, calling watcher.close() + watch() each time — which is a
    // trigger for Bun's PathWatcherManager deadlock (oven-sh/bun#27469).
    var isLoadingRef = (0, react_1.useRef)(isLoading);
    isLoadingRef.current = isLoading;
    var onSubmitTaskRef = (0, react_1.useRef)(onSubmitTask);
    onSubmitTaskRef.current = onSubmitTask;
    var enabled = taskListId !== undefined;
    var agentId = taskListId !== null && taskListId !== void 0 ? taskListId : tasks_js_1.DEFAULT_TASKS_MODE_TASK_LIST_ID;
    // checkForTasks reads isLoading and onSubmitTask from refs — always
    // up-to-date, no stale closure, and doesn't force a new function identity
    // per render. Stored in a ref so the watcher effect can call it without
    // depending on it.
    var checkForTasksRef = (0, react_1.useRef)(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/];
    }); }); });
    checkForTasksRef.current = function () { return __awaiter(_this, void 0, void 0, function () {
        var tasks, currentTask, availableTask, result, prompt, submitted;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!enabled) {
                        return [2 /*return*/];
                    }
                    // Don't need to submit new tasks if we are already working
                    if (isLoadingRef.current) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, (0, tasks_js_1.listTasks)(taskListId)
                        // If we have a current task, check if it's been resolved
                    ];
                case 1:
                    tasks = _a.sent();
                    // If we have a current task, check if it's been resolved
                    if (currentTaskRef.current !== null) {
                        currentTask = tasks.find(function (t) { return t.id === currentTaskRef.current; });
                        if (!currentTask || currentTask.status === 'completed') {
                            (0, debug_js_1.logForDebugging)("[TaskListWatcher] Task #".concat(currentTaskRef.current, " is marked complete, ready for next task"));
                            currentTaskRef.current = null;
                        }
                        else {
                            // Still working on current task
                            return [2 /*return*/];
                        }
                    }
                    availableTask = findAvailableTask(tasks);
                    if (!availableTask) {
                        return [2 /*return*/];
                    }
                    (0, debug_js_1.logForDebugging)("[TaskListWatcher] Found available task #".concat(availableTask.id, ": ").concat(availableTask.subject));
                    return [4 /*yield*/, (0, tasks_js_1.claimTask)(taskListId, availableTask.id, agentId)];
                case 2:
                    result = _a.sent();
                    if (!result.success) {
                        (0, debug_js_1.logForDebugging)("[TaskListWatcher] Failed to claim task #".concat(availableTask.id, ": ").concat(result.reason));
                        return [2 /*return*/];
                    }
                    currentTaskRef.current = availableTask.id;
                    prompt = formatTaskAsPrompt(availableTask);
                    (0, debug_js_1.logForDebugging)("[TaskListWatcher] Submitting task #".concat(availableTask.id, " as prompt"));
                    submitted = onSubmitTaskRef.current(prompt);
                    if (!!submitted) return [3 /*break*/, 4];
                    (0, debug_js_1.logForDebugging)("[TaskListWatcher] Failed to submit task #".concat(availableTask.id, ", releasing claim"));
                    // Release the claim
                    return [4 /*yield*/, (0, tasks_js_1.updateTask)(taskListId, availableTask.id, { owner: undefined })];
                case 3:
                    // Release the claim
                    _a.sent();
                    currentTaskRef.current = null;
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // -- Watcher setup
    // Schedules a check after DEBOUNCE_MS, collapsing rapid fs events.
    // Shared between the watcher callback and the idle-trigger effect below.
    var scheduleCheckRef = (0, react_1.useRef)(function () { });
    (0, react_1.useEffect)(function () {
        if (!enabled)
            return;
        void (0, tasks_js_1.ensureTasksDir)(taskListId);
        var tasksDir = (0, tasks_js_1.getTasksDir)(taskListId);
        var watcher = null;
        var debouncedCheck = function () {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            debounceTimerRef.current = setTimeout(function (ref) { return void ref.current(); }, DEBOUNCE_MS, checkForTasksRef);
        };
        scheduleCheckRef.current = debouncedCheck;
        try {
            watcher = (0, fs_1.watch)(tasksDir, debouncedCheck);
            watcher.unref();
            (0, debug_js_1.logForDebugging)("[TaskListWatcher] Watching for tasks in ".concat(tasksDir));
        }
        catch (error) {
            // fs.watch throws synchronously on ENOENT — ensureTasksDir should have
            // created the dir, but handle the race gracefully
            (0, debug_js_1.logForDebugging)("[TaskListWatcher] Failed to watch ".concat(tasksDir, ": ").concat(error));
        }
        // Initial check
        debouncedCheck();
        return function () {
            // This cleanup only fires when taskListId changes or on unmount —
            // never per-turn. That keeps watcher.close() out of the Bun
            // PathWatcherManager deadlock window.
            scheduleCheckRef.current = function () { };
            if (watcher) {
                watcher.close();
            }
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [enabled, taskListId]);
    // Previously, the watcher effect depended on checkForTasks (and transitively
    // isLoading), so going idle triggered a re-setup whose initial debouncedCheck
    // would pick up the next task. Preserve that behavior explicitly: when
    // isLoading drops, schedule a check.
    (0, react_1.useEffect)(function () {
        if (!enabled)
            return;
        if (isLoading)
            return;
        scheduleCheckRef.current();
    }, [enabled, isLoading]);
}
/**
 * Find an available task that can be worked on:
 * - Status is 'pending'
 * - No owner assigned
 * - Not blocked by any unresolved tasks
 */
function findAvailableTask(tasks) {
    var unresolvedTaskIds = new Set(tasks.filter(function (t) { return t.status !== 'completed'; }).map(function (t) { return t.id; }));
    return tasks.find(function (task) {
        if (task.status !== 'pending')
            return false;
        if (task.owner)
            return false;
        // Check all blockers are completed
        return task.blockedBy.every(function (id) { return !unresolvedTaskIds.has(id); });
    });
}
/**
 * Format a task as a prompt for Claude to work on.
 */
function formatTaskAsPrompt(task) {
    var prompt = "Complete all open tasks. Start with task #".concat(task.id, ": \n\n ").concat(task.subject);
    if (task.description) {
        prompt += "\n\n".concat(task.description);
    }
    return prompt;
}
