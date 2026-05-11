"use strict";
/**
 * Standalone implementation of listSessions for the Agent SDK.
 *
 * Dependencies are kept minimal and portable — no bootstrap/state.ts,
 * no analytics, no bun:bundle, no module-scope mutable state. This module
 * can be imported safely from the SDK entrypoint without triggering CLI
 * initialization or pulling in expensive dependency chains.
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
exports.parseSessionInfoFromLite = parseSessionInfoFromLite;
exports.listCandidates = listCandidates;
exports.listSessionsImpl = listSessionsImpl;
var promises_1 = require("fs/promises");
var path_1 = require("path");
var getWorktreePathsPortable_js_1 = require("./getWorktreePathsPortable.js");
var sessionStoragePortable_js_1 = require("./sessionStoragePortable.js");
// ---------------------------------------------------------------------------
// Field extraction — shared by listSessionsImpl and getSessionInfoImpl
// ---------------------------------------------------------------------------
/**
 * Parses SessionInfo fields from a lite session read (head/tail/stat).
 * Returns null for sidechain sessions or metadata-only sessions with no
 * extractable summary.
 *
 * Exported for reuse by getSessionInfoImpl.
 */
function parseSessionInfoFromLite(sessionId, lite, projectPath) {
    var head = lite.head, tail = lite.tail, mtime = lite.mtime, size = lite.size;
    // Check first line for sidechain sessions
    var firstNewline = head.indexOf('\n');
    var firstLine = firstNewline >= 0 ? head.slice(0, firstNewline) : head;
    if (firstLine.includes('"isSidechain":true') ||
        firstLine.includes('"isSidechain": true')) {
        return null;
    }
    // User title (customTitle) wins over AI title (aiTitle); distinct
    // field names mean extractLastJsonStringField naturally disambiguates.
    var customTitle = (0, sessionStoragePortable_js_1.extractLastJsonStringField)(tail, 'customTitle') ||
        (0, sessionStoragePortable_js_1.extractLastJsonStringField)(head, 'customTitle') ||
        (0, sessionStoragePortable_js_1.extractLastJsonStringField)(tail, 'aiTitle') ||
        (0, sessionStoragePortable_js_1.extractLastJsonStringField)(head, 'aiTitle') ||
        undefined;
    var firstPrompt = (0, sessionStoragePortable_js_1.extractFirstPromptFromHead)(head) || undefined;
    // First entry's ISO timestamp → epoch ms. More reliable than
    // stat().birthtime which is unsupported on some filesystems.
    var firstTimestamp = (0, sessionStoragePortable_js_1.extractJsonStringField)(head, 'timestamp');
    var createdAt;
    if (firstTimestamp) {
        var parsed = Date.parse(firstTimestamp);
        if (!Number.isNaN(parsed))
            createdAt = parsed;
    }
    // last-prompt tail entry (captured by extractFirstPrompt at write
    // time, filtered) shows what the user was most recently doing.
    // Head scan is fallback for sessions without a last-prompt entry.
    var summary = customTitle ||
        (0, sessionStoragePortable_js_1.extractLastJsonStringField)(tail, 'lastPrompt') ||
        (0, sessionStoragePortable_js_1.extractLastJsonStringField)(tail, 'summary') ||
        firstPrompt;
    // Skip metadata-only sessions (no title, no summary, no prompt)
    if (!summary)
        return null;
    var gitBranch = (0, sessionStoragePortable_js_1.extractLastJsonStringField)(tail, 'gitBranch') ||
        (0, sessionStoragePortable_js_1.extractJsonStringField)(head, 'gitBranch') ||
        undefined;
    var sessionCwd = (0, sessionStoragePortable_js_1.extractJsonStringField)(head, 'cwd') || projectPath || undefined;
    // Type-scope tag extraction to the {"type":"tag"} JSONL line to avoid
    // collision with tool_use inputs containing a `tag` parameter (git tag,
    // Docker tags, cloud resource tags). Mirrors sessionStorage.ts:608.
    var tagLine = tail.split('\n').findLast(function (l) { return l.startsWith('{"type":"tag"'); });
    var tag = tagLine
        ? (0, sessionStoragePortable_js_1.extractLastJsonStringField)(tagLine, 'tag') || undefined
        : undefined;
    return {
        sessionId: sessionId,
        summary: summary,
        lastModified: mtime,
        fileSize: size,
        customTitle: customTitle,
        firstPrompt: firstPrompt,
        gitBranch: gitBranch,
        cwd: sessionCwd,
        tag: tag,
        createdAt: createdAt,
    };
}
/**
 * Lists candidate session files in a directory via readdir, optionally
 * stat'ing each for mtime. When `doStat` is false, mtime is set to 0
 * (caller must sort/dedup after reading file contents instead).
 */
