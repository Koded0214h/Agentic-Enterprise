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
exports.getDefaultOptionForUser = getDefaultOptionForUser;
exports.getSonnet46_1MOption = getSonnet46_1MOption;
exports.getOpus46_1MOption = getOpus46_1MOption;
exports.getMaxSonnet46_1MOption = getMaxSonnet46_1MOption;
exports.getMaxOpus46_1MOption = getMaxOpus46_1MOption;
exports.getModelOptions = getModelOptions;
// biome-ignore-all assist/source/organizeImports: ANT-ONLY import markers must not be reordered
var state_js_1 = require("../../bootstrap/state.js");
var auth_js_1 = require("../auth.js");
var modelStrings_js_1 = require("./modelStrings.js");
var modelCost_js_1 = require("../modelCost.js");
var settings_js_1 = require("../settings/settings.js");
var check1mAccess_js_1 = require("./check1mAccess.js");
var providers_js_1 = require("./providers.js");
var modelAllowlist_js_1 = require("./modelAllowlist.js");
var model_js_1 = require("./model.js");
var context_js_1 = require("../context.js");
var config_js_1 = require("../config.js");
function getDefaultOptionForUser(fastMode) {
    if (fastMode === void 0) { fastMode = false; }
    if (process.env.USER_TYPE === 'ant') {
        var currentModel = (0, model_js_1.renderDefaultModelSetting)((0, model_js_1.getDefaultMainLoopModelSetting)());
        return {
            value: null,
            label: 'Default (recommended)',
            description: "Use the default model for Ants (currently ".concat(currentModel, ")"),
            descriptionForModel: "Default model (currently ".concat(currentModel, ")"),
        };
    }
    // Subscribers
    if ((0, auth_js_1.isClaudeAISubscriber)()) {
        return {
            value: null,
            label: 'Default (recommended)',
            description: (0, model_js_1.getClaudeAiUserDefaultModelDescription)(fastMode),
        };
    }
    // PAYG
    var is3P = (0, providers_js_1.getAPIProvider)() !== 'firstParty';
    return {
        value: null,
        label: 'Default (recommended)',
        description: "Use the default model (currently ".concat((0, model_js_1.renderDefaultModelSetting)((0, model_js_1.getDefaultMainLoopModelSetting)()), ")").concat(is3P ? '' : " \u00B7 ".concat((0, modelCost_js_1.formatModelPricing)(modelCost_js_1.COST_TIER_3_15))),
    };
}
function getCustomSonnetOption() {
    var _a, _b, _c;
    var is3P = (0, providers_js_1.getAPIProvider)() !== 'firstParty';
    var customSonnetModel = process.env.ANTHROPIC_DEFAULT_SONNET_MODEL;
    // When a 3P user has a custom sonnet model string, show it directly
    if (is3P && customSonnetModel) {
        var is1m = (0, context_js_1.has1mContext)(customSonnetModel);
        return {
            value: 'sonnet',
            label: (_a = process.env.ANTHROPIC_DEFAULT_SONNET_MODEL_NAME) !== null && _a !== void 0 ? _a : customSonnetModel,
            description: (_b = process.env.ANTHROPIC_DEFAULT_SONNET_MODEL_DESCRIPTION) !== null && _b !== void 0 ? _b : "Custom Sonnet model".concat(is1m ? ' (1M context)' : ''),
            descriptionForModel: "".concat((_c = process.env.ANTHROPIC_DEFAULT_SONNET_MODEL_DESCRIPTION) !== null && _c !== void 0 ? _c : "Custom Sonnet model".concat(is1m ? ' with 1M context' : ''), " (").concat(customSonnetModel, ")"),
        };
    }
}
// @[MODEL LAUNCH]: Update or add model option functions (getSonnetXXOption, getOpusXXOption, etc.)
// with the new model's label and description. These appear in the /model picker.
function getSonnet46Option() {
    var is3P = (0, providers_js_1.getAPIProvider)() !== 'firstParty';
    return {
        value: is3P ? (0, modelStrings_js_1.getModelStrings)().sonnet46 : 'sonnet',
        label: 'Sonnet',
        description: "Sonnet 4.6 \u00B7 Best for everyday tasks".concat(is3P ? '' : " \u00B7 ".concat((0, modelCost_js_1.formatModelPricing)(modelCost_js_1.COST_TIER_3_15))),
        descriptionForModel: 'Sonnet 4.6 - best for everyday tasks. Generally recommended for most coding tasks',
    };
}
function getCustomOpusOption() {
    var _a, _b, _c;
    var is3P = (0, providers_js_1.getAPIProvider)() !== 'firstParty';
    var customOpusModel = process.env.ANTHROPIC_DEFAULT_OPUS_MODEL;
    // When a 3P user has a custom opus model string, show it directly
    if (is3P && customOpusModel) {
        var is1m = (0, context_js_1.has1mContext)(customOpusModel);
        return {
            value: 'opus',
            label: (_a = process.env.ANTHROPIC_DEFAULT_OPUS_MODEL_NAME) !== null && _a !== void 0 ? _a : customOpusModel,
            description: (_b = process.env.ANTHROPIC_DEFAULT_OPUS_MODEL_DESCRIPTION) !== null && _b !== void 0 ? _b : "Custom Opus model".concat(is1m ? ' (1M context)' : ''),
            descriptionForModel: "".concat((_c = process.env.ANTHROPIC_DEFAULT_OPUS_MODEL_DESCRIPTION) !== null && _c !== void 0 ? _c : "Custom Opus model".concat(is1m ? ' with 1M context' : ''), " (").concat(customOpusModel, ")"),
        };
    }
}
function getOpus41Option() {
    return {
        value: 'opus',
        label: 'Opus 4.1',
        description: "Opus 4.1 \u00B7 Legacy",
        descriptionForModel: 'Opus 4.1 - legacy version',
    };
}
function getOpus46Option(fastMode) {
    if (fastMode === void 0) { fastMode = false; }
    var is3P = (0, providers_js_1.getAPIProvider)() !== 'firstParty';
    return {
        value: is3P ? (0, modelStrings_js_1.getModelStrings)().opus46 : 'opus',
        label: 'Opus',
        description: "Opus 4.6 \u00B7 Most capable for complex work".concat((0, model_js_1.getOpus46PricingSuffix)(fastMode)),
        descriptionForModel: 'Opus 4.6 - most capable for complex work',
    };
}
function getSonnet46_1MOption() {
    var is3P = (0, providers_js_1.getAPIProvider)() !== 'firstParty';
    return {
        value: is3P ? (0, modelStrings_js_1.getModelStrings)().sonnet46 + '[1m]' : 'sonnet[1m]',
        label: 'Sonnet (1M context)',
        description: "Sonnet 4.6 for long sessions".concat(is3P ? '' : " \u00B7 ".concat((0, modelCost_js_1.formatModelPricing)(modelCost_js_1.COST_TIER_3_15))),
        descriptionForModel: 'Sonnet 4.6 with 1M context window - for long sessions with large codebases',
    };
}
function getOpus46_1MOption(fastMode) {
    if (fastMode === void 0) { fastMode = false; }
    var is3P = (0, providers_js_1.getAPIProvider)() !== 'firstParty';
    return {
        value: is3P ? (0, modelStrings_js_1.getModelStrings)().opus46 + '[1m]' : 'opus[1m]',
        label: 'Opus (1M context)',
        description: "Opus 4.6 for long sessions".concat((0, model_js_1.getOpus46PricingSuffix)(fastMode)),
        descriptionForModel: 'Opus 4.6 with 1M context window - for long sessions with large codebases',
    };
}
function getCustomHaikuOption() {
    var _a, _b, _c;
    var is3P = (0, providers_js_1.getAPIProvider)() !== 'firstParty';
    var customHaikuModel = process.env.ANTHROPIC_DEFAULT_HAIKU_MODEL;
    // When a 3P user has a custom haiku model string, show it directly
    if (is3P && customHaikuModel) {
        return {
            value: 'haiku',
            label: (_a = process.env.ANTHROPIC_DEFAULT_HAIKU_MODEL_NAME) !== null && _a !== void 0 ? _a : customHaikuModel,
            description: (_b = process.env.ANTHROPIC_DEFAULT_HAIKU_MODEL_DESCRIPTION) !== null && _b !== void 0 ? _b : 'Custom Haiku model',
            descriptionForModel: "".concat((_c = process.env.ANTHROPIC_DEFAULT_HAIKU_MODEL_DESCRIPTION) !== null && _c !== void 0 ? _c : 'Custom Haiku model', " (").concat(customHaikuModel, ")"),
        };
    }
}
function getHaiku45Option() {
    var is3P = (0, providers_js_1.getAPIProvider)() !== 'firstParty';
    return {
        value: 'haiku',
        label: 'Haiku',
        description: "Haiku 4.5 \u00B7 Fastest for quick answers".concat(is3P ? '' : " \u00B7 ".concat((0, modelCost_js_1.formatModelPricing)(modelCost_js_1.COST_HAIKU_45))),
        descriptionForModel: 'Haiku 4.5 - fastest for quick answers. Lower cost but less capable than Sonnet 4.6.',
    };
}
function getHaiku35Option() {
    var is3P = (0, providers_js_1.getAPIProvider)() !== 'firstParty';
    return {
        value: 'haiku',
        label: 'Haiku',
        description: "Haiku 3.5 for simple tasks".concat(is3P ? '' : " \u00B7 ".concat((0, modelCost_js_1.formatModelPricing)(modelCost_js_1.COST_HAIKU_35))),
        descriptionForModel: 'Haiku 3.5 - faster and lower cost, but less capable than Sonnet. Use for simple tasks.',
    };
}
function getHaikuOption() {
    // Return correct Haiku option based on provider
    var haikuModel = (0, model_js_1.getDefaultHaikuModel)();
    return haikuModel === (0, modelStrings_js_1.getModelStrings)().haiku45
        ? getHaiku45Option()
        : getHaiku35Option();
}
function getMaxOpusOption(fastMode) {
    if (fastMode === void 0) { fastMode = false; }
    return {
        value: 'opus',
        label: 'Opus',
        description: "Opus 4.6 \u00B7 Most capable for complex work".concat(fastMode ? (0, model_js_1.getOpus46PricingSuffix)(true) : ''),
    };
}
function getMaxSonnet46_1MOption() {
    var is3P = (0, providers_js_1.getAPIProvider)() !== 'firstParty';
    var billingInfo = (0, auth_js_1.isClaudeAISubscriber)() ? ' · Billed as extra usage' : '';
    return {
        value: 'sonnet[1m]',
        label: 'Sonnet (1M context)',
        description: "Sonnet 4.6 with 1M context".concat(billingInfo).concat(is3P ? '' : " \u00B7 ".concat((0, modelCost_js_1.formatModelPricing)(modelCost_js_1.COST_TIER_3_15))),
    };
}
function getMaxOpus46_1MOption(fastMode) {
    if (fastMode === void 0) { fastMode = false; }
    var billingInfo = (0, auth_js_1.isClaudeAISubscriber)() ? ' · Billed as extra usage' : '';
    return {
        value: 'opus[1m]',
        label: 'Opus (1M context)',
        description: "Opus 4.6 with 1M context".concat(billingInfo).concat((0, model_js_1.getOpus46PricingSuffix)(fastMode)),
    };
}
function getMergedOpus1MOption(fastMode) {
    if (fastMode === void 0) { fastMode = false; }
    var is3P = (0, providers_js_1.getAPIProvider)() !== 'firstParty';
    return {
        value: is3P ? (0, modelStrings_js_1.getModelStrings)().opus46 + '[1m]' : 'opus[1m]',
        label: 'Opus (1M context)',
        description: "Opus 4.6 with 1M context \u00B7 Most capable for complex work".concat(!is3P && fastMode ? (0, model_js_1.getOpus46PricingSuffix)(fastMode) : ''),
        descriptionForModel: 'Opus 4.6 with 1M context - most capable for complex work',
    };
}
var MaxSonnet46Option = {
    value: 'sonnet',
    label: 'Sonnet',
    description: 'Sonnet 4.6 · Best for everyday tasks',
};
var MaxHaiku45Option = {
    value: 'haiku',
    label: 'Haiku',
    description: 'Haiku 4.5 · Fastest for quick answers',
};
function getOpusPlanOption() {
    return {
        value: 'opusplan',
        label: 'Opus Plan Mode',
        description: 'Use Opus 4.6 in plan mode, Sonnet 4.6 otherwise',
    };
}
// @[MODEL LAUNCH]: Update the model picker lists below to include/reorder options for the new model.
// Each user tier (ant, Max/Team Premium, Pro/Team Standard/Enterprise, PAYG 1P, PAYG 3P) has its own list.
function getModelOptionsBase(fastMode) {
    if (fastMode === void 0) { fastMode = false; }
    if (process.env.USER_TYPE === 'ant') {
        // Build options from antModels config
        var antModelOptions = getAntModels().map(function (m) {
            var _a;
            return ({
                value: m.alias,
                label: m.label,
                description: (_a = m.description) !== null && _a !== void 0 ? _a : "[ANT-ONLY] ".concat(m.label, " (").concat(m.model, ")"),
            });
        });
        return __spreadArray(__spreadArray([
            getDefaultOptionForUser()
        ], antModelOptions, true), [
            getMergedOpus1MOption(fastMode),
            getSonnet46Option(),
            getSonnet46_1MOption(),
            getHaiku45Option(),
        ], false);
    }
    if ((0, auth_js_1.isClaudeAISubscriber)()) {
        if ((0, auth_js_1.isMaxSubscriber)() || (0, auth_js_1.isTeamPremiumSubscriber)()) {
            // Max and Team Premium users: Opus is default, show Sonnet as alternative
            var premiumOptions = [getDefaultOptionForUser(fastMode)];
            if (!(0, model_js_1.isOpus1mMergeEnabled)() && (0, check1mAccess_js_1.checkOpus1mAccess)()) {
                premiumOptions.push(getMaxOpus46_1MOption(fastMode));
            }
            premiumOptions.push(MaxSonnet46Option);
            if ((0, check1mAccess_js_1.checkSonnet1mAccess)()) {
                premiumOptions.push(getMaxSonnet46_1MOption());
            }
            premiumOptions.push(MaxHaiku45Option);
            return premiumOptions;
        }
        // Pro/Team Standard/Enterprise users: Sonnet is default, show Opus as alternative
        var standardOptions = [getDefaultOptionForUser(fastMode)];
        if ((0, check1mAccess_js_1.checkSonnet1mAccess)()) {
            standardOptions.push(getMaxSonnet46_1MOption());
        }
        if ((0, model_js_1.isOpus1mMergeEnabled)()) {
            standardOptions.push(getMergedOpus1MOption(fastMode));
        }
        else {
            standardOptions.push(getMaxOpusOption(fastMode));
            if ((0, check1mAccess_js_1.checkOpus1mAccess)()) {
                standardOptions.push(getMaxOpus46_1MOption(fastMode));
            }
        }
        standardOptions.push(MaxHaiku45Option);
        return standardOptions;
    }
    // PAYG 1P API: Default (Sonnet) + Sonnet 1M + Opus 4.6 + Opus 1M + Haiku
    if ((0, providers_js_1.getAPIProvider)() === 'firstParty') {
        var payg1POptions = [getDefaultOptionForUser(fastMode)];
        if ((0, check1mAccess_js_1.checkSonnet1mAccess)()) {
            payg1POptions.push(getSonnet46_1MOption());
        }
        if ((0, model_js_1.isOpus1mMergeEnabled)()) {
            payg1POptions.push(getMergedOpus1MOption(fastMode));
        }
        else {
            payg1POptions.push(getOpus46Option(fastMode));
            if ((0, check1mAccess_js_1.checkOpus1mAccess)()) {
                payg1POptions.push(getOpus46_1MOption(fastMode));
            }
        }
        payg1POptions.push(getHaiku45Option());
        return payg1POptions;
    }
    // PAYG 3P: Default (Sonnet 4.5) + Sonnet (3P custom) or Sonnet 4.6/1M + Opus (3P custom) or Opus 4.1/Opus 4.6/Opus1M + Haiku + Opus 4.1
    var payg3pOptions = [getDefaultOptionForUser(fastMode)];
    var customSonnet = getCustomSonnetOption();
    if (customSonnet !== undefined) {
        payg3pOptions.push(customSonnet);
    }
    else {
        // Add Sonnet 4.6 since Sonnet 4.5 is the default
        payg3pOptions.push(getSonnet46Option());
        if ((0, check1mAccess_js_1.checkSonnet1mAccess)()) {
            payg3pOptions.push(getSonnet46_1MOption());
        }
    }
    var customOpus = getCustomOpusOption();
    if (customOpus !== undefined) {
        payg3pOptions.push(customOpus);
    }
    else {
        // Add Opus 4.1, Opus 4.6 and Opus 4.6 1M
        payg3pOptions.push(getOpus41Option()); // This is the default opus
        payg3pOptions.push(getOpus46Option(fastMode));
        if ((0, check1mAccess_js_1.checkOpus1mAccess)()) {
            payg3pOptions.push(getOpus46_1MOption(fastMode));
        }
    }
    var customHaiku = getCustomHaikuOption();
    if (customHaiku !== undefined) {
        payg3pOptions.push(customHaiku);
    }
    else {
        payg3pOptions.push(getHaikuOption());
    }
    return payg3pOptions;
}
// @[MODEL LAUNCH]: Add the new model ID to the appropriate family pattern below
// so the "newer version available" hint works correctly.
/**
 * Map a full model name to its family alias and the marketing name of the
 * version the alias currently resolves to. Used to detect when a user has
 * a specific older version pinned and a newer one is available.
 */
