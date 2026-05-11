"use strict";
/**
 * Utility for persisting large tool results to disk instead of truncating them.
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
exports.PREVIEW_SIZE_BYTES = exports.TOOL_RESULT_CLEARED_MESSAGE = exports.PERSISTED_OUTPUT_CLOSING_TAG = exports.PERSISTED_OUTPUT_TAG = exports.TOOL_RESULTS_SUBDIR = void 0;
exports.getPersistenceThreshold = getPersistenceThreshold;
exports.getToolResultsDir = getToolResultsDir;
exports.getToolResultPath = getToolResultPath;
exports.ensureToolResultsDir = ensureToolResultsDir;
exports.persistToolResult = persistToolResult;
exports.buildLargeToolResultMessage = buildLargeToolResultMessage;
exports.processToolResultBlock = processToolResultBlock;
exports.processPreMappedToolResultBlock = processPreMappedToolResultBlock;
exports.isToolResultContentEmpty = isToolResultContentEmpty;
exports.generatePreview = generatePreview;
exports.isPersistError = isPersistError;
exports.createContentReplacementState = createContentReplacementState;
exports.cloneContentReplacementState = cloneContentReplacementState;
exports.getPerMessageBudgetLimit = getPerMessageBudgetLimit;
exports.provisionContentReplacementState = provisionContentReplacementState;
exports.enforceToolResultBudget = enforceToolResultBudget;
exports.applyToolResultBudget = applyToolResultBudget;
exports.reconstructContentReplacementState = reconstructContentReplacementState;
exports.reconstructForSubagentResume = reconstructForSubagentResume;
var promises_1 = require("fs/promises");
var path_1 = require("path");
var state_js_1 = require("../bootstrap/state.js");
var toolLimits_js_1 = require("../constants/toolLimits.js");
var growthbook_js_1 = require("../services/analytics/growthbook.js");
var index_js_1 = require("../services/analytics/index.js");
var metadata_js_1 = require("../services/analytics/metadata.js");
var debug_js_1 = require("./debug.js");
var errors_js_1 = require("./errors.js");
var format_js_1 = require("./format.js");
var log_js_1 = require("./log.js");
var sessionStorage_js_1 = require("./sessionStorage.js");
var slowOperations_js_1 = require("./slowOperations.js");
// Subdirectory name for tool results within a session
exports.TOOL_RESULTS_SUBDIR = 'tool-results';
// XML tag used to wrap persisted output messages
exports.PERSISTED_OUTPUT_TAG = '<persisted-output>';
exports.PERSISTED_OUTPUT_CLOSING_TAG = '</persisted-output>';
// Message used when tool result content was cleared without persisting to file
exports.TOOL_RESULT_CLEARED_MESSAGE = '[Old tool result content cleared]';
/**
 * GrowthBook override map: tool name -> persistence threshold (chars).
 * When a tool name is present in this map, that value is used directly as the
 * effective threshold, bypassing the Math.min() clamp against the 50k default.
 * Tools absent from the map use the hardcoded fallback.
 * Flag default is {} (no overrides == behavior unchanged).
 */
var PERSIST_THRESHOLD_OVERRIDE_FLAG = 'tengu_satin_quoll';
/**
 * Resolve the effective persistence threshold for a tool.
 * GrowthBook override wins when present; otherwise falls back to the declared
 * per-tool cap clamped by the global default.
 *
 * Defensive: GrowthBook's cache returns `cached !== undefined ? cached : default`,
 * so a flag served as `null` leaks through. We guard with optional chaining and a
 * typeof check so any non-object flag value (null, string, number) falls through
 * to the hardcoded default instead of throwing on index or returning 0.
 */
function getPersistenceThreshold(toolName, declaredMaxResultSizeChars) {
    // Infinity = hard opt-out. Read self-bounds via maxTokens; persisting its
    // output to a file the model reads back with Read is circular. Checked
    // before the GB override so tengu_satin_quoll can't force it back on.
    if (!Number.isFinite(declaredMaxResultSizeChars)) {
        return declaredMaxResultSizeChars;
    }
    var overrides = (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)(PERSIST_THRESHOLD_OVERRIDE_FLAG, {});
    var override = overrides === null || overrides === void 0 ? void 0 : overrides[toolName];
    if (typeof override === 'number' &&
        Number.isFinite(override) &&
        override > 0) {
        return override;
    }
    return Math.min(declaredMaxResultSizeChars, toolLimits_js_1.DEFAULT_MAX_RESULT_SIZE_CHARS);
}
/**
 * Get the session directory (projectDir/sessionId)
 */
function getSessionDir() {
    return (0, path_1.join)((0, sessionStorage_js_1.getProjectDir)((0, state_js_1.getOriginalCwd)()), (0, state_js_1.getSessionId)());
}
/**
 * Get the tool results directory for this session (projectDir/sessionId/tool-results)
 */
