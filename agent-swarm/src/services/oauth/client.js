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
exports.shouldUseClaudeAIAuth = shouldUseClaudeAIAuth;
exports.parseScopes = parseScopes;
exports.buildAuthUrl = buildAuthUrl;
exports.exchangeCodeForTokens = exchangeCodeForTokens;
exports.refreshOAuthToken = refreshOAuthToken;
exports.fetchAndStoreUserRoles = fetchAndStoreUserRoles;
exports.createAndStoreApiKey = createAndStoreApiKey;
exports.isOAuthTokenExpired = isOAuthTokenExpired;
exports.fetchProfileInfo = fetchProfileInfo;
exports.getOrganizationUUID = getOrganizationUUID;
exports.populateOAuthAccountInfoIfNeeded = populateOAuthAccountInfoIfNeeded;
exports.storeOAuthAccountInfo = storeOAuthAccountInfo;
// OAuth client for handling authentication flows with Claude services
var axios_1 = require("axios");
var index_js_1 = require("src/services/analytics/index.js");
var oauth_js_1 = require("../../constants/oauth.js");
var auth_js_1 = require("../../utils/auth.js");
var config_js_1 = require("../../utils/config.js");
var debug_js_1 = require("../../utils/debug.js");
var getOauthProfile_js_1 = require("./getOauthProfile.js");
/**
 * Check if the user has Claude.ai authentication scope
 * @private Only call this if you're OAuth / auth related code!
 */
