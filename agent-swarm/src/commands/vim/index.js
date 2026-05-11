"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var command = {
    name: 'vim',
    description: 'Toggle between Vim and Normal editing modes',
    supportsNonInteractive: false,
    type: 'local',
    load: function () { return Promise.resolve().then(function () { return require('./vim.js'); }); },
};
exports.default = command;
