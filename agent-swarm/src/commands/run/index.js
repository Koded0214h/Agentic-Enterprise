"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var run = {
    type: 'local',
    name: 'run',
    description: 'Run a specific swarm agent with an optional task',
    supportsNonInteractive: true,
    argumentHint: '<agent> [task]',
    load: function () { return Promise.resolve().then(function () { return require('./run.js'); }); },
};
exports.default = run;
