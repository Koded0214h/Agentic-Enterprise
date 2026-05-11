"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ADDITIONAL_HYPERLINK_TERMINALS = void 0;
exports.supportsHyperlinks = supportsHyperlinks;
var supports_hyperlinks_1 = require("supports-hyperlinks");
// Additional terminals that support OSC 8 hyperlinks but aren't detected by supports-hyperlinks.
// Checked against both TERM_PROGRAM and LC_TERMINAL (the latter is preserved inside tmux).
exports.ADDITIONAL_HYPERLINK_TERMINALS = [
    'ghostty',
    'Hyper',
    'kitty',
    'alacritty',
    'iTerm.app',
    'iTerm2',
];
/**
 * Returns whether stdout supports OSC 8 hyperlinks.
 * Extends the supports-hyperlinks library with additional terminal detection.
 * @param options Optional overrides for testing (env, stdoutSupported)
 */
function supportsHyperlinks(options) {
    var _a, _b;
    var stdoutSupported = (_a = options === null || options === void 0 ? void 0 : options.stdoutSupported) !== null && _a !== void 0 ? _a : supports_hyperlinks_1.default.stdout;
    if (stdoutSupported) {
        return true;
    }
    var env = (_b = options === null || options === void 0 ? void 0 : options.env) !== null && _b !== void 0 ? _b : process.env;
    // Check for additional terminals not detected by supports-hyperlinks
    var termProgram = env['TERM_PROGRAM'];
    if (termProgram && exports.ADDITIONAL_HYPERLINK_TERMINALS.includes(termProgram)) {
        return true;
    }
    // LC_TERMINAL is set by some terminals (e.g. iTerm2) and preserved inside tmux,
    // where TERM_PROGRAM is overwritten to 'tmux'.
    var lcTerminal = env['LC_TERMINAL'];
    if (lcTerminal && exports.ADDITIONAL_HYPERLINK_TERMINALS.includes(lcTerminal)) {
        return true;
    }
    // Kitty sets TERM=xterm-kitty
    var term = env['TERM'];
    if (term === null || term === void 0 ? void 0 : term.includes('kitty')) {
        return true;
    }
    return false;
}
