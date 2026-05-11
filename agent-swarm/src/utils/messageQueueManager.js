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
exports.clearPendingNotifications = exports.resetPendingNotifications = exports.recheckPendingNotifications = exports.getPendingNotificationsCount = exports.hasPendingNotifications = exports.subscribeToPendingNotifications = exports.subscribeToCommandQueue = void 0;
exports.getCommandQueueSnapshot = getCommandQueueSnapshot;
exports.getCommandQueue = getCommandQueue;
exports.getCommandQueueLength = getCommandQueueLength;
exports.hasCommandsInQueue = hasCommandsInQueue;
exports.recheckCommandQueue = recheckCommandQueue;
exports.enqueue = enqueue;
exports.enqueuePendingNotification = enqueuePendingNotification;
exports.dequeue = dequeue;
exports.dequeueAll = dequeueAll;
exports.peek = peek;
exports.dequeueAllMatching = dequeueAllMatching;
exports.remove = remove;
exports.removeByFilter = removeByFilter;
exports.clearCommandQueue = clearCommandQueue;
exports.resetCommandQueue = resetCommandQueue;
exports.isPromptInputModeEditable = isPromptInputModeEditable;
exports.isQueuedCommandEditable = isQueuedCommandEditable;
exports.isQueuedCommandVisible = isQueuedCommandVisible;
exports.popAllEditable = popAllEditable;
exports.getPendingNotificationsSnapshot = getPendingNotificationsSnapshot;
exports.dequeuePendingNotification = dequeuePendingNotification;
exports.getCommandsByMaxPriority = getCommandsByMaxPriority;
exports.isSlashCommand = isSlashCommand;
var bun_bundle_1 = require("bun:bundle");
var state_js_1 = require("../bootstrap/state.js");
var messages_js_1 = require("./messages.js");
var objectGroupBy_js_1 = require("./objectGroupBy.js");
var sessionStorage_js_1 = require("./sessionStorage.js");
var signal_js_1 = require("./signal.js");
// ============================================================================
// Logging helper
// ============================================================================
function logOperation(operation, content) {
    var sessionId = (0, state_js_1.getSessionId)();
    var queueOp = __assign({ type: 'queue-operation', operation: operation, timestamp: new Date().toISOString(), sessionId: sessionId }, (content !== undefined && { content: content }));
    void (0, sessionStorage_js_1.recordQueueOperation)(queueOp);
}
// ============================================================================
// Unified command queue (module-level, independent of React state)
//
// All commands — user input, task notifications, orphaned permissions — go
// through this single queue. React components subscribe via
// useSyncExternalStore (subscribeToCommandQueue / getCommandQueueSnapshot).
// Non-React code (print.ts streaming loop) reads directly via
// getCommandQueue() / getCommandQueueLength().
//
// Priority determines dequeue order: 'now' > 'next' > 'later'.
// Within the same priority, commands are processed FIFO.
// ============================================================================
var commandQueue = [];
/** Frozen snapshot — recreated on every mutation for useSyncExternalStore. */
var snapshot = Object.freeze([]);
var queueChanged = (0, signal_js_1.createSignal)();
function notifySubscribers() {
    snapshot = Object.freeze(__spreadArray([], commandQueue, true));
    queueChanged.emit();
}
// ============================================================================
// useSyncExternalStore interface
// ============================================================================
/**
 * Subscribe to command queue changes.
 * Compatible with React's useSyncExternalStore.
 */
exports.subscribeToCommandQueue = queueChanged.subscribe;
/**
 * Get current snapshot of the command queue.
 * Compatible with React's useSyncExternalStore.
 * Returns a frozen array that only changes reference on mutation.
 */
function getCommandQueueSnapshot() {
    return snapshot;
}
// ============================================================================
// Read operations (for non-React code)
// ============================================================================
/**
 * Get a mutable copy of the current queue.
 * Use for one-off reads where you need the actual commands.
 */
function getCommandQueue() {
    return __spreadArray([], commandQueue, true);
}
/**
 * Get the current queue length without copying.
 */
function getCommandQueueLength() {
    return commandQueue.length;
}
/**
 * Check if there are commands in the queue.
 */
function hasCommandsInQueue() {
    return commandQueue.length > 0;
}
/**
 * Trigger a re-check by notifying subscribers.
 * Use after async processing completes to ensure remaining commands
 * are picked up by useSyncExternalStore consumers.
 */
