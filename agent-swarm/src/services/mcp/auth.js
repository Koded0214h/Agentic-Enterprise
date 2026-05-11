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
exports.ClaudeAuthProvider = exports.AuthenticationCancelledError = void 0;
exports.normalizeOAuthErrorBody = normalizeOAuthErrorBody;
exports.getServerKey = getServerKey;
exports.hasMcpDiscoveryButNoToken = hasMcpDiscoveryButNoToken;
exports.revokeServerTokens = revokeServerTokens;
exports.clearServerTokensFromLocalStorage = clearServerTokensFromLocalStorage;
exports.performMCPOAuthFlow = performMCPOAuthFlow;
exports.wrapFetchWithStepUpDetection = wrapFetchWithStepUpDetection;
exports.readClientSecret = readClientSecret;
exports.saveMcpClientSecret = saveMcpClientSecret;
exports.clearMcpClientConfig = clearMcpClientConfig;
exports.getMcpClientConfig = getMcpClientConfig;
var auth_js_1 = require("@modelcontextprotocol/sdk/client/auth.js");
var errors_js_1 = require("@modelcontextprotocol/sdk/server/auth/errors.js");
var auth_js_2 = require("@modelcontextprotocol/sdk/shared/auth.js");
var axios_1 = require("axios");
var crypto_1 = require("crypto");
var promises_1 = require("fs/promises");
var http_1 = require("http");
var path_1 = require("path");
var url_1 = require("url");
var xss_1 = require("xss");
var oauth_js_1 = require("../../constants/oauth.js");
var browser_js_1 = require("../../utils/browser.js");
var envUtils_js_1 = require("../../utils/envUtils.js");
var errors_js_2 = require("../../utils/errors.js");
var lockfile = require("../../utils/lockfile.js");
var log_js_1 = require("../../utils/log.js");
var platform_js_1 = require("../../utils/platform.js");
var index_js_1 = require("../../utils/secureStorage/index.js");
var macOsKeychainHelpers_js_1 = require("../../utils/secureStorage/macOsKeychainHelpers.js");
var sleep_js_1 = require("../../utils/sleep.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var index_js_2 = require("../analytics/index.js");
var oauthPort_js_1 = require("./oauthPort.js");
var utils_js_1 = require("./utils.js");
var xaa_js_1 = require("./xaa.js");
var xaaIdpLogin_js_1 = require("./xaaIdpLogin.js");
/**
 * Timeout for individual OAuth requests (metadata discovery, token refresh, etc.)
 */
var AUTH_REQUEST_TIMEOUT_MS = 30000;
var MAX_LOCK_RETRIES = 5;
/**
 * OAuth query parameters that should be redacted from logs.
 * These contain sensitive values that could enable CSRF or session fixation attacks.
 */
var SENSITIVE_OAUTH_PARAMS = [
    'state',
    'nonce',
    'code_challenge',
    'code_verifier',
    'code',
];
/**
 * Redacts sensitive OAuth query parameters from a URL for safe logging.
 * Prevents exposure of state, nonce, code_challenge, code_verifier, and authorization codes.
 */
function redactSensitiveUrlParams(url) {
    try {
        var parsedUrl = new URL(url);
        for (var _i = 0, SENSITIVE_OAUTH_PARAMS_1 = SENSITIVE_OAUTH_PARAMS; _i < SENSITIVE_OAUTH_PARAMS_1.length; _i++) {
            var param = SENSITIVE_OAUTH_PARAMS_1[_i];
            if (parsedUrl.searchParams.has(param)) {
                parsedUrl.searchParams.set(param, '[REDACTED]');
            }
        }
        return parsedUrl.toString();
    }
    catch (_a) {
        // Return as-is if not a valid URL
        return url;
    }
}
/**
 * Some OAuth servers (notably Slack) return HTTP 200 for all responses,
 * signaling errors via the JSON body instead. The SDK's executeTokenRequest
 * only calls parseErrorResponse when !response.ok, so a 200 with
 * {"error":"invalid_grant"} gets fed to OAuthTokensSchema.parse() and
 * surfaces as a ZodError — which the refresh retry/invalidation logic
 * treats as opaque request_failed instead of invalid_grant.
 *
 * This wrapper peeks at 2xx POST response bodies and rewrites ones that
 * match OAuthErrorResponseSchema (but not OAuthTokensSchema) to a 400
 * Response, so the SDK's normal error-class mapping applies. The same
 * fetchFn is also used for DCR POSTs, but DCR success responses have no
 * {error: string} field so they don't match the rewrite condition.
 *
 * Slack uses non-standard error codes (invalid_refresh_token observed live
 * at oauth.v2.user.access; expired_refresh_token/token_expired per Slack's
 * token rotation docs) where RFC 6749 specifies invalid_grant. We normalize
 * those so OAUTH_ERRORS['invalid_grant'] → InvalidGrantError matches and
 * token invalidation fires correctly.
 */
var NONSTANDARD_INVALID_GRANT_ALIASES = new Set([
    'invalid_refresh_token',
    'expired_refresh_token',
    'token_expired',
]);
/* eslint-disable eslint-plugin-n/no-unsupported-features/node-builtins --
 * Response has been stable in Node since 18; the rule flags it as
 * experimental-until-21 which is incorrect. Pattern matches existing
 * createAuthFetch suppressions in this file. */
function normalizeOAuthErrorBody(response) {
    return __awaiter(this, void 0, void 0, function () {
        var text, parsed, result, normalized;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!response.ok) {
                        return [2 /*return*/, response];
                    }
                    return [4 /*yield*/, response.text()];
                case 1:
                    text = _b.sent();
                    try {
                        parsed = (0, slowOperations_js_1.jsonParse)(text);
                    }
                    catch (_c) {
                        return [2 /*return*/, new Response(text, response)];
                    }
                    if (auth_js_2.OAuthTokensSchema.safeParse(parsed).success) {
                        return [2 /*return*/, new Response(text, response)];
                    }
                    result = auth_js_2.OAuthErrorResponseSchema.safeParse(parsed);
                    if (!result.success) {
                        return [2 /*return*/, new Response(text, response)];
                    }
                    normalized = NONSTANDARD_INVALID_GRANT_ALIASES.has(result.data.error)
                        ? {
                            error: 'invalid_grant',
                            error_description: (_a = result.data.error_description) !== null && _a !== void 0 ? _a : "Server returned non-standard error code: ".concat(result.data.error),
                        }
                        : result.data;
                    return [2 /*return*/, new Response((0, slowOperations_js_1.jsonStringify)(normalized), {
                            status: 400,
                            statusText: 'Bad Request',
                            headers: response.headers,
                        })];
            }
        });
    });
}
/* eslint-enable eslint-plugin-n/no-unsupported-features/node-builtins */
/**
 * Creates a fetch function with a fresh 30-second timeout for each OAuth request.
 * Used by ClaudeAuthProvider for metadata discovery and token refresh.
 * Prevents stale timeout signals from affecting auth operations.
 */
function createAuthFetch() {
    var _this = this;
    return function (url, init) { return __awaiter(_this, void 0, void 0, function () {
        var timeoutSignal, isPost, response, controller, abort, cleanup, response, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    timeoutSignal = AbortSignal.timeout(AUTH_REQUEST_TIMEOUT_MS);
                    isPost = ((_a = init === null || init === void 0 ? void 0 : init.method) === null || _a === void 0 ? void 0 : _a.toUpperCase()) === 'POST';
                    if (!!(init === null || init === void 0 ? void 0 : init.signal)) return [3 /*break*/, 2];
                    return [4 /*yield*/, fetch(url, __assign(__assign({}, init), { signal: timeoutSignal }))];
                case 1:
                    response = _b.sent();
                    return [2 /*return*/, isPost ? normalizeOAuthErrorBody(response) : response];
                case 2:
                    controller = new AbortController();
                    abort = function () { return controller.abort(); };
                    init.signal.addEventListener('abort', abort);
                    timeoutSignal.addEventListener('abort', abort);
                    cleanup = function () {
                        var _a;
                        (_a = init.signal) === null || _a === void 0 ? void 0 : _a.removeEventListener('abort', abort);
                        timeoutSignal.removeEventListener('abort', abort);
                    };
                    if (init.signal.aborted) {
                        controller.abort();
                    }
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, fetch(url, __assign(__assign({}, init), { signal: controller.signal }))];
                case 4:
                    response = _b.sent();
                    cleanup();
                    return [2 /*return*/, isPost ? normalizeOAuthErrorBody(response) : response];
                case 5:
                    error_1 = _b.sent();
                    cleanup();
                    throw error_1;
                case 6: return [2 /*return*/];
            }
        });
    }); };
}
/**
 * Fetches authorization server metadata, using a configured metadata URL if available,
 * otherwise performing RFC 9728 → RFC 8414 discovery via the SDK.
 *
 * Discovery order when no configured URL:
 * 1. RFC 9728: probe /.well-known/oauth-protected-resource on the MCP server,
 *    read authorization_servers[0], then RFC 8414 against that URL.
 * 2. Fallback: RFC 8414 directly against the MCP server URL (path-aware). Covers
 *    legacy servers that co-host auth metadata at /.well-known/oauth-authorization-server/{path}
 *    without implementing RFC 9728. The SDK's own fallback strips the path, so this
 *    preserves the pre-existing path-aware probe for backward compatibility.
 *
 * Note: configuredMetadataUrl is user-controlled via .mcp.json. Project-scoped MCP
 * servers require user approval before connecting (same trust level as the MCP server
 * URL itself). The HTTPS requirement here is defense-in-depth beyond schema validation
 * — RFC 8414 mandates OAuth metadata retrieval over TLS.
 */
function fetchAuthServerMetadata(serverName, serverUrl, configuredMetadataUrl, fetchFn, resourceMetadataUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var authFetch, response, _a, _b, authorizationServerMetadata, err_1, url;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!configuredMetadataUrl) return [3 /*break*/, 4];
                    if (!configuredMetadataUrl.startsWith('https://')) {
                        throw new Error("authServerMetadataUrl must use https:// (got: ".concat(configuredMetadataUrl, ")"));
                    }
                    authFetch = fetchFn !== null && fetchFn !== void 0 ? fetchFn : createAuthFetch();
                    return [4 /*yield*/, authFetch(configuredMetadataUrl, {
                            headers: { Accept: 'application/json' },
                        })];
                case 1:
                    response = _c.sent();
                    if (!response.ok) return [3 /*break*/, 3];
                    _b = (_a = auth_js_2.OAuthMetadataSchema).parse;
                    return [4 /*yield*/, response.json()];
                case 2: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                case 3: throw new Error("HTTP ".concat(response.status, " fetching configured auth server metadata from ").concat(configuredMetadataUrl));
                case 4:
                    _c.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, (0, auth_js_1.discoverOAuthServerInfo)(serverUrl, __assign(__assign({}, (fetchFn && { fetchFn: fetchFn })), (resourceMetadataUrl && { resourceMetadataUrl: resourceMetadataUrl })))];
                case 5:
                    authorizationServerMetadata = (_c.sent()).authorizationServerMetadata;
                    if (authorizationServerMetadata) {
                        return [2 /*return*/, authorizationServerMetadata];
                    }
                    return [3 /*break*/, 7];
                case 6:
                    err_1 = _c.sent();
                    // Any error from the RFC 9728 → RFC 8414 chain (5xx from the root or
                    // resolved-AS probe, schema parse failure, network error) — fall through
                    // to the legacy path-aware retry.
                    (0, log_js_1.logMCPDebug)(serverName, "RFC 9728 discovery failed, falling back: ".concat((0, errors_js_2.errorMessage)(err_1)));
                    return [3 /*break*/, 7];
                case 7:
                    url = new URL(serverUrl);
                    if (url.pathname === '/') {
                        return [2 /*return*/, undefined];
                    }
                    return [2 /*return*/, (0, auth_js_1.discoverAuthorizationServerMetadata)(url, __assign({}, (fetchFn && { fetchFn: fetchFn })))];
            }
        });
    });
}
var AuthenticationCancelledError = /** @class */ (function (_super) {
    __extends(AuthenticationCancelledError, _super);
    function AuthenticationCancelledError() {
        var _this = _super.call(this, 'Authentication was cancelled') || this;
        _this.name = 'AuthenticationCancelledError';
        return _this;
    }
    return AuthenticationCancelledError;
}(Error));
exports.AuthenticationCancelledError = AuthenticationCancelledError;
/**
 * Generates a unique key for server credentials based on both name and config hash
 * This prevents credentials from being reused across different servers
 * with the same name or different configurations
 */
