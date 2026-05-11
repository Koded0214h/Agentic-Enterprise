"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isVimModeEnabled = isVimModeEnabled;
exports.getNewlineInstructions = getNewlineInstructions;
exports.isNonSpacePrintable = isNonSpacePrintable;
var terminalSetup_js_1 = require("../../commands/terminalSetup/terminalSetup.js");
var config_js_1 = require("../../utils/config.js");
var env_js_1 = require("../../utils/env.js");
/**
 * Helper function to check if vim mode is currently enabled
 * @returns boolean indicating if vim mode is active
 */
function isVimModeEnabled() {
    var config = (0, config_js_1.getGlobalConfig)();
    return config.editorMode === 'vim';
}
function getNewlineInstructions() {
    // Apple Terminal on macOS uses native modifier key detection for Shift+Enter
    if (env_js_1.env.terminal === 'Apple_Terminal' && process.platform === 'darwin') {
        return 'shift + ⏎ for newline';
    }
    // For iTerm2 and VSCode, show Shift+Enter instructions if installed
    if ((0, terminalSetup_js_1.isShiftEnterKeyBindingInstalled)()) {
        return 'shift + ⏎ for newline';
    }
    // Otherwise show backslash+return instructions
    return (0, terminalSetup_js_1.hasUsedBackslashReturn)()
        ? '\\⏎ for newline'
        : 'backslash (\\) + return (⏎) for newline';
}
/**
 * True when the keystroke is a printable character that does not begin
 * with whitespace — i.e., a normal letter/digit/symbol the user typed.
 * Used to gate the lazy space inserted after an image pill.
 */
function isNonSpacePrintable(input, key) {
    if (key.ctrl ||
        key.meta ||
        key.escape ||
        key.return ||
        key.tab ||
        key.backspace ||
        key.delete ||
        key.upArrow ||
        key.downArrow ||
        key.leftArrow ||
        key.rightArrow ||
        key.pageUp ||
        key.pageDown ||
        key.home ||
        key.end) {
        return false;
    }
    return input.length > 0 && !/^\s/.test(input) && !input.startsWith('\x1b');
}