function recheckCommandQueue() {
    if (commandQueue.length > 0) {
        notifySubscribers();
    }
}
// ============================================================================
// Write operations
// ============================================================================
/**
 * Add a command to the queue.
 * Used for user-initiated commands (prompt, bash, orphaned-permission).
 * Defaults priority to 'next' (processed before task notifications).
 */
function enqueue(command) {
    var _a;
    commandQueue.push(__assign(__assign({}, command), { priority: (_a = command.priority) !== null && _a !== void 0 ? _a : 'next' }));
    notifySubscribers();
    logOperation('enqueue', typeof command.value === 'string' ? command.value : undefined);
}
/**
 * Add a task notification to the queue.
 * Convenience wrapper that defaults priority to 'later' so user input
 * is never starved by system messages.
 */
function enqueuePendingNotification(command) {
    var _a;
    commandQueue.push(__assign(__assign({}, command), { priority: (_a = command.priority) !== null && _a !== void 0 ? _a : 'later' }));
    notifySubscribers();
    logOperation('enqueue', typeof command.value === 'string' ? command.value : undefined);
}
var PRIORITY_ORDER = {
    now: 0,
    next: 1,
    later: 2,
};
/**
 * Remove and return the highest-priority command, or undefined if empty.
 * Within the same priority level, commands are dequeued FIFO.
 *
 * An optional `filter` narrows the candidates: only commands for which the
 * predicate returns `true` are considered. Non-matching commands stay in the
 * queue untouched. This lets between-turn drains (SDK, REPL) restrict to
 * main-thread commands (`cmd.agentId === undefined`) without restructuring
 * the existing while-loop patterns.
 */
function dequeue(filter) {
    var _a;
    if (commandQueue.length === 0) {
        return undefined;
    }
    // Find the first command with the highest priority (respecting filter)
    var bestIdx = -1;
    var bestPriority = Infinity;
    for (var i = 0; i < commandQueue.length; i++) {
        var cmd = commandQueue[i];
        if (filter && !filter(cmd))
            continue;
        var priority = PRIORITY_ORDER[(_a = cmd.priority) !== null && _a !== void 0 ? _a : 'next'];
        if (priority < bestPriority) {
            bestIdx = i;
            bestPriority = priority;
        }
    }
    if (bestIdx === -1)
        return undefined;
    var dequeued = commandQueue.splice(bestIdx, 1)[0];
    notifySubscribers();
    logOperation('dequeue');
    return dequeued;
}
/**
 * Remove and return all commands from the queue.
 * Logs a dequeue operation for each command.
 */
function dequeueAll() {
    if (commandQueue.length === 0) {
        return [];
    }
    var commands = __spreadArray([], commandQueue, true);
    commandQueue.length = 0;
    notifySubscribers();
    for (var _i = 0, commands_1 = commands; _i < commands_1.length; _i++) {
        var _cmd = commands_1[_i];
        logOperation('dequeue');
    }
    return commands;
}
/**
 * Return the highest-priority command without removing it, or undefined if empty.
 * Accepts an optional `filter` — only commands passing the predicate are considered.
 */
function peek(filter) {
    var _a;
    if (commandQueue.length === 0) {
        return undefined;
    }
    var bestIdx = -1;
    var bestPriority = Infinity;
    for (var i = 0; i < commandQueue.length; i++) {
        var cmd = commandQueue[i];
        if (filter && !filter(cmd))
            continue;
        var priority = PRIORITY_ORDER[(_a = cmd.priority) !== null && _a !== void 0 ? _a : 'next'];
        if (priority < bestPriority) {
            bestIdx = i;
            bestPriority = priority;
        }
    }
    if (bestIdx === -1)
        return undefined;
    return commandQueue[bestIdx];
}
/**
 * Remove and return all commands matching a predicate, preserving priority order.
 * Non-matching commands stay in the queue.
 */
function dequeueAllMatching(predicate) {
    var matched = [];
    var remaining = [];
    for (var _i = 0, commandQueue_1 = commandQueue; _i < commandQueue_1.length; _i++) {
        var cmd = commandQueue_1[_i];
        if (predicate(cmd)) {
            matched.push(cmd);
        }
        else {
            remaining.push(cmd);
        }
    }
    if (matched.length === 0) {
        return [];
    }
    commandQueue.length = 0;
    commandQueue.push.apply(commandQueue, remaining);
    notifySubscribers();
    for (var _a = 0, matched_1 = matched; _a < matched_1.length; _a++) {
        var _cmd = matched_1[_a];
        logOperation('dequeue');
    }
    return matched;
}
/**
 * Remove specific commands from the queue by reference identity.
 * Callers must pass the same object references that are in the queue
 * (e.g. from getCommandsByMaxPriority). Logs a 'remove' operation for each.
 */
