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
exports.validateWorktreeSlug = validateWorktreeSlug;
exports.getCurrentWorktreeSession = getCurrentWorktreeSession;
exports.restoreWorktreeSession = restoreWorktreeSession;
exports.generateTmuxSessionName = generateTmuxSessionName;
exports.worktreeBranchName = worktreeBranchName;
exports.copyWorktreeIncludeFiles = copyWorktreeIncludeFiles;
exports.parsePRReference = parsePRReference;
exports.isTmuxAvailable = isTmuxAvailable;
exports.getTmuxInstallInstructions = getTmuxInstallInstructions;
exports.createTmuxSessionForWorktree = createTmuxSessionForWorktree;
exports.killTmuxSession = killTmuxSession;
exports.createWorktreeForSession = createWorktreeForSession;
exports.keepWorktree = keepWorktree;
exports.cleanupWorktree = cleanupWorktree;
exports.createAgentWorktree = createAgentWorktree;
exports.removeAgentWorktree = removeAgentWorktree;
exports.cleanupStaleAgentWorktrees = cleanupStaleAgentWorktrees;
exports.hasWorktreeChanges = hasWorktreeChanges;
exports.execIntoTmuxWorktree = execIntoTmuxWorktree;
var bun_bundle_1 = require("bun:bundle");
var chalk_1 = require("chalk");
var child_process_1 = require("child_process");
var promises_1 = require("fs/promises");
var ignore_1 = require("ignore");
var path_1 = require("path");
var config_js_1 = require("./config.js");
var cwd_js_1 = require("./cwd.js");
var debug_js_1 = require("./debug.js");
var errors_js_1 = require("./errors.js");
var execFileNoThrow_js_1 = require("./execFileNoThrow.js");
var gitConfigParser_js_1 = require("./git/gitConfigParser.js");
var gitFilesystem_js_1 = require("./git/gitFilesystem.js");
var git_js_1 = require("./git.js");
var hooks_js_1 = require("./hooks.js");
var path_js_1 = require("./path.js");
var platform_js_1 = require("./platform.js");
var settings_js_1 = require("./settings/settings.js");
var sleep_js_1 = require("./sleep.js");
var detection_js_1 = require("./swarm/backends/detection.js");
var VALID_WORKTREE_SLUG_SEGMENT = /^[a-zA-Z0-9._-]+$/;
var MAX_WORKTREE_SLUG_LENGTH = 64;
/**
 * Validates a worktree slug to prevent path traversal and directory escape.
 *
 * The slug is joined into `.claude/worktrees/<slug>` via path.join, which
 * normalizes `..` segments — so `../../../target` would escape the worktrees
 * directory. Similarly, an absolute path (leading `/` or `C:\`) would discard
 * the prefix entirely.
 *
 * Forward slashes are allowed for nesting (e.g. `asm/feature-foo`); each
 * segment is validated independently against the allowlist, so `.` / `..`
 * segments and drive-spec characters are still rejected.
 *
 * Throws synchronously — callers rely on this running before any side effects
 * (git commands, hook execution, chdir).
 */
function validateWorktreeSlug(slug) {
    if (slug.length > MAX_WORKTREE_SLUG_LENGTH) {
        throw new Error("Invalid worktree name: must be ".concat(MAX_WORKTREE_SLUG_LENGTH, " characters or fewer (got ").concat(slug.length, ")"));
    }
    // Leading or trailing `/` would make path.join produce an absolute path
    // or a dangling segment. Splitting and validating each segment rejects
    // both (empty segments fail the regex) while allowing `user/feature`.
    for (var _i = 0, _a = slug.split('/'); _i < _a.length; _i++) {
        var segment = _a[_i];
        if (segment === '.' || segment === '..') {
            throw new Error("Invalid worktree name \"".concat(slug, "\": must not contain \".\" or \"..\" path segments"));
        }
        if (!VALID_WORKTREE_SLUG_SEGMENT.test(segment)) {
            throw new Error("Invalid worktree name \"".concat(slug, "\": each \"/\"-separated segment must be non-empty and contain only letters, digits, dots, underscores, and dashes"));
        }
    }
}
// Helper function to create directories recursively
function mkdirRecursive(dirPath) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, promises_1.mkdir)(dirPath, { recursive: true })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Symlinks directories from the main repository to avoid duplication.
 * This prevents disk bloat from duplicating node_modules and other large directories.
 *
 * @param repoRootPath - Path to the main repository root
 * @param worktreePath - Path to the worktree directory
 * @param dirsToSymlink - Array of directory names to symlink (e.g., ['node_modules'])
 */
function symlinkDirectories(repoRootPath, worktreePath, dirsToSymlink) {
    return __awaiter(this, void 0, void 0, function () {
        var _i, dirsToSymlink_1, dir, sourcePath, destPath, error_1, code;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _i = 0, dirsToSymlink_1 = dirsToSymlink;
                    _a.label = 1;
                case 1:
                    if (!(_i < dirsToSymlink_1.length)) return [3 /*break*/, 6];
                    dir = dirsToSymlink_1[_i];
                    // Validate directory doesn't escape repository boundaries
                    if ((0, path_js_1.containsPathTraversal)(dir)) {
                        (0, debug_js_1.logForDebugging)("Skipping symlink for \"".concat(dir, "\": path traversal detected"), { level: 'warn' });
                        return [3 /*break*/, 5];
                    }
                    sourcePath = (0, path_1.join)(repoRootPath, dir);
                    destPath = (0, path_1.join)(worktreePath, dir);
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, promises_1.symlink)(sourcePath, destPath, 'dir')];
                case 3:
                    _a.sent();
                    (0, debug_js_1.logForDebugging)("Symlinked ".concat(dir, " from main repository to worktree to avoid disk bloat"));
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    code = (0, errors_js_1.getErrnoCode)(error_1);
                    // ENOENT: source doesn't exist yet (expected - skip silently)
                    // EEXIST: destination already exists (expected - skip silently)
                    if (code !== 'ENOENT' && code !== 'EEXIST') {
                        // Unexpected error (e.g., permission denied, unsupported platform)
                        (0, debug_js_1.logForDebugging)("Failed to symlink ".concat(dir, " (").concat(code !== null && code !== void 0 ? code : 'unknown', "): ").concat((0, errors_js_1.errorMessage)(error_1)), { level: 'warn' });
                    }
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/];
            }
        });
    });
}
var currentWorktreeSession = null;
function getCurrentWorktreeSession() {
    return currentWorktreeSession;
}
/**
 * Restore the worktree session on --resume. The caller must have already
 * verified the directory exists (via process.chdir) and set the bootstrap
 * state (cwd, originalCwd).
 */
function restoreWorktreeSession(session) {
    currentWorktreeSession = session;
}
function generateTmuxSessionName(repoPath, branch) {
    var repoName = (0, path_1.basename)(repoPath);
    var combined = "".concat(repoName, "_").concat(branch);
    return combined.replace(/[/.]/g, '_');
}
// Env vars to prevent git/SSH from prompting for credentials (which hangs the CLI).
// GIT_TERMINAL_PROMPT=0 prevents git from opening /dev/tty for credential prompts.
// GIT_ASKPASS='' disables askpass GUI programs.
// stdin: 'ignore' closes stdin so interactive prompts can't block.
var GIT_NO_PROMPT_ENV = {
    GIT_TERMINAL_PROMPT: '0',
    GIT_ASKPASS: '',
};
function worktreesDir(repoRoot) {
    return (0, path_1.join)(repoRoot, '.claude', 'worktrees');
}
// Flatten nested slugs (`user/feature` → `user+feature`) for both the branch
// name and the directory path. Nesting in either location is unsafe:
//   - git refs: `worktree-user` (file) vs `worktree-user/feature` (needs dir)
//     is a D/F conflict that git rejects.
//   - directory: `.claude/worktrees/user/feature/` lives inside the `user`
//     worktree; `git worktree remove` on the parent deletes children with
//     uncommitted work.
// `+` is valid in git branch names and filesystem paths but NOT in the
// slug-segment allowlist ([a-zA-Z0-9._-]), so the mapping is injective.
function flattenSlug(slug) {
    return slug.replaceAll('/', '+');
}
function worktreeBranchName(slug) {
    return "worktree-".concat(flattenSlug(slug));
}
function worktreePathFor(repoRoot, slug) {
    return (0, path_1.join)(worktreesDir(repoRoot), flattenSlug(slug));
}
/**
 * Creates a new git worktree for the given slug, or resumes it if it already exists.
 * Named worktrees reuse the same path across invocations, so the existence check
 * prevents unconditionally running `git fetch` (which can hang waiting for credentials)
 * on every resume.
 */
