"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelRequestHandler = CancelRequestHandler;
/**
 * CancelRequestHandler component for handling cancel/escape keybinding.
 *
 * Must be rendered inside KeybindingSetup to have access to the keybinding context.
 * This component renders nothing - it just registers the cancel keybinding handler.
 */
var react_1 = require("react");
var index_js_1 = require("src/services/analytics/index.js");
var AppState_js_1 = require("src/state/AppState.js");
var utils_js_1 = require("../components/PromptInput/utils.js");
var notifications_js_1 = require("../context/notifications.js");
var overlayContext_js_1 = require("../context/overlayContext.js");
var useCommandQueue_js_1 = require("../hooks/useCommandQueue.js");
var shortcutFormat_js_1 = require("../keybindings/shortcutFormat.js");
var useKeybinding_js_1 = require("../keybindings/useKeybinding.js");
var teammateViewHelpers_js_1 = require("../state/teammateViewHelpers.js");
var LocalAgentTask_js_1 = require("../tasks/LocalAgentTask/LocalAgentTask.js");
var messageQueueManager_js_1 = require("../utils/messageQueueManager.js");
var sdkEventQueue_js_1 = require("../utils/sdkEventQueue.js");
/** Time window in ms during which a second press kills all background agents. */
var KILL_AGENTS_CONFIRM_WINDOW_MS = 3000;
/**
 * Component that handles cancel requests via keybinding.
 * Renders null but registers the 'chat:cancel' keybinding handler.
 */
