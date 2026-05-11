"use strict";
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
exports.nonAlphanumericKeys = exports.INITIAL_STATE = exports.DECRPM_STATUS = void 0;
exports.parseMultipleKeypresses = parseMultipleKeypresses;
/**
 * Keyboard input parser - converts terminal input to key events
 *
 * Uses the termio tokenizer for escape sequence boundary detection,
 * then interprets sequences as keypresses.
 */
var buffer_1 = require("buffer");
var csi_js_1 = require("./termio/csi.js");
var tokenize_js_1 = require("./termio/tokenize.js");
// eslint-disable-next-line no-control-regex
var META_KEY_CODE_RE = /^(?:\x1b)([a-zA-Z0-9])$/;
// eslint-disable-next-line no-control-regex
var FN_KEY_RE = 
// eslint-disable-next-line no-control-regex
/^(?:\x1b+)(O|N|\[|\[\[)(?:(\d+)(?:;(\d+))?([~^$])|(?:1;)?(\d+)?([a-zA-Z]))/;
// CSI u (kitty keyboard protocol): ESC [ codepoint [; modifier] u
// Example: ESC[13;2u = Shift+Enter, ESC[27u = Escape (no modifiers)
// Modifier is optional - when absent, defaults to 1 (no modifiers)
// eslint-disable-next-line no-control-regex
var CSI_U_RE = /^\x1b\[(\d+)(?:;(\d+))?u/;
// xterm modifyOtherKeys: ESC [ 27 ; modifier ; keycode ~
// Example: ESC[27;2;13~ = Shift+Enter. Emitted by Ghostty/tmux/xterm when
// modifyOtherKeys=2 is active or via user keybinds, typically over SSH where
// TERM sniffing misses Ghostty and we never push Kitty keyboard mode.
// Note param order is reversed vs CSI u (modifier first, keycode second).
// eslint-disable-next-line no-control-regex
var MODIFY_OTHER_KEYS_RE = /^\x1b\[27;(\d+);(\d+)~/;
// -- Terminal response patterns (inbound sequences from the terminal itself) --
// DECRPM: CSI ? Ps ; Pm $ y  — response to DECRQM (request mode)
// eslint-disable-next-line no-control-regex
var DECRPM_RE = /^\x1b\[\?(\d+);(\d+)\$y$/;
// DA1: CSI ? Ps ; ... c  — primary device attributes response
// eslint-disable-next-line no-control-regex
var DA1_RE = /^\x1b\[\?([\d;]*)c$/;
// DA2: CSI > Ps ; ... c  — secondary device attributes response
// eslint-disable-next-line no-control-regex
var DA2_RE = /^\x1b\[>([\d;]*)c$/;
// Kitty keyboard flags: CSI ? flags u  — response to CSI ? u query
// (private ? marker distinguishes from CSI u key events)
// eslint-disable-next-line no-control-regex
var KITTY_FLAGS_RE = /^\x1b\[\?(\d+)u$/;
// DECXCPR cursor position: CSI ? row ; col R
// The ? marker disambiguates from modified F3 keys (Shift+F3 = CSI 1;2 R,
// Ctrl+F3 = CSI 1;5 R, etc.) — plain CSI row;col R is genuinely ambiguous.
// eslint-disable-next-line no-control-regex
var CURSOR_POSITION_RE = /^\x1b\[\?(\d+);(\d+)R$/;
// OSC response: OSC code ; data (BEL|ST)
// eslint-disable-next-line no-control-regex
var OSC_RESPONSE_RE = /^\x1b\](\d+);(.*?)(?:\x07|\x1b\\)$/s;
// XTVERSION: DCS > | name ST  — terminal name/version string (answer to CSI > 0 q).
// xterm.js replies "xterm.js(X.Y.Z)"; Ghostty, kitty, iTerm2, etc. reply with
// their own name. Unlike TERM_PROGRAM, this survives SSH since the query/reply
// goes through the pty, not the environment.
// eslint-disable-next-line no-control-regex
var XTVERSION_RE = /^\x1bP>\|(.*?)(?:\x07|\x1b\\)$/s;
// SGR mouse event: CSI < button ; col ; row M (press) or m (release)
// Button codes: 64=wheel-up, 65=wheel-down (0x40 | wheel-bit).
// Button 32=left-drag (0x20 | motion-bit). Plain 0/1/2 = left/mid/right click.
// eslint-disable-next-line no-control-regex
var SGR_MOUSE_RE = /^\x1b\[<(\d+);(\d+);(\d+)([Mm])$/;
function createPasteKey(content) {
    return {
        kind: 'key',
        name: '',
        fn: false,
        ctrl: false,
        meta: false,
        shift: false,
        option: false,
        super: false,
        sequence: content,
        raw: content,
        isPasted: true,
    };
}
/** DECRPM status values (response to DECRQM) */
exports.DECRPM_STATUS = {
    NOT_RECOGNIZED: 0,
    SET: 1,
    RESET: 2,
    PERMANENTLY_SET: 3,
    PERMANENTLY_RESET: 4,
};
/**
 * Try to recognize a sequence token as a terminal response.
 * Returns null if the sequence is not a known response pattern
 * (i.e. it should be treated as a keypress).
 *
 * These patterns are syntactically distinguishable from keyboard input —
 * no physical key produces CSI ? ... c or CSI ? ... $ y, so they can be
 * safely parsed out of the input stream at any time.
 */
function parseTerminalResponse(s) {
    // CSI-prefixed responses
    if (s.startsWith('\x1b[')) {
        var m = void 0;
        if ((m = DECRPM_RE.exec(s))) {
            return {
                type: 'decrpm',
                mode: parseInt(m[1], 10),
                status: parseInt(m[2], 10),
            };
        }
        if ((m = DA1_RE.exec(s))) {
            return { type: 'da1', params: splitNumericParams(m[1]) };
        }
        if ((m = DA2_RE.exec(s))) {
            return { type: 'da2', params: splitNumericParams(m[1]) };
        }
        if ((m = KITTY_FLAGS_RE.exec(s))) {
            return { type: 'kittyKeyboard', flags: parseInt(m[1], 10) };
        }
        if ((m = CURSOR_POSITION_RE.exec(s))) {
            return {
                type: 'cursorPosition',
                row: parseInt(m[1], 10),
                col: parseInt(m[2], 10),
            };
        }
        return null;
    }
    // OSC responses (e.g. OSC 11 ; rgb:... for bg color query)
    if (s.startsWith('\x1b]')) {
        var m = OSC_RESPONSE_RE.exec(s);
        if (m) {
            return { type: 'osc', code: parseInt(m[1], 10), data: m[2] };
        }
    }
    // DCS responses (e.g. XTVERSION: DCS > | name ST)
    if (s.startsWith('\x1bP')) {
        var m = XTVERSION_RE.exec(s);
        if (m) {
            return { type: 'xtversion', name: m[1] };
        }
    }
    return null;
}
function splitNumericParams(params) {
    if (!params)
        return [];
    return params.split(';').map(function (p) { return parseInt(p, 10); });
}
exports.INITIAL_STATE = {
    mode: 'NORMAL',
    incomplete: '',
    pasteBuffer: '',
};
function inputToString(input) {
    if (buffer_1.Buffer.isBuffer(input)) {
        if (input[0] > 127 && input[1] === undefined) {
            ;
            input[0] -= 128;
            return '\x1b' + String(input);
        }
        else {
            return String(input);
        }
    }
    else if (input !== undefined && typeof input !== 'string') {
        return String(input);
    }
    else if (!input) {
        return '';
    }
    else {
        return input;
    }
}
function parseMultipleKeypresses(prevState, input) {
    var _a;
    if (input === void 0) { input = ''; }
    var isFlush = input === null;
    var inputString = isFlush ? '' : inputToString(input);
    // Get or create tokenizer
    var tokenizer = (_a = prevState._tokenizer) !== null && _a !== void 0 ? _a : (0, tokenize_js_1.createTokenizer)({ x10Mouse: true });
    // Tokenize the input
    var tokens = isFlush ? tokenizer.flush() : tokenizer.feed(inputString);
    // Convert tokens to parsed keys, handling paste mode
    var keys = [];
    var inPaste = prevState.mode === 'IN_PASTE';
    var pasteBuffer = prevState.pasteBuffer;
    for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
        var token = tokens_1[_i];
        if (token.type === 'sequence') {
            if (token.value === csi_js_1.PASTE_START) {
                inPaste = true;
                pasteBuffer = '';
            }
            else if (token.value === csi_js_1.PASTE_END) {
                // Always emit a paste key, even for empty pastes. This allows
                // downstream handlers to detect empty pastes (e.g., for clipboard
                // image handling on macOS). The paste content may be empty string.
                keys.push(createPasteKey(pasteBuffer));
                inPaste = false;
                pasteBuffer = '';
            }
            else if (inPaste) {
                // Sequences inside paste are treated as literal text
                pasteBuffer += token.value;
            }
            else {
                var response = parseTerminalResponse(token.value);
                if (response) {
                    keys.push({ kind: 'response', sequence: token.value, response: response });
                }
                else {
                    var mouse = parseMouseEvent(token.value);
                    if (mouse) {
                        keys.push(mouse);
                    }
                    else {
                        keys.push(parseKeypress(token.value));
                    }
                }
            }
        }
        else if (token.type === 'text') {
            if (inPaste) {
                pasteBuffer += token.value;
            }
            else if (/^\[<\d+;\d+;\d+[Mm]$/.test(token.value) ||
                /^\[M[\x60-\x7f][\x20-\uffff]{2}$/.test(token.value)) {
                // Orphaned SGR/X10 mouse tail (fullscreen only — mouse tracking is off
                // otherwise). A heavy render blocked the event loop past App's 50ms
                // flush timer, so the buffered ESC was flushed as a lone Escape and
                // the continuation `[<btn;col;rowM` arrived as text. Re-synthesize
                // with the ESC prefix so the scroll event still fires instead of
                // leaking into the prompt. The spurious Escape is gone; App.tsx's
                // readableLength check prevents it. The X10 Cb slot is narrowed to
                // the wheel range [\x60-\x7f] (0x40|modifiers + 32) — a full [\x20-]
                // range would match typed input like `[MAX]` batched into one read
                // and silently drop it as a phantom click. Click/drag orphans leak
                // as visible garbage instead; deletable garbage beats silent loss.
                var resynthesized = '\x1b' + token.value;
                var mouse = parseMouseEvent(resynthesized);
                keys.push(mouse !== null && mouse !== void 0 ? mouse : parseKeypress(resynthesized));
            }
            else {
                keys.push(parseKeypress(token.value));
            }
        }
    }
    // If flushing and still in paste mode, emit what we have
    if (isFlush && inPaste && pasteBuffer) {
        keys.push(createPasteKey(pasteBuffer));
        inPaste = false;
        pasteBuffer = '';
    }
    // Build new state
    var newState = {
        mode: inPaste ? 'IN_PASTE' : 'NORMAL',
        incomplete: tokenizer.buffer(),
        pasteBuffer: pasteBuffer,
        _tokenizer: tokenizer,
    };
    return [keys, newState];
}
var keyName = {
    /* xterm/gnome ESC O letter */
    OP: 'f1',
    OQ: 'f2',
    OR: 'f3',
    OS: 'f4',
    /* Application keypad mode (numpad digits 0-9) */
    Op: '0',
    Oq: '1',
    Or: '2',
    Os: '3',
    Ot: '4',
    Ou: '5',
    Ov: '6',
    Ow: '7',
    Ox: '8',
    Oy: '9',
    /* Application keypad mode (numpad operators) */
    Oj: '*',
    Ok: '+',
    Ol: ',',
    Om: '-',
    On: '.',
    Oo: '/',
    OM: 'return',
    /* xterm/rxvt ESC [ number ~ */
    '[11~': 'f1',
    '[12~': 'f2',
    '[13~': 'f3',
    '[14~': 'f4',
    /* from Cygwin and used in libuv */
    '[[A': 'f1',
    '[[B': 'f2',
    '[[C': 'f3',
    '[[D': 'f4',
    '[[E': 'f5',
    /* common */
    '[15~': 'f5',
    '[17~': 'f6',
    '[18~': 'f7',
    '[19~': 'f8',
    '[20~': 'f9',
    '[21~': 'f10',
    '[23~': 'f11',
    '[24~': 'f12',
    /* xterm ESC [ letter */
    '[A': 'up',
    '[B': 'down',
    '[C': 'right',
    '[D': 'left',
    '[E': 'clear',
    '[F': 'end',
    '[H': 'home',
    /* xterm/gnome ESC O letter */
    OA: 'up',
    OB: 'down',
    OC: 'right',
    OD: 'left',
    OE: 'clear',
    OF: 'end',
    OH: 'home',
    /* xterm/rxvt ESC [ number ~ */
    '[1~': 'home',
    '[2~': 'insert',
    '[3~': 'delete',
    '[4~': 'end',
    '[5~': 'pageup',
    '[6~': 'pagedown',
    /* putty */
    '[[5~': 'pageup',
    '[[6~': 'pagedown',
    /* rxvt */
    '[7~': 'home',
    '[8~': 'end',
    /* rxvt keys with modifiers */
    '[a': 'up',
    '[b': 'down',
    '[c': 'right',
    '[d': 'left',
    '[e': 'clear',
    '[2$': 'insert',
    '[3$': 'delete',
    '[5$': 'pageup',
    '[6$': 'pagedown',
    '[7$': 'home',
    '[8$': 'end',
    Oa: 'up',
    Ob: 'down',
    Oc: 'right',
    Od: 'left',
    Oe: 'clear',
    '[2^': 'insert',
    '[3^': 'delete',
    '[5^': 'pageup',
    '[6^': 'pagedown',
    '[7^': 'home',
    '[8^': 'end',
    /* misc. */
    '[Z': 'tab',
};
exports.nonAlphanumericKeys = __spreadArray(__spreadArray([], Object.values(keyName).filter(function (v) { return v.length > 1; }), true), [
    // escape and backspace are assigned directly in parseKeypress (not via the
    // keyName map), so the spread above misses them. Without these, ctrl+escape
    // via Kitty/modifyOtherKeys leaks the literal word "escape" as input text
    // (input-event.ts:58 assigns keypress.name when ctrl is set).
    'escape',
    'backspace',
    'wheelup',
    'wheeldown',
    'mouse',
], false);
var isShiftKey = function (code) {
    return [
        '[a',
        '[b',
        '[c',
        '[d',
        '[e',
        '[2$',
        '[3$',
        '[5$',
        '[6$',
        '[7$',
        '[8$',
        '[Z',
    ].includes(code);
};
var isCtrlKey = function (code) {
    return [
        'Oa',
        'Ob',
        'Oc',
        'Od',
        'Oe',
        '[2^',
        '[3^',
        '[5^',
        '[6^',
        '[7^',
        '[8^',
    ].includes(code);
};
/**
 * Decode XTerm-style modifier value to individual flags.
 * Modifier encoding: 1 + (shift ? 1 : 0) + (alt ? 2 : 0) + (ctrl ? 4 : 0) + (super ? 8 : 0)
 *
 * Note: `meta` here means Alt/Option (bit 2). `super` is a distinct
 * modifier (bit 8, i.e. Cmd on macOS / Win key). Most legacy terminal
 * sequences can't express super — it only arrives via kitty keyboard
 * protocol (CSI u) or xterm modifyOtherKeys.
 */
function decodeModifier(modifier) {
    var m = modifier - 1;
    return {
        shift: !!(m & 1),
        meta: !!(m & 2),
        ctrl: !!(m & 4),
        super: !!(m & 8),
    };
}
/**
 * Map keycode to key name for modifyOtherKeys/CSI u sequences.
 * Handles both ASCII keycodes and Kitty keyboard protocol functional keys.
 *
 * Numpad codepoints are from Unicode Private Use Area, defined at:
 * https://sw.kovidgoyal.net/kitty/keyboard-protocol/#functional-key-definitions
 */
function keycodeToName(keycode) {
    switch (keycode) {
        case 9:
            return 'tab';
        case 13:
            return 'return';
        case 27:
            return 'escape';
        case 32:
            return 'space';
        case 127:
            return 'backspace';
        // Kitty keyboard protocol numpad keys (KP_0 through KP_9)
        case 57399:
            return '0';
        case 57400:
            return '1';
        case 57401:
            return '2';
        case 57402:
            return '3';
        case 57403:
            return '4';
        case 57404:
            return '5';
        case 57405:
            return '6';
        case 57406:
            return '7';
        case 57407:
            return '8';
        case 57408:
            return '9';
        case 57409: // KP_DECIMAL
            return '.';
        case 57410: // KP_DIVIDE
            return '/';
        case 57411: // KP_MULTIPLY
            return '*';
        case 57412: // KP_SUBTRACT
            return '-';
        case 57413: // KP_ADD
            return '+';
        case 57414: // KP_ENTER
            return 'return';
        case 57415: // KP_EQUAL
            return '=';
        default:
            // Printable ASCII characters
            if (keycode >= 32 && keycode <= 126) {
                return String.fromCharCode(keycode).toLowerCase();
            }
            return undefined;
    }
}
/**
 * Parse an SGR mouse event sequence into a ParsedMouse, or null if not a
 * mouse event or if it's a wheel event (wheel stays as ParsedKey for the
 * keybinding system). Button bit 0x40 = wheel, bit 0x20 = drag/motion.
 */
function parseMouseEvent(s) {
    var match = SGR_MOUSE_RE.exec(s);
    if (!match)
        return null;
    var button = parseInt(match[1], 10);
    // Wheel events (bit 6 set, low bits 0/1 for up/down) stay as ParsedKey
    // so the keybinding system can route them to scroll handlers.
    if ((button & 0x40) !== 0)
        return null;
    return {
        kind: 'mouse',
        button: button,
        action: match[4] === 'M' ? 'press' : 'release',
        col: parseInt(match[2], 10),
        row: parseInt(match[3], 10),
        sequence: s,
    };
}
function parseKeypress(s) {
    if (s === void 0) { s = ''; }
    var parts;
    var key = {
        kind: 'key',
        name: '',
        fn: false,
        ctrl: false,
        meta: false,
        shift: false,
        option: false,
        super: false,
        sequence: s,
        raw: s,
        isPasted: false,
    };
    key.sequence = key.sequence || s || key.name;
    // Handle CSI u (kitty keyboard protocol): ESC [ codepoint [; modifier] u
    // Example: ESC[13;2u = Shift+Enter, ESC[27u = Escape (no modifiers)
    var match;
    if ((match = CSI_U_RE.exec(s))) {
        var codepoint = parseInt(match[1], 10);
        // Modifier defaults to 1 (no modifiers) when not present
        var modifier = match[2] ? parseInt(match[2], 10) : 1;
        var mods = decodeModifier(modifier);
        var name_1 = keycodeToName(codepoint);
        return {
            kind: 'key',
            name: name_1,
            fn: false,
            ctrl: mods.ctrl,
            meta: mods.meta,
            shift: mods.shift,
            option: false,
            super: mods.super,
            sequence: s,
            raw: s,
            isPasted: false,
        };
    }
    // Handle xterm modifyOtherKeys: ESC [ 27 ; modifier ; keycode ~
    // Must run before FN_KEY_RE — FN_KEY_RE only allows 2 params before ~ and
    // would leave the tail as garbage if it partially matched.
    if ((match = MODIFY_OTHER_KEYS_RE.exec(s))) {
        var mods = decodeModifier(parseInt(match[1], 10));
        var name_2 = keycodeToName(parseInt(match[2], 10));
        return {
            kind: 'key',
            name: name_2,
            fn: false,
            ctrl: mods.ctrl,
            meta: mods.meta,
            shift: mods.shift,
            option: false,
            super: mods.super,
            sequence: s,
            raw: s,
            isPasted: false,
        };
    }
    // SGR mouse wheel events. Click/drag/release events are handled
    // earlier by parseMouseEvent and emitted as ParsedMouse, so they
    // never reach here. Mask with 0x43 (bits 6+1+0) to check wheel-flag
    // + direction while ignoring modifier bits (Shift=0x04, Meta=0x08,
    // Ctrl=0x10) — modified wheel events (e.g. Ctrl+scroll, button=80)
    // should still be recognized as wheelup/wheeldown.
    if ((match = SGR_MOUSE_RE.exec(s))) {
        var button = parseInt(match[1], 10);
        if ((button & 0x43) === 0x40)
            return createNavKey(s, 'wheelup', false);
        if ((button & 0x43) === 0x41)
            return createNavKey(s, 'wheeldown', false);
        // Shouldn't reach here (parseMouseEvent catches non-wheel) but be safe
        return createNavKey(s, 'mouse', false);
    }
    // X10 mouse: CSI M + 3 raw bytes (Cb+32, Cx+32, Cy+32). Terminals that
    // ignore DECSET 1006 (SGR) but honor 1000/1002 emit this legacy encoding.
    // Button bits match SGR: 0x40 = wheel, low bit = direction. Non-wheel
    // X10 events (clicks/drags) are swallowed here — we only enable mouse
    // tracking in alt-screen and only need wheel for ScrollBox.
    if (s.length === 6 && s.startsWith('\x1b[M')) {
        var button = s.charCodeAt(3) - 32;
        if ((button & 0x43) === 0x40)
            return createNavKey(s, 'wheelup', false);
        if ((button & 0x43) === 0x41)
            return createNavKey(s, 'wheeldown', false);
        return createNavKey(s, 'mouse', false);
    }
    if (s === '\r') {
        key.raw = undefined;
        key.name = 'return';
    }
    else if (s === '\n') {
        key.name = 'enter';
    }
    else if (s === '\t') {
        key.name = 'tab';
    }
    else if (s === '\b' || s === '\x1b\b') {
        key.name = 'backspace';
        key.meta = s.charAt(0) === '\x1b';
    }
    else if (s === '\x7f' || s === '\x1b\x7f') {
        key.name = 'backspace';
        key.meta = s.charAt(0) === '\x1b';
    }
    else if (s === '\x1b' || s === '\x1b\x1b') {
        key.name = 'escape';
        key.meta = s.length === 2;
    }
    else if (s === ' ' || s === '\x1b ') {
        key.name = 'space';
        key.meta = s.length === 2;
    }
    else if (s === '\x1f') {
        key.name = '_';
        key.ctrl = true;
    }
    else if (s <= '\x1a' && s.length === 1) {
        key.name = String.fromCharCode(s.charCodeAt(0) + 'a'.charCodeAt(0) - 1);
        key.ctrl = true;
    }
    else if (s.length === 1 && s >= '0' && s <= '9') {
        key.name = 'number';
    }
    else if (s.length === 1 && s >= 'a' && s <= 'z') {
        key.name = s;
    }
    else if (s.length === 1 && s >= 'A' && s <= 'Z') {
        key.name = s.toLowerCase();
        key.shift = true;
    }
    else if ((parts = META_KEY_CODE_RE.exec(s))) {
        key.meta = true;
        key.shift = /^[A-Z]$/.test(parts[1]);
    }
    else if ((parts = FN_KEY_RE.exec(s))) {
        var segs = __spreadArray([], s, true);
        if (segs[0] === '\u001b' && segs[1] === '\u001b') {
            key.option = true;
        }
        var code = [parts[1], parts[2], parts[4], parts[6]]
            .filter(Boolean)
            .join('');
        var modifier = (parts[3] || parts[5] || 1) - 1;
        key.ctrl = !!(modifier & 4);
        key.meta = !!(modifier & 2);
        key.super = !!(modifier & 8);
        key.shift = !!(modifier & 1);
        key.code = code;
        key.name = keyName[code];
        key.shift = isShiftKey(code) || key.shift;
        key.ctrl = isCtrlKey(code) || key.ctrl;
    }
    // iTerm in natural text editing mode
    if (key.raw === '\x1Bb') {
        key.meta = true;
        key.name = 'left';
    }
    else if (key.raw === '\x1Bf') {
        key.meta = true;
        key.name = 'right';
    }
    switch (s) {
        case '\u001b[1~':
            return createNavKey(s, 'home', false);
        case '\u001b[4~':
            return createNavKey(s, 'end', false);
        case '\u001b[5~':
            return createNavKey(s, 'pageup', false);
        case '\u001b[6~':
            return createNavKey(s, 'pagedown', false);
        case '\u001b[1;5D':
            return createNavKey(s, 'left', true);
        case '\u001b[1;5C':
            return createNavKey(s, 'right', true);
    }
    return key;
}
function createNavKey(s, name, ctrl) {
    return {
        kind: 'key',
        name: name,
        ctrl: ctrl,
        meta: false,
        shift: false,
        option: false,
        super: false,
        fn: false,
        sequence: s,
        raw: s,
        isPasted: false,
    };
}
