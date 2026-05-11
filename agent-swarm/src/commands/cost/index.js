"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var auth_js_1 = require("../../utils/auth.js");
var cost = {
    type: 'local',
    name: 'cost',
    description: 'Show the total cost and duration of the current session',
    get isHidden() {
        // Keep visible for Ants even if they're subscribers (they see cost breakdowns)
        if (process.env.USER_TYPE === 'ant') {
            return false;
        }
        return (0, auth_js_1.isClaudeAISubscriber)();
    },
    supportsNonInteractive: true,
    load: function () { return Promise.resolve().then(function () { return require('./cost.js'); }); },
};
exports.default = cost;
