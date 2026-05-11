"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rewind = {
    description: "Restore the code and/or conversation to a previous point",
    name: 'rewind',
    aliases: ['checkpoint'],
    argumentHint: '',
    type: 'local',
    supportsNonInteractive: false,
    load: function () { return Promise.resolve().then(function () { return require('./rewind.js'); }); },
};
exports.default = rewind;
