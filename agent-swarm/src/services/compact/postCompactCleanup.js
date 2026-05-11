"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runPostCompactCleanup = runPostCompactCleanup;
var bun_bundle_1 = require("bun:bundle");
var systemPromptSections_js_1 = require("../../constants/systemPromptSections.js");
var context_js_1 = require("../../context.js");
var bashPermissions_js_1 = require("../../tools/BashTool/bashPermissions.js");
var classifierApprovals_js_1 = require("../../utils/classifierApprovals.js");
var claudemd_js_1 = require("../../utils/claudemd.js");
var sessionStorage_js_1 = require("../../utils/sessionStorage.js");
var betaSessionTracing_js_1 = require("../../utils/telemetry/betaSessionTracing.js");
var microCompact_js_1 = require("./microCompact.js");
/**
 * Run cleanup of caches and tracking state after compaction.
 * Call this after both auto-compact and manual /compact to free memory
 * held by tracking structures that are invalidated by compaction.
 *
 * Note: We intentionally do NOT clear invoked skill content here.
 * Skill content must survive across multiple compactions so that
 * createSkillAttachmentIfNeeded() can include the full skill text
 * in subsequent compaction attachments.
 *
 * querySource: pass the compacting query's source so we can skip
 * resets that would clobber main-thread module-level state. Subagents
 * (agent:*) run in the same process and share module-level state
 * (context-collapse store, getMemoryFiles one-shot hook flag,
 * getUserContext cache); resetting those when a SUBAGENT compacts
 * would corrupt the MAIN thread's state. All compaction callers should
 * pass querySource — undefined is only safe for callers that are
 * genuinely main-thread-only (/compact, /clear).
 */
function runPostCompactCleanup(querySource) {
    var _a, _b;
    // Subagents (agent:*) run in the same process and share module-level
    // state with the main thread. Only reset main-thread module-level state
    // (context-collapse, memory file cache) for main-thread compacts.
    // Same startsWith pattern as isMainThread (index.ts:188).
    var isMainThreadCompact = querySource === undefined ||
        querySource.startsWith('repl_main_thread') ||
        querySource === 'sdk';
    (0, microCompact_js_1.resetMicrocompactState)();
    if ((0, bun_bundle_1.feature)('CONTEXT_COLLAPSE')) {
        if (isMainThreadCompact) {
            /* eslint-disable @typescript-eslint/no-require-imports */
            ;
            require('../contextCollapse/index.js').resetContextCollapse();
            /* eslint-enable @typescript-eslint/no-require-imports */
        }
    }
    if (isMainThreadCompact) {
        // getUserContext is a memoized outer layer wrapping getClaudeMds() →
        // getMemoryFiles(). If only the inner getMemoryFiles cache is cleared,
        // the next turn hits the getUserContext cache and never reaches
        // getMemoryFiles(), so the armed InstructionsLoaded hook never fires.
        // Manual /compact already clears this explicitly at its call sites;
        // auto-compact and reactive-compact did not — this centralizes the
        // clear so all compaction paths behave consistently.
        (_b = (_a = context_js_1.getUserContext.cache).clear) === null || _b === void 0 ? void 0 : _b.call(_a);
        (0, claudemd_js_1.resetGetMemoryFilesCache)('compact');
    }
    (0, systemPromptSections_js_1.clearSystemPromptSections)();
    (0, classifierApprovals_js_1.clearClassifierApprovals)();
    (0, bashPermissions_js_1.clearSpeculativeChecks)();
    // Intentionally NOT calling resetSentSkillNames(): re-injecting the full
    // skill_listing (~4K tokens) post-compact is pure cache_creation. The
    // model still has SkillTool in schema, invoked_skills preserves used
    // skills, and dynamic additions are handled by skillChangeDetector /
    // cacheUtils resets. See compactConversation() for full rationale.
    (0, betaSessionTracing_js_1.clearBetaTracingState)();
    if ((0, bun_bundle_1.feature)('COMMIT_ATTRIBUTION')) {
        void Promise.resolve().then(function () { return require('../../utils/attributionHooks.js'); }).then(function (m) {
            return m.sweepFileContentCache();
        });
    }
    (0, sessionStorage_js_1.clearSessionMessagesCache)();
}
