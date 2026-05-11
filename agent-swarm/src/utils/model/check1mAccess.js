"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkOpus1mAccess = checkOpus1mAccess;
exports.checkSonnet1mAccess = checkSonnet1mAccess;
var auth_js_1 = require("../auth.js");
var config_js_1 = require("../config.js");
var context_js_1 = require("../context.js");
/**
 * Check if extra usage is enabled based on the cached disabled reason.
 * Extra usage is considered enabled if there's no disabled reason,
 * or if the disabled reason indicates it's provisioned but temporarily unavailable.
 */
function isExtraUsageEnabled() {
    var reason = (0, config_js_1.getGlobalConfig)().cachedExtraUsageDisabledReason;
    // undefined = no cache yet, treat as not enabled (conservative)
    if (reason === undefined) {
        return false;
    }
    // null = no disabled reason from API, extra usage is enabled
    if (reason === null) {
        return true;
    }
    // Check which disabled reasons still mean "provisioned"
    switch (reason) {
        // Provisioned but credits depleted — still counts as enabled
        case 'out_of_credits':
            return true;
        // Not provisioned or actively disabled
        case 'overage_not_provisioned':
        case 'org_level_disabled':
        case 'org_level_disabled_until':
        case 'seat_tier_level_disabled':
        case 'member_level_disabled':
        case 'seat_tier_zero_credit_limit':
        case 'group_zero_credit_limit':
        case 'member_zero_credit_limit':
        case 'org_service_level_disabled':
        case 'org_service_zero_credit_limit':
        case 'no_limits_configured':
        case 'unknown':
            return false;
        default:
            return false;
    }
}
// @[MODEL LAUNCH]: Add check if the new model supports 1M context
function checkOpus1mAccess() {
    if ((0, context_js_1.is1mContextDisabled)()) {
        return false;
    }
    if ((0, auth_js_1.isClaudeAISubscriber)()) {
        // Subscribers have access if extra usage is enabled for their account
        return isExtraUsageEnabled();
    }
    // Non-subscribers (API/PAYG) have access
    return true;
}
function checkSonnet1mAccess() {
    if ((0, context_js_1.is1mContextDisabled)()) {
        return false;
    }
    if ((0, auth_js_1.isClaudeAISubscriber)()) {
        // Subscribers have access if extra usage is enabled for their account
        return isExtraUsageEnabled();
    }
    // Non-subscribers (API/PAYG) have access
    return true;
}
