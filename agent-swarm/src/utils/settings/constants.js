"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLAUDE_CODE_SETTINGS_SCHEMA_URL = exports.SOURCES = exports.SETTING_SOURCES = void 0;
exports.getSettingSourceName = getSettingSourceName;
exports.getSourceDisplayName = getSourceDisplayName;
exports.getSettingSourceDisplayNameLowercase = getSettingSourceDisplayNameLowercase;
exports.getSettingSourceDisplayNameCapitalized = getSettingSourceDisplayNameCapitalized;
exports.parseSettingSourcesFlag = parseSettingSourcesFlag;
exports.getEnabledSettingSources = getEnabledSettingSources;
exports.isSettingSourceEnabled = isSettingSourceEnabled;
var state_js_1 = require("../../bootstrap/state.js");
/**
 * All possible sources where settings can come from
 * Order matters - later sources override earlier ones
 */
exports.SETTING_SOURCES = [
    // User settings (global)
    'userSettings',
    // Project settings (shared per-directory)
    'projectSettings',
    // Local settings (gitignored)
    'localSettings',
    // Flag settings (from --settings flag)
    'flagSettings',
    // Policy settings (managed-settings.json or remote settings from API)
    'policySettings',
];
function getSettingSourceName(source) {
    switch (source) {
        case 'userSettings':
            return 'user';
        case 'projectSettings':
            return 'project';
        case 'localSettings':
            return 'project, gitignored';
        case 'flagSettings':
            return 'cli flag';
        case 'policySettings':
            return 'managed';
    }
}
/**
 * Get short display name for a setting source (capitalized, for context/skills UI)
 * @param source The setting source or 'plugin'/'built-in'
 * @returns Short capitalized display name like 'User', 'Project', 'Plugin'
 */
function getSourceDisplayName(source) {
    switch (source) {
        case 'userSettings':
            return 'User';
        case 'projectSettings':
            return 'Project';
        case 'localSettings':
            return 'Local';
        case 'flagSettings':
            return 'Flag';
        case 'policySettings':
            return 'Managed';
        case 'plugin':
            return 'Plugin';
        case 'built-in':
            return 'Built-in';
    }
}
/**
 * Get display name for a setting or permission rule source (lowercase, for inline use)
 * @param source The setting source or permission rule source
 * @returns Display name for the source in lowercase
 */
function getSettingSourceDisplayNameLowercase(source) {
    switch (source) {
        case 'userSettings':
            return 'user settings';
        case 'projectSettings':
            return 'shared project settings';
        case 'localSettings':
            return 'project local settings';
        case 'flagSettings':
            return 'command line arguments';
        case 'policySettings':
            return 'enterprise managed settings';
        case 'cliArg':
            return 'CLI argument';
        case 'command':
            return 'command configuration';
        case 'session':
            return 'current session';
    }
}
/**
 * Get display name for a setting or permission rule source (capitalized, for UI labels)
 * @param source The setting source or permission rule source
 * @returns Display name for the source with first letter capitalized
 */
function getSettingSourceDisplayNameCapitalized(source) {
    switch (source) {
        case 'userSettings':
            return 'User settings';
        case 'projectSettings':
            return 'Shared project settings';
        case 'localSettings':
            return 'Project local settings';
        case 'flagSettings':
            return 'Command line arguments';
        case 'policySettings':
            return 'Enterprise managed settings';
        case 'cliArg':
            return 'CLI argument';
        case 'command':
            return 'Command configuration';
        case 'session':
            return 'Current session';
    }
}
/**
 * Parse the --setting-sources CLI flag into SettingSource array
 * @param flag Comma-separated string like "user,project,local"
 * @returns Array of SettingSource values
 */
function parseSettingSourcesFlag(flag) {
    if (flag === '')
        return [];
    var names = flag.split(',').map(function (s) { return s.trim(); });
    var result = [];
    for (var _i = 0, names_1 = names; _i < names_1.length; _i++) {
        var name_1 = names_1[_i];
        switch (name_1) {
            case 'user':
                result.push('userSettings');
                break;
            case 'project':
                result.push('projectSettings');
                break;
            case 'local':
                result.push('localSettings');
                break;
            default:
                throw new Error("Invalid setting source: ".concat(name_1, ". Valid options are: user, project, local"));
        }
    }
    return result;
}
/**
 * Get enabled setting sources with policy/flag always included
 * @returns Array of enabled SettingSource values
 */
function getEnabledSettingSources() {
    var allowed = (0, state_js_1.getAllowedSettingSources)();
    // Always include policy and flag settings
    var result = new Set(allowed);
    result.add('policySettings');
    result.add('flagSettings');
    return Array.from(result);
}
/**
 * Check if a specific source is enabled
 * @param source The source to check
 * @returns true if the source should be loaded
 */
function isSettingSourceEnabled(source) {
    var enabled = getEnabledSettingSources();
    return enabled.includes(source);
}
/**
 * List of sources where permission rules can be saved, in display order.
 * Used by permission-rule and hook-save UIs to present source options.
 */
exports.SOURCES = [
    'localSettings',
    'projectSettings',
    'userSettings',
];
/**
 * The JSON Schema URL for Claude Code settings
 * You can edit the contents at https://github.com/SchemaStore/schemastore/blob/master/src/schemas/json/claude-code-settings.json
 */
exports.CLAUDE_CODE_SETTINGS_SCHEMA_URL = 'https://json.schemastore.org/claude-code-settings.json';
