"use strict";
/**
 * Filesystem-based git state reading — avoids spawning git subprocesses.
 *
 * Covers: resolving .git directories (including worktrees/submodules),
 * parsing HEAD, resolving refs via loose files and packed-refs,
 * and the GitHeadWatcher that caches branch/SHA with fs.watchFile.
 *
 * Correctness notes (verified against git source):
 *   - HEAD: `ref: refs/heads/<branch>\n` or raw SHA (refs/files-backend.c)
 *   - Packed-refs: `<sha> <refname>\n`, skip `#` and `^` lines (packed-backend.c)
 *   - .git file (worktree): `gitdir: <path>\n` with optional relative path (setup.c)
 *   - Shallow: mere existence of `<commonDir>/shallow` means shallow (shallow.c)
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
exports.clearResolveGitDirCache = clearResolveGitDirCache;
exports.resolveGitDir = resolveGitDir;
exports.isSafeRefName = isSafeRefName;
exports.isValidGitSha = isValidGitSha;
exports.readGitHead = readGitHead;
exports.resolveRef = resolveRef;
exports.getCommonDir = getCommonDir;
exports.readRawSymref = readRawSymref;
exports.getCachedBranch = getCachedBranch;
exports.getCachedHead = getCachedHead;
exports.getCachedRemoteUrl = getCachedRemoteUrl;
exports.getCachedDefaultBranch = getCachedDefaultBranch;
exports.resetGitFileWatcher = resetGitFileWatcher;
exports.getHeadForDir = getHeadForDir;
exports.readWorktreeHeadSha = readWorktreeHeadSha;
exports.getRemoteUrlForDir = getRemoteUrlForDir;
exports.isShallowClone = isShallowClone;
exports.getWorktreeCountFromFs = getWorktreeCountFromFs;
var fs_1 = require("fs");
var promises_1 = require("fs/promises");
var path_1 = require("path");
var state_js_1 = require("../../bootstrap/state.js");
var cleanupRegistry_js_1 = require("../cleanupRegistry.js");
var cwd_js_1 = require("../cwd.js");
var git_js_1 = require("../git.js");
var gitConfigParser_js_1 = require("./gitConfigParser.js");
// ---------------------------------------------------------------------------
// resolveGitDir — find the actual .git directory
// ---------------------------------------------------------------------------
var resolveGitDirCache = new Map();
/** Clear cached git dir resolutions. Exported for testing only. */
function clearResolveGitDirCache() {
    resolveGitDirCache.clear();
}
/**
 * Resolve the actual .git directory for a repo.
 * Handles worktrees/submodules where .git is a file containing `gitdir: <path>`.
 * Memoized per startPath.
 */
function resolveGitDir(startPath) {
    return __awaiter(this, void 0, void 0, function () {
        var cwd, cached, root, gitPath, st, content, rawDir, resolved, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    cwd = (0, path_1.resolve)(startPath !== null && startPath !== void 0 ? startPath : (0, cwd_js_1.getCwd)());
                    cached = resolveGitDirCache.get(cwd);
                    if (cached !== undefined) {
                        return [2 /*return*/, cached];
                    }
                    root = (0, git_js_1.findGitRoot)(cwd);
                    if (!root) {
                        resolveGitDirCache.set(cwd, null);
                        return [2 /*return*/, null];
                    }
                    gitPath = (0, path_1.join)(root, '.git');
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, (0, promises_1.stat)(gitPath)];
                case 2:
                    st = _b.sent();
                    if (!st.isFile()) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, promises_1.readFile)(gitPath, 'utf-8')];
                case 3:
                    content = (_b.sent()).trim();
                    if (content.startsWith('gitdir:')) {
                        rawDir = content.slice('gitdir:'.length).trim();
                        resolved = (0, path_1.resolve)(root, rawDir);
                        resolveGitDirCache.set(cwd, resolved);
                        return [2 /*return*/, resolved];
                    }
                    _b.label = 4;
                case 4:
                    // Regular repo: .git is a directory
                    resolveGitDirCache.set(cwd, gitPath);
                    return [2 /*return*/, gitPath];
                case 5:
                    _a = _b.sent();
                    resolveGitDirCache.set(cwd, null);
                    return [2 /*return*/, null];
                case 6: return [2 /*return*/];
            }
        });
    });
}
// ---------------------------------------------------------------------------
// isSafeRefName — validate ref/branch names read from .git/
// ---------------------------------------------------------------------------
/**
 * Validate that a ref/branch name read from .git/ is safe to use in path
 * joins, as git positional arguments, and when interpolated into shell
 * commands (commit-push-pr skill interpolates the branch into shell).
 * An attacker who controls .git/HEAD or a loose ref file could otherwise
 * embed path traversal (`..`), argument injection (leading `-`), or shell
 * metacharacters — .git/HEAD is a plain text file that can be written
 * without git's own check-ref-format validation.
 *
 * Allowlist: ASCII alphanumerics, `/`, `.`, `_`, `+`, `-`, `@` only. This
 * covers all legitimate git branch names (e.g. `feature/foo`,
 * `release-1.2.3+build`, `dependabot/npm_and_yarn/@types/node-18.0.0`)
 * while rejecting everything that could be dangerous in shell context
 * (newlines, backticks, `$`, `;`, `|`, `&`, `(`, `)`, `<`, `>`, spaces,
 * tabs, quotes, backslash) and path traversal (`..`).
 */
