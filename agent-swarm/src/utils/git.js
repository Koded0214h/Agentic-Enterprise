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
exports.stashToCleanState = exports.getWorktreeCount = exports.getFileStatus = exports.getChangedFiles = exports.getIsClean = exports.hasUnpushedCommits = exports.getIsHeadOnRemote = exports.getRemoteUrl = exports.getDefaultBranch = exports.getBranch = exports.getHead = exports.dirIsInGitRepo = exports.getIsGit = exports.gitExe = exports.findCanonicalGitRoot = exports.findGitRoot = void 0;
exports.getGitDir = getGitDir;
exports.isAtGitRoot = isAtGitRoot;
exports.normalizeGitRemoteUrl = normalizeGitRemoteUrl;
exports.getRepoRemoteHash = getRepoRemoteHash;
exports.getGitState = getGitState;
exports.getGithubRepo = getGithubRepo;
exports.findRemoteBase = findRemoteBase;
exports.preserveGitStateForIssue = preserveGitStateForIssue;
exports.isCurrentDirectoryBareGitRepo = isCurrentDirectoryBareGitRepo;
var crypto_1 = require("crypto");
var fs_1 = require("fs");
var promises_1 = require("fs/promises");
var memoize_js_1 = require("lodash-es/memoize.js");
var path_1 = require("path");
var files_js_1 = require("../constants/files.js");
var cwd_js_1 = require("./cwd.js");
var debug_js_1 = require("./debug.js");
var diagLogs_js_1 = require("./diagLogs.js");
var execFileNoThrow_js_1 = require("./execFileNoThrow.js");
var fsOperations_js_1 = require("./fsOperations.js");
var gitFilesystem_js_1 = require("./git/gitFilesystem.js");
var log_js_1 = require("./log.js");
var memoize_js_2 = require("./memoize.js");
var which_js_1 = require("./which.js");
var GIT_ROOT_NOT_FOUND = Symbol('git-root-not-found');
var findGitRootImpl = (0, memoize_js_2.memoizeWithLRU)(function (startPath) {
    var startTime = Date.now();
    (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'find_git_root_started');
    var current = (0, path_1.resolve)(startPath);
    var root = current.substring(0, current.indexOf(path_1.sep) + 1) || path_1.sep;
    var statCount = 0;
    while (current !== root) {
        try {
            var gitPath = (0, path_1.join)(current, '.git');
            statCount++;
            var stat_1 = (0, fs_1.statSync)(gitPath);
            // .git can be a directory (regular repo) or file (worktree/submodule)
            if (stat_1.isDirectory() || stat_1.isFile()) {
                (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'find_git_root_completed', {
                    duration_ms: Date.now() - startTime,
                    stat_count: statCount,
                    found: true,
                });
                return current.normalize('NFC');
            }
        }
        catch (_a) {
            // .git doesn't exist at this level, continue up
        }
        var parent_1 = (0, path_1.dirname)(current);
        if (parent_1 === current) {
            break;
        }
        current = parent_1;
    }
    // Check root directory as well
    try {
        var gitPath = (0, path_1.join)(root, '.git');
        statCount++;
        var stat_2 = (0, fs_1.statSync)(gitPath);
        if (stat_2.isDirectory() || stat_2.isFile()) {
            (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'find_git_root_completed', {
                duration_ms: Date.now() - startTime,
                stat_count: statCount,
                found: true,
            });
            return root.normalize('NFC');
        }
    }
    catch (_b) {
        // .git doesn't exist at root
    }
    (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'find_git_root_completed', {
        duration_ms: Date.now() - startTime,
        stat_count: statCount,
        found: false,
    });
    return GIT_ROOT_NOT_FOUND;
}, function (path) { return path; }, 50);
/**
 * Find the git root by walking up the directory tree.
 * Looks for a .git directory or file (worktrees/submodules use a file).
 * Returns the directory containing .git, or null if not found.
 *
 * Memoized per startPath with an LRU cache (max 50 entries) to prevent
 * unbounded growth — gitDiff calls this with dirname(file), so editing many
 * files across different directories would otherwise accumulate entries forever.
 */
exports.findGitRoot = createFindGitRoot();
function createFindGitRoot() {
    function wrapper(startPath) {
        var result = findGitRootImpl(startPath);
        return result === GIT_ROOT_NOT_FOUND ? null : result;
    }
    wrapper.cache = findGitRootImpl.cache;
    return wrapper;
}
/**
 * Resolve a git root to the canonical main repository root.
 * For a regular repo this is a no-op. For a worktree, follows the
 * `.git` file → `gitdir:` → `commondir` chain to find the main repo's
 * working directory.
 *
 * Submodules (`.git` is a file but no `commondir`) fall through to the
 * input root, which is correct since submodules are separate repos.
 *
 * Memoized with a small LRU to avoid repeated file reads on the hot
 * path (permission checks, prompt building).
 */
