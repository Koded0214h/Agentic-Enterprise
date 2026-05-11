"use strict";
/**
 * Vim Operator Functions
 *
 * Pure functions for executing vim operators (delete, change, yank, etc.)
 */
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
exports.executeOperatorMotion = executeOperatorMotion;
exports.executeOperatorFind = executeOperatorFind;
exports.executeOperatorTextObj = executeOperatorTextObj;
exports.executeLineOp = executeLineOp;
exports.executeX = executeX;
exports.executeReplace = executeReplace;
exports.executeToggleCase = executeToggleCase;
exports.executeJoin = executeJoin;
exports.executePaste = executePaste;
exports.executeIndent = executeIndent;
exports.executeOpenLine = executeOpenLine;
exports.executeOperatorG = executeOperatorG;
exports.executeOperatorGg = executeOperatorGg;
var Cursor_js_1 = require("../utils/Cursor.js");
var intl_js_1 = require("../utils/intl.js");
var stringUtils_js_1 = require("../utils/stringUtils.js");
var motions_js_1 = require("./motions.js");
var textObjects_js_1 = require("./textObjects.js");
/**
 * Execute an operator with a simple motion.
 */
function executeOperatorMotion(op, motion, count, ctx) {
    var target = (0, motions_js_1.resolveMotion)(motion, ctx.cursor, count);
    if (target.equals(ctx.cursor))
        return;
    var range = getOperatorRange(ctx.cursor, target, motion, op, count);
    applyOperator(op, range.from, range.to, ctx, range.linewise);
    ctx.recordChange({ type: 'operator', op: op, motion: motion, count: count });
}
/**
 * Execute an operator with a find motion.
 */
function executeOperatorFind(op, findType, char, count, ctx) {
    var targetOffset = ctx.cursor.findCharacter(char, findType, count);
    if (targetOffset === null)
        return;
    var target = new Cursor_js_1.Cursor(ctx.cursor.measuredText, targetOffset);
    var range = getOperatorRangeForFind(ctx.cursor, target, findType);
    applyOperator(op, range.from, range.to, ctx);
    ctx.setLastFind(findType, char);
    ctx.recordChange({ type: 'operatorFind', op: op, find: findType, char: char, count: count });
}
/**
 * Execute an operator with a text object.
 */
function executeOperatorTextObj(op, scope, objType, count, ctx) {
    var range = (0, textObjects_js_1.findTextObject)(ctx.text, ctx.cursor.offset, objType, scope === 'inner');
    if (!range)
        return;
    applyOperator(op, range.start, range.end, ctx);
    ctx.recordChange({ type: 'operatorTextObj', op: op, objType: objType, scope: scope, count: count });
}
/**
 * Execute a line operation (dd, cc, yy).
 */
function executeLineOp(op, count, ctx) {
    var text = ctx.text;
    var lines = text.split('\n');
    // Calculate logical line by counting newlines before cursor offset
    // (cursor.getPosition() returns wrapped line which is wrong for this)
    var currentLine = (0, stringUtils_js_1.countCharInString)(text.slice(0, ctx.cursor.offset), '\n');
    var linesToAffect = Math.min(count, lines.length - currentLine);
    var lineStart = ctx.cursor.startOfLogicalLine().offset;
    var lineEnd = lineStart;
    for (var i = 0; i < linesToAffect; i++) {
        var nextNewline = text.indexOf('\n', lineEnd);
        lineEnd = nextNewline === -1 ? text.length : nextNewline + 1;
    }
    var content = text.slice(lineStart, lineEnd);
    // Ensure linewise content ends with newline for paste detection
    if (!content.endsWith('\n')) {
        content = content + '\n';
    }
    ctx.setRegister(content, true);
    if (op === 'yank') {
        ctx.setOffset(lineStart);
    }
    else if (op === 'delete') {
        var deleteStart = lineStart;
        var deleteEnd = lineEnd;
        // If deleting to end of file and there's a preceding newline, include it
        // This ensures deleting the last line doesn't leave a trailing newline
        if (deleteEnd === text.length &&
            deleteStart > 0 &&
            text[deleteStart - 1] === '\n') {
            deleteStart -= 1;
        }
        var newText = text.slice(0, deleteStart) + text.slice(deleteEnd);
        ctx.setText(newText || '');
        var maxOff = Math.max(0, newText.length - ((0, intl_js_1.lastGrapheme)(newText).length || 1));
        ctx.setOffset(Math.min(deleteStart, maxOff));
    }
    else if (op === 'change') {
        // For single line, just clear it
        if (lines.length === 1) {
            ctx.setText('');
            ctx.enterInsert(0);
        }
        else {
            // Delete all affected lines, replace with single empty line, enter insert
            var beforeLines = lines.slice(0, currentLine);
            var afterLines = lines.slice(currentLine + linesToAffect);
            var newText = __spreadArray(__spreadArray(__spreadArray([], beforeLines, true), [''], false), afterLines, true).join('\n');
            ctx.setText(newText);
            ctx.enterInsert(lineStart);
        }
    }
    ctx.recordChange({ type: 'operator', op: op, motion: op[0], count: count });
}
/**
 * Execute delete character (x command).
 */
