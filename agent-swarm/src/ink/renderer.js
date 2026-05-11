"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createRenderer;
var debug_js_1 = require("src/utils/debug.js");
var dom_js_1 = require("./dom.js");
var node_cache_js_1 = require("./node-cache.js");
var output_js_1 = require("./output.js");
var render_node_to_output_js_1 = require("./render-node-to-output.js");
var screen_js_1 = require("./screen.js");
function createRenderer(node, stylePool) {
    // Reuse Output across frames so charCache (tokenize + grapheme clustering)
    // persists — most lines don't change between renders.
    var output;
    return function (options) {
        var _a, _b;
        var frontFrame = options.frontFrame, backFrame = options.backFrame, isTTY = options.isTTY, terminalWidth = options.terminalWidth, terminalRows = options.terminalRows;
        var prevScreen = frontFrame.screen;
        var backScreen = backFrame.screen;
        // Read pools from the back buffer's screen — pools may be replaced
        // between frames (generational reset), so we can't capture them in the closure
        var charPool = backScreen.charPool;
        var hyperlinkPool = backScreen.hyperlinkPool;
        // Return empty frame if yoga node doesn't exist or layout hasn't been computed yet.
        // getComputedHeight() returns NaN before calculateLayout() is called.
        // Also check for invalid dimensions (negative, Infinity) that would cause RangeError
        // when creating arrays.
        var computedHeight = (_a = node.yogaNode) === null || _a === void 0 ? void 0 : _a.getComputedHeight();
        var computedWidth = (_b = node.yogaNode) === null || _b === void 0 ? void 0 : _b.getComputedWidth();
        var hasInvalidHeight = computedHeight === undefined ||
            !Number.isFinite(computedHeight) ||
            computedHeight < 0;
        var hasInvalidWidth = computedWidth === undefined ||
            !Number.isFinite(computedWidth) ||
            computedWidth < 0;
        if (!node.yogaNode || hasInvalidHeight || hasInvalidWidth) {
            // Log to help diagnose root cause (visible with --debug flag)
            if (node.yogaNode && (hasInvalidHeight || hasInvalidWidth)) {
                (0, debug_js_1.logForDebugging)("Invalid yoga dimensions: width=".concat(computedWidth, ", height=").concat(computedHeight, ", ") +
                    "childNodes=".concat(node.childNodes.length, ", terminalWidth=").concat(terminalWidth, ", terminalRows=").concat(terminalRows));
            }
            return {
                screen: (0, screen_js_1.createScreen)(terminalWidth, 0, stylePool, charPool, hyperlinkPool),
                viewport: { width: terminalWidth, height: terminalRows },
                cursor: { x: 0, y: 0, visible: true },
            };
        }
        var width = Math.floor(node.yogaNode.getComputedWidth());
        var yogaHeight = Math.floor(node.yogaNode.getComputedHeight());
        // Alt-screen: the screen buffer IS the alt buffer — always exactly
        // terminalRows tall. <AlternateScreen> wraps children in <Box
        // height={rows} flexShrink={0}>, so yogaHeight should equal
        // terminalRows. But if something renders as a SIBLING of that Box
        // (bug: MessageSelector was outside <FullscreenLayout>), yogaHeight
        // exceeds rows and every assumption below (viewport +1 hack, cursor.y
        // clamp, log-update's heightDelta===0 fast path) breaks, desyncing
        // virtual/physical cursors. Clamping here enforces the invariant:
        // overflow writes land at y >= screen.height and setCellAt drops
        // them. The sibling is invisible (obvious, easy to find) instead of
        // corrupting the whole terminal.
        var height = options.altScreen ? terminalRows : yogaHeight;
        if (options.altScreen && yogaHeight > terminalRows) {
            (0, debug_js_1.logForDebugging)("alt-screen: yoga height ".concat(yogaHeight, " > terminalRows ").concat(terminalRows, " \u2014 ") +
                "something is rendering outside <AlternateScreen>. Overflow clipped.", { level: 'warn' });
        }
        var screen = backScreen !== null && backScreen !== void 0 ? backScreen : (0, screen_js_1.createScreen)(width, height, stylePool, charPool, hyperlinkPool);
        if (output) {
            output.reset(width, height, screen);
        }
        else {
            output = new output_js_1.default({ width: width, height: height, stylePool: stylePool, screen: screen });
        }
        (0, render_node_to_output_js_1.resetLayoutShifted)();
        (0, render_node_to_output_js_1.resetScrollHint)();
        (0, render_node_to_output_js_1.resetScrollDrainNode)();
        // prevFrameContaminated: selection overlay mutated the returned screen
        // buffer post-render (in ink.tsx), resetFramesForAltScreen() replaced it
        // with blanks, or forceRedraw() reset it to 0×0. Blit on the NEXT frame
        // would copy stale inverted cells / blanks / nothing. When clean, blit
        // restores the O(unchanged) fast path for steady-state frames (spinner
        // tick, text stream).
        // Removing an absolute-positioned node poisons prevScreen: it may
        // have painted over non-siblings (e.g. an overlay over a ScrollBox
        // earlier in tree order), so their blits would restore the removed
        // node's pixels. hasRemovedChild only shields direct siblings.
        // Normal-flow removals don't paint cross-subtree and are fine.
        var absoluteRemoved = (0, node_cache_js_1.consumeAbsoluteRemovedFlag)();
        (0, render_node_to_output_js_1.default)(node, output, {
            prevScreen: absoluteRemoved || options.prevFrameContaminated
                ? undefined
                : prevScreen,
        });
        var renderedScreen = output.get();
        // Drain continuation: render cleared scrollbox.dirty, so next frame's
        // root blit would skip the subtree. markDirty walks ancestors so the
        // next frame descends. Done AFTER render so the clear-dirty at the end
        // of renderNodeToOutput doesn't overwrite this.
        var drainNode = (0, render_node_to_output_js_1.getScrollDrainNode)();
        if (drainNode)
            (0, dom_js_1.markDirty)(drainNode);
        return {
            scrollHint: options.altScreen ? (0, render_node_to_output_js_1.getScrollHint)() : null,
            scrollDrainPending: drainNode !== null,
            screen: renderedScreen,
            viewport: {
                width: terminalWidth,
                // Alt screen: fake viewport.height = rows + 1 so that
                // shouldClearScreen()'s `screen.height >= viewport.height` check
                // (which treats exactly-filling content as "overflows" for
                // scrollback purposes) never fires. Alt-screen content is always
                // exactly `rows` tall (via <Box height={rows}>) but never
                // scrolls — the cursor.y clamp below keeps the cursor-restore
                // from emitting an LF. With the standard diff path, every frame
                // is incremental; no fullResetSequence_CAUSES_FLICKER.
                height: options.altScreen ? terminalRows + 1 : terminalRows,
            },
            cursor: {
                x: 0,
                // In the alt screen, keep the cursor inside the viewport. When
                // screen.height === terminalRows exactly (content fills the alt
                // screen), cursor.y = screen.height would trigger log-update's
                // cursor-restore LF at the last row, scrolling one row off the top
                // of the alt buffer and desyncing the diff's cursor model. The
                // cursor is hidden so its position only matters for diff coords.
                y: options.altScreen
                    ? Math.max(0, Math.min(screen.height, terminalRows) - 1)
                    : screen.height,
                // Hide cursor when there's dynamic output to render (only in TTY mode)
                visible: !isTTY || screen.height === 0,
            },
        };
    };
}
