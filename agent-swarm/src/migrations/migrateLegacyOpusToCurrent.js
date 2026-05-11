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
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateLegacyOpusToCurrent = migrateLegacyOpusToCurrent;
var index_js_1 = require("../services/analytics/index.js");
var config_js_1 = require("../utils/config.js");
var model_js_1 = require("../utils/model/model.js");
var providers_js_1 = require("../utils/model/providers.js");
var settings_js_1 = require("../utils/settings/settings.js");
/**
 * Migrate first-party users off explicit Opus 4.0/4.1 model strings.
 *
 * The 'opus' alias already resolves to Opus 4.6 for 1P, so anyone still
 * on an explicit 4.0/4.1 string pinned it in settings before 4.5 launched.
 * parseUserSpecifiedModel now silently remaps these at runtime anyway —
 * this migration cleans up the settings file so /model shows the right
 * thing, and sets a timestamp so the REPL can show a one-time notification.
 *
 * Only touches userSettings. Legacy strings in project/local/policy settings
 * are left alone (we can't/shouldn't rewrite those) and are still remapped at
 * runtime by parseUserSpecifiedModel. Reading and writing the same source
 * keeps this idempotent without a completion flag, and avoids silently
 * promoting 'opus' to the global default for users who only pinned it in one
 * project.
 */
function migrateLegacyOpusToCurrent() {
    var _a;
    if ((0, providers_js_1.getAPIProvider)() !== 'firstParty') {
        return;
    }
    if (!(0, model_js_1.isLegacyModelRemapEnabled)()) {
        return;
    }
    var model = (_a = (0, settings_js_1.getSettingsForSource)('userSettings')) === null || _a === void 0 ? void 0 : _a.model;
    if (model !== 'claude-opus-4-20250514' &&
        model !== 'claude-opus-4-1-20250805' &&
        model !== 'claude-opus-4-0' &&
        model !== 'claude-opus-4-1') {
        return;
    }
    (0, settings_js_1.updateSettingsForSource)('userSettings', { model: 'opus' });
    (0, config_js_1.saveGlobalConfig)(function (current) { return (__assign(__assign({}, current), { legacyOpusMigrationTimestamp: Date.now() })); });
    (0, index_js_1.logEvent)('tengu_legacy_opus_migration', {
        from_model: model,
    });
}
