"use strict";
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
exports.migrateBypassPermissionsAcceptedToSettings = migrateBypassPermissionsAcceptedToSettings;
var index_js_1 = require("src/services/analytics/index.js");
var config_js_1 = require("../utils/config.js");
var log_js_1 = require("../utils/log.js");
var settings_js_1 = require("../utils/settings/settings.js");
/**
 * Migration: Move bypassPermissionsModeAccepted from global config to settings.json
 * as skipDangerousModePermissionPrompt. This is a better home since settings.json
 * is the user-configurable settings file.
 */
function migrateBypassPermissionsAcceptedToSettings() {
    var globalConfig = (0, config_js_1.getGlobalConfig)();
    if (!globalConfig.bypassPermissionsModeAccepted) {
        return;
    }
    try {
        if (!(0, settings_js_1.hasSkipDangerousModePermissionPrompt)()) {
            (0, settings_js_1.updateSettingsForSource)('userSettings', {
                skipDangerousModePermissionPrompt: true,
            });
        }
        (0, index_js_1.logEvent)('tengu_migrate_bypass_permissions_accepted', {});
        (0, config_js_1.saveGlobalConfig)(function (current) {
            if (!('bypassPermissionsModeAccepted' in current))
                return current;
            var _ = current.bypassPermissionsModeAccepted, updatedConfig = __rest(current, ["bypassPermissionsModeAccepted"]);
            return updatedConfig;
        });
    }
    catch (error) {
        (0, log_js_1.logError)(new Error("Failed to migrate bypass permissions accepted: ".concat(error)));
    }
}
