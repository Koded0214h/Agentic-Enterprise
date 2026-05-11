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
exports.parsePartialPath = parsePartialPath;
exports.scanDirectory = scanDirectory;
exports.getDirectoryCompletions = getDirectoryCompletions;
exports.clearDirectoryCache = clearDirectoryCache;
exports.isPathLikeToken = isPathLikeToken;
exports.scanDirectoryForPaths = scanDirectoryForPaths;
exports.getPathCompletions = getPathCompletions;
exports.clearPathCache = clearPathCache;
var lru_cache_1 = require("lru-cache");
var path_1 = require("path");
var cwd_js_1 = require("src/utils/cwd.js");
var fsOperations_js_1 = require("src/utils/fsOperations.js");
var log_js_1 = require("src/utils/log.js");
var path_js_1 = require("src/utils/path.js");
// Cache configuration
var CACHE_SIZE = 500;
var CACHE_TTL = 5 * 60 * 1000; // 5 minutes
// Initialize LRU cache for directory scans
var directoryCache = new lru_cache_1.LRUCache({
    max: CACHE_SIZE,
    ttl: CACHE_TTL,
});
// Initialize LRU cache for path scans (files and directories)
var pathCache = new lru_cache_1.LRUCache({
    max: CACHE_SIZE,
    ttl: CACHE_TTL,
});
/**
 * Parses a partial path into directory and prefix components
 */
function parsePartialPath(partialPath, basePath) {
    // Handle empty input
    if (!partialPath) {
        var directory_1 = basePath || (0, cwd_js_1.getCwd)();
        return { directory: directory_1, prefix: '' };
    }
    var resolved = (0, path_js_1.expandPath)(partialPath, basePath);
    // If path ends with separator, treat as directory with no prefix
    // Handle both forward slash and platform-specific separator
    if (partialPath.endsWith('/') || partialPath.endsWith(path_1.sep)) {
        return { directory: resolved, prefix: '' };
    }
    // Split into directory and prefix
    var directory = (0, path_1.dirname)(resolved);
    var prefix = (0, path_1.basename)(partialPath);
    return { directory: directory, prefix: prefix };
}
/**
 * Scans a directory and returns subdirectories
 * Uses LRU cache to avoid repeated filesystem calls
 */
