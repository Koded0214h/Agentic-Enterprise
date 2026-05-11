"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminalWriteProvider = exports.TerminalWriteContext = void 0;
exports.useTerminalNotification = useTerminalNotification;
var react_1 = require("react");
var terminal_js_1 = require("./terminal.js");
var ansi_js_1 = require("./termio/ansi.js");
var osc_js_1 = require("./termio/osc.js");
exports.TerminalWriteContext = (0, react_1.createContext)(null);
exports.TerminalWriteProvider = exports.TerminalWriteContext.Provider;
function useTerminalNotification() {
    var writeRaw = (0, react_1.useContext)(exports.TerminalWriteContext);
    if (!writeRaw) {
        throw new Error('useTerminalNotification must be used within TerminalWriteProvider');
    }
    var notifyITerm2 = (0, react_1.useCallback)(function (_a) {
        var message = _a.message, title = _a.title;
        var displayString = title ? "".concat(title, ":\n").concat(message) : message;
        writeRaw((0, osc_js_1.wrapForMultiplexer)((0, osc_js_1.osc)(osc_js_1.OSC.ITERM2, "\n\n".concat(displayString))));
    }, [writeRaw]);
    var notifyKitty = (0, react_1.useCallback)(function (_a) {
        var message = _a.message, title = _a.title, id = _a.id;
        writeRaw((0, osc_js_1.wrapForMultiplexer)((0, osc_js_1.osc)(osc_js_1.OSC.KITTY, "i=".concat(id, ":d=0:p=title"), title)));
        writeRaw((0, osc_js_1.wrapForMultiplexer)((0, osc_js_1.osc)(osc_js_1.OSC.KITTY, "i=".concat(id, ":p=body"), message)));
        writeRaw((0, osc_js_1.wrapForMultiplexer)((0, osc_js_1.osc)(osc_js_1.OSC.KITTY, "i=".concat(id, ":d=1:a=focus"), '')));
    }, [writeRaw]);
    var notifyGhostty = (0, react_1.useCallback)(function (_a) {
        var message = _a.message, title = _a.title;
        writeRaw((0, osc_js_1.wrapForMultiplexer)((0, osc_js_1.osc)(osc_js_1.OSC.GHOSTTY, 'notify', title, message)));
    }, [writeRaw]);
    var notifyBell = (0, react_1.useCallback)(function () {
        // Raw BEL — inside tmux this triggers tmux's bell-action (window flag).
        // Wrapping would make it opaque DCS payload and lose that fallback.
        writeRaw(ansi_js_1.BEL);
    }, [writeRaw]);
    var progress = (0, react_1.useCallback)(function (state, percentage) {
        if (!(0, terminal_js_1.isProgressReportingAvailable)()) {
            return;
        }
        if (!state) {
            writeRaw((0, osc_js_1.wrapForMultiplexer)((0, osc_js_1.osc)(osc_js_1.OSC.ITERM2, osc_js_1.ITERM2.PROGRESS, osc_js_1.PROGRESS.CLEAR, '')));
            return;
        }
        var pct = Math.max(0, Math.min(100, Math.round(percentage !== null && percentage !== void 0 ? percentage : 0)));
        switch (state) {
            case 'completed':
                writeRaw((0, osc_js_1.wrapForMultiplexer)((0, osc_js_1.osc)(osc_js_1.OSC.ITERM2, osc_js_1.ITERM2.PROGRESS, osc_js_1.PROGRESS.CLEAR, '')));
                break;
            case 'error':
                writeRaw((0, osc_js_1.wrapForMultiplexer)((0, osc_js_1.osc)(osc_js_1.OSC.ITERM2, osc_js_1.ITERM2.PROGRESS, osc_js_1.PROGRESS.ERROR, pct)));
                break;
            case 'indeterminate':
                writeRaw((0, osc_js_1.wrapForMultiplexer)((0, osc_js_1.osc)(osc_js_1.OSC.ITERM2, osc_js_1.ITERM2.PROGRESS, osc_js_1.PROGRESS.INDETERMINATE, '')));
                break;
            case 'running':
                writeRaw((0, osc_js_1.wrapForMultiplexer)((0, osc_js_1.osc)(osc_js_1.OSC.ITERM2, osc_js_1.ITERM2.PROGRESS, osc_js_1.PROGRESS.SET, pct)));
                break;
            case null:
                // Handled by the if guard above
                break;
        }
    }, [writeRaw]);
    return (0, react_1.useMemo)(function () { return ({ notifyITerm2: notifyITerm2, notifyKitty: notifyKitty, notifyGhostty: notifyGhostty, notifyBell: notifyBell, progress: progress }); }, [notifyITerm2, notifyKitty, notifyGhostty, notifyBell, progress]);
}
