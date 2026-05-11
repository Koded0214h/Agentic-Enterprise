"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var outputStyle = {
    type: 'local-jsx',
    name: 'output-style',
    description: 'Deprecated: use /config to change output style',
    isHidden: true,
    load: function () { return Promise.resolve().then(function () { return require('./output-style.js'); }); },
};
exports.default = outputStyle;
