"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var status = {
    type: 'local-jsx',
    name: 'status',
    description: 'Show Claude Code status including version, model, account, API connectivity, and tool statuses',
    immediate: true,
    load: function () { return Promise.resolve().then(function () { return require('./status.js'); }); },
};
exports.default = status;
