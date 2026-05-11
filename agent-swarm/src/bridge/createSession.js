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
exports.createBridgeSession = createBridgeSession;
exports.getBridgeSession = getBridgeSession;
exports.archiveBridgeSession = archiveBridgeSession;
exports.updateBridgeSessionTitle = updateBridgeSessionTitle;
var debug_js_1 = require("../utils/debug.js");
var errors_js_1 = require("../utils/errors.js");
var debugUtils_js_1 = require("./debugUtils.js");
var sessionIdCompat_js_1 = require("./sessionIdCompat.js");
/**
 * Create a session on a bridge environment via POST /v1/sessions.
 *
 * Used by both `claude remote-control` (empty session so the user has somewhere to
 * type immediately) and `/remote-control` (session pre-populated with conversation
 * history).
 *
 * Returns the session ID on success, or null if creation fails (non-fatal).
 */
function createBridgeSession(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var getClaudeAIOAuthTokens, getOrganizationUUID, getOauthConfig, getOAuthHeaders, parseGitHubRepository, getDefaultBranch, getMainLoopModel, axios, accessToken, orgUUID, gitSource, gitOutcome, parseGitRemote, parsed, host, owner, name_1, revision, _c, ownerRepo, _d, owner, name_2, revision, _e, requestBody, headers, url, response, err_1, isSuccess, detail, sessionData;
        var _f, _g;
        var environmentId = _b.environmentId, title = _b.title, events = _b.events, gitRepoUrl = _b.gitRepoUrl, branch = _b.branch, signal = _b.signal, baseUrlOverride = _b.baseUrl, getAccessToken = _b.getAccessToken, permissionMode = _b.permissionMode;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('../utils/auth.js'); })];
                case 1:
                    getClaudeAIOAuthTokens = (_h.sent()).getClaudeAIOAuthTokens;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../services/oauth/client.js'); })];
                case 2:
                    getOrganizationUUID = (_h.sent()).getOrganizationUUID;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../constants/oauth.js'); })];
                case 3:
                    getOauthConfig = (_h.sent()).getOauthConfig;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../utils/teleport/api.js'); })];
                case 4:
                    getOAuthHeaders = (_h.sent()).getOAuthHeaders;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../utils/detectRepository.js'); })];
                case 5:
                    parseGitHubRepository = (_h.sent()).parseGitHubRepository;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../utils/git.js'); })];
                case 6:
                    getDefaultBranch = (_h.sent()).getDefaultBranch;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../utils/model/model.js'); })];
                case 7:
                    getMainLoopModel = (_h.sent()).getMainLoopModel;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('axios'); })];
                case 8:
                    axios = (_h.sent()).default;
                    accessToken = (_f = getAccessToken === null || getAccessToken === void 0 ? void 0 : getAccessToken()) !== null && _f !== void 0 ? _f : (_g = getClaudeAIOAuthTokens()) === null || _g === void 0 ? void 0 : _g.accessToken;
                    if (!accessToken) {
                        (0, debug_js_1.logForDebugging)('[bridge] No access token for session creation');
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, getOrganizationUUID()];
                case 9:
                    orgUUID = _h.sent();
                    if (!orgUUID) {
                        (0, debug_js_1.logForDebugging)('[bridge] No org UUID for session creation');
                        return [2 /*return*/, null];
                    }
                    gitSource = null;
                    gitOutcome = null;
                    if (!gitRepoUrl) return [3 /*break*/, 16];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../utils/detectRepository.js'); })];
                case 10:
                    parseGitRemote = (_h.sent()).parseGitRemote;
                    parsed = parseGitRemote(gitRepoUrl);
                    if (!parsed) return [3 /*break*/, 13];
                    host = parsed.host, owner = parsed.owner, name_1 = parsed.name;
                    _c = branch;
                    if (_c) return [3 /*break*/, 12];
                    return [4 /*yield*/, getDefaultBranch()];
                case 11:
                    _c = (_h.sent());
                    _h.label = 12;
                case 12:
                    revision = _c || undefined;
                    gitSource = {
                        type: 'git_repository',
                        url: "https://".concat(host, "/").concat(owner, "/").concat(name_1),
                        revision: revision,
                    };
                    gitOutcome = {
                        type: 'git_repository',
                        git_info: {
                            type: 'github',
                            repo: "".concat(owner, "/").concat(name_1),
                            branches: ["claude/".concat(branch || 'task')],
                        },
                    };
                    return [3 /*break*/, 16];
                case 13:
                    ownerRepo = parseGitHubRepository(gitRepoUrl);
                    if (!ownerRepo) return [3 /*break*/, 16];
                    _d = ownerRepo.split('/'), owner = _d[0], name_2 = _d[1];
                    if (!(owner && name_2)) return [3 /*break*/, 16];
                    _e = branch;
                    if (_e) return [3 /*break*/, 15];
                    return [4 /*yield*/, getDefaultBranch()];
                case 14:
                    _e = (_h.sent());
                    _h.label = 15;
                case 15:
                    revision = _e || undefined;
                    gitSource = {
                        type: 'git_repository',
                        url: "https://github.com/".concat(owner, "/").concat(name_2),
                        revision: revision,
                    };
                    gitOutcome = {
                        type: 'git_repository',
                        git_info: {
                            type: 'github',
                            repo: "".concat(owner, "/").concat(name_2),
                            branches: ["claude/".concat(branch || 'task')],
                        },
                    };
                    _h.label = 16;
                case 16:
                    requestBody = __assign(__assign(__assign({}, (title !== undefined && { title: title })), { events: events, session_context: {
                            sources: gitSource ? [gitSource] : [],
                            outcomes: gitOutcome ? [gitOutcome] : [],
                            model: getMainLoopModel(),
                        }, environment_id: environmentId, source: 'remote-control' }), (permissionMode && { permission_mode: permissionMode }));
                    headers = __assign(__assign({}, getOAuthHeaders(accessToken)), { 'anthropic-beta': 'ccr-byoc-2025-07-29', 'x-organization-uuid': orgUUID });
                    url = "".concat(baseUrlOverride !== null && baseUrlOverride !== void 0 ? baseUrlOverride : getOauthConfig().BASE_API_URL, "/v1/sessions");
                    _h.label = 17;
                case 17:
                    _h.trys.push([17, 19, , 20]);
                    return [4 /*yield*/, axios.post(url, requestBody, {
                            headers: headers,
                            signal: signal,
                            validateStatus: function (s) { return s < 500; },
                        })];
                case 18:
                    response = _h.sent();
                    return [3 /*break*/, 20];
                case 19:
                    err_1 = _h.sent();
                    (0, debug_js_1.logForDebugging)("[bridge] Session creation request failed: ".concat((0, errors_js_1.errorMessage)(err_1)));
                    return [2 /*return*/, null];
                case 20:
                    isSuccess = response.status === 200 || response.status === 201;
                    if (!isSuccess) {
                        detail = (0, debugUtils_js_1.extractErrorDetail)(response.data);
                        (0, debug_js_1.logForDebugging)("[bridge] Session creation failed with status ".concat(response.status).concat(detail ? ": ".concat(detail) : ''));
                        return [2 /*return*/, null];
                    }
                    sessionData = response.data;
                    if (!sessionData ||
                        typeof sessionData !== 'object' ||
                        !('id' in sessionData) ||
                        typeof sessionData.id !== 'string') {
                        (0, debug_js_1.logForDebugging)('[bridge] No session ID in response');
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, sessionData.id];
            }
        });
    });
}
/**
 * Fetch a bridge session via GET /v1/sessions/{id}.
 *
 * Returns the session's environment_id (for `--session-id` resume) and title.
 * Uses the same org-scoped headers as create/archive — the environments-level
 * client in bridgeApi.ts uses a different beta header and no org UUID, which
 * makes the Sessions API return 404.
 */
