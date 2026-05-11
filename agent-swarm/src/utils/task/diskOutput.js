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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _a;
var _DiskTaskOutput_instances, _DiskTaskOutput_path, _DiskTaskOutput_fileHandle, _DiskTaskOutput_queue, _DiskTaskOutput_bytesWritten, _DiskTaskOutput_capped, _DiskTaskOutput_flushPromise, _DiskTaskOutput_flushResolve, _DiskTaskOutput_drainAllChunks, _DiskTaskOutput_writeAllChunks, _DiskTaskOutput_queueToBuffers, _DiskTaskOutput_drain;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiskTaskOutput = exports.MAX_TASK_OUTPUT_BYTES_DISPLAY = exports.MAX_TASK_OUTPUT_BYTES = void 0;
exports.getTaskOutputDir = getTaskOutputDir;
exports._resetTaskOutputDirForTest = _resetTaskOutputDirForTest;
exports.getTaskOutputPath = getTaskOutputPath;
exports._clearOutputsForTest = _clearOutputsForTest;
exports.appendTaskOutput = appendTaskOutput;
exports.flushTaskOutput = flushTaskOutput;
exports.evictTaskOutput = evictTaskOutput;
exports.getTaskOutputDelta = getTaskOutputDelta;
exports.getTaskOutput = getTaskOutput;
exports.getTaskOutputSize = getTaskOutputSize;
exports.cleanupTaskOutput = cleanupTaskOutput;
exports.initTaskOutput = initTaskOutput;
exports.initTaskOutputAsSymlink = initTaskOutputAsSymlink;
var fs_1 = require("fs");
var promises_1 = require("fs/promises");
var path_1 = require("path");
var state_js_1 = require("../../bootstrap/state.js");
var errors_js_1 = require("../errors.js");
var fsOperations_js_1 = require("../fsOperations.js");
var log_js_1 = require("../log.js");
var filesystem_js_1 = require("../permissions/filesystem.js");
// SECURITY: O_NOFOLLOW prevents following symlinks when opening task output files.
// Without this, an attacker in the sandbox could create symlinks in the tasks directory
// pointing to arbitrary files, causing Claude Code on the host to write to those files.
// O_NOFOLLOW is not available on Windows, but the sandbox attack vector is Unix-only.
var O_NOFOLLOW = (_a = fs_1.constants.O_NOFOLLOW) !== null && _a !== void 0 ? _a : 0;
var DEFAULT_MAX_READ_BYTES = 8 * 1024 * 1024; // 8MB
/**
 * Disk cap for task output files. In file mode (bash), a watchdog polls
 * file size and kills the process. In pipe mode (hooks), DiskTaskOutput
 * drops chunks past this limit. Shared so both caps stay in sync.
 */
exports.MAX_TASK_OUTPUT_BYTES = 5 * 1024 * 1024 * 1024;
exports.MAX_TASK_OUTPUT_BYTES_DISPLAY = '5GB';
/**
 * Get the task output directory for this session.
 * Uses project temp directory so reads are auto-allowed by checkReadableInternalPath.
 *
 * The session ID is included so concurrent sessions in the same project don't
 * clobber each other's output files. Startup cleanup in one session previously
 * unlinked in-flight output files from other sessions — the writing process's fd
 * keeps the inode alive but reads via path fail ENOENT, and getStdout() returned
 * empty string (inc-4586 / boris-20260309-060423).
 *
 * The session ID is captured at FIRST CALL, not re-read on every invocation.
 * /clear calls regenerateSessionId(), which would otherwise cause
 * ensureOutputDir() to create a new-session path while existing TaskOutput
 * instances still hold old-session paths — open() would ENOENT. Background
 * bash tasks surviving /clear need their output files to stay reachable.
 */
var _taskOutputDir;
function getTaskOutputDir() {
    if (_taskOutputDir === undefined) {
        _taskOutputDir = (0, path_1.join)((0, filesystem_js_1.getProjectTempDir)(), (0, state_js_1.getSessionId)(), 'tasks');
    }
    return _taskOutputDir;
}
/** Test helper — clears the memoized dir. */
function _resetTaskOutputDirForTest() {
    _taskOutputDir = undefined;
}
/**
 * Ensure the task output directory exists
 */
function ensureOutputDir() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, promises_1.mkdir)(getTaskOutputDir(), { recursive: true })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Get the output file path for a task
 */
