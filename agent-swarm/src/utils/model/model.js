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
exports.getSmallFastModel = getSmallFastModel;
exports.isNonCustomOpusModel = isNonCustomOpusModel;
exports.getUserSpecifiedModelSetting = getUserSpecifiedModelSetting;
exports.getMainLoopModel = getMainLoopModel;
exports.getBestModel = getBestModel;
exports.getDefaultOpusModel = getDefaultOpusModel;
exports.getDefaultSonnetModel = getDefaultSonnetModel;
exports.getDefaultHaikuModel = getDefaultHaikuModel;
exports.getRuntimeMainLoopModel = getRuntimeMainLoopModel;
exports.getDefaultMainLoopModelSetting = getDefaultMainLoopModelSetting;
exports.getDefaultMainLoopModel = getDefaultMainLoopModel;
exports.firstPartyNameToCanonical = firstPartyNameToCanonical;
exports.getCanonicalName = getCanonicalName;
exports.getClaudeAiUserDefaultModelDescription = getClaudeAiUserDefaultModelDescription;
exports.renderDefaultModelSetting = renderDefaultModelSetting;
exports.getOpus46PricingSuffix = getOpus46PricingSuffix;
exports.isOpus1mMergeEnabled = isOpus1mMergeEnabled;
exports.renderModelSetting = renderModelSetting;
exports.getPublicModelDisplayName = getPublicModelDisplayName;
exports.renderModelName = renderModelName;
exports.getPublicModelName = getPublicModelName;
exports.parseUserSpecifiedModel = parseUserSpecifiedModel;
exports.resolveSkillModelOverride = resolveSkillModelOverride;
exports.isLegacyModelRemapEnabled = isLegacyModelRemapEnabled;
exports.modelDisplayString = modelDisplayString;
exports.getMarketingNameForModel = getMarketingNameForModel;
exports.normalizeModelStringForAPI = normalizeModelStringForAPI;
// biome-ignore-all assist/source/organizeImports: ANT-ONLY import markers must not be reordered
/**
 * Ensure that any model codenames introduced here are also added to
 * scripts/excluded-strings.txt to avoid leaking them. Wrap any codename string
 * literals with process.env.USER_TYPE === 'ant' for Bun to remove the codenames
 * during dead code elimination
 */
var state_js_1 = require("../../bootstrap/state.js");
var auth_js_1 = require("../auth.js");
var context_js_1 = require("../context.js");
var envUtils_js_1 = require("../envUtils.js");
var modelStrings_js_1 = require("./modelStrings.js");
var modelCost_js_1 = require("../modelCost.js");
var settings_js_1 = require("../settings/settings.js");
var providers_js_1 = require("./providers.js");
var figures_js_1 = require("../../constants/figures.js");
var modelAllowlist_js_1 = require("./modelAllowlist.js");
var aliases_js_1 = require("./aliases.js");
var stringUtils_js_1 = require("../stringUtils.js");
function getSmallFastModel() {
    return process.env.ANTHROPIC_SMALL_FAST_MODEL || getDefaultHaikuModel();
}
function isNonCustomOpusModel(model) {
    return (model === (0, modelStrings_js_1.getModelStrings)().opus40 ||
        model === (0, modelStrings_js_1.getModelStrings)().opus41 ||
        model === (0, modelStrings_js_1.getModelStrings)().opus45 ||
        model === (0, modelStrings_js_1.getModelStrings)().opus46);
}
/**
 * Helper to get the model from /model (including via /config), the --model flag, environment variable,
 * or the saved settings. The returned value can be a model alias if that's what the user specified.
 * Undefined if the user didn't configure anything, in which case we fall back to
 * the default (null).
 *
 * Priority order within this function:
 * 1. Model override during session (from /model command) - highest priority
 * 2. Model override at startup (from --model flag)
 * 3. ANTHROPIC_MODEL environment variable
 * 4. Settings (from user's saved settings)
 */
