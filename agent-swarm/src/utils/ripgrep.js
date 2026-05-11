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
exports.countFilesRoundedRg = exports.RipgrepTimeoutError = void 0;
exports.ripgrepCommand = ripgrepCommand;
exports.ripGrepStream = ripGrepStream;
exports.ripGrep = ripGrep;
exports.getRipgrepStatus = getRipgrepStatus;
var child_process_1 = require("child_process");
var memoize_js_1 = require("lodash-es/memoize.js");
var os_1 = require("os");
var path = require("path");
var index_js_1 = require("src/services/analytics/index.js");
var url_1 = require("url");
var bundledMode_js_1 = require("./bundledMode.js");
var debug_js_1 = require("./debug.js");
var envUtils_js_1 = require("./envUtils.js");
var execFileNoThrow_js_1 = require("./execFileNoThrow.js");
var findExecutable_js_1 = require("./findExecutable.js");
var log_js_1 = require("./log.js");
var platform_js_1 = require("./platform.js");
var stringUtils_js_1 = require("./stringUtils.js");
var __filename = (0, url_1.fileURLToPath)(import.meta.url);
// we use node:path.join instead of node:url.resolve because the former doesn't encode spaces
var __dirname = path.join(__filename, process.env.NODE_ENV === 'test' ? '../../../' : '../');
var getRipgrepConfig = (0, memoize_js_1.default)(function () {
    var userWantsSystemRipgrep = (0, envUtils_js_1.isEnvDefinedFalsy)(process.env.USE_BUILTIN_RIPGREP);
    // Try system ripgrep if user wants it
    if (userWantsSystemRipgrep) {
        var systemPath = (0, findExecutable_js_1.findExecutable)('rg', []).cmd;
        if (systemPath !== 'rg') {
            // SECURITY: Use command name 'rg' instead of systemPath to prevent PATH hijacking
            // If we used systemPath, a malicious ./rg.exe in current directory could be executed
            // Using just 'rg' lets the OS resolve it safely with NoDefaultCurrentDirectoryInExePath protection
            return { mode: 'system', command: 'rg', args: [] };
        }
    }
    // In bundled (native) mode, ripgrep is statically compiled into bun-internal
    // and dispatches based on argv[0]. We spawn ourselves with argv0='rg'.
    if ((0, bundledMode_js_1.isInBundledMode)()) {
        return {
            mode: 'embedded',
            command: process.execPath,
            args: ['--no-config'],
            argv0: 'rg',
        };
    }
    var rgRoot = path.resolve(__dirname, 'vendor', 'ripgrep');
    var command = process.platform === 'win32'
        ? path.resolve(rgRoot, "".concat(process.arch, "-win32"), 'rg.exe')
        : path.resolve(rgRoot, "".concat(process.arch, "-").concat(process.platform), 'rg');
    return { mode: 'builtin', command: command, args: [] };
});
function ripgrepCommand() {
    var config = getRipgrepConfig();
    return {
        rgPath: config.command,
        rgArgs: config.args,
        argv0: config.argv0,
    };
}
var MAX_BUFFER_SIZE = 20000000; // 20MB; large monorepos can have 200k+ files
/**
 * Check if an error is EAGAIN (resource temporarily unavailable).
 * This happens in resource-constrained environments (Docker, CI) when
 * ripgrep tries to spawn too many threads.
 */
function isEagainError(stderr) {
    return (stderr.includes('os error 11') ||
        stderr.includes('Resource temporarily unavailable'));
}
/**
 * Custom error class for ripgrep timeouts.
 * This allows callers to distinguish between "no matches" and "timed out".
 */
