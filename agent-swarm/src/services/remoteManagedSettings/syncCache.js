"use strict";
/**
 * Eligibility check for remote managed settings.
 *
 * The cache state itself lives in syncCacheState.ts (a leaf, no auth import).
 * This file keeps isRemoteManagedSettingsEligible — the one function that
 * needs auth.ts — plus resetSyncCache wrapped to clear the local eligibility
 * mirror alongside the leaf's state.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetSyncCache = resetSyncCache;
exports.isRemoteManagedSettingsEligible = isRemoteManagedSettingsEligible;
var oauth_js_1 = require("../../constants/oauth.js");
var auth_js_1 = require("../../utils/auth.js");
var providers_js_1 = require("../../utils/model/providers.js");
var syncCacheState_js_1 = require("./syncCacheState.js");
var cached;
function resetSyncCache() {
    cached = undefined;
    (0, syncCacheState_js_1.resetSyncCache)();
}
/**
 * Check if the current user is eligible for remote managed settings
 *
 * Eligibility:
 * - Console users (API key): All eligible (must have actual key, not just apiKeyHelper)
 * - OAuth users with known subscriptionType: Only Enterprise/C4E and Team
 * - OAuth users with subscriptionType === null (externally-injected tokens via
 *   CLAUDE_CODE_OAUTH_TOKEN / FD, or keychain tokens missing metadata): Eligible —
 *   the API returns empty settings for ineligible orgs, so the cost of a false
 *   positive is one round-trip
 *
 * This is a pre-check to determine if we should query the API.
 * The API will return empty settings for users without managed settings.
 *
 * IMPORTANT: This function must NOT call getSettings() or any function that calls
 * getSettings() to avoid circular dependencies during settings loading.
 */
function isRemoteManagedSettingsEligible() {
    var _a;
    if (cached !== undefined)
        return cached;
    // 3p provider users should not hit the settings endpoint
    if ((0, providers_js_1.getAPIProvider)() !== 'firstParty') {
        return (cached = (0, syncCacheState_js_1.setEligibility)(false));
    }
    // Custom base URL users should not hit the settings endpoint
    if (!(0, providers_js_1.isFirstPartyAnthropicBaseUrl)()) {
        return (cached = (0, syncCacheState_js_1.setEligibility)(false));
    }
    // Cowork runs in a VM with its own permission model; server-managed settings
    // (designed for CLI/CCD) don't apply there, and per-surface settings don't
    // exist yet. MDM/file-based managed settings still apply via settings.ts —
    // those require physical deployment and a different IT intent.
    if (process.env.CLAUDE_CODE_ENTRYPOINT === 'local-agent') {
        return (cached = (0, syncCacheState_js_1.setEligibility)(false));
    }
    // Check OAuth first: most Claude.ai users have no API key in the keychain.
    // The API key check spawns `security find-generic-password` (~20-50ms) which
    // returns null for OAuth-only users. Checking OAuth first short-circuits
    // that subprocess for the common case.
    var tokens = (0, auth_js_1.getClaudeAIOAuthTokens)();
    // Externally-injected tokens (CCD via CLAUDE_CODE_OAUTH_TOKEN, CCR via
    // CLAUDE_CODE_OAUTH_TOKEN_FILE_DESCRIPTOR, Agent SDK, CI) carry no
    // subscriptionType metadata — getClaudeAIOAuthTokens() constructs them with
    // subscriptionType: null. The token itself is valid; let the API decide.
    // fetchRemoteManagedSettings handles 204/404 gracefully (returns {}), and
    // settings.ts falls through to MDM/file when remote is empty, so ineligible
    // orgs pay one round-trip and nothing else changes.
    if ((tokens === null || tokens === void 0 ? void 0 : tokens.accessToken) && tokens.subscriptionType === null) {
        return (cached = (0, syncCacheState_js_1.setEligibility)(true));
    }
    if ((tokens === null || tokens === void 0 ? void 0 : tokens.accessToken) &&
        ((_a = tokens.scopes) === null || _a === void 0 ? void 0 : _a.includes(oauth_js_1.CLAUDE_AI_INFERENCE_SCOPE)) &&
        (tokens.subscriptionType === 'enterprise' ||
            tokens.subscriptionType === 'team')) {
        return (cached = (0, syncCacheState_js_1.setEligibility)(true));
    }
    // Console users (API key) are eligible if we can get the actual key
    // Skip apiKeyHelper to avoid circular dependency with getSettings()
    // Wrap in try-catch because getAnthropicApiKeyWithSource throws in CI/test environments
    // when no API key is available
    try {
        var apiKey = (0, auth_js_1.getAnthropicApiKeyWithSource)({
            skipRetrievingKeyFromApiKeyHelper: true,
        }).key;
        if (apiKey) {
            return (cached = (0, syncCacheState_js_1.setEligibility)(true));
        }
    }
    catch (_b) {
        // No API key available (e.g., CI/test environment)
    }
    return (cached = (0, syncCacheState_js_1.setEligibility)(false));
}
