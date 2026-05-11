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
exports.BridgeHeadlessPermanentError = void 0;
exports.runBridgeLoop = runBridgeLoop;
exports.isConnectionError = isConnectionError;
exports.isServerError = isServerError;
exports.parseArgs = parseArgs;
exports.bridgeMain = bridgeMain;
exports.runBridgeHeadless = runBridgeHeadless;
var bun_bundle_1 = require("bun:bundle");
var crypto_1 = require("crypto");
var os_1 = require("os");
var path_1 = require("path");
var product_js_1 = require("../constants/product.js");
var datadog_js_1 = require("../services/analytics/datadog.js");
var firstPartyEventLogger_js_1 = require("../services/analytics/firstPartyEventLogger.js");
var growthbook_js_1 = require("../services/analytics/growthbook.js");
var index_js_1 = require("../services/analytics/index.js");
var bundledMode_js_1 = require("../utils/bundledMode.js");
var debug_js_1 = require("../utils/debug.js");
var diagLogs_js_1 = require("../utils/diagLogs.js");
var envUtils_js_1 = require("../utils/envUtils.js");
var errors_js_1 = require("../utils/errors.js");
var format_js_1 = require("../utils/format.js");
var log_js_1 = require("../utils/log.js");
var sleep_js_1 = require("../utils/sleep.js");
var worktree_js_1 = require("../utils/worktree.js");
var bridgeApi_js_1 = require("./bridgeApi.js");
var bridgeStatusUtil_js_1 = require("./bridgeStatusUtil.js");
var bridgeUI_js_1 = require("./bridgeUI.js");
var capacityWake_js_1 = require("./capacityWake.js");
var debugUtils_js_1 = require("./debugUtils.js");
var jwtUtils_js_1 = require("./jwtUtils.js");
var pollConfig_js_1 = require("./pollConfig.js");
var sessionIdCompat_js_1 = require("./sessionIdCompat.js");
var sessionRunner_js_1 = require("./sessionRunner.js");
var trustedDevice_js_1 = require("./trustedDevice.js");
var types_js_1 = require("./types.js");
var workSecret_js_1 = require("./workSecret.js");
var DEFAULT_BACKOFF = {
    connInitialMs: 2000,
    connCapMs: 120000, // 2 minutes
    connGiveUpMs: 600000, // 10 minutes
    generalInitialMs: 500,
    generalCapMs: 30000,
    generalGiveUpMs: 600000, // 10 minutes
};
/** Status update interval for the live display (ms). */
var STATUS_UPDATE_INTERVAL_MS = 1000;
var SPAWN_SESSIONS_DEFAULT = 32;
/**
 * GrowthBook gate for multi-session spawn modes (--spawn / --capacity / --create-session-in-dir).
 * Sibling of tengu_ccr_bridge_multi_environment (multiple envs per host:dir) —
 * this one enables multiple sessions per environment.
 * Rollout staged via targeting rules: ants first, then gradual external.
 *
 * Uses the blocking gate check so a stale disk-cache miss doesn't unfairly
 * deny access. The fast path (cache has true) is still instant; only the
 * cold-start path awaits the server fetch, and that fetch also seeds the
 * disk cache for next time.
 */
function isMultiSessionSpawnEnabled() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, (0, growthbook_js_1.checkGate_CACHED_OR_BLOCKING)('tengu_ccr_bridge_multi_session')];
        });
    });
}
/**
 * Returns the threshold for detecting system sleep/wake in the poll loop.
 * Must exceed the max backoff cap — otherwise normal backoff delays trigger
 * false sleep detection (resetting the error budget indefinitely). Using
 * 2× the connection backoff cap, matching the pattern in WebSocketTransport
 * and replBridge.
 */
function pollSleepDetectionThresholdMs(backoff) {
    return backoff.connCapMs * 2;
}
/**
 * Returns the args that must precede CLI flags when spawning a child claude
 * process. In compiled binaries, process.execPath is the claude binary itself
 * and args go directly to it. In npm installs (node running cli.js),
 * process.execPath is the node runtime — the child spawn must pass the script
 * path as the first arg, otherwise node interprets --sdk-url as a node option
 * and exits with "bad option: --sdk-url". See anthropics/claude-code#28334.
 */
