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
exports._POLL_ERROR_GIVE_UP_MS_ForTesting = exports._POLL_ERROR_MAX_DELAY_MS_ForTesting = exports._POLL_ERROR_INITIAL_DELAY_MS_ForTesting = void 0;
exports.initBridgeCore = initBridgeCore;
exports._startWorkPollLoopForTesting = startWorkPollLoop;
// biome-ignore-all assist/source/organizeImports: ANT-ONLY import markers must not be reordered
var crypto_1 = require("crypto");
var bridgeApi_js_1 = require("./bridgeApi.js");
var debug_js_1 = require("../utils/debug.js");
var diagLogs_js_1 = require("../utils/diagLogs.js");
var index_js_1 = require("../services/analytics/index.js");
var cleanupRegistry_js_1 = require("../utils/cleanupRegistry.js");
var bridgeMessaging_js_1 = require("./bridgeMessaging.js");
var workSecret_js_1 = require("./workSecret.js");
var sessionIdCompat_js_1 = require("./sessionIdCompat.js");
var concurrentSessions_js_1 = require("../utils/concurrentSessions.js");
var trustedDevice_js_1 = require("./trustedDevice.js");
var HybridTransport_js_1 = require("../cli/transports/HybridTransport.js");
var replBridgeTransport_js_1 = require("./replBridgeTransport.js");
var sessionIngressAuth_js_1 = require("../utils/sessionIngressAuth.js");
var envUtils_js_1 = require("../utils/envUtils.js");
var bridgeApi_js_2 = require("./bridgeApi.js");
var debugUtils_js_1 = require("./debugUtils.js");
var capacityWake_js_1 = require("./capacityWake.js");
var flushGate_js_1 = require("./flushGate.js");
var pollConfigDefaults_js_1 = require("./pollConfigDefaults.js");
var errors_js_1 = require("../utils/errors.js");
var sleep_js_1 = require("../utils/sleep.js");
var bridgeDebug_js_1 = require("./bridgeDebug.js");
/**
 * Poll error recovery constants. When the work poll starts failing (e.g.
 * server 500s), we use exponential backoff and give up after this timeout.
 * This is deliberately long — the server is the authority on when a session
 * is truly dead. As long as the server accepts our poll, we keep waiting
 * for it to re-dispatch the work item.
 */
var POLL_ERROR_INITIAL_DELAY_MS = 2000;
exports._POLL_ERROR_INITIAL_DELAY_MS_ForTesting = POLL_ERROR_INITIAL_DELAY_MS;
var POLL_ERROR_MAX_DELAY_MS = 60000;
exports._POLL_ERROR_MAX_DELAY_MS_ForTesting = POLL_ERROR_MAX_DELAY_MS;
var POLL_ERROR_GIVE_UP_MS = 15 * 60 * 1000;
exports._POLL_ERROR_GIVE_UP_MS_ForTesting = POLL_ERROR_GIVE_UP_MS;
// Monotonically increasing counter for distinguishing init calls in logs
var initSequence = 0;
/**
 * Bootstrap-free core: env registration → session creation → poll loop →
 * ingress WS → teardown. Reads nothing from bootstrap/state or
 * sessionStorage — all context comes from params. Caller (initReplBridge
 * below, or a daemon in PR 4) has already passed entitlement gates and
 * gathered git/auth/title.
 *
 * Returns null on registration or session-creation failure.
 */
