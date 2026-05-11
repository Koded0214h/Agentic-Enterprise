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
exports.getResolvedWorkingDirPaths = exports.getBundledSkillsRoot = exports.getClaudeTempDir = exports.DANGEROUS_DIRECTORIES = exports.DANGEROUS_FILES = void 0;
exports.normalizeCaseForComparison = normalizeCaseForComparison;
exports.getClaudeSkillScope = getClaudeSkillScope;
exports.relativePath = relativePath;
exports.toPosixPath = toPosixPath;
exports.isClaudeSettingsPath = isClaudeSettingsPath;
exports.getSessionMemoryDir = getSessionMemoryDir;
exports.getSessionMemoryPath = getSessionMemoryPath;
exports.isScratchpadEnabled = isScratchpadEnabled;
exports.getClaudeTempDirName = getClaudeTempDirName;
exports.getProjectTempDir = getProjectTempDir;
exports.getScratchpadDir = getScratchpadDir;
exports.ensureScratchpadDir = ensureScratchpadDir;
exports.checkPathSafetyForAutoEdit = checkPathSafetyForAutoEdit;
exports.allWorkingDirectories = allWorkingDirectories;
exports.pathInAllowedWorkingPath = pathInAllowedWorkingPath;
exports.pathInWorkingPath = pathInWorkingPath;
exports.normalizePatternsToPath = normalizePatternsToPath;
exports.getFileReadIgnorePatterns = getFileReadIgnorePatterns;
exports.matchingRuleForInput = matchingRuleForInput;
exports.checkReadPermissionForTool = checkReadPermissionForTool;
exports.checkWritePermissionForTool = checkWritePermissionForTool;
exports.generateSuggestions = generateSuggestions;
exports.checkEditableInternalPath = checkEditableInternalPath;
exports.checkReadableInternalPath = checkReadableInternalPath;
var bun_bundle_1 = require("bun:bundle");
var crypto_1 = require("crypto");
var ignore_1 = require("ignore");
var memoize_js_1 = require("lodash-es/memoize.js");
var os_1 = require("os");
var path_1 = require("path");
var paths_js_1 = require("src/memdir/paths.js");
var agentMemory_js_1 = require("src/tools/AgentTool/agentMemory.js");
var constants_js_1 = require("src/tools/FileEditTool/constants.js");
var state_js_1 = require("../../bootstrap/state.js");
var growthbook_js_1 = require("../../services/analytics/growthbook.js");
var prompt_js_1 = require("../../tools/FileReadTool/prompt.js");
var cwd_js_1 = require("../cwd.js");
var envUtils_js_1 = require("../envUtils.js");
var fsOperations_js_1 = require("../fsOperations.js");
var path_js_1 = require("../path.js");
var plans_js_1 = require("../plans.js");
var platform_js_1 = require("../platform.js");
var sessionStorage_js_1 = require("../sessionStorage.js");
var constants_js_2 = require("../settings/constants.js");
var settings_js_1 = require("../settings/settings.js");
var readOnlyCommandValidation_js_1 = require("../shell/readOnlyCommandValidation.js");
var toolResultStorage_js_1 = require("../toolResultStorage.js");
var windowsPaths_js_1 = require("../windowsPaths.js");
var PermissionUpdate_js_1 = require("./PermissionUpdate.js");
var permissions_js_1 = require("./permissions.js");
/**
 * Dangerous files that should be protected from auto-editing.
 * These files can be used for code execution or data exfiltration.
 */
exports.DANGEROUS_FILES = [
    '.gitconfig',
    '.gitmodules',
    '.bashrc',
    '.bash_profile',
    '.zshrc',
    '.zprofile',
    '.profile',
    '.ripgreprc',
    '.mcp.json',
    '.claude.json',
];
/**
 * Dangerous directories that should be protected from auto-editing.
 * These directories contain sensitive configuration or executable files.
 */
exports.DANGEROUS_DIRECTORIES = [
    '.git',
    '.vscode',
    '.idea',
    '.claude',
];
/**
 * Normalizes a path for case-insensitive comparison.
 * This prevents bypassing security checks using mixed-case paths on case-insensitive
 * filesystems (macOS/Windows) like `.cLauDe/Settings.locaL.json`.
 *
 * We always normalize to lowercase regardless of platform for consistent security.
 * @param path The path to normalize
 * @returns The lowercase path for safe comparison
 */
function normalizeCaseForComparison(path) {
    return path.toLowerCase();
}
/**
 * If filePath is inside a .claude/skills/{name}/ directory (project or global),
 * return the skill name and a session-allow pattern scoped to just that skill.
 * Used to offer a narrower "allow edits to this skill only" option in the
 * permission dialog and SDK suggestions, so iterating on one skill doesn't
 * require granting session access to all of .claude/ (settings.json, hooks/, etc.).
 */
function getClaudeSkillScope(filePath) {
    var absolutePath = (0, path_js_1.expandPath)(filePath);
    var absolutePathLower = normalizeCaseForComparison(absolutePath);
    var bases = [
        {
            dir: (0, path_js_1.expandPath)((0, path_1.join)((0, state_js_1.getOriginalCwd)(), '.claude', 'skills')),
            prefix: '/.claude/skills/',
        },
        {
            dir: (0, path_js_1.expandPath)((0, path_1.join)((0, os_1.homedir)(), '.claude', 'skills')),
            prefix: '~/.claude/skills/',
        },
    ];
    for (var _i = 0, bases_1 = bases; _i < bases_1.length; _i++) {
        var _a = bases_1[_i], dir = _a.dir, prefix = _a.prefix;
        var dirLower = normalizeCaseForComparison(dir);
        // Try both path separators (Windows paths may not be normalized to /)
        for (var _b = 0, _c = [path_1.sep, '/']; _b < _c.length; _b++) {
            var s = _c[_b];
            if (absolutePathLower.startsWith(dirLower + s.toLowerCase())) {
                // Match on lowercase, but slice the ORIGINAL path so the skill name
                // preserves case (pattern matching downstream is case-sensitive)
                var rest = absolutePath.slice(dir.length + s.length);
                var slash = rest.indexOf('/');
                var bslash = path_1.sep === '\\' ? rest.indexOf('\\') : -1;
                var cut = slash === -1
                    ? bslash
                    : bslash === -1
                        ? slash
                        : Math.min(slash, bslash);
                // Require a separator: file must be INSIDE the skill dir, not a
                // file directly under skills/ (no skill scope for that)
                if (cut <= 0)
                    return null;
                var skillName = rest.slice(0, cut);
                // Reject traversal and empty. Use includes('..') not === '..' to
                // match step 1.6's ruleContent.includes('..') guard: a skillName like
                // 'v2..beta' would otherwise produce a suggestion step 1.7 emits but
                // step 1.6 always rejects (dead suggestion, infinite re-prompt).
                if (!skillName || skillName === '.' || skillName.includes('..')) {
                    return null;
                }
                // Reject glob metacharacters. skillName is interpolated into a
                // gitignore pattern consumed by ignore().add() in matchingRuleForInput
                // at step 1.6. A directory literally named '*' (valid on POSIX) would
                // produce '/.claude/skills/*/**' which matches ALL skills. Return null
                // to fall through to generateSuggestions() instead.
                if (/[*?[\]]/.test(skillName))
                    return null;
                return { skillName: skillName, pattern: prefix + skillName + '/**' };
            }
        }
    }
    return null;
}
// Always use / as the path separator per gitignore spec
// https://git-scm.com/docs/gitignore
var DIR_SEP = path_1.posix.sep;
/**
 * Cross-platform relative path calculation that returns POSIX-style paths.
 * Handles Windows path conversion internally.
 * @param from The base path
 * @param to The target path
 * @returns A POSIX-style relative path
 */
function relativePath(from, to) {
    if ((0, platform_js_1.getPlatform)() === 'windows') {
        // Convert Windows paths to POSIX for consistent comparison
        var posixFrom = (0, windowsPaths_js_1.windowsPathToPosixPath)(from);
        var posixTo = (0, windowsPaths_js_1.windowsPathToPosixPath)(to);
        return path_1.posix.relative(posixFrom, posixTo);
    }
    // Use POSIX paths directly
    return path_1.posix.relative(from, to);
}
/**
 * Converts a path to POSIX format for pattern matching.
 * Handles Windows path conversion internally.
 * @param path The path to convert
 * @returns A POSIX-style path
 */
