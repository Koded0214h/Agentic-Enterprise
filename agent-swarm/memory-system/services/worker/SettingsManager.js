"use strict";
/**
 * SettingsManager: DRY settings CRUD utility
 *
 * Responsibility:
 * - DRY helper for viewer settings CRUD
 * - Eliminates duplication in settings read/write logic
 * - Type-safe settings management
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
exports.SettingsManager = void 0;
var logger_js_1 = require("../../utils/logger.js");
var SettingsManager = /** @class */ (function () {
    function SettingsManager(dbManager) {
        this.defaultSettings = {
            sidebarOpen: true,
            selectedProject: null,
            theme: 'system'
        };
        this.dbManager = dbManager;
    }
    /**
     * Get current viewer settings (with defaults)
     */
    SettingsManager.prototype.getSettings = function () {
        var db = this.dbManager.getSessionStore().db;
        try {
            var stmt = db.prepare('SELECT key, value FROM viewer_settings');
            var rows = stmt.all();
            var settings = __assign({}, this.defaultSettings);
            for (var _i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
                var row = rows_1[_i];
                var key = row.key;
                if (key in settings) {
                    settings[key] = JSON.parse(row.value);
                }
            }
            return settings;
        }
        catch (error) {
            logger_js_1.logger.debug('WORKER', 'Failed to load settings, using defaults', {}, error);
            return __assign({}, this.defaultSettings);
        }
    };
    /**
     * Update viewer settings (partial update)
     */
    SettingsManager.prototype.updateSettings = function (updates) {
        var db = this.dbManager.getSessionStore().db;
        var stmt = db.prepare("\n      INSERT OR REPLACE INTO viewer_settings (key, value)\n      VALUES (?, ?)\n    ");
        for (var _i = 0, _a = Object.entries(updates); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            stmt.run(key, JSON.stringify(value));
        }
        return this.getSettings();
    };
    return SettingsManager;
}());
exports.SettingsManager = SettingsManager;
