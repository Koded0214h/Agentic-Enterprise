"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var btw = {
    type: 'local-jsx',
    name: 'btw',
    description: 'Ask a quick side question without interrupting the main conversation',
    immediate: true,
    argumentHint: '<question>',
    load: function () { return Promise.resolve().then(function () { return require('./btw.js'); }); },
};
exports.default = btw;
