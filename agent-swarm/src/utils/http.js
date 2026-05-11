"use strict";
/**
 * HTTP utility constants and helpers
 */
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
exports.getUserAgent = getUserAgent;
exports.getMCPUserAgent = getMCPUserAgent;
exports.getWebFetchUserAgent = getWebFetchUserAgent;
exports.getAuthHeaders = getAuthHeaders;
exports.withOAuth401Retry = withOAuth401Retry;
var axios_1 = require("axios");
var oauth_js_1 = require("../constants/oauth.js");
var auth_js_1 = require("./auth.js");
var userAgent_js_1 = require("./userAgent.js");
var workloadContext_js_1 = require("./workloadContext.js");
// WARNING: We rely on `claude-cli` in the user agent for log filtering.
// Please do NOT change this without making sure that logging also gets updated!
function getUserAgent() {
    var _a;
    var agentSdkVersion = process.env.CLAUDE_AGENT_SDK_VERSION
        ? ", agent-sdk/".concat(process.env.CLAUDE_AGENT_SDK_VERSION)
        : '';
    // SDK consumers can identify their app/library via CLAUDE_AGENT_SDK_CLIENT_APP
    // e.g., "my-app/1.0.0" or "my-library/2.1"
    var clientApp = process.env.CLAUDE_AGENT_SDK_CLIENT_APP
        ? ", client-app/".concat(process.env.CLAUDE_AGENT_SDK_CLIENT_APP)
        : '';
    // Turn-/process-scoped workload tag for cron-initiated requests. 1P-only
    // observability — proxies strip HTTP headers; QoS routing uses cc_workload
    // in the billing-header attribution block instead (see constants/system.ts).
    // getAnthropicClient (client.ts:98) calls this per-request inside withRetry,
    // so the read picks up the same setWorkload() value as getAttributionHeader.
    var workload = (0, workloadContext_js_1.getWorkload)();
    var workloadSuffix = workload ? ", workload/".concat(workload) : '';
    return "claude-cli/".concat(MACRO.VERSION, " (").concat(process.env.USER_TYPE, ", ").concat((_a = process.env.CLAUDE_CODE_ENTRYPOINT) !== null && _a !== void 0 ? _a : 'cli').concat(agentSdkVersion).concat(clientApp).concat(workloadSuffix, ")");
}
function getMCPUserAgent() {
    var parts = [];
    if (process.env.CLAUDE_CODE_ENTRYPOINT) {
        parts.push(process.env.CLAUDE_CODE_ENTRYPOINT);
    }
    if (process.env.CLAUDE_AGENT_SDK_VERSION) {
        parts.push("agent-sdk/".concat(process.env.CLAUDE_AGENT_SDK_VERSION));
    }
    if (process.env.CLAUDE_AGENT_SDK_CLIENT_APP) {
        parts.push("client-app/".concat(process.env.CLAUDE_AGENT_SDK_CLIENT_APP));
    }
    var suffix = parts.length > 0 ? " (".concat(parts.join(', '), ")") : '';
    return "claude-code/".concat(MACRO.VERSION).concat(suffix);
}
// User-Agent for WebFetch requests to arbitrary sites. `Claude-User` is
// Anthropic's publicly documented agent for user-initiated fetches (what site
// operators match in robots.txt); the claude-code suffix lets them distinguish
// local CLI traffic from claude.ai server-side fetches.
function getWebFetchUserAgent() {
    return "Claude-User (".concat((0, userAgent_js_1.getClaudeCodeUserAgent)(), "; +https://support.anthropic.com/)");
}
/**
 * Get authentication headers for API requests
 * Returns either OAuth headers for Max/Pro users or API key headers for regular users
 */
function getAuthHeaders() {
    if ((0, auth_js_1.isClaudeAISubscriber)()) {
        var oauthTokens = (0, auth_js_1.getClaudeAIOAuthTokens)();
        if (!(oauthTokens === null || oauthTokens === void 0 ? void 0 : oauthTokens.accessToken)) {
            return {
                headers: {},
                error: 'No OAuth token available',
            };
        }
        return {
            headers: {
                Authorization: "Bearer ".concat(oauthTokens.accessToken),
                'anthropic-beta': oauth_js_1.OAUTH_BETA_HEADER,
            },
        };
    }
    // TODO: this will fail if the API key is being set to an LLM Gateway key
    // should we try to query keychain / credentials for a valid Anthropic key?
    var apiKey = (0, auth_js_1.getAnthropicApiKey)();
    if (!apiKey) {
        return {
            headers: {},
            error: 'No API key available',
        };
    }
    return {
        headers: {
            'x-api-key': apiKey,
        },
    };
}
/**
 * Wrapper that handles OAuth 401 errors by force-refreshing the token and
 * retrying once. Addresses clock drift scenarios where the local expiration
 * check disagrees with the server.
 *
 * The request closure is called again on retry, so it should re-read auth
 * (e.g., via getAuthHeaders()) to pick up the refreshed token.
 *
 * Note: bridgeApi.ts has its own DI-injected version — handleOAuth401Error
 * transitively pulls in config.ts (~1300 modules), which breaks the SDK bundle.
 *
 * @param opts.also403Revoked - Also retry on 403 with "OAuth token has been
 *   revoked" body (some endpoints signal revocation this way instead of 401).
 */
function withOAuth401Retry(request, opts) {
    return __awaiter(this, void 0, void 0, function () {
        var err_1, status_1, isAuthError, failedAccessToken;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 2, , 5]);
                    return [4 /*yield*/, request()];
                case 1: return [2 /*return*/, _d.sent()];
                case 2:
                    err_1 = _d.sent();
                    if (!axios_1.default.isAxiosError(err_1))
                        throw err_1;
                    status_1 = (_a = err_1.response) === null || _a === void 0 ? void 0 : _a.status;
                    isAuthError = status_1 === 401 ||
                        ((opts === null || opts === void 0 ? void 0 : opts.also403Revoked) &&
                            status_1 === 403 &&
                            typeof ((_b = err_1.response) === null || _b === void 0 ? void 0 : _b.data) === 'string' &&
                            err_1.response.data.includes('OAuth token has been revoked'));
                    if (!isAuthError)
                        throw err_1;
                    failedAccessToken = (_c = (0, auth_js_1.getClaudeAIOAuthTokens)()) === null || _c === void 0 ? void 0 : _c.accessToken;
                    if (!failedAccessToken)
                        throw err_1;
                    return [4 /*yield*/, (0, auth_js_1.handleOAuth401Error)(failedAccessToken)];
                case 3:
                    _d.sent();
                    return [4 /*yield*/, request()];
                case 4: return [2 /*return*/, _d.sent()];
                case 5: return [2 /*return*/];
            }
        });
    });
}
