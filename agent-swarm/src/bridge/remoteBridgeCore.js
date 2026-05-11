"use strict";
// biome-ignore-all assist/source/organizeImports: ANT-ONLY import markers must not be reordered
/**
 * Env-less Remote Control bridge core.
 *
 * "Env-less" = no Environments API layer. Distinct from "CCR v2" (the
 * /worker/* transport protocol) — the env-based path (replBridge.ts) can also
 * use CCR v2 transport via CLAUDE_CODE_USE_CCR_V2. This file is about removing
 * the poll/dispatch layer, not about which transport protocol is underneath.
 *
 * Unlike initBridgeCore (env-based, ~2400 lines), this connects directly
 * to the session-ingress layer without the Environments API work-dispatch
 * layer:
 *
 *   1. POST /v1/code/sessions              (OAuth, no env_id)  → session.id
 *   2. POST /v1/code/sessions/{id}/bridge  (OAuth)             → {worker_jwt, expires_in, api_base_url, worker_epoch}
 *      Each /bridge call bumps epoch — it IS the register. No separate /worker/register.
 *   3. createV2ReplTransport(worker_jwt, worker_epoch)         → SSE + CCRClient
 *   4. createTokenRefreshScheduler                             → proactive /bridge re-call (new JWT + new epoch)
 *   5. 401 on SSE → rebuild transport with fresh /bridge credentials (same seq-num)
 *
 * No register/poll/ack/stop/heartbeat/deregister environment lifecycle.
 * The Environments API historically existed because CCR's /worker/*
 * endpoints required a session_id+role=worker JWT that only the work-dispatch
 * layer could mint. Server PR #292605 (renamed in #293280) adds the /bridge endpoint as a direct
 * OAuth→worker_jwt exchange, making the env layer optional for REPL sessions.
 *
 * Gated by `tengu_bridge_repl_v2` GrowthBook flag in initReplBridge.ts.
 * REPL-only — daemon/print stay on env-based.
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
exports.createCodeSession = void 0;
exports.initEnvLessBridgeCore = initEnvLessBridgeCore;
exports.fetchRemoteCredentials = fetchRemoteCredentials;
var bun_bundle_1 = require("bun:bundle");
var axios_1 = require("axios");
var replBridgeTransport_js_1 = require("./replBridgeTransport.js");
var workSecret_js_1 = require("./workSecret.js");
var sessionIdCompat_js_1 = require("./sessionIdCompat.js");
var flushGate_js_1 = require("./flushGate.js");
var jwtUtils_js_1 = require("./jwtUtils.js");
var trustedDevice_js_1 = require("./trustedDevice.js");
var envLessBridgeConfig_js_1 = require("./envLessBridgeConfig.js");
var bridgeMessaging_js_1 = require("./bridgeMessaging.js");
var debugUtils_js_1 = require("./debugUtils.js");
var debug_js_1 = require("../utils/debug.js");
var diagLogs_js_1 = require("../utils/diagLogs.js");
var envUtils_js_1 = require("../utils/envUtils.js");
var errors_js_1 = require("../utils/errors.js");
var sleep_js_1 = require("../utils/sleep.js");
var cleanupRegistry_js_1 = require("../utils/cleanupRegistry.js");
var index_js_1 = require("../services/analytics/index.js");
var ANTHROPIC_VERSION = '2023-06-01';
function oauthHeaders(accessToken) {
    return {
        Authorization: "Bearer ".concat(accessToken),
        'Content-Type': 'application/json',
        'anthropic-version': ANTHROPIC_VERSION,
    };
}
/**
 * Create a session, fetch a worker JWT, connect the v2 transport.
 *
 * Returns null on any pre-flight failure (session create failed, /bridge
 * failed, transport setup failed). Caller (initReplBridge) surfaces this
 * as a generic "initialization failed" state.
 */
