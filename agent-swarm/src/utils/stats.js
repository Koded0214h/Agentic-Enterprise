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
exports.aggregateClaudeCodeStats = aggregateClaudeCodeStats;
exports.aggregateClaudeCodeStatsForRange = aggregateClaudeCodeStatsForRange;
exports.readSessionStartDate = readSessionStartDate;
var bun_bundle_1 = require("bun:bundle");
var promises_1 = require("fs/promises");
var path_1 = require("path");
var debug_js_1 = require("./debug.js");
var errors_js_1 = require("./errors.js");
var fsOperations_js_1 = require("./fsOperations.js");
var json_js_1 = require("./json.js");
var messages_js_1 = require("./messages.js");
var sessionStorage_js_1 = require("./sessionStorage.js");
var shellToolUtils_js_1 = require("./shell/shellToolUtils.js");
var slowOperations_js_1 = require("./slowOperations.js");
var statsCache_js_1 = require("./statsCache.js");
/**
 * Process session files and extract stats.
 * Can filter by date range.
 */
function processSessionFiles(sessionFiles_1) {
    return __awaiter(this, arguments, void 0, function (sessionFiles, options) {
        var fromDate, toDate, fs, dailyActivityMap, dailyModelTokensMap, sessions, hourCounts, totalMessages, totalSpeculationTimeSavedMs, modelUsageAgg, shotDistributionMap, sessionsWithShotCount, BATCH_SIZE, i, batch, results, _i, results_1, _a, sessionFile, entries, error, skipped, sessionId, messages, _b, entries_1, entry, isSubagentFile, parentSessionId, shotCount, mainMessages, firstMessage, lastMessage, firstTimestamp, lastTimestamp, dateKey, existing, duration, hour, _c, mainMessages_1, message, content, _d, content_1, block, activity, usage, model, totalTokens, dayTokens;
        var _this = this;
        var _e, _f;
        if (options === void 0) { options = {}; }
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    fromDate = options.fromDate, toDate = options.toDate;
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    dailyActivityMap = new Map();
                    dailyModelTokensMap = new Map();
                    sessions = [];
                    hourCounts = new Map();
                    totalMessages = 0;
                    totalSpeculationTimeSavedMs = 0;
                    modelUsageAgg = {};
                    shotDistributionMap = (0, bun_bundle_1.feature)('SHOT_STATS')
                        ? new Map()
                        : undefined;
                    sessionsWithShotCount = new Set();
                    BATCH_SIZE = 20;
                    i = 0;
                    _g.label = 1;
                case 1:
                    if (!(i < sessionFiles.length)) return [3 /*break*/, 4];
                    batch = sessionFiles.slice(i, i + BATCH_SIZE);
                    return [4 /*yield*/, Promise.all(batch.map(function (sessionFile) { return __awaiter(_this, void 0, void 0, function () {
                            var fileSize, fileStat, fileModifiedDate, _a, startDate, entries, error_1;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _b.trys.push([0, 8, , 9]);
                                        if (!fromDate) return [3 /*break*/, 6];
                                        fileSize = 0;
                                        _b.label = 1;
                                    case 1:
                                        _b.trys.push([1, 3, , 4]);
                                        return [4 /*yield*/, fs.stat(sessionFile)];
                                    case 2:
                                        fileStat = _b.sent();
                                        fileModifiedDate = (0, statsCache_js_1.toDateString)(fileStat.mtime);
                                        if ((0, statsCache_js_1.isDateBefore)(fileModifiedDate, fromDate)) {
                                            return [2 /*return*/, {
                                                    sessionFile: sessionFile,
                                                    entries: null,
                                                    error: null,
                                                    skipped: true,
                                                }];
                                        }
                                        fileSize = fileStat.size;
                                        return [3 /*break*/, 4];
                                    case 3:
                                        _a = _b.sent();
                                        return [3 /*break*/, 4];
                                    case 4:
                                        if (!(fileSize > 65536)) return [3 /*break*/, 6];
                                        return [4 /*yield*/, readSessionStartDate(sessionFile)];
                                    case 5:
                                        startDate = _b.sent();
                                        if (startDate && (0, statsCache_js_1.isDateBefore)(startDate, fromDate)) {
                                            return [2 /*return*/, {
                                                    sessionFile: sessionFile,
                                                    entries: null,
                                                    error: null,
                                                    skipped: true,
                                                }];
                                        }
                                        _b.label = 6;
                                    case 6: return [4 /*yield*/, (0, json_js_1.readJSONLFile)(sessionFile)];
                                    case 7:
                                        entries = _b.sent();
                                        return [2 /*return*/, { sessionFile: sessionFile, entries: entries, error: null, skipped: false }];
                                    case 8:
                                        error_1 = _b.sent();
                                        return [2 /*return*/, { sessionFile: sessionFile, entries: null, error: error_1, skipped: false }];
                                    case 9: return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 2:
                    results = _g.sent();
                    for (_i = 0, results_1 = results; _i < results_1.length; _i++) {
                        _a = results_1[_i], sessionFile = _a.sessionFile, entries = _a.entries, error = _a.error, skipped = _a.skipped;
                        if (skipped)
                            continue;
                        if (error || !entries) {
                            (0, debug_js_1.logForDebugging)("Failed to read session file ".concat(sessionFile, ": ").concat((0, errors_js_1.errorMessage)(error)));
                            continue;
                        }
                        sessionId = (0, path_1.basename)(sessionFile, '.jsonl');
                        messages = [];
                        for (_b = 0, entries_1 = entries; _b < entries_1.length; _b++) {
                            entry = entries_1[_b];
                            if ((0, sessionStorage_js_1.isTranscriptMessage)(entry)) {
                                messages.push(entry);
                            }
                            else if (entry.type === 'speculation-accept') {
                                totalSpeculationTimeSavedMs += entry.timeSavedMs;
                            }
                        }
                        if (messages.length === 0)
                            continue;
                        isSubagentFile = sessionFile.includes("".concat(path_1.sep, "subagents").concat(path_1.sep));
                        // Extract shot count from PR attribution in gh pr create calls (ant-only)
                        // This must run before the sidechain filter since subagent transcripts
                        // mark all messages as sidechain
                        if ((0, bun_bundle_1.feature)('SHOT_STATS') && shotDistributionMap) {
                            parentSessionId = isSubagentFile
                                ? (0, path_1.basename)((0, path_1.dirname)((0, path_1.dirname)(sessionFile)))
                                : sessionId;
                            if (!sessionsWithShotCount.has(parentSessionId)) {
                                shotCount = extractShotCountFromMessages(messages);
                                if (shotCount !== null) {
                                    sessionsWithShotCount.add(parentSessionId);
                                    shotDistributionMap.set(shotCount, (shotDistributionMap.get(shotCount) || 0) + 1);
                                }
                            }
                        }
                        mainMessages = isSubagentFile
                            ? messages
                            : messages.filter(function (m) { return !m.isSidechain; });
                        if (mainMessages.length === 0)
                            continue;
                        firstMessage = mainMessages[0];
                        lastMessage = mainMessages.at(-1);
                        firstTimestamp = new Date(firstMessage.timestamp);
                        lastTimestamp = new Date(lastMessage.timestamp);
                        // Skip sessions with malformed timestamps — some transcripts on disk
                        // have entries missing the timestamp field (e.g. partial/remote writes).
                        // new Date(undefined) produces an Invalid Date, and toDateString() would
                        // throw RangeError: Invalid Date on .toISOString().
                        if (isNaN(firstTimestamp.getTime()) || isNaN(lastTimestamp.getTime())) {
                            (0, debug_js_1.logForDebugging)("Skipping session with invalid timestamp: ".concat(sessionFile));
                            continue;
                        }
                        dateKey = (0, statsCache_js_1.toDateString)(firstTimestamp);
                        // Apply date filters
                        if (fromDate && (0, statsCache_js_1.isDateBefore)(dateKey, fromDate))
                            continue;
                        if (toDate && (0, statsCache_js_1.isDateBefore)(toDate, dateKey))
                            continue;
                        existing = dailyActivityMap.get(dateKey) || {
                            date: dateKey,
                            messageCount: 0,
                            sessionCount: 0,
                            toolCallCount: 0,
                        };
                        // Subagent files contribute tokens and tool calls, but aren't sessions.
                        if (!isSubagentFile) {
                            duration = lastTimestamp.getTime() - firstTimestamp.getTime();
                            sessions.push({
                                sessionId: sessionId,
                                duration: duration,
                                messageCount: mainMessages.length,
                                timestamp: firstMessage.timestamp,
                            });
                            totalMessages += mainMessages.length;
                            existing.sessionCount++;
                            existing.messageCount += mainMessages.length;
                            hour = firstTimestamp.getHours();
                            hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
                        }
                        if (!isSubagentFile || dailyActivityMap.has(dateKey)) {
                            dailyActivityMap.set(dateKey, existing);
                        }
                        // Process messages for tool usage and model stats
                        for (_c = 0, mainMessages_1 = mainMessages; _c < mainMessages_1.length; _c++) {
                            message = mainMessages_1[_c];
                            if (message.type === 'assistant') {
                                content = (_e = message.message) === null || _e === void 0 ? void 0 : _e.content;
                                if (Array.isArray(content)) {
                                    for (_d = 0, content_1 = content; _d < content_1.length; _d++) {
                                        block = content_1[_d];
                                        if (block.type === 'tool_use') {
                                            activity = dailyActivityMap.get(dateKey);
                                            if (activity) {
                                                activity.toolCallCount++;
                                            }
                                        }
                                    }
                                }
                                // Track model usage if available (skip synthetic messages)
                                if ((_f = message.message) === null || _f === void 0 ? void 0 : _f.usage) {
                                    usage = message.message.usage;
                                    model = message.message.model || 'unknown';
                                    // Skip synthetic messages - they are internal and shouldn't appear in stats
                                    if (model === messages_js_1.SYNTHETIC_MODEL) {
                                        continue;
                                    }
                                    if (!modelUsageAgg[model]) {
                                        modelUsageAgg[model] = {
                                            inputTokens: 0,
                                            outputTokens: 0,
                                            cacheReadInputTokens: 0,
                                            cacheCreationInputTokens: 0,
                                            webSearchRequests: 0,
                                            costUSD: 0,
                                            contextWindow: 0,
                                            maxOutputTokens: 0,
                                        };
                                    }
                                    modelUsageAgg[model].inputTokens += usage.input_tokens || 0;
                                    modelUsageAgg[model].outputTokens += usage.output_tokens || 0;
                                    modelUsageAgg[model].cacheReadInputTokens +=
                                        usage.cache_read_input_tokens || 0;
                                    modelUsageAgg[model].cacheCreationInputTokens +=
                                        usage.cache_creation_input_tokens || 0;
                                    totalTokens = (usage.input_tokens || 0) + (usage.output_tokens || 0);
                                    if (totalTokens > 0) {
                                        dayTokens = dailyModelTokensMap.get(dateKey) || {};
                                        dayTokens[model] = (dayTokens[model] || 0) + totalTokens;
                                        dailyModelTokensMap.set(dateKey, dayTokens);
                                    }
                                }
                            }
                        }
                    }
                    _g.label = 3;
                case 3:
                    i += BATCH_SIZE;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, __assign({ dailyActivity: Array.from(dailyActivityMap.values()).sort(function (a, b) {
                            return a.date.localeCompare(b.date);
                        }), dailyModelTokens: Array.from(dailyModelTokensMap.entries())
                            .map(function (_a) {
                            var date = _a[0], tokensByModel = _a[1];
                            return ({ date: date, tokensByModel: tokensByModel });
                        })
                            .sort(function (a, b) { return a.date.localeCompare(b.date); }), modelUsage: modelUsageAgg, sessionStats: sessions, hourCounts: Object.fromEntries(hourCounts), totalMessages: totalMessages, totalSpeculationTimeSavedMs: totalSpeculationTimeSavedMs }, ((0, bun_bundle_1.feature)('SHOT_STATS') && shotDistributionMap
                        ? { shotDistribution: Object.fromEntries(shotDistributionMap) }
                        : {}))];
            }
        });
    });
}
/**
 * Get all session files from all project directories.
 * Includes both main session files and subagent transcript files.
 */
function getAllSessionFiles() {
    return __awaiter(this, void 0, void 0, function () {
        var projectsDir, fs, allEntries, e_1, projectDirs, projectResults;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    projectsDir = (0, sessionStorage_js_1.getProjectsDir)();
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fs.readdir(projectsDir)];
                case 2:
                    allEntries = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    if ((0, errors_js_1.isENOENT)(e_1))
                        return [2 /*return*/, []];
                    throw e_1;
                case 4:
                    projectDirs = allEntries
                        .filter(function (dirent) { return dirent.isDirectory(); })
                        .map(function (dirent) { return (0, path_1.join)(projectsDir, dirent.name); });
                    return [4 /*yield*/, Promise.all(projectDirs.map(function (projectDir) { return __awaiter(_this, void 0, void 0, function () {
                            var entries, mainFiles, sessionDirs, subagentResults, error_2;
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 3, , 4]);
                                        return [4 /*yield*/, fs.readdir(projectDir)
                                            // Collect main session files (*.jsonl directly in project dir)
                                        ];
                                    case 1:
                                        entries = _a.sent();
                                        mainFiles = entries
                                            .filter(function (dirent) { return dirent.isFile() && dirent.name.endsWith('.jsonl'); })
                                            .map(function (dirent) { return (0, path_1.join)(projectDir, dirent.name); });
                                        sessionDirs = entries.filter(function (dirent) { return dirent.isDirectory(); });
                                        return [4 /*yield*/, Promise.all(sessionDirs.map(function (sessionDir) { return __awaiter(_this, void 0, void 0, function () {
                                                var subagentsDir, subagentEntries, _a;
                                                return __generator(this, function (_b) {
                                                    switch (_b.label) {
                                                        case 0:
                                                            subagentsDir = (0, path_1.join)(projectDir, sessionDir.name, 'subagents');
                                                            _b.label = 1;
                                                        case 1:
                                                            _b.trys.push([1, 3, , 4]);
                                                            return [4 /*yield*/, fs.readdir(subagentsDir)];
                                                        case 2:
                                                            subagentEntries = _b.sent();
                                                            return [2 /*return*/, subagentEntries
                                                                    .filter(function (dirent) {
                                                                    return dirent.isFile() &&
                                                                        dirent.name.endsWith('.jsonl') &&
                                                                        dirent.name.startsWith('agent-');
                                                                })
                                                                    .map(function (dirent) { return (0, path_1.join)(subagentsDir, dirent.name); })];
                                                        case 3:
                                                            _a = _b.sent();
                                                            // subagents directory doesn't exist for this session, skip
                                                            return [2 /*return*/, []];
                                                        case 4: return [2 /*return*/];
                                                    }
                                                });
                                            }); }))];
                                    case 2:
                                        subagentResults = _a.sent();
                                        return [2 /*return*/, __spreadArray(__spreadArray([], mainFiles, true), subagentResults.flat(), true)];
                                    case 3:
                                        error_2 = _a.sent();
                                        (0, debug_js_1.logForDebugging)("Failed to read project directory ".concat(projectDir, ": ").concat((0, errors_js_1.errorMessage)(error_2)));
                                        return [2 /*return*/, []];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 5:
                    projectResults = _a.sent();
                    return [2 /*return*/, projectResults.flat()];
            }
        });
    });
}
/**
 * Convert a PersistedStatsCache to ClaudeCodeStats by computing derived fields.
 */
function cacheToStats(cache, todayStats) {
    // Merge cache with today's stats
    var dailyActivityMap = new Map();
    for (var _i = 0, _a = cache.dailyActivity; _i < _a.length; _i++) {
        var day = _a[_i];
        dailyActivityMap.set(day.date, __assign({}, day));
    }
    if (todayStats) {
        for (var _b = 0, _c = todayStats.dailyActivity; _b < _c.length; _b++) {
            var day = _c[_b];
            var existing = dailyActivityMap.get(day.date);
            if (existing) {
                existing.messageCount += day.messageCount;
                existing.sessionCount += day.sessionCount;
                existing.toolCallCount += day.toolCallCount;
            }
            else {
                dailyActivityMap.set(day.date, __assign({}, day));
            }
        }
    }
    var dailyModelTokensMap = new Map();
    for (var _d = 0, _e = cache.dailyModelTokens; _d < _e.length; _d++) {
        var day = _e[_d];
        dailyModelTokensMap.set(day.date, __assign({}, day.tokensByModel));
    }
    if (todayStats) {
        for (var _f = 0, _g = todayStats.dailyModelTokens; _f < _g.length; _f++) {
            var day = _g[_f];
            var existing = dailyModelTokensMap.get(day.date);
            if (existing) {
                for (var _h = 0, _j = Object.entries(day.tokensByModel); _h < _j.length; _h++) {
                    var _k = _j[_h], model = _k[0], tokens = _k[1];
                    existing[model] = (existing[model] || 0) + tokens;
                }
            }
            else {
                dailyModelTokensMap.set(day.date, __assign({}, day.tokensByModel));
            }
        }
    }
    // Merge model usage
    var modelUsage = __assign({}, cache.modelUsage);
    if (todayStats) {
        for (var _l = 0, _m = Object.entries(todayStats.modelUsage); _l < _m.length; _l++) {
            var _o = _m[_l], model = _o[0], usage = _o[1];
            if (modelUsage[model]) {
                modelUsage[model] = {
                    inputTokens: modelUsage[model].inputTokens + usage.inputTokens,
                    outputTokens: modelUsage[model].outputTokens + usage.outputTokens,
                    cacheReadInputTokens: modelUsage[model].cacheReadInputTokens +
                        usage.cacheReadInputTokens,
                    cacheCreationInputTokens: modelUsage[model].cacheCreationInputTokens +
                        usage.cacheCreationInputTokens,
                    webSearchRequests: modelUsage[model].webSearchRequests + usage.webSearchRequests,
                    costUSD: modelUsage[model].costUSD + usage.costUSD,
                    contextWindow: Math.max(modelUsage[model].contextWindow, usage.contextWindow),
                    maxOutputTokens: Math.max(modelUsage[model].maxOutputTokens, usage.maxOutputTokens),
                };
            }
            else {
                modelUsage[model] = __assign({}, usage);
            }
        }
    }
    // Merge hour counts
    var hourCountsMap = new Map();
    for (var _p = 0, _q = Object.entries(cache.hourCounts); _p < _q.length; _p++) {
        var _r = _q[_p], hour = _r[0], count = _r[1];
        hourCountsMap.set(parseInt(hour, 10), count);
    }
    if (todayStats) {
        for (var _s = 0, _t = Object.entries(todayStats.hourCounts); _s < _t.length; _s++) {
            var _u = _t[_s], hour = _u[0], count = _u[1];
            var hourNum = parseInt(hour, 10);
            hourCountsMap.set(hourNum, (hourCountsMap.get(hourNum) || 0) + count);
        }
    }
    // Calculate derived stats
    var dailyActivityArray = Array.from(dailyActivityMap.values()).sort(function (a, b) { return a.date.localeCompare(b.date); });
    var streaks = calculateStreaks(dailyActivityArray);
    var dailyModelTokens = Array.from(dailyModelTokensMap.entries())
        .map(function (_a) {
        var date = _a[0], tokensByModel = _a[1];
        return ({ date: date, tokensByModel: tokensByModel });
    })
        .sort(function (a, b) { return a.date.localeCompare(b.date); });
    // Compute session aggregates: combine cache aggregates with today's stats
    var totalSessions = cache.totalSessions + ((todayStats === null || todayStats === void 0 ? void 0 : todayStats.sessionStats.length) || 0);
    var totalMessages = cache.totalMessages + ((todayStats === null || todayStats === void 0 ? void 0 : todayStats.totalMessages) || 0);
    // Find longest session (compare cache's longest with today's sessions)
    var longestSession = cache.longestSession;
    if (todayStats) {
        for (var _v = 0, _w = todayStats.sessionStats; _v < _w.length; _v++) {
            var session = _w[_v];
            if (!longestSession || session.duration > longestSession.duration) {
                longestSession = session;
            }
        }
    }
    // Find first/last session dates
    var firstSessionDate = cache.firstSessionDate;
    var lastSessionDate = null;
    if (todayStats) {
        for (var _x = 0, _y = todayStats.sessionStats; _x < _y.length; _x++) {
            var session = _y[_x];
            if (!firstSessionDate || session.timestamp < firstSessionDate) {
                firstSessionDate = session.timestamp;
            }
            if (!lastSessionDate || session.timestamp > lastSessionDate) {
                lastSessionDate = session.timestamp;
            }
        }
    }
    // If no today sessions, derive lastSessionDate from dailyActivity
    if (!lastSessionDate && dailyActivityArray.length > 0) {
        lastSessionDate = dailyActivityArray.at(-1).date;
    }
    var peakActivityDay = dailyActivityArray.length > 0
        ? dailyActivityArray.reduce(function (max, d) {
            return d.messageCount > max.messageCount ? d : max;
        }).date
        : null;
    var peakActivityHour = hourCountsMap.size > 0
        ? Array.from(hourCountsMap.entries()).reduce(function (max, _a) {
            var hour = _a[0], count = _a[1];
            return count > max[1] ? [hour, count] : max;
        })[0]
        : null;
    var totalDays = firstSessionDate && lastSessionDate
        ? Math.ceil((new Date(lastSessionDate).getTime() -
            new Date(firstSessionDate).getTime()) /
            (1000 * 60 * 60 * 24)) + 1
        : 0;
    var totalSpeculationTimeSavedMs = cache.totalSpeculationTimeSavedMs +
        ((todayStats === null || todayStats === void 0 ? void 0 : todayStats.totalSpeculationTimeSavedMs) || 0);
    var result = {
        totalSessions: totalSessions,
        totalMessages: totalMessages,
        totalDays: totalDays,
        activeDays: dailyActivityMap.size,
        streaks: streaks,
        dailyActivity: dailyActivityArray,
        dailyModelTokens: dailyModelTokens,
        longestSession: longestSession,
        modelUsage: modelUsage,
        firstSessionDate: firstSessionDate,
        lastSessionDate: lastSessionDate,
        peakActivityDay: peakActivityDay,
        peakActivityHour: peakActivityHour,
        totalSpeculationTimeSavedMs: totalSpeculationTimeSavedMs,
    };
    if ((0, bun_bundle_1.feature)('SHOT_STATS')) {
        var shotDistribution = __assign({}, (cache.shotDistribution || {}));
        if (todayStats === null || todayStats === void 0 ? void 0 : todayStats.shotDistribution) {
            for (var _z = 0, _0 = Object.entries(todayStats.shotDistribution); _z < _0.length; _z++) {
                var _1 = _0[_z], count = _1[0], sessions = _1[1];
                var key = parseInt(count, 10);
                shotDistribution[key] = (shotDistribution[key] || 0) + sessions;
            }
        }
        result.shotDistribution = shotDistribution;
        var totalWithShots = Object.values(shotDistribution).reduce(function (sum, n) { return sum + n; }, 0);
        result.oneShotRate =
            totalWithShots > 0
                ? Math.round(((shotDistribution[1] || 0) / totalWithShots) * 100)
                : 0;
    }
    return result;
}
/**
 * Aggregates stats from all Claude Code sessions across all projects.
 * Uses a disk cache to avoid reprocessing historical data.
 */
function aggregateClaudeCodeStats() {
    return __awaiter(this, void 0, void 0, function () {
        var allSessionFiles, updatedCache, today, todayStats;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getAllSessionFiles()];
                case 1:
                    allSessionFiles = _a.sent();
                    if (allSessionFiles.length === 0) {
                        return [2 /*return*/, getEmptyStats()];
                    }
                    return [4 /*yield*/, (0, statsCache_js_1.withStatsCacheLock)(function () { return __awaiter(_this, void 0, void 0, function () {
                            var cache, yesterday, result, historicalStats, nextDay, newStats;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, statsCache_js_1.loadStatsCache)()];
                                    case 1:
                                        cache = _a.sent();
                                        yesterday = (0, statsCache_js_1.getYesterdayDateString)();
                                        result = cache;
                                        if (!!cache.lastComputedDate) return [3 /*break*/, 5];
                                        // No cache - process all historical data (everything before today)
                                        (0, debug_js_1.logForDebugging)('Stats cache empty, processing all historical data');
                                        return [4 /*yield*/, processSessionFiles(allSessionFiles, {
                                                toDate: yesterday,
                                            })];
                                    case 2:
                                        historicalStats = _a.sent();
                                        if (!(historicalStats.sessionStats.length > 0 ||
                                            historicalStats.dailyActivity.length > 0)) return [3 /*break*/, 4];
                                        result = (0, statsCache_js_1.mergeCacheWithNewStats)(cache, historicalStats, yesterday);
                                        return [4 /*yield*/, (0, statsCache_js_1.saveStatsCache)(result)];
                                    case 3:
                                        _a.sent();
                                        _a.label = 4;
                                    case 4: return [3 /*break*/, 10];
                                    case 5:
                                        if (!(0, statsCache_js_1.isDateBefore)(cache.lastComputedDate, yesterday)) return [3 /*break*/, 10];
                                        nextDay = getNextDay(cache.lastComputedDate);
                                        (0, debug_js_1.logForDebugging)("Stats cache stale (".concat(cache.lastComputedDate, "), processing ").concat(nextDay, " to ").concat(yesterday));
                                        return [4 /*yield*/, processSessionFiles(allSessionFiles, {
                                                fromDate: nextDay,
                                                toDate: yesterday,
                                            })];
                                    case 6:
                                        newStats = _a.sent();
                                        if (!(newStats.sessionStats.length > 0 ||
                                            newStats.dailyActivity.length > 0)) return [3 /*break*/, 8];
                                        result = (0, statsCache_js_1.mergeCacheWithNewStats)(cache, newStats, yesterday);
                                        return [4 /*yield*/, (0, statsCache_js_1.saveStatsCache)(result)];
                                    case 7:
                                        _a.sent();
                                        return [3 /*break*/, 10];
                                    case 8:
                                        // No new data, but update lastComputedDate
                                        result = __assign(__assign({}, cache), { lastComputedDate: yesterday });
                                        return [4 /*yield*/, (0, statsCache_js_1.saveStatsCache)(result)];
                                    case 9:
                                        _a.sent();
                                        _a.label = 10;
                                    case 10: return [2 /*return*/, result];
                                }
                            });
                        }); })
                        // Always process today's data live (it's incomplete)
                        // This doesn't need to be in the lock since it doesn't modify the cache
                    ];
                case 2:
                    updatedCache = _a.sent();
                    today = (0, statsCache_js_1.getTodayDateString)();
                    return [4 /*yield*/, processSessionFiles(allSessionFiles, {
                            fromDate: today,
                            toDate: today,
                        })
                        // Combine cache with today's stats
                    ];
                case 3:
                    todayStats = _a.sent();
                    // Combine cache with today's stats
                    return [2 /*return*/, cacheToStats(updatedCache, todayStats)];
            }
        });
    });
}
/**
 * Aggregates stats for a specific date range.
 * For 'all', uses the cached aggregation. For other ranges, processes files directly.
 */
