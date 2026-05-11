"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearSessionCaches = clearSessionCaches;
/**
 * Session cache clearing utilities.
 * This module is imported at startup by main.tsx, so keep imports minimal.
 */
var bun_bundle_1 = require("bun:bundle");
var state_js_1 = require("../../bootstrap/state.js");
var commands_js_1 = require("../../commands.js");
var common_js_1 = require("../../constants/common.js");
var context_js_1 = require("../../context.js");
var fileSuggestions_js_1 = require("../../hooks/fileSuggestions.js");
var useSwarmPermissionPoller_js_1 = require("../../hooks/useSwarmPermissionPoller.js");
var dumpPrompts_js_1 = require("../../services/api/dumpPrompts.js");
var promptCacheBreakDetection_js_1 = require("../../services/api/promptCacheBreakDetection.js");
var sessionIngress_js_1 = require("../../services/api/sessionIngress.js");
var postCompactCleanup_js_1 = require("../../services/compact/postCompactCleanup.js");
var LSPDiagnosticRegistry_js_1 = require("../../services/lsp/LSPDiagnosticRegistry.js");
var magicDocs_js_1 = require("../../services/MagicDocs/magicDocs.js");
var loadSkillsDir_js_1 = require("../../skills/loadSkillsDir.js");
var attachments_js_1 = require("../../utils/attachments.js");
var commands_js_2 = require("../../utils/bash/commands.js");
var claudemd_js_1 = require("../../utils/claudemd.js");
var detectRepository_js_1 = require("../../utils/detectRepository.js");
var gitFilesystem_js_1 = require("../../utils/git/gitFilesystem.js");
var imageStore_js_1 = require("../../utils/imageStore.js");
var sessionEnvVars_js_1 = require("../../utils/sessionEnvVars.js");
/**
 * Clear all session-related caches.
 * Call this when resuming a session to ensure fresh file/skill discovery.
 * This is a subset of what clearConversation does - it only clears caches
 * without affecting messages, session ID, or triggering hooks.
 *
 * @param preservedAgentIds - Agent IDs whose per-agent state should survive
 *   the clear (e.g., background tasks preserved across /clear). When non-empty,
 *   agentId-keyed state (invoked skills) is selectively cleared and requestId-keyed
 *   state (pending permission callbacks, dump state, cache-break tracking) is left
 *   intact since it cannot be safely scoped to the main session.
 */