function getModelFamilyInfo(model) {
    var canonical = (0, model_js_1.getCanonicalName)(model);
    // Sonnet family
    if (canonical.includes('claude-sonnet-4-6') ||
        canonical.includes('claude-sonnet-4-5') ||
        canonical.includes('claude-sonnet-4-') ||
        canonical.includes('claude-3-7-sonnet') ||
        canonical.includes('claude-3-5-sonnet')) {
        var currentName = (0, model_js_1.getMarketingNameForModel)((0, model_js_1.getDefaultSonnetModel)());
        if (currentName) {
            return { alias: 'Sonnet', currentVersionName: currentName };
        }
    }
    // Opus family
    if (canonical.includes('claude-opus-4')) {
        var currentName = (0, model_js_1.getMarketingNameForModel)((0, model_js_1.getDefaultOpusModel)());
        if (currentName) {
            return { alias: 'Opus', currentVersionName: currentName };
        }
    }
    // Haiku family
    if (canonical.includes('claude-haiku') ||
        canonical.includes('claude-3-5-haiku')) {
        var currentName = (0, model_js_1.getMarketingNameForModel)((0, model_js_1.getDefaultHaikuModel)());
        if (currentName) {
            return { alias: 'Haiku', currentVersionName: currentName };
        }
    }
    return null;
}
/**
 * Returns a ModelOption for a known Anthropic model with a human-readable
 * label, and an upgrade hint if a newer version is available via the alias.
 * Returns null if the model is not recognized.
 */
