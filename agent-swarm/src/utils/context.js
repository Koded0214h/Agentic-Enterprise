"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ESCALATED_MAX_TOKENS = exports.CAPPED_DEFAULT_MAX_TOKENS = exports.COMPACT_MAX_OUTPUT_TOKENS = exports.MODEL_CONTEXT_WINDOW_DEFAULT = void 0;
exports.is1mContextDisabled = is1mContextDisabled;
exports.has1mContext = has1mContext;
exports.modelSupports1M = modelSupports1M;
exports.getContextWindowForModel = getContextWindowForModel;
exports.getSonnet1mExpTreatmentEnabled = getSonnet1mExpTreatmentEnabled;
exports.calculateContextPercentages = calculateContextPercentages;
exports.getModelMaxOutputTokens = getModelMaxOutputTokens;
exports.getMaxThinkingTokensForModel = getMaxThinkingTokensForModel;
// biome-ignore-all assist/source/organizeImports: ANT-ONLY import markers must not be reordered
var betas_js_1 = require("../constants/betas.js");
var config_js_1 = require("./config.js");
var envUtils_js_1 = require("./envUtils.js");
var model_js_1 = require("./model/model.js");
var modelCapabilities_js_1 = require("./model/modelCapabilities.js");
// Model context window size (200k tokens for all models right now)
exports.MODEL_CONTEXT_WINDOW_DEFAULT = 200000;
// Maximum output tokens for compact operations
exports.COMPACT_MAX_OUTPUT_TOKENS = 20000;
// Default max output tokens
var MAX_OUTPUT_TOKENS_DEFAULT = 32000;
var MAX_OUTPUT_TOKENS_UPPER_LIMIT = 64000;
// Capped default for slot-reservation optimization. BQ p99 output = 4,911
// tokens, so 32k/64k defaults over-reserve 8-16× slot capacity. With the cap
// enabled, <1% of requests hit the limit; those get one clean retry at 64k
// (see query.ts max_output_tokens_escalate). Cap is applied in
// claude.ts:getMaxOutputTokensForModel to avoid the growthbook→betas→context
// import cycle.
exports.CAPPED_DEFAULT_MAX_TOKENS = 8000;
exports.ESCALATED_MAX_TOKENS = 64000;
/**
 * Check if 1M context is disabled via environment variable.
 * Used by C4E admins to disable 1M context for HIPAA compliance.
 */
function is1mContextDisabled() {
    return (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_DISABLE_1M_CONTEXT);
}
function has1mContext(model) {
    if (is1mContextDisabled()) {
        return false;
    }
    return /\[1m\]/i.test(model);
}
// @[MODEL LAUNCH]: Update this pattern if the new model supports 1M context
function modelSupports1M(model) {
    if (is1mContextDisabled()) {
        return false;
    }
    var canonical = (0, model_js_1.getCanonicalName)(model);
    return canonical.includes('claude-sonnet-4') || canonical.includes('opus-4-6');
}
function getContextWindowForModel(model, betas) {
    // Allow override via environment variable (ant-only)
    // This takes precedence over all other context window resolution, including 1M detection,
    // so users can cap the effective context window for local decisions (auto-compact, etc.)
    // while still using a 1M-capable endpoint.
    if (process.env.USER_TYPE === 'ant' &&
        process.env.CLAUDE_CODE_MAX_CONTEXT_TOKENS) {
        var override = parseInt(process.env.CLAUDE_CODE_MAX_CONTEXT_TOKENS, 10);
        if (!isNaN(override) && override > 0) {
            return override;
        }
    }
    // [1m] suffix — explicit client-side opt-in, respected over all detection
    if (has1mContext(model)) {
        return 1000000;
    }
    var cap = (0, modelCapabilities_js_1.getModelCapability)(model);
    if ((cap === null || cap === void 0 ? void 0 : cap.max_input_tokens) && cap.max_input_tokens >= 100000) {
        if (cap.max_input_tokens > exports.MODEL_CONTEXT_WINDOW_DEFAULT &&
            is1mContextDisabled()) {
            return exports.MODEL_CONTEXT_WINDOW_DEFAULT;
        }
        return cap.max_input_tokens;
    }
    if ((betas === null || betas === void 0 ? void 0 : betas.includes(betas_js_1.CONTEXT_1M_BETA_HEADER)) && modelSupports1M(model)) {
        return 1000000;
    }
    if (getSonnet1mExpTreatmentEnabled(model)) {
        return 1000000;
    }
    if (process.env.USER_TYPE === 'ant') {
        var antModel = resolveAntModel(model);
        if (antModel === null || antModel === void 0 ? void 0 : antModel.contextWindow) {
            return antModel.contextWindow;
        }
    }
    return exports.MODEL_CONTEXT_WINDOW_DEFAULT;
}
function getSonnet1mExpTreatmentEnabled(model) {
    var _a;
    if (is1mContextDisabled()) {
        return false;
    }
    // Only applies to sonnet 4.6 without an explicit [1m] suffix
    if (has1mContext(model)) {
        return false;
    }
    if (!(0, model_js_1.getCanonicalName)(model).includes('sonnet-4-6')) {
        return false;
    }
    return ((_a = (0, config_js_1.getGlobalConfig)().clientDataCache) === null || _a === void 0 ? void 0 : _a['coral_reef_sonnet']) === 'true';
}
/**
 * Calculate context window usage percentage from token usage data.
 * Returns used and remaining percentages, or null values if no usage data.
 */
