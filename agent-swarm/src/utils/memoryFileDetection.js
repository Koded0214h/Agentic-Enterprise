"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectSessionFileType = detectSessionFileType;
exports.detectSessionPatternType = detectSessionPatternType;
exports.isAutoMemFile = isAutoMemFile;
exports.memoryScopeForPath = memoryScopeForPath;
exports.isAutoManagedMemoryFile = isAutoManagedMemoryFile;
exports.isMemoryDirectory = isMemoryDirectory;
exports.isShellCommandTargetingMemory = isShellCommandTargetingMemory;
exports.isAutoManagedMemoryPattern = isAutoManagedMemoryPattern;
var bun_bundle_1 = require("bun:bundle");
var path_1 = require("path");
var paths_js_1 = require("../memdir/paths.js");
var agentMemory_js_1 = require("../tools/AgentTool/agentMemory.js");
var envUtils_js_1 = require("./envUtils.js");
var windowsPaths_js_1 = require("./windowsPaths.js");
/* eslint-disable @typescript-eslint/no-require-imports */
var teamMemPaths = (0, bun_bundle_1.feature)('TEAMMEM')
    ? require('../memdir/teamMemPaths.js')
    : null;
/* eslint-enable @typescript-eslint/no-require-imports */
var IS_WINDOWS = process.platform === 'win32';
// Normalize path separators to posix (/). Does NOT translate drive encoding.
function toPosix(p) {
    return p.split(path_1.win32.sep).join(path_1.posix.sep);
}
// Convert a path to a stable string-comparable form: forward-slash separated,
// and on Windows, lowercased (Windows filesystems are case-insensitive).
function toComparable(p) {
    var posixForm = toPosix(p);
    return IS_WINDOWS ? posixForm.toLowerCase() : posixForm;
}
/**
 * Detects if a file path is a session-related file under ~/.claude.
 * Returns the type of session file or null if not a session file.
 */
function detectSessionFileType(filePath) {
    var configDir = (0, envUtils_js_1.getClaudeConfigHomeDir)();
    // Compare in forward-slash form; on Windows also case-fold. The caller
    // (isShellCommandTargetingMemory) converts MinGW /c/... → native before
    // reaching here, so we only need separator + case normalization.
    var normalized = toComparable(filePath);
    var configDirCmp = toComparable(configDir);
    if (!normalized.startsWith(configDirCmp)) {
        return null;
    }
    if (normalized.includes('/session-memory/') && normalized.endsWith('.md')) {
        return 'session_memory';
    }
    if (normalized.includes('/projects/') && normalized.endsWith('.jsonl')) {
        return 'session_transcript';
    }
    return null;
}
/**
 * Checks if a glob/pattern string indicates session file access intent.
 * Used for Grep/Glob tools where we check patterns, not actual file paths.
 */
function detectSessionPatternType(pattern) {
    var normalized = pattern.split(path_1.win32.sep).join(path_1.posix.sep);
    if (normalized.includes('session-memory') &&
        (normalized.includes('.md') || normalized.endsWith('*'))) {
        return 'session_memory';
    }
    if (normalized.includes('.jsonl') ||
        (normalized.includes('projects') && normalized.includes('*.jsonl'))) {
        return 'session_transcript';
    }
    return null;
}
/**
 * Check if a file path is within the memdir directory.
 */
function isAutoMemFile(filePath) {
    if ((0, paths_js_1.isAutoMemoryEnabled)()) {
        return (0, paths_js_1.isAutoMemPath)(filePath);
    }
    return false;
}
/**
 * Determine which memory store (if any) a path belongs to.
 *
 * Team dir is a subdirectory of memdir (getTeamMemPath = join(getAutoMemPath, 'team')),
 * so a team path matches both isTeamMemFile and isAutoMemFile. Check team first.
 *
 * Use this for scope-keyed telemetry where a single event name distinguishes
 * by scope field — the existing tengu_memdir_* / tengu_team_mem_* event-name
 * hierarchy handles the overlap differently (team writes intentionally fire both).
 */
