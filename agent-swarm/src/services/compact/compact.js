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
exports.ERROR_MESSAGE_INCOMPLETE_RESPONSE = exports.ERROR_MESSAGE_USER_ABORT = exports.ERROR_MESSAGE_PROMPT_TOO_LONG = exports.ERROR_MESSAGE_NOT_ENOUGH_MESSAGES = exports.POST_COMPACT_SKILLS_TOKEN_BUDGET = exports.POST_COMPACT_MAX_TOKENS_PER_SKILL = exports.POST_COMPACT_MAX_TOKENS_PER_FILE = exports.POST_COMPACT_TOKEN_BUDGET = exports.POST_COMPACT_MAX_FILES_TO_RESTORE = void 0;
exports.stripImagesFromMessages = stripImagesFromMessages;
exports.stripReinjectedAttachments = stripReinjectedAttachments;
exports.truncateHeadForPTLRetry = truncateHeadForPTLRetry;
exports.buildPostCompactMessages = buildPostCompactMessages;
exports.annotateBoundaryWithPreservedSegment = annotateBoundaryWithPreservedSegment;
exports.mergeHookInstructions = mergeHookInstructions;
exports.compactConversation = compactConversation;
exports.partialCompactConversation = partialCompactConversation;
exports.createCompactCanUseTool = createCompactCanUseTool;
exports.createPostCompactFileAttachments = createPostCompactFileAttachments;
exports.createPlanAttachmentIfNeeded = createPlanAttachmentIfNeeded;
exports.createSkillAttachmentIfNeeded = createSkillAttachmentIfNeeded;
exports.createPlanModeAttachmentIfNeeded = createPlanModeAttachmentIfNeeded;
exports.createAsyncAgentAttachmentsIfNeeded = createAsyncAgentAttachmentsIfNeeded;
var bun_bundle_1 = require("bun:bundle");
var uniqBy_js_1 = require("lodash-es/uniqBy.js");
/* eslint-disable @typescript-eslint/no-require-imports */
var sessionTranscriptModule = (0, bun_bundle_1.feature)('KAIROS')
    ? require('../sessionTranscript/sessionTranscript.js')
    : null;
