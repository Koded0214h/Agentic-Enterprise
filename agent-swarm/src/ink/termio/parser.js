"use strict";
/**
 * ANSI Parser - Semantic Action Generator
 *
 * A streaming parser for ANSI escape sequences that produces semantic actions.
 * Uses the tokenizer for escape sequence boundary detection, then interprets
 * each sequence to produce structured actions.
 *
 * Key design decisions:
 * - Streaming: can process input incrementally
 * - Semantic output: produces structured actions, not string tokens
 * - Style tracking: maintains current text style state
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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
exports.Parser = void 0;
var intl_js_1 = require("../../utils/intl.js");
var ansi_js_1 = require("./ansi.js");
var csi_js_1 = require("./csi.js");
var dec_js_1 = require("./dec.js");
var esc_js_1 = require("./esc.js");
var osc_js_1 = require("./osc.js");
var sgr_js_1 = require("./sgr.js");
var tokenize_js_1 = require("./tokenize.js");
var types_js_1 = require("./types.js");
// =============================================================================
// Grapheme Utilities
// =============================================================================
function isEmoji(codePoint) {
    return ((codePoint >= 0x2600 && codePoint <= 0x26ff) ||
        (codePoint >= 0x2700 && codePoint <= 0x27bf) ||
        (codePoint >= 0x1f300 && codePoint <= 0x1f9ff) ||
        (codePoint >= 0x1fa00 && codePoint <= 0x1faff) ||
        (codePoint >= 0x1f1e0 && codePoint <= 0x1f1ff));
}
function isEastAsianWide(codePoint) {
    return ((codePoint >= 0x1100 && codePoint <= 0x115f) ||
        (codePoint >= 0x2e80 && codePoint <= 0x9fff) ||
        (codePoint >= 0xac00 && codePoint <= 0xd7a3) ||
        (codePoint >= 0xf900 && codePoint <= 0xfaff) ||
        (codePoint >= 0xfe10 && codePoint <= 0xfe1f) ||
        (codePoint >= 0xfe30 && codePoint <= 0xfe6f) ||
        (codePoint >= 0xff00 && codePoint <= 0xff60) ||
        (codePoint >= 0xffe0 && codePoint <= 0xffe6) ||
        (codePoint >= 0x20000 && codePoint <= 0x2fffd) ||
        (codePoint >= 0x30000 && codePoint <= 0x3fffd));
}
function hasMultipleCodepoints(str) {
    var count = 0;
    for (var _i = 0, str_1 = str; _i < str_1.length; _i++) {
        var _1 = str_1[_i];
        count++;
        if (count > 1)
            return true;
    }
    return false;
}
function graphemeWidth(grapheme) {
    if (hasMultipleCodepoints(grapheme))
        return 2;
    var codePoint = grapheme.codePointAt(0);
    if (codePoint === undefined)
        return 1;
    if (isEmoji(codePoint) || isEastAsianWide(codePoint))
        return 2;
    return 1;
}
function segmentGraphemes(str) {
    var _i, _a, segment;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _i = 0, _a = (0, intl_js_1.getGraphemeSegmenter)().segment(str);
                _b.label = 1;
            case 1:
                if (!(_i < _a.length)) return [3 /*break*/, 4];
                segment = _a[_i].segment;
                return [4 /*yield*/, { value: segment, width: graphemeWidth(segment) }];
            case 2:
                _b.sent();
                _b.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
    });
}
// =============================================================================
// Sequence Parsing
// =============================================================================
function parseCSIParams(paramStr) {
    if (paramStr === '')
        return [];
    return paramStr.split(/[;:]/).map(function (s) { return (s === '' ? 0 : parseInt(s, 10)); });
}
/** Parse a raw CSI sequence (e.g., "\x1b[31m") into an action */
function parseCSI(rawSequence) {
    var _a, _b, _c, _d, _e, _f, _g;
    var inner = rawSequence.slice(2);
    if (inner.length === 0)
        return null;
    var finalByte = inner.charCodeAt(inner.length - 1);
    var beforeFinal = inner.slice(0, -1);
    var privateMode = '';
    var paramStr = beforeFinal;
    var intermediate = '';
    if (beforeFinal.length > 0 && '?>='.includes(beforeFinal[0])) {
        privateMode = beforeFinal[0];
        paramStr = beforeFinal.slice(1);
    }
    var intermediateMatch = paramStr.match(/([^0-9;:]+)$/);
    if (intermediateMatch) {
        intermediate = intermediateMatch[1];
        paramStr = paramStr.slice(0, -intermediate.length);
    }
    var params = parseCSIParams(paramStr);
    var p0 = (_a = params[0]) !== null && _a !== void 0 ? _a : 1;
    var p1 = (_b = params[1]) !== null && _b !== void 0 ? _b : 1;
    // SGR (Select Graphic Rendition)
    if (finalByte === csi_js_1.CSI.SGR && privateMode === '') {
        return { type: 'sgr', params: paramStr };
    }
    // Cursor movement
    if (finalByte === csi_js_1.CSI.CUU) {
        return {
            type: 'cursor',
            action: { type: 'move', direction: 'up', count: p0 },
        };
    }
    if (finalByte === csi_js_1.CSI.CUD) {
        return {
            type: 'cursor',
            action: { type: 'move', direction: 'down', count: p0 },
        };
    }
    if (finalByte === csi_js_1.CSI.CUF) {
        return {
            type: 'cursor',
            action: { type: 'move', direction: 'forward', count: p0 },
        };
    }
    if (finalByte === csi_js_1.CSI.CUB) {
        return {
            type: 'cursor',
            action: { type: 'move', direction: 'back', count: p0 },
        };
    }
    if (finalByte === csi_js_1.CSI.CNL) {
        return { type: 'cursor', action: { type: 'nextLine', count: p0 } };
    }
    if (finalByte === csi_js_1.CSI.CPL) {
        return { type: 'cursor', action: { type: 'prevLine', count: p0 } };
    }
    if (finalByte === csi_js_1.CSI.CHA) {
        return { type: 'cursor', action: { type: 'column', col: p0 } };
    }
    if (finalByte === csi_js_1.CSI.CUP || finalByte === csi_js_1.CSI.HVP) {
        return { type: 'cursor', action: { type: 'position', row: p0, col: p1 } };
    }
    if (finalByte === csi_js_1.CSI.VPA) {
        return { type: 'cursor', action: { type: 'row', row: p0 } };
    }
    // Erase
    if (finalByte === csi_js_1.CSI.ED) {
        var region = (_d = csi_js_1.ERASE_DISPLAY[(_c = params[0]) !== null && _c !== void 0 ? _c : 0]) !== null && _d !== void 0 ? _d : 'toEnd';
        return { type: 'erase', action: { type: 'display', region: region } };
    }
    if (finalByte === csi_js_1.CSI.EL) {
        var region = (_f = csi_js_1.ERASE_LINE_REGION[(_e = params[0]) !== null && _e !== void 0 ? _e : 0]) !== null && _f !== void 0 ? _f : 'toEnd';
        return { type: 'erase', action: { type: 'line', region: region } };
    }
    if (finalByte === csi_js_1.CSI.ECH) {
        return { type: 'erase', action: { type: 'chars', count: p0 } };
    }
    // Scroll
    if (finalByte === csi_js_1.CSI.SU) {
        return { type: 'scroll', action: { type: 'up', count: p0 } };
    }
    if (finalByte === csi_js_1.CSI.SD) {
        return { type: 'scroll', action: { type: 'down', count: p0 } };
    }
    if (finalByte === csi_js_1.CSI.DECSTBM) {
        return {
            type: 'scroll',
            action: { type: 'setRegion', top: p0, bottom: p1 },
        };
    }
    // Cursor save/restore
    if (finalByte === csi_js_1.CSI.SCOSC) {
        return { type: 'cursor', action: { type: 'save' } };
    }
    if (finalByte === csi_js_1.CSI.SCORC) {
        return { type: 'cursor', action: { type: 'restore' } };
    }
    // Cursor style
    if (finalByte === csi_js_1.CSI.DECSCUSR && intermediate === ' ') {
        var styleInfo = (_g = csi_js_1.CURSOR_STYLES[p0]) !== null && _g !== void 0 ? _g : csi_js_1.CURSOR_STYLES[0];
        return { type: 'cursor', action: __assign({ type: 'style' }, styleInfo) };
    }
    // Private modes
    if (privateMode === '?' && (finalByte === csi_js_1.CSI.SM || finalByte === csi_js_1.CSI.RM)) {
        var enabled = finalByte === csi_js_1.CSI.SM;
        if (p0 === dec_js_1.DEC.CURSOR_VISIBLE) {
            return {
                type: 'cursor',
                action: enabled ? { type: 'show' } : { type: 'hide' },
            };
        }
        if (p0 === dec_js_1.DEC.ALT_SCREEN_CLEAR || p0 === dec_js_1.DEC.ALT_SCREEN) {
            return { type: 'mode', action: { type: 'alternateScreen', enabled: enabled } };
        }
        if (p0 === dec_js_1.DEC.BRACKETED_PASTE) {
            return { type: 'mode', action: { type: 'bracketedPaste', enabled: enabled } };
        }
        if (p0 === dec_js_1.DEC.MOUSE_NORMAL) {
            return {
                type: 'mode',
                action: { type: 'mouseTracking', mode: enabled ? 'normal' : 'off' },
            };
        }
        if (p0 === dec_js_1.DEC.MOUSE_BUTTON) {
            return {
                type: 'mode',
                action: { type: 'mouseTracking', mode: enabled ? 'button' : 'off' },
            };
        }
        if (p0 === dec_js_1.DEC.MOUSE_ANY) {
            return {
                type: 'mode',
                action: { type: 'mouseTracking', mode: enabled ? 'any' : 'off' },
            };
        }
        if (p0 === dec_js_1.DEC.FOCUS_EVENTS) {
            return { type: 'mode', action: { type: 'focusEvents', enabled: enabled } };
        }
    }
    return { type: 'unknown', sequence: rawSequence };
}
/**
 * Identify the type of escape sequence from its raw form.
 */
