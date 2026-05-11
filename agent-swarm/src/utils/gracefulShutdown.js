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
exports.setupGracefulShutdown = void 0;
exports.gracefulShutdownSync = gracefulShutdownSync;
exports.isShuttingDown = isShuttingDown;
exports.resetShutdownState = resetShutdownState;
exports.getPendingShutdownForTesting = getPendingShutdownForTesting;
exports.gracefulShutdown = gracefulShutdown;
var chalk_1 = require("chalk");
var fs_1 = require("fs");
var memoize_js_1 = require("lodash-es/memoize.js");
var signal_exit_1 = require("signal-exit");
var state_js_1 = require("../bootstrap/state.js");
var instances_js_1 = require("../ink/instances.js");
var csi_js_1 = require("../ink/termio/csi.js");
var dec_js_1 = require("../ink/termio/dec.js");
var osc_js_1 = require("../ink/termio/osc.js");
var datadog_js_1 = require("../services/analytics/datadog.js");
var firstPartyEventLogger_js_1 = require("../services/analytics/firstPartyEventLogger.js");
var index_js_1 = require("../services/analytics/index.js");
var cleanupRegistry_js_1 = require("./cleanupRegistry.js");
var debug_js_1 = require("./debug.js");
var diagLogs_js_1 = require("./diagLogs.js");
var envUtils_js_1 = require("./envUtils.js");
var sessionStorage_js_1 = require("./sessionStorage.js");
var sleep_js_1 = require("./sleep.js");
var startupProfiler_js_1 = require("./startupProfiler.js");
/**
 * Clean up terminal modes synchronously before process exit.
 * This ensures terminal escape sequences (Kitty keyboard, focus reporting, etc.)
 * are properly disabled even if React's componentWillUnmount doesn't run in time.
 * Uses writeSync to ensure writes complete before exit.
 *
 * We unconditionally send all disable sequences because:
 * 1. Terminal detection may not always work correctly (e.g., in tmux, screen)
 * 2. These sequences are no-ops on terminals that don't support them
 * 3. Failing to disable leaves the terminal in a broken state
 */
