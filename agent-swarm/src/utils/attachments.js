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
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
    function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
    function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
exports.VERIFY_PLAN_REMINDER_CONFIG = exports.RELEVANT_MEMORIES_CONFIG = exports.AUTO_MODE_ATTACHMENT_CONFIG = exports.PLAN_MODE_ATTACHMENT_CONFIG = exports.TODO_REMINDER_CONFIG = void 0;
exports.getAttachments = getAttachments;
exports.getQueuedCommandAttachments = getQueuedCommandAttachments;
exports.getAgentPendingMessageAttachments = getAgentPendingMessageAttachments;
exports.getDateChangeAttachments = getDateChangeAttachments;
exports.getDeferredToolsDeltaAttachment = getDeferredToolsDeltaAttachment;
exports.getAgentListingDeltaAttachment = getAgentListingDeltaAttachment;
exports.getMcpInstructionsDeltaAttachment = getMcpInstructionsDeltaAttachment;
exports.getDirectoriesToProcess = getDirectoriesToProcess;
exports.memoryFilesToAttachments = memoryFilesToAttachments;
exports.getChangedFiles = getChangedFiles;
exports.collectSurfacedMemories = collectSurfacedMemories;
exports.readMemoriesForSurfacing = readMemoriesForSurfacing;
exports.memoryHeader = memoryHeader;
exports.startRelevantMemoryPrefetch = startRelevantMemoryPrefetch;
exports.collectRecentSuccessfulTools = collectRecentSuccessfulTools;
exports.filterDuplicateMemoryAttachments = filterDuplicateMemoryAttachments;
exports.resetSentSkillNames = resetSentSkillNames;
exports.suppressNextSkillListing = suppressNextSkillListing;
exports.filterToBundledAndMcp = filterToBundledAndMcp;
exports.extractAtMentionedFiles = extractAtMentionedFiles;
exports.extractMcpResourceMentions = extractMcpResourceMentions;
exports.extractAgentMentions = extractAgentMentions;
exports.parseAtMentionedFileLines = parseAtMentionedFileLines;
exports.getAttachmentMessages = getAttachmentMessages;
exports.tryGetPDFReference = tryGetPDFReference;
exports.generateFileAttachment = generateFileAttachment;
exports.createAttachmentMessage = createAttachmentMessage;
exports.getVerifyPlanReminderTurnCount = getVerifyPlanReminderTurnCount;
exports.getCompactionReminderAttachment = getCompactionReminderAttachment;
exports.getContextEfficiencyAttachment = getContextEfficiencyAttachment;
// biome-ignore-all assist/source/organizeImports: ANT-ONLY import markers must not be reordered
var index_js_1 = require("src/services/analytics/index.js");
var Tool_js_1 = require("../Tool.js");
var FileReadTool_js_1 = require("../tools/FileReadTool/FileReadTool.js");
var readFileInRange_js_1 = require("./readFileInRange.js");
var path_js_1 = require("./path.js");
var stringUtils_js_1 = require("./stringUtils.js");
var array_js_1 = require("./array.js");
var fsOperations_js_1 = require("./fsOperations.js");
var promises_1 = require("fs/promises");
var constants_js_1 = require("../tools/TodoWriteTool/constants.js");
var constants_js_2 = require("../tools/TaskCreateTool/constants.js");
var constants_js_3 = require("../tools/TaskUpdateTool/constants.js");
var toolName_js_1 = require("../tools/BashTool/toolName.js");
var constants_js_4 = require("../tools/SkillTool/constants.js");
var tasks_js_1 = require("./tasks.js");
var plans_js_1 = require("./plans.js");
var ide_js_1 = require("./ide.js");
var claudemd_js_1 = require("./claudemd.js");
var path_1 = require("path");
var cwd_js_1 = require("src/utils/cwd.js");
var selectors_js_1 = require("../state/selectors.js");
var log_js_1 = require("./log.js");
var debug_js_1 = require("./debug.js");
var errors_js_1 = require("./errors.js");
var diagnosticTracking_js_1 = require("../services/diagnosticTracking.js");
var textInputTypes_js_1 = require("src/types/textInputTypes.js");
var crypto_1 = require("crypto");
var settings_js_1 = require("./settings/settings.js");
var utils_js_1 = require("src/tools/FileEditTool/utils.js");
var imageResizer_js_1 = require("./imageResizer.js");
var commands_js_1 = require("../commands.js");
var uniqBy_js_1 = require("lodash-es/uniqBy.js");
var state_js_1 = require("../bootstrap/state.js");
var prompt_js_1 = require("../tools/SkillTool/prompt.js");
var context_js_1 = require("./context.js");
// Conditional require for DCE. All skill-search string literals that would
// otherwise leak into external builds live inside these modules. The only
// surfaces in THIS file are: the maybe() call (gated via spread below) and
// the skill_listing suppression check (uses the same skillSearchModules null
// check). The type-only DiscoverySignal import above is erased at compile time.
/* eslint-disable @typescript-eslint/no-require-imports */
var skillSearchModules = (0, bun_bundle_1.feature)('EXPERIMENTAL_SKILL_SEARCH')
    ? {
        featureCheck: require('../services/skillSearch/featureCheck.js'),
        prefetch: require('../services/skillSearch/prefetch.js'),
    }
    : null;
var autoModeStateModule = (0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER')
    ? require('./permissions/autoModeState.js')
    : null;
/* eslint-enable @typescript-eslint/no-require-imports */
var prompt_js_2 = require("src/tools/FileReadTool/prompt.js");
var limits_js_1 = require("src/tools/FileReadTool/limits.js");
var fileStateCache_js_1 = require("./fileStateCache.js");
var abortController_js_1 = require("./abortController.js");
var errors_js_2 = require("./errors.js");
var file_js_1 = require("./file.js");
var loadAgentsDir_js_1 = require("../tools/AgentTool/loadAgentsDir.js");
var constants_js_5 = require("../tools/AgentTool/constants.js");
var prompt_js_3 = require("../tools/AgentTool/prompt.js");
var permissions_js_1 = require("./permissions/permissions.js");
var auth_js_1 = require("./auth.js");
var mcpStringUtils_js_1 = require("../services/mcp/mcpStringUtils.js");
var filesystem_js_1 = require("./permissions/filesystem.js");
var framework_js_1 = require("./task/framework.js");
var diskOutput_js_1 = require("./task/diskOutput.js");
var LocalAgentTask_js_1 = require("../tasks/LocalAgentTask/LocalAgentTask.js");
var state_js_2 = require("../bootstrap/state.js");
var toolSearch_js_1 = require("./toolSearch.js");
var mcpInstructionsDelta_js_1 = require("./mcpInstructionsDelta.js");
var common_js_1 = require("./claudeInChrome/common.js");
var prompt_js_4 = require("./claudeInChrome/prompt.js");
var AsyncHookRegistry_js_1 = require("./hooks/AsyncHookRegistry.js");
var LSPDiagnosticRegistry_js_1 = require("../services/lsp/LSPDiagnosticRegistry.js");
var debug_js_2 = require("./debug.js");
var messages_js_1 = require("./messages.js");
var messagePredicates_js_1 = require("./messagePredicates.js");
var envUtils_js_1 = require("./envUtils.js");
var bun_bundle_1 = require("bun:bundle");
/* eslint-disable @typescript-eslint/no-require-imports */
var BRIEF_TOOL_NAME = (0, bun_bundle_1.feature)('KAIROS') || (0, bun_bundle_1.feature)('KAIROS_BRIEF')
    ? require('../tools/BriefTool/prompt.js').BRIEF_TOOL_NAME
    : null;
var sessionTranscriptModule = (0, bun_bundle_1.feature)('KAIROS')
    ? require('../services/sessionTranscript/sessionTranscript.js')
    : null;
/* eslint-enable @typescript-eslint/no-require-imports */
var thinking_js_1 = require("./thinking.js");
var tokens_js_1 = require("./tokens.js");
var autoCompact_js_1 = require("../services/compact/autoCompact.js");
var growthbook_js_1 = require("../services/analytics/growthbook.js");
var hooks_js_1 = require("./hooks.js");
var slowOperations_js_1 = require("./slowOperations.js");
var pdfUtils_js_1 = require("./pdfUtils.js");
var common_js_2 = require("../constants/common.js");
var pdf_js_1 = require("./pdf.js");
var apiLimits_js_1 = require("../constants/apiLimits.js");
var agentSwarmsEnabled_js_1 = require("./agentSwarmsEnabled.js");
var findRelevantMemories_js_1 = require("../memdir/findRelevantMemories.js");
var memoryAge_js_1 = require("../memdir/memoryAge.js");
var paths_js_1 = require("../memdir/paths.js");
var agentMemory_js_1 = require("../tools/AgentTool/agentMemory.js");
var teammateMailbox_js_1 = require("./teammateMailbox.js");
var teammate_js_1 = require("./teammate.js");
var teammateContext_js_1 = require("./teammateContext.js");
var teamHelpers_js_1 = require("./swarm/teamHelpers.js");
var tasks_js_2 = require("./tasks.js");
var prompt_js_5 = require("../buddy/prompt.js");
exports.TODO_REMINDER_CONFIG = {
    TURNS_SINCE_WRITE: 10,
    TURNS_BETWEEN_REMINDERS: 10,
};
exports.PLAN_MODE_ATTACHMENT_CONFIG = {
    TURNS_BETWEEN_ATTACHMENTS: 5,
    FULL_REMINDER_EVERY_N_ATTACHMENTS: 5,
};
exports.AUTO_MODE_ATTACHMENT_CONFIG = {
    TURNS_BETWEEN_ATTACHMENTS: 5,
    FULL_REMINDER_EVERY_N_ATTACHMENTS: 5,
};
var MAX_MEMORY_LINES = 200;
// Line cap alone doesn't bound size (200 × 500-char lines = 100KB).  The
// surfacer injects up to 5 files per turn via <system-reminder>, bypassing
// the per-message tool-result budget, so a tight per-file byte cap keeps
// aggregate injection bounded (5 × 4KB = 20KB/turn).  Enforced via
// readFileInRange's truncateOnByteLimit option.  Truncation means the
// most-relevant memory still surfaces: the frontmatter + opening context
// is usually what matters.
var MAX_MEMORY_BYTES = 4096;
exports.RELEVANT_MEMORIES_CONFIG = {
    // Per-turn cap (5 × 4KB = 20KB) bounds a single injection, but over a
    // long session the selector keeps surfacing distinct files — ~26K tokens/
    // session observed in prod.  Cap the cumulative bytes: once hit, stop
    // prefetching entirely.  Budget is ~3 full injections; after that the
    // most-relevant memories are already in context.  Scanning messages
    // (rather than tracking in toolUseContext) means compact naturally
    // resets the counter — old attachments are gone from context, so
    // re-surfacing is valid.
    MAX_SESSION_BYTES: 60 * 1024,
};
exports.VERIFY_PLAN_REMINDER_CONFIG = {
    TURNS_BETWEEN_REMINDERS: 10,
};
/**
 * This is janky
 * TODO: Generate attachments when we create messages
 */
function getAttachments(input, toolUseContext, ideSelection, queuedCommands, messages, querySource, options) {
    return __awaiter(this, void 0, void 0, function () {
        var abortController, timeoutId, context, isMainThread, userInputAttachments, userAttachmentResults, allThreadAttachments, mainThreadAttachments, _a, threadAttachmentResults, mainThreadAttachmentResults;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_DISABLE_ATTACHMENTS) ||
                        (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_SIMPLE)) {
                        // query.ts:removeFromQueue dequeues these unconditionally after
                        // getAttachmentMessages runs — returning [] here silently drops them.
                        // Coworker runs with --bare and depends on task-notification for
                        // mid-tool-call notifications from Local*Task/Remote*Task.
                        return [2 /*return*/, getQueuedCommandAttachments(queuedCommands)];
                    }
                    abortController = (0, abortController_js_1.createAbortController)();
                    timeoutId = setTimeout(function (ac) { return ac.abort(); }, 1000, abortController);
                    context = __assign(__assign({}, toolUseContext), { abortController: abortController });
                    isMainThread = !toolUseContext.agentId;
                    userInputAttachments = input
                        ? __spreadArray([
                            maybe('at_mentioned_files', function () {
                                return processAtMentionedFiles(input, context);
                            }),
                            maybe('mcp_resources', function () {
                                return processMcpResourceAttachments(input, context);
                            }),
                            maybe('agent_mentions', function () {
                                return Promise.resolve(processAgentMentions(input, toolUseContext.options.agentDefinitions.activeAgents));
                            })
                        ], ((0, bun_bundle_1.feature)('EXPERIMENTAL_SKILL_SEARCH') &&
                            skillSearchModules &&
                            !(options === null || options === void 0 ? void 0 : options.skipSkillDiscovery)
                            ? [
                                maybe('skill_discovery', function () {
                                    return skillSearchModules.prefetch.getTurnZeroSkillDiscovery(input, messages !== null && messages !== void 0 ? messages : [], context);
                                }),
                            ]
                            : []), true) : [];
                    return [4 /*yield*/, Promise.all(userInputAttachments)
                        // Thread-safe attachments available in sub-agents
                        // NOTE: These must be created AFTER userInputAttachments completes to ensure
                        // nestedMemoryAttachmentTriggers is populated before getNestedMemoryAttachments runs
                    ];
                case 1:
                    userAttachmentResults = _b.sent();
                    allThreadAttachments = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([
                        // queuedCommands is already agent-scoped by the drain gate in query.ts —
                        // main thread gets agentId===undefined, subagents get their own agentId.
                        // Must run for all threads or subagent notifications drain into the void
                        // (removed from queue by removeFromQueue but never attached).
                        maybe('queued_commands', function () { return getQueuedCommandAttachments(queuedCommands); }),
                        maybe('date_change', function () {
                            return Promise.resolve(getDateChangeAttachments(messages));
                        }),
                        maybe('ultrathink_effort', function () {
                            return Promise.resolve(getUltrathinkEffortAttachment(input));
                        }),
                        maybe('deferred_tools_delta', function () {
                            return Promise.resolve(getDeferredToolsDeltaAttachment(toolUseContext.options.tools, toolUseContext.options.mainLoopModel, messages, {
                                callSite: isMainThread
                                    ? 'attachments_main'
                                    : 'attachments_subagent',
                                querySource: querySource,
                            }));
                        }),
                        maybe('agent_listing_delta', function () {
                            return Promise.resolve(getAgentListingDeltaAttachment(toolUseContext, messages));
                        }),
                        maybe('mcp_instructions_delta', function () {
                            return Promise.resolve(getMcpInstructionsDeltaAttachment(toolUseContext.options.mcpClients, toolUseContext.options.tools, toolUseContext.options.mainLoopModel, messages));
                        })
                    ], ((0, bun_bundle_1.feature)('BUDDY')
                        ? [
                            maybe('companion_intro', function () {
                                return Promise.resolve((0, prompt_js_5.getCompanionIntroAttachment)(messages));
                            }),
                        ]
                        : []), true), [
                        maybe('changed_files', function () { return getChangedFiles(context); }),
                        maybe('nested_memory', function () { return getNestedMemoryAttachments(context); }),
                        // relevant_memories moved to async prefetch (startRelevantMemoryPrefetch)
                        maybe('dynamic_skill', function () { return getDynamicSkillAttachments(context); }),
                        maybe('skill_listing', function () { return getSkillListingAttachments(context); }),
                        // Inter-turn skill discovery now runs via startSkillDiscoveryPrefetch
                        // (query.ts, concurrent with the main turn). The blocking call that
                        // previously lived here was the assistant_turn signal — 97% of those
                        // Haiku calls found nothing in prod. Prefetch + await-at-collection
                        // replaces it; see src/services/skillSearch/prefetch.ts.
                        maybe('plan_mode', function () { return getPlanModeAttachments(messages, toolUseContext); }),
                        maybe('plan_mode_exit', function () { return getPlanModeExitAttachment(toolUseContext); })
                    ], false), ((0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER')
                        ? [
                            maybe('auto_mode', function () {
                                return getAutoModeAttachments(messages, toolUseContext);
                            }),
                            maybe('auto_mode_exit', function () {
                                return getAutoModeExitAttachment(toolUseContext);
                            }),
                        ]
                        : []), true), [
                        maybe('todo_reminders', function () {
                            return (0, tasks_js_1.isTodoV2Enabled)()
                                ? getTaskReminderAttachments(messages, toolUseContext)
                                : getTodoReminderAttachments(messages, toolUseContext);
                        })
                    ], false), ((0, agentSwarmsEnabled_js_1.isAgentSwarmsEnabled)()
                        ? __spreadArray(__spreadArray([], (querySource === 'session_memory'
                            ? []
                            : [
                                maybe('teammate_mailbox', function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                    return [2 /*return*/, getTeammateMailboxAttachments(toolUseContext)];
                                }); }); }),
                            ]), true), [
                            maybe('team_context', function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                return [2 /*return*/, getTeamContextAttachment(messages !== null && messages !== void 0 ? messages : [])];
                            }); }); }),
                        ], false) : []), true), [
                        maybe('agent_pending_messages', function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, getAgentPendingMessageAttachments(toolUseContext)];
                        }); }); }),
                        maybe('critical_system_reminder', function () {
                            return Promise.resolve(getCriticalSystemReminderAttachment(toolUseContext));
                        })
                    ], false), ((0, bun_bundle_1.feature)('COMPACTION_REMINDERS')
                        ? [
                            maybe('compaction_reminder', function () {
                                return Promise.resolve(getCompactionReminderAttachment(messages !== null && messages !== void 0 ? messages : [], toolUseContext.options.mainLoopModel));
                            }),
                        ]
                        : []), true), ((0, bun_bundle_1.feature)('HISTORY_SNIP')
                        ? [
                            maybe('context_efficiency', function () {
                                return Promise.resolve(getContextEfficiencyAttachment(messages !== null && messages !== void 0 ? messages : []));
                            }),
                        ]
                        : []), true);
                    mainThreadAttachments = isMainThread
                        ? [
                            maybe('ide_selection', function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                return [2 /*return*/, getSelectedLinesFromIDE(ideSelection, toolUseContext)];
                            }); }); }),
                            maybe('ide_opened_file', function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                return [2 /*return*/, getOpenedFileFromIDE(ideSelection, toolUseContext)];
                            }); }); }),
                            maybe('output_style', function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                return [2 /*return*/, Promise.resolve(getOutputStyleAttachment())];
                            }); }); }),
                            maybe('diagnostics', function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                return [2 /*return*/, getDiagnosticAttachments(toolUseContext)];
                            }); }); }),
                            maybe('lsp_diagnostics', function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                return [2 /*return*/, getLSPDiagnosticAttachments(toolUseContext)];
                            }); }); }),
                            maybe('unified_tasks', function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                return [2 /*return*/, getUnifiedTaskAttachments(toolUseContext)];
                            }); }); }),
                            maybe('async_hook_responses', function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                return [2 /*return*/, getAsyncHookResponseAttachments()];
                            }); }); }),
                            maybe('token_usage', function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2 /*return*/, Promise.resolve(getTokenUsageAttachment(messages !== null && messages !== void 0 ? messages : [], toolUseContext.options.mainLoopModel))];
                                });
                            }); }),
                            maybe('budget_usd', function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2 /*return*/, Promise.resolve(getMaxBudgetUsdAttachment(toolUseContext.options.maxBudgetUsd))];
                                });
                            }); }),
                            maybe('output_token_usage', function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                return [2 /*return*/, Promise.resolve(getOutputTokenUsageAttachment())];
                            }); }); }),
                            maybe('verify_plan_reminder', function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                return [2 /*return*/, getVerifyPlanReminderAttachment(messages, toolUseContext)];
                            }); }); }),
                        ]
                        : [];
                    return [4 /*yield*/, Promise.all([
                            Promise.all(allThreadAttachments),
                            Promise.all(mainThreadAttachments),
                        ])];
                case 2:
                    _a = _b.sent(), threadAttachmentResults = _a[0], mainThreadAttachmentResults = _a[1];
                    clearTimeout(timeoutId);
                    // Defensive: a getter leaking [undefined] crashes .map(a => a.type) below.
                    return [2 /*return*/, __spreadArray(__spreadArray(__spreadArray([], userAttachmentResults.flat(), true), threadAttachmentResults.flat(), true), mainThreadAttachmentResults.flat(), true).filter(function (a) { return a !== undefined && a !== null; })];
            }
        });
    });
}
function maybe(label, f) {
    return __awaiter(this, void 0, void 0, function () {
        var startTime, result, duration, attachmentSizeBytes, e_1, duration;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    startTime = Date.now();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, f()];
                case 2:
                    result = _a.sent();
                    duration = Date.now() - startTime;
                    // Log only 5% of events to reduce volume
                    if (Math.random() < 0.05) {
                        attachmentSizeBytes = result
                            .filter(function (a) { return a !== undefined && a !== null; })
                            .reduce(function (total, attachment) {
                            return total + (0, slowOperations_js_1.jsonStringify)(attachment).length;
                        }, 0);
                        (0, index_js_1.logEvent)('tengu_attachment_compute_duration', {
                            label: label,
                            duration_ms: duration,
                            attachment_size_bytes: attachmentSizeBytes,
                            attachment_count: result.length,
                        });
                    }
                    return [2 /*return*/, result];
                case 3:
                    e_1 = _a.sent();
                    duration = Date.now() - startTime;
                    // Log only 5% of events to reduce volume
                    if (Math.random() < 0.05) {
                        (0, index_js_1.logEvent)('tengu_attachment_compute_duration', {
                            label: label,
                            duration_ms: duration,
                            error: true,
                        });
                    }
                    (0, log_js_1.logError)(e_1);
                    // For Ant users, log the full error to help with debugging
                    (0, debug_js_1.logAntError)("Attachment error in ".concat(label), e_1);
                    return [2 /*return*/, []];
                case 4: return [2 /*return*/];
            }
        });
    });
}
var INLINE_NOTIFICATION_MODES = new Set(['prompt', 'task-notification']);
function getQueuedCommandAttachments(queuedCommands) {
    return __awaiter(this, void 0, void 0, function () {
        var filtered;
        var _this = this;
        return __generator(this, function (_a) {
            if (!queuedCommands) {
                return [2 /*return*/, []];
            }
            filtered = queuedCommands.filter(function (_) {
                return INLINE_NOTIFICATION_MODES.has(_.mode);
            });
            return [2 /*return*/, Promise.all(filtered.map(function (_) { return __awaiter(_this, void 0, void 0, function () {
                    var imageBlocks, prompt, textValue;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, buildImageContentBlocks(_.pastedContents)];
                            case 1:
                                imageBlocks = _a.sent();
                                prompt = _.value;
                                if (imageBlocks.length > 0) {
                                    textValue = typeof _.value === 'string'
                                        ? _.value
                                        : (0, messages_js_1.extractTextContent)(_.value, '\n');
                                    prompt = __spreadArray([{ type: 'text', text: textValue }], imageBlocks, true);
                                }
                                return [2 /*return*/, {
                                        type: 'queued_command',
                                        prompt: prompt,
                                        source_uuid: _.uuid,
                                        imagePasteIds: (0, textInputTypes_js_1.getImagePasteIds)(_.pastedContents),
                                        commandMode: _.mode,
                                        origin: _.origin,
                                        isMeta: _.isMeta,
                                    }];
                        }
                    });
                }); }))];
        });
    });
}
function getAgentPendingMessageAttachments(toolUseContext) {
    var _a;
    var agentId = toolUseContext.agentId;
    if (!agentId)
        return [];
    var drained = (0, LocalAgentTask_js_1.drainPendingMessages)(agentId, toolUseContext.getAppState, (_a = toolUseContext.setAppStateForTasks) !== null && _a !== void 0 ? _a : toolUseContext.setAppState);
    return drained.map(function (msg) { return ({
        type: 'queued_command',
        prompt: msg,
        origin: { kind: 'coordinator' },
        isMeta: true,
    }); });
}
function buildImageContentBlocks(pastedContents) {
    return __awaiter(this, void 0, void 0, function () {
        var imageContents, results;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!pastedContents) {
                        return [2 /*return*/, []];
                    }
                    imageContents = Object.values(pastedContents).filter(textInputTypes_js_1.isValidImagePaste);
                    if (imageContents.length === 0) {
                        return [2 /*return*/, []];
                    }
                    return [4 /*yield*/, Promise.all(imageContents.map(function (img) { return __awaiter(_this, void 0, void 0, function () {
                            var imageBlock, resized;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        imageBlock = {
                                            type: 'image',
                                            source: {
                                                type: 'base64',
                                                media_type: (img.mediaType ||
                                                    'image/png'),
                                                data: img.content,
                                            },
                                        };
                                        return [4 /*yield*/, (0, imageResizer_js_1.maybeResizeAndDownsampleImageBlock)(imageBlock)];
                                    case 1:
                                        resized = _a.sent();
                                        return [2 /*return*/, resized.block];
                                }
                            });
                        }); }))];
                case 1:
                    results = _a.sent();
                    return [2 /*return*/, results];
            }
        });
    });
}
function getPlanModeAttachmentTurnCount(messages) {
    var turnsSinceLastAttachment = 0;
    var foundPlanModeAttachment = false;
    // Iterate backwards to find most recent plan_mode attachment.
    // Count HUMAN turns (non-meta, non-tool-result user messages), not assistant
    // messages — the tool loop in query.ts calls getAttachmentMessages on every
    // tool round, so counting assistant messages would fire the reminder every
    // 5 tool calls instead of every 5 human turns.
    for (var i = messages.length - 1; i >= 0; i--) {
        var message = messages[i];
        if ((message === null || message === void 0 ? void 0 : message.type) === 'user' &&
            !message.isMeta &&
            !hasToolResultContent(message.message.content)) {
            turnsSinceLastAttachment++;
        }
        else if ((message === null || message === void 0 ? void 0 : message.type) === 'attachment' &&
            (message.attachment.type === 'plan_mode' ||
                message.attachment.type === 'plan_mode_reentry')) {
            foundPlanModeAttachment = true;
            break;
        }
    }
    return { turnCount: turnsSinceLastAttachment, foundPlanModeAttachment: foundPlanModeAttachment };
}
/**
 * Count plan_mode attachments since the last plan_mode_exit (or from start if no exit).
 * This ensures the full/sparse cycle resets when re-entering plan mode.
 */
