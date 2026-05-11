"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateFennecToOpus = migrateFennecToOpus;
var settings_js_1 = require("../utils/settings/settings.js");
/**
 * Migrate users on removed fennec model aliases to their new Opus 4.6 aliases.
 * - fennec-latest → opus
 * - fennec-latest[1m] → opus[1m]
 * - fennec-fast-latest → opus[1m] + fast mode
 * - opus-4-5-fast → opus + fast mode
 *
 * Only touches userSettings. Reading and writing the same source keeps this
 * idempotent without a completion flag. Fennec aliases in project/local/policy
 * settings are left alone — we can't rewrite those, and reading merged
 * settings here would cause infinite re-runs + silent global promotion.
 */
function migrateFennecToOpus() {
    if (process.env.USER_TYPE !== 'ant') {
        return;
    }
    var settings = (0, settings_js_1.getSettingsForSource)('userSettings');
    var model = settings === null || settings === void 0 ? void 0 : settings.model;
    if (typeof model === 'string') {
        if (model.startsWith('fennec-latest[1m]')) {
            (0, settings_js_1.updateSettingsForSource)('userSettings', {
                model: 'opus[1m]',
            });
        }
        else if (model.startsWith('fennec-latest')) {
            (0, settings_js_1.updateSettingsForSource)('userSettings', {
                model: 'opus',
            });
        }
        else if (model.startsWith('fennec-fast-latest') ||
            model.startsWith('opus-4-5-fast')) {
            (0, settings_js_1.updateSettingsForSource)('userSettings', {
                model: 'opus[1m]',
                fastMode: true,
            });
        }
    }
}