function getToolResultsDir() {
    return (0, path_1.join)(getSessionDir(), exports.TOOL_RESULTS_SUBDIR);
}
// Preview size in bytes for the reference message
exports.PREVIEW_SIZE_BYTES = 2000;
/**
 * Get the filepath where a tool result would be persisted.
 */
function getToolResultPath(id, isJson) {
    var ext = isJson ? 'json' : 'txt';
    return (0, path_1.join)(getToolResultsDir(), "".concat(id, ".").concat(ext));
}
/**
 * Ensure the session-specific tool results directory exists
 */
function ensureToolResultsDir() {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, promises_1.mkdir)(getToolResultsDir(), { recursive: true })];
                case 1:
                    _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _a = _b.sent();
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Persist a tool result to disk and return information about the persisted file
 *
 * @param content - The tool result content to persist (string or array of content blocks)
 * @param toolUseId - The ID of the tool use that produced the result
 * @returns Information about the persisted file including filepath and preview
 */
function persistToolResult(content, toolUseId) {
    return __awaiter(this, void 0, void 0, function () {
        var isJson, hasNonTextContent, filepath, contentStr, error_1, _a, preview, hasMore;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    isJson = Array.isArray(content);
                    // Check for non-text content - we can only persist text blocks
                    if (isJson) {
                        hasNonTextContent = content.some(function (block) { return block.type !== 'text'; });
                        if (hasNonTextContent) {
                            return [2 /*return*/, {
                                    error: 'Cannot persist tool results containing non-text content',
                                }];
                        }
                    }
                    return [4 /*yield*/, ensureToolResultsDir()];
                case 1:
                    _b.sent();
                    filepath = getToolResultPath(toolUseId, isJson);
                    contentStr = isJson ? (0, slowOperations_js_1.jsonStringify)(content, null, 2) : content;
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, promises_1.writeFile)(filepath, contentStr, { encoding: 'utf-8', flag: 'wx' })];
                case 3:
                    _b.sent();
                    (0, debug_js_1.logForDebugging)("Persisted tool result to ".concat(filepath, " (").concat((0, format_js_1.formatFileSize)(contentStr.length), ")"));
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _b.sent();
                    if ((0, errors_js_1.getErrnoCode)(error_1) !== 'EEXIST') {
                        (0, log_js_1.logError)((0, errors_js_1.toError)(error_1));
                        return [2 /*return*/, { error: getFileSystemErrorMessage((0, errors_js_1.toError)(error_1)) }];
                    }
                    return [3 /*break*/, 5];
                case 5:
                    _a = generatePreview(contentStr, exports.PREVIEW_SIZE_BYTES), preview = _a.preview, hasMore = _a.hasMore;
                    return [2 /*return*/, {
                            filepath: filepath,
                            originalSize: contentStr.length,
                            isJson: isJson,
                            preview: preview,
                            hasMore: hasMore,
                        }];
            }
        });
    });
}
/**
 * Build a message for large tool results with preview
 */
function buildLargeToolResultMessage(result) {
    var message = "".concat(exports.PERSISTED_OUTPUT_TAG, "\n");
    message += "Output too large (".concat((0, format_js_1.formatFileSize)(result.originalSize), "). Full output saved to: ").concat(result.filepath, "\n\n");
    message += "Preview (first ".concat((0, format_js_1.formatFileSize)(exports.PREVIEW_SIZE_BYTES), "):\n");
    message += result.preview;
    message += result.hasMore ? '\n...\n' : '\n';
    message += exports.PERSISTED_OUTPUT_CLOSING_TAG;
    return message;
}
/**
 * Process a tool result for inclusion in a message.
 * Maps the result to the API format and persists large results to disk.
 */
function processToolResultBlock(tool, toolUseResult, toolUseID) {
    return __awaiter(this, void 0, void 0, function () {
        var toolResultBlock;
        return __generator(this, function (_a) {
            toolResultBlock = tool.mapToolResultToToolResultBlockParam(toolUseResult, toolUseID);
            return [2 /*return*/, maybePersistLargeToolResult(toolResultBlock, tool.name, getPersistenceThreshold(tool.name, tool.maxResultSizeChars))];
        });
    });
}
/**
 * Process a pre-mapped tool result block. Applies persistence for large results
 * without re-calling mapToolResultToToolResultBlockParam.
 */
function processPreMappedToolResultBlock(toolResultBlock, toolName, maxResultSizeChars) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, maybePersistLargeToolResult(toolResultBlock, toolName, getPersistenceThreshold(toolName, maxResultSizeChars))];
        });
    });
}
/**
 * True when a tool_result's content is empty or effectively empty. Covers:
 * undefined/null/'', whitespace-only strings, empty arrays, and arrays whose
 * only blocks are text blocks with empty/whitespace text. Non-text blocks
 * (images, tool_reference) are treated as non-empty.
 */
