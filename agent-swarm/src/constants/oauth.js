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
exports.MCP_CLIENT_METADATA_URL = exports.ALL_OAUTH_SCOPES = exports.CLAUDE_AI_OAUTH_SCOPES = exports.CONSOLE_OAUTH_SCOPES = exports.OAUTH_BETA_HEADER = exports.CLAUDE_AI_PROFILE_SCOPE = exports.CLAUDE_AI_INFERENCE_SCOPE = void 0;
exports.fileSuffixForOauthConfig = fileSuffixForOauthConfig;
exports.getOauthConfig = getOauthConfig;
var envUtils_js_1 = require("src/utils/envUtils.js");
function getOauthConfigType() {
    if (process.env.USER_TYPE === 'ant') {
        if ((0, envUtils_js_1.isEnvTruthy)(process.env.USE_LOCAL_OAUTH)) {
            return 'local';
        }
        if ((0, envUtils_js_1.isEnvTruthy)(process.env.USE_STAGING_OAUTH)) {
            return 'staging';
        }
    }
    return 'prod';
}
function fileSuffixForOauthConfig() {
    if (process.env.CLAUDE_CODE_CUSTOM_OAUTH_URL) {
        return '-custom-oauth';
    }
    switch (getOauthConfigType()) {
        case 'local':
            return '-local-oauth';
        case 'staging':
            return '-staging-oauth';
        case 'prod':
            // No suffix for production config
            return '';
    }
}
exports.CLAUDE_AI_INFERENCE_SCOPE = 'user:inference';
exports.CLAUDE_AI_PROFILE_SCOPE = 'user:profile';
var CONSOLE_SCOPE = 'org:create_api_key';
exports.OAUTH_BETA_HEADER = 'oauth-2025-04-20';
// Console OAuth scopes - for API key creation via Console
exports.CONSOLE_OAUTH_SCOPES = [
    CONSOLE_SCOPE,
    exports.CLAUDE_AI_PROFILE_SCOPE,
];
// Claude.ai OAuth scopes - for Claude.ai subscribers (Pro/Max/Team/Enterprise)
exports.CLAUDE_AI_OAUTH_SCOPES = [
    exports.CLAUDE_AI_PROFILE_SCOPE,
    exports.CLAUDE_AI_INFERENCE_SCOPE,
    'user:sessions:claude_code',
    'user:mcp_servers',
    'user:file_upload',
];
// All OAuth scopes - union of all scopes used in Claude CLI
// When logging in, request all scopes in order to handle both Console -> Claude.ai redirect
// Ensure that `OAuthConsentPage` in apps repo is kept in sync with this list.
exports.ALL_OAUTH_SCOPES = Array.from(new Set(__spreadArray(__spreadArray([], exports.CONSOLE_OAUTH_SCOPES, true), exports.CLAUDE_AI_OAUTH_SCOPES, true)));
// Production OAuth configuration - Used in normal operation
var PROD_OAUTH_CONFIG = {
    BASE_API_URL: 'https://api.anthropic.com',
    CONSOLE_AUTHORIZE_URL: 'https://platform.claude.com/oauth/authorize',
    // Bounces through claude.com/cai/* so CLI sign-ins connect to claude.com
    // visits for attribution. 307s to claude.ai/oauth/authorize in two hops.
    CLAUDE_AI_AUTHORIZE_URL: 'https://claude.com/cai/oauth/authorize',
    CLAUDE_AI_ORIGIN: 'https://claude.ai',
    TOKEN_URL: 'https://platform.claude.com/v1/oauth/token',
    API_KEY_URL: 'https://api.anthropic.com/api/oauth/claude_cli/create_api_key',
    ROLES_URL: 'https://api.anthropic.com/api/oauth/claude_cli/roles',
    CONSOLE_SUCCESS_URL: 'https://platform.claude.com/buy_credits?returnUrl=/oauth/code/success%3Fapp%3Dclaude-code',
    CLAUDEAI_SUCCESS_URL: 'https://platform.claude.com/oauth/code/success?app=claude-code',
    MANUAL_REDIRECT_URL: 'https://platform.claude.com/oauth/code/callback',
    CLIENT_ID: '9d1c250a-e61b-44d9-88ed-5944d1962f5e',
    // No suffix for production config
    OAUTH_FILE_SUFFIX: '',
    MCP_PROXY_URL: 'https://mcp-proxy.anthropic.com',
    MCP_PROXY_PATH: '/v1/mcp/{server_id}',
};
/**
 * Client ID Metadata Document URL for MCP OAuth (CIMD / SEP-991).
 * When an MCP auth server advertises client_id_metadata_document_supported: true,
 * Claude Code uses this URL as its client_id instead of Dynamic Client Registration.
 * The URL must point to a JSON document hosted by Anthropic.
 * See: https://datatracker.ietf.org/doc/html/draft-ietf-oauth-client-id-metadata-document-00
 */
