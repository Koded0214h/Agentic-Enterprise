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
exports.onIndexBuildComplete = void 0;
exports.clearFileSuggestionCaches = clearFileSuggestionCaches;
exports.pathListSignature = pathListSignature;
exports.getDirectoryNames = getDirectoryNames;
exports.getDirectoryNamesAsync = getDirectoryNamesAsync;
exports.getPathsForSuggestions = getPathsForSuggestions;
exports.findLongestCommonPrefix = findLongestCommonPrefix;
exports.startBackgroundCacheRefresh = startBackgroundCacheRefresh;
exports.generateFileSuggestions = generateFileSuggestions;
exports.applyFileSuggestion = applyFileSuggestion;
var fs_1 = require("fs");
var ignore_1 = require("ignore");
var path = require("path");
var markdownConfigLoader_js_1 = require("src/utils/markdownConfigLoader.js");
var index_js_1 = require("../native-ts/file-index/index.js");
var index_js_2 = require("../services/analytics/index.js");
var config_js_1 = require("../utils/config.js");
var cwd_js_1 = require("../utils/cwd.js");
var debug_js_1 = require("../utils/debug.js");
var errors_js_1 = require("../utils/errors.js");
var execFileNoThrow_js_1 = require("../utils/execFileNoThrow.js");
var fsOperations_js_1 = require("../utils/fsOperations.js");
var git_js_1 = require("../utils/git.js");
var hooks_js_1 = require("../utils/hooks.js");
var log_js_1 = require("../utils/log.js");
var path_js_1 = require("../utils/path.js");
var ripgrep_js_1 = require("../utils/ripgrep.js");
var settings_js_1 = require("../utils/settings/settings.js");
var signal_js_1 = require("../utils/signal.js");
// Lazily constructed singleton
var fileIndex = null;
function getFileIndex() {
    if (!fileIndex) {
        fileIndex = new index_js_1.FileIndex();
    }
    return fileIndex;
}
var fileListRefreshPromise = null;
// Signal fired when an in-progress index build completes. Lets the
// typeahead UI re-run its last search so partial results upgrade to full.
var indexBuildComplete = (0, signal_js_1.createSignal)();
exports.onIndexBuildComplete = indexBuildComplete.subscribe;
var cacheGeneration = 0;
// Background fetch for untracked files
var untrackedFetchPromise = null;
// Store tracked files so we can rebuild index with untracked
var cachedTrackedFiles = [];
// Store config files so mergeUntrackedIntoNormalizedCache preserves them
var cachedConfigFiles = [];
// Store tracked directories so mergeUntrackedIntoNormalizedCache doesn't
// recompute ~270k path.dirname() calls on each merge
var cachedTrackedDirs = [];
// Cache for .ignore/.rgignore patterns (keyed by repoRoot:cwd)
var ignorePatternsCache = null;
var ignorePatternsCacheKey = null;
// Throttle state for background refresh. .git/index mtime triggers an
// immediate refresh when tracked files change (add/checkout/commit/rm).
// The time floor still refreshes every 5s to pick up untracked files,
// which don't bump the index.
var lastRefreshMs = 0;
var lastGitIndexMtime = null;
// Signatures of the path lists loaded into the Rust index. Two separate
// signatures because the two loadFromFileList call sites use differently
// structured arrays — a shared signature would ping-pong and never match.
// Skips nucleo.restart() when git ls-files returns an unchanged list
// (e.g. `git add` of an already-tracked file bumps index mtime but not the list).
var loadedTrackedSignature = null;
var loadedMergedSignature = null;
/**
 * Clear all file suggestion caches.
 * Call this when resuming a session to ensure fresh file discovery.
 */
