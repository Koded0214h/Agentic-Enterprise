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
Object.defineProperty(exports, "__esModule", { value: true });
exports.statusListeners = exports.currentLimits = exports.getUsingOverageText = exports.getRateLimitWarning = exports.getRateLimitErrorMessage = void 0;
exports.getRateLimitDisplayName = getRateLimitDisplayName;
exports.getRawUtilization = getRawUtilization;
exports.emitStatusChange = emitStatusChange;
exports.checkQuotaStatus = checkQuotaStatus;
exports.extractQuotaStatusFromHeaders = extractQuotaStatusFromHeaders;
exports.extractQuotaStatusFromError = extractQuotaStatusFromError;
var sdk_1 = require("@anthropic-ai/sdk");
var isEqual_js_1 = require("lodash-es/isEqual.js");
var state_js_1 = require("../bootstrap/state.js");
var auth_js_1 = require("../utils/auth.js");
var betas_js_1 = require("../utils/betas.js");
var config_js_1 = require("../utils/config.js");
var log_js_1 = require("../utils/log.js");
var model_js_1 = require("../utils/model/model.js");
var privacyLevel_js_1 = require("../utils/privacyLevel.js");
var index_js_1 = require("./analytics/index.js");
var claude_js_1 = require("./api/claude.js");
var client_js_1 = require("./api/client.js");
var rateLimitMocking_js_1 = require("./rateLimitMocking.js");
// Re-export message functions from centralized location
var rateLimitMessages_js_1 = require("./rateLimitMessages.js");
Object.defineProperty(exports, "getRateLimitErrorMessage", { enumerable: true, get: function () { return rateLimitMessages_js_1.getRateLimitErrorMessage; } });
Object.defineProperty(exports, "getRateLimitWarning", { enumerable: true, get: function () { return rateLimitMessages_js_1.getRateLimitWarning; } });
Object.defineProperty(exports, "getUsingOverageText", { enumerable: true, get: function () { return rateLimitMessages_js_1.getUsingOverageText; } });
// Early warning configurations in priority order (checked first to last)
// Used as fallback when server doesn't send surpassed-threshold header
// Warns users when they're consuming quota faster than the time window allows
var EARLY_WARNING_CONFIGS = [
    {
        rateLimitType: 'five_hour',
        claimAbbrev: '5h',
        windowSeconds: 5 * 60 * 60,
        thresholds: [{ utilization: 0.9, timePct: 0.72 }],
    },
    {
        rateLimitType: 'seven_day',
        claimAbbrev: '7d',
        windowSeconds: 7 * 24 * 60 * 60,
        thresholds: [
            { utilization: 0.75, timePct: 0.6 },
            { utilization: 0.5, timePct: 0.35 },
            { utilization: 0.25, timePct: 0.15 },
        ],
    },
];
// Maps claim abbreviations to rate limit types for header-based detection
var EARLY_WARNING_CLAIM_MAP = {
    '5h': 'five_hour',
    '7d': 'seven_day',
    overage: 'overage',
};
var RATE_LIMIT_DISPLAY_NAMES = {
    five_hour: 'session limit',
    seven_day: 'weekly limit',
    seven_day_opus: 'Opus limit',
    seven_day_sonnet: 'Sonnet limit',
    overage: 'extra usage limit',
};
function getRateLimitDisplayName(type) {
    return RATE_LIMIT_DISPLAY_NAMES[type] || type;
}
/**
 * Calculate what fraction of a time window has elapsed.
 * Used for time-relative early warning fallback.
 * @param resetsAt - Unix epoch timestamp in seconds when the limit resets
 * @param windowSeconds - Duration of the window in seconds
 * @returns fraction (0-1) of the window that has elapsed
 */
