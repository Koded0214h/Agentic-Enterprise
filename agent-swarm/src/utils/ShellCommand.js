"use strict";
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
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _StreamWrapper_instances, _StreamWrapper_stream, _StreamWrapper_isCleanedUp, _StreamWrapper_taskOutput, _StreamWrapper_isStderr, _StreamWrapper_onData, _StreamWrapper_dataHandler, _ShellCommandImpl_instances, _a, _ShellCommandImpl_status, _ShellCommandImpl_backgroundTaskId, _ShellCommandImpl_stdoutWrapper, _ShellCommandImpl_stderrWrapper, _ShellCommandImpl_childProcess, _ShellCommandImpl_timeoutId, _ShellCommandImpl_sizeWatchdog, _ShellCommandImpl_killedForSize, _ShellCommandImpl_maxOutputBytes, _ShellCommandImpl_abortSignal, _ShellCommandImpl_onTimeoutCallback, _ShellCommandImpl_timeout, _ShellCommandImpl_shouldAutoBackground, _ShellCommandImpl_resultResolver, _ShellCommandImpl_exitCodeResolver, _ShellCommandImpl_boundAbortHandler, _ShellCommandImpl_handleTimeout, _ShellCommandImpl_abortHandler, _ShellCommandImpl_exitHandler, _ShellCommandImpl_errorHandler, _ShellCommandImpl_resolveExitCode, _ShellCommandImpl_cleanupListeners, _ShellCommandImpl_clearSizeWatchdog, _ShellCommandImpl_startSizeWatchdog, _ShellCommandImpl_createResultPromise, _ShellCommandImpl_handleExit, _ShellCommandImpl_doKill;
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapSpawn = wrapSpawn;
exports.createAbortedCommand = createAbortedCommand;
exports.createFailedCommand = createFailedCommand;
var promises_1 = require("fs/promises");
var tree_kill_1 = require("tree-kill");
var Task_js_1 = require("../Task.js");
var format_js_1 = require("./format.js");
var diskOutput_js_1 = require("./task/diskOutput.js");
var TaskOutput_js_1 = require("./task/TaskOutput.js");
var SIGKILL = 137;
var SIGTERM = 143;
// Background tasks write stdout/stderr directly to a file fd (no JS involvement),
// so a stuck append loop can fill the disk. Poll file size and kill when exceeded.
var SIZE_WATCHDOG_INTERVAL_MS = 5000;
function prependStderr(prefix, stderr) {
    return stderr ? "".concat(prefix, " ").concat(stderr) : prefix;
}
/**
 * Thin pipe from a child process stream into TaskOutput.
 * Used in pipe mode (hooks) for stdout and stderr.
 * In file mode (bash commands), both fds go to the output file —
 * the child process streams are null and no wrappers are created.
 */
