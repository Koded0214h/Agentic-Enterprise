"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateOpusToOpus1m = migrateOpusToOpus1m;
var index_js_1 = require("../services/analytics/index.js");
var model_js_1 = require("../utils/model/model.js");
var settings_js_1 = require("../utils/settings/settings.js");
/**
 * Migrate users with 'opus' pinned in their settings to 'opus[1m]' when they
 * are eligible for the merged Opus 1M experience (Max/Team Premium on 1P).
 *
 * CLI invocations with --model opus are unaffected: that flag is a runtime
 * override and does not touch userSettings, so it continues to use plain Opus.
 *
 * Pro subscribers are skipped — they retain separate Opus and Opus 1M options.
 * 3P users are skipped — their model strings are full model IDs, not aliases.
 *
 * Idempotent: only writes if userSettings.model is exactly 'opus'.
 */
function migrateOpusToOpus1m() {
    var _a;
    if (!(0, model_js_1.isOpus1mMergeEnabled)()) {
        return;
    }
    var model = (_a = (0, settings_js_1.getSettingsForSource)('userSettings')) === null || _a === void 0 ? void 0 : _a.model;
    if (model !== 'opus') {
        return;
    }
    var migrated = 'opus[1m]';
    var modelToSet = (0, model_js_1.parseUserSpecifiedModel)(migrated) ===
        (0, model_js_1.parseUserSpecifiedModel)((0, model_js_1.getDefaultMainLoopModelSetting)())
        ? undefined
        : migrated;
    (0, settings_js_1.updateSettingsForSource)('userSettings', { model: modelToSet });
    (0, index_js_1.logEvent)('tengu_opus_to_opus1m_migration', {});
}
