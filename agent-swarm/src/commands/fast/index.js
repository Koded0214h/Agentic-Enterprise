"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fastMode_js_1 = require("../../utils/fastMode.js");
var immediateCommand_js_1 = require("../../utils/immediateCommand.js");
var fast = {
    type: 'local-jsx',
    name: 'fast',
    get description() {
        return "Toggle fast mode (".concat(fastMode_js_1.FAST_MODE_MODEL_DISPLAY, " only)");
    },
    availability: ['claude-ai', 'console'],
    isEnabled: function () { return (0, fastMode_js_1.isFastModeEnabled)(); },
    get isHidden() {
        return !(0, fastMode_js_1.isFastModeEnabled)();
    },
    argumentHint: '[on|off]',
    get immediate() {
        return (0, immediateCommand_js_1.shouldInferenceConfigCommandBeImmediate)();
    },
    load: function () { return Promise.resolve().then(function () { return require('./fast.js'); }); },
};
exports.default = fast;
