"use strict";
/**
 * Team Memory Sync Service
 *
 * Syncs team memory files between the local filesystem and the server API.
 * Team memory is scoped per-repo (identified by git remote hash) and shared
 * across all authenticated org members.
 *
 * API contract (anthropic/anthropic#250711 + #283027):
 *   GET  /api/claude_code/team_memory?repo={owner/repo}            → TeamMemoryData (includes entryChecksums)
 *   GET  /api/claude_code/team_memory?repo={owner/repo}&view=hashes → metadata + entryChecksums only (no entry bodies)
 *   PUT  /api/claude_code/team_memory?repo={owner/repo}            → upload entries (upsert semantics)
 *   404 = no data exists yet
 *
 * Sync semantics:
 *   - Pull overwrites local files with server content (server wins per-key).
 *   - Push uploads only keys whose content hash differs from serverChecksums
 *     (delta upload). Server uses upsert: keys not in the PUT are preserved.
 *   - File deletions do NOT propagate: deleting a local file won't remove it
 *     from the server, and the next pull will restore it locally.
 *
 * State management:
 *   All mutable state (ETag tracking, watcher suppression) lives in a
 *   SyncState object created by the caller and threaded through every call.
 *   This avoids module-level mutable state and gives tests natural isolation.
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
exports.createSyncState = createSyncState;
exports.hashContent = hashContent;
exports.batchDeltaByBytes = batchDeltaByBytes;
exports.isTeamMemorySyncAvailable = isTeamMemorySyncAvailable;
exports.pullTeamMemory = pullTeamMemory;
exports.pushTeamMemory = pushTeamMemory;
exports.syncTeamMemory = syncTeamMemory;
var axios_1 = require("axios");
var crypto_1 = require("crypto");
var promises_1 = require("fs/promises");
var path_1 = require("path");
var oauth_js_1 = require("../../constants/oauth.js");
var teamMemPaths_js_1 = require("../../memdir/teamMemPaths.js");
var array_js_1 = require("../../utils/array.js");
var auth_js_1 = require("../../utils/auth.js");
var debug_js_1 = require("../../utils/debug.js");
var errors_js_1 = require("../../utils/errors.js");
var git_js_1 = require("../../utils/git.js");
var providers_js_1 = require("../../utils/model/providers.js");
var sleep_js_1 = require("../../utils/sleep.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var userAgent_js_1 = require("../../utils/userAgent.js");
var index_js_1 = require("../analytics/index.js");
var withRetry_js_1 = require("../api/withRetry.js");
var secretScanner_js_1 = require("./secretScanner.js");
var types_js_1 = require("./types.js");
var TEAM_MEMORY_SYNC_TIMEOUT_MS = 30000;
// Per-entry size cap — server default from anthropic/anthropic#293258.
// Pre-filtering oversized entries saves bandwidth: the structured 413 for
// this case doesn't give us anything to learn (one file is just too big).
var MAX_FILE_SIZE_BYTES = 250000;
// No client-side DEFAULT_MAX_ENTRIES: the server's entry-count cap is
// GB-tunable per-org (claude_code_team_memory_limits), so any compile-time
// constant here will drift.  We only truncate after learning the effective
// limit from a structured 413's extra_details.max_entries.
// Gateway body-size cap.  The API gateway rejects PUT bodies over ~256-512KB
// with an unstructured (HTML) 413 before the request reaches the app server —
// distinguishable from the app's structured entry-count 413 only by latency
// (~750ms gateway vs ~2.3s app on comparable payloads).  #21969 removed the
// client entry-count cap; cold pushes from heavy users then sent 300KB-1.4MB
// bodies and hit this.  200KB leaves headroom under the observed threshold
// and keeps a single-entry-at-MAX_FILE_SIZE_BYTES solo batch (~250KB) just
// under the real gateway limit.  Batches larger than this are split into
// sequential PUTs — server upsert-merge semantics make that safe.
var MAX_PUT_BODY_BYTES = 200000;
var MAX_RETRIES = 3;
var MAX_CONFLICT_RETRIES = 2;
function createSyncState() {
    return {
        lastKnownChecksum: null,
        serverChecksums: new Map(),
        serverMaxEntries: null,
    };
}
/**
 * Compute `sha256:<hex>` over the UTF-8 bytes of the given content.
 * Format matches the server's entryChecksums values (anthropic/anthropic#283027)
 * so local-vs-server comparison works by direct string equality.
 */
function hashContent(content) {
    return 'sha256:' + (0, crypto_1.createHash)('sha256').update(content, 'utf8').digest('hex');
}
/**
 * Type guard narrowing an unknown error to a Node.js errno-style exception.
 * Uses `in` narrowing so no `as` cast is needed at call sites.
 */
function isErrnoException(e) {
    return e instanceof Error && 'code' in e && typeof e.code === 'string';
}
// ─── Auth & endpoint ─────────────────────────────────────────
/**
 * Check if user is authenticated with first-party OAuth (required for team memory sync).
 */
