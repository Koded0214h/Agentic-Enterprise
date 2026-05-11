"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useBackgroundTaskNavigation = useBackgroundTaskNavigation;
var react_1 = require("react");
var keyboard_event_js_1 = require("../ink/events/keyboard-event.js");
// eslint-disable-next-line custom-rules/prefer-use-keybindings -- backward-compat bridge until REPL wires handleKeyDown to <Box onKeyDown>
var ink_js_1 = require("../ink.js");
var AppState_js_1 = require("../state/AppState.js");
var teammateViewHelpers_js_1 = require("../state/teammateViewHelpers.js");
var InProcessTeammateTask_js_1 = require("../tasks/InProcessTeammateTask/InProcessTeammateTask.js");
var types_js_1 = require("../tasks/InProcessTeammateTask/types.js");
var types_js_2 = require("../tasks/types.js");
// Step teammate selection by delta, wrapping across leader(-1)..teammates(0..n-1)..hide(n).
// First step from a collapsed tree expands it and parks on leader.
function stepTeammateSelection(delta, setAppState) {
    setAppState(function (prev) {
        var currentCount = (0, InProcessTeammateTask_js_1.getRunningTeammatesSorted)(prev.tasks).length;
        if (currentCount === 0)
            return prev;
        if (prev.expandedView !== 'teammates') {
            return __assign(__assign({}, prev), { expandedView: 'teammates', viewSelectionMode: 'selecting-agent', selectedIPAgentIndex: -1 });
        }
        var maxIdx = currentCount; // hide row
        var cur = prev.selectedIPAgentIndex;
        var next = delta === 1
            ? cur >= maxIdx
                ? -1
                : cur + 1
            : cur <= -1
                ? maxIdx
                : cur - 1;
        return __assign(__assign({}, prev), { selectedIPAgentIndex: next, viewSelectionMode: 'selecting-agent' });
    });
}
/**
 * Custom hook that handles Shift+Up/Down keyboard navigation for background tasks.
 * When teammates (swarm) are present, navigates between leader and teammates.
 * When only non-teammate background tasks exist, opens the background tasks dialog.
 * Also handles Enter to confirm selection, 'f' to view transcript, and 'k' to kill.
 */