function toPosixPath(path) {
    if ((0, platform_js_1.getPlatform)() === 'windows') {
        return (0, windowsPaths_js_1.windowsPathToPosixPath)(path);
    }
    return path;
}
function getSettingsPaths() {
    return constants_js_2.SETTING_SOURCES.map(function (source) {
        return (0, settings_js_1.getSettingsFilePathForSource)(source);
    }).filter(function (path) { return path !== undefined; });
}
function isClaudeSettingsPath(filePath) {
    // SECURITY: Normalize path structure first to prevent bypass via redundant ./
    // sequences like `./.claude/./settings.json` which would evade the endsWith() check
    var expandedPath = (0, path_js_1.expandPath)(filePath);
    // Normalize for case-insensitive comparison to prevent bypassing security
    // with paths like .cLauDe/Settings.locaL.json
    var normalizedPath = normalizeCaseForComparison(expandedPath);
    // Use platform separator so endsWith checks work on both Unix (/) and Windows (\)
    if (normalizedPath.endsWith("".concat(path_1.sep, ".claude").concat(path_1.sep, "settings.json")) ||
        normalizedPath.endsWith("".concat(path_1.sep, ".claude").concat(path_1.sep, "settings.local.json"))) {
        // Include .claude/settings.json even for other projects
        return true;
    }
    // Check for current project's settings files (including managed settings and CLI args)
    // Both paths are now absolute and normalized for consistent comparison
    return getSettingsPaths().some(function (settingsPath) { return normalizeCaseForComparison(settingsPath) === normalizedPath; });
}
// Always ask when Claude Code tries to edit its own config files
function isClaudeConfigFilePath(filePath) {
    if (isClaudeSettingsPath(filePath)) {
        return true;
    }
    // Check if file is within .claude/commands or .claude/agents directories
    // using proper path segment validation (not string matching with includes())
    // pathInWorkingPath now handles case-insensitive comparison to prevent bypasses
    var commandsDir = (0, path_1.join)((0, state_js_1.getOriginalCwd)(), '.claude', 'commands');
    var agentsDir = (0, path_1.join)((0, state_js_1.getOriginalCwd)(), '.claude', 'agents');
    var skillsDir = (0, path_1.join)((0, state_js_1.getOriginalCwd)(), '.claude', 'skills');
    return (pathInWorkingPath(filePath, commandsDir) ||
        pathInWorkingPath(filePath, agentsDir) ||
        pathInWorkingPath(filePath, skillsDir));
}
// Check if file is the plan file for the current session
function isSessionPlanFile(absolutePath) {
    // Check if path is a plan file for this session (main or agent-specific)
    // Main plan file: {plansDir}/{planSlug}.md
    // Agent plan file: {plansDir}/{planSlug}-agent-{agentId}.md
    var expectedPrefix = (0, path_1.join)((0, plans_js_1.getPlansDirectory)(), (0, plans_js_1.getPlanSlug)());
    // SECURITY: Normalize to prevent path traversal bypasses via .. segments
    var normalizedPath = (0, path_1.normalize)(absolutePath);
    return (normalizedPath.startsWith(expectedPrefix) && normalizedPath.endsWith('.md'));
}
/**
 * Returns the session memory directory path for the current session with trailing separator.
 * Path format: {projectDir}/{sessionId}/session-memory/
 */
function getSessionMemoryDir() {
    return (0, path_1.join)((0, sessionStorage_js_1.getProjectDir)((0, cwd_js_1.getCwd)()), (0, state_js_1.getSessionId)(), 'session-memory') + path_1.sep;
}
/**
 * Returns the session memory file path for the current session.
 * Path format: {projectDir}/{sessionId}/session-memory/summary.md
 */
function getSessionMemoryPath() {
    return (0, path_1.join)(getSessionMemoryDir(), 'summary.md');
}
// Check if file is within the session memory directory
function isSessionMemoryPath(absolutePath) {
    // SECURITY: Normalize to prevent path traversal bypasses via .. segments
    var normalizedPath = (0, path_1.normalize)(absolutePath);
    return normalizedPath.startsWith(getSessionMemoryDir());
}
/**
 * Check if file is within the current project's directory.
 * Path format: ~/.claude/projects/{sanitized-cwd}/...
 */
function isProjectDirPath(absolutePath) {
    var projectDir = (0, sessionStorage_js_1.getProjectDir)((0, cwd_js_1.getCwd)());
    // SECURITY: Normalize to prevent path traversal bypasses via .. segments
    var normalizedPath = (0, path_1.normalize)(absolutePath);
    return (normalizedPath === projectDir || normalizedPath.startsWith(projectDir + path_1.sep));
}
/**
 * Checks if the scratchpad directory feature is enabled.
 * The scratchpad is a per-session directory for Claude to write temporary files.
 * Controlled by the tengu_scratch Statsig gate.
 */
function isScratchpadEnabled() {
    return (0, growthbook_js_1.checkStatsigFeatureGate_CACHED_MAY_BE_STALE)('tengu_scratch');
}
/**
 * Returns the user-specific Claude temp directory name.
 * On Unix: 'claude-{uid}' to prevent multi-user permission conflicts
 * On Windows: 'claude' (tmpdir() is already per-user)
 */
function getClaudeTempDirName() {
    var _a, _b;
    if ((0, platform_js_1.getPlatform)() === 'windows') {
        return 'claude';
    }
    // Use UID to create per-user directories, preventing permission conflicts
    // when multiple users share the same /tmp directory
    var uid = (_b = (_a = process.getuid) === null || _a === void 0 ? void 0 : _a.call(process)) !== null && _b !== void 0 ? _b : 0;
    return "claude-".concat(uid);
}
/**
 * Returns the Claude temp directory path with symlinks resolved.
 * Uses TMPDIR env var if set, otherwise:
 * - On Unix: /tmp/claude-{uid}/ (resolved to /private/tmp/claude-{uid}/ on macOS)
 * - On Windows: {tmpdir}/claude/ (e.g., C:\Users\{user}\AppData\Local\Temp\claude\)
 * This is a per-user temporary directory used by Claude Code for all temp files.
 *
 * NOTE: We resolve symlinks to ensure this path matches the resolved paths used
 * in permission checks. On macOS, /tmp is a symlink to /private/tmp, so without
 * resolution, paths like /tmp/claude-{uid}/... wouldn't match /private/tmp/claude-{uid}/...
 */
// Memoized: called per-tool from permission checks (yoloClassifier, sandbox-adapter)
// and per-turn from BashTool prompt. Inputs (CLAUDE_CODE_TMPDIR env + platform) are
// fixed at startup, and the realpath of the system tmp dir does not change mid-session.
exports.getClaudeTempDir = (0, memoize_js_1.default)(function getClaudeTempDir() {
    var baseTmpDir = process.env.CLAUDE_CODE_TMPDIR ||
        ((0, platform_js_1.getPlatform)() === 'windows' ? (0, os_1.tmpdir)() : '/tmp');
    // Resolve symlinks in the base temp directory (e.g., /tmp -> /private/tmp on macOS)
    // This ensures the path matches resolved paths in permission checks
    var fs = (0, fsOperations_js_1.getFsImplementation)();
    var resolvedBaseTmpDir = baseTmpDir;
    try {
        resolvedBaseTmpDir = fs.realpathSync(baseTmpDir);
    }
    catch (_a) {
        // If resolution fails, use the original path
    }
    return (0, path_1.join)(resolvedBaseTmpDir, getClaudeTempDirName()) + path_1.sep;
});
/**
 * Root for bundled-skill file extraction (see bundledSkills.ts).
 *
 * SECURITY: The per-process random nonce is the load-bearing defense here.
 * Every other path component (uid, VERSION, skill name, file keys) is public
 * knowledge, so without it a local attacker can pre-create the tree on a
 * shared /tmp — sticky bit prevents deletion, not creation — and either
 * symlink an intermediate directory (O_NOFOLLOW only checks the final
 * component) or own a parent dir and swap file contents post-write for prompt
 * injection via the read allowlist. diskOutput.ts gets the same property from
 * the session-ID UUID in its path.
 *
 * Memoized so the extraction writes and the permission check agree on the
 * path for the life of the process. Version-scoped so stale extractions from
 * other binaries don't fall under the allowlist.
 */