/* eslint-disable custom-rules/no-sync-fs -- must be sync to flush before process.exit */
function cleanupTerminalModes() {
    if (!process.stdout.isTTY) {
        return;
    }
    try {
        // Disable mouse tracking FIRST, before the React unmount tree-walk.
        // The terminal needs a round-trip to process this and stop sending
        // events; doing it now (not after unmount) gives that time while
        // we're busy unmounting. Otherwise events arrive during cooked-mode
        // cleanup and either echo to the screen or leak to the shell.
        (0, fs_1.writeSync)(1, dec_js_1.DISABLE_MOUSE_TRACKING);
        // Exit alt screen FIRST so printResumeHint() (and all sequences below)
        // land on the main buffer.
        //
        // Unmount Ink directly rather than writing EXIT_ALT_SCREEN ourselves.
        // Ink registered its unmount with signal-exit, so it will otherwise run
        // AGAIN inside forceExit() → process.exit(). Two problems with letting
        // that happen:
        //   1. If we write 1049l here and unmount writes it again later, the
        //      second one triggers another DECRC — the cursor jumps back over
        //      the resume hint and the shell prompt lands on the wrong line.
        //   2. unmount()'s onRender() must run with altScreenActive=true (alt-
        //      screen cursor math) AND on the alt buffer. Exiting alt-screen
        //      here first makes onRender() scribble a REPL frame onto main.
        // Calling unmount() now does the final render on the alt buffer,
        // unsubscribes from signal-exit, and writes 1049l exactly once.
        var inst = instances_js_1.default.get(process.stdout);
        if (inst === null || inst === void 0 ? void 0 : inst.isAltScreenActive) {
            try {
                inst.unmount();
            }
            catch (_a) {
                // Reconciler/render threw — fall back to manual alt-screen exit
                // so printResumeHint still hits the main buffer.
                (0, fs_1.writeSync)(1, dec_js_1.EXIT_ALT_SCREEN);
            }
        }
        // Catches events that arrived during the unmount tree-walk.
        // detachForShutdown() below also drains.
        inst === null || inst === void 0 ? void 0 : inst.drainStdin();
        // Mark the Ink instance unmounted so signal-exit's deferred ink.unmount()
        // early-returns instead of sending redundant EXIT_ALT_SCREEN sequences
        // (from its writeSync cleanup block + AlternateScreen's unmount cleanup).
        // Those redundant sequences land AFTER printResumeHint() and clobber the
        // resume hint on tmux (and possibly other terminals) by restoring the
        // saved cursor position. Safe to skip full unmount: this function already
        // sends all the terminal-reset sequences, and the process is exiting.
        inst === null || inst === void 0 ? void 0 : inst.detachForShutdown();
        // Disable extended key reporting — always send both since terminals
        // silently ignore whichever they don't implement
        (0, fs_1.writeSync)(1, csi_js_1.DISABLE_MODIFY_OTHER_KEYS);
        (0, fs_1.writeSync)(1, csi_js_1.DISABLE_KITTY_KEYBOARD);
        // Disable focus events (DECSET 1004)
        (0, fs_1.writeSync)(1, dec_js_1.DFE);
        // Disable bracketed paste mode
        (0, fs_1.writeSync)(1, dec_js_1.DBP);
        // Show cursor
        (0, fs_1.writeSync)(1, dec_js_1.SHOW_CURSOR);
        // Clear iTerm2 progress bar - prevents lingering progress indicator
        // that can cause bell sounds when returning to the terminal tab
        (0, fs_1.writeSync)(1, osc_js_1.CLEAR_ITERM2_PROGRESS);
        // Clear tab status (OSC 21337) so a stale dot doesn't linger
        if ((0, osc_js_1.supportsTabStatus)())
            (0, fs_1.writeSync)(1, (0, osc_js_1.wrapForMultiplexer)(osc_js_1.CLEAR_TAB_STATUS));
        // Clear terminal title so the tab doesn't show stale session info.
        // Respect CLAUDE_CODE_DISABLE_TERMINAL_TITLE — if the user opted out of
        // title changes, don't clear their existing title on exit either.
        if (!(0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_DISABLE_TERMINAL_TITLE)) {
            if (process.platform === 'win32') {
                process.title = '';
            }
            else {
                (0, fs_1.writeSync)(1, osc_js_1.CLEAR_TERMINAL_TITLE);
            }
        }
    }
    catch (_b) {
        // Terminal may already be gone (e.g., SIGHUP after terminal close).
        // Ignore write errors since we're exiting anyway.
    }
}
var resumeHintPrinted = false;
/**
 * Print a hint about how to resume the session.
 * Only shown for interactive sessions with persistence enabled.
 */
function printResumeHint() {
    // Only print once (failsafe timer may call this again after normal shutdown)
    if (resumeHintPrinted) {
        return;
    }
    // Only show with TTY, interactive sessions, and persistence
    if (process.stdout.isTTY &&
        (0, state_js_1.getIsInteractive)() &&
        !(0, state_js_1.isSessionPersistenceDisabled)()) {
        try {
            var sessionId = (0, state_js_1.getSessionId)();
            // Don't show resume hint if no session file exists (e.g., subcommands like `claude update`)
            if (!(0, sessionStorage_js_1.sessionIdExists)(sessionId)) {
                return;
            }
            var customTitle = (0, sessionStorage_js_1.getCurrentSessionTitle)(sessionId);
            // Use custom title if available, otherwise fall back to session ID
            var resumeArg = void 0;
            if (customTitle) {
                // Wrap in double quotes, escape backslashes first then quotes
                var escaped = customTitle.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
                resumeArg = "\"".concat(escaped, "\"");
            }
            else {
                resumeArg = sessionId;
            }
            (0, fs_1.writeSync)(1, chalk_1.default.dim("\nResume this session with:\nclaude --resume ".concat(resumeArg, "\n")));
            resumeHintPrinted = true;
        }
        catch (_a) {
            // Ignore write errors
        }
    }
}
/* eslint-enable custom-rules/no-sync-fs */
/**
 * Force process exit, handling the case where the terminal is gone.
 * When the terminal/PTY is closed (e.g., SIGHUP), process.exit() can throw
 * EIO errors because Bun tries to flush stdout to a dead file descriptor.
 * In that case, fall back to SIGKILL which always works.
 */
