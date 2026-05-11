"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlushGate = void 0;
/**
 * State machine for gating message writes during an initial flush.
 *
 * When a bridge session starts, historical messages are flushed to the
 * server via a single HTTP POST. During that flush, new messages must
 * be queued to prevent them from arriving at the server interleaved
 * with the historical messages.
 *
 * Lifecycle:
 *   start() → enqueue() returns true, items are queued
 *   end()   → returns queued items for draining, enqueue() returns false
 *   drop()  → discards queued items (permanent transport close)
 *   deactivate() → clears active flag without dropping items
 *                   (transport replacement — new transport will drain)
 */
var FlushGate = /** @class */ (function () {
    function FlushGate() {
        this._active = false;
        this._pending = [];
    }
    Object.defineProperty(FlushGate.prototype, "active", {
        get: function () {
            return this._active;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FlushGate.prototype, "pendingCount", {
        get: function () {
            return this._pending.length;
        },
        enumerable: false,
        configurable: true
    });
    /** Mark flush as in-progress. enqueue() will start queuing items. */
    FlushGate.prototype.start = function () {
        this._active = true;
    };
    /**
     * End the flush and return any queued items for draining.
     * Caller is responsible for sending the returned items.
     */
    FlushGate.prototype.end = function () {
        this._active = false;
        return this._pending.splice(0);
    };
    /**
     * If flush is active, queue the items and return true.
     * If flush is not active, return false (caller should send directly).
     */
    FlushGate.prototype.enqueue = function () {
        var _a;
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        if (!this._active)
            return false;
        (_a = this._pending).push.apply(_a, items);
        return true;
    };
    /**
     * Discard all queued items (permanent transport close).
     * Returns the number of items dropped.
     */
    FlushGate.prototype.drop = function () {
        this._active = false;
        var count = this._pending.length;
        this._pending.length = 0;
        return count;
    };
    /**
     * Clear the active flag without dropping queued items.
     * Used when the transport is replaced (onWorkReceived) — the new
     * transport's flush will drain the pending items.
     */
    FlushGate.prototype.deactivate = function () {
        this._active = false;
    };
    return FlushGate;
}());
exports.FlushGate = FlushGate;