function countPlanModeAttachmentsSinceLastExit(messages) {
    var count = 0;
    // Iterate backwards - if we hit a plan_mode_exit, stop counting
    for (var i = messages.length - 1; i >= 0; i--) {
        var message = messages[i];
        if ((message === null || message === void 0 ? void 0 : message.type) === 'attachment') {
            if (message.attachment.type === 'plan_mode_exit') {
                break; // Stop counting at the last exit
            }
            if (message.attachment.type === 'plan_mode') {
                count++;
            }
        }
    }
    return count;
}
function getPlanModeAttachments(messages, toolUseContext) {
    return __awaiter(this, void 0, void 0, function () {
        var appState, permissionContext, _a, turnCount, foundPlanModeAttachment, planFilePath, existingPlan, attachments, attachmentCount, reminderType;
        return __generator(this, function (_b) {
            appState = toolUseContext.getAppState();
            permissionContext = appState.toolPermissionContext;
            if (permissionContext.mode !== 'plan') {
                return [2 /*return*/, []];
            }
            // Check if we should attach based on turn count (except for first turn)
            if (messages && messages.length > 0) {
                _a = getPlanModeAttachmentTurnCount(messages), turnCount = _a.turnCount, foundPlanModeAttachment = _a.foundPlanModeAttachment;
                // Only throttle if we've already sent a plan_mode attachment before
                // On first turn in plan mode, always attach
                if (foundPlanModeAttachment &&
                    turnCount < exports.PLAN_MODE_ATTACHMENT_CONFIG.TURNS_BETWEEN_ATTACHMENTS) {
                    return [2 /*return*/, []];
                }
            }
            planFilePath = (0, plans_js_1.getPlanFilePath)(toolUseContext.agentId);
            existingPlan = (0, plans_js_1.getPlan)(toolUseContext.agentId);
            attachments = [];
            // Check for re-entry: flag is set AND plan file exists
            if ((0, state_js_2.hasExitedPlanModeInSession)() && existingPlan !== null) {
                attachments.push({ type: 'plan_mode_reentry', planFilePath: planFilePath });
                (0, state_js_2.setHasExitedPlanMode)(false); // Clear flag - one-time guidance
            }
            attachmentCount = countPlanModeAttachmentsSinceLastExit(messages !== null && messages !== void 0 ? messages : []) + 1;
            reminderType = attachmentCount %
                exports.PLAN_MODE_ATTACHMENT_CONFIG.FULL_REMINDER_EVERY_N_ATTACHMENTS ===
                1
                ? 'full'
                : 'sparse';
            // Always add the main plan_mode attachment
            attachments.push({
                type: 'plan_mode',
                reminderType: reminderType,
                isSubAgent: !!toolUseContext.agentId,
                planFilePath: planFilePath,
                planExists: existingPlan !== null,
            });
            return [2 /*return*/, attachments];
        });
    });
}
/**
 * Returns a plan_mode_exit attachment if we just exited plan mode.
 * This is a one-time notification to tell the model it's no longer in plan mode.
 */
function getPlanModeExitAttachment(toolUseContext) {
    return __awaiter(this, void 0, void 0, function () {
        var appState, planFilePath, planExists;
        return __generator(this, function (_a) {
            // Only trigger if the flag is set (we just exited plan mode)
            if (!(0, state_js_2.needsPlanModeExitAttachment)()) {
                return [2 /*return*/, []];
            }
            appState = toolUseContext.getAppState();
            if (appState.toolPermissionContext.mode === 'plan') {
                (0, state_js_2.setNeedsPlanModeExitAttachment)(false);
                return [2 /*return*/, []];
            }
            // Clear the flag - this is a one-time notification
            (0, state_js_2.setNeedsPlanModeExitAttachment)(false);
            planFilePath = (0, plans_js_1.getPlanFilePath)(toolUseContext.agentId);
            planExists = (0, plans_js_1.getPlan)(toolUseContext.agentId) !== null;
            // Note: skill discovery does NOT fire on plan exit. By the time the plan is
            // written, it's too late — the model should have had relevant skills WHILE
            // planning. The user_message signal already fires on the request that
            // triggers planning ("plan how to deploy this"), which is the right moment.
            return [2 /*return*/, [{ type: 'plan_mode_exit', planFilePath: planFilePath, planExists: planExists }]];
        });
    });
}
function getAutoModeAttachmentTurnCount(messages) {
    var turnsSinceLastAttachment = 0;
    var foundAutoModeAttachment = false;
    // Iterate backwards to find most recent auto_mode attachment.
    // Count HUMAN turns (non-meta, non-tool-result user messages), not assistant
    // messages — the tool loop in query.ts calls getAttachmentMessages on every
    // tool round, so a single human turn with 100 tool calls would fire ~20
    // reminders if we counted assistant messages. Auto mode's target use case is
    // long agentic sessions, where this accumulated 60-105× per session.
    for (var i = messages.length - 1; i >= 0; i--) {
        var message = messages[i];
        if ((message === null || message === void 0 ? void 0 : message.type) === 'user' &&
            !message.isMeta &&
            !hasToolResultContent(message.message.content)) {
            turnsSinceLastAttachment++;
        }
        else if ((message === null || message === void 0 ? void 0 : message.type) === 'attachment' &&
            message.attachment.type === 'auto_mode') {
            foundAutoModeAttachment = true;
            break;
        }
        else if ((message === null || message === void 0 ? void 0 : message.type) === 'attachment' &&
            message.attachment.type === 'auto_mode_exit') {
            // Exit resets the throttle — treat as if no prior attachment exists
            break;
        }
    }
    return { turnCount: turnsSinceLastAttachment, foundAutoModeAttachment: foundAutoModeAttachment };
}
/**
 * Count auto_mode attachments since the last auto_mode_exit (or from start if no exit).
 * This ensures the full/sparse cycle resets when re-entering auto mode.
 */
function countAutoModeAttachmentsSinceLastExit(messages) {
    var count = 0;
    for (var i = messages.length - 1; i >= 0; i--) {
        var message = messages[i];
        if ((message === null || message === void 0 ? void 0 : message.type) === 'attachment') {
            if (message.attachment.type === 'auto_mode_exit') {
                break;
            }
            if (message.attachment.type === 'auto_mode') {
                count++;
            }
        }
    }
    return count;
}
function getAutoModeAttachments(messages, toolUseContext) {
    return __awaiter(this, void 0, void 0, function () {
        var appState, permissionContext, inAuto, inPlanWithAuto, _a, turnCount, foundAutoModeAttachment, attachmentCount, reminderType;
        var _b;
        return __generator(this, function (_c) {
            appState = toolUseContext.getAppState();
            permissionContext = appState.toolPermissionContext;
            inAuto = permissionContext.mode === 'auto';
            inPlanWithAuto = permissionContext.mode === 'plan' &&
                ((_b = autoModeStateModule === null || autoModeStateModule === void 0 ? void 0 : autoModeStateModule.isAutoModeActive()) !== null && _b !== void 0 ? _b : false);
            if (!inAuto && !inPlanWithAuto) {
                return [2 /*return*/, []];
            }
            // Check if we should attach based on turn count (except for first turn)
            if (messages && messages.length > 0) {
                _a = getAutoModeAttachmentTurnCount(messages), turnCount = _a.turnCount, foundAutoModeAttachment = _a.foundAutoModeAttachment;
                // Only throttle if we've already sent an auto_mode attachment before
                // On first turn in auto mode, always attach
                if (foundAutoModeAttachment &&
                    turnCount < exports.AUTO_MODE_ATTACHMENT_CONFIG.TURNS_BETWEEN_ATTACHMENTS) {
                    return [2 /*return*/, []];
                }
            }
            attachmentCount = countAutoModeAttachmentsSinceLastExit(messages !== null && messages !== void 0 ? messages : []) + 1;
            reminderType = attachmentCount %
                exports.AUTO_MODE_ATTACHMENT_CONFIG.FULL_REMINDER_EVERY_N_ATTACHMENTS ===
                1
                ? 'full'
                : 'sparse';
            return [2 /*return*/, [{ type: 'auto_mode', reminderType: reminderType }]];
        });
    });
}
/**
 * Returns an auto_mode_exit attachment if we just exited auto mode.
 * This is a one-time notification to tell the model it's no longer in auto mode.
 */
