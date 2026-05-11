"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var addDir = {
    type: 'local-jsx',
    name: 'add-dir',
    description: 'Add a new working directory',
    argumentHint: '<path>',
    load: function () { return Promise.resolve().then(function () { return require('./add-dir.js'); }); },
};
exports.default = addDir;
