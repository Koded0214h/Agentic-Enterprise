"use strict";
/**
 * XAA IdP Login — acquires an OIDC id_token from an enterprise IdP via the
 * standard authorization_code + PKCE flow, then caches it by IdP issuer.
 *
 * This is the "one browser pop" in the XAA value prop: one IdP login → N silent
 * MCP server auths. The id_token is cached in the keychain and reused until expiry.
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
exports.isXaaEnabled = isXaaEnabled;
exports.getXaaIdpSettings = getXaaIdpSettings;
exports.issuerKey = issuerKey;
exports.getCachedIdpIdToken = getCachedIdpIdToken;
exports.saveIdpIdTokenFromJwt = saveIdpIdTokenFromJwt;
exports.clearIdpIdToken = clearIdpIdToken;
exports.saveIdpClientSecret = saveIdpClientSecret;
exports.getIdpClientSecret = getIdpClientSecret;
exports.clearIdpClientSecret = clearIdpClientSecret;
exports.discoverOidc = discoverOidc;
exports.acquireIdpIdToken = acquireIdpIdToken;
var auth_js_1 = require("@modelcontextprotocol/sdk/client/auth.js");
var auth_js_2 = require("@modelcontextprotocol/sdk/shared/auth.js");
var crypto_1 = require("crypto");
var http_1 = require("http");
var url_1 = require("url");
var xss_1 = require("xss");
var browser_js_1 = require("../../utils/browser.js");
var envUtils_js_1 = require("../../utils/envUtils.js");
var errors_js_1 = require("../../utils/errors.js");
var log_js_1 = require("../../utils/log.js");
var platform_js_1 = require("../../utils/platform.js");
var index_js_1 = require("../../utils/secureStorage/index.js");
var settings_js_1 = require("../../utils/settings/settings.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var oauthPort_js_1 = require("./oauthPort.js");
function isXaaEnabled() {
    return (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_ENABLE_XAA);
}
/**
 * Typed accessor for settings.xaaIdp. The field is env-gated in SettingsSchema
 * so it doesn't surface in SDK types/docs — which means the inferred settings
 * type doesn't have it at compile time. This is the one cast.
 */
function getXaaIdpSettings() {
    return (0, settings_js_1.getInitialSettings)().xaaIdp;
}
var IDP_LOGIN_TIMEOUT_MS = 5 * 60 * 1000;
var IDP_REQUEST_TIMEOUT_MS = 30000;
var ID_TOKEN_EXPIRY_BUFFER_S = 60;
/**
 * Normalize an IdP issuer URL for use as a cache key: strip trailing slashes,
 * lowercase host. Issuers from config and from OIDC discovery may differ
 * cosmetically but should hit the same cache slot. Exported so the setup
 * command can compare issuers using the same normalization as keychain ops.
 */
function issuerKey(issuer) {
    try {
        var u = new URL(issuer);
        u.pathname = u.pathname.replace(/\/+$/, '');
        u.host = u.host.toLowerCase();
        return u.toString();
    }
    catch (_a) {
        return issuer.replace(/\/+$/, '');
    }
}
/**
 * Read a cached id_token for the given IdP issuer from secure storage.
 * Returns undefined if missing or within ID_TOKEN_EXPIRY_BUFFER_S of expiring.
 */
function getCachedIdpIdToken(idpIssuer) {
    var _a;
    var storage = (0, index_js_1.getSecureStorage)();
    var data = storage.read();
    var entry = (_a = data === null || data === void 0 ? void 0 : data.mcpXaaIdp) === null || _a === void 0 ? void 0 : _a[issuerKey(idpIssuer)];
    if (!entry)
        return undefined;
    var remainingMs = entry.expiresAt - Date.now();
    if (remainingMs <= ID_TOKEN_EXPIRY_BUFFER_S * 1000)
        return undefined;
    return entry.idToken;
}
function saveIdpIdToken(idpIssuer, idToken, expiresAt) {
    var _a;
    var storage = (0, index_js_1.getSecureStorage)();
    var existing = storage.read() || {};
    storage.update(__assign(__assign({}, existing), { mcpXaaIdp: __assign(__assign({}, existing.mcpXaaIdp), (_a = {}, _a[issuerKey(idpIssuer)] = { idToken: idToken, expiresAt: expiresAt }, _a)) }));
}
/**
 * Save an externally-obtained id_token into the XAA cache — the exact slot
 * getCachedIdpIdToken/acquireIdpIdToken read from. Used by conformance testing
 * where the mock IdP hands us a pre-signed token but doesn't serve /authorize.
 *
 * Parses the JWT's exp claim for cache TTL (same as acquireIdpIdToken).
 * Returns the expiresAt it computed so the caller can report it.
 */
