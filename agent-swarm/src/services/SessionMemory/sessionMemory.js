"use strict";
/**
 * Session Memory automatically maintains a markdown file with notes about the current conversation.
 * It runs periodically in the background using a forked subagent to extract key information
 * without interrupting the main conversation flow.
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetLastMemoryMessageUuid = resetLastMemoryMessageUuid;
exports.shouldExtractMemory = shouldExtractMemory;
exports.initSessionMemory = initSessionMemory;
exports.manuallyExtractSessionMemory = manuallyExtractSessionMemory;
exports.createMemoryFileCanUseTool = createMemoryFileCanUseTool;
var promises_1 = require("fs/promises");
var memoize_js_1 = require("lodash-es/memoize.js");
var state_js_1 = require("../../bootstrap/state.js");
var prompts_js_1 = require("../../constants/prompts.js");
var context_js_1 = require("../../context.js");
var constants_js_1 = require("../../tools/FileEditTool/constants.js");
var FileReadTool_js_1 = require("../../tools/FileReadTool/FileReadTool.js");
var array_js_1 = require("../../utils/array.js");
var forkedAgent_js_1 = require("../../utils/forkedAgent.js");
var fsOperations_js_1 = require("../../utils/fsOperations.js");
var postSamplingHooks_js_1 = require("../../utils/hooks/postSamplingHooks.js");
var messages_js_1 = require("../../utils/messages.js");
var filesystem_js_1 = require("../../utils/permissions/filesystem.js");
var sequential_js_1 = require("../../utils/sequential.js");
var systemPromptType_js_1 = require("../../utils/systemPromptType.js");
var tokens_js_1 = require("../../utils/tokens.js");
var index_js_1 = require("../analytics/index.js");
var autoCompact_js_1 = require("../compact/autoCompact.js");
var prompts_js_2 = require("./prompts.js");
var sessionMemoryUtils_js_1 = require("./sessionMemoryUtils.js");
// ============================================================================
// Feature Gate and Config (Cached - Non-blocking)
// ============================================================================
// These functions return cached values from disk immediately without blocking
// on GrowthBook initialization. Values may be stale but are updated in background.
var errors_js_1 = require("../../utils/errors.js");
var growthbook_js_1 = require("../analytics/growthbook.js");
/**
 * Check if session memory feature is enabled.
 * Uses cached gate value - returns immediately without blocking.
 */