function getTaskOutputPath(taskId) {
    return (0, path_1.join)(getTaskOutputDir(), "".concat(taskId, ".output"));
}
// Tracks fire-and-forget promises (initTaskOutput, initTaskOutputAsSymlink,
// evictTaskOutput, #drain) so tests can drain before teardown. Prevents the
// async-ENOENT-after-teardown flake class (#24957, #25065): a voided async
// resumes after preload's afterEach nuked the temp dir → ENOENT → unhandled
// rejection → flaky test failure. allSettled so a rejection doesn't short-
// circuit the drain and leave other ops racing the rmSync.
var _pendingOps = new Set();
function track(p) {
    _pendingOps.add(p);
    void p.finally(function () { return _pendingOps.delete(p); }).catch(function () { });
    return p;
}
/**
 * Encapsulates async disk writes for a single task's output.
 *
 * Uses a flat array as a write queue processed by a single drain loop,
 * so each chunk can be GC'd immediately after its write completes.
 * This avoids the memory retention problem of chained .then() closures
 * where every reaction captures its data until the whole chain resolves.
 */
var DiskTaskOutput = /** @class */ (function () {
    function DiskTaskOutput(taskId) {
        _DiskTaskOutput_instances.add(this);
        _DiskTaskOutput_path.set(this, void 0);
        _DiskTaskOutput_fileHandle.set(this, null);
        _DiskTaskOutput_queue.set(this, []);
        _DiskTaskOutput_bytesWritten.set(this, 0);
        _DiskTaskOutput_capped.set(this, false);
        _DiskTaskOutput_flushPromise.set(this, null);
        _DiskTaskOutput_flushResolve.set(this, null);
        __classPrivateFieldSet(this, _DiskTaskOutput_path, getTaskOutputPath(taskId), "f");
    }
    DiskTaskOutput.prototype.append = function (content) {
        var _this = this;
        if (__classPrivateFieldGet(this, _DiskTaskOutput_capped, "f")) {
            return;
        }
        // content.length (UTF-16 code units) undercounts UTF-8 bytes by at most ~3×.
        // Acceptable for a coarse disk-fill guard — avoids re-scanning every chunk.
        __classPrivateFieldSet(this, _DiskTaskOutput_bytesWritten, __classPrivateFieldGet(this, _DiskTaskOutput_bytesWritten, "f") + content.length, "f");
        if (__classPrivateFieldGet(this, _DiskTaskOutput_bytesWritten, "f") > exports.MAX_TASK_OUTPUT_BYTES) {
            __classPrivateFieldSet(this, _DiskTaskOutput_capped, true, "f");
            __classPrivateFieldGet(this, _DiskTaskOutput_queue, "f").push("\n[output truncated: exceeded ".concat(exports.MAX_TASK_OUTPUT_BYTES_DISPLAY, " disk cap]\n"));
        }
        else {
            __classPrivateFieldGet(this, _DiskTaskOutput_queue, "f").push(content);
        }
        if (!__classPrivateFieldGet(this, _DiskTaskOutput_flushPromise, "f")) {
            __classPrivateFieldSet(this, _DiskTaskOutput_flushPromise, new Promise(function (resolve) {
                __classPrivateFieldSet(_this, _DiskTaskOutput_flushResolve, resolve, "f");
            }), "f");
            void track(__classPrivateFieldGet(this, _DiskTaskOutput_instances, "m", _DiskTaskOutput_drain).call(this));
        }
    };
    DiskTaskOutput.prototype.flush = function () {
        var _a;
        return (_a = __classPrivateFieldGet(this, _DiskTaskOutput_flushPromise, "f")) !== null && _a !== void 0 ? _a : Promise.resolve();
    };
    DiskTaskOutput.prototype.cancel = function () {
        __classPrivateFieldGet(this, _DiskTaskOutput_queue, "f").length = 0;
    };
    return DiskTaskOutput;
}());
exports.DiskTaskOutput = DiskTaskOutput;
_DiskTaskOutput_path = new WeakMap(), _DiskTaskOutput_fileHandle = new WeakMap(), _DiskTaskOutput_queue = new WeakMap(), _DiskTaskOutput_bytesWritten = new WeakMap(), _DiskTaskOutput_capped = new WeakMap(), _DiskTaskOutput_flushPromise = new WeakMap(), _DiskTaskOutput_flushResolve = new WeakMap(), _DiskTaskOutput_instances = new WeakSet(), _DiskTaskOutput_drainAllChunks = function _DiskTaskOutput_drainAllChunks() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, fileHandle;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!true) return [3 /*break*/, 11];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, , 7, 10]);
                    if (!!__classPrivateFieldGet(this, _DiskTaskOutput_fileHandle, "f")) return [3 /*break*/, 4];
                    return [4 /*yield*/, ensureOutputDir()];
                case 2:
                    _b.sent();
                    _a = [this, _DiskTaskOutput_fileHandle];
                    return [4 /*yield*/, (0, promises_1.open)(__classPrivateFieldGet(this, _DiskTaskOutput_path, "f"), process.platform === 'win32'
                            ? 'a'
                            : fs_1.constants.O_WRONLY |
                                fs_1.constants.O_APPEND |
                                fs_1.constants.O_CREAT |
                                O_NOFOLLOW)];
                case 3:
                    __classPrivateFieldSet.apply(void 0, _a.concat([_b.sent(), "f"]));
                    _b.label = 4;
                case 4:
                    if (!true) return [3 /*break*/, 6];
                    return [4 /*yield*/, __classPrivateFieldGet(this, _DiskTaskOutput_instances, "m", _DiskTaskOutput_writeAllChunks).call(this)];
                case 5:
                    _b.sent();
                    if (__classPrivateFieldGet(this, _DiskTaskOutput_queue, "f").length === 0) {
                        return [3 /*break*/, 6];
                    }
                    return [3 /*break*/, 4];
                case 6: return [3 /*break*/, 10];
                case 7:
                    if (!__classPrivateFieldGet(this, _DiskTaskOutput_fileHandle, "f")) return [3 /*break*/, 9];
                    fileHandle = __classPrivateFieldGet(this, _DiskTaskOutput_fileHandle, "f");
                    __classPrivateFieldSet(this, _DiskTaskOutput_fileHandle, null, "f");
                    return [4 /*yield*/, fileHandle.close()];
                case 8:
                    _b.sent();
                    _b.label = 9;
                case 9: return [7 /*endfinally*/];
                case 10:
                    // you could have another .append() while we're waiting for the file to close, so we check the queue again before fully exiting
                    if (__classPrivateFieldGet(this, _DiskTaskOutput_queue, "f").length) {
                        return [3 /*break*/, 0];
                    }
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
    });
}, _DiskTaskOutput_writeAllChunks = function _DiskTaskOutput_writeAllChunks() {
    // This code is extremely precise.
    // You **must not** add an await here!! That will cause memory to balloon as the queue grows.
    // It's okay to add an `await` to the caller of this method (e.g. #drainAllChunks) because that won't cause Buffer[] to be kept alive in memory.
    return __classPrivateFieldGet(this, _DiskTaskOutput_fileHandle, "f").appendFile(
    // This variable needs to get GC'd ASAP.
    __classPrivateFieldGet(this, _DiskTaskOutput_instances, "m", _DiskTaskOutput_queueToBuffers).call(this));
}, _DiskTaskOutput_queueToBuffers = function _DiskTaskOutput_queueToBuffers() {
    // Use .splice to in-place mutate the array, informing the GC it can free it.
    var queue = __classPrivateFieldGet(this, _DiskTaskOutput_queue, "f").splice(0, __classPrivateFieldGet(this, _DiskTaskOutput_queue, "f").length);
    var totalLength = 0;
    for (var _i = 0, queue_1 = queue; _i < queue_1.length; _i++) {
        var str = queue_1[_i];
        totalLength += Buffer.byteLength(str, 'utf8');
    }
    var buffer = Buffer.allocUnsafe(totalLength);
    var offset = 0;
    for (var _a = 0, queue_2 = queue; _a < queue_2.length; _a++) {
        var str = queue_2[_a];
        offset += buffer.write(str, offset, 'utf8');
    }
    return buffer;
}, _DiskTaskOutput_drain = function _DiskTaskOutput_drain() {
    return __awaiter(this, void 0, void 0, function () {
        var e_1, e2_1, resolve;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 7, 8]);
                    return [4 /*yield*/, __classPrivateFieldGet(this, _DiskTaskOutput_instances, "m", _DiskTaskOutput_drainAllChunks).call(this)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 8];
                case 2:
                    e_1 = _a.sent();
                    // Transient fs errors (EMFILE on busy CI, EPERM on Windows pending-
                    // delete) previously rode up through `void this.#drain()` as an
                    // unhandled rejection while the flush promise resolved anyway — callers
                    // saw an empty file with no error. Retry once for the transient case
                    // (queue is intact if open() failed), then log and give up.
                    (0, log_js_1.logError)(e_1);
                    if (!(__classPrivateFieldGet(this, _DiskTaskOutput_queue, "f").length > 0)) return [3 /*break*/, 6];
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, __classPrivateFieldGet(this, _DiskTaskOutput_instances, "m", _DiskTaskOutput_drainAllChunks).call(this)];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    e2_1 = _a.sent();
                    (0, log_js_1.logError)(e2_1);
                    return [3 /*break*/, 6];
                case 6: return [3 /*break*/, 8];
                case 7:
                    resolve = __classPrivateFieldGet(this, _DiskTaskOutput_flushResolve, "f");
                    __classPrivateFieldSet(this, _DiskTaskOutput_flushPromise, null, "f");
                    __classPrivateFieldSet(this, _DiskTaskOutput_flushResolve, null, "f");
                    resolve();
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    });
};
var outputs = new Map();
/**
 * Test helper — cancel pending writes, await in-flight ops, clear the map.
 * backgroundShells.test.ts and other task tests spawn real shells that
 * write through this module without afterEach cleanup; their entries
 * leak into diskOutput.test.ts on the same shard.
 *
 * Awaits all tracked promises until the set stabilizes — a settling promise
 * may spawn another (initTaskOutputAsSymlink's catch → initTaskOutput).
 * Call this in afterEach BEFORE rmSync to avoid async-ENOENT-after-teardown.
 */
