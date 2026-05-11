"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var line_width_cache_js_1 = require("./line-width-cache.js");
// Single-pass measurement: computes both width and height in one
// iteration instead of two (widestLine + countVisualLines).
// Uses indexOf to avoid array allocation from split('\n').
function measureText(text, maxWidth) {
    if (text.length === 0) {
        return {
            width: 0,
            height: 0,
        };
    }
    // Infinite or non-positive width means no wrapping — each line is one visual line.
    // Must check before the loop since Math.ceil(w / Infinity) = 0.
    var noWrap = maxWidth <= 0 || !Number.isFinite(maxWidth);
    var height = 0;
    var width = 0;
    var start = 0;
    while (start <= text.length) {
        var end = text.indexOf('\n', start);
        var line = end === -1 ? text.substring(start) : text.substring(start, end);
        var w = (0, line_width_cache_js_1.lineWidth)(line);
        width = Math.max(width, w);
        if (noWrap) {
            height++;
        }
        else {
            height += w === 0 ? 1 : Math.ceil(w / maxWidth);
        }
        if (end === -1)
            break;
        start = end + 1;
    }
    return { width: width, height: height };
}
exports.default = measureText;
