"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isSupportedPlatform() {
    if (process.platform === 'darwin') {
        return true;
    }
    if (process.platform === 'win32' && process.arch === 'x64') {
        return true;
    }
    return false;
}
var desktop = {
    type: 'local-jsx',
    name: 'desktop',
    aliases: ['app'],
    description: 'Continue the current session in Claude Desktop',
    availability: ['claude-ai'],
    isEnabled: isSupportedPlatform,
    get isHidden() {
        return !isSupportedPlatform();
    },
    load: function () { return Promise.resolve().then(function () { return require('./desktop.js'); }); },
};
exports.default = desktop;
