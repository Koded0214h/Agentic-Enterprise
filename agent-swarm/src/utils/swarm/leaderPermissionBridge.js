"use strict";
/**
 * Leader Permission Bridge
 *
 * Module-level bridge that allows the REPL to register its setToolUseConfirmQueue
 * and setToolPermissionContext functions for in-process teammates to use.
 *
 * When an in-process teammate requests permissions, it uses the standard
 * ToolUseConfirm dialog rather than the worker permission badge. This bridge
 * makes the REPL's queue setter and permission context setter accessible
 * from non-React code in the in-process runner.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerLeaderToolUseConfirmQueue = registerLeaderToolUseConfirmQueue;
exports.getLeaderToolUseConfirmQueue = getLeaderToolUseConfirmQueue;
exports.unregisterLeaderToolUseConfirmQueue = unregisterLeaderToolUseConfirmQueue;
exports.registerLeaderSetToolPermissionContext = registerLeaderSetToolPermissionContext;
exports.getLeaderSetToolPermissionContext = getLeaderSetToolPermissionContext;
exports.unregisterLeaderSetToolPermissionContext = unregisterLeaderSetToolPermissionContext;
var registeredSetter = null;
var registeredPermissionContextSetter = null;
function registerLeaderToolUseConfirmQueue(setter) {
    registeredSetter = setter;
}
function getLeaderToolUseConfirmQueue() {
    return registeredSetter;
}
function unregisterLeaderToolUseConfirmQueue() {
    registeredSetter = null;
}
function registerLeaderSetToolPermissionContext(setter) {
    registeredPermissionContextSetter = setter;
}
function getLeaderSetToolPermissionContext() {
    return registeredPermissionContextSetter;
}
function unregisterLeaderSetToolPermissionContext() {
    registeredPermissionContextSetter = null;
}
