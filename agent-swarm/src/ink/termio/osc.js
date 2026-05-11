"use strict";
/**
 * OSC (Operating System Command) Types and Parser
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLEAR_TAB_STATUS = exports.CLEAR_TERMINAL_TITLE = exports.CLEAR_ITERM2_PROGRESS = exports.PROGRESS = exports.ITERM2 = exports.LINK_END = exports.OSC = exports.ST = exports.OSC_PREFIX = void 0;
exports.osc = osc;
exports.wrapForMultiplexer = wrapForMultiplexer;
exports.getClipboardPath = getClipboardPath;
exports.tmuxLoadBuffer = tmuxLoadBuffer;
exports.setClipboard = setClipboard;
exports._resetLinuxCopyCache = _resetLinuxCopyCache;
exports.parseOSC = parseOSC;
exports.parseOscColor = parseOscColor;
exports.link = link;
exports.supportsTabStatus = supportsTabStatus;
exports.tabStatus = tabStatus;
var buffer_1 = require("buffer");
var env_js_1 = require("../../utils/env.js");
var execFileNoThrow_js_1 = require("../../utils/execFileNoThrow.js");
var ansi_js_1 = require("./ansi.js");
exports.OSC_PREFIX = ansi_js_1.ESC + String.fromCharCode(ansi_js_1.ESC_TYPE.OSC);
/** String Terminator (ESC \) - alternative to BEL for terminating OSC */
exports.ST = ansi_js_1.ESC + '\\';
/** Generate an OSC sequence: ESC ] p1;p2;...;pN <terminator>
 * Uses ST terminator for Kitty (avoids beeps), BEL for others */
function osc() {
    var parts = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        parts[_i] = arguments[_i];
    }
    var terminator = env_js_1.env.terminal === 'kitty' ? exports.ST : ansi_js_1.BEL;
    return "".concat(exports.OSC_PREFIX).concat(parts.join(ansi_js_1.SEP)).concat(terminator);
}
/**
 * Wrap an escape sequence for terminal multiplexer passthrough.
 * tmux and GNU screen intercept escape sequences; DCS passthrough
 * tunnels them to the outer terminal unmodified.
 *
 * tmux 3.3+ gates this behind `allow-passthrough` (default off). When off,
 * tmux silently drops the whole DCS — no junk, no worse than unwrapped OSC.
 * Users who want passthrough set it in their .tmux.conf; we don't mutate it.
 *
 * Do NOT wrap BEL: raw \x07 triggers tmux's bell-action (window flag);
 * wrapped \x07 is opaque DCS payload and tmux never sees the bell.
 */
function wrapForMultiplexer(sequence) {
    if (process.env['TMUX']) {
        var escaped = sequence.replaceAll('\x1b', '\x1b\x1b');
        return "\u001BPtmux;".concat(escaped, "\u001B\\");
    }
    if (process.env['STY']) {
        return "\u001BP".concat(sequence, "\u001B\\");
    }
    return sequence;
}
function getClipboardPath() {
    var nativeAvailable = process.platform === 'darwin' && !process.env['SSH_CONNECTION'];
    if (nativeAvailable)
        return 'native';
    if (process.env['TMUX'])
        return 'tmux-buffer';
    return 'osc52';
}
/**
 * Wrap a payload in tmux's DCS passthrough: ESC P tmux ; <payload> ESC \
 * tmux forwards the payload to the outer terminal, bypassing its own parser.
 * Inner ESCs must be doubled. Requires `set -g allow-passthrough on` in
 * ~/.tmux.conf; without it, tmux silently drops the whole DCS (no regression).
 */
function tmuxPassthrough(payload) {
    return "".concat(ansi_js_1.ESC, "Ptmux;").concat(payload.replaceAll(ansi_js_1.ESC, ansi_js_1.ESC + ansi_js_1.ESC)).concat(exports.ST);
}
/**
 * Load text into tmux's paste buffer via `tmux load-buffer`.
 * -w (tmux 3.2+) propagates to the outer terminal's clipboard via tmux's
 * own OSC 52 emission. -w is dropped for iTerm2: tmux's OSC 52 emission
 * crashes the iTerm2 session over SSH.
 *
 * Returns true if the buffer was loaded successfully.
 */