function clearFileSuggestionCaches() {
    fileIndex = null;
    fileListRefreshPromise = null;
    cacheGeneration++;
    untrackedFetchPromise = null;
    cachedTrackedFiles = [];
    cachedConfigFiles = [];
    cachedTrackedDirs = [];
    indexBuildComplete.clear();
    ignorePatternsCache = null;
    ignorePatternsCacheKey = null;
    lastRefreshMs = 0;
    lastGitIndexMtime = null;
    loadedTrackedSignature = null;
    loadedMergedSignature = null;
}
/**
 * Content hash of a path list. A length|first|last sample misses renames of
 * middle files (same length, same endpoints → stale entry stuck in nucleo).
 *
 * Samples every Nth path (plus length). On a 346k-path list this hashes ~700
 * paths instead of 14MB — enough to catch git operations (checkout, rebase,
 * add/rm) while running in <1ms. A single mid-list rename that happens to
 * fall between samples will miss the rebuild, but the 5s refresh floor picks
 * it up on the next cycle.
 */
function pathListSignature(paths) {
    var n = paths.length;
    var stride = Math.max(1, Math.floor(n / 500));
    var h = 0x811c9dc5 | 0;
    for (var i = 0; i < n; i += stride) {
        var p = paths[i];
        for (var j = 0; j < p.length; j++) {
            h = ((h ^ p.charCodeAt(j)) * 0x01000193) | 0;
        }
        h = (h * 0x01000193) | 0;
    }
    // Stride starts at 0 (first path always hashed); explicitly include last
    // so single-file add/rm at the tail is caught
    if (n > 0) {
        var last = paths[n - 1];
        for (var j = 0; j < last.length; j++) {
            h = ((h ^ last.charCodeAt(j)) * 0x01000193) | 0;
        }
    }
    return "".concat(n, ":").concat((h >>> 0).toString(16));
}
/**
 * Stat .git/index to detect git state changes without spawning git ls-files.
 * Returns null for worktrees (.git is a file → ENOTDIR), fresh repos with no
 * index yet (ENOENT), and non-git dirs — caller falls back to time throttle.
 */
function getGitIndexMtime() {
    var repoRoot = (0, git_js_1.findGitRoot)((0, cwd_js_1.getCwd)());
    if (!repoRoot)
        return null;
    try {
        // eslint-disable-next-line custom-rules/no-sync-fs -- mtimeMs is the operation here, not a pre-check. findGitRoot above already stat-walks synchronously; one more stat is marginal vs spawning git ls-files on every keystroke. Async would force startBackgroundCacheRefresh to become async, breaking the synchronous fileListRefreshPromise contract at the cold-start await site.
        return (0, fs_1.statSync)(path.join(repoRoot, '.git', 'index')).mtimeMs;
    }
    catch (_a) {
        return null;
    }
}
/**
 * Normalize git paths relative to originalCwd
 */
function normalizeGitPaths(files, repoRoot, originalCwd) {
    if (originalCwd === repoRoot) {
        return files;
    }
    return files.map(function (f) {
        var absolutePath = path.join(repoRoot, f);
        return path.relative(originalCwd, absolutePath);
    });
}
/**
 * Merge already-normalized untracked files into the cache
 */
function mergeUntrackedIntoNormalizedCache(normalizedUntracked) {
    return __awaiter(this, void 0, void 0, function () {
        var untrackedDirs, allPaths, sig;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (normalizedUntracked.length === 0)
                        return [2 /*return*/];
                    if (!fileIndex || cachedTrackedFiles.length === 0)
                        return [2 /*return*/];
                    return [4 /*yield*/, getDirectoryNamesAsync(normalizedUntracked)];
                case 1:
                    untrackedDirs = _a.sent();
                    allPaths = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], cachedTrackedFiles, true), cachedConfigFiles, true), cachedTrackedDirs, true), normalizedUntracked, true), untrackedDirs, true);
                    sig = pathListSignature(allPaths);
                    if (sig === loadedMergedSignature) {
                        (0, debug_js_1.logForDebugging)("[FileIndex] skipped index rebuild \u2014 merged paths unchanged");
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, fileIndex.loadFromFileListAsync(allPaths).done];
                case 2:
                    _a.sent();
                    loadedMergedSignature = sig;
                    (0, debug_js_1.logForDebugging)("[FileIndex] rebuilt index with ".concat(cachedTrackedFiles.length, " tracked + ").concat(normalizedUntracked.length, " untracked files"));
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Load ripgrep-specific ignore patterns from .ignore or .rgignore files
 * Returns an ignore instance if patterns were found, null otherwise
 * Results are cached per repoRoot:cwd combination
 */
