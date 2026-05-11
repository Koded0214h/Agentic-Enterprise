"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileReadCache = void 0;
var file_js_1 = require("./file.js");
var fsOperations_js_1 = require("./fsOperations.js");
/**
 * A simple in-memory cache for file contents with automatic invalidation based on modification time.
 * This eliminates redundant file reads in FileEditTool operations.
 */
var FileReadCache = /** @class */ (function () {
    function FileReadCache() {
        this.cache = new Map();
        this.maxCacheSize = 1000;
    }
    /**
     * Reads a file with caching. Returns both content and encoding.
     * Cache key includes file path and modification time for automatic invalidation.
     */
    FileReadCache.prototype.readFile = function (filePath) {
        var fs = (0, fsOperations_js_1.getFsImplementation)();
        // Get file stats for cache invalidation
        var stats;
        try {
            stats = fs.statSync(filePath);
        }
        catch (error) {
            // File was deleted, remove from cache and re-throw
            this.cache.delete(filePath);
            throw error;
        }
        var cacheKey = filePath;
        var cachedData = this.cache.get(cacheKey);
        // Check if we have valid cached data
        if (cachedData && cachedData.mtime === stats.mtimeMs) {
            return {
                content: cachedData.content,
                encoding: cachedData.encoding,
            };
        }
        // Cache miss or stale data - read the file
        var encoding = (0, file_js_1.detectFileEncoding)(filePath);
        var content = fs
            .readFileSync(filePath, { encoding: encoding })
            .replaceAll('\r\n', '\n');
        // Update cache
        this.cache.set(cacheKey, {
            content: content,
            encoding: encoding,
            mtime: stats.mtimeMs,
        });
        // Evict oldest entries if cache is too large
        if (this.cache.size > this.maxCacheSize) {
            var firstKey = this.cache.keys().next().value;
            if (firstKey) {
                this.cache.delete(firstKey);
            }
        }
        return { content: content, encoding: encoding };
    };
    /**
     * Clears the entire cache. Useful for testing or memory management.
     */
    FileReadCache.prototype.clear = function () {
        this.cache.clear();
    };
    /**
     * Removes a specific file from the cache.
     */
    FileReadCache.prototype.invalidate = function (filePath) {
        this.cache.delete(filePath);
    };
    /**
     * Gets cache statistics for debugging/monitoring.
     */
    FileReadCache.prototype.getStats = function () {
        return {
            size: this.cache.size,
            entries: Array.from(this.cache.keys()),
        };
    };
    return FileReadCache;
}());
// Export a singleton instance
exports.fileReadCache = new FileReadCache();