function isToolResultContentEmpty(content) {
    if (!content)
        return true;
    if (typeof content === 'string')
        return content.trim() === '';
    if (!Array.isArray(content))
        return false;
    if (content.length === 0)
        return true;
    return content.every(function (block) {
        return typeof block === 'object' &&
            'type' in block &&
            block.type === 'text' &&
            'text' in block &&
            (typeof block.text !== 'string' || block.text.trim() === '');
    });
}
/**
 * Handle large tool results by persisting to disk instead of truncating.
 * Returns the original block if no persistence needed, or a modified block
 * with the content replaced by a reference to the persisted file.
 */
function maybePersistLargeToolResult(toolResultBlock, toolName, persistenceThreshold) {
    return __awaiter(this, void 0, void 0, function () {
        var content, size, threshold, result, message;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    content = toolResultBlock.content;
                    // inc-4586: Empty tool_result content at the prompt tail causes some models
                    // (notably capybara) to emit the \n\nHuman: stop sequence and end their turn
                    // with zero output. The server renderer inserts no \n\nAssistant: marker after
                    // tool results, so a bare </function_results>\n\n pattern-matches to a turn
                    // boundary. Several tools can legitimately produce empty output (silent-success
                    // shell commands, MCP servers returning content:[], REPL statements, etc.).
                    // Inject a short marker so the model always has something to react to.
                    if (isToolResultContentEmpty(content)) {
                        (0, index_js_1.logEvent)('tengu_tool_empty_result', {
                            toolName: (0, metadata_js_1.sanitizeToolNameForAnalytics)(toolName),
                        });
                        return [2 /*return*/, __assign(__assign({}, toolResultBlock), { content: "(".concat(toolName, " completed with no output)") })];
                    }
                    // Narrow after the emptiness guard — content is non-nullish past this point.
                    if (!content) {
                        return [2 /*return*/, toolResultBlock];
                    }
                    // Skip persistence for image content blocks - they need to be sent as-is to Claude
                    if (hasImageBlock(content)) {
                        return [2 /*return*/, toolResultBlock];
                    }
                    size = contentSize(content);
                    threshold = persistenceThreshold !== null && persistenceThreshold !== void 0 ? persistenceThreshold : toolLimits_js_1.MAX_TOOL_RESULT_BYTES;
                    if (size <= threshold) {
                        return [2 /*return*/, toolResultBlock];
                    }
                    return [4 /*yield*/, persistToolResult(content, toolResultBlock.tool_use_id)];
                case 1:
                    result = _a.sent();
                    if (isPersistError(result)) {
                        // If persistence failed, return the original block unchanged
                        return [2 /*return*/, toolResultBlock];
                    }
                    message = buildLargeToolResultMessage(result);
                    // Log analytics
                    (0, index_js_1.logEvent)('tengu_tool_result_persisted', {
                        toolName: (0, metadata_js_1.sanitizeToolNameForAnalytics)(toolName),
                        originalSizeBytes: result.originalSize,
                        persistedSizeBytes: message.length,
                        estimatedOriginalTokens: Math.ceil(result.originalSize / toolLimits_js_1.BYTES_PER_TOKEN),
                        estimatedPersistedTokens: Math.ceil(message.length / toolLimits_js_1.BYTES_PER_TOKEN),
                        thresholdUsed: threshold,
                    });
                    return [2 /*return*/, __assign(__assign({}, toolResultBlock), { content: message })];
            }
        });
    });
}
/**
 * Generate a preview of content, truncating at a newline boundary when possible.
 */
function generatePreview(content, maxBytes) {
    if (content.length <= maxBytes) {
        return { preview: content, hasMore: false };
    }
    // Find the last newline within the limit to avoid cutting mid-line
    var truncated = content.slice(0, maxBytes);
    var lastNewline = truncated.lastIndexOf('\n');
    // If we found a newline reasonably close to the limit, use it
    // Otherwise fall back to the exact limit
    var cutPoint = lastNewline > maxBytes * 0.5 ? lastNewline : maxBytes;
    return { preview: content.slice(0, cutPoint), hasMore: true };
}
/**
 * Type guard to check if persist result is an error
 */
function isPersistError(result) {
    return 'error' in result;
}
function createContentReplacementState() {
    return { seenIds: new Set(), replacements: new Map() };
}
/**
 * Clone replacement state for a cache-sharing fork (e.g. agentSummary).
 * The fork needs state identical to the source at fork time so
 * enforceToolResultBudget makes the same choices → same wire prefix →
 * prompt cache hit. Mutating the clone does not affect the source.
 */
