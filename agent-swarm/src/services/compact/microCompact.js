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
exports.TIME_BASED_MC_CLEARED_MESSAGE = void 0;
exports.consumePendingCacheEdits = consumePendingCacheEdits;
exports.getPinnedCacheEdits = getPinnedCacheEdits;
exports.pinCacheEdits = pinCacheEdits;
exports.markToolsSentToAPIState = markToolsSentToAPIState;
exports.resetMicrocompactState = resetMicrocompactState;
exports.estimateMessageTokens = estimateMessageTokens;
exports.microcompactMessages = microcompactMessages;
exports.evaluateTimeBasedTrigger = evaluateTimeBasedTrigger;
var bun_bundle_1 = require("bun:bundle");
var constants_js_1 = require("../../tools/FileEditTool/constants.js");
var prompt_js_1 = require("../../tools/FileReadTool/prompt.js");
var prompt_js_2 = require("../../tools/FileWriteTool/prompt.js");
var prompt_js_3 = require("../../tools/GlobTool/prompt.js");
var prompt_js_4 = require("../../tools/GrepTool/prompt.js");
var prompt_js_5 = require("../../tools/WebFetchTool/prompt.js");
var prompt_js_6 = require("../../tools/WebSearchTool/prompt.js");
var debug_js_1 = require("../../utils/debug.js");
var model_js_1 = require("../../utils/model/model.js");
var shellToolUtils_js_1 = require("../../utils/shell/shellToolUtils.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var index_js_1 = require("../analytics/index.js");
var promptCacheBreakDetection_js_1 = require("../api/promptCacheBreakDetection.js");
var tokenEstimation_js_1 = require("../tokenEstimation.js");
var compactWarningState_js_1 = require("./compactWarningState.js");
var timeBasedMCConfig_js_1 = require("./timeBasedMCConfig.js");
// Inline from utils/toolResultStorage.ts — importing that file pulls in
// sessionStorage → utils/messages → services/api/errors, completing a
// circular-deps loop back through this file via promptCacheBreakDetection.
// Drift is caught by a test asserting equality with the source-of-truth.
exports.TIME_BASED_MC_CLEARED_MESSAGE = '[Old tool result content cleared]';
var IMAGE_MAX_TOKEN_SIZE = 2000;
// Only compact these tools
var COMPACTABLE_TOOLS = new Set(__spreadArray(__spreadArray([
    prompt_js_1.FILE_READ_TOOL_NAME
], shellToolUtils_js_1.SHELL_TOOL_NAMES, true), [
    prompt_js_4.GREP_TOOL_NAME,
    prompt_js_3.GLOB_TOOL_NAME,
    prompt_js_6.WEB_SEARCH_TOOL_NAME,
    prompt_js_5.WEB_FETCH_TOOL_NAME,
    constants_js_1.FILE_EDIT_TOOL_NAME,
    prompt_js_2.FILE_WRITE_TOOL_NAME,
], false));
// --- Cached microcompact state (ant-only, gated by feature('CACHED_MICROCOMPACT')) ---
// Lazy-initialized cached MC module and state to avoid importing in external builds.
// The imports and state live inside feature() checks for dead code elimination.
var cachedMCModule = null;
var cachedMCState = null;
var pendingCacheEdits = null;
function getCachedMCModule() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!cachedMCModule) return [3 /*break*/, 2];
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./cachedMicrocompact.js'); })];
                case 1:
                    cachedMCModule = _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/, cachedMCModule];
            }
        });
    });
}
function ensureCachedMCState() {
    if (!cachedMCState && cachedMCModule) {
        cachedMCState = cachedMCModule.createCachedMCState();
    }
    if (!cachedMCState) {
        throw new Error('cachedMCState not initialized — getCachedMCModule() must be called first');
    }
    return cachedMCState;
}
/**
 * Get new pending cache edits to be included in the next API request.
 * Returns null if there are no new pending edits.
 * Clears the pending state (caller must pin them after insertion).
 */
