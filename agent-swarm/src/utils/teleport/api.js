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
exports.CodeSessionSchema = exports.CCR_BYOC_BETA = void 0;
exports.isTransientNetworkError = isTransientNetworkError;
exports.axiosGetWithRetry = axiosGetWithRetry;
exports.prepareApiRequest = prepareApiRequest;
exports.fetchCodeSessionsFromSessionsAPI = fetchCodeSessionsFromSessionsAPI;
exports.getOAuthHeaders = getOAuthHeaders;
exports.fetchSession = fetchSession;
exports.getBranchFromSession = getBranchFromSession;
exports.sendEventToRemoteSession = sendEventToRemoteSession;
exports.updateSessionTitle = updateSessionTitle;
var axios_1 = require("axios");
var crypto_1 = require("crypto");
var oauth_js_1 = require("src/constants/oauth.js");
var client_js_1 = require("src/services/oauth/client.js");
var v4_1 = require("zod/v4");
var auth_js_1 = require("../auth.js");
var debug_js_1 = require("../debug.js");
var detectRepository_js_1 = require("../detectRepository.js");
var errors_js_1 = require("../errors.js");
var lazySchema_js_1 = require("../lazySchema.js");
var log_js_1 = require("../log.js");
var sleep_js_1 = require("../sleep.js");
var slowOperations_js_1 = require("../slowOperations.js");
// Retry configuration for teleport API requests
var TELEPORT_RETRY_DELAYS = [2000, 4000, 8000, 16000]; // 4 retries with exponential backoff
var MAX_TELEPORT_RETRIES = TELEPORT_RETRY_DELAYS.length;
exports.CCR_BYOC_BETA = 'ccr-byoc-2025-07-29';
/**
 * Checks if an axios error is a transient network error that should be retried
 */
function isTransientNetworkError(error) {
    if (!axios_1.default.isAxiosError(error)) {
        return false;
    }
    // Retry on network errors (no response received)
    if (!error.response) {
        return true;
    }
    // Retry on server errors (5xx)
    if (error.response.status >= 500) {
        return true;
    }
    // Don't retry on client errors (4xx) - they're not transient
    return false;
}
/**
 * Makes an axios GET request with automatic retry for transient network errors
 * Uses exponential backoff: 2s, 4s, 8s, 16s (4 retries = 5 total attempts)
 */
function axiosGetWithRetry(url, config) {
    return __awaiter(this, void 0, void 0, function () {
        var lastError, attempt, error_1, delay;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    attempt = 0;
                    _b.label = 1;
                case 1:
                    if (!(attempt <= MAX_TELEPORT_RETRIES)) return [3 /*break*/, 7];
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 6]);
                    return [4 /*yield*/, axios_1.default.get(url, config)];
                case 3: return [2 /*return*/, _b.sent()];
                case 4:
                    error_1 = _b.sent();
                    lastError = error_1;
                    // Don't retry if this isn't a transient error
                    if (!isTransientNetworkError(error_1)) {
                        throw error_1;
                    }
                    // Don't retry if we've exhausted all retries
                    if (attempt >= MAX_TELEPORT_RETRIES) {
                        (0, debug_js_1.logForDebugging)("Teleport request failed after ".concat(attempt + 1, " attempts: ").concat((0, errors_js_1.errorMessage)(error_1)));
                        throw error_1;
                    }
                    delay = (_a = TELEPORT_RETRY_DELAYS[attempt]) !== null && _a !== void 0 ? _a : 2000;
                    (0, debug_js_1.logForDebugging)("Teleport request failed (attempt ".concat(attempt + 1, "/").concat(MAX_TELEPORT_RETRIES + 1, "), retrying in ").concat(delay, "ms: ").concat((0, errors_js_1.errorMessage)(error_1)));
                    return [4 /*yield*/, (0, sleep_js_1.sleep)(delay)];
                case 5:
                    _b.sent();
                    return [3 /*break*/, 6];
                case 6:
                    attempt++;
                    return [3 /*break*/, 1];
                case 7: throw lastError;
            }
        });
    });
}
exports.CodeSessionSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.default.object({
        id: v4_1.default.string(),
        title: v4_1.default.string(),
        description: v4_1.default.string(),
        status: v4_1.default.enum([
            'idle',
            'working',
            'waiting',
            'completed',
            'archived',
            'cancelled',
            'rejected',
        ]),
        repo: v4_1.default
            .object({
            name: v4_1.default.string(),
            owner: v4_1.default.object({
                login: v4_1.default.string(),
            }),
            default_branch: v4_1.default.string().optional(),
        })
            .nullable(),
        turns: v4_1.default.array(v4_1.default.string()),
        created_at: v4_1.default.string(),
        updated_at: v4_1.default.string(),
    });
});
/**
 * Validates and prepares for API requests
 * @returns Object containing access token and organization UUID
 */