function getUserSpecifiedModelSetting() {
    var specifiedModel;
    var modelOverride = (0, state_js_1.getMainLoopModelOverride)();
    if (modelOverride !== undefined) {
        specifiedModel = modelOverride;
    }
    else {
        var settings = (0, settings_js_1.getSettings_DEPRECATED)() || {};
        specifiedModel = process.env.ANTHROPIC_MODEL || settings.model || undefined;
    }
    // Ignore the user-specified model if it's not in the availableModels allowlist.
    if (specifiedModel && !(0, modelAllowlist_js_1.isModelAllowed)(specifiedModel)) {
        return undefined;
    }
    return specifiedModel;
}
/**
 * Get the main loop model to use for the current session.
 *
 * Model Selection Priority Order:
 * 1. Model override during session (from /model command) - highest priority
 * 2. Model override at startup (from --model flag)
 * 3. ANTHROPIC_MODEL environment variable
 * 4. Settings (from user's saved settings)
 * 5. Built-in default
 *
 * @returns The resolved model name to use
 */
function getMainLoopModel() {
    var model = getUserSpecifiedModelSetting();
    if (model !== undefined && model !== null) {
        return parseUserSpecifiedModel(model);
    }
    return getDefaultMainLoopModel();
}
function getBestModel() {
    return getDefaultOpusModel();
}
// @[MODEL LAUNCH]: Update the default Opus model (3P providers may lag so keep defaults unchanged).
function getDefaultOpusModel() {
    if (process.env.ANTHROPIC_DEFAULT_OPUS_MODEL) {
        return process.env.ANTHROPIC_DEFAULT_OPUS_MODEL;
    }
    // 3P providers (Bedrock, Vertex, Foundry) — kept as a separate branch
    // even when values match, since 3P availability lags firstParty and
    // these will diverge again at the next model launch.
    if ((0, providers_js_1.getAPIProvider)() !== 'firstParty') {
        return (0, modelStrings_js_1.getModelStrings)().opus46;
    }
    return (0, modelStrings_js_1.getModelStrings)().opus46;
}
// @[MODEL LAUNCH]: Update the default Sonnet model (3P providers may lag so keep defaults unchanged).
function getDefaultSonnetModel() {
    if (process.env.ANTHROPIC_DEFAULT_SONNET_MODEL) {
        return process.env.ANTHROPIC_DEFAULT_SONNET_MODEL;
    }
    // Default to Sonnet 4.5 for 3P since they may not have 4.6 yet
    if ((0, providers_js_1.getAPIProvider)() !== 'firstParty') {
        return (0, modelStrings_js_1.getModelStrings)().sonnet45;
    }
    return (0, modelStrings_js_1.getModelStrings)().sonnet46;
}
// @[MODEL LAUNCH]: Update the default Haiku model (3P providers may lag so keep defaults unchanged).
function getDefaultHaikuModel() {
    if (process.env.ANTHROPIC_DEFAULT_HAIKU_MODEL) {
        return process.env.ANTHROPIC_DEFAULT_HAIKU_MODEL;
    }
    // Haiku 4.5 is available on all platforms (first-party, Foundry, Bedrock, Vertex)
    return (0, modelStrings_js_1.getModelStrings)().haiku45;
}
/**
 * Get the model to use for runtime, depending on the runtime context.
 * @param params Subset of the runtime context to determine the model to use.
 * @returns The model to use
 */
function getRuntimeMainLoopModel(params) {
    var permissionMode = params.permissionMode, mainLoopModel = params.mainLoopModel, _a = params.exceeds200kTokens, exceeds200kTokens = _a === void 0 ? false : _a;
    // opusplan uses Opus in plan mode without [1m] suffix.
    if (getUserSpecifiedModelSetting() === 'opusplan' &&
        permissionMode === 'plan' &&
        !exceeds200kTokens) {
        return getDefaultOpusModel();
    }
    // sonnetplan by default
    if (getUserSpecifiedModelSetting() === 'haiku' && permissionMode === 'plan') {
        return getDefaultSonnetModel();
    }
    return mainLoopModel;
}
/**
 * Get the default main loop model setting.
 *
 * This handles the built-in default:
 * - Opus for Max and Team Premium users
 * - Sonnet 4.6 for all other users (including Team Standard, Pro, Enterprise)
 *
 * @returns The default model setting to use
 */
function getDefaultMainLoopModelSetting() {
    var _a, _b;
    // Ants default to defaultModel from flag config, or Opus 1M if not configured
    if (process.env.USER_TYPE === 'ant') {
        return ((_b = (_a = getAntModelOverrideConfig()) === null || _a === void 0 ? void 0 : _a.defaultModel) !== null && _b !== void 0 ? _b : getDefaultOpusModel() + '[1m]');
    }
    // Max users get Opus as default
    if ((0, auth_js_1.isMaxSubscriber)()) {
        return getDefaultOpusModel() + (isOpus1mMergeEnabled() ? '[1m]' : '');
    }
    // Team Premium gets Opus (same as Max)
    if ((0, auth_js_1.isTeamPremiumSubscriber)()) {
        return getDefaultOpusModel() + (isOpus1mMergeEnabled() ? '[1m]' : '');
    }
    // PAYG (1P and 3P), Enterprise, Team Standard, and Pro get Sonnet as default
    // Note that PAYG (3P) may default to an older Sonnet model
    return getDefaultSonnetModel();
}
/**
 * Synchronous operation to get the default main loop model to use
 * (bypassing any user-specified values).
 */