function isUsingOAuth() {
    var _a;
    if ((0, providers_js_1.getAPIProvider)() !== 'firstParty' || !(0, providers_js_1.isFirstPartyAnthropicBaseUrl)()) {
        return false;
    }
    var tokens = (0, auth_js_1.getClaudeAIOAuthTokens)();
    return Boolean((tokens === null || tokens === void 0 ? void 0 : tokens.accessToken) &&
        ((_a = tokens.scopes) === null || _a === void 0 ? void 0 : _a.includes(oauth_js_1.CLAUDE_AI_INFERENCE_SCOPE)) &&
        tokens.scopes.includes(oauth_js_1.CLAUDE_AI_PROFILE_SCOPE));
}
function getTeamMemorySyncEndpoint(repoSlug) {
    var baseUrl = process.env.TEAM_MEMORY_SYNC_URL || (0, oauth_js_1.getOauthConfig)().BASE_API_URL;
    return "".concat(baseUrl, "/api/claude_code/team_memory?repo=").concat(encodeURIComponent(repoSlug));
}
function getAuthHeaders() {
    var oauthTokens = (0, auth_js_1.getClaudeAIOAuthTokens)();
    if (oauthTokens === null || oauthTokens === void 0 ? void 0 : oauthTokens.accessToken) {
        return {
            headers: {
                Authorization: "Bearer ".concat(oauthTokens.accessToken),
                'anthropic-beta': oauth_js_1.OAUTH_BETA_HEADER,
                'User-Agent': (0, userAgent_js_1.getClaudeCodeUserAgent)(),
            },
        };
    }
    return { error: 'No OAuth token available for team memory sync' };
}
// ─── Fetch (pull) ────────────────────────────────────────────
function fetchTeamMemoryOnce(state, repoSlug, etag) {
    return __awaiter(this, void 0, void 0, function () {
        var auth, headers, endpoint, response, parsed, responseChecksum, error_1, _a, kind, status_1, message, body;
        var _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, (0, auth_js_1.checkAndRefreshOAuthTokenIfNeeded)()];
                case 1:
                    _e.sent();
                    auth = getAuthHeaders();
                    if (auth.error) {
                        return [2 /*return*/, {
                                success: false,
                                error: auth.error,
                                skipRetry: true,
                                errorType: 'auth',
                            }];
                    }
                    headers = __assign({}, auth.headers);
                    if (etag) {
                        headers['If-None-Match'] = "\"".concat(etag.replace(/"/g, ''), "\"");
                    }
                    endpoint = getTeamMemorySyncEndpoint(repoSlug);
                    return [4 /*yield*/, axios_1.default.get(endpoint, {
                            headers: headers,
                            timeout: TEAM_MEMORY_SYNC_TIMEOUT_MS,
                            validateStatus: function (status) {
                                return status === 200 || status === 304 || status === 404;
                            },
                        })];
                case 2:
                    response = _e.sent();
                    if (response.status === 304) {
                        (0, debug_js_1.logForDebugging)('team-memory-sync: not modified (304)', {
                            level: 'debug',
                        });
                        return [2 /*return*/, { success: true, notModified: true, checksum: etag !== null && etag !== void 0 ? etag : undefined }];
                    }
                    if (response.status === 404) {
                        (0, debug_js_1.logForDebugging)('team-memory-sync: no remote data (404)', {
                            level: 'debug',
                        });
                        state.lastKnownChecksum = null;
                        return [2 /*return*/, { success: true, isEmpty: true }];
                    }
                    parsed = (0, types_js_1.TeamMemoryDataSchema)().safeParse(response.data);
                    if (!parsed.success) {
                        (0, debug_js_1.logForDebugging)('team-memory-sync: invalid response format', {
                            level: 'warn',
                        });
                        return [2 /*return*/, {
                                success: false,
                                error: 'Invalid team memory response format',
                                skipRetry: true,
                                errorType: 'parse',
                            }];
                    }
                    responseChecksum = parsed.data.checksum ||
                        ((_b = response.headers['etag']) === null || _b === void 0 ? void 0 : _b.replace(/^"|"$/g, '')) ||
                        undefined;
                    if (responseChecksum) {
                        state.lastKnownChecksum = responseChecksum;
                    }
                    (0, debug_js_1.logForDebugging)("team-memory-sync: fetched successfully (checksum: ".concat(responseChecksum !== null && responseChecksum !== void 0 ? responseChecksum : 'none', ")"), { level: 'debug' });
                    return [2 /*return*/, {
                            success: true,
                            data: parsed.data,
                            isEmpty: false,
                            checksum: responseChecksum,
                        }];
                case 3:
                    error_1 = _e.sent();
                    _a = (0, errors_js_1.classifyAxiosError)(error_1), kind = _a.kind, status_1 = _a.status, message = _a.message;
                    body = axios_1.default.isAxiosError(error_1)
                        ? JSON.stringify((_d = (_c = error_1.response) === null || _c === void 0 ? void 0 : _c.data) !== null && _d !== void 0 ? _d : '')
                        : '';
                    if (kind !== 'other') {
                        (0, debug_js_1.logForDebugging)("team-memory-sync: fetch error ".concat(status_1, ": ").concat(body), {
                            level: 'warn',
                        });
                    }
                    switch (kind) {
                        case 'auth':
                            return [2 /*return*/, {
                                    success: false,
                                    error: "Not authorized for team memory sync: ".concat(body),
                                    skipRetry: true,
                                    errorType: 'auth',
                                    httpStatus: status_1,
                                }];
                        case 'timeout':
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'Team memory sync request timeout',
                                    errorType: 'timeout',
                                }];
                        case 'network':
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'Cannot connect to server',
                                    errorType: 'network',
                                }];
                        default:
                            return [2 /*return*/, {
                                    success: false,
                                    error: message,
                                    errorType: 'unknown',
                                    httpStatus: status_1,
                                }];
                    }
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Fetch only per-key checksums + metadata (no entry bodies).
 * Used for cheap serverChecksums refresh during 412 conflict resolution — avoids
 * downloading ~300KB of content just to learn which keys changed.
 * Requires anthropic/anthropic#283027 deployed; on failure the caller fails the
 * push and the watcher retries on the next edit.
 */