exports.MCP_CLIENT_METADATA_URL = 'https://claude.ai/oauth/claude-code-client-metadata';
// Staging OAuth configuration - only included in ant builds with staging flag
// Uses literal check for dead code elimination
var STAGING_OAUTH_CONFIG = process.env.USER_TYPE === 'ant'
    ? {
        BASE_API_URL: 'https://api-staging.anthropic.com',
        CONSOLE_AUTHORIZE_URL: 'https://platform.staging.ant.dev/oauth/authorize',
        CLAUDE_AI_AUTHORIZE_URL: 'https://claude-ai.staging.ant.dev/oauth/authorize',
        CLAUDE_AI_ORIGIN: 'https://claude-ai.staging.ant.dev',
        TOKEN_URL: 'https://platform.staging.ant.dev/v1/oauth/token',
        API_KEY_URL: 'https://api-staging.anthropic.com/api/oauth/claude_cli/create_api_key',
        ROLES_URL: 'https://api-staging.anthropic.com/api/oauth/claude_cli/roles',
        CONSOLE_SUCCESS_URL: 'https://platform.staging.ant.dev/buy_credits?returnUrl=/oauth/code/success%3Fapp%3Dclaude-code',
        CLAUDEAI_SUCCESS_URL: 'https://platform.staging.ant.dev/oauth/code/success?app=claude-code',
        MANUAL_REDIRECT_URL: 'https://platform.staging.ant.dev/oauth/code/callback',
        CLIENT_ID: '22422756-60c9-4084-8eb7-27705fd5cf9a',
        OAUTH_FILE_SUFFIX: '-staging-oauth',
        MCP_PROXY_URL: 'https://mcp-proxy-staging.anthropic.com',
        MCP_PROXY_PATH: '/v1/mcp/{server_id}',
    }
    : undefined;
