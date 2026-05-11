"use strict";
/**
 * Cross-App Access (XAA) / Enterprise Managed Authorization (SEP-990)
 *
 * Obtains an MCP access token WITHOUT a browser consent screen by chaining:
 *   1. RFC 8693 Token Exchange at the IdP: id_token → ID-JAG
 *   2. RFC 7523 JWT Bearer Grant at the AS: ID-JAG → access_token
 *
 * Spec refs:
 *   - ID-JAG (IETF draft): https://datatracker.ietf.org/doc/draft-ietf-oauth-identity-assertion-authz-grant/
 *   - MCP ext-auth (SEP-990): https://github.com/modelcontextprotocol/ext-auth
 *   - RFC 8693 (Token Exchange), RFC 7523 (JWT Bearer), RFC 9728 (PRM)
 *
 * Reference impl: ~/code/mcp/conformance/examples/clients/typescript/everything-client.ts:375-522
 *
 * Structure: four Layer-2 ops (aligned with TS SDK PR #1593's Layer-2 shapes so
 * a future SDK swap is mechanical) + one Layer-3 orchestrator that composes them.
 */
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
exports.XaaTokenExchangeError = void 0;
exports.discoverProtectedResource = discoverProtectedResource;
exports.discoverAuthorizationServer = discoverAuthorizationServer;
exports.requestJwtAuthorizationGrant = requestJwtAuthorizationGrant;
exports.exchangeJwtAuthGrant = exchangeJwtAuthGrant;
exports.performCrossAppAccess = performCrossAppAccess;
var auth_js_1 = require("@modelcontextprotocol/sdk/client/auth.js");
var v4_1 = require("zod/v4");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
var log_js_1 = require("../../utils/log.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var XAA_REQUEST_TIMEOUT_MS = 30000;
var TOKEN_EXCHANGE_GRANT = 'urn:ietf:params:oauth:grant-type:token-exchange';
var JWT_BEARER_GRANT = 'urn:ietf:params:oauth:grant-type:jwt-bearer';
var ID_JAG_TOKEN_TYPE = 'urn:ietf:params:oauth:token-type:id-jag';
var ID_TOKEN_TYPE = 'urn:ietf:params:oauth:token-type:id_token';
/**
 * Creates a fetch wrapper that enforces the XAA request timeout and optionally
 * composes a caller-provided abort signal. Using AbortSignal.any ensures the
 * user's cancel (e.g. Esc in the auth menu) actually aborts in-flight requests
 * rather than being clobbered by the timeout signal.
 */
function makeXaaFetch(abortSignal) {
    return function (url, init) {
        var timeout = AbortSignal.timeout(XAA_REQUEST_TIMEOUT_MS);
        var signal = abortSignal
            ? // eslint-disable-next-line eslint-plugin-n/no-unsupported-features/node-builtins
                AbortSignal.any([timeout, abortSignal])
            : timeout;
        // eslint-disable-next-line eslint-plugin-n/no-unsupported-features/node-builtins
        return fetch(url, __assign(__assign({}, init), { signal: signal }));
    };
}
var defaultFetch = makeXaaFetch();
/**
 * RFC 8414 §3.3 / RFC 9728 §3.3 identifier comparison. Roundtrip through URL
 * to apply RFC 3986 §6.2.2 syntax-based normalization (lowercases scheme+host,
 * drops default port), then strip trailing slash.
 */
function normalizeUrl(url) {
    try {
        return new URL(url).href.replace(/\/$/, '');
    }
    catch (_a) {
        return url.replace(/\/$/, '');
    }
}
/**
 * Thrown by requestJwtAuthorizationGrant when the IdP token-exchange leg
 * fails. Carries `shouldClearIdToken` so callers can decide whether to drop
 * the cached id_token based on OAuth error semantics (not substring matching):
 *   - 4xx / invalid_grant / invalid_token → id_token is bad, clear it
 *   - 5xx → IdP is down, id_token may still be valid, keep it
 *   - 200 with structurally-invalid body → protocol violation, clear it
 */
var XaaTokenExchangeError = /** @class */ (function (_super) {
    __extends(XaaTokenExchangeError, _super);
    function XaaTokenExchangeError(message, shouldClearIdToken) {
        var _this = _super.call(this, message) || this;
        _this.name = 'XaaTokenExchangeError';
        _this.shouldClearIdToken = shouldClearIdToken;
        return _this;
    }
    return XaaTokenExchangeError;
}(Error));
exports.XaaTokenExchangeError = XaaTokenExchangeError;
// Matches quoted values for known token-bearing keys regardless of nesting
// depth. Works on both parsed-then-stringified bodies AND raw text() error
// bodies from !res.ok paths — a misbehaving AS that echoes the request's
// subject_token/assertion/client_secret in a 4xx error envelope must not leak
// into debug logs.
var SENSITIVE_TOKEN_RE = /"(access_token|refresh_token|id_token|assertion|subject_token|client_secret)"\s*:\s*"[^"]*"/g;
function redactTokens(raw) {
    var s = typeof raw === 'string' ? raw : (0, slowOperations_js_1.jsonStringify)(raw);
    return s.replace(SENSITIVE_TOKEN_RE, function (_, k) { return "\"".concat(k, "\":\"[REDACTED]\""); });
}
// ─── Zod Schemas ────────────────────────────────────────────────────────────
var TokenExchangeResponseSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        access_token: v4_1.z.string().optional(),
        issued_token_type: v4_1.z.string().optional(),
        // z.coerce tolerates IdPs that send expires_in as a string (common in
        // PHP-backed IdPs) — technically non-conformant JSON but widespread.
        expires_in: v4_1.z.coerce.number().optional(),
        scope: v4_1.z.string().optional(),
    });
});
var JwtBearerResponseSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        access_token: v4_1.z.string().min(1),
        // Many ASes omit token_type since Bearer is the only value anyone uses
        // (RFC 6750). Don't reject a valid access_token over a missing label.
        token_type: v4_1.z.string().default('Bearer'),
        expires_in: v4_1.z.coerce.number().optional(),
        scope: v4_1.z.string().optional(),
        refresh_token: v4_1.z.string().optional(),
    });
});
/**
 * RFC 9728 PRM discovery via SDK, plus RFC 9728 §3.3 resource-mismatch
 * validation (mix-up protection — TODO: upstream to SDK).
 */
