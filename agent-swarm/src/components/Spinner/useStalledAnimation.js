"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useStalledAnimation = useStalledAnimation;
var react_1 = require("react");
// Hook to handle the transition to red when tokens stop flowing.
// Driven by the parent's animation clock time instead of independent intervals,
// so it slows down when the terminal is blurred.
function useStalledAnimation(time, currentResponseLength, hasActiveTools, reducedMotion) {
    if (hasActiveTools === void 0) { hasActiveTools = false; }
    if (reducedMotion === void 0) { reducedMotion = false; }
    var lastTokenTime = (0, react_1.useRef)(time);
    var lastResponseLength = (0, react_1.useRef)(currentResponseLength);
    var mountTime = (0, react_1.useRef)(time);
    var stalledIntensityRef = (0, react_1.useRef)(0);
    var lastSmoothTime = (0, react_1.useRef)(time);
    // Reset timer when new tokens arrive (check actual length change)
    if (currentResponseLength > lastResponseLength.current) {
        lastTokenTime.current = time;
        lastResponseLength.current = currentResponseLength;
        stalledIntensityRef.current = 0;
        lastSmoothTime.current = time;
    }
    // Derive time since last token from animation clock
    var timeSinceLastToken;
    if (hasActiveTools) {
        timeSinceLastToken = 0;
        lastTokenTime.current = time;
    }
    else if (currentResponseLength > 0) {
        timeSinceLastToken = time - lastTokenTime.current;
    }
    else {
        timeSinceLastToken = time - mountTime.current;
    }
    // Calculate stalled intensity based on time since last token
    // Start showing red after 3 seconds of no new tokens (only when no tools are active)
    var isStalled = timeSinceLastToken > 3000 && !hasActiveTools;
    var intensity = isStalled
        ? Math.min((timeSinceLastToken - 3000) / 2000, 1) // Fade over 2 seconds
        : 0;
    // Smooth intensity transition driven by animation frame ticks
    if (!reducedMotion && (intensity > 0 || stalledIntensityRef.current > 0)) {
        var dt = time - lastSmoothTime.current;
        if (dt >= 50) {
            var steps = Math.floor(dt / 50);
            var current = stalledIntensityRef.current;
            for (var i = 0; i < steps; i++) {
                var diff = intensity - current;
                if (Math.abs(diff) < 0.01) {
                    current = intensity;
                    break;
                }
                current += diff * 0.1;
            }
            stalledIntensityRef.current = current;
            lastSmoothTime.current = time;
        }
    }
    else {
        stalledIntensityRef.current = intensity;
        lastSmoothTime.current = time;
    }
    // When reducedMotion is enabled, use instant intensity change
    var effectiveIntensity = reducedMotion
        ? intensity
        : stalledIntensityRef.current;
    return { isStalled: isStalled, stalledIntensity: effectiveIntensity };
}
