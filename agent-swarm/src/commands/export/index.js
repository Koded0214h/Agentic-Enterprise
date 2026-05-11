"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var exportCommand = {
    type: 'local-jsx',
    name: 'export',
    description: 'Export the current conversation to a file or clipboard',
    argumentHint: '[filename]',
    load: function () { return Promise.resolve().then(function () { return require('./export.js'); }); },
};
exports.default = exportCommand;
