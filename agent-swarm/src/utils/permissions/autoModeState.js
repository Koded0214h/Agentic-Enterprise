"use strict";
// Auto mode state functions — lives in its own module so callers can
// conditionally require() it on feature('TRANSCRIPT_CLASSIFIER').
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAutoModeActive = setAutoModeActive;
exports.isAutoModeActive = isAutoModeActive;
exports.setAutoModeFlagCli = setAutoModeFlagCli;
exports.getAutoModeFlagCli = getAutoModeFlagCli;
exports.setAutoModeCircuitBroken = setAutoModeCircuitBroken;
exports.isAutoModeCircuitBroken = isAutoModeCircuitBroken;
exports._resetForTesting = _resetForTesting;
var autoModeActive = false;
var autoModeFlagCli = false;
// Set by the async verifyAutoModeGateAccess check when it
// reads a fresh tengu_auto_mode_config.enabled === 'disabled' from GrowthBook.
// Used by isAutoModeGateEnabled() to block SDK/explicit re-entry after kick-out.
var autoModeCircuitBroken = false;
function setAutoModeActive(active) {
    autoModeActive = active;
}
function isAutoModeActive() {
    return autoModeActive;
}
function setAutoModeFlagCli(passed) {
    autoModeFlagCli = passed;
}
function getAutoModeFlagCli() {
    return autoModeFlagCli;
}
function setAutoModeCircuitBroken(broken) {
    autoModeCircuitBroken = broken;
}
function isAutoModeCircuitBroken() {
    return autoModeCircuitBroken;
}
function _resetForTesting() {
    autoModeActive = false;
    autoModeFlagCli = false;
    autoModeCircuitBroken = false;
}
