"use strict";
/**
 * Shared constants and path builders for MDM settings modules.
 *
 * This module has ZERO heavy imports (only `os`) — safe to use from mdmRawRead.ts.
 * Both mdmRawRead.ts and mdmSettings.ts import from here to avoid duplication.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MDM_SUBPROCESS_TIMEOUT_MS = exports.PLUTIL_ARGS_PREFIX = exports.PLUTIL_PATH = exports.WINDOWS_REGISTRY_VALUE_NAME = exports.WINDOWS_REGISTRY_KEY_PATH_HKCU = exports.WINDOWS_REGISTRY_KEY_PATH_HKLM = exports.MACOS_PREFERENCE_DOMAIN = void 0;
exports.getMacOSPlistPaths = getMacOSPlistPaths;
var os_1 = require("os");
var path_1 = require("path");
/** macOS preference domain for Claude Code MDM profiles. */
exports.MACOS_PREFERENCE_DOMAIN = 'com.anthropic.claudecode';
/**
 * Windows registry key paths for Claude Code MDM policies.
 *
 * These keys live under SOFTWARE\Policies which is on the WOW64 shared key
 * list — both 32-bit and 64-bit processes see the same values without
 * redirection. Do not move these to SOFTWARE\ClaudeCode, as SOFTWARE is
 * redirected and 32-bit processes would silently read from WOW6432Node.
 * See: https://learn.microsoft.com/en-us/windows/win32/winprog64/shared-registry-keys
 */
exports.WINDOWS_REGISTRY_KEY_PATH_HKLM = 'HKLM\\SOFTWARE\\Policies\\ClaudeCode';
exports.WINDOWS_REGISTRY_KEY_PATH_HKCU = 'HKCU\\SOFTWARE\\Policies\\ClaudeCode';
/** Windows registry value name containing the JSON settings blob. */
exports.WINDOWS_REGISTRY_VALUE_NAME = 'Settings';
/** Path to macOS plutil binary. */
exports.PLUTIL_PATH = '/usr/bin/plutil';
/** Arguments for plutil to convert plist to JSON on stdout (append plist path). */
exports.PLUTIL_ARGS_PREFIX = ['-convert', 'json', '-o', '-', '--'];
/** Subprocess timeout in milliseconds. */
exports.MDM_SUBPROCESS_TIMEOUT_MS = 5000;
/**
 * Build the list of macOS plist paths in priority order (highest first).
 * Evaluates `process.env.USER_TYPE` at call time so ant-only paths are
 * included only when appropriate.
 */
function getMacOSPlistPaths() {
    var username = '';
    try {
        username = (0, os_1.userInfo)().username;
    }
    catch (_a) {
        // ignore
    }
    var paths = [];
    if (username) {
        paths.push({
            path: "/Library/Managed Preferences/".concat(username, "/").concat(exports.MACOS_PREFERENCE_DOMAIN, ".plist"),
            label: 'per-user managed preferences',
        });
    }
    paths.push({
        path: "/Library/Managed Preferences/".concat(exports.MACOS_PREFERENCE_DOMAIN, ".plist"),
        label: 'device-level managed preferences',
    });
    // Allow user-writable preferences for local MDM testing in ant builds only.
    if (process.env.USER_TYPE === 'ant') {
        paths.push({
            path: (0, path_1.join)((0, os_1.homedir)(), 'Library', 'Preferences', "".concat(exports.MACOS_PREFERENCE_DOMAIN, ".plist")),
            label: 'user preferences (ant-only)',
        });
    }
    return paths;
}
