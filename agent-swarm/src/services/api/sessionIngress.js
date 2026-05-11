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
exports.appendSessionLog = appendSessionLog;
exports.getSessionLogs = getSessionLogs;
exports.getSessionLogsViaOAuth = getSessionLogsViaOAuth;
exports.getTeleportEvents = getTeleportEvents;
exports.clearSession = clearSession;
exports.clearAllSessions = clearAllSessions;
var axios_1 = require("axios");
var oauth_js_1 = require("../../constants/oauth.js");
var debug_js_1 = require("../../utils/debug.js");
var diagLogs_js_1 = require("../../utils/diagLogs.js");
var envUtils_js_1 = require("../../utils/envUtils.js");
var log_js_1 = require("../../utils/log.js");
var sequential_js_1 = require("../../utils/sequential.js");
var sessionIngressAuth_js_1 = require("../../utils/sessionIngressAuth.js");
var sleep_js_1 = require("../../utils/sleep.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var api_js_1 = require("../../utils/teleport/api.js");
// Module-level state
var lastUuidMap = new Map();
var MAX_RETRIES = 10;
var BASE_DELAY_MS = 500;
// Per-session sequential wrappers to prevent concurrent log writes
var sequentialAppendBySession = new Map();
/**
 * Gets or creates a sequential wrapper for a session
 * This ensures that log appends for a session are processed one at a time
 */
function getOrCreateSequentialAppend(sessionId) {
    var _this = this;
    var sequentialAppend = sequentialAppendBySession.get(sessionId);
    if (!sequentialAppend) {
        sequentialAppend = (0, sequential_js_1.sequential)(function (entry, url, headers) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, appendSessionLogImpl(sessionId, entry, url, headers)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        }); }); });
        sequentialAppendBySession.set(sessionId, sequentialAppend);
    }
    return sequentialAppend;
}
/**
 * Internal implementation of appendSessionLog with retry logic
 * Retries on transient errors (network, 5xx, 429). On 409, adopts the server's
 * last UUID and retries (handles stale state from killed process's in-flight
 * requests). Fails immediately on 401.
 */
