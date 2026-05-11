"use strict";
/**
 * Pure-TypeScript bash parser producing tree-sitter-bash-compatible ASTs.
 *
 * Downstream code in parser.ts, ast.ts, prefix.ts, ParsedCommand.ts walks this
 * by field name. startIndex/endIndex are UTF-8 BYTE offsets (not JS string
 * indices).
 *
 * Grammar reference: tree-sitter-bash. Validated against a 3449-input golden
 * corpus generated from the WASM parser.
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
exports.SHELL_KEYWORDS = void 0;
exports.ensureParserInitialized = ensureParserInitialized;
exports.getParserModule = getParserModule;
/**
 * 50ms wall-clock cap — bails out on pathological/adversarial input.
 * Pass `Infinity` via `parse(src, Infinity)` to disable (e.g. correctness
 * tests, where CI jitter would otherwise cause spurious null returns).
 */
var PARSE_TIMEOUT_MS = 50;
/** Node budget cap — bails out before OOM on deeply nested input. */
var MAX_NODES = 50000;
var MODULE = { parse: parseSource };
var READY = Promise.resolve();
/** No-op: pure-TS parser needs no async init. Kept for API compatibility. */
function ensureParserInitialized() {
    return READY;
}
/** Always succeeds — pure-TS needs no init. */
function getParserModule() {
    return MODULE;
}
var SPECIAL_VARS = new Set(['?', '$', '@', '*', '#', '-', '!', '_']);
var DECL_KEYWORDS = new Set([
    'export',
    'declare',
    'typeset',
    'readonly',
    'local',
]);
exports.SHELL_KEYWORDS = new Set([
    'if',
    'then',
    'elif',
    'else',
    'fi',
    'while',
    'until',
    'for',
    'in',
    'do',
    'done',
    'case',
    'esac',
    'function',
    'select',
]);
function makeLexer(src) {
    return {
        src: src,
        len: src.length,
        i: 0,
        b: 0,
        heredocs: [],
        byteTable: null,
    };
}
/** Advance one JS char, updating byte offset for UTF-8. */
function advance(L) {
    var c = L.src.charCodeAt(L.i);
    L.i++;
    if (c < 0x80) {
        L.b++;
    }
    else if (c < 0x800) {
        L.b += 2;
    }
    else if (c >= 0xd800 && c <= 0xdbff) {
        // High surrogate — next char completes the pair, total 4 UTF-8 bytes
        L.b += 4;
        L.i++;
    }
    else {
        L.b += 3;
    }
}
function peek(L, off) {
    if (off === void 0) { off = 0; }
    return L.i + off < L.len ? L.src[L.i + off] : '';
}
function byteAt(L, charIdx) {
    // Fast path: ASCII-only prefix means char idx == byte idx
    if (L.byteTable)
        return L.byteTable[charIdx];
    // Build table on first non-trivial lookup
    var t = new Uint32Array(L.len + 1);
    var b = 0;
    var i = 0;
    while (i < L.len) {
        t[i] = b;
        var c = L.src.charCodeAt(i);
        if (c < 0x80) {
            b++;
            i++;
        }
        else if (c < 0x800) {
            b += 2;
            i++;
        }
        else if (c >= 0xd800 && c <= 0xdbff) {
            t[i + 1] = b + 2;
            b += 4;
            i += 2;
        }
        else {
            b += 3;
            i++;
        }
    }
    t[L.len] = b;
    L.byteTable = t;
    return t[charIdx];
}
function isWordChar(c) {
    // Bash word chars: alphanumeric + various punctuation that doesn't start operators
    return ((c >= 'a' && c <= 'z') ||
        (c >= 'A' && c <= 'Z') ||
        (c >= '0' && c <= '9') ||
        c === '_' ||
        c === '/' ||
        c === '.' ||
        c === '-' ||
        c === '+' ||
        c === ':' ||
        c === '@' ||
        c === '%' ||
        c === ',' ||
        c === '~' ||
        c === '^' ||
        c === '?' ||
        c === '*' ||
        c === '!' ||
        c === '=' ||
        c === '[' ||
        c === ']');
}
function isWordStart(c) {
    return isWordChar(c) || c === '\\';
}
function isIdentStart(c) {
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_';
}
function isIdentChar(c) {
    return isIdentStart(c) || (c >= '0' && c <= '9');
}
function isDigit(c) {
    return c >= '0' && c <= '9';
}
function isHexDigit(c) {
    return isDigit(c) || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F');
}
function isBaseDigit(c) {
    // Bash BASE#DIGITS: digits, letters, @ and _ (up to base 64)
    return isIdentChar(c) || c === '@';
}
/**
 * Unquoted heredoc delimiter chars. Bash accepts most non-metacharacters —
 * not just identifiers. Stop at whitespace, redirects, pipe/list operators,
 * and structural tokens. Allows !, -, ., +, etc. (e.g. <<!HEREDOC!).
 */
function isHeredocDelimChar(c) {
    return (c !== '' &&
        c !== ' ' &&
        c !== '\t' &&
        c !== '\n' &&
        c !== '<' &&
        c !== '>' &&
        c !== '|' &&
        c !== '&' &&
        c !== ';' &&
        c !== '(' &&
        c !== ')' &&
        c !== "'" &&
        c !== '"' &&
        c !== '`' &&
        c !== '\\');
}
function skipBlanks(L) {
    while (L.i < L.len) {
        var c = L.src[L.i];
        if (c === ' ' || c === '\t' || c === '\r') {
            // \r is whitespace per tree-sitter-bash extras /\s/ — handles CRLF inputs
            advance(L);
        }
        else if (c === '\\') {
            var nx = L.src[L.i + 1];
            if (nx === '\n' || (nx === '\r' && L.src[L.i + 2] === '\n')) {
                // Line continuation — tree-sitter extras: /\\\r?\n/
                advance(L);
                advance(L);
                if (nx === '\r')
                    advance(L);
            }
            else if (nx === ' ' || nx === '\t') {
                // \<space> or \<tab> — tree-sitter's _whitespace is /\\?[ \t\v]+/
                advance(L);
                advance(L);
            }
            else {
                break;
            }
        }
        else {
            break;
        }
    }
}
/**
 * Scan next token. Context-sensitive: `cmd` mode treats [ as operator (test
 * command start), `arg` mode treats [ as word char (glob/subscript).
 */
function nextToken(L, ctx) {
    if (ctx === void 0) { ctx = 'arg'; }
    skipBlanks(L);
    var start = L.b;
    if (L.i >= L.len)
        return { type: 'EOF', value: '', start: start, end: start };
    var c = L.src[L.i];
    var c1 = peek(L, 1);
    var c2 = peek(L, 2);
    if (c === '\n') {
        advance(L);
        return { type: 'NEWLINE', value: '\n', start: start, end: L.b };
    }
    if (c === '#') {
        var si = L.i;
        while (L.i < L.len && L.src[L.i] !== '\n')
            advance(L);
        return {
            type: 'COMMENT',
            value: L.src.slice(si, L.i),
            start: start,
            end: L.b,
        };
    }
    // Multi-char operators (longest match first)
    if (c === '&' && c1 === '&') {
        advance(L);
        advance(L);
        return { type: 'OP', value: '&&', start: start, end: L.b };
    }
    if (c === '|' && c1 === '|') {
        advance(L);
        advance(L);
        return { type: 'OP', value: '||', start: start, end: L.b };
    }
    if (c === '|' && c1 === '&') {
        advance(L);
        advance(L);
        return { type: 'OP', value: '|&', start: start, end: L.b };
    }
    if (c === ';' && c1 === ';' && c2 === '&') {
        advance(L);
        advance(L);
        advance(L);
        return { type: 'OP', value: ';;&', start: start, end: L.b };
    }
    if (c === ';' && c1 === ';') {
        advance(L);
        advance(L);
        return { type: 'OP', value: ';;', start: start, end: L.b };
    }
    if (c === ';' && c1 === '&') {
        advance(L);
        advance(L);
        return { type: 'OP', value: ';&', start: start, end: L.b };
    }
    if (c === '>' && c1 === '>') {
        advance(L);
        advance(L);
        return { type: 'OP', value: '>>', start: start, end: L.b };
    }
    if (c === '>' && c1 === '&' && c2 === '-') {
        advance(L);
        advance(L);
        advance(L);
        return { type: 'OP', value: '>&-', start: start, end: L.b };
    }
    if (c === '>' && c1 === '&') {
        advance(L);
        advance(L);
        return { type: 'OP', value: '>&', start: start, end: L.b };
    }
    if (c === '>' && c1 === '|') {
        advance(L);
        advance(L);
        return { type: 'OP', value: '>|', start: start, end: L.b };
    }
    if (c === '&' && c1 === '>' && c2 === '>') {
        advance(L);
        advance(L);
        advance(L);
        return { type: 'OP', value: '&>>', start: start, end: L.b };
    }
    if (c === '&' && c1 === '>') {
        advance(L);
        advance(L);
        return { type: 'OP', value: '&>', start: start, end: L.b };
    }
    if (c === '<' && c1 === '<' && c2 === '<') {
        advance(L);
        advance(L);
        advance(L);
        return { type: 'OP', value: '<<<', start: start, end: L.b };
    }
    if (c === '<' && c1 === '<' && c2 === '-') {
        advance(L);
        advance(L);
        advance(L);
        return { type: 'OP', value: '<<-', start: start, end: L.b };
    }
    if (c === '<' && c1 === '<') {
        advance(L);
        advance(L);
        return { type: 'OP', value: '<<', start: start, end: L.b };
    }
    if (c === '<' && c1 === '&' && c2 === '-') {
        advance(L);
        advance(L);
        advance(L);
        return { type: 'OP', value: '<&-', start: start, end: L.b };
    }
    if (c === '<' && c1 === '&') {
        advance(L);
        advance(L);
        return { type: 'OP', value: '<&', start: start, end: L.b };
    }
    if (c === '<' && c1 === '(') {
        advance(L);
        advance(L);
        return { type: 'LT_PAREN', value: '<(', start: start, end: L.b };
    }
    if (c === '>' && c1 === '(') {
        advance(L);
        advance(L);
        return { type: 'GT_PAREN', value: '>(', start: start, end: L.b };
    }
    if (c === '(' && c1 === '(') {
        advance(L);
        advance(L);
        return { type: 'OP', value: '((', start: start, end: L.b };
    }
    if (c === ')' && c1 === ')') {
        advance(L);
        advance(L);
        return { type: 'OP', value: '))', start: start, end: L.b };
    }
    if (c === '|' || c === '&' || c === ';' || c === '>' || c === '<') {
        advance(L);
        return { type: 'OP', value: c, start: start, end: L.b };
    }
    if (c === '(' || c === ')') {
        advance(L);
        return { type: 'OP', value: c, start: start, end: L.b };
    }
    // In cmd position, [ [[ { start test/group; in arg position they're word chars
    if (ctx === 'cmd') {
        if (c === '[' && c1 === '[') {
            advance(L);
            advance(L);
            return { type: 'OP', value: '[[', start: start, end: L.b };
        }
        if (c === '[') {
            advance(L);
            return { type: 'OP', value: '[', start: start, end: L.b };
        }
        if (c === '{' && (c1 === ' ' || c1 === '\t' || c1 === '\n')) {
            advance(L);
            return { type: 'OP', value: '{', start: start, end: L.b };
        }
        if (c === '}') {
            advance(L);
            return { type: 'OP', value: '}', start: start, end: L.b };
        }
        if (c === '!' && (c1 === ' ' || c1 === '\t')) {
            advance(L);
            return { type: 'OP', value: '!', start: start, end: L.b };
        }
    }
    if (c === '"') {
        advance(L);
        return { type: 'DQUOTE', value: '"', start: start, end: L.b };
    }
    if (c === "'") {
        var si = L.i;
        advance(L);
        while (L.i < L.len && L.src[L.i] !== "'")
            advance(L);
        if (L.i < L.len)
            advance(L);
        return {
            type: 'SQUOTE',
            value: L.src.slice(si, L.i),
            start: start,
            end: L.b,
        };
    }
    if (c === '$') {
        if (c1 === '(' && c2 === '(') {
            advance(L);
            advance(L);
            advance(L);
            return { type: 'DOLLAR_DPAREN', value: '$((', start: start, end: L.b };
        }
        if (c1 === '(') {
            advance(L);
            advance(L);
            return { type: 'DOLLAR_PAREN', value: '$(', start: start, end: L.b };
        }
        if (c1 === '{') {
            advance(L);
            advance(L);
            return { type: 'DOLLAR_BRACE', value: '${', start: start, end: L.b };
        }
        if (c1 === "'") {
            // ANSI-C string $'...'
            var si = L.i;
            advance(L);
            advance(L);
            while (L.i < L.len && L.src[L.i] !== "'") {
                if (L.src[L.i] === '\\' && L.i + 1 < L.len)
                    advance(L);
                advance(L);
            }
            if (L.i < L.len)
                advance(L);
            return {
                type: 'ANSI_C',
                value: L.src.slice(si, L.i),
                start: start,
                end: L.b,
            };
        }
        advance(L);
        return { type: 'DOLLAR', value: '$', start: start, end: L.b };
    }
    if (c === '`') {
        advance(L);
        return { type: 'BACKTICK', value: '`', start: start, end: L.b };
    }
    // File descriptor before redirect: digit+ immediately followed by > or <
    if (isDigit(c)) {
        var j = L.i;
        while (j < L.len && isDigit(L.src[j]))
            j++;
        var after = j < L.len ? L.src[j] : '';
        if (after === '>' || after === '<') {
            var si = L.i;
            while (L.i < j)
                advance(L);
            return {
                type: 'WORD',
                value: L.src.slice(si, L.i),
                start: start,
                end: L.b,
            };
        }
    }
    // Word / number
    if (isWordStart(c) || c === '{' || c === '}') {
        var si = L.i;
        while (L.i < L.len) {
            var ch = L.src[L.i];
            if (ch === '\\') {
                if (L.i + 1 >= L.len) {
                    // Trailing `\` at EOF — tree-sitter excludes it from the word and
                    // emits a sibling ERROR. Stop here so the word ends before `\`.
                    break;
                }
                // Escape next char (including \n for line continuation mid-word)
                if (L.src[L.i + 1] === '\n') {
                    advance(L);
                    advance(L);
                    continue;
                }
                advance(L);
                advance(L);
                continue;
            }
            if (!isWordChar(ch) && ch !== '{' && ch !== '}') {
                break;
            }
            advance(L);
        }
        if (L.i > si) {
            var v = L.src.slice(si, L.i);
            // Number: optional sign then digits only
            if (/^-?\d+$/.test(v)) {
                return { type: 'NUMBER', value: v, start: start, end: L.b };
            }
            return { type: 'WORD', value: v, start: start, end: L.b };
        }
        // Empty word (lone `\` at EOF) — fall through to single-char consumer
    }
    // Unknown char — consume as single-char word
    advance(L);
    return { type: 'WORD', value: c, start: start, end: L.b };
}
function parseSource(source, timeoutMs) {
    var L = makeLexer(source);
    var srcBytes = byteLengthUtf8(source);
    var P = {
        L: L,
        src: source,
        srcBytes: srcBytes,
        isAscii: srcBytes === source.length,
        nodeCount: 0,
        deadline: performance.now() + (timeoutMs !== null && timeoutMs !== void 0 ? timeoutMs : PARSE_TIMEOUT_MS),
        aborted: false,
        inBacktick: 0,
        stopToken: null,
    };
    try {
        var program = parseProgram(P);
        if (P.aborted)
            return null;
        return program;
    }
    catch (_a) {
        return null;
    }
}
function byteLengthUtf8(s) {
    var b = 0;
    for (var i = 0; i < s.length; i++) {
        var c = s.charCodeAt(i);
        if (c < 0x80)
            b++;
        else if (c < 0x800)
            b += 2;
        else if (c >= 0xd800 && c <= 0xdbff) {
            b += 4;
            i++;
        }
        else
            b += 3;
    }
    return b;
}
function checkBudget(P) {
    P.nodeCount++;
    if (P.nodeCount > MAX_NODES) {
        P.aborted = true;
        throw new Error('budget');
    }
    if ((P.nodeCount & 0x7f) === 0 && performance.now() > P.deadline) {
        P.aborted = true;
        throw new Error('timeout');
    }
}
/** Build a node. Slices text from source by byte range via char-index lookup. */
function mk(P, type, start, end, children) {
    checkBudget(P);
    return {
        type: type,
        text: sliceBytes(P, start, end),
        startIndex: start,
        endIndex: end,
        children: children,
    };
}
function sliceBytes(P, startByte, endByte) {
    if (P.isAscii)
        return P.src.slice(startByte, endByte);
    // Find char indices for byte offsets. Build byte table if needed.
    var L = P.L;
    if (!L.byteTable)
        byteAt(L, 0);
    var t = L.byteTable;
    // Binary search for char index where byte offset matches
    var lo = 0;
    var hi = P.src.length;
    while (lo < hi) {
        var m = (lo + hi) >>> 1;
        if (t[m] < startByte)
            lo = m + 1;
        else
            hi = m;
    }
    var sc = lo;
    lo = sc;
    hi = P.src.length;
    while (lo < hi) {
        var m = (lo + hi) >>> 1;
        if (t[m] < endByte)
            lo = m + 1;
        else
            hi = m;
    }
    return P.src.slice(sc, lo);
}
function leaf(P, type, tok) {
    return mk(P, type, tok.start, tok.end, []);
}
function parseProgram(P) {
    var children = [];
    // Skip leading whitespace & newlines — program start is first content byte
    skipBlanks(P.L);
    while (true) {
        var save = saveLex(P.L);
        var t = nextToken(P.L, 'cmd');
        if (t.type === 'NEWLINE') {
            skipBlanks(P.L);
            continue;
        }
        restoreLex(P.L, save);
        break;
    }
    var progStart = P.L.b;
    while (P.L.i < P.L.len) {
        var save = saveLex(P.L);
        var t = nextToken(P.L, 'cmd');
        if (t.type === 'EOF')
            break;
        if (t.type === 'NEWLINE')
            continue;
        if (t.type === 'COMMENT') {
            children.push(leaf(P, 'comment', t));
            continue;
        }
        restoreLex(P.L, save);
        var stmts = parseStatements(P, null);
        for (var _i = 0, stmts_1 = stmts; _i < stmts_1.length; _i++) {
            var s = stmts_1[_i];
            children.push(s);
        }
        if (stmts.length === 0) {
            // Couldn't parse — emit ERROR and skip one token
            var errTok = nextToken(P.L, 'cmd');
            if (errTok.type === 'EOF')
                break;
            // Stray `;;` at program level (e.g., `var=;;` outside case) — tree-sitter
            // silently elides. Keep leading `;` as ERROR (security: paste artifact).
            if (errTok.type === 'OP' &&
                errTok.value === ';;' &&
                children.length > 0) {
                continue;
            }
            children.push(mk(P, 'ERROR', errTok.start, errTok.end, []));
        }
    }
    // tree-sitter includes trailing whitespace in program extent
    var progEnd = children.length > 0 ? P.srcBytes : progStart;
    return mk(P, 'program', progStart, progEnd, children);
}
function saveLex(L) {
    return L.b * 0x10000 + L.i;
}
function restoreLex(L, s) {
    L.i = s & 0xffff;
    L.b = s >>> 16;
}
/**
 * Parse a sequence of statements separated by ; & newline. Returns a flat list
 * where ; and & are sibling leaves (NOT wrapped in 'list' — only && || get
 * that). Stops at terminator or EOF.
 */
