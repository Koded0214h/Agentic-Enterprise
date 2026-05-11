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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskOutput = void 0;
var promises_1 = require("fs/promises");
var CircularBuffer_js_1 = require("../CircularBuffer.js");
var debug_js_1 = require("../debug.js");
var fsOperations_js_1 = require("../fsOperations.js");
var outputLimits_js_1 = require("../shell/outputLimits.js");
var stringUtils_js_1 = require("../stringUtils.js");
var diskOutput_js_1 = require("./diskOutput.js");
var DEFAULT_MAX_MEMORY = 8 * 1024 * 1024; // 8MB
var POLL_INTERVAL_MS = 1000;
var PROGRESS_TAIL_BYTES = 4096;
/**
 * Single source of truth for a shell command's output.
 *
 * For bash commands (file mode): both stdout and stderr go directly to
 * a file via stdio fds — neither enters JS. Progress is extracted by
 * polling the file tail. getStderr() returns '' since stderr is
 * interleaved in the output file.
 *
 * For hooks (pipe mode): data flows through writeStdout()/writeStderr()
 * and is buffered in memory, spilling to disk if it exceeds the limit.
 */
var TaskOutput = /** @class */ (function () {
    function TaskOutput(taskId, onProgress, stdoutToFile, maxMemory) {
        if (stdoutToFile === void 0) { stdoutToFile = false; }
        if (maxMemory === void 0) { maxMemory = DEFAULT_MAX_MEMORY; }
        _TaskOutput_instances.add(this);
        _TaskOutput_stdoutBuffer.set(this, '');
        _TaskOutput_stderrBuffer.set(this, '');
        _TaskOutput_disk.set(this, null);
        _TaskOutput_recentLines.set(this, new CircularBuffer_js_1.CircularBuffer(1000));
        _TaskOutput_totalLines.set(this, 0);
        _TaskOutput_totalBytes.set(this, 0);
        _TaskOutput_maxMemory.set(this, void 0);
        _TaskOutput_onProgress.set(this, void 0);
        /** Set by getStdout() — true when the file was fully read (≤ maxOutputLength). */
        _TaskOutput_outputFileRedundant.set(this, false
        /** Set by getStdout() — total file size in bytes. */
        );
        /** Set by getStdout() — total file size in bytes. */
        _TaskOutput_outputFileSize.set(this, 0
        // --- Shared poller state ---
        /** Registry of all file-mode TaskOutput instances with onProgress callbacks. */
        );
        this.taskId = taskId;
        this.path = (0, diskOutput_js_1.getTaskOutputPath)(taskId);
        this.stdoutToFile = stdoutToFile;
        __classPrivateFieldSet(this, _TaskOutput_maxMemory, maxMemory, "f");
        __classPrivateFieldSet(this, _TaskOutput_onProgress, onProgress, "f");
        // Register for polling when stdout goes to a file and progress is needed.
        // Actual polling is started/stopped by React via startPolling/stopPolling.
        if (stdoutToFile && onProgress) {
            __classPrivateFieldGet(_a, _a, "f", _TaskOutput_registry).set(taskId, this);
        }
    }
    /**
     * Begin polling the output file for progress. Called from React
     * useEffect when the progress component mounts.
     */
    TaskOutput.startPolling = function (taskId) {
        var instance = __classPrivateFieldGet(_a, _a, "f", _TaskOutput_registry).get(taskId);
        if (!instance || !__classPrivateFieldGet(instance, _TaskOutput_onProgress, "f")) {
            return;
        }
        __classPrivateFieldGet(_a, _a, "f", _TaskOutput_activePolling).set(taskId, instance);
        if (!__classPrivateFieldGet(_a, _a, "f", _TaskOutput_pollInterval)) {
            __classPrivateFieldSet(_a, _a, setInterval(__classPrivateFieldGet(_a, _a, "m", _TaskOutput_tick), POLL_INTERVAL_MS), "f", _TaskOutput_pollInterval);
            __classPrivateFieldGet(_a, _a, "f", _TaskOutput_pollInterval).unref();
        }
    };
    /**
     * Stop polling the output file. Called from React useEffect cleanup
     * when the progress component unmounts.
     */
    TaskOutput.stopPolling = function (taskId) {
        __classPrivateFieldGet(_a, _a, "f", _TaskOutput_activePolling).delete(taskId);
        if (__classPrivateFieldGet(_a, _a, "f", _TaskOutput_activePolling).size === 0 && __classPrivateFieldGet(_a, _a, "f", _TaskOutput_pollInterval)) {
            clearInterval(__classPrivateFieldGet(_a, _a, "f", _TaskOutput_pollInterval));
            __classPrivateFieldSet(_a, _a, null, "f", _TaskOutput_pollInterval);
        }
    };
    /** Write stdout data (pipe mode only — used by hooks). */
    TaskOutput.prototype.writeStdout = function (data) {
        __classPrivateFieldGet(this, _TaskOutput_instances, "m", _TaskOutput_writeBuffered).call(this, data, false);
    };
    /** Write stderr data (always piped). */
    TaskOutput.prototype.writeStderr = function (data) {
        __classPrivateFieldGet(this, _TaskOutput_instances, "m", _TaskOutput_writeBuffered).call(this, data, true);
    };
    /**
     * Get stdout. In file mode, reads from the output file.
     * In pipe mode, returns the in-memory buffer or tail from CircularBuffer.
     */
    TaskOutput.prototype.getStdout = function () {
        return __awaiter(this, void 0, void 0, function () {
            var recent, tail, sizeKB, notice;
            return __generator(this, function (_b) {
                if (this.stdoutToFile) {
                    return [2 /*return*/, __classPrivateFieldGet(this, _TaskOutput_instances, "m", _TaskOutput_readStdoutFromFile).call(this)];
                }
                // Pipe mode (hooks) — use in-memory data
                if (__classPrivateFieldGet(this, _TaskOutput_disk, "f")) {
                    recent = __classPrivateFieldGet(this, _TaskOutput_recentLines, "f").getRecent(5);
                    tail = (0, stringUtils_js_1.safeJoinLines)(recent, '\n');
                    sizeKB = Math.round(__classPrivateFieldGet(this, _TaskOutput_totalBytes, "f") / 1024);
                    notice = "\nOutput truncated (".concat(sizeKB, "KB total). Full output saved to: ").concat(this.path);
                    return [2 /*return*/, tail ? tail + notice : notice.trimStart()];
                }
                return [2 /*return*/, __classPrivateFieldGet(this, _TaskOutput_stdoutBuffer, "f")];
            });
        });
    };
    /** Sync getter for ExecResult.stderr */
    TaskOutput.prototype.getStderr = function () {
        if (__classPrivateFieldGet(this, _TaskOutput_disk, "f")) {
            return '';
        }
        return __classPrivateFieldGet(this, _TaskOutput_stderrBuffer, "f");
    };
    Object.defineProperty(TaskOutput.prototype, "isOverflowed", {
        get: function () {
            return __classPrivateFieldGet(this, _TaskOutput_disk, "f") !== null;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TaskOutput.prototype, "totalLines", {
        get: function () {
            return __classPrivateFieldGet(this, _TaskOutput_totalLines, "f");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TaskOutput.prototype, "totalBytes", {
        get: function () {
            return __classPrivateFieldGet(this, _TaskOutput_totalBytes, "f");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TaskOutput.prototype, "outputFileRedundant", {
        /**
         * True after getStdout() when the output file was fully read.
         * The file content is redundant (fully in ExecResult.stdout) and can be deleted.
         */
        get: function () {
            return __classPrivateFieldGet(this, _TaskOutput_outputFileRedundant, "f");
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TaskOutput.prototype, "outputFileSize", {
        /** Total file size in bytes, set after getStdout() reads the file. */
        get: function () {
            return __classPrivateFieldGet(this, _TaskOutput_outputFileSize, "f");
        },
        enumerable: false,
        configurable: true
    });
    /** Force all buffered content to disk. Call when backgrounding. */
    TaskOutput.prototype.spillToDisk = function () {
        if (!__classPrivateFieldGet(this, _TaskOutput_disk, "f")) {
            __classPrivateFieldGet(this, _TaskOutput_instances, "m", _TaskOutput_spillToDisk).call(this, null, null);
        }
    };
    TaskOutput.prototype.flush = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, ((_b = __classPrivateFieldGet(this, _TaskOutput_disk, "f")) === null || _b === void 0 ? void 0 : _b.flush())];
                    case 1:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /** Delete the output file (fire-and-forget safe). */
    TaskOutput.prototype.deleteOutputFile = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, promises_1.unlink)(this.path)];
                    case 1:
                        _c.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        _b = _c.sent();
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    TaskOutput.prototype.clear = function () {
        var _b;
        __classPrivateFieldSet(this, _TaskOutput_stdoutBuffer, '', "f");
        __classPrivateFieldSet(this, _TaskOutput_stderrBuffer, '', "f");
        __classPrivateFieldGet(this, _TaskOutput_recentLines, "f").clear();
        __classPrivateFieldSet(this, _TaskOutput_onProgress, null, "f");
        (_b = __classPrivateFieldGet(this, _TaskOutput_disk, "f")) === null || _b === void 0 ? void 0 : _b.cancel();
        _a.stopPolling(this.taskId);
        __classPrivateFieldGet(_a, _a, "f", _TaskOutput_registry).delete(this.taskId);
    };
    var _TaskOutput_instances, _a, _TaskOutput_stdoutBuffer, _TaskOutput_stderrBuffer, _TaskOutput_disk, _TaskOutput_recentLines, _TaskOutput_totalLines, _TaskOutput_totalBytes, _TaskOutput_maxMemory, _TaskOutput_onProgress, _TaskOutput_outputFileRedundant, _TaskOutput_outputFileSize, _TaskOutput_registry, _TaskOutput_activePolling, _TaskOutput_pollInterval, _TaskOutput_tick, _TaskOutput_writeBuffered, _TaskOutput_updateProgress, _TaskOutput_spillToDisk, _TaskOutput_readStdoutFromFile;
    _a = TaskOutput, _TaskOutput_stdoutBuffer = new WeakMap(), _TaskOutput_stderrBuffer = new WeakMap(), _TaskOutput_disk = new WeakMap(), _TaskOutput_recentLines = new WeakMap(), _TaskOutput_totalLines = new WeakMap(), _TaskOutput_totalBytes = new WeakMap(), _TaskOutput_maxMemory = new WeakMap(), _TaskOutput_onProgress = new WeakMap(), _TaskOutput_outputFileRedundant = new WeakMap(), _TaskOutput_outputFileSize = new WeakMap(), _TaskOutput_instances = new WeakSet(), _TaskOutput_tick = function _TaskOutput_tick() {
        var _loop_1 = function (entry) {
            if (!__classPrivateFieldGet(entry, _TaskOutput_onProgress, "f")) {
                return "continue";
            }
            void (0, fsOperations_js_1.tailFile)(entry.path, PROGRESS_TAIL_BYTES).then(function (_b) {
                var content = _b.content, bytesRead = _b.bytesRead, bytesTotal = _b.bytesTotal;
                if (!__classPrivateFieldGet(entry, _TaskOutput_onProgress, "f")) {
                    return;
                }
                // Always call onProgress even when content is empty, so the
                // progress loop wakes up and can check for backgrounding.
                // Commands like `git log -S` produce no output for long periods.
                if (!content) {
                    __classPrivateFieldGet(entry, _TaskOutput_onProgress, "f").call(entry, '', '', __classPrivateFieldGet(entry, _TaskOutput_totalLines, "f"), bytesTotal, false);
                    return;
                }
                // Count all newlines in the tail and capture slice points for the
                // last 5 and last 100 lines. Uncapped so extrapolation stays accurate
                // for dense output (short lines → >100 newlines in 4KB).
                var pos = content.length;
                var n5 = 0;
                var n100 = 0;
                var lineCount = 0;
                while (pos > 0) {
                    pos = content.lastIndexOf('\n', pos - 1);
                    lineCount++;
                    if (lineCount === 5)
                        n5 = pos <= 0 ? 0 : pos + 1;
                    if (lineCount === 100)
                        n100 = pos <= 0 ? 0 : pos + 1;
                }
                // lineCount is exact when the whole file fits in PROGRESS_TAIL_BYTES.
                // Otherwise extrapolate from the tail sample; monotone max keeps the
                // counter from going backwards when the tail has longer lines on one tick.
                var totalLines = bytesRead >= bytesTotal
                    ? lineCount
                    : Math.max(__classPrivateFieldGet(entry, _TaskOutput_totalLines, "f"), Math.round((bytesTotal / bytesRead) * lineCount));
                __classPrivateFieldSet(entry, _TaskOutput_totalLines, totalLines, "f");
                __classPrivateFieldSet(entry, _TaskOutput_totalBytes, bytesTotal, "f");
                __classPrivateFieldGet(entry, _TaskOutput_onProgress, "f").call(entry, content.slice(n5), content.slice(n100), totalLines, bytesTotal, bytesRead < bytesTotal);
            }, function () {
                // File may not exist yet
            });
        };
        for (var _i = 0, _b = __classPrivateFieldGet(_a, _a, "f", _TaskOutput_activePolling); _i < _b.length; _i++) {
            var _c = _b[_i], entry = _c[1];
            _loop_1(entry);
        }
    }, _TaskOutput_writeBuffered = function _TaskOutput_writeBuffered(data, isStderr) {
        __classPrivateFieldSet(this, _TaskOutput_totalBytes, __classPrivateFieldGet(this, _TaskOutput_totalBytes, "f") + data.length, "f");
        __classPrivateFieldGet(this, _TaskOutput_instances, "m", _TaskOutput_updateProgress).call(this, data);
        // Write to disk if already overflowed
        if (__classPrivateFieldGet(this, _TaskOutput_disk, "f")) {
            __classPrivateFieldGet(this, _TaskOutput_disk, "f").append(isStderr ? "[stderr] ".concat(data) : data);
            return;
        }
        // Check if this chunk would exceed the in-memory limit
        var totalMem = __classPrivateFieldGet(this, _TaskOutput_stdoutBuffer, "f").length + __classPrivateFieldGet(this, _TaskOutput_stderrBuffer, "f").length + data.length;
        if (totalMem > __classPrivateFieldGet(this, _TaskOutput_maxMemory, "f")) {
            __classPrivateFieldGet(this, _TaskOutput_instances, "m", _TaskOutput_spillToDisk).call(this, isStderr ? data : null, isStderr ? null : data);
            return;
        }
        if (isStderr) {
            __classPrivateFieldSet(this, _TaskOutput_stderrBuffer, __classPrivateFieldGet(this, _TaskOutput_stderrBuffer, "f") + data, "f");
        }
        else {
            __classPrivateFieldSet(this, _TaskOutput_stdoutBuffer, __classPrivateFieldGet(this, _TaskOutput_stdoutBuffer, "f") + data, "f");
        }
    }, _TaskOutput_updateProgress = function _TaskOutput_updateProgress(data) {
        var MAX_PROGRESS_BYTES = 4096;
        var MAX_PROGRESS_LINES = 100;
        var lineCount = 0;
        var lines = [];
        var extractedBytes = 0;
        var pos = data.length;
        while (pos > 0) {
            var prev = data.lastIndexOf('\n', pos - 1);
            if (prev === -1) {
                break;
            }
            lineCount++;
            if (lines.length < MAX_PROGRESS_LINES &&
                extractedBytes < MAX_PROGRESS_BYTES) {
                var lineLen = pos - prev - 1;
                if (lineLen > 0 && lineLen <= MAX_PROGRESS_BYTES - extractedBytes) {
                    var line = data.slice(prev + 1, pos);
                    if (line.trim()) {
                        lines.push(Buffer.from(line).toString());
                        extractedBytes += lineLen;
                    }
                }
            }
            pos = prev;
        }
        __classPrivateFieldSet(this, _TaskOutput_totalLines, __classPrivateFieldGet(this, _TaskOutput_totalLines, "f") + lineCount, "f");
        for (var i = lines.length - 1; i >= 0; i--) {
            __classPrivateFieldGet(this, _TaskOutput_recentLines, "f").add(lines[i]);
        }
        if (__classPrivateFieldGet(this, _TaskOutput_onProgress, "f") && lines.length > 0) {
            var recent = __classPrivateFieldGet(this, _TaskOutput_recentLines, "f").getRecent(5);
            __classPrivateFieldGet(this, _TaskOutput_onProgress, "f").call(this, (0, stringUtils_js_1.safeJoinLines)(recent, '\n'), (0, stringUtils_js_1.safeJoinLines)(__classPrivateFieldGet(this, _TaskOutput_recentLines, "f").getRecent(100), '\n'), __classPrivateFieldGet(this, _TaskOutput_totalLines, "f"), __classPrivateFieldGet(this, _TaskOutput_totalBytes, "f"), __classPrivateFieldGet(this, _TaskOutput_disk, "f") !== null);
        }
    }, _TaskOutput_spillToDisk = function _TaskOutput_spillToDisk(stderrChunk, stdoutChunk) {
        __classPrivateFieldSet(this, _TaskOutput_disk, new diskOutput_js_1.DiskTaskOutput(this.taskId), "f");
        // Flush existing buffers
        if (__classPrivateFieldGet(this, _TaskOutput_stdoutBuffer, "f")) {
            __classPrivateFieldGet(this, _TaskOutput_disk, "f").append(__classPrivateFieldGet(this, _TaskOutput_stdoutBuffer, "f"));
            __classPrivateFieldSet(this, _TaskOutput_stdoutBuffer, '', "f");
        }
        if (__classPrivateFieldGet(this, _TaskOutput_stderrBuffer, "f")) {
            __classPrivateFieldGet(this, _TaskOutput_disk, "f").append("[stderr] ".concat(__classPrivateFieldGet(this, _TaskOutput_stderrBuffer, "f")));
            __classPrivateFieldSet(this, _TaskOutput_stderrBuffer, '', "f");
        }
        // Write the chunk that triggered overflow
        if (stdoutChunk) {
            __classPrivateFieldGet(this, _TaskOutput_disk, "f").append(stdoutChunk);
        }
        if (stderrChunk) {
            __classPrivateFieldGet(this, _TaskOutput_disk, "f").append("[stderr] ".concat(stderrChunk));
        }
    }, _TaskOutput_readStdoutFromFile = function _TaskOutput_readStdoutFromFile() {
        return __awaiter(this, void 0, void 0, function () {
            var maxBytes, result, content, bytesRead, bytesTotal, err_1, code;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        maxBytes = (0, outputLimits_js_1.getMaxOutputLength)();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, fsOperations_js_1.readFileRange)(this.path, 0, maxBytes)];
                    case 2:
                        result = _b.sent();
                        if (!result) {
                            __classPrivateFieldSet(this, _TaskOutput_outputFileRedundant, true, "f");
                            return [2 /*return*/, ''];
                        }
                        content = result.content, bytesRead = result.bytesRead, bytesTotal = result.bytesTotal;
                        // If the file fits, it's fully captured inline and can be deleted.
                        // If not, return what we read — processToolResultBlock handles
                        // the <persisted-output> formatting and persistence downstream.
                        __classPrivateFieldSet(this, _TaskOutput_outputFileSize, bytesTotal, "f");
                        __classPrivateFieldSet(this, _TaskOutput_outputFileRedundant, bytesTotal <= bytesRead, "f");
                        return [2 /*return*/, content];
                    case 3:
                        err_1 = _b.sent();
                        code = err_1 instanceof Error && 'code' in err_1 ? String(err_1.code) : 'unknown';
                        (0, debug_js_1.logForDebugging)("TaskOutput.#readStdoutFromFile: failed to read ".concat(this.path, " (").concat(code, "): ").concat(err_1));
                        return [2 /*return*/, "<bash output unavailable: output file ".concat(this.path, " could not be read (").concat(code, "). This usually means another Claude Code process in the same project deleted it during startup cleanup.>")];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // --- Shared poller state ---
    /** Registry of all file-mode TaskOutput instances with onProgress callbacks. */
    _TaskOutput_registry = { value: new Map() };
    /** Subset of #registry currently being polled (visibility-driven by React). */
    _TaskOutput_activePolling = { value: new Map() };
    _TaskOutput_pollInterval = { value: null };
    return TaskOutput;
}());
exports.TaskOutput = TaskOutput;
