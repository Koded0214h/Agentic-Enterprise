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
exports.fetchClaudeAIMcpConfigsIfEligible = void 0;
exports.clearClaudeAIMcpConfigsCache = clearClaudeAIMcpConfigsCache;
exports.markClaudeAiMcpConnected = markClaudeAiMcpConnected;
exports.hasClaudeAiMcpEverConnected = hasClaudeAiMcpEverConnected;
var axios_1 = require("axios");
var memoize_js_1 = require("lodash-es/memoize.js");
var oauth_js_1 = require("src/constants/oauth.js");
var index_js_1 = require("src/services/analytics/index.js");
var auth_js_1 = require("src/utils/auth.js");
var config_js_1 = require("src/utils/config.js");
var debug_js_1 = require("src/utils/debug.js");
var envUtils_js_1 = require("src/utils/envUtils.js");
var client_js_1 = require("./client.js");
var normalization_js_1 = require("./normalization.js");
var FETCH_TIMEOUT_MS = 5000;
var MCP_SERVERS_BETA_HEADER = 'mcp-servers-2025-12-04';
/**
 * Fetches MCP server configurations from Claude.ai org configs.
 * These servers are managed by the organization via Claude.ai.
 *
 * Results are memoized for the session lifetime (fetch once per CLI session).
 */
exports.fetchClaudeAIMcpConfigsIfEligible = (0, memoize_js_1.default)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var tokens, baseUrl, url, response, configs, usedNormalizedNames, _i, _a, server, baseName, finalName, finalNormalized, count, _b;
    var _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 2, , 3]);
                if ((0, envUtils_js_1.isEnvDefinedFalsy)(process.env.ENABLE_CLAUDEAI_MCP_SERVERS)) {
                    (0, debug_js_1.logForDebugging)('[claudeai-mcp] Disabled via env var');
                    (0, index_js_1.logEvent)('tengu_claudeai_mcp_eligibility', {
                        state: 'disabled_env_var',
                    });
                    return [2 /*return*/, {}];
                }
                tokens = (0, auth_js_1.getClaudeAIOAuthTokens)();
                if (!(tokens === null || tokens === void 0 ? void 0 : tokens.accessToken)) {
                    (0, debug_js_1.logForDebugging)('[claudeai-mcp] No access token');
                    (0, index_js_1.logEvent)('tengu_claudeai_mcp_eligibility', {
                        state: 'no_oauth_token',
                    });
                    return [2 /*return*/, {}];
                }
                // Check for user:mcp_servers scope directly instead of isClaudeAISubscriber().
                // In non-interactive mode, isClaudeAISubscriber() returns false when ANTHROPIC_API_KEY
                // is set (even with valid OAuth tokens) because preferThirdPartyAuthentication() causes
                // isAnthropicAuthEnabled() to return false. Checking the scope directly allows users
                // with both API keys and OAuth tokens to access claude.ai MCPs in print mode.
                if (!((_c = tokens.scopes) === null || _c === void 0 ? void 0 : _c.includes('user:mcp_servers'))) {
                    (0, debug_js_1.logForDebugging)("[claudeai-mcp] Missing user:mcp_servers scope (scopes=".concat(((_d = tokens.scopes) === null || _d === void 0 ? void 0 : _d.join(',')) || 'none', ")"));
                    (0, index_js_1.logEvent)('tengu_claudeai_mcp_eligibility', {
                        state: 'missing_scope',
                    });
                    return [2 /*return*/, {}];
                }
                baseUrl = (0, oauth_js_1.getOauthConfig)().BASE_API_URL;
                url = "".concat(baseUrl, "/v1/mcp_servers?limit=1000");
                (0, debug_js_1.logForDebugging)("[claudeai-mcp] Fetching from ".concat(url));
                return [4 /*yield*/, axios_1.default.get(url, {
                        headers: {
                            Authorization: "Bearer ".concat(tokens.accessToken),
                            'Content-Type': 'application/json',
                            'anthropic-beta': MCP_SERVERS_BETA_HEADER,
                            'anthropic-version': '2023-06-01',
                        },
                        timeout: FETCH_TIMEOUT_MS,
                    })];
            case 1:
                response = _e.sent();
                configs = {};
                usedNormalizedNames = new Set();
                for (_i = 0, _a = response.data.data; _i < _a.length; _i++) {
                    server = _a[_i];
                    baseName = "claude.ai ".concat(server.display_name);
                    finalName = baseName;
                    finalNormalized = (0, normalization_js_1.normalizeNameForMCP)(finalName);
                    count = 1;
                    while (usedNormalizedNames.has(finalNormalized)) {
                        count++;
                        finalName = "".concat(baseName, " (").concat(count, ")");
                        finalNormalized = (0, normalization_js_1.normalizeNameForMCP)(finalName);
                    }
                    usedNormalizedNames.add(finalNormalized);
                    configs[finalName] = {
                        type: 'claudeai-proxy',
                        url: server.url,
                        id: server.id,
                        scope: 'claudeai',
                    };
                }
                (0, debug_js_1.logForDebugging)("[claudeai-mcp] Fetched ".concat(Object.keys(configs).length, " servers"));
                (0, index_js_1.logEvent)('tengu_claudeai_mcp_eligibility', {
                    state: 'eligible',
                });
                return [2 /*return*/, configs];
            case 2:
                _b = _e.sent();
                (0, debug_js_1.logForDebugging)("[claudeai-mcp] Fetch failed");
                return [2 /*return*/, {}];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * Clears the memoized cache for fetchClaudeAIMcpConfigsIfEligible.
 * Call this after login so the next fetch will use the new auth tokens.
 */
function clearClaudeAIMcpConfigsCache() {
    var _a, _b;
    (_b = (_a = exports.fetchClaudeAIMcpConfigsIfEligible.cache).clear) === null || _b === void 0 ? void 0 : _b.call(_a);
    // Also clear the auth cache so freshly-authorized servers get re-connected
    (0, client_js_1.clearMcpAuthCache)();
}
/**
 * Record that a claude.ai connector successfully connected. Idempotent.
 *
 * Gates the "N connectors unavailable/need auth" startup notifications: a
 * connector that was working yesterday and is now failed is a state change
 * worth surfacing; an org-configured connector that's been needs-auth since
 * it showed up is one the user has demonstrably ignored.
 */
function markClaudeAiMcpConnected(name) {
    (0, config_js_1.saveGlobalConfig)(function (current) {
        var _a;
        var seen = (_a = current.claudeAiMcpEverConnected) !== null && _a !== void 0 ? _a : [];
        if (seen.includes(name))
            return current;
        return __assign(__assign({}, current), { claudeAiMcpEverConnected: __spreadArray(__spreadArray([], seen, true), [name], false) });
    });
}
function hasClaudeAiMcpEverConnected(name) {
    var _a;
    return ((_a = (0, config_js_1.getGlobalConfig)().claudeAiMcpEverConnected) !== null && _a !== void 0 ? _a : []).includes(name);
}
