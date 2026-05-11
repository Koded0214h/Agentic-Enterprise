"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSelection = useSelection;
exports.useHasSelection = useHasSelection;
var react_1 = require("react");
var StdinContext_js_1 = require("../components/StdinContext.js");
var instances_js_1 = require("../instances.js");
var selection_js_1 = require("../selection.js");
/**
 * Access to text selection operations on the Ink instance (fullscreen only).
 * Returns no-op functions when fullscreen mode is disabled.
 */
function useSelection() {
    // Look up the Ink instance via stdout — same pattern as instances map.
    // StdinContext is available (it's always provided), and the Ink instance
    // is keyed by stdout which we can get from process.stdout since there's
    // only one Ink instance per process in practice.
    (0, react_1.useContext)(StdinContext_js_1.default); // anchor to App subtree for hook rules
    var ink = instances_js_1.default.get(process.stdout);
    // Memoize so callers can safely use the return value in dependency arrays.
    // ink is a singleton per stdout — stable across renders.
    return (0, react_1.useMemo)(function () {
        if (!ink) {
            return {
                copySelection: function () { return ''; },
                copySelectionNoClear: function () { return ''; },
                clearSelection: function () { },
                hasSelection: function () { return false; },
                getState: function () { return null; },
                subscribe: function () { return function () { }; },
                shiftAnchor: function () { },
                shiftSelection: function () { },
                moveFocus: function () { },
                captureScrolledRows: function () { },
                setSelectionBgColor: function () { },
            };
        }
        return {
            copySelection: function () { return ink.copySelection(); },
            copySelectionNoClear: function () { return ink.copySelectionNoClear(); },
            clearSelection: function () { return ink.clearTextSelection(); },
            hasSelection: function () { return ink.hasTextSelection(); },
            getState: function () { return ink.selection; },
            subscribe: function (cb) { return ink.subscribeToSelectionChange(cb); },
            shiftAnchor: function (dRow, minRow, maxRow) {
                return (0, selection_js_1.shiftAnchor)(ink.selection, dRow, minRow, maxRow);
            },
            shiftSelection: function (dRow, minRow, maxRow) {
                return ink.shiftSelectionForScroll(dRow, minRow, maxRow);
            },
            moveFocus: function (move) { return ink.moveSelectionFocus(move); },
            captureScrolledRows: function (firstRow, lastRow, side) {
                return ink.captureScrolledRows(firstRow, lastRow, side);
            },
            setSelectionBgColor: function (color) { return ink.setSelectionBgColor(color); },
        };
    }, [ink]);
}
var NO_SUBSCRIBE = function () { return function () { }; };
var ALWAYS_FALSE = function () { return false; };
/**
 * Reactive selection-exists state. Re-renders the caller when a text
 * selection is created or cleared. Always returns false outside
 * fullscreen mode (selection is only available in alt-screen).
 */
function useHasSelection() {
    (0, react_1.useContext)(StdinContext_js_1.default);
    var ink = instances_js_1.default.get(process.stdout);
    return (0, react_1.useSyncExternalStore)(ink ? ink.subscribeToSelectionChange : NO_SUBSCRIBE, ink ? ink.hasTextSelection : ALWAYS_FALSE);
}
