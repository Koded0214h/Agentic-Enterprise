"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EFFORT_LEVELS = void 0;
exports.modelSupportsEffort = modelSupportsEffort;
exports.modelSupportsMaxEffort = modelSupportsMaxEffort;
exports.isEffortLevel = isEffortLevel;
exports.parseEffortValue = parseEffortValue;
exports.toPersistableEffort = toPersistableEffort;
exports.getInitialEffortSetting = getInitialEffortSetting;
exports.resolvePickerEffortPersistence = resolvePickerEffortPersistence;
exports.getEffortEnvOverride = getEffortEnvOverride;
exports.resolveAppliedEffort = resolveAppliedEffort;
exports.getDisplayedEffortLevel = getDisplayedEffortLevel;
exports.getEffortSuffix = getEffortSuffix;
exports.isValidNumericEffort = isValidNumericEffort;
exports.convertEffortValueToLevel = convertEffortValueToLevel;
exports.getEffortLevelDescription = getEffortLevelDescription;
exports.getEffortValueDescription = getEffortValueDescription;
exports.getOpusDefaultEffortConfig = getOpusDefaultEffortConfig;
exports.getDefaultEffortForModel = getDefaultEffortForModel;
// biome-ignore-all assist/source/organizeImports: ANT-ONLY import markers must not be reordered
var thinking_js_1 = require("./thinking.js");
var settings_js_1 = require("./settings/settings.js");
var auth_js_1 = require("./auth.js");
var growthbook_js_1 = require("src/services/analytics/growthbook.js");
var providers_js_1 = require("./model/providers.js");
var modelSupportOverrides_js_1 = require("./model/modelSupportOverrides.js");
var envUtils_js_1 = require("./envUtils.js");
exports.EFFORT_LEVELS = [
    'low',
    'medium',
    'high',
    'max',
];
// @[MODEL LAUNCH]: Add the new model to the allowlist if it supports the effort parameter.
function modelSupportsEffort(model) {
    var m = model.toLowerCase();
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_ALWAYS_ENABLE_EFFORT)) {
        return true;
    }
    var supported3P = (0, modelSupportOverrides_js_1.get3PModelCapabilityOverride)(model, 'effort');
    if (supported3P !== undefined) {
        return supported3P;
    }
    // Supported by a subset of Claude 4 models
    if (m.includes('opus-4-6') || m.includes('sonnet-4-6')) {
        return true;
    }
    // Exclude any other known legacy models (haiku, older opus/sonnet variants)
    if (m.includes('haiku') || m.includes('sonnet') || m.includes('opus')) {
        return false;
    }
    // IMPORTANT: Do not change the default effort support without notifying
    // the model launch DRI and research. This is a sensitive setting that can
    // greatly affect model quality and bashing.
    // Default to true for unknown model strings on 1P.
    // Do not default to true for 3P as they have different formats for their
    // model strings (ex. anthropics/claude-code#30795)
    return (0, providers_js_1.getAPIProvider)() === 'firstParty';
}
// @[MODEL LAUNCH]: Add the new model to the allowlist if it supports 'max' effort.
// Per API docs, 'max' is Opus 4.6 only for public models — other models return an error.
function modelSupportsMaxEffort(model) {
    var supported3P = (0, modelSupportOverrides_js_1.get3PModelCapabilityOverride)(model, 'max_effort');
    if (supported3P !== undefined) {
        return supported3P;
    }
    if (model.toLowerCase().includes('opus-4-6')) {
        return true;
    }
    if (process.env.USER_TYPE === 'ant' && resolveAntModel(model)) {
        return true;
    }
    return false;
}
function isEffortLevel(value) {
    return exports.EFFORT_LEVELS.includes(value);
}
function parseEffortValue(value) {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }
    if (typeof value === 'number' && isValidNumericEffort(value)) {
        return value;
    }
    var str = String(value).toLowerCase();
    if (isEffortLevel(str)) {
        return str;
    }
    var numericValue = parseInt(str, 10);
    if (!isNaN(numericValue) && isValidNumericEffort(numericValue)) {
        return numericValue;
    }
    return undefined;
}
/**
 * Numeric values are model-default only and not persisted.
 * 'max' is session-scoped for external users (ants can persist it).
 * Write sites call this before saving to settings so the Zod schema
 * (which only accepts string levels) never rejects a write.
 */