function CancelRequestHandler(props) {
    var setToolUseConfirmQueue = props.setToolUseConfirmQueue, onCancel = props.onCancel, onAgentsKilled = props.onAgentsKilled, isMessageSelectorVisible = props.isMessageSelectorVisible, screen = props.screen, abortSignal = props.abortSignal, popCommandFromQueue = props.popCommandFromQueue, vimMode = props.vimMode, isLocalJSXCommand = props.isLocalJSXCommand, isSearchingHistory = props.isSearchingHistory, isHelpOpen = props.isHelpOpen, inputMode = props.inputMode, inputValue = props.inputValue, streamMode = props.streamMode;
    var store = (0, AppState_js_1.useAppStateStore)();
    var setAppState = (0, AppState_js_1.useSetAppState)();
    var queuedCommandsLength = (0, useCommandQueue_js_1.useCommandQueue)().length;
    var _a = (0, notifications_js_1.useNotifications)(), addNotification = _a.addNotification, removeNotification = _a.removeNotification;
    var lastKillAgentsPressRef = (0, react_1.useRef)(0);
    var viewSelectionMode = (0, AppState_js_1.useAppState)(function (s) { return s.viewSelectionMode; });
    var handleCancel = (0, react_1.useCallback)(function () {
        var cancelProps = {
            source: 'escape',
            streamMode: streamMode,
        };
        // Priority 1: If there's an active task running, cancel it first
        // This takes precedence over queue management so users can always interrupt Claude
        if (abortSignal !== undefined && !abortSignal.aborted) {
            (0, index_js_1.logEvent)('tengu_cancel', cancelProps);
            setToolUseConfirmQueue(function () { return []; });
            onCancel();
            return;
        }
        // Priority 2: Pop queue when Claude is idle (no running task to cancel)
        if ((0, messageQueueManager_js_1.hasCommandsInQueue)()) {
            if (popCommandFromQueue) {
                popCommandFromQueue();
                return;
            }
        }
        // Fallback: nothing to cancel or pop (shouldn't reach here if isActive is correct)
        (0, index_js_1.logEvent)('tengu_cancel', cancelProps);
        setToolUseConfirmQueue(function () { return []; });
        onCancel();
    }, [
        abortSignal,
        popCommandFromQueue,
        setToolUseConfirmQueue,
        onCancel,
        streamMode,
    ]);
    // Determine if this handler should be active
    // Other contexts (Transcript, HistorySearch, Help) have their own escape handlers
    // Overlays (ModelPicker, ThinkingToggle, etc.) register themselves via useRegisterOverlay
    // Local JSX commands (like /model, /btw) handle their own input
    var isOverlayActive = (0, overlayContext_js_1.useIsOverlayActive)();
    var canCancelRunningTask = abortSignal !== undefined && !abortSignal.aborted;
    var hasQueuedCommands = queuedCommandsLength > 0;
    // When in bash/background mode with empty input, escape should exit the mode
    // rather than cancel the request. Let PromptInput handle mode exit.
    // This only applies to Escape, not Ctrl+C which should always cancel.
    var isInSpecialModeWithEmptyInput = inputMode !== undefined && inputMode !== 'prompt' && !inputValue;
    // When viewing a teammate's transcript, let useBackgroundTaskNavigation handle Escape
    var isViewingTeammate = viewSelectionMode === 'viewing-agent';
    // Context guards: other screens/overlays handle their own cancel
    var isContextActive = screen !== 'transcript' &&
        !isSearchingHistory &&
        !isMessageSelectorVisible &&
        !isLocalJSXCommand &&
        !isHelpOpen &&
        !isOverlayActive &&
        !((0, utils_js_1.isVimModeEnabled)() && vimMode === 'INSERT');
    // Escape (chat:cancel) defers to mode-exit when in special mode with empty
    // input, and to useBackgroundTaskNavigation when viewing a teammate
    var isEscapeActive = isContextActive &&
        (canCancelRunningTask || hasQueuedCommands) &&
        !isInSpecialModeWithEmptyInput &&
        !isViewingTeammate;
    // Ctrl+C (app:interrupt): when viewing a teammate, stops everything and
    // returns to main thread. Otherwise just handleCancel. Must NOT claim
    // ctrl+c when main is idle at the prompt — that blocks the copy-selection
    // handler and double-press-to-exit from ever seeing the keypress.
    var isCtrlCActive = isContextActive &&
        (canCancelRunningTask || hasQueuedCommands || isViewingTeammate);
    (0, useKeybinding_js_1.useKeybinding)('chat:cancel', handleCancel, {
        context: 'Chat',
        isActive: isEscapeActive,
    });
    // Shared kill path: stop all agents, suppress per-agent notifications,
    // emit SDK events, enqueue a single aggregate model-facing notification.
    // Returns true if anything was killed.
    var killAllAgentsAndNotify = (0, react_1.useCallback)(function () {
        var tasks = store.getState().tasks;
        var running = Object.entries(tasks).filter(function (_a) {
            var t = _a[1];
            return t.type === 'local_agent' && t.status === 'running';
        });
        if (running.length === 0)
            return false;
        (0, LocalAgentTask_js_1.killAllRunningAgentTasks)(tasks, setAppState);
        var descriptions = [];
        for (var _i = 0, running_1 = running; _i < running_1.length; _i++) {
            var _a = running_1[_i], taskId = _a[0], task = _a[1];
            (0, LocalAgentTask_js_1.markAgentsNotified)(taskId, setAppState);
            descriptions.push(task.description);
            (0, sdkEventQueue_js_1.emitTaskTerminatedSdk)(taskId, 'stopped', {
                toolUseId: task.toolUseId,
                summary: task.description,
            });
        }
        var summary = descriptions.length === 1
            ? "Background agent \"".concat(descriptions[0], "\" was stopped by the user.")
            : "".concat(descriptions.length, " background agents were stopped by the user: ").concat(descriptions.map(function (d) { return "\"".concat(d, "\""); }).join(', '), ".");
        (0, messageQueueManager_js_1.enqueuePendingNotification)({ value: summary, mode: 'task-notification' });
        onAgentsKilled();
        return true;
    }, [store, setAppState, onAgentsKilled]);
    // Ctrl+C (app:interrupt). Scoped to teammate-view: killing agents from the
    // main prompt stays a deliberate gesture (chat:killAgents), not a
    // side-effect of cancelling a turn.
    var handleInterrupt = (0, react_1.useCallback)(function () {
        if (isViewingTeammate) {
            killAllAgentsAndNotify();
            (0, teammateViewHelpers_js_1.exitTeammateView)(setAppState);
        }
        if (canCancelRunningTask || hasQueuedCommands) {
            handleCancel();
        }
    }, [
        isViewingTeammate,
        killAllAgentsAndNotify,
        setAppState,
        canCancelRunningTask,
        hasQueuedCommands,
        handleCancel,
    ]);
    (0, useKeybinding_js_1.useKeybinding)('app:interrupt', handleInterrupt, {
        context: 'Global',
        isActive: isCtrlCActive,
    });
    // chat:killAgents uses a two-press pattern: first press shows a
    // confirmation hint, second press within the window actually kills all
    // agents. Reads tasks from the store directly to avoid stale closures.
    var handleKillAgents = (0, react_1.useCallback)(function () {
        var tasks = store.getState().tasks;
        var hasRunningAgents = Object.values(tasks).some(function (t) { return t.type === 'local_agent' && t.status === 'running'; });
        if (!hasRunningAgents) {
            addNotification({
                key: 'kill-agents-none',
                text: 'No background agents running',
                priority: 'immediate',
                timeoutMs: 2000,
            });
            return;
        }
        var now = Date.now();
        var elapsed = now - lastKillAgentsPressRef.current;
        if (elapsed <= KILL_AGENTS_CONFIRM_WINDOW_MS) {
            // Second press within window -- kill all background agents
            lastKillAgentsPressRef.current = 0;
            removeNotification('kill-agents-confirm');
            (0, index_js_1.logEvent)('tengu_cancel', {
                source: 'kill_agents',
            });
            (0, messageQueueManager_js_1.clearCommandQueue)();
            killAllAgentsAndNotify();
            return;
        }
        // First press -- show confirmation hint in status bar
        lastKillAgentsPressRef.current = now;
        var shortcut = (0, shortcutFormat_js_1.getShortcutDisplay)('chat:killAgents', 'Chat', 'ctrl+x ctrl+k');
        addNotification({
            key: 'kill-agents-confirm',
            text: "Press ".concat(shortcut, " again to stop background agents"),
            priority: 'immediate',
            timeoutMs: KILL_AGENTS_CONFIRM_WINDOW_MS,
        });
    }, [store, addNotification, removeNotification, killAllAgentsAndNotify]);
    // Must stay always-active: ctrl+x is consumed as a chord prefix regardless
    // of isActive (because ctrl+x ctrl+e is always live), so an inactive handler
    // here would leak ctrl+k to readline kill-line. Handler gates internally.
    (0, useKeybinding_js_1.useKeybinding)('chat:killAgents', handleKillAgents, {
        context: 'Chat',
    });
    return null;
}