function getOrCreateWorktree(repoRoot, slug, options) {
    return __awaiter(this, void 0, void 0, function () {
        var worktreePath, worktreeBranch, existingHead, fetchEnv, baseBranch, baseSha, _a, prFetchCode, prFetchStderr, _b, defaultBranch, gitDir, originRef, originSha, _c, fetchCode, _d, stdout, shaCode, sparsePaths, addArgs, _e, createCode, createStderr, tearDown, _f, sparseCode, sparseErr, _g, coCode, coErr;
        var _this = this;
        var _h;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    worktreePath = worktreePathFor(repoRoot, slug);
                    worktreeBranch = worktreeBranchName(slug);
                    return [4 /*yield*/, (0, gitFilesystem_js_1.readWorktreeHeadSha)(worktreePath)];
                case 1:
                    existingHead = _j.sent();
                    if (existingHead) {
                        return [2 /*return*/, {
                                worktreePath: worktreePath,
                                worktreeBranch: worktreeBranch,
                                headCommit: existingHead,
                                existed: true,
                            }];
                    }
                    // New worktree: fetch base branch then add
                    return [4 /*yield*/, (0, promises_1.mkdir)(worktreesDir(repoRoot), { recursive: true })];
                case 2:
                    // New worktree: fetch base branch then add
                    _j.sent();
                    fetchEnv = __assign(__assign({}, process.env), GIT_NO_PROMPT_ENV);
                    baseSha = null;
                    if (!(options === null || options === void 0 ? void 0 : options.prNumber)) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), ['fetch', 'origin', "pull/".concat(options.prNumber, "/head")], { cwd: repoRoot, stdin: 'ignore', env: fetchEnv })];
                case 3:
                    _a = _j.sent(), prFetchCode = _a.code, prFetchStderr = _a.stderr;
                    if (prFetchCode !== 0) {
                        throw new Error("Failed to fetch PR #".concat(options.prNumber, ": ").concat(prFetchStderr.trim() || 'PR may not exist or the repository may not have a remote named "origin"'));
                    }
                    baseBranch = 'FETCH_HEAD';
                    return [3 /*break*/, 11];
                case 4: return [4 /*yield*/, Promise.all([
                        (0, git_js_1.getDefaultBranch)(),
                        (0, gitFilesystem_js_1.resolveGitDir)(repoRoot),
                    ])];
                case 5:
                    _b = _j.sent(), defaultBranch = _b[0], gitDir = _b[1];
                    originRef = "origin/".concat(defaultBranch);
                    if (!gitDir) return [3 /*break*/, 7];
                    return [4 /*yield*/, (0, gitFilesystem_js_1.resolveRef)(gitDir, "refs/remotes/origin/".concat(defaultBranch))];
                case 6:
                    _c = _j.sent();
                    return [3 /*break*/, 8];
                case 7:
                    _c = null;
                    _j.label = 8;
                case 8:
                    originSha = _c;
                    if (!originSha) return [3 /*break*/, 9];
                    baseBranch = originRef;
                    baseSha = originSha;
                    return [3 /*break*/, 11];
                case 9: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), ['fetch', 'origin', defaultBranch], { cwd: repoRoot, stdin: 'ignore', env: fetchEnv })];
                case 10:
                    fetchCode = (_j.sent()).code;
                    baseBranch = fetchCode === 0 ? originRef : 'HEAD';
                    _j.label = 11;
                case 11:
                    if (!!baseSha) return [3 /*break*/, 13];
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), ['rev-parse', baseBranch], { cwd: repoRoot })];
                case 12:
                    _d = _j.sent(), stdout = _d.stdout, shaCode = _d.code;
                    if (shaCode !== 0) {
                        throw new Error("Failed to resolve base branch \"".concat(baseBranch, "\": git rev-parse failed"));
                    }
                    baseSha = stdout.trim();
                    _j.label = 13;
                case 13:
                    sparsePaths = (_h = (0, settings_js_1.getInitialSettings)().worktree) === null || _h === void 0 ? void 0 : _h.sparsePaths;
                    addArgs = ['worktree', 'add'];
                    if (sparsePaths === null || sparsePaths === void 0 ? void 0 : sparsePaths.length) {
                        addArgs.push('--no-checkout');
                    }
                    // -B (not -b): reset any orphan branch left behind by a removed worktree dir.
                    // Saves a `git branch -D` subprocess (~15ms spawn overhead) on every create.
                    addArgs.push('-B', worktreeBranch, worktreePath, baseBranch);
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), addArgs, { cwd: repoRoot })];
                case 14:
                    _e = _j.sent(), createCode = _e.code, createStderr = _e.stderr;
                    if (createCode !== 0) {
                        throw new Error("Failed to create worktree: ".concat(createStderr));
                    }
                    if (!(sparsePaths === null || sparsePaths === void 0 ? void 0 : sparsePaths.length)) return [3 /*break*/, 20];
                    tearDown = function (msg) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), ['worktree', 'remove', '--force', worktreePath], { cwd: repoRoot })];
                                case 1:
                                    _a.sent();
                                    throw new Error(msg);
                            }
                        });
                    }); };
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), __spreadArray(['sparse-checkout', 'set', '--cone', '--'], sparsePaths, true), { cwd: worktreePath })];
                case 15:
                    _f = _j.sent(), sparseCode = _f.code, sparseErr = _f.stderr;
                    if (!(sparseCode !== 0)) return [3 /*break*/, 17];
                    return [4 /*yield*/, tearDown("Failed to configure sparse-checkout: ".concat(sparseErr))];
                case 16:
                    _j.sent();
                    _j.label = 17;
                case 17: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), ['checkout', 'HEAD'], { cwd: worktreePath })];
                case 18:
                    _g = _j.sent(), coCode = _g.code, coErr = _g.stderr;
                    if (!(coCode !== 0)) return [3 /*break*/, 20];
                    return [4 /*yield*/, tearDown("Failed to checkout sparse worktree: ".concat(coErr))];
                case 19:
                    _j.sent();
                    _j.label = 20;
                case 20: return [2 /*return*/, {
                        worktreePath: worktreePath,
                        worktreeBranch: worktreeBranch,
                        headCommit: baseSha,
                        baseBranch: baseBranch,
                        existed: false,
                    }];
            }
        });
    });
}
/**
 * Copy gitignored files specified in .worktreeinclude from base repo to worktree.
 *
 * Only copies files that are BOTH:
 * 1. Matched by patterns in .worktreeinclude (uses .gitignore syntax)
 * 2. Gitignored (not tracked by git)
 *
 * Uses `git ls-files --others --ignored --exclude-standard --directory` to list
 * gitignored entries with fully-ignored dirs collapsed to single entries (so large
 * build outputs like node_modules/ don't force a full tree walk), then filters
 * against .worktreeinclude patterns in-process using the `ignore` library. If a
 * .worktreeinclude pattern explicitly targets a path inside a collapsed directory,
 * that directory is expanded with a second scoped `ls-files` call.
 */
