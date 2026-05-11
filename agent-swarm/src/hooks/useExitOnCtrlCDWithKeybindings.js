"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useExitOnCtrlCDWithKeybindings = useExitOnCtrlCDWithKeybindings;
var useKeybinding_js_1 = require("../keybindings/useKeybinding.js");
var useExitOnCtrlCD_js_1 = require("./useExitOnCtrlCD.js");
/**
 * Convenience hook that wires up useExitOnCtrlCD with useKeybindings.
 *
 * This is the standard way to use useExitOnCtrlCD in components.
 * The separation exists to avoid import cycles - useExitOnCtrlCD.ts
 * doesn't import from the keybindings module directly.
 *
 * @param onExit - Optional custom exit handler
 * @param onInterrupt - Optional callback for features to handle interrupt (ctrl+c).
 *                      Return true if handled, false to fall through to double-press exit.
 * @param isActive - Whether the keybinding is active (default true).
 */
function useExitOnCtrlCDWithKeybindings(onExit, onInterrupt, isActive) {
    return (0, useExitOnCtrlCD_js_1.useExitOnCtrlCD)(useKeybinding_js_1.useKeybindings, onInterrupt, onExit, isActive);
}
