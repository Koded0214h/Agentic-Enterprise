"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var growthbook_js_1 = require("../../services/analytics/growthbook.js");
var index_js_1 = require("../../services/policyLimits/index.js");
var web = {
    type: 'local-jsx',
    name: 'web-setup',
    description: 'Setup Claude Code on the web (requires connecting your GitHub account)',
    availability: ['claude-ai'],
    isEnabled: function () {
        return (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_cobalt_lantern', false) &&
            (0, index_js_1.isPolicyAllowed)('allow_remote_sessions');
    },
    get isHidden() {
        return !(0, index_js_1.isPolicyAllowed)('allow_remote_sessions');
    },
    load: function () { return Promise.resolve().then(function () { return require('./remote-setup.js'); }); },
};
exports.default = web;
