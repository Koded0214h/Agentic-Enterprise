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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
exports.getLogDisplayTitle = getLogDisplayTitle;
exports.dateToFilename = dateToFilename;
exports.attachErrorLogSink = attachErrorLogSink;
exports.logError = logError;
exports.getInMemoryErrors = getInMemoryErrors;
exports.loadErrorLogs = loadErrorLogs;
exports.getErrorLogByIndex = getErrorLogByIndex;
exports.logMCPError = logMCPError;
exports.logMCPDebug = logMCPDebug;
exports.captureAPIRequest = captureAPIRequest;
exports._resetErrorLogForTesting = _resetErrorLogForTesting;
var bun_bundle_1 = require("bun:bundle");
var promises_1 = require("fs/promises");
var memoize_js_1 = require("lodash-es/memoize.js");
var path_1 = require("path");
var state_js_1 = require("../bootstrap/state.js");
var xml_js_1 = require("../constants/xml.js");
var logs_js_1 = require("../types/logs.js");
var cachePaths_js_1 = require("./cachePaths.js");
var displayTags_js_1 = require("./displayTags.js");
var envUtils_js_1 = require("./envUtils.js");
var errors_js_1 = require("./errors.js");
var privacyLevel_js_1 = require("./privacyLevel.js");
var slowOperations_js_1 = require("./slowOperations.js");
/**
 * Gets the display title for a log/session with fallback logic.
 * Skips firstPrompt if it starts with a tick/goal tag (autonomous mode auto-prompt).
 * Strips display-unfriendly tags (like <ide_opened_file>) from the result.
 * Falls back to a truncated session ID when no other title is available.
 */
function getLogDisplayTitle(log, defaultTitle) {
    var _a;
    // Skip firstPrompt if it's a tick/goal message (autonomous mode auto-prompt)
    var isAutonomousPrompt = (_a = log.firstPrompt) === null || _a === void 0 ? void 0 : _a.startsWith("<".concat(xml_js_1.TICK_TAG, ">"));
    // Strip display-unfriendly tags (command-name, ide_opened_file, etc.) early
    // so that command-only prompts (e.g. /clear) become empty and fall through
    // to the next fallback instead of showing raw XML tags.
    // Note: stripDisplayTags returns the original when stripping yields empty,
    // so we call stripDisplayTagsAllowEmpty to detect command-only prompts.
    var strippedFirstPrompt = log.firstPrompt
        ? (0, displayTags_js_1.stripDisplayTagsAllowEmpty)(log.firstPrompt)
        : '';
    var useFirstPrompt = strippedFirstPrompt && !isAutonomousPrompt;
    var title = log.agentName ||
        log.customTitle ||
        log.summary ||
        (useFirstPrompt ? strippedFirstPrompt : undefined) ||
        defaultTitle ||
        // For autonomous sessions without other context, show a meaningful label
        (isAutonomousPrompt ? 'Autonomous session' : undefined) ||
        // Fall back to truncated session ID for lite logs with no metadata
        (log.sessionId ? log.sessionId.slice(0, 8) : '') ||
        '';
    // Strip display-unfriendly tags (like <ide_opened_file>) for cleaner titles
    return (0, displayTags_js_1.stripDisplayTags)(title).trim();
}
function dateToFilename(date) {
    return date.toISOString().replace(/[:.]/g, '-');
}
// In-memory error log for recent errors
// Moved from bootstrap/state.ts to break import cycle
var MAX_IN_MEMORY_ERRORS = 100;
var inMemoryErrorLog = [];
function addToInMemoryErrorLog(errorInfo) {
    if (inMemoryErrorLog.length >= MAX_IN_MEMORY_ERRORS) {
        inMemoryErrorLog.shift(); // Remove oldest error
    }
    inMemoryErrorLog.push(errorInfo);
}
var errorQueue = [];
// Sink - initialized during app startup
var errorLogSink = null;
/**
 * Attach the error log sink that will receive all error events.
 * Queued events are drained immediately to ensure no errors are lost.
 *
 * Idempotent: if a sink is already attached, this is a no-op. This allows
 * calling from both the preAction hook (for subcommands) and setup() (for
 * the default command) without coordination.
 */
