"use strict";
/**
 * Centralized rate limit message generation
 * Single source of truth for all rate limit-related messages
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RATE_LIMIT_ERROR_PREFIXES = void 0;
exports.isRateLimitErrorMessage = isRateLimitErrorMessage;
exports.getRateLimitMessage = getRateLimitMessage;
exports.getRateLimitErrorMessage = getRateLimitErrorMessage;
exports.getRateLimitWarning = getRateLimitWarning;
exports.getUsingOverageText = getUsingOverageText;
var auth_js_1 = require("../utils/auth.js");
var billing_js_1 = require("../utils/billing.js");
var format_js_1 = require("../utils/format.js");
var FEEDBACK_CHANNEL_ANT = '#briarpatch-cc';
/**
 * All possible rate limit error message prefixes
 * Export this to avoid fragile string matching in UI components
 */
exports.RATE_LIMIT_ERROR_PREFIXES = [
    "You've hit your",
    "You've used",
    "You're now using extra usage",
    "You're close to",
    "You're out of extra usage",
];
/**
 * Check if a message is a rate limit error
 */
function isRateLimitErrorMessage(text) {
    return exports.RATE_LIMIT_ERROR_PREFIXES.some(function (prefix) { return text.startsWith(prefix); });
}
/**
 * Get the appropriate rate limit message based on limit state
 * Returns null if no message should be shown
 */
function getRateLimitMessage(limits, model) {
    var _a;
    // Check overage scenarios first (when subscription is rejected but overage is available)
    // getUsingOverageText is rendered separately from warning.
    if (limits.isUsingOverage) {
        // Show warning if approaching overage spending limit
        if (limits.overageStatus === 'allowed_warning') {
            return {
                message: "You're close to your extra usage spending limit",
                severity: 'warning',
            };
        }
        return null;
    }
    // ERROR STATES - when limits are rejected
    if (limits.status === 'rejected') {
        return { message: getLimitReachedText(limits, model), severity: 'error' };
    }
    // WARNING STATES - when approaching limits with early warning
    if (limits.status === 'allowed_warning') {
        // Only show warnings when utilization is above threshold (70%)
        // This prevents false warnings after week reset when API may send
        // allowed_warning with stale data at low usage levels
        var WARNING_THRESHOLD = 0.7;
        if (limits.utilization !== undefined &&
            limits.utilization < WARNING_THRESHOLD) {
            return null;
        }
        // Don't warn non-billing Team/Enterprise users about approaching plan limits
        // if overages are enabled - they'll seamlessly roll into overage
        var subscriptionType = (0, auth_js_1.getSubscriptionType)();
        var isTeamOrEnterprise = subscriptionType === 'team' || subscriptionType === 'enterprise';
        var hasExtraUsageEnabled = ((_a = (0, auth_js_1.getOauthAccountInfo)()) === null || _a === void 0 ? void 0 : _a.hasExtraUsageEnabled) === true;
        if (isTeamOrEnterprise &&
            hasExtraUsageEnabled &&
            !(0, billing_js_1.hasClaudeAiBillingAccess)()) {
            return null;
        }
        var text = getEarlyWarningText(limits);
        if (text) {
            return { message: text, severity: 'warning' };
        }
    }
    // No message needed
    return null;
}
/**
 * Get error message for API errors (used in errors.ts)
 * Returns the message string or null if no error message should be shown
 */
function getRateLimitErrorMessage(limits, model) {
    var message = getRateLimitMessage(limits, model);
    // Only return error messages, not warnings
    if (message && message.severity === 'error') {
        return message.message;
    }
    return null;
}
/**
 * Get warning message for UI footer
 * Returns the warning message string or null if no warning should be shown
 */
