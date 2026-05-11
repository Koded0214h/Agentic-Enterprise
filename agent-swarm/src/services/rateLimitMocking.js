"use strict";
/**
 * Facade for rate limit header processing
 * This isolates mock logic from production code
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldProcessMockLimits = void 0;
exports.processRateLimitHeaders = processRateLimitHeaders;
exports.shouldProcessRateLimits = shouldProcessRateLimits;
exports.checkMockRateLimitError = checkMockRateLimitError;
exports.isMockRateLimitError = isMockRateLimitError;
var sdk_1 = require("@anthropic-ai/sdk");
var mockRateLimits_js_1 = require("./mockRateLimits.js");
Object.defineProperty(exports, "shouldProcessMockLimits", { enumerable: true, get: function () { return mockRateLimits_js_1.shouldProcessMockLimits; } });
/**
 * Process headers, applying mocks if /mock-limits command is active
 */
function processRateLimitHeaders(headers) {
    // Only apply mocks for Ant employees using /mock-limits command
    if ((0, mockRateLimits_js_1.shouldProcessMockLimits)()) {
        return (0, mockRateLimits_js_1.applyMockHeaders)(headers);
    }
    return headers;
}
/**
 * Check if we should process rate limits (either real subscriber or /mock-limits command)
 */
function shouldProcessRateLimits(isSubscriber) {
    return isSubscriber || (0, mockRateLimits_js_1.shouldProcessMockLimits)();
}
/**
 * Check if mock rate limits should throw a 429 error
 * Returns the error to throw, or null if no error should be thrown
 * @param currentModel The model being used for the current request
 * @param isFastModeActive Whether fast mode is currently active (for fast-mode-only mocks)
 */
function checkMockRateLimitError(currentModel, isFastModeActive) {
    if (!(0, mockRateLimits_js_1.shouldProcessMockLimits)()) {
        return null;
    }
    var headerlessMessage = (0, mockRateLimits_js_1.getMockHeaderless429Message)();
    if (headerlessMessage) {
        return new sdk_1.APIError(429, { error: { type: 'rate_limit_error', message: headerlessMessage } }, headerlessMessage, 
        // eslint-disable-next-line eslint-plugin-n/no-unsupported-features/node-builtins
        new globalThis.Headers());
    }
    var mockHeaders = (0, mockRateLimits_js_1.getMockHeaders)();
    if (!mockHeaders) {
        return null;
    }
    // Check if we should throw a 429 error
    // Only throw if:
    // 1. Status is rejected AND
    // 2. Either no overage headers OR overage is also rejected
    // 3. For Opus-specific limits, only throw if actually using an Opus model
    var status = mockHeaders['anthropic-ratelimit-unified-status'];
    var overageStatus = mockHeaders['anthropic-ratelimit-unified-overage-status'];
    var rateLimitType = mockHeaders['anthropic-ratelimit-unified-representative-claim'];
    // Check if this is an Opus-specific rate limit
    var isOpusLimit = rateLimitType === 'seven_day_opus';
    // Check if current model is an Opus model (handles all variants including aliases)
    var isUsingOpus = currentModel.includes('opus');
    // For Opus limits, only throw 429 if actually using Opus
    // This simulates the real API behavior where fallback to Sonnet succeeds
    if (isOpusLimit && !isUsingOpus) {
        return null;
    }
    // Check for mock fast mode rate limits (handles expiry, countdown, etc.)
    if ((0, mockRateLimits_js_1.isMockFastModeRateLimitScenario)()) {
        var fastModeHeaders = (0, mockRateLimits_js_1.checkMockFastModeRateLimit)(isFastModeActive);
        if (fastModeHeaders === null) {
            return null;
        }
        // Create a mock 429 error with the fast mode headers
        var error = new sdk_1.APIError(429, { error: { type: 'rate_limit_error', message: 'Rate limit exceeded' } }, 'Rate limit exceeded', 
        // eslint-disable-next-line eslint-plugin-n/no-unsupported-features/node-builtins
        new globalThis.Headers(Object.entries(fastModeHeaders).filter(function (_a) {
            var _ = _a[0], v = _a[1];
            return v !== undefined;
        })));
        return error;
    }
    var shouldThrow429 = status === 'rejected' && (!overageStatus || overageStatus === 'rejected');
    if (shouldThrow429) {
        // Create a mock 429 error with the appropriate headers
        var error = new sdk_1.APIError(429, { error: { type: 'rate_limit_error', message: 'Rate limit exceeded' } }, 'Rate limit exceeded', 
        // eslint-disable-next-line eslint-plugin-n/no-unsupported-features/node-builtins
        new globalThis.Headers(Object.entries(mockHeaders).filter(function (_a) {
            var _ = _a[0], v = _a[1];
            return v !== undefined;
        })));
        return error;
    }
    return null;
}
/**
 * Check if this is a mock 429 error that shouldn't be retried
 */
function isMockRateLimitError(error) {
    return (0, mockRateLimits_js_1.shouldProcessMockLimits)() && error.status === 429;
}
