"use strict";
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
exports.createV1ReplTransport = createV1ReplTransport;
exports.createV2ReplTransport = createV2ReplTransport;
var ccrClient_js_1 = require("../cli/transports/ccrClient.js");
var SSETransport_js_1 = require("../cli/transports/SSETransport.js");
var debug_js_1 = require("../utils/debug.js");
var errors_js_1 = require("../utils/errors.js");
var sessionIngressAuth_js_1 = require("../utils/sessionIngressAuth.js");
var workSecret_js_1 = require("./workSecret.js");
/**
 * v1 adapter: HybridTransport already has the full surface (it extends
 * WebSocketTransport which has setOnConnect + getStateLabel). This is a
 * no-op wrapper that exists only so replBridge's `transport` variable
 * has a single type.
 */
function createV1ReplTransport(hybrid) {
    return {
        write: function (msg) { return hybrid.write(msg); },
        writeBatch: function (msgs) { return hybrid.writeBatch(msgs); },
        close: function () { return hybrid.close(); },
        isConnectedStatus: function () { return hybrid.isConnectedStatus(); },
        getStateLabel: function () { return hybrid.getStateLabel(); },
        setOnData: function (cb) { return hybrid.setOnData(cb); },
        setOnClose: function (cb) { return hybrid.setOnClose(cb); },
        setOnConnect: function (cb) { return hybrid.setOnConnect(cb); },
        connect: function () { return void hybrid.connect(); },
        // v1 Session-Ingress WS doesn't use SSE sequence numbers; replay
        // semantics are different. Always return 0 so the seq-num carryover
        // logic in replBridge is a no-op for v1.
        getLastSequenceNum: function () { return 0; },
        get droppedBatchCount() {
            return hybrid.droppedBatchCount;
        },
        reportState: function () { },
        reportMetadata: function () { },
        reportDelivery: function () { },
        flush: function () { return Promise.resolve(); },
    };
}
/**
 * v2 adapter: wrap SSETransport (reads) + CCRClient (writes, heartbeat,
 * state, delivery tracking).
 *
 * Auth: v2 endpoints validate the JWT's session_id claim (register_worker.go:32)
 * and worker role (environment_auth.py:856). OAuth tokens have neither.
 * This is the inverse of the v1 replBridge path, which deliberately uses OAuth.
 * The JWT is refreshed when the poll loop re-dispatches work — the caller
 * invokes createV2ReplTransport again with the fresh token.
 *
 * Registration happens here (not in the caller) so the entire v2 handshake
 * is one async step. registerWorker failure propagates — replBridge will
 * catch it and stay on the poll loop.
 */
