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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.CCRClient = exports.CCRInitError = void 0;
exports.createStreamAccumulator = createStreamAccumulator;
exports.accumulateStreamEvents = accumulateStreamEvents;
exports.clearStreamAccumulatorForMessage = clearStreamAccumulatorForMessage;
var crypto_1 = require("crypto");
var jwtUtils_js_1 = require("../../bridge/jwtUtils.js");
var debug_js_1 = require("../../utils/debug.js");
var diagLogs_js_1 = require("../../utils/diagLogs.js");
var errors_js_1 = require("../../utils/errors.js");
var proxy_js_1 = require("../../utils/proxy.js");
var sessionActivity_js_1 = require("../../utils/sessionActivity.js");
var sessionIngressAuth_js_1 = require("../../utils/sessionIngressAuth.js");
var sleep_js_1 = require("../../utils/sleep.js");
var userAgent_js_1 = require("../../utils/userAgent.js");
var SerialBatchEventUploader_js_1 = require("./SerialBatchEventUploader.js");
var WorkerStateUploader_js_1 = require("./WorkerStateUploader.js");
/** Default interval between heartbeat events (20s; server TTL is 60s). */
var DEFAULT_HEARTBEAT_INTERVAL_MS = 20000;
/**
 * stream_event messages accumulate in a delay buffer for up to this many ms
 * before enqueue. Mirrors HybridTransport's batching window. text_delta
 * events for the same content block accumulate into a single full-so-far
 * snapshot per flush — each emitted event is self-contained so a client
 * connecting mid-stream sees complete text, not a fragment.
 */
var STREAM_EVENT_FLUSH_INTERVAL_MS = 100;
/** Hoisted axios validateStatus callback to avoid per-request closure allocation. */
function alwaysValidStatus() {
    return true;
}
/** Thrown by initialize(); carries a typed reason for the diag classifier. */
var CCRInitError = /** @class */ (function (_super) {
    __extends(CCRInitError, _super);
    function CCRInitError(reason) {
        var _this = _super.call(this, "CCRClient init failed: ".concat(reason)) || this;
        _this.reason = reason;
        return _this;
    }
    return CCRInitError;
}(Error));
exports.CCRInitError = CCRInitError;
/**
 * Consecutive 401/403 with a VALID-LOOKING token before giving up. An
 * expired JWT short-circuits this (exits immediately — deterministic,
 * retry is futile). This threshold is for the uncertain case: token's
 * exp is in the future but server says 401 (userauth down, KMS hiccup,
 * clock skew). 10 × 20s heartbeat ≈ 200s to ride it out.
 */
var MAX_CONSECUTIVE_AUTH_FAILURES = 10;
function createStreamAccumulator() {
    return { byMessage: new Map(), scopeToMessage: new Map() };
}
function scopeKey(m) {
    var _a;
    return "".concat(m.session_id, ":").concat((_a = m.parent_tool_use_id) !== null && _a !== void 0 ? _a : '');
}
/**
 * Accumulate text_delta stream_events into full-so-far snapshots per content
 * block. Each flush emits ONE event per touched block containing the FULL
 * accumulated text from the start of the block — a client connecting
 * mid-stream receives a self-contained snapshot, not a fragment.
 *
 * Non-text-delta events pass through unchanged. message_start records the
 * active message ID for the scope; content_block_delta appends chunks;
 * the snapshot event reuses the first text_delta UUID seen for that block in
 * this flush so server-side idempotency remains stable across retries.
 *
 * Cleanup happens in writeEvent when the complete assistant message arrives
 * (reliable), not here on stop events (abort/error paths skip those).
 */