function fetchTeamMemoryHashes(state, repoSlug) {
    return __awaiter(this, void 0, void 0, function () {
        var auth, endpoint, response, checksum, entryChecksums, error_2, _a, kind, status_2, message;
        var _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    _f.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, (0, auth_js_1.checkAndRefreshOAuthTokenIfNeeded)()];
                case 1:
                    _f.sent();
                    auth = getAuthHeaders();
                    if (auth.error) {
                        return [2 /*return*/, { success: false, error: auth.error, errorType: 'auth' }];
                    }
                    endpoint = getTeamMemorySyncEndpoint(repoSlug) + '&view=hashes';
                    return [4 /*yield*/, axios_1.default.get(endpoint, {
                            headers: auth.headers,
                            timeout: TEAM_MEMORY_SYNC_TIMEOUT_MS,
                            validateStatus: function (status) { return status === 200 || status === 404; },
                        })];
                case 2:
                    response = _f.sent();
                    if (response.status === 404) {
                        state.lastKnownChecksum = null;
                        return [2 /*return*/, { success: true, entryChecksums: {} }];
                    }
                    checksum = ((_b = response.data) === null || _b === void 0 ? void 0 : _b.checksum) || ((_c = response.headers['etag']) === null || _c === void 0 ? void 0 : _c.replace(/^"|"$/g, ''));
                    entryChecksums = (_d = response.data) === null || _d === void 0 ? void 0 : _d.entryChecksums;
                    // Requires anthropic/anthropic#283027. If entryChecksums is missing,
                    // treat as a probe failure — caller fails the push; watcher retries.
                    if (!entryChecksums || typeof entryChecksums !== 'object') {
                        return [2 /*return*/, {
                                success: false,
                                error: 'Server did not return entryChecksums (?view=hashes unsupported)',
                                errorType: 'parse',
                            }];
                    }
                    if (checksum) {
                        state.lastKnownChecksum = checksum;
                    }
                    return [2 /*return*/, {
                            success: true,
                            version: (_e = response.data) === null || _e === void 0 ? void 0 : _e.version,
                            checksum: checksum,
                            entryChecksums: entryChecksums,
                        }];
                case 3:
                    error_2 = _f.sent();
                    _a = (0, errors_js_1.classifyAxiosError)(error_2), kind = _a.kind, status_2 = _a.status, message = _a.message;
                    switch (kind) {
                        case 'auth':
                            return [2 /*return*/, {
                                    success: false,
                                    error: 'Not authorized',
                                    errorType: 'auth',
                                    httpStatus: status_2,
                                }];
                        case 'timeout':
                            return [2 /*return*/, { success: false, error: 'Timeout', errorType: 'timeout' }];
                        case 'network':
                            return [2 /*return*/, { success: false, error: 'Network error', errorType: 'network' }];
                        default:
                            return [2 /*return*/, {
                                    success: false,
                                    error: message,
                                    errorType: 'unknown',
                                    httpStatus: status_2,
                                }];
                    }
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function fetchTeamMemory(state, repoSlug, etag) {
    return __awaiter(this, void 0, void 0, function () {
        var lastResult, attempt, delayMs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    lastResult = null;
                    attempt = 1;
                    _a.label = 1;
                case 1:
                    if (!(attempt <= MAX_RETRIES + 1)) return [3 /*break*/, 5];
                    return [4 /*yield*/, fetchTeamMemoryOnce(state, repoSlug, etag)];
                case 2:
                    lastResult = _a.sent();
                    if (lastResult.success || lastResult.skipRetry) {
                        return [2 /*return*/, lastResult];
                    }
                    if (attempt > MAX_RETRIES) {
                        return [2 /*return*/, lastResult];
                    }
                    delayMs = (0, withRetry_js_1.getRetryDelay)(attempt);
                    (0, debug_js_1.logForDebugging)("team-memory-sync: retry ".concat(attempt, "/").concat(MAX_RETRIES), {
                        level: 'debug',
                    });
                    return [4 /*yield*/, (0, sleep_js_1.sleep)(delayMs)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    attempt++;
                    return [3 /*break*/, 1];
                case 5: return [2 /*return*/, lastResult];
            }
        });
    });
}
// ─── Upload (push) ───────────────────────────────────────────
/**
 * Split a delta into PUT-sized batches under MAX_PUT_BODY_BYTES each.
 *
 * Greedy bin-packing over sorted keys — sorting gives deterministic batches
 * across calls, which matters for ETag stability if the conflict loop retries
 * after a partial commit.  The byte count is the full serialized body
 * including JSON overhead, so what we measure is what axios sends.
 *
 * A single entry exceeding MAX_PUT_BODY_BYTES goes into its own solo batch
 * (MAX_FILE_SIZE_BYTES=250K already caps individual files; a ~250K solo body
 * is above our soft cap but below the gateway's observed real threshold).
 */
