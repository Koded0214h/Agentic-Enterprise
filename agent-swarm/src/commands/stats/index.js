"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var stats = {
    type: 'local-jsx',
    name: 'stats',
    description: 'Show your Claude Code usage statistics and activity',
    load: function () { return Promise.resolve().then(function () { return require('./stats.js'); }); },
};
exports.default = stats;
