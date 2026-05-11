"use strict";
/**
 * Path conversion utilities for IDE communication
 * Handles conversions between Claude's environment and the IDE's environment
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WindowsToWSLConverter = void 0;
exports.checkWSLDistroMatch = checkWSLDistroMatch;
var child_process_1 = require("child_process");
/**
 * Converter for Windows IDE + WSL Claude scenario
 */
var WindowsToWSLConverter = /** @class */ (function () {
    function WindowsToWSLConverter(wslDistroName) {
        this.wslDistroName = wslDistroName;
    }
    WindowsToWSLConverter.prototype.toLocalPath = function (windowsPath) {
        if (!windowsPath)
            return windowsPath;
        // Check if this is a path from a different WSL distro
        if (this.wslDistroName) {
            var wslUncMatch = windowsPath.match(/^\\\\wsl(?:\.localhost|\$)\\([^\\]+)(.*)$/);
            if (wslUncMatch && wslUncMatch[1] !== this.wslDistroName) {
                // Different distro - wslpath will fail, so return original path
                return windowsPath;
            }
        }
        try {
            // Use wslpath to convert Windows paths to WSL paths
            var result = (0, child_process_1.execFileSync)('wslpath', ['-u', windowsPath], {
                encoding: 'utf8',
                stdio: ['pipe', 'pipe', 'ignore'], // wslpath writes "wslpath: <errortext>" to stderr
            }).trim();
            return result;
        }
        catch (_a) {
            // If wslpath fails, fall back to manual conversion
            return windowsPath
                .replace(/\\/g, '/') // Convert backslashes to forward slashes
                .replace(/^([A-Z]):/i, function (_, letter) { return "/mnt/".concat(letter.toLowerCase()); });
        }
    };
    WindowsToWSLConverter.prototype.toIDEPath = function (wslPath) {
        if (!wslPath)
            return wslPath;
        try {
            // Use wslpath to convert WSL paths to Windows paths
            var result = (0, child_process_1.execFileSync)('wslpath', ['-w', wslPath], {
                encoding: 'utf8',
                stdio: ['pipe', 'pipe', 'ignore'], // wslpath writes "wslpath: <errortext>" to stderr
            }).trim();
            return result;
        }
        catch (_a) {
            // If wslpath fails, return the original path
            return wslPath;
        }
    };
    return WindowsToWSLConverter;
}());
exports.WindowsToWSLConverter = WindowsToWSLConverter;
/**
 * Check if distro names match for WSL UNC paths
 */
function checkWSLDistroMatch(windowsPath, wslDistroName) {
    var wslUncMatch = windowsPath.match(/^\\\\wsl(?:\.localhost|\$)\\([^\\]+)(.*)$/);
    if (wslUncMatch) {
        return wslUncMatch[1] === wslDistroName;
    }
    return true; // Not a WSL UNC path, so no distro mismatch
}
