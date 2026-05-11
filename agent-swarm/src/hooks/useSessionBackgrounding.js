"use strict";
/**
 * Hook for managing session backgrounding (Ctrl+B to background/foreground sessions).
 *
 * Handles:
 * - Calling onBackgroundQuery to spawn a background task for the current query
 * - Re-backgrounding foregrounded tasks
 * - Syncing foregrounded task messages/state to main view
 */
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSessionBackgrounding = useSessionBackgrounding;
var react_1 = require("react");
var AppState_js_1 = require("../state/AppState.js");
function useSessionBackgrounding(_a) {
    var setMessages = _a.setMessages, setIsLoading = _a.setIsLoading, resetLoadingState = _a.resetLoadingState, setAbortController = _a.setAbortController, onBackgroundQuery = _a.onBackgroundQuery;
    var foregroundedTaskId = (0, AppState_js_1.useAppState)(function (s) { return s.foregroundedTaskId; });
    var foregroundedTask = (0, AppState_js_1.useAppState)(function (s) {
        return s.foregroundedTaskId ? s.tasks[s.foregroundedTaskId] : undefined;
    });
    var setAppState = (0, AppState_js_1.useSetAppState)();
    var lastSyncedMessagesLengthRef = (0, react_1.useRef)(0);
    var handleBackgroundSession = (0, react_1.useCallback)(function () {
        if (foregroundedTaskId) {
            // Re-background the foregrounded task
            setAppState(function (prev) {
                var _a;
                var taskId = prev.foregroundedTaskId;
                if (!taskId)
                    return prev;
                var task = prev.tasks[taskId];
                if (!task) {
                    return __assign(__assign({}, prev), { foregroundedTaskId: undefined });
                }
                return __assign(__assign({}, prev), { foregroundedTaskId: undefined, tasks: __assign(__assign({}, prev.tasks), (_a = {}, _a[taskId] = __assign(__assign({}, task), { isBackgrounded: true }), _a)) });
            });
            setMessages([]);
            resetLoadingState();
            setAbortController(null);
            return;
        }
        onBackgroundQuery();
    }, [
        foregroundedTaskId,
        setAppState,
        setMessages,
        resetLoadingState,
        setAbortController,
        onBackgroundQuery,
    ]);
    // Sync foregrounded task's messages and loading state to the main view
    (0, react_1.useEffect)(function () {
        var _a;
        if (!foregroundedTaskId) {
            // Reset when no foregrounded task
            lastSyncedMessagesLengthRef.current = 0;
            return;
        }
        if (!foregroundedTask || foregroundedTask.type !== 'local_agent') {
            setAppState(function (prev) { return (__assign(__assign({}, prev), { foregroundedTaskId: undefined })); });
            resetLoadingState();
            lastSyncedMessagesLengthRef.current = 0;
            return;
        }
        // Sync messages from background task to main view
        // Only update if messages have actually changed to avoid redundant renders
        var taskMessages = (_a = foregroundedTask.messages) !== null && _a !== void 0 ? _a : [];
        if (taskMessages.length !== lastSyncedMessagesLengthRef.current) {
            lastSyncedMessagesLengthRef.current = taskMessages.length;
            setMessages(__spreadArray([], taskMessages, true));
        }
        if (foregroundedTask.status === 'running') {
            // Check if the task was aborted (user pressed Escape)
            var taskAbortController = foregroundedTask.abortController;
            if (taskAbortController === null || taskAbortController === void 0 ? void 0 : taskAbortController.signal.aborted) {
                // Task was aborted - clear foregrounded state immediately
                setAppState(function (prev) {
                    var _a;
                    if (!prev.foregroundedTaskId)
                        return prev;
                    var task = prev.tasks[prev.foregroundedTaskId];
                    if (!task)
                        return __assign(__assign({}, prev), { foregroundedTaskId: undefined });
                    return __assign(__assign({}, prev), { foregroundedTaskId: undefined, tasks: __assign(__assign({}, prev.tasks), (_a = {}, _a[prev.foregroundedTaskId] = __assign(__assign({}, task), { isBackgrounded: true }), _a)) });
                });
                resetLoadingState();
                setAbortController(null);
                lastSyncedMessagesLengthRef.current = 0;
                return;
            }
            setIsLoading(true);
            // Set abort controller to the foregrounded task's controller for Escape handling
            if (taskAbortController) {
                setAbortController(taskAbortController);
            }
        }
        else {
            // Task completed - restore to background and clear foregrounded view
            setAppState(function (prev) {
                var _a;
                var taskId = prev.foregroundedTaskId;
                if (!taskId)
                    return prev;
                var task = prev.tasks[taskId];
                if (!task)
                    return __assign(__assign({}, prev), { foregroundedTaskId: undefined });
                return __assign(__assign({}, prev), { foregroundedTaskId: undefined, tasks: __assign(__assign({}, prev.tasks), (_a = {}, _a[taskId] = __assign(__assign({}, task), { isBackgrounded: true }), _a)) });
            });
            resetLoadingState();
            setAbortController(null);
            lastSyncedMessagesLengthRef.current = 0;
        }
    }, [
        foregroundedTaskId,
        foregroundedTask,
        setAppState,
        setMessages,
        setIsLoading,
        resetLoadingState,
        setAbortController,
    ]);
    return {
        handleBackgroundSession: handleBackgroundSession,
    };
}
