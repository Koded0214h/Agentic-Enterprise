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
Object.defineProperty(exports, "__esModule", { value: true });
exports.STATS_CACHE_VERSION = void 0;
exports.withStatsCacheLock = withStatsCacheLock;
exports.getStatsCachePath = getStatsCachePath;
exports.loadStatsCache = loadStatsCache;
exports.saveStatsCache = saveStatsCache;
exports.mergeCacheWithNewStats = mergeCacheWithNewStats;
exports.toDateString = toDateString;
exports.getTodayDateString = getTodayDateString;
exports.getYesterdayDateString = getYesterdayDateString;
exports.isDateBefore = isDateBefore;
var bun_bundle_1 = require("bun:bundle");
var crypto_1 = require("crypto");
var promises_1 = require("fs/promises");
var path_1 = require("path");
var debug_js_1 = require("./debug.js");
var envUtils_js_1 = require("./envUtils.js");
var errors_js_1 = require("./errors.js");
var fsOperations_js_1 = require("./fsOperations.js");
var log_js_1 = require("./log.js");
var slowOperations_js_1 = require("./slowOperations.js");
exports.STATS_CACHE_VERSION = 3;
var MIN_MIGRATABLE_VERSION = 1;
var STATS_CACHE_FILENAME = 'stats-cache.json';
/**
 * Simple in-memory lock to prevent concurrent cache operations.
 */
var statsCacheLockPromise = null;
/**
 * Execute a function while holding the stats cache lock.
 * Only one operation can hold the lock at a time.
 */
function withStatsCacheLock(fn) {
    return __awaiter(this, void 0, void 0, function () {
        var releaseLock;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!statsCacheLockPromise) return [3 /*break*/, 2];
                    return [4 /*yield*/, statsCacheLockPromise];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 0];
                case 2:
                    statsCacheLockPromise = new Promise(function (resolve) {
                        releaseLock = resolve;
                    });
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, , 5, 6]);
                    return [4 /*yield*/, fn()];
                case 4: return [2 /*return*/, _a.sent()];
                case 5:
                    // Release the lock
                    statsCacheLockPromise = null;
                    releaseLock === null || releaseLock === void 0 ? void 0 : releaseLock();
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function getStatsCachePath() {
    return (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), STATS_CACHE_FILENAME);
}
function getEmptyCache() {
    return {
        version: exports.STATS_CACHE_VERSION,
        lastComputedDate: null,
        dailyActivity: [],
        dailyModelTokens: [],
        modelUsage: {},
        totalSessions: 0,
        totalMessages: 0,
        longestSession: null,
        firstSessionDate: null,
        hourCounts: {},
        totalSpeculationTimeSavedMs: 0,
        shotDistribution: {},
    };
}
/**
 * Migrate an older cache to the current schema.
 * Returns null if the version is unknown or too old to migrate.
 *
 * Preserves historical aggregates that would otherwise be lost when
 * transcript files have already aged out past cleanupPeriodDays.
 * Pre-migration days may undercount (e.g. v2 lacked subagent tokens);
 * we accept that rather than drop the history.
 */
function migrateStatsCache(parsed) {
    var _a, _b, _c, _d, _e, _f;
    if (typeof parsed.version !== 'number' ||
        parsed.version < MIN_MIGRATABLE_VERSION ||
        parsed.version > exports.STATS_CACHE_VERSION) {
        return null;
    }
    if (!Array.isArray(parsed.dailyActivity) ||
        !Array.isArray(parsed.dailyModelTokens) ||
        typeof parsed.totalSessions !== 'number' ||
        typeof parsed.totalMessages !== 'number') {
        return null;
    }
    return {
        version: exports.STATS_CACHE_VERSION,
        lastComputedDate: (_a = parsed.lastComputedDate) !== null && _a !== void 0 ? _a : null,
        dailyActivity: parsed.dailyActivity,
        dailyModelTokens: parsed.dailyModelTokens,
        modelUsage: (_b = parsed.modelUsage) !== null && _b !== void 0 ? _b : {},
        totalSessions: parsed.totalSessions,
        totalMessages: parsed.totalMessages,
        longestSession: (_c = parsed.longestSession) !== null && _c !== void 0 ? _c : null,
        firstSessionDate: (_d = parsed.firstSessionDate) !== null && _d !== void 0 ? _d : null,
        hourCounts: (_e = parsed.hourCounts) !== null && _e !== void 0 ? _e : {},
        totalSpeculationTimeSavedMs: (_f = parsed.totalSpeculationTimeSavedMs) !== null && _f !== void 0 ? _f : 0,
        // Preserve undefined (don't default to {}) so the SHOT_STATS recompute
        // check in loadStatsCache fires for v1/v2 caches that lacked this field.
        shotDistribution: parsed.shotDistribution,
    };
}
/**
 * Load the stats cache from disk.
 * Returns an empty cache if the file doesn't exist or is invalid.
 */
