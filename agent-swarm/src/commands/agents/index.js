"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var agents = {
    type: 'local-jsx',
    name: 'agents',
    description: 'Manage agent configurations',
    load: function () { return Promise.resolve().then(function () { return require('./agents.js'); }); },
};
exports.default = agents;