function loadRipgrepIgnorePatterns(repoRoot, cwd) {
    return __awaiter(this, void 0, void 0, function () {
        var cacheKey, fs, ignoreFiles, directories, ig, hasPatterns, paths, contents, _i, _a, _b, i, content, result;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    cacheKey = "".concat(repoRoot, ":").concat(cwd);
                    // Return cached result if available
                    if (ignorePatternsCacheKey === cacheKey) {
                        return [2 /*return*/, ignorePatternsCache];
                    }
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    ignoreFiles = ['.ignore', '.rgignore'];
                    directories = __spreadArray([], new Set([repoRoot, cwd]), true);
                    ig = (0, ignore_1.default)();
                    hasPatterns = false;
                    paths = directories.flatMap(function (dir) {
                        return ignoreFiles.map(function (f) { return path.join(dir, f); });
                    });
                    return [4 /*yield*/, Promise.all(paths.map(function (p) { return fs.readFile(p, { encoding: 'utf8' }).catch(function () { return null; }); }))];
                case 1:
                    contents = _c.sent();
                    for (_i = 0, _a = contents.entries(); _i < _a.length; _i++) {
                        _b = _a[_i], i = _b[0], content = _b[1];
                        if (content === null)
                            continue;
                        ig.add(content);
                        hasPatterns = true;
                        (0, debug_js_1.logForDebugging)("[FileIndex] loaded ignore patterns from ".concat(paths[i]));
                    }
                    result = hasPatterns ? ig : null;
                    ignorePatternsCache = result;
                    ignorePatternsCacheKey = cacheKey;
                    return [2 /*return*/, result];
            }
        });
    });
}
/**
 * Get files using git ls-files (much faster than ripgrep for git repos)
 * Returns tracked files immediately, fetches untracked in background
 * @param respectGitignore If true, excludes gitignored files from untracked results
 *
 * Note: Unlike ripgrep --follow, git ls-files doesn't follow symlinks.
 * This is intentional as git tracks symlinks as symlinks.
 */