var sdk_1 = require("@anthropic-ai/sdk");
var state_js_1 = require("src/bootstrap/state.js");
var state_js_2 = require("../../bootstrap/state.js");
var FileReadTool_js_1 = require("../../tools/FileReadTool/FileReadTool.js");
var prompt_js_1 = require("../../tools/FileReadTool/prompt.js");
var ToolSearchTool_js_1 = require("../../tools/ToolSearchTool/ToolSearchTool.js");
var attachments_js_1 = require("../../utils/attachments.js");
var config_js_1 = require("../../utils/config.js");
var context_js_1 = require("../../utils/context.js");
var contextAnalysis_js_1 = require("../../utils/contextAnalysis.js");
var debug_js_1 = require("../../utils/debug.js");
var errors_js_1 = require("../../utils/errors.js");
var fileStateCache_js_1 = require("../../utils/fileStateCache.js");
var forkedAgent_js_1 = require("../../utils/forkedAgent.js");
var hooks_js_1 = require("../../utils/hooks.js");
var log_js_1 = require("../../utils/log.js");
var types_js_1 = require("../../utils/memory/types.js");
var messages_js_1 = require("../../utils/messages.js");
var path_js_1 = require("../../utils/path.js");
var plans_js_1 = require("../../utils/plans.js");
var sessionActivity_js_1 = require("../../utils/sessionActivity.js");
var sessionStart_js_1 = require("../../utils/sessionStart.js");
var sessionStorage_js_1 = require("../../utils/sessionStorage.js");
var sleep_js_1 = require("../../utils/sleep.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
/* eslint-enable @typescript-eslint/no-require-imports */
var systemPromptType_js_1 = require("../../utils/systemPromptType.js");
var diskOutput_js_1 = require("../../utils/task/diskOutput.js");
var tokens_js_1 = require("../../utils/tokens.js");
var toolSearch_js_1 = require("../../utils/toolSearch.js");
var growthbook_js_1 = require("../analytics/growthbook.js");
var index_js_1 = require("../analytics/index.js");
var claude_js_1 = require("../api/claude.js");
var errors_js_2 = require("../api/errors.js");
var promptCacheBreakDetection_js_1 = require("../api/promptCacheBreakDetection.js");
var withRetry_js_1 = require("../api/withRetry.js");
var internalLogging_js_1 = require("../internalLogging.js");
var tokenEstimation_js_1 = require("../tokenEstimation.js");
var grouping_js_1 = require("./grouping.js");
var prompt_js_2 = require("./prompt.js");
exports.POST_COMPACT_MAX_FILES_TO_RESTORE = 5;
exports.POST_COMPACT_TOKEN_BUDGET = 50000;
exports.POST_COMPACT_MAX_TOKENS_PER_FILE = 5000;
// Skills can be large (verify=18.7KB, claude-api=20.1KB). Previously re-injected
// unbounded on every compact → 5-10K tok/compact. Per-skill truncation beats
// dropping — instructions at the top of a skill file are usually the critical
// part. Budget sized to hold ~5 skills at the per-skill cap.
exports.POST_COMPACT_MAX_TOKENS_PER_SKILL = 5000;
exports.POST_COMPACT_SKILLS_TOKEN_BUDGET = 25000;
var MAX_COMPACT_STREAMING_RETRIES = 2;
/**
 * Strip image blocks from user messages before sending for compaction.
 * Images are not needed for generating a conversation summary and can
 * cause the compaction API call itself to hit the prompt-too-long limit,
 * especially in CCD sessions where users frequently attach images.
 * Replaces image blocks with a text marker so the summary still notes
 * that an image was shared.
 *
 * Note: Only user messages contain images (either directly attached or within
 * tool_result content from tools). Assistant messages contain text, tool_use,
 * and thinking blocks but not images.
 */
function stripImagesFromMessages(messages) {
    return messages.map(function (message) {
        if (message.type !== 'user') {
            return message;
        }
        var content = message.message.content;
        if (!Array.isArray(content)) {
            return message;
        }
        var hasMediaBlock = false;
        var newContent = content.flatMap(function (block) {
            if (block.type === 'image') {
                hasMediaBlock = true;
                return [{ type: 'text', text: '[image]' }];
            }
            if (block.type === 'document') {
                hasMediaBlock = true;
                return [{ type: 'text', text: '[document]' }];
            }
            // Also strip images/documents nested inside tool_result content arrays
            if (block.type === 'tool_result' && Array.isArray(block.content)) {
                var toolHasMedia_1 = false;
                var newToolContent = block.content.map(function (item) {
                    if (item.type === 'image') {
                        toolHasMedia_1 = true;
                        return { type: 'text', text: '[image]' };
                    }
                    if (item.type === 'document') {
                        toolHasMedia_1 = true;
                        return { type: 'text', text: '[document]' };
                    }
                    return item;
                });
                if (toolHasMedia_1) {
                    hasMediaBlock = true;
                    return [__assign(__assign({}, block), { content: newToolContent })];
                }
            }
            return [block];
        });
        if (!hasMediaBlock) {
            return message;
        }
        return __assign(__assign({}, message), { message: __assign(__assign({}, message.message), { content: newContent }) });
    });
}
/**
 * Strip attachment types that are re-injected post-compaction anyway.
 * skill_discovery/skill_listing are re-surfaced by resetSentSkillNames()
 * + the next turn's discovery signal, so feeding them to the summarizer
 * wastes tokens and pollutes the summary with stale skill suggestions.
 *
 * No-op when EXPERIMENTAL_SKILL_SEARCH is off (the attachment types
 * don't exist on external builds).
 */
function stripReinjectedAttachments(messages) {
    if ((0, bun_bundle_1.feature)('EXPERIMENTAL_SKILL_SEARCH')) {
        return messages.filter(function (m) {
            return !(m.type === 'attachment' &&
                (m.attachment.type === 'skill_discovery' ||
                    m.attachment.type === 'skill_listing'));
        });
    }
    return messages;
}
exports.ERROR_MESSAGE_NOT_ENOUGH_MESSAGES = 'Not enough messages to compact.';
var MAX_PTL_RETRIES = 3;
var PTL_RETRY_MARKER = '[earlier conversation truncated for compaction retry]';
/**
 * Drops the oldest API-round groups from messages until tokenGap is covered.
 * Falls back to dropping 20% of groups when the gap is unparseable (some
 * Vertex/Bedrock error formats). Returns null when nothing can be dropped
 * without leaving an empty summarize set.
 *
 * This is the last-resort escape hatch for CC-1180 — when the compact request
 * itself hits prompt-too-long, the user is otherwise stuck. Dropping the
 * oldest context is lossy but unblocks them. The reactive-compact path
 * (compactMessages.ts) has the proper retry loop that peels from the tail;
 * this helper is the dumb-but-safe fallback for the proactive/manual path
 * that wasn't migrated in bfdb472f's unification.
 */
function truncateHeadForPTLRetry(messages, ptlResponse) {
    var _a, _b;
    // Strip our own synthetic marker from a previous retry before grouping.
    // Otherwise it becomes its own group 0 and the 20% fallback stalls
    // (drops only the marker, re-adds it, zero progress on retry 2+).
    var input = ((_a = messages[0]) === null || _a === void 0 ? void 0 : _a.type) === 'user' &&
        messages[0].isMeta &&
        messages[0].message.content === PTL_RETRY_MARKER
        ? messages.slice(1)
        : messages;
    var groups = (0, grouping_js_1.groupMessagesByApiRound)(input);
    if (groups.length < 2)
        return null;
    var tokenGap = (0, errors_js_2.getPromptTooLongTokenGap)(ptlResponse);
    var dropCount;
    if (tokenGap !== undefined) {
        var acc = 0;
        dropCount = 0;
        for (var _i = 0, groups_1 = groups; _i < groups_1.length; _i++) {
            var g = groups_1[_i];
            acc += (0, tokenEstimation_js_1.roughTokenCountEstimationForMessages)(g);
            dropCount++;
            if (acc >= tokenGap)
                break;
        }
    }
    else {
        dropCount = Math.max(1, Math.floor(groups.length * 0.2));
    }
    // Keep at least one group so there's something to summarize.
    dropCount = Math.min(dropCount, groups.length - 1);
    if (dropCount < 1)
        return null;
    var sliced = groups.slice(dropCount).flat();
    // groupMessagesByApiRound puts the preamble in group 0 and starts every
    // subsequent group with an assistant message. Dropping group 0 leaves an
    // assistant-first sequence which the API rejects (first message must be
    // role=user). Prepend a synthetic user marker — ensureToolResultPairing
    // already handles any orphaned tool_results this creates.
    if (((_b = sliced[0]) === null || _b === void 0 ? void 0 : _b.type) === 'assistant') {
        return __spreadArray([
            (0, messages_js_1.createUserMessage)({ content: PTL_RETRY_MARKER, isMeta: true })
        ], sliced, true);
    }
    return sliced;
}
exports.ERROR_MESSAGE_PROMPT_TOO_LONG = 'Conversation too long. Press esc twice to go up a few messages and try again.';
exports.ERROR_MESSAGE_USER_ABORT = 'API Error: Request was aborted.';
exports.ERROR_MESSAGE_INCOMPLETE_RESPONSE = 'Compaction interrupted · This may be due to network issues — please try again.';
/**
 * Build the base post-compact messages array from a CompactionResult.
 * This ensures consistent ordering across all compaction paths.
 * Order: boundaryMarker, summaryMessages, messagesToKeep, attachments, hookResults
 */
function buildPostCompactMessages(result) {
    var _a;
    return __spreadArray(__spreadArray(__spreadArray(__spreadArray([
        result.boundaryMarker
    ], result.summaryMessages, true), ((_a = result.messagesToKeep) !== null && _a !== void 0 ? _a : []), true), result.attachments, true), result.hookResults, true);
}
/**
 * Annotate a compact boundary with relink metadata for messagesToKeep.
 * Preserved messages keep their original parentUuids on disk (dedup-skipped);
 * the loader uses this to patch head→anchor and anchor's-other-children→tail.
 *
 * `anchorUuid` = what sits immediately before keep[0] in the desired chain:
 *   - suffix-preserving (reactive/session-memory): last summary message
 *   - prefix-preserving (partial compact): the boundary itself
 */
function annotateBoundaryWithPreservedSegment(boundary, anchorUuid, messagesToKeep) {
    var keep = messagesToKeep !== null && messagesToKeep !== void 0 ? messagesToKeep : [];
    if (keep.length === 0)
        return boundary;
    return __assign(__assign({}, boundary), { compactMetadata: __assign(__assign({}, boundary.compactMetadata), { preservedSegment: {
                headUuid: keep[0].uuid,
                anchorUuid: anchorUuid,
                tailUuid: keep.at(-1).uuid,
            } }) });
}
/**
 * Merges user-supplied custom instructions with hook-provided instructions.
 * User instructions come first; hook instructions are appended.
 * Empty strings normalize to undefined.
 */
function mergeHookInstructions(userInstructions, hookInstructions) {
    if (!hookInstructions)
        return userInstructions || undefined;
    if (!userInstructions)
        return hookInstructions;
    return "".concat(userInstructions, "\n\n").concat(hookInstructions);
}
/**
 * Creates a compact version of a conversation by summarizing older messages
 * and preserving recent conversation history.
 */
function compactConversation(messages_1, context_1, cacheSafeParams_1, suppressFollowUpQuestions_1, customInstructions_1) {
    return __awaiter(this, arguments, void 0, function (messages, context, cacheSafeParams, suppressFollowUpQuestions, customInstructions, isAutoCompact, recompactionInfo) {
        var preCompactTokenCount, appState, hookResult, userDisplayMessage, promptCacheSharingEnabled, compactPrompt, summaryRequest, messagesToSummarize, retryCacheSafeParams, summaryResponse, summary, ptlAttempts, truncated, preCompactReadFileState, _a, fileAttachments, asyncAgentAttachments, postCompactFileAttachments, planAttachment, planModeAttachment, skillAttachment, _i, _b, att, _c, _d, att, _e, _f, att, hookMessages, boundaryMarker, preCompactDiscovered, transcriptPath, summaryMessages, compactionCallTotalTokens, truePostCompactTokenCount, compactionUsage, querySourceForEvent, postCompactHookResult, combinedUserDisplayMessage, error_1;
        var _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9;
        if (isAutoCompact === void 0) { isAutoCompact = false; }
        return __generator(this, function (_10) {
            switch (_10.label) {
                case 0:
                    _10.trys.push([0, 10, 11, 12]);
                    if (messages.length === 0) {
                        throw new Error(exports.ERROR_MESSAGE_NOT_ENOUGH_MESSAGES);
                    }
                    preCompactTokenCount = (0, tokens_js_1.tokenCountWithEstimation)(messages);
                    appState = context.getAppState();
                    void (0, internalLogging_js_1.logPermissionContextForAnts)(appState.toolPermissionContext, 'summary');
                    (_g = context.onCompactProgress) === null || _g === void 0 ? void 0 : _g.call(context, {
                        type: 'hooks_start',
                        hookType: 'pre_compact',
                    });
                    // Execute PreCompact hooks
                    (_h = context.setSDKStatus) === null || _h === void 0 ? void 0 : _h.call(context, 'compacting');
                    return [4 /*yield*/, (0, hooks_js_1.executePreCompactHooks)({
                            trigger: isAutoCompact ? 'auto' : 'manual',
                            customInstructions: customInstructions !== null && customInstructions !== void 0 ? customInstructions : null,
                        }, context.abortController.signal)];
                case 1:
                    hookResult = _10.sent();
                    customInstructions = mergeHookInstructions(customInstructions, hookResult.newCustomInstructions);
                    userDisplayMessage = hookResult.userDisplayMessage;
                    // Show requesting mode with up arrow and custom message
                    (_j = context.setStreamMode) === null || _j === void 0 ? void 0 : _j.call(context, 'requesting');
                    (_k = context.setResponseLength) === null || _k === void 0 ? void 0 : _k.call(context, function () { return 0; });
                    (_l = context.onCompactProgress) === null || _l === void 0 ? void 0 : _l.call(context, { type: 'compact_start' });
                    promptCacheSharingEnabled = (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_compact_cache_prefix', true);
                    compactPrompt = (0, prompt_js_2.getCompactPrompt)(customInstructions);
                    summaryRequest = (0, messages_js_1.createUserMessage)({
                        content: compactPrompt,
                    });
                    messagesToSummarize = messages;
                    retryCacheSafeParams = cacheSafeParams;
                    summaryResponse = void 0;
                    summary = void 0;
                    ptlAttempts = 0;
                    _10.label = 2;
                case 2: return [4 /*yield*/, streamCompactSummary({
                        messages: messagesToSummarize,
                        summaryRequest: summaryRequest,
                        appState: appState,
                        context: context,
                        preCompactTokenCount: preCompactTokenCount,
                        cacheSafeParams: retryCacheSafeParams,
                    })];
                case 3:
                    summaryResponse = _10.sent();
                    summary = (0, messages_js_1.getAssistantMessageText)(summaryResponse);
                    if (!(summary === null || summary === void 0 ? void 0 : summary.startsWith(errors_js_2.PROMPT_TOO_LONG_ERROR_MESSAGE)))
                        return [3 /*break*/, 5];
                    // CC-1180: compact request itself hit prompt-too-long. Truncate the
                    // oldest API-round groups and retry rather than leaving the user stuck.
                    ptlAttempts++;
                    truncated = ptlAttempts <= MAX_PTL_RETRIES
                        ? truncateHeadForPTLRetry(messagesToSummarize, summaryResponse)
                        : null;
                    if (!truncated) {
                        (0, index_js_1.logEvent)('tengu_compact_failed', {
                            reason: 'prompt_too_long',
                            preCompactTokenCount: preCompactTokenCount,
                            promptCacheSharingEnabled: promptCacheSharingEnabled,
                            ptlAttempts: ptlAttempts,
                        });
                        throw new Error(exports.ERROR_MESSAGE_PROMPT_TOO_LONG);
                    }
                    (0, index_js_1.logEvent)('tengu_compact_ptl_retry', {
                        attempt: ptlAttempts,
                        droppedMessages: messagesToSummarize.length - truncated.length,
                        remainingMessages: truncated.length,
                    });
                    messagesToSummarize = truncated;
                    // The forked-agent path reads from cacheSafeParams.forkContextMessages,
                    // not the messages param — thread the truncated set through both paths.
                    retryCacheSafeParams = __assign(__assign({}, retryCacheSafeParams), { forkContextMessages: truncated });
                    _10.label = 4;
                case 4: return [3 /*break*/, 2];
                case 5:
                    if (!summary) {
                        (0, debug_js_1.logForDebugging)("Compact failed: no summary text in response. Response: ".concat((0, slowOperations_js_1.jsonStringify)(summaryResponse)), { level: 'error' });
                        (0, index_js_1.logEvent)('tengu_compact_failed', {
                            reason: 'no_summary',
                            preCompactTokenCount: preCompactTokenCount,
                            promptCacheSharingEnabled: promptCacheSharingEnabled,
                        });
                        throw new Error("Failed to generate conversation summary - response did not contain valid text content");
                    }
                    else if ((0, errors_js_2.startsWithApiErrorPrefix)(summary)) {
                        (0, index_js_1.logEvent)('tengu_compact_failed', {
                            reason: 'api_error',
                            preCompactTokenCount: preCompactTokenCount,
                            promptCacheSharingEnabled: promptCacheSharingEnabled,
                        });
                        throw new Error(summary);
                    }
                    preCompactReadFileState = (0, fileStateCache_js_1.cacheToObject)(context.readFileState);
                    // Clear the cache
                    context.readFileState.clear();
                    (_m = context.loadedNestedMemoryPaths) === null || _m === void 0 ? void 0 : _m.clear();
                    return [4 /*yield*/, Promise.all([
                            createPostCompactFileAttachments(preCompactReadFileState, context, exports.POST_COMPACT_MAX_FILES_TO_RESTORE),
                            createAsyncAgentAttachmentsIfNeeded(context),
                        ])];
                case 6:
                    _a = _10.sent(), fileAttachments = _a[0], asyncAgentAttachments = _a[1];
                    postCompactFileAttachments = __spreadArray(__spreadArray([], fileAttachments, true), asyncAgentAttachments, true);
                    planAttachment = createPlanAttachmentIfNeeded(context.agentId);
                    if (planAttachment) {
                        postCompactFileAttachments.push(planAttachment);
                    }
                    return [4 /*yield*/, createPlanModeAttachmentIfNeeded(context)];
                case 7:
                    planModeAttachment = _10.sent();
                    if (planModeAttachment) {
                        postCompactFileAttachments.push(planModeAttachment);
                    }
                    skillAttachment = createSkillAttachmentIfNeeded(context.agentId);
                    if (skillAttachment) {
                        postCompactFileAttachments.push(skillAttachment);
                    }
                    // Compaction ate prior delta attachments. Re-announce from the current
                    // state so the model has tool/instruction context on the first
                    // post-compact turn. Empty message history → diff against nothing →
                    // announces the full set.
                    for (_i = 0, _b = (0, attachments_js_1.getDeferredToolsDeltaAttachment)(context.options.tools, context.options.mainLoopModel, [], { callSite: 'compact_full' }); _i < _b.length; _i++) {
                        att = _b[_i];
                        postCompactFileAttachments.push((0, attachments_js_1.createAttachmentMessage)(att));
                    }
                    for (_c = 0, _d = (0, attachments_js_1.getAgentListingDeltaAttachment)(context, []); _c < _d.length; _c++) {
                        att = _d[_c];
                        postCompactFileAttachments.push((0, attachments_js_1.createAttachmentMessage)(att));
                    }
                    for (_e = 0, _f = (0, attachments_js_1.getMcpInstructionsDeltaAttachment)(context.options.mcpClients, context.options.tools, context.options.mainLoopModel, []); _e < _f.length; _e++) {
                        att = _f[_e];
                        postCompactFileAttachments.push((0, attachments_js_1.createAttachmentMessage)(att));
                    }
                    (_o = context.onCompactProgress) === null || _o === void 0 ? void 0 : _o.call(context, {
                        type: 'hooks_start',
                        hookType: 'session_start',
                    });
                    return [4 /*yield*/, (0, sessionStart_js_1.processSessionStartHooks)('compact', {
                            model: context.options.mainLoopModel,
                        })
                        // Create the compact boundary marker and summary messages before the
                        // event so we can compute the true resulting-context size.
                    ];
                case 8:
                    hookMessages = _10.sent();
                    boundaryMarker = (0, messages_js_1.createCompactBoundaryMessage)(isAutoCompact ? 'auto' : 'manual', preCompactTokenCount !== null && preCompactTokenCount !== void 0 ? preCompactTokenCount : 0, (_p = messages.at(-1)) === null || _p === void 0 ? void 0 : _p.uuid);
                    preCompactDiscovered = (0, toolSearch_js_1.extractDiscoveredToolNames)(messages);
                    if (preCompactDiscovered.size > 0) {
                        boundaryMarker.compactMetadata.preCompactDiscoveredTools = __spreadArray([], preCompactDiscovered, true).sort();
                    }
                    transcriptPath = (0, sessionStorage_js_1.getTranscriptPath)();
                    summaryMessages = [
                        (0, messages_js_1.createUserMessage)({
                            content: (0, prompt_js_2.getCompactUserSummaryMessage)(summary, suppressFollowUpQuestions, transcriptPath),
                            isCompactSummary: true,
                            isVisibleInTranscriptOnly: true,
                        }),
                    ];
                    compactionCallTotalTokens = (0, tokens_js_1.tokenCountFromLastAPIResponse)([
                        summaryResponse,
                    ]);
                    truePostCompactTokenCount = (0, tokenEstimation_js_1.roughTokenCountEstimationForMessages)(__spreadArray(__spreadArray(__spreadArray([
                        boundaryMarker
                    ], summaryMessages, true), postCompactFileAttachments, true), hookMessages, true));
                    compactionUsage = (0, tokens_js_1.getTokenUsage)(summaryResponse);
                    querySourceForEvent = (_r = (_q = recompactionInfo === null || recompactionInfo === void 0 ? void 0 : recompactionInfo.querySource) !== null && _q !== void 0 ? _q : context.options.querySource) !== null && _r !== void 0 ? _r : 'unknown';
                    (0, index_js_1.logEvent)('tengu_compact', __assign({ preCompactTokenCount: preCompactTokenCount, 
                        // Kept for continuity — semantically the compact API call's total usage
                        postCompactTokenCount: compactionCallTotalTokens, truePostCompactTokenCount: truePostCompactTokenCount, autoCompactThreshold: (_s = recompactionInfo === null || recompactionInfo === void 0 ? void 0 : recompactionInfo.autoCompactThreshold) !== null && _s !== void 0 ? _s : -1, willRetriggerNextTurn: recompactionInfo !== undefined &&
                            truePostCompactTokenCount >= recompactionInfo.autoCompactThreshold, isAutoCompact: isAutoCompact, querySource: querySourceForEvent, queryChainId: ((_u = (_t = context.queryTracking) === null || _t === void 0 ? void 0 : _t.chainId) !== null && _u !== void 0 ? _u : ''), queryDepth: (_w = (_v = context.queryTracking) === null || _v === void 0 ? void 0 : _v.depth) !== null && _w !== void 0 ? _w : -1, isRecompactionInChain: (_x = recompactionInfo === null || recompactionInfo === void 0 ? void 0 : recompactionInfo.isRecompactionInChain) !== null && _x !== void 0 ? _x : false, turnsSincePreviousCompact: (_y = recompactionInfo === null || recompactionInfo === void 0 ? void 0 : recompactionInfo.turnsSincePreviousCompact) !== null && _y !== void 0 ? _y : -1, previousCompactTurnId: ((_z = recompactionInfo === null || recompactionInfo === void 0 ? void 0 : recompactionInfo.previousCompactTurnId) !== null && _z !== void 0 ? _z : ''), compactionInputTokens: compactionUsage === null || compactionUsage === void 0 ? void 0 : compactionUsage.input_tokens, compactionOutputTokens: compactionUsage === null || compactionUsage === void 0 ? void 0 : compactionUsage.output_tokens, compactionCacheReadTokens: (_0 = compactionUsage === null || compactionUsage === void 0 ? void 0 : compactionUsage.cache_read_input_tokens) !== null && _0 !== void 0 ? _0 : 0, compactionCacheCreationTokens: (_1 = compactionUsage === null || compactionUsage === void 0 ? void 0 : compactionUsage.cache_creation_input_tokens) !== null && _1 !== void 0 ? _1 : 0, compactionTotalTokens: compactionUsage
                            ? compactionUsage.input_tokens +
                                ((_2 = compactionUsage.cache_creation_input_tokens) !== null && _2 !== void 0 ? _2 : 0) +
                                ((_3 = compactionUsage.cache_read_input_tokens) !== null && _3 !== void 0 ? _3 : 0) +
                                compactionUsage.output_tokens
                            : 0, promptCacheSharingEnabled: promptCacheSharingEnabled }, (function () {
                        try {
                            return (0, contextAnalysis_js_1.tokenStatsToStatsigMetrics)((0, contextAnalysis_js_1.analyzeContext)(messages));
                        }
                        catch (error) {
                            (0, log_js_1.logError)(error);
                            return {};
                        }
                    })()));
                    // Reset cache read baseline so the post-compact drop isn't flagged as a break
                    if ((0, bun_bundle_1.feature)('PROMPT_CACHE_BREAK_DETECTION')) {
                        (0, promptCacheBreakDetection_js_1.notifyCompaction)((_4 = context.options.querySource) !== null && _4 !== void 0 ? _4 : 'compact', context.agentId);
                    }
                    (0, state_js_1.markPostCompaction)();
                    // Re-append session metadata (custom title, tag) so it stays within
                    // the 16KB tail window that readLiteMetadata reads for --resume display.
                    // Without this, enough post-compaction messages push the metadata entry
                    // out of the window, causing --resume to show the auto-generated title
                    // instead of the user-set session name.
                    (0, sessionStorage_js_1.reAppendSessionMetadata)();
                    // Write a reduced transcript segment for the pre-compaction messages
                    // (assistant mode only). Fire-and-forget — errors are logged internally.
                    if ((0, bun_bundle_1.feature)('KAIROS')) {
                        void (sessionTranscriptModule === null || sessionTranscriptModule === void 0 ? void 0 : sessionTranscriptModule.writeSessionTranscriptSegment(messages));
                    }
                    (_5 = context.onCompactProgress) === null || _5 === void 0 ? void 0 : _5.call(context, {
                        type: 'hooks_start',
                        hookType: 'post_compact',
                    });
                    return [4 /*yield*/, (0, hooks_js_1.executePostCompactHooks)({
                            trigger: isAutoCompact ? 'auto' : 'manual',
                            compactSummary: summary,
                        }, context.abortController.signal)];
                case 9:
                    postCompactHookResult = _10.sent();
                    combinedUserDisplayMessage = [
                        userDisplayMessage,
                        postCompactHookResult.userDisplayMessage,
                    ]
                        .filter(Boolean)
                        .join('\n');
                    return [2 /*return*/, {
                            boundaryMarker: boundaryMarker,
                            summaryMessages: summaryMessages,
                            attachments: postCompactFileAttachments,
                            hookResults: hookMessages,
                            userDisplayMessage: combinedUserDisplayMessage || undefined,
                            preCompactTokenCount: preCompactTokenCount,
                            postCompactTokenCount: compactionCallTotalTokens,
                            truePostCompactTokenCount: truePostCompactTokenCount,
                            compactionUsage: compactionUsage,
                        }];
                case 10:
                    error_1 = _10.sent();
                    // Only show the error notification for manual /compact.
                    // Auto-compact failures are retried on the next turn and the
                    // notification is confusing when compaction eventually succeeds.
                    if (!isAutoCompact) {
                        addErrorNotificationIfNeeded(error_1, context);
                    }
                    throw error_1;
                case 11:
                    (_6 = context.setStreamMode) === null || _6 === void 0 ? void 0 : _6.call(context, 'requesting');
                    (_7 = context.setResponseLength) === null || _7 === void 0 ? void 0 : _7.call(context, function () { return 0; });
                    (_8 = context.onCompactProgress) === null || _8 === void 0 ? void 0 : _8.call(context, { type: 'compact_end' });
                    (_9 = context.setSDKStatus) === null || _9 === void 0 ? void 0 : _9.call(context, null);
                    return [7 /*endfinally*/];
                case 12: return [2 /*return*/];
            }
        });
    });
}
/**
 * Performs a partial compaction around the selected message index.
 * Direction 'from': summarizes messages after the index, keeps earlier ones.
 *   Prompt cache for kept (earlier) messages is preserved.
 * Direction 'up_to': summarizes messages before the index, keeps later ones.
 *   Prompt cache is invalidated since the summary precedes the kept messages.
 */
function partialCompactConversation(allMessages_1, pivotIndex_1, context_1, cacheSafeParams_1, userFeedback_1) {
    return __awaiter(this, arguments, void 0, function (allMessages, pivotIndex, context, cacheSafeParams, userFeedback, direction) {
        var messagesToSummarize, messagesToKeep, preCompactTokenCount, hookResult, customInstructions, compactPrompt, summaryRequest, failureMetadata, apiMessages, retryCacheSafeParams, summaryResponse, summary, ptlAttempts, truncated, preCompactReadFileState, _a, fileAttachments, asyncAgentAttachments, postCompactFileAttachments, planAttachment, planModeAttachment, skillAttachment, _i, _b, att, _c, _d, att, _e, _f, att, hookMessages, postCompactTokenCount, compactionUsage, lastPreCompactUuid, boundaryMarker, preCompactDiscovered, transcriptPath, summaryMessages, postCompactHookResult, anchorUuid, error_2;
        var _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
        if (direction === void 0) { direction = 'from'; }
        return __generator(this, function (_1) {
            switch (_1.label) {
                case 0:
                    _1.trys.push([0, 10, 11, 12]);
                    messagesToSummarize = direction === 'up_to'
                        ? allMessages.slice(0, pivotIndex)
                        : allMessages.slice(pivotIndex);
                    messagesToKeep = direction === 'up_to'
                        ? allMessages
                            .slice(pivotIndex)
                            .filter(function (m) {
                            return m.type !== 'progress' &&
                                !(0, messages_js_1.isCompactBoundaryMessage)(m) &&
                                !(m.type === 'user' && m.isCompactSummary);
                        })
                        : allMessages.slice(0, pivotIndex).filter(function (m) { return m.type !== 'progress'; });
                    if (messagesToSummarize.length === 0) {
                        throw new Error(direction === 'up_to'
                            ? 'Nothing to summarize before the selected message.'
                            : 'Nothing to summarize after the selected message.');
                    }
                    preCompactTokenCount = (0, tokens_js_1.tokenCountWithEstimation)(allMessages);
                    (_g = context.onCompactProgress) === null || _g === void 0 ? void 0 : _g.call(context, {
                        type: 'hooks_start',
                        hookType: 'pre_compact',
                    });
                    (_h = context.setSDKStatus) === null || _h === void 0 ? void 0 : _h.call(context, 'compacting');
                    return [4 /*yield*/, (0, hooks_js_1.executePreCompactHooks)({
                            trigger: 'manual',
                            customInstructions: null,
                        }, context.abortController.signal)
                        // Merge hook instructions with user feedback
                    ];
                case 1:
                    hookResult = _1.sent();
                    customInstructions = void 0;
                    if (hookResult.newCustomInstructions && userFeedback) {
                        customInstructions = "".concat(hookResult.newCustomInstructions, "\n\nUser context: ").concat(userFeedback);
                    }
                    else if (hookResult.newCustomInstructions) {
                        customInstructions = hookResult.newCustomInstructions;
                    }
                    else if (userFeedback) {
                        customInstructions = "User context: ".concat(userFeedback);
                    }
                    (_j = context.setStreamMode) === null || _j === void 0 ? void 0 : _j.call(context, 'requesting');
                    (_k = context.setResponseLength) === null || _k === void 0 ? void 0 : _k.call(context, function () { return 0; });
                    (_l = context.onCompactProgress) === null || _l === void 0 ? void 0 : _l.call(context, { type: 'compact_start' });
                    compactPrompt = (0, prompt_js_2.getPartialCompactPrompt)(customInstructions, direction);
                    summaryRequest = (0, messages_js_1.createUserMessage)({
                        content: compactPrompt,
                    });
                    failureMetadata = {
                        preCompactTokenCount: preCompactTokenCount,
                        direction: direction,
                        messagesSummarized: messagesToSummarize.length,
                    };
                    apiMessages = direction === 'up_to' ? messagesToSummarize : allMessages;
                    retryCacheSafeParams = direction === 'up_to'
                        ? __assign(__assign({}, cacheSafeParams), { forkContextMessages: messagesToSummarize }) : cacheSafeParams;
                    summaryResponse = void 0;
                    summary = void 0;
                    ptlAttempts = 0;
                    _1.label = 2;
                case 2: return [4 /*yield*/, streamCompactSummary({
                        messages: apiMessages,
                        summaryRequest: summaryRequest,
                        appState: context.getAppState(),
                        context: context,
                        preCompactTokenCount: preCompactTokenCount,
                        cacheSafeParams: retryCacheSafeParams,
                    })];
                case 3:
                    summaryResponse = _1.sent();
                    summary = (0, messages_js_1.getAssistantMessageText)(summaryResponse);
                    if (!(summary === null || summary === void 0 ? void 0 : summary.startsWith(errors_js_2.PROMPT_TOO_LONG_ERROR_MESSAGE)))
                        return [3 /*break*/, 5];
                    ptlAttempts++;
                    truncated = ptlAttempts <= MAX_PTL_RETRIES
                        ? truncateHeadForPTLRetry(apiMessages, summaryResponse)
                        : null;
                    if (!truncated) {
                        (0, index_js_1.logEvent)('tengu_partial_compact_failed', __assign(__assign({ reason: 'prompt_too_long' }, failureMetadata), { ptlAttempts: ptlAttempts }));
                        throw new Error(exports.ERROR_MESSAGE_PROMPT_TOO_LONG);
                    }
                    (0, index_js_1.logEvent)('tengu_compact_ptl_retry', {
                        attempt: ptlAttempts,
                        droppedMessages: apiMessages.length - truncated.length,
                        remainingMessages: truncated.length,
                        path: 'partial',
                    });
                    apiMessages = truncated;
                    retryCacheSafeParams = __assign(__assign({}, retryCacheSafeParams), { forkContextMessages: truncated });
                    _1.label = 4;
                case 4: return [3 /*break*/, 2];
                case 5:
                    if (!summary) {
                        (0, index_js_1.logEvent)('tengu_partial_compact_failed', __assign({ reason: 'no_summary' }, failureMetadata));
                        throw new Error('Failed to generate conversation summary - response did not contain valid text content');
                    }
                    else if ((0, errors_js_2.startsWithApiErrorPrefix)(summary)) {
                        (0, index_js_1.logEvent)('tengu_partial_compact_failed', __assign({ reason: 'api_error' }, failureMetadata));
                        throw new Error(summary);
                    }
                    preCompactReadFileState = (0, fileStateCache_js_1.cacheToObject)(context.readFileState);
                    context.readFileState.clear();
                    (_m = context.loadedNestedMemoryPaths) === null || _m === void 0 ? void 0 : _m.clear();
                    return [4 /*yield*/, Promise.all([
                            createPostCompactFileAttachments(preCompactReadFileState, context, exports.POST_COMPACT_MAX_FILES_TO_RESTORE, messagesToKeep),
                            createAsyncAgentAttachmentsIfNeeded(context),
                        ])];
                case 6:
                    _a = _1.sent(), fileAttachments = _a[0], asyncAgentAttachments = _a[1];
                    postCompactFileAttachments = __spreadArray(__spreadArray([], fileAttachments, true), asyncAgentAttachments, true);
                    planAttachment = createPlanAttachmentIfNeeded(context.agentId);
                    if (planAttachment) {
                        postCompactFileAttachments.push(planAttachment);
                    }
                    return [4 /*yield*/, createPlanModeAttachmentIfNeeded(context)];
                case 7:
                    planModeAttachment = _1.sent();
                    if (planModeAttachment) {
                        postCompactFileAttachments.push(planModeAttachment);
                    }
                    skillAttachment = createSkillAttachmentIfNeeded(context.agentId);
                    if (skillAttachment) {
                        postCompactFileAttachments.push(skillAttachment);
                    }
                    // Re-announce only what was in the summarized portion — messagesToKeep
                    // is scanned, so anything already announced there is skipped.
                    for (_i = 0, _b = (0, attachments_js_1.getDeferredToolsDeltaAttachment)(context.options.tools, context.options.mainLoopModel, messagesToKeep, { callSite: 'compact_partial' }); _i < _b.length; _i++) {
                        att = _b[_i];
                        postCompactFileAttachments.push((0, attachments_js_1.createAttachmentMessage)(att));
                    }
                    for (_c = 0, _d = (0, attachments_js_1.getAgentListingDeltaAttachment)(context, messagesToKeep); _c < _d.length; _c++) {
                        att = _d[_c];
                        postCompactFileAttachments.push((0, attachments_js_1.createAttachmentMessage)(att));
                    }
                    for (_e = 0, _f = (0, attachments_js_1.getMcpInstructionsDeltaAttachment)(context.options.mcpClients, context.options.tools, context.options.mainLoopModel, messagesToKeep); _e < _f.length; _e++) {
                        att = _f[_e];
                        postCompactFileAttachments.push((0, attachments_js_1.createAttachmentMessage)(att));
                    }
                    (_o = context.onCompactProgress) === null || _o === void 0 ? void 0 : _o.call(context, {
                        type: 'hooks_start',
                        hookType: 'session_start',
                    });
                    return [4 /*yield*/, (0, sessionStart_js_1.processSessionStartHooks)('compact', {
                            model: context.options.mainLoopModel,
                        })];
                case 8:
                    hookMessages = _1.sent();
                    postCompactTokenCount = (0, tokens_js_1.tokenCountFromLastAPIResponse)([
                        summaryResponse,
                    ]);
                    compactionUsage = (0, tokens_js_1.getTokenUsage)(summaryResponse);
                    (0, index_js_1.logEvent)('tengu_partial_compact', {
                        preCompactTokenCount: preCompactTokenCount,
                        postCompactTokenCount: postCompactTokenCount,
                        messagesKept: messagesToKeep.length,
                        messagesSummarized: messagesToSummarize.length,
                        direction: direction,
                        hasUserFeedback: !!userFeedback,
                        trigger: 'message_selector',
                        compactionInputTokens: compactionUsage === null || compactionUsage === void 0 ? void 0 : compactionUsage.input_tokens,
                        compactionOutputTokens: compactionUsage === null || compactionUsage === void 0 ? void 0 : compactionUsage.output_tokens,
                        compactionCacheReadTokens: (_p = compactionUsage === null || compactionUsage === void 0 ? void 0 : compactionUsage.cache_read_input_tokens) !== null && _p !== void 0 ? _p : 0,
                        compactionCacheCreationTokens: (_q = compactionUsage === null || compactionUsage === void 0 ? void 0 : compactionUsage.cache_creation_input_tokens) !== null && _q !== void 0 ? _q : 0,
                    });
                    lastPreCompactUuid = direction === 'up_to'
                        ? (_r = allMessages.slice(0, pivotIndex).findLast(function (m) { return m.type !== 'progress'; })) === null || _r === void 0 ? void 0 : _r.uuid
                        : (_s = messagesToKeep.at(-1)) === null || _s === void 0 ? void 0 : _s.uuid;
                    boundaryMarker = (0, messages_js_1.createCompactBoundaryMessage)('manual', preCompactTokenCount !== null && preCompactTokenCount !== void 0 ? preCompactTokenCount : 0, lastPreCompactUuid, userFeedback, messagesToSummarize.length);
                    preCompactDiscovered = (0, toolSearch_js_1.extractDiscoveredToolNames)(allMessages);
                    if (preCompactDiscovered.size > 0) {
                        boundaryMarker.compactMetadata.preCompactDiscoveredTools = __spreadArray([], preCompactDiscovered, true).sort();
                    }
                    transcriptPath = (0, sessionStorage_js_1.getTranscriptPath)();
                    summaryMessages = [
                        (0, messages_js_1.createUserMessage)(__assign({ content: (0, prompt_js_2.getCompactUserSummaryMessage)(summary, false, transcriptPath), isCompactSummary: true }, (messagesToKeep.length > 0
                            ? {
                                summarizeMetadata: {
                                    messagesSummarized: messagesToSummarize.length,
                                    userContext: userFeedback,
                                    direction: direction,
                                },
                            }
                            : { isVisibleInTranscriptOnly: true }))),
                    ];
                    if ((0, bun_bundle_1.feature)('PROMPT_CACHE_BREAK_DETECTION')) {
                        (0, promptCacheBreakDetection_js_1.notifyCompaction)((_t = context.options.querySource) !== null && _t !== void 0 ? _t : 'compact', context.agentId);
                    }
                    (0, state_js_1.markPostCompaction)();
                    // Re-append session metadata (custom title, tag) so it stays within
                    // the 16KB tail window that readLiteMetadata reads for --resume display.
                    (0, sessionStorage_js_1.reAppendSessionMetadata)();
                    if ((0, bun_bundle_1.feature)('KAIROS')) {
                        void (sessionTranscriptModule === null || sessionTranscriptModule === void 0 ? void 0 : sessionTranscriptModule.writeSessionTranscriptSegment(messagesToSummarize));
                    }
                    (_u = context.onCompactProgress) === null || _u === void 0 ? void 0 : _u.call(context, {
                        type: 'hooks_start',
                        hookType: 'post_compact',
                    });
                    return [4 /*yield*/, (0, hooks_js_1.executePostCompactHooks)({
                            trigger: 'manual',
                            compactSummary: summary,
                        }, context.abortController.signal)
                        // 'from': prefix-preserving → boundary; 'up_to': suffix → last summary
                    ];
                case 9:
                    postCompactHookResult = _1.sent();
                    anchorUuid = direction === 'up_to'
                        ? ((_w = (_v = summaryMessages.at(-1)) === null || _v === void 0 ? void 0 : _v.uuid) !== null && _w !== void 0 ? _w : boundaryMarker.uuid)
                        : boundaryMarker.uuid;
                    return [2 /*return*/, {
                            boundaryMarker: annotateBoundaryWithPreservedSegment(boundaryMarker, anchorUuid, messagesToKeep),
                            summaryMessages: summaryMessages,
                            messagesToKeep: messagesToKeep,
                            attachments: postCompactFileAttachments,
                            hookResults: hookMessages,
                            userDisplayMessage: postCompactHookResult.userDisplayMessage,
                            preCompactTokenCount: preCompactTokenCount,
                            postCompactTokenCount: postCompactTokenCount,
                            compactionUsage: compactionUsage,
                        }];
                case 10:
                    error_2 = _1.sent();
                    addErrorNotificationIfNeeded(error_2, context);
                    throw error_2;
                case 11:
                    (_x = context.setStreamMode) === null || _x === void 0 ? void 0 : _x.call(context, 'requesting');
                    (_y = context.setResponseLength) === null || _y === void 0 ? void 0 : _y.call(context, function () { return 0; });
                    (_z = context.onCompactProgress) === null || _z === void 0 ? void 0 : _z.call(context, { type: 'compact_end' });
                    (_0 = context.setSDKStatus) === null || _0 === void 0 ? void 0 : _0.call(context, null);
                    return [7 /*endfinally*/];
                case 12: return [2 /*return*/];
            }
        });
    });
}
function addErrorNotificationIfNeeded(error, context) {
    var _a;
    if (!(0, errors_js_1.hasExactErrorMessage)(error, exports.ERROR_MESSAGE_USER_ABORT) &&
        !(0, errors_js_1.hasExactErrorMessage)(error, exports.ERROR_MESSAGE_NOT_ENOUGH_MESSAGES)) {
        (_a = context.addNotification) === null || _a === void 0 ? void 0 : _a.call(context, {
            key: 'error-compacting-conversation',
            text: 'Error compacting conversation',
            priority: 'immediate',
            color: 'error',
        });
    }
}
function createCompactCanUseTool() {
    var _this = this;
    return function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, ({
                    behavior: 'deny',
                    message: 'Tool use is not allowed during compaction',
                    decisionReason: {
                        type: 'other',
                        reason: 'compaction agent should only produce text summary',
                    },
                })];
        });
    }); };
}
function streamCompactSummary(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var promptCacheSharingEnabled, activityInterval, result, assistantMsg, assistantText, error_3, retryEnabled, maxAttempts, attempt, hasStartedStreaming, response, useToolSearch, tools, streamingGen, streamIter, next, _loop_1;
        var _this = this;
        var _c, _d, _e;
        var messages = _b.messages, summaryRequest = _b.summaryRequest, appState = _b.appState, context = _b.context, preCompactTokenCount = _b.preCompactTokenCount, cacheSafeParams = _b.cacheSafeParams;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    promptCacheSharingEnabled = (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_compact_cache_prefix', true);
                    activityInterval = (0, sessionActivity_js_1.isSessionActivityTrackingActive)()
                        ? setInterval(function (statusSetter) {
                            (0, sessionActivity_js_1.sendSessionActivitySignal)();
                            statusSetter === null || statusSetter === void 0 ? void 0 : statusSetter('compacting');
                        }, 30000, context.setSDKStatus)
                        : undefined;
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, , 16, 17]);
                    if (!promptCacheSharingEnabled) return [3 /*break*/, 5];
                    _f.label = 2;
                case 2:
                    _f.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, forkedAgent_js_1.runForkedAgent)({
                            promptMessages: [summaryRequest],
                            cacheSafeParams: cacheSafeParams,
                            canUseTool: createCompactCanUseTool(),
                            querySource: 'compact',
                            forkLabel: 'compact',
                            maxTurns: 1,
                            skipCacheWrite: true,
                            // Pass the compact context's abortController so user Esc aborts the
                            // fork — same signal the streaming fallback uses at
                            // `signal: context.abortController.signal` below.
                            overrides: { abortController: context.abortController },
                        })];
                case 3:
                    result = _f.sent();
                    assistantMsg = (0, messages_js_1.getLastAssistantMessage)(result.messages);
                    assistantText = assistantMsg
                        ? (0, messages_js_1.getAssistantMessageText)(assistantMsg)
                        : null;
                    // Guard isApiErrorMessage: query() catches API errors (including
                    // APIUserAbortError on ESC) and yields them as synthetic assistant
                    // messages. Without this check, an aborted compact "succeeds" with
                    // "Request was aborted." as the summary — the text doesn't start with
                    // "API Error" so the caller's startsWithApiErrorPrefix guard misses it.
                    if (assistantMsg && assistantText && !assistantMsg.isApiErrorMessage) {
                        // Skip success logging for PTL error text — it's returned so the
                        // caller's retry loop catches it, but it's not a successful summary.
                        if (!assistantText.startsWith(errors_js_2.PROMPT_TOO_LONG_ERROR_MESSAGE)) {
                            (0, index_js_1.logEvent)('tengu_compact_cache_sharing_success', {
                                preCompactTokenCount: preCompactTokenCount,
                                outputTokens: result.totalUsage.output_tokens,
                                cacheReadInputTokens: result.totalUsage.cache_read_input_tokens,
                                cacheCreationInputTokens: result.totalUsage.cache_creation_input_tokens,
                                cacheHitRate: result.totalUsage.cache_read_input_tokens > 0
                                    ? result.totalUsage.cache_read_input_tokens /
                                        (result.totalUsage.cache_read_input_tokens +
                                            result.totalUsage.cache_creation_input_tokens +
                                            result.totalUsage.input_tokens)
                                    : 0,
                            });
                        }
                        return [2 /*return*/, assistantMsg];
                    }
                    (0, debug_js_1.logForDebugging)("Compact cache sharing: no text in response, falling back. Response: ".concat((0, slowOperations_js_1.jsonStringify)(assistantMsg)), { level: 'warn' });
                    (0, index_js_1.logEvent)('tengu_compact_cache_sharing_fallback', {
                        reason: 'no_text_response',
                        preCompactTokenCount: preCompactTokenCount,
                    });
                    return [3 /*break*/, 5];
                case 4:
                    error_3 = _f.sent();
                    (0, log_js_1.logError)(error_3);
                    (0, index_js_1.logEvent)('tengu_compact_cache_sharing_fallback', {
                        reason: 'error',
                        preCompactTokenCount: preCompactTokenCount,
                    });
                    return [3 /*break*/, 5];
                case 5:
                    retryEnabled = (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_compact_streaming_retry', false);
                    maxAttempts = retryEnabled ? MAX_COMPACT_STREAMING_RETRIES : 1;
                    attempt = 1;
                    _f.label = 6;
                case 6:
                    if (!(attempt <= maxAttempts)) return [3 /*break*/, 15];
                    hasStartedStreaming = false;
                    response = void 0;
                    (_c = context.setResponseLength) === null || _c === void 0 ? void 0 : _c.call(context, function () { return 0; });
                    return [4 /*yield*/, (0, toolSearch_js_1.isToolSearchEnabled)(context.options.mainLoopModel, context.options.tools, function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, appState.toolPermissionContext];
                        }); }); }, context.options.agentDefinitions.activeAgents, 'compact')
                        // When tool search is enabled, include ToolSearchTool and MCP tools. They get
                        // defer_loading: true and don't count against context - the API filters them out
                        // of system_prompt_tools before token counting (see api/token_count_api/counting.py:188
                        // and api/public_api/messages/handler.py:324).
                        // Filter MCP tools from context.options.tools (not appState.mcp.tools) so we
                        // get the permission-filtered set from useMergedTools — same source used for
                        // isToolSearchEnabled above and normalizeMessagesForAPI below.
                        // Deduplicate by name to avoid API errors when MCP tools share names with built-in tools.
                    ];
                case 7:
                    useToolSearch = _f.sent();
                    tools = useToolSearch
                        ? (0, uniqBy_js_1.default)(__spreadArray([
                            FileReadTool_js_1.FileReadTool,
                            ToolSearchTool_js_1.ToolSearchTool
                        ], context.options.tools.filter(function (t) { return t.isMcp; }), true), 'name')
                        : [FileReadTool_js_1.FileReadTool];
                    streamingGen = (0, claude_js_1.queryModelWithStreaming)({
                        messages: (0, messages_js_1.normalizeMessagesForAPI)(stripImagesFromMessages(stripReinjectedAttachments(__spreadArray(__spreadArray([], (0, messages_js_1.getMessagesAfterCompactBoundary)(messages), true), [
                            summaryRequest,
                        ], false))), context.options.tools),
                        systemPrompt: (0, systemPromptType_js_1.asSystemPrompt)([
                            'You are a helpful AI assistant tasked with summarizing conversations.',
                        ]),
                        thinkingConfig: { type: 'disabled' },
                        tools: tools,
                        signal: context.abortController.signal,
                        options: {
                            getToolPermissionContext: function () {
                                return __awaiter(this, void 0, void 0, function () {
                                    var appState;
                                    return __generator(this, function (_a) {
                                        appState = context.getAppState();
                                        return [2 /*return*/, appState.toolPermissionContext];
                                    });
                                });
                            },
                            model: context.options.mainLoopModel,
                            toolChoice: undefined,
                            isNonInteractiveSession: context.options.isNonInteractiveSession,
                            hasAppendSystemPrompt: !!context.options.appendSystemPrompt,
                            maxOutputTokensOverride: Math.min(context_js_1.COMPACT_MAX_OUTPUT_TOKENS, (0, claude_js_1.getMaxOutputTokensForModel)(context.options.mainLoopModel)),
                            querySource: 'compact',
                            agents: context.options.agentDefinitions.activeAgents,
                            mcpTools: [],
                            effortValue: appState.effortValue,
                        },
                    });
                    streamIter = streamingGen[Symbol.asyncIterator]();
                    return [4 /*yield*/, streamIter.next()];
                case 8:
                    next = _f.sent();
                    _loop_1 = function () {
                        var event_1, charactersStreamed_1;
                        return __generator(this, function (_g) {
                            switch (_g.label) {
                                case 0:
                                    event_1 = next.value;
                                    if (!hasStartedStreaming &&
                                        event_1.type === 'stream_event' &&
                                        event_1.event.type === 'content_block_start' &&
                                        event_1.event.content_block.type === 'text') {
                                        hasStartedStreaming = true;
                                        (_d = context.setStreamMode) === null || _d === void 0 ? void 0 : _d.call(context, 'responding');
                                    }
                                    if (event_1.type === 'stream_event' &&
                                        event_1.event.type === 'content_block_delta' &&
                                        event_1.event.delta.type === 'text_delta') {
                                        charactersStreamed_1 = event_1.event.delta.text.length;
                                        (_e = context.setResponseLength) === null || _e === void 0 ? void 0 : _e.call(context, function (length) { return length + charactersStreamed_1; });
                                    }
                                    if (event_1.type === 'assistant') {
                                        response = event_1;
                                    }
                                    return [4 /*yield*/, streamIter.next()];
                                case 1:
                                    next = _g.sent();
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _f.label = 9;
                case 9:
                    if (!!next.done) return [3 /*break*/, 11];
                    return [5 /*yield**/, _loop_1()];
                case 10:
                    _f.sent();
                    return [3 /*break*/, 9];
                case 11:
                    if (response) {
                        return [2 /*return*/, response];
                    }
                    if (!(attempt < maxAttempts)) return [3 /*break*/, 13];
                    (0, index_js_1.logEvent)('tengu_compact_streaming_retry', {
                        attempt: attempt,
                        preCompactTokenCount: preCompactTokenCount,
                        hasStartedStreaming: hasStartedStreaming,
                    });
                    return [4 /*yield*/, (0, sleep_js_1.sleep)((0, withRetry_js_1.getRetryDelay)(attempt), context.abortController.signal, {
                            abortError: function () { return new sdk_1.APIUserAbortError(); },
                        })];
                case 12:
                    _f.sent();
                    return [3 /*break*/, 14];
                case 13:
                    (0, debug_js_1.logForDebugging)("Compact streaming failed after ".concat(attempt, " attempts. hasStartedStreaming=").concat(hasStartedStreaming), { level: 'error' });
                    (0, index_js_1.logEvent)('tengu_compact_failed', {
                        reason: 'no_streaming_response',
                        preCompactTokenCount: preCompactTokenCount,
                        hasStartedStreaming: hasStartedStreaming,
                        retryEnabled: retryEnabled,
                        attempts: attempt,
                        promptCacheSharingEnabled: promptCacheSharingEnabled,
                    });
                    throw new Error(exports.ERROR_MESSAGE_INCOMPLETE_RESPONSE);
                case 14:
                    attempt++;
                    return [3 /*break*/, 6];
                case 15: 
                // This should never be reached due to the throw above, but TypeScript needs it
                throw new Error(exports.ERROR_MESSAGE_INCOMPLETE_RESPONSE);
                case 16:
                    clearInterval(activityInterval);
                    return [7 /*endfinally*/];
                case 17: return [2 /*return*/];
            }
        });
    });
}
/**
 * Creates attachment messages for recently accessed files to restore them after compaction.
 * This prevents the model from having to re-read files that were recently accessed.
 * Re-reads files using FileReadTool to get fresh content with proper validation.
 * Files are selected based on recency, but constrained by both file count and token budget limits.
 *
 * Files already present as Read tool results in preservedMessages are skipped —
 * re-injecting identical content the model can already see in the preserved tail
 * is pure waste (up to 25K tok/compact). Mirrors the diff-against-preserved
 * pattern that getDeferredToolsDeltaAttachment uses at the same call sites.
 *
 * @param readFileState The current file state tracking recently read files
 * @param toolUseContext The tool use context for calling FileReadTool
 * @param maxFiles Maximum number of files to restore (default: 5)
 * @param preservedMessages Messages kept post-compact; Read results here are skipped
 * @returns Array of attachment messages for the most recently accessed files that fit within token budget
 */
