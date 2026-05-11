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
exports.collapseHookSummaries = collapseHookSummaries;
function isLabeledHookSummary(msg) {
    return (msg.type === 'system' &&
        msg.subtype === 'stop_hook_summary' &&
        msg.hookLabel !== undefined);
}
/**
 * Collapses consecutive hook summary messages with the same hookLabel
 * (e.g. PostToolUse) into a single summary. This happens when parallel
 * tool calls each emit their own hook summary.
 */
function collapseHookSummaries(messages) {
    var result = [];
    var i = 0;
    while (i < messages.length) {
        var msg = messages[i];
        if (isLabeledHookSummary(msg)) {
            var label = msg.hookLabel;
            var group = [];
            while (i < messages.length) {
                var next = messages[i];
                if (!isLabeledHookSummary(next) || next.hookLabel !== label)
                    break;
                group.push(next);
                i++;
            }
            if (group.length === 1) {
                result.push(msg);
            }
            else {
                result.push(__assign(__assign({}, msg), { hookCount: group.reduce(function (sum, m) { return sum + m.hookCount; }, 0), hookInfos: group.flatMap(function (m) { return m.hookInfos; }), hookErrors: group.flatMap(function (m) { return m.hookErrors; }), preventedContinuation: group.some(function (m) { return m.preventedContinuation; }), hasOutput: group.some(function (m) { return m.hasOutput; }), 
                    // Parallel tool calls' hooks overlap; max is closest to wall-clock.
                    totalDurationMs: Math.max.apply(Math, group.map(function (m) { var _a; return (_a = m.totalDurationMs) !== null && _a !== void 0 ? _a : 0; })) }));
            }
        }
        else {
            result.push(msg);
            i++;
        }
    }
    return result;
}
