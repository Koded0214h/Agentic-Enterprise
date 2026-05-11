"use strict";
/**
 * Extracts durable memories from the current session transcript
 * and writes them to the auto-memory directory (~/.claude/projects/<path>/memory/).
 *
 * It runs once at the end of each complete query loop (when the model produces
 * a final response with no tool calls) via handleStopHooks in stopHooks.ts.
 *
 * Uses the forked agent pattern (runForkedAgent) — a perfect fork of the main
 * conversation that shares the parent's prompt cache.
 *
 * State is closure-scoped inside initExtractMemories() rather than module-level,
 * following the same pattern as confidenceRating.ts. Tests call
 * initExtractMemories() in beforeEach to get a fresh closure.
 */
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
exports.createAutoMemCanUseTool = createAutoMemCanUseTool;
exports.initExtractMemories = initExtractMemories;
exports.executeExtractMemories = executeExtractMemories;
exports.drainPendingExtraction = drainPendingExtraction;
var bun_bundle_1 = require("bun:bundle");
var path_1 = require("path");
var state_js_1 = require("../../bootstrap/state.js");
var memdir_js_1 = require("../../memdir/memdir.js");
var memoryScan_js_1 = require("../../memdir/memoryScan.js");
var paths_js_1 = require("../../memdir/paths.js");
var toolName_js_1 = require("../../tools/BashTool/toolName.js");
var constants_js_1 = require("../../tools/FileEditTool/constants.js");
var prompt_js_1 = require("../../tools/FileReadTool/prompt.js");
var prompt_js_2 = require("../../tools/FileWriteTool/prompt.js");
var prompt_js_3 = require("../../tools/GlobTool/prompt.js");
var prompt_js_4 = require("../../tools/GrepTool/prompt.js");
var constants_js_2 = require("../../tools/REPLTool/constants.js");
var abortController_js_1 = require("../../utils/abortController.js");
var array_js_1 = require("../../utils/array.js");
var debug_js_1 = require("../../utils/debug.js");
var forkedAgent_js_1 = require("../../utils/forkedAgent.js");
var messages_js_1 = require("../../utils/messages.js");
var growthbook_js_1 = require("../analytics/growthbook.js");
var index_js_1 = require("../analytics/index.js");
var metadata_js_1 = require("../analytics/metadata.js");
var prompts_js_1 = require("./prompts.js");
/* eslint-disable @typescript-eslint/no-require-imports */
var teamMemPaths = (0, bun_bundle_1.feature)('TEAMMEM')
    ? require('../../memdir/teamMemPaths.js')
    : null;
/* eslint-enable @typescript-eslint/no-require-imports */
// ============================================================================
// Helpers
// ============================================================================
/**
 * Returns true if a message is visible to the model (sent in API calls).
 * Excludes progress, system, and attachment messages.
 */
function isModelVisibleMessage(message) {
    return message.type === 'user' || message.type === 'assistant';
}
function countModelVisibleMessagesSince(messages, sinceUuid) {
    if (sinceUuid === null || sinceUuid === undefined) {
        return (0, array_js_1.count)(messages, isModelVisibleMessage);
    }
    var foundStart = false;
    var n = 0;
    for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
        var message = messages_1[_i];
        if (!foundStart) {
            if (message.uuid === sinceUuid) {
                foundStart = true;
            }
            continue;
        }
        if (isModelVisibleMessage(message)) {
            n++;
        }
    }
    // If sinceUuid was not found (e.g., removed by context compaction),
    // fall back to counting all model-visible messages rather than returning 0
    // which would permanently disable extraction for the rest of the session.
    if (!foundStart) {
        return (0, array_js_1.count)(messages, isModelVisibleMessage);
    }
    return n;
}
/**
 * Returns true if any assistant message after the cursor UUID contains a
 * Write/Edit tool_use block targeting an auto-memory path.
 *
 * The main agent's prompt has full save instructions — when it writes
 * memories, the forked extraction is redundant. runExtraction skips the
 * agent and advances the cursor past this range, making the main agent
 * and the background agent mutually exclusive per turn.
 */