function cloneContentReplacementState(source) {
    return {
        seenIds: new Set(source.seenIds),
        replacements: new Map(source.replacements),
    };
}
/**
 * Resolve the per-message aggregate budget limit. GrowthBook override
 * (tengu_hawthorn_window) wins when present and a finite positive number;
 * otherwise falls back to the hardcoded constant. Defensive typeof/finite
 * check: GrowthBook's cache returns `cached !== undefined ? cached : default`,
 * so a flag served as null/string/NaN leaks through.
 */
function getPerMessageBudgetLimit() {
    var override = (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_hawthorn_window', null);
    if (typeof override === 'number' &&
        Number.isFinite(override) &&
        override > 0) {
        return override;
    }
    return toolLimits_js_1.MAX_TOOL_RESULTS_PER_MESSAGE_CHARS;
}
/**
 * Provision replacement state for a new conversation thread.
 *
 * Encapsulates the feature-flag gate + reconstruct-vs-fresh choice:
 *   - Flag off → undefined (query.ts skips enforcement entirely)
 *   - No initialMessages (cold start) → fresh
 *   - initialMessages present → reconstruct (freeze all candidate IDs so the
 *     budget never replaces content the model already saw unreplaced). Empty
 *     or absent records freeze everything; non-empty records additionally
 *     populate the replacements Map for byte-identical re-apply.
 */
function provisionContentReplacementState(initialMessages, initialContentReplacements) {
    var enabled = (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_hawthorn_steeple', false);
    if (!enabled)
        return undefined;
    if (initialMessages) {
        return reconstructContentReplacementState(initialMessages, initialContentReplacements !== null && initialContentReplacements !== void 0 ? initialContentReplacements : []);
    }
    return createContentReplacementState();
}
function isContentAlreadyCompacted(content) {
    // All budget-produced content starts with the tag (buildLargeToolResultMessage).
    // `.startsWith()` avoids false-positives when the tag appears anywhere else
    // in the content (e.g., reading this source file).
    return typeof content === 'string' && content.startsWith(exports.PERSISTED_OUTPUT_TAG);
}
function hasImageBlock(content) {
    return (Array.isArray(content) &&
        content.some(function (b) { return typeof b === 'object' && 'type' in b && b.type === 'image'; }));
}
function contentSize(content) {
    if (typeof content === 'string')
        return content.length;
    // Sum text-block lengths directly. Slightly under-counts vs serialized
    // (no JSON framing), but the budget is a rough token heuristic anyway.
    // Avoids allocating a content-sized string every enforcement pass.
    return content.reduce(function (sum, b) { return sum + (b.type === 'text' ? b.text.length : 0); }, 0);
}
/**
 * Walk messages and build tool_use_id → tool_name from assistant tool_use
 * blocks. tool_use always precedes its tool_result (model calls, then result
 * arrives), so by the time budget enforcement sees a result, its name is known.
 */
function buildToolNameMap(messages) {
    var map = new Map();
    for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
        var message = messages_1[_i];
        if (message.type !== 'assistant')
            continue;
        var content = message.message.content;
        if (!Array.isArray(content))
            continue;
        for (var _a = 0, content_1 = content; _a < content_1.length; _a++) {
            var block = content_1[_a];
            if (block.type === 'tool_use') {
                map.set(block.id, block.name);
            }
        }
    }
    return map;
}
/**
 * Extract candidate tool_result blocks from a single user message: blocks
 * that are non-empty, non-image, and not already compacted by tag (i.e. by
 * the per-tool limit, or an earlier iteration of this same query call).
 * Returns [] for messages with no eligible blocks.
 */
function collectCandidatesFromMessage(message) {
    if (message.type !== 'user' || !Array.isArray(message.message.content)) {
        return [];
    }
    return message.message.content.flatMap(function (block) {
        if (block.type !== 'tool_result' || !block.content)
            return [];
        if (isContentAlreadyCompacted(block.content))
            return [];
        if (hasImageBlock(block.content))
            return [];
        return [
            {
                toolUseId: block.tool_use_id,
                content: block.content,
                size: contentSize(block.content),
            },
        ];
    });
}
/**
 * Extract candidate tool_result blocks grouped by API-level user message.
 *
 * normalizeMessagesForAPI merges consecutive user messages into one
 * (Bedrock compat; 1P does the same server-side), so parallel tool
 * results that arrive as N separate user messages in our state become
 * ONE user message on the wire. The budget must group the same way or
 * it would see N under-budget messages instead of one over-budget
 * message and fail to enforce exactly when it matters most.
 *
 * A "group" is a maximal run of user messages NOT separated by an
 * assistant message. Only assistant messages create wire-level
 * boundaries — normalizeMessagesForAPI filters out progress entirely
 * and merges attachment / system(local_command) INTO adjacent user
 * blocks, so those types do NOT break groups here either.
 *
 * This matters for abort-during-parallel-tools paths: agent_progress
 * messages (non-ephemeral, persisted in REPL state) can interleave
 * between fresh tool_result messages. If we flushed on progress, those
 * tool_results would split into under-budget groups, slip through
 * unreplaced, get frozen, then be merged by normalizeMessagesForAPI
 * into one over-budget wire message — defeating the feature.
 *
 * Only groups with at least one eligible candidate are returned.
 */
function collectCandidatesByMessage(messages) {
    var groups = [];
    var current = [];
    var flush = function () {
        if (current.length > 0)
            groups.push(current);
        current = [];
    };
    // Track all assistant message.ids seen so far — same-ID fragments are
    // merged by normalizeMessagesForAPI (messages.ts ~2126 walks back PAST
    // different-ID assistants via `continue`), so any re-appearance of a
    // previously-seen ID must NOT create a group boundary. Two scenarios:
    //   • Consecutive: streamingToolExecution yields one AssistantMessage per
    //     content_block_stop (same id); a fast tool drains between blocks;
    //     abort/hook-stop leaves [asst(X), user(trA), asst(X), user(trB)].
    //   • Interleaved: coordinator/teammate streams mix different responses
    //     so [asst(X), user(trA), asst(Y), user(trB), asst(X), user(trC)].
    // In both, normalizeMessagesForAPI merges the X fragments into one wire
    // assistant, and their following tool_results merge into one wire user
    // message — so the budget must see them as one group too.
    var seenAsstIds = new Set();
    for (var _i = 0, messages_2 = messages; _i < messages_2.length; _i++) {
        var message = messages_2[_i];
        if (message.type === 'user') {
            current.push.apply(current, collectCandidatesFromMessage(message));
        }
        else if (message.type === 'assistant') {
            if (!seenAsstIds.has(message.message.id)) {
                flush();
                seenAsstIds.add(message.message.id);
            }
        }
        // progress / attachment / system are filtered or merged by
        // normalizeMessagesForAPI — they don't create wire boundaries.
    }
    flush();
    return groups;
}
/**
 * Partition candidates by their prior decision state:
 *  - mustReapply: previously replaced → re-apply the cached replacement for
 *    prefix stability
 *  - frozen: previously seen and left unreplaced → off-limits (replacing
 *    now would change a prefix that was already cached)
 *  - fresh: never seen → eligible for new replacement decisions
 */
function partitionByPriorDecision(candidates, state) {
    return candidates.reduce(function (acc, c) {
        var replacement = state.replacements.get(c.toolUseId);
        if (replacement !== undefined) {
            acc.mustReapply.push(__assign(__assign({}, c), { replacement: replacement }));
        }
        else if (state.seenIds.has(c.toolUseId)) {
            acc.frozen.push(c);
        }
        else {
            acc.fresh.push(c);
        }
        return acc;
    }, { mustReapply: [], frozen: [], fresh: [] });
}
/**
 * Pick the largest fresh results to replace until the model-visible total
 * (frozen + remaining fresh) is at or under budget, or fresh is exhausted.
 * If frozen results alone exceed budget we accept the overage — microcompact
 * will eventually clear them.
 */
function selectFreshToReplace(fresh, frozenSize, limit) {
    var sorted = __spreadArray([], fresh, true).sort(function (a, b) { return b.size - a.size; });
    var selected = [];
    var remaining = frozenSize + fresh.reduce(function (sum, c) { return sum + c.size; }, 0);
    for (var _i = 0, sorted_1 = sorted; _i < sorted_1.length; _i++) {
        var c = sorted_1[_i];
        if (remaining <= limit)
            break;
        selected.push(c);
        // We don't know the replacement size until after persist, but previews
        // are ~2K and results hitting this path are much larger, so subtracting
        // the full size is a close approximation for selection purposes.
        remaining -= c.size;
    }
    return selected;
}
/**
 * Return a new Message[] where each tool_result block whose id appears in
 * replacementMap has its content replaced. Messages and blocks with no
 * replacements are passed through by reference.
 */
function replaceToolResultContents(messages, replacementMap) {
    return messages.map(function (message) {
        if (message.type !== 'user' || !Array.isArray(message.message.content)) {
            return message;
        }
        var content = message.message.content;
        var needsReplace = content.some(function (b) { return b.type === 'tool_result' && replacementMap.has(b.tool_use_id); });
        if (!needsReplace)
            return message;
        return __assign(__assign({}, message), { message: __assign(__assign({}, message.message), { content: content.map(function (block) {
                    if (block.type !== 'tool_result')
                        return block;
                    var replacement = replacementMap.get(block.tool_use_id);
                    return replacement === undefined
                        ? block
                        : __assign(__assign({}, block), { content: replacement });
                }) }) });
    });
}
function buildReplacement(candidate) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, persistToolResult(candidate.content, candidate.toolUseId)];
                case 1:
                    result = _a.sent();
                    if (isPersistError(result))
                        return [2 /*return*/, null];
                    return [2 /*return*/, {
                            content: buildLargeToolResultMessage(result),
                            originalSize: result.originalSize,
                        }];
            }
        });
    });
}
/**
 * Enforce the per-message budget on aggregate tool result size.
 *
 * For each user message whose tool_result blocks together exceed the
 * per-message limit (see getPerMessageBudgetLimit), the largest FRESH
 * (never-before-seen) results in THAT message are persisted to disk and
 * replaced with previews.
 * Messages are evaluated independently — a 150K result in one message and
 * a 150K result in another are both under budget and untouched.
 *
 * State is tracked by tool_use_id in `state`. Once a result is seen its
 * fate is frozen: previously-replaced results get the same replacement
 * re-applied every turn from the cached preview string (zero I/O,
 * byte-identical), and previously-unreplaced results are never replaced
 * later (would break prompt cache).
 *
 * Each turn adds at most one new user message with tool_result blocks,
 * so the per-message loop typically does the budget check at most once;
 * all prior messages just re-apply cached replacements.
 *
 * @param state — MUTATED: seenIds and replacements are updated in place
 *   to record choices made this call. The caller holds a stable reference
 *   across turns; returning a new object would require error-prone ref
 *   updates after every query.
 *
 * Returns `{ messages, newlyReplaced }`:
 *   - messages: same array instance when no replacement is needed
 *   - newlyReplaced: replacements made THIS call (not re-applies).
 *     Caller persists these to the transcript for resume reconstruction.
 */