function getAutoModeExitAttachment(toolUseContext) {
    return __awaiter(this, void 0, void 0, function () {
        var appState;
        var _a;
        return __generator(this, function (_b) {
            if (!(0, state_js_2.needsAutoModeExitAttachment)()) {
                return [2 /*return*/, []];
            }
            appState = toolUseContext.getAppState();
            // Suppress when auto is still active — covers both mode==='auto' and
            // plan-with-auto-active (where mode==='plan' but classifier runs).
            if (appState.toolPermissionContext.mode === 'auto' ||
                ((_a = autoModeStateModule === null || autoModeStateModule === void 0 ? void 0 : autoModeStateModule.isAutoModeActive()) !== null && _a !== void 0 ? _a : false)) {
                (0, state_js_2.setNeedsAutoModeExitAttachment)(false);
                return [2 /*return*/, []];
            }
            (0, state_js_2.setNeedsAutoModeExitAttachment)(false);
            return [2 /*return*/, [{ type: 'auto_mode_exit' }]];
        });
    });
}
/**
 * Detects when the local date has changed since the last turn (user coding
 * past midnight) and emits an attachment to notify the model.
 *
 * The date_change attachment is appended at the tail of the conversation,
 * so the model learns the new date without mutating the cached prefix.
 * messages[0] (from getUserContext → prependUserContext) intentionally
 * keeps the stale date — clearing that cache would regenerate the prefix
 * and turn the entire conversation into cache_creation on the next turn
 * (~920K effective tokens per midnight crossing per overnight session).
 *
 * Exported for testing — regression guard for the cache-clear removal.
 */
function getDateChangeAttachments(messages) {
    var currentDate = (0, common_js_2.getLocalISODate)();
    var lastDate = (0, state_js_2.getLastEmittedDate)();
    if (lastDate === null) {
        // First turn — just record, no attachment needed
        (0, state_js_2.setLastEmittedDate)(currentDate);
        return [];
    }
    if (currentDate === lastDate) {
        return [];
    }
    (0, state_js_2.setLastEmittedDate)(currentDate);
    // Assistant mode: flush yesterday's transcript to the per-day file so
    // the /dream skill (1–5am local) finds it even if no compaction fires
    // today. Fire-and-forget; writeSessionTranscriptSegment buckets by
    // message timestamp so a multi-day gap flushes each day correctly.
    if ((0, bun_bundle_1.feature)('KAIROS')) {
        if ((0, state_js_2.getKairosActive)() && messages !== undefined) {
            sessionTranscriptModule === null || sessionTranscriptModule === void 0 ? void 0 : sessionTranscriptModule.flushOnDateChange(messages, currentDate);
        }
    }
    return [{ type: 'date_change', newDate: currentDate }];
}
function getUltrathinkEffortAttachment(input) {
    if (!(0, thinking_js_1.isUltrathinkEnabled)() || !input || !(0, thinking_js_1.hasUltrathinkKeyword)(input)) {
        return [];
    }
    (0, index_js_1.logEvent)('tengu_ultrathink', {});
    return [{ type: 'ultrathink_effort', level: 'high' }];
}
// Exported for compact.ts — the gate must be identical at both call sites.
function getDeferredToolsDeltaAttachment(tools, model, messages, scanContext) {
    if (!(0, toolSearch_js_1.isDeferredToolsDeltaEnabled)())
        return [];
    // These three checks mirror the sync parts of isToolSearchEnabled —
    // the attachment text says "available via ToolSearch", so ToolSearch
    // has to actually be in the request. The async auto-threshold check
    // is not replicated (would double-fire tengu_tool_search_mode_decision);
    // in tst-auto below-threshold the attachment can fire while ToolSearch
    // is filtered out, but that's a narrow case and the tools announced
    // are directly callable anyway.
    if (!(0, toolSearch_js_1.isToolSearchEnabledOptimistic)())
        return [];
    if (!(0, toolSearch_js_1.modelSupportsToolReference)(model))
        return [];
    if (!(0, toolSearch_js_1.isToolSearchToolAvailable)(tools))
        return [];
    var delta = (0, toolSearch_js_1.getDeferredToolsDelta)(tools, messages !== null && messages !== void 0 ? messages : [], scanContext);
    if (!delta)
        return [];
    return [__assign({ type: 'deferred_tools_delta' }, delta)];
}
/**
 * Diff the current filtered agent pool against what's already been announced
 * in this conversation (reconstructed from prior agent_listing_delta
 * attachments). Returns [] if nothing changed or the gate is off.
 *
 * The agent list was embedded in AgentTool's description, causing ~10.2% of
 * fleet cache_creation: MCP async connect, /reload-plugins, or
 * permission-mode change → description changes → full tool-schema cache bust.
 * Moving the list here keeps the tool description static.
 *
 * Exported for compact.ts — re-announces the full set after compaction eats
 * prior deltas.
 */
function getAgentListingDeltaAttachment(toolUseContext, messages) {
    if (!(0, prompt_js_3.shouldInjectAgentListInMessages)())
        return [];
    // Skip if AgentTool isn't in the pool — the listing would be unactionable.
    if (!toolUseContext.options.tools.some(function (t) { return (0, Tool_js_1.toolMatchesName)(t, constants_js_5.AGENT_TOOL_NAME); })) {
        return [];
    }
    var _a = toolUseContext.options.agentDefinitions, activeAgents = _a.activeAgents, allowedAgentTypes = _a.allowedAgentTypes;
    // Mirror AgentTool.prompt()'s filtering: MCP requirements → deny rules →
    // allowedAgentTypes restriction. Keep this in sync with AgentTool.tsx.
    var mcpServers = new Set();
    for (var _i = 0, _b = toolUseContext.options.tools; _i < _b.length; _i++) {
        var tool = _b[_i];
        var info = (0, mcpStringUtils_js_1.mcpInfoFromString)(tool.name);
        if (info)
            mcpServers.add(info.serverName);
    }
    var permissionContext = toolUseContext.getAppState().toolPermissionContext;
    var filtered = (0, permissions_js_1.filterDeniedAgents)((0, loadAgentsDir_js_1.filterAgentsByMcpRequirements)(activeAgents, __spreadArray([], mcpServers, true)), permissionContext, constants_js_5.AGENT_TOOL_NAME);
    if (allowedAgentTypes) {
        filtered = filtered.filter(function (a) { return allowedAgentTypes.includes(a.agentType); });
    }
    // Reconstruct announced set from prior deltas in the transcript.
    var announced = new Set();
    for (var _c = 0, _d = messages !== null && messages !== void 0 ? messages : []; _c < _d.length; _c++) {
        var msg = _d[_c];
        if (msg.type !== 'attachment')
            continue;
        if (msg.attachment.type !== 'agent_listing_delta')
            continue;
        for (var _e = 0, _f = msg.attachment.addedTypes; _e < _f.length; _e++) {
            var t = _f[_e];
            announced.add(t);
        }
        for (var _g = 0, _h = msg.attachment.removedTypes; _g < _h.length; _g++) {
            var t = _h[_g];
            announced.delete(t);
        }
    }
    var currentTypes = new Set(filtered.map(function (a) { return a.agentType; }));
    var added = filtered.filter(function (a) { return !announced.has(a.agentType); });
    var removed = [];
    for (var _j = 0, announced_1 = announced; _j < announced_1.length; _j++) {
        var t = announced_1[_j];
        if (!currentTypes.has(t))
            removed.push(t);
    }
    if (added.length === 0 && removed.length === 0)
        return [];
    // Sort for deterministic output — agent load order is nondeterministic
    // (plugin load races, MCP async connect).
    added.sort(function (a, b) { return a.agentType.localeCompare(b.agentType); });
    removed.sort();
    return [
        {
            type: 'agent_listing_delta',
            addedTypes: added.map(function (a) { return a.agentType; }),
            addedLines: added.map(prompt_js_3.formatAgentLine),
            removedTypes: removed,
            isInitial: announced.size === 0,
            showConcurrencyNote: (0, auth_js_1.getSubscriptionType)() !== 'pro',
        },
    ];
}
// Exported for compact.ts / reactiveCompact.ts — single source of truth for the gate.
function getMcpInstructionsDeltaAttachment(mcpClients, tools, model, messages) {
    if (!(0, mcpInstructionsDelta_js_1.isMcpInstructionsDeltaEnabled)())
        return [];
    // The chrome ToolSearch hint is client-authored and ToolSearch-conditional;
    // actual server `instructions` are unconditional. Decide the chrome part
    // here, pass it into the pure diff as a synthesized entry.
    var clientSide = [];
    if ((0, toolSearch_js_1.isToolSearchEnabledOptimistic)() &&
        (0, toolSearch_js_1.modelSupportsToolReference)(model) &&
        (0, toolSearch_js_1.isToolSearchToolAvailable)(tools)) {
        clientSide.push({
            serverName: common_js_1.CLAUDE_IN_CHROME_MCP_SERVER_NAME,
            block: prompt_js_4.CHROME_TOOL_SEARCH_INSTRUCTIONS,
        });
    }
    var delta = (0, mcpInstructionsDelta_js_1.getMcpInstructionsDelta)(mcpClients, messages !== null && messages !== void 0 ? messages : [], clientSide);
    if (!delta)
        return [];
    return [__assign({ type: 'mcp_instructions_delta' }, delta)];
}
function getCriticalSystemReminderAttachment(toolUseContext) {
    var reminder = toolUseContext.criticalSystemReminder_EXPERIMENTAL;
    if (!reminder) {
        return [];
    }
    return [{ type: 'critical_system_reminder', content: reminder }];
}
function getOutputStyleAttachment() {
    var settings = (0, settings_js_1.getSettings_DEPRECATED)();
    var outputStyle = (settings === null || settings === void 0 ? void 0 : settings.outputStyle) || 'default';
    // Only show for non-default styles
    if (outputStyle === 'default') {
        return [];
    }
    return [
        {
            type: 'output_style',
            style: outputStyle,
        },
    ];
}
function getSelectedLinesFromIDE(ideSelection, toolUseContext) {
    return __awaiter(this, void 0, void 0, function () {
        var ideName, appState;
        return __generator(this, function (_a) {
            ideName = (0, ide_js_1.getConnectedIdeName)(toolUseContext.options.mcpClients);
            if (!ideName ||
                (ideSelection === null || ideSelection === void 0 ? void 0 : ideSelection.lineStart) === undefined ||
                !ideSelection.text ||
                !ideSelection.filePath) {
                return [2 /*return*/, []];
            }
            appState = toolUseContext.getAppState();
            if (isFileReadDenied(ideSelection.filePath, appState.toolPermissionContext)) {
                return [2 /*return*/, []];
            }
            return [2 /*return*/, [
                    {
                        type: 'selected_lines_in_ide',
                        ideName: ideName,
                        lineStart: ideSelection.lineStart,
                        lineEnd: ideSelection.lineStart + ideSelection.lineCount - 1,
                        filename: ideSelection.filePath,
                        content: ideSelection.text,
                        displayPath: (0, path_1.relative)((0, cwd_js_1.getCwd)(), ideSelection.filePath),
                    },
                ]];
        });
    });
}
/**
 * Computes the directories to process for nested memory file loading.
 * Returns two lists:
 * - nestedDirs: Directories between CWD and targetPath (processed for CLAUDE.md + all rules)
 * - cwdLevelDirs: Directories from root to CWD (processed for conditional rules only)
 *
 * @param targetPath The target file path
 * @param originalCwd The original current working directory
 * @returns Object with nestedDirs and cwdLevelDirs arrays, both ordered from parent to child
 */
function getDirectoriesToProcess(targetPath, originalCwd) {
    // Build list of directories from original CWD to targetPath's directory
    var targetDir = (0, path_1.dirname)((0, path_1.resolve)(targetPath));
    var nestedDirs = [];
    var currentDir = targetDir;
    // Walk up from target directory to original CWD
    while (currentDir !== originalCwd && currentDir !== (0, path_1.parse)(currentDir).root) {
        if (currentDir.startsWith(originalCwd)) {
            nestedDirs.push(currentDir);
        }
        currentDir = (0, path_1.dirname)(currentDir);
    }
    // Reverse to get order from CWD down to target
    nestedDirs.reverse();
    // Build list of directories from root to CWD (for conditional rules only)
    var cwdLevelDirs = [];
    currentDir = originalCwd;
    while (currentDir !== (0, path_1.parse)(currentDir).root) {
        cwdLevelDirs.push(currentDir);
        currentDir = (0, path_1.dirname)(currentDir);
    }
    // Reverse to get order from root to CWD
    cwdLevelDirs.reverse();
    return { nestedDirs: nestedDirs, cwdLevelDirs: cwdLevelDirs };
}
/**
 * Converts memory files to attachments, filtering out already-loaded files.
 *
 * @param memoryFiles The memory files to convert
 * @param toolUseContext The tool use context (for tracking loaded files)
 * @returns Array of nested memory attachments
 */
function isInstructionsMemoryType(type) {
    return (type === 'User' ||
        type === 'Project' ||
        type === 'Local' ||
        type === 'Managed');
}
/** Exported for testing — regression guard for LRU-eviction re-injection. */
function memoryFilesToAttachments(memoryFiles, toolUseContext, triggerFilePath) {
    var _a, _b, _c;
    var attachments = [];
    var shouldFireHook = (0, hooks_js_1.hasInstructionsLoadedHook)();
    for (var _i = 0, memoryFiles_1 = memoryFiles; _i < memoryFiles_1.length; _i++) {
        var memoryFile = memoryFiles_1[_i];
        // Dedup: loadedNestedMemoryPaths is a non-evicting Set; readFileState
        // is a 100-entry LRU that drops entries in busy sessions, so relying
        // on it alone re-injects the same CLAUDE.md on every eviction cycle.
        if ((_a = toolUseContext.loadedNestedMemoryPaths) === null || _a === void 0 ? void 0 : _a.has(memoryFile.path)) {
            continue;
        }
        if (!toolUseContext.readFileState.has(memoryFile.path)) {
            attachments.push({
                type: 'nested_memory',
                path: memoryFile.path,
                content: memoryFile,
                displayPath: (0, path_1.relative)((0, cwd_js_1.getCwd)(), memoryFile.path),
            });
            (_b = toolUseContext.loadedNestedMemoryPaths) === null || _b === void 0 ? void 0 : _b.add(memoryFile.path);
            // Mark as loaded in readFileState — this provides cross-function and
            // cross-turn dedup via the .has() check above.
            //
            // When the injected content doesn't match disk (stripped HTML comments,
            // stripped frontmatter, truncated MEMORY.md), cache the RAW disk bytes
            // with `isPartialView: true`. Edit/Write see the flag and require a real
            // Read first; getChangedFiles sees real content + undefined offset/limit
            // so mid-session change detection still works.
            toolUseContext.readFileState.set(memoryFile.path, {
                content: memoryFile.contentDiffersFromDisk
                    ? ((_c = memoryFile.rawContent) !== null && _c !== void 0 ? _c : memoryFile.content)
                    : memoryFile.content,
                timestamp: Date.now(),
                offset: undefined,
                limit: undefined,
                isPartialView: memoryFile.contentDiffersFromDisk,
            });
            // Fire InstructionsLoaded hook for audit/observability (fire-and-forget)
            if (shouldFireHook && isInstructionsMemoryType(memoryFile.type)) {
                var loadReason = memoryFile.globs
                    ? 'path_glob_match'
                    : memoryFile.parent
                        ? 'include'
                        : 'nested_traversal';
                void (0, hooks_js_1.executeInstructionsLoadedHooks)(memoryFile.path, memoryFile.type, loadReason, {
                    globs: memoryFile.globs,
                    triggerFilePath: triggerFilePath,
                    parentFilePath: memoryFile.parent,
                });
            }
        }
    }
    return attachments;
}
/**
 * Loads nested memory files for a given file path and returns them as attachments.
 * This function performs directory traversal to find CLAUDE.md files and conditional rules
 * that apply to the target file path.
 *
 * Processing order (must be preserved):
 * 1. Managed/User conditional rules matching targetPath
 * 2. Nested directories (CWD → target): CLAUDE.md + unconditional + conditional rules
 * 3. CWD-level directories (root → CWD): conditional rules only
 *
 * @param filePath The file path to get nested memory files for
 * @param toolUseContext The tool use context
 * @param appState The app state containing tool permission context
 * @returns Array of nested memory attachments
 */