function getServerKey(serverName, serverConfig) {
    var configJson = (0, slowOperations_js_1.jsonStringify)({
        type: serverConfig.type,
        url: serverConfig.url,
        headers: serverConfig.headers || {},
    });
    var hash = (0, crypto_1.createHash)('sha256')
        .update(configJson)
        .digest('hex')
        .substring(0, 16);
    return "".concat(serverName, "|").concat(hash);
}
/**
 * True when we have probed this server before (OAuth discovery state is
 * stored) but hold no credentials to try. A connection attempt in this
 * state is guaranteed to 401 — the only way out is the user running
 * /mcp to authenticate.
 */
function hasMcpDiscoveryButNoToken(serverName, serverConfig) {
    var _a, _b, _c;
    // XAA servers can silently re-auth via cached id_token even without an
    // access/refresh token — tokens() fires the xaaRefresh path. Skipping the
    // connection here would make that auto-auth branch unreachable after
    // invalidateCredentials('tokens') clears the stored tokens.
    if ((0, xaaIdpLogin_js_1.isXaaEnabled)() && ((_a = serverConfig.oauth) === null || _a === void 0 ? void 0 : _a.xaa)) {
        return false;
    }
    var serverKey = getServerKey(serverName, serverConfig);
    var entry = (_c = (_b = (0, index_js_1.getSecureStorage)().read()) === null || _b === void 0 ? void 0 : _b.mcpOAuth) === null || _c === void 0 ? void 0 : _c[serverKey];
    return entry !== undefined && !entry.accessToken && !entry.refreshToken;
}
/**
 * Revokes a single token on the OAuth server.
 *
 * Per RFC 7009, public clients (like Claude Code) should authenticate by including
 * client_id in the request body, NOT via an Authorization header. The Bearer token
 * in an Authorization header is meant for resource owner authentication, not client
 * authentication.
 *
 * However, the MCP spec doesn't explicitly define token revocation behavior, so some
 * servers may not be RFC 7009 compliant. As defensive programming, we:
 * 1. First try the RFC 7009 compliant approach (client_id in body, no Authorization header)
 * 2. If we get a 401, retry with Bearer auth as a fallback for non-compliant servers
 *
 * This fallback should rarely be needed - most servers either accept the compliant
 * approach or ignore unexpected headers.
 */
function revokeToken(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var params, headers, basic, error_2;
        var _c;
        var serverName = _b.serverName, endpoint = _b.endpoint, token = _b.token, tokenTypeHint = _b.tokenTypeHint, clientId = _b.clientId, clientSecret = _b.clientSecret, accessToken = _b.accessToken, _d = _b.authMethod, authMethod = _d === void 0 ? 'client_secret_basic' : _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    params = new URLSearchParams();
                    params.set('token', token);
                    params.set('token_type_hint', tokenTypeHint);
                    headers = {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    };
                    // RFC 7009 §2.1 requires client auth per RFC 6749 §2.3. XAA always uses a
                    // confidential client at the AS — strict ASes (Okta/Stytch) reject public-
                    // client revocation of confidential-client tokens.
                    if (clientId && clientSecret) {
                        if (authMethod === 'client_secret_post') {
                            params.set('client_id', clientId);
                            params.set('client_secret', clientSecret);
                        }
                        else {
                            basic = Buffer.from("".concat(encodeURIComponent(clientId), ":").concat(encodeURIComponent(clientSecret))).toString('base64');
                            headers.Authorization = "Basic ".concat(basic);
                        }
                    }
                    else if (clientId) {
                        params.set('client_id', clientId);
                    }
                    else {
                        (0, log_js_1.logMCPDebug)(serverName, "No client_id available for ".concat(tokenTypeHint, " revocation - server may reject"));
                    }
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 3, , 7]);
                    return [4 /*yield*/, axios_1.default.post(endpoint, params, { headers: headers })];
                case 2:
                    _e.sent();
                    (0, log_js_1.logMCPDebug)(serverName, "Successfully revoked ".concat(tokenTypeHint));
                    return [3 /*break*/, 7];
                case 3:
                    error_2 = _e.sent();
                    if (!(axios_1.default.isAxiosError(error_2) &&
                        ((_c = error_2.response) === null || _c === void 0 ? void 0 : _c.status) === 401 &&
                        accessToken)) return [3 /*break*/, 5];
                    (0, log_js_1.logMCPDebug)(serverName, "Got 401, retrying ".concat(tokenTypeHint, " revocation with Bearer auth"));
                    // RFC 6749 §2.3.1: must not send more than one auth method. The retry
                    // switches to Bearer — clear any client creds from the body.
                    params.delete('client_id');
                    params.delete('client_secret');
                    return [4 /*yield*/, axios_1.default.post(endpoint, params, {
                            headers: __assign(__assign({}, headers), { Authorization: "Bearer ".concat(accessToken) }),
                        })];
                case 4:
                    _e.sent();
                    (0, log_js_1.logMCPDebug)(serverName, "Successfully revoked ".concat(tokenTypeHint, " with Bearer auth"));
                    return [3 /*break*/, 6];
                case 5: throw error_2;
                case 6: return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
/**
 * Revokes tokens on the OAuth server if a revocation endpoint is available.
 * Per RFC 7009, we revoke the refresh token first (the long-lived credential),
 * then the access token. Revoking the refresh token prevents generation of new
 * access tokens and many servers implicitly invalidate associated access tokens.
 */