function attachErrorLogSink(newSink) {
    if (errorLogSink !== null) {
        return;
    }
    errorLogSink = newSink;
    // Drain the queue immediately - errors should not be delayed
    if (errorQueue.length > 0) {
        var queuedEvents = __spreadArray([], errorQueue, true);
        errorQueue.length = 0;
        for (var _i = 0, queuedEvents_1 = queuedEvents; _i < queuedEvents_1.length; _i++) {
            var event_1 = queuedEvents_1[_i];
            switch (event_1.type) {
                case 'error':
                    errorLogSink.logError(event_1.error);
                    break;
                case 'mcpError':
                    errorLogSink.logMCPError(event_1.serverName, event_1.error);
                    break;
                case 'mcpDebug':
                    errorLogSink.logMCPDebug(event_1.serverName, event_1.message);
                    break;
            }
        }
    }
}
/**
 * Logs an error to multiple destinations for debugging and monitoring.
 *
 * This function logs errors to:
 * - Debug logs (visible via `claude --debug` or `tail -f ~/.claude/debug/latest`)
 * - In-memory error log (accessible via `getInMemoryErrors()`, useful for including
 *   in bug reports or displaying recent errors to users)
 * - Persistent error log file (only for internal 'ant' users, stored in ~/.claude/errors/)
 *
 * Usage:
 * ```ts
 * logError(new Error('Failed to connect'))
 * ```
 *
 * To view errors:
 * - Debug: Run `claude --debug` or `tail -f ~/.claude/debug/latest`
 * - In-memory: Call `getInMemoryErrors()` to get recent errors for the current session
 */
var isHardFailMode = (0, memoize_js_1.default)(function () {
    return process.argv.includes('--hard-fail');
});
function logError(error) {
    var err = (0, errors_js_1.toError)(error);
    if ((0, bun_bundle_1.feature)('HARD_FAIL') && isHardFailMode()) {
        // biome-ignore lint/suspicious/noConsole:: intentional crash output
        console.error('[HARD FAIL] logError called with:', err.stack || err.message);
        // eslint-disable-next-line custom-rules/no-process-exit
        process.exit(1);
    }
    try {
        // Check if error reporting should be disabled
        if (
        // Cloud providers (Bedrock/Vertex/Foundry) always disable features
        (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_USE_BEDROCK) ||
            (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_USE_VERTEX) ||
            (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_USE_FOUNDRY) ||
            process.env.DISABLE_ERROR_REPORTING ||
            (0, privacyLevel_js_1.isEssentialTrafficOnly)()) {
            return;
        }
        var errorStr = err.stack || err.message;
        var errorInfo = {
            error: errorStr,
            timestamp: new Date().toISOString(),
        };
        // Always add to in-memory log (no dependencies needed)
        addToInMemoryErrorLog(errorInfo);
        // If sink not attached, queue the event
        if (errorLogSink === null) {
            errorQueue.push({ type: 'error', error: err });
            return;
        }
        errorLogSink.logError(err);
    }
    catch (_a) {
        // pass
    }
}
function getInMemoryErrors() {
    return __spreadArray([], inMemoryErrorLog, true);
}
/**
 * Loads the list of error logs
 * @returns List of error logs sorted by date
 */
function loadErrorLogs() {
    return loadLogList(cachePaths_js_1.CACHE_PATHS.errors());
}
/**
 * Gets an error log by its index
 * @param index Index in the sorted list of logs (0-based)
 * @returns Log data or null if not found
 */
function getErrorLogByIndex(index) {
    return __awaiter(this, void 0, void 0, function () {
        var logs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadErrorLogs()];
                case 1:
                    logs = _a.sent();
                    return [2 /*return*/, logs[index] || null];
            }
        });
    });
}
/**
 * Internal function to load and process logs from a specified path
 * @param path Directory containing logs
 * @returns Array of logs sorted by date
 * @private
 */
