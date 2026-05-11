"use strict";
// Creates a function that calls one function on the first call and another
// function on the second call within a certain timeout
Object.defineProperty(exports, "__esModule", { value: true });
exports.DOUBLE_PRESS_TIMEOUT_MS = void 0;
exports.useDoublePress = useDoublePress;
var react_1 = require("react");
exports.DOUBLE_PRESS_TIMEOUT_MS = 800;
function useDoublePress(setPending, onDoublePress, onFirstPress) {
    var lastPressRef = (0, react_1.useRef)(0);
    var timeoutRef = (0, react_1.useRef)(undefined);
    var clearTimeoutSafe = (0, react_1.useCallback)(function () {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = undefined;
        }
    }, []);
    // Cleanup timeout on unmount
    (0, react_1.useEffect)(function () {
        return function () {
            clearTimeoutSafe();
        };
    }, [clearTimeoutSafe]);
    return (0, react_1.useCallback)(function () {
        var now = Date.now();
        var timeSinceLastPress = now - lastPressRef.current;
        var isDoublePress = timeSinceLastPress <= exports.DOUBLE_PRESS_TIMEOUT_MS &&
            timeoutRef.current !== undefined;
        if (isDoublePress) {
            // Double press detected
            clearTimeoutSafe();
            setPending(false);
            onDoublePress();
        }
        else {
            // First press
            onFirstPress === null || onFirstPress === void 0 ? void 0 : onFirstPress();
            setPending(true);
            // Clear any existing timeout and set new one
            clearTimeoutSafe();
            timeoutRef.current = setTimeout(function (setPending, timeoutRef) {
                setPending(false);
                timeoutRef.current = undefined;
            }, exports.DOUBLE_PRESS_TIMEOUT_MS, setPending, timeoutRef);
        }
        lastPressRef.current = now;
    }, [setPending, onDoublePress, onFirstPress, clearTimeoutSafe]);
}
