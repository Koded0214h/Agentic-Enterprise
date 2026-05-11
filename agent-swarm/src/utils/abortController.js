"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAbortController = createAbortController;
exports.createChildAbortController = createChildAbortController;
var events_1 = require("events");
/**
 * Default max listeners for standard operations
 */
var DEFAULT_MAX_LISTENERS = 50;
/**
 * Creates an AbortController with proper event listener limits set.
 * This prevents MaxListenersExceededWarning when multiple listeners
 * are attached to the abort signal.
 *
 * @param maxListeners - Maximum number of listeners (default: 50)
 * @returns AbortController with configured listener limit
 */
function createAbortController(maxListeners) {
    if (maxListeners === void 0) { maxListeners = DEFAULT_MAX_LISTENERS; }
    var controller = new AbortController();
    (0, events_1.setMaxListeners)(maxListeners, controller.signal);
    return controller;
}
/**
 * Propagates abort from a parent to a weakly-referenced child controller.
 * Both parent and child are weakly held — neither direction creates a
 * strong reference that could prevent GC.
 * Module-scope function avoids per-call closure allocation.
 */
function propagateAbort(weakChild) {
    var _a;
    var parent = this.deref();
    (_a = weakChild.deref()) === null || _a === void 0 ? void 0 : _a.abort(parent === null || parent === void 0 ? void 0 : parent.signal.reason);
}
/**
 * Removes an abort handler from a weakly-referenced parent signal.
 * Both parent and handler are weakly held — if either has been GC'd
 * or the parent already aborted ({once: true}), this is a no-op.
 * Module-scope function avoids per-call closure allocation.
 */
function removeAbortHandler(weakHandler) {
    var parent = this.deref();
    var handler = weakHandler.deref();
    if (parent && handler) {
        parent.signal.removeEventListener('abort', handler);
    }
}
/**
 * Creates a child AbortController that aborts when its parent aborts.
 * Aborting the child does NOT affect the parent.
 *
 * Memory-safe: Uses WeakRef so the parent doesn't retain abandoned children.
 * If the child is dropped without being aborted, it can still be GC'd.
 * When the child IS aborted, the parent listener is removed to prevent
 * accumulation of dead handlers.
 *
 * @param parent - The parent AbortController
 * @param maxListeners - Maximum number of listeners (default: 50)
 * @returns Child AbortController
 */
function createChildAbortController(parent, maxListeners) {
    var child = createAbortController(maxListeners);
    // Fast path: parent already aborted, no listener setup needed
    if (parent.signal.aborted) {
        child.abort(parent.signal.reason);
        return child;
    }
    // WeakRef prevents the parent from keeping an abandoned child alive.
    // If all strong references to child are dropped without aborting it,
    // the child can still be GC'd — the parent only holds a dead WeakRef.
    var weakChild = new WeakRef(child);
    var weakParent = new WeakRef(parent);
    var handler = propagateAbort.bind(weakParent, weakChild);
    parent.signal.addEventListener('abort', handler, { once: true });
    // Auto-cleanup: remove parent listener when child is aborted (from any source).
    // Both parent and handler are weakly held — if either has been GC'd or the
    // parent already aborted ({once: true}), the cleanup is a harmless no-op.
    child.signal.addEventListener('abort', removeAbortHandler.bind(weakParent, new WeakRef(handler)), { once: true });
    return child;
}
