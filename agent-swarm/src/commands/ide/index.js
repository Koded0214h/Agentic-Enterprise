"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ide = {
    type: 'local-jsx',
    name: 'ide',
    description: 'Manage IDE integrations and show status',
    argumentHint: '[open]',
    load: function () { return Promise.resolve().then(function () { return require('./ide.js'); }); },
};
exports.default = ide;
