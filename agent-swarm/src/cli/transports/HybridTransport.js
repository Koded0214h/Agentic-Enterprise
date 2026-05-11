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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HybridTransport = void 0;
var axios_1 = require("axios");
var debug_js_1 = require("../../utils/debug.js");
var diagLogs_js_1 = require("../../utils/diagLogs.js");
var sessionIngressAuth_js_1 = require("../../utils/sessionIngressAuth.js");
var SerialBatchEventUploader_js_1 = require("./SerialBatchEventUploader.js");
var WebSocketTransport_js_1 = require("./WebSocketTransport.js");
var BATCH_FLUSH_INTERVAL_MS = 100;
// Per-attempt POST timeout. Bounds how long a single stuck POST can block
// the serialized queue. Without this, a hung connection stalls all writes.
var POST_TIMEOUT_MS = 15000;
// Grace period for queued writes on close(). Covers a healthy POST (~100ms)
// plus headroom; best-effort, not a delivery guarantee under degraded network.
// Void-ed (nothing awaits it) so this is a last resort — replBridge teardown
// now closes AFTER archive so archive latency is the primary drain window.
// NOTE: gracefulShutdown's cleanup budget is 2s (not the 5s outer failsafe);
// 3s here exceeds it, but the process lives ~2s longer for hooks+analytics.
var CLOSE_GRACE_MS = 3000;
/**
 * Hybrid transport: WebSocket for reads, HTTP POST for writes.
 *
 * Write flow:
 *
 *   write(stream_event) ─┐
 *                        │ (100ms timer)
 *                        │
 *                        ▼
 *   write(other) ────► uploader.enqueue()  (SerialBatchEventUploader)
 *                        ▲    │
 *   writeBatch() ────────┘    │ serial, batched, retries indefinitely,
 *                             │ backpressure at maxQueueSize
 *                             ▼
 *                        postOnce()  (single HTTP POST, throws on retryable)
 *
 * stream_event messages accumulate in streamEventBuffer for up to 100ms
 * before enqueue (reduces POST count for high-volume content deltas). A
 * non-stream write flushes any buffered stream_events first to preserve order.
 *
 * Serialization + retry + backpressure are delegated to SerialBatchEventUploader
 * (same primitive CCR uses). At most one POST in-flight; events arriving during
 * a POST batch into the next one. On failure, the uploader re-queues and retries
 * with exponential backoff + jitter. If the queue fills past maxQueueSize,
 * enqueue() blocks — giving awaiting callers backpressure.
 *
 * Why serialize? Bridge mode fires writes via `void transport.write()`
 * (fire-and-forget). Without this, concurrent POSTs → concurrent Firestore
 * writes to the same document → collisions → retry storms → pages oncall.
 */