function accumulateStreamEvents(buffer, state) {
    var _a;
    var _b;
    var out = [];
    // chunks[] → snapshot already in `out` this flush. Keyed by the chunks
    // array reference (stable per {messageId, index}) so subsequent deltas
    // rewrite the same entry instead of emitting one event per delta.
    var touched = new Map();
    for (var _i = 0, buffer_1 = buffer; _i < buffer_1.length; _i++) {
        var msg = buffer_1[_i];
        switch (msg.event.type) {
            case 'message_start': {
                var id = msg.event.message.id;
                var prevId = state.scopeToMessage.get(scopeKey(msg));
                if (prevId)
                    state.byMessage.delete(prevId);
                state.scopeToMessage.set(scopeKey(msg), id);
                state.byMessage.set(id, []);
                out.push(msg);
                break;
            }
            case 'content_block_delta': {
                if (msg.event.delta.type !== 'text_delta') {
                    out.push(msg);
                    break;
                }
                var messageId = state.scopeToMessage.get(scopeKey(msg));
                var blocks = messageId ? state.byMessage.get(messageId) : undefined;
                if (!blocks) {
                    // Delta without a preceding message_start (reconnect mid-stream,
                    // or message_start was in a prior buffer that got dropped). Pass
                    // through raw — can't produce a full-so-far snapshot without the
                    // prior chunks anyway.
                    out.push(msg);
                    break;
                }
                var chunks = ((_a = blocks[_b = msg.event.index]) !== null && _a !== void 0 ? _a : (blocks[_b] = []));
                chunks.push(msg.event.delta.text);
                var existing = touched.get(chunks);
                if (existing) {
                    existing.event.delta.text = chunks.join('');
                    break;
                }
                var snapshot = {
                    type: 'stream_event',
                    uuid: msg.uuid,
                    session_id: msg.session_id,
                    parent_tool_use_id: msg.parent_tool_use_id,
                    event: {
                        type: 'content_block_delta',
                        index: msg.event.index,
                        delta: { type: 'text_delta', text: chunks.join('') },
                    },
                };
                touched.set(chunks, snapshot);
                out.push(snapshot);
                break;
            }
            default:
                out.push(msg);
        }
    }
    return out;
}
/**
 * Clear accumulator entries for a completed assistant message. Called from
 * writeEvent when the SDKAssistantMessage arrives — the reliable end-of-stream
 * signal that fires even when abort/interrupt/error skip SSE stop events.
 */
function clearStreamAccumulatorForMessage(state, assistant) {
    state.byMessage.delete(assistant.message.id);
    var scope = scopeKey(assistant);
    if (state.scopeToMessage.get(scope) === assistant.message.id) {
        state.scopeToMessage.delete(scope);
    }
}
/**
 * Manages the worker lifecycle protocol with CCR v2:
 * - Epoch management: reads worker_epoch from CLAUDE_CODE_WORKER_EPOCH env var
 * - Runtime state reporting: PUT /sessions/{id}/worker
 * - Heartbeat: POST /sessions/{id}/worker/heartbeat for liveness detection
 *
 * All writes go through this.request().
 */
