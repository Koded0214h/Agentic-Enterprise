"use strict";
// Width-aware truncation/wrapping — needs ink/stringWidth (not leaf-safe).
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
exports.truncatePathMiddle = truncatePathMiddle;
exports.truncateToWidth = truncateToWidth;
exports.truncateStartToWidth = truncateStartToWidth;
exports.truncateToWidthNoEllipsis = truncateToWidthNoEllipsis;
exports.truncate = truncate;
exports.wrapText = wrapText;
var stringWidth_js_1 = require("../ink/stringWidth.js");
var intl_js_1 = require("./intl.js");
/**
 * Truncates a file path in the middle to preserve both directory context and filename.
 * Width-aware: uses stringWidth() for correct CJK/emoji measurement.
 * For example: "src/components/deeply/nested/folder/MyComponent.tsx" becomes
 * "src/components/…/MyComponent.tsx" when maxLength is 30.
 *
 * @param path The file path to truncate
 * @param maxLength Maximum display width of the result in terminal columns (must be > 0)
 * @returns The truncated path, or original if it fits within maxLength
 */
function truncatePathMiddle(path, maxLength) {
    // No truncation needed
    if ((0, stringWidth_js_1.stringWidth)(path) <= maxLength) {
        return path;
    }
    // Handle edge case of very small or non-positive maxLength
    if (maxLength <= 0) {
        return '…';
    }
    // Need at least room for "…" + something meaningful
    if (maxLength < 5) {
        return truncateToWidth(path, maxLength);
    }
    // Find the filename (last path segment)
    var lastSlash = path.lastIndexOf('/');
    // Include the leading slash in filename for display
    var filename = lastSlash >= 0 ? path.slice(lastSlash) : path;
    var directory = lastSlash >= 0 ? path.slice(0, lastSlash) : '';
    var filenameWidth = (0, stringWidth_js_1.stringWidth)(filename);
    // If filename alone is too long, truncate from start
    if (filenameWidth >= maxLength - 1) {
        return truncateStartToWidth(path, maxLength);
    }
    // Calculate space available for directory prefix
    // Result format: directory + "…" + filename
    var availableForDir = maxLength - 1 - filenameWidth; // -1 for ellipsis
    if (availableForDir <= 0) {
        // No room for directory, just show filename (truncated if needed)
        return truncateStartToWidth(filename, maxLength);
    }
    // Truncate directory and combine
    var truncatedDir = truncateToWidthNoEllipsis(directory, availableForDir);
    return truncatedDir + '…' + filename;
}
/**
 * Truncates a string to fit within a maximum display width, measured in terminal columns.
 * Splits on grapheme boundaries to avoid breaking emoji or surrogate pairs.
 * Appends '…' when truncation occurs.
 */
function truncateToWidth(text, maxWidth) {
    if ((0, stringWidth_js_1.stringWidth)(text) <= maxWidth)
        return text;
    if (maxWidth <= 1)
        return '…';
    var width = 0;
    var result = '';
    for (var _i = 0, _a = (0, intl_js_1.getGraphemeSegmenter)().segment(text); _i < _a.length; _i++) {
        var segment = _a[_i].segment;
        var segWidth = (0, stringWidth_js_1.stringWidth)(segment);
        if (width + segWidth > maxWidth - 1)
            break;
        result += segment;
        width += segWidth;
    }
    return result + '…';
}
/**
 * Truncates from the start of a string, keeping the tail end.
 * Prepends '…' when truncation occurs.
 * Width-aware and grapheme-safe.
 */
function truncateStartToWidth(text, maxWidth) {
    if ((0, stringWidth_js_1.stringWidth)(text) <= maxWidth)
        return text;
    if (maxWidth <= 1)
        return '…';
    var segments = __spreadArray([], (0, intl_js_1.getGraphemeSegmenter)().segment(text), true);
    var width = 0;
    var startIdx = segments.length;
    for (var i = segments.length - 1; i >= 0; i--) {
        var segWidth = (0, stringWidth_js_1.stringWidth)(segments[i].segment);
        if (width + segWidth > maxWidth - 1)
            break; // -1 for '…'
        width += segWidth;
        startIdx = i;
    }
    return ('…' +
        segments
            .slice(startIdx)
            .map(function (s) { return s.segment; })
            .join(''));
}
/**
 * Truncates a string to fit within a maximum display width, without appending an ellipsis.
 * Useful when the caller adds its own separator (e.g. middle-truncation with '…' between parts).
 * Width-aware and grapheme-safe.
 */
function truncateToWidthNoEllipsis(text, maxWidth) {
    if ((0, stringWidth_js_1.stringWidth)(text) <= maxWidth)
        return text;
    if (maxWidth <= 0)
        return '';
    var width = 0;
    var result = '';
    for (var _i = 0, _a = (0, intl_js_1.getGraphemeSegmenter)().segment(text); _i < _a.length; _i++) {
        var segment = _a[_i].segment;
        var segWidth = (0, stringWidth_js_1.stringWidth)(segment);
        if (width + segWidth > maxWidth)
            break;
        result += segment;
        width += segWidth;
    }
    return result;
}
/**
 * Truncates a string to fit within a maximum display width (terminal columns),
 * splitting on grapheme boundaries to avoid breaking emoji, CJK, or surrogate pairs.
 * Appends '…' when truncation occurs.
 * @param str The string to truncate
 * @param maxWidth Maximum display width in terminal columns
 * @param singleLine If true, also truncates at the first newline
 * @returns The truncated string with ellipsis if needed
 */
function truncate(str, maxWidth, singleLine) {
    if (singleLine === void 0) { singleLine = false; }
    var result = str;
    // If singleLine is true, truncate at first newline
    if (singleLine) {
        var firstNewline = str.indexOf('\n');
        if (firstNewline !== -1) {
            result = str.substring(0, firstNewline);
            // Ensure total width including ellipsis doesn't exceed maxWidth
            if ((0, stringWidth_js_1.stringWidth)(result) + 1 > maxWidth) {
                return truncateToWidth(result, maxWidth);
            }
            return "".concat(result, "\u2026");
        }
    }
    if ((0, stringWidth_js_1.stringWidth)(result) <= maxWidth) {
        return result;
    }
    return truncateToWidth(result, maxWidth);
}
function wrapText(text, width) {
    var lines = [];
    var currentLine = '';
    var currentWidth = 0;
    for (var _i = 0, _a = (0, intl_js_1.getGraphemeSegmenter)().segment(text); _i < _a.length; _i++) {
        var segment = _a[_i].segment;
        var segWidth = (0, stringWidth_js_1.stringWidth)(segment);
        if (currentWidth + segWidth <= width) {
            currentLine += segment;
            currentWidth += segWidth;
        }
        else {
            if (currentLine)
                lines.push(currentLine);
            currentLine = segment;
            currentWidth = segWidth;
        }
    }
    if (currentLine)
        lines.push(currentLine);
    return lines;
}