function consumePendingCacheEdits() {
    var edits = pendingCacheEdits;
    pendingCacheEdits = null;
    return edits;
}
/**
 * Get all previously-pinned cache edits that must be re-sent at their
 * original positions for cache hits.
 */
function getPinnedCacheEdits() {
    if (!cachedMCState) {
        return [];
    }
    return cachedMCState.pinnedEdits;
}
/**
 * Pin a new cache_edits block to a specific user message position.
 * Called after inserting new edits so they are re-sent in subsequent calls.
 */
function pinCacheEdits(userMessageIndex, block) {
    if (cachedMCState) {
        cachedMCState.pinnedEdits.push({ userMessageIndex: userMessageIndex, block: block });
    }
}
/**
 * Marks all registered tools as sent to the API.
 * Called after a successful API response.
 */
function markToolsSentToAPIState() {
    if (cachedMCState && cachedMCModule) {
        cachedMCModule.markToolsSentToAPI(cachedMCState);
    }
}
function resetMicrocompactState() {
    if (cachedMCState && cachedMCModule) {
        cachedMCModule.resetCachedMCState(cachedMCState);
    }
    pendingCacheEdits = null;
}
// Helper to calculate tool result tokens
function calculateToolResultTokens(block) {
    if (!block.content) {
        return 0;
    }
    if (typeof block.content === 'string') {
        return (0, tokenEstimation_js_1.roughTokenCountEstimation)(block.content);
    }
    // Array of TextBlockParam | ImageBlockParam | DocumentBlockParam
    return block.content.reduce(function (sum, item) {
        if (item.type === 'text') {
            return sum + (0, tokenEstimation_js_1.roughTokenCountEstimation)(item.text);
        }
        else if (item.type === 'image' || item.type === 'document') {
            // Images/documents are approximately 2000 tokens regardless of format
            return sum + IMAGE_MAX_TOKEN_SIZE;
        }
        return sum;
    }, 0);
}
/**
 * Estimate token count for messages by extracting text content
 * Used for rough token estimation when we don't have accurate API counts
 * Pads estimate by 4/3 to be conservative since we're approximating
 */
function estimateMessageTokens(messages) {
    var _a;
    var totalTokens = 0;
    for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
        var message = messages_1[_i];
        if (message.type !== 'user' && message.type !== 'assistant') {
            continue;
        }
        if (!Array.isArray(message.message.content)) {
            continue;
        }
        for (var _b = 0, _c = message.message.content; _b < _c.length; _b++) {
            var block = _c[_b];
            if (block.type === 'text') {
                totalTokens += (0, tokenEstimation_js_1.roughTokenCountEstimation)(block.text);
            }
            else if (block.type === 'tool_result') {
                totalTokens += calculateToolResultTokens(block);
            }
            else if (block.type === 'image' || block.type === 'document') {
                totalTokens += IMAGE_MAX_TOKEN_SIZE;
            }
            else if (block.type === 'thinking') {
                // Match roughTokenCountEstimationForBlock: count only the thinking
                // text, not the JSON wrapper or signature (signature is metadata,
                // not model-tokenized content).
                totalTokens += (0, tokenEstimation_js_1.roughTokenCountEstimation)(block.thinking);
            }
            else if (block.type === 'redacted_thinking') {
                totalTokens += (0, tokenEstimation_js_1.roughTokenCountEstimation)(block.data);
            }
            else if (block.type === 'tool_use') {
                // Match roughTokenCountEstimationForBlock: count name + input,
                // not the JSON wrapper or id field.
                totalTokens += (0, tokenEstimation_js_1.roughTokenCountEstimation)(block.name + (0, slowOperations_js_1.jsonStringify)((_a = block.input) !== null && _a !== void 0 ? _a : {}));
            }
            else {
                // server_tool_use, web_search_tool_result, etc.
                totalTokens += (0, tokenEstimation_js_1.roughTokenCountEstimation)((0, slowOperations_js_1.jsonStringify)(block));
            }
        }
    }
    // Pad estimate by 4/3 to be conservative since we're approximating
    return Math.ceil(totalTokens * (4 / 3));
}
/**
 * Walk messages and collect tool_use IDs whose tool name is in
 * COMPACTABLE_TOOLS, in encounter order. Shared by both microcompact paths.
 */