function discoverProtectedResource(serverUrl, opts) {
    return __awaiter(this, void 0, void 0, function () {
        var prm, e_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, auth_js_1.discoverOAuthProtectedResourceMetadata)(serverUrl, undefined, (_a = opts === null || opts === void 0 ? void 0 : opts.fetchFn) !== null && _a !== void 0 ? _a : defaultFetch)];
                case 1:
                    prm = _c.sent();
                    return [3 /*break*/, 3];
                case 2:
                    e_1 = _c.sent();
                    throw new Error("XAA: PRM discovery failed: ".concat(e_1 instanceof Error ? e_1.message : String(e_1)));
                case 3:
                    if (!prm.resource || !((_b = prm.authorization_servers) === null || _b === void 0 ? void 0 : _b[0])) {
                        throw new Error('XAA: PRM discovery failed: PRM missing resource or authorization_servers');
                    }
                    if (normalizeUrl(prm.resource) !== normalizeUrl(serverUrl)) {
                        throw new Error("XAA: PRM discovery failed: PRM resource mismatch: expected ".concat(serverUrl, ", got ").concat(prm.resource));
                    }
                    return [2 /*return*/, {
                            resource: prm.resource,
                            authorization_servers: prm.authorization_servers,
                        }];
            }
        });
    });
}
/**
 * AS metadata discovery via SDK (RFC 8414 + OIDC fallback), plus RFC 8414
 * §3.3 issuer-mismatch validation (mix-up protection — TODO: upstream to SDK).
 */
