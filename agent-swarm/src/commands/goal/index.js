"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var goal = {
    type: 'local',
    name: 'goal',
    description: 'Set or view the current session goal',
    supportsNonInteractive: false,
    argumentHint: '[description]',
    load: function () { return Promise.resolve().then(function () { return require('./goal.js'); }); },
};
exports.default = goal;
