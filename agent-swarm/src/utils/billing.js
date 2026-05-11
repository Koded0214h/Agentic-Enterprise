"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasConsoleBillingAccess = hasConsoleBillingAccess;
exports.setMockBillingAccessOverride = setMockBillingAccessOverride;
exports.hasClaudeAiBillingAccess = hasClaudeAiBillingAccess;
var auth_js_1 = require("./auth.js");
var config_js_1 = require("./config.js");
var envUtils_js_1 = require("./envUtils.js");
function hasConsoleBillingAccess() {
    var _a, _b;
    // Check if cost reporting is disabled via environment variable
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.DISABLE_COST_WARNINGS)) {
        return false;
    }
    var isSubscriber = (0, auth_js_1.isClaudeAISubscriber)();
    // This might be wrong if user is signed into Max but also using an API key, but
    // we already show a warning on launch in that case
    if (isSubscriber)
        return false;
    // Check if user has any form of authentication
    var authSource = (0, auth_js_1.getAuthTokenSource)();
    var hasApiKey = (0, auth_js_1.getAnthropicApiKey)() !== null;
    // If user has no authentication at all (logged out), don't show costs
    if (!authSource.hasToken && !hasApiKey) {
        return false;
    }
    var config = (0, config_js_1.getGlobalConfig)();
    var orgRole = (_a = config.oauthAccount) === null || _a === void 0 ? void 0 : _a.organizationRole;
    var workspaceRole = (_b = config.oauthAccount) === null || _b === void 0 ? void 0 : _b.workspaceRole;
    if (!orgRole || !workspaceRole) {
        return false; // hide cost for grandfathered users who have not re-authed since we've added roles
    }
    // Users have billing access if they are admins or billing roles at either workspace or organization level
    return (['admin', 'billing'].includes(orgRole) ||
        ['workspace_admin', 'workspace_billing'].includes(workspaceRole));
}
// Mock billing access for /mock-limits testing (set by mockRateLimits.ts)
var mockBillingAccessOverride = null;
function setMockBillingAccessOverride(value) {
    mockBillingAccessOverride = value;
}
function hasClaudeAiBillingAccess() {
    var _a;
    // Check for mock billing access first (for /mock-limits testing)
    if (mockBillingAccessOverride !== null) {
        return mockBillingAccessOverride;
    }
    if (!(0, auth_js_1.isClaudeAISubscriber)()) {
        return false;
    }
    var subscriptionType = (0, auth_js_1.getSubscriptionType)();
    // Consumer plans (Max/Pro) - individual users always have billing access
    if (subscriptionType === 'max' || subscriptionType === 'pro') {
        return true;
    }
    // Team/Enterprise - check for admin or billing roles
    var config = (0, config_js_1.getGlobalConfig)();
    var orgRole = (_a = config.oauthAccount) === null || _a === void 0 ? void 0 : _a.organizationRole;
    return (!!orgRole &&
        ['admin', 'billing', 'owner', 'primary_owner'].includes(orgRole));
}
