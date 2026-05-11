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
exports.shouldAllowManagedPermissionRulesOnly = shouldAllowManagedPermissionRulesOnly;
exports.shouldShowAlwaysAllowOptions = shouldShowAlwaysAllowOptions;
exports.loadAllPermissionRulesFromDisk = loadAllPermissionRulesFromDisk;
exports.getPermissionRulesForSource = getPermissionRulesForSource;
exports.deletePermissionRuleFromSettings = deletePermissionRuleFromSettings;
exports.addPermissionRulesToSettings = addPermissionRulesToSettings;
var fileRead_js_1 = require("../fileRead.js");
var fsOperations_js_1 = require("../fsOperations.js");
var json_js_1 = require("../json.js");
var log_js_1 = require("../log.js");
var constants_js_1 = require("../settings/constants.js");
var settings_js_1 = require("../settings/settings.js");
var permissionRuleParser_js_1 = require("./permissionRuleParser.js");
/**
 * Returns true if allowManagedPermissionRulesOnly is enabled in managed settings (policySettings).
 * When enabled, only permission rules from managed settings are respected.
 */
function shouldAllowManagedPermissionRulesOnly() {
    var _a;
    return (((_a = (0, settings_js_1.getSettingsForSource)('policySettings')) === null || _a === void 0 ? void 0 : _a.allowManagedPermissionRulesOnly) ===
        true);
}
/**
 * Returns true if "always allow" options should be shown in permission prompts.
 * When allowManagedPermissionRulesOnly is enabled, these options are hidden.
 */
function shouldShowAlwaysAllowOptions() {
    return !shouldAllowManagedPermissionRulesOnly();
}
var SUPPORTED_RULE_BEHAVIORS = [
    'allow',
    'deny',
    'ask',
];
/**
 * Lenient version of getSettingsForSource that doesn't fail on ANY validation errors.
 * Simply parses the JSON and returns it as-is without schema validation.
 *
 * Used when loading settings to append new rules (avoids losing existing rules
 * due to validation failures in unrelated fields like hooks).
 *
 * FOR EDITING ONLY - do not use this for reading settings for execution.
 */
function getSettingsForSourceLenient_FOR_EDITING_ONLY_NOT_FOR_READING(source) {
    var filePath = (0, settings_js_1.getSettingsFilePathForSource)(source);
    if (!filePath) {
        return null;
    }
    try {
        var resolvedPath = (0, fsOperations_js_1.safeResolvePath)((0, fsOperations_js_1.getFsImplementation)(), filePath).resolvedPath;
        var content = (0, fileRead_js_1.readFileSync)(resolvedPath);
        if (content.trim() === '') {
            return {};
        }
        var data = (0, json_js_1.safeParseJSON)(content, false);
        // Return raw parsed JSON without validation to preserve all existing settings
        // This is safe because we're only using this for reading/appending, not for execution
        return data && typeof data === 'object' ? data : null;
    }
    catch (_a) {
        return null;
    }
}
/**
 * Converts permissions JSON to an array of PermissionRule objects
 * @param data The parsed permissions data
 * @param source The source of these rules
 * @returns Array of PermissionRule objects
 */
function settingsJsonToRules(data, source) {
    if (!data || !data.permissions) {
        return [];
    }
    var permissions = data.permissions;
    var rules = [];
    for (var _i = 0, SUPPORTED_RULE_BEHAVIORS_1 = SUPPORTED_RULE_BEHAVIORS; _i < SUPPORTED_RULE_BEHAVIORS_1.length; _i++) {
        var behavior = SUPPORTED_RULE_BEHAVIORS_1[_i];
        var behaviorArray = permissions[behavior];
        if (behaviorArray) {
            for (var _a = 0, behaviorArray_1 = behaviorArray; _a < behaviorArray_1.length; _a++) {
                var ruleString = behaviorArray_1[_a];
                rules.push({
                    source: source,
                    ruleBehavior: behavior,
                    ruleValue: (0, permissionRuleParser_js_1.permissionRuleValueFromString)(ruleString),
                });
            }
        }
    }
    return rules;
}
/**
 * Loads all permission rules from all relevant sources (managed and project settings)
 * @returns Array of all permission rules
 */
function loadAllPermissionRulesFromDisk() {
    // If allowManagedPermissionRulesOnly is set, only use managed permission rules
    if (shouldAllowManagedPermissionRulesOnly()) {
        return getPermissionRulesForSource('policySettings');
    }
    // Otherwise, load from all enabled sources (backwards compatible)
    var rules = [];
    for (var _i = 0, _a = (0, constants_js_1.getEnabledSettingSources)(); _i < _a.length; _i++) {
        var source = _a[_i];
        rules.push.apply(rules, getPermissionRulesForSource(source));
    }
    return rules;
}
/**
 * Loads permission rules from a specific source
 * @param source The source to load from
 * @returns Array of permission rules from that source
 */
