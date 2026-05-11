"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useShowFastIconHint = useShowFastIconHint;
var react_1 = require("react");
var HINT_DISPLAY_DURATION_MS = 5000;
var hasShownThisSession = false;
/**
 * Hook to manage the /fast hint display next to the fast icon.
 * Shows the hint for 5 seconds once per session.
 */
function useShowFastIconHint(showFastIcon) {
    var _a = (0, react_1.useState)(false), showHint = _a[0], setShowHint = _a[1];
    (0, react_1.useEffect)(function () {
        if (hasShownThisSession || !showFastIcon) {
            return;
        }
        hasShownThisSession = true;
        setShowHint(true);
        var timer = setTimeout(setShowHint, HINT_DISPLAY_DURATION_MS, false);
        return function () {
            clearTimeout(timer);
            setShowHint(false);
        };
    }, [showFastIcon]);
    return showHint;
}