function getDefaultMainLoopModel() {
    return parseUserSpecifiedModel(getDefaultMainLoopModelSetting());
}
// @[MODEL LAUNCH]: Add a canonical name mapping for the new model below.
/**
 * Pure string-match that strips date/provider suffixes from a first-party model
 * name. Input must already be a 1P-format ID (e.g. 'claude-3-7-sonnet-20250219',
 * 'us.anthropic.claude-opus-4-6-v1:0'). Does not touch settings, so safe at
 * module top-level (see MODEL_COSTS in modelCost.ts).
 */
function firstPartyNameToCanonical(name) {
    name = name.toLowerCase();
    // Special cases for Claude 4+ models to differentiate versions
    // Order matters: check more specific versions first (4-5 before 4)
    if (name.includes('claude-opus-4-6')) {
        return 'claude-opus-4-6';
    }
    if (name.includes('claude-opus-4-5')) {
        return 'claude-opus-4-5';
    }
    if (name.includes('claude-opus-4-1')) {
        return 'claude-opus-4-1';
    }
    if (name.includes('claude-opus-4')) {
        return 'claude-opus-4';
    }
    if (name.includes('claude-sonnet-4-6')) {
        return 'claude-sonnet-4-6';
    }
    if (name.includes('claude-sonnet-4-5')) {
        return 'claude-sonnet-4-5';
    }
    if (name.includes('claude-sonnet-4')) {
        return 'claude-sonnet-4';
    }
    if (name.includes('claude-haiku-4-5')) {
        return 'claude-haiku-4-5';
    }
    // Claude 3.x models use a different naming scheme (claude-3-{family})
    if (name.includes('claude-3-7-sonnet')) {
        return 'claude-3-7-sonnet';
    }
    if (name.includes('claude-3-5-sonnet')) {
        return 'claude-3-5-sonnet';
    }
    if (name.includes('claude-3-5-haiku')) {
        return 'claude-3-5-haiku';
    }
    if (name.includes('claude-3-opus')) {
        return 'claude-3-opus';
    }
    if (name.includes('claude-3-sonnet')) {
        return 'claude-3-sonnet';
    }
    if (name.includes('claude-3-haiku')) {
        return 'claude-3-haiku';
    }
    var match = name.match(/(claude-(\d+-\d+-)?\w+)/);
    if (match && match[1]) {
        return match[1];
    }
    // Fall back to the original name if no pattern matches
    return name;
}
/**
 * Maps a full model string to a shorter canonical version that's unified across 1P and 3P providers.
 * For example, 'claude-3-5-haiku-20241022' and 'us.anthropic.claude-3-5-haiku-20241022-v1:0'
 * would both be mapped to 'claude-3-5-haiku'.
 * @param fullModelName The full model name (e.g., 'claude-3-5-haiku-20241022')
 * @returns The short name (e.g., 'claude-3-5-haiku') if found, or the original name if no mapping exists
 */
