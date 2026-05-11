"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compactWarningStore = void 0;
exports.suppressCompactWarning = suppressCompactWarning;
exports.clearCompactWarningSuppression = clearCompactWarningSuppression;
var store_js_1 = require("../../state/store.js");
/**
 * Tracks whether the "context left until autocompact" warning should be suppressed.
 * We suppress immediately after successful compaction since we don't have accurate
 * token counts until the next API response.
 */
exports.compactWarningStore = (0, store_js_1.createStore)(false);
/** Suppress the compact warning. Call after successful compaction. */
function suppressCompactWarning() {
    exports.compactWarningStore.setState(function () { return true; });
}
/** Clear the compact warning suppression. Called at start of new compact attempt. */
function clearCompactWarningSuppression() {
    exports.compactWarningStore.setState(function () { return false; });
}
