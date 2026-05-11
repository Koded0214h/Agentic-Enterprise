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
exports.migrateSonnet45ToSonnet46 = migrateSonnet45ToSonnet46;
var index_js_1 = require("../services/analytics/index.js");
var auth_js_1 = require("../utils/auth.js");
var config_js_1 = require("../utils/config.js");
var providers_js_1 = require("../utils/model/providers.js");
var settings_js_1 = require("../utils/settings/settings.js");
/**
 * Migrate Pro/Max/Team Premium first-party users off explicit Sonnet 4.5
 * model strings to the 'sonnet' alias (which now resolves to Sonnet 4.6).
 *
 * Users may have been pinned to explicit Sonnet 4.5 strings by:
 * - The earlier migrateSonnet1mToSonnet45 migration (sonnet[1m] → explicit 4.5[1m])
 * - Manually selecting it via /model
 *
 * Reads userSettings specifically (not merged) so we only migrate what /model
 * wrote — project/local pins are left alone.
 * Idempotent: only writes if userSettings.model matches a Sonnet 4.5 string.
 */
function migrateSonnet45ToSonnet46() {
    var _a;
    if ((0, providers_js_1.getAPIProvider)() !== 'firstParty') {
        return;
    }
    if (!(0, auth_js_1.isProSubscriber)() && !(0, auth_js_1.isMaxSubscriber)() && !(0, auth_js_1.isTeamPremiumSubscriber)()) {
        return;
    }
    var model = (_a = (0, settings_js_1.getSettingsForSource)('userSettings')) === null || _a === void 0 ? void 0 : _a.model;
    if (model !== 'claude-sonnet-4-5-20250929' &&
        model !== 'claude-sonnet-4-5-20250929[1m]' &&
        model !== 'sonnet-4-5-20250929' &&
        model !== 'sonnet-4-5-20250929[1m]') {
        return;
    }
    var has1m = model.endsWith('[1m]');
    (0, settings_js_1.updateSettingsForSource)('userSettings', {
        model: has1m ? 'sonnet[1m]' : 'sonnet',
    });
    // Skip notification for brand-new users — they never experienced the old default
    var config = (0, config_js_1.getGlobalConfig)();
    if (config.numStartups > 1) {
        (0, config_js_1.saveGlobalConfig)(function (current) { return (__assign(__assign({}, current), { sonnet45To46MigrationTimestamp: Date.now() })); });
    }
    (0, index_js_1.logEvent)('tengu_sonnet45_to_46_migration', {
        from_model: model,
        has_1m: has1m,
    });
}
