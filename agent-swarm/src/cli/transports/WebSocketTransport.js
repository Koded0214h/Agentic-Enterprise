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
exports.WebSocketTransport = void 0;
var index_js_1 = require("../../services/analytics/index.js");
var CircularBuffer_js_1 = require("../../utils/CircularBuffer.js");
var debug_js_1 = require("../../utils/debug.js");
var diagLogs_js_1 = require("../../utils/diagLogs.js");
var envUtils_js_1 = require("../../utils/envUtils.js");
var mtls_js_1 = require("../../utils/mtls.js");
var proxy_js_1 = require("../../utils/proxy.js");
var sessionActivity_js_1 = require("../../utils/sessionActivity.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var KEEP_ALIVE_FRAME = '{"type":"keep_alive"}\n';
var DEFAULT_MAX_BUFFER_SIZE = 1000;
var DEFAULT_BASE_RECONNECT_DELAY = 1000;
var DEFAULT_MAX_RECONNECT_DELAY = 30000;
/** Time budget for reconnection attempts before giving up (10 minutes). */
var DEFAULT_RECONNECT_GIVE_UP_MS = 600000;
var DEFAULT_PING_INTERVAL = 10000;
var DEFAULT_KEEPALIVE_INTERVAL = 300000; // 5 minutes
/**
 * Threshold for detecting system sleep/wake. If the gap between consecutive
 * reconnection attempts exceeds this, the machine likely slept. We reset
 * the reconnection budget and retry — the server will reject with permanent
 * close codes (4001/1002) if the session was reaped during sleep.
 */
var SLEEP_DETECTION_THRESHOLD_MS = DEFAULT_MAX_RECONNECT_DELAY * 2; // 60s
/**
 * WebSocket close codes that indicate a permanent server-side rejection.
 * The transport transitions to 'closed' immediately without retrying.
 */
var PERMANENT_CLOSE_CODES = new Set([
    1002, // protocol error — server rejected handshake (e.g. session reaped)
    4001, // session expired / not found
    4003, // unauthorized
]);
var WebSocketTransport = /** @class */ (function () {
    function WebSocketTransport(url, headers, sessionId, refreshHeaders, options) {
        if (headers === void 0) { headers = {}; }
        var _this = this;
        var _a, _b;
        this.ws = null;
        this.lastSentId = null;
        this.state = 'idle';
        // Reconnection state
        this.reconnectAttempts = 0;
        this.reconnectStartTime = null;
        this.reconnectTimer = null;
        this.lastReconnectAttemptTime = null;
        // Wall-clock of last WS data-frame activity (inbound message or outbound
        // ws.send). Used to compute idle time at close — the signal for diagnosing
        // proxy idle-timeout RSTs (e.g. Cloudflare 5-min). Excludes ping/pong
        // control frames (proxies don't count those).
        this.lastActivityTime = 0;
        // Ping interval for connection health checks
        this.pingInterval = null;
        this.pongReceived = true;
        // Periodic keep_alive data frames to reset proxy idle timers
        this.keepAliveInterval = null;
        // Track which runtime's WS we're using so we can detach listeners
        // with the matching API (removeEventListener vs. off).
        this.isBunWs = false;
        // Captured at connect() time for handleOpenEvent timing. Stored as an
        // instance field so the onOpen handler can be a stable class-property
        // arrow function (removable in doDisconnect) instead of a closure over
        // a local variable.
        this.connectStartTime = 0;
        // --- Bun (native WebSocket) event handlers ---
        // Stored as class-property arrow functions so they can be removed in
        // doDisconnect(). Without removal, each reconnect orphans the old WS
        // object + its 5 closures until GC, which accumulates under network
        // instability. Mirrors the pattern in src/utils/mcpWebSocketTransport.ts.
        this.onBunOpen = function () {
            _this.handleOpenEvent();
            // Bun's WebSocket doesn't expose upgrade response headers,
            // so replay all buffered messages. The server deduplicates by UUID.
            if (_this.lastSentId) {
                _this.replayBufferedMessages('');
            }
        };
        this.onBunMessage = function (event) {
            var message = typeof event.data === 'string' ? event.data : String(event.data);
            _this.lastActivityTime = Date.now();
            (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'cli_websocket_message_received', {
                length: message.length,
            });
            if (_this.onData) {
                _this.onData(message);
            }
        };
        this.onBunError = function () {
            (0, debug_js_1.logForDebugging)('WebSocketTransport: Error', {
                level: 'error',
            });
            (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'cli_websocket_connect_error');
            // close event fires after error — let it call handleConnectionError
        };
        // eslint-disable-next-line eslint-plugin-n/no-unsupported-features/node-builtins
        this.onBunClose = function (event) {
            var isClean = event.code === 1000 || event.code === 1001;
            (0, debug_js_1.logForDebugging)("WebSocketTransport: Closed: ".concat(event.code), isClean ? undefined : { level: 'error' });
            (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'cli_websocket_connect_closed');
            _this.handleConnectionError(event.code);
        };
        // --- Node (ws package) event handlers ---
        this.onNodeOpen = function () {
            var _a;
            // Capture ws before handleOpenEvent() invokes onConnectCallback — if the
            // callback synchronously closes the transport, this.ws becomes null.
            // The old inline-closure code had this safety implicitly via closure capture.
            var ws = _this.ws;
            _this.handleOpenEvent();
            if (!ws)
                return;
            // Check for last-id in upgrade response headers (ws package only)
            var nws = ws;
            var upgradeResponse = nws.upgradeReq;
            if ((_a = upgradeResponse === null || upgradeResponse === void 0 ? void 0 : upgradeResponse.headers) === null || _a === void 0 ? void 0 : _a['x-last-request-id']) {
                var serverLastId = upgradeResponse.headers['x-last-request-id'];
                _this.replayBufferedMessages(serverLastId);
            }
        };
        this.onNodeMessage = function (data) {
            var message = data.toString();
            _this.lastActivityTime = Date.now();
            (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'cli_websocket_message_received', {
                length: message.length,
            });
            if (_this.onData) {
                _this.onData(message);
            }
        };
        this.onNodeError = function (err) {
            (0, debug_js_1.logForDebugging)("WebSocketTransport: Error: ".concat(err.message), {
                level: 'error',
            });
            (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'cli_websocket_connect_error');
            // close event fires after error — let it call handleConnectionError
        };
        this.onNodeClose = function (code, _reason) {
            var isClean = code === 1000 || code === 1001;
            (0, debug_js_1.logForDebugging)("WebSocketTransport: Closed: ".concat(code), isClean ? undefined : { level: 'error' });
            (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'cli_websocket_connect_closed');
            _this.handleConnectionError(code);
        };
        // --- Shared handlers ---
        this.onPong = function () {
            _this.pongReceived = true;
        };
        this.url = url;
        this.headers = headers;
        this.sessionId = sessionId;
        this.refreshHeaders = refreshHeaders;
        this.autoReconnect = (_a = options === null || options === void 0 ? void 0 : options.autoReconnect) !== null && _a !== void 0 ? _a : true;
        this.isBridge = (_b = options === null || options === void 0 ? void 0 : options.isBridge) !== null && _b !== void 0 ? _b : false;
        this.messageBuffer = new CircularBuffer_js_1.CircularBuffer(DEFAULT_MAX_BUFFER_SIZE);
    }
    WebSocketTransport.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var headers, ws, WS, ws;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.state !== 'idle' && this.state !== 'reconnecting') {
                            (0, debug_js_1.logForDebugging)("WebSocketTransport: Cannot connect, current state is ".concat(this.state), { level: 'error' });
                            (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'cli_websocket_connect_failed');
                            return [2 /*return*/];
                        }
                        this.state = 'reconnecting';
                        this.connectStartTime = Date.now();
                        (0, debug_js_1.logForDebugging)("WebSocketTransport: Opening ".concat(this.url.href));
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'cli_websocket_connect_opening');
                        headers = __assign({}, this.headers);
                        if (this.lastSentId) {
                            headers['X-Last-Request-Id'] = this.lastSentId;
                            (0, debug_js_1.logForDebugging)("WebSocketTransport: Adding X-Last-Request-Id header: ".concat(this.lastSentId));
                        }
                        if (!(typeof Bun !== 'undefined')) return [3 /*break*/, 1];
                        ws = new globalThis.WebSocket(this.url.href, {
                            headers: headers,
                            proxy: (0, proxy_js_1.getWebSocketProxyUrl)(this.url.href),
                            tls: (0, mtls_js_1.getWebSocketTLSOptions)() || undefined,
                        });
                        this.ws = ws;
                        this.isBunWs = true;
                        ws.addEventListener('open', this.onBunOpen);
                        ws.addEventListener('message', this.onBunMessage);
                        ws.addEventListener('error', this.onBunError);
                        // eslint-disable-next-line eslint-plugin-n/no-unsupported-features/node-builtins
                        ws.addEventListener('close', this.onBunClose);
                        // 'pong' is Bun-specific — not in DOM typings.
                        ws.addEventListener('pong', this.onPong);
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, Promise.resolve().then(function () { return require('ws'); })];
                    case 2:
                        WS = (_a.sent()).default;
                        ws = new WS(this.url.href, __assign({ headers: headers, agent: (0, proxy_js_1.getWebSocketProxyAgent)(this.url.href) }, (0, mtls_js_1.getWebSocketTLSOptions)()));
                        this.ws = ws;
                        this.isBunWs = false;
                        ws.on('open', this.onNodeOpen);
                        ws.on('message', this.onNodeMessage);
                        ws.on('error', this.onNodeError);
                        ws.on('close', this.onNodeClose);
                        ws.on('pong', this.onPong);
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    WebSocketTransport.prototype.handleOpenEvent = function () {
        var _this = this;
        var _a;
        var connectDuration = Date.now() - this.connectStartTime;
        (0, debug_js_1.logForDebugging)('WebSocketTransport: Connected');
        (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'cli_websocket_connect_connected', {
            duration_ms: connectDuration,
        });
        // Reconnect success — capture attempt count + downtime before resetting.
        // reconnectStartTime is null on first connect, non-null on reopen.
        if (this.isBridge && this.reconnectStartTime !== null) {
            (0, index_js_1.logEvent)('tengu_ws_transport_reconnected', {
                attempts: this.reconnectAttempts,
                downtimeMs: Date.now() - this.reconnectStartTime,
            });
        }
        this.reconnectAttempts = 0;
        this.reconnectStartTime = null;
        this.lastReconnectAttemptTime = null;
        this.lastActivityTime = Date.now();
        this.state = 'connected';
        (_a = this.onConnectCallback) === null || _a === void 0 ? void 0 : _a.call(this);
        // Start periodic pings to detect dead connections
        this.startPingInterval();
        // Start periodic keep_alive data frames to reset proxy idle timers
        this.startKeepaliveInterval();
        // Register callback for session activity signals
        (0, sessionActivity_js_1.registerSessionActivityCallback)(function () {
            void _this.write({ type: 'keep_alive' });
        });
    };
    WebSocketTransport.prototype.sendLine = function (line) {
        if (!this.ws || this.state !== 'connected') {
            (0, debug_js_1.logForDebugging)('WebSocketTransport: Not connected');
            (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'cli_websocket_send_not_connected');
            return false;
        }
        try {
            this.ws.send(line);
            this.lastActivityTime = Date.now();
            return true;
        }
        catch (error) {
            (0, debug_js_1.logForDebugging)("WebSocketTransport: Failed to send: ".concat(error), {
                level: 'error',
            });
            (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'cli_websocket_send_error');
            // Don't null this.ws here — let doDisconnect() (via handleConnectionError)
            // handle cleanup so listeners are removed before the WS is released.
            this.handleConnectionError();
            return false;
        }
    };
    /**
     * Remove all listeners attached in connect() for the given WebSocket.
     * Without this, each reconnect orphans the old WS object + its closures
     * until GC — these accumulate under network instability. Mirrors the
     * pattern in src/utils/mcpWebSocketTransport.ts.
     */
    WebSocketTransport.prototype.removeWsListeners = function (ws) {
        if (this.isBunWs) {
            var nws = ws;
            nws.removeEventListener('open', this.onBunOpen);
            nws.removeEventListener('message', this.onBunMessage);
            nws.removeEventListener('error', this.onBunError);
            // eslint-disable-next-line eslint-plugin-n/no-unsupported-features/node-builtins
            nws.removeEventListener('close', this.onBunClose);
            // 'pong' is Bun-specific — not in DOM typings
            nws.removeEventListener('pong', this.onPong);
        }
        else {
            var nws = ws;
            nws.off('open', this.onNodeOpen);
            nws.off('message', this.onNodeMessage);
            nws.off('error', this.onNodeError);
            nws.off('close', this.onNodeClose);
            nws.off('pong', this.onPong);
        }
    };
    WebSocketTransport.prototype.doDisconnect = function () {
        // Stop pinging and keepalive when disconnecting
        this.stopPingInterval();
        this.stopKeepaliveInterval();
        // Unregister session activity callback
        (0, sessionActivity_js_1.unregisterSessionActivityCallback)();
        if (this.ws) {
            // Remove listeners BEFORE close() so the old WS + closures can be
            // GC'd promptly instead of lingering until the next mark-and-sweep.
            this.removeWsListeners(this.ws);
            this.ws.close();
            this.ws = null;
        }
    };
    WebSocketTransport.prototype.handleConnectionError = function (closeCode) {
        var _this = this;
        var _a, _b;
        (0, debug_js_1.logForDebugging)("WebSocketTransport: Disconnected from ".concat(this.url.href) +
            (closeCode != null ? " (code ".concat(closeCode, ")") : ''));
        (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'cli_websocket_disconnected');
        if (this.isBridge) {
            // Fire on every close — including intermediate ones during a reconnect
            // storm (those never surface to the onCloseCallback consumer). For the
            // Cloudflare-5min-idle hypothesis: cluster msSinceLastActivity; if the
            // peak sits at ~300s with closeCode 1006, that's the proxy RST.
            (0, index_js_1.logEvent)('tengu_ws_transport_closed', {
                closeCode: closeCode,
                msSinceLastActivity: this.lastActivityTime > 0 ? Date.now() - this.lastActivityTime : -1,
                // 'connected' = healthy drop (the Cloudflare case); 'reconnecting' =
                // connect-rejection mid-storm. State isn't mutated until the branches
                // below, so this reads the pre-close value.
                wasConnected: this.state === 'connected',
                reconnectAttempts: this.reconnectAttempts,
            });
        }
        this.doDisconnect();
        if (this.state === 'closing' || this.state === 'closed')
            return;
        // Permanent codes: don't retry — server has definitively ended the session.
        // Exception: 4003 (unauthorized) can be retried when refreshHeaders is
        // available and returns a new token (e.g. after the parent process mints
        // a fresh session ingress token during reconnection).
        var headersRefreshed = false;
        if (closeCode === 4003 && this.refreshHeaders) {
            var freshHeaders = this.refreshHeaders();
            if (freshHeaders.Authorization !== this.headers.Authorization) {
                Object.assign(this.headers, freshHeaders);
                headersRefreshed = true;
                (0, debug_js_1.logForDebugging)('WebSocketTransport: 4003 received but headers refreshed, scheduling reconnect');
                (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'cli_websocket_4003_token_refreshed');
            }
        }
        if (closeCode != null &&
            PERMANENT_CLOSE_CODES.has(closeCode) &&
            !headersRefreshed) {
            (0, debug_js_1.logForDebugging)("WebSocketTransport: Permanent close code ".concat(closeCode, ", not reconnecting"), { level: 'error' });
            (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'cli_websocket_permanent_close', {
                closeCode: closeCode,
            });
            this.state = 'closed';
            (_a = this.onCloseCallback) === null || _a === void 0 ? void 0 : _a.call(this, closeCode);
            return;
        }
        // When autoReconnect is disabled, go straight to closed state.
        // The caller (e.g. REPL bridge poll loop) handles recovery.
        if (!this.autoReconnect) {
            this.state = 'closed';
            (_b = this.onCloseCallback) === null || _b === void 0 ? void 0 : _b.call(this, closeCode);
            return;
        }
        // Schedule reconnection with exponential backoff and time budget
        var now = Date.now();
        if (!this.reconnectStartTime) {
            this.reconnectStartTime = now;
        }
        // Detect system sleep/wake: if the gap since our last reconnection
        // attempt greatly exceeds the max delay, the machine likely slept
        // (e.g. laptop lid closed). Reset the budget and retry from scratch —
        // the server will reject with permanent close codes (4001/1002) if
        // the session was reaped while we were asleep.
        if (this.lastReconnectAttemptTime !== null &&
            now - this.lastReconnectAttemptTime > SLEEP_DETECTION_THRESHOLD_MS) {
            (0, debug_js_1.logForDebugging)("WebSocketTransport: Detected system sleep (".concat(Math.round((now - this.lastReconnectAttemptTime) / 1000), "s gap), resetting reconnection budget"));
            (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'cli_websocket_sleep_detected', {
                gapMs: now - this.lastReconnectAttemptTime,
            });
            this.reconnectStartTime = now;
            this.reconnectAttempts = 0;
        }
        this.lastReconnectAttemptTime = now;
        var elapsed = now - this.reconnectStartTime;
        if (elapsed < DEFAULT_RECONNECT_GIVE_UP_MS) {
            // Clear any existing reconnection timer to avoid duplicates
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer);
                this.reconnectTimer = null;
            }
            // Refresh headers before reconnecting (e.g. to pick up a new session token).
            // Skip if already refreshed by the 4003 path above.
            if (!headersRefreshed && this.refreshHeaders) {
                var freshHeaders = this.refreshHeaders();
                Object.assign(this.headers, freshHeaders);
                (0, debug_js_1.logForDebugging)('WebSocketTransport: Refreshed headers for reconnect');
            }
            this.state = 'reconnecting';
            this.reconnectAttempts++;
            var baseDelay = Math.min(DEFAULT_BASE_RECONNECT_DELAY * Math.pow(2, this.reconnectAttempts - 1), DEFAULT_MAX_RECONNECT_DELAY);
            // Add ±25% jitter to avoid thundering herd
            var delay = Math.max(0, baseDelay + baseDelay * 0.25 * (2 * Math.random() - 1));
            (0, debug_js_1.logForDebugging)("WebSocketTransport: Reconnecting in ".concat(Math.round(delay), "ms (attempt ").concat(this.reconnectAttempts, ", ").concat(Math.round(elapsed / 1000), "s elapsed)"));
            (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'cli_websocket_reconnect_attempt', {
                reconnectAttempts: this.reconnectAttempts,
            });
            if (this.isBridge) {
                (0, index_js_1.logEvent)('tengu_ws_transport_reconnecting', {
                    attempt: this.reconnectAttempts,
                    elapsedMs: elapsed,
                    delayMs: Math.round(delay),
                });
            }
            this.reconnectTimer = setTimeout(function () {
                _this.reconnectTimer = null;
                void _this.connect();
            }, delay);
        }
        else {
            (0, debug_js_1.logForDebugging)("WebSocketTransport: Reconnection time budget exhausted after ".concat(Math.round(elapsed / 1000), "s for ").concat(this.url.href), { level: 'error' });
            (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'cli_websocket_reconnect_exhausted', {
                reconnectAttempts: this.reconnectAttempts,
                elapsedMs: elapsed,
            });
            this.state = 'closed';
            // Notify close callback
            if (this.onCloseCallback) {
                this.onCloseCallback(closeCode);
            }
        }
    };
    WebSocketTransport.prototype.close = function () {
        // Clear any pending reconnection timer
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        // Clear ping and keepalive intervals
        this.stopPingInterval();
        this.stopKeepaliveInterval();
        // Unregister session activity callback
        (0, sessionActivity_js_1.unregisterSessionActivityCallback)();
        this.state = 'closing';
        this.doDisconnect();
    };
    WebSocketTransport.prototype.replayBufferedMessages = function (lastId) {
        var messages = this.messageBuffer.toArray();
        if (messages.length === 0)
            return;
        // Find where to start replay based on server's last received message
        var startIndex = 0;
        if (lastId) {
            var lastConfirmedIndex = messages.findIndex(function (message) { return 'uuid' in message && message.uuid === lastId; });
            if (lastConfirmedIndex >= 0) {
                // Server confirmed messages up to lastConfirmedIndex — evict them
                startIndex = lastConfirmedIndex + 1;
                // Rebuild the buffer with only unconfirmed messages
                var remaining = messages.slice(startIndex);
                this.messageBuffer.clear();
                this.messageBuffer.addAll(remaining);
                if (remaining.length === 0) {
                    this.lastSentId = null;
                }
                (0, debug_js_1.logForDebugging)("WebSocketTransport: Evicted ".concat(startIndex, " confirmed messages, ").concat(remaining.length, " remaining"));
                (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'cli_websocket_evicted_confirmed_messages', {
                    evicted: startIndex,
                    remaining: remaining.length,
                });
            }
        }
        var messagesToReplay = messages.slice(startIndex);
        if (messagesToReplay.length === 0) {
            (0, debug_js_1.logForDebugging)('WebSocketTransport: No new messages to replay');
            (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'cli_websocket_no_messages_to_replay');
            return;
        }
        (0, debug_js_1.logForDebugging)("WebSocketTransport: Replaying ".concat(messagesToReplay.length, " buffered messages"));
        (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'cli_websocket_messages_to_replay', {
            count: messagesToReplay.length,
        });
        for (var _i = 0, messagesToReplay_1 = messagesToReplay; _i < messagesToReplay_1.length; _i++) {
            var message = messagesToReplay_1[_i];
            var line = (0, slowOperations_js_1.jsonStringify)(message) + '\n';
            var success = this.sendLine(line);
            if (!success) {
                this.handleConnectionError();
                break;
            }
        }
        // Do NOT clear the buffer after replay — messages remain buffered until
        // the server confirms receipt on the next reconnection. This prevents
        // message loss if the connection drops after replay but before the server
        // processes the messages.
    };
    WebSocketTransport.prototype.isConnectedStatus = function () {
        return this.state === 'connected';
    };
    WebSocketTransport.prototype.isClosedStatus = function () {
        return this.state === 'closed';
    };
    WebSocketTransport.prototype.setOnData = function (callback) {
        this.onData = callback;
    };
    WebSocketTransport.prototype.setOnConnect = function (callback) {
        this.onConnectCallback = callback;
    };
    WebSocketTransport.prototype.setOnClose = function (callback) {
        this.onCloseCallback = callback;
    };
    WebSocketTransport.prototype.getStateLabel = function () {
        return this.state;
    };
    WebSocketTransport.prototype.write = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var line, sessionLabel, detailLabel;
            return __generator(this, function (_a) {
                if ('uuid' in message && typeof message.uuid === 'string') {
                    this.messageBuffer.add(message);
                    this.lastSentId = message.uuid;
                }
                line = (0, slowOperations_js_1.jsonStringify)(message) + '\n';
                if (this.state !== 'connected') {
                    // Message buffered for replay when connected (if it has a UUID)
                    return [2 /*return*/];
                }
                sessionLabel = this.sessionId ? " session=".concat(this.sessionId) : '';
                detailLabel = this.getControlMessageDetailLabel(message);
                (0, debug_js_1.logForDebugging)("WebSocketTransport: Sending message type=".concat(message.type).concat(sessionLabel).concat(detailLabel));
                this.sendLine(line);
                return [2 /*return*/];
            });
        });
    };
    WebSocketTransport.prototype.getControlMessageDetailLabel = function (message) {
        if (message.type === 'control_request') {
            var request_id = message.request_id, request = message.request;
            var toolName = request.subtype === 'can_use_tool' ? request.tool_name : '';
            return " subtype=".concat(request.subtype, " request_id=").concat(request_id).concat(toolName ? " tool=".concat(toolName) : '');
        }
        if (message.type === 'control_response') {
            var _a = message.response, subtype = _a.subtype, request_id = _a.request_id;
            return " subtype=".concat(subtype, " request_id=").concat(request_id);
        }
        return '';
    };
    WebSocketTransport.prototype.startPingInterval = function () {
        var _this = this;
        // Clear any existing interval
        this.stopPingInterval();
        this.pongReceived = true;
        var lastTickTime = Date.now();
        // Send ping periodically to detect dead connections.
        // If the previous ping got no pong, treat the connection as dead.
        this.pingInterval = setInterval(function () {
            var _a, _b;
            if (_this.state === 'connected' && _this.ws) {
                var now = Date.now();
                var gap = now - lastTickTime;
                lastTickTime = now;
                // Process-suspension detector. If the wall-clock gap between ticks
                // greatly exceeds the 10s interval, the process was suspended
                // (laptop lid, SIGSTOP, VM pause). setInterval does not queue
                // missed ticks — it coalesces — so on wake this callback fires
                // once with a huge gap. The socket is almost certainly dead:
                // NAT mappings drop in 30s–5min, and the server has been
                // retransmitting into the void. Don't wait for a ping/pong
                // round-trip to confirm (ws.ping() on a dead socket returns
                // immediately with no error — bytes go into the kernel send
                // buffer). Assume dead and reconnect now. A spurious reconnect
                // after a short sleep is cheap — replayBufferedMessages() handles
                // it and the server dedups by UUID.
                if (gap > SLEEP_DETECTION_THRESHOLD_MS) {
                    (0, debug_js_1.logForDebugging)("WebSocketTransport: ".concat(Math.round(gap / 1000), "s tick gap detected \u2014 process was suspended, forcing reconnect"));
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'cli_websocket_sleep_detected_on_ping', { gapMs: gap });
                    _this.handleConnectionError();
                    return;
                }
                if (!_this.pongReceived) {
                    (0, debug_js_1.logForDebugging)('WebSocketTransport: No pong received, connection appears dead', { level: 'error' });
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'cli_websocket_pong_timeout');
                    _this.handleConnectionError();
                    return;
                }
                _this.pongReceived = false;
                try {
                    (_b = (_a = _this.ws).ping) === null || _b === void 0 ? void 0 : _b.call(_a);
                }
                catch (error) {
                    (0, debug_js_1.logForDebugging)("WebSocketTransport: Ping failed: ".concat(error), {
                        level: 'error',
                    });
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'cli_websocket_ping_failed');
                }
            }
        }, DEFAULT_PING_INTERVAL);
    };
    WebSocketTransport.prototype.stopPingInterval = function () {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    };
    WebSocketTransport.prototype.startKeepaliveInterval = function () {
        var _this = this;
        this.stopKeepaliveInterval();
        // In CCR sessions, session activity heartbeats handle keep-alives
        if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_REMOTE)) {
            return;
        }
        this.keepAliveInterval = setInterval(function () {
            if (_this.state === 'connected' && _this.ws) {
                try {
                    _this.ws.send(KEEP_ALIVE_FRAME);
                    _this.lastActivityTime = Date.now();
                    (0, debug_js_1.logForDebugging)('WebSocketTransport: Sent periodic keep_alive data frame');
                }
                catch (error) {
                    (0, debug_js_1.logForDebugging)("WebSocketTransport: Periodic keep_alive failed: ".concat(error), { level: 'error' });
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'cli_websocket_keepalive_failed');
                }
            }
        }, DEFAULT_KEEPALIVE_INTERVAL);
    };
    WebSocketTransport.prototype.stopKeepaliveInterval = function () {
        if (this.keepAliveInterval) {
            clearInterval(this.keepAliveInterval);
            this.keepAliveInterval = null;
        }
    };
    return WebSocketTransport;
}());
exports.WebSocketTransport = WebSocketTransport;
