"use strict";
/**
 * SettingsDefaultsManager
 *
 * Single source of truth for all default configuration values.
 * Provides methods to get defaults with optional environment variable overrides.
 */
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
exports.SettingsDefaultsManager = void 0;
var fs_1 = require("fs");
var path_1 = require("path");
var os_1 = require("os");
var SettingsDefaultsManager = /** @class */ (function () {
    function SettingsDefaultsManager() {
    }
    /**
     * Get all defaults as an object
     */
    SettingsDefaultsManager.getAllDefaults = function () {
        return __assign({}, this.DEFAULTS);
    };
    /**
     * Get a setting value with environment variable override.
     * Priority: process.env > hardcoded default
     *
     * For full priority (env > settings file > default), use loadFromFile().
     * This method is safe to call at module-load time (no file I/O) and still
     * respects environment variable overrides that were previously ignored.
     */
    SettingsDefaultsManager.get = function (key) {
        var _a;
        return (_a = process.env[key]) !== null && _a !== void 0 ? _a : this.DEFAULTS[key];
    };
    /**
     * Get an integer default value
     */
    SettingsDefaultsManager.getInt = function (key) {
        var value = this.get(key);
        return parseInt(value, 10);
    };
    /**
     * Get a boolean default value
     * Handles both string 'true' and boolean true from JSON
     */
    SettingsDefaultsManager.getBool = function (key) {
        var value = this.get(key);
        return value === 'true' || value === true;
    };
    /**
     * Apply environment variable overrides to settings
     * Environment variables take highest priority over file and defaults
     */
    SettingsDefaultsManager.applyEnvOverrides = function (settings) {
        var result = __assign({}, settings);
        for (var _i = 0, _a = Object.keys(this.DEFAULTS); _i < _a.length; _i++) {
            var key = _a[_i];
            if (process.env[key] !== undefined) {
                result[key] = process.env[key];
            }
        }
        return result;
    };
    /**
     * Load settings from file with fallback to defaults
     * Returns merged settings with proper priority: process.env > settings file > defaults
     * Handles all errors (missing file, corrupted JSON, permissions) gracefully
     *
     * Configuration Priority:
     *   1. Environment variables (highest priority)
     *   2. Settings file (~/.claude-mem/settings.json)
     *   3. Default values (lowest priority)
     */
    SettingsDefaultsManager.loadFromFile = function (settingsPath) {
        try {
            if (!(0, fs_1.existsSync)(settingsPath)) {
                var defaults = this.getAllDefaults();
                try {
                    var dir = (0, path_1.dirname)(settingsPath);
                    if (!(0, fs_1.existsSync)(dir)) {
                        (0, fs_1.mkdirSync)(dir, { recursive: true });
                    }
                    (0, fs_1.writeFileSync)(settingsPath, JSON.stringify(defaults, null, 2), 'utf-8');
                    // Use console instead of logger to avoid circular dependency
                    console.log('[SETTINGS] Created settings file with defaults:', settingsPath);
                }
                catch (error) {
                    console.warn('[SETTINGS] Failed to create settings file, using in-memory defaults:', settingsPath, error);
                }
                // Still apply env var overrides even when file doesn't exist
                return this.applyEnvOverrides(defaults);
            }
            var settingsData = (0, fs_1.readFileSync)(settingsPath, 'utf-8');
            var settings = JSON.parse(settingsData);
            // MIGRATION: Handle old nested schema { env: {...} }
            var flatSettings = settings;
            if (settings.env && typeof settings.env === 'object') {
                // Migrate from nested to flat schema
                flatSettings = settings.env;
                // Auto-migrate the file to flat schema
                try {
                    (0, fs_1.writeFileSync)(settingsPath, JSON.stringify(flatSettings, null, 2), 'utf-8');
                    console.log('[SETTINGS] Migrated settings file from nested to flat schema:', settingsPath);
                }
                catch (error) {
                    console.warn('[SETTINGS] Failed to auto-migrate settings file:', settingsPath, error);
                    // Continue with in-memory migration even if write fails
                }
            }
            // Merge file settings with defaults (flat schema)
            var result = __assign({}, this.DEFAULTS);
            for (var _i = 0, _a = Object.keys(this.DEFAULTS); _i < _a.length; _i++) {
                var key = _a[_i];
                if (flatSettings[key] !== undefined) {
                    result[key] = flatSettings[key];
                }
            }
            // Apply environment variable overrides (highest priority)
            return this.applyEnvOverrides(result);
        }
        catch (error) {
            console.warn('[SETTINGS] Failed to load settings, using defaults:', settingsPath, error);
            // Still apply env var overrides even on error
            return this.applyEnvOverrides(this.getAllDefaults());
        }
    };
    /**
     * Default values for all settings
     */
    SettingsDefaultsManager.DEFAULTS = {
        CLAUDE_MEM_MODEL: 'claude-sonnet-4-5',
        CLAUDE_MEM_CONTEXT_OBSERVATIONS: '50',
        CLAUDE_MEM_WORKER_PORT: '37777',
        CLAUDE_MEM_WORKER_HOST: '127.0.0.1',
        CLAUDE_MEM_SKIP_TOOLS: 'ListMcpResourcesTool,SlashCommand,Skill,TodoWrite,AskUserQuestion',
        // AI Provider Configuration
        CLAUDE_MEM_PROVIDER: 'claude', // Default to Claude
        CLAUDE_MEM_CLAUDE_AUTH_METHOD: 'cli', // Default to CLI subscription billing (not API key)
        CLAUDE_MEM_GEMINI_API_KEY: '', // Empty by default, can be set via UI or env
        CLAUDE_MEM_GEMINI_MODEL: 'gemini-2.5-flash-lite', // Default Gemini model (highest free tier RPM)
        CLAUDE_MEM_GEMINI_RATE_LIMITING_ENABLED: 'true', // Rate limiting ON by default for free tier users
        CLAUDE_MEM_OPENROUTER_API_KEY: '', // Empty by default, can be set via UI or env
        CLAUDE_MEM_OPENROUTER_MODEL: 'xiaomi/mimo-v2-flash:free', // Default OpenRouter model (free tier)
        CLAUDE_MEM_OPENROUTER_SITE_URL: '', // Optional: for OpenRouter analytics
        CLAUDE_MEM_OPENROUTER_APP_NAME: 'claude-mem', // App name for OpenRouter analytics
        CLAUDE_MEM_OPENROUTER_MAX_CONTEXT_MESSAGES: '20', // Max messages in context window
        CLAUDE_MEM_OPENROUTER_MAX_TOKENS: '100000', // Max estimated tokens (~100k safety limit)
        // System Configuration
        CLAUDE_MEM_DATA_DIR: (0, path_1.join)((0, os_1.homedir)(), '.claude-mem'),
        CLAUDE_MEM_LOG_LEVEL: 'INFO',
        CLAUDE_MEM_PYTHON_VERSION: '3.13',
        CLAUDE_CODE_PATH: '', // Empty means auto-detect via 'which claude'
        CLAUDE_MEM_MODE: 'code', // Default mode profile
        // Token Economics
        CLAUDE_MEM_CONTEXT_SHOW_READ_TOKENS: 'false',
        CLAUDE_MEM_CONTEXT_SHOW_WORK_TOKENS: 'false',
        CLAUDE_MEM_CONTEXT_SHOW_SAVINGS_AMOUNT: 'false',
        CLAUDE_MEM_CONTEXT_SHOW_SAVINGS_PERCENT: 'true',
        // Display Configuration
        CLAUDE_MEM_CONTEXT_FULL_COUNT: '0',
        CLAUDE_MEM_CONTEXT_FULL_FIELD: 'narrative',
        CLAUDE_MEM_CONTEXT_SESSION_COUNT: '10',
        // Feature Toggles
        CLAUDE_MEM_CONTEXT_SHOW_LAST_SUMMARY: 'true',
        CLAUDE_MEM_CONTEXT_SHOW_LAST_MESSAGE: 'false',
        CLAUDE_MEM_CONTEXT_SHOW_TERMINAL_OUTPUT: 'true',
        CLAUDE_MEM_FOLDER_CLAUDEMD_ENABLED: 'false',
        // Process Management
        CLAUDE_MEM_MAX_CONCURRENT_AGENTS: '2', // Max concurrent Claude SDK agent subprocesses
        // Exclusion Settings
        CLAUDE_MEM_EXCLUDED_PROJECTS: '', // Comma-separated glob patterns for excluded project paths
        CLAUDE_MEM_FOLDER_MD_EXCLUDE: '[]', // JSON array of folder paths to exclude from CLAUDE.md generation
        // Chroma Vector Database Configuration
        CLAUDE_MEM_CHROMA_ENABLED: 'true', // Set to 'false' to disable Chroma and use SQLite-only search
        CLAUDE_MEM_CHROMA_MODE: 'local', // 'local' uses persistent chroma-mcp via uvx, 'remote' connects to existing server
        CLAUDE_MEM_CHROMA_HOST: '127.0.0.1',
        CLAUDE_MEM_CHROMA_PORT: '8000',
        CLAUDE_MEM_CHROMA_SSL: 'false',
        // Future cloud support (claude-mem pro)
        CLAUDE_MEM_CHROMA_API_KEY: '',
        CLAUDE_MEM_CHROMA_TENANT: 'default_tenant',
        CLAUDE_MEM_CHROMA_DATABASE: 'default_database',
    };
    return SettingsDefaultsManager;
}());
exports.SettingsDefaultsManager = SettingsDefaultsManager;
