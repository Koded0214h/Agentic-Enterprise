"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.widestLine = widestLine;
var line_width_cache_js_1 = require("./line-width-cache.js");
function widestLine(string) {
    var maxWidth = 0;
    var start = 0;
    while (start <= string.length) {
        var end = string.indexOf('\n', start);
        var line = end === -1 ? string.substring(start) : string.substring(start, end);
        maxWidth = Math.max(maxWidth, (0, line_width_cache_js_1.lineWidth)(line));
        if (end === -1)
            break;
        start = end + 1;
    }
    return maxWidth;
}