var CCRClient = /** @class */ (function () {
    function CCRClient(transport, sessionUrl, opts) {
        var _this = this;
        var _a, _b, _c, _d;
        this.workerEpoch = 0;
        this.heartbeatTimer = null;
        this.heartbeatInFlight = false;
        this.closed = false;
        this.consecutiveAuthFailures = 0;
        this.currentState = null;
        this.http = (0, proxy_js_1.createAxiosInstance)({ keepAlive: true });
        // stream_event delay buffer — accumulates content deltas for up to
        // STREAM_EVENT_FLUSH_INTERVAL_MS before enqueueing (reduces POST count
        // and enables text_delta coalescing). Mirrors HybridTransport's pattern.
        this.streamEventBuffer = [];
        this.streamEventTimer = null;
        // Full-so-far text accumulator. Persists across flushes so each emitted
        // text_delta event carries the complete text from the start of the block —
        // mid-stream reconnects see a self-contained snapshot. Keyed by API message
        // ID; cleared in writeEvent when the complete assistant message arrives.
        this.streamTextAccumulator = createStreamAccumulator();
        this.onEpochMismatch =
            (_a = opts === null || opts === void 0 ? void 0 : opts.onEpochMismatch) !== null && _a !== void 0 ? _a : (function () {
                // eslint-disable-next-line custom-rules/no-process-exit
                process.exit(1);
            });
        this.heartbeatIntervalMs =
            (_b = opts === null || opts === void 0 ? void 0 : opts.heartbeatIntervalMs) !== null && _b !== void 0 ? _b : DEFAULT_HEARTBEAT_INTERVAL_MS;
        this.heartbeatJitterFraction = (_c = opts === null || opts === void 0 ? void 0 : opts.heartbeatJitterFraction) !== null && _c !== void 0 ? _c : 0;
        this.getAuthHeaders = (_d = opts === null || opts === void 0 ? void 0 : opts.getAuthHeaders) !== null && _d !== void 0 ? _d : sessionIngressAuth_js_1.getSessionIngressAuthHeaders;
        // Session URL: https://host/v1/code/sessions/{id}
        if (sessionUrl.protocol !== 'http:' && sessionUrl.protocol !== 'https:') {
            throw new Error("CCRClient: Expected http(s) URL, got ".concat(sessionUrl.protocol));
        }
        var pathname = sessionUrl.pathname.replace(/\/$/, '');
        this.sessionBaseUrl = "".concat(sessionUrl.protocol, "//").concat(sessionUrl.host).concat(pathname);
        // Extract session ID from the URL path (last segment)
        this.sessionId = pathname.split('/').pop() || '';
        this.workerState = new WorkerStateUploader_js_1.WorkerStateUploader({
            send: function (body) {
                return _this.request('put', '/worker', __assign({ worker_epoch: _this.workerEpoch }, body), 'PUT worker').then(function (r) { return r.ok; });
            },
            baseDelayMs: 500,
            maxDelayMs: 30000,
            jitterMs: 500,
        });
        this.eventUploader = new SerialBatchEventUploader_js_1.SerialBatchEventUploader({
            maxBatchSize: 100,
            maxBatchBytes: 10 * 1024 * 1024,
            // flushStreamEventBuffer() enqueues a full 100ms window of accumulated
            // stream_events in one call. A burst of mixed delta types that don't
            // fold into a single snapshot could exceed the old cap (50) and deadlock
            // on the SerialBatchEventUploader backpressure check. Match
            // HybridTransport's bound — high enough to be memory-only.
            maxQueueSize: 100000,
            send: function (batch) { return __awaiter(_this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.request('post', '/worker/events', { worker_epoch: this.workerEpoch, events: batch }, 'client events')];
                        case 1:
                            result = _a.sent();
                            if (!result.ok) {
                                throw new SerialBatchEventUploader_js_1.RetryableError('client event POST failed', result.retryAfterMs);
                            }
                            return [2 /*return*/];
                    }
                });
            }); },
            baseDelayMs: 500,
            maxDelayMs: 30000,
            jitterMs: 500,
        });
        this.internalEventUploader = new SerialBatchEventUploader_js_1.SerialBatchEventUploader({
            maxBatchSize: 100,
            maxBatchBytes: 10 * 1024 * 1024,
            maxQueueSize: 200,
            send: function (batch) { return __awaiter(_this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.request('post', '/worker/internal-events', { worker_epoch: this.workerEpoch, events: batch }, 'internal events')];
                        case 1:
                            result = _a.sent();
                            if (!result.ok) {
                                throw new SerialBatchEventUploader_js_1.RetryableError('internal event POST failed', result.retryAfterMs);
                            }
                            return [2 /*return*/];
                    }
                });
            }); },
            baseDelayMs: 500,
            maxDelayMs: 30000,
            jitterMs: 500,
        });
        this.deliveryUploader = new SerialBatchEventUploader_js_1.SerialBatchEventUploader({
            maxBatchSize: 64,
            maxQueueSize: 64,
            send: function (batch) { return __awaiter(_this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.request('post', '/worker/events/delivery', {
                                worker_epoch: this.workerEpoch,
                                updates: batch.map(function (d) { return ({
                                    event_id: d.eventId,
                                    status: d.status,
                                }); }),
                            }, 'delivery batch')];
                        case 1:
                            result = _a.sent();
                            if (!result.ok) {
                                throw new SerialBatchEventUploader_js_1.RetryableError('delivery POST failed', result.retryAfterMs);
                            }
                            return [2 /*return*/];
                    }
                });
            }); },
            baseDelayMs: 500,
            maxDelayMs: 30000,
            jitterMs: 500,
        });
        // Ack each received client_event so CCR can track delivery status.
        // Wired here (not in initialize()) so the callback is registered the
        // moment new CCRClient() returns — remoteIO must be free to call
        // transport.connect() immediately after without racing the first
        // SSE catch-up frame against an unwired onEventCallback.
        transport.setOnEvent(function (event) {
            _this.reportDelivery(event.event_id, 'received');
        });
    }
    /**
     * Initialize the session worker:
     * 1. Take worker_epoch from the argument, or fall back to
     *    CLAUDE_CODE_WORKER_EPOCH (set by env-manager / bridge spawner)
     * 2. Report state as 'idle'
     * 3. Start heartbeat timer
     *
     * In-process callers (replBridge) pass the epoch directly — they
     * registered the worker themselves and there is no parent process
     * setting env vars.
     */
    CCRClient.prototype.initialize = function (epoch) {
        return __awaiter(this, void 0, void 0, function () {
            var startMs, rawEpoch, restoredPromise, result, _a, metadata, durationMs;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        startMs = Date.now();
                        if (Object.keys(this.getAuthHeaders()).length === 0) {
                            throw new CCRInitError('no_auth_headers');
                        }
                        if (epoch === undefined) {
                            rawEpoch = process.env.CLAUDE_CODE_WORKER_EPOCH;
                            epoch = rawEpoch ? parseInt(rawEpoch, 10) : NaN;
                        }
                        if (isNaN(epoch)) {
                            throw new CCRInitError('missing_epoch');
                        }
                        this.workerEpoch = epoch;
                        restoredPromise = this.getWorkerState();
                        return [4 /*yield*/, this.request('put', '/worker', {
                                worker_status: 'idle',
                                worker_epoch: this.workerEpoch,
                                // Clear stale pending_action/task_summary left by a prior
                                // worker crash — the in-session clears don't survive process restart.
                                external_metadata: {
                                    pending_action: null,
                                    task_summary: null,
                                },
                            }, 'PUT worker (init)')];
                    case 1:
                        result = _b.sent();
                        if (!result.ok) {
                            // 409 → onEpochMismatch may throw, but request() catches it and returns
                            // false. Without this check we'd continue to startHeartbeat(), leaking a
                            // 20s timer against a dead epoch. Throw so connect()'s rejection handler
                            // fires instead of the success path.
                            throw new CCRInitError('worker_register_failed');
                        }
                        this.currentState = 'idle';
                        this.startHeartbeat();
                        // sessionActivity's refcount-gated timer fires while an API call or tool
                        // is in-flight; without a write the container lease can expire mid-wait.
                        // v1 wires this in WebSocketTransport per-connection.
                        (0, sessionActivity_js_1.registerSessionActivityCallback)(function () {
                            void _this.writeEvent({ type: 'keep_alive' });
                        });
                        (0, debug_js_1.logForDebugging)("CCRClient: initialized, epoch=".concat(this.workerEpoch));
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'cli_worker_lifecycle_initialized', {
                            epoch: this.workerEpoch,
                            duration_ms: Date.now() - startMs,
                        });
                        return [4 /*yield*/, restoredPromise];
                    case 2:
                        _a = _b.sent(), metadata = _a.metadata, durationMs = _a.durationMs;
                        if (!this.closed) {
                            (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'cli_worker_state_restored', {
                                duration_ms: durationMs,
                                had_state: metadata !== null,
                            });
                        }
                        return [2 /*return*/, metadata];
                }
            });
        });
    };
    // Control_requests are marked processed and not re-delivered on
    // restart, so read back what the prior worker wrote.
    CCRClient.prototype.getWorkerState = function () {
        return __awaiter(this, void 0, void 0, function () {
            var startMs, authHeaders, data;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        startMs = Date.now();
                        authHeaders = this.getAuthHeaders();
                        if (Object.keys(authHeaders).length === 0) {
                            return [2 /*return*/, { metadata: null, durationMs: 0 }];
                        }
                        return [4 /*yield*/, this.getWithRetry("".concat(this.sessionBaseUrl, "/worker"), authHeaders, 'worker_state')];
                    case 1:
                        data = _c.sent();
                        return [2 /*return*/, {
                                metadata: (_b = (_a = data === null || data === void 0 ? void 0 : data.worker) === null || _a === void 0 ? void 0 : _a.external_metadata) !== null && _b !== void 0 ? _b : null,
                                durationMs: Date.now() - startMs,
                            }];
                }
            });
        });
    };
    /**
     * Send an authenticated HTTP request to CCR. Handles auth headers,
     * 409 epoch mismatch, and error logging. Returns { ok: true } on 2xx.
     * On 429, reads Retry-After (integer seconds) so the uploader can honor
     * the server's backoff hint instead of blindly exponentiating.
     */
    CCRClient.prototype.request = function (method_1, path_1, body_1, label_1) {
        return __awaiter(this, arguments, void 0, function (method, path, body, label, _a) {
            var authHeaders, response, tok, exp, raw, seconds, error_1;
            var _b;
            var _c = _a === void 0 ? {} : _a, _d = _c.timeout, timeout = _d === void 0 ? 10000 : _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        authHeaders = this.getAuthHeaders();
                        if (Object.keys(authHeaders).length === 0)
                            return [2 /*return*/, { ok: false }];
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.http[method]("".concat(this.sessionBaseUrl).concat(path), body, {
                                headers: __assign(__assign({}, authHeaders), { 'Content-Type': 'application/json', 'anthropic-version': '2023-06-01', 'User-Agent': (0, userAgent_js_1.getClaudeCodeUserAgent)() }),
                                validateStatus: alwaysValidStatus,
                                timeout: timeout,
                            })];
                    case 2:
                        response = _e.sent();
                        if (response.status >= 200 && response.status < 300) {
                            this.consecutiveAuthFailures = 0;
                            return [2 /*return*/, { ok: true }];
                        }
                        if (response.status === 409) {
                            this.handleEpochMismatch();
                        }
                        if (response.status === 401 || response.status === 403) {
                            tok = (0, sessionIngressAuth_js_1.getSessionIngressAuthToken)();
                            exp = tok ? (0, jwtUtils_js_1.decodeJwtExpiry)(tok) : null;
                            if (exp !== null && exp * 1000 < Date.now()) {
                                (0, debug_js_1.logForDebugging)("CCRClient: session_token expired (exp=".concat(new Date(exp * 1000).toISOString(), ") \u2014 no refresh was delivered, exiting"), { level: 'error' });
                                (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'cli_worker_token_expired_no_refresh');
                                this.onEpochMismatch();
                            }
                            // Token looks valid but server says 401 — possible server-side
                            // blip (userauth down, KMS hiccup). Count toward threshold.
                            this.consecutiveAuthFailures++;
                            if (this.consecutiveAuthFailures >= MAX_CONSECUTIVE_AUTH_FAILURES) {
                                (0, debug_js_1.logForDebugging)("CCRClient: ".concat(this.consecutiveAuthFailures, " consecutive auth failures with a valid-looking token \u2014 server-side auth unrecoverable, exiting"), { level: 'error' });
                                (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'cli_worker_auth_failures_exhausted');
                                this.onEpochMismatch();
                            }
                        }
                        (0, debug_js_1.logForDebugging)("CCRClient: ".concat(label, " returned ").concat(response.status), {
                            level: 'warn',
                        });
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('warn', 'cli_worker_request_failed', {
                            method: method,
                            path: path,
                            status: response.status,
                        });
                        if (response.status === 429) {
                            raw = (_b = response.headers) === null || _b === void 0 ? void 0 : _b['retry-after'];
                            seconds = typeof raw === 'string' ? parseInt(raw, 10) : NaN;
                            if (!isNaN(seconds) && seconds >= 0) {
                                return [2 /*return*/, { ok: false, retryAfterMs: seconds * 1000 }];
                            }
                        }
                        return [2 /*return*/, { ok: false }];
                    case 3:
                        error_1 = _e.sent();
                        (0, debug_js_1.logForDebugging)("CCRClient: ".concat(label, " failed: ").concat((0, errors_js_1.errorMessage)(error_1)), {
                            level: 'warn',
                        });
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('warn', 'cli_worker_request_error', {
                            method: method,
                            path: path,
                            error_code: (0, errors_js_1.getErrnoCode)(error_1),
                        });
                        return [2 /*return*/, { ok: false }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /** Report worker state to CCR via PUT /sessions/{id}/worker. */
    CCRClient.prototype.reportState = function (state, details) {
        if (state === this.currentState && !details)
            return;
        this.currentState = state;
        this.workerState.enqueue({
            worker_status: state,
            requires_action_details: details
                ? {
                    tool_name: details.tool_name,
                    action_description: details.action_description,
                    request_id: details.request_id,
                }
                : null,
        });
    };
    /** Report external metadata to CCR via PUT /worker. */
    CCRClient.prototype.reportMetadata = function (metadata) {
        this.workerState.enqueue({ external_metadata: metadata });
    };
    /**
     * Handle epoch mismatch (409 Conflict). A newer CC instance has replaced
     * this one — exit immediately.
     */
    CCRClient.prototype.handleEpochMismatch = function () {
        (0, debug_js_1.logForDebugging)('CCRClient: Epoch mismatch (409), shutting down', {
            level: 'error',
        });
        (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'cli_worker_epoch_mismatch');
        this.onEpochMismatch();
    };
    /** Start periodic heartbeat. */
    CCRClient.prototype.startHeartbeat = function () {
        var _this = this;
        this.stopHeartbeat();
        var schedule = function () {
            var jitter = _this.heartbeatIntervalMs *
                _this.heartbeatJitterFraction *
                (2 * Math.random() - 1);
            _this.heartbeatTimer = setTimeout(tick, _this.heartbeatIntervalMs + jitter);
        };
        var tick = function () {
            void _this.sendHeartbeat();
            // stopHeartbeat nulls the timer; check after the fire-and-forget send
            // but before rescheduling so close() during sendHeartbeat is honored.
            if (_this.heartbeatTimer === null)
                return;
            schedule();
        };
        schedule();
    };
    /** Stop heartbeat timer. */
    CCRClient.prototype.stopHeartbeat = function () {
        if (this.heartbeatTimer) {
            clearTimeout(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    };
    /** Send a heartbeat via POST /sessions/{id}/worker/heartbeat. */
    CCRClient.prototype.sendHeartbeat = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.heartbeatInFlight)
                            return [2 /*return*/];
                        this.heartbeatInFlight = true;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 4]);
                        return [4 /*yield*/, this.request('post', '/worker/heartbeat', { session_id: this.sessionId, worker_epoch: this.workerEpoch }, 'Heartbeat', { timeout: 5000 })];
                    case 2:
                        result = _a.sent();
                        if (result.ok) {
                            (0, debug_js_1.logForDebugging)('CCRClient: Heartbeat sent');
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        this.heartbeatInFlight = false;
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Write a StdoutMessage as a client event via POST /sessions/{id}/worker/events.
     * These events are visible to frontend clients via the SSE stream.
     * Injects a UUID if missing to ensure server-side idempotency on retry.
     *
     * stream_event messages are held in a 100ms delay buffer and accumulated
     * (text_deltas for the same content block emit a full-so-far snapshot per
     * flush). A non-stream_event write flushes the buffer first so downstream
     * ordering is preserved.
     */
    CCRClient.prototype.writeEvent = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (message.type === 'stream_event') {
                            this.streamEventBuffer.push(message);
                            if (!this.streamEventTimer) {
                                this.streamEventTimer = setTimeout(function () { return void _this.flushStreamEventBuffer(); }, STREAM_EVENT_FLUSH_INTERVAL_MS);
                            }
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.flushStreamEventBuffer()];
                    case 1:
                        _a.sent();
                        if (message.type === 'assistant') {
                            clearStreamAccumulatorForMessage(this.streamTextAccumulator, message);
                        }
                        return [4 /*yield*/, this.eventUploader.enqueue(this.toClientEvent(message))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /** Wrap a StdoutMessage as a ClientEvent, injecting a UUID if missing. */
    CCRClient.prototype.toClientEvent = function (message) {
        var msg = message;
        return {
            payload: __assign(__assign({}, msg), { uuid: typeof msg.uuid === 'string' ? msg.uuid : (0, crypto_1.randomUUID)() }),
        };
    };
    /**
     * Drain the stream_event delay buffer: accumulate text_deltas into
     * full-so-far snapshots, clear the timer, enqueue the resulting events.
     * Called from the timer, from writeEvent on a non-stream message, and from
     * flush(). close() drops the buffer — call flush() first if you need
     * delivery.
     */
    CCRClient.prototype.flushStreamEventBuffer = function () {
        return __awaiter(this, void 0, void 0, function () {
            var buffered, payloads;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.streamEventTimer) {
                            clearTimeout(this.streamEventTimer);
                            this.streamEventTimer = null;
                        }
                        if (this.streamEventBuffer.length === 0)
                            return [2 /*return*/];
                        buffered = this.streamEventBuffer;
                        this.streamEventBuffer = [];
                        payloads = accumulateStreamEvents(buffered, this.streamTextAccumulator);
                        return [4 /*yield*/, this.eventUploader.enqueue(payloads.map(function (payload) { return ({ payload: payload, ephemeral: true }); }))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Write an internal worker event via POST /sessions/{id}/worker/internal-events.
     * These events are NOT visible to frontend clients — they store worker-internal
     * state (transcript messages, compaction markers) needed for session resume.
     */
    CCRClient.prototype.writeInternalEvent = function (eventType_1, payload_1) {
        return __awaiter(this, arguments, void 0, function (eventType, payload, _a) {
            var event;
            var _b = _a === void 0 ? {} : _a, _c = _b.isCompaction, isCompaction = _c === void 0 ? false : _c, agentId = _b.agentId;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        event = __assign(__assign({ payload: __assign(__assign({ type: eventType }, payload), { uuid: typeof payload.uuid === 'string' ? payload.uuid : (0, crypto_1.randomUUID)() }) }, (isCompaction && { is_compaction: true })), (agentId && { agent_id: agentId }));
                        return [4 /*yield*/, this.internalEventUploader.enqueue(event)];
                    case 1:
                        _d.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Flush pending internal events. Call between turns and on shutdown
     * to ensure transcript entries are persisted.
     */
    CCRClient.prototype.flushInternalEvents = function () {
        return this.internalEventUploader.flush();
    };
    /**
     * Flush pending client events (writeEvent queue). Call before close()
     * when the caller needs delivery confirmation — close() abandons the
     * queue. Resolves once the uploader drains or rejects; returns
     * regardless of whether individual POSTs succeeded (check server state
     * separately if that matters).
     */
    CCRClient.prototype.flush = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.flushStreamEventBuffer()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.eventUploader.flush()];
                }
            });
        });
    };
    /**
     * Read foreground agent internal events from
     * GET /sessions/{id}/worker/internal-events.
     * Returns transcript entries from the last compaction boundary, or null on failure.
     * Used for session resume.
     */
    CCRClient.prototype.readInternalEvents = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.paginatedGet('/worker/internal-events', {}, 'internal_events')];
            });
        });
    };
    /**
     * Read all subagent internal events from
     * GET /sessions/{id}/worker/internal-events?subagents=true.
     * Returns a merged stream across all non-foreground agents, each from its
     * compaction point. Used for session resume.
     */
    CCRClient.prototype.readSubagentInternalEvents = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.paginatedGet('/worker/internal-events', { subagents: 'true' }, 'subagent_events')];
            });
        });
    };
    /**
     * Paginated GET with retry. Fetches all pages from a list endpoint,
     * retrying each page on failure with exponential backoff + jitter.
     */
    CCRClient.prototype.paginatedGet = function (path, params, context) {
        return __awaiter(this, void 0, void 0, function () {
            var authHeaders, allEvents, cursor, url, _i, _a, _b, k, v, page;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        authHeaders = this.getAuthHeaders();
                        if (Object.keys(authHeaders).length === 0)
                            return [2 /*return*/, null];
                        allEvents = [];
                        _d.label = 1;
                    case 1:
                        url = new URL("".concat(this.sessionBaseUrl).concat(path));
                        for (_i = 0, _a = Object.entries(params); _i < _a.length; _i++) {
                            _b = _a[_i], k = _b[0], v = _b[1];
                            url.searchParams.set(k, v);
                        }
                        if (cursor) {
                            url.searchParams.set('cursor', cursor);
                        }
                        return [4 /*yield*/, this.getWithRetry(url.toString(), authHeaders, context)];
                    case 2:
                        page = _d.sent();
                        if (!page)
                            return [2 /*return*/, null];
                        allEvents.push.apply(allEvents, ((_c = page.data) !== null && _c !== void 0 ? _c : []));
                        cursor = page.next_cursor;
                        _d.label = 3;
                    case 3:
                        if (cursor) return [3 /*break*/, 1];
                        _d.label = 4;
                    case 4:
                        (0, debug_js_1.logForDebugging)("CCRClient: Read ".concat(allEvents.length, " internal events from ").concat(path).concat(params.subagents ? ' (subagents)' : ''));
                        return [2 /*return*/, allEvents];
                }
            });
        });
    };
    /**
     * Single GET request with retry. Returns the parsed response body
     * on success, null if all retries are exhausted.
     */
    CCRClient.prototype.getWithRetry = function (url, authHeaders, context) {
        return __awaiter(this, void 0, void 0, function () {
            var attempt, response, error_2, delay, delay;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        attempt = 1;
                        _a.label = 1;
                    case 1:
                        if (!(attempt <= 10)) return [3 /*break*/, 10];
                        response = void 0;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 7]);
                        return [4 /*yield*/, this.http.get(url, {
                                headers: __assign(__assign({}, authHeaders), { 'anthropic-version': '2023-06-01', 'User-Agent': (0, userAgent_js_1.getClaudeCodeUserAgent)() }),
                                validateStatus: alwaysValidStatus,
                                timeout: 30000,
                            })];
                    case 3:
                        response = _a.sent();
                        return [3 /*break*/, 7];
                    case 4:
                        error_2 = _a.sent();
                        (0, debug_js_1.logForDebugging)("CCRClient: GET ".concat(url, " failed (attempt ").concat(attempt, "/10): ").concat((0, errors_js_1.errorMessage)(error_2)), { level: 'warn' });
                        if (!(attempt < 10)) return [3 /*break*/, 6];
                        delay = Math.min(500 * Math.pow(2, (attempt - 1)), 30000) + Math.random() * 500;
                        return [4 /*yield*/, (0, sleep_js_1.sleep)(delay)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [3 /*break*/, 9];
                    case 7:
                        if (response.status >= 200 && response.status < 300) {
                            return [2 /*return*/, response.data];
                        }
                        if (response.status === 409) {
                            this.handleEpochMismatch();
                        }
                        (0, debug_js_1.logForDebugging)("CCRClient: GET ".concat(url, " returned ").concat(response.status, " (attempt ").concat(attempt, "/10)"), { level: 'warn' });
                        if (!(attempt < 10)) return [3 /*break*/, 9];
                        delay = Math.min(500 * Math.pow(2, (attempt - 1)), 30000) + Math.random() * 500;
                        return [4 /*yield*/, (0, sleep_js_1.sleep)(delay)];
                    case 8:
                        _a.sent();
                        _a.label = 9;
                    case 9:
                        attempt++;
                        return [3 /*break*/, 1];
                    case 10:
                        (0, debug_js_1.logForDebugging)('CCRClient: GET retries exhausted', { level: 'error' });
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'cli_worker_get_retries_exhausted', {
                            context: context,
                        });
                        return [2 /*return*/, null];
                }
            });
        });
    };
    /**
     * Report delivery status for a client-to-worker event.
     * POST /v1/code/sessions/{id}/worker/events/delivery (batch endpoint)
     */
    CCRClient.prototype.reportDelivery = function (eventId, status) {
        void this.deliveryUploader.enqueue({ eventId: eventId, status: status });
    };
    /** Get the current epoch (for external use). */
    CCRClient.prototype.getWorkerEpoch = function () {
        return this.workerEpoch;
    };
    Object.defineProperty(CCRClient.prototype, "internalEventsPending", {
        /** Internal-event queue depth — shutdown-snapshot backpressure signal. */
        get: function () {
            return this.internalEventUploader.pendingCount;
        },
        enumerable: false,
        configurable: true
    });
    /** Clean up uploaders and timers. */
    CCRClient.prototype.close = function () {
        this.closed = true;
        this.stopHeartbeat();
        (0, sessionActivity_js_1.unregisterSessionActivityCallback)();
        if (this.streamEventTimer) {
            clearTimeout(this.streamEventTimer);
            this.streamEventTimer = null;
        }
        this.streamEventBuffer = [];
        this.streamTextAccumulator.byMessage.clear();
        this.streamTextAccumulator.scopeToMessage.clear();
        this.workerState.close();
        this.eventUploader.close();
        this.internalEventUploader.close();
        this.deliveryUploader.close();
    };
    return CCRClient;
}());
exports.CCRClient = CCRClient;