var HybridTransport = /** @class */ (function (_super) {
    __extends(HybridTransport, _super);
    function HybridTransport(url, headers, sessionId, refreshHeaders, options) {
        if (headers === void 0) { headers = {}; }
        var _this = _super.call(this, url, headers, sessionId, refreshHeaders, options) || this;
        // stream_event delay buffer — accumulates content deltas for up to
        // BATCH_FLUSH_INTERVAL_MS before enqueueing (reduces POST count)
        _this.streamEventBuffer = [];
        _this.streamEventTimer = null;
        var _a = options !== null && options !== void 0 ? options : {}, maxConsecutiveFailures = _a.maxConsecutiveFailures, onBatchDropped = _a.onBatchDropped;
        _this.postUrl = convertWsUrlToPostUrl(url);
        _this.uploader = new SerialBatchEventUploader_js_1.SerialBatchEventUploader({
            // Large cap — session-ingress accepts arbitrary batch sizes. Events
            // naturally batch during in-flight POSTs; this just bounds the payload.
            maxBatchSize: 500,
            // Bridge callers use `void transport.write()` — backpressure doesn't
            // apply (they don't await). A batch >maxQueueSize deadlocks (see
            // SerialBatchEventUploader backpressure check). So set it high enough
            // to be a memory bound only. Wire real backpressure in a follow-up
            // once callers await.
            maxQueueSize: 100000,
            baseDelayMs: 500,
            maxDelayMs: 8000,
            jitterMs: 1000,
            // Optional cap so a persistently-failing server can't pin the drain
            // loop for the lifetime of the process. Undefined = indefinite retry.
            // replBridge sets this; the 1P transportUtils path does not.
            maxConsecutiveFailures: maxConsecutiveFailures,
            onBatchDropped: function (batchSize, failures) {
                (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'cli_hybrid_batch_dropped_max_failures', {
                    batchSize: batchSize,
                    failures: failures,
                });
                onBatchDropped === null || onBatchDropped === void 0 ? void 0 : onBatchDropped(batchSize, failures);
            },
            send: function (batch) { return _this.postOnce(batch); },
        });
        (0, debug_js_1.logForDebugging)("HybridTransport: POST URL = ".concat(_this.postUrl));
        (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'cli_hybrid_transport_initialized');
        return _this;
    }
    /**
     * Enqueue a message and wait for the queue to drain. Returning flush()
     * preserves the contract that `await write()` resolves after the event is
     * POSTed (relied on by tests and replBridge's initial flush). Fire-and-forget
     * callers (`void transport.write()`) are unaffected — they don't await,
     * so the later resolution doesn't add latency.
     */
    HybridTransport.prototype.write = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (message.type === 'stream_event') {
                            // Delay: accumulate stream_events briefly before enqueueing.
                            // Promise resolves immediately — callers don't await stream_events.
                            this.streamEventBuffer.push(message);
                            if (!this.streamEventTimer) {
                                this.streamEventTimer = setTimeout(function () { return _this.flushStreamEvents(); }, BATCH_FLUSH_INTERVAL_MS);
                            }
                            return [2 /*return*/];
                        }
                        // Immediate: flush any buffered stream_events (ordering), then this event.
                        return [4 /*yield*/, this.uploader.enqueue(__spreadArray(__spreadArray([], this.takeStreamEvents(), true), [message], false))];
                    case 1:
                        // Immediate: flush any buffered stream_events (ordering), then this event.
                        _a.sent();
                        return [2 /*return*/, this.uploader.flush()];
                }
            });
        });
    };
    HybridTransport.prototype.writeBatch = function (messages) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.uploader.enqueue(__spreadArray(__spreadArray([], this.takeStreamEvents(), true), messages, true))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.uploader.flush()];
                }
            });
        });
    };
    Object.defineProperty(HybridTransport.prototype, "droppedBatchCount", {
        /** Snapshot before/after writeBatch() to detect silent drops. */
        get: function () {
            return this.uploader.droppedBatchCount;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Block until all pending events are POSTed. Used by bridge's initial
     * history flush so onStateChange('connected') fires after persistence.
     */
    HybridTransport.prototype.flush = function () {
        void this.uploader.enqueue(this.takeStreamEvents());
        return this.uploader.flush();
    };
    /** Take ownership of buffered stream_events and clear the delay timer. */
    HybridTransport.prototype.takeStreamEvents = function () {
        if (this.streamEventTimer) {
            clearTimeout(this.streamEventTimer);
            this.streamEventTimer = null;
        }
        var buffered = this.streamEventBuffer;
        this.streamEventBuffer = [];
        return buffered;
    };
    /** Delay timer fired — enqueue accumulated stream_events. */
    HybridTransport.prototype.flushStreamEvents = function () {
        this.streamEventTimer = null;
        void this.uploader.enqueue(this.takeStreamEvents());
    };
    HybridTransport.prototype.close = function () {
        if (this.streamEventTimer) {
            clearTimeout(this.streamEventTimer);
            this.streamEventTimer = null;
        }
        this.streamEventBuffer = [];
        // Grace period for queued writes — fallback. replBridge teardown now
        // awaits archive between write and close (see CLOSE_GRACE_MS), so
        // archive latency is the primary drain window and this is a last
        // resort. Keep close() sync (returns immediately) but defer
        // uploader.close() so any remaining queue gets a chance to finish.
        var uploader = this.uploader;
        var graceTimer;
        void Promise.race([
            uploader.flush(),
            new Promise(function (r) {
                // eslint-disable-next-line no-restricted-syntax -- need timer ref for clearTimeout
                graceTimer = setTimeout(r, CLOSE_GRACE_MS);
            }),
        ]).finally(function () {
            clearTimeout(graceTimer);
            uploader.close();
        });
        _super.prototype.close.call(this);
    };
    /**
     * Single-attempt POST. Throws on retryable failures (429, 5xx, network)
     * so SerialBatchEventUploader re-queues and retries. Returns on success
     * and on permanent failures (4xx non-429, no token) so the uploader moves on.
     */
    HybridTransport.prototype.postOnce = function (events) {
        return __awaiter(this, void 0, void 0, function () {
            var sessionToken, headers, response, error_1, axiosError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sessionToken = (0, sessionIngressAuth_js_1.getSessionIngressAuthToken)();
                        if (!sessionToken) {
                            (0, debug_js_1.logForDebugging)('HybridTransport: No session token available for POST');
                            (0, diagLogs_js_1.logForDiagnosticsNoPII)('warn', 'cli_hybrid_post_no_token');
                            return [2 /*return*/];
                        }
                        headers = {
                            Authorization: "Bearer ".concat(sessionToken),
                            'Content-Type': 'application/json',
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1.default.post(this.postUrl, { events: events }, {
                                headers: headers,
                                validateStatus: function () { return true; },
                                timeout: POST_TIMEOUT_MS,
                            })];
                    case 2:
                        response = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        axiosError = error_1;
                        (0, debug_js_1.logForDebugging)("HybridTransport: POST error: ".concat(axiosError.message));
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('warn', 'cli_hybrid_post_network_error');
                        throw error_1;
                    case 4:
                        if (response.status >= 200 && response.status < 300) {
                            (0, debug_js_1.logForDebugging)("HybridTransport: POST success count=".concat(events.length));
                            return [2 /*return*/];
                        }
                        // 4xx (except 429) are permanent — drop, don't retry.
                        if (response.status >= 400 &&
                            response.status < 500 &&
                            response.status !== 429) {
                            (0, debug_js_1.logForDebugging)("HybridTransport: POST returned ".concat(response.status, " (permanent), dropping"));
                            (0, diagLogs_js_1.logForDiagnosticsNoPII)('warn', 'cli_hybrid_post_client_error', {
                                status: response.status,
                            });
                            return [2 /*return*/];
                        }
                        // 429 / 5xx — retryable. Throw so uploader re-queues and backs off.
                        (0, debug_js_1.logForDebugging)("HybridTransport: POST returned ".concat(response.status, " (retryable)"));
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('warn', 'cli_hybrid_post_retryable_error', {
                            status: response.status,
                        });
                        throw new Error("POST failed with ".concat(response.status));
                }
            });
        });
    };
    return HybridTransport;
}(WebSocketTransport_js_1.WebSocketTransport));
exports.HybridTransport = HybridTransport;
/**
 * Convert a WebSocket URL to the HTTP POST endpoint URL.
 * From: wss://api.example.com/v2/session_ingress/ws/<session_id>
 * To: https://api.example.com/v2/session_ingress/session/<session_id>/events
 */
function convertWsUrlToPostUrl(wsUrl) {
    var protocol = wsUrl.protocol === 'wss:' ? 'https:' : 'http:';
    // Replace /ws/ with /session/ and append /events
    var pathname = wsUrl.pathname;
    pathname = pathname.replace('/ws/', '/session/');
    if (!pathname.endsWith('/events')) {
        pathname = pathname.endsWith('/')
            ? pathname + 'events'
            : pathname + '/events';
    }
    return "".concat(protocol, "//").concat(wsUrl.host).concat(pathname).concat(wsUrl.search);
}