function listCandidates(projectDir, doStat, projectPath) {
    return __awaiter(this, void 0, void 0, function () {
        var names, _a, results;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, promises_1.readdir)(projectDir)];
                case 1:
                    names = _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, []];
                case 3: return [4 /*yield*/, Promise.all(names.map(function (name) { return __awaiter(_this, void 0, void 0, function () {
                        var sessionId, filePath, s, _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    if (!name.endsWith('.jsonl'))
                                        return [2 /*return*/, null];
                                    sessionId = (0, sessionStoragePortable_js_1.validateUuid)(name.slice(0, -6));
                                    if (!sessionId)
                                        return [2 /*return*/, null];
                                    filePath = (0, path_1.join)(projectDir, name);
                                    if (!doStat)
                                        return [2 /*return*/, { sessionId: sessionId, filePath: filePath, mtime: 0, projectPath: projectPath }];
                                    _b.label = 1;
                                case 1:
                                    _b.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, (0, promises_1.stat)(filePath)];
                                case 2:
                                    s = _b.sent();
                                    return [2 /*return*/, { sessionId: sessionId, filePath: filePath, mtime: s.mtime.getTime(), projectPath: projectPath }];
                                case 3:
                                    _a = _b.sent();
                                    return [2 /*return*/, null];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); }))];
                case 4:
                    results = _b.sent();
                    return [2 /*return*/, results.filter(function (c) { return c !== null; })];
            }
        });
    });
}
/**
 * Reads a candidate's file contents and extracts full SessionInfo.
 * Returns null if the session should be filtered out (sidechain, no summary).
 */
function readCandidate(c) {
    return __awaiter(this, void 0, void 0, function () {
        var lite, info;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, sessionStoragePortable_js_1.readSessionLite)(c.filePath)];
                case 1:
                    lite = _a.sent();
                    if (!lite)
                        return [2 /*return*/, null];
                    info = parseSessionInfoFromLite(c.sessionId, lite, c.projectPath);
                    if (!info)
                        return [2 /*return*/, null
                            // Prefer stat-pass mtime for sort-key consistency; fall back to
                            // lite.mtime when doStat=false (c.mtime is 0 placeholder).
                        ];
                    // Prefer stat-pass mtime for sort-key consistency; fall back to
                    // lite.mtime when doStat=false (c.mtime is 0 placeholder).
                    if (c.mtime)
                        info.lastModified = c.mtime;
                    return [2 /*return*/, info];
            }
        });
    });
}
// ---------------------------------------------------------------------------
// Sort + limit — batch-read candidates in sorted order until `limit`
// survivors are collected (some candidates filter out on full read).
// ---------------------------------------------------------------------------
/** Batch size for concurrent reads when walking the sorted candidate list. */
var READ_BATCH_SIZE = 32;
/**
 * Sort comparator: lastModified desc, then sessionId desc for stable
 * ordering across mtime ties.
 */
function compareDesc(a, b) {
    if (b.mtime !== a.mtime)
        return b.mtime - a.mtime;
    return b.sessionId < a.sessionId ? -1 : b.sessionId > a.sessionId ? 1 : 0;
}
function applySortAndLimit(candidates, limit, offset) {
    return __awaiter(this, void 0, void 0, function () {
        var sessions, want, skipped, seen, i, batchEnd, batch, results, j, r;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    candidates.sort(compareDesc);
                    sessions = [];
                    want = limit && limit > 0 ? limit : Infinity;
                    skipped = 0;
                    seen = new Set();
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < candidates.length && sessions.length < want)) return [3 /*break*/, 4];
                    batchEnd = Math.min(i + READ_BATCH_SIZE, candidates.length);
                    batch = candidates.slice(i, batchEnd);
                    return [4 /*yield*/, Promise.all(batch.map(readCandidate))];
                case 2:
                    results = _a.sent();
                    for (j = 0; j < results.length && sessions.length < want; j++) {
                        i++;
                        r = results[j];
                        if (!r)
                            continue;
                        if (seen.has(r.sessionId))
                            continue;
                        seen.add(r.sessionId);
                        if (skipped < offset) {
                            skipped++;
                            continue;
                        }
                        sessions.push(r);
                    }
                    _a.label = 3;
                case 3: return [3 /*break*/, 1];
                case 4: return [2 /*return*/, sessions];
            }
        });
    });
}
/**
 * Read-all path for when no limit/offset is set. Skips the stat pass
 * entirely — reads every candidate, then sorts/dedups on real mtimes
 * from readSessionLite. Matches pre-refactor I/O cost (no extra stats).
 */