function tmuxLoadBuffer(text) {
    return __awaiter(this, void 0, void 0, function () {
        var args, code;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!process.env['TMUX'])
                        return [2 /*return*/, false];
                    args = process.env['LC_TERMINAL'] === 'iTerm2'
                        ? ['load-buffer', '-']
                        : ['load-buffer', '-w', '-'];
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('tmux', args, {
                            input: text,
                            useCwd: false,
                            timeout: 2000,
                        })];
                case 1:
                    code = (_a.sent()).code;
                    return [2 /*return*/, code === 0];
            }
        });
    });
}
/**
 * OSC 52 clipboard write: ESC ] 52 ; c ; <base64> BEL/ST
 * 'c' selects the clipboard (vs 'p' for primary selection on X11).
 *
 * When inside tmux ($TMUX set), `tmux load-buffer -w -` is the primary
 * path. tmux's buffer is always reachable — works over SSH, survives
 * detach/reattach, immune to stale env vars. The -w flag (tmux 3.2+) tells
 * tmux to also propagate to the outer terminal via its own OSC 52 path,
 * which tmux wraps correctly for the attached client. On older tmux, -w is
 * ignored and the buffer is still loaded. -w is dropped for iTerm2 (#22432)
 * because tmux's own OSC 52 emission (empty selection param: ESC]52;;b64)
 * crashes iTerm2 over SSH.
 *
 * After load-buffer succeeds, we ALSO return a DCS-passthrough-wrapped
 * OSC 52 for the caller to write to stdout. Our sequence uses explicit `c`
 * (not tmux's crashy empty-param variant), so it sidesteps the #22432 path.
 * With `allow-passthrough on` + an OSC-52-capable outer terminal, selection
 * reaches the system clipboard; with either off, tmux silently drops the
 * DCS and prefix+] still works. See Greg Smith's "free pony" in
 * https://anthropic.slack.com/archives/C07VBSHV7EV/p1773177228548119.
 *
 * If load-buffer fails entirely, fall through to raw OSC 52.
 *
 * Outside tmux, write raw OSC 52 to stdout (caller handles the write).
 *
 * Local (no SSH_CONNECTION): also shell out to a native clipboard utility.
 * OSC 52 and tmux -w both depend on terminal settings — iTerm2 disables
 * OSC 52 by default, VS Code shows a permission prompt on first use. Native
 * utilities (pbcopy/wl-copy/xclip/xsel/clip.exe) always work locally. Over
 * SSH these would write to the remote clipboard — OSC 52 is the right path there.
 *
 * Returns the sequence for the caller to write to stdout (raw OSC 52
 * outside tmux, DCS-wrapped inside).
 */
function setClipboard(text) {
    return __awaiter(this, void 0, void 0, function () {
        var b64, raw, tmuxBufferLoaded;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    b64 = buffer_1.Buffer.from(text, 'utf8').toString('base64');
                    raw = osc(exports.OSC.CLIPBOARD, 'c', b64);
                    // Native safety net — fire FIRST, before the tmux await, so a quick
                    // focus-switch after selecting doesn't race pbcopy. Previously this ran
                    // AFTER awaiting tmux load-buffer, adding ~50-100ms of subprocess latency
                    // before pbcopy even started — fast cmd+tab → paste would beat it
                    // (https://anthropic.slack.com/archives/C07VBSHV7EV/p1773943921788829).
                    // Gated on SSH_CONNECTION (not SSH_TTY) since tmux panes inherit SSH_TTY
                    // forever but SSH_CONNECTION is in tmux's default update-environment and
                    // clears on local attach. Fire-and-forget.
                    if (!process.env['SSH_CONNECTION'])
                        copyNative(text);
                    return [4 /*yield*/, tmuxLoadBuffer(text)
                        // Inner OSC uses BEL directly (not osc()) — ST's ESC would need doubling
                        // too, and BEL works everywhere for OSC 52.
                    ];
                case 1:
                    tmuxBufferLoaded = _a.sent();
                    // Inner OSC uses BEL directly (not osc()) — ST's ESC would need doubling
                    // too, and BEL works everywhere for OSC 52.
                    if (tmuxBufferLoaded)
                        return [2 /*return*/, tmuxPassthrough("".concat(ansi_js_1.ESC, "]52;c;").concat(b64).concat(ansi_js_1.BEL))];
                    return [2 /*return*/, raw];
            }
        });
    });
}
// Linux clipboard tool: undefined = not yet probed, null = none available.
// Probe order: wl-copy (Wayland) → xclip (X11) → xsel (X11 fallback).
// Cached after first attempt so repeated mouse-ups skip the probe chain.
var linuxCopy;
/**
 * Shell out to a native clipboard utility as a safety net for OSC 52.
 * Only called when not in an SSH session (over SSH, these would write to
 * the remote machine's clipboard — OSC 52 is the right path there).
 * Fire-and-forget: failures are silent since OSC 52 may have succeeded.
 */
