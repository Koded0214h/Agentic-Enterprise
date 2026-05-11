"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var color = {
    type: 'local-jsx',
    name: 'color',
    description: 'Set the prompt bar color for this session',
    immediate: true,
    argumentHint: '<color|default>',
    load: function () { return Promise.resolve().then(function () { return require('./color.js'); }); },
};
exports.default = color;
