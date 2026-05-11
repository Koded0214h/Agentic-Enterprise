"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contextNonInteractive = exports.context = void 0;
var state_js_1 = require("../../bootstrap/state.js");
exports.context = {
    name: 'context',
    description: 'Visualize current context usage as a colored grid',
    isEnabled: function () { return !(0, state_js_1.getIsNonInteractiveSession)(); },
    type: 'local-jsx',
    load: function () { return Promise.resolve().then(function () { return require('./context.js'); }); },
};
exports.contextNonInteractive = {
    type: 'local',
    name: 'context',
    supportsNonInteractive: true,
    description: 'Show current context usage',
    get isHidden() {
        return !(0, state_js_1.getIsNonInteractiveSession)();
    },
    isEnabled: function () {
        return (0, state_js_1.getIsNonInteractiveSession)();
    },
    load: function () { return Promise.resolve().then(function () { return require('./context-noninteractive.js'); }); },
};
