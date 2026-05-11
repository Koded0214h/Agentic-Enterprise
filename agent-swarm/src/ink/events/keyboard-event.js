"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyboardEvent = void 0;
var terminal_event_js_1 = require("./terminal-event.js");
/**
 * Keyboard event dispatched through the DOM tree via capture/bubble.
 *
 * Follows browser KeyboardEvent semantics: `key` is the literal character
 * for printable keys ('a', '3', ' ', '/') and a multi-char name for
 * special keys ('down', 'return', 'escape', 'f1'). The idiomatic
 * printable-char check is `e.key.length === 1`.
 */
var KeyboardEvent = /** @class */ (function (_super) {
    __extends(KeyboardEvent, _super);
    function KeyboardEvent(parsedKey) {
        var _this = _super.call(this, 'keydown', { bubbles: true, cancelable: true }) || this;
        _this.key = keyFromParsed(parsedKey);
        _this.ctrl = parsedKey.ctrl;
        _this.shift = parsedKey.shift;
        _this.meta = parsedKey.meta || parsedKey.option;
        _this.superKey = parsedKey.super;
        _this.fn = parsedKey.fn;
        return _this;
    }
    return KeyboardEvent;
}(terminal_event_js_1.TerminalEvent));
exports.KeyboardEvent = KeyboardEvent;
function keyFromParsed(parsed) {
    var _a, _b;
    var seq = (_a = parsed.sequence) !== null && _a !== void 0 ? _a : '';
    var name = (_b = parsed.name) !== null && _b !== void 0 ? _b : '';
    // Ctrl combos: sequence is a control byte (\x03 for ctrl+c), name is the
    // letter. Browsers report e.key === 'c' with e.ctrlKey === true.
    if (parsed.ctrl)
        return name;
    // Single printable char (space through ~, plus anything above ASCII):
    // use the literal char. Browsers report e.key === '3', not 'Digit3'.
    if (seq.length === 1) {
        var code = seq.charCodeAt(0);
        if (code >= 0x20 && code !== 0x7f)
            return seq;
    }
    // Special keys (arrows, F-keys, return, tab, escape, etc.): sequence is
    // either an escape sequence (\x1b[B) or a control byte (\r, \t), so use
    // the parsed name. Browsers report e.key === 'ArrowDown'.
    return name || seq;
}