function copyWorktreeIncludeFiles(repoRoot, worktreePath) {
    return __awaiter(this, void 0, void 0, function () {
        var includeContent, _a, patterns, gitignored, entries, matcher, collapsedDirs, files, dirsToExpand, expanded, _i, _b, f, copied, _c, files_1, relativePath, srcPath, destPath, e_1;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, promises_1.readFile)((0, path_1.join)(repoRoot, '.worktreeinclude'), 'utf-8')];
                case 1:
                    includeContent = _d.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _a = _d.sent();
                    return [2 /*return*/, []];
                case 3:
                    patterns = includeContent
                        .split(/\r?\n/)
                        .map(function (line) { return line.trim(); })
                        .filter(function (line) { return line.length > 0 && !line.startsWith('#'); });
                    if (patterns.length === 0) {
                        return [2 /*return*/, []];
                    }
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), ['ls-files', '--others', '--ignored', '--exclude-standard', '--directory'], { cwd: repoRoot })];
                case 4:
                    gitignored = _d.sent();
                    if (gitignored.code !== 0 || !gitignored.stdout.trim()) {
                        return [2 /*return*/, []];
                    }
                    entries = gitignored.stdout.trim().split('\n').filter(Boolean);
                    matcher = (0, ignore_1.default)().add(includeContent);
                    collapsedDirs = entries.filter(function (e) { return e.endsWith('/'); });
                    files = entries.filter(function (e) { return !e.endsWith('/') && matcher.ignores(e); });
                    dirsToExpand = collapsedDirs.filter(function (dir) {
                        if (patterns.some(function (p) {
                            var normalized = p.startsWith('/') ? p.slice(1) : p;
                            // Literal prefix match: pattern starts with the collapsed dir path
                            if (normalized.startsWith(dir))
                                return true;
                            // Anchored glob: dir falls under the pattern's literal (non-glob) prefix
                            // e.g. `config/**/*.key` has literal prefix `config/` → expand `config/secrets/`
                            var globIdx = normalized.search(/[*?[]/);
                            if (globIdx > 0) {
                                var literalPrefix = normalized.slice(0, globIdx);
                                if (dir.startsWith(literalPrefix))
                                    return true;
                            }
                            return false;
                        }))
                            return true;
                        if (matcher.ignores(dir.slice(0, -1)))
                            return true;
                        return false;
                    });
                    if (!(dirsToExpand.length > 0)) return [3 /*break*/, 6];
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), __spreadArray([
                            'ls-files',
                            '--others',
                            '--ignored',
                            '--exclude-standard',
                            '--'
                        ], dirsToExpand, true), { cwd: repoRoot })];
                case 5:
                    expanded = _d.sent();
                    if (expanded.code === 0 && expanded.stdout.trim()) {
                        for (_i = 0, _b = expanded.stdout.trim().split('\n').filter(Boolean); _i < _b.length; _i++) {
                            f = _b[_i];
                            if (matcher.ignores(f)) {
                                files.push(f);
                            }
                        }
                    }
                    _d.label = 6;
                case 6:
                    copied = [];
                    _c = 0, files_1 = files;
                    _d.label = 7;
                case 7:
                    if (!(_c < files_1.length)) return [3 /*break*/, 13];
                    relativePath = files_1[_c];
                    srcPath = (0, path_1.join)(repoRoot, relativePath);
                    destPath = (0, path_1.join)(worktreePath, relativePath);
                    _d.label = 8;
                case 8:
                    _d.trys.push([8, 11, , 12]);
                    return [4 /*yield*/, (0, promises_1.mkdir)((0, path_1.dirname)(destPath), { recursive: true })];
                case 9:
                    _d.sent();
                    return [4 /*yield*/, (0, promises_1.copyFile)(srcPath, destPath)];
                case 10:
                    _d.sent();
                    copied.push(relativePath);
                    return [3 /*break*/, 12];
                case 11:
                    e_1 = _d.sent();
                    (0, debug_js_1.logForDebugging)("Failed to copy ".concat(relativePath, " to worktree: ").concat(e_1.message), { level: 'warn' });
                    return [3 /*break*/, 12];
                case 12:
                    _c++;
                    return [3 /*break*/, 7];
                case 13:
                    if (copied.length > 0) {
                        (0, debug_js_1.logForDebugging)("Copied ".concat(copied.length, " files from .worktreeinclude: ").concat(copied.join(', ')));
                    }
                    return [2 /*return*/, copied];
            }
        });
    });
}
/**
 * Post-creation setup for a newly created worktree.
 * Propagates settings.local.json, configures git hooks, and symlinks directories.
 */