function batchDeltaByBytes(delta) {
    var keys = Object.keys(delta).sort();
    if (keys.length === 0)
        return [];
    // Fixed overhead for `{"entries":{}}` — each entry then adds its marginal
    // bytes.  jsonStringify (≡ JSON.stringify under the hood) on the raw
    // strings handles escaping so the count matches what axios serializes.
    var EMPTY_BODY_BYTES = Buffer.byteLength('{"entries":{}}', 'utf8');
    var entryBytes = function (k, v) {
        return Buffer.byteLength((0, slowOperations_js_1.jsonStringify)(k), 'utf8') +
            Buffer.byteLength((0, slowOperations_js_1.jsonStringify)(v), 'utf8') +
            2;
    }; // colon + comma (comma over-counts by 1 on the last entry; harmless slack)
    var batches = [];
    var current = {};
    var currentBytes = EMPTY_BODY_BYTES;
    for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
        var key = keys_1[_i];
        var added = entryBytes(key, delta[key]);
        if (currentBytes + added > MAX_PUT_BODY_BYTES &&
            Object.keys(current).length > 0) {
            batches.push(current);
            current = {};
            currentBytes = EMPTY_BODY_BYTES;
        }
        current[key] = delta[key];
        currentBytes += added;
    }
    batches.push(current);
    return batches;
}
function uploadTeamMemory(state, repoSlug, entries, ifMatchChecksum) {
    return __awaiter(this, void 0, void 0, function () {
        var auth, headers, endpoint, response, responseChecksum, error_3, body, _a, kind, httpStatus, message, errorType, serverErrorCode, serverMaxEntries, serverReceivedEntries, parsed;
        var _b, _c, _d, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    _g.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, (0, auth_js_1.checkAndRefreshOAuthTokenIfNeeded)()];
                case 1:
                    _g.sent();
                    auth = getAuthHeaders();
                    if (auth.error) {
                        return [2 /*return*/, { success: false, error: auth.error, errorType: 'auth' }];
                    }
                    headers = __assign(__assign({}, auth.headers), { 'Content-Type': 'application/json' });
                    if (ifMatchChecksum) {
                        headers['If-Match'] = "\"".concat(ifMatchChecksum.replace(/"/g, ''), "\"");
                    }
                    endpoint = getTeamMemorySyncEndpoint(repoSlug);
                    return [4 /*yield*/, axios_1.default.put(endpoint, { entries: entries }, {
                            headers: headers,
                            timeout: TEAM_MEMORY_SYNC_TIMEOUT_MS,
                            validateStatus: function (status) { return status === 200 || status === 412; },
                        })];
                case 2:
                    response = _g.sent();
                    if (response.status === 412) {
                        (0, debug_js_1.logForDebugging)('team-memory-sync: conflict (412 Precondition Failed)', {
                            level: 'info',
                        });
                        return [2 /*return*/, { success: false, conflict: true, error: 'ETag mismatch' }];
                    }
                    responseChecksum = (_b = response.data) === null || _b === void 0 ? void 0 : _b.checksum;
                    if (responseChecksum) {
                        state.lastKnownChecksum = responseChecksum;
                    }
                    (0, debug_js_1.logForDebugging)("team-memory-sync: uploaded ".concat(Object.keys(entries).length, " entries (checksum: ").concat(responseChecksum !== null && responseChecksum !== void 0 ? responseChecksum : 'none', ")"), { level: 'debug' });
                    return [2 /*return*/, {
                            success: true,
                            checksum: responseChecksum,
                            lastModified: (_c = response.data) === null || _c === void 0 ? void 0 : _c.lastModified,
                        }];
                case 3:
                    error_3 = _g.sent();
                    body = axios_1.default.isAxiosError(error_3)
                        ? JSON.stringify((_e = (_d = error_3.response) === null || _d === void 0 ? void 0 : _d.data) !== null && _e !== void 0 ? _e : '')
                        : '';
                    (0, debug_js_1.logForDebugging)("team-memory-sync: upload failed: ".concat(error_3 instanceof Error ? error_3.message : '', " ").concat(body), { level: 'warn' });
                    _a = (0, errors_js_1.classifyAxiosError)(error_3), kind = _a.kind, httpStatus = _a.status, message = _a.message;
                    errorType = kind === 'http' || kind === 'other' ? 'unknown' : kind;
                    serverErrorCode = void 0;
                    serverMaxEntries = void 0;
                    serverReceivedEntries = void 0;
                    // Parse structured 413 (anthropic/anthropic#293258). The server's
                    // RequestTooLargeException includes error_code + extra_details with
                    // the effective max_entries (may be GB-tuned per-org). Cache it so
                    // the next push trims to the right value.
                    if (httpStatus === 413 && axios_1.default.isAxiosError(error_3)) {
                        parsed = (0, types_js_1.TeamMemoryTooManyEntriesSchema)().safeParse((_f = error_3.response) === null || _f === void 0 ? void 0 : _f.data);
                        if (parsed.success) {
                            serverErrorCode = parsed.data.error.details.error_code;
                            serverMaxEntries = parsed.data.error.details.max_entries;
                            serverReceivedEntries = parsed.data.error.details.received_entries;
                        }
                    }
                    return [2 /*return*/, __assign(__assign(__assign({ success: false, error: message, errorType: errorType, httpStatus: httpStatus }, (serverErrorCode !== undefined && { serverErrorCode: serverErrorCode })), (serverMaxEntries !== undefined && { serverMaxEntries: serverMaxEntries })), (serverReceivedEntries !== undefined && { serverReceivedEntries: serverReceivedEntries }))];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// ─── Local file operations ───────────────────────────────────
/**
 * Read all team memory files from the local directory into a flat key-value map.
 * Keys are relative paths from the team memory directory.
 * Empty files are included (content will be empty string).
 *
 * PSR M22174: Each file is scanned for credentials before inclusion
 * using patterns from gitleaks. Files containing secrets are SKIPPED
 * (not uploaded) and collected in skippedSecrets so the caller can
 * warn the user.
 */
function readLocalTeamMemory(maxEntries) {
    return __awaiter(this, void 0, void 0, function () {
        function walkDir(dir) {
            return __awaiter(this, void 0, void 0, function () {
                var dirEntries, e_1;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            return [4 /*yield*/, (0, promises_1.readdir)(dir, { withFileTypes: true })];
                        case 1:
                            dirEntries = _a.sent();
                            return [4 /*yield*/, Promise.all(dirEntries.map(function (entry) { return __awaiter(_this, void 0, void 0, function () {
                                    var fullPath, stats, content, relPath, secretMatches, firstMatch, _a;
                                    return __generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0:
                                                fullPath = (0, path_1.join)(dir, entry.name);
                                                if (!entry.isDirectory()) return [3 /*break*/, 2];
                                                return [4 /*yield*/, walkDir(fullPath)];
                                            case 1:
                                                _b.sent();
                                                return [3 /*break*/, 7];
                                            case 2:
                                                if (!entry.isFile()) return [3 /*break*/, 7];
                                                _b.label = 3;
                                            case 3:
                                                _b.trys.push([3, 6, , 7]);
                                                return [4 /*yield*/, (0, promises_1.stat)(fullPath)];
                                            case 4:
                                                stats = _b.sent();
                                                if (stats.size > MAX_FILE_SIZE_BYTES) {
                                                    (0, debug_js_1.logForDebugging)("team-memory-sync: skipping oversized file ".concat(entry.name, " (").concat(stats.size, " > ").concat(MAX_FILE_SIZE_BYTES, " bytes)"), { level: 'info' });
                                                    return [2 /*return*/];
                                                }
                                                return [4 /*yield*/, (0, promises_1.readFile)(fullPath, 'utf8')];
                                            case 5:
                                                content = _b.sent();
                                                relPath = (0, path_1.relative)(teamDir, fullPath).replaceAll('\\', '/');
                                                secretMatches = (0, secretScanner_js_1.scanForSecrets)(content);
                                                if (secretMatches.length > 0) {
                                                    firstMatch = secretMatches[0];
                                                    skippedSecrets.push({
                                                        path: relPath,
                                                        ruleId: firstMatch.ruleId,
                                                        label: firstMatch.label,
                                                    });
                                                    (0, debug_js_1.logForDebugging)("team-memory-sync: skipping \"".concat(relPath, "\" \u2014 detected ").concat(firstMatch.label), { level: 'warn' });
                                                    return [2 /*return*/];
                                                }
                                                entries[relPath] = content;
                                                return [3 /*break*/, 7];
                                            case 6:
                                                _a = _b.sent();
                                                return [3 /*break*/, 7];
                                            case 7: return [2 /*return*/];
                                        }
                                    });
                                }); }))];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            e_1 = _a.sent();
                            if (isErrnoException(e_1)) {
                                if (e_1.code !== 'ENOENT' && e_1.code !== 'EACCES' && e_1.code !== 'EPERM') {
                                    throw e_1;
                                }
                            }
                            else {
                                throw e_1;
                            }
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        }
        var teamDir, entries, skippedSecrets, keys, dropped, truncated, _i, _a, key;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    teamDir = (0, teamMemPaths_js_1.getTeamMemPath)();
                    entries = {};
                    skippedSecrets = [];
                    return [4 /*yield*/, walkDir(teamDir)
                        // Truncate only if we've LEARNED a cap from the server (via a structured
                        // 413's extra_details.max_entries — anthropic/anthropic#293258).  The
                        // server's entry-count cap is GB-tunable per-org via
                        // claude_code_team_memory_limits; we have no way to know it in advance.
                        // Before the first 413 we send everything and let the server be
                        // authoritative.  The server validates total stored entries after merge
                        // (not PUT body count) and rejects atomically — nothing is written on 413.
                        //
                        // Sorting before truncation is what makes delta computation work: without
                        // it, the parallel walk above picks a different N-of-M subset each push
                        // (Promise.all resolves in completion order), serverChecksums misses keys,
                        // and the "delta" balloons to near-full snapshot.  With deterministic
                        // truncation, the same N keys are compared against the same server state.
                        //
                        // When disk has more files than the learned cap, alphabetically-last ones
                        // consistently never sync.  When the merged (server + delta) count exceeds
                        // the cap we still fail — recovering requires soft_delete_keys.
                    ];
                case 1:
                    _b.sent();
                    keys = Object.keys(entries).sort();
                    if (maxEntries !== null && keys.length > maxEntries) {
                        dropped = keys.slice(maxEntries);
                        (0, debug_js_1.logForDebugging)("team-memory-sync: ".concat(keys.length, " local entries exceeds server cap of ").concat(maxEntries, "; ").concat(dropped.length, " file(s) will NOT sync: ").concat(dropped.join(', '), ". Consider consolidating or removing some team memory files."), { level: 'warn' });
                        (0, index_js_1.logEvent)('tengu_team_mem_entries_capped', {
                            total_entries: keys.length,
                            dropped_count: dropped.length,
                            max_entries: maxEntries,
                        });
                        truncated = {};
                        for (_i = 0, _a = keys.slice(0, maxEntries); _i < _a.length; _i++) {
                            key = _a[_i];
                            truncated[key] = entries[key];
                        }
                        return [2 /*return*/, { entries: truncated, skippedSecrets: skippedSecrets }];
                    }
                    return [2 /*return*/, { entries: entries, skippedSecrets: skippedSecrets }];
            }
        });
    });
}
/**
 * Write remote team memory entries to the local directory.
 * Validates every path against the team memory directory boundary.
 * Skips entries whose on-disk content already matches, so unchanged
 * files keep their mtime and don't spuriously invalidate the
 * getMemoryFiles cache or trigger watcher events.
 *
 * Parallel: each entry is processed independently (validate + read-compare
 * + mkdir + write). Concurrent mkdir on a shared parent is safe with
 * recursive: true (EEXIST is swallowed). The initial pull is the long
 * pole in startTeamMemoryWatcher — p99 was ~22s serial at 50 entries.
 *
 * Returns the number of files actually written.
 */
