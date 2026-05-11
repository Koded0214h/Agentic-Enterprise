"use strict";
/**
 * Plugin install counts data layer
 *
 * This module fetches and caches plugin install counts from the official
 * Claude plugins statistics repository. The cache is refreshed if older
 * than 24 hours.
 *
 * Cache location: ~/.claude/plugins/install-counts-cache.json
 */
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
exports.getInstallCounts = getInstallCounts;
exports.formatInstallCount = formatInstallCount;
var axios_1 = require("axios");
var crypto_1 = require("crypto");
var promises_1 = require("fs/promises");
var path_1 = require("path");
var debug_js_1 = require("../debug.js");
var errors_js_1 = require("../errors.js");
var fsOperations_js_1 = require("../fsOperations.js");
var log_js_1 = require("../log.js");
var slowOperations_js_1 = require("../slowOperations.js");
var fetchTelemetry_js_1 = require("./fetchTelemetry.js");
var pluginDirectories_js_1 = require("./pluginDirectories.js");
var INSTALL_COUNTS_CACHE_VERSION = 1;
var INSTALL_COUNTS_CACHE_FILENAME = 'install-counts-cache.json';
var INSTALL_COUNTS_URL = 'https://raw.githubusercontent.com/anthropics/claude-plugins-official/refs/heads/stats/stats/plugin-installs.json';
var CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
/**
 * Get the path to the install counts cache file
 */
function getInstallCountsCachePath() {
    return (0, path_1.join)((0, pluginDirectories_js_1.getPluginsDirectory)(), INSTALL_COUNTS_CACHE_FILENAME);
}
/**
 * Load the install counts cache from disk.
 * Returns null if the file doesn't exist, is invalid, or is stale (>24h old).
 */