function spawnScriptArgs() {
    if ((0, bundledMode_js_1.isInBundledMode)() || !process.argv[1]) {
        return [];
    }
    return [process.argv[1]];
}
/** Attempt to spawn a session; returns error string if spawn throws. */
function safeSpawn(spawner, opts, dir) {
    try {
        return spawner.spawn(opts, dir);
    }
    catch (err) {
        var errMsg = (0, errors_js_1.errorMessage)(err);
        (0, log_js_1.logError)(new Error("Session spawn failed: ".concat(errMsg)));
        return errMsg;
    }
}
function runBridgeLoop(config_1, environmentId_1, environmentSecret_1, api_1, spawner_1, logger_1, signal_1) {
    return __awaiter(this, arguments, void 0, function (config, environmentId, environmentSecret, api, spawner, logger, signal, backoffConfig, initialSessionId, getAccessToken) {
        /**
         * Heartbeat all active work items.
         * Returns 'ok' if at least one heartbeat succeeded, 'auth_failed' if any
         * got a 401/403 (JWT expired — re-queued via reconnectSession so the next
         * poll delivers fresh work), or 'failed' if all failed for other reasons.
         */
        function heartbeatActiveWorkItems() {
            return __awaiter(this, void 0, void 0, function () {
                var anySuccess, anyFatal, authFailedSessions, _i, activeSessions_1, sessionId, workId, ingressToken, err_2, _a, authFailedSessions_1, sessionId, err_3;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            anySuccess = false;
                            anyFatal = false;
                            authFailedSessions = [];
                            _i = 0, activeSessions_1 = activeSessions;
                            _b.label = 1;
                        case 1:
                            if (!(_i < activeSessions_1.length)) return [3 /*break*/, 6];
                            sessionId = activeSessions_1[_i][0];
                            workId = sessionWorkIds.get(sessionId);
                            ingressToken = sessionIngressTokens.get(sessionId);
                            if (!workId || !ingressToken) {
                                return [3 /*break*/, 5];
                            }
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, api.heartbeatWork(environmentId, workId, ingressToken)];
                        case 3:
                            _b.sent();
                            anySuccess = true;
                            return [3 /*break*/, 5];
                        case 4:
                            err_2 = _b.sent();
                            (0, debug_js_1.logForDebugging)("[bridge:heartbeat] Failed for sessionId=".concat(sessionId, " workId=").concat(workId, ": ").concat((0, errors_js_1.errorMessage)(err_2)));
                            if (err_2 instanceof bridgeApi_js_1.BridgeFatalError) {
                                (0, index_js_1.logEvent)('tengu_bridge_heartbeat_error', {
                                    status: err_2.status,
                                    error_type: (err_2.status === 401 || err_2.status === 403
                                        ? 'auth_failed'
                                        : 'fatal'),
                                });
                                if (err_2.status === 401 || err_2.status === 403) {
                                    authFailedSessions.push(sessionId);
                                }
                                else {
                                    // 404/410 = environment expired or deleted — no point retrying
                                    anyFatal = true;
                                }
                            }
                            return [3 /*break*/, 5];
                        case 5:
                            _i++;
                            return [3 /*break*/, 1];
                        case 6:
                            _a = 0, authFailedSessions_1 = authFailedSessions;
                            _b.label = 7;
                        case 7:
                            if (!(_a < authFailedSessions_1.length)) return [3 /*break*/, 12];
                            sessionId = authFailedSessions_1[_a];
                            logger.logVerbose("Session ".concat(sessionId, " token expired \u2014 re-queuing via bridge/reconnect"));
                            _b.label = 8;
                        case 8:
                            _b.trys.push([8, 10, , 11]);
                            return [4 /*yield*/, api.reconnectSession(environmentId, sessionId)];
                        case 9:
                            _b.sent();
                            (0, debug_js_1.logForDebugging)("[bridge:heartbeat] Re-queued sessionId=".concat(sessionId, " via bridge/reconnect"));
                            return [3 /*break*/, 11];
                        case 10:
                            err_3 = _b.sent();
                            logger.logError("Failed to refresh session ".concat(sessionId, " token: ").concat((0, errors_js_1.errorMessage)(err_3)));
                            (0, debug_js_1.logForDebugging)("[bridge:heartbeat] reconnectSession(".concat(sessionId, ") failed: ").concat((0, errors_js_1.errorMessage)(err_3)), { level: 'error' });
                            return [3 /*break*/, 11];
                        case 11:
                            _a++;
                            return [3 /*break*/, 7];
                        case 12:
                            if (anyFatal) {
                                return [2 /*return*/, 'fatal'];
                            }
                            if (authFailedSessions.length > 0) {
                                return [2 /*return*/, 'auth_failed'];
                            }
                            return [2 /*return*/, anySuccess ? 'ok' : 'failed'];
                    }
                });
            });
        }
        function trackCleanup(p) {
            pendingCleanups.add(p);
            void p.finally(function () { return pendingCleanups.delete(p); });
        }
        /** Refresh the inline status display. Shows idle or active depending on state. */
        function updateStatusDisplay() {
            var _a;
            // Push the session count (no-op when maxSessions === 1) so the
            // next renderStatusLine tick shows the current count.
            logger.updateSessionCount(activeSessions.size, config.maxSessions, config.spawnMode);
            // Push per-session activity into the multi-session display.
            for (var _i = 0, activeSessions_2 = activeSessions; _i < activeSessions_2.length; _i++) {
                var _b = activeSessions_2[_i], sid = _b[0], handle_1 = _b[1];
                var act = handle_1.currentActivity;
                if (act) {
                    logger.updateSessionActivity((_a = sessionCompatIds.get(sid)) !== null && _a !== void 0 ? _a : sid, act);
                }
            }
            if (activeSessions.size === 0) {
                logger.updateIdleStatus();
                return;
            }
            // Show the most recently started session that is still actively working.
            // Sessions whose current activity is 'result' or 'error' are between
            // turns — the CLI emitted its result but the process stays alive waiting
            // for the next user message.  Skip updating so the status line keeps
            // whatever state it had (Attached / session title).
            var _c = __spreadArray([], activeSessions.entries(), true).pop(), sessionId = _c[0], handle = _c[1];
            var startTime = sessionStartTimes.get(sessionId);
            if (!startTime)
                return;
            var activity = handle.currentActivity;
            if (!activity || activity.type === 'result' || activity.type === 'error') {
                // Session is between turns — keep current status (Attached/titled).
                // In multi-session mode, still refresh so bullet-list activities stay current.
                if (config.maxSessions > 1)
                    logger.refreshDisplay();
                return;
            }
            var elapsed = (0, bridgeStatusUtil_js_1.formatDuration)(Date.now() - startTime);
            // Build trail from recent tool activities (last 5)
            var trail = handle.activities
                .filter(function (a) { return a.type === 'tool_start'; })
                .slice(-5)
                .map(function (a) { return a.summary; });
            logger.updateSessionStatus(sessionId, elapsed, activity, trail);
        }
        /** Start the status display update ticker. */
        function startStatusUpdates() {
            stopStatusUpdates();
            // Call immediately so the first transition (e.g. Connecting → Ready)
            // happens without delay, avoiding concurrent timer races.
            updateStatusDisplay();
            statusUpdateTimer = setInterval(updateStatusDisplay, STATUS_UPDATE_INTERVAL_MS);
        }
        /** Stop the status display update ticker. */
        function stopStatusUpdates() {
            if (statusUpdateTimer) {
                clearInterval(statusUpdateTimer);
                statusUpdateTimer = null;
            }
        }
        function onSessionDone(sessionId, startTime, handle) {
            return function (rawStatus) {
                var _a;
                var workId = sessionWorkIds.get(sessionId);
                activeSessions.delete(sessionId);
                sessionStartTimes.delete(sessionId);
                sessionWorkIds.delete(sessionId);
                sessionIngressTokens.delete(sessionId);
                var compatId = (_a = sessionCompatIds.get(sessionId)) !== null && _a !== void 0 ? _a : sessionId;
                sessionCompatIds.delete(sessionId);
                logger.removeSession(compatId);
                titledSessions.delete(compatId);
                v2Sessions.delete(sessionId);
                // Clear per-session timeout timer
                var timer = sessionTimers.get(sessionId);
                if (timer) {
                    clearTimeout(timer);
                    sessionTimers.delete(sessionId);
                }
                // Clear token refresh timer
                tokenRefresh === null || tokenRefresh === void 0 ? void 0 : tokenRefresh.cancel(sessionId);
                // Wake the at-capacity sleep so the bridge can accept new work immediately
                capacityWake.wake();
                // If the session was killed by the timeout watchdog, treat it as a
                // failed session (not a server/shutdown interrupt) so we still call
                // stopWork and archiveSession below.
                var wasTimedOut = timedOutSessions.delete(sessionId);
                var status = wasTimedOut && rawStatus === 'interrupted' ? 'failed' : rawStatus;
                var durationMs = Date.now() - startTime;
                (0, debug_js_1.logForDebugging)("[bridge:session] sessionId=".concat(sessionId, " workId=").concat(workId !== null && workId !== void 0 ? workId : 'unknown', " exited status=").concat(status, " duration=").concat((0, bridgeStatusUtil_js_1.formatDuration)(durationMs)));
                (0, index_js_1.logEvent)('tengu_bridge_session_done', {
                    status: status,
                    duration_ms: durationMs,
                });
                (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'bridge_session_done', {
                    status: status,
                    duration_ms: durationMs,
                });
                // Clear the status display before printing final log
                logger.clearStatus();
                stopStatusUpdates();
                // Build error message from stderr if available
                var stderrSummary = handle.lastStderr.length > 0 ? handle.lastStderr.join('\n') : undefined;
                var failureMessage;
                switch (status) {
                    case 'completed':
                        logger.logSessionComplete(sessionId, durationMs);
                        break;
                    case 'failed':
                        // Skip failure log during shutdown — the child exits non-zero when
                        // killed, which is expected and not a real failure.
                        // Also skip for timeout-killed sessions — the timeout watchdog
                        // already logged a clear timeout message.
                        if (!wasTimedOut && !loopSignal.aborted) {
                            failureMessage = stderrSummary !== null && stderrSummary !== void 0 ? stderrSummary : 'Process exited with error';
                            logger.logSessionFailed(sessionId, failureMessage);
                            (0, log_js_1.logError)(new Error("Bridge session failed: ".concat(failureMessage)));
                        }
                        break;
                    case 'interrupted':
                        logger.logVerbose("Session ".concat(sessionId, " interrupted"));
                        break;
                }
                // Notify the server that this work item is done. Skip for interrupted
                // sessions — interrupts are either server-initiated (the server already
                // knows) or caused by bridge shutdown (which calls stopWork() separately).
                if (status !== 'interrupted' && workId) {
                    trackCleanup(stopWorkWithRetry(api, environmentId, workId, logger, backoffConfig.stopWorkBaseDelayMs));
                    completedWorkIds.add(workId);
                }
                // Clean up worktree if one was created for this session
                var wt = sessionWorktrees.get(sessionId);
                if (wt) {
                    sessionWorktrees.delete(sessionId);
                    trackCleanup((0, worktree_js_1.removeAgentWorktree)(wt.worktreePath, wt.worktreeBranch, wt.gitRoot, wt.hookBased).catch(function (err) {
                        return logger.logVerbose("Failed to remove worktree ".concat(wt.worktreePath, ": ").concat((0, errors_js_1.errorMessage)(err)));
                    }));
                }
                // Lifecycle decision: in multi-session mode, keep the bridge running
                // after a session completes. In single-session mode, abort the poll
                // loop so the bridge exits cleanly.
                if (status !== 'interrupted' && !loopSignal.aborted) {
                    if (config.spawnMode !== 'single-session') {
                        // Multi-session: archive the completed session so it doesn't linger
                        // as stale in the web UI. archiveSession is idempotent (409 if already
                        // archived), so double-archiving at shutdown is safe.
                        // sessionId arrived as cse_* from the work poll (infrastructure-layer
                        // tag). archiveSession hits /v1/sessions/{id}/archive which is the
                        // compat surface and validates TagSession (session_*). Re-tag — same
                        // UUID underneath.
                        trackCleanup(api
                            .archiveSession(compatId)
                            .catch(function (err) {
                            return logger.logVerbose("Failed to archive session ".concat(sessionId, ": ").concat((0, errors_js_1.errorMessage)(err)));
                        }));
                        (0, debug_js_1.logForDebugging)("[bridge:session] Session ".concat(status, ", returning to idle (multi-session mode)"));
                    }
                    else {
                        // Single-session: coupled lifecycle — tear down environment
                        (0, debug_js_1.logForDebugging)("[bridge:session] Session ".concat(status, ", aborting poll loop to tear down environment"));
                        controller.abort();
                        return;
                    }
                }
                if (!loopSignal.aborted) {
                    startStatusUpdates();
                }
            };
        }
        var controller, loopSignal, activeSessions, sessionStartTimes, sessionWorkIds, sessionCompatIds, sessionIngressTokens, sessionTimers, completedWorkIds, sessionWorktrees, timedOutSessions, titledSessions, capacityWake, v2Sessions, tokenRefresh, loopStartTime, pendingCleanups, connBackoff, generalBackoff, connErrorStart, generalErrorStart, lastPollErrorTime, statusUpdateTimer, fatalExit, debugGlob, ext, _loop_1, state_1, loopDurationMs, sessionsToArchive, compatIdSnapshot, shutdownWorkIds, _i, _a, _b, sessionId, handle, timeout, _c, _d, _e, sid, handle, _f, _g, timer, remainingWorktrees, err_1, clearBridgePointer;
        var _this = this;
        var _h, _j, _k;
        if (backoffConfig === void 0) { backoffConfig = DEFAULT_BACKOFF; }
        return __generator(this, function (_l) {
            switch (_l.label) {
                case 0:
                    controller = new AbortController();
                    if (signal.aborted) {
                        controller.abort();
                    }
                    else {
                        signal.addEventListener('abort', function () { return controller.abort(); }, { once: true });
                    }
                    loopSignal = controller.signal;
                    activeSessions = new Map();
                    sessionStartTimes = new Map();
                    sessionWorkIds = new Map();
                    sessionCompatIds = new Map();
                    sessionIngressTokens = new Map();
                    sessionTimers = new Map();
                    completedWorkIds = new Set();
                    sessionWorktrees = new Map();
                    timedOutSessions = new Set();
                    titledSessions = new Set();
                    capacityWake = (0, capacityWake_js_1.createCapacityWake)(loopSignal);
                    v2Sessions = new Set();
                    tokenRefresh = getAccessToken
                        ? (0, jwtUtils_js_1.createTokenRefreshScheduler)({
                            getAccessToken: getAccessToken,
                            onRefresh: function (sessionId, oauthToken) {
                                var handle = activeSessions.get(sessionId);
                                if (!handle) {
                                    return;
                                }
                                if (v2Sessions.has(sessionId)) {
                                    logger.logVerbose("Refreshing session ".concat(sessionId, " token via bridge/reconnect"));
                                    void api
                                        .reconnectSession(environmentId, sessionId)
                                        .catch(function (err) {
                                        logger.logError("Failed to refresh session ".concat(sessionId, " token: ").concat((0, errors_js_1.errorMessage)(err)));
                                        (0, debug_js_1.logForDebugging)("[bridge:token] reconnectSession(".concat(sessionId, ") failed: ").concat((0, errors_js_1.errorMessage)(err)), { level: 'error' });
                                    });
                                }
                                else {
                                    handle.updateAccessToken(oauthToken);
                                }
                            },
                            label: 'bridge',
                        })
                        : null;
                    loopStartTime = Date.now();
                    pendingCleanups = new Set();
                    connBackoff = 0;
                    generalBackoff = 0;
                    connErrorStart = null;
                    generalErrorStart = null;
                    lastPollErrorTime = null;
                    statusUpdateTimer = null;
                    fatalExit = false;
                    (0, debug_js_1.logForDebugging)("[bridge:work] Starting poll loop spawnMode=".concat(config.spawnMode, " maxSessions=").concat(config.maxSessions, " environmentId=").concat(environmentId));
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'bridge_loop_started', {
                        max_sessions: config.maxSessions,
                        spawn_mode: config.spawnMode,
                    });
                    // For ant users, show where session debug logs will land so they can tail them.
                    // sessionRunner.ts uses the same base path. File appears once a session spawns.
                    if (process.env.USER_TYPE === 'ant') {
                        debugGlob = void 0;
                        if (config.debugFile) {
                            ext = config.debugFile.lastIndexOf('.');
                            debugGlob =
                                ext > 0
                                    ? "".concat(config.debugFile.slice(0, ext), "-*").concat(config.debugFile.slice(ext))
                                    : "".concat(config.debugFile, "-*");
                        }
                        else {
                            debugGlob = (0, path_1.join)((0, os_1.tmpdir)(), 'claude', 'bridge-session-*.log');
                        }
                        logger.setDebugLogPath(debugGlob);
                    }
                    logger.printBanner(config, environmentId);
                    // Seed the logger's session count + spawn mode before any render. Without
                    // this, setAttached() below renders with the logger's default sessionMax=1,
                    // showing "Capacity: 0/1" until the status ticker kicks in (which is gated
                    // by !initialSessionId and only starts after the poll loop picks up work).
                    logger.updateSessionCount(0, config.maxSessions, config.spawnMode);
                    // If an initial session was pre-created, show its URL from the start so
                    // the user can click through immediately (matching /remote-control behavior).
                    if (initialSessionId) {
                        logger.setAttached(initialSessionId);
                    }
                    // Start the idle status display immediately — unless we have a pre-created
                    // session, in which case setAttached() already set up the display and the
                    // poll loop will start status updates when it picks up the session.
                    if (!initialSessionId) {
                        startStatusUpdates();
                    }
                    _loop_1 = function () {
                        var pollConfig, work_1, wasDisconnected, disconnectedMs, atCap, atCapMs, pollDeadline, hbResult, hbCycles, hbConfig, cap, exitReason, cap, cap, interval, atCapacityBeforeSwitch, cap, secret_1, err_4, errMsg, cap, ackWork, workType, _m, sessionId_1, _o, existingHandle, spawnStartTime, sdkUrl, useCcrV2, workerEpoch, attempt, err_5, errMsg, spawnModeAtDecision, sessionDir, worktreeCreateMs, wtStart, wt, err_6, errMsg, compatSessionId_1, spawnResult, wt_1, handle, spawnDurationMs, startTime, safeId, sessionDebugFile, ext, timeoutMs, timer, cap, err_7, errMsg, now, elapsed, delay, now, elapsed, delay;
                        return __generator(this, function (_p) {
                            switch (_p.label) {
                                case 0:
                                    pollConfig = (0, pollConfig_js_1.getPollIntervalConfig)();
                                    _p.label = 1;
                                case 1:
                                    _p.trys.push([1, 66, , 75]);
                                    return [4 /*yield*/, api.pollForWork(environmentId, environmentSecret, loopSignal, pollConfig.reclaim_older_than_ms)
                                        // Log reconnection if we were previously disconnected
                                    ];
                                case 2:
                                    work_1 = _p.sent();
                                    wasDisconnected = connErrorStart !== null || generalErrorStart !== null;
                                    if (wasDisconnected) {
                                        disconnectedMs = Date.now() - ((_h = connErrorStart !== null && connErrorStart !== void 0 ? connErrorStart : generalErrorStart) !== null && _h !== void 0 ? _h : Date.now());
                                        logger.logReconnected(disconnectedMs);
                                        (0, debug_js_1.logForDebugging)("[bridge:poll] Reconnected after ".concat((0, bridgeStatusUtil_js_1.formatDuration)(disconnectedMs)));
                                        (0, index_js_1.logEvent)('tengu_bridge_reconnected', {
                                            disconnected_ms: disconnectedMs,
                                        });
                                    }
                                    connBackoff = 0;
                                    generalBackoff = 0;
                                    connErrorStart = null;
                                    generalErrorStart = null;
                                    lastPollErrorTime = null;
                                    if (!!work_1) return [3 /*break*/, 15];
                                    atCap = activeSessions.size >= config.maxSessions;
                                    if (!atCap) return [3 /*break*/, 12];
                                    atCapMs = pollConfig.multisession_poll_interval_ms_at_capacity;
                                    if (!(pollConfig.non_exclusive_heartbeat_interval_ms > 0)) return [3 /*break*/, 9];
                                    (0, index_js_1.logEvent)('tengu_bridge_heartbeat_mode_entered', {
                                        active_sessions: activeSessions.size,
                                        heartbeat_interval_ms: pollConfig.non_exclusive_heartbeat_interval_ms,
                                    });
                                    pollDeadline = atCapMs > 0 ? Date.now() + atCapMs : null;
                                    hbResult = 'ok';
                                    hbCycles = 0;
                                    _p.label = 3;
                                case 3:
                                    if (!(!loopSignal.aborted &&
                                        activeSessions.size >= config.maxSessions &&
                                        (pollDeadline === null || Date.now() < pollDeadline))) return [3 /*break*/, 6];
                                    hbConfig = (0, pollConfig_js_1.getPollIntervalConfig)();
                                    if (hbConfig.non_exclusive_heartbeat_interval_ms <= 0)
                                        return [3 /*break*/, 6];
                                    cap = capacityWake.signal();
                                    return [4 /*yield*/, heartbeatActiveWorkItems()];
                                case 4:
                                    hbResult = _p.sent();
                                    if (hbResult === 'auth_failed' || hbResult === 'fatal') {
                                        cap.cleanup();
                                        return [3 /*break*/, 6];
                                    }
                                    hbCycles++;
                                    return [4 /*yield*/, (0, sleep_js_1.sleep)(hbConfig.non_exclusive_heartbeat_interval_ms, cap.signal)];
                                case 5:
                                    _p.sent();
                                    cap.cleanup();
                                    return [3 /*break*/, 3];
                                case 6:
                                    exitReason = hbResult === 'auth_failed' || hbResult === 'fatal'
                                        ? hbResult
                                        : loopSignal.aborted
                                            ? 'shutdown'
                                            : activeSessions.size < config.maxSessions
                                                ? 'capacity_changed'
                                                : pollDeadline !== null && Date.now() >= pollDeadline
                                                    ? 'poll_due'
                                                    : 'config_disabled';
                                    (0, index_js_1.logEvent)('tengu_bridge_heartbeat_mode_exited', {
                                        reason: exitReason,
                                        heartbeat_cycles: hbCycles,
                                        active_sessions: activeSessions.size,
                                    });
                                    if (exitReason === 'poll_due') {
                                        // bridgeApi throttles empty-poll logs (EMPTY_POLL_LOG_INTERVAL=100)
                                        // so the once-per-10min poll_due poll is invisible at counter=2.
                                        // Log it here so verification runs see both endpoints in the debug log.
                                        (0, debug_js_1.logForDebugging)("[bridge:poll] Heartbeat poll_due after ".concat(hbCycles, " cycles \u2014 falling through to pollForWork"));
                                    }
                                    if (!(hbResult === 'auth_failed' || hbResult === 'fatal')) return [3 /*break*/, 8];
                                    cap = capacityWake.signal();
                                    return [4 /*yield*/, (0, sleep_js_1.sleep)(atCapMs > 0
                                            ? atCapMs
                                            : pollConfig.non_exclusive_heartbeat_interval_ms, cap.signal)];
                                case 7:
                                    _p.sent();
                                    cap.cleanup();
                                    _p.label = 8;
                                case 8: return [3 /*break*/, 11];
                                case 9:
                                    if (!(atCapMs > 0)) return [3 /*break*/, 11];
                                    cap = capacityWake.signal();
                                    return [4 /*yield*/, (0, sleep_js_1.sleep)(atCapMs, cap.signal)];
                                case 10:
                                    _p.sent();
                                    cap.cleanup();
                                    _p.label = 11;
                                case 11: return [3 /*break*/, 14];
                                case 12:
                                    interval = activeSessions.size > 0
                                        ? pollConfig.multisession_poll_interval_ms_partial_capacity
                                        : pollConfig.multisession_poll_interval_ms_not_at_capacity;
                                    return [4 /*yield*/, (0, sleep_js_1.sleep)(interval, loopSignal)];
                                case 13:
                                    _p.sent();
                                    _p.label = 14;
                                case 14: return [2 /*return*/, "continue"];
                                case 15:
                                    atCapacityBeforeSwitch = activeSessions.size >= config.maxSessions;
                                    if (!completedWorkIds.has(work_1.id)) return [3 /*break*/, 24];
                                    (0, debug_js_1.logForDebugging)("[bridge:work] Skipping already-completed workId=".concat(work_1.id));
                                    if (!atCapacityBeforeSwitch) return [3 /*break*/, 21];
                                    cap = capacityWake.signal();
                                    if (!(pollConfig.non_exclusive_heartbeat_interval_ms > 0)) return [3 /*break*/, 18];
                                    return [4 /*yield*/, heartbeatActiveWorkItems()];
                                case 16:
                                    _p.sent();
                                    return [4 /*yield*/, (0, sleep_js_1.sleep)(pollConfig.non_exclusive_heartbeat_interval_ms, cap.signal)];
                                case 17:
                                    _p.sent();
                                    return [3 /*break*/, 20];
                                case 18:
                                    if (!(pollConfig.multisession_poll_interval_ms_at_capacity > 0)) return [3 /*break*/, 20];
                                    return [4 /*yield*/, (0, sleep_js_1.sleep)(pollConfig.multisession_poll_interval_ms_at_capacity, cap.signal)];
                                case 19:
                                    _p.sent();
                                    _p.label = 20;
                                case 20:
                                    cap.cleanup();
                                    return [3 /*break*/, 23];
                                case 21: return [4 /*yield*/, (0, sleep_js_1.sleep)(1000, loopSignal)];
                                case 22:
                                    _p.sent();
                                    _p.label = 23;
                                case 23: return [2 /*return*/, "continue"];
                                case 24:
                                    _p.trys.push([24, 25, , 32]);
                                    secret_1 = (0, workSecret_js_1.decodeWorkSecret)(work_1.secret);
                                    return [3 /*break*/, 32];
                                case 25:
                                    err_4 = _p.sent();
                                    errMsg = (0, errors_js_1.errorMessage)(err_4);
                                    logger.logError("Failed to decode work secret for workId=".concat(work_1.id, ": ").concat(errMsg));
                                    (0, index_js_1.logEvent)('tengu_bridge_work_secret_failed', {});
                                    // Can't ack (needs the JWT we failed to decode). stopWork uses OAuth,
                                    // so it's callable here — prevents XAUTOCLAIM from re-delivering this
                                    // poisoned item every reclaim_older_than_ms cycle.
                                    completedWorkIds.add(work_1.id);
                                    trackCleanup(stopWorkWithRetry(api, environmentId, work_1.id, logger, backoffConfig.stopWorkBaseDelayMs));
                                    if (!atCapacityBeforeSwitch) return [3 /*break*/, 31];
                                    cap = capacityWake.signal();
                                    if (!(pollConfig.non_exclusive_heartbeat_interval_ms > 0)) return [3 /*break*/, 28];
                                    return [4 /*yield*/, heartbeatActiveWorkItems()];
                                case 26:
                                    _p.sent();
                                    return [4 /*yield*/, (0, sleep_js_1.sleep)(pollConfig.non_exclusive_heartbeat_interval_ms, cap.signal)];
                                case 27:
                                    _p.sent();
                                    return [3 /*break*/, 30];
                                case 28:
                                    if (!(pollConfig.multisession_poll_interval_ms_at_capacity > 0)) return [3 /*break*/, 30];
                                    return [4 /*yield*/, (0, sleep_js_1.sleep)(pollConfig.multisession_poll_interval_ms_at_capacity, cap.signal)];
                                case 29:
                                    _p.sent();
                                    _p.label = 30;
                                case 30:
                                    cap.cleanup();
                                    _p.label = 31;
                                case 31: return [2 /*return*/, "continue"];
                                case 32:
                                    ackWork = function () { return __awaiter(_this, void 0, void 0, function () {
                                        var err_8;
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0:
                                                    (0, debug_js_1.logForDebugging)("[bridge:work] Acknowledging workId=".concat(work_1.id));
                                                    _a.label = 1;
                                                case 1:
                                                    _a.trys.push([1, 3, , 4]);
                                                    return [4 /*yield*/, api.acknowledgeWork(environmentId, work_1.id, secret_1.session_ingress_token)];
                                                case 2:
                                                    _a.sent();
                                                    return [3 /*break*/, 4];
                                                case 3:
                                                    err_8 = _a.sent();
                                                    (0, debug_js_1.logForDebugging)("[bridge:work] Acknowledge failed workId=".concat(work_1.id, ": ").concat((0, errors_js_1.errorMessage)(err_8)));
                                                    return [3 /*break*/, 4];
                                                case 4: return [2 /*return*/];
                                            }
                                        });
                                    }); };
                                    workType = work_1.data.type;
                                    _m = work_1.data.type;
                                    switch (_m) {
                                        case 'healthcheck': return [3 /*break*/, 33];
                                        case 'session': return [3 /*break*/, 35];
                                    }
                                    return [3 /*break*/, 57];
                                case 33: return [4 /*yield*/, ackWork()];
                                case 34:
                                    _p.sent();
                                    (0, debug_js_1.logForDebugging)('[bridge:work] Healthcheck received');
                                    logger.logVerbose('Healthcheck received');
                                    return [3 /*break*/, 59];
                                case 35:
                                    sessionId_1 = work_1.data.id;
                                    _p.label = 36;
                                case 36:
                                    _p.trys.push([36, 37, , 39]);
                                    (0, bridgeApi_js_1.validateBridgeId)(sessionId_1, 'session_id');
                                    return [3 /*break*/, 39];
                                case 37:
                                    _o = _p.sent();
                                    return [4 /*yield*/, ackWork()];
                                case 38:
                                    _p.sent();
                                    logger.logError("Invalid session_id received: ".concat(sessionId_1));
                                    return [3 /*break*/, 59];
                                case 39:
                                    existingHandle = activeSessions.get(sessionId_1);
                                    if (!existingHandle) return [3 /*break*/, 41];
                                    existingHandle.updateAccessToken(secret_1.session_ingress_token);
                                    sessionIngressTokens.set(sessionId_1, secret_1.session_ingress_token);
                                    sessionWorkIds.set(sessionId_1, work_1.id);
                                    // Re-schedule next refresh from the fresh JWT's expiry. onRefresh
                                    // branches on v2Sessions so both v1 and v2 are safe here.
                                    tokenRefresh === null || tokenRefresh === void 0 ? void 0 : tokenRefresh.schedule(sessionId_1, secret_1.session_ingress_token);
                                    (0, debug_js_1.logForDebugging)("[bridge:work] Updated access token for existing sessionId=".concat(sessionId_1, " workId=").concat(work_1.id));
                                    return [4 /*yield*/, ackWork()];
                                case 40:
                                    _p.sent();
                                    return [3 /*break*/, 59];
                                case 41:
                                    // At capacity — token refresh for existing sessions is handled
                                    // above, but we cannot spawn new ones. The post-switch capacity
                                    // sleep will throttle the loop; just break here.
                                    if (activeSessions.size >= config.maxSessions) {
                                        (0, debug_js_1.logForDebugging)("[bridge:work] At capacity (".concat(activeSessions.size, "/").concat(config.maxSessions, "), cannot spawn new session for workId=").concat(work_1.id));
                                        return [3 /*break*/, 59];
                                    }
                                    return [4 /*yield*/, ackWork()];
                                case 42:
                                    _p.sent();
                                    spawnStartTime = Date.now();
                                    sdkUrl = void 0;
                                    useCcrV2 = false;
                                    workerEpoch = void 0;
                                    if (!(secret_1.use_code_sessions === true ||
                                        (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_BRIDGE_USE_CCR_V2))) return [3 /*break*/, 51];
                                    sdkUrl = (0, workSecret_js_1.buildCCRv2SdkUrl)(config.apiBaseUrl, sessionId_1);
                                    attempt = 1;
                                    _p.label = 43;
                                case 43:
                                    if (!(attempt <= 2)) return [3 /*break*/, 50];
                                    _p.label = 44;
                                case 44:
                                    _p.trys.push([44, 46, , 49]);
                                    return [4 /*yield*/, (0, workSecret_js_1.registerWorker)(sdkUrl, secret_1.session_ingress_token)];
                                case 45:
                                    workerEpoch = _p.sent();
                                    useCcrV2 = true;
                                    (0, debug_js_1.logForDebugging)("[bridge:session] CCR v2: registered worker sessionId=".concat(sessionId_1, " epoch=").concat(workerEpoch, " attempt=").concat(attempt));
                                    return [3 /*break*/, 50];
                                case 46:
                                    err_5 = _p.sent();
                                    errMsg = (0, errors_js_1.errorMessage)(err_5);
                                    if (!(attempt < 2)) return [3 /*break*/, 48];
                                    (0, debug_js_1.logForDebugging)("[bridge:session] CCR v2: registerWorker attempt ".concat(attempt, " failed, retrying: ").concat(errMsg));
                                    return [4 /*yield*/, (0, sleep_js_1.sleep)(2000, loopSignal)];
                                case 47:
                                    _p.sent();
                                    if (loopSignal.aborted)
                                        return [3 /*break*/, 50];
                                    return [3 /*break*/, 49];
                                case 48:
                                    logger.logError("CCR v2 worker registration failed for session ".concat(sessionId_1, ": ").concat(errMsg));
                                    (0, log_js_1.logError)(new Error("registerWorker failed: ".concat(errMsg)));
                                    completedWorkIds.add(work_1.id);
                                    trackCleanup(stopWorkWithRetry(api, environmentId, work_1.id, logger, backoffConfig.stopWorkBaseDelayMs));
                                    return [3 /*break*/, 49];
                                case 49:
                                    attempt++;
                                    return [3 /*break*/, 43];
                                case 50:
                                    if (!useCcrV2)
                                        return [3 /*break*/, 59];
                                    return [3 /*break*/, 52];
                                case 51:
                                    sdkUrl = (0, workSecret_js_1.buildSdkUrl)(config.sessionIngressUrl, sessionId_1);
                                    _p.label = 52;
                                case 52:
                                    spawnModeAtDecision = config.spawnMode;
                                    sessionDir = config.dir;
                                    worktreeCreateMs = 0;
                                    if (!(spawnModeAtDecision === 'worktree' &&
                                        (initialSessionId === undefined ||
                                            !(0, workSecret_js_1.sameSessionId)(sessionId_1, initialSessionId)))) return [3 /*break*/, 56];
                                    wtStart = Date.now();
                                    _p.label = 53;
                                case 53:
                                    _p.trys.push([53, 55, , 56]);
                                    return [4 /*yield*/, (0, worktree_js_1.createAgentWorktree)("bridge-".concat((0, sessionRunner_js_1.safeFilenameId)(sessionId_1)))];
                                case 54:
                                    wt = _p.sent();
                                    worktreeCreateMs = Date.now() - wtStart;
                                    sessionWorktrees.set(sessionId_1, {
                                        worktreePath: wt.worktreePath,
                                        worktreeBranch: wt.worktreeBranch,
                                        gitRoot: wt.gitRoot,
                                        hookBased: wt.hookBased,
                                    });
                                    sessionDir = wt.worktreePath;
                                    (0, debug_js_1.logForDebugging)("[bridge:session] Created worktree for sessionId=".concat(sessionId_1, " at ").concat(wt.worktreePath));
                                    return [3 /*break*/, 56];
                                case 55:
                                    err_6 = _p.sent();
                                    errMsg = (0, errors_js_1.errorMessage)(err_6);
                                    logger.logError("Failed to create worktree for session ".concat(sessionId_1, ": ").concat(errMsg));
                                    (0, log_js_1.logError)(new Error("Worktree creation failed: ".concat(errMsg)));
                                    completedWorkIds.add(work_1.id);
                                    trackCleanup(stopWorkWithRetry(api, environmentId, work_1.id, logger, backoffConfig.stopWorkBaseDelayMs));
                                    return [3 /*break*/, 59];
                                case 56:
                                    (0, debug_js_1.logForDebugging)("[bridge:session] Spawning sessionId=".concat(sessionId_1, " sdkUrl=").concat(sdkUrl));
                                    compatSessionId_1 = (0, sessionIdCompat_js_1.toCompatSessionId)(sessionId_1);
                                    spawnResult = safeSpawn(spawner, {
                                        sessionId: sessionId_1,
                                        sdkUrl: sdkUrl,
                                        accessToken: secret_1.session_ingress_token,
                                        useCcrV2: useCcrV2,
                                        workerEpoch: workerEpoch,
                                        onFirstUserMessage: function (text) {
                                            // Server-set titles (--name, web rename) win. fetchSessionTitle
                                            // runs concurrently; if it already populated titledSessions,
                                            // skip. If it hasn't resolved yet, the derived title sticks —
                                            // acceptable since the server had no title at spawn time.
                                            if (titledSessions.has(compatSessionId_1))
                                                return;
                                            titledSessions.add(compatSessionId_1);
                                            var title = deriveSessionTitle(text);
                                            logger.setSessionTitle(compatSessionId_1, title);
                                            (0, debug_js_1.logForDebugging)("[bridge:title] derived title for ".concat(compatSessionId_1, ": ").concat(title));
                                            void Promise.resolve().then(function () { return require('./createSession.js'); }).then(function (_a) {
                                                var updateBridgeSessionTitle = _a.updateBridgeSessionTitle;
                                                return updateBridgeSessionTitle(compatSessionId_1, title, {
                                                    baseUrl: config.apiBaseUrl,
                                                });
                                            })
                                                .catch(function (err) {
                                                return (0, debug_js_1.logForDebugging)("[bridge:title] failed to update title for ".concat(compatSessionId_1, ": ").concat(err), { level: 'error' });
                                            });
                                        },
                                    }, sessionDir);
                                    if (typeof spawnResult === 'string') {
                                        logger.logError("Failed to spawn session ".concat(sessionId_1, ": ").concat(spawnResult));
                                        wt_1 = sessionWorktrees.get(sessionId_1);
                                        if (wt_1) {
                                            sessionWorktrees.delete(sessionId_1);
                                            trackCleanup((0, worktree_js_1.removeAgentWorktree)(wt_1.worktreePath, wt_1.worktreeBranch, wt_1.gitRoot, wt_1.hookBased).catch(function (err) {
                                                return logger.logVerbose("Failed to remove worktree ".concat(wt_1.worktreePath, ": ").concat((0, errors_js_1.errorMessage)(err)));
                                            }));
                                        }
                                        completedWorkIds.add(work_1.id);
                                        trackCleanup(stopWorkWithRetry(api, environmentId, work_1.id, logger, backoffConfig.stopWorkBaseDelayMs));
                                        return [3 /*break*/, 59];
                                    }
                                    handle = spawnResult;
                                    spawnDurationMs = Date.now() - spawnStartTime;
                                    (0, index_js_1.logEvent)('tengu_bridge_session_started', {
                                        active_sessions: activeSessions.size,
                                        spawn_mode: spawnModeAtDecision,
                                        in_worktree: sessionWorktrees.has(sessionId_1),
                                        spawn_duration_ms: spawnDurationMs,
                                        worktree_create_ms: worktreeCreateMs,
                                        inProtectedNamespace: (0, envUtils_js_1.isInProtectedNamespace)(),
                                    });
                                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'bridge_session_started', {
                                        spawn_mode: spawnModeAtDecision,
                                        in_worktree: sessionWorktrees.has(sessionId_1),
                                        spawn_duration_ms: spawnDurationMs,
                                        worktree_create_ms: worktreeCreateMs,
                                    });
                                    activeSessions.set(sessionId_1, handle);
                                    sessionWorkIds.set(sessionId_1, work_1.id);
                                    sessionIngressTokens.set(sessionId_1, secret_1.session_ingress_token);
                                    sessionCompatIds.set(sessionId_1, compatSessionId_1);
                                    startTime = Date.now();
                                    sessionStartTimes.set(sessionId_1, startTime);
                                    // Use a generic prompt description since we no longer get startup_context
                                    logger.logSessionStart(sessionId_1, "Session ".concat(sessionId_1));
                                    safeId = (0, sessionRunner_js_1.safeFilenameId)(sessionId_1);
                                    sessionDebugFile = void 0;
                                    if (config.debugFile) {
                                        ext = config.debugFile.lastIndexOf('.');
                                        if (ext > 0) {
                                            sessionDebugFile = "".concat(config.debugFile.slice(0, ext), "-").concat(safeId).concat(config.debugFile.slice(ext));
                                        }
                                        else {
                                            sessionDebugFile = "".concat(config.debugFile, "-").concat(safeId);
                                        }
                                    }
                                    else if (config.verbose || process.env.USER_TYPE === 'ant') {
                                        sessionDebugFile = (0, path_1.join)((0, os_1.tmpdir)(), 'claude', "bridge-session-".concat(safeId, ".log"));
                                    }
                                    if (sessionDebugFile) {
                                        logger.logVerbose("Debug log: ".concat(sessionDebugFile));
                                    }
                                    // Register in the sessions Map before starting status updates so the
                                    // first render tick shows the correct count and bullet list in sync.
                                    logger.addSession(compatSessionId_1, (0, product_js_1.getRemoteSessionUrl)(compatSessionId_1, config.sessionIngressUrl));
                                    // Start live status updates and transition to "Attached" state.
                                    startStatusUpdates();
                                    logger.setAttached(compatSessionId_1);
                                    // One-shot title fetch. If the session already has a title (set via
                                    // --name, web rename, or /remote-control), display it and mark as
                                    // titled so the first-user-message fallback doesn't overwrite it.
                                    // Otherwise onFirstUserMessage derives one from the first prompt.
                                    void fetchSessionTitle(compatSessionId_1, config.apiBaseUrl)
                                        .then(function (title) {
                                        if (title && activeSessions.has(sessionId_1)) {
                                            titledSessions.add(compatSessionId_1);
                                            logger.setSessionTitle(compatSessionId_1, title);
                                            (0, debug_js_1.logForDebugging)("[bridge:title] server title for ".concat(compatSessionId_1, ": ").concat(title));
                                        }
                                    })
                                        .catch(function (err) {
                                        return (0, debug_js_1.logForDebugging)("[bridge:title] failed to fetch title for ".concat(compatSessionId_1, ": ").concat(err), { level: 'error' });
                                    });
                                    timeoutMs = (_j = config.sessionTimeoutMs) !== null && _j !== void 0 ? _j : types_js_1.DEFAULT_SESSION_TIMEOUT_MS;
                                    if (timeoutMs > 0) {
                                        timer = setTimeout(onSessionTimeout, timeoutMs, sessionId_1, timeoutMs, logger, timedOutSessions, handle);
                                        sessionTimers.set(sessionId_1, timer);
                                    }
                                    // Schedule proactive token refresh before the JWT expires.
                                    // onRefresh branches on v2Sessions: v1 delivers OAuth to the
                                    // child, v2 triggers server re-dispatch via reconnectSession.
                                    if (useCcrV2) {
                                        v2Sessions.add(sessionId_1);
                                    }
                                    tokenRefresh === null || tokenRefresh === void 0 ? void 0 : tokenRefresh.schedule(sessionId_1, secret_1.session_ingress_token);
                                    void handle.done.then(onSessionDone(sessionId_1, startTime, handle));
                                    return [3 /*break*/, 59];
                                case 57: return [4 /*yield*/, ackWork()
                                    // Gracefully ignore unknown work types. The backend may send new
                                    // types before the bridge client is updated.
                                ];
                                case 58:
                                    _p.sent();
                                    // Gracefully ignore unknown work types. The backend may send new
                                    // types before the bridge client is updated.
                                    (0, debug_js_1.logForDebugging)("[bridge:work] Unknown work type: ".concat(workType, ", skipping"));
                                    return [3 /*break*/, 59];
                                case 59:
                                    if (!atCapacityBeforeSwitch) return [3 /*break*/, 65];
                                    cap = capacityWake.signal();
                                    if (!(pollConfig.non_exclusive_heartbeat_interval_ms > 0)) return [3 /*break*/, 62];
                                    return [4 /*yield*/, heartbeatActiveWorkItems()];
                                case 60:
                                    _p.sent();
                                    return [4 /*yield*/, (0, sleep_js_1.sleep)(pollConfig.non_exclusive_heartbeat_interval_ms, cap.signal)];
                                case 61:
                                    _p.sent();
                                    return [3 /*break*/, 64];
                                case 62:
                                    if (!(pollConfig.multisession_poll_interval_ms_at_capacity > 0)) return [3 /*break*/, 64];
                                    return [4 /*yield*/, (0, sleep_js_1.sleep)(pollConfig.multisession_poll_interval_ms_at_capacity, cap.signal)];
                                case 63:
                                    _p.sent();
                                    _p.label = 64;
                                case 64:
                                    cap.cleanup();
                                    _p.label = 65;
                                case 65: return [3 /*break*/, 75];
                                case 66:
                                    err_7 = _p.sent();
                                    if (loopSignal.aborted) {
                                        return [2 /*return*/, "break"];
                                    }
                                    // Fatal errors (401/403) — no point retrying, auth won't fix itself
                                    if (err_7 instanceof bridgeApi_js_1.BridgeFatalError) {
                                        fatalExit = true;
                                        // Server-enforced expiry gets a clean status message, not an error
                                        if ((0, bridgeApi_js_1.isExpiredErrorType)(err_7.errorType)) {
                                            logger.logStatus(err_7.message);
                                        }
                                        else if ((0, bridgeApi_js_1.isSuppressible403)(err_7)) {
                                            // Cosmetic 403 errors (e.g., external_poll_sessions scope,
                                            // environments:manage permission) — don't show to user
                                            (0, debug_js_1.logForDebugging)("[bridge:work] Suppressed 403 error: ".concat(err_7.message));
                                        }
                                        else {
                                            logger.logError(err_7.message);
                                            (0, log_js_1.logError)(err_7);
                                        }
                                        (0, index_js_1.logEvent)('tengu_bridge_fatal_error', {
                                            status: err_7.status,
                                            error_type: err_7.errorType,
                                        });
                                        (0, diagLogs_js_1.logForDiagnosticsNoPII)((0, bridgeApi_js_1.isExpiredErrorType)(err_7.errorType) ? 'info' : 'error', 'bridge_fatal_error', { status: err_7.status, error_type: err_7.errorType });
                                        return [2 /*return*/, "break"];
                                    }
                                    errMsg = (0, debugUtils_js_1.describeAxiosError)(err_7);
                                    if (!(isConnectionError(err_7) || isServerError(err_7))) return [3 /*break*/, 70];
                                    now = Date.now();
                                    // Detect system sleep/wake: if the gap since the last poll error
                                    // greatly exceeds the expected backoff, the machine likely slept.
                                    // Reset error tracking so the bridge retries with a fresh budget.
                                    if (lastPollErrorTime !== null &&
                                        now - lastPollErrorTime > pollSleepDetectionThresholdMs(backoffConfig)) {
                                        (0, debug_js_1.logForDebugging)("[bridge:work] Detected system sleep (".concat(Math.round((now - lastPollErrorTime) / 1000), "s gap), resetting error budget"));
                                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'bridge_poll_sleep_detected', {
                                            gapMs: now - lastPollErrorTime,
                                        });
                                        connErrorStart = null;
                                        connBackoff = 0;
                                        generalErrorStart = null;
                                        generalBackoff = 0;
                                    }
                                    lastPollErrorTime = now;
                                    if (!connErrorStart) {
                                        connErrorStart = now;
                                    }
                                    elapsed = now - connErrorStart;
                                    if (elapsed >= backoffConfig.connGiveUpMs) {
                                        logger.logError("Server unreachable for ".concat(Math.round(elapsed / 60000), " minutes, giving up."));
                                        (0, index_js_1.logEvent)('tengu_bridge_poll_give_up', {
                                            error_type: 'connection',
                                            elapsed_ms: elapsed,
                                        });
                                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'bridge_poll_give_up', {
                                            error_type: 'connection',
                                            elapsed_ms: elapsed,
                                        });
                                        fatalExit = true;
                                        return [2 /*return*/, "break"];
                                    }
                                    // Reset the other track when switching error types
                                    generalErrorStart = null;
                                    generalBackoff = 0;
                                    connBackoff = connBackoff
                                        ? Math.min(connBackoff * 2, backoffConfig.connCapMs)
                                        : backoffConfig.connInitialMs;
                                    delay = addJitter(connBackoff);
                                    logger.logVerbose("Connection error, retrying in ".concat(formatDelay(delay), " (").concat(Math.round(elapsed / 1000), "s elapsed): ").concat(errMsg));
                                    logger.updateReconnectingStatus(formatDelay(delay), (0, bridgeStatusUtil_js_1.formatDuration)(elapsed));
                                    if (!((0, pollConfig_js_1.getPollIntervalConfig)().non_exclusive_heartbeat_interval_ms > 0)) return [3 /*break*/, 68];
                                    return [4 /*yield*/, heartbeatActiveWorkItems()];
                                case 67:
                                    _p.sent();
                                    _p.label = 68;
                                case 68: return [4 /*yield*/, (0, sleep_js_1.sleep)(delay, loopSignal)];
                                case 69:
                                    _p.sent();
                                    return [3 /*break*/, 74];
                                case 70:
                                    now = Date.now();
                                    // Sleep detection for general errors (same logic as connection errors)
                                    if (lastPollErrorTime !== null &&
                                        now - lastPollErrorTime > pollSleepDetectionThresholdMs(backoffConfig)) {
                                        (0, debug_js_1.logForDebugging)("[bridge:work] Detected system sleep (".concat(Math.round((now - lastPollErrorTime) / 1000), "s gap), resetting error budget"));
                                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'bridge_poll_sleep_detected', {
                                            gapMs: now - lastPollErrorTime,
                                        });
                                        connErrorStart = null;
                                        connBackoff = 0;
                                        generalErrorStart = null;
                                        generalBackoff = 0;
                                    }
                                    lastPollErrorTime = now;
                                    if (!generalErrorStart) {
                                        generalErrorStart = now;
                                    }
                                    elapsed = now - generalErrorStart;
                                    if (elapsed >= backoffConfig.generalGiveUpMs) {
                                        logger.logError("Persistent errors for ".concat(Math.round(elapsed / 60000), " minutes, giving up."));
                                        (0, index_js_1.logEvent)('tengu_bridge_poll_give_up', {
                                            error_type: 'general',
                                            elapsed_ms: elapsed,
                                        });
                                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'bridge_poll_give_up', {
                                            error_type: 'general',
                                            elapsed_ms: elapsed,
                                        });
                                        fatalExit = true;
                                        return [2 /*return*/, "break"];
                                    }
                                    // Reset the other track when switching error types
                                    connErrorStart = null;
                                    connBackoff = 0;
                                    generalBackoff = generalBackoff
                                        ? Math.min(generalBackoff * 2, backoffConfig.generalCapMs)
                                        : backoffConfig.generalInitialMs;
                                    delay = addJitter(generalBackoff);
                                    logger.logVerbose("Poll failed, retrying in ".concat(formatDelay(delay), " (").concat(Math.round(elapsed / 1000), "s elapsed): ").concat(errMsg));
                                    logger.updateReconnectingStatus(formatDelay(delay), (0, bridgeStatusUtil_js_1.formatDuration)(elapsed));
                                    if (!((0, pollConfig_js_1.getPollIntervalConfig)().non_exclusive_heartbeat_interval_ms > 0)) return [3 /*break*/, 72];
                                    return [4 /*yield*/, heartbeatActiveWorkItems()];
                                case 71:
                                    _p.sent();
                                    _p.label = 72;
                                case 72: return [4 /*yield*/, (0, sleep_js_1.sleep)(delay, loopSignal)];
                                case 73:
                                    _p.sent();
                                    _p.label = 74;
                                case 74: return [3 /*break*/, 75];
                                case 75: return [2 /*return*/];
                            }
                        });
                    };
                    _l.label = 1;
                case 1:
                    if (!!loopSignal.aborted) return [3 /*break*/, 3];
                    return [5 /*yield**/, _loop_1()];
                case 2:
                    state_1 = _l.sent();
                    if (state_1 === "break")
                        return [3 /*break*/, 3];
                    return [3 /*break*/, 1];
                case 3:
                    // Clean up
                    stopStatusUpdates();
                    logger.clearStatus();
                    loopDurationMs = Date.now() - loopStartTime;
                    (0, index_js_1.logEvent)('tengu_bridge_shutdown', {
                        active_sessions: activeSessions.size,
                        loop_duration_ms: loopDurationMs,
                    });
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'bridge_shutdown', {
                        active_sessions: activeSessions.size,
                        loop_duration_ms: loopDurationMs,
                    });
                    sessionsToArchive = new Set(activeSessions.keys());
                    if (initialSessionId) {
                        sessionsToArchive.add(initialSessionId);
                    }
                    compatIdSnapshot = new Map(sessionCompatIds);
                    if (!(activeSessions.size > 0)) return [3 /*break*/, 8];
                    (0, debug_js_1.logForDebugging)("[bridge:shutdown] Shutting down ".concat(activeSessions.size, " active session(s)"));
                    logger.logStatus("Shutting down ".concat(activeSessions.size, " active session(s)\u2026"));
                    shutdownWorkIds = new Map(sessionWorkIds);
                    for (_i = 0, _a = activeSessions.entries(); _i < _a.length; _i++) {
                        _b = _a[_i], sessionId = _b[0], handle = _b[1];
                        (0, debug_js_1.logForDebugging)("[bridge:shutdown] Sending SIGTERM to sessionId=".concat(sessionId));
                        handle.kill();
                    }
                    timeout = new AbortController();
                    return [4 /*yield*/, Promise.race([
                            Promise.allSettled(__spreadArray([], activeSessions.values(), true).map(function (h) { return h.done; })),
                            (0, sleep_js_1.sleep)((_k = backoffConfig.shutdownGraceMs) !== null && _k !== void 0 ? _k : 30000, timeout.signal),
                        ])];
                case 4:
                    _l.sent();
                    timeout.abort();
                    // SIGKILL any processes that didn't respond to SIGTERM within the grace window
                    for (_c = 0, _d = activeSessions.entries(); _c < _d.length; _c++) {
                        _e = _d[_c], sid = _e[0], handle = _e[1];
                        (0, debug_js_1.logForDebugging)("[bridge:shutdown] Force-killing stuck sessionId=".concat(sid));
                        handle.forceKill();
                    }
                    // Clear any remaining session timeout and refresh timers
                    for (_f = 0, _g = sessionTimers.values(); _f < _g.length; _f++) {
                        timer = _g[_f];
                        clearTimeout(timer);
                    }
                    sessionTimers.clear();
                    tokenRefresh === null || tokenRefresh === void 0 ? void 0 : tokenRefresh.cancelAll();
                    if (!(sessionWorktrees.size > 0)) return [3 /*break*/, 6];
                    remainingWorktrees = __spreadArray([], sessionWorktrees.values(), true);
                    sessionWorktrees.clear();
                    (0, debug_js_1.logForDebugging)("[bridge:shutdown] Cleaning up ".concat(remainingWorktrees.length, " worktree(s)"));
                    return [4 /*yield*/, Promise.allSettled(remainingWorktrees.map(function (wt) {
                            return (0, worktree_js_1.removeAgentWorktree)(wt.worktreePath, wt.worktreeBranch, wt.gitRoot, wt.hookBased);
                        }))];
                case 5:
                    _l.sent();
                    _l.label = 6;
                case 6: 
                // Stop all active work items so the server knows they're done
                return [4 /*yield*/, Promise.allSettled(__spreadArray([], shutdownWorkIds.entries(), true).map(function (_a) {
                        var sessionId = _a[0], workId = _a[1];
                        return api
                            .stopWork(environmentId, workId, true)
                            .catch(function (err) {
                            return logger.logVerbose("Failed to stop work ".concat(workId, " for session ").concat(sessionId, ": ").concat((0, errors_js_1.errorMessage)(err)));
                        });
                    }))];
                case 7:
                    // Stop all active work items so the server knows they're done
                    _l.sent();
                    _l.label = 8;
                case 8:
                    if (!(pendingCleanups.size > 0)) return [3 /*break*/, 10];
                    return [4 /*yield*/, Promise.allSettled(__spreadArray([], pendingCleanups, true))];
                case 9:
                    _l.sent();
                    _l.label = 10;
                case 10:
                    // In single-session mode with a known session, leave the session and
                    // environment alive so `claude remote-control --session-id=<id>` can resume.
                    // The backend GCs stale environments via a 4h TTL (BRIDGE_LAST_POLL_TTL).
                    // Archiving the session or deregistering the environment would make the
                    // printed resume command a lie — deregister deletes Firestore + Redis stream.
                    // Skip when the loop exited fatally (env expired, auth failed, give-up) —
                    // resume is impossible in those cases and the message would contradict the
                    // error already printed.
                    // feature('KAIROS') gate: --session-id is ant-only; without the gate,
                    // revert to the pre-PR behavior (archive + deregister on every shutdown).
                    if ((0, bun_bundle_1.feature)('KAIROS') &&
                        config.spawnMode === 'single-session' &&
                        initialSessionId &&
                        !fatalExit) {
                        logger.logStatus("Resume this session by running `claude remote-control --continue`");
                        (0, debug_js_1.logForDebugging)("[bridge:shutdown] Skipping archive+deregister to allow resume of session ".concat(initialSessionId));
                        return [2 /*return*/];
                    }
                    if (!(sessionsToArchive.size > 0)) return [3 /*break*/, 12];
                    (0, debug_js_1.logForDebugging)("[bridge:shutdown] Archiving ".concat(sessionsToArchive.size, " session(s)"));
                    return [4 /*yield*/, Promise.allSettled(__spreadArray([], sessionsToArchive, true).map(function (sessionId) {
                            var _a;
                            return api
                                .archiveSession((_a = compatIdSnapshot.get(sessionId)) !== null && _a !== void 0 ? _a : (0, sessionIdCompat_js_1.toCompatSessionId)(sessionId))
                                .catch(function (err) {
                                return logger.logVerbose("Failed to archive session ".concat(sessionId, ": ").concat((0, errors_js_1.errorMessage)(err)));
                            });
                        }))];
                case 11:
                    _l.sent();
                    _l.label = 12;
                case 12:
                    _l.trys.push([12, 14, , 15]);
                    return [4 /*yield*/, api.deregisterEnvironment(environmentId)];
                case 13:
                    _l.sent();
                    (0, debug_js_1.logForDebugging)("[bridge:shutdown] Environment deregistered, bridge offline");
                    logger.logVerbose('Environment deregistered.');
                    return [3 /*break*/, 15];
                case 14:
                    err_1 = _l.sent();
                    logger.logVerbose("Failed to deregister environment: ".concat((0, errors_js_1.errorMessage)(err_1)));
                    return [3 /*break*/, 15];
                case 15: return [4 /*yield*/, Promise.resolve().then(function () { return require('./bridgePointer.js'); })];
                case 16:
                    clearBridgePointer = (_l.sent()).clearBridgePointer;
                    return [4 /*yield*/, clearBridgePointer(config.dir)];
                case 17:
                    _l.sent();
                    logger.logVerbose('Environment offline.');
                    return [2 /*return*/];
            }
        });
    });
}
var CONNECTION_ERROR_CODES = new Set([
    'ECONNREFUSED',
    'ECONNRESET',
    'ETIMEDOUT',
    'ENETUNREACH',
    'EHOSTUNREACH',
]);
function isConnectionError(err) {
    if (err &&
        typeof err === 'object' &&
        'code' in err &&
        typeof err.code === 'string' &&
        CONNECTION_ERROR_CODES.has(err.code)) {
        return true;
    }
    return false;
}
/** Detect HTTP 5xx errors from axios (code: 'ERR_BAD_RESPONSE'). */
function isServerError(err) {
    return (!!err &&
        typeof err === 'object' &&
        'code' in err &&
        typeof err.code === 'string' &&
        err.code === 'ERR_BAD_RESPONSE');
}
/** Add ±25% jitter to a delay value. */
function addJitter(ms) {
    return Math.max(0, ms + ms * 0.25 * (2 * Math.random() - 1));
}
function formatDelay(ms) {
    return ms >= 1000 ? "".concat((ms / 1000).toFixed(1), "s") : "".concat(Math.round(ms), "ms");
}
/**
 * Retry stopWork with exponential backoff (3 attempts, 1s/2s/4s).
 * Ensures the server learns the work item ended, preventing server-side zombies.
 */
