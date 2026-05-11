"use strict";
/**
 * Selectors for deriving computed state from AppState.
 * Keep selectors pure and simple - just data extraction, no side effects.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getViewedTeammateTask = getViewedTeammateTask;
exports.getActiveAgentForInput = getActiveAgentForInput;
var types_js_1 = require("../tasks/InProcessTeammateTask/types.js");
/**
 * Get the currently viewed teammate task, if any.
 * Returns undefined if:
 * - No teammate is being viewed (viewingAgentTaskId is undefined)
 * - The task ID doesn't exist in tasks
 * - The task is not an in-process teammate task
 */
function getViewedTeammateTask(appState) {
    var viewingAgentTaskId = appState.viewingAgentTaskId, tasks = appState.tasks;
    // Not viewing any teammate
    if (!viewingAgentTaskId) {
        return undefined;
    }
    // Look up the task
    var task = tasks[viewingAgentTaskId];
    if (!task) {
        return undefined;
    }
    // Verify it's an in-process teammate task
    if (!(0, types_js_1.isInProcessTeammateTask)(task)) {
        return undefined;
    }
    return task;
}
/**
 * Determine where user input should be routed.
 * Returns:
 * - { type: 'leader' } when not viewing a teammate (input goes to leader)
 * - { type: 'viewed', task } when viewing an agent (input goes to that agent)
 *
 * Used by input routing logic to direct user messages to the correct agent.
 */
function getActiveAgentForInput(appState) {
    var viewedTask = getViewedTeammateTask(appState);
    if (viewedTask) {
        return { type: 'viewed', task: viewedTask };
    }
    var viewingAgentTaskId = appState.viewingAgentTaskId, tasks = appState.tasks;
    if (viewingAgentTaskId) {
        var task = tasks[viewingAgentTaskId];
        if ((task === null || task === void 0 ? void 0 : task.type) === 'local_agent') {
            return { type: 'named_agent', task: task };
        }
    }
    return { type: 'leader' };
}
