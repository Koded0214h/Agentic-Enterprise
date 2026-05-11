"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extraUsageNonInteractive = exports.extraUsage = void 0;
var state_js_1 = require("../../bootstrap/state.js");
var auth_js_1 = require("../../utils/auth.js");
var envUtils_js_1 = require("../../utils/envUtils.js");
function isExtraUsageAllowed() {
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.DISABLE_EXTRA_USAGE_COMMAND)) {
        return false;
    }
    return (0, auth_js_1.isOverageProvisioningAllowed)();
}
exports.extraUsage = {
    type: 'local-jsx',
    name: 'extra-usage',
    description: 'Configure extra usage to keep working when limits are hit',
    isEnabled: function () { return isExtraUsageAllowed() && !(0, state_js_1.getIsNonInteractiveSession)(); },
    load: function () { return Promise.resolve().then(function () { return require('./extra-usage.js'); }); },
};
exports.extraUsageNonInteractive = {
    type: 'local',
    name: 'extra-usage',
    supportsNonInteractive: true,
    description: 'Configure extra usage to keep working when limits are hit',
    isEnabled: function () { return isExtraUsageAllowed() && (0, state_js_1.getIsNonInteractiveSession)(); },
    get isHidden() {
        return !(0, state_js_1.getIsNonInteractiveSession)();
    },
    load: function () { return Promise.resolve().then(function () { return require('./extra-usage-noninteractive.js'); }); },
};