function isSessionMemoryGateEnabled() {
    return (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_session_memory', false);
}
/**
 * Get session memory config from cache.
 * Returns immediately without blocking - value may be stale.
 */
function getSessionMemoryRemoteConfig() {
    return (0, growthbook_js_1.getDynamicConfig_CACHED_MAY_BE_STALE)('tengu_sm_config', {});
}
// ============================================================================
// Module State
// ============================================================================
var lastMemoryMessageUuid;
/**
 * Reset the last memory message UUID (for testing)
 */
function resetLastMemoryMessageUuid() {
    lastMemoryMessageUuid = undefined;
}
function countToolCallsSince(messages, sinceUuid) {
    var toolCallCount = 0;
    var foundStart = sinceUuid === null || sinceUuid === undefined;
    for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
        var message = messages_1[_i];
        if (!foundStart) {
            if (message.uuid === sinceUuid) {
                foundStart = true;
            }
            continue;
        }
        if (message.type === 'assistant') {
            var content = message.message.content;
            if (Array.isArray(content)) {
                toolCallCount += (0, array_js_1.count)(content, function (block) { return block.type === 'tool_use'; });
            }
        }
    }
    return toolCallCount;
}
function shouldExtractMemory(messages) {
    // Check if we've met the initialization threshold
    // Uses total context window tokens (same as autocompact) for consistent behavior
    var currentTokenCount = (0, tokens_js_1.tokenCountWithEstimation)(messages);
    if (!(0, sessionMemoryUtils_js_1.isSessionMemoryInitialized)()) {
        if (!(0, sessionMemoryUtils_js_1.hasMetInitializationThreshold)(currentTokenCount)) {
            return false;
        }
        (0, sessionMemoryUtils_js_1.markSessionMemoryInitialized)();
    }
    // Check if we've met the minimum tokens between updates threshold
    // Uses context window growth since last extraction (same metric as init threshold)
    var hasMetTokenThreshold = (0, sessionMemoryUtils_js_1.hasMetUpdateThreshold)(currentTokenCount);
    // Check if we've met the tool calls threshold
    var toolCallsSinceLastUpdate = countToolCallsSince(messages, lastMemoryMessageUuid);
    var hasMetToolCallThreshold = toolCallsSinceLastUpdate >= (0, sessionMemoryUtils_js_1.getToolCallsBetweenUpdates)();
    // Check if the last assistant turn has no tool calls (safe to extract)
    var hasToolCallsInLastTurn = (0, messages_js_1.hasToolCallsInLastAssistantTurn)(messages);
    // Trigger extraction when:
    // 1. Both thresholds are met (tokens AND tool calls), OR
    // 2. No tool calls in last turn AND token threshold is met
    //    (to ensure we extract at natural conversation breaks)
    //
    // IMPORTANT: The token threshold (minimumTokensBetweenUpdate) is ALWAYS required.
    // Even if the tool call threshold is met, extraction won't happen until the
    // token threshold is also satisfied. This prevents excessive extractions.
    var shouldExtract = (hasMetTokenThreshold && hasMetToolCallThreshold) ||
        (hasMetTokenThreshold && !hasToolCallsInLastTurn);
    if (shouldExtract) {
        var lastMessage = messages[messages.length - 1];
        if (lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.uuid) {
            lastMemoryMessageUuid = lastMessage.uuid;
        }
        return true;
    }
    return false;
}
function setupSessionMemoryFile(toolUseContext) {
    return __awaiter(this, void 0, void 0, function () {
        var fs, sessionMemoryDir, memoryPath, template, e_1, code, result, currentMemory, output;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    sessionMemoryDir = (0, filesystem_js_1.getSessionMemoryDir)();
                    return [4 /*yield*/, fs.mkdir(sessionMemoryDir, { mode: 448 })];
                case 1:
                    _a.sent();
                    memoryPath = (0, filesystem_js_1.getSessionMemoryPath)();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 6, , 7]);
                    return [4 /*yield*/, (0, promises_1.writeFile)(memoryPath, '', {
                            encoding: 'utf-8',
                            mode: 384,
                            flag: 'wx',
                        })
                        // Only load template if file was just created
                    ];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, (0, prompts_js_2.loadSessionMemoryTemplate)()];
                case 4:
                    template = _a.sent();
                    return [4 /*yield*/, (0, promises_1.writeFile)(memoryPath, template, {
                            encoding: 'utf-8',
                            mode: 384,
                        })];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 6:
                    e_1 = _a.sent();
                    code = (0, errors_js_1.getErrnoCode)(e_1);
                    if (code !== 'EEXIST') {
                        throw e_1;
                    }
                    return [3 /*break*/, 7];
                case 7:
                    // Drop any cached entry so FileReadTool's dedup doesn't return a
                    // file_unchanged stub — we need the actual content. The Read repopulates it.
                    toolUseContext.readFileState.delete(memoryPath);
                    return [4 /*yield*/, FileReadTool_js_1.FileReadTool.call({ file_path: memoryPath }, toolUseContext)];
                case 8:
                    result = _a.sent();
                    currentMemory = '';
                    output = result.data;
                    if (output.type === 'text') {
                        currentMemory = output.file.content;
                    }
                    (0, index_js_1.logEvent)('tengu_session_memory_file_read', {
                        content_length: currentMemory.length,
                    });
                    return [2 /*return*/, { memoryPath: memoryPath, currentMemory: currentMemory }];
            }
        });
    });
}
/**
 * Initialize session memory config from remote config (lazy initialization).
 * Memoized - only runs once per session, subsequent calls return immediately.
 * Uses cached config values - non-blocking.
 */