function memoryScopeForPath(filePath) {
    if ((0, bun_bundle_1.feature)('TEAMMEM') && teamMemPaths.isTeamMemFile(filePath)) {
        return 'team';
    }
    if (isAutoMemFile(filePath)) {
        return 'personal';
    }
    return null;
}
/**
 * Check if a file path is within an agent memory directory.
 */
function isAgentMemFile(filePath) {
    if ((0, paths_js_1.isAutoMemoryEnabled)()) {
        return (0, agentMemory_js_1.isAgentMemoryPath)(filePath);
    }
    return false;
}
/**
 * Check if a file is a Claude-managed memory file (NOT user-managed instruction files).
 * Includes: auto-memory (memdir), agent memory, session memory/transcripts.
 * Excludes: CLAUDE.md, CLAUDE.local.md, .claude/rules/*.md (user-managed).
 *
 * Use this for collapse/badge logic where user-managed files should show full diffs.
 */
function isAutoManagedMemoryFile(filePath) {
    if (isAutoMemFile(filePath)) {
        return true;
    }
    if ((0, bun_bundle_1.feature)('TEAMMEM') && teamMemPaths.isTeamMemFile(filePath)) {
        return true;
    }
    if (detectSessionFileType(filePath) !== null) {
        return true;
    }
    if (isAgentMemFile(filePath)) {
        return true;
    }
    return false;
}
// Check if a directory path is a memory-related directory.
// Used by Grep/Glob which take a directory `path` rather than a specific file.
// Checks both configDir and memoryBaseDir to handle custom memory dir paths.
function isMemoryDirectory(dirPath) {
    // SECURITY: Normalize to prevent path traversal bypasses via .. segments.
    // On Windows this produces backslashes; toComparable flips them back for
    // string matching. MinGW /c/... paths are converted to native before
    // reaching here (extraction-time in isShellCommandTargetingMemory), so
    // normalize() never sees them.
    var normalizedPath = (0, path_1.normalize)(dirPath);
    var normalizedCmp = toComparable(normalizedPath);
    // Agent memory directories can be under cwd (project scope), configDir, or memoryBaseDir
    if ((0, paths_js_1.isAutoMemoryEnabled)() &&
        (normalizedCmp.includes('/agent-memory/') ||
            normalizedCmp.includes('/agent-memory-local/'))) {
        return true;
    }
    // Team memory directories live under <autoMemPath>/team/
    if ((0, bun_bundle_1.feature)('TEAMMEM') &&
        teamMemPaths.isTeamMemoryEnabled() &&
        teamMemPaths.isTeamMemPath(normalizedPath)) {
        return true;
    }
    // Check the auto-memory path override (CLAUDE_COWORK_MEMORY_PATH_OVERRIDE)
    if ((0, paths_js_1.isAutoMemoryEnabled)()) {
        var autoMemPath = (0, paths_js_1.getAutoMemPath)();
        var autoMemDirCmp = toComparable(autoMemPath.replace(/[/\\]+$/, ''));
        var autoMemPathCmp = toComparable(autoMemPath);
        if (normalizedCmp === autoMemDirCmp ||
            normalizedCmp.startsWith(autoMemPathCmp)) {
            return true;
        }
    }
    var configDirCmp = toComparable((0, envUtils_js_1.getClaudeConfigHomeDir)());
    var memoryBaseCmp = toComparable((0, paths_js_1.getMemoryBaseDir)());
    var underConfig = normalizedCmp.startsWith(configDirCmp);
    var underMemoryBase = normalizedCmp.startsWith(memoryBaseCmp);
    if (!underConfig && !underMemoryBase) {
        return false;
    }
    if (normalizedCmp.includes('/session-memory/')) {
        return true;
    }
    if (underConfig && normalizedCmp.includes('/projects/')) {
        return true;
    }
    if ((0, paths_js_1.isAutoMemoryEnabled)() && normalizedCmp.includes('/memory/')) {
        return true;
    }
    return false;
}
/**
 * Check if a shell command string (Bash or PowerShell) targets memory files
 * by extracting absolute path tokens and checking them against memory
 * detection functions. Used for Bash/PowerShell grep/search commands in the
 * collapse logic.
 */
