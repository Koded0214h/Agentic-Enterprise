"use strict";
/**
 * EXPERIMENT: Session memory compaction
 */
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
exports.DEFAULT_SM_COMPACT_CONFIG = void 0;
exports.setSessionMemoryCompactConfig = setSessionMemoryCompactConfig;
exports.getSessionMemoryCompactConfig = getSessionMemoryCompactConfig;
exports.resetSessionMemoryCompactConfig = resetSessionMemoryCompactConfig;
exports.hasTextBlocks = hasTextBlocks;
exports.adjustIndexToPreserveAPIInvariants = adjustIndexToPreserveAPIInvariants;
exports.calculateMessagesToKeepIndex = calculateMessagesToKeepIndex;
exports.shouldUseSessionMemoryCompaction = shouldUseSessionMemoryCompaction;
exports.trySessionMemoryCompaction = trySessionMemoryCompaction;
var debug_js_1 = require("../../utils/debug.js");
var envUtils_js_1 = require("../../utils/envUtils.js");
var errors_js_1 = require("../../utils/errors.js");
var messages_js_1 = require("../../utils/messages.js");
var model_js_1 = require("../../utils/model/model.js");
var filesystem_js_1 = require("../../utils/permissions/filesystem.js");
var sessionStart_js_1 = require("../../utils/sessionStart.js");
var sessionStorage_js_1 = require("../../utils/sessionStorage.js");
var tokens_js_1 = require("../../utils/tokens.js");
var toolSearch_js_1 = require("../../utils/toolSearch.js");
var growthbook_js_1 = require("../analytics/growthbook.js");
var index_js_1 = require("../analytics/index.js");
var prompts_js_1 = require("../SessionMemory/prompts.js");
var sessionMemoryUtils_js_1 = require("../SessionMemory/sessionMemoryUtils.js");
var compact_js_1 = require("./compact.js");
var microCompact_js_1 = require("./microCompact.js");
var prompt_js_1 = require("./prompt.js");
// Default configuration values (exported for use in tests)
exports.DEFAULT_SM_COMPACT_CONFIG = {
    minTokens: 10000,
    minTextBlockMessages: 5,
    maxTokens: 40000,
};
// Current configuration (starts with defaults)
var smCompactConfig = __assign({}, exports.DEFAULT_SM_COMPACT_CONFIG);
// Track whether config has been initialized from remote
var configInitialized = false;
/**
 * Set the session memory compact configuration
 */
function setSessionMemoryCompactConfig(config) {
    smCompactConfig = __assign(__assign({}, smCompactConfig), config);
}
/**
 * Get the current session memory compact configuration
 */
function getSessionMemoryCompactConfig() {
    return __assign({}, smCompactConfig);
}
/**
 * Reset config state (useful for testing)
 */
function resetSessionMemoryCompactConfig() {
    smCompactConfig = __assign({}, exports.DEFAULT_SM_COMPACT_CONFIG);
    configInitialized = false;
}
/**
 * Initialize configuration from remote config (GrowthBook).
 * Only fetches once per session - subsequent calls return immediately.
 */
