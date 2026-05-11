"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FocusManager = void 0;
exports.getRootNode = getRootNode;
exports.getFocusManager = getFocusManager;
var focus_event_js_1 = require("./events/focus-event.js");
var MAX_FOCUS_STACK = 32;
/**
 * DOM-like focus manager for the Ink terminal UI.
 *
 * Pure state — tracks activeElement and a focus stack. Has no reference
 * to the tree; callers pass the root when tree walks are needed.
 *
 * Stored on the root DOMElement so any node can reach it by walking
 * parentNode (like browser's `node.ownerDocument`).
 */
var FocusManager = /** @class */ (function () {
    function FocusManager(dispatchFocusEvent) {
        this.activeElement = null;
        this.enabled = true;
        this.focusStack = [];
        this.dispatchFocusEvent = dispatchFocusEvent;
    }
    FocusManager.prototype.focus = function (node) {
        if (node === this.activeElement)
            return;
        if (!this.enabled)
            return;
        var previous = this.activeElement;
        if (previous) {
            // Deduplicate before pushing to prevent unbounded growth from Tab cycling
            var idx = this.focusStack.indexOf(previous);
            if (idx !== -1)
                this.focusStack.splice(idx, 1);
            this.focusStack.push(previous);
            if (this.focusStack.length > MAX_FOCUS_STACK)
                this.focusStack.shift();
            this.dispatchFocusEvent(previous, new focus_event_js_1.FocusEvent('blur', node));
        }
        this.activeElement = node;
        this.dispatchFocusEvent(node, new focus_event_js_1.FocusEvent('focus', previous));
    };
    FocusManager.prototype.blur = function () {
        if (!this.activeElement)
            return;
        var previous = this.activeElement;
        this.activeElement = null;
        this.dispatchFocusEvent(previous, new focus_event_js_1.FocusEvent('blur', null));
    };
    /**
     * Called by the reconciler when a node is removed from the tree.
     * Handles both the exact node and any focused descendant within
     * the removed subtree. Dispatches blur and restores focus from stack.
     */
    FocusManager.prototype.handleNodeRemoved = function (node, root) {
        // Remove the node and any descendants from the stack
        this.focusStack = this.focusStack.filter(function (n) { return n !== node && isInTree(n, root); });
        // Check if activeElement is the removed node OR a descendant
        if (!this.activeElement)
            return;
        if (this.activeElement !== node && isInTree(this.activeElement, root)) {
            return;
        }
        var removed = this.activeElement;
        this.activeElement = null;
        this.dispatchFocusEvent(removed, new focus_event_js_1.FocusEvent('blur', null));
        // Restore focus to the most recent still-mounted element
        while (this.focusStack.length > 0) {
            var candidate = this.focusStack.pop();
            if (isInTree(candidate, root)) {
                this.activeElement = candidate;
                this.dispatchFocusEvent(candidate, new focus_event_js_1.FocusEvent('focus', removed));
                return;
            }
        }
    };
    FocusManager.prototype.handleAutoFocus = function (node) {
        this.focus(node);
    };
    FocusManager.prototype.handleClickFocus = function (node) {
        var tabIndex = node.attributes['tabIndex'];
        if (typeof tabIndex !== 'number')
            return;
        this.focus(node);
    };
    FocusManager.prototype.enable = function () {
        this.enabled = true;
    };
    FocusManager.prototype.disable = function () {
        this.enabled = false;
    };
    FocusManager.prototype.focusNext = function (root) {
        this.moveFocus(1, root);
    };
    FocusManager.prototype.focusPrevious = function (root) {
        this.moveFocus(-1, root);
    };
    FocusManager.prototype.moveFocus = function (direction, root) {
        if (!this.enabled)
            return;
        var tabbable = collectTabbable(root);
        if (tabbable.length === 0)
            return;
        var currentIndex = this.activeElement
            ? tabbable.indexOf(this.activeElement)
            : -1;
        var nextIndex = currentIndex === -1
            ? direction === 1
                ? 0
                : tabbable.length - 1
            : (currentIndex + direction + tabbable.length) % tabbable.length;
        var next = tabbable[nextIndex];
        if (next) {
            this.focus(next);
        }
    };
    return FocusManager;
}());
exports.FocusManager = FocusManager;
function collectTabbable(root) {
    var result = [];
    walkTree(root, result);
    return result;
}
function walkTree(node, result) {
    var tabIndex = node.attributes['tabIndex'];
    if (typeof tabIndex === 'number' && tabIndex >= 0) {
        result.push(node);
    }
    for (var _i = 0, _a = node.childNodes; _i < _a.length; _i++) {
        var child = _a[_i];
        if (child.nodeName !== '#text') {
            walkTree(child, result);
        }
    }
}
function isInTree(node, root) {
    var current = node;
    while (current) {
        if (current === root)
            return true;
        current = current.parentNode;
    }
    return false;
}
/**
 * Walk up to root and return it. The root is the node that holds
 * the FocusManager — like browser's `node.getRootNode()`.
 */
function getRootNode(node) {
    var current = node;
    while (current) {
        if (current.focusManager)
            return current;
        current = current.parentNode;
    }
    throw new Error('Node is not in a tree with a FocusManager');
}
/**
 * Walk up to root and return its FocusManager.
 * Like browser's `node.ownerDocument` — focus belongs to the root.
 */
function getFocusManager(node) {
    return getRootNode(node).focusManager;
}
