"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var envUtils_js_1 = require("../../utils/envUtils.js");
exports.default = {
    type: 'local-jsx',
    name: 'logout',
    description: 'Sign out from your Anthropic account',
    isEnabled: function () { return !(0, envUtils_js_1.isEnvTruthy)(process.env.DISABLE_LOGOUT_COMMAND); },
    load: function () { return Promise.resolve().then(function () { return require('./logout.js'); }); },
};
