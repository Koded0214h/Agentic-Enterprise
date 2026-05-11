"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.posixPathToWindowsPath = exports.windowsPathToPosixPath = exports.findGitBashPath = void 0;
exports.setShellIfWindows = setShellIfWindows;
var memoize_js_1 = require("lodash-es/memoize.js");
var path = require("path");
var pathWin32 = require("path/win32");
var cwd_js_1 = require("./cwd.js");
var debug_js_1 = require("./debug.js");
var execSyncWrapper_js_1 = require("./execSyncWrapper.js");
var memoize_js_2 = require("./memoize.js");
var platform_js_1 = require("./platform.js");
/**
 * Check if a file or directory exists on Windows using the dir command
 * @param path - The path to check
 * @returns true if the path exists, false otherwise
 */
function checkPathExists(path) {
    try {
        (0, execSyncWrapper_js_1.execSync_DEPRECATED)("dir \"".concat(path, "\""), { stdio: 'pipe' });
        return true;
    }
    catch (_a) {
        return false;
    }
}
/**
 * Find an executable using where.exe on Windows
 * @param executable - The name of the executable to find
 * @returns The path to the executable or null if not found
 */
function findExecutable(executable) {
    // For git, check common installation locations first
    if (executable === 'git') {
        var defaultLocations = [
            // check 64 bit before 32 bit
            'C:\\Program Files\\Git\\cmd\\git.exe',
            'C:\\Program Files (x86)\\Git\\cmd\\git.exe',
            // intentionally don't look for C:\Program Files\Git\mingw64\bin\git.exe
            // because that directory is the "raw" tools with no environment setup
        ];
        for (var _i = 0, defaultLocations_1 = defaultLocations; _i < defaultLocations_1.length; _i++) {
            var location_1 = defaultLocations_1[_i];
            if (checkPathExists(location_1)) {
                return location_1;
            }
        }
    }
    // Fall back to where.exe
    try {
        var result = (0, execSyncWrapper_js_1.execSync_DEPRECATED)("where.exe ".concat(executable), {
            stdio: 'pipe',
            encoding: 'utf8',
        }).trim();
        // SECURITY: Filter out any results from the current directory
        // to prevent executing malicious git.bat/cmd/exe files
        var paths = result.split('\r\n').filter(Boolean);
        var cwd = (0, cwd_js_1.getCwd)().toLowerCase();
        for (var _a = 0, paths_1 = paths; _a < paths_1.length; _a++) {
            var candidatePath = paths_1[_a];
            // Normalize and compare paths to ensure we're not in current directory
            var normalizedPath = path.resolve(candidatePath).toLowerCase();
            var pathDir = path.dirname(normalizedPath).toLowerCase();
            // Skip if the executable is in the current working directory
            if (pathDir === cwd || normalizedPath.startsWith(cwd + path.sep)) {
                (0, debug_js_1.logForDebugging)("Skipping potentially malicious executable in current directory: ".concat(candidatePath));
                continue;
            }
            // Return the first valid path that's not in the current directory
            return candidatePath;
        }
        return null;
    }
    catch (_b) {
        return null;
    }
}
/**
 * If Windows, set the SHELL environment variable to git-bash path.
 * This is used by BashTool and Shell.ts for user shell commands.
 * COMSPEC is left unchanged for system process execution.
 */
function setShellIfWindows() {
    if ((0, platform_js_1.getPlatform)() === 'windows') {
        var gitBashPath = (0, exports.findGitBashPath)();
        process.env.SHELL = gitBashPath;
        (0, debug_js_1.logForDebugging)("Using bash path: \"".concat(gitBashPath, "\""));
    }
}
/**
 * Find the path where `bash.exe` included with git-bash exists, exiting the process if not found.
 */
exports.findGitBashPath = (0, memoize_js_1.default)(function () {
    if (process.env.CLAUDE_CODE_GIT_BASH_PATH) {
        if (checkPathExists(process.env.CLAUDE_CODE_GIT_BASH_PATH)) {
            return process.env.CLAUDE_CODE_GIT_BASH_PATH;
        }
        // biome-ignore lint/suspicious/noConsole:: intentional console output
        console.error("Claude Code was unable to find CLAUDE_CODE_GIT_BASH_PATH path \"".concat(process.env.CLAUDE_CODE_GIT_BASH_PATH, "\""));
        // eslint-disable-next-line custom-rules/no-process-exit
        process.exit(1);
    }
    var gitPath = findExecutable('git');
    if (gitPath) {
        var bashPath = pathWin32.join(gitPath, '..', '..', 'bin', 'bash.exe');
        if (checkPathExists(bashPath)) {
            return bashPath;
        }
    }
    // biome-ignore lint/suspicious/noConsole:: intentional console output
    console.error('Claude Code on Windows requires git-bash (https://git-scm.com/downloads/win). If installed but not in PATH, set environment variable pointing to your bash.exe, similar to: CLAUDE_CODE_GIT_BASH_PATH=C:\\Program Files\\Git\\bin\\bash.exe');
    // eslint-disable-next-line custom-rules/no-process-exit
    process.exit(1);
});
/** Convert a Windows path to a POSIX path using pure JS. */
exports.windowsPathToPosixPath = (0, memoize_js_2.memoizeWithLRU)(function (windowsPath) {
    // Handle UNC paths: \\server\share -> //server/share
    if (windowsPath.startsWith('\\\\')) {
        return windowsPath.replace(/\\/g, '/');
    }
    // Handle drive letter paths: C:\Users\foo -> /c/Users/foo
    var match = windowsPath.match(/^([A-Za-z]):[/\\]/);
    if (match) {
        var driveLetter = match[1].toLowerCase();
        return '/' + driveLetter + windowsPath.slice(2).replace(/\\/g, '/');
    }
    // Already POSIX or relative — just flip slashes
    return windowsPath.replace(/\\/g, '/');
}, function (p) { return p; }, 500);
/** Convert a POSIX path to a Windows path using pure JS. */
exports.posixPathToWindowsPath = (0, memoize_js_2.memoizeWithLRU)(function (posixPath) {
    // Handle UNC paths: //server/share -> \\server\share
    if (posixPath.startsWith('//')) {
        return posixPath.replace(/\//g, '\\');
    }
    // Handle /cygdrive/c/... format
    var cygdriveMatch = posixPath.match(/^\/cygdrive\/([A-Za-z])(\/|$)/);
    if (cygdriveMatch) {
        var driveLetter = cygdriveMatch[1].toUpperCase();
        var rest = posixPath.slice(('/cygdrive/' + cygdriveMatch[1]).length);
        return driveLetter + ':' + (rest || '\\').replace(/\//g, '\\');
    }
    // Handle /c/... format (MSYS2/Git Bash)
    var driveMatch = posixPath.match(/^\/([A-Za-z])(\/|$)/);
    if (driveMatch) {
        var driveLetter = driveMatch[1].toUpperCase();
        var rest = posixPath.slice(2);
        return driveLetter + ':' + (rest || '\\').replace(/\//g, '\\');
    }
    // Already Windows or relative — just flip slashes
    return posixPath.replace(/\//g, '\\');
}, function (p) { return p; }, 500);