var resolveCanonicalRoot = (0, memoize_js_2.memoizeWithLRU)(function (gitRoot) {
    try {
        // In a worktree, .git is a file containing: gitdir: <path>
        // In a regular repo, .git is a directory (readFileSync throws EISDIR).
        var gitContent = (0, fs_1.readFileSync)((0, path_1.join)(gitRoot, '.git'), 'utf-8').trim();
        if (!gitContent.startsWith('gitdir:')) {
            return gitRoot;
        }
        var worktreeGitDir = (0, path_1.resolve)(gitRoot, gitContent.slice('gitdir:'.length).trim());
        // commondir points to the shared .git directory (relative to worktree gitdir).
        // Submodules have no commondir (readFileSync throws ENOENT) → fall through.
        var commonDir = (0, path_1.resolve)(worktreeGitDir, (0, fs_1.readFileSync)((0, path_1.join)(worktreeGitDir, 'commondir'), 'utf-8').trim());
        // SECURITY: The .git file and commondir are attacker-controlled in a
        // cloned/downloaded repo. Without validation, a malicious repo can point
        // commondir at any path the victim has trusted, bypassing the trust
        // dialog and executing hooks from .claude/settings.json on startup.
        //
        // Validate the structure matches what `git worktree add` creates:
        //   1. worktreeGitDir is a direct child of <commonDir>/worktrees/
        //      → ensures the commondir file we read lives inside the resolved
        //        common dir, not inside the attacker's repo
        //   2. <worktreeGitDir>/gitdir points back to <gitRoot>/.git
        //      → ensures an attacker can't borrow a victim's existing worktree
        //        entry by guessing its path
        // Both are required: (1) alone fails if victim has a worktree of the
        // trusted repo; (2) alone fails because attacker controls worktreeGitDir.
        if ((0, path_1.resolve)((0, path_1.dirname)(worktreeGitDir)) !== (0, path_1.join)(commonDir, 'worktrees')) {
            return gitRoot;
        }
        // Git writes gitdir with strbuf_realpath() (symlinks resolved), but
        // gitRoot from findGitRoot() is only lexically resolved. Realpath gitRoot
        // so legitimate worktrees accessed via a symlinked path (e.g. macOS
        // /tmp → /private/tmp) aren't rejected. Realpath the directory then join
        // '.git' — realpathing the .git file itself would follow a symlinked .git
        // and let an attacker borrow a victim's back-link.
        var backlink = (0, fs_1.realpathSync)((0, fs_1.readFileSync)((0, path_1.join)(worktreeGitDir, 'gitdir'), 'utf-8').trim());
        if (backlink !== (0, path_1.join)((0, fs_1.realpathSync)(gitRoot), '.git')) {
            return gitRoot;
        }
        // Bare-repo worktrees: the common dir isn't inside a working directory.
        // Use the common dir itself as the stable identity (anthropics/claude-code#27994).
        if ((0, path_1.basename)(commonDir) !== '.git') {
            return commonDir.normalize('NFC');
        }
        return (0, path_1.dirname)(commonDir).normalize('NFC');
    }
    catch (_a) {
        return gitRoot;
    }
}, function (root) { return root; }, 50);
/**
 * Find the canonical git repository root, resolving through worktrees.
 *
 * Unlike findGitRoot, which returns the worktree directory (where the `.git`
 * file lives), this returns the main repository's working directory. This
 * ensures all worktrees of the same repo map to the same project identity.
 *
 * Use this instead of findGitRoot for project-scoped state (auto-memory,
 * project config, agent memory) so worktrees share state with the main repo.
 */