function readAllAndSort(candidates) {
    return __awaiter(this, void 0, void 0, function () {
        var all, byId, _i, all_1, s, existing, sessions;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all(candidates.map(readCandidate))];
                case 1:
                    all = _a.sent();
                    byId = new Map();
                    for (_i = 0, all_1 = all; _i < all_1.length; _i++) {
                        s = all_1[_i];
                        if (!s)
                            continue;
                        existing = byId.get(s.sessionId);
                        if (!existing || s.lastModified > existing.lastModified) {
                            byId.set(s.sessionId, s);
                        }
                    }
                    sessions = __spreadArray([], byId.values(), true);
                    sessions.sort(function (a, b) {
                        return b.lastModified !== a.lastModified
                            ? b.lastModified - a.lastModified
                            : b.sessionId < a.sessionId
                                ? -1
                                : b.sessionId > a.sessionId
                                    ? 1
                                    : 0;
                    });
                    return [2 /*return*/, sessions];
            }
        });
    });
}
// ---------------------------------------------------------------------------
// Project directory enumeration (single-project vs all-projects)
// ---------------------------------------------------------------------------
/**
 * Gathers candidate session files for a specific project directory
 * (and optionally its git worktrees).
 */
function gatherProjectCandidates(dir, includeWorktrees, doStat) {
    return __awaiter(this, void 0, void 0, function () {
        var canonicalDir, worktreePaths, _a, projectDir, projectsDir, caseInsensitive, indexed, allDirents, _b, projectDir, all, seenDirs, canonicalProjectDir, dirBase, _c, _d, _e, _i, allDirents_1, dirent, dirName, _f, indexed_1, _g, wtPath, prefix, isMatch, _h, _j, _k;
        return __generator(this, function (_l) {
            switch (_l.label) {
                case 0: return [4 /*yield*/, (0, sessionStoragePortable_js_1.canonicalizePath)(dir)];
                case 1:
                    canonicalDir = _l.sent();
                    if (!includeWorktrees) return [3 /*break*/, 6];
                    _l.label = 2;
                case 2:
                    _l.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, getWorktreePathsPortable_js_1.getWorktreePathsPortable)(canonicalDir)];
                case 3:
                    worktreePaths = _l.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _a = _l.sent();
                    worktreePaths = [];
                    return [3 /*break*/, 5];
                case 5: return [3 /*break*/, 7];
                case 6:
                    worktreePaths = [];
                    _l.label = 7;
                case 7:
                    if (!(worktreePaths.length <= 1)) return [3 /*break*/, 9];
                    return [4 /*yield*/, (0, sessionStoragePortable_js_1.findProjectDir)(canonicalDir)];
                case 8:
                    projectDir = _l.sent();
                    if (!projectDir)
                        return [2 /*return*/, []];
                    return [2 /*return*/, listCandidates(projectDir, doStat, canonicalDir)];
                case 9:
                    projectsDir = (0, sessionStoragePortable_js_1.getProjectsDir)();
                    caseInsensitive = process.platform === 'win32';
                    indexed = worktreePaths.map(function (wt) {
                        var sanitized = (0, sessionStoragePortable_js_1.sanitizePath)(wt);
                        return {
                            path: wt,
                            prefix: caseInsensitive ? sanitized.toLowerCase() : sanitized,
                        };
                    });
                    indexed.sort(function (a, b) { return b.prefix.length - a.prefix.length; });
                    _l.label = 10;
                case 10:
                    _l.trys.push([10, 12, , 14]);
                    return [4 /*yield*/, (0, promises_1.readdir)(projectsDir, { withFileTypes: true })];
                case 11:
                    allDirents = _l.sent();
                    return [3 /*break*/, 14];
                case 12:
                    _b = _l.sent();
                    return [4 /*yield*/, (0, sessionStoragePortable_js_1.findProjectDir)(canonicalDir)];
                case 13:
                    projectDir = _l.sent();
                    if (!projectDir)
                        return [2 /*return*/, []];
                    return [2 /*return*/, listCandidates(projectDir, doStat, canonicalDir)];
                case 14:
                    all = [];
                    seenDirs = new Set();
                    return [4 /*yield*/, (0, sessionStoragePortable_js_1.findProjectDir)(canonicalDir)];
                case 15:
                    canonicalProjectDir = _l.sent();
                    if (!canonicalProjectDir) return [3 /*break*/, 17];
                    dirBase = (0, path_1.basename)(canonicalProjectDir);
                    seenDirs.add(caseInsensitive ? dirBase.toLowerCase() : dirBase);
                    _d = (_c = all.push).apply;
                    _e = [all];
                    return [4 /*yield*/, listCandidates(canonicalProjectDir, doStat, canonicalDir)];
                case 16:
                    _d.apply(_c, _e.concat([(_l.sent())]));
                    _l.label = 17;
                case 17:
                    _i = 0, allDirents_1 = allDirents;
                    _l.label = 18;
                case 18:
                    if (!(_i < allDirents_1.length)) return [3 /*break*/, 23];
                    dirent = allDirents_1[_i];
                    if (!dirent.isDirectory())
                        return [3 /*break*/, 22];
                    dirName = caseInsensitive ? dirent.name.toLowerCase() : dirent.name;
                    if (seenDirs.has(dirName))
                        return [3 /*break*/, 22];
                    _f = 0, indexed_1 = indexed;
                    _l.label = 19;
                case 19:
                    if (!(_f < indexed_1.length)) return [3 /*break*/, 22];
                    _g = indexed_1[_f], wtPath = _g.path, prefix = _g.prefix;
                    isMatch = dirName === prefix ||
                        (prefix.length >= sessionStoragePortable_js_1.MAX_SANITIZED_LENGTH &&
                            dirName.startsWith(prefix + '-'));
                    if (!isMatch) return [3 /*break*/, 21];
                    seenDirs.add(dirName);
                    _j = (_h = all.push).apply;
                    _k = [all];
                    return [4 /*yield*/, listCandidates((0, path_1.join)(projectsDir, dirent.name), doStat, wtPath)];
                case 20:
                    _j.apply(_h, _k.concat([(_l.sent())]));
                    return [3 /*break*/, 22];
                case 21:
                    _f++;
                    return [3 /*break*/, 19];
                case 22:
                    _i++;
                    return [3 /*break*/, 18];
                case 23: return [2 /*return*/, all];
            }
        });
    });
}
/**
 * Gathers candidate session files across all project directories.
 */