function performPostCreationSetup(repoRoot, worktreePath) {
    return __awaiter(this, void 0, void 0, function () {
        var localSettingsRelativePath, sourceSettingsLocal, destSettingsLocal, e_2, code, huskyPath, gitHooksPath, hooksPath, _i, _a, candidatePath, s, _b, gitDir, configDir, _c, existing, _d, _e, configCode, configError, settings, dirsToSymlink, worktreeHooksDir_1;
        var _f, _g, _h;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    localSettingsRelativePath = (0, settings_js_1.getRelativeSettingsFilePathForSource)('localSettings');
                    sourceSettingsLocal = (0, path_1.join)(repoRoot, localSettingsRelativePath);
                    _j.label = 1;
                case 1:
                    _j.trys.push([1, 4, , 5]);
                    destSettingsLocal = (0, path_1.join)(worktreePath, localSettingsRelativePath);
                    return [4 /*yield*/, mkdirRecursive((0, path_1.dirname)(destSettingsLocal))];
                case 2:
                    _j.sent();
                    return [4 /*yield*/, (0, promises_1.copyFile)(sourceSettingsLocal, destSettingsLocal)];
                case 3:
                    _j.sent();
                    (0, debug_js_1.logForDebugging)("Copied settings.local.json to worktree: ".concat(destSettingsLocal));
                    return [3 /*break*/, 5];
                case 4:
                    e_2 = _j.sent();
                    code = (0, errors_js_1.getErrnoCode)(e_2);
                    if (code !== 'ENOENT') {
                        (0, debug_js_1.logForDebugging)("Failed to copy settings.local.json: ".concat(e_2.message), { level: 'warn' });
                    }
                    return [3 /*break*/, 5];
                case 5:
                    huskyPath = (0, path_1.join)(repoRoot, '.husky');
                    gitHooksPath = (0, path_1.join)(repoRoot, '.git', 'hooks');
                    hooksPath = null;
                    _i = 0, _a = [huskyPath, gitHooksPath];
                    _j.label = 6;
                case 6:
                    if (!(_i < _a.length)) return [3 /*break*/, 11];
                    candidatePath = _a[_i];
                    _j.label = 7;
                case 7:
                    _j.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, (0, promises_1.stat)(candidatePath)];
                case 8:
                    s = _j.sent();
                    if (s.isDirectory()) {
                        hooksPath = candidatePath;
                        return [3 /*break*/, 11];
                    }
                    return [3 /*break*/, 10];
                case 9:
                    _b = _j.sent();
                    return [3 /*break*/, 10];
                case 10:
                    _i++;
                    return [3 /*break*/, 6];
                case 11:
                    if (!hooksPath) return [3 /*break*/, 20];
                    return [4 /*yield*/, (0, gitFilesystem_js_1.resolveGitDir)(repoRoot)];
                case 12:
                    gitDir = _j.sent();
                    if (!gitDir) return [3 /*break*/, 14];
                    return [4 /*yield*/, (0, gitFilesystem_js_1.getCommonDir)(gitDir)];
                case 13:
                    _c = ((_f = (_j.sent())) !== null && _f !== void 0 ? _f : gitDir);
                    return [3 /*break*/, 15];
                case 14:
                    _c = null;
                    _j.label = 15;
                case 15:
                    configDir = _c;
                    if (!configDir) return [3 /*break*/, 17];
                    return [4 /*yield*/, (0, gitConfigParser_js_1.parseGitConfigValue)(configDir, 'core', null, 'hooksPath')];
                case 16:
                    _d = _j.sent();
                    return [3 /*break*/, 18];
                case 17:
                    _d = null;
                    _j.label = 18;
                case 18:
                    existing = _d;
                    if (!(existing !== hooksPath)) return [3 /*break*/, 20];
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), ['config', 'core.hooksPath', hooksPath], { cwd: worktreePath })];
                case 19:
                    _e = _j.sent(), configCode = _e.code, configError = _e.stderr;
                    if (configCode === 0) {
                        (0, debug_js_1.logForDebugging)("Configured worktree to use hooks from main repository: ".concat(hooksPath));
                    }
                    else {
                        (0, debug_js_1.logForDebugging)("Failed to configure hooks path: ".concat(configError), {
                            level: 'error',
                        });
                    }
                    _j.label = 20;
                case 20:
                    settings = (0, settings_js_1.getInitialSettings)();
                    dirsToSymlink = (_h = (_g = settings.worktree) === null || _g === void 0 ? void 0 : _g.symlinkDirectories) !== null && _h !== void 0 ? _h : [];
                    if (!(dirsToSymlink.length > 0)) return [3 /*break*/, 22];
                    return [4 /*yield*/, symlinkDirectories(repoRoot, worktreePath, dirsToSymlink)];
                case 21:
                    _j.sent();
                    _j.label = 22;
                case 22: 
                // Copy gitignored files specified in .worktreeinclude (best-effort)
                return [4 /*yield*/, copyWorktreeIncludeFiles(repoRoot, worktreePath)
                    // The core.hooksPath config-set above is fragile: husky's prepare script
                    // (`git config core.hooksPath .husky`) runs on every `bun install` and
                    // resets the SHARED .git/config value back to relative, causing each
                    // worktree to resolve to its OWN .husky/ again. The attribution hook
                    // file isn't tracked (it's in .git/info/exclude), so fresh worktrees
                    // don't have it. Install it directly into the worktree's .husky/ —
                    // husky won't delete it (husky install is additive-only), and for
                    // non-husky repos this resolves to the shared .git/hooks/ (idempotent).
                    //
                    // Pass the worktree-local .husky explicitly: getHooksDir would return
                    // the absolute core.hooksPath we just set above (main repo's .husky),
                    // not the worktree's — `git rev-parse --git-path hooks` echoes the config
                    // value verbatim when it's absolute.
                ];
                case 23:
                    // Copy gitignored files specified in .worktreeinclude (best-effort)
                    _j.sent();
                    // The core.hooksPath config-set above is fragile: husky's prepare script
                    // (`git config core.hooksPath .husky`) runs on every `bun install` and
                    // resets the SHARED .git/config value back to relative, causing each
                    // worktree to resolve to its OWN .husky/ again. The attribution hook
                    // file isn't tracked (it's in .git/info/exclude), so fresh worktrees
                    // don't have it. Install it directly into the worktree's .husky/ —
                    // husky won't delete it (husky install is additive-only), and for
                    // non-husky repos this resolves to the shared .git/hooks/ (idempotent).
                    //
                    // Pass the worktree-local .husky explicitly: getHooksDir would return
                    // the absolute core.hooksPath we just set above (main repo's .husky),
                    // not the worktree's — `git rev-parse --git-path hooks` echoes the config
                    // value verbatim when it's absolute.
                    if ((0, bun_bundle_1.feature)('COMMIT_ATTRIBUTION')) {
                        worktreeHooksDir_1 = hooksPath === huskyPath ? (0, path_1.join)(worktreePath, '.husky') : undefined;
                        void Promise.resolve().then(function () { return require('./postCommitAttribution.js'); }).then(function (m) {
                            return m
                                .installPrepareCommitMsgHook(worktreePath, worktreeHooksDir_1)
                                .catch(function (error) {
                                (0, debug_js_1.logForDebugging)("Failed to install attribution hook in worktree: ".concat(error));
                            });
                        })
                            .catch(function (error) {
                            // Dynamic import() itself rejected (module load failure). The inner
                            // .catch above only handles installPrepareCommitMsgHook rejection —
                            // without this outer handler an import failure would surface as an
                            // unhandled promise rejection.
                            (0, debug_js_1.logForDebugging)("Failed to load postCommitAttribution module: ".concat(error));
                        });
                    }
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Parses a PR reference from a string.
 * Accepts GitHub-style PR URLs (e.g., https://github.com/owner/repo/pull/123,
 * or GHE equivalents like https://ghe.example.com/owner/repo/pull/123)
 * or `#N` format (e.g., #123).
 * Returns the PR number or null if the string is not a recognized PR reference.
 */
function parsePRReference(input) {
    // GitHub-style PR URL: https://<host>/owner/repo/pull/123 (with optional trailing slash, query, hash)
    // The /pull/N path shape is specific to GitHub — GitLab uses /-/merge_requests/N,
    // Bitbucket uses /pull-requests/N — so matching any host here is safe.
    var urlMatch = input.match(/^https?:\/\/[^/]+\/[^/]+\/[^/]+\/pull\/(\d+)\/?(?:[?#].*)?$/i);
    if (urlMatch === null || urlMatch === void 0 ? void 0 : urlMatch[1]) {
        return parseInt(urlMatch[1], 10);
    }
    // #N format
    var hashMatch = input.match(/^#(\d+)$/);
    if (hashMatch === null || hashMatch === void 0 ? void 0 : hashMatch[1]) {
        return parseInt(hashMatch[1], 10);
    }
    return null;
}
function isTmuxAvailable() {
    return __awaiter(this, void 0, void 0, function () {
        var code;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('tmux', ['-V'])];
                case 1:
                    code = (_a.sent()).code;
                    return [2 /*return*/, code === 0];
            }
        });
    });
}
function getTmuxInstallInstructions() {
    var platform = (0, platform_js_1.getPlatform)();
    switch (platform) {
        case 'macos':
            return 'Install tmux with: brew install tmux';
        case 'linux':
        case 'wsl':
            return 'Install tmux with: sudo apt install tmux (Debian/Ubuntu) or sudo dnf install tmux (Fedora/RHEL)';
        case 'windows':
            return 'tmux is not natively available on Windows. Consider using WSL or Cygwin.';
        default:
            return 'Install tmux using your system package manager.';
    }
}
function createTmuxSessionForWorktree(sessionName, worktreePath) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, code, stderr;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('tmux', [
                        'new-session',
                        '-d',
                        '-s',
                        sessionName,
                        '-c',
                        worktreePath,
                    ])];
                case 1:
                    _a = _b.sent(), code = _a.code, stderr = _a.stderr;
                    if (code !== 0) {
                        return [2 /*return*/, { created: false, error: stderr }];
                    }
                    return [2 /*return*/, { created: true }];
            }
        });
    });
}
function killTmuxSession(sessionName) {
    return __awaiter(this, void 0, void 0, function () {
        var code;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('tmux', [
                        'kill-session',
                        '-t',
                        sessionName,
                    ])];
                case 1:
                    code = (_a.sent()).code;
                    return [2 /*return*/, code === 0];
            }
        });
    });
}
function createWorktreeForSession(sessionId, slug, tmuxSessionName, options) {
    return __awaiter(this, void 0, void 0, function () {
        var originalCwd, hookResult, gitRoot, originalBranch, createStart, _a, worktreePath, worktreeBranch, headCommit, existed, creationDurationMs;
        var _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    // Must run before the hook branch below — hooks receive the raw slug as an
                    // argument, and the git branch builds a path from it via path.join.
                    validateWorktreeSlug(slug);
                    originalCwd = (0, cwd_js_1.getCwd)();
                    if (!(0, hooks_js_1.hasWorktreeCreateHook)()) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, hooks_js_1.executeWorktreeCreateHook)(slug)];
                case 1:
                    hookResult = _e.sent();
                    (0, debug_js_1.logForDebugging)("Created hook-based worktree at: ".concat(hookResult.worktreePath));
                    currentWorktreeSession = {
                        originalCwd: originalCwd,
                        worktreePath: hookResult.worktreePath,
                        worktreeName: slug,
                        sessionId: sessionId,
                        tmuxSessionName: tmuxSessionName,
                        hookBased: true,
                    };
                    return [3 /*break*/, 8];
                case 2:
                    gitRoot = (0, git_js_1.findGitRoot)((0, cwd_js_1.getCwd)());
                    if (!gitRoot) {
                        throw new Error('Cannot create a worktree: not in a git repository and no WorktreeCreate hooks are configured. ' +
                            'Configure WorktreeCreate/WorktreeRemove hooks in settings.json to use worktree isolation with other VCS systems.');
                    }
                    return [4 /*yield*/, (0, git_js_1.getBranch)()];
                case 3:
                    originalBranch = _e.sent();
                    createStart = Date.now();
                    return [4 /*yield*/, getOrCreateWorktree(gitRoot, slug, options)];
                case 4:
                    _a = _e.sent(), worktreePath = _a.worktreePath, worktreeBranch = _a.worktreeBranch, headCommit = _a.headCommit, existed = _a.existed;
                    creationDurationMs = void 0;
                    if (!existed) return [3 /*break*/, 5];
                    (0, debug_js_1.logForDebugging)("Resuming existing worktree at: ".concat(worktreePath));
                    return [3 /*break*/, 7];
                case 5:
                    (0, debug_js_1.logForDebugging)("Created worktree at: ".concat(worktreePath, " on branch: ").concat(worktreeBranch));
                    return [4 /*yield*/, performPostCreationSetup(gitRoot, worktreePath)];
                case 6:
                    _e.sent();
                    creationDurationMs = Date.now() - createStart;
                    _e.label = 7;
                case 7:
                    currentWorktreeSession = {
                        originalCwd: originalCwd,
                        worktreePath: worktreePath,
                        worktreeName: slug,
                        worktreeBranch: worktreeBranch,
                        originalBranch: originalBranch,
                        originalHeadCommit: headCommit,
                        sessionId: sessionId,
                        tmuxSessionName: tmuxSessionName,
                        creationDurationMs: creationDurationMs,
                        usedSparsePaths: ((_d = (_c = (_b = (0, settings_js_1.getInitialSettings)().worktree) === null || _b === void 0 ? void 0 : _b.sparsePaths) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0) > 0,
                    };
                    _e.label = 8;
                case 8:
                    // Save to project config for persistence
                    (0, config_js_1.saveCurrentProjectConfig)(function (current) { return (__assign(__assign({}, current), { activeWorktreeSession: currentWorktreeSession !== null && currentWorktreeSession !== void 0 ? currentWorktreeSession : undefined })); });
                    return [2 /*return*/, currentWorktreeSession];
            }
        });
    });
}
function keepWorktree() {
    return __awaiter(this, void 0, void 0, function () {
        var worktreePath, originalCwd, worktreeBranch;
        return __generator(this, function (_a) {
            if (!currentWorktreeSession) {
                return [2 /*return*/];
            }
            try {
                worktreePath = currentWorktreeSession.worktreePath, originalCwd = currentWorktreeSession.originalCwd, worktreeBranch = currentWorktreeSession.worktreeBranch;
                // Change back to original directory first
                process.chdir(originalCwd);
                // Clear the session but keep the worktree intact
                currentWorktreeSession = null;
                // Update config
                (0, config_js_1.saveCurrentProjectConfig)(function (current) { return (__assign(__assign({}, current), { activeWorktreeSession: undefined })); });
                (0, debug_js_1.logForDebugging)("Linked worktree preserved at: ".concat(worktreePath).concat(worktreeBranch ? " on branch: ".concat(worktreeBranch) : ''));
                (0, debug_js_1.logForDebugging)("You can continue working there by running: cd ".concat(worktreePath));
            }
            catch (error) {
                (0, debug_js_1.logForDebugging)("Error keeping worktree: ".concat(error), {
                    level: 'error',
                });
            }
            return [2 /*return*/];
        });
    });
}
function cleanupWorktree() {
    return __awaiter(this, void 0, void 0, function () {
        var worktreePath, originalCwd, worktreeBranch, hookBased, hookRan, _a, removeCode, removeError, _b, deleteBranchCode, deleteBranchError, error_2;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!currentWorktreeSession) {
                        return [2 /*return*/];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 9, , 10]);
                    worktreePath = currentWorktreeSession.worktreePath, originalCwd = currentWorktreeSession.originalCwd, worktreeBranch = currentWorktreeSession.worktreeBranch, hookBased = currentWorktreeSession.hookBased;
                    // Change back to original directory first
                    process.chdir(originalCwd);
                    if (!hookBased) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, hooks_js_1.executeWorktreeRemoveHook)(worktreePath)];
                case 2:
                    hookRan = _c.sent();
                    if (hookRan) {
                        (0, debug_js_1.logForDebugging)("Removed hook-based worktree at: ".concat(worktreePath));
                    }
                    else {
                        (0, debug_js_1.logForDebugging)("No WorktreeRemove hook configured, hook-based worktree left at: ".concat(worktreePath), { level: 'warn' });
                    }
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), ['worktree', 'remove', '--force', worktreePath], { cwd: originalCwd })];
                case 4:
                    _a = _c.sent(), removeCode = _a.code, removeError = _a.stderr;
                    if (removeCode !== 0) {
                        (0, debug_js_1.logForDebugging)("Failed to remove linked worktree: ".concat(removeError), {
                            level: 'error',
                        });
                    }
                    else {
                        (0, debug_js_1.logForDebugging)("Removed linked worktree at: ".concat(worktreePath));
                    }
                    _c.label = 5;
                case 5:
                    // Clear the session
                    currentWorktreeSession = null;
                    // Update config
                    (0, config_js_1.saveCurrentProjectConfig)(function (current) { return (__assign(__assign({}, current), { activeWorktreeSession: undefined })); });
                    if (!(!hookBased && worktreeBranch)) return [3 /*break*/, 8];
                    // Wait a bit to ensure git has released all locks
                    return [4 /*yield*/, (0, sleep_js_1.sleep)(100)];
                case 6:
                    // Wait a bit to ensure git has released all locks
                    _c.sent();
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), ['branch', '-D', worktreeBranch], { cwd: originalCwd })];
                case 7:
                    _b = _c.sent(), deleteBranchCode = _b.code, deleteBranchError = _b.stderr;
                    if (deleteBranchCode !== 0) {
                        (0, debug_js_1.logForDebugging)("Could not delete worktree branch: ".concat(deleteBranchError), { level: 'error' });
                    }
                    else {
                        (0, debug_js_1.logForDebugging)("Deleted worktree branch: ".concat(worktreeBranch));
                    }
                    _c.label = 8;
                case 8:
                    (0, debug_js_1.logForDebugging)('Linked worktree cleaned up completely');
                    return [3 /*break*/, 10];
                case 9:
                    error_2 = _c.sent();
                    (0, debug_js_1.logForDebugging)("Error cleaning up worktree: ".concat(error_2), {
                        level: 'error',
                    });
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
/**
 * Create a lightweight worktree for a subagent.
 * Reuses getOrCreateWorktree/performPostCreationSetup but does NOT touch
 * global session state (currentWorktreeSession, process.chdir, project config).
 * Falls back to hook-based creation if not in a git repository.
 */
