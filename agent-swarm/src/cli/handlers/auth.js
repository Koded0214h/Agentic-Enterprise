"use strict";
/* eslint-disable custom-rules/no-process-exit -- CLI subcommand handler intentionally exits */
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.installOAuthTokens = installOAuthTokens;
exports.authLogin = authLogin;
exports.authStatus = authStatus;
exports.authLogout = authLogout;
var logout_js_1 = require("../../commands/logout/logout.js");
var index_js_1 = require("../../services/analytics/index.js");
var errorUtils_js_1 = require("../../services/api/errorUtils.js");
var firstTokenDate_js_1 = require("../../services/api/firstTokenDate.js");
var client_js_1 = require("../../services/oauth/client.js");
var getOauthProfile_js_1 = require("../../services/oauth/getOauthProfile.js");
var index_js_2 = require("../../services/oauth/index.js");
var auth_js_1 = require("../../utils/auth.js");
var config_js_1 = require("../../utils/config.js");
var debug_js_1 = require("../../utils/debug.js");
var envUtils_js_1 = require("../../utils/envUtils.js");
var errors_js_1 = require("../../utils/errors.js");
var log_js_1 = require("../../utils/log.js");
var providers_js_1 = require("../../utils/model/providers.js");
var settings_js_1 = require("../../utils/settings/settings.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var status_js_1 = require("../../utils/status.js");
/**
 * Shared post-token-acquisition logic. Saves tokens, fetches profile/roles,
 * and sets up the local auth state.
 */
function installOAuthTokens(tokens) {
    return __awaiter(this, void 0, void 0, function () {
        var profile, _a, storageResult, apiKey;
        var _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0: 
                // Clear old state before saving new credentials
                return [4 /*yield*/, (0, logout_js_1.performLogout)({ clearOnboarding: false })
                    // Reuse pre-fetched profile if available, otherwise fetch fresh
                ];
                case 1:
                    // Clear old state before saving new credentials
                    _f.sent();
                    if (!((_b = tokens.profile) !== null && _b !== void 0)) return [3 /*break*/, 2];
                    _a = _b;
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, (0, getOauthProfile_js_1.getOauthProfileFromOauthToken)(tokens.accessToken)];
                case 3:
                    _a = (_f.sent());
                    _f.label = 4;
                case 4:
                    profile = _a;
                    if (profile) {
                        (0, client_js_1.storeOAuthAccountInfo)({
                            accountUuid: profile.account.uuid,
                            emailAddress: profile.account.email,
                            organizationUuid: profile.organization.uuid,
                            displayName: profile.account.display_name || undefined,
                            hasExtraUsageEnabled: (_c = profile.organization.has_extra_usage_enabled) !== null && _c !== void 0 ? _c : undefined,
                            billingType: (_d = profile.organization.billing_type) !== null && _d !== void 0 ? _d : undefined,
                            subscriptionCreatedAt: (_e = profile.organization.subscription_created_at) !== null && _e !== void 0 ? _e : undefined,
                            accountCreatedAt: profile.account.created_at,
                        });
                    }
                    else if (tokens.tokenAccount) {
                        // Fallback to token exchange account data when profile endpoint fails
                        (0, client_js_1.storeOAuthAccountInfo)({
                            accountUuid: tokens.tokenAccount.uuid,
                            emailAddress: tokens.tokenAccount.emailAddress,
                            organizationUuid: tokens.tokenAccount.organizationUuid,
                        });
                    }
                    storageResult = (0, auth_js_1.saveOAuthTokensIfNeeded)(tokens);
                    (0, auth_js_1.clearOAuthTokenCache)();
                    if (storageResult.warning) {
                        (0, index_js_1.logEvent)('tengu_oauth_storage_warning', {
                            warning: storageResult.warning,
                        });
                    }
                    // Roles and first-token-date may fail for limited-scope tokens (e.g.
                    // inference-only from setup-token). They're not required for core auth.
                    return [4 /*yield*/, (0, client_js_1.fetchAndStoreUserRoles)(tokens.accessToken).catch(function (err) {
                            return (0, debug_js_1.logForDebugging)(String(err), { level: 'error' });
                        })];
                case 5:
                    // Roles and first-token-date may fail for limited-scope tokens (e.g.
                    // inference-only from setup-token). They're not required for core auth.
                    _f.sent();
                    if (!(0, client_js_1.shouldUseClaudeAIAuth)(tokens.scopes)) return [3 /*break*/, 7];
                    return [4 /*yield*/, (0, firstTokenDate_js_1.fetchAndStoreClaudeCodeFirstTokenDate)().catch(function (err) {
                            return (0, debug_js_1.logForDebugging)(String(err), { level: 'error' });
                        })];
                case 6:
                    _f.sent();
                    return [3 /*break*/, 9];
                case 7: return [4 /*yield*/, (0, client_js_1.createAndStoreApiKey)(tokens.accessToken)];
                case 8:
                    apiKey = _f.sent();
                    if (!apiKey) {
                        throw new Error('Unable to create API key. The server accepted the request but did not return a key.');
                    }
                    _f.label = 9;
                case 9: return [4 /*yield*/, (0, logout_js_1.clearAuthRelatedCaches)()];
                case 10:
                    _f.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function authLogin(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var settings, loginWithClaudeAi, orgUUID, envRefreshToken, envScopes, scopes, tokens, orgResult, err_1, sslHint, resolvedLoginMethod, oauthService, result, orgResult, err_2, sslHint;
        var _this = this;
        var email = _b.email, sso = _b.sso, useConsole = _b.console, claudeai = _b.claudeai;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (useConsole && claudeai) {
                        process.stderr.write('Error: --console and --claudeai cannot be used together.\n');
                        process.exit(1);
                    }
                    settings = (0, settings_js_1.getInitialSettings)();
                    loginWithClaudeAi = settings.forceLoginMethod
                        ? settings.forceLoginMethod === 'claudeai'
                        : !useConsole;
                    orgUUID = settings.forceLoginOrgUUID;
                    envRefreshToken = process.env.CLAUDE_CODE_OAUTH_REFRESH_TOKEN;
                    if (!envRefreshToken) return [3 /*break*/, 6];
                    envScopes = process.env.CLAUDE_CODE_OAUTH_SCOPES;
                    if (!envScopes) {
                        process.stderr.write('CLAUDE_CODE_OAUTH_SCOPES is required when using CLAUDE_CODE_OAUTH_REFRESH_TOKEN.\n' +
                            'Set it to the space-separated scopes the refresh token was issued with\n' +
                            '(e.g. "user:inference" or "user:profile user:inference user:sessions:claude_code user:mcp_servers").\n');
                        process.exit(1);
                    }
                    scopes = envScopes.split(/\s+/).filter(Boolean);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 5, , 6]);
                    (0, index_js_1.logEvent)('tengu_login_from_refresh_token', {});
                    return [4 /*yield*/, (0, client_js_1.refreshOAuthToken)(envRefreshToken, { scopes: scopes })];
                case 2:
                    tokens = _c.sent();
                    return [4 /*yield*/, installOAuthTokens(tokens)];
                case 3:
                    _c.sent();
                    return [4 /*yield*/, (0, auth_js_1.validateForceLoginOrg)()];
                case 4:
                    orgResult = _c.sent();
                    if (!orgResult.valid) {
                        process.stderr.write(orgResult.message + '\n');
                        process.exit(1);
                    }
                    // Mark onboarding complete — interactive paths handle this via
                    // the Onboarding component, but the env var path skips it.
                    (0, config_js_1.saveGlobalConfig)(function (current) {
                        if (current.hasCompletedOnboarding)
                            return current;
                        return __assign(__assign({}, current), { hasCompletedOnboarding: true });
                    });
                    (0, index_js_1.logEvent)('tengu_oauth_success', {
                        loginWithClaudeAi: (0, client_js_1.shouldUseClaudeAIAuth)(tokens.scopes),
                    });
                    process.stdout.write('Login successful.\n');
                    process.exit(0);
                    return [3 /*break*/, 6];
                case 5:
                    err_1 = _c.sent();
                    (0, log_js_1.logError)(err_1);
                    sslHint = (0, errorUtils_js_1.getSSLErrorHint)(err_1);
                    process.stderr.write("Login failed: ".concat((0, errors_js_1.errorMessage)(err_1), "\n").concat(sslHint ? sslHint + '\n' : ''));
                    process.exit(1);
                    return [3 /*break*/, 6];
                case 6:
                    resolvedLoginMethod = sso ? 'sso' : undefined;
                    oauthService = new index_js_2.OAuthService();
                    _c.label = 7;
                case 7:
                    _c.trys.push([7, 11, 12, 13]);
                    (0, index_js_1.logEvent)('tengu_oauth_flow_start', { loginWithClaudeAi: loginWithClaudeAi });
                    return [4 /*yield*/, oauthService.startOAuthFlow(function (url) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                process.stdout.write('Opening browser to sign in…\n');
                                process.stdout.write("If the browser didn't open, visit: ".concat(url, "\n"));
                                return [2 /*return*/];
                            });
                        }); }, {
                            loginWithClaudeAi: loginWithClaudeAi,
                            loginHint: email,
                            loginMethod: resolvedLoginMethod,
                            orgUUID: orgUUID,
                        })];
                case 8:
                    result = _c.sent();
                    return [4 /*yield*/, installOAuthTokens(result)];
                case 9:
                    _c.sent();
                    return [4 /*yield*/, (0, auth_js_1.validateForceLoginOrg)()];
                case 10:
                    orgResult = _c.sent();
                    if (!orgResult.valid) {
                        process.stderr.write(orgResult.message + '\n');
                        process.exit(1);
                    }
                    (0, index_js_1.logEvent)('tengu_oauth_success', { loginWithClaudeAi: loginWithClaudeAi });
                    process.stdout.write('Login successful.\n');
                    process.exit(0);
                    return [3 /*break*/, 13];
                case 11:
                    err_2 = _c.sent();
                    (0, log_js_1.logError)(err_2);
                    sslHint = (0, errorUtils_js_1.getSSLErrorHint)(err_2);
                    process.stderr.write("Login failed: ".concat((0, errors_js_1.errorMessage)(err_2), "\n").concat(sslHint ? sslHint + '\n' : ''));
                    process.exit(1);
                    return [3 /*break*/, 13];
                case 12:
                    oauthService.cleanup();
                    return [7 /*endfinally*/];
                case 13: return [2 /*return*/];
            }
        });
    });
}
function authStatus(opts) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, authTokenSource, hasToken, apiKeySource, hasApiKeyEnvVar, oauthAccount, subscriptionType, using3P, loggedIn, authMethod, properties, hasAuthProperty, _i, properties_1, prop, value, apiProvider, resolvedApiKeySource, output;
        var _b, _c, _d;
        return __generator(this, function (_e) {
            _a = (0, auth_js_1.getAuthTokenSource)(), authTokenSource = _a.source, hasToken = _a.hasToken;
            apiKeySource = (0, auth_js_1.getAnthropicApiKeyWithSource)().source;
            hasApiKeyEnvVar = !!process.env.ANTHROPIC_API_KEY && !(0, envUtils_js_1.isRunningOnHomespace)();
            oauthAccount = (0, auth_js_1.getOauthAccountInfo)();
            subscriptionType = (0, auth_js_1.getSubscriptionType)();
            using3P = (0, auth_js_1.isUsing3PServices)();
            loggedIn = hasToken || apiKeySource !== 'none' || hasApiKeyEnvVar || using3P;
            authMethod = 'none';
            if (using3P) {
                authMethod = 'third_party';
            }
            else if (authTokenSource === 'claude.ai') {
                authMethod = 'claude.ai';
            }
            else if (authTokenSource === 'apiKeyHelper') {
                authMethod = 'api_key_helper';
            }
            else if (authTokenSource !== 'none') {
                authMethod = 'oauth_token';
            }
            else if (apiKeySource === 'ANTHROPIC_API_KEY' || hasApiKeyEnvVar) {
                authMethod = 'api_key';
            }
            else if (apiKeySource === '/login managed key') {
                authMethod = 'claude.ai';
            }
            if (opts.text) {
                properties = __spreadArray(__spreadArray([], (0, status_js_1.buildAccountProperties)(), true), (0, status_js_1.buildAPIProviderProperties)(), true);
                hasAuthProperty = false;
                for (_i = 0, properties_1 = properties; _i < properties_1.length; _i++) {
                    prop = properties_1[_i];
                    value = typeof prop.value === 'string'
                        ? prop.value
                        : Array.isArray(prop.value)
                            ? prop.value.join(', ')
                            : null;
                    if (value === null || value === 'none') {
                        continue;
                    }
                    hasAuthProperty = true;
                    if (prop.label) {
                        process.stdout.write("".concat(prop.label, ": ").concat(value, "\n"));
                    }
                    else {
                        process.stdout.write("".concat(value, "\n"));
                    }
                }
                if (!hasAuthProperty && hasApiKeyEnvVar) {
                    process.stdout.write('API key: ANTHROPIC_API_KEY\n');
                }
                if (!loggedIn) {
                    process.stdout.write('Not logged in. Run claude auth login to authenticate.\n');
                }
            }
            else {
                apiProvider = (0, providers_js_1.getAPIProvider)();
                resolvedApiKeySource = apiKeySource !== 'none'
                    ? apiKeySource
                    : hasApiKeyEnvVar
                        ? 'ANTHROPIC_API_KEY'
                        : null;
                output = {
                    loggedIn: loggedIn,
                    authMethod: authMethod,
                    apiProvider: apiProvider,
                };
                if (resolvedApiKeySource) {
                    output.apiKeySource = resolvedApiKeySource;
                }
                if (authMethod === 'claude.ai') {
                    output.email = (_b = oauthAccount === null || oauthAccount === void 0 ? void 0 : oauthAccount.emailAddress) !== null && _b !== void 0 ? _b : null;
                    output.orgId = (_c = oauthAccount === null || oauthAccount === void 0 ? void 0 : oauthAccount.organizationUuid) !== null && _c !== void 0 ? _c : null;
                    output.orgName = (_d = oauthAccount === null || oauthAccount === void 0 ? void 0 : oauthAccount.organizationName) !== null && _d !== void 0 ? _d : null;
                    output.subscriptionType = subscriptionType !== null && subscriptionType !== void 0 ? subscriptionType : null;
                }
                process.stdout.write((0, slowOperations_js_1.jsonStringify)(output, null, 2) + '\n');
            }
            process.exit(loggedIn ? 0 : 1);
            return [2 /*return*/];
        });
    });
}
function authLogout() {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, logout_js_1.performLogout)({ clearOnboarding: false })];
                case 1:
                    _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _a = _b.sent();
                    process.stderr.write('Failed to log out.\n');
                    process.exit(1);
                    return [3 /*break*/, 3];
                case 3:
                    process.stdout.write('Successfully logged out from your Anthropic account.\n');
                    process.exit(0);
                    return [2 /*return*/];
            }
        });
    });
}
