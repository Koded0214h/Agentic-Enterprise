"use strict";
/**
 * DEC (Digital Equipment Corporation) Private Mode Sequences
 *
 * DEC private modes use CSI ? N h (set) and CSI ? N l (reset) format.
 * These are terminal-specific extensions to the ANSI standard.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DISABLE_MOUSE_TRACKING = exports.ENABLE_MOUSE_TRACKING = exports.EXIT_ALT_SCREEN = exports.ENTER_ALT_SCREEN = exports.HIDE_CURSOR = exports.SHOW_CURSOR = exports.DFE = exports.EFE = exports.DBP = exports.EBP = exports.ESU = exports.BSU = exports.DEC = void 0;
exports.decset = decset;
exports.decreset = decreset;
var csi_js_1 = require("./csi.js");
/**
 * DEC private mode numbers
 */
exports.DEC = {
    CURSOR_VISIBLE: 25,
    ALT_SCREEN: 47,
    ALT_SCREEN_CLEAR: 1049,
    MOUSE_NORMAL: 1000,
    MOUSE_BUTTON: 1002,
    MOUSE_ANY: 1003,
    MOUSE_SGR: 1006,
    FOCUS_EVENTS: 1004,
    BRACKETED_PASTE: 2004,
    SYNCHRONIZED_UPDATE: 2026,
};
/** Generate CSI ? N h sequence (set mode) */
function decset(mode) {
    return (0, csi_js_1.csi)("?".concat(mode, "h"));
}
/** Generate CSI ? N l sequence (reset mode) */
function decreset(mode) {
    return (0, csi_js_1.csi)("?".concat(mode, "l"));
}
// Pre-generated sequences for common modes
exports.BSU = decset(exports.DEC.SYNCHRONIZED_UPDATE);
exports.ESU = decreset(exports.DEC.SYNCHRONIZED_UPDATE);
exports.EBP = decset(exports.DEC.BRACKETED_PASTE);
exports.DBP = decreset(exports.DEC.BRACKETED_PASTE);
exports.EFE = decset(exports.DEC.FOCUS_EVENTS);
exports.DFE = decreset(exports.DEC.FOCUS_EVENTS);
exports.SHOW_CURSOR = decset(exports.DEC.CURSOR_VISIBLE);
exports.HIDE_CURSOR = decreset(exports.DEC.CURSOR_VISIBLE);
exports.ENTER_ALT_SCREEN = decset(exports.DEC.ALT_SCREEN_CLEAR);
exports.EXIT_ALT_SCREEN = decreset(exports.DEC.ALT_SCREEN_CLEAR);
// Mouse tracking: 1000 reports button press/release/wheel, 1002 adds drag
// events (button-motion), 1003 adds all-motion (no button held — for
// hover), 1006 uses SGR format (CSI < btn;col;row M/m) instead of legacy
// X10 bytes. Combined: wheel + click/drag for selection + hover.
exports.ENABLE_MOUSE_TRACKING = decset(exports.DEC.MOUSE_NORMAL) +
    decset(exports.DEC.MOUSE_BUTTON) +
    decset(exports.DEC.MOUSE_ANY) +
    decset(exports.DEC.MOUSE_SGR);
exports.DISABLE_MOUSE_TRACKING = decreset(exports.DEC.MOUSE_SGR) +
    decreset(exports.DEC.MOUSE_ANY) +
    decreset(exports.DEC.MOUSE_BUTTON) +
    decreset(exports.DEC.MOUSE_NORMAL);