function loadLogList(path) {
    return __awaiter(this, void 0, void 0, function () {
        var files, _a, logData;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, promises_1.readdir)(path, { withFileTypes: true })];
                case 1:
                    files = _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _a = _b.sent();
                    logError(new Error("No logs found at ".concat(path)));
                    return [2 /*return*/, []];
                case 3: return [4 /*yield*/, Promise.all(files.map(function (file, i) { return __awaiter(_this, void 0, void 0, function () {
                        var fullPath, content, messages, firstMessage, lastMessage, firstPrompt, fileStats, isSidechain, date;
                        var _a, _b, _c;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0:
                                    fullPath = (0, path_1.join)(path, file.name);
                                    return [4 /*yield*/, (0, promises_1.readFile)(fullPath, { encoding: 'utf8' })];
                                case 1:
                                    content = _d.sent();
                                    messages = (0, slowOperations_js_1.jsonParse)(content);
                                    firstMessage = messages[0];
                                    lastMessage = messages[messages.length - 1];
                                    firstPrompt = (firstMessage === null || firstMessage === void 0 ? void 0 : firstMessage.type) === 'user' &&
                                        typeof ((_a = firstMessage === null || firstMessage === void 0 ? void 0 : firstMessage.message) === null || _a === void 0 ? void 0 : _a.content) === 'string'
                                        ? (_b = firstMessage === null || firstMessage === void 0 ? void 0 : firstMessage.message) === null || _b === void 0 ? void 0 : _b.content
                                        : 'No prompt';
                                    return [4 /*yield*/, (0, promises_1.stat)(fullPath)
                                        // Check if it's a sidechain by looking at filename
                                    ];
                                case 2:
                                    fileStats = _d.sent();
                                    isSidechain = fullPath.includes('sidechain');
                                    date = dateToFilename(fileStats.mtime);
                                    return [2 /*return*/, {
                                            date: date,
                                            fullPath: fullPath,
                                            messages: messages,
                                            value: i, // hack: overwritten after sorting, right below this
                                            created: parseISOString((firstMessage === null || firstMessage === void 0 ? void 0 : firstMessage.timestamp) || date),
                                            modified: (lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.timestamp)
                                                ? parseISOString(lastMessage.timestamp)
                                                : parseISOString(date),
                                            firstPrompt: ((_c = firstPrompt.split('\n')[0]) === null || _c === void 0 ? void 0 : _c.slice(0, 50)) +
                                                (firstPrompt.length > 50 ? '…' : '') || 'No prompt',
                                            messageCount: messages.length,
                                            isSidechain: isSidechain,
                                        }];
                            }
                        });
                    }); }))];
                case 4:
                    logData = _b.sent();
                    return [2 /*return*/, (0, logs_js_1.sortLogs)(logData.filter(function (_) { return _ !== null; })).map(function (_, i) { return (__assign(__assign({}, _), { value: i })); })];
            }
        });
    });
}
function parseISOString(s) {
    var b = s.split(/\D+/);
    return new Date(Date.UTC(parseInt(b[0], 10), parseInt(b[1], 10) - 1, parseInt(b[2], 10), parseInt(b[3], 10), parseInt(b[4], 10), parseInt(b[5], 10), parseInt(b[6], 10)));
}
function logMCPError(serverName, error) {
    try {
        // If sink not attached, queue the event
        if (errorLogSink === null) {
            errorQueue.push({ type: 'mcpError', serverName: serverName, error: error });
            return;
        }
        errorLogSink.logMCPError(serverName, error);
    }
    catch (_a) {
        // Silently fail
    }
}
function logMCPDebug(serverName, message) {
    try {
        // If sink not attached, queue the event
        if (errorLogSink === null) {
            errorQueue.push({ type: 'mcpDebug', serverName: serverName, message: message });
            return;
        }
        errorLogSink.logMCPDebug(serverName, message);
    }
    catch (_a) {
        // Silently fail
    }
}
/**
 * Captures the last API request for inclusion in bug reports.
 */
function captureAPIRequest(params, querySource) {
    // startsWith, not exact match — users with non-default output styles get
    // variants like 'repl_main_thread:outputStyle:Explanatory' (querySource.ts).
    if (!querySource || !querySource.startsWith('repl_main_thread')) {
        return;
    }
    // Store params WITHOUT messages to avoid retaining the entire conversation
    // for all users. Messages are already persisted to the transcript file and
    // available via React state.
    var messages = params.messages, paramsWithoutMessages = __rest(params, ["messages"]);
    (0, state_js_1.setLastAPIRequest)(paramsWithoutMessages);
    // For ant users only: also keep a reference to the final messages array so
    // /share's serialized_conversation.json captures the exact post-compaction,
    // CLAUDE.md-injected payload the API received. Overwritten each turn;
    // dumpPrompts.ts already holds 5 full request bodies for ants, so this is
    // not a new retention class.
    (0, state_js_1.setLastAPIRequestMessages)(process.env.USER_TYPE === 'ant' ? messages : null);
}
/**
 * Reset error log state for testing purposes only.
 * @internal
 */
function _resetErrorLogForTesting() {
    errorLogSink = null;
    errorQueue.length = 0;
    inMemoryErrorLog = [];
}
