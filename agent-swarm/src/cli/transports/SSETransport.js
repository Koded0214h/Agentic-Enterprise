"use strict";
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
exports.SSETransport = void 0;
exports.parseSSEFrames = parseSSEFrames;
var axios_1 = require("axios");
var debug_js_1 = require("../../utils/debug.js");
var diagLogs_js_1 = require("../../utils/diagLogs.js");
var errors_js_1 = require("../../utils/errors.js");
var sessionIngressAuth_js_1 = require("../../utils/sessionIngressAuth.js");
var sleep_js_1 = require("../../utils/sleep.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var userAgent_js_1 = require("../../utils/userAgent.js");
// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
var RECONNECT_BASE_DELAY_MS = 1000;
var RECONNECT_MAX_DELAY_MS = 30000;
/** Time budget for reconnection attempts before giving up (10 minutes). */
var RECONNECT_GIVE_UP_MS = 600000;
/** Server sends keepalives every 15s; treat connection as dead after 45s of silence. */
var LIVENESS_TIMEOUT_MS = 45000;
/**
 * HTTP status codes that indicate a permanent server-side rejection.
 * The transport transitions to 'closed' immediately without retrying.
 */
var PERMANENT_HTTP_CODES = new Set([401, 403, 404]);
// POST retry configuration (matches HybridTransport)
var POST_MAX_RETRIES = 10;
var POST_BASE_DELAY_MS = 500;
var POST_MAX_DELAY_MS = 8000;
/** Hoisted TextDecoder options to avoid per-chunk allocation in readStream. */
var STREAM_DECODE_OPTS = { stream: true };
/** Hoisted axios validateStatus callback to avoid per-request closure allocation. */
function alwaysValidStatus() {
    return true;
}
/**
 * Incrementally parse SSE frames from a text buffer.
 * Returns parsed frames and the remaining (incomplete) buffer.
 *
 * @internal exported for testing
 */
function parseSSEFrames(buffer) {
    var frames = [];
    var pos = 0;
    // SSE frames are delimited by double newlines
    var idx;
    while ((idx = buffer.indexOf('\n\n', pos)) !== -1) {
        var rawFrame = buffer.slice(pos, idx);
        pos = idx + 2;
        // Skip empty frames
        if (!rawFrame.trim())
            continue;
        var frame = {};
        var isComment = false;
        for (var _i = 0, _a = rawFrame.split('\n'); _i < _a.length; _i++) {
            var line = _a[_i];
            if (line.startsWith(':')) {
                // SSE comment (e.g., `:keepalive`)
                isComment = true;
                continue;
            }
            var colonIdx = line.indexOf(':');
            if (colonIdx === -1)
                continue;
            var field = line.slice(0, colonIdx);
            // Per SSE spec, strip one leading space after colon if present
            var value = line[colonIdx + 1] === ' '
                ? line.slice(colonIdx + 2)
                : line.slice(colonIdx + 1);
            switch (field) {
                case 'event':
                    frame.event = value;
                    break;
                case 'id':
                    frame.id = value;
                    break;
                case 'data':
                    // Per SSE spec, multiple data: lines are concatenated with \n
                    frame.data = frame.data ? frame.data + '\n' + value : value;
                    break;
                // Ignore other fields (retry:, etc.)
            }
        }
        // Only emit frames that have data (or are pure comments which reset liveness)
        if (frame.data || isComment) {
            frames.push(frame);
        }
    }
    return { frames: frames, remaining: buffer.slice(pos) };
}
// ---------------------------------------------------------------------------
// SSETransport
// ---------------------------------------------------------------------------
/**
 * Transport that uses SSE for reading and HTTP POST for writing.
 *
 * Reads events via Server-Sent Events from the CCR v2 event stream endpoint.
 * Writes events via HTTP POST with retry logic (same pattern as HybridTransport).
 *
 * Each `event: client_event` frame carries a StreamClientEvent proto JSON
 * directly in `data:`. The transport extracts `payload` and passes it to
 * `onData` as newline-delimited JSON for StructuredIO consumers.
 *
 * Supports automatic reconnection with exponential backoff and Last-Event-ID
 * for resumption after disconnection.
 */
var SSETransport = /** @class */ (function () {
    // Runtime epoch for CCR v2 event format
    function SSETransport(url, headers, sessionId, refreshHeaders, initialSequenceNum, 
    /**
     * Per-instance auth header source. Omit to read the process-wide
     * CLAUDE_CODE_SESSION_ACCESS_TOKEN (single-session callers). Required
     * for concurrent multi-session callers — the env-var path is a process
     * global and would stomp across sessions.
     */
    getAuthHeaders) {
        if (headers === void 0) { headers = {}; }
        var _this = this;
        this.url = url;
        this.state = 'idle';
        // SSE connection state
        this.abortController = null;
        this.lastSequenceNum = 0;
        this.seenSequenceNums = new Set();
        // Reconnection state
        this.reconnectAttempts = 0;
        this.reconnectStartTime = null;
        this.reconnectTimer = null;
        // Liveness detection
        this.livenessTimer = null;
        /**
         * Bound timeout callback. Hoisted from an inline closure so that
         * resetLivenessTimer (called per-frame) does not allocate a new closure
         * on every SSE frame.
         */
        this.onLivenessTimeout = function () {
            var _a;
            _this.livenessTimer = null;
            (0, debug_js_1.logForDebugging)('SSETransport: Liveness timeout, reconnecting', {
                level: 'error',
            });
            (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'cli_sse_liveness_timeout');
            (_a = _this.abortController) === null || _a === void 0 ? void 0 : _a.abort();
            _this.handleConnectionError();
        };
        this.headers = headers;
        this.sessionId = sessionId;
        this.refreshHeaders = refreshHeaders;
        this.getAuthHeaders = getAuthHeaders !== null && getAuthHeaders !== void 0 ? getAuthHeaders : sessionIngressAuth_js_1.getSessionIngressAuthHeaders;
        this.postUrl = convertSSEUrlToPostUrl(url);
        // Seed with a caller-provided high-water mark so the first connect()
        // sends from_sequence_num / Last-Event-ID. Without this, a fresh
        // SSETransport always asks the server to replay from sequence 0 —
        // the entire session history on every transport swap.
        if (initialSequenceNum !== undefined && initialSequenceNum > 0) {
            this.lastSequenceNum = initialSequenceNum;
        }
        (0, debug_js_1.logForDebugging)("SSETransport: SSE URL = ".concat(url.href));
        (0, debug_js_1.logForDebugging)("SSETransport: POST URL = ".concat(this.postUrl));
        (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'cli_sse_transport_initialized');
    }
    /**
     * High-water mark of sequence numbers seen on this stream. Callers that
     * recreate the transport (e.g. replBridge onWorkReceived) read this before
     * close() and pass it as `initialSequenceNum` to the next instance so the
     * server resumes from the right point instead of replaying everything.
     */
    SSETransport.prototype.getLastSequenceNum = function () {
        return this.lastSequenceNum;
    };
    SSETransport.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var connectStartTime, sseUrl, authHeaders, headers, response, isPermanent, connectDuration, error_1;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (this.state !== 'idle' && this.state !== 'reconnecting') {
                            (0, debug_js_1.logForDebugging)("SSETransport: Cannot connect, current state is ".concat(this.state), { level: 'error' });
                            (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'cli_sse_connect_failed');
                            return [2 /*return*/];
                        }
                        this.state = 'reconnecting';
                        connectStartTime = Date.now();
                        sseUrl = new URL(this.url.href);
                        if (this.lastSequenceNum > 0) {
                            sseUrl.searchParams.set('from_sequence_num', String(this.lastSequenceNum));
                        }
                        authHeaders = this.getAuthHeaders();
                        headers = __assign(__assign(__assign({}, this.headers), authHeaders), { Accept: 'text/event-stream', 'anthropic-version': '2023-06-01', 'User-Agent': (0, userAgent_js_1.getClaudeCodeUserAgent)() });
                        if (authHeaders['Cookie']) {
                            delete headers['Authorization'];
                        }
                        if (this.lastSequenceNum > 0) {
                            headers['Last-Event-ID'] = String(this.lastSequenceNum);
                        }
                        (0, debug_js_1.logForDebugging)("SSETransport: Opening ".concat(sseUrl.href));
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'cli_sse_connect_opening');
                        this.abortController = new AbortController();
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, fetch(sseUrl.href, {
                                headers: headers,
                                signal: this.abortController.signal,
                            })];
                    case 2:
                        response = _c.sent();
                        if (!response.ok) {
                            isPermanent = PERMANENT_HTTP_CODES.has(response.status);
                            (0, debug_js_1.logForDebugging)("SSETransport: HTTP ".concat(response.status).concat(isPermanent ? ' (permanent)' : ''), { level: 'error' });
                            (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'cli_sse_connect_http_error', {
                                status: response.status,
                            });
                            if (isPermanent) {
                                this.state = 'closed';
                                (_a = this.onCloseCallback) === null || _a === void 0 ? void 0 : _a.call(this, response.status);
                                return [2 /*return*/];
                            }
                            this.handleConnectionError();
                            return [2 /*return*/];
                        }
                        if (!response.body) {
                            (0, debug_js_1.logForDebugging)('SSETransport: No response body');
                            this.handleConnectionError();
                            return [2 /*return*/];
                        }
                        connectDuration = Date.now() - connectStartTime;
                        (0, debug_js_1.logForDebugging)('SSETransport: Connected');
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'cli_sse_connect_connected', {
                            duration_ms: connectDuration,
                        });
                        this.state = 'connected';
                        this.reconnectAttempts = 0;
                        this.reconnectStartTime = null;
                        this.resetLivenessTimer();
                        // Read the SSE stream
                        return [4 /*yield*/, this.readStream(response.body)];
                    case 3:
                        // Read the SSE stream
                        _c.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _c.sent();
                        if ((_b = this.abortController) === null || _b === void 0 ? void 0 : _b.signal.aborted) {
                            // Intentional close
                            return [2 /*return*/];
                        }
                        (0, debug_js_1.logForDebugging)("SSETransport: Connection error: ".concat((0, errors_js_1.errorMessage)(error_1)), { level: 'error' });
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'cli_sse_connect_error');
                        this.handleConnectionError();
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Read and process the SSE stream body.
     */
    // eslint-disable-next-line eslint-plugin-n/no-unsupported-features/node-builtins
    SSETransport.prototype.readStream = function (body) {
        return __awaiter(this, void 0, void 0, function () {
            var reader, decoder, buffer, _a, done, value, _b, frames_2, remaining, _i, frames_1, frame, seqNum, threshold, _c, _d, s, error_2;
            var _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        reader = body.getReader();
                        decoder = new TextDecoder();
                        buffer = '';
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, 5, 6, 7]);
                        _f.label = 2;
                    case 2:
                        if (!true) return [3 /*break*/, 4];
                        return [4 /*yield*/, reader.read()];
                    case 3:
                        _a = _f.sent(), done = _a.done, value = _a.value;
                        if (done)
                            return [3 /*break*/, 4];
                        buffer += decoder.decode(value, STREAM_DECODE_OPTS);
                        _b = parseSSEFrames(buffer), frames_2 = _b.frames, remaining = _b.remaining;
                        buffer = remaining;
                        for (_i = 0, frames_1 = frames_2; _i < frames_1.length; _i++) {
                            frame = frames_1[_i];
                            // Any frame (including keepalive comments) proves the connection is alive
                            this.resetLivenessTimer();
                            if (frame.id) {
                                seqNum = parseInt(frame.id, 10);
                                if (!isNaN(seqNum)) {
                                    if (this.seenSequenceNums.has(seqNum)) {
                                        (0, debug_js_1.logForDebugging)("SSETransport: DUPLICATE frame seq=".concat(seqNum, " (lastSequenceNum=").concat(this.lastSequenceNum, ", seenCount=").concat(this.seenSequenceNums.size, ")"), { level: 'warn' });
                                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('warn', 'cli_sse_duplicate_sequence');
                                    }
                                    else {
                                        this.seenSequenceNums.add(seqNum);
                                        // Prevent unbounded growth: once we have many entries, prune
                                        // old sequence numbers that are well below the high-water mark.
                                        // Only sequence numbers near lastSequenceNum matter for dedup.
                                        if (this.seenSequenceNums.size > 1000) {
                                            threshold = this.lastSequenceNum - 200;
                                            for (_c = 0, _d = this.seenSequenceNums; _c < _d.length; _c++) {
                                                s = _d[_c];
                                                if (s < threshold) {
                                                    this.seenSequenceNums.delete(s);
                                                }
                                            }
                                        }
                                    }
                                    if (seqNum > this.lastSequenceNum) {
                                        this.lastSequenceNum = seqNum;
                                    }
                                }
                            }
                            if (frame.event && frame.data) {
                                this.handleSSEFrame(frame.event, frame.data);
                            }
                            else if (frame.data) {
                                // data: without event: — server is emitting the old envelope format
                                // or a bug. Log so incidents show as a signal instead of silent drops.
                                (0, debug_js_1.logForDebugging)('SSETransport: Frame has data: but no event: field — dropped', { level: 'warn' });
                                (0, diagLogs_js_1.logForDiagnosticsNoPII)('warn', 'cli_sse_frame_missing_event_field');
                            }
                        }
                        return [3 /*break*/, 2];
                    case 4: return [3 /*break*/, 7];
                    case 5:
                        error_2 = _f.sent();
                        if ((_e = this.abortController) === null || _e === void 0 ? void 0 : _e.signal.aborted)
                            return [2 /*return*/];
                        (0, debug_js_1.logForDebugging)("SSETransport: Stream read error: ".concat((0, errors_js_1.errorMessage)(error_2)), { level: 'error' });
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'cli_sse_stream_read_error');
                        return [3 /*break*/, 7];
                    case 6:
                        reader.releaseLock();
                        return [7 /*endfinally*/];
                    case 7:
                        // Stream ended — reconnect unless we're closing
                        if (this.state !== 'closing' && this.state !== 'closed') {
                            (0, debug_js_1.logForDebugging)('SSETransport: Stream ended, reconnecting');
                            this.handleConnectionError();
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle a single SSE frame. The event: field names the variant; data:
     * carries the inner proto JSON directly (no envelope).
     *
     * Worker subscribers only receive client_event frames (see notifier.go) —
     * any other event type indicates a server-side change that CC doesn't yet
     * understand. Log a diagnostic so we notice in telemetry.
     */
    SSETransport.prototype.handleSSEFrame = function (eventType, data) {
        var _a, _b;
        if (eventType !== 'client_event') {
            (0, debug_js_1.logForDebugging)("SSETransport: Unexpected SSE event type '".concat(eventType, "' on worker stream"), { level: 'warn' });
            (0, diagLogs_js_1.logForDiagnosticsNoPII)('warn', 'cli_sse_unexpected_event_type', {
                event_type: eventType,
            });
            return;
        }
        var ev;
        try {
            ev = (0, slowOperations_js_1.jsonParse)(data);
        }
        catch (error) {
            (0, debug_js_1.logForDebugging)("SSETransport: Failed to parse client_event data: ".concat((0, errors_js_1.errorMessage)(error)), { level: 'error' });
            return;
        }
        var payload = ev.payload;
        if (payload && typeof payload === 'object' && 'type' in payload) {
            var sessionLabel = this.sessionId ? " session=".concat(this.sessionId) : '';
            (0, debug_js_1.logForDebugging)("SSETransport: Event seq=".concat(ev.sequence_num, " event_id=").concat(ev.event_id, " event_type=").concat(ev.event_type, " payload_type=").concat(String(payload.type)).concat(sessionLabel));
            (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'cli_sse_message_received');
            // Pass the unwrapped payload as newline-delimited JSON,
            // matching the format that StructuredIO/WebSocketTransport consumers expect
            (_a = this.onData) === null || _a === void 0 ? void 0 : _a.call(this, (0, slowOperations_js_1.jsonStringify)(payload) + '\n');
        }
        else {
            (0, debug_js_1.logForDebugging)("SSETransport: Ignoring client_event with no type in payload: event_id=".concat(ev.event_id));
        }
        (_b = this.onEventCallback) === null || _b === void 0 ? void 0 : _b.call(this, ev);
    };
    /**
     * Handle connection errors with exponential backoff and time budget.
     */
    SSETransport.prototype.handleConnectionError = function () {
        var _this = this;
        var _a, _b;
        this.clearLivenessTimer();
        if (this.state === 'closing' || this.state === 'closed')
            return;
        // Abort any in-flight SSE fetch
        (_a = this.abortController) === null || _a === void 0 ? void 0 : _a.abort();
        this.abortController = null;
        var now = Date.now();
        if (!this.reconnectStartTime) {
            this.reconnectStartTime = now;
        }
        var elapsed = now - this.reconnectStartTime;
        if (elapsed < RECONNECT_GIVE_UP_MS) {
            // Clear any existing timer
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer);
                this.reconnectTimer = null;
            }
            // Refresh headers before reconnecting
            if (this.refreshHeaders) {
                var freshHeaders = this.refreshHeaders();
                Object.assign(this.headers, freshHeaders);
                (0, debug_js_1.logForDebugging)('SSETransport: Refreshed headers for reconnect');
            }
            this.state = 'reconnecting';
            this.reconnectAttempts++;
            var baseDelay = Math.min(RECONNECT_BASE_DELAY_MS * Math.pow(2, this.reconnectAttempts - 1), RECONNECT_MAX_DELAY_MS);
            // Add ±25% jitter
            var delay = Math.max(0, baseDelay + baseDelay * 0.25 * (2 * Math.random() - 1));
            (0, debug_js_1.logForDebugging)("SSETransport: Reconnecting in ".concat(Math.round(delay), "ms (attempt ").concat(this.reconnectAttempts, ", ").concat(Math.round(elapsed / 1000), "s elapsed)"));
            (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'cli_sse_reconnect_attempt', {
                reconnectAttempts: this.reconnectAttempts,
            });
            this.reconnectTimer = setTimeout(function () {
                _this.reconnectTimer = null;
                void _this.connect();
            }, delay);
        }
        else {
            (0, debug_js_1.logForDebugging)("SSETransport: Reconnection time budget exhausted after ".concat(Math.round(elapsed / 1000), "s"), { level: 'error' });
            (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'cli_sse_reconnect_exhausted', {
                reconnectAttempts: this.reconnectAttempts,
                elapsedMs: elapsed,
            });
            this.state = 'closed';
            (_b = this.onCloseCallback) === null || _b === void 0 ? void 0 : _b.call(this);
        }
    };
    /**
     * Reset the liveness timer. If no SSE frame arrives within the timeout,
     * treat the connection as dead and reconnect.
     */
    SSETransport.prototype.resetLivenessTimer = function () {
        this.clearLivenessTimer();
        this.livenessTimer = setTimeout(this.onLivenessTimeout, LIVENESS_TIMEOUT_MS);
    };
    SSETransport.prototype.clearLivenessTimer = function () {
        if (this.livenessTimer) {
            clearTimeout(this.livenessTimer);
            this.livenessTimer = null;
        }
    };
    // -----------------------------------------------------------------------
    // Write (HTTP POST) — same pattern as HybridTransport
    // -----------------------------------------------------------------------
    SSETransport.prototype.write = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var authHeaders, headers, attempt, response, error_3, axiosError, delayMs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        authHeaders = this.getAuthHeaders();
                        if (Object.keys(authHeaders).length === 0) {
                            (0, debug_js_1.logForDebugging)('SSETransport: No session token available for POST');
                            (0, diagLogs_js_1.logForDiagnosticsNoPII)('warn', 'cli_sse_post_no_token');
                            return [2 /*return*/];
                        }
                        headers = __assign(__assign({}, authHeaders), { 'Content-Type': 'application/json', 'anthropic-version': '2023-06-01', 'User-Agent': (0, userAgent_js_1.getClaudeCodeUserAgent)() });
                        (0, debug_js_1.logForDebugging)("SSETransport: POST body keys=".concat(Object.keys(message).join(',')));
                        attempt = 1;
                        _a.label = 1;
                    case 1:
                        if (!(attempt <= POST_MAX_RETRIES)) return [3 /*break*/, 8];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, axios_1.default.post(this.postUrl, message, {
                                headers: headers,
                                validateStatus: alwaysValidStatus,
                            })];
                    case 3:
                        response = _a.sent();
                        if (response.status === 200 || response.status === 201) {
                            (0, debug_js_1.logForDebugging)("SSETransport: POST success type=".concat(message.type));
                            return [2 /*return*/];
                        }
                        (0, debug_js_1.logForDebugging)("SSETransport: POST ".concat(response.status, " body=").concat((0, slowOperations_js_1.jsonStringify)(response.data).slice(0, 200)));
                        // 4xx errors (except 429) are permanent - don't retry
                        if (response.status >= 400 &&
                            response.status < 500 &&
                            response.status !== 429) {
                            (0, debug_js_1.logForDebugging)("SSETransport: POST returned ".concat(response.status, " (client error), not retrying"));
                            (0, diagLogs_js_1.logForDiagnosticsNoPII)('warn', 'cli_sse_post_client_error', {
                                status: response.status,
                            });
                            return [2 /*return*/];
                        }
                        // 429 or 5xx - retry
                        (0, debug_js_1.logForDebugging)("SSETransport: POST returned ".concat(response.status, ", attempt ").concat(attempt, "/").concat(POST_MAX_RETRIES));
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('warn', 'cli_sse_post_retryable_error', {
                            status: response.status,
                            attempt: attempt,
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        error_3 = _a.sent();
                        axiosError = error_3;
                        (0, debug_js_1.logForDebugging)("SSETransport: POST error: ".concat(axiosError.message, ", attempt ").concat(attempt, "/").concat(POST_MAX_RETRIES));
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('warn', 'cli_sse_post_network_error', {
                            attempt: attempt,
                        });
                        return [3 /*break*/, 5];
                    case 5:
                        if (attempt === POST_MAX_RETRIES) {
                            (0, debug_js_1.logForDebugging)("SSETransport: POST failed after ".concat(POST_MAX_RETRIES, " attempts, continuing"));
                            (0, diagLogs_js_1.logForDiagnosticsNoPII)('warn', 'cli_sse_post_retries_exhausted');
                            return [2 /*return*/];
                        }
                        delayMs = Math.min(POST_BASE_DELAY_MS * Math.pow(2, attempt - 1), POST_MAX_DELAY_MS);
                        return [4 /*yield*/, (0, sleep_js_1.sleep)(delayMs)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        attempt++;
                        return [3 /*break*/, 1];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    // -----------------------------------------------------------------------
    // Transport interface
    // -----------------------------------------------------------------------
    SSETransport.prototype.isConnectedStatus = function () {
        return this.state === 'connected';
    };
    SSETransport.prototype.isClosedStatus = function () {
        return this.state === 'closed';
    };
    SSETransport.prototype.setOnData = function (callback) {
        this.onData = callback;
    };
    SSETransport.prototype.setOnClose = function (callback) {
        this.onCloseCallback = callback;
    };
    SSETransport.prototype.setOnEvent = function (callback) {
        this.onEventCallback = callback;
    };
    SSETransport.prototype.close = function () {
        var _a;
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        this.clearLivenessTimer();
        this.state = 'closing';
        (_a = this.abortController) === null || _a === void 0 ? void 0 : _a.abort();
        this.abortController = null;
    };
    return SSETransport;
}());
exports.SSETransport = SSETransport;
// ---------------------------------------------------------------------------
// URL Conversion
// ---------------------------------------------------------------------------
/**
 * Convert an SSE URL to the HTTP POST endpoint URL.
 * The SSE stream URL and POST URL share the same base; the POST endpoint
 * is at `/events` (without `/stream`).
 *
 * From: https://api.example.com/v2/session_ingress/session/<session_id>/events/stream
 * To:   https://api.example.com/v2/session_ingress/session/<session_id>/events
 */
function convertSSEUrlToPostUrl(sseUrl) {
    var pathname = sseUrl.pathname;
    // Remove /stream suffix to get the POST events endpoint
    if (pathname.endsWith('/stream')) {
        pathname = pathname.slice(0, -'/stream'.length);
    }
    return "".concat(sseUrl.protocol, "//").concat(sseUrl.host).concat(pathname);
}
