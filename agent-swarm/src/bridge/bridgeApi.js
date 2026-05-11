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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeFatalError = void 0;
exports.validateBridgeId = validateBridgeId;
exports.createBridgeApiClient = createBridgeApiClient;
exports.isExpiredErrorType = isExpiredErrorType;
exports.isSuppressible403 = isSuppressible403;
var axios_1 = require("axios");
var debugUtils_js_1 = require("./debugUtils.js");
var types_js_1 = require("./types.js");
var BETA_HEADER = 'environments-2025-11-01';
/** Allowlist pattern for server-provided IDs used in URL path segments. */
var SAFE_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;
/**
 * Validate that a server-provided ID is safe to interpolate into a URL path.
 * Prevents path traversal (e.g. `../../admin`) and injection via IDs that
 * contain slashes, dots, or other special characters.
 */
function validateBridgeId(id, label) {
    if (!id || !SAFE_ID_PATTERN.test(id)) {
        throw new Error("Invalid ".concat(label, ": contains unsafe characters"));
    }
    return id;
}
/** Fatal bridge errors that should not be retried (e.g. auth failures). */
var BridgeFatalError = /** @class */ (function (_super) {
    __extends(BridgeFatalError, _super);
    function BridgeFatalError(message, status, errorType) {
        var _this = _super.call(this, message) || this;
        _this.name = 'BridgeFatalError';
        _this.status = status;
        _this.errorType = errorType;
        return _this;
    }
    return BridgeFatalError;
}(Error));
exports.BridgeFatalError = BridgeFatalError;
function createBridgeApiClient(deps) {
    function debug(msg) {
        var _a;
        (_a = deps.onDebug) === null || _a === void 0 ? void 0 : _a.call(deps, msg);
    }
    var consecutiveEmptyPolls = 0;
    var EMPTY_POLL_LOG_INTERVAL = 100;
    function getHeaders(accessToken) {
        var _a;
        var headers = {
            Authorization: "Bearer ".concat(accessToken),
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01',
            'anthropic-beta': BETA_HEADER,
            'x-environment-runner-version': deps.runnerVersion,
        };
        var deviceToken = (_a = deps.getTrustedDeviceToken) === null || _a === void 0 ? void 0 : _a.call(deps);
        if (deviceToken) {
            headers['X-Trusted-Device-Token'] = deviceToken;
        }
        return headers;
    }
    function resolveAuth() {
        var accessToken = deps.getAccessToken();
        if (!accessToken) {
            throw new Error(types_js_1.BRIDGE_LOGIN_INSTRUCTION);
        }
        return accessToken;
    }
    /**
     * Execute an OAuth-authenticated request with a single retry on 401.
     * On 401, attempts token refresh via handleOAuth401Error (same pattern as
     * withRetry.ts for v1/messages). If refresh succeeds, retries the request
     * once with the new token. If refresh fails or the retry also returns 401,
     * the 401 response is returned for handleErrorStatus to throw BridgeFatalError.
     */
    function withOAuthRetry(fn, context) {
        return __awaiter(this, void 0, void 0, function () {
            var accessToken, response, refreshed, newToken, retryResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        accessToken = resolveAuth();
                        return [4 /*yield*/, fn(accessToken)];
                    case 1:
                        response = _a.sent();
                        if (response.status !== 401) {
                            return [2 /*return*/, response];
                        }
                        if (!deps.onAuth401) {
                            debug("[bridge:api] ".concat(context, ": 401 received, no refresh handler"));
                            return [2 /*return*/, response];
                        }
                        // Attempt token refresh — matches the pattern in withRetry.ts
                        debug("[bridge:api] ".concat(context, ": 401 received, attempting token refresh"));
                        return [4 /*yield*/, deps.onAuth401(accessToken)];
                    case 2:
                        refreshed = _a.sent();
                        if (!refreshed) return [3 /*break*/, 4];
                        debug("[bridge:api] ".concat(context, ": Token refreshed, retrying request"));
                        newToken = resolveAuth();
                        return [4 /*yield*/, fn(newToken)];
                    case 3:
                        retryResponse = _a.sent();
                        if (retryResponse.status !== 401) {
                            return [2 /*return*/, retryResponse];
                        }
                        debug("[bridge:api] ".concat(context, ": Retry after refresh also got 401"));
                        return [3 /*break*/, 5];
                    case 4:
                        debug("[bridge:api] ".concat(context, ": Token refresh failed"));
                        _a.label = 5;
                    case 5: 
                    // Refresh failed — return 401 for handleErrorStatus to throw
                    return [2 /*return*/, response];
                }
            });
        });
    }
    return {
        registerBridgeEnvironment: function (config) {
            return __awaiter(this, void 0, void 0, function () {
                var response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            debug("[bridge:api] POST /v1/environments/bridge bridgeId=".concat(config.bridgeId));
                            return [4 /*yield*/, withOAuthRetry(function (token) {
                                    return axios_1.default.post("".concat(deps.baseUrl, "/v1/environments/bridge"), __assign({ machine_name: config.machineName, directory: config.dir, branch: config.branch, git_repo_url: config.gitRepoUrl, 
                                        // Advertise session capacity so claude.ai/code can show
                                        // "2/4 sessions" badges and only block the picker when
                                        // actually at capacity. Backends that don't yet accept
                                        // this field will silently ignore it.
                                        max_sessions: config.maxSessions, 
                                        // worker_type lets claude.ai filter environments by origin
                                        // (e.g. assistant picker only shows assistant-mode workers).
                                        // Desktop cowork app sends "cowork"; we send a distinct value.
                                        metadata: { worker_type: config.workerType } }, (config.reuseEnvironmentId && {
                                        environment_id: config.reuseEnvironmentId,
                                    })), {
                                        headers: getHeaders(token),
                                        timeout: 15000,
                                        validateStatus: function (status) { return status < 500; },
                                    });
                                }, 'Registration')];
                        case 1:
                            response = _a.sent();
                            handleErrorStatus(response.status, response.data, 'Registration');
                            debug("[bridge:api] POST /v1/environments/bridge -> ".concat(response.status, " environment_id=").concat(response.data.environment_id));
                            debug("[bridge:api] >>> ".concat((0, debugUtils_js_1.debugBody)({ machine_name: config.machineName, directory: config.dir, branch: config.branch, git_repo_url: config.gitRepoUrl, max_sessions: config.maxSessions, metadata: { worker_type: config.workerType } })));
                            debug("[bridge:api] <<< ".concat((0, debugUtils_js_1.debugBody)(response.data)));
                            return [2 /*return*/, response.data];
                    }
                });
            });
        },
        pollForWork: function (environmentId, environmentSecret, signal, reclaimOlderThanMs) {
            return __awaiter(this, void 0, void 0, function () {
                var prevEmptyPolls, response;
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            validateBridgeId(environmentId, 'environmentId');
                            prevEmptyPolls = consecutiveEmptyPolls;
                            consecutiveEmptyPolls = 0;
                            return [4 /*yield*/, axios_1.default.get("".concat(deps.baseUrl, "/v1/environments/").concat(environmentId, "/work/poll"), {
                                    headers: getHeaders(environmentSecret),
                                    params: reclaimOlderThanMs !== undefined
                                        ? { reclaim_older_than_ms: reclaimOlderThanMs }
                                        : undefined,
                                    timeout: 10000,
                                    signal: signal,
                                    validateStatus: function (status) { return status < 500; },
                                })];
                        case 1:
                            response = _c.sent();
                            handleErrorStatus(response.status, response.data, 'Poll');
                            // Empty body or null = no work available
                            if (!response.data) {
                                consecutiveEmptyPolls = prevEmptyPolls + 1;
                                if (consecutiveEmptyPolls === 1 ||
                                    consecutiveEmptyPolls % EMPTY_POLL_LOG_INTERVAL === 0) {
                                    debug("[bridge:api] GET .../work/poll -> ".concat(response.status, " (no work, ").concat(consecutiveEmptyPolls, " consecutive empty polls)"));
                                }
                                return [2 /*return*/, null];
                            }
                            debug("[bridge:api] GET .../work/poll -> ".concat(response.status, " workId=").concat(response.data.id, " type=").concat((_a = response.data.data) === null || _a === void 0 ? void 0 : _a.type).concat(((_b = response.data.data) === null || _b === void 0 ? void 0 : _b.id) ? " sessionId=".concat(response.data.data.id) : ''));
                            debug("[bridge:api] <<< ".concat((0, debugUtils_js_1.debugBody)(response.data)));
                            return [2 /*return*/, response.data];
                    }
                });
            });
        },
        acknowledgeWork: function (environmentId, workId, sessionToken) {
            return __awaiter(this, void 0, void 0, function () {
                var response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            validateBridgeId(environmentId, 'environmentId');
                            validateBridgeId(workId, 'workId');
                            debug("[bridge:api] POST .../work/".concat(workId, "/ack"));
                            return [4 /*yield*/, axios_1.default.post("".concat(deps.baseUrl, "/v1/environments/").concat(environmentId, "/work/").concat(workId, "/ack"), {}, {
                                    headers: getHeaders(sessionToken),
                                    timeout: 10000,
                                    validateStatus: function (s) { return s < 500; },
                                })];
                        case 1:
                            response = _a.sent();
                            handleErrorStatus(response.status, response.data, 'Acknowledge');
                            debug("[bridge:api] POST .../work/".concat(workId, "/ack -> ").concat(response.status));
                            return [2 /*return*/];
                    }
                });
            });
        },
        stopWork: function (environmentId, workId, force) {
            return __awaiter(this, void 0, void 0, function () {
                var response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            validateBridgeId(environmentId, 'environmentId');
                            validateBridgeId(workId, 'workId');
                            debug("[bridge:api] POST .../work/".concat(workId, "/stop force=").concat(force));
                            return [4 /*yield*/, withOAuthRetry(function (token) {
                                    return axios_1.default.post("".concat(deps.baseUrl, "/v1/environments/").concat(environmentId, "/work/").concat(workId, "/stop"), { force: force }, {
                                        headers: getHeaders(token),
                                        timeout: 10000,
                                        validateStatus: function (s) { return s < 500; },
                                    });
                                }, 'StopWork')];
                        case 1:
                            response = _a.sent();
                            handleErrorStatus(response.status, response.data, 'StopWork');
                            debug("[bridge:api] POST .../work/".concat(workId, "/stop -> ").concat(response.status));
                            return [2 /*return*/];
                    }
                });
            });
        },
        deregisterEnvironment: function (environmentId) {
            return __awaiter(this, void 0, void 0, function () {
                var response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            validateBridgeId(environmentId, 'environmentId');
                            debug("[bridge:api] DELETE /v1/environments/bridge/".concat(environmentId));
                            return [4 /*yield*/, withOAuthRetry(function (token) {
                                    return axios_1.default.delete("".concat(deps.baseUrl, "/v1/environments/bridge/").concat(environmentId), {
                                        headers: getHeaders(token),
                                        timeout: 10000,
                                        validateStatus: function (s) { return s < 500; },
                                    });
                                }, 'Deregister')];
                        case 1:
                            response = _a.sent();
                            handleErrorStatus(response.status, response.data, 'Deregister');
                            debug("[bridge:api] DELETE /v1/environments/bridge/".concat(environmentId, " -> ").concat(response.status));
                            return [2 /*return*/];
                    }
                });
            });
        },
        archiveSession: function (sessionId) {
            return __awaiter(this, void 0, void 0, function () {
                var response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            validateBridgeId(sessionId, 'sessionId');
                            debug("[bridge:api] POST /v1/sessions/".concat(sessionId, "/archive"));
                            return [4 /*yield*/, withOAuthRetry(function (token) {
                                    return axios_1.default.post("".concat(deps.baseUrl, "/v1/sessions/").concat(sessionId, "/archive"), {}, {
                                        headers: getHeaders(token),
                                        timeout: 10000,
                                        validateStatus: function (s) { return s < 500; },
                                    });
                                }, 'ArchiveSession')
                                // 409 = already archived (idempotent, not an error)
                            ];
                        case 1:
                            response = _a.sent();
                            // 409 = already archived (idempotent, not an error)
                            if (response.status === 409) {
                                debug("[bridge:api] POST /v1/sessions/".concat(sessionId, "/archive -> 409 (already archived)"));
                                return [2 /*return*/];
                            }
                            handleErrorStatus(response.status, response.data, 'ArchiveSession');
                            debug("[bridge:api] POST /v1/sessions/".concat(sessionId, "/archive -> ").concat(response.status));
                            return [2 /*return*/];
                    }
                });
            });
        },
        reconnectSession: function (environmentId, sessionId) {
            return __awaiter(this, void 0, void 0, function () {
                var response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            validateBridgeId(environmentId, 'environmentId');
                            validateBridgeId(sessionId, 'sessionId');
                            debug("[bridge:api] POST /v1/environments/".concat(environmentId, "/bridge/reconnect session_id=").concat(sessionId));
                            return [4 /*yield*/, withOAuthRetry(function (token) {
                                    return axios_1.default.post("".concat(deps.baseUrl, "/v1/environments/").concat(environmentId, "/bridge/reconnect"), { session_id: sessionId }, {
                                        headers: getHeaders(token),
                                        timeout: 10000,
                                        validateStatus: function (s) { return s < 500; },
                                    });
                                }, 'ReconnectSession')];
                        case 1:
                            response = _a.sent();
                            handleErrorStatus(response.status, response.data, 'ReconnectSession');
                            debug("[bridge:api] POST .../bridge/reconnect -> ".concat(response.status));
                            return [2 /*return*/];
                    }
                });
            });
        },
        heartbeatWork: function (environmentId, workId, sessionToken) {
            return __awaiter(this, void 0, void 0, function () {
                var response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            validateBridgeId(environmentId, 'environmentId');
                            validateBridgeId(workId, 'workId');
                            debug("[bridge:api] POST .../work/".concat(workId, "/heartbeat"));
                            return [4 /*yield*/, axios_1.default.post("".concat(deps.baseUrl, "/v1/environments/").concat(environmentId, "/work/").concat(workId, "/heartbeat"), {}, {
                                    headers: getHeaders(sessionToken),
                                    timeout: 10000,
                                    validateStatus: function (s) { return s < 500; },
                                })];
                        case 1:
                            response = _a.sent();
                            handleErrorStatus(response.status, response.data, 'Heartbeat');
                            debug("[bridge:api] POST .../work/".concat(workId, "/heartbeat -> ").concat(response.status, " lease_extended=").concat(response.data.lease_extended, " state=").concat(response.data.state));
                            return [2 /*return*/, response.data];
                    }
                });
            });
        },
        sendPermissionResponseEvent: function (sessionId, event, sessionToken) {
            return __awaiter(this, void 0, void 0, function () {
                var response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            validateBridgeId(sessionId, 'sessionId');
                            debug("[bridge:api] POST /v1/sessions/".concat(sessionId, "/events type=").concat(event.type));
                            return [4 /*yield*/, axios_1.default.post("".concat(deps.baseUrl, "/v1/sessions/").concat(sessionId, "/events"), { events: [event] }, {
                                    headers: getHeaders(sessionToken),
                                    timeout: 10000,
                                    validateStatus: function (s) { return s < 500; },
                                })];
                        case 1:
                            response = _a.sent();
                            handleErrorStatus(response.status, response.data, 'SendPermissionResponseEvent');
                            debug("[bridge:api] POST /v1/sessions/".concat(sessionId, "/events -> ").concat(response.status));
                            debug("[bridge:api] >>> ".concat((0, debugUtils_js_1.debugBody)({ events: [event] })));
                            debug("[bridge:api] <<< ".concat((0, debugUtils_js_1.debugBody)(response.data)));
                            return [2 /*return*/];
                    }
                });
            });
        },
    };
}
function handleErrorStatus(status, data, context) {
    if (status === 200 || status === 204) {
        return;
    }
    var detail = (0, debugUtils_js_1.extractErrorDetail)(data);
    var errorType = extractErrorTypeFromData(data);
    switch (status) {
        case 401:
            throw new BridgeFatalError("".concat(context, ": Authentication failed (401)").concat(detail ? ": ".concat(detail) : '', ". ").concat(types_js_1.BRIDGE_LOGIN_INSTRUCTION), 401, errorType);
        case 403:
            throw new BridgeFatalError(isExpiredErrorType(errorType)
                ? 'Remote Control session has expired. Please restart with `claude remote-control` or /remote-control.'
                : "".concat(context, ": Access denied (403)").concat(detail ? ": ".concat(detail) : '', ". Check your organization permissions."), 403, errorType);
        case 404:
            throw new BridgeFatalError(detail !== null && detail !== void 0 ? detail : "".concat(context, ": Not found (404). Remote Control may not be available for this organization."), 404, errorType);
        case 410:
            throw new BridgeFatalError(detail !== null && detail !== void 0 ? detail : 'Remote Control session has expired. Please restart with `claude remote-control` or /remote-control.', 410, errorType !== null && errorType !== void 0 ? errorType : 'environment_expired');
        case 429:
            throw new Error("".concat(context, ": Rate limited (429). Polling too frequently."));
        default:
            throw new Error("".concat(context, ": Failed with status ").concat(status).concat(detail ? ": ".concat(detail) : ''));
    }
}
/** Check whether an error type string indicates a session/environment expiry. */
function isExpiredErrorType(errorType) {
    if (!errorType) {
        return false;
    }
    return errorType.includes('expired') || errorType.includes('lifetime');
}
/**
 * Check whether a BridgeFatalError is a suppressible 403 permission error.
 * These are 403 errors for scopes like 'external_poll_sessions' or operations
 * like StopWork that fail because the user's role lacks 'environments:manage'.
 * They don't affect core functionality and shouldn't be shown to users.
 */
function isSuppressible403(err) {
    if (err.status !== 403) {
        return false;
    }
    return (err.message.includes('external_poll_sessions') ||
        err.message.includes('environments:manage'));
}
function extractErrorTypeFromData(data) {
    if (data && typeof data === 'object') {
        if ('error' in data &&
            data.error &&
            typeof data.error === 'object' &&
            'type' in data.error &&
            typeof data.error.type === 'string') {
            return data.error.type;
        }
    }
    return undefined;
}