var initSessionMemoryConfigIfNeeded = (0, memoize_js_1.default)(function () {
    // Load config from cache (non-blocking, may be stale)
    var remoteConfig = getSessionMemoryRemoteConfig();
    // Only use remote values if they are explicitly set (non-zero positive numbers)
    // This ensures sensible defaults aren't overridden by zero values
    var config = {
        minimumMessageTokensToInit: remoteConfig.minimumMessageTokensToInit &&
            remoteConfig.minimumMessageTokensToInit > 0
            ? remoteConfig.minimumMessageTokensToInit
            : sessionMemoryUtils_js_1.DEFAULT_SESSION_MEMORY_CONFIG.minimumMessageTokensToInit,
        minimumTokensBetweenUpdate: remoteConfig.minimumTokensBetweenUpdate &&
            remoteConfig.minimumTokensBetweenUpdate > 0
            ? remoteConfig.minimumTokensBetweenUpdate
            : sessionMemoryUtils_js_1.DEFAULT_SESSION_MEMORY_CONFIG.minimumTokensBetweenUpdate,
        toolCallsBetweenUpdates: remoteConfig.toolCallsBetweenUpdates &&
            remoteConfig.toolCallsBetweenUpdates > 0
            ? remoteConfig.toolCallsBetweenUpdates
            : sessionMemoryUtils_js_1.DEFAULT_SESSION_MEMORY_CONFIG.toolCallsBetweenUpdates,
    };
    (0, sessionMemoryUtils_js_1.setSessionMemoryConfig)(config);
});
/**
 * Session memory post-sampling hook that extracts and updates session notes
 */
// Track if we've logged the gate check failure this session (to avoid spam)
var hasLoggedGateFailure = false;
var extractSessionMemory = (0, sequential_js_1.sequential)(function (context) {
    return __awaiter(this, void 0, void 0, function () {
        var messages, toolUseContext, querySource, setupContext, _a, memoryPath, currentMemory, userPrompt, lastMessage, usage, config;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    messages = context.messages, toolUseContext = context.toolUseContext, querySource = context.querySource;
                    // Only run session memory on main REPL thread
                    if (querySource !== 'repl_main_thread') {
                        // Don't log this - it's expected for subagents, teammates, etc.
                        return [2 /*return*/];
                    }
                    // Check gate lazily when hook runs (cached, non-blocking)
                    if (!isSessionMemoryGateEnabled()) {
                        // Log gate failure once per session (ant-only)
                        if (process.env.USER_TYPE === 'ant' && !hasLoggedGateFailure) {
                            hasLoggedGateFailure = true;
                            (0, index_js_1.logEvent)('tengu_session_memory_gate_disabled', {});
                        }
                        return [2 /*return*/];
                    }
                    // Initialize config from remote (lazy, only once)
                    initSessionMemoryConfigIfNeeded();
                    if (!shouldExtractMemory(messages)) {
                        return [2 /*return*/];
                    }
                    (0, sessionMemoryUtils_js_1.markExtractionStarted)();
                    setupContext = (0, forkedAgent_js_1.createSubagentContext)(toolUseContext);
                    return [4 /*yield*/, setupSessionMemoryFile(setupContext)
                        // Create extraction message
                    ];
                case 1:
                    _a = _d.sent(), memoryPath = _a.memoryPath, currentMemory = _a.currentMemory;
                    return [4 /*yield*/, (0, prompts_js_2.buildSessionMemoryUpdatePrompt)(currentMemory, memoryPath)
                        // Run session memory extraction using runForkedAgent for prompt caching
                        // runForkedAgent creates an isolated context to prevent mutation of parent state
                        // Pass setupContext.readFileState so the forked agent can edit the memory file
                    ];
                case 2:
                    userPrompt = _d.sent();
                    // Run session memory extraction using runForkedAgent for prompt caching
                    // runForkedAgent creates an isolated context to prevent mutation of parent state
                    // Pass setupContext.readFileState so the forked agent can edit the memory file
                    return [4 /*yield*/, (0, forkedAgent_js_1.runForkedAgent)({
                            promptMessages: [(0, messages_js_1.createUserMessage)({ content: userPrompt })],
                            cacheSafeParams: (0, forkedAgent_js_1.createCacheSafeParams)(context),
                            canUseTool: createMemoryFileCanUseTool(memoryPath),
                            querySource: 'session_memory',
                            forkLabel: 'session_memory',
                            overrides: { readFileState: setupContext.readFileState },
                        })
                        // Log extraction event for tracking frequency
                        // Use the token usage from the last message in the conversation
                    ];
                case 3:
                    // Run session memory extraction using runForkedAgent for prompt caching
                    // runForkedAgent creates an isolated context to prevent mutation of parent state
                    // Pass setupContext.readFileState so the forked agent can edit the memory file
                    _d.sent();
                    lastMessage = messages[messages.length - 1];
                    usage = lastMessage ? (0, tokens_js_1.getTokenUsage)(lastMessage) : undefined;
                    config = (0, sessionMemoryUtils_js_1.getSessionMemoryConfig)();
                    (0, index_js_1.logEvent)('tengu_session_memory_extraction', {
                        input_tokens: usage === null || usage === void 0 ? void 0 : usage.input_tokens,
                        output_tokens: usage === null || usage === void 0 ? void 0 : usage.output_tokens,
                        cache_read_input_tokens: (_b = usage === null || usage === void 0 ? void 0 : usage.cache_read_input_tokens) !== null && _b !== void 0 ? _b : undefined,
                        cache_creation_input_tokens: (_c = usage === null || usage === void 0 ? void 0 : usage.cache_creation_input_tokens) !== null && _c !== void 0 ? _c : undefined,
                        config_min_message_tokens_to_init: config.minimumMessageTokensToInit,
                        config_min_tokens_between_update: config.minimumTokensBetweenUpdate,
                        config_tool_calls_between_updates: config.toolCallsBetweenUpdates,
                    });
                    // Record the context size at extraction for tracking minimumTokensBetweenUpdate
                    (0, sessionMemoryUtils_js_1.recordExtractionTokenCount)((0, tokens_js_1.tokenCountWithEstimation)(messages));
                    // Update lastSummarizedMessageId after successful completion
                    updateLastSummarizedMessageIdIfSafe(messages);
                    (0, sessionMemoryUtils_js_1.markExtractionCompleted)();
                    return [2 /*return*/];
            }
        });
    });
});
/**
 * Initialize session memory by registering the post-sampling hook.
 * This is synchronous to avoid race conditions during startup.
 * The gate check and config loading happen lazily when the hook runs.
 */
