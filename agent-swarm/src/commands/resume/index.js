"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var resume = {
    type: 'local-jsx',
    name: 'resume',
    description: 'Resume a previous conversation',
    aliases: ['continue'],
    argumentHint: '[conversation id or search term]',
    load: function () { return Promise.resolve().then(function () { return require('./resume.js'); }); },
};
exports.default = resume;