function enforceToolResultBudget(messages_3, state_1) {
    return __awaiter(this, arguments, void 0, function (messages, state, skipToolNames) {
        var candidatesByMessage, nameByToolUseId, shouldSkip, limit, replacementMap, toPersist, reappliedCount, messagesOverBudget, _loop_1, _i, candidatesByMessage_1, candidates, freshReplacements, newlyReplaced, replacedSize, _a, freshReplacements_1, _b, candidate, replacement;
        var _this = this;
        if (skipToolNames === void 0) { skipToolNames = new Set(); }
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    candidatesByMessage = collectCandidatesByMessage(messages);
                    nameByToolUseId = skipToolNames.size > 0 ? buildToolNameMap(messages) : undefined;
                    shouldSkip = function (id) {
                        var _a;
                        return nameByToolUseId !== undefined &&
                            skipToolNames.has((_a = nameByToolUseId.get(id)) !== null && _a !== void 0 ? _a : '');
                    };
                    limit = getPerMessageBudgetLimit();
                    replacementMap = new Map();
                    toPersist = [];
                    reappliedCount = 0;
                    messagesOverBudget = 0;
                    _loop_1 = function (candidates) {
                        var _d = partitionByPriorDecision(candidates, state), mustReapply = _d.mustReapply, frozen = _d.frozen, fresh = _d.fresh;
                        // Re-apply: pure Map lookups. No file I/O, byte-identical, cannot fail.
                        mustReapply.forEach(function (c) { return replacementMap.set(c.toolUseId, c.replacement); });
                        reappliedCount += mustReapply.length;
                        // Fresh means this is a new message. Check its per-message budget.
                        // (A previously-processed message has fresh.length === 0 because all
                        // its IDs were added to seenIds when first seen.)
                        if (fresh.length === 0) {
                            // mustReapply/frozen are already in seenIds from their first pass —
                            // re-adding is a no-op but keeps the invariant explicit.
                            candidates.forEach(function (c) { return state.seenIds.add(c.toolUseId); });
                            return "continue";
                        }
                        // Tools with maxResultSizeChars: Infinity (Read) — never persist.
                        // Mark as seen (frozen) so the decision sticks across turns. They don't
                        // count toward freshSize; if that lets the group slip under budget and
                        // the wire message is still large, that's the contract — Read's own
                        // maxTokens is the bound, not this wrapper.
                        var skipped = fresh.filter(function (c) { return shouldSkip(c.toolUseId); });
                        skipped.forEach(function (c) { return state.seenIds.add(c.toolUseId); });
                        var eligible = fresh.filter(function (c) { return !shouldSkip(c.toolUseId); });
                        var frozenSize = frozen.reduce(function (sum, c) { return sum + c.size; }, 0);
                        var freshSize = eligible.reduce(function (sum, c) { return sum + c.size; }, 0);
                        var selected = frozenSize + freshSize > limit
                            ? selectFreshToReplace(eligible, frozenSize, limit)
                            : [];
                        // Mark non-persisting candidates as seen NOW (synchronously). IDs
                        // selected for persist are marked seen AFTER the await, alongside
                        // replacements.set — keeps the pair atomic under observation so no
                        // concurrent reader (once subagents share state) ever sees X∈seenIds
                        // but X∉replacements, which would misclassify X as frozen and send
                        // full content while the main thread sends the preview → cache miss.
                        var selectedIds = new Set(selected.map(function (c) { return c.toolUseId; }));
                        candidates
                            .filter(function (c) { return !selectedIds.has(c.toolUseId); })
                            .forEach(function (c) { return state.seenIds.add(c.toolUseId); });
                        if (selected.length === 0)
                            return "continue";
                        messagesOverBudget++;
                        toPersist.push.apply(toPersist, selected);
                    };
                    for (_i = 0, candidatesByMessage_1 = candidatesByMessage; _i < candidatesByMessage_1.length; _i++) {
                        candidates = candidatesByMessage_1[_i];
                        _loop_1(candidates);
                    }
                    if (replacementMap.size === 0 && toPersist.length === 0) {
                        return [2 /*return*/, { messages: messages, newlyReplaced: [] }];
                    }
                    return [4 /*yield*/, Promise.all(toPersist.map(function (c) { return __awaiter(_this, void 0, void 0, function () { var _a; return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _a = [c];
                                    return [4 /*yield*/, buildReplacement(c)];
                                case 1: return [2 /*return*/, _a.concat([_b.sent()])];
                            }
                        }); }); }))];
                case 1:
                    freshReplacements = _c.sent();
                    newlyReplaced = [];
                    replacedSize = 0;
                    for (_a = 0, freshReplacements_1 = freshReplacements; _a < freshReplacements_1.length; _a++) {
                        _b = freshReplacements_1[_a], candidate = _b[0], replacement = _b[1];
                        // Mark seen HERE, post-await, atomically with replacements.set for
                        // success cases. For persist failures (replacement === null) the ID
                        // is seen-but-unreplaced — the original content was sent to the
                        // model, so treating it as frozen going forward is correct.
                        state.seenIds.add(candidate.toolUseId);
                        if (replacement === null)
                            continue;
                        replacedSize += candidate.size;
                        replacementMap.set(candidate.toolUseId, replacement.content);
                        state.replacements.set(candidate.toolUseId, replacement.content);
                        newlyReplaced.push({
                            kind: 'tool-result',
                            toolUseId: candidate.toolUseId,
                            replacement: replacement.content,
                        });
                        (0, index_js_1.logEvent)('tengu_tool_result_persisted_message_budget', {
                            originalSizeBytes: replacement.originalSize,
                            persistedSizeBytes: replacement.content.length,
                            estimatedOriginalTokens: Math.ceil(replacement.originalSize / toolLimits_js_1.BYTES_PER_TOKEN),
                            estimatedPersistedTokens: Math.ceil(replacement.content.length / toolLimits_js_1.BYTES_PER_TOKEN),
                        });
                    }
                    if (replacementMap.size === 0) {
                        return [2 /*return*/, { messages: messages, newlyReplaced: [] }];
                    }
                    if (newlyReplaced.length > 0) {
                        (0, debug_js_1.logForDebugging)("Per-message budget: persisted ".concat(newlyReplaced.length, " tool results ") +
                            "across ".concat(messagesOverBudget, " over-budget message(s), ") +
                            "shed ~".concat((0, format_js_1.formatFileSize)(replacedSize), ", ").concat(reappliedCount, " re-applied"));
                        (0, index_js_1.logEvent)('tengu_message_level_tool_result_budget_enforced', {
                            resultsPersisted: newlyReplaced.length,
                            messagesOverBudget: messagesOverBudget,
                            replacedSizeBytes: replacedSize,
                            reapplied: reappliedCount,
                        });
                    }
                    return [2 /*return*/, {
                            messages: replaceToolResultContents(messages, replacementMap),
                            newlyReplaced: newlyReplaced,
                        }];
            }
        });
    });
}
/**
 * Query-loop integration point for the aggregate budget.
 *
 * Gates on `state` (undefined means feature disabled → no-op return),
 * applies enforcement, and fires an optional transcript-write callback
 * for new replacements. The caller (query.ts) owns the persistence gate
 * — it passes a callback only for querySources that read records back on
 * resume (repl_main_thread*, agent:*); ephemeral runForkedAgent callers
 * (agentSummary, sessionMemory, /btw, compact) pass undefined.
 *
 * @returns messages with replacements applied, or the input array unchanged
 *   when the feature is off or no replacement occurred.
 */