function appendSessionLogImpl(sessionId, entry, url, headers) {
    return __awaiter(this, void 0, void 0, function () {
        var attempt, lastUuid, requestHeaders, response, serverLastUuid, logs, adoptedUuid, errorData, errorMessage, error_1, axiosError, delayMs;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    attempt = 1;
                    _b.label = 1;
                case 1:
                    if (!(attempt <= MAX_RETRIES)) return [3 /*break*/, 12];
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 8, , 9]);
                    lastUuid = lastUuidMap.get(sessionId);
                    requestHeaders = __assign({}, headers);
                    if (lastUuid) {
                        requestHeaders['Last-Uuid'] = lastUuid;
                    }
                    return [4 /*yield*/, axios_1.default.put(url, entry, {
                            headers: requestHeaders,
                            validateStatus: function (status) { return status < 500; },
                        })];
                case 3:
                    response = _b.sent();
                    if (response.status === 200 || response.status === 201) {
                        lastUuidMap.set(sessionId, entry.uuid);
                        (0, debug_js_1.logForDebugging)("Successfully persisted session log entry for session ".concat(sessionId));
                        return [2 /*return*/, true];
                    }
                    if (!(response.status === 409)) return [3 /*break*/, 7];
                    serverLastUuid = response.headers['x-last-uuid'];
                    if (serverLastUuid === entry.uuid) {
                        // Our entry IS the last entry on server - it was stored successfully previously
                        lastUuidMap.set(sessionId, entry.uuid);
                        (0, debug_js_1.logForDebugging)("Session entry ".concat(entry.uuid, " already present on server, recovering from stale state"));
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'session_persist_recovered_from_409');
                        return [2 /*return*/, true];
                    }
                    if (!serverLastUuid) return [3 /*break*/, 4];
                    lastUuidMap.set(sessionId, serverLastUuid);
                    (0, debug_js_1.logForDebugging)("Session 409: adopting server lastUuid=".concat(serverLastUuid, " from header, retrying entry ").concat(entry.uuid));
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, fetchSessionLogsFromUrl(sessionId, url, headers)];
                case 5:
                    logs = _b.sent();
                    adoptedUuid = findLastUuid(logs);
                    if (adoptedUuid) {
                        lastUuidMap.set(sessionId, adoptedUuid);
                        (0, debug_js_1.logForDebugging)("Session 409: re-fetched ".concat(logs.length, " entries, adopting lastUuid=").concat(adoptedUuid, ", retrying entry ").concat(entry.uuid));
                    }
                    else {
                        errorData = response.data;
                        errorMessage = ((_a = errorData.error) === null || _a === void 0 ? void 0 : _a.message) || 'Concurrent modification detected';
                        (0, log_js_1.logError)(new Error("Session persistence conflict: UUID mismatch for session ".concat(sessionId, ", entry ").concat(entry.uuid, ". ").concat(errorMessage)));
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'session_persist_fail_concurrent_modification');
                        return [2 /*return*/, false];
                    }
                    _b.label = 6;
                case 6:
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'session_persist_409_adopt_server_uuid');
                    return [3 /*break*/, 11]; // retry with updated lastUuid
                case 7:
                    if (response.status === 401) {
                        (0, debug_js_1.logForDebugging)('Session token expired or invalid');
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'session_persist_fail_bad_token');
                        return [2 /*return*/, false]; // Non-retryable
                    }
                    // Other 4xx (429, etc.) - retryable
                    (0, debug_js_1.logForDebugging)("Failed to persist session log: ".concat(response.status, " ").concat(response.statusText));
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'session_persist_fail_status', {
                        status: response.status,
                        attempt: attempt,
                    });
                    return [3 /*break*/, 9];
                case 8:
                    error_1 = _b.sent();
                    axiosError = error_1;
                    (0, log_js_1.logError)(new Error("Error persisting session log: ".concat(axiosError.message)));
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'session_persist_fail_status', {
                        status: axiosError.status,
                        attempt: attempt,
                    });
                    return [3 /*break*/, 9];
                case 9:
                    if (attempt === MAX_RETRIES) {
                        (0, debug_js_1.logForDebugging)("Remote persistence failed after ".concat(MAX_RETRIES, " attempts"));
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'session_persist_error_retries_exhausted', { attempt: attempt });
                        return [2 /*return*/, false];
                    }
                    delayMs = Math.min(BASE_DELAY_MS * Math.pow(2, attempt - 1), 8000);
                    (0, debug_js_1.logForDebugging)("Remote persistence attempt ".concat(attempt, "/").concat(MAX_RETRIES, " failed, retrying in ").concat(delayMs, "ms\u2026"));
                    return [4 /*yield*/, (0, sleep_js_1.sleep)(delayMs)];
                case 10:
                    _b.sent();
                    _b.label = 11;
                case 11:
                    attempt++;
                    return [3 /*break*/, 1];
                case 12: return [2 /*return*/, false];
            }
        });
    });
}
/**
 * Append a log entry to the session using JWT token
 * Uses optimistic concurrency control with Last-Uuid header
 * Ensures sequential execution per session to prevent race conditions
 */
function appendSessionLog(sessionId, entry, url) {
    return __awaiter(this, void 0, void 0, function () {
        var sessionToken, headers, sequentialAppend;
        return __generator(this, function (_a) {
            sessionToken = (0, sessionIngressAuth_js_1.getSessionIngressAuthToken)();
            if (!sessionToken) {
                (0, debug_js_1.logForDebugging)('No session token available for session persistence');
                (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'session_persist_fail_jwt_no_token');
                return [2 /*return*/, false];
            }
            headers = {
                Authorization: "Bearer ".concat(sessionToken),
                'Content-Type': 'application/json',
            };
            sequentialAppend = getOrCreateSequentialAppend(sessionId);
            return [2 /*return*/, sequentialAppend(entry, url, headers)];
        });
    });
}
/**
 * Get all session logs for hydration
 */
function getSessionLogs(sessionId, url) {
    return __awaiter(this, void 0, void 0, function () {
        var sessionToken, headers, logs, lastEntry;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    sessionToken = (0, sessionIngressAuth_js_1.getSessionIngressAuthToken)();
                    if (!sessionToken) {
                        (0, debug_js_1.logForDebugging)('No session token available for fetching session logs');
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'session_get_fail_no_token');
                        return [2 /*return*/, null];
                    }
                    headers = { Authorization: "Bearer ".concat(sessionToken) };
                    return [4 /*yield*/, fetchSessionLogsFromUrl(sessionId, url, headers)];
                case 1:
                    logs = _a.sent();
                    if (logs && logs.length > 0) {
                        lastEntry = logs.at(-1);
                        if (lastEntry && 'uuid' in lastEntry && lastEntry.uuid) {
                            lastUuidMap.set(sessionId, lastEntry.uuid);
                        }
                    }
                    return [2 /*return*/, logs];
            }
        });
    });
}
/**
 * Get all session logs for hydration via OAuth
 * Used for teleporting sessions from the Sessions API
 */
