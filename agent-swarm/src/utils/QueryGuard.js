"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryGuard = void 0;
/**
 * Synchronous state machine for the query lifecycle, compatible with
 * React's `useSyncExternalStore`.
 *
 * Three states:
 *   idle        → no query, safe to dequeue and process
 *   dispatching → an item was dequeued, async chain hasn't reached onQuery yet
 *   running     → onQuery called tryStart(), query is executing
 *
 * Transitions:
 *   idle → dispatching  (reserve)
 *   dispatching → running  (tryStart)
 *   idle → running  (tryStart, for direct user submissions)
 *   running → idle  (end / forceEnd)
 *   dispatching → idle  (cancelReservation, when processQueueIfReady fails)
 *
 * `isActive` returns true for both dispatching and running, preventing
 * re-entry from the queue processor during the async gap.
 *
 * Usage with React:
 *   const queryGuard = useRef(new QueryGuard()).current
 *   const isQueryActive = useSyncExternalStore(
 *     queryGuard.subscribe,
 *     queryGuard.getSnapshot,
 *   )
 */
var signal_js_1 = require("./signal.js");
var QueryGuard = /** @class */ (function () {
    function QueryGuard() {
        var _this = this;
        this._status = 'idle';
        this._generation = 0;
        this._changed = (0, signal_js_1.createSignal)();
        // --
        // useSyncExternalStore interface
        /** Subscribe to state changes. Stable reference — safe as useEffect dep. */
        this.subscribe = this._changed.subscribe;
        /** Snapshot for useSyncExternalStore. Returns `isActive`. */
        this.getSnapshot = function () {
            return _this._status !== 'idle';
        };
    }
    /**
     * Reserve the guard for queue processing. Transitions idle → dispatching.
     * Returns false if not idle (another query or dispatch in progress).
     */
    QueryGuard.prototype.reserve = function () {
        if (this._status !== 'idle')
            return false;
        this._status = 'dispatching';
        this._notify();
        return true;
    };
    /**
     * Cancel a reservation when processQueueIfReady had nothing to process.
     * Transitions dispatching → idle.
     */
    QueryGuard.prototype.cancelReservation = function () {
        if (this._status !== 'dispatching')
            return;
        this._status = 'idle';
        this._notify();
    };
    /**
     * Start a query. Returns the generation number on success,
     * or null if a query is already running (concurrent guard).
     * Accepts transitions from both idle (direct user submit)
     * and dispatching (queue processor path).
     */
    QueryGuard.prototype.tryStart = function () {
        if (this._status === 'running')
            return null;
        this._status = 'running';
        ++this._generation;
        this._notify();
        return this._generation;
    };
    /**
     * End a query. Returns true if this generation is still current
     * (meaning the caller should perform cleanup). Returns false if a
     * newer query has started (stale finally block from a cancelled query).
     */
    QueryGuard.prototype.end = function (generation) {
        if (this._generation !== generation)
            return false;
        if (this._status !== 'running')
            return false;
        this._status = 'idle';
        this._notify();
        return true;
    };
    /**
     * Force-end the current query regardless of generation.
     * Used by onCancel where any running query should be terminated.
     * Increments generation so stale finally blocks from the cancelled
     * query's promise rejection will see a mismatch and skip cleanup.
     */
    QueryGuard.prototype.forceEnd = function () {
        if (this._status === 'idle')
            return;
        this._status = 'idle';
        ++this._generation;
        this._notify();
    };
    Object.defineProperty(QueryGuard.prototype, "isActive", {
        /**
         * Is the guard active (dispatching or running)?
         * Always synchronous — not subject to React state batching delays.
         */
        get: function () {
            return this._status !== 'idle';
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(QueryGuard.prototype, "generation", {
        get: function () {
            return this._generation;
        },
        enumerable: false,
        configurable: true
    });
    QueryGuard.prototype._notify = function () {
        this._changed.emit();
    };
    return QueryGuard;
}());
exports.QueryGuard = QueryGuard;