function initBridgeCore(params) {
    return __awaiter(this, void 0, void 0, function () {
        /**
         * Reconnect-in-place: if the just-registered environmentId matches what
         * was requested, call reconnectSession to force-stop stale workers and
         * re-queue the session. Used at init (perpetual mode — env is alive but
         * idle after clean teardown) and in doReconnect() Strategy 1 (env lost
         * then resurrected). Returns true on success; caller falls back to
         * fresh session creation on false.
         */
        function tryReconnectInPlace(requestedEnvId, sessionId) {
            return __awaiter(this, void 0, void 0, function () {
                var infraId, candidates, _i, candidates_1, id, err_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (environmentId !== requestedEnvId) {
                                (0, debug_js_1.logForDebugging)("[bridge:repl] Env mismatch (requested ".concat(requestedEnvId, ", got ").concat(environmentId, ") \u2014 cannot reconnect in place"));
                                return [2 /*return*/, false];
                            }
                            infraId = (0, sessionIdCompat_js_1.toInfraSessionId)(sessionId);
                            candidates = infraId === sessionId ? [sessionId] : [sessionId, infraId];
                            _i = 0, candidates_1 = candidates;
                            _a.label = 1;
                        case 1:
                            if (!(_i < candidates_1.length)) return [3 /*break*/, 6];
                            id = candidates_1[_i];
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, api.reconnectSession(environmentId, id)];
                        case 3:
                            _a.sent();
                            (0, debug_js_1.logForDebugging)("[bridge:repl] Reconnected session ".concat(id, " in place on env ").concat(environmentId));
                            return [2 /*return*/, true];
                        case 4:
                            err_2 = _a.sent();
                            (0, debug_js_1.logForDebugging)("[bridge:repl] reconnectSession(".concat(id, ") failed: ").concat((0, errors_js_1.errorMessage)(err_2)));
                            return [3 /*break*/, 5];
                        case 5:
                            _i++;
                            return [3 /*break*/, 1];
                        case 6:
                            (0, debug_js_1.logForDebugging)('[bridge:repl] reconnectSession exhausted — falling through to fresh session');
                            return [2 /*return*/, false];
                    }
                });
            });
        }
        /**
         * Recover from onEnvironmentLost (poll returned 404 — env was reaped
         * server-side). Tries two strategies in order:
         *
         *   1. Reconnect-in-place: idempotent re-register with reuseEnvironmentId
         *      → if the backend returns the same env ID, call reconnectSession()
         *      to re-queue the existing session. currentSessionId stays the same;
         *      the URL on the user's phone stays valid; previouslyFlushedUUIDs is
         *      preserved so history isn't re-sent.
         *
         *   2. Fresh session fallback: if the backend returns a different env ID
         *      (original TTL-expired, e.g. laptop slept >4h) or reconnectSession()
         *      throws, archive the old session and create a new one on the
         *      now-registered env. Old behavior before #20460 primitives landed.
         *
         * Uses a promise-based reentrancy guard so concurrent callers share the
         * same reconnection attempt.
         */
        function reconnectEnvironmentWithSession() {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (reconnectPromise) {
                                return [2 /*return*/, reconnectPromise];
                            }
                            reconnectPromise = doReconnect();
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, , 3, 4]);
                            return [4 /*yield*/, reconnectPromise];
                        case 2: return [2 /*return*/, _a.sent()];
                        case 3:
                            reconnectPromise = null;
                            return [7 /*endfinally*/];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        }
        function doReconnect() {
            return __awaiter(this, void 0, void 0, function () {
                var seq_1, workIdBeingCleared, requestedEnvId, reg, err_3, currentTitle, newSessionId;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            environmentRecreations++;
                            // Invalidate any in-flight v2 handshake — the environment is being
                            // recreated, so a stale transport arriving post-reconnect would be
                            // pointed at a dead session.
                            v2Generation++;
                            (0, debug_js_1.logForDebugging)("[bridge:repl] Reconnecting after env lost (attempt ".concat(environmentRecreations, "/").concat(MAX_ENVIRONMENT_RECREATIONS, ")"));
                            if (environmentRecreations > MAX_ENVIRONMENT_RECREATIONS) {
                                (0, debug_js_1.logForDebugging)("[bridge:repl] Environment reconnect limit reached (".concat(MAX_ENVIRONMENT_RECREATIONS, "), giving up"));
                                return [2 /*return*/, false];
                            }
                            // Close the stale transport. Capture seq BEFORE close — if Strategy 1
                            // (tryReconnectInPlace) succeeds we keep the SAME session, and the
                            // next transport must resume where this one left off, not replay from
                            // the last transport-swap checkpoint.
                            if (transport) {
                                seq_1 = transport.getLastSequenceNum();
                                if (seq_1 > lastTransportSequenceNum) {
                                    lastTransportSequenceNum = seq_1;
                                }
                                transport.close();
                                transport = null;
                            }
                            // Transport is gone — wake the poll loop out of its at-capacity
                            // heartbeat sleep so it can fast-poll for re-dispatched work.
                            wakePollLoop();
                            // Reset flush gate so writeMessages() hits the !transport guard
                            // instead of silently queuing into a dead buffer.
                            flushGate.drop();
                            if (!currentWorkId) return [3 /*break*/, 2];
                            workIdBeingCleared = currentWorkId;
                            return [4 /*yield*/, api
                                    .stopWork(environmentId, workIdBeingCleared, false)
                                    .catch(function () { })
                                // When doReconnect runs concurrently with the poll loop (ws_closed
                                // handler case — void-called, unlike the awaited onEnvironmentLost
                                // path), onWorkReceived can fire during the stopWork await and set
                                // a fresh currentWorkId. If it did, the poll loop has already
                                // recovered on its own — defer to it rather than proceeding to
                                // archiveSession, which would destroy the session its new
                                // transport is connected to.
                            ];
                        case 1:
                            _a.sent();
                            // When doReconnect runs concurrently with the poll loop (ws_closed
                            // handler case — void-called, unlike the awaited onEnvironmentLost
                            // path), onWorkReceived can fire during the stopWork await and set
                            // a fresh currentWorkId. If it did, the poll loop has already
                            // recovered on its own — defer to it rather than proceeding to
                            // archiveSession, which would destroy the session its new
                            // transport is connected to.
                            if (currentWorkId !== workIdBeingCleared) {
                                (0, debug_js_1.logForDebugging)('[bridge:repl] Poll loop recovered during stopWork await — deferring to it');
                                environmentRecreations = 0;
                                return [2 /*return*/, true];
                            }
                            currentWorkId = null;
                            currentIngressToken = null;
                            _a.label = 2;
                        case 2:
                            // Bail out if teardown started while we were awaiting
                            if (pollController.signal.aborted) {
                                (0, debug_js_1.logForDebugging)('[bridge:repl] Reconnect aborted by teardown');
                                return [2 /*return*/, false];
                            }
                            requestedEnvId = environmentId;
                            bridgeConfig.reuseEnvironmentId = requestedEnvId;
                            _a.label = 3;
                        case 3:
                            _a.trys.push([3, 5, , 6]);
                            return [4 /*yield*/, api.registerBridgeEnvironment(bridgeConfig)];
                        case 4:
                            reg = _a.sent();
                            environmentId = reg.environment_id;
                            environmentSecret = reg.environment_secret;
                            return [3 /*break*/, 6];
                        case 5:
                            err_3 = _a.sent();
                            bridgeConfig.reuseEnvironmentId = undefined;
                            (0, debug_js_1.logForDebugging)("[bridge:repl] Environment re-registration failed: ".concat((0, errors_js_1.errorMessage)(err_3)));
                            return [2 /*return*/, false];
                        case 6:
                            // Clear before any await — a stale value would poison the next fresh
                            // registration if doReconnect runs again.
                            bridgeConfig.reuseEnvironmentId = undefined;
                            (0, debug_js_1.logForDebugging)("[bridge:repl] Re-registered: requested=".concat(requestedEnvId, " got=").concat(environmentId));
                            if (!pollController.signal.aborted) return [3 /*break*/, 8];
                            (0, debug_js_1.logForDebugging)('[bridge:repl] Reconnect aborted after env registration, cleaning up');
                            return [4 /*yield*/, api.deregisterEnvironment(environmentId).catch(function () { })];
                        case 7:
                            _a.sent();
                            return [2 /*return*/, false];
                        case 8:
                            // Same race as above, narrower window: poll loop may have set up a
                            // transport during the registerBridgeEnvironment await. Bail before
                            // tryReconnectInPlace/archiveSession kill it server-side.
                            if (transport !== null) {
                                (0, debug_js_1.logForDebugging)('[bridge:repl] Poll loop recovered during registerBridgeEnvironment await — deferring to it');
                                environmentRecreations = 0;
                                return [2 /*return*/, true];
                            }
                            return [4 /*yield*/, tryReconnectInPlace(requestedEnvId, currentSessionId)];
                        case 9:
                            // Strategy 1: same helper as perpetual init. currentSessionId stays
                            // the same on success; URL on mobile/web stays valid;
                            // previouslyFlushedUUIDs preserved (no re-flush).
                            if (_a.sent()) {
                                (0, index_js_1.logEvent)('tengu_bridge_repl_reconnected_in_place', {});
                                environmentRecreations = 0;
                                return [2 /*return*/, true];
                            }
                            // Env differs → TTL-expired/reaped; or reconnect failed.
                            // Don't deregister — we have a fresh secret for this env either way.
                            if (environmentId !== requestedEnvId) {
                                (0, index_js_1.logEvent)('tengu_bridge_repl_env_expired_fresh_session', {});
                            }
                            // Strategy 2: fresh session on the now-registered environment.
                            // Archive the old session first — it's orphaned (bound to a dead env,
                            // or reconnectSession rejected it). Don't deregister the env — we just
                            // got a fresh secret for it and are about to use it.
                            return [4 /*yield*/, archiveSession(currentSessionId)
                                // Bail out if teardown started while we were archiving
                            ];
                        case 10:
                            // Strategy 2: fresh session on the now-registered environment.
                            // Archive the old session first — it's orphaned (bound to a dead env,
                            // or reconnectSession rejected it). Don't deregister the env — we just
                            // got a fresh secret for it and are about to use it.
                            _a.sent();
                            if (!pollController.signal.aborted) return [3 /*break*/, 12];
                            (0, debug_js_1.logForDebugging)('[bridge:repl] Reconnect aborted after archive, cleaning up');
                            return [4 /*yield*/, api.deregisterEnvironment(environmentId).catch(function () { })];
                        case 11:
                            _a.sent();
                            return [2 /*return*/, false];
                        case 12:
                            currentTitle = getCurrentTitle();
                            return [4 /*yield*/, createSession({
                                    environmentId: environmentId,
                                    title: currentTitle,
                                    gitRepoUrl: gitRepoUrl,
                                    branch: branch,
                                    signal: AbortSignal.timeout(15000),
                                })];
                        case 13:
                            newSessionId = _a.sent();
                            if (!newSessionId) {
                                (0, debug_js_1.logForDebugging)('[bridge:repl] Session creation failed during reconnection');
                                return [2 /*return*/, false];
                            }
                            if (!pollController.signal.aborted) return [3 /*break*/, 15];
                            (0, debug_js_1.logForDebugging)('[bridge:repl] Reconnect aborted after session creation, cleaning up');
                            return [4 /*yield*/, archiveSession(newSessionId)];
                        case 14:
                            _a.sent();
                            return [2 /*return*/, false];
                        case 15:
                            currentSessionId = newSessionId;
                            // Re-publish to the PID file so peer dedup (peerRegistry.ts) picks up the
                            // new ID — setReplBridgeHandle only fires at init/teardown, not reconnect.
                            void (0, concurrentSessions_js_1.updateSessionBridgeId)((0, sessionIdCompat_js_1.toCompatSessionId)(newSessionId)).catch(function () { });
                            // Reset per-session transport state IMMEDIATELY after the session swap,
                            // before any await. If this runs after `await writeBridgePointer` below,
                            // there's a window where handle.bridgeSessionId already returns session B
                            // but getSSESequenceNum() still returns session A's seq — a daemon
                            // persistState() in that window writes {bridgeSessionId: B, seq: OLD_A},
                            // which PASSES the session-ID validation check and defeats it entirely.
                            //
                            // The SSE seq-num is scoped to the session's event stream — carrying it
                            // over leaves the transport's lastSequenceNum stuck high (seq only
                            // advances when received > last), and its next internal reconnect would
                            // send from_sequence_num=OLD_SEQ against a stream starting at 1 → all
                            // events in the gap silently dropped. Inbound UUID dedup is also
                            // session-scoped.
                            lastTransportSequenceNum = 0;
                            recentInboundUUIDs.clear();
                            // Title derivation is session-scoped too: if the user typed during the
                            // createSession await above, the callback fired against the OLD archived
                            // session ID (PATCH lost) and the new session got `currentTitle` captured
                            // BEFORE they typed. Reset so the next prompt can re-derive. Self-
                            // correcting: if the caller's policy is already done (explicit title or
                            // count ≥ 3), it returns true on the first post-reset call and re-latches.
                            userMessageCallbackDone = !onUserMessage;
                            (0, debug_js_1.logForDebugging)("[bridge:repl] Re-created session: ".concat(currentSessionId));
                            // Rewrite the crash-recovery pointer with the new IDs so a crash after
                            // this point resumes the right session. (The reconnect-in-place path
                            // above doesn't touch the pointer — same session, same env.)
                            return [4 /*yield*/, writeBridgePointer(dir, {
                                    sessionId: currentSessionId,
                                    environmentId: environmentId,
                                    source: 'repl',
                                })
                                // Clear flushed UUIDs so initial messages are re-sent to the new session.
                                // UUIDs are scoped per-session on the server, so re-flushing is safe.
                            ];
                        case 16:
                            // Rewrite the crash-recovery pointer with the new IDs so a crash after
                            // this point resumes the right session. (The reconnect-in-place path
                            // above doesn't touch the pointer — same session, same env.)
                            _a.sent();
                            // Clear flushed UUIDs so initial messages are re-sent to the new session.
                            // UUIDs are scoped per-session on the server, so re-flushing is safe.
                            previouslyFlushedUUIDs === null || previouslyFlushedUUIDs === void 0 ? void 0 : previouslyFlushedUUIDs.clear();
                            // Reset the counter so independent reconnections hours apart don't
                            // exhaust the limit — it guards against rapid consecutive failures,
                            // not lifetime total.
                            environmentRecreations = 0;
                            return [2 /*return*/, true];
                    }
                });
            });
        }
        // Helper: get the current OAuth access token for session ingress auth.
        // Unlike the JWT path, OAuth tokens are refreshed by the standard OAuth
        // flow — no proactive scheduler needed.
        function getOAuthToken() {
            return getAccessToken();
        }
        // Drain any messages that were queued during the initial flush.
        // Called after writeBatch completes (or fails) so queued messages
        // are sent in order after the historical messages.
        function drainFlushGate() {
            var msgs = flushGate.end();
            if (msgs.length === 0)
                return;
            if (!transport) {
                (0, debug_js_1.logForDebugging)("[bridge:repl] Cannot drain ".concat(msgs.length, " pending message(s): no transport"));
                return;
            }
            for (var _i = 0, msgs_1 = msgs; _i < msgs_1.length; _i++) {
                var msg = msgs_1[_i];
                recentPostedUUIDs.add(msg.uuid);
            }
            var sdkMessages = toSDKMessages(msgs);
            var events = sdkMessages.map(function (sdkMsg) { return (__assign(__assign({}, sdkMsg), { session_id: currentSessionId })); });
            (0, debug_js_1.logForDebugging)("[bridge:repl] Drained ".concat(msgs.length, " pending message(s) after flush"));
            void transport.writeBatch(events);
        }
        function triggerTeardown() {
            void (doTeardownImpl === null || doTeardownImpl === void 0 ? void 0 : doTeardownImpl());
        }
        /**
         * Body of the transport's setOnClose callback, hoisted to initBridgeCore
         * scope so /bridge-kick can fire it directly. setOnClose wraps this with
         * a stale-transport guard; debugFireClose calls it bare.
         *
         * With autoReconnect:true, this only fires on: clean close (1000),
         * permanent server rejection (4001/1002/4003), or 10-min budget
         * exhaustion. Transient drops are retried internally by the transport.
         */
        function handleTransportPermanentClose(closeCode) {
            (0, debug_js_1.logForDebugging)("[bridge:repl] Transport permanently closed: code=".concat(closeCode));
            (0, index_js_1.logEvent)('tengu_bridge_repl_ws_closed', {
                code: closeCode,
            });
            // Capture SSE seq high-water mark before nulling. When called from
            // setOnClose the guard guarantees transport !== null; when fired from
            // /bridge-kick it may already be null (e.g. fired twice) — skip.
            if (transport) {
                var closedSeq = transport.getLastSequenceNum();
                if (closedSeq > lastTransportSequenceNum) {
                    lastTransportSequenceNum = closedSeq;
                }
                transport = null;
            }
            // Transport is gone — wake the poll loop out of its at-capacity
            // heartbeat sleep so it's fast-polling by the time the reconnect
            // below completes and the server re-queues work.
            wakePollLoop();
            // Reset flush state so writeMessages() hits the !transport guard
            // (with a warning log) instead of silently queuing into a buffer
            // that will never be drained. Unlike onWorkReceived (which
            // preserves pending messages for the new transport), onClose is
            // a permanent close — no new transport will drain these.
            var dropped = flushGate.drop();
            if (dropped > 0) {
                (0, debug_js_1.logForDebugging)("[bridge:repl] Dropping ".concat(dropped, " pending message(s) on transport close (code=").concat(closeCode, ")"), { level: 'warn' });
            }
            if (closeCode === 1000) {
                // Clean close — session ended normally. Tear down the bridge.
                onStateChange === null || onStateChange === void 0 ? void 0 : onStateChange('failed', 'session ended');
                pollController.abort();
                triggerTeardown();
                return;
            }
            // Transport reconnect budget exhausted or permanent server
            // rejection. By this point the env has usually been reaped
            // server-side (BQ 2026-03-12: ~98% of ws_closed never recover
            // via poll alone). stopWork(force=false) can't re-dispatch work
            // from an archived env; reconnectEnvironmentWithSession can
            // re-activate it via POST /bridge/reconnect, or fall through
            // to a fresh session if the env is truly gone. The poll loop
            // (already woken above) picks up the re-queued work once
            // doReconnect completes.
            onStateChange === null || onStateChange === void 0 ? void 0 : onStateChange('reconnecting', "Remote Control connection lost (code ".concat(closeCode, ")"));
            (0, debug_js_1.logForDebugging)("[bridge:repl] Transport reconnect budget exhausted (code=".concat(closeCode, "), attempting env reconnect"));
            void reconnectEnvironmentWithSession().then(function (success) {
                if (success)
                    return;
                // doReconnect has four abort-check return-false sites for
                // teardown-in-progress. Don't pollute the BQ failure signal
                // or double-teardown when the user just quit.
                if (pollController.signal.aborted)
                    return;
                // doReconnect returns false (never throws) on genuine failure.
                // The dangerous case: registerBridgeEnvironment succeeded (so
                // environmentId now points at a fresh valid env) but
                // createSession failed — poll loop would poll a sessionless
                // env getting null work with no errors, never hitting any
                // give-up path. Tear down explicitly.
                (0, debug_js_1.logForDebugging)('[bridge:repl] reconnectEnvironmentWithSession resolved false — tearing down');
                (0, index_js_1.logEvent)('tengu_bridge_repl_reconnect_failed', {
                    close_code: closeCode,
                });
                onStateChange === null || onStateChange === void 0 ? void 0 : onStateChange('failed', 'reconnection failed');
                triggerTeardown();
            });
        }
        var dir, machineName, branch, gitRepoUrl, title, baseUrl, sessionIngressUrl, workerType, getAccessToken, createSession, archiveSession, _a, getCurrentTitle, _b, toSDKMessages, onAuth401, _c, getPollIntervalConfig, _d, initialHistoryCap, initialMessages, previouslyFlushedUUIDs, onInboundMessage, onPermissionResponse, onInterrupt, onSetModel, onSetMaxThinkingTokens, onSetPermissionMode, onStateChange, onUserMessage, perpetual, _e, initialSSESequenceNum, seq, _f, writeBridgePointer, clearBridgePointer, readBridgePointer, rawPrior, _g, prior, rawApi, api, bridgeConfig, environmentId, environmentSecret, reg, err_1, reusedPriorSession, _h, currentSessionId, _i, initialMessages_1, msg, createdSessionId, initialMessageUUIDs, _j, initialMessages_2, msg, recentPostedUUIDs, _k, initialMessageUUIDs_1, uuid, recentInboundUUIDs, pollController, transport, v2Generation, lastTransportSequenceNum, currentWorkId, currentIngressToken, capacityWake, wakePollLoop, capacitySignal, flushGate, userMessageCallbackDone, MAX_ENVIRONMENT_RECREATIONS, environmentRecreations, reconnectPromise, doTeardownImpl, sigusr2Handler, debugFireClose, pollOpts, pointerRefreshTimer, keepAliveIntervalMs, keepAliveTimer, teardownStarted, unregister;
        var _this = this;
        var _l, _m, _o;
        return __generator(this, function (_p) {
            switch (_p.label) {
                case 0:
                    dir = params.dir, machineName = params.machineName, branch = params.branch, gitRepoUrl = params.gitRepoUrl, title = params.title, baseUrl = params.baseUrl, sessionIngressUrl = params.sessionIngressUrl, workerType = params.workerType, getAccessToken = params.getAccessToken, createSession = params.createSession, archiveSession = params.archiveSession, _a = params.getCurrentTitle, getCurrentTitle = _a === void 0 ? function () { return title; } : _a, _b = params.toSDKMessages, toSDKMessages = _b === void 0 ? function () {
                        throw new Error('BridgeCoreParams.toSDKMessages not provided. Pass it if you use writeMessages() or initialMessages — daemon callers that only use writeSdkMessages() never hit this path.');
                    } : _b, onAuth401 = params.onAuth401, _c = params.getPollIntervalConfig, getPollIntervalConfig = _c === void 0 ? function () { return pollConfigDefaults_js_1.DEFAULT_POLL_CONFIG; } : _c, _d = params.initialHistoryCap, initialHistoryCap = _d === void 0 ? 200 : _d, initialMessages = params.initialMessages, previouslyFlushedUUIDs = params.previouslyFlushedUUIDs, onInboundMessage = params.onInboundMessage, onPermissionResponse = params.onPermissionResponse, onInterrupt = params.onInterrupt, onSetModel = params.onSetModel, onSetMaxThinkingTokens = params.onSetMaxThinkingTokens, onSetPermissionMode = params.onSetPermissionMode, onStateChange = params.onStateChange, onUserMessage = params.onUserMessage, perpetual = params.perpetual, _e = params.initialSSESequenceNum, initialSSESequenceNum = _e === void 0 ? 0 : _e;
                    seq = ++initSequence;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./bridgePointer.js'); })];
                case 1:
                    _f = _p.sent(), writeBridgePointer = _f.writeBridgePointer, clearBridgePointer = _f.clearBridgePointer, readBridgePointer = _f.readBridgePointer;
                    if (!perpetual) return [3 /*break*/, 3];
                    return [4 /*yield*/, readBridgePointer(dir)];
                case 2:
                    _g = _p.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _g = null;
                    _p.label = 4;
                case 4:
                    rawPrior = _g;
                    prior = (rawPrior === null || rawPrior === void 0 ? void 0 : rawPrior.source) === 'repl' ? rawPrior : null;
                    (0, debug_js_1.logForDebugging)("[bridge:repl] initBridgeCore #".concat(seq, " starting (initialMessages=").concat((_l = initialMessages === null || initialMessages === void 0 ? void 0 : initialMessages.length) !== null && _l !== void 0 ? _l : 0).concat(prior ? " perpetual prior=env:".concat(prior.environmentId) : '', ")"));
                    rawApi = (0, bridgeApi_js_1.createBridgeApiClient)({
                        baseUrl: baseUrl,
                        getAccessToken: getAccessToken,
                        runnerVersion: MACRO.VERSION,
                        onDebug: debug_js_1.logForDebugging,
                        onAuth401: onAuth401,
                        getTrustedDeviceToken: trustedDevice_js_1.getTrustedDeviceToken,
                    });
                    api = process.env.USER_TYPE === 'ant' ? (0, bridgeDebug_js_1.wrapApiForFaultInjection)(rawApi) : rawApi;
                    bridgeConfig = {
                        dir: dir,
                        machineName: machineName,
                        branch: branch,
                        gitRepoUrl: gitRepoUrl,
                        maxSessions: 1,
                        spawnMode: 'single-session',
                        verbose: false,
                        sandbox: false,
                        bridgeId: (0, crypto_1.randomUUID)(),
                        workerType: workerType,
                        environmentId: (0, crypto_1.randomUUID)(),
                        reuseEnvironmentId: prior === null || prior === void 0 ? void 0 : prior.environmentId,
                        apiBaseUrl: baseUrl,
                        sessionIngressUrl: sessionIngressUrl,
                    };
                    _p.label = 5;
                case 5:
                    _p.trys.push([5, 7, , 10]);
                    return [4 /*yield*/, api.registerBridgeEnvironment(bridgeConfig)];
                case 6:
                    reg = _p.sent();
                    environmentId = reg.environment_id;
                    environmentSecret = reg.environment_secret;
                    return [3 /*break*/, 10];
                case 7:
                    err_1 = _p.sent();
                    (0, debugUtils_js_1.logBridgeSkip)('registration_failed', "[bridge:repl] Environment registration failed: ".concat((0, errors_js_1.errorMessage)(err_1)));
                    if (!prior) return [3 /*break*/, 9];
                    return [4 /*yield*/, clearBridgePointer(dir)];
                case 8:
                    _p.sent();
                    _p.label = 9;
                case 9:
                    onStateChange === null || onStateChange === void 0 ? void 0 : onStateChange('failed', (0, errors_js_1.errorMessage)(err_1));
                    return [2 /*return*/, null];
                case 10:
                    (0, debug_js_1.logForDebugging)("[bridge:repl] Environment registered: ".concat(environmentId));
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'bridge_repl_env_registered');
                    (0, index_js_1.logEvent)('tengu_bridge_repl_env_registered', {});
                    if (!prior) return [3 /*break*/, 12];
                    return [4 /*yield*/, tryReconnectInPlace(prior.environmentId, prior.sessionId)];
                case 11:
                    _h = _p.sent();
                    return [3 /*break*/, 13];
                case 12:
                    _h = false;
                    _p.label = 13;
                case 13:
                    reusedPriorSession = _h;
                    if (!(prior && !reusedPriorSession)) return [3 /*break*/, 15];
                    return [4 /*yield*/, clearBridgePointer(dir)];
                case 14:
                    _p.sent();
                    _p.label = 15;
                case 15:
                    if (!(reusedPriorSession && prior)) return [3 /*break*/, 16];
                    currentSessionId = prior.sessionId;
                    (0, debug_js_1.logForDebugging)("[bridge:repl] Perpetual session reused: ".concat(currentSessionId));
                    // Server already has all initialMessages from the prior CLI run. Mark
                    // them as previously-flushed so the initial flush filter excludes them
                    // (previouslyFlushedUUIDs is a fresh Set on every CLI start). Duplicate
                    // UUIDs cause the server to kill the WebSocket.
                    if (initialMessages && previouslyFlushedUUIDs) {
                        for (_i = 0, initialMessages_1 = initialMessages; _i < initialMessages_1.length; _i++) {
                            msg = initialMessages_1[_i];
                            previouslyFlushedUUIDs.add(msg.uuid);
                        }
                    }
                    return [3 /*break*/, 20];
                case 16: return [4 /*yield*/, createSession({
                        environmentId: environmentId,
                        title: title,
                        gitRepoUrl: gitRepoUrl,
                        branch: branch,
                        signal: AbortSignal.timeout(15000),
                    })];
                case 17:
                    createdSessionId = _p.sent();
                    if (!!createdSessionId) return [3 /*break*/, 19];
                    (0, debug_js_1.logForDebugging)('[bridge:repl] Session creation failed, deregistering environment');
                    (0, index_js_1.logEvent)('tengu_bridge_repl_session_failed', {});
                    return [4 /*yield*/, api.deregisterEnvironment(environmentId).catch(function () { })];
                case 18:
                    _p.sent();
                    onStateChange === null || onStateChange === void 0 ? void 0 : onStateChange('failed', 'Session creation failed');
                    return [2 /*return*/, null];
                case 19:
                    currentSessionId = createdSessionId;
                    (0, debug_js_1.logForDebugging)("[bridge:repl] Session created: ".concat(currentSessionId));
                    _p.label = 20;
                case 20: 
                // Crash-recovery pointer: written now so a kill -9 at any point after
                // this leaves a recoverable trail. Cleared in teardown (non-perpetual)
                // or left alone (perpetual mode — pointer survives clean exit too).
                // `claude remote-control --continue` from the same directory will detect
                // it and offer to resume.
                return [4 /*yield*/, writeBridgePointer(dir, {
                        sessionId: currentSessionId,
                        environmentId: environmentId,
                        source: 'repl',
                    })];
                case 21:
                    // Crash-recovery pointer: written now so a kill -9 at any point after
                    // this leaves a recoverable trail. Cleared in teardown (non-perpetual)
                    // or left alone (perpetual mode — pointer survives clean exit too).
                    // `claude remote-control --continue` from the same directory will detect
                    // it and offer to resume.
                    _p.sent();
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'bridge_repl_session_created');
                    (0, index_js_1.logEvent)('tengu_bridge_repl_started', {
                        has_initial_messages: !!(initialMessages && initialMessages.length > 0),
                        inProtectedNamespace: (0, envUtils_js_1.isInProtectedNamespace)(),
                    });
                    initialMessageUUIDs = new Set();
                    if (initialMessages) {
                        for (_j = 0, initialMessages_2 = initialMessages; _j < initialMessages_2.length; _j++) {
                            msg = initialMessages_2[_j];
                            initialMessageUUIDs.add(msg.uuid);
                        }
                    }
                    recentPostedUUIDs = new bridgeMessaging_js_1.BoundedUUIDSet(2000);
                    for (_k = 0, initialMessageUUIDs_1 = initialMessageUUIDs; _k < initialMessageUUIDs_1.length; _k++) {
                        uuid = initialMessageUUIDs_1[_k];
                        recentPostedUUIDs.add(uuid);
                    }
                    recentInboundUUIDs = new bridgeMessaging_js_1.BoundedUUIDSet(2000);
                    pollController = new AbortController();
                    transport = null;
                    v2Generation = 0;
                    lastTransportSequenceNum = reusedPriorSession ? initialSSESequenceNum : 0;
                    currentWorkId = null;
                    currentIngressToken = null;
                    capacityWake = (0, capacityWake_js_1.createCapacityWake)(pollController.signal);
                    wakePollLoop = capacityWake.wake;
                    capacitySignal = capacityWake.signal;
                    flushGate = new flushGate_js_1.FlushGate();
                    userMessageCallbackDone = !onUserMessage;
                    MAX_ENVIRONMENT_RECREATIONS = 3;
                    environmentRecreations = 0;
                    reconnectPromise = null;
                    doTeardownImpl = null;
                    if (process.env.USER_TYPE === 'ant' && process.platform !== 'win32') {
                        sigusr2Handler = function () {
                            (0, debug_js_1.logForDebugging)('[bridge:repl] SIGUSR2 received — forcing doReconnect() for testing');
                            void reconnectEnvironmentWithSession();
                        };
                        process.on('SIGUSR2', sigusr2Handler);
                    }
                    debugFireClose = null;
                    if (process.env.USER_TYPE === 'ant') {
                        (0, bridgeDebug_js_1.registerBridgeDebugHandle)({
                            fireClose: function (code) {
                                if (!debugFireClose) {
                                    (0, debug_js_1.logForDebugging)('[bridge:debug] fireClose: no transport wired yet');
                                    return;
                                }
                                (0, debug_js_1.logForDebugging)("[bridge:debug] fireClose(".concat(code, ") \u2014 injecting"));
                                debugFireClose(code);
                            },
                            forceReconnect: function () {
                                (0, debug_js_1.logForDebugging)('[bridge:debug] forceReconnect — injecting');
                                void reconnectEnvironmentWithSession();
                            },
                            injectFault: bridgeDebug_js_1.injectBridgeFault,
                            wakePollLoop: wakePollLoop,
                            describe: function () { var _a; return "env=".concat(environmentId, " session=").concat(currentSessionId, " transport=").concat((_a = transport === null || transport === void 0 ? void 0 : transport.getStateLabel()) !== null && _a !== void 0 ? _a : 'null', " workId=").concat(currentWorkId !== null && currentWorkId !== void 0 ? currentWorkId : 'null'); },
                        });
                    }
                    pollOpts = {
                        api: api,
                        getCredentials: function () { return ({ environmentId: environmentId, environmentSecret: environmentSecret }); },
                        signal: pollController.signal,
                        getPollIntervalConfig: getPollIntervalConfig,
                        onStateChange: onStateChange,
                        getWsState: function () { var _a; return (_a = transport === null || transport === void 0 ? void 0 : transport.getStateLabel()) !== null && _a !== void 0 ? _a : 'null'; },
                        // REPL bridge is single-session: having any transport == at capacity.
                        // No need to check isConnectedStatus() — even while the transport is
                        // auto-reconnecting internally (up to 10 min), poll is heartbeat-only.
                        isAtCapacity: function () { return transport !== null; },
                        capacitySignal: capacitySignal,
                        onFatalError: triggerTeardown,
                        getHeartbeatInfo: function () {
                            if (!currentWorkId || !currentIngressToken) {
                                return null;
                            }
                            return {
                                environmentId: environmentId,
                                workId: currentWorkId,
                                sessionToken: currentIngressToken,
                            };
                        },
                        // Work-item JWT expired (or work gone). The transport is useless —
                        // SSE reconnects and CCR writes use the same stale token. Without
                        // this callback the poll loop would do a 10-min at-capacity backoff,
                        // during which the work lease (300s TTL) expires and the server stops
                        // forwarding prompts → ~25-min dead window observed in daemon logs.
                        // Kill the transport + work state so isAtCapacity()=false; the loop
                        // fast-polls and picks up the server's re-dispatched work in seconds.
                        onHeartbeatFatal: function (err) {
                            (0, debug_js_1.logForDebugging)("[bridge:repl] heartbeatWork fatal (status=".concat(err.status, ") \u2014 tearing down work item for fast re-dispatch"));
                            if (transport) {
                                var seq_2 = transport.getLastSequenceNum();
                                if (seq_2 > lastTransportSequenceNum) {
                                    lastTransportSequenceNum = seq_2;
                                }
                                transport.close();
                                transport = null;
                            }
                            flushGate.drop();
                            // force=false → server re-queues. Likely already expired, but
                            // idempotent and makes re-dispatch immediate if not.
                            if (currentWorkId) {
                                void api
                                    .stopWork(environmentId, currentWorkId, false)
                                    .catch(function (e) {
                                    (0, debug_js_1.logForDebugging)("[bridge:repl] stopWork after heartbeat fatal: ".concat((0, errors_js_1.errorMessage)(e)));
                                });
                            }
                            currentWorkId = null;
                            currentIngressToken = null;
                            wakePollLoop();
                            onStateChange === null || onStateChange === void 0 ? void 0 : onStateChange('reconnecting', 'Work item lease expired, fetching fresh token');
                        },
                        onEnvironmentLost: function () {
                            return __awaiter(this, void 0, void 0, function () {
                                var success;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, reconnectEnvironmentWithSession()];
                                        case 1:
                                            success = _a.sent();
                                            if (!success) {
                                                return [2 /*return*/, null];
                                            }
                                            return [2 /*return*/, { environmentId: environmentId, environmentSecret: environmentSecret }];
                                    }
                                });
                            });
                        },
                        onWorkReceived: function (workSessionId, ingressToken, workId, serverUseCcrV2) {
                            // When new work arrives while a transport is already open, the
                            // server has decided to re-dispatch (e.g. token rotation, server
                            // restart). Close the existing transport and reconnect — discarding
                            // the work causes a stuck 'reconnecting' state if the old WS dies
                            // shortly after (the server won't re-dispatch a work item it
                            // already delivered).
                            // ingressToken (JWT) is stored for heartbeat auth (both v1 and v2).
                            // Transport auth diverges — see the v1/v2 split below.
                            if (transport === null || transport === void 0 ? void 0 : transport.isConnectedStatus()) {
                                (0, debug_js_1.logForDebugging)("[bridge:repl] Work received while transport connected, replacing with fresh token (workId=".concat(workId, ")"));
                            }
                            (0, debug_js_1.logForDebugging)("[bridge:repl] Work received: workId=".concat(workId, " workSessionId=").concat(workSessionId, " currentSessionId=").concat(currentSessionId, " match=").concat((0, workSecret_js_1.sameSessionId)(workSessionId, currentSessionId)));
                            // Refresh the crash-recovery pointer's mtime. Staleness checks file
                            // mtime (not embedded timestamp) so this re-write bumps the clock —
                            // a 5h+ session that crashes still has a fresh pointer. Fires once
                            // per work dispatch (infrequent — bounded by user message rate).
                            void writeBridgePointer(dir, {
                                sessionId: currentSessionId,
                                environmentId: environmentId,
                                source: 'repl',
                            });
                            // Reject foreign session IDs — the server shouldn't assign sessions
                            // from other environments. Since we create env+session as a pair,
                            // a mismatch indicates an unexpected server-side reassignment.
                            //
                            // Compare by underlying UUID, not by tagged-ID prefix. When CCR
                            // v2's compat layer serves the session, createBridgeSession gets
                            // session_* from the v1-facing API (compat/convert.go:41) but the
                            // infrastructure layer delivers cse_* in the work queue
                            // (container_manager.go:129). Same UUID, different tag.
                            if (!(0, workSecret_js_1.sameSessionId)(workSessionId, currentSessionId)) {
                                (0, debug_js_1.logForDebugging)("[bridge:repl] Rejecting foreign session: expected=".concat(currentSessionId, " got=").concat(workSessionId));
                                return;
                            }
                            currentWorkId = workId;
                            currentIngressToken = ingressToken;
                            // Server decides per-session (secret.use_code_sessions from the work
                            // secret, threaded through runWorkPollLoop). The env var is an ant-dev
                            // override for forcing v2 before the server flag is on for your user —
                            // requires ccr_v2_compat_enabled server-side or registerWorker 404s.
                            //
                            // Kept separate from CLAUDE_CODE_USE_CCR_V2 (the child-SDK transport
                            // selector set by sessionRunner/environment-manager) to avoid the
                            // inheritance hazard in spawn mode where the parent's orchestrator
                            // var would leak into a v1 child.
                            var useCcrV2 = serverUseCcrV2 || (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_BRIDGE_USE_CCR_V2);
                            // Auth is the one place v1 and v2 diverge hard:
                            //
                            // - v1 (Session-Ingress): accepts OAuth OR JWT. We prefer OAuth
                            //   because the standard OAuth refresh flow handles expiry — no
                            //   separate JWT refresh scheduler needed.
                            //
                            // - v2 (CCR /worker/*): REQUIRES the JWT. register_worker.go:32
                            //   validates the session_id claim, which OAuth tokens don't carry.
                            //   The JWT from the work secret has both that claim and the worker
                            //   role (environment_auth.py:856). JWT refresh: when it expires the
                            //   server re-dispatches work with a fresh one, and onWorkReceived
                            //   fires again. createV2ReplTransport stores it via
                            //   updateSessionIngressAuthToken() before touching the network.
                            var v1OauthToken;
                            if (!useCcrV2) {
                                v1OauthToken = getOAuthToken();
                                if (!v1OauthToken) {
                                    (0, debug_js_1.logForDebugging)('[bridge:repl] No OAuth token available for session ingress, skipping work');
                                    return;
                                }
                                (0, sessionIngressAuth_js_1.updateSessionIngressAuthToken)(v1OauthToken);
                            }
                            (0, index_js_1.logEvent)('tengu_bridge_repl_work_received', {});
                            // Close the previous transport. Nullify BEFORE calling close() so
                            // the close callback doesn't treat the programmatic close as
                            // "session ended normally" and trigger a full teardown.
                            if (transport) {
                                var oldTransport = transport;
                                transport = null;
                                // Capture the SSE sequence high-water mark so the next transport
                                // resumes the stream instead of replaying from seq 0. Use max() —
                                // a transport that died early (never received any frames) would
                                // otherwise reset a non-zero mark back to 0.
                                var oldSeq = oldTransport.getLastSequenceNum();
                                if (oldSeq > lastTransportSequenceNum) {
                                    lastTransportSequenceNum = oldSeq;
                                }
                                oldTransport.close();
                            }
                            // Reset flush state — the old flush (if any) is no longer relevant.
                            // Preserve pending messages so they're drained after the new
                            // transport's flush completes (the hook has already advanced its
                            // lastWrittenIndex and won't re-send them).
                            flushGate.deactivate();
                            // Closure adapter over the shared handleServerControlRequest —
                            // captures transport/currentSessionId so the transport.setOnData
                            // callback below doesn't need to thread them through.
                            var onServerControlRequest = function (request) {
                                return (0, bridgeMessaging_js_1.handleServerControlRequest)(request, {
                                    transport: transport,
                                    sessionId: currentSessionId,
                                    onInterrupt: onInterrupt,
                                    onSetModel: onSetModel,
                                    onSetMaxThinkingTokens: onSetMaxThinkingTokens,
                                    onSetPermissionMode: onSetPermissionMode,
                                });
                            };
                            var initialFlushDone = false;
                            // Wire callbacks onto a freshly constructed transport and connect.
                            // Extracted so the (sync) v1 and (async) v2 construction paths can
                            // share the identical callback + flush machinery.
                            var wireTransport = function (newTransport) {
                                transport = newTransport;
                                newTransport.setOnConnect(function () {
                                    // Guard: if transport was replaced by a newer onWorkReceived call
                                    // while the WS was connecting, ignore this stale callback.
                                    if (transport !== newTransport)
                                        return;
                                    (0, debug_js_1.logForDebugging)('[bridge:repl] Ingress transport connected');
                                    (0, index_js_1.logEvent)('tengu_bridge_repl_ws_connected', {});
                                    // Update the env var with the latest OAuth token so POST writes
                                    // (which read via getSessionIngressAuthToken()) use a fresh token.
                                    // v2 skips this — createV2ReplTransport already stored the JWT,
                                    // and overwriting it with OAuth would break subsequent /worker/*
                                    // requests (session_id claim check).
                                    if (!useCcrV2) {
                                        var freshToken = getOAuthToken();
                                        if (freshToken) {
                                            (0, sessionIngressAuth_js_1.updateSessionIngressAuthToken)(freshToken);
                                        }
                                    }
                                    // Reset teardownStarted so future teardowns are not blocked.
                                    teardownStarted = false;
                                    // Flush initial messages only on first connect, not on every
                                    // WS reconnection. Re-flushing would cause duplicate messages.
                                    // IMPORTANT: onStateChange('connected') is deferred until the
                                    // flush completes. This prevents writeMessages() from sending
                                    // new messages that could arrive at the server interleaved with
                                    // the historical messages, and delays the web UI from showing
                                    // the session as active until history is persisted.
                                    if (!initialFlushDone &&
                                        initialMessages &&
                                        initialMessages.length > 0) {
                                        initialFlushDone = true;
                                        // Cap the initial flush to the most recent N messages. The full
                                        // history is UI-only (model doesn't see it) and large replays cause
                                        // slow session-ingress persistence (each event is a threadstore write)
                                        // plus elevated Firestore pressure. A 0 or negative cap disables it.
                                        var historyCap = initialHistoryCap;
                                        var eligibleMessages = initialMessages.filter(function (m) {
                                            return (0, bridgeMessaging_js_1.isEligibleBridgeMessage)(m) &&
                                                !(previouslyFlushedUUIDs === null || previouslyFlushedUUIDs === void 0 ? void 0 : previouslyFlushedUUIDs.has(m.uuid));
                                        });
                                        var cappedMessages = historyCap > 0 && eligibleMessages.length > historyCap
                                            ? eligibleMessages.slice(-historyCap)
                                            : eligibleMessages;
                                        if (cappedMessages.length < eligibleMessages.length) {
                                            (0, debug_js_1.logForDebugging)("[bridge:repl] Capped initial flush: ".concat(eligibleMessages.length, " -> ").concat(cappedMessages.length, " (cap=").concat(historyCap, ")"));
                                            (0, index_js_1.logEvent)('tengu_bridge_repl_history_capped', {
                                                eligible_count: eligibleMessages.length,
                                                capped_count: cappedMessages.length,
                                            });
                                        }
                                        var sdkMessages_1 = toSDKMessages(cappedMessages);
                                        if (sdkMessages_1.length > 0) {
                                            (0, debug_js_1.logForDebugging)("[bridge:repl] Flushing ".concat(sdkMessages_1.length, " initial message(s) via transport"));
                                            var events = sdkMessages_1.map(function (sdkMsg) { return (__assign(__assign({}, sdkMsg), { session_id: currentSessionId })); });
                                            var dropsBefore_1 = newTransport.droppedBatchCount;
                                            void newTransport
                                                .writeBatch(events)
                                                .then(function () {
                                                // If any batch was dropped during this flush (SI down for
                                                // maxConsecutiveFailures attempts), flush() still resolved
                                                // normally but the events were NOT delivered. Don't mark
                                                // UUIDs as flushed — keep them eligible for re-send on the
                                                // next onWorkReceived (JWT refresh re-dispatch, line ~1144).
                                                if (newTransport.droppedBatchCount > dropsBefore_1) {
                                                    (0, debug_js_1.logForDebugging)("[bridge:repl] Initial flush dropped ".concat(newTransport.droppedBatchCount - dropsBefore_1, " batch(es) \u2014 not marking ").concat(sdkMessages_1.length, " UUID(s) as flushed"));
                                                    return;
                                                }
                                                if (previouslyFlushedUUIDs) {
                                                    for (var _i = 0, sdkMessages_2 = sdkMessages_1; _i < sdkMessages_2.length; _i++) {
                                                        var sdkMsg = sdkMessages_2[_i];
                                                        if (sdkMsg.uuid) {
                                                            previouslyFlushedUUIDs.add(sdkMsg.uuid);
                                                        }
                                                    }
                                                }
                                            })
                                                .catch(function (e) {
                                                return (0, debug_js_1.logForDebugging)("[bridge:repl] Initial flush failed: ".concat(e));
                                            })
                                                .finally(function () {
                                                // Guard: if transport was replaced during the flush,
                                                // don't signal connected or drain — the new transport
                                                // owns the lifecycle now.
                                                if (transport !== newTransport)
                                                    return;
                                                drainFlushGate();
                                                onStateChange === null || onStateChange === void 0 ? void 0 : onStateChange('connected');
                                            });
                                        }
                                        else {
                                            // All initial messages were already flushed (filtered by
                                            // previouslyFlushedUUIDs). No flush POST needed — clear
                                            // the flag and signal connected immediately. This is the
                                            // first connect for this transport (inside !initialFlushDone),
                                            // so no flush POST is in-flight — the flag was set before
                                            // connect() and must be cleared here.
                                            drainFlushGate();
                                            onStateChange === null || onStateChange === void 0 ? void 0 : onStateChange('connected');
                                        }
                                    }
                                    else if (!flushGate.active) {
                                        // No initial messages or already flushed on first connect.
                                        // WS auto-reconnect path — only signal connected if no flush
                                        // POST is in-flight. If one is, .finally() owns the lifecycle.
                                        onStateChange === null || onStateChange === void 0 ? void 0 : onStateChange('connected');
                                    }
                                });
                                newTransport.setOnData(function (data) {
                                    (0, bridgeMessaging_js_1.handleIngressMessage)(data, recentPostedUUIDs, recentInboundUUIDs, onInboundMessage, onPermissionResponse, onServerControlRequest);
                                });
                                // Body lives at initBridgeCore scope so /bridge-kick can call it
                                // directly via debugFireClose. All referenced closures (transport,
                                // wakePollLoop, flushGate, reconnectEnvironmentWithSession, etc.)
                                // are already at that scope. The only lexical dependency on
                                // wireTransport was `newTransport.getLastSequenceNum()` — but after
                                // the guard below passes we know transport === newTransport.
                                debugFireClose = handleTransportPermanentClose;
                                newTransport.setOnClose(function (closeCode) {
                                    // Guard: if transport was replaced, ignore stale close.
                                    if (transport !== newTransport)
                                        return;
                                    handleTransportPermanentClose(closeCode);
                                });
                                // Start the flush gate before connect() to cover the WS handshake
                                // window. Between transport assignment and setOnConnect firing,
                                // writeMessages() could send messages via HTTP POST before the
                                // initial flush starts. Starting the gate here ensures those
                                // calls are queued. If there are no initial messages, the gate
                                // stays inactive.
                                if (!initialFlushDone &&
                                    initialMessages &&
                                    initialMessages.length > 0) {
                                    flushGate.start();
                                }
                                newTransport.connect();
                            }; // end wireTransport
                            // Bump unconditionally — ANY new transport (v1 or v2) invalidates an
                            // in-flight v2 handshake. Also bumped in doReconnect().
                            v2Generation++;
                            if (useCcrV2) {
                                // workSessionId is the cse_* form (infrastructure-layer ID from the
                                // work queue), which is what /v1/code/sessions/{id}/worker/* wants.
                                // The session_* form (currentSessionId) is NOT usable here —
                                // handler/convert.go:30 validates TagCodeSession.
                                var sessionUrl = (0, workSecret_js_1.buildCCRv2SdkUrl)(baseUrl, workSessionId);
                                var thisGen_1 = v2Generation;
                                (0, debug_js_1.logForDebugging)("[bridge:repl] CCR v2: sessionUrl=".concat(sessionUrl, " session=").concat(workSessionId, " gen=").concat(thisGen_1));
                                void (0, replBridgeTransport_js_1.createV2ReplTransport)({
                                    sessionUrl: sessionUrl,
                                    ingressToken: ingressToken,
                                    sessionId: workSessionId,
                                    initialSequenceNum: lastTransportSequenceNum,
                                }).then(function (t) {
                                    // Teardown started while registerWorker was in flight. Teardown
                                    // saw transport === null and skipped close(); installing now
                                    // would leak CCRClient heartbeat timers and reset
                                    // teardownStarted via wireTransport's side effects.
                                    if (pollController.signal.aborted) {
                                        t.close();
                                        return;
                                    }
                                    // onWorkReceived may have fired again while registerWorker()
                                    // was in flight (server re-dispatch with a fresh JWT). The
                                    // transport !== null check alone gets the race wrong when BOTH
                                    // attempts saw transport === null — it keeps the first resolver
                                    // (stale epoch) and discards the second (correct epoch). The
                                    // generation check catches it regardless of transport state.
                                    if (thisGen_1 !== v2Generation) {
                                        (0, debug_js_1.logForDebugging)("[bridge:repl] CCR v2: discarding stale handshake gen=".concat(thisGen_1, " current=").concat(v2Generation));
                                        t.close();
                                        return;
                                    }
                                    wireTransport(t);
                                }, function (err) {
                                    (0, debug_js_1.logForDebugging)("[bridge:repl] CCR v2: createV2ReplTransport failed: ".concat((0, errors_js_1.errorMessage)(err)), { level: 'error' });
                                    (0, index_js_1.logEvent)('tengu_bridge_repl_ccr_v2_init_failed', {});
                                    // If a newer attempt is in flight or already succeeded, don't
                                    // touch its work item — our failure is irrelevant.
                                    if (thisGen_1 !== v2Generation)
                                        return;
                                    // Release the work item so the server re-dispatches immediately
                                    // instead of waiting for its own timeout. currentWorkId was set
                                    // above; without this, the session looks stuck to the user.
                                    if (currentWorkId) {
                                        void api
                                            .stopWork(environmentId, currentWorkId, false)
                                            .catch(function (e) {
                                            (0, debug_js_1.logForDebugging)("[bridge:repl] stopWork after v2 init failure: ".concat((0, errors_js_1.errorMessage)(e)));
                                        });
                                        currentWorkId = null;
                                        currentIngressToken = null;
                                    }
                                    wakePollLoop();
                                });
                            }
                            else {
                                // v1: HybridTransport (WS reads + POST writes to Session-Ingress).
                                // autoReconnect is true (default) — when the WS dies, the transport
                                // reconnects automatically with exponential backoff. POST writes
                                // continue during reconnection (they use getSessionIngressAuthToken()
                                // independently of WS state). The poll loop remains as a secondary
                                // fallback if the reconnect budget is exhausted (10 min).
                                //
                                // Auth: uses OAuth tokens directly instead of the JWT from the work
                                // secret. refreshHeaders picks up the latest OAuth token on each
                                // WS reconnect attempt.
                                var wsUrl = (0, workSecret_js_1.buildSdkUrl)(sessionIngressUrl, workSessionId);
                                (0, debug_js_1.logForDebugging)("[bridge:repl] Ingress URL: ".concat(wsUrl));
                                (0, debug_js_1.logForDebugging)("[bridge:repl] Creating HybridTransport: session=".concat(workSessionId));
                                // v1OauthToken was validated non-null above (we'd have returned early).
                                var oauthToken_1 = v1OauthToken !== null && v1OauthToken !== void 0 ? v1OauthToken : '';
                                wireTransport((0, replBridgeTransport_js_1.createV1ReplTransport)(new HybridTransport_js_1.HybridTransport(new URL(wsUrl), {
                                    Authorization: "Bearer ".concat(oauthToken_1),
                                    'anthropic-version': '2023-06-01',
                                }, workSessionId, function () {
                                    var _a;
                                    return ({
                                        Authorization: "Bearer ".concat((_a = getOAuthToken()) !== null && _a !== void 0 ? _a : oauthToken_1),
                                        'anthropic-version': '2023-06-01',
                                    });
                                }, 
                                // Cap retries so a persistently-failing session-ingress can't
                                // pin the uploader drain loop for the lifetime of the bridge.
                                // 50 attempts ≈ 20 min (15s POST timeout + 8s backoff + jitter
                                // per cycle at steady state). Bridge-only — 1P keeps indefinite.
                                {
                                    maxConsecutiveFailures: 50,
                                    isBridge: true,
                                    onBatchDropped: function () {
                                        onStateChange === null || onStateChange === void 0 ? void 0 : onStateChange('reconnecting', 'Lost sync with Remote Control — events could not be delivered');
                                        // SI has been down ~20 min. Wake the poll loop so that when
                                        // SI recovers, next poll → onWorkReceived → fresh transport
                                        // → initial flush succeeds → onStateChange('connected') at
                                        // ~line 1420. Without this, state stays 'reconnecting' even
                                        // after SI recovers — daemon.ts:437 denies all permissions,
                                        // useReplBridge.ts:311 keeps replBridgeSessionActive=false.
                                        // If the env was archived during the outage, poll 404 →
                                        // onEnvironmentLost recovery path handles it.
                                        wakePollLoop();
                                    },
                                })));
                            }
                        },
                    };
                    void startWorkPollLoop(pollOpts);
                    pointerRefreshTimer = perpetual
                        ? setInterval(function () {
                            // doReconnect() reassigns currentSessionId/environmentId non-
                            // atomically (env at ~:634, session at ~:719, awaits in between).
                            // If this timer fires in that window, its fire-and-forget write can
                            // race with (and overwrite) doReconnect's own pointer write at ~:740,
                            // leaving the pointer at the now-archived old session. doReconnect
                            // writes the pointer itself, so skipping here is free.
                            if (reconnectPromise)
                                return;
                            void writeBridgePointer(dir, {
                                sessionId: currentSessionId,
                                environmentId: environmentId,
                                source: 'repl',
                            });
                        }, 60 * 60000)
                        : null;
                    (_m = pointerRefreshTimer === null || pointerRefreshTimer === void 0 ? void 0 : pointerRefreshTimer.unref) === null || _m === void 0 ? void 0 : _m.call(pointerRefreshTimer);
                    keepAliveIntervalMs = getPollIntervalConfig().session_keepalive_interval_v2_ms;
                    keepAliveTimer = keepAliveIntervalMs > 0
                        ? setInterval(function () {
                            if (!transport)
                                return;
                            (0, debug_js_1.logForDebugging)('[bridge:repl] keep_alive sent');
                            void transport.write({ type: 'keep_alive' }).catch(function (err) {
                                (0, debug_js_1.logForDebugging)("[bridge:repl] keep_alive write failed: ".concat((0, errors_js_1.errorMessage)(err)));
                            });
                        }, keepAliveIntervalMs)
                        : null;
                    (_o = keepAliveTimer === null || keepAliveTimer === void 0 ? void 0 : keepAliveTimer.unref) === null || _o === void 0 ? void 0 : _o.call(keepAliveTimer);
                    teardownStarted = false;
                    doTeardownImpl = function () { return __awaiter(_this, void 0, void 0, function () {
                        var teardownStart, finalSeq, teardownTransport, stopWorkP;
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    if (teardownStarted) {
                                        (0, debug_js_1.logForDebugging)("[bridge:repl] Teardown already in progress, skipping duplicate call env=".concat(environmentId, " session=").concat(currentSessionId));
                                        return [2 /*return*/];
                                    }
                                    teardownStarted = true;
                                    teardownStart = Date.now();
                                    (0, debug_js_1.logForDebugging)("[bridge:repl] Teardown starting: env=".concat(environmentId, " session=").concat(currentSessionId, " workId=").concat(currentWorkId !== null && currentWorkId !== void 0 ? currentWorkId : 'none', " transportState=").concat((_a = transport === null || transport === void 0 ? void 0 : transport.getStateLabel()) !== null && _a !== void 0 ? _a : 'null'));
                                    if (pointerRefreshTimer !== null) {
                                        clearInterval(pointerRefreshTimer);
                                    }
                                    if (keepAliveTimer !== null) {
                                        clearInterval(keepAliveTimer);
                                    }
                                    if (sigusr2Handler) {
                                        process.off('SIGUSR2', sigusr2Handler);
                                    }
                                    if (process.env.USER_TYPE === 'ant') {
                                        (0, bridgeDebug_js_1.clearBridgeDebugHandle)();
                                        debugFireClose = null;
                                    }
                                    pollController.abort();
                                    (0, debug_js_1.logForDebugging)('[bridge:repl] Teardown: poll loop aborted');
                                    // Capture the live transport's seq BEFORE close() — close() is sync
                                    // (just aborts the SSE fetch) and does NOT invoke onClose, so the
                                    // setOnClose capture path never runs for explicit teardown.
                                    // Without this, getSSESequenceNum() after teardown returns the stale
                                    // lastTransportSequenceNum (captured at the last transport swap), and
                                    // daemon callers persisting that value lose all events since then.
                                    if (transport) {
                                        finalSeq = transport.getLastSequenceNum();
                                        if (finalSeq > lastTransportSequenceNum) {
                                            lastTransportSequenceNum = finalSeq;
                                        }
                                    }
                                    if (!perpetual) return [3 /*break*/, 2];
                                    // Perpetual teardown is LOCAL-ONLY — do not send result, do not call
                                    // stopWork, do not close the transport. All of those signal the
                                    // server (and any mobile/attach subscribers) that the session is
                                    // ending. Instead: stop polling, let the socket die with the
                                    // process; the backend times the work-item lease back to pending on
                                    // its own (TTL 300s). Next daemon start reads the pointer and
                                    // reconnectSession re-queues work.
                                    transport = null;
                                    flushGate.drop();
                                    // Refresh the pointer mtime so that sessions lasting longer than
                                    // BRIDGE_POINTER_TTL_MS (4h) don't appear stale on next start.
                                    return [4 /*yield*/, writeBridgePointer(dir, {
                                            sessionId: currentSessionId,
                                            environmentId: environmentId,
                                            source: 'repl',
                                        })];
                                case 1:
                                    // Refresh the pointer mtime so that sessions lasting longer than
                                    // BRIDGE_POINTER_TTL_MS (4h) don't appear stale on next start.
                                    _b.sent();
                                    (0, debug_js_1.logForDebugging)("[bridge:repl] Teardown (perpetual): leaving env=".concat(environmentId, " session=").concat(currentSessionId, " alive on server, duration=").concat(Date.now() - teardownStart, "ms"));
                                    return [2 /*return*/];
                                case 2:
                                    teardownTransport = transport;
                                    transport = null;
                                    flushGate.drop();
                                    if (teardownTransport) {
                                        void teardownTransport.write((0, bridgeMessaging_js_1.makeResultMessage)(currentSessionId));
                                    }
                                    stopWorkP = currentWorkId
                                        ? api
                                            .stopWork(environmentId, currentWorkId, true)
                                            .then(function () {
                                            (0, debug_js_1.logForDebugging)('[bridge:repl] Teardown: stopWork completed');
                                        })
                                            .catch(function (err) {
                                            (0, debug_js_1.logForDebugging)("[bridge:repl] Teardown stopWork failed: ".concat((0, errors_js_1.errorMessage)(err)));
                                        })
                                        : Promise.resolve();
                                    // Run stopWork and archiveSession in parallel. gracefulShutdown.ts:407
                                    // races runCleanupFunctions() against 2s (NOT the 5s outer failsafe),
                                    // so archive is capped at 1.5s at the injection site to stay under budget.
                                    // archiveSession is contractually no-throw; the injected implementations
                                    // log their own success/failure internally.
                                    return [4 /*yield*/, Promise.all([stopWorkP, archiveSession(currentSessionId)])];
                                case 3:
                                    // Run stopWork and archiveSession in parallel. gracefulShutdown.ts:407
                                    // races runCleanupFunctions() against 2s (NOT the 5s outer failsafe),
                                    // so archive is capped at 1.5s at the injection site to stay under budget.
                                    // archiveSession is contractually no-throw; the injected implementations
                                    // log their own success/failure internally.
                                    _b.sent();
                                    teardownTransport === null || teardownTransport === void 0 ? void 0 : teardownTransport.close();
                                    (0, debug_js_1.logForDebugging)('[bridge:repl] Teardown: transport closed');
                                    return [4 /*yield*/, api.deregisterEnvironment(environmentId).catch(function (err) {
                                            (0, debug_js_1.logForDebugging)("[bridge:repl] Teardown deregister failed: ".concat((0, errors_js_1.errorMessage)(err)));
                                        })
                                        // Clear the crash-recovery pointer — explicit disconnect or clean REPL
                                        // exit means the user is done with this session. Crash/kill-9 never
                                        // reaches this line, leaving the pointer for next-launch recovery.
                                    ];
                                case 4:
                                    _b.sent();
                                    // Clear the crash-recovery pointer — explicit disconnect or clean REPL
                                    // exit means the user is done with this session. Crash/kill-9 never
                                    // reaches this line, leaving the pointer for next-launch recovery.
                                    return [4 /*yield*/, clearBridgePointer(dir)];
                                case 5:
                                    // Clear the crash-recovery pointer — explicit disconnect or clean REPL
                                    // exit means the user is done with this session. Crash/kill-9 never
                                    // reaches this line, leaving the pointer for next-launch recovery.
                                    _b.sent();
                                    (0, debug_js_1.logForDebugging)("[bridge:repl] Teardown complete: env=".concat(environmentId, " duration=").concat(Date.now() - teardownStart, "ms"));
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    unregister = (0, cleanupRegistry_js_1.registerCleanup)(function () { return doTeardownImpl === null || doTeardownImpl === void 0 ? void 0 : doTeardownImpl(); });
                    (0, debug_js_1.logForDebugging)("[bridge:repl] Ready: env=".concat(environmentId, " session=").concat(currentSessionId));
                    onStateChange === null || onStateChange === void 0 ? void 0 : onStateChange('ready');
                    return [2 /*return*/, {
                            get bridgeSessionId() {
                                return currentSessionId;
                            },
                            get environmentId() {
                                return environmentId;
                            },
                            getSSESequenceNum: function () {
                                var _a;
                                // lastTransportSequenceNum only updates when a transport is CLOSED
                                // (captured at swap/onClose). During normal operation the CURRENT
                                // transport's live seq isn't reflected there. Merge both so callers
                                // (e.g. daemon persistState()) get the actual high-water mark.
                                var live = (_a = transport === null || transport === void 0 ? void 0 : transport.getLastSequenceNum()) !== null && _a !== void 0 ? _a : 0;
                                return Math.max(lastTransportSequenceNum, live);
                            },
                            sessionIngressUrl: sessionIngressUrl,
                            writeMessages: function (messages) {
                                // Filter to user/assistant messages that haven't already been sent.
                                // Two layers of dedup:
                                //  - initialMessageUUIDs: messages sent as session creation events
                                //  - recentPostedUUIDs: messages recently sent via POST
                                var filtered = messages.filter(function (m) {
                                    return (0, bridgeMessaging_js_1.isEligibleBridgeMessage)(m) &&
                                        !initialMessageUUIDs.has(m.uuid) &&
                                        !recentPostedUUIDs.has(m.uuid);
                                });
                                if (filtered.length === 0)
                                    return;
                                // Fire onUserMessage for title derivation. Scan before the flushGate
                                // check — prompts are title-worthy even if they queue behind the
                                // initial history flush. Keeps calling on every title-worthy message
                                // until the callback returns true; the caller owns the policy.
                                if (!userMessageCallbackDone) {
                                    for (var _i = 0, filtered_1 = filtered; _i < filtered_1.length; _i++) {
                                        var m = filtered_1[_i];
                                        var text = (0, bridgeMessaging_js_1.extractTitleText)(m);
                                        if (text !== undefined && (onUserMessage === null || onUserMessage === void 0 ? void 0 : onUserMessage(text, currentSessionId))) {
                                            userMessageCallbackDone = true;
                                            break;
                                        }
                                    }
                                }
                                // Queue messages while the initial flush is in progress to prevent
                                // them from arriving at the server interleaved with history.
                                if (flushGate.enqueue.apply(flushGate, filtered)) {
                                    (0, debug_js_1.logForDebugging)("[bridge:repl] Queued ".concat(filtered.length, " message(s) during initial flush"));
                                    return;
                                }
                                if (!transport) {
                                    var types = filtered.map(function (m) { return m.type; }).join(',');
                                    (0, debug_js_1.logForDebugging)("[bridge:repl] Transport not configured, dropping ".concat(filtered.length, " message(s) [").concat(types, "] for session=").concat(currentSessionId), { level: 'warn' });
                                    return;
                                }
                                // Track in the bounded ring buffer for echo filtering and dedup.
                                for (var _a = 0, filtered_2 = filtered; _a < filtered_2.length; _a++) {
                                    var msg = filtered_2[_a];
                                    recentPostedUUIDs.add(msg.uuid);
                                }
                                (0, debug_js_1.logForDebugging)("[bridge:repl] Sending ".concat(filtered.length, " message(s) via transport"));
                                // Convert to SDK format and send via HTTP POST (HybridTransport).
                                // The web UI receives them via the subscribe WebSocket.
                                var sdkMessages = toSDKMessages(filtered);
                                var events = sdkMessages.map(function (sdkMsg) { return (__assign(__assign({}, sdkMsg), { session_id: currentSessionId })); });
                                void transport.writeBatch(events);
                            },
                            writeSdkMessages: function (messages) {
                                // Daemon path: query() already yields SDKMessage, skip conversion.
                                // Still run echo dedup (server bounces writes back on the WS).
                                // No initialMessageUUIDs filter — daemon has no initial messages.
                                // No flushGate — daemon never starts it (no initial flush).
                                var filtered = messages.filter(function (m) { return !m.uuid || !recentPostedUUIDs.has(m.uuid); });
                                if (filtered.length === 0)
                                    return;
                                if (!transport) {
                                    (0, debug_js_1.logForDebugging)("[bridge:repl] Transport not configured, dropping ".concat(filtered.length, " SDK message(s) for session=").concat(currentSessionId), { level: 'warn' });
                                    return;
                                }
                                for (var _i = 0, filtered_3 = filtered; _i < filtered_3.length; _i++) {
                                    var msg = filtered_3[_i];
                                    if (msg.uuid)
                                        recentPostedUUIDs.add(msg.uuid);
                                }
                                var events = filtered.map(function (m) { return (__assign(__assign({}, m), { session_id: currentSessionId })); });
                                void transport.writeBatch(events);
                            },
                            sendControlRequest: function (request) {
                                if (!transport) {
                                    (0, debug_js_1.logForDebugging)('[bridge:repl] Transport not configured, skipping control_request');
                                    return;
                                }
                                var event = __assign(__assign({}, request), { session_id: currentSessionId });
                                void transport.write(event);
                                (0, debug_js_1.logForDebugging)("[bridge:repl] Sent control_request request_id=".concat(request.request_id));
                            },
                            sendControlResponse: function (response) {
                                if (!transport) {
                                    (0, debug_js_1.logForDebugging)('[bridge:repl] Transport not configured, skipping control_response');
                                    return;
                                }
                                var event = __assign(__assign({}, response), { session_id: currentSessionId });
                                void transport.write(event);
                                (0, debug_js_1.logForDebugging)('[bridge:repl] Sent control_response');
                            },
                            sendControlCancelRequest: function (requestId) {
                                if (!transport) {
                                    (0, debug_js_1.logForDebugging)('[bridge:repl] Transport not configured, skipping control_cancel_request');
                                    return;
                                }
                                var event = {
                                    type: 'control_cancel_request',
                                    request_id: requestId,
                                    session_id: currentSessionId,
                                };
                                void transport.write(event);
                                (0, debug_js_1.logForDebugging)("[bridge:repl] Sent control_cancel_request request_id=".concat(requestId));
                            },
                            sendResult: function () {
                                if (!transport) {
                                    (0, debug_js_1.logForDebugging)("[bridge:repl] sendResult: skipping, transport not configured session=".concat(currentSessionId));
                                    return;
                                }
                                void transport.write((0, bridgeMessaging_js_1.makeResultMessage)(currentSessionId));
                                (0, debug_js_1.logForDebugging)("[bridge:repl] Sent result for session=".concat(currentSessionId));
                            },
                            teardown: function () {
                                return __awaiter(this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                unregister();
                                                return [4 /*yield*/, (doTeardownImpl === null || doTeardownImpl === void 0 ? void 0 : doTeardownImpl())];
                                            case 1:
                                                _a.sent();
                                                (0, debug_js_1.logForDebugging)('[bridge:repl] Torn down');
                                                (0, index_js_1.logEvent)('tengu_bridge_repl_teardown', {});
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
/**
 * Persistent poll loop for work items. Runs in the background for the
 * lifetime of the bridge connection.
 *
 * When a work item arrives, acknowledges it and calls onWorkReceived
 * with the session ID and ingress token (which connects the ingress
 * WebSocket). Then continues polling — the server will dispatch a new
 * work item if the ingress WebSocket drops, allowing automatic
 * reconnection without tearing down the bridge.
 */
function startWorkPollLoop(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var MAX_ENVIRONMENT_RECREATIONS, consecutiveErrors, firstErrorTime, lastPollErrorTime, environmentRecreations, suspensionDetected, _c, envId, envSecret, pollConfig, work, skipAtCapacityOnce, atCapMs, pollDeadline, needsBackoff, hbCycles, hbConfig, info, cap, err_4, exitReason, sleepMs, cap, sleepStart, overrun, secret, err_5, err_6, workSessionId, err_7, currentEnvId, newCreds, isExpiry, isSuppressible, now, elapsed, httpStatus, errMsg, wsLabel, backoff, info, _d;
        var _e, _f;
        var api = _b.api, getCredentials = _b.getCredentials, signal = _b.signal, onStateChange = _b.onStateChange, onWorkReceived = _b.onWorkReceived, onEnvironmentLost = _b.onEnvironmentLost, getWsState = _b.getWsState, isAtCapacity = _b.isAtCapacity, capacitySignal = _b.capacitySignal, onFatalError = _b.onFatalError, _g = _b.getPollIntervalConfig, getPollIntervalConfig = _g === void 0 ? function () { return pollConfigDefaults_js_1.DEFAULT_POLL_CONFIG; } : _g, getHeartbeatInfo = _b.getHeartbeatInfo, onHeartbeatFatal = _b.onHeartbeatFatal;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    MAX_ENVIRONMENT_RECREATIONS = 3;
                    (0, debug_js_1.logForDebugging)("[bridge:repl] Starting work poll loop for env=".concat(getCredentials().environmentId));
                    consecutiveErrors = 0;
                    firstErrorTime = null;
                    lastPollErrorTime = null;
                    environmentRecreations = 0;
                    suspensionDetected = false;
                    _h.label = 1;
                case 1:
                    if (!!signal.aborted) return [3 /*break*/, 35];
                    _c = getCredentials(), envId = _c.environmentId, envSecret = _c.environmentSecret;
                    pollConfig = getPollIntervalConfig();
                    _h.label = 2;
                case 2:
                    _h.trys.push([2, 26, , 34]);
                    return [4 /*yield*/, api.pollForWork(envId, envSecret, signal, pollConfig.reclaim_older_than_ms)
                        // A successful poll proves the env is genuinely healthy — reset the
                        // env-loss counter so events hours apart each start fresh. Outside
                        // the state-change guard below because onEnvLost's success path
                        // already emits 'ready'; emitting again here would be a duplicate.
                        // (onEnvLost returning creds does NOT reset this — that would break
                        // oscillation protection when the new env immediately dies.)
                    ];
                case 3:
                    work = _h.sent();
                    // A successful poll proves the env is genuinely healthy — reset the
                    // env-loss counter so events hours apart each start fresh. Outside
                    // the state-change guard below because onEnvLost's success path
                    // already emits 'ready'; emitting again here would be a duplicate.
                    // (onEnvLost returning creds does NOT reset this — that would break
                    // oscillation protection when the new env immediately dies.)
                    environmentRecreations = 0;
                    // Reset error tracking on successful poll
                    if (consecutiveErrors > 0) {
                        (0, debug_js_1.logForDebugging)("[bridge:repl] Poll recovered after ".concat(consecutiveErrors, " consecutive error(s)"));
                        consecutiveErrors = 0;
                        firstErrorTime = null;
                        lastPollErrorTime = null;
                        onStateChange === null || onStateChange === void 0 ? void 0 : onStateChange('ready');
                    }
                    if (!!work) return [3 /*break*/, 17];
                    skipAtCapacityOnce = suspensionDetected;
                    suspensionDetected = false;
                    if (!((isAtCapacity === null || isAtCapacity === void 0 ? void 0 : isAtCapacity()) && capacitySignal && !skipAtCapacityOnce)) return [3 /*break*/, 14];
                    atCapMs = pollConfig.poll_interval_ms_at_capacity;
                    if (!(pollConfig.non_exclusive_heartbeat_interval_ms > 0 &&
                        getHeartbeatInfo)) return [3 /*break*/, 11];
                    (0, index_js_1.logEvent)('tengu_bridge_heartbeat_mode_entered', {
                        heartbeat_interval_ms: pollConfig.non_exclusive_heartbeat_interval_ms,
                    });
                    pollDeadline = atCapMs > 0 ? Date.now() + atCapMs : null;
                    needsBackoff = false;
                    hbCycles = 0;
                    _h.label = 4;
                case 4:
                    if (!(!signal.aborted &&
                        isAtCapacity() &&
                        (pollDeadline === null || Date.now() < pollDeadline))) return [3 /*break*/, 10];
                    hbConfig = getPollIntervalConfig();
                    if (hbConfig.non_exclusive_heartbeat_interval_ms <= 0)
                        return [3 /*break*/, 10];
                    info = getHeartbeatInfo();
                    if (!info)
                        return [3 /*break*/, 10];
                    cap = capacitySignal();
                    _h.label = 5;
                case 5:
                    _h.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, api.heartbeatWork(info.environmentId, info.workId, info.sessionToken)];
                case 6:
                    _h.sent();
                    return [3 /*break*/, 8];
                case 7:
                    err_4 = _h.sent();
                    (0, debug_js_1.logForDebugging)("[bridge:repl:heartbeat] Failed: ".concat((0, errors_js_1.errorMessage)(err_4)));
                    if (err_4 instanceof bridgeApi_js_1.BridgeFatalError) {
                        cap.cleanup();
                        (0, index_js_1.logEvent)('tengu_bridge_heartbeat_error', {
                            status: err_4.status,
                            error_type: (err_4.status === 401 || err_4.status === 403
                                ? 'auth_failed'
                                : 'fatal'),
                        });
                        // JWT expired (401/403) or work item gone (404/410).
                        // Either way the current transport is dead — SSE
                        // reconnects and CCR writes will fail on the same
                        // stale token. If the caller gave us a recovery hook,
                        // tear down work state and skip backoff: isAtCapacity()
                        // flips to false, next outer-loop iteration fast-polls
                        // for the server's re-dispatched work item. Without
                        // the hook, backoff to avoid tight poll+heartbeat loop.
                        if (onHeartbeatFatal) {
                            onHeartbeatFatal(err_4);
                            (0, debug_js_1.logForDebugging)("[bridge:repl:heartbeat] Fatal (status=".concat(err_4.status, "), work state cleared \u2014 fast-polling for re-dispatch"));
                        }
                        else {
                            needsBackoff = true;
                        }
                        return [3 /*break*/, 10];
                    }
                    return [3 /*break*/, 8];
                case 8:
                    hbCycles++;
                    return [4 /*yield*/, (0, sleep_js_1.sleep)(hbConfig.non_exclusive_heartbeat_interval_ms, cap.signal)];
                case 9:
                    _h.sent();
                    cap.cleanup();
                    return [3 /*break*/, 4];
                case 10:
                    exitReason = needsBackoff
                        ? 'error'
                        : signal.aborted
                            ? 'shutdown'
                            : !isAtCapacity()
                                ? 'capacity_changed'
                                : pollDeadline !== null && Date.now() >= pollDeadline
                                    ? 'poll_due'
                                    : 'config_disabled';
                    (0, index_js_1.logEvent)('tengu_bridge_heartbeat_mode_exited', {
                        reason: exitReason,
                        heartbeat_cycles: hbCycles,
                    });
                    // On auth_failed or fatal, backoff before polling to avoid a
                    // tight poll+heartbeat loop. Fall through to the shared sleep
                    // below — it's the same capacitySignal-wrapped sleep the legacy
                    // path uses, and both need the suspension-overrun check.
                    if (!needsBackoff) {
                        if (exitReason === 'poll_due') {
                            // bridgeApi throttles empty-poll logs (EMPTY_POLL_LOG_INTERVAL=100)
                            // so the once-per-10min poll_due poll is invisible at counter=2.
                            // Log it here so verification runs see both endpoints in the debug log.
                            (0, debug_js_1.logForDebugging)("[bridge:repl] Heartbeat poll_due after ".concat(hbCycles, " cycles \u2014 falling through to pollForWork"));
                        }
                        return [3 /*break*/, 1];
                    }
                    _h.label = 11;
                case 11:
                    sleepMs = atCapMs > 0
                        ? atCapMs
                        : pollConfig.non_exclusive_heartbeat_interval_ms;
                    if (!(sleepMs > 0)) return [3 /*break*/, 13];
                    cap = capacitySignal();
                    sleepStart = Date.now();
                    return [4 /*yield*/, (0, sleep_js_1.sleep)(sleepMs, cap.signal)];
                case 12:
                    _h.sent();
                    cap.cleanup();
                    overrun = Date.now() - sleepStart - sleepMs;
                    if (overrun > 60000) {
                        (0, debug_js_1.logForDebugging)("[bridge:repl] At-capacity sleep overran by ".concat(Math.round(overrun / 1000), "s \u2014 process suspension detected, forcing one fast-poll cycle"));
                        (0, index_js_1.logEvent)('tengu_bridge_repl_suspension_detected', {
                            overrun_ms: overrun,
                        });
                        suspensionDetected = true;
                    }
                    _h.label = 13;
                case 13: return [3 /*break*/, 16];
                case 14: return [4 /*yield*/, (0, sleep_js_1.sleep)(pollConfig.poll_interval_ms_not_at_capacity, signal)];
                case 15:
                    _h.sent();
                    _h.label = 16;
                case 16: return [3 /*break*/, 1];
                case 17:
                    secret = void 0;
                    _h.label = 18;
                case 18:
                    _h.trys.push([18, 19, , 21]);
                    secret = (0, workSecret_js_1.decodeWorkSecret)(work.secret);
                    return [3 /*break*/, 21];
                case 19:
                    err_5 = _h.sent();
                    (0, debug_js_1.logForDebugging)("[bridge:repl] Failed to decode work secret: ".concat((0, errors_js_1.errorMessage)(err_5)));
                    (0, index_js_1.logEvent)('tengu_bridge_repl_work_secret_failed', {});
                    // Can't ack (needs the JWT we failed to decode). stopWork uses OAuth.
                    // Prevents XAUTOCLAIM re-delivering this poisoned item every cycle.
                    return [4 /*yield*/, api.stopWork(envId, work.id, false).catch(function () { })];
                case 20:
                    // Can't ack (needs the JWT we failed to decode). stopWork uses OAuth.
                    // Prevents XAUTOCLAIM re-delivering this poisoned item every cycle.
                    _h.sent();
                    return [3 /*break*/, 1];
                case 21:
                    // Explicitly acknowledge to prevent redelivery. Non-fatal on failure:
                    // server re-delivers, and the onWorkReceived callback handles dedup.
                    (0, debug_js_1.logForDebugging)("[bridge:repl] Acknowledging workId=".concat(work.id));
                    _h.label = 22;
                case 22:
                    _h.trys.push([22, 24, , 25]);
                    return [4 /*yield*/, api.acknowledgeWork(envId, work.id, secret.session_ingress_token)];
                case 23:
                    _h.sent();
                    return [3 /*break*/, 25];
                case 24:
                    err_6 = _h.sent();
                    (0, debug_js_1.logForDebugging)("[bridge:repl] Acknowledge failed workId=".concat(work.id, ": ").concat((0, errors_js_1.errorMessage)(err_6)));
                    return [3 /*break*/, 25];
                case 25:
                    if (work.data.type === 'healthcheck') {
                        (0, debug_js_1.logForDebugging)('[bridge:repl] Healthcheck received');
                        return [3 /*break*/, 1];
                    }
                    if (work.data.type === 'session') {
                        workSessionId = work.data.id;
                        try {
                            (0, bridgeApi_js_2.validateBridgeId)(workSessionId, 'session_id');
                        }
                        catch (_j) {
                            (0, debug_js_1.logForDebugging)("[bridge:repl] Invalid session_id in work: ".concat(workSessionId));
                            return [3 /*break*/, 1];
                        }
                        onWorkReceived(workSessionId, secret.session_ingress_token, work.id, secret.use_code_sessions === true);
                        (0, debug_js_1.logForDebugging)('[bridge:repl] Work accepted, continuing poll loop');
                    }
                    return [3 /*break*/, 34];
                case 26:
                    err_7 = _h.sent();
                    if (signal.aborted)
                        return [3 /*break*/, 35];
                    if (!(err_7 instanceof bridgeApi_js_1.BridgeFatalError &&
                        err_7.status === 404 &&
                        onEnvironmentLost)) return [3 /*break*/, 28];
                    currentEnvId = getCredentials().environmentId;
                    if (envId !== currentEnvId) {
                        (0, debug_js_1.logForDebugging)("[bridge:repl] Stale poll error for old env=".concat(envId, ", current env=").concat(currentEnvId, " \u2014 skipping onEnvironmentLost"));
                        consecutiveErrors = 0;
                        firstErrorTime = null;
                        return [3 /*break*/, 1];
                    }
                    environmentRecreations++;
                    (0, debug_js_1.logForDebugging)("[bridge:repl] Environment deleted, attempting re-registration (attempt ".concat(environmentRecreations, "/").concat(MAX_ENVIRONMENT_RECREATIONS, ")"));
                    (0, index_js_1.logEvent)('tengu_bridge_repl_env_lost', {
                        attempt: environmentRecreations,
                    });
                    if (environmentRecreations > MAX_ENVIRONMENT_RECREATIONS) {
                        (0, debug_js_1.logForDebugging)("[bridge:repl] Environment re-registration limit reached (".concat(MAX_ENVIRONMENT_RECREATIONS, "), giving up"));
                        onStateChange === null || onStateChange === void 0 ? void 0 : onStateChange('failed', 'Environment deleted and re-registration limit reached');
                        onFatalError === null || onFatalError === void 0 ? void 0 : onFatalError();
                        return [3 /*break*/, 35];
                    }
                    onStateChange === null || onStateChange === void 0 ? void 0 : onStateChange('reconnecting', 'environment lost, recreating session');
                    return [4 /*yield*/, onEnvironmentLost()
                        // doReconnect() makes several sequential network calls (1-5s).
                        // If the user triggered teardown during that window, its internal
                        // abort checks return false — but we need to re-check here to
                        // avoid emitting a spurious 'failed' + onFatalError() during
                        // graceful shutdown.
                    ];
                case 27:
                    newCreds = _h.sent();
                    // doReconnect() makes several sequential network calls (1-5s).
                    // If the user triggered teardown during that window, its internal
                    // abort checks return false — but we need to re-check here to
                    // avoid emitting a spurious 'failed' + onFatalError() during
                    // graceful shutdown.
                    if (signal.aborted)
                        return [3 /*break*/, 35];
                    if (newCreds) {
                        // Credentials are updated in the outer scope via
                        // reconnectEnvironmentWithSession — getCredentials() will
                        // return the fresh values on the next poll iteration.
                        // Do NOT reset environmentRecreations here — onEnvLost returning
                        // creds only proves we tried to fix it, not that the env is
                        // healthy. A successful poll (above) is the reset point; if the
                        // new env immediately dies again we still want the limit to fire.
                        consecutiveErrors = 0;
                        firstErrorTime = null;
                        onStateChange === null || onStateChange === void 0 ? void 0 : onStateChange('ready');
                        (0, debug_js_1.logForDebugging)("[bridge:repl] Re-registered environment: ".concat(newCreds.environmentId));
                        return [3 /*break*/, 1];
                    }
                    onStateChange === null || onStateChange === void 0 ? void 0 : onStateChange('failed', 'Environment deleted and re-registration failed');
                    onFatalError === null || onFatalError === void 0 ? void 0 : onFatalError();
                    return [3 /*break*/, 35];
                case 28:
                    // Fatal errors (401/403/404/410) — no point retrying
                    if (err_7 instanceof bridgeApi_js_1.BridgeFatalError) {
                        isExpiry = (0, bridgeApi_js_1.isExpiredErrorType)(err_7.errorType);
                        isSuppressible = (0, bridgeApi_js_1.isSuppressible403)(err_7);
                        (0, debug_js_1.logForDebugging)("[bridge:repl] Fatal poll error: ".concat(err_7.message, " (status=").concat(err_7.status, ", type=").concat((_e = err_7.errorType) !== null && _e !== void 0 ? _e : 'unknown', ")").concat(isSuppressible ? ' (suppressed)' : ''));
                        (0, index_js_1.logEvent)('tengu_bridge_repl_fatal_error', {
                            status: err_7.status,
                            error_type: err_7.errorType,
                        });
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)(isExpiry ? 'info' : 'error', 'bridge_repl_fatal_error', { status: err_7.status, error_type: err_7.errorType });
                        // Cosmetic 403 errors (e.g., external_poll_sessions scope,
                        // environments:manage permission) — suppress user-visible error
                        // but always trigger teardown so cleanup runs.
                        if (!isSuppressible) {
                            onStateChange === null || onStateChange === void 0 ? void 0 : onStateChange('failed', isExpiry
                                ? 'session expired · /remote-control to reconnect'
                                : err_7.message);
                        }
                        // Always trigger teardown — matches bridgeMain.ts where fatalExit=true
                        // is unconditional and post-loop cleanup always runs.
                        onFatalError === null || onFatalError === void 0 ? void 0 : onFatalError();
                        return [3 /*break*/, 35];
                    }
                    now = Date.now();
                    // Detect system sleep/wake: if the gap since the last poll error
                    // greatly exceeds the max backoff delay, the machine likely slept.
                    // Reset error tracking so we retry with a fresh budget instead of
                    // immediately giving up.
                    if (lastPollErrorTime !== null &&
                        now - lastPollErrorTime > POLL_ERROR_MAX_DELAY_MS * 2) {
                        (0, debug_js_1.logForDebugging)("[bridge:repl] Detected system sleep (".concat(Math.round((now - lastPollErrorTime) / 1000), "s gap), resetting poll error budget"));
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'bridge_repl_poll_sleep_detected', {
                            gapMs: now - lastPollErrorTime,
                        });
                        consecutiveErrors = 0;
                        firstErrorTime = null;
                    }
                    lastPollErrorTime = now;
                    consecutiveErrors++;
                    if (firstErrorTime === null) {
                        firstErrorTime = now;
                    }
                    elapsed = now - firstErrorTime;
                    httpStatus = (0, debugUtils_js_1.extractHttpStatus)(err_7);
                    errMsg = (0, debugUtils_js_1.describeAxiosError)(err_7);
                    wsLabel = (_f = getWsState === null || getWsState === void 0 ? void 0 : getWsState()) !== null && _f !== void 0 ? _f : 'unknown';
                    (0, debug_js_1.logForDebugging)("[bridge:repl] Poll error (attempt ".concat(consecutiveErrors, ", elapsed ").concat(Math.round(elapsed / 1000), "s, ws=").concat(wsLabel, "): ").concat(errMsg));
                    (0, index_js_1.logEvent)('tengu_bridge_repl_poll_error', {
                        status: httpStatus,
                        consecutiveErrors: consecutiveErrors,
                        elapsedMs: elapsed,
                    });
                    // Only transition to 'reconnecting' on the first error — stay
                    // there until a successful poll (avoid flickering the UI state).
                    if (consecutiveErrors === 1) {
                        onStateChange === null || onStateChange === void 0 ? void 0 : onStateChange('reconnecting', errMsg);
                    }
                    // Give up after continuous failures
                    if (elapsed >= POLL_ERROR_GIVE_UP_MS) {
                        (0, debug_js_1.logForDebugging)("[bridge:repl] Poll failures exceeded ".concat(POLL_ERROR_GIVE_UP_MS / 1000, "s (").concat(consecutiveErrors, " errors), giving up"));
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'bridge_repl_poll_give_up');
                        (0, index_js_1.logEvent)('tengu_bridge_repl_poll_give_up', {
                            consecutiveErrors: consecutiveErrors,
                            elapsedMs: elapsed,
                            lastStatus: httpStatus,
                        });
                        onStateChange === null || onStateChange === void 0 ? void 0 : onStateChange('failed', 'connection to server lost');
                        return [3 /*break*/, 35];
                    }
                    backoff = Math.min(POLL_ERROR_INITIAL_DELAY_MS * Math.pow(2, (consecutiveErrors - 1)), POLL_ERROR_MAX_DELAY_MS);
                    if (!(getPollIntervalConfig().non_exclusive_heartbeat_interval_ms > 0)) return [3 /*break*/, 32];
                    info = getHeartbeatInfo === null || getHeartbeatInfo === void 0 ? void 0 : getHeartbeatInfo();
                    if (!info) return [3 /*break*/, 32];
                    _h.label = 29;
                case 29:
                    _h.trys.push([29, 31, , 32]);
                    return [4 /*yield*/, api.heartbeatWork(info.environmentId, info.workId, info.sessionToken)];
                case 30:
                    _h.sent();
                    return [3 /*break*/, 32];
                case 31:
                    _d = _h.sent();
                    return [3 /*break*/, 32];
                case 32: return [4 /*yield*/, (0, sleep_js_1.sleep)(backoff, signal)];
                case 33:
                    _h.sent();
                    return [3 /*break*/, 34];
                case 34: return [3 /*break*/, 1];
                case 35:
                    (0, debug_js_1.logForDebugging)("[bridge:repl] Work poll loop ended (aborted=".concat(signal.aborted, ") env=").concat(getCredentials().environmentId));
                    return [2 /*return*/];
            }
        });
    });
}