function isSafeRefName(name) {
    if (!name || name.startsWith('-') || name.startsWith('/')) {
        return false;
    }
    if (name.includes('..')) {
        return false;
    }
    // Reject single-dot and empty path components (`.`, `foo/./bar`, `foo//bar`,
    // `foo/`). Git-check-ref-format rejects these, and `.` normalizes away in
    // path joins so a tampered HEAD of `refs/heads/.` would make us watch the
    // refs/heads directory itself instead of a branch file.
    if (name.split('/').some(function (c) { return c === '.' || c === ''; })) {
        return false;
    }
    // Allowlist-only: alphanumerics, /, ., _, +, -, @. Rejects all shell
    // metacharacters, whitespace, NUL, and non-ASCII. Git's forbidden @{
    // sequence is blocked because { is not in the allowlist.
    if (!/^[a-zA-Z0-9/._+@-]+$/.test(name)) {
        return false;
    }
    return true;
}
/**
 * Validate that a string is a git SHA: 40 hex chars (SHA-1) or 64 hex chars
 * (SHA-256). Git never writes abbreviated SHAs to HEAD or ref files, so we
 * only accept full-length hashes.
 *
 * An attacker who controls .git/HEAD when detached, or a loose ref file,
 * could otherwise return arbitrary content that flows into shell contexts.
 */
function isValidGitSha(s) {
    return /^[0-9a-f]{40}$/.test(s) || /^[0-9a-f]{64}$/.test(s);
}
// ---------------------------------------------------------------------------
// readGitHead — parse .git/HEAD
// ---------------------------------------------------------------------------
/**
 * Parse .git/HEAD to determine current branch or detached SHA.
 *
 * HEAD format (per git source, refs/files-backend.c):
 *   - `ref: refs/heads/<branch>\n`  — on a branch
 *   - `ref: <other-ref>\n`          — unusual symref (e.g. during bisect)
 *   - `<hex-sha>\n`                 — detached HEAD (e.g. during rebase)
 *
 * Git strips trailing whitespace via strbuf_rtrim; .trim() is equivalent.
 * Git allows any whitespace between "ref:" and the path; we handle
 * this by trimming after slicing past "ref:".
 */
function readGitHead(gitDir) {
    return __awaiter(this, void 0, void 0, function () {
        var content, ref, name_1, sha, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, (0, promises_1.readFile)((0, path_1.join)(gitDir, 'HEAD'), 'utf-8')];
                case 1:
                    content = (_b.sent()).trim();
                    if (!content.startsWith('ref:')) return [3 /*break*/, 3];
                    ref = content.slice('ref:'.length).trim();
                    if (ref.startsWith('refs/heads/')) {
                        name_1 = ref.slice('refs/heads/'.length);
                        // Reject path traversal and argument injection from a tampered HEAD.
                        if (!isSafeRefName(name_1)) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, { type: 'branch', name: name_1 }];
                    }
                    // Unusual symref (not a local branch) — resolve to SHA
                    if (!isSafeRefName(ref)) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, resolveRef(gitDir, ref)];
                case 2:
                    sha = _b.sent();
                    return [2 /*return*/, sha ? { type: 'detached', sha: sha } : { type: 'detached', sha: '' }];
                case 3:
                    // Raw SHA (detached HEAD). Validate: an attacker-controlled HEAD file
                    // could contain shell metacharacters that flow into downstream shell
                    // contexts.
                    if (!isValidGitSha(content)) {
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, { type: 'detached', sha: content }];
                case 4:
                    _a = _b.sent();
                    return [2 /*return*/, null];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// ---------------------------------------------------------------------------