exports.findCanonicalGitRoot = createFindCanonicalGitRoot();
function createFindCanonicalGitRoot() {
    function wrapper(startPath) {
        var root = (0, exports.findGitRoot)(startPath);
        if (!root) {
            return null;
        }
        return resolveCanonicalRoot(root);
    }
    wrapper.cache = resolveCanonicalRoot.cache;
    return wrapper;
}
exports.gitExe = (0, memoize_js_1.default)(function () {
    // Every time we spawn a process, we have to lookup the path.
    // Let's instead avoid that lookup so we only do it once.
    return (0, which_js_1.whichSync)('git') || 'git';
});
exports.getIsGit = (0, memoize_js_1.default)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var startTime, isGit;
    return __generator(this, function (_a) {
        startTime = Date.now();
        (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'is_git_check_started');
        isGit = (0, exports.findGitRoot)((0, cwd_js_1.getCwd)()) !== null;
        (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'is_git_check_completed', {
            duration_ms: Date.now() - startTime,
            is_git: isGit,
        });
        return [2 /*return*/, isGit];
    });
}); });
function getGitDir(cwd) {
    return (0, gitFilesystem_js_1.resolveGitDir)(cwd);
}
function isAtGitRoot() {
    return __awaiter(this, void 0, void 0, function () {
        var cwd, gitRoot, _a, resolvedCwd, resolvedGitRoot, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    cwd = (0, cwd_js_1.getCwd)();
                    gitRoot = (0, exports.findGitRoot)(cwd);
                    if (!gitRoot) {
                        return [2 /*return*/, false];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, Promise.all([
                            (0, promises_1.realpath)(cwd),
                            (0, promises_1.realpath)(gitRoot),
                        ])];
                case 2:
                    _a = _c.sent(), resolvedCwd = _a[0], resolvedGitRoot = _a[1];
                    return [2 /*return*/, resolvedCwd === resolvedGitRoot];
                case 3:
                    _b = _c.sent();
                    return [2 /*return*/, cwd === gitRoot];
                case 4: return [2 /*return*/];
            }
        });
    });
}
var dirIsInGitRepo = function (cwd) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, exports.findGitRoot)(cwd) !== null];
    });
}); };
exports.dirIsInGitRepo = dirIsInGitRepo;
var getHead = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, gitFilesystem_js_1.getCachedHead)()];
    });
}); };
exports.getHead = getHead;
var getBranch = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, gitFilesystem_js_1.getCachedBranch)()];
    });
}); };
exports.getBranch = getBranch;
var getDefaultBranch = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, gitFilesystem_js_1.getCachedDefaultBranch)()];
    });
}); };
exports.getDefaultBranch = getDefaultBranch;
var getRemoteUrl = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, gitFilesystem_js_1.getCachedRemoteUrl)()];
    });
}); };
exports.getRemoteUrl = getRemoteUrl;
/**
 * Normalizes a git remote URL to a canonical form for hashing.
 * Converts SSH and HTTPS URLs to the same format: host/owner/repo (lowercase, no .git)
 *
 * Examples:
 * - git@github.com:owner/repo.git -> github.com/owner/repo
 * - https://github.com/owner/repo.git -> github.com/owner/repo
 * - ssh://git@github.com/owner/repo -> github.com/owner/repo
 * - http://local_proxy@127.0.0.1:16583/git/owner/repo -> github.com/owner/repo
 */
function normalizeGitRemoteUrl(url) {
    var trimmed = url.trim();
    if (!trimmed)
        return null;
    // Handle SSH format: git@host:owner/repo.git
    var sshMatch = trimmed.match(/^git@([^:]+):(.+?)(?:\.git)?$/);
    if (sshMatch && sshMatch[1] && sshMatch[2]) {
        return "".concat(sshMatch[1], "/").concat(sshMatch[2]).toLowerCase();
    }
    // Handle HTTPS/SSH URL format: https://host/owner/repo.git or ssh://git@host/owner/repo
    var urlMatch = trimmed.match(/^(?:https?|ssh):\/\/(?:[^@]+@)?([^/]+)\/(.+?)(?:\.git)?$/);
    if (urlMatch && urlMatch[1] && urlMatch[2]) {
        var host = urlMatch[1];
        var path = urlMatch[2];
        // CCR git proxy URLs use format:
        //   Legacy:  http://...@127.0.0.1:PORT/git/owner/repo       (github.com assumed)
        //   GHE:     http://...@127.0.0.1:PORT/git/ghe.host/owner/repo (host encoded in path)
        // Strip the /git/ prefix. If the first segment contains a dot, it's a
        // hostname (GitHub org names cannot contain dots). Otherwise assume github.com.
        if (isLocalHost(host) && path.startsWith('git/')) {
            var proxyPath = path.slice(4); // Remove "git/" prefix
            var segments = proxyPath.split('/');
            // 3+ segments where first contains a dot → host/owner/repo (GHE format)
            if (segments.length >= 3 && segments[0].includes('.')) {
                return proxyPath.toLowerCase();
            }
            // 2 segments → owner/repo (legacy format, assume github.com)
            return "github.com/".concat(proxyPath).toLowerCase();
        }
        return "".concat(host, "/").concat(path).toLowerCase();
    }
    return null;
}
/**
 * Returns a SHA256 hash (first 16 chars) of the normalized git remote URL.
 * This provides a globally unique identifier for the repository that:
 * - Is the same regardless of SSH vs HTTPS clone
 * - Does not expose the actual repository name in logs
 */
