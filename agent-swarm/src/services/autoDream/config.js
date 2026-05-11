"use strict";
// Leaf config module — intentionally minimal imports so UI components
// can read the auto-dream enabled state without dragging in the forked
// agent / task registry / message builder chain that autoDream.ts pulls in.
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAutoDreamEnabled = isAutoDreamEnabled;
var settings_js_1 = require("../../utils/settings/settings.js");
var growthbook_js_1 = require("../analytics/growthbook.js");
/**
 * Whether background memory consolidation should run. User setting
 * (autoDreamEnabled in settings.json) overrides the GrowthBook default
 * when explicitly set; otherwise falls through to tengu_onyx_plover.
 */
function isAutoDreamEnabled() {
    var setting = (0, settings_js_1.getInitialSettings)().autoDreamEnabled;
    if (setting !== undefined)
        return setting;
    var gb = (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_onyx_plover', null);
    return (gb === null || gb === void 0 ? void 0 : gb.enabled) === true;
}