exports.getBundledSkillsRoot = (0, memoize_js_1.default)(function getBundledSkillsRoot() {
    var nonce = (0, crypto_1.randomBytes)(16).toString('hex');
    return (0, path_1.join)((0, exports.getClaudeTempDir)(), 'bundled-skills', MACRO.VERSION, nonce);
});
/**
 * Returns the project temp directory path with trailing separator.
 * Path format: /tmp/claude-{uid}/{sanitized-cwd}/
 */
function getProjectTempDir() {
    return (0, path_1.join)((0, exports.getClaudeTempDir)(), (0, path_js_1.sanitizePath)((0, state_js_1.getOriginalCwd)())) + path_1.sep;
}
/**
 * Returns the scratchpad directory path for the current session.
 * Path format: /tmp/claude-{uid}/{sanitized-cwd}/{sessionId}/scratchpad/
 */
function getScratchpadDir() {
    return (0, path_1.join)(getProjectTempDir(), (0, state_js_1.getSessionId)(), 'scratchpad');
}
/**
 * Ensures the scratchpad directory exists for the current session.
 * Creates the directory with secure permissions (0o700) if it doesn't exist.
 * Returns the path to the scratchpad directory.
 * @throws If scratchpad feature is not enabled
 */
function ensureScratchpadDir() {
    return __awaiter(this, void 0, void 0, function () {
        var fs, scratchpadDir;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!isScratchpadEnabled()) {
                        throw new Error('Scratchpad directory feature is not enabled');
                    }
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    scratchpadDir = getScratchpadDir();
                    // Create directory recursively with secure permissions (owner-only access)
                    // FsOperations.mkdir handles recursive: true internally and is a no-op if dir exists
                    return [4 /*yield*/, fs.mkdir(scratchpadDir, { mode: 448 })];
                case 1:
                    // Create directory recursively with secure permissions (owner-only access)
                    // FsOperations.mkdir handles recursive: true internally and is a no-op if dir exists
                    _a.sent();
                    return [2 /*return*/, scratchpadDir];
            }
        });
    });
}
// Check if file is within the scratchpad directory
function isScratchpadPath(absolutePath) {
    if (!isScratchpadEnabled()) {
        return false;
    }
    var scratchpadDir = getScratchpadDir();
    // SECURITY: Normalize the path to resolve .. segments before checking
    // This prevents path traversal bypasses like:
    //   echo "malicious" > /tmp/claude-0/proj/session/scratchpad/../../../etc/passwd
    // Without normalization, the path would pass the startsWith check but write to /etc/passwd
    var normalizedPath = (0, path_1.normalize)(absolutePath);
    return (normalizedPath === scratchpadDir ||
        normalizedPath.startsWith(scratchpadDir + path_1.sep));
}
/**
 * Check if a file path is dangerous to auto-edit without explicit permission.
 * This includes:
 * - Files in .git directories or .gitconfig files (to prevent git-based data exfiltration and code execution)
 * - Files in .vscode directories (to prevent VS Code settings manipulation and potential code execution)
 * - Files in .idea directories (to prevent JetBrains IDE settings manipulation)
 * - Shell configuration files (to prevent shell startup script manipulation)
 * - UNC paths (to prevent network file access and WebDAV attacks)
 */
function isDangerousFilePathToAutoEdit(path) {
    var absolutePath = (0, path_js_1.expandPath)(path);
    var pathSegments = absolutePath.split(path_1.sep);
    var fileName = pathSegments.at(-1);
    // Check for UNC paths (defense-in-depth to catch any patterns that might not be caught by containsVulnerableUncPath)
    // Block anything starting with \\ or // as these are potentially UNC paths that could access network resources
    if (path.startsWith('\\\\') || path.startsWith('//')) {
        return true;
    }
    // Check if path is within dangerous directories (case-insensitive to prevent bypasses)
    for (var i = 0; i < pathSegments.length; i++) {
        var segment = pathSegments[i];
        var normalizedSegment = normalizeCaseForComparison(segment);
        for (var _i = 0, DANGEROUS_DIRECTORIES_1 = exports.DANGEROUS_DIRECTORIES; _i < DANGEROUS_DIRECTORIES_1.length; _i++) {
            var dir = DANGEROUS_DIRECTORIES_1[_i];
            if (normalizedSegment !== normalizeCaseForComparison(dir)) {
                continue;
            }
            // Special case: .claude/worktrees/ is a structural path (where Claude stores
            // git worktrees), not a user-created dangerous directory. Skip the .claude
            // segment when it's followed by 'worktrees'. Any nested .claude directories
            // within the worktree (not followed by 'worktrees') are still blocked.
            if (dir === '.claude') {
                var nextSegment = pathSegments[i + 1];
                if (nextSegment &&
                    normalizeCaseForComparison(nextSegment) === 'worktrees') {
                    break; // Skip this .claude, continue checking other segments
                }
            }
            return true;
        }
    }
    // Check for dangerous configuration files (case-insensitive)
    if (fileName) {
        var normalizedFileName_1 = normalizeCaseForComparison(fileName);
        if (exports.DANGEROUS_FILES.some(function (dangerousFile) {
            return normalizeCaseForComparison(dangerousFile) === normalizedFileName_1;
        })) {
            return true;
        }
    }
    return false;
}
/**
 * Detects suspicious Windows path patterns that could bypass security checks.
 * These patterns include:
 * - NTFS Alternate Data Streams (e.g., file.txt::$DATA or file.txt:stream)
 * - 8.3 short names (e.g., GIT~1, CLAUDE~1, SETTIN~1.JSON)
 * - Long path prefixes (e.g., \\?\C:\..., \\.\C:\..., //?/C:/..., //./C:/...)
 * - Trailing dots and spaces (e.g., .git., .claude , .bashrc...)
 * - DOS device names (e.g., .git.CON, settings.json.PRN, .bashrc.AUX)
 * - Three or more consecutive dots (e.g., .../file.txt, path/.../file, file...txt)
 *
 * When detected, these paths should always require manual approval to prevent
 * bypassing security checks through path canonicalization vulnerabilities.
 *
 * ## Why Check on All Platforms?
 *
 * While these patterns are primarily Windows-specific, NTFS filesystems can be
 * mounted on Linux and macOS (e.g., using ntfs-3g). On these systems, the same
 * bypass techniques would work - an attacker could use short names or long path
 * prefixes to bypass security checks. Therefore, we check for these patterns on
 * all platforms to ensure comprehensive protection. (Note: the ADS colon check
 * is Windows/WSL-only, since colon syntax is only interpreted by the Windows
 * kernel; on Linux/macOS, NTFS ADS is accessed via xattrs, not colon syntax.)
 *
 * ## Why Detection Instead of Normalization?
 *
 * An alternative approach would be to normalize these paths using Windows APIs
 * (e.g., GetLongPathNameW). However, this approach has significant challenges:
 *
 * 1. **Filesystem dependency**: Short path normalization is relative to files that
 *    currently exist on the filesystem. This creates issues when writing to new
 *    files since they don't exist yet and cannot be normalized.
 *
 * 2. **Race conditions**: The filesystem state can change between normalization
 *    and actual file access, creating TOCTOU (Time-Of-Check-Time-Of-Use) vulnerabilities.
 *
 * 3. **Complexity**: Proper normalization requires Windows-specific APIs, handling
 *    multiple edge cases, and dealing with various path formats (UNC, device paths, etc.).
 *
 * 4. **Reliability**: Pattern detection is more predictable and doesn't depend on
 *    external system state.
 *
 * If you are considering adding normalization for these paths, please reach out to
 * AppSec first to discuss the security implications and implementation approach.
 *
 * @param path The path to check for suspicious patterns
 * @returns true if suspicious Windows path patterns are detected
 */
