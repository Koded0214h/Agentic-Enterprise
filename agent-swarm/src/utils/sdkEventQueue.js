"use strict";
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
exports.enqueueSdkEvent = enqueueSdkEvent;
exports.drainSdkEvents = drainSdkEvents;
exports.emitTaskTerminatedSdk = emitTaskTerminatedSdk;
var crypto_1 = require("crypto");
var state_js_1 = require("../bootstrap/state.js");
var MAX_QUEUE_SIZE = 1000;
var queue = [];
function enqueueSdkEvent(event) {
    // SDK events are only consumed (drained) in headless/streaming mode.
    // In TUI mode they would accumulate up to the cap and never be read.
    if (!(0, state_js_1.getIsNonInteractiveSession)()) {
        return;
    }
    if (queue.length >= MAX_QUEUE_SIZE) {
        queue.shift();
    }
    queue.push(event);
}
function drainSdkEvents() {
    if (queue.length === 0) {
        return [];
    }
    var events = queue.splice(0);
    return events.map(function (e) { return (__assign(__assign({}, e), { uuid: (0, crypto_1.randomUUID)(), session_id: (0, state_js_1.getSessionId)() })); });
}
/**
 * Emit a task_notification SDK event for a task reaching a terminal state.
 *
 * registerTask() always emits task_started; this is the closing bookend.
 * Call this from any exit path that sets a task terminal WITHOUT going
 * through enqueuePendingNotification-with-<task-id> (print.ts parses that
 * XML into the same SDK event, so paths that do both would double-emit).
 * Paths that suppress the XML notification (notified:true pre-set, kill
 * paths, abort branches) must call this directly so SDK consumers
 * (Scuttle's bg-task dot, VS Code subagent panel) see the task close.
 */
function emitTaskTerminatedSdk(taskId, status, opts) {
    var _a, _b;
    enqueueSdkEvent({
        type: 'system',
        subtype: 'task_notification',
        task_id: taskId,
        tool_use_id: opts === null || opts === void 0 ? void 0 : opts.toolUseId,
        status: status,
        output_file: (_a = opts === null || opts === void 0 ? void 0 : opts.outputFile) !== null && _a !== void 0 ? _a : '',
        summary: (_b = opts === null || opts === void 0 ? void 0 : opts.summary) !== null && _b !== void 0 ? _b : '',
        usage: opts === null || opts === void 0 ? void 0 : opts.usage,
    });
}