function useBackgroundTaskNavigation(options) {
    var tasks = (0, AppState_js_1.useAppState)(function (s) { return s.tasks; });
    var viewSelectionMode = (0, AppState_js_1.useAppState)(function (s) { return s.viewSelectionMode; });
    var viewingAgentTaskId = (0, AppState_js_1.useAppState)(function (s) { return s.viewingAgentTaskId; });
    var selectedIPAgentIndex = (0, AppState_js_1.useAppState)(function (s) { return s.selectedIPAgentIndex; });
    var setAppState = (0, AppState_js_1.useSetAppState)();
    // Filter to running teammates and sort alphabetically to match TeammateSpinnerTree display
    var teammateTasks = (0, InProcessTeammateTask_js_1.getRunningTeammatesSorted)(tasks);
    var teammateCount = teammateTasks.length;
    // Check for non-teammate background tasks (local_agent, local_bash, etc.)
    var hasNonTeammateBackgroundTasks = Object.values(tasks).some(function (t) { return (0, types_js_2.isBackgroundTask)(t) && t.type !== 'in_process_teammate'; });
    // Track previous teammate count to detect when teammates are removed
    var prevTeammateCountRef = (0, react_1.useRef)(teammateCount);
    // Clamp selection index if teammates are removed or reset when count becomes 0
    (0, react_1.useEffect)(function () {
        var prevCount = prevTeammateCountRef.current;
        prevTeammateCountRef.current = teammateCount;
        setAppState(function (prev) {
            var currentTeammates = (0, InProcessTeammateTask_js_1.getRunningTeammatesSorted)(prev.tasks);
            var currentCount = currentTeammates.length;
            // When teammates are removed (count goes from >0 to 0), reset selection
            // Only reset if we previously had teammates (not on initial mount with 0)
            // Don't clobber viewSelectionMode if actively viewing a teammate transcript —
            // the user may be reviewing a completed teammate and needs escape to exit
            if (currentCount === 0 &&
                prevCount > 0 &&
                prev.selectedIPAgentIndex !== -1) {
                if (prev.viewSelectionMode === 'viewing-agent') {
                    return __assign(__assign({}, prev), { selectedIPAgentIndex: -1 });
                }
                return __assign(__assign({}, prev), { selectedIPAgentIndex: -1, viewSelectionMode: 'none' });
            }
            // Clamp if index is out of bounds
            // Max valid index is currentCount (the "hide" row) when spinner tree is shown
            var maxIndex = prev.expandedView === 'teammates' ? currentCount : currentCount - 1;
            if (currentCount > 0 && prev.selectedIPAgentIndex > maxIndex) {
                return __assign(__assign({}, prev), { selectedIPAgentIndex: maxIndex });
            }
            return prev;
        });
    }, [teammateCount, setAppState]);
    // Get the selected teammate's task info
    var getSelectedTeammate = function () {
        if (teammateCount === 0)
            return null;
        var selectedIndex = selectedIPAgentIndex;
        var task = teammateTasks[selectedIndex];
        if (!task)
            return null;
        return { taskId: task.id, task: task };
    };
    var handleKeyDown = function (e) {
        var _a, _b;
        // Escape in viewing mode:
        // - If teammate is running: abort current work only (stops current turn, teammate stays alive)
        // - If teammate is not running (completed/killed/failed): exit the view back to leader
        if (e.key === 'escape' && viewSelectionMode === 'viewing-agent') {
            e.preventDefault();
            var taskId = viewingAgentTaskId;
            if (taskId) {
                var task = tasks[taskId];
                if ((0, types_js_1.isInProcessTeammateTask)(task) && task.status === 'running') {
                    // Abort currentWorkAbortController (stops current turn) NOT abortController (kills teammate)
                    (_a = task.currentWorkAbortController) === null || _a === void 0 ? void 0 : _a.abort();
                    return;
                }
            }
            // Teammate is not running or task doesn't exist — exit the view
            (0, teammateViewHelpers_js_1.exitTeammateView)(setAppState);
            return;
        }
        // Escape in selection mode: exit selection without aborting leader
        if (e.key === 'escape' && viewSelectionMode === 'selecting-agent') {
            e.preventDefault();
            setAppState(function (prev) { return (__assign(__assign({}, prev), { viewSelectionMode: 'none', selectedIPAgentIndex: -1 })); });
            return;
        }
        // Shift+Up/Down for teammate transcript switching (with wrapping)
        // Index -1 represents the leader, 0+ are teammates
        // When showSpinnerTree is true, index === teammateCount is the "hide" row
        if (e.shift && (e.key === 'up' || e.key === 'down')) {
            e.preventDefault();
            if (teammateCount > 0) {
                stepTeammateSelection(e.key === 'down' ? 1 : -1, setAppState);
            }
            else if (hasNonTeammateBackgroundTasks) {
                (_b = options === null || options === void 0 ? void 0 : options.onOpenBackgroundTasks) === null || _b === void 0 ? void 0 : _b.call(options);
            }
            return;
        }
        // 'f' to view selected teammate's transcript (only in selecting mode)
        if (e.key === 'f' &&
            viewSelectionMode === 'selecting-agent' &&
            teammateCount > 0) {
            e.preventDefault();
            var selected = getSelectedTeammate();
            if (selected) {
                (0, teammateViewHelpers_js_1.enterTeammateView)(selected.taskId, setAppState);
            }
            return;
        }
        // Enter to confirm selection (only when in selecting mode)
        if (e.key === 'return' && viewSelectionMode === 'selecting-agent') {
            e.preventDefault();
            if (selectedIPAgentIndex === -1) {
                (0, teammateViewHelpers_js_1.exitTeammateView)(setAppState);
            }
            else if (selectedIPAgentIndex >= teammateCount) {
                // "Hide" row selected - collapse the spinner tree
                setAppState(function (prev) { return (__assign(__assign({}, prev), { expandedView: 'none', viewSelectionMode: 'none', selectedIPAgentIndex: -1 })); });
            }
            else {
                var selected = getSelectedTeammate();
                if (selected) {
                    (0, teammateViewHelpers_js_1.enterTeammateView)(selected.taskId, setAppState);
                }
            }
            return;
        }
        // k to kill selected teammate (only in selecting mode)
        if (e.key === 'k' &&
            viewSelectionMode === 'selecting-agent' &&
            selectedIPAgentIndex >= 0) {
            e.preventDefault();
            var selected = getSelectedTeammate();
            if (selected && selected.task.status === 'running') {
                void InProcessTeammateTask_js_1.InProcessTeammateTask.kill(selected.taskId, setAppState);
            }
            return;
        }
    };
    // Backward-compat bridge: REPL.tsx doesn't yet wire handleKeyDown to
    // <Box onKeyDown>. Subscribe via useInput and adapt InputEvent →
    // KeyboardEvent until the consumer is migrated (separate PR).
    // TODO(onKeyDown-migration): remove once REPL passes handleKeyDown.
    (0, ink_js_1.useInput)(function (_input, _key, event) {
        handleKeyDown(new keyboard_event_js_1.KeyboardEvent(event.keypress));
    });
    return { handleKeyDown: handleKeyDown };
}