function stopWorkWithRetry(api_1, environmentId_1, workId_1, logger_1) {
    return __awaiter(this, arguments, void 0, function (api, environmentId, workId, logger, baseDelayMs) {
        var MAX_ATTEMPTS, attempt, err_9, errMsg, delay;
        if (baseDelayMs === void 0) { baseDelayMs = 1000; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    MAX_ATTEMPTS = 3;
                    attempt = 1;
                    _a.label = 1;
                case 1:
                    if (!(attempt <= MAX_ATTEMPTS)) return [3 /*break*/, 9];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 8]);
                    return [4 /*yield*/, api.stopWork(environmentId, workId, false)];
                case 3:
                    _a.sent();
                    (0, debug_js_1.logForDebugging)("[bridge:work] stopWork succeeded for workId=".concat(workId, " on attempt ").concat(attempt, "/").concat(MAX_ATTEMPTS));
                    return [2 /*return*/];
                case 4:
                    err_9 = _a.sent();
                    // Auth/permission errors won't be fixed by retrying
                    if (err_9 instanceof bridgeApi_js_1.BridgeFatalError) {
                        if ((0, bridgeApi_js_1.isSuppressible403)(err_9)) {
                            (0, debug_js_1.logForDebugging)("[bridge:work] Suppressed stopWork 403 for ".concat(workId, ": ").concat(err_9.message));
                        }
                        else {
                            logger.logError("Failed to stop work ".concat(workId, ": ").concat(err_9.message));
                        }
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'bridge_stop_work_failed', {
                            attempts: attempt,
                            fatal: true,
                        });
                        return [2 /*return*/];
                    }
                    errMsg = (0, errors_js_1.errorMessage)(err_9);
                    if (!(attempt < MAX_ATTEMPTS)) return [3 /*break*/, 6];
                    delay = addJitter(baseDelayMs * Math.pow(2, attempt - 1));
                    logger.logVerbose("Failed to stop work ".concat(workId, " (attempt ").concat(attempt, "/").concat(MAX_ATTEMPTS, "), retrying in ").concat(formatDelay(delay), ": ").concat(errMsg));
                    return [4 /*yield*/, (0, sleep_js_1.sleep)(delay)];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 6:
                    logger.logError("Failed to stop work ".concat(workId, " after ").concat(MAX_ATTEMPTS, " attempts: ").concat(errMsg));
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'bridge_stop_work_failed', {
                        attempts: MAX_ATTEMPTS,
                    });
                    _a.label = 7;
                case 7: return [3 /*break*/, 8];
                case 8:
                    attempt++;
                    return [3 /*break*/, 1];
                case 9: return [2 /*return*/];
            }
        });
    });
}
function onSessionTimeout(sessionId, timeoutMs, logger, timedOutSessions, handle) {
    (0, debug_js_1.logForDebugging)("[bridge:session] sessionId=".concat(sessionId, " timed out after ").concat((0, bridgeStatusUtil_js_1.formatDuration)(timeoutMs)));
    (0, index_js_1.logEvent)('tengu_bridge_session_timeout', {
        timeout_ms: timeoutMs,
    });
    logger.logSessionFailed(sessionId, "Session timed out after ".concat((0, bridgeStatusUtil_js_1.formatDuration)(timeoutMs)));
    timedOutSessions.add(sessionId);
    handle.kill();
}
var SPAWN_FLAG_VALUES = ['session', 'same-dir', 'worktree'];
function parseSpawnValue(raw) {
    if (raw === 'session')
        return 'single-session';
    if (raw === 'same-dir')
        return 'same-dir';
    if (raw === 'worktree')
        return 'worktree';
    return "--spawn requires one of: ".concat(SPAWN_FLAG_VALUES.join(', '), " (got: ").concat(raw !== null && raw !== void 0 ? raw : '<missing>', ")");
}
function parseCapacityValue(raw) {
    var n = raw === undefined ? NaN : parseInt(raw, 10);
    if (isNaN(n) || n < 1) {
        return "--capacity requires a positive integer (got: ".concat(raw !== null && raw !== void 0 ? raw : '<missing>', ")");
    }
    return n;
}
function parseArgs(args) {
    var verbose = false;
    var sandbox = false;
    var debugFile;
    var sessionTimeoutMs;
    var permissionMode;
    var name;
    var help = false;
    var spawnMode;
    var capacity;
    var createSessionInDir;
    var sessionId;
    var continueSession = false;
    for (var i = 0; i < args.length; i++) {
        var arg = args[i];
        if (arg === '--help' || arg === '-h') {
            help = true;
        }
        else if (arg === '--verbose' || arg === '-v') {
            verbose = true;
        }
        else if (arg === '--sandbox') {
            sandbox = true;
        }
        else if (arg === '--no-sandbox') {
            sandbox = false;
        }
        else if (arg === '--debug-file' && i + 1 < args.length) {
            debugFile = (0, path_1.resolve)(args[++i]);
        }
        else if (arg.startsWith('--debug-file=')) {
            debugFile = (0, path_1.resolve)(arg.slice('--debug-file='.length));
        }
        else if (arg === '--session-timeout' && i + 1 < args.length) {
            sessionTimeoutMs = parseInt(args[++i], 10) * 1000;
        }
        else if (arg.startsWith('--session-timeout=')) {
            sessionTimeoutMs =
                parseInt(arg.slice('--session-timeout='.length), 10) * 1000;
        }
        else if (arg === '--permission-mode' && i + 1 < args.length) {
            permissionMode = args[++i];
        }
        else if (arg.startsWith('--permission-mode=')) {
            permissionMode = arg.slice('--permission-mode='.length);
        }
        else if (arg === '--name' && i + 1 < args.length) {
            name = args[++i];
        }
        else if (arg.startsWith('--name=')) {
            name = arg.slice('--name='.length);
        }
        else if ((0, bun_bundle_1.feature)('KAIROS') &&
            arg === '--session-id' &&
            i + 1 < args.length) {
            sessionId = args[++i];
            if (!sessionId) {
                return makeError('--session-id requires a value');
            }
        }
        else if ((0, bun_bundle_1.feature)('KAIROS') && arg.startsWith('--session-id=')) {
            sessionId = arg.slice('--session-id='.length);
            if (!sessionId) {
                return makeError('--session-id requires a value');
            }
        }
        else if ((0, bun_bundle_1.feature)('KAIROS') && (arg === '--continue' || arg === '-c')) {
            continueSession = true;
        }
        else if (arg === '--spawn' || arg.startsWith('--spawn=')) {
            if (spawnMode !== undefined) {
                return makeError('--spawn may only be specified once');
            }
            var raw = arg.startsWith('--spawn=')
                ? arg.slice('--spawn='.length)
                : args[++i];
            var v = parseSpawnValue(raw);
            if (v === 'single-session' || v === 'same-dir' || v === 'worktree') {
                spawnMode = v;
            }
            else {
                return makeError(v);
            }
        }
        else if (arg === '--capacity' || arg.startsWith('--capacity=')) {
            if (capacity !== undefined) {
                return makeError('--capacity may only be specified once');
            }
            var raw = arg.startsWith('--capacity=')
                ? arg.slice('--capacity='.length)
                : args[++i];
            var v = parseCapacityValue(raw);
            if (typeof v === 'number')
                capacity = v;
            else
                return makeError(v);
        }
        else if (arg === '--create-session-in-dir') {
            createSessionInDir = true;
        }
        else if (arg === '--no-create-session-in-dir') {
            createSessionInDir = false;
        }
        else {
            return makeError("Unknown argument: ".concat(arg, "\nRun 'claude remote-control --help' for usage."));
        }
    }
    // Note: gate check for --spawn/--capacity/--create-session-in-dir is in bridgeMain
    // (gate-aware error). Flag cross-validation happens here.
    // --capacity only makes sense for multi-session modes.
    if (spawnMode === 'single-session' && capacity !== undefined) {
        return makeError("--capacity cannot be used with --spawn=session (single-session mode has fixed capacity 1).");
    }
    // --session-id / --continue resume a specific session on its original
    // environment; incompatible with spawn-related flags (which configure
    // fresh session creation), and mutually exclusive with each other.
    if ((sessionId || continueSession) &&
        (spawnMode !== undefined ||
            capacity !== undefined ||
            createSessionInDir !== undefined)) {
        return makeError("--session-id and --continue cannot be used with --spawn, --capacity, or --create-session-in-dir.");
    }
    if (sessionId && continueSession) {
        return makeError("--session-id and --continue cannot be used together.");
    }
    return {
        verbose: verbose,
        sandbox: sandbox,
        debugFile: debugFile,
        sessionTimeoutMs: sessionTimeoutMs,
        permissionMode: permissionMode,
        name: name,
        spawnMode: spawnMode,
        capacity: capacity,
        createSessionInDir: createSessionInDir,
        sessionId: sessionId,
        continueSession: continueSession,
        help: help,
    };
    function makeError(error) {
        return {
            verbose: verbose,
            sandbox: sandbox,
            debugFile: debugFile,
            sessionTimeoutMs: sessionTimeoutMs,
            permissionMode: permissionMode,
            name: name,
            spawnMode: spawnMode,
            capacity: capacity,
            createSessionInDir: createSessionInDir,
            sessionId: sessionId,
            continueSession: continueSession,
            help: help,
            error: error,
        };
    }
}
function printHelp() {
    return __awaiter(this, void 0, void 0, function () {
        var EXTERNAL_PERMISSION_MODES, modes, showServer, serverOptions, serverDescription, serverNote, help;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('../types/permissions.js'); })];
                case 1:
                    EXTERNAL_PERMISSION_MODES = (_a.sent()).EXTERNAL_PERMISSION_MODES;
                    modes = EXTERNAL_PERMISSION_MODES.join(', ');
                    return [4 /*yield*/, isMultiSessionSpawnEnabled()];
                case 2:
                    showServer = _a.sent();
                    serverOptions = showServer
                        ? "  --spawn <mode>                   Spawn mode: same-dir, worktree, session\n                                   (default: same-dir)\n  --capacity <N>                   Max concurrent sessions in worktree or\n                                   same-dir mode (default: ".concat(SPAWN_SESSIONS_DEFAULT, ")\n  --[no-]create-session-in-dir     Pre-create a session in the current\n                                   directory; in worktree mode this session\n                                   stays in cwd while on-demand sessions get\n                                   isolated worktrees (default: on)\n")
                        : '';
                    serverDescription = showServer
                        ? "\n  Remote Control runs as a persistent server that accepts multiple concurrent\n  sessions in the current directory. One session is pre-created on start so\n  you have somewhere to type immediately. Use --spawn=worktree to isolate\n  each on-demand session in its own git worktree, or --spawn=session for\n  the classic single-session mode (exits when that session ends). Press 'w'\n  during runtime to toggle between same-dir and worktree.\n"
                        : '';
                    serverNote = showServer
                        ? "  - Worktree mode requires a git repository or WorktreeCreate/WorktreeRemove hooks\n"
                        : '';
                    help = "\nRemote Control - Connect your local environment to claude.ai/code\n\nUSAGE\n  claude remote-control [options]\nOPTIONS\n  --name <name>                    Name for the session (shown in claude.ai/code)\n".concat((0, bun_bundle_1.feature)('KAIROS')
                        ? "  -c, --continue                   Resume the last session in this directory\n  --session-id <id>                Resume a specific session by ID (cannot be\n                                   used with spawn flags or --continue)\n"
                        : '', "  --permission-mode <mode>         Permission mode for spawned sessions\n                                   (").concat(modes, ")\n  --debug-file <path>              Write debug logs to file\n  -v, --verbose                    Enable verbose output\n  -h, --help                       Show this help\n").concat(serverOptions, "\nDESCRIPTION\n  Remote Control allows you to control sessions on your local device from\n  claude.ai/code (https://claude.ai/code). Run this command in the\n  directory you want to work in, then connect from the Claude app or web.\n").concat(serverDescription, "\nNOTES\n  - You must be logged in with a Claude account that has a subscription\n  - Run `claude` first in the directory to accept the workspace trust dialog\n").concat(serverNote);
                    // biome-ignore lint/suspicious/noConsole: intentional help output
                    console.log(help);
                    return [2 /*return*/];
            }
        });
    });
}
var TITLE_MAX_LEN = 80;
/** Derive a session title from a user message: first line, truncated. */
function deriveSessionTitle(text) {
    // Collapse whitespace — newlines/tabs would break the single-line status display.
    var flat = text.replace(/\s+/g, ' ').trim();
    return (0, format_js_1.truncateToWidth)(flat, TITLE_MAX_LEN);
}
/**
 * One-shot fetch of a session's title via GET /v1/sessions/{id}.
 *
 * Uses `getBridgeSession` from createSession.ts (ccr-byoc headers + org UUID)
 * rather than the environments-level bridgeApi client, whose headers make the
 * Sessions API return 404. Returns undefined if the session has no title yet
 * or the fetch fails — the caller falls back to deriving a title from the
 * first user message.
 */
