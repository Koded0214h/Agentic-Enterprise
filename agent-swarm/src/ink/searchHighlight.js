"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applySearchHighlight = applySearchHighlight;
var screen_js_1 = require("./screen.js");
/**
 * Highlight all visible occurrences of `query` in the screen buffer by
 * inverting cell styles (SGR 7). Post-render, same damage-tracking machinery
 * as applySelectionOverlay — the diff picks up highlighted cells as ordinary
 * changes, LogUpdate stays a pure diff engine.
 *
 * Case-insensitive. Handles wide characters (CJK, emoji) by building a
 * col-of-char map per row — the Nth character isn't at col N when wide chars
 * are present (each occupies 2 cells: head + SpacerTail).
 *
 * This ONLY inverts — there is no "current match" logic here. The yellow
 * current-match overlay is handled separately by applyPositionedHighlight
 * (render-to-screen.ts), which writes on top using positions scanned from
 * the target message's DOM subtree.
 *
 * Returns true if any match was highlighted (damage gate — caller forces
 * full-frame damage when true).
 */
function applySearchHighlight(screen, query, stylePool) {
    if (!query)
        return false;
    var lq = query.toLowerCase();
    var qlen = lq.length;
    var w = screen.width;
    var noSelect = screen.noSelect;
    var height = screen.height;
    var applied = false;
    for (var row = 0; row < height; row++) {
        var rowOff = row * w;
        // Build row text (already lowercased) + code-unit→cell-index map.
        // Three skip conditions, all aligned with setCellStyleId /
        // extractRowText (selection.ts):
        //   - SpacerTail: 2nd cell of a wide char, no char of its own
        //   - SpacerHead: end-of-line padding when a wide char wraps
        //   - noSelect: gutters (⎿, line numbers) — same exclusion as
        //     applySelectionOverlay. "Highlight what you see" still holds for
        //     content; gutters aren't search targets.
        // Lowercasing per-char (not on the joined string at the end) means
        // codeUnitToCell maps positions in the LOWERCASED text — U+0130
        // (Turkish İ) lowercases to 2 code units, so lowering the joined
        // string would desync indexOf positions from the map.
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
        var pos = text.indexOf(lq);
        while (pos >= 0) {
            applied = true;
            var startCi = codeUnitToCell[pos];
            var endCi = codeUnitToCell[pos + qlen - 1];
            for (var ci = startCi; ci <= endCi; ci++) {
                var col = colOf[ci];
                var cell = (0, screen_js_1.cellAtIndex)(screen, rowOff + col);
                (0, screen_js_1.setCellStyleId)(screen, col, row, stylePool.withInverse(cell.styleId));
            }
            // Non-overlapping advance (less/vim/grep/Ctrl+F). pos+1 would find
            // 'aa' at 0 AND 1 in 'aaa' → double-invert cell 1.
            pos = text.indexOf(lq, pos + qlen);
        }
    }
    return applied;
}