function collectCompactableToolIds(messages) {
    var ids = [];
    for (var _i = 0, messages_2 = messages; _i < messages_2.length; _i++) {
        var message = messages_2[_i];
        if (message.type === 'assistant' &&
            Array.isArray(message.message.content)) {
            for (var _a = 0, _b = message.message.content; _a < _b.length; _a++) {
                var block = _b[_a];
                if (block.type === 'tool_use' && COMPACTABLE_TOOLS.has(block.name)) {
                    ids.push(block.id);
                }
            }
        }
    }
    return ids;
}
// Prefix-match because promptCategory.ts sets the querySource to
// 'repl_main_thread:outputStyle:<style>' when a non-default output style
// is active. The bare 'repl_main_thread' is only used for the default style.
// query.ts:350/1451 use the same startsWith pattern; the pre-existing
// cached-MC `=== 'repl_main_thread'` check was a latent bug — users with a
// non-default output style were silently excluded from cached MC.
function isMainThreadSource(querySource) {
    return !querySource || querySource.startsWith('repl_main_thread');
}
function microcompactMessages(messages, toolUseContext, querySource) {
    return __awaiter(this, void 0, void 0, function () {
        var timeBasedResult, mod, model;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    // Clear suppression flag at start of new microcompact attempt
                    (0, compactWarningState_js_1.clearCompactWarningSuppression)();
                    timeBasedResult = maybeTimeBasedMicrocompact(messages, querySource);
                    if (timeBasedResult) {
                        return [2 /*return*/, timeBasedResult];
                    }
                    if (!(0, bun_bundle_1.feature)('CACHED_MICROCOMPACT')) return [3 /*break*/, 3];
                    return [4 /*yield*/, getCachedMCModule()];
                case 1:
                    mod = _b.sent();
                    model = (_a = toolUseContext === null || toolUseContext === void 0 ? void 0 : toolUseContext.options.mainLoopModel) !== null && _a !== void 0 ? _a : (0, model_js_1.getMainLoopModel)();
                    if (!(mod.isCachedMicrocompactEnabled() &&
                        mod.isModelSupportedForCacheEditing(model) &&
                        isMainThreadSource(querySource))) return [3 /*break*/, 3];
                    return [4 /*yield*/, cachedMicrocompactPath(messages, querySource)];
                case 2: return [2 /*return*/, _b.sent()];
                case 3: 
                // Legacy microcompact path removed — tengu_cache_plum_violet is always true.
                // For contexts where cached microcompact is not available (external builds,
                // non-ant users, unsupported models, sub-agents), no compaction happens here;
                // autocompact handles context pressure instead.
                return [2 /*return*/, { messages: messages }];
            }
        });
    });
}
/**
 * Cached microcompact path - uses cache editing API to remove tool results
 * without invalidating the cached prefix.
 *
 * Key differences from regular microcompact:
 * - Does NOT modify local message content (cache_reference and cache_edits are added at API layer)
 * - Uses count-based trigger/keep thresholds from GrowthBook config
 * - Takes precedence over regular microcompact (no disk persistence)
 * - Tracks tool results and queues cache edits for the API layer
 */
