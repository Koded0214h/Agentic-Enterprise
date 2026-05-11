"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var help = {
    type: 'local-jsx',
    name: 'help',
    description: 'Show help and available commands',
    load: function () { return Promise.resolve().then(function () { return require('./help.js'); }); },
};
exports.default = help;
