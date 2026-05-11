"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldInferenceConfigCommandBeImmediate = shouldInferenceConfigCommandBeImmediate;
var growthbook_js_1 = require("../services/analytics/growthbook.js");
/**
 * Whether inference-config commands (/model, /fast, /effort) should execute
 * immediately (during a running query) rather than waiting for the current
 * turn to finish.
 *
 * Always enabled for ants; gated by experiment for external users.
 */
function shouldInferenceConfigCommandBeImmediate() {
    return (process.env.USER_TYPE === 'ant' ||
        (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_immediate_model_command', false));
}
