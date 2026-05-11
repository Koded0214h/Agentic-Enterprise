"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAnimationTimer = useAnimationTimer;
exports.useInterval = useInterval;
var react_1 = require("react");
var ClockContext_js_1 = require("../components/ClockContext.js");
/**
 * Returns the clock time, updating at the given interval.
 * Subscribes as non-keepAlive — won't keep the clock alive on its own,
 * but updates whenever a keepAlive subscriber (e.g. the spinner)
 * is driving the clock.
 *
 * Use this to drive pure time-based computations (shimmer position,
 * frame index) from the shared clock.
 */
function useAnimationTimer(intervalMs) {
    var clock = (0, react_1.useContext)(ClockContext_js_1.ClockContext);
    var _a = (0, react_1.useState)(function () { var _a; return (_a = clock === null || clock === void 0 ? void 0 : clock.now()) !== null && _a !== void 0 ? _a : 0; }), time = _a[0], setTime = _a[1];
    (0, react_1.useEffect)(function () {
        if (!clock)
            return;
        var lastUpdate = clock.now();
        var onChange = function () {
            var now = clock.now();
            if (now - lastUpdate >= intervalMs) {
                lastUpdate = now;
                setTime(now);
            }
        };
        return clock.subscribe(onChange, false);
    }, [clock, intervalMs]);
    return time;
}
/**
 * Interval hook backed by the shared Clock.
 *
 * Unlike `useInterval` from `usehooks-ts` (which creates its own setInterval),
 * this piggybacks on the single shared clock so all timers consolidate into
 * one wake-up. Pass `null` for intervalMs to pause.
 */
function useInterval(callback, intervalMs) {
    var callbackRef = (0, react_1.useRef)(callback);
    callbackRef.current = callback;
    var clock = (0, react_1.useContext)(ClockContext_js_1.ClockContext);
    (0, react_1.useEffect)(function () {
        if (!clock || intervalMs === null)
            return;
        var lastUpdate = clock.now();
        var onChange = function () {
            var now = clock.now();
            if (now - lastUpdate >= intervalMs) {
                lastUpdate = now;
                callbackRef.current();
            }
        };
        return clock.subscribe(onChange, false);
    }, [clock, intervalMs]);
}
