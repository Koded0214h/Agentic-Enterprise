"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTelemetryAttributes = getTelemetryAttributes;
var state_js_1 = require("src/bootstrap/state.js");
var auth_js_1 = require("./auth.js");
var config_js_1 = require("./config.js");
var envDynamic_js_1 = require("./envDynamic.js");
var envUtils_js_1 = require("./envUtils.js");
var taggedId_js_1 = require("./taggedId.js");
// Default configuration for metrics cardinality
var METRICS_CARDINALITY_DEFAULTS = {
    OTEL_METRICS_INCLUDE_SESSION_ID: true,
    OTEL_METRICS_INCLUDE_VERSION: false,
    OTEL_METRICS_INCLUDE_ACCOUNT_UUID: true,
};
function shouldIncludeAttribute(envVar) {
    var defaultValue = METRICS_CARDINALITY_DEFAULTS[envVar];
    var envValue = process.env[envVar];
    if (envValue === undefined) {
        return defaultValue;
    }
    return (0, envUtils_js_1.isEnvTruthy)(envValue);
}
function getTelemetryAttributes() {
    var userId = (0, config_js_1.getOrCreateUserID)();
    var sessionId = (0, state_js_1.getSessionId)();
    var attributes = {
        'user.id': userId,
    };
    if (shouldIncludeAttribute('OTEL_METRICS_INCLUDE_SESSION_ID')) {
        attributes['session.id'] = sessionId;
    }
    if (shouldIncludeAttribute('OTEL_METRICS_INCLUDE_VERSION')) {
        attributes['app.version'] = MACRO.VERSION;
    }
    // Only include OAuth account data when actively using OAuth authentication
    var oauthAccount = (0, auth_js_1.getOauthAccountInfo)();
    if (oauthAccount) {
        var orgId = oauthAccount.organizationUuid;
        var email = oauthAccount.emailAddress;
        var accountUuid = oauthAccount.accountUuid;
        if (orgId)
            attributes['organization.id'] = orgId;
        if (email)
            attributes['user.email'] = email;
        if (accountUuid &&
            shouldIncludeAttribute('OTEL_METRICS_INCLUDE_ACCOUNT_UUID')) {
            attributes['user.account_uuid'] = accountUuid;
            attributes['user.account_id'] =
                process.env.CLAUDE_CODE_ACCOUNT_TAGGED_ID ||
                    (0, taggedId_js_1.toTaggedId)('user', accountUuid);
        }
    }
    // Add terminal type if available
    if (envDynamic_js_1.envDynamic.terminal) {
        attributes['terminal.type'] = envDynamic_js_1.envDynamic.terminal;
    }
    return attributes;
}