function getNestedMemoryAttachmentsForFile(filePath, toolUseContext, appState) {
    return __awaiter(this, void 0, void 0, function () {
        var attachments, processedPaths, originalCwd, managedUserRules, _a, nestedDirs, cwdLevelDirs, skipProjectLevel_1, _i, nestedDirs_1, dir, memoryFiles, _b, cwdLevelDirs_1, dir, conditionalRules, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    attachments = [];
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 11, , 12]);
                    // Early return if path is not in allowed working path
                    if (!(0, filesystem_js_1.pathInAllowedWorkingPath)(filePath, appState.toolPermissionContext)) {
                        return [2 /*return*/, attachments];
                    }
                    processedPaths = new Set();
                    originalCwd = (0, state_js_2.getOriginalCwd)();
                    return [4 /*yield*/, (0, claudemd_js_1.getManagedAndUserConditionalRules)(filePath, processedPaths)];
                case 2:
                    managedUserRules = _c.sent();
                    attachments.push.apply(attachments, memoryFilesToAttachments(managedUserRules, toolUseContext, filePath));
                    _a = getDirectoriesToProcess(filePath, originalCwd), nestedDirs = _a.nestedDirs, cwdLevelDirs = _a.cwdLevelDirs;
                    skipProjectLevel_1 = (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_paper_halyard', false);
                    _i = 0, nestedDirs_1 = nestedDirs;
                    _c.label = 3;
                case 3:
                    if (!(_i < nestedDirs_1.length)) return [3 /*break*/, 6];
                    dir = nestedDirs_1[_i];
                    return [4 /*yield*/, (0, claudemd_js_1.getMemoryFilesForNestedDirectory)(dir, filePath, processedPaths)];
                case 4:
                    memoryFiles = (_c.sent()).filter(function (f) { return !skipProjectLevel_1 || (f.type !== 'Project' && f.type !== 'Local'); });
                    attachments.push.apply(attachments, memoryFilesToAttachments(memoryFiles, toolUseContext, filePath));
                    _c.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    _b = 0, cwdLevelDirs_1 = cwdLevelDirs;
                    _c.label = 7;
                case 7:
                    if (!(_b < cwdLevelDirs_1.length)) return [3 /*break*/, 10];
                    dir = cwdLevelDirs_1[_b];
                    return [4 /*yield*/, (0, claudemd_js_1.getConditionalRulesForCwdLevelDirectory)(dir, filePath, processedPaths)];
                case 8:
                    conditionalRules = (_c.sent()).filter(function (f) { return !skipProjectLevel_1 || (f.type !== 'Project' && f.type !== 'Local'); });
                    attachments.push.apply(attachments, memoryFilesToAttachments(conditionalRules, toolUseContext, filePath));
                    _c.label = 9;
                case 9:
                    _b++;
                    return [3 /*break*/, 7];
                case 10: return [3 /*break*/, 12];
                case 11:
                    error_1 = _c.sent();
                    (0, log_js_1.logError)(error_1);
                    return [3 /*break*/, 12];
                case 12: return [2 /*return*/, attachments];
            }
        });
    });
}
function getOpenedFileFromIDE(ideSelection, toolUseContext) {
    return __awaiter(this, void 0, void 0, function () {
        var appState, nestedMemoryAttachments;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(ideSelection === null || ideSelection === void 0 ? void 0 : ideSelection.filePath) || ideSelection.text) {
                        return [2 /*return*/, []];
                    }
                    appState = toolUseContext.getAppState();
                    if (isFileReadDenied(ideSelection.filePath, appState.toolPermissionContext)) {
                        return [2 /*return*/, []];
                    }
                    return [4 /*yield*/, getNestedMemoryAttachmentsForFile(ideSelection.filePath, toolUseContext, appState)
                        // Return nested memory attachments followed by the opened file attachment
                    ];
                case 1:
                    nestedMemoryAttachments = _a.sent();
                    // Return nested memory attachments followed by the opened file attachment
                    return [2 /*return*/, __spreadArray(__spreadArray([], nestedMemoryAttachments, true), [
                            {
                                type: 'opened_file_in_ide',
                                filename: ideSelection.filePath,
                            },
                        ], false)];
            }
        });
    });
}
function processAtMentionedFiles(input, toolUseContext) {
    return __awaiter(this, void 0, void 0, function () {
        var files, appState, results;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    files = extractAtMentionedFiles(input);
                    if (files.length === 0)
                        return [2 /*return*/, []];
                    appState = toolUseContext.getAppState();
                    return [4 /*yield*/, Promise.all(files.map(function (file) { return __awaiter(_this, void 0, void 0, function () {
                            var _a, filename, lineStart, lineEnd, absoluteFilename, stats, entries, MAX_DIR_ENTRIES, truncated, names, stdout, _b, _c, _d;
                            return __generator(this, function (_e) {
                                switch (_e.label) {
                                    case 0:
                                        _e.trys.push([0, 10, , 11]);
                                        _a = parseAtMentionedFileLines(file), filename = _a.filename, lineStart = _a.lineStart, lineEnd = _a.lineEnd;
                                        absoluteFilename = (0, path_js_1.expandPath)(filename);
                                        if (isFileReadDenied(absoluteFilename, appState.toolPermissionContext)) {
                                            return [2 /*return*/, null];
                                        }
                                        _e.label = 1;
                                    case 1:
                                        _e.trys.push([1, 7, , 8]);
                                        return [4 /*yield*/, (0, promises_1.stat)(absoluteFilename)];
                                    case 2:
                                        stats = _e.sent();
                                        if (!stats.isDirectory()) return [3 /*break*/, 6];
                                        _e.label = 3;
                                    case 3:
                                        _e.trys.push([3, 5, , 6]);
                                        return [4 /*yield*/, (0, promises_1.readdir)(absoluteFilename, {
                                                withFileTypes: true,
                                            })];
                                    case 4:
                                        entries = _e.sent();
                                        MAX_DIR_ENTRIES = 1000;
                                        truncated = entries.length > MAX_DIR_ENTRIES;
                                        names = entries.slice(0, MAX_DIR_ENTRIES).map(function (e) { return e.name; });
                                        if (truncated) {
                                            names.push("\u2026 and ".concat(entries.length - MAX_DIR_ENTRIES, " more entries"));
                                        }
                                        stdout = names.join('\n');
                                        (0, index_js_1.logEvent)('tengu_at_mention_extracting_directory_success', {});
                                        return [2 /*return*/, {
                                                type: 'directory',
                                                path: absoluteFilename,
                                                content: stdout,
                                                displayPath: (0, path_1.relative)((0, cwd_js_1.getCwd)(), absoluteFilename),
                                            }];
                                    case 5:
                                        _b = _e.sent();
                                        return [2 /*return*/, null];
                                    case 6: return [3 /*break*/, 8];
                                    case 7:
                                        _c = _e.sent();
                                        return [3 /*break*/, 8];
                                    case 8: return [4 /*yield*/, generateFileAttachment(absoluteFilename, toolUseContext, 'tengu_at_mention_extracting_filename_success', 'tengu_at_mention_extracting_filename_error', 'at-mention', {
                                            offset: lineStart,
                                            limit: lineEnd && lineStart ? lineEnd - lineStart + 1 : undefined,
                                        })];
                                    case 9: return [2 /*return*/, _e.sent()];
                                    case 10:
                                        _d = _e.sent();
                                        (0, index_js_1.logEvent)('tengu_at_mention_extracting_filename_error', {});
                                        return [3 /*break*/, 11];
                                    case 11: return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 1:
                    results = _a.sent();
                    return [2 /*return*/, results.filter(Boolean)];
            }
        });
    });
}
function processAgentMentions(input, agents) {
    var agentMentions = extractAgentMentions(input);
    if (agentMentions.length === 0)
        return [];
    var results = agentMentions.map(function (mention) {
        var agentType = mention.replace('agent-', '');
        var agentDef = agents.find(function (def) { return def.agentType === agentType; });
        if (!agentDef) {
            (0, index_js_1.logEvent)('tengu_at_mention_agent_not_found', {});
            return null;
        }
        (0, index_js_1.logEvent)('tengu_at_mention_agent_success', {});
        return {
            type: 'agent_mention',
            agentType: agentDef.agentType,
        };
    });
    return results.filter(function (result) { return result !== null; });
}
function processMcpResourceAttachments(input, toolUseContext) {
    return __awaiter(this, void 0, void 0, function () {
        var resourceMentions, mcpClients, results;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    resourceMentions = extractMcpResourceMentions(input);
                    if (resourceMentions.length === 0)
                        return [2 /*return*/, []];
                    mcpClients = toolUseContext.options.mcpClients || [];
                    return [4 /*yield*/, Promise.all(resourceMentions.map(function (mention) { return __awaiter(_this, void 0, void 0, function () {
                            var _a, serverName_1, uriParts, uri_1, client, serverResources, resourceInfo, result, error_2, _b;
                            var _c;
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0:
                                        _d.trys.push([0, 5, , 6]);
                                        _a = mention.split(':'), serverName_1 = _a[0], uriParts = _a.slice(1);
                                        uri_1 = uriParts.join(':') // Rejoin in case URI contains colons
                                        ;
                                        if (!serverName_1 || !uri_1) {
                                            (0, index_js_1.logEvent)('tengu_at_mention_mcp_resource_error', {});
                                            return [2 /*return*/, null];
                                        }
                                        client = mcpClients.find(function (c) { return c.name === serverName_1; });
                                        if (!client || client.type !== 'connected') {
                                            (0, index_js_1.logEvent)('tengu_at_mention_mcp_resource_error', {});
                                            return [2 /*return*/, null];
                                        }
                                        serverResources = ((_c = toolUseContext.options.mcpResources) === null || _c === void 0 ? void 0 : _c[serverName_1]) || [];
                                        resourceInfo = serverResources.find(function (r) { return r.uri === uri_1; });
                                        if (!resourceInfo) {
                                            (0, index_js_1.logEvent)('tengu_at_mention_mcp_resource_error', {});
                                            return [2 /*return*/, null];
                                        }
                                        _d.label = 1;
                                    case 1:
                                        _d.trys.push([1, 3, , 4]);
                                        return [4 /*yield*/, client.client.readResource({
                                                uri: uri_1,
                                            })];
                                    case 2:
                                        result = _d.sent();
                                        (0, index_js_1.logEvent)('tengu_at_mention_mcp_resource_success', {});
                                        return [2 /*return*/, {
                                                type: 'mcp_resource',
                                                server: serverName_1,
                                                uri: uri_1,
                                                name: resourceInfo.name || uri_1,
                                                description: resourceInfo.description,
                                                content: result,
                                            }];
                                    case 3:
                                        error_2 = _d.sent();
                                        (0, index_js_1.logEvent)('tengu_at_mention_mcp_resource_error', {});
                                        (0, log_js_1.logError)(error_2);
                                        return [2 /*return*/, null];
                                    case 4: return [3 /*break*/, 6];
                                    case 5:
                                        _b = _d.sent();
                                        (0, index_js_1.logEvent)('tengu_at_mention_mcp_resource_error', {});
                                        return [2 /*return*/, null];
                                    case 6: return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 1:
                    results = _a.sent();
                    return [2 /*return*/, results.filter(function (result) { return result !== null; })];
            }
        });
    });
}
function getChangedFiles(toolUseContext) {
    return __awaiter(this, void 0, void 0, function () {
        var filePaths, appState, results;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    filePaths = (0, fileStateCache_js_1.cacheKeys)(toolUseContext.readFileState);
                    if (filePaths.length === 0)
                        return [2 /*return*/, []];
                    appState = toolUseContext.getAppState();
                    return [4 /*yield*/, Promise.all(filePaths.map(function (filePath) { return __awaiter(_this, void 0, void 0, function () {
                            var fileState, normalizedPath, mtime, fileInput, isValid, result, snippet, data, compressionError_1, err_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        fileState = toolUseContext.readFileState.get(filePath);
                                        if (!fileState)
                                            return [2 /*return*/, null
                                                // TODO: Implement offset/limit support for changed files
                                            ];
                                        // TODO: Implement offset/limit support for changed files
                                        if (fileState.offset !== undefined || fileState.limit !== undefined) {
                                            return [2 /*return*/, null];
                                        }
                                        normalizedPath = (0, path_js_1.expandPath)(filePath);
                                        // Check if file has a deny rule configured
                                        if (isFileReadDenied(normalizedPath, appState.toolPermissionContext)) {
                                            return [2 /*return*/, null];
                                        }
                                        _a.label = 1;
                                    case 1:
                                        _a.trys.push([1, 9, , 10]);
                                        return [4 /*yield*/, (0, file_js_1.getFileModificationTimeAsync)(normalizedPath)];
                                    case 2:
                                        mtime = _a.sent();
                                        if (mtime <= fileState.timestamp) {
                                            return [2 /*return*/, null];
                                        }
                                        fileInput = { file_path: normalizedPath };
                                        return [4 /*yield*/, FileReadTool_js_1.FileReadTool.validateInput(fileInput, toolUseContext)];
                                    case 3:
                                        isValid = _a.sent();
                                        if (!isValid.result) {
                                            return [2 /*return*/, null];
                                        }
                                        return [4 /*yield*/, FileReadTool_js_1.FileReadTool.call(fileInput, toolUseContext)
                                            // Extract only the changed section
                                        ];
                                    case 4:
                                        result = _a.sent();
                                        // Extract only the changed section
                                        if (result.data.type === 'text') {
                                            snippet = (0, utils_js_1.getSnippetForTwoFileDiff)(fileState.content, result.data.file.content);
                                            // File was touched but not modified
                                            if (snippet === '') {
                                                return [2 /*return*/, null];
                                            }
                                            return [2 /*return*/, {
                                                    type: 'edited_text_file',
                                                    filename: normalizedPath,
                                                    snippet: snippet,
                                                }];
                                        }
                                        if (!(result.data.type === 'image')) return [3 /*break*/, 8];
                                        _a.label = 5;
                                    case 5:
                                        _a.trys.push([5, 7, , 8]);
                                        return [4 /*yield*/, (0, FileReadTool_js_1.readImageWithTokenBudget)(normalizedPath)];
                                    case 6:
                                        data = _a.sent();
                                        return [2 /*return*/, {
                                                type: 'edited_image_file',
                                                filename: normalizedPath,
                                                content: data,
                                            }];
                                    case 7:
                                        compressionError_1 = _a.sent();
                                        (0, log_js_1.logError)(compressionError_1);
                                        (0, index_js_1.logEvent)('tengu_watched_file_compression_failed', {
                                            file: normalizedPath,
                                        });
                                        return [2 /*return*/, null];
                                    case 8: 
                                    // notebook / pdf / parts — no diff representation; explicitly
                                    // null so the map callback has no implicit-undefined path.
                                    return [2 /*return*/, null];
                                    case 9:
                                        err_1 = _a.sent();
                                        // Evict ONLY on ENOENT (file truly deleted). Transient stat
                                        // failures — atomic-save races (editor writes tmp→rename and
                                        // stat hits the gap), EACCES churn, network-FS hiccups — must
                                        // NOT evict, or the next Edit fails code-6 even though the
                                        // file still exists and the model just read it. VS Code
                                        // auto-save/format-on-save hits this race especially often.
                                        // See regression analysis on PR #18525.
                                        if ((0, errors_js_1.isENOENT)(err_1)) {
                                            toolUseContext.readFileState.delete(filePath);
                                        }
                                        return [2 /*return*/, null];
                                    case 10: return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 1:
                    results = _a.sent();
                    return [2 /*return*/, results.filter(function (result) { return result != null; })];
            }
        });
    });
}
/**
 * Processes paths that need nested memory attachments and checks for nested CLAUDE.md files
 * Uses nestedMemoryAttachmentTriggers field from ToolUseContext
 */
function getNestedMemoryAttachments(toolUseContext) {
    return __awaiter(this, void 0, void 0, function () {
        var appState, attachments, _i, _a, filePath, nestedAttachments;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    // Check triggers first — getAppState() waits for a React render cycle,
                    // and the common case is an empty trigger set.
                    if (!toolUseContext.nestedMemoryAttachmentTriggers ||
                        toolUseContext.nestedMemoryAttachmentTriggers.size === 0) {
                        return [2 /*return*/, []];
                    }
                    appState = toolUseContext.getAppState();
                    attachments = [];
                    _i = 0, _a = toolUseContext.nestedMemoryAttachmentTriggers;
                    _b.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    filePath = _a[_i];
                    return [4 /*yield*/, getNestedMemoryAttachmentsForFile(filePath, toolUseContext, appState)];
                case 2:
                    nestedAttachments = _b.sent();
                    attachments.push.apply(attachments, nestedAttachments);
                    _b.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    toolUseContext.nestedMemoryAttachmentTriggers.clear();
                    return [2 /*return*/, attachments];
            }
        });
    });
}
function getRelevantMemoryAttachments(input, agents, readFileState, recentTools, signal, alreadySurfaced) {
    return __awaiter(this, void 0, void 0, function () {
        var memoryDirs, dirs, allResults, selected, memories;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    memoryDirs = extractAgentMentions(input).flatMap(function (mention) {
                        var agentType = mention.replace('agent-', '');
                        var agentDef = agents.find(function (def) { return def.agentType === agentType; });
                        return (agentDef === null || agentDef === void 0 ? void 0 : agentDef.memory)
                            ? [(0, agentMemory_js_1.getAgentMemoryDir)(agentType, agentDef.memory)]
                            : [];
                    });
                    dirs = memoryDirs.length > 0 ? memoryDirs : [(0, paths_js_1.getAutoMemPath)()];
                    return [4 /*yield*/, Promise.all(dirs.map(function (dir) {
                            return (0, findRelevantMemories_js_1.findRelevantMemories)(input, dir, signal, recentTools, alreadySurfaced).catch(function () { return []; });
                        }))
                        // alreadySurfaced is filtered inside the selector so Sonnet spends its
                        // 5-slot budget on fresh candidates; readFileState catches files the
                        // model read via FileReadTool. The redundant alreadySurfaced check here
                        // is a belt-and-suspenders guard (multi-dir results may re-introduce a
                        // path the selector filtered in a different dir).
                    ];
                case 1:
                    allResults = _a.sent();
                    selected = allResults
                        .flat()
                        .filter(function (m) { return !readFileState.has(m.path) && !alreadySurfaced.has(m.path); })
                        .slice(0, 5);
                    return [4 /*yield*/, readMemoriesForSurfacing(selected, signal)];
                case 2:
                    memories = _a.sent();
                    if (memories.length === 0) {
                        return [2 /*return*/, []];
                    }
                    return [2 /*return*/, [{ type: 'relevant_memories', memories: memories }]];
            }
        });
    });
}
/**
 * Scan messages for past relevant_memories attachments.  Returns both the
 * set of surfaced paths (for selector de-dup) and cumulative byte count
 * (for session-total throttle).  Scanning messages rather than tracking
 * in toolUseContext means compact naturally resets both — old attachments
 * are gone from the compacted transcript, so re-surfacing is valid again.
 */
function collectSurfacedMemories(messages) {
    var paths = new Set();
    var totalBytes = 0;
    for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
        var m = messages_1[_i];
        if (m.type === 'attachment' && m.attachment.type === 'relevant_memories') {
            for (var _a = 0, _b = m.attachment.memories; _a < _b.length; _a++) {
                var mem = _b[_a];
                paths.add(mem.path);
                totalBytes += mem.content.length;
            }
        }
    }
    return { paths: paths, totalBytes: totalBytes };
}
/**
 * Reads a set of relevance-ranked memory files for injection as
 * <system-reminder> attachments. Enforces both MAX_MEMORY_LINES and
 * MAX_MEMORY_BYTES via readFileInRange's truncateOnByteLimit option.
 * Truncation surfaces partial
 * content with a note rather than dropping the file — findRelevantMemories
 * already picked this as most-relevant, so the frontmatter + opening context
 * is worth surfacing even if later lines are cut.
 *
 * Exported for direct testing without mocking the ranker + GB gates.
 */
function readMemoriesForSurfacing(selected, signal) {
    return __awaiter(this, void 0, void 0, function () {
        var results;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all(selected.map(function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
                        var result, truncated, content, _c;
                        var filePath = _b.path, mtimeMs = _b.mtimeMs;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0:
                                    _d.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, (0, readFileInRange_js_1.readFileInRange)(filePath, 0, MAX_MEMORY_LINES, MAX_MEMORY_BYTES, signal, { truncateOnByteLimit: true })];
                                case 1:
                                    result = _d.sent();
                                    truncated = result.totalLines > MAX_MEMORY_LINES || result.truncatedByBytes;
                                    content = truncated
                                        ? result.content +
                                            "\n\n> This memory file was truncated (".concat(result.truncatedByBytes ? "".concat(MAX_MEMORY_BYTES, " byte limit") : "first ".concat(MAX_MEMORY_LINES, " lines"), "). Use the ").concat(prompt_js_2.FILE_READ_TOOL_NAME, " tool to view the complete file at: ").concat(filePath)
                                        : result.content;
                                    return [2 /*return*/, {
                                            path: filePath,
                                            content: content,
                                            mtimeMs: mtimeMs,
                                            header: memoryHeader(filePath, mtimeMs),
                                            limit: truncated ? result.lineCount : undefined,
                                        }];
                                case 2:
                                    _c = _d.sent();
                                    return [2 /*return*/, null];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); }))];
                case 1:
                    results = _a.sent();
                    return [2 /*return*/, results.filter(function (r) { return r !== null; })];
            }
        });
    });
}
/**
 * Header string for a relevant-memory block.  Exported so messages.ts
 * can fall back for resumed sessions where the stored header is missing.
 */