function getCanonicalName(fullModelName) {
    // Resolve overridden model IDs (e.g. Bedrock ARNs) back to canonical names.
    // resolved is always a 1P-format ID, so firstPartyNameToCanonical can handle it.
    return firstPartyNameToCanonical((0, modelStrings_js_1.resolveOverriddenModel)(fullModelName));
}
// @[MODEL LAUNCH]: Update the default model description strings shown to users.
function getClaudeAiUserDefaultModelDescription(fastMode) {
    if (fastMode === void 0) { fastMode = false; }
    if ((0, auth_js_1.isMaxSubscriber)() || (0, auth_js_1.isTeamPremiumSubscriber)()) {
        if (isOpus1mMergeEnabled()) {
            return "Opus 4.6 with 1M context \u00B7 Most capable for complex work".concat(fastMode ? getOpus46PricingSuffix(true) : '');
        }
        return "Opus 4.6 \u00B7 Most capable for complex work".concat(fastMode ? getOpus46PricingSuffix(true) : '');
    }
    return 'Sonnet 4.6 · Best for everyday tasks';
}
function renderDefaultModelSetting(setting) {
    if (setting === 'opusplan') {
        return 'Opus 4.6 in plan mode, else Sonnet 4.6';
    }
    return renderModelName(parseUserSpecifiedModel(setting));
}
function getOpus46PricingSuffix(fastMode) {
    if ((0, providers_js_1.getAPIProvider)() !== 'firstParty')
        return '';
    var pricing = (0, modelCost_js_1.formatModelPricing)((0, modelCost_js_1.getOpus46CostTier)(fastMode));
    var fastModeIndicator = fastMode ? " (".concat(figures_js_1.LIGHTNING_BOLT, ")") : '';
    return " \u00B7".concat(fastModeIndicator, " ").concat(pricing);
}
function isOpus1mMergeEnabled() {
    if ((0, context_js_1.is1mContextDisabled)() ||
        (0, auth_js_1.isProSubscriber)() ||
        (0, providers_js_1.getAPIProvider)() !== 'firstParty') {
        return false;
    }
    // Fail closed when a subscriber's subscription type is unknown. The VS Code
    // config-loading subprocess can have OAuth tokens with valid scopes but no
    // subscriptionType field (stale or partial refresh). Without this guard,
    // isProSubscriber() returns false for such users and the merge leaks
    // opus[1m] into the model dropdown — the API then rejects it with a
    // misleading "rate limit reached" error.
    if ((0, auth_js_1.isClaudeAISubscriber)() && (0, auth_js_1.getSubscriptionType)() === null) {
        return false;
    }
    return true;
}
function renderModelSetting(setting) {
    if (setting === 'opusplan') {
        return 'Opus Plan';
    }
    if ((0, aliases_js_1.isModelAlias)(setting)) {
        return (0, stringUtils_js_1.capitalize)(setting);
    }
    return renderModelName(setting);
}
// @[MODEL LAUNCH]: Add display name cases for the new model (base + [1m] variant if applicable).
/**
 * Returns a human-readable display name for known public models, or null
 * if the model is not recognized as a public model.
 */
function getPublicModelDisplayName(model) {
    switch (model) {
        case (0, modelStrings_js_1.getModelStrings)().opus46:
            return 'Opus 4.6';
        case (0, modelStrings_js_1.getModelStrings)().opus46 + '[1m]':
            return 'Opus 4.6 (1M context)';
        case (0, modelStrings_js_1.getModelStrings)().opus45:
            return 'Opus 4.5';
        case (0, modelStrings_js_1.getModelStrings)().opus41:
            return 'Opus 4.1';
        case (0, modelStrings_js_1.getModelStrings)().opus40:
            return 'Opus 4';
        case (0, modelStrings_js_1.getModelStrings)().sonnet46 + '[1m]':
            return 'Sonnet 4.6 (1M context)';
        case (0, modelStrings_js_1.getModelStrings)().sonnet46:
            return 'Sonnet 4.6';
        case (0, modelStrings_js_1.getModelStrings)().sonnet45 + '[1m]':
            return 'Sonnet 4.5 (1M context)';
        case (0, modelStrings_js_1.getModelStrings)().sonnet45:
            return 'Sonnet 4.5';
        case (0, modelStrings_js_1.getModelStrings)().sonnet40:
            return 'Sonnet 4';
        case (0, modelStrings_js_1.getModelStrings)().sonnet40 + '[1m]':
            return 'Sonnet 4 (1M context)';
        case (0, modelStrings_js_1.getModelStrings)().sonnet37:
            return 'Sonnet 3.7';
        case (0, modelStrings_js_1.getModelStrings)().sonnet35:
            return 'Sonnet 3.5';
        case (0, modelStrings_js_1.getModelStrings)().haiku45:
            return 'Haiku 4.5';
        case (0, modelStrings_js_1.getModelStrings)().haiku35:
            return 'Haiku 3.5';
        default:
            return null;
    }
}
function maskModelCodename(baseName) {
    // Mask only the first dash-separated segment (the codename), preserve the rest
    // e.g. capybara-v2-fast → cap*****-v2-fast
    var _a = baseName.split('-'), _b = _a[0], codename = _b === void 0 ? '' : _b, rest = _a.slice(1);
    var masked = codename.slice(0, 3) + '*'.repeat(Math.max(0, codename.length - 3));
    return __spreadArray([masked], rest, true).join('-');
}
function renderModelName(model) {
    var publicName = getPublicModelDisplayName(model);
    if (publicName) {
        return publicName;
    }
    if (process.env.USER_TYPE === 'ant') {
        var resolved = parseUserSpecifiedModel(model);
        var antModel = resolveAntModel(model);
        if (antModel) {
            var baseName = antModel.model.replace(/\[1m\]$/i, '');
            var masked = maskModelCodename(baseName);
            var suffix = (0, context_js_1.has1mContext)(resolved) ? '[1m]' : '';
            return masked + suffix;
        }
        if (resolved !== model) {
            return "".concat(model, " (").concat(resolved, ")");
        }
        return resolved;
    }
    return model;
}
/**
 * Returns a safe author name for public display (e.g., in git commit trailers).
 * Returns "Claude {ModelName}" for publicly known models, or "Claude ({model})"
 * for unknown/internal models so the exact model name is preserved.
 *
 * @param model The full model name
 * @returns "Claude {ModelName}" for public models, or "Claude ({model})" for non-public models
 */