function getFilesUsingGit(abortSignal, respectGitignore) {
    return __awaiter(this, void 0, void 0, function () {
        var startTime, repoRoot, cwd_1, lsFilesStart, trackedResult, trackedFiles, normalizedTracked, ignorePatterns, beforeCount, duration, untrackedArgs, generation_1, error_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    startTime = Date.now();
                    (0, debug_js_1.logForDebugging)("[FileIndex] getFilesUsingGit called");
                    repoRoot = (0, git_js_1.findGitRoot)((0, cwd_js_1.getCwd)());
                    if (!repoRoot) {
                        (0, debug_js_1.logForDebugging)("[FileIndex] not a git repo, returning null");
                        return [2 /*return*/, null];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    cwd_1 = (0, cwd_js_1.getCwd)();
                    lsFilesStart = Date.now();
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), ['-c', 'core.quotepath=false', 'ls-files', '--recurse-submodules'], { timeout: 5000, abortSignal: abortSignal, cwd: repoRoot })];
                case 2:
                    trackedResult = _a.sent();
                    (0, debug_js_1.logForDebugging)("[FileIndex] git ls-files (tracked) took ".concat(Date.now() - lsFilesStart, "ms"));
                    if (trackedResult.code !== 0) {
                        (0, debug_js_1.logForDebugging)("[FileIndex] git ls-files failed (code=".concat(trackedResult.code, ", stderr=").concat(trackedResult.stderr, "), falling back to ripgrep"));
                        return [2 /*return*/, null];
                    }
                    trackedFiles = trackedResult.stdout.trim().split('\n').filter(Boolean);
                    normalizedTracked = normalizeGitPaths(trackedFiles, repoRoot, cwd_1);
                    return [4 /*yield*/, loadRipgrepIgnorePatterns(repoRoot, cwd_1)];
                case 3:
                    ignorePatterns = _a.sent();
                    if (ignorePatterns) {
                        beforeCount = normalizedTracked.length;
                        normalizedTracked = ignorePatterns.filter(normalizedTracked);
                        (0, debug_js_1.logForDebugging)("[FileIndex] applied ignore patterns: ".concat(beforeCount, " -> ").concat(normalizedTracked.length, " files"));
                    }
                    // Cache tracked files for later merge with untracked
                    cachedTrackedFiles = normalizedTracked;
                    duration = Date.now() - startTime;
                    (0, debug_js_1.logForDebugging)("[FileIndex] git ls-files: ".concat(normalizedTracked.length, " tracked files in ").concat(duration, "ms"));
                    (0, index_js_2.logEvent)('tengu_file_suggestions_git_ls_files', {
                        file_count: normalizedTracked.length,
                        tracked_count: normalizedTracked.length,
                        untracked_count: 0,
                        duration_ms: duration,
                    });
                    // Start background fetch for untracked files (don't await)
                    if (!untrackedFetchPromise) {
                        untrackedArgs = respectGitignore
                            ? [
                                '-c',
                                'core.quotepath=false',
                                'ls-files',
                                '--others',
                                '--exclude-standard',
                            ]
                            : ['-c', 'core.quotepath=false', 'ls-files', '--others'];
                        generation_1 = cacheGeneration;
                        untrackedFetchPromise = (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), untrackedArgs, {
                            timeout: 10000,
                            cwd: repoRoot,
                        })
                            .then(function (untrackedResult) { return __awaiter(_this, void 0, void 0, function () {
                            var rawUntrackedFiles, normalizedUntracked, ignorePatterns_1, beforeCount;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (generation_1 !== cacheGeneration) {
                                            return [2 /*return*/]; // Cache was cleared; don't merge stale untracked files
                                        }
                                        if (!(untrackedResult.code === 0)) return [3 /*break*/, 2];
                                        rawUntrackedFiles = untrackedResult.stdout
                                            .trim()
                                            .split('\n')
                                            .filter(Boolean);
                                        normalizedUntracked = normalizeGitPaths(rawUntrackedFiles, repoRoot, cwd_1);
                                        return [4 /*yield*/, loadRipgrepIgnorePatterns(repoRoot, cwd_1)];
                                    case 1:
                                        ignorePatterns_1 = _a.sent();
                                        if (ignorePatterns_1 && normalizedUntracked.length > 0) {
                                            beforeCount = normalizedUntracked.length;
                                            normalizedUntracked = ignorePatterns_1.filter(normalizedUntracked);
                                            (0, debug_js_1.logForDebugging)("[FileIndex] applied ignore patterns to untracked: ".concat(beforeCount, " -> ").concat(normalizedUntracked.length, " files"));
                                        }
                                        (0, debug_js_1.logForDebugging)("[FileIndex] background untracked fetch: ".concat(normalizedUntracked.length, " files"));
                                        // Pass already-normalized files directly to merge function
                                        void mergeUntrackedIntoNormalizedCache(normalizedUntracked);
                                        _a.label = 2;
                                    case 2: return [2 /*return*/];
                                }
                            });
                        }); })
                            .catch(function (error) {
                            (0, debug_js_1.logForDebugging)("[FileIndex] background untracked fetch failed: ".concat(error));
                        })
                            .finally(function () {
                            untrackedFetchPromise = null;
                        });
                    }
                    return [2 /*return*/, normalizedTracked];
                case 4:
                    error_1 = _a.sent();
                    (0, debug_js_1.logForDebugging)("[FileIndex] git ls-files error: ".concat((0, errors_js_1.errorMessage)(error_1)));
                    return [2 /*return*/, null];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * This function collects all parent directories for each file path
 * and returns a list of unique directory names with a trailing separator.
 * For example, if the input is ['src/index.js', 'src/utils/helpers.js'],
 * the output will be ['src/', 'src/utils/'].
 * @param files An array of file paths
 * @returns An array of unique directory names with a trailing separator
 */