function writeRemoteEntriesToLocal(entries) {
    return __awaiter(this, void 0, void 0, function () {
        var results;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all(Object.entries(entries).map(function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
                        var validatedPath, e_2, sizeBytes, existing, e_3, parentDir, e_4;
                        var relPath = _b[0], content = _b[1];
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    _c.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, (0, teamMemPaths_js_1.validateTeamMemKey)(relPath)];
                                case 1:
                                    validatedPath = _c.sent();
                                    return [3 /*break*/, 3];
                                case 2:
                                    e_2 = _c.sent();
                                    if (e_2 instanceof teamMemPaths_js_1.PathTraversalError) {
                                        (0, debug_js_1.logForDebugging)("team-memory-sync: ".concat(e_2.message), { level: 'warn' });
                                        return [2 /*return*/, false];
                                    }
                                    throw e_2;
                                case 3:
                                    sizeBytes = Buffer.byteLength(content, 'utf8');
                                    if (sizeBytes > MAX_FILE_SIZE_BYTES) {
                                        (0, debug_js_1.logForDebugging)("team-memory-sync: skipping oversized remote entry \"".concat(relPath, "\""), { level: 'info' });
                                        return [2 /*return*/, false];
                                    }
                                    _c.label = 4;
                                case 4:
                                    _c.trys.push([4, 6, , 7]);
                                    return [4 /*yield*/, (0, promises_1.readFile)(validatedPath, 'utf8')];
                                case 5:
                                    existing = _c.sent();
                                    if (existing === content) {
                                        return [2 /*return*/, false];
                                    }
                                    return [3 /*break*/, 7];
                                case 6:
                                    e_3 = _c.sent();
                                    if (isErrnoException(e_3) &&
                                        e_3.code !== 'ENOENT' &&
                                        e_3.code !== 'ENOTDIR') {
                                        (0, debug_js_1.logForDebugging)("team-memory-sync: unexpected read error for \"".concat(relPath, "\": ").concat(e_3.code), { level: 'debug' });
                                    }
                                    return [3 /*break*/, 7];
                                case 7:
                                    _c.trys.push([7, 10, , 11]);
                                    parentDir = validatedPath.substring(0, validatedPath.lastIndexOf(path_1.sep));
                                    return [4 /*yield*/, (0, promises_1.mkdir)(parentDir, { recursive: true })];
                                case 8:
                                    _c.sent();
                                    return [4 /*yield*/, (0, promises_1.writeFile)(validatedPath, content, 'utf8')];
                                case 9:
                                    _c.sent();
                                    return [2 /*return*/, true];
                                case 10:
                                    e_4 = _c.sent();
                                    (0, debug_js_1.logForDebugging)("team-memory-sync: failed to write \"".concat(relPath, "\": ").concat(e_4), { level: 'warn' });
                                    return [2 /*return*/, false];
                                case 11: return [2 /*return*/];
                            }
                        });
                    }); }))];
                case 1:
                    results = _a.sent();
                    return [2 /*return*/, (0, array_js_1.count)(results, Boolean)];
            }
        });
    });
}
// ─── Public API ──────────────────────────────────────────────
/**
 * Check if team memory sync is available (requires first-party OAuth).
 */