var RipgrepTimeoutError = /** @class */ (function (_super) {
    __extends(RipgrepTimeoutError, _super);
    function RipgrepTimeoutError(message, partialResults) {
        var _this = _super.call(this, message) || this;
        _this.partialResults = partialResults;
        _this.name = 'RipgrepTimeoutError';
        return _this;
    }
    return RipgrepTimeoutError;
}(Error));
exports.RipgrepTimeoutError = RipgrepTimeoutError;
function ripGrepRaw(args, target, abortSignal, callback, singleThread) {
    // NB: When running interactively, ripgrep does not require a path as its last
    // argument, but when run non-interactively, it will hang unless a path or file
    // pattern is provided
    var _a, _b;
    if (singleThread === void 0) { singleThread = false; }
    var _c = ripgrepCommand(), rgPath = _c.rgPath, rgArgs = _c.rgArgs, argv0 = _c.argv0;
    // Use single-threaded mode only if explicitly requested for this call's retry
    var threadArgs = singleThread ? ['-j', '1'] : [];
    var fullArgs = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], rgArgs, true), threadArgs, true), args, true), [target], false);
    // Allow timeout to be configured via env var (in seconds), otherwise use platform defaults
    // WSL has severe performance penalty for file reads (3-5x slower on WSL2)
    var defaultTimeout = (0, platform_js_1.getPlatform)() === 'wsl' ? 60000 : 20000;
    var parsedSeconds = parseInt(process.env.CLAUDE_CODE_GLOB_TIMEOUT_SECONDS || '', 10) || 0;
    var timeout = parsedSeconds > 0 ? parsedSeconds * 1000 : defaultTimeout;
    // For embedded ripgrep, use spawn with argv0 (execFile doesn't support argv0 properly)
    if (argv0) {
        var child_1 = (0, child_process_1.spawn)(rgPath, fullArgs, {
            argv0: argv0,
            signal: abortSignal,
            // Prevent visible console window on Windows (no-op on other platforms)
            windowsHide: true,
        });
        var stdout_1 = '';
        var stderr_1 = '';
        var stdoutTruncated_1 = false;
        var stderrTruncated_1 = false;
        (_a = child_1.stdout) === null || _a === void 0 ? void 0 : _a.on('data', function (data) {
            if (!stdoutTruncated_1) {
                stdout_1 += data.toString();
                if (stdout_1.length > MAX_BUFFER_SIZE) {
                    stdout_1 = stdout_1.slice(0, MAX_BUFFER_SIZE);
                    stdoutTruncated_1 = true;
                }
            }
        });
        (_b = child_1.stderr) === null || _b === void 0 ? void 0 : _b.on('data', function (data) {
            if (!stderrTruncated_1) {
                stderr_1 += data.toString();
                if (stderr_1.length > MAX_BUFFER_SIZE) {
                    stderr_1 = stderr_1.slice(0, MAX_BUFFER_SIZE);
                    stderrTruncated_1 = true;
                }
            }
        });
        // Set up timeout with SIGKILL escalation.
        // SIGTERM alone may not kill ripgrep if it's blocked in uninterruptible I/O
        // (e.g., deep filesystem traversal). If SIGTERM doesn't work within 5 seconds,
        // escalate to SIGKILL which cannot be caught or ignored.
        // On Windows, child.kill('SIGTERM') throws; use default signal.
        var killTimeoutId_1;
        var timeoutId_1 = setTimeout(function () {
            if (process.platform === 'win32') {
                child_1.kill();
            }
            else {
                child_1.kill('SIGTERM');
                killTimeoutId_1 = setTimeout(function (c) { return c.kill('SIGKILL'); }, 5000, child_1);
            }
        }, timeout);
        // On Windows, both 'close' and 'error' can fire for the same process
        // (e.g. when AbortSignal kills the child). Guard against double-callback.
        var settled_1 = false;
        child_1.on('close', function (code, signal) {
            if (settled_1)
                return;
            settled_1 = true;
            clearTimeout(timeoutId_1);
            clearTimeout(killTimeoutId_1);
            if (code === 0 || code === 1) {
                // 0 = matches found, 1 = no matches (both are success)
                callback(null, stdout_1, stderr_1);
            }
            else {
                var error = new Error("ripgrep exited with code ".concat(code));
                error.code = code !== null && code !== void 0 ? code : undefined;
                error.signal = signal !== null && signal !== void 0 ? signal : undefined;
                callback(error, stdout_1, stderr_1);
            }
        });
        child_1.on('error', function (err) {
            if (settled_1)
                return;
            settled_1 = true;
            clearTimeout(timeoutId_1);
            clearTimeout(killTimeoutId_1);
            var error = err;
            callback(error, stdout_1, stderr_1);
        });
        return child_1;
    }
    // For non-embedded ripgrep, use execFile
    // Use SIGKILL as killSignal because SIGTERM may not terminate ripgrep
    // when it's blocked in uninterruptible filesystem I/O.
    // On Windows, SIGKILL throws; use default (undefined) which sends SIGTERM.
    return (0, child_process_1.execFile)(rgPath, fullArgs, {
        maxBuffer: MAX_BUFFER_SIZE,
        signal: abortSignal,
        timeout: timeout,
        killSignal: process.platform === 'win32' ? undefined : 'SIGKILL',
    }, callback);
}
/**
 * Stream-count lines from `rg --files` without buffering stdout.
 *
 * On large repos (e.g. 247k files, 16MB of paths), calling `ripGrep()` just
 * to read `.length` materializes the full stdout string plus a 247k-element
 * array. This counts newline bytes per chunk instead; peak memory is one
 * stream chunk (~64KB).
 *
 * Intentionally minimal: the only caller is telemetry (countFilesRoundedRg),
 * which swallows all errors. No EAGAIN retry, no stderr capture, no internal
 * timeout (callers pass AbortSignal.timeout; spawn's signal option kills rg).
 */
