"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAnimationFrame = useAnimationFrame;
var react_1 = require("react");
var ClockContext_js_1 = require("../components/ClockContext.js");
var use_terminal_viewport_js_1 = require("./use-terminal-viewport.js");
/**
 * Hook for synchronized animations that pause when offscreen.
 *
 * Returns a ref to attach to the animated element and the current animation time.
 * All instances share the same clock, so animations stay in sync.
 * The clock only runs when at least one keepAlive subscriber exists.
 *
 * Pass `null` to pause — unsubscribes from the clock so no ticks fire.
 * Time freezes at the last value and resumes from the current clock time
 * when a number is passed again.
 *
 * @param intervalMs - How often to update, or null to pause
 * @returns [ref, time] - Ref to attach to element, elapsed time in ms
 *
 * @example
 * function Spinner() {
 *   const [ref, time] = useAnimationFrame(120)
 *   const frame = Math.floor(time / 120) % FRAMES.length
 *   return <Box ref={ref}>{FRAMES[frame]}</Box>
 * }
 *
 * The clock automatically slows when the terminal is blurred,
 * so consumers don't need to handle focus state.
 */
function useAnimationFrame(intervalMs) {
    if (intervalMs === void 0) { intervalMs = 16; }
    var clock = (0, react_1.useContext)(ClockContext_js_1.ClockContext);
    var _a = (0, use_terminal_viewport_js_1.useTerminalViewport)(), viewportRef = _a[0], isVisible = _a[1].isVisible;
    var _b = (0, react_1.useState)(function () { var _a; return (_a = clock === null || clock === void 0 ? void 0 : clock.now()) !== null && _a !== void 0 ? _a : 0; }), time = _b[0], setTime = _b[1];
    var active = isVisible && intervalMs !== null;
    (0, react_1.useEffect)(function () {
        if (!clock || !active)
            return;
        var lastUpdate = clock.now();
        var onChange = function () {
            var now = clock.now();
            if (now - lastUpdate >= intervalMs) {
                lastUpdate = now;
                setTime(now);
            }
        };
        // keepAlive: true — visible animations drive the clock
        return clock.subscribe(onChange, true);
    }, [clock, intervalMs, active]);
    return [viewportRef, time];
}
