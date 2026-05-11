"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLI_CU_CAPABILITIES = exports.CLI_HOST_BUNDLE_ID = exports.COMPUTER_USE_MCP_SERVER_NAME = void 0;
exports.getTerminalBundleId = getTerminalBundleId;
exports.isComputerUseMCPServer = isComputerUseMCPServer;
var normalization_js_1 = require("../../services/mcp/normalization.js");
var env_js_1 = require("../env.js");
exports.COMPUTER_USE_MCP_SERVER_NAME = 'computer-use';
/**
 * Sentinel bundle ID for the frontmost gate. Claude Code is a terminal — it has
 * no window. This never matches a real `NSWorkspace.frontmostApplication`, so
 * the package's "host is frontmost" branch (mouse click-through exemption,
 * keyboard safety-net) is dead code for us. `prepareForAction`'s "exempt our
 * own window" is likewise a no-op — there is no window to exempt.
 */
exports.CLI_HOST_BUNDLE_ID = 'com.anthropic.claude-code.cli-no-window';
/**
 * Fallback `env.terminal` → bundleId map for when `__CFBundleIdentifier` is
 * unset. Covers the macOS terminals we can distinguish — Linux entries
 * (konsole, gnome-terminal, xterm) are deliberately absent since
 * `createCliExecutor` is darwin-guarded.
 */
var TERMINAL_BUNDLE_ID_FALLBACK = {
    'iTerm.app': 'com.googlecode.iterm2',
    Apple_Terminal: 'com.apple.Terminal',
    ghostty: 'com.mitchellh.ghostty',
    kitty: 'net.kovidgoyal.kitty',
    WarpTerminal: 'dev.warp.Warp-Stable',
    vscode: 'com.microsoft.VSCode',
};
/**
 * Bundle ID of the terminal emulator we're running inside, so `prepareDisplay`
 * can exempt it from hiding and `captureExcluding` can keep it out of
 * screenshots. Returns null when undetectable (ssh, cleared env, unknown
 * terminal) — caller must handle the null case.
 *
 * `__CFBundleIdentifier` is set by LaunchServices when a .app bundle spawns a
 * process and is inherited by children. It's the exact bundleId, no lookup
 * needed — handles terminals the fallback table doesn't know about. Under
 * tmux/screen it reflects the terminal that started the SERVER, which may
 * differ from the attached client. That's harmless here: we exempt A
 * terminal window, and the screenshots exclude it regardless.
 */
function getTerminalBundleId() {
    var _a, _b;
    var cfBundleId = process.env.__CFBundleIdentifier;
    if (cfBundleId)
        return cfBundleId;
    return (_b = TERMINAL_BUNDLE_ID_FALLBACK[(_a = env_js_1.env.terminal) !== null && _a !== void 0 ? _a : '']) !== null && _b !== void 0 ? _b : null;
}
/**
 * Static capabilities for macOS CLI. `hostBundleId` is not here — it's added
 * by `executor.ts` per `ComputerExecutor.capabilities`. `buildComputerUseTools`
 * takes this shape (no `hostBundleId`, no `teachMode`).
 */
exports.CLI_CU_CAPABILITIES = {
    screenshotFiltering: 'native',
    platform: 'darwin',
};
function isComputerUseMCPServer(name) {
    return (0, normalization_js_1.normalizeNameForMCP)(name) === exports.COMPUTER_USE_MCP_SERVER_NAME;
}