function getDirectoryNames(files) {
    var directoryNames = new Set();
    collectDirectoryNames(files, 0, files.length, directoryNames);
    return __spreadArray([], directoryNames, true).map(function (d) { return d + path.sep; });
}
/**
 * Async variant: yields every ~10k files so 270k+ file lists don't block
 * the main thread for >10ms at a time.
 */
function getDirectoryNamesAsync(files) {
    return __awaiter(this, void 0, void 0, function () {
        var directoryNames, chunkStart, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    directoryNames = new Set();
                    chunkStart = performance.now();
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < files.length)) return [3 /*break*/, 4];
                    collectDirectoryNames(files, i, i + 1, directoryNames);
                    if (!((i & 0xff) === 0xff && performance.now() - chunkStart > index_js_1.CHUNK_MS)) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, index_js_1.yieldToEventLoop)()];
                case 2:
                    _a.sent();
                    chunkStart = performance.now();
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, __spreadArray([], directoryNames, true).map(function (d) { return d + path.sep; })];
            }
        });
    });
}
function collectDirectoryNames(files, start, end, out) {
    for (var i = start; i < end; i++) {
        var currentDir = path.dirname(files[i]);
        // Early exit if we've already processed this directory and all its parents.
        // Root detection: path.dirname returns its input at the root (fixed point),
        // so we stop when dirname stops changing. Checking this before add() keeps
        // the root out of the result set (matching the old path.parse().root guard).
        // This avoids path.parse() which allocates a 5-field object per file.
        while (currentDir !== '.' && !out.has(currentDir)) {
            var parent_1 = path.dirname(currentDir);
            if (parent_1 === currentDir)
                break;
            out.add(currentDir);
            currentDir = parent_1;
        }
    }
}
/**
 * Gets additional files from Claude config directories
 */
function getClaudeConfigFiles(cwd) {
    return __awaiter(this, void 0, void 0, function () {
        var markdownFileArrays;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all(markdownConfigLoader_js_1.CLAUDE_CONFIG_DIRECTORIES.map(function (subdir) {
                        return (0, markdownConfigLoader_js_1.loadMarkdownFilesForSubdir)(subdir, cwd);
                    }))];
                case 1:
                    markdownFileArrays = _a.sent();
                    return [2 /*return*/, markdownFileArrays.flatMap(function (markdownFiles) {
                            return markdownFiles.map(function (f) { return f.filePath; });
                        })];
            }
        });
    });
}
/**
 * Gets project files using git ls-files (fast) or ripgrep (fallback)
 */
function getProjectFiles(abortSignal, respectGitignore) {
    return __awaiter(this, void 0, void 0, function () {
        var gitFiles, startTime, rgArgs, files, relativePaths, duration;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, debug_js_1.logForDebugging)("[FileIndex] getProjectFiles called, respectGitignore=".concat(respectGitignore));
                    return [4 /*yield*/, getFilesUsingGit(abortSignal, respectGitignore)];
                case 1:
                    gitFiles = _a.sent();
                    if (gitFiles !== null) {
                        (0, debug_js_1.logForDebugging)("[FileIndex] using git ls-files result (".concat(gitFiles.length, " files)"));
                        return [2 /*return*/, gitFiles];
                    }
                    // Fall back to ripgrep
                    (0, debug_js_1.logForDebugging)("[FileIndex] git ls-files returned null, falling back to ripgrep");
                    startTime = Date.now();
                    rgArgs = [
                        '--files',
                        '--follow',
                        '--hidden',
                        '--glob',
                        '!.git/',
                        '--glob',
                        '!.svn/',
                        '--glob',
                        '!.hg/',
                        '--glob',
                        '!.bzr/',
                        '--glob',
                        '!.jj/',
                        '--glob',
                        '!.sl/',
                    ];
                    if (!respectGitignore) {
                        rgArgs.push('--no-ignore-vcs');
                    }
                    return [4 /*yield*/, (0, ripgrep_js_1.ripGrep)(rgArgs, '.', abortSignal)];
                case 2:
                    files = _a.sent();
                    relativePaths = files.map(function (f) { return path.relative((0, cwd_js_1.getCwd)(), f); });
                    duration = Date.now() - startTime;
                    (0, debug_js_1.logForDebugging)("[FileIndex] ripgrep: ".concat(relativePaths.length, " files in ").concat(duration, "ms"));
                    (0, index_js_2.logEvent)('tengu_file_suggestions_ripgrep', {
                        file_count: relativePaths.length,
                        duration_ms: duration,
                    });
                    return [2 /*return*/, relativePaths];
            }
        });
    });
}
/**
 * Gets both files and their directory paths for providing path suggestions
 * Uses git ls-files for git repos (fast) or ripgrep as fallback
 * Returns a FileIndex populated for fast fuzzy search
 */
