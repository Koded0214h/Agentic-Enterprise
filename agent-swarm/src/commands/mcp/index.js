"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mcp = {
    type: 'local-jsx',
    name: 'mcp',
    description: 'Manage MCP servers',
    immediate: true,
    argumentHint: '[enable|disable [server-name]]',
    load: function () { return Promise.resolve().then(function () { return require('./mcp.js'); }); },
};
exports.default = mcp;