function getRepoRemoteHash() {
    return __awaiter(this, void 0, void 0, function () {
        var remoteUrl, normalized, hash;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, exports.getRemoteUrl)()];
                case 1:
                    remoteUrl = _a.sent();
                    if (!remoteUrl)
                        return [2 /*return*/, null];
                    normalized = normalizeGitRemoteUrl(remoteUrl);
                    if (!normalized)
                        return [2 /*return*/, null];
                    hash = (0, crypto_1.createHash)('sha256').update(normalized).digest('hex');
                    return [2 /*return*/, hash.substring(0, 16)];
            }
        });
    });
}
var getIsHeadOnRemote = function () { return __awaiter(void 0, void 0, void 0, function () {
    var code;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)((0, exports.gitExe)(), ['rev-parse', '@{u}'], {
                    preserveOutputOnError: false,
                })];
            case 1:
                code = (_a.sent()).code;
                return [2 /*return*/, code === 0];
        }
    });
}); };
exports.getIsHeadOnRemote = getIsHeadOnRemote;
var hasUnpushedCommits = function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, stdout, code;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)((0, exports.gitExe)(), ['rev-list', '--count', '@{u}..HEAD'], { preserveOutputOnError: false })];
            case 1:
                _a = _b.sent(), stdout = _a.stdout, code = _a.code;
                return [2 /*return*/, code === 0 && parseInt(stdout.trim(), 10) > 0];
        }
    });
}); };
exports.hasUnpushedCommits = hasUnpushedCommits;
var getIsClean = function (options) { return __awaiter(void 0, void 0, void 0, function () {
    var args, stdout;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                args = ['--no-optional-locks', 'status', '--porcelain'];
                if (options === null || options === void 0 ? void 0 : options.ignoreUntracked) {
                    args.push('-uno');
                }
                return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)((0, exports.gitExe)(), args, {
                        preserveOutputOnError: false,
                    })];
            case 1:
                stdout = (_a.sent()).stdout;
                return [2 /*return*/, stdout.trim().length === 0];
        }
    });
}); };
exports.getIsClean = getIsClean;
var getChangedFiles = function () { return __awaiter(void 0, void 0, void 0, function () {
    var stdout;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)((0, exports.gitExe)(), ['--no-optional-locks', 'status', '--porcelain'], {
                    preserveOutputOnError: false,
                })];
            case 1:
                stdout = (_a.sent()).stdout;
                return [2 /*return*/, stdout
                        .trim()
                        .split('\n')
                        .map(function (line) { var _a; return (_a = line.trim().split(' ', 2)[1]) === null || _a === void 0 ? void 0 : _a.trim(); }) // Remove status prefix (e.g., "M ", "A ", "??")
                        .filter(function (line) { return typeof line === 'string'; })]; // Remove empty entries
        }
    });
}); };
exports.getChangedFiles = getChangedFiles;
var getFileStatus = function () { return __awaiter(void 0, void 0, void 0, function () {
    var stdout, tracked, untracked;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)((0, exports.gitExe)(), ['--no-optional-locks', 'status', '--porcelain'], {
                    preserveOutputOnError: false,
                })];
            case 1:
                stdout = (_a.sent()).stdout;
                tracked = [];
                untracked = [];
                stdout
                    .trim()
                    .split('\n')
                    .filter(function (line) { return line.length > 0; })
                    .forEach(function (line) {
                    var status = line.substring(0, 2);
                    var filename = line.substring(2).trim();
                    if (status === '??') {
                        untracked.push(filename);
                    }
                    else if (filename) {
                        tracked.push(filename);
                    }
                });
                return [2 /*return*/, { tracked: tracked, untracked: untracked }];
        }
    });
}); };
exports.getFileStatus = getFileStatus;
var getWorktreeCount = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, gitFilesystem_js_1.getWorktreeCountFromFs)()];
    });
}); };
exports.getWorktreeCount = getWorktreeCount;
/**
 * Stashes all changes (including untracked files) to return git to a clean porcelain state
 * Important: This function stages untracked files before stashing to prevent data loss
 * @param message - Optional custom message for the stash
 * @returns Promise<boolean> - true if stash was successful, false otherwise
 */
var stashToCleanState = function (message) { return __awaiter(void 0, void 0, void 0, function () {
    var stashMessage, untracked, addCode, code, _1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                stashMessage = message || "Claude Code auto-stash - ".concat(new Date().toISOString());
                return [4 /*yield*/, (0, exports.getFileStatus)()
                    // If we have untracked files, add them to the index first
                    // This prevents them from being deleted
                ];
            case 1:
                untracked = (_a.sent()).untracked;
                if (!(untracked.length > 0)) return [3 /*break*/, 3];
                return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)((0, exports.gitExe)(), __spreadArray(['add'], untracked, true), { preserveOutputOnError: false })];
            case 2:
                addCode = (_a.sent()).code;
                if (addCode !== 0) {
                    return [2 /*return*/, false];
                }
                _a.label = 3;
            case 3: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)((0, exports.gitExe)(), ['stash', 'push', '--message', stashMessage], { preserveOutputOnError: false })];
            case 4:
                code = (_a.sent()).code;
                return [2 /*return*/, code === 0];
            case 5:
                _1 = _a.sent();
                return [2 /*return*/, false];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.stashToCleanState = stashToCleanState;