function getPathsForSuggestions() {
    return __awaiter(this, void 0, void 0, function () {
        var signal, index, projectSettings, globalConfig, respectGitignore, cwd, _a, projectFiles, configFiles, allFiles, directories, allPathsList, sig, error_2;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    signal = AbortSignal.timeout(10000);
                    index = getFileIndex();
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 7, , 8]);
                    projectSettings = (0, settings_js_1.getInitialSettings)();
                    globalConfig = (0, config_js_1.getGlobalConfig)();
                    respectGitignore = (_c = (_b = projectSettings.respectGitignore) !== null && _b !== void 0 ? _b : globalConfig.respectGitignore) !== null && _c !== void 0 ? _c : true;
                    cwd = (0, cwd_js_1.getCwd)();
                    return [4 /*yield*/, Promise.all([
                            getProjectFiles(signal, respectGitignore),
                            getClaudeConfigFiles(cwd),
                        ])
                        // Cache for mergeUntrackedIntoNormalizedCache
                    ];
                case 2:
                    _a = _d.sent(), projectFiles = _a[0], configFiles = _a[1];
                    // Cache for mergeUntrackedIntoNormalizedCache
                    cachedConfigFiles = configFiles;
                    allFiles = __spreadArray(__spreadArray([], projectFiles, true), configFiles, true);
                    return [4 /*yield*/, getDirectoryNamesAsync(allFiles)];
                case 3:
                    directories = _d.sent();
                    cachedTrackedDirs = directories;
                    allPathsList = __spreadArray(__spreadArray([], directories, true), allFiles, true);
                    sig = pathListSignature(allPathsList);
                    if (!(sig !== loadedTrackedSignature)) return [3 /*break*/, 5];
                    // Await the full build so cold-start returns complete results. The
                    // build yields every ~4ms so the UI stays responsive — user can keep
                    // typing during the ~120ms wait without input lag.
                    return [4 /*yield*/, index.loadFromFileListAsync(allPathsList).done];
                case 4:
                    // Await the full build so cold-start returns complete results. The
                    // build yields every ~4ms so the UI stays responsive — user can keep
                    // typing during the ~120ms wait without input lag.
                    _d.sent();
                    loadedTrackedSignature = sig;
                    // We just replaced the merged index with tracked-only data. Force
                    // the next untracked merge to rebuild even if its own sig matches.
                    loadedMergedSignature = null;
                    return [3 /*break*/, 6];
                case 5:
                    (0, debug_js_1.logForDebugging)("[FileIndex] skipped index rebuild \u2014 tracked paths unchanged");
                    _d.label = 6;
                case 6: return [3 /*break*/, 8];
                case 7:
                    error_2 = _d.sent();
                    (0, log_js_1.logError)(error_2);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/, index];
            }
        });
    });
}
/**
 * Finds the common prefix between two strings
 */