function _clearOutputsForTest() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, _a, output;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    for (_i = 0, _a = outputs.values(); _i < _a.length; _i++) {
                        output = _a[_i];
                        output.cancel();
                    }
                    _b.label = 1;
                case 1:
                    if (!(_pendingOps.size > 0)) return [3 /*break*/, 3];
                    return [4 /*yield*/, Promise.allSettled(__spreadArray([], _pendingOps, true))];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 1];
                case 3:
                    outputs.clear();
                    return [2 /*return*/];
            }
        });
    });
}
function getOrCreateOutput(taskId) {
    var output = outputs.get(taskId);
    if (!output) {
        output = new DiskTaskOutput(taskId);
        outputs.set(taskId, output);
    }
    return output;
}
/**
 * Append output to a task's disk file asynchronously.
 * Creates the file if it doesn't exist.
 */
function appendTaskOutput(taskId, content) {
    getOrCreateOutput(taskId).append(content);
}
/**
 * Wait for all pending writes for a task to complete.
 * Useful before reading output to ensure all data is flushed.
 */
function flushTaskOutput(taskId) {
    return __awaiter(this, void 0, void 0, function () {
        var output;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    output = outputs.get(taskId);
                    if (!output) return [3 /*break*/, 2];
                    return [4 /*yield*/, output.flush()];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
/**
 * Evict a task's DiskTaskOutput from the in-memory map after flushing.
 * Unlike cleanupTaskOutput, this does not delete the output file on disk.
 * Call this when a task completes and its output has been consumed.
 */
function evictTaskOutput(taskId) {
    var _this = this;
    return track((function () { return __awaiter(_this, void 0, void 0, function () {
        var output;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    output = outputs.get(taskId);
                    if (!output) return [3 /*break*/, 2];
                    return [4 /*yield*/, output.flush()];
                case 1:
                    _a.sent();
                    outputs.delete(taskId);
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); })());
}
/**
 * Get delta (new content) since last read.
 * Reads only from the byte offset, up to maxBytes — never loads the full file.
 */
function getTaskOutputDelta(taskId_1, fromOffset_1) {
    return __awaiter(this, arguments, void 0, function (taskId, fromOffset, maxBytes) {
        var result, e_2, code;
        if (maxBytes === void 0) { maxBytes = DEFAULT_MAX_READ_BYTES; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, fsOperations_js_1.readFileRange)(getTaskOutputPath(taskId), fromOffset, maxBytes)];
                case 1:
                    result = _a.sent();
                    if (!result) {
                        return [2 /*return*/, { content: '', newOffset: fromOffset }];
                    }
                    return [2 /*return*/, {
                            content: result.content,
                            newOffset: fromOffset + result.bytesRead,
                        }];
                case 2:
                    e_2 = _a.sent();
                    code = (0, errors_js_1.getErrnoCode)(e_2);
                    if (code === 'ENOENT') {
                        return [2 /*return*/, { content: '', newOffset: fromOffset }];
                    }
                    (0, log_js_1.logError)(e_2);
                    return [2 /*return*/, { content: '', newOffset: fromOffset }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get output for a task, reading the tail of the file.
 * Caps at maxBytes to avoid loading multi-GB files into memory.
 */
function getTaskOutput(taskId_1) {
    return __awaiter(this, arguments, void 0, function (taskId, maxBytes) {
        var _a, content, bytesTotal, bytesRead, e_3, code;
        if (maxBytes === void 0) { maxBytes = DEFAULT_MAX_READ_BYTES; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, fsOperations_js_1.tailFile)(getTaskOutputPath(taskId), maxBytes)];
                case 1:
                    _a = _b.sent(), content = _a.content, bytesTotal = _a.bytesTotal, bytesRead = _a.bytesRead;
                    if (bytesTotal > bytesRead) {
                        return [2 /*return*/, "[".concat(Math.round((bytesTotal - bytesRead) / 1024), "KB of earlier output omitted]\n").concat(content)];
                    }
                    return [2 /*return*/, content];
                case 2:
                    e_3 = _b.sent();
                    code = (0, errors_js_1.getErrnoCode)(e_3);
                    if (code === 'ENOENT') {
                        return [2 /*return*/, ''];
                    }
                    (0, log_js_1.logError)(e_3);
                    return [2 /*return*/, ''];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get the current size (offset) of a task's output file.
 */
function getTaskOutputSize(taskId) {
    return __awaiter(this, void 0, void 0, function () {
        var e_4, code;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, promises_1.stat)(getTaskOutputPath(taskId))];
                case 1: return [2 /*return*/, (_a.sent()).size];
                case 2:
                    e_4 = _a.sent();
                    code = (0, errors_js_1.getErrnoCode)(e_4);
                    if (code === 'ENOENT') {
                        return [2 /*return*/, 0];
                    }
                    (0, log_js_1.logError)(e_4);
                    return [2 /*return*/, 0];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Clean up a task's output file and write queue.
 */
function cleanupTaskOutput(taskId) {
    return __awaiter(this, void 0, void 0, function () {
        var output, e_5, code;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    output = outputs.get(taskId);
                    if (output) {
                        output.cancel();
                        outputs.delete(taskId);
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.unlink)(getTaskOutputPath(taskId))];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_5 = _a.sent();
                    code = (0, errors_js_1.getErrnoCode)(e_5);
                    if (code === 'ENOENT') {
                        return [2 /*return*/];
                    }
                    (0, log_js_1.logError)(e_5);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Initialize output file for a new task.
 * Creates an empty file to ensure the path exists.
 */
function initTaskOutput(taskId) {
    var _this = this;
    return track((function () { return __awaiter(_this, void 0, void 0, function () {
        var outputPath, fh;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ensureOutputDir()];
                case 1:
                    _a.sent();
                    outputPath = getTaskOutputPath(taskId);
                    return [4 /*yield*/, (0, promises_1.open)(outputPath, process.platform === 'win32'
                            ? 'wx'
                            : fs_1.constants.O_WRONLY |
                                fs_1.constants.O_CREAT |
                                fs_1.constants.O_EXCL |
                                O_NOFOLLOW)];
                case 2:
                    fh = _a.sent();
                    return [4 /*yield*/, fh.close()];
                case 3:
                    _a.sent();
                    return [2 /*return*/, outputPath];
            }
        });
    }); })());
}
/**
 * Initialize output file as a symlink to another file (e.g., agent transcript).
 * Tries to create the symlink first; if a file already exists, removes it and retries.
 */
function initTaskOutputAsSymlink(taskId, targetPath) {
    var _this = this;
    return track((function () { return __awaiter(_this, void 0, void 0, function () {
        var outputPath, _a, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 8, , 9]);
                    return [4 /*yield*/, ensureOutputDir()];
                case 1:
                    _b.sent();
                    outputPath = getTaskOutputPath(taskId);
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 7]);
                    return [4 /*yield*/, (0, promises_1.symlink)(targetPath, outputPath)];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 7];
                case 4:
                    _a = _b.sent();
                    return [4 /*yield*/, (0, promises_1.unlink)(outputPath)];
                case 5:
                    _b.sent();
                    return [4 /*yield*/, (0, promises_1.symlink)(targetPath, outputPath)];
                case 6:
                    _b.sent();
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/, outputPath];
                case 8:
                    error_1 = _b.sent();
                    (0, log_js_1.logError)(error_1);
                    return [2 /*return*/, initTaskOutput(taskId)];
                case 9: return [2 /*return*/];
            }
        });
    }); })());
}