function createAgentWorktree(slug) {
    return __awaiter(this, void 0, void 0, function () {
        var hookResult, gitRoot, _a, worktreePath, worktreeBranch, headCommit, existed, now;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    validateWorktreeSlug(slug);
                    if (!(0, hooks_js_1.hasWorktreeCreateHook)()) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, hooks_js_1.executeWorktreeCreateHook)(slug)];
                case 1:
                    hookResult = _b.sent();
                    (0, debug_js_1.logForDebugging)("Created hook-based agent worktree at: ".concat(hookResult.worktreePath));
                    return [2 /*return*/, { worktreePath: hookResult.worktreePath, hookBased: true }];
                case 2:
                    gitRoot = (0, git_js_1.findCanonicalGitRoot)((0, cwd_js_1.getCwd)());
                    if (!gitRoot) {
                        throw new Error('Cannot create agent worktree: not in a git repository and no WorktreeCreate hooks are configured. ' +
                            'Configure WorktreeCreate/WorktreeRemove hooks in settings.json to use worktree isolation with other VCS systems.');
                    }
                    return [4 /*yield*/, getOrCreateWorktree(gitRoot, slug)];
                case 3:
                    _a = _b.sent(), worktreePath = _a.worktreePath, worktreeBranch = _a.worktreeBranch, headCommit = _a.headCommit, existed = _a.existed;
                    if (!!existed) return [3 /*break*/, 5];
                    (0, debug_js_1.logForDebugging)("Created agent worktree at: ".concat(worktreePath, " on branch: ").concat(worktreeBranch));
                    return [4 /*yield*/, performPostCreationSetup(gitRoot, worktreePath)];
                case 4:
                    _b.sent();
                    return [3 /*break*/, 7];
                case 5:
                    now = new Date();
                    return [4 /*yield*/, (0, promises_1.utimes)(worktreePath, now, now)];
                case 6:
                    _b.sent();
                    (0, debug_js_1.logForDebugging)("Resuming existing agent worktree at: ".concat(worktreePath));
                    _b.label = 7;
                case 7: return [2 /*return*/, { worktreePath: worktreePath, worktreeBranch: worktreeBranch, headCommit: headCommit, gitRoot: gitRoot }];
            }
        });
    });
}
/**
 * Remove a worktree created by createAgentWorktree.
 * For git-based worktrees, removes the worktree directory and deletes the temporary branch.
 * For hook-based worktrees, delegates to the WorktreeRemove hook.
 * Must be called with the main repo's git root (for git worktrees), not the worktree path,
 * since the worktree directory is deleted during this operation.
 */