function identifySequence(seq) {
    if (seq.length < 2)
        return 'unknown';
    if (seq.charCodeAt(0) !== ansi_js_1.C0.ESC)
        return 'unknown';
    var second = seq.charCodeAt(1);
    if (second === 0x5b)
        return 'csi'; // [
    if (second === 0x5d)
        return 'osc'; // ]
    if (second === 0x4f)
        return 'ss3'; // O
    return 'esc';
}
// =============================================================================
// Main Parser
// =============================================================================
/**
 * Parser class - maintains state for streaming/incremental parsing
 *
 * Usage:
 * ```typescript
 * const parser = new Parser()
 * const actions1 = parser.feed('partial\x1b[')
 * const actions2 = parser.feed('31mred')  // state maintained internally
 * ```
 */
var Parser = /** @class */ (function () {
    function Parser() {
        this.tokenizer = (0, tokenize_js_1.createTokenizer)();
        this.style = (0, types_js_1.defaultStyle)();
        this.inLink = false;
    }
    Parser.prototype.reset = function () {
        this.tokenizer.reset();
        this.style = (0, types_js_1.defaultStyle)();
        this.inLink = false;
        this.linkUrl = undefined;
    };
    /** Feed input and get resulting actions */
    Parser.prototype.feed = function (input) {
        var tokens = this.tokenizer.feed(input);
        var actions = [];
        for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
            var token = tokens_1[_i];
            var tokenActions = this.processToken(token);
            actions.push.apply(actions, tokenActions);
        }
        return actions;
    };
    Parser.prototype.processToken = function (token) {
        switch (token.type) {
            case 'text':
                return this.processText(token.value);
            case 'sequence':
                return this.processSequence(token.value);
        }
    };
    Parser.prototype.processText = function (text) {
        // Handle BEL characters embedded in text
        var actions = [];
        var current = '';
        for (var _i = 0, text_1 = text; _i < text_1.length; _i++) {
            var char = text_1[_i];
            if (char.charCodeAt(0) === ansi_js_1.C0.BEL) {
                if (current) {
                    var graphemes = __spreadArray([], segmentGraphemes(current), true);
                    if (graphemes.length > 0) {
                        actions.push({ type: 'text', graphemes: graphemes, style: __assign({}, this.style) });
                    }
                    current = '';
                }
                actions.push({ type: 'bell' });
            }
            else {
                current += char;
            }
        }
        if (current) {
            var graphemes = __spreadArray([], segmentGraphemes(current), true);
            if (graphemes.length > 0) {
                actions.push({ type: 'text', graphemes: graphemes, style: __assign({}, this.style) });
            }
        }
        return actions;
    };
    Parser.prototype.processSequence = function (seq) {
        var seqType = identifySequence(seq);
        switch (seqType) {
            case 'csi': {
                var action = parseCSI(seq);
                if (!action)
                    return [];
                if (action.type === 'sgr') {
                    this.style = (0, sgr_js_1.applySGR)(action.params, this.style);
                    return [];
                }
                return [action];
            }
            case 'osc': {
                // Extract OSC content (between ESC ] and terminator)
                var content = seq.slice(2);
                // Remove terminator (BEL or ESC \)
                if (content.endsWith('\x07')) {
                    content = content.slice(0, -1);
                }
                else if (content.endsWith('\x1b\\')) {
                    content = content.slice(0, -2);
                }
                var action = (0, osc_js_1.parseOSC)(content);
                if (action) {
                    if (action.type === 'link') {
                        if (action.action.type === 'start') {
                            this.inLink = true;
                            this.linkUrl = action.action.url;
                        }
                        else {
                            this.inLink = false;
                            this.linkUrl = undefined;
                        }
                    }
                    return [action];
                }
                return [];
            }
            case 'esc': {
                var escContent = seq.slice(1);
                var action = (0, esc_js_1.parseEsc)(escContent);
                return action ? [action] : [];
            }
            case 'ss3':
                // SS3 sequences are typically cursor keys in application mode
                // For output parsing, treat as unknown
                return [{ type: 'unknown', sequence: seq }];
            default:
                return [{ type: 'unknown', sequence: seq }];
        }
    };
    return Parser;
}());
exports.Parser = Parser;