function remove(commandsToRemove) {
    if (commandsToRemove.length === 0) {
        return;
    }
    var before = commandQueue.length;
    for (var i = commandQueue.length - 1; i >= 0; i--) {
        if (commandsToRemove.includes(commandQueue[i])) {
            commandQueue.splice(i, 1);
        }
    }
    if (commandQueue.length !== before) {
        notifySubscribers();
    }
    for (var _i = 0, commandsToRemove_1 = commandsToRemove; _i < commandsToRemove_1.length; _i++) {
        var _cmd = commandsToRemove_1[_i];
        logOperation('remove');
    }
}
/**
 * Remove commands matching a predicate.
 * Returns the removed commands.
 */
function removeByFilter(predicate) {
    var removed = [];
    for (var i = commandQueue.length - 1; i >= 0; i--) {
        if (predicate(commandQueue[i])) {
            removed.unshift(commandQueue.splice(i, 1)[0]);
        }
    }
    if (removed.length > 0) {
        notifySubscribers();
        for (var _i = 0, removed_1 = removed; _i < removed_1.length; _i++) {
            var _cmd = removed_1[_i];
            logOperation('remove');
        }
    }
    return removed;
}
/**
 * Clear all commands from the queue.
 * Used by ESC cancellation to discard queued notifications.
 */
function clearCommandQueue() {
    if (commandQueue.length === 0) {
        return;
    }
    commandQueue.length = 0;
    notifySubscribers();
}
/**
 * Clear all commands and reset snapshot.
 * Used for test cleanup.
 */
function resetCommandQueue() {
    commandQueue.length = 0;
    snapshot = Object.freeze([]);
}
// ============================================================================
// Editable mode helpers
// ============================================================================
var NON_EDITABLE_MODES = new Set([
    'task-notification',
]);
function isPromptInputModeEditable(mode) {
    return !NON_EDITABLE_MODES.has(mode);
}
/**
 * Whether this queued command can be pulled into the input buffer via UP/ESC.
 * System-generated commands (proactive ticks, scheduled tasks, plan
 * verification, channel messages) contain raw XML and must not leak into
 * the user's input.
 */
function isQueuedCommandEditable(cmd) {
    return isPromptInputModeEditable(cmd.mode) && !cmd.isMeta;
}
/**
 * Whether this queued command should render in the queue preview under the
 * prompt. Superset of editable — channel messages show (so the keyboard user
 * sees what arrived) but stay non-editable (raw XML).
 */
function isQueuedCommandVisible(cmd) {
    var _a;
    if (((0, bun_bundle_1.feature)('KAIROS') || (0, bun_bundle_1.feature)('KAIROS_CHANNELS')) &&
        ((_a = cmd.origin) === null || _a === void 0 ? void 0 : _a.kind) === 'channel')
        return true;
    return isQueuedCommandEditable(cmd);
}
/**
 * Extract text from a queued command value.
 * For strings, returns the string.
 * For ContentBlockParam[], extracts text from text blocks.
 */
function extractTextFromValue(value) {
    return typeof value === 'string' ? value : (0, messages_js_1.extractTextContent)(value, '\n');
}
/**
 * Extract images from ContentBlockParam[] and convert to PastedContent format.
 * Returns empty array for string values or if no images found.
 */
function extractImagesFromValue(value, startId) {
    if (typeof value === 'string') {
        return [];
    }
    var images = [];
    var imageIndex = 0;
    for (var _i = 0, value_1 = value; _i < value_1.length; _i++) {
        var block = value_1[_i];
        if (block.type === 'image' && block.source.type === 'base64') {
            images.push({
                id: startId + imageIndex,
                type: 'image',
                content: block.source.data,
                mediaType: block.source.media_type,
                filename: "image".concat(imageIndex + 1),
            });
            imageIndex++;
        }
    }
    return images;
}
/**
 * Pop all editable commands and combine them with current input for editing.
 * Notification modes (task-notification) are left in the queue
 * to be auto-processed later.
 * Returns object with combined text, cursor offset, and images to restore.
 * Returns undefined if no editable commands in queue.
 */