function prepareApiRequest() {
    return __awaiter(this, void 0, void 0, function () {
        var accessToken, orgUUID;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    accessToken = (_a = (0, auth_js_1.getClaudeAIOAuthTokens)()) === null || _a === void 0 ? void 0 : _a.accessToken;
                    if (accessToken === undefined) {
                        throw new Error('Claude Code web sessions require authentication with a Claude.ai account. API key authentication is not sufficient. Please run /login to authenticate, or check your authentication status with /status.');
                    }
                    return [4 /*yield*/, (0, client_js_1.getOrganizationUUID)()];
                case 1:
                    orgUUID = _b.sent();
                    if (!orgUUID) {
                        throw new Error('Unable to get organization UUID');
                    }
                    return [2 /*return*/, { accessToken: accessToken, orgUUID: orgUUID }];
            }
        });
    });
}
/**
 * Fetches code sessions from the new Sessions API (/v1/sessions)
 * @returns Array of code sessions
 */
function fetchCodeSessionsFromSessionsAPI() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, accessToken, orgUUID, url, headers, response, sessions, error_2, err;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, prepareApiRequest()];
                case 1:
                    _a = _b.sent(), accessToken = _a.accessToken, orgUUID = _a.orgUUID;
                    url = "".concat((0, oauth_js_1.getOauthConfig)().BASE_API_URL, "/v1/sessions");
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    headers = __assign(__assign({}, getOAuthHeaders(accessToken)), { 'anthropic-beta': 'ccr-byoc-2025-07-29', 'x-organization-uuid': orgUUID });
                    return [4 /*yield*/, axiosGetWithRetry(url, {
                            headers: headers,
                        })];
                case 3:
                    response = _b.sent();
                    if (response.status !== 200) {
                        throw new Error("Failed to fetch code sessions: ".concat(response.statusText));
                    }
                    sessions = response.data.data.map(function (session) {
                        // Extract repository info from git sources
                        var gitSource = session.session_context.sources.find(function (source) { return source.type === 'git_repository'; });
                        var repo = null;
                        if (gitSource === null || gitSource === void 0 ? void 0 : gitSource.url) {
                            // Parse GitHub URL using the existing utility function
                            var repoPath = (0, detectRepository_js_1.parseGitHubRepository)(gitSource.url);
                            if (repoPath) {
                                var _a = repoPath.split('/'), owner = _a[0], name_1 = _a[1];
                                if (owner && name_1) {
                                    repo = {
                                        name: name_1,
                                        owner: {
                                            login: owner,
                                        },
                                        default_branch: gitSource.revision || undefined,
                                    };
                                }
                            }
                        }
                        return {
                            id: session.id,
                            title: session.title || 'Untitled',
                            description: '', // SessionResource doesn't have description field
                            status: session.session_status, // Map session_status to status
                            repo: repo,
                            turns: [], // SessionResource doesn't have turns field
                            created_at: session.created_at,
                            updated_at: session.updated_at,
                        };
                    });
                    return [2 /*return*/, sessions];
                case 4:
                    error_2 = _b.sent();
                    err = (0, errors_js_1.toError)(error_2);
                    (0, log_js_1.logError)(err);
                    throw error_2;
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Creates OAuth headers for API requests
 * @param accessToken The OAuth access token
 * @returns Headers object with Authorization, Content-Type, and anthropic-version
 */
function getOAuthHeaders(accessToken) {
    return {
        Authorization: "Bearer ".concat(accessToken),
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
    };
}
/**
 * Fetches a single session by ID from the Sessions API
 * @param sessionId The session ID to fetch
 * @returns The session resource
 */
function fetchSession(sessionId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, accessToken, orgUUID, url, headers, response, errorData, apiMessage;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, prepareApiRequest()];
                case 1:
                    _a = _c.sent(), accessToken = _a.accessToken, orgUUID = _a.orgUUID;
                    url = "".concat((0, oauth_js_1.getOauthConfig)().BASE_API_URL, "/v1/sessions/").concat(sessionId);
                    headers = __assign(__assign({}, getOAuthHeaders(accessToken)), { 'anthropic-beta': 'ccr-byoc-2025-07-29', 'x-organization-uuid': orgUUID });
                    return [4 /*yield*/, axios_1.default.get(url, {
                            headers: headers,
                            timeout: 15000,
                            validateStatus: function (status) { return status < 500; },
                        })];
                case 2:
                    response = _c.sent();
                    if (response.status !== 200) {
                        errorData = response.data;
                        apiMessage = (_b = errorData === null || errorData === void 0 ? void 0 : errorData.error) === null || _b === void 0 ? void 0 : _b.message;
                        if (response.status === 404) {
                            throw new Error("Session not found: ".concat(sessionId));
                        }
                        if (response.status === 401) {
                            throw new Error('Session expired. Please run /login to sign in again.');
                        }
                        throw new Error(apiMessage ||
                            "Failed to fetch session: ".concat(response.status, " ").concat(response.statusText));
                    }
                    return [2 /*return*/, response.data];
            }
        });
    });
}
/**
 * Extracts the first branch name from a session's git repository outcomes
 * @param session The session resource to extract from
 * @returns The first branch name, or undefined if none found
 */