function copyNative(text) {
    var opts = { input: text, useCwd: false, timeout: 2000 };
    switch (process.platform) {
        case 'darwin':
            void (0, execFileNoThrow_js_1.execFileNoThrow)('pbcopy', [], opts);
            return;
        case 'linux': {
            if (linuxCopy === null)
                return;
            if (linuxCopy === 'wl-copy') {
                void (0, execFileNoThrow_js_1.execFileNoThrow)('wl-copy', [], opts);
                return;
            }
            if (linuxCopy === 'xclip') {
                void (0, execFileNoThrow_js_1.execFileNoThrow)('xclip', ['-selection', 'clipboard'], opts);
                return;
            }
            if (linuxCopy === 'xsel') {
                void (0, execFileNoThrow_js_1.execFileNoThrow)('xsel', ['--clipboard', '--input'], opts);
                return;
            }
            // First call: probe wl-copy (Wayland) then xclip/xsel (X11), cache winner.
            void (0, execFileNoThrow_js_1.execFileNoThrow)('wl-copy', [], opts).then(function (r) {
                if (r.code === 0) {
                    linuxCopy = 'wl-copy';
                    return;
                }
                void (0, execFileNoThrow_js_1.execFileNoThrow)('xclip', ['-selection', 'clipboard'], opts).then(function (r2) {
                    if (r2.code === 0) {
                        linuxCopy = 'xclip';
                        return;
                    }
                    void (0, execFileNoThrow_js_1.execFileNoThrow)('xsel', ['--clipboard', '--input'], opts).then(function (r3) {
                        linuxCopy = r3.code === 0 ? 'xsel' : null;
                    });
                });
            });
            return;
        }
        case 'win32':
            // clip.exe is always available on Windows. Unicode handling is
            // imperfect (system locale encoding) but good enough for a fallback.
            void (0, execFileNoThrow_js_1.execFileNoThrow)('clip', [], opts);
            return;
    }
}
/** @internal test-only */
function _resetLinuxCopyCache() {
    linuxCopy = undefined;
}
/**
 * OSC command numbers
 */
exports.OSC = {
    SET_TITLE_AND_ICON: 0,
    SET_ICON: 1,
    SET_TITLE: 2,
    SET_COLOR: 4,
    SET_CWD: 7,
    HYPERLINK: 8,
    ITERM2: 9, // iTerm2 proprietary sequences
    SET_FG_COLOR: 10,
    SET_BG_COLOR: 11,
    SET_CURSOR_COLOR: 12,
    CLIPBOARD: 52,
    KITTY: 99, // Kitty notification protocol
    RESET_COLOR: 104,
    RESET_FG_COLOR: 110,
    RESET_BG_COLOR: 111,
    RESET_CURSOR_COLOR: 112,
    SEMANTIC_PROMPT: 133,
    GHOSTTY: 777, // Ghostty notification protocol
    TAB_STATUS: 21337, // Tab status extension
};
/**
 * Parse an OSC sequence into an action
 *
 * @param content - The sequence content (without ESC ] and terminator)
 */