function getSessionLogsViaOAuth(sessionId, accessToken, orgUUID) {
    return __awaiter(this, void 0, void 0, function () {
        var url, headers, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = "".concat((0, oauth_js_1.getOauthConfig)().BASE_API_URL, "/v1/session_ingress/session/").concat(sessionId);
                    (0, debug_js_1.logForDebugging)("[session-ingress] Fetching session logs from: ".concat(url));
                    headers = __assign(__assign({}, (0, api_js_1.getOAuthHeaders)(accessToken)), { 'x-organization-uuid': orgUUID });
                    return [4 /*yield*/, fetchSessionLogsFromUrl(sessionId, url, headers)];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result];
            }
        });
    });
}
/**
 * Get worker events (transcript) via the CCR v2 Sessions API. Replaces
 * getSessionLogsViaOAuth once session-ingress is retired.
 *
 * The server dispatches per-session: Spanner for v2-native sessions,
 * threadstore for pre-backfill session_* IDs. The cursor is opaque to us —
 * echo it back until next_cursor is unset.
 *
 * Paginated (500/page default, server max 1000). session-ingress's one-shot
 * 50k is gone; we loop.
 */
function getTeleportEvents(sessionId, accessToken, orgUUID) {
    return __awaiter(this, void 0, void 0, function () {
        var baseUrl, headers, all, cursor, pages, maxPages, params, response, e_1, err, _a, data, next_cursor, _i, data_1, ev;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    baseUrl = "".concat((0, oauth_js_1.getOauthConfig)().BASE_API_URL, "/v1/code/sessions/").concat(sessionId, "/teleport-events");
                    headers = __assign(__assign({}, (0, api_js_1.getOAuthHeaders)(accessToken)), { 'x-organization-uuid': orgUUID });
                    (0, debug_js_1.logForDebugging)("[teleport] Fetching events from: ".concat(baseUrl));
                    all = [];
                    pages = 0;
                    maxPages = 100;
                    _b.label = 1;
                case 1:
                    if (!(pages < maxPages)) return [3 /*break*/, 6];
                    params = { limit: 1000 };
                    if (cursor !== undefined) {
                        params.cursor = cursor;
                    }
                    response = void 0;
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, axios_1.default.get(baseUrl, {
                            headers: headers,
                            params: params,
                            timeout: 20000,
                            validateStatus: function (status) { return status < 500; },
                        })];
                case 3:
                    response = _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _b.sent();
                    err = e_1;
                    (0, log_js_1.logError)(new Error("Teleport events fetch failed: ".concat(err.message)));
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'teleport_events_fetch_fail');
                    return [2 /*return*/, null];
                case 5:
                    if (response.status === 404) {
                        // 404 on page 0 is ambiguous during the migration window:
                        //   (a) Session genuinely not found (not in Spanner AND not in
                        //       threadstore) — nothing to fetch.
                        //   (b) Route-level 404: endpoint not deployed yet, or session is
                        //       a threadstore session not yet backfilled into Spanner.
                        // We can't tell them apart from the response alone. Returning null
                        // lets the caller fall back to session-ingress, which will correctly
                        // return empty for case (a) and data for case (b). Once the backfill
                        // is complete and session-ingress is gone, the fallback also returns
                        // null → same "Failed to fetch session logs" error as today.
                        //
                        // 404 mid-pagination (pages > 0) means session was deleted between
                        // pages — return what we have.
                        (0, debug_js_1.logForDebugging)("[teleport] Session ".concat(sessionId, " not found (page ").concat(pages, ")"));
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('warn', 'teleport_events_not_found');
                        return [2 /*return*/, pages === 0 ? null : all];
                    }
                    if (response.status === 401) {
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'teleport_events_bad_token');
                        throw new Error('Your session has expired. Please run /login to sign in again.');
                    }
                    if (response.status !== 200) {
                        (0, log_js_1.logError)(new Error("Teleport events returned ".concat(response.status, ": ").concat((0, slowOperations_js_1.jsonStringify)(response.data))));
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'teleport_events_bad_status');
                        return [2 /*return*/, null];
                    }
                    _a = response.data, data = _a.data, next_cursor = _a.next_cursor;
                    if (!Array.isArray(data)) {
                        (0, log_js_1.logError)(new Error("Teleport events invalid response shape: ".concat((0, slowOperations_js_1.jsonStringify)(response.data))));
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'teleport_events_invalid_shape');
                        return [2 /*return*/, null];
                    }
                    // payload IS the Entry. null payload happens for threadstore non-generic
                    // events (server skips them) or encryption failures — skip here too.
                    for (_i = 0, data_1 = data; _i < data_1.length; _i++) {
                        ev = data_1[_i];
                        if (ev.payload !== null) {
                            all.push(ev.payload);
                        }
                    }
                    pages++;
                    // == null covers both `null` and `undefined` — the proto omits the
                    // field at end-of-stream, but some serializers emit `null`. Strict
                    // `=== undefined` would loop forever on `null` (cursor=null in query
                    // params stringifies to "null", which the server rejects or echoes).
                    if (next_cursor == null) {
                        return [3 /*break*/, 6];
                    }
                    cursor = next_cursor;
                    return [3 /*break*/, 1];
                case 6:
                    if (pages >= maxPages) {
                        // Don't fail — return what we have. Better to teleport with a
                        // truncated transcript than not at all.
                        (0, log_js_1.logError)(new Error("Teleport events hit page cap (".concat(maxPages, ") for ").concat(sessionId)));
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('warn', 'teleport_events_page_cap');
                    }
                    (0, debug_js_1.logForDebugging)("[teleport] Fetched ".concat(all.length, " events over ").concat(pages, " page(s) for ").concat(sessionId));
                    return [2 /*return*/, all];
            }
        });
    });
}
/**
 * Shared implementation for fetching session logs from a URL
 */