function aggregateClaudeCodeStatsForRange(range) {
    return __awaiter(this, void 0, void 0, function () {
        var allSessionFiles, today, daysBack, fromDate, fromDateStr, stats;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (range === 'all') {
                        return [2 /*return*/, aggregateClaudeCodeStats()];
                    }
                    return [4 /*yield*/, getAllSessionFiles()];
                case 1:
                    allSessionFiles = _a.sent();
                    if (allSessionFiles.length === 0) {
                        return [2 /*return*/, getEmptyStats()];
                    }
                    today = new Date();
                    daysBack = range === '7d' ? 7 : 30;
                    fromDate = new Date(today);
                    fromDate.setDate(today.getDate() - daysBack + 1); // +1 to include today
                    fromDateStr = (0, statsCache_js_1.toDateString)(fromDate);
                    return [4 /*yield*/, processSessionFiles(allSessionFiles, {
                            fromDate: fromDateStr,
                        })];
                case 2:
                    stats = _a.sent();
                    return [2 /*return*/, processedStatsToClaudeCodeStats(stats)];
            }
        });
    });
}
/**
 * Convert ProcessedStats to ClaudeCodeStats.
 * Used for filtered date ranges that bypass the cache.
 */
function processedStatsToClaudeCodeStats(stats) {
    var dailyActivitySorted = stats.dailyActivity
        .slice()
        .sort(function (a, b) { return a.date.localeCompare(b.date); });
    var dailyModelTokensSorted = stats.dailyModelTokens
        .slice()
        .sort(function (a, b) { return a.date.localeCompare(b.date); });
    // Calculate streaks from daily activity
    var streaks = calculateStreaks(dailyActivitySorted);
    // Find longest session
    var longestSession = null;
    for (var _i = 0, _a = stats.sessionStats; _i < _a.length; _i++) {
        var session = _a[_i];
        if (!longestSession || session.duration > longestSession.duration) {
            longestSession = session;
        }
    }
    // Find first/last session dates
    var firstSessionDate = null;
    var lastSessionDate = null;
    for (var _b = 0, _c = stats.sessionStats; _b < _c.length; _b++) {
        var session = _c[_b];
        if (!firstSessionDate || session.timestamp < firstSessionDate) {
            firstSessionDate = session.timestamp;
        }
        if (!lastSessionDate || session.timestamp > lastSessionDate) {
            lastSessionDate = session.timestamp;
        }
    }
    // Peak activity day
    var peakActivityDay = dailyActivitySorted.length > 0
        ? dailyActivitySorted.reduce(function (max, d) {
            return d.messageCount > max.messageCount ? d : max;
        }).date
        : null;
    // Peak activity hour
    var hourEntries = Object.entries(stats.hourCounts);
    var peakActivityHour = hourEntries.length > 0
        ? parseInt(hourEntries.reduce(function (max, _a) {
            var hour = _a[0], count = _a[1];
            return count > parseInt(max[1].toString()) ? [hour, count] : max;
        })[0], 10)
        : null;
    // Total days in range
    var totalDays = firstSessionDate && lastSessionDate
        ? Math.ceil((new Date(lastSessionDate).getTime() -
            new Date(firstSessionDate).getTime()) /
            (1000 * 60 * 60 * 24)) + 1
        : 0;
    var result = {
        totalSessions: stats.sessionStats.length,
        totalMessages: stats.totalMessages,
        totalDays: totalDays,
        activeDays: stats.dailyActivity.length,
        streaks: streaks,
        dailyActivity: dailyActivitySorted,
        dailyModelTokens: dailyModelTokensSorted,
        longestSession: longestSession,
        modelUsage: stats.modelUsage,
        firstSessionDate: firstSessionDate,
        lastSessionDate: lastSessionDate,
        peakActivityDay: peakActivityDay,
        peakActivityHour: peakActivityHour,
        totalSpeculationTimeSavedMs: stats.totalSpeculationTimeSavedMs,
    };
    if ((0, bun_bundle_1.feature)('SHOT_STATS') && stats.shotDistribution) {
        result.shotDistribution = stats.shotDistribution;
        var totalWithShots = Object.values(stats.shotDistribution).reduce(function (sum, n) { return sum + n; }, 0);
        result.oneShotRate =
            totalWithShots > 0
                ? Math.round(((stats.shotDistribution[1] || 0) / totalWithShots) * 100)
                : 0;
    }
    return result;
}
/**
 * Get the next day after a given date string (YYYY-MM-DD format).
 */
