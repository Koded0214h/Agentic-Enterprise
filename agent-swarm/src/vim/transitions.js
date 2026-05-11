"use strict";
/**
 * Vim State Transition Table
 *
 * This is the scannable source of truth for state transitions.
 * To understand what happens in any state, look up that state's transition function.
 */
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
exports.transition = transition;
var motions_js_1 = require("./motions.js");
var operators_js_1 = require("./operators.js");
var types_js_1 = require("./types.js");
/**
 * Main transition function. Dispatches based on current state type.
 */
function transition(state, input, ctx) {
    switch (state.type) {
        case 'idle':
            return fromIdle(input, ctx);
        case 'count':
            return fromCount(state, input, ctx);
        case 'operator':
            return fromOperator(state, input, ctx);
        case 'operatorCount':
            return fromOperatorCount(state, input, ctx);
        case 'operatorFind':
            return fromOperatorFind(state, input, ctx);
        case 'operatorTextObj':
            return fromOperatorTextObj(state, input, ctx);
        case 'find':
            return fromFind(state, input, ctx);
        case 'g':
            return fromG(state, input, ctx);
        case 'operatorG':
            return fromOperatorG(state, input, ctx);
        case 'replace':
            return fromReplace(state, input, ctx);
        case 'indent':
            return fromIndent(state, input, ctx);
    }
}
// ============================================================================
// Shared Input Handling
// ============================================================================
/**
 * Handle input that's valid in both idle and count states.
 * Returns null if input is not recognized.
 */
function handleNormalInput(input, count, ctx) {
    if ((0, types_js_1.isOperatorKey)(input)) {
        return { next: { type: 'operator', op: types_js_1.OPERATORS[input], count: count } };
    }
    if (types_js_1.SIMPLE_MOTIONS.has(input)) {
        return {
            execute: function () {
                var target = (0, motions_js_1.resolveMotion)(input, ctx.cursor, count);
                ctx.setOffset(target.offset);
            },
        };
    }
    if (types_js_1.FIND_KEYS.has(input)) {
        return { next: { type: 'find', find: input, count: count } };
    }
    if (input === 'g')
        return { next: { type: 'g', count: count } };
    if (input === 'r')
        return { next: { type: 'replace', count: count } };
    if (input === '>' || input === '<') {
        return { next: { type: 'indent', dir: input, count: count } };
    }
    if (input === '~') {
        return { execute: function () { return (0, operators_js_1.executeToggleCase)(count, ctx); } };
    }
    if (input === 'x') {
        return { execute: function () { return (0, operators_js_1.executeX)(count, ctx); } };
    }
    if (input === 'J') {
        return { execute: function () { return (0, operators_js_1.executeJoin)(count, ctx); } };
    }
    if (input === 'p' || input === 'P') {
        return { execute: function () { return (0, operators_js_1.executePaste)(input === 'p', count, ctx); } };
    }
    if (input === 'D') {
        return { execute: function () { return (0, operators_js_1.executeOperatorMotion)('delete', '$', 1, ctx); } };
    }
    if (input === 'C') {
        return { execute: function () { return (0, operators_js_1.executeOperatorMotion)('change', '$', 1, ctx); } };
    }
    if (input === 'Y') {
        return { execute: function () { return (0, operators_js_1.executeLineOp)('yank', count, ctx); } };
    }
    if (input === 'G') {
        return {
            execute: function () {
                // count=1 means no count given, go to last line
                // otherwise go to line N
                if (count === 1) {
                    ctx.setOffset(ctx.cursor.startOfLastLine().offset);
                }
                else {
                    ctx.setOffset(ctx.cursor.goToLine(count).offset);
                }
            },
        };
    }
    if (input === '.') {
        return { execute: function () { var _a; return (_a = ctx.onDotRepeat) === null || _a === void 0 ? void 0 : _a.call(ctx); } };
    }
    if (input === ';' || input === ',') {
        return { execute: function () { return executeRepeatFind(input === ',', count, ctx); } };
    }
    if (input === 'u') {
        return { execute: function () { var _a; return (_a = ctx.onUndo) === null || _a === void 0 ? void 0 : _a.call(ctx); } };
    }
    if (input === 'i') {
        return { execute: function () { return ctx.enterInsert(ctx.cursor.offset); } };
    }
    if (input === 'I') {
        return {
            execute: function () {
                return ctx.enterInsert(ctx.cursor.firstNonBlankInLogicalLine().offset);
            },
        };
    }
    if (input === 'a') {
        return {
            execute: function () {
                var newOffset = ctx.cursor.isAtEnd()
                    ? ctx.cursor.offset
                    : ctx.cursor.right().offset;
                ctx.enterInsert(newOffset);
            },
        };
    }
    if (input === 'A') {
        return {
            execute: function () { return ctx.enterInsert(ctx.cursor.endOfLogicalLine().offset); },
        };
    }
    if (input === 'o') {
        return { execute: function () { return (0, operators_js_1.executeOpenLine)('below', ctx); } };
    }
    if (input === 'O') {
        return { execute: function () { return (0, operators_js_1.executeOpenLine)('above', ctx); } };
    }
    return null;
}
/**
 * Handle operator input (motion, find, text object scope).
 * Returns null if input is not recognized.
 */
