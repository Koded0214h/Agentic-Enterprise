"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useQueueProcessor = useQueueProcessor;
var react_1 = require("react");
var messageQueueManager_js_1 = require("../utils/messageQueueManager.js");
var queueProcessor_js_1 = require("../utils/queueProcessor.js");
/**
 * Hook that processes queued commands when conditions are met.
 *
 * Uses a single unified command queue (module-level store). Priority determines
 * processing order: 'now' > 'next' (user input) > 'later' (task notifications).
 * The dequeue() function handles priority ordering automatically.
 *
 * Processing triggers when:
 * - No query active (queryGuard — reactive via useSyncExternalStore)
 * - Queue has items
 * - No active local JSX UI blocking input
 */
function useQueueProcessor(_a) {
    var executeQueuedInput = _a.executeQueuedInput, hasActiveLocalJsxUI = _a.hasActiveLocalJsxUI, queryGuard = _a.queryGuard;
    // Subscribe to the query guard. Re-renders when a query starts or ends
    // (or when reserve/cancelReservation transitions dispatching state).
    var isQueryActive = (0, react_1.useSyncExternalStore)(queryGuard.subscribe, queryGuard.getSnapshot);
    // Subscribe to the unified command queue via useSyncExternalStore.
    // This guarantees re-render when the store changes, bypassing
    // React context propagation delays that cause missed notifications in Ink.
    var queueSnapshot = (0, react_1.useSyncExternalStore)(messageQueueManager_js_1.subscribeToCommandQueue, messageQueueManager_js_1.getCommandQueueSnapshot);
    (0, react_1.useEffect)(function () {
        if (isQueryActive)
            return;
        if (hasActiveLocalJsxUI)
            return;
        if (queueSnapshot.length === 0)
            return;
        // Reservation is now owned by handlePromptSubmit (inside executeUserInput's
        // try block). The sync chain executeQueuedInput → handlePromptSubmit →
        // executeUserInput → queryGuard.reserve() runs before the first real await,
        // so by the time React re-runs this effect (due to the dequeue-triggered
        // snapshot change), isQueryActive is already true (dispatching) and the
        // guard above returns early. handlePromptSubmit's finally releases the
        // reservation via cancelReservation() (no-op if onQuery already ran end()).
        (0, queueProcessor_js_1.processQueueIfReady)({ executeInput: executeQueuedInput });
    }, [
        queueSnapshot,
        isQueryActive,
        executeQueuedInput,
        hasActiveLocalJsxUI,
        queryGuard,
    ]);
}