function loadInstallCountsCache() {
    return __awaiter(this, void 0, void 0, function () {
        var cachePath, content, parsed, cache, fetchedAt, validCounts, now, error_1, code;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    cachePath = getInstallCountsCachePath();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readFile)(cachePath, { encoding: 'utf-8' })];
                case 2:
                    content = _a.sent();
                    parsed = (0, slowOperations_js_1.jsonParse)(content);
                    // Validate basic structure
                    if (typeof parsed !== 'object' ||
                        parsed === null ||
                        !('version' in parsed) ||
                        !('fetchedAt' in parsed) ||
                        !('counts' in parsed)) {
                        (0, debug_js_1.logForDebugging)('Install counts cache has invalid structure');
                        return [2 /*return*/, null];
                    }
                    cache = parsed;
                    // Validate version
                    if (cache.version !== INSTALL_COUNTS_CACHE_VERSION) {
                        (0, debug_js_1.logForDebugging)("Install counts cache version mismatch (got ".concat(cache.version, ", expected ").concat(INSTALL_COUNTS_CACHE_VERSION, ")"));
                        return [2 /*return*/, null];
                    }
                    // Validate fetchedAt and counts
                    if (typeof cache.fetchedAt !== 'string' || !Array.isArray(cache.counts)) {
                        (0, debug_js_1.logForDebugging)('Install counts cache has invalid structure');
                        return [2 /*return*/, null];
                    }
                    fetchedAt = new Date(cache.fetchedAt).getTime();
                    if (Number.isNaN(fetchedAt)) {
                        (0, debug_js_1.logForDebugging)('Install counts cache has invalid fetchedAt timestamp');
                        return [2 /*return*/, null];
                    }
                    validCounts = cache.counts.every(function (entry) {
                        return typeof entry === 'object' &&
                            entry !== null &&
                            typeof entry.plugin === 'string' &&
                            typeof entry.unique_installs === 'number';
                    });
                    if (!validCounts) {
                        (0, debug_js_1.logForDebugging)('Install counts cache has malformed entries');
                        return [2 /*return*/, null];
                    }
                    now = Date.now();
                    if (now - fetchedAt > CACHE_TTL_MS) {
                        (0, debug_js_1.logForDebugging)('Install counts cache is stale (>24h old)');
                        return [2 /*return*/, null];
                    }
                    // Return validated cache
                    return [2 /*return*/, {
                            version: cache.version,
                            fetchedAt: cache.fetchedAt,
                            counts: cache.counts,
                        }];
                case 3:
                    error_1 = _a.sent();
                    code = (0, errors_js_1.getErrnoCode)(error_1);
                    if (code !== 'ENOENT') {
                        (0, debug_js_1.logForDebugging)("Failed to load install counts cache: ".concat((0, errors_js_1.errorMessage)(error_1)));
                    }
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Save the install counts cache to disk atomically.
 * Uses a temp file + rename pattern to prevent corruption.
 */
function saveInstallCountsCache(cache) {
    return __awaiter(this, void 0, void 0, function () {
        var cachePath, tempPath, pluginsDir, content, error_2, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    cachePath = getInstallCountsCachePath();
                    tempPath = "".concat(cachePath, ".").concat((0, crypto_1.randomBytes)(8).toString('hex'), ".tmp");
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 5, , 10]);
                    pluginsDir = (0, pluginDirectories_js_1.getPluginsDirectory)();
                    return [4 /*yield*/, (0, fsOperations_js_1.getFsImplementation)().mkdir(pluginsDir)
                        // Write to temp file
                    ];
                case 2:
                    _b.sent();
                    content = (0, slowOperations_js_1.jsonStringify)(cache, null, 2);
                    return [4 /*yield*/, (0, promises_1.writeFile)(tempPath, content, {
                            encoding: 'utf-8',
                            mode: 384,
                        })
                        // Atomic rename
                    ];
                case 3:
                    _b.sent();
                    // Atomic rename
                    return [4 /*yield*/, (0, promises_1.rename)(tempPath, cachePath)];
                case 4:
                    // Atomic rename
                    _b.sent();
                    (0, debug_js_1.logForDebugging)('Install counts cache saved successfully');
                    return [3 /*break*/, 10];
                case 5:
                    error_2 = _b.sent();
                    (0, log_js_1.logError)(error_2);
                    _b.label = 6;
                case 6:
                    _b.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, (0, promises_1.unlink)(tempPath)];
                case 7:
                    _b.sent();
                    return [3 /*break*/, 9];
                case 8:
                    _a = _b.sent();
                    return [3 /*break*/, 9];
                case 9: return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
/**
 * Fetch install counts from GitHub stats repository
 */
function fetchInstallCountsFromGitHub() {
    return __awaiter(this, void 0, void 0, function () {
        var started, response, error_3;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    (0, debug_js_1.logForDebugging)("Fetching install counts from ".concat(INSTALL_COUNTS_URL));
                    started = performance.now();
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, axios_1.default.get(INSTALL_COUNTS_URL, {
                            timeout: 10000,
                        })];
                case 2:
                    response = _b.sent();
                    if (!((_a = response.data) === null || _a === void 0 ? void 0 : _a.plugins) || !Array.isArray(response.data.plugins)) {
                        throw new Error('Invalid response format from install counts API');
                    }
                    (0, fetchTelemetry_js_1.logPluginFetch)('install_counts', INSTALL_COUNTS_URL, 'success', performance.now() - started);
                    return [2 /*return*/, response.data.plugins];
                case 3:
                    error_3 = _b.sent();
                    (0, fetchTelemetry_js_1.logPluginFetch)('install_counts', INSTALL_COUNTS_URL, 'failure', performance.now() - started, (0, fetchTelemetry_js_1.classifyFetchError)(error_3));
                    throw error_3;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get plugin install counts as a Map.
 * Uses cached data if available and less than 24 hours old.
 * Returns null on errors so UI can hide counts rather than show misleading zeros.
 *
 * @returns Map of plugin ID (name@marketplace) to install count, or null if unavailable
 */
function getInstallCounts() {
    return __awaiter(this, void 0, void 0, function () {
        var cache, map, _i, _a, entry, counts, newCache, map, _b, counts_1, entry, error_4;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, loadInstallCountsCache()];
                case 1:
                    cache = _c.sent();
                    if (cache) {
                        (0, debug_js_1.logForDebugging)('Using cached install counts');
                        (0, fetchTelemetry_js_1.logPluginFetch)('install_counts', INSTALL_COUNTS_URL, 'cache_hit', 0);
                        map = new Map();
                        for (_i = 0, _a = cache.counts; _i < _a.length; _i++) {
                            entry = _a[_i];
                            map.set(entry.plugin, entry.unique_installs);
                        }
                        return [2 /*return*/, map];
                    }
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, fetchInstallCountsFromGitHub()
                        // Save to cache
                    ];
                case 3:
                    counts = _c.sent();
                    newCache = {
                        version: INSTALL_COUNTS_CACHE_VERSION,
                        fetchedAt: new Date().toISOString(),
                        counts: counts,
                    };
                    return [4 /*yield*/, saveInstallCountsCache(newCache)
                        // Convert to Map
                    ];
                case 4:
                    _c.sent();
                    map = new Map();
                    for (_b = 0, counts_1 = counts; _b < counts_1.length; _b++) {
                        entry = counts_1[_b];
                        map.set(entry.plugin, entry.unique_installs);
                    }
                    return [2 /*return*/, map];
                case 5:
                    error_4 = _c.sent();
                    // Log error and return null so UI can hide counts
                    (0, log_js_1.logError)(error_4);
                    (0, debug_js_1.logForDebugging)("Failed to fetch install counts: ".concat((0, errors_js_1.errorMessage)(error_4)));
                    return [2 /*return*/, null];
                case 6: return [2 /*return*/];
            }
        });
    });
}
/**
 * Format an install count for display.
 *
 * @param count - The raw install count
 * @returns Formatted string:
 *   - <1000: raw number (e.g., "42")
 *   - >=1000: K suffix with 1 decimal (e.g., "1.2K", "36.2K")
 *   - >=1000000: M suffix with 1 decimal (e.g., "1.2M")
 */
function formatInstallCount(count) {
    if (count < 1000) {
        return String(count);
    }
    if (count < 1000000) {
        var k = count / 1000;
        // Use toFixed(1) but remove trailing .0
        var formatted_1 = k.toFixed(1);
        return formatted_1.endsWith('.0')
            ? "".concat(formatted_1.slice(0, -2), "K")
            : "".concat(formatted_1, "K");
    }
    var m = count / 1000000;
    var formatted = m.toFixed(1);
    return formatted.endsWith('.0')
        ? "".concat(formatted.slice(0, -2), "M")
        : "".concat(formatted, "M");
}
