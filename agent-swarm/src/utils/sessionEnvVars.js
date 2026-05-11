"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionEnvVars = getSessionEnvVars;
exports.setSessionEnvVar = setSessionEnvVar;
exports.deleteSessionEnvVar = deleteSessionEnvVar;
exports.clearSessionEnvVars = clearSessionEnvVars;
/**
 * Session-scoped environment variables set via /env.
 * Applied only to spawned child processes (via bash provider env overrides),
 * not to the REPL process itself.
 */
var sessionEnvVars = new Map();
function getSessionEnvVars() {
    return sessionEnvVars;
}
function setSessionEnvVar(name, value) {
    sessionEnvVars.set(name, value);
}
function deleteSessionEnvVar(name) {
    sessionEnvVars.delete(name);
}
function clearSessionEnvVars() {
    sessionEnvVars.clear();
}