var StreamWrapper = /** @class */ (function () {
    function StreamWrapper(stream, taskOutput, isStderr) {
        _StreamWrapper_instances.add(this);
        _StreamWrapper_stream.set(this, void 0);
        _StreamWrapper_isCleanedUp.set(this, false);
        _StreamWrapper_taskOutput.set(this, void 0);
        _StreamWrapper_isStderr.set(this, void 0);
        _StreamWrapper_onData.set(this, __classPrivateFieldGet(this, _StreamWrapper_instances, "m", _StreamWrapper_dataHandler).bind(this));
        __classPrivateFieldSet(this, _StreamWrapper_stream, stream, "f");
        __classPrivateFieldSet(this, _StreamWrapper_taskOutput, taskOutput, "f");
        __classPrivateFieldSet(this, _StreamWrapper_isStderr, isStderr, "f");
        // Emit strings instead of Buffers - avoids repeated .toString() calls
        stream.setEncoding('utf-8');
        stream.on('data', __classPrivateFieldGet(this, _StreamWrapper_onData, "f"));
    }
    StreamWrapper.prototype.cleanup = function () {
        if (__classPrivateFieldGet(this, _StreamWrapper_isCleanedUp, "f")) {
            return;
        }
        __classPrivateFieldSet(this, _StreamWrapper_isCleanedUp, true, "f");
        __classPrivateFieldGet(this, _StreamWrapper_stream, "f").removeListener('data', __classPrivateFieldGet(this, _StreamWrapper_onData, "f"));
        // Release references so the stream, its StringDecoder, and
        // the TaskOutput can be GC'd independently of this wrapper.
        __classPrivateFieldSet(this, _StreamWrapper_stream, null, "f");
        __classPrivateFieldSet(this, _StreamWrapper_taskOutput, null, "f");
        __classPrivateFieldSet(this, _StreamWrapper_onData, function () { }, "f");
    };
    return StreamWrapper;
}());
_StreamWrapper_stream = new WeakMap(), _StreamWrapper_isCleanedUp = new WeakMap(), _StreamWrapper_taskOutput = new WeakMap(), _StreamWrapper_isStderr = new WeakMap(), _StreamWrapper_onData = new WeakMap(), _StreamWrapper_instances = new WeakSet(), _StreamWrapper_dataHandler = function _StreamWrapper_dataHandler(data) {
    var str = typeof data === 'string' ? data : data.toString();
    if (__classPrivateFieldGet(this, _StreamWrapper_isStderr, "f")) {
        __classPrivateFieldGet(this, _StreamWrapper_taskOutput, "f").writeStderr(str);
    }
    else {
        __classPrivateFieldGet(this, _StreamWrapper_taskOutput, "f").writeStdout(str);
    }
};
/**
 * Implementation of ShellCommand that wraps a child process.
 *
 * For bash commands: both stdout and stderr go to a file fd via
 * stdio[1] and stdio[2] — no JS involvement. Progress is extracted
 * by polling the file tail.
 * For hooks: pipe mode with StreamWrappers for real-time detection.
 */