function removeAgentWorktree(worktreePath, worktreeBranch, gitRoot, hookBased) {
    return __awaiter(this, void 0, void 0, function () {
        var hookRan, _a, removeCode, removeError, _b, deleteBranchCode, deleteBranchError;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!hookBased) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, hooks_js_1.executeWorktreeRemoveHook)(worktreePath)];
                case 1:
                    hookRan = _c.sent();
                    if (hookRan) {
                        (0, debug_js_1.logForDebugging)("Removed hook-based agent worktree at: ".concat(worktreePath));
                    }
                    else {
                        (0, debug_js_1.logForDebugging)("No WorktreeRemove hook configured, hook-based agent worktree left at: ".concat(worktreePath), { level: 'warn' });
                    }
                    return [2 /*return*/, hookRan];
                case 2:
                    if (!gitRoot) {
                        (0, debug_js_1.logForDebugging)('Cannot remove agent worktree: no git root provided', {
                            level: 'error',
                        });
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), ['worktree', 'remove', '--force', worktreePath], { cwd: gitRoot })];
                case 3:
                    _a = _c.sent(), removeCode = _a.code, removeError = _a.stderr;
                    if (removeCode !== 0) {
                        (0, debug_js_1.logForDebugging)("Failed to remove agent worktree: ".concat(removeError), {
                            level: 'error',
                        });
                        return [2 /*return*/, false];
                    }
                    (0, debug_js_1.logForDebugging)("Removed agent worktree at: ".concat(worktreePath));
                    if (!worktreeBranch) {
                        return [2 /*return*/, true];
                    }
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), ['branch', '-D', worktreeBranch], {
                            cwd: gitRoot,
                        })];
                case 4:
                    _b = _c.sent(), deleteBranchCode = _b.code, deleteBranchError = _b.stderr;
                    if (deleteBranchCode !== 0) {
                        (0, debug_js_1.logForDebugging)("Could not delete agent worktree branch: ".concat(deleteBranchError), { level: 'error' });
                    }
                    return [2 /*return*/, true];
            }
        });
    });
}
/**
 * Slug patterns for throwaway worktrees created by AgentTool (`agent-a<7hex>`,
 * from earlyAgentId.slice(0,8)), WorkflowTool (`wf_<runId>-<idx>` where runId
 * is randomUUID().slice(0,12) = 8 hex + `-` + 3 hex), and bridgeMain
 * (`bridge-<safeFilenameId>`). These leak when the parent process is killed
 * (Ctrl+C, ESC, crash) before their in-process cleanup runs. Exact-shape
 * patterns avoid sweeping user-named EnterWorktree slugs like `wf-myfeature`.
 */
var EPHEMERAL_WORKTREE_PATTERNS = [
    /^agent-a[0-9a-f]{7}$/,
    /^wf_[0-9a-f]{8}-[0-9a-f]{3}-\d+$/,
    // Legacy wf-<idx> slugs from before workflowRunId disambiguation — kept so
    // the 30-day sweep still cleans up worktrees leaked by older builds.
    /^wf-\d+$/,
    // Real bridge slugs are `bridge-${safeFilenameId(sessionId)}`.
    /^bridge-[A-Za-z0-9_]+(-[A-Za-z0-9_]+)*$/,
    // Template job worktrees: job-<templateName>-<8hex>. Prefix distinguishes
    // from user-named EnterWorktree slugs that happen to end in 8 hex.
    /^job-[a-zA-Z0-9._-]{1,55}-[0-9a-f]{8}$/,
];
/**
 * Remove stale agent/workflow worktrees older than cutoffDate.
 *
 * Safety:
 * - Only touches slugs matching ephemeral patterns (never user-named worktrees)
 * - Skips the current session's worktree
 * - Fail-closed: skips if git status fails or shows tracked changes
 *   (-uno: untracked files in a 30-day-old crashed agent worktree are build
 *   artifacts; skipping the untracked scan is 5-10× faster on large repos)
 * - Fail-closed: skips if any commits aren't reachable from a remote
 *
 * `git worktree remove --force` handles both the directory and git's internal
 * worktree tracking. If git doesn't recognize the path as a worktree (orphaned
 * dir), it's left in place — a later readdir finding it stale again is harmless.
 */
