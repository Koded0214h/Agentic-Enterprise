"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("../../services/policyLimits/index.js");
var auth_js_1 = require("../../utils/auth.js");
exports.default = {
    type: 'local-jsx',
    name: 'remote-env',
    description: 'Configure the default remote environment for teleport sessions',
    isEnabled: function () {
        return (0, auth_js_1.isClaudeAISubscriber)() && (0, index_js_1.isPolicyAllowed)('allow_remote_sessions');
    },
    get isHidden() {
        return !(0, auth_js_1.isClaudeAISubscriber)() || !(0, index_js_1.isPolicyAllowed)('allow_remote_sessions');
    },
    load: function () { return Promise.resolve().then(function () { return require('./remote-env.js'); }); },
};
