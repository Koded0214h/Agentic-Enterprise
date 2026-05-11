"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useExitOnCtrlCD = useExitOnCtrlCD;
var react_1 = require("react");
var use_app_js_1 = require("../ink/hooks/use-app.js");
var useDoublePress_js_1 = require("./useDoublePress.js");
/**
 * Handle ctrl+c and ctrl+d for exiting the application.
 *
 * Uses a time-based double-press mechanism:
 * - First press: Shows "Press X again to exit" message
 * - Second press within timeout: Exits the application
 *
 * Note: We use time-based double-press rather than the chord system because
 * we want the first ctrl+c to also trigger interrupt (handled elsewhere).
 * The chord system would prevent the first press from firing any action.
 *
 * These keys are hardcoded and cannot be rebound via keybindings.json.
 *
 * @param useKeybindingsHook - The useKeybindings hook to use for registering handlers
 *                            (dependency injection to avoid import cycles)
 * @param onInterrupt - Optional callback for features to handle interrupt (ctrl+c).
 *                      Return true if handled, false to fall through to double-press exit.
 * @param onExit - Optional custom exit handler
 * @param isActive - Whether the keybinding is active (default true). Set false
 *                   while an embedded TextInput is focused — TextInput's own
 *                   ctrl+c/d handlers will manage cancel/exit, and Dialog's
 *                   handler would otherwise double-fire (child useInput runs
 *                   before parent useKeybindings, so both see every keypress).
 */
function useExitOnCtrlCD(useKeybindingsHook, onInterrupt, onExit, isActive) {
    if (isActive === void 0) { isActive = true; }
    var exit = (0, use_app_js_1.default)().exit;
    var _a = (0, react_1.useState)({
        pending: false,
        keyName: null,
    }), exitState = _a[0], setExitState = _a[1];
    var exitFn = (0, react_1.useMemo)(function () { return onExit !== null && onExit !== void 0 ? onExit : exit; }, [onExit, exit]);
    // Double-press handler for ctrl+c
    var handleCtrlCDoublePress = (0, useDoublePress_js_1.useDoublePress)(function (pending) { return setExitState({ pending: pending, keyName: 'Ctrl-C' }); }, exitFn);
    // Double-press handler for ctrl+d
    var handleCtrlDDoublePress = (0, useDoublePress_js_1.useDoublePress)(function (pending) { return setExitState({ pending: pending, keyName: 'Ctrl-D' }); }, exitFn);
    // Handler for app:interrupt (ctrl+c by default)
    // Let features handle interrupt first via callback
    var handleInterrupt = (0, react_1.useCallback)(function () {
        if (onInterrupt === null || onInterrupt === void 0 ? void 0 : onInterrupt())
            return; // Feature handled it
        handleCtrlCDoublePress();
    }, [handleCtrlCDoublePress, onInterrupt]);
    // Handler for app:exit (ctrl+d by default)
    // This also uses double-press to confirm exit
    var handleExit = (0, react_1.useCallback)(function () {
        handleCtrlDDoublePress();
    }, [handleCtrlDDoublePress]);
    var handlers = (0, react_1.useMemo)(function () { return ({
        'app:interrupt': handleInterrupt,
        'app:exit': handleExit,
    }); }, [handleInterrupt, handleExit]);
    useKeybindingsHook(handlers, { context: 'Global', isActive: isActive });
    return exitState;
}