function revokeServerTokens(serverName_1, serverConfig_1) {
    return __awaiter(this, arguments, void 0, function (serverName, serverConfig, _a) {
        var storage, existingData, serverKey, tokenData, asUrl, metadata, revocationEndpoint, revocationEndpointStr, authMethods, authMethod, error_3, error_4, error_5, freshData, updatedData;
        var _b;
        var _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        var _p = _a === void 0 ? {} : _a, _q = _p.preserveStepUpState, preserveStepUpState = _q === void 0 ? false : _q;
        return __generator(this, function (_r) {
            switch (_r.label) {
                case 0:
                    storage = (0, index_js_1.getSecureStorage)();
                    existingData = storage.read();
                    if (!(existingData === null || existingData === void 0 ? void 0 : existingData.mcpOAuth))
                        return [2 /*return*/];
                    serverKey = getServerKey(serverName, serverConfig);
                    tokenData = existingData.mcpOAuth[serverKey];
                    if (!((tokenData === null || tokenData === void 0 ? void 0 : tokenData.accessToken) || (tokenData === null || tokenData === void 0 ? void 0 : tokenData.refreshToken))) return [3 /*break*/, 15];
                    _r.label = 1;
                case 1:
                    _r.trys.push([1, 13, , 14]);
                    asUrl = (_d = (_c = tokenData.discoveryState) === null || _c === void 0 ? void 0 : _c.authorizationServerUrl) !== null && _d !== void 0 ? _d : serverConfig.url;
                    return [4 /*yield*/, fetchAuthServerMetadata(serverName, asUrl, (_e = serverConfig.oauth) === null || _e === void 0 ? void 0 : _e.authServerMetadataUrl)];
                case 2:
                    metadata = _r.sent();
                    if (!!metadata) return [3 /*break*/, 3];
                    (0, log_js_1.logMCPDebug)(serverName, 'No OAuth metadata found');
                    return [3 /*break*/, 12];
                case 3:
                    revocationEndpoint = 'revocation_endpoint' in metadata
                        ? metadata.revocation_endpoint
                        : null;
                    if (!!revocationEndpoint) return [3 /*break*/, 4];
                    (0, log_js_1.logMCPDebug)(serverName, 'Server does not support token revocation');
                    return [3 /*break*/, 12];
                case 4:
                    revocationEndpointStr = String(revocationEndpoint);
                    authMethods = (_f = ('revocation_endpoint_auth_methods_supported' in metadata
                        ? metadata.revocation_endpoint_auth_methods_supported
                        : undefined)) !== null && _f !== void 0 ? _f : ('token_endpoint_auth_methods_supported' in metadata
                        ? metadata.token_endpoint_auth_methods_supported
                        : undefined);
                    authMethod = authMethods &&
                        !authMethods.includes('client_secret_basic') &&
                        authMethods.includes('client_secret_post')
                        ? 'client_secret_post'
                        : 'client_secret_basic';
                    (0, log_js_1.logMCPDebug)(serverName, "Revoking tokens via ".concat(revocationEndpointStr, " (").concat(authMethod, ")"));
                    if (!tokenData.refreshToken) return [3 /*break*/, 8];
                    _r.label = 5;
                case 5:
                    _r.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, revokeToken({
                            serverName: serverName,
                            endpoint: revocationEndpointStr,
                            token: tokenData.refreshToken,
                            tokenTypeHint: 'refresh_token',
                            clientId: tokenData.clientId,
                            clientSecret: tokenData.clientSecret,
                            accessToken: tokenData.accessToken,
                            authMethod: authMethod,
                        })];
                case 6:
                    _r.sent();
                    return [3 /*break*/, 8];
                case 7:
                    error_3 = _r.sent();
                    // Log but continue
                    (0, log_js_1.logMCPDebug)(serverName, "Failed to revoke refresh token: ".concat((0, errors_js_2.errorMessage)(error_3)));
                    return [3 /*break*/, 8];
                case 8:
                    if (!tokenData.accessToken) return [3 /*break*/, 12];
                    _r.label = 9;
                case 9:
                    _r.trys.push([9, 11, , 12]);
                    return [4 /*yield*/, revokeToken({
                            serverName: serverName,
                            endpoint: revocationEndpointStr,
                            token: tokenData.accessToken,
                            tokenTypeHint: 'access_token',
                            clientId: tokenData.clientId,
                            clientSecret: tokenData.clientSecret,
                            accessToken: tokenData.accessToken,
                            authMethod: authMethod,
                        })];
                case 10:
                    _r.sent();
                    return [3 /*break*/, 12];
                case 11:
                    error_4 = _r.sent();
                    (0, log_js_1.logMCPDebug)(serverName, "Failed to revoke access token: ".concat((0, errors_js_2.errorMessage)(error_4)));
                    return [3 /*break*/, 12];
                case 12: return [3 /*break*/, 14];
                case 13:
                    error_5 = _r.sent();
                    // Log error but don't throw - revocation is best-effort
                    (0, log_js_1.logMCPDebug)(serverName, "Failed to revoke tokens: ".concat((0, errors_js_2.errorMessage)(error_5)));
                    return [3 /*break*/, 14];
                case 14: return [3 /*break*/, 16];
                case 15:
                    (0, log_js_1.logMCPDebug)(serverName, 'No tokens to revoke');
                    _r.label = 16;
                case 16:
                    // Always clear local tokens, regardless of server-side revocation result.
                    clearServerTokensFromLocalStorage(serverName, serverConfig);
                    // When re-authenticating, preserve step-up auth state (scope + discovery)
                    // so the next performMCPOAuthFlow can use cached scope instead of
                    // re-probing. For "Clear Auth" (default), wipe everything.
                    if (preserveStepUpState &&
                        tokenData &&
                        (tokenData.stepUpScope || tokenData.discoveryState)) {
                        freshData = storage.read() || {};
                        updatedData = __assign(__assign({}, freshData), { mcpOAuth: __assign(__assign({}, freshData.mcpOAuth), (_b = {}, _b[serverKey] = __assign(__assign(__assign(__assign({}, (_g = freshData.mcpOAuth) === null || _g === void 0 ? void 0 : _g[serverKey]), { serverName: serverName, serverUrl: serverConfig.url, accessToken: (_k = (_j = (_h = freshData.mcpOAuth) === null || _h === void 0 ? void 0 : _h[serverKey]) === null || _j === void 0 ? void 0 : _j.accessToken) !== null && _k !== void 0 ? _k : '', expiresAt: (_o = (_m = (_l = freshData.mcpOAuth) === null || _l === void 0 ? void 0 : _l[serverKey]) === null || _m === void 0 ? void 0 : _m.expiresAt) !== null && _o !== void 0 ? _o : 0 }), (tokenData.stepUpScope
                                ? { stepUpScope: tokenData.stepUpScope }
                                : {})), (tokenData.discoveryState
                                ? {
                                    // Strip legacy bulky metadata fields here too so users with
                                    // existing overflowed blobs recover on next re-auth (#30337).
                                    discoveryState: {
                                        authorizationServerUrl: tokenData.discoveryState.authorizationServerUrl,
                                        resourceMetadataUrl: tokenData.discoveryState.resourceMetadataUrl,
                                    },
                                }
                                : {})), _b)) });
                        storage.update(updatedData);
                        (0, log_js_1.logMCPDebug)(serverName, 'Preserved step-up auth state across revocation');
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function clearServerTokensFromLocalStorage(serverName, serverConfig) {
    var storage = (0, index_js_1.getSecureStorage)();
    var existingData = storage.read();
    if (!(existingData === null || existingData === void 0 ? void 0 : existingData.mcpOAuth))
        return;
    var serverKey = getServerKey(serverName, serverConfig);
    if (existingData.mcpOAuth[serverKey]) {
        delete existingData.mcpOAuth[serverKey];
        storage.update(existingData);
        (0, log_js_1.logMCPDebug)(serverName, 'Cleared stored tokens');
    }
}
/**
 * XAA (Cross-App Access) auth.
 *
 * One IdP browser login is reused across all XAA-configured MCP servers:
 * 1. Acquire an id_token from the IdP (cached in keychain by issuer; if
 *    missing/expired, runs a standard OIDC authorization_code+PKCE flow
 *    — this is the one browser pop)
 * 2. Run the RFC 8693 + RFC 7523 exchange (no browser)
 * 3. Save tokens to the same keychain slot as normal OAuth
 *
 * IdP connection details come from settings.xaaIdp (configured once via
 * `claude mcp xaa setup`). Per-server config is just `oauth.xaa: true`
 * plus the AS clientId/clientSecret.
 *
 * No silent fallback: if `oauth.xaa` is set, XAA is the only path.
 * All errors are actionable — they tell the user what to run.
 */
function performMCPXaaAuth(serverName, serverConfig, onAuthorizationUrl, abortSignal, skipBrowserOpen) {
    return __awaiter(this, void 0, void 0, function () {
        var idp, clientId, clientConfig, clientSecret, wantedKey, haveKeys, headersForLogging, idpClientSecret, idTokenCacheHit, failureStage, idToken, e_1, oidc, tokens, e_2, msg, storage, existingData, serverKey, prev, e_3;
        var _a;
        var _b, _c, _d, _e, _f, _g, _h;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    if (!((_b = serverConfig.oauth) === null || _b === void 0 ? void 0 : _b.xaa)) {
                        throw new Error('XAA: oauth.xaa must be set'); // guarded by caller
                    }
                    idp = (0, xaaIdpLogin_js_1.getXaaIdpSettings)();
                    if (!idp) {
                        throw new Error("XAA: no IdP connection configured. Run 'claude mcp xaa setup --issuer <url> --client-id <id> --client-secret' to configure.");
                    }
                    clientId = (_c = serverConfig.oauth) === null || _c === void 0 ? void 0 : _c.clientId;
                    if (!clientId) {
                        throw new Error("XAA: server '".concat(serverName, "' needs an AS client_id. Re-add with --client-id."));
                    }
                    clientConfig = getMcpClientConfig(serverName, serverConfig);
                    clientSecret = clientConfig === null || clientConfig === void 0 ? void 0 : clientConfig.clientSecret;
                    if (!clientSecret) {
                        wantedKey = getServerKey(serverName, serverConfig);
                        haveKeys = Object.keys((_e = (_d = (0, index_js_1.getSecureStorage)().read()) === null || _d === void 0 ? void 0 : _d.mcpOAuthClientConfig) !== null && _e !== void 0 ? _e : {});
                        headersForLogging = Object.fromEntries(Object.entries((_f = serverConfig.headers) !== null && _f !== void 0 ? _f : {}).map(function (_a) {
                            var k = _a[0], v = _a[1];
                            return k.toLowerCase() === 'authorization' ? [k, '[REDACTED]'] : [k, v];
                        }));
                        (0, log_js_1.logMCPDebug)(serverName, "XAA: secret lookup miss. wanted=".concat(wantedKey, " have=[").concat(haveKeys.join(', '), "] configHeaders=").concat((0, slowOperations_js_1.jsonStringify)(headersForLogging)));
                        throw new Error("XAA: AS client secret not found for '".concat(serverName, "'. Re-add with --client-secret."));
                    }
                    (0, log_js_1.logMCPDebug)(serverName, 'XAA: starting cross-app access flow');
                    idpClientSecret = (0, xaaIdpLogin_js_1.getIdpClientSecret)(idp.issuer);
                    idTokenCacheHit = (0, xaaIdpLogin_js_1.getCachedIdpIdToken)(idp.issuer) !== undefined;
                    failureStage = 'idp_login';
                    _j.label = 1;
                case 1:
                    _j.trys.push([1, 11, , 12]);
                    idToken = void 0;
                    _j.label = 2;
                case 2:
                    _j.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, xaaIdpLogin_js_1.acquireIdpIdToken)({
                            idpIssuer: idp.issuer,
                            idpClientId: idp.clientId,
                            idpClientSecret: idpClientSecret,
                            callbackPort: idp.callbackPort,
                            onAuthorizationUrl: onAuthorizationUrl,
                            skipBrowserOpen: skipBrowserOpen,
                            abortSignal: abortSignal,
                        })];
                case 3:
                    idToken = _j.sent();
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _j.sent();
                    if (abortSignal === null || abortSignal === void 0 ? void 0 : abortSignal.aborted)
                        throw new AuthenticationCancelledError();
                    throw e_1;
                case 5:
                    // Discover the IdP's token endpoint for the RFC 8693 exchange.
                    failureStage = 'discovery';
                    return [4 /*yield*/, (0, xaaIdpLogin_js_1.discoverOidc)(idp.issuer)
                        // Run the exchange. performCrossAppAccess throws XaaTokenExchangeError
                        // for the IdP leg and "jwt-bearer grant failed" for the AS leg.
                    ];
                case 6:
                    oidc = _j.sent();
                    // Run the exchange. performCrossAppAccess throws XaaTokenExchangeError
                    // for the IdP leg and "jwt-bearer grant failed" for the AS leg.
                    failureStage = 'token_exchange';
                    tokens = void 0;
                    _j.label = 7;
                case 7:
                    _j.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, (0, xaa_js_1.performCrossAppAccess)(serverConfig.url, {
                            clientId: clientId,
                            clientSecret: clientSecret,
                            idpClientId: idp.clientId,
                            idpClientSecret: idpClientSecret,
                            idpIdToken: idToken,
                            idpTokenEndpoint: oidc.token_endpoint,
                        }, serverName, abortSignal)];
                case 8:
                    tokens = _j.sent();
                    return [3 /*break*/, 10];
                case 9:
                    e_2 = _j.sent();
                    if (abortSignal === null || abortSignal === void 0 ? void 0 : abortSignal.aborted)
                        throw new AuthenticationCancelledError();
                    msg = (0, errors_js_2.errorMessage)(e_2);
                    // If the IdP says the id_token is bad, drop it from the cache so the
                    // next attempt does a fresh IdP login. XaaTokenExchangeError carries
                    // shouldClearIdToken so we key off OAuth semantics (4xx / invalid body
                    // → clear; 5xx IdP outage → preserve) rather than substring matching.
                    if (e_2 instanceof xaa_js_1.XaaTokenExchangeError) {
                        if (e_2.shouldClearIdToken) {
                            (0, xaaIdpLogin_js_1.clearIdpIdToken)(idp.issuer);
                            (0, log_js_1.logMCPDebug)(serverName, 'XAA: cleared cached id_token after token-exchange failure');
                        }
                    }
                    else if (msg.includes('PRM discovery failed') ||
                        msg.includes('AS metadata discovery failed') ||
                        msg.includes('no authorization server supports jwt-bearer')) {
                        // performCrossAppAccess runs PRM + AS discovery before the actual
                        // exchange — don't attribute their failures to 'token_exchange'.
                        failureStage = 'discovery';
                    }
                    else if (msg.includes('jwt-bearer')) {
                        failureStage = 'jwt_bearer';
                    }
                    throw e_2;
                case 10:
                    storage = (0, index_js_1.getSecureStorage)();
                    existingData = storage.read() || {};
                    serverKey = getServerKey(serverName, serverConfig);
                    prev = (_g = existingData.mcpOAuth) === null || _g === void 0 ? void 0 : _g[serverKey];
                    storage.update(__assign(__assign({}, existingData), { mcpOAuth: __assign(__assign({}, existingData.mcpOAuth), (_a = {}, _a[serverKey] = __assign(__assign({}, prev), { serverName: serverName, serverUrl: serverConfig.url, accessToken: tokens.access_token, 
                            // AS may omit refresh_token on jwt-bearer — preserve any existing one
                            refreshToken: (_h = tokens.refresh_token) !== null && _h !== void 0 ? _h : prev === null || prev === void 0 ? void 0 : prev.refreshToken, expiresAt: Date.now() + (tokens.expires_in || 3600) * 1000, scope: tokens.scope, clientId: clientId, clientSecret: clientSecret, 
                            // Persist the AS URL so _doRefresh and revokeServerTokens can locate
                            // the token/revocation endpoints when MCP URL ≠ AS URL (the common
                            // XAA topology).
                            discoveryState: {
                                authorizationServerUrl: tokens.authorizationServerUrl,
                            } }), _a)) }));
                    (0, log_js_1.logMCPDebug)(serverName, 'XAA: tokens saved');
                    (0, index_js_2.logEvent)('tengu_mcp_oauth_flow_success', {
                        authMethod: 'xaa',
                        idTokenCacheHit: idTokenCacheHit,
                    });
                    return [3 /*break*/, 12];
                case 11:
                    e_3 = _j.sent();
                    // User-initiated cancel (Esc during IdP browser pop) isn't a failure.
                    if (e_3 instanceof AuthenticationCancelledError) {
                        throw e_3;
                    }
                    (0, index_js_2.logEvent)('tengu_mcp_oauth_flow_failure', {
                        authMethod: 'xaa',
                        xaaFailureStage: failureStage,
                        idTokenCacheHit: idTokenCacheHit,
                    });
                    throw e_3;
                case 12: return [2 /*return*/];
            }
        });
    });
}
function performMCPOAuthFlow(serverName, serverConfig, onAuthorizationUrl, abortSignal, options) {
    return __awaiter(this, void 0, void 0, function () {
        var storage, serverKey, cachedEntry, cachedStepUpScope, cachedResourceMetadataUrl, resourceMetadataUrl, wwwAuthParams, flowAttemptId, authorizationCodeObtained, configuredCallbackPort, port_1, _a, redirectUri, provider_1, metadata, error_6, oauthState_1, server_1, timeoutId_1, abortHandler_1, cleanup_1, authorizationCode, result, savedTokens, error_7, reason, oauthErrorCode, httpStatus, msg, statusMatch, storage_1, existingData, serverKey_1;
        var _this = this;
        var _b, _c, _d, _e, _f, _g, _h, _j;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0:
                    if (!((_b = serverConfig.oauth) === null || _b === void 0 ? void 0 : _b.xaa)) return [3 /*break*/, 2];
                    if (!(0, xaaIdpLogin_js_1.isXaaEnabled)()) {
                        throw new Error("XAA is not enabled (set CLAUDE_CODE_ENABLE_XAA=1). Remove 'oauth.xaa' from server '".concat(serverName, "' to use the standard consent flow."));
                    }
                    (0, index_js_2.logEvent)('tengu_mcp_oauth_flow_start', __assign({ isOAuthFlow: true, authMethod: 'xaa', transportType: serverConfig.type }, ((0, utils_js_1.getLoggingSafeMcpBaseUrl)(serverConfig)
                        ? {
                            mcpServerBaseUrl: (0, utils_js_1.getLoggingSafeMcpBaseUrl)(serverConfig),
                        }
                        : {})));
                    // performMCPXaaAuth logs its own success/failure events (with
                    // idTokenCacheHit + xaaFailureStage).
                    return [4 /*yield*/, performMCPXaaAuth(serverName, serverConfig, onAuthorizationUrl, abortSignal, options === null || options === void 0 ? void 0 : options.skipBrowserOpen)];
                case 1:
                    // performMCPXaaAuth logs its own success/failure events (with
                    // idTokenCacheHit + xaaFailureStage).
                    _k.sent();
                    return [2 /*return*/];
                case 2:
                    storage = (0, index_js_1.getSecureStorage)();
                    serverKey = getServerKey(serverName, serverConfig);
                    cachedEntry = (_d = (_c = storage.read()) === null || _c === void 0 ? void 0 : _c.mcpOAuth) === null || _d === void 0 ? void 0 : _d[serverKey];
                    cachedStepUpScope = cachedEntry === null || cachedEntry === void 0 ? void 0 : cachedEntry.stepUpScope;
                    cachedResourceMetadataUrl = (_e = cachedEntry === null || cachedEntry === void 0 ? void 0 : cachedEntry.discoveryState) === null || _e === void 0 ? void 0 : _e.resourceMetadataUrl;
                    // Clear any existing stored credentials to ensure fresh client registration.
                    // Note: this deletes the entire entry (including discoveryState/stepUpScope),
                    // but we already read the cached values above.
                    clearServerTokensFromLocalStorage(serverName, serverConfig);
                    if (cachedResourceMetadataUrl) {
                        try {
                            resourceMetadataUrl = new URL(cachedResourceMetadataUrl);
                        }
                        catch (_l) {
                            (0, log_js_1.logMCPDebug)(serverName, "Invalid cached resourceMetadataUrl: ".concat(cachedResourceMetadataUrl));
                        }
                    }
                    wwwAuthParams = {
                        scope: cachedStepUpScope,
                        resourceMetadataUrl: resourceMetadataUrl,
                    };
                    flowAttemptId = (0, crypto_1.randomUUID)();
                    (0, index_js_2.logEvent)('tengu_mcp_oauth_flow_start', __assign({ flowAttemptId: flowAttemptId, isOAuthFlow: true, transportType: serverConfig.type }, ((0, utils_js_1.getLoggingSafeMcpBaseUrl)(serverConfig)
                        ? {
                            mcpServerBaseUrl: (0, utils_js_1.getLoggingSafeMcpBaseUrl)(serverConfig),
                        }
                        : {})));
                    authorizationCodeObtained = false;
                    _k.label = 3;
                case 3:
                    _k.trys.push([3, 17, , 18]);
                    configuredCallbackPort = (_f = serverConfig.oauth) === null || _f === void 0 ? void 0 : _f.callbackPort;
                    if (!(configuredCallbackPort !== null && configuredCallbackPort !== void 0)) return [3 /*break*/, 4];
                    _a = configuredCallbackPort;
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, (0, oauthPort_js_1.findAvailablePort)()];
                case 5:
                    _a = (_k.sent());
                    _k.label = 6;
                case 6:
                    port_1 = _a;
                    redirectUri = (0, oauthPort_js_1.buildRedirectUri)(port_1);
                    (0, log_js_1.logMCPDebug)(serverName, "Using redirect port: ".concat(port_1).concat(configuredCallbackPort ? ' (from config)' : ''));
                    provider_1 = new ClaudeAuthProvider(serverName, serverConfig, redirectUri, true, onAuthorizationUrl, options === null || options === void 0 ? void 0 : options.skipBrowserOpen);
                    _k.label = 7;
                case 7:
                    _k.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, fetchAuthServerMetadata(serverName, serverConfig.url, (_g = serverConfig.oauth) === null || _g === void 0 ? void 0 : _g.authServerMetadataUrl, undefined, wwwAuthParams.resourceMetadataUrl)];
                case 8:
                    metadata = _k.sent();
                    if (metadata) {
                        // Store metadata in provider for scope information
                        provider_1.setMetadata(metadata);
                        (0, log_js_1.logMCPDebug)(serverName, "Fetched OAuth metadata with scope: ".concat(getScopeFromMetadata(metadata) || 'NONE'));
                    }
                    return [3 /*break*/, 10];
                case 9:
                    error_6 = _k.sent();
                    (0, log_js_1.logMCPDebug)(serverName, "Failed to fetch OAuth metadata: ".concat((0, errors_js_2.errorMessage)(error_6)));
                    return [3 /*break*/, 10];
                case 10: return [4 /*yield*/, provider_1.state()
                    // Store the server, timeout, and abort listener references for cleanup
                ];
                case 11:
                    oauthState_1 = _k.sent();
                    server_1 = null;
                    timeoutId_1 = null;
                    abortHandler_1 = null;
                    cleanup_1 = function () {
                        if (server_1) {
                            server_1.removeAllListeners();
                            // Defensive: removeAllListeners() strips the error handler, so swallow any late error during close
                            server_1.on('error', function () { });
                            server_1.close();
                            server_1 = null;
                        }
                        if (timeoutId_1) {
                            clearTimeout(timeoutId_1);
                            timeoutId_1 = null;
                        }
                        if (abortSignal && abortHandler_1) {
                            abortSignal.removeEventListener('abort', abortHandler_1);
                            abortHandler_1 = null;
                        }
                        (0, log_js_1.logMCPDebug)(serverName, "MCP OAuth server cleaned up");
                    };
                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                            var resolved = false;
                            var resolveOnce = function (code) {
                                if (resolved)
                                    return;
                                resolved = true;
                                resolve(code);
                            };
                            var rejectOnce = function (error) {
                                if (resolved)
                                    return;
                                resolved = true;
                                reject(error);
                            };
                            if (abortSignal) {
                                abortHandler_1 = function () {
                                    cleanup_1();
                                    rejectOnce(new AuthenticationCancelledError());
                                };
                                if (abortSignal.aborted) {
                                    abortHandler_1();
                                    return;
                                }
                                abortSignal.addEventListener('abort', abortHandler_1);
                            }
                            // Allow manual callback URL paste for remote/browser-based environments
                            // where localhost is not reachable from the user's browser.
                            if (options === null || options === void 0 ? void 0 : options.onWaitingForCallback) {
                                options.onWaitingForCallback(function (callbackUrl) {
                                    try {
                                        var parsed = new URL(callbackUrl);
                                        var code = parsed.searchParams.get('code');
                                        var state = parsed.searchParams.get('state');
                                        var error = parsed.searchParams.get('error');
                                        if (error) {
                                            var errorDescription = parsed.searchParams.get('error_description') || '';
                                            cleanup_1();
                                            rejectOnce(new Error("OAuth error: ".concat(error, " - ").concat(errorDescription)));
                                            return;
                                        }
                                        if (!code) {
                                            // Not a valid callback URL, ignore so the user can try again
                                            return;
                                        }
                                        if (state !== oauthState_1) {
                                            cleanup_1();
                                            rejectOnce(new Error('OAuth state mismatch - possible CSRF attack'));
                                            return;
                                        }
                                        (0, log_js_1.logMCPDebug)(serverName, "Received auth code via manual callback URL");
                                        cleanup_1();
                                        resolveOnce(code);
                                    }
                                    catch (_a) {
                                        // Invalid URL, ignore so the user can try again
                                    }
                                });
                            }
                            server_1 = (0, http_1.createServer)(function (req, res) {
                                var parsedUrl = (0, url_1.parse)(req.url || '', true);
                                if (parsedUrl.pathname === '/callback') {
                                    var code = parsedUrl.query.code;
                                    var state = parsedUrl.query.state;
                                    var error = parsedUrl.query.error;
                                    var errorDescription = parsedUrl.query.error_description;
                                    var errorUri = parsedUrl.query.error_uri;
                                    // Validate OAuth state to prevent CSRF attacks
                                    if (!error && state !== oauthState_1) {
                                        res.writeHead(400, { 'Content-Type': 'text/html' });
                                        res.end("<h1>Authentication Error</h1><p>Invalid state parameter. Please try again.</p><p>You can close this window.</p>");
                                        cleanup_1();
                                        rejectOnce(new Error('OAuth state mismatch - possible CSRF attack'));
                                        return;
                                    }
                                    if (error) {
                                        res.writeHead(200, { 'Content-Type': 'text/html' });
                                        // Sanitize error messages to prevent XSS
                                        var sanitizedError = (0, xss_1.default)(String(error));
                                        var sanitizedErrorDescription = errorDescription
                                            ? (0, xss_1.default)(String(errorDescription))
                                            : '';
                                        res.end("<h1>Authentication Error</h1><p>".concat(sanitizedError, ": ").concat(sanitizedErrorDescription, "</p><p>You can close this window.</p>"));
                                        cleanup_1();
                                        var errorMessage_1 = "OAuth error: ".concat(error);
                                        if (errorDescription) {
                                            errorMessage_1 += " - ".concat(errorDescription);
                                        }
                                        if (errorUri) {
                                            errorMessage_1 += " (See: ".concat(errorUri, ")");
                                        }
                                        rejectOnce(new Error(errorMessage_1));
                                        return;
                                    }
                                    if (code) {
                                        res.writeHead(200, { 'Content-Type': 'text/html' });
                                        res.end("<h1>Authentication Successful</h1><p>You can close this window. Return to Claude Code.</p>");
                                        cleanup_1();
                                        resolveOnce(code);
                                    }
                                }
                            });
                            server_1.on('error', function (err) {
                                cleanup_1();
                                if (err.code === 'EADDRINUSE') {
                                    var findCmd = (0, platform_js_1.getPlatform)() === 'windows'
                                        ? "netstat -ano | findstr :".concat(port_1)
                                        : "lsof -ti:".concat(port_1, " -sTCP:LISTEN");
                                    rejectOnce(new Error("OAuth callback port ".concat(port_1, " is already in use \u2014 another process may be holding it. ") +
                                        "Run `".concat(findCmd, "` to find it.")));
                                }
                                else {
                                    rejectOnce(new Error("OAuth callback server failed: ".concat(err.message)));
                                }
                            });
                            server_1.listen(port_1, '127.0.0.1', function () { return __awaiter(_this, void 0, void 0, function () {
                                var result_1, error_8;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            _a.trys.push([0, 2, , 3]);
                                            (0, log_js_1.logMCPDebug)(serverName, "Starting SDK auth");
                                            (0, log_js_1.logMCPDebug)(serverName, "Server URL: ".concat(serverConfig.url));
                                            return [4 /*yield*/, (0, auth_js_1.auth)(provider_1, {
                                                    serverUrl: serverConfig.url,
                                                    scope: wwwAuthParams.scope,
                                                    resourceMetadataUrl: wwwAuthParams.resourceMetadataUrl,
                                                })];
                                        case 1:
                                            result_1 = _a.sent();
                                            (0, log_js_1.logMCPDebug)(serverName, "Initial auth result: ".concat(result_1));
                                            if (result_1 !== 'REDIRECT') {
                                                (0, log_js_1.logMCPDebug)(serverName, "Unexpected auth result, expected REDIRECT: ".concat(result_1));
                                            }
                                            return [3 /*break*/, 3];
                                        case 2:
                                            error_8 = _a.sent();
                                            (0, log_js_1.logMCPDebug)(serverName, "SDK auth error: ".concat(error_8));
                                            cleanup_1();
                                            rejectOnce(new Error("SDK auth failed: ".concat((0, errors_js_2.errorMessage)(error_8))));
                                            return [3 /*break*/, 3];
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            }); });
                            // Don't let the callback server or timeout pin the event loop — if the UI
                            // component unmounts without aborting (e.g. parent intercepts Esc), we'd
                            // rather let the process exit than stay alive for 5 minutes holding the
                            // port. The abortSignal is the intended lifecycle management.
                            server_1.unref();
                            timeoutId_1 = setTimeout(function (cleanup, rejectOnce) {
                                cleanup();
                                rejectOnce(new Error('Authentication timeout'));
                            }, 5 * 60 * 1000, // 5 minutes
                            cleanup_1, rejectOnce);
                            timeoutId_1.unref();
                        })];
                case 12:
                    authorizationCode = _k.sent();
                    authorizationCodeObtained = true;
                    // Now complete the auth flow with the received code
                    (0, log_js_1.logMCPDebug)(serverName, "Completing auth flow with authorization code");
                    return [4 /*yield*/, (0, auth_js_1.auth)(provider_1, {
                            serverUrl: serverConfig.url,
                            authorizationCode: authorizationCode,
                            resourceMetadataUrl: wwwAuthParams.resourceMetadataUrl,
                        })];
                case 13:
                    result = _k.sent();
                    (0, log_js_1.logMCPDebug)(serverName, "Auth result: ".concat(result));
                    if (!(result === 'AUTHORIZED')) return [3 /*break*/, 15];
                    return [4 /*yield*/, provider_1.tokens()];
                case 14:
                    savedTokens = _k.sent();
                    (0, log_js_1.logMCPDebug)(serverName, "Tokens after auth: ".concat(savedTokens ? 'Present' : 'Missing'));
                    if (savedTokens) {
                        (0, log_js_1.logMCPDebug)(serverName, "Token access_token length: ".concat((_h = savedTokens.access_token) === null || _h === void 0 ? void 0 : _h.length));
                        (0, log_js_1.logMCPDebug)(serverName, "Token expires_in: ".concat(savedTokens.expires_in));
                    }
                    (0, index_js_2.logEvent)('tengu_mcp_oauth_flow_success', __assign({ flowAttemptId: flowAttemptId, transportType: serverConfig.type }, ((0, utils_js_1.getLoggingSafeMcpBaseUrl)(serverConfig)
                        ? {
                            mcpServerBaseUrl: (0, utils_js_1.getLoggingSafeMcpBaseUrl)(serverConfig),
                        }
                        : {})));
                    return [3 /*break*/, 16];
                case 15: throw new Error('Unexpected auth result: ' + result);
                case 16: return [3 /*break*/, 18];
                case 17:
                    error_7 = _k.sent();
                    (0, log_js_1.logMCPDebug)(serverName, "Error during auth completion: ".concat(error_7));
                    reason = 'unknown';
                    oauthErrorCode = void 0;
                    httpStatus = void 0;
                    if (error_7 instanceof AuthenticationCancelledError) {
                        reason = 'cancelled';
                    }
                    else if (authorizationCodeObtained) {
                        reason = 'token_exchange_failed';
                    }
                    else {
                        msg = (0, errors_js_2.errorMessage)(error_7);
                        if (msg.includes('Authentication timeout')) {
                            reason = 'timeout';
                        }
                        else if (msg.includes('OAuth state mismatch')) {
                            reason = 'state_mismatch';
                        }
                        else if (msg.includes('OAuth error:')) {
                            reason = 'provider_denied';
                        }
                        else if (msg.includes('already in use') ||
                            msg.includes('EADDRINUSE') ||
                            msg.includes('callback server failed') ||
                            msg.includes('No available port')) {
                            reason = 'port_unavailable';
                        }
                        else if (msg.includes('SDK auth failed')) {
                            reason = 'sdk_auth_failed';
                        }
                    }
                    // sdkAuth uses native fetch and throws OAuthError subclasses (InvalidGrantError,
                    // ServerError, InvalidClientError, etc.) via parseErrorResponse. Extract the
                    // OAuth error code directly from the SDK error instance.
                    if (error_7 instanceof errors_js_1.OAuthError) {
                        oauthErrorCode = error_7.errorCode;
                        statusMatch = error_7.message.match(/^HTTP (\d{3}):/);
                        if (statusMatch) {
                            httpStatus = Number(statusMatch[1]);
                        }
                        // If client not found, clear the stored client ID and suggest retry
                        if (error_7.errorCode === 'invalid_client' &&
                            error_7.message.includes('Client not found')) {
                            storage_1 = (0, index_js_1.getSecureStorage)();
                            existingData = storage_1.read() || {};
                            serverKey_1 = getServerKey(serverName, serverConfig);
                            if ((_j = existingData.mcpOAuth) === null || _j === void 0 ? void 0 : _j[serverKey_1]) {
                                delete existingData.mcpOAuth[serverKey_1].clientId;
                                delete existingData.mcpOAuth[serverKey_1].clientSecret;
                                storage_1.update(existingData);
                            }
                        }
                    }
                    (0, index_js_2.logEvent)('tengu_mcp_oauth_flow_error', __assign({ flowAttemptId: flowAttemptId, reason: reason, error_code: oauthErrorCode, http_status: httpStatus === null || httpStatus === void 0 ? void 0 : httpStatus.toString(), transportType: serverConfig.type }, ((0, utils_js_1.getLoggingSafeMcpBaseUrl)(serverConfig)
                        ? {
                            mcpServerBaseUrl: (0, utils_js_1.getLoggingSafeMcpBaseUrl)(serverConfig),
                        }
                        : {})));
                    throw error_7;
                case 18: return [2 /*return*/];
            }
        });
    });
}
/**
 * Wraps fetch to detect 403 insufficient_scope responses and mark step-up
 * pending on the provider BEFORE the SDK's 403 handler calls auth(). Without
 * this, the SDK's authInternal sees refresh_token → refreshes (uselessly, since
 * RFC 6749 §6 forbids scope elevation via refresh) → returns 'AUTHORIZED' →
 * retry → 403 again → aborts with "Server returned 403 after trying upscoping",
 * never reaching redirectToAuthorization where step-up scope is persisted.
 * With this flag set, tokens() omits refresh_token so the SDK falls through
 * to the PKCE flow. See github.com/anthropics/claude-code/issues/28258.
 */
