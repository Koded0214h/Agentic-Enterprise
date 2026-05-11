"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCopyOnSelect = useCopyOnSelect;
exports.useSelectionBgColor = useSelectionBgColor;
var react_1 = require("react");
var ThemeProvider_js_1 = require("../components/design-system/ThemeProvider.js");
var config_js_1 = require("../utils/config.js");
var theme_js_1 = require("../utils/theme.js");
/**
 * Auto-copy the selection to the clipboard when the user finishes dragging
 * (mouse-up with a non-empty selection) or multi-clicks to select a word/line.
 * Mirrors iTerm2's "Copy to pasteboard on selection" — the highlight is left
 * intact so the user can see what was copied. Only fires in alt-screen mode
 * (selection state is ink-instance-owned; outside alt-screen, the native
 * terminal handles selection and this hook is a no-op via the ink stub).
 *
 * selection.subscribe fires on every mutation (start/update/finish/clear/
 * multiclick). Both char drags and multi-clicks set isDragging=true while
 * pressed, so a selection appearing with isDragging=false is always a
 * drag-finish. copiedRef guards against double-firing on spurious notifies.
 *
 * onCopied is optional — when omitted, copy is silent (clipboard is written
 * but no toast/notification fires). FleetView uses this silent mode; the
 * fullscreen REPL passes showCopiedToast for user feedback.
 */
function useCopyOnSelect(selection, isActive, onCopied) {
    // Tracks whether the *previous* notification had a visible selection with
    // isDragging=false (i.e., we already auto-copied it). Without this, the
    // finish→clear transition would look like a fresh selection-gone-idle
    // event and we'd toast twice for a single drag.
    var copiedRef = (0, react_1.useRef)(false);
    // onCopied is a fresh closure each render; read through a ref so the
    // effect doesn't re-subscribe (which would reset copiedRef via unmount).
    var onCopiedRef = (0, react_1.useRef)(onCopied);
    onCopiedRef.current = onCopied;
    (0, react_1.useEffect)(function () {
        if (!isActive)
            return;
        var unsubscribe = selection.subscribe(function () {
            var _a, _b;
            var sel = selection.getState();
            var has = selection.hasSelection();
            // Drag in progress — wait for finish. Reset copied flag so a new drag
            // that ends on the same range still triggers a fresh copy.
            if (sel === null || sel === void 0 ? void 0 : sel.isDragging) {
                copiedRef.current = false;
                return;
            }
            // No selection (cleared, or click-without-drag) — reset.
            if (!has) {
                copiedRef.current = false;
                return;
            }
            // Selection settled (drag finished OR multi-click). Already copied
            // this one — the only way to get here again without going through
            // isDragging or !has is a spurious notify (shouldn't happen, but safe).
            if (copiedRef.current)
                return;
            // Default true: macOS users expect cmd+c to work. It can't — the
            // terminal's Edit > Copy intercepts it before the pty sees it, and
            // finds no native selection (mouse tracking disabled it). Auto-copy
            // on mouse-up makes cmd+c a no-op that leaves the clipboard intact
            // with the right content, so paste works as expected.
            var enabled = (_a = (0, config_js_1.getGlobalConfig)().copyOnSelect) !== null && _a !== void 0 ? _a : true;
            if (!enabled)
                return;
            var text = selection.copySelectionNoClear();
            // Whitespace-only (e.g., blank-line multi-click) — not worth a
            // clipboard write or toast. Still set copiedRef so we don't retry.
            if (!text || !text.trim()) {
                copiedRef.current = true;
                return;
            }
            copiedRef.current = true;
            (_b = onCopiedRef.current) === null || _b === void 0 ? void 0 : _b.call(onCopiedRef, text);
        });
        return unsubscribe;
    }, [isActive, selection]);
}
/**
 * Pipe the theme's selectionBg color into the Ink StylePool so the
 * selection overlay renders a solid blue bg instead of SGR-7 inverse.
 * Ink is theme-agnostic (layering: colorize.ts "theme resolution happens
 * at component layer, not here") — this is the bridge. Fires on mount
 * (before any mouse input is possible) and again whenever /theme flips,
 * so the selection color tracks the theme live.
 */
function useSelectionBgColor(selection) {
    var themeName = (0, ThemeProvider_js_1.useTheme)()[0];
    (0, react_1.useEffect)(function () {
        selection.setSelectionBgColor((0, theme_js_1.getTheme)(themeName).selectionBg);
    }, [selection, themeName]);
}