function clearSessionCaches(preservedAgentIds) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (preservedAgentIds === void 0) { preservedAgentIds = new Set(); }
    var hasPreserved = preservedAgentIds.size > 0;
    // Clear context caches
    (_b = (_a = context_js_1.getUserContext.cache).clear) === null || _b === void 0 ? void 0 : _b.call(_a);
    (_d = (_c = context_js_1.getSystemContext.cache).clear) === null || _d === void 0 ? void 0 : _d.call(_c);
    (_f = (_e = context_js_1.getGitStatus.cache).clear) === null || _f === void 0 ? void 0 : _f.call(_e);
    (_h = (_g = common_js_1.getSessionStartDate.cache).clear) === null || _h === void 0 ? void 0 : _h.call(_g);
    // Clear file suggestion caches (for @ mentions)
    (0, fileSuggestions_js_1.clearFileSuggestionCaches)();
    // Clear commands/skills cache
    (0, commands_js_1.clearCommandsCache)();
    // Clear prompt cache break detection state
    if (!hasPreserved)
        (0, promptCacheBreakDetection_js_1.resetPromptCacheBreakDetection)();
    // Clear system prompt injection (cache breaker)
    (0, context_js_1.setSystemPromptInjection)(null);
    // Clear last emitted date so it's re-detected on next turn
    (0, state_js_1.setLastEmittedDate)(null);
    // Run post-compaction cleanup (clears system prompt sections, microcompact tracking,
    // classifier approvals, speculative checks, and — for main-thread compacts — memory
    // files cache with load_reason 'compact').
    (0, postCompactCleanup_js_1.runPostCompactCleanup)();
    // Reset sent skill names so the skill listing is re-sent after /clear.
    // runPostCompactCleanup intentionally does NOT reset this (post-compact
    // re-injection costs ~4K tokens), but /clear wipes messages entirely so
    // the model needs the full listing again.
    (0, attachments_js_1.resetSentSkillNames)();
    // Override the memory cache reset with 'session_start': clearSessionCaches is called
    // from /clear and --resume/--continue, which are NOT compaction events. Without this,
    // the InstructionsLoaded hook would fire with load_reason 'compact' instead of
    // 'session_start' on the next getMemoryFiles() call.
    (0, claudemd_js_1.resetGetMemoryFilesCache)('session_start');
    // Clear stored image paths cache
    (0, imageStore_js_1.clearStoredImagePaths)();
    // Clear all session ingress caches (lastUuidMap, sequentialAppendBySession)
    (0, sessionIngress_js_1.clearAllSessions)();
    // Clear swarm permission pending callbacks
    if (!hasPreserved)
        (0, useSwarmPermissionPoller_js_1.clearAllPendingCallbacks)();
    // Clear tungsten session usage tracking
    if (process.env.USER_TYPE === 'ant') {
        void Promise.resolve().then(function () { return require('../../tools/TungstenTool/TungstenTool.js'); }).then(function (_a) {
            var clearSessionsWithTungstenUsage = _a.clearSessionsWithTungstenUsage, resetInitializationState = _a.resetInitializationState;
            clearSessionsWithTungstenUsage();
            resetInitializationState();
        });
    }
    // Clear attribution caches (file content cache, pending bash states)
    // Dynamic import to preserve dead code elimination for COMMIT_ATTRIBUTION feature flag
    if ((0, bun_bundle_1.feature)('COMMIT_ATTRIBUTION')) {
        void Promise.resolve().then(function () { return require('../../utils/attributionHooks.js'); }).then(function (_a) {
            var clearAttributionCaches = _a.clearAttributionCaches;
            return clearAttributionCaches();
        });
    }
    // Clear repository detection caches
    (0, detectRepository_js_1.clearRepositoryCaches)();
    // Clear bash command prefix caches (Haiku-extracted prefixes)
    (0, commands_js_2.clearCommandPrefixCaches)();
    // Clear dump prompts state
    if (!hasPreserved)
        (0, dumpPrompts_js_1.clearAllDumpState)();
    // Clear invoked skills cache (each entry holds full skill file content)
    (0, state_js_1.clearInvokedSkills)(preservedAgentIds);
    // Clear git dir resolution cache
    (0, gitFilesystem_js_1.clearResolveGitDirCache)();
    // Clear dynamic skills (loaded from skill directories)
    (0, loadSkillsDir_js_1.clearDynamicSkills)();
    // Clear LSP diagnostic tracking state
    (0, LSPDiagnosticRegistry_js_1.resetAllLSPDiagnosticState)();
    // Clear tracked magic docs
    (0, magicDocs_js_1.clearTrackedMagicDocs)();
    // Clear session environment variables
    (0, sessionEnvVars_js_1.clearSessionEnvVars)();
    // Clear WebFetch URL cache (up to 50MB of cached page content)
    void Promise.resolve().then(function () { return require('../../tools/WebFetchTool/utils.js'); }).then(function (_a) {
        var clearWebFetchCache = _a.clearWebFetchCache;
        return clearWebFetchCache();
    });
    // Clear ToolSearch description cache (full tool prompts, ~500KB for 50 MCP tools)
    void Promise.resolve().then(function () { return require('../../tools/ToolSearchTool/ToolSearchTool.js'); }).then(function (_a) {
        var clearToolSearchDescriptionCache = _a.clearToolSearchDescriptionCache;
        return clearToolSearchDescriptionCache();
    });
    // Clear agent definitions cache (accumulates per-cwd via EnterWorktreeTool)
    void Promise.resolve().then(function () { return require('../../tools/AgentTool/loadAgentsDir.js'); }).then(function (_a) {
        var clearAgentDefinitionsCache = _a.clearAgentDefinitionsCache;
        return clearAgentDefinitionsCache();
    });
    // Clear SkillTool prompt cache (accumulates per project root)
    void Promise.resolve().then(function () { return require('../../tools/SkillTool/prompt.js'); }).then(function (_a) {
        var clearPromptCache = _a.clearPromptCache;
        return clearPromptCache();
    });
}