function getNextDay(dateStr) {
    var date = new Date(dateStr);
    date.setDate(date.getDate() + 1);
    return (0, statsCache_js_1.toDateString)(date);
}
function calculateStreaks(dailyActivity) {
    if (dailyActivity.length === 0) {
        return {
            currentStreak: 0,
            longestStreak: 0,
            currentStreakStart: null,
            longestStreakStart: null,
            longestStreakEnd: null,
        };
    }
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    // Calculate current streak (working backwards from today)
    var currentStreak = 0;
    var currentStreakStart = null;
    var checkDate = new Date(today);
    // Build a set of active dates for quick lookup
    var activeDates = new Set(dailyActivity.map(function (d) { return d.date; }));
    while (true) {
        var dateStr = (0, statsCache_js_1.toDateString)(checkDate);
        if (!activeDates.has(dateStr)) {
            break;
        }
        currentStreak++;
        currentStreakStart = dateStr;
        checkDate.setDate(checkDate.getDate() - 1);
    }
    // Calculate longest streak
    var longestStreak = 0;
    var longestStreakStart = null;
    var longestStreakEnd = null;
    if (dailyActivity.length > 0) {
        var sortedDates = Array.from(activeDates).sort();
        var tempStreak = 1;
        var tempStart = sortedDates[0];
        for (var i = 1; i < sortedDates.length; i++) {
            var prevDate = new Date(sortedDates[i - 1]);
            var currDate = new Date(sortedDates[i]);
            var dayDiff = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
            if (dayDiff === 1) {
                tempStreak++;
            }
            else {
                if (tempStreak > longestStreak) {
                    longestStreak = tempStreak;
                    longestStreakStart = tempStart;
                    longestStreakEnd = sortedDates[i - 1];
                }
                tempStreak = 1;
                tempStart = sortedDates[i];
            }
        }
        // Check final streak
        if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
            longestStreakStart = tempStart;
            longestStreakEnd = sortedDates.at(-1);
        }
    }
    return {
        currentStreak: currentStreak,
        longestStreak: longestStreak,
        currentStreakStart: currentStreakStart,
        longestStreakStart: longestStreakStart,
        longestStreakEnd: longestStreakEnd,
    };
}
var SHOT_COUNT_REGEX = /(\d+)-shotted by/;
/**
 * Extract the shot count from PR attribution text in a `gh pr create` Bash call.
 * The attribution format is: "N-shotted by model-name"
 * Returns the shot count, or null if not found.
 */