function isTeamMemorySyncAvailable() {
    return isUsingOAuth();
}
/**
 * Pull team memory from the server and write to local directory.
 * Returns true if any files were updated.
 */
function pullTeamMemory(state, options) {
    return __awaiter(this, void 0, void 0, function () {
        var skipEtagCache, startTime, repoSlug, etag, result, entries, responseChecksums, _i, _a, _b, key, hash, filesWritten, clearMemoryFileCaches;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    skipEtagCache = (_c = options === null || options === void 0 ? void 0 : options.skipEtagCache) !== null && _c !== void 0 ? _c : false;
                    startTime = Date.now();
                    if (!isUsingOAuth()) {
                        logPull(startTime, { success: false, errorType: 'no_oauth' });
                        return [2 /*return*/, {
                                success: false,
                                filesWritten: 0,
                                entryCount: 0,
                                error: 'OAuth not available',
                            }];
                    }
                    return [4 /*yield*/, (0, git_js_1.getGithubRepo)()];
                case 1:
                    repoSlug = _d.sent();
                    if (!repoSlug) {
                        logPull(startTime, { success: false, errorType: 'no_repo' });
                        return [2 /*return*/, {
                                success: false,
                                filesWritten: 0,
                                entryCount: 0,
                                error: 'No git remote found',
                            }];
                    }
                    etag = skipEtagCache ? null : state.lastKnownChecksum;
                    return [4 /*yield*/, fetchTeamMemory(state, repoSlug, etag)];
                case 2:
                    result = _d.sent();
                    if (!result.success) {
                        logPull(startTime, {
                            success: false,
                            errorType: result.errorType,
                            status: result.httpStatus,
                        });
                        return [2 /*return*/, {
                                success: false,
                                filesWritten: 0,
                                entryCount: 0,
                                error: result.error,
                            }];
                    }
                    if (result.notModified) {
                        logPull(startTime, { success: true, notModified: true });
                        return [2 /*return*/, { success: true, filesWritten: 0, entryCount: 0, notModified: true }];
                    }
                    if (result.isEmpty || !result.data) {
                        // Server has no data — clear stale serverChecksums so the next push
                        // doesn't skip entries it thinks the server already has.
                        state.serverChecksums.clear();
                        logPull(startTime, { success: true });
                        return [2 /*return*/, { success: true, filesWritten: 0, entryCount: 0 }];
                    }
                    entries = result.data.content.entries;
                    responseChecksums = result.data.content.entryChecksums;
                    // Refresh serverChecksums from server-provided per-key hashes.
                    // Requires anthropic/anthropic#283027 — if the response lacks entryChecksums
                    // (pre-deploy server), serverChecksums stays empty and the next push uploads
                    // everything; it self-corrects on push success.
                    state.serverChecksums.clear();
                    if (responseChecksums) {
                        for (_i = 0, _a = Object.entries(responseChecksums); _i < _a.length; _i++) {
                            _b = _a[_i], key = _b[0], hash = _b[1];
                            state.serverChecksums.set(key, hash);
                        }
                    }
                    else {
                        (0, debug_js_1.logForDebugging)('team-memory-sync: server response missing entryChecksums (pre-#283027 deploy) — next push will be full, not delta', { level: 'debug' });
                    }
                    return [4 /*yield*/, writeRemoteEntriesToLocal(entries)];
                case 3:
                    filesWritten = _d.sent();
                    if (!(filesWritten > 0)) return [3 /*break*/, 5];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../../utils/claudemd.js'); })];
                case 4:
                    clearMemoryFileCaches = (_d.sent()).clearMemoryFileCaches;
                    clearMemoryFileCaches();
                    _d.label = 5;
                case 5:
                    (0, debug_js_1.logForDebugging)("team-memory-sync: pulled ".concat(filesWritten, " files"), {
                        level: 'info',
                    });
                    logPull(startTime, { success: true, filesWritten: filesWritten });
                    return [2 /*return*/, {
                            success: true,
                            filesWritten: filesWritten,
                            entryCount: Object.keys(entries).length,
                        }];
            }
        });
    });
}
/**
 * Push local team memory files to the server with optimistic locking.
 *
 * Uses delta upload: only keys whose local content hash differs from
 * serverChecksums are included in the PUT. On 412 conflict, probes
 * GET ?view=hashes to refresh serverChecksums, recomputes the delta
 * (naturally excluding keys where a teammate's push matches ours),
 * and retries. No merge, no disk writes — server-only new keys from
 * a teammate's concurrent push propagate on the next pull.
 *
 * Local-wins-on-conflict is the opposite of syncTeamMemory's pull-first
 * semantics. This is intentional: pushTeamMemory is triggered by a local edit,
 * and that edit must not be silently discarded just because a teammate pushed
 * in the meantime. Content-level merge (same key, both changed) is not
 * attempted — the local version simply overwrites the server version for that
 * key, and the server's edit to that key is lost. This is the lesser evil:
 * the local user is actively editing and can re-incorporate the teammate's
 * changes, whereas silently discarding the local edit loses work the user
 * just did with no recourse.
 */