function createV2ReplTransport(opts) {
    return __awaiter(this, void 0, void 0, function () {
        var sessionUrl, ingressToken, sessionId, initialSequenceNum, getAuthToken, getAuthHeaders, epoch, _a, sseUrl, sse, onCloseCb, ccr, onConnectCb, ccrInitialized, closed;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    sessionUrl = opts.sessionUrl, ingressToken = opts.ingressToken, sessionId = opts.sessionId, initialSequenceNum = opts.initialSequenceNum, getAuthToken = opts.getAuthToken;
                    if (getAuthToken) {
                        getAuthHeaders = function () {
                            var token = getAuthToken();
                            if (!token)
                                return {};
                            return { Authorization: "Bearer ".concat(token) };
                        };
                    }
                    else {
                        // CCRClient.request() and SSETransport.connect() both read auth via
                        // getSessionIngressAuthHeaders() → this env var. Set it before either
                        // touches the network.
                        (0, sessionIngressAuth_js_1.updateSessionIngressAuthToken)(ingressToken);
                    }
                    if (!((_b = opts.epoch) !== null && _b !== void 0)) return [3 /*break*/, 1];
                    _a = _b;
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, (0, workSecret_js_1.registerWorker)(sessionUrl, ingressToken)];
                case 2:
                    _a = (_c.sent());
                    _c.label = 3;
                case 3:
                    epoch = _a;
                    (0, debug_js_1.logForDebugging)("[bridge:repl] CCR v2: worker sessionId=".concat(sessionId, " epoch=").concat(epoch).concat(opts.epoch !== undefined ? ' (from /bridge)' : ' (via registerWorker)'));
                    sseUrl = new URL(sessionUrl);
                    sseUrl.pathname = sseUrl.pathname.replace(/\/$/, '') + '/worker/events/stream';
                    sse = new SSETransport_js_1.SSETransport(sseUrl, {}, sessionId, undefined, initialSequenceNum, getAuthHeaders);
                    ccr = new ccrClient_js_1.CCRClient(sse, new URL(sessionUrl), {
                        getAuthHeaders: getAuthHeaders,
                        heartbeatIntervalMs: opts.heartbeatIntervalMs,
                        heartbeatJitterFraction: opts.heartbeatJitterFraction,
                        // Default is process.exit(1) — correct for spawn-mode children. In-process,
                        // that kills the REPL. Close instead: replBridge's onClose wakes the poll
                        // loop, which picks up the server's re-dispatch (with fresh epoch).
                        onEpochMismatch: function () {
                            (0, debug_js_1.logForDebugging)('[bridge:repl] CCR v2: epoch superseded (409) — closing for poll-loop recovery');
                            // Close resources in a try block so the throw always executes.
                            // If ccr.close() or sse.close() throw, we still need to unwind
                            // the caller (request()) — otherwise handleEpochMismatch's `never`
                            // return type is violated at runtime and control falls through.
                            try {
                                ccr.close();
                                sse.close();
                                onCloseCb === null || onCloseCb === void 0 ? void 0 : onCloseCb(4090);
                            }
                            catch (closeErr) {
                                (0, debug_js_1.logForDebugging)("[bridge:repl] CCR v2: error during epoch-mismatch cleanup: ".concat((0, errors_js_1.errorMessage)(closeErr)), { level: 'error' });
                            }
                            // Don't return — the calling request() code continues after the 409
                            // branch, so callers see the logged warning and a false return. We
                            // throw to unwind; the uploaders catch it as a send failure.
                            throw new Error('epoch superseded');
                        },
                    });
                    // CCRClient's constructor wired sse.setOnEvent → reportDelivery('received').
                    // remoteIO.ts additionally sends 'processing'/'processed' via
                    // setCommandLifecycleListener, which the in-process query loop fires. This
                    // transport's only caller (replBridge/daemonBridge) has no such wiring — the
                    // daemon's agent child is a separate process (ProcessTransport), and its
                    // notifyCommandLifecycle calls fire with listener=null in its own module
                    // scope. So events stay at 'received' forever, and reconnectSession re-queues
                    // them on every daemon restart (observed: 21→24→25 phantom prompts as
                    // "user sent a new message while you were working" system-reminders).
                    //
                    // Fix: ACK 'processed' immediately alongside 'received'. The window between
                    // SSE receipt and transcript-write is narrow (queue → SDK → child stdin →
                    // model); a crash there loses one prompt vs. the observed N-prompt flood on
                    // every restart. Overwrite the constructor's wiring to do both — setOnEvent
                    // replaces, not appends (SSETransport.ts:658).
                    sse.setOnEvent(function (event) {
                        ccr.reportDelivery(event.event_id, 'received');
                        ccr.reportDelivery(event.event_id, 'processed');
                    });
                    ccrInitialized = false;
                    closed = false;
                    return [2 /*return*/, {
                            write: function (msg) {
                                return ccr.writeEvent(msg);
                            },
                            writeBatch: function (msgs) {
                                return __awaiter(this, void 0, void 0, function () {
                                    var _i, msgs_1, m;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                _i = 0, msgs_1 = msgs;
                                                _a.label = 1;
                                            case 1:
                                                if (!(_i < msgs_1.length)) return [3 /*break*/, 4];
                                                m = msgs_1[_i];
                                                if (closed)
                                                    return [3 /*break*/, 4];
                                                return [4 /*yield*/, ccr.writeEvent(m)];
                                            case 2:
                                                _a.sent();
                                                _a.label = 3;
                                            case 3:
                                                _i++;
                                                return [3 /*break*/, 1];
                                            case 4: return [2 /*return*/];
                                        }
                                    });
                                });
                            },
                            close: function () {
                                closed = true;
                                ccr.close();
                                sse.close();
                            },
                            isConnectedStatus: function () {
                                // Write-readiness, not read-readiness — replBridge checks this
                                // before calling writeBatch. SSE open state is orthogonal.
                                return ccrInitialized;
                            },
                            getStateLabel: function () {
                                // SSETransport doesn't expose its state string; synthesize from
                                // what we can observe. replBridge only uses this for debug logging.
                                if (sse.isClosedStatus())
                                    return 'closed';
                                if (sse.isConnectedStatus())
                                    return ccrInitialized ? 'connected' : 'init';
                                return 'connecting';
                            },
                            setOnData: function (cb) {
                                sse.setOnData(cb);
                            },
                            setOnClose: function (cb) {
                                onCloseCb = cb;
                                // SSE reconnect-budget exhaustion fires onClose(undefined) — map to
                                // 4092 so ws_closed telemetry can distinguish it from HTTP-status
                                // closes (SSETransport:280 passes response.status). Stop CCRClient's
                                // heartbeat timer before notifying replBridge. (sse.close() doesn't
                                // invoke this, so the epoch-mismatch path above isn't double-firing.)
                                sse.setOnClose(function (code) {
                                    ccr.close();
                                    cb(code !== null && code !== void 0 ? code : 4092);
                                });
                            },
                            setOnConnect: function (cb) {
                                onConnectCb = cb;
                            },
                            getLastSequenceNum: function () {
                                return sse.getLastSequenceNum();
                            },
                            // v2 write path (CCRClient) doesn't set maxConsecutiveFailures — no drops.
                            droppedBatchCount: 0,
                            reportState: function (state) {
                                ccr.reportState(state);
                            },
                            reportMetadata: function (metadata) {
                                ccr.reportMetadata(metadata);
                            },
                            reportDelivery: function (eventId, status) {
                                ccr.reportDelivery(eventId, status);
                            },
                            flush: function () {
                                return ccr.flush();
                            },
                            connect: function () {
                                // Outbound-only: skip the SSE read stream entirely — no inbound
                                // events to receive, no delivery ACKs to send. Only the CCRClient
                                // write path (POST /worker/events) and heartbeat are needed.
                                if (!opts.outboundOnly) {
                                    // Fire-and-forget — SSETransport.connect() awaits readStream()
                                    // (the read loop) and only resolves on stream close/error. The
                                    // spawn-mode path in remoteIO.ts does the same void discard.
                                    void sse.connect();
                                }
                                void ccr.initialize(epoch).then(function () {
                                    ccrInitialized = true;
                                    (0, debug_js_1.logForDebugging)("[bridge:repl] v2 transport ready for writes (epoch=".concat(epoch, ", sse=").concat(sse.isConnectedStatus() ? 'open' : 'opening', ")"));
                                    onConnectCb === null || onConnectCb === void 0 ? void 0 : onConnectCb();
                                }, function (err) {
                                    (0, debug_js_1.logForDebugging)("[bridge:repl] CCR v2 initialize failed: ".concat((0, errors_js_1.errorMessage)(err)), { level: 'error' });
                                    // Close transport resources and notify replBridge via onClose
                                    // so the poll loop can retry on the next work dispatch.
                                    // Without this callback, replBridge never learns the transport
                                    // failed to initialize and sits with transport === null forever.
                                    ccr.close();
                                    sse.close();
                                    onCloseCb === null || onCloseCb === void 0 ? void 0 : onCloseCb(4091); // 4091 = init failure, distinguishable from 4090 epoch mismatch
                                });
                            },
                        }];
            }
        });
    });
}
