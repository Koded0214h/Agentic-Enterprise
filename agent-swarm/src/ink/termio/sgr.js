"use strict";
/**
 * SGR (Select Graphic Rendition) Parser
 *
 * Parses SGR parameters and applies them to a TextStyle.
 * Handles both semicolon (;) and colon (:) separated parameters.
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
exports.applySGR = applySGR;
var types_js_1 = require("./types.js");
var NAMED_COLORS = [
    'black',
    'red',
    'green',
    'yellow',
    'blue',
    'magenta',
    'cyan',
    'white',
    'brightBlack',
    'brightRed',
    'brightGreen',
    'brightYellow',
    'brightBlue',
    'brightMagenta',
    'brightCyan',
    'brightWhite',
];
var UNDERLINE_STYLES = [
    'none',
    'single',
    'double',
    'curly',
    'dotted',
    'dashed',
];
function parseParams(str) {
    if (str === '')
        return [{ value: 0, subparams: [], colon: false }];
    var result = [];
    var current = { value: null, subparams: [], colon: false };
    var num = '';
    var inSub = false;
    for (var i = 0; i <= str.length; i++) {
        var c = str[i];
        if (c === ';' || c === undefined) {
            var n = num === '' ? null : parseInt(num, 10);
            if (inSub) {
                if (n !== null)
                    current.subparams.push(n);
            }
            else {
                current.value = n;
            }
            result.push(current);
            current = { value: null, subparams: [], colon: false };
            num = '';
            inSub = false;
        }
        else if (c === ':') {
            var n = num === '' ? null : parseInt(num, 10);
            if (!inSub) {
                current.value = n;
                current.colon = true;
                inSub = true;
            }
            else {
                if (n !== null)
                    current.subparams.push(n);
            }
            num = '';
        }
        else if (c >= '0' && c <= '9') {
            num += c;
        }
    }
    return result;
}
function parseExtendedColor(params, idx) {
    var _a, _b, _c, _d, _e;
    var p = params[idx];
    if (!p)
        return null;
    if (p.colon && p.subparams.length >= 1) {
        if (p.subparams[0] === 5 && p.subparams.length >= 2) {
            return { index: p.subparams[1] };
        }
        if (p.subparams[0] === 2 && p.subparams.length >= 4) {
            var off = p.subparams.length >= 5 ? 1 : 0;
            return {
                r: p.subparams[1 + off],
                g: p.subparams[2 + off],
                b: p.subparams[3 + off],
            };
        }
    }
    var next = params[idx + 1];
    if (!next)
        return null;
    if (next.value === 5 &&
        ((_a = params[idx + 2]) === null || _a === void 0 ? void 0 : _a.value) !== null &&
        ((_b = params[idx + 2]) === null || _b === void 0 ? void 0 : _b.value) !== undefined) {
        return { index: params[idx + 2].value };
    }
    if (next.value === 2) {
        var r = (_c = params[idx + 2]) === null || _c === void 0 ? void 0 : _c.value;
        var g = (_d = params[idx + 3]) === null || _d === void 0 ? void 0 : _d.value;
        var b = (_e = params[idx + 4]) === null || _e === void 0 ? void 0 : _e.value;
        if (r !== null &&
            r !== undefined &&
            g !== null &&
            g !== undefined &&
            b !== null &&
            b !== undefined) {
            return { r: r, g: g, b: b };
        }
    }
    return null;
}
function applySGR(paramStr, style) {
    var _a, _b;
    var params = parseParams(paramStr);
    var s = __assign({}, style);
    var i = 0;
    while (i < params.length) {
        var p = params[i];
        var code = (_a = p.value) !== null && _a !== void 0 ? _a : 0;
        if (code === 0) {
            s = (0, types_js_1.defaultStyle)();
            i++;
            continue;
        }
        if (code === 1) {
            s.bold = true;
            i++;
            continue;
        }
        if (code === 2) {
            s.dim = true;
            i++;
            continue;
        }
        if (code === 3) {
            s.italic = true;
            i++;
            continue;
        }
        if (code === 4) {
            s.underline = p.colon
                ? ((_b = UNDERLINE_STYLES[p.subparams[0]]) !== null && _b !== void 0 ? _b : 'single')
                : 'single';
            i++;
            continue;
        }
        if (code === 5 || code === 6) {
            s.blink = true;
            i++;
            continue;
        }
        if (code === 7) {
            s.inverse = true;
            i++;
            continue;
        }
        if (code === 8) {
            s.hidden = true;
            i++;
            continue;
        }
        if (code === 9) {
            s.strikethrough = true;
            i++;
            continue;
        }
        if (code === 21) {
            s.underline = 'double';
            i++;
            continue;
        }
        if (code === 22) {
            s.bold = false;
            s.dim = false;
            i++;
            continue;
        }
        if (code === 23) {
            s.italic = false;
            i++;
            continue;
        }
        if (code === 24) {
            s.underline = 'none';
            i++;
            continue;
        }
        if (code === 25) {
            s.blink = false;
            i++;
            continue;
        }
        if (code === 27) {
            s.inverse = false;
            i++;
            continue;
        }
        if (code === 28) {
            s.hidden = false;
            i++;
            continue;
        }
        if (code === 29) {
            s.strikethrough = false;
            i++;
            continue;
        }
        if (code === 53) {
            s.overline = true;
            i++;
            continue;
        }
        if (code === 55) {
            s.overline = false;
            i++;
            continue;
        }
        if (code >= 30 && code <= 37) {
            s.fg = { type: 'named', name: NAMED_COLORS[code - 30] };
            i++;
            continue;
        }
        if (code === 39) {
            s.fg = { type: 'default' };
            i++;
            continue;
        }
        if (code >= 40 && code <= 47) {
            s.bg = { type: 'named', name: NAMED_COLORS[code - 40] };
            i++;
            continue;
        }
        if (code === 49) {
            s.bg = { type: 'default' };
            i++;
            continue;
        }
        if (code >= 90 && code <= 97) {
            s.fg = { type: 'named', name: NAMED_COLORS[code - 90 + 8] };
            i++;
            continue;
        }
        if (code >= 100 && code <= 107) {
            s.bg = { type: 'named', name: NAMED_COLORS[code - 100 + 8] };
            i++;
            continue;
        }
        if (code === 38) {
            var c = parseExtendedColor(params, i);
            if (c) {
                s.fg =
                    'index' in c
                        ? { type: 'indexed', index: c.index }
                        : __assign({ type: 'rgb' }, c);
                i += p.colon ? 1 : 'index' in c ? 3 : 5;
                continue;
            }
        }
        if (code === 48) {
            var c = parseExtendedColor(params, i);
            if (c) {
                s.bg =
                    'index' in c
                        ? { type: 'indexed', index: c.index }
                        : __assign({ type: 'rgb' }, c);
                i += p.colon ? 1 : 'index' in c ? 3 : 5;
                continue;
            }
        }
        if (code === 58) {
            var c = parseExtendedColor(params, i);
            if (c) {
                s.underlineColor =
                    'index' in c
                        ? { type: 'indexed', index: c.index }
                        : __assign({ type: 'rgb' }, c);
                i += p.colon ? 1 : 'index' in c ? 3 : 5;
                continue;
            }
        }
        if (code === 59) {
            s.underlineColor = { type: 'default' };
            i++;
            continue;
        }
        i++;
    }
    return s;
}