var ShellCommandImpl = /** @class */ (function () {
    function ShellCommandImpl(childProcess, abortSignal, timeout, taskOutput, shouldAutoBackground, maxOutputBytes) {
        if (shouldAutoBackground === void 0) { shouldAutoBackground = false; }
        if (maxOutputBytes === void 0) { maxOutputBytes = diskOutput_js_1.MAX_TASK_OUTPUT_BYTES; }
        var _this = this;
        _ShellCommandImpl_instances.add(this);
        _ShellCommandImpl_status.set(this, 'running');
        _ShellCommandImpl_backgroundTaskId.set(this, void 0);
        _ShellCommandImpl_stdoutWrapper.set(this, void 0);
        _ShellCommandImpl_stderrWrapper.set(this, void 0);
        _ShellCommandImpl_childProcess.set(this, void 0);
        _ShellCommandImpl_timeoutId.set(this, null);
        _ShellCommandImpl_sizeWatchdog.set(this, null);
        _ShellCommandImpl_killedForSize.set(this, false);
        _ShellCommandImpl_maxOutputBytes.set(this, void 0);
        _ShellCommandImpl_abortSignal.set(this, void 0);
        _ShellCommandImpl_onTimeoutCallback.set(this, void 0);
        _ShellCommandImpl_timeout.set(this, void 0);
        _ShellCommandImpl_shouldAutoBackground.set(this, void 0);
        _ShellCommandImpl_resultResolver.set(this, null);
        _ShellCommandImpl_exitCodeResolver.set(this, null);
        _ShellCommandImpl_boundAbortHandler.set(this, null);
        __classPrivateFieldSet(this, _ShellCommandImpl_childProcess, childProcess, "f");
        __classPrivateFieldSet(this, _ShellCommandImpl_abortSignal, abortSignal, "f");
        __classPrivateFieldSet(this, _ShellCommandImpl_timeout, timeout, "f");
        __classPrivateFieldSet(this, _ShellCommandImpl_shouldAutoBackground, shouldAutoBackground, "f");
        __classPrivateFieldSet(this, _ShellCommandImpl_maxOutputBytes, maxOutputBytes, "f");
        this.taskOutput = taskOutput;
        // In file mode (bash commands), both stdout and stderr go to the
        // output file fd — childProcess.stdout/.stderr are both null.
        // In pipe mode (hooks), wrap streams to funnel data into TaskOutput.
        __classPrivateFieldSet(this, _ShellCommandImpl_stderrWrapper, childProcess.stderr
            ? new StreamWrapper(childProcess.stderr, taskOutput, true)
            : null, "f");
        __classPrivateFieldSet(this, _ShellCommandImpl_stdoutWrapper, childProcess.stdout
            ? new StreamWrapper(childProcess.stdout, taskOutput, false)
            : null, "f");
        if (shouldAutoBackground) {
            this.onTimeout = function (callback) {
                __classPrivateFieldSet(_this, _ShellCommandImpl_onTimeoutCallback, callback, "f");
            };
        }
        this.result = __classPrivateFieldGet(this, _ShellCommandImpl_instances, "m", _ShellCommandImpl_createResultPromise).call(this);
    }
    Object.defineProperty(ShellCommandImpl.prototype, "status", {
        get: function () {
            return __classPrivateFieldGet(this, _ShellCommandImpl_status, "f");
        },
        enumerable: false,
        configurable: true
    });
    ShellCommandImpl.prototype.kill = function () {
        __classPrivateFieldGet(this, _ShellCommandImpl_instances, "m", _ShellCommandImpl_doKill).call(this);
    };
    ShellCommandImpl.prototype.background = function (taskId) {
        if (__classPrivateFieldGet(this, _ShellCommandImpl_status, "f") === 'running') {
            __classPrivateFieldSet(this, _ShellCommandImpl_backgroundTaskId, taskId, "f");
            __classPrivateFieldSet(this, _ShellCommandImpl_status, 'backgrounded', "f");
            __classPrivateFieldGet(this, _ShellCommandImpl_instances, "m", _ShellCommandImpl_cleanupListeners).call(this);
            if (this.taskOutput.stdoutToFile) {
                // File mode: child writes directly to the fd with no JS involvement.
                // The foreground timeout is gone, so watch file size to prevent
                // a stuck append loop from filling the disk (768GB incident).
                __classPrivateFieldGet(this, _ShellCommandImpl_instances, "m", _ShellCommandImpl_startSizeWatchdog).call(this);
            }
            else {
                // Pipe mode: spill the in-memory buffer so readers can find it on disk.
                this.taskOutput.spillToDisk();
            }
            return true;
        }
        return false;
    };
    ShellCommandImpl.prototype.cleanup = function () {
        var _b, _c;
        (_b = __classPrivateFieldGet(this, _ShellCommandImpl_stdoutWrapper, "f")) === null || _b === void 0 ? void 0 : _b.cleanup();
        (_c = __classPrivateFieldGet(this, _ShellCommandImpl_stderrWrapper, "f")) === null || _c === void 0 ? void 0 : _c.cleanup();
        this.taskOutput.clear();
        // Must run before nulling #abortSignal — #cleanupListeners() calls
        // removeEventListener on it. Without this, a kill()+cleanup() sequence
        // crashes: kill() queues #handleExit as a microtask, cleanup() nulls
        // #abortSignal, then #handleExit runs #cleanupListeners() on the null ref.
        __classPrivateFieldGet(this, _ShellCommandImpl_instances, "m", _ShellCommandImpl_cleanupListeners).call(this);
        // Release references to allow GC of ChildProcess internals and AbortController chain
        __classPrivateFieldSet(this, _ShellCommandImpl_childProcess, null, "f");
        __classPrivateFieldSet(this, _ShellCommandImpl_abortSignal, null, "f");
        __classPrivateFieldSet(this, _ShellCommandImpl_onTimeoutCallback, undefined, "f");
    };
    return ShellCommandImpl;
}());
_a = ShellCommandImpl, _ShellCommandImpl_status = new WeakMap(), _ShellCommandImpl_backgroundTaskId = new WeakMap(), _ShellCommandImpl_stdoutWrapper = new WeakMap(), _ShellCommandImpl_stderrWrapper = new WeakMap(), _ShellCommandImpl_childProcess = new WeakMap(), _ShellCommandImpl_timeoutId = new WeakMap(), _ShellCommandImpl_sizeWatchdog = new WeakMap(), _ShellCommandImpl_killedForSize = new WeakMap(), _ShellCommandImpl_maxOutputBytes = new WeakMap(), _ShellCommandImpl_abortSignal = new WeakMap(), _ShellCommandImpl_onTimeoutCallback = new WeakMap(), _ShellCommandImpl_timeout = new WeakMap(), _ShellCommandImpl_shouldAutoBackground = new WeakMap(), _ShellCommandImpl_resultResolver = new WeakMap(), _ShellCommandImpl_exitCodeResolver = new WeakMap(), _ShellCommandImpl_boundAbortHandler = new WeakMap(), _ShellCommandImpl_instances = new WeakSet(), _ShellCommandImpl_handleTimeout = function _ShellCommandImpl_handleTimeout(self) {
    if (__classPrivateFieldGet(self, _ShellCommandImpl_shouldAutoBackground, "f") && __classPrivateFieldGet(self, _ShellCommandImpl_onTimeoutCallback, "f")) {
        __classPrivateFieldGet(self, _ShellCommandImpl_onTimeoutCallback, "f").call(self, self.background.bind(self));
    }
    else {
        __classPrivateFieldGet(self, _ShellCommandImpl_instances, "m", _ShellCommandImpl_doKill).call(self, SIGTERM);
    }
}, _ShellCommandImpl_abortHandler = function _ShellCommandImpl_abortHandler() {
    // On 'interrupt' (user submitted a new message), don't kill — let the
    // caller background the process so the model can see partial output.
    if (__classPrivateFieldGet(this, _ShellCommandImpl_abortSignal, "f").reason === 'interrupt') {
        return;
    }
    this.kill();
}, _ShellCommandImpl_exitHandler = function _ShellCommandImpl_exitHandler(code, signal) {
    var exitCode = code !== null && code !== undefined
        ? code
        : signal === 'SIGTERM'
            ? 144
            : 1;
    __classPrivateFieldGet(this, _ShellCommandImpl_instances, "m", _ShellCommandImpl_resolveExitCode).call(this, exitCode);
}, _ShellCommandImpl_errorHandler = function _ShellCommandImpl_errorHandler() {
    __classPrivateFieldGet(this, _ShellCommandImpl_instances, "m", _ShellCommandImpl_resolveExitCode).call(this, 1);
}, _ShellCommandImpl_resolveExitCode = function _ShellCommandImpl_resolveExitCode(code) {
    if (__classPrivateFieldGet(this, _ShellCommandImpl_exitCodeResolver, "f")) {
        __classPrivateFieldGet(this, _ShellCommandImpl_exitCodeResolver, "f").call(this, code);
        __classPrivateFieldSet(this, _ShellCommandImpl_exitCodeResolver, null, "f");
    }
}, _ShellCommandImpl_cleanupListeners = function _ShellCommandImpl_cleanupListeners() {
    __classPrivateFieldGet(this, _ShellCommandImpl_instances, "m", _ShellCommandImpl_clearSizeWatchdog).call(this);
    var timeoutId = __classPrivateFieldGet(this, _ShellCommandImpl_timeoutId, "f");
    if (timeoutId) {
        clearTimeout(timeoutId);
        __classPrivateFieldSet(this, _ShellCommandImpl_timeoutId, null, "f");
    }
    var boundAbortHandler = __classPrivateFieldGet(this, _ShellCommandImpl_boundAbortHandler, "f");
    if (boundAbortHandler) {
        __classPrivateFieldGet(this, _ShellCommandImpl_abortSignal, "f").removeEventListener('abort', boundAbortHandler);
        __classPrivateFieldSet(this, _ShellCommandImpl_boundAbortHandler, null, "f");
    }
}, _ShellCommandImpl_clearSizeWatchdog = function _ShellCommandImpl_clearSizeWatchdog() {
    if (__classPrivateFieldGet(this, _ShellCommandImpl_sizeWatchdog, "f")) {
        clearInterval(__classPrivateFieldGet(this, _ShellCommandImpl_sizeWatchdog, "f"));
        __classPrivateFieldSet(this, _ShellCommandImpl_sizeWatchdog, null, "f");
    }
}, _ShellCommandImpl_startSizeWatchdog = function _ShellCommandImpl_startSizeWatchdog() {
    var _this = this;
    __classPrivateFieldSet(this, _ShellCommandImpl_sizeWatchdog, setInterval(function () {
        void (0, promises_1.stat)(_this.taskOutput.path).then(function (s) {
            // Bail if the watchdog was cleared while this stat was in flight
            // (process exited on its own) — otherwise we'd mislabel stderr.
            if (s.size > __classPrivateFieldGet(_this, _ShellCommandImpl_maxOutputBytes, "f") &&
                __classPrivateFieldGet(_this, _ShellCommandImpl_status, "f") === 'backgrounded' &&
                __classPrivateFieldGet(_this, _ShellCommandImpl_sizeWatchdog, "f") !== null) {
                __classPrivateFieldSet(_this, _ShellCommandImpl_killedForSize, true, "f");
                __classPrivateFieldGet(_this, _ShellCommandImpl_instances, "m", _ShellCommandImpl_clearSizeWatchdog).call(_this);
                __classPrivateFieldGet(_this, _ShellCommandImpl_instances, "m", _ShellCommandImpl_doKill).call(_this, SIGKILL);
            }
        }, function () {
            // ENOENT before first write, or unlinked mid-run — skip this tick
        });
    }, SIZE_WATCHDOG_INTERVAL_MS), "f");
    __classPrivateFieldGet(this, _ShellCommandImpl_sizeWatchdog, "f").unref();
}, _ShellCommandImpl_createResultPromise = function _ShellCommandImpl_createResultPromise() {
    var _this = this;
    __classPrivateFieldSet(this, _ShellCommandImpl_boundAbortHandler, __classPrivateFieldGet(this, _ShellCommandImpl_instances, "m", _ShellCommandImpl_abortHandler).bind(this), "f");
    __classPrivateFieldGet(this, _ShellCommandImpl_abortSignal, "f").addEventListener('abort', __classPrivateFieldGet(this, _ShellCommandImpl_boundAbortHandler, "f"), {
        once: true,
    });
    // Use 'exit' not 'close': 'close' waits for stdio to close, which includes
    // grandchild processes that inherit file descriptors (e.g. `sleep 30 &`).
    // 'exit' fires when the shell itself exits, returning control immediately.
    __classPrivateFieldGet(this, _ShellCommandImpl_childProcess, "f").once('exit', __classPrivateFieldGet(this, _ShellCommandImpl_instances, "m", _ShellCommandImpl_exitHandler).bind(this));
    __classPrivateFieldGet(this, _ShellCommandImpl_childProcess, "f").once('error', __classPrivateFieldGet(this, _ShellCommandImpl_instances, "m", _ShellCommandImpl_errorHandler).bind(this));
    __classPrivateFieldSet(this, _ShellCommandImpl_timeoutId, setTimeout(__classPrivateFieldGet(_a, _a, "m", _ShellCommandImpl_handleTimeout), __classPrivateFieldGet(this, _ShellCommandImpl_timeout, "f"), this), "f");
    var exitPromise = new Promise(function (resolve) {
        __classPrivateFieldSet(_this, _ShellCommandImpl_exitCodeResolver, resolve, "f");
    });
    return new Promise(function (resolve) {
        __classPrivateFieldSet(_this, _ShellCommandImpl_resultResolver, resolve, "f");
        void exitPromise.then(__classPrivateFieldGet(_this, _ShellCommandImpl_instances, "m", _ShellCommandImpl_handleExit).bind(_this));
    });
}, _ShellCommandImpl_handleExit = function _ShellCommandImpl_handleExit(code) {
    return __awaiter(this, void 0, void 0, function () {
        var stdout, result, resultResolver;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    __classPrivateFieldGet(this, _ShellCommandImpl_instances, "m", _ShellCommandImpl_cleanupListeners).call(this);
                    if (__classPrivateFieldGet(this, _ShellCommandImpl_status, "f") === 'running' || __classPrivateFieldGet(this, _ShellCommandImpl_status, "f") === 'backgrounded') {
                        __classPrivateFieldSet(this, _ShellCommandImpl_status, 'completed', "f");
                    }
                    return [4 /*yield*/, this.taskOutput.getStdout()];
                case 1:
                    stdout = _b.sent();
                    result = {
                        code: code,
                        stdout: stdout,
                        stderr: this.taskOutput.getStderr(),
                        interrupted: code === SIGKILL,
                        backgroundTaskId: __classPrivateFieldGet(this, _ShellCommandImpl_backgroundTaskId, "f"),
                    };
                    if (this.taskOutput.stdoutToFile && !__classPrivateFieldGet(this, _ShellCommandImpl_backgroundTaskId, "f")) {
                        if (this.taskOutput.outputFileRedundant) {
                            // Small file — full content is in result.stdout, delete the file
                            void this.taskOutput.deleteOutputFile();
                        }
                        else {
                            // Large file — tell the caller where the full output lives
                            result.outputFilePath = this.taskOutput.path;
                            result.outputFileSize = this.taskOutput.outputFileSize;
                            result.outputTaskId = this.taskOutput.taskId;
                        }
                    }
                    if (__classPrivateFieldGet(this, _ShellCommandImpl_killedForSize, "f")) {
                        result.stderr = prependStderr("Background command killed: output file exceeded ".concat(diskOutput_js_1.MAX_TASK_OUTPUT_BYTES_DISPLAY), result.stderr);
                    }
                    else if (code === SIGTERM) {
                        result.stderr = prependStderr("Command timed out after ".concat((0, format_js_1.formatDuration)(__classPrivateFieldGet(this, _ShellCommandImpl_timeout, "f"))), result.stderr);
                    }
                    resultResolver = __classPrivateFieldGet(this, _ShellCommandImpl_resultResolver, "f");
                    if (resultResolver) {
                        __classPrivateFieldSet(this, _ShellCommandImpl_resultResolver, null, "f");
                        resultResolver(result);
                    }
                    return [2 /*return*/];
            }
        });
    });
}, _ShellCommandImpl_doKill = function _ShellCommandImpl_doKill(code) {
    __classPrivateFieldSet(this, _ShellCommandImpl_status, 'killed', "f");
    if (__classPrivateFieldGet(this, _ShellCommandImpl_childProcess, "f").pid) {
        (0, tree_kill_1.default)(__classPrivateFieldGet(this, _ShellCommandImpl_childProcess, "f").pid, 'SIGKILL');
    }
    __classPrivateFieldGet(this, _ShellCommandImpl_instances, "m", _ShellCommandImpl_resolveExitCode).call(this, code !== null && code !== void 0 ? code : SIGKILL);
};
/**
 * Wraps a child process to enable flexible handling of shell command execution.
 */
