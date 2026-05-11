"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var spawn = {
    type: 'local',
    name: 'spawn',
    description: 'Spawn a swarm agent as a background sub-task',
    supportsNonInteractive: true,
    argumentHint: '<agent> [task]',
    load: function () { return Promise.resolve().then(function () { return require('./spawn.js'); }); },
};
exports.default = spawn;
