"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeasuredText = exports.Cursor = exports.isVimPunctuation = exports.isVimWhitespace = exports.isVimWordChar = exports.WHITESPACE_REGEX = exports.VIM_WORD_CHAR_REGEX = void 0;
exports.pushToKillRing = pushToKillRing;
exports.getLastKill = getLastKill;
exports.getKillRingItem = getKillRingItem;
exports.getKillRingSize = getKillRingSize;
exports.clearKillRing = clearKillRing;
exports.resetKillAccumulation = resetKillAccumulation;
exports.recordYank = recordYank;
exports.canYankPop = canYankPop;
exports.yankPop = yankPop;
exports.updateYankLength = updateYankLength;
exports.resetYankState = resetYankState;
var stringWidth_js_1 = require("../ink/stringWidth.js");
var wrapAnsi_js_1 = require("../ink/wrapAnsi.js");
var intl_js_1 = require("./intl.js");
/**
 * Kill ring for storing killed (cut) text that can be yanked (pasted) with Ctrl+Y.
 * This is global state that shares one kill ring across all input fields.
 *
 * Consecutive kills accumulate in the kill ring until the user types some
 * other key. Alt+Y cycles through previous kills after a yank.
 */
var KILL_RING_MAX_SIZE = 10;
var killRing = [];
var killRingIndex = 0;
var lastActionWasKill = false;
// Track yank state for yank-pop (alt-y)
var lastYankStart = 0;
var lastYankLength = 0;
var lastActionWasYank = false;
function pushToKillRing(text, direction) {
    if (direction === void 0) { direction = 'append'; }
    if (text.length > 0) {
        if (lastActionWasKill && killRing.length > 0) {
            // Accumulate with the most recent kill
            if (direction === 'prepend') {
                killRing[0] = text + killRing[0];
            }
            else {
                killRing[0] = killRing[0] + text;
            }
        }
        else {
            // Add new entry to front of ring
            killRing.unshift(text);
            if (killRing.length > KILL_RING_MAX_SIZE) {
                killRing.pop();
            }
        }
        lastActionWasKill = true;
        // Reset yank state when killing new text
        lastActionWasYank = false;
    }
}
function getLastKill() {
    var _a;
    return (_a = killRing[0]) !== null && _a !== void 0 ? _a : '';
}
function getKillRingItem(index) {
    var _a;
    if (killRing.length === 0)
        return '';
    var normalizedIndex = ((index % killRing.length) + killRing.length) % killRing.length;
    return (_a = killRing[normalizedIndex]) !== null && _a !== void 0 ? _a : '';
}
function getKillRingSize() {
    return killRing.length;
}
function clearKillRing() {
    killRing = [];
    killRingIndex = 0;
    lastActionWasKill = false;
    lastActionWasYank = false;
    lastYankStart = 0;
    lastYankLength = 0;
}
function resetKillAccumulation() {
    lastActionWasKill = false;
}
// Yank tracking for yank-pop
function recordYank(start, length) {
    lastYankStart = start;
    lastYankLength = length;
    lastActionWasYank = true;
    killRingIndex = 0;
}
function canYankPop() {
    return lastActionWasYank && killRing.length > 1;
}
function yankPop() {
    var _a;
    if (!lastActionWasYank || killRing.length <= 1) {
        return null;
    }
    // Cycle to next item in kill ring
    killRingIndex = (killRingIndex + 1) % killRing.length;
    var text = (_a = killRing[killRingIndex]) !== null && _a !== void 0 ? _a : '';
    return { text: text, start: lastYankStart, length: lastYankLength };
}
function updateYankLength(length) {
    lastYankLength = length;
}
function resetYankState() {
    lastActionWasYank = false;
}
/**
 * Text Processing Flow for Unicode Normalization:
 *
 * User Input (raw text, potentially mixed NFD/NFC)
 *     ↓
 * MeasuredText (normalizes to NFC + builds grapheme info)
 *     ↓
 * All cursor operations use normalized text/offsets
 *     ↓
 * Display uses normalized text from wrappedLines
 *
 * This flow ensures consistent Unicode handling:
 * - NFD/NFC normalization differences don't break cursor movement
 * - Grapheme clusters (like 👨‍👩‍👧‍👦) are treated as single units
 * - Display width calculations are accurate for CJK characters
 *
 * RULE: Once text enters MeasuredText, all operations
 * work on the normalized version.
 */
