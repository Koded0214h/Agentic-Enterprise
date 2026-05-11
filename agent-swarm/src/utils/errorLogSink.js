"use strict";
/**
 * Error log sink implementation
 *
 * This module contains the heavy implementation for error logging and should be
 * initialized during app startup. It handles file-based error logging to disk.
 *
 * Usage: Call initializeErrorLogSink() during app startup to attach the sink.
 *
 * DESIGN: This module is separate from log.ts to avoid import cycles.
 * log.ts has NO heavy dependencies - events are queued until this sink is attached.
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
exports.getErrorsPath = getErrorsPath;
exports.getMCPLogsPath = getMCPLogsPath;
exports._flushLogWritersForTesting = _flushLogWritersForTesting;
exports._clearLogWritersForTesting = _clearLogWritersForTesting;
exports.initializeErrorLogSink = initializeErrorLogSink;
var axios_1 = require("axios");
var path_1 = require("path");
var state_js_1 = require("../bootstrap/state.js");
var bufferedWriter_js_1 = require("./bufferedWriter.js");
var cachePaths_js_1 = require("./cachePaths.js");
var cleanupRegistry_js_1 = require("./cleanupRegistry.js");
var debug_js_1 = require("./debug.js");
var fsOperations_js_1 = require("./fsOperations.js");
var log_js_1 = require("./log.js");
var slowOperations_js_1 = require("./slowOperations.js");
var DATE = (0, log_js_1.dateToFilename)(new Date());
/**
 * Gets the path to the errors log file.
 */
function getErrorsPath() {
    return (0, path_1.join)(cachePaths_js_1.CACHE_PATHS.errors(), DATE + '.jsonl');
}
/**
 * Gets the path to MCP logs for a server.
 */
function getMCPLogsPath(serverName) {
    return (0, path_1.join)(cachePaths_js_1.CACHE_PATHS.mcpLogs(serverName), DATE + '.jsonl');
}
function createJsonlWriter(options) {
    var writer = (0, bufferedWriter_js_1.createBufferedWriter)(options);
    return {
        write: function (obj) {
            writer.write((0, slowOperations_js_1.jsonStringify)(obj) + '\n');
        },
        flush: writer.flush,
        dispose: writer.dispose,
    };
}
// Buffered writers for JSONL log files, keyed by path
var logWriters = new Map();
/**
 * Flush all buffered log writers. Used for testing.
 * @internal
 */
function _flushLogWritersForTesting() {
    for (var _i = 0, _a = logWriters.values(); _i < _a.length; _i++) {
        var writer = _a[_i];
        writer.flush();
    }
}
/**
 * Clear all buffered log writers. Used for testing.
 * @internal
 */
function _clearLogWritersForTesting() {
    for (var _i = 0, _a = logWriters.values(); _i < _a.length; _i++) {
        var writer = _a[_i];
        writer.dispose();
    }
    logWriters.clear();
}
function getLogWriter(path) {
    var _this = this;
    var writer = logWriters.get(path);
    if (!writer) {
        var dir_1 = (0, path_1.dirname)(path);
        writer = createJsonlWriter({
            // sync IO: called from sync context
            writeFn: function (content) {
                try {
                    // Happy-path: directory already exists
                    (0, fsOperations_js_1.getFsImplementation)().appendFileSync(path, content);
                }
                catch (_a) {
                    // If any error occurs, assume it was due to missing directory
                    (0, fsOperations_js_1.getFsImplementation)().mkdirSync(dir_1);
                    // Retry appending
                    (0, fsOperations_js_1.getFsImplementation)().appendFileSync(path, content);
                }
            },
            flushIntervalMs: 1000,
            maxBufferSize: 50,
        });
        logWriters.set(path, writer);
        (0, cleanupRegistry_js_1.registerCleanup)(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, writer === null || writer === void 0 ? void 0 : writer.dispose()];
        }); }); });
    }
    return writer;
}
function appendToLog(path, message) {
    if (process.env.USER_TYPE !== 'ant') {
        return;
    }
    var messageWithTimestamp = __assign(__assign({ timestamp: new Date().toISOString() }, message), { cwd: (0, fsOperations_js_1.getFsImplementation)().cwd(), userType: process.env.USER_TYPE, sessionId: (0, state_js_1.getSessionId)(), version: MACRO.VERSION });
    getLogWriter(path).write(messageWithTimestamp);
}
function extractServerMessage(data) {
    if (typeof data === 'string') {
        return data;
    }
    if (data && typeof data === 'object') {
        var obj = data;
        if (typeof obj.message === 'string') {
            return obj.message;
        }
        if (typeof obj.error === 'object' &&
            obj.error &&
            'message' in obj.error &&
            typeof obj.error.message === 'string') {
            return obj.error.message;
        }
    }
    return undefined;
}
/**
 * Implementation for logError - writes error to debug log and file.
 */
