"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAPIProvider = getAPIProvider;
exports.getAPIProviderForStatsig = getAPIProviderForStatsig;
exports.isFirstPartyAnthropicBaseUrl = isFirstPartyAnthropicBaseUrl;
var envUtils_js_1 = require("../envUtils.js");
function getAPIProvider() {
    return (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_USE_BEDROCK)
        ? 'bedrock'
        : (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_USE_VERTEX)
            ? 'vertex'
            : (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_USE_FOUNDRY)
                ? 'foundry'
                : 'firstParty';
}
function getAPIProviderForStatsig() {
    return getAPIProvider();
}
/**
 * Check if ANTHROPIC_BASE_URL is a first-party Anthropic API URL.
 * Returns true if not set (default API) or points to api.anthropic.com
 * (or api-staging.anthropic.com for ant users).
 */
function isFirstPartyAnthropicBaseUrl() {
    var baseUrl = process.env.ANTHROPIC_BASE_URL;
    if (!baseUrl) {
        return true;
    }
    try {
        var host = new URL(baseUrl).host;
        var allowedHosts = ['api.anthropic.com'];
        if (process.env.USER_TYPE === 'ant') {
            allowedHosts.push('api-staging.anthropic.com');
        }
        return allowedHosts.includes(host);
    }
    catch (_a) {
        return false;
    }
}