function fetchSessionTitle(compatSessionId, baseUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var getBridgeSession, session;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('./createSession.js'); })];
                case 1:
                    getBridgeSession = (_a.sent()).getBridgeSession;
                    return [4 /*yield*/, getBridgeSession(compatSessionId, { baseUrl: baseUrl })];
                case 2:
                    session = _a.sent();
                    return [2 /*return*/, (session === null || session === void 0 ? void 0 : session.title) || undefined];
            }
        });
    });
}
function bridgeMain(args) {
    return __awaiter(this, void 0, void 0, function () {
        var parsed, verbose, sandbox, debugFile, sessionTimeoutMs, permissionMode, name, parsedSpawnMode, parsedCapacity, parsedCreateSessionInDir, parsedSessionId, continueSession, resumeSessionId, resumePointerDir, usedMultiSessionFeature, PERMISSION_MODES, valid, dir, _a, enableConfigs, checkHasTrustDialogAccepted, initSinks, multiSessionEnabled, _b, setOriginalCwd, setCwdState, _c, clearOAuthTokenCache, checkAndRefreshOAuthTokenIfNeeded, _d, getBridgeAccessToken, getBridgeBaseUrl, bridgeToken, _e, getGlobalConfig, saveGlobalConfig, getCurrentProjectConfig, saveCurrentProjectConfig, readline, rl_1, answer, readBridgePointerAcrossWorktrees, found, pointer, pointerDir, ageMin, ageStr, fromWt, baseUrl, sessionIngressUrl, _f, getBranch, getRemoteUrl, findGitRoot, hasWorktreeCreateHook, worktreeAvailable, savedSpawnMode, readline, rl_2, answer, chosen_1, spawnModeSource, spawnMode, maxSessions, preCreateSession, clearBridgePointer, branch, gitRepoUrl, machineName, bridgeId, handleOAuth401Error, api, reuseEnvironmentId, getBridgeSession, session, clearBridgePointer, clearBridgePointer, config, environmentId, environmentSecret, reg, err_10, effectiveResumeSessionId, infraResumeId, reconnectCandidates, reconnected, lastReconnectErr, _i, reconnectCandidates_1, candidateId, err_11, err, isFatal, clearBridgePointer, startupPollConfig, spawner, logger, parseGitHubRepository, ownerRepo, repoName, toggleAvailable, onStdinData, controller, onSigint, onSigterm, initialSessionId, createBridgeSession, err_12, pointerRefreshTimer, writeBridgePointer, pointerPayload;
        var _this = this;
        var _g;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    parsed = parseArgs(args);
                    if (!parsed.help) return [3 /*break*/, 2];
                    return [4 /*yield*/, printHelp()];
                case 1:
                    _h.sent();
                    return [2 /*return*/];
                case 2:
                    if (parsed.error) {
                        // biome-ignore lint/suspicious/noConsole: intentional error output
                        console.error("Error: ".concat(parsed.error));
                        // eslint-disable-next-line custom-rules/no-process-exit
                        process.exit(1);
                    }
                    verbose = parsed.verbose, sandbox = parsed.sandbox, debugFile = parsed.debugFile, sessionTimeoutMs = parsed.sessionTimeoutMs, permissionMode = parsed.permissionMode, name = parsed.name, parsedSpawnMode = parsed.spawnMode, parsedCapacity = parsed.capacity, parsedCreateSessionInDir = parsed.createSessionInDir, parsedSessionId = parsed.sessionId, continueSession = parsed.continueSession;
                    resumeSessionId = parsedSessionId;
                    usedMultiSessionFeature = parsedSpawnMode !== undefined ||
                        parsedCapacity !== undefined ||
                        parsedCreateSessionInDir !== undefined;
                    if (!(permissionMode !== undefined)) return [3 /*break*/, 4];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../types/permissions.js'); })];
                case 3:
                    PERMISSION_MODES = (_h.sent()).PERMISSION_MODES;
                    valid = PERMISSION_MODES;
                    if (!valid.includes(permissionMode)) {
                        // biome-ignore lint/suspicious/noConsole: intentional error output
                        console.error("Error: Invalid permission mode '".concat(permissionMode, "'. Valid modes: ").concat(valid.join(', ')));
                        // eslint-disable-next-line custom-rules/no-process-exit
                        process.exit(1);
                    }
                    _h.label = 4;
                case 4:
                    dir = (0, path_1.resolve)('.');
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../utils/config.js'); })];
                case 5:
                    _a = _h.sent(), enableConfigs = _a.enableConfigs, checkHasTrustDialogAccepted = _a.checkHasTrustDialogAccepted;
                    enableConfigs();
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../utils/sinks.js'); })];
                case 6:
                    initSinks = (_h.sent()).initSinks;
                    initSinks();
                    return [4 /*yield*/, isMultiSessionSpawnEnabled()];
                case 7:
                    multiSessionEnabled = _h.sent();
                    if (!(usedMultiSessionFeature && !multiSessionEnabled)) return [3 /*break*/, 10];
                    return [4 /*yield*/, (0, index_js_1.logEventAsync)('tengu_bridge_multi_session_denied', {
                            used_spawn: parsedSpawnMode !== undefined,
                            used_capacity: parsedCapacity !== undefined,
                            used_create_session_in_dir: parsedCreateSessionInDir !== undefined,
                        })
                        // logEventAsync only enqueues — process.exit() discards buffered events.
                        // Flush explicitly, capped at 500ms to match gracefulShutdown.ts.
                        // (sleep() doesn't unref its timer, but process.exit() follows immediately
                        // so the ref'd timer can't delay shutdown.)
                    ];
                case 8:
                    _h.sent();
                    // logEventAsync only enqueues — process.exit() discards buffered events.
                    // Flush explicitly, capped at 500ms to match gracefulShutdown.ts.
                    // (sleep() doesn't unref its timer, but process.exit() follows immediately
                    // so the ref'd timer can't delay shutdown.)
                    return [4 /*yield*/, Promise.race([
                            Promise.all([(0, firstPartyEventLogger_js_1.shutdown1PEventLogging)(), (0, datadog_js_1.shutdownDatadog)()]),
                            (0, sleep_js_1.sleep)(500, undefined, { unref: true }),
                        ]).catch(function () { })
                        // biome-ignore lint/suspicious/noConsole: intentional error output
                    ];
                case 9:
                    // logEventAsync only enqueues — process.exit() discards buffered events.
                    // Flush explicitly, capped at 500ms to match gracefulShutdown.ts.
                    // (sleep() doesn't unref its timer, but process.exit() follows immediately
                    // so the ref'd timer can't delay shutdown.)
                    _h.sent();
                    // biome-ignore lint/suspicious/noConsole: intentional error output
                    console.error('Error: Multi-session Remote Control is not enabled for your account yet.');
                    // eslint-disable-next-line custom-rules/no-process-exit
                    process.exit(1);
                    _h.label = 10;
                case 10: return [4 /*yield*/, Promise.resolve().then(function () { return require('../bootstrap/state.js'); })];
                case 11:
                    _b = _h.sent(), setOriginalCwd = _b.setOriginalCwd, setCwdState = _b.setCwdState;
                    setOriginalCwd(dir);
                    setCwdState(dir);
                    // The bridge bypasses main.tsx (which renders the interactive TrustDialog via showSetupScreens),
                    // so we must verify trust was previously established by a normal `claude` session.
                    if (!checkHasTrustDialogAccepted()) {
                        // biome-ignore lint/suspicious/noConsole:: intentional console output
                        console.error("Error: Workspace not trusted. Please run `claude` in ".concat(dir, " first to review and accept the workspace trust dialog."));
                        // eslint-disable-next-line custom-rules/no-process-exit
                        process.exit(1);
                    }
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../utils/auth.js'); })];
                case 12:
                    _c = _h.sent(), clearOAuthTokenCache = _c.clearOAuthTokenCache, checkAndRefreshOAuthTokenIfNeeded = _c.checkAndRefreshOAuthTokenIfNeeded;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./bridgeConfig.js'); })];
                case 13:
                    _d = _h.sent(), getBridgeAccessToken = _d.getBridgeAccessToken, getBridgeBaseUrl = _d.getBridgeBaseUrl;
                    bridgeToken = getBridgeAccessToken();
                    if (!bridgeToken) {
                        // biome-ignore lint/suspicious/noConsole:: intentional console output
                        console.error(types_js_1.BRIDGE_LOGIN_ERROR);
                        // eslint-disable-next-line custom-rules/no-process-exit
                        process.exit(1);
                    }
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../utils/config.js'); })];
                case 14:
                    _e = _h.sent(), getGlobalConfig = _e.getGlobalConfig, saveGlobalConfig = _e.saveGlobalConfig, getCurrentProjectConfig = _e.getCurrentProjectConfig, saveCurrentProjectConfig = _e.saveCurrentProjectConfig;
                    if (!!getGlobalConfig().remoteDialogSeen) return [3 /*break*/, 17];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('readline'); })];
                case 15:
                    readline = _h.sent();
                    rl_1 = readline.createInterface({
                        input: process.stdin,
                        output: process.stdout,
                    });
                    // biome-ignore lint/suspicious/noConsole:: intentional console output
                    console.log('\nRemote Control lets you access this CLI session from the web (claude.ai/code)\nor the Claude app, so you can pick up where you left off on any device.\n\nYou can disconnect remote access anytime by running /remote-control again.\n');
                    return [4 /*yield*/, new Promise(function (resolve) {
                            rl_1.question('Enable Remote Control? (y/n) ', resolve);
                        })];
                case 16:
                    answer = _h.sent();
                    rl_1.close();
                    saveGlobalConfig(function (current) {
                        if (current.remoteDialogSeen)
                            return current;
                        return __assign(__assign({}, current), { remoteDialogSeen: true });
                    });
                    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
                        // eslint-disable-next-line custom-rules/no-process-exit
                        process.exit(0);
                    }
                    _h.label = 17;
                case 17:
                    if (!((0, bun_bundle_1.feature)('KAIROS') && continueSession)) return [3 /*break*/, 20];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./bridgePointer.js'); })];
                case 18:
                    readBridgePointerAcrossWorktrees = (_h.sent()).readBridgePointerAcrossWorktrees;
                    return [4 /*yield*/, readBridgePointerAcrossWorktrees(dir)];
                case 19:
                    found = _h.sent();
                    if (!found) {
                        // biome-ignore lint/suspicious/noConsole: intentional error output
                        console.error("Error: No recent session found in this directory or its worktrees. Run `claude remote-control` to start a new one.");
                        // eslint-disable-next-line custom-rules/no-process-exit
                        process.exit(1);
                    }
                    pointer = found.pointer, pointerDir = found.dir;
                    ageMin = Math.round(pointer.ageMs / 60000);
                    ageStr = ageMin < 60 ? "".concat(ageMin, "m") : "".concat(Math.round(ageMin / 60), "h");
                    fromWt = pointerDir !== dir ? " from worktree ".concat(pointerDir) : '';
                    // biome-ignore lint/suspicious/noConsole: intentional info output
                    console.error("Resuming session ".concat(pointer.sessionId, " (").concat(ageStr, " ago)").concat(fromWt, "\u2026"));
                    resumeSessionId = pointer.sessionId;
                    // Track where the pointer came from so the #20460 exit(1) paths below
                    // clear the RIGHT file on deterministic failure — otherwise --continue
                    // would keep hitting the same dead session. May be a worktree sibling.
                    resumePointerDir = pointerDir;
                    _h.label = 20;
                case 20:
                    baseUrl = getBridgeBaseUrl();
                    // For non-localhost targets, require HTTPS to protect credentials.
                    if (baseUrl.startsWith('http://') &&
                        !baseUrl.includes('localhost') &&
                        !baseUrl.includes('127.0.0.1')) {
                        // biome-ignore lint/suspicious/noConsole:: intentional console output
                        console.error('Error: Remote Control base URL uses HTTP. Only HTTPS or localhost HTTP is allowed.');
                        // eslint-disable-next-line custom-rules/no-process-exit
                        process.exit(1);
                    }
                    sessionIngressUrl = process.env.USER_TYPE === 'ant' &&
                        process.env.CLAUDE_BRIDGE_SESSION_INGRESS_URL
                        ? process.env.CLAUDE_BRIDGE_SESSION_INGRESS_URL
                        : baseUrl;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../utils/git.js'); })];
                case 21:
                    _f = _h.sent(), getBranch = _f.getBranch, getRemoteUrl = _f.getRemoteUrl, findGitRoot = _f.findGitRoot;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../utils/hooks.js'); })];
                case 22:
                    hasWorktreeCreateHook = (_h.sent()).hasWorktreeCreateHook;
                    worktreeAvailable = hasWorktreeCreateHook() || findGitRoot(dir) !== null;
                    savedSpawnMode = multiSessionEnabled
                        ? getCurrentProjectConfig().remoteControlSpawnMode
                        : undefined;
                    if (savedSpawnMode === 'worktree' && !worktreeAvailable) {
                        // biome-ignore lint/suspicious/noConsole: intentional warning output
                        console.error('Warning: Saved spawn mode is worktree but this directory is not a git repository. Falling back to same-dir.');
                        savedSpawnMode = undefined;
                        saveCurrentProjectConfig(function (current) {
                            if (current.remoteControlSpawnMode === undefined)
                                return current;
                            return __assign(__assign({}, current), { remoteControlSpawnMode: undefined });
                        });
                    }
                    if (!(multiSessionEnabled &&
                        !savedSpawnMode &&
                        worktreeAvailable &&
                        parsedSpawnMode === undefined &&
                        !resumeSessionId &&
                        process.stdin.isTTY)) return [3 /*break*/, 25];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('readline'); })];
                case 23:
                    readline = _h.sent();
                    rl_2 = readline.createInterface({
                        input: process.stdin,
                        output: process.stdout,
                    });
                    // biome-ignore lint/suspicious/noConsole: intentional dialog output
                    console.log("\nClaude Remote Control is launching in spawn mode which lets you create new sessions in this project from Claude Code on Web or your Mobile app. Learn more here: https://code.claude.com/docs/en/remote-control\n\n" +
                        "Spawn mode for this project:\n" +
                        "  [1] same-dir \u2014 sessions share the current directory (default)\n" +
                        "  [2] worktree \u2014 each session gets an isolated git worktree\n\n" +
                        "This can be changed later or explicitly set with --spawn=same-dir or --spawn=worktree.\n");
                    return [4 /*yield*/, new Promise(function (resolve) {
                            rl_2.question('Choose [1/2] (default: 1): ', resolve);
                        })];
                case 24:
                    answer = _h.sent();
                    rl_2.close();
                    chosen_1 = answer.trim() === '2' ? 'worktree' : 'same-dir';
                    savedSpawnMode = chosen_1;
                    (0, index_js_1.logEvent)('tengu_bridge_spawn_mode_chosen', {
                        spawn_mode: chosen_1,
                    });
                    saveCurrentProjectConfig(function (current) {
                        if (current.remoteControlSpawnMode === chosen_1)
                            return current;
                        return __assign(__assign({}, current), { remoteControlSpawnMode: chosen_1 });
                    });
                    _h.label = 25;
                case 25:
                    if (resumeSessionId) {
                        spawnMode = 'single-session';
                        spawnModeSource = 'resume';
                    }
                    else if (parsedSpawnMode !== undefined) {
                        spawnMode = parsedSpawnMode;
                        spawnModeSource = 'flag';
                    }
                    else if (savedSpawnMode !== undefined) {
                        spawnMode = savedSpawnMode;
                        spawnModeSource = 'saved';
                    }
                    else {
                        spawnMode = multiSessionEnabled ? 'same-dir' : 'single-session';
                        spawnModeSource = 'gate_default';
                    }
                    maxSessions = spawnMode === 'single-session'
                        ? 1
                        : (parsedCapacity !== null && parsedCapacity !== void 0 ? parsedCapacity : SPAWN_SESSIONS_DEFAULT);
                    preCreateSession = parsedCreateSessionInDir !== null && parsedCreateSessionInDir !== void 0 ? parsedCreateSessionInDir : true;
                    if (!!resumeSessionId) return [3 /*break*/, 28];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./bridgePointer.js'); })];
                case 26:
                    clearBridgePointer = (_h.sent()).clearBridgePointer;
                    return [4 /*yield*/, clearBridgePointer(dir)];
                case 27:
                    _h.sent();
                    _h.label = 28;
                case 28:
                    // Worktree mode requires either git or WorktreeCreate/WorktreeRemove hooks.
                    // Only reachable via explicit --spawn=worktree (default is same-dir);
                    // saved worktree pref was already guarded above.
                    if (spawnMode === 'worktree' && !worktreeAvailable) {
                        // biome-ignore lint/suspicious/noConsole: intentional error output
                        console.error("Error: Worktree mode requires a git repository or WorktreeCreate hooks configured. Use --spawn=session for single-session mode.");
                        // eslint-disable-next-line custom-rules/no-process-exit
                        process.exit(1);
                    }
                    return [4 /*yield*/, getBranch()];
                case 29:
                    branch = _h.sent();
                    return [4 /*yield*/, getRemoteUrl()];
                case 30:
                    gitRepoUrl = _h.sent();
                    machineName = (0, os_1.hostname)();
                    bridgeId = (0, crypto_1.randomUUID)();
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../utils/auth.js'); })];
                case 31:
                    handleOAuth401Error = (_h.sent()).handleOAuth401Error;
                    api = (0, bridgeApi_js_1.createBridgeApiClient)({
                        baseUrl: baseUrl,
                        getAccessToken: getBridgeAccessToken,
                        runnerVersion: MACRO.VERSION,
                        onDebug: debug_js_1.logForDebugging,
                        onAuth401: handleOAuth401Error,
                        getTrustedDeviceToken: trustedDevice_js_1.getTrustedDeviceToken,
                    });
                    if (!((0, bun_bundle_1.feature)('KAIROS') && resumeSessionId)) return [3 /*break*/, 43];
                    try {
                        (0, bridgeApi_js_1.validateBridgeId)(resumeSessionId, 'sessionId');
                    }
                    catch (_j) {
                        // biome-ignore lint/suspicious/noConsole: intentional error output
                        console.error("Error: Invalid session ID \"".concat(resumeSessionId, "\". Session IDs must not contain unsafe characters."));
                        // eslint-disable-next-line custom-rules/no-process-exit
                        process.exit(1);
                    }
                    // Proactively refresh the OAuth token — getBridgeSession uses raw axios
                    // without the withOAuthRetry 401-refresh logic. An expired-but-present
                    // token would otherwise produce a misleading "not found" error.
                    return [4 /*yield*/, checkAndRefreshOAuthTokenIfNeeded()];
                case 32:
                    // Proactively refresh the OAuth token — getBridgeSession uses raw axios
                    // without the withOAuthRetry 401-refresh logic. An expired-but-present
                    // token would otherwise produce a misleading "not found" error.
                    _h.sent();
                    clearOAuthTokenCache();
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./createSession.js'); })];
                case 33:
                    getBridgeSession = (_h.sent()).getBridgeSession;
                    return [4 /*yield*/, getBridgeSession(resumeSessionId, {
                            baseUrl: baseUrl,
                            getAccessToken: getBridgeAccessToken,
                        })];
                case 34:
                    session = _h.sent();
                    if (!!session) return [3 /*break*/, 38];
                    if (!resumePointerDir) return [3 /*break*/, 37];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./bridgePointer.js'); })];
                case 35:
                    clearBridgePointer = (_h.sent()).clearBridgePointer;
                    return [4 /*yield*/, clearBridgePointer(resumePointerDir)];
                case 36:
                    _h.sent();
                    _h.label = 37;
                case 37:
                    // biome-ignore lint/suspicious/noConsole: intentional error output
                    console.error("Error: Session ".concat(resumeSessionId, " not found. It may have been archived or expired, or your login may have lapsed (run `claude /login`)."));
                    // eslint-disable-next-line custom-rules/no-process-exit
                    process.exit(1);
                    _h.label = 38;
                case 38:
                    if (!!session.environment_id) return [3 /*break*/, 42];
                    if (!resumePointerDir) return [3 /*break*/, 41];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./bridgePointer.js'); })];
                case 39:
                    clearBridgePointer = (_h.sent()).clearBridgePointer;
                    return [4 /*yield*/, clearBridgePointer(resumePointerDir)];
                case 40:
                    _h.sent();
                    _h.label = 41;
                case 41:
                    // biome-ignore lint/suspicious/noConsole: intentional error output
                    console.error("Error: Session ".concat(resumeSessionId, " has no environment_id. It may never have been attached to a bridge."));
                    // eslint-disable-next-line custom-rules/no-process-exit
                    process.exit(1);
                    _h.label = 42;
                case 42:
                    reuseEnvironmentId = session.environment_id;
                    (0, debug_js_1.logForDebugging)("[bridge:init] Resuming session ".concat(resumeSessionId, " on environment ").concat(reuseEnvironmentId));
                    _h.label = 43;
                case 43:
                    config = {
                        dir: dir,
                        machineName: machineName,
                        branch: branch,
                        gitRepoUrl: gitRepoUrl,
                        maxSessions: maxSessions,
                        spawnMode: spawnMode,
                        verbose: verbose,
                        sandbox: sandbox,
                        bridgeId: bridgeId,
                        workerType: 'claude_code',
                        environmentId: (0, crypto_1.randomUUID)(),
                        reuseEnvironmentId: reuseEnvironmentId,
                        apiBaseUrl: baseUrl,
                        sessionIngressUrl: sessionIngressUrl,
                        debugFile: debugFile,
                        sessionTimeoutMs: sessionTimeoutMs,
                    };
                    (0, debug_js_1.logForDebugging)("[bridge:init] bridgeId=".concat(bridgeId).concat(reuseEnvironmentId ? " reuseEnvironmentId=".concat(reuseEnvironmentId) : '', " dir=").concat(dir, " branch=").concat(branch, " gitRepoUrl=").concat(gitRepoUrl, " machine=").concat(machineName));
                    (0, debug_js_1.logForDebugging)("[bridge:init] apiBaseUrl=".concat(baseUrl, " sessionIngressUrl=").concat(sessionIngressUrl));
                    (0, debug_js_1.logForDebugging)("[bridge:init] sandbox=".concat(sandbox).concat(debugFile ? " debugFile=".concat(debugFile) : ''));
                    _h.label = 44;
                case 44:
                    _h.trys.push([44, 46, , 47]);
                    return [4 /*yield*/, api.registerBridgeEnvironment(config)];
                case 45:
                    reg = _h.sent();
                    environmentId = reg.environment_id;
                    environmentSecret = reg.environment_secret;
                    return [3 /*break*/, 47];
                case 46:
                    err_10 = _h.sent();
                    (0, index_js_1.logEvent)('tengu_bridge_registration_failed', {
                        status: err_10 instanceof bridgeApi_js_1.BridgeFatalError ? err_10.status : undefined,
                    });
                    // Registration failures are fatal — print a clean message instead of a stack trace.
                    // biome-ignore lint/suspicious/noConsole:: intentional console output
                    console.error(err_10 instanceof bridgeApi_js_1.BridgeFatalError && err_10.status === 404
                        ? 'Remote Control environments are not available for your account.'
                        : "Error: ".concat((0, errors_js_1.errorMessage)(err_10)));
                    // eslint-disable-next-line custom-rules/no-process-exit
                    process.exit(1);
                    return [3 /*break*/, 47];
                case 47:
                    if (!((0, bun_bundle_1.feature)('KAIROS') && resumeSessionId)) return [3 /*break*/, 58];
                    if (!(reuseEnvironmentId && environmentId !== reuseEnvironmentId)) return [3 /*break*/, 48];
                    // Backend returned a different environment_id — the original env
                    // expired or was reaped. Reconnect won't work against the new env
                    // (session is bound to the old one). Log to sentry for visibility
                    // and fall through to fresh session creation on the new env.
                    (0, log_js_1.logError)(new Error("Bridge resume env mismatch: requested ".concat(reuseEnvironmentId, ", backend returned ").concat(environmentId, ". Falling back to fresh session.")));
                    // biome-ignore lint/suspicious/noConsole: intentional warning output
                    console.warn("Warning: Could not resume session ".concat(resumeSessionId, " \u2014 its environment has expired. Creating a fresh session instead."));
                    return [3 /*break*/, 58];
                case 48:
                    infraResumeId = (0, sessionIdCompat_js_1.toInfraSessionId)(resumeSessionId);
                    reconnectCandidates = infraResumeId === resumeSessionId
                        ? [resumeSessionId]
                        : [resumeSessionId, infraResumeId];
                    reconnected = false;
                    lastReconnectErr = void 0;
                    _i = 0, reconnectCandidates_1 = reconnectCandidates;
                    _h.label = 49;
                case 49:
                    if (!(_i < reconnectCandidates_1.length)) return [3 /*break*/, 54];
                    candidateId = reconnectCandidates_1[_i];
                    _h.label = 50;
                case 50:
                    _h.trys.push([50, 52, , 53]);
                    return [4 /*yield*/, api.reconnectSession(environmentId, candidateId)];
                case 51:
                    _h.sent();
                    (0, debug_js_1.logForDebugging)("[bridge:init] Session ".concat(candidateId, " re-queued via bridge/reconnect"));
                    effectiveResumeSessionId = resumeSessionId;
                    reconnected = true;
                    return [3 /*break*/, 54];
                case 52:
                    err_11 = _h.sent();
                    lastReconnectErr = err_11;
                    (0, debug_js_1.logForDebugging)("[bridge:init] reconnectSession(".concat(candidateId, ") failed: ").concat((0, errors_js_1.errorMessage)(err_11)));
                    return [3 /*break*/, 53];
                case 53:
                    _i++;
                    return [3 /*break*/, 49];
                case 54:
                    if (!!reconnected) return [3 /*break*/, 58];
                    err = lastReconnectErr;
                    isFatal = err instanceof bridgeApi_js_1.BridgeFatalError;
                    if (!(resumePointerDir && isFatal)) return [3 /*break*/, 57];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./bridgePointer.js'); })];
                case 55:
                    clearBridgePointer = (_h.sent()).clearBridgePointer;
                    return [4 /*yield*/, clearBridgePointer(resumePointerDir)];
                case 56:
                    _h.sent();
                    _h.label = 57;
                case 57:
                    // biome-ignore lint/suspicious/noConsole: intentional error output
                    console.error(isFatal
                        ? "Error: ".concat((0, errors_js_1.errorMessage)(err))
                        : "Error: Failed to reconnect session ".concat(resumeSessionId, ": ").concat((0, errors_js_1.errorMessage)(err), "\nThe session may still be resumable \u2014 try running the same command again."));
                    // eslint-disable-next-line custom-rules/no-process-exit
                    process.exit(1);
                    _h.label = 58;
                case 58:
                    (0, debug_js_1.logForDebugging)("[bridge:init] Registered, server environmentId=".concat(environmentId));
                    startupPollConfig = (0, pollConfig_js_1.getPollIntervalConfig)();
                    (0, index_js_1.logEvent)('tengu_bridge_started', {
                        max_sessions: config.maxSessions,
                        has_debug_file: !!config.debugFile,
                        sandbox: config.sandbox,
                        verbose: config.verbose,
                        heartbeat_interval_ms: startupPollConfig.non_exclusive_heartbeat_interval_ms,
                        spawn_mode: config.spawnMode,
                        spawn_mode_source: spawnModeSource,
                        multi_session_gate: multiSessionEnabled,
                        pre_create_session: preCreateSession,
                        worktree_available: worktreeAvailable,
                    });
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'bridge_started', {
                        max_sessions: config.maxSessions,
                        sandbox: config.sandbox,
                        spawn_mode: config.spawnMode,
                    });
                    spawner = (0, sessionRunner_js_1.createSessionSpawner)({
                        execPath: process.execPath,
                        scriptArgs: spawnScriptArgs(),
                        env: process.env,
                        verbose: verbose,
                        sandbox: sandbox,
                        debugFile: debugFile,
                        permissionMode: permissionMode,
                        onDebug: debug_js_1.logForDebugging,
                        onActivity: function (sessionId, activity) {
                            (0, debug_js_1.logForDebugging)("[bridge:activity] sessionId=".concat(sessionId, " ").concat(activity.type, " ").concat(activity.summary));
                        },
                        onPermissionRequest: function (sessionId, request, _accessToken) {
                            (0, debug_js_1.logForDebugging)("[bridge:perm] sessionId=".concat(sessionId, " tool=").concat(request.request.tool_name, " request_id=").concat(request.request_id, " (not auto-approving)"));
                        },
                    });
                    logger = (0, bridgeUI_js_1.createBridgeLogger)({ verbose: verbose });
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../utils/detectRepository.js'); })];
                case 59:
                    parseGitHubRepository = (_h.sent()).parseGitHubRepository;
                    ownerRepo = gitRepoUrl ? parseGitHubRepository(gitRepoUrl) : null;
                    repoName = ownerRepo ? ownerRepo.split('/').pop() : (0, path_1.basename)(dir);
                    logger.setRepoInfo(repoName, branch);
                    toggleAvailable = spawnMode !== 'single-session' && worktreeAvailable;
                    if (toggleAvailable) {
                        // Safe cast: spawnMode is not single-session (checked above), and the
                        // saved-worktree-in-non-git guard + exit check above ensure worktree
                        // is only reached when available.
                        logger.setSpawnModeDisplay(spawnMode);
                    }
                    onStdinData = function (data) {
                        if (data[0] === 0x03 || data[0] === 0x04) {
                            // Ctrl+C / Ctrl+D — trigger graceful shutdown
                            process.emit('SIGINT');
                            return;
                        }
                        if (data[0] === 0x20 /* space */) {
                            logger.toggleQr();
                            return;
                        }
                        if (data[0] === 0x77 /* 'w' */) {
                            if (!toggleAvailable)
                                return;
                            var newMode_1 = config.spawnMode === 'same-dir' ? 'worktree' : 'same-dir';
                            config.spawnMode = newMode_1;
                            (0, index_js_1.logEvent)('tengu_bridge_spawn_mode_toggled', {
                                spawn_mode: newMode_1,
                            });
                            logger.logStatus(newMode_1 === 'worktree'
                                ? 'Spawn mode: worktree (new sessions get isolated git worktrees)'
                                : 'Spawn mode: same-dir (new sessions share the current directory)');
                            logger.setSpawnModeDisplay(newMode_1);
                            logger.refreshDisplay();
                            saveCurrentProjectConfig(function (current) {
                                if (current.remoteControlSpawnMode === newMode_1)
                                    return current;
                                return __assign(__assign({}, current), { remoteControlSpawnMode: newMode_1 });
                            });
                            return;
                        }
                    };
                    if (process.stdin.isTTY) {
                        process.stdin.setRawMode(true);
                        process.stdin.resume();
                        process.stdin.on('data', onStdinData);
                    }
                    controller = new AbortController();
                    onSigint = function () {
                        (0, debug_js_1.logForDebugging)('[bridge:shutdown] SIGINT received, shutting down');
                        controller.abort();
                    };
                    onSigterm = function () {
                        (0, debug_js_1.logForDebugging)('[bridge:shutdown] SIGTERM received, shutting down');
                        controller.abort();
                    };
                    process.on('SIGINT', onSigint);
                    process.on('SIGTERM', onSigterm);
                    initialSessionId = (0, bun_bundle_1.feature)('KAIROS') && effectiveResumeSessionId
                        ? effectiveResumeSessionId
                        : null;
                    if (!(preCreateSession && !((0, bun_bundle_1.feature)('KAIROS') && effectiveResumeSessionId))) return [3 /*break*/, 64];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./createSession.js'); })];
                case 60:
                    createBridgeSession = (_h.sent()).createBridgeSession;
                    _h.label = 61;
                case 61:
                    _h.trys.push([61, 63, , 64]);
                    return [4 /*yield*/, createBridgeSession({
                            environmentId: environmentId,
                            title: name,
                            events: [],
                            gitRepoUrl: gitRepoUrl,
                            branch: branch,
                            signal: controller.signal,
                            baseUrl: baseUrl,
                            getAccessToken: getBridgeAccessToken,
                            permissionMode: permissionMode,
                        })];
                case 62:
                    initialSessionId = _h.sent();
                    if (initialSessionId) {
                        (0, debug_js_1.logForDebugging)("[bridge:init] Created initial session ".concat(initialSessionId));
                    }
                    return [3 /*break*/, 64];
                case 63:
                    err_12 = _h.sent();
                    (0, debug_js_1.logForDebugging)("[bridge:init] Session creation failed (non-fatal): ".concat((0, errors_js_1.errorMessage)(err_12)));
                    return [3 /*break*/, 64];
                case 64:
                    pointerRefreshTimer = null;
                    if (!(initialSessionId && spawnMode === 'single-session')) return [3 /*break*/, 67];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./bridgePointer.js'); })];
                case 65:
                    writeBridgePointer = (_h.sent()).writeBridgePointer;
                    pointerPayload = {
                        sessionId: initialSessionId,
                        environmentId: environmentId,
                        source: 'standalone',
                    };
                    return [4 /*yield*/, writeBridgePointer(config.dir, pointerPayload)];
                case 66:
                    _h.sent();
                    pointerRefreshTimer = setInterval(writeBridgePointer, 60 * 60 * 1000, config.dir, pointerPayload);
                    // Don't let the interval keep the process alive on its own.
                    (_g = pointerRefreshTimer.unref) === null || _g === void 0 ? void 0 : _g.call(pointerRefreshTimer);
                    _h.label = 67;
                case 67:
                    _h.trys.push([67, , 69, 70]);
                    return [4 /*yield*/, runBridgeLoop(config, environmentId, environmentSecret, api, spawner, logger, controller.signal, undefined, initialSessionId !== null && initialSessionId !== void 0 ? initialSessionId : undefined, function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        // Clear the memoized OAuth token cache so we re-read from secure
                                        // storage, picking up tokens refreshed by child processes.
                                        clearOAuthTokenCache();
                                        // Proactively refresh the token if it's expired on disk too.
                                        return [4 /*yield*/, checkAndRefreshOAuthTokenIfNeeded()];
                                    case 1:
                                        // Proactively refresh the token if it's expired on disk too.
                                        _a.sent();
                                        return [2 /*return*/, getBridgeAccessToken()];
                                }
                            });
                        }); })];
                case 68:
                    _h.sent();
                    return [3 /*break*/, 70];
                case 69:
                    if (pointerRefreshTimer !== null) {
                        clearInterval(pointerRefreshTimer);
                    }
                    process.off('SIGINT', onSigint);
                    process.off('SIGTERM', onSigterm);
                    process.stdin.off('data', onStdinData);
                    if (process.stdin.isTTY) {
                        process.stdin.setRawMode(false);
                    }
                    process.stdin.pause();
                    return [7 /*endfinally*/];
                case 70:
                    // The bridge bypasses init.ts (and its graceful shutdown handler), so we
                    // must exit explicitly.
                    // eslint-disable-next-line custom-rules/no-process-exit
                    process.exit(0);
                    return [2 /*return*/];
            }
        });
    });
}
// ─── Headless bridge (daemon worker) ────────────────────────────────────────
/**
 * Thrown by runBridgeHeadless for configuration issues the supervisor should
 * NOT retry (trust not accepted, worktree unavailable, http-not-https). The
 * daemon worker catches this and exits with EXIT_CODE_PERMANENT so the
 * supervisor parks the worker instead of respawning it on backoff.
 */
