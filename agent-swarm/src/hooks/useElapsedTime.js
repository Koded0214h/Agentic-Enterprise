"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useElapsedTime = useElapsedTime;
var react_1 = require("react");
var format_js_1 = require("../utils/format.js");
/**
 * Hook that returns formatted elapsed time since startTime.
 * Uses useSyncExternalStore with interval-based updates for efficiency.
 *
 * @param startTime - Unix timestamp in ms
 * @param isRunning - Whether to actively update the timer
 * @param ms - How often should we trigger updates?
 * @param pausedMs - Total paused duration to subtract
 * @param endTime - If set, freezes the duration at this timestamp (for
 *   terminal tasks). Without this, viewing a 2-min task 30 min after
 *   completion would show "32m".
 * @returns Formatted duration string (e.g., "1m 23s")
 */
function useElapsedTime(startTime, isRunning, ms, pausedMs, endTime) {
    if (ms === void 0) { ms = 1000; }
    if (pausedMs === void 0) { pausedMs = 0; }
    var get = function () {
        return (0, format_js_1.formatDuration)(Math.max(0, (endTime !== null && endTime !== void 0 ? endTime : Date.now()) - startTime - pausedMs));
    };
    var subscribe = (0, react_1.useCallback)(function (notify) {
        if (!isRunning)
            return function () { };
        var interval = setInterval(notify, ms);
        return function () { return clearInterval(interval); };
    }, [isRunning, ms]);
    return (0, react_1.useSyncExternalStore)(subscribe, get, get);
}