function executeX(count, ctx) {
    var from = ctx.cursor.offset;
    if (from >= ctx.text.length)
        return;
    // Advance by graphemes, not code units
    var endCursor = ctx.cursor;
    for (var i = 0; i < count && !endCursor.isAtEnd(); i++) {
        endCursor = endCursor.right();
    }
    var to = endCursor.offset;
    var deleted = ctx.text.slice(from, to);
    var newText = ctx.text.slice(0, from) + ctx.text.slice(to);
    ctx.setRegister(deleted, false);
    ctx.setText(newText);
    var maxOff = Math.max(0, newText.length - ((0, intl_js_1.lastGrapheme)(newText).length || 1));
    ctx.setOffset(Math.min(from, maxOff));
    ctx.recordChange({ type: 'x', count: count });
}
/**
 * Execute replace character (r command).
 */
function executeReplace(char, count, ctx) {
    var offset = ctx.cursor.offset;
    var newText = ctx.text;
    for (var i = 0; i < count && offset < newText.length; i++) {
        var graphemeLen = (0, intl_js_1.firstGrapheme)(newText.slice(offset)).length || 1;
        newText =
            newText.slice(0, offset) + char + newText.slice(offset + graphemeLen);
        offset += char.length;
    }
    ctx.setText(newText);
    ctx.setOffset(Math.max(0, offset - char.length));
    ctx.recordChange({ type: 'replace', char: char, count: count });
}
/**
 * Execute toggle case (~ command).
 */
function executeToggleCase(count, ctx) {
    var startOffset = ctx.cursor.offset;
    if (startOffset >= ctx.text.length)
        return;
    var newText = ctx.text;
    var offset = startOffset;
    var toggled = 0;
    while (offset < newText.length && toggled < count) {
        var grapheme = (0, intl_js_1.firstGrapheme)(newText.slice(offset));
        var graphemeLen = grapheme.length;
        var toggledGrapheme = grapheme === grapheme.toUpperCase()
            ? grapheme.toLowerCase()
            : grapheme.toUpperCase();
        newText =
            newText.slice(0, offset) +
                toggledGrapheme +
                newText.slice(offset + graphemeLen);
        offset += toggledGrapheme.length;
        toggled++;
    }
    ctx.setText(newText);
    // Cursor moves to position after the last toggled character
    // At end of line, cursor can be at the "end" position
    ctx.setOffset(offset);
    ctx.recordChange({ type: 'toggleCase', count: count });
}
/**
 * Execute join lines (J command).
 */
function executeJoin(count, ctx) {
    var _a;
    var text = ctx.text;
    var lines = text.split('\n');
    var currentLine = ctx.cursor.getPosition().line;
    if (currentLine >= lines.length - 1)
        return;
    var linesToJoin = Math.min(count, lines.length - currentLine - 1);
    var joinedLine = lines[currentLine];
    var cursorPos = joinedLine.length;
    for (var i = 1; i <= linesToJoin; i++) {
        var nextLine = ((_a = lines[currentLine + i]) !== null && _a !== void 0 ? _a : '').trimStart();
        if (nextLine.length > 0) {
            if (!joinedLine.endsWith(' ') && joinedLine.length > 0) {
                joinedLine += ' ';
            }
            joinedLine += nextLine;
        }
    }
    var newLines = __spreadArray(__spreadArray(__spreadArray([], lines.slice(0, currentLine), true), [
        joinedLine
    ], false), lines.slice(currentLine + linesToJoin + 1), true);
    var newText = newLines.join('\n');
    ctx.setText(newText);
    ctx.setOffset(getLineStartOffset(newLines, currentLine) + cursorPos);
    ctx.recordChange({ type: 'join', count: count });
}
/**
 * Execute paste (p/P command).
 */