function hasMemoryWritesSince(messages, sinceUuid) {
    var foundStart = sinceUuid === undefined;
    for (var _i = 0, messages_2 = messages; _i < messages_2.length; _i++) {
        var message = messages_2[_i];
        if (!foundStart) {
            if (message.uuid === sinceUuid) {
                foundStart = true;
            }
            continue;
        }
        if (message.type !== 'assistant') {
            continue;
        }
        var content = message.message.content;
        if (!Array.isArray(content)) {
            continue;
        }
        for (var _a = 0, content_1 = content; _a < content_1.length; _a++) {
            var block = content_1[_a];
            var filePath = getWrittenFilePath(block);
            if (filePath !== undefined && (0, paths_js_1.isAutoMemPath)(filePath)) {
                return true;
            }
        }
    }
    return false;
}
// ============================================================================
// Tool Permissions
// ============================================================================
function denyAutoMemTool(tool, reason) {
    (0, debug_js_1.logForDebugging)("[autoMem] denied ".concat(tool.name, ": ").concat(reason));
    (0, index_js_1.logEvent)('tengu_auto_mem_tool_denied', {
        tool_name: (0, metadata_js_1.sanitizeToolNameForAnalytics)(tool.name),
    });
    return {
        behavior: 'deny',
        message: reason,
        decisionReason: { type: 'other', reason: reason },
    };
}
/**
 * Creates a canUseTool function that allows Read/Grep/Glob (unrestricted),
 * read-only Bash commands, and Edit/Write only for paths within the
 * auto-memory directory. Shared by extractMemories and autoDream.
 */
function createAutoMemCanUseTool(memoryDir) {
    var _this = this;
    return function (tool, input) { return __awaiter(_this, void 0, void 0, function () {
        var parsed, filePath;
        return __generator(this, function (_a) {
            // Allow REPL — when REPL mode is enabled (ant-default), primitive tools
            // are hidden from the tool list so the forked agent calls REPL instead.
            // REPL's VM context re-invokes this canUseTool for each inner primitive
            // (toolWrappers.ts createToolWrapper), so the Read/Bash/Edit/Write checks
            // below still gate the actual file and shell operations. Giving the fork a
            // different tool list would break prompt cache sharing (tools are part of
            // the cache key — see CacheSafeParams in forkedAgent.ts).
            if (tool.name === constants_js_2.REPL_TOOL_NAME) {
                return [2 /*return*/, { behavior: 'allow', updatedInput: input }];
            }
            // Allow Read/Grep/Glob unrestricted — all inherently read-only
            if (tool.name === prompt_js_1.FILE_READ_TOOL_NAME ||
                tool.name === prompt_js_4.GREP_TOOL_NAME ||
                tool.name === prompt_js_3.GLOB_TOOL_NAME) {
                return [2 /*return*/, { behavior: 'allow', updatedInput: input }];
            }
            // Allow Bash only for commands that pass BashTool.isReadOnly.
            // `tool` IS BashTool here — no static import needed.
            if (tool.name === toolName_js_1.BASH_TOOL_NAME) {
                parsed = tool.inputSchema.safeParse(input);
                if (parsed.success && tool.isReadOnly(parsed.data)) {
                    return [2 /*return*/, { behavior: 'allow', updatedInput: input }];
                }
                return [2 /*return*/, denyAutoMemTool(tool, 'Only read-only shell commands are permitted in this context (ls, find, grep, cat, stat, wc, head, tail, and similar)')];
            }
            if ((tool.name === constants_js_1.FILE_EDIT_TOOL_NAME ||
                tool.name === prompt_js_2.FILE_WRITE_TOOL_NAME) &&
                'file_path' in input) {
                filePath = input.file_path;
                if (typeof filePath === 'string' && (0, paths_js_1.isAutoMemPath)(filePath)) {
                    return [2 /*return*/, { behavior: 'allow', updatedInput: input }];
                }
            }
            return [2 /*return*/, denyAutoMemTool(tool, "only ".concat(prompt_js_1.FILE_READ_TOOL_NAME, ", ").concat(prompt_js_4.GREP_TOOL_NAME, ", ").concat(prompt_js_3.GLOB_TOOL_NAME, ", read-only ").concat(toolName_js_1.BASH_TOOL_NAME, ", and ").concat(constants_js_1.FILE_EDIT_TOOL_NAME, "/").concat(prompt_js_2.FILE_WRITE_TOOL_NAME, " within ").concat(memoryDir, " are allowed"))];
        });
    }); };
}
// ============================================================================
// Extract file paths from agent output
// ============================================================================
/**
 * Extract file_path from a tool_use block's input, if present.
 * Returns undefined when the block is not an Edit/Write tool use or has no file_path.
 */