function getBranchFromSession(session) {
    var _a, _b;
    var gitOutcome = (_a = session.session_context.outcomes) === null || _a === void 0 ? void 0 : _a.find(function (outcome) {
        return outcome.type === 'git_repository';
    });
    return (_b = gitOutcome === null || gitOutcome === void 0 ? void 0 : gitOutcome.git_info) === null || _b === void 0 ? void 0 : _b.branches[0];
}
/**
 * Sends a user message event to an existing remote session via the Sessions API
 * @param sessionId The session ID to send the event to
 * @param messageContent The user message content (string or content blocks)
 * @param opts.uuid Optional UUID for the event — callers that added a local
 *   UserMessage first should pass its UUID so echo filtering can dedup
 * @returns Promise<boolean> True if successful, false otherwise
 */
function sendEventToRemoteSession(sessionId, messageContent, opts) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, accessToken, orgUUID, url, headers, userEvent, requestBody, response, error_3;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, prepareApiRequest()];
                case 1:
                    _a = _c.sent(), accessToken = _a.accessToken, orgUUID = _a.orgUUID;
                    url = "".concat((0, oauth_js_1.getOauthConfig)().BASE_API_URL, "/v1/sessions/").concat(sessionId, "/events");
                    headers = __assign(__assign({}, getOAuthHeaders(accessToken)), { 'anthropic-beta': 'ccr-byoc-2025-07-29', 'x-organization-uuid': orgUUID });
                    userEvent = {
                        uuid: (_b = opts === null || opts === void 0 ? void 0 : opts.uuid) !== null && _b !== void 0 ? _b : (0, crypto_1.randomUUID)(),
                        session_id: sessionId,
                        type: 'user',
                        parent_tool_use_id: null,
                        message: {
                            role: 'user',
                            content: messageContent,
                        },
                    };
                    requestBody = {
                        events: [userEvent],
                    };
                    (0, debug_js_1.logForDebugging)("[sendEventToRemoteSession] Sending event to session ".concat(sessionId));
                    return [4 /*yield*/, axios_1.default.post(url, requestBody, {
                            headers: headers,
                            validateStatus: function (status) { return status < 500; },
                            timeout: 30000,
                        })];
                case 2:
                    response = _c.sent();
                    if (response.status === 200 || response.status === 201) {
                        (0, debug_js_1.logForDebugging)("[sendEventToRemoteSession] Successfully sent event to session ".concat(sessionId));
                        return [2 /*return*/, true];
                    }
                    (0, debug_js_1.logForDebugging)("[sendEventToRemoteSession] Failed with status ".concat(response.status, ": ").concat((0, slowOperations_js_1.jsonStringify)(response.data)));
                    return [2 /*return*/, false];
                case 3:
                    error_3 = _c.sent();
                    (0, debug_js_1.logForDebugging)("[sendEventToRemoteSession] Error: ".concat((0, errors_js_1.errorMessage)(error_3)));
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Updates the title of an existing remote session via the Sessions API
 * @param sessionId The session ID to update
 * @param title The new title for the session
 * @returns Promise<boolean> True if successful, false otherwise
 */
function updateSessionTitle(sessionId, title) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, accessToken, orgUUID, url, headers, response, error_4;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, prepareApiRequest()];
                case 1:
                    _a = _b.sent(), accessToken = _a.accessToken, orgUUID = _a.orgUUID;
                    url = "".concat((0, oauth_js_1.getOauthConfig)().BASE_API_URL, "/v1/sessions/").concat(sessionId);
                    headers = __assign(__assign({}, getOAuthHeaders(accessToken)), { 'anthropic-beta': 'ccr-byoc-2025-07-29', 'x-organization-uuid': orgUUID });
                    (0, debug_js_1.logForDebugging)("[updateSessionTitle] Updating title for session ".concat(sessionId, ": \"").concat(title, "\""));
                    return [4 /*yield*/, axios_1.default.patch(url, { title: title }, {
                            headers: headers,
                            validateStatus: function (status) { return status < 500; },
                        })];
                case 2:
                    response = _b.sent();
                    if (response.status === 200) {
                        (0, debug_js_1.logForDebugging)("[updateSessionTitle] Successfully updated title for session ".concat(sessionId));
                        return [2 /*return*/, true];
                    }
                    (0, debug_js_1.logForDebugging)("[updateSessionTitle] Failed with status ".concat(response.status, ": ").concat((0, slowOperations_js_1.jsonStringify)(response.data)));
                    return [2 /*return*/, false];
                case 3:
                    error_4 = _b.sent();
                    (0, debug_js_1.logForDebugging)("[updateSessionTitle] Error: ".concat((0, errors_js_1.errorMessage)(error_4)));
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    });
}