function toPersistableEffort(value) {
    if (value === 'low' || value === 'medium' || value === 'high') {
        return value;
    }
    if (value === 'max' && process.env.USER_TYPE === 'ant') {
        return value;
    }
    return undefined;
}
function getInitialEffortSetting() {
    // toPersistableEffort filters 'max' for non-ants on read, so a manually
    // edited settings.json doesn't leak session-scoped max into a fresh session.
    return toPersistableEffort((0, settings_js_1.getInitialSettings)().effortLevel);
}
/**
 * Decide what effort level (if any) to persist when the user selects a model
 * in ModelPicker. Keeps an explicit prior /effort choice sticky even when it
 * matches the picked model's default, while letting purely-default and
 * session-ephemeral effort (CLI --effort, EffortCallout default) fall through
 * to undefined so it follows future model-default changes.
 *
 * priorPersisted must come from userSettings on disk
 * (getSettingsForSource('userSettings')?.effortLevel), NOT merged settings
 * (project/policy layers would leak into the user's global settings.json)
 * and NOT AppState.effortValue (includes session-scoped sources that
 * deliberately do not write to settings.json).
 */
function resolvePickerEffortPersistence(picked, modelDefault, priorPersisted, toggledInPicker) {
    var hadExplicit = priorPersisted !== undefined || toggledInPicker;
    return hadExplicit || picked !== modelDefault ? picked : undefined;
}
function getEffortEnvOverride() {
    var envOverride = process.env.CLAUDE_CODE_EFFORT_LEVEL;
    return (envOverride === null || envOverride === void 0 ? void 0 : envOverride.toLowerCase()) === 'unset' ||
        (envOverride === null || envOverride === void 0 ? void 0 : envOverride.toLowerCase()) === 'auto'
        ? null
        : parseEffortValue(envOverride);
}
/**
 * Resolve the effort value that will actually be sent to the API for a given
 * model, following the full precedence chain:
 *   env CLAUDE_CODE_EFFORT_LEVEL → appState.effortValue → model default
 *
 * Returns undefined when no effort parameter should be sent (env set to
 * 'unset', or no default exists for the model).
 */
function resolveAppliedEffort(model, appStateEffortValue) {
    var _a;
    var envOverride = getEffortEnvOverride();
    if (envOverride === null) {
        return undefined;
    }
    var resolved = (_a = envOverride !== null && envOverride !== void 0 ? envOverride : appStateEffortValue) !== null && _a !== void 0 ? _a : getDefaultEffortForModel(model);
    // API rejects 'max' on non-Opus-4.6 models — downgrade to 'high'.
    if (resolved === 'max' && !modelSupportsMaxEffort(model)) {
        return 'high';
    }
    return resolved;
}
/**
 * Resolve the effort level to show the user. Wraps resolveAppliedEffort
 * with the 'high' fallback (what the API uses when no effort param is sent).
 * Single source of truth for the status bar and /effort output (CC-1088).
 */
function getDisplayedEffortLevel(model, appStateEffort) {
    var _a;
    var resolved = (_a = resolveAppliedEffort(model, appStateEffort)) !== null && _a !== void 0 ? _a : 'high';
    return convertEffortValueToLevel(resolved);
}
/**
 * Build the ` with {level} effort` suffix shown in Logo/Spinner.
 * Returns empty string if the user hasn't explicitly set an effort value.
 * Delegates to resolveAppliedEffort() so the displayed level matches what
 * the API actually receives (including max→high clamp for non-Opus models).
 */
