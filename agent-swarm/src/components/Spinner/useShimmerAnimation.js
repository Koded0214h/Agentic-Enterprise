"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useShimmerAnimation = useShimmerAnimation;
var react_1 = require("react");
var stringWidth_js_1 = require("../../ink/stringWidth.js");
var ink_js_1 = require("../../ink.js");
function useShimmerAnimation(mode, message, isStalled) {
    var glimmerSpeed = mode === 'requesting' ? 50 : 200;
    // Pass null when stalled to unsubscribe from the clock — otherwise the
    // setInterval keeps firing at 20fps even when the shimmer isn't visible.
    // Notably, if the caller never attaches `ref` (e.g. conditional JSX),
    // useTerminalViewport stays at its initial isVisible:true and the
    // viewport-pause never kicks in, so this is the only stop mechanism.
    var _a = (0, ink_js_1.useAnimationFrame)(isStalled ? null : glimmerSpeed), ref = _a[0], time = _a[1];
    var messageWidth = (0, react_1.useMemo)(function () { return (0, stringWidth_js_1.stringWidth)(message); }, [message]);
    if (isStalled) {
        return [ref, -100];
    }
    var cyclePosition = Math.floor(time / glimmerSpeed);
    var cycleLength = messageWidth + 20;
    if (mode === 'requesting') {
        return [ref, (cyclePosition % cycleLength) - 10];
    }
    return [ref, messageWidth + 10 - (cyclePosition % cycleLength)];
}