function getWrittenFilePath(block) {
    if (block.type !== 'tool_use' ||
        (block.name !== constants_js_1.FILE_EDIT_TOOL_NAME && block.name !== prompt_js_2.FILE_WRITE_TOOL_NAME)) {
        return undefined;
    }
    var input = block.input;
    if (typeof input === 'object' && input !== null && 'file_path' in input) {
        var fp = input.file_path;
        return typeof fp === 'string' ? fp : undefined;
    }
    return undefined;
}
function extractWrittenPaths(agentMessages) {
    var paths = [];
    for (var _i = 0, agentMessages_1 = agentMessages; _i < agentMessages_1.length; _i++) {
        var message = agentMessages_1[_i];
        if (message.type !== 'assistant') {
            continue;
        }
        var content = message.message.content;
        if (!Array.isArray(content)) {
            continue;
        }
        for (var _a = 0, content_2 = content; _a < content_2.length; _a++) {
            var block = content_2[_a];
            var filePath = getWrittenFilePath(block);
            if (filePath !== undefined) {
                paths.push(filePath);
            }
        }
    }
    return (0, array_js_1.uniq)(paths);
}
/** The active extractor function, set by initExtractMemories(). */
var extractor = null;
/** The active drain function, set by initExtractMemories(). No-op until init. */
var drainer = function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
    return [2 /*return*/];
}); }); };
/**
 * Initialize the memory extraction system.
 * Creates a fresh closure that captures all mutable state (cursor position,
 * overlap guard, pending context). Call once at startup alongside
 * initConfidenceRating/initPromptCoaching, or per-test in beforeEach.
 */
