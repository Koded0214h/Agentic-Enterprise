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
exports.fetchGitDiff = fetchGitDiff;
exports.fetchGitDiffHunks = fetchGitDiffHunks;
exports.parseGitNumstat = parseGitNumstat;
exports.parseGitDiff = parseGitDiff;
exports.parseShortstat = parseShortstat;
exports.fetchSingleFileGitDiff = fetchSingleFileGitDiff;
var promises_1 = require("fs/promises");
var path_1 = require("path");
var cwd_js_1 = require("./cwd.js");
var detectRepository_js_1 = require("./detectRepository.js");
var execFileNoThrow_js_1 = require("./execFileNoThrow.js");
var file_js_1 = require("./file.js");
var git_js_1 = require("./git.js");
var GIT_TIMEOUT_MS = 5000;
var MAX_FILES = 50;
var MAX_DIFF_SIZE_BYTES = 1000000; // 1 MB - skip files larger than this
var MAX_LINES_PER_FILE = 400; // GitHub's auto-load limit
var MAX_FILES_FOR_DETAILS = 500; // Skip per-file details if more files than this
/**
 * Fetch git diff stats and hunks comparing working tree to HEAD.
 * Returns null if not in a git repo or if git commands fail.
 *
 * Returns null during merge/rebase/cherry-pick/revert operations since the
 * working tree contains incoming changes that weren't intentionally
 * made by the user.
 */
function fetchGitDiff() {
    return __awaiter(this, void 0, void 0, function () {
        var isGit, _a, shortstatOut, shortstatCode, quickStats, _b, numstatOut, numstatCode, _c, stats, perFileStats, remainingSlots, untrackedStats, _i, untrackedStats_1, _d, path, fileStats;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, (0, git_js_1.getIsGit)()];
                case 1:
                    isGit = _e.sent();
                    if (!isGit)
                        return [2 /*return*/, null
                            // Skip diff calculation during transient git states since the
                            // working tree contains incoming changes, not user-intentional edits
                        ];
                    return [4 /*yield*/, isInTransientGitState()];
                case 2:
                    // Skip diff calculation during transient git states since the
                    // working tree contains incoming changes, not user-intentional edits
                    if (_e.sent()) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)((0, git_js_1.gitExe)(), ['--no-optional-locks', 'diff', 'HEAD', '--shortstat'], { timeout: GIT_TIMEOUT_MS, preserveOutputOnError: false })];
                case 3:
                    _a = _e.sent(), shortstatOut = _a.stdout, shortstatCode = _a.code;
                    if (shortstatCode === 0) {
                        quickStats = parseShortstat(shortstatOut);
                        if (quickStats && quickStats.filesCount > MAX_FILES_FOR_DETAILS) {
                            // Too many files - return accurate totals but skip per-file details
                            // to avoid loading hundreds of MB into memory
                            return [2 /*return*/, {
                                    stats: quickStats,
                                    perFileStats: new Map(),
                                    hunks: new Map(),
                                }];
                        }
                    }
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)((0, git_js_1.gitExe)(), ['--no-optional-locks', 'diff', 'HEAD', '--numstat'], { timeout: GIT_TIMEOUT_MS, preserveOutputOnError: false })];
                case 4:
                    _b = _e.sent(), numstatOut = _b.stdout, numstatCode = _b.code;
                    if (numstatCode !== 0)
                        return [2 /*return*/, null];
                    _c = parseGitNumstat(numstatOut), stats = _c.stats, perFileStats = _c.perFileStats;
                    remainingSlots = MAX_FILES - perFileStats.size;
                    if (!(remainingSlots > 0)) return [3 /*break*/, 6];
                    return [4 /*yield*/, fetchUntrackedFiles(remainingSlots)];
                case 5:
                    untrackedStats = _e.sent();
                    if (untrackedStats) {
                        stats.filesCount += untrackedStats.size;
                        for (_i = 0, untrackedStats_1 = untrackedStats; _i < untrackedStats_1.length; _i++) {
                            _d = untrackedStats_1[_i], path = _d[0], fileStats = _d[1];
                            perFileStats.set(path, fileStats);
                        }
                    }
                    _e.label = 6;
                case 6: 
                // Return stats only - hunks are fetched on-demand via fetchGitDiffHunks()
                // to avoid expensive git diff HEAD call on every poll
                return [2 /*return*/, { stats: stats, perFileStats: perFileStats, hunks: new Map() }];
            }
        });
    });
}
/**
 * Fetch git diff hunks on-demand (for DiffDialog).
 * Separated from fetchGitDiff() to avoid expensive calls during polling.
 */