function getGitState() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, commitHash, branchName, remoteUrl, isHeadOnRemote, isClean, worktreeCount, _2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Promise.all([
                            (0, exports.getHead)(),
                            (0, exports.getBranch)(),
                            (0, exports.getRemoteUrl)(),
                            (0, exports.getIsHeadOnRemote)(),
                            (0, exports.getIsClean)(),
                            (0, exports.getWorktreeCount)(),
                        ])];
                case 1:
                    _a = _b.sent(), commitHash = _a[0], branchName = _a[1], remoteUrl = _a[2], isHeadOnRemote = _a[3], isClean = _a[4], worktreeCount = _a[5];
                    return [2 /*return*/, {
                            commitHash: commitHash,
                            branchName: branchName,
                            remoteUrl: remoteUrl,
                            isHeadOnRemote: isHeadOnRemote,
                            isClean: isClean,
                            worktreeCount: worktreeCount,
                        }];
                case 2:
                    _2 = _b.sent();
                    // Fail silently - git state is best effort
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function getGithubRepo() {
    return __awaiter(this, void 0, void 0, function () {
        var parseGitRemote, remoteUrl, parsed, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('./detectRepository.js'); })];
                case 1:
                    parseGitRemote = (_a.sent()).parseGitRemote;
                    return [4 /*yield*/, (0, exports.getRemoteUrl)()];
                case 2:
                    remoteUrl = _a.sent();
                    if (!remoteUrl) {
                        (0, debug_js_1.logForDebugging)('Local GitHub repo: unknown');
                        return [2 /*return*/, null];
                    }
                    parsed = parseGitRemote(remoteUrl);
                    if (parsed && parsed.host === 'github.com') {
                        result = "".concat(parsed.owner, "/").concat(parsed.name);
                        (0, debug_js_1.logForDebugging)("Local GitHub repo: ".concat(result));
                        return [2 /*return*/, result];
                    }
                    (0, debug_js_1.logForDebugging)('Local GitHub repo: unknown');
                    return [2 /*return*/, null];
            }
        });
    });
}
// Size limits for untracked file capture
var MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024; // 500MB per file
var MAX_TOTAL_SIZE_BYTES = 5 * 1024 * 1024 * 1024; // 5GB total
var MAX_FILE_COUNT = 20000;
// Initial read buffer for binary detection + content reuse. 64KB covers
// most source files in a single read; isBinaryContent() internally scans
// only its first 8KB for the binary heuristic, so the extra bytes are
// purely for avoiding a second read when the file turns out to be text.
var SNIFF_BUFFER_SIZE = 64 * 1024;
/**
 * Find the best remote branch to use as a base.
 * Priority: tracking branch > origin/main > origin/staging > origin/master
 */
function findRemoteBase() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, trackingBranch, trackingCode, _b, remoteRefs, remoteCode, match, candidates, _i, candidates_1, candidate, code;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)((0, exports.gitExe)(), ['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'], { preserveOutputOnError: false })];
                case 1:
                    _a = _c.sent(), trackingBranch = _a.stdout, trackingCode = _a.code;
                    if (trackingCode === 0 && trackingBranch.trim()) {
                        return [2 /*return*/, trackingBranch.trim()];
                    }
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)((0, exports.gitExe)(), ['remote', 'show', 'origin', '--', 'HEAD'], { preserveOutputOnError: false })];
                case 2:
                    _b = _c.sent(), remoteRefs = _b.stdout, remoteCode = _b.code;
                    if (remoteCode === 0) {
                        match = remoteRefs.match(/HEAD branch: (\S+)/);
                        if (match && match[1]) {
                            return [2 /*return*/, "origin/".concat(match[1])];
                        }
                    }
                    candidates = ['origin/main', 'origin/staging', 'origin/master'];
                    _i = 0, candidates_1 = candidates;
                    _c.label = 3;
                case 3:
                    if (!(_i < candidates_1.length)) return [3 /*break*/, 6];
                    candidate = candidates_1[_i];
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)((0, exports.gitExe)(), ['rev-parse', '--verify', candidate], { preserveOutputOnError: false })];
                case 4:
                    code = (_c.sent()).code;
                    if (code === 0) {
                        return [2 /*return*/, candidate];
                    }
                    _c.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [2 /*return*/, null];
            }
        });
    });
}
/**
 * Check if we're in a shallow clone by looking for <gitDir>/shallow.
 */
