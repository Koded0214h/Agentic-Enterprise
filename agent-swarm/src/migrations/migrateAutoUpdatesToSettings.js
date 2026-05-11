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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateAutoUpdatesToSettings = migrateAutoUpdatesToSettings;
var index_js_1 = require("src/services/analytics/index.js");
var config_js_1 = require("../utils/config.js");
var log_js_1 = require("../utils/log.js");
var settings_js_1 = require("../utils/settings/settings.js");
/**
 * Migration: Move user-set autoUpdates preference to settings.json env var
 * Only migrates if user explicitly disabled auto-updates (not for protection)
 * This preserves user intent while allowing native installations to auto-update
 */
function migrateAutoUpdatesToSettings() {
    var _a;
    var globalConfig = (0, config_js_1.getGlobalConfig)();
    // Only migrate if autoUpdates was explicitly set to false by user preference
    // (not automatically for native protection)
    if (globalConfig.autoUpdates !== false ||
        globalConfig.autoUpdatesProtectedForNative === true) {
        return;
    }
    try {
        var userSettings = (0, settings_js_1.getSettingsForSource)('userSettings') || {};
        // Always set DISABLE_AUTOUPDATER to preserve user intent
        // We need to overwrite even if it exists, to ensure the migration is complete
        (0, settings_js_1.updateSettingsForSource)('userSettings', __assign(__assign({}, userSettings), { env: __assign(__assign({}, userSettings.env), { DISABLE_AUTOUPDATER: '1' }) }));
        (0, index_js_1.logEvent)('tengu_migrate_autoupdates_to_settings', {
            was_user_preference: true,
            already_had_env_var: !!((_a = userSettings.env) === null || _a === void 0 ? void 0 : _a.DISABLE_AUTOUPDATER),
        });
        // explicitly set, so this takes effect immediately
        process.env.DISABLE_AUTOUPDATER = '1';
        // Remove autoUpdates from global config after successful migration
        (0, config_js_1.saveGlobalConfig)(function (current) {
            var _ = current.autoUpdates, __ = current.autoUpdatesProtectedForNative, updatedConfig = __rest(current, ["autoUpdates", "autoUpdatesProtectedForNative"]);
            return updatedConfig;
        });
    }
    catch (error) {
        (0, log_js_1.logError)(new Error("Failed to migrate auto-updates: ".concat(error)));
        (0, index_js_1.logEvent)('tengu_migrate_autoupdates_error', {
            has_error: true,
        });
    }
}
