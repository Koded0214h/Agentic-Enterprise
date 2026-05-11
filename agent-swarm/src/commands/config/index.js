"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config = {
    aliases: ['settings'],
    type: 'local-jsx',
    name: 'config',
    description: 'Open config panel',
    load: function () { return Promise.resolve().then(function () { return require('./config.js'); }); },
};
exports.default = config;
