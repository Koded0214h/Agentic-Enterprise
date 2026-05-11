"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    type: 'local-jsx',
    name: 'diff',
    description: 'View uncommitted changes and per-turn diffs',
    load: function () { return Promise.resolve().then(function () { return require('./diff.js'); }); },
};
