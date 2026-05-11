"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MACRO = void 0;
exports.feature = feature;
function feature(name) {
    // Always return false for features in Agent Swarm, as we are running in Node, not Bun-bundled mode.
    return false;
}
exports.MACRO = {
    VERSION: '4.0.2',
    PACKAGE_URL: '@anas.abubakar/swarm',
};
// Global polyfill for Node runtime
if (typeof global !== 'undefined') {
    global.MACRO = exports.MACRO;
}
