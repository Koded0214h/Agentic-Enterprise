"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var skills = {
    type: 'local-jsx',
    name: 'skills',
    description: 'List available skills',
    load: function () { return Promise.resolve().then(function () { return require('./skills.js'); }); },
};
exports.default = skills;