function ripGrepFileCount(args, target, abortSignal) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, rgPath, rgArgs, argv0;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, codesignRipgrepIfNecessary()];
                case 1:
                    _b.sent();
                    _a = ripgrepCommand(), rgPath = _a.rgPath, rgArgs = _a.rgArgs, argv0 = _a.argv0;
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            var _a;
                            var child = (0, child_process_1.spawn)(rgPath, __spreadArray(__spreadArray(__spreadArray([], rgArgs, true), args, true), [target], false), {
                                argv0: argv0,
                                signal: abortSignal,
                                windowsHide: true,
                                stdio: ['ignore', 'pipe', 'ignore'],
                            });
                            var lines = 0;
                            (_a = child.stdout) === null || _a === void 0 ? void 0 : _a.on('data', function (chunk) {
                                lines += (0, stringUtils_js_1.countCharInString)(chunk, '\n');
                            });
                            // On Windows, both 'close' and 'error' can fire for the same process.
                            var settled = false;
                            child.on('close', function (code) {
                                if (settled)
                                    return;
                                settled = true;
                                if (code === 0 || code === 1)
                                    resolve(lines);
                                else
                                    reject(new Error("rg --files exited ".concat(code)));
                            });
                            child.on('error', function (err) {
                                if (settled)
                                    return;
                                settled = true;
                                reject(err);
                            });
                        })];
            }
        });
    });
}
/**
 * Stream lines from ripgrep as they arrive, calling `onLines` per stdout chunk.
 *
 * Unlike `ripGrep()` which buffers the entire stdout, this flushes complete
 * lines as soon as each chunk arrives — first results paint while rg is still
 * walking the tree (the fzf `change:reload` pattern). Partial trailing lines
 * are carried across chunk boundaries.
 *
 * Callers that want to stop early (e.g. after N matches) should abort the
 * signal — spawn's signal option kills rg. No EAGAIN retry, no internal
 * timeout, stderr is ignored; interactive callers own recovery.
 */
