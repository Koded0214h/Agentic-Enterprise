"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTerminalTitle = useTerminalTitle;
var react_1 = require("react");
var strip_ansi_1 = require("strip-ansi");
var osc_js_1 = require("../termio/osc.js");
var useTerminalNotification_js_1 = require("../useTerminalNotification.js");
/**
 * Declaratively set the terminal tab/window title.
 *
 * Pass a string to set the title. ANSI escape sequences are stripped
 * automatically so callers don't need to know about terminal encoding.
 * Pass `null` to opt out — the hook becomes a no-op and leaves the
 * terminal title untouched.
 *
 * On Windows, uses `process.title` (classic conhost doesn't support OSC).
 * Elsewhere, writes OSC 0 (set title+icon) via Ink's stdout.
 */
function useTerminalTitle(title) {
    var writeRaw = (0, react_1.useContext)(useTerminalNotification_js_1.TerminalWriteContext);
    (0, react_1.useEffect)(function () {
        if (title === null || !writeRaw)
            return;
        var clean = (0, strip_ansi_1.default)(title);
        if (process.platform === 'win32') {
            process.title = clean;
        }
        else {
            writeRaw((0, osc_js_1.osc)(osc_js_1.OSC.SET_TITLE_AND_ICON, clean));
        }
    }, [title, writeRaw]);
}
