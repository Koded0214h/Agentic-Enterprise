"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var todo = {
    type: 'local',
    name: 'todo',
    description: 'Manage todos in the current session',
    supportsNonInteractive: false,
    argumentHint: '[text | done <n>]',
    load: function () { return Promise.resolve().then(function () { return require('./todo.js'); }); },
};
exports.default = todo;