function createPostCompactFileAttachments(readFileState_1, toolUseContext_1, maxFiles_1) {
    return __awaiter(this, arguments, void 0, function (readFileState, toolUseContext, maxFiles, preservedMessages) {
        var preservedReadPaths, recentFiles, results, usedTokens;
        var _this = this;
        if (preservedMessages === void 0) { preservedMessages = []; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    preservedReadPaths = collectReadToolFilePaths(preservedMessages);
                    recentFiles = Object.entries(readFileState)
                        .map(function (_a) {
                        var filename = _a[0], state = _a[1];
                        return (__assign({ filename: filename }, state));
                    })
                        .filter(function (file) {
                        return !shouldExcludeFromPostCompactRestore(file.filename, toolUseContext.agentId) && !preservedReadPaths.has((0, path_js_1.expandPath)(file.filename));
                    })
                        .sort(function (a, b) { return b.timestamp - a.timestamp; })
                        .slice(0, maxFiles);
                    return [4 /*yield*/, Promise.all(recentFiles.map(function (file) { return __awaiter(_this, void 0, void 0, function () {
                            var attachment;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, attachments_js_1.generateFileAttachment)(file.filename, __assign(__assign({}, toolUseContext), { fileReadingLimits: {
                                                maxTokens: exports.POST_COMPACT_MAX_TOKENS_PER_FILE,
                                            } }), 'tengu_post_compact_file_restore_success', 'tengu_post_compact_file_restore_error', 'compact')];
                                    case 1:
                                        attachment = _a.sent();
                                        return [2 /*return*/, attachment ? (0, attachments_js_1.createAttachmentMessage)(attachment) : null];
                                }
                            });
                        }); }))];
                case 1:
                    results = _a.sent();
                    usedTokens = 0;
                    return [2 /*return*/, results.filter(function (result) {
                            if (result === null) {
                                return false;
                            }
                            var attachmentTokens = (0, tokenEstimation_js_1.roughTokenCountEstimation)((0, slowOperations_js_1.jsonStringify)(result));
                            if (usedTokens + attachmentTokens <= exports.POST_COMPACT_TOKEN_BUDGET) {
                                usedTokens += attachmentTokens;
                                return true;
                            }
                            return false;
                        })];
            }
        });
    });
}
/**
 * Creates a plan file attachment if a plan file exists for the current session.
 * This ensures the plan is preserved after compaction.
 */