function applyToolResultBudget(messages, state, writeToTranscript, skipToolNames) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!state)
                        return [2 /*return*/, messages];
                    return [4 /*yield*/, enforceToolResultBudget(messages, state, skipToolNames)];
                case 1:
                    result = _a.sent();
                    if (result.newlyReplaced.length > 0) {
                        writeToTranscript === null || writeToTranscript === void 0 ? void 0 : writeToTranscript(result.newlyReplaced);
                    }
                    return [2 /*return*/, result.messages];
            }
        });
    });
}
/**
 * Reconstruct replacement state from content-replacement records loaded from
 * the transcript. Used on resume so the budget makes the same choices it
 * made in the original session (prompt cache stability).
 *
 * Accepts the full ContentReplacementRecord[] from LogOption (may include
 * future non-tool-result kinds); only tool-result records are applied here.
 *
 *   - replacements: populated directly from the stored replacement strings.
 *     Records for IDs not in messages (e.g. after compact) are skipped —
 *     they're inert anyway.
 *   - seenIds: every candidate tool_use_id in the loaded messages. A result
 *     being in the transcript means it was sent to the model, so it was seen.
 *     This freezes unreplaced results against future replacement.
 *   - inheritedReplacements: gap-fill for fork-subagent resume. A fork's
 *     original run applies parent-inherited replacements via mustReapply
 *     (never persisted — not newlyReplaced). On resume the sidechain has
 *     the original content but no record, so records alone would classify
 *     it as frozen. The parent's live state still has the mapping; copy
 *     it for IDs in messages that records don't cover. No-op for non-fork
 *     resumes (parent IDs aren't in the subagent's messages).
 */