function wrapSpawn(childProcess, abortSignal, timeout, taskOutput, shouldAutoBackground, maxOutputBytes) {
    if (shouldAutoBackground === void 0) { shouldAutoBackground = false; }
    if (maxOutputBytes === void 0) { maxOutputBytes = diskOutput_js_1.MAX_TASK_OUTPUT_BYTES; }
    return new ShellCommandImpl(childProcess, abortSignal, timeout, taskOutput, shouldAutoBackground, maxOutputBytes);
}
/**
 * Static ShellCommand implementation for commands that were aborted before execution.
 */
var AbortedShellCommand = /** @class */ (function () {
    function AbortedShellCommand(opts) {
        var _b, _c;
        this.status = 'killed';
        this.taskOutput = new TaskOutput_js_1.TaskOutput((0, Task_js_1.generateTaskId)('local_bash'), null);
        this.result = Promise.resolve({
            code: (_b = opts === null || opts === void 0 ? void 0 : opts.code) !== null && _b !== void 0 ? _b : 145,
            stdout: '',
            stderr: (_c = opts === null || opts === void 0 ? void 0 : opts.stderr) !== null && _c !== void 0 ? _c : 'Command aborted before execution',
            interrupted: true,
            backgroundTaskId: opts === null || opts === void 0 ? void 0 : opts.backgroundTaskId,
        });
    }
    AbortedShellCommand.prototype.background = function () {
        return false;
    };
    AbortedShellCommand.prototype.kill = function () { };
    AbortedShellCommand.prototype.cleanup = function () { };
    return AbortedShellCommand;
}());
function createAbortedCommand(backgroundTaskId, opts) {
    return new AbortedShellCommand(__assign({ backgroundTaskId: backgroundTaskId }, opts));
}
function createFailedCommand(preSpawnError) {
    var taskOutput = new TaskOutput_js_1.TaskOutput((0, Task_js_1.generateTaskId)('local_bash'), null);
    return {
        status: 'completed',
        result: Promise.resolve({
            code: 1,
            stdout: '',
            stderr: preSpawnError,
            interrupted: false,
            preSpawnError: preSpawnError,
        }),
        taskOutput: taskOutput,
        background: function () {
            return false;
        },
        kill: function () { },
        cleanup: function () { },
    };
}
