"use strict";
/* eslint-disable eslint-plugin-n/no-unsupported-features/node-builtins */
/**
 * CONNECT-over-WebSocket relay for CCR upstreamproxy.
 *
 * Listens on localhost TCP, accepts HTTP CONNECT from curl/gh/kubectl/etc,
 * and tunnels bytes over WebSocket to the CCR upstreamproxy endpoint.
 * The CCR server-side terminates the tunnel, MITMs TLS, injects org-configured
 * credentials (e.g. DD-API-KEY), and forwards to the real upstream.
 *
 * WHY WebSocket and not raw CONNECT: CCR ingress is GKE L7 with path-prefix
 * routing; there's no connect_matcher in cdk-constructs. The session-ingress
 * tunnel (sessions/tunnel/v1alpha/tunnel.proto) already uses this pattern.
 *
 * Protocol: bytes are wrapped in UpstreamProxyChunk protobuf messages
 * (`message UpstreamProxyChunk { bytes data = 1; }`) for compatibility with
 * gateway.NewWebSocketStreamAdapter on the server side.
 */
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
exports.encodeChunk = encodeChunk;
exports.decodeChunk = decodeChunk;
exports.startUpstreamProxyRelay = startUpstreamProxyRelay;
exports.startNodeRelay = startNodeRelay;
var node_net_1 = require("node:net");
var debug_js_1 = require("../utils/debug.js");
var mtls_js_1 = require("../utils/mtls.js");
var proxy_js_1 = require("../utils/proxy.js");
var nodeWSCtor;
// Envoy per-request buffer cap. Week-1 Datadog payloads won't hit this, but
// design for it so git-push doesn't need a relay rewrite.
var MAX_CHUNK_BYTES = 512 * 1024;
// Sidecar idle timeout is 50s; ping well inside that.
var PING_INTERVAL_MS = 30000;
/**
 * Encode an UpstreamProxyChunk protobuf message by hand.
 *
 * For `message UpstreamProxyChunk { bytes data = 1; }` the wire format is:
 *   tag = (field_number << 3) | wire_type = (1 << 3) | 2 = 0x0a
 *   followed by varint length, followed by the bytes.
 *
 * protobufjs would be the general answer; for a single-field bytes message
 * the hand encoding is 10 lines and avoids a runtime dep in the hot path.
 */
function encodeChunk(data) {
    var len = data.length;
    // varint encoding of length — most chunks fit in 1–3 length bytes
    var varint = [];
    var n = len;
    while (n > 0x7f) {
        varint.push((n & 0x7f) | 0x80);
        n >>>= 7;
    }
    varint.push(n);
    var out = new Uint8Array(1 + varint.length + len);
    out[0] = 0x0a;
    out.set(varint, 1);
    out.set(data, 1 + varint.length);
    return out;
}
/**
 * Decode an UpstreamProxyChunk. Returns the data field, or null if malformed.
 * Tolerates the server sending a zero-length chunk (keepalive semantics).
 */
function decodeChunk(buf) {
    if (buf.length === 0)
        return new Uint8Array(0);
    if (buf[0] !== 0x0a)
        return null;
    var len = 0;
    var shift = 0;
    var i = 1;
    while (i < buf.length) {
        var b = buf[i];
        len |= (b & 0x7f) << shift;
        i++;
        if ((b & 0x80) === 0)
            break;
        shift += 7;
        if (shift > 28)
            return null;
    }
    if (i + len > buf.length)
        return null;
    return buf.subarray(i, i + len);
}
function newConnState() {
    return {
        connectBuf: Buffer.alloc(0),
        pending: [],
        wsOpen: false,
        established: false,
        closed: false,
    };
}
/**
 * Start the relay. Returns the ephemeral port it bound and a stop function.
 * Uses Bun.listen when available, otherwise Node's net.createServer — the CCR
 * container runs the CLI under Node, not Bun.
 */
