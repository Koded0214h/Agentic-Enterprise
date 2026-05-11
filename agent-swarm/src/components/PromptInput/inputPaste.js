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
exports.maybeTruncateMessageForInput = maybeTruncateMessageForInput;
exports.maybeTruncateInput = maybeTruncateInput;
var history_js_1 = require("src/history.js");
var TRUNCATION_THRESHOLD = 10000; // Characters before we truncate
var PREVIEW_LENGTH = 1000; // Characters to show at start and end
/**
 * Determines whether the input text should be truncated. If so, it adds a
 * truncated text placeholder and neturns
 *
 * @param text The input text
 * @param nextPasteId The reference id to use
 * @returns The new text to display and separate placeholder content if applicable.
 */
function maybeTruncateMessageForInput(text, nextPasteId) {
    // If the text is short enough, return it as-is
    if (text.length <= TRUNCATION_THRESHOLD) {
        return {
            truncatedText: text,
            placeholderContent: '',
        };
    }
    // Calculate how much text to keep from start and end
    var startLength = Math.floor(PREVIEW_LENGTH / 2);
    var endLength = Math.floor(PREVIEW_LENGTH / 2);
    // Extract the portions we'll keep
    var startText = text.slice(0, startLength);
    var endText = text.slice(-endLength);
    // Calculate the number of lines that will be truncated
    var placeholderContent = text.slice(startLength, -endLength);
    var truncatedLines = (0, history_js_1.getPastedTextRefNumLines)(placeholderContent);
    // Create a placeholder reference similar to pasted text
    var placeholderId = nextPasteId;
    var placeholderRef = formatTruncatedTextRef(placeholderId, truncatedLines);
    // Combine the parts with the placeholder
    var truncatedText = startText + placeholderRef + endText;
    return {
        truncatedText: truncatedText,
        placeholderContent: placeholderContent,
    };
}
function formatTruncatedTextRef(id, numLines) {
    return "[...Truncated text #".concat(id, " +").concat(numLines, " lines...]");
}
function maybeTruncateInput(input, pastedContents) {
    var _a;
    // Get the next available ID for the truncated content
    var existingIds = Object.keys(pastedContents).map(Number);
    var nextPasteId = existingIds.length > 0 ? Math.max.apply(Math, existingIds) + 1 : 1;
    // Apply truncation
    var _b = maybeTruncateMessageForInput(input, nextPasteId), truncatedText = _b.truncatedText, placeholderContent = _b.placeholderContent;
    if (!placeholderContent) {
        return { newInput: input, newPastedContents: pastedContents };
    }
    return {
        newInput: truncatedText,
        newPastedContents: __assign(__assign({}, pastedContents), (_a = {}, _a[nextPasteId] = {
            id: nextPasteId,
            type: 'text',
            content: placeholderContent,
        }, _a)),
    };
}