function createPlanAttachmentIfNeeded(agentId) {
    var planContent = (0, plans_js_1.getPlan)(agentId);
    if (!planContent) {
        return null;
    }
    var planFilePath = (0, plans_js_1.getPlanFilePath)(agentId);
    return (0, attachments_js_1.createAttachmentMessage)({
        type: 'plan_file_reference',
        planFilePath: planFilePath,
        planContent: planContent,
    });
}
/**
 * Creates an attachment for invoked skills to preserve their content across compaction.
 * Only includes skills scoped to the given agent (or main session when agentId is null/undefined).
 * This ensures skill guidelines remain available after the conversation is summarized
 * without leaking skills from other agent contexts.
 */
function createSkillAttachmentIfNeeded(agentId) {
    var invokedSkills = (0, state_js_2.getInvokedSkillsForAgent)(agentId);
    if (invokedSkills.size === 0) {
        return null;
    }
    // Sorted most-recent-first so budget pressure drops the least-relevant skills.
    // Per-skill truncation keeps the head of each file (where setup/usage
    // instructions typically live) rather than dropping whole skills.
    var usedTokens = 0;
    var skills = Array.from(invokedSkills.values())
        .sort(function (a, b) { return b.invokedAt - a.invokedAt; })
        .map(function (skill) { return ({
        name: skill.skillName,
        path: skill.skillPath,
        content: truncateToTokens(skill.content, exports.POST_COMPACT_MAX_TOKENS_PER_SKILL),
    }); })
        .filter(function (skill) {
        var tokens = (0, tokenEstimation_js_1.roughTokenCountEstimation)(skill.content);
        if (usedTokens + tokens > exports.POST_COMPACT_SKILLS_TOKEN_BUDGET) {
            return false;
        }
        usedTokens += tokens;
        return true;
    });
    if (skills.length === 0) {
        return null;
    }
    return (0, attachments_js_1.createAttachmentMessage)({
        type: 'invoked_skills',
        skills: skills,
    });
}
/**
 * Creates a plan_mode attachment if the user is currently in plan mode.
 * This ensures the model continues to operate in plan mode after compaction
 * (otherwise it would lose the plan mode instructions since those are
 * normally only injected on tool-use turns via getAttachmentMessages).
 */
