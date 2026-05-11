"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = sliceAnsi;
var ansi_tokenize_1 = require("@alcalzone/ansi-tokenize");
var stringWidth_js_1 = require("../ink/stringWidth.js");
// A code is an "end code" if its code equals its endCode (e.g., hyperlink close)
function isEndCode(code) {
    return code.code === code.endCode;
}
// Filter to only include "start codes" (not end codes)
function filterStartCodes(codes) {
    return codes.filter(function (c) { return !isEndCode(c); });
}
/**
 * Slice a string containing ANSI escape codes.
 *
 * Unlike the slice-ansi package, this properly handles OSC 8 hyperlink
 * sequences because @alcalzone/ansi-tokenize tokenizes them correctly.
 */
function sliceAnsi(str, start, end) {
    // Don't pass `end` to tokenize — it counts code units, not display cells,
    // so it drops tokens early for text with zero-width combining marks.
    var tokens = (0, ansi_tokenize_1.tokenize)(str);
    var activeCodes = [];
    var position = 0;
    var result = '';
    var include = false;
    for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
        var token = tokens_1[_i];
        // Advance by display width, not code units. Combining marks (Devanagari
        // matras, virama, diacritics) are width 0 — counting them via .length
        // advanced position past `end` early and truncated the slice. Callers
        // pass start/end in display cells (via stringWidth), so position must
        // track the same units.
        var width = token.type === 'ansi' ? 0 : token.fullWidth ? 2 : (0, stringWidth_js_1.stringWidth)(token.value);
        // Break AFTER trailing zero-width marks — a combining mark attaches to
        // the preceding base char, so "भा" (भ + ा, 1 display cell) sliced at
        // end=1 must include the ा. Breaking on position >= end BEFORE the
        // zero-width check would drop it and render भ bare. ANSI codes are
        // width 0 but must NOT be included past end (they open new style runs
        // that leak into the undo sequence), so gate on char type too. The
        // !include guard ensures empty slices (start===end) stay empty even
        // when the string starts with a zero-width char (BOM, ZWJ).
        if (end !== undefined && position >= end) {
            if (token.type === 'ansi' || width > 0 || !include)
                break;
        }
        if (token.type === 'ansi') {
            activeCodes.push(token);
            if (include) {
                // Emit all ANSI codes during the slice
                result += token.code;
            }
        }
        else {
            if (!include && position >= start) {
                // Skip leading zero-width marks at the start boundary — they belong
                // to the preceding base char in the left half. Without this, the
                // mark appears in BOTH halves: left+right ≠ original. Only applies
                // when start > 0 (otherwise there's no preceding char to own it).
                if (start > 0 && width === 0)
                    continue;
                include = true;
                // Reduce and filter to only active start codes
                activeCodes = filterStartCodes((0, ansi_tokenize_1.reduceAnsiCodes)(activeCodes));
                result = (0, ansi_tokenize_1.ansiCodesToString)(activeCodes);
            }
            if (include) {
                result += token.value;
            }
            position += width;
        }
    }
    // Only undo start codes that are still active
    var activeStartCodes = filterStartCodes((0, ansi_tokenize_1.reduceAnsiCodes)(activeCodes));
    result += (0, ansi_tokenize_1.ansiCodesToString)((0, ansi_tokenize_1.undoAnsiCodes)(activeStartCodes));
    return result;
}