function pushTeamMemory(state) {
    return __awaiter(this, void 0, void 0, function () {
        var startTime, conflictRetries, repoSlug, localRead, entries, skippedSecrets, summary, localHashes, _i, _a, _b, key, content, sawConflict, conflictAttempt, delta, _c, localHashes_1, _d, key, localHash, deltaCount, batches, filesUploaded, result, _e, batches_1, batch, _f, _g, key, probe, _h, _j, _k, key, hash;
        return __generator(this, function (_l) {
            switch (_l.label) {
                case 0:
                    startTime = Date.now();
                    conflictRetries = 0;
                    if (!isUsingOAuth()) {
                        logPush(startTime, { success: false, errorType: 'no_oauth' });
                        return [2 /*return*/, {
                                success: false,
                                filesUploaded: 0,
                                error: 'OAuth not available',
                                errorType: 'no_oauth',
                            }];
                    }
                    return [4 /*yield*/, (0, git_js_1.getGithubRepo)()];
                case 1:
                    repoSlug = _l.sent();
                    if (!repoSlug) {
                        logPush(startTime, { success: false, errorType: 'no_repo' });
                        return [2 /*return*/, {
                                success: false,
                                filesUploaded: 0,
                                error: 'No git remote found',
                                errorType: 'no_repo',
                            }];
                    }
                    return [4 /*yield*/, readLocalTeamMemory(state.serverMaxEntries)];
                case 2:
                    localRead = _l.sent();
                    entries = localRead.entries;
                    skippedSecrets = localRead.skippedSecrets;
                    if (skippedSecrets.length > 0) {
                        summary = skippedSecrets
                            .map(function (s) { return "\"".concat(s.path, "\" (").concat(s.label, ")"); })
                            .join(', ');
                        (0, debug_js_1.logForDebugging)("team-memory-sync: ".concat(skippedSecrets.length, " file(s) skipped due to detected secrets: ").concat(summary, ". Remove the secret(s) to enable sync for these files."), { level: 'warn' });
                        (0, index_js_1.logEvent)('tengu_team_mem_secret_skipped', {
                            file_count: skippedSecrets.length,
                            // Only log gitleaks rule IDs (not values, not paths — paths could
                            // leak repo structure). Comma-joined for compact single-field analytics.
                            rule_ids: skippedSecrets
                                .map(function (s) { return s.ruleId; })
                                .join(','),
                        });
                    }
                    localHashes = new Map();
                    for (_i = 0, _a = Object.entries(entries); _i < _a.length; _i++) {
                        _b = _a[_i], key = _b[0], content = _b[1];
                        localHashes.set(key, hashContent(content));
                    }
                    sawConflict = false;
                    conflictAttempt = 0;
                    _l.label = 3;
                case 3:
                    if (!(conflictAttempt <= MAX_CONFLICT_RETRIES)) return [3 /*break*/, 10];
                    delta = {};
                    for (_c = 0, localHashes_1 = localHashes; _c < localHashes_1.length; _c++) {
                        _d = localHashes_1[_c], key = _d[0], localHash = _d[1];
                        if (state.serverChecksums.get(key) !== localHash) {
                            delta[key] = entries[key];
                        }
                    }
                    deltaCount = Object.keys(delta).length;
                    if (deltaCount === 0) {
                        // Nothing to upload. This is the expected fast path after a fresh pull
                        // with no local edits, and also the convergence point after a 412 where
                        // the teammate's push was a strict superset of ours.
                        logPush(startTime, {
                            success: true,
                            conflict: sawConflict,
                            conflictRetries: conflictRetries,
                        });
                        return [2 /*return*/, __assign({ success: true, filesUploaded: 0 }, (skippedSecrets.length > 0 && { skippedSecrets: skippedSecrets }))];
                    }
                    batches = batchDeltaByBytes(delta);
                    filesUploaded = 0;
                    result = void 0;
                    _e = 0, batches_1 = batches;
                    _l.label = 4;
                case 4:
                    if (!(_e < batches_1.length)) return [3 /*break*/, 7];
                    batch = batches_1[_e];
                    return [4 /*yield*/, uploadTeamMemory(state, repoSlug, batch, state.lastKnownChecksum)];
                case 5:
                    result = _l.sent();
                    if (!result.success)
                        return [3 /*break*/, 7];
                    for (_f = 0, _g = Object.keys(batch); _f < _g.length; _f++) {
                        key = _g[_f];
                        state.serverChecksums.set(key, localHashes.get(key));
                    }
                    filesUploaded += Object.keys(batch).length;
                    _l.label = 6;
                case 6:
                    _e++;
                    return [3 /*break*/, 4];
                case 7:
                    // batches is non-empty (deltaCount > 0 guaranteed by the check above),
                    // so the loop executed at least once.
                    result = result;
                    if (result.success) {
                        // Server-side delta propagation to disk (server-only new keys from a
                        // teammate's concurrent push) happens on the next pull — we only
                        // fetched hashes during conflict resolution, not bodies.
                        (0, debug_js_1.logForDebugging)(batches.length > 1
                            ? "team-memory-sync: pushed ".concat(filesUploaded, " of ").concat(localHashes.size, " files in ").concat(batches.length, " batches")
                            : "team-memory-sync: pushed ".concat(filesUploaded, " of ").concat(localHashes.size, " files (delta)"), { level: 'info' });
                        logPush(startTime, {
                            success: true,
                            filesUploaded: filesUploaded,
                            conflict: sawConflict,
                            conflictRetries: conflictRetries,
                            putBatches: batches.length > 1 ? batches.length : undefined,
                        });
                        return [2 /*return*/, __assign({ success: true, filesUploaded: filesUploaded, checksum: result.checksum }, (skippedSecrets.length > 0 && { skippedSecrets: skippedSecrets }))];
                    }
                    if (!result.conflict) {
                        // If the server returned a structured 413 with its effective
                        // max_entries (anthropic/anthropic#293258), cache it so the next push
                        // trims to the right cap. The server may GB-tune this per-org.
                        // This push still fails — re-trimming mid-push would require re-reading
                        // local entries and re-computing the delta, and we'd need
                        // soft_delete_keys to shrink below current server count anyway.
                        if (result.serverMaxEntries !== undefined) {
                            state.serverMaxEntries = result.serverMaxEntries;
                            (0, debug_js_1.logForDebugging)("team-memory-sync: learned server max_entries=".concat(result.serverMaxEntries, " from 413; next push will truncate to this"), { level: 'warn' });
                        }
                        // filesUploaded may be nonzero if earlier batches committed before this
                        // one failed. Those keys ARE on the server; the push is a failure
                        // because it's incomplete, but we don't re-upload them on retry
                        // (serverChecksums was updated).
                        logPush(startTime, {
                            success: false,
                            filesUploaded: filesUploaded,
                            conflictRetries: conflictRetries,
                            putBatches: batches.length > 1 ? batches.length : undefined,
                            errorType: result.errorType,
                            status: result.httpStatus,
                            // Datadog: filter @error_code:team_memory_too_many_entries to track
                            // too-many-files rejections distinct from gateway/unstructured 413s
                            errorCode: result.serverErrorCode,
                            serverMaxEntries: result.serverMaxEntries,
                            serverReceivedEntries: result.serverReceivedEntries,
                        });
                        return [2 /*return*/, {
                                success: false,
                                filesUploaded: filesUploaded,
                                error: result.error,
                                errorType: result.errorType,
                                httpStatus: result.httpStatus,
                            }];
                    }
                    // 412 conflict — refresh serverChecksums and retry with a tighter delta.
                    sawConflict = true;
                    if (conflictAttempt >= MAX_CONFLICT_RETRIES) {
                        (0, debug_js_1.logForDebugging)("team-memory-sync: giving up after ".concat(MAX_CONFLICT_RETRIES, " conflict retries"), { level: 'warn' });
                        logPush(startTime, {
                            success: false,
                            conflict: true,
                            conflictRetries: conflictRetries,
                            errorType: 'conflict',
                        });
                        return [2 /*return*/, {
                                success: false,
                                filesUploaded: 0,
                                conflict: true,
                                error: 'Conflict resolution failed after retries',
                            }];
                    }
                    conflictRetries++;
                    (0, debug_js_1.logForDebugging)("team-memory-sync: conflict (412), probing server hashes (attempt ".concat(conflictAttempt + 1, "/").concat(MAX_CONFLICT_RETRIES, ")"), { level: 'info' });
                    return [4 /*yield*/, fetchTeamMemoryHashes(state, repoSlug)];
                case 8:
                    probe = _l.sent();
                    if (!probe.success || !probe.entryChecksums) {
                        // Requires anthropic/anthropic#283027. A transient probe failure here is
                        // fine: the push is failed and the watcher will retry on the next edit.
                        logPush(startTime, {
                            success: false,
                            conflict: true,
                            conflictRetries: conflictRetries,
                            errorType: 'conflict',
                        });
                        return [2 /*return*/, {
                                success: false,
                                filesUploaded: 0,
                                conflict: true,
                                error: "Conflict resolution hashes probe failed: ".concat(probe.error),
                            }];
                    }
                    state.serverChecksums.clear();
                    for (_h = 0, _j = Object.entries(probe.entryChecksums); _h < _j.length; _h++) {
                        _k = _j[_h], key = _k[0], hash = _k[1];
                        state.serverChecksums.set(key, hash);
                    }
                    _l.label = 9;
                case 9:
                    conflictAttempt++;
                    return [3 /*break*/, 3];
                case 10:
                    logPush(startTime, { success: false, conflictRetries: conflictRetries });
                    return [2 /*return*/, {
                            success: false,
                            filesUploaded: 0,
                            error: 'Unexpected end of conflict resolution loop',
                        }];
            }
        });
    });
}
/**
 * Bidirectional sync: pull from server, merge with local, push back.
 * Server entries take precedence on conflict (last-write-wins by the server).
 * Push uses conflict resolution (retries on 412) via pushTeamMemory.
 */
