"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTeammateViewAutoExit = useTeammateViewAutoExit;
var react_1 = require("react");
var AppState_js_1 = require("../state/AppState.js");
var teammateViewHelpers_js_1 = require("../state/teammateViewHelpers.js");
var types_js_1 = require("../tasks/InProcessTeammateTask/types.js");
/**
 * Auto-exits teammate viewing mode when the viewed teammate
 * is killed or encounters an error. Users stay viewing completed
 * teammates so they can review the full transcript.
 */
function useTeammateViewAutoExit() {
    var setAppState = (0, AppState_js_1.useSetAppState)();
    var viewingAgentTaskId = (0, AppState_js_1.useAppState)(function (s) { return s.viewingAgentTaskId; });
    // Select only the viewed task, not the full tasks map — otherwise every
    // streaming update from any teammate re-renders this hook.
    var task = (0, AppState_js_1.useAppState)(function (s) {
        return s.viewingAgentTaskId ? s.tasks[s.viewingAgentTaskId] : undefined;
    });
    var viewedTask = task && (0, types_js_1.isInProcessTeammateTask)(task) ? task : undefined;
    var viewedStatus = viewedTask === null || viewedTask === void 0 ? void 0 : viewedTask.status;
    var viewedError = viewedTask === null || viewedTask === void 0 ? void 0 : viewedTask.error;
    var taskExists = task !== undefined;
    (0, react_1.useEffect)(function () {
        // Not viewing any teammate
        if (!viewingAgentTaskId) {
            return;
        }
        // Task no longer exists in the map — evicted out from under us.
        // Check raw `task` not teammate-narrowed `viewedTask`; local_agent
        // tasks exist but narrow to undefined, which would eject immediately.
        if (!taskExists) {
            (0, teammateViewHelpers_js_1.exitTeammateView)(setAppState);
            return;
        }
        // Status checks below are teammate-only (viewedTask is teammate-narrowed).
        // For local_agent, viewedStatus is undefined → all checks falsy → no eject.
        if (!viewedTask)
            return;
        // Auto-exit if teammate is killed, stopped, has error, or is no longer running
        // This handles shutdown scenarios where teammate becomes inactive
        if (viewedStatus === 'killed' ||
            viewedStatus === 'failed' ||
            viewedError ||
            (viewedStatus !== 'running' &&
                viewedStatus !== 'completed' &&
                viewedStatus !== 'pending')) {
            (0, teammateViewHelpers_js_1.exitTeammateView)(setAppState);
            return;
        }
    }, [
        viewingAgentTaskId,
        taskExists,
        viewedTask,
        viewedStatus,
        viewedError,
        setAppState,
    ]);
}