function loadStatsCache() {
    return __awaiter(this, void 0, void 0, function () {
        var fs, cachePath, content, parsed, migrated, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    cachePath = getStatsCachePath();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, fs.readFile(cachePath, { encoding: 'utf-8' })];
                case 2:
                    content = _a.sent();
                    parsed = (0, slowOperations_js_1.jsonParse)(content);
                    if (!(parsed.version !== exports.STATS_CACHE_VERSION)) return [3 /*break*/, 4];
                    migrated = migrateStatsCache(parsed);
                    if (!migrated) {
                        (0, debug_js_1.logForDebugging)("Stats cache version ".concat(parsed.version, " not migratable (expected ").concat(exports.STATS_CACHE_VERSION, "), returning empty cache"));
                        return [2 /*return*/, getEmptyCache()];
                    }
                    (0, debug_js_1.logForDebugging)("Migrated stats cache from v".concat(parsed.version, " to v").concat(exports.STATS_CACHE_VERSION));
                    // Persist migration so we don't re-migrate on every load.
                    // aggregateClaudeCodeStats() skips its save when lastComputedDate is
                    // already current, so without this the on-disk file stays at the old
                    // version indefinitely.
                    return [4 /*yield*/, saveStatsCache(migrated)];
                case 3:
                    // Persist migration so we don't re-migrate on every load.
                    // aggregateClaudeCodeStats() skips its save when lastComputedDate is
                    // already current, so without this the on-disk file stays at the old
                    // version indefinitely.
                    _a.sent();
                    if ((0, bun_bundle_1.feature)('SHOT_STATS') && !migrated.shotDistribution) {
                        (0, debug_js_1.logForDebugging)('Migrated stats cache missing shotDistribution, forcing recomputation');
                        return [2 /*return*/, getEmptyCache()];
                    }
                    return [2 /*return*/, migrated];
                case 4:
                    // Basic validation
                    if (!Array.isArray(parsed.dailyActivity) ||
                        !Array.isArray(parsed.dailyModelTokens) ||
                        typeof parsed.totalSessions !== 'number' ||
                        typeof parsed.totalMessages !== 'number') {
                        (0, debug_js_1.logForDebugging)('Stats cache has invalid structure, returning empty cache');
                        return [2 /*return*/, getEmptyCache()];
                    }
                    // If SHOT_STATS is enabled but cache doesn't have shotDistribution,
                    // force full recomputation to get historical shot data
                    if ((0, bun_bundle_1.feature)('SHOT_STATS') && !parsed.shotDistribution) {
                        (0, debug_js_1.logForDebugging)('Stats cache missing shotDistribution, forcing recomputation');
                        return [2 /*return*/, getEmptyCache()];
                    }
                    return [2 /*return*/, parsed];
                case 5:
                    error_1 = _a.sent();
                    (0, debug_js_1.logForDebugging)("Failed to load stats cache: ".concat((0, errors_js_1.errorMessage)(error_1)));
                    return [2 /*return*/, getEmptyCache()];
                case 6: return [2 /*return*/];
            }
        });
    });
}
/**
 * Save the stats cache to disk atomically.
 * Uses a temp file + rename pattern to prevent corruption.
 */
function saveStatsCache(cache) {
    return __awaiter(this, void 0, void 0, function () {
        var fs, cachePath, tempPath, configDir, _a, content, handle, error_2, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    cachePath = getStatsCachePath();
                    tempPath = "".concat(cachePath, ".").concat((0, crypto_1.randomBytes)(8).toString('hex'), ".tmp");
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 14, , 19]);
                    configDir = (0, envUtils_js_1.getClaudeConfigHomeDir)();
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, fs.mkdir(configDir)];
                case 3:
                    _c.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _a = _c.sent();
                    return [3 /*break*/, 5];
                case 5:
                    content = (0, slowOperations_js_1.jsonStringify)(cache, null, 2);
                    return [4 /*yield*/, (0, promises_1.open)(tempPath, 'w', 384)];
                case 6:
                    handle = _c.sent();
                    _c.label = 7;
                case 7:
                    _c.trys.push([7, , 10, 12]);
                    return [4 /*yield*/, handle.writeFile(content, { encoding: 'utf-8' })];
                case 8:
                    _c.sent();
                    return [4 /*yield*/, handle.sync()];
                case 9:
                    _c.sent();
                    return [3 /*break*/, 12];
                case 10: return [4 /*yield*/, handle.close()];
                case 11:
                    _c.sent();
                    return [7 /*endfinally*/];
                case 12: 
                // Atomic rename
                return [4 /*yield*/, fs.rename(tempPath, cachePath)];
                case 13:
                    // Atomic rename
                    _c.sent();
                    (0, debug_js_1.logForDebugging)("Stats cache saved successfully (lastComputedDate: ".concat(cache.lastComputedDate, ")"));
                    return [3 /*break*/, 19];
                case 14:
                    error_2 = _c.sent();
                    (0, log_js_1.logError)(error_2);
                    _c.label = 15;
                case 15:
                    _c.trys.push([15, 17, , 18]);
                    return [4 /*yield*/, fs.unlink(tempPath)];
                case 16:
                    _c.sent();
                    return [3 /*break*/, 18];
                case 17:
                    _b = _c.sent();
                    return [3 /*break*/, 18];
                case 18: return [3 /*break*/, 19];
                case 19: return [2 /*return*/];
            }
        });
    });
}
/**
 * Merge new stats into an existing cache.
 * Used when incrementally adding new days to the cache.
 */
