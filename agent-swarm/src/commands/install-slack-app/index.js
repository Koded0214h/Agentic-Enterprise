"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var installSlackApp = {
    type: 'local',
    name: 'install-slack-app',
    description: 'Install the Claude Slack app',
    availability: ['claude-ai'],
    supportsNonInteractive: false,
    load: function () { return Promise.resolve().then(function () { return require('./install-slack-app.js'); }); },
};
exports.default = installSlackApp;