function executePaste(after, count, ctx) {
    var register = ctx.getRegister();
    if (!register)
        return;
    var isLinewise = register.endsWith('\n');
    var content = isLinewise ? register.slice(0, -1) : register;
    if (isLinewise) {
        var text = ctx.text;
        var lines = text.split('\n');
        var currentLine = ctx.cursor.getPosition().line;
        var insertLine = after ? currentLine + 1 : currentLine;
        var contentLines = content.split('\n');
        var repeatedLines = [];
        for (var i = 0; i < count; i++) {
            repeatedLines.push.apply(repeatedLines, contentLines);
        }
        var newLines = __spreadArray(__spreadArray(__spreadArray([], lines.slice(0, insertLine), true), repeatedLines, true), lines.slice(insertLine), true);
        var newText = newLines.join('\n');
        ctx.setText(newText);
        ctx.setOffset(getLineStartOffset(newLines, insertLine));
    }
    else {
        var textToInsert = content.repeat(count);
        var insertPoint = after && ctx.cursor.offset < ctx.text.length
            ? ctx.cursor.measuredText.nextOffset(ctx.cursor.offset)
            : ctx.cursor.offset;
        var newText = ctx.text.slice(0, insertPoint) +
            textToInsert +
            ctx.text.slice(insertPoint);
        var lastGr = (0, intl_js_1.lastGrapheme)(textToInsert);
        var newOffset = insertPoint + textToInsert.length - (lastGr.length || 1);
        ctx.setText(newText);
        ctx.setOffset(Math.max(insertPoint, newOffset));
    }
}
/**
 * Execute indent (>> command).
 */
function executeIndent(dir, count, ctx) {
    var _a, _b, _c, _d;
    var text = ctx.text;
    var lines = text.split('\n');
    var currentLine = ctx.cursor.getPosition().line;
    var linesToAffect = Math.min(count, lines.length - currentLine);
    var indent = '  '; // Two spaces
    for (var i = 0; i < linesToAffect; i++) {
        var lineIdx = currentLine + i;
        var line = (_a = lines[lineIdx]) !== null && _a !== void 0 ? _a : '';
        if (dir === '>') {
            lines[lineIdx] = indent + line;
        }
        else if (line.startsWith(indent)) {
            lines[lineIdx] = line.slice(indent.length);
        }
        else if (line.startsWith('\t')) {
            lines[lineIdx] = line.slice(1);
        }
        else {
            // Remove as much leading whitespace as possible up to indent length
            var removed = 0;
            var idx = 0;
            while (idx < line.length &&
                removed < indent.length &&
                /\s/.test(line[idx])) {
                removed++;
                idx++;
            }
            lines[lineIdx] = line.slice(idx);
        }
    }
    var newText = lines.join('\n');
    var currentLineText = (_b = lines[currentLine]) !== null && _b !== void 0 ? _b : '';
    var firstNonBlank = ((_d = (_c = currentLineText.match(/^\s*/)) === null || _c === void 0 ? void 0 : _c[0]) !== null && _d !== void 0 ? _d : '').length;
    ctx.setText(newText);
    ctx.setOffset(getLineStartOffset(lines, currentLine) + firstNonBlank);
    ctx.recordChange({ type: 'indent', dir: dir, count: count });
}
/**
 * Execute open line (o/O command).
 */
function executeOpenLine(direction, ctx) {
    var text = ctx.text;
    var lines = text.split('\n');
    var currentLine = ctx.cursor.getPosition().line;
    var insertLine = direction === 'below' ? currentLine + 1 : currentLine;
    var newLines = __spreadArray(__spreadArray(__spreadArray([], lines.slice(0, insertLine), true), [
        ''
    ], false), lines.slice(insertLine), true);
    var newText = newLines.join('\n');
    ctx.setText(newText);
    ctx.enterInsert(getLineStartOffset(newLines, insertLine));
    ctx.recordChange({ type: 'openLine', direction: direction });
}
// ============================================================================
// Internal Helpers
// ============================================================================
/**
 * Calculate the offset of a line's start position.
 */
