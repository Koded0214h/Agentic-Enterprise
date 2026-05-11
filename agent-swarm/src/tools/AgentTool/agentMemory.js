"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAgentMemoryDir = getAgentMemoryDir;
exports.isAgentMemoryPath = isAgentMemoryPath;
exports.getAgentMemoryEntrypoint = getAgentMemoryEntrypoint;
exports.getMemoryScopeDisplay = getMemoryScopeDisplay;
exports.loadAgentMemoryPrompt = loadAgentMemoryPrompt;
var path_1 = require("path");
var state_js_1 = require("../../bootstrap/state.js");
var memdir_js_1 = require("../../memdir/memdir.js");
var paths_js_1 = require("../../memdir/paths.js");
var cwd_js_1 = require("../../utils/cwd.js");
var git_js_1 = require("../../utils/git.js");
var path_js_1 = require("../../utils/path.js");
/**
 * Sanitize an agent type name for use as a directory name.
 * Replaces colons (invalid on Windows, used in plugin-namespaced agent
 * types like "my-plugin:my-agent") with dashes.
 */
function sanitizeAgentTypeForPath(agentType) {
    return agentType.replace(/:/g, '-');
}
/**
 * Returns the local agent memory directory, which is project-specific and not checked into VCS.
 * When CLAUDE_CODE_REMOTE_MEMORY_DIR is set, persists to the mount with project namespacing.
 * Otherwise, uses <cwd>/.claude/agent-memory-local/<agentType>/.
 */
function getLocalAgentMemoryDir(dirName) {
    var _a;
    if (process.env.CLAUDE_CODE_REMOTE_MEMORY_DIR) {
        return ((0, path_1.join)(process.env.CLAUDE_CODE_REMOTE_MEMORY_DIR, 'projects', (0, path_js_1.sanitizePath)((_a = (0, git_js_1.findCanonicalGitRoot)((0, state_js_1.getProjectRoot)())) !== null && _a !== void 0 ? _a : (0, state_js_1.getProjectRoot)()), 'agent-memory-local', dirName) + path_1.sep);
    }
    return (0, path_1.join)((0, cwd_js_1.getCwd)(), '.claude', 'agent-memory-local', dirName) + path_1.sep;
}
/**
 * Returns the agent memory directory for a given agent type and scope.
 * - 'user' scope: <memoryBase>/agent-memory/<agentType>/
 * - 'project' scope: <cwd>/.claude/agent-memory/<agentType>/
 * - 'local' scope: see getLocalAgentMemoryDir()
 */
function getAgentMemoryDir(agentType, scope) {
    var dirName = sanitizeAgentTypeForPath(agentType);
    switch (scope) {
        case 'project':
            return (0, path_1.join)((0, cwd_js_1.getCwd)(), '.claude', 'agent-memory', dirName) + path_1.sep;
        case 'local':
            return getLocalAgentMemoryDir(dirName);
        case 'user':
            return (0, path_1.join)((0, paths_js_1.getMemoryBaseDir)(), 'agent-memory', dirName) + path_1.sep;
    }
}
// Check if file is within an agent memory directory (any scope).
function isAgentMemoryPath(absolutePath) {
    // SECURITY: Normalize to prevent path traversal bypasses via .. segments
    var normalizedPath = (0, path_1.normalize)(absolutePath);
    var memoryBase = (0, paths_js_1.getMemoryBaseDir)();
    // User scope: check memory base (may be custom dir or config home)
    if (normalizedPath.startsWith((0, path_1.join)(memoryBase, 'agent-memory') + path_1.sep)) {
        return true;
    }
    // Project scope: always cwd-based (not redirected)
    if (normalizedPath.startsWith((0, path_1.join)((0, cwd_js_1.getCwd)(), '.claude', 'agent-memory') + path_1.sep)) {
        return true;
    }
    // Local scope: persisted to mount when CLAUDE_CODE_REMOTE_MEMORY_DIR is set, otherwise cwd-based
    if (process.env.CLAUDE_CODE_REMOTE_MEMORY_DIR) {
        if (normalizedPath.includes(path_1.sep + 'agent-memory-local' + path_1.sep) &&
            normalizedPath.startsWith((0, path_1.join)(process.env.CLAUDE_CODE_REMOTE_MEMORY_DIR, 'projects') + path_1.sep)) {
            return true;
        }
    }
    else if (normalizedPath.startsWith((0, path_1.join)((0, cwd_js_1.getCwd)(), '.claude', 'agent-memory-local') + path_1.sep)) {
        return true;
    }
    return false;
}
/**
 * Returns the agent memory file path for a given agent type and scope.
 */
function getAgentMemoryEntrypoint(agentType, scope) {
    return (0, path_1.join)(getAgentMemoryDir(agentType, scope), 'MEMORY.md');
}
function getMemoryScopeDisplay(memory) {
    switch (memory) {
        case 'user':
            return "User (".concat((0, path_1.join)((0, paths_js_1.getMemoryBaseDir)(), 'agent-memory'), "/)");
        case 'project':
            return 'Project (.claude/agent-memory/)';
        case 'local':
            return "Local (".concat(getLocalAgentMemoryDir('...'), ")");
        default:
            return 'None';
    }
}
/**
 * Load persistent memory for an agent with memory enabled.
 * Creates the memory directory if needed and returns a prompt with memory contents.
 *
 * @param agentType The agent's type name (used as directory name)
 * @param scope 'user' for ~/.claude/agent-memory/ or 'project' for .claude/agent-memory/
 */
function loadAgentMemoryPrompt(agentType, scope) {
    var scopeNote;
    switch (scope) {
        case 'user':
            scopeNote =
                '- Since this memory is user-scope, keep learnings general since they apply across all projects';
            break;
        case 'project':
            scopeNote =
                '- Since this memory is project-scope and shared with your team via version control, tailor your memories to this project';
            break;
        case 'local':
            scopeNote =
                '- Since this memory is local-scope (not checked into version control), tailor your memories to this project and machine';
            break;
    }
    var memoryDir = getAgentMemoryDir(agentType, scope);
    // Fire-and-forget: this runs at agent-spawn time inside a sync
    // getSystemPrompt() callback (called from React render in AgentDetail.tsx,
    // so it cannot be async). The spawned agent won't try to Write until after
    // a full API round-trip, by which time mkdir will have completed. Even if
    // it hasn't, FileWriteTool does its own mkdir of the parent directory.
    void (0, memdir_js_1.ensureMemoryDirExists)(memoryDir);
    var coworkExtraGuidelines = process.env.CLAUDE_COWORK_MEMORY_EXTRA_GUIDELINES;
    return (0, memdir_js_1.buildMemoryPrompt)({
        displayName: 'Persistent Agent Memory',
        memoryDir: memoryDir,
        extraGuidelines: coworkExtraGuidelines && coworkExtraGuidelines.trim().length > 0
            ? [scopeNote, coworkExtraGuidelines]
            : [scopeNote],
    });
}