function memoryHeader(path, mtimeMs) {
    var staleness = (0, memoryAge_js_1.memoryFreshnessText)(mtimeMs);
    return staleness
        ? "".concat(staleness, "\n\nMemory: ").concat(path, ":")
        : "Memory (saved ".concat((0, memoryAge_js_1.memoryAge)(mtimeMs), "): ").concat(path, ":");
}
/**
 * Starts the relevant memory search as an async prefetch.
 * Extracts the last real user prompt from messages (skipping isMeta system
 * injections) and kicks off a non-blocking search. Returns a Disposable
 * handle with settlement tracking. Bound with `using` in query.ts.
 */
function startRelevantMemoryPrefetch(messages, toolUseContext) {
    var _a;
    if (!(0, paths_js_1.isAutoMemoryEnabled)() ||
        !(0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_moth_copse', false)) {
        return undefined;
    }
    var lastUserMessage = messages.findLast(function (m) { return m.type === 'user' && !m.isMeta; });
    if (!lastUserMessage) {
        return undefined;
    }
    var input = (0, messages_js_1.getUserMessageText)(lastUserMessage);
    // Single-word prompts lack enough context for meaningful term extraction
    if (!input || !/\s/.test(input.trim())) {
        return undefined;
    }
    var surfaced = collectSurfacedMemories(messages);
    if (surfaced.totalBytes >= exports.RELEVANT_MEMORIES_CONFIG.MAX_SESSION_BYTES) {
        return undefined;
    }
    // Chained to the turn-level abort so user Escape cancels the sideQuery
    // immediately, not just on [Symbol.dispose] when queryLoop exits.
    var controller = (0, abortController_js_1.createChildAbortController)(toolUseContext.abortController);
    var firedAt = Date.now();
    var promise = getRelevantMemoryAttachments(input, toolUseContext.options.agentDefinitions.activeAgents, toolUseContext.readFileState, collectRecentSuccessfulTools(messages, lastUserMessage), controller.signal, surfaced.paths).catch(function (e) {
        if (!(0, errors_js_2.isAbortError)(e)) {
            (0, log_js_1.logError)(e);
        }
        return [];
    });
    var handle = (_a = {
            promise: promise,
            settledAt: null,
            consumedOnIteration: -1
        },
        _a[Symbol.dispose] = function () {
            var _a;
            controller.abort();
            (0, index_js_1.logEvent)('tengu_memdir_prefetch_collected', {
                hidden_by_first_iteration: handle.settledAt !== null && handle.consumedOnIteration === 0,
                consumed_on_iteration: handle.consumedOnIteration,
                latency_ms: ((_a = handle.settledAt) !== null && _a !== void 0 ? _a : Date.now()) - firedAt,
            });
        },
        _a);
    void promise.finally(function () {
        handle.settledAt = Date.now();
    });
    return handle;
}
function isToolResultBlock(b) {
    return (typeof b === 'object' &&
        b !== null &&
        b.type === 'tool_result' &&
        typeof b.tool_use_id === 'string');
}
/**
 * Check whether a user message's content contains tool_result blocks.
 * This is more reliable than checking `toolUseResult === undefined` because
 * sub-agent tool result messages explicitly set `toolUseResult` to `undefined`
 * when `preserveToolUseResults` is false (the default for Explore agents).
 */
function hasToolResultContent(content) {
    return Array.isArray(content) && content.some(isToolResultBlock);
}
/**
 * Tools that succeeded (and never errored) since the previous real turn
 * boundary.  The memory selector uses this to suppress docs about tools
 * that are working — surfacing reference material for a tool the model
 * is already calling successfully is noise.
 *
 * Any error → tool excluded (model is struggling, docs stay available).
 * No result yet → also excluded (outcome unknown).
 *
 * tool_use lives in assistant content; tool_result in user content
 * (toolUseResult set, isMeta undefined).  Both are within the scan window.
 * Backward scan sees results before uses so we collect both by id and
 * resolve after.
 */
function collectRecentSuccessfulTools(messages, lastUserMessage) {
    var useIdToName = new Map();
    var resultByUseId = new Map();
    for (var i = messages.length - 1; i >= 0; i--) {
        var m = messages[i];
        if (!m)
            continue;
        if ((0, messagePredicates_js_1.isHumanTurn)(m) && m !== lastUserMessage)
            break;
        if (m.type === 'assistant' && typeof m.message.content !== 'string') {
            for (var _i = 0, _a = m.message.content; _i < _a.length; _i++) {
                var block = _a[_i];
                if (block.type === 'tool_use')
                    useIdToName.set(block.id, block.name);
            }
        }
        else if (m.type === 'user' &&
            'message' in m &&
            Array.isArray(m.message.content)) {
            for (var _b = 0, _c = m.message.content; _b < _c.length; _b++) {
                var block = _c[_b];
                if (isToolResultBlock(block)) {
                    resultByUseId.set(block.tool_use_id, block.is_error === true);
                }
            }
        }
    }
    var failed = new Set();
    var succeeded = new Set();
    for (var _d = 0, useIdToName_1 = useIdToName; _d < useIdToName_1.length; _d++) {
        var _e = useIdToName_1[_d], id = _e[0], name_1 = _e[1];
        var errored = resultByUseId.get(id);
        if (errored === undefined)
            continue;
        if (errored) {
            failed.add(name_1);
        }
        else {
            succeeded.add(name_1);
        }
    }
    return __spreadArray([], succeeded, true).filter(function (t) { return !failed.has(t); });
}
/**
 * Filters prefetched memory attachments to exclude memories the model already
 * has in context via FileRead/Write/Edit tool calls (any iteration this turn)
 * or a previous turn's memory surfacing — both tracked in the cumulative
 * readFileState. Survivors are then marked in readFileState so subsequent
 * turns won't re-surface them.
 *
 * The mark-after-filter ordering is load-bearing: readMemoriesForSurfacing
 * used to write to readFileState during the prefetch, which meant the filter
 * saw every prefetch-selected path as "already in context" and dropped them
 * all (self-referential filter). Deferring the write to here, after the
 * filter runs, breaks that cycle while still deduping against tool calls
 * from any iteration.
 */
function filterDuplicateMemoryAttachments(attachments, readFileState) {
    return attachments
        .map(function (attachment) {
        if (attachment.type !== 'relevant_memories')
            return attachment;
        var filtered = attachment.memories.filter(function (m) { return !readFileState.has(m.path); });
        for (var _i = 0, filtered_1 = filtered; _i < filtered_1.length; _i++) {
            var m = filtered_1[_i];
            readFileState.set(m.path, {
                content: m.content,
                timestamp: m.mtimeMs,
                offset: undefined,
                limit: m.limit,
            });
        }
        return filtered.length > 0 ? __assign(__assign({}, attachment), { memories: filtered }) : null;
    })
        .filter(function (a) { return a !== null; });
}
/**
 * Processes skill directories that were discovered during file operations.
 * Uses dynamicSkillDirTriggers field from ToolUseContext
 */
function getDynamicSkillAttachments(toolUseContext) {
    return __awaiter(this, void 0, void 0, function () {
        var attachments, perDirResults, _i, perDirResults_1, _a, skillDir, skillNames;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    attachments = [];
                    if (!(toolUseContext.dynamicSkillDirTriggers &&
                        toolUseContext.dynamicSkillDirTriggers.size > 0)) return [3 /*break*/, 2];
                    return [4 /*yield*/, Promise.all(Array.from(toolUseContext.dynamicSkillDirTriggers).map(function (skillDir) { return __awaiter(_this, void 0, void 0, function () {
                            var entries, candidates, checked, _a;
                            var _this = this;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _b.trys.push([0, 3, , 4]);
                                        return [4 /*yield*/, (0, promises_1.readdir)(skillDir, { withFileTypes: true })];
                                    case 1:
                                        entries = _b.sent();
                                        candidates = entries
                                            .filter(function (e) { return e.isDirectory() || e.isSymbolicLink(); })
                                            .map(function (e) { return e.name; });
                                        return [4 /*yield*/, Promise.all(candidates.map(function (name) { return __awaiter(_this, void 0, void 0, function () {
                                                var _a;
                                                return __generator(this, function (_b) {
                                                    switch (_b.label) {
                                                        case 0:
                                                            _b.trys.push([0, 2, , 3]);
                                                            return [4 /*yield*/, (0, promises_1.stat)((0, path_1.resolve)(skillDir, name, 'SKILL.md'))];
                                                        case 1:
                                                            _b.sent();
                                                            return [2 /*return*/, name];
                                                        case 2:
                                                            _a = _b.sent();
                                                            return [2 /*return*/, null]; // SKILL.md doesn't exist, skip this entry
                                                        case 3: return [2 /*return*/];
                                                    }
                                                });
                                            }); }))];
                                    case 2:
                                        checked = _b.sent();
                                        return [2 /*return*/, {
                                                skillDir: skillDir,
                                                skillNames: checked.filter(function (n) { return n !== null; }),
                                            }];
                                    case 3:
                                        _a = _b.sent();
                                        // Ignore errors reading skill directories (e.g., directory doesn't exist)
                                        return [2 /*return*/, { skillDir: skillDir, skillNames: [] }];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 1:
                    perDirResults = _b.sent();
                    for (_i = 0, perDirResults_1 = perDirResults; _i < perDirResults_1.length; _i++) {
                        _a = perDirResults_1[_i], skillDir = _a.skillDir, skillNames = _a.skillNames;
                        if (skillNames.length > 0) {
                            attachments.push({
                                type: 'dynamic_skill',
                                skillDir: skillDir,
                                skillNames: skillNames,
                                displayPath: (0, path_1.relative)((0, cwd_js_1.getCwd)(), skillDir),
                            });
                        }
                    }
                    toolUseContext.dynamicSkillDirTriggers.clear();
                    _b.label = 2;
                case 2: return [2 /*return*/, attachments];
            }
        });
    });
}
// Track which skills have been sent to avoid re-sending. Keyed by agentId
// (empty string = main thread) so subagents get their own turn-0 listing —
// without per-agent scoping, the main thread populating this Set would cause
// every subagent's filterToBundledAndMcp result to dedup to empty.
var sentSkillNames = new Map();
// Called when the skill set genuinely changes (plugin reload, skill file
// change on disk) so new skills get announced. NOT called on compact —
// post-compact re-injection costs ~4K tokens/event for marginal benefit.
function resetSentSkillNames() {
    sentSkillNames.clear();
    suppressNext = false;
}
/**
 * Suppress the next skill-listing injection. Called by conversationRecovery
 * on --resume when a skill_listing attachment already exists in the
 * transcript.
 *
 * `sentSkillNames` is module-scope — process-local. Each `claude -p` spawn
 * starts with an empty Map, so without this every resume re-injects the
 * full ~600-token listing even though it's already in the conversation from
 * the prior process. Shows up on every --resume; particularly loud for
 * daemons that respawn frequently.
 *
 * Trade-off: skills added between sessions won't be announced until the
 * next non-resume session. Acceptable — skill_listing was never meant to
 * cover cross-process deltas, and the agent can still call them (they're
 * in the Skill tool's runtime registry regardless).
 */
function suppressNextSkillListing() {
    suppressNext = true;
}
var suppressNext = false;
// When skill-search is enabled and the filtered (bundled + MCP) listing exceeds
// this count, fall back to bundled-only. Protects MCP-heavy users (100+ servers)
// from truncation while keeping the turn-0 guarantee for typical setups.
var FILTERED_LISTING_MAX = 30;
/**
 * Filter skills to bundled (Anthropic-curated) + MCP (user-connected) only.
 * Used when skill-search is enabled to resolve the turn-0 gap for subagents:
 * these sources are small, intent-signaled, and won't hit the truncation budget.
 * User/project/plugin skills (the long tail — 200+) go through discovery instead.
 *
 * Falls back to bundled-only if bundled+mcp exceeds FILTERED_LISTING_MAX.
 */
function filterToBundledAndMcp(commands) {
    var filtered = commands.filter(function (cmd) { return cmd.loadedFrom === 'bundled' || cmd.loadedFrom === 'mcp'; });
    if (filtered.length > FILTERED_LISTING_MAX) {
        return filtered.filter(function (cmd) { return cmd.loadedFrom === 'bundled'; });
    }
    return filtered;
}
function getSkillListingAttachments(toolUseContext) {
    return __awaiter(this, void 0, void 0, function () {
        var cwd, localCommands, mcpSkills, allCommands, agentKey, sent, _i, allCommands_1, cmd, newSkills, isInitial, _a, newSkills_1, cmd, contextWindowTokens, content;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (process.env.NODE_ENV === 'test') {
                        return [2 /*return*/, []];
                    }
                    // Skip skill listing for agents that don't have the Skill tool — they can't use skills directly.
                    if (!toolUseContext.options.tools.some(function (t) { return (0, Tool_js_1.toolMatchesName)(t, constants_js_4.SKILL_TOOL_NAME); })) {
                        return [2 /*return*/, []];
                    }
                    cwd = (0, state_js_1.getProjectRoot)();
                    return [4 /*yield*/, (0, commands_js_1.getSkillToolCommands)(cwd)];
                case 1:
                    localCommands = _c.sent();
                    mcpSkills = (0, commands_js_1.getMcpSkillCommands)(toolUseContext.getAppState().mcp.commands);
                    allCommands = mcpSkills.length > 0
                        ? (0, uniqBy_js_1.default)(__spreadArray(__spreadArray([], localCommands, true), mcpSkills, true), 'name')
                        : localCommands;
                    // When skill search is active, filter to bundled + MCP instead of full
                    // suppression. Resolves the turn-0 gap: main thread gets turn-0 discovery
                    // via getTurnZeroSkillDiscovery (blocking), but subagents use the async
                    // subagent_spawn signal (collected post-tools, visible turn 1). Bundled +
                    // MCP are small and intent-signaled; user/project/plugin skills go through
                    // discovery. feature() first for DCE — the property-access string leaks
                    // otherwise even with ?. on null.
                    if ((0, bun_bundle_1.feature)('EXPERIMENTAL_SKILL_SEARCH') &&
                        (skillSearchModules === null || skillSearchModules === void 0 ? void 0 : skillSearchModules.featureCheck.isSkillSearchEnabled())) {
                        allCommands = filterToBundledAndMcp(allCommands);
                    }
                    agentKey = (_b = toolUseContext.agentId) !== null && _b !== void 0 ? _b : '';
                    sent = sentSkillNames.get(agentKey);
                    if (!sent) {
                        sent = new Set();
                        sentSkillNames.set(agentKey, sent);
                    }
                    // Resume path: prior process already injected a listing; it's in the
                    // transcript. Mark everything current as sent so only post-resume deltas
                    // (skills loaded later via /reload-plugins etc) get announced.
                    if (suppressNext) {
                        suppressNext = false;
                        for (_i = 0, allCommands_1 = allCommands; _i < allCommands_1.length; _i++) {
                            cmd = allCommands_1[_i];
                            sent.add(cmd.name);
                        }
                        return [2 /*return*/, []];
                    }
                    newSkills = allCommands.filter(function (cmd) { return !sent.has(cmd.name); });
                    if (newSkills.length === 0) {
                        return [2 /*return*/, []];
                    }
                    isInitial = sent.size === 0;
                    // Mark as sent
                    for (_a = 0, newSkills_1 = newSkills; _a < newSkills_1.length; _a++) {
                        cmd = newSkills_1[_a];
                        sent.add(cmd.name);
                    }
                    (0, debug_js_2.logForDebugging)("Sending ".concat(newSkills.length, " skills via attachment (").concat(isInitial ? 'initial' : 'dynamic', ", ").concat(sent.size, " total sent)"));
                    contextWindowTokens = (0, context_js_1.getContextWindowForModel)(toolUseContext.options.mainLoopModel, (0, state_js_2.getSdkBetas)());
                    content = (0, prompt_js_1.formatCommandsWithinBudget)(newSkills, contextWindowTokens);
                    return [2 /*return*/, [
                            {
                                type: 'skill_listing',
                                content: content,
                                skillCount: newSkills.length,
                                isInitial: isInitial,
                            },
                        ]];
            }
        });
    });
}
// getSkillDiscoveryAttachment moved to skillSearch/prefetch.ts as
// getTurnZeroSkillDiscovery — keeps the 'skill_discovery' string literal inside
// a feature-gated module so it doesn't leak into external builds.
function extractAtMentionedFiles(content) {
    // Extract filenames mentioned with @ symbol, including line range syntax: @file.txt#L10-20
    // Also supports quoted paths for files with spaces: @"my/file with spaces.txt"
    // Example: "foo bar @baz moo" would extract "baz"
    // Example: 'check @"my file.txt" please' would extract "my file.txt"
    // Two patterns: quoted paths and regular paths
    var quotedAtMentionRegex = /(^|\s)@"([^"]+)"/g;
    var regularAtMentionRegex = /(^|\s)@([^\s]+)\b/g;
    var quotedMatches = [];
    var regularMatches = [];
    // Extract quoted mentions first (skip agent mentions like @"code-reviewer (agent)")
    var match;
    while ((match = quotedAtMentionRegex.exec(content)) !== null) {
        if (match[2] && !match[2].endsWith(' (agent)')) {
            quotedMatches.push(match[2]); // The content inside quotes
        }
    }
    // Extract regular mentions
    var regularMatchArray = content.match(regularAtMentionRegex) || [];
    regularMatchArray.forEach(function (match) {
        var filename = match.slice(match.indexOf('@') + 1);
        // Don't include if it starts with a quote (already handled as quoted)
        if (!filename.startsWith('"')) {
            regularMatches.push(filename);
        }
    });
    // Combine and deduplicate
    return (0, array_js_1.uniq)(__spreadArray(__spreadArray([], quotedMatches, true), regularMatches, true));
}
function extractMcpResourceMentions(content) {
    // Extract MCP resources mentioned with @ symbol in format @server:uri
    // Example: "@server1:resource/path" would extract "server1:resource/path"
    var atMentionRegex = /(^|\s)@([^\s]+:[^\s]+)\b/g;
    var matches = content.match(atMentionRegex) || [];
    // Remove the prefix (everything before @) from each match
    return (0, array_js_1.uniq)(matches.map(function (match) { return match.slice(match.indexOf('@') + 1); }));
}
function extractAgentMentions(content) {
    // Extract agent mentions in two formats:
    // 1. @agent-<agent-type> (legacy/manual typing)
    //    Example: "@agent-code-elegance-refiner" → "agent-code-elegance-refiner"
    // 2. @"<agent-type> (agent)" (from autocomplete selection)
    //    Example: '@"code-reviewer (agent)"' → "code-reviewer"
    // Supports colons, dots, and at-signs for plugin-scoped agents like "@agent-asana:project-status-updater"
    var results = [];
    // Match quoted format: @"<type> (agent)"
    var quotedAgentRegex = /(^|\s)@"([\w:.@-]+) \(agent\)"/g;
    var match;
    while ((match = quotedAgentRegex.exec(content)) !== null) {
        if (match[2]) {
            results.push(match[2]);
        }
    }
    // Match unquoted format: @agent-<type>
    var unquotedAgentRegex = /(^|\s)@(agent-[\w:.@-]+)/g;
    var unquotedMatches = content.match(unquotedAgentRegex) || [];
    for (var _i = 0, unquotedMatches_1 = unquotedMatches; _i < unquotedMatches_1.length; _i++) {
        var m = unquotedMatches_1[_i];
        results.push(m.slice(m.indexOf('@') + 1));
    }
    return (0, array_js_1.uniq)(results);
}
function parseAtMentionedFileLines(mention) {
    // Parse mentions like "file.txt#L10-20", "file.txt#heading", or just "file.txt"
    // Supports line ranges (#L10, #L10-20) and strips non-line-range fragments (#heading)
    var match = mention.match(/^([^#]+)(?:#L(\d+)(?:-(\d+))?)?(?:#[^#]*)?$/);
    if (!match) {
        return { filename: mention };
    }
    var filename = match[1], lineStartStr = match[2], lineEndStr = match[3];
    var lineStart = lineStartStr ? parseInt(lineStartStr, 10) : undefined;
    var lineEnd = lineEndStr ? parseInt(lineEndStr, 10) : lineStart;
    return { filename: filename !== null && filename !== void 0 ? filename : mention, lineStart: lineStart, lineEnd: lineEnd };
}
function getDiagnosticAttachments(toolUseContext) {
    return __awaiter(this, void 0, void 0, function () {
        var newDiagnostics;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Diagnostics are only useful if the agent has the Bash tool to act on them
                    if (!toolUseContext.options.tools.some(function (t) { return (0, Tool_js_1.toolMatchesName)(t, toolName_js_1.BASH_TOOL_NAME); })) {
                        return [2 /*return*/, []];
                    }
                    return [4 /*yield*/, diagnosticTracking_js_1.diagnosticTracker.getNewDiagnostics()];
                case 1:
                    newDiagnostics = _a.sent();
                    if (newDiagnostics.length === 0) {
                        return [2 /*return*/, []];
                    }
                    return [2 /*return*/, [
                            {
                                type: 'diagnostics',
                                files: newDiagnostics,
                                isNew: true,
                            },
                        ]];
            }
        });
    });
}
/**
 * Get LSP diagnostic attachments from passive LSP servers.
 * Follows the AsyncHookRegistry pattern for consistent async attachment delivery.
 */
