"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SerialBatchEventUploader = exports.RetryableError = void 0;
var slowOperations_js_1 = require("../../utils/slowOperations.js");
/**
 * Serial ordered event uploader with batching, retry, and backpressure.
 *
 * - enqueue() adds events to a pending buffer
 * - At most 1 POST in-flight at a time
 * - Drains up to maxBatchSize items per POST
 * - New events accumulate while in-flight
 * - On failure: exponential backoff (clamped), retries indefinitely
 *   until success or close() — unless maxConsecutiveFailures is set,
 *   in which case the failing batch is dropped and drain advances
 * - flush() blocks until pending is empty and kicks drain if needed
 * - Backpressure: enqueue() blocks when maxQueueSize is reached
 */
/**
 * Throw from config.send() to make the uploader wait a server-supplied
 * duration before retrying (e.g. 429 with Retry-After). When retryAfterMs
 * is set, it overrides exponential backoff for that attempt — clamped to
 * [baseDelayMs, maxDelayMs] and jittered so a misbehaving server can
 * neither hot-loop nor stall the client, and many sessions sharing a rate
 * limit don't all pounce at the same instant. Without retryAfterMs, behaves
 * like any other thrown error (exponential backoff).
 */
var RetryableError = /** @class */ (function (_super) {
    __extends(RetryableError, _super);
    function RetryableError(message, retryAfterMs) {
        var _this = _super.call(this, message) || this;
        _this.retryAfterMs = retryAfterMs;
        return _this;
    }
    return RetryableError;
}(Error));
exports.RetryableError = RetryableError;
var SerialBatchEventUploader = /** @class */ (function () {
    function SerialBatchEventUploader(config) {
        this.pending = [];
        this.pendingAtClose = 0;
        this.draining = false;
        this.closed = false;
        this.backpressureResolvers = [];
        this.sleepResolve = null;
        this.flushResolvers = [];
        this.droppedBatches = 0;
        this.config = config;
    }
    Object.defineProperty(SerialBatchEventUploader.prototype, "droppedBatchCount", {
        /**
         * Monotonic count of batches dropped via maxConsecutiveFailures. Callers
         * can snapshot before flush() and compare after to detect silent drops
         * (flush() resolves normally even when batches were dropped).
         */
        get: function () {
            return this.droppedBatches;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SerialBatchEventUploader.prototype, "pendingCount", {
        /**
         * Pending queue depth. After close(), returns the count at close time —
         * close() clears the queue but shutdown diagnostics may read this after.
         */
        get: function () {
            return this.closed ? this.pendingAtClose : this.pending.length;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Add events to the pending buffer. Returns immediately if space is
     * available. Blocks (awaits) if the buffer is full — caller pauses
     * until drain frees space.
     */
    SerialBatchEventUploader.prototype.enqueue = function (events) {
        return __awaiter(this, void 0, void 0, function () {
            var items;
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.closed)
                            return [2 /*return*/];
                        items = Array.isArray(events) ? events : [events];
                        if (items.length === 0)
                            return [2 /*return*/];
                        _b.label = 1;
                    case 1:
                        if (!(this.pending.length + items.length > this.config.maxQueueSize &&
                            !this.closed)) return [3 /*break*/, 3];
                        return [4 /*yield*/, new Promise(function (resolve) {
                                _this.backpressureResolvers.push(resolve);
                            })];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 1];
                    case 3:
                        if (this.closed)
                            return [2 /*return*/];
                        (_a = this.pending).push.apply(_a, items);
                        void this.drain();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Block until all pending events have been sent.
     * Used at turn boundaries and graceful shutdown.
     */
    SerialBatchEventUploader.prototype.flush = function () {
        var _this = this;
        if (this.pending.length === 0 && !this.draining) {
            return Promise.resolve();
        }
        void this.drain();
        return new Promise(function (resolve) {
            _this.flushResolvers.push(resolve);
        });
    };
    /**
     * Drop pending events and stop processing.
     * Resolves any blocked enqueue() and flush() callers.
     */
    SerialBatchEventUploader.prototype.close = function () {
        var _a;
        if (this.closed)
            return;
        this.closed = true;
        this.pendingAtClose = this.pending.length;
        this.pending = [];
        (_a = this.sleepResolve) === null || _a === void 0 ? void 0 : _a.call(this);
        this.sleepResolve = null;
        for (var _i = 0, _b = this.backpressureResolvers; _i < _b.length; _i++) {
            var resolve = _b[_i];
            resolve();
        }
        this.backpressureResolvers = [];
        for (var _c = 0, _d = this.flushResolvers; _c < _d.length; _c++) {
            var resolve = _d[_c];
            resolve();
        }
        this.flushResolvers = [];
    };
    /**
     * Drain loop. At most one instance runs at a time (guarded by this.draining).
     * Sends batches serially. On failure, backs off and retries indefinitely.
     */
    SerialBatchEventUploader.prototype.drain = function () {
        return __awaiter(this, void 0, void 0, function () {
            var failures, batch, err_1, retryAfterMs, _i, _a, resolve;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (this.draining || this.closed)
                            return [2 /*return*/];
                        this.draining = true;
                        failures = 0;
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, , 9, 10]);
                        _d.label = 2;
                    case 2:
                        if (!(this.pending.length > 0 && !this.closed)) return [3 /*break*/, 8];
                        batch = this.takeBatch();
                        if (batch.length === 0)
                            return [3 /*break*/, 2];
                        _d.label = 3;
                    case 3:
                        _d.trys.push([3, 5, , 7]);
                        return [4 /*yield*/, this.config.send(batch)];
                    case 4:
                        _d.sent();
                        failures = 0;
                        return [3 /*break*/, 7];
                    case 5:
                        err_1 = _d.sent();
                        failures++;
                        if (this.config.maxConsecutiveFailures !== undefined &&
                            failures >= this.config.maxConsecutiveFailures) {
                            this.droppedBatches++;
                            (_c = (_b = this.config).onBatchDropped) === null || _c === void 0 ? void 0 : _c.call(_b, batch.length, failures);
                            failures = 0;
                            this.releaseBackpressure();
                            return [3 /*break*/, 2];
                        }
                        // Re-queue the failed batch at the front. Use concat (single
                        // allocation) instead of unshift(...batch) which shifts every
                        // pending item batch.length times. Only hit on failure path.
                        this.pending = batch.concat(this.pending);
                        retryAfterMs = err_1 instanceof RetryableError ? err_1.retryAfterMs : undefined;
                        return [4 /*yield*/, this.sleep(this.retryDelay(failures, retryAfterMs))];
                    case 6:
                        _d.sent();
                        return [3 /*break*/, 2];
                    case 7:
                        // Release backpressure waiters if space opened up
                        this.releaseBackpressure();
                        return [3 /*break*/, 2];
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        this.draining = false;
                        // Notify flush waiters if queue is empty
                        if (this.pending.length === 0) {
                            for (_i = 0, _a = this.flushResolvers; _i < _a.length; _i++) {
                                resolve = _a[_i];
                                resolve();
                            }
                            this.flushResolvers = [];
                        }
                        return [7 /*endfinally*/];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Pull the next batch from pending. Respects both maxBatchSize and
     * maxBatchBytes. The first item is always taken; subsequent items only
     * if adding them keeps the cumulative JSON size under maxBatchBytes.
     *
     * Un-serializable items (BigInt, circular refs, throwing toJSON) are
     * dropped in place — they can never be sent and leaving them at
     * pending[0] would poison the queue and hang flush() forever.
     */
    SerialBatchEventUploader.prototype.takeBatch = function () {
        var _a = this.config, maxBatchSize = _a.maxBatchSize, maxBatchBytes = _a.maxBatchBytes;
        if (maxBatchBytes === undefined) {
            return this.pending.splice(0, maxBatchSize);
        }
        var bytes = 0;
        var count = 0;
        while (count < this.pending.length && count < maxBatchSize) {
            var itemBytes = void 0;
            try {
                itemBytes = Buffer.byteLength((0, slowOperations_js_1.jsonStringify)(this.pending[count]));
            }
            catch (_b) {
                this.pending.splice(count, 1);
                continue;
            }
            if (count > 0 && bytes + itemBytes > maxBatchBytes)
                break;
            bytes += itemBytes;
            count++;
        }
        return this.pending.splice(0, count);
    };
    SerialBatchEventUploader.prototype.retryDelay = function (failures, retryAfterMs) {
        var jitter = Math.random() * this.config.jitterMs;
        if (retryAfterMs !== undefined) {
            // Jitter on top of the server's hint prevents thundering herd when
            // many sessions share a rate limit and all receive the same
            // Retry-After. Clamp first, then spread — same shape as the
            // exponential path (effective ceiling is maxDelayMs + jitterMs).
            var clamped = Math.max(this.config.baseDelayMs, Math.min(retryAfterMs, this.config.maxDelayMs));
            return clamped + jitter;
        }
        var exponential = Math.min(this.config.baseDelayMs * Math.pow(2, (failures - 1)), this.config.maxDelayMs);
        return exponential + jitter;
    };
    SerialBatchEventUploader.prototype.releaseBackpressure = function () {
        var resolvers = this.backpressureResolvers;
        this.backpressureResolvers = [];
        for (var _i = 0, resolvers_1 = resolvers; _i < resolvers_1.length; _i++) {
            var resolve = resolvers_1[_i];
            resolve();
        }
    };
    SerialBatchEventUploader.prototype.sleep = function (ms) {
        var _this = this;
        return new Promise(function (resolve) {
            _this.sleepResolve = resolve;
            setTimeout(function (self, resolve) {
                self.sleepResolve = null;
                resolve();
            }, ms, _this, resolve);
        });
    };
    return SerialBatchEventUploader;
}());
exports.SerialBatchEventUploader = SerialBatchEventUploader;
