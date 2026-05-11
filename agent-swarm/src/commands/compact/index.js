"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var envUtils_js_1 = require("../../utils/envUtils.js");
var compact = {
    type: 'local',
    name: 'compact',
    description: 'Clear conversation history but keep a summary in context. Optional: /compact [instructions for summarization]',
    isEnabled: function () { return !(0, envUtils_js_1.isEnvTruthy)(process.env.DISABLE_COMPACT); },
    supportsNonInteractive: true,
    argumentHint: '<optional custom summarization instructions>',
    load: function () { return Promise.resolve().then(function () { return require('./compact.js'); }); },
};
exports.default = compact;
