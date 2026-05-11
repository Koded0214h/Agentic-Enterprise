"use strict";
/**
 * Pure TypeScript port of vendor/color-diff-src.
 *
 * The Rust version uses syntect+bat for syntax highlighting and the similar
 * crate for word diffing. This port uses highlight.js (already a dep via
 * cli-highlight) and the diff npm package's diffArrays.
 *
 * API matches vendor/color-diff-src/index.d.ts exactly so callers don't change.
 *
 * Key semantic differences from the native module:
 * - Syntax highlighting uses highlight.js. Scope colors were measured from
 *   syntect's output so most tokens match, but hljs's grammar has gaps:
 *   plain identifiers and operators like `=` `:` aren't scoped, so they
 *   render in default fg instead of white/pink. Output structure (line
 *   numbers, markers, backgrounds, word-diff) is identical.
 * - BAT_THEME env support is a stub: highlight.js has no bat theme set, so
 *   getSyntaxTheme always returns the default for the given Claude theme.
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
exports.__test = exports.ColorFile = exports.ColorDiff = void 0;
exports.getSyntaxTheme = getSyntaxTheme;
exports.getNativeModule = getNativeModule;
var diff_1 = require("diff");
var path_1 = require("path");
var cachedHljs = null;
function hljs() {
    if (cachedHljs)
        return cachedHljs;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    var mod = require('highlight.js');
    // highlight.js uses `export =` (CJS). Under bun/ESM the interop wraps it
    // in .default; under node CJS the module IS the API. Check at runtime.
    cachedHljs = 'default' in mod && mod.default ? mod.default : mod;
    return cachedHljs;
}
var stringWidth_js_1 = require("../../ink/stringWidth.js");
var log_js_1 = require("../../utils/log.js");
var RESET = '\x1b[0m';
var DIM = '\x1b[2m';
var UNDIM = '\x1b[22m';
function rgb(r, g, b) {
    return { r: r, g: g, b: b, a: 255 };
}
function ansiIdx(index) {
    return { r: index, g: 0, b: 0, a: 0 };
}
// Sentinel: a=1 means "terminal default" (matches bat convention)
var DEFAULT_BG = { r: 0, g: 0, b: 0, a: 1 };
function detectColorMode(theme) {
    var _a;
    if (theme.includes('ansi'))
        return 'ansi';
    var ct = (_a = process.env.COLORTERM) !== null && _a !== void 0 ? _a : '';
    return ct === 'truecolor' || ct === '24bit' ? 'truecolor' : 'color256';
}
// Port of ansi_colours::ansi256_from_rgb — approximates RGB to the xterm-256
// palette (6x6x6 cube + 24 greys). Picks the perceptually closest index by
// comparing cube vs grey-ramp candidates, like the Rust crate.
var CUBE_LEVELS = [0, 95, 135, 175, 215, 255];
function ansi256FromRgb(r, g, b) {
    var q = function (c) {
        return c < 48 ? 0 : c < 115 ? 1 : c < 155 ? 2 : c < 195 ? 3 : c < 235 ? 4 : 5;
    };
    var qr = q(r);
    var qg = q(g);
    var qb = q(b);
    var cubeIdx = 16 + 36 * qr + 6 * qg + qb;
    // Grey ramp candidate (232-255, levels 8..238 step 10). Beyond the ramp's
    // range the cube corner is the only option — ansi_colours snaps 248,248,242
    // to 231 (cube white), not 255 (ramp top).
    var grey = Math.round((r + g + b) / 3);
    if (grey < 5)
        return 16;
    if (grey > 244 && qr === qg && qg === qb)
        return cubeIdx;
    var greyLevel = Math.max(0, Math.min(23, Math.round((grey - 8) / 10)));
    var greyIdx = 232 + greyLevel;
    var greyRgb = 8 + greyLevel * 10;
    var cr = CUBE_LEVELS[qr];
    var cg = CUBE_LEVELS[qg];
    var cb = CUBE_LEVELS[qb];
    var dCube = Math.pow((r - cr), 2) + Math.pow((g - cg), 2) + Math.pow((b - cb), 2);
    var dGrey = Math.pow((r - greyRgb), 2) + Math.pow((g - greyRgb), 2) + Math.pow((b - greyRgb), 2);
    return dGrey < dCube ? greyIdx : cubeIdx;
}
function colorToEscape(c, fg, mode) {
    // alpha=0: palette index encoded in .r (bat's ansi-theme convention)
    if (c.a === 0) {
        var idx = c.r;
        if (idx < 8)
            return "\u001B[".concat((fg ? 30 : 40) + idx, "m");
        if (idx < 16)
            return "\u001B[".concat((fg ? 90 : 100) + (idx - 8), "m");
        return "\u001B[".concat(fg ? 38 : 48, ";5;").concat(idx, "m");
    }
    // alpha=1: terminal default
    if (c.a === 1)
        return fg ? '\x1b[39m' : '\x1b[49m';
    var codeType = fg ? 38 : 48;
    if (mode === 'truecolor') {
        return "\u001B[".concat(codeType, ";2;").concat(c.r, ";").concat(c.g, ";").concat(c.b, "m");
    }
    return "\u001B[".concat(codeType, ";5;").concat(ansi256FromRgb(c.r, c.g, c.b), "m");
}
function asTerminalEscaped(blocks, mode, skipBackground, dim) {
    var out = dim ? RESET + DIM : RESET;
    for (var _i = 0, blocks_1 = blocks; _i < blocks_1.length; _i++) {
        var _a = blocks_1[_i], style = _a[0], text = _a[1];
        out += colorToEscape(style.foreground, true, mode);
        if (!skipBackground) {
            out += colorToEscape(style.background, false, mode);
        }
        out += text;
    }
    return out + RESET;
}
function defaultSyntaxThemeName(themeName) {
    if (themeName.includes('ansi'))
        return 'ansi';
    if (themeName.includes('dark'))
        return 'Monokai Extended';
    return 'GitHub';
}
// highlight.js scope → syntect Monokai Extended foreground (measured from the
// Rust module's output so colors match the original exactly)
var MONOKAI_SCOPES = {
    keyword: rgb(249, 38, 114),
    _storage: rgb(102, 217, 239),
    built_in: rgb(166, 226, 46),
    type: rgb(166, 226, 46),
    literal: rgb(190, 132, 255),
    number: rgb(190, 132, 255),
    string: rgb(230, 219, 116),
    title: rgb(166, 226, 46),
    'title.function': rgb(166, 226, 46),
    'title.class': rgb(166, 226, 46),
    'title.class.inherited': rgb(166, 226, 46),
    params: rgb(253, 151, 31),
    comment: rgb(117, 113, 94),
    meta: rgb(117, 113, 94),
    attr: rgb(166, 226, 46),
    attribute: rgb(166, 226, 46),
    variable: rgb(255, 255, 255),
    'variable.language': rgb(255, 255, 255),
    property: rgb(255, 255, 255),
    operator: rgb(249, 38, 114),
    punctuation: rgb(248, 248, 242),
    symbol: rgb(190, 132, 255),
    regexp: rgb(230, 219, 116),
    subst: rgb(248, 248, 242),
};
// highlight.js scope → syntect GitHub-light foreground (measured from Rust)
var GITHUB_SCOPES = {
    keyword: rgb(167, 29, 93),
    _storage: rgb(167, 29, 93),
    built_in: rgb(0, 134, 179),
    type: rgb(0, 134, 179),
    literal: rgb(0, 134, 179),
    number: rgb(0, 134, 179),
    string: rgb(24, 54, 145),
    title: rgb(121, 93, 163),
    'title.function': rgb(121, 93, 163),
    'title.class': rgb(0, 0, 0),
    'title.class.inherited': rgb(0, 0, 0),
    params: rgb(0, 134, 179),
    comment: rgb(150, 152, 150),
    meta: rgb(150, 152, 150),
    attr: rgb(0, 134, 179),
    attribute: rgb(0, 134, 179),
    variable: rgb(0, 134, 179),
    'variable.language': rgb(0, 134, 179),
    property: rgb(0, 134, 179),
    operator: rgb(167, 29, 93),
    punctuation: rgb(51, 51, 51),
    symbol: rgb(0, 134, 179),
    regexp: rgb(24, 54, 145),
    subst: rgb(51, 51, 51),
};
// Keywords that syntect scopes as storage.type rather than keyword.control.
// highlight.js lumps these under "keyword"; we re-split so const/function/etc.
// get the cyan storage color instead of pink.
var STORAGE_KEYWORDS = new Set([
    'const',
    'let',
    'var',
    'function',
    'class',
    'type',
    'interface',
    'enum',
    'namespace',
    'module',
    'def',
    'fn',
    'func',
    'struct',
    'trait',
    'impl',
]);
var ANSI_SCOPES = {
    keyword: ansiIdx(13),
    _storage: ansiIdx(14),
    built_in: ansiIdx(14),
    type: ansiIdx(14),
    literal: ansiIdx(12),
    number: ansiIdx(12),
    string: ansiIdx(10),
    title: ansiIdx(11),
    'title.function': ansiIdx(11),
    'title.class': ansiIdx(11),
    comment: ansiIdx(8),
    meta: ansiIdx(8),
};
function buildTheme(themeName, mode) {
    var isDark = themeName.includes('dark');
    var isAnsi = themeName.includes('ansi');
    var isDaltonized = themeName.includes('daltonized');
    var tc = mode === 'truecolor';
    if (isAnsi) {
        return {
            addLine: DEFAULT_BG,
            addWord: DEFAULT_BG,
            addDecoration: ansiIdx(10),
            deleteLine: DEFAULT_BG,
            deleteWord: DEFAULT_BG,
            deleteDecoration: ansiIdx(9),
            foreground: ansiIdx(7),
            background: DEFAULT_BG,
            scopes: ANSI_SCOPES,
        };
    }
    if (isDark) {
        var fg_1 = rgb(248, 248, 242);
        var deleteLine_1 = rgb(61, 1, 0);
        var deleteWord_1 = rgb(92, 2, 0);
        var deleteDecoration_1 = rgb(220, 90, 90);
        if (isDaltonized) {
            return {
                addLine: tc ? rgb(0, 27, 41) : ansiIdx(17),
                addWord: tc ? rgb(0, 48, 71) : ansiIdx(24),
                addDecoration: rgb(81, 160, 200),
                deleteLine: deleteLine_1,
                deleteWord: deleteWord_1,
                deleteDecoration: deleteDecoration_1,
                foreground: fg_1,
                background: DEFAULT_BG,
                scopes: MONOKAI_SCOPES,
            };
        }
        return {
            addLine: tc ? rgb(2, 40, 0) : ansiIdx(22),
            addWord: tc ? rgb(4, 71, 0) : ansiIdx(28),
            addDecoration: rgb(80, 200, 80),
            deleteLine: deleteLine_1,
            deleteWord: deleteWord_1,
            deleteDecoration: deleteDecoration_1,
            foreground: fg_1,
            background: DEFAULT_BG,
            scopes: MONOKAI_SCOPES,
        };
    }
    // light
    var fg = rgb(51, 51, 51);
    var deleteLine = rgb(255, 220, 220);
    var deleteWord = rgb(255, 199, 199);
    var deleteDecoration = rgb(207, 34, 46);
    if (isDaltonized) {
        return {
            addLine: rgb(219, 237, 255),
            addWord: rgb(179, 217, 255),
            addDecoration: rgb(36, 87, 138),
            deleteLine: deleteLine,
            deleteWord: deleteWord,
            deleteDecoration: deleteDecoration,
            foreground: fg,
            background: DEFAULT_BG,
            scopes: GITHUB_SCOPES,
        };
    }
    return {
        addLine: rgb(220, 255, 220),
        addWord: rgb(178, 255, 178),
        addDecoration: rgb(36, 138, 61),
        deleteLine: deleteLine,
        deleteWord: deleteWord,
        deleteDecoration: deleteDecoration,
        foreground: fg,
        background: DEFAULT_BG,
        scopes: GITHUB_SCOPES,
    };
}
function defaultStyle(theme) {
    return { foreground: theme.foreground, background: theme.background };
}
function lineBackground(marker, theme) {
    switch (marker) {
        case '+':
            return theme.addLine;
        case '-':
            return theme.deleteLine;
        case ' ':
            return theme.background;
    }
}
function wordBackground(marker, theme) {
    switch (marker) {
        case '+':
            return theme.addWord;
        case '-':
            return theme.deleteWord;
        case ' ':
            return theme.background;
    }
}
function decorationColor(marker, theme) {
    switch (marker) {
        case '+':
            return theme.addDecoration;
        case '-':
            return theme.deleteDecoration;
        case ' ':
            return theme.foreground;
    }
}
// Filename-based and extension-based language detection (approximates bat's
// SyntaxMapping + syntect's find_syntax_by_extension)
var FILENAME_LANGS = {
    Dockerfile: 'dockerfile',
    Makefile: 'makefile',
    Rakefile: 'ruby',
    Gemfile: 'ruby',
    CMakeLists: 'cmake',
};
function detectLanguage(filePath, firstLine) {
    var _a, _b;
    var base = (0, path_1.basename)(filePath);
    var ext = (0, path_1.extname)(filePath).slice(1);
    // Filename-based lookup (handles Dockerfile, Makefile, CMakeLists.txt, etc.)
    var stem = (_a = base.split('.')[0]) !== null && _a !== void 0 ? _a : '';
    var byName = (_b = FILENAME_LANGS[base]) !== null && _b !== void 0 ? _b : FILENAME_LANGS[stem];
    if (byName && hljs().getLanguage(byName))
        return byName;
    if (ext) {
        var lang = hljs().getLanguage(ext);
        if (lang)
            return ext;
    }
    // Shebang / first-line detection (strip UTF-8 BOM)
    if (firstLine) {
        var line = firstLine.startsWith('\ufeff') ? firstLine.slice(1) : firstLine;
        if (line.startsWith('#!')) {
            if (line.includes('bash') || line.includes('/sh'))
                return 'bash';
            if (line.includes('python'))
                return 'python';
            if (line.includes('node'))
                return 'javascript';
            if (line.includes('ruby'))
                return 'ruby';
            if (line.includes('perl'))
                return 'perl';
        }
        if (line.startsWith('<?php'))
            return 'php';
        if (line.startsWith('<?xml'))
            return 'xml';
    }
    return null;
}
function scopeColor(scope, text, theme) {
    var _a, _b, _c;
    if (!scope)
        return theme.foreground;
    if (scope === 'keyword' && STORAGE_KEYWORDS.has(text.trim())) {
        return (_a = theme.scopes['_storage']) !== null && _a !== void 0 ? _a : theme.foreground;
    }
    return ((_c = (_b = theme.scopes[scope]) !== null && _b !== void 0 ? _b : theme.scopes[scope.split('.')[0]]) !== null && _c !== void 0 ? _c : theme.foreground);
}
function flattenHljs(node, theme, parentScope, out) {
    var _a, _b;
    if (typeof node === 'string') {
        var fg = scopeColor(parentScope, node, theme);
        out.push([{ foreground: fg, background: theme.background }, node]);
        return;
    }
    var scope = (_b = (_a = node.scope) !== null && _a !== void 0 ? _a : node.kind) !== null && _b !== void 0 ? _b : parentScope;
    for (var _i = 0, _c = node.children; _i < _c.length; _i++) {
        var child = _c[_i];
        flattenHljs(child, theme, scope, out);
    }
}
// result.emitter is in the public HighlightResult type, but rootNode is
// internal to TokenTreeEmitter. Type guard validates the shape once so we
// fail loudly (via logError) instead of a silent try/catch swallow — the
// prior `as unknown as` cast hid a version mismatch (_emitter vs emitter,
// scope vs kind) behind a silent gray fallback.
function hasRootNode(emitter) {
    return (typeof emitter === 'object' &&
        emitter !== null &&
        'rootNode' in emitter &&
        typeof emitter.rootNode === 'object' &&
        emitter.rootNode !== null &&
        'children' in emitter.rootNode);
}
var loggedEmitterShapeError = false;
function highlightLine(state, line, theme) {
    // syntect-parity: feed a trailing \n so line comments terminate, then strip
    var code = line + '\n';
    if (!state.lang) {
        return [[defaultStyle(theme), code]];
    }
    var result;
    try {
        result = hljs().highlight(code, {
            language: state.lang,
            ignoreIllegals: true,
        });
    }
    catch (_a) {
        // hljs throws on unknown language despite ignoreIllegals
        return [[defaultStyle(theme), code]];
    }
    if (!hasRootNode(result.emitter)) {
        if (!loggedEmitterShapeError) {
            loggedEmitterShapeError = true;
            (0, log_js_1.logError)(new Error("color-diff: hljs emitter shape mismatch (keys: ".concat(Object.keys(result.emitter).join(','), "). Syntax highlighting disabled.")));
        }
        return [[defaultStyle(theme), code]];
    }
    var blocks = [];
    flattenHljs(result.emitter.rootNode, theme, undefined, blocks);
    return blocks;
}
var CHANGE_THRESHOLD = 0.4;
// Tokenize into word runs, whitespace runs, and single punctuation chars —
// matches the Rust tokenize() which mirrors diffWordsWithSpace's splitting.
function tokenize(text) {
    var tokens = [];
    var i = 0;
    while (i < text.length) {
        var ch = text[i];
        if (/[\p{L}\p{N}_]/u.test(ch)) {
            var j = i + 1;
            while (j < text.length && /[\p{L}\p{N}_]/u.test(text[j]))
                j++;
            tokens.push(text.slice(i, j));
            i = j;
        }
        else if (/\s/.test(ch)) {
            var j = i + 1;
            while (j < text.length && /\s/.test(text[j]))
                j++;
            tokens.push(text.slice(i, j));
            i = j;
        }
        else {
            // advance one codepoint (handle surrogate pairs)
            var cp = text.codePointAt(i);
            var len = cp > 0xffff ? 2 : 1;
            tokens.push(text.slice(i, i + len));
            i += len;
        }
    }
    return tokens;
}
function findAdjacentPairs(markers) {
    var pairs = [];
    var i = 0;
    while (i < markers.length) {
        if (markers[i] === '-') {
            var delStart = i;
            var delEnd = i;
            while (delEnd < markers.length && markers[delEnd] === '-')
                delEnd++;
            var addEnd = delEnd;
            while (addEnd < markers.length && markers[addEnd] === '+')
                addEnd++;
            var delCount = delEnd - delStart;
            var addCount = addEnd - delEnd;
            if (delCount > 0 && addCount > 0) {
                var n = Math.min(delCount, addCount);
                for (var k = 0; k < n; k++) {
                    pairs.push([delStart + k, delEnd + k]);
                }
                i = addEnd;
            }
            else {
                i = delEnd;
            }
        }
        else {
            i++;
        }
    }
    return pairs;
}
function wordDiffStrings(oldStr, newStr) {
    var oldTokens = tokenize(oldStr);
    var newTokens = tokenize(newStr);
    var ops = (0, diff_1.diffArrays)(oldTokens, newTokens);
    var totalLen = oldStr.length + newStr.length;
    var changedLen = 0;
    var oldRanges = [];
    var newRanges = [];
    var oldOff = 0;
    var newOff = 0;
    for (var _i = 0, ops_1 = ops; _i < ops_1.length; _i++) {
        var op = ops_1[_i];
        var len = op.value.reduce(function (s, t) { return s + t.length; }, 0);
        if (op.removed) {
            changedLen += len;
            oldRanges.push({ start: oldOff, end: oldOff + len });
            oldOff += len;
        }
        else if (op.added) {
            changedLen += len;
            newRanges.push({ start: newOff, end: newOff + len });
            newOff += len;
        }
        else {
            oldOff += len;
            newOff += len;
        }
    }
    if (totalLen > 0 && changedLen / totalLen > CHANGE_THRESHOLD) {
        return [[], []];
    }
    return [oldRanges, newRanges];
}
function removeNewlines(h) {
    h.lines = h.lines.map(function (line) {
        return line.flatMap(function (_a) {
            var style = _a[0], text = _a[1];
            return text
                .split('\n')
                .filter(function (p) { return p.length > 0; })
                .map(function (p) { return [style, p]; });
        });
    });
}
function charWidth(ch) {
    return (0, stringWidth_js_1.stringWidth)(ch);
}
function wrapText(h, width, theme) {
    var newLines = [];
    for (var _i = 0, _a = h.lines; _i < _a.length; _i++) {
        var line = _a[_i];
        var queue = line.slice();
        var cur = [];
        var curW = 0;
        while (queue.length > 0) {
            var _b = queue.shift(), style = _b[0], text = _b[1];
            var tw = (0, stringWidth_js_1.stringWidth)(text);
            if (curW + tw <= width) {
                cur.push([style, text]);
                curW += tw;
            }
            else {
                var remaining = width - curW;
                var bytePos = 0;
                var accW = 0;
                // iterate by codepoint
                for (var _c = 0, text_1 = text; _c < text_1.length; _c++) {
                    var ch = text_1[_c];
                    var cw = charWidth(ch);
                    if (accW + cw > remaining)
                        break;
                    accW += cw;
                    bytePos += ch.length;
                }
                if (bytePos === 0) {
                    if (curW === 0) {
                        // Fresh line and first char still doesn't fit — force one codepoint
                        // to guarantee forward progress (overflows, but prevents infinite loop)
                        var firstCp = text.codePointAt(0);
                        bytePos = firstCp > 0xffff ? 2 : 1;
                    }
                    else {
                        // Line has content and next char doesn't fit — finish this line,
                        // re-queue the whole block for a fresh line
                        newLines.push(cur);
                        queue.unshift([style, text]);
                        cur = [];
                        curW = 0;
                        continue;
                    }
                }
                cur.push([style, text.slice(0, bytePos)]);
                newLines.push(cur);
                queue.unshift([style, text.slice(bytePos)]);
                cur = [];
                curW = 0;
            }
        }
        newLines.push(cur);
    }
    h.lines = newLines;
    // Pad changed lines so background extends to edge
    if (h.marker && h.marker !== ' ') {
        var bg = lineBackground(h.marker, theme);
        var padStyle = { foreground: theme.foreground, background: bg };
        for (var _d = 0, _e = h.lines; _d < _e.length; _d++) {
            var line = _e[_d];
            var curW = line.reduce(function (s, _a) {
                var t = _a[1];
                return s + (0, stringWidth_js_1.stringWidth)(t);
            }, 0);
            if (curW < width) {
                line.push([padStyle, ' '.repeat(width - curW)]);
            }
        }
    }
}
function addLineNumber(h, theme, maxDigits, fullDim) {
    var style = {
        foreground: h.marker ? decorationColor(h.marker, theme) : theme.foreground,
        background: h.marker ? lineBackground(h.marker, theme) : theme.background,
    };
    var shouldDim = h.marker === null || h.marker === ' ';
    for (var i = 0; i < h.lines.length; i++) {
        var prefix = i === 0
            ? " ".concat(String(h.lineNumber).padStart(maxDigits), " ")
            : ' '.repeat(maxDigits + 2);
        var wrapped = shouldDim && !fullDim ? "".concat(DIM).concat(prefix).concat(UNDIM) : prefix;
        h.lines[i].unshift([style, wrapped]);
    }
}
function addMarker(h, theme) {
    if (!h.marker)
        return;
    var style = {
        foreground: decorationColor(h.marker, theme),
        background: lineBackground(h.marker, theme),
    };
    for (var _i = 0, _a = h.lines; _i < _a.length; _i++) {
        var line = _a[_i];
        line.unshift([style, h.marker]);
    }
}
function dimContent(h) {
    for (var _i = 0, _a = h.lines; _i < _a.length; _i++) {
        var line = _a[_i];
        if (line.length > 0) {
            line[0][1] = DIM + line[0][1];
            var last = line.length - 1;
            line[last][1] = line[last][1] + UNDIM;
        }
    }
}
function applyBackground(h, theme, ranges) {
    if (!h.marker)
        return;
    var lineBg = lineBackground(h.marker, theme);
    var wordBg = wordBackground(h.marker, theme);
    var rangeIdx = 0;
    var byteOff = 0;
    for (var li = 0; li < h.lines.length; li++) {
        var newLine = [];
        for (var _i = 0, _a = h.lines[li]; _i < _a.length; _i++) {
            var _b = _a[_i], style = _b[0], text = _b[1];
            var textStart = byteOff;
            var textEnd = byteOff + text.length;
            while (rangeIdx < ranges.length && ranges[rangeIdx].end <= textStart) {
                rangeIdx++;
            }
            if (rangeIdx >= ranges.length) {
                newLine.push([__assign(__assign({}, style), { background: lineBg }), text]);
                byteOff = textEnd;
                continue;
            }
            var remaining = text;
            var pos = textStart;
            while (remaining.length > 0 && rangeIdx < ranges.length) {
                var r = ranges[rangeIdx];
                var inRange = pos >= r.start && pos < r.end;
                var next = void 0;
                if (inRange) {
                    next = Math.min(r.end, textEnd);
                }
                else if (r.start > pos && r.start < textEnd) {
                    next = r.start;
                }
                else {
                    next = textEnd;
                }
                var segLen = next - pos;
                var seg = remaining.slice(0, segLen);
                newLine.push([__assign(__assign({}, style), { background: inRange ? wordBg : lineBg }), seg]);
                remaining = remaining.slice(segLen);
                pos = next;
                if (pos >= r.end)
                    rangeIdx++;
            }
            if (remaining.length > 0) {
                newLine.push([__assign(__assign({}, style), { background: lineBg }), remaining]);
            }
            byteOff = textEnd;
        }
        h.lines[li] = newLine;
    }
}
function intoLines(h, dim, skipBg, mode) {
    return h.lines.map(function (line) { return asTerminalEscaped(line, mode, skipBg, dim); });
}
// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
function maxLineNumber(hunk) {
    var oldEnd = Math.max(0, hunk.oldStart + hunk.oldLines - 1);
    var newEnd = Math.max(0, hunk.newStart + hunk.newLines - 1);
    return Math.max(oldEnd, newEnd);
}
function parseMarker(s) {
    return s === '+' || s === '-' ? s : ' ';
}
var ColorDiff = /** @class */ (function () {
    function ColorDiff(hunk, firstLine, filePath, prefixContent) {
        this.hunk = hunk;
        this.filePath = filePath;
        this.firstLine = firstLine;
        this.prefixContent = prefixContent !== null && prefixContent !== void 0 ? prefixContent : null;
    }
    ColorDiff.prototype.render = function (themeName, width, dim) {
        var mode = detectColorMode(themeName);
        var theme = buildTheme(themeName, mode);
        var lang = detectLanguage(this.filePath, this.firstLine);
        var hlState = { lang: lang, stack: null };
        // Warm highlighter with prefix lines (highlight.js is stateless per call,
        // so this is a no-op for now — preserved for API parity)
        void this.prefixContent;
        var maxDigits = String(maxLineNumber(this.hunk)).length;
        var oldLine = this.hunk.oldStart;
        var newLine = this.hunk.newStart;
        var effectiveWidth = Math.max(1, width - maxDigits - 2 - 1);
        var entries = this.hunk.lines.map(function (rawLine) {
            var marker = parseMarker(rawLine.slice(0, 1));
            var code = rawLine.slice(1);
            var lineNumber;
            switch (marker) {
                case '+':
                    lineNumber = newLine++;
                    break;
                case '-':
                    lineNumber = oldLine++;
                    break;
                case ' ':
                    lineNumber = newLine;
                    oldLine++;
                    newLine++;
                    break;
            }
            return { lineNumber: lineNumber, marker: marker, code: code };
        });
        // Word-diff ranges (skip when dim — too loud)
        var ranges = entries.map(function () { return []; });
        if (!dim) {
            var markers = entries.map(function (e) { return e.marker; });
            for (var _i = 0, _a = findAdjacentPairs(markers); _i < _a.length; _i++) {
                var _b = _a[_i], delIdx = _b[0], addIdx = _b[1];
                var _c = wordDiffStrings(entries[delIdx].code, entries[addIdx].code), delR = _c[0], addR = _c[1];
                ranges[delIdx] = delR;
                ranges[addIdx] = addR;
            }
        }
        // Second pass: highlight + transform pipeline
        var out = [];
        for (var i = 0; i < entries.length; i++) {
            var _d = entries[i], lineNumber = _d.lineNumber, marker = _d.marker, code = _d.code;
            var tokens = marker === '-'
                ? [[defaultStyle(theme), code]]
                : highlightLine(hlState, code, theme);
            var h = { marker: marker, lineNumber: lineNumber, lines: [tokens] };
            removeNewlines(h);
            applyBackground(h, theme, ranges[i]);
            wrapText(h, effectiveWidth, theme);
            if (mode === 'ansi' && marker === '-') {
                dimContent(h);
            }
            addMarker(h, theme);
            addLineNumber(h, theme, maxDigits, dim);
            out.push.apply(out, intoLines(h, dim, false, mode));
        }
        return out;
    };
    return ColorDiff;
}());
exports.ColorDiff = ColorDiff;
var ColorFile = /** @class */ (function () {
    function ColorFile(code, filePath) {
        this.code = code;
        this.filePath = filePath;
    }
    ColorFile.prototype.render = function (themeName, width, dim) {
        var _a;
        var mode = detectColorMode(themeName);
        var theme = buildTheme(themeName, mode);
        var lines = this.code.split('\n');
        // Rust .lines() drops trailing empty line from trailing \n
        if (lines.length > 0 && lines[lines.length - 1] === '')
            lines.pop();
        var firstLine = (_a = lines[0]) !== null && _a !== void 0 ? _a : null;
        var lang = detectLanguage(this.filePath, firstLine);
        var hlState = { lang: lang, stack: null };
        var maxDigits = String(lines.length).length;
        var effectiveWidth = Math.max(1, width - maxDigits - 2);
        var out = [];
        for (var i = 0; i < lines.length; i++) {
            var tokens = highlightLine(hlState, lines[i], theme);
            var h = { marker: null, lineNumber: i + 1, lines: [tokens] };
            removeNewlines(h);
            wrapText(h, effectiveWidth, theme);
            addLineNumber(h, theme, maxDigits, dim);
            out.push.apply(out, intoLines(h, dim, true, mode));
        }
        return out;
    };
    return ColorFile;
}());
exports.ColorFile = ColorFile;
function getSyntaxTheme(themeName) {
    var _a;
    // highlight.js has no bat theme set, so env vars can't select alternate
    // syntect themes. We still report the env var if set, for diagnostics.
    var envTheme = (_a = process.env.CLAUDE_CODE_SYNTAX_HIGHLIGHT) !== null && _a !== void 0 ? _a : process.env.BAT_THEME;
    void envTheme;
    return { theme: defaultSyntaxThemeName(themeName), source: null };
}
// Lazy loader to match vendor/color-diff-src/index.ts API
var cachedModule = null;
function getNativeModule() {
    if (cachedModule)
        return cachedModule;
    cachedModule = { ColorDiff: ColorDiff, ColorFile: ColorFile, getSyntaxTheme: getSyntaxTheme };
    return cachedModule;
}
// Exported for testing
exports.__test = {
    tokenize: tokenize,
    findAdjacentPairs: findAdjacentPairs,
    wordDiffStrings: wordDiffStrings,
    ansi256FromRgb: ansi256FromRgb,
    colorToEscape: colorToEscape,
    detectColorMode: detectColorMode,
    detectLanguage: detectLanguage,
};
