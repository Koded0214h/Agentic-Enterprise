"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTimeout = useTimeout;
var react_1 = require("react");
function useTimeout(delay, resetTrigger) {
    var _a = (0, react_1.useState)(false), isElapsed = _a[0], setIsElapsed = _a[1];
    (0, react_1.useEffect)(function () {
        setIsElapsed(false);
        var timer = setTimeout(setIsElapsed, delay, true);
        return function () { return clearTimeout(timer); };
    }, [delay, resetTrigger]);
    return isElapsed;
}
