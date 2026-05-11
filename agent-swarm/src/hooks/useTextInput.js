"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTextInput = useTextInput;
var inputModes_js_1 = require("src/components/PromptInput/inputModes.js");
var notifications_js_1 = require("src/context/notifications.js");
var strip_ansi_1 = require("strip-ansi");
var terminalSetup_js_1 = require("../commands/terminalSetup/terminalSetup.js");
var history_js_1 = require("../history.js");
var Cursor_js_1 = require("../utils/Cursor.js");
var env_js_1 = require("../utils/env.js");
var fullscreen_js_1 = require("../utils/fullscreen.js");
var modifiers_js_1 = require("../utils/modifiers.js");
var useDoublePress_js_1 = require("./useDoublePress.js");
var NOOP_HANDLER = function () { };
function mapInput(input_map) {
    var map = new Map(input_map);
    return function (input) {
        var _a;
        return ((_a = map.get(input)) !== null && _a !== void 0 ? _a : NOOP_HANDLER)(input);
    };
}
function useTextInput(_a) {
    var originalValue = _a.value, onChange = _a.onChange, onSubmit = _a.onSubmit, onExit = _a.onExit, onExitMessage = _a.onExitMessage, onHistoryUp = _a.onHistoryUp, onHistoryDown = _a.onHistoryDown, onHistoryReset = _a.onHistoryReset, onClearInput = _a.onClearInput, _b = _a.mask, mask = _b === void 0 ? '' : _b, _c = _a.multiline, multiline = _c === void 0 ? false : _c, cursorChar = _a.cursorChar, invert = _a.invert, columns = _a.columns, _onImagePaste = _a.onImagePaste, _d = _a.disableCursorMovementForUpDownKeys, disableCursorMovementForUpDownKeys = _d === void 0 ? false : _d, _e = _a.disableEscapeDoublePress, disableEscapeDoublePress = _e === void 0 ? false : _e, maxVisibleLines = _a.maxVisibleLines, externalOffset = _a.externalOffset, onOffsetChange = _a.onOffsetChange, inputFilter = _a.inputFilter, inlineGhostText = _a.inlineGhostText, dim = _a.dim;
    // Pre-warm the modifiers module for Apple Terminal (has internal guard, safe to call multiple times)
    if (env_js_1.env.terminal === 'Apple_Terminal') {
        (0, modifiers_js_1.prewarmModifiers)();
    }
    var offset = externalOffset;
    var setOffset = onOffsetChange;
    var cursor = Cursor_js_1.Cursor.fromText(originalValue, columns, offset);
    var _f = (0, notifications_js_1.useNotifications)(), addNotification = _f.addNotification, removeNotification = _f.removeNotification;
    var handleCtrlC = (0, useDoublePress_js_1.useDoublePress)(function (show) {
        onExitMessage === null || onExitMessage === void 0 ? void 0 : onExitMessage(show, 'Ctrl-C');
    }, function () { return onExit === null || onExit === void 0 ? void 0 : onExit(); }, function () {
        if (originalValue) {
            onChange('');
            setOffset(0);
            onHistoryReset === null || onHistoryReset === void 0 ? void 0 : onHistoryReset();
        }
    });
    // NOTE(keybindings): This escape handler is intentionally NOT migrated to the keybindings system.
    // It's a text-level double-press escape for clearing input, not an action-level keybinding.
    // Double-press Esc clears the input and saves to history - this is text editing behavior,
    // not dialog dismissal, and needs the double-press safety mechanism.
    var handleEscape = (0, useDoublePress_js_1.useDoublePress)(function (show) {
        if (!originalValue || !show) {
            return;
        }
        addNotification({
            key: 'escape-again-to-clear',
            text: 'Esc again to clear',
            priority: 'immediate',
            timeoutMs: 1000,
        });
    }, function () {
        // Remove the "Esc again to clear" notification immediately
        removeNotification('escape-again-to-clear');
        onClearInput === null || onClearInput === void 0 ? void 0 : onClearInput();
        if (originalValue) {
            // Track double-escape usage for feature discovery
            // Save to history before clearing
            if (originalValue.trim() !== '') {
                (0, history_js_1.addToHistory)(originalValue);
            }
            onChange('');
            setOffset(0);
            onHistoryReset === null || onHistoryReset === void 0 ? void 0 : onHistoryReset();
        }
    });
    var handleEmptyCtrlD = (0, useDoublePress_js_1.useDoublePress)(function (show) {
        if (originalValue !== '') {
            return;
        }
        onExitMessage === null || onExitMessage === void 0 ? void 0 : onExitMessage(show, 'Ctrl-D');
    }, function () {
        if (originalValue !== '') {
            return;
        }
        onExit === null || onExit === void 0 ? void 0 : onExit();
    });
    function handleCtrlD() {
        if (cursor.text === '') {
            // When input is empty, handle double-press
            handleEmptyCtrlD();
            return cursor;
        }
        // When input is not empty, delete forward like iPython
        return cursor.del();
    }
    function killToLineEnd() {
        var _a = cursor.deleteToLineEnd(), newCursor = _a.cursor, killed = _a.killed;
        (0, Cursor_js_1.pushToKillRing)(killed, 'append');
        return newCursor;
    }
    function killToLineStart() {
        var _a = cursor.deleteToLineStart(), newCursor = _a.cursor, killed = _a.killed;
        (0, Cursor_js_1.pushToKillRing)(killed, 'prepend');
        return newCursor;
    }
    function killWordBefore() {
        var _a = cursor.deleteWordBefore(), newCursor = _a.cursor, killed = _a.killed;
        (0, Cursor_js_1.pushToKillRing)(killed, 'prepend');
        return newCursor;
    }
    function yank() {
        var text = (0, Cursor_js_1.getLastKill)();
        if (text.length > 0) {
            var startOffset = cursor.offset;
            var newCursor = cursor.insert(text);
            (0, Cursor_js_1.recordYank)(startOffset, text.length);
            return newCursor;
        }
        return cursor;
    }
    function handleYankPop() {
        var popResult = (0, Cursor_js_1.yankPop)();
        if (!popResult) {
            return cursor;
        }
        var text = popResult.text, start = popResult.start, length = popResult.length;
        // Replace the previously yanked text with the new one
        var before = cursor.text.slice(0, start);
        var after = cursor.text.slice(start + length);
        var newText = before + text + after;
        var newOffset = start + text.length;
        (0, Cursor_js_1.updateYankLength)(text.length);
        return Cursor_js_1.Cursor.fromText(newText, columns, newOffset);
    }
    var handleCtrl = mapInput([
        ['a', function () { return cursor.startOfLine(); }],
        ['b', function () { return cursor.left(); }],
        ['c', handleCtrlC],
        ['d', handleCtrlD],
        ['e', function () { return cursor.endOfLine(); }],
        ['f', function () { return cursor.right(); }],
        ['h', function () { var _a; return (_a = cursor.deleteTokenBefore()) !== null && _a !== void 0 ? _a : cursor.backspace(); }],
        ['k', killToLineEnd],
        ['n', function () { return downOrHistoryDown(); }],
        ['p', function () { return upOrHistoryUp(); }],
        ['u', killToLineStart],
        ['w', killWordBefore],
        ['y', yank],
    ]);
    var handleMeta = mapInput([
        ['b', function () { return cursor.prevWord(); }],
        ['f', function () { return cursor.nextWord(); }],
        ['d', function () { return cursor.deleteWordAfter(); }],
        ['y', handleYankPop],
    ]);
    function handleEnter(key) {
        if (multiline &&
            cursor.offset > 0 &&
            cursor.text[cursor.offset - 1] === '\\') {
            // Track that the user has used backslash+return
            (0, terminalSetup_js_1.markBackslashReturnUsed)();
            return cursor.backspace().insert('\n');
        }
        // Meta+Enter or Shift+Enter inserts a newline
        if (key.meta || key.shift) {
            return cursor.insert('\n');
        }
        // Apple Terminal doesn't support custom Shift+Enter keybindings,
        // so we use native macOS modifier detection to check if Shift is held
        if (env_js_1.env.terminal === 'Apple_Terminal' && (0, modifiers_js_1.isModifierPressed)('shift')) {
            return cursor.insert('\n');
        }
        onSubmit === null || onSubmit === void 0 ? void 0 : onSubmit(originalValue);
    }
    function upOrHistoryUp() {
        if (disableCursorMovementForUpDownKeys) {
            onHistoryUp === null || onHistoryUp === void 0 ? void 0 : onHistoryUp();
            return cursor;
        }
        // Try to move by wrapped lines first
        var cursorUp = cursor.up();
        if (!cursorUp.equals(cursor)) {
            return cursorUp;
        }
        // If we can't move by wrapped lines and this is multiline input,
        // try to move by logical lines (to handle paragraph boundaries)
        if (multiline) {
            var cursorUpLogical = cursor.upLogicalLine();
            if (!cursorUpLogical.equals(cursor)) {
                return cursorUpLogical;
            }
        }
        // Can't move up at all - trigger history navigation
        onHistoryUp === null || onHistoryUp === void 0 ? void 0 : onHistoryUp();
        return cursor;
    }
    function downOrHistoryDown() {
        if (disableCursorMovementForUpDownKeys) {
            onHistoryDown === null || onHistoryDown === void 0 ? void 0 : onHistoryDown();
            return cursor;
        }
        // Try to move by wrapped lines first
        var cursorDown = cursor.down();
        if (!cursorDown.equals(cursor)) {
            return cursorDown;
        }
        // If we can't move by wrapped lines and this is multiline input,
        // try to move by logical lines (to handle paragraph boundaries)
        if (multiline) {
            var cursorDownLogical = cursor.downLogicalLine();
            if (!cursorDownLogical.equals(cursor)) {
                return cursorDownLogical;
            }
        }
        // Can't move down at all - trigger history navigation
        onHistoryDown === null || onHistoryDown === void 0 ? void 0 : onHistoryDown();
        return cursor;
    }
    function mapKey(key) {
        switch (true) {
            case key.escape:
                return function () {
                    // Skip when a keybinding context (e.g. Autocomplete) owns escape.
                    // useKeybindings can't shield us via stopImmediatePropagation —
                    // BaseTextInput's useInput registers first (child effects fire
                    // before parent effects), so this handler has already run by the
                    // time the keybinding's handler stops propagation.
                    if (disableEscapeDoublePress)
                        return cursor;
                    handleEscape();
                    // Return the current cursor unchanged - handleEscape manages state internally
                    return cursor;
                };
            case key.leftArrow && (key.ctrl || key.meta || key.fn):
                return function () { return cursor.prevWord(); };
            case key.rightArrow && (key.ctrl || key.meta || key.fn):
                return function () { return cursor.nextWord(); };
            case key.backspace:
                return key.meta || key.ctrl
                    ? killWordBefore
                    : function () { var _a; return (_a = cursor.deleteTokenBefore()) !== null && _a !== void 0 ? _a : cursor.backspace(); };
            case key.delete:
                return key.meta ? killToLineEnd : function () { return cursor.del(); };
            case key.ctrl:
                return handleCtrl;
            case key.home:
                return function () { return cursor.startOfLine(); };
            case key.end:
                return function () { return cursor.endOfLine(); };
            case key.pageDown:
                // In fullscreen mode, PgUp/PgDn scroll the message viewport instead
                // of moving the cursor — no-op here, ScrollKeybindingHandler handles it.
                if ((0, fullscreen_js_1.isFullscreenEnvEnabled)()) {
                    return NOOP_HANDLER;
                }
                return function () { return cursor.endOfLine(); };
            case key.pageUp:
                if ((0, fullscreen_js_1.isFullscreenEnvEnabled)()) {
                    return NOOP_HANDLER;
                }
                return function () { return cursor.startOfLine(); };
            case key.wheelUp:
            case key.wheelDown:
                // Mouse wheel events only exist when fullscreen mouse tracking is on.
                // ScrollKeybindingHandler handles them; no-op here to avoid inserting
                // the raw SGR sequence as text.
                return NOOP_HANDLER;
            case key.return:
                // Must come before key.meta so Option+Return inserts newline
                return function () { return handleEnter(key); };
            case key.meta:
                return handleMeta;
            case key.tab:
                return function () { return cursor; };
            case key.upArrow && !key.shift:
                return upOrHistoryUp;
            case key.downArrow && !key.shift:
                return downOrHistoryDown;
            case key.leftArrow:
                return function () { return cursor.left(); };
            case key.rightArrow:
                return function () { return cursor.right(); };
            default: {
                return function (input) {
                    switch (true) {
                        // Home key
                        case input === '\x1b[H' || input === '\x1b[1~':
                            return cursor.startOfLine();
                        // End key
                        case input === '\x1b[F' || input === '\x1b[4~':
                            return cursor.endOfLine();
                        default: {
                            // Trailing \r after text is SSH-coalesced Enter ("o\r") —
                            // strip it so the Enter isn't inserted as content. Lone \r
                            // here is Alt+Enter leaking through (META_KEY_CODE_RE doesn't
                            // match \x1b\r) — leave it for the \r→\n below. Embedded \r
                            // is multi-line paste from a terminal without bracketed
                            // paste — convert to \n. Backslash+\r is a stale VS Code
                            // Shift+Enter binding (pre-#8991 /terminal-setup wrote
                            // args.text "\\\r\n" to keybindings.json); keep the \r so
                            // it becomes \n below (anthropics/claude-code#31316).
                            var text = (0, strip_ansi_1.default)(input)
                                // eslint-disable-next-line custom-rules/no-lookbehind-regex -- .replace(re, str) on 1-2 char keystrokes: no-match returns same string (Object.is), regex never runs
                                .replace(/(?<=[^\\\r\n])\r$/, '')
                                .replace(/\r/g, '\n');
                            if (cursor.isAtStart() && (0, inputModes_js_1.isInputModeCharacter)(input)) {
                                return cursor.insert(text).left();
                            }
                            return cursor.insert(text);
                        }
                    }
                };
            }
        }
    }
    // Check if this is a kill command (Ctrl+K, Ctrl+U, Ctrl+W, or Meta+Backspace/Delete)
    function isKillKey(key, input) {
        if (key.ctrl && (input === 'k' || input === 'u' || input === 'w')) {
            return true;
        }
        if (key.meta && (key.backspace || key.delete)) {
            return true;
        }
        return false;
    }
    // Check if this is a yank command (Ctrl+Y or Alt+Y)
    function isYankKey(key, input) {
        return (key.ctrl || key.meta) && input === 'y';
    }
    function onInput(input, key) {
        // Note: Image paste shortcut (chat:imagePaste) is handled via useKeybindings in PromptInput
        var _a;
        // Apply filter if provided
        var filteredInput = inputFilter ? inputFilter(input, key) : input;
        // If the input was filtered out, do nothing
        if (filteredInput === '' && input !== '') {
            return;
        }
        // Fix Issue #1853: Filter DEL characters that interfere with backspace in SSH/tmux
        // In SSH/tmux environments, backspace generates both key events and raw DEL chars
        if (!key.backspace && !key.delete && input.includes('\x7f')) {
            var delCount = (input.match(/\x7f/g) || []).length;
            // Apply all DEL characters as backspace operations synchronously
            // Try to delete tokens first, fall back to character backspace
            var currentCursor = cursor;
            for (var i = 0; i < delCount; i++) {
                currentCursor =
                    (_a = currentCursor.deleteTokenBefore()) !== null && _a !== void 0 ? _a : currentCursor.backspace();
            }
            // Update state once with the final result
            if (!cursor.equals(currentCursor)) {
                if (cursor.text !== currentCursor.text) {
                    onChange(currentCursor.text);
                }
                setOffset(currentCursor.offset);
            }
            (0, Cursor_js_1.resetKillAccumulation)();
            (0, Cursor_js_1.resetYankState)();
            return;
        }
        // Reset kill accumulation for non-kill keys
        if (!isKillKey(key, filteredInput)) {
            (0, Cursor_js_1.resetKillAccumulation)();
        }
        // Reset yank state for non-yank keys (breaks yank-pop chain)
        if (!isYankKey(key, filteredInput)) {
            (0, Cursor_js_1.resetYankState)();
        }
        var nextCursor = mapKey(key)(filteredInput);
        if (nextCursor) {
            if (!cursor.equals(nextCursor)) {
                if (cursor.text !== nextCursor.text) {
                    onChange(nextCursor.text);
                }
                setOffset(nextCursor.offset);
            }
            // SSH-coalesced Enter: on slow links, "o" + Enter can arrive as one
            // chunk "o\r". parseKeypress only matches s === '\r', so it hit the
            // default handler above (which stripped the trailing \r). Text with
            // exactly one trailing \r is coalesced Enter; lone \r is Alt+Enter
            // (newline); embedded \r is multi-line paste.
            if (filteredInput.length > 1 &&
                filteredInput.endsWith('\r') &&
                !filteredInput.slice(0, -1).includes('\r') &&
                // Backslash+CR is a stale VS Code Shift+Enter binding, not
                // coalesced Enter. See default handler above.
                filteredInput[filteredInput.length - 2] !== '\\') {
                onSubmit === null || onSubmit === void 0 ? void 0 : onSubmit(nextCursor.text);
            }
        }
    }
    // Prepare ghost text for rendering - validate insertPosition matches current
    // cursor offset to prevent stale ghost text from a previous keystroke causing
    // a one-frame jitter (ghost text state is updated via useEffect after render)
    var ghostTextForRender = inlineGhostText && dim && inlineGhostText.insertPosition === offset
        ? { text: inlineGhostText.text, dim: dim }
        : undefined;
    var cursorPos = cursor.getPosition();
    return {
        onInput: onInput,
        renderedValue: cursor.render(cursorChar, mask, invert, ghostTextForRender, maxVisibleLines),
        offset: offset,
        setOffset: setOffset,
        cursorLine: cursorPos.line - cursor.getViewportStartLine(maxVisibleLines),
        cursorColumn: cursorPos.column,
        viewportCharOffset: cursor.getViewportCharOffset(maxVisibleLines),
        viewportCharEnd: cursor.getViewportCharEnd(maxVisibleLines),
    };
}
