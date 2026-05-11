"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var theme = {
    type: 'local-jsx',
    name: 'theme',
    description: 'Change the theme',
    load: function () { return Promise.resolve().then(function () { return require('./theme.js'); }); },
};
exports.default = theme;
