"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MODEL_COSTS = exports.COST_HAIKU_45 = exports.COST_HAIKU_35 = exports.COST_TIER_30_150 = exports.COST_TIER_5_25 = exports.COST_TIER_15_75 = exports.COST_TIER_3_15 = void 0;
exports.getOpus46CostTier = getOpus46CostTier;
exports.getModelCosts = getModelCosts;
exports.calculateUSDCost = calculateUSDCost;
exports.calculateCostFromTokens = calculateCostFromTokens;
exports.formatModelPricing = formatModelPricing;
exports.getModelPricingString = getModelPricingString;
var index_js_1 = require("src/services/analytics/index.js");
var state_js_1 = require("../bootstrap/state.js");
var fastMode_js_1 = require("./fastMode.js");
var configs_js_1 = require("./model/configs.js");
var model_js_1 = require("./model/model.js");
// Standard pricing tier for Sonnet models: $3 input / $15 output per Mtok
exports.COST_TIER_3_15 = {
    inputTokens: 3,
    outputTokens: 15,
    promptCacheWriteTokens: 3.75,
    promptCacheReadTokens: 0.3,
    webSearchRequests: 0.01,
};
// Pricing tier for Opus 4/4.1: $15 input / $75 output per Mtok
exports.COST_TIER_15_75 = {
    inputTokens: 15,
    outputTokens: 75,
    promptCacheWriteTokens: 18.75,
    promptCacheReadTokens: 1.5,
    webSearchRequests: 0.01,
};
// Pricing tier for Opus 4.5: $5 input / $25 output per Mtok
exports.COST_TIER_5_25 = {
    inputTokens: 5,
    outputTokens: 25,
    promptCacheWriteTokens: 6.25,
    promptCacheReadTokens: 0.5,
    webSearchRequests: 0.01,
};
// Fast mode pricing for Opus 4.6: $30 input / $150 output per Mtok
exports.COST_TIER_30_150 = {
    inputTokens: 30,
    outputTokens: 150,
    promptCacheWriteTokens: 37.5,
    promptCacheReadTokens: 3,
    webSearchRequests: 0.01,
};
// Pricing for Haiku 3.5: $0.80 input / $4 output per Mtok
exports.COST_HAIKU_35 = {
    inputTokens: 0.8,
    outputTokens: 4,
    promptCacheWriteTokens: 1,
    promptCacheReadTokens: 0.08,
    webSearchRequests: 0.01,
};
// Pricing for Haiku 4.5: $1 input / $5 output per Mtok
exports.COST_HAIKU_45 = {
    inputTokens: 1,
    outputTokens: 5,
    promptCacheWriteTokens: 1.25,
    promptCacheReadTokens: 0.1,
    webSearchRequests: 0.01,
};
var DEFAULT_UNKNOWN_MODEL_COST = exports.COST_TIER_5_25;
/**
 * Get the cost tier for Opus 4.6 based on fast mode.
 */
function getOpus46CostTier(fastMode) {
    if ((0, fastMode_js_1.isFastModeEnabled)() && fastMode) {
        return exports.COST_TIER_30_150;
    }
    return exports.COST_TIER_5_25;
}
// @[MODEL LAUNCH]: Add a pricing entry for the new model below.
// Costs from https://platform.claude.com/docs/en/about-claude/pricing
// Web search cost: $10 per 1000 requests = $0.01 per request
exports.MODEL_COSTS = (_a = {},
    _a[(0, model_js_1.firstPartyNameToCanonical)(configs_js_1.CLAUDE_3_5_HAIKU_CONFIG.firstParty)] = exports.COST_HAIKU_35,
    _a[(0, model_js_1.firstPartyNameToCanonical)(configs_js_1.CLAUDE_HAIKU_4_5_CONFIG.firstParty)] = exports.COST_HAIKU_45,
    _a[(0, model_js_1.firstPartyNameToCanonical)(configs_js_1.CLAUDE_3_5_V2_SONNET_CONFIG.firstParty)] = exports.COST_TIER_3_15,
    _a[(0, model_js_1.firstPartyNameToCanonical)(configs_js_1.CLAUDE_3_7_SONNET_CONFIG.firstParty)] = exports.COST_TIER_3_15,
    _a[(0, model_js_1.firstPartyNameToCanonical)(configs_js_1.CLAUDE_SONNET_4_CONFIG.firstParty)] = exports.COST_TIER_3_15,
    _a[(0, model_js_1.firstPartyNameToCanonical)(configs_js_1.CLAUDE_SONNET_4_5_CONFIG.firstParty)] = exports.COST_TIER_3_15,
    _a[(0, model_js_1.firstPartyNameToCanonical)(configs_js_1.CLAUDE_SONNET_4_6_CONFIG.firstParty)] = exports.COST_TIER_3_15,
    _a[(0, model_js_1.firstPartyNameToCanonical)(configs_js_1.CLAUDE_OPUS_4_CONFIG.firstParty)] = exports.COST_TIER_15_75,
    _a[(0, model_js_1.firstPartyNameToCanonical)(configs_js_1.CLAUDE_OPUS_4_1_CONFIG.firstParty)] = exports.COST_TIER_15_75,
    _a[(0, model_js_1.firstPartyNameToCanonical)(configs_js_1.CLAUDE_OPUS_4_5_CONFIG.firstParty)] = exports.COST_TIER_5_25,
    _a[(0, model_js_1.firstPartyNameToCanonical)(configs_js_1.CLAUDE_OPUS_4_6_CONFIG.firstParty)] = exports.COST_TIER_5_25,
    _a);
