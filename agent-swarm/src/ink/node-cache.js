"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pendingClears = exports.nodeCache = void 0;
exports.addPendingClear = addPendingClear;
exports.consumeAbsoluteRemovedFlag = consumeAbsoluteRemovedFlag;
exports.nodeCache = new WeakMap();
/** Rects of removed children that need clearing on next render */
exports.pendingClears = new WeakMap();
/**
 * Set when a pendingClear is added for an absolute-positioned node.
 * Signals renderer to disable blit for the next frame: the removed node
 * may have painted over non-siblings (e.g. an overlay over a ScrollBox
 * earlier in tree order), so their blits from prevScreen would restore
 * the overlay's pixels. Normal-flow removals are already handled by
 * hasRemovedChild at the parent level; only absolute positioning paints
 * cross-subtree. Reset at the start of each render.
 */
var absoluteNodeRemoved = false;
function addPendingClear(parent, rect, isAbsolute) {
    var existing = exports.pendingClears.get(parent);
    if (existing) {
        existing.push(rect);
    }
    else {
        exports.pendingClears.set(parent, [rect]);
    }
    if (isAbsolute) {
        absoluteNodeRemoved = true;
    }
}
function consumeAbsoluteRemovedFlag() {
    var had = absoluteNodeRemoved;
    absoluteNodeRemoved = false;
    return had;
}