function getRateLimitWarning(limits, model) {
    var message = getRateLimitMessage(limits, model);
    // Only return warnings for the footer - errors are shown in AssistantTextMessages
    if (message && message.severity === 'warning') {
        return message.message;
    }
    // Don't show errors in the footer
    return null;
}
function getLimitReachedText(limits, model) {
    var resetsAt = limits.resetsAt;
    var resetTime = resetsAt ? (0, format_js_1.formatResetTime)(resetsAt, true) : undefined;
    var overageResetTime = limits.overageResetsAt
        ? (0, format_js_1.formatResetTime)(limits.overageResetsAt, true)
        : undefined;
    var resetMessage = resetTime ? " \u00B7 resets ".concat(resetTime) : '';
    // if BOTH subscription (checked before this method) and overage are exhausted
    if (limits.overageStatus === 'rejected') {
        // Show the earliest reset time to indicate when user can resume
        var overageResetMessage = '';
        if (resetsAt && limits.overageResetsAt) {
            // Both timestamps present - use the earlier one
            if (resetsAt < limits.overageResetsAt) {
                overageResetMessage = " \u00B7 resets ".concat(resetTime);
            }
            else {
                overageResetMessage = " \u00B7 resets ".concat(overageResetTime);
            }
        }
        else if (resetTime) {
            overageResetMessage = " \u00B7 resets ".concat(resetTime);
        }
        else if (overageResetTime) {
            overageResetMessage = " \u00B7 resets ".concat(overageResetTime);
        }
        if (limits.overageDisabledReason === 'out_of_credits') {
            return "You're out of extra usage".concat(overageResetMessage);
        }
        return formatLimitReachedText('limit', overageResetMessage, model);
    }
    if (limits.rateLimitType === 'seven_day_sonnet') {
        var subscriptionType = (0, auth_js_1.getSubscriptionType)();
        var isProOrEnterprise = subscriptionType === 'pro' || subscriptionType === 'enterprise';
        // For pro and enterprise, Sonnet limit is the same as weekly
        var limit = isProOrEnterprise ? 'weekly limit' : 'Sonnet limit';
        return formatLimitReachedText(limit, resetMessage, model);
    }
    if (limits.rateLimitType === 'seven_day_opus') {
        return formatLimitReachedText('Opus limit', resetMessage, model);
    }
    if (limits.rateLimitType === 'seven_day') {
        return formatLimitReachedText('weekly limit', resetMessage, model);
    }
    if (limits.rateLimitType === 'five_hour') {
        return formatLimitReachedText('session limit', resetMessage, model);
    }
    return formatLimitReachedText('usage limit', resetMessage, model);
}
function getEarlyWarningText(limits) {
    var limitName = null;
    switch (limits.rateLimitType) {
        case 'seven_day':
            limitName = 'weekly limit';
            break;
        case 'five_hour':
            limitName = 'session limit';
            break;
        case 'seven_day_opus':
            limitName = 'Opus limit';
            break;
        case 'seven_day_sonnet':
            limitName = 'Sonnet limit';
            break;
        case 'overage':
            limitName = 'extra usage';
            break;
        case undefined:
            return null;
    }
    // utilization and resetsAt should be defined since early warning is calculated with them
    var used = limits.utilization
        ? Math.floor(limits.utilization * 100)
        : undefined;
    var resetTime = limits.resetsAt
        ? (0, format_js_1.formatResetTime)(limits.resetsAt, true)
        : undefined;
    // Get upsell command based on subscription type and limit type
    var upsell = getWarningUpsellText(limits.rateLimitType);
    if (used && resetTime) {
        var base_1 = "You've used ".concat(used, "% of your ").concat(limitName, " \u00B7 resets ").concat(resetTime);
        return upsell ? "".concat(base_1, " \u00B7 ").concat(upsell) : base_1;
    }
    if (used) {
        var base_2 = "You've used ".concat(used, "% of your ").concat(limitName);
        return upsell ? "".concat(base_2, " \u00B7 ").concat(upsell) : base_2;
    }
    if (limits.rateLimitType === 'overage') {
        // For the "Approaching <x>" verbiage, "extra usage limit" makes more sense than "extra usage"
        limitName += ' limit';
    }
    if (resetTime) {
        var base_3 = "Approaching ".concat(limitName, " \u00B7 resets ").concat(resetTime);
        return upsell ? "".concat(base_3, " \u00B7 ").concat(upsell) : base_3;
    }
    var base = "Approaching ".concat(limitName);
    return upsell ? "".concat(base, " \u00B7 ").concat(upsell) : base;
}
/**
 * Get the upsell command text for warning messages based on subscription and limit type.
 * Returns null if no upsell should be shown.
 * Only used for warnings because actual rate limit hits will see an interactive menu of options.
 */