function ripGrepStream(args, target, abortSignal, onLines) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, rgPath, rgArgs, argv0;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, codesignRipgrepIfNecessary()];
                case 1:
                    _b.sent();
                    _a = ripgrepCommand(), rgPath = _a.rgPath, rgArgs = _a.rgArgs, argv0 = _a.argv0;
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            var _a;
                            var child = (0, child_process_1.spawn)(rgPath, __spreadArray(__spreadArray(__spreadArray([], rgArgs, true), args, true), [target], false), {
                                argv0: argv0,
                                signal: abortSignal,
                                windowsHide: true,
                                stdio: ['ignore', 'pipe', 'ignore'],
                            });
                            var stripCR = function (l) { return (l.endsWith('\r') ? l.slice(0, -1) : l); };
                            var remainder = '';
                            (_a = child.stdout) === null || _a === void 0 ? void 0 : _a.on('data', function (chunk) {
                                var _a;
                                var data = remainder + chunk.toString();
                                var lines = data.split('\n');
                                remainder = (_a = lines.pop()) !== null && _a !== void 0 ? _a : '';
                                if (lines.length)
                                    onLines(lines.map(stripCR));
                            });
                            // On Windows, both 'close' and 'error' can fire for the same process.
                            var settled = false;
                            child.on('close', function (code) {
                                if (settled)
                                    return;
                                // Abort races close — don't flush a torn tail from a killed process.
                                // Promise still settles: spawn's signal option fires 'error' with
                                // AbortError → reject below.
                                if (abortSignal.aborted)
                                    return;
                                settled = true;
                                if (code === 0 || code === 1) {
                                    if (remainder)
                                        onLines([stripCR(remainder)]);
                                    resolve();
                                }
                                else {
                                    reject(new Error("ripgrep exited with code ".concat(code)));
                                }
                            });
                            child.on('error', function (err) {
                                if (settled)
                                    return;
                                settled = true;
                                reject(err);
                            });
                        })];
            }
        });
    });
}
function ripGrep(args, target, abortSignal) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, codesignRipgrepIfNecessary()
                    // Test ripgrep on first use and cache the result (fire and forget)
                ];
                case 1:
                    _a.sent();
                    // Test ripgrep on first use and cache the result (fire and forget)
                    void testRipgrepOnFirstUse().catch(function (error) {
                        (0, log_js_1.logError)(error);
                    });
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            var handleResult = function (error, stdout, stderr, isRetry) {
                                // Success case
                                if (!error) {
                                    resolve(stdout
                                        .trim()
                                        .split('\n')
                                        .map(function (line) { return line.replace(/\r$/, ''); })
                                        .filter(Boolean));
                                    return;
                                }
                                // Exit code 1 is normal "no matches"
                                if (error.code === 1) {
                                    resolve([]);
                                    return;
                                }
                                // Critical errors that indicate ripgrep is broken, not "no matches"
                                // These should be surfaced to the user rather than silently returning empty results
                                var CRITICAL_ERROR_CODES = ['ENOENT', 'EACCES', 'EPERM'];
                                if (CRITICAL_ERROR_CODES.includes(error.code)) {
                                    reject(error);
                                    return;
                                }
                                // If we hit EAGAIN and haven't retried yet, retry with single-threaded mode
                                // Note: We only use -j 1 for this specific retry, not for future calls.
                                // Persisting single-threaded mode globally caused timeouts on large repos
                                // where EAGAIN was just a transient startup error.
                                if (!isRetry && isEagainError(stderr)) {
                                    (0, debug_js_1.logForDebugging)("rg EAGAIN error detected, retrying with single-threaded mode (-j 1)");
                                    (0, index_js_1.logEvent)('tengu_ripgrep_eagain_retry', {});
                                    ripGrepRaw(args, target, abortSignal, function (retryError, retryStdout, retryStderr) {
                                        handleResult(retryError, retryStdout, retryStderr, true);
                                    }, true);
                                    return;
                                }
                                // For all other errors, try to return partial results if available
                                var hasOutput = stdout && stdout.trim().length > 0;
                                var isTimeout = error.signal === 'SIGTERM' ||
                                    error.signal === 'SIGKILL' ||
                                    error.code === 'ABORT_ERR';
                                var isBufferOverflow = error.code === 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER';
                                var lines = [];
                                if (hasOutput) {
                                    lines = stdout
                                        .trim()
                                        .split('\n')
                                        .map(function (line) { return line.replace(/\r$/, ''); })
                                        .filter(Boolean);
                                    // Drop last line for timeouts and buffer overflow - it may be incomplete
                                    if (lines.length > 0 && (isTimeout || isBufferOverflow)) {
                                        lines = lines.slice(0, -1);
                                    }
                                }
                                (0, debug_js_1.logForDebugging)("rg error (signal=".concat(error.signal, ", code=").concat(error.code, ", stderr: ").concat(stderr, "), ").concat(lines.length, " results"));
                                // code 2 = ripgrep usage error (already handled); ABORT_ERR = caller
                                // explicitly aborted (not an error, just a cancellation — interactive
                                // callers may abort on every keystroke-after-debounce).
                                if (error.code !== 2 && error.code !== 'ABORT_ERR') {
                                    (0, log_js_1.logError)(error);
                                }
                                // If we timed out with no results, throw an error so Claude knows the search
                                // didn't complete rather than thinking there were no matches
                                if (isTimeout && lines.length === 0) {
                                    reject(new RipgrepTimeoutError("Ripgrep search timed out after ".concat((0, platform_js_1.getPlatform)() === 'wsl' ? 60 : 20, " seconds. The search may have matched files but did not complete in time. Try searching a more specific path or pattern."), lines));
                                    return;
                                }
                                resolve(lines);
                            };
                            ripGrepRaw(args, target, abortSignal, function (error, stdout, stderr) {
                                handleResult(error, stdout, stderr, false);
                            });
                        })];
            }
        });
    });
}
/**
 * Count files in a directory recursively using ripgrep and round to the nearest power of 10 for privacy
 *
 * This is much more efficient than using native Node.js methods for counting files
 * in large directories since it uses ripgrep's highly optimized file traversal.
 *
 * @param path Directory path to count files in
 * @param abortSignal AbortSignal to cancel the operation
 * @param ignorePatterns Optional additional patterns to ignore (beyond .gitignore)
 * @returns Approximate file count rounded to the nearest power of 10
 */
