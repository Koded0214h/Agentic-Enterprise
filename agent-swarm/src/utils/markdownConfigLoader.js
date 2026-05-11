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
exports.loadMarkdownFilesForSubdir = exports.CLAUDE_CONFIG_DIRECTORIES = void 0;
exports.extractDescriptionFromMarkdown = extractDescriptionFromMarkdown;
exports.parseAgentToolsFromFrontmatter = parseAgentToolsFromFrontmatter;
exports.parseSlashCommandToolsFromFrontmatter = parseSlashCommandToolsFromFrontmatter;
exports.getProjectDirsUpToHome = getProjectDirsUpToHome;
var bun_bundle_1 = require("bun:bundle");
var fs_1 = require("fs");
var promises_1 = require("fs/promises");
var memoize_js_1 = require("lodash-es/memoize.js");
var os_1 = require("os");
var path_1 = require("path");
var index_js_1 = require("src/services/analytics/index.js");
var state_js_1 = require("../bootstrap/state.js");
var debug_js_1 = require("./debug.js");
var envUtils_js_1 = require("./envUtils.js");
var errors_js_1 = require("./errors.js");
var file_js_1 = require("./file.js");
var frontmatterParser_js_1 = require("./frontmatterParser.js");
var git_js_1 = require("./git.js");
var permissionSetup_js_1 = require("./permissions/permissionSetup.js");
var ripgrep_js_1 = require("./ripgrep.js");
var constants_js_1 = require("./settings/constants.js");
var managedPath_js_1 = require("./settings/managedPath.js");
var pluginOnlyPolicy_js_1 = require("./settings/pluginOnlyPolicy.js");
// Claude configuration directory names
exports.CLAUDE_CONFIG_DIRECTORIES = __spreadArray([
    'commands',
    'agents',
    'output-styles',
    'skills',
    'workflows'
], ((0, bun_bundle_1.feature)('TEMPLATES') ? ['templates'] : []), true);
/**
 * Extracts a description from markdown content
 * Uses the first non-empty line as the description, or falls back to a default
 */
function extractDescriptionFromMarkdown(content, defaultDescription) {
    var _a;
    if (defaultDescription === void 0) { defaultDescription = 'Custom item'; }
    var lines = content.split('\n');
    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
        var line = lines_1[_i];
        var trimmed = line.trim();
        if (trimmed) {
            // If it's a header, strip the header prefix
            var headerMatch = trimmed.match(/^#+\s+(.+)$/);
            var text = (_a = headerMatch === null || headerMatch === void 0 ? void 0 : headerMatch[1]) !== null && _a !== void 0 ? _a : trimmed;
            // Return the text, limited to reasonable length
            return text.length > 100 ? text.substring(0, 97) + '...' : text;
        }
    }
    return defaultDescription;
}
/**
 * Parses tools from frontmatter, supporting both string and array formats
 * Always returns a string array for consistency
 * @param toolsValue The value from frontmatter
 * @returns Parsed tool list as string[]
 */
function parseToolListString(toolsValue) {
    // Return null for missing/null - let caller decide the default
    if (toolsValue === undefined || toolsValue === null) {
        return null;
    }
    // Empty string or other falsy values mean no tools
    if (!toolsValue) {
        return [];
    }
    var toolsArray = [];
    if (typeof toolsValue === 'string') {
        toolsArray = [toolsValue];
    }
    else if (Array.isArray(toolsValue)) {
        toolsArray = toolsValue.filter(function (item) { return typeof item === 'string'; });
    }
    if (toolsArray.length === 0) {
        return [];
    }
    var parsedTools = (0, permissionSetup_js_1.parseToolListFromCLI)(toolsArray);
    if (parsedTools.includes('*')) {
        return ['*'];
    }
    return parsedTools;
}
/**
 * Parse tools from agent frontmatter
 * Missing field = undefined (all tools)
 * Empty field = [] (no tools)
 */
function parseAgentToolsFromFrontmatter(toolsValue) {
    var parsed = parseToolListString(toolsValue);
    if (parsed === null) {
        // For agents: undefined = all tools (undefined), null = no tools ([])
        return toolsValue === undefined ? undefined : [];
    }
    // If parsed contains '*', return undefined (all tools)
    if (parsed.includes('*')) {
        return undefined;
    }
    return parsed;
}
/**
 * Parse allowed-tools from slash command frontmatter
 * Missing or empty field = no tools ([])
 */
