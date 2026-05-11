"use strict";
/**
 * ContextConfigLoader - Loads and validates context configuration
 *
 * Handles loading settings from file with mode-based filtering for observation types.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadContextConfig = loadContextConfig;
var path_1 = require("path");
var os_1 = require("os");
var SettingsDefaultsManager_js_1 = require("../../shared/SettingsDefaultsManager.js");
var ModeManager_js_1 = require("../domain/ModeManager.js");
/**
 * Load all context configuration settings
 * Priority: ~/.claude-mem/settings.json > env var > defaults
 */
function loadContextConfig() {
    var settingsPath = path_1.default.join((0, os_1.homedir)(), '.claude-mem', 'settings.json');
    var settings = SettingsDefaultsManager_js_1.SettingsDefaultsManager.loadFromFile(settingsPath);
    // Always read types/concepts from the active mode definition
    var mode = ModeManager_js_1.ModeManager.getInstance().getActiveMode();
    var observationTypes = new Set(mode.observation_types.map(function (t) { return t.id; }));
    var observationConcepts = new Set(mode.observation_concepts.map(function (c) { return c.id; }));
    return {
        totalObservationCount: parseInt(settings.CLAUDE_MEM_CONTEXT_OBSERVATIONS, 10),
        fullObservationCount: parseInt(settings.CLAUDE_MEM_CONTEXT_FULL_COUNT, 10),
        sessionCount: parseInt(settings.CLAUDE_MEM_CONTEXT_SESSION_COUNT, 10),
        showReadTokens: settings.CLAUDE_MEM_CONTEXT_SHOW_READ_TOKENS === 'true',
        showWorkTokens: settings.CLAUDE_MEM_CONTEXT_SHOW_WORK_TOKENS === 'true',
        showSavingsAmount: settings.CLAUDE_MEM_CONTEXT_SHOW_SAVINGS_AMOUNT === 'true',
        showSavingsPercent: settings.CLAUDE_MEM_CONTEXT_SHOW_SAVINGS_PERCENT === 'true',
        observationTypes: observationTypes,
        observationConcepts: observationConcepts,
        fullObservationField: settings.CLAUDE_MEM_CONTEXT_FULL_FIELD,
        showLastSummary: settings.CLAUDE_MEM_CONTEXT_SHOW_LAST_SUMMARY === 'true',
        showLastMessage: settings.CLAUDE_MEM_CONTEXT_SHOW_LAST_MESSAGE === 'true',
    };
}
