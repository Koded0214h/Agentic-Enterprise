"use strict";
// Pure (non-React) kill helpers for LocalShellTask.
// Extracted so runAgent.ts can kill agent-scoped bash tasks without pulling
// React/Ink into its module graph (same rationale as guards.ts).
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.killTask = killTask;
exports.killShellTasksForAgent = killShellTasksForAgent;
var debug_js_1 = require("../../utils/debug.js");
var log_js_1 = require("../../utils/log.js");
var messageQueueManager_js_1 = require("../../utils/messageQueueManager.js");
var diskOutput_js_1 = require("../../utils/task/diskOutput.js");
var framework_js_1 = require("../../utils/task/framework.js");
var guards_js_1 = require("./guards.js");
function killTask(taskId, setAppState) {
    (0, framework_js_1.updateTaskState)(taskId, setAppState, function (task) {
        var _a, _b, _c;
        if (task.status !== 'running' || !(0, guards_js_1.isLocalShellTask)(task)) {
            return task;
        }
        try {
            (0, debug_js_1.logForDebugging)("LocalShellTask ".concat(taskId, " kill requested"));
            (_a = task.shellCommand) === null || _a === void 0 ? void 0 : _a.kill();
            (_b = task.shellCommand) === null || _b === void 0 ? void 0 : _b.cleanup();
        }
        catch (error) {
            (0, log_js_1.logError)(error);
        }
        (_c = task.unregisterCleanup) === null || _c === void 0 ? void 0 : _c.call(task);
        if (task.cleanupTimeoutId) {
            clearTimeout(task.cleanupTimeoutId);
        }
        return __assign(__assign({}, task), { status: 'killed', notified: true, shellCommand: null, unregisterCleanup: undefined, cleanupTimeoutId: undefined, endTime: Date.now() });
    });
    void (0, diskOutput_js_1.evictTaskOutput)(taskId);
}
/**
 * Kill all running bash tasks spawned by a given agent.
 * Called from runAgent.ts finally block so background processes don't outlive
 * the agent that started them (prevents 10-day fake-logs.sh zombies).
 */
function killShellTasksForAgent(agentId, getAppState, setAppState) {
    var _a;
    var tasks = (_a = getAppState().tasks) !== null && _a !== void 0 ? _a : {};
    for (var _i = 0, _b = Object.entries(tasks); _i < _b.length; _i++) {
        var _c = _b[_i], taskId = _c[0], task = _c[1];
        if ((0, guards_js_1.isLocalShellTask)(task) &&
            task.agentId === agentId &&
            task.status === 'running') {
            (0, debug_js_1.logForDebugging)("killShellTasksForAgent: killing orphaned shell task ".concat(taskId, " (agent ").concat(agentId, " exiting)"));
            killTask(taskId, setAppState);
        }
    }
    // Purge any queued notifications addressed to this agent — its query loop
    // has exited and won't drain them. killTask fires 'killed' notifications
    // asynchronously; drop the ones already queued and any that land later sit
    // harmlessly (no consumer matches a dead agentId).
    (0, messageQueueManager_js_1.dequeueAllMatching)(function (cmd) { return cmd.agentId === agentId; });
}
