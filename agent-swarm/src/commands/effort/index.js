"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var immediateCommand_js_1 = require("../../utils/immediateCommand.js");
exports.default = {
    type: 'local-jsx',
    name: 'effort',
    description: 'Set effort level for model usage',
    argumentHint: '[low|medium|high|max|auto]',
    get immediate() {
        return (0, immediateCommand_js_1.shouldInferenceConfigCommandBeImmediate)();
    },
    load: function () { return Promise.resolve().then(function () { return require('./effort.js'); }); },
};
