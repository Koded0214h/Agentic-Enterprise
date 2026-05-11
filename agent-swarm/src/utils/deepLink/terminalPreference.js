"use strict";
/**
 * Terminal preference capture for deep link handling.
 *
 * Separate from terminalLauncher.ts so interactiveHelpers.tsx can import
 * this without pulling the full launcher module into the startup path
 * (which would defeat LODESTONE tree-shaking).
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDeepLinkTerminalPreference = updateDeepLinkTerminalPreference;
var config_js_1 = require("../config.js");
var debug_js_1 = require("../debug.js");
/**
 * Map TERM_PROGRAM env var values (lowercased) to the `app` name used by
 * launchMacosTerminal's switch cases. TERM_PROGRAM values are what terminals
 * self-report; they don't always match the .app bundle name (e.g.,
 * "iTerm.app" → "iTerm", "Apple_Terminal" → "Terminal").
 */
var TERM_PROGRAM_TO_APP = {
    iterm: 'iTerm',
    'iterm.app': 'iTerm',
    ghostty: 'Ghostty',
    kitty: 'kitty',
    alacritty: 'Alacritty',
    wezterm: 'WezTerm',
    apple_terminal: 'Terminal',
};
/**
 * Capture the current terminal from TERM_PROGRAM and store it for the deep
 * link handler to use later. The handler runs headless (LaunchServices/xdg)
 * where TERM_PROGRAM is unset, so without this it falls back to a static
 * priority list that picks whatever is installed first — often not the
 * terminal the user actually uses.
 *
 * Called fire-and-forget from interactive startup, same as
 * updateGithubRepoPathMapping.
 */
function updateDeepLinkTerminalPreference() {
    // Only detectMacosTerminal reads the stored value — skip the write on
    // other platforms.
    if (process.platform !== 'darwin')
        return;
    var termProgram = process.env.TERM_PROGRAM;
    if (!termProgram)
        return;
    var app = TERM_PROGRAM_TO_APP[termProgram.toLowerCase()];
    if (!app)
        return;
    var config = (0, config_js_1.getGlobalConfig)();
    if (config.deepLinkTerminal === app)
        return;
    (0, config_js_1.saveGlobalConfig)(function (current) { return (__assign(__assign({}, current), { deepLinkTerminal: app })); });
    (0, debug_js_1.logForDebugging)("Stored deep link terminal preference: ".concat(app));
}