function fetchGitDiffHunks() {
    return __awaiter(this, void 0, void 0, function () {
        var isGit, _a, diffOut, diffCode;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, git_js_1.getIsGit)()];
                case 1:
                    isGit = _b.sent();
                    if (!isGit)
                        return [2 /*return*/, new Map()];
                    return [4 /*yield*/, isInTransientGitState()];
                case 2:
                    if (_b.sent()) {
                        return [2 /*return*/, new Map()];
                    }
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)((0, git_js_1.gitExe)(), ['--no-optional-locks', 'diff', 'HEAD'], { timeout: GIT_TIMEOUT_MS, preserveOutputOnError: false })];
                case 3:
                    _a = _b.sent(), diffOut = _a.stdout, diffCode = _a.code;
                    if (diffCode !== 0) {
                        return [2 /*return*/, new Map()];
                    }
                    return [2 /*return*/, parseGitDiff(diffOut)];
            }
        });
    });
}
/**
 * Parse git diff --numstat output into stats.
 * Format: <added>\t<removed>\t<filename>
 * Binary files show '-' for counts.
 * Only stores first MAX_FILES entries in perFileStats.
 */
function parseGitNumstat(stdout) {
    var lines = stdout.trim().split('\n').filter(Boolean);
    var added = 0;
    var removed = 0;
    var validFileCount = 0;
    var perFileStats = new Map();
    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
        var line = lines_1[_i];
        var parts = line.split('\t');
        // Valid numstat lines have exactly 3 tab-separated parts: added, removed, filename
        if (parts.length < 3)
            continue;
        validFileCount++;
        var addStr = parts[0];
        var remStr = parts[1];
        var filePath = parts.slice(2).join('\t'); // filename may contain tabs
        var isBinary = addStr === '-' || remStr === '-';
        var fileAdded = isBinary ? 0 : parseInt(addStr !== null && addStr !== void 0 ? addStr : '0', 10) || 0;
        var fileRemoved = isBinary ? 0 : parseInt(remStr !== null && remStr !== void 0 ? remStr : '0', 10) || 0;
        added += fileAdded;
        removed += fileRemoved;
        // Only store first MAX_FILES entries
        if (perFileStats.size < MAX_FILES) {
            perFileStats.set(filePath, {
                added: fileAdded,
                removed: fileRemoved,
                isBinary: isBinary,
            });
        }
    }
    return {
        stats: {
            filesCount: validFileCount,
            linesAdded: added,
            linesRemoved: removed,
        },
        perFileStats: perFileStats,
    };
}
/**
 * Parse unified diff output into per-file hunks.
 * Splits by "diff --git" and parses each file's hunks.
 *
 * Applies limits:
 * - MAX_FILES: stop after this many files
 * - Files >1MB: skipped entirely (not in result map)
 * - Files ≤1MB: parsed but limited to MAX_LINES_PER_FILE lines
 */