function parseSlashCommandToolsFromFrontmatter(toolsValue) {
    var parsed = parseToolListString(toolsValue);
    if (parsed === null) {
        return [];
    }
    return parsed;
}
/**
 * Gets a unique identifier for a file based on its device ID and inode.
 * This allows detection of duplicate files accessed through different paths
 * (e.g., via symlinks). Returns null if the file doesn't exist or can't be stat'd.
 *
 * Note: On Windows, dev and ino may not be reliable for all file systems.
 * The code handles this gracefully by returning null on error (fail open),
 * meaning deduplication may not work on some Windows configurations.
 *
 * Uses bigint: true to handle filesystems with large inodes (e.g., ExFAT)
 * that exceed JavaScript's Number precision (53 bits). Without bigint, different
 * large inodes can round to the same Number, causing false duplicate detection.
 * See: https://github.com/anthropics/claude-code/issues/13893
 *
 * @param filePath - Path to the file
 * @returns A string identifier "device:inode" or null if file can't be identified
 */
function getFileIdentity(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var stats, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, promises_1.lstat)(filePath, { bigint: true })
                        // Some filesystems (NFS, FUSE, network mounts) report dev=0 and ino=0
                        // for all files, which would cause every file to look like a duplicate.
                        // Return null to skip deduplication for these unreliable identities.
                    ];
                case 1:
                    stats = _b.sent();
                    // Some filesystems (NFS, FUSE, network mounts) report dev=0 and ino=0
                    // for all files, which would cause every file to look like a duplicate.
                    // Return null to skip deduplication for these unreliable identities.
                    if (stats.dev === 0n && stats.ino === 0n) {
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, "".concat(stats.dev, ":").concat(stats.ino)];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Compute the stop boundary for getProjectDirsUpToHome's upward walk.
 *
 * Normally the walk stops at the nearest `.git` above `cwd`. But if the Bash
 * tool has cd'd into a nested git repo inside the session's project (submodule,
 * vendored dep with its own `.git`), that nested root isn't the right boundary —
 * stopping there makes the parent project's `.claude/` unreachable (#31905).
 *
 * The boundary is widened to the session's git root only when BOTH:
 *   - the nearest `.git` from cwd belongs to a *different* canonical repo
 *     (submodule/vendored clone — not a worktree, which resolves back to main)
 *   - that nearest `.git` sits *inside* the session's project tree
 *
 * Worktrees (under `.claude/worktrees/`) stay on the old behavior: their `.git`
 * file is the stop, and loadMarkdownFilesForSubdir's fallback adds the main-repo
 * copy only when the worktree lacks one.
 */
function resolveStopBoundary(cwd) {
    var cwdGitRoot = (0, git_js_1.findGitRoot)(cwd);
    var sessionGitRoot = (0, git_js_1.findGitRoot)((0, state_js_1.getProjectRoot)());
    if (!cwdGitRoot || !sessionGitRoot) {
        return cwdGitRoot;
    }
    // findCanonicalGitRoot resolves worktree `.git` files to the main repo.
    // Submodules (no commondir) and standalone clones fall through unchanged.
    var cwdCanonical = (0, git_js_1.findCanonicalGitRoot)(cwd);
    if (cwdCanonical &&
        (0, file_js_1.normalizePathForComparison)(cwdCanonical) ===
            (0, file_js_1.normalizePathForComparison)(sessionGitRoot)) {
        // Same canonical repo (main, or a worktree of main). Stop at nearest .git.
        return cwdGitRoot;
    }
    // Different canonical repo. Is it nested *inside* the session's project?
    var nCwdGitRoot = (0, file_js_1.normalizePathForComparison)(cwdGitRoot);
    var nSessionRoot = (0, file_js_1.normalizePathForComparison)(sessionGitRoot);
    if (nCwdGitRoot !== nSessionRoot &&
        nCwdGitRoot.startsWith(nSessionRoot + path_1.sep)) {
        // Nested repo inside the project — skip past it, stop at the project's root.
        return sessionGitRoot;
    }
    // Sibling repo or elsewhere. Stop at nearest .git (old behavior).
    return cwdGitRoot;
}
/**
 * Traverses from the current directory up to the git root (or home directory if not in a git repo),
 * collecting all .claude directories along the way.
 *
 * Stopping at git root prevents commands/skills from parent directories outside the repository
 * from leaking into projects. For example, if ~/projects/.claude/commands/ exists, it won't
 * appear in ~/projects/my-repo/ if my-repo is a git repository.
 *
 * @param subdir Subdirectory (eg. "commands", "agents")
 * @param cwd Current working directory to start from
 * @returns Array of directory paths containing .claude/subdir, from most specific (cwd) to least specific
 */
