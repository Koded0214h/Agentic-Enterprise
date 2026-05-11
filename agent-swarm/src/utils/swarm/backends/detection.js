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
exports.IT2_COMMAND = void 0;
exports.isInsideTmuxSync = isInsideTmuxSync;
exports.isInsideTmux = isInsideTmux;
exports.getLeaderPaneId = getLeaderPaneId;
exports.isTmuxAvailable = isTmuxAvailable;
exports.isInITerm2 = isInITerm2;
exports.isIt2CliAvailable = isIt2CliAvailable;
exports.resetDetectionCache = resetDetectionCache;
var env_js_1 = require("../../../utils/env.js");
var execFileNoThrow_js_1 = require("../../../utils/execFileNoThrow.js");
var constants_js_1 = require("../constants.js");
/**
 * Captured at module load time to detect if the user started Claude from within tmux.
 * Shell.ts may override TMUX env var later, so we capture the original value.
 */
// eslint-disable-next-line custom-rules/no-process-env-top-level
var ORIGINAL_USER_TMUX = process.env.TMUX;
/**
 * Captured at module load time to get the leader's tmux pane ID.
 * TMUX_PANE is set by tmux to the pane ID (e.g., %0, %1) when a process runs inside tmux.
 * We capture this at startup so we always know the leader's original pane, even if
 * the user switches to a different pane later.
 */
// eslint-disable-next-line custom-rules/no-process-env-top-level
var ORIGINAL_TMUX_PANE = process.env.TMUX_PANE;
/** Cached result for isInsideTmux */
var isInsideTmuxCached = null;
/** Cached result for isInITerm2 */
var isInITerm2Cached = null;
/**
 * Checks if we're currently running inside a tmux session (synchronous version).
 * Uses the original TMUX value captured at module load, not process.env.TMUX,
 * because Shell.ts overrides TMUX when Claude's socket is initialized.
 *
 * IMPORTANT: We ONLY check the TMUX env var. We do NOT run `tmux display-message`
 * as a fallback because that command will succeed if ANY tmux server is running
 * on the system, not just if THIS process is inside tmux.
 */
function isInsideTmuxSync() {
    return !!ORIGINAL_USER_TMUX;
}
/**
 * Checks if we're currently running inside a tmux session.
 * Uses the original TMUX value captured at module load, not process.env.TMUX,
 * because Shell.ts overrides TMUX when Claude's socket is initialized.
 * Caches the result since this won't change during the process lifetime.
 *
 * IMPORTANT: We ONLY check the TMUX env var. We do NOT run `tmux display-message`
 * as a fallback because that command will succeed if ANY tmux server is running
 * on the system, not just if THIS process is inside tmux.
 */
function isInsideTmux() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (isInsideTmuxCached !== null) {
                return [2 /*return*/, isInsideTmuxCached];
            }
            // Check the original TMUX env var (captured at module load)
            // This tells us if the user started Claude from within their tmux session
            // If TMUX is not set, we are NOT inside tmux - period.
            isInsideTmuxCached = !!ORIGINAL_USER_TMUX;
            return [2 /*return*/, isInsideTmuxCached];
        });
    });
}
/**
 * Gets the leader's tmux pane ID captured at module load.
 * Returns null if not running inside tmux.
 */
function getLeaderPaneId() {
    return ORIGINAL_TMUX_PANE || null;
}
/**
 * Checks if tmux is available on the system (installed and in PATH).
 */
function isTmuxAvailable() {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)(constants_js_1.TMUX_COMMAND, ['-V'])];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result.code === 0];
            }
        });
    });
}
/**
 * Checks if we're currently running inside iTerm2.
 * Uses multiple detection methods:
 * 1. TERM_PROGRAM env var set to "iTerm.app"
 * 2. ITERM_SESSION_ID env var is present
 * 3. env.terminal detection from utils/env.ts
 *
 * Caches the result since this won't change during the process lifetime.
 *
 * Note: iTerm2 backend uses AppleScript (osascript) which is built into macOS,
 * so no external CLI tool installation is required.
 */
function isInITerm2() {
    if (isInITerm2Cached !== null) {
        return isInITerm2Cached;
    }
    // Check multiple indicators for iTerm2
    var termProgram = process.env.TERM_PROGRAM;
    var hasItermSessionId = !!process.env.ITERM_SESSION_ID;
    var terminalIsITerm = env_js_1.env.terminal === 'iTerm.app';
    isInITerm2Cached =
        termProgram === 'iTerm.app' || hasItermSessionId || terminalIsITerm;
    return isInITerm2Cached;
}
/**
 * The it2 CLI command name.
 */
exports.IT2_COMMAND = 'it2';
/**
 * Checks if the it2 CLI tool is available AND can reach the iTerm2 Python API.
 * Uses 'session list' (not '--version') because --version succeeds even when
 * the Python API is disabled in iTerm2 preferences — which would cause
 * 'session split' to fail later with no fallback.
 */
function isIt2CliAvailable() {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)(exports.IT2_COMMAND, ['session', 'list'])];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result.code === 0];
            }
        });
    });
}
/**
 * Resets all cached detection results. Used for testing.
 */
function resetDetectionCache() {
    isInsideTmuxCached = null;
    isInITerm2Cached = null;
}