function gatherAllCandidates(doStat) {
    return __awaiter(this, void 0, void 0, function () {
        var projectsDir, dirents, _a, perProject;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    projectsDir = (0, sessionStoragePortable_js_1.getProjectsDir)();
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readdir)(projectsDir, { withFileTypes: true })];
                case 2:
                    dirents = _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [2 /*return*/, []];
                case 4: return [4 /*yield*/, Promise.all(dirents
                        .filter(function (d) { return d.isDirectory(); })
                        .map(function (d) { return listCandidates((0, path_1.join)(projectsDir, d.name), doStat); }))];
                case 5:
                    perProject = _b.sent();
                    return [2 /*return*/, perProject.flat()];
            }
        });
    });
}
/**
 * Lists sessions with metadata extracted from stat + head/tail reads.
 *
 * When `dir` is provided, returns sessions for that project directory
 * and its git worktrees. When omitted, returns sessions across all
 * projects.
 *
 * Pagination via `limit`/`offset` operates on the filtered, sorted result
 * set. When either is set, a cheap stat-only pass sorts candidates before
 * expensive head/tail reads — so `limit: 20` on a directory with 1000
 * sessions does ~1000 stats + ~20 content reads, not 1000 content reads.
 * When neither is set, stat is skipped (read-all-then-sort, same I/O cost
 * as the original implementation).
 */
function listSessionsImpl(options) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, dir, limit, offset, includeWorktrees, off, doStat, candidates, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _a = options !== null && options !== void 0 ? options : {}, dir = _a.dir, limit = _a.limit, offset = _a.offset, includeWorktrees = _a.includeWorktrees;
                    off = offset !== null && offset !== void 0 ? offset : 0;
                    doStat = (limit !== undefined && limit > 0) || off > 0;
                    if (!dir) return [3 /*break*/, 2];
                    return [4 /*yield*/, gatherProjectCandidates(dir, includeWorktrees !== null && includeWorktrees !== void 0 ? includeWorktrees : true, doStat)];
                case 1:
                    _b = _c.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, gatherAllCandidates(doStat)];
                case 3:
                    _b = _c.sent();
                    _c.label = 4;
                case 4:
                    candidates = _b;
                    if (!doStat)
                        return [2 /*return*/, readAllAndSort(candidates)];
                    return [2 /*return*/, applySortAndLimit(candidates, limit, off)];
            }
        });
    });
}