function parseGitDiff(stdout) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    var result = new Map();
    if (!stdout.trim())
        return result;
    // Split by file diffs
    var fileDiffs = stdout.split(/^diff --git /m).filter(Boolean);
    for (var _i = 0, fileDiffs_1 = fileDiffs; _i < fileDiffs_1.length; _i++) {
        var fileDiff = fileDiffs_1[_i];
        // Stop after MAX_FILES
        if (result.size >= MAX_FILES)
            break;
        // Skip files larger than 1MB
        if (fileDiff.length > MAX_DIFF_SIZE_BYTES) {
            continue;
        }
        var lines = fileDiff.split('\n');
        // Extract filename from first line: "a/path/to/file b/path/to/file"
        var headerMatch = (_a = lines[0]) === null || _a === void 0 ? void 0 : _a.match(/^a\/(.+?) b\/(.+)$/);
        if (!headerMatch)
            continue;
        var filePath = (_c = (_b = headerMatch[2]) !== null && _b !== void 0 ? _b : headerMatch[1]) !== null && _c !== void 0 ? _c : '';
        // Find and parse hunks
        var fileHunks = [];
        var currentHunk = null;
        var lineCount = 0;
        for (var i = 1; i < lines.length; i++) {
            var line = (_d = lines[i]) !== null && _d !== void 0 ? _d : '';
            // StructuredPatchHunk header: @@ -oldStart,oldLines +newStart,newLines @@
            var hunkMatch = line.match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
            if (hunkMatch) {
                if (currentHunk) {
                    fileHunks.push(currentHunk);
                }
                currentHunk = {
                    oldStart: parseInt((_e = hunkMatch[1]) !== null && _e !== void 0 ? _e : '0', 10),
                    oldLines: parseInt((_f = hunkMatch[2]) !== null && _f !== void 0 ? _f : '1', 10),
                    newStart: parseInt((_g = hunkMatch[3]) !== null && _g !== void 0 ? _g : '0', 10),
                    newLines: parseInt((_h = hunkMatch[4]) !== null && _h !== void 0 ? _h : '1', 10),
                    lines: [],
                };
                continue;
            }
            // Skip binary file markers and other metadata
            if (line.startsWith('index ') ||
                line.startsWith('---') ||
                line.startsWith('+++') ||
                line.startsWith('new file') ||
                line.startsWith('deleted file') ||
                line.startsWith('old mode') ||
                line.startsWith('new mode') ||
                line.startsWith('Binary files')) {
                continue;
            }
            // Add diff lines to current hunk (with line limit)
            if (currentHunk &&
                (line.startsWith('+') ||
                    line.startsWith('-') ||
                    line.startsWith(' ') ||
                    line === '')) {
                // Stop adding lines once we hit the limit
                if (lineCount >= MAX_LINES_PER_FILE) {
                    continue;
                }
                // Force a flat string copy to break V8 sliced string references.
                // When split() creates lines, V8 creates "sliced strings" that reference
                // the parent. This keeps the entire parent string (~MBs) alive as long as
                // any line is retained. Using '' + line forces a new flat string allocation,
                // unlike slice(0) which V8 may optimize to return the same reference.
                currentHunk.lines.push('' + line);
                lineCount++;
            }
        }
        // Don't forget the last hunk
        if (currentHunk) {
            fileHunks.push(currentHunk);
        }
        if (fileHunks.length > 0) {
            result.set(filePath, fileHunks);
        }
    }
    return result;
}
/**
 * Check if we're in a transient git state (merge, rebase, cherry-pick, or revert).
 * During these operations, we skip diff calculation since the working
 * tree contains incoming changes that weren't intentionally made.
 *
 * Uses fs.access to check for transient ref files, avoiding process spawns.
 */
function isInTransientGitState() {
    return __awaiter(this, void 0, void 0, function () {
        var gitDir, transientFiles, results;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, git_js_1.getGitDir)((0, cwd_js_1.getCwd)())];
                case 1:
                    gitDir = _a.sent();
                    if (!gitDir)
                        return [2 /*return*/, false];
                    transientFiles = [
                        'MERGE_HEAD',
                        'REBASE_HEAD',
                        'CHERRY_PICK_HEAD',
                        'REVERT_HEAD',
                    ];
                    return [4 /*yield*/, Promise.all(transientFiles.map(function (file) {
                            return (0, promises_1.access)((0, path_1.join)(gitDir, file))
                                .then(function () { return true; })
                                .catch(function () { return false; });
                        }))];
                case 2:
                    results = _a.sent();
                    return [2 /*return*/, results.some(Boolean)];
            }
        });
    });
}
/**
 * Fetch untracked file names (no content reading).
 * Returns file paths only - they'll be displayed with a note to stage them.
 *
 * @param maxFiles Maximum number of untracked files to include
 */
