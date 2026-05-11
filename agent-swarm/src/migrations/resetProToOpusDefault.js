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
exports.resetProToOpusDefault = resetProToOpusDefault;
var index_js_1 = require("src/services/analytics/index.js");
var auth_js_1 = require("../utils/auth.js");
var config_js_1 = require("../utils/config.js");
var providers_js_1 = require("../utils/model/providers.js");
var settings_js_1 = require("../utils/settings/settings.js");
function resetProToOpusDefault() {
    var config = (0, config_js_1.getGlobalConfig)();
    if (config.opusProMigrationComplete) {
        return;
    }
    var apiProvider = (0, providers_js_1.getAPIProvider)();
    // Pro users on firstParty get auto-migrated to Opus 4.5 default
    if (apiProvider !== 'firstParty' || !(0, auth_js_1.isProSubscriber)()) {
        (0, config_js_1.saveGlobalConfig)(function (current) { return (__assign(__assign({}, current), { opusProMigrationComplete: true })); });
        (0, index_js_1.logEvent)('tengu_reset_pro_to_opus_default', { skipped: true });
        return;
    }
    var settings = (0, settings_js_1.getSettings_DEPRECATED)();
    // Only show notification if user was on default (no custom model setting)
    if ((settings === null || settings === void 0 ? void 0 : settings.model) === undefined) {
        var opusProMigrationTimestamp_1 = Date.now();
        (0, config_js_1.saveGlobalConfig)(function (current) { return (__assign(__assign({}, current), { opusProMigrationComplete: true, opusProMigrationTimestamp: opusProMigrationTimestamp_1 })); });
        (0, index_js_1.logEvent)('tengu_reset_pro_to_opus_default', {
            skipped: false,
            had_custom_model: false,
        });
    }
    else {
        // User has a custom model setting, just mark migration complete
        (0, config_js_1.saveGlobalConfig)(function (current) { return (__assign(__assign({}, current), { opusProMigrationComplete: true })); });
        (0, index_js_1.logEvent)('tengu_reset_pro_to_opus_default', {
            skipped: false,
            had_custom_model: true,
        });
    }
}
