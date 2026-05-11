"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var engine = {
    type: 'local',
    name: 'engine',
    description: 'Show or set the current swarm engine',
    supportsNonInteractive: true,
    argumentHint: '[name]',
    load: function () { return Promise.resolve().then(function () { return require('./engine.js'); }); },
};
exports.default = engine;