function getPermissionRulesForSource(source) {
    var settingsData = (0, settings_js_1.getSettingsForSource)(source);
    return settingsJsonToRules(settingsData, source);
}
// Editable sources that can be modified (excludes policySettings and flagSettings)
var EDITABLE_SOURCES = [
    'userSettings',
    'projectSettings',
    'localSettings',
];
/**
 * Deletes a rule from the project permissions file
 * @param rule The rule to delete
 * @returns Promise resolving to a boolean indicating success
 */
function deletePermissionRuleFromSettings(rule) {
    var _a;
    // Runtime check to ensure source is actually editable
    if (!EDITABLE_SOURCES.includes(rule.source)) {
        return false;
    }
    var ruleString = (0, permissionRuleParser_js_1.permissionRuleValueToString)(rule.ruleValue);
    var settingsData = (0, settings_js_1.getSettingsForSource)(rule.source);
    // If there's no settings data or permissions, nothing to do
    if (!settingsData || !settingsData.permissions) {
        return false;
    }
    var behaviorArray = settingsData.permissions[rule.ruleBehavior];
    if (!behaviorArray) {
        return false;
    }
    // Normalize raw settings entries via roundtrip parse→serialize so legacy
    // names (e.g. "KillShell") match their canonical form ("TaskStop").
    var normalizeEntry = function (raw) {
        return (0, permissionRuleParser_js_1.permissionRuleValueToString)((0, permissionRuleParser_js_1.permissionRuleValueFromString)(raw));
    };
    if (!behaviorArray.some(function (raw) { return normalizeEntry(raw) === ruleString; })) {
        return false;
    }
    try {
        // Keep a copy of the original permissions data to preserve unrecognized keys
        var updatedSettingsData = __assign(__assign({}, settingsData), { permissions: __assign(__assign({}, settingsData.permissions), (_a = {}, _a[rule.ruleBehavior] = behaviorArray.filter(function (raw) { return normalizeEntry(raw) !== ruleString; }), _a)) });
        var error = (0, settings_js_1.updateSettingsForSource)(rule.source, updatedSettingsData).error;
        if (error) {
            // Error already logged inside updateSettingsForSource
            return false;
        }
        return true;
    }
    catch (error) {
        (0, log_js_1.logError)(error);
        return false;
    }
}
function getEmptyPermissionSettingsJson() {
    return {
        permissions: {},
    };
}
/**
 * Adds rules to the project permissions file
 * @param ruleValues The rule values to add
 * @returns Promise resolving to a boolean indicating success
 */
function addPermissionRulesToSettings(_a, source) {
    var _b;
    var ruleValues = _a.ruleValues, ruleBehavior = _a.ruleBehavior;
    // When allowManagedPermissionRulesOnly is enabled, don't persist new permission rules
    if (shouldAllowManagedPermissionRulesOnly()) {
        return false;
    }
    if (ruleValues.length < 1) {
        // No rules to add
        return true;
    }
    var ruleStrings = ruleValues.map(permissionRuleParser_js_1.permissionRuleValueToString);
    // First try the normal settings loader which validates the schema
    // If validation fails, fall back to lenient loading to preserve existing rules
    // even if some fields (like hooks) have validation errors
    var settingsData = (0, settings_js_1.getSettingsForSource)(source) ||
        getSettingsForSourceLenient_FOR_EDITING_ONLY_NOT_FOR_READING(source) ||
        getEmptyPermissionSettingsJson();
    try {
        // Ensure permissions object exists
        var existingPermissions = settingsData.permissions || {};
        var existingRules = existingPermissions[ruleBehavior] || [];
        // Filter out duplicates - normalize existing entries via roundtrip
        // parse→serialize so legacy names match their canonical form.
        var existingRulesSet_1 = new Set(existingRules.map(function (raw) {
            return (0, permissionRuleParser_js_1.permissionRuleValueToString)((0, permissionRuleParser_js_1.permissionRuleValueFromString)(raw));
        }));
        var newRules = ruleStrings.filter(function (rule) { return !existingRulesSet_1.has(rule); });
        // If no new rules to add, return success
        if (newRules.length === 0) {
            return true;
        }
        // Keep a copy of the original settings data to preserve unrecognized keys
        var updatedSettingsData = __assign(__assign({}, settingsData), { permissions: __assign(__assign({}, existingPermissions), (_b = {}, _b[ruleBehavior] = __spreadArray(__spreadArray([], existingRules, true), newRules, true), _b)) });
        var result = (0, settings_js_1.updateSettingsForSource)(source, updatedSettingsData);
        if (result.error) {
            throw result.error;
        }
        return true;
    }
    catch (error) {
        (0, log_js_1.logError)(error);
        return false;
    }
}
