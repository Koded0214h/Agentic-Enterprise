"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBaseRenderOptions = getBaseRenderOptions;
var fs_1 = require("fs");
var tty_1 = require("tty");
var envUtils_js_1 = require("./envUtils.js");
var log_js_1 = require("./log.js");
// Cached stdin override - computed once per process
var cachedStdinOverride = null;
/**
 * Gets a ReadStream for /dev/tty when stdin is piped.
 * This allows interactive Ink rendering even when stdin is a pipe.
 * Result is cached for the lifetime of the process.
 */
function getStdinOverride() {
    // Return cached result if already computed
    if (cachedStdinOverride !== null) {
        return cachedStdinOverride;
    }
    // No override needed if stdin is already a TTY
    if (process.stdin.isTTY) {
        cachedStdinOverride = undefined;
        return undefined;
    }
    // Skip in CI environments
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.CI)) {
        cachedStdinOverride = undefined;
        return undefined;
    }
    // Skip if running MCP (input hijacking breaks MCP)
    if (process.argv.includes('mcp')) {
        cachedStdinOverride = undefined;
        return undefined;
    }
    // No /dev/tty on Windows
    if (process.platform === 'win32') {
        cachedStdinOverride = undefined;
        return undefined;
    }
    // Try to open /dev/tty as an alternative input source
    try {
        var ttyFd = (0, fs_1.openSync)('/dev/tty', 'r');
        var ttyStream = new tty_1.ReadStream(ttyFd);
        // Explicitly set isTTY to true since we know /dev/tty is a TTY.
        // This is needed because some runtimes (like Bun's compiled binaries)
        // may not correctly detect isTTY on ReadStream created from a file descriptor.
        ttyStream.isTTY = true;
        cachedStdinOverride = ttyStream;
        return cachedStdinOverride;
    }
    catch (err) {
        (0, log_js_1.logError)(err);
        cachedStdinOverride = undefined;
        return undefined;
    }
}
/**
 * Returns base render options for Ink, including stdin override when needed.
 * Use this for all render() calls to ensure piped input works correctly.
 *
 * @param exitOnCtrlC - Whether to exit on Ctrl+C (usually false for dialogs)
 */
function getBaseRenderOptions(exitOnCtrlC) {
    if (exitOnCtrlC === void 0) { exitOnCtrlC = false; }
    var stdin = getStdinOverride();
    var options = { exitOnCtrlC: exitOnCtrlC };
    if (stdin) {
        options.stdin = stdin;
    }
    return options;
}
