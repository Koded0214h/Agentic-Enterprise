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
exports.decodeJwtPayload = decodeJwtPayload;
exports.decodeJwtExpiry = decodeJwtExpiry;
exports.createTokenRefreshScheduler = createTokenRefreshScheduler;
var index_js_1 = require("../services/analytics/index.js");
var debug_js_1 = require("../utils/debug.js");
var diagLogs_js_1 = require("../utils/diagLogs.js");
var errors_js_1 = require("../utils/errors.js");
var slowOperations_js_1 = require("../utils/slowOperations.js");
/** Format a millisecond duration as a human-readable string (e.g. "5m 30s"). */
function formatDuration(ms) {
    if (ms < 60000)
        return "".concat(Math.round(ms / 1000), "s");
    var m = Math.floor(ms / 60000);
    var s = Math.round((ms % 60000) / 1000);
    return s > 0 ? "".concat(m, "m ").concat(s, "s") : "".concat(m, "m");
}
/**
 * Decode a JWT's payload segment without verifying the signature.
 * Strips the `sk-ant-si-` session-ingress prefix if present.
 * Returns the parsed JSON payload as `unknown`, or `null` if the
 * token is malformed or the payload is not valid JSON.
 */
function decodeJwtPayload(token) {
    var jwt = token.startsWith('sk-ant-si-')
        ? token.slice('sk-ant-si-'.length)
        : token;
    var parts = jwt.split('.');
    if (parts.length !== 3 || !parts[1])
        return null;
    try {
        return (0, slowOperations_js_1.jsonParse)(Buffer.from(parts[1], 'base64url').toString('utf8'));
    }
    catch (_a) {
        return null;
    }
}
/**
 * Decode the `exp` (expiry) claim from a JWT without verifying the signature.
 * @returns The `exp` value in Unix seconds, or `null` if unparseable
 */
function decodeJwtExpiry(token) {
    var payload = decodeJwtPayload(token);
    if (payload !== null &&
        typeof payload === 'object' &&
        'exp' in payload &&
        typeof payload.exp === 'number') {
        return payload.exp;
    }
    return null;
}
/** Refresh buffer: request a new token before expiry. */
var TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;
/** Fallback refresh interval when the new token's expiry is unknown. */
var FALLBACK_REFRESH_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
/** Max consecutive failures before giving up on the refresh chain. */
var MAX_REFRESH_FAILURES = 3;
/** Retry delay when getAccessToken returns undefined. */
var REFRESH_RETRY_DELAY_MS = 60000;
/**
 * Creates a token refresh scheduler that proactively refreshes session tokens
 * before they expire. Used by both the standalone bridge and the REPL bridge.
 *
 * When a token is about to expire, the scheduler calls `onRefresh` with the
 * session ID and the bridge's OAuth access token. The caller is responsible
 * for delivering the token to the appropriate transport (child process stdin
 * for standalone bridge, WebSocket reconnect for REPL bridge).
 */