function discoverAuthorizationServer(asUrl, opts) {
    return __awaiter(this, void 0, void 0, function () {
        var meta;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, auth_js_1.discoverAuthorizationServerMetadata)(asUrl, {
                        fetchFn: (_a = opts === null || opts === void 0 ? void 0 : opts.fetchFn) !== null && _a !== void 0 ? _a : defaultFetch,
                    })];
                case 1:
                    meta = _b.sent();
                    if (!(meta === null || meta === void 0 ? void 0 : meta.issuer) || !meta.token_endpoint) {
                        throw new Error("XAA: AS metadata discovery failed: no valid metadata at ".concat(asUrl));
                    }
                    if (normalizeUrl(meta.issuer) !== normalizeUrl(asUrl)) {
                        throw new Error("XAA: AS metadata discovery failed: issuer mismatch: expected ".concat(asUrl, ", got ").concat(meta.issuer));
                    }
                    // RFC 8414 §3.3 / RFC 9728 §3 require HTTPS. A PRM-advertised http:// AS
                    // that self-consistently reports an http:// issuer would pass the mismatch
                    // check above, then we'd POST id_token + client_secret over plaintext.
                    if (new URL(meta.token_endpoint).protocol !== 'https:') {
                        throw new Error("XAA: refusing non-HTTPS token endpoint: ".concat(meta.token_endpoint));
                    }
                    return [2 /*return*/, {
                            issuer: meta.issuer,
                            token_endpoint: meta.token_endpoint,
                            grant_types_supported: meta.grant_types_supported,
                            token_endpoint_auth_methods_supported: meta.token_endpoint_auth_methods_supported,
                        }];
            }
        });
    });
}
/**
 * RFC 8693 Token Exchange at the IdP: id_token → ID-JAG.
 * Validates `issued_token_type` is `urn:ietf:params:oauth:token-type:id-jag`.
 *
 * `clientSecret` is optional — sent via `client_secret_post` if present.
 * Some IdPs register the client as confidential even when they advertise
 * `token_endpoint_auth_method: "none"`.
 *
 * TODO(xaa-ga): consult `token_endpoint_auth_methods_supported` from IdP
 * OIDC metadata and support `client_secret_basic`, mirroring the AS-side
 * selection in `performCrossAppAccess`. All major IdPs accept POST today.
 */
function requestJwtAuthorizationGrant(opts) {
    return __awaiter(this, void 0, void 0, function () {
        var fetchFn, params, res, body, _a, shouldClear, rawExchange, _b, exchangeParsed, result;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    fetchFn = (_c = opts.fetchFn) !== null && _c !== void 0 ? _c : defaultFetch;
                    params = new URLSearchParams({
                        grant_type: TOKEN_EXCHANGE_GRANT,
                        requested_token_type: ID_JAG_TOKEN_TYPE,
                        audience: opts.audience,
                        resource: opts.resource,
                        subject_token: opts.idToken,
                        subject_token_type: ID_TOKEN_TYPE,
                        client_id: opts.clientId,
                    });
                    if (opts.clientSecret) {
                        params.set('client_secret', opts.clientSecret);
                    }
                    if (opts.scope) {
                        params.set('scope', opts.scope);
                    }
                    return [4 /*yield*/, fetchFn(opts.tokenEndpoint, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            body: params,
                        })];
                case 1:
                    res = _d.sent();
                    if (!!res.ok) return [3 /*break*/, 3];
                    _a = redactTokens;
                    return [4 /*yield*/, res.text()];
                case 2:
                    body = _a.apply(void 0, [_d.sent()]).slice(0, 200);
                    shouldClear = res.status < 500;
                    throw new XaaTokenExchangeError("XAA: token exchange failed: HTTP ".concat(res.status, ": ").concat(body), shouldClear);
                case 3:
                    _d.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, res.json()];
                case 4:
                    rawExchange = _d.sent();
                    return [3 /*break*/, 6];
                case 5:
                    _b = _d.sent();
                    // Transient network condition (captive portal, proxy) — don't clear id_token.
                    throw new XaaTokenExchangeError("XAA: token exchange returned non-JSON (captive portal?) at ".concat(opts.tokenEndpoint), false);
                case 6:
                    exchangeParsed = TokenExchangeResponseSchema().safeParse(rawExchange);
                    if (!exchangeParsed.success) {
                        throw new XaaTokenExchangeError("XAA: token exchange response did not match expected shape: ".concat(redactTokens(rawExchange)), true);
                    }
                    result = exchangeParsed.data;
                    if (!result.access_token) {
                        throw new XaaTokenExchangeError("XAA: token exchange response missing access_token: ".concat(redactTokens(result)), true);
                    }
                    if (result.issued_token_type !== ID_JAG_TOKEN_TYPE) {
                        throw new XaaTokenExchangeError("XAA: token exchange returned unexpected issued_token_type: ".concat(result.issued_token_type), true);
                    }
                    return [2 /*return*/, {
                            jwtAuthGrant: result.access_token,
                            expiresIn: result.expires_in,
                            scope: result.scope,
                        }];
            }
        });
    });
}
/**
 * RFC 7523 JWT Bearer Grant at the AS: ID-JAG → access_token.
 *
 * `authMethod` defaults to `client_secret_basic` (Base64 header, not body
 * params) — the SEP-990 conformance test requires this. Only set
 * `client_secret_post` if the AS explicitly requires it.
 */
