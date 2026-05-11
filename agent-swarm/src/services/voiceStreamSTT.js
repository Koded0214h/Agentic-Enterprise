"use strict";
// Anthropic voice_stream speech-to-text client for push-to-talk.
//
// Only reachable in ant builds (gated by feature('VOICE_MODE') in useVoice.ts import).
//
// Connects to Anthropic's voice_stream WebSocket endpoint using the same
// OAuth credentials as Claude Code.  The endpoint uses conversation_engine
// backed models for speech-to-text.  Designed for hold-to-talk: hold the
// keybinding to record, release to stop and submit.
//
// The wire protocol uses JSON control messages (KeepAlive, CloseStream) and
// binary audio frames.  The server responds with TranscriptText and
// TranscriptEndpoint JSON messages.
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
exports.FINALIZE_TIMEOUTS_MS = void 0;
exports.isVoiceStreamAvailable = isVoiceStreamAvailable;
exports.connectVoiceStream = connectVoiceStream;
var ws_1 = require("ws");
var oauth_js_1 = require("../constants/oauth.js");
var auth_js_1 = require("../utils/auth.js");
var debug_js_1 = require("../utils/debug.js");
var http_js_1 = require("../utils/http.js");
var log_js_1 = require("../utils/log.js");
var mtls_js_1 = require("../utils/mtls.js");
var proxy_js_1 = require("../utils/proxy.js");
var slowOperations_js_1 = require("../utils/slowOperations.js");
var KEEPALIVE_MSG = '{"type":"KeepAlive"}';
var CLOSE_STREAM_MSG = '{"type":"CloseStream"}';
var growthbook_js_1 = require("./analytics/growthbook.js");
// ─── Constants ───────────────────────────────────────────────────────
var VOICE_STREAM_PATH = '/api/ws/speech_to_text/voice_stream';
var KEEPALIVE_INTERVAL_MS = 8000;
// finalize() resolution timers. `noData` fires when no TranscriptText
// arrives post-CloseStream — the server has nothing; don't wait out the
// full ~3-5s WS teardown to confirm emptiness. `safety` is the last-
// resort cap if the WS hangs. Exported so tests can shorten them.
exports.FINALIZE_TIMEOUTS_MS = {
    safety: 5000,
    noData: 1500,
};
// ─── Availability ──────────────────────────────────────────────────────
function isVoiceStreamAvailable() {
    // voice_stream uses the same OAuth as Claude Code — available when the
    // user is authenticated with Anthropic (Claude.ai subscriber or has
    // valid OAuth tokens).
    if (!(0, auth_js_1.isAnthropicAuthEnabled)()) {
        return false;
    }
    var tokens = (0, auth_js_1.getClaudeAIOAuthTokens)();
    return tokens !== null && tokens.accessToken !== null;
}
// ─── Connection ────────────────────────────────────────────────────────
function connectVoiceStream(callbacks, options) {
    return __awaiter(this, void 0, void 0, function () {
        var tokens, wsBaseUrl, params, isNova3, _i, _a, term, url, headers, tlsOptions, wsOptions, ws, keepaliveTimer, connected, finalized, finalizing, upgradeRejected, resolveFinalize, cancelNoDataTimer, connection, lastTranscriptText;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: 
                // Ensure OAuth token is fresh before connecting
                return [4 /*yield*/, (0, auth_js_1.checkAndRefreshOAuthTokenIfNeeded)()];
                case 1:
                    // Ensure OAuth token is fresh before connecting
                    _d.sent();
                    tokens = (0, auth_js_1.getClaudeAIOAuthTokens)();
                    if (!(tokens === null || tokens === void 0 ? void 0 : tokens.accessToken)) {
                        (0, debug_js_1.logForDebugging)('[voice_stream] No OAuth token available');
                        return [2 /*return*/, null];
                    }
                    wsBaseUrl = process.env.VOICE_STREAM_BASE_URL ||
                        (0, oauth_js_1.getOauthConfig)()
                            .BASE_API_URL.replace('https://', 'wss://')
                            .replace('http://', 'ws://');
                    if (process.env.VOICE_STREAM_BASE_URL) {
                        (0, debug_js_1.logForDebugging)("[voice_stream] Using VOICE_STREAM_BASE_URL override: ".concat(process.env.VOICE_STREAM_BASE_URL));
                    }
                    params = new URLSearchParams({
                        encoding: 'linear16',
                        sample_rate: '16000',
                        channels: '1',
                        endpointing_ms: '300',
                        utterance_end_ms: '1000',
                        language: (_b = options === null || options === void 0 ? void 0 : options.language) !== null && _b !== void 0 ? _b : 'en',
                    });
                    isNova3 = (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_cobalt_frost', false);
                    if (isNova3) {
                        params.set('use_conversation_engine', 'true');
                        params.set('stt_provider', 'deepgram-nova3');
                        (0, debug_js_1.logForDebugging)('[voice_stream] Nova 3 gate enabled (tengu_cobalt_frost)');
                    }
                    // Append keyterms as query params — the voice_stream proxy forwards
                    // these to the STT service which applies appropriate boosting.
                    if ((_c = options === null || options === void 0 ? void 0 : options.keyterms) === null || _c === void 0 ? void 0 : _c.length) {
                        for (_i = 0, _a = options.keyterms; _i < _a.length; _i++) {
                            term = _a[_i];
                            params.append('keyterms', term);
                        }
                    }
                    url = "".concat(wsBaseUrl).concat(VOICE_STREAM_PATH, "?").concat(params.toString());
                    (0, debug_js_1.logForDebugging)("[voice_stream] Connecting to ".concat(url));
                    headers = {
                        Authorization: "Bearer ".concat(tokens.accessToken),
                        'User-Agent': (0, http_js_1.getUserAgent)(),
                        'x-app': 'cli',
                    };
                    tlsOptions = (0, mtls_js_1.getWebSocketTLSOptions)();
                    wsOptions = typeof Bun !== 'undefined'
                        ? {
                            headers: headers,
                            proxy: (0, proxy_js_1.getWebSocketProxyUrl)(url),
                            tls: tlsOptions || undefined,
                        }
                        : __assign({ headers: headers, agent: (0, proxy_js_1.getWebSocketProxyAgent)(url) }, tlsOptions);
                    ws = new ws_1.default(url, wsOptions);
                    keepaliveTimer = null;
                    connected = false;
                    finalized = false;
                    finalizing = false;
                    upgradeRejected = false;
                    resolveFinalize = null;
                    cancelNoDataTimer = null;
                    connection = {
                        send: function (audioChunk) {
                            if (ws.readyState !== ws_1.default.OPEN) {
                                return;
                            }
                            if (finalized) {
                                // After CloseStream has been sent, the server rejects further audio.
                                // Drop the chunk to avoid a protocol error.
                                (0, debug_js_1.logForDebugging)("[voice_stream] Dropping audio chunk after CloseStream: ".concat(String(audioChunk.length), " bytes"));
                                return;
                            }
                            (0, debug_js_1.logForDebugging)("[voice_stream] Sending audio chunk: ".concat(String(audioChunk.length), " bytes"));
                            // Copy the buffer before sending: NAPI Buffer objects from native
                            // modules may share a pooled ArrayBuffer.  Creating a view with
                            // `new Uint8Array(buf.buffer, offset, len)` can reference stale or
                            // overlapping memory by the time the ws library reads it.
                            // `Buffer.from()` makes an owned copy that the ws library can safely
                            // consume as a binary WebSocket frame.
                            ws.send(Buffer.from(audioChunk));
                        },
                        finalize: function () {
                            if (finalizing || finalized) {
                                // Already finalized or WebSocket already closed — resolve immediately.
                                return Promise.resolve('ws_already_closed');
                            }
                            finalizing = true;
                            return new Promise(function (resolve) {
                                var safetyTimer = setTimeout(function () { return resolveFinalize === null || resolveFinalize === void 0 ? void 0 : resolveFinalize('safety_timeout'); }, exports.FINALIZE_TIMEOUTS_MS.safety);
                                var noDataTimer = setTimeout(function () { return resolveFinalize === null || resolveFinalize === void 0 ? void 0 : resolveFinalize('no_data_timeout'); }, exports.FINALIZE_TIMEOUTS_MS.noData);
                                cancelNoDataTimer = function () {
                                    clearTimeout(noDataTimer);
                                    cancelNoDataTimer = null;
                                };
                                resolveFinalize = function (source) {
                                    clearTimeout(safetyTimer);
                                    clearTimeout(noDataTimer);
                                    resolveFinalize = null;
                                    cancelNoDataTimer = null;
                                    // Legacy Deepgram can leave an interim in lastTranscriptText
                                    // with no TranscriptEndpoint (websocket_manager.py sends
                                    // TranscriptChunk and TranscriptEndpoint as independent
                                    // channel items). All resolve triggers must promote it;
                                    // centralize here. No-op when the close handler already did.
                                    if (lastTranscriptText) {
                                        (0, debug_js_1.logForDebugging)("[voice_stream] Promoting unreported interim before ".concat(source, " resolve"));
                                        var t = lastTranscriptText;
                                        lastTranscriptText = '';
                                        callbacks.onTranscript(t, true);
                                    }
                                    (0, debug_js_1.logForDebugging)("[voice_stream] Finalize resolved via ".concat(source));
                                    resolve(source);
                                };
                                // If the WebSocket is already closed, resolve immediately.
                                if (ws.readyState === ws_1.default.CLOSED ||
                                    ws.readyState === ws_1.default.CLOSING) {
                                    resolveFinalize('ws_already_closed');
                                    return;
                                }
                                // Defer CloseStream to the next event-loop iteration so any audio
                                // callbacks already queued by the native recording module are flushed
                                // to the WebSocket before the server is told to stop accepting audio.
                                // Without this, stopRecording() can return synchronously while the
                                // native module still has a pending onData callback in the event queue,
                                // causing audio to arrive after CloseStream.
                                setTimeout(function () {
                                    finalized = true;
                                    if (ws.readyState === ws_1.default.OPEN) {
                                        (0, debug_js_1.logForDebugging)('[voice_stream] Sending CloseStream (finalize)');
                                        ws.send(CLOSE_STREAM_MSG);
                                    }
                                }, 0);
                            });
                        },
                        close: function () {
                            finalized = true;
                            if (keepaliveTimer) {
                                clearInterval(keepaliveTimer);
                                keepaliveTimer = null;
                            }
                            connected = false;
                            if (ws.readyState === ws_1.default.OPEN) {
                                ws.close();
                            }
                        },
                        isConnected: function () {
                            return connected && ws.readyState === ws_1.default.OPEN;
                        },
                    };
                    ws.on('open', function () {
                        (0, debug_js_1.logForDebugging)('[voice_stream] WebSocket connected');
                        connected = true;
                        // Send an immediate KeepAlive so the server knows the client is active.
                        // Audio hardware initialisation can take >1s, so this prevents the
                        // server from closing the connection before audio capture starts.
                        (0, debug_js_1.logForDebugging)('[voice_stream] Sending initial KeepAlive');
                        ws.send(KEEPALIVE_MSG);
                        // Send periodic keepalive to prevent idle timeout
                        keepaliveTimer = setInterval(function (ws) {
                            if (ws.readyState === ws_1.default.OPEN) {
                                (0, debug_js_1.logForDebugging)('[voice_stream] Sending periodic KeepAlive');
                                ws.send(KEEPALIVE_MSG);
                            }
                        }, KEEPALIVE_INTERVAL_MS, ws);
                        // Pass the connection to the caller so it can start sending audio.
                        // This fires only after the WebSocket is truly open, guaranteeing
                        // that send() calls will not be silently dropped.
                        callbacks.onReady(connection);
                    });
                    lastTranscriptText = '';
                    ws.on('message', function (raw) {
                        var _a, _b, _c;
                        var text = raw.toString();
                        (0, debug_js_1.logForDebugging)("[voice_stream] Message received (".concat(String(text.length), " chars): ").concat(text.slice(0, 200)));
                        var msg;
                        try {
                            msg = (0, slowOperations_js_1.jsonParse)(text);
                        }
                        catch (_d) {
                            return;
                        }
                        switch (msg.type) {
                            case 'TranscriptText': {
                                var transcript = msg.data;
                                (0, debug_js_1.logForDebugging)("[voice_stream] TranscriptText: \"".concat(transcript !== null && transcript !== void 0 ? transcript : '', "\""));
                                // Data arrived after CloseStream — disarm the no-data timer so
                                // a slow-but-real flush isn't cut off. Only disarm once finalized
                                // (CloseStream sent); pre-CloseStream data racing the deferred
                                // send would cancel the timer prematurely, falling back to the
                                // slower 5s safety timeout instead of the 1.5s no-data timer.
                                if (finalized) {
                                    cancelNoDataTimer === null || cancelNoDataTimer === void 0 ? void 0 : cancelNoDataTimer();
                                }
                                if (transcript) {
                                    // Detect when the server has moved to a new speech segment.
                                    // Progressive refinements extend or shorten the previous text
                                    // (e.g., "hello" → "hello world", or "hello wor" → "hello wo").
                                    // A new segment starts with completely different text (neither
                                    // is a prefix of the other). When detected, emit the previous
                                    // text as final so the caller can accumulate it, preventing
                                    // the new segment from overwriting and losing the old one.
                                    //
                                    // Nova 3's interims are cumulative across segments AND can
                                    // revise earlier text ("Hello?" → "Hello."). Revision breaks
                                    // the prefix check, causing false auto-finalize → the same
                                    // text committed once AND re-appearing in the cumulative
                                    // interim = duplication. Nova 3 only endpoints on the final
                                    // flush, so auto-finalize is never correct for it.
                                    if (!isNova3 && lastTranscriptText) {
                                        var prev = lastTranscriptText.trimStart();
                                        var next = transcript.trimStart();
                                        if (prev &&
                                            next &&
                                            !next.startsWith(prev) &&
                                            !prev.startsWith(next)) {
                                            (0, debug_js_1.logForDebugging)("[voice_stream] Auto-finalizing previous segment (new segment detected): \"".concat(lastTranscriptText, "\""));
                                            callbacks.onTranscript(lastTranscriptText, true);
                                        }
                                    }
                                    lastTranscriptText = transcript;
                                    // Emit as interim so the caller can show a live preview.
                                    callbacks.onTranscript(transcript, false);
                                }
                                break;
                            }
                            case 'TranscriptEndpoint': {
                                (0, debug_js_1.logForDebugging)("[voice_stream] TranscriptEndpoint received, lastTranscriptText=\"".concat(lastTranscriptText, "\""));
                                // The server signals the end of an utterance.  Emit the last
                                // TranscriptText as a final transcript so the caller can commit it.
                                var finalText = lastTranscriptText;
                                lastTranscriptText = '';
                                if (finalText) {
                                    callbacks.onTranscript(finalText, true);
                                }
                                // When TranscriptEndpoint arrives after CloseStream was sent,
                                // the server has flushed its final transcript — nothing more is
                                // coming.  Resolve finalize now so the caller reads the
                                // accumulated buffer immediately (~300ms) instead of waiting
                                // for the WebSocket close event (~3-5s of server teardown).
                                // `finalized` (not `finalizing`) is the right gate: it flips
                                // inside the setTimeout(0) that actually sends CloseStream, so
                                // a TranscriptEndpoint that races the deferred send still waits.
                                if (finalized) {
                                    resolveFinalize === null || resolveFinalize === void 0 ? void 0 : resolveFinalize('post_closestream_endpoint');
                                }
                                break;
                            }
                            case 'TranscriptError': {
                                var desc = (_b = (_a = msg.description) !== null && _a !== void 0 ? _a : msg.error_code) !== null && _b !== void 0 ? _b : 'unknown transcription error';
                                (0, debug_js_1.logForDebugging)("[voice_stream] TranscriptError: ".concat(desc));
                                if (!finalizing) {
                                    callbacks.onError(desc);
                                }
                                break;
                            }
                            case 'error': {
                                var errorDetail = (_c = msg.message) !== null && _c !== void 0 ? _c : (0, slowOperations_js_1.jsonStringify)(msg);
                                (0, debug_js_1.logForDebugging)("[voice_stream] Server error: ".concat(errorDetail));
                                if (!finalizing) {
                                    callbacks.onError(errorDetail);
                                }
                                break;
                            }
                            default:
                                break;
                        }
                    });
                    ws.on('close', function (code, reason) {
                        var _a;
                        var reasonStr = (_a = reason === null || reason === void 0 ? void 0 : reason.toString()) !== null && _a !== void 0 ? _a : '';
                        (0, debug_js_1.logForDebugging)("[voice_stream] WebSocket closed: code=".concat(String(code), " reason=\"").concat(reasonStr, "\""));
                        connected = false;
                        if (keepaliveTimer) {
                            clearInterval(keepaliveTimer);
                            keepaliveTimer = null;
                        }
                        // If the server closed the connection before sending TranscriptEndpoint,
                        // promote the last interim transcript to final so no text is lost.
                        if (lastTranscriptText) {
                            (0, debug_js_1.logForDebugging)('[voice_stream] Promoting unreported interim transcript to final on close');
                            var finalText = lastTranscriptText;
                            lastTranscriptText = '';
                            callbacks.onTranscript(finalText, true);
                        }
                        // During finalize, suppress onError — the session already delivered
                        // whatever it had. useVoice's onError path wipes accumulatedRef,
                        // which would destroy the transcript before the finalize .then()
                        // reads it. `finalizing` (not resolveFinalize) is the gate: set once
                        // at finalize() entry, never cleared, so it stays accurate after the
                        // fast path or a timer already resolved.
                        resolveFinalize === null || resolveFinalize === void 0 ? void 0 : resolveFinalize('ws_close');
                        if (!finalizing && !upgradeRejected && code !== 1000 && code !== 1005) {
                            callbacks.onError("Connection closed: code ".concat(String(code)).concat(reasonStr ? " \u2014 ".concat(reasonStr) : ''));
                        }
                        callbacks.onClose();
                    });
                    // The ws library fires 'unexpected-response' when the HTTP upgrade
                    // returns a non-101 status. Listening lets us surface the actual status
                    // and flag 4xx as fatal (same token/TLS fingerprint won't change on
                    // retry). With a listener registered, ws does NOT abort on our behalf —
                    // we destroy the request; 'error' does not fire, 'close' does (suppressed
                    // via upgradeRejected above).
                    //
                    // Bun's ws shim historically didn't implement this event (a warning
                    // is logged once at registration). Under Bun a non-101 upgrade falls
                    // through to the generic 'error' + 'close' 1002 path with no recoverable
                    // status; the attemptGenRef guard in useVoice.ts still surfaces the
                    // retry-attempt failure, the user just sees "Expected 101 status code"
                    // instead of "HTTP 503". No harm — the gen fix is the load-bearing part.
                    ws.on('unexpected-response', function (req, res) {
                        var _a;
                        var status = (_a = res.statusCode) !== null && _a !== void 0 ? _a : 0;
                        // Bun's ws implementation on Windows can fire this event for a
                        // successful 101 Switching Protocols response (anthropics/claude-code#40510).
                        // 101 is never a rejection — bail before we destroy a working upgrade.
                        if (status === 101) {
                            (0, debug_js_1.logForDebugging)('[voice_stream] unexpected-response fired with 101; ignoring');
                            return;
                        }
                        (0, debug_js_1.logForDebugging)("[voice_stream] Upgrade rejected: status=".concat(String(status), " cf-mitigated=").concat(String(res.headers['cf-mitigated']), " cf-ray=").concat(String(res.headers['cf-ray'])));
                        upgradeRejected = true;
                        res.resume();
                        req.destroy();
                        if (finalizing)
                            return;
                        callbacks.onError("WebSocket upgrade rejected with HTTP ".concat(String(status)), { fatal: status >= 400 && status < 500 });
                    });
                    ws.on('error', function (err) {
                        (0, log_js_1.logError)(err);
                        (0, debug_js_1.logForDebugging)("[voice_stream] WebSocket error: ".concat(err.message));
                        if (!finalizing) {
                            callbacks.onError("Voice stream connection error: ".concat(err.message));
                        }
                    });
                    return [2 /*return*/, connection];
            }
        });
    });
}