function createPlanModeAttachmentIfNeeded(context) {
    return __awaiter(this, void 0, void 0, function () {
        var appState, planFilePath, planExists;
        return __generator(this, function (_a) {
            appState = context.getAppState();
            if (appState.toolPermissionContext.mode !== 'plan') {
                return [2 /*return*/, null];
            }
            planFilePath = (0, plans_js_1.getPlanFilePath)(context.agentId);
            planExists = (0, plans_js_1.getPlan)(context.agentId) !== null;
            return [2 /*return*/, (0, attachments_js_1.createAttachmentMessage)({
                    type: 'plan_mode',
                    reminderType: 'full',
                    isSubAgent: !!context.agentId,
                    planFilePath: planFilePath,
                    planExists: planExists,
                })];
        });
    });
}
/**
 * Creates attachments for async agents so the model knows about them after
 * compaction. Covers both agents still running in the background (so the model
 * doesn't spawn a duplicate) and agents that have finished but whose results
 * haven't been retrieved yet.
 */
function createAsyncAgentAttachmentsIfNeeded(context) {
    return __awaiter(this, void 0, void 0, function () {
        var appState, asyncAgents;
        return __generator(this, function (_a) {
            appState = context.getAppState();
            asyncAgents = Object.values(appState.tasks).filter(function (task) { return task.type === 'local_agent'; });
            return [2 /*return*/, asyncAgents.flatMap(function (agent) {
                    var _a, _b, _c;
                    if (agent.retrieved ||
                        agent.status === 'pending' ||
                        agent.agentId === context.agentId) {
                        return [];
                    }
                    return [
                        (0, attachments_js_1.createAttachmentMessage)({
                            type: 'task_status',
                            taskId: agent.agentId,
                            taskType: 'local_agent',
                            description: agent.description,
                            status: agent.status,
                            deltaSummary: agent.status === 'running'
                                ? ((_b = (_a = agent.progress) === null || _a === void 0 ? void 0 : _a.summary) !== null && _b !== void 0 ? _b : null)
                                : ((_c = agent.error) !== null && _c !== void 0 ? _c : null),
                            outputFilePath: (0, diskOutput_js_1.getTaskOutputPath)(agent.agentId),
                        }),
                    ];
                })];
        });
    });
}
/**
 * Scan messages for Read tool_use blocks and collect their file_path inputs
 * (normalized via expandPath). Used to dedup post-compact file restoration
 * against what's already visible in the preserved tail.
 *
 * Skips Reads whose tool_result is a dedup stub — the stub points at an
 * earlier full Read that may have been compacted away, so we want
 * createPostCompactFileAttachments to re-inject the real content.
 */
