"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemDirectories = getSystemDirectories;
var os_1 = require("os");
var path_1 = require("path");
var debug_js_1 = require("./debug.js");
var platform_js_1 = require("./platform.js");
/**
 * Get cross-platform system directories
 * Handles differences between Windows, macOS, Linux, and WSL
 * @param options Optional overrides for testing (env, homedir, platform)
 */
function getSystemDirectories(options) {
    var _a, _b, _c;
    var platform = (_a = options === null || options === void 0 ? void 0 : options.platform) !== null && _a !== void 0 ? _a : (0, platform_js_1.getPlatform)();
    var homeDir = (_b = options === null || options === void 0 ? void 0 : options.homedir) !== null && _b !== void 0 ? _b : (0, os_1.homedir)();
    var env = (_c = options === null || options === void 0 ? void 0 : options.env) !== null && _c !== void 0 ? _c : process.env;
    // Default paths used by most platforms
    var defaults = {
        HOME: homeDir,
        DESKTOP: (0, path_1.join)(homeDir, 'Desktop'),
        DOCUMENTS: (0, path_1.join)(homeDir, 'Documents'),
        DOWNLOADS: (0, path_1.join)(homeDir, 'Downloads'),
    };
    switch (platform) {
        case 'windows': {
            // Windows: Use USERPROFILE if available (handles localized folder names)
            var userProfile = env.USERPROFILE || homeDir;
            return {
                HOME: homeDir,
                DESKTOP: (0, path_1.join)(userProfile, 'Desktop'),
                DOCUMENTS: (0, path_1.join)(userProfile, 'Documents'),
                DOWNLOADS: (0, path_1.join)(userProfile, 'Downloads'),
            };
        }
        case 'linux':
        case 'wsl': {
            // Linux/WSL: Check XDG Base Directory specification first
            return {
                HOME: homeDir,
                DESKTOP: env.XDG_DESKTOP_DIR || defaults.DESKTOP,
                DOCUMENTS: env.XDG_DOCUMENTS_DIR || defaults.DOCUMENTS,
                DOWNLOADS: env.XDG_DOWNLOAD_DIR || defaults.DOWNLOADS,
            };
        }
        case 'macos':
        default: {
            // macOS and unknown platforms use standard paths
            if (platform === 'unknown') {
                (0, debug_js_1.logForDebugging)("Unknown platform detected, using default paths");
            }
            return defaults;
        }
    }
}