function fetchUntrackedFiles(maxFiles) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, stdout, code, untrackedPaths, perFileStats, _i, _b, filePath;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)((0, git_js_1.gitExe)(), ['--no-optional-locks', 'ls-files', '--others', '--exclude-standard'], { timeout: GIT_TIMEOUT_MS, preserveOutputOnError: false })];
                case 1:
                    _a = _c.sent(), stdout = _a.stdout, code = _a.code;
                    if (code !== 0 || !stdout.trim())
                        return [2 /*return*/, null];
                    untrackedPaths = stdout.trim().split('\n').filter(Boolean);
                    if (untrackedPaths.length === 0)
                        return [2 /*return*/, null];
                    perFileStats = new Map();
                    // Just record filenames, no content reading
                    for (_i = 0, _b = untrackedPaths.slice(0, maxFiles); _i < _b.length; _i++) {
                        filePath = _b[_i];
                        perFileStats.set(filePath, {
                            added: 0,
                            removed: 0,
                            isBinary: false,
                            isUntracked: true,
                        });
                    }
                    return [2 /*return*/, perFileStats];
            }
        });
    });
}
/**
 * Parse git diff --shortstat output into stats.
 * Format: " 1648 files changed, 52341 insertions(+), 8123 deletions(-)"
 *
 * This is O(1) memory regardless of diff size - git computes totals without
 * loading all content. Used as a quick probe before expensive operations.
 */
function parseShortstat(stdout) {
    var _a, _b, _c;
    // Match: "N files changed" with optional ", N insertions(+)" and ", N deletions(-)"
    var match = stdout.match(/(\d+)\s+files?\s+changed(?:,\s+(\d+)\s+insertions?\(\+\))?(?:,\s+(\d+)\s+deletions?\(-\))?/);
    if (!match)
        return null;
    return {
        filesCount: parseInt((_a = match[1]) !== null && _a !== void 0 ? _a : '0', 10),
        linesAdded: parseInt((_b = match[2]) !== null && _b !== void 0 ? _b : '0', 10),
        linesRemoved: parseInt((_c = match[3]) !== null && _c !== void 0 ? _c : '0', 10),
    };
}
var SINGLE_FILE_DIFF_TIMEOUT_MS = 3000;
/**
 * Fetch a structured diff for a single file against the merge base with the
 * default branch. This produces a PR-like diff showing all changes since
 * the branch diverged. Falls back to diffing against HEAD if the merge base
 * cannot be determined (e.g., on the default branch itself).
 * For untracked files, generates a synthetic diff showing all additions.
 * Returns null if not in a git repo or if git commands fail.
 */
function fetchSingleFileGitDiff(absoluteFilePath) {
    return __awaiter(this, void 0, void 0, function () {
        var gitRoot, gitPath, repository, lsFilesCode, diffRef, _a, stdout, code, syntheticDiff;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    gitRoot = (0, git_js_1.findGitRoot)((0, path_1.dirname)(absoluteFilePath));
                    if (!gitRoot)
                        return [2 /*return*/, null];
                    gitPath = (0, path_1.relative)(gitRoot, absoluteFilePath).split(path_1.sep).join('/');
                    repository = (0, detectRepository_js_1.getCachedRepository)();
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), ['--no-optional-locks', 'ls-files', '--error-unmatch', gitPath], { cwd: gitRoot, timeout: SINGLE_FILE_DIFF_TIMEOUT_MS })];
                case 1:
                    lsFilesCode = (_b.sent()).code;
                    if (!(lsFilesCode === 0)) return [3 /*break*/, 4];
                    return [4 /*yield*/, getDiffRef(gitRoot)];
                case 2:
                    diffRef = _b.sent();
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), ['--no-optional-locks', 'diff', diffRef, '--', gitPath], { cwd: gitRoot, timeout: SINGLE_FILE_DIFF_TIMEOUT_MS })];
                case 3:
                    _a = _b.sent(), stdout = _a.stdout, code = _a.code;
                    if (code !== 0)
                        return [2 /*return*/, null];
                    if (!stdout)
                        return [2 /*return*/, null];
                    return [2 /*return*/, __assign(__assign({}, parseRawDiffToToolUseDiff(gitPath, stdout, 'modified')), { repository: repository })];
                case 4: return [4 /*yield*/, generateSyntheticDiff(gitPath, absoluteFilePath)];
                case 5:
                    syntheticDiff = _b.sent();
                    if (!syntheticDiff)
                        return [2 /*return*/, null];
                    return [2 /*return*/, __assign(__assign({}, syntheticDiff), { repository: repository })];
            }
        });
    });
}
/**
 * Parse raw unified diff output into the structured ToolUseDiff format.
 * Extracts only the hunk content (starting from @@) as the patch,
 * and counts additions/deletions.
 */