function isShallowClone() {
    return (0, gitFilesystem_js_1.isShallowClone)();
}
/**
 * Capture untracked files (git diff doesn't include them).
 * Respects size limits and skips binary files.
 */
function captureUntrackedFiles() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, stdout, code, trimmed, files, result, totalSize, _i, files_1, filePath, stats, fileSize, sniffSize, fd, sniffBuf, bytesRead, sniff, content, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)((0, exports.gitExe)(), ['ls-files', '--others', '--exclude-standard'], { preserveOutputOnError: false })];
                case 1:
                    _a = _b.sent(), stdout = _a.stdout, code = _a.code;
                    trimmed = stdout.trim();
                    if (code !== 0 || !trimmed) {
                        return [2 /*return*/, []];
                    }
                    files = trimmed.split('\n').filter(Boolean);
                    result = [];
                    totalSize = 0;
                    _i = 0, files_1 = files;
                    _b.label = 2;
                case 2:
                    if (!(_i < files_1.length)) return [3 /*break*/, 16];
                    filePath = files_1[_i];
                    // Check file count limit
                    if (result.length >= MAX_FILE_COUNT) {
                        (0, debug_js_1.logForDebugging)("Untracked file capture: reached max file count (".concat(MAX_FILE_COUNT, ")"));
                        return [3 /*break*/, 16];
                    }
                    // Skip binary files by extension - zero I/O
                    if ((0, files_js_1.hasBinaryExtension)(filePath)) {
                        return [3 /*break*/, 15];
                    }
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 14, , 15]);
                    return [4 /*yield*/, (0, promises_1.stat)(filePath)];
                case 4:
                    stats = _b.sent();
                    fileSize = stats.size;
                    // Skip files exceeding per-file limit
                    if (fileSize > MAX_FILE_SIZE_BYTES) {
                        (0, debug_js_1.logForDebugging)("Untracked file capture: skipping ".concat(filePath, " (exceeds ").concat(MAX_FILE_SIZE_BYTES, " bytes)"));
                        return [3 /*break*/, 15];
                    }
                    // Check total size limit
                    if (totalSize + fileSize > MAX_TOTAL_SIZE_BYTES) {
                        (0, debug_js_1.logForDebugging)("Untracked file capture: reached total size limit (".concat(MAX_TOTAL_SIZE_BYTES, " bytes)"));
                        return [3 /*break*/, 16];
                    }
                    // Empty file - no need to open
                    if (fileSize === 0) {
                        result.push({ path: filePath, content: '' });
                        return [3 /*break*/, 15];
                    }
                    sniffSize = Math.min(SNIFF_BUFFER_SIZE, fileSize);
                    return [4 /*yield*/, (0, promises_1.open)(filePath, 'r')];
                case 5:
                    fd = _b.sent();
                    _b.label = 6;
                case 6:
                    _b.trys.push([6, , 11, 13]);
                    sniffBuf = Buffer.alloc(sniffSize);
                    return [4 /*yield*/, fd.read(sniffBuf, 0, sniffSize, 0)];
                case 7:
                    bytesRead = (_b.sent()).bytesRead;
                    sniff = sniffBuf.subarray(0, bytesRead);
                    if ((0, files_js_1.isBinaryContent)(sniff)) {
                        return [3 /*break*/, 15];
                    }
                    content = void 0;
                    if (!(fileSize <= sniffSize)) return [3 /*break*/, 8];
                    // Sniff already covers the whole file
                    content = sniff.toString('utf-8');
                    return [3 /*break*/, 10];
                case 8: return [4 /*yield*/, (0, promises_1.readFile)(filePath, 'utf-8')];
                case 9:
                    // readFile with encoding decodes to string directly, avoiding a
                    // full-size Buffer living alongside the decoded string. The extra
                    // open/close is cheaper than doubling peak memory for large files.
                    content = _b.sent();
                    _b.label = 10;
                case 10:
                    result.push({ path: filePath, content: content });
                    totalSize += fileSize;
                    return [3 /*break*/, 13];
                case 11: return [4 /*yield*/, fd.close()];
                case 12:
                    _b.sent();
                    return [7 /*endfinally*/];
                case 13: return [3 /*break*/, 15];
                case 14:
                    err_1 = _b.sent();
                    // Skip files we can't read
                    (0, debug_js_1.logForDebugging)("Failed to read untracked file ".concat(filePath, ": ").concat(err_1));
                    return [3 /*break*/, 15];
                case 15:
                    _i++;
                    return [3 /*break*/, 2];
                case 16: return [2 /*return*/, result];
            }
        });
    });
}
/**
 * Preserve git state for issue submission.
 * Uses remote base for more stable replay capability.
 *
 * Edge cases handled:
 * - Detached HEAD: falls back to merge-base with default branch directly
 * - No remote: returns null for remote fields, uses HEAD-only mode
 * - Shallow clone: falls back to HEAD-only mode
 */
