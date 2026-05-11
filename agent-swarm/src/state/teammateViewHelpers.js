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
Object.defineProperty(exports, "__esModule", { value: true });
exports.enterTeammateView = enterTeammateView;
exports.exitTeammateView = exitTeammateView;
exports.stopOrDismissAgent = stopOrDismissAgent;
var index_js_1 = require("../services/analytics/index.js");
var Task_js_1 = require("../Task.js");
// Inlined from framework.ts — importing creates a cycle through
// BackgroundTasksDialog. Keep in sync with PANEL_GRACE_MS there.
var PANEL_GRACE_MS = 30000;
// Inline type check instead of importing isLocalAgentTask — breaks the
// teammateViewHelpers → LocalAgentTask runtime edge that creates a cycle
// through BackgroundTasksDialog.
function isLocalAgent(task) {
    return (typeof task === 'object' &&
        task !== null &&
        'type' in task &&
        task.type === 'local_agent');
}
/**
 * Return the task released back to stub form: retain dropped, messages
 * cleared, evictAfter set if terminal. Shared by exitTeammateView and
 * the switch-away path in enterTeammateView.
 */
function release(task) {
    return __assign(__assign({}, task), { retain: false, messages: undefined, diskLoaded: false, evictAfter: (0, Task_js_1.isTerminalTaskStatus)(task.status)
            ? Date.now() + PANEL_GRACE_MS
            : undefined });
}
/**
 * Transitions the UI to view a teammate's transcript.
 * Sets viewingAgentTaskId and, for local_agent, retain: true (blocks eviction,
 * enables stream-append, triggers disk bootstrap) and clears evictAfter.
 * If switching from another agent, releases the previous one back to stub.
 */
function enterTeammateView(taskId, setAppState) {
    (0, index_js_1.logEvent)('tengu_transcript_view_enter', {});
    setAppState(function (prev) {
        var task = prev.tasks[taskId];
        var prevId = prev.viewingAgentTaskId;
        var prevTask = prevId !== undefined ? prev.tasks[prevId] : undefined;
        var switching = prevId !== undefined &&
            prevId !== taskId &&
            isLocalAgent(prevTask) &&
            prevTask.retain;
        var needsRetain = isLocalAgent(task) && (!task.retain || task.evictAfter !== undefined);
        var needsView = prev.viewingAgentTaskId !== taskId ||
            prev.viewSelectionMode !== 'viewing-agent';
        if (!needsRetain && !needsView && !switching)
            return prev;
        var tasks = prev.tasks;
        if (switching || needsRetain) {
            tasks = __assign({}, prev.tasks);
            if (switching)
                tasks[prevId] = release(prevTask);
            if (needsRetain) {
                tasks[taskId] = __assign(__assign({}, task), { retain: true, evictAfter: undefined });
            }
        }
        return __assign(__assign({}, prev), { viewingAgentTaskId: taskId, viewSelectionMode: 'viewing-agent', tasks: tasks });
    });
}
/**
 * Exit teammate transcript view and return to leader's view.
 * Drops retain and clears messages back to stub form; if terminal,
 * schedules eviction via evictAfter so the row lingers briefly.
 */
function exitTeammateView(setAppState) {
    (0, index_js_1.logEvent)('tengu_transcript_view_exit', {});
    setAppState(function (prev) {
        var _a;
        var id = prev.viewingAgentTaskId;
        var cleared = __assign(__assign({}, prev), { viewingAgentTaskId: undefined, viewSelectionMode: 'none' });
        if (id === undefined) {
            return prev.viewSelectionMode === 'none' ? prev : cleared;
        }
        var task = prev.tasks[id];
        if (!isLocalAgent(task) || !task.retain)
            return cleared;
        return __assign(__assign({}, cleared), { tasks: __assign(__assign({}, prev.tasks), (_a = {}, _a[id] = release(task), _a)) });
    });
}
/**
 * Context-sensitive x: running → abort, terminal → dismiss.
 * Dismiss sets evictAfter=0 so the filter hides immediately.
 * If viewing the dismissed agent, also exits to leader.
 */
function stopOrDismissAgent(taskId, setAppState) {
    setAppState(function (prev) {
        var _a;
        var _b;
        var task = prev.tasks[taskId];
        if (!isLocalAgent(task))
            return prev;
        if (task.status === 'running') {
            (_b = task.abortController) === null || _b === void 0 ? void 0 : _b.abort();
            return prev;
        }
        if (task.evictAfter === 0)
            return prev;
        var viewingThis = prev.viewingAgentTaskId === taskId;
        return __assign(__assign(__assign({}, prev), { tasks: __assign(__assign({}, prev.tasks), (_a = {}, _a[taskId] = __assign(__assign({}, release(task)), { evictAfter: 0 }), _a)) }), (viewingThis && {
            viewingAgentTaskId: undefined,
            viewSelectionMode: 'none',
        }));
    });
}
