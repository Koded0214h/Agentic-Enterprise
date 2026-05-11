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
exports.SessionsWebSocket = void 0;
var crypto_1 = require("crypto");
var oauth_js_1 = require("../constants/oauth.js");
var debug_js_1 = require("../utils/debug.js");
var errors_js_1 = require("../utils/errors.js");
var log_js_1 = require("../utils/log.js");
var mtls_js_1 = require("../utils/mtls.js");
var proxy_js_1 = require("../utils/proxy.js");
var slowOperations_js_1 = require("../utils/slowOperations.js");
var RECONNECT_DELAY_MS = 2000;
var MAX_RECONNECT_ATTEMPTS = 5;
var PING_INTERVAL_MS = 30000;
/**
 * Maximum retries for 4001 (session not found). During compaction the
 * server may briefly consider the session stale; a short retry window
 * lets the client recover without giving up permanently.
 */
var MAX_SESSION_NOT_FOUND_RETRIES = 3;
/**
 * WebSocket close codes that indicate a permanent server-side rejection.
 * The client stops reconnecting immediately.
 * Note: 4001 (session not found) is handled separately with limited
 * retries since it can be transient during compaction.
 */
var PERMANENT_CLOSE_CODES = new Set([
    4003, // unauthorized
]);
function isSessionsMessage(value) {
    if (typeof value !== 'object' || value === null || !('type' in value)) {
        return false;
    }
    // Accept any message with a string `type` field. Downstream handlers
    // (sdkMessageAdapter, RemoteSessionManager) decide what to do with
    // unknown types. A hardcoded allowlist here would silently drop new
    // message types the backend starts sending before the client is updated.
    return typeof value.type === 'string';
}
/**
 * WebSocket client for connecting to CCR sessions via /v1/sessions/ws/{id}/subscribe
 *
 * Protocol:
 * 1. Connect to wss://api.anthropic.com/v1/sessions/ws/{sessionId}/subscribe?organization_uuid=...
 * 2. Send auth message: { type: 'auth', credential: { type: 'oauth', token: '...' } }
 * 3. Receive SDKMessage stream from the session
 */