function initSessionMemory() {
    if ((0, state_js_1.getIsRemoteMode)())
        return;
    // Session memory is used for compaction, so respect auto-compact settings
    var autoCompactEnabled = (0, autoCompact_js_1.isAutoCompactEnabled)();
    // Log initialization state (ant-only to avoid noise in external logs)
    if (process.env.USER_TYPE === 'ant') {
        (0, index_js_1.logEvent)('tengu_session_memory_init', {
            auto_compact_enabled: autoCompactEnabled,
        });
    }
    if (!autoCompactEnabled) {
        return;
    }
    // Register hook unconditionally - gate check happens lazily when hook runs
    (0, postSamplingHooks_js_1.registerPostSamplingHook)(extractSessionMemory);
}
/**
 * Manually trigger session memory extraction, bypassing threshold checks.
 * Used by the /summary command.
 */
function manuallyExtractSessionMemory(messages, toolUseContext) {
    return __awaiter(this, void 0, void 0, function () {
        var setupContext, _a, memoryPath, currentMemory, userPrompt, _b, tools, mainLoopModel, _c, rawSystemPrompt, userContext, systemContext, systemPrompt, error_1;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (messages.length === 0) {
                        return [2 /*return*/, { success: false, error: 'No messages to summarize' }];
                    }
                    (0, sessionMemoryUtils_js_1.markExtractionStarted)();
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 6, 7, 8]);
                    setupContext = (0, forkedAgent_js_1.createSubagentContext)(toolUseContext);
                    return [4 /*yield*/, setupSessionMemoryFile(setupContext)
                        // Create extraction message
                    ];
                case 2:
                    _a = _d.sent(), memoryPath = _a.memoryPath, currentMemory = _a.currentMemory;
                    return [4 /*yield*/, (0, prompts_js_2.buildSessionMemoryUpdatePrompt)(currentMemory, memoryPath)
                        // Get system prompt for cache-safe params
                    ];
                case 3:
                    userPrompt = _d.sent();
                    _b = toolUseContext.options, tools = _b.tools, mainLoopModel = _b.mainLoopModel;
                    return [4 /*yield*/, Promise.all([
                            (0, prompts_js_1.getSystemPrompt)(tools, mainLoopModel),
                            (0, context_js_1.getUserContext)(),
                            (0, context_js_1.getSystemContext)(),
                        ])];
                case 4:
                    _c = _d.sent(), rawSystemPrompt = _c[0], userContext = _c[1], systemContext = _c[2];
                    systemPrompt = (0, systemPromptType_js_1.asSystemPrompt)(rawSystemPrompt);
                    // Run session memory extraction using runForkedAgent
                    return [4 /*yield*/, (0, forkedAgent_js_1.runForkedAgent)({
                            promptMessages: [(0, messages_js_1.createUserMessage)({ content: userPrompt })],
                            cacheSafeParams: {
                                systemPrompt: systemPrompt,
                                userContext: userContext,
                                systemContext: systemContext,
                                toolUseContext: setupContext,
                                forkContextMessages: messages,
                            },
                            canUseTool: createMemoryFileCanUseTool(memoryPath),
                            querySource: 'session_memory',
                            forkLabel: 'session_memory_manual',
                            overrides: { readFileState: setupContext.readFileState },
                        })
                        // Log manual extraction event
                    ];
                case 5:
                    // Run session memory extraction using runForkedAgent
                    _d.sent();
                    // Log manual extraction event
                    (0, index_js_1.logEvent)('tengu_session_memory_manual_extraction', {});
                    // Record the context size at extraction for tracking minimumTokensBetweenUpdate
                    (0, sessionMemoryUtils_js_1.recordExtractionTokenCount)((0, tokens_js_1.tokenCountWithEstimation)(messages));
                    // Update lastSummarizedMessageId after successful completion
                    updateLastSummarizedMessageIdIfSafe(messages);
                    return [2 /*return*/, { success: true, memoryPath: memoryPath }];
                case 6:
                    error_1 = _d.sent();
                    return [2 /*return*/, {
                            success: false,
                            error: (0, errors_js_1.errorMessage)(error_1),
                        }];
                case 7:
                    (0, sessionMemoryUtils_js_1.markExtractionCompleted)();
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    });
}
// Helper functions
/**
 * Creates a canUseTool function that only allows Edit for the exact memory file.
 */