function computeTimeProgress(resetsAt, windowSeconds) {
    var nowSeconds = Date.now() / 1000;
    var windowStart = resetsAt - windowSeconds;
    var elapsed = nowSeconds - windowStart;
    return Math.max(0, Math.min(1, elapsed / windowSeconds));
}
// Exported for testing only
exports.currentLimits = {
    status: 'allowed',
    unifiedRateLimitFallbackAvailable: false,
    isUsingOverage: false,
};
var rawUtilization = {};
function getRawUtilization() {
    return rawUtilization;
}
function extractRawUtilization(headers) {
    var result = {};
    for (var _i = 0, _a = [
        ['five_hour', '5h'],
        ['seven_day', '7d'],
    ]; _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], abbrev = _b[1];
        var util = headers.get("anthropic-ratelimit-unified-".concat(abbrev, "-utilization"));
        var reset = headers.get("anthropic-ratelimit-unified-".concat(abbrev, "-reset"));
        if (util !== null && reset !== null) {
            result[key] = { utilization: Number(util), resets_at: Number(reset) };
        }
    }
    return result;
}
exports.statusListeners = new Set();
function emitStatusChange(limits) {
    exports.currentLimits = limits;
    exports.statusListeners.forEach(function (listener) { return listener(limits); });
    var hoursTillReset = Math.round((limits.resetsAt ? limits.resetsAt - Date.now() / 1000 : 0) / (60 * 60));
    (0, index_js_1.logEvent)('tengu_claudeai_limits_status_changed', {
        status: limits.status,
        unifiedRateLimitFallbackAvailable: limits.unifiedRateLimitFallbackAvailable,
        hoursTillReset: hoursTillReset,
    });
}
function makeTestQuery() {
    return __awaiter(this, void 0, void 0, function () {
        var model, anthropic, messages, betas;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    model = (0, model_js_1.getSmallFastModel)();
                    return [4 /*yield*/, (0, client_js_1.getAnthropicClient)({
                            maxRetries: 0,
                            model: model,
                            source: 'quota_check',
                        })];
                case 1:
                    anthropic = _a.sent();
                    messages = [{ role: 'user', content: 'quota' }];
                    betas = (0, betas_js_1.getModelBetas)(model);
                    // biome-ignore lint/plugin: quota check needs raw response access via asResponse()
                    return [2 /*return*/, anthropic.beta.messages
                            .create(__assign({ model: model, max_tokens: 1, messages: messages, metadata: (0, claude_js_1.getAPIMetadata)() }, (betas.length > 0 ? { betas: betas } : {})))
                            .asResponse()];
            }
        });
    });
}
function checkQuotaStatus() {
    return __awaiter(this, void 0, void 0, function () {
        var raw, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Skip network requests if nonessential traffic is disabled
                    if ((0, privacyLevel_js_1.isEssentialTrafficOnly)()) {
                        return [2 /*return*/];
                    }
                    // Check if we should process rate limits (real subscriber or mock testing)
                    if (!(0, rateLimitMocking_js_1.shouldProcessRateLimits)((0, auth_js_1.isClaudeAISubscriber)())) {
                        return [2 /*return*/];
                    }
                    // In non-interactive mode (-p), the real query follows immediately and
                    // extractQuotaStatusFromHeaders() will update limits from its response
                    // headers (claude.ts), so skip this pre-check API call.
                    if ((0, state_js_1.getIsNonInteractiveSession)()) {
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, makeTestQuery()
                        // Update limits based on the response
                    ];
                case 2:
                    raw = _a.sent();
                    // Update limits based on the response
                    extractQuotaStatusFromHeaders(raw.headers);
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    if (error_1 instanceof sdk_1.APIError) {
                        extractQuotaStatusFromError(error_1);
                    }
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Check if early warning should be triggered based on surpassed-threshold header.
 * Returns ClaudeAILimits if a threshold was surpassed, null otherwise.
 */
function getHeaderBasedEarlyWarning(headers, unifiedRateLimitFallbackAvailable) {
    // Check each claim type for surpassed threshold header
    for (var _i = 0, _a = Object.entries(EARLY_WARNING_CLAIM_MAP); _i < _a.length; _i++) {
        var _b = _a[_i], claimAbbrev = _b[0], rateLimitType = _b[1];
        var surpassedThreshold = headers.get("anthropic-ratelimit-unified-".concat(claimAbbrev, "-surpassed-threshold"));
        // If threshold header is present, user has crossed a warning threshold
        if (surpassedThreshold !== null) {
            var utilizationHeader = headers.get("anthropic-ratelimit-unified-".concat(claimAbbrev, "-utilization"));
            var resetHeader = headers.get("anthropic-ratelimit-unified-".concat(claimAbbrev, "-reset"));
            var utilization = utilizationHeader
                ? Number(utilizationHeader)
                : undefined;
            var resetsAt = resetHeader ? Number(resetHeader) : undefined;
            return {
                status: 'allowed_warning',
                resetsAt: resetsAt,
                rateLimitType: rateLimitType,
                utilization: utilization,
                unifiedRateLimitFallbackAvailable: unifiedRateLimitFallbackAvailable,
                isUsingOverage: false,
                surpassedThreshold: Number(surpassedThreshold),
            };
        }
    }
    return null;
}
/**
 * Check if time-relative early warning should be triggered for a rate limit type.
 * Fallback when server doesn't send surpassed-threshold header.
 * Returns ClaudeAILimits if thresholds are exceeded, null otherwise.
 */
function getTimeRelativeEarlyWarning(headers, config, unifiedRateLimitFallbackAvailable) {
    var rateLimitType = config.rateLimitType, claimAbbrev = config.claimAbbrev, windowSeconds = config.windowSeconds, thresholds = config.thresholds;
    var utilizationHeader = headers.get("anthropic-ratelimit-unified-".concat(claimAbbrev, "-utilization"));
    var resetHeader = headers.get("anthropic-ratelimit-unified-".concat(claimAbbrev, "-reset"));
    if (utilizationHeader === null || resetHeader === null) {
        return null;
    }
    var utilization = Number(utilizationHeader);
    var resetsAt = Number(resetHeader);
    var timeProgress = computeTimeProgress(resetsAt, windowSeconds);
    // Check if any threshold is exceeded: high usage early in the window
    var shouldWarn = thresholds.some(function (t) { return utilization >= t.utilization && timeProgress <= t.timePct; });
    if (!shouldWarn) {
        return null;
    }
    return {
        status: 'allowed_warning',
        resetsAt: resetsAt,
        rateLimitType: rateLimitType,
        utilization: utilization,
        unifiedRateLimitFallbackAvailable: unifiedRateLimitFallbackAvailable,
        isUsingOverage: false,
    };
}
/**
 * Get early warning limits using header-based detection with time-relative fallback.
 * 1. First checks for surpassed-threshold header (new server-side approach)
 * 2. Falls back to time-relative thresholds (client-side calculation)
 */
function getEarlyWarningFromHeaders(headers, unifiedRateLimitFallbackAvailable) {
    // Try header-based detection first (preferred when API sends the header)
    var headerBasedWarning = getHeaderBasedEarlyWarning(headers, unifiedRateLimitFallbackAvailable);
    if (headerBasedWarning) {
        return headerBasedWarning;
    }
    // Fallback: Use time-relative thresholds (client-side calculation)
    // This catches users burning quota faster than sustainable
    for (var _i = 0, EARLY_WARNING_CONFIGS_1 = EARLY_WARNING_CONFIGS; _i < EARLY_WARNING_CONFIGS_1.length; _i++) {
        var config = EARLY_WARNING_CONFIGS_1[_i];
        var timeRelativeWarning = getTimeRelativeEarlyWarning(headers, config, unifiedRateLimitFallbackAvailable);
        if (timeRelativeWarning) {
            return timeRelativeWarning;
        }
    }
    return null;
}
function computeNewLimitsFromHeaders(headers) {
    var status = headers.get('anthropic-ratelimit-unified-status') ||
        'allowed';
    var resetsAtHeader = headers.get('anthropic-ratelimit-unified-reset');
    var resetsAt = resetsAtHeader ? Number(resetsAtHeader) : undefined;
    var unifiedRateLimitFallbackAvailable = headers.get('anthropic-ratelimit-unified-fallback') === 'available';
    // Headers for rate limit type and overage support
    var rateLimitType = headers.get('anthropic-ratelimit-unified-representative-claim');
    var overageStatus = headers.get('anthropic-ratelimit-unified-overage-status');
    var overageResetsAtHeader = headers.get('anthropic-ratelimit-unified-overage-reset');
    var overageResetsAt = overageResetsAtHeader
        ? Number(overageResetsAtHeader)
        : undefined;
    // Reason why overage is disabled (spending cap or wallet empty)
    var overageDisabledReason = headers.get('anthropic-ratelimit-unified-overage-disabled-reason');
    // Determine if we're using overage (standard limits rejected but overage allowed)
    var isUsingOverage = status === 'rejected' &&
        (overageStatus === 'allowed' || overageStatus === 'allowed_warning');
    // Check for early warning based on surpassed-threshold header
    // If status is allowed/allowed_warning and we find a surpassed threshold, show warning
    var finalStatus = status;
    if (status === 'allowed' || status === 'allowed_warning') {
        var earlyWarning = getEarlyWarningFromHeaders(headers, unifiedRateLimitFallbackAvailable);
        if (earlyWarning) {
            return earlyWarning;
        }
        // No early warning threshold surpassed
        finalStatus = 'allowed';
    }
    return __assign(__assign(__assign(__assign(__assign({ status: finalStatus, resetsAt: resetsAt, unifiedRateLimitFallbackAvailable: unifiedRateLimitFallbackAvailable }, (rateLimitType && { rateLimitType: rateLimitType })), (overageStatus && { overageStatus: overageStatus })), (overageResetsAt && { overageResetsAt: overageResetsAt })), (overageDisabledReason && { overageDisabledReason: overageDisabledReason })), { isUsingOverage: isUsingOverage });
}
/**
 * Cache the extra usage disabled reason from API headers.
 */
function cacheExtraUsageDisabledReason(headers) {
    var _a;
    // A null reason means extra usage is enabled (no disabled reason header)
    var reason = (_a = headers.get('anthropic-ratelimit-unified-overage-disabled-reason')) !== null && _a !== void 0 ? _a : null;
    var cached = (0, config_js_1.getGlobalConfig)().cachedExtraUsageDisabledReason;
    if (cached !== reason) {
        (0, config_js_1.saveGlobalConfig)(function (current) { return (__assign(__assign({}, current), { cachedExtraUsageDisabledReason: reason })); });
    }
}
function extractQuotaStatusFromHeaders(headers) {
    // Check if we need to process rate limits
    var isSubscriber = (0, auth_js_1.isClaudeAISubscriber)();
    if (!(0, rateLimitMocking_js_1.shouldProcessRateLimits)(isSubscriber)) {
        // If we have any rate limit state, clear it
        rawUtilization = {};
        if (exports.currentLimits.status !== 'allowed' || exports.currentLimits.resetsAt) {
            var defaultLimits = {
                status: 'allowed',
                unifiedRateLimitFallbackAvailable: false,
                isUsingOverage: false,
            };
            emitStatusChange(defaultLimits);
        }
        return;
    }
    // Process headers (applies mocks from /mock-limits command if active)
    var headersToUse = (0, rateLimitMocking_js_1.processRateLimitHeaders)(headers);
    rawUtilization = extractRawUtilization(headersToUse);
    var newLimits = computeNewLimitsFromHeaders(headersToUse);
    // Cache extra usage status (persists across sessions)
    cacheExtraUsageDisabledReason(headersToUse);
    if (!(0, isEqual_js_1.default)(exports.currentLimits, newLimits)) {
        emitStatusChange(newLimits);
    }
}
function extractQuotaStatusFromError(error) {
    if (!(0, rateLimitMocking_js_1.shouldProcessRateLimits)((0, auth_js_1.isClaudeAISubscriber)()) ||
        error.status !== 429) {
        return;
    }
    try {
        var newLimits = __assign({}, exports.currentLimits);
        if (error.headers) {
            // Process headers (applies mocks from /mock-limits command if active)
            var headersToUse = (0, rateLimitMocking_js_1.processRateLimitHeaders)(error.headers);
            rawUtilization = extractRawUtilization(headersToUse);
            newLimits = computeNewLimitsFromHeaders(headersToUse);
            // Cache extra usage status (persists across sessions)
            cacheExtraUsageDisabledReason(headersToUse);
        }
        // For errors, always set status to rejected even if headers are not present.
        newLimits.status = 'rejected';
        if (!(0, isEqual_js_1.default)(exports.currentLimits, newLimits)) {
            emitStatusChange(newLimits);
        }
    }
    catch (e) {
        (0, log_js_1.logError)(e);
    }
}
