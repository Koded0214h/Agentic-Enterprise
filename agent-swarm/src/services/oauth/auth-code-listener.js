"use strict";
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
exports.AuthCodeListener = void 0;
var http_1 = require("http");
var index_js_1 = require("src/services/analytics/index.js");
var oauth_js_1 = require("../../constants/oauth.js");
var log_js_1 = require("../../utils/log.js");
var client_js_1 = require("./client.js");
/**
 * Temporary localhost HTTP server that listens for OAuth authorization code redirects.
 *
 * When the user authorizes in their browser, the OAuth provider redirects to:
 * http://localhost:[port]/callback?code=AUTH_CODE&state=STATE
 *
 * This server captures that redirect and extracts the auth code.
 * Note: This is NOT an OAuth server - it's just a redirect capture mechanism.
 */
var AuthCodeListener = /** @class */ (function () {
    function AuthCodeListener(callbackPath) {
        if (callbackPath === void 0) { callbackPath = '/callback'; }
        this.port = 0;
        this.promiseResolver = null;
        this.promiseRejecter = null;
        this.expectedState = null; // State parameter for CSRF protection
        this.pendingResponse = null; // Response object for final redirect
        this.localServer = (0, http_1.createServer)();
        this.callbackPath = callbackPath;
    }
    /**
     * Starts listening on an OS-assigned port and returns the port number.
     * This avoids race conditions by keeping the server open until it's used.
     * @param port Optional specific port to use. If not provided, uses OS-assigned port.
     */
    AuthCodeListener.prototype.start = function (port) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.localServer.once('error', function (err) {
                            reject(new Error("Failed to start OAuth callback server: ".concat(err.message)));
                        });
                        // Listen on specified port or 0 to let the OS assign an available port
                        _this.localServer.listen(port !== null && port !== void 0 ? port : 0, 'localhost', function () {
                            var address = _this.localServer.address();
                            _this.port = address.port;
                            resolve(_this.port);
                        });
                    })];
            });
        });
    };
    AuthCodeListener.prototype.getPort = function () {
        return this.port;
    };
    AuthCodeListener.prototype.hasPendingResponse = function () {
        return this.pendingResponse !== null;
    };
    AuthCodeListener.prototype.waitForAuthorization = function (state, onReady) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.promiseResolver = resolve;
                        _this.promiseRejecter = reject;
                        _this.expectedState = state;
                        _this.startLocalListener(onReady);
                    })];
            });
        });
    };
    /**
     * Completes the OAuth flow by redirecting the user's browser to a success page.
     * Different success pages are shown based on the granted scopes.
     * @param scopes The OAuth scopes that were granted
     * @param customHandler Optional custom handler to serve response instead of redirecting
     */
    AuthCodeListener.prototype.handleSuccessRedirect = function (scopes, customHandler) {
        if (!this.pendingResponse)
            return;
        // If custom handler provided, use it instead of default redirect
        if (customHandler) {
            customHandler(this.pendingResponse, scopes);
            this.pendingResponse = null;
            (0, index_js_1.logEvent)('tengu_oauth_automatic_redirect', { custom_handler: true });
            return;
        }
        // Default behavior: Choose success page based on granted permissions
        var successUrl = (0, client_js_1.shouldUseClaudeAIAuth)(scopes)
            ? (0, oauth_js_1.getOauthConfig)().CLAUDEAI_SUCCESS_URL
            : (0, oauth_js_1.getOauthConfig)().CONSOLE_SUCCESS_URL;
        // Send browser to success page
        this.pendingResponse.writeHead(302, { Location: successUrl });
        this.pendingResponse.end();
        this.pendingResponse = null;
        (0, index_js_1.logEvent)('tengu_oauth_automatic_redirect', {});
    };
    /**
     * Handles error case by sending a redirect to the appropriate success page with an error indicator,
     * ensuring the browser flow is completed properly.
     */
    AuthCodeListener.prototype.handleErrorRedirect = function () {
        if (!this.pendingResponse)
            return;
        // TODO: swap to a different url once we have an error page
        var errorUrl = (0, oauth_js_1.getOauthConfig)().CLAUDEAI_SUCCESS_URL;
        // Send browser to error page
        this.pendingResponse.writeHead(302, { Location: errorUrl });
        this.pendingResponse.end();
        this.pendingResponse = null;
        (0, index_js_1.logEvent)('tengu_oauth_automatic_redirect_error', {});
    };
    AuthCodeListener.prototype.startLocalListener = function (onReady) {
        // Server is already created and listening, just set up handlers
        this.localServer.on('request', this.handleRedirect.bind(this));
        this.localServer.on('error', this.handleError.bind(this));
        // Server is already listening, so we can call onReady immediately
        void onReady();
    };
    AuthCodeListener.prototype.handleRedirect = function (req, res) {
        var _a, _b;
        var parsedUrl = new URL(req.url || '', "http://".concat(req.headers.host || 'localhost'));
        if (parsedUrl.pathname !== this.callbackPath) {
            res.writeHead(404);
            res.end();
            return;
        }
        var authCode = (_a = parsedUrl.searchParams.get('code')) !== null && _a !== void 0 ? _a : undefined;
        var state = (_b = parsedUrl.searchParams.get('state')) !== null && _b !== void 0 ? _b : undefined;
        this.validateAndRespond(authCode, state, res);
    };
    AuthCodeListener.prototype.validateAndRespond = function (authCode, state, res) {
        if (!authCode) {
            res.writeHead(400);
            res.end('Authorization code not found');
            this.reject(new Error('No authorization code received'));
            return;
        }
        if (state !== this.expectedState) {
            res.writeHead(400);
            res.end('Invalid state parameter');
            this.reject(new Error('Invalid state parameter'));
            return;
        }
        // Store the response for later redirect
        this.pendingResponse = res;
        this.resolve(authCode);
    };
    AuthCodeListener.prototype.handleError = function (err) {
        (0, log_js_1.logError)(err);
        this.close();
        this.reject(err);
    };
    AuthCodeListener.prototype.resolve = function (authorizationCode) {
        if (this.promiseResolver) {
            this.promiseResolver(authorizationCode);
            this.promiseResolver = null;
            this.promiseRejecter = null;
        }
    };
    AuthCodeListener.prototype.reject = function (error) {
        if (this.promiseRejecter) {
            this.promiseRejecter(error);
            this.promiseResolver = null;
            this.promiseRejecter = null;
        }
    };
    AuthCodeListener.prototype.close = function () {
        // If we have a pending response, send a redirect before closing
        if (this.pendingResponse) {
            this.handleErrorRedirect();
        }
        if (this.localServer) {
            // Remove all listeners to prevent memory leaks
            this.localServer.removeAllListeners();
            this.localServer.close();
        }
    };
    return AuthCodeListener;
}());
exports.AuthCodeListener = AuthCodeListener;
