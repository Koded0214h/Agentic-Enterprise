"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var copy = {
    type: 'local-jsx',
    name: 'copy',
    description: "Copy Claude's last response to clipboard (or /copy N for the Nth-latest)",
    load: function () { return Promise.resolve().then(function () { return require('./copy.js'); }); },
};
exports.default = copy;
