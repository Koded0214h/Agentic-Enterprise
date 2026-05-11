"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mobile = {
    type: 'local-jsx',
    name: 'mobile',
    aliases: ['ios', 'android'],
    description: 'Show QR code to download the Claude mobile app',
    load: function () { return Promise.resolve().then(function () { return require('./mobile.js'); }); },
};
exports.default = mobile;