function fetchSessionLogsFromUrl(sessionId, url, headers) {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, logs, error_2, axiosError;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1.default.get(url, {
                            headers: headers,
                            timeout: 20000,
                            validateStatus: function (status) { return status < 500; },
                            params: (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_AFTER_LAST_COMPACT)
                                ? { after_last_compact: true }
                                : undefined,
                        })];
                case 1:
                    response = _a.sent();
                    if (response.status === 200) {
                        data = response.data;
                        // Validate the response structure
                        if (!data || typeof data !== 'object' || !Array.isArray(data.loglines)) {
                            (0, log_js_1.logError)(new Error("Invalid session logs response format: ".concat((0, slowOperations_js_1.jsonStringify)(data))));
                            (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'session_get_fail_invalid_response');
                            return [2 /*return*/, null];
                        }
                        logs = data.loglines;
                        (0, debug_js_1.logForDebugging)("Fetched ".concat(logs.length, " session logs for session ").concat(sessionId));
                        return [2 /*return*/, logs];
                    }
                    if (response.status === 404) {
                        (0, debug_js_1.logForDebugging)("No existing logs for session ".concat(sessionId));
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('warn', 'session_get_no_logs_for_session');
                        return [2 /*return*/, []];
                    }
                    if (response.status === 401) {
                        (0, debug_js_1.logForDebugging)('Auth token expired or invalid');
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'session_get_fail_bad_token');
                        throw new Error('Your session has expired. Please run /login to sign in again.');
                    }
                    (0, debug_js_1.logForDebugging)("Failed to fetch session logs: ".concat(response.status, " ").concat(response.statusText));
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'session_get_fail_status', {
                        status: response.status,
                    });
                    return [2 /*return*/, null];
                case 2:
                    error_2 = _a.sent();
                    axiosError = error_2;
                    (0, log_js_1.logError)(new Error("Error fetching session logs: ".concat(axiosError.message)));
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'session_get_fail_status', {
                        status: axiosError.status,
                    });
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Walk backward through entries to find the last one with a uuid.
 * Some entry types (SummaryMessage, TagMessage) don't have one.
 */
function findLastUuid(logs) {
    if (!logs) {
        return undefined;
    }
    var entry = logs.findLast(function (e) { return 'uuid' in e && e.uuid; });
    return entry && 'uuid' in entry ? entry.uuid : undefined;
}
/**
 * Clear cached state for a session
 */
function clearSession(sessionId) {
    lastUuidMap.delete(sessionId);
    sequentialAppendBySession.delete(sessionId);
}
/**
 * Clear all cached session state (all sessions).
 * Use this on /clear to free sub-agent session entries.
 */
function clearAllSessions() {
    lastUuidMap.clear();
    sequentialAppendBySession.clear();
}