function exchangeJwtAuthGrant(opts) {
    return __awaiter(this, void 0, void 0, function () {
        var fetchFn, authMethod, params, headers, basicAuth, res, body, _a, rawTokens, _b, tokensParsed;
        var _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    fetchFn = (_c = opts.fetchFn) !== null && _c !== void 0 ? _c : defaultFetch;
                    authMethod = (_d = opts.authMethod) !== null && _d !== void 0 ? _d : 'client_secret_basic';
                    params = new URLSearchParams({
                        grant_type: JWT_BEARER_GRANT,
                        assertion: opts.assertion,
                    });
                    if (opts.scope) {
                        params.set('scope', opts.scope);
                    }
                    headers = {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    };
                    if (authMethod === 'client_secret_basic') {
                        basicAuth = Buffer.from("".concat(encodeURIComponent(opts.clientId), ":").concat(encodeURIComponent(opts.clientSecret))).toString('base64');
                        headers.Authorization = "Basic ".concat(basicAuth);
                    }
                    else {
                        params.set('client_id', opts.clientId);
                        params.set('client_secret', opts.clientSecret);
                    }
                    return [4 /*yield*/, fetchFn(opts.tokenEndpoint, {
                            method: 'POST',
                            headers: headers,
                            body: params,
                        })];
                case 1:
                    res = _e.sent();
                    if (!!res.ok) return [3 /*break*/, 3];
                    _a = redactTokens;
                    return [4 /*yield*/, res.text()];
                case 2:
                    body = _a.apply(void 0, [_e.sent()]).slice(0, 200);
                    throw new Error("XAA: jwt-bearer grant failed: HTTP ".concat(res.status, ": ").concat(body));
                case 3:
                    _e.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, res.json()];
                case 4:
                    rawTokens = _e.sent();
                    return [3 /*break*/, 6];
                case 5:
                    _b = _e.sent();
                    throw new Error("XAA: jwt-bearer grant returned non-JSON (captive portal?) at ".concat(opts.tokenEndpoint));
                case 6:
                    tokensParsed = JwtBearerResponseSchema().safeParse(rawTokens);
                    if (!tokensParsed.success) {
                        throw new Error("XAA: jwt-bearer response did not match expected shape: ".concat(redactTokens(rawTokens)));
                    }
                    return [2 /*return*/, tokensParsed.data];
            }
        });
    });
}
/**
 * Full XAA flow: PRM → AS metadata → token-exchange → jwt-bearer → access_token.
 * Thin composition of the four Layer-2 ops. Used by performMCPXaaAuth,
 * ClaudeAuthProvider.xaaRefresh, and the try-xaa*.ts debug scripts.
 *
 * @param serverUrl The MCP server URL (e.g. `https://mcp.example.com/mcp`)
 * @param config IdP + AS credentials
 * @param serverName Server name for debug logging
 */