function parseStatements(P, terminator) {
    var out = [];
    while (true) {
        skipBlanks(P.L);
        var save = saveLex(P.L);
        var t = nextToken(P.L, 'cmd');
        if (t.type === 'EOF') {
            restoreLex(P.L, save);
            break;
        }
        if (t.type === 'NEWLINE') {
            // Process pending heredocs
            if (P.L.heredocs.length > 0) {
                scanHeredocBodies(P);
            }
            continue;
        }
        if (t.type === 'COMMENT') {
            out.push(leaf(P, 'comment', t));
            continue;
        }
        if (terminator && t.type === 'OP' && t.value === terminator) {
            restoreLex(P.L, save);
            break;
        }
        if (t.type === 'OP' &&
            (t.value === ')' ||
                t.value === '}' ||
                t.value === ';;' ||
                t.value === ';&' ||
                t.value === ';;&' ||
                t.value === '))' ||
                t.value === ']]' ||
                t.value === ']')) {
            restoreLex(P.L, save);
            break;
        }
        if (t.type === 'BACKTICK' && P.inBacktick > 0) {
            restoreLex(P.L, save);
            break;
        }
        if (t.type === 'WORD' &&
            (t.value === 'then' ||
                t.value === 'elif' ||
                t.value === 'else' ||
                t.value === 'fi' ||
                t.value === 'do' ||
                t.value === 'done' ||
                t.value === 'esac')) {
            restoreLex(P.L, save);
            break;
        }
        restoreLex(P.L, save);
        var stmt = parseAndOr(P);
        if (!stmt)
            break;
        out.push(stmt);
        // Look for separator
        skipBlanks(P.L);
        var save2 = saveLex(P.L);
        var sep = nextToken(P.L, 'cmd');
        if (sep.type === 'OP' && (sep.value === ';' || sep.value === '&')) {
            // Check if terminator follows — if so, emit separator but stop
            var save3 = saveLex(P.L);
            var after = nextToken(P.L, 'cmd');
            restoreLex(P.L, save3);
            out.push(leaf(P, sep.value, sep));
            if (after.type === 'EOF' ||
                (after.type === 'OP' &&
                    (after.value === ')' ||
                        after.value === '}' ||
                        after.value === ';;' ||
                        after.value === ';&' ||
                        after.value === ';;&')) ||
                (after.type === 'WORD' &&
                    (after.value === 'then' ||
                        after.value === 'elif' ||
                        after.value === 'else' ||
                        after.value === 'fi' ||
                        after.value === 'do' ||
                        after.value === 'done' ||
                        after.value === 'esac'))) {
                // Trailing separator — don't include it at program level unless
                // there's content after. But at inner levels we keep it.
                continue;
            }
        }
        else if (sep.type === 'NEWLINE') {
            if (P.L.heredocs.length > 0) {
                scanHeredocBodies(P);
            }
            continue;
        }
        else {
            restoreLex(P.L, save2);
        }
    }
    // Trim trailing separator if at program level
    return out;
}
/**
 * Parse pipeline chains joined by && ||. Left-associative nesting.
 * tree-sitter quirk: trailing redirect on the last pipeline wraps the ENTIRE
 * list in a redirected_statement — `a > x && b > y` becomes
 * redirected_statement(list(redirected_statement(a,>x), &&, b), >y).
 */
function parseAndOr(P) {
    var left = parsePipeline(P);
    if (!left)
        return null;
    while (true) {
        var save = saveLex(P.L);
        var t = nextToken(P.L, 'cmd');
        if (t.type === 'OP' && (t.value === '&&' || t.value === '||')) {
            var op = leaf(P, t.value, t);
            skipNewlines(P);
            var right = parsePipeline(P);
            if (!right) {
                left = mk(P, 'list', left.startIndex, op.endIndex, [left, op]);
                break;
            }
            // If right is a redirected_statement, hoist its redirects to wrap the list.
            if (right.type === 'redirected_statement' && right.children.length >= 2) {
                var inner = right.children[0];
                var redirs = right.children.slice(1);
                var listNode = mk(P, 'list', left.startIndex, inner.endIndex, [
                    left,
                    op,
                    inner,
                ]);
                var lastR = redirs[redirs.length - 1];
                left = mk(P, 'redirected_statement', listNode.startIndex, lastR.endIndex, __spreadArray([listNode], redirs, true));
            }
            else {
                left = mk(P, 'list', left.startIndex, right.endIndex, [left, op, right]);
            }
        }
        else {
            restoreLex(P.L, save);
            break;
        }
    }
    return left;
}
function skipNewlines(P) {
    while (true) {
        var save = saveLex(P.L);
        var t = nextToken(P.L, 'cmd');
        if (t.type !== 'NEWLINE') {
            restoreLex(P.L, save);
            break;
        }
    }
}
/**
 * Parse commands joined by | or |&. Flat children with operator leaves.
 * tree-sitter quirk: `a | b 2>nul | c` hoists the redirect on `b` to wrap
 * the preceding pipeline fragment — pipeline(redirected_statement(
 * pipeline(a,|,b), 2>nul), |, c).
 */
function parsePipeline(P) {
    var first = parseCommand(P);
    if (!first)
        return null;
    var parts = [first];
    while (true) {
        var save = saveLex(P.L);
        var t = nextToken(P.L, 'cmd');
        if (t.type === 'OP' && (t.value === '|' || t.value === '|&')) {
            var op = leaf(P, t.value, t);
            skipNewlines(P);
            var next = parseCommand(P);
            if (!next) {
                parts.push(op);
                break;
            }
            // Hoist trailing redirect on `next` to wrap current pipeline fragment
            if (next.type === 'redirected_statement' &&
                next.children.length >= 2 &&
                parts.length >= 1) {
                var inner = next.children[0];
                var redirs = next.children.slice(1);
                // Wrap existing parts + op + inner as a pipeline
                var pipeKids = __spreadArray(__spreadArray([], parts, true), [op, inner], false);
                var pipeNode = mk(P, 'pipeline', pipeKids[0].startIndex, inner.endIndex, pipeKids);
                var lastR = redirs[redirs.length - 1];
                var wrapped = mk(P, 'redirected_statement', pipeNode.startIndex, lastR.endIndex, __spreadArray([pipeNode], redirs, true));
                parts.length = 0;
                parts.push(wrapped);
                first = wrapped;
                continue;
            }
            parts.push(op, next);
        }
        else {
            restoreLex(P.L, save);
            break;
        }
    }
    if (parts.length === 1)
        return parts[0];
    var last = parts[parts.length - 1];
    return mk(P, 'pipeline', parts[0].startIndex, last.endIndex, parts);
}
/** Parse a single command: simple, compound, or control structure. */
function parseCommand(P) {
    skipBlanks(P.L);
    var save = saveLex(P.L);
    var t = nextToken(P.L, 'cmd');
    if (t.type === 'EOF') {
        restoreLex(P.L, save);
        return null;
    }
    // Negation — tree-sitter wraps just the command, redirects go outside.
    // `! cmd > out` → redirected_statement(negated_command(!, cmd), >out)
    if (t.type === 'OP' && t.value === '!') {
        var bang = leaf(P, '!', t);
        var inner = parseCommand(P);
        if (!inner) {
            restoreLex(P.L, save);
            return null;
        }
        // If inner is a redirected_statement, hoist redirects outside negation
        if (inner.type === 'redirected_statement' && inner.children.length >= 2) {
            var cmd = inner.children[0];
            var redirs = inner.children.slice(1);
            var neg = mk(P, 'negated_command', bang.startIndex, cmd.endIndex, [
                bang,
                cmd,
            ]);
            var lastR = redirs[redirs.length - 1];
            return mk(P, 'redirected_statement', neg.startIndex, lastR.endIndex, __spreadArray([
                neg
            ], redirs, true));
        }
        return mk(P, 'negated_command', bang.startIndex, inner.endIndex, [
            bang,
            inner,
        ]);
    }
    if (t.type === 'OP' && t.value === '(') {
        var open_1 = leaf(P, '(', t);
        var body = parseStatements(P, ')');
        var closeTok = nextToken(P.L, 'cmd');
        var close_1 = closeTok.type === 'OP' && closeTok.value === ')'
            ? leaf(P, ')', closeTok)
            : mk(P, ')', open_1.endIndex, open_1.endIndex, []);
        var node = mk(P, 'subshell', open_1.startIndex, close_1.endIndex, __spreadArray(__spreadArray([
            open_1
        ], body, true), [
            close_1,
        ], false));
        return maybeRedirect(P, node);
    }
    if (t.type === 'OP' && t.value === '((') {
        var open_2 = leaf(P, '((', t);
        var exprs = parseArithCommaList(P, '))', 'var');
        var closeTok = nextToken(P.L, 'cmd');
        var close_2 = closeTok.value === '))'
            ? leaf(P, '))', closeTok)
            : mk(P, '))', open_2.endIndex, open_2.endIndex, []);
        return mk(P, 'compound_statement', open_2.startIndex, close_2.endIndex, __spreadArray(__spreadArray([
            open_2
        ], exprs, true), [
            close_2,
        ], false));
    }
    if (t.type === 'OP' && t.value === '{') {
        var open_3 = leaf(P, '{', t);
        var body = parseStatements(P, '}');
        var closeTok = nextToken(P.L, 'cmd');
        var close_3 = closeTok.type === 'OP' && closeTok.value === '}'
            ? leaf(P, '}', closeTok)
            : mk(P, '}', open_3.endIndex, open_3.endIndex, []);
        var node = mk(P, 'compound_statement', open_3.startIndex, close_3.endIndex, __spreadArray(__spreadArray([
            open_3
        ], body, true), [
            close_3,
        ], false));
        return maybeRedirect(P, node);
    }
    if (t.type === 'OP' && (t.value === '[' || t.value === '[[')) {
        var open_4 = leaf(P, t.value, t);
        var closer = t.value === '[' ? ']' : ']]';
        // Grammar: `[` can contain choice(_expression, redirected_statement).
        // Try _expression first; if we don't reach `]`, backtrack and parse as
        // redirected_statement (handles `[ ! cmd -v go &>/dev/null ]`).
        var exprSave = saveLex(P.L);
        var expr = parseTestExpr(P, closer);
        skipBlanks(P.L);
        if (t.value === '[' && peek(P.L) !== ']') {
            // Expression parse didn't reach `]` — try as redirected_statement.
            // Thread `]` stop-token so parseSimpleCommand doesn't eat it as arg.
            restoreLex(P.L, exprSave);
            var prevStop = P.stopToken;
            P.stopToken = ']';
            var rstmt = parseCommand(P);
            P.stopToken = prevStop;
            if (rstmt && rstmt.type === 'redirected_statement') {
                expr = rstmt;
            }
            else {
                // Neither worked — restore and keep the expression result
                restoreLex(P.L, exprSave);
                expr = parseTestExpr(P, closer);
            }
            skipBlanks(P.L);
        }
        var closeTok = nextToken(P.L, 'arg');
        var close_4;
        if (closeTok.value === closer) {
            close_4 = leaf(P, closer, closeTok);
        }
        else {
            close_4 = mk(P, closer, open_4.endIndex, open_4.endIndex, []);
        }
        var kids = expr ? [open_4, expr, close_4] : [open_4, close_4];
        return mk(P, 'test_command', open_4.startIndex, close_4.endIndex, kids);
    }
    if (t.type === 'WORD') {
        if (t.value === 'if')
            return maybeRedirect(P, parseIf(P, t), true);
        if (t.value === 'while' || t.value === 'until')
            return maybeRedirect(P, parseWhile(P, t), true);
        if (t.value === 'for')
            return maybeRedirect(P, parseFor(P, t), true);
        if (t.value === 'select')
            return maybeRedirect(P, parseFor(P, t), true);
        if (t.value === 'case')
            return maybeRedirect(P, parseCase(P, t), true);
        if (t.value === 'function')
            return parseFunction(P, t);
        if (DECL_KEYWORDS.has(t.value))
            return maybeRedirect(P, parseDeclaration(P, t));
        if (t.value === 'unset' || t.value === 'unsetenv') {
            return maybeRedirect(P, parseUnset(P, t));
        }
    }
    restoreLex(P.L, save);
    return parseSimpleCommand(P);
}
/**
 * Parse a simple command: [assignment]* word [arg|redirect]*
 * Returns variable_assignment if only one assignment and no command.
 */
