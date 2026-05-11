"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var auth_js_1 = require("../../utils/auth.js");
var rateLimitOptions = {
    type: 'local-jsx',
    name: 'rate-limit-options',
    description: 'Show options when rate limit is reached',
    isEnabled: function () {
        if (!(0, auth_js_1.isClaudeAISubscriber)()) {
            return false;
        }
        return true;
    },
    isHidden: true, // Hidden from help - only used internally
    load: function () { return Promise.resolve().then(function () { return require('./rate-limit-options.js'); }); },
};
exports.default = rateLimitOptions;
