"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSearchHighlight = useSearchHighlight;
var react_1 = require("react");
var StdinContext_js_1 = require("../components/StdinContext.js");
var instances_js_1 = require("../instances.js");
/**
 * Set the search highlight query on the Ink instance. Non-empty → all
 * visible occurrences are inverted on the next frame (SGR 7, screen-buffer
 * overlay, same damage machinery as selection). Empty → clears.
 *
 * This is a screen-space highlight — it matches the RENDERED text, not the
 * source message text. Works for anything visible (bash output, file paths,
 * error messages) regardless of where it came from in the message tree. A
 * query that matched in source but got truncated/ellipsized in rendering
 * won't highlight; that's acceptable — we highlight what you see.
 */
function useSearchHighlight() {
    (0, react_1.useContext)(StdinContext_js_1.default); // anchor to App subtree for hook rules
    var ink = instances_js_1.default.get(process.stdout);
    return (0, react_1.useMemo)(function () {
        if (!ink) {
            return {
                setQuery: function () { },
                scanElement: function () { return []; },
                setPositions: function () { },
            };
        }
        return {
            setQuery: function (query) { return ink.setSearchHighlight(query); },
            scanElement: function (el) { return ink.scanElementSubtree(el); },
            setPositions: function (state) { return ink.setSearchPositions(state); },
        };
    }, [ink]);
}