function popAllEditable(currentInput, currentCursorOffset) {
    if (commandQueue.length === 0) {
        return undefined;
    }
    var _a = (0, objectGroupBy_js_1.objectGroupBy)(__spreadArray([], commandQueue, true), function (cmd) { return (isQueuedCommandEditable(cmd) ? 'editable' : 'nonEditable'); }), _b = _a.editable, editable = _b === void 0 ? [] : _b, _c = _a.nonEditable, nonEditable = _c === void 0 ? [] : _c;
    if (editable.length === 0) {
        return undefined;
    }
    // Extract text from queued commands (handles both strings and ContentBlockParam[])
    var queuedTexts = editable.map(function (cmd) { return extractTextFromValue(cmd.value); });
    var newInput = __spreadArray(__spreadArray([], queuedTexts, true), [currentInput], false).filter(Boolean).join('\n');
    // Calculate cursor offset: length of joined queued commands + 1 + current cursor offset
    var cursorOffset = queuedTexts.join('\n').length + 1 + currentCursorOffset;
    // Extract images from queued commands
    var images = [];
    var nextImageId = Date.now(); // Use timestamp as base for unique IDs
    for (var _i = 0, editable_1 = editable; _i < editable_1.length; _i++) {
        var cmd = editable_1[_i];
        // handlePromptSubmit queues images in pastedContents (value is a string).
        // Preserve the original PastedContent id so imageStore lookups still work.
        if (cmd.pastedContents) {
            for (var _d = 0, _e = Object.values(cmd.pastedContents); _d < _e.length; _d++) {
                var content = _e[_d];
                if (content.type === 'image') {
                    images.push(content);
                }
            }
        }
        // Bridge/remote commands may embed images directly in ContentBlockParam[].
        var cmdImages = extractImagesFromValue(cmd.value, nextImageId);
        images.push.apply(images, cmdImages);
        nextImageId += cmdImages.length;
    }
    for (var _f = 0, editable_2 = editable; _f < editable_2.length; _f++) {
        var command = editable_2[_f];
        logOperation('popAll', typeof command.value === 'string' ? command.value : undefined);
    }
    // Replace queue contents with only the non-editable commands
    commandQueue.length = 0;
    commandQueue.push.apply(commandQueue, nonEditable);
    notifySubscribers();
    return { text: newInput, cursorOffset: cursorOffset, images: images };
}
// ============================================================================
// Backward-compatible aliases (deprecated — prefer new names)
// ============================================================================
/** @deprecated Use subscribeToCommandQueue */
exports.subscribeToPendingNotifications = exports.subscribeToCommandQueue;
/** @deprecated Use getCommandQueueSnapshot */
function getPendingNotificationsSnapshot() {
    return snapshot;
}
/** @deprecated Use hasCommandsInQueue */
exports.hasPendingNotifications = hasCommandsInQueue;
/** @deprecated Use getCommandQueueLength */
exports.getPendingNotificationsCount = getCommandQueueLength;
/** @deprecated Use recheckCommandQueue */
exports.recheckPendingNotifications = recheckCommandQueue;
/** @deprecated Use dequeue */
function dequeuePendingNotification() {
    return dequeue();
}
/** @deprecated Use resetCommandQueue */
exports.resetPendingNotifications = resetCommandQueue;
/** @deprecated Use clearCommandQueue */
exports.clearPendingNotifications = clearCommandQueue;
/**
 * Get commands at or above a given priority level without removing them.
 * Useful for mid-chain draining where only urgent items should be processed.
 *
 * Priority order: 'now' (0) > 'next' (1) > 'later' (2).
 * Passing 'now' returns only now-priority commands; 'later' returns everything.
 */
function getCommandsByMaxPriority(maxPriority) {
    var threshold = PRIORITY_ORDER[maxPriority];
    return commandQueue.filter(function (cmd) { var _a; return PRIORITY_ORDER[(_a = cmd.priority) !== null && _a !== void 0 ? _a : 'next'] <= threshold; });
}
/**
 * Returns true if the command is a slash command that should be routed through
 * processSlashCommand rather than sent to the model as text.
 *
 * Commands with `skipSlashCommands` (e.g. bridge/CCR messages) are NOT treated
 * as slash commands — their text is meant for the model.
 */
function isSlashCommand(cmd) {
    return (typeof cmd.value === 'string' &&
        cmd.value.trim().startsWith('/') &&
        !cmd.skipSlashCommands);
}
