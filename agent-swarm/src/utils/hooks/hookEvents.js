"use strict";
/**
 * Hook event system for broadcasting hook execution events.
 *
 * This module provides a generic event system that is separate from the
 * main message stream. Handlers can register to receive events and decide
 * what to do with them (e.g., convert to SDK messages, log, etc.).
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
exports.registerHookEventHandler = registerHookEventHandler;
exports.emitHookStarted = emitHookStarted;
exports.emitHookProgress = emitHookProgress;
exports.startHookProgressInterval = startHookProgressInterval;
exports.emitHookResponse = emitHookResponse;
exports.setAllHookEventsEnabled = setAllHookEventsEnabled;
exports.clearHookEventState = clearHookEventState;
var coreTypes_js_1 = require("src/entrypoints/sdk/coreTypes.js");
var debug_js_1 = require("../debug.js");
/**
 * Hook events that are always emitted regardless of the includeHookEvents
 * option. These are low-noise lifecycle events that were in the original
 * allowlist and are backwards-compatible.
 */
var ALWAYS_EMITTED_HOOK_EVENTS = ['SessionStart', 'Setup'];
var MAX_PENDING_EVENTS = 100;
var pendingEvents = [];
var eventHandler = null;
var allHookEventsEnabled = false;
function registerHookEventHandler(handler) {
    eventHandler = handler;
    if (handler && pendingEvents.length > 0) {
        for (var _i = 0, _a = pendingEvents.splice(0); _i < _a.length; _i++) {
            var event_1 = _a[_i];
            handler(event_1);
        }
    }
}
function emit(event) {
    if (eventHandler) {
        eventHandler(event);
    }
    else {
        pendingEvents.push(event);
        if (pendingEvents.length > MAX_PENDING_EVENTS) {
            pendingEvents.shift();
        }
    }
}
function shouldEmit(hookEvent) {
    if (ALWAYS_EMITTED_HOOK_EVENTS.includes(hookEvent)) {
        return true;
    }
    return (allHookEventsEnabled &&
        coreTypes_js_1.HOOK_EVENTS.includes(hookEvent));
}
function emitHookStarted(hookId, hookName, hookEvent) {
    if (!shouldEmit(hookEvent))
        return;
    emit({
        type: 'started',
        hookId: hookId,
        hookName: hookName,
        hookEvent: hookEvent,
    });
}
function emitHookProgress(data) {
    if (!shouldEmit(data.hookEvent))
        return;
    emit(__assign({ type: 'progress' }, data));
}
function startHookProgressInterval(params) {
    var _a;
    if (!shouldEmit(params.hookEvent))
        return function () { };
    var lastEmittedOutput = '';
    var interval = setInterval(function () {
        void params.getOutput().then(function (_a) {
            var stdout = _a.stdout, stderr = _a.stderr, output = _a.output;
            if (output === lastEmittedOutput)
                return;
            lastEmittedOutput = output;
            emitHookProgress({
                hookId: params.hookId,
                hookName: params.hookName,
                hookEvent: params.hookEvent,
                stdout: stdout,
                stderr: stderr,
                output: output,
            });
        });
    }, (_a = params.intervalMs) !== null && _a !== void 0 ? _a : 1000);
    interval.unref();
    return function () { return clearInterval(interval); };
}
function emitHookResponse(data) {
    // Always log full hook output to debug log for verbose mode debugging
    var outputToLog = data.stdout || data.stderr || data.output;
    if (outputToLog) {
        (0, debug_js_1.logForDebugging)("Hook ".concat(data.hookName, " (").concat(data.hookEvent, ") ").concat(data.outcome, ":\n").concat(outputToLog));
    }
    if (!shouldEmit(data.hookEvent))
        return;
    emit(__assign({ type: 'response' }, data));
}
/**
 * Enable emission of all hook event types (beyond SessionStart and Setup).
 * Called when the SDK `includeHookEvents` option is set or when running
 * in CLAUDE_CODE_REMOTE mode.
 */
function setAllHookEventsEnabled(enabled) {
    allHookEventsEnabled = enabled;
}
function clearHookEventState() {
    eventHandler = null;
    pendingEvents.length = 0;
    allHookEventsEnabled = false;
}
