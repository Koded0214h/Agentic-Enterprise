"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setSessionStateChangedListener = setSessionStateChangedListener;
exports.setSessionMetadataChangedListener = setSessionMetadataChangedListener;
exports.setPermissionModeChangedListener = setPermissionModeChangedListener;
exports.getSessionState = getSessionState;
exports.notifySessionStateChanged = notifySessionStateChanged;
exports.notifySessionMetadataChanged = notifySessionMetadataChanged;
exports.notifyPermissionModeChanged = notifyPermissionModeChanged;
var envUtils_js_1 = require("./envUtils.js");
var sdkEventQueue_js_1 = require("./sdkEventQueue.js");
var stateListener = null;
var metadataListener = null;
var permissionModeListener = null;
function setSessionStateChangedListener(cb) {
    stateListener = cb;
}
function setSessionMetadataChangedListener(cb) {
    metadataListener = cb;
}
/**
 * Register a listener for permission-mode changes from onChangeAppState.
 * Wired by print.ts to emit an SDK system:status message so CCR/IDE clients
 * see mode transitions in real time — regardless of which code path mutated
 * toolPermissionContext.mode (Shift+Tab, ExitPlanMode dialog, slash command,
 * bridge set_permission_mode, etc.).
 */
function setPermissionModeChangedListener(cb) {
    permissionModeListener = cb;
}
var hasPendingAction = false;
var currentState = 'idle';
function getSessionState() {
    return currentState;
}
function notifySessionStateChanged(state, details) {
    currentState = state;
    stateListener === null || stateListener === void 0 ? void 0 : stateListener(state, details);
    // Mirror details into external_metadata so GetSession carries the
    // pending-action context without proto changes. Cleared via RFC 7396
    // null on the next non-blocked transition.
    if (state === 'requires_action' && details) {
        hasPendingAction = true;
        metadataListener === null || metadataListener === void 0 ? void 0 : metadataListener({
            pending_action: details,
        });
    }
    else if (hasPendingAction) {
        hasPendingAction = false;
        metadataListener === null || metadataListener === void 0 ? void 0 : metadataListener({ pending_action: null });
    }
    // task_summary is written mid-turn by the forked summarizer; clear it at
    // idle so the next turn doesn't briefly show the previous turn's progress.
    if (state === 'idle') {
        metadataListener === null || metadataListener === void 0 ? void 0 : metadataListener({ task_summary: null });
    }
    // Mirror to the SDK event stream so non-CCR consumers (scmuxd, VS Code)
    // see the same authoritative idle/running signal the CCR bridge does.
    // 'idle' fires after heldBackResult flushes — lets scmuxd flip IDLE and
    // show the bg-task dot instead of a stuck generating spinner.
    //
    // Opt-in until CCR web + mobile clients learn to ignore this subtype in
    // their isWorking() last-message heuristics — the trailing idle event
    // currently pins them at "Running...".
    // https://anthropic.slack.com/archives/C093BJBD1CP/p1774152406752229
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_EMIT_SESSION_STATE_EVENTS)) {
        (0, sdkEventQueue_js_1.enqueueSdkEvent)({
            type: 'system',
            subtype: 'session_state_changed',
            state: state,
        });
    }
}
function notifySessionMetadataChanged(metadata) {
    metadataListener === null || metadataListener === void 0 ? void 0 : metadataListener(metadata);
}
/**
 * Fired by onChangeAppState when toolPermissionContext.mode changes.
 * Downstream listeners (CCR external_metadata PUT, SDK status stream) are
 * both wired through this single choke point so no mode-mutation path can
 * silently bypass them.
 */
function notifyPermissionModeChanged(mode) {
    permissionModeListener === null || permissionModeListener === void 0 ? void 0 : permissionModeListener(mode);
}
