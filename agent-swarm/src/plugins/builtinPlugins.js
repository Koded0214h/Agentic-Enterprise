"use strict";
/**
 * Built-in Plugin Registry
 *
 * Manages built-in plugins that ship with the CLI and can be enabled/disabled
 * by users via the /plugin UI.
 *
 * Built-in plugins differ from bundled skills (src/skills/bundled/) in that:
 * - They appear in the /plugin UI under a "Built-in" section
 * - Users can enable/disable them (persisted to user settings)
 * - They can provide multiple components (skills, hooks, MCP servers)
 *
 * Plugin IDs use the format `{name}@builtin` to distinguish them from
 * marketplace plugins (`{name}@{marketplace}`).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BUILTIN_MARKETPLACE_NAME = void 0;
exports.registerBuiltinPlugin = registerBuiltinPlugin;
exports.isBuiltinPluginId = isBuiltinPluginId;
exports.getBuiltinPluginDefinition = getBuiltinPluginDefinition;
exports.getBuiltinPlugins = getBuiltinPlugins;
exports.getBuiltinPluginSkillCommands = getBuiltinPluginSkillCommands;
exports.clearBuiltinPlugins = clearBuiltinPlugins;
var settings_js_1 = require("../utils/settings/settings.js");
var BUILTIN_PLUGINS = new Map();
exports.BUILTIN_MARKETPLACE_NAME = 'builtin';
/**
 * Register a built-in plugin. Call this from initBuiltinPlugins() at startup.
 */
function registerBuiltinPlugin(definition) {
    BUILTIN_PLUGINS.set(definition.name, definition);
}
/**
 * Check if a plugin ID represents a built-in plugin (ends with @builtin).
 */
function isBuiltinPluginId(pluginId) {
    return pluginId.endsWith("@".concat(exports.BUILTIN_MARKETPLACE_NAME));
}
/**
 * Get a specific built-in plugin definition by name.
 * Useful for the /plugin UI to show the skills/hooks/MCP list without
 * a marketplace lookup.
 */
function getBuiltinPluginDefinition(name) {
    return BUILTIN_PLUGINS.get(name);
}
/**
 * Get all registered built-in plugins as LoadedPlugin objects, split into
 * enabled/disabled based on user settings (with defaultEnabled as fallback).
 * Plugins whose isAvailable() returns false are omitted entirely.
 */
function getBuiltinPlugins() {
    var _a, _b;
    var settings = (0, settings_js_1.getSettings_DEPRECATED)();
    var enabled = [];
    var disabled = [];
    for (var _i = 0, BUILTIN_PLUGINS_1 = BUILTIN_PLUGINS; _i < BUILTIN_PLUGINS_1.length; _i++) {
        var _c = BUILTIN_PLUGINS_1[_i], name_1 = _c[0], definition = _c[1];
        if (definition.isAvailable && !definition.isAvailable()) {
            continue;
        }
        var pluginId = "".concat(name_1, "@").concat(exports.BUILTIN_MARKETPLACE_NAME);
        var userSetting = (_a = settings === null || settings === void 0 ? void 0 : settings.enabledPlugins) === null || _a === void 0 ? void 0 : _a[pluginId];
        // Enabled state: user preference > plugin default > true
        var isEnabled = userSetting !== undefined
            ? userSetting === true
            : ((_b = definition.defaultEnabled) !== null && _b !== void 0 ? _b : true);
        var plugin = {
            name: name_1,
            manifest: {
                name: name_1,
                description: definition.description,
                version: definition.version,
            },
            path: exports.BUILTIN_MARKETPLACE_NAME, // sentinel — no filesystem path
            source: pluginId,
            repository: pluginId,
            enabled: isEnabled,
            isBuiltin: true,
            hooksConfig: definition.hooks,
            mcpServers: definition.mcpServers,
        };
        if (isEnabled) {
            enabled.push(plugin);
        }
        else {
            disabled.push(plugin);
        }
    }
    return { enabled: enabled, disabled: disabled };
}
/**
 * Get skills from enabled built-in plugins as Command objects.
 * Skills from disabled plugins are not returned.
 */
function getBuiltinPluginSkillCommands() {
    var enabled = getBuiltinPlugins().enabled;
    var commands = [];
    for (var _i = 0, enabled_1 = enabled; _i < enabled_1.length; _i++) {
        var plugin = enabled_1[_i];
        var definition = BUILTIN_PLUGINS.get(plugin.name);
        if (!(definition === null || definition === void 0 ? void 0 : definition.skills))
            continue;
        for (var _a = 0, _b = definition.skills; _a < _b.length; _a++) {
            var skill = _b[_a];
            commands.push(skillDefinitionToCommand(skill));
        }
    }
    return commands;
}
/**
 * Clear built-in plugins registry (for testing).
 */
function clearBuiltinPlugins() {
    BUILTIN_PLUGINS.clear();
}
// --
function skillDefinitionToCommand(definition) {
    var _a, _b, _c, _d, _e;
    return {
        type: 'prompt',
        name: definition.name,
        description: definition.description,
        hasUserSpecifiedDescription: true,
        allowedTools: (_a = definition.allowedTools) !== null && _a !== void 0 ? _a : [],
        argumentHint: definition.argumentHint,
        whenToUse: definition.whenToUse,
        model: definition.model,
        disableModelInvocation: (_b = definition.disableModelInvocation) !== null && _b !== void 0 ? _b : false,
        userInvocable: (_c = definition.userInvocable) !== null && _c !== void 0 ? _c : true,
        contentLength: 0,
        // 'bundled' not 'builtin' — 'builtin' in Command.source means hardcoded
        // slash commands (/help, /clear). Using 'bundled' keeps these skills in
        // the Skill tool's listing, analytics name logging, and prompt-truncation
        // exemption. The user-toggleable aspect is tracked on LoadedPlugin.isBuiltin.
        source: 'bundled',
        loadedFrom: 'bundled',
        hooks: definition.hooks,
        context: definition.context,
        agent: definition.agent,
        isEnabled: (_d = definition.isEnabled) !== null && _d !== void 0 ? _d : (function () { return true; }),
        isHidden: !((_e = definition.userInvocable) !== null && _e !== void 0 ? _e : true),
        progressMessage: 'running',
        getPromptForCommand: definition.getPromptForCommand,
    };
}
