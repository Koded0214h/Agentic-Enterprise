"use strict";
/**
 * Teammate mode snapshot module.
 *
 * Captures the teammate mode at session startup, following the same pattern
 * as hooksConfigSnapshot.ts. This ensures that runtime config changes don't
 * affect the teammate mode for the current session.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCliTeammateModeOverride = setCliTeammateModeOverride;
exports.getCliTeammateModeOverride = getCliTeammateModeOverride;
exports.clearCliTeammateModeOverride = clearCliTeammateModeOverride;
exports.captureTeammateModeSnapshot = captureTeammateModeSnapshot;
exports.getTeammateModeFromSnapshot = getTeammateModeFromSnapshot;
var config_js_1 = require("../../../utils/config.js");
var debug_js_1 = require("../../../utils/debug.js");
var log_js_1 = require("../../../utils/log.js");
// Module-level variable to hold the captured mode at startup
var initialTeammateMode = null;
// CLI override (set before capture if --teammate-mode is provided)
var cliTeammateModeOverride = null;
/**
 * Set the CLI override for teammate mode.
 * Must be called before captureTeammateModeSnapshot().
 */
function setCliTeammateModeOverride(mode) {
    cliTeammateModeOverride = mode;
}
/**
 * Get the current CLI override, if any.
 * Returns null if no CLI override was set.
 */
function getCliTeammateModeOverride() {
    return cliTeammateModeOverride;
}
/**
 * Clear the CLI override and update the snapshot to the new mode.
 * Called when user changes the setting in the UI, allowing their change to take effect.
 *
 * @param newMode - The new mode the user selected (passed directly to avoid race condition)
 */
function clearCliTeammateModeOverride(newMode) {
    cliTeammateModeOverride = null;
    initialTeammateMode = newMode;
    (0, debug_js_1.logForDebugging)("[TeammateModeSnapshot] CLI override cleared, new mode: ".concat(newMode));
}
/**
 * Capture the teammate mode at session startup.
 * Called early in main.tsx, after CLI args are parsed.
 * CLI override takes precedence over config.
 */
function captureTeammateModeSnapshot() {
    var _a;
    if (cliTeammateModeOverride) {
        initialTeammateMode = cliTeammateModeOverride;
        (0, debug_js_1.logForDebugging)("[TeammateModeSnapshot] Captured from CLI override: ".concat(initialTeammateMode));
    }
    else {
        var config = (0, config_js_1.getGlobalConfig)();
        initialTeammateMode = (_a = config.teammateMode) !== null && _a !== void 0 ? _a : 'auto';
        (0, debug_js_1.logForDebugging)("[TeammateModeSnapshot] Captured from config: ".concat(initialTeammateMode));
    }
}
/**
 * Get the teammate mode for this session.
 * Returns the snapshot captured at startup, ignoring any runtime config changes.
 */
function getTeammateModeFromSnapshot() {
    if (initialTeammateMode === null) {
        // This indicates an initialization bug - capture should happen in setup()
        (0, log_js_1.logError)(new Error('getTeammateModeFromSnapshot called before capture - this indicates an initialization bug'));
        captureTeammateModeSnapshot();
    }
    // Fallback to 'auto' if somehow still null (shouldn't happen, but safe)
    return initialTeammateMode !== null && initialTeammateMode !== void 0 ? initialTeammateMode : 'auto';
}