function preserveGitStateForIssue() {
    return __awaiter(this, void 0, void 0, function () {
        var isGit, _a, patch_1, untrackedFiles_1, remoteBase, _b, patch_2, untrackedFiles_2, _c, mergeBase, mergeBaseCode, _d, patch_3, untrackedFiles_3, remoteBaseSha, _e, patch, untrackedFiles, _f, formatPatchOut, formatPatchCode, headSha, branchName, formatPatch, trimmedBranch, err_2;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    _g.trys.push([0, 12, , 13]);
                    return [4 /*yield*/, (0, exports.getIsGit)()];
                case 1:
                    isGit = _g.sent();
                    if (!isGit) {
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, isShallowClone()];
                case 2:
                    if (!_g.sent()) return [3 /*break*/, 4];
                    (0, debug_js_1.logForDebugging)('Shallow clone detected, using HEAD-only mode for issue');
                    return [4 /*yield*/, Promise.all([
                            (0, execFileNoThrow_js_1.execFileNoThrow)((0, exports.gitExe)(), ['diff', 'HEAD']),
                            captureUntrackedFiles(),
                        ])];
                case 3:
                    _a = _g.sent(), patch_1 = _a[0].stdout, untrackedFiles_1 = _a[1];
                    return [2 /*return*/, {
                            remote_base_sha: null,
                            remote_base: null,
                            patch: patch_1 || '',
                            untracked_files: untrackedFiles_1,
                            format_patch: null,
                            head_sha: null,
                            branch_name: null,
                        }];
                case 4: return [4 /*yield*/, findRemoteBase()];
                case 5:
                    remoteBase = _g.sent();
                    if (!!remoteBase) return [3 /*break*/, 7];
                    // No remote found - use HEAD-only mode
                    (0, debug_js_1.logForDebugging)('No remote found, using HEAD-only mode for issue');
                    return [4 /*yield*/, Promise.all([
                            (0, execFileNoThrow_js_1.execFileNoThrow)((0, exports.gitExe)(), ['diff', 'HEAD']),
                            captureUntrackedFiles(),
                        ])];
                case 6:
                    _b = _g.sent(), patch_2 = _b[0].stdout, untrackedFiles_2 = _b[1];
                    return [2 /*return*/, {
                            remote_base_sha: null,
                            remote_base: null,
                            patch: patch_2 || '',
                            untracked_files: untrackedFiles_2,
                            format_patch: null,
                            head_sha: null,
                            branch_name: null,
                        }];
                case 7: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)((0, exports.gitExe)(), ['merge-base', 'HEAD', remoteBase], { preserveOutputOnError: false })];
                case 8:
                    _c = _g.sent(), mergeBase = _c.stdout, mergeBaseCode = _c.code;
                    if (!(mergeBaseCode !== 0 || !mergeBase.trim())) return [3 /*break*/, 10];
                    // Merge-base failed - fall back to HEAD-only
                    (0, debug_js_1.logForDebugging)('Merge-base failed, using HEAD-only mode for issue');
                    return [4 /*yield*/, Promise.all([
                            (0, execFileNoThrow_js_1.execFileNoThrow)((0, exports.gitExe)(), ['diff', 'HEAD']),
                            captureUntrackedFiles(),
                        ])];
                case 9:
                    _d = _g.sent(), patch_3 = _d[0].stdout, untrackedFiles_3 = _d[1];
                    return [2 /*return*/, {
                            remote_base_sha: null,
                            remote_base: null,
                            patch: patch_3 || '',
                            untracked_files: untrackedFiles_3,
                            format_patch: null,
                            head_sha: null,
                            branch_name: null,
                        }];
                case 10:
                    remoteBaseSha = mergeBase.trim();
                    return [4 /*yield*/, Promise.all([
                            // Patch from merge-base to current state (including staged changes)
                            (0, execFileNoThrow_js_1.execFileNoThrow)((0, exports.gitExe)(), ['diff', remoteBaseSha]),
                            // Untracked files captured separately
                            captureUntrackedFiles(),
                            // format-patch for committed changes between merge-base and HEAD.
                            // Preserves the actual commit chain (author, date, message) so replay
                            // containers can reconstruct the branch with real commits instead of a
                            // squashed diff. Uses --stdout to emit all patches as a single text stream.
                            (0, execFileNoThrow_js_1.execFileNoThrow)((0, exports.gitExe)(), [
                                'format-patch',
                                "".concat(remoteBaseSha, "..HEAD"),
                                '--stdout',
                            ]),
                            // HEAD SHA for replay
                            (0, execFileNoThrow_js_1.execFileNoThrow)((0, exports.gitExe)(), ['rev-parse', 'HEAD']),
                            // Branch name for replay
                            (0, execFileNoThrow_js_1.execFileNoThrow)((0, exports.gitExe)(), ['rev-parse', '--abbrev-ref', 'HEAD']),
                        ])];
                case 11:
                    _e = _g.sent(), patch = _e[0].stdout, untrackedFiles = _e[1], _f = _e[2], formatPatchOut = _f.stdout, formatPatchCode = _f.code, headSha = _e[3].stdout, branchName = _e[4].stdout;
                    formatPatch = null;
                    if (formatPatchCode === 0 && formatPatchOut && formatPatchOut.trim()) {
                        formatPatch = formatPatchOut;
                    }
                    trimmedBranch = branchName === null || branchName === void 0 ? void 0 : branchName.trim();
                    return [2 /*return*/, {
                            remote_base_sha: remoteBaseSha,
                            remote_base: remoteBase,
                            patch: patch || '',
                            untracked_files: untrackedFiles,
                            format_patch: formatPatch,
                            head_sha: (headSha === null || headSha === void 0 ? void 0 : headSha.trim()) || null,
                            branch_name: trimmedBranch && trimmedBranch !== 'HEAD' ? trimmedBranch : null,
                        }];
                case 12:
                    err_2 = _g.sent();
                    (0, log_js_1.logError)(err_2);
                    return [2 /*return*/, null];
                case 13: return [2 /*return*/];
            }
        });
    });
}
function isLocalHost(host) {
    var _a;
    var hostWithoutPort = (_a = host.split(':')[0]) !== null && _a !== void 0 ? _a : '';
    return (hostWithoutPort === 'localhost' ||
        /^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostWithoutPort));
}
/**
 * Checks if the current working directory appears to be a bare git repository
 * or has been manipulated to look like one (sandbox escape attack vector).
 *
 * SECURITY: Git's is_git_directory() function (setup.c:417-455) checks for:
 * 1. HEAD file - Must be a valid ref
 * 2. objects/ directory - Must exist and be accessible
 * 3. refs/ directory - Must exist and be accessible
 *
 * If all three exist in the current directory (not in a .git subdirectory),
 * Git treats the current directory as a bare repository and will execute
 * hooks/pre-commit and other hook scripts from the cwd.
 *
 * Attack scenario:
 * 1. Attacker creates HEAD, objects/, refs/, and hooks/pre-commit in cwd
 * 2. Attacker deletes or corrupts .git/HEAD to invalidate the normal git directory
 * 3. When user runs 'git status', Git treats cwd as the git dir and runs the hook
 *
 * @returns true if the cwd looks like a bare/exploited git directory
 */
