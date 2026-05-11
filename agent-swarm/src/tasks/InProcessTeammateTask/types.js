"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEAMMATE_MESSAGES_UI_CAP = void 0;
exports.isInProcessTeammateTask = isInProcessTeammateTask;
exports.appendCappedMessage = appendCappedMessage;
function isInProcessTeammateTask(task) {
    return (typeof task === 'object' &&
        task !== null &&
        'type' in task &&
        task.type === 'in_process_teammate');
}
/**
 * Cap on the number of messages kept in task.messages (the AppState UI mirror).
 *
 * task.messages exists purely for the zoomed transcript dialog, which only
 * needs recent context. The full conversation lives in the local allMessages
 * array (inProcessRunner) and on disk at the agent transcript path.
 *
 * BQ analysis (round 9, 2026-03-20) showed ~20MB RSS per agent at 500+ turn
 * sessions and ~125MB per concurrent agent in swarm bursts. Whale session
 * 9a990de8 launched 292 agents in 2 minutes and reached 36.8GB. The dominant
 * cost is this array holding a second full copy of every message.
 */
exports.TEAMMATE_MESSAGES_UI_CAP = 50;
/**
 * Append an item to a message array, capping the result at
 * TEAMMATE_MESSAGES_UI_CAP entries by dropping the oldest. Always returns
 * a new array (AppState immutability).
 */
function appendCappedMessage(prev, item) {
    if (prev === undefined || prev.length === 0) {
        return [item];
    }
    if (prev.length >= exports.TEAMMATE_MESSAGES_UI_CAP) {
        var next = prev.slice(-(exports.TEAMMATE_MESSAGES_UI_CAP - 1));
        next.push(item);
        return next;
    }
    return __spreadArray(__spreadArray([], prev, true), [item], false);
}
