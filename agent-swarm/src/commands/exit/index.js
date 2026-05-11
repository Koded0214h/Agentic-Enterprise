"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var exit = {
    type: 'local-jsx',
    name: 'exit',
    aliases: ['quit'],
    description: 'Exit the REPL',
    immediate: true,
    load: function () { return Promise.resolve().then(function () { return require('./exit.js'); }); },
};
exports.default = exit;