function getPublicModelName(model) {
    var publicName = getPublicModelDisplayName(model);
    if (publicName) {
        return "Claude ".concat(publicName);
    }
    return "Claude (".concat(model, ")");
}
/**
 * Returns a full model name for use in this session, possibly after resolving
 * a model alias.
 *
 * This function intentionally does not support version numbers to align with
 * the model switcher.
 *
 * Supports [1m] suffix on any model alias (e.g., haiku[1m], sonnet[1m]) to enable
 * 1M context window without requiring each variant to be in MODEL_ALIASES.
 *
 * @param modelInput The model alias or name provided by the user.
 */
function parseUserSpecifiedModel(modelInput) {
    var modelInputTrimmed = modelInput.trim();
    var normalizedModel = modelInputTrimmed.toLowerCase();
    var has1mTag = (0, context_js_1.has1mContext)(normalizedModel);
    var modelString = has1mTag
        ? normalizedModel.replace(/\[1m]$/i, '').trim()
        : normalizedModel;
    if ((0, aliases_js_1.isModelAlias)(modelString)) {
        switch (modelString) {
            case 'opusplan':
                return getDefaultSonnetModel() + (has1mTag ? '[1m]' : ''); // Sonnet is default, Opus in plan mode
            case 'sonnet':
                return getDefaultSonnetModel() + (has1mTag ? '[1m]' : '');
            case 'haiku':
                return getDefaultHaikuModel() + (has1mTag ? '[1m]' : '');
            case 'opus':
                return getDefaultOpusModel() + (has1mTag ? '[1m]' : '');
            case 'best':
                return getBestModel();
            default:
        }
    }
    // Opus 4/4.1 are no longer available on the first-party API (same as
    // Claude.ai) — silently remap to the current Opus default. The 'opus'
    // alias already resolves to 4.6, so the only users on these explicit
    // strings pinned them in settings/env/--model/SDK before 4.5 launched.
    // 3P providers may not yet have 4.6 capacity, so pass through unchanged.
    if ((0, providers_js_1.getAPIProvider)() === 'firstParty' &&
        isLegacyOpusFirstParty(modelString) &&
        isLegacyModelRemapEnabled()) {
        return getDefaultOpusModel() + (has1mTag ? '[1m]' : '');
    }
    if (process.env.USER_TYPE === 'ant') {
        var has1mAntTag = (0, context_js_1.has1mContext)(normalizedModel);
        var baseAntModel = normalizedModel.replace(/\[1m]$/i, '').trim();
        var antModel = resolveAntModel(baseAntModel);
        if (antModel) {
            var suffix = has1mAntTag ? '[1m]' : '';
            return antModel.model + suffix;
        }
        // Fall through to the alias string if we cannot load the config. The API calls
        // will fail with this string, but we should hear about it through feedback and
        // can tell the user to restart/wait for flag cache refresh to get the latest values.
    }
    // Preserve original case for custom model names (e.g., Azure Foundry deployment IDs)
    // Only strip [1m] suffix if present, maintaining case of the base model
    if (has1mTag) {
        return modelInputTrimmed.replace(/\[1m\]$/i, '').trim() + '[1m]';
    }
    return modelInputTrimmed;
}
/**
 * Resolves a skill's `model:` frontmatter against the current model, carrying
 * the `[1m]` suffix over when the target family supports it.
 *
 * A skill author writing `model: opus` means "use opus-class reasoning" — not
 * "downgrade to 200K". If the user is on opus[1m] at 230K tokens and invokes a
 * skill with `model: opus`, passing the bare alias through drops the effective
 * context window from 1M to 200K, which trips autocompact at 23% apparent usage
 * and surfaces "Context limit reached" even though nothing overflowed.
 *
 * We only carry [1m] when the target actually supports it (sonnet/opus). A skill
 * with `model: haiku` on a 1M session still downgrades — haiku has no 1M variant,
 * so the autocompact that follows is correct. Skills that already specify [1m]
 * are left untouched.
 */
