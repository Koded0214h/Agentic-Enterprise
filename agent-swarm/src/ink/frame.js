"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emptyFrame = emptyFrame;
exports.shouldClearScreen = shouldClearScreen;
var screen_js_1 = require("./screen.js");
function emptyFrame(rows, columns, stylePool, charPool, hyperlinkPool) {
    return {
        screen: (0, screen_js_1.createScreen)(0, 0, stylePool, charPool, hyperlinkPool),
        viewport: { width: columns, height: rows },
        cursor: { x: 0, y: 0, visible: true },
    };
}
/**
 * Determines whether the screen should be cleared based on the current and previous frame.
 * Returns the reason for clearing, or undefined if no clear is needed.
 *
 * Screen clearing is triggered when:
 * 1. Terminal has been resized (viewport dimensions changed) → 'resize'
 * 2. Current frame screen height exceeds available terminal rows → 'offscreen'
 * 3. Previous frame screen height exceeded available terminal rows → 'offscreen'
 */
function shouldClearScreen(prevFrame, frame) {
    var didResize = frame.viewport.height !== prevFrame.viewport.height ||
        frame.viewport.width !== prevFrame.viewport.width;
    if (didResize) {
        return 'resize';
    }
    var currentFrameOverflows = frame.screen.height >= frame.viewport.height;
    var previousFrameOverflowed = prevFrame.screen.height >= prevFrame.viewport.height;
    if (currentFrameOverflows || previousFrameOverflowed) {
        return 'offscreen';
    }
    return undefined;
}