function getKnownModelOption(model) {
    var marketingName = (0, model_js_1.getMarketingNameForModel)(model);
    if (!marketingName)
        return null;
    var familyInfo = getModelFamilyInfo(model);
    if (!familyInfo) {
        return {
            value: model,
            label: marketingName,
            description: model,
        };
    }
    // Check if the alias currently resolves to a different (newer) version
    if (marketingName !== familyInfo.currentVersionName) {
        return {
            value: model,
            label: marketingName,
            description: "Newer version available \u00B7 select ".concat(familyInfo.alias, " for ").concat(familyInfo.currentVersionName),
        };
    }
    // Same version as the alias — just show the friendly name
    return {
        value: model,
        label: marketingName,
        description: model,
    };
}
function getModelOptions(fastMode) {
    var _a, _b, _c;
    if (fastMode === void 0) { fastMode = false; }
    var options = getModelOptionsBase(fastMode);
    // Add the custom model from the ANTHROPIC_CUSTOM_MODEL_OPTION env var
    var envCustomModel = process.env.ANTHROPIC_CUSTOM_MODEL_OPTION;
    if (envCustomModel &&
        !options.some(function (existing) { return existing.value === envCustomModel; })) {
        options.push({
            value: envCustomModel,
            label: (_a = process.env.ANTHROPIC_CUSTOM_MODEL_OPTION_NAME) !== null && _a !== void 0 ? _a : envCustomModel,
            description: (_b = process.env.ANTHROPIC_CUSTOM_MODEL_OPTION_DESCRIPTION) !== null && _b !== void 0 ? _b : "Custom model (".concat(envCustomModel, ")"),
        });
    }
    var _loop_1 = function (opt) {
        if (!options.some(function (existing) { return existing.value === opt.value; })) {
            options.push(opt);
        }
    };
    // Append additional model options fetched during bootstrap
    for (var _i = 0, _d = (_c = (0, config_js_1.getGlobalConfig)().additionalModelOptionsCache) !== null && _c !== void 0 ? _c : []; _i < _d.length; _i++) {
        var opt = _d[_i];
        _loop_1(opt);
    }
    // Add custom model from either the current model value or the initial one
    // if it is not already in the options.
    var customModel = null;
    var currentMainLoopModel = (0, model_js_1.getUserSpecifiedModelSetting)();
    var initialMainLoopModel = (0, state_js_1.getInitialMainLoopModel)();
    if (currentMainLoopModel !== undefined && currentMainLoopModel !== null) {
        customModel = currentMainLoopModel;
    }
    else if (initialMainLoopModel !== null) {
        customModel = initialMainLoopModel;
    }
    if (customModel === null || options.some(function (opt) { return opt.value === customModel; })) {
        return filterModelOptionsByAllowlist(options);
    }
    else if (customModel === 'opusplan') {
        return filterModelOptionsByAllowlist(__spreadArray(__spreadArray([], options, true), [getOpusPlanOption()], false));
    }
    else if (customModel === 'opus' && (0, providers_js_1.getAPIProvider)() === 'firstParty') {
        return filterModelOptionsByAllowlist(__spreadArray(__spreadArray([], options, true), [
            getMaxOpusOption(fastMode),
        ], false));
    }
    else if (customModel === 'opus[1m]' && (0, providers_js_1.getAPIProvider)() === 'firstParty') {
        return filterModelOptionsByAllowlist(__spreadArray(__spreadArray([], options, true), [
            getMergedOpus1MOption(fastMode),
        ], false));
    }
    else {
        // Try to show a human-readable label for known Anthropic models, with an
        // upgrade hint if the alias now resolves to a newer version.
        var knownOption = getKnownModelOption(customModel);
        if (knownOption) {
            options.push(knownOption);
        }
        else {
            options.push({
                value: customModel,
                label: customModel,
                description: 'Custom model',
            });
        }
        return filterModelOptionsByAllowlist(options);
    }
}
/**
 * Filter model options by the availableModels allowlist.
 * Always preserves the "Default" option (value: null).
 */
function filterModelOptionsByAllowlist(options) {
    var settings = (0, settings_js_1.getSettings_DEPRECATED)() || {};
    if (!settings.availableModels) {
        return options; // No restrictions
    }
    return options.filter(function (opt) {
        return opt.value === null || (opt.value !== null && (0, modelAllowlist_js_1.isModelAllowed)(opt.value));
    });
}
