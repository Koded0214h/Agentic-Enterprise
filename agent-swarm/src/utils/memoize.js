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
exports.memoizeWithTTL = memoizeWithTTL;
exports.memoizeWithTTLAsync = memoizeWithTTLAsync;
exports.memoizeWithLRU = memoizeWithLRU;
var lru_cache_1 = require("lru-cache");
var log_js_1 = require("./log.js");
var slowOperations_js_1 = require("./slowOperations.js");
/**
 * Creates a memoized function that returns cached values while refreshing in parallel.
 * This implements a write-through cache pattern:
 * - If cache is fresh, return immediately
 * - If cache is stale, return the stale value but refresh it in the background
 * - If no cache exists, block and compute the value
 *
 * @param f The function to memoize
 * @param cacheLifetimeMs The lifetime of cached values in milliseconds
 * @returns A memoized version of the function
 */
function memoizeWithTTL(f, cacheLifetimeMs) {
    if (cacheLifetimeMs === void 0) { cacheLifetimeMs = 5 * 60 * 1000; }
    var cache = new Map();
    var memoized = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var key = (0, slowOperations_js_1.jsonStringify)(args);
        var cached = cache.get(key);
        var now = Date.now();
        // Populate cache
        if (!cached) {
            var value = f.apply(void 0, args);
            cache.set(key, {
                value: value,
                timestamp: now,
                refreshing: false,
            });
            return value;
        }
        // If we have a stale cache entry and it's not already refreshing
        if (cached &&
            now - cached.timestamp > cacheLifetimeMs &&
            !cached.refreshing) {
            // Mark as refreshing to prevent multiple parallel refreshes
            cached.refreshing = true;
            // Schedule async refresh (non-blocking). Both .then and .catch are
            // identity-guarded: a concurrent cache.clear() + cold-miss stores a
            // newer entry while this microtask is queued. .then overwriting with
            // the stale refresh's result is worse than .catch deleting (persists
            // wrong data for full TTL vs. self-correcting on next call).
            Promise.resolve()
                .then(function () {
                var newValue = f.apply(void 0, args);
                if (cache.get(key) === cached) {
                    cache.set(key, {
                        value: newValue,
                        timestamp: Date.now(),
                        refreshing: false,
                    });
                }
            })
                .catch(function (e) {
                (0, log_js_1.logError)(e);
                if (cache.get(key) === cached) {
                    cache.delete(key);
                }
            });
            // Return the stale value immediately
            return cached.value;
        }
        return cache.get(key).value;
    };
    // Add cache clear method
    memoized.cache = {
        clear: function () { return cache.clear(); },
    };
    return memoized;
}
/**
 * Creates a memoized async function that returns cached values while refreshing in parallel.
 * This implements a write-through cache pattern for async functions:
 * - If cache is fresh, return immediately
 * - If cache is stale, return the stale value but refresh it in the background
 * - If no cache exists, block and compute the value
 *
 * @param f The async function to memoize
 * @param cacheLifetimeMs The lifetime of cached values in milliseconds
 * @returns A memoized version of the async function
 */
