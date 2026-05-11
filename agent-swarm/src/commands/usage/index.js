"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    type: 'local-jsx',
    name: 'usage',
    description: 'Show plan usage limits',
    availability: ['claude-ai'],
    load: function () { return Promise.resolve().then(function () { return require('./usage.js'); }); },
};