function getProjectDirsUpToHome(subdir, cwd) {
    var home = (0, path_1.resolve)((0, os_1.homedir)()).normalize('NFC');
    var gitRoot = resolveStopBoundary(cwd);
    var current = (0, path_1.resolve)(cwd);
    var dirs = [];
    // Traverse from current directory up to git root (or home if not in a git repo)
    while (true) {
        // Stop if we've reached the home directory (don't check it, as it's loaded separately as userDir)
        // Use normalized comparison to handle Windows drive letter casing (C:\ vs c:\)
        if ((0, file_js_1.normalizePathForComparison)(current) === (0, file_js_1.normalizePathForComparison)(home)) {
            break;
        }
        var claudeSubdir = (0, path_1.join)(current, '.claude', subdir);
        // Filter to existing dirs. This is a perf filter (avoids spawning
        // ripgrep on non-existent dirs downstream) and the worktree fallback
        // in loadMarkdownFilesForSubdir relies on it. statSync + explicit error
        // handling instead of existsSync — re-throws unexpected errors rather
        // than silently swallowing them. Downstream loadMarkdownFiles handles
        // the TOCTOU window (dir disappearing before read) gracefully.
        try {
            (0, fs_1.statSync)(claudeSubdir);
            dirs.push(claudeSubdir);
        }
        catch (e) {
            if (!(0, errors_js_1.isFsInaccessible)(e))
                throw e;
        }
        // Stop after processing the git root directory - this prevents commands from parent
        // directories outside the repository from appearing in the project
        if (gitRoot &&
            (0, file_js_1.normalizePathForComparison)(current) ===
                (0, file_js_1.normalizePathForComparison)(gitRoot)) {
            break;
        }
        // Move to parent directory
        var parent_1 = (0, path_1.dirname)(current);
        // Safety check: if parent is the same as current, we've reached the root
        if (parent_1 === current) {
            break;
        }
        current = parent_1;
    }
    return dirs;
}
/**
 * Loads markdown files from managed, user, and project directories
 * @param subdir Subdirectory (eg. "agents" or "commands")
 * @param cwd Current working directory for project directory traversal
 * @returns Array of parsed markdown files with metadata
 */