function reconstructContentReplacementState(messages, records, inheritedReplacements) {
    var state = createContentReplacementState();
    var candidateIds = new Set(collectCandidatesByMessage(messages)
        .flat()
        .map(function (c) { return c.toolUseId; }));
    for (var _i = 0, candidateIds_1 = candidateIds; _i < candidateIds_1.length; _i++) {
        var id = candidateIds_1[_i];
        state.seenIds.add(id);
    }
    for (var _a = 0, records_1 = records; _a < records_1.length; _a++) {
        var r = records_1[_a];
        if (r.kind === 'tool-result' && candidateIds.has(r.toolUseId)) {
            state.replacements.set(r.toolUseId, r.replacement);
        }
    }
    if (inheritedReplacements) {
        for (var _b = 0, inheritedReplacements_1 = inheritedReplacements; _b < inheritedReplacements_1.length; _b++) {
            var _c = inheritedReplacements_1[_b], id = _c[0], replacement = _c[1];
            if (candidateIds.has(id) && !state.replacements.has(id)) {
                state.replacements.set(id, replacement);
            }
        }
    }
    return state;
}
/**
 * AgentTool-resume variant: encapsulates the feature-flag gate + parent
 * gap-fill so both AgentTool.call and resumeAgentBackground share one
 * implementation. Returns undefined when parentState is undefined (feature
 * off); otherwise reconstructs from sidechain records with parent's live
 * replacements filling gaps for fork-inherited mustReapply entries.
 *
 * Kept out of AgentTool.tsx — that file is at the feature() DCE complexity
 * cliff and cannot tolerate even +1 net source line without silently
 * breaking feature('TRANSCRIPT_CLASSIFIER') eval in tests.
 */
