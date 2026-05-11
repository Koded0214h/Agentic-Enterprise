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
exports.getDebugFilePath = exports.isDebugToStdErr = exports.getDebugFilter = exports.isDebugMode = exports.getMinDebugLogLevel = void 0;
exports.enableDebugLogging = enableDebugLogging;
exports.setHasFormattedOutput = setHasFormattedOutput;
exports.getHasFormattedOutput = getHasFormattedOutput;
exports.flushDebugLogs = flushDebugLogs;
exports.logForDebugging = logForDebugging;
exports.getDebugLogPath = getDebugLogPath;
exports.logAntError = logAntError;
var promises_1 = require("fs/promises");
var memoize_js_1 = require("lodash-es/memoize.js");
var path_1 = require("path");
var state_js_1 = require("src/bootstrap/state.js");
var bufferedWriter_js_1 = require("./bufferedWriter.js");
var cleanupRegistry_js_1 = require("./cleanupRegistry.js");
var debugFilter_js_1 = require("./debugFilter.js");
var envUtils_js_1 = require("./envUtils.js");
var fsOperations_js_1 = require("./fsOperations.js");
var process_js_1 = require("./process.js");
var slowOperations_js_1 = require("./slowOperations.js");
var LEVEL_ORDER = {
    verbose: 0,
    debug: 1,
    info: 2,
    warn: 3,
    error: 4,
};
/**
 * Minimum log level to include in debug output. Defaults to 'debug', which
 * filters out 'verbose' messages. Set CLAUDE_CODE_DEBUG_LOG_LEVEL=verbose to
 * include high-volume diagnostics (e.g. full statusLine command, shell, cwd,
 * stdout/stderr) that would otherwise drown out useful debug output.
 */
exports.getMinDebugLogLevel = (0, memoize_js_1.default)(function () {
    var _a;
    var raw = (_a = process.env.CLAUDE_CODE_DEBUG_LOG_LEVEL) === null || _a === void 0 ? void 0 : _a.toLowerCase().trim();
    if (raw && Object.hasOwn(LEVEL_ORDER, raw)) {
        return raw;
    }
    return 'debug';
});
var runtimeDebugEnabled = false;
exports.isDebugMode = (0, memoize_js_1.default)(function () {
    return (runtimeDebugEnabled ||
        (0, envUtils_js_1.isEnvTruthy)(process.env.DEBUG) ||
        (0, envUtils_js_1.isEnvTruthy)(process.env.DEBUG_SDK) ||
        process.argv.includes('--debug') ||
        process.argv.includes('-d') ||
        (0, exports.isDebugToStdErr)() ||
        // Also check for --debug=pattern syntax
        process.argv.some(function (arg) { return arg.startsWith('--debug='); }) ||
        // --debug-file implicitly enables debug mode
        (0, exports.getDebugFilePath)() !== null);
});
/**
 * Enables debug logging mid-session (e.g. via /debug). Non-ants don't write
 * debug logs by default, so this lets them start capturing without restarting
 * with --debug. Returns true if logging was already active.
 */
