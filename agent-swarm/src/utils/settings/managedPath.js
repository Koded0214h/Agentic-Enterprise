"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getManagedSettingsDropInDir = exports.getManagedFilePath = void 0;
var memoize_js_1 = require("lodash-es/memoize.js");
var path_1 = require("path");
var platform_js_1 = require("../platform.js");
/**
 * Get the path to the managed settings directory based on the current platform.
 */
exports.getManagedFilePath = (0, memoize_js_1.default)(function () {
    // Allow override for testing/demos (Ant-only, eliminated from external builds)
    if (process.env.USER_TYPE === 'ant' &&
        process.env.CLAUDE_CODE_MANAGED_SETTINGS_PATH) {
        return process.env.CLAUDE_CODE_MANAGED_SETTINGS_PATH;
    }
    switch ((0, platform_js_1.getPlatform)()) {
        case 'macos':
            return '/Library/Application Support/ClaudeCode';
        case 'windows':
            return 'C:\\Program Files\\ClaudeCode';
        default:
            return '/etc/claude-code';
    }
});
/**
 * Get the path to the managed-settings.d/ drop-in directory.
 * managed-settings.json is merged first (base), then files in this directory
 * are merged alphabetically on top (drop-ins override base, later files win).
 */
exports.getManagedSettingsDropInDir = (0, memoize_js_1.default)(function () {
    return (0, path_1.join)((0, exports.getManagedFilePath)(), 'managed-settings.d');
});