function memoizeWithTTLAsync(f, cacheLifetimeMs) {
    var _this = this;
    if (cacheLifetimeMs === void 0) { cacheLifetimeMs = 5 * 60 * 1000; }
    var cache = new Map();
    // In-flight cold-miss dedup. The old memoizeWithTTL (sync) accidentally
    // provided this: it stored the Promise synchronously before the first
    // await, so concurrent callers shared one f() invocation. This async
    // variant awaits before cache.set, so concurrent cold-miss callers would
    // each invoke f() independently without this map. For
    // refreshAndGetAwsCredentials that means N concurrent `aws sso login`
    // spawns. Same pattern as pending401Handlers in auth.ts:1171.
    var inFlight = new Map();
    var memoized = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return __awaiter(_this, void 0, void 0, function () {
            var key, cached, now, pending, promise, result, staleEntry_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        key = (0, slowOperations_js_1.jsonStringify)(args);
                        cached = cache.get(key);
                        now = Date.now();
                        if (!!cached) return [3 /*break*/, 4];
                        pending = inFlight.get(key);
                        if (pending)
                            return [2 /*return*/, pending];
                        promise = f.apply(void 0, args);
                        inFlight.set(key, promise);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 4]);
                        return [4 /*yield*/, promise
                            // Identity-guard: cache.clear() during the await should discard this
                            // result (clear intent is to invalidate). If we're still in-flight,
                            // store it. clear() wipes inFlight too, so this check catches that.
                        ];
                    case 2:
                        result = _a.sent();
                        // Identity-guard: cache.clear() during the await should discard this
                        // result (clear intent is to invalidate). If we're still in-flight,
                        // store it. clear() wipes inFlight too, so this check catches that.
                        if (inFlight.get(key) === promise) {
                            cache.set(key, {
                                value: result,
                                timestamp: now,
                                refreshing: false,
                            });
                        }
                        return [2 /*return*/, result];
                    case 3:
                        if (inFlight.get(key) === promise) {
                            inFlight.delete(key);
                        }
                        return [7 /*endfinally*/];
                    case 4:
                        // If we have a stale cache entry and it's not already refreshing
                        if (cached &&
                            now - cached.timestamp > cacheLifetimeMs &&
                            !cached.refreshing) {
                            // Mark as refreshing to prevent multiple parallel refreshes
                            cached.refreshing = true;
                            staleEntry_1 = cached;
                            f.apply(void 0, args).then(function (newValue) {
                                if (cache.get(key) === staleEntry_1) {
                                    cache.set(key, {
                                        value: newValue,
                                        timestamp: Date.now(),
                                        refreshing: false,
                                    });
                                }
                            })
                                .catch(function (e) {
                                (0, log_js_1.logError)(e);
                                if (cache.get(key) === staleEntry_1) {
                                    cache.delete(key);
                                }
                            });
                            // Return the stale value immediately
                            return [2 /*return*/, cached.value];
                        }
                        return [2 /*return*/, cache.get(key).value];
                }
            });
        });
    };
    // Add cache clear method. Also clear inFlight: clear() during a cold-miss
    // await should not let the stale in-flight promise be returned to the next
    // caller (defeats the purpose of clear). The try/finally above
    // identity-guards inFlight.delete so the stale promise doesn't delete a
    // fresh one if clear+cold-miss happens before the finally fires.
    memoized.cache = {
        clear: function () {
            cache.clear();
            inFlight.clear();
        },
    };
    return memoized;
}
/**
 * Creates a memoized function with LRU (Least Recently Used) eviction policy.
 * This prevents unbounded memory growth by evicting the least recently used entries
 * when the cache reaches its maximum size.
 *
 * Note: Cache size for memoized message processing functions
 * Chosen to prevent unbounded memory growth (was 300MB+ with lodash memoize)
 * while maintaining good cache hit rates for typical conversations.
 *
 * @param f The function to memoize
 * @returns A memoized version of the function with cache management methods
 */
function memoizeWithLRU(f, cacheFn, maxCacheSize) {
    if (maxCacheSize === void 0) { maxCacheSize = 100; }
    var cache = new lru_cache_1.LRUCache({
        max: maxCacheSize,
    });
    var memoized = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var key = cacheFn.apply(void 0, args);
        var cached = cache.get(key);
        if (cached !== undefined) {
            return cached;
        }
        var result = f.apply(void 0, args);
        cache.set(key, result);
        return result;
    };
    // Add cache management methods
    memoized.cache = {
        clear: function () { return cache.clear(); },
        size: function () { return cache.size; },
        delete: function (key) { return cache.delete(key); },
        // peek() avoids updating recency — we only want to observe, not promote
        get: function (key) { return cache.peek(key); },
        has: function (key) { return cache.has(key); },
    };
    return memoized;
}
