"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var envUtils_js_1 = require("../../utils/envUtils.js");
var installGitHubApp = {
    type: 'local-jsx',
    name: 'install-github-app',
    description: 'Set up Claude GitHub Actions for a repository',
    availability: ['claude-ai', 'console'],
    isEnabled: function () { return !(0, envUtils_js_1.isEnvTruthy)(process.env.DISABLE_INSTALL_GITHUB_APP_COMMAND); },
    load: function () { return Promise.resolve().then(function () { return require('./install-github-app.js'); }); },
};
exports.default = installGitHubApp;
