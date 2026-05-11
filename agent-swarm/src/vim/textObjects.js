"use strict";
/**
 * Vim Text Object Finding
 *
 * Functions for finding text object boundaries (iw, aw, i", a(, etc.)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.findTextObject = findTextObject;
var Cursor_js_1 = require("../utils/Cursor.js");
var intl_js_1 = require("../utils/intl.js");
/**
 * Delimiter pairs for text objects.
 */
var PAIRS = {
    '(': ['(', ')'],
    ')': ['(', ')'],
    b: ['(', ')'],
    '[': ['[', ']'],
    ']': ['[', ']'],
    '{': ['{', '}'],
    '}': ['{', '}'],
    B: ['{', '}'],
    '<': ['<', '>'],
    '>': ['<', '>'],
    '"': ['"', '"'],
    "'": ["'", "'"],
    '`': ['`', '`'],
};
/**
 * Find a text object at the given position.
 */
function findTextObject(text, offset, objectType, isInner) {
    if (objectType === 'w')
        return findWordObject(text, offset, isInner, Cursor_js_1.isVimWordChar);
    if (objectType === 'W')
        return findWordObject(text, offset, isInner, function (ch) { return !(0, Cursor_js_1.isVimWhitespace)(ch); });
    var pair = PAIRS[objectType];
    if (pair) {
        var open_1 = pair[0], close_1 = pair[1];
        return open_1 === close_1
            ? findQuoteObject(text, offset, open_1, isInner)
            : findBracketObject(text, offset, open_1, close_1, isInner);
    }
    return null;
}
function findWordObject(text, offset, isInner, isWordChar) {
    // Pre-segment into graphemes for grapheme-safe iteration
    var graphemes = [];
    for (var _i = 0, _a = (0, intl_js_1.getGraphemeSegmenter)().segment(text); _i < _a.length; _i++) {
        var _b = _a[_i], segment = _b.segment, index = _b.index;
        graphemes.push({ segment: segment, index: index });
    }
    // Find which grapheme index the offset falls in
    var graphemeIdx = graphemes.length - 1;
    for (var i = 0; i < graphemes.length; i++) {
        var g = graphemes[i];
        var nextStart = i + 1 < graphemes.length ? graphemes[i + 1].index : text.length;
        if (offset >= g.index && offset < nextStart) {
            graphemeIdx = i;
            break;
        }
    }
    var graphemeAt = function (idx) { var _a, _b; return (_b = (_a = graphemes[idx]) === null || _a === void 0 ? void 0 : _a.segment) !== null && _b !== void 0 ? _b : ''; };
    var offsetAt = function (idx) {
        return idx < graphemes.length ? graphemes[idx].index : text.length;
    };
    var isWs = function (idx) { return (0, Cursor_js_1.isVimWhitespace)(graphemeAt(idx)); };
    var isWord = function (idx) { return isWordChar(graphemeAt(idx)); };
    var isPunct = function (idx) { return (0, Cursor_js_1.isVimPunctuation)(graphemeAt(idx)); };
    var startIdx = graphemeIdx;
    var endIdx = graphemeIdx;
    if (isWord(graphemeIdx)) {
        while (startIdx > 0 && isWord(startIdx - 1))
            startIdx--;
        while (endIdx < graphemes.length && isWord(endIdx))
            endIdx++;
    }
    else if (isWs(graphemeIdx)) {
        while (startIdx > 0 && isWs(startIdx - 1))
            startIdx--;
        while (endIdx < graphemes.length && isWs(endIdx))
            endIdx++;
        return { start: offsetAt(startIdx), end: offsetAt(endIdx) };
    }
    else if (isPunct(graphemeIdx)) {
        while (startIdx > 0 && isPunct(startIdx - 1))
            startIdx--;
        while (endIdx < graphemes.length && isPunct(endIdx))
            endIdx++;
    }
    if (!isInner) {
        // Include surrounding whitespace
        if (endIdx < graphemes.length && isWs(endIdx)) {
            while (endIdx < graphemes.length && isWs(endIdx))
                endIdx++;
        }
        else if (startIdx > 0 && isWs(startIdx - 1)) {
            while (startIdx > 0 && isWs(startIdx - 1))
                startIdx--;
        }
    }
    return { start: offsetAt(startIdx), end: offsetAt(endIdx) };
}
function findQuoteObject(text, offset, quote, isInner) {
    var lineStart = text.lastIndexOf('\n', offset - 1) + 1;
    var lineEnd = text.indexOf('\n', offset);
    var effectiveEnd = lineEnd === -1 ? text.length : lineEnd;
    var line = text.slice(lineStart, effectiveEnd);
    var posInLine = offset - lineStart;
    var positions = [];
    for (var i = 0; i < line.length; i++) {
        if (line[i] === quote)
            positions.push(i);
    }
    // Pair quotes correctly: 0-1, 2-3, 4-5, etc.
    for (var i = 0; i < positions.length - 1; i += 2) {
        var qs = positions[i];
        var qe = positions[i + 1];
        if (qs <= posInLine && posInLine <= qe) {
            return isInner
                ? { start: lineStart + qs + 1, end: lineStart + qe }
                : { start: lineStart + qs, end: lineStart + qe + 1 };
        }
    }
    return null;
}
function findBracketObject(text, offset, open, close, isInner) {
    var depth = 0;
    var start = -1;
    for (var i = offset; i >= 0; i--) {
        if (text[i] === close && i !== offset)
            depth++;
        else if (text[i] === open) {
            if (depth === 0) {
                start = i;
                break;
            }
            depth--;
        }
    }
    if (start === -1)
        return null;
    depth = 0;
    var end = -1;
    for (var i = start + 1; i < text.length; i++) {
        if (text[i] === open)
            depth++;
        else if (text[i] === close) {
            if (depth === 0) {
                end = i;
                break;
            }
            depth--;
        }
    }
    if (end === -1)
        return null;
    return isInner ? { start: start + 1, end: end } : { start: start, end: end + 1 };
}
