"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCommandQueue = useCommandQueue;
var react_1 = require("react");
var messageQueueManager_js_1 = require("../utils/messageQueueManager.js");
/**
 * React hook to subscribe to the unified command queue.
 * Returns a frozen array that only changes reference on mutation.
 * Components re-render only when the queue changes.
 */
function useCommandQueue() {
    return (0, react_1.useSyncExternalStore)(messageQueueManager_js_1.subscribeToCommandQueue, messageQueueManager_js_1.getCommandQueueSnapshot);
}