function enableDebugLogging() {
    var _a, _b;
    var wasActive = (0, exports.isDebugMode)() || process.env.USER_TYPE === 'ant';
    runtimeDebugEnabled = true;
    (_b = (_a = exports.isDebugMode.cache).clear) === null || _b === void 0 ? void 0 : _b.call(_a);
    return wasActive;
}
// Extract and parse debug filter from command line arguments
// Exported for testing purposes
exports.getDebugFilter = (0, memoize_js_1.default)(function () {
    // Look for --debug=pattern in argv
    var debugArg = process.argv.find(function (arg) { return arg.startsWith('--debug='); });
    if (!debugArg) {
        return null;
    }
    // Extract the pattern after the equals sign
    var filterPattern = debugArg.substring('--debug='.length);
    return (0, debugFilter_js_1.parseDebugFilter)(filterPattern);
});
exports.isDebugToStdErr = (0, memoize_js_1.default)(function () {
    return (process.argv.includes('--debug-to-stderr') || process.argv.includes('-d2e'));
});
exports.getDebugFilePath = (0, memoize_js_1.default)(function () {
    for (var i = 0; i < process.argv.length; i++) {
        var arg = process.argv[i];
        if (arg.startsWith('--debug-file=')) {
            return arg.substring('--debug-file='.length);
        }
        if (arg === '--debug-file' && i + 1 < process.argv.length) {
            return process.argv[i + 1];
        }
    }
    return null;
});
function shouldLogDebugMessage(message) {
    if (process.env.NODE_ENV === 'test' && !(0, exports.isDebugToStdErr)()) {
        return false;
    }
    // Non-ants only write debug logs when debug mode is active (via --debug at
    // startup or /debug mid-session). Ants always log for /share, bug reports.
    if (process.env.USER_TYPE !== 'ant' && !(0, exports.isDebugMode)()) {
        return false;
    }
    if (typeof process === 'undefined' ||
        typeof process.versions === 'undefined' ||
        typeof process.versions.node === 'undefined') {
        return false;
    }
    var filter = (0, exports.getDebugFilter)();
    return (0, debugFilter_js_1.shouldShowDebugMessage)(message, filter);
}
var hasFormattedOutput = false;
function setHasFormattedOutput(value) {
    hasFormattedOutput = value;
}
function getHasFormattedOutput() {
    return hasFormattedOutput;
}
var debugWriter = null;
var pendingWrite = Promise.resolve();
// Module-level so .bind captures only its explicit args, not the
// writeFn closure's parent scope (Jarred, #22257).
function appendAsync(needMkdir, dir, path, content) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!needMkdir) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, promises_1.mkdir)(dir, { recursive: true }).catch(function () { })];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [4 /*yield*/, (0, promises_1.appendFile)(path, content)];
                case 3:
                    _a.sent();
                    void updateLatestDebugLogSymlink();
                    return [2 /*return*/];
            }
        });
    });
}
function noop() { }
function getDebugWriter() {
    var _this = this;
    if (!debugWriter) {
        var ensuredDir_1 = null;
        debugWriter = (0, bufferedWriter_js_1.createBufferedWriter)({
            writeFn: function (content) {
                var path = getDebugLogPath();
                var dir = (0, path_1.dirname)(path);
                var needMkdir = ensuredDir_1 !== dir;
                ensuredDir_1 = dir;
                if ((0, exports.isDebugMode)()) {
                    // immediateMode: must stay sync. Async writes are lost on direct
                    // process.exit() and keep the event loop alive in beforeExit
                    // handlers (infinite loop with Perfetto tracing). See #22257.
                    if (needMkdir) {
                        try {
                            (0, fsOperations_js_1.getFsImplementation)().mkdirSync(dir);
                        }
                        catch (_a) {
                            // Directory already exists
                        }
                    }
                    (0, fsOperations_js_1.getFsImplementation)().appendFileSync(path, content);
                    void updateLatestDebugLogSymlink();
                    return;
                }
                // Buffered path (ants without --debug): flushes ~1/sec so chain
                // depth stays ~1. .bind over a closure so only the bound args are
                // retained, not this scope.
                pendingWrite = pendingWrite
                    .then(appendAsync.bind(null, needMkdir, dir, path, content))
                    .catch(noop);
            },
            flushIntervalMs: 1000,
            maxBufferSize: 100,
            immediateMode: (0, exports.isDebugMode)(),
        });
        (0, cleanupRegistry_js_1.registerCleanup)(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        debugWriter === null || debugWriter === void 0 ? void 0 : debugWriter.dispose();
                        return [4 /*yield*/, pendingWrite];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    }
    return debugWriter;
}
function flushDebugLogs() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    debugWriter === null || debugWriter === void 0 ? void 0 : debugWriter.flush();
                    return [4 /*yield*/, pendingWrite];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function logForDebugging(message, _a) {
    var _b = _a === void 0 ? {
        level: 'debug',
    } : _a, level = _b.level;
    if (LEVEL_ORDER[level] < LEVEL_ORDER[(0, exports.getMinDebugLogLevel)()]) {
        return;
    }
    if (!shouldLogDebugMessage(message)) {
        return;
    }
    // Multiline messages break the jsonl output format, so make any multiline messages JSON.
    if (hasFormattedOutput && message.includes('\n')) {
        message = (0, slowOperations_js_1.jsonStringify)(message);
    }
    var timestamp = new Date().toISOString();
    var output = "".concat(timestamp, " [").concat(level.toUpperCase(), "] ").concat(message.trim(), "\n");
    if ((0, exports.isDebugToStdErr)()) {
        (0, process_js_1.writeToStderr)(output);
        return;
    }
    getDebugWriter().write(output);
}
function getDebugLogPath() {
    var _a, _b;
    return ((_b = (_a = (0, exports.getDebugFilePath)()) !== null && _a !== void 0 ? _a : process.env.CLAUDE_CODE_DEBUG_LOGS_DIR) !== null && _b !== void 0 ? _b : (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), 'debug', "".concat((0, state_js_1.getSessionId)(), ".txt")));
}
/**
 * Updates the latest debug log symlink to point to the current debug log file.
 * Creates or updates a symlink at ~/.claude/debug/latest
 */
var updateLatestDebugLogSymlink = (0, memoize_js_1.default)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var debugLogPath, debugLogsDir, latestSymlinkPath, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                debugLogPath = getDebugLogPath();
                debugLogsDir = (0, path_1.dirname)(debugLogPath);
                latestSymlinkPath = (0, path_1.join)(debugLogsDir, 'latest');
                return [4 /*yield*/, (0, promises_1.unlink)(latestSymlinkPath).catch(function () { })];
            case 1:
                _b.sent();
                return [4 /*yield*/, (0, promises_1.symlink)(debugLogPath, latestSymlinkPath)];
            case 2:
                _b.sent();
                return [3 /*break*/, 4];
            case 3:
                _a = _b.sent();
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * Logs errors for Ants only, always visible in production.
 */
function logAntError(context, error) {
    if (process.env.USER_TYPE !== 'ant') {
        return;
    }
    if (error instanceof Error && error.stack) {
        logForDebugging("[ANT-ONLY] ".concat(context, " stack trace:\n").concat(error.stack), {
            level: 'error',
        });
    }
}
