"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lineWidth = lineWidth;
var stringWidth_js_1 = require("./stringWidth.js");
// During streaming, text grows but completed lines are immutable.
// Caching stringWidth per-line avoids re-measuring hundreds of
// unchanged lines on every token (~50x reduction in stringWidth calls).
var cache = new Map();
var MAX_CACHE_SIZE = 4096;
function lineWidth(line) {
    var cached = cache.get(line);
    if (cached !== undefined)
        return cached;
    var width = (0, stringWidth_js_1.stringWidth)(line);
    // Evict when cache grows too large (e.g. after many different responses).
    // Simple full-clear is fine — the cache repopulates in one frame.
    if (cache.size >= MAX_CACHE_SIZE) {
        cache.clear();
    }
    cache.set(line, width);
    return width;
}