function startUpstreamProxyRelay(opts) {
    return __awaiter(this, void 0, void 0, function () {
        var authHeader, wsAuthHeader, relay, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    authHeader = 'Basic ' + Buffer.from("".concat(opts.sessionId, ":").concat(opts.token)).toString('base64');
                    wsAuthHeader = "Bearer ".concat(opts.token);
                    if (!(typeof Bun !== 'undefined')) return [3 /*break*/, 1];
                    _a = startBunRelay(opts.wsUrl, authHeader, wsAuthHeader);
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, startNodeRelay(opts.wsUrl, authHeader, wsAuthHeader)];
                case 2:
                    _a = _b.sent();
                    _b.label = 3;
                case 3:
                    relay = _a;
                    (0, debug_js_1.logForDebugging)("[upstreamproxy] relay listening on 127.0.0.1:".concat(relay.port));
                    return [2 /*return*/, relay];
            }
        });
    });
}
function startBunRelay(wsUrl, authHeader, wsAuthHeader) {
    // eslint-disable-next-line custom-rules/require-bun-typeof-guard -- caller dispatches on typeof Bun
    var server = Bun.listen({
        hostname: '127.0.0.1',
        port: 0,
        socket: {
            open: function (sock) {
                sock.data = __assign(__assign({}, newConnState()), { writeBuf: [] });
            },
            data: function (sock, data) {
                var st = sock.data;
                var adapter = {
                    write: function (payload) {
                        var bytes = typeof payload === 'string'
                            ? Buffer.from(payload, 'utf8')
                            : payload;
                        if (st.writeBuf.length > 0) {
                            st.writeBuf.push(bytes);
                            return;
                        }
                        var n = sock.write(bytes);
                        if (n < bytes.length)
                            st.writeBuf.push(bytes.subarray(n));
                    },
                    end: function () { return sock.end(); },
                };
                handleData(adapter, st, data, wsUrl, authHeader, wsAuthHeader);
            },
            drain: function (sock) {
                var st = sock.data;
                while (st.writeBuf.length > 0) {
                    var chunk = st.writeBuf[0];
                    var n = sock.write(chunk);
                    if (n < chunk.length) {
                        st.writeBuf[0] = chunk.subarray(n);
                        return;
                    }
                    st.writeBuf.shift();
                }
            },
            close: function (sock) {
                cleanupConn(sock.data);
            },
            error: function (sock, err) {
                (0, debug_js_1.logForDebugging)("[upstreamproxy] client socket error: ".concat(err.message));
                cleanupConn(sock.data);
            },
        },
    });
    return {
        port: server.port,
        stop: function () { return server.stop(true); },
    };
}
// Exported so tests can exercise the Node path directly — the test runner is
// Bun, so the runtime dispatch in startUpstreamProxyRelay always picks Bun.
function startNodeRelay(wsUrl, authHeader, wsAuthHeader) {
    return __awaiter(this, void 0, void 0, function () {
        var states, server;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('ws'); })];
                case 1:
                    nodeWSCtor = (_a.sent()).default;
                    states = new WeakMap();
                    server = (0, node_net_1.createServer)(function (sock) {
                        var st = newConnState();
                        states.set(sock, st);
                        // Node's sock.write() buffers internally — a false return signals
                        // backpressure but the bytes are already queued, so no tail-tracking
                        // needed for correctness. Week-1 payloads won't stress the buffer.
                        var adapter = {
                            write: function (payload) {
                                sock.write(typeof payload === 'string' ? payload : Buffer.from(payload));
                            },
                            end: function () { return sock.end(); },
                        };
                        sock.on('data', function (data) {
                            return handleData(adapter, st, data, wsUrl, authHeader, wsAuthHeader);
                        });
                        sock.on('close', function () { return cleanupConn(states.get(sock)); });
                        sock.on('error', function (err) {
                            (0, debug_js_1.logForDebugging)("[upstreamproxy] client socket error: ".concat(err.message));
                            cleanupConn(states.get(sock));
                        });
                    });
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            server.once('error', reject);
                            server.listen(0, '127.0.0.1', function () {
                                var addr = server.address();
                                if (addr === null || typeof addr === 'string') {
                                    reject(new Error('upstreamproxy: server has no TCP address'));
                                    return;
                                }
                                resolve({
                                    port: addr.port,
                                    stop: function () { return server.close(); },
                                });
                            });
                        })];
            }
        });
    });
}
/**
 * Shared per-connection data handler. Phase 1 accumulates the CONNECT request;
 * phase 2 forwards client bytes over the WS tunnel.
 */
