"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var env_js_1 = require("../../utils/env.js");
// Terminals that natively support CSI u / Kitty keyboard protocol
var NATIVE_CSIU_TERMINALS = {
    ghostty: 'Ghostty',
    kitty: 'Kitty',
    'iTerm.app': 'iTerm2',
    WezTerm: 'WezTerm',
};
var terminalSetup = {
    type: 'local-jsx',
    name: 'terminal-setup',
    description: env_js_1.env.terminal === 'Apple_Terminal'
        ? 'Enable Option+Enter key binding for newlines and visual bell'
        : 'Install Shift+Enter key binding for newlines',
    isHidden: env_js_1.env.terminal !== null && env_js_1.env.terminal in NATIVE_CSIU_TERMINALS,
    load: function () { return Promise.resolve().then(function () { return require('./terminalSetup.js'); }); },
};
exports.default = terminalSetup;