function mergeCacheWithNewStats(existingCache, newStats, newLastComputedDate) {
    // Merge daily activity - combine by date
    var dailyActivityMap = new Map();
    for (var _i = 0, _a = existingCache.dailyActivity; _i < _a.length; _i++) {
        var day = _a[_i];
        dailyActivityMap.set(day.date, __assign({}, day));
    }
    for (var _b = 0, _c = newStats.dailyActivity; _b < _c.length; _b++) {
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
    // Merge daily model tokens - combine by date
    var dailyModelTokensMap = new Map();
    for (var _d = 0, _e = existingCache.dailyModelTokens; _d < _e.length; _d++) {
        var day = _e[_d];
        dailyModelTokensMap.set(day.date, __assign({}, day.tokensByModel));
    }
    for (var _f = 0, _g = newStats.dailyModelTokens; _f < _g.length; _f++) {
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
    // Merge model usage
    var modelUsage = __assign({}, existingCache.modelUsage);
    for (var _l = 0, _m = Object.entries(newStats.modelUsage); _l < _m.length; _l++) {
        var _o = _m[_l], model = _o[0], usage = _o[1];
        if (modelUsage[model]) {
            modelUsage[model] = {
                inputTokens: modelUsage[model].inputTokens + usage.inputTokens,
                outputTokens: modelUsage[model].outputTokens + usage.outputTokens,
                cacheReadInputTokens: modelUsage[model].cacheReadInputTokens + usage.cacheReadInputTokens,
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
    // Merge hour counts
    var hourCounts = __assign({}, existingCache.hourCounts);
    for (var _p = 0, _q = Object.entries(newStats.hourCounts); _p < _q.length; _p++) {
        var _r = _q[_p], hour = _r[0], count = _r[1];
        var hourNum = parseInt(hour, 10);
        hourCounts[hourNum] = (hourCounts[hourNum] || 0) + count;
    }
    // Update session aggregates
    var totalSessions = existingCache.totalSessions + newStats.sessionStats.length;
    var totalMessages = existingCache.totalMessages +
        newStats.sessionStats.reduce(function (sum, s) { return sum + s.messageCount; }, 0);
    // Find longest session (compare existing with new)
    var longestSession = existingCache.longestSession;
    for (var _s = 0, _t = newStats.sessionStats; _s < _t.length; _s++) {
        var session = _t[_s];
        if (!longestSession || session.duration > longestSession.duration) {
            longestSession = session;
        }
    }
    // Find first session date
    var firstSessionDate = existingCache.firstSessionDate;
    for (var _u = 0, _v = newStats.sessionStats; _u < _v.length; _u++) {
        var session = _v[_u];
        if (!firstSessionDate || session.timestamp < firstSessionDate) {
            firstSessionDate = session.timestamp;
        }
    }
    var result = {
        version: exports.STATS_CACHE_VERSION,
        lastComputedDate: newLastComputedDate,
        dailyActivity: Array.from(dailyActivityMap.values()).sort(function (a, b) {
            return a.date.localeCompare(b.date);
        }),
        dailyModelTokens: Array.from(dailyModelTokensMap.entries())
            .map(function (_a) {
            var date = _a[0], tokensByModel = _a[1];
            return ({ date: date, tokensByModel: tokensByModel });
        })
            .sort(function (a, b) { return a.date.localeCompare(b.date); }),
        modelUsage: modelUsage,
        totalSessions: totalSessions,
        totalMessages: totalMessages,
        longestSession: longestSession,
        firstSessionDate: firstSessionDate,
        hourCounts: hourCounts,
        totalSpeculationTimeSavedMs: existingCache.totalSpeculationTimeSavedMs +
            newStats.totalSpeculationTimeSavedMs,
    };
    if ((0, bun_bundle_1.feature)('SHOT_STATS')) {
        var shotDistribution = __assign({}, (existingCache.shotDistribution || {}));
        for (var _w = 0, _x = Object.entries(newStats.shotDistribution || {}); _w < _x.length; _w++) {
            var _y = _x[_w], count = _y[0], sessions = _y[1];
            var key = parseInt(count, 10);
            shotDistribution[key] = (shotDistribution[key] || 0) + sessions;
        }
        result.shotDistribution = shotDistribution;
    }
    return result;
}
/**
 * Extract the date portion (YYYY-MM-DD) from a Date object.
 */
function toDateString(date) {
    var parts = date.toISOString().split('T');
    var dateStr = parts[0];
    if (!dateStr) {
        throw new Error('Invalid ISO date string');
    }
    return dateStr;
}
/**
 * Get today's date in YYYY-MM-DD format.
 */
function getTodayDateString() {
    return toDateString(new Date());
}
/**
 * Get yesterday's date in YYYY-MM-DD format.
 */
function getYesterdayDateString() {
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return toDateString(yesterday);
}
/**
 * Check if a date string is before another date string.
 * Both should be in YYYY-MM-DD format.
 */
function isDateBefore(date1, date2) {
    return date1 < date2;
}