function scanDirectory(dirPath) {
    return __awaiter(this, void 0, void 0, function () {
        var cached, fs, entries, directories, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    cached = directoryCache.get(dirPath);
                    if (cached) {
                        return [2 /*return*/, cached];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    return [4 /*yield*/, fs.readdir(dirPath)
                        // Filter for directories only, exclude hidden directories
                    ];
                case 2:
                    entries = _a.sent();
                    directories = entries
                        .filter(function (entry) { return entry.isDirectory() && !entry.name.startsWith('.'); })
                        .map(function (entry) { return ({
                        name: entry.name,
                        path: (0, path_1.join)(dirPath, entry.name),
                        type: 'directory',
                    }); })
                        .slice(0, 100) // Limit results for MVP
                    ;
                    // Cache the results
                    directoryCache.set(dirPath, directories);
                    return [2 /*return*/, directories];
                case 3:
                    error_1 = _a.sent();
                    (0, log_js_1.logError)(error_1);
                    return [2 /*return*/, []];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Main function to get directory completion suggestions
 */
function getDirectoryCompletions(partialPath_1) {
    return __awaiter(this, arguments, void 0, function (partialPath, options) {
        var _a, basePath, _b, maxResults, _c, directory, prefix, entries, prefixLower, matches;
        if (options === void 0) { options = {}; }
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _a = options.basePath, basePath = _a === void 0 ? (0, cwd_js_1.getCwd)() : _a, _b = options.maxResults, maxResults = _b === void 0 ? 10 : _b;
                    _c = parsePartialPath(partialPath, basePath), directory = _c.directory, prefix = _c.prefix;
                    return [4 /*yield*/, scanDirectory(directory)];
                case 1:
                    entries = _d.sent();
                    prefixLower = prefix.toLowerCase();
                    matches = entries
                        .filter(function (entry) { return entry.name.toLowerCase().startsWith(prefixLower); })
                        .slice(0, maxResults);
                    return [2 /*return*/, matches.map(function (entry) { return ({
                            id: entry.path,
                            displayText: entry.name + '/',
                            description: 'directory',
                            metadata: { type: 'directory' },
                        }); })];
            }
        });
    });
}
/**
 * Clears the directory cache
 */
function clearDirectoryCache() {
    directoryCache.clear();
}
/**
 * Checks if a string looks like a path (starts with path-like prefixes)
 */
function isPathLikeToken(token) {
    return (token.startsWith('~/') ||
        token.startsWith('/') ||
        token.startsWith('./') ||
        token.startsWith('../') ||
        token === '~' ||
        token === '.' ||
        token === '..');
}
/**
 * Scans a directory and returns both files and subdirectories
 * Uses LRU cache to avoid repeated filesystem calls
 */
function scanDirectoryForPaths(dirPath_1) {
    return __awaiter(this, arguments, void 0, function (dirPath, includeHidden) {
        var cacheKey, cached, fs, entries, paths, error_2;
        if (includeHidden === void 0) { includeHidden = false; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    cacheKey = "".concat(dirPath, ":").concat(includeHidden);
                    cached = pathCache.get(cacheKey);
                    if (cached) {
                        return [2 /*return*/, cached];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    return [4 /*yield*/, fs.readdir(dirPath)];
                case 2:
                    entries = _a.sent();
                    paths = entries
                        .filter(function (entry) { return includeHidden || !entry.name.startsWith('.'); })
                        .map(function (entry) { return ({
                        name: entry.name,
                        path: (0, path_1.join)(dirPath, entry.name),
                        type: entry.isDirectory() ? 'directory' : 'file',
                    }); })
                        .sort(function (a, b) {
                        // Sort directories first, then alphabetically
                        if (a.type === 'directory' && b.type !== 'directory')
                            return -1;
                        if (a.type !== 'directory' && b.type === 'directory')
                            return 1;
                        return a.name.localeCompare(b.name);
                    })
                        .slice(0, 100);
                    pathCache.set(cacheKey, paths);
                    return [2 /*return*/, paths];
                case 3:
                    error_2 = _a.sent();
                    (0, log_js_1.logError)(error_2);
                    return [2 /*return*/, []];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get path completion suggestions for files and directories
 */
function getPathCompletions(partialPath_1) {
    return __awaiter(this, arguments, void 0, function (partialPath, options) {
        var _a, basePath, _b, maxResults, _c, includeFiles, _d, includeHidden, _e, directory, prefix, entries, prefixLower, matches, hasSeparator, dirPortion, lastSlash, lastSep, lastSeparatorPos;
        if (options === void 0) { options = {}; }
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    _a = options.basePath, basePath = _a === void 0 ? (0, cwd_js_1.getCwd)() : _a, _b = options.maxResults, maxResults = _b === void 0 ? 10 : _b, _c = options.includeFiles, includeFiles = _c === void 0 ? true : _c, _d = options.includeHidden, includeHidden = _d === void 0 ? false : _d;
                    _e = parsePartialPath(partialPath, basePath), directory = _e.directory, prefix = _e.prefix;
                    return [4 /*yield*/, scanDirectoryForPaths(directory, includeHidden)];
                case 1:
                    entries = _f.sent();
                    prefixLower = prefix.toLowerCase();
                    matches = entries
                        .filter(function (entry) {
                        if (!includeFiles && entry.type === 'file')
                            return false;
                        return entry.name.toLowerCase().startsWith(prefixLower);
                    })
                        .slice(0, maxResults);
                    hasSeparator = partialPath.includes('/') || partialPath.includes(path_1.sep);
                    dirPortion = '';
                    if (hasSeparator) {
                        lastSlash = partialPath.lastIndexOf('/');
                        lastSep = partialPath.lastIndexOf(path_1.sep);
                        lastSeparatorPos = Math.max(lastSlash, lastSep);
                        dirPortion = partialPath.substring(0, lastSeparatorPos + 1);
                    }
                    if (dirPortion.startsWith('./') || dirPortion.startsWith('.' + path_1.sep)) {
                        dirPortion = dirPortion.slice(2);
                    }
                    return [2 /*return*/, matches.map(function (entry) {
                            var fullPath = dirPortion + entry.name;
                            return {
                                id: fullPath,
                                displayText: entry.type === 'directory' ? fullPath + '/' : fullPath,
                                metadata: { type: entry.type },
                            };
                        })];
            }
        });
    });
}
/**
 * Clears both directory and path caches
 */
function clearPathCache() {
    directoryCache.clear();
    pathCache.clear();
}