function findCommonPrefix(a, b) {
    var minLength = Math.min(a.length, b.length);
    var i = 0;
    while (i < minLength && a[i] === b[i]) {
        i++;
    }
    return a.substring(0, i);
}
/**
 * Finds the longest common prefix among an array of suggestion items
 */
function findLongestCommonPrefix(suggestions) {
    if (suggestions.length === 0)
        return '';
    var strings = suggestions.map(function (item) { return item.displayText; });
    var prefix = strings[0];
    for (var i = 1; i < strings.length; i++) {
        var currentString = strings[i];
        prefix = findCommonPrefix(prefix, currentString);
        if (prefix === '')
            return '';
    }
    return prefix;
}
/**
 * Creates a file suggestion item
 */
function createFileSuggestionItem(filePath, score) {
    return {
        id: "file-".concat(filePath),
        displayText: filePath,
        metadata: score !== undefined ? { score: score } : undefined,
    };
}
/**
 * Find matching files and folders for a given query using the TS file index
 */
var MAX_SUGGESTIONS = 15;
function findMatchingFiles(fileIndex, partialPath) {
    var results = fileIndex.search(partialPath, MAX_SUGGESTIONS);
    return results.map(function (result) {
        return createFileSuggestionItem(result.path, result.score);
    });
}
/**
 * Starts a background refresh of the file index cache if not already in progress.
 *
 * Throttled: when a cache already exists, we skip the refresh unless git state
 * has actually changed. This prevents every keystroke from spawning git ls-files
 * and rebuilding the nucleo index.
 */
var REFRESH_THROTTLE_MS = 5000;
function startBackgroundCacheRefresh() {
    if (fileListRefreshPromise)
        return;
    // Throttle only when a cache exists — cold start must always populate.
    // Refresh immediately when .git/index mtime changed (tracked files).
    // Otherwise refresh at most once per 5s — this floor picks up new UNTRACKED
    // files, which don't bump .git/index. The signature checks downstream skip
    // the rebuild when the 5s refresh finds nothing actually changed.
    var indexMtime = getGitIndexMtime();
    if (fileIndex) {
        var gitStateChanged = indexMtime !== null && indexMtime !== lastGitIndexMtime;
        if (!gitStateChanged && Date.now() - lastRefreshMs < REFRESH_THROTTLE_MS) {
            return;
        }
    }
    var generation = cacheGeneration;
    var refreshStart = Date.now();
    // Ensure the FileIndex singleton exists — it's progressively queryable
    // via readyCount while the build runs. Callers searching early get partial
    // results; indexBuildComplete fires after .done so they can re-search.
    getFileIndex();
    fileListRefreshPromise = getPathsForSuggestions()
        .then(function (result) {
        if (generation !== cacheGeneration) {
            return result; // Cache was cleared; don't overwrite with stale data
        }
        fileListRefreshPromise = null;
        indexBuildComplete.emit();
        // Commit the start-time mtime observation on success. If git state
        // changed mid-refresh, the next call will see the newer mtime and
        // correctly refresh again.
        lastGitIndexMtime = indexMtime;
        lastRefreshMs = Date.now();
        (0, debug_js_1.logForDebugging)("[FileIndex] cache refresh completed in ".concat(Date.now() - refreshStart, "ms"));
        return result;
    })
        .catch(function (error) {
        (0, debug_js_1.logForDebugging)("[FileIndex] Cache refresh failed: ".concat((0, errors_js_1.errorMessage)(error)));
        (0, log_js_1.logError)(error);
        if (generation === cacheGeneration) {
            fileListRefreshPromise = null; // Allow retry on next call
        }
        return getFileIndex();
    });
}
/**
 * Gets the top-level files and directories in the current working directory
 * @returns Array of file/directory paths in the current directory
 */