function createMemoryFileCanUseTool(memoryPath) {
    var _this = this;
    return function (tool, input) { return __awaiter(_this, void 0, void 0, function () {
        var filePath;
        return __generator(this, function (_a) {
            if (tool.name === constants_js_1.FILE_EDIT_TOOL_NAME &&
                typeof input === 'object' &&
                input !== null &&
                'file_path' in input) {
                filePath = input.file_path;
                if (typeof filePath === 'string' && filePath === memoryPath) {
                    return [2 /*return*/, { behavior: 'allow', updatedInput: input }];
                }
            }
            return [2 /*return*/, {
                    behavior: 'deny',
                    message: "only ".concat(constants_js_1.FILE_EDIT_TOOL_NAME, " on ").concat(memoryPath, " is allowed"),
                    decisionReason: {
                        type: 'other',
                        reason: "only ".concat(constants_js_1.FILE_EDIT_TOOL_NAME, " on ").concat(memoryPath, " is allowed"),
                    },
                }];
        });
    }); };
}
/**
 * Updates lastSummarizedMessageId after successful extraction.
 * Only sets it if the last message doesn't have tool calls (to avoid orphaned tool_results).
 */
function updateLastSummarizedMessageIdIfSafe(messages) {
    if (!(0, messages_js_1.hasToolCallsInLastAssistantTurn)(messages)) {
        var lastMessage = messages[messages.length - 1];
        if (lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.uuid) {
            (0, sessionMemoryUtils_js_1.setLastSummarizedMessageId)(lastMessage.uuid);
        }
    }
}