function handleData(sock, st, data, wsUrl, authHeader, wsAuthHeader) {
    var _a;
    // Phase 1: accumulate until we've seen the full CONNECT request
    // (terminated by CRLF CRLF). curl/gh send this in one packet, but
    // don't assume that.
    if (!st.ws) {
        st.connectBuf = Buffer.concat([st.connectBuf, data]);
        var headerEnd = st.connectBuf.indexOf('\r\n\r\n');
        if (headerEnd === -1) {
            // Guard against a client that never sends CRLFCRLF.
            if (st.connectBuf.length > 8192) {
                sock.write('HTTP/1.1 400 Bad Request\r\n\r\n');
                sock.end();
            }
            return;
        }
        var reqHead = st.connectBuf.subarray(0, headerEnd).toString('utf8');
        var firstLine = (_a = reqHead.split('\r\n')[0]) !== null && _a !== void 0 ? _a : '';
        var m = firstLine.match(/^CONNECT\s+(\S+)\s+HTTP\/1\.[01]$/i);
        if (!m) {
            sock.write('HTTP/1.1 405 Method Not Allowed\r\n\r\n');
            sock.end();
            return;
        }
        // Stash any bytes that arrived after the CONNECT header so
        // openTunnel can flush them once the WS is open.
        var trailing = st.connectBuf.subarray(headerEnd + 4);
        if (trailing.length > 0) {
            st.pending.push(Buffer.from(trailing));
        }
        st.connectBuf = Buffer.alloc(0);
        openTunnel(sock, st, firstLine, wsUrl, authHeader, wsAuthHeader);
        return;
    }
    // Phase 2: WS exists. If it isn't OPEN yet, buffer; ws.onopen will
    // flush. Once open, pump client bytes to WS in chunks.
    if (!st.wsOpen) {
        st.pending.push(Buffer.from(data));
        return;
    }
    forwardToWs(st.ws, data);
}
function openTunnel(sock, st, connectLine, wsUrl, authHeader, wsAuthHeader) {
    // core/websocket/stream.go picks JSON vs binary-proto from the upgrade
    // request's Content-Type header (defaults to JSON). Without application/proto
    // the server protojson.Unmarshals our hand-encoded binary chunks and fails
    // silently with EOF.
    var headers = {
        'Content-Type': 'application/proto',
        Authorization: wsAuthHeader,
    };
    var ws;
    if (nodeWSCtor) {
        ws = new nodeWSCtor(wsUrl, __assign({ headers: headers, agent: (0, proxy_js_1.getWebSocketProxyAgent)(wsUrl) }, (0, mtls_js_1.getWebSocketTLSOptions)()));
    }
    else {
        ws = new globalThis.WebSocket(wsUrl, {
            // @ts-expect-error — Bun extension; not in lib.dom WebSocket types
            headers: headers,
            proxy: (0, proxy_js_1.getWebSocketProxyUrl)(wsUrl),
            tls: (0, mtls_js_1.getWebSocketTLSOptions)() || undefined,
        });
    }
    ws.binaryType = 'arraybuffer';
    st.ws = ws;
    ws.onopen = function () {
        // First chunk carries the CONNECT line plus Proxy-Authorization so the
        // server can auth the tunnel and know the target host:port. Server
        // responds with its own "HTTP/1.1 200" over the tunnel; we just pipe it.
        var head = "".concat(connectLine, "\r\n") + "Proxy-Authorization: ".concat(authHeader, "\r\n") + "\r\n";
        ws.send(encodeChunk(Buffer.from(head, 'utf8')));
        // Flush anything that arrived while the WS handshake was in flight —
        // trailing bytes from the CONNECT packet and any data() callbacks that
        // fired before onopen.
        st.wsOpen = true;
        for (var _i = 0, _a = st.pending; _i < _a.length; _i++) {
            var buf = _a[_i];
            forwardToWs(ws, buf);
        }
        st.pending = [];
        // Not all WS implementations expose ping(); empty chunk works as an
        // application-level keepalive the server can ignore.
        st.pinger = setInterval(sendKeepalive, PING_INTERVAL_MS, ws);
    };
    ws.onmessage = function (ev) {
        var raw = ev.data instanceof ArrayBuffer
            ? new Uint8Array(ev.data)
            : new Uint8Array(Buffer.from(ev.data));
        var payload = decodeChunk(raw);
        if (payload && payload.length > 0) {
            st.established = true;
            sock.write(payload);
        }
    };
    ws.onerror = function (ev) {
        var msg = 'message' in ev ? String(ev.message) : 'websocket error';
        (0, debug_js_1.logForDebugging)("[upstreamproxy] ws error: ".concat(msg));
        if (st.closed)
            return;
        st.closed = true;
        if (!st.established) {
            sock.write('HTTP/1.1 502 Bad Gateway\r\n\r\n');
        }
        sock.end();
        cleanupConn(st);
    };
    ws.onclose = function () {
        if (st.closed)
            return;
        st.closed = true;
        sock.end();
        cleanupConn(st);
    };
}
function sendKeepalive(ws) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(encodeChunk(new Uint8Array(0)));
    }
}
function forwardToWs(ws, data) {
    if (ws.readyState !== WebSocket.OPEN)
        return;
    for (var off = 0; off < data.length; off += MAX_CHUNK_BYTES) {
        var slice = data.subarray(off, off + MAX_CHUNK_BYTES);
        ws.send(encodeChunk(slice));
    }
}
function cleanupConn(st) {
    if (!st)
        return;
    if (st.pinger)
        clearInterval(st.pinger);
    if (st.ws && st.ws.readyState <= WebSocket.OPEN) {
        try {
            st.ws.close();
        }
        catch (_a) {
            // already closing
        }
    }
    st.ws = undefined;
}
