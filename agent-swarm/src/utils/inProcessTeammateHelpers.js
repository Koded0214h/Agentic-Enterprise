"use strict";
/**
 * In-Process Teammate Helpers
 *
 * Helper functions for in-process teammate integration.
 * Provides utilities to:
 * - Find task ID by agent name
 * - Handle plan approval responses
 * - Update awaitingPlanApproval state
 * - Detect permission-related messages
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.findInProcessTeammateTaskId = findInProcessTeammateTaskId;
exports.setAwaitingPlanApproval = setAwaitingPlanApproval;
exports.handlePlanApprovalResponse = handlePlanApprovalResponse;
exports.isPermissionRelatedResponse = isPermissionRelatedResponse;
var types_js_1 = require("../tasks/InProcessTeammateTask/types.js");
var framework_js_1 = require("./task/framework.js");
var teammateMailbox_js_1 = require("./teammateMailbox.js");
/**
 * Find the task ID for an in-process teammate by agent name.
 *
 * @param agentName - The agent name (e.g., "researcher")
 * @param appState - Current AppState
 * @returns Task ID if found, undefined otherwise
 */
function findInProcessTeammateTaskId(agentName, appState) {
    for (var _i = 0, _a = Object.values(appState.tasks); _i < _a.length; _i++) {
        var task = _a[_i];
        if ((0, types_js_1.isInProcessTeammateTask)(task) &&
            task.identity.agentName === agentName) {
            return task.id;
        }
    }
    return undefined;
}
/**
 * Set awaitingPlanApproval state for an in-process teammate.
 *
 * @param taskId - Task ID of the in-process teammate
 * @param setAppState - AppState setter
 * @param awaiting - Whether teammate is awaiting plan approval
 */
function setAwaitingPlanApproval(taskId, setAppState, awaiting) {
    (0, framework_js_1.updateTaskState)(taskId, setAppState, function (task) { return (__assign(__assign({}, task), { awaitingPlanApproval: awaiting })); });
}
/**
 * Handle plan approval response for an in-process teammate.
 * Called by the message callback when a plan_approval_response arrives.
 *
 * This resets awaitingPlanApproval to false. The permissionMode from the
 * response is handled separately by the agent loop (Task #11).
 *
 * @param taskId - Task ID of the in-process teammate
 * @param _response - The plan approval response message (for future use)
 * @param setAppState - AppState setter
 */
function handlePlanApprovalResponse(taskId, _response, setAppState) {
    setAwaitingPlanApproval(taskId, setAppState, false);
}
// ============ Permission Delegation Helpers ============
/**
 * Check if a message is a permission-related response.
 * Used by in-process teammate message handlers to detect and process
 * permission responses from the team leader.
 *
 * Handles both tool permissions and sandbox (network host) permissions.
 *
 * @param messageText - The raw message text to check
 * @returns true if the message is a permission response
 */
function isPermissionRelatedResponse(messageText) {
    return (!!(0, teammateMailbox_js_1.isPermissionResponse)(messageText) ||
        !!(0, teammateMailbox_js_1.isSandboxPermissionResponse)(messageText));
}