function getWarningUpsellText(rateLimitType) {
    var _a;
    var subscriptionType = (0, auth_js_1.getSubscriptionType)();
    var hasExtraUsageEnabled = ((_a = (0, auth_js_1.getOauthAccountInfo)()) === null || _a === void 0 ? void 0 : _a.hasExtraUsageEnabled) === true;
    // 5-hour session limit warning
    if (rateLimitType === 'five_hour') {
        // Teams/Enterprise with overages disabled: prompt to request extra usage
        // Only show if overage provisioning is allowed for this org type (e.g., not AWS marketplace)
        if (subscriptionType === 'team' || subscriptionType === 'enterprise') {
            if (!hasExtraUsageEnabled && (0, auth_js_1.isOverageProvisioningAllowed)()) {
                return '/extra-usage to request more';
            }
            // Teams/Enterprise with overages enabled or unsupported billing type don't need upsell
            return null;
        }
        // Pro/Max users: prompt to upgrade
        if (subscriptionType === 'pro' || subscriptionType === 'max') {
            return '/upgrade to keep using Claude Code';
        }
    }
    // Overage warning (approaching spending limit)
    if (rateLimitType === 'overage') {
        if (subscriptionType === 'team' || subscriptionType === 'enterprise') {
            if (!hasExtraUsageEnabled && (0, auth_js_1.isOverageProvisioningAllowed)()) {
                return '/extra-usage to request more';
            }
        }
    }
    // Weekly limit warnings don't show upsell per spec
    return null;
}
/**
 * Get notification text for overage mode transitions
 * Used for transient notifications when entering overage mode
 */
function getUsingOverageText(limits) {
    var resetTime = limits.resetsAt
        ? (0, format_js_1.formatResetTime)(limits.resetsAt, true)
        : '';
    var limitName = '';
    if (limits.rateLimitType === 'five_hour') {
        limitName = 'session limit';
    }
    else if (limits.rateLimitType === 'seven_day') {
        limitName = 'weekly limit';
    }
    else if (limits.rateLimitType === 'seven_day_opus') {
        limitName = 'Opus limit';
    }
    else if (limits.rateLimitType === 'seven_day_sonnet') {
        var subscriptionType = (0, auth_js_1.getSubscriptionType)();
        var isProOrEnterprise = subscriptionType === 'pro' || subscriptionType === 'enterprise';
        // For pro and enterprise, Sonnet limit is the same as weekly
        limitName = isProOrEnterprise ? 'weekly limit' : 'Sonnet limit';
    }
    if (!limitName) {
        return 'Now using extra usage';
    }
    var resetMessage = resetTime
        ? " \u00B7 Your ".concat(limitName, " resets ").concat(resetTime)
        : '';
    return "You're now using extra usage".concat(resetMessage);
}
function formatLimitReachedText(limit, resetMessage, _model) {
    // Enhanced messaging for Ant users
    if (process.env.USER_TYPE === 'ant') {
        return "You've hit your ".concat(limit).concat(resetMessage, ". If you have feedback about this limit, post in ").concat(FEEDBACK_CHANNEL_ANT, ". You can reset your limits with /reset-limits");
    }
    return "You've hit your ".concat(limit).concat(resetMessage);
}