function shouldUseClaudeAIAuth(scopes) {
    return Boolean(scopes === null || scopes === void 0 ? void 0 : scopes.includes(oauth_js_1.CLAUDE_AI_INFERENCE_SCOPE));
}
function parseScopes(scopeString) {
    var _a;
    return (_a = scopeString === null || scopeString === void 0 ? void 0 : scopeString.split(' ').filter(Boolean)) !== null && _a !== void 0 ? _a : [];
}
function buildAuthUrl(_a) {
    var codeChallenge = _a.codeChallenge, state = _a.state, port = _a.port, isManual = _a.isManual, loginWithClaudeAi = _a.loginWithClaudeAi, inferenceOnly = _a.inferenceOnly, orgUUID = _a.orgUUID, loginHint = _a.loginHint, loginMethod = _a.loginMethod;
    var authUrlBase = loginWithClaudeAi
        ? (0, oauth_js_1.getOauthConfig)().CLAUDE_AI_AUTHORIZE_URL
        : (0, oauth_js_1.getOauthConfig)().CONSOLE_AUTHORIZE_URL;
    var authUrl = new URL(authUrlBase);
    authUrl.searchParams.append('code', 'true'); // this tells the login page to show Claude Max upsell
    authUrl.searchParams.append('client_id', (0, oauth_js_1.getOauthConfig)().CLIENT_ID);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('redirect_uri', isManual
        ? (0, oauth_js_1.getOauthConfig)().MANUAL_REDIRECT_URL
        : "http://localhost:".concat(port, "/callback"));
    var scopesToUse = inferenceOnly
        ? [oauth_js_1.CLAUDE_AI_INFERENCE_SCOPE] // Long-lived inference-only tokens
        : oauth_js_1.ALL_OAUTH_SCOPES;
    authUrl.searchParams.append('scope', scopesToUse.join(' '));
    authUrl.searchParams.append('code_challenge', codeChallenge);
    authUrl.searchParams.append('code_challenge_method', 'S256');
    authUrl.searchParams.append('state', state);
    // Add orgUUID as URL param if provided
    if (orgUUID) {
        authUrl.searchParams.append('orgUUID', orgUUID);
    }
    // Pre-populate email on the login form (standard OIDC parameter)
    if (loginHint) {
        authUrl.searchParams.append('login_hint', loginHint);
    }
    // Request a specific login method (e.g. 'sso', 'magic_link', 'google')
    if (loginMethod) {
        authUrl.searchParams.append('login_method', loginMethod);
    }
    return authUrl.toString();
}
function exchangeCodeForTokens(authorizationCode_1, state_1, codeVerifier_1, port_1) {
    return __awaiter(this, arguments, void 0, function (authorizationCode, state, codeVerifier, port, useManualRedirect, expiresIn) {
        var requestBody, response;
        if (useManualRedirect === void 0) { useManualRedirect = false; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    requestBody = {
                        grant_type: 'authorization_code',
                        code: authorizationCode,
                        redirect_uri: useManualRedirect
                            ? (0, oauth_js_1.getOauthConfig)().MANUAL_REDIRECT_URL
                            : "http://localhost:".concat(port, "/callback"),
                        client_id: (0, oauth_js_1.getOauthConfig)().CLIENT_ID,
                        code_verifier: codeVerifier,
                        state: state,
                    };
                    if (expiresIn !== undefined) {
                        requestBody.expires_in = expiresIn;
                    }
                    return [4 /*yield*/, axios_1.default.post((0, oauth_js_1.getOauthConfig)().TOKEN_URL, requestBody, {
                            headers: { 'Content-Type': 'application/json' },
                            timeout: 15000,
                        })];
                case 1:
                    response = _a.sent();
                    if (response.status !== 200) {
                        throw new Error(response.status === 401
                            ? 'Authentication failed: Invalid authorization code'
                            : "Token exchange failed (".concat(response.status, "): ").concat(response.statusText));
                    }
                    (0, index_js_1.logEvent)('tengu_oauth_token_exchange_success', {});
                    return [2 /*return*/, response.data];
            }
        });
    });
}
function refreshOAuthToken(refreshToken_1) {
    return __awaiter(this, arguments, void 0, function (refreshToken, _a) {
        var requestBody, response, data, accessToken, _b, newRefreshToken, expiresIn, expiresAt, scopes, config, existing, haveProfileAlready, profileInfo, _c, updates_1, error_1, responseBody;
        var _d, _e, _f, _g, _h, _j, _k, _l, _m;
        var _o = _a === void 0 ? {} : _a, requestedScopes = _o.scopes;
        return __generator(this, function (_p) {
            switch (_p.label) {
                case 0:
                    requestBody = {
                        grant_type: 'refresh_token',
                        refresh_token: refreshToken,
                        client_id: (0, oauth_js_1.getOauthConfig)().CLIENT_ID,
                        // Request specific scopes, defaulting to the full Claude AI set. The
                        // backend's refresh-token grant allows scope expansion beyond what the
                        // initial authorize granted (see ALLOWED_SCOPE_EXPANSIONS), so this is
                        // safe even for tokens issued before scopes were added to the app's
                        // registered oauth_scope.
                        scope: ((requestedScopes === null || requestedScopes === void 0 ? void 0 : requestedScopes.length)
                            ? requestedScopes
                            : oauth_js_1.CLAUDE_AI_OAUTH_SCOPES).join(' '),
                    };
                    _p.label = 1;
                case 1:
                    _p.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, axios_1.default.post((0, oauth_js_1.getOauthConfig)().TOKEN_URL, requestBody, {
                            headers: { 'Content-Type': 'application/json' },
                            timeout: 15000,
                        })];
                case 2:
                    response = _p.sent();
                    if (response.status !== 200) {
                        throw new Error("Token refresh failed: ".concat(response.statusText));
                    }
                    data = response.data;
                    accessToken = data.access_token, _b = data.refresh_token, newRefreshToken = _b === void 0 ? refreshToken : _b, expiresIn = data.expires_in;
                    expiresAt = Date.now() + expiresIn * 1000;
                    scopes = parseScopes(data.scope);
                    (0, index_js_1.logEvent)('tengu_oauth_token_refresh_success', {});
                    config = (0, config_js_1.getGlobalConfig)();
                    existing = (0, auth_js_1.getClaudeAIOAuthTokens)();
                    haveProfileAlready = ((_d = config.oauthAccount) === null || _d === void 0 ? void 0 : _d.billingType) !== undefined &&
                        ((_e = config.oauthAccount) === null || _e === void 0 ? void 0 : _e.accountCreatedAt) !== undefined &&
                        ((_f = config.oauthAccount) === null || _f === void 0 ? void 0 : _f.subscriptionCreatedAt) !== undefined &&
                        (existing === null || existing === void 0 ? void 0 : existing.subscriptionType) != null &&
                        (existing === null || existing === void 0 ? void 0 : existing.rateLimitTier) != null;
                    if (!haveProfileAlready) return [3 /*break*/, 3];
                    _c = null;
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, fetchProfileInfo(accessToken)
                    // Update the stored properties if they have changed
                ];
                case 4:
                    _c = _p.sent();
                    _p.label = 5;
                case 5:
                    profileInfo = _c;
                    // Update the stored properties if they have changed
                    if (profileInfo && config.oauthAccount) {
                        updates_1 = {};
                        if (profileInfo.displayName !== undefined) {
                            updates_1.displayName = profileInfo.displayName;
                        }
                        if (typeof profileInfo.hasExtraUsageEnabled === 'boolean') {
                            updates_1.hasExtraUsageEnabled = profileInfo.hasExtraUsageEnabled;
                        }
                        if (profileInfo.billingType !== null) {
                            updates_1.billingType = profileInfo.billingType;
                        }
                        if (profileInfo.accountCreatedAt !== undefined) {
                            updates_1.accountCreatedAt = profileInfo.accountCreatedAt;
                        }
                        if (profileInfo.subscriptionCreatedAt !== undefined) {
                            updates_1.subscriptionCreatedAt = profileInfo.subscriptionCreatedAt;
                        }
                        if (Object.keys(updates_1).length > 0) {
                            (0, config_js_1.saveGlobalConfig)(function (current) { return (__assign(__assign({}, current), { oauthAccount: current.oauthAccount
                                    ? __assign(__assign({}, current.oauthAccount), updates_1) : current.oauthAccount })); });
                        }
                    }
                    return [2 /*return*/, {
                            accessToken: accessToken,
                            refreshToken: newRefreshToken,
                            expiresAt: expiresAt,
                            scopes: scopes,
                            subscriptionType: (_h = (_g = profileInfo === null || profileInfo === void 0 ? void 0 : profileInfo.subscriptionType) !== null && _g !== void 0 ? _g : existing === null || existing === void 0 ? void 0 : existing.subscriptionType) !== null && _h !== void 0 ? _h : null,
                            rateLimitTier: (_k = (_j = profileInfo === null || profileInfo === void 0 ? void 0 : profileInfo.rateLimitTier) !== null && _j !== void 0 ? _j : existing === null || existing === void 0 ? void 0 : existing.rateLimitTier) !== null && _k !== void 0 ? _k : null,
                            profile: profileInfo === null || profileInfo === void 0 ? void 0 : profileInfo.rawProfile,
                            tokenAccount: data.account
                                ? {
                                    uuid: data.account.uuid,
                                    emailAddress: data.account.email_address,
                                    organizationUuid: (_l = data.organization) === null || _l === void 0 ? void 0 : _l.uuid,
                                }
                                : undefined,
                        }];
                case 6:
                    error_1 = _p.sent();
                    responseBody = axios_1.default.isAxiosError(error_1) && ((_m = error_1.response) === null || _m === void 0 ? void 0 : _m.data)
                        ? JSON.stringify(error_1.response.data)
                        : undefined;
                    (0, index_js_1.logEvent)('tengu_oauth_token_refresh_failure', __assign({ error: error_1
                            .message }, (responseBody && {
                        responseBody: responseBody,
                    })));
                    throw error_1;
                case 7: return [2 /*return*/];
            }
        });
    });
}
function fetchAndStoreUserRoles(accessToken) {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, config;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios_1.default.get((0, oauth_js_1.getOauthConfig)().ROLES_URL, {
                        headers: { Authorization: "Bearer ".concat(accessToken) },
                    })];
                case 1:
                    response = _a.sent();
                    if (response.status !== 200) {
                        throw new Error("Failed to fetch user roles: ".concat(response.statusText));
                    }
                    data = response.data;
                    config = (0, config_js_1.getGlobalConfig)();
                    if (!config.oauthAccount) {
                        throw new Error('OAuth account information not found in config');
                    }
                    (0, config_js_1.saveGlobalConfig)(function (current) { return (__assign(__assign({}, current), { oauthAccount: current.oauthAccount
                            ? __assign(__assign({}, current.oauthAccount), { organizationRole: data.organization_role, workspaceRole: data.workspace_role, organizationName: data.organization_name }) : current.oauthAccount })); });
                    (0, index_js_1.logEvent)('tengu_oauth_roles_stored', {
                        org_role: data.organization_role,
                    });
                    return [2 /*return*/];
            }
        });
    });
}
function createAndStoreApiKey(accessToken) {
    return __awaiter(this, void 0, void 0, function () {
        var response, apiKey, error_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, axios_1.default.post((0, oauth_js_1.getOauthConfig)().API_KEY_URL, null, {
                            headers: { Authorization: "Bearer ".concat(accessToken) },
                        })];
                case 1:
                    response = _b.sent();
                    apiKey = (_a = response.data) === null || _a === void 0 ? void 0 : _a.raw_key;
                    if (!apiKey) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, auth_js_1.saveApiKey)(apiKey)];
                case 2:
                    _b.sent();
                    (0, index_js_1.logEvent)('tengu_oauth_api_key', {
                        status: 'success',
                        statusCode: response.status,
                    });
                    return [2 /*return*/, apiKey];
                case 3: return [2 /*return*/, null];
                case 4:
                    error_2 = _b.sent();
                    (0, index_js_1.logEvent)('tengu_oauth_api_key', {
                        status: 'failure',
                        error: (error_2 instanceof Error
                            ? error_2.message
                            : String(error_2)),
                    });
                    throw error_2;
                case 5: return [2 /*return*/];
            }
        });
    });
}
function isOAuthTokenExpired(expiresAt) {
    if (expiresAt === null) {
        return false;
    }
    var bufferTime = 5 * 60 * 1000;
    var now = Date.now();
    var expiresWithBuffer = now + bufferTime;
    return expiresWithBuffer >= expiresAt;
}
function fetchProfileInfo(accessToken) {
    return __awaiter(this, void 0, void 0, function () {
        var profile, orgType, subscriptionType, result;
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        return __generator(this, function (_l) {
            switch (_l.label) {
                case 0: return [4 /*yield*/, (0, getOauthProfile_js_1.getOauthProfileFromOauthToken)(accessToken)];
                case 1:
                    profile = _l.sent();
                    orgType = (_a = profile === null || profile === void 0 ? void 0 : profile.organization) === null || _a === void 0 ? void 0 : _a.organization_type;
                    subscriptionType = null;
                    switch (orgType) {
                        case 'claude_max':
                            subscriptionType = 'max';
                            break;
                        case 'claude_pro':
                            subscriptionType = 'pro';
                            break;
                        case 'claude_enterprise':
                            subscriptionType = 'enterprise';
                            break;
                        case 'claude_team':
                            subscriptionType = 'team';
                            break;
                        default:
                            // Return null for unknown organization types
                            subscriptionType = null;
                            break;
                    }
                    result = {
                        subscriptionType: subscriptionType,
                        rateLimitTier: (_c = (_b = profile === null || profile === void 0 ? void 0 : profile.organization) === null || _b === void 0 ? void 0 : _b.rate_limit_tier) !== null && _c !== void 0 ? _c : null,
                        hasExtraUsageEnabled: (_e = (_d = profile === null || profile === void 0 ? void 0 : profile.organization) === null || _d === void 0 ? void 0 : _d.has_extra_usage_enabled) !== null && _e !== void 0 ? _e : null,
                        billingType: (_g = (_f = profile === null || profile === void 0 ? void 0 : profile.organization) === null || _f === void 0 ? void 0 : _f.billing_type) !== null && _g !== void 0 ? _g : null,
                    };
                    if ((_h = profile === null || profile === void 0 ? void 0 : profile.account) === null || _h === void 0 ? void 0 : _h.display_name) {
                        result.displayName = profile.account.display_name;
                    }
                    if ((_j = profile === null || profile === void 0 ? void 0 : profile.account) === null || _j === void 0 ? void 0 : _j.created_at) {
                        result.accountCreatedAt = profile.account.created_at;
                    }
                    if ((_k = profile === null || profile === void 0 ? void 0 : profile.organization) === null || _k === void 0 ? void 0 : _k.subscription_created_at) {
                        result.subscriptionCreatedAt = profile.organization.subscription_created_at;
                    }
                    (0, index_js_1.logEvent)('tengu_oauth_profile_fetch_success', {});
                    return [2 /*return*/, __assign(__assign({}, result), { rawProfile: profile })];
            }
        });
    });
}
/**
 * Gets the organization UUID from the OAuth access token
 * @returns The organization UUID or null if not authenticated
 */