function getBridgeSession(sessionId, opts) {
    return __awaiter(this, void 0, void 0, function () {
        var getClaudeAIOAuthTokens, getOrganizationUUID, getOauthConfig, getOAuthHeaders, axios, accessToken, orgUUID, headers, url, response, err_2, detail;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('../utils/auth.js'); })];
                case 1:
                    getClaudeAIOAuthTokens = (_e.sent()).getClaudeAIOAuthTokens;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../services/oauth/client.js'); })];
                case 2:
                    getOrganizationUUID = (_e.sent()).getOrganizationUUID;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../constants/oauth.js'); })];
                case 3:
                    getOauthConfig = (_e.sent()).getOauthConfig;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../utils/teleport/api.js'); })];
                case 4:
                    getOAuthHeaders = (_e.sent()).getOAuthHeaders;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('axios'); })];
                case 5:
                    axios = (_e.sent()).default;
                    accessToken = (_b = (_a = opts === null || opts === void 0 ? void 0 : opts.getAccessToken) === null || _a === void 0 ? void 0 : _a.call(opts)) !== null && _b !== void 0 ? _b : (_c = getClaudeAIOAuthTokens()) === null || _c === void 0 ? void 0 : _c.accessToken;
                    if (!accessToken) {
                        (0, debug_js_1.logForDebugging)('[bridge] No access token for session fetch');
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, getOrganizationUUID()];
                case 6:
                    orgUUID = _e.sent();
                    if (!orgUUID) {
                        (0, debug_js_1.logForDebugging)('[bridge] No org UUID for session fetch');
                        return [2 /*return*/, null];
                    }
                    headers = __assign(__assign({}, getOAuthHeaders(accessToken)), { 'anthropic-beta': 'ccr-byoc-2025-07-29', 'x-organization-uuid': orgUUID });
                    url = "".concat((_d = opts === null || opts === void 0 ? void 0 : opts.baseUrl) !== null && _d !== void 0 ? _d : getOauthConfig().BASE_API_URL, "/v1/sessions/").concat(sessionId);
                    (0, debug_js_1.logForDebugging)("[bridge] Fetching session ".concat(sessionId));
                    _e.label = 7;
                case 7:
                    _e.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, axios.get(url, { headers: headers, timeout: 10000, validateStatus: function (s) { return s < 500; } })];
                case 8:
                    response = _e.sent();
                    return [3 /*break*/, 10];
                case 9:
                    err_2 = _e.sent();
                    (0, debug_js_1.logForDebugging)("[bridge] Session fetch request failed: ".concat((0, errors_js_1.errorMessage)(err_2)));
                    return [2 /*return*/, null];
                case 10:
                    if (response.status !== 200) {
                        detail = (0, debugUtils_js_1.extractErrorDetail)(response.data);
                        (0, debug_js_1.logForDebugging)("[bridge] Session fetch failed with status ".concat(response.status).concat(detail ? ": ".concat(detail) : ''));
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, response.data];
            }
        });
    });
}
/**
 * Archive a bridge session via POST /v1/sessions/{id}/archive.
 *
 * The CCR server never auto-archives sessions — archival is always an
 * explicit client action. Both `claude remote-control` (standalone bridge) and the
 * always-on `/remote-control` REPL bridge call this during shutdown to archive any
 * sessions that are still alive.
 *
 * The archive endpoint accepts sessions in any status (running, idle,
 * requires_action, pending) and returns 409 if already archived, making
 * it safe to call even if the server-side runner already archived the
 * session.
 *
 * Callers must handle errors — this function has no try/catch; 5xx,
 * timeouts, and network errors throw. Archival is best-effort during
 * cleanup; call sites wrap with .catch().
 */
