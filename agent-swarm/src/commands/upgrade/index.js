"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var auth_js_1 = require("../../utils/auth.js");
var envUtils_js_1 = require("../../utils/envUtils.js");
var upgrade = {
    type: 'local-jsx',
    name: 'upgrade',
    description: 'Upgrade to Max for higher rate limits and more Opus',
    availability: ['claude-ai'],
    isEnabled: function () {
        return !(0, envUtils_js_1.isEnvTruthy)(process.env.DISABLE_UPGRADE_COMMAND) &&
            (0, auth_js_1.getSubscriptionType)() !== 'enterprise';
    },
    load: function () { return Promise.resolve().then(function () { return require('./upgrade.js'); }); },
};
exports.default = upgrade;