exports.loadMarkdownFilesForSubdir = (0, memoize_js_1.default)(function (subdir, cwd) {
    return __awaiter(this, void 0, void 0, function () {
        var searchStartTime, userDir, managedDir, projectDirs, rootDir, swarmSubdir, gitRoot, canonicalRoot, worktreeSubdir_1, worktreeHasSubdir, mainClaudeSubdir, _a, managedFiles, userFiles, projectFilesNested, projectFiles, allFiles, fileIdentities, seenFileIds, deduplicatedFiles, _i, _b, _c, i, file, fileId, existingSource, duplicatesRemoved;
        var _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    searchStartTime = Date.now();
                    userDir = (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), subdir);
                    managedDir = (0, path_1.join)((0, managedPath_js_1.getManagedFilePath)(), '.claude', subdir);
                    projectDirs = getProjectDirsUpToHome(subdir, cwd);
                    rootDir = (0, state_js_1.getProjectRoot)();
                    swarmSubdir = (0, path_1.join)(rootDir, subdir);
                    if (!projectDirs.includes(swarmSubdir)) {
                        projectDirs.push(swarmSubdir);
                    }
                    gitRoot = (0, git_js_1.findGitRoot)(cwd);
                    canonicalRoot = (0, git_js_1.findCanonicalGitRoot)(cwd);
                    if (gitRoot && canonicalRoot && canonicalRoot !== gitRoot) {
                        worktreeSubdir_1 = (0, file_js_1.normalizePathForComparison)((0, path_1.join)(gitRoot, '.claude', subdir));
                        worktreeHasSubdir = projectDirs.some(function (dir) { return (0, file_js_1.normalizePathForComparison)(dir) === worktreeSubdir_1; });
                        if (!worktreeHasSubdir) {
                            mainClaudeSubdir = (0, path_1.join)(canonicalRoot, '.claude', subdir);
                            if (!projectDirs.includes(mainClaudeSubdir)) {
                                projectDirs.push(mainClaudeSubdir);
                            }
                        }
                    }
                    return [4 /*yield*/, Promise.all([
                            // Always load managed (policy settings)
                            loadMarkdownFiles(managedDir).then(function (_) {
                                return _.map(function (file) { return (__assign(__assign({}, file), { baseDir: managedDir, source: 'policySettings' })); });
                            }),
                            // Conditionally load user files
                            (0, constants_js_1.isSettingSourceEnabled)('userSettings') &&
                                !(subdir === 'agents' && (0, pluginOnlyPolicy_js_1.isRestrictedToPluginOnly)('agents'))
                                ? loadMarkdownFiles(userDir).then(function (_) {
                                    return _.map(function (file) { return (__assign(__assign({}, file), { baseDir: userDir, source: 'userSettings' })); });
                                })
                                : Promise.resolve([]),
                            // Conditionally load project files from all directories up to home
                            (0, constants_js_1.isSettingSourceEnabled)('projectSettings') &&
                                !(subdir === 'agents' && (0, pluginOnlyPolicy_js_1.isRestrictedToPluginOnly)('agents'))
                                ? Promise.all(projectDirs.map(function (projectDir) {
                                    return loadMarkdownFiles(projectDir).then(function (_) {
                                        return _.map(function (file) { return (__assign(__assign({}, file), { baseDir: projectDir, source: 'projectSettings' })); });
                                    });
                                }))
                                : Promise.resolve([]),
                        ])
                        // Flatten nested project files array
                    ];
                case 1:
                    _a = _e.sent(), managedFiles = _a[0], userFiles = _a[1], projectFilesNested = _a[2];
                    projectFiles = projectFilesNested.flat();
                    allFiles = __spreadArray(__spreadArray(__spreadArray([], managedFiles, true), userFiles, true), projectFiles, true);
                    return [4 /*yield*/, Promise.all(allFiles.map(function (file) { return getFileIdentity(file.filePath); }))];
                case 2:
                    fileIdentities = _e.sent();
                    seenFileIds = new Map();
                    deduplicatedFiles = [];
                    for (_i = 0, _b = allFiles.entries(); _i < _b.length; _i++) {
                        _c = _b[_i], i = _c[0], file = _c[1];
                        fileId = (_d = fileIdentities[i]) !== null && _d !== void 0 ? _d : null;
                        if (fileId === null) {
                            // If we can't identify the file, include it (fail open)
                            deduplicatedFiles.push(file);
                            continue;
                        }
                        existingSource = seenFileIds.get(fileId);
                        if (existingSource !== undefined) {
                            (0, debug_js_1.logForDebugging)("Skipping duplicate file '".concat(file.filePath, "' from ").concat(file.source, " (same inode already loaded from ").concat(existingSource, ")"));
                            continue;
                        }
                        seenFileIds.set(fileId, file.source);
                        deduplicatedFiles.push(file);
                    }
                    duplicatesRemoved = allFiles.length - deduplicatedFiles.length;
                    if (duplicatesRemoved > 0) {
                        (0, debug_js_1.logForDebugging)("Deduplicated ".concat(duplicatesRemoved, " files in ").concat(subdir, " (same inode via symlinks or hard links)"));
                    }
                    (0, index_js_1.logEvent)("tengu_dir_search", {
                        durationMs: Date.now() - searchStartTime,
                        managedFilesFound: managedFiles.length,
                        userFilesFound: userFiles.length,
                        projectFilesFound: projectFiles.length,
                        projectDirsSearched: projectDirs.length,
                        subdir: subdir,
                    });
                    return [2 /*return*/, deduplicatedFiles];
            }
        });
    });
}, 
// Custom resolver creates cache key from both subdir and cwd parameters
function (subdir, cwd) { return "".concat(subdir, ":").concat(cwd); });
/**
 * Native implementation to find markdown files using Node.js fs APIs
 *
 * This implementation exists alongside ripgrep for the following reasons:
 * 1. Ripgrep has poor startup performance in native builds (noticeable on app startup)
 * 2. Provides a fallback when ripgrep is unavailable
 * 3. Can be explicitly enabled via CLAUDE_CODE_USE_NATIVE_FILE_SEARCH env var
 *
 * Symlink handling:
 * - Follows symlinks (equivalent to ripgrep's --follow flag)
 * - Uses device+inode tracking to detect cycles (same as ripgrep's same_file library)
 * - Falls back to realpath on systems without inode support
 *
 * Does not respect .gitignore (matches ripgrep with --no-ignore flag)
 *
 * @param dir Directory to search
 * @param signal AbortSignal for timeout
 * @returns Array of file paths
 */