function getTopLevelPaths() {
    return __awaiter(this, void 0, void 0, function () {
        var fs, cwd, entries, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    cwd = (0, cwd_js_1.getCwd)();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fs.readdir(cwd)];
                case 2:
                    entries = _a.sent();
                    return [2 /*return*/, entries.map(function (entry) {
                            var fullPath = path.join(cwd, entry.name);
                            var relativePath = path.relative(cwd, fullPath);
                            // Add trailing separator for directories
                            return entry.isDirectory() ? relativePath + path.sep : relativePath;
                        })];
                case 3:
                    error_3 = _a.sent();
                    (0, log_js_1.logError)(error_3);
                    return [2 /*return*/, []];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Generate file suggestions for the current input and cursor position
 * @param partialPath The partial file path to match
 * @param showOnEmpty Whether to show suggestions even if partialPath is empty (used for @ symbol)
 */
function generateFileSuggestions(partialPath_1) {
    return __awaiter(this, arguments, void 0, function (partialPath, showOnEmpty) {
        var input, results, topLevelPaths, startTime, wasBuilding, normalizedPath, currentDirPrefix, matches, duration;
        var _a;
        if (showOnEmpty === void 0) { showOnEmpty = false; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    // If input is empty and we don't want to show suggestions on empty, return nothing
                    if (!partialPath && !showOnEmpty) {
                        return [2 /*return*/, []];
                    }
                    if (!(((_a = (0, settings_js_1.getInitialSettings)().fileSuggestion) === null || _a === void 0 ? void 0 : _a.type) === 'command')) return [3 /*break*/, 2];
                    input = __assign(__assign({}, (0, hooks_js_1.createBaseHookInput)()), { query: partialPath });
                    return [4 /*yield*/, (0, hooks_js_1.executeFileSuggestionCommand)(input)];
                case 1:
                    results = _b.sent();
                    return [2 /*return*/, results.slice(0, MAX_SUGGESTIONS).map(createFileSuggestionItem)];
                case 2:
                    if (!(partialPath === '' || partialPath === '.' || partialPath === './')) return [3 /*break*/, 4];
                    return [4 /*yield*/, getTopLevelPaths()];
                case 3:
                    topLevelPaths = _b.sent();
                    startBackgroundCacheRefresh();
                    return [2 /*return*/, topLevelPaths.slice(0, MAX_SUGGESTIONS).map(createFileSuggestionItem)];
                case 4:
                    startTime = Date.now();
                    try {
                        wasBuilding = fileListRefreshPromise !== null;
                        startBackgroundCacheRefresh();
                        normalizedPath = partialPath;
                        currentDirPrefix = '.' + path.sep;
                        if (partialPath.startsWith(currentDirPrefix)) {
                            normalizedPath = partialPath.substring(2);
                        }
                        // Handle tilde expansion for home directory
                        if (normalizedPath.startsWith('~')) {
                            normalizedPath = (0, path_js_1.expandPath)(normalizedPath);
                        }
                        matches = fileIndex
                            ? findMatchingFiles(fileIndex, normalizedPath)
                            : [];
                        duration = Date.now() - startTime;
                        (0, debug_js_1.logForDebugging)("[FileIndex] generateFileSuggestions: ".concat(matches.length, " results in ").concat(duration, "ms (").concat(wasBuilding ? 'partial' : 'full', " index)"));
                        (0, index_js_2.logEvent)('tengu_file_suggestions_query', {
                            duration_ms: duration,
                            cache_hit: !wasBuilding,
                            result_count: matches.length,
                            query_length: partialPath.length,
                        });
                        return [2 /*return*/, matches];
                    }
                    catch (error) {
                        (0, log_js_1.logError)(error);
                        return [2 /*return*/, []];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Apply a file suggestion to the input
 */
function applyFileSuggestion(suggestion, input, partialPath, startPos, onInputChange, setCursorOffset) {
    // Extract suggestion text from string or SuggestionItem
    var suggestionText = typeof suggestion === 'string' ? suggestion : suggestion.displayText;
    // Replace the partial path with the selected file path
    var newInput = input.substring(0, startPos) +
        suggestionText +
        input.substring(startPos + partialPath.length);
    onInputChange(newInput);
    // Move cursor to end of the file path
    var newCursorPos = startPos + suggestionText.length;
    setCursorOffset(newCursorPos);
}
