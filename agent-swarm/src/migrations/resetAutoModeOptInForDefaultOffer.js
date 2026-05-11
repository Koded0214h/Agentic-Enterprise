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
exports.resetAutoModeOptInForDefaultOffer = resetAutoModeOptInForDefaultOffer;
var bun_bundle_1 = require("bun:bundle");
var index_js_1 = require("src/services/analytics/index.js");
var config_js_1 = require("../utils/config.js");
var log_js_1 = require("../utils/log.js");
var permissionSetup_js_1 = require("../utils/permissions/permissionSetup.js");
var settings_js_1 = require("../utils/settings/settings.js");
/**
 * One-shot migration: clear skipAutoPermissionPrompt for users who accepted
 * the old 2-option AutoModeOptInDialog but don't have auto as their default.
 * Re-surfaces the dialog so they see the new "make it my default mode" option.
 * Guard lives in GlobalConfig (~/.claude.json), not settings.json, so it
 * survives settings resets and doesn't re-arm itself.
 *
 * Only runs when tengu_auto_mode_config.enabled === 'enabled'. For 'opt-in'
 * users, clearing skipAutoPermissionPrompt would remove auto from the carousel
 * (permissionSetup.ts:988) — the dialog would become unreachable and the
 * migration would defeat itself. In practice the ~40 target ants are all
 * 'enabled' (they reached the old dialog via bare Shift+Tab, which requires
 * 'enabled'), but the guard makes it safe regardless.
 */
function resetAutoModeOptInForDefaultOffer() {
    var _a;
    if ((0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER')) {
        var config = (0, config_js_1.getGlobalConfig)();
        if (config.hasResetAutoModeOptInForDefaultOffer)
            return;
        if ((0, permissionSetup_js_1.getAutoModeEnabledState)() !== 'enabled')
            return;
        try {
            var user = (0, settings_js_1.getSettingsForSource)('userSettings');
            if ((user === null || user === void 0 ? void 0 : user.skipAutoPermissionPrompt) &&
                ((_a = user === null || user === void 0 ? void 0 : user.permissions) === null || _a === void 0 ? void 0 : _a.defaultMode) !== 'auto') {
                (0, settings_js_1.updateSettingsForSource)('userSettings', {
                    skipAutoPermissionPrompt: undefined,
                });
                (0, index_js_1.logEvent)('tengu_migrate_reset_auto_opt_in_for_default_offer', {});
            }
            (0, config_js_1.saveGlobalConfig)(function (c) {
                if (c.hasResetAutoModeOptInForDefaultOffer)
                    return c;
                return __assign(__assign({}, c), { hasResetAutoModeOptInForDefaultOffer: true });
            });
        }
        catch (error) {
            (0, log_js_1.logError)(new Error("Failed to reset auto mode opt-in: ".concat(error)));
        }
    }
}