// resolveRef — resolve loose/packed refs to SHAs
// ---------------------------------------------------------------------------
/**
 * Resolve a git ref (e.g. `refs/heads/main`) to a commit SHA.
 * Checks loose ref files first, then falls back to packed-refs.
 * Follows symrefs (e.g. `ref: refs/remotes/origin/main`).
 *
 * For worktrees, refs live in the common gitdir (pointed to by the
 * `commondir` file), not the worktree-specific gitdir. We check the
 * worktree gitdir first, then fall back to the common dir.
 *
 * Packed-refs format (per packed-backend.c):
 *   - Header: `# pack-refs with: <traits>\n`
 *   - Entries: `<40-hex-sha> <refname>\n`
 *   - Peeled:  `^<40-hex-sha>\n` (after annotated tag entries)
 */
function resolveRef(gitDir, ref) {
    return __awaiter(this, void 0, void 0, function () {
        var result, commonDir;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, resolveRefInDir(gitDir, ref)];
                case 1:
                    result = _a.sent();
                    if (result) {
                        return [2 /*return*/, result];
                    }
                    return [4 /*yield*/, getCommonDir(gitDir)];
                case 2:
                    commonDir = _a.sent();
                    if (commonDir && commonDir !== gitDir) {
                        return [2 /*return*/, resolveRefInDir(commonDir, ref)];
                    }
                    return [2 /*return*/, null];
            }
        });
    });
}
function resolveRefInDir(dir, ref) {
    return __awaiter(this, void 0, void 0, function () {
        var content, target, _a, packed, _i, _b, line, spaceIdx, sha, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, promises_1.readFile)((0, path_1.join)(dir, ref), 'utf-8')];
                case 1:
                    content = (_d.sent()).trim();
                    if (content.startsWith('ref:')) {
                        target = content.slice('ref:'.length).trim();
                        // Reject path traversal in a tampered symref chain.
                        if (!isSafeRefName(target)) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, resolveRef(dir, target)];
                    }
                    // Loose ref content should be a raw SHA. Validate: an attacker-controlled
                    // ref file could contain shell metacharacters.
                    if (!isValidGitSha(content)) {
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, content];
                case 2:
                    _a = _d.sent();
                    return [3 /*break*/, 3];
                case 3:
                    _d.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, (0, promises_1.readFile)((0, path_1.join)(dir, 'packed-refs'), 'utf-8')];
                case 4:
                    packed = _d.sent();
                    for (_i = 0, _b = packed.split('\n'); _i < _b.length; _i++) {
                        line = _b[_i];
                        if (line.startsWith('#') || line.startsWith('^')) {
                            continue;
                        }
                        spaceIdx = line.indexOf(' ');
                        if (spaceIdx === -1) {
                            continue;
                        }
                        if (line.slice(spaceIdx + 1) === ref) {
                            sha = line.slice(0, spaceIdx);
                            return [2 /*return*/, isValidGitSha(sha) ? sha : null];
                        }
                    }
                    return [3 /*break*/, 6];
                case 5:
                    _c = _d.sent();
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/, null];
            }
        });
    });
}
/**
 * Read the `commondir` file to find the shared git directory.
 * In a worktree, this points to the main repo's .git dir.
 * Returns null if no commondir file exists (regular repo).
 */