/* eslint-disable custom-rules/no-sync-fs -- sync permission-eval check */
function isCurrentDirectoryBareGitRepo() {
    var fs = (0, fsOperations_js_1.getFsImplementation)();
    var cwd = (0, cwd_js_1.getCwd)();
    var gitPath = (0, path_1.join)(cwd, '.git');
    try {
        var stats = fs.statSync(gitPath);
        if (stats.isFile()) {
            // worktree/submodule — Git follows the gitdir reference
            return false;
        }
        if (stats.isDirectory()) {
            var gitHeadPath = (0, path_1.join)(gitPath, 'HEAD');
            try {
                // SECURITY: check isFile(). An attacker creating .git/HEAD as a
                // DIRECTORY would pass a bare statSync but Git's setup_git_directory
                // rejects it (not a valid HEAD) and falls back to cwd discovery.
                if (fs.statSync(gitHeadPath).isFile()) {
                    // normal repo — .git/HEAD valid, Git won't fall back to cwd
                    return false;
                }
                // .git/HEAD exists but is not a regular file — fall through
            }
            catch (_a) {
                // .git exists but no HEAD — fall through to bare-repo check
            }
        }
    }
    catch (_b) {
        // no .git — fall through to bare-repo indicator check
    }
    // No valid .git/HEAD found. Check if cwd has bare git repo indicators.
    // Be cautious — flag if ANY of these exist without a valid .git reference.
    // Per-indicator try/catch so an error on one doesn't mask another.
    try {
        if (fs.statSync((0, path_1.join)(cwd, 'HEAD')).isFile())
            return true;
    }
    catch (_c) {
        // no HEAD
    }
    try {
        if (fs.statSync((0, path_1.join)(cwd, 'objects')).isDirectory())
            return true;
    }
    catch (_d) {
        // no objects/
    }
    try {
        if (fs.statSync((0, path_1.join)(cwd, 'refs')).isDirectory())
            return true;
    }
    catch (_e) {
        // no refs/
    }
    return false;
}
/* eslint-enable custom-rules/no-sync-fs */