function hasSuspiciousWindowsPathPattern(path) {
    // Check for NTFS Alternate Data Streams
    // Look for ':' after position 2 to skip drive letters (e.g., C:\)
    // Examples: file.txt::$DATA, .bashrc:hidden, settings.json:stream
    // Note: ADS colon syntax is only interpreted by the Windows kernel. On WSL,
    // DrvFs mounts route file operations through the Windows kernel, so colon
    // syntax is still interpreted as ADS separators. On Linux/macOS (non-WSL),
    // even when NTFS is mounted, ADS is accessed via xattrs (ntfs-3g) not colon
    // syntax, and colons are valid filename characters.
    if ((0, platform_js_1.getPlatform)() === 'windows' || (0, platform_js_1.getPlatform)() === 'wsl') {
        var colonIndex = path.indexOf(':', 2);
        if (colonIndex !== -1) {
            return true;
        }
    }
    // Check for 8.3 short names
    // Look for '~' followed by a digit
    // Examples: GIT~1, CLAUDE~1, SETTIN~1.JSON, BASHRC~1
    if (/~\d/.test(path)) {
        return true;
    }
    // Check for long path prefixes (both backslash and forward slash variants)
    // Examples: \\?\C:\Users\..., \\.\C:\..., //?/C:/..., //./C:/...
    if (path.startsWith('\\\\?\\') ||
        path.startsWith('\\\\.\\') ||
        path.startsWith('//?/') ||
        path.startsWith('//./')) {
        return true;
    }
    // Check for trailing dots and spaces that Windows strips during path resolution
    // Examples: .git., .claude , .bashrc..., settings.json.
    // This can bypass string matching if ".git" is blocked but ".git." is used
    if (/[.\s]+$/.test(path)) {
        return true;
    }
    // Check for DOS device names that Windows treats as special devices
    // Examples: .git.CON, settings.json.PRN, .bashrc.AUX
    // Device names: CON, PRN, AUX, NUL, COM1-9, LPT1-9
    if (/\.(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i.test(path)) {
        return true;
    }
    // Check for three or more consecutive dots (...) when used as a path component
    // This pattern can be used to bypass security checks or create confusion
    // Examples: .../file.txt, path/.../file
    // Only block when dots are preceded AND followed by path separators (/ or \)
    // This allows legitimate uses like Next.js catch-all routes [...]name]
    if (/(^|\/|\\)\.{3,}(\/|\\|$)/.test(path)) {
        return true;
    }
    // Check for UNC paths (on all platforms for defense-in-depth)
    // Examples: \\server\share, \\foo.com\file, //server/share, \\192.168.1.1\share
    // UNC paths can access remote resources, leak credentials, and bypass working directory restrictions
    if ((0, readOnlyCommandValidation_js_1.containsVulnerableUncPath)(path)) {
        return true;
    }
    return false;
}
/**
 * Checks if a path is safe for auto-editing (acceptEdits mode).
 * Returns information about why the path is unsafe, or null if all checks pass.
 *
 * This function performs comprehensive safety checks including:
 * - Suspicious Windows path patterns (NTFS streams, 8.3 names, long path prefixes, etc.)
 * - Claude config files (.claude/settings.json, .claude/commands/, .claude/agents/)
 * - MCP CLI state files (managed internally by Claude Code)
 * - Dangerous files (.bashrc, .gitconfig, .git/, .vscode/, .idea/, etc.)
 *
 * IMPORTANT: This function checks BOTH the original path AND resolved symlink paths
 * to prevent bypasses via symlinks pointing to protected files.
 *
 * @param path The path to check for safety
 * @returns Object with safe=false and message if unsafe, or { safe: true } if all checks pass
 */
function checkPathSafetyForAutoEdit(path, precomputedPathsToCheck) {
    // Get all paths to check (original + symlink resolved paths)
    var pathsToCheck = precomputedPathsToCheck !== null && precomputedPathsToCheck !== void 0 ? precomputedPathsToCheck : (0, fsOperations_js_1.getPathsForPermissionCheck)(path);
    // Check for suspicious Windows path patterns on all paths
    for (var _i = 0, pathsToCheck_1 = pathsToCheck; _i < pathsToCheck_1.length; _i++) {
        var pathToCheck = pathsToCheck_1[_i];
        if (hasSuspiciousWindowsPathPattern(pathToCheck)) {
            return {
                safe: false,
                message: "Claude requested permissions to write to ".concat(path, ", which contains a suspicious Windows path pattern that requires manual approval."),
                classifierApprovable: false,
            };
        }
    }
    // Check for Claude config files on all paths
    for (var _a = 0, pathsToCheck_2 = pathsToCheck; _a < pathsToCheck_2.length; _a++) {
        var pathToCheck = pathsToCheck_2[_a];
        if (isClaudeConfigFilePath(pathToCheck)) {
            return {
                safe: false,
                message: "Claude requested permissions to write to ".concat(path, ", but you haven't granted it yet."),
                classifierApprovable: true,
            };
        }
    }
    // Check for dangerous files on all paths
    for (var _b = 0, pathsToCheck_3 = pathsToCheck; _b < pathsToCheck_3.length; _b++) {
        var pathToCheck = pathsToCheck_3[_b];
        if (isDangerousFilePathToAutoEdit(pathToCheck)) {
            return {
                safe: false,
                message: "Claude requested permissions to edit ".concat(path, " which is a sensitive file."),
                classifierApprovable: true,
            };
        }
    }
    // All safety checks passed
    return { safe: true };
}
function allWorkingDirectories(context) {
    return new Set(__spreadArray([
        (0, state_js_1.getOriginalCwd)()
    ], context.additionalWorkingDirectories.keys(), true));
}
// Working directories are session-stable; memoize their resolved forms to
// avoid repeated existsSync/lstatSync/realpathSync syscalls on every
// permission check. Keyed by path string — getPathsForPermissionCheck is
// deterministic for existing directories within a session.
// Exported for test/preload.ts cache clearing (shard-isolation).
exports.getResolvedWorkingDirPaths = (0, memoize_js_1.default)(fsOperations_js_1.getPathsForPermissionCheck);
function pathInAllowedWorkingPath(path, toolPermissionContext, precomputedPathsToCheck) {
    // Check both the original path and the resolved symlink path
    var pathsToCheck = precomputedPathsToCheck !== null && precomputedPathsToCheck !== void 0 ? precomputedPathsToCheck : (0, fsOperations_js_1.getPathsForPermissionCheck)(path);
    // Resolve working directories the same way we resolve input paths so
    // comparisons are symmetric. Without this, a resolved input path
    // (e.g. /System/Volumes/Data/home/... on macOS) would not match an
    // unresolved working directory (/home/...), causing false denials.
    var workingPaths = Array.from(allWorkingDirectories(toolPermissionContext)).flatMap(function (wp) { return (0, exports.getResolvedWorkingDirPaths)(wp); });
    // All paths must be within allowed working paths
    // If any resolved path is outside, deny access
    return pathsToCheck.every(function (pathToCheck) {
        return workingPaths.some(function (workingPath) {
            return pathInWorkingPath(pathToCheck, workingPath);
        });
    });
}
function pathInWorkingPath(path, workingPath) {
    var absolutePath = (0, path_js_1.expandPath)(path);
    var absoluteWorkingPath = (0, path_js_1.expandPath)(workingPath);
    // On macOS, handle common symlink issues:
    // - /var -> /private/var
    // - /tmp -> /private/tmp
    var normalizedPath = absolutePath
        .replace(/^\/private\/var\//, '/var/')
        .replace(/^\/private\/tmp(\/|$)/, '/tmp$1');
    var normalizedWorkingPath = absoluteWorkingPath
        .replace(/^\/private\/var\//, '/var/')
        .replace(/^\/private\/tmp(\/|$)/, '/tmp$1');
    // Normalize case for case-insensitive comparison to prevent bypassing security
    // checks on case-insensitive filesystems (macOS/Windows) like .cLauDe/CoMmAnDs
    var caseNormalizedPath = normalizeCaseForComparison(normalizedPath);
    var caseNormalizedWorkingPath = normalizeCaseForComparison(normalizedWorkingPath);
    // Use cross-platform relative path helper
    var relative = relativePath(caseNormalizedWorkingPath, caseNormalizedPath);
    // Same path
    if (relative === '') {
        return true;
    }
    if ((0, path_js_1.containsPathTraversal)(relative)) {
        return false;
    }
    // Path is inside (relative path that doesn't go up)
    return !path_1.posix.isAbsolute(relative);
}
function rootPathForSource(source) {
    switch (source) {
        case 'cliArg':
        case 'command':
        case 'session':
            return (0, path_js_1.expandPath)((0, state_js_1.getOriginalCwd)());
        case 'userSettings':
        case 'policySettings':
        case 'projectSettings':
        case 'localSettings':
        case 'flagSettings':
            return (0, settings_js_1.getSettingsRootPathForSource)(source);
    }
}
function prependDirSep(path) {
    return path_1.posix.join(DIR_SEP, path);
}
function normalizePatternToPath(_a) {
    var patternRoot = _a.patternRoot, pattern = _a.pattern, rootPath = _a.rootPath;
    // If the pattern root + pattern combination starts with our reference root
    var fullPattern = path_1.posix.join(patternRoot, pattern);
    if (patternRoot === rootPath) {
        // If the pattern root exactly matches our reference root no need to change
        return prependDirSep(pattern);
    }
    else if (fullPattern.startsWith("".concat(rootPath).concat(DIR_SEP))) {
        // Extract the relative part
        var relativePart = fullPattern.slice(rootPath.length);
        return prependDirSep(relativePart);
    }
    else {
        // Handle patterns that are inside the reference root but not starting with it
        var relativePath_1 = path_1.posix.relative(rootPath, patternRoot);
        if (!relativePath_1 ||
            relativePath_1.startsWith("..".concat(DIR_SEP)) ||
            relativePath_1 === '..') {
            // Pattern is outside the reference root, so it can be skipped
            return null;
        }
        else {
            var relativePattern = path_1.posix.join(relativePath_1, pattern);
            return prependDirSep(relativePattern);
        }
    }
}
function normalizePatternsToPath(patternsByRoot, root) {
    var _a;
    // null root means the pattern can match anywhere
    var result = new Set((_a = patternsByRoot.get(null)) !== null && _a !== void 0 ? _a : []);
    for (var _i = 0, _b = patternsByRoot.entries(); _i < _b.length; _i++) {
        var _c = _b[_i], patternRoot = _c[0], patterns = _c[1];
        if (patternRoot === null) {
            // already added
            continue;
        }
        // Check each pattern to see if the full path starts with our reference root
        for (var _d = 0, patterns_1 = patterns; _d < patterns_1.length; _d++) {
            var pattern = patterns_1[_d];
            var normalizedPattern = normalizePatternToPath({
                patternRoot: patternRoot,
                pattern: pattern,
                rootPath: root,
            });
            if (normalizedPattern) {
                result.add(normalizedPattern);
            }
        }
    }
    return Array.from(result);
}
/**
 * Collects all deny rules for file read permissions and returns their ignore patterns
 * Each pattern must be resolved relative to its root (map key)
 * Null keys are used for patterns that don't have a root
 *
 * This is used to hide files that are blocked by Read deny rules.
 *
 * @param toolPermissionContext
 */
function getFileReadIgnorePatterns(toolPermissionContext) {
    var patternsByRoot = getPatternsByRoot(toolPermissionContext, 'read', 'deny');
    var result = new Map();
    for (var _i = 0, _a = patternsByRoot.entries(); _i < _a.length; _i++) {
        var _b = _a[_i], patternRoot = _b[0], patternMap = _b[1];
        result.set(patternRoot, Array.from(patternMap.keys()));
    }
    return result;
}
function patternWithRoot(pattern, source) {
    var _a, _b;
    if (pattern.startsWith("".concat(DIR_SEP).concat(DIR_SEP))) {
        // Patterns starting with // resolve relative to /
        var patternWithoutDoubleSlash = pattern.slice(1);
        // On Windows, check if this is a POSIX-style drive path like //c/Users/...
        // Note: UNC paths (//server/share) will not match this regex and will be treated
        // as root-relative patterns, which may need separate handling in the future
        if ((0, platform_js_1.getPlatform)() === 'windows' &&
            patternWithoutDoubleSlash.match(/^\/[a-z]\//i)) {
            // Convert POSIX path to Windows format
            // The pattern is like /c/Users/... so we convert it to C:\Users\...
            var driveLetter = (_b = (_a = patternWithoutDoubleSlash[1]) === null || _a === void 0 ? void 0 : _a.toUpperCase()) !== null && _b !== void 0 ? _b : 'C';
            // Keep the pattern in POSIX format since relativePath returns POSIX paths
            var pathAfterDrive = patternWithoutDoubleSlash.slice(2);
            // Extract the drive root (C:\) and the rest of the pattern
            var driveRoot = "".concat(driveLetter, ":\\");
            var relativeFromDrive = pathAfterDrive.startsWith('/')
                ? pathAfterDrive.slice(1)
                : pathAfterDrive;
            return {
                relativePattern: relativeFromDrive,
                root: driveRoot,
            };
        }
        return {
            relativePattern: patternWithoutDoubleSlash,
            root: DIR_SEP,
        };
    }
    else if (pattern.startsWith("~".concat(DIR_SEP))) {
        // Patterns starting with ~/ resolve relative to homedir
        return {
            relativePattern: pattern.slice(1),
            root: (0, os_1.homedir)().normalize('NFC'),
        };
    }
    else if (pattern.startsWith(DIR_SEP)) {
        // Patterns starting with / resolve relative to the directory where settings are stored (without .claude/)
        return {
            relativePattern: pattern,
            root: rootPathForSource(source),
        };
    }
    // No root specified, put it with all the other patterns
    // Normalize patterns that start with "./" to remove the prefix
    // This ensures that patterns like "./.env" match files like ".env"
    var normalizedPattern = pattern;
    if (pattern.startsWith(".".concat(DIR_SEP))) {
        normalizedPattern = pattern.slice(2);
    }
    return {
        relativePattern: normalizedPattern,
        root: null,
    };
}
function getPatternsByRoot(toolPermissionContext, toolType, behavior) {
    var toolName = (function () {
        switch (toolType) {
            case 'edit':
                // Apply Edit tool rules to any tool editing files
                return constants_js_1.FILE_EDIT_TOOL_NAME;
            case 'read':
                // Apply Read tool rules to any tool reading files
                return prompt_js_1.FILE_READ_TOOL_NAME;
        }
    })();
    var rules = (0, permissions_js_1.getRuleByContentsForToolName)(toolPermissionContext, toolName, behavior);
    // Resolve rules relative to path based on source
    var patternsByRoot = new Map();
    for (var _i = 0, _a = rules.entries(); _i < _a.length; _i++) {
        var _b = _a[_i], pattern = _b[0], rule = _b[1];
        var _c = patternWithRoot(pattern, rule.source), relativePattern = _c.relativePattern, root = _c.root;
        var patternsForRoot = patternsByRoot.get(root);
        if (patternsForRoot === undefined) {
            patternsForRoot = new Map();
            patternsByRoot.set(root, patternsForRoot);
        }
        // Store the rule keyed by the root
        patternsForRoot.set(relativePattern, rule);
    }
    return patternsByRoot;
}
function matchingRuleForInput(path, toolPermissionContext, toolType, behavior) {
    var _a, _b;
    var fileAbsolutePath = (0, path_js_1.expandPath)(path);
    // On Windows, convert to POSIX format to match against permission patterns
    if ((0, platform_js_1.getPlatform)() === 'windows' && fileAbsolutePath.includes('\\')) {
        fileAbsolutePath = (0, windowsPaths_js_1.windowsPathToPosixPath)(fileAbsolutePath);
    }
    var patternsByRoot = getPatternsByRoot(toolPermissionContext, toolType, behavior);
    // Check each root for a matching pattern
    for (var _i = 0, _c = patternsByRoot.entries(); _i < _c.length; _i++) {
        var _d = _c[_i], root = _d[0], patternMap = _d[1];
        // Transform patterns for the ignore library
        var patterns = Array.from(patternMap.keys()).map(function (pattern) {
            var adjustedPattern = pattern;
            // Remove /** suffix - ignore library treats 'path' as matching both
            // the path itself and everything inside it
            if (adjustedPattern.endsWith('/**')) {
                adjustedPattern = adjustedPattern.slice(0, -3);
            }
            return adjustedPattern;
        });
        var ig = (0, ignore_1.default)().add(patterns);
        // Use cross-platform relative path helper for POSIX-style patterns
        var relativePathStr = relativePath(root !== null && root !== void 0 ? root : (0, cwd_js_1.getCwd)(), fileAbsolutePath !== null && fileAbsolutePath !== void 0 ? fileAbsolutePath : (0, cwd_js_1.getCwd)());
        if (relativePathStr.startsWith("..".concat(DIR_SEP))) {
            // The path is outside the root, so ignore it
            continue;
        }
        // Important: ig.test throws if you give it an empty string
        if (!relativePathStr) {
            continue;
        }
        var igResult = ig.test(relativePathStr);
        if (igResult.ignored && igResult.rule) {
            // Map the matched pattern back to the original rule
            var originalPattern = igResult.rule.pattern;
            // Check if this was a /** pattern we simplified
            var withWildcard = originalPattern + '/**';
            if (patternMap.has(withWildcard)) {
                return (_a = patternMap.get(withWildcard)) !== null && _a !== void 0 ? _a : null;
            }
            return (_b = patternMap.get(originalPattern)) !== null && _b !== void 0 ? _b : null;
        }
    }
    // No matching rule found
    return null;
}
/**
 * Permission result for read permission for the specified tool & tool input
 */
function checkReadPermissionForTool(tool, input, toolPermissionContext) {
    if (typeof tool.getPath !== 'function') {
        return {
            behavior: 'ask',
            message: "Claude requested permissions to use ".concat(tool.name, ", but you haven't granted it yet."),
        };
    }
    var path = tool.getPath(input);
    // Get paths to check (includes both original and resolved symlinks).
    // Computed once here and threaded through checkWritePermissionForTool →
    // checkPathSafetyForAutoEdit → pathInAllowedWorkingPath to avoid redundant
    // existsSync/lstatSync/realpathSync syscalls on the same path (previously
    // 6× = 30 syscalls per Read permission check).
    var pathsToCheck = (0, fsOperations_js_1.getPathsForPermissionCheck)(path);
    // 1. Defense-in-depth: Block UNC paths early (before other checks)
    // This catches paths starting with \\ or // that could access network resources
    // This may catch some UNC patterns not detected by containsVulnerableUncPath
    for (var _i = 0, pathsToCheck_4 = pathsToCheck; _i < pathsToCheck_4.length; _i++) {
        var pathToCheck = pathsToCheck_4[_i];
        if (pathToCheck.startsWith('\\\\') || pathToCheck.startsWith('//')) {
            return {
                behavior: 'ask',
                message: "Claude requested permissions to read from ".concat(path, ", which appears to be a UNC path that could access network resources."),
                decisionReason: {
                    type: 'other',
                    reason: 'UNC path detected (defense-in-depth check)',
                },
            };
        }
    }
    // 2. Check for suspicious Windows path patterns (defense in depth)
    for (var _a = 0, pathsToCheck_5 = pathsToCheck; _a < pathsToCheck_5.length; _a++) {
        var pathToCheck = pathsToCheck_5[_a];
        if (hasSuspiciousWindowsPathPattern(pathToCheck)) {
            return {
                behavior: 'ask',
                message: "Claude requested permissions to read from ".concat(path, ", which contains a suspicious Windows path pattern that requires manual approval."),
                decisionReason: {
                    type: 'other',
                    reason: 'Path contains suspicious Windows-specific patterns (alternate data streams, short names, long path prefixes, or three or more consecutive dots) that require manual verification',
                },
            };
        }
    }
    // 3. Check for READ-SPECIFIC deny rules first - check both the original path and resolved symlink path
    // SECURITY: This must come before any allow checks (including "edit access implies read access")
    // to prevent bypassing explicit read deny rules
    for (var _b = 0, pathsToCheck_6 = pathsToCheck; _b < pathsToCheck_6.length; _b++) {
        var pathToCheck = pathsToCheck_6[_b];
        var denyRule = matchingRuleForInput(pathToCheck, toolPermissionContext, 'read', 'deny');
        if (denyRule) {
            return {
                behavior: 'deny',
                message: "Permission to read ".concat(path, " has been denied."),
                decisionReason: {
                    type: 'rule',
                    rule: denyRule,
                },
            };
        }
    }
    // 4. Check for READ-SPECIFIC ask rules - check both the original path and resolved symlink path
    // SECURITY: This must come before implicit allow checks to ensure explicit ask rules are honored
    for (var _c = 0, pathsToCheck_7 = pathsToCheck; _c < pathsToCheck_7.length; _c++) {
        var pathToCheck = pathsToCheck_7[_c];
        var askRule = matchingRuleForInput(pathToCheck, toolPermissionContext, 'read', 'ask');
        if (askRule) {
            return {
                behavior: 'ask',
                message: "Claude requested permissions to read from ".concat(path, ", but you haven't granted it yet."),
                decisionReason: {
                    type: 'rule',
                    rule: askRule,
                },
            };
        }
    }
    // 5. Edit access implies read access (but only if no read-specific deny/ask rules exist)
    // We check this after read-specific rules so that explicit read restrictions take precedence
    var editResult = checkWritePermissionForTool(tool, input, toolPermissionContext, pathsToCheck);
    if (editResult.behavior === 'allow') {
        return editResult;
    }
    // 6. Allow reads in working directories
    var isInWorkingDir = pathInAllowedWorkingPath(path, toolPermissionContext, pathsToCheck);
    if (isInWorkingDir) {
        return {
            behavior: 'allow',
            updatedInput: input,
            decisionReason: {
                type: 'mode',
                mode: 'default',
            },
        };
    }
    // 7. Allow reads from internal harness paths (session-memory, plans, tool-results)
    var absolutePath = (0, path_js_1.expandPath)(path);
    var internalReadResult = checkReadableInternalPath(absolutePath, input);
    if (internalReadResult.behavior !== 'passthrough') {
        return internalReadResult;
    }
    // 8. Check for allow rules
    var allowRule = matchingRuleForInput(path, toolPermissionContext, 'read', 'allow');
    if (allowRule) {
        return {
            behavior: 'allow',
            updatedInput: input,
            decisionReason: {
                type: 'rule',
                rule: allowRule,
            },
        };
    }
    // 12. Default to asking for permission
    // At this point, isInWorkingDir is false (from step #6), so path is outside working directories
    return {
        behavior: 'ask',
        message: "Claude requested permissions to read from ".concat(path, ", but you haven't granted it yet."),
        suggestions: generateSuggestions(path, 'read', toolPermissionContext, pathsToCheck),
        decisionReason: {
            type: 'workingDir',
            reason: 'Path is outside allowed working directories',
        },
    };
}
/**
 * Permission result for write permission for the specified tool & tool input.
 *
 * @param precomputedPathsToCheck - Optional cached result of
 *   `getPathsForPermissionCheck(tool.getPath(input))`. Callers MUST derive this
 *   from the same `tool` and `input` in the same synchronous frame — `path` is
 *   re-derived internally for error messages and internal-path checks, so a
 *   stale value would silently check deny rules for the wrong path.
 */
function checkWritePermissionForTool(tool, input, toolPermissionContext, precomputedPathsToCheck) {
    var _a;
    if (typeof tool.getPath !== 'function') {
        return {
            behavior: 'ask',
            message: "Claude requested permissions to use ".concat(tool.name, ", but you haven't granted it yet."),
        };
    }
    var path = tool.getPath(input);
    // 1. Check for deny rules - check both the original path and resolved symlink path
    var pathsToCheck = precomputedPathsToCheck !== null && precomputedPathsToCheck !== void 0 ? precomputedPathsToCheck : (0, fsOperations_js_1.getPathsForPermissionCheck)(path);
    for (var _i = 0, pathsToCheck_8 = pathsToCheck; _i < pathsToCheck_8.length; _i++) {
        var pathToCheck = pathsToCheck_8[_i];
        var denyRule = matchingRuleForInput(pathToCheck, toolPermissionContext, 'edit', 'deny');
        if (denyRule) {
            return {
                behavior: 'deny',
                message: "Permission to edit ".concat(path, " has been denied."),
                decisionReason: {
                    type: 'rule',
                    rule: denyRule,
                },
            };
        }
    }
    // 1.5. Allow writes to internal editable paths (plan files, scratchpad)
    // This MUST come before isDangerousFilePathToAutoEdit check since .claude is a dangerous directory
    var absolutePathForEdit = (0, path_js_1.expandPath)(path);
    var internalEditResult = checkEditableInternalPath(absolutePathForEdit, input);
    if (internalEditResult.behavior !== 'passthrough') {
        return internalEditResult;
    }
    // 1.6. Check for .claude/** allow rules BEFORE safety checks
    // This allows session-level permissions to bypass the safety blocks for .claude/
    // We only allow this for session-level rules to prevent users from accidentally
    // permanently granting broad access to their .claude/ folder.
    //
    // matchingRuleForInput returns the first match across all sources. If the user
    // also has a broader Edit(.claude) rule in userSettings (e.g. from sandbox
    // write-allow conversion), that rule would be found first and its source check
    // below would fail. Scope the search to session-only rules so the dialog's
    // "allow Claude to edit its own settings for this session" option actually works.
    var claudeFolderAllowRule = matchingRuleForInput(path, __assign(__assign({}, toolPermissionContext), { alwaysAllowRules: {
            session: (_a = toolPermissionContext.alwaysAllowRules.session) !== null && _a !== void 0 ? _a : [],
        } }), 'edit', 'allow');
    if (claudeFolderAllowRule) {
        // Check if this rule is scoped under .claude/ (project or global).
        // Accepts both the broad patterns ('/.claude/**', '~/.claude/**') and
        // narrowed ones like '/.claude/skills/my-skill/**' so users can grant
        // session access to a single skill without also exposing settings.json
        // or hooks/. The rule already matched the path via matchingRuleForInput;
        // this is an additional scope check. Reject '..' to prevent a rule like
        // '/.claude/../**' from leaking this bypass outside .claude/.
        var ruleContent = claudeFolderAllowRule.ruleValue.ruleContent;
        if (ruleContent &&
            (ruleContent.startsWith(constants_js_1.CLAUDE_FOLDER_PERMISSION_PATTERN.slice(0, -2)) ||
                ruleContent.startsWith(constants_js_1.GLOBAL_CLAUDE_FOLDER_PERMISSION_PATTERN.slice(0, -2))) &&
            !ruleContent.includes('..') &&
            ruleContent.endsWith('/**')) {
            return {
                behavior: 'allow',
                updatedInput: input,
                decisionReason: {
                    type: 'rule',
                    rule: claudeFolderAllowRule,
                },
            };
        }
    }
    // 1.7. Check comprehensive safety validations (Windows patterns, Claude config, dangerous files)
    // This MUST come before checking allow rules to prevent users from accidentally granting
    // permission to edit protected files
    var safetyCheck = checkPathSafetyForAutoEdit(path, pathsToCheck);
    if (!safetyCheck.safe) {
        // SDK suggestion: if under .claude/skills/{name}/, emit the narrowed
        // session-scoped addRules that step 1.6 will honor on the next call.
        // Everything else (.claude/settings.json, .git/, .vscode/, .idea/) falls
        // back to generateSuggestions — its setMode suggestion doesn't bypass
        // this check, but preserving it avoids a surprising empty array.
        var skillScope = getClaudeSkillScope(path);
        var safetySuggestions = skillScope
            ? [
                {
                    type: 'addRules',
                    rules: [
                        {
                            toolName: constants_js_1.FILE_EDIT_TOOL_NAME,
                            ruleContent: skillScope.pattern,
                        },
                    ],
                    behavior: 'allow',
                    destination: 'session',
                },
            ]
            : generateSuggestions(path, 'write', toolPermissionContext, pathsToCheck);
        return {
            behavior: 'ask',
            message: safetyCheck.message,
            suggestions: safetySuggestions,
            decisionReason: {
                type: 'safetyCheck',
                reason: safetyCheck.message,
                classifierApprovable: safetyCheck.classifierApprovable,
            },
        };
    }
    // 2. Check for ask rules - check both the original path and resolved symlink path
    for (var _b = 0, pathsToCheck_9 = pathsToCheck; _b < pathsToCheck_9.length; _b++) {
        var pathToCheck = pathsToCheck_9[_b];
        var askRule = matchingRuleForInput(pathToCheck, toolPermissionContext, 'edit', 'ask');
        if (askRule) {
            return {
                behavior: 'ask',
                message: "Claude requested permissions to write to ".concat(path, ", but you haven't granted it yet."),
                decisionReason: {
                    type: 'rule',
                    rule: askRule,
                },
            };
        }
    }
    // 3. If in acceptEdits or sandboxBashMode mode, allow all writes in original cwd
    var isInWorkingDir = pathInAllowedWorkingPath(path, toolPermissionContext, pathsToCheck);
    if (toolPermissionContext.mode === 'acceptEdits' && isInWorkingDir) {
        return {
            behavior: 'allow',
            updatedInput: input,
            decisionReason: {
                type: 'mode',
                mode: toolPermissionContext.mode,
            },
        };
    }
    // 4. Check for allow rules
    var allowRule = matchingRuleForInput(path, toolPermissionContext, 'edit', 'allow');
    if (allowRule) {
        return {
            behavior: 'allow',
            updatedInput: input,
            decisionReason: {
                type: 'rule',
                rule: allowRule,
            },
        };
    }
    // 5. Default to asking for permission
    return {
        behavior: 'ask',
        message: "Claude requested permissions to write to ".concat(path, ", but you haven't granted it yet."),
        suggestions: generateSuggestions(path, 'write', toolPermissionContext, pathsToCheck),
        decisionReason: !isInWorkingDir
            ? {
                type: 'workingDir',
                reason: 'Path is outside allowed working directories',
            }
            : undefined,
    };
}
function generateSuggestions(filePath, operationType, toolPermissionContext, precomputedPathsToCheck) {
    var isOutsideWorkingDir = !pathInAllowedWorkingPath(filePath, toolPermissionContext, precomputedPathsToCheck);
    if (operationType === 'read' && isOutsideWorkingDir) {
        // For read operations outside working directories, add Read rules
        // IMPORTANT: Include both the symlink path and resolved path so subsequent checks pass
        var dirPath = (0, path_js_1.getDirectoryForPath)(filePath);
        var dirsToAdd = (0, fsOperations_js_1.getPathsForPermissionCheck)(dirPath);
        var suggestions = dirsToAdd
            .map(function (dir) { return (0, PermissionUpdate_js_1.createReadRuleSuggestion)(dir, 'session'); })
            .filter(function (s) { return s !== undefined; });
        return suggestions;
    }
    // Only suggest setMode:acceptEdits when it would be an upgrade. In auto
    // mode the classifier already auto-approves edits; in bypassPermissions
    // everything is allowed; in acceptEdits it's a no-op. Suggesting it
    // anyway and having the SDK host apply it on "Always allow" silently
    // downgrades auto → acceptEdits, which then prompts for MCP/Bash.
    var shouldSuggestAcceptEdits = toolPermissionContext.mode === 'default' ||
        toolPermissionContext.mode === 'plan';
    if (operationType === 'write' || operationType === 'create') {
        var updates = shouldSuggestAcceptEdits
            ? [{ type: 'setMode', mode: 'acceptEdits', destination: 'session' }]
            : [];
        if (isOutsideWorkingDir) {
            // For write operations outside working directories, also add the directory
            // IMPORTANT: Include both the symlink path and resolved path so subsequent checks pass
            var dirPath = (0, path_js_1.getDirectoryForPath)(filePath);
            var dirsToAdd = (0, fsOperations_js_1.getPathsForPermissionCheck)(dirPath);
            updates.push({
                type: 'addDirectories',
                directories: dirsToAdd,
                destination: 'session',
            });
        }
        return updates;
    }
    // For read operations inside working directories, just change mode
    return shouldSuggestAcceptEdits
        ? [{ type: 'setMode', mode: 'acceptEdits', destination: 'session' }]
        : [];
}
/**
 * Check if a path is an internal path that can be edited without permission.
 * Returns a PermissionResult - either 'allow' if matched, or 'passthrough' to continue checking.
 */
function checkEditableInternalPath(absolutePath, input) {
    // SECURITY: Normalize path to prevent traversal bypasses via .. segments
    // This is defense-in-depth; individual helper functions also normalize
    var normalizedPath = (0, path_1.normalize)(absolutePath);
    // Plan files for current session
    if (isSessionPlanFile(normalizedPath)) {
        return {
            behavior: 'allow',
            updatedInput: input,
            decisionReason: {
                type: 'other',
                reason: 'Plan files for current session are allowed for writing',
            },
        };
    }
    // Scratchpad directory for current session
    if (isScratchpadPath(normalizedPath)) {
        return {
            behavior: 'allow',
            updatedInput: input,
            decisionReason: {
                type: 'other',
                reason: 'Scratchpad files for current session are allowed for writing',
            },
        };
    }
    // Template job's own directory. Env key hardcoded (vs importing JOB_ENV_KEY
    // from jobs/state) so tree-shaking eliminates the string from external
    // builds — spawn.test.ts asserts the string matches. Hijack guard: the env
    // var value must itself resolve under ~/.claude/jobs/. Symlink guard: every
    // resolved form of the target (lexical + symlink chain) must fall under some
    // resolved form of the job dir, so a symlink inside the job dir pointing at
    // e.g. ~/.ssh/authorized_keys does not get a free write. Resolving both
    // sides handles the macOS /tmp → /private/tmp case where the config dir
    // lives under a symlinked root.
    if ((0, bun_bundle_1.feature)('TEMPLATES')) {
        var jobDir = process.env.CLAUDE_JOB_DIR;
        if (jobDir) {
            var jobsRoot = (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), 'jobs');
            var jobDirForms_1 = (0, fsOperations_js_1.getPathsForPermissionCheck)(jobDir).map(path_1.normalize);
            var jobsRootForms_1 = (0, fsOperations_js_1.getPathsForPermissionCheck)(jobsRoot).map(path_1.normalize);
            // Hijack guard: every resolved form of the job dir must sit under
            // some resolved form of the jobs root. Resolving both sides handles
            // the case where ~/.claude is a symlink (e.g. to /data/claude-config).
            var isUnderJobsRoot = jobDirForms_1.every(function (jd) {
                return jobsRootForms_1.some(function (jr) { return jd.startsWith(jr + path_1.sep); });
            });
            if (isUnderJobsRoot) {
                var targetForms = (0, fsOperations_js_1.getPathsForPermissionCheck)(absolutePath);
                var allInsideJobDir = targetForms.every(function (p) {
                    var np = (0, path_1.normalize)(p);
                    return jobDirForms_1.some(function (jd) { return np === jd || np.startsWith(jd + path_1.sep); });
                });
                if (allInsideJobDir) {
                    return {
                        behavior: 'allow',
                        updatedInput: input,
                        decisionReason: {
                            type: 'other',
                            reason: 'Job directory files for current job are allowed for writing',
                        },
                    };
                }
            }
        }
    }
    // Agent memory directory (for self-improving agents)
    if ((0, agentMemory_js_1.isAgentMemoryPath)(normalizedPath)) {
        return {
            behavior: 'allow',
            updatedInput: input,
            decisionReason: {
                type: 'other',
                reason: 'Agent memory files are allowed for writing',
            },
        };
    }
    // Memdir directory (persistent memory for cross-session learning)
    // This pre-safety-check carve-out exists because the default path is under
    // ~/.claude/, which is in DANGEROUS_DIRECTORIES. The CLAUDE_COWORK_MEMORY_PATH_OVERRIDE
    // override is an arbitrary caller-designated directory with no such conflict,
    // so it gets NO special permission treatment here — writes go through normal
    // permission flow (step 5 → ask). SDK callers who want silent memory should
    // pass an allow rule for the override path.
    if (!(0, paths_js_1.hasAutoMemPathOverride)() && (0, paths_js_1.isAutoMemPath)(normalizedPath)) {
        return {
            behavior: 'allow',
            updatedInput: input,
            decisionReason: {
                type: 'other',
                reason: 'auto memory files are allowed for writing',
            },
        };
    }
    // .claude/launch.json — desktop preview config (dev server command + port).
    // The desktop's preview_start MCP tool instructs Claude to create/update
    // this file as part of the preview workflow. Without this carve-out the
    // .claude/ DANGEROUS_DIRECTORIES check prompts for it, which in SDK mode
    // cascades: user clicks "Always allow" → setMode:acceptEdits suggestion
    // applied → silent downgrade from auto mode. Matches the project-level
    // .claude/ only (not ~/.claude/) since launch.json is per-project.
    if (normalizeCaseForComparison(normalizedPath) ===
        normalizeCaseForComparison((0, path_1.join)((0, state_js_1.getOriginalCwd)(), '.claude', 'launch.json'))) {
        return {
            behavior: 'allow',
            updatedInput: input,
            decisionReason: {
                type: 'other',
                reason: 'Preview launch config is allowed for writing',
            },
        };
    }
    return { behavior: 'passthrough', message: '' };
}
/**
 * Check if a path is an internal path that can be read without permission.
 * Returns a PermissionResult - either 'allow' if matched, or 'passthrough' to continue checking.
 */
function checkReadableInternalPath(absolutePath, input) {
    // SECURITY: Normalize path to prevent traversal bypasses via .. segments
    // This is defense-in-depth; individual helper functions also normalize
    var normalizedPath = (0, path_1.normalize)(absolutePath);
    // Session memory directory
    if (isSessionMemoryPath(normalizedPath)) {
        return {
            behavior: 'allow',
            updatedInput: input,
            decisionReason: {
                type: 'other',
                reason: 'Session memory files are allowed for reading',
            },
        };
    }
    // Project directory (for reading past session memories)
    // Path format: ~/.claude/projects/{sanitized-cwd}/...
    if (isProjectDirPath(normalizedPath)) {
        return {
            behavior: 'allow',
            updatedInput: input,
            decisionReason: {
                type: 'other',
                reason: 'Project directory files are allowed for reading',
            },
        };
    }
    // Plan files for current session
    if (isSessionPlanFile(normalizedPath)) {
        return {
            behavior: 'allow',
            updatedInput: input,
            decisionReason: {
                type: 'other',
                reason: 'Plan files for current session are allowed for reading',
            },
        };
    }
    // Tool results directory (persisted large outputs)
    // Use path separator suffix to prevent path traversal (e.g., tool-results-evil/)
    var toolResultsDir = (0, toolResultStorage_js_1.getToolResultsDir)();
    var toolResultsDirWithSep = toolResultsDir.endsWith(path_1.sep)
        ? toolResultsDir
        : toolResultsDir + path_1.sep;
    if (normalizedPath === toolResultsDir ||
        normalizedPath.startsWith(toolResultsDirWithSep)) {
        return {
            behavior: 'allow',
            updatedInput: input,
            decisionReason: {
                type: 'other',
                reason: 'Tool result files are allowed for reading',
            },
        };
    }
    // Scratchpad directory for current session
    if (isScratchpadPath(normalizedPath)) {
        return {
            behavior: 'allow',
            updatedInput: input,
            decisionReason: {
                type: 'other',
                reason: 'Scratchpad files for current session are allowed for reading',
            },
        };
    }
    // Project temp directory (/tmp/claude/{sanitized-cwd}/)
    // Intentionally allows reading files from all sessions in this project, not just the current session.
    // This enables cross-session file access within the same project's temp space.
    var projectTempDir = getProjectTempDir();
    if (normalizedPath.startsWith(projectTempDir)) {
        return {
            behavior: 'allow',
            updatedInput: input,
            decisionReason: {
                type: 'other',
                reason: 'Project temp directory files are allowed for reading',
            },
        };
    }
    // Agent memory directory (for self-improving agents)
    if ((0, agentMemory_js_1.isAgentMemoryPath)(normalizedPath)) {
        return {
            behavior: 'allow',
            updatedInput: input,
            decisionReason: {
                type: 'other',
                reason: 'Agent memory files are allowed for reading',
            },
        };
    }
    // Memdir directory (persistent memory for cross-session learning)
    if ((0, paths_js_1.isAutoMemPath)(normalizedPath)) {
        return {
            behavior: 'allow',
            updatedInput: input,
            decisionReason: {
                type: 'other',
                reason: 'auto memory files are allowed for reading',
            },
        };
    }
    // Tasks directory (~/.claude/tasks/) for swarm task coordination
    var tasksDir = (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), 'tasks') + path_1.sep;
    if (normalizedPath === tasksDir.slice(0, -1) ||
        normalizedPath.startsWith(tasksDir)) {
        return {
            behavior: 'allow',
            updatedInput: input,
            decisionReason: {
                type: 'other',
                reason: 'Task files are allowed for reading',
            },
        };
    }
    // Teams directory (~/.claude/teams/) for swarm coordination
    var teamsReadDir = (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), 'teams') + path_1.sep;
    if (normalizedPath === teamsReadDir.slice(0, -1) ||
        normalizedPath.startsWith(teamsReadDir)) {
        return {
            behavior: 'allow',
            updatedInput: input,
            decisionReason: {
                type: 'other',
                reason: 'Team files are allowed for reading',
            },
        };
    }
    // Bundled skill reference files extracted on first invocation.
    // SECURITY: See getBundledSkillsRoot() — the per-process nonce in the path
    // is the load-bearing defense; uid/VERSION alone are public knowledge and
    // squattable. We always write-before-read on invocation, so content under
    // this subtree is harness-controlled.
    var bundledSkillsRoot = (0, exports.getBundledSkillsRoot)() + path_1.sep;
    if (normalizedPath.startsWith(bundledSkillsRoot)) {
        return {
            behavior: 'allow',
            updatedInput: input,
            decisionReason: {
                type: 'other',
                reason: 'Bundled skill reference files are allowed for reading',
            },
        };
    }
    return { behavior: 'passthrough', message: '' };
}
