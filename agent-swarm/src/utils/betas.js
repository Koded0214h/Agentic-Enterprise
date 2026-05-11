"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBedrockExtraBodyParamsBetas = exports.getModelBetas = exports.getAllModelBetas = void 0;
exports.filterAllowedSdkBetas = filterAllowedSdkBetas;
exports.modelSupportsISP = modelSupportsISP;
exports.modelSupportsContextManagement = modelSupportsContextManagement;
exports.modelSupportsStructuredOutputs = modelSupportsStructuredOutputs;
exports.modelSupportsAutoMode = modelSupportsAutoMode;
exports.getToolSearchBetaHeader = getToolSearchBetaHeader;
exports.shouldIncludeFirstPartyOnlyBetas = shouldIncludeFirstPartyOnlyBetas;
exports.shouldUseGlobalCacheScope = shouldUseGlobalCacheScope;
exports.getMergedBetas = getMergedBetas;
exports.clearBetasCaches = clearBetasCaches;
var bun_bundle_1 = require("bun:bundle");
var memoize_js_1 = require("lodash-es/memoize.js");
var growthbook_js_1 = require("src/services/analytics/growthbook.js");
var state_js_1 = require("../bootstrap/state.js");
var betas_js_1 = require("../constants/betas.js");
var oauth_js_1 = require("../constants/oauth.js");
var auth_js_1 = require("./auth.js");
var context_js_1 = require("./context.js");
var envUtils_js_1 = require("./envUtils.js");
var model_js_1 = require("./model/model.js");
var modelSupportOverrides_js_1 = require("./model/modelSupportOverrides.js");
var providers_js_1 = require("./model/providers.js");
var settings_js_1 = require("./settings/settings.js");
/**
 * SDK-provided betas that are allowed for API key users.
 * Only betas in this list can be passed via SDK options.
 */
var ALLOWED_SDK_BETAS = [betas_js_1.CONTEXT_1M_BETA_HEADER];
/**
 * Filter betas to only include those in the allowlist.
 * Returns allowed and disallowed betas separately.
 */
function partitionBetasByAllowlist(betas) {
    var allowed = [];
    var disallowed = [];
    for (var _i = 0, betas_1 = betas; _i < betas_1.length; _i++) {
        var beta = betas_1[_i];
        if (ALLOWED_SDK_BETAS.includes(beta)) {
            allowed.push(beta);
        }
        else {
            disallowed.push(beta);
        }
    }
    return { allowed: allowed, disallowed: disallowed };
}
/**
 * Filter SDK betas to only include allowed ones.
 * Warns about disallowed betas and subscriber restrictions.
 * Returns undefined if no valid betas remain or if user is a subscriber.
 */
