"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var auth_js_1 = require("../../utils/auth.js");
var envUtils_js_1 = require("../../utils/envUtils.js");
exports.default = (function () {
    return ({
        type: 'local-jsx',
        name: 'login',
        description: (0, auth_js_1.hasAnthropicApiKeyAuth)()
            ? 'Switch Anthropic accounts'
            : 'Sign in with your Anthropic account',
        isEnabled: function () { return !(0, envUtils_js_1.isEnvTruthy)(process.env.DISABLE_LOGIN_COMMAND); },
        load: function () { return Promise.resolve().then(function () { return require('./login.js'); }); },
    });
});
