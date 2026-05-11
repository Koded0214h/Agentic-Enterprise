"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hitTest = hitTest;
exports.dispatchClick = dispatchClick;
exports.dispatchHover = dispatchHover;
var click_event_js_1 = require("./events/click-event.js");
var node_cache_js_1 = require("./node-cache.js");
/**
 * Find the deepest DOM element whose rendered rect contains (col, row).
 *
 * Uses the nodeCache populated by renderNodeToOutput — rects are in screen
 * coordinates with all offsets (including scrollTop translation) already
 * applied. Children are traversed in reverse so later siblings (painted on
 * top) win. Nodes not in nodeCache (not rendered this frame, or lacking a
 * yogaNode) are skipped along with their subtrees.
 *
 * Returns the hit node even if it has no onClick — dispatchClick walks up
 * via parentNode to find handlers.
 */
function hitTest(node, col, row) {
    var rect = node_cache_js_1.nodeCache.get(node);
    if (!rect)
        return null;
    if (col < rect.x ||
        col >= rect.x + rect.width ||
        row < rect.y ||
        row >= rect.y + rect.height) {
        return null;
    }
    // Later siblings paint on top; reversed traversal returns topmost hit.
    for (var i = node.childNodes.length - 1; i >= 0; i--) {
        var child = node.childNodes[i];
        if (child.nodeName === '#text')
            continue;
        var hit = hitTest(child, col, row);
        if (hit)
            return hit;
    }
    return node;
}
/**
 * Hit-test the root at (col, row) and bubble a ClickEvent from the deepest
 * containing node up through parentNode. Only nodes with an onClick handler
 * fire. Stops when a handler calls stopImmediatePropagation(). Returns
 * true if at least one onClick handler fired.
 */
function dispatchClick(root, col, row, cellIsBlank) {
    var _a, _b;
    if (cellIsBlank === void 0) { cellIsBlank = false; }
    var target = (_a = hitTest(root, col, row)) !== null && _a !== void 0 ? _a : undefined;
    if (!target)
        return false;
    // Click-to-focus: find the closest focusable ancestor and focus it.
    // root is always ink-root, which owns the FocusManager.
    if (root.focusManager) {
        var focusTarget = target;
        while (focusTarget) {
            if (typeof focusTarget.attributes['tabIndex'] === 'number') {
                root.focusManager.handleClickFocus(focusTarget);
                break;
            }
            focusTarget = focusTarget.parentNode;
        }
    }
    var event = new click_event_js_1.ClickEvent(col, row, cellIsBlank);
    var handled = false;
    while (target) {
        var handler = (_b = target._eventHandlers) === null || _b === void 0 ? void 0 : _b.onClick;
        if (handler) {
            handled = true;
            var rect = node_cache_js_1.nodeCache.get(target);
            if (rect) {
                event.localCol = col - rect.x;
                event.localRow = row - rect.y;
            }
            handler(event);
            if (event.didStopImmediatePropagation())
                return true;
        }
        target = target.parentNode;
    }
    return handled;
}
/**
 * Fire onMouseEnter/onMouseLeave as the pointer moves. Like DOM
 * mouseenter/mouseleave: does NOT bubble — moving between children does
 * not re-fire on the parent. Walks up from the hit node collecting every
 * ancestor with a hover handler; diffs against the previous hovered set;
 * fires leave on the nodes exited, enter on the nodes entered.
 *
 * Mutates `hovered` in place so the caller (App instance) can hold it
 * across calls. Clears the set when the hit is null (cursor moved into a
 * non-rendered gap or off the root rect).
 */
function dispatchHover(root, col, row, hovered) {
    var _a, _b, _c, _d, _e;
    var next = new Set();
    var node = (_a = hitTest(root, col, row)) !== null && _a !== void 0 ? _a : undefined;
    while (node) {
        var h = node._eventHandlers;
        if ((h === null || h === void 0 ? void 0 : h.onMouseEnter) || (h === null || h === void 0 ? void 0 : h.onMouseLeave))
            next.add(node);
        node = node.parentNode;
    }
    for (var _i = 0, hovered_1 = hovered; _i < hovered_1.length; _i++) {
        var old = hovered_1[_i];
        if (!next.has(old)) {
            hovered.delete(old);
            // Skip handlers on detached nodes (removed between mouse events)
            if (old.parentNode) {
                ;
                (_c = (_b = old._eventHandlers) === null || _b === void 0 ? void 0 : _b.onMouseLeave) === null || _c === void 0 ? void 0 : _c.call(_b);
            }
        }
    }
    for (var _f = 0, next_1 = next; _f < next_1.length; _f++) {
        var n = next_1[_f];
        if (!hovered.has(n)) {
            hovered.add(n);
            (_e = (_d = n._eventHandlers) === null || _d === void 0 ? void 0 : _d.onMouseEnter) === null || _e === void 0 ? void 0 : _e.call(_d);
        }
    }
}