function extractShotCountFromMessages(messages) {
    var _a;
    for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
        var m = messages_1[_i];
        if (m.type !== 'assistant')
            continue;
        var content = (_a = m.message) === null || _a === void 0 ? void 0 : _a.content;
        if (!Array.isArray(content))
            continue;
        for (var _b = 0, content_2 = content; _b < content_2.length; _b++) {
            var block = content_2[_b];
            if (block.type !== 'tool_use' ||
                !shellToolUtils_js_1.SHELL_TOOL_NAMES.includes(block.name) ||
                typeof block.input !== 'object' ||
                block.input === null ||
                !('command' in block.input) ||
                typeof block.input.command !== 'string') {
                continue;
            }
            var match = SHOT_COUNT_REGEX.exec(block.input.command);
            if (match) {
                return parseInt(match[1], 10);
            }
        }
    }
    return null;
}
// Transcript message types — must match isTranscriptMessage() in sessionStorage.ts.
// The canonical dateKey (see processSessionFiles) reads mainMessages[0].timestamp,
// where mainMessages = entries.filter(isTranscriptMessage).filter(!isSidechain).
// This peek must extract the same value to be a safe skip optimization.
var TRANSCRIPT_MESSAGE_TYPES = new Set([
    'user',
    'assistant',
    'attachment',
    'system',
    'progress',
]);
/**
 * Peeks at the head of a session file to get the session start date.
 * Uses a small 4 KB read to avoid loading the full file.
 *
 * Session files typically begin with non-transcript entries (`mode`,
 * `file-history-snapshot`, `attribution-snapshot`) before the first transcript
 * message, so we scan lines until we hit one. Each complete line is JSON-parsed
 * — naive string search is unsafe here because `file-history-snapshot` entries
 * embed a nested `snapshot.timestamp` carrying the *previous* session's date
 * (written by copyFileHistoryForResume), which would cause resumed sessions to
 * be miscategorised as old and silently dropped from stats.
 *
 * Returns a YYYY-MM-DD string, or null if no transcript message fits in the
 * head (caller falls through to the full read — safe default).
 */