function createTokenRefreshScheduler(_a) {
    var getAccessToken = _a.getAccessToken, onRefresh = _a.onRefresh, label = _a.label, _b = _a.refreshBufferMs, refreshBufferMs = _b === void 0 ? TOKEN_REFRESH_BUFFER_MS : _b;
    var timers = new Map();
    var failureCounts = new Map();
    // Generation counter per session — incremented by schedule() and cancel()
    // so that in-flight async doRefresh() calls can detect when they've been
    // superseded and should skip setting follow-up timers.
    var generations = new Map();
    function nextGeneration(sessionId) {
        var _a;
        var gen = ((_a = generations.get(sessionId)) !== null && _a !== void 0 ? _a : 0) + 1;
        generations.set(sessionId, gen);
        return gen;
    }
    function schedule(sessionId, token) {
        var expiry = decodeJwtExpiry(token);
        if (!expiry) {
            // Token is not a decodable JWT (e.g. an OAuth token passed from the
            // REPL bridge WebSocket open handler).  Preserve any existing timer
            // (such as the follow-up refresh set by doRefresh) so the refresh
            // chain is not broken.
            (0, debug_js_1.logForDebugging)("[".concat(label, ":token] Could not decode JWT expiry for sessionId=").concat(sessionId, ", token prefix=").concat(token.slice(0, 15), "\u2026, keeping existing timer"));
            return;
        }
        // Clear any existing refresh timer — we have a concrete expiry to replace it.
        var existing = timers.get(sessionId);
        if (existing) {
            clearTimeout(existing);
        }
        // Bump generation to invalidate any in-flight async doRefresh.
        var gen = nextGeneration(sessionId);
        var expiryDate = new Date(expiry * 1000).toISOString();
        var delayMs = expiry * 1000 - Date.now() - refreshBufferMs;
        if (delayMs <= 0) {
            (0, debug_js_1.logForDebugging)("[".concat(label, ":token] Token for sessionId=").concat(sessionId, " expires=").concat(expiryDate, " (past or within buffer), refreshing immediately"));
            void doRefresh(sessionId, gen);
            return;
        }
        (0, debug_js_1.logForDebugging)("[".concat(label, ":token] Scheduled token refresh for sessionId=").concat(sessionId, " in ").concat(formatDuration(delayMs), " (expires=").concat(expiryDate, ", buffer=").concat(refreshBufferMs / 1000, "s)"));
        var timer = setTimeout(doRefresh, delayMs, sessionId, gen);
        timers.set(sessionId, timer);
    }
    /**
     * Schedule refresh using an explicit TTL (seconds until expiry) rather
     * than decoding a JWT's exp claim. Used by callers whose JWT is opaque
     * (e.g. POST /v1/code/sessions/{id}/bridge returns expires_in directly).
     */
    function scheduleFromExpiresIn(sessionId, expiresInSeconds) {
        var existing = timers.get(sessionId);
        if (existing)
            clearTimeout(existing);
        var gen = nextGeneration(sessionId);
        // Clamp to 30s floor — if refreshBufferMs exceeds the server's expires_in
        // (e.g. very large buffer for frequent-refresh testing, or server shortens
        // expires_in unexpectedly), unclamped delayMs ≤ 0 would tight-loop.
        var delayMs = Math.max(expiresInSeconds * 1000 - refreshBufferMs, 30000);
        (0, debug_js_1.logForDebugging)("[".concat(label, ":token] Scheduled token refresh for sessionId=").concat(sessionId, " in ").concat(formatDuration(delayMs), " (expires_in=").concat(expiresInSeconds, "s, buffer=").concat(refreshBufferMs / 1000, "s)"));
        var timer = setTimeout(doRefresh, delayMs, sessionId, gen);
        timers.set(sessionId, timer);
    }
    function doRefresh(sessionId, gen) {
        return __awaiter(this, void 0, void 0, function () {
            var oauthToken, err_1, failures, retryTimer, timer;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, getAccessToken()];
                    case 1:
                        oauthToken = _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        err_1 = _b.sent();
                        (0, debug_js_1.logForDebugging)("[".concat(label, ":token] getAccessToken threw for sessionId=").concat(sessionId, ": ").concat((0, errors_js_1.errorMessage)(err_1)), { level: 'error' });
                        return [3 /*break*/, 3];
                    case 3:
                        // If the session was cancelled or rescheduled while we were awaiting,
                        // the generation will have changed — bail out to avoid orphaned timers.
                        if (generations.get(sessionId) !== gen) {
                            (0, debug_js_1.logForDebugging)("[".concat(label, ":token] doRefresh for sessionId=").concat(sessionId, " stale (gen ").concat(gen, " vs ").concat(generations.get(sessionId), "), skipping"));
                            return [2 /*return*/];
                        }
                        if (!oauthToken) {
                            failures = ((_a = failureCounts.get(sessionId)) !== null && _a !== void 0 ? _a : 0) + 1;
                            failureCounts.set(sessionId, failures);
                            (0, debug_js_1.logForDebugging)("[".concat(label, ":token] No OAuth token available for refresh, sessionId=").concat(sessionId, " (failure ").concat(failures, "/").concat(MAX_REFRESH_FAILURES, ")"), { level: 'error' });
                            (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'bridge_token_refresh_no_oauth');
                            // Schedule a retry so the refresh chain can recover if the token
                            // becomes available again (e.g. transient cache clear during refresh).
                            // Cap retries to avoid spamming on genuine failures.
                            if (failures < MAX_REFRESH_FAILURES) {
                                retryTimer = setTimeout(doRefresh, REFRESH_RETRY_DELAY_MS, sessionId, gen);
                                timers.set(sessionId, retryTimer);
                            }
                            return [2 /*return*/];
                        }
                        // Reset failure counter on successful token retrieval
                        failureCounts.delete(sessionId);
                        (0, debug_js_1.logForDebugging)("[".concat(label, ":token] Refreshing token for sessionId=").concat(sessionId, ": new token prefix=").concat(oauthToken.slice(0, 15), "\u2026"));
                        (0, index_js_1.logEvent)('tengu_bridge_token_refreshed', {});
                        onRefresh(sessionId, oauthToken);
                        timer = setTimeout(doRefresh, FALLBACK_REFRESH_INTERVAL_MS, sessionId, gen);
                        timers.set(sessionId, timer);
                        (0, debug_js_1.logForDebugging)("[".concat(label, ":token] Scheduled follow-up refresh for sessionId=").concat(sessionId, " in ").concat(formatDuration(FALLBACK_REFRESH_INTERVAL_MS)));
                        return [2 /*return*/];
                }
            });
        });
    }
    function cancel(sessionId) {
        // Bump generation to invalidate any in-flight async doRefresh.
        nextGeneration(sessionId);
        var timer = timers.get(sessionId);
        if (timer) {
            clearTimeout(timer);
            timers.delete(sessionId);
        }
        failureCounts.delete(sessionId);
    }
    function cancelAll() {
        // Bump all generations so in-flight doRefresh calls are invalidated.
        for (var _i = 0, _a = generations.keys(); _i < _a.length; _i++) {
            var sessionId = _a[_i];
            nextGeneration(sessionId);
        }
        for (var _b = 0, _c = timers.values(); _b < _c.length; _b++) {
            var timer = _c[_b];
            clearTimeout(timer);
        }
        timers.clear();
        failureCounts.clear();
    }
    return { schedule: schedule, scheduleFromExpiresIn: scheduleFromExpiresIn, cancel: cancel, cancelAll: cancelAll };
}