function parseRawDiffToToolUseDiff(filename, rawDiff, status) {
    var lines = rawDiff.split('\n');
    var patchLines = [];
    var inHunks = false;
    var additions = 0;
    var deletions = 0;
    for (var _i = 0, lines_2 = lines; _i < lines_2.length; _i++) {
        var line = lines_2[_i];
        if (line.startsWith('@@')) {
            inHunks = true;
        }
        if (inHunks) {
            patchLines.push(line);
            if (line.startsWith('+') && !line.startsWith('+++')) {
                additions++;
            }
            else if (line.startsWith('-') && !line.startsWith('---')) {
                deletions++;
            }
        }
    }
    return {
        filename: filename,
        status: status,
        additions: additions,
        deletions: deletions,
        changes: additions + deletions,
        patch: patchLines.join('\n'),
    };
}
/**
 * Determine the best ref to diff against for a PR-like diff.
 * Priority:
 * 1. CLAUDE_CODE_BASE_REF env var (set externally, e.g. by CCR managed containers)
 * 2. Merge base with the default branch (best guess)
 * 3. HEAD (fallback if merge-base fails)
 */
function getDiffRef(gitRoot) {
    return __awaiter(this, void 0, void 0, function () {
        var baseBranch, _a, _b, stdout, code;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _a = process.env.CLAUDE_CODE_BASE_REF;
                    if (_a) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, git_js_1.getDefaultBranch)()];
                case 1:
                    _a = (_c.sent());
                    _c.label = 2;
                case 2:
                    baseBranch = _a;
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), ['--no-optional-locks', 'merge-base', 'HEAD', baseBranch], { cwd: gitRoot, timeout: SINGLE_FILE_DIFF_TIMEOUT_MS })];
                case 3:
                    _b = _c.sent(), stdout = _b.stdout, code = _b.code;
                    if (code === 0 && stdout.trim()) {
                        return [2 /*return*/, stdout.trim()];
                    }
                    return [2 /*return*/, 'HEAD'];
            }
        });
    });
}
function generateSyntheticDiff(gitPath, absoluteFilePath) {
    return __awaiter(this, void 0, void 0, function () {
        var content, lines, lineCount, addedLines, patch, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    if (!(0, file_js_1.isFileWithinReadSizeLimit)(absoluteFilePath, MAX_DIFF_SIZE_BYTES)) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, (0, promises_1.readFile)(absoluteFilePath, 'utf-8')];
                case 1:
                    content = _b.sent();
                    lines = content.split('\n');
                    // Remove trailing empty line from split if file ends with newline
                    if (lines.length > 0 && lines.at(-1) === '') {
                        lines.pop();
                    }
                    lineCount = lines.length;
                    addedLines = lines.map(function (line) { return "+".concat(line); }).join('\n');
                    patch = "@@ -0,0 +1,".concat(lineCount, " @@\n").concat(addedLines);
                    return [2 /*return*/, {
                            filename: gitPath,
                            status: 'added',
                            additions: lineCount,
                            deletions: 0,
                            changes: lineCount,
                            patch: patch,
                        }];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
