"use strict";
/**
 * Pure-TypeScript port of vendor/file-index-src (Rust NAPI module).
 *
 * The native module wraps nucleo (https://github.com/helix-editor/nucleo) for
 * high-performance fuzzy file searching. This port reimplements the same API
 * and scoring behavior without native dependencies.
 *
 * Key API:
 *   new FileIndex()
 *   .loadFromFileList(fileList: string[]): void   — dedupe + index paths
 *   .search(query: string, limit: number): SearchResult[]
 *
 * Score semantics: lower = better. Score is position-in-results / result-count,
 * so the best match is 0.0. Paths containing "test" get a 1.05× penalty (capped
 * at 1.0) so non-test files rank slightly higher.
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
exports.CHUNK_MS = exports.FileIndex = void 0;
exports.yieldToEventLoop = yieldToEventLoop;
// nucleo-style scoring constants (approximating fzf-v2 / nucleo bonuses)
var SCORE_MATCH = 16;
var BONUS_BOUNDARY = 8;
var BONUS_CAMEL = 6;
var BONUS_CONSECUTIVE = 4;
var BONUS_FIRST_CHAR = 8;
var PENALTY_GAP_START = 3;
var PENALTY_GAP_EXTENSION = 1;
var TOP_LEVEL_CACHE_LIMIT = 100;
var MAX_QUERY_LEN = 64;
// Yield to event loop after this many ms of sync work. Chunk sizes are
// time-based (not count-based) so slow machines get smaller chunks and
// stay responsive — 5k paths is ~2ms on M-series but could be 15ms+ on
// older Windows hardware.
var CHUNK_MS = 4;
exports.CHUNK_MS = CHUNK_MS;
// Reusable buffer: records where each needle char matched during the indexOf scan
var posBuf = new Int32Array(MAX_QUERY_LEN);
var FileIndex = /** @class */ (function () {
    function FileIndex() {
        this.paths = [];
        this.lowerPaths = [];
        this.charBits = new Int32Array(0);
        this.pathLens = new Uint16Array(0);
        this.topLevelCache = null;
        // During async build, tracks how many paths have bitmap/lowerPath filled.
        // search() uses this to search the ready prefix while build continues.
        this.readyCount = 0;
    }
    /**
     * Load paths from an array of strings.
     * This is the main way to populate the index — ripgrep collects files, we just search them.
     * Automatically deduplicates paths.
     */
    FileIndex.prototype.loadFromFileList = function (fileList) {
        // Deduplicate and filter empty strings (matches Rust HashSet behavior)
        var seen = new Set();
        var paths = [];
        for (var _i = 0, fileList_1 = fileList; _i < fileList_1.length; _i++) {
            var line = fileList_1[_i];
            if (line.length > 0 && !seen.has(line)) {
                seen.add(line);
                paths.push(line);
            }
        }
        this.buildIndex(paths);
    };
    /**
     * Async variant: yields to the event loop every ~8–12k paths so large
     * indexes (270k+ files) don't block the main thread for >10ms at a time.
     * Identical result to loadFromFileList.
     *
     * Returns { queryable, done }:
     *   - queryable: resolves as soon as the first chunk is indexed (search
     *     returns partial results). For a 270k-path list this is ~5–10ms of
     *     sync work after the paths array is available.
     *   - done: resolves when the entire index is built.
     */
    FileIndex.prototype.loadFromFileListAsync = function (fileList) {
        var markQueryable = function () { };
        var queryable = new Promise(function (resolve) {
            markQueryable = resolve;
        });
        var done = this.buildAsync(fileList, markQueryable);
        return { queryable: queryable, done: done };
    };
    FileIndex.prototype.buildAsync = function (fileList, markQueryable) {
        return __awaiter(this, void 0, void 0, function () {
            var seen, paths, chunkStart, i, line, firstChunk, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        seen = new Set();
                        paths = [];
                        chunkStart = performance.now();
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < fileList.length)) return [3 /*break*/, 4];
                        line = fileList[i];
                        if (line.length > 0 && !seen.has(line)) {
                            seen.add(line);
                            paths.push(line);
                        }
                        if (!((i & 0xff) === 0xff && performance.now() - chunkStart > CHUNK_MS)) return [3 /*break*/, 3];
                        return [4 /*yield*/, yieldToEventLoop()];
                    case 2:
                        _a.sent();
                        chunkStart = performance.now();
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        this.resetArrays(paths);
                        chunkStart = performance.now();
                        firstChunk = true;
                        i = 0;
                        _a.label = 5;
                    case 5:
                        if (!(i < paths.length)) return [3 /*break*/, 8];
                        this.indexPath(i);
                        if (!((i & 0xff) === 0xff && performance.now() - chunkStart > CHUNK_MS)) return [3 /*break*/, 7];
                        this.readyCount = i + 1;
                        if (firstChunk) {
                            markQueryable();
                            firstChunk = false;
                        }
                        return [4 /*yield*/, yieldToEventLoop()];
                    case 6:
                        _a.sent();
                        chunkStart = performance.now();
                        _a.label = 7;
                    case 7:
                        i++;
                        return [3 /*break*/, 5];
                    case 8:
                        this.readyCount = paths.length;
                        markQueryable();
                        return [2 /*return*/];
                }
            });
        });
    };
    FileIndex.prototype.buildIndex = function (paths) {
        this.resetArrays(paths);
        for (var i = 0; i < paths.length; i++) {
            this.indexPath(i);
        }
        this.readyCount = paths.length;
    };
    FileIndex.prototype.resetArrays = function (paths) {
        var n = paths.length;
        this.paths = paths;
        this.lowerPaths = new Array(n);
        this.charBits = new Int32Array(n);
        this.pathLens = new Uint16Array(n);
        this.readyCount = 0;
        this.topLevelCache = computeTopLevelEntries(paths, TOP_LEVEL_CACHE_LIMIT);
    };
    // Precompute: lowercase, a–z bitmap, length. Bitmap gives O(1) rejection
    // of paths missing any needle letter (89% survival for broad queries like
    // "test" → still a 10%+ free win; 90%+ rejection for rare chars).
    FileIndex.prototype.indexPath = function (i) {
        var lp = this.paths[i].toLowerCase();
        this.lowerPaths[i] = lp;
        var len = lp.length;
        this.pathLens[i] = len;
        var bits = 0;
        for (var j = 0; j < len; j++) {
            var c = lp.charCodeAt(j);
            if (c >= 97 && c <= 122)
                bits |= 1 << (c - 97);
        }
        this.charBits[i] = bits;
    };
    /**
     * Search for files matching the query using fuzzy matching.
     * Returns top N results sorted by match score.
     */
    FileIndex.prototype.search = function (query, limit) {
        if (limit <= 0)
            return [];
        if (query.length === 0) {
            if (this.topLevelCache) {
                return this.topLevelCache.slice(0, limit);
            }
            return [];
        }
        // Smart case: lowercase query → case-insensitive; any uppercase → case-sensitive
        var caseSensitive = query !== query.toLowerCase();
        var needle = caseSensitive ? query : query.toLowerCase();
        var nLen = Math.min(needle.length, MAX_QUERY_LEN);
        var needleChars = new Array(nLen);
        var needleBitmap = 0;
        for (var j = 0; j < nLen; j++) {
            var ch = needle.charAt(j);
            needleChars[j] = ch;
            var cc = ch.charCodeAt(0);
            if (cc >= 97 && cc <= 122)
                needleBitmap |= 1 << (cc - 97);
        }
        // Upper bound on score assuming every match gets the max boundary bonus.
        // Used to reject paths whose gap penalties alone make them unable to beat
        // the current top-k threshold, before the charCodeAt-heavy boundary pass.
        var scoreCeiling = nLen * (SCORE_MATCH + BONUS_BOUNDARY) + BONUS_FIRST_CHAR + 32;
        // Top-k: maintain a sorted-ascending array of the best `limit` matches.
        // Avoids O(n log n) sort of all matches when we only need `limit` of them.
        var topK = [];
        var threshold = -Infinity;
        var _a = this, paths = _a.paths, lowerPaths = _a.lowerPaths, charBits = _a.charBits, pathLens = _a.pathLens, readyCount = _a.readyCount;
        outer: for (var i = 0; i < readyCount; i++) {
            // O(1) bitmap reject: path must contain every letter in the needle
            if ((charBits[i] & needleBitmap) !== needleBitmap)
                continue;
            var haystack = caseSensitive ? paths[i] : lowerPaths[i];
            // Fused indexOf scan: find positions (SIMD-accelerated in JSC/V8) AND
            // accumulate gap/consecutive terms inline. The greedy-earliest positions
            // found here are identical to what the charCodeAt scorer would find, so
            // we score directly from them — no second scan.
            var pos = haystack.indexOf(needleChars[0]);
            if (pos === -1)
                continue;
            posBuf[0] = pos;
            var gapPenalty = 0;
            var consecBonus = 0;
            var prev = pos;
            for (var j = 1; j < nLen; j++) {
                pos = haystack.indexOf(needleChars[j], prev + 1);
                if (pos === -1)
                    continue outer;
                posBuf[j] = pos;
                var gap = pos - prev - 1;
                if (gap === 0)
                    consecBonus += BONUS_CONSECUTIVE;
                else
                    gapPenalty += PENALTY_GAP_START + gap * PENALTY_GAP_EXTENSION;
                prev = pos;
            }
            // Gap-bound reject: if the best-case score (all boundary bonuses) minus
            // known gap penalties can't beat threshold, skip the boundary pass.
            if (topK.length === limit &&
                scoreCeiling + consecBonus - gapPenalty <= threshold) {
                continue;
            }
            // Boundary/camelCase scoring: check the char before each match position.
            var path = paths[i];
            var hLen = pathLens[i];
            var score = nLen * SCORE_MATCH + consecBonus - gapPenalty;
            score += scoreBonusAt(path, posBuf[0], true);
            for (var j = 1; j < nLen; j++) {
                score += scoreBonusAt(path, posBuf[j], false);
            }
            score += Math.max(0, 32 - (hLen >> 2));
            if (topK.length < limit) {
                topK.push({ path: path, fuzzScore: score });
                if (topK.length === limit) {
                    topK.sort(function (a, b) { return a.fuzzScore - b.fuzzScore; });
                    threshold = topK[0].fuzzScore;
                }
            }
            else if (score > threshold) {
                var lo = 0;
                var hi = topK.length;
                while (lo < hi) {
                    var mid = (lo + hi) >> 1;
                    if (topK[mid].fuzzScore < score)
                        lo = mid + 1;
                    else
                        hi = mid;
                }
                topK.splice(lo, 0, { path: path, fuzzScore: score });
                topK.shift();
                threshold = topK[0].fuzzScore;
            }
        }
        // topK is ascending; reverse to descending (best first)
        topK.sort(function (a, b) { return b.fuzzScore - a.fuzzScore; });
        var matchCount = topK.length;
        var denom = Math.max(matchCount, 1);
        var results = new Array(matchCount);
        for (var i = 0; i < matchCount; i++) {
            var path = topK[i].path;
            var positionScore = i / denom;
            var finalScore = path.includes('test')
                ? Math.min(positionScore * 1.05, 1.0)
                : positionScore;
            results[i] = { path: path, score: finalScore };
        }
        return results;
    };
    return FileIndex;
}());
exports.FileIndex = FileIndex;
/**
 * Boundary/camelCase bonus for a match at position `pos` in the original-case
 * path. `first` enables the start-of-string bonus (only for needle[0]).
 */
