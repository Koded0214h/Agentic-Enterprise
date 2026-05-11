"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var note = {
    type: 'local',
    name: 'note',
    description: 'Add a quick note to the current session',
    supportsNonInteractive: false,
    argumentHint: '[text]',
    load: function () { return Promise.resolve().then(function () { return require('./note.js'); }); },
};
exports.default = note;