function getCommonDir(gitDir) {
    return __awaiter(this, void 0, void 0, function () {
        var content, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, promises_1.readFile)((0, path_1.join)(gitDir, 'commondir'), 'utf-8')];
                case 1:
                    content = (_b.sent()).trim();
                    return [2 /*return*/, (0, path_1.resolve)(gitDir, content)];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Read a raw symref file and extract the branch name after a known prefix.
 * Returns null if the ref doesn't exist, isn't a symref, or doesn't match the prefix.
 * Checks loose file only — packed-refs doesn't store symrefs.
 */
function readRawSymref(gitDir, refPath, branchPrefix) {
    return __awaiter(this, void 0, void 0, function () {
        var content, target, name_2, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, promises_1.readFile)((0, path_1.join)(gitDir, refPath), 'utf-8')];
                case 1:
                    content = (_b.sent()).trim();
                    if (content.startsWith('ref:')) {
                        target = content.slice('ref:'.length).trim();
                        if (target.startsWith(branchPrefix)) {
                            name_2 = target.slice(branchPrefix.length);
                            // Reject path traversal and argument injection from a tampered symref.
                            if (!isSafeRefName(name_2)) {
                                return [2 /*return*/, null];
                            }
                            return [2 /*return*/, name_2];
                        }
                    }
                    return [3 /*break*/, 3];
                case 2:
                    _a = _b.sent();
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/, null];
            }
        });
    });
}
var WATCH_INTERVAL_MS = process.env.NODE_ENV === 'test' ? 10 : 1000;
var GitFileWatcher = /** @class */ (function () {
    function GitFileWatcher() {
        this.gitDir = null;
        this.commonDir = null;
        this.initialized = false;
        this.initPromise = null;
        this.watchedPaths = [];
        this.branchRefPath = null;
        this.cache = new Map();
    }
    GitFileWatcher.prototype.ensureStarted = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.initialized) {
                    return [2 /*return*/];
                }
                if (this.initPromise) {
                    return [2 /*return*/, this.initPromise];
                }
                this.initPromise = this.start();
                return [2 /*return*/, this.initPromise];
            });
        });
    };
    GitFileWatcher.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            var _this = this;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, resolveGitDir()];
                    case 1:
                        _a.gitDir = _d.sent();
                        this.initialized = true;
                        if (!this.gitDir) {
                            return [2 /*return*/];
                        }
                        // In a worktree, branch refs and the main config are shared and live in
                        // commonDir, not the per-worktree gitDir. Resolve once so we don't
                        // re-read the commondir file on every branch switch.
                        _b = this;
                        return [4 /*yield*/, getCommonDir(this.gitDir)
                            // Watch .git/HEAD and .git/config
                        ];
                    case 2:
                        // In a worktree, branch refs and the main config are shared and live in
                        // commonDir, not the per-worktree gitDir. Resolve once so we don't
                        // re-read the commondir file on every branch switch.
                        _b.commonDir = _d.sent();
                        // Watch .git/HEAD and .git/config
                        this.watchPath((0, path_1.join)(this.gitDir, 'HEAD'), function () {
                            void _this.onHeadChanged();
                        });
                        // Config (remote URLs) lives in commonDir for worktrees
                        this.watchPath((0, path_1.join)((_c = this.commonDir) !== null && _c !== void 0 ? _c : this.gitDir, 'config'), function () {
                            _this.invalidate();
                        });
                        // Watch the current branch's ref file for commit changes
                        return [4 /*yield*/, this.watchCurrentBranchRef()];
                    case 3:
                        // Watch the current branch's ref file for commit changes
                        _d.sent();
                        (0, cleanupRegistry_js_1.registerCleanup)(function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                this.stopWatching();
                                return [2 /*return*/];
                            });
                        }); });
                        return [2 /*return*/];
                }
            });
        });
    };
    GitFileWatcher.prototype.watchPath = function (path, callback) {
        this.watchedPaths.push(path);
        (0, fs_1.watchFile)(path, { interval: WATCH_INTERVAL_MS }, callback);
    };
    /**
     * Watch the loose ref file for the current branch.
     * Called on startup and whenever HEAD changes (branch switch).
     */
    GitFileWatcher.prototype.watchCurrentBranchRef = function () {
        return __awaiter(this, void 0, void 0, function () {
            var head, refsDir, refPath;
            var _this = this;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.gitDir) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, readGitHead(this.gitDir)
                            // Branch refs live in commonDir for worktrees (gitDir for regular repos)
                        ];
                    case 1:
                        head = _b.sent();
                        refsDir = (_a = this.commonDir) !== null && _a !== void 0 ? _a : this.gitDir;
                        refPath = (head === null || head === void 0 ? void 0 : head.type) === 'branch' ? (0, path_1.join)(refsDir, 'refs', 'heads', head.name) : null;
                        // Already watching this ref (or already not watching anything)
                        if (refPath === this.branchRefPath) {
                            return [2 /*return*/];
                        }
                        // Stop watching old branch ref. Runs for branch→branch AND
                        // branch→detached (checkout --detach, rebase, bisect).
                        if (this.branchRefPath) {
                            (0, fs_1.unwatchFile)(this.branchRefPath);
                            this.watchedPaths = this.watchedPaths.filter(function (p) { return p !== _this.branchRefPath; });
                        }
                        this.branchRefPath = refPath;
                        if (!refPath) {
                            return [2 /*return*/];
                        }
                        // The ref file may not exist yet (new branch before first commit).
                        // watchFile works on nonexistent files — it fires when the file appears.
                        this.watchPath(refPath, function () {
                            _this.invalidate();
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    GitFileWatcher.prototype.onHeadChanged = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // HEAD changed — could be a branch switch or detach.
                        // Defer file I/O (readGitHead, watchFile setup) until scroll settles so
                        // watchFile callbacks that land mid-scroll don't compete for the event
                        // loop. invalidate() is cheap (just marks dirty) so do it first — the
                        // cache correctly serves stale-marked values until the watcher updates.
                        this.invalidate();
                        return [4 /*yield*/, (0, state_js_1.waitForScrollIdle)()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.watchCurrentBranchRef()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    GitFileWatcher.prototype.invalidate = function () {
        for (var _i = 0, _a = this.cache.values(); _i < _a.length; _i++) {
            var entry = _a[_i];
            entry.dirty = true;
        }
    };
    GitFileWatcher.prototype.stopWatching = function () {
        for (var _i = 0, _a = this.watchedPaths; _i < _a.length; _i++) {
            var path = _a[_i];
            (0, fs_1.unwatchFile)(path);
        }
        this.watchedPaths = [];
        this.branchRefPath = null;
    };
    /**
     * Get a cached value by key. On first call for a key, computes and caches it.
     * Subsequent calls return the cached value until a watched file changes,
     * which marks the entry dirty. The next get() re-computes from disk.
     *
     * Race condition handling: dirty is cleared BEFORE the async compute starts.
     * If a file change arrives during compute, it re-sets dirty, so the next
     * get() will re-read again rather than serving a stale value.
     */
    GitFileWatcher.prototype.get = function (key, compute) {
        return __awaiter(this, void 0, void 0, function () {
            var existing, value, entry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureStarted()];
                    case 1:
                        _a.sent();
                        existing = this.cache.get(key);
                        if (existing && !existing.dirty) {
                            return [2 /*return*/, existing.value];
                        }
                        // Clear dirty before compute — if the file changes again during the
                        // async read, invalidate() will re-set dirty and we'll re-read on
                        // the next get() call.
                        if (existing) {
                            existing.dirty = false;
                        }
                        return [4 /*yield*/, compute()
                            // Only update the cached value if no new invalidation arrived during compute
                        ];
                    case 2:
                        value = _a.sent();
                        entry = this.cache.get(key);
                        if (entry && !entry.dirty) {
                            entry.value = value;
                        }
                        if (!entry) {
                            this.cache.set(key, { value: value, dirty: false, compute: compute });
                        }
                        return [2 /*return*/, value];
                }
            });
        });
    };
    /** Reset all state. Stops file watchers. For testing only. */
    GitFileWatcher.prototype.reset = function () {
        this.stopWatching();
        this.cache.clear();
        this.initialized = false;
        this.initPromise = null;
        this.gitDir = null;
        this.commonDir = null;
    };
    return GitFileWatcher;
}());
var gitWatcher = new GitFileWatcher();
function computeBranch() {
    return __awaiter(this, void 0, void 0, function () {
        var gitDir, head;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, resolveGitDir()];
                case 1:
                    gitDir = _a.sent();
                    if (!gitDir) {
                        return [2 /*return*/, 'HEAD'];
                    }
                    return [4 /*yield*/, readGitHead(gitDir)];
                case 2:
                    head = _a.sent();
                    if (!head) {
                        return [2 /*return*/, 'HEAD'];
                    }
                    return [2 /*return*/, head.type === 'branch' ? head.name : 'HEAD'];
            }
        });
    });
}
function computeHead() {
    return __awaiter(this, void 0, void 0, function () {
        var gitDir, head;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, resolveGitDir()];
                case 1:
                    gitDir = _b.sent();
                    if (!gitDir) {
                        return [2 /*return*/, ''];
                    }
                    return [4 /*yield*/, readGitHead(gitDir)];
                case 2:
                    head = _b.sent();
                    if (!head) {
                        return [2 /*return*/, ''];
                    }
                    if (!(head.type === 'branch')) return [3 /*break*/, 4];
                    return [4 /*yield*/, resolveRef(gitDir, "refs/heads/".concat(head.name))];
                case 3: return [2 /*return*/, (_a = (_b.sent())) !== null && _a !== void 0 ? _a : ''];
                case 4: return [2 /*return*/, head.sha];
            }
        });
    });
}
function computeRemoteUrl() {
    return __awaiter(this, void 0, void 0, function () {
        var gitDir, url, commonDir;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, resolveGitDir()];
                case 1:
                    gitDir = _a.sent();
                    if (!gitDir) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, (0, gitConfigParser_js_1.parseGitConfigValue)(gitDir, 'remote', 'origin', 'url')];
                case 2:
                    url = _a.sent();
                    if (url) {
                        return [2 /*return*/, url];
                    }
                    return [4 /*yield*/, getCommonDir(gitDir)];
                case 3:
                    commonDir = _a.sent();
                    if (commonDir && commonDir !== gitDir) {
                        return [2 /*return*/, (0, gitConfigParser_js_1.parseGitConfigValue)(commonDir, 'remote', 'origin', 'url')];
                    }
                    return [2 /*return*/, null];
            }
        });
    });
}
function computeDefaultBranch() {
    return __awaiter(this, void 0, void 0, function () {
        var gitDir, commonDir, branchFromSymref, _i, _a, candidate, sha;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, resolveGitDir()];
                case 1:
                    gitDir = _c.sent();
                    if (!gitDir) {
                        return [2 /*return*/, 'main'];
                    }
                    return [4 /*yield*/, getCommonDir(gitDir)];
                case 2:
                    commonDir = (_b = (_c.sent())) !== null && _b !== void 0 ? _b : gitDir;
                    return [4 /*yield*/, readRawSymref(commonDir, 'refs/remotes/origin/HEAD', 'refs/remotes/origin/')];
                case 3:
                    branchFromSymref = _c.sent();
                    if (branchFromSymref) {
                        return [2 /*return*/, branchFromSymref];
                    }
                    _i = 0, _a = ['main', 'master'];
                    _c.label = 4;
                case 4:
                    if (!(_i < _a.length)) return [3 /*break*/, 7];
                    candidate = _a[_i];
                    return [4 /*yield*/, resolveRef(commonDir, "refs/remotes/origin/".concat(candidate))];
                case 5:
                    sha = _c.sent();
                    if (sha) {
                        return [2 /*return*/, candidate];
                    }
                    _c.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 4];
                case 7: return [2 /*return*/, 'main'];
            }
        });
    });
}
function getCachedBranch() {
    return gitWatcher.get('branch', computeBranch);
}
function getCachedHead() {
    return gitWatcher.get('head', computeHead);
}
function getCachedRemoteUrl() {
    return gitWatcher.get('remoteUrl', computeRemoteUrl);
}
function getCachedDefaultBranch() {
    return gitWatcher.get('defaultBranch', computeDefaultBranch);
}
/** Reset the git file watcher state. For testing only. */
function resetGitFileWatcher() {
    gitWatcher.reset();
}
/**
 * Read the HEAD SHA for an arbitrary directory (not using the watcher).
 * Used by plugins that need the HEAD of a specific repo, not the CWD repo.
 */
