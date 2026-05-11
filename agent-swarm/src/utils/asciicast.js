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
exports.getRecordFilePath = getRecordFilePath;
exports._resetRecordingStateForTesting = _resetRecordingStateForTesting;
exports.getSessionRecordingPaths = getSessionRecordingPaths;
exports.renameRecordingForSession = renameRecordingForSession;
exports.flushAsciicastRecorder = flushAsciicastRecorder;
exports.installAsciicastRecorder = installAsciicastRecorder;
var promises_1 = require("fs/promises");
var path_1 = require("path");
var state_js_1 = require("../bootstrap/state.js");
var bufferedWriter_js_1 = require("./bufferedWriter.js");
var cleanupRegistry_js_1 = require("./cleanupRegistry.js");
var debug_js_1 = require("./debug.js");
var envUtils_js_1 = require("./envUtils.js");
var fsOperations_js_1 = require("./fsOperations.js");
var path_js_1 = require("./path.js");
var slowOperations_js_1 = require("./slowOperations.js");
// Mutable recording state — filePath is updated when session ID changes (e.g., --resume)
var recordingState = {
    filePath: null,
    timestamp: 0,
};
/**
 * Get the asciicast recording file path.
 * For ants with CLAUDE_CODE_TERMINAL_RECORDING=1: returns a path.
 * Otherwise: returns null.
 * The path is computed once and cached in recordingState.
 */
function getRecordFilePath() {
    if (recordingState.filePath !== null) {
        return recordingState.filePath;
    }
    if (process.env.USER_TYPE !== 'ant') {
        return null;
    }
    if (!(0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_TERMINAL_RECORDING)) {
        return null;
    }
    // Record alongside the transcript.
    // Each launch gets its own file so --continue produces multiple recordings.
    var projectsDir = (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), 'projects');
    var projectDir = (0, path_1.join)(projectsDir, (0, path_js_1.sanitizePath)((0, state_js_1.getOriginalCwd)()));
    recordingState.timestamp = Date.now();
    recordingState.filePath = (0, path_1.join)(projectDir, "".concat((0, state_js_1.getSessionId)(), "-").concat(recordingState.timestamp, ".cast"));
    return recordingState.filePath;
}
function _resetRecordingStateForTesting() {
    recordingState.filePath = null;
    recordingState.timestamp = 0;
}
/**
 * Find all .cast files for the current session.
 * Returns paths sorted by filename (chronological by timestamp suffix).
 */
function getSessionRecordingPaths() {
    var sessionId = (0, state_js_1.getSessionId)();
    var projectsDir = (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), 'projects');
    var projectDir = (0, path_1.join)(projectsDir, (0, path_js_1.sanitizePath)((0, state_js_1.getOriginalCwd)()));
    try {
        // eslint-disable-next-line custom-rules/no-sync-fs -- called during /share before upload, not in hot path
        var entries = (0, fsOperations_js_1.getFsImplementation)().readdirSync(projectDir);
        var names = (typeof entries[0] === 'string'
            ? entries
            : entries.map(function (e) { return e.name; }));
        var files = names
            .filter(function (f) { return f.startsWith(sessionId) && f.endsWith('.cast'); })
            .sort();
        return files.map(function (f) { return (0, path_1.join)(projectDir, f); });
    }
    catch (_a) {
        return [];
    }
}
/**
 * Rename the recording file to match the current session ID.
 * Called after --resume/--continue changes the session ID via switchSession().
 * The recorder was installed with the initial (random) session ID; this renames
 * the file so getSessionRecordingPaths() can find it by the resumed session ID.
 */
function renameRecordingForSession() {
    return __awaiter(this, void 0, void 0, function () {
        var oldPath, projectsDir, projectDir, newPath, oldName, newName, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    oldPath = recordingState.filePath;
                    if (!oldPath || recordingState.timestamp === 0) {
                        return [2 /*return*/];
                    }
                    projectsDir = (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), 'projects');
                    projectDir = (0, path_1.join)(projectsDir, (0, path_js_1.sanitizePath)((0, state_js_1.getOriginalCwd)()));
                    newPath = (0, path_1.join)(projectDir, "".concat((0, state_js_1.getSessionId)(), "-").concat(recordingState.timestamp, ".cast"));
                    if (oldPath === newPath) {
                        return [2 /*return*/];
                    }
                    // Flush pending writes before renaming
                    return [4 /*yield*/, (recorder === null || recorder === void 0 ? void 0 : recorder.flush())];
                case 1:
                    // Flush pending writes before renaming
                    _b.sent();
                    oldName = (0, path_1.basename)(oldPath);
                    newName = (0, path_1.basename)(newPath);
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, promises_1.rename)(oldPath, newPath)];
                case 3:
                    _b.sent();
                    recordingState.filePath = newPath;
                    (0, debug_js_1.logForDebugging)("[asciicast] Renamed recording: ".concat(oldName, " \u2192 ").concat(newName));
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    (0, debug_js_1.logForDebugging)("[asciicast] Failed to rename recording from ".concat(oldName, " to ").concat(newName));
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
var recorder = null;
function getTerminalSize() {
    // Direct access to stdout dimensions — not in a React component
    // eslint-disable-next-line custom-rules/prefer-use-terminal-size
    var cols = process.stdout.columns || 80;
    // eslint-disable-next-line custom-rules/prefer-use-terminal-size
    var rows = process.stdout.rows || 24;
    return { cols: cols, rows: rows };
}
/**
 * Flush pending recording data to disk.
 * Call before reading the .cast file (e.g., during /share).
 */
