"use strict";
/**
 * Agent Consolidation Module
 *
 * This module provides shared utilities for SDK, Gemini, and OpenRouter agents.
 * It extracts common patterns to reduce code duplication and ensure consistent behavior.
 *
 * Usage:
 * ```typescript
 * import { processAgentResponse, shouldFallbackToClaude } from './agents/index.js';
 * ```
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAbortError = exports.shouldFallbackToClaude = exports.cleanupProcessedMessages = exports.broadcastSummary = exports.broadcastObservation = exports.processAgentResponse = exports.FALLBACK_ERROR_PATTERNS = void 0;
var types_js_1 = require("./types.js");
Object.defineProperty(exports, "FALLBACK_ERROR_PATTERNS", { enumerable: true, get: function () { return types_js_1.FALLBACK_ERROR_PATTERNS; } });
// Response Processing
var ResponseProcessor_js_1 = require("./ResponseProcessor.js");
Object.defineProperty(exports, "processAgentResponse", { enumerable: true, get: function () { return ResponseProcessor_js_1.processAgentResponse; } });
// SSE Broadcasting
var ObservationBroadcaster_js_1 = require("./ObservationBroadcaster.js");
Object.defineProperty(exports, "broadcastObservation", { enumerable: true, get: function () { return ObservationBroadcaster_js_1.broadcastObservation; } });
Object.defineProperty(exports, "broadcastSummary", { enumerable: true, get: function () { return ObservationBroadcaster_js_1.broadcastSummary; } });
// Session Cleanup
var SessionCleanupHelper_js_1 = require("./SessionCleanupHelper.js");
Object.defineProperty(exports, "cleanupProcessedMessages", { enumerable: true, get: function () { return SessionCleanupHelper_js_1.cleanupProcessedMessages; } });
// Error Handling
var FallbackErrorHandler_js_1 = require("./FallbackErrorHandler.js");
Object.defineProperty(exports, "shouldFallbackToClaude", { enumerable: true, get: function () { return FallbackErrorHandler_js_1.shouldFallbackToClaude; } });
Object.defineProperty(exports, "isAbortError", { enumerable: true, get: function () { return FallbackErrorHandler_js_1.isAbortError; } });