// Pre-compiled regex patterns for Vim word detection (avoid creating in hot loops)
exports.VIM_WORD_CHAR_REGEX = /^[\p{L}\p{N}\p{M}_]$/u;
exports.WHITESPACE_REGEX = /\s/;
// Exported helper functions for Vim character classification
var isVimWordChar = function (ch) {
    return exports.VIM_WORD_CHAR_REGEX.test(ch);
};
exports.isVimWordChar = isVimWordChar;
var isVimWhitespace = function (ch) {
    return exports.WHITESPACE_REGEX.test(ch);
};
exports.isVimWhitespace = isVimWhitespace;
var isVimPunctuation = function (ch) {
    return ch.length > 0 && !(0, exports.isVimWhitespace)(ch) && !(0, exports.isVimWordChar)(ch);
};
exports.isVimPunctuation = isVimPunctuation;
var Cursor = /** @class */ (function () {
    function Cursor(measuredText, offset, selection) {
        if (offset === void 0) { offset = 0; }
        if (selection === void 0) { selection = 0; }
        this.measuredText = measuredText;
        this.selection = selection;
        // it's ok for the cursor to be 1 char beyond the end of the string
        this.offset = Math.max(0, Math.min(this.text.length, offset));
    }
    Cursor.fromText = function (text, columns, offset, selection) {
        if (offset === void 0) { offset = 0; }
        if (selection === void 0) { selection = 0; }
        // make MeasuredText on less than columns width, to account for cursor
        return new Cursor(new MeasuredText(text, columns - 1), offset, selection);
    };
    Cursor.prototype.getViewportStartLine = function (maxVisibleLines) {
        if (maxVisibleLines === undefined || maxVisibleLines <= 0)
            return 0;
        var line = this.getPosition().line;
        var allLines = this.measuredText.getWrappedText();
        if (allLines.length <= maxVisibleLines)
            return 0;
        var half = Math.floor(maxVisibleLines / 2);
        var startLine = Math.max(0, line - half);
        var endLine = Math.min(allLines.length, startLine + maxVisibleLines);
        if (endLine - startLine < maxVisibleLines) {
            startLine = Math.max(0, endLine - maxVisibleLines);
        }
        return startLine;
    };
    Cursor.prototype.getViewportCharOffset = function (maxVisibleLines) {
        var _a, _b;
        var startLine = this.getViewportStartLine(maxVisibleLines);
        if (startLine === 0)
            return 0;
        var wrappedLines = this.measuredText.getWrappedLines();
        return (_b = (_a = wrappedLines[startLine]) === null || _a === void 0 ? void 0 : _a.startOffset) !== null && _b !== void 0 ? _b : 0;
    };
    Cursor.prototype.getViewportCharEnd = function (maxVisibleLines) {
        var _a, _b;
        var startLine = this.getViewportStartLine(maxVisibleLines);
        var allLines = this.measuredText.getWrappedLines();
        if (maxVisibleLines === undefined || maxVisibleLines <= 0)
            return this.text.length;
        var endLine = Math.min(allLines.length, startLine + maxVisibleLines);
        if (endLine >= allLines.length)
            return this.text.length;
        return (_b = (_a = allLines[endLine]) === null || _a === void 0 ? void 0 : _a.startOffset) !== null && _b !== void 0 ? _b : this.text.length;
    };
    Cursor.prototype.render = function (cursorChar, mask, invert, ghostText, maxVisibleLines) {
        var _this = this;
        var _a = this.getPosition(), line = _a.line, column = _a.column;
        var allLines = this.measuredText.getWrappedText();
        var startLine = this.getViewportStartLine(maxVisibleLines);
        var endLine = maxVisibleLines !== undefined && maxVisibleLines > 0
            ? Math.min(allLines.length, startLine + maxVisibleLines)
            : allLines.length;
        return allLines
            .slice(startLine, endLine)
            .map(function (text, i) {
            var currentLine = i + startLine;
            var displayText = text;
            if (mask) {
                var graphemes = Array.from((0, intl_js_1.getGraphemeSegmenter)().segment(text));
                if (currentLine === allLines.length - 1) {
                    // Last line: mask all but the trailing 6 chars so the user can
                    // confirm they pasted the right thing without exposing the full token
                    var visibleCount = Math.min(6, graphemes.length);
                    var maskCount = graphemes.length - visibleCount;
                    var splitOffset = graphemes.length > visibleCount ? graphemes[maskCount].index : 0;
                    displayText = mask.repeat(maskCount) + text.slice(splitOffset);
                }
                else {
                    // Earlier wrapped lines: fully mask. Previously only the last line
                    // was masked, leaking the start of the token on narrow terminals
                    // where the pasted OAuth code wraps across multiple lines.
                    displayText = mask.repeat(graphemes.length);
                }
            }
            // looking for the line with the cursor
            if (line !== currentLine)
                return displayText.trimEnd();
            // Split the line into before/at/after cursor in a single pass over the
            // graphemes, accumulating display width until we reach the cursor column.
            // This replaces a two-pass approach (displayWidthToStringIndex + a second
            // segmenter pass) — the intermediate stringIndex from that approach is
            // always a grapheme boundary, so the "cursor in the middle of a
            // multi-codepoint character" branch was unreachable.
            var beforeCursor = '';
            var atCursor = cursorChar;
            var afterCursor = '';
            var currentWidth = 0;
            var cursorFound = false;
            for (var _i = 0, _a = (0, intl_js_1.getGraphemeSegmenter)().segment(displayText); _i < _a.length; _i++) {
                var segment = _a[_i].segment;
                if (cursorFound) {
                    afterCursor += segment;
                    continue;
                }
                var nextWidth = currentWidth + (0, stringWidth_js_1.stringWidth)(segment);
                if (nextWidth > column) {
                    atCursor = segment;
                    cursorFound = true;
                }
                else {
                    currentWidth = nextWidth;
                    beforeCursor += segment;
                }
            }
            // Only invert the cursor if we have a cursor character to show
            // When ghost text is present and cursor is at end, show first ghost char in cursor
            var renderedCursor;
            var ghostSuffix = '';
            if (ghostText &&
                currentLine === allLines.length - 1 &&
                _this.isAtEnd() &&
                ghostText.text.length > 0) {
                // First ghost character goes in the inverted cursor (grapheme-safe)
                var firstGhostChar = (0, intl_js_1.firstGrapheme)(ghostText.text) || ghostText.text[0];
                renderedCursor = cursorChar ? invert(firstGhostChar) : firstGhostChar;
                // Rest of ghost text is dimmed after cursor
                var ghostRest = ghostText.text.slice(firstGhostChar.length);
                if (ghostRest.length > 0) {
                    ghostSuffix = ghostText.dim(ghostRest);
                }
            }
            else {
                renderedCursor = cursorChar ? invert(atCursor) : atCursor;
            }
            return (beforeCursor + renderedCursor + ghostSuffix + afterCursor.trimEnd());
        })
            .join('\n');
    };
    Cursor.prototype.left = function () {
        if (this.offset === 0)
            return this;
        var chip = this.imageRefEndingAt(this.offset);
        if (chip)
            return new Cursor(this.measuredText, chip.start);
        var prevOffset = this.measuredText.prevOffset(this.offset);
        return new Cursor(this.measuredText, prevOffset);
    };
    Cursor.prototype.right = function () {
        if (this.offset >= this.text.length)
            return this;
        var chip = this.imageRefStartingAt(this.offset);
        if (chip)
            return new Cursor(this.measuredText, chip.end);
        var nextOffset = this.measuredText.nextOffset(this.offset);
        return new Cursor(this.measuredText, Math.min(nextOffset, this.text.length));
    };
    /**
     * If an [Image #N] chip ends at `offset`, return its bounds. Used by left()
     * to hop the cursor over the chip instead of stepping into it.
     */
    Cursor.prototype.imageRefEndingAt = function (offset) {
        var m = this.text.slice(0, offset).match(/\[Image #\d+\]$/);
        return m ? { start: offset - m[0].length, end: offset } : null;
    };
    Cursor.prototype.imageRefStartingAt = function (offset) {
        var m = this.text.slice(offset).match(/^\[Image #\d+\]/);
        return m ? { start: offset, end: offset + m[0].length } : null;
    };
    /**
     * If offset lands strictly inside an [Image #N] chip, snap it to the given
     * boundary. Used by word-movement methods so Ctrl+W / Alt+D never leave a
     * partial chip.
     */
    Cursor.prototype.snapOutOfImageRef = function (offset, toward) {
        var re = /\[Image #\d+\]/g;
        var m;
        while ((m = re.exec(this.text)) !== null) {
            var start = m.index;
            var end = start + m[0].length;
            if (offset > start && offset < end) {
                return toward === 'start' ? start : end;
            }
        }
        return offset;
    };
    Cursor.prototype.up = function () {
        var _a = this.getPosition(), line = _a.line, column = _a.column;
        if (line === 0) {
            return this;
        }
        var prevLine = this.measuredText.getWrappedText()[line - 1];
        if (prevLine === undefined) {
            return this;
        }
        var prevLineDisplayWidth = (0, stringWidth_js_1.stringWidth)(prevLine);
        if (column > prevLineDisplayWidth) {
            var newOffset_1 = this.getOffset({
                line: line - 1,
                column: prevLineDisplayWidth,
            });
            return new Cursor(this.measuredText, newOffset_1, 0);
        }
        var newOffset = this.getOffset({ line: line - 1, column: column });
        return new Cursor(this.measuredText, newOffset, 0);
    };
    Cursor.prototype.down = function () {
        var _a = this.getPosition(), line = _a.line, column = _a.column;
        if (line >= this.measuredText.lineCount - 1) {
            return this;
        }
        // If there is no next line, stay on the current line,
        // and let the caller handle it (e.g. for prompt input,
        // we move to the next history entry)
        var nextLine = this.measuredText.getWrappedText()[line + 1];
        if (nextLine === undefined) {
            return this;
        }
        // If the current column is past the end of the next line,
        // move to the end of the next line
        var nextLineDisplayWidth = (0, stringWidth_js_1.stringWidth)(nextLine);
        if (column > nextLineDisplayWidth) {
            var newOffset_2 = this.getOffset({
                line: line + 1,
                column: nextLineDisplayWidth,
            });
            return new Cursor(this.measuredText, newOffset_2, 0);
        }
        // Otherwise, move to the same column on the next line
        var newOffset = this.getOffset({
            line: line + 1,
            column: column,
        });
        return new Cursor(this.measuredText, newOffset, 0);
    };
    /**
     * Move to the start of the current line (column 0).
     * This is the raw version used internally by startOfLine.
     */
    Cursor.prototype.startOfCurrentLine = function () {
        var line = this.getPosition().line;
        return new Cursor(this.measuredText, this.getOffset({
            line: line,
            column: 0,
        }), 0);
    };
    Cursor.prototype.startOfLine = function () {
        var _a = this.getPosition(), line = _a.line, column = _a.column;
        // If already at start of line and not at first line, move to previous line
        if (column === 0 && line > 0) {
            return new Cursor(this.measuredText, this.getOffset({
                line: line - 1,
                column: 0,
            }), 0);
        }
        return this.startOfCurrentLine();
    };
    Cursor.prototype.firstNonBlankInLine = function () {
        var line = this.getPosition().line;
        var lineText = this.measuredText.getWrappedText()[line] || '';
        var match = lineText.match(/^\s*\S/);
        var column = (match === null || match === void 0 ? void 0 : match.index) ? match.index + match[0].length - 1 : 0;
        var offset = this.getOffset({ line: line, column: column });
        return new Cursor(this.measuredText, offset, 0);
    };
    Cursor.prototype.endOfLine = function () {
        var line = this.getPosition().line;
        var column = this.measuredText.getLineLength(line);
        var offset = this.getOffset({ line: line, column: column });
        return new Cursor(this.measuredText, offset, 0);
    };
    // Helper methods for finding logical line boundaries
    Cursor.prototype.findLogicalLineStart = function (fromOffset) {
        if (fromOffset === void 0) { fromOffset = this.offset; }
        var prevNewline = this.text.lastIndexOf('\n', fromOffset - 1);
        return prevNewline === -1 ? 0 : prevNewline + 1;
    };
    Cursor.prototype.findLogicalLineEnd = function (fromOffset) {
        if (fromOffset === void 0) { fromOffset = this.offset; }
        var nextNewline = this.text.indexOf('\n', fromOffset);
        return nextNewline === -1 ? this.text.length : nextNewline;
    };
    // Helper to get logical line bounds for current position
    Cursor.prototype.getLogicalLineBounds = function () {
        return {
            start: this.findLogicalLineStart(),
            end: this.findLogicalLineEnd(),
        };
    };
    // Helper to create cursor with preserved column, clamped to line length
    // Snaps to grapheme boundary to avoid landing mid-grapheme
    Cursor.prototype.createCursorWithColumn = function (lineStart, lineEnd, targetColumn) {
        var lineLength = lineEnd - lineStart;
        var clampedColumn = Math.min(targetColumn, lineLength);
        var rawOffset = lineStart + clampedColumn;
        var offset = this.measuredText.snapToGraphemeBoundary(rawOffset);
        return new Cursor(this.measuredText, offset, 0);
    };
    Cursor.prototype.endOfLogicalLine = function () {
        return new Cursor(this.measuredText, this.findLogicalLineEnd(), 0);
    };
    Cursor.prototype.startOfLogicalLine = function () {
        return new Cursor(this.measuredText, this.findLogicalLineStart(), 0);
    };
    Cursor.prototype.firstNonBlankInLogicalLine = function () {
        var _a;
        var _b = this.getLogicalLineBounds(), start = _b.start, end = _b.end;
        var lineText = this.text.slice(start, end);
        var match = lineText.match(/\S/);
        var offset = start + ((_a = match === null || match === void 0 ? void 0 : match.index) !== null && _a !== void 0 ? _a : 0);
        return new Cursor(this.measuredText, offset, 0);
    };
    Cursor.prototype.upLogicalLine = function () {
        var currentStart = this.getLogicalLineBounds().start;
        // At first line - stay at beginning
        if (currentStart === 0) {
            return new Cursor(this.measuredText, 0, 0);
        }
        // Calculate target column position
        var currentColumn = this.offset - currentStart;
        // Find previous line bounds
        var prevLineEnd = currentStart - 1;
        var prevLineStart = this.findLogicalLineStart(prevLineEnd);
        return this.createCursorWithColumn(prevLineStart, prevLineEnd, currentColumn);
    };
    Cursor.prototype.downLogicalLine = function () {
        var _a = this.getLogicalLineBounds(), currentStart = _a.start, currentEnd = _a.end;
        // At last line - stay at end
        if (currentEnd >= this.text.length) {
            return new Cursor(this.measuredText, this.text.length, 0);
        }
        // Calculate target column position
        var currentColumn = this.offset - currentStart;
        // Find next line bounds
        var nextLineStart = currentEnd + 1;
        var nextLineEnd = this.findLogicalLineEnd(nextLineStart);
        return this.createCursorWithColumn(nextLineStart, nextLineEnd, currentColumn);
    };
    // Vim word vs WORD movements:
    // - word (lowercase w/b/e): sequences of letters, digits, and underscores
    // - WORD (uppercase W/B/E): sequences of non-whitespace characters
    // For example, in "hello-world!", word movements see 3 words: "hello", "world", and nothing
    // But WORD movements see 1 WORD: "hello-world!"
    Cursor.prototype.nextWord = function () {
        if (this.isAtEnd()) {
            return this;
        }
        // Use Intl.Segmenter for proper word boundary detection (including CJK)
        var wordBoundaries = this.measuredText.getWordBoundaries();
        // Find the next word start boundary after current position
        for (var _i = 0, wordBoundaries_1 = wordBoundaries; _i < wordBoundaries_1.length; _i++) {
            var boundary = wordBoundaries_1[_i];
            if (boundary.isWordLike && boundary.start > this.offset) {
                return new Cursor(this.measuredText, boundary.start);
            }
        }
        // If no next word found, go to end
        return new Cursor(this.measuredText, this.text.length);
    };
    Cursor.prototype.endOfWord = function () {
        if (this.isAtEnd()) {
            return this;
        }
        // Use Intl.Segmenter for proper word boundary detection (including CJK)
        var wordBoundaries = this.measuredText.getWordBoundaries();
        // Find the current word boundary we're in
        for (var _i = 0, wordBoundaries_2 = wordBoundaries; _i < wordBoundaries_2.length; _i++) {
            var boundary = wordBoundaries_2[_i];
            if (!boundary.isWordLike)
                continue;
            // If we're inside this word but NOT at the last character
            if (this.offset >= boundary.start && this.offset < boundary.end - 1) {
                // Move to end of this word (last character position)
                return new Cursor(this.measuredText, boundary.end - 1);
            }
            // If we're at the last character of a word (end - 1), find the next word's end
            if (this.offset === boundary.end - 1) {
                // Find next word
                for (var _a = 0, wordBoundaries_3 = wordBoundaries; _a < wordBoundaries_3.length; _a++) {
                    var nextBoundary = wordBoundaries_3[_a];
                    if (nextBoundary.isWordLike && nextBoundary.start > this.offset) {
                        return new Cursor(this.measuredText, nextBoundary.end - 1);
                    }
                }
                return this;
            }
        }
        // If not in a word, find the next word and go to its end
        for (var _b = 0, wordBoundaries_4 = wordBoundaries; _b < wordBoundaries_4.length; _b++) {
            var boundary = wordBoundaries_4[_b];
            if (boundary.isWordLike && boundary.start > this.offset) {
                return new Cursor(this.measuredText, boundary.end - 1);
            }
        }
        return this;
    };
    Cursor.prototype.prevWord = function () {
        if (this.isAtStart()) {
            return this;
        }
        // Use Intl.Segmenter for proper word boundary detection (including CJK)
        var wordBoundaries = this.measuredText.getWordBoundaries();
        // Find the previous word start boundary before current position
        // We need to iterate in reverse to find the previous word
        var prevWordStart = null;
        for (var _i = 0, wordBoundaries_5 = wordBoundaries; _i < wordBoundaries_5.length; _i++) {
            var boundary = wordBoundaries_5[_i];
            if (!boundary.isWordLike)
                continue;
            // If we're at or after the start of this word, but this word starts before us
            if (boundary.start < this.offset) {
                // If we're inside this word (not at the start), go to its start
                if (this.offset > boundary.start && this.offset <= boundary.end) {
                    return new Cursor(this.measuredText, boundary.start);
                }
                // Otherwise, remember this as a candidate for previous word
                prevWordStart = boundary.start;
            }
        }
        if (prevWordStart !== null) {
            return new Cursor(this.measuredText, prevWordStart);
        }
        return new Cursor(this.measuredText, 0);
    };
    // Vim-specific word methods
    // In Vim, a "word" is either:
    // 1. A sequence of word characters (letters, digits, underscore) - including Unicode
    // 2. A sequence of non-blank, non-word characters (punctuation/symbols)
    Cursor.prototype.nextVimWord = function () {
        var _this = this;
        if (this.isAtEnd()) {
            return this;
        }
        var pos = this.offset;
        var advance = function (p) { return _this.measuredText.nextOffset(p); };
        var currentGrapheme = this.graphemeAt(pos);
        if (!currentGrapheme) {
            return this;
        }
        if ((0, exports.isVimWordChar)(currentGrapheme)) {
            while (pos < this.text.length && (0, exports.isVimWordChar)(this.graphemeAt(pos))) {
                pos = advance(pos);
            }
        }
        else if ((0, exports.isVimPunctuation)(currentGrapheme)) {
            while (pos < this.text.length && (0, exports.isVimPunctuation)(this.graphemeAt(pos))) {
                pos = advance(pos);
            }
        }
        while (pos < this.text.length &&
            exports.WHITESPACE_REGEX.test(this.graphemeAt(pos))) {
            pos = advance(pos);
        }
        return new Cursor(this.measuredText, pos);
    };
    Cursor.prototype.endOfVimWord = function () {
        var _this = this;
        if (this.isAtEnd()) {
            return this;
        }
        var text = this.text;
        var pos = this.offset;
        var advance = function (p) { return _this.measuredText.nextOffset(p); };
        if (this.graphemeAt(pos) === '') {
            return this;
        }
        pos = advance(pos);
        while (pos < text.length && exports.WHITESPACE_REGEX.test(this.graphemeAt(pos))) {
            pos = advance(pos);
        }
        if (pos >= text.length) {
            return new Cursor(this.measuredText, text.length);
        }
        var charAtPos = this.graphemeAt(pos);
        if ((0, exports.isVimWordChar)(charAtPos)) {
            while (pos < text.length) {
                var nextPos = advance(pos);
                if (nextPos >= text.length || !(0, exports.isVimWordChar)(this.graphemeAt(nextPos)))
                    break;
                pos = nextPos;
            }
        }
        else if ((0, exports.isVimPunctuation)(charAtPos)) {
            while (pos < text.length) {
                var nextPos = advance(pos);
                if (nextPos >= text.length ||
                    !(0, exports.isVimPunctuation)(this.graphemeAt(nextPos)))
                    break;
                pos = nextPos;
            }
        }
        return new Cursor(this.measuredText, pos);
    };
    Cursor.prototype.prevVimWord = function () {
        var _this = this;
        if (this.isAtStart()) {
            return this;
        }
        var pos = this.offset;
        var retreat = function (p) { return _this.measuredText.prevOffset(p); };
        pos = retreat(pos);
        while (pos > 0 && exports.WHITESPACE_REGEX.test(this.graphemeAt(pos))) {
            pos = retreat(pos);
        }
        // At position 0 with whitespace means no previous word exists, go to start
        if (pos === 0 && exports.WHITESPACE_REGEX.test(this.graphemeAt(0))) {
            return new Cursor(this.measuredText, 0);
        }
        var charAtPos = this.graphemeAt(pos);
        if ((0, exports.isVimWordChar)(charAtPos)) {
            while (pos > 0) {
                var prevPos = retreat(pos);
                if (!(0, exports.isVimWordChar)(this.graphemeAt(prevPos)))
                    break;
                pos = prevPos;
            }
        }
        else if ((0, exports.isVimPunctuation)(charAtPos)) {
            while (pos > 0) {
                var prevPos = retreat(pos);
                if (!(0, exports.isVimPunctuation)(this.graphemeAt(prevPos)))
                    break;
                pos = prevPos;
            }
        }
        return new Cursor(this.measuredText, pos);
    };
    Cursor.prototype.nextWORD = function () {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        var nextCursor = this;
        // If we're on a non-whitespace character, move to the next whitespace
        while (!nextCursor.isOverWhitespace() && !nextCursor.isAtEnd()) {
            nextCursor = nextCursor.right();
        }
        // now move to the next non-whitespace character
        while (nextCursor.isOverWhitespace() && !nextCursor.isAtEnd()) {
            nextCursor = nextCursor.right();
        }
        return nextCursor;
    };
    Cursor.prototype.endOfWORD = function () {
        if (this.isAtEnd()) {
            return this;
        }
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        var cursor = this;
        // Check if we're already at the end of a WORD
        // (current character is non-whitespace, but next character is whitespace or we're at the end)
        var atEndOfWORD = !cursor.isOverWhitespace() &&
            (cursor.right().isOverWhitespace() || cursor.right().isAtEnd());
        if (atEndOfWORD) {
            // We're already at the end of a WORD, move to the next WORD
            cursor = cursor.right();
            return cursor.endOfWORD();
        }
        // If we're on a whitespace character, find the next WORD
        if (cursor.isOverWhitespace()) {
            cursor = cursor.nextWORD();
        }
        // Now move to the end of the current WORD
        while (!cursor.right().isOverWhitespace() && !cursor.isAtEnd()) {
            cursor = cursor.right();
        }
        return cursor;
    };
    Cursor.prototype.prevWORD = function () {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        var cursor = this;
        // if we are already at the beginning of a WORD, step off it
        if (cursor.left().isOverWhitespace()) {
            cursor = cursor.left();
        }
        // Move left over any whitespace characters
        while (cursor.isOverWhitespace() && !cursor.isAtStart()) {
            cursor = cursor.left();
        }
        // If we're over a non-whitespace character, move to the start of this WORD
        if (!cursor.isOverWhitespace()) {
            while (!cursor.left().isOverWhitespace() && !cursor.isAtStart()) {
                cursor = cursor.left();
            }
        }
        return cursor;
    };
    Cursor.prototype.modifyText = function (end, insertString) {
        if (insertString === void 0) { insertString = ''; }
        var startOffset = this.offset;
        var endOffset = end.offset;
        var newText = this.text.slice(0, startOffset) +
            insertString +
            this.text.slice(endOffset);
        return Cursor.fromText(newText, this.columns, startOffset + insertString.normalize('NFC').length);
    };
    Cursor.prototype.insert = function (insertString) {
        var newCursor = this.modifyText(this, insertString);
        return newCursor;
    };
    Cursor.prototype.del = function () {
        if (this.isAtEnd()) {
            return this;
        }
        return this.modifyText(this.right());
    };
    Cursor.prototype.backspace = function () {
        if (this.isAtStart()) {
            return this;
        }
        return this.left().modifyText(this);
    };
    Cursor.prototype.deleteToLineStart = function () {
        // If cursor is right after a newline (at start of line), delete just that
        // newline — symmetric with deleteToLineEnd's newline handling. This lets
        // repeated ctrl+u clear across lines.
        if (this.offset > 0 && this.text[this.offset - 1] === '\n') {
            return { cursor: this.left().modifyText(this), killed: '\n' };
        }
        // Use startOfLine() so that at column 0 of a wrapped visual line,
        // the cursor moves to the previous visual line's start instead of
        // getting stuck.
        var startCursor = this.startOfLine();
        var killed = this.text.slice(startCursor.offset, this.offset);
        return { cursor: startCursor.modifyText(this), killed: killed };
    };
    Cursor.prototype.deleteToLineEnd = function () {
        // If cursor is on a newline character, delete just that character
        if (this.text[this.offset] === '\n') {
            return { cursor: this.modifyText(this.right()), killed: '\n' };
        }
        var endCursor = this.endOfLine();
        var killed = this.text.slice(this.offset, endCursor.offset);
        return { cursor: this.modifyText(endCursor), killed: killed };
    };
    Cursor.prototype.deleteToLogicalLineEnd = function () {
        // If cursor is on a newline character, delete just that character
        if (this.text[this.offset] === '\n') {
            return this.modifyText(this.right());
        }
        return this.modifyText(this.endOfLogicalLine());
    };
    Cursor.prototype.deleteWordBefore = function () {
        if (this.isAtStart()) {
            return { cursor: this, killed: '' };
        }
        var target = this.snapOutOfImageRef(this.prevWord().offset, 'start');
        var prevWordCursor = new Cursor(this.measuredText, target);
        var killed = this.text.slice(prevWordCursor.offset, this.offset);
        return { cursor: prevWordCursor.modifyText(this), killed: killed };
    };
    /**
     * Deletes a token before the cursor if one exists.
     * Supports pasted text refs: [Pasted text #1], [Pasted text #1 +10 lines],
     * [...Truncated text #1 +10 lines...]
     *
     * Note: @mentions are NOT tokenized since users may want to correct typos
     * in file paths. Use Ctrl/Cmd+backspace for word-deletion on mentions.
     *
     * Returns null if no token found at cursor position.
     * Only triggers when cursor is at end of token (followed by whitespace or EOL).
     */
    Cursor.prototype.deleteTokenBefore = function () {
        // Cursor at chip.start is the "selected" state — backspace deletes the
        // chip forward, not the char before it.
        var chipAfter = this.imageRefStartingAt(this.offset);
        if (chipAfter) {
            var end = this.text[chipAfter.end] === ' ' ? chipAfter.end + 1 : chipAfter.end;
            return this.modifyText(new Cursor(this.measuredText, end));
        }
        if (this.isAtStart()) {
            return null;
        }
        // Only trigger if cursor is at a word boundary (whitespace or end of string after cursor)
        var charAfter = this.text[this.offset];
        if (charAfter !== undefined && !/\s/.test(charAfter)) {
            return null;
        }
        var textBefore = this.text.slice(0, this.offset);
        // Check for pasted/truncated text refs: [Pasted text #1] or [...Truncated text #1 +50 lines...]
        var pasteMatch = textBefore.match(/(^|\s)\[(Pasted text #\d+(?: \+\d+ lines)?|Image #\d+|\.\.\.Truncated text #\d+ \+\d+ lines\.\.\.)\]$/);
        if (pasteMatch) {
            var matchStart = pasteMatch.index + pasteMatch[1].length;
            return new Cursor(this.measuredText, matchStart).modifyText(this);
        }
        return null;
    };
    Cursor.prototype.deleteWordAfter = function () {
        if (this.isAtEnd()) {
            return this;
        }
        var target = this.snapOutOfImageRef(this.nextWord().offset, 'end');
        return this.modifyText(new Cursor(this.measuredText, target));
    };
    Cursor.prototype.graphemeAt = function (pos) {
        if (pos >= this.text.length)
            return '';
        var nextOff = this.measuredText.nextOffset(pos);
        return this.text.slice(pos, nextOff);
    };
    Cursor.prototype.isOverWhitespace = function () {
        var _a;
        var currentChar = (_a = this.text[this.offset]) !== null && _a !== void 0 ? _a : '';
        return /\s/.test(currentChar);
    };
    Cursor.prototype.equals = function (other) {
        return (this.offset === other.offset && this.measuredText === other.measuredText);
    };
    Cursor.prototype.isAtStart = function () {
        return this.offset === 0;
    };
    Cursor.prototype.isAtEnd = function () {
        return this.offset >= this.text.length;
    };
    Cursor.prototype.startOfFirstLine = function () {
        // Go to the very beginning of the text (first character of first line)
        return new Cursor(this.measuredText, 0, 0);
    };
    Cursor.prototype.startOfLastLine = function () {
        // Go to the beginning of the last line
        var lastNewlineIndex = this.text.lastIndexOf('\n');
        if (lastNewlineIndex === -1) {
            // If there are no newlines, the text is a single line
            return this.startOfLine();
        }
        // Position after the last newline character
        return new Cursor(this.measuredText, lastNewlineIndex + 1, 0);
    };
    Cursor.prototype.goToLine = function (lineNumber) {
        var _a, _b;
        // Go to the beginning of the specified logical line (1-indexed, like vim)
        // Uses logical lines (separated by \n), not wrapped display lines
        var lines = this.text.split('\n');
        var targetLine = Math.min(Math.max(0, lineNumber - 1), lines.length - 1);
        var offset = 0;
        for (var i = 0; i < targetLine; i++) {
            offset += ((_b = (_a = lines[i]) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) + 1; // +1 for newline
        }
        return new Cursor(this.measuredText, offset, 0);
    };
    Cursor.prototype.endOfFile = function () {
        return new Cursor(this.measuredText, this.text.length, 0);
    };
    Object.defineProperty(Cursor.prototype, "text", {
        get: function () {
            return this.measuredText.text;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cursor.prototype, "columns", {
        get: function () {
            return this.measuredText.columns + 1;
        },
        enumerable: false,
        configurable: true
    });
    Cursor.prototype.getPosition = function () {
        return this.measuredText.getPositionFromOffset(this.offset);
    };
    Cursor.prototype.getOffset = function (position) {
        return this.measuredText.getOffsetFromPosition(position);
    };
    /**
     * Find a character using vim f/F/t/T semantics.
     *
     * @param char - The character to find
     * @param type - 'f' (forward to), 'F' (backward to), 't' (forward till), 'T' (backward till)
     * @param count - Find the Nth occurrence
     * @returns The target offset, or null if not found
     */
    Cursor.prototype.findCharacter = function (char, type, count) {
        if (count === void 0) { count = 1; }
        var text = this.text;
        var forward = type === 'f' || type === 't';
        var till = type === 't' || type === 'T';
        var found = 0;
        if (forward) {
            var pos = this.measuredText.nextOffset(this.offset);
            while (pos < text.length) {
                var grapheme = this.graphemeAt(pos);
                if (grapheme === char) {
                    found++;
                    if (found === count) {
                        return till
                            ? Math.max(this.offset, this.measuredText.prevOffset(pos))
                            : pos;
                    }
                }
                pos = this.measuredText.nextOffset(pos);
            }
        }
        else {
            if (this.offset === 0)
                return null;
            var pos = this.measuredText.prevOffset(this.offset);
            while (pos >= 0) {
                var grapheme = this.graphemeAt(pos);
                if (grapheme === char) {
                    found++;
                    if (found === count) {
                        return till
                            ? Math.min(this.offset, this.measuredText.nextOffset(pos))
                            : pos;
                    }
                }
                if (pos === 0)
                    break;
                pos = this.measuredText.prevOffset(pos);
            }
        }
        return null;
    };
    return Cursor;
}());
exports.Cursor = Cursor;
var WrappedLine = /** @class */ (function () {
    function WrappedLine(text, startOffset, isPrecededByNewline, endsWithNewline) {
        if (endsWithNewline === void 0) { endsWithNewline = false; }
        this.text = text;
        this.startOffset = startOffset;
        this.isPrecededByNewline = isPrecededByNewline;
        this.endsWithNewline = endsWithNewline;
    }
    WrappedLine.prototype.equals = function (other) {
        return this.text === other.text && this.startOffset === other.startOffset;
    };
    Object.defineProperty(WrappedLine.prototype, "length", {
        get: function () {
            return this.text.length + (this.endsWithNewline ? 1 : 0);
        },
        enumerable: false,
        configurable: true
    });
    return WrappedLine;
}());
var MeasuredText = /** @class */ (function () {
    function MeasuredText(text, columns) {
        this.columns = columns;
        this.text = text.normalize('NFC');
        this.navigationCache = new Map();
    }
    Object.defineProperty(MeasuredText.prototype, "wrappedLines", {
        /**
         * Lazily computes and caches wrapped lines.
         * This expensive operation is deferred until actually needed.
         */
        get: function () {
            if (!this._wrappedLines) {
                this._wrappedLines = this.measureWrappedText();
            }
            return this._wrappedLines;
        },
        enumerable: false,
        configurable: true
    });
    MeasuredText.prototype.getGraphemeBoundaries = function () {
        if (!this.graphemeBoundaries) {
            this.graphemeBoundaries = [];
            for (var _i = 0, _a = (0, intl_js_1.getGraphemeSegmenter)().segment(this.text); _i < _a.length; _i++) {
                var index = _a[_i].index;
                this.graphemeBoundaries.push(index);
            }
            // Add the end of text as a boundary
            this.graphemeBoundaries.push(this.text.length);
        }
        return this.graphemeBoundaries;
    };
    /**
     * Get word boundaries using Intl.Segmenter for proper Unicode word segmentation.
     * This correctly handles CJK (Chinese, Japanese, Korean) text where each character
     * is typically its own word, as well as scripts that use spaces between words.
     */
    MeasuredText.prototype.getWordBoundaries = function () {
        var _a;
        if (!this.wordBoundariesCache) {
            this.wordBoundariesCache = [];
            for (var _i = 0, _b = (0, intl_js_1.getWordSegmenter)().segment(this.text); _i < _b.length; _i++) {
                var segment = _b[_i];
                this.wordBoundariesCache.push({
                    start: segment.index,
                    end: segment.index + segment.segment.length,
                    isWordLike: (_a = segment.isWordLike) !== null && _a !== void 0 ? _a : false,
                });
            }
        }
        return this.wordBoundariesCache;
    };
    /**
     * Binary search for boundaries.
     * @param boundaries: Sorted array of boundaries
     * @param target: Target offset
     * @param findNext: If true, finds first boundary > target. If false, finds last boundary < target.
     * @returns The found boundary index, or appropriate default
     */
    MeasuredText.prototype.binarySearchBoundary = function (boundaries, target, findNext) {
        var left = 0;
        var right = boundaries.length - 1;
        var result = findNext ? this.text.length : 0;
        while (left <= right) {
            var mid = Math.floor((left + right) / 2);
            var boundary = boundaries[mid];
            if (boundary === undefined)
                break;
            if (findNext) {
                if (boundary > target) {
                    result = boundary;
                    right = mid - 1;
                }
                else {
                    left = mid + 1;
                }
            }
            else {
                if (boundary < target) {
                    result = boundary;
                    left = mid + 1;
                }
                else {
                    right = mid - 1;
                }
            }
        }
        return result;
    };
    // Convert string index to display width
    MeasuredText.prototype.stringIndexToDisplayWidth = function (text, index) {
        if (index <= 0)
            return 0;
        if (index >= text.length)
            return (0, stringWidth_js_1.stringWidth)(text);
        return (0, stringWidth_js_1.stringWidth)(text.substring(0, index));
    };
    // Convert display width to string index
    MeasuredText.prototype.displayWidthToStringIndex = function (text, targetWidth) {
        if (targetWidth <= 0)
            return 0;
        if (!text)
            return 0;
        // If the text matches our text, use the precomputed graphemes
        if (text === this.text) {
            return this.offsetAtDisplayWidth(targetWidth);
        }
        // Otherwise compute on the fly
        var currentWidth = 0;
        var currentOffset = 0;
        for (var _i = 0, _a = (0, intl_js_1.getGraphemeSegmenter)().segment(text); _i < _a.length; _i++) {
            var _b = _a[_i], segment = _b.segment, index = _b.index;
            var segmentWidth = (0, stringWidth_js_1.stringWidth)(segment);
            if (currentWidth + segmentWidth > targetWidth) {
                break;
            }
            currentWidth += segmentWidth;
            currentOffset = index + segment.length;
        }
        return currentOffset;
    };
    /**
     * Find the string offset that corresponds to a target display width.
     */
    MeasuredText.prototype.offsetAtDisplayWidth = function (targetWidth) {
        if (targetWidth <= 0)
            return 0;
        var currentWidth = 0;
        var boundaries = this.getGraphemeBoundaries();
        // Iterate through grapheme boundaries
        for (var i = 0; i < boundaries.length - 1; i++) {
            var start = boundaries[i];
            var end = boundaries[i + 1];
            if (start === undefined || end === undefined)
                continue;
            var segment = this.text.substring(start, end);
            var segmentWidth = (0, stringWidth_js_1.stringWidth)(segment);
            if (currentWidth + segmentWidth > targetWidth) {
                return start;
            }
            currentWidth += segmentWidth;
        }
        return this.text.length;
    };
    MeasuredText.prototype.measureWrappedText = function () {
        var _this = this;
        var wrappedText = (0, wrapAnsi_js_1.wrapAnsi)(this.text, this.columns, {
            hard: true,
            trim: false,
        });
        var wrappedLines = [];
        var searchOffset = 0;
        var lastNewLinePos = -1;
        var lines = wrappedText.split('\n');
        var _loop_1 = function (i) {
            var text = lines[i];
            var isPrecededByNewline = function (startOffset) {
                return i === 0 || (startOffset > 0 && _this.text[startOffset - 1] === '\n');
            };
            if (text.length === 0) {
                // For blank lines, find the next newline character after the last one
                lastNewLinePos = this_1.text.indexOf('\n', lastNewLinePos + 1);
                if (lastNewLinePos !== -1) {
                    var startOffset = lastNewLinePos;
                    var endsWithNewline = true;
                    wrappedLines.push(new WrappedLine(text, startOffset, isPrecededByNewline(startOffset), endsWithNewline));
                }
                else {
                    // If we can't find another newline, this must be the end of text
                    var startOffset = this_1.text.length;
                    wrappedLines.push(new WrappedLine(text, startOffset, isPrecededByNewline(startOffset), false));
                }
            }
            else {
                // For non-blank lines, find the text in this.text
                var startOffset = this_1.text.indexOf(text, searchOffset);
                if (startOffset === -1) {
                    throw new Error('Failed to find wrapped line in text');
                }
                searchOffset = startOffset + text.length;
                // Check if this line ends with a newline in this.text
                var potentialNewlinePos = startOffset + text.length;
                var endsWithNewline = potentialNewlinePos < this_1.text.length &&
                    this_1.text[potentialNewlinePos] === '\n';
                if (endsWithNewline) {
                    lastNewLinePos = potentialNewlinePos;
                }
                wrappedLines.push(new WrappedLine(text, startOffset, isPrecededByNewline(startOffset), endsWithNewline));
            }
        };
        var this_1 = this;
        for (var i = 0; i < lines.length; i++) {
            _loop_1(i);
        }
        return wrappedLines;
    };
    MeasuredText.prototype.getWrappedText = function () {
        return this.wrappedLines.map(function (line) {
            return line.isPrecededByNewline ? line.text : line.text.trimStart();
        });
    };
    MeasuredText.prototype.getWrappedLines = function () {
        return this.wrappedLines;
    };
    MeasuredText.prototype.getLine = function (line) {
        var lines = this.wrappedLines;
        return lines[Math.max(0, Math.min(line, lines.length - 1))];
    };
    MeasuredText.prototype.getOffsetFromPosition = function (position) {
        var wrappedLine = this.getLine(position.line);
        // Handle blank lines specially
        if (wrappedLine.text.length === 0 && wrappedLine.endsWithNewline) {
            return wrappedLine.startOffset;
        }
        // Account for leading whitespace
        var leadingWhitespace = wrappedLine.isPrecededByNewline
            ? 0
            : wrappedLine.text.length - wrappedLine.text.trimStart().length;
        // Convert display column to string index
        var displayColumnWithLeading = position.column + leadingWhitespace;
        var stringIndex = this.displayWidthToStringIndex(wrappedLine.text, displayColumnWithLeading);
        // Calculate the actual offset
        var offset = wrappedLine.startOffset + stringIndex;
        // For normal lines
        var lineEnd = wrappedLine.startOffset + wrappedLine.text.length;
        // Don't allow going past the end of the current line into the next line
        // unless we're at the very end of the text
        var maxOffset = lineEnd;
        var lineDisplayWidth = (0, stringWidth_js_1.stringWidth)(wrappedLine.text);
        if (wrappedLine.endsWithNewline && position.column > lineDisplayWidth) {
            // Allow positioning after the newline
            maxOffset = lineEnd + 1;
        }
        return Math.min(offset, maxOffset);
    };
    MeasuredText.prototype.getLineLength = function (line) {
        var wrappedLine = this.getLine(line);
        return (0, stringWidth_js_1.stringWidth)(wrappedLine.text);
    };
    MeasuredText.prototype.getPositionFromOffset = function (offset) {
        var lines = this.wrappedLines;
        for (var line_1 = 0; line_1 < lines.length; line_1++) {
            var currentLine = lines[line_1];
            var nextLine = lines[line_1 + 1];
            if (offset >= currentLine.startOffset &&
                (!nextLine || offset < nextLine.startOffset)) {
                // Calculate string position within the line
                var stringPosInLine = offset - currentLine.startOffset;
                // Handle leading whitespace for wrapped lines
                var displayColumn = void 0;
                if (currentLine.isPrecededByNewline) {
                    // For lines preceded by newline, calculate display width directly
                    displayColumn = this.stringIndexToDisplayWidth(currentLine.text, stringPosInLine);
                }
                else {
                    // For wrapped lines, we need to account for trimmed whitespace
                    var leadingWhitespace = currentLine.text.length - currentLine.text.trimStart().length;
                    if (stringPosInLine < leadingWhitespace) {
                        // Cursor is in the trimmed whitespace area, position at start
                        displayColumn = 0;
                    }
                    else {
                        // Calculate display width from the trimmed text
                        var trimmedText = currentLine.text.trimStart();
                        var posInTrimmed = stringPosInLine - leadingWhitespace;
                        displayColumn = this.stringIndexToDisplayWidth(trimmedText, posInTrimmed);
                    }
                }
                return {
                    line: line_1,
                    column: Math.max(0, displayColumn),
                };
            }
        }
        // If we're past the last character, return the end of the last line
        var line = lines.length - 1;
        var lastLine = this.wrappedLines[line];
        return {
            line: line,
            column: (0, stringWidth_js_1.stringWidth)(lastLine.text),
        };
    };
    Object.defineProperty(MeasuredText.prototype, "lineCount", {
        get: function () {
            return this.wrappedLines.length;
        },
        enumerable: false,
        configurable: true
    });
    MeasuredText.prototype.withCache = function (key, compute) {
        var cached = this.navigationCache.get(key);
        if (cached !== undefined)
            return cached;
        var result = compute();
        this.navigationCache.set(key, result);
        return result;
    };
    MeasuredText.prototype.nextOffset = function (offset) {
        var _this = this;
        return this.withCache("next:".concat(offset), function () {
            var boundaries = _this.getGraphemeBoundaries();
            return _this.binarySearchBoundary(boundaries, offset, true);
        });
    };
    MeasuredText.prototype.prevOffset = function (offset) {
        var _this = this;
        if (offset <= 0)
            return 0;
        return this.withCache("prev:".concat(offset), function () {
            var boundaries = _this.getGraphemeBoundaries();
            return _this.binarySearchBoundary(boundaries, offset, false);
        });
    };
    /**
     * Snap an arbitrary code-unit offset to the start of the containing grapheme.
     * If offset is already on a boundary, returns it unchanged.
     */
    MeasuredText.prototype.snapToGraphemeBoundary = function (offset) {
        if (offset <= 0)
            return 0;
        if (offset >= this.text.length)
            return this.text.length;
        var boundaries = this.getGraphemeBoundaries();
        // Binary search for largest boundary <= offset
        var lo = 0;
        var hi = boundaries.length - 1;
        while (lo < hi) {
            var mid = (lo + hi + 1) >> 1;
            if (boundaries[mid] <= offset)
                lo = mid;
            else
                hi = mid - 1;
        }
        return boundaries[lo];
    };
    return MeasuredText;
}());
exports.MeasuredText = MeasuredText;
