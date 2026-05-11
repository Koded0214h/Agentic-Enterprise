"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextPermissionMode = getNextPermissionMode;
exports.cyclePermissionMode = cyclePermissionMode;
var bun_bundle_1 = require("bun:bundle");
var debug_js_1 = require("../debug.js");
var permissionSetup_js_1 = require("./permissionSetup.js");
// Checks both the cached isAutoModeAvailable (set at startup by
// verifyAutoModeGateAccess) and the live isAutoModeGateEnabled() — these can
// diverge if the circuit breaker or settings change mid-session. The
// live check prevents transitionPermissionMode from throwing
// (permissionSetup.ts:~559), which would silently crash the shift+tab handler
// and leave the user stuck at the current mode.
function canCycleToAuto(ctx) {
    if ((0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER')) {
        var gateEnabled = (0, permissionSetup_js_1.isAutoModeGateEnabled)();
        var can = !!ctx.isAutoModeAvailable && gateEnabled;
        if (!can) {
            (0, debug_js_1.logForDebugging)("[auto-mode] canCycleToAuto=false: ctx.isAutoModeAvailable=".concat(ctx.isAutoModeAvailable, " isAutoModeGateEnabled=").concat(gateEnabled, " reason=").concat((0, permissionSetup_js_1.getAutoModeUnavailableReason)()));
        }
        return can;
    }
    return false;
}
/**
 * Determines the next permission mode when cycling through modes with Shift+Tab.
 */
function getNextPermissionMode(toolPermissionContext, _teamContext) {
    switch (toolPermissionContext.mode) {
        case 'default':
            // Ants skip acceptEdits and plan — auto mode replaces them
            if (process.env.USER_TYPE === 'ant') {
                if (toolPermissionContext.isBypassPermissionsModeAvailable) {
                    return 'bypassPermissions';
                }
                if (canCycleToAuto(toolPermissionContext)) {
                    return 'auto';
                }
                return 'default';
            }
            return 'acceptEdits';
        case 'acceptEdits':
            return 'plan';
        case 'plan':
            if (toolPermissionContext.isBypassPermissionsModeAvailable) {
                return 'bypassPermissions';
            }
            if (canCycleToAuto(toolPermissionContext)) {
                return 'auto';
            }
            return 'default';
        case 'bypassPermissions':
            if (canCycleToAuto(toolPermissionContext)) {
                return 'auto';
            }
            return 'default';
        case 'dontAsk':
            // Not exposed in UI cycle yet, but return default if somehow reached
            return 'default';
        default:
            // Covers auto (when TRANSCRIPT_CLASSIFIER is enabled) and any future modes — always fall back to default
            return 'default';
    }
}
/**
 * Computes the next permission mode and prepares the context for it.
 * Handles any context cleanup needed for the target mode (e.g., stripping
 * dangerous permissions when entering auto mode).
 *
 * @returns The next mode and the context to use (with dangerous permissions stripped if needed)
 */
function cyclePermissionMode(toolPermissionContext, teamContext) {
    var nextMode = getNextPermissionMode(toolPermissionContext, teamContext);
    return {
        nextMode: nextMode,
        context: (0, permissionSetup_js_1.transitionPermissionMode)(toolPermissionContext.mode, nextMode, toolPermissionContext),
    };
}