function initExtractMemories() {
    // --- Closure-scoped mutable state ---
    var _this = this;
    /** Every promise handed out by the extractor that hasn't settled yet.
     *  Coalesced calls that stash-and-return add fast-resolving promises
     *  (harmless); the call that starts real work adds a promise covering the
     *  full trailing-run chain via runExtraction's recursive finally. */
    var inFlightExtractions = new Set();
    /** UUID of the last message processed — cursor so each run only
     *  considers messages added since the previous extraction. */
    var lastMemoryMessageUuid;
    /** One-shot flag: once we log that the gate is disabled, don't repeat. */
    var hasLoggedGateFailure = false;
    /** True while runExtraction is executing — prevents overlapping runs. */
    var inProgress = false;
    /** Counts eligible turns since the last extraction run. Resets to 0 after each run. */
    var turnsSinceLastExtraction = 0;
    /** When a call arrives during an in-progress run, we stash the context here
     *  and run one trailing extraction after the current one finishes. */
    var pendingContext;
    // --- Inner extraction logic ---
    function runExtraction(_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var messages, memoryDir, newMessageCount, lastMessage, teamMemoryEnabled, skipIndex, canUseTool, cacheSafeParams, startTime, existingMemories, _c, userPrompt, result, lastMessage, writtenPaths, turnCount, totalInput, hitPct, memoryPaths, teamCount, msg, error_1, trailing;
            var _d;
            var context = _b.context, appendSystemMessage = _b.appendSystemMessage, isTrailingRun = _b.isTrailingRun;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        messages = context.messages;
                        memoryDir = (0, paths_js_1.getAutoMemPath)();
                        newMessageCount = countModelVisibleMessagesSince(messages, lastMemoryMessageUuid);
                        // Mutual exclusion: when the main agent wrote memories, skip the
                        // forked agent and advance the cursor past this range so the next
                        // extraction only considers messages after the main agent's write.
                        if (hasMemoryWritesSince(messages, lastMemoryMessageUuid)) {
                            (0, debug_js_1.logForDebugging)('[extractMemories] skipping — conversation already wrote to memory files');
                            lastMessage = messages.at(-1);
                            if (lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.uuid) {
                                lastMemoryMessageUuid = lastMessage.uuid;
                            }
                            (0, index_js_1.logEvent)('tengu_extract_memories_skipped_direct_write', {
                                message_count: newMessageCount,
                            });
                            return [2 /*return*/];
                        }
                        teamMemoryEnabled = (0, bun_bundle_1.feature)('TEAMMEM')
                            ? teamMemPaths.isTeamMemoryEnabled()
                            : false;
                        skipIndex = (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_moth_copse', false);
                        canUseTool = createAutoMemCanUseTool(memoryDir);
                        cacheSafeParams = (0, forkedAgent_js_1.createCacheSafeParams)(context);
                        // Only run extraction every N eligible turns (tengu_bramble_lintel, default 1).
                        // Trailing extractions (from stashed contexts) skip this check since they
                        // process already-committed work that should not be throttled.
                        if (!isTrailingRun) {
                            turnsSinceLastExtraction++;
                            if (turnsSinceLastExtraction <
                                ((_d = (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_bramble_lintel', null)) !== null && _d !== void 0 ? _d : 1)) {
                                return [2 /*return*/];
                            }
                        }
                        turnsSinceLastExtraction = 0;
                        inProgress = true;
                        startTime = Date.now();
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 4, 5, 8]);
                        (0, debug_js_1.logForDebugging)("[extractMemories] starting \u2014 ".concat(newMessageCount, " new messages, memoryDir=").concat(memoryDir));
                        _c = memoryScan_js_1.formatMemoryManifest;
                        return [4 /*yield*/, (0, memoryScan_js_1.scanMemoryFiles)(memoryDir, (0, abortController_js_1.createAbortController)().signal)];
                    case 2:
                        existingMemories = _c.apply(void 0, [_e.sent()]);
                        userPrompt = (0, bun_bundle_1.feature)('TEAMMEM') && teamMemoryEnabled
                            ? (0, prompts_js_1.buildExtractCombinedPrompt)(newMessageCount, existingMemories, skipIndex)
                            : (0, prompts_js_1.buildExtractAutoOnlyPrompt)(newMessageCount, existingMemories, skipIndex);
                        return [4 /*yield*/, (0, forkedAgent_js_1.runForkedAgent)({
                                promptMessages: [(0, messages_js_1.createUserMessage)({ content: userPrompt })],
                                cacheSafeParams: cacheSafeParams,
                                canUseTool: canUseTool,
                                querySource: 'extract_memories',
                                forkLabel: 'extract_memories',
                                // The extractMemories subagent does not need to record to transcript.
                                // Doing so can create race conditions with the main thread.
                                skipTranscript: true,
                                // Well-behaved extractions complete in 2-4 turns (read → write).
                                // A hard cap prevents verification rabbit-holes from burning turns.
                                maxTurns: 5,
                            })
                            // Advance the cursor only after a successful run. If the agent errors
                            // out (caught below), the cursor stays put so those messages are
                            // reconsidered on the next extraction.
                        ];
                    case 3:
                        result = _e.sent();
                        lastMessage = messages.at(-1);
                        if (lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.uuid) {
                            lastMemoryMessageUuid = lastMessage.uuid;
                        }
                        writtenPaths = extractWrittenPaths(result.messages);
                        turnCount = (0, array_js_1.count)(result.messages, function (m) { return m.type === 'assistant'; });
                        totalInput = result.totalUsage.input_tokens +
                            result.totalUsage.cache_creation_input_tokens +
                            result.totalUsage.cache_read_input_tokens;
                        hitPct = totalInput > 0
                            ? ((result.totalUsage.cache_read_input_tokens / totalInput) *
                                100).toFixed(1)
                            : '0.0';
                        (0, debug_js_1.logForDebugging)("[extractMemories] finished \u2014 ".concat(writtenPaths.length, " files written, cache: read=").concat(result.totalUsage.cache_read_input_tokens, " create=").concat(result.totalUsage.cache_creation_input_tokens, " input=").concat(result.totalUsage.input_tokens, " (").concat(hitPct, "% hit)"));
                        if (writtenPaths.length > 0) {
                            (0, debug_js_1.logForDebugging)("[extractMemories] memories saved: ".concat(writtenPaths.join(', ')));
                        }
                        else {
                            (0, debug_js_1.logForDebugging)('[extractMemories] no memories saved this run');
                        }
                        memoryPaths = writtenPaths.filter(function (p) { return (0, path_1.basename)(p) !== memdir_js_1.ENTRYPOINT_NAME; });
                        teamCount = (0, bun_bundle_1.feature)('TEAMMEM')
                            ? (0, array_js_1.count)(memoryPaths, teamMemPaths.isTeamMemPath)
                            : 0;
                        // Log extraction event with usage from the forked agent
                        (0, index_js_1.logEvent)('tengu_extract_memories_extraction', {
                            input_tokens: result.totalUsage.input_tokens,
                            output_tokens: result.totalUsage.output_tokens,
                            cache_read_input_tokens: result.totalUsage.cache_read_input_tokens,
                            cache_creation_input_tokens: result.totalUsage.cache_creation_input_tokens,
                            message_count: newMessageCount,
                            turn_count: turnCount,
                            files_written: writtenPaths.length,
                            memories_saved: memoryPaths.length,
                            team_memories_saved: teamCount,
                            duration_ms: Date.now() - startTime,
                        });
                        (0, debug_js_1.logForDebugging)("[extractMemories] writtenPaths=".concat(writtenPaths.length, " memoryPaths=").concat(memoryPaths.length, " appendSystemMessage defined=").concat(appendSystemMessage != null));
                        if (memoryPaths.length > 0) {
                            msg = (0, messages_js_1.createMemorySavedMessage)(memoryPaths);
                            if ((0, bun_bundle_1.feature)('TEAMMEM')) {
                                msg.teamCount = teamCount;
                            }
                            appendSystemMessage === null || appendSystemMessage === void 0 ? void 0 : appendSystemMessage(msg);
                        }
                        return [3 /*break*/, 8];
                    case 4:
                        error_1 = _e.sent();
                        // Extraction is best-effort — log but don't notify on error
                        (0, debug_js_1.logForDebugging)("[extractMemories] error: ".concat(error_1));
                        (0, index_js_1.logEvent)('tengu_extract_memories_error', {
                            duration_ms: Date.now() - startTime,
                        });
                        return [3 /*break*/, 8];
                    case 5:
                        inProgress = false;
                        trailing = pendingContext;
                        pendingContext = undefined;
                        if (!trailing) return [3 /*break*/, 7];
                        (0, debug_js_1.logForDebugging)('[extractMemories] running trailing extraction for stashed context');
                        return [4 /*yield*/, runExtraction({
                                context: trailing.context,
                                appendSystemMessage: trailing.appendSystemMessage,
                                isTrailingRun: true,
                            })];
                    case 6:
                        _e.sent();
                        _e.label = 7;
                    case 7: return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    }
    // --- Public entry point (captured by extractor) ---
    function executeExtractMemoriesImpl(context, appendSystemMessage) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Only run for the main agent, not subagents
                        if (context.toolUseContext.agentId) {
                            return [2 /*return*/];
                        }
                        if (!(0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_passport_quail', false)) {
                            if (process.env.USER_TYPE === 'ant' && !hasLoggedGateFailure) {
                                hasLoggedGateFailure = true;
                                (0, index_js_1.logEvent)('tengu_extract_memories_gate_disabled', {});
                            }
                            return [2 /*return*/];
                        }
                        // Check auto-memory is enabled
                        if (!(0, paths_js_1.isAutoMemoryEnabled)()) {
                            return [2 /*return*/];
                        }
                        // Skip in remote mode
                        if ((0, state_js_1.getIsRemoteMode)()) {
                            return [2 /*return*/];
                        }
                        // If an extraction is already in progress, stash this context for a
                        // trailing run (overwrites any previously stashed context — only the
                        // latest matters since it has the most messages).
                        if (inProgress) {
                            (0, debug_js_1.logForDebugging)('[extractMemories] extraction in progress — stashing for trailing run');
                            (0, index_js_1.logEvent)('tengu_extract_memories_coalesced', {});
                            pendingContext = { context: context, appendSystemMessage: appendSystemMessage };
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, runExtraction({ context: context, appendSystemMessage: appendSystemMessage })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    extractor = function (context, appendSystemMessage) { return __awaiter(_this, void 0, void 0, function () {
        var p;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    p = executeExtractMemoriesImpl(context, appendSystemMessage);
                    inFlightExtractions.add(p);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    return [4 /*yield*/, p];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    inFlightExtractions.delete(p);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    drainer = function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(_this, __spreadArray([], args_1, true), void 0, function (timeoutMs) {
            if (timeoutMs === void 0) { timeoutMs = 60000; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (inFlightExtractions.size === 0)
                            return [2 /*return*/];
                        return [4 /*yield*/, Promise.race([
                                Promise.all(inFlightExtractions).catch(function () { }),
                                // eslint-disable-next-line no-restricted-syntax -- sleep() has no .unref(); timer must not block exit
                                new Promise(function (r) { return setTimeout(r, timeoutMs).unref(); }),
                            ])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
}
// ============================================================================
// Public API
// ============================================================================
/**
 * Run memory extraction at the end of a query loop.
 * Called fire-and-forget from handleStopHooks, alongside prompt suggestion/coaching.
 * No-ops until initExtractMemories() has been called.
 */
function executeExtractMemories(context, appendSystemMessage) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (extractor === null || extractor === void 0 ? void 0 : extractor(context, appendSystemMessage))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Awaits all in-flight extractions (including trailing stashed runs) with a
 * soft timeout. Called by print.ts after the response is flushed but before
 * gracefulShutdownSync, so the forked agent completes before the 5s shutdown
 * failsafe kills it. No-op until initExtractMemories() has been called.
 */
function drainPendingExtraction(timeoutMs) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, drainer(timeoutMs)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
