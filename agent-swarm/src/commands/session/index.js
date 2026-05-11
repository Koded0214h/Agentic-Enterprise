"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var state_js_1 = require("../../bootstrap/state.js");
var session = {
    type: 'local-jsx',
    name: 'session',
    aliases: ['remote'],
    description: 'Show remote session URL and QR code',
    isEnabled: function () { return (0, state_js_1.getIsRemoteMode)(); },
    get isHidden() {
        return !(0, state_js_1.getIsRemoteMode)();
    },
    load: function () { return Promise.resolve().then(function () { return require('./session.js'); }); },
};
exports.default = session;
