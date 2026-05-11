"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bun_bundle_1 = require("bun:bundle");
var branch = {
    type: 'local-jsx',
    name: 'branch',
    // 'fork' alias only when /fork doesn't exist as its own command
    aliases: (0, bun_bundle_1.feature)('FORK_SUBAGENT') ? [] : ['fork'],
    description: 'Create a branch of the current conversation at this point',
    argumentHint: '[name]',
    load: function () { return Promise.resolve().then(function () { return require('./branch.js'); }); },
};
exports.default = branch;
