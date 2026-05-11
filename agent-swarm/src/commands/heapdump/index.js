"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var heapDump = {
    type: 'local',
    name: 'heapdump',
    description: 'Dump the JS heap to ~/Desktop',
    isHidden: true,
    supportsNonInteractive: true,
    load: function () { return Promise.resolve().then(function () { return require('./heapdump.js'); }); },
};
exports.default = heapDump;
