"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tag = {
    type: 'local-jsx',
    name: 'tag',
    description: 'Toggle a searchable tag on the current session',
    isEnabled: function () { return process.env.USER_TYPE === 'ant'; },
    argumentHint: '<tag-name>',
    load: function () { return Promise.resolve().then(function () { return require('./tag.js'); }); },
};
exports.default = tag;