function flushAsciicastRecorder() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (recorder === null || recorder === void 0 ? void 0 : recorder.flush())];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Install the asciicast recorder.
 * Wraps process.stdout.write to capture all terminal output with timestamps.
 * Must be called before Ink mounts.
 */
function installAsciicastRecorder() {
    var _this = this;
    var filePath = getRecordFilePath();
    if (!filePath) {
        return;
    }
    var _a = getTerminalSize(), cols = _a.cols, rows = _a.rows;
    var startTime = performance.now();
    // Write the asciicast v2 header
    var header = (0, slowOperations_js_1.jsonStringify)({
        version: 2,
        width: cols,
        height: rows,
        timestamp: Math.floor(Date.now() / 1000),
        env: {
            SHELL: process.env.SHELL || '',
            TERM: process.env.TERM || '',
        },
    });
    try {
        // eslint-disable-next-line custom-rules/no-sync-fs -- one-time init before Ink mounts
        (0, fsOperations_js_1.getFsImplementation)().mkdirSync((0, path_1.dirname)(filePath));
    }
    catch (_b) {
        // Directory may already exist
    }
    // eslint-disable-next-line custom-rules/no-sync-fs -- one-time init before Ink mounts
    (0, fsOperations_js_1.getFsImplementation)().appendFileSync(filePath, header + '\n', { mode: 384 });
    var pendingWrite = Promise.resolve();
    var writer = (0, bufferedWriter_js_1.createBufferedWriter)({
        writeFn: function (content) {
            // Use recordingState.filePath (mutable) so writes follow renames from --resume
            var currentPath = recordingState.filePath;
            if (!currentPath) {
                return;
            }
            pendingWrite = pendingWrite
                .then(function () { return (0, promises_1.appendFile)(currentPath, content); })
                .catch(function () {
                // Silently ignore write errors — don't break the session
            });
        },
        flushIntervalMs: 500,
        maxBufferSize: 50,
        maxBufferBytes: 10 * 1024 * 1024, // 10MB
    });
    // Wrap process.stdout.write to capture output
    var originalWrite = process.stdout.write.bind(process.stdout);
    process.stdout.write = function (chunk, encodingOrCb, cb) {
        // Record the output event
        var elapsed = (performance.now() - startTime) / 1000;
        var text = typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString('utf-8');
        writer.write((0, slowOperations_js_1.jsonStringify)([elapsed, 'o', text]) + '\n');
        // Pass through to the real stdout
        if (typeof encodingOrCb === 'function') {
            return originalWrite(chunk, encodingOrCb);
        }
        return originalWrite(chunk, encodingOrCb, cb);
    };
    // Handle terminal resize events
    function onResize() {
        var elapsed = (performance.now() - startTime) / 1000;
        var _a = getTerminalSize(), newCols = _a.cols, newRows = _a.rows;
        writer.write((0, slowOperations_js_1.jsonStringify)([elapsed, 'r', "".concat(newCols, "x").concat(newRows)]) + '\n');
    }
    process.stdout.on('resize', onResize);
    recorder = {
        flush: function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            writer.flush();
                            return [4 /*yield*/, pendingWrite];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        },
        dispose: function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            writer.dispose();
                            return [4 /*yield*/, pendingWrite];
                        case 1:
                            _a.sent();
                            process.stdout.removeListener('resize', onResize);
                            process.stdout.write = originalWrite;
                            return [2 /*return*/];
                    }
                });
            });
        },
    };
    (0, cleanupRegistry_js_1.registerCleanup)(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (recorder === null || recorder === void 0 ? void 0 : recorder.dispose())];
                case 1:
                    _a.sent();
                    recorder = null;
                    return [2 /*return*/];
            }
        });
    }); });
    (0, debug_js_1.logForDebugging)("[asciicast] Recording to ".concat(filePath));
}
