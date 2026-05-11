"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var growthbook_js_1 = require("../../services/analytics/growthbook.js");
// Hidden command that just plays the animation
// Called by the thinkback skill after generation is complete
var thinkbackPlay = {
    type: 'local',
    name: 'thinkback-play',
    description: 'Play the thinkback animation',
    isEnabled: function () {
        return (0, growthbook_js_1.checkStatsigFeatureGate_CACHED_MAY_BE_STALE)('tengu_thinkback');
    },
    isHidden: true,
    supportsNonInteractive: false,
    load: function () { return Promise.resolve().then(function () { return require('./thinkback-play.js'); }); },
};
exports.default = thinkbackPlay;
