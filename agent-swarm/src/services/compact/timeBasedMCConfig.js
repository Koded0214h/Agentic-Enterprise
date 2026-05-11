"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTimeBasedMCConfig = getTimeBasedMCConfig;
var growthbook_js_1 = require("../analytics/growthbook.js");
var TIME_BASED_MC_CONFIG_DEFAULTS = {
    enabled: false,
    gapThresholdMinutes: 60,
    keepRecent: 5,
};
function getTimeBasedMCConfig() {
    // Hoist the GB read so exposure fires on every eval path, not just when
    // the caller's other conditions (querySource, messages.length) pass.
    return (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_slate_heron', TIME_BASED_MC_CONFIG_DEFAULTS);
}