function getHeadForDir(cwd) {
    return __awaiter(this, void 0, void 0, function () {
        var gitDir, head;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, resolveGitDir(cwd)];
                case 1:
                    gitDir = _a.sent();
                    if (!gitDir) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, readGitHead(gitDir)];
                case 2:
                    head = _a.sent();
                    if (!head) {
                        return [2 /*return*/, null];
                    }
                    if (head.type === 'branch') {
                        return [2 /*return*/, resolveRef(gitDir, "refs/heads/".concat(head.name))];
                    }
                    return [2 /*return*/, head.sha];
            }
        });
    });
}
/**
 * Read the HEAD SHA for a git worktree directory (not the main repo).
 *
 * Unlike `getHeadForDir`, this reads `<worktreePath>/.git` directly as a
 * `gitdir:` pointer file, with no upward walk. `getHeadForDir` walks upward
 * via `findGitRoot` and would find the parent repo's `.git` when the
 * worktree path doesn't exist — misreporting the parent HEAD as the worktree's.
 *
 * Returns null if the worktree doesn't exist (`.git` pointer ENOENT) or is
 * malformed. Caller can treat null as "not a valid worktree".
 */
function readWorktreeHeadSha(worktreePath) {
    return __awaiter(this, void 0, void 0, function () {
        var gitDir, ptr, _a, head;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, promises_1.readFile)((0, path_1.join)(worktreePath, '.git'), 'utf-8')];
                case 1:
                    ptr = (_b.sent()).trim();
                    if (!ptr.startsWith('gitdir:')) {
                        return [2 /*return*/, null];
                    }
                    gitDir = (0, path_1.resolve)(worktreePath, ptr.slice('gitdir:'.length).trim());
                    return [3 /*break*/, 3];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, null];
                case 3: return [4 /*yield*/, readGitHead(gitDir)];
                case 4:
                    head = _b.sent();
                    if (!head) {
                        return [2 /*return*/, null];
                    }
                    if (head.type === 'branch') {
                        return [2 /*return*/, resolveRef(gitDir, "refs/heads/".concat(head.name))];
                    }
                    return [2 /*return*/, head.sha];
            }
        });
    });
}
/**
 * Read the remote origin URL for an arbitrary directory via .git/config.
 */