function archiveBridgeSession(sessionId, opts) {
    return __awaiter(this, void 0, void 0, function () {
        var getClaudeAIOAuthTokens, getOrganizationUUID, getOauthConfig, getOAuthHeaders, axios, accessToken, orgUUID, headers, url, response, detail;
        var _a, _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('../utils/auth.js'); })];
                case 1:
                    getClaudeAIOAuthTokens = (_f.sent()).getClaudeAIOAuthTokens;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../services/oauth/client.js'); })];
                case 2:
                    getOrganizationUUID = (_f.sent()).getOrganizationUUID;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../constants/oauth.js'); })];
                case 3:
                    getOauthConfig = (_f.sent()).getOauthConfig;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../utils/teleport/api.js'); })];
                case 4:
                    getOAuthHeaders = (_f.sent()).getOAuthHeaders;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('axios'); })];
                case 5:
                    axios = (_f.sent()).default;
                    accessToken = (_b = (_a = opts === null || opts === void 0 ? void 0 : opts.getAccessToken) === null || _a === void 0 ? void 0 : _a.call(opts)) !== null && _b !== void 0 ? _b : (_c = getClaudeAIOAuthTokens()) === null || _c === void 0 ? void 0 : _c.accessToken;
                    if (!accessToken) {
                        (0, debug_js_1.logForDebugging)('[bridge] No access token for session archive');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, getOrganizationUUID()];
                case 6:
                    orgUUID = _f.sent();
                    if (!orgUUID) {
                        (0, debug_js_1.logForDebugging)('[bridge] No org UUID for session archive');
                        return [2 /*return*/];
                    }
                    headers = __assign(__assign({}, getOAuthHeaders(accessToken)), { 'anthropic-beta': 'ccr-byoc-2025-07-29', 'x-organization-uuid': orgUUID });
                    url = "".concat((_d = opts === null || opts === void 0 ? void 0 : opts.baseUrl) !== null && _d !== void 0 ? _d : getOauthConfig().BASE_API_URL, "/v1/sessions/").concat(sessionId, "/archive");
                    (0, debug_js_1.logForDebugging)("[bridge] Archiving session ".concat(sessionId));
                    return [4 /*yield*/, axios.post(url, {}, {
                            headers: headers,
                            timeout: (_e = opts === null || opts === void 0 ? void 0 : opts.timeoutMs) !== null && _e !== void 0 ? _e : 10000,
                            validateStatus: function (s) { return s < 500; },
                        })];
                case 7:
                    response = _f.sent();
                    if (response.status === 200) {
                        (0, debug_js_1.logForDebugging)("[bridge] Session ".concat(sessionId, " archived successfully"));
                    }
                    else {
                        detail = (0, debugUtils_js_1.extractErrorDetail)(response.data);
                        (0, debug_js_1.logForDebugging)("[bridge] Session archive failed with status ".concat(response.status).concat(detail ? ": ".concat(detail) : ''));
                    }
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Update the title of a bridge session via PATCH /v1/sessions/{id}.
 *
 * Called when the user renames a session via /rename while a bridge
 * connection is active, so the title stays in sync on claude.ai/code.
 *
 * Errors are swallowed — title sync is best-effort.
 */
