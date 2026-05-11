"use strict";
/**
 * Shared analytics configuration
 *
 * Common logic for determining when analytics should be disabled
 * across all analytics systems (Datadog, 1P)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAnalyticsDisabled = isAnalyticsDisabled;
exports.isFeedbackSurveyDisabled = isFeedbackSurveyDisabled;
var envUtils_js_1 = require("../../utils/envUtils.js");
var privacyLevel_js_1 = require("../../utils/privacyLevel.js");
/**
 * Check if analytics operations should be disabled
 *
 * Analytics is disabled in the following cases:
 * - Test environment (NODE_ENV === 'test')
 * - Third-party cloud providers (Bedrock/Vertex)
 * - Privacy level is no-telemetry or essential-traffic
 */
function isAnalyticsDisabled() {
    return (process.env.NODE_ENV === 'test' ||
        (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_USE_BEDROCK) ||
        (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_USE_VERTEX) ||
        (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_USE_FOUNDRY) ||
        (0, privacyLevel_js_1.isTelemetryDisabled)());
}
/**
 * Check if the feedback survey should be suppressed.
 *
 * Unlike isAnalyticsDisabled(), this does NOT block on 3P providers
 * (Bedrock/Vertex/Foundry). The survey is a local UI prompt with no
 * transcript data — enterprise customers capture responses via OTEL.
 */
function isFeedbackSurveyDisabled() {
    return process.env.NODE_ENV === 'test' || (0, privacyLevel_js_1.isTelemetryDisabled)();
}