function isShellCommandTargetingMemory(command) {
    var configDir = (0, envUtils_js_1.getClaudeConfigHomeDir)();
    var memoryBase = (0, paths_js_1.getMemoryBaseDir)();
    var autoMemDir = (0, paths_js_1.isAutoMemoryEnabled)()
        ? (0, paths_js_1.getAutoMemPath)().replace(/[/\\]+$/, '')
        : '';
    // Quick check: does the command mention the config, memory base, or
    // auto-mem directory? Compare in forward-slash form (PowerShell on Windows
    // may use either separator while configDir uses the platform-native one).
    // On Windows also check the MinGW form (/c/...) since BashTool runs under
    // Git Bash which emits that encoding. On Linux/Mac, configDir is already
    // posix so only one form to check — and crucially, windowsPathToPosixPath
    // is NOT called, so Linux paths like /m/foo aren't misinterpreted as MinGW.
    var commandCmp = toComparable(command);
    var dirs = [configDir, memoryBase, autoMemDir].filter(Boolean);
    var matchesAnyDir = dirs.some(function (d) {
        if (commandCmp.includes(toComparable(d)))
            return true;
        if (IS_WINDOWS) {
            // BashTool on Windows (Git Bash) emits /c/Users/... — check MinGW form too
            return commandCmp.includes((0, windowsPaths_js_1.windowsPathToPosixPath)(d).toLowerCase());
        }
        return false;
    });
    if (!matchesAnyDir) {
        return false;
    }
    // Extract absolute path-like tokens. Matches Unix absolute paths (/foo/bar),
    // Windows drive-letter paths (C:\foo, C:/foo), and MinGW paths (/c/foo —
    // they're /-prefixed so the regex already captures them). Bare backslash
    // tokens (\foo) are intentionally excluded — they appear in regex/grep
    // patterns and would cause false-positive memory classification after
    // normalization flips backslashes to forward slashes.
    var matches = command.match(/(?:[A-Za-z]:[/\\]|\/)[^\s'"]+/g);
    if (!matches) {
        return false;
    }
    for (var _i = 0, matches_1 = matches; _i < matches_1.length; _i++) {
        var match = matches_1[_i];
        // Strip trailing shell metacharacters that could be adjacent to a path
        var cleanPath = match.replace(/[,;|&>]+$/, '');
        // On Windows, convert MinGW /c/... → native C:\... at this single
        // point. Downstream predicates (isAutoManagedMemoryFile, isMemoryDirectory,
        // isAutoMemPath, isAgentMemoryPath) then receive native paths and only
        // need toComparable() for matching. On other platforms, paths are already
        // native — no conversion, so /m/foo etc. pass through unmodified.
        var nativePath = IS_WINDOWS
            ? (0, windowsPaths_js_1.posixPathToWindowsPath)(cleanPath)
            : cleanPath;
        if (isAutoManagedMemoryFile(nativePath) || isMemoryDirectory(nativePath)) {
            return true;
        }
    }
    return false;
}
// Check if a glob/pattern targets auto-managed memory files only.
// Excludes CLAUDE.md, CLAUDE.local.md, .claude/rules/ (user-managed).
// Used for collapse badge logic where user-managed files should not be
// counted as "memory" operations.
function isAutoManagedMemoryPattern(pattern) {
    if (detectSessionPatternType(pattern) !== null) {
        return true;
    }
    if ((0, paths_js_1.isAutoMemoryEnabled)() &&
        (pattern.replace(/\\/g, '/').includes('agent-memory/') ||
            pattern.replace(/\\/g, '/').includes('agent-memory-local/'))) {
        return true;
    }
    return false;
}