function parseSimpleCommand(P) {
    var start = P.L.b;
    var assignments = [];
    var preRedirects = [];
    while (true) {
        skipBlanks(P.L);
        var a = tryParseAssignment(P);
        if (a) {
            assignments.push(a);
            continue;
        }
        var r = tryParseRedirect(P);
        if (r) {
            preRedirects.push(r);
            continue;
        }
        break;
    }
    skipBlanks(P.L);
    var save = saveLex(P.L);
    var nameTok = nextToken(P.L, 'cmd');
    if (nameTok.type === 'EOF' ||
        nameTok.type === 'NEWLINE' ||
        nameTok.type === 'COMMENT' ||
        (nameTok.type === 'OP' &&
            nameTok.value !== '{' &&
            nameTok.value !== '[' &&
            nameTok.value !== '[[') ||
        (nameTok.type === 'WORD' &&
            exports.SHELL_KEYWORDS.has(nameTok.value) &&
            nameTok.value !== 'in')) {
        restoreLex(P.L, save);
        // No command — standalone assignment(s) or redirect
        if (assignments.length === 1 && preRedirects.length === 0) {
            return assignments[0];
        }
        if (preRedirects.length > 0 && assignments.length === 0) {
            // Bare redirect → redirected_statement with just file_redirect children
            var last = preRedirects[preRedirects.length - 1];
            return mk(P, 'redirected_statement', preRedirects[0].startIndex, last.endIndex, preRedirects);
        }
        if (assignments.length > 1 && preRedirects.length === 0) {
            // `A=1 B=2` with no command → variable_assignments (plural)
            var last = assignments[assignments.length - 1];
            return mk(P, 'variable_assignments', assignments[0].startIndex, last.endIndex, assignments);
        }
        if (assignments.length > 0 || preRedirects.length > 0) {
            var all = __spreadArray(__spreadArray([], assignments, true), preRedirects, true);
            var last = all[all.length - 1];
            return mk(P, 'command', start, last.endIndex, all);
        }
        return null;
    }
    restoreLex(P.L, save);
    // Check for function definition: name() { ... }
    var fnSave = saveLex(P.L);
    var nm = parseWord(P, 'cmd');
    if (nm && nm.type === 'word') {
        skipBlanks(P.L);
        if (peek(P.L) === '(' && peek(P.L, 1) === ')') {
            var oTok = nextToken(P.L, 'cmd');
            var cTok = nextToken(P.L, 'cmd');
            var oParen = leaf(P, '(', oTok);
            var cParen = leaf(P, ')', cTok);
            skipBlanks(P.L);
            skipNewlines(P);
            var body = parseCommand(P);
            if (body) {
                // If body is redirected_statement(compound_statement, file_redirect...),
                // hoist redirects to function_definition level per tree-sitter grammar
                var bodyKids = [body];
                if (body.type === 'redirected_statement' &&
                    body.children.length >= 2 &&
                    body.children[0].type === 'compound_statement') {
                    bodyKids = body.children;
                }
                var last = bodyKids[bodyKids.length - 1];
                return mk(P, 'function_definition', nm.startIndex, last.endIndex, __spreadArray([
                    nm,
                    oParen,
                    cParen
                ], bodyKids, true));
            }
        }
    }
    restoreLex(P.L, fnSave);
    var nameArg = parseWord(P, 'cmd');
    if (!nameArg) {
        if (assignments.length === 1)
            return assignments[0];
        return null;
    }
    var cmdName = mk(P, 'command_name', nameArg.startIndex, nameArg.endIndex, [
        nameArg,
    ]);
    var args = [];
    var redirects = [];
    var heredocRedirect = null;
    while (true) {
        skipBlanks(P.L);
        // Post-command redirects are greedy (repeat1 $._literal) — once a redirect
        // appears after command_name, subsequent literals attach to it per grammar's
        // prec.left. `grep 2>/dev/null -q foo` → file_redirect eats `-q foo`.
        // Args parsed BEFORE the first redirect still go to command (cat a b > out).
        var r = tryParseRedirect(P, true);
        if (r) {
            if (r.type === 'heredoc_redirect') {
                heredocRedirect = r;
            }
            else if (r.type === 'herestring_redirect') {
                args.push(r);
            }
            else {
                redirects.push(r);
            }
            continue;
        }
        // Once a file_redirect has been seen, command args are done — grammar's
        // command rule doesn't allow file_redirect in its post-name choice, so
        // anything after belongs to redirected_statement's file_redirect children.
        if (redirects.length > 0)
            break;
        // `[` test_command backtrack — stop at `]` so outer handler can consume it
        if (P.stopToken === ']' && peek(P.L) === ']')
            break;
        var save2 = saveLex(P.L);
        var pk = nextToken(P.L, 'arg');
        if (pk.type === 'EOF' ||
            pk.type === 'NEWLINE' ||
            pk.type === 'COMMENT' ||
            (pk.type === 'OP' &&
                (pk.value === '|' ||
                    pk.value === '|&' ||
                    pk.value === '&&' ||
                    pk.value === '||' ||
                    pk.value === ';' ||
                    pk.value === ';;' ||
                    pk.value === ';&' ||
                    pk.value === ';;&' ||
                    pk.value === '&' ||
                    pk.value === ')' ||
                    pk.value === '}' ||
                    pk.value === '))'))) {
            restoreLex(P.L, save2);
            break;
        }
        restoreLex(P.L, save2);
        var arg = parseWord(P, 'arg');
        if (!arg) {
            // Lone `(` in arg position — tree-sitter parses this as subshell arg
            // e.g., `echo =(cmd)` → command has ERROR(=), subshell(cmd) as args
            if (peek(P.L) === '(') {
                var oTok = nextToken(P.L, 'cmd');
                var open_5 = leaf(P, '(', oTok);
                var body = parseStatements(P, ')');
                var cTok = nextToken(P.L, 'cmd');
                var close_5 = cTok.type === 'OP' && cTok.value === ')'
                    ? leaf(P, ')', cTok)
                    : mk(P, ')', open_5.endIndex, open_5.endIndex, []);
                args.push(mk(P, 'subshell', open_5.startIndex, close_5.endIndex, __spreadArray(__spreadArray([
                    open_5
                ], body, true), [
                    close_5,
                ], false)));
                continue;
            }
            break;
        }
        // Lone `=` in arg position is a parse error in bash — tree-sitter wraps
        // it in ERROR for recovery. Happens in `echo =(cmd)` (zsh process-sub).
        if (arg.type === 'word' && arg.text === '=') {
            args.push(mk(P, 'ERROR', arg.startIndex, arg.endIndex, [arg]));
            continue;
        }
        // Word immediately followed by `(` (no whitespace) is a parse error —
        // bash doesn't allow glob-then-subshell adjacency. tree-sitter wraps the
        // word in ERROR. Catches zsh glob qualifiers like `*.(e:'cmd':)`.
        if ((arg.type === 'word' || arg.type === 'concatenation') &&
            peek(P.L) === '(' &&
            P.L.b === arg.endIndex) {
            args.push(mk(P, 'ERROR', arg.startIndex, arg.endIndex, [arg]));
            continue;
        }
        args.push(arg);
    }
    // preRedirects (e.g., `2>&1 cat`, `<<<str cmd`) go INSIDE the command node
    // before command_name per tree-sitter grammar, not in redirected_statement
    var cmdChildren = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], assignments, true), preRedirects, true), [cmdName], false), args, true);
    var cmdEnd = cmdChildren.length > 0
        ? cmdChildren[cmdChildren.length - 1].endIndex
        : cmdName.endIndex;
    var cmdStart = cmdChildren[0].startIndex;
    var cmd = mk(P, 'command', cmdStart, cmdEnd, cmdChildren);
    if (heredocRedirect) {
        // Scan heredoc body now
        scanHeredocBodies(P);
        var hd = P.L.heredocs.shift();
        if (hd && heredocRedirect.children.length >= 2) {
            var bodyNode = mk(P, 'heredoc_body', hd.bodyStart, hd.bodyEnd, hd.quoted ? [] : parseHeredocBodyContent(P, hd.bodyStart, hd.bodyEnd));
            var endNode = mk(P, 'heredoc_end', hd.endStart, hd.endEnd, []);
            heredocRedirect.children.push(bodyNode, endNode);
            heredocRedirect.endIndex = hd.endEnd;
            heredocRedirect.text = sliceBytes(P, heredocRedirect.startIndex, hd.endEnd);
        }
        var allR = __spreadArray(__spreadArray(__spreadArray([], preRedirects, true), [heredocRedirect], false), redirects, true);
        var rStart = preRedirects.length > 0
            ? Math.min(cmd.startIndex, preRedirects[0].startIndex)
            : cmd.startIndex;
        return mk(P, 'redirected_statement', rStart, heredocRedirect.endIndex, __spreadArray([
            cmd
        ], allR, true));
    }
    if (redirects.length > 0) {
        var last = redirects[redirects.length - 1];
        return mk(P, 'redirected_statement', cmd.startIndex, last.endIndex, __spreadArray([
            cmd
        ], redirects, true));
    }
    return cmd;
}
function maybeRedirect(P, node, allowHerestring) {
    if (allowHerestring === void 0) { allowHerestring = false; }
    var redirects = [];
    while (true) {
        skipBlanks(P.L);
        var save = saveLex(P.L);
        var r = tryParseRedirect(P);
        if (!r)
            break;
        if (r.type === 'herestring_redirect' && !allowHerestring) {
            restoreLex(P.L, save);
            break;
        }
        redirects.push(r);
    }
    if (redirects.length === 0)
        return node;
    var last = redirects[redirects.length - 1];
    return mk(P, 'redirected_statement', node.startIndex, last.endIndex, __spreadArray([
        node
    ], redirects, true));
}
function tryParseAssignment(P) {
    var save = saveLex(P.L);
    skipBlanks(P.L);
    var startB = P.L.b;
    // Must start with identifier
    if (!isIdentStart(peek(P.L))) {
        restoreLex(P.L, save);
        return null;
    }
    while (isIdentChar(peek(P.L)))
        advance(P.L);
    var nameEnd = P.L.b;
    // Optional subscript
    var subEnd = nameEnd;
    if (peek(P.L) === '[') {
        advance(P.L);
        var depth = 1;
        while (P.L.i < P.L.len && depth > 0) {
            var c_1 = peek(P.L);
            if (c_1 === '[')
                depth++;
            else if (c_1 === ']')
                depth--;
            advance(P.L);
        }
        subEnd = P.L.b;
    }
    var c = peek(P.L);
    var c1 = peek(P.L, 1);
    var op;
    if (c === '=' && c1 !== '=') {
        op = '=';
    }
    else if (c === '+' && c1 === '=') {
        op = '+=';
    }
    else {
        restoreLex(P.L, save);
        return null;
    }
    var nameNode = mk(P, 'variable_name', startB, nameEnd, []);
    // Subscript handling: wrap in subscript node if present
    var lhs = nameNode;
    if (subEnd > nameEnd) {
        var brOpen = mk(P, '[', nameEnd, nameEnd + 1, []);
        var idx = parseSubscriptIndex(P, nameEnd + 1, subEnd - 1);
        var brClose = mk(P, ']', subEnd - 1, subEnd, []);
        lhs = mk(P, 'subscript', startB, subEnd, [nameNode, brOpen, idx, brClose]);
    }
    var opStart = P.L.b;
    advance(P.L);
    if (op === '+=')
        advance(P.L);
    var opEnd = P.L.b;
    var opNode = mk(P, op, opStart, opEnd, []);
    var val = null;
    if (peek(P.L) === '(') {
        // Array
        var aoTok = nextToken(P.L, 'cmd');
        var aOpen = leaf(P, '(', aoTok);
        var elems = [aOpen];
        while (true) {
            skipBlanks(P.L);
            if (peek(P.L) === ')')
                break;
            var e = parseWord(P, 'arg');
            if (!e)
                break;
            elems.push(e);
        }
        var acTok = nextToken(P.L, 'cmd');
        var aClose = acTok.value === ')'
            ? leaf(P, ')', acTok)
            : mk(P, ')', aOpen.endIndex, aOpen.endIndex, []);
        elems.push(aClose);
        val = mk(P, 'array', aOpen.startIndex, aClose.endIndex, elems);
    }
    else {
        var c2 = peek(P.L);
        if (c2 &&
            c2 !== ' ' &&
            c2 !== '\t' &&
            c2 !== '\n' &&
            c2 !== ';' &&
            c2 !== '&' &&
            c2 !== '|' &&
            c2 !== ')' &&
            c2 !== '}') {
            val = parseWord(P, 'arg');
        }
    }
    var kids = val ? [lhs, opNode, val] : [lhs, opNode];
    var end = val ? val.endIndex : opEnd;
    return mk(P, 'variable_assignment', startB, end, kids);
}
/**
 * Parse subscript index content. Parsed arithmetically per tree-sitter grammar:
 * `${a[1+2]}` → binary_expression; `${a[++i]}` → unary_expression(word);
 * `${a[(($n+1))]}` → compound_statement(binary_expression). Falls back to
 * simple patterns (@, *) as word.
 */
function parseSubscriptIndexInline(P) {
    skipBlanks(P.L);
    var c = peek(P.L);
    // @ or * alone → word (associative array all-keys)
    if ((c === '@' || c === '*') && peek(P.L, 1) === ']') {
        var s = P.L.b;
        advance(P.L);
        return mk(P, 'word', s, P.L.b, []);
    }
    // ((expr)) → compound_statement wrapping the inner arithmetic
    if (c === '(' && peek(P.L, 1) === '(') {
        var oStart = P.L.b;
        advance(P.L);
        advance(P.L);
        var open_6 = mk(P, '((', oStart, P.L.b, []);
        var inner = parseArithExpr(P, '))', 'var');
        skipBlanks(P.L);
        var close_6;
        if (peek(P.L) === ')' && peek(P.L, 1) === ')') {
            var cs = P.L.b;
            advance(P.L);
            advance(P.L);
            close_6 = mk(P, '))', cs, P.L.b, []);
        }
        else {
            close_6 = mk(P, '))', P.L.b, P.L.b, []);
        }
        var kids = inner ? [open_6, inner, close_6] : [open_6, close_6];
        return mk(P, 'compound_statement', open_6.startIndex, close_6.endIndex, kids);
    }
    // Arithmetic — but bare identifiers in subscript use 'word' mode per
    // tree-sitter (${words[++counter]} → unary_expression(word)).
    return parseArithExpr(P, ']', 'word');
}
/** Legacy byte-range subscript index parser — kept for callers that pre-scan. */
function parseSubscriptIndex(P, startB, endB) {
    var text = sliceBytes(P, startB, endB);
    if (/^\d+$/.test(text))
        return mk(P, 'number', startB, endB, []);
    var m = /^\$([a-zA-Z_]\w*)$/.exec(text);
    if (m) {
        var dollar = mk(P, '$', startB, startB + 1, []);
        var vn = mk(P, 'variable_name', startB + 1, endB, []);
        return mk(P, 'simple_expansion', startB, endB, [dollar, vn]);
    }
    if (text.length === 2 && text[0] === '$' && SPECIAL_VARS.has(text[1])) {
        var dollar = mk(P, '$', startB, startB + 1, []);
        var vn = mk(P, 'special_variable_name', startB + 1, endB, []);
        return mk(P, 'simple_expansion', startB, endB, [dollar, vn]);
    }
    return mk(P, 'word', startB, endB, []);
}
/**
 * Can the current position start a redirect destination literal?
 * Returns false at redirect ops, terminators, or file-descriptor-prefixed ops
 * so file_redirect's repeat1($._literal) stops at the right boundary.
 */
function isRedirectLiteralStart(P) {
    var c = peek(P.L);
    if (c === '' || c === '\n')
        return false;
    // Shell terminators and operators
    if (c === '|' || c === '&' || c === ';' || c === '(' || c === ')')
        return false;
    // Redirect operators (< > with any suffix; <( >( handled by caller)
    if (c === '<' || c === '>') {
        // <( >( are process substitutions — those ARE literals
        return peek(P.L, 1) === '(';
    }
    // N< N> file descriptor prefix — starts a new redirect, not a literal
    if (isDigit(c)) {
        var j = P.L.i;
        while (j < P.L.len && isDigit(P.L.src[j]))
            j++;
        var after = j < P.L.len ? P.L.src[j] : '';
        if (after === '>' || after === '<')
            return false;
    }
    // `}` only terminates if we're in a context where it's a closer — but
    // file_redirect sees `}` as word char (e.g., `>$HOME}` is valid path char).
    // Actually `}` at top level terminates compound_statement — need to stop.
    if (c === '}')
        return false;
    // Test command closer — when parseSimpleCommand is called from `[` context,
    // `]` must terminate so parseCommand can return and `[` handler consume it.
    if (P.stopToken === ']' && c === ']')
        return false;
    return true;
}
/**
 * Parse a redirect operator + destination(s).
 * @param greedy When true, file_redirect consumes repeat1($._literal) per
 *   grammar's prec.left — `cmd >f a b c` attaches `a b c` to the redirect.
 *   When false (preRedirect context), takes only 1 destination because
 *   command's dynamic precedence beats redirected_statement's prec(-1).
 */
