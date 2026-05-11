"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rename = {
    type: 'local-jsx',
    name: 'rename',
    description: 'Rename the current conversation',
    immediate: true,
    argumentHint: '[name]',
    load: function () { return Promise.resolve().then(function () { return require('./rename.js'); }); },
};
exports.default = rename;