// Three local dev servers: :8000 api-proxy (`api dev start -g ccr`),
// :4000 claude-ai frontend, :3000 Console frontend. Env vars let
// scripts/claude-localhost override if your layout differs.
function getLocalOauthConfig() {
    var _a, _b, _c, _d, _e, _f;
    var api = (_b = (_a = process.env.CLAUDE_LOCAL_OAUTH_API_BASE) === null || _a === void 0 ? void 0 : _a.replace(/\/$/, '')) !== null && _b !== void 0 ? _b : 'http://localhost:8000';
    var apps = (_d = (_c = process.env.CLAUDE_LOCAL_OAUTH_APPS_BASE) === null || _c === void 0 ? void 0 : _c.replace(/\/$/, '')) !== null && _d !== void 0 ? _d : 'http://localhost:4000';
    var consoleBase = (_f = (_e = process.env.CLAUDE_LOCAL_OAUTH_CONSOLE_BASE) === null || _e === void 0 ? void 0 : _e.replace(/\/$/, '')) !== null && _f !== void 0 ? _f : 'http://localhost:3000';
    return {
        BASE_API_URL: api,
        CONSOLE_AUTHORIZE_URL: "".concat(consoleBase, "/oauth/authorize"),
        CLAUDE_AI_AUTHORIZE_URL: "".concat(apps, "/oauth/authorize"),
        CLAUDE_AI_ORIGIN: apps,
        TOKEN_URL: "".concat(api, "/v1/oauth/token"),
        API_KEY_URL: "".concat(api, "/api/oauth/claude_cli/create_api_key"),
        ROLES_URL: "".concat(api, "/api/oauth/claude_cli/roles"),
        CONSOLE_SUCCESS_URL: "".concat(consoleBase, "/buy_credits?returnUrl=/oauth/code/success%3Fapp%3Dclaude-code"),
        CLAUDEAI_SUCCESS_URL: "".concat(consoleBase, "/oauth/code/success?app=claude-code"),
        MANUAL_REDIRECT_URL: "".concat(consoleBase, "/oauth/code/callback"),
        CLIENT_ID: '22422756-60c9-4084-8eb7-27705fd5cf9a',
        OAUTH_FILE_SUFFIX: '-local-oauth',
        MCP_PROXY_URL: 'http://localhost:8205',
        MCP_PROXY_PATH: '/v1/toolbox/shttp/mcp/{server_id}',
    };
}
// Allowed base URLs for CLAUDE_CODE_CUSTOM_OAUTH_URL override.
// Only FedStart/PubSec deployments are permitted to prevent OAuth tokens
// from being sent to arbitrary endpoints.
var ALLOWED_OAUTH_BASE_URLS = [
    'https://beacon.claude-ai.staging.ant.dev',
    'https://claude.fedstart.com',
    'https://claude-staging.fedstart.com',
];
// Default to prod config, override with test/staging if enabled
function getOauthConfig() {
    var config = (function () {
        switch (getOauthConfigType()) {
            case 'local':
                return getLocalOauthConfig();
            case 'staging':
                return STAGING_OAUTH_CONFIG !== null && STAGING_OAUTH_CONFIG !== void 0 ? STAGING_OAUTH_CONFIG : PROD_OAUTH_CONFIG;
            case 'prod':
                return PROD_OAUTH_CONFIG;
        }
    })();
    // Allow overriding all OAuth URLs to point to an approved FedStart deployment.
    // Only allowlisted base URLs are accepted to prevent credential leakage.
    var oauthBaseUrl = process.env.CLAUDE_CODE_CUSTOM_OAUTH_URL;
    if (oauthBaseUrl) {
        var base = oauthBaseUrl.replace(/\/$/, '');
        if (!ALLOWED_OAUTH_BASE_URLS.includes(base)) {
            throw new Error('CLAUDE_CODE_CUSTOM_OAUTH_URL is not an approved endpoint.');
        }
        config = __assign(__assign({}, config), { BASE_API_URL: base, CONSOLE_AUTHORIZE_URL: "".concat(base, "/oauth/authorize"), CLAUDE_AI_AUTHORIZE_URL: "".concat(base, "/oauth/authorize"), CLAUDE_AI_ORIGIN: base, TOKEN_URL: "".concat(base, "/v1/oauth/token"), API_KEY_URL: "".concat(base, "/api/oauth/claude_cli/create_api_key"), ROLES_URL: "".concat(base, "/api/oauth/claude_cli/roles"), CONSOLE_SUCCESS_URL: "".concat(base, "/oauth/code/success?app=claude-code"), CLAUDEAI_SUCCESS_URL: "".concat(base, "/oauth/code/success?app=claude-code"), MANUAL_REDIRECT_URL: "".concat(base, "/oauth/code/callback"), OAUTH_FILE_SUFFIX: '-custom-oauth' });
    }
    // Allow CLIENT_ID override via environment variable (e.g., for Xcode integration)
    var clientIdOverride = process.env.CLAUDE_CODE_OAUTH_CLIENT_ID;
    if (clientIdOverride) {
        config = __assign(__assign({}, config), { CLIENT_ID: clientIdOverride });
    }
    return config;
}
