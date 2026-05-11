"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var state_js_1 = require("../../bootstrap/state.js");
var command = {
    name: 'chrome',
    description: 'Claude in Chrome (Beta) settings',
    availability: ['claude-ai'],
    isEnabled: function () { return !(0, state_js_1.getIsNonInteractiveSession)(); },
    type: 'local-jsx',
    load: function () { return Promise.resolve().then(function () { return require('./chrome.js'); }); },
};
exports.default = command;
