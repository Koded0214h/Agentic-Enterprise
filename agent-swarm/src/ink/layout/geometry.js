"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZERO_EDGES = void 0;
exports.edges = edges;
exports.addEdges = addEdges;
exports.resolveEdges = resolveEdges;
exports.unionRect = unionRect;
exports.clampRect = clampRect;
exports.withinBounds = withinBounds;
exports.clamp = clamp;
function edges(a, b, c, d) {
    if (b === undefined) {
        return { top: a, right: a, bottom: a, left: a };
    }
    if (c === undefined) {
        return { top: a, right: b, bottom: a, left: b };
    }
    return { top: a, right: b, bottom: c, left: d };
}
/** Add two edge values */
function addEdges(a, b) {
    return {
        top: a.top + b.top,
        right: a.right + b.right,
        bottom: a.bottom + b.bottom,
        left: a.left + b.left,
    };
}
/** Zero edges constant */
exports.ZERO_EDGES = { top: 0, right: 0, bottom: 0, left: 0 };
/** Convert partial edges to full edges with defaults */
function resolveEdges(partial) {
    var _a, _b, _c, _d;
    return {
        top: (_a = partial === null || partial === void 0 ? void 0 : partial.top) !== null && _a !== void 0 ? _a : 0,
        right: (_b = partial === null || partial === void 0 ? void 0 : partial.right) !== null && _b !== void 0 ? _b : 0,
        bottom: (_c = partial === null || partial === void 0 ? void 0 : partial.bottom) !== null && _c !== void 0 ? _c : 0,
        left: (_d = partial === null || partial === void 0 ? void 0 : partial.left) !== null && _d !== void 0 ? _d : 0,
    };
}
function unionRect(a, b) {
    var minX = Math.min(a.x, b.x);
    var minY = Math.min(a.y, b.y);
    var maxX = Math.max(a.x + a.width, b.x + b.width);
    var maxY = Math.max(a.y + a.height, b.y + b.height);
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}
function clampRect(rect, size) {
    var minX = Math.max(0, rect.x);
    var minY = Math.max(0, rect.y);
    var maxX = Math.min(size.width - 1, rect.x + rect.width - 1);
    var maxY = Math.min(size.height - 1, rect.y + rect.height - 1);
    return {
        x: minX,
        y: minY,
        width: Math.max(0, maxX - minX + 1),
        height: Math.max(0, maxY - minY + 1),
    };
}
function withinBounds(size, point) {
    return (point.x >= 0 &&
        point.y >= 0 &&
        point.x < size.width &&
        point.y < size.height);
}
function clamp(value, min, max) {
    if (min !== undefined && value < min)
        return min;
    if (max !== undefined && value > max)
        return max;
    return value;
}
