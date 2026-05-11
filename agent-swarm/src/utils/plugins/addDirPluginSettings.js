"use strict";
/**
 * Reads plugin-related settings (enabledPlugins, extraKnownMarketplaces)
 * from --add-dir directories.
 *
 * These have the LOWEST priority — callers must spread standard settings
 * on top so that user/project/local/flag/policy sources all override.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAddDirEnabledPlugins = getAddDirEnabledPlugins;
exports.getAddDirExtraMarketplaces = getAddDirExtraMarketplaces;
var path_1 = require("path");
var state_js_1 = require("../../bootstrap/state.js");
var settings_js_1 = require("../settings/settings.js");
var SETTINGS_FILES = ['settings.json', 'settings.local.json'];
/**
 * Returns a merged record of enabledPlugins from all --add-dir directories.
 *
 * Within each directory, settings.local.json is processed after settings.json
 * (local wins within that dir). Across directories, later CLI-order wins on
 * conflict.
 *
 * This has the lowest priority — callers must spread their standard settings
 * on top to let user/project/local/flag/policy override.
 */
function getAddDirEnabledPlugins() {
    var result = {};
    for (var _i = 0, _a = (0, state_js_1.getAdditionalDirectoriesForClaudeMd)(); _i < _a.length; _i++) {
        var dir = _a[_i];
        for (var _b = 0, SETTINGS_FILES_1 = SETTINGS_FILES; _b < SETTINGS_FILES_1.length; _b++) {
            var file = SETTINGS_FILES_1[_b];
            var settings = (0, settings_js_1.parseSettingsFile)((0, path_1.join)(dir, '.claude', file)).settings;
            if (!(settings === null || settings === void 0 ? void 0 : settings.enabledPlugins)) {
                continue;
            }
            Object.assign(result, settings.enabledPlugins);
        }
    }
    return result;
}
/**
 * Returns a merged record of extraKnownMarketplaces from all --add-dir directories.
 *
 * Same priority rules as getAddDirEnabledPlugins: settings.local.json wins
 * within each dir, and callers spread standard settings on top.
 */
function getAddDirExtraMarketplaces() {
    var result = {};
    for (var _i = 0, _a = (0, state_js_1.getAdditionalDirectoriesForClaudeMd)(); _i < _a.length; _i++) {
        var dir = _a[_i];
        for (var _b = 0, SETTINGS_FILES_2 = SETTINGS_FILES; _b < SETTINGS_FILES_2.length; _b++) {
            var file = SETTINGS_FILES_2[_b];
            var settings = (0, settings_js_1.parseSettingsFile)((0, path_1.join)(dir, '.claude', file)).settings;
            if (!(settings === null || settings === void 0 ? void 0 : settings.extraKnownMarketplaces)) {
                continue;
            }
            Object.assign(result, settings.extraKnownMarketplaces);
        }
    }
    return result;
}
