"use strict";
/**
 * Cross-platform terminal clearing with scrollback support.
 * Detects modern terminals that support ESC[3J for clearing scrollback.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearTerminal = void 0;
exports.getClearTerminalSequence = getClearTerminalSequence;
var csi_js_1 = require("./termio/csi.js");
// HVP (Horizontal Vertical Position) - legacy Windows cursor home
var CURSOR_HOME_WINDOWS = (0, csi_js_1.csi)(0, 'f');
function isWindowsTerminal() {
    return process.platform === 'win32' && !!process.env.WT_SESSION;
}
function isMintty() {
    // mintty 3.1.5+ sets TERM_PROGRAM to 'mintty'
    if (process.env.TERM_PROGRAM === 'mintty') {
        return true;
    }
    // GitBash/MSYS2/MINGW use mintty and set MSYSTEM
    if (process.platform === 'win32' && process.env.MSYSTEM) {
        return true;
    }
    return false;
}
function isModernWindowsTerminal() {
    // Windows Terminal sets WT_SESSION environment variable
    if (isWindowsTerminal()) {
        return true;
    }
    // VS Code integrated terminal on Windows with ConPTY support
    if (process.platform === 'win32' &&
        process.env.TERM_PROGRAM === 'vscode' &&
        process.env.TERM_PROGRAM_VERSION) {
        return true;
    }
    // mintty (GitBash/MSYS2/Cygwin) supports modern escape sequences
    if (isMintty()) {
        return true;
    }
    return false;
}
/**
 * Returns the ANSI escape sequence to clear the terminal including scrollback.
 * Automatically detects terminal capabilities.
 */
function getClearTerminalSequence() {
    if (process.platform === 'win32') {
        if (isModernWindowsTerminal()) {
            return csi_js_1.ERASE_SCREEN + csi_js_1.ERASE_SCROLLBACK + csi_js_1.CURSOR_HOME;
        }
        else {
            // Legacy Windows console - can't clear scrollback
            return csi_js_1.ERASE_SCREEN + CURSOR_HOME_WINDOWS;
        }
    }
    return csi_js_1.ERASE_SCREEN + csi_js_1.ERASE_SCROLLBACK + csi_js_1.CURSOR_HOME;
}
/**
 * Clears the terminal screen. On supported terminals, also clears scrollback.
 */
exports.clearTerminal = getClearTerminalSequence();
