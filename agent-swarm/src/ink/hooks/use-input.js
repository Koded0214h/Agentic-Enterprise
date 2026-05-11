"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var usehooks_ts_1 = require("usehooks-ts");
var use_stdin_js_1 = require("./use-stdin.js");
/**
 * This hook is used for handling user input.
 * It's a more convenient alternative to using `StdinContext` and listening to `data` events.
 * The callback you pass to `useInput` is called for each character when user enters any input.
 * However, if user pastes text and it's more than one character, the callback will be called only once and the whole string will be passed as `input`.
 *
 * ```
 * import {useInput} from 'ink';
 *
 * const UserInput = () => {
 *   useInput((input, key) => {
 *     if (input === 'q') {
 *       // Exit program
 *     }
 *
 *     if (key.leftArrow) {
 *       // Left arrow key pressed
 *     }
 *   });
 *
 *   return …
 * };
 * ```
 */
var useInput = function (inputHandler, options) {
    if (options === void 0) { options = {}; }
    var _a = (0, use_stdin_js_1.default)(), setRawMode = _a.setRawMode, internal_exitOnCtrlC = _a.internal_exitOnCtrlC, internal_eventEmitter = _a.internal_eventEmitter;
    // useLayoutEffect (not useEffect) so that raw mode is enabled synchronously
    // during React's commit phase, before render() returns. With useEffect, raw
    // mode setup is deferred to the next event loop tick via React's scheduler,
    // leaving the terminal in cooked mode — keystrokes echo and the cursor is
    // visible until the effect fires.
    (0, react_1.useLayoutEffect)(function () {
        if (options.isActive === false) {
            return;
        }
        setRawMode(true);
        return function () {
            setRawMode(false);
        };
    }, [options.isActive, setRawMode]);
    // Register the listener once on mount so its slot in the EventEmitter's
    // listener array is stable. If isActive were in the effect's deps, the
    // listener would re-append on false→true, moving it behind listeners
    // that registered while it was inactive — breaking
    // stopImmediatePropagation() ordering. useEventCallback keeps the
    // reference stable while reading latest isActive/inputHandler from
    // closure (it syncs via useLayoutEffect, so it's compiler-safe).
    var handleData = (0, usehooks_ts_1.useEventCallback)(function (event) {
        if (options.isActive === false) {
            return;
        }
        var input = event.input, key = event.key;
        // If app is not supposed to exit on Ctrl+C, then let input listener handle it
        // Note: discreteUpdates is called at the App level when emitting events,
        // so all listeners are already within a high-priority update context.
        if (!(input === 'c' && key.ctrl) || !internal_exitOnCtrlC) {
            inputHandler(input, key, event);
        }
    });
    (0, react_1.useEffect)(function () {
        internal_eventEmitter === null || internal_eventEmitter === void 0 ? void 0 : internal_eventEmitter.on('input', handleData);
        return function () {
            internal_eventEmitter === null || internal_eventEmitter === void 0 ? void 0 : internal_eventEmitter.removeListener('input', handleData);
        };
    }, [internal_eventEmitter, handleData]);
};
exports.default = useInput;