function parseOSC(content) {
    var _a;
    var semicolonIdx = content.indexOf(';');
    var command = semicolonIdx >= 0 ? content.slice(0, semicolonIdx) : content;
    var data = semicolonIdx >= 0 ? content.slice(semicolonIdx + 1) : '';
    var commandNum = parseInt(command, 10);
    // Window/icon title
    if (commandNum === exports.OSC.SET_TITLE_AND_ICON) {
        return { type: 'title', action: { type: 'both', title: data } };
    }
    if (commandNum === exports.OSC.SET_ICON) {
        return { type: 'title', action: { type: 'iconName', name: data } };
    }
    if (commandNum === exports.OSC.SET_TITLE) {
        return { type: 'title', action: { type: 'windowTitle', title: data } };
    }
    // Hyperlinks (OSC 8)
    if (commandNum === exports.OSC.HYPERLINK) {
        var parts = data.split(';');
        var paramsStr = (_a = parts[0]) !== null && _a !== void 0 ? _a : '';
        var url = parts.slice(1).join(';');
        if (url === '') {
            return { type: 'link', action: { type: 'end' } };
        }
        var params = {};
        if (paramsStr) {
            for (var _i = 0, _b = paramsStr.split(':'); _i < _b.length; _i++) {
                var pair = _b[_i];
                var eqIdx = pair.indexOf('=');
                if (eqIdx >= 0) {
                    params[pair.slice(0, eqIdx)] = pair.slice(eqIdx + 1);
                }
            }
        }
        return {
            type: 'link',
            action: {
                type: 'start',
                url: url,
                params: Object.keys(params).length > 0 ? params : undefined,
            },
        };
    }
    // Tab status (OSC 21337)
    if (commandNum === exports.OSC.TAB_STATUS) {
        return { type: 'tabStatus', action: parseTabStatus(data) };
    }
    return { type: 'unknown', sequence: "\u001B]".concat(content) };
}
/**
 * Parse an XParseColor-style color spec into an RGB Color.
 * Accepts `#RRGGBB` and `rgb:R/G/B` (1–4 hex digits per component, scaled
 * to 8-bit). Returns null on parse failure.
 */
function parseOscColor(spec) {
    var hex = spec.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
    if (hex) {
        return {
            type: 'rgb',
            r: parseInt(hex[1], 16),
            g: parseInt(hex[2], 16),
            b: parseInt(hex[3], 16),
        };
    }
    var rgb = spec.match(/^rgb:([0-9a-f]{1,4})\/([0-9a-f]{1,4})\/([0-9a-f]{1,4})$/i);
    if (rgb) {
        // XParseColor: N hex digits → value / (16^N - 1), scale to 0-255
        var scale = function (s) {
            return Math.round((parseInt(s, 16) / (Math.pow(16, s.length) - 1)) * 255);
        };
        return {
            type: 'rgb',
            r: scale(rgb[1]),
            g: scale(rgb[2]),
            b: scale(rgb[3]),
        };
    }
    return null;
}
/**
 * Parse OSC 21337 payload: `key=value;key=value;...` with `\;` and `\\`
 * escapes inside values. Bare key or `key=` clears that field; unknown
 * keys are ignored.
 */
function parseTabStatus(data) {
    var action = {};
    for (var _i = 0, _a = splitTabStatusPairs(data); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        switch (key) {
            case 'indicator':
                action.indicator = value === '' ? null : parseOscColor(value);
                break;
            case 'status':
                action.status = value === '' ? null : value;
                break;
            case 'status-color':
                action.statusColor = value === '' ? null : parseOscColor(value);
                break;
        }
    }
    return action;
}
/** Split `k=v;k=v` honoring `\;` and `\\` escapes. Yields [key, unescapedValue]. */
function splitTabStatusPairs(data) {
    var key, val, inVal, esc, _i, data_1, c;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                key = '';
                val = '';
                inVal = false;
                esc = false;
                _i = 0, data_1 = data;
                _a.label = 1;
            case 1:
                if (!(_i < data_1.length)) return [3 /*break*/, 7];
                c = data_1[_i];
                if (!esc) return [3 /*break*/, 2];
                if (inVal)
                    val += c;
                else
                    key += c;
                esc = false;
                return [3 /*break*/, 6];
            case 2:
                if (!(c === '\\')) return [3 /*break*/, 3];
                esc = true;
                return [3 /*break*/, 6];
            case 3:
                if (!(c === ';')) return [3 /*break*/, 5];
                return [4 /*yield*/, [key, val]];
            case 4:
                _a.sent();
                key = '';
                val = '';
                inVal = false;
                return [3 /*break*/, 6];
            case 5:
                if (c === '=' && !inVal) {
                    inVal = true;
                }
                else if (inVal) {
                    val += c;
                }
                else {
                    key += c;
                }
                _a.label = 6;
            case 6:
                _i++;
                return [3 /*break*/, 1];
            case 7:
                if (!(key || inVal)) return [3 /*break*/, 9];
                return [4 /*yield*/, [key, val]];
            case 8:
                _a.sent();
                _a.label = 9;
            case 9: return [2 /*return*/];
        }
    });
}
// Output generators
/** Start a hyperlink (OSC 8). Auto-assigns an id= param derived from the URL
 *  so terminals group wrapped lines of the same link together (the spec says
 *  cells with matching URI *and* nonempty id are joined; without an id each
 *  wrapped line is a separate link — inconsistent hover, partial tooltips).
 *  Empty url = close sequence (empty params per spec). */
