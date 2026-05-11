"use strict";
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
exports.isTmuxControlMode = isTmuxControlMode;
exports._resetTmuxControlModeProbeForTesting = _resetTmuxControlModeProbeForTesting;
exports.isFullscreenEnvEnabled = isFullscreenEnvEnabled;
exports.isMouseTrackingEnabled = isMouseTrackingEnabled;
exports.isMouseClicksDisabled = isMouseClicksDisabled;
exports.isFullscreenActive = isFullscreenActive;
exports.maybeGetTmuxMouseHint = maybeGetTmuxMouseHint;
exports._resetForTesting = _resetForTesting;
var child_process_1 = require("child_process");
var state_js_1 = require("../bootstrap/state.js");
var debug_js_1 = require("./debug.js");
var envUtils_js_1 = require("./envUtils.js");
var execFileNoThrow_js_1 = require("./execFileNoThrow.js");
var loggedTmuxCcDisable = false;
var checkedTmuxMouseHint = false;
/**
 * Cached result from `tmux display-message -p '#{client_control_mode}'`.
 * undefined = not yet queried (or probe failed) — env heuristic stays authoritative.
 */
var tmuxControlModeProbed;
/**
 * Env-var heuristic for iTerm2's tmux integration mode (`tmux -CC` / `tmux -2CC`).
 *
 * In `-CC` mode, iTerm2 renders tmux panes as native splits — tmux runs
 * as a server (TMUX is set) but iTerm2 is the actual terminal emulator
 * for each pane, so TERM_PROGRAM stays `iTerm.app` and TERM is iTerm2's
 * default (xterm-*). Contrast with regular tmux-inside-iTerm2, where tmux
 * overwrites TERM_PROGRAM to `tmux` and sets TERM to screen-* or tmux-*.
 *
 * This heuristic has known holes (SSH often doesn't propagate TERM_PROGRAM;
 * .tmux.conf can override TERM) — probeTmuxControlModeSync() is the
 * authoritative backstop. Kept as a zero-subprocess fast path.
 */
function isTmuxControlModeEnvHeuristic() {
    var _a;
    if (!process.env.TMUX)
        return false;
    if (process.env.TERM_PROGRAM !== 'iTerm.app')
        return false;
    // Belt-and-suspenders: in regular tmux TERM is screen-* or tmux-*;
    // in -CC mode iTerm2 sets its own TERM (xterm-*).
    var term = (_a = process.env.TERM) !== null && _a !== void 0 ? _a : '';
    return !term.startsWith('screen') && !term.startsWith('tmux');
}
/**
 * Sync one-shot probe: asks tmux directly whether this client is in control
 * mode via `#{client_control_mode}`. Runs on first isTmuxControlMode() call
 * when the env heuristic can't decide; result is cached.
 *
 * Sync (spawnSync) because the answer gates whether we enter fullscreen — an
 * async probe raced against React render and lost: coder-tmux (ssh → tmux -CC
 * on a remote box) doesn't propagate TERM_PROGRAM, so the env heuristic missed,
 * and by the time the async probe resolved we'd already entered alt-screen with
 * mouse tracking enabled. Mouse wheel is dead in iTerm2's -CC integration, so
 * users couldn't scroll at all.
 *
 * Cost: one ~5ms subprocess, only when $TMUX is set AND $TERM_PROGRAM is unset
 * (the SSH-into-tmux case). Local iTerm2 -CC and non-tmux paths skip the spawn.
 *
 * The TMUX env check MUST come first — without it, display-message would
 * query whatever tmux server happens to be running rather than our client.
 */
function probeTmuxControlModeSync() {
    // Seed cache with heuristic result so early returns below don't leave it
    // undefined — isTmuxControlMode() is called 15+ times per render, and an
    // undefined cache would re-enter this function (re-spawning tmux in the
    // failure case) on every call.
    tmuxControlModeProbed = isTmuxControlModeEnvHeuristic();
    if (tmuxControlModeProbed)
        return;
    if (!process.env.TMUX)
        return;
    // Only probe when iTerm might be involved: TERM_PROGRAM is iTerm.app
    // (covered above) or not set (SSH often doesn't propagate it). When
    // TERM_PROGRAM is explicitly a non-iTerm terminal, skip — tmux -CC is
    // an iTerm-only feature, so the subprocess would be wasted.
    if (process.env.TERM_PROGRAM)
        return;
    var result;
    try {
        result = (0, child_process_1.spawnSync)('tmux', ['display-message', '-p', '#{client_control_mode}'], { encoding: 'utf8', timeout: 2000 });
    }
    catch (_a) {
        // spawnSync can throw on some platforms (e.g. ENOENT on Windows if tmux
        // is absent and the runtime surfaces it as an exception rather than in
        // result.error). Treat the same as a non-zero exit.
        return;
    }
    // Non-zero exit / spawn error: tmux too old (format var added in 2.4) or
    // unavailable. Keep the heuristic result cached.
    if (result.status !== 0)
        return;
    tmuxControlModeProbed = result.stdout.trim() === '1';
}
/**
 * True when running under `tmux -CC` (iTerm2 integration mode).
 *
 * The alt-screen / mouse-tracking path in fullscreen mode is unrecoverable
 * in -CC mode (double-click corrupts terminal state; mouse wheel is dead),
 * so callers auto-disable fullscreen.
 *
 * Lazily probes tmux on first call when the env heuristic can't decide.
 */