function getEffortSuffix(model, effortValue) {
    if (effortValue === undefined)
        return '';
    var resolved = resolveAppliedEffort(model, effortValue);
    if (resolved === undefined)
        return '';
    return " with ".concat(convertEffortValueToLevel(resolved), " effort");
}
function isValidNumericEffort(value) {
    return Number.isInteger(value);
}
function convertEffortValueToLevel(value) {
    if (typeof value === 'string') {
        // Runtime guard: value may come from remote config (GrowthBook) where
        // TypeScript types can't help us. Coerce unknown strings to 'high'
        // rather than passing them through unchecked.
        return isEffortLevel(value) ? value : 'high';
    }
    if (process.env.USER_TYPE === 'ant' && typeof value === 'number') {
        if (value <= 50)
            return 'low';
        if (value <= 85)
            return 'medium';
        if (value <= 100)
            return 'high';
        return 'max';
    }
    return 'high';
}
/**
 * Get user-facing description for effort levels
 *
 * @param level The effort level to describe
 * @returns Human-readable description
 */
function getEffortLevelDescription(level) {
    switch (level) {
        case 'low':
            return 'Quick, straightforward implementation with minimal overhead';
        case 'medium':
            return 'Balanced approach with standard implementation and testing';
        case 'high':
            return 'Comprehensive implementation with extensive testing and documentation';
        case 'max':
            return 'Maximum capability with deepest reasoning (Opus 4.6 only)';
    }
}
/**
 * Get user-facing description for effort values (both string and numeric)
 *
 * @param value The effort value to describe
 * @returns Human-readable description
 */
function getEffortValueDescription(value) {
    if (process.env.USER_TYPE === 'ant' && typeof value === 'number') {
        return "[ANT-ONLY] Numeric effort value of ".concat(value);
    }
    if (typeof value === 'string') {
        return getEffortLevelDescription(value);
    }
    return 'Balanced approach with standard implementation and testing';
}
var OPUS_DEFAULT_EFFORT_CONFIG_DEFAULT = {
    enabled: true,
    dialogTitle: 'We recommend medium effort for Opus',
    dialogDescription: 'Effort determines how long Claude thinks for when completing your task. We recommend medium effort for most tasks to balance speed and intelligence and maximize rate limits. Use ultrathink to trigger high effort when needed.',
};
function getOpusDefaultEffortConfig() {
    var config = (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_grey_step2', OPUS_DEFAULT_EFFORT_CONFIG_DEFAULT);
    return __assign(__assign({}, OPUS_DEFAULT_EFFORT_CONFIG_DEFAULT), config);
}
// @[MODEL LAUNCH]: Update the default effort levels for new models
function getDefaultEffortForModel(model) {
    if (process.env.USER_TYPE === 'ant') {
        var config = getAntModelOverrideConfig();
        var isDefaultModel = (config === null || config === void 0 ? void 0 : config.defaultModel) !== undefined &&
            model.toLowerCase() === config.defaultModel.toLowerCase();
        if (isDefaultModel && (config === null || config === void 0 ? void 0 : config.defaultModelEffortLevel)) {
            return config.defaultModelEffortLevel;
        }
        var antModel = resolveAntModel(model);
        if (antModel) {
            if (antModel.defaultEffortLevel) {
                return antModel.defaultEffortLevel;
            }
            if (antModel.defaultEffortValue !== undefined) {
                return antModel.defaultEffortValue;
            }
        }
        // Always default ants to undefined/high
        return undefined;
    }
    // IMPORTANT: Do not change the default effort level without notifying
    // the model launch DRI and research. Default effort is a sensitive setting
    // that can greatly affect model quality and bashing.
    // Default effort on Opus 4.6 to medium for Pro.
    // Max/Team also get medium when the tengu_grey_step2 config is enabled.
    if (model.toLowerCase().includes('opus-4-6')) {
        if ((0, auth_js_1.isProSubscriber)()) {
            return 'medium';
        }
        if (getOpusDefaultEffortConfig().enabled &&
            ((0, auth_js_1.isMaxSubscriber)() || (0, auth_js_1.isTeamSubscriber)())) {
            return 'medium';
        }
    }
    // When ultrathink feature is on, default effort to medium (ultrathink bumps to high)
    if ((0, thinking_js_1.isUltrathinkEnabled)() && modelSupportsEffort(model)) {
        return 'medium';
    }
    // Fallback to undefined, which means we don't set an effort level. This
    // should resolve to high effort level in the API.
    return undefined;
}