function collectReadToolFilePaths(messages) {
    var stubIds = new Set();
    for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
        var message = messages_1[_i];
        if (message.type !== 'user' || !Array.isArray(message.message.content)) {
            continue;
        }
        for (var _a = 0, _b = message.message.content; _a < _b.length; _a++) {
            var block = _b[_a];
            if (block.type === 'tool_result' &&
                typeof block.content === 'string' &&
                block.content.startsWith(prompt_js_1.FILE_UNCHANGED_STUB)) {
                stubIds.add(block.tool_use_id);
            }
        }
    }
    var paths = new Set();
    for (var _c = 0, messages_2 = messages; _c < messages_2.length; _c++) {
        var message = messages_2[_c];
        if (message.type !== 'assistant' ||
            !Array.isArray(message.message.content)) {
            continue;
        }
        for (var _d = 0, _e = message.message.content; _d < _e.length; _d++) {
            var block = _e[_d];
            if (block.type !== 'tool_use' ||
                block.name !== prompt_js_1.FILE_READ_TOOL_NAME ||
                stubIds.has(block.id)) {
                continue;
            }
            var input = block.input;
            if (input &&
                typeof input === 'object' &&
                'file_path' in input &&
                typeof input.file_path === 'string') {
                paths.add((0, path_js_1.expandPath)(input.file_path));
            }
        }
    }
    return paths;
}
var SKILL_TRUNCATION_MARKER = '\n\n[... skill content truncated for compaction; use Read on the skill path if you need the full text]';
/**
 * Truncate content to roughly maxTokens, keeping the head. roughTokenCountEstimation
 * uses ~4 chars/token (its default bytesPerToken), so char budget = maxTokens * 4
 * minus the marker so the result stays within budget. Marker tells the model it
 * can Read the full file if needed.
 */
