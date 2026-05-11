"use strict";
/**
 * Provides ripgrep glob exclusion patterns for orphaned plugin versions.
 *
 * When plugin versions are updated, old versions are marked with a
 * `.orphaned_at` file but kept on disk for 7 days (since concurrent
 * sessions might still reference them). During this window, Grep/Glob
 * could return files from orphaned versions, causing Claude to use
 * outdated plugin code.
 *
 * We find `.orphaned_at` markers via a single ripgrep call and generate
 * `--glob '!<dir>/**'` patterns for their parent directories. The cache
 * is warmed in main.tsx AFTER cleanupOrphanedPluginVersionsInBackground
 * settles disk state. Once populated, the exclusion list is frozen for
 * the session unless /reload-plugins is called; subsequent disk mutations
 * (autoupdate, concurrent sessions) don't affect it.
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
exports.getGlobExclusionsForPluginCache = getGlobExclusionsForPluginCache;
exports.clearPluginCacheExclusions = clearPluginCacheExclusions;
var path_1 = require("path");
var ripgrep_js_1 = require("../ripgrep.js");
var pluginDirectories_js_1 = require("./pluginDirectories.js");
// Inlined from cacheUtils.ts to avoid a circular dep through commands.js.
var ORPHANED_AT_FILENAME = '.orphaned_at';
/** Session-scoped cache. Frozen once computed — only cleared by explicit /reload-plugins. */
var cachedExclusions = null;
/**
 * Get ripgrep glob exclusion patterns for orphaned plugin versions.
 *
 * @param searchPath - When provided, exclusions are only returned if the
 *   search overlaps the plugin cache directory (avoids unnecessary --glob
 *   args for searches outside the cache).
 *
 * Warmed eagerly in main.tsx after orphan GC; the lazy-compute path here
 * is a fallback. Best-effort: returns empty array if anything goes wrong.
 */
function getGlobExclusionsForPluginCache(searchPath) {
    return __awaiter(this, void 0, void 0, function () {
        var cachePath, markers, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    cachePath = (0, path_1.normalize)((0, path_1.join)((0, pluginDirectories_js_1.getPluginsDirectory)(), 'cache'));
                    if (searchPath && !pathsOverlap(searchPath, cachePath)) {
                        return [2 /*return*/, []];
                    }
                    if (cachedExclusions !== null) {
                        return [2 /*return*/, cachedExclusions];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, ripgrep_js_1.ripGrep)([
                            '--files',
                            '--hidden',
                            '--no-ignore',
                            '--max-depth',
                            '4',
                            '--glob',
                            ORPHANED_AT_FILENAME,
                        ], cachePath, new AbortController().signal)];
                case 2:
                    markers = _b.sent();
                    cachedExclusions = markers.map(function (markerPath) {
                        // ripgrep may return absolute or relative — normalize to relative.
                        var versionDir = (0, path_1.dirname)(markerPath);
                        var rel = (0, path_1.isAbsolute)(versionDir)
                            ? (0, path_1.relative)(cachePath, versionDir)
                            : versionDir;
                        // ripgrep glob patterns always use forward slashes, even on Windows
                        var posixRelative = rel.replace(/\\/g, '/');
                        return "!**/".concat(posixRelative, "/**");
                    });
                    return [2 /*return*/, cachedExclusions];
                case 3:
                    _a = _b.sent();
                    // Best-effort — don't break core search tools if ripgrep fails here
                    cachedExclusions = [];
                    return [2 /*return*/, cachedExclusions];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function clearPluginCacheExclusions() {
    cachedExclusions = null;
}
/**
 * One path is a prefix of the other. Special-cases root (normalize('/') + sep
 * = '//'). Case-insensitive on win32 since normalize() doesn't lowercase
 * drive letters and CLAUDE_CODE_PLUGIN_CACHE_DIR may disagree with resolved.
 */
function pathsOverlap(a, b) {
    var na = normalizeForCompare(a);
    var nb = normalizeForCompare(b);
    return (na === nb ||
        na === path_1.sep ||
        nb === path_1.sep ||
        na.startsWith(nb + path_1.sep) ||
        nb.startsWith(na + path_1.sep));
}
function normalizeForCompare(p) {
    var n = (0, path_1.normalize)(p);
    return process.platform === 'win32' ? n.toLowerCase() : n;
}