function initSessionMemoryCompactConfig() {
    return __awaiter(this, void 0, void 0, function () {
        var remoteConfig, config;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (configInitialized) {
                        return [2 /*return*/];
                    }
                    configInitialized = true;
                    return [4 /*yield*/, (0, growthbook_js_1.getDynamicConfig_BLOCKS_ON_INIT)('tengu_sm_compact_config', {})
                        // Only use remote values if they are explicitly set (positive numbers)
                        // This ensures sensible defaults aren't overridden by zero values
                    ];
                case 1:
                    remoteConfig = _a.sent();
                    config = {
                        minTokens: remoteConfig.minTokens && remoteConfig.minTokens > 0
                            ? remoteConfig.minTokens
                            : exports.DEFAULT_SM_COMPACT_CONFIG.minTokens,
                        minTextBlockMessages: remoteConfig.minTextBlockMessages && remoteConfig.minTextBlockMessages > 0
                            ? remoteConfig.minTextBlockMessages
                            : exports.DEFAULT_SM_COMPACT_CONFIG.minTextBlockMessages,
                        maxTokens: remoteConfig.maxTokens && remoteConfig.maxTokens > 0
                            ? remoteConfig.maxTokens
                            : exports.DEFAULT_SM_COMPACT_CONFIG.maxTokens,
                    };
                    setSessionMemoryCompactConfig(config);
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Check if a message contains text blocks (text content for user/assistant interaction)
 */
function hasTextBlocks(message) {
    if (message.type === 'assistant') {
        var content = message.message.content;
        return content.some(function (block) { return block.type === 'text'; });
    }
    if (message.type === 'user') {
        var content = message.message.content;
        if (typeof content === 'string') {
            return content.length > 0;
        }
        if (Array.isArray(content)) {
            return content.some(function (block) { return block.type === 'text'; });
        }
    }
    return false;
}
/**
 * Check if a message contains tool_result blocks and return their tool_use_ids
 */
function getToolResultIds(message) {
    if (message.type !== 'user') {
        return [];
    }
    var content = message.message.content;
    if (!Array.isArray(content)) {
        return [];
    }
    var ids = [];
    for (var _i = 0, content_1 = content; _i < content_1.length; _i++) {
        var block = content_1[_i];
        if (block.type === 'tool_result') {
            ids.push(block.tool_use_id);
        }
    }
    return ids;
}
/**
 * Check if a message contains tool_use blocks with any of the given ids
 */
function hasToolUseWithIds(message, toolUseIds) {
    if (message.type !== 'assistant') {
        return false;
    }
    var content = message.message.content;
    if (!Array.isArray(content)) {
        return false;
    }
    return content.some(function (block) { return block.type === 'tool_use' && toolUseIds.has(block.id); });
}
/**
 * Adjust the start index to ensure we don't split tool_use/tool_result pairs
 * or thinking blocks that share the same message.id with kept assistant messages.
 *
 * If ANY message we're keeping contains tool_result blocks, we need to
 * include the preceding assistant message(s) that contain the matching tool_use blocks.
 *
 * Additionally, if ANY assistant message in the kept range has the same message.id
 * as a preceding assistant message (which may contain thinking blocks), we need to
 * include those messages so they can be properly merged by normalizeMessagesForAPI.
 *
 * This handles the case where streaming yields separate messages per content block
 * (thinking, tool_use, etc.) with the same message.id but different uuids. If the
 * startIndex lands on one of these streaming messages, we need to look at ALL kept
 * messages for tool_results, not just the first one.
 *
 * Example bug scenarios this fixes:
 *
 * Tool pair scenario:
 *   Session storage (before compaction):
 *     Index N:   assistant, message.id: X, content: [thinking]
 *     Index N+1: assistant, message.id: X, content: [tool_use: ORPHAN_ID]
 *     Index N+2: assistant, message.id: X, content: [tool_use: VALID_ID]
 *     Index N+3: user, content: [tool_result: ORPHAN_ID, tool_result: VALID_ID]
 *
 *   If startIndex = N+2:
 *     - Old code: checked only message N+2 for tool_results, found none, returned N+2
 *     - After slicing and normalizeMessagesForAPI merging by message.id:
 *       msg[1]: assistant with [tool_use: VALID_ID]  (ORPHAN tool_use was excluded!)
 *       msg[2]: user with [tool_result: ORPHAN_ID, tool_result: VALID_ID]
 *     - API error: orphan tool_result references non-existent tool_use
 *
 * Thinking block scenario:
 *   Session storage (before compaction):
 *     Index N:   assistant, message.id: X, content: [thinking]
 *     Index N+1: assistant, message.id: X, content: [tool_use: ID]
 *     Index N+2: user, content: [tool_result: ID]
 *
 *   If startIndex = N+1:
 *     - Without this fix: thinking block at N is excluded
 *     - After normalizeMessagesForAPI: thinking block is lost (no message to merge with)
 *
 *   Fixed code: detects that message N+1 has same message.id as N, adjusts to N.
 */
function adjustIndexToPreserveAPIInvariants(messages, startIndex) {
    if (startIndex <= 0 || startIndex >= messages.length) {
        return startIndex;
    }
    var adjustedIndex = startIndex;
    // Step 1: Handle tool_use/tool_result pairs
    // Collect tool_result IDs from ALL messages in the kept range
    var allToolResultIds = [];
    for (var i = startIndex; i < messages.length; i++) {
        allToolResultIds.push.apply(allToolResultIds, getToolResultIds(messages[i]));
    }
    if (allToolResultIds.length > 0) {
        // Collect tool_use IDs already in the kept range
        var toolUseIdsInKeptRange_1 = new Set();
        for (var i = adjustedIndex; i < messages.length; i++) {
            var msg = messages[i];
            if (msg.type === 'assistant' && Array.isArray(msg.message.content)) {
                for (var _i = 0, _a = msg.message.content; _i < _a.length; _i++) {
                    var block = _a[_i];
                    if (block.type === 'tool_use') {
                        toolUseIdsInKeptRange_1.add(block.id);
                    }
                }
            }
        }
        // Only look for tool_uses that are NOT already in the kept range
        var neededToolUseIds = new Set(allToolResultIds.filter(function (id) { return !toolUseIdsInKeptRange_1.has(id); }));
        // Find the assistant message(s) with matching tool_use blocks
        for (var i = adjustedIndex - 1; i >= 0 && neededToolUseIds.size > 0; i--) {
            var message = messages[i];
            if (hasToolUseWithIds(message, neededToolUseIds)) {
                adjustedIndex = i;
                // Remove found tool_use_ids from the set
                if (message.type === 'assistant' &&
                    Array.isArray(message.message.content)) {
                    for (var _b = 0, _c = message.message.content; _b < _c.length; _b++) {
                        var block = _c[_b];
                        if (block.type === 'tool_use' && neededToolUseIds.has(block.id)) {
                            neededToolUseIds.delete(block.id);
                        }
                    }
                }
            }
        }
    }
    // Step 2: Handle thinking blocks that share message.id with kept assistant messages
    // Collect all message.ids from assistant messages in the kept range
    var messageIdsInKeptRange = new Set();
    for (var i = adjustedIndex; i < messages.length; i++) {
        var msg = messages[i];
        if (msg.type === 'assistant' && msg.message.id) {
            messageIdsInKeptRange.add(msg.message.id);
        }
    }
    // Look backwards for assistant messages with the same message.id that are not in the kept range
    // These may contain thinking blocks that need to be merged by normalizeMessagesForAPI
    for (var i = adjustedIndex - 1; i >= 0; i--) {
        var message = messages[i];
        if (message.type === 'assistant' &&
            message.message.id &&
            messageIdsInKeptRange.has(message.message.id)) {
            // This message has the same message.id as one in the kept range
            // Include it so thinking blocks can be properly merged
            adjustedIndex = i;
        }
    }
    return adjustedIndex;
}
/**
 * Calculate the starting index for messages to keep after compaction.
 * Starts from lastSummarizedMessageId, then expands backwards to meet minimums:
 * - At least config.minTokens tokens
 * - At least config.minTextBlockMessages messages with text blocks
 * Stops expanding if config.maxTokens is reached.
 * Also ensures tool_use/tool_result pairs are not split.
 */
function calculateMessagesToKeepIndex(messages, lastSummarizedIndex) {
    if (messages.length === 0) {
        return 0;
    }
    var config = getSessionMemoryCompactConfig();
    // Start from the message after lastSummarizedIndex
    // If lastSummarizedIndex is -1 (not found) or messages.length (no summarized id),
    // we start with no messages kept
    var startIndex = lastSummarizedIndex >= 0 ? lastSummarizedIndex + 1 : messages.length;
    // Calculate current tokens and text-block message count from startIndex to end
    var totalTokens = 0;
    var textBlockMessageCount = 0;
    for (var i = startIndex; i < messages.length; i++) {
        var msg = messages[i];
        totalTokens += (0, microCompact_js_1.estimateMessageTokens)([msg]);
        if (hasTextBlocks(msg)) {
            textBlockMessageCount++;
        }
    }
    // Check if we already hit the max cap
    if (totalTokens >= config.maxTokens) {
        return adjustIndexToPreserveAPIInvariants(messages, startIndex);
    }
    // Check if we already meet both minimums
    if (totalTokens >= config.minTokens &&
        textBlockMessageCount >= config.minTextBlockMessages) {
        return adjustIndexToPreserveAPIInvariants(messages, startIndex);
    }
    // Expand backwards until we meet both minimums or hit max cap.
    // Floor at the last boundary: the preserved-segment chain has a disk
    // discontinuity there (att[0]→summary shortcut from dedup-skip), which
    // would let the loader's tail→head walk bypass inner preserved messages
    // and then prune them. Reactive compact already slices at the boundary
    // via getMessagesAfterCompactBoundary; this is the same invariant.
    var idx = messages.findLastIndex(function (m) { return (0, messages_js_1.isCompactBoundaryMessage)(m); });
    var floor = idx === -1 ? 0 : idx + 1;
    for (var i = startIndex - 1; i >= floor; i--) {
        var msg = messages[i];
        var msgTokens = (0, microCompact_js_1.estimateMessageTokens)([msg]);
        totalTokens += msgTokens;
        if (hasTextBlocks(msg)) {
            textBlockMessageCount++;
        }
        startIndex = i;
        // Stop if we hit the max cap
        if (totalTokens >= config.maxTokens) {
            break;
        }
        // Stop if we meet both minimums
        if (totalTokens >= config.minTokens &&
            textBlockMessageCount >= config.minTextBlockMessages) {
            break;
        }
    }
    // Adjust for tool pairs
    return adjustIndexToPreserveAPIInvariants(messages, startIndex);
}
/**
 * Check if we should use session memory for compaction
 * Uses cached gate values to avoid blocking on Statsig initialization
 */
function shouldUseSessionMemoryCompaction() {
    // Allow env var override for eval runs and testing
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.ENABLE_CLAUDE_CODE_SM_COMPACT)) {
        return true;
    }
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.DISABLE_CLAUDE_CODE_SM_COMPACT)) {
        return false;
    }
    var sessionMemoryFlag = (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_session_memory', false);
    var smCompactFlag = (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_sm_compact', false);
    var shouldUse = sessionMemoryFlag && smCompactFlag;
    // Log flag states for debugging (ant-only to avoid noise in external logs)
    if (process.env.USER_TYPE === 'ant') {
        (0, index_js_1.logEvent)('tengu_sm_compact_flag_check', {
            tengu_session_memory: sessionMemoryFlag,
            tengu_sm_compact: smCompactFlag,
            should_use: shouldUse,
        });
    }
    return shouldUse;
}
/**
 * Create a CompactionResult from session memory
 */
function createCompactionResultFromSessionMemory(messages, sessionMemory, messagesToKeep, hookResults, transcriptPath, agentId) {
    var _a;
    var preCompactTokenCount = (0, tokens_js_1.tokenCountFromLastAPIResponse)(messages);
    var boundaryMarker = (0, messages_js_1.createCompactBoundaryMessage)('auto', preCompactTokenCount !== null && preCompactTokenCount !== void 0 ? preCompactTokenCount : 0, (_a = messages[messages.length - 1]) === null || _a === void 0 ? void 0 : _a.uuid);
    var preCompactDiscovered = (0, toolSearch_js_1.extractDiscoveredToolNames)(messages);
    if (preCompactDiscovered.size > 0) {
        boundaryMarker.compactMetadata.preCompactDiscoveredTools = __spreadArray([], preCompactDiscovered, true).sort();
    }
    // Truncate oversized sections to prevent session memory from consuming
    // the entire post-compact token budget
    var _b = (0, prompts_js_1.truncateSessionMemoryForCompact)(sessionMemory), truncatedContent = _b.truncatedContent, wasTruncated = _b.wasTruncated;
    var summaryContent = (0, prompt_js_1.getCompactUserSummaryMessage)(truncatedContent, true, transcriptPath, true);
    if (wasTruncated) {
        var memoryPath = (0, filesystem_js_1.getSessionMemoryPath)();
        summaryContent += "\n\nSome session memory sections were truncated for length. The full session memory can be viewed at: ".concat(memoryPath);
    }
    var summaryMessages = [
        (0, messages_js_1.createUserMessage)({
            content: summaryContent,
            isCompactSummary: true,
            isVisibleInTranscriptOnly: true,
        }),
    ];
    var planAttachment = (0, compact_js_1.createPlanAttachmentIfNeeded)(agentId);
    var attachments = planAttachment ? [planAttachment] : [];
    return {
        boundaryMarker: (0, compact_js_1.annotateBoundaryWithPreservedSegment)(boundaryMarker, summaryMessages[summaryMessages.length - 1].uuid, messagesToKeep),
        summaryMessages: summaryMessages,
        attachments: attachments,
        hookResults: hookResults,
        messagesToKeep: messagesToKeep,
        preCompactTokenCount: preCompactTokenCount,
        // SM-compact has no compact-API-call, so postCompactTokenCount (kept for
        // event continuity) and truePostCompactTokenCount converge to the same value.
        postCompactTokenCount: (0, microCompact_js_1.estimateMessageTokens)(summaryMessages),
        truePostCompactTokenCount: (0, microCompact_js_1.estimateMessageTokens)(summaryMessages),
    };
}
/**
 * Try to use session memory for compaction instead of traditional compaction.
 * Returns null if session memory compaction cannot be used.
 *
 * Handles two scenarios:
 * 1. Normal case: lastSummarizedMessageId is set, keep only messages after that ID
 * 2. Resumed session: lastSummarizedMessageId is not set but session memory has content,
 *    keep all messages but use session memory as the summary
 */
function trySessionMemoryCompaction(messages, agentId, autoCompactThreshold) {
    return __awaiter(this, void 0, void 0, function () {
        var lastSummarizedMessageId, sessionMemory, lastSummarizedIndex, startIndex, messagesToKeep, hookResults, transcriptPath, compactionResult, postCompactMessages, postCompactTokenCount, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!shouldUseSessionMemoryCompaction()) {
                        return [2 /*return*/, null];
                    }
                    // Initialize config from remote (only fetches once)
                    return [4 /*yield*/, initSessionMemoryCompactConfig()
                        // Wait for any in-progress session memory extraction to complete (with timeout)
                    ];
                case 1:
                    // Initialize config from remote (only fetches once)
                    _a.sent();
                    // Wait for any in-progress session memory extraction to complete (with timeout)
                    return [4 /*yield*/, (0, sessionMemoryUtils_js_1.waitForSessionMemoryExtraction)()];
                case 2:
                    // Wait for any in-progress session memory extraction to complete (with timeout)
                    _a.sent();
                    lastSummarizedMessageId = (0, sessionMemoryUtils_js_1.getLastSummarizedMessageId)();
                    return [4 /*yield*/, (0, sessionMemoryUtils_js_1.getSessionMemoryContent)()
                        // No session memory file exists at all
                    ];
                case 3:
                    sessionMemory = _a.sent();
                    // No session memory file exists at all
                    if (!sessionMemory) {
                        (0, index_js_1.logEvent)('tengu_sm_compact_no_session_memory', {});
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, (0, prompts_js_1.isSessionMemoryEmpty)(sessionMemory)];
                case 4:
                    // Session memory exists but matches the template (no actual content extracted)
                    // Fall back to legacy compact behavior
                    if (_a.sent()) {
                        (0, index_js_1.logEvent)('tengu_sm_compact_empty_template', {});
                        return [2 /*return*/, null];
                    }
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 7, , 8]);
                    lastSummarizedIndex = void 0;
                    if (lastSummarizedMessageId) {
                        // Normal case: we know exactly which messages have been summarized
                        lastSummarizedIndex = messages.findIndex(function (msg) { return msg.uuid === lastSummarizedMessageId; });
                        if (lastSummarizedIndex === -1) {
                            // The summarized message ID doesn't exist in current messages
                            // This can happen if messages were modified - fall back to legacy compact
                            // since we can't determine the boundary between summarized and unsummarized messages
                            (0, index_js_1.logEvent)('tengu_sm_compact_summarized_id_not_found', {});
                            return [2 /*return*/, null];
                        }
                    }
                    else {
                        // Resumed session case: session memory has content but we don't know the boundary
                        // Set lastSummarizedIndex to last message so startIndex becomes messages.length (no messages kept initially)
                        lastSummarizedIndex = messages.length - 1;
                        (0, index_js_1.logEvent)('tengu_sm_compact_resumed_session', {});
                    }
                    startIndex = calculateMessagesToKeepIndex(messages, lastSummarizedIndex);
                    messagesToKeep = messages
                        .slice(startIndex)
                        .filter(function (m) { return !(0, messages_js_1.isCompactBoundaryMessage)(m); });
                    return [4 /*yield*/, (0, sessionStart_js_1.processSessionStartHooks)('compact', {
                            model: (0, model_js_1.getMainLoopModel)(),
                        })
                        // Get transcript path for the summary message
                    ];
                case 6:
                    hookResults = _a.sent();
                    transcriptPath = (0, sessionStorage_js_1.getTranscriptPath)();
                    compactionResult = createCompactionResultFromSessionMemory(messages, sessionMemory, messagesToKeep, hookResults, transcriptPath, agentId);
                    postCompactMessages = (0, compact_js_1.buildPostCompactMessages)(compactionResult);
                    postCompactTokenCount = (0, microCompact_js_1.estimateMessageTokens)(postCompactMessages);
                    // Only check threshold if one was provided (for autocompact)
                    if (autoCompactThreshold !== undefined &&
                        postCompactTokenCount >= autoCompactThreshold) {
                        (0, index_js_1.logEvent)('tengu_sm_compact_threshold_exceeded', {
                            postCompactTokenCount: postCompactTokenCount,
                            autoCompactThreshold: autoCompactThreshold,
                        });
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, __assign(__assign({}, compactionResult), { postCompactTokenCount: postCompactTokenCount, truePostCompactTokenCount: postCompactTokenCount })];
                case 7:
                    error_1 = _a.sent();
                    // Use logEvent instead of logError since errors here are expected
                    // (e.g., file not found, path issues) and shouldn't go to error logs
                    (0, index_js_1.logEvent)('tengu_sm_compact_error', {});
                    if (process.env.USER_TYPE === 'ant') {
                        (0, debug_js_1.logForDebugging)("Session memory compaction error: ".concat((0, errors_js_1.errorMessage)(error_1)));
                    }
                    return [2 /*return*/, null];
                case 8: return [2 /*return*/];
            }
        });
    });
}