function truncateToTokens(content, maxTokens) {
    if ((0, tokenEstimation_js_1.roughTokenCountEstimation)(content) <= maxTokens) {
        return content;
    }
    var charBudget = maxTokens * 4 - SKILL_TRUNCATION_MARKER.length;
    return content.slice(0, charBudget) + SKILL_TRUNCATION_MARKER;
}
function shouldExcludeFromPostCompactRestore(filename, agentId) {
    var normalizedFilename = (0, path_js_1.expandPath)(filename);
    // Exclude plan files
    try {
        var planFilePath = (0, path_js_1.expandPath)((0, plans_js_1.getPlanFilePath)(agentId));
        if (normalizedFilename === planFilePath) {
            return true;
        }
    }
    catch (_a) {
        // If we can't get plan file path, continue with other checks
    }
    // Exclude all types of claude.md files
    // TODO: Refactor to use isMemoryFilePath() from claudemd.ts for consistency
    // and to also match child directory memory files (.claude/rules/*.md, etc.)
    try {
        var normalizedMemoryPaths = new Set(types_js_1.MEMORY_TYPE_VALUES.map(function (type) { return (0, path_js_1.expandPath)((0, config_js_1.getMemoryPath)(type)); }));
        if (normalizedMemoryPaths.has(normalizedFilename)) {
            return true;
        }
    }
    catch (_b) {
        // If we can't get memory paths, continue
    }
    return false;
}