function saveIdpIdTokenFromJwt(idpIssuer, idToken) {
    var expFromJwt = jwtExp(idToken);
    var expiresAt = expFromJwt ? expFromJwt * 1000 : Date.now() + 3600 * 1000;
    saveIdpIdToken(idpIssuer, idToken, expiresAt);
    return expiresAt;
}
function clearIdpIdToken(idpIssuer) {
    var _a;
    var storage = (0, index_js_1.getSecureStorage)();
    var existing = storage.read();
    var key = issuerKey(idpIssuer);
    if (!((_a = existing === null || existing === void 0 ? void 0 : existing.mcpXaaIdp) === null || _a === void 0 ? void 0 : _a[key]))
        return;
    delete existing.mcpXaaIdp[key];
    storage.update(existing);
}
/**
 * Save an IdP client secret to secure storage, keyed by IdP issuer.
 * Separate from MCP server AS secrets — different trust domain.
 * Returns the storage update result so callers can surface keychain
 * failures (locked keychain, `security` nonzero exit) instead of
 * silently dropping the secret and failing later with invalid_client.
 */
function saveIdpClientSecret(idpIssuer, clientSecret) {
    var _a;
    var storage = (0, index_js_1.getSecureStorage)();
    var existing = storage.read() || {};
    return storage.update(__assign(__assign({}, existing), { mcpXaaIdpConfig: __assign(__assign({}, existing.mcpXaaIdpConfig), (_a = {}, _a[issuerKey(idpIssuer)] = { clientSecret: clientSecret }, _a)) }));
}
/**
 * Read the IdP client secret for the given issuer from secure storage.
 */
function getIdpClientSecret(idpIssuer) {
    var _a, _b;
    var storage = (0, index_js_1.getSecureStorage)();
    var data = storage.read();
    return (_b = (_a = data === null || data === void 0 ? void 0 : data.mcpXaaIdpConfig) === null || _a === void 0 ? void 0 : _a[issuerKey(idpIssuer)]) === null || _b === void 0 ? void 0 : _b.clientSecret;
}
/**
 * Remove the IdP client secret for the given issuer from secure storage.
 * Used by `claude mcp xaa clear`.
 */
function clearIdpClientSecret(idpIssuer) {
    var _a;
    var storage = (0, index_js_1.getSecureStorage)();
    var existing = storage.read();
    var key = issuerKey(idpIssuer);
    if (!((_a = existing === null || existing === void 0 ? void 0 : existing.mcpXaaIdpConfig) === null || _a === void 0 ? void 0 : _a[key]))
        return;
    delete existing.mcpXaaIdpConfig[key];
    storage.update(existing);
}
// OIDC Discovery §4.1 says `{issuer}/.well-known/openid-configuration` — path
// APPEND, not replace. `new URL('/.well-known/...', issuer)` with a leading
// slash is a WHATWG absolute-path reference and drops the issuer's pathname,
// breaking Azure AD (`login.microsoftonline.com/{tenant}/v2.0`), Okta custom
// auth servers, and Keycloak realms. Trailing-slash base + relative path is
// the fix. Exported because auth.ts needs the same discovery.
function discoverOidc(idpIssuer) {
    return __awaiter(this, void 0, void 0, function () {
        var base, url, res, body, _a, parsed;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    base = idpIssuer.endsWith('/') ? idpIssuer : idpIssuer + '/';
                    url = new URL('.well-known/openid-configuration', base);
                    return [4 /*yield*/, fetch(url, {
                            headers: { Accept: 'application/json' },
                            signal: AbortSignal.timeout(IDP_REQUEST_TIMEOUT_MS),
                        })];
                case 1:
                    res = _b.sent();
                    if (!res.ok) {
                        throw new Error("XAA IdP: OIDC discovery failed: HTTP ".concat(res.status, " at ").concat(url));
                    }
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, res.json()];
                case 3:
                    body = _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    throw new Error("XAA IdP: OIDC discovery returned non-JSON at ".concat(url, " (captive portal or proxy?)"));
                case 5:
                    parsed = auth_js_2.OpenIdProviderDiscoveryMetadataSchema.safeParse(body);
                    if (!parsed.success) {
                        throw new Error("XAA IdP: invalid OIDC metadata: ".concat(parsed.error.message));
                    }
                    if (new URL(parsed.data.token_endpoint).protocol !== 'https:') {
                        throw new Error("XAA IdP: refusing non-HTTPS token endpoint: ".concat(parsed.data.token_endpoint));
                    }
                    return [2 /*return*/, parsed.data];
            }
        });
    });
}
/**
 * Decode the exp claim from a JWT without verifying its signature.
 * Returns undefined if parsing fails or exp is absent. Used only to
 * derive a cache TTL.
 *
 * Why no signature/iss/aud/nonce validation: per SEP-990, this id_token
 * is the RFC 8693 subject_token in a token-exchange at the IdP's own
 * token endpoint. The IdP validates its own token there. An attacker who
 * can mint a token that fools the IdP has no need to fool us first; an
 * attacker who can't, hands us garbage and gets a 401 from the IdP. The
 * --id-token injection seam is likewise safe: bad input → rejected later,
 * no privesc. Client-side verification would add code and no security.
 */