var BridgeHeadlessPermanentError = /** @class */ (function (_super) {
    __extends(BridgeHeadlessPermanentError, _super);
    function BridgeHeadlessPermanentError(message) {
        var _this = _super.call(this, message) || this;
        _this.name = 'BridgeHeadlessPermanentError';
        return _this;
    }
    return BridgeHeadlessPermanentError;
}(Error));
exports.BridgeHeadlessPermanentError = BridgeHeadlessPermanentError;
/**
 * Non-interactive bridge entrypoint for the `remoteControl` daemon worker.
 *
 * Linear subset of bridgeMain(): no readline dialogs, no stdin key handlers,
 * no TUI, no process.exit(). Config comes from the caller (daemon.json), auth
 * comes via IPC (supervisor's AuthManager), logs go to the worker's stdout
 * pipe. Throws on fatal errors — the worker catches and maps permanent vs
 * transient to the right exit code.
 *
 * Resolves cleanly when `signal` aborts and the poll loop tears down.
 */
function runBridgeHeadless(opts, signal) {
    return __awaiter(this, void 0, void 0, function () {
        var dir, log, _a, setOriginalCwd, setCwdState, _b, enableConfigs, checkHasTrustDialogAccepted, initSinks, getBridgeBaseUrl, baseUrl, sessionIngressUrl, _c, getBranch, getRemoteUrl, findGitRoot, hasWorktreeCreateHook, worktreeAvailable, branch, gitRepoUrl, machineName, bridgeId, config, api, environmentId, environmentSecret, reg, err_13, spawner, logger, initialSessionId, createBridgeSession, sid, err_14;
        var _this = this;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    dir = opts.dir, log = opts.log;
                    // Worker inherits the supervisor's CWD. chdir first so git utilities
                    // (getBranch/getRemoteUrl) — which read from bootstrap CWD state set
                    // below — resolve against the right repo.
                    process.chdir(dir);
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../bootstrap/state.js'); })];
                case 1:
                    _a = _d.sent(), setOriginalCwd = _a.setOriginalCwd, setCwdState = _a.setCwdState;
                    setOriginalCwd(dir);
                    setCwdState(dir);
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../utils/config.js'); })];
                case 2:
                    _b = _d.sent(), enableConfigs = _b.enableConfigs, checkHasTrustDialogAccepted = _b.checkHasTrustDialogAccepted;
                    enableConfigs();
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../utils/sinks.js'); })];
                case 3:
                    initSinks = (_d.sent()).initSinks;
                    initSinks();
                    if (!checkHasTrustDialogAccepted()) {
                        throw new BridgeHeadlessPermanentError("Workspace not trusted: ".concat(dir, ". Run `claude` in that directory first to accept the trust dialog."));
                    }
                    if (!opts.getAccessToken()) {
                        // Transient — supervisor's AuthManager may pick up a token on next cycle.
                        throw new Error(types_js_1.BRIDGE_LOGIN_ERROR);
                    }
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./bridgeConfig.js'); })];
                case 4:
                    getBridgeBaseUrl = (_d.sent()).getBridgeBaseUrl;
                    baseUrl = getBridgeBaseUrl();
                    if (baseUrl.startsWith('http://') &&
                        !baseUrl.includes('localhost') &&
                        !baseUrl.includes('127.0.0.1')) {
                        throw new BridgeHeadlessPermanentError('Remote Control base URL uses HTTP. Only HTTPS or localhost HTTP is allowed.');
                    }
                    sessionIngressUrl = process.env.USER_TYPE === 'ant' &&
                        process.env.CLAUDE_BRIDGE_SESSION_INGRESS_URL
                        ? process.env.CLAUDE_BRIDGE_SESSION_INGRESS_URL
                        : baseUrl;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../utils/git.js'); })];
                case 5:
                    _c = _d.sent(), getBranch = _c.getBranch, getRemoteUrl = _c.getRemoteUrl, findGitRoot = _c.findGitRoot;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../utils/hooks.js'); })];
                case 6:
                    hasWorktreeCreateHook = (_d.sent()).hasWorktreeCreateHook;
                    if (opts.spawnMode === 'worktree') {
                        worktreeAvailable = hasWorktreeCreateHook() || findGitRoot(dir) !== null;
                        if (!worktreeAvailable) {
                            throw new BridgeHeadlessPermanentError("Worktree mode requires a git repository or WorktreeCreate hooks. Directory ".concat(dir, " has neither."));
                        }
                    }
                    return [4 /*yield*/, getBranch()];
                case 7:
                    branch = _d.sent();
                    return [4 /*yield*/, getRemoteUrl()];
                case 8:
                    gitRepoUrl = _d.sent();
                    machineName = (0, os_1.hostname)();
                    bridgeId = (0, crypto_1.randomUUID)();
                    config = {
                        dir: dir,
                        machineName: machineName,
                        branch: branch,
                        gitRepoUrl: gitRepoUrl,
                        maxSessions: opts.capacity,
                        spawnMode: opts.spawnMode,
                        verbose: false,
                        sandbox: opts.sandbox,
                        bridgeId: bridgeId,
                        workerType: 'claude_code',
                        environmentId: (0, crypto_1.randomUUID)(),
                        apiBaseUrl: baseUrl,
                        sessionIngressUrl: sessionIngressUrl,
                        sessionTimeoutMs: opts.sessionTimeoutMs,
                    };
                    api = (0, bridgeApi_js_1.createBridgeApiClient)({
                        baseUrl: baseUrl,
                        getAccessToken: opts.getAccessToken,
                        runnerVersion: MACRO.VERSION,
                        onDebug: log,
                        onAuth401: opts.onAuth401,
                        getTrustedDeviceToken: trustedDevice_js_1.getTrustedDeviceToken,
                    });
                    _d.label = 9;
                case 9:
                    _d.trys.push([9, 11, , 12]);
                    return [4 /*yield*/, api.registerBridgeEnvironment(config)];
                case 10:
                    reg = _d.sent();
                    environmentId = reg.environment_id;
                    environmentSecret = reg.environment_secret;
                    return [3 /*break*/, 12];
                case 11:
                    err_13 = _d.sent();
                    // Transient — let supervisor backoff-retry.
                    throw new Error("Bridge registration failed: ".concat((0, errors_js_1.errorMessage)(err_13)));
                case 12:
                    spawner = (0, sessionRunner_js_1.createSessionSpawner)({
                        execPath: process.execPath,
                        scriptArgs: spawnScriptArgs(),
                        env: process.env,
                        verbose: false,
                        sandbox: opts.sandbox,
                        permissionMode: opts.permissionMode,
                        onDebug: log,
                    });
                    logger = createHeadlessBridgeLogger(log);
                    logger.printBanner(config, environmentId);
                    if (!opts.createSessionOnStart) return [3 /*break*/, 17];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./createSession.js'); })];
                case 13:
                    createBridgeSession = (_d.sent()).createBridgeSession;
                    _d.label = 14;
                case 14:
                    _d.trys.push([14, 16, , 17]);
                    return [4 /*yield*/, createBridgeSession({
                            environmentId: environmentId,
                            title: opts.name,
                            events: [],
                            gitRepoUrl: gitRepoUrl,
                            branch: branch,
                            signal: signal,
                            baseUrl: baseUrl,
                            getAccessToken: opts.getAccessToken,
                            permissionMode: opts.permissionMode,
                        })];
                case 15:
                    sid = _d.sent();
                    if (sid) {
                        initialSessionId = sid;
                        log("created initial session ".concat(sid));
                    }
                    return [3 /*break*/, 17];
                case 16:
                    err_14 = _d.sent();
                    log("session pre-creation failed (non-fatal): ".concat((0, errors_js_1.errorMessage)(err_14)));
                    return [3 /*break*/, 17];
                case 17: return [4 /*yield*/, runBridgeLoop(config, environmentId, environmentSecret, api, spawner, logger, signal, undefined, initialSessionId, function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/, opts.getAccessToken()];
                    }); }); })];
                case 18:
                    _d.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/** BridgeLogger adapter that routes everything to a single line-log fn. */
