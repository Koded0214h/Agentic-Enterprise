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
exports.useVimInput = useVimInput;
var react_1 = require("react");
var Cursor_js_1 = require("../utils/Cursor.js");
var intl_js_1 = require("../utils/intl.js");
var operators_js_1 = require("../vim/operators.js");
var transitions_js_1 = require("../vim/transitions.js");
var types_js_1 = require("../vim/types.js");
var useTextInput_js_1 = require("./useTextInput.js");
function useVimInput(props) {
    var vimStateRef = react_1.default.useRef((0, types_js_1.createInitialVimState)());
    var _a = (0, react_1.useState)('INSERT'), mode = _a[0], setMode = _a[1];
    var persistentRef = react_1.default.useRef((0, types_js_1.createInitialPersistentState)());
    // inputFilter is applied once at the top of handleVimInput (not here) so
    // vim-handled paths that return without calling textInput.onInput still
    // run the filter — otherwise a stateful filter (e.g. lazy-space-after-
    // pill) stays armed across an Escape → NORMAL → INSERT round-trip.
    var textInput = (0, useTextInput_js_1.useTextInput)(__assign(__assign({}, props), { inputFilter: undefined }));
    var onModeChange = props.onModeChange, inputFilter = props.inputFilter;
    var switchToInsertMode = (0, react_1.useCallback)(function (offset) {
        if (offset !== undefined) {
            textInput.setOffset(offset);
        }
        vimStateRef.current = { mode: 'INSERT', insertedText: '' };
        setMode('INSERT');
        onModeChange === null || onModeChange === void 0 ? void 0 : onModeChange('INSERT');
    }, [textInput, onModeChange]);
    var switchToNormalMode = (0, react_1.useCallback)(function () {
        var current = vimStateRef.current;
        if (current.mode === 'INSERT' && current.insertedText) {
            persistentRef.current.lastChange = {
                type: 'insert',
                text: current.insertedText,
            };
        }
        // Vim behavior: move cursor left by 1 when exiting insert mode
        // (unless at beginning of line or at offset 0)
        var offset = textInput.offset;
        if (offset > 0 && props.value[offset - 1] !== '\n') {
            textInput.setOffset(offset - 1);
        }
        vimStateRef.current = { mode: 'NORMAL', command: { type: 'idle' } };
        setMode('NORMAL');
        onModeChange === null || onModeChange === void 0 ? void 0 : onModeChange('NORMAL');
    }, [onModeChange, textInput, props.value]);
    function createOperatorContext(cursor, isReplay) {
        if (isReplay === void 0) { isReplay = false; }
        return {
            cursor: cursor,
            text: props.value,
            setText: function (newText) { return props.onChange(newText); },
            setOffset: function (offset) { return textInput.setOffset(offset); },
            enterInsert: function (offset) { return switchToInsertMode(offset); },
            getRegister: function () { return persistentRef.current.register; },
            setRegister: function (content, linewise) {
                persistentRef.current.register = content;
                persistentRef.current.registerIsLinewise = linewise;
            },
            getLastFind: function () { return persistentRef.current.lastFind; },
            setLastFind: function (type, char) {
                persistentRef.current.lastFind = { type: type, char: char };
            },
            recordChange: isReplay
                ? function () { }
                : function (change) {
                    persistentRef.current.lastChange = change;
                },
        };
    }
    function replayLastChange() {
        var change = persistentRef.current.lastChange;
        if (!change)
            return;
        var cursor = Cursor_js_1.Cursor.fromText(props.value, props.columns, textInput.offset);
        var ctx = createOperatorContext(cursor, true);
        switch (change.type) {
            case 'insert':
                if (change.text) {
                    var newCursor = cursor.insert(change.text);
                    props.onChange(newCursor.text);
                    textInput.setOffset(newCursor.offset);
                }
                break;
            case 'x':
                (0, operators_js_1.executeX)(change.count, ctx);
                break;
            case 'replace':
                (0, operators_js_1.executeReplace)(change.char, change.count, ctx);
                break;
            case 'toggleCase':
                (0, operators_js_1.executeToggleCase)(change.count, ctx);
                break;
            case 'indent':
                (0, operators_js_1.executeIndent)(change.dir, change.count, ctx);
                break;
            case 'join':
                (0, operators_js_1.executeJoin)(change.count, ctx);
                break;
            case 'openLine':
                (0, operators_js_1.executeOpenLine)(change.direction, ctx);
                break;
            case 'operator':
                (0, operators_js_1.executeOperatorMotion)(change.op, change.motion, change.count, ctx);
                break;
            case 'operatorFind':
                (0, operators_js_1.executeOperatorFind)(change.op, change.find, change.char, change.count, ctx);
                break;
            case 'operatorTextObj':
                (0, operators_js_1.executeOperatorTextObj)(change.op, change.scope, change.objType, change.count, ctx);
                break;
        }
    }
    function handleVimInput(rawInput, key) {
        var state = vimStateRef.current;
        // Run inputFilter in all modes so stateful filters disarm on any key,
        // but only apply the transformed input in INSERT — NORMAL-mode command
        // lookups expect single chars and a prepended space would break them.
        var filtered = inputFilter ? inputFilter(rawInput, key) : rawInput;
        var input = state.mode === 'INSERT' ? filtered : rawInput;
        var cursor = Cursor_js_1.Cursor.fromText(props.value, props.columns, textInput.offset);
        if (key.ctrl) {
            textInput.onInput(input, key);
            return;
        }
        // NOTE(keybindings): This escape handler is intentionally NOT migrated to the keybindings system.
        // It's vim's standard INSERT->NORMAL mode switch - a vim-specific behavior that should not be
        // configurable via keybindings. Vim users expect Esc to always exit INSERT mode.
        if (key.escape && state.mode === 'INSERT') {
            switchToNormalMode();
            return;
        }
        // Escape in NORMAL mode cancels any pending command (replace, operator, etc.)
        if (key.escape && state.mode === 'NORMAL') {
            vimStateRef.current = { mode: 'NORMAL', command: { type: 'idle' } };
            return;
        }
        // Pass Enter to base handler regardless of mode (allows submission from NORMAL)
        if (key.return) {
            textInput.onInput(input, key);
            return;
        }
        if (state.mode === 'INSERT') {
            // Track inserted text for dot-repeat
            if (key.backspace || key.delete) {
                if (state.insertedText.length > 0) {
                    vimStateRef.current = {
                        mode: 'INSERT',
                        insertedText: state.insertedText.slice(0, -((0, intl_js_1.lastGrapheme)(state.insertedText).length || 1)),
                    };
                }
            }
            else {
                vimStateRef.current = {
                    mode: 'INSERT',
                    insertedText: state.insertedText + input,
                };
            }
            textInput.onInput(input, key);
            return;
        }
        if (state.mode !== 'NORMAL') {
            return;
        }
        // In idle state, delegate arrow keys to base handler for cursor movement
        // and history fallback (upOrHistoryUp / downOrHistoryDown)
        if (state.command.type === 'idle' &&
            (key.upArrow || key.downArrow || key.leftArrow || key.rightArrow)) {
            textInput.onInput(input, key);
            return;
        }
        var ctx = __assign(__assign({}, createOperatorContext(cursor, false)), { onUndo: props.onUndo, onDotRepeat: replayLastChange });
        // Backspace/Delete are only mapped in motion-expecting states. In
        // literal-char states (replace, find, operatorFind), mapping would turn
        // r+Backspace into "replace with h" and df+Delete into "delete to next x".
        // Delete additionally skips count state: in vim, N<Del> removes a count
        // digit rather than executing Nx; we don't implement digit removal but
        // should at least not turn a cancel into a destructive Nx.
        var expectsMotion = state.command.type === 'idle' ||
            state.command.type === 'count' ||
            state.command.type === 'operator' ||
            state.command.type === 'operatorCount';
        // Map arrow keys to vim motions in NORMAL mode
        var vimInput = input;
        if (key.leftArrow)
            vimInput = 'h';
        else if (key.rightArrow)
            vimInput = 'l';
        else if (key.upArrow)
            vimInput = 'k';
        else if (key.downArrow)
            vimInput = 'j';
        else if (expectsMotion && key.backspace)
            vimInput = 'h';
        else if (expectsMotion && state.command.type !== 'count' && key.delete)
            vimInput = 'x';
        var result = (0, transitions_js_1.transition)(state.command, vimInput, ctx);
        if (result.execute) {
            result.execute();
        }
        // Update command state (only if execute didn't switch to INSERT)
        if (vimStateRef.current.mode === 'NORMAL') {
            if (result.next) {
                vimStateRef.current = { mode: 'NORMAL', command: result.next };
            }
            else if (result.execute) {
                vimStateRef.current = { mode: 'NORMAL', command: { type: 'idle' } };
            }
        }
        if (input === '?' &&
            state.mode === 'NORMAL' &&
            state.command.type === 'idle') {
            props.onChange('?');
        }
    }
    var setModeExternal = (0, react_1.useCallback)(function (newMode) {
        if (newMode === 'INSERT') {
            vimStateRef.current = { mode: 'INSERT', insertedText: '' };
        }
        else {
            vimStateRef.current = { mode: 'NORMAL', command: { type: 'idle' } };
        }
        setMode(newMode);
        onModeChange === null || onModeChange === void 0 ? void 0 : onModeChange(newMode);
    }, [onModeChange]);
    return __assign(__assign({}, textInput), { onInput: handleVimInput, mode: mode, setMode: setModeExternal });
}
