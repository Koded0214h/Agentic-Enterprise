"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var immediateCommand_js_1 = require("../../utils/immediateCommand.js");
var model_js_1 = require("../../utils/model/model.js");
exports.default = {
    type: 'local-jsx',
    name: 'model',
    get description() {
        return "Set the AI model for Claude Code (currently ".concat((0, model_js_1.renderModelName)((0, model_js_1.getMainLoopModel)()), ")");
    },
    argumentHint: '[model]',
    get immediate() {
        return (0, immediateCommand_js_1.shouldInferenceConfigCommandBeImmediate)();
    },
    load: function () { return Promise.resolve().then(function () { return require('./model.js'); }); },
};
