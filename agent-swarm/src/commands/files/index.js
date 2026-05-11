"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var files = {
    type: 'local',
    name: 'files',
    description: 'List all files currently in context',
    isEnabled: function () { return process.env.USER_TYPE === 'ant'; },
    supportsNonInteractive: true,
    load: function () { return Promise.resolve().then(function () { return require('./files.js'); }); },
};
exports.default = files;
