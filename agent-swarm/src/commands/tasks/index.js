"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tasks = {
    type: 'local-jsx',
    name: 'tasks',
    aliases: ['bashes'],
    description: 'List and manage background tasks',
    load: function () { return Promise.resolve().then(function () { return require('./tasks.js'); }); },
};
exports.default = tasks;
