"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var releaseNotes = {
    description: 'View release notes',
    name: 'release-notes',
    type: 'local',
    supportsNonInteractive: true,
    load: function () { return Promise.resolve().then(function () { return require('./release-notes.js'); }); },
};
exports.default = releaseNotes;