function logErrorImpl(error) {
    var _a, _b, _c;
    var errorStr = error.stack || error.message;
    // Enrich axios errors with request URL, status, and server message for debugging
    var context = '';
    if (axios_1.default.isAxiosError(error) && ((_a = error.config) === null || _a === void 0 ? void 0 : _a.url)) {
        var parts = ["url=".concat(error.config.url)];
        if (((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) !== undefined) {
            parts.push("status=".concat(error.response.status));
        }
        var serverMessage = extractServerMessage((_c = error.response) === null || _c === void 0 ? void 0 : _c.data);
        if (serverMessage) {
            parts.push("body=".concat(serverMessage));
        }
        context = "[".concat(parts.join(','), "] ");
    }
    (0, debug_js_1.logForDebugging)("".concat(error.name, ": ").concat(context).concat(errorStr), { level: 'error' });
    appendToLog(getErrorsPath(), {
        error: "".concat(context).concat(errorStr),
    });
}
/**
 * Implementation for logMCPError - writes MCP error to debug log and file.
 */
function logMCPErrorImpl(serverName, error) {
    // Not themed, to avoid having to pipe theme all the way down
    (0, debug_js_1.logForDebugging)("MCP server \"".concat(serverName, "\" ").concat(error), { level: 'error' });
    var logFile = getMCPLogsPath(serverName);
    var errorStr = error instanceof Error ? error.stack || error.message : String(error);
    var errorInfo = {
        error: errorStr,
        timestamp: new Date().toISOString(),
        sessionId: (0, state_js_1.getSessionId)(),
        cwd: (0, fsOperations_js_1.getFsImplementation)().cwd(),
    };
    getLogWriter(logFile).write(errorInfo);
}
/**
 * Implementation for logMCPDebug - writes MCP debug message to log file.
 */
function logMCPDebugImpl(serverName, message) {
    (0, debug_js_1.logForDebugging)("MCP server \"".concat(serverName, "\": ").concat(message));
    var logFile = getMCPLogsPath(serverName);
    var debugInfo = {
        debug: message,
        timestamp: new Date().toISOString(),
        sessionId: (0, state_js_1.getSessionId)(),
        cwd: (0, fsOperations_js_1.getFsImplementation)().cwd(),
    };
    getLogWriter(logFile).write(debugInfo);
}
/**
 * Initialize the error log sink.
 *
 * Call this during app startup to attach the error logging backend.
 * Any errors logged before this is called will be queued and drained.
 *
 * Should be called BEFORE initializeAnalyticsSink() in the startup sequence.
 *
 * Idempotent: safe to call multiple times (subsequent calls are no-ops).
 */
function initializeErrorLogSink() {
    (0, log_js_1.attachErrorLogSink)({
        logError: logErrorImpl,
        logMCPError: logMCPErrorImpl,
        logMCPDebug: logMCPDebugImpl,
        getErrorsPath: getErrorsPath,
        getMCPLogsPath: getMCPLogsPath,
    });
    (0, debug_js_1.logForDebugging)('Error log sink initialized');
}
