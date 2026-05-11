"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTerminalFocus = useTerminalFocus;
var react_1 = require("react");
var TerminalFocusContext_js_1 = require("../components/TerminalFocusContext.js");
/**
 * Hook to check if the terminal has focus.
 *
 * Uses DECSET 1004 focus reporting - the terminal sends escape sequences
 * when it gains or loses focus. These are handled automatically
 * by Ink and filtered from useInput.
 *
 * @returns true if the terminal is focused (or focus state is unknown)
 */
function useTerminalFocus() {
    var isTerminalFocused = (0, react_1.useContext)(TerminalFocusContext_js_1.default).isTerminalFocused;
    return isTerminalFocused;
}
