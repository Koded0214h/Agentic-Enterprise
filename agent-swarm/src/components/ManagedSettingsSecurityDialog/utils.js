"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractDangerousSettings = extractDangerousSettings;
exports.hasDangerousSettings = hasDangerousSettings;
exports.hasDangerousSettingsChanged = hasDangerousSettingsChanged;
exports.formatDangerousSettingsList = formatDangerousSettingsList;
var managedEnvConstants_js_1 = require("../../utils/managedEnvConstants.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
/**
 * Extract dangerous settings from a settings object.
 *
 * Dangerous env vars are determined by checking against SAFE_ENV_VARS -
 * any env var NOT in SAFE_ENV_VARS is considered dangerous.
 * See managedEnv.ts for the authoritative list and threat categories.
 */
function extractDangerousSettings(settings) {
    if (!settings) {
        return {
            shellSettings: {},
            envVars: {},
            hasHooks: false,
        };
    }
    // Extract dangerous shell settings
    var shellSettings = {};
    for (var _i = 0, DANGEROUS_SHELL_SETTINGS_1 = managedEnvConstants_js_1.DANGEROUS_SHELL_SETTINGS; _i < DANGEROUS_SHELL_SETTINGS_1.length; _i++) {
        var key = DANGEROUS_SHELL_SETTINGS_1[_i];
        var value = settings[key];
        if (typeof value === 'string' && value.length > 0) {
            shellSettings[key] = value;
        }
    }
    // Extract dangerous env vars - any var NOT in SAFE_ENV_VARS is dangerous
    var envVars = {};
    if (settings.env && typeof settings.env === 'object') {
        for (var _a = 0, _b = Object.entries(settings.env); _a < _b.length; _a++) {
            var _c = _b[_a], key = _c[0], value = _c[1];
            if (typeof value === 'string' && value.length > 0) {
                // Check if this env var is NOT in the safe list
                if (!managedEnvConstants_js_1.SAFE_ENV_VARS.has(key.toUpperCase())) {
                    envVars[key] = value;
                }
            }
        }
    }
    // Check for hooks
    var hasHooks = settings.hooks !== undefined &&
        settings.hooks !== null &&
        typeof settings.hooks === 'object' &&
        Object.keys(settings.hooks).length > 0;
    return {
        shellSettings: shellSettings,
        envVars: envVars,
        hasHooks: hasHooks,
        hooks: hasHooks ? settings.hooks : undefined,
    };
}
/**
 * Check if settings contain any dangerous settings
 */
function hasDangerousSettings(dangerous) {
    return (Object.keys(dangerous.shellSettings).length > 0 ||
        Object.keys(dangerous.envVars).length > 0 ||
        dangerous.hasHooks);
}
/**
 * Compare two sets of dangerous settings to see if the new settings
 * have changed or added dangerous settings compared to the old settings
 */
function hasDangerousSettingsChanged(oldSettings, newSettings) {
    var oldDangerous = extractDangerousSettings(oldSettings);
    var newDangerous = extractDangerousSettings(newSettings);
    // If new settings don't have any dangerous settings, no prompt needed
    if (!hasDangerousSettings(newDangerous)) {
        return false;
    }
    // If old settings didn't have dangerous settings but new does, prompt needed
    if (!hasDangerousSettings(oldDangerous)) {
        return true;
    }
    // Compare the dangerous settings - any change triggers a prompt
    var oldJson = (0, slowOperations_js_1.jsonStringify)({
        shellSettings: oldDangerous.shellSettings,
        envVars: oldDangerous.envVars,
        hooks: oldDangerous.hooks,
    });
    var newJson = (0, slowOperations_js_1.jsonStringify)({
        shellSettings: newDangerous.shellSettings,
        envVars: newDangerous.envVars,
        hooks: newDangerous.hooks,
    });
    return oldJson !== newJson;
}
/**
 * Format dangerous settings as a human-readable list for the UI
 * Only returns setting names, not values
 */
function formatDangerousSettingsList(dangerous) {
    var items = [];
    // Shell settings (names only)
    for (var _i = 0, _a = Object.keys(dangerous.shellSettings); _i < _a.length; _i++) {
        var key = _a[_i];
        items.push(key);
    }
    // Env vars (names only)
    for (var _b = 0, _c = Object.keys(dangerous.envVars); _b < _c.length; _b++) {
        var key = _c[_b];
        items.push(key);
    }
    // Hooks
    if (dangerous.hasHooks) {
        items.push('hooks');
    }
    return items;
}
