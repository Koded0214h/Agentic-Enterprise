"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var stickers = {
    type: 'local',
    name: 'stickers',
    description: 'Order Claude Code stickers',
    supportsNonInteractive: false,
    load: function () { return Promise.resolve().then(function () { return require('./stickers.js'); }); },
};
exports.default = stickers;
