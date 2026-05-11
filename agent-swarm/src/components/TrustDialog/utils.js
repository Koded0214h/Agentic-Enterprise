"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHooksSources = getHooksSources;
exports.getBashPermissionSources = getBashPermissionSources;
exports.formatListWithAnd = formatListWithAnd;
exports.getOtelHeadersHelperSources = getOtelHeadersHelperSources;
exports.getApiKeyHelperSources = getApiKeyHelperSources;
exports.getAwsCommandsSources = getAwsCommandsSources;
exports.getGcpCommandsSources = getGcpCommandsSources;
exports.getDangerousEnvVarsSources = getDangerousEnvVarsSources;
var settings_js_1 = require("src/utils/settings/settings.js");
var toolName_js_1 = require("../../tools/BashTool/toolName.js");
var managedEnvConstants_js_1 = require("../../utils/managedEnvConstants.js");
var permissionsLoader_js_1 = require("../../utils/permissions/permissionsLoader.js");
function hasHooks(settings) {
    if (settings === null || settings.disableAllHooks) {
        return false;
    }
    if (settings.statusLine) {
        return true;
    }
    if (settings.fileSuggestion) {
        return true;
    }
    if (!settings.hooks) {
        return false;
    }
    for (var _i = 0, _a = Object.values(settings.hooks); _i < _a.length; _i++) {
        var hookConfig = _a[_i];
        if (hookConfig.length > 0) {
            return true;
        }
    }
    return false;
}
function getHooksSources() {
    var sources = [];
    var projectSettings = (0, settings_js_1.getSettingsForSource)('projectSettings');
    if (hasHooks(projectSettings)) {
        sources.push('.claude/settings.json');
    }
    var localSettings = (0, settings_js_1.getSettingsForSource)('localSettings');
    if (hasHooks(localSettings)) {
        sources.push('.claude/settings.local.json');
    }
    return sources;
}
function hasBashPermission(rules) {
    return rules.some(function (rule) {
        return rule.ruleBehavior === 'allow' &&
            (rule.ruleValue.toolName === toolName_js_1.BASH_TOOL_NAME ||
                rule.ruleValue.toolName.startsWith(toolName_js_1.BASH_TOOL_NAME + '('));
    });
}
/**
 * Get which setting sources have bash allow rules.
 * Returns an array of file paths that have bash permissions.
 */
function getBashPermissionSources() {
    var sources = [];
    var projectRules = (0, permissionsLoader_js_1.getPermissionRulesForSource)('projectSettings');
    if (hasBashPermission(projectRules)) {
        sources.push('.claude/settings.json');
    }
    var localRules = (0, permissionsLoader_js_1.getPermissionRulesForSource)('localSettings');
    if (hasBashPermission(localRules)) {
        sources.push('.claude/settings.local.json');
    }
    return sources;
}
/**
 * Format a list of items with proper "and" conjunction.
 * @param items - Array of items to format
 * @param limit - Optional limit for how many items to show before summarizing (ignored if 0)
 */
function formatListWithAnd(items, limit) {
    if (items.length === 0)
        return '';
    // Ignore limit if it's 0
    var effectiveLimit = limit === 0 ? undefined : limit;
    // If no limit or items are within limit, use normal formatting
    if (!effectiveLimit || items.length <= effectiveLimit) {
        if (items.length === 1)
            return items[0];
        if (items.length === 2)
            return "".concat(items[0], " and ").concat(items[1]);
        var lastItem = items[items.length - 1];
        var allButLast = items.slice(0, -1);
        return "".concat(allButLast.join(', '), ", and ").concat(lastItem);
    }
    // If we have more items than the limit, show first few and count the rest
    var shown = items.slice(0, effectiveLimit);
    var remaining = items.length - effectiveLimit;
    if (shown.length === 1) {
        return "".concat(shown[0], " and ").concat(remaining, " more");
    }
    return "".concat(shown.join(', '), ", and ").concat(remaining, " more");
}
/**
 * Check if settings have otelHeadersHelper configured
 */
