"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTerminalViewport = useTerminalViewport;
var react_1 = require("react");
var TerminalSizeContext_js_1 = require("../components/TerminalSizeContext.js");
/**
 * Hook to detect if a component is within the terminal viewport.
 *
 * Returns a callback ref and a viewport entry object.
 * Attach the ref to the component you want to track.
 *
 * The entry is updated during the layout phase (useLayoutEffect) so callers
 * always read fresh values during render. Visibility changes do NOT trigger
 * re-renders on their own — callers that re-render for other reasons (e.g.
 * animation ticks, state changes) will pick up the latest value naturally.
 * This avoids infinite update loops when combined with other layout effects
 * that also call setState.
 *
 * @example
 * const [ref, entry] = useTerminalViewport()
 * return <Box ref={ref}><Animation enabled={entry.isVisible}>...</Animation></Box>
 */
function useTerminalViewport() {
    var terminalSize = (0, react_1.useContext)(TerminalSizeContext_js_1.TerminalSizeContext);
    var elementRef = (0, react_1.useRef)(null);
    var entryRef = (0, react_1.useRef)({ isVisible: true });
    var setElement = (0, react_1.useCallback)(function (el) {
        elementRef.current = el;
    }, []);
    // Runs on every render because yoga layout values can change
    // without React being aware. Only updates the ref — no setState
    // to avoid cascading re-renders during the commit phase.
    // Walks the DOM ancestor chain fresh each time to avoid holding stale
    // references after yoga tree rebuilds.
    (0, react_1.useLayoutEffect)(function () {
        var element = elementRef.current;
        if (!(element === null || element === void 0 ? void 0 : element.yogaNode) || !terminalSize) {
            return;
        }
        var height = element.yogaNode.getComputedHeight();
        var rows = terminalSize.rows;
        // Walk the DOM parent chain (not yoga.getParent()) so we can detect
        // scroll containers and subtract their scrollTop. Yoga computes layout
        // positions without scroll offset — scrollTop is applied at render time.
        // Without this, an element inside a ScrollBox whose yoga position exceeds
        // terminalRows would be considered offscreen even when scrolled into view
        // (e.g., the spinner in fullscreen mode after enough messages accumulate).
        var absoluteTop = element.yogaNode.getComputedTop();
        var parent = element.parentNode;
        var root = element.yogaNode;
        while (parent) {
            if (parent.yogaNode) {
                absoluteTop += parent.yogaNode.getComputedTop();
                root = parent.yogaNode;
            }
            // scrollTop is only ever set on scroll containers (by ScrollBox + renderer).
            // Non-scroll nodes have undefined scrollTop → falsy fast-path.
            if (parent.scrollTop)
                absoluteTop -= parent.scrollTop;
            parent = parent.parentNode;
        }
        // Only the root's height matters
        var screenHeight = root.getComputedHeight();
        var bottom = absoluteTop + height;
        // When content overflows the viewport (screenHeight > rows), the
        // cursor-restore at frame end scrolls one extra row into scrollback.
        // log-update.ts accounts for this with scrollbackRows = viewportY + 1.
        // We must match, otherwise an element at the boundary is considered
        // "visible" here (animation keeps ticking) but its row is treated as
        // scrollback by log-update (content change → full reset → flicker).
        var cursorRestoreScroll = screenHeight > rows ? 1 : 0;
        var viewportY = Math.max(0, screenHeight - rows) + cursorRestoreScroll;
        var viewportBottom = viewportY + rows;
        var visible = bottom > viewportY && absoluteTop < viewportBottom;
        if (visible !== entryRef.current.isVisible) {
            entryRef.current = { isVisible: visible };
        }
    });
    return [setElement, entryRef.current];
}
