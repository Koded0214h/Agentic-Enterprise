"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var reloadPlugins = {
    type: 'local',
    name: 'reload-plugins',
    description: 'Activate pending plugin changes in the current session',
    // SDK callers use query.reloadPlugins() (control request) instead of
    // sending this as a text prompt — that returns structured data
    // (commands, agents, plugins, mcpServers) for UI updates.
    supportsNonInteractive: false,
    load: function () { return Promise.resolve().then(function () { return require('./reload-plugins.js'); }); },
};
exports.default = reloadPlugins;
