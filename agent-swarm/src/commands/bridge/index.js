"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bun_bundle_1 = require("bun:bundle");
var bridgeEnabled_js_1 = require("../../bridge/bridgeEnabled.js");
function isEnabled() {
    if (!(0, bun_bundle_1.feature)('BRIDGE_MODE')) {
        return false;
    }
    return (0, bridgeEnabled_js_1.isBridgeEnabled)();
}
var bridge = {
    type: 'local-jsx',
    name: 'remote-control',
    aliases: ['rc'],
    description: 'Connect this terminal for remote-control sessions',
    argumentHint: '[name]',
    isEnabled: isEnabled,
    get isHidden() {
        return !isEnabled();
    },
    immediate: true,
    load: function () { return Promise.resolve().then(function () { return require('./bridge.js'); }); },
};
exports.default = bridge;
