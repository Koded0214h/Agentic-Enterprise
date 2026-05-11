"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var clear = {
    type: 'local',
    name: 'clear',
    description: 'Clear conversation history and free up context',
    aliases: ['reset', 'new'],
    supportsNonInteractive: false, // Should just create a new session
    load: function () { return Promise.resolve().then(function () { return require('./clear.js'); }); },
};
exports.default = clear;