function cachedMicrocompactPath(messages, querySource) {
    return __awaiter(this, void 0, void 0, function () {
        var mod, state, config, compactableToolIds, _i, messages_3, message, groupIds, _a, _b, block, toolsToDelete, cacheEdits, lastAsst, baseline;
        var _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, getCachedMCModule()];
                case 1:
                    mod = _e.sent();
                    state = ensureCachedMCState();
                    config = mod.getCachedMCConfig();
                    compactableToolIds = new Set(collectCompactableToolIds(messages));
                    // Second pass: register tool results grouped by user message
                    for (_i = 0, messages_3 = messages; _i < messages_3.length; _i++) {
                        message = messages_3[_i];
                        if (message.type === 'user' && Array.isArray(message.message.content)) {
                            groupIds = [];
                            for (_a = 0, _b = message.message.content; _a < _b.length; _a++) {
                                block = _b[_a];
                                if (block.type === 'tool_result' &&
                                    compactableToolIds.has(block.tool_use_id) &&
                                    !state.registeredTools.has(block.tool_use_id)) {
                                    mod.registerToolResult(state, block.tool_use_id);
                                    groupIds.push(block.tool_use_id);
                                }
                            }
                            mod.registerToolMessage(state, groupIds);
                        }
                    }
                    toolsToDelete = mod.getToolResultsToDelete(state);
                    if (toolsToDelete.length > 0) {
                        cacheEdits = mod.createCacheEditsBlock(state, toolsToDelete);
                        if (cacheEdits) {
                            pendingCacheEdits = cacheEdits;
                        }
                        (0, debug_js_1.logForDebugging)("Cached MC deleting ".concat(toolsToDelete.length, " tool(s): ").concat(toolsToDelete.join(', ')));
                        // Log the event
                        (0, index_js_1.logEvent)('tengu_cached_microcompact', {
                            toolsDeleted: toolsToDelete.length,
                            deletedToolIds: toolsToDelete.join(','),
                            activeToolCount: state.toolOrder.length - state.deletedRefs.size,
                            triggerType: 'auto',
                            threshold: config.triggerThreshold,
                            keepRecent: config.keepRecent,
                        });
                        // Suppress warning after successful compaction
                        (0, compactWarningState_js_1.suppressCompactWarning)();
                        // Notify cache break detection that cache reads will legitimately drop
                        if ((0, bun_bundle_1.feature)('PROMPT_CACHE_BREAK_DETECTION')) {
                            // Pass the actual querySource — isMainThreadSource now prefix-matches
                            // so output-style variants enter here, and getTrackingKey keys on the
                            // full source string, not the 'repl_main_thread' prefix.
                            (0, promptCacheBreakDetection_js_1.notifyCacheDeletion)(querySource !== null && querySource !== void 0 ? querySource : 'repl_main_thread');
                        }
                        lastAsst = messages.findLast(function (m) { return m.type === 'assistant'; });
                        baseline = (lastAsst === null || lastAsst === void 0 ? void 0 : lastAsst.type) === 'assistant'
                            ? ((_d = (_c = lastAsst.message.usage) === null || _c === void 0 ? void 0 : _c.cache_deleted_input_tokens) !== null && _d !== void 0 ? _d : 0)
                            : 0;
                        return [2 /*return*/, {
                                messages: messages,
                                compactionInfo: {
                                    pendingCacheEdits: {
                                        trigger: 'auto',
                                        deletedToolIds: toolsToDelete,
                                        baselineCacheDeletedTokens: baseline,
                                    },
                                },
                            }];
                    }
                    // No compaction needed, return messages unchanged
                    return [2 /*return*/, { messages: messages }];
            }
        });
    });
}
/**
 * Time-based microcompact: when the gap since the last main-loop assistant
 * message exceeds the configured threshold, content-clear all but the most
 * recent N compactable tool results.
 *
 * Returns null when the trigger doesn't fire (disabled, wrong source, gap
 * under threshold, nothing to clear) — caller falls through to other paths.
 *
 * Unlike cached MC, this mutates message content directly. The cache is cold,
 * so there's no cached prefix to preserve via cache_edits.
 */
/**
 * Check whether the time-based trigger should fire for this request.
 *
 * Returns the measured gap (minutes since last assistant message) when the
 * trigger fires, or null when it doesn't (disabled, wrong source, under
 * threshold, no prior assistant, unparseable timestamp).
 *
 * Extracted so other pre-request paths (e.g. snip force-apply) can consult
 * the same predicate without coupling to the tool-result clearing action.
 */