function forceExit(exitCode) {
    var _a;
    // Clear failsafe timer since we're exiting now
    if (failsafeTimer !== undefined) {
        clearTimeout(failsafeTimer);
        failsafeTimer = undefined;
    }
    // Drain stdin LAST, right before exit. cleanupTerminalModes() sent
    // DISABLE_MOUSE_TRACKING early, but the terminal round-trip plus any
    // events already in flight means bytes can arrive during the seconds
    // of async cleanup between then and now. Draining here catches them.
    // Use the Ink class method (not the standalone drainStdin()) so we
    // drain the instance's stdin — when process.stdin is piped,
    // getStdinOverride() opens /dev/tty as the real input stream and the
    // class method knows about it; the standalone function defaults to
    // process.stdin which would early-return on isTTY=false.
    try {
        (_a = instances_js_1.default.get(process.stdout)) === null || _a === void 0 ? void 0 : _a.drainStdin();
    }
    catch (_b) {
        // Terminal may be gone (SIGHUP). Ignore — we are about to exit.
    }
    try {
        process.exit(exitCode);
    }
    catch (e) {
        // process.exit() threw. In tests, it's mocked to throw - re-throw so test sees it.
        // In production, it's likely EIO from dead terminal - use SIGKILL.
        if (process.env.NODE_ENV === 'test') {
            throw e;
        }
        // Fall back to SIGKILL which doesn't try to flush anything.
        process.kill(process.pid, 'SIGKILL');
    }
    // In tests, process.exit may be mocked to return instead of exiting.
    // In production, we should never reach here.
    if (process.env.NODE_ENV !== 'test') {
        throw new Error('unreachable');
    }
    // TypeScript trick: cast to never since we know this only happens in tests
    // where the mock returns instead of exiting
    return undefined;
}
/**
 * Set up global signal handlers for graceful shutdown
 */
