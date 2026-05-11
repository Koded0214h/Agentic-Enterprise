"use strict";
/**
 * Vim Mode State Machine Types
 *
 * This file defines the complete state machine for vim input handling.
 * The types ARE the documentation - reading them tells you how the system works.
 *
 * State Diagram:
 * ```
 *                              VimState
 *   ┌──────────────────────────────┬──────────────────────────────────────┐
 *   │  INSERT                      │  NORMAL                              │
 *   │  (tracks insertedText)       │  (CommandState machine)              │
 *   │                              │                                      │
 *   │                              │  idle ──┬─[d/c/y]──► operator        │
 *   │                              │         ├─[1-9]────► count           │
 *   │                              │         ├─[fFtT]───► find            │
 *   │                              │         ├─[g]──────► g               │
 *   │                              │         ├─[r]──────► replace         │
 *   │                              │         └─[><]─────► indent          │
 *   │                              │                                      │
 *   │                              │  operator ─┬─[motion]──► execute     │
 *   │                              │            ├─[0-9]────► operatorCount│
 *   │                              │            ├─[ia]─────► operatorTextObj
 *   │                              │            └─[fFtT]───► operatorFind │
 *   └──────────────────────────────┴──────────────────────────────────────┘
 * ```
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_VIM_COUNT = exports.TEXT_OBJ_TYPES = exports.TEXT_OBJ_SCOPES = exports.FIND_KEYS = exports.SIMPLE_MOTIONS = exports.OPERATORS = void 0;
exports.isOperatorKey = isOperatorKey;
exports.isTextObjScopeKey = isTextObjScopeKey;
exports.createInitialVimState = createInitialVimState;
exports.createInitialPersistentState = createInitialPersistentState;
// ============================================================================
// Key Groups - Named constants, no magic strings
// ============================================================================
exports.OPERATORS = {
    d: 'delete',
    c: 'change',
    y: 'yank',
};
function isOperatorKey(key) {
    return key in exports.OPERATORS;
}
exports.SIMPLE_MOTIONS = new Set([
    'h',
    'l',
    'j',
    'k', // Basic movement
    'w',
    'b',
    'e',
    'W',
    'B',
    'E', // Word motions
    '0',
    '^',
    '$', // Line positions
]);
exports.FIND_KEYS = new Set(['f', 'F', 't', 'T']);
exports.TEXT_OBJ_SCOPES = {
    i: 'inner',
    a: 'around',
};
function isTextObjScopeKey(key) {
    return key in exports.TEXT_OBJ_SCOPES;
}
exports.TEXT_OBJ_TYPES = new Set([
    'w',
    'W', // Word/WORD
    '"',
    "'",
    '`', // Quotes
    '(',
    ')',
    'b', // Parens
    '[',
    ']', // Brackets
    '{',
    '}',
    'B', // Braces
    '<',
    '>', // Angle brackets
]);
exports.MAX_VIM_COUNT = 10000;
// ============================================================================
// State Factories
// ============================================================================
function createInitialVimState() {
    return { mode: 'INSERT', insertedText: '' };
}
function createInitialPersistentState() {
    return {
        lastChange: null,
        lastFind: null,
        register: '',
        registerIsLinewise: false,
    };
}