function getLSPDiagnosticAttachments(toolUseContext) {
    return __awaiter(this, void 0, void 0, function () {
        var diagnosticSets, attachments, err;
        return __generator(this, function (_a) {
            // LSP diagnostics are only useful if the agent has the Bash tool to act on them
            if (!toolUseContext.options.tools.some(function (t) { return (0, Tool_js_1.toolMatchesName)(t, toolName_js_1.BASH_TOOL_NAME); })) {
                return [2 /*return*/, []];
            }
            (0, debug_js_2.logForDebugging)('LSP Diagnostics: getLSPDiagnosticAttachments called');
            try {
                diagnosticSets = (0, LSPDiagnosticRegistry_js_1.checkForLSPDiagnostics)();
                if (diagnosticSets.length === 0) {
                    return [2 /*return*/, []];
                }
                (0, debug_js_2.logForDebugging)("LSP Diagnostics: Found ".concat(diagnosticSets.length, " pending diagnostic set(s)"));
                attachments = diagnosticSets.map(function (_a) {
                    var files = _a.files;
                    return ({
                        type: 'diagnostics',
                        files: files,
                        isNew: true,
                    });
                });
                // Clear delivered diagnostics from registry to prevent memory leak
                // Follows same pattern as removeDeliveredAsyncHooks
                if (diagnosticSets.length > 0) {
                    (0, LSPDiagnosticRegistry_js_1.clearAllLSPDiagnostics)();
                    (0, debug_js_2.logForDebugging)("LSP Diagnostics: Cleared ".concat(diagnosticSets.length, " delivered diagnostic(s) from registry"));
                }
                (0, debug_js_2.logForDebugging)("LSP Diagnostics: Returning ".concat(attachments.length, " diagnostic attachment(s)"));
                return [2 /*return*/, attachments];
            }
            catch (error) {
                err = (0, errors_js_1.toError)(error);
                (0, log_js_1.logError)(new Error("Failed to get LSP diagnostic attachments: ".concat(err.message)));
                // Return empty array to allow other attachments to proceed
                return [2 /*return*/, []];
            }
            return [2 /*return*/];
        });
    });
}
function getAttachmentMessages(input, toolUseContext, ideSelection, queuedCommands, messages, querySource, options) {
    return __asyncGenerator(this, arguments, function getAttachmentMessages_1() {
        var attachments, _i, attachments_1, attachment;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, __await(getAttachments(input, toolUseContext, ideSelection, queuedCommands, messages, querySource, options))];
                case 1:
                    attachments = _a.sent();
                    if (!(attachments.length === 0)) return [3 /*break*/, 3];
                    return [4 /*yield*/, __await(void 0)];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    (0, index_js_1.logEvent)('tengu_attachments', {
                        attachment_types: attachments.map(function (_) { return _.type; }),
                    });
                    _i = 0, attachments_1 = attachments;
                    _a.label = 4;
                case 4:
                    if (!(_i < attachments_1.length)) return [3 /*break*/, 8];
                    attachment = attachments_1[_i];
                    return [4 /*yield*/, __await(createAttachmentMessage(attachment))];
                case 5: return [4 /*yield*/, _a.sent()];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 4];
                case 8: return [2 /*return*/];
            }
        });
    });
}
/**
 * Generates a file attachment by reading a file with proper validation and truncation.
 * This is the core file reading logic shared between @-mentioned files and post-compact restoration.
 *
 * @param filename The absolute path to the file to read
 * @param toolUseContext The tool use context for calling FileReadTool
 * @param options Optional configuration for file reading
 * @returns A new_file attachment or null if the file couldn't be read
 */
/**
 * Check if a PDF file should be represented as a lightweight reference
 * instead of being inlined. Returns a PDFReferenceAttachment for large PDFs
 * (more than PDF_AT_MENTION_INLINE_THRESHOLD pages), or null otherwise.
 */
