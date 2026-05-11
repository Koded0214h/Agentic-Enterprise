"use strict";
/**
 * FallbackErrorHandler: Error detection for provider fallback
 *
 * Responsibility:
 * - Determine if an error should trigger fallback to Claude SDK
 * - Provide consistent error classification across Gemini and OpenRouter
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldFallbackToClaude = shouldFallbackToClaude;
exports.isAbortError = isAbortError;
var types_js_1 = require("./types.js");
/**
 * Check if an error should trigger fallback to Claude SDK
 *
 * Errors that trigger fallback:
 * - 429: Rate limit exceeded
 * - 500/502/503: Server errors
 * - ECONNREFUSED: Connection refused (server down)
 * - ETIMEDOUT: Request timeout
 * - fetch failed: Network failure
 *
 * @param error - Error object to check
 * @returns true if the error should trigger fallback to Claude
 */
function shouldFallbackToClaude(error) {
    var message = getErrorMessage(error);
    return types_js_1.FALLBACK_ERROR_PATTERNS.some(function (pattern) { return message.includes(pattern); });
}
/**
 * Extract error message from various error types
 */
function getErrorMessage(error) {
    if (error === null || error === undefined) {
        return '';
    }
    if (typeof error === 'string') {
        return error;
    }
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'object' && 'message' in error) {
        return String(error.message);
    }
    return String(error);
}
/**
 * Check if error is an AbortError (user cancelled)
 *
 * @param error - Error object to check
 * @returns true if this is an abort/cancellation error
 */
function isAbortError(error) {
    if (error === null || error === undefined) {
        return false;
    }
    if (error instanceof Error && error.name === 'AbortError') {
        return true;
    }
    if (typeof error === 'object' && 'name' in error) {
        return error.name === 'AbortError';
    }
    return false;
}
