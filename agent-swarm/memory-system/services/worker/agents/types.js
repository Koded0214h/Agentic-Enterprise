"use strict";
/**
 * Shared agent types for SDK, Gemini, and OpenRouter agents
 *
 * Responsibility:
 * - Define common interfaces used across all agent implementations
 * - Provide type safety for response processing and broadcasting
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FALLBACK_ERROR_PATTERNS = void 0;
/**
 * Error codes that should trigger fallback to Claude
 */
exports.FALLBACK_ERROR_PATTERNS = [
    '429', // Rate limit
    '500', // Internal server error
    '502', // Bad gateway
    '503', // Service unavailable
    'ECONNREFUSED', // Connection refused
    'ETIMEDOUT', // Timeout
    'fetch failed', // Network failure
];