function wrapFetchWithStepUpDetection(baseFetch, provider) {
    var _this = this;
    return function (url, init) { return __awaiter(_this, void 0, void 0, function () {
        var response, wwwAuth, match, scope;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, baseFetch(url, init)];
                case 1:
                    response = _b.sent();
                    if (response.status === 403) {
                        wwwAuth = response.headers.get('WWW-Authenticate');
                        if (wwwAuth === null || wwwAuth === void 0 ? void 0 : wwwAuth.includes('insufficient_scope')) {
                            match = wwwAuth.match(/scope=(?:"([^"]+)"|([^\s,]+))/);
                            scope = (_a = match === null || match === void 0 ? void 0 : match[1]) !== null && _a !== void 0 ? _a : match === null || match === void 0 ? void 0 : match[2];
                            if (scope) {
                                provider.markStepUpPending(scope);
                            }
                        }
                    }
                    return [2 /*return*/, response];
            }
        });
    }); };
}
var ClaudeAuthProvider = /** @class */ (function () {
    function ClaudeAuthProvider(serverName, serverConfig, redirectUri, handleRedirection, onAuthorizationUrl, skipBrowserOpen) {
        if (redirectUri === void 0) { redirectUri = (0, oauthPort_js_1.buildRedirectUri)(); }
        if (handleRedirection === void 0) { handleRedirection = false; }
        this.serverName = serverName;
        this.serverConfig = serverConfig;
        this.redirectUri = redirectUri;
        this.handleRedirection = handleRedirection;
        this.onAuthorizationUrlCallback = onAuthorizationUrl;
        this.skipBrowserOpen = skipBrowserOpen !== null && skipBrowserOpen !== void 0 ? skipBrowserOpen : false;
    }
    Object.defineProperty(ClaudeAuthProvider.prototype, "redirectUrl", {
        get: function () {
            return this.redirectUri;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClaudeAuthProvider.prototype, "authorizationUrl", {
        get: function () {
            return this._authorizationUrl;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClaudeAuthProvider.prototype, "clientMetadata", {
        get: function () {
            var metadata = {
                client_name: "Claude Code (".concat(this.serverName, ")"),
                redirect_uris: [this.redirectUri],
                grant_types: ['authorization_code', 'refresh_token'],
                response_types: ['code'],
                token_endpoint_auth_method: 'none', // Public client
            };
            // Include scope from metadata if available
            var metadataScope = getScopeFromMetadata(this._metadata);
            if (metadataScope) {
                metadata.scope = metadataScope;
                (0, log_js_1.logMCPDebug)(this.serverName, "Using scope from metadata: ".concat(metadata.scope));
            }
            return metadata;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClaudeAuthProvider.prototype, "clientMetadataUrl", {
        /**
         * CIMD (SEP-991): URL-based client_id. When the auth server advertises
         * client_id_metadata_document_supported: true, the SDK uses this URL as the
         * client_id instead of performing Dynamic Client Registration.
         * Override via MCP_OAUTH_CLIENT_METADATA_URL env var (e.g. for testing, FedStart).
         */
        get: function () {
            var override = process.env.MCP_OAUTH_CLIENT_METADATA_URL;
            if (override) {
                (0, log_js_1.logMCPDebug)(this.serverName, "Using CIMD URL from env: ".concat(override));
                return override;
            }
            return oauth_js_1.MCP_CLIENT_METADATA_URL;
        },
        enumerable: false,
        configurable: true
    });
    ClaudeAuthProvider.prototype.setMetadata = function (metadata) {
        this._metadata = metadata;
    };
    /**
     * Called by the fetch wrapper when a 403 insufficient_scope response is
     * detected. Setting this causes tokens() to omit refresh_token, forcing
     * the SDK's authInternal to skip its (useless) refresh path and fall through
     * to startAuthorization → redirectToAuthorization → step-up persistence.
     * RFC 6749 §6 forbids scope elevation via refresh, so refreshing would just
     * return the same-scoped token and the retry would 403 again.
     */
    ClaudeAuthProvider.prototype.markStepUpPending = function (scope) {
        this._pendingStepUpScope = scope;
        (0, log_js_1.logMCPDebug)(this.serverName, "Marked step-up pending: ".concat(scope));
    };
    ClaudeAuthProvider.prototype.state = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Generate state if not already generated for this instance
                if (!this._state) {
                    this._state = (0, crypto_1.randomBytes)(32).toString('base64url');
                    (0, log_js_1.logMCPDebug)(this.serverName, 'Generated new OAuth state');
                }
                return [2 /*return*/, this._state];
            });
        });
    };
    ClaudeAuthProvider.prototype.clientInformation = function () {
        return __awaiter(this, void 0, void 0, function () {
            var storage, data, serverKey, storedInfo, configClientId, clientConfig;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                storage = (0, index_js_1.getSecureStorage)();
                data = storage.read();
                serverKey = getServerKey(this.serverName, this.serverConfig);
                storedInfo = (_a = data === null || data === void 0 ? void 0 : data.mcpOAuth) === null || _a === void 0 ? void 0 : _a[serverKey];
                if (storedInfo === null || storedInfo === void 0 ? void 0 : storedInfo.clientId) {
                    (0, log_js_1.logMCPDebug)(this.serverName, "Found client info");
                    return [2 /*return*/, {
                            client_id: storedInfo.clientId,
                            client_secret: storedInfo.clientSecret,
                        }];
                }
                configClientId = (_b = this.serverConfig.oauth) === null || _b === void 0 ? void 0 : _b.clientId;
                if (configClientId) {
                    clientConfig = (_c = data === null || data === void 0 ? void 0 : data.mcpOAuthClientConfig) === null || _c === void 0 ? void 0 : _c[serverKey];
                    (0, log_js_1.logMCPDebug)(this.serverName, "Using pre-configured client ID");
                    return [2 /*return*/, {
                            client_id: configClientId,
                            client_secret: clientConfig === null || clientConfig === void 0 ? void 0 : clientConfig.clientSecret,
                        }];
                }
                // If we don't have stored client info, return undefined to trigger registration
                (0, log_js_1.logMCPDebug)(this.serverName, "No client info found");
                return [2 /*return*/, undefined];
            });
        });
    };
    ClaudeAuthProvider.prototype.saveClientInformation = function (clientInformation) {
        return __awaiter(this, void 0, void 0, function () {
            var storage, existingData, serverKey, updatedData;
            var _a;
            var _b, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                storage = (0, index_js_1.getSecureStorage)();
                existingData = storage.read() || {};
                serverKey = getServerKey(this.serverName, this.serverConfig);
                updatedData = __assign(__assign({}, existingData), { mcpOAuth: __assign(__assign({}, existingData.mcpOAuth), (_a = {}, _a[serverKey] = __assign(__assign({}, (_b = existingData.mcpOAuth) === null || _b === void 0 ? void 0 : _b[serverKey]), { serverName: this.serverName, serverUrl: this.serverConfig.url, clientId: clientInformation.client_id, clientSecret: clientInformation.client_secret, 
                        // Provide default values for required fields if not present
                        accessToken: ((_d = (_c = existingData.mcpOAuth) === null || _c === void 0 ? void 0 : _c[serverKey]) === null || _d === void 0 ? void 0 : _d.accessToken) || '', expiresAt: ((_f = (_e = existingData.mcpOAuth) === null || _e === void 0 ? void 0 : _e[serverKey]) === null || _f === void 0 ? void 0 : _f.expiresAt) || 0 }), _a)) });
                storage.update(updatedData);
                return [2 /*return*/];
            });
        });
    };
    ClaudeAuthProvider.prototype.tokens = function () {
        return __awaiter(this, void 0, void 0, function () {
            var storage, data, serverKey, tokenData, refreshed, e_4, expiresIn, currentScopes, needsStepUp, refreshed, error_9, tokens;
            var _this = this;
            var _a, _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        storage = (0, index_js_1.getSecureStorage)();
                        return [4 /*yield*/, storage.readAsync()];
                    case 1:
                        data = _f.sent();
                        serverKey = getServerKey(this.serverName, this.serverConfig);
                        tokenData = (_a = data === null || data === void 0 ? void 0 : data.mcpOAuth) === null || _a === void 0 ? void 0 : _a[serverKey];
                        if (!((0, xaaIdpLogin_js_1.isXaaEnabled)() &&
                            ((_b = this.serverConfig.oauth) === null || _b === void 0 ? void 0 : _b.xaa) &&
                            !(tokenData === null || tokenData === void 0 ? void 0 : tokenData.refreshToken) &&
                            (!(tokenData === null || tokenData === void 0 ? void 0 : tokenData.accessToken) ||
                                (tokenData.expiresAt - Date.now()) / 1000 <= 300))) return [3 /*break*/, 5];
                        if (!this._refreshInProgress) {
                            (0, log_js_1.logMCPDebug)(this.serverName, tokenData
                                ? "XAA: access_token expiring, attempting silent exchange"
                                : "XAA: no access_token yet, attempting silent exchange");
                            this._refreshInProgress = this.xaaRefresh().finally(function () {
                                _this._refreshInProgress = undefined;
                            });
                        }
                        _f.label = 2;
                    case 2:
                        _f.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this._refreshInProgress];
                    case 3:
                        refreshed = _f.sent();
                        if (refreshed)
                            return [2 /*return*/, refreshed];
                        return [3 /*break*/, 5];
                    case 4:
                        e_4 = _f.sent();
                        (0, log_js_1.logMCPDebug)(this.serverName, "XAA silent exchange failed: ".concat((0, errors_js_2.errorMessage)(e_4)));
                        return [3 /*break*/, 5];
                    case 5:
                        if (!tokenData) {
                            (0, log_js_1.logMCPDebug)(this.serverName, "No token data found");
                            return [2 /*return*/, undefined];
                        }
                        expiresIn = (tokenData.expiresAt - Date.now()) / 1000;
                        currentScopes = (_d = (_c = tokenData.scope) === null || _c === void 0 ? void 0 : _c.split(' ')) !== null && _d !== void 0 ? _d : [];
                        needsStepUp = this._pendingStepUpScope !== undefined &&
                            this._pendingStepUpScope.split(' ').some(function (s) { return !currentScopes.includes(s); });
                        if (needsStepUp) {
                            (0, log_js_1.logMCPDebug)(this.serverName, "Step-up pending (".concat(this._pendingStepUpScope, "), omitting refresh_token"));
                        }
                        // If token is expired and we don't have a refresh token, return undefined
                        if (expiresIn <= 0 && !tokenData.refreshToken) {
                            (0, log_js_1.logMCPDebug)(this.serverName, "Token expired without refresh token");
                            return [2 /*return*/, undefined];
                        }
                        if (!(expiresIn <= 300 && tokenData.refreshToken && !needsStepUp)) return [3 /*break*/, 9];
                        // Reuse existing refresh promise if one is in progress to prevent concurrent refreshes
                        if (!this._refreshInProgress) {
                            (0, log_js_1.logMCPDebug)(this.serverName, "Token expires in ".concat(Math.floor(expiresIn), "s, attempting proactive refresh"));
                            this._refreshInProgress = this.refreshAuthorization(tokenData.refreshToken).finally(function () {
                                _this._refreshInProgress = undefined;
                            });
                        }
                        else {
                            (0, log_js_1.logMCPDebug)(this.serverName, "Token refresh already in progress, reusing existing promise");
                        }
                        _f.label = 6;
                    case 6:
                        _f.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, this._refreshInProgress];
                    case 7:
                        refreshed = _f.sent();
                        if (refreshed) {
                            (0, log_js_1.logMCPDebug)(this.serverName, "Token refreshed successfully");
                            return [2 /*return*/, refreshed];
                        }
                        (0, log_js_1.logMCPDebug)(this.serverName, "Token refresh failed, returning current tokens");
                        return [3 /*break*/, 9];
                    case 8:
                        error_9 = _f.sent();
                        (0, log_js_1.logMCPDebug)(this.serverName, "Token refresh error: ".concat((0, errors_js_2.errorMessage)(error_9)));
                        return [3 /*break*/, 9];
                    case 9:
                        tokens = {
                            access_token: tokenData.accessToken,
                            refresh_token: needsStepUp ? undefined : tokenData.refreshToken,
                            expires_in: expiresIn,
                            scope: tokenData.scope,
                            token_type: 'Bearer',
                        };
                        (0, log_js_1.logMCPDebug)(this.serverName, "Returning tokens");
                        (0, log_js_1.logMCPDebug)(this.serverName, "Token length: ".concat((_e = tokens.access_token) === null || _e === void 0 ? void 0 : _e.length));
                        (0, log_js_1.logMCPDebug)(this.serverName, "Has refresh token: ".concat(!!tokens.refresh_token));
                        (0, log_js_1.logMCPDebug)(this.serverName, "Expires in: ".concat(Math.floor(expiresIn), "s"));
                        return [2 /*return*/, tokens];
                }
            });
        });
    };
    ClaudeAuthProvider.prototype.saveTokens = function (tokens) {
        return __awaiter(this, void 0, void 0, function () {
            var storage, existingData, serverKey, updatedData;
            var _a;
            var _b;
            return __generator(this, function (_c) {
                this._pendingStepUpScope = undefined;
                storage = (0, index_js_1.getSecureStorage)();
                existingData = storage.read() || {};
                serverKey = getServerKey(this.serverName, this.serverConfig);
                (0, log_js_1.logMCPDebug)(this.serverName, "Saving tokens");
                (0, log_js_1.logMCPDebug)(this.serverName, "Token expires in: ".concat(tokens.expires_in));
                (0, log_js_1.logMCPDebug)(this.serverName, "Has refresh token: ".concat(!!tokens.refresh_token));
                updatedData = __assign(__assign({}, existingData), { mcpOAuth: __assign(__assign({}, existingData.mcpOAuth), (_a = {}, _a[serverKey] = __assign(__assign({}, (_b = existingData.mcpOAuth) === null || _b === void 0 ? void 0 : _b[serverKey]), { serverName: this.serverName, serverUrl: this.serverConfig.url, accessToken: tokens.access_token, refreshToken: tokens.refresh_token, expiresAt: Date.now() + (tokens.expires_in || 3600) * 1000, scope: tokens.scope }), _a)) });
                storage.update(updatedData);
                return [2 /*return*/];
            });
        });
    };
    /**
     * XAA silent refresh: cached id_token → Layer-2 exchange → new access_token.
     * No browser.
     *
     * Returns undefined if the id_token is gone from cache — caller treats this
     * as needs-interactive-reauth (transport will 401, CC surfaces it).
     *
     * On exchange failure, clears the id_token cache so the next interactive
     * auth does a fresh IdP login (the cached id_token is likely stale/revoked).
     *
     * TODO(xaa-ga): add cross-process lockfile before GA. `_refreshInProgress`
     * only dedupes within one process — two CC instances with expiring tokens
     * both fire the full 4-request XAA chain and race on storage.update().
     * Unlike inc-4829 the id_token is not single-use so both access_tokens
     * stay valid (wasted round-trips + keychain write race, not brickage),
     * but this is the shape CLAUDE.md flags under "Token/auth caching across
     * process boundaries". Mirror refreshAuthorization()'s lockfile pattern.
     */
    ClaudeAuthProvider.prototype.xaaRefresh = function () {
        return __awaiter(this, void 0, void 0, function () {
            var idp, idToken, clientId, clientConfig, idpClientSecret, oidc, e_5, tokens, storage, existingData, serverKey, prev, e_6;
            var _a;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        idp = (0, xaaIdpLogin_js_1.getXaaIdpSettings)();
                        if (!idp)
                            return [2 /*return*/, undefined]; // config was removed mid-session
                        idToken = (0, xaaIdpLogin_js_1.getCachedIdpIdToken)(idp.issuer);
                        if (!idToken) {
                            (0, log_js_1.logMCPDebug)(this.serverName, 'XAA: id_token not cached, needs interactive re-auth');
                            return [2 /*return*/, undefined];
                        }
                        clientId = (_b = this.serverConfig.oauth) === null || _b === void 0 ? void 0 : _b.clientId;
                        clientConfig = getMcpClientConfig(this.serverName, this.serverConfig);
                        if (!clientId || !(clientConfig === null || clientConfig === void 0 ? void 0 : clientConfig.clientSecret)) {
                            (0, log_js_1.logMCPDebug)(this.serverName, 'XAA: missing clientId or clientSecret in config — skipping silent refresh');
                            return [2 /*return*/, undefined]; // shouldn't happen if `mcp add` was correct
                        }
                        idpClientSecret = (0, xaaIdpLogin_js_1.getIdpClientSecret)(idp.issuer);
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, xaaIdpLogin_js_1.discoverOidc)(idp.issuer)];
                    case 2:
                        oidc = _e.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_5 = _e.sent();
                        (0, log_js_1.logMCPDebug)(this.serverName, "XAA: OIDC discovery failed in silent refresh: ".concat((0, errors_js_2.errorMessage)(e_5)));
                        return [2 /*return*/, undefined];
                    case 4:
                        _e.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, (0, xaa_js_1.performCrossAppAccess)(this.serverConfig.url, {
                                clientId: clientId,
                                clientSecret: clientConfig.clientSecret,
                                idpClientId: idp.clientId,
                                idpClientSecret: idpClientSecret,
                                idpIdToken: idToken,
                                idpTokenEndpoint: oidc.token_endpoint,
                            }, this.serverName)
                            // Write directly (not via saveTokens) so clientId + clientSecret land in
                            // storage even when this is the first write for serverKey. saveTokens
                            // only spreads existing data; if no prior performMCPXaaAuth ran,
                            // revokeServerTokens would later read tokenData.clientId as undefined
                            // and send a client_id-less RFC 7009 request that strict ASes reject.
                        ];
                    case 5:
                        tokens = _e.sent();
                        storage = (0, index_js_1.getSecureStorage)();
                        existingData = storage.read() || {};
                        serverKey = getServerKey(this.serverName, this.serverConfig);
                        prev = (_c = existingData.mcpOAuth) === null || _c === void 0 ? void 0 : _c[serverKey];
                        storage.update(__assign(__assign({}, existingData), { mcpOAuth: __assign(__assign({}, existingData.mcpOAuth), (_a = {}, _a[serverKey] = __assign(__assign({}, prev), { serverName: this.serverName, serverUrl: this.serverConfig.url, accessToken: tokens.access_token, refreshToken: (_d = tokens.refresh_token) !== null && _d !== void 0 ? _d : prev === null || prev === void 0 ? void 0 : prev.refreshToken, expiresAt: Date.now() + (tokens.expires_in || 3600) * 1000, scope: tokens.scope, clientId: clientId, clientSecret: clientConfig.clientSecret, discoveryState: {
                                    authorizationServerUrl: tokens.authorizationServerUrl,
                                } }), _a)) }));
                        return [2 /*return*/, {
                                access_token: tokens.access_token,
                                token_type: 'Bearer',
                                expires_in: tokens.expires_in,
                                scope: tokens.scope,
                                refresh_token: tokens.refresh_token,
                            }];
                    case 6:
                        e_6 = _e.sent();
                        if (e_6 instanceof xaa_js_1.XaaTokenExchangeError && e_6.shouldClearIdToken) {
                            (0, xaaIdpLogin_js_1.clearIdpIdToken)(idp.issuer);
                            (0, log_js_1.logMCPDebug)(this.serverName, 'XAA: cleared id_token after exchange failure');
                        }
                        throw e_6;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    ClaudeAuthProvider.prototype.redirectToAuthorization = function (authorizationUrl) {
        return __awaiter(this, void 0, void 0, function () {
            var scopes, metadataScope, storage, existingData, serverKey, existing, urlString, redactedUrl, success;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // Store the authorization URL
                        this._authorizationUrl = authorizationUrl.toString();
                        scopes = authorizationUrl.searchParams.get('scope');
                        (0, log_js_1.logMCPDebug)(this.serverName, "Authorization URL: ".concat(redactSensitiveUrlParams(authorizationUrl.toString())));
                        (0, log_js_1.logMCPDebug)(this.serverName, "Scopes in URL: ".concat(scopes || 'NOT FOUND'));
                        if (scopes) {
                            this._scopes = scopes;
                            (0, log_js_1.logMCPDebug)(this.serverName, "Captured scopes from authorization URL: ".concat(scopes));
                        }
                        else {
                            metadataScope = getScopeFromMetadata(this._metadata);
                            if (metadataScope) {
                                this._scopes = metadataScope;
                                (0, log_js_1.logMCPDebug)(this.serverName, "Using scopes from metadata: ".concat(metadataScope));
                            }
                            else {
                                (0, log_js_1.logMCPDebug)(this.serverName, "No scopes available from URL or metadata");
                            }
                        }
                        // Persist scope for step-up auth: only when the transport-attached provider
                        // (handleRedirection=false) receives a step-up 401. The SDK calls auth()
                        // which calls redirectToAuthorization with the new scope. We persist it
                        // so the next performMCPOAuthFlow can use it without an extra probe request.
                        // Guard with !handleRedirection to avoid persisting during normal auth flows
                        // (where the scope may come from metadata scopes_supported rather than a 401).
                        if (this._scopes && !this.handleRedirection) {
                            storage = (0, index_js_1.getSecureStorage)();
                            existingData = storage.read() || {};
                            serverKey = getServerKey(this.serverName, this.serverConfig);
                            existing = (_a = existingData.mcpOAuth) === null || _a === void 0 ? void 0 : _a[serverKey];
                            if (existing) {
                                existing.stepUpScope = this._scopes;
                                storage.update(existingData);
                                (0, log_js_1.logMCPDebug)(this.serverName, "Persisted step-up scope: ".concat(this._scopes));
                            }
                        }
                        if (!this.handleRedirection) {
                            (0, log_js_1.logMCPDebug)(this.serverName, "Redirection handling is disabled, skipping redirect");
                            return [2 /*return*/];
                        }
                        urlString = authorizationUrl.toString();
                        if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
                            throw new Error('Invalid authorization URL: must use http:// or https:// scheme');
                        }
                        (0, log_js_1.logMCPDebug)(this.serverName, "Redirecting to authorization URL");
                        redactedUrl = redactSensitiveUrlParams(urlString);
                        (0, log_js_1.logMCPDebug)(this.serverName, "Authorization URL: ".concat(redactedUrl));
                        // Notify the UI about the authorization URL BEFORE opening the browser,
                        // so users can see the URL as a fallback if the browser fails to open
                        if (this.onAuthorizationUrlCallback) {
                            this.onAuthorizationUrlCallback(urlString);
                        }
                        if (!!this.skipBrowserOpen) return [3 /*break*/, 2];
                        (0, log_js_1.logMCPDebug)(this.serverName, "Opening authorization URL: ".concat(redactedUrl));
                        return [4 /*yield*/, (0, browser_js_1.openBrowser)(urlString)];
                    case 1:
                        success = _b.sent();
                        if (!success) {
                            (0, log_js_1.logMCPDebug)(this.serverName, "Browser didn't open automatically. URL is shown in UI.");
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        (0, log_js_1.logMCPDebug)(this.serverName, "Skipping browser open (skipBrowserOpen=true). URL: ".concat(redactedUrl));
                        _b.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ClaudeAuthProvider.prototype.saveCodeVerifier = function (codeVerifier) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                (0, log_js_1.logMCPDebug)(this.serverName, "Saving code verifier");
                this._codeVerifier = codeVerifier;
                return [2 /*return*/];
            });
        });
    };
    ClaudeAuthProvider.prototype.codeVerifier = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this._codeVerifier) {
                    (0, log_js_1.logMCPDebug)(this.serverName, "No code verifier saved");
                    throw new Error('No code verifier saved');
                }
                (0, log_js_1.logMCPDebug)(this.serverName, "Returning code verifier");
                return [2 /*return*/, this._codeVerifier];
            });
        });
    };
    ClaudeAuthProvider.prototype.invalidateCredentials = function (scope) {
        return __awaiter(this, void 0, void 0, function () {
            var storage, existingData, serverKey, tokenData;
            return __generator(this, function (_a) {
                storage = (0, index_js_1.getSecureStorage)();
                existingData = storage.read();
                if (!(existingData === null || existingData === void 0 ? void 0 : existingData.mcpOAuth))
                    return [2 /*return*/];
                serverKey = getServerKey(this.serverName, this.serverConfig);
                tokenData = existingData.mcpOAuth[serverKey];
                if (!tokenData)
                    return [2 /*return*/];
                switch (scope) {
                    case 'all':
                        delete existingData.mcpOAuth[serverKey];
                        break;
                    case 'client':
                        tokenData.clientId = undefined;
                        tokenData.clientSecret = undefined;
                        break;
                    case 'tokens':
                        tokenData.accessToken = '';
                        tokenData.refreshToken = undefined;
                        tokenData.expiresAt = 0;
                        break;
                    case 'verifier':
                        this._codeVerifier = undefined;
                        return [2 /*return*/];
                    case 'discovery':
                        tokenData.discoveryState = undefined;
                        tokenData.stepUpScope = undefined;
                        break;
                }
                storage.update(existingData);
                (0, log_js_1.logMCPDebug)(this.serverName, "Invalidated credentials (scope: ".concat(scope, ")"));
                return [2 /*return*/];
            });
        });
    };
    ClaudeAuthProvider.prototype.saveDiscoveryState = function (state) {
        return __awaiter(this, void 0, void 0, function () {
            var storage, existingData, serverKey, updatedData;
            var _a;
            var _b, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                storage = (0, index_js_1.getSecureStorage)();
                existingData = storage.read() || {};
                serverKey = getServerKey(this.serverName, this.serverConfig);
                (0, log_js_1.logMCPDebug)(this.serverName, "Saving discovery state (authServer: ".concat(state.authorizationServerUrl, ")"));
                updatedData = __assign(__assign({}, existingData), { mcpOAuth: __assign(__assign({}, existingData.mcpOAuth), (_a = {}, _a[serverKey] = __assign(__assign({}, (_b = existingData.mcpOAuth) === null || _b === void 0 ? void 0 : _b[serverKey]), { serverName: this.serverName, serverUrl: this.serverConfig.url, accessToken: ((_d = (_c = existingData.mcpOAuth) === null || _c === void 0 ? void 0 : _c[serverKey]) === null || _d === void 0 ? void 0 : _d.accessToken) || '', expiresAt: ((_f = (_e = existingData.mcpOAuth) === null || _e === void 0 ? void 0 : _e[serverKey]) === null || _f === void 0 ? void 0 : _f.expiresAt) || 0, discoveryState: {
                            authorizationServerUrl: state.authorizationServerUrl,
                            resourceMetadataUrl: state.resourceMetadataUrl,
                        } }), _a)) });
                storage.update(updatedData);
                return [2 /*return*/];
            });
        });
    };
    ClaudeAuthProvider.prototype.discoveryState = function () {
        return __awaiter(this, void 0, void 0, function () {
            var storage, data, serverKey, cached, metadataUrl, metadata, error_10;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        storage = (0, index_js_1.getSecureStorage)();
                        data = storage.read();
                        serverKey = getServerKey(this.serverName, this.serverConfig);
                        cached = (_b = (_a = data === null || data === void 0 ? void 0 : data.mcpOAuth) === null || _a === void 0 ? void 0 : _a[serverKey]) === null || _b === void 0 ? void 0 : _b.discoveryState;
                        if (cached === null || cached === void 0 ? void 0 : cached.authorizationServerUrl) {
                            (0, log_js_1.logMCPDebug)(this.serverName, "Returning cached discovery state (authServer: ".concat(cached.authorizationServerUrl, ")"));
                            return [2 /*return*/, {
                                    authorizationServerUrl: cached.authorizationServerUrl,
                                    resourceMetadataUrl: cached.resourceMetadataUrl,
                                    resourceMetadata: cached.resourceMetadata,
                                    authorizationServerMetadata: cached.authorizationServerMetadata,
                                }];
                        }
                        metadataUrl = (_c = this.serverConfig.oauth) === null || _c === void 0 ? void 0 : _c.authServerMetadataUrl;
                        if (!metadataUrl) return [3 /*break*/, 4];
                        (0, log_js_1.logMCPDebug)(this.serverName, "Fetching metadata from configured URL: ".concat(metadataUrl));
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fetchAuthServerMetadata(this.serverName, this.serverConfig.url, metadataUrl)];
                    case 2:
                        metadata = _d.sent();
                        if (metadata) {
                            return [2 /*return*/, {
                                    authorizationServerUrl: metadata.issuer,
                                    authorizationServerMetadata: metadata,
                                }];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_10 = _d.sent();
                        (0, log_js_1.logMCPDebug)(this.serverName, "Failed to fetch from configured metadata URL: ".concat((0, errors_js_2.errorMessage)(error_10)));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, undefined];
                }
            });
        });
    };
    ClaudeAuthProvider.prototype.refreshAuthorization = function (refreshToken) {
        return __awaiter(this, void 0, void 0, function () {
            var serverKey, claudeDir, sanitizedKey, lockfilePath, release, retry, e_7, code, storage, data, tokenData, expiresIn, _a;
            var _this = this;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        serverKey = getServerKey(this.serverName, this.serverConfig);
                        claudeDir = (0, envUtils_js_1.getClaudeConfigHomeDir)();
                        return [4 /*yield*/, (0, promises_1.mkdir)(claudeDir, { recursive: true })];
                    case 1:
                        _c.sent();
                        sanitizedKey = serverKey.replace(/[^a-zA-Z0-9]/g, '_');
                        lockfilePath = (0, path_1.join)(claudeDir, "mcp-refresh-".concat(sanitizedKey, ".lock"));
                        retry = 0;
                        _c.label = 2;
                    case 2:
                        if (!(retry < MAX_LOCK_RETRIES)) return [3 /*break*/, 9];
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 5, , 8]);
                        (0, log_js_1.logMCPDebug)(this.serverName, "Acquiring refresh lock (attempt ".concat(retry + 1, ")"));
                        return [4 /*yield*/, lockfile.lock(lockfilePath, {
                                realpath: false,
                                onCompromised: function () {
                                    (0, log_js_1.logMCPDebug)(_this.serverName, "Refresh lock was compromised");
                                },
                            })];
                    case 4:
                        release = _c.sent();
                        (0, log_js_1.logMCPDebug)(this.serverName, "Acquired refresh lock");
                        return [3 /*break*/, 9];
                    case 5:
                        e_7 = _c.sent();
                        code = (0, errors_js_2.getErrnoCode)(e_7);
                        if (!(code === 'ELOCKED')) return [3 /*break*/, 7];
                        (0, log_js_1.logMCPDebug)(this.serverName, "Refresh lock held by another process, waiting (attempt ".concat(retry + 1, "/").concat(MAX_LOCK_RETRIES, ")"));
                        return [4 /*yield*/, (0, sleep_js_1.sleep)(1000 + Math.random() * 1000)];
                    case 6:
                        _c.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        (0, log_js_1.logMCPDebug)(this.serverName, "Failed to acquire refresh lock: ".concat(code, ", proceeding without lock"));
                        return [3 /*break*/, 9];
                    case 8:
                        retry++;
                        return [3 /*break*/, 2];
                    case 9:
                        if (!release) {
                            (0, log_js_1.logMCPDebug)(this.serverName, "Could not acquire refresh lock after ".concat(MAX_LOCK_RETRIES, " retries, proceeding without lock"));
                        }
                        _c.label = 10;
                    case 10:
                        _c.trys.push([10, , 12, 17]);
                        // Re-read tokens after acquiring lock — another process may have refreshed
                        (0, macOsKeychainHelpers_js_1.clearKeychainCache)();
                        storage = (0, index_js_1.getSecureStorage)();
                        data = storage.read();
                        tokenData = (_b = data === null || data === void 0 ? void 0 : data.mcpOAuth) === null || _b === void 0 ? void 0 : _b[serverKey];
                        if (tokenData) {
                            expiresIn = (tokenData.expiresAt - Date.now()) / 1000;
                            if (expiresIn > 300) {
                                (0, log_js_1.logMCPDebug)(this.serverName, "Another process already refreshed tokens (expires in ".concat(Math.floor(expiresIn), "s)"));
                                return [2 /*return*/, {
                                        access_token: tokenData.accessToken,
                                        refresh_token: tokenData.refreshToken,
                                        expires_in: expiresIn,
                                        scope: tokenData.scope,
                                        token_type: 'Bearer',
                                    }];
                            }
                            // Use the freshest refresh token from storage
                            if (tokenData.refreshToken) {
                                refreshToken = tokenData.refreshToken;
                            }
                        }
                        return [4 /*yield*/, this._doRefresh(refreshToken)];
                    case 11: return [2 /*return*/, _c.sent()];
                    case 12:
                        if (!release) return [3 /*break*/, 16];
                        _c.label = 13;
                    case 13:
                        _c.trys.push([13, 15, , 16]);
                        return [4 /*yield*/, release()];
                    case 14:
                        _c.sent();
                        (0, log_js_1.logMCPDebug)(this.serverName, "Released refresh lock");
                        return [3 /*break*/, 16];
                    case 15:
                        _a = _c.sent();
                        (0, log_js_1.logMCPDebug)(this.serverName, "Failed to release refresh lock");
                        return [3 /*break*/, 16];
                    case 16: return [7 /*endfinally*/];
                    case 17: return [2 /*return*/];
                }
            });
        });
    };
    ClaudeAuthProvider.prototype._doRefresh = function (refreshToken) {
        return __awaiter(this, void 0, void 0, function () {
            var MAX_ATTEMPTS, mcpServerBaseUrl, emitRefreshEvent, attempt, authFetch, metadata, cached, clientInfo, newTokens, error_11, storage, data, serverKey, tokenData, expiresIn, isTimeoutError, isTransientServerError, isRetryable, delayMs;
            var _this = this;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        MAX_ATTEMPTS = 3;
                        mcpServerBaseUrl = (0, utils_js_1.getLoggingSafeMcpBaseUrl)(this.serverConfig);
                        emitRefreshEvent = function (outcome, reason) {
                            (0, index_js_2.logEvent)(outcome === 'success'
                                ? 'tengu_mcp_oauth_refresh_success'
                                : 'tengu_mcp_oauth_refresh_failure', __assign(__assign({ transportType: _this.serverConfig
                                    .type }, (mcpServerBaseUrl
                                ? {
                                    mcpServerBaseUrl: mcpServerBaseUrl,
                                }
                                : {})), (reason
                                ? {
                                    reason: reason,
                                }
                                : {})));
                        };
                        attempt = 1;
                        _c.label = 1;
                    case 1:
                        if (!(attempt <= MAX_ATTEMPTS)) return [3 /*break*/, 18];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 13, , 17]);
                        (0, log_js_1.logMCPDebug)(this.serverName, "Starting token refresh");
                        authFetch = createAuthFetch();
                        metadata = this._metadata;
                        if (!!metadata) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.discoveryState()];
                    case 3:
                        cached = _c.sent();
                        if (!(cached === null || cached === void 0 ? void 0 : cached.authorizationServerMetadata)) return [3 /*break*/, 4];
                        (0, log_js_1.logMCPDebug)(this.serverName, "Using persisted auth server metadata for refresh");
                        metadata = cached.authorizationServerMetadata;
                        return [3 /*break*/, 6];
                    case 4:
                        if (!(cached === null || cached === void 0 ? void 0 : cached.authorizationServerUrl)) return [3 /*break*/, 6];
                        (0, log_js_1.logMCPDebug)(this.serverName, "Re-discovering metadata from persisted auth server URL: ".concat(cached.authorizationServerUrl));
                        return [4 /*yield*/, (0, auth_js_1.discoverAuthorizationServerMetadata)(cached.authorizationServerUrl, { fetchFn: authFetch })];
                    case 5:
                        metadata = _c.sent();
                        _c.label = 6;
                    case 6:
                        if (!!metadata) return [3 /*break*/, 8];
                        return [4 /*yield*/, fetchAuthServerMetadata(this.serverName, this.serverConfig.url, (_a = this.serverConfig.oauth) === null || _a === void 0 ? void 0 : _a.authServerMetadataUrl, authFetch)];
                    case 7:
                        metadata = _c.sent();
                        _c.label = 8;
                    case 8:
                        if (!metadata) {
                            (0, log_js_1.logMCPDebug)(this.serverName, "Failed to discover OAuth metadata");
                            emitRefreshEvent('failure', 'metadata_discovery_failed');
                            return [2 /*return*/, undefined];
                        }
                        // Cache for future refreshes
                        this._metadata = metadata;
                        return [4 /*yield*/, this.clientInformation()];
                    case 9:
                        clientInfo = _c.sent();
                        if (!clientInfo) {
                            (0, log_js_1.logMCPDebug)(this.serverName, "No client information available");
                            emitRefreshEvent('failure', 'no_client_info');
                            return [2 /*return*/, undefined];
                        }
                        return [4 /*yield*/, (0, auth_js_1.refreshAuthorization)(new URL(this.serverConfig.url), {
                                metadata: metadata,
                                clientInformation: clientInfo,
                                refreshToken: refreshToken,
                                resource: new URL(this.serverConfig.url),
                                fetchFn: authFetch,
                            })];
                    case 10:
                        newTokens = _c.sent();
                        if (!newTokens) return [3 /*break*/, 12];
                        (0, log_js_1.logMCPDebug)(this.serverName, "Token refresh successful");
                        return [4 /*yield*/, this.saveTokens(newTokens)];
                    case 11:
                        _c.sent();
                        emitRefreshEvent('success');
                        return [2 /*return*/, newTokens];
                    case 12:
                        (0, log_js_1.logMCPDebug)(this.serverName, "Token refresh returned no tokens");
                        emitRefreshEvent('failure', 'no_tokens_returned');
                        return [2 /*return*/, undefined];
                    case 13:
                        error_11 = _c.sent();
                        if (!(error_11 instanceof errors_js_1.InvalidGrantError)) return [3 /*break*/, 15];
                        (0, log_js_1.logMCPDebug)(this.serverName, "Token refresh failed with invalid_grant: ".concat(error_11.message));
                        (0, macOsKeychainHelpers_js_1.clearKeychainCache)();
                        storage = (0, index_js_1.getSecureStorage)();
                        data = storage.read();
                        serverKey = getServerKey(this.serverName, this.serverConfig);
                        tokenData = (_b = data === null || data === void 0 ? void 0 : data.mcpOAuth) === null || _b === void 0 ? void 0 : _b[serverKey];
                        if (tokenData) {
                            expiresIn = (tokenData.expiresAt - Date.now()) / 1000;
                            if (expiresIn > 300) {
                                (0, log_js_1.logMCPDebug)(this.serverName, "Another process refreshed tokens, using those");
                                // Not emitted as success: this process did not perform a
                                // refresh, and the winning process already emitted its own
                                // success event. Emitting here would double-count.
                                return [2 /*return*/, {
                                        access_token: tokenData.accessToken,
                                        refresh_token: tokenData.refreshToken,
                                        expires_in: expiresIn,
                                        scope: tokenData.scope,
                                        token_type: 'Bearer',
                                    }];
                            }
                        }
                        (0, log_js_1.logMCPDebug)(this.serverName, "No valid tokens in storage, clearing stored tokens");
                        return [4 /*yield*/, this.invalidateCredentials('tokens')];
                    case 14:
                        _c.sent();
                        emitRefreshEvent('failure', 'invalid_grant');
                        return [2 /*return*/, undefined];
                    case 15:
                        isTimeoutError = error_11 instanceof Error &&
                            /timeout|timed out|etimedout|econnreset/i.test(error_11.message);
                        isTransientServerError = error_11 instanceof errors_js_1.ServerError ||
                            error_11 instanceof errors_js_1.TemporarilyUnavailableError ||
                            error_11 instanceof errors_js_1.TooManyRequestsError;
                        isRetryable = isTimeoutError || isTransientServerError;
                        if (!isRetryable || attempt >= MAX_ATTEMPTS) {
                            (0, log_js_1.logMCPDebug)(this.serverName, "Token refresh failed: ".concat((0, errors_js_2.errorMessage)(error_11)));
                            emitRefreshEvent('failure', isRetryable ? 'transient_retries_exhausted' : 'request_failed');
                            return [2 /*return*/, undefined];
                        }
                        delayMs = 1000 * Math.pow(2, attempt - 1) // 1s, 2s, 4s
                        ;
                        (0, log_js_1.logMCPDebug)(this.serverName, "Token refresh failed, retrying in ".concat(delayMs, "ms (attempt ").concat(attempt, "/").concat(MAX_ATTEMPTS, ")"));
                        return [4 /*yield*/, (0, sleep_js_1.sleep)(delayMs)];
                    case 16:
                        _c.sent();
                        return [3 /*break*/, 17];
                    case 17:
                        attempt++;
                        return [3 /*break*/, 1];
                    case 18: return [2 /*return*/, undefined];
                }
            });
        });
    };
    return ClaudeAuthProvider;
}());
exports.ClaudeAuthProvider = ClaudeAuthProvider;
function readClientSecret() {
    return __awaiter(this, void 0, void 0, function () {
        var envSecret;
        return __generator(this, function (_a) {
            envSecret = process.env.MCP_CLIENT_SECRET;
            if (envSecret) {
                return [2 /*return*/, envSecret];
            }
            if (!process.stdin.isTTY) {
                throw new Error('No TTY available to prompt for client secret. Set MCP_CLIENT_SECRET env var instead.');
            }
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var _a, _b;
                    process.stderr.write('Enter OAuth client secret: ');
                    (_b = (_a = process.stdin).setRawMode) === null || _b === void 0 ? void 0 : _b.call(_a, true);
                    var secret = '';
                    var onData = function (ch) {
                        var _a, _b, _c, _d;
                        var c = ch.toString();
                        if (c === '\n' || c === '\r') {
                            (_b = (_a = process.stdin).setRawMode) === null || _b === void 0 ? void 0 : _b.call(_a, false);
                            process.stdin.removeListener('data', onData);
                            process.stderr.write('\n');
                            resolve(secret);
                        }
                        else if (c === '\u0003') {
                            (_d = (_c = process.stdin).setRawMode) === null || _d === void 0 ? void 0 : _d.call(_c, false);
                            process.stdin.removeListener('data', onData);
                            reject(new Error('Cancelled'));
                        }
                        else if (c === '\u007F' || c === '\b') {
                            secret = secret.slice(0, -1);
                        }
                        else {
                            secret += c;
                        }
                    };
                    process.stdin.on('data', onData);
                })];
        });
    });
}
function saveMcpClientSecret(serverName, serverConfig, clientSecret) {
    var _a;
    var storage = (0, index_js_1.getSecureStorage)();
    var existingData = storage.read() || {};
    var serverKey = getServerKey(serverName, serverConfig);
    storage.update(__assign(__assign({}, existingData), { mcpOAuthClientConfig: __assign(__assign({}, existingData.mcpOAuthClientConfig), (_a = {}, _a[serverKey] = { clientSecret: clientSecret }, _a)) }));
}
function clearMcpClientConfig(serverName, serverConfig) {
    var storage = (0, index_js_1.getSecureStorage)();
    var existingData = storage.read();
    if (!(existingData === null || existingData === void 0 ? void 0 : existingData.mcpOAuthClientConfig))
        return;
    var serverKey = getServerKey(serverName, serverConfig);
    if (existingData.mcpOAuthClientConfig[serverKey]) {
        delete existingData.mcpOAuthClientConfig[serverKey];
        storage.update(existingData);
    }
}
function getMcpClientConfig(serverName, serverConfig) {
    var _a;
    var storage = (0, index_js_1.getSecureStorage)();
    var data = storage.read();
    var serverKey = getServerKey(serverName, serverConfig);
    return (_a = data === null || data === void 0 ? void 0 : data.mcpOAuthClientConfig) === null || _a === void 0 ? void 0 : _a[serverKey];
}
/**
 * Safely extracts scope information from AuthorizationServerMetadata.
 * The metadata can be either OAuthMetadata or OpenIdProviderDiscoveryMetadata,
 * and different providers use different fields for scope information.
 */
function getScopeFromMetadata(metadata) {
    if (!metadata)
        return undefined;
    // Try 'scope' first (non-standard but used by some providers)
    if ('scope' in metadata && typeof metadata.scope === 'string') {
        return metadata.scope;
    }
    // Try 'default_scope' (non-standard but used by some providers)
    if ('default_scope' in metadata &&
        typeof metadata.default_scope === 'string') {
        return metadata.default_scope;
    }
    // Fall back to scopes_supported (standard OAuth 2.0 field)
    if (metadata.scopes_supported && Array.isArray(metadata.scopes_supported)) {
        return metadata.scopes_supported.join(' ');
    }
    return undefined;
}