function hasOtelHeadersHelper(settings) {
    return !!(settings === null || settings === void 0 ? void 0 : settings.otelHeadersHelper);
}
/**
 * Get which setting sources have otelHeadersHelper configured.
 * Returns an array of file paths that have otelHeadersHelper.
 */
function getOtelHeadersHelperSources() {
    var sources = [];
    var projectSettings = (0, settings_js_1.getSettingsForSource)('projectSettings');
    if (hasOtelHeadersHelper(projectSettings)) {
        sources.push('.claude/settings.json');
    }
    var localSettings = (0, settings_js_1.getSettingsForSource)('localSettings');
    if (hasOtelHeadersHelper(localSettings)) {
        sources.push('.claude/settings.local.json');
    }
    return sources;
}
/**
 * Check if settings have apiKeyHelper configured
 */
function hasApiKeyHelper(settings) {
    return !!(settings === null || settings === void 0 ? void 0 : settings.apiKeyHelper);
}
/**
 * Get which setting sources have apiKeyHelper configured.
 * Returns an array of file paths that have apiKeyHelper.
 */
function getApiKeyHelperSources() {
    var sources = [];
    var projectSettings = (0, settings_js_1.getSettingsForSource)('projectSettings');
    if (hasApiKeyHelper(projectSettings)) {
        sources.push('.claude/settings.json');
    }
    var localSettings = (0, settings_js_1.getSettingsForSource)('localSettings');
    if (hasApiKeyHelper(localSettings)) {
        sources.push('.claude/settings.local.json');
    }
    return sources;
}
/**
 * Check if settings have AWS commands configured
 */
function hasAwsCommands(settings) {
    return !!((settings === null || settings === void 0 ? void 0 : settings.awsAuthRefresh) || (settings === null || settings === void 0 ? void 0 : settings.awsCredentialExport));
}
/**
 * Get which setting sources have AWS commands configured.
 * Returns an array of file paths that have awsAuthRefresh or awsCredentialExport.
 */
function getAwsCommandsSources() {
    var sources = [];
    var projectSettings = (0, settings_js_1.getSettingsForSource)('projectSettings');
    if (hasAwsCommands(projectSettings)) {
        sources.push('.claude/settings.json');
    }
    var localSettings = (0, settings_js_1.getSettingsForSource)('localSettings');
    if (hasAwsCommands(localSettings)) {
        sources.push('.claude/settings.local.json');
    }
    return sources;
}
/**
 * Check if settings have GCP commands configured
 */
function hasGcpCommands(settings) {
    return !!(settings === null || settings === void 0 ? void 0 : settings.gcpAuthRefresh);
}
/**
 * Get which setting sources have GCP commands configured.
 * Returns an array of file paths that have gcpAuthRefresh.
 */
function getGcpCommandsSources() {
    var sources = [];
    var projectSettings = (0, settings_js_1.getSettingsForSource)('projectSettings');
    if (hasGcpCommands(projectSettings)) {
        sources.push('.claude/settings.json');
    }
    var localSettings = (0, settings_js_1.getSettingsForSource)('localSettings');
    if (hasGcpCommands(localSettings)) {
        sources.push('.claude/settings.local.json');
    }
    return sources;
}
/**
 * Check if settings have dangerous environment variables configured.
 * Any env var NOT in SAFE_ENV_VARS is considered dangerous.
 */
function hasDangerousEnvVars(settings) {
    if (!(settings === null || settings === void 0 ? void 0 : settings.env)) {
        return false;
    }
    return Object.keys(settings.env).some(function (key) { return !managedEnvConstants_js_1.SAFE_ENV_VARS.has(key.toUpperCase()); });
}
/**
 * Get which setting sources have dangerous environment variables configured.
 * Returns an array of file paths that have env vars not in SAFE_ENV_VARS.
 */
function getDangerousEnvVarsSources() {
    var sources = [];
    var projectSettings = (0, settings_js_1.getSettingsForSource)('projectSettings');
    if (hasDangerousEnvVars(projectSettings)) {
        sources.push('.claude/settings.json');
    }
    var localSettings = (0, settings_js_1.getSettingsForSource)('localSettings');
    if (hasDangerousEnvVars(localSettings)) {
        sources.push('.claude/settings.local.json');
    }
    return sources;
}
