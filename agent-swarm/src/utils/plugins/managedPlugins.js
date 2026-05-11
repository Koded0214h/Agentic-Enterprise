"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getManagedPluginNames = getManagedPluginNames;
var settings_js_1 = require("../settings/settings.js");
/**
 * Plugin names locked by org policy (policySettings.enabledPlugins).
 *
 * Returns null when managed settings declare no plugin entries (common
 * case — no policy in effect).
 */
function getManagedPluginNames() {
    var _a;
    var enabledPlugins = (_a = (0, settings_js_1.getSettingsForSource)('policySettings')) === null || _a === void 0 ? void 0 : _a.enabledPlugins;
    if (!enabledPlugins) {
        return null;
    }
    var names = new Set();
    for (var _i = 0, _b = Object.entries(enabledPlugins); _i < _b.length; _i++) {
        var _c = _b[_i], pluginId = _c[0], value = _c[1];
        // Only plugin@marketplace boolean entries (true OR false) are
        // protected. Legacy owner/repo array form is not.
        if (typeof value !== 'boolean' || !pluginId.includes('@')) {
            continue;
        }
        var name_1 = pluginId.split('@')[0];
        if (name_1) {
            names.add(name_1);
        }
    }
    return names.size > 0 ? names : null;
}