function isTmuxControlMode() {
    if (tmuxControlModeProbed === undefined)
        probeTmuxControlModeSync();
    return tmuxControlModeProbed !== null && tmuxControlModeProbed !== void 0 ? tmuxControlModeProbed : false;
}
function _resetTmuxControlModeProbeForTesting() {
    tmuxControlModeProbed = undefined;
    loggedTmuxCcDisable = false;
}
/**
 * Runtime env-var check only. Ants default to on (CLAUDE_CODE_NO_FLICKER=0
 * to opt out); external users default to off (CLAUDE_CODE_NO_FLICKER=1 to
 * opt in).
 */
function isFullscreenEnvEnabled() {
    // Explicit user opt-out always wins.
    if ((0, envUtils_js_1.isEnvDefinedFalsy)(process.env.CLAUDE_CODE_NO_FLICKER))
        return false;
    // Explicit opt-in overrides auto-detection (escape hatch).
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_NO_FLICKER))
        return true;
    // Auto-disable under tmux -CC: alt-screen + mouse tracking corrupts
    // terminal state on double-click and mouse wheel is dead.
    if (isTmuxControlMode()) {
        if (!loggedTmuxCcDisable) {
            loggedTmuxCcDisable = true;
            (0, debug_js_1.logForDebugging)('fullscreen disabled: tmux -CC (iTerm2 integration mode) detected · set CLAUDE_CODE_NO_FLICKER=1 to override');
        }
        return false;
    }
    return process.env.USER_TYPE === 'ant';
}
/**
 * Whether fullscreen mode should enable SGR mouse tracking (DEC 1000/1002/1006).
 * Set CLAUDE_CODE_DISABLE_MOUSE=1 to keep alt-screen + virtualized scroll
 * (keyboard PgUp/PgDn/Ctrl+Home/End still work) but skip mouse capture,
 * so tmux/kitty/terminal-native copy-on-select keeps working.
 *
 * Compare with CLAUDE_CODE_NO_FLICKER=0 which is all-or-nothing — it also
 * disables alt-screen and virtualized scrollback.
 */
function isMouseTrackingEnabled() {
    return !(0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_DISABLE_MOUSE);
}
/**
 * Whether mouse click handling is disabled (clicks/drags ignored, wheel still
 * works). Set CLAUDE_CODE_DISABLE_MOUSE_CLICKS=1 to prevent accidental clicks
 * from triggering cursor positioning, text selection, or message expansion.
 *
 * Fullscreen-specific — only reachable when CLAUDE_CODE_NO_FLICKER is active.
 */
function isMouseClicksDisabled() {
    return (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_DISABLE_MOUSE_CLICKS);
}
/**
 * True when the fullscreen alt-screen layout is actually rendering —
 * requires an interactive REPL session AND the env var not explicitly
 * set falsy. Headless paths (--print, SDK, in-process teammates) never
 * enter fullscreen, so features that depend on alt-screen re-rendering
 * should gate on this.
 */
function isFullscreenActive() {
    return (0, state_js_1.getIsInteractive)() && isFullscreenEnvEnabled();
}
/**
 * One-time hint for tmux users in fullscreen with `mouse off`.
 *
 * tmux's `mouse` option is session-scoped by design — there is no
 * pane-level equivalent. We used to `tmux set mouse on` when entering
 * alt-screen so wheel scrolling worked, but that changed mouse behavior
 * for every sibling pane (vim, less, shell) and leaked on kill-pane or
 * when multiple CC instances raced on restore. Now we leave tmux state
 * alone — same as vim/less/htop — and just tell the user their options.
 *
 * Fire-and-forget from REPL startup. Returns the hint text once per
 * session if TMUX is set, fullscreen is active, and tmux's current
 * `mouse` option is off; null otherwise.
 */
function maybeGetTmuxMouseHint() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, stdout, code;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!process.env.TMUX)
                        return [2 /*return*/, null
                            // tmux -CC auto-disables fullscreen above, but belt-and-suspenders.
                        ];
                    // tmux -CC auto-disables fullscreen above, but belt-and-suspenders.
                    if (!isFullscreenActive() || isTmuxControlMode())
                        return [2 /*return*/, null];
                    if (checkedTmuxMouseHint)
                        return [2 /*return*/, null];
                    checkedTmuxMouseHint = true;
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('tmux', ['show', '-Av', 'mouse'], { useCwd: false, timeout: 2000 })];
                case 1:
                    _a = _b.sent(), stdout = _a.stdout, code = _a.code;
                    if (code !== 0 || stdout.trim() === 'on')
                        return [2 /*return*/, null];
                    return [2 /*return*/, "tmux detected · scroll with PgUp/PgDn · or add 'set -g mouse on' to ~/.tmux.conf for wheel scroll"];
            }
        });
    });
}
/** Test-only: reset module-level once-per-session flags. */
function _resetForTesting() {
    loggedTmuxCcDisable = false;
    checkedTmuxMouseHint = false;
}