function initEnvLessBridgeCore(params) {
    return __awaiter(this, void 0, void 0, function () {
        function onConnectTimeout(cause) {
            if (tornDown)
                return;
            (0, index_js_1.logEvent)('tengu_bridge_repl_connect_timeout', {
                v2: true,
                elapsed_ms: cfg.connect_timeout_ms,
                cause: cause,
            });
        }
        // ── 6. Wire callbacks (extracted so transport-rebuild can re-wire) ──────
        function wireTransportCallbacks() {
            transport.setOnConnect(function () {
                clearTimeout(connectDeadline);
                (0, debug_js_1.logForDebugging)('[remote-bridge] v2 transport connected');
                (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'bridge_repl_v2_transport_connected');
                (0, index_js_1.logEvent)('tengu_bridge_repl_ws_connected', {
                    v2: true,
                    cause: connectCause,
                });
                if (!initialFlushDone && initialMessages && initialMessages.length > 0) {
                    initialFlushDone = true;
                    // Capture current transport — if 401/teardown happens mid-flush,
                    // the stale .finally() must not drain the gate or signal connected.
                    // (Same guard pattern as replBridge.ts:1119.)
                    var flushTransport_1 = transport;
                    void flushHistory(initialMessages)
                        .catch(function (e) {
                        return (0, debug_js_1.logForDebugging)("[remote-bridge] flushHistory failed: ".concat(e));
                    })
                        .finally(function () {
                        // authRecoveryInFlight catches the v1-vs-v2 asymmetry: v1 nulls
                        // transport synchronously in setOnClose (replBridge.ts:1175), so
                        // transport !== flushTransport trips immediately. v2 doesn't null —
                        // transport reassigned only at rebuildTransport:346, 3 awaits deep.
                        // authRecoveryInFlight is set synchronously at rebuildTransport entry.
                        if (transport !== flushTransport_1 ||
                            tornDown ||
                            authRecoveryInFlight) {
                            return;
                        }
                        drainFlushGate();
                        onStateChange === null || onStateChange === void 0 ? void 0 : onStateChange('connected');
                    });
                }
                else if (!flushGate.active) {
                    onStateChange === null || onStateChange === void 0 ? void 0 : onStateChange('connected');
                }
            });
            transport.setOnData(function (data) {
                (0, bridgeMessaging_js_1.handleIngressMessage)(data, recentPostedUUIDs, recentInboundUUIDs, onInboundMessage, 
                // Remote client answered the permission prompt — the turn resumes.
                // Without this the server stays on requires_action until the next
                // user message or turn-end result.
                onPermissionResponse
                    ? function (res) {
                        transport.reportState('running');
                        onPermissionResponse(res);
                    }
                    : undefined, function (req) {
                    return (0, bridgeMessaging_js_1.handleServerControlRequest)(req, {
                        transport: transport,
                        sessionId: sessionId,
                        onInterrupt: onInterrupt,
                        onSetModel: onSetModel,
                        onSetMaxThinkingTokens: onSetMaxThinkingTokens,
                        onSetPermissionMode: onSetPermissionMode,
                        outboundOnly: outboundOnly,
                    });
                });
            });
            transport.setOnClose(function (code) {
                clearTimeout(connectDeadline);
                if (tornDown)
                    return;
                (0, debug_js_1.logForDebugging)("[remote-bridge] v2 transport closed (code=".concat(code, ")"));
                (0, index_js_1.logEvent)('tengu_bridge_repl_ws_closed', { code: code, v2: true });
                // onClose fires only for TERMINAL failures: 401 (JWT invalid),
                // 4090 (CCR epoch mismatch), 4091 (CCR init failed), or SSE 10-min
                // reconnect budget exhausted. Transient disconnects are handled
                // transparently inside SSETransport. 401 we can recover from (fetch
                // fresh JWT, rebuild transport); all other codes are dead-ends.
                if (code === 401 && !authRecoveryInFlight) {
                    void recoverFromAuthFailure();
                    return;
                }
                onStateChange === null || onStateChange === void 0 ? void 0 : onStateChange('failed', "Transport closed (code ".concat(code, ")"));
            });
        }
        // ── 7. Transport rebuild (shared by proactive refresh + 401 recovery) ──
        // Every /bridge call bumps epoch server-side. Both refresh paths must
        // rebuild the transport with the new epoch — a JWT-only swap leaves the
        // old CCRClient heartbeating stale epoch → 409. SSE resumes from the old
        // transport's high-water-mark seq-num so no server-side replay.
        // Caller MUST set authRecoveryInFlight = true before calling (synchronously,
        // before any await) and clear it in a finally. This function doesn't manage
        // the flag — moving it here would be too late to prevent a double /bridge
        // fetch, and each fetch bumps epoch.
        function rebuildTransport(fresh, cause) {
            return __awaiter(this, void 0, void 0, function () {
                var seq;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            connectCause = cause;
                            // Queue writes during rebuild — once /bridge returns, the old transport's
                            // epoch is stale and its next write/heartbeat 409s. Without this gate,
                            // writeMessages adds UUIDs to recentPostedUUIDs then writeBatch silently
                            // no-ops (closed uploader after 409) → permanent silent message loss.
                            flushGate.start();
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, , 3, 4]);
                            seq = transport.getLastSequenceNum();
                            transport.close();
                            return [4 /*yield*/, (0, replBridgeTransport_js_1.createV2ReplTransport)({
                                    sessionUrl: (0, workSecret_js_1.buildCCRv2SdkUrl)(fresh.api_base_url, sessionId),
                                    ingressToken: fresh.worker_jwt,
                                    sessionId: sessionId,
                                    epoch: fresh.worker_epoch,
                                    heartbeatIntervalMs: cfg.heartbeat_interval_ms,
                                    heartbeatJitterFraction: cfg.heartbeat_jitter_fraction,
                                    initialSequenceNum: seq,
                                    getAuthToken: function () { return fresh.worker_jwt; },
                                    outboundOnly: outboundOnly,
                                })];
                        case 2:
                            transport = _a.sent();
                            if (tornDown) {
                                // Teardown fired during the async createV2ReplTransport window.
                                // Don't wire/connect/schedule — we'd re-arm timers after cancelAll()
                                // and fire onInboundMessage into a torn-down bridge.
                                transport.close();
                                return [2 /*return*/];
                            }
                            wireTransportCallbacks();
                            transport.connect();
                            connectDeadline = setTimeout(onConnectTimeout, cfg.connect_timeout_ms, connectCause);
                            refresh.scheduleFromExpiresIn(sessionId, fresh.expires_in);
                            // Drain queued writes into the new uploader. Runs before
                            // ccr.initialize() resolves (transport.connect() is fire-and-forget),
                            // but the uploader serializes behind the initial PUT /worker. If
                            // init fails (4091), events drop — but only recentPostedUUIDs
                            // (per-instance) is populated, so re-enabling the bridge re-flushes.
                            drainFlushGate();
                            return [3 /*break*/, 4];
                        case 3:
                            // End the gate on failure paths too — drainFlushGate already ended
                            // it on success. Queued messages are dropped (transport still dead).
                            flushGate.drop();
                            return [7 /*endfinally*/];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        }
        // ── 8. 401 recovery (OAuth refresh + rebuild) ───────────────────────────
        function recoverFromAuthFailure() {
            return __awaiter(this, void 0, void 0, function () {
                var stale, oauthToken_1, fresh, err_2;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            // setOnClose already guards `!authRecoveryInFlight` but that check and
                            // this set must be atomic against onRefresh — claim synchronously before
                            // any await. Laptop wake fires both paths ~simultaneously.
                            if (authRecoveryInFlight)
                                return [2 /*return*/];
                            authRecoveryInFlight = true;
                            onStateChange === null || onStateChange === void 0 ? void 0 : onStateChange('reconnecting', 'JWT expired — refreshing');
                            (0, debug_js_1.logForDebugging)('[remote-bridge] 401 on SSE — attempting JWT refresh');
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 6, 7, 8]);
                            stale = getAccessToken();
                            if (!onAuth401) return [3 /*break*/, 3];
                            return [4 /*yield*/, onAuth401(stale !== null && stale !== void 0 ? stale : '')];
                        case 2:
                            _b.sent();
                            _b.label = 3;
                        case 3:
                            oauthToken_1 = (_a = getAccessToken()) !== null && _a !== void 0 ? _a : stale;
                            if (!oauthToken_1 || tornDown) {
                                if (!tornDown) {
                                    onStateChange === null || onStateChange === void 0 ? void 0 : onStateChange('failed', 'JWT refresh failed: no OAuth token');
                                }
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, withRetry(function () {
                                    return fetchRemoteCredentials(sessionId, baseUrl, oauthToken_1, cfg.http_timeout_ms);
                                }, 'fetchRemoteCredentials (recovery)', cfg)];
                        case 4:
                            fresh = _b.sent();
                            if (!fresh || tornDown) {
                                if (!tornDown) {
                                    onStateChange === null || onStateChange === void 0 ? void 0 : onStateChange('failed', 'JWT refresh failed after 401');
                                }
                                return [2 /*return*/];
                            }
                            // If 401 interrupted the initial flush, writeBatch may have silently
                            // no-op'd on the closed uploader (ccr.close() ran in the SSE wrapper
                            // before our setOnClose callback). Reset so the new onConnect re-flushes.
                            // (v1 scopes initialFlushDone inside the per-transport closure at
                            // replBridge.ts:1027 so it resets naturally; v2 has it at outer scope.)
                            initialFlushDone = false;
                            return [4 /*yield*/, rebuildTransport(fresh, 'auth_401_recovery')];
                        case 5:
                            _b.sent();
                            (0, debug_js_1.logForDebugging)('[remote-bridge] Transport rebuilt after 401');
                            return [3 /*break*/, 8];
                        case 6:
                            err_2 = _b.sent();
                            (0, debug_js_1.logForDebugging)("[remote-bridge] 401 recovery failed: ".concat((0, errors_js_1.errorMessage)(err_2)), { level: 'error' });
                            (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'bridge_repl_v2_jwt_refresh_failed');
                            if (!tornDown) {
                                onStateChange === null || onStateChange === void 0 ? void 0 : onStateChange('failed', "JWT refresh failed: ".concat((0, errors_js_1.errorMessage)(err_2)));
                            }
                            return [3 /*break*/, 8];
                        case 7:
                            authRecoveryInFlight = false;
                            return [7 /*endfinally*/];
                        case 8: return [2 /*return*/];
                    }
                });
            });
        }
        // ── 8. History flush + drain helpers ────────────────────────────────────
        function drainFlushGate() {
            var msgs = flushGate.end();
            if (msgs.length === 0)
                return;
            for (var _i = 0, msgs_1 = msgs; _i < msgs_1.length; _i++) {
                var msg = msgs_1[_i];
                recentPostedUUIDs.add(msg.uuid);
            }
            var events = toSDKMessages(msgs).map(function (m) { return (__assign(__assign({}, m), { session_id: sessionId })); });
            if (msgs.some(function (m) { return m.type === 'user'; })) {
                transport.reportState('running');
            }
            (0, debug_js_1.logForDebugging)("[remote-bridge] Drained ".concat(msgs.length, " queued message(s) after flush"));
            void transport.writeBatch(events);
        }
        function flushHistory(msgs) {
            return __awaiter(this, void 0, void 0, function () {
                var eligible, capped, events;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            eligible = msgs.filter(bridgeMessaging_js_1.isEligibleBridgeMessage);
                            capped = initialHistoryCap > 0 && eligible.length > initialHistoryCap
                                ? eligible.slice(-initialHistoryCap)
                                : eligible;
                            if (capped.length < eligible.length) {
                                (0, debug_js_1.logForDebugging)("[remote-bridge] Capped initial flush: ".concat(eligible.length, " -> ").concat(capped.length, " (cap=").concat(initialHistoryCap, ")"));
                            }
                            events = toSDKMessages(capped).map(function (m) { return (__assign(__assign({}, m), { session_id: sessionId })); });
                            if (events.length === 0)
                                return [2 /*return*/];
                            // Mid-turn init: if Remote Control is enabled while a query is running,
                            // the last eligible message is a user prompt or tool_result (both 'user'
                            // type). Without this the init PUT's 'idle' sticks until the next user-
                            // type message forwards via writeMessages — which for a pure-text turn
                            // is never (only assistant chunks stream post-init). Check eligible (pre-
                            // cap), not capped: the cap may truncate to a user message even when the
                            // actual trailing message is assistant.
                            if (((_a = eligible.at(-1)) === null || _a === void 0 ? void 0 : _a.type) === 'user') {
                                transport.reportState('running');
                            }
                            (0, debug_js_1.logForDebugging)("[remote-bridge] Flushing ".concat(events.length, " history events"));
                            return [4 /*yield*/, transport.writeBatch(events)];
                        case 1:
                            _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        }
        // ── 9. Teardown ───────────────────────────────────────────────────────────
        // On SIGINT/SIGTERM/⁠/exit, gracefulShutdown races runCleanupFunctions()
        // against a 2s cap before forceExit kills the process. Budget accordingly:
        //   - archive: teardown_archive_timeout_ms (default 1500, cap 2000)
        //   - result write: fire-and-forget, archive latency covers the drain
        //   - 401 retry: only if first archive 401s, shares the same budget
        function teardown() {
            return __awaiter(this, void 0, void 0, function () {
                var token, status, err_3, archiveStatus;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (tornDown)
                                return [2 /*return*/];
                            tornDown = true;
                            refresh.cancelAll();
                            clearTimeout(connectDeadline);
                            flushGate.drop();
                            // Fire the result message before archive — transport.write() only awaits
                            // enqueue (SerialBatchEventUploader resolves once buffered, drain is
                            // async). Archiving before close() gives the uploader's drain loop a
                            // window (typical archive ≈ 100-500ms) to POST the result without an
                            // explicit sleep. close() sets closed=true which interrupts drain at the
                            // next while-check, so close-before-archive drops the result.
                            transport.reportState('idle');
                            void transport.write((0, bridgeMessaging_js_1.makeResultMessage)(sessionId));
                            token = getAccessToken();
                            return [4 /*yield*/, archiveSession(sessionId, baseUrl, token, orgUUID, cfg.teardown_archive_timeout_ms)
                                // Token is usually fresh (refresh scheduler runs 5min before expiry) but
                                // laptop-wake past the refresh window leaves getAccessToken() returning a
                                // stale string. Retry once on 401 — onAuth401 (= handleOAuth401Error)
                                // clears keychain cache + force-refreshes. No proactive refresh on the
                                // happy path: handleOAuth401Error force-refreshes even valid tokens,
                                // which would waste budget 99% of the time. try/catch mirrors
                                // recoverFromAuthFailure: keychain reads can throw (macOS locked after
                                // wake); an uncaught throw here would skip transport.close + telemetry.
                            ];
                        case 1:
                            status = _a.sent();
                            if (!(status === 401 && onAuth401)) return [3 /*break*/, 6];
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, 5, , 6]);
                            return [4 /*yield*/, onAuth401(token !== null && token !== void 0 ? token : '')];
                        case 3:
                            _a.sent();
                            token = getAccessToken();
                            return [4 /*yield*/, archiveSession(sessionId, baseUrl, token, orgUUID, cfg.teardown_archive_timeout_ms)];
                        case 4:
                            status = _a.sent();
                            return [3 /*break*/, 6];
                        case 5:
                            err_3 = _a.sent();
                            (0, debug_js_1.logForDebugging)("[remote-bridge] Teardown 401 retry threw: ".concat((0, errors_js_1.errorMessage)(err_3)), { level: 'error' });
                            return [3 /*break*/, 6];
                        case 6:
                            transport.close();
                            archiveStatus = status === 'no_token'
                                ? 'skipped_no_token'
                                : status === 'timeout' || status === 'error'
                                    ? 'network_error'
                                    : status >= 500
                                        ? 'server_5xx'
                                        : status >= 400
                                            ? 'server_4xx'
                                            : 'ok';
                            (0, debug_js_1.logForDebugging)("[remote-bridge] Torn down (archive=".concat(status, ")"));
                            (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'bridge_repl_v2_teardown');
                            (0, index_js_1.logEvent)((0, bun_bundle_1.feature)('CCR_MIRROR') && outboundOnly
                                ? 'tengu_ccr_mirror_teardown'
                                : 'tengu_bridge_repl_teardown', {
                                v2: true,
                                archive_status: archiveStatus,
                                archive_ok: typeof status === 'number' && status < 400,
                                archive_http_status: typeof status === 'number' ? status : undefined,
                                archive_timeout: status === 'timeout',
                                archive_no_token: status === 'no_token',
                            });
                            return [2 /*return*/];
                    }
                });
            });
        }
        var baseUrl, orgUUID, title, getAccessToken, onAuth401, toSDKMessages, initialHistoryCap, initialMessages, onInboundMessage, onUserMessage, onPermissionResponse, onInterrupt, onSetModel, onSetMaxThinkingTokens, onSetPermissionMode, onStateChange, outboundOnly, tags, cfg, accessToken, createdSessionId, sessionId, credentials, sessionUrl, transport, err_1, recentPostedUUIDs, initialMessageUUIDs, _i, initialMessages_1, msg, recentInboundUUIDs, flushGate, initialFlushDone, tornDown, authRecoveryInFlight, userMessageCallbackDone, connectCause, connectDeadline, refresh, unregister;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    baseUrl = params.baseUrl, orgUUID = params.orgUUID, title = params.title, getAccessToken = params.getAccessToken, onAuth401 = params.onAuth401, toSDKMessages = params.toSDKMessages, initialHistoryCap = params.initialHistoryCap, initialMessages = params.initialMessages, onInboundMessage = params.onInboundMessage, onUserMessage = params.onUserMessage, onPermissionResponse = params.onPermissionResponse, onInterrupt = params.onInterrupt, onSetModel = params.onSetModel, onSetMaxThinkingTokens = params.onSetMaxThinkingTokens, onSetPermissionMode = params.onSetPermissionMode, onStateChange = params.onStateChange, outboundOnly = params.outboundOnly, tags = params.tags;
                    return [4 /*yield*/, (0, envLessBridgeConfig_js_1.getEnvLessBridgeConfig)()
                        // ── 1. Create session (POST /v1/code/sessions, no env_id) ───────────────
                    ];
                case 1:
                    cfg = _a.sent();
                    accessToken = getAccessToken();
                    if (!accessToken) {
                        (0, debug_js_1.logForDebugging)('[remote-bridge] No OAuth token');
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, withRetry(function () {
                            return (0, codeSessionApi_js_2.createCodeSession)(baseUrl, accessToken, title, cfg.http_timeout_ms, tags);
                        }, 'createCodeSession', cfg)];
                case 2:
                    createdSessionId = _a.sent();
                    if (!createdSessionId) {
                        onStateChange === null || onStateChange === void 0 ? void 0 : onStateChange('failed', 'Session creation failed — see debug log');
                        (0, debugUtils_js_1.logBridgeSkip)('v2_session_create_failed', undefined, true);
                        return [2 /*return*/, null];
                    }
                    sessionId = createdSessionId;
                    (0, debug_js_1.logForDebugging)("[remote-bridge] Created session ".concat(sessionId));
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'bridge_repl_v2_session_created');
                    return [4 /*yield*/, withRetry(function () {
                            return fetchRemoteCredentials(sessionId, baseUrl, accessToken, cfg.http_timeout_ms);
                        }, 'fetchRemoteCredentials', cfg)];
                case 3:
                    credentials = _a.sent();
                    if (!credentials) {
                        onStateChange === null || onStateChange === void 0 ? void 0 : onStateChange('failed', 'Remote credentials fetch failed — see debug log');
                        (0, debugUtils_js_1.logBridgeSkip)('v2_remote_creds_failed', undefined, true);
                        void archiveSession(sessionId, baseUrl, accessToken, orgUUID, cfg.http_timeout_ms);
                        return [2 /*return*/, null];
                    }
                    (0, debug_js_1.logForDebugging)("[remote-bridge] Fetched bridge credentials (expires_in=".concat(credentials.expires_in, "s)"));
                    sessionUrl = (0, workSecret_js_1.buildCCRv2SdkUrl)(credentials.api_base_url, sessionId);
                    (0, debug_js_1.logForDebugging)("[remote-bridge] v2 session URL: ".concat(sessionUrl));
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, (0, replBridgeTransport_js_1.createV2ReplTransport)({
                            sessionUrl: sessionUrl,
                            ingressToken: credentials.worker_jwt,
                            sessionId: sessionId,
                            epoch: credentials.worker_epoch,
                            heartbeatIntervalMs: cfg.heartbeat_interval_ms,
                            heartbeatJitterFraction: cfg.heartbeat_jitter_fraction,
                            // Per-instance closure — keeps the worker JWT out of
                            // process.env.CLAUDE_CODE_SESSION_ACCESS_TOKEN, which mcp/client.ts
                            // reads ungatedly and would otherwise send to user-configured ws/http
                            // MCP servers. Frozen-at-construction is correct: transport is fully
                            // rebuilt on refresh (rebuildTransport below).
                            getAuthToken: function () { return credentials.worker_jwt; },
                            outboundOnly: outboundOnly,
                        })];
                case 5:
                    transport = _a.sent();
                    return [3 /*break*/, 7];
                case 6:
                    err_1 = _a.sent();
                    (0, debug_js_1.logForDebugging)("[remote-bridge] v2 transport setup failed: ".concat((0, errors_js_1.errorMessage)(err_1)), { level: 'error' });
                    onStateChange === null || onStateChange === void 0 ? void 0 : onStateChange('failed', "Transport setup failed: ".concat((0, errors_js_1.errorMessage)(err_1)));
                    (0, debugUtils_js_1.logBridgeSkip)('v2_transport_setup_failed', undefined, true);
                    void archiveSession(sessionId, baseUrl, accessToken, orgUUID, cfg.http_timeout_ms);
                    return [2 /*return*/, null];
                case 7:
                    (0, debug_js_1.logForDebugging)("[remote-bridge] v2 transport created (epoch=".concat(credentials.worker_epoch, ")"));
                    onStateChange === null || onStateChange === void 0 ? void 0 : onStateChange('ready');
                    recentPostedUUIDs = new bridgeMessaging_js_1.BoundedUUIDSet(cfg.uuid_dedup_buffer_size);
                    initialMessageUUIDs = new Set();
                    if (initialMessages) {
                        for (_i = 0, initialMessages_1 = initialMessages; _i < initialMessages_1.length; _i++) {
                            msg = initialMessages_1[_i];
                            initialMessageUUIDs.add(msg.uuid);
                            recentPostedUUIDs.add(msg.uuid);
                        }
                    }
                    recentInboundUUIDs = new bridgeMessaging_js_1.BoundedUUIDSet(cfg.uuid_dedup_buffer_size);
                    flushGate = new flushGate_js_1.FlushGate();
                    initialFlushDone = false;
                    tornDown = false;
                    authRecoveryInFlight = false;
                    userMessageCallbackDone = !onUserMessage;
                    connectCause = 'initial';
                    refresh = (0, jwtUtils_js_1.createTokenRefreshScheduler)({
                        refreshBufferMs: cfg.token_refresh_buffer_ms,
                        getAccessToken: function () { return __awaiter(_this, void 0, void 0, function () {
                            var stale;
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        stale = getAccessToken();
                                        if (!onAuth401) return [3 /*break*/, 2];
                                        return [4 /*yield*/, onAuth401(stale !== null && stale !== void 0 ? stale : '')];
                                    case 1:
                                        _b.sent();
                                        _b.label = 2;
                                    case 2: return [2 /*return*/, (_a = getAccessToken()) !== null && _a !== void 0 ? _a : stale];
                                }
                            });
                        }); },
                        onRefresh: function (sid, oauthToken) {
                            void (function () { return __awaiter(_this, void 0, void 0, function () {
                                var fresh, err_4;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            // Laptop wake: overdue proactive timer + SSE 401 fire ~simultaneously.
                                            // Claim the flag BEFORE the /bridge fetch so the other path skips
                                            // entirely — prevents double epoch bump (each /bridge call bumps; if
                                            // both fetch, the first rebuild gets a stale epoch and 409s).
                                            if (authRecoveryInFlight || tornDown) {
                                                (0, debug_js_1.logForDebugging)('[remote-bridge] Recovery already in flight, skipping proactive refresh');
                                                return [2 /*return*/];
                                            }
                                            authRecoveryInFlight = true;
                                            _a.label = 1;
                                        case 1:
                                            _a.trys.push([1, 4, 5, 6]);
                                            return [4 /*yield*/, withRetry(function () {
                                                    return fetchRemoteCredentials(sid, baseUrl, oauthToken, cfg.http_timeout_ms);
                                                }, 'fetchRemoteCredentials (proactive)', cfg)];
                                        case 2:
                                            fresh = _a.sent();
                                            if (!fresh || tornDown)
                                                return [2 /*return*/];
                                            return [4 /*yield*/, rebuildTransport(fresh, 'proactive_refresh')];
                                        case 3:
                                            _a.sent();
                                            (0, debug_js_1.logForDebugging)('[remote-bridge] Transport rebuilt (proactive refresh)');
                                            return [3 /*break*/, 6];
                                        case 4:
                                            err_4 = _a.sent();
                                            (0, debug_js_1.logForDebugging)("[remote-bridge] Proactive refresh rebuild failed: ".concat((0, errors_js_1.errorMessage)(err_4)), { level: 'error' });
                                            (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'bridge_repl_v2_proactive_refresh_failed');
                                            if (!tornDown) {
                                                onStateChange === null || onStateChange === void 0 ? void 0 : onStateChange('failed', "Refresh failed: ".concat((0, errors_js_1.errorMessage)(err_4)));
                                            }
                                            return [3 /*break*/, 6];
                                        case 5:
                                            authRecoveryInFlight = false;
                                            return [7 /*endfinally*/];
                                        case 6: return [2 /*return*/];
                                    }
                                });
                            }); })();
                        },
                        label: 'remote',
                    });
                    refresh.scheduleFromExpiresIn(sessionId, credentials.expires_in);
                    wireTransportCallbacks();
                    // Start flushGate BEFORE connect so writeMessages() during handshake
                    // queues instead of racing the history POST.
                    if (initialMessages && initialMessages.length > 0) {
                        flushGate.start();
                    }
                    transport.connect();
                    connectDeadline = setTimeout(onConnectTimeout, cfg.connect_timeout_ms, connectCause);
                    unregister = (0, cleanupRegistry_js_1.registerCleanup)(teardown);
                    if ((0, bun_bundle_1.feature)('CCR_MIRROR') && outboundOnly) {
                        (0, index_js_1.logEvent)('tengu_ccr_mirror_started', {
                            v2: true,
                            expires_in_s: credentials.expires_in,
                        });
                    }
                    else {
                        (0, index_js_1.logEvent)('tengu_bridge_repl_started', {
                            has_initial_messages: !!(initialMessages && initialMessages.length > 0),
                            v2: true,
                            expires_in_s: credentials.expires_in,
                            inProtectedNamespace: (0, envUtils_js_1.isInProtectedNamespace)(),
                        });
                    }
                    // ── 10. Handle ──────────────────────────────────────────────────────────
                    return [2 /*return*/, {
                            bridgeSessionId: sessionId,
                            environmentId: '',
                            sessionIngressUrl: credentials.api_base_url,
                            writeMessages: function (messages) {
                                var filtered = messages.filter(function (m) {
                                    return (0, bridgeMessaging_js_1.isEligibleBridgeMessage)(m) &&
                                        !initialMessageUUIDs.has(m.uuid) &&
                                        !recentPostedUUIDs.has(m.uuid);
                                });
                                if (filtered.length === 0)
                                    return;
                                // Fire onUserMessage for title derivation. Scan before the flushGate
                                // check — prompts are title-worthy even if they queue. Keeps calling
                                // on every title-worthy message until the callback returns true; the
                                // caller owns the policy (derive at 1st and 3rd, skip if explicit).
                                if (!userMessageCallbackDone) {
                                    for (var _i = 0, filtered_1 = filtered; _i < filtered_1.length; _i++) {
                                        var m = filtered_1[_i];
                                        var text = (0, bridgeMessaging_js_1.extractTitleText)(m);
                                        if (text !== undefined && (onUserMessage === null || onUserMessage === void 0 ? void 0 : onUserMessage(text, sessionId))) {
                                            userMessageCallbackDone = true;
                                            break;
                                        }
                                    }
                                }
                                if (flushGate.enqueue.apply(flushGate, filtered)) {
                                    (0, debug_js_1.logForDebugging)("[remote-bridge] Queued ".concat(filtered.length, " message(s) during flush"));
                                    return;
                                }
                                for (var _a = 0, filtered_2 = filtered; _a < filtered_2.length; _a++) {
                                    var msg = filtered_2[_a];
                                    recentPostedUUIDs.add(msg.uuid);
                                }
                                var events = toSDKMessages(filtered).map(function (m) { return (__assign(__assign({}, m), { session_id: sessionId })); });
                                // v2 does not derive worker_status from events server-side (unlike v1
                                // session-ingress session_status_updater.go). Push it from here so the
                                // CCR web session list shows Running instead of stuck on Idle. A user
                                // message in the batch marks turn start. CCRClient.reportState dedupes
                                // consecutive same-state pushes.
                                if (filtered.some(function (m) { return m.type === 'user'; })) {
                                    transport.reportState('running');
                                }
                                (0, debug_js_1.logForDebugging)("[remote-bridge] Sending ".concat(filtered.length, " message(s)"));
                                void transport.writeBatch(events);
                            },
                            writeSdkMessages: function (messages) {
                                var filtered = messages.filter(function (m) { return !m.uuid || !recentPostedUUIDs.has(m.uuid); });
                                if (filtered.length === 0)
                                    return;
                                for (var _i = 0, filtered_3 = filtered; _i < filtered_3.length; _i++) {
                                    var msg = filtered_3[_i];
                                    if (msg.uuid)
                                        recentPostedUUIDs.add(msg.uuid);
                                }
                                var events = filtered.map(function (m) { return (__assign(__assign({}, m), { session_id: sessionId })); });
                                void transport.writeBatch(events);
                            },
                            sendControlRequest: function (request) {
                                if (authRecoveryInFlight) {
                                    (0, debug_js_1.logForDebugging)("[remote-bridge] Dropping control_request during 401 recovery: ".concat(request.request_id));
                                    return;
                                }
                                var event = __assign(__assign({}, request), { session_id: sessionId });
                                if (request.request.subtype === 'can_use_tool') {
                                    transport.reportState('requires_action');
                                }
                                void transport.write(event);
                                (0, debug_js_1.logForDebugging)("[remote-bridge] Sent control_request request_id=".concat(request.request_id));
                            },
                            sendControlResponse: function (response) {
                                if (authRecoveryInFlight) {
                                    (0, debug_js_1.logForDebugging)('[remote-bridge] Dropping control_response during 401 recovery');
                                    return;
                                }
                                var event = __assign(__assign({}, response), { session_id: sessionId });
                                transport.reportState('running');
                                void transport.write(event);
                                (0, debug_js_1.logForDebugging)('[remote-bridge] Sent control_response');
                            },
                            sendControlCancelRequest: function (requestId) {
                                if (authRecoveryInFlight) {
                                    (0, debug_js_1.logForDebugging)("[remote-bridge] Dropping control_cancel_request during 401 recovery: ".concat(requestId));
                                    return;
                                }
                                var event = {
                                    type: 'control_cancel_request',
                                    request_id: requestId,
                                    session_id: sessionId,
                                };
                                // Hook/classifier/channel/recheck resolved the permission locally —
                                // interactiveHandler calls only cancelRequest (no sendResponse) on
                                // those paths, so without this the server stays on requires_action.
                                transport.reportState('running');
                                void transport.write(event);
                                (0, debug_js_1.logForDebugging)("[remote-bridge] Sent control_cancel_request request_id=".concat(requestId));
                            },
                            sendResult: function () {
                                if (authRecoveryInFlight) {
                                    (0, debug_js_1.logForDebugging)('[remote-bridge] Dropping result during 401 recovery');
                                    return;
                                }
                                transport.reportState('idle');
                                void transport.write((0, bridgeMessaging_js_1.makeResultMessage)(sessionId));
                                (0, debug_js_1.logForDebugging)("[remote-bridge] Sent result");
                            },
                            teardown: function () {
                                return __awaiter(this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                unregister();
                                                return [4 /*yield*/, teardown()];
                                            case 1:
                                                _a.sent();
                                                return [2 /*return*/];
                                        }
                                    });
                                });
                            },
                        }];
            }
        });
    });
}
// ─── Session API (v2 /code/sessions, no env) ─────────────────────────────────
/** Retry an async init call with exponential backoff + jitter. */
function withRetry(fn, label, cfg) {
    return __awaiter(this, void 0, void 0, function () {
        var max, attempt, result, base, jitter, delay;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    max = cfg.init_retry_max_attempts;
                    attempt = 1;
                    _a.label = 1;
                case 1:
                    if (!(attempt <= max)) return [3 /*break*/, 5];
                    return [4 /*yield*/, fn()];
                case 2:
                    result = _a.sent();
                    if (result !== null)
                        return [2 /*return*/, result];
                    if (!(attempt < max)) return [3 /*break*/, 4];
                    base = cfg.init_retry_base_delay_ms * Math.pow(2, (attempt - 1));
                    jitter = base * cfg.init_retry_jitter_fraction * (2 * Math.random() - 1);
                    delay = Math.min(base + jitter, cfg.init_retry_max_delay_ms);
                    (0, debug_js_1.logForDebugging)("[remote-bridge] ".concat(label, " failed (attempt ").concat(attempt, "/").concat(max, "), retrying in ").concat(Math.round(delay), "ms"));
                    return [4 /*yield*/, (0, sleep_js_1.sleep)(delay)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    attempt++;
                    return [3 /*break*/, 1];
                case 5: return [2 /*return*/, null];
            }
        });
    });
}
// Moved to codeSessionApi.ts so the SDK /bridge subpath can bundle them
// without pulling in this file's heavy CLI tree (analytics, transport).
var codeSessionApi_js_1 = require("./codeSessionApi.js");
Object.defineProperty(exports, "createCodeSession", { enumerable: true, get: function () { return codeSessionApi_js_1.createCodeSession; } });
var codeSessionApi_js_2 = require("./codeSessionApi.js");
var bridgeConfig_js_1 = require("./bridgeConfig.js");
// CLI-side wrapper that applies the CLAUDE_BRIDGE_BASE_URL dev override and
// injects the trusted-device token (both are env/GrowthBook reads that the
// SDK-facing codeSessionApi.ts export must stay free of).
function fetchRemoteCredentials(sessionId, baseUrl, accessToken, timeoutMs) {
    return __awaiter(this, void 0, void 0, function () {
        var creds;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, codeSessionApi_js_2.fetchRemoteCredentials)(sessionId, baseUrl, accessToken, timeoutMs, (0, trustedDevice_js_1.getTrustedDeviceToken)())];
                case 1:
                    creds = _a.sent();
                    if (!creds)
                        return [2 /*return*/, null];
                    return [2 /*return*/, (0, bridgeConfig_js_1.getBridgeBaseUrlOverride)()
                            ? __assign(__assign({}, creds), { api_base_url: baseUrl }) : creds];
            }
        });
    });
}
function archiveSession(sessionId, baseUrl, accessToken, orgUUID, timeoutMs) {
    return __awaiter(this, void 0, void 0, function () {
        var compatId, response, err_5, msg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!accessToken)
                        return [2 /*return*/, 'no_token'
                            // Archive lives at the compat layer (/v1/sessions/*, not /v1/code/sessions).
                            // compat.parseSessionID only accepts TagSession (session_*), so retag cse_*.
                            // anthropic-beta + x-organization-uuid are required — without them the
                            // compat gateway 404s before reaching the handler.
                            //
                            // Unlike bridgeMain.ts (which caches compatId in sessionCompatIds to keep
                            // in-memory titledSessions/logger keys consistent across a mid-session
                            // gate flip), this compatId is only a server URL path segment — no
                            // in-memory state. Fresh compute matches whatever the server currently
                            // validates: if the gate is OFF, the server has been updated to accept
                            // cse_* and we correctly send it.
                        ];
                    compatId = (0, sessionIdCompat_js_1.toCompatSessionId)(sessionId);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.post("".concat(baseUrl, "/v1/sessions/").concat(compatId, "/archive"), {}, {
                            headers: __assign(__assign({}, oauthHeaders(accessToken)), { 'anthropic-beta': 'ccr-byoc-2025-07-29', 'x-organization-uuid': orgUUID }),
                            timeout: timeoutMs,
                            validateStatus: function () { return true; },
                        })];
                case 2:
                    response = _a.sent();
                    (0, debug_js_1.logForDebugging)("[remote-bridge] Archive ".concat(compatId, " status=").concat(response.status));
                    return [2 /*return*/, response.status];
                case 3:
                    err_5 = _a.sent();
                    msg = (0, errors_js_1.errorMessage)(err_5);
                    (0, debug_js_1.logForDebugging)("[remote-bridge] Archive failed: ".concat(msg));
                    return [2 /*return*/, axios_1.default.isAxiosError(err_5) && err_5.code === 'ECONNABORTED'
                            ? 'timeout'
                            : 'error'];
                case 4: return [2 /*return*/];
            }
        });
    });
}
