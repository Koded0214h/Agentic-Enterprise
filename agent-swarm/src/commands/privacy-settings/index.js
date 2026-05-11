"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var auth_js_1 = require("../../utils/auth.js");
var privacySettings = {
    type: 'local-jsx',
    name: 'privacy-settings',
    description: 'View and update your privacy settings',
    isEnabled: function () {
        return (0, auth_js_1.isConsumerSubscriber)();
    },
    load: function () { return Promise.resolve().then(function () { return require('./privacy-settings.js'); }); },
};
exports.default = privacySettings;