function findMarkdownFilesNative(dir, signal) {
    return __awaiter(this, void 0, void 0, function () {
        function walk(currentDir) {
            return __awaiter(this, void 0, void 0, function () {
                var stats, dirKey, _a, error_1, errorMessage, entries, _i, entries_1, entry, fullPath, stats, error_2, errorMessage, error_3, errorMessage, error_4, errorMessage;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (signal.aborted) {
                                return [2 /*return*/];
                            }
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 7, , 8]);
                            return [4 /*yield*/, (0, promises_1.stat)(currentDir, { bigint: true })];
                        case 2:
                            stats = _b.sent();
                            if (!stats.isDirectory()) return [3 /*break*/, 6];
                            if (!(stats.dev !== undefined && stats.ino !== undefined)) return [3 /*break*/, 3];
                            _a = "".concat(stats.dev, ":").concat(stats.ino); // Unix/Linux: device + inode
                            return [3 /*break*/, 5];
                        case 3: return [4 /*yield*/, (0, promises_1.realpath)(currentDir)]; // Windows: canonical path
                        case 4:
                            _a = _b.sent(); // Windows: canonical path
                            _b.label = 5;
                        case 5:
                            dirKey = _a;
                            if (visitedDirs.has(dirKey)) {
                                (0, debug_js_1.logForDebugging)("Skipping already visited directory (circular symlink): ".concat(currentDir));
                                return [2 /*return*/];
                            }
                            visitedDirs.add(dirKey);
                            _b.label = 6;
                        case 6: return [3 /*break*/, 8];
                        case 7:
                            error_1 = _b.sent();
                            errorMessage = error_1 instanceof Error ? error_1.message : String(error_1);
                            (0, debug_js_1.logForDebugging)("Failed to stat directory ".concat(currentDir, ": ").concat(errorMessage));
                            return [2 /*return*/];
                        case 8:
                            _b.trys.push([8, 26, , 27]);
                            return [4 /*yield*/, (0, promises_1.readdir)(currentDir, { withFileTypes: true })];
                        case 9:
                            entries = _b.sent();
                            _i = 0, entries_1 = entries;
                            _b.label = 10;
                        case 10:
                            if (!(_i < entries_1.length)) return [3 /*break*/, 25];
                            entry = entries_1[_i];
                            if (signal.aborted) {
                                return [3 /*break*/, 25];
                            }
                            fullPath = (0, path_1.join)(currentDir, entry.name);
                            _b.label = 11;
                        case 11:
                            _b.trys.push([11, 23, , 24]);
                            if (!entry.isSymbolicLink()) return [3 /*break*/, 19];
                            _b.label = 12;
                        case 12:
                            _b.trys.push([12, 17, , 18]);
                            return [4 /*yield*/, (0, promises_1.stat)(fullPath)]; // stat() follows symlinks
                        case 13:
                            stats = _b.sent() // stat() follows symlinks
                            ;
                            if (!stats.isDirectory()) return [3 /*break*/, 15];
                            return [4 /*yield*/, walk(fullPath)];
                        case 14:
                            _b.sent();
                            return [3 /*break*/, 16];
                        case 15:
                            if (stats.isFile() && entry.name.endsWith('.md')) {
                                files.push(fullPath);
                            }
                            _b.label = 16;
                        case 16: return [3 /*break*/, 18];
                        case 17:
                            error_2 = _b.sent();
                            errorMessage = error_2 instanceof Error ? error_2.message : String(error_2);
                            (0, debug_js_1.logForDebugging)("Failed to follow symlink ".concat(fullPath, ": ").concat(errorMessage));
                            return [3 /*break*/, 18];
                        case 18: return [3 /*break*/, 22];
                        case 19:
                            if (!entry.isDirectory()) return [3 /*break*/, 21];
                            return [4 /*yield*/, walk(fullPath)];
                        case 20:
                            _b.sent();
                            return [3 /*break*/, 22];
                        case 21:
                            if (entry.isFile() && entry.name.endsWith('.md')) {
                                files.push(fullPath);
                            }
                            _b.label = 22;
                        case 22: return [3 /*break*/, 24];
                        case 23:
                            error_3 = _b.sent();
                            errorMessage = error_3 instanceof Error ? error_3.message : String(error_3);
                            (0, debug_js_1.logForDebugging)("Failed to access ".concat(fullPath, ": ").concat(errorMessage));
                            return [3 /*break*/, 24];
                        case 24:
                            _i++;
                            return [3 /*break*/, 10];
                        case 25: return [3 /*break*/, 27];
                        case 26:
                            error_4 = _b.sent();
                            errorMessage = error_4 instanceof Error ? error_4.message : String(error_4);
                            (0, debug_js_1.logForDebugging)("Failed to read directory ".concat(currentDir, ": ").concat(errorMessage));
                            return [3 /*break*/, 27];
                        case 27: return [2 /*return*/];
                    }
                });
            });
        }
        var files, visitedDirs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    files = [];
                    visitedDirs = new Set();
                    return [4 /*yield*/, walk(dir)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, files];
            }
        });
    });
}
/**
 * Generic function to load markdown files from specified directories
 * @param dir Directory (eg. "~/.claude/commands")
 * @returns Array of parsed markdown files with metadata
 */