function calculateContextPercentages(currentUsage, contextWindowSize) {
    if (!currentUsage) {
        return { used: null, remaining: null };
    }
    var totalInputTokens = currentUsage.input_tokens +
        currentUsage.cache_creation_input_tokens +
        currentUsage.cache_read_input_tokens;
    var usedPercentage = Math.round((totalInputTokens / contextWindowSize) * 100);
    var clampedUsed = Math.min(100, Math.max(0, usedPercentage));
    return {
        used: clampedUsed,
        remaining: 100 - clampedUsed,
    };
}
/**
 * Returns the model's default and upper limit for max output tokens.
 */
function getModelMaxOutputTokens(model) {
    var _a, _b;
    var defaultTokens;
    var upperLimit;
    if (process.env.USER_TYPE === 'ant') {
        var antModel = resolveAntModel(model.toLowerCase());
        if (antModel) {
            defaultTokens = (_a = antModel.defaultMaxTokens) !== null && _a !== void 0 ? _a : MAX_OUTPUT_TOKENS_DEFAULT;
            upperLimit = (_b = antModel.upperMaxTokensLimit) !== null && _b !== void 0 ? _b : MAX_OUTPUT_TOKENS_UPPER_LIMIT;
            return { default: defaultTokens, upperLimit: upperLimit };
        }
    }
    var m = (0, model_js_1.getCanonicalName)(model);
    if (m.includes('opus-4-6')) {
        defaultTokens = 64000;
        upperLimit = 128000;
    }
    else if (m.includes('sonnet-4-6')) {
        defaultTokens = 32000;
        upperLimit = 128000;
    }
    else if (m.includes('opus-4-5') ||
        m.includes('sonnet-4') ||
        m.includes('haiku-4')) {
        defaultTokens = 32000;
        upperLimit = 64000;
    }
    else if (m.includes('opus-4-1') || m.includes('opus-4')) {
        defaultTokens = 32000;
        upperLimit = 32000;
    }
    else if (m.includes('claude-3-opus')) {
        defaultTokens = 4096;
        upperLimit = 4096;
    }
    else if (m.includes('claude-3-sonnet')) {
        defaultTokens = 8192;
        upperLimit = 8192;
    }
    else if (m.includes('claude-3-haiku')) {
        defaultTokens = 4096;
        upperLimit = 4096;
    }
    else if (m.includes('3-5-sonnet') || m.includes('3-5-haiku')) {
        defaultTokens = 8192;
        upperLimit = 8192;
    }
    else if (m.includes('3-7-sonnet')) {
        defaultTokens = 32000;
        upperLimit = 64000;
    }
    else {
        defaultTokens = MAX_OUTPUT_TOKENS_DEFAULT;
        upperLimit = MAX_OUTPUT_TOKENS_UPPER_LIMIT;
    }
    var cap = (0, modelCapabilities_js_1.getModelCapability)(model);
    if ((cap === null || cap === void 0 ? void 0 : cap.max_tokens) && cap.max_tokens >= 4096) {
        upperLimit = cap.max_tokens;
        defaultTokens = Math.min(defaultTokens, upperLimit);
    }
    return { default: defaultTokens, upperLimit: upperLimit };
}
/**
 * Returns the max thinking budget tokens for a given model. The max
 * thinking tokens should be strictly less than the max output tokens.
 *
 * Deprecated since newer models use adaptive thinking rather than a
 * strict thinking token budget.
 */
function getMaxThinkingTokensForModel(model) {
    return getModelMaxOutputTokens(model).upperLimit - 1;
}