function tryParseRedirect(P, greedy) {
    if (greedy === void 0) { greedy = false; }
    var save = saveLex(P.L);
    skipBlanks(P.L);
    // File descriptor prefix?
    var fd = null;
    if (isDigit(peek(P.L))) {
        var startB = P.L.b;
        var j = P.L.i;
        while (j < P.L.len && isDigit(P.L.src[j]))
            j++;
        var after = j < P.L.len ? P.L.src[j] : '';
        if (after === '>' || after === '<') {
            while (P.L.i < j)
                advance(P.L);
            fd = mk(P, 'file_descriptor', startB, P.L.b, []);
        }
    }
    var t = nextToken(P.L, 'arg');
    if (t.type !== 'OP') {
        restoreLex(P.L, save);
        return null;
    }
    var v = t.value;
    if (v === '<<<') {
        var op = leaf(P, '<<<', t);
        skipBlanks(P.L);
        var target = parseWord(P, 'arg');
        var end = target ? target.endIndex : op.endIndex;
        var kids = target ? [op, target] : [op];
        return mk(P, 'herestring_redirect', fd ? fd.startIndex : op.startIndex, end, fd ? __spreadArray([fd], kids, true) : kids);
    }
    if (v === '<<' || v === '<<-') {
        var op = leaf(P, v, t);
        // Heredoc start — delimiter word (may be quoted)
        skipBlanks(P.L);
        var dStart = P.L.b;
        var quoted = false;
        var delim = '';
        var dc = peek(P.L);
        if (dc === "'" || dc === '"') {
            quoted = true;
            advance(P.L);
            while (P.L.i < P.L.len && peek(P.L) !== dc) {
                delim += peek(P.L);
                advance(P.L);
            }
            if (P.L.i < P.L.len)
                advance(P.L);
        }
        else if (dc === '\\') {
            // Backslash-escaped delimiter: \X — exactly one escaped char, body is
            // quoted (literal). Covers <<\EOF <<\' <<\\ etc.
            quoted = true;
            advance(P.L);
            if (P.L.i < P.L.len && peek(P.L) !== '\n') {
                delim += peek(P.L);
                advance(P.L);
            }
            // May be followed by more ident chars (e.g. <<\EOF → delim "EOF")
            while (P.L.i < P.L.len && isIdentChar(peek(P.L))) {
                delim += peek(P.L);
                advance(P.L);
            }
        }
        else {
            // Unquoted delimiter: bash accepts most non-metacharacters (not just
            // identifiers). Allow !, -, ., etc. — stop at shell metachars.
            while (P.L.i < P.L.len && isHeredocDelimChar(peek(P.L))) {
                delim += peek(P.L);
                advance(P.L);
            }
        }
        var dEnd = P.L.b;
        var startNode = mk(P, 'heredoc_start', dStart, dEnd, []);
        // Register pending heredoc — body scanned at next newline
        P.L.heredocs.push({
            delim: delim,
            stripTabs: v === '<<-',
            quoted: quoted,
            bodyStart: 0,
            bodyEnd: 0,
            endStart: 0,
            endEnd: 0,
        });
        var kids = fd ? [fd, op, startNode] : [op, startNode];
        var startIdx = fd ? fd.startIndex : op.startIndex;
        // SECURITY: tree-sitter nests any pipeline/list/file_redirect appearing
        // between heredoc_start and the newline as a CHILD of heredoc_redirect.
        // `ls <<'EOF' | rm -rf /tmp/evil` must not silently drop the rm. Parse
        // trailing words and file_redirects properly (ast.ts walkHeredocRedirect
        // fails closed on any unrecognized child via tooComplex). Pipeline / list
        // operators (| && || ;) are structurally complex — emit ERROR so the same
        // fail-closed path rejects them.
        while (true) {
            skipBlanks(P.L);
            var tc = peek(P.L);
            if (tc === '\n' || tc === '' || P.L.i >= P.L.len)
                break;
            // File redirect after delimiter: cat <<EOF > out.txt
            if (tc === '>' || tc === '<' || isDigit(tc)) {
                var rSave = saveLex(P.L);
                var r = tryParseRedirect(P);
                if (r && r.type === 'file_redirect') {
                    kids.push(r);
                    continue;
                }
                restoreLex(P.L, rSave);
            }
            // Pipeline after heredoc_start: `one <<EOF | grep two` — tree-sitter
            // nests the pipeline as a child of heredoc_redirect. ast.ts
            // walkHeredocRedirect fails closed on pipeline/command via tooComplex.
            if (tc === '|' && peek(P.L, 1) !== '|') {
                advance(P.L);
                skipBlanks(P.L);
                var pipeCmds = [];
                while (true) {
                    var cmd = parseCommand(P);
                    if (!cmd)
                        break;
                    pipeCmds.push(cmd);
                    skipBlanks(P.L);
                    if (peek(P.L) === '|' && peek(P.L, 1) !== '|') {
                        var ps = P.L.b;
                        advance(P.L);
                        pipeCmds.push(mk(P, '|', ps, P.L.b, []));
                        skipBlanks(P.L);
                        continue;
                    }
                    break;
                }
                if (pipeCmds.length > 0) {
                    var pl = pipeCmds[pipeCmds.length - 1];
                    // tree-sitter always wraps in pipeline after `|`, even single command
                    kids.push(mk(P, 'pipeline', pipeCmds[0].startIndex, pl.endIndex, pipeCmds));
                }
                continue;
            }
            // && / || after heredoc_start: `cat <<-EOF || die "..."` — tree-sitter
            // nests just the RHS command (not a list) as a child of heredoc_redirect.
            if ((tc === '&' && peek(P.L, 1) === '&') ||
                (tc === '|' && peek(P.L, 1) === '|')) {
                advance(P.L);
                advance(P.L);
                skipBlanks(P.L);
                var rhs = parseCommand(P);
                if (rhs)
                    kids.push(rhs);
                continue;
            }
            // Terminator / unhandled metachar — consume rest of line as ERROR so
            // ast.ts rejects it. Covers ; & ( )
            if (tc === '&' || tc === ';' || tc === '(' || tc === ')') {
                var eStart_1 = P.L.b;
                while (P.L.i < P.L.len && peek(P.L) !== '\n')
                    advance(P.L);
                kids.push(mk(P, 'ERROR', eStart_1, P.L.b, []));
                break;
            }
            // Trailing word argument: newins <<-EOF - org.freedesktop.service
            var w = parseWord(P, 'arg');
            if (w) {
                kids.push(w);
                continue;
            }
            // Unrecognized — consume rest of line as ERROR
            var eStart = P.L.b;
            while (P.L.i < P.L.len && peek(P.L) !== '\n')
                advance(P.L);
            if (P.L.b > eStart)
                kids.push(mk(P, 'ERROR', eStart, P.L.b, []));
            break;
        }
        return mk(P, 'heredoc_redirect', startIdx, P.L.b, kids);
    }
    // Close-fd variants: `<&-` `>&-` have OPTIONAL destination (0 or 1)
    if (v === '<&-' || v === '>&-') {
        var op = leaf(P, v, t);
        var kids = [];
        if (fd)
            kids.push(fd);
        kids.push(op);
        // Optional single destination — only consume if next is a literal
        skipBlanks(P.L);
        var dSave = saveLex(P.L);
        var dest = isRedirectLiteralStart(P) ? parseWord(P, 'arg') : null;
        if (dest) {
            kids.push(dest);
        }
        else {
            restoreLex(P.L, dSave);
        }
        var startIdx = fd ? fd.startIndex : op.startIndex;
        var end = dest ? dest.endIndex : op.endIndex;
        return mk(P, 'file_redirect', startIdx, end, kids);
    }
    if (v === '>' ||
        v === '>>' ||
        v === '>&' ||
        v === '>|' ||
        v === '&>' ||
        v === '&>>' ||
        v === '<' ||
        v === '<&') {
        var op = leaf(P, v, t);
        var kids = [];
        if (fd)
            kids.push(fd);
        kids.push(op);
        // Grammar: destination is repeat1($._literal) — greedily consume literals
        // until a non-literal (redirect op, terminator, etc). tree-sitter's
        // prec.left makes `cmd >f a b c` attach `a b c` to the file_redirect,
        // NOT to the command. Structural quirk but required for corpus parity.
        // In preRedirect context (greedy=false), take only 1 literal because
        // command's dynamic precedence beats redirected_statement's prec(-1).
        var end = op.endIndex;
        var taken = 0;
        while (true) {
            skipBlanks(P.L);
            if (!isRedirectLiteralStart(P))
                break;
            if (!greedy && taken >= 1)
                break;
            var tc = peek(P.L);
            var tc1 = peek(P.L, 1);
            var target = null;
            if ((tc === '<' || tc === '>') && tc1 === '(') {
                target = parseProcessSub(P);
            }
            else {
                target = parseWord(P, 'arg');
            }
            if (!target)
                break;
            kids.push(target);
            end = target.endIndex;
            taken++;
        }
        var startIdx = fd ? fd.startIndex : op.startIndex;
        return mk(P, 'file_redirect', startIdx, end, kids);
    }
    restoreLex(P.L, save);
    return null;
}
function parseProcessSub(P) {
    var c = peek(P.L);
    if ((c !== '<' && c !== '>') || peek(P.L, 1) !== '(')
        return null;
    var start = P.L.b;
    advance(P.L);
    advance(P.L);
    var open = mk(P, c + '(', start, P.L.b, []);
    var body = parseStatements(P, ')');
    skipBlanks(P.L);
    var close;
    if (peek(P.L) === ')') {
        var cs = P.L.b;
        advance(P.L);
        close = mk(P, ')', cs, P.L.b, []);
    }
    else {
        close = mk(P, ')', P.L.b, P.L.b, []);
    }
    return mk(P, 'process_substitution', start, close.endIndex, __spreadArray(__spreadArray([
        open
    ], body, true), [
        close,
    ], false));
}
function scanHeredocBodies(P) {
    // Skip to newline if not already there
    while (P.L.i < P.L.len && P.L.src[P.L.i] !== '\n')
        advance(P.L);
    if (P.L.i < P.L.len)
        advance(P.L);
    for (var _i = 0, _a = P.L.heredocs; _i < _a.length; _i++) {
        var hd = _a[_i];
        hd.bodyStart = P.L.b;
        var delimLen = hd.delim.length;
        while (P.L.i < P.L.len) {
            var lineStart = P.L.i;
            var lineStartB = P.L.b;
            // Skip leading tabs if <<-
            var checkI = lineStart;
            if (hd.stripTabs) {
                while (checkI < P.L.len && P.L.src[checkI] === '\t')
                    checkI++;
            }
            // Check if this line is the delimiter
            if (P.L.src.startsWith(hd.delim, checkI) &&
                (checkI + delimLen >= P.L.len ||
                    P.L.src[checkI + delimLen] === '\n' ||
                    P.L.src[checkI + delimLen] === '\r')) {
                hd.bodyEnd = lineStartB;
                // Advance past tabs
                while (P.L.i < checkI)
                    advance(P.L);
                hd.endStart = P.L.b;
                // Advance past delimiter
                for (var k = 0; k < delimLen; k++)
                    advance(P.L);
                hd.endEnd = P.L.b;
                // Skip trailing newline
                if (P.L.i < P.L.len && P.L.src[P.L.i] === '\n')
                    advance(P.L);
                return;
            }
            // Consume line
            while (P.L.i < P.L.len && P.L.src[P.L.i] !== '\n')
                advance(P.L);
            if (P.L.i < P.L.len)
                advance(P.L);
        }
        // Unterminated
        hd.bodyEnd = P.L.b;
        hd.endStart = P.L.b;
        hd.endEnd = P.L.b;
    }
}
function parseHeredocBodyContent(P, start, end) {
    // Parse expansions inside an unquoted heredoc body.
    var saved = saveLex(P.L);
    // Position lexer at body start
    restoreLexToByte(P, start);
    var out = [];
    var contentStart = P.L.b;
    // tree-sitter-bash's heredoc_body rule hides the initial text segment
    // (_heredoc_body_beginning) — only content AFTER the first expansion is
    // emitted as heredoc_content. Track whether we've seen an expansion yet.
    var sawExpansion = false;
    while (P.L.b < end) {
        var c = peek(P.L);
        // Backslash escapes suppress expansion: \$ \` stay literal in heredoc.
        if (c === '\\') {
            var nxt = peek(P.L, 1);
            if (nxt === '$' || nxt === '`' || nxt === '\\') {
                advance(P.L);
                advance(P.L);
                continue;
            }
            advance(P.L);
            continue;
        }
        if (c === '$' || c === '`') {
            var preB = P.L.b;
            var exp = parseDollarLike(P);
            // Bare `$` followed by non-name (e.g. `$'` in a regex) returns a lone
            // '$' leaf, not an expansion — treat as literal content, don't split.
            if (exp &&
                (exp.type === 'simple_expansion' ||
                    exp.type === 'expansion' ||
                    exp.type === 'command_substitution' ||
                    exp.type === 'arithmetic_expansion')) {
                if (sawExpansion && preB > contentStart) {
                    out.push(mk(P, 'heredoc_content', contentStart, preB, []));
                }
                out.push(exp);
                contentStart = P.L.b;
                sawExpansion = true;
            }
            continue;
        }
        advance(P.L);
    }
    // Only emit heredoc_content children if there were expansions — otherwise
    // the heredoc_body is a leaf node (tree-sitter convention).
    if (sawExpansion) {
        out.push(mk(P, 'heredoc_content', contentStart, end, []));
    }
    restoreLex(P.L, saved);
    return out;
}
function restoreLexToByte(P, targetByte) {
    if (!P.L.byteTable)
        byteAt(P.L, 0);
    var t = P.L.byteTable;
    var lo = 0;
    var hi = P.src.length;
    while (lo < hi) {
        var m = (lo + hi) >>> 1;
        if (t[m] < targetByte)
            lo = m + 1;
        else
            hi = m;
    }
    P.L.i = lo;
    P.L.b = targetByte;
}
/**
 * Parse a word-position element: bare word, string, expansion, or concatenation
 * thereof. Returns a single node; if multiple adjacent fragments, wraps in
 * concatenation.
 */
