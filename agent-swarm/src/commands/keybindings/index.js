"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var loadUserBindings_js_1 = require("../../keybindings/loadUserBindings.js");
var keybindings = {
    name: 'keybindings',
    description: 'Open or create your keybindings configuration file',
    isEnabled: function () { return (0, loadUserBindings_js_1.isKeybindingCustomizationEnabled)(); },
    supportsNonInteractive: false,
    type: 'local',
    load: function () { return Promise.resolve().then(function () { return require('./keybindings.js'); }); },
};
exports.default = keybindings;
