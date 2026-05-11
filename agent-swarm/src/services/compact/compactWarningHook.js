"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCompactWarningSuppression = useCompactWarningSuppression;
var react_1 = require("react");
var compactWarningState_js_1 = require("./compactWarningState.js");
/**
 * React hook to subscribe to compact warning suppression state.
 *
 * Lives in its own file so that compactWarningState.ts stays React-free:
 * microCompact.ts imports the pure state functions, and pulling React into
 * that module graph would drag it into the print-mode startup path.
 */
function useCompactWarningSuppression() {
    return (0, react_1.useSyncExternalStore)(compactWarningState_js_1.compactWarningStore.subscribe, compactWarningState_js_1.compactWarningStore.getState);
}
