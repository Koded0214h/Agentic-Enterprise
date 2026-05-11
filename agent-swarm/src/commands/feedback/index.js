"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_js_1 = require("../../services/policyLimits/index.js");
var envUtils_js_1 = require("../../utils/envUtils.js");
var privacyLevel_js_1 = require("../../utils/privacyLevel.js");
var feedback = {
    aliases: ['bug'],
    type: 'local-jsx',
    name: 'feedback',
    description: "Submit feedback about Claude Code",
    argumentHint: '[report]',
    isEnabled: function () {
        return !((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_USE_BEDROCK) ||
            (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_USE_VERTEX) ||
            (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_USE_FOUNDRY) ||
            (0, envUtils_js_1.isEnvTruthy)(process.env.DISABLE_FEEDBACK_COMMAND) ||
            (0, envUtils_js_1.isEnvTruthy)(process.env.DISABLE_BUG_COMMAND) ||
            (0, privacyLevel_js_1.isEssentialTrafficOnly)() ||
            process.env.USER_TYPE === 'ant' ||
            !(0, index_js_1.isPolicyAllowed)('allow_product_feedback'));
    },
    load: function () { return Promise.resolve().then(function () { return require('./feedback.js'); }); },
};
exports.default = feedback;