exports.setupGracefulShutdown = (0, memoize_js_1.default)(function () {
    // Work around a Bun bug where process.removeListener(sig, fn) resets the
    // kernel sigaction for that signal even when other JS listeners remain —
    // the signal then falls back to its default action (terminate) and our
    // process.on('SIGTERM') handler never runs.
    //
    // Trigger: any short-lived signal-exit v4 subscriber (e.g. execa per child
    // process, or an Ink instance that unmounts). When its unsubscribe runs and
    // it was the last v4 subscriber, v4.unload() calls removeListener on every
    // signal in its list (SIGTERM, SIGINT, SIGHUP, …), tripping the Bun bug and
    // nuking our handlers at the kernel level.
    //
    // Fix: pin signal-exit v4 loaded by registering a no-op onExit callback that
    // is never unsubscribed. This keeps v4's internal emitter count > 0 so
    // unload() never runs and removeListener is never called. Harmless under
    // Node.js — the pin also ensures signal-exit's process.exit hook stays
    // active for Ink cleanup.
    (0, signal_exit_1.onExit)(function () { });
    process.on('SIGINT', function () {
        // In print mode, print.ts registers its own SIGINT handler that aborts
        // the in-flight query and calls gracefulShutdown(0); skip here to
        // avoid racing with it. Only check print mode — other non-interactive
        // sessions (--sdk-url, --init-only, non-TTY) don't register their own
        // SIGINT handler and need gracefulShutdown to run.
        if (process.argv.includes('-p') || process.argv.includes('--print')) {
            return;
        }
        (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'shutdown_signal', { signal: 'SIGINT' });
        void gracefulShutdown(0);
    });
    process.on('SIGTERM', function () {
        (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'shutdown_signal', { signal: 'SIGTERM' });
        void gracefulShutdown(143); // Exit code 143 (128 + 15) for SIGTERM
    });
    if (process.platform !== 'win32') {
        process.on('SIGHUP', function () {
            (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'shutdown_signal', { signal: 'SIGHUP' });
            void gracefulShutdown(129); // Exit code 129 (128 + 1) for SIGHUP
        });
        // Detect orphaned process when terminal closes without delivering SIGHUP.
        // macOS revokes TTY file descriptors instead of signaling, leaving the
        // process alive but unable to read/write. Periodically check stdin validity.
        if (process.stdin.isTTY) {
            orphanCheckInterval = setInterval(function () {
                // Skip during scroll drain — even a cheap check consumes an event
                // loop tick that scroll frames need. 30s interval → missing one is fine.
                if ((0, state_js_1.getIsScrollDraining)())
                    return;
                // process.stdout.writable becomes false when the TTY is revoked
                if (!process.stdout.writable || !process.stdin.readable) {
                    clearInterval(orphanCheckInterval);
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'shutdown_signal', {
                        signal: 'orphan_detected',
                    });
                    void gracefulShutdown(129);
                }
            }, 30000); // Check every 30 seconds
            orphanCheckInterval.unref(); // Don't keep process alive just for this check
        }
    }
    // Log uncaught exceptions for container observability and analytics
    // Error names (e.g., "TypeError") are not sensitive - safe to log
    process.on('uncaughtException', function (error) {
        (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'uncaught_exception', {
            error_name: error.name,
            error_message: error.message.slice(0, 2000),
        });
        (0, index_js_1.logEvent)('tengu_uncaught_exception', {
            error_name: error.name,
        });
    });
    // Log unhandled promise rejections for container observability and analytics
    process.on('unhandledRejection', function (reason) {
        var _a;
        var errorName = reason instanceof Error
            ? reason.name
            : typeof reason === 'string'
                ? 'string'
                : 'unknown';
        var errorInfo = reason instanceof Error
            ? {
                error_name: reason.name,
                error_message: reason.message.slice(0, 2000),
                error_stack: (_a = reason.stack) === null || _a === void 0 ? void 0 : _a.slice(0, 4000),
            }
            : { error_message: String(reason).slice(0, 2000) };
        (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'unhandled_rejection', errorInfo);
        (0, index_js_1.logEvent)('tengu_unhandled_rejection', {
            error_name: errorName,
        });
    });
});
function gracefulShutdownSync(exitCode, reason, options) {
    if (exitCode === void 0) { exitCode = 0; }
    if (reason === void 0) { reason = 'other'; }
    // Set the exit code that will be used when process naturally exits. Note that we do it
    // here inside the sync version too so that it is possible to determine if
    // gracefulShutdownSync was called by checking process.exitCode.
    process.exitCode = exitCode;
    pendingShutdown = gracefulShutdown(exitCode, reason, options)
        .catch(function (error) {
        (0, debug_js_1.logForDebugging)("Graceful shutdown failed: ".concat(error), { level: 'error' });
        cleanupTerminalModes();
        printResumeHint();
        forceExit(exitCode);
    })
        // Prevent unhandled rejection: forceExit re-throws in test mode,
        // which would escape the .catch() handler above as a new rejection.
        .catch(function () { });
}
var shutdownInProgress = false;
var failsafeTimer;
var orphanCheckInterval;
var pendingShutdown;
/** Check if graceful shutdown is in progress */
function isShuttingDown() {
    return shutdownInProgress;
}
/** Reset shutdown state - only for use in tests */
function resetShutdownState() {
    shutdownInProgress = false;
    resumeHintPrinted = false;
    if (failsafeTimer !== undefined) {
        clearTimeout(failsafeTimer);
        failsafeTimer = undefined;
    }
    pendingShutdown = undefined;
}
/**
 * Returns the in-flight shutdown promise, if any. Only for use in tests
 * to await completion before restoring mocks.
 */
