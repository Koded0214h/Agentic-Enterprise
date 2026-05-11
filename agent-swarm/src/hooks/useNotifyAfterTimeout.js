"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_INTERACTION_THRESHOLD_MS = void 0;
exports.useNotifyAfterTimeout = useNotifyAfterTimeout;
var react_1 = require("react");
var state_js_1 = require("../bootstrap/state.js");
var useTerminalNotification_js_1 = require("../ink/useTerminalNotification.js");
var notifier_js_1 = require("../services/notifier.js");
// The time threshold in milliseconds for considering an interaction "recent" (6 seconds)
exports.DEFAULT_INTERACTION_THRESHOLD_MS = 6000;
function getTimeSinceLastInteraction() {
    return Date.now() - (0, state_js_1.getLastInteractionTime)();
}
function hasRecentInteraction(threshold) {
    return getTimeSinceLastInteraction() < threshold;
}
function shouldNotify(threshold) {
    return process.env.NODE_ENV !== 'test' && !hasRecentInteraction(threshold);
}
// NOTE: User interaction tracking is now done in App.tsx's processKeysInBatch
// function, which calls updateLastInteractionTime() when any input is received.
// This avoids having a separate stdin 'data' listener that would compete with
// the main 'readable' listener and cause dropped input characters.
/**
 * Hook that manages desktop notifications after a timeout period.
 *
 * Shows a notification in two cases:
 * 1. Immediately if the app has been idle for longer than the threshold
 * 2. After the specified timeout if the user doesn't interact within that time
 *
 * @param message - The notification message to display
 * @param timeout - The timeout in milliseconds (defaults to 6000ms)
 */
function useNotifyAfterTimeout(message, notificationType) {
    var terminal = (0, useTerminalNotification_js_1.useTerminalNotification)();
    // Reset interaction time when hook is called to make sure that requests
    // that took a long time to complete don't pop up a notification right away.
    // Must be immediate because useEffect runs after Ink's render cycle has
    // already flushed; without it the timestamp stays stale and a premature
    // notification fires if the user is idle (no subsequent renders to flush).
    (0, react_1.useEffect)(function () {
        (0, state_js_1.updateLastInteractionTime)(true);
    }, []);
    (0, react_1.useEffect)(function () {
        var hasNotified = false;
        var timer = setInterval(function () {
            if (shouldNotify(exports.DEFAULT_INTERACTION_THRESHOLD_MS) && !hasNotified) {
                hasNotified = true;
                clearInterval(timer);
                void (0, notifier_js_1.sendNotification)({ message: message, notificationType: notificationType }, terminal);
            }
        }, exports.DEFAULT_INTERACTION_THRESHOLD_MS);
        return function () { return clearInterval(timer); };
    }, [message, notificationType, terminal]);
}
