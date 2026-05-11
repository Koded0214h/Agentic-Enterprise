"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var growthbook_js_1 = require("../../services/analytics/growthbook.js");
var thinkback = {
    type: 'local-jsx',
    name: 'think-back',
    description: 'Your 2025 Claude Code Year in Review',
    isEnabled: function () {
        return (0, growthbook_js_1.checkStatsigFeatureGate_CACHED_MAY_BE_STALE)('tengu_thinkback');
    },
    load: function () { return Promise.resolve().then(function () { return require('./thinkback.js'); }); },
};
exports.default = thinkback;