function getRemoteUrlForDir(cwd) {
    return __awaiter(this, void 0, void 0, function () {
        var gitDir, url, commonDir;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, resolveGitDir(cwd)];
                case 1:
                    gitDir = _a.sent();
                    if (!gitDir) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, (0, gitConfigParser_js_1.parseGitConfigValue)(gitDir, 'remote', 'origin', 'url')];
                case 2:
                    url = _a.sent();
                    if (url) {
                        return [2 /*return*/, url];
                    }
                    return [4 /*yield*/, getCommonDir(gitDir)];
                case 3:
                    commonDir = _a.sent();
                    if (commonDir && commonDir !== gitDir) {
                        return [2 /*return*/, (0, gitConfigParser_js_1.parseGitConfigValue)(commonDir, 'remote', 'origin', 'url')];
                    }
                    return [2 /*return*/, null];
            }
        });
    });
}
/**
 * Check if we're in a shallow clone by looking for <commonDir>/shallow.
 * Per git's shallow.c, mere existence of the file means shallow.
 * The shallow file lives in commonDir, not the per-worktree gitDir.
 */
function isShallowClone() {
    return __awaiter(this, void 0, void 0, function () {
        var gitDir, commonDir, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, resolveGitDir()];
                case 1:
                    gitDir = _c.sent();
                    if (!gitDir) {
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, getCommonDir(gitDir)];
                case 2:
                    commonDir = (_b = (_c.sent())) !== null && _b !== void 0 ? _b : gitDir;
                    _c.label = 3;
                case 3:
                    _c.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, (0, promises_1.stat)((0, path_1.join)(commonDir, 'shallow'))];
                case 4:
                    _c.sent();
                    return [2 /*return*/, true];
                case 5:
                    _a = _c.sent();
                    return [2 /*return*/, false];
                case 6: return [2 /*return*/];
            }
        });
    });
}
/**
 * Count worktrees by reading <commonDir>/worktrees/ directory.
 * The worktrees/ directory lives in commonDir, not the per-worktree gitDir.
 * The main worktree is not listed there, so add 1.
 */
function getWorktreeCountFromFs() {
    return __awaiter(this, void 0, void 0, function () {
        var gitDir, commonDir, entries, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, resolveGitDir()];
                case 1:
                    gitDir = _c.sent();
                    if (!gitDir) {
                        return [2 /*return*/, 0];
                    }
                    return [4 /*yield*/, getCommonDir(gitDir)];
                case 2:
                    commonDir = (_b = (_c.sent())) !== null && _b !== void 0 ? _b : gitDir;
                    return [4 /*yield*/, (0, promises_1.readdir)((0, path_1.join)(commonDir, 'worktrees'))];
                case 3:
                    entries = _c.sent();
                    return [2 /*return*/, entries.length + 1];
                case 4:
                    _a = _c.sent();
                    // No worktrees directory means only the main worktree
                    return [2 /*return*/, 1];
                case 5: return [2 /*return*/];
            }
        });
    });
}
