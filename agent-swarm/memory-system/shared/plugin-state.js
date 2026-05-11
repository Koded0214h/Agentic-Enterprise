"use strict";
/**
 * Plugin state utilities for checking Claude Code's plugin settings.
 * Kept minimal — no heavy dependencies — so hooks can check quickly.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPluginDisabledInClaudeSettings = isPluginDisabledInClaudeSettings;
var fs_1 = require("fs");
var path_1 = require("path");
var os_1 = require("os");
var PLUGIN_SETTINGS_KEY = 'claude-mem@thedotmack';
/**
 * Check if claude-mem is disabled in Claude Code's settings (#781).
 * Sync read + JSON parse for speed — called before any async work.
 * Returns true only if the plugin is explicitly disabled (enabledPlugins[key] === false).
 */
function isPluginDisabledInClaudeSettings() {
    var _a;
    try {
        var claudeConfigDir = process.env.CLAUDE_CONFIG_DIR || (0, path_1.join)((0, os_1.homedir)(), '.claude');
        var settingsPath = (0, path_1.join)(claudeConfigDir, 'settings.json');
        if (!(0, fs_1.existsSync)(settingsPath))
            return false;
        var raw = (0, fs_1.readFileSync)(settingsPath, 'utf-8');
        var settings = JSON.parse(raw);
        return ((_a = settings === null || settings === void 0 ? void 0 : settings.enabledPlugins) === null || _a === void 0 ? void 0 : _a[PLUGIN_SETTINGS_KEY]) === false;
    }
    catch (_b) {
        // If settings can't be read/parsed, assume not disabled
        return false;
    }
}
