"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var referral_js_1 = require("../../services/api/referral.js");
exports.default = {
    type: 'local-jsx',
    name: 'passes',
    get description() {
        var reward = (0, referral_js_1.getCachedReferrerReward)();
        if (reward) {
            return 'Share a free week of Claude Code with friends and earn extra usage';
        }
        return 'Share a free week of Claude Code with friends';
    },
    get isHidden() {
        var _a = (0, referral_js_1.checkCachedPassesEligibility)(), eligible = _a.eligible, hasCache = _a.hasCache;
        return !eligible || !hasCache;
    },
    load: function () { return Promise.resolve().then(function () { return require('./passes.js'); }); },
};