function parseWord(P, _ctx) {
    skipBlanks(P.L);
    var parts = [];
    while (P.L.i < P.L.len) {
        var c = peek(P.L);
        if (c === ' ' ||
            c === '\t' ||
            c === '\n' ||
            c === '\r' ||
            c === '' ||
            c === '|' ||
            c === '&' ||
            c === ';' ||
            c === '(' ||
            c === ')') {
            break;
        }
        // < > are redirect operators unless <( >( (process substitution)
        if (c === '<' || c === '>') {
            if (peek(P.L, 1) === '(') {
                var ps = parseProcessSub(P);
                if (ps)
                    parts.push(ps);
                continue;
            }
            break;
        }
        if (c === '"') {
            parts.push(parseDoubleQuoted(P));
            continue;
        }
        if (c === "'") {
            var tok = nextToken(P.L, 'arg');
            parts.push(leaf(P, 'raw_string', tok));
            continue;
        }
        if (c === '$') {
            var c1 = peek(P.L, 1);
            if (c1 === "'") {
                var tok = nextToken(P.L, 'arg');
                parts.push(leaf(P, 'ansi_c_string', tok));
                continue;
            }
            if (c1 === '"') {
                // Translated string: emit $ leaf + string node
                var dTok = {
                    type: 'DOLLAR',
                    value: '$',
                    start: P.L.b,
                    end: P.L.b + 1,
                };
                advance(P.L);
                parts.push(leaf(P, '$', dTok));
                parts.push(parseDoubleQuoted(P));
                continue;
            }
            if (c1 === '`') {
                // `$` followed by backtick — tree-sitter elides the $ entirely
                // and emits just (command_substitution). Consume $ and let next
                // iteration handle the backtick.
                advance(P.L);
                continue;
            }
            var exp = parseDollarLike(P);
            if (exp)
                parts.push(exp);
            continue;
        }
        if (c === '`') {
            if (P.inBacktick > 0)
                break;
            var bt = parseBacktick(P);
            if (bt)
                parts.push(bt);
            continue;
        }
        // Brace expression {1..5} or {a,b,c} — only if looks like one
        if (c === '{') {
            var be = tryParseBraceExpr(P);
            if (be) {
                parts.push(be);
                continue;
            }
            // SECURITY: if `{` is immediately followed by a command terminator
            // (; | & newline or EOF), it's a standalone word — don't slurp the
            // rest of the line via tryParseBraceLikeCat. `echo {;touch /tmp/evil`
            // must split on `;` so the security walker sees `touch`.
            var nc = peek(P.L, 1);
            if (nc === ';' ||
                nc === '|' ||
                nc === '&' ||
                nc === '\n' ||
                nc === '' ||
                nc === ')' ||
                nc === ' ' ||
                nc === '\t') {
                var bStart = P.L.b;
                advance(P.L);
                parts.push(mk(P, 'word', bStart, P.L.b, []));
                continue;
            }
            // Otherwise treat { and } as word fragments
            var cat = tryParseBraceLikeCat(P);
            if (cat) {
                for (var _i = 0, cat_1 = cat; _i < cat_1.length; _i++) {
                    var p = cat_1[_i];
                    parts.push(p);
                }
                continue;
            }
        }
        // Standalone `}` in arg position is a word (e.g., `echo }foo`).
        // parseBareWord breaks on `}` so handle it here.
        if (c === '}') {
            var bStart = P.L.b;
            advance(P.L);
            parts.push(mk(P, 'word', bStart, P.L.b, []));
            continue;
        }
        // `[` and `]` are single-char word fragments (tree-sitter splits at
        // brackets: `[:lower:]` → `[` `:lower:` `]`, `{o[k]}` → 6 words).
        if (c === '[' || c === ']') {
            var bStart = P.L.b;
            advance(P.L);
            parts.push(mk(P, 'word', bStart, P.L.b, []));
            continue;
        }
        // Bare word fragment
        var frag = parseBareWord(P);
        if (!frag)
            break;
        // `NN#${...}` or `NN#$(...)` → (number (expansion|command_substitution)).
        // Grammar: number can be seq(/-?(0x)?[0-9]+#/, choice(expansion, cmd_sub)).
        // `10#${cmd}` must NOT be concatenation — it's a single number node with
        // the expansion as child. Detect here: frag ends with `#`, next is $ {/(.
        if (frag.type === 'word' &&
            /^-?(0x)?[0-9]+#$/.test(frag.text) &&
            peek(P.L) === '$' &&
            (peek(P.L, 1) === '{' || peek(P.L, 1) === '(')) {
            var exp = parseDollarLike(P);
            if (exp) {
                // Prefix `NN#` is an anonymous pattern in grammar — only the
                // expansion/cmd_sub is a named child.
                parts.push(mk(P, 'number', frag.startIndex, exp.endIndex, [exp]));
                continue;
            }
        }
        parts.push(frag);
    }
    if (parts.length === 0)
        return null;
    if (parts.length === 1)
        return parts[0];
    // Concatenation
    var first = parts[0];
    var last = parts[parts.length - 1];
    return mk(P, 'concatenation', first.startIndex, last.endIndex, parts);
}
function parseBareWord(P) {
    var start = P.L.b;
    var startI = P.L.i;
    while (P.L.i < P.L.len) {
        var c = peek(P.L);
        if (c === '\\') {
            if (P.L.i + 1 >= P.L.len) {
                // Trailing unpaired `\` at true EOF — tree-sitter emits word WITHOUT
                // the `\` plus a sibling ERROR node. Stop here; caller emits ERROR.
                break;
            }
            var nx = P.L.src[P.L.i + 1];
            if (nx === '\n' || (nx === '\r' && P.L.src[P.L.i + 2] === '\n')) {
                // Line continuation BREAKS the word (tree-sitter quirk) — handles \r?\n
                break;
            }
            advance(P.L);
            advance(P.L);
            continue;
        }
        if (c === ' ' ||
            c === '\t' ||
            c === '\n' ||
            c === '\r' ||
            c === '' ||
            c === '|' ||
            c === '&' ||
            c === ';' ||
            c === '(' ||
            c === ')' ||
            c === '<' ||
            c === '>' ||
            c === '"' ||
            c === "'" ||
            c === '$' ||
            c === '`' ||
            c === '{' ||
            c === '}' ||
            c === '[' ||
            c === ']') {
            break;
        }
        advance(P.L);
    }
    if (P.L.b === start)
        return null;
    var text = P.src.slice(startI, P.L.i);
    var type = /^-?\d+$/.test(text) ? 'number' : 'word';
    return mk(P, type, start, P.L.b, []);
}
function tryParseBraceExpr(P) {
    // {N..M} where N, M are numbers or single chars
    var save = saveLex(P.L);
    if (peek(P.L) !== '{')
        return null;
    var oStart = P.L.b;
    advance(P.L);
    var oEnd = P.L.b;
    // First part
    var p1Start = P.L.b;
    while (isDigit(peek(P.L)) || isIdentStart(peek(P.L)))
        advance(P.L);
    var p1End = P.L.b;
    if (p1End === p1Start || peek(P.L) !== '.' || peek(P.L, 1) !== '.') {
        restoreLex(P.L, save);
        return null;
    }
    var dotStart = P.L.b;
    advance(P.L);
    advance(P.L);
    var dotEnd = P.L.b;
    var p2Start = P.L.b;
    while (isDigit(peek(P.L)) || isIdentStart(peek(P.L)))
        advance(P.L);
    var p2End = P.L.b;
    if (p2End === p2Start || peek(P.L) !== '}') {
        restoreLex(P.L, save);
        return null;
    }
    var cStart = P.L.b;
    advance(P.L);
    var cEnd = P.L.b;
    var p1Text = sliceBytes(P, p1Start, p1End);
    var p2Text = sliceBytes(P, p2Start, p2End);
    var p1IsNum = /^\d+$/.test(p1Text);
    var p2IsNum = /^\d+$/.test(p2Text);
    // Valid brace expression: both numbers OR both single chars. Mixed = reject.
    if (p1IsNum !== p2IsNum) {
        restoreLex(P.L, save);
        return null;
    }
    if (!p1IsNum && (p1Text.length !== 1 || p2Text.length !== 1)) {
        restoreLex(P.L, save);
        return null;
    }
    var p1Type = p1IsNum ? 'number' : 'word';
    var p2Type = p2IsNum ? 'number' : 'word';
    return mk(P, 'brace_expression', oStart, cEnd, [
        mk(P, '{', oStart, oEnd, []),
        mk(P, p1Type, p1Start, p1End, []),
        mk(P, '..', dotStart, dotEnd, []),
        mk(P, p2Type, p2Start, p2End, []),
        mk(P, '}', cStart, cEnd, []),
    ]);
}
function tryParseBraceLikeCat(P) {
    // {a,b,c} or {} → split into word fragments like tree-sitter does
    if (peek(P.L) !== '{')
        return null;
    var oStart = P.L.b;
    advance(P.L);
    var oEnd = P.L.b;
    var inner = [mk(P, 'word', oStart, oEnd, [])];
    while (P.L.i < P.L.len) {
        var bc = peek(P.L);
        // SECURITY: stop at command terminators so `{foo;rm x` splits correctly.
        if (bc === '}' ||
            bc === '\n' ||
            bc === ';' ||
            bc === '|' ||
            bc === '&' ||
            bc === ' ' ||
            bc === '\t' ||
            bc === '<' ||
            bc === '>' ||
            bc === '(' ||
            bc === ')') {
            break;
        }
        // `[` and `]` are single-char words: {o[k]} → { o [ k ] }
        if (bc === '[' || bc === ']') {
            var bStart = P.L.b;
            advance(P.L);
            inner.push(mk(P, 'word', bStart, P.L.b, []));
            continue;
        }
        var midStart = P.L.b;
        while (P.L.i < P.L.len) {
            var mc = peek(P.L);
            if (mc === '}' ||
                mc === '\n' ||
                mc === ';' ||
                mc === '|' ||
                mc === '&' ||
                mc === ' ' ||
                mc === '\t' ||
                mc === '<' ||
                mc === '>' ||
                mc === '(' ||
                mc === ')' ||
                mc === '[' ||
                mc === ']') {
                break;
            }
            advance(P.L);
        }
        var midEnd = P.L.b;
        if (midEnd > midStart) {
            var midText = sliceBytes(P, midStart, midEnd);
            var midType = /^-?\d+$/.test(midText) ? 'number' : 'word';
            inner.push(mk(P, midType, midStart, midEnd, []));
        }
        else {
            break;
        }
    }
    if (peek(P.L) === '}') {
        var cStart = P.L.b;
        advance(P.L);
        inner.push(mk(P, 'word', cStart, P.L.b, []));
    }
    return inner;
}
function parseDoubleQuoted(P) {
    var qStart = P.L.b;
    advance(P.L);
    var qEnd = P.L.b;
    var openQ = mk(P, '"', qStart, qEnd, []);
    var parts = [openQ];
    var contentStart = P.L.b;
    var contentStartI = P.L.i;
    var flushContent = function () {
        if (P.L.b > contentStart) {
            // Tree-sitter's extras rule /\s/ has higher precedence than
            // string_content (prec -1), so whitespace-only segments are elided.
            // `" ${x} "` → (string (expansion)) not (string (string_content)(expansion)(string_content)).
            // Note: this intentionally diverges from preserving all content — cc
            // tests relying on whitespace-only string_content need updating
            // (CCReconcile).
            var txt = P.src.slice(contentStartI, P.L.i);
            if (!/^[ \t]+$/.test(txt)) {
                parts.push(mk(P, 'string_content', contentStart, P.L.b, []));
            }
        }
    };
    while (P.L.i < P.L.len) {
        var c = peek(P.L);
        if (c === '"')
            break;
        if (c === '\\' && P.L.i + 1 < P.L.len) {
            advance(P.L);
            advance(P.L);
            continue;
        }
        if (c === '\n') {
            // Split string_content at newline
            flushContent();
            advance(P.L);
            contentStart = P.L.b;
            contentStartI = P.L.i;
            continue;
        }
        if (c === '$') {
            var c1 = peek(P.L, 1);
            if (c1 === '(' ||
                c1 === '{' ||
                isIdentStart(c1) ||
                SPECIAL_VARS.has(c1) ||
                isDigit(c1)) {
                flushContent();
                var exp = parseDollarLike(P);
                if (exp)
                    parts.push(exp);
                contentStart = P.L.b;
                contentStartI = P.L.i;
                continue;
            }
            // Bare $ not at end-of-string: tree-sitter emits it as an anonymous
            // '$' token, which splits string_content. $ immediately before the
            // closing " is absorbed into the preceding string_content.
            if (c1 !== '"' && c1 !== '') {
                flushContent();
                var dS = P.L.b;
                advance(P.L);
                parts.push(mk(P, '$', dS, P.L.b, []));
                contentStart = P.L.b;
                contentStartI = P.L.i;
                continue;
            }
        }
        if (c === '`') {
            flushContent();
            var bt = parseBacktick(P);
            if (bt)
                parts.push(bt);
            contentStart = P.L.b;
            contentStartI = P.L.i;
            continue;
        }
        advance(P.L);
    }
    flushContent();
    var close;
    if (peek(P.L) === '"') {
        var cStart = P.L.b;
        advance(P.L);
        close = mk(P, '"', cStart, P.L.b, []);
    }
    else {
        close = mk(P, '"', P.L.b, P.L.b, []);
    }
    parts.push(close);
    return mk(P, 'string', qStart, close.endIndex, parts);
}
function parseDollarLike(P) {
    var c1 = peek(P.L, 1);
    var dStart = P.L.b;
    if (c1 === '(' && peek(P.L, 2) === '(') {
        // $(( arithmetic ))
        advance(P.L);
        advance(P.L);
        advance(P.L);
        var open_7 = mk(P, '$((', dStart, P.L.b, []);
        var exprs = parseArithCommaList(P, '))', 'var');
        skipBlanks(P.L);
        var close_7;
        if (peek(P.L) === ')' && peek(P.L, 1) === ')') {
            var cStart = P.L.b;
            advance(P.L);
            advance(P.L);
            close_7 = mk(P, '))', cStart, P.L.b, []);
        }
        else {
            close_7 = mk(P, '))', P.L.b, P.L.b, []);
        }
        return mk(P, 'arithmetic_expansion', dStart, close_7.endIndex, __spreadArray(__spreadArray([
            open_7
        ], exprs, true), [
            close_7,
        ], false));
    }
    if (c1 === '[') {
        // $[ arithmetic ] — legacy bash syntax, same as $((...))
        advance(P.L);
        advance(P.L);
        var open_8 = mk(P, '$[', dStart, P.L.b, []);
        var exprs = parseArithCommaList(P, ']', 'var');
        skipBlanks(P.L);
        var close_8;
        if (peek(P.L) === ']') {
            var cStart = P.L.b;
            advance(P.L);
            close_8 = mk(P, ']', cStart, P.L.b, []);
        }
        else {
            close_8 = mk(P, ']', P.L.b, P.L.b, []);
        }
        return mk(P, 'arithmetic_expansion', dStart, close_8.endIndex, __spreadArray(__spreadArray([
            open_8
        ], exprs, true), [
            close_8,
        ], false));
    }
    if (c1 === '(') {
        advance(P.L);
        advance(P.L);
        var open_9 = mk(P, '$(', dStart, P.L.b, []);
        var body = parseStatements(P, ')');
        skipBlanks(P.L);
        var close_9;
        if (peek(P.L) === ')') {
            var cStart = P.L.b;
            advance(P.L);
            close_9 = mk(P, ')', cStart, P.L.b, []);
        }
        else {
            close_9 = mk(P, ')', P.L.b, P.L.b, []);
        }
        // $(< file) shorthand: unwrap redirected_statement → bare file_redirect
        // tree-sitter emits (command_substitution (file_redirect (word))) directly
        if (body.length === 1 &&
            body[0].type === 'redirected_statement' &&
            body[0].children.length === 1 &&
            body[0].children[0].type === 'file_redirect') {
            body = body[0].children;
        }
        return mk(P, 'command_substitution', dStart, close_9.endIndex, __spreadArray(__spreadArray([
            open_9
        ], body, true), [
            close_9,
        ], false));
    }
    if (c1 === '{') {
        advance(P.L);
        advance(P.L);
        var open_10 = mk(P, '${', dStart, P.L.b, []);
        var inner = parseExpansionBody(P);
        var close_10;
        if (peek(P.L) === '}') {
            var cStart = P.L.b;
            advance(P.L);
            close_10 = mk(P, '}', cStart, P.L.b, []);
        }
        else {
            close_10 = mk(P, '}', P.L.b, P.L.b, []);
        }
        return mk(P, 'expansion', dStart, close_10.endIndex, __spreadArray(__spreadArray([open_10], inner, true), [close_10], false));
    }
    // Simple expansion $VAR or $? $$ $@ etc
    advance(P.L);
    var dEnd = P.L.b;
    var dollar = mk(P, '$', dStart, dEnd, []);
    var nc = peek(P.L);
    // $_ is special_variable_name only when not followed by more ident chars
    if (nc === '_' && !isIdentChar(peek(P.L, 1))) {
        var vStart = P.L.b;
        advance(P.L);
        var vn = mk(P, 'special_variable_name', vStart, P.L.b, []);
        return mk(P, 'simple_expansion', dStart, P.L.b, [dollar, vn]);
    }
    if (isIdentStart(nc)) {
        var vStart = P.L.b;
        while (isIdentChar(peek(P.L)))
            advance(P.L);
        var vn = mk(P, 'variable_name', vStart, P.L.b, []);
        return mk(P, 'simple_expansion', dStart, P.L.b, [dollar, vn]);
    }
    if (isDigit(nc)) {
        var vStart = P.L.b;
        advance(P.L);
        var vn = mk(P, 'variable_name', vStart, P.L.b, []);
        return mk(P, 'simple_expansion', dStart, P.L.b, [dollar, vn]);
    }
    if (SPECIAL_VARS.has(nc)) {
        var vStart = P.L.b;
        advance(P.L);
        var vn = mk(P, 'special_variable_name', vStart, P.L.b, []);
        return mk(P, 'simple_expansion', dStart, P.L.b, [dollar, vn]);
    }
    // Bare $ — just a $ leaf (tree-sitter treats trailing $ as literal)
    return dollar;
}
function parseExpansionBody(P) {
    var out = [];
    skipBlanks(P.L);
    // Bizarre cases: ${#!} ${!#} ${!##} ${!# } ${!## } all emit empty (expansion)
    // — both # and ! become anonymous nodes when only combined with each other
    // and optional trailing space before }. Note ${!##/} does NOT match (has
    // content after), so it parses normally as (special_variable_name)(regex).
    {
        var c0 = peek(P.L);
        var c1 = peek(P.L, 1);
        if (c0 === '#' && c1 === '!' && peek(P.L, 2) === '}') {
            advance(P.L);
            advance(P.L);
            return out;
        }
        if (c0 === '!' && c1 === '#') {
            // ${!#} ${!##} with optional trailing space then }
            var j = 2;
            if (peek(P.L, j) === '#')
                j++;
            if (peek(P.L, j) === ' ')
                j++;
            if (peek(P.L, j) === '}') {
                while (j-- > 0)
                    advance(P.L);
                return out;
            }
        }
    }
    // Optional # prefix for length
    if (peek(P.L) === '#') {
        var s = P.L.b;
        advance(P.L);
        out.push(mk(P, '#', s, P.L.b, []));
    }
    // Optional ! prefix for indirect expansion: ${!varname} ${!prefix*} ${!prefix@}
    // Only when followed by an identifier — ${!} alone is special var $!
    // Also = ~ prefixes (zsh-style ${=var} ${~var})
    var pc = peek(P.L);
    if ((pc === '!' || pc === '=' || pc === '~') &&
        (isIdentStart(peek(P.L, 1)) || isDigit(peek(P.L, 1)))) {
        var s = P.L.b;
        advance(P.L);
        out.push(mk(P, pc, s, P.L.b, []));
    }
    skipBlanks(P.L);
    // Variable name
    if (isIdentStart(peek(P.L))) {
        var s = P.L.b;
        while (isIdentChar(peek(P.L)))
            advance(P.L);
        out.push(mk(P, 'variable_name', s, P.L.b, []));
    }
    else if (isDigit(peek(P.L))) {
        var s = P.L.b;
        while (isDigit(peek(P.L)))
            advance(P.L);
        out.push(mk(P, 'variable_name', s, P.L.b, []));
    }
    else if (SPECIAL_VARS.has(peek(P.L))) {
        var s = P.L.b;
        advance(P.L);
        out.push(mk(P, 'special_variable_name', s, P.L.b, []));
    }
    // Optional subscript [idx] — parsed arithmetically
    if (peek(P.L) === '[') {
        var varNode = out[out.length - 1];
        var brOpen = P.L.b;
        advance(P.L);
        var brOpenNode = mk(P, '[', brOpen, P.L.b, []);
        var idx = parseSubscriptIndexInline(P);
        skipBlanks(P.L);
        var brClose = P.L.b;
        if (peek(P.L) === ']')
            advance(P.L);
        var brCloseNode = mk(P, ']', brClose, P.L.b, []);
        if (varNode) {
            var kids = idx
                ? [varNode, brOpenNode, idx, brCloseNode]
                : [varNode, brOpenNode, brCloseNode];
            out[out.length - 1] = mk(P, 'subscript', varNode.startIndex, P.L.b, kids);
        }
    }
    skipBlanks(P.L);
    // Trailing * or @ for indirect expansion (${!prefix*} ${!prefix@}) or
    // @operator for parameter transformation (${var@U} ${var@Q}) — anonymous
    var tc = peek(P.L);
    if ((tc === '*' || tc === '@') && peek(P.L, 1) === '}') {
        var s = P.L.b;
        advance(P.L);
        out.push(mk(P, tc, s, P.L.b, []));
        return out;
    }
    if (tc === '@' && isIdentStart(peek(P.L, 1))) {
        // ${var@U} transformation — @ is anonymous, consume op char(s)
        var s = P.L.b;
        advance(P.L);
        out.push(mk(P, '@', s, P.L.b, []));
        while (isIdentChar(peek(P.L)))
            advance(P.L);
        return out;
    }
    // Operator :- := :? :+ - = ? + # ## % %% / // ^ ^^ , ,, etc.
    var c = peek(P.L);
    // Bare `:` substring operator ${var:off:len} — offset and length parsed
    // arithmetically. Must come BEFORE the generic operator handling so `(` after
    // `:` goes to parenthesized_expression not the array path. `:-` `:=` `:?`
    // `:+` (no space) remain default-value operators; `: -1` (with space before
    // -1) is substring with negative offset.
    if (c === ':') {
        var c1 = peek(P.L, 1);
        // `:\n` or `:}` — empty substring expansion, emits nothing (variable_name only)
        if (c1 === '\n' || c1 === '}') {
            advance(P.L);
            while (peek(P.L) === '\n')
                advance(P.L);
            return out;
        }
        if (c1 !== '-' && c1 !== '=' && c1 !== '?' && c1 !== '+') {
            advance(P.L);
            skipBlanks(P.L);
            // Offset — arithmetic. `-N` at top level is a single number node per
            // tree-sitter; inside parens it's unary_expression(number).
            var offC = peek(P.L);
            var off = void 0;
            if (offC === '-' && isDigit(peek(P.L, 1))) {
                var ns = P.L.b;
                advance(P.L);
                while (isDigit(peek(P.L)))
                    advance(P.L);
                off = mk(P, 'number', ns, P.L.b, []);
            }
            else {
                off = parseArithExpr(P, ':}', 'var');
            }
            if (off)
                out.push(off);
            skipBlanks(P.L);
            if (peek(P.L) === ':') {
                advance(P.L);
                skipBlanks(P.L);
                var lenC = peek(P.L);
                var len = void 0;
                if (lenC === '-' && isDigit(peek(P.L, 1))) {
                    var ns = P.L.b;
                    advance(P.L);
                    while (isDigit(peek(P.L)))
                        advance(P.L);
                    len = mk(P, 'number', ns, P.L.b, []);
                }
                else {
                    len = parseArithExpr(P, '}', 'var');
                }
                if (len)
                    out.push(len);
            }
            return out;
        }
    }
    if (c === ':' ||
        c === '#' ||
        c === '%' ||
        c === '/' ||
        c === '^' ||
        c === ',' ||
        c === '-' ||
        c === '=' ||
        c === '?' ||
        c === '+') {
        var s = P.L.b;
        var c1 = peek(P.L, 1);
        var op = c;
        if (c === ':' && (c1 === '-' || c1 === '=' || c1 === '?' || c1 === '+')) {
            advance(P.L);
            advance(P.L);
            op = c + c1;
        }
        else if ((c === '#' || c === '%' || c === '/' || c === '^' || c === ',') &&
            c1 === c) {
            // Doubled operators: ## %% // ^^ ,,
            advance(P.L);
            advance(P.L);
            op = c + c;
        }
        else {
            advance(P.L);
        }
        out.push(mk(P, op, s, P.L.b, []));
        // Rest is the default/replacement — parse as word or regex until }
        // Pattern-matching operators (# ## % %% / // ^ ^^ , ,,) emit regex;
        // value-substitution operators (:- := :? :+ - = ? + :) emit word.
        // `/` and `//` split at next `/` into (regex)+(word) for pat/repl.
        var isPattern = op === '#' ||
            op === '##' ||
            op === '%' ||
            op === '%%' ||
            op === '/' ||
            op === '//' ||
            op === '^' ||
            op === '^^' ||
            op === ',' ||
            op === ',,';
        if (op === '/' || op === '//') {
            // Optional /# or /% anchor prefix — anonymous node
            var ac = peek(P.L);
            if (ac === '#' || ac === '%') {
                var aStart = P.L.b;
                advance(P.L);
                out.push(mk(P, ac, aStart, P.L.b, []));
            }
            // Pattern: per grammar _expansion_regex_replacement, pattern is
            // choice(regex, string, cmd_sub, seq(string, regex)). If it STARTS
            // with ", emit (string) and any trailing chars become (regex).
            // `${v//"${old}"/}` → (string(expansion)); `${v//"${c}"\//}` →
            // (string)(regex).
            if (peek(P.L) === '"') {
                out.push(parseDoubleQuoted(P));
                var tail = parseExpansionRest(P, 'regex', true);
                if (tail)
                    out.push(tail);
            }
            else {
                var regex = parseExpansionRest(P, 'regex', true);
                if (regex)
                    out.push(regex);
            }
            if (peek(P.L) === '/') {
                var sepStart = P.L.b;
                advance(P.L);
                out.push(mk(P, '/', sepStart, P.L.b, []));
                // Replacement: per grammar, choice includes `seq(cmd_sub, word)`
                // which emits TWO siblings (not concatenation). Also `(` at start
                // of replacement is a regular word char, NOT array — unlike `:-`
                // default-value context. `${v/(/(Gentoo ${x}, }` replacement
                // `(Gentoo ${x}, ` is (concatenation (word)(expansion)(word)).
                var repl = parseExpansionRest(P, 'replword', false);
                if (repl) {
                    // seq(cmd_sub, word) special case → siblings. Detected when
                    // replacement is a concatenation of exactly 2 parts with first
                    // being command_substitution.
                    if (repl.type === 'concatenation' &&
                        repl.children.length === 2 &&
                        repl.children[0].type === 'command_substitution') {
                        out.push(repl.children[0]);
                        out.push(repl.children[1]);
                    }
                    else {
                        out.push(repl);
                    }
                }
            }
        }
        else if (op === '#' || op === '##' || op === '%' || op === '%%') {
            // Pattern-removal: per grammar _expansion_regex, pattern is
            // repeat(choice(regex, string, raw_string, ')')). Each quote/string
            // is a SIBLING, not absorbed into one regex. `${f%'str'*}` →
            // (raw_string)(regex); `${f/'str'*}` (slash) stays single regex.
            for (var _i = 0, _a = parseExpansionRegexSegmented(P); _i < _a.length; _i++) {
                var p = _a[_i];
                out.push(p);
            }
        }
        else {
            var rest = parseExpansionRest(P, isPattern ? 'regex' : 'word', false);
            if (rest)
                out.push(rest);
        }
    }
    return out;
}
function parseExpansionRest(P, nodeType, stopAtSlash) {
    // Don't skipBlanks — `${var:- }` space IS the word. Stop at } or newline
    // (`${var:\n}` emits no word). stopAtSlash=true stops at `/` for pat/repl
    // split in ${var/pat/repl}. nodeType 'replword' is word-mode for the
    // replacement in `/` `//` — same as 'word' but `(` is NOT array.
    var start = P.L.b;
    // Value-substitution RHS starting with `(` parses as array: ${var:-(x)} →
    // (expansion (variable_name) (array (word))). Only for 'word' context (not
    // pattern-matching operators which emit regex, and not 'replword' where `(`
    // is a regular char per grammar `_expansion_regex_replacement`).
    if (nodeType === 'word' && peek(P.L) === '(') {
        advance(P.L);
        var open_11 = mk(P, '(', start, P.L.b, []);
        var elems = [open_11];
        while (P.L.i < P.L.len) {
            skipBlanks(P.L);
            var c = peek(P.L);
            if (c === ')' || c === '}' || c === '\n' || c === '')
                break;
            var wStart = P.L.b;
            while (P.L.i < P.L.len) {
                var wc = peek(P.L);
                if (wc === ')' ||
                    wc === '}' ||
                    wc === ' ' ||
                    wc === '\t' ||
                    wc === '\n' ||
                    wc === '') {
                    break;
                }
                advance(P.L);
            }
            if (P.L.b > wStart)
                elems.push(mk(P, 'word', wStart, P.L.b, []));
            else
                break;
        }
        if (peek(P.L) === ')') {
            var cStart = P.L.b;
            advance(P.L);
            elems.push(mk(P, ')', cStart, P.L.b, []));
        }
        while (peek(P.L) === '\n')
            advance(P.L);
        return mk(P, 'array', start, P.L.b, elems);
    }
    // REGEX mode: flat single-span scan. Quotes are opaque (skipped past so
    // `/` inside them doesn't break stopAtSlash), but NOT emitted as separate
    // nodes — the entire range becomes one regex node.
    if (nodeType === 'regex') {
        var braceDepth_1 = 0;
        while (P.L.i < P.L.len) {
            var c = peek(P.L);
            if (c === '\n')
                break;
            if (braceDepth_1 === 0) {
                if (c === '}')
                    break;
                if (stopAtSlash && c === '/')
                    break;
            }
            if (c === '\\' && P.L.i + 1 < P.L.len) {
                advance(P.L);
                advance(P.L);
                continue;
            }
            if (c === '"' || c === "'") {
                advance(P.L);
                while (P.L.i < P.L.len && peek(P.L) !== c) {
                    if (peek(P.L) === '\\' && P.L.i + 1 < P.L.len)
                        advance(P.L);
                    advance(P.L);
                }
                if (peek(P.L) === c)
                    advance(P.L);
                continue;
            }
            // Skip past nested ${...} $(...) $[...] so their } / don't terminate us
            if (c === '$') {
                var c1 = peek(P.L, 1);
                if (c1 === '{') {
                    var d = 0;
                    advance(P.L);
                    advance(P.L);
                    d++;
                    while (P.L.i < P.L.len && d > 0) {
                        var nc = peek(P.L);
                        if (nc === '{')
                            d++;
                        else if (nc === '}')
                            d--;
                        advance(P.L);
                    }
                    continue;
                }
                if (c1 === '(') {
                    var d = 0;
                    advance(P.L);
                    advance(P.L);
                    d++;
                    while (P.L.i < P.L.len && d > 0) {
                        var nc = peek(P.L);
                        if (nc === '(')
                            d++;
                        else if (nc === ')')
                            d--;
                        advance(P.L);
                    }
                    continue;
                }
            }
            if (c === '{')
                braceDepth_1++;
            else if (c === '}' && braceDepth_1 > 0)
                braceDepth_1--;
            advance(P.L);
        }
        var end = P.L.b;
        while (peek(P.L) === '\n')
            advance(P.L);
        if (end === start)
            return null;
        return mk(P, 'regex', start, end, []);
    }
    // WORD mode: segmenting parser — recognize nested ${...}, $(...), $'...',
    // "...", '...', $ident, <(...)/>(...); bare chars accumulate into word
    // segments. Multiple parts → wrapped in concatenation.
    var parts = [];
    var segStart = P.L.b;
    var braceDepth = 0;
    var flushSeg = function () {
        if (P.L.b > segStart) {
            parts.push(mk(P, 'word', segStart, P.L.b, []));
        }
    };
    while (P.L.i < P.L.len) {
        var c = peek(P.L);
        if (c === '\n')
            break;
        if (braceDepth === 0) {
            if (c === '}')
                break;
            if (stopAtSlash && c === '/')
                break;
        }
        if (c === '\\' && P.L.i + 1 < P.L.len) {
            advance(P.L);
            advance(P.L);
            continue;
        }
        var c1 = peek(P.L, 1);
        if (c === '$') {
            if (c1 === '{' || c1 === '(' || c1 === '[') {
                flushSeg();
                var exp = parseDollarLike(P);
                if (exp)
                    parts.push(exp);
                segStart = P.L.b;
                continue;
            }
            if (c1 === "'") {
                // $'...' ANSI-C string
                flushSeg();
                var aStart = P.L.b;
                advance(P.L);
                advance(P.L);
                while (P.L.i < P.L.len && peek(P.L) !== "'") {
                    if (peek(P.L) === '\\' && P.L.i + 1 < P.L.len)
                        advance(P.L);
                    advance(P.L);
                }
                if (peek(P.L) === "'")
                    advance(P.L);
                parts.push(mk(P, 'ansi_c_string', aStart, P.L.b, []));
                segStart = P.L.b;
                continue;
            }
            if (isIdentStart(c1) || isDigit(c1) || SPECIAL_VARS.has(c1)) {
                flushSeg();
                var exp = parseDollarLike(P);
                if (exp)
                    parts.push(exp);
                segStart = P.L.b;
                continue;
            }
        }
        if (c === '"') {
            flushSeg();
            parts.push(parseDoubleQuoted(P));
            segStart = P.L.b;
            continue;
        }
        if (c === "'") {
            flushSeg();
            var rStart = P.L.b;
            advance(P.L);
            while (P.L.i < P.L.len && peek(P.L) !== "'")
                advance(P.L);
            if (peek(P.L) === "'")
                advance(P.L);
            parts.push(mk(P, 'raw_string', rStart, P.L.b, []));
            segStart = P.L.b;
            continue;
        }
        if ((c === '<' || c === '>') && c1 === '(') {
            flushSeg();
            var ps = parseProcessSub(P);
            if (ps)
                parts.push(ps);
            segStart = P.L.b;
            continue;
        }
        if (c === '`') {
            flushSeg();
            var bt = parseBacktick(P);
            if (bt)
                parts.push(bt);
            segStart = P.L.b;
            continue;
        }
        // Brace tracking so nested {a,b} brace-expansion chars don't prematurely
        // terminate (rare, but the `?` in `${cond}? (` should be treated as word).
        if (c === '{')
            braceDepth++;
        else if (c === '}' && braceDepth > 0)
            braceDepth--;
        advance(P.L);
    }
    flushSeg();
    // Consume trailing newlines before } so caller sees }
    while (peek(P.L) === '\n')
        advance(P.L);
    // Tree-sitter skips leading whitespace (extras) in expansion RHS when
    // there's content after: `${2+ ${2}}` → just (expansion). But `${v:- }`
    // (space-only RHS) keeps the space as (word). So drop leading whitespace-
    // only word segment if it's NOT the only part.
    if (parts.length > 1 &&
        parts[0].type === 'word' &&
        /^[ \t]+$/.test(parts[0].text)) {
        parts.shift();
    }
    if (parts.length === 0)
        return null;
    if (parts.length === 1)
        return parts[0];
    // Multiple parts: wrap in concatenation (word mode keeps concat wrapping;
    // regex mode also concats per tree-sitter for mixed quote+glob patterns).
    var last = parts[parts.length - 1];
    return mk(P, 'concatenation', parts[0].startIndex, last.endIndex, parts);
}
// Pattern for # ## % %% operators — per grammar _expansion_regex:
// repeat(choice(regex, string, raw_string, ')', /\s+/→regex)). Each quote
// becomes a SIBLING node, not absorbed. `${f%'str'*}` → (raw_string)(regex).
function parseExpansionRegexSegmented(P) {
    var out = [];
    var segStart = P.L.b;
    var flushRegex = function () {
        if (P.L.b > segStart)
            out.push(mk(P, 'regex', segStart, P.L.b, []));
    };
    while (P.L.i < P.L.len) {
        var c = peek(P.L);
        if (c === '}' || c === '\n')
            break;
        if (c === '\\' && P.L.i + 1 < P.L.len) {
            advance(P.L);
            advance(P.L);
            continue;
        }
        if (c === '"') {
            flushRegex();
            out.push(parseDoubleQuoted(P));
            segStart = P.L.b;
            continue;
        }
        if (c === "'") {
            flushRegex();
            var rStart = P.L.b;
            advance(P.L);
            while (P.L.i < P.L.len && peek(P.L) !== "'")
                advance(P.L);
            if (peek(P.L) === "'")
                advance(P.L);
            out.push(mk(P, 'raw_string', rStart, P.L.b, []));
            segStart = P.L.b;
            continue;
        }
        // Nested ${...} $(...) — opaque scan so their } doesn't terminate us
        if (c === '$') {
            var c1 = peek(P.L, 1);
            if (c1 === '{') {
                var d = 1;
                advance(P.L);
                advance(P.L);
                while (P.L.i < P.L.len && d > 0) {
                    var nc = peek(P.L);
                    if (nc === '{')
                        d++;
                    else if (nc === '}')
                        d--;
                    advance(P.L);
                }
                continue;
            }
            if (c1 === '(') {
                var d = 1;
                advance(P.L);
                advance(P.L);
                while (P.L.i < P.L.len && d > 0) {
                    var nc = peek(P.L);
                    if (nc === '(')
                        d++;
                    else if (nc === ')')
                        d--;
                    advance(P.L);
                }
                continue;
            }
        }
        advance(P.L);
    }
    flushRegex();
    while (peek(P.L) === '\n')
        advance(P.L);
    return out;
}
function parseBacktick(P) {
    var start = P.L.b;
    advance(P.L);
    var open = mk(P, '`', start, P.L.b, []);
    P.inBacktick++;
    // Parse statements inline — stop at closing backtick
    var body = [];
    while (true) {
        skipBlanks(P.L);
        if (peek(P.L) === '`' || peek(P.L) === '')
            break;
        var save = saveLex(P.L);
        var t = nextToken(P.L, 'cmd');
        if (t.type === 'EOF' || t.type === 'BACKTICK') {
            restoreLex(P.L, save);
            break;
        }
        if (t.type === 'NEWLINE')
            continue;
        restoreLex(P.L, save);
        var stmt = parseAndOr(P);
        if (!stmt)
            break;
        body.push(stmt);
        skipBlanks(P.L);
        if (peek(P.L) === '`')
            break;
        var save2 = saveLex(P.L);
        var sep = nextToken(P.L, 'cmd');
        if (sep.type === 'OP' && (sep.value === ';' || sep.value === '&')) {
            body.push(leaf(P, sep.value, sep));
        }
        else if (sep.type !== 'NEWLINE') {
            restoreLex(P.L, save2);
        }
    }
    P.inBacktick--;
    var close;
    if (peek(P.L) === '`') {
        var cStart = P.L.b;
        advance(P.L);
        close = mk(P, '`', cStart, P.L.b, []);
    }
    else {
        close = mk(P, '`', P.L.b, P.L.b, []);
    }
    // Empty backticks (whitespace/newline only) are elided entirely by
    // tree-sitter — used as a line-continuation hack: "foo"`<newline>`"bar"
    // → (concatenation (string) (string)) with no command_substitution.
    if (body.length === 0)
        return null;
    return mk(P, 'command_substitution', start, close.endIndex, __spreadArray(__spreadArray([
        open
    ], body, true), [
        close,
    ], false));
}
function parseIf(P, ifTok) {
    var ifKw = leaf(P, 'if', ifTok);
    var kids = [ifKw];
    var cond = parseStatements(P, null);
    kids.push.apply(kids, cond);
    consumeKeyword(P, 'then', kids);
    var body = parseStatements(P, null);
    kids.push.apply(kids, body);
    while (true) {
        var save = saveLex(P.L);
        var t = nextToken(P.L, 'cmd');
        if (t.type === 'WORD' && t.value === 'elif') {
            var eKw = leaf(P, 'elif', t);
            var eCond = parseStatements(P, null);
            var eKids = __spreadArray([eKw], eCond, true);
            consumeKeyword(P, 'then', eKids);
            var eBody = parseStatements(P, null);
            eKids.push.apply(eKids, eBody);
            var last_1 = eKids[eKids.length - 1];
            kids.push(mk(P, 'elif_clause', eKw.startIndex, last_1.endIndex, eKids));
        }
        else if (t.type === 'WORD' && t.value === 'else') {
            var elKw = leaf(P, 'else', t);
            var elBody = parseStatements(P, null);
            var last_2 = elBody.length > 0 ? elBody[elBody.length - 1] : elKw;
            kids.push(mk(P, 'else_clause', elKw.startIndex, last_2.endIndex, __spreadArray([elKw], elBody, true)));
        }
        else {
            restoreLex(P.L, save);
            break;
        }
    }
    consumeKeyword(P, 'fi', kids);
    var last = kids[kids.length - 1];
    return mk(P, 'if_statement', ifKw.startIndex, last.endIndex, kids);
}
function parseWhile(P, kwTok) {
    var kw = leaf(P, kwTok.value, kwTok);
    var kids = [kw];
    var cond = parseStatements(P, null);
    kids.push.apply(kids, cond);
    var dg = parseDoGroup(P);
    if (dg)
        kids.push(dg);
    var last = kids[kids.length - 1];
    return mk(P, 'while_statement', kw.startIndex, last.endIndex, kids);
}
function parseFor(P, forTok) {
    var forKw = leaf(P, forTok.value, forTok);
    skipBlanks(P.L);
    // C-style for (( ; ; )) — only for `for`, not `select`
    if (forTok.value === 'for' && peek(P.L) === '(' && peek(P.L, 1) === '(') {
        var oStart = P.L.b;
        advance(P.L);
        advance(P.L);
        var open_12 = mk(P, '((', oStart, P.L.b, []);
        var kids_1 = [forKw, open_12];
        // init; cond; update — all three use 'assign' mode so `c = expr` emits
        // variable_assignment, while bare idents (c in `c<=5`) → word. Each
        // clause may be a comma-separated list.
        for (var k = 0; k < 3; k++) {
            skipBlanks(P.L);
            var es = parseArithCommaList(P, k < 2 ? ';' : '))', 'assign');
            kids_1.push.apply(kids_1, es);
            if (k < 2) {
                if (peek(P.L) === ';') {
                    var s = P.L.b;
                    advance(P.L);
                    kids_1.push(mk(P, ';', s, P.L.b, []));
                }
            }
        }
        skipBlanks(P.L);
        if (peek(P.L) === ')' && peek(P.L, 1) === ')') {
            var cStart = P.L.b;
            advance(P.L);
            advance(P.L);
            kids_1.push(mk(P, '))', cStart, P.L.b, []));
        }
        // Optional ; or newline
        var save_1 = saveLex(P.L);
        var sep_1 = nextToken(P.L, 'cmd');
        if (sep_1.type === 'OP' && sep_1.value === ';') {
            kids_1.push(leaf(P, ';', sep_1));
        }
        else if (sep_1.type !== 'NEWLINE') {
            restoreLex(P.L, save_1);
        }
        var dg_1 = parseDoGroup(P);
        if (dg_1) {
            kids_1.push(dg_1);
        }
        else {
            // C-style for can also use `{ ... }` body instead of `do ... done`
            skipNewlines(P);
            skipBlanks(P.L);
            if (peek(P.L) === '{') {
                var bOpen = P.L.b;
                advance(P.L);
                var brace = mk(P, '{', bOpen, P.L.b, []);
                var body = parseStatements(P, '}');
                var bClose = void 0;
                if (peek(P.L) === '}') {
                    var cs = P.L.b;
                    advance(P.L);
                    bClose = mk(P, '}', cs, P.L.b, []);
                }
                else {
                    bClose = mk(P, '}', P.L.b, P.L.b, []);
                }
                kids_1.push(mk(P, 'compound_statement', brace.startIndex, bClose.endIndex, __spreadArray(__spreadArray([
                    brace
                ], body, true), [
                    bClose,
                ], false)));
            }
        }
        var last_3 = kids_1[kids_1.length - 1];
        return mk(P, 'c_style_for_statement', forKw.startIndex, last_3.endIndex, kids_1);
    }
    // Regular for VAR in words; do ... done
    var kids = [forKw];
    var varTok = nextToken(P.L, 'arg');
    kids.push(mk(P, 'variable_name', varTok.start, varTok.end, []));
    skipBlanks(P.L);
    var save = saveLex(P.L);
    var inTok = nextToken(P.L, 'arg');
    if (inTok.type === 'WORD' && inTok.value === 'in') {
        kids.push(leaf(P, 'in', inTok));
        while (true) {
            skipBlanks(P.L);
            var c = peek(P.L);
            if (c === ';' || c === '\n' || c === '')
                break;
            var w = parseWord(P, 'arg');
            if (!w)
                break;
            kids.push(w);
        }
    }
    else {
        restoreLex(P.L, save);
    }
    // Separator
    var save2 = saveLex(P.L);
    var sep = nextToken(P.L, 'cmd');
    if (sep.type === 'OP' && sep.value === ';') {
        kids.push(leaf(P, ';', sep));
    }
    else if (sep.type !== 'NEWLINE') {
        restoreLex(P.L, save2);
    }
    var dg = parseDoGroup(P);
    if (dg)
        kids.push(dg);
    var last = kids[kids.length - 1];
    return mk(P, 'for_statement', forKw.startIndex, last.endIndex, kids);
}
function parseDoGroup(P) {
    skipNewlines(P);
    var save = saveLex(P.L);
    var doTok = nextToken(P.L, 'cmd');
    if (doTok.type !== 'WORD' || doTok.value !== 'do') {
        restoreLex(P.L, save);
        return null;
    }
    var doKw = leaf(P, 'do', doTok);
    var body = parseStatements(P, null);
    var kids = __spreadArray([doKw], body, true);
    consumeKeyword(P, 'done', kids);
    var last = kids[kids.length - 1];
    return mk(P, 'do_group', doKw.startIndex, last.endIndex, kids);
}
function parseCase(P, caseTok) {
    var caseKw = leaf(P, 'case', caseTok);
    var kids = [caseKw];
    skipBlanks(P.L);
    var word = parseWord(P, 'arg');
    if (word)
        kids.push(word);
    skipBlanks(P.L);
    consumeKeyword(P, 'in', kids);
    skipNewlines(P);
    while (true) {
        skipBlanks(P.L);
        skipNewlines(P);
        var save = saveLex(P.L);
        var t = nextToken(P.L, 'arg');
        if (t.type === 'WORD' && t.value === 'esac') {
            kids.push(leaf(P, 'esac', t));
            break;
        }
        if (t.type === 'EOF')
            break;
        restoreLex(P.L, save);
        var item = parseCaseItem(P);
        if (!item)
            break;
        kids.push(item);
    }
    var last = kids[kids.length - 1];
    return mk(P, 'case_statement', caseKw.startIndex, last.endIndex, kids);
}
function parseCaseItem(P) {
    skipBlanks(P.L);
    var start = P.L.b;
    var kids = [];
    // Optional leading '(' before pattern — bash allows (pattern) syntax
    if (peek(P.L) === '(') {
        var s = P.L.b;
        advance(P.L);
        kids.push(mk(P, '(', s, P.L.b, []));
    }
    // Pattern(s)
    var isFirstAlt = true;
    while (true) {
        skipBlanks(P.L);
        var c = peek(P.L);
        if (c === ')' || c === '')
            break;
        var pats = parseCasePattern(P);
        if (pats.length === 0)
            break;
        // tree-sitter quirk: first alternative with quotes is inlined as flat
        // siblings; subsequent alternatives are wrapped in (concatenation) with
        // `word` instead of `extglob_pattern` for bare segments.
        if (!isFirstAlt && pats.length > 1) {
            var rewritten = pats.map(function (p) {
                return p.type === 'extglob_pattern'
                    ? mk(P, 'word', p.startIndex, p.endIndex, [])
                    : p;
            });
            var first = rewritten[0];
            var last_4 = rewritten[rewritten.length - 1];
            kids.push(mk(P, 'concatenation', first.startIndex, last_4.endIndex, rewritten));
        }
        else {
            kids.push.apply(kids, pats);
        }
        isFirstAlt = false;
        skipBlanks(P.L);
        // \<newline> line continuation between alternatives
        if (peek(P.L) === '\\' && peek(P.L, 1) === '\n') {
            advance(P.L);
            advance(P.L);
            skipBlanks(P.L);
        }
        if (peek(P.L) === '|') {
            var s = P.L.b;
            advance(P.L);
            kids.push(mk(P, '|', s, P.L.b, []));
            // \<newline> after | is also a line continuation
            if (peek(P.L) === '\\' && peek(P.L, 1) === '\n') {
                advance(P.L);
                advance(P.L);
            }
        }
        else {
            break;
        }
    }
    if (peek(P.L) === ')') {
        var s = P.L.b;
        advance(P.L);
        kids.push(mk(P, ')', s, P.L.b, []));
    }
    var body = parseStatements(P, null);
    kids.push.apply(kids, body);
    var save = saveLex(P.L);
    var term = nextToken(P.L, 'cmd');
    if (term.type === 'OP' &&
        (term.value === ';;' || term.value === ';&' || term.value === ';;&')) {
        kids.push(leaf(P, term.value, term));
    }
    else {
        restoreLex(P.L, save);
    }
    if (kids.length === 0)
        return null;
    // tree-sitter quirk: case_item with EMPTY body and a single pattern matching
    // extglob-operator-char-prefix (no actual glob metachars) downgrades to word.
    // `-o) owner=$2 ;;` (has body) → extglob_pattern; `-g) ;;` (empty) → word.
    if (body.length === 0) {
        for (var i = 0; i < kids.length; i++) {
            var k = kids[i];
            if (k.type !== 'extglob_pattern')
                continue;
            var text = sliceBytes(P, k.startIndex, k.endIndex);
            if (/^[-+?*@!][a-zA-Z]/.test(text) && !/[*?(]/.test(text)) {
                kids[i] = mk(P, 'word', k.startIndex, k.endIndex, []);
            }
        }
    }
    var last = kids[kids.length - 1];
    return mk(P, 'case_item', start, last.endIndex, kids);
}
function parseCasePattern(P) {
    skipBlanks(P.L);
    var save = saveLex(P.L);
    var start = P.L.b;
    var startI = P.L.i;
    var parenDepth = 0;
    var hasDollar = false;
    var hasBracketOutsideParen = false;
    var hasQuote = false;
    while (P.L.i < P.L.len) {
        var c = peek(P.L);
        if (c === '\\' && P.L.i + 1 < P.L.len) {
            // Escaped char — consume both (handles `bar\ baz` as single pattern)
            // \<newline> is a line continuation; eat it but stay in pattern.
            advance(P.L);
            advance(P.L);
            continue;
        }
        if (c === '"' || c === "'") {
            hasQuote = true;
            // Skip past the quoted segment so its content (spaces, |, etc.) doesn't
            // break the peek-ahead scan.
            advance(P.L);
            while (P.L.i < P.L.len && peek(P.L) !== c) {
                if (peek(P.L) === '\\' && P.L.i + 1 < P.L.len)
                    advance(P.L);
                advance(P.L);
            }
            if (peek(P.L) === c)
                advance(P.L);
            continue;
        }
        // Paren counting: any ( inside pattern opens a scope; don't break at ) or |
        // until balanced. Handles extglob *(a|b) and nested shapes *([0-9])([0-9]).
        if (c === '(') {
            parenDepth++;
            advance(P.L);
            continue;
        }
        if (parenDepth > 0) {
            if (c === ')') {
                parenDepth--;
                advance(P.L);
                continue;
            }
            if (c === '\n')
                break;
            advance(P.L);
            continue;
        }
        if (c === ')' || c === '|' || c === ' ' || c === '\t' || c === '\n')
            break;
        if (c === '$')
            hasDollar = true;
        if (c === '[')
            hasBracketOutsideParen = true;
        advance(P.L);
    }
    if (P.L.b === start)
        return [];
    var text = P.src.slice(startI, P.L.i);
    var hasExtglobParen = /[*?+@!]\(/.test(text);
    // Quoted segments in pattern: tree-sitter splits at quote boundaries into
    // multiple sibling nodes. `*"foo"*` → (extglob_pattern)(string)(extglob_pattern).
    // Re-scan with a segmenting pass.
    if (hasQuote && !hasExtglobParen) {
        restoreLex(P.L, save);
        return parseCasePatternSegmented(P);
    }
    // tree-sitter splits patterns with [ or $ into concatenation via word parsing
    // UNLESS pattern has extglob parens (those override and emit extglob_pattern).
    // `*.[1357]` → concat(word word number word); `${PN}.pot` → concat(expansion word);
    // but `*([0-9])` → extglob_pattern (has extglob paren).
    if (!hasExtglobParen && (hasDollar || hasBracketOutsideParen)) {
        restoreLex(P.L, save);
        var w = parseWord(P, 'arg');
        return w ? [w] : [];
    }
    // Patterns starting with extglob operator chars (+ - ? * @ !) followed by
    // identifier chars are extglob_pattern per tree-sitter, even without parens
    // or glob metachars. `-o)` → extglob_pattern; plain `foo)` → word.
    var type = hasExtglobParen || /[*?]/.test(text) || /^[-+?*@!][a-zA-Z]/.test(text)
        ? 'extglob_pattern'
        : 'word';
    return [mk(P, type, start, P.L.b, [])];
}
// Segmented scan for case patterns containing quotes: `*"foo"*` →
// [extglob_pattern, string, extglob_pattern]. Bare segments → extglob_pattern
// if they have */?, else word. Stops at ) | space tab newline outside quotes.
function parseCasePatternSegmented(P) {
    var parts = [];
    var segStart = P.L.b;
    var segStartI = P.L.i;
    var flushSeg = function () {
        if (P.L.i > segStartI) {
            var t = P.src.slice(segStartI, P.L.i);
            var type = /[*?]/.test(t) ? 'extglob_pattern' : 'word';
            parts.push(mk(P, type, segStart, P.L.b, []));
        }
    };
    while (P.L.i < P.L.len) {
        var c = peek(P.L);
        if (c === '\\' && P.L.i + 1 < P.L.len) {
            advance(P.L);
            advance(P.L);
            continue;
        }
        if (c === '"') {
            flushSeg();
            parts.push(parseDoubleQuoted(P));
            segStart = P.L.b;
            segStartI = P.L.i;
            continue;
        }
        if (c === "'") {
            flushSeg();
            var tok = nextToken(P.L, 'arg');
            parts.push(leaf(P, 'raw_string', tok));
            segStart = P.L.b;
            segStartI = P.L.i;
            continue;
        }
        if (c === ')' || c === '|' || c === ' ' || c === '\t' || c === '\n')
            break;
        advance(P.L);
    }
    flushSeg();
    return parts;
}
function parseFunction(P, fnTok) {
    var fnKw = leaf(P, 'function', fnTok);
    skipBlanks(P.L);
    var nameTok = nextToken(P.L, 'arg');
    var name = mk(P, 'word', nameTok.start, nameTok.end, []);
    var kids = [fnKw, name];
    skipBlanks(P.L);
    if (peek(P.L) === '(' && peek(P.L, 1) === ')') {
        var o = nextToken(P.L, 'cmd');
        var c = nextToken(P.L, 'cmd');
        kids.push(leaf(P, '(', o));
        kids.push(leaf(P, ')', c));
    }
    skipBlanks(P.L);
    skipNewlines(P);
    var body = parseCommand(P);
    if (body) {
        // Hoist redirects from redirected_statement(compound_statement, ...) to
        // function_definition level per tree-sitter grammar
        if (body.type === 'redirected_statement' &&
            body.children.length >= 2 &&
            body.children[0].type === 'compound_statement') {
            kids.push.apply(kids, body.children);
        }
        else {
            kids.push(body);
        }
    }
    var last = kids[kids.length - 1];
    return mk(P, 'function_definition', fnKw.startIndex, last.endIndex, kids);
}
function parseDeclaration(P, kwTok) {
    var _a;
    var kw = leaf(P, kwTok.value, kwTok);
    var kids = [kw];
    while (true) {
        skipBlanks(P.L);
        var c = peek(P.L);
        if (c === '' ||
            c === '\n' ||
            c === ';' ||
            c === '&' ||
            c === '|' ||
            c === ')' ||
            c === '<' ||
            c === '>') {
            break;
        }
        var a = tryParseAssignment(P);
        if (a) {
            kids.push(a);
            continue;
        }
        // Quoted string or concatenation: `export "FOO=bar"`, `export 'X'`
        if (c === '"' || c === "'" || c === '$') {
            var w = parseWord(P, 'arg');
            if (w) {
                kids.push(w);
                continue;
            }
            break;
        }
        // Flag like -a or bare variable name
        var save = saveLex(P.L);
        var tok = nextToken(P.L, 'arg');
        if (tok.type === 'WORD' || tok.type === 'NUMBER') {
            if (tok.value.startsWith('-')) {
                kids.push(leaf(P, 'word', tok));
            }
            else if (isIdentStart((_a = tok.value[0]) !== null && _a !== void 0 ? _a : '')) {
                kids.push(mk(P, 'variable_name', tok.start, tok.end, []));
            }
            else {
                kids.push(leaf(P, 'word', tok));
            }
        }
        else {
            restoreLex(P.L, save);
            break;
        }
    }
    var last = kids[kids.length - 1];
    return mk(P, 'declaration_command', kw.startIndex, last.endIndex, kids);
}
function parseUnset(P, kwTok) {
    var kw = leaf(P, 'unset', kwTok);
    var kids = [kw];
    while (true) {
        skipBlanks(P.L);
        var c = peek(P.L);
        if (c === '' ||
            c === '\n' ||
            c === ';' ||
            c === '&' ||
            c === '|' ||
            c === ')' ||
            c === '<' ||
            c === '>') {
            break;
        }
        // SECURITY: use parseWord (not raw nextToken) so quoted strings like
        // `unset 'a[$(id)]'` emit a raw_string child that ast.ts can reject.
        // Previously `break` silently dropped non-WORD args — hiding the
        // arithmetic-subscript code-exec vector from the security walker.
        var arg = parseWord(P, 'arg');
        if (!arg)
            break;
        if (arg.type === 'word') {
            if (arg.text.startsWith('-')) {
                kids.push(arg);
            }
            else {
                kids.push(mk(P, 'variable_name', arg.startIndex, arg.endIndex, []));
            }
        }
        else {
            kids.push(arg);
        }
    }
    var last = kids[kids.length - 1];
    return mk(P, 'unset_command', kw.startIndex, last.endIndex, kids);
}
function consumeKeyword(P, name, kids) {
    skipNewlines(P);
    var save = saveLex(P.L);
    var t = nextToken(P.L, 'cmd');
    if (t.type === 'WORD' && t.value === name) {
        kids.push(leaf(P, name, t));
    }
    else {
        restoreLex(P.L, save);
    }
}
// ───────────────────── Test & Arithmetic Expressions ─────────────────────
function parseTestExpr(P, closer) {
    return parseTestOr(P, closer);
}
function parseTestOr(P, closer) {
    var left = parseTestAnd(P, closer);
    if (!left)
        return null;
    while (true) {
        skipBlanks(P.L);
        var save = saveLex(P.L);
        if (peek(P.L) === '|' && peek(P.L, 1) === '|') {
            var s = P.L.b;
            advance(P.L);
            advance(P.L);
            var op = mk(P, '||', s, P.L.b, []);
            var right = parseTestAnd(P, closer);
            if (!right) {
                restoreLex(P.L, save);
                break;
            }
            left = mk(P, 'binary_expression', left.startIndex, right.endIndex, [
                left,
                op,
                right,
            ]);
        }
        else {
            break;
        }
    }
    return left;
}
function parseTestAnd(P, closer) {
    var left = parseTestUnary(P, closer);
    if (!left)
        return null;
    while (true) {
        skipBlanks(P.L);
        if (peek(P.L) === '&' && peek(P.L, 1) === '&') {
            var s = P.L.b;
            advance(P.L);
            advance(P.L);
            var op = mk(P, '&&', s, P.L.b, []);
            var right = parseTestUnary(P, closer);
            if (!right)
                break;
            left = mk(P, 'binary_expression', left.startIndex, right.endIndex, [
                left,
                op,
                right,
            ]);
        }
        else {
            break;
        }
    }
    return left;
}
function parseTestUnary(P, closer) {
    skipBlanks(P.L);
    var c = peek(P.L);
    if (c === '(') {
        var s = P.L.b;
        advance(P.L);
        var open_13 = mk(P, '(', s, P.L.b, []);
        var inner = parseTestOr(P, closer);
        skipBlanks(P.L);
        var close_11;
        if (peek(P.L) === ')') {
            var cs = P.L.b;
            advance(P.L);
            close_11 = mk(P, ')', cs, P.L.b, []);
        }
        else {
            close_11 = mk(P, ')', P.L.b, P.L.b, []);
        }
        var kids = inner ? [open_13, inner, close_11] : [open_13, close_11];
        return mk(P, 'parenthesized_expression', open_13.startIndex, close_11.endIndex, kids);
    }
    return parseTestBinary(P, closer);
}
/**
 * Parse `!`-negated or test-operator (`-f`) or parenthesized primary — but NOT
 * a binary comparison. Used as LHS of binary_expression so `! x =~ y` binds
 * `!` to `x` only, not the whole `x =~ y`.
 */
function parseTestNegatablePrimary(P, closer) {
    skipBlanks(P.L);
    var c = peek(P.L);
    if (c === '!') {
        var s = P.L.b;
        advance(P.L);
        var bang = mk(P, '!', s, P.L.b, []);
        var inner = parseTestNegatablePrimary(P, closer);
        if (!inner)
            return bang;
        return mk(P, 'unary_expression', bang.startIndex, inner.endIndex, [
            bang,
            inner,
        ]);
    }
    if (c === '-' && isIdentStart(peek(P.L, 1))) {
        var s = P.L.b;
        advance(P.L);
        while (isIdentChar(peek(P.L)))
            advance(P.L);
        var op = mk(P, 'test_operator', s, P.L.b, []);
        skipBlanks(P.L);
        var arg = parseTestPrimary(P, closer);
        if (!arg)
            return op;
        return mk(P, 'unary_expression', op.startIndex, arg.endIndex, [op, arg]);
    }
    return parseTestPrimary(P, closer);
}
function parseTestBinary(P, closer) {
    var _a, _b;
    skipBlanks(P.L);
    // `!` in test context binds tighter than =~/==.
    // `[[ ! "x" =~ y ]]` → (binary_expression (unary_expression (string)) (regex))
    // `[[ ! -f x ]]` → (unary_expression ! (unary_expression (test_operator) (word)))
    var left = parseTestNegatablePrimary(P, closer);
    if (!left)
        return null;
    skipBlanks(P.L);
    // Binary comparison: == != =~ -eq -lt etc.
    var c = peek(P.L);
    var c1 = peek(P.L, 1);
    var op = null;
    var os = P.L.b;
    if (c === '=' && c1 === '=') {
        advance(P.L);
        advance(P.L);
        op = mk(P, '==', os, P.L.b, []);
    }
    else if (c === '!' && c1 === '=') {
        advance(P.L);
        advance(P.L);
        op = mk(P, '!=', os, P.L.b, []);
    }
    else if (c === '=' && c1 === '~') {
        advance(P.L);
        advance(P.L);
        op = mk(P, '=~', os, P.L.b, []);
    }
    else if (c === '=' && c1 !== '=') {
        advance(P.L);
        op = mk(P, '=', os, P.L.b, []);
    }
    else if (c === '<' && c1 !== '<') {
        advance(P.L);
        op = mk(P, '<', os, P.L.b, []);
    }
    else if (c === '>' && c1 !== '>') {
        advance(P.L);
        op = mk(P, '>', os, P.L.b, []);
    }
    else if (c === '-' && isIdentStart(c1)) {
        advance(P.L);
        while (isIdentChar(peek(P.L)))
            advance(P.L);
        op = mk(P, 'test_operator', os, P.L.b, []);
    }
    if (!op)
        return left;
    skipBlanks(P.L);
    // In [[ ]], RHS of ==/!=/=/=~ gets special pattern parsing: paren counting
    // so @(a|b|c) doesn't break on |, and segments become extglob_pattern/regex.
    if (closer === ']]') {
        var opText = op.type;
        if (opText === '=~') {
            skipBlanks(P.L);
            // If the ENTIRE RHS is a quoted string, emit string/raw_string not
            // regex: `[[ "$x" =~ "$y" ]]` → (binary_expression (string) (string)).
            // If there's content after the quote (`' boop '(.*)$`), the whole RHS
            // stays a single (regex). Peek past the quote to check.
            var rc = peek(P.L);
            var rhs = null;
            if (rc === '"' || rc === "'") {
                var save = saveLex(P.L);
                var quoted = rc === '"'
                    ? parseDoubleQuoted(P)
                    : leaf(P, 'raw_string', nextToken(P.L, 'arg'));
                // Check if RHS ends here: only whitespace then ]] or &&/|| or newline
                var j = P.L.i;
                while (j < P.L.len && (P.src[j] === ' ' || P.src[j] === '\t'))
                    j++;
                var nc = (_a = P.src[j]) !== null && _a !== void 0 ? _a : '';
                var nc1 = (_b = P.src[j + 1]) !== null && _b !== void 0 ? _b : '';
                if ((nc === ']' && nc1 === ']') ||
                    (nc === '&' && nc1 === '&') ||
                    (nc === '|' && nc1 === '|') ||
                    nc === '\n' ||
                    nc === '') {
                    rhs = quoted;
                }
                else {
                    restoreLex(P.L, save);
                }
            }
            if (!rhs)
                rhs = parseTestRegexRhs(P);
            if (!rhs)
                return left;
            return mk(P, 'binary_expression', left.startIndex, rhs.endIndex, [
                left,
                op,
                rhs,
            ]);
        }
        // Single `=` emits (regex) per tree-sitter; `==` and `!=` emit extglob_pattern
        if (opText === '=') {
            var rhs = parseTestRegexRhs(P);
            if (!rhs)
                return left;
            return mk(P, 'binary_expression', left.startIndex, rhs.endIndex, [
                left,
                op,
                rhs,
            ]);
        }
        if (opText === '==' || opText === '!=') {
            var parts = parseTestExtglobRhs(P);
            if (parts.length === 0)
                return left;
            var last = parts[parts.length - 1];
            return mk(P, 'binary_expression', left.startIndex, last.endIndex, __spreadArray([
                left,
                op
            ], parts, true));
        }
    }
    var right = parseTestPrimary(P, closer);
    if (!right)
        return left;
    return mk(P, 'binary_expression', left.startIndex, right.endIndex, [
        left,
        op,
        right,
    ]);
}
// RHS of =~ in [[ ]] — scan as single (regex) node with paren/bracket counting
// so | ( ) inside the regex don't break parsing. Stop at ]] or ws+&&/||.
function parseTestRegexRhs(P) {
    var _a, _b;
    skipBlanks(P.L);
    var start = P.L.b;
    var parenDepth = 0;
    var bracketDepth = 0;
    while (P.L.i < P.L.len) {
        var c = peek(P.L);
        if (c === '\\' && P.L.i + 1 < P.L.len) {
            advance(P.L);
            advance(P.L);
            continue;
        }
        if (c === '\n')
            break;
        if (parenDepth === 0 && bracketDepth === 0) {
            if (c === ']' && peek(P.L, 1) === ']')
                break;
            if (c === ' ' || c === '\t') {
                // Peek past blanks for ]] or &&/||
                var j = P.L.i;
                while (j < P.L.len && (P.L.src[j] === ' ' || P.L.src[j] === '\t'))
                    j++;
                var nc = (_a = P.L.src[j]) !== null && _a !== void 0 ? _a : '';
                var nc1 = (_b = P.L.src[j + 1]) !== null && _b !== void 0 ? _b : '';
                if ((nc === ']' && nc1 === ']') ||
                    (nc === '&' && nc1 === '&') ||
                    (nc === '|' && nc1 === '|')) {
                    break;
                }
                advance(P.L);
                continue;
            }
        }
        if (c === '(')
            parenDepth++;
        else if (c === ')' && parenDepth > 0)
            parenDepth--;
        else if (c === '[')
            bracketDepth++;
        else if (c === ']' && bracketDepth > 0)
            bracketDepth--;
        advance(P.L);
    }
    if (P.L.b === start)
        return null;
    return mk(P, 'regex', start, P.L.b, []);
}
// RHS of ==/!=/= in [[ ]] — returns array of parts. Bare text → extglob_pattern
// (with paren counting for @(a|b)); $(...)/${}/quoted → proper node types.
// Multiple parts become flat children of binary_expression per tree-sitter.
function parseTestExtglobRhs(P) {
    var _a, _b;
    skipBlanks(P.L);
    var parts = [];
    var segStart = P.L.b;
    var segStartI = P.L.i;
    var parenDepth = 0;
    var flushSeg = function () {
        if (P.L.i > segStartI) {
            var text = P.src.slice(segStartI, P.L.i);
            // Pure number stays number; everything else is extglob_pattern
            var type = /^\d+$/.test(text) ? 'number' : 'extglob_pattern';
            parts.push(mk(P, type, segStart, P.L.b, []));
        }
    };
    while (P.L.i < P.L.len) {
        var c = peek(P.L);
        if (c === '\\' && P.L.i + 1 < P.L.len) {
            advance(P.L);
            advance(P.L);
            continue;
        }
        if (c === '\n')
            break;
        if (parenDepth === 0) {
            if (c === ']' && peek(P.L, 1) === ']')
                break;
            if (c === ' ' || c === '\t') {
                var j = P.L.i;
                while (j < P.L.len && (P.L.src[j] === ' ' || P.L.src[j] === '\t'))
                    j++;
                var nc = (_a = P.L.src[j]) !== null && _a !== void 0 ? _a : '';
                var nc1 = (_b = P.L.src[j + 1]) !== null && _b !== void 0 ? _b : '';
                if ((nc === ']' && nc1 === ']') ||
                    (nc === '&' && nc1 === '&') ||
                    (nc === '|' && nc1 === '|')) {
                    break;
                }
                advance(P.L);
                continue;
            }
        }
        // $ " ' must be parsed even inside @( ) extglob parens — parseDollarLike
        // consumes matching ) so parenDepth stays consistent.
        if (c === '$') {
            var c1 = peek(P.L, 1);
            if (c1 === '(' ||
                c1 === '{' ||
                isIdentStart(c1) ||
                SPECIAL_VARS.has(c1)) {
                flushSeg();
                var exp = parseDollarLike(P);
                if (exp)
                    parts.push(exp);
                segStart = P.L.b;
                segStartI = P.L.i;
                continue;
            }
        }
        if (c === '"') {
            flushSeg();
            parts.push(parseDoubleQuoted(P));
            segStart = P.L.b;
            segStartI = P.L.i;
            continue;
        }
        if (c === "'") {
            flushSeg();
            var tok = nextToken(P.L, 'arg');
            parts.push(leaf(P, 'raw_string', tok));
            segStart = P.L.b;
            segStartI = P.L.i;
            continue;
        }
        if (c === '(')
            parenDepth++;
        else if (c === ')' && parenDepth > 0)
            parenDepth--;
        advance(P.L);
    }
    flushSeg();
    return parts;
}
function parseTestPrimary(P, closer) {
    skipBlanks(P.L);
    // Stop at closer
    if (closer === ']' && peek(P.L) === ']')
        return null;
    if (closer === ']]' && peek(P.L) === ']' && peek(P.L, 1) === ']')
        return null;
    return parseWord(P, 'arg');
}
/** Operator precedence table (higher = tighter binding). */
var ARITH_PREC = {
    '=': 2,
    '+=': 2,
    '-=': 2,
    '*=': 2,
    '/=': 2,
    '%=': 2,
    '<<=': 2,
    '>>=': 2,
    '&=': 2,
    '^=': 2,
    '|=': 2,
    '||': 4,
    '&&': 5,
    '|': 6,
    '^': 7,
    '&': 8,
    '==': 9,
    '!=': 9,
    '<': 10,
    '>': 10,
    '<=': 10,
    '>=': 10,
    '<<': 11,
    '>>': 11,
    '+': 12,
    '-': 12,
    '*': 13,
    '/': 13,
    '%': 13,
    '**': 14,
};
/** Right-associative operators (assignment and exponent). */
var ARITH_RIGHT_ASSOC = new Set([
    '=',
    '+=',
    '-=',
    '*=',
    '/=',
    '%=',
    '<<=',
    '>>=',
    '&=',
    '^=',
    '|=',
    '**',
]);
function parseArithExpr(P, stop, mode) {
    if (mode === void 0) { mode = 'var'; }
    return parseArithTernary(P, stop, mode);
}
/** Top-level: comma-separated list. arithmetic_expansion emits multiple children. */
function parseArithCommaList(P, stop, mode) {
    if (mode === void 0) { mode = 'var'; }
    var out = [];
    while (true) {
        var e = parseArithTernary(P, stop, mode);
        if (e)
            out.push(e);
        skipBlanks(P.L);
        if (peek(P.L) === ',' && !isArithStop(P, stop)) {
            advance(P.L);
            continue;
        }
        break;
    }
    return out;
}
function parseArithTernary(P, stop, mode) {
    var cond = parseArithBinary(P, stop, 0, mode);
    if (!cond)
        return null;
    skipBlanks(P.L);
    if (peek(P.L) === '?') {
        var qs = P.L.b;
        advance(P.L);
        var q = mk(P, '?', qs, P.L.b, []);
        var t = parseArithBinary(P, ':', 0, mode);
        skipBlanks(P.L);
        var colon = void 0;
        if (peek(P.L) === ':') {
            var cs = P.L.b;
            advance(P.L);
            colon = mk(P, ':', cs, P.L.b, []);
        }
        else {
            colon = mk(P, ':', P.L.b, P.L.b, []);
        }
        var f = parseArithTernary(P, stop, mode);
        var last = f !== null && f !== void 0 ? f : colon;
        var kids = [cond, q];
        if (t)
            kids.push(t);
        kids.push(colon);
        if (f)
            kids.push(f);
        return mk(P, 'ternary_expression', cond.startIndex, last.endIndex, kids);
    }
    return cond;
}
/** Scan next arithmetic binary operator; returns [text, length] or null. */
function scanArithOp(P) {
    var c = peek(P.L);
    var c1 = peek(P.L, 1);
    var c2 = peek(P.L, 2);
    // 3-char: <<= >>=
    if (c === '<' && c1 === '<' && c2 === '=')
        return ['<<=', 3];
    if (c === '>' && c1 === '>' && c2 === '=')
        return ['>>=', 3];
    // 2-char
    if (c === '*' && c1 === '*')
        return ['**', 2];
    if (c === '<' && c1 === '<')
        return ['<<', 2];
    if (c === '>' && c1 === '>')
        return ['>>', 2];
    if (c === '=' && c1 === '=')
        return ['==', 2];
    if (c === '!' && c1 === '=')
        return ['!=', 2];
    if (c === '<' && c1 === '=')
        return ['<=', 2];
    if (c === '>' && c1 === '=')
        return ['>=', 2];
    if (c === '&' && c1 === '&')
        return ['&&', 2];
    if (c === '|' && c1 === '|')
        return ['||', 2];
    if (c === '+' && c1 === '=')
        return ['+=', 2];
    if (c === '-' && c1 === '=')
        return ['-=', 2];
    if (c === '*' && c1 === '=')
        return ['*=', 2];
    if (c === '/' && c1 === '=')
        return ['/=', 2];
    if (c === '%' && c1 === '=')
        return ['%=', 2];
    if (c === '&' && c1 === '=')
        return ['&=', 2];
    if (c === '^' && c1 === '=')
        return ['^=', 2];
    if (c === '|' && c1 === '=')
        return ['|=', 2];
    // 1-char — but NOT ++ -- (those are pre/postfix)
    if (c === '+' && c1 !== '+')
        return ['+', 1];
    if (c === '-' && c1 !== '-')
        return ['-', 1];
    if (c === '*')
        return ['*', 1];
    if (c === '/')
        return ['/', 1];
    if (c === '%')
        return ['%', 1];
    if (c === '<')
        return ['<', 1];
    if (c === '>')
        return ['>', 1];
    if (c === '&')
        return ['&', 1];
    if (c === '|')
        return ['|', 1];
    if (c === '^')
        return ['^', 1];
    if (c === '=')
        return ['=', 1];
    return null;
}
/** Precedence-climbing binary expression parser. */
function parseArithBinary(P, stop, minPrec, mode) {
    var left = parseArithUnary(P, stop, mode);
    if (!left)
        return null;
    while (true) {
        skipBlanks(P.L);
        if (isArithStop(P, stop))
            break;
        if (peek(P.L) === ',')
            break;
        var opInfo = scanArithOp(P);
        if (!opInfo)
            break;
        var opText = opInfo[0], opLen = opInfo[1];
        var prec = ARITH_PREC[opText];
        if (prec === undefined || prec < minPrec)
            break;
        var os = P.L.b;
        for (var k = 0; k < opLen; k++)
            advance(P.L);
        var op = mk(P, opText, os, P.L.b, []);
        var nextMin = ARITH_RIGHT_ASSOC.has(opText) ? prec : prec + 1;
        var right = parseArithBinary(P, stop, nextMin, mode);
        if (!right)
            break;
        left = mk(P, 'binary_expression', left.startIndex, right.endIndex, [
            left,
            op,
            right,
        ]);
    }
    return left;
}
function parseArithUnary(P, stop, mode) {
    skipBlanks(P.L);
    if (isArithStop(P, stop))
        return null;
    var c = peek(P.L);
    var c1 = peek(P.L, 1);
    // Prefix ++ --
    if ((c === '+' && c1 === '+') || (c === '-' && c1 === '-')) {
        var s = P.L.b;
        advance(P.L);
        advance(P.L);
        var op = mk(P, c + c1, s, P.L.b, []);
        var inner = parseArithUnary(P, stop, mode);
        if (!inner)
            return op;
        return mk(P, 'unary_expression', op.startIndex, inner.endIndex, [op, inner]);
    }
    if (c === '-' || c === '+' || c === '!' || c === '~') {
        // In 'word'/'assign' mode (c-style for head), `-N` is a single number
        // literal per tree-sitter, not unary_expression. 'var' mode uses unary.
        if (mode !== 'var' && c === '-' && isDigit(c1)) {
            var s_1 = P.L.b;
            advance(P.L);
            while (isDigit(peek(P.L)))
                advance(P.L);
            return mk(P, 'number', s_1, P.L.b, []);
        }
        var s = P.L.b;
        advance(P.L);
        var op = mk(P, c, s, P.L.b, []);
        var inner = parseArithUnary(P, stop, mode);
        if (!inner)
            return op;
        return mk(P, 'unary_expression', op.startIndex, inner.endIndex, [op, inner]);
    }
    return parseArithPostfix(P, stop, mode);
}
function parseArithPostfix(P, stop, mode) {
    var prim = parseArithPrimary(P, stop, mode);
    if (!prim)
        return null;
    var c = peek(P.L);
    var c1 = peek(P.L, 1);
    if ((c === '+' && c1 === '+') || (c === '-' && c1 === '-')) {
        var s = P.L.b;
        advance(P.L);
        advance(P.L);
        var op = mk(P, c + c1, s, P.L.b, []);
        return mk(P, 'postfix_expression', prim.startIndex, op.endIndex, [prim, op]);
    }
    return prim;
}
function parseArithPrimary(P, stop, mode) {
    var _a;
    skipBlanks(P.L);
    if (isArithStop(P, stop))
        return null;
    var c = peek(P.L);
    if (c === '(') {
        var s = P.L.b;
        advance(P.L);
        var open_14 = mk(P, '(', s, P.L.b, []);
        // Parenthesized expression may contain comma-separated exprs
        var inners = parseArithCommaList(P, ')', mode);
        skipBlanks(P.L);
        var close_12;
        if (peek(P.L) === ')') {
            var cs = P.L.b;
            advance(P.L);
            close_12 = mk(P, ')', cs, P.L.b, []);
        }
        else {
            close_12 = mk(P, ')', P.L.b, P.L.b, []);
        }
        return mk(P, 'parenthesized_expression', open_14.startIndex, close_12.endIndex, __spreadArray(__spreadArray([
            open_14
        ], inners, true), [
            close_12,
        ], false));
    }
    if (c === '"') {
        return parseDoubleQuoted(P);
    }
    if (c === '$') {
        return parseDollarLike(P);
    }
    if (isDigit(c)) {
        var s = P.L.b;
        while (isDigit(peek(P.L)))
            advance(P.L);
        // Hex: 0x1f
        if (P.L.b - s === 1 &&
            c === '0' &&
            (peek(P.L) === 'x' || peek(P.L) === 'X')) {
            advance(P.L);
            while (isHexDigit(peek(P.L)))
                advance(P.L);
        }
        // Base notation: BASE#DIGITS e.g. 2#1010, 16#ff
        else if (peek(P.L) === '#') {
            advance(P.L);
            while (isBaseDigit(peek(P.L)))
                advance(P.L);
        }
        return mk(P, 'number', s, P.L.b, []);
    }
    if (isIdentStart(c)) {
        var s = P.L.b;
        while (isIdentChar(peek(P.L)))
            advance(P.L);
        var nc = peek(P.L);
        // Assignment in 'assign' mode (c-style for init): emit variable_assignment
        // so chained `a = b = c = 1` nests correctly. Other modes treat `=` as a
        // binary_expression operator via the precedence table.
        if (mode === 'assign') {
            skipBlanks(P.L);
            var ac = peek(P.L);
            var ac1 = peek(P.L, 1);
            if (ac === '=' && ac1 !== '=') {
                var vn = mk(P, 'variable_name', s, P.L.b, []);
                var es = P.L.b;
                advance(P.L);
                var eq = mk(P, '=', es, P.L.b, []);
                // RHS may itself be another assignment (chained)
                var val = parseArithTernary(P, stop, mode);
                var end = val ? val.endIndex : eq.endIndex;
                var kids = val ? [vn, eq, val] : [vn, eq];
                return mk(P, 'variable_assignment', s, end, kids);
            }
        }
        // Subscript
        if (nc === '[') {
            var vn = mk(P, 'variable_name', s, P.L.b, []);
            var brS = P.L.b;
            advance(P.L);
            var brOpen = mk(P, '[', brS, P.L.b, []);
            var idx = (_a = parseArithTernary(P, ']', 'var')) !== null && _a !== void 0 ? _a : parseDollarLike(P);
            skipBlanks(P.L);
            var brClose = void 0;
            if (peek(P.L) === ']') {
                var cs = P.L.b;
                advance(P.L);
                brClose = mk(P, ']', cs, P.L.b, []);
            }
            else {
                brClose = mk(P, ']', P.L.b, P.L.b, []);
            }
            var kids = idx ? [vn, brOpen, idx, brClose] : [vn, brOpen, brClose];
            return mk(P, 'subscript', s, brClose.endIndex, kids);
        }
        // Bare identifier: variable_name in 'var' mode, word in 'word'/'assign' mode.
        // 'assign' mode falls through to word when no `=` follows (c-style for
        // cond/update clauses: `c<=5` → binary_expression(word, number)).
        var identType = mode === 'var' ? 'variable_name' : 'word';
        return mk(P, identType, s, P.L.b, []);
    }
    return null;
}
function isArithStop(P, stop) {
    var c = peek(P.L);
    if (stop === '))')
        return c === ')' && peek(P.L, 1) === ')';
    if (stop === ')')
        return c === ')';
    if (stop === ';')
        return c === ';';
    if (stop === ':')
        return c === ':';
    if (stop === ']')
        return c === ']';
    if (stop === '}')
        return c === '}';
    if (stop === ':}')
        return c === ':' || c === '}';
    return c === '' || c === '\n';
}
