"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderToScreen = renderToScreen;
exports.scanPositions = scanPositions;
exports.applyPositionedHighlight = applyPositionedHighlight;
var noop_js_1 = require("lodash-es/noop.js");
var constants_js_1 = require("react-reconciler/constants.js");
var debug_js_1 = require("../utils/debug.js");
var dom_js_1 = require("./dom.js");
var focus_js_1 = require("./focus.js");
var output_js_1 = require("./output.js");
var reconciler_js_1 = require("./reconciler.js");
var render_node_to_output_js_1 = require("./render-node-to-output.js");
var screen_js_1 = require("./screen.js");
// Shared across calls. Pools accumulate style/char interns — reusing them
// means later calls hit cache more. Root/container reuse saves the
// createContainer cost (~1ms). LegacyRoot: all work sync, no scheduling —
// ConcurrentRoot's scheduler backlog leaks across roots via flushSyncWork.
var root;
var container;
var stylePool;
var charPool;
var hyperlinkPool;
var output;
var timing = { reconcile: 0, yoga: 0, paint: 0, scan: 0, calls: 0 };
var LOG_EVERY = 20;
/** Render a React element (wrapped in all contexts the component needs —
 *  caller's job) to an isolated Screen buffer at the given width. Returns
 *  the Screen + natural height (from yoga). Used for search: render ONE
 *  message, scan its Screen for the query, get exact (row, col) positions.
 *
 *  ~1-3ms per call (yoga alloc + calculateLayout + paint). The
 *  flushSyncWork cross-root leak measured ~0.0003ms/call growth — fine
 *  for on-demand single-message rendering, pathological for render-all-
 *  8k-upfront. Cache per (msg, query, width) upstream.
 *
 *  Unmounts between calls. Root/container/pools persist for reuse. */
function renderToScreen(el, width) {
    var _a, _b, _c, _d;
    if (!root) {
        root = (0, dom_js_1.createNode)('ink-root');
        root.focusManager = new focus_js_1.FocusManager(function () { return false; });
        stylePool = new screen_js_1.StylePool();
        charPool = new screen_js_1.CharPool();
        hyperlinkPool = new screen_js_1.HyperlinkPool();
        // @ts-expect-error react-reconciler 0.33 takes 10 args; @types says 11
        container = reconciler_js_1.default.createContainer(root, constants_js_1.LegacyRoot, null, false, null, 'search-render', noop_js_1.default, noop_js_1.default, noop_js_1.default, noop_js_1.default);
    }
    var t0 = performance.now();
    // @ts-expect-error updateContainerSync exists but not in @types
    reconciler_js_1.default.updateContainerSync(el, container, null, noop_js_1.default);
    // @ts-expect-error flushSyncWork exists but not in @types
    reconciler_js_1.default.flushSyncWork();
    var t1 = performance.now();
    // Yoga layout. Root might not have a yogaNode if the tree is empty.
    (_a = root.yogaNode) === null || _a === void 0 ? void 0 : _a.setWidth(width);
    (_b = root.yogaNode) === null || _b === void 0 ? void 0 : _b.calculateLayout(width);
    var height = Math.ceil((_d = (_c = root.yogaNode) === null || _c === void 0 ? void 0 : _c.getComputedHeight()) !== null && _d !== void 0 ? _d : 0);
    var t2 = performance.now();
    // Paint to a fresh Screen. Width = given, height = yoga's natural.
    // No alt-screen, no prevScreen (every call is fresh).
    var screen = (0, screen_js_1.createScreen)(width, Math.max(1, height), // avoid 0-height Screen (createScreen may choke)
    stylePool, charPool, hyperlinkPool);
    if (!output) {
        output = new output_js_1.default({ width: width, height: height, stylePool: stylePool, screen: screen });
    }
    else {
        output.reset(width, height, screen);
    }
    (0, render_node_to_output_js_1.resetLayoutShifted)();
    (0, render_node_to_output_js_1.default)(root, output, { prevScreen: undefined });
    // renderNodeToOutput queues writes into Output; .get() flushes the
    // queue into the Screen's cell arrays. Without this the screen is
    // blank (constructor-zero).
    var rendered = output.get();
    var t3 = performance.now();
    // Unmount so next call gets a fresh tree. Leaves root/container/pools.
    // @ts-expect-error updateContainerSync exists but not in @types
    reconciler_js_1.default.updateContainerSync(null, container, null, noop_js_1.default);
    // @ts-expect-error flushSyncWork exists but not in @types
    reconciler_js_1.default.flushSyncWork();
    timing.reconcile += t1 - t0;
    timing.yoga += t2 - t1;
    timing.paint += t3 - t2;
    if (++timing.calls % LOG_EVERY === 0) {
        var total = timing.reconcile + timing.yoga + timing.paint + timing.scan;
        (0, debug_js_1.logForDebugging)("renderToScreen: ".concat(timing.calls, " calls \u00B7 ") +
            "reconcile=".concat(timing.reconcile.toFixed(1), "ms yoga=").concat(timing.yoga.toFixed(1), "ms ") +
            "paint=".concat(timing.paint.toFixed(1), "ms scan=").concat(timing.scan.toFixed(1), "ms \u00B7 ") +
            "total=".concat(total.toFixed(1), "ms \u00B7 avg ").concat((total / timing.calls).toFixed(2), "ms/call"));
    }
    return { screen: rendered, height: height };
}
/** Scan a Screen buffer for all occurrences of query. Returns positions
 *  relative to the buffer (row 0 = buffer top). Same cell-skip logic as
 *  applySearchHighlight (SpacerTail/SpacerHead/noSelect) so positions
 *  match what the overlay highlight would find. Case-insensitive.
 *
 *  For the side-render use: this Screen is the FULL message (natural
 *  height, not viewport-clipped). Positions are stable — to highlight
 *  on the real screen, add the message's screen offset (lo). */
