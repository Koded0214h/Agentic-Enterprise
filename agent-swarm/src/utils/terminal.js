"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderTruncatedContent = renderTruncatedContent;
exports.isOutputLineTruncated = isOutputLineTruncated;
var chalk_1 = require("chalk");
var CtrlOToExpand_js_1 = require("../components/CtrlOToExpand.js");
var stringWidth_js_1 = require("../ink/stringWidth.js");
var sliceAnsi_js_1 = require("./sliceAnsi.js");
// Text rendering utilities for terminal display
var MAX_LINES_TO_SHOW = 3;
// Account for MessageResponse prefix ("  ⎿ " = 5 chars) + parent width
// reduction (columns - 5 in tool result rendering)
var PADDING_TO_PREVENT_OVERFLOW = 10;
/**
 * Inserts newlines in a string to wrap it at the specified width.
 * Uses ANSI-aware slicing to avoid splitting escape sequences.
 * @param text The text to wrap.
 * @param wrapWidth The width at which to wrap lines (in visible characters).
 * @returns The wrapped text.
 */
function wrapText(text, wrapWidth) {
    var lines = text.split('\n');
    var wrappedLines = [];
    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
        var line = lines_1[_i];
        var visibleWidth = (0, stringWidth_js_1.stringWidth)(line);
        if (visibleWidth <= wrapWidth) {
            wrappedLines.push(line.trimEnd());
        }
        else {
            // Break long lines into chunks of wrapWidth visible characters
            // using ANSI-aware slicing to preserve escape sequences
            var position = 0;
            while (position < visibleWidth) {
                var chunk = (0, sliceAnsi_js_1.default)(line, position, position + wrapWidth);
                wrappedLines.push(chunk.trimEnd());
                position += wrapWidth;
            }
        }
    }
    var remainingLines = wrappedLines.length - MAX_LINES_TO_SHOW;
    // If there's only 1 line after the fold, show it directly
    // instead of showing "... +1 line (ctrl+o to expand)"
    if (remainingLines === 1) {
        return {
            aboveTheFold: wrappedLines
                .slice(0, MAX_LINES_TO_SHOW + 1)
                .join('\n')
                .trimEnd(),
            remainingLines: 0, // All lines are shown, nothing remaining
        };
    }
    // Otherwise show the standard MAX_LINES_TO_SHOW
    return {
        aboveTheFold: wrappedLines.slice(0, MAX_LINES_TO_SHOW).join('\n').trimEnd(),
        remainingLines: Math.max(0, remainingLines),
    };
}
/**
 * Renders the content with line-based truncation for terminal display.
 * If the content exceeds the maximum number of lines, it truncates the content
 * and adds a message indicating the number of additional lines.
 * @param content The content to render.
 * @param terminalWidth Terminal width for wrapping lines.
 * @returns The rendered content with truncation if needed.
 */
function renderTruncatedContent(content, terminalWidth, suppressExpandHint) {
    if (suppressExpandHint === void 0) { suppressExpandHint = false; }
    var trimmedContent = content.trimEnd();
    if (!trimmedContent) {
        return '';
    }
    var wrapWidth = Math.max(terminalWidth - PADDING_TO_PREVENT_OVERFLOW, 10);
    // Only process enough content for the visible lines. Avoids O(n) wrapping
    // on huge outputs (e.g. 64MB binary dumps that cause 382K-row screens).
    var maxChars = MAX_LINES_TO_SHOW * wrapWidth * 4;
    var preTruncated = trimmedContent.length > maxChars;
    var contentForWrapping = preTruncated
        ? trimmedContent.slice(0, maxChars)
        : trimmedContent;
    var _a = wrapText(contentForWrapping, wrapWidth), aboveTheFold = _a.aboveTheFold, remainingLines = _a.remainingLines;
    var estimatedRemaining = preTruncated
        ? Math.max(remainingLines, Math.ceil(trimmedContent.length / wrapWidth) - MAX_LINES_TO_SHOW)
        : remainingLines;
    return [
        aboveTheFold,
        estimatedRemaining > 0
            ? chalk_1.default.dim("\u2026 +".concat(estimatedRemaining, " lines").concat(suppressExpandHint ? '' : " ".concat((0, CtrlOToExpand_js_1.ctrlOToExpand)())))
            : '',
    ]
        .filter(Boolean)
        .join('\n');
}
/** Fast check: would OutputLine truncate this content? Counts raw newlines
 *  only (ignores terminal-width wrapping), so it may return false for a single
 *  very long line that wraps past 3 visual rows — acceptable, since the common
 *  case is multi-line output. */
function isOutputLineTruncated(content) {
    var pos = 0;
    // Need more than MAX_LINES_TO_SHOW newlines (content fills > 3 lines).
    // The +1 accounts for wrapText showing an extra line when remainingLines==1.
    for (var i = 0; i <= MAX_LINES_TO_SHOW; i++) {
        pos = content.indexOf('\n', pos);
        if (pos === -1)
            return false;
        pos++;
    }
    // A trailing newline is a terminator, not a new line — match
    // renderTruncatedContent's trimEnd() behavior.
    return pos < content.length;
}
