"use strict";
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
exports.useInputBuffer = useInputBuffer;
var react_1 = require("react");
function useInputBuffer(_a) {
    var maxBufferSize = _a.maxBufferSize, debounceMs = _a.debounceMs;
    var _b = (0, react_1.useState)([]), buffer = _b[0], setBuffer = _b[1];
    var _c = (0, react_1.useState)(-1), currentIndex = _c[0], setCurrentIndex = _c[1];
    var lastPushTime = (0, react_1.useRef)(0);
    var pendingPush = (0, react_1.useRef)(null);
    var pushToBuffer = (0, react_1.useCallback)(function (text, cursorOffset, pastedContents) {
        if (pastedContents === void 0) { pastedContents = {}; }
        var now = Date.now();
        // Clear any pending push
        if (pendingPush.current) {
            clearTimeout(pendingPush.current);
            pendingPush.current = null;
        }
        // Debounce rapid changes
        if (now - lastPushTime.current < debounceMs) {
            pendingPush.current = setTimeout(pushToBuffer, debounceMs, text, cursorOffset, pastedContents);
            return;
        }
        lastPushTime.current = now;
        setBuffer(function (prevBuffer) {
            // If we're not at the end of the buffer, truncate everything after current position
            var newBuffer = currentIndex >= 0 ? prevBuffer.slice(0, currentIndex + 1) : prevBuffer;
            // Don't add if it's the same as the last entry
            var lastEntry = newBuffer[newBuffer.length - 1];
            if (lastEntry && lastEntry.text === text) {
                return newBuffer;
            }
            // Add new entry
            var updatedBuffer = __spreadArray(__spreadArray([], newBuffer, true), [
                { text: text, cursorOffset: cursorOffset, pastedContents: pastedContents, timestamp: now },
            ], false);
            // Limit buffer size
            if (updatedBuffer.length > maxBufferSize) {
                return updatedBuffer.slice(-maxBufferSize);
            }
            return updatedBuffer;
        });
        // Update current index to point to the new entry
        setCurrentIndex(function (prev) {
            var newIndex = prev >= 0 ? prev + 1 : buffer.length;
            return Math.min(newIndex, maxBufferSize - 1);
        });
    }, [debounceMs, maxBufferSize, currentIndex, buffer.length]);
    var undo = (0, react_1.useCallback)(function () {
        if (currentIndex < 0 || buffer.length === 0) {
            return undefined;
        }
        var targetIndex = Math.max(0, currentIndex - 1);
        var entry = buffer[targetIndex];
        if (entry) {
            setCurrentIndex(targetIndex);
            return entry;
        }
        return undefined;
    }, [buffer, currentIndex]);
    var clearBuffer = (0, react_1.useCallback)(function () {
        setBuffer([]);
        setCurrentIndex(-1);
        lastPushTime.current = 0;
        if (pendingPush.current) {
            clearTimeout(pendingPush.current);
            pendingPush.current = null;
        }
    }, [lastPushTime, pendingPush]);
    var canUndo = currentIndex > 0 && buffer.length > 1;
    return {
        pushToBuffer: pushToBuffer,
        undo: undo,
        canUndo: canUndo,
        clearBuffer: clearBuffer,
    };
}