function readSessionStartDate(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var fd, buf, bytesRead, head, lastNewline, _i, _a, line, entry, date, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 7, , 8]);
                    return [4 /*yield*/, (0, promises_1.open)(filePath, 'r')];
                case 1:
                    fd = _c.sent();
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, , 4, 6]);
                    buf = Buffer.allocUnsafe(4096);
                    return [4 /*yield*/, fd.read(buf, 0, buf.length, 0)];
                case 3:
                    bytesRead = (_c.sent()).bytesRead;
                    if (bytesRead === 0)
                        return [2 /*return*/, null];
                    head = buf.toString('utf8', 0, bytesRead);
                    lastNewline = head.lastIndexOf('\n');
                    if (lastNewline < 0)
                        return [2 /*return*/, null];
                    for (_i = 0, _a = head.slice(0, lastNewline).split('\n'); _i < _a.length; _i++) {
                        line = _a[_i];
                        if (!line)
                            continue;
                        entry = void 0;
                        try {
                            entry = (0, slowOperations_js_1.jsonParse)(line);
                        }
                        catch (_d) {
                            continue;
                        }
                        if (typeof entry.type !== 'string')
                            continue;
                        if (!TRANSCRIPT_MESSAGE_TYPES.has(entry.type))
                            continue;
                        if (entry.isSidechain === true)
                            continue;
                        if (typeof entry.timestamp !== 'string')
                            return [2 /*return*/, null];
                        date = new Date(entry.timestamp);
                        if (Number.isNaN(date.getTime()))
                            return [2 /*return*/, null];
                        return [2 /*return*/, (0, statsCache_js_1.toDateString)(date)];
                    }
                    return [2 /*return*/, null];
                case 4: return [4 /*yield*/, fd.close()];
                case 5:
                    _c.sent();
                    return [7 /*endfinally*/];
                case 6: return [3 /*break*/, 8];
                case 7:
                    _b = _c.sent();
                    return [2 /*return*/, null];
                case 8: return [2 /*return*/];
            }
        });
    });
}
function getEmptyStats() {
    return {
        totalSessions: 0,
        totalMessages: 0,
        totalDays: 0,
        activeDays: 0,
        streaks: {
            currentStreak: 0,
            longestStreak: 0,
            currentStreakStart: null,
            longestStreakStart: null,
            longestStreakEnd: null,
        },
        dailyActivity: [],
        dailyModelTokens: [],
        longestSession: null,
        modelUsage: {},
        firstSessionDate: null,
        lastSessionDate: null,
        peakActivityDay: null,
        peakActivityHour: null,
        totalSpeculationTimeSavedMs: 0,
    };
}