function loadMarkdownFiles(dir) {
    return __awaiter(this, void 0, void 0, function () {
        var useNative, signal, files, _a, e_1, results;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    useNative = (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_USE_NATIVE_FILE_SEARCH);
                    signal = AbortSignal.timeout(3000);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 6, , 7]);
                    if (!useNative) return [3 /*break*/, 3];
                    return [4 /*yield*/, findMarkdownFilesNative(dir, signal)];
                case 2:
                    _a = _b.sent();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, (0, ripgrep_js_1.ripGrep)(['--files', '--hidden', '--follow', '--no-ignore', '--glob', '*.md'], dir, signal)];
                case 4:
                    _a = _b.sent();
                    _b.label = 5;
                case 5:
                    files = _a;
                    return [3 /*break*/, 7];
                case 6:
                    e_1 = _b.sent();
                    // Handle missing/inaccessible dir directly instead of pre-checking
                    // existence (TOCTOU). findMarkdownFilesNative already catches internally;
                    // ripGrep rejects on inaccessible target paths.
                    if ((0, errors_js_1.isFsInaccessible)(e_1))
                        return [2 /*return*/, []];
                    throw e_1;
                case 7: return [4 /*yield*/, Promise.all(files.map(function (filePath) { return __awaiter(_this, void 0, void 0, function () {
                        var rawContent, _a, frontmatter, content, error_5, errorMessage;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, (0, promises_1.readFile)(filePath, { encoding: 'utf-8' })];
                                case 1:
                                    rawContent = _b.sent();
                                    _a = (0, frontmatterParser_js_1.parseFrontmatter)(rawContent, filePath), frontmatter = _a.frontmatter, content = _a.content;
                                    return [2 /*return*/, {
                                            filePath: filePath,
                                            frontmatter: frontmatter,
                                            content: content,
                                        }];
                                case 2:
                                    error_5 = _b.sent();
                                    errorMessage = error_5 instanceof Error ? error_5.message : String(error_5);
                                    (0, debug_js_1.logForDebugging)("Failed to read/parse markdown file:  ".concat(filePath, ": ").concat(errorMessage));
                                    return [2 /*return*/, null];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); }))];
                case 8:
                    results = _b.sent();
                    return [2 /*return*/, results.filter(function (_) { return _ !== null; })];
            }
        });
    });
}