function resolveSkillModelOverride(skillModel, currentModel) {
    if ((0, context_js_1.has1mContext)(skillModel) || !(0, context_js_1.has1mContext)(currentModel)) {
        return skillModel;
    }
    // modelSupports1M matches on canonical IDs ('claude-opus-4-6', 'claude-sonnet-4');
    // a bare 'opus' alias falls through getCanonicalName unmatched. Resolve first.
    if ((0, context_js_1.modelSupports1M)(parseUserSpecifiedModel(skillModel))) {
        return skillModel + '[1m]';
    }
    return skillModel;
}
var LEGACY_OPUS_FIRSTPARTY = [
    'claude-opus-4-20250514',
    'claude-opus-4-1-20250805',
    'claude-opus-4-0',
    'claude-opus-4-1',
];
function isLegacyOpusFirstParty(model) {
    return LEGACY_OPUS_FIRSTPARTY.includes(model);
}
/**
 * Opt-out for the legacy Opus 4.0/4.1 → current Opus remap.
 */
function isLegacyModelRemapEnabled() {
    return !(0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_DISABLE_LEGACY_MODEL_REMAP);
}
function modelDisplayString(model) {
    if (model === null) {
        if (process.env.USER_TYPE === 'ant') {
            return "Default for Ants (".concat(renderDefaultModelSetting(getDefaultMainLoopModelSetting()), ")");
        }
        else if ((0, auth_js_1.isClaudeAISubscriber)()) {
            return "Default (".concat(getClaudeAiUserDefaultModelDescription(), ")");
        }
        return "Default (".concat(getDefaultMainLoopModel(), ")");
    }
    var resolvedModel = parseUserSpecifiedModel(model);
    return model === resolvedModel ? resolvedModel : "".concat(model, " (").concat(resolvedModel, ")");
}
// @[MODEL LAUNCH]: Add a marketing name mapping for the new model below.
function getMarketingNameForModel(modelId) {
    if ((0, providers_js_1.getAPIProvider)() === 'foundry') {
        // deployment ID is user-defined in Foundry, so it may have no relation to the actual model
        return undefined;
    }
    var has1m = modelId.toLowerCase().includes('[1m]');
    var canonical = getCanonicalName(modelId);
    if (canonical.includes('claude-opus-4-6')) {
        return has1m ? 'Opus 4.6 (with 1M context)' : 'Opus 4.6';
    }
    if (canonical.includes('claude-opus-4-5')) {
        return 'Opus 4.5';
    }
    if (canonical.includes('claude-opus-4-1')) {
        return 'Opus 4.1';
    }
    if (canonical.includes('claude-opus-4')) {
        return 'Opus 4';
    }
    if (canonical.includes('claude-sonnet-4-6')) {
        return has1m ? 'Sonnet 4.6 (with 1M context)' : 'Sonnet 4.6';
    }
    if (canonical.includes('claude-sonnet-4-5')) {
        return has1m ? 'Sonnet 4.5 (with 1M context)' : 'Sonnet 4.5';
    }
    if (canonical.includes('claude-sonnet-4')) {
        return has1m ? 'Sonnet 4 (with 1M context)' : 'Sonnet 4';
    }
    if (canonical.includes('claude-3-7-sonnet')) {
        return 'Claude 3.7 Sonnet';
    }
    if (canonical.includes('claude-3-5-sonnet')) {
        return 'Claude 3.5 Sonnet';
    }
    if (canonical.includes('claude-haiku-4-5')) {
        return 'Haiku 4.5';
    }
    if (canonical.includes('claude-3-5-haiku')) {
        return 'Claude 3.5 Haiku';
    }
    return undefined;
}
function normalizeModelStringForAPI(model) {
    return model.replace(/\[(1|2)m\]/gi, '');
}