function cleanupStaleAgentWorktrees(cutoffDate) {
    return __awaiter(this, void 0, void 0, function () {
        var gitRoot, dir, entries, _a, cutoffMs, currentPath, removed, _loop_1, _i, entries_1, slug;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    gitRoot = (0, git_js_1.findCanonicalGitRoot)((0, cwd_js_1.getCwd)());
                    if (!gitRoot) {
                        return [2 /*return*/, 0];
                    }
                    dir = worktreesDir(gitRoot);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readdir)(dir)];
                case 2:
                    entries = _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [2 /*return*/, 0];
                case 4:
                    cutoffMs = cutoffDate.getTime();
                    currentPath = currentWorktreeSession === null || currentWorktreeSession === void 0 ? void 0 : currentWorktreeSession.worktreePath;
                    removed = 0;
                    _loop_1 = function (slug) {
                        var worktreePath, mtimeMs, _c, _d, status_1, unpushed;
                        return __generator(this, function (_e) {
                            switch (_e.label) {
                                case 0:
                                    if (!EPHEMERAL_WORKTREE_PATTERNS.some(function (p) { return p.test(slug); })) {
                                        return [2 /*return*/, "continue"];
                                    }
                                    worktreePath = (0, path_1.join)(dir, slug);
                                    if (currentPath === worktreePath) {
                                        return [2 /*return*/, "continue"];
                                    }
                                    mtimeMs = void 0;
                                    _e.label = 1;
                                case 1:
                                    _e.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, (0, promises_1.stat)(worktreePath)];
                                case 2:
                                    mtimeMs = (_e.sent()).mtimeMs;
                                    return [3 /*break*/, 4];
                                case 3:
                                    _c = _e.sent();
                                    return [2 /*return*/, "continue"];
                                case 4:
                                    if (mtimeMs >= cutoffMs) {
                                        return [2 /*return*/, "continue"];
                                    }
                                    return [4 /*yield*/, Promise.all([
                                            (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), ['--no-optional-locks', 'status', '--porcelain', '-uno'], { cwd: worktreePath }),
                                            (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), ['rev-list', '--max-count=1', 'HEAD', '--not', '--remotes'], { cwd: worktreePath }),
                                        ])];
                                case 5:
                                    _d = _e.sent(), status_1 = _d[0], unpushed = _d[1];
                                    if (status_1.code !== 0 || status_1.stdout.trim().length > 0) {
                                        return [2 /*return*/, "continue"];
                                    }
                                    if (unpushed.code !== 0 || unpushed.stdout.trim().length > 0) {
                                        return [2 /*return*/, "continue"];
                                    }
                                    return [4 /*yield*/, removeAgentWorktree(worktreePath, worktreeBranchName(slug), gitRoot)];
                                case 6:
                                    if (_e.sent()) {
                                        removed++;
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, entries_1 = entries;
                    _b.label = 5;
                case 5:
                    if (!(_i < entries_1.length)) return [3 /*break*/, 8];
                    slug = entries_1[_i];
                    return [5 /*yield**/, _loop_1(slug)];
                case 6:
                    _b.sent();
                    _b.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 5];
                case 8:
                    if (!(removed > 0)) return [3 /*break*/, 10];
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), ['worktree', 'prune'], {
                            cwd: gitRoot,
                        })];
                case 9:
                    _b.sent();
                    (0, debug_js_1.logForDebugging)("cleanupStaleAgentWorktrees: removed ".concat(removed, " stale worktree(s)"));
                    _b.label = 10;
                case 10: return [2 /*return*/, removed];
            }
        });
    });
}
/**
 * Check whether a worktree has uncommitted changes or new commits since creation.
 * Returns true if there are uncommitted changes (dirty working tree), if commits
 * were made on the worktree branch since `headCommit`, or if git commands fail
 * — callers use this to decide whether to remove a worktree, so fail-closed.
 */
function hasWorktreeChanges(worktreePath, headCommit) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, statusCode, statusOutput, _b, revListCode, revListOutput;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), ['status', '--porcelain'], {
                        cwd: worktreePath,
                    })];
                case 1:
                    _a = _c.sent(), statusCode = _a.code, statusOutput = _a.stdout;
                    if (statusCode !== 0) {
                        return [2 /*return*/, true];
                    }
                    if (statusOutput.trim().length > 0) {
                        return [2 /*return*/, true];
                    }
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), ['rev-list', '--count', "".concat(headCommit, "..HEAD")], { cwd: worktreePath })];
                case 2:
                    _b = _c.sent(), revListCode = _b.code, revListOutput = _b.stdout;
                    if (revListCode !== 0) {
                        return [2 /*return*/, true];
                    }
                    if (parseInt(revListOutput.trim(), 10) > 0) {
                        return [2 /*return*/, true];
                    }
                    return [2 /*return*/, false];
            }
        });
    });
}
/**
 * Fast-path handler for --worktree --tmux.
 * Creates the worktree and execs into tmux running Claude inside.
 * This is called early in cli.tsx before loading the full CLI.
 */