function reconstructForSubagentResume(parentState, resumedMessages, sidechainRecords) {
    if (!parentState)
        return undefined;
    return reconstructContentReplacementState(resumedMessages, sidechainRecords, parentState.replacements);
}
/**
 * Get a human-readable error message from a filesystem error
 */
function getFileSystemErrorMessage(error) {
    var _a, _b, _c;
    // Node.js filesystem errors have a 'code' property
    // eslint-disable-next-line no-restricted-syntax -- uses .path, not just .code
    var nodeError = error;
    if (nodeError.code) {
        switch (nodeError.code) {
            case 'ENOENT':
                return "Directory not found: ".concat((_a = nodeError.path) !== null && _a !== void 0 ? _a : 'unknown path');
            case 'EACCES':
                return "Permission denied: ".concat((_b = nodeError.path) !== null && _b !== void 0 ? _b : 'unknown path');
            case 'ENOSPC':
                return 'No space left on device';
            case 'EROFS':
                return 'Read-only file system';
            case 'EMFILE':
                return 'Too many open files';
            case 'EEXIST':
                return "File already exists: ".concat((_c = nodeError.path) !== null && _c !== void 0 ? _c : 'unknown path');
            default:
                return "".concat(nodeError.code, ": ").concat(nodeError.message);
        }
    }
    return error.message;
}