function getOrganizationUUID() {
    return __awaiter(this, void 0, void 0, function () {
        var globalConfig, orgUUID, accessToken, profile, profileOrgUUID;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    globalConfig = (0, config_js_1.getGlobalConfig)();
                    orgUUID = (_a = globalConfig.oauthAccount) === null || _a === void 0 ? void 0 : _a.organizationUuid;
                    if (orgUUID) {
                        return [2 /*return*/, orgUUID];
                    }
                    accessToken = (_b = (0, auth_js_1.getClaudeAIOAuthTokens)()) === null || _b === void 0 ? void 0 : _b.accessToken;
                    if (accessToken === undefined || !(0, auth_js_1.hasProfileScope)()) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, (0, getOauthProfile_js_1.getOauthProfileFromOauthToken)(accessToken)];
                case 1:
                    profile = _d.sent();
                    profileOrgUUID = (_c = profile === null || profile === void 0 ? void 0 : profile.organization) === null || _c === void 0 ? void 0 : _c.uuid;
                    if (!profileOrgUUID) {
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, profileOrgUUID];
            }
        });
    });
}
/**
 * Populate the OAuth account info if it has not already been cached in config.
 * @returns Whether or not the oauth account info was populated.
 */
function populateOAuthAccountInfoIfNeeded() {
    return __awaiter(this, void 0, void 0, function () {
        var envAccountUuid, envUserEmail, envOrganizationUuid, hasEnvVars, config, tokens, profile;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    envAccountUuid = process.env.CLAUDE_CODE_ACCOUNT_UUID;
                    envUserEmail = process.env.CLAUDE_CODE_USER_EMAIL;
                    envOrganizationUuid = process.env.CLAUDE_CODE_ORGANIZATION_UUID;
                    hasEnvVars = Boolean(envAccountUuid && envUserEmail && envOrganizationUuid);
                    if (envAccountUuid && envUserEmail && envOrganizationUuid) {
                        if (!(0, config_js_1.getGlobalConfig)().oauthAccount) {
                            storeOAuthAccountInfo({
                                accountUuid: envAccountUuid,
                                emailAddress: envUserEmail,
                                organizationUuid: envOrganizationUuid,
                            });
                        }
                    }
                    // Wait for any in-flight token refresh to complete first, since
                    // refreshOAuthToken already fetches and stores profile info
                    return [4 /*yield*/, (0, auth_js_1.checkAndRefreshOAuthTokenIfNeeded)()];
                case 1:
                    // Wait for any in-flight token refresh to complete first, since
                    // refreshOAuthToken already fetches and stores profile info
                    _d.sent();
                    config = (0, config_js_1.getGlobalConfig)();
                    if ((config.oauthAccount &&
                        config.oauthAccount.billingType !== undefined &&
                        config.oauthAccount.accountCreatedAt !== undefined &&
                        config.oauthAccount.subscriptionCreatedAt !== undefined) ||
                        !(0, auth_js_1.isClaudeAISubscriber)() ||
                        !(0, auth_js_1.hasProfileScope)()) {
                        return [2 /*return*/, false];
                    }
                    tokens = (0, auth_js_1.getClaudeAIOAuthTokens)();
                    if (!(tokens === null || tokens === void 0 ? void 0 : tokens.accessToken)) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, getOauthProfile_js_1.getOauthProfileFromOauthToken)(tokens.accessToken)];
                case 2:
                    profile = _d.sent();
                    if (profile) {
                        if (hasEnvVars) {
                            (0, debug_js_1.logForDebugging)('OAuth profile fetch succeeded, overriding env var account info', { level: 'info' });
                        }
                        storeOAuthAccountInfo({
                            accountUuid: profile.account.uuid,
                            emailAddress: profile.account.email,
                            organizationUuid: profile.organization.uuid,
                            displayName: profile.account.display_name || undefined,
                            hasExtraUsageEnabled: (_a = profile.organization.has_extra_usage_enabled) !== null && _a !== void 0 ? _a : false,
                            billingType: (_b = profile.organization.billing_type) !== null && _b !== void 0 ? _b : undefined,
                            accountCreatedAt: profile.account.created_at,
                            subscriptionCreatedAt: (_c = profile.organization.subscription_created_at) !== null && _c !== void 0 ? _c : undefined,
                        });
                        return [2 /*return*/, true];
                    }
                    _d.label = 3;
                case 3: return [2 /*return*/, false];
            }
        });
    });
}
function storeOAuthAccountInfo(_a) {
    var accountUuid = _a.accountUuid, emailAddress = _a.emailAddress, organizationUuid = _a.organizationUuid, displayName = _a.displayName, hasExtraUsageEnabled = _a.hasExtraUsageEnabled, billingType = _a.billingType, accountCreatedAt = _a.accountCreatedAt, subscriptionCreatedAt = _a.subscriptionCreatedAt;
    var accountInfo = {
        accountUuid: accountUuid,
        emailAddress: emailAddress,
        organizationUuid: organizationUuid,
        hasExtraUsageEnabled: hasExtraUsageEnabled,
        billingType: billingType,
        accountCreatedAt: accountCreatedAt,
        subscriptionCreatedAt: subscriptionCreatedAt,
    };
    if (displayName) {
        accountInfo.displayName = displayName;
    }
    (0, config_js_1.saveGlobalConfig)(function (current) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        // For oauthAccount we need to compare content since it's an object
        if (((_a = current.oauthAccount) === null || _a === void 0 ? void 0 : _a.accountUuid) === accountInfo.accountUuid &&
            ((_b = current.oauthAccount) === null || _b === void 0 ? void 0 : _b.emailAddress) === accountInfo.emailAddress &&
            ((_c = current.oauthAccount) === null || _c === void 0 ? void 0 : _c.organizationUuid) === accountInfo.organizationUuid &&
            ((_d = current.oauthAccount) === null || _d === void 0 ? void 0 : _d.displayName) === accountInfo.displayName &&
            ((_e = current.oauthAccount) === null || _e === void 0 ? void 0 : _e.hasExtraUsageEnabled) ===
                accountInfo.hasExtraUsageEnabled &&
            ((_f = current.oauthAccount) === null || _f === void 0 ? void 0 : _f.billingType) === accountInfo.billingType &&
            ((_g = current.oauthAccount) === null || _g === void 0 ? void 0 : _g.accountCreatedAt) === accountInfo.accountCreatedAt &&
            ((_h = current.oauthAccount) === null || _h === void 0 ? void 0 : _h.subscriptionCreatedAt) ===
                accountInfo.subscriptionCreatedAt) {
            return current;
        }
        return __assign(__assign({}, current), { oauthAccount: accountInfo });
    });
}
