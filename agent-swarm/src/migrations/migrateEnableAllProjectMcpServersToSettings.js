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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateEnableAllProjectMcpServersToSettings = migrateEnableAllProjectMcpServersToSettings;
var index_js_1 = require("src/services/analytics/index.js");
var config_js_1 = require("../utils/config.js");
var log_js_1 = require("../utils/log.js");
var settings_js_1 = require("../utils/settings/settings.js");
/**
 * Migration: Move MCP server approval fields from project config to local settings
 * This migrates both enableAllProjectMcpServers and enabledMcpjsonServers to the
 * settings system for better management and consistency.
 */
function migrateEnableAllProjectMcpServersToSettings() {
    var projectConfig = (0, config_js_1.getCurrentProjectConfig)();
    // Check if any field exists in project config
    var hasEnableAll = projectConfig.enableAllProjectMcpServers !== undefined;
    var hasEnabledServers = projectConfig.enabledMcpjsonServers &&
        projectConfig.enabledMcpjsonServers.length > 0;
    var hasDisabledServers = projectConfig.disabledMcpjsonServers &&
        projectConfig.disabledMcpjsonServers.length > 0;
    if (!hasEnableAll && !hasEnabledServers && !hasDisabledServers) {
        return;
    }
    try {
        var existingSettings = (0, settings_js_1.getSettingsForSource)('localSettings') || {};
        var updates = {};
        var fieldsToRemove = [];
        // Migrate enableAllProjectMcpServers if it exists and hasn't been migrated
        if (hasEnableAll &&
            existingSettings.enableAllProjectMcpServers === undefined) {
            updates.enableAllProjectMcpServers =
                projectConfig.enableAllProjectMcpServers;
            fieldsToRemove.push('enableAllProjectMcpServers');
        }
        else if (hasEnableAll) {
            // Already migrated, just mark for removal
            fieldsToRemove.push('enableAllProjectMcpServers');
        }
        // Migrate enabledMcpjsonServers if it exists
        if (hasEnabledServers && projectConfig.enabledMcpjsonServers) {
            var existingEnabledServers = existingSettings.enabledMcpjsonServers || [];
            // Merge the servers (avoiding duplicates)
            updates.enabledMcpjsonServers = __spreadArray([], new Set(__spreadArray(__spreadArray([], existingEnabledServers, true), projectConfig.enabledMcpjsonServers, true)), true);
            fieldsToRemove.push('enabledMcpjsonServers');
        }
        // Migrate disabledMcpjsonServers if it exists
        if (hasDisabledServers && projectConfig.disabledMcpjsonServers) {
            var existingDisabledServers = existingSettings.disabledMcpjsonServers || [];
            // Merge the servers (avoiding duplicates)
            updates.disabledMcpjsonServers = __spreadArray([], new Set(__spreadArray(__spreadArray([], existingDisabledServers, true), projectConfig.disabledMcpjsonServers, true)), true);
            fieldsToRemove.push('disabledMcpjsonServers');
        }
        // Update settings if there are any updates
        if (Object.keys(updates).length > 0) {
            (0, settings_js_1.updateSettingsForSource)('localSettings', updates);
        }
        // Remove migrated fields from project config
        if (fieldsToRemove.includes('enableAllProjectMcpServers') ||
            fieldsToRemove.includes('enabledMcpjsonServers') ||
            fieldsToRemove.includes('disabledMcpjsonServers')) {
            (0, config_js_1.saveCurrentProjectConfig)(function (current) {
                var _enableAll = current.enableAllProjectMcpServers, _enabledServers = current.enabledMcpjsonServers, _disabledServers = current.disabledMcpjsonServers, configWithoutFields = __rest(current, ["enableAllProjectMcpServers", "enabledMcpjsonServers", "disabledMcpjsonServers"]);
                return configWithoutFields;
            });
        }
        // Log the migration event
        (0, index_js_1.logEvent)('tengu_migrate_mcp_approval_fields_success', {
            migratedCount: fieldsToRemove.length,
        });
    }
    catch (e) {
        // Log migration failure but don't throw to avoid breaking startup
        (0, log_js_1.logError)(e);
        (0, index_js_1.logEvent)('tengu_migrate_mcp_approval_fields_error', {});
    }
}