function tryGetPDFReference(filename) {
    return __awaiter(this, void 0, void 0, function () {
        var ext, _a, stats, pageCount, effectivePageCount, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    ext = (0, path_1.parse)(filename).ext.toLowerCase();
                    if (!(0, pdfUtils_js_1.isPDFExtension)(ext)) {
                        return [2 /*return*/, null];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, Promise.all([
                            (0, fsOperations_js_1.getFsImplementation)().stat(filename),
                            (0, pdf_js_1.getPDFPageCount)(filename),
                        ])
                        // Use page count if available, otherwise fall back to size heuristic (~100KB per page)
                    ];
                case 2:
                    _a = _c.sent(), stats = _a[0], pageCount = _a[1];
                    effectivePageCount = pageCount !== null && pageCount !== void 0 ? pageCount : Math.ceil(stats.size / (100 * 1024));
                    if (effectivePageCount > apiLimits_js_1.PDF_AT_MENTION_INLINE_THRESHOLD) {
                        (0, index_js_1.logEvent)('tengu_pdf_reference_attachment', {
                            pageCount: effectivePageCount,
                            fileSize: stats.size,
                            hadPdfinfo: pageCount !== null,
                        });
                        return [2 /*return*/, {
                                type: 'pdf_reference',
                                filename: filename,
                                pageCount: effectivePageCount,
                                fileSize: stats.size,
                                displayPath: (0, path_1.relative)((0, cwd_js_1.getCwd)(), filename),
                            }];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    _b = _c.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, null];
            }
        });
    });
}
function generateFileAttachment(filename, toolUseContext, successEventName, errorEventName, mode, options) {
    return __awaiter(this, void 0, void 0, function () {
        function readTruncatedFile() {
            return __awaiter(this, void 0, void 0, function () {
                var appState, truncatedInput, result, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (mode === 'compact') {
                                return [2 /*return*/, {
                                        type: 'compact_file_reference',
                                        filename: filename,
                                        displayPath: (0, path_1.relative)((0, cwd_js_1.getCwd)(), filename),
                                    }];
                            }
                            appState = toolUseContext.getAppState();
                            if (isFileReadDenied(filename, appState.toolPermissionContext)) {
                                return [2 /*return*/, null];
                            }
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 3, , 4]);
                            truncatedInput = {
                                file_path: filename,
                                offset: offset !== null && offset !== void 0 ? offset : 1,
                                limit: prompt_js_2.MAX_LINES_TO_READ,
                            };
                            return [4 /*yield*/, FileReadTool_js_1.FileReadTool.call(truncatedInput, toolUseContext)];
                        case 2:
                            result = _b.sent();
                            (0, index_js_1.logEvent)(successEventName, {});
                            return [2 /*return*/, {
                                    type: 'file',
                                    filename: filename,
                                    content: result.data,
                                    truncated: true,
                                    displayPath: (0, path_1.relative)((0, cwd_js_1.getCwd)(), filename),
                                }];
                        case 3:
                            _a = _b.sent();
                            (0, index_js_1.logEvent)(errorEventName, {});
                            return [2 /*return*/, null];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        }
        var _a, offset, limit, appState, ext, stats, _b, pdfRef, existingFileState, mtimeMs, _c, fileInput, isValid, result, error_3, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _a = options !== null && options !== void 0 ? options : {}, offset = _a.offset, limit = _a.limit;
                    appState = toolUseContext.getAppState();
                    if (isFileReadDenied(filename, appState.toolPermissionContext)) {
                        return [2 /*return*/, null];
                    }
                    if (!(mode === 'at-mention' &&
                        !(0, file_js_1.isFileWithinReadSizeLimit)(filename, (0, limits_js_1.getDefaultFileReadingLimits)().maxSizeBytes))) return [3 /*break*/, 4];
                    ext = (0, path_1.parse)(filename).ext.toLowerCase();
                    if (!!(0, pdfUtils_js_1.isPDFExtension)(ext)) return [3 /*break*/, 4];
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, fsOperations_js_1.getFsImplementation)().stat(filename)];
                case 2:
                    stats = _e.sent();
                    (0, index_js_1.logEvent)('tengu_attachment_file_too_large', {
                        size_bytes: stats.size,
                        mode: mode,
                    });
                    return [2 /*return*/, null];
                case 3:
                    _b = _e.sent();
                    return [3 /*break*/, 4];
                case 4:
                    if (!(mode === 'at-mention')) return [3 /*break*/, 6];
                    return [4 /*yield*/, tryGetPDFReference(filename)];
                case 5:
                    pdfRef = _e.sent();
                    if (pdfRef) {
                        return [2 /*return*/, pdfRef];
                    }
                    _e.label = 6;
                case 6:
                    existingFileState = toolUseContext.readFileState.get(filename);
                    if (!(existingFileState && mode === 'at-mention')) return [3 /*break*/, 10];
                    _e.label = 7;
                case 7:
                    _e.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, (0, file_js_1.getFileModificationTimeAsync)(filename)
                        // Handle timestamp format inconsistency:
                        // - FileReadTool stores Date.now() (current time when read)
                        // - FileEdit/WriteTools store mtimeMs (file modification time)
                        //
                        // If timestamp > mtimeMs, it was stored by FileReadTool using Date.now()
                        // In this case, we should not use the optimization since we can't reliably
                        // compare modification times. Only use optimization when timestamp <= mtimeMs,
                        // indicating it was stored by FileEdit/WriteTool with actual mtimeMs.
                    ];
                case 8:
                    mtimeMs = _e.sent();
                    // Handle timestamp format inconsistency:
                    // - FileReadTool stores Date.now() (current time when read)
                    // - FileEdit/WriteTools store mtimeMs (file modification time)
                    //
                    // If timestamp > mtimeMs, it was stored by FileReadTool using Date.now()
                    // In this case, we should not use the optimization since we can't reliably
                    // compare modification times. Only use optimization when timestamp <= mtimeMs,
                    // indicating it was stored by FileEdit/WriteTool with actual mtimeMs.
                    if (existingFileState.timestamp <= mtimeMs &&
                        mtimeMs === existingFileState.timestamp) {
                        // File hasn't been modified, return already_read_file attachment
                        // This tells the system the file is already in context and doesn't need to be sent to API
                        (0, index_js_1.logEvent)(successEventName, {});
                        return [2 /*return*/, {
                                type: 'already_read_file',
                                filename: filename,
                                displayPath: (0, path_1.relative)((0, cwd_js_1.getCwd)(), filename),
                                content: {
                                    type: 'text',
                                    file: {
                                        filePath: filename,
                                        content: existingFileState.content,
                                        numLines: (0, stringUtils_js_1.countCharInString)(existingFileState.content, '\n') + 1,
                                        startLine: offset !== null && offset !== void 0 ? offset : 1,
                                        totalLines: (0, stringUtils_js_1.countCharInString)(existingFileState.content, '\n') + 1,
                                    },
                                },
                            }];
                    }
                    return [3 /*break*/, 10];
                case 9:
                    _c = _e.sent();
                    return [3 /*break*/, 10];
                case 10:
                    _e.trys.push([10, 18, , 19]);
                    fileInput = {
                        file_path: filename,
                        offset: offset,
                        limit: limit,
                    };
                    return [4 /*yield*/, FileReadTool_js_1.FileReadTool.validateInput(fileInput, toolUseContext)];
                case 11:
                    isValid = _e.sent();
                    if (!isValid.result) {
                        return [2 /*return*/, null];
                    }
                    _e.label = 12;
                case 12:
                    _e.trys.push([12, 14, , 17]);
                    return [4 /*yield*/, FileReadTool_js_1.FileReadTool.call(fileInput, toolUseContext)];
                case 13:
                    result = _e.sent();
                    (0, index_js_1.logEvent)(successEventName, {});
                    return [2 /*return*/, {
                            type: 'file',
                            filename: filename,
                            content: result.data,
                            displayPath: (0, path_1.relative)((0, cwd_js_1.getCwd)(), filename),
                        }];
                case 14:
                    error_3 = _e.sent();
                    if (!(error_3 instanceof FileReadTool_js_1.MaxFileReadTokenExceededError ||
                        error_3 instanceof readFileInRange_js_1.FileTooLargeError)) return [3 /*break*/, 16];
                    return [4 /*yield*/, readTruncatedFile()];
                case 15: return [2 /*return*/, _e.sent()];
                case 16: throw error_3;
                case 17: return [3 /*break*/, 19];
                case 18:
                    _d = _e.sent();
                    (0, index_js_1.logEvent)(errorEventName, {});
                    return [2 /*return*/, null];
                case 19: return [2 /*return*/];
            }
        });
    });
}
function createAttachmentMessage(attachment) {
    return {
        attachment: attachment,
        type: 'attachment',
        uuid: (0, crypto_1.randomUUID)(),
        timestamp: new Date().toISOString(),
    };
}
function getTodoReminderTurnCounts(messages) {
    var _a;
    var lastTodoWriteIndex = -1;
    var lastReminderIndex = -1;
    var assistantTurnsSinceWrite = 0;
    var assistantTurnsSinceReminder = 0;
    // Iterate backwards to find most recent events
    for (var i = messages.length - 1; i >= 0; i--) {
        var message = messages[i];
        if ((message === null || message === void 0 ? void 0 : message.type) === 'assistant') {
            if ((0, messages_js_1.isThinkingMessage)(message)) {
                // Skip thinking messages
                continue;
            }
            // Check for TodoWrite usage BEFORE incrementing counter
            // (we don't want to count the TodoWrite message itself as "1 turn since write")
            if (lastTodoWriteIndex === -1 &&
                'message' in message &&
                Array.isArray((_a = message.message) === null || _a === void 0 ? void 0 : _a.content) &&
                message.message.content.some(function (block) { return block.type === 'tool_use' && block.name === 'TodoWrite'; })) {
                lastTodoWriteIndex = i;
            }
            // Count assistant turns before finding events
            if (lastTodoWriteIndex === -1)
                assistantTurnsSinceWrite++;
            if (lastReminderIndex === -1)
                assistantTurnsSinceReminder++;
        }
        else if (lastReminderIndex === -1 &&
            (message === null || message === void 0 ? void 0 : message.type) === 'attachment' &&
            message.attachment.type === 'todo_reminder') {
            lastReminderIndex = i;
        }
        if (lastTodoWriteIndex !== -1 && lastReminderIndex !== -1) {
            break;
        }
    }
    return {
        turnsSinceLastTodoWrite: assistantTurnsSinceWrite,
        turnsSinceLastReminder: assistantTurnsSinceReminder,
    };
}
function getTodoReminderAttachments(messages, toolUseContext) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, turnsSinceLastTodoWrite, turnsSinceLastReminder, todoKey, appState, todos;
        var _b, _c;
        return __generator(this, function (_d) {
            // Skip if TodoWrite tool is not available
            if (!toolUseContext.options.tools.some(function (t) {
                return (0, Tool_js_1.toolMatchesName)(t, constants_js_1.TODO_WRITE_TOOL_NAME);
            })) {
                return [2 /*return*/, []];
            }
            // When SendUserMessage is in the toolkit, it's the primary communication
            // channel and the model is always told to use it (#20467). TodoWrite
            // becomes a side channel — nudging the model about it conflicts with the
            // brief workflow. The tool itself stays available; this only gates the
            // "you haven't used it in a while" nag.
            if (BRIEF_TOOL_NAME &&
                toolUseContext.options.tools.some(function (t) { return (0, Tool_js_1.toolMatchesName)(t, BRIEF_TOOL_NAME); })) {
                return [2 /*return*/, []];
            }
            // Skip if no messages provided
            if (!messages || messages.length === 0) {
                return [2 /*return*/, []];
            }
            _a = getTodoReminderTurnCounts(messages), turnsSinceLastTodoWrite = _a.turnsSinceLastTodoWrite, turnsSinceLastReminder = _a.turnsSinceLastReminder;
            // Check if we should show a reminder
            if (turnsSinceLastTodoWrite >= exports.TODO_REMINDER_CONFIG.TURNS_SINCE_WRITE &&
                turnsSinceLastReminder >= exports.TODO_REMINDER_CONFIG.TURNS_BETWEEN_REMINDERS) {
                todoKey = (_b = toolUseContext.agentId) !== null && _b !== void 0 ? _b : (0, state_js_2.getSessionId)();
                appState = toolUseContext.getAppState();
                todos = (_c = appState.todos[todoKey]) !== null && _c !== void 0 ? _c : [];
                return [2 /*return*/, [
                        {
                            type: 'todo_reminder',
                            content: todos,
                            itemCount: todos.length,
                        },
                    ]];
            }
            return [2 /*return*/, []];
        });
    });
}
function getTaskReminderTurnCounts(messages) {
    var _a;
    var lastTaskManagementIndex = -1;
    var lastReminderIndex = -1;
    var assistantTurnsSinceTaskManagement = 0;
    var assistantTurnsSinceReminder = 0;
    // Iterate backwards to find most recent events
    for (var i = messages.length - 1; i >= 0; i--) {
        var message = messages[i];
        if ((message === null || message === void 0 ? void 0 : message.type) === 'assistant') {
            if ((0, messages_js_1.isThinkingMessage)(message)) {
                // Skip thinking messages
                continue;
            }
            // Check for TaskCreate or TaskUpdate usage BEFORE incrementing counter
            if (lastTaskManagementIndex === -1 &&
                'message' in message &&
                Array.isArray((_a = message.message) === null || _a === void 0 ? void 0 : _a.content) &&
                message.message.content.some(function (block) {
                    return block.type === 'tool_use' &&
                        (block.name === constants_js_2.TASK_CREATE_TOOL_NAME ||
                            block.name === constants_js_3.TASK_UPDATE_TOOL_NAME);
                })) {
                lastTaskManagementIndex = i;
            }
            // Count assistant turns before finding events
            if (lastTaskManagementIndex === -1)
                assistantTurnsSinceTaskManagement++;
            if (lastReminderIndex === -1)
                assistantTurnsSinceReminder++;
        }
        else if (lastReminderIndex === -1 &&
            (message === null || message === void 0 ? void 0 : message.type) === 'attachment' &&
            message.attachment.type === 'task_reminder') {
            lastReminderIndex = i;
        }
        if (lastTaskManagementIndex !== -1 && lastReminderIndex !== -1) {
            break;
        }
    }
    return {
        turnsSinceLastTaskManagement: assistantTurnsSinceTaskManagement,
        turnsSinceLastReminder: assistantTurnsSinceReminder,
    };
}
function getTaskReminderAttachments(messages, toolUseContext) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, turnsSinceLastTaskManagement, turnsSinceLastReminder, tasks;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!(0, tasks_js_1.isTodoV2Enabled)()) {
                        return [2 /*return*/, []];
                    }
                    // Skip for ant users
                    if (process.env.USER_TYPE === 'ant') {
                        return [2 /*return*/, []];
                    }
                    // When SendUserMessage is in the toolkit, it's the primary communication
                    // channel and the model is always told to use it (#20467). TaskUpdate
                    // becomes a side channel — nudging the model about it conflicts with the
                    // brief workflow. The tool itself stays available; this only gates the nag.
                    if (BRIEF_TOOL_NAME &&
                        toolUseContext.options.tools.some(function (t) { return (0, Tool_js_1.toolMatchesName)(t, BRIEF_TOOL_NAME); })) {
                        return [2 /*return*/, []];
                    }
                    // Skip if TaskUpdate tool is not available
                    if (!toolUseContext.options.tools.some(function (t) {
                        return (0, Tool_js_1.toolMatchesName)(t, constants_js_3.TASK_UPDATE_TOOL_NAME);
                    })) {
                        return [2 /*return*/, []];
                    }
                    // Skip if no messages provided
                    if (!messages || messages.length === 0) {
                        return [2 /*return*/, []];
                    }
                    _a = getTaskReminderTurnCounts(messages), turnsSinceLastTaskManagement = _a.turnsSinceLastTaskManagement, turnsSinceLastReminder = _a.turnsSinceLastReminder;
                    if (!(turnsSinceLastTaskManagement >= exports.TODO_REMINDER_CONFIG.TURNS_SINCE_WRITE &&
                        turnsSinceLastReminder >= exports.TODO_REMINDER_CONFIG.TURNS_BETWEEN_REMINDERS)) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, tasks_js_1.listTasks)((0, tasks_js_1.getTaskListId)())];
                case 1:
                    tasks = _b.sent();
                    return [2 /*return*/, [
                            {
                                type: 'task_reminder',
                                content: tasks,
                                itemCount: tasks.length,
                            },
                        ]];
                case 2: return [2 /*return*/, []];
            }
        });
    });
}
/**
 * Get attachments for all unified tasks using the Task framework.
 * Replaces the old getBackgroundShellAttachments, getBackgroundRemoteSessionAttachments,
 * and getAsyncAgentAttachments functions.
 */
function getUnifiedTaskAttachments(toolUseContext) {
    return __awaiter(this, void 0, void 0, function () {
        var appState, _a, attachments, updatedTaskOffsets, evictedTaskIds;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    appState = toolUseContext.getAppState();
                    return [4 /*yield*/, (0, framework_js_1.generateTaskAttachments)(appState)];
                case 1:
                    _a = _b.sent(), attachments = _a.attachments, updatedTaskOffsets = _a.updatedTaskOffsets, evictedTaskIds = _a.evictedTaskIds;
                    (0, framework_js_1.applyTaskOffsetsAndEvictions)(toolUseContext.setAppState, updatedTaskOffsets, evictedTaskIds);
                    // Convert TaskAttachment to Attachment format
                    return [2 /*return*/, attachments.map(function (taskAttachment) { return ({
                            type: 'task_status',
                            taskId: taskAttachment.taskId,
                            taskType: taskAttachment.taskType,
                            status: taskAttachment.status,
                            description: taskAttachment.description,
                            deltaSummary: taskAttachment.deltaSummary,
                            outputFilePath: (0, diskOutput_js_1.getTaskOutputPath)(taskAttachment.taskId),
                        }); })];
            }
        });
    });
}
function getAsyncHookResponseAttachments() {
    return __awaiter(this, void 0, void 0, function () {
        var responses, attachments, processIds;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, AsyncHookRegistry_js_1.checkForAsyncHookResponses)()];
                case 1:
                    responses = _a.sent();
                    if (responses.length === 0) {
                        return [2 /*return*/, []];
                    }
                    (0, debug_js_2.logForDebugging)("Hooks: getAsyncHookResponseAttachments found ".concat(responses.length, " responses"));
                    attachments = responses.map(function (_a) {
                        var processId = _a.processId, response = _a.response, hookName = _a.hookName, hookEvent = _a.hookEvent, toolName = _a.toolName, pluginId = _a.pluginId, stdout = _a.stdout, stderr = _a.stderr, exitCode = _a.exitCode;
                        (0, debug_js_2.logForDebugging)("Hooks: Creating attachment for ".concat(processId, " (").concat(hookName, "): ").concat((0, slowOperations_js_1.jsonStringify)(response)));
                        return {
                            type: 'async_hook_response',
                            processId: processId,
                            hookName: hookName,
                            hookEvent: hookEvent,
                            toolName: toolName,
                            response: response,
                            stdout: stdout,
                            stderr: stderr,
                            exitCode: exitCode,
                        };
                    });
                    // Remove delivered hooks from registry to prevent re-processing
                    if (responses.length > 0) {
                        processIds = responses.map(function (r) { return r.processId; });
                        (0, AsyncHookRegistry_js_1.removeDeliveredAsyncHooks)(processIds);
                        (0, debug_js_2.logForDebugging)("Hooks: Removed ".concat(processIds.length, " delivered hooks from registry"));
                    }
                    (0, debug_js_2.logForDebugging)("Hooks: getAsyncHookResponseAttachments found ".concat(attachments.length, " attachments"));
                    return [2 /*return*/, attachments];
            }
        });
    });
}
/**
 * Get teammate mailbox attachments for agent swarm communication
 * Teammates are independent Claude Code sessions running in parallel (swarms),
 * not parent-child subagent relationships.
 *
 * This function checks two sources for messages:
 * 1. File-based mailbox (for messages that arrived between polls)
 * 2. AppState.inbox (for messages queued mid-turn by useInboxPoller)
 *
 * Messages from AppState.inbox are delivered mid-turn as attachments,
 * allowing teammates to receive messages without waiting for the turn to end.
 */
