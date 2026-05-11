"use strict";
/**
 * Shared bridge auth/URL resolution. Consolidates the ant-only
 * CLAUDE_BRIDGE_* dev overrides that were previously copy-pasted across
 * a dozen files — inboundAttachments, BriefTool/upload, bridgeMain,
 * initReplBridge, remoteBridgeCore, daemon workers, /rename,
 * /remote-control.
 *
 * Two layers: *Override() returns the ant-only env var (or undefined);
 * the non-Override versions fall through to the real OAuth store/config.
 * Callers that compose with a different auth source (e.g. daemon workers
 * using IPC auth) use the Override getters directly.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBridgeTokenOverride = getBridgeTokenOverride;
exports.getBridgeBaseUrlOverride = getBridgeBaseUrlOverride;
exports.getBridgeAccessToken = getBridgeAccessToken;
exports.getBridgeBaseUrl = getBridgeBaseUrl;
var oauth_js_1 = require("../constants/oauth.js");
var auth_js_1 = require("../utils/auth.js");
/** Ant-only dev override: CLAUDE_BRIDGE_OAUTH_TOKEN, else undefined. */
function getBridgeTokenOverride() {
    return ((process.env.USER_TYPE === 'ant' &&
        process.env.CLAUDE_BRIDGE_OAUTH_TOKEN) ||
        undefined);
}
/** Ant-only dev override: CLAUDE_BRIDGE_BASE_URL, else undefined. */
function getBridgeBaseUrlOverride() {
    return ((process.env.USER_TYPE === 'ant' && process.env.CLAUDE_BRIDGE_BASE_URL) ||
        undefined);
}
/**
 * Access token for bridge API calls: dev override first, then the OAuth
 * keychain. Undefined means "not logged in".
 */
function getBridgeAccessToken() {
    var _a, _b;
    return (_a = getBridgeTokenOverride()) !== null && _a !== void 0 ? _a : (_b = (0, auth_js_1.getClaudeAIOAuthTokens)()) === null || _b === void 0 ? void 0 : _b.accessToken;
}
/**
 * Base URL for bridge API calls: dev override first, then the production
 * OAuth config. Always returns a URL.
 */
function getBridgeBaseUrl() {
    var _a;
    return (_a = getBridgeBaseUrlOverride()) !== null && _a !== void 0 ? _a : (0, oauth_js_1.getOauthConfig)().BASE_API_URL;
}