function filterAllowedSdkBetas(sdkBetas) {
    if (!sdkBetas || sdkBetas.length === 0) {
        return undefined;
    }
    if ((0, auth_js_1.isClaudeAISubscriber)()) {
        // biome-ignore lint/suspicious/noConsole: intentional warning
        console.warn('Warning: Custom betas are only available for API key users. Ignoring provided betas.');
        return undefined;
    }
    var _a = partitionBetasByAllowlist(sdkBetas), allowed = _a.allowed, disallowed = _a.disallowed;
    for (var _i = 0, disallowed_1 = disallowed; _i < disallowed_1.length; _i++) {
        var beta = disallowed_1[_i];
        // biome-ignore lint/suspicious/noConsole: intentional warning
        console.warn("Warning: Beta header '".concat(beta, "' is not allowed. Only the following betas are supported: ").concat(ALLOWED_SDK_BETAS.join(', ')));
    }
    return allowed.length > 0 ? allowed : undefined;
}
// Generally, foundry supports all 1P features;
// however out of an abundance of caution, we do not enable any which are behind an experiment
function modelSupportsISP(model) {
    var supported3P = (0, modelSupportOverrides_js_1.get3PModelCapabilityOverride)(model, 'interleaved_thinking');
    if (supported3P !== undefined) {
        return supported3P;
    }
    var canonical = (0, model_js_1.getCanonicalName)(model);
    var provider = (0, providers_js_1.getAPIProvider)();
    // Foundry supports interleaved thinking for all models
    if (provider === 'foundry') {
        return true;
    }
    if (provider === 'firstParty') {
        return !canonical.includes('claude-3-');
    }
    return (canonical.includes('claude-opus-4') || canonical.includes('claude-sonnet-4'));
}
function vertexModelSupportsWebSearch(model) {
    var canonical = (0, model_js_1.getCanonicalName)(model);
    // Web search only supported on Claude 4.0+ models on Vertex
    return (canonical.includes('claude-opus-4') ||
        canonical.includes('claude-sonnet-4') ||
        canonical.includes('claude-haiku-4'));
}
// Context management is supported on Claude 4+ models
function modelSupportsContextManagement(model) {
    var canonical = (0, model_js_1.getCanonicalName)(model);
    var provider = (0, providers_js_1.getAPIProvider)();
    if (provider === 'foundry') {
        return true;
    }
    if (provider === 'firstParty') {
        return !canonical.includes('claude-3-');
    }
    return (canonical.includes('claude-opus-4') ||
        canonical.includes('claude-sonnet-4') ||
        canonical.includes('claude-haiku-4'));
}
// @[MODEL LAUNCH]: Add the new model ID to this list if it supports structured outputs.
function modelSupportsStructuredOutputs(model) {
    var canonical = (0, model_js_1.getCanonicalName)(model);
    var provider = (0, providers_js_1.getAPIProvider)();
    // Structured outputs only supported on firstParty and Foundry (not Bedrock/Vertex yet)
    if (provider !== 'firstParty' && provider !== 'foundry') {
        return false;
    }
    return (canonical.includes('claude-sonnet-4-6') ||
        canonical.includes('claude-sonnet-4-5') ||
        canonical.includes('claude-opus-4-1') ||
        canonical.includes('claude-opus-4-5') ||
        canonical.includes('claude-opus-4-6') ||
        canonical.includes('claude-haiku-4-5'));
}
// @[MODEL LAUNCH]: Add the new model if it supports auto mode (specifically PI probes) — ask in #proj-claude-code-safety-research.
function modelSupportsAutoMode(model) {
    var _a;
    if ((0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER')) {
        var m_1 = (0, model_js_1.getCanonicalName)(model);
        // External: firstParty-only at launch (PI probes not wired for
        // Bedrock/Vertex/Foundry yet). Checked before allowModels so the GB
        // override can't enable auto mode on unsupported providers.
        if (process.env.USER_TYPE !== 'ant' && (0, providers_js_1.getAPIProvider)() !== 'firstParty') {
            return false;
        }
        // GrowthBook override: tengu_auto_mode_config.allowModels force-enables
        // auto mode for listed models, bypassing the denylist/allowlist below.
        // Exact model IDs (e.g. "claude-strudel-v6-p") match only that model;
        // canonical names (e.g. "claude-strudel") match the whole family.
        var config = (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_auto_mode_config', {});
        var rawLower_1 = model.toLowerCase();
        if ((_a = config === null || config === void 0 ? void 0 : config.allowModels) === null || _a === void 0 ? void 0 : _a.some(function (am) { return am.toLowerCase() === rawLower_1 || am.toLowerCase() === m_1; })) {
            return true;
        }
        if (process.env.USER_TYPE === 'ant') {
            // Denylist: block known-unsupported claude models, allow everything else (ant-internal models etc.)
            if (m_1.includes('claude-3-'))
                return false;
            // claude-*-4 not followed by -[6-9]: blocks bare -4, -4-YYYYMMDD, -4@, -4-0 thru -4-5
            if (/claude-(opus|sonnet|haiku)-4(?!-[6-9])/.test(m_1))
                return false;
            return true;
        }
        // External allowlist (firstParty already checked above).
        return /^claude-(opus|sonnet)-4-6/.test(m_1);
    }
    return false;
}
/**
 * Get the correct tool search beta header for the current API provider.
 * - Claude API / Foundry: advanced-tool-use-2025-11-20
 * - Vertex AI / Bedrock: tool-search-tool-2025-10-19
 */
function getToolSearchBetaHeader() {
    var provider = (0, providers_js_1.getAPIProvider)();
    if (provider === 'vertex' || provider === 'bedrock') {
        return betas_js_1.TOOL_SEARCH_BETA_HEADER_3P;
    }
    return betas_js_1.TOOL_SEARCH_BETA_HEADER_1P;
}
/**
 * Check if experimental betas should be included.
 * These are betas that are only available on firstParty provider
 * and may not be supported by proxies or other providers.
 */
function shouldIncludeFirstPartyOnlyBetas() {
    return (((0, providers_js_1.getAPIProvider)() === 'firstParty' || (0, providers_js_1.getAPIProvider)() === 'foundry') &&
        !(0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS));
}
/**
 * Global-scope prompt caching is firstParty only. Foundry is excluded because
 * GrowthBook never bucketed Foundry users into the rollout experiment — the
 * treatment data is firstParty-only.
 */
function shouldUseGlobalCacheScope() {
    return ((0, providers_js_1.getAPIProvider)() === 'firstParty' &&
        !(0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS));
}
exports.getAllModelBetas = (0, memoize_js_1.default)(function (model) {
    var betaHeaders = [];
    var isHaiku = (0, model_js_1.getCanonicalName)(model).includes('haiku');
    var provider = (0, providers_js_1.getAPIProvider)();
    var includeFirstPartyOnlyBetas = shouldIncludeFirstPartyOnlyBetas();
    if (!isHaiku) {
        betaHeaders.push(betas_js_1.CLAUDE_CODE_20250219_BETA_HEADER);
        if (process.env.USER_TYPE === 'ant' &&
            process.env.CLAUDE_CODE_ENTRYPOINT === 'cli') {
            if (betas_js_1.CLI_INTERNAL_BETA_HEADER) {
                betaHeaders.push(betas_js_1.CLI_INTERNAL_BETA_HEADER);
            }
        }
    }
    if ((0, auth_js_1.isClaudeAISubscriber)()) {
        betaHeaders.push(oauth_js_1.OAUTH_BETA_HEADER);
    }
    if ((0, context_js_1.has1mContext)(model)) {
        betaHeaders.push(betas_js_1.CONTEXT_1M_BETA_HEADER);
    }
    if (!(0, envUtils_js_1.isEnvTruthy)(process.env.DISABLE_INTERLEAVED_THINKING) &&
        modelSupportsISP(model)) {
        betaHeaders.push(betas_js_1.INTERLEAVED_THINKING_BETA_HEADER);
    }
    // Skip the API-side Haiku thinking summarizer — the summary is only used
    // for ctrl+o display, which interactive users rarely open. The API returns
    // redacted_thinking blocks instead; AssistantRedactedThinkingMessage already
    // renders those as a stub. SDK / print-mode keep summaries because callers
    // may iterate over thinking content. Users can opt back in via settings.json
    // showThinkingSummaries.
    if (includeFirstPartyOnlyBetas &&
        modelSupportsISP(model) &&
        !(0, state_js_1.getIsNonInteractiveSession)() &&
        (0, settings_js_1.getInitialSettings)().showThinkingSummaries !== true) {
        betaHeaders.push(betas_js_1.REDACT_THINKING_BETA_HEADER);
    }
    // POC: server-side connector-text summarization (anti-distillation). The
    // API buffers assistant text between tool calls, summarizes it, and returns
    // the summary with a signature so the original can be restored on subsequent
    // turns — same mechanism as thinking blocks. Ant-only while we measure
    // TTFT/TTLT/capacity; betas already flow to tengu_api_success for splitting.
    // Backend independently requires Capability.ANTHROPIC_INTERNAL_RESEARCH.
    //
    // USE_CONNECTOR_TEXT_SUMMARIZATION is tri-state: =1 forces on (opt-in even
    // if GB is off), =0 forces off (opt-out of a GB rollout you were bucketed
    // into), unset defers to GB.
    if (betas_js_1.SUMMARIZE_CONNECTOR_TEXT_BETA_HEADER &&
        process.env.USER_TYPE === 'ant' &&
        includeFirstPartyOnlyBetas &&
        !(0, envUtils_js_1.isEnvDefinedFalsy)(process.env.USE_CONNECTOR_TEXT_SUMMARIZATION) &&
        ((0, envUtils_js_1.isEnvTruthy)(process.env.USE_CONNECTOR_TEXT_SUMMARIZATION) ||
            (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_slate_prism', false))) {
        betaHeaders.push(betas_js_1.SUMMARIZE_CONNECTOR_TEXT_BETA_HEADER);
    }
    // Add context management beta for tool clearing (ant opt-in) or thinking preservation
    var antOptedIntoToolClearing = (0, envUtils_js_1.isEnvTruthy)(process.env.USE_API_CONTEXT_MANAGEMENT) &&
        process.env.USER_TYPE === 'ant';
    var thinkingPreservationEnabled = modelSupportsContextManagement(model);
    if (shouldIncludeFirstPartyOnlyBetas() &&
        (antOptedIntoToolClearing || thinkingPreservationEnabled)) {
        betaHeaders.push(betas_js_1.CONTEXT_MANAGEMENT_BETA_HEADER);
    }
    // Add strict tool use beta if experiment is enabled.
    // Gate on includeFirstPartyOnlyBetas: CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS
    // already strips schema.strict from tool bodies at api.ts's choke point, but
    // this header was escaping that kill switch. Proxy gateways that look like
    // firstParty but forward to Vertex reject this header with 400.
    // github.com/deshaw/anthropic-issues/issues/5
    var strictToolsEnabled = (0, growthbook_js_1.checkStatsigFeatureGate_CACHED_MAY_BE_STALE)('tengu_tool_pear');
    // 3P default: false. API rejects strict + token-efficient-tools together
    // (tool_use.py:139), so these are mutually exclusive — strict wins.
    var tokenEfficientToolsEnabled = !strictToolsEnabled &&
        (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_amber_json_tools', false);
    if (includeFirstPartyOnlyBetas &&
        modelSupportsStructuredOutputs(model) &&
        strictToolsEnabled) {
        betaHeaders.push(betas_js_1.STRUCTURED_OUTPUTS_BETA_HEADER);
    }
    // JSON tool_use format (FC v3) — ~4.5% output token reduction vs ANTML.
    // Sends the v2 header (2026-03-28) added in anthropics/anthropic#337072 to
    // isolate the CC A/B cohort from ~9.2M/week existing v1 senders. Ant-only
    // while the restored JsonToolUseOutputParser soaks.
    if (process.env.USER_TYPE === 'ant' &&
        includeFirstPartyOnlyBetas &&
        tokenEfficientToolsEnabled) {
        betaHeaders.push(betas_js_1.TOKEN_EFFICIENT_TOOLS_BETA_HEADER);
    }
    // Add web search beta for Vertex Claude 4.0+ models only
    if (provider === 'vertex' && vertexModelSupportsWebSearch(model)) {
        betaHeaders.push(betas_js_1.WEB_SEARCH_BETA_HEADER);
    }
    // Foundry only ships models that already support Web Search
    if (provider === 'foundry') {
        betaHeaders.push(betas_js_1.WEB_SEARCH_BETA_HEADER);
    }
    // Always send the beta header for 1P. The header is a no-op without a scope field.
    if (includeFirstPartyOnlyBetas) {
        betaHeaders.push(betas_js_1.PROMPT_CACHING_SCOPE_BETA_HEADER);
    }
    // If ANTHROPIC_BETAS is set, split it by commas and add to betaHeaders.
    // This is an explicit user opt-in, so honor it regardless of model.
    if (process.env.ANTHROPIC_BETAS) {
        betaHeaders.push.apply(betaHeaders, process.env.ANTHROPIC_BETAS.split(',')
            .map(function (_) { return _.trim(); })
            .filter(Boolean));
    }
    return betaHeaders;
});
exports.getModelBetas = (0, memoize_js_1.default)(function (model) {
    var modelBetas = (0, exports.getAllModelBetas)(model);
    if ((0, providers_js_1.getAPIProvider)() === 'bedrock') {
        return modelBetas.filter(function (b) { return !betas_js_1.BEDROCK_EXTRA_PARAMS_HEADERS.has(b); });
    }
    return modelBetas;
});
exports.getBedrockExtraBodyParamsBetas = (0, memoize_js_1.default)(function (model) {
    var modelBetas = (0, exports.getAllModelBetas)(model);
    return modelBetas.filter(function (b) { return betas_js_1.BEDROCK_EXTRA_PARAMS_HEADERS.has(b); });
});
/**
 * Merge SDK-provided betas with auto-detected model betas.
 * SDK betas are read from global state (set via setSdkBetas in main.tsx).
 * The betas are pre-filtered by filterAllowedSdkBetas which handles
 * subscriber checks and allowlist validation with warnings.
 *
 * @param options.isAgenticQuery - When true, ensures the beta headers needed
 *   for agentic queries are present. For non-Haiku models these are already
 *   included by getAllModelBetas(); for Haiku they're excluded since
 *   non-agentic calls (compaction, classifiers, token estimation) don't need them.
 */
function getMergedBetas(model, options) {
    var baseBetas = __spreadArray([], (0, exports.getModelBetas)(model), true);
    // Agentic queries always need claude-code and cli-internal beta headers.
    // For non-Haiku models these are already in baseBetas; for Haiku they're
    // excluded by getAllModelBetas() since non-agentic Haiku calls don't need them.
    if (options === null || options === void 0 ? void 0 : options.isAgenticQuery) {
        if (!baseBetas.includes(betas_js_1.CLAUDE_CODE_20250219_BETA_HEADER)) {
            baseBetas.push(betas_js_1.CLAUDE_CODE_20250219_BETA_HEADER);
        }
        if (process.env.USER_TYPE === 'ant' &&
            process.env.CLAUDE_CODE_ENTRYPOINT === 'cli' &&
            betas_js_1.CLI_INTERNAL_BETA_HEADER &&
            !baseBetas.includes(betas_js_1.CLI_INTERNAL_BETA_HEADER)) {
            baseBetas.push(betas_js_1.CLI_INTERNAL_BETA_HEADER);
        }
    }
    var sdkBetas = (0, state_js_1.getSdkBetas)();
    if (!sdkBetas || sdkBetas.length === 0) {
        return baseBetas;
    }
    // Merge SDK betas without duplicates (already filtered by filterAllowedSdkBetas)
    return __spreadArray(__spreadArray([], baseBetas, true), sdkBetas.filter(function (b) { return !baseBetas.includes(b); }), true);
}
function clearBetasCaches() {
    var _a, _b, _c, _d, _e, _f;
    (_b = (_a = exports.getAllModelBetas.cache) === null || _a === void 0 ? void 0 : _a.clear) === null || _b === void 0 ? void 0 : _b.call(_a);
    (_d = (_c = exports.getModelBetas.cache) === null || _c === void 0 ? void 0 : _c.clear) === null || _d === void 0 ? void 0 : _d.call(_c);
    (_f = (_e = exports.getBedrockExtraBodyParamsBetas.cache) === null || _e === void 0 ? void 0 : _e.clear) === null || _f === void 0 ? void 0 : _f.call(_e);
}