function syncTeamMemory(state) {
    return __awaiter(this, void 0, void 0, function () {
        var pullResult, pushResult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, pullTeamMemory(state, { skipEtagCache: true })];
                case 1:
                    pullResult = _a.sent();
                    if (!pullResult.success) {
                        return [2 /*return*/, {
                                success: false,
                                filesPulled: 0,
                                filesPushed: 0,
                                error: pullResult.error,
                            }];
                    }
                    return [4 /*yield*/, pushTeamMemory(state)];
                case 2:
                    pushResult = _a.sent();
                    if (!pushResult.success) {
                        return [2 /*return*/, {
                                success: false,
                                filesPulled: pullResult.filesWritten,
                                filesPushed: 0,
                                error: pushResult.error,
                            }];
                    }
                    (0, debug_js_1.logForDebugging)("team-memory-sync: synced (pulled ".concat(pullResult.filesWritten, ", pushed ").concat(pushResult.filesUploaded, ")"), { level: 'info' });
                    return [2 /*return*/, {
                            success: true,
                            filesPulled: pullResult.filesWritten,
                            filesPushed: pushResult.filesUploaded,
                        }];
            }
        });
    });
}
// ─── Telemetry helpers ───────────────────────────────────────
function logPull(startTime, outcome) {
    var _a, _b;
    (0, index_js_1.logEvent)('tengu_team_mem_sync_pull', __assign(__assign({ success: outcome.success, files_written: (_a = outcome.filesWritten) !== null && _a !== void 0 ? _a : 0, not_modified: (_b = outcome.notModified) !== null && _b !== void 0 ? _b : false, duration_ms: Date.now() - startTime }, (outcome.errorType && {
        errorType: outcome.errorType,
    })), (outcome.status && { status: outcome.status })));
}
function logPush(startTime, outcome) {
    var _a, _b, _c;
    (0, index_js_1.logEvent)('tengu_team_mem_sync_push', __assign(__assign(__assign(__assign(__assign(__assign({ success: outcome.success, files_uploaded: (_a = outcome.filesUploaded) !== null && _a !== void 0 ? _a : 0, conflict: (_b = outcome.conflict) !== null && _b !== void 0 ? _b : false, conflict_retries: (_c = outcome.conflictRetries) !== null && _c !== void 0 ? _c : 0, duration_ms: Date.now() - startTime }, (outcome.errorType && {
        errorType: outcome.errorType,
    })), (outcome.status && { status: outcome.status })), (outcome.putBatches && { put_batches: outcome.putBatches })), (outcome.errorCode && {
        error_code: outcome.errorCode,
    })), (outcome.serverMaxEntries !== undefined && {
        server_max_entries: outcome.serverMaxEntries,
    })), (outcome.serverReceivedEntries !== undefined && {
        server_received_entries: outcome.serverReceivedEntries,
    })));
}