function jwtExp(jwt) {
    var parts = jwt.split('.');
    if (parts.length !== 3)
        return undefined;
    try {
        var payload = (0, slowOperations_js_1.jsonParse)(Buffer.from(parts[1], 'base64url').toString('utf-8'));
        return typeof payload.exp === 'number' ? payload.exp : undefined;
    }
    catch (_a) {
        return undefined;
    }
}
/**
 * Wait for the OAuth authorization code on a local callback server.
 * Returns the code once /callback is hit with a matching state.
 *
 * `onListening` fires after the socket is actually bound — use it to defer
 * browser-open so EADDRINUSE surfaces before a spurious tab pops open.
 */
function waitForCallback(port, expectedState, abortSignal, onListening) {
    var server = null;
    var timeoutId = null;
    var abortHandler = null;
    var cleanup = function () {
        server === null || server === void 0 ? void 0 : server.removeAllListeners();
        // Defensive: removeAllListeners() strips the error handler, so swallow any late error during close
        server === null || server === void 0 ? void 0 : server.on('error', function () { });
        server === null || server === void 0 ? void 0 : server.close();
        server = null;
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
        if (abortSignal && abortHandler) {
            abortSignal.removeEventListener('abort', abortHandler);
            abortHandler = null;
        }
    };
    return new Promise(function (resolve, reject) {
        var resolved = false;
        var resolveOnce = function (v) {
            if (resolved)
                return;
            resolved = true;
            cleanup();
            resolve(v);
        };
        var rejectOnce = function (e) {
            if (resolved)
                return;
            resolved = true;
            cleanup();
            reject(e);
        };
        if (abortSignal) {
            abortHandler = function () { return rejectOnce(new Error('XAA IdP: login cancelled')); };
            if (abortSignal.aborted) {
                abortHandler();
                return;
            }
            abortSignal.addEventListener('abort', abortHandler, { once: true });
        }
        server = (0, http_1.createServer)(function (req, res) {
            var parsed = (0, url_1.parse)(req.url || '', true);
            if (parsed.pathname !== '/callback') {
                res.writeHead(404);
                res.end();
                return;
            }
            var code = parsed.query.code;
            var state = parsed.query.state;
            var err = parsed.query.error;
            if (err) {
                var desc = parsed.query.error_description;
                var safeErr = (0, xss_1.default)(err);
                var safeDesc = desc ? (0, xss_1.default)(desc) : '';
                res.writeHead(400, { 'Content-Type': 'text/html' });
                res.end("<html><body><h3>IdP login failed</h3><p>".concat(safeErr, "</p><p>").concat(safeDesc, "</p></body></html>"));
                rejectOnce(new Error("XAA IdP: ".concat(err).concat(desc ? " \u2014 ".concat(desc) : '')));
                return;
            }
            if (state !== expectedState) {
                res.writeHead(400, { 'Content-Type': 'text/html' });
                res.end('<html><body><h3>State mismatch</h3></body></html>');
                rejectOnce(new Error('XAA IdP: state mismatch (possible CSRF)'));
                return;
            }
            if (!code) {
                res.writeHead(400, { 'Content-Type': 'text/html' });
                res.end('<html><body><h3>Missing code</h3></body></html>');
                rejectOnce(new Error('XAA IdP: callback missing code'));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end('<html><body><h3>IdP login complete — you can close this window.</h3></body></html>');
            resolveOnce(code);
        });
        server.on('error', function (err) {
            if (err.code === 'EADDRINUSE') {
                var findCmd = (0, platform_js_1.getPlatform)() === 'windows'
                    ? "netstat -ano | findstr :".concat(port)
                    : "lsof -ti:".concat(port, " -sTCP:LISTEN");
                rejectOnce(new Error("XAA IdP: callback port ".concat(port, " is already in use. Run `").concat(findCmd, "` to find the holder.")));
            }
            else {
                rejectOnce(new Error("XAA IdP: callback server failed: ".concat(err.message)));
            }
        });
        server.listen(port, '127.0.0.1', function () {
            try {
                onListening();
            }
            catch (e) {
                rejectOnce((0, errors_js_1.toError)(e));
            }
        });
        server.unref();
        timeoutId = setTimeout(function (rej) { return rej(new Error('XAA IdP: login timed out')); }, IDP_LOGIN_TIMEOUT_MS, rejectOnce);
        timeoutId.unref();
    });
}
/**
 * Acquire an id_token from the IdP: return cached if valid, otherwise run
 * the full OIDC authorization_code + PKCE flow (one browser pop).
 */
function acquireIdpIdToken(opts) {
    return __awaiter(this, void 0, void 0, function () {
        var idpIssuer, idpClientId, cached, metadata, port, _a, redirectUri, state, clientInformation, _b, authorizationUrl, codeVerifier, authorizationCode, tokens, expFromJwt, expiresAt;
        var _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    idpIssuer = opts.idpIssuer, idpClientId = opts.idpClientId;
                    cached = getCachedIdpIdToken(idpIssuer);
                    if (cached) {
                        (0, log_js_1.logMCPDebug)('xaa', "Using cached id_token for ".concat(idpIssuer));
                        return [2 /*return*/, cached];
                    }
                    (0, log_js_1.logMCPDebug)('xaa', "No cached id_token for ".concat(idpIssuer, "; starting OIDC login"));
                    return [4 /*yield*/, discoverOidc(idpIssuer)];
                case 1:
                    metadata = _e.sent();
                    if (!((_c = opts.callbackPort) !== null && _c !== void 0)) return [3 /*break*/, 2];
                    _a = _c;
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, (0, oauthPort_js_1.findAvailablePort)()];
                case 3:
                    _a = (_e.sent());
                    _e.label = 4;
                case 4:
                    port = _a;
                    redirectUri = (0, oauthPort_js_1.buildRedirectUri)(port);
                    state = (0, crypto_1.randomBytes)(32).toString('base64url');
                    clientInformation = __assign({ client_id: idpClientId }, (opts.idpClientSecret ? { client_secret: opts.idpClientSecret } : {}));
                    return [4 /*yield*/, (0, auth_js_1.startAuthorization)(idpIssuer, {
                            metadata: metadata,
                            clientInformation: clientInformation,
                            redirectUrl: redirectUri,
                            scope: 'openid',
                            state: state,
                        })
                        // Open the browser only after the socket is actually bound — listen() is
                        // async, and on the fixed-callbackPort path EADDRINUSE otherwise surfaces
                        // after a spurious tab has already popped. Mirrors the auth.ts pattern of
                        // wrapping sdkAuth inside server.listen's callback.
                    ];
                case 5:
                    _b = _e.sent(), authorizationUrl = _b.authorizationUrl, codeVerifier = _b.codeVerifier;
                    return [4 /*yield*/, waitForCallback(port, state, opts.abortSignal, function () {
                            if (opts.onAuthorizationUrl) {
                                opts.onAuthorizationUrl(authorizationUrl.toString());
                            }
                            if (!opts.skipBrowserOpen) {
                                (0, log_js_1.logMCPDebug)('xaa', "Opening browser to IdP authorization endpoint");
                                void (0, browser_js_1.openBrowser)(authorizationUrl.toString());
                            }
                        })];
                case 6:
                    authorizationCode = _e.sent();
                    return [4 /*yield*/, (0, auth_js_1.exchangeAuthorization)(idpIssuer, {
                            metadata: metadata,
                            clientInformation: clientInformation,
                            authorizationCode: authorizationCode,
                            codeVerifier: codeVerifier,
                            redirectUri: redirectUri,
                            fetchFn: function (url, init) {
                                // eslint-disable-next-line eslint-plugin-n/no-unsupported-features/node-builtins
                                return fetch(url, __assign(__assign({}, init), { signal: AbortSignal.timeout(IDP_REQUEST_TIMEOUT_MS) }));
                            },
                        })];
                case 7:
                    tokens = _e.sent();
                    if (!tokens.id_token) {
                        throw new Error('XAA IdP: token response missing id_token (check scope=openid)');
                    }
                    expFromJwt = jwtExp(tokens.id_token);
                    expiresAt = expFromJwt
                        ? expFromJwt * 1000
                        : Date.now() + ((_d = tokens.expires_in) !== null && _d !== void 0 ? _d : 3600) * 1000;
                    saveIdpIdToken(idpIssuer, tokens.id_token, expiresAt);
                    (0, log_js_1.logMCPDebug)('xaa', "Cached id_token for ".concat(idpIssuer, " (expires ").concat(new Date(expiresAt).toISOString(), ")"));
                    return [2 /*return*/, tokens.id_token];
            }
        });
    });
}