function createHeadlessBridgeLogger(log) {
    var noop = function () { };
    return {
        printBanner: function (cfg, envId) {
            return log("registered environmentId=".concat(envId, " dir=").concat(cfg.dir, " spawnMode=").concat(cfg.spawnMode, " capacity=").concat(cfg.maxSessions));
        },
        logSessionStart: function (id, _prompt) { return log("session start ".concat(id)); },
        logSessionComplete: function (id, ms) { return log("session complete ".concat(id, " (").concat(ms, "ms)")); },
        logSessionFailed: function (id, err) { return log("session failed ".concat(id, ": ").concat(err)); },
        logStatus: log,
        logVerbose: log,
        logError: function (s) { return log("error: ".concat(s)); },
        logReconnected: function (ms) { return log("reconnected after ".concat(ms, "ms")); },
        addSession: function (id, _url) { return log("session attached ".concat(id)); },
        removeSession: function (id) { return log("session detached ".concat(id)); },
        updateIdleStatus: noop,
        updateReconnectingStatus: noop,
        updateSessionStatus: noop,
        updateSessionActivity: noop,
        updateSessionCount: noop,
        updateFailedStatus: noop,
        setSpawnModeDisplay: noop,
        setRepoInfo: noop,
        setDebugLogPath: noop,
        setAttached: noop,
        setSessionTitle: noop,
        clearStatus: noop,
        toggleQr: noop,
        refreshDisplay: noop,
    };
}
