"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var hooks = {
    type: 'local-jsx',
    name: 'hooks',
    description: 'View hook configurations for tool events',
    immediate: true,
    load: function () { return Promise.resolve().then(function () { return require('./hooks.js'); }); },
};
exports.default = hooks;