function scoreBonusAt(path, pos, first) {
    if (pos === 0)
        return first ? BONUS_FIRST_CHAR : 0;
    var prevCh = path.charCodeAt(pos - 1);
    if (isBoundary(prevCh))
        return BONUS_BOUNDARY;
    if (isLower(prevCh) && isUpper(path.charCodeAt(pos)))
        return BONUS_CAMEL;
    return 0;
}
function isBoundary(code) {
    // / \ - _ . space
    return (code === 47 || // /
        code === 92 || // \
        code === 45 || // -
        code === 95 || // _
        code === 46 || // .
        code === 32 // space
    );
}
function isLower(code) {
    return code >= 97 && code <= 122;
}
function isUpper(code) {
    return code >= 65 && code <= 90;
}
function yieldToEventLoop() {
    return new Promise(function (resolve) { return setImmediate(resolve); });
}
/**
 * Extract unique top-level path segments, sorted by (length asc, then alpha asc).
 * Handles both Unix (/) and Windows (\) path separators.
 * Mirrors FileIndex::compute_top_level_entries in lib.rs.
 */
function computeTopLevelEntries(paths, limit) {
    var topLevel = new Set();
    for (var _i = 0, paths_1 = paths; _i < paths_1.length; _i++) {
        var p = paths_1[_i];
        // Split on first / or \ separator
        var end = p.length;
        for (var i = 0; i < p.length; i++) {
            var c = p.charCodeAt(i);
            if (c === 47 || c === 92) {
                end = i;
                break;
            }
        }
        var segment = p.slice(0, end);
        if (segment.length > 0) {
            topLevel.add(segment);
            if (topLevel.size >= limit)
                break;
        }
    }
    var sorted = Array.from(topLevel);
    sorted.sort(function (a, b) {
        var lenDiff = a.length - b.length;
        if (lenDiff !== 0)
            return lenDiff;
        return a < b ? -1 : a > b ? 1 : 0;
    });
    return sorted.slice(0, limit).map(function (path) { return ({ path: path, score: 0.0 }); });
}
exports.default = FileIndex;