function execIntoTmuxWorktree(args) {
    return __awaiter(this, void 0, void 0, function () {
        var tmuxCheck, installHint, worktreeName, forceClassicTmux, i, arg, next, prNumber, adjectives, nouns, adj, noun, suffix, worktreeDir, repoName, hookResult, error_3, repoRoot, result, error_4, tmuxSessionName, newArgs, i, arg, next, tmuxPrefix, prefixResult, match, claudeBindings, prefixConflicts, tmuxEnv, hasSessionResult, sessionExists, isAlreadyInTmux, useControlMode, tmuxGlobalArgs, y, isAnt, isClaudeCliInternal, shouldSetupDevPanes, tmuxArgs;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    // Check platform - tmux doesn't work on Windows
                    if (process.platform === 'win32') {
                        return [2 /*return*/, {
                                handled: false,
                                error: 'Error: --tmux is not supported on Windows',
                            }];
                    }
                    tmuxCheck = (0, child_process_1.spawnSync)('tmux', ['-V'], { encoding: 'utf-8' });
                    if (tmuxCheck.status !== 0) {
                        installHint = process.platform === 'darwin'
                            ? 'Install tmux with: brew install tmux'
                            : 'Install tmux with: sudo apt install tmux';
                        return [2 /*return*/, {
                                handled: false,
                                error: "Error: tmux is not installed. ".concat(installHint),
                            }];
                    }
                    forceClassicTmux = false;
                    for (i = 0; i < args.length; i++) {
                        arg = args[i];
                        if (!arg)
                            continue;
                        if (arg === '-w' || arg === '--worktree') {
                            next = args[i + 1];
                            if (next && !next.startsWith('-')) {
                                worktreeName = next;
                            }
                        }
                        else if (arg.startsWith('--worktree=')) {
                            worktreeName = arg.slice('--worktree='.length);
                        }
                        else if (arg === '--tmux=classic') {
                            forceClassicTmux = true;
                        }
                    }
                    prNumber = null;
                    if (worktreeName) {
                        prNumber = parsePRReference(worktreeName);
                        if (prNumber !== null) {
                            worktreeName = "pr-".concat(prNumber);
                        }
                    }
                    // Generate a slug if no name provided
                    if (!worktreeName) {
                        adjectives = ['swift', 'bright', 'calm', 'keen', 'bold'];
                        nouns = ['fox', 'owl', 'elm', 'oak', 'ray'];
                        adj = adjectives[Math.floor(Math.random() * adjectives.length)];
                        noun = nouns[Math.floor(Math.random() * nouns.length)];
                        suffix = Math.random().toString(36).slice(2, 6);
                        worktreeName = "".concat(adj, "-").concat(noun, "-").concat(suffix);
                    }
                    // worktreeName is joined into worktreeDir via path.join below; apply the
                    // same allowlist used by the in-session worktree tool so the constraint
                    // holds uniformly regardless of entry point.
                    try {
                        validateWorktreeSlug(worktreeName);
                    }
                    catch (e) {
                        return [2 /*return*/, {
                                handled: false,
                                error: "Error: ".concat(e.message),
                            }];
                    }
                    if (!(0, hooks_js_1.hasWorktreeCreateHook)()) return [3 /*break*/, 5];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, hooks_js_1.executeWorktreeCreateHook)(worktreeName)];
                case 2:
                    hookResult = _b.sent();
                    worktreeDir = hookResult.worktreePath;
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _b.sent();
                    return [2 /*return*/, {
                            handled: false,
                            error: "Error: ".concat((0, errors_js_1.errorMessage)(error_3)),
                        }];
                case 4:
                    repoName = (0, path_1.basename)((_a = (0, git_js_1.findCanonicalGitRoot)((0, cwd_js_1.getCwd)())) !== null && _a !== void 0 ? _a : (0, cwd_js_1.getCwd)());
                    // biome-ignore lint/suspicious/noConsole: intentional console output
                    console.log("Using worktree via hook: ".concat(worktreeDir));
                    return [3 /*break*/, 11];
                case 5:
                    repoRoot = (0, git_js_1.findCanonicalGitRoot)((0, cwd_js_1.getCwd)());
                    if (!repoRoot) {
                        return [2 /*return*/, {
                                handled: false,
                                error: 'Error: --worktree requires a git repository',
                            }];
                    }
                    repoName = (0, path_1.basename)(repoRoot);
                    worktreeDir = worktreePathFor(repoRoot, worktreeName);
                    _b.label = 6;
                case 6:
                    _b.trys.push([6, 10, , 11]);
                    return [4 /*yield*/, getOrCreateWorktree(repoRoot, worktreeName, prNumber !== null ? { prNumber: prNumber } : undefined)];
                case 7:
                    result = _b.sent();
                    if (!!result.existed) return [3 /*break*/, 9];
                    // biome-ignore lint/suspicious/noConsole: intentional console output
                    console.log("Created worktree: ".concat(worktreeDir, " (based on ").concat(result.baseBranch, ")"));
                    return [4 /*yield*/, performPostCreationSetup(repoRoot, worktreeDir)];
                case 8:
                    _b.sent();
                    _b.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    error_4 = _b.sent();
                    return [2 /*return*/, {
                            handled: false,
                            error: "Error: ".concat((0, errors_js_1.errorMessage)(error_4)),
                        }];
                case 11:
                    tmuxSessionName = "".concat(repoName, "_").concat(worktreeBranchName(worktreeName)).replace(/[/.]/g, '_');
                    newArgs = [];
                    for (i = 0; i < args.length; i++) {
                        arg = args[i];
                        if (!arg)
                            continue;
                        if (arg === '--tmux' || arg === '--tmux=classic')
                            continue;
                        if (arg === '-w' || arg === '--worktree') {
                            next = args[i + 1];
                            if (next && !next.startsWith('-')) {
                                i++; // Skip the value too
                            }
                            continue;
                        }
                        if (arg.startsWith('--worktree='))
                            continue;
                        newArgs.push(arg);
                    }
                    tmuxPrefix = 'C-b' // default
                    ;
                    prefixResult = (0, child_process_1.spawnSync)('tmux', ['show-options', '-g', 'prefix'], {
                        encoding: 'utf-8',
                    });
                    if (prefixResult.status === 0 && prefixResult.stdout) {
                        match = prefixResult.stdout.match(/prefix\s+(\S+)/);
                        if (match === null || match === void 0 ? void 0 : match[1]) {
                            tmuxPrefix = match[1];
                        }
                    }
                    claudeBindings = [
                        'C-b',
                        'C-c',
                        'C-d',
                        'C-t',
                        'C-o',
                        'C-r',
                        'C-s',
                        'C-g',
                        'C-e',
                    ];
                    prefixConflicts = claudeBindings.includes(tmuxPrefix);
                    tmuxEnv = __assign(__assign({}, process.env), { CLAUDE_CODE_TMUX_SESSION: tmuxSessionName, CLAUDE_CODE_TMUX_PREFIX: tmuxPrefix, CLAUDE_CODE_TMUX_PREFIX_CONFLICTS: prefixConflicts ? '1' : '' });
                    hasSessionResult = (0, child_process_1.spawnSync)('tmux', ['has-session', '-t', tmuxSessionName], { encoding: 'utf-8' });
                    sessionExists = hasSessionResult.status === 0;
                    isAlreadyInTmux = Boolean(process.env.TMUX);
                    useControlMode = (0, detection_js_1.isInITerm2)() && !forceClassicTmux && !isAlreadyInTmux;
                    tmuxGlobalArgs = useControlMode ? ['-CC'] : [];
                    // Print hint about iTerm2 preferences when using control mode
                    if (useControlMode && !sessionExists) {
                        y = chalk_1.default.yellow;
                        // biome-ignore lint/suspicious/noConsole: intentional user guidance
                        console.log("\n".concat(y('╭─ iTerm2 Tip ────────────────────────────────────────────────────────╮'), "\n") +
                            "".concat(y('│'), " To open as a tab instead of a new window:                           ").concat(y('│'), "\n") +
                            "".concat(y('│'), " iTerm2 > Settings > General > tmux > \"Tabs in attaching window\"     ").concat(y('│'), "\n") +
                            "".concat(y('╰─────────────────────────────────────────────────────────────────────╯'), "\n"));
                    }
                    isAnt = process.env.USER_TYPE === 'ant';
                    isClaudeCliInternal = repoName === 'claude-cli-internal';
                    shouldSetupDevPanes = isAnt && isClaudeCliInternal && !sessionExists;
                    if (shouldSetupDevPanes) {
                        // Create detached session with Claude in first pane
                        (0, child_process_1.spawnSync)('tmux', __spreadArray([
                            'new-session',
                            '-d', // detached
                            '-s',
                            tmuxSessionName,
                            '-c',
                            worktreeDir,
                            '--',
                            process.execPath
                        ], newArgs, true), { cwd: worktreeDir, env: tmuxEnv });
                        // Split horizontally and run watch
                        (0, child_process_1.spawnSync)('tmux', ['split-window', '-h', '-t', tmuxSessionName, '-c', worktreeDir], { cwd: worktreeDir });
                        (0, child_process_1.spawnSync)('tmux', ['send-keys', '-t', tmuxSessionName, 'bun run watch', 'Enter'], { cwd: worktreeDir });
                        // Split vertically and run start
                        (0, child_process_1.spawnSync)('tmux', ['split-window', '-v', '-t', tmuxSessionName, '-c', worktreeDir], { cwd: worktreeDir });
                        (0, child_process_1.spawnSync)('tmux', ['send-keys', '-t', tmuxSessionName, 'bun run start'], {
                            cwd: worktreeDir,
                        });
                        // Select the first pane (Claude)
                        (0, child_process_1.spawnSync)('tmux', ['select-pane', '-t', "".concat(tmuxSessionName, ":0.0")], {
                            cwd: worktreeDir,
                        });
                        // Attach or switch to the session
                        if (isAlreadyInTmux) {
                            // Switch to sibling session (avoid nesting)
                            (0, child_process_1.spawnSync)('tmux', ['switch-client', '-t', tmuxSessionName], {
                                stdio: 'inherit',
                            });
                        }
                        else {
                            // Attach to the session
                            (0, child_process_1.spawnSync)('tmux', __spreadArray(__spreadArray([], tmuxGlobalArgs, true), ['attach-session', '-t', tmuxSessionName], false), {
                                stdio: 'inherit',
                                cwd: worktreeDir,
                            });
                        }
                    }
                    else {
                        // Standard behavior: create or attach
                        if (isAlreadyInTmux) {
                            // Already in tmux - create detached session, then switch to it (sibling)
                            // Check if session already exists first
                            if (sessionExists) {
                                // Just switch to existing session
                                (0, child_process_1.spawnSync)('tmux', ['switch-client', '-t', tmuxSessionName], {
                                    stdio: 'inherit',
                                });
                            }
                            else {
                                // Create new detached session
                                (0, child_process_1.spawnSync)('tmux', __spreadArray([
                                    'new-session',
                                    '-d', // detached
                                    '-s',
                                    tmuxSessionName,
                                    '-c',
                                    worktreeDir,
                                    '--',
                                    process.execPath
                                ], newArgs, true), { cwd: worktreeDir, env: tmuxEnv });
                                // Switch to the new session
                                (0, child_process_1.spawnSync)('tmux', ['switch-client', '-t', tmuxSessionName], {
                                    stdio: 'inherit',
                                });
                            }
                        }
                        else {
                            tmuxArgs = __spreadArray(__spreadArray(__spreadArray([], tmuxGlobalArgs, true), [
                                'new-session',
                                '-A', // Attach if exists, create if not
                                '-s',
                                tmuxSessionName,
                                '-c',
                                worktreeDir,
                                '--', // Separator before command
                                process.execPath
                            ], false), newArgs, true);
                            (0, child_process_1.spawnSync)('tmux', tmuxArgs, {
                                stdio: 'inherit',
                                cwd: worktreeDir,
                                env: tmuxEnv,
                            });
                        }
                    }
                    return [2 /*return*/, { handled: true }];
            }
        });
    });
}