/**
 * Calculates the USD cost based on token usage and model cost configuration
 */
function tokensToUSDCost(modelCosts, usage) {
    var _a, _b, _c, _d;
    return ((usage.input_tokens / 1000000) * modelCosts.inputTokens +
        (usage.output_tokens / 1000000) * modelCosts.outputTokens +
        (((_a = usage.cache_read_input_tokens) !== null && _a !== void 0 ? _a : 0) / 1000000) *
            modelCosts.promptCacheReadTokens +
        (((_b = usage.cache_creation_input_tokens) !== null && _b !== void 0 ? _b : 0) / 1000000) *
            modelCosts.promptCacheWriteTokens +
        ((_d = (_c = usage.server_tool_use) === null || _c === void 0 ? void 0 : _c.web_search_requests) !== null && _d !== void 0 ? _d : 0) *
            modelCosts.webSearchRequests);
}
function getModelCosts(model, usage) {
    var _a;
    var shortName = (0, model_js_1.getCanonicalName)(model);
    // Check if this is an Opus 4.6 model with fast mode active.
    if (shortName === (0, model_js_1.firstPartyNameToCanonical)(configs_js_1.CLAUDE_OPUS_4_6_CONFIG.firstParty)) {
        var isFastMode = usage.speed === 'fast';
        return getOpus46CostTier(isFastMode);
    }
    var costs = exports.MODEL_COSTS[shortName];
    if (!costs) {
        trackUnknownModelCost(model, shortName);
        return ((_a = exports.MODEL_COSTS[(0, model_js_1.getCanonicalName)((0, model_js_1.getDefaultMainLoopModelSetting)())]) !== null && _a !== void 0 ? _a : DEFAULT_UNKNOWN_MODEL_COST);
    }
    return costs;
}
function trackUnknownModelCost(model, shortName) {
    (0, index_js_1.logEvent)('tengu_unknown_model_cost', {
        model: model,
        shortName: shortName,
    });
    (0, state_js_1.setHasUnknownModelCost)();
}
// Calculate the cost of a query in US dollars.
// If the model's costs are not found, use the default model's costs.
function calculateUSDCost(resolvedModel, usage) {
    var modelCosts = getModelCosts(resolvedModel, usage);
    return tokensToUSDCost(modelCosts, usage);
}
/**
 * Calculate cost from raw token counts without requiring a full BetaUsage object.
 * Useful for side queries (e.g. classifier) that track token counts independently.
 */
function calculateCostFromTokens(model, tokens) {
    var usage = {
        input_tokens: tokens.inputTokens,
        output_tokens: tokens.outputTokens,
        cache_read_input_tokens: tokens.cacheReadInputTokens,
        cache_creation_input_tokens: tokens.cacheCreationInputTokens,
    };
    return calculateUSDCost(model, usage);
}
function formatPrice(price) {
    // Format price: integers without decimals, others with 2 decimal places
    // e.g., 3 -> "$3", 0.8 -> "$0.80", 22.5 -> "$22.50"
    if (Number.isInteger(price)) {
        return "$".concat(price);
    }
    return "$".concat(price.toFixed(2));
}
/**
 * Format model costs as a pricing string for display
 * e.g., "$3/$15 per Mtok"
 */
function formatModelPricing(costs) {
    return "".concat(formatPrice(costs.inputTokens), "/").concat(formatPrice(costs.outputTokens), " per Mtok");
}
/**
 * Get formatted pricing string for a model
 * Accepts either a short name or full model name
 * Returns undefined if model is not found
 */
function getModelPricingString(model) {
    var shortName = (0, model_js_1.getCanonicalName)(model);
    var costs = exports.MODEL_COSTS[shortName];
    if (!costs)
        return undefined;
    return formatModelPricing(costs);
}