exports.countFilesRoundedRg = (0, memoize_js_1.default)(function (dirPath_1, abortSignal_1) {
    var args_1 = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args_1[_i - 2] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([dirPath_1, abortSignal_1], args_1, true), void 0, function (dirPath, abortSignal, ignorePatterns) {
        var args_2, count, magnitude, power, error_1;
        if (ignorePatterns === void 0) { ignorePatterns = []; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Skip file counting if we're in the home directory to avoid triggering
                    // macOS TCC permission dialogs for Desktop, Downloads, Documents, etc.
                    if (path.resolve(dirPath) === path.resolve((0, os_1.homedir)())) {
                        return [2 /*return*/, undefined];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    args_2 = ['--files', '--hidden'];
                    // Add ignore patterns if provided
                    ignorePatterns.forEach(function (pattern) {
                        args_2.push('--glob', "!".concat(pattern));
                    });
                    return [4 /*yield*/, ripGrepFileCount(args_2, dirPath, abortSignal)
                        // Round to nearest power of 10 for privacy
                    ];
                case 2:
                    count = _a.sent();
                    // Round to nearest power of 10 for privacy
                    if (count === 0)
                        return [2 /*return*/, 0];
                    magnitude = Math.floor(Math.log10(count));
                    power = Math.pow(10, magnitude);
                    // Round to nearest power of 10
                    // e.g., 8 -> 10, 42 -> 100, 350 -> 100, 750 -> 1000
                    return [2 /*return*/, Math.round(count / power) * power];
                case 3:
                    error_1 = _a.sent();
                    // AbortSignal.timeout firing is expected on large/slow repos, not an error.
                    if ((error_1 === null || error_1 === void 0 ? void 0 : error_1.name) !== 'AbortError')
                        (0, log_js_1.logError)(error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}, 
// lodash memoize's default resolver only uses the first argument.
// ignorePatterns affect the result, so include them in the cache key.
// abortSignal is intentionally excluded — it doesn't affect the count.
function (dirPath, _abortSignal, ignorePatterns) {
    if (ignorePatterns === void 0) { ignorePatterns = []; }
    return "".concat(dirPath, "|").concat(ignorePatterns.join(','));
});
// Singleton to store ripgrep availability status
var ripgrepStatus = null;
/**
 * Get ripgrep status and configuration info
 * Returns current configuration immediately, with working status if available
 */
function getRipgrepStatus() {
    var _a;
    var config = getRipgrepConfig();
    return {
        mode: config.mode,
        path: config.command,
        working: (_a = ripgrepStatus === null || ripgrepStatus === void 0 ? void 0 : ripgrepStatus.working) !== null && _a !== void 0 ? _a : null,
    };
}
/**
 * Test ripgrep availability on first use and cache the result
 */
var testRipgrepOnFirstUse = (0, memoize_js_1.default)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var config, test, proc, _a, stdout, code, working, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                // Already tested
                if (ripgrepStatus !== null) {
                    return [2 /*return*/];
                }
                config = getRipgrepConfig();
                _b.label = 1;
            case 1:
                _b.trys.push([1, 6, , 7]);
                test = void 0;
                if (!config.argv0) return [3 /*break*/, 3];
                proc = Bun.spawn([config.command, '--version'], {
                    argv0: config.argv0,
                    stderr: 'ignore',
                    stdout: 'pipe',
                });
                return [4 /*yield*/, Promise.all([
                        proc.stdout.text(),
                        proc.exited,
                    ])];
            case 2:
                _a = _b.sent(), stdout = _a[0], code = _a[1];
                test = {
                    code: code,
                    stdout: stdout,
                };
                return [3 /*break*/, 5];
            case 3: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)(config.command, __spreadArray(__spreadArray([], config.args, true), ['--version'], false), {
                    timeout: 5000,
                })];
            case 4:
                test = _b.sent();
                _b.label = 5;
            case 5:
                working = test.code === 0 && !!test.stdout && test.stdout.startsWith('ripgrep ');
                ripgrepStatus = {
                    working: working,
                    lastTested: Date.now(),
                    config: config,
                };
                (0, debug_js_1.logForDebugging)("Ripgrep first use test: ".concat(working ? 'PASSED' : 'FAILED', " (mode=").concat(config.mode, ", path=").concat(config.command, ")"));
                // Log telemetry for actual ripgrep availability
                (0, index_js_1.logEvent)('tengu_ripgrep_availability', {
                    working: working ? 1 : 0,
                    using_system: config.mode === 'system' ? 1 : 0,
                });
                return [3 /*break*/, 7];
            case 6:
                error_2 = _b.sent();
                ripgrepStatus = {
                    working: false,
                    lastTested: Date.now(),
                    config: config,
                };
                (0, log_js_1.logError)(error_2);
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
var alreadyDoneSignCheck = false;
function codesignRipgrepIfNecessary() {
    return __awaiter(this, void 0, void 0, function () {
        var config, builtinPath, lines, needsSigned, signResult, quarantineResult, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (process.platform !== 'darwin' || alreadyDoneSignCheck) {
                        return [2 /*return*/];
                    }
                    alreadyDoneSignCheck = true;
                    config = getRipgrepConfig();
                    if (config.mode !== 'builtin') {
                        return [2 /*return*/];
                    }
                    builtinPath = config.command;
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('codesign', ['-vv', '-d', builtinPath], {
                            preserveOutputOnError: false,
                        })];
                case 1:
                    lines = (_a.sent()).stdout.split('\n');
                    needsSigned = lines.find(function (line) { return line.includes('linker-signed'); });
                    if (!needsSigned) {
                        return [2 /*return*/];
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('codesign', [
                            '--sign',
                            '-',
                            '--force',
                            '--preserve-metadata=entitlements,requirements,flags,runtime',
                            builtinPath,
                        ])];
                case 3:
                    signResult = _a.sent();
                    if (signResult.code !== 0) {
                        (0, log_js_1.logError)(new Error("Failed to sign ripgrep: ".concat(signResult.stdout, " ").concat(signResult.stderr)));
                    }
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('xattr', [
                            '-d',
                            'com.apple.quarantine',
                            builtinPath,
                        ])];
                case 4:
                    quarantineResult = _a.sent();
                    if (quarantineResult.code !== 0) {
                        (0, log_js_1.logError)(new Error("Failed to remove quarantine: ".concat(quarantineResult.stdout, " ").concat(quarantineResult.stderr)));
                    }
                    return [3 /*break*/, 6];
                case 5:
                    e_1 = _a.sent();
                    (0, log_js_1.logError)(e_1);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
