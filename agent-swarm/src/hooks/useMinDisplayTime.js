"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMinDisplayTime = useMinDisplayTime;
var react_1 = require("react");
/**
 * Throttles a value so each distinct value stays visible for at least `minMs`.
 * Prevents fast-cycling progress text from flickering past before it's readable.
 *
 * Unlike debounce (wait for quiet) or throttle (limit rate), this guarantees
 * each value gets its minimum screen time before being replaced.
 */
function useMinDisplayTime(value, minMs) {
    var _a = (0, react_1.useState)(value), displayed = _a[0], setDisplayed = _a[1];
    var lastShownAtRef = (0, react_1.useRef)(0);
    (0, react_1.useEffect)(function () {
        var elapsed = Date.now() - lastShownAtRef.current;
        if (elapsed >= minMs) {
            lastShownAtRef.current = Date.now();
            setDisplayed(value);
            return;
        }
        var timer = setTimeout(function (shownAtRef, setFn, v) {
            shownAtRef.current = Date.now();
            setFn(v);
        }, minMs - elapsed, lastShownAtRef, setDisplayed, value);
        return function () { return clearTimeout(timer); };
    }, [value, minMs]);
    return displayed;
}
