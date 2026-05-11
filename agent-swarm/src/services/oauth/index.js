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
exports.OAuthService = void 0;
var index_js_1 = require("src/services/analytics/index.js");
var browser_js_1 = require("../../utils/browser.js");
var auth_code_listener_js_1 = require("./auth-code-listener.js");
var client = require("./client.js");
var crypto = require("./crypto.js");
/**
 * OAuth service that handles the OAuth 2.0 authorization code flow with PKCE.
 *
 * Supports two ways to get authorization codes:
 * 1. Automatic: Opens browser, redirects to localhost where we capture the code
 * 2. Manual: User manually copies and pastes the code (used in non-browser environments)
 */
var OAuthService = /** @class */ (function () {
    function OAuthService() {
        this.authCodeListener = null;
        this.port = null;
        this.manualAuthCodeResolver = null;
        this.codeVerifier = crypto.generateCodeVerifier();
    }
    OAuthService.prototype.startOAuthFlow = function (authURLHandler, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, codeChallenge, state, opts, manualFlowUrl, automaticFlowUrl, authorizationCode, isAutomaticFlow, tokenResponse, profileInfo, scopes, error_1;
            var _this = this;
            var _b, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        // Create OAuth callback listener and start it
                        this.authCodeListener = new auth_code_listener_js_1.AuthCodeListener();
                        _a = this;
                        return [4 /*yield*/, this.authCodeListener.start()
                            // Generate PKCE values and state
                        ];
                    case 1:
                        _a.port = _g.sent();
                        codeChallenge = crypto.generateCodeChallenge(this.codeVerifier);
                        state = crypto.generateState();
                        opts = {
                            codeChallenge: codeChallenge,
                            state: state,
                            port: this.port,
                            loginWithClaudeAi: options === null || options === void 0 ? void 0 : options.loginWithClaudeAi,
                            inferenceOnly: options === null || options === void 0 ? void 0 : options.inferenceOnly,
                            orgUUID: options === null || options === void 0 ? void 0 : options.orgUUID,
                            loginHint: options === null || options === void 0 ? void 0 : options.loginHint,
                            loginMethod: options === null || options === void 0 ? void 0 : options.loginMethod,
                        };
                        manualFlowUrl = client.buildAuthUrl(__assign(__assign({}, opts), { isManual: true }));
                        automaticFlowUrl = client.buildAuthUrl(__assign(__assign({}, opts), { isManual: false }));
                        return [4 /*yield*/, this.waitForAuthorizationCode(state, function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!(options === null || options === void 0 ? void 0 : options.skipBrowserOpen)) return [3 /*break*/, 2];
                                            // Hand both URLs to the caller. The automatic one still works
                                            // if the caller opens it on the same host (localhost listener
                                            // is running); the manual one works from anywhere.
                                            return [4 /*yield*/, authURLHandler(manualFlowUrl, automaticFlowUrl)];
                                        case 1:
                                            // Hand both URLs to the caller. The automatic one still works
                                            // if the caller opens it on the same host (localhost listener
                                            // is running); the manual one works from anywhere.
                                            _a.sent();
                                            return [3 /*break*/, 5];
                                        case 2: return [4 /*yield*/, authURLHandler(manualFlowUrl)]; // Show manual option to user
                                        case 3:
                                            _a.sent(); // Show manual option to user
                                            return [4 /*yield*/, (0, browser_js_1.openBrowser)(automaticFlowUrl)]; // Try automatic flow
                                        case 4:
                                            _a.sent(); // Try automatic flow
                                            _a.label = 5;
                                        case 5: return [2 /*return*/];
                                    }
                                });
                            }); })
                            // Check if the automatic flow is still active (has a pending response)
                        ];
                    case 2:
                        authorizationCode = _g.sent();
                        isAutomaticFlow = (_c = (_b = this.authCodeListener) === null || _b === void 0 ? void 0 : _b.hasPendingResponse()) !== null && _c !== void 0 ? _c : false;
                        (0, index_js_1.logEvent)('tengu_oauth_auth_code_received', { automatic: isAutomaticFlow });
                        _g.label = 3;
                    case 3:
                        _g.trys.push([3, 6, 7, 8]);
                        return [4 /*yield*/, client.exchangeCodeForTokens(authorizationCode, state, this.codeVerifier, this.port, !isAutomaticFlow, // Pass isManual=true if it's NOT automatic flow
                            options === null || options === void 0 ? void 0 : options.expiresIn)
                            // Fetch profile info (subscription type and rate limit tier) for the
                            // returned OAuthTokens. Logout and account storage are handled by the
                            // caller (installOAuthTokens in auth.ts).
                        ];
                    case 4:
                        tokenResponse = _g.sent();
                        return [4 /*yield*/, client.fetchProfileInfo(tokenResponse.access_token)
                            // Handle success redirect for automatic flow
                        ];
                    case 5:
                        profileInfo = _g.sent();
                        // Handle success redirect for automatic flow
                        if (isAutomaticFlow) {
                            scopes = client.parseScopes(tokenResponse.scope);
                            (_d = this.authCodeListener) === null || _d === void 0 ? void 0 : _d.handleSuccessRedirect(scopes);
                        }
                        return [2 /*return*/, this.formatTokens(tokenResponse, profileInfo.subscriptionType, profileInfo.rateLimitTier, profileInfo.rawProfile)];
                    case 6:
                        error_1 = _g.sent();
                        // If we have a pending response, send an error redirect before closing
                        if (isAutomaticFlow) {
                            (_e = this.authCodeListener) === null || _e === void 0 ? void 0 : _e.handleErrorRedirect();
                        }
                        throw error_1;
                    case 7:
                        // Always cleanup
                        (_f = this.authCodeListener) === null || _f === void 0 ? void 0 : _f.close();
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    OAuthService.prototype.waitForAuthorizationCode = function (state, onReady) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var _a;
                        // Set up manual auth code resolver
                        _this.manualAuthCodeResolver = resolve;
                        // Start automatic flow
                        (_a = _this.authCodeListener) === null || _a === void 0 ? void 0 : _a.waitForAuthorization(state, onReady).then(function (authorizationCode) {
                            _this.manualAuthCodeResolver = null;
                            resolve(authorizationCode);
                        }).catch(function (error) {
                            _this.manualAuthCodeResolver = null;
                            reject(error);
                        });
                    })];
            });
        });
    };
    // Handle manual flow callback when user pastes the auth code
    OAuthService.prototype.handleManualAuthCodeInput = function (params) {
        var _a;
        if (this.manualAuthCodeResolver) {
            this.manualAuthCodeResolver(params.authorizationCode);
            this.manualAuthCodeResolver = null;
            // Close the auth code listener since manual input was used
            (_a = this.authCodeListener) === null || _a === void 0 ? void 0 : _a.close();
        }
    };
    OAuthService.prototype.formatTokens = function (response, subscriptionType, rateLimitTier, profile) {
        var _a;
        return {
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
            expiresAt: Date.now() + response.expires_in * 1000,
            scopes: client.parseScopes(response.scope),
            subscriptionType: subscriptionType,
            rateLimitTier: rateLimitTier,
            profile: profile,
            tokenAccount: response.account
                ? {
                    uuid: response.account.uuid,
                    emailAddress: response.account.email_address,
                    organizationUuid: (_a = response.organization) === null || _a === void 0 ? void 0 : _a.uuid,
                }
                : undefined,
        };
    };
    // Clean up any resources (like the local server)
    OAuthService.prototype.cleanup = function () {
        var _a;
        (_a = this.authCodeListener) === null || _a === void 0 ? void 0 : _a.close();
        this.manualAuthCodeResolver = null;
    };
    return OAuthService;
}());
exports.OAuthService = OAuthService;
