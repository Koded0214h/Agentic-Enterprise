"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTabStatus = useTabStatus;
var react_1 = require("react");
var osc_js_1 = require("../termio/osc.js");
var useTerminalNotification_js_1 = require("../useTerminalNotification.js");
var rgb = function (r, g, b) { return ({
    type: 'rgb',
    r: r,
    g: g,
    b: b,
}); };
// Per the OSC 21337 usage guide's suggested mapping.
var TAB_STATUS_PRESETS = {
    idle: {
        indicator: rgb(0, 215, 95),
        status: 'Idle',
        statusColor: rgb(136, 136, 136),
    },
    busy: {
        indicator: rgb(255, 149, 0),
        status: 'Working…',
        statusColor: rgb(255, 149, 0),
    },
    waiting: {
        indicator: rgb(95, 135, 255),
        status: 'Waiting',
        statusColor: rgb(95, 135, 255),
    },
};
/**
 * Declaratively set the tab-status indicator (OSC 21337).
 *
 * Emits a colored dot + short status text to the tab sidebar. Terminals
 * that don't support OSC 21337 discard the sequence silently, so this is
 * safe to call unconditionally. Wrapped for tmux/screen passthrough.
 *
 * Pass `null` to opt out. If a status was previously set, transitioning to
 * `null` emits CLEAR_TAB_STATUS so toggling off mid-session doesn't leave
 * a stale dot. Process-exit cleanup is handled by ink.tsx's unmount path.
 */
function useTabStatus(kind) {
    var writeRaw = (0, react_1.useContext)(useTerminalNotification_js_1.TerminalWriteContext);
    var prevKindRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        // When kind transitions from non-null to null (e.g. user toggles off
        // showStatusInTerminalTab mid-session), clear the stale dot.
        if (kind === null) {
            if (prevKindRef.current !== null && writeRaw && (0, osc_js_1.supportsTabStatus)()) {
                writeRaw((0, osc_js_1.wrapForMultiplexer)(osc_js_1.CLEAR_TAB_STATUS));
            }
            prevKindRef.current = null;
            return;
        }
        prevKindRef.current = kind;
        if (!writeRaw || !(0, osc_js_1.supportsTabStatus)())
            return;
        writeRaw((0, osc_js_1.wrapForMultiplexer)((0, osc_js_1.tabStatus)(TAB_STATUS_PRESETS[kind])));
    }, [kind, writeRaw]);
}