function updateBridgeSessionTitle(sessionId, title, opts) {
    return __awaiter(this, void 0, void 0, function () {
        var getClaudeAIOAuthTokens, getOrganizationUUID, getOauthConfig, getOAuthHeaders, axios, accessToken, orgUUID, headers, compatId, url, response, detail, err_3;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('../utils/auth.js'); })];
                case 1:
                    getClaudeAIOAuthTokens = (_e.sent()).getClaudeAIOAuthTokens;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../services/oauth/client.js'); })];
                case 2:
                    getOrganizationUUID = (_e.sent()).getOrganizationUUID;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../constants/oauth.js'); })];
                case 3:
                    getOauthConfig = (_e.sent()).getOauthConfig;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../utils/teleport/api.js'); })];
                case 4:
                    getOAuthHeaders = (_e.sent()).getOAuthHeaders;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('axios'); })];
                case 5:
                    axios = (_e.sent()).default;
                    accessToken = (_b = (_a = opts === null || opts === void 0 ? void 0 : opts.getAccessToken) === null || _a === void 0 ? void 0 : _a.call(opts)) !== null && _b !== void 0 ? _b : (_c = getClaudeAIOAuthTokens()) === null || _c === void 0 ? void 0 : _c.accessToken;
                    if (!accessToken) {
                        (0, debug_js_1.logForDebugging)('[bridge] No access token for session title update');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, getOrganizationUUID()];
                case 6:
                    orgUUID = _e.sent();
                    if (!orgUUID) {
                        (0, debug_js_1.logForDebugging)('[bridge] No org UUID for session title update');
                        return [2 /*return*/];
                    }
                    headers = __assign(__assign({}, getOAuthHeaders(accessToken)), { 'anthropic-beta': 'ccr-byoc-2025-07-29', 'x-organization-uuid': orgUUID });
                    compatId = (0, sessionIdCompat_js_1.toCompatSessionId)(sessionId);
                    url = "".concat((_d = opts === null || opts === void 0 ? void 0 : opts.baseUrl) !== null && _d !== void 0 ? _d : getOauthConfig().BASE_API_URL, "/v1/sessions/").concat(compatId);
                    (0, debug_js_1.logForDebugging)("[bridge] Updating session title: ".concat(compatId, " \u2192 ").concat(title));
                    _e.label = 7;
                case 7:
                    _e.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, axios.patch(url, { title: title }, { headers: headers, timeout: 10000, validateStatus: function (s) { return s < 500; } })];
                case 8:
                    response = _e.sent();
                    if (response.status === 200) {
                        (0, debug_js_1.logForDebugging)("[bridge] Session title updated successfully");
                    }
                    else {
                        detail = (0, debugUtils_js_1.extractErrorDetail)(response.data);
                        (0, debug_js_1.logForDebugging)("[bridge] Session title update failed with status ".concat(response.status).concat(detail ? ": ".concat(detail) : ''));
                    }
                    return [3 /*break*/, 10];
                case 9:
                    err_3 = _e.sent();
                    (0, debug_js_1.logForDebugging)("[bridge] Session title update request failed: ".concat((0, errors_js_1.errorMessage)(err_3)));
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