var SessionsWebSocket = /** @class */ (function () {
    function SessionsWebSocket(sessionId, orgUuid, getAccessToken, callbacks) {
        this.sessionId = sessionId;
        this.orgUuid = orgUuid;
        this.getAccessToken = getAccessToken;
        this.callbacks = callbacks;
        this.ws = null;
        this.state = 'closed';
        this.reconnectAttempts = 0;
        this.sessionNotFoundRetries = 0;
        this.pingInterval = null;
        this.reconnectTimer = null;
    }
    /**
     * Connect to the sessions WebSocket endpoint
     */
    SessionsWebSocket.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var baseUrl, url, accessToken, headers, ws, WS, ws;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.state === 'connecting') {
                            (0, debug_js_1.logForDebugging)('[SessionsWebSocket] Already connecting');
                            return [2 /*return*/];
                        }
                        this.state = 'connecting';
                        baseUrl = (0, oauth_js_1.getOauthConfig)().BASE_API_URL.replace('https://', 'wss://');
                        url = "".concat(baseUrl, "/v1/sessions/ws/").concat(this.sessionId, "/subscribe?organization_uuid=").concat(this.orgUuid);
                        (0, debug_js_1.logForDebugging)("[SessionsWebSocket] Connecting to ".concat(url));
                        accessToken = this.getAccessToken();
                        headers = {
                            Authorization: "Bearer ".concat(accessToken),
                            'anthropic-version': '2023-06-01',
                        };
                        if (!(typeof Bun !== 'undefined')) return [3 /*break*/, 1];
                        ws = new globalThis.WebSocket(url, {
                            headers: headers,
                            proxy: (0, proxy_js_1.getWebSocketProxyUrl)(url),
                            tls: (0, mtls_js_1.getWebSocketTLSOptions)() || undefined,
                        });
                        this.ws = ws;
                        ws.addEventListener('open', function () {
                            var _a, _b;
                            (0, debug_js_1.logForDebugging)('[SessionsWebSocket] Connection opened, authenticated via headers');
                            _this.state = 'connected';
                            _this.reconnectAttempts = 0;
                            _this.sessionNotFoundRetries = 0;
                            _this.startPingInterval();
                            (_b = (_a = _this.callbacks).onConnected) === null || _b === void 0 ? void 0 : _b.call(_a);
                        });
                        ws.addEventListener('message', function (event) {
                            var data = typeof event.data === 'string' ? event.data : String(event.data);
                            _this.handleMessage(data);
                        });
                        ws.addEventListener('error', function () {
                            var _a, _b;
                            var err = new Error('[SessionsWebSocket] WebSocket error');
                            (0, log_js_1.logError)(err);
                            (_b = (_a = _this.callbacks).onError) === null || _b === void 0 ? void 0 : _b.call(_a, err);
                        });
                        // eslint-disable-next-line eslint-plugin-n/no-unsupported-features/node-builtins
                        ws.addEventListener('close', function (event) {
                            (0, debug_js_1.logForDebugging)("[SessionsWebSocket] Closed: code=".concat(event.code, " reason=").concat(event.reason));
                            _this.handleClose(event.code);
                        });
                        ws.addEventListener('pong', function () {
                            (0, debug_js_1.logForDebugging)('[SessionsWebSocket] Pong received');
                        });
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, Promise.resolve().then(function () { return require('ws'); })];
                    case 2:
                        WS = (_a.sent()).default;
                        ws = new WS(url, __assign({ headers: headers, agent: (0, proxy_js_1.getWebSocketProxyAgent)(url) }, (0, mtls_js_1.getWebSocketTLSOptions)()));
                        this.ws = ws;
                        ws.on('open', function () {
                            var _a, _b;
                            (0, debug_js_1.logForDebugging)('[SessionsWebSocket] Connection opened, authenticated via headers');
                            // Auth is handled via headers, so we're immediately connected
                            _this.state = 'connected';
                            _this.reconnectAttempts = 0;
                            _this.sessionNotFoundRetries = 0;
                            _this.startPingInterval();
                            (_b = (_a = _this.callbacks).onConnected) === null || _b === void 0 ? void 0 : _b.call(_a);
                        });
                        ws.on('message', function (data) {
                            _this.handleMessage(data.toString());
                        });
                        ws.on('error', function (err) {
                            var _a, _b;
                            (0, log_js_1.logError)(new Error("[SessionsWebSocket] Error: ".concat(err.message)));
                            (_b = (_a = _this.callbacks).onError) === null || _b === void 0 ? void 0 : _b.call(_a, err);
                        });
                        ws.on('close', function (code, reason) {
                            (0, debug_js_1.logForDebugging)("[SessionsWebSocket] Closed: code=".concat(code, " reason=").concat(reason.toString()));
                            _this.handleClose(code);
                        });
                        ws.on('pong', function () {
                            (0, debug_js_1.logForDebugging)('[SessionsWebSocket] Pong received');
                        });
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle incoming WebSocket message
     */
    SessionsWebSocket.prototype.handleMessage = function (data) {
        try {
            var message = (0, slowOperations_js_1.jsonParse)(data);
            // Forward SDK messages to callback
            if (isSessionsMessage(message)) {
                this.callbacks.onMessage(message);
            }
            else {
                (0, debug_js_1.logForDebugging)("[SessionsWebSocket] Ignoring message type: ".concat(typeof message === 'object' && message !== null && 'type' in message ? String(message.type) : 'unknown'));
            }
        }
        catch (error) {
            (0, log_js_1.logError)(new Error("[SessionsWebSocket] Failed to parse message: ".concat((0, errors_js_1.errorMessage)(error))));
        }
    };
    /**
     * Handle WebSocket close
     */
    SessionsWebSocket.prototype.handleClose = function (closeCode) {
        var _a, _b, _c, _d, _e, _f;
        this.stopPingInterval();
        if (this.state === 'closed') {
            return;
        }
        this.ws = null;
        var previousState = this.state;
        this.state = 'closed';
        // Permanent codes: stop reconnecting — server has definitively ended the session
        if (PERMANENT_CLOSE_CODES.has(closeCode)) {
            (0, debug_js_1.logForDebugging)("[SessionsWebSocket] Permanent close code ".concat(closeCode, ", not reconnecting"));
            (_b = (_a = this.callbacks).onClose) === null || _b === void 0 ? void 0 : _b.call(_a);
            return;
        }
        // 4001 (session not found) can be transient during compaction: the
        // server may briefly consider the session stale while the CLI worker
        // is busy with the compaction API call and not emitting events.
        if (closeCode === 4001) {
            this.sessionNotFoundRetries++;
            if (this.sessionNotFoundRetries > MAX_SESSION_NOT_FOUND_RETRIES) {
                (0, debug_js_1.logForDebugging)("[SessionsWebSocket] 4001 retry budget exhausted (".concat(MAX_SESSION_NOT_FOUND_RETRIES, "), not reconnecting"));
                (_d = (_c = this.callbacks).onClose) === null || _d === void 0 ? void 0 : _d.call(_c);
                return;
            }
            this.scheduleReconnect(RECONNECT_DELAY_MS * this.sessionNotFoundRetries, "4001 attempt ".concat(this.sessionNotFoundRetries, "/").concat(MAX_SESSION_NOT_FOUND_RETRIES));
            return;
        }
        // Attempt reconnection if we were connected
        if (previousState === 'connected' &&
            this.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            this.reconnectAttempts++;
            this.scheduleReconnect(RECONNECT_DELAY_MS, "attempt ".concat(this.reconnectAttempts, "/").concat(MAX_RECONNECT_ATTEMPTS));
        }
        else {
            (0, debug_js_1.logForDebugging)('[SessionsWebSocket] Not reconnecting');
            (_f = (_e = this.callbacks).onClose) === null || _f === void 0 ? void 0 : _f.call(_e);
        }
    };
    SessionsWebSocket.prototype.scheduleReconnect = function (delay, label) {
        var _this = this;
        var _a, _b;
        (_b = (_a = this.callbacks).onReconnecting) === null || _b === void 0 ? void 0 : _b.call(_a);
        (0, debug_js_1.logForDebugging)("[SessionsWebSocket] Scheduling reconnect (".concat(label, ") in ").concat(delay, "ms"));
        this.reconnectTimer = setTimeout(function () {
            _this.reconnectTimer = null;
            void _this.connect();
        }, delay);
    };
    SessionsWebSocket.prototype.startPingInterval = function () {
        var _this = this;
        this.stopPingInterval();
        this.pingInterval = setInterval(function () {
            var _a, _b;
            if (_this.ws && _this.state === 'connected') {
                try {
                    (_b = (_a = _this.ws).ping) === null || _b === void 0 ? void 0 : _b.call(_a);
                }
                catch (_c) {
                    // Ignore ping errors, close handler will deal with connection issues
                }
            }
        }, PING_INTERVAL_MS);
    };
    /**
     * Stop ping interval
     */
    SessionsWebSocket.prototype.stopPingInterval = function () {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    };
    /**
     * Send a control response back to the session
     */
    SessionsWebSocket.prototype.sendControlResponse = function (response) {
        if (!this.ws || this.state !== 'connected') {
            (0, log_js_1.logError)(new Error('[SessionsWebSocket] Cannot send: not connected'));
            return;
        }
        (0, debug_js_1.logForDebugging)('[SessionsWebSocket] Sending control response');
        this.ws.send((0, slowOperations_js_1.jsonStringify)(response));
    };
    /**
     * Send a control request to the session (e.g., interrupt)
     */
    SessionsWebSocket.prototype.sendControlRequest = function (request) {
        if (!this.ws || this.state !== 'connected') {
            (0, log_js_1.logError)(new Error('[SessionsWebSocket] Cannot send: not connected'));
            return;
        }
        var controlRequest = {
            type: 'control_request',
            request_id: (0, crypto_1.randomUUID)(),
            request: request,
        };
        (0, debug_js_1.logForDebugging)("[SessionsWebSocket] Sending control request: ".concat(request.subtype));
        this.ws.send((0, slowOperations_js_1.jsonStringify)(controlRequest));
    };
    /**
     * Check if connected
     */
    SessionsWebSocket.prototype.isConnected = function () {
        return this.state === 'connected';
    };
    /**
     * Close the WebSocket connection
     */
    SessionsWebSocket.prototype.close = function () {
        (0, debug_js_1.logForDebugging)('[SessionsWebSocket] Closing connection');
        this.state = 'closed';
        this.stopPingInterval();
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        if (this.ws) {
            // Null out event handlers to prevent race conditions during reconnect.
            // Under Bun (native WebSocket), onX handlers are the clean way to detach.
            // Under Node (ws package), the listeners were attached with .on() in connect(),
            // but since we're about to close and null out this.ws, no cleanup is needed.
            this.ws.close();
            this.ws = null;
        }
    };
    /**
     * Force reconnect - closes existing connection and establishes a new one.
     * Useful when the subscription becomes stale (e.g., after container shutdown).
     */
    SessionsWebSocket.prototype.reconnect = function () {
        var _this = this;
        (0, debug_js_1.logForDebugging)('[SessionsWebSocket] Force reconnecting');
        this.reconnectAttempts = 0;
        this.sessionNotFoundRetries = 0;
        this.close();
        // Small delay before reconnecting (stored in reconnectTimer so it can be cancelled)
        this.reconnectTimer = setTimeout(function () {
            _this.reconnectTimer = null;
            void _this.connect();
        }, 500);
    };
    return SessionsWebSocket;
}());
exports.SessionsWebSocket = SessionsWebSocket;
