"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileStateCache = exports.READ_FILE_STATE_CACHE_SIZE = void 0;
exports.createFileStateCacheWithSizeLimit = createFileStateCacheWithSizeLimit;
exports.cacheToObject = cacheToObject;
exports.cacheKeys = cacheKeys;
exports.cloneFileStateCache = cloneFileStateCache;
exports.mergeFileStateCaches = mergeFileStateCaches;
var lru_cache_1 = require("lru-cache");
var path_1 = require("path");
// Default max entries for read file state caches
exports.READ_FILE_STATE_CACHE_SIZE = 100;
// Default size limit for file state caches (25MB)
// This prevents unbounded memory growth from large file contents
var DEFAULT_MAX_CACHE_SIZE_BYTES = 25 * 1024 * 1024;
/**
 * A file state cache that normalizes all path keys before access.
 * This ensures consistent cache hits regardless of whether callers pass
 * relative vs absolute paths with redundant segments (e.g. /foo/../bar)
 * or mixed path separators on Windows (/ vs \).
 */
var FileStateCache = /** @class */ (function () {
    function FileStateCache(maxEntries, maxSizeBytes) {
        this.cache = new lru_cache_1.LRUCache({
            max: maxEntries,
            maxSize: maxSizeBytes,
            sizeCalculation: function (value) { return Math.max(1, Buffer.byteLength(value.content)); },
        });
    }
    FileStateCache.prototype.get = function (key) {
        return this.cache.get((0, path_1.normalize)(key));
    };
    FileStateCache.prototype.set = function (key, value) {
        this.cache.set((0, path_1.normalize)(key), value);
        return this;
    };
    FileStateCache.prototype.has = function (key) {
        return this.cache.has((0, path_1.normalize)(key));
    };
    FileStateCache.prototype.delete = function (key) {
        return this.cache.delete((0, path_1.normalize)(key));
    };
    FileStateCache.prototype.clear = function () {
        this.cache.clear();
    };
    Object.defineProperty(FileStateCache.prototype, "size", {
        get: function () {
            return this.cache.size;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FileStateCache.prototype, "max", {
        get: function () {
            return this.cache.max;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FileStateCache.prototype, "maxSize", {
        get: function () {
            return this.cache.maxSize;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FileStateCache.prototype, "calculatedSize", {
        get: function () {
            return this.cache.calculatedSize;
        },
        enumerable: false,
        configurable: true
    });
    FileStateCache.prototype.keys = function () {
        return this.cache.keys();
    };
    FileStateCache.prototype.entries = function () {
        return this.cache.entries();
    };
    FileStateCache.prototype.dump = function () {
        return this.cache.dump();
    };
    FileStateCache.prototype.load = function (entries) {
        this.cache.load(entries);
    };
    return FileStateCache;
}());
exports.FileStateCache = FileStateCache;
/**
 * Factory function to create a size-limited FileStateCache.
 * Uses LRUCache's built-in size-based eviction to prevent memory bloat.
 * Note: Images are not cached (see FileReadTool) so size limit is mainly
 * for large text files, notebooks, and other editable content.
 */
function createFileStateCacheWithSizeLimit(maxEntries, maxSizeBytes) {
    if (maxSizeBytes === void 0) { maxSizeBytes = DEFAULT_MAX_CACHE_SIZE_BYTES; }
    return new FileStateCache(maxEntries, maxSizeBytes);
}
// Helper function to convert cache to object (used by compact.ts)
function cacheToObject(cache) {
    return Object.fromEntries(cache.entries());
}
// Helper function to get all keys from cache (used by several components)
function cacheKeys(cache) {
    return Array.from(cache.keys());
}
// Helper function to clone a FileStateCache
// Preserves size limit configuration from the source cache
function cloneFileStateCache(cache) {
    var cloned = createFileStateCacheWithSizeLimit(cache.max, cache.maxSize);
    cloned.load(cache.dump());
    return cloned;
}
// Merge two file state caches, with more recent entries (by timestamp) overriding older ones
function mergeFileStateCaches(first, second) {
    var merged = cloneFileStateCache(first);
    for (var _i = 0, _a = second.entries(); _i < _a.length; _i++) {
        var _b = _a[_i], filePath = _b[0], fileState = _b[1];
        var existing = merged.get(filePath);
        // Only override if the new entry is more recent
        if (!existing || fileState.timestamp > existing.timestamp) {
            merged.set(filePath, fileState);
        }
    }
    return merged;
}
