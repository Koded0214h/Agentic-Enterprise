"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var figures_1 = require("figures");
var sandbox_adapter_js_1 = require("../../utils/sandbox/sandbox-adapter.js");
var command = {
    name: 'sandbox',
    get description() {
        var currentlyEnabled = sandbox_adapter_js_1.SandboxManager.isSandboxingEnabled();
        var autoAllow = sandbox_adapter_js_1.SandboxManager.isAutoAllowBashIfSandboxedEnabled();
        var allowUnsandboxed = sandbox_adapter_js_1.SandboxManager.areUnsandboxedCommandsAllowed();
        var isLocked = sandbox_adapter_js_1.SandboxManager.areSandboxSettingsLockedByPolicy();
        var hasDeps = sandbox_adapter_js_1.SandboxManager.checkDependencies().errors.length === 0;
        // Show warning icon if dependencies missing, otherwise enabled/disabled status
        var icon;
        if (!hasDeps) {
            icon = figures_1.default.warning;
        }
        else {
            icon = currentlyEnabled ? figures_1.default.tick : figures_1.default.circle;
        }
        var statusText = 'sandbox disabled';
        if (currentlyEnabled) {
            statusText = autoAllow
                ? 'sandbox enabled (auto-allow)'
                : 'sandbox enabled';
            // Add unsandboxed fallback status
            statusText += allowUnsandboxed ? ', fallback allowed' : '';
        }
        if (isLocked) {
            statusText += ' (managed)';
        }
        return "".concat(icon, " ").concat(statusText, " (\u23CE to configure)");
    },
    argumentHint: 'exclude "command pattern"',
    get isHidden() {
        return (!sandbox_adapter_js_1.SandboxManager.isSupportedPlatform() ||
            !sandbox_adapter_js_1.SandboxManager.isPlatformInEnabledList());
    },
    immediate: true,
    type: 'local-jsx',
    load: function () { return Promise.resolve().then(function () { return require('./sandbox-toggle.js'); }); },
};
exports.default = command;