function getTeammateMailboxAttachments(toolUseContext) {
    return __awaiter(this, void 0, void 0, function () {
        var appState, envAgentName, teamName, teamLeadStatus, viewedTeammate, agentName, leadAgentId, allUnreadMessages, unreadMessages, pendingInboxMessages, seen, allMessages, _i, _a, m, key, idleAgentByIndex, latestIdleByAgent, i, idle, beforeCount, attachment, _loop_1, _b, allMessages_1, m, pendingIds_1;
        var _c, _d, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    if (!(0, agentSwarmsEnabled_js_1.isAgentSwarmsEnabled)()) {
                        return [2 /*return*/, []];
                    }
                    if (process.env.USER_TYPE !== 'ant') {
                        return [2 /*return*/, []];
                    }
                    appState = toolUseContext.getAppState();
                    envAgentName = (0, teammate_js_1.getAgentName)();
                    teamName = (0, teammate_js_1.getTeamName)(appState.teamContext);
                    teamLeadStatus = (0, teammate_js_1.isTeamLead)(appState.teamContext);
                    viewedTeammate = (0, selectors_js_1.getViewedTeammateTask)(appState);
                    agentName = (_c = viewedTeammate === null || viewedTeammate === void 0 ? void 0 : viewedTeammate.identity.agentName) !== null && _c !== void 0 ? _c : envAgentName;
                    if (!agentName && teamLeadStatus && appState.teamContext) {
                        leadAgentId = appState.teamContext.leadAgentId;
                        // Look up the lead's name from agents map (not the UUID)
                        agentName = ((_d = appState.teamContext.teammates[leadAgentId]) === null || _d === void 0 ? void 0 : _d.name) || 'team-lead';
                    }
                    (0, debug_js_2.logForDebugging)("[SwarmMailbox] getTeammateMailboxAttachments called: envAgentName=".concat(envAgentName, ", isTeamLead=").concat(teamLeadStatus, ", resolved agentName=").concat(agentName, ", teamName=").concat(teamName));
                    // Only check inbox if running as an agent in a swarm or team lead
                    if (!agentName) {
                        (0, debug_js_2.logForDebugging)("[SwarmMailbox] Not checking inbox - not in a swarm or team lead");
                        return [2 /*return*/, []];
                    }
                    (0, debug_js_2.logForDebugging)("[SwarmMailbox] Checking inbox for agent=\"".concat(agentName, "\" team=\"").concat(teamName || 'default', "\""));
                    return [4 /*yield*/, (0, teammateMailbox_js_1.readUnreadMessages)(agentName, teamName)];
                case 1:
                    allUnreadMessages = _g.sent();
                    unreadMessages = allUnreadMessages.filter(function (m) { return !(0, teammateMailbox_js_1.isStructuredProtocolMessage)(m.text); });
                    (0, debug_js_2.logForDebugging)("[MailboxBridge] Found ".concat(allUnreadMessages.length, " unread message(s) for \"").concat(agentName, "\" (").concat(allUnreadMessages.length - unreadMessages.length, " structured protocol messages filtered out)"));
                    pendingInboxMessages = viewedTeammate || (0, teammateContext_js_1.isInProcessTeammate)()
                        ? [] // Viewing teammate or running as in-process teammate - don't show leader's inbox
                        : appState.inbox.messages.filter(function (m) { return m.status === 'pending'; });
                    (0, debug_js_2.logForDebugging)("[SwarmMailbox] Found ".concat(pendingInboxMessages.length, " pending message(s) in AppState.inbox"));
                    seen = new Set();
                    allMessages = [];
                    for (_i = 0, _a = __spreadArray(__spreadArray([], unreadMessages, true), pendingInboxMessages, true); _i < _a.length; _i++) {
                        m = _a[_i];
                        key = "".concat(m.from, "|").concat(m.timestamp, "|").concat(m.text.slice(0, 100));
                        if (!seen.has(key)) {
                            seen.add(key);
                            allMessages.push({
                                from: m.from,
                                text: m.text,
                                timestamp: m.timestamp,
                                color: m.color,
                                summary: m.summary,
                            });
                        }
                    }
                    idleAgentByIndex = new Map();
                    latestIdleByAgent = new Map();
                    for (i = 0; i < allMessages.length; i++) {
                        idle = (0, teammateMailbox_js_1.isIdleNotification)(allMessages[i].text);
                        if (idle) {
                            idleAgentByIndex.set(i, idle.from);
                            latestIdleByAgent.set(idle.from, i);
                        }
                    }
                    if (idleAgentByIndex.size > latestIdleByAgent.size) {
                        beforeCount = allMessages.length;
                        allMessages = allMessages.filter(function (_m, i) {
                            var agent = idleAgentByIndex.get(i);
                            if (agent === undefined)
                                return true;
                            return latestIdleByAgent.get(agent) === i;
                        });
                        (0, debug_js_2.logForDebugging)("[SwarmMailbox] Collapsed ".concat(beforeCount - allMessages.length, " duplicate idle notification(s)"));
                    }
                    if (allMessages.length === 0) {
                        (0, debug_js_2.logForDebugging)("[SwarmMailbox] No messages to deliver, returning empty");
                        return [2 /*return*/, []];
                    }
                    (0, debug_js_2.logForDebugging)("[SwarmMailbox] Returning ".concat(allMessages.length, " message(s) as attachment for \"").concat(agentName, "\" (").concat(unreadMessages.length, " from file, ").concat(pendingInboxMessages.length, " from AppState, after dedup)"));
                    attachment = [
                        {
                            type: 'teammate_mailbox',
                            messages: allMessages,
                        },
                    ];
                    if (!(unreadMessages.length > 0)) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, teammateMailbox_js_1.markMessagesAsReadByPredicate)(agentName, function (m) { return !(0, teammateMailbox_js_1.isStructuredProtocolMessage)(m.text); }, teamName)];
                case 2:
                    _g.sent();
                    (0, debug_js_2.logForDebugging)("[MailboxBridge] marked ".concat(unreadMessages.length, " non-structured message(s) as read for agent=\"").concat(agentName, "\" team=\"").concat(teamName || 'default', "\""));
                    _g.label = 3;
                case 3:
                    if (!(teamLeadStatus && teamName)) return [3 /*break*/, 7];
                    _loop_1 = function (m) {
                        var shutdownApproval, teammateToRemove_1, teammateId_1;
                        return __generator(this, function (_h) {
                            switch (_h.label) {
                                case 0:
                                    shutdownApproval = (0, teammateMailbox_js_1.isShutdownApproved)(m.text);
                                    if (!shutdownApproval) return [3 /*break*/, 2];
                                    teammateToRemove_1 = shutdownApproval.from;
                                    (0, debug_js_2.logForDebugging)("[SwarmMailbox] Processing shutdown_approved from ".concat(teammateToRemove_1));
                                    teammateId_1 = ((_e = appState.teamContext) === null || _e === void 0 ? void 0 : _e.teammates)
                                        ? (_f = Object.entries(appState.teamContext.teammates).find(function (_a) {
                                            var t = _a[1];
                                            return t.name === teammateToRemove_1;
                                        })) === null || _f === void 0 ? void 0 : _f[0]
                                        : undefined;
                                    if (!teammateId_1) return [3 /*break*/, 2];
                                    // Remove from team file
                                    (0, teamHelpers_js_1.removeTeammateFromTeamFile)(teamName, {
                                        agentId: teammateId_1,
                                        name: teammateToRemove_1,
                                    });
                                    (0, debug_js_2.logForDebugging)("[SwarmMailbox] Removed ".concat(teammateToRemove_1, " from team file"));
                                    // Unassign tasks owned by this teammate
                                    return [4 /*yield*/, (0, tasks_js_2.unassignTeammateTasks)(teamName, teammateId_1, teammateToRemove_1, 'shutdown')
                                        // Remove from teamContext in AppState
                                    ];
                                case 1:
                                    // Unassign tasks owned by this teammate
                                    _h.sent();
                                    // Remove from teamContext in AppState
                                    toolUseContext.setAppState(function (prev) {
                                        var _a;
                                        if (!((_a = prev.teamContext) === null || _a === void 0 ? void 0 : _a.teammates))
                                            return prev;
                                        if (!(teammateId_1 in prev.teamContext.teammates))
                                            return prev;
                                        var _b = prev.teamContext.teammates, _c = teammateId_1, _ = _b[_c], remainingTeammates = __rest(_b, [typeof _c === "symbol" ? _c : _c + ""]);
                                        return __assign(__assign({}, prev), { teamContext: __assign(__assign({}, prev.teamContext), { teammates: remainingTeammates }) });
                                    });
                                    _h.label = 2;
                                case 2: return [2 /*return*/];
                            }
                        });
                    };
                    _b = 0, allMessages_1 = allMessages;
                    _g.label = 4;
                case 4:
                    if (!(_b < allMessages_1.length)) return [3 /*break*/, 7];
                    m = allMessages_1[_b];
                    return [5 /*yield**/, _loop_1(m)];
                case 5:
                    _g.sent();
                    _g.label = 6;
                case 6:
                    _b++;
                    return [3 /*break*/, 4];
                case 7:
                    // Mark AppState inbox messages as processed LAST, after attachment is built
                    // This ensures messages aren't lost if earlier operations fail
                    if (pendingInboxMessages.length > 0) {
                        pendingIds_1 = new Set(pendingInboxMessages.map(function (m) { return m.id; }));
                        toolUseContext.setAppState(function (prev) { return (__assign(__assign({}, prev), { inbox: {
                                messages: prev.inbox.messages.map(function (m) {
                                    return pendingIds_1.has(m.id) ? __assign(__assign({}, m), { status: 'processed' }) : m;
                                }),
                            } })); });
                    }
                    return [2 /*return*/, attachment];
            }
        });
    });
}
/**
 * Get team context attachment for teammates in a swarm.
 * Only injected on the first turn to provide team coordination instructions.
 */
function getTeamContextAttachment(messages) {
    var teamName = (0, teammate_js_1.getTeamName)();
    var agentId = (0, teammate_js_1.getAgentId)();
    var agentName = (0, teammate_js_1.getAgentName)();
    // Only inject for teammates (not team lead or non-team sessions)
    if (!teamName || !agentId) {
        return [];
    }
    // Only inject on first turn - check if there are no assistant messages yet
    var hasAssistantMessage = messages.some(function (m) { return m.type === 'assistant'; });
    if (hasAssistantMessage) {
        return [];
    }
    var configDir = (0, envUtils_js_1.getClaudeConfigHomeDir)();
    var teamConfigPath = "".concat(configDir, "/teams/").concat(teamName, "/config.json");
    var taskListPath = "".concat(configDir, "/tasks/").concat(teamName, "/");
    return [
        {
            type: 'team_context',
            agentId: agentId,
            agentName: agentName || agentId,
            teamName: teamName,
            teamConfigPath: teamConfigPath,
            taskListPath: taskListPath,
        },
    ];
}
function getTokenUsageAttachment(messages, model) {
    if (!(0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_ENABLE_TOKEN_USAGE_ATTACHMENT)) {
        return [];
    }
    var contextWindow = (0, autoCompact_js_1.getEffectiveContextWindowSize)(model);
    var usedTokens = (0, tokens_js_1.tokenCountFromLastAPIResponse)(messages);
    return [
        {
            type: 'token_usage',
            used: usedTokens,
            total: contextWindow,
            remaining: contextWindow - usedTokens,
        },
    ];
}
function getOutputTokenUsageAttachment() {
    if ((0, bun_bundle_1.feature)('TOKEN_BUDGET')) {
        var budget = (0, state_js_2.getCurrentTurnTokenBudget)();
        if (budget === null || budget <= 0) {
            return [];
        }
        return [
            {
                type: 'output_token_usage',
                turn: (0, state_js_2.getTurnOutputTokens)(),
                session: (0, state_js_2.getTotalOutputTokens)(),
                budget: budget,
            },
        ];
    }
    return [];
}
function getMaxBudgetUsdAttachment(maxBudgetUsd) {
    if (maxBudgetUsd === undefined) {
        return [];
    }
    var usedCost = (0, state_js_2.getTotalCostUSD)();
    var remainingBudget = maxBudgetUsd - usedCost;
    return [
        {
            type: 'budget_usd',
            used: usedCost,
            total: maxBudgetUsd,
            remaining: remainingBudget,
        },
    ];
}
/**
 * Count human turns since plan mode exit (plan_mode_exit attachment).
 * Returns 0 if no plan_mode_exit attachment found.
 *
 * tool_result messages are type:'user' without isMeta, so filter by
 * toolUseResult to avoid counting them — otherwise the 10-turn reminder
 * interval fires every ~10 tool calls instead of ~10 human turns.
 */
function getVerifyPlanReminderTurnCount(messages) {
    var turnCount = 0;
    for (var i = messages.length - 1; i >= 0; i--) {
        var message = messages[i];
        if (message && (0, messagePredicates_js_1.isHumanTurn)(message)) {
            turnCount++;
        }
        // Stop counting at plan_mode_exit attachment (marks when implementation started)
        if ((message === null || message === void 0 ? void 0 : message.type) === 'attachment' &&
            message.attachment.type === 'plan_mode_exit') {
            return turnCount;
        }
    }
    // No plan_mode_exit found
    return 0;
}
/**
 * Get verify plan reminder attachment if the model hasn't called VerifyPlanExecution yet.
 */
function getVerifyPlanReminderAttachment(messages, toolUseContext) {
    return __awaiter(this, void 0, void 0, function () {
        var appState, pending, turnCount;
        return __generator(this, function (_a) {
            if (process.env.USER_TYPE !== 'ant' ||
                !(0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_VERIFY_PLAN)) {
                return [2 /*return*/, []];
            }
            appState = toolUseContext.getAppState();
            pending = appState.pendingPlanVerification;
            // Only remind if plan exists and verification not started or completed
            if (!pending ||
                pending.verificationStarted ||
                pending.verificationCompleted) {
                return [2 /*return*/, []];
            }
            // Only remind every N turns
            if (messages && messages.length > 0) {
                turnCount = getVerifyPlanReminderTurnCount(messages);
                if (turnCount === 0 ||
                    turnCount % exports.VERIFY_PLAN_REMINDER_CONFIG.TURNS_BETWEEN_REMINDERS !== 0) {
                    return [2 /*return*/, []];
                }
            }
            return [2 /*return*/, [{ type: 'verify_plan_reminder' }]];
        });
    });
}
function getCompactionReminderAttachment(messages, model) {
    if (!(0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_marble_fox', false)) {
        return [];
    }
    if (!(0, autoCompact_js_1.isAutoCompactEnabled)()) {
        return [];
    }
    var contextWindow = (0, context_js_1.getContextWindowForModel)(model, (0, state_js_2.getSdkBetas)());
    if (contextWindow < 1000000) {
        return [];
    }
    var effectiveWindow = (0, autoCompact_js_1.getEffectiveContextWindowSize)(model);
    var usedTokens = (0, tokens_js_1.tokenCountWithEstimation)(messages);
    if (usedTokens < effectiveWindow * 0.25) {
        return [];
    }
    return [{ type: 'compaction_reminder' }];
}
/**
 * Context-efficiency nudge. Injected after every N tokens of growth without
 * a snip. Pacing is handled entirely by shouldNudgeForSnips — the 10k
 * interval resets on prior nudges, snip markers, snip boundaries, and
 * compact boundaries.
 */
function getContextEfficiencyAttachment(messages) {
    if (!(0, bun_bundle_1.feature)('HISTORY_SNIP')) {
        return [];
    }
    // Gate must match SnipTool.isEnabled() — don't nudge toward a tool that
    // isn't in the tool list. Lazy require keeps this file snip-string-free.
    var _a = 
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('../services/compact/snipCompact.js'), isSnipRuntimeEnabled = _a.isSnipRuntimeEnabled, shouldNudgeForSnips = _a.shouldNudgeForSnips;
    if (!isSnipRuntimeEnabled()) {
        return [];
    }
    if (!shouldNudgeForSnips(messages)) {
        return [];
    }
    return [{ type: 'context_efficiency' }];
}
function isFileReadDenied(filePath, toolPermissionContext) {
    var denyRule = (0, filesystem_js_1.matchingRuleForInput)(filePath, toolPermissionContext, 'read', 'deny');
    return denyRule !== null;
}
