"use strict";
/**
 * Bun Path Utility
 *
 * Resolves the Bun executable path for environments where Bun is not in PATH
 * (e.g., fish shell users where ~/.config/fish/config.fish isn't read by /bin/sh)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBunPath = getBunPath;
exports.getBunPathOrThrow = getBunPathOrThrow;
exports.isBunAvailable = isBunAvailable;
var child_process_1 = require("child_process");
var fs_1 = require("fs");
var path_1 = require("path");
var os_1 = require("os");
var logger_js_1 = require("./logger.js");
/**
 * Get the Bun executable path
 * Tries PATH first, then checks common installation locations
 * Returns absolute path if found, null otherwise
 */
function getBunPath() {
    var isWindows = process.platform === 'win32';
    // Try PATH first
    try {
        var result = (0, child_process_1.spawnSync)('bun', ['--version'], {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe'],
            shell: false // SECURITY: No need for shell, bun is the executable
        });
        if (result.status === 0) {
            return 'bun'; // Available in PATH
        }
    }
    catch (e) {
        logger_js_1.logger.debug('SYSTEM', 'Bun not found in PATH, checking common installation locations', {
            error: e instanceof Error ? e.message : String(e)
        });
    }
    // Check common installation paths
    var bunPaths = isWindows
        ? [(0, path_1.join)((0, os_1.homedir)(), '.bun', 'bin', 'bun.exe')]
        : [
            (0, path_1.join)((0, os_1.homedir)(), '.bun', 'bin', 'bun'),
            '/usr/local/bin/bun',
            '/opt/homebrew/bin/bun', // Apple Silicon Homebrew
            '/home/linuxbrew/.linuxbrew/bin/bun' // Linux Homebrew
        ];
    for (var _i = 0, bunPaths_1 = bunPaths; _i < bunPaths_1.length; _i++) {
        var bunPath = bunPaths_1[_i];
        if ((0, fs_1.existsSync)(bunPath)) {
            return bunPath;
        }
    }
    return null;
}
/**
 * Get the Bun executable path or throw an error
 * Use this when Bun is required for operation
 */
function getBunPathOrThrow() {
    var bunPath = getBunPath();
    if (!bunPath) {
        var isWindows = process.platform === 'win32';
        var installCmd = isWindows
            ? 'powershell -c "irm bun.sh/install.ps1 | iex"'
            : 'curl -fsSL https://bun.sh/install | bash';
        throw new Error("Bun is required but not found. Install it with:\n  ".concat(installCmd, "\nThen restart your terminal."));
    }
    return bunPath;
}
/**
 * Check if Bun is available (in PATH or common locations)
 */
function isBunAvailable() {
    return getBunPath() !== null;
}