function getPendingShutdownForTesting() {
    return pendingShutdown;
}
// Graceful shutdown function that drains the event loop
function gracefulShutdown() {
    return __awaiter(this, arguments, void 0, function (exitCode, reason, options) {
        var _a, executeSessionEndHooks, getSessionEndHookTimeoutMs, sessionEndTimeoutMs, cleanupTimeoutId, cleanupPromise, _b, _c, lastRequestId, _d;
        var _this = this;
        if (exitCode === void 0) { exitCode = 0; }
        if (reason === void 0) { reason = 'other'; }
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    if (shutdownInProgress) {
                        return [2 /*return*/];
                    }
                    shutdownInProgress = true;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./hooks.js'); })];
                case 1:
                    _a = _e.sent(), executeSessionEndHooks = _a.executeSessionEndHooks, getSessionEndHookTimeoutMs = _a.getSessionEndHookTimeoutMs;
                    sessionEndTimeoutMs = getSessionEndHookTimeoutMs();
                    // Failsafe: guarantee process exits even if cleanup hangs (e.g., MCP connections).
                    // Runs cleanupTerminalModes first so a hung cleanup doesn't leave the terminal dirty.
                    // Budget = max(5s, hook budget + 3.5s headroom for cleanup + analytics flush).
                    failsafeTimer = setTimeout(function (code) {
                        cleanupTerminalModes();
                        printResumeHint();
                        forceExit(code);
                    }, Math.max(5000, sessionEndTimeoutMs + 3500), exitCode);
                    failsafeTimer.unref();
                    // Set the exit code that will be used when process naturally exits
                    process.exitCode = exitCode;
                    // Exit alt screen and print resume hint FIRST, before any async operations.
                    // This ensures the hint is visible even if the process is killed during
                    // cleanup (e.g., SIGKILL during macOS reboot). Without this, the resume
                    // hint would only appear after cleanup functions, hooks, and analytics
                    // flush — which can take several seconds.
                    cleanupTerminalModes();
                    printResumeHint();
                    _e.label = 2;
                case 2:
                    _e.trys.push([2, 4, , 5]);
                    cleanupPromise = (function () { return __awaiter(_this, void 0, void 0, function () {
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, (0, cleanupRegistry_js_1.runCleanupFunctions)()];
                                case 1:
                                    _b.sent();
                                    return [3 /*break*/, 3];
                                case 2:
                                    _a = _b.sent();
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); })();
                    return [4 /*yield*/, Promise.race([
                            cleanupPromise,
                            new Promise(function (_, reject) {
                                cleanupTimeoutId = setTimeout(function (rej) { return rej(new CleanupTimeoutError()); }, 2000, reject);
                            }),
                        ])];
                case 3:
                    _e.sent();
                    clearTimeout(cleanupTimeoutId);
                    return [3 /*break*/, 5];
                case 4:
                    _b = _e.sent();
                    // Silently handle timeout and other errors
                    clearTimeout(cleanupTimeoutId);
                    return [3 /*break*/, 5];
                case 5:
                    _e.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, executeSessionEndHooks(reason, __assign(__assign({}, options), { signal: AbortSignal.timeout(sessionEndTimeoutMs), timeoutMs: sessionEndTimeoutMs }))];
                case 6:
                    _e.sent();
                    return [3 /*break*/, 8];
                case 7:
                    _c = _e.sent();
                    return [3 /*break*/, 8];
                case 8:
                    // Log startup perf before analytics shutdown flushes/cancels timers
                    try {
                        (0, startupProfiler_js_1.profileReport)();
                    }
                    catch (_f) {
                        // Ignore profiling errors during shutdown
                    }
                    lastRequestId = (0, state_js_1.getLastMainRequestId)();
                    if (lastRequestId) {
                        (0, index_js_1.logEvent)('tengu_cache_eviction_hint', {
                            scope: 'session_end',
                            last_request_id: lastRequestId,
                        });
                    }
                    _e.label = 9;
                case 9:
                    _e.trys.push([9, 11, , 12]);
                    return [4 /*yield*/, Promise.race([
                            Promise.all([(0, firstPartyEventLogger_js_1.shutdown1PEventLogging)(), (0, datadog_js_1.shutdownDatadog)()]),
                            (0, sleep_js_1.sleep)(500),
                        ])];
                case 10:
                    _e.sent();
                    return [3 /*break*/, 12];
                case 11:
                    _d = _e.sent();
                    return [3 /*break*/, 12];
                case 12:
                    if (options === null || options === void 0 ? void 0 : options.finalMessage) {
                        try {
                            // eslint-disable-next-line custom-rules/no-sync-fs -- must flush before forceExit
                            (0, fs_1.writeSync)(2, options.finalMessage + '\n');
                        }
                        catch (_g) {
                            // stderr may be closed (e.g., SSH disconnect). Ignore write errors.
                        }
                    }
                    forceExit(exitCode);
                    return [2 /*return*/];
            }
        });
    });
}
var CleanupTimeoutError = /** @class */ (function (_super) {
    __extends(CleanupTimeoutError, _super);
    function CleanupTimeoutError() {
        return _super.call(this, 'Cleanup timeout') || this;
    }
    return CleanupTimeoutError;
}(Error));