function evaluateTimeBasedTrigger(messages, querySource) {
    var config = (0, timeBasedMCConfig_js_1.getTimeBasedMCConfig)();
    // Require an explicit main-thread querySource. isMainThreadSource treats
    // undefined as main-thread (for cached-MC backward-compat), but several
    // callers (/context, /compact, analyzeContext) invoke microcompactMessages
    // without a source for analysis-only purposes — they should not trigger.
    if (!config.enabled || !querySource || !isMainThreadSource(querySource)) {
        return null;
    }
    var lastAssistant = messages.findLast(function (m) { return m.type === 'assistant'; });
    if (!lastAssistant) {
        return null;
    }
    var gapMinutes = (Date.now() - new Date(lastAssistant.timestamp).getTime()) / 60000;
    if (!Number.isFinite(gapMinutes) || gapMinutes < config.gapThresholdMinutes) {
        return null;
    }
    return { gapMinutes: gapMinutes, config: config };
}
function maybeTimeBasedMicrocompact(messages, querySource) {
    var trigger = evaluateTimeBasedTrigger(messages, querySource);
    if (!trigger) {
        return null;
    }
    var gapMinutes = trigger.gapMinutes, config = trigger.config;
    var compactableIds = collectCompactableToolIds(messages);
    // Floor at 1: slice(-0) returns the full array (paradoxically keeps
    // everything), and clearing ALL results leaves the model with zero working
    // context. Neither degenerate is sensible — always keep at least the last.
    var keepRecent = Math.max(1, config.keepRecent);
    var keepSet = new Set(compactableIds.slice(-keepRecent));
    var clearSet = new Set(compactableIds.filter(function (id) { return !keepSet.has(id); }));
    if (clearSet.size === 0) {
        return null;
    }
    var tokensSaved = 0;
    var result = messages.map(function (message) {
        if (message.type !== 'user' || !Array.isArray(message.message.content)) {
            return message;
        }
        var touched = false;
        var newContent = message.message.content.map(function (block) {
            if (block.type === 'tool_result' &&
                clearSet.has(block.tool_use_id) &&
                block.content !== exports.TIME_BASED_MC_CLEARED_MESSAGE) {
                tokensSaved += calculateToolResultTokens(block);
                touched = true;
                return __assign(__assign({}, block), { content: exports.TIME_BASED_MC_CLEARED_MESSAGE });
            }
            return block;
        });
        if (!touched)
            return message;
        return __assign(__assign({}, message), { message: __assign(__assign({}, message.message), { content: newContent }) });
    });
    if (tokensSaved === 0) {
        return null;
    }
    (0, index_js_1.logEvent)('tengu_time_based_microcompact', {
        gapMinutes: Math.round(gapMinutes),
        gapThresholdMinutes: config.gapThresholdMinutes,
        toolsCleared: clearSet.size,
        toolsKept: keepSet.size,
        keepRecent: config.keepRecent,
        tokensSaved: tokensSaved,
    });
    (0, debug_js_1.logForDebugging)("[TIME-BASED MC] gap ".concat(Math.round(gapMinutes), "min > ").concat(config.gapThresholdMinutes, "min, cleared ").concat(clearSet.size, " tool results (~").concat(tokensSaved, " tokens), kept last ").concat(keepSet.size));
    (0, compactWarningState_js_1.suppressCompactWarning)();
    // Cached-MC state (module-level) holds tool IDs registered on prior turns.
    // We just content-cleared some of those tools AND invalidated the server
    // cache by changing prompt content. If cached-MC runs next turn with the
    // stale state, it would try to cache_edit tools whose server-side entries
    // no longer exist. Reset it.
    resetMicrocompactState();
    // We just changed the prompt content — the next response's cache read will
    // be low, but that's us, not a break. Tell the detector to expect a drop.
    // notifyCacheDeletion (not notifyCompaction) because it's already imported
    // here and achieves the same false-positive suppression — adding the second
    // symbol to the import was flagged by the circular-deps check.
    // Pass the actual querySource: getTrackingKey returns the full source string
    // (e.g. 'repl_main_thread:outputStyle:custom'), not just the prefix.
    if ((0, bun_bundle_1.feature)('PROMPT_CACHE_BREAK_DETECTION') && querySource) {
        (0, promptCacheBreakDetection_js_1.notifyCacheDeletion)(querySource);
    }
    return { messages: result };
}