function performCrossAppAccess(serverUrl_1, config_1) {
    return __awaiter(this, arguments, void 0, function (serverUrl, config, serverName, abortSignal) {
        var fetchFn, prm, asMeta, asErrors, _i, _a, asUrl, candidate, e_2, authMethods, authMethod, jag, tokens;
        if (serverName === void 0) { serverName = 'xaa'; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    fetchFn = makeXaaFetch(abortSignal);
                    (0, log_js_1.logMCPDebug)(serverName, "XAA: discovering PRM for ".concat(serverUrl));
                    return [4 /*yield*/, discoverProtectedResource(serverUrl, { fetchFn: fetchFn })];
                case 1:
                    prm = _b.sent();
                    (0, log_js_1.logMCPDebug)(serverName, "XAA: discovered resource=".concat(prm.resource, " ASes=[").concat(prm.authorization_servers.join(', '), "]"));
                    asErrors = [];
                    _i = 0, _a = prm.authorization_servers;
                    _b.label = 2;
                case 2:
                    if (!(_i < _a.length)) return [3 /*break*/, 8];
                    asUrl = _a[_i];
                    candidate = void 0;
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, discoverAuthorizationServer(asUrl, { fetchFn: fetchFn })];
                case 4:
                    candidate = _b.sent();
                    return [3 /*break*/, 6];
                case 5:
                    e_2 = _b.sent();
                    if (abortSignal === null || abortSignal === void 0 ? void 0 : abortSignal.aborted)
                        throw e_2;
                    asErrors.push("".concat(asUrl, ": ").concat(e_2 instanceof Error ? e_2.message : String(e_2)));
                    return [3 /*break*/, 7];
                case 6:
                    if (candidate.grant_types_supported &&
                        !candidate.grant_types_supported.includes(JWT_BEARER_GRANT)) {
                        asErrors.push("".concat(asUrl, ": does not advertise jwt-bearer grant (supported: ").concat(candidate.grant_types_supported.join(', '), ")"));
                        return [3 /*break*/, 7];
                    }
                    asMeta = candidate;
                    return [3 /*break*/, 8];
                case 7:
                    _i++;
                    return [3 /*break*/, 2];
                case 8:
                    if (!asMeta) {
                        throw new Error("XAA: no authorization server supports jwt-bearer. Tried: ".concat(asErrors.join('; ')));
                    }
                    authMethods = asMeta.token_endpoint_auth_methods_supported;
                    authMethod = authMethods &&
                        !authMethods.includes('client_secret_basic') &&
                        authMethods.includes('client_secret_post')
                        ? 'client_secret_post'
                        : 'client_secret_basic';
                    (0, log_js_1.logMCPDebug)(serverName, "XAA: AS issuer=".concat(asMeta.issuer, " token_endpoint=").concat(asMeta.token_endpoint, " auth_method=").concat(authMethod));
                    (0, log_js_1.logMCPDebug)(serverName, "XAA: exchanging id_token for ID-JAG at IdP");
                    return [4 /*yield*/, requestJwtAuthorizationGrant({
                            tokenEndpoint: config.idpTokenEndpoint,
                            audience: asMeta.issuer,
                            resource: prm.resource,
                            idToken: config.idpIdToken,
                            clientId: config.idpClientId,
                            clientSecret: config.idpClientSecret,
                            fetchFn: fetchFn,
                        })];
                case 9:
                    jag = _b.sent();
                    (0, log_js_1.logMCPDebug)(serverName, "XAA: ID-JAG obtained");
                    (0, log_js_1.logMCPDebug)(serverName, "XAA: exchanging ID-JAG for access_token at AS");
                    return [4 /*yield*/, exchangeJwtAuthGrant({
                            tokenEndpoint: asMeta.token_endpoint,
                            assertion: jag.jwtAuthGrant,
                            clientId: config.clientId,
                            clientSecret: config.clientSecret,
                            authMethod: authMethod,
                            fetchFn: fetchFn,
                        })];
                case 10:
                    tokens = _b.sent();
                    (0, log_js_1.logMCPDebug)(serverName, "XAA: access_token obtained");
                    return [2 /*return*/, __assign(__assign({}, tokens), { authorizationServerUrl: asMeta.issuer })];
            }
        });
    });
}
