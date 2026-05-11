"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var engines = {
    type: 'local',
    name: 'engines',
    description: 'List all available swarm engines',
    supportsNonInteractive: true,
    load: function () { return Promise.resolve().then(function () { return require('./engines.js'); }); },
};
exports.default = engines;