function link(url, params) {
    if (!url)
        return exports.LINK_END;
    var p = __assign({ id: osc8Id(url) }, params);
    var paramStr = Object.entries(p)
        .map(function (_a) {
        var k = _a[0], v = _a[1];
        return "".concat(k, "=").concat(v);
    })
        .join(':');
    return osc(exports.OSC.HYPERLINK, paramStr, url);
}
function osc8Id(url) {
    var h = 0;
    for (var i = 0; i < url.length; i++)
        h = ((h << 5) - h + url.charCodeAt(i)) | 0;
    return (h >>> 0).toString(36);
}
/** End a hyperlink (OSC 8) */
exports.LINK_END = osc(exports.OSC.HYPERLINK, '', '');
// iTerm2 OSC 9 subcommands
/** iTerm2 OSC 9 subcommand numbers */
exports.ITERM2 = {
    NOTIFY: 0,
    BADGE: 2,
    PROGRESS: 4,
};
/** Progress operation codes (for use with ITERM2.PROGRESS) */
exports.PROGRESS = {
    CLEAR: 0,
    SET: 1,
    ERROR: 2,
    INDETERMINATE: 3,
};
/**
 * Clear iTerm2 progress bar sequence (OSC 9;4;0;BEL)
 * Uses BEL terminator since this is for cleanup (not runtime notification)
 * and we want to ensure it's always sent regardless of terminal type.
 */
exports.CLEAR_ITERM2_PROGRESS = "".concat(exports.OSC_PREFIX).concat(exports.OSC.ITERM2, ";").concat(exports.ITERM2.PROGRESS, ";").concat(exports.PROGRESS.CLEAR, ";").concat(ansi_js_1.BEL);
/**
 * Clear terminal title sequence (OSC 0 with empty string + BEL).
 * Uses BEL terminator for cleanup — safe on all terminals.
 */
exports.CLEAR_TERMINAL_TITLE = "".concat(exports.OSC_PREFIX).concat(exports.OSC.SET_TITLE_AND_ICON, ";").concat(ansi_js_1.BEL);
/** Clear all three OSC 21337 tab-status fields. Used on exit. */
exports.CLEAR_TAB_STATUS = osc(exports.OSC.TAB_STATUS, 'indicator=;status=;status-color=');
/**
 * Gate for emitting OSC 21337 (tab-status indicator). Ant-only while the
 * spec is unstable. Terminals that don't recognize it discard silently, so
 * emission is safe unconditionally — we don't gate on terminal detection
 * since support is expected across several terminals.
 *
 * Callers must wrap output with wrapForMultiplexer() so tmux/screen
 * DCS-passthrough carries the sequence to the outer terminal.
 */
function supportsTabStatus() {
    return process.env.USER_TYPE === 'ant';
}
/**
 * Emit an OSC 21337 tab-status sequence. Omitted fields are left unchanged
 * by the receiving terminal; `null` sends an empty value to clear.
 * `;` and `\` in status text are escaped per the spec.
 */
function tabStatus(fields) {
    var _a, _b;
    var parts = [];
    var rgb = function (c) {
        return c.type === 'rgb'
            ? "#".concat([c.r, c.g, c.b].map(function (n) { return n.toString(16).padStart(2, '0'); }).join(''))
            : '';
    };
    if ('indicator' in fields)
        parts.push("indicator=".concat(fields.indicator ? rgb(fields.indicator) : ''));
    if ('status' in fields)
        parts.push("status=".concat((_b = (_a = fields.status) === null || _a === void 0 ? void 0 : _a.replaceAll('\\', '\\\\').replaceAll(';', '\\;')) !== null && _b !== void 0 ? _b : ''));
    if ('statusColor' in fields)
        parts.push("status-color=".concat(fields.statusColor ? rgb(fields.statusColor) : ''));
    return osc(exports.OSC.TAB_STATUS, parts.join(';'));
}