function handleOperatorInput(op, count, input, ctx) {
    if ((0, types_js_1.isTextObjScopeKey)(input)) {
        return {
            next: {
                type: 'operatorTextObj',
                op: op,
                count: count,
                scope: types_js_1.TEXT_OBJ_SCOPES[input],
            },
        };
    }
    if (types_js_1.FIND_KEYS.has(input)) {
        return {
            next: { type: 'operatorFind', op: op, count: count, find: input },
        };
    }
    if (types_js_1.SIMPLE_MOTIONS.has(input)) {
        return { execute: function () { return (0, operators_js_1.executeOperatorMotion)(op, input, count, ctx); } };
    }
    if (input === 'G') {
        return { execute: function () { return (0, operators_js_1.executeOperatorG)(op, count, ctx); } };
    }
    if (input === 'g') {
        return { next: { type: 'operatorG', op: op, count: count } };
    }
    return null;
}
// ============================================================================
// Transition Functions - One per state type
// ============================================================================
function fromIdle(input, ctx) {
    // 0 is line-start motion, not a count prefix
    if (/[1-9]/.test(input)) {
        return { next: { type: 'count', digits: input } };
    }
    if (input === '0') {
        return {
            execute: function () { return ctx.setOffset(ctx.cursor.startOfLogicalLine().offset); },
        };
    }
    var result = handleNormalInput(input, 1, ctx);
    if (result)
        return result;
    return {};
}
function fromCount(state, input, ctx) {
    if (/[0-9]/.test(input)) {
        var newDigits = state.digits + input;
        var count_1 = Math.min(parseInt(newDigits, 10), types_js_1.MAX_VIM_COUNT);
        return { next: { type: 'count', digits: String(count_1) } };
    }
    var count = parseInt(state.digits, 10);
    var result = handleNormalInput(input, count, ctx);
    if (result)
        return result;
    return { next: { type: 'idle' } };
}
function fromOperator(state, input, ctx) {
    // dd, cc, yy = line operation
    if (input === state.op[0]) {
        return { execute: function () { return (0, operators_js_1.executeLineOp)(state.op, state.count, ctx); } };
    }
    if (/[0-9]/.test(input)) {
        return {
            next: {
                type: 'operatorCount',
                op: state.op,
                count: state.count,
                digits: input,
            },
        };
    }
    var result = handleOperatorInput(state.op, state.count, input, ctx);
    if (result)
        return result;
    return { next: { type: 'idle' } };
}
function fromOperatorCount(state, input, ctx) {
    if (/[0-9]/.test(input)) {
        var newDigits = state.digits + input;
        var parsedDigits = Math.min(parseInt(newDigits, 10), types_js_1.MAX_VIM_COUNT);
        return { next: __assign(__assign({}, state), { digits: String(parsedDigits) }) };
    }
    var motionCount = parseInt(state.digits, 10);
    var effectiveCount = state.count * motionCount;
    var result = handleOperatorInput(state.op, effectiveCount, input, ctx);
    if (result)
        return result;
    return { next: { type: 'idle' } };
}
function fromOperatorFind(state, input, ctx) {
    return {
        execute: function () {
            return (0, operators_js_1.executeOperatorFind)(state.op, state.find, input, state.count, ctx);
        },
    };
}
function fromOperatorTextObj(state, input, ctx) {
    if (types_js_1.TEXT_OBJ_TYPES.has(input)) {
        return {
            execute: function () {
                return (0, operators_js_1.executeOperatorTextObj)(state.op, state.scope, input, state.count, ctx);
            },
        };
    }
    return { next: { type: 'idle' } };
}
function fromFind(state, input, ctx) {
    return {
        execute: function () {
            var result = ctx.cursor.findCharacter(input, state.find, state.count);
            if (result !== null) {
                ctx.setOffset(result);
                ctx.setLastFind(state.find, input);
            }
        },
    };
}
function fromG(state, input, ctx) {
    if (input === 'j' || input === 'k') {
        return {
            execute: function () {
                var target = (0, motions_js_1.resolveMotion)("g".concat(input), ctx.cursor, state.count);
                ctx.setOffset(target.offset);
            },
        };
    }
    if (input === 'g') {
        // If count provided (e.g., 5gg), go to that line. Otherwise go to first line.
        if (state.count > 1) {
            return {
                execute: function () {
                    var _a, _b;
                    var lines = ctx.text.split('\n');
                    var targetLine = Math.min(state.count - 1, lines.length - 1);
                    var offset = 0;
                    for (var i = 0; i < targetLine; i++) {
                        offset += ((_b = (_a = lines[i]) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) + 1; // +1 for newline
                    }
                    ctx.setOffset(offset);
                },
            };
        }
        return {
            execute: function () { return ctx.setOffset(ctx.cursor.startOfFirstLine().offset); },
        };
    }
    return { next: { type: 'idle' } };
}
function fromOperatorG(state, input, ctx) {
    if (input === 'j' || input === 'k') {
        return {
            execute: function () {
                return (0, operators_js_1.executeOperatorMotion)(state.op, "g".concat(input), state.count, ctx);
            },
        };
    }
    if (input === 'g') {
        return { execute: function () { return (0, operators_js_1.executeOperatorGg)(state.op, state.count, ctx); } };
    }
    // Any other input cancels the operator
    return { next: { type: 'idle' } };
}
function fromReplace(state, input, ctx) {
    // Backspace/Delete arrive as empty input in literal-char states. In vim,
    // r<BS> cancels the replace; without this guard, executeReplace("") would
    // delete the character under the cursor instead.
    if (input === '')
        return { next: { type: 'idle' } };
    return { execute: function () { return (0, operators_js_1.executeReplace)(input, state.count, ctx); } };
}
function fromIndent(state, input, ctx) {
    if (input === state.dir) {
        return { execute: function () { return (0, operators_js_1.executeIndent)(state.dir, state.count, ctx); } };
    }
    return { next: { type: 'idle' } };
}
// ============================================================================
// Helper functions for special commands
// ============================================================================
function executeRepeatFind(reverse, count, ctx) {
    var lastFind = ctx.getLastFind();
    if (!lastFind)
        return;
    // Determine the effective find type based on reverse
    var findType = lastFind.type;
    if (reverse) {
        // Flip the direction
        var flipMap = {
            f: 'F',
            F: 'f',
            t: 'T',
            T: 't',
        };
        findType = flipMap[findType];
    }
    var result = ctx.cursor.findCharacter(lastFind.char, findType, count);
    if (result !== null) {
        ctx.setOffset(result);
    }
}
