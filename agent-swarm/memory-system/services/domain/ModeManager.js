"use strict";
/**
 * ModeManager - Singleton for loading and managing mode profiles
 *
 * Mode profiles define observation types, concepts, and prompts for different use cases.
 * Default mode is 'code' (software development). Other modes like 'email-investigation'
 * can be selected via CLAUDE_MEM_MODE setting.
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
exports.ModeManager = void 0;
var fs_1 = require("fs");
var path_1 = require("path");
var logger_js_1 = require("../../utils/logger.js");
var paths_js_1 = require("../../shared/paths.js");
var ModeManager = /** @class */ (function () {
    function ModeManager() {
        this.activeMode = null;
        // Modes are in plugin/modes/
        // getPackageRoot() points to plugin/ in production and src/ in development
        // We want to ensure we find the modes directory which is at the project root/plugin/modes
        var packageRoot = (0, paths_js_1.getPackageRoot)();
        // Check for plugin/modes relative to package root (covers both dev and prod if paths are right)
        var possiblePaths = [
            (0, path_1.join)(packageRoot, 'modes'), // Production (plugin/modes)
            (0, path_1.join)(packageRoot, '..', 'plugin', 'modes'), // Development (src/../plugin/modes)
        ];
        var foundPath = possiblePaths.find(function (p) { return (0, fs_1.existsSync)(p); });
        this.modesDir = foundPath || possiblePaths[0];
    }
    /**
     * Get singleton instance
     */
    ModeManager.getInstance = function () {
        if (!ModeManager.instance) {
            ModeManager.instance = new ModeManager();
        }
        return ModeManager.instance;
    };
    /**
     * Parse mode ID for inheritance pattern (parent--override)
     */
    ModeManager.prototype.parseInheritance = function (modeId) {
        var parts = modeId.split('--');
        if (parts.length === 1) {
            return { hasParent: false, parentId: '', overrideId: '' };
        }
        // Support only one level: code--ko, not code--ko--verbose
        if (parts.length > 2) {
            throw new Error("Invalid mode inheritance: ".concat(modeId, ". Only one level of inheritance supported (parent--override)"));
        }
        return {
            hasParent: true,
            parentId: parts[0],
            overrideId: modeId // Use the full modeId (e.g., code--es) to find the override file
        };
    };
    /**
     * Check if value is a plain object (not array, not null)
     */
    ModeManager.prototype.isPlainObject = function (value) {
        return (value !== null &&
            typeof value === 'object' &&
            !Array.isArray(value));
    };
    /**
     * Deep merge two objects
     * - Recursively merge nested objects
     * - Replace arrays completely (no merging)
     * - Override primitives
     */
    ModeManager.prototype.deepMerge = function (base, override) {
        var result = __assign({}, base);
        for (var key in override) {
            var overrideValue = override[key];
            var baseValue = base[key];
            if (this.isPlainObject(overrideValue) && this.isPlainObject(baseValue)) {
                // Recursively merge nested objects
                result[key] = this.deepMerge(baseValue, overrideValue);
            }
            else {
                // Replace arrays and primitives completely
                result[key] = overrideValue;
            }
        }
        return result;
    };
    /**
     * Load a mode file from disk without inheritance processing
     */
    ModeManager.prototype.loadModeFile = function (modeId) {
        var modePath = (0, path_1.join)(this.modesDir, "".concat(modeId, ".json"));
        if (!(0, fs_1.existsSync)(modePath)) {
            throw new Error("Mode file not found: ".concat(modePath));
        }
        var jsonContent = (0, fs_1.readFileSync)(modePath, 'utf-8');
        return JSON.parse(jsonContent);
    };
    /**
     * Load a mode profile by ID with inheritance support
     * Caches the result for subsequent calls
     *
     * Supports inheritance via parent--override pattern (e.g., code--ko)
     * - Loads parent mode recursively
     * - Loads override file from modes directory
     * - Deep merges override onto parent
     */
    ModeManager.prototype.loadMode = function (modeId) {
        var inheritance = this.parseInheritance(modeId);
        // No inheritance - load file directly (existing behavior)
        if (!inheritance.hasParent) {
            try {
                var mode = this.loadModeFile(modeId);
                this.activeMode = mode;
                logger_js_1.logger.debug('SYSTEM', "Loaded mode: ".concat(mode.name, " (").concat(modeId, ")"), undefined, {
                    types: mode.observation_types.map(function (t) { return t.id; }),
                    concepts: mode.observation_concepts.map(function (c) { return c.id; })
                });
                return mode;
            }
            catch (error) {
                logger_js_1.logger.warn('SYSTEM', "Mode file not found: ".concat(modeId, ", falling back to 'code'"));
                // If we're already trying to load 'code', throw to prevent infinite recursion
                if (modeId === 'code') {
                    throw new Error('Critical: code.json mode file missing');
                }
                return this.loadMode('code');
            }
        }
        // Has inheritance - load parent and merge with override
        var parentId = inheritance.parentId, overrideId = inheritance.overrideId;
        // Load parent mode recursively
        var parentMode;
        try {
            parentMode = this.loadMode(parentId);
        }
        catch (error) {
            logger_js_1.logger.warn('SYSTEM', "Parent mode '".concat(parentId, "' not found for ").concat(modeId, ", falling back to 'code'"));
            parentMode = this.loadMode('code');
        }
        // Load override file
        var overrideConfig;
        try {
            overrideConfig = this.loadModeFile(overrideId);
            logger_js_1.logger.debug('SYSTEM', "Loaded override file: ".concat(overrideId, " for parent ").concat(parentId));
        }
        catch (error) {
            logger_js_1.logger.warn('SYSTEM', "Override file '".concat(overrideId, "' not found, using parent mode '").concat(parentId, "' only"));
            this.activeMode = parentMode;
            return parentMode;
        }
        // Validate override file loaded successfully
        if (!overrideConfig) {
            logger_js_1.logger.warn('SYSTEM', "Invalid override file: ".concat(overrideId, ", using parent mode '").concat(parentId, "' only"));
            this.activeMode = parentMode;
            return parentMode;
        }
        // Deep merge override onto parent
        var mergedMode = this.deepMerge(parentMode, overrideConfig);
        this.activeMode = mergedMode;
        logger_js_1.logger.debug('SYSTEM', "Loaded mode with inheritance: ".concat(mergedMode.name, " (").concat(modeId, " = ").concat(parentId, " + ").concat(overrideId, ")"), undefined, {
            parent: parentId,
            override: overrideId,
            types: mergedMode.observation_types.map(function (t) { return t.id; }),
            concepts: mergedMode.observation_concepts.map(function (c) { return c.id; })
        });
        return mergedMode;
    };
    /**
     * Get currently active mode
     */
    ModeManager.prototype.getActiveMode = function () {
        if (!this.activeMode) {
            throw new Error('No mode loaded. Call loadMode() first.');
        }
        return this.activeMode;
    };
    /**
     * Get all observation types from active mode
     */
    ModeManager.prototype.getObservationTypes = function () {
        return this.getActiveMode().observation_types;
    };
    /**
     * Get all observation concepts from active mode
     */
    ModeManager.prototype.getObservationConcepts = function () {
        return this.getActiveMode().observation_concepts;
    };
    /**
     * Get icon for a specific observation type
     */
    ModeManager.prototype.getTypeIcon = function (typeId) {
        var type = this.getObservationTypes().find(function (t) { return t.id === typeId; });
        return (type === null || type === void 0 ? void 0 : type.emoji) || '📝';
    };
    /**
     * Get work emoji for a specific observation type
     */
    ModeManager.prototype.getWorkEmoji = function (typeId) {
        var type = this.getObservationTypes().find(function (t) { return t.id === typeId; });
        return (type === null || type === void 0 ? void 0 : type.work_emoji) || '📝';
    };
    /**
     * Validate that a type ID exists in the active mode
     */
    ModeManager.prototype.validateType = function (typeId) {
        return this.getObservationTypes().some(function (t) { return t.id === typeId; });
    };
    /**
     * Get label for a specific observation type
     */
    ModeManager.prototype.getTypeLabel = function (typeId) {
        var type = this.getObservationTypes().find(function (t) { return t.id === typeId; });
        return (type === null || type === void 0 ? void 0 : type.label) || typeId;
    };
    ModeManager.instance = null;
    return ModeManager;
}());
exports.ModeManager = ModeManager;