function scanPositions(screen, query) {
    var lq = query.toLowerCase();
    if (!lq)
        return [];
    var qlen = lq.length;
    var w = screen.width;
    var h = screen.height;
    var noSelect = screen.noSelect;
    var positions = [];
    var t0 = performance.now();
    for (var row = 0; row < h; row++) {
        var rowOff = row * w;
        // Same text-build as applySearchHighlight. Keep in sync — or extract
        // to a shared helper (TODO once both are stable). codeUnitToCell
        // maps indexOf positions (code units in the LOWERCASED text) to cell
        // indices in colOf — surrogate pairs (emoji) and multi-unit lowercase
        // (Turkish İ → i + U+0307) make text.length > colOf.length.
        var text = '';
        var colOf = [];
        var codeUnitToCell = [];
        for (var col = 0; col < w; col++) {
            var idx = rowOff + col;
            var cell = (0, screen_js_1.cellAtIndex)(screen, idx);
            if (cell.width === 2 /* CellWidth.SpacerTail */ ||
                cell.width === 3 /* CellWidth.SpacerHead */ ||
                noSelect[idx] === 1) {
                continue;
            }
            var lc = cell.char.toLowerCase();
            var cellIdx = colOf.length;
            for (var i = 0; i < lc.length; i++) {
                codeUnitToCell.push(cellIdx);
            }
            text += lc;
            colOf.push(col);
        }
        // Non-overlapping — same advance as applySearchHighlight.
        var pos = text.indexOf(lq);
        while (pos >= 0) {
            var startCi = codeUnitToCell[pos];
            var endCi = codeUnitToCell[pos + qlen - 1];
            var col = colOf[startCi];
            var endCol = colOf[endCi] + 1;
            positions.push({ row: row, col: col, len: endCol - col });
            pos = text.indexOf(lq, pos + qlen);
        }
    }
    timing.scan += performance.now() - t0;
    return positions;
}
/** Write CURRENT (yellow+bold+underline) at positions[currentIdx] +
 *  rowOffset. OTHER positions are NOT styled here — the scan-highlight
 *  (applySearchHighlight with null hint) does inverse for all visible
 *  matches, including these. Two-layer: scan = 'you could go here',
 *  position = 'you ARE here'. Writing inverse again here would be a
 *  no-op (withInverse idempotent) but wasted work.
 *
 *  Positions are message-relative (row 0 = message top). rowOffset =
 *  message's current screen-top (lo). Clips outside [0, height). */
function applyPositionedHighlight(screen, stylePool, positions, rowOffset, currentIdx) {
    if (currentIdx < 0 || currentIdx >= positions.length)
        return false;
    var p = positions[currentIdx];
    var row = p.row + rowOffset;
    if (row < 0 || row >= screen.height)
        return false;
    var transform = function (id) { return stylePool.withCurrentMatch(id); };
    var rowOff = row * screen.width;
    for (var col = p.col; col < p.col + p.len; col++) {
        if (col < 0 || col >= screen.width)
            continue;
        var cell = (0, screen_js_1.cellAtIndex)(screen, rowOff + col);
        (0, screen_js_1.setCellStyleId)(screen, col, row, transform(cell.styleId));
    }
    return true;
}