function getLineStartOffset(lines, lineIndex) {
    return lines.slice(0, lineIndex).join('\n').length + (lineIndex > 0 ? 1 : 0);
}
function getOperatorRange(cursor, target, motion, op, count) {
    var from = Math.min(cursor.offset, target.offset);
    var to = Math.max(cursor.offset, target.offset);
    var linewise = false;
    // Special case: cw/cW changes to end of word, not start of next word
    if (op === 'change' && (motion === 'w' || motion === 'W')) {
        // For cw with count, move forward (count-1) words, then find end of that word
        var wordCursor = cursor;
        for (var i = 0; i < count - 1; i++) {
            wordCursor =
                motion === 'w' ? wordCursor.nextVimWord() : wordCursor.nextWORD();
        }
        var wordEnd = motion === 'w' ? wordCursor.endOfVimWord() : wordCursor.endOfWORD();
        to = cursor.measuredText.nextOffset(wordEnd.offset);
    }
    else if ((0, motions_js_1.isLinewiseMotion)(motion)) {
        // Linewise motions extend to include entire lines
        linewise = true;
        var text = cursor.text;
        var nextNewline = text.indexOf('\n', to);
        if (nextNewline === -1) {
            // Deleting to end of file - include the preceding newline if exists
            to = text.length;
            if (from > 0 && text[from - 1] === '\n') {
                from -= 1;
            }
        }
        else {
            to = nextNewline + 1;
        }
    }
    else if ((0, motions_js_1.isInclusiveMotion)(motion) && cursor.offset <= target.offset) {
        to = cursor.measuredText.nextOffset(to);
    }
    // Word motions can land inside an [Image #N] chip; extend the range to
    // cover the whole chip so dw/cw/yw never leave a partial placeholder.
    from = cursor.snapOutOfImageRef(from, 'start');
    to = cursor.snapOutOfImageRef(to, 'end');
    return { from: from, to: to, linewise: linewise };
}
/**
 * Get the range for a find-based operator.
 * Note: _findType is unused because Cursor.findCharacter already adjusts
 * the offset for t/T motions. All find types are treated as inclusive here.
 */
function getOperatorRangeForFind(cursor, target, _findType) {
    var from = Math.min(cursor.offset, target.offset);
    var maxOffset = Math.max(cursor.offset, target.offset);
    var to = cursor.measuredText.nextOffset(maxOffset);
    return { from: from, to: to };
}
function applyOperator(op, from, to, ctx, linewise) {
    if (linewise === void 0) { linewise = false; }
    var content = ctx.text.slice(from, to);
    // Ensure linewise content ends with newline for paste detection
    if (linewise && !content.endsWith('\n')) {
        content = content + '\n';
    }
    ctx.setRegister(content, linewise);
    if (op === 'yank') {
        ctx.setOffset(from);
    }
    else if (op === 'delete') {
        var newText = ctx.text.slice(0, from) + ctx.text.slice(to);
        ctx.setText(newText);
        var maxOff = Math.max(0, newText.length - ((0, intl_js_1.lastGrapheme)(newText).length || 1));
        ctx.setOffset(Math.min(from, maxOff));
    }
    else if (op === 'change') {
        var newText = ctx.text.slice(0, from) + ctx.text.slice(to);
        ctx.setText(newText);
        ctx.enterInsert(from);
    }
}
function executeOperatorG(op, count, ctx) {
    // count=1 means no count given, target = end of file
    // otherwise target = line N
    var target = count === 1 ? ctx.cursor.startOfLastLine() : ctx.cursor.goToLine(count);
    if (target.equals(ctx.cursor))
        return;
    var range = getOperatorRange(ctx.cursor, target, 'G', op, count);
    applyOperator(op, range.from, range.to, ctx, range.linewise);
    ctx.recordChange({ type: 'operator', op: op, motion: 'G', count: count });
}
function executeOperatorGg(op, count, ctx) {
    // count=1 means no count given, target = first line
    // otherwise target = line N
    var target = count === 1 ? ctx.cursor.startOfFirstLine() : ctx.cursor.goToLine(count);
    if (target.equals(ctx.cursor))
        return;
    var range = getOperatorRange(ctx.cursor, target, 'gg', op, count);
    applyOperator(op, range.from, range.to, ctx, range.linewise);
    ctx.recordChange({ type: 'operator', op: op, motion: 'gg', count: count });
}
