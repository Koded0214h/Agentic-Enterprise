"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var plan = {
    type: 'local-jsx',
    name: 'plan',
    description: 'Enable plan mode or view the current session plan',
    argumentHint: '[open|<description>]',
    load: function () { return Promise.resolve().then(function () { return require('./plan.js'); }); },
};
exports.default = plan;
