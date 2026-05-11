"use strict";
/**
 * Helper for running forked agent query loops with usage tracking.
 *
 * This utility ensures forked agents:
 * 1. Share identical cache-critical params with the parent to guarantee prompt cache hits
 * 2. Track full usage metrics across the entire query loop
 * 3. Log metrics via the tengu_fork_agent_query event when complete
 * 4. Isolate mutable state to prevent interference with the main agent loop
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
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
exports.saveCacheSafeParams = saveCacheSafeParams;
exports.getLastCacheSafeParams = getLastCacheSafeParams;
exports.createCacheSafeParams = createCacheSafeParams;
exports.createGetAppStateWithAllowedTools = createGetAppStateWithAllowedTools;
exports.prepareForkedCommandContext = prepareForkedCommandContext;
exports.extractResultText = extractResultText;
exports.createSubagentContext = createSubagentContext;
exports.runForkedAgent = runForkedAgent;
var crypto_1 = require("crypto");
var query_js_1 = require("../query.js");
var index_js_1 = require("../services/analytics/index.js");
var claude_js_1 = require("../services/api/claude.js");
var logging_js_1 = require("../services/api/logging.js");
var abortController_js_1 = require("./abortController.js");
var debug_js_1 = require("./debug.js");
var fileStateCache_js_1 = require("./fileStateCache.js");
var messages_js_1 = require("./messages.js");
var denialTracking_js_1 = require("./permissions/denialTracking.js");
var permissionSetup_js_1 = require("./permissions/permissionSetup.js");
var sessionStorage_js_1 = require("./sessionStorage.js");
var toolResultStorage_js_1 = require("./toolResultStorage.js");
var uuid_js_1 = require("./uuid.js");
// Slot written by handleStopHooks after each turn so post-turn forks
// (promptSuggestion, postTurnSummary, /btw) can share the main loop's
// prompt cache without each caller threading params through.
var lastCacheSafeParams = null;
function saveCacheSafeParams(params) {
    lastCacheSafeParams = params;
}
function getLastCacheSafeParams() {
    return lastCacheSafeParams;
}
/**
 * Creates CacheSafeParams from REPLHookContext.
 * Use this helper when forking from a post-sampling hook context.
 *
 * To override specific fields (e.g., toolUseContext with cloned file state),
 * spread the result and override: `{ ...createCacheSafeParams(context), toolUseContext: clonedContext }`
 *
 * @param context - The REPLHookContext from the post-sampling hook
 */
function createCacheSafeParams(context) {
    return {
        systemPrompt: context.systemPrompt,
        userContext: context.userContext,
        systemContext: context.systemContext,
        toolUseContext: context.toolUseContext,
        forkContextMessages: context.messages,
    };
}
/**
 * Creates a modified getAppState that adds allowed tools to the permission context.
 * This is used by forked skill/command execution to grant tool permissions.
 */
function createGetAppStateWithAllowedTools(baseGetAppState, allowedTools) {
    if (allowedTools.length === 0)
        return baseGetAppState;
    return function () {
        var appState = baseGetAppState();
        return __assign(__assign({}, appState), { toolPermissionContext: __assign(__assign({}, appState.toolPermissionContext), { alwaysAllowRules: __assign(__assign({}, appState.toolPermissionContext.alwaysAllowRules), { command: __spreadArray([], new Set(__spreadArray(__spreadArray([], (appState.toolPermissionContext.alwaysAllowRules.command ||
                        []), true), allowedTools, true)), true) }) }) });
    };
}
/**
 * Prepares the context for executing a forked command/skill.
 * This handles the common setup that both SkillTool and slash commands need.
 */
function prepareForkedCommandContext(command, args, context) {
    return __awaiter(this, void 0, void 0, function () {
        var skillPrompt, skillContent, allowedTools, modifiedGetAppState, agentTypeName, agents, baseAgent, promptMessages;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, command.getPromptForCommand(args, context)];
                case 1:
                    skillPrompt = _e.sent();
                    skillContent = skillPrompt
                        .map(function (block) { return (block.type === 'text' ? block.text : ''); })
                        .join('\n');
                    allowedTools = (0, permissionSetup_js_1.parseToolListFromCLI)((_a = command.allowedTools) !== null && _a !== void 0 ? _a : []);
                    modifiedGetAppState = createGetAppStateWithAllowedTools(context.getAppState, allowedTools);
                    agentTypeName = (_b = command.agent) !== null && _b !== void 0 ? _b : 'general-purpose';
                    agents = context.options.agentDefinitions.activeAgents;
                    baseAgent = (_d = (_c = agents.find(function (a) { return a.agentType === agentTypeName; })) !== null && _c !== void 0 ? _c : agents.find(function (a) { return a.agentType === 'general-purpose'; })) !== null && _d !== void 0 ? _d : agents[0];
                    if (!baseAgent) {
                        throw new Error('No agent available for forked execution');
                    }
                    promptMessages = [(0, messages_js_1.createUserMessage)({ content: skillContent })];
                    return [2 /*return*/, {
                            skillContent: skillContent,
                            modifiedGetAppState: modifiedGetAppState,
                            baseAgent: baseAgent,
                            promptMessages: promptMessages,
                        }];
            }
        });
    });
}
/**
 * Extracts result text from agent messages.
 */
function extractResultText(agentMessages, defaultText) {
    if (defaultText === void 0) { defaultText = 'Execution completed'; }
    var lastAssistantMessage = (0, messages_js_1.getLastAssistantMessage)(agentMessages);
    if (!lastAssistantMessage)
        return defaultText;
    var textContent = (0, messages_js_1.extractTextContent)(lastAssistantMessage.message.content, '\n');
    return textContent || defaultText;
}
/**
 * Creates an isolated ToolUseContext for subagents.
 *
 * By default, ALL mutable state is isolated to prevent interference:
 * - readFileState: cloned from parent
 * - abortController: new controller linked to parent (parent abort propagates)
 * - getAppState: wrapped to set shouldAvoidPermissionPrompts
 * - All mutation callbacks (setAppState, etc.): no-op
 * - Fresh collections: nestedMemoryAttachmentTriggers, toolDecisions
 *
 * Callers can:
 * - Override specific fields via the overrides parameter
 * - Explicitly opt-in to sharing specific callbacks (shareSetAppState, etc.)
 *
 * @param parentContext - The parent's ToolUseContext to create subagent context from
 * @param overrides - Optional overrides and sharing options
 *
 * @example
 * // Full isolation (for background agents like session memory)
 * const ctx = createSubagentContext(parentContext)
 *
 * @example
 * // Custom options and agentId (for AgentTool async agents)
 * const ctx = createSubagentContext(parentContext, {
 *   options: customOptions,
 *   agentId: newAgentId,
 *   messages: initialMessages,
 * })
 *
 * @example
 * // Interactive subagent that shares some state
 * const ctx = createSubagentContext(parentContext, {
 *   options: customOptions,
 *   agentId: newAgentId,
 *   shareSetAppState: true,
 *   shareSetResponseLength: true,
 *   shareAbortController: true,
 * })
 */
function createSubagentContext(parentContext, overrides) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    // Determine abortController: explicit override > share parent's > new child
    var abortController = (_a = overrides === null || overrides === void 0 ? void 0 : overrides.abortController) !== null && _a !== void 0 ? _a : ((overrides === null || overrides === void 0 ? void 0 : overrides.shareAbortController)
        ? parentContext.abortController
        : (0, abortController_js_1.createChildAbortController)(parentContext.abortController));
    // Determine getAppState - wrap to set shouldAvoidPermissionPrompts unless sharing abortController
    // (if sharing abortController, it's an interactive agent that CAN show UI)
    var getAppState = (overrides === null || overrides === void 0 ? void 0 : overrides.getAppState)
        ? overrides.getAppState
        : (overrides === null || overrides === void 0 ? void 0 : overrides.shareAbortController)
            ? parentContext.getAppState
            : function () {
                var state = parentContext.getAppState();
                if (state.toolPermissionContext.shouldAvoidPermissionPrompts) {
                    return state;
                }
                return __assign(__assign({}, state), { toolPermissionContext: __assign(__assign({}, state.toolPermissionContext), { shouldAvoidPermissionPrompts: true }) });
            };
    return {
        // Mutable state - cloned by default to maintain isolation
        // Clone overrides.readFileState if provided, otherwise clone from parent
        readFileState: (0, fileStateCache_js_1.cloneFileStateCache)((_b = overrides === null || overrides === void 0 ? void 0 : overrides.readFileState) !== null && _b !== void 0 ? _b : parentContext.readFileState),
        nestedMemoryAttachmentTriggers: new Set(),
        loadedNestedMemoryPaths: new Set(),
        dynamicSkillDirTriggers: new Set(),
        // Per-subagent: tracks skills surfaced by discovery for was_discovered telemetry (SkillTool.ts:116)
        discoveredSkillNames: new Set(),
        toolDecisions: undefined,
        // Budget decisions: override > clone of parent > undefined (feature off).
        //
        // Clone by default (not fresh): cache-sharing forks process parent
        // messages containing parent tool_use_ids. A fresh state would see
        // them as unseen and make divergent replacement decisions → wire
        // prefix differs → cache miss. A clone makes identical decisions →
        // cache hit. For non-forking subagents the parent UUIDs never match
        // — clone is a harmless no-op.
        //
        // Override: AgentTool resume (reconstructed from sidechain records)
        // and inProcessRunner (per-teammate persistent loop state).
        contentReplacementState: (_c = overrides === null || overrides === void 0 ? void 0 : overrides.contentReplacementState) !== null && _c !== void 0 ? _c : (parentContext.contentReplacementState
            ? (0, toolResultStorage_js_1.cloneContentReplacementState)(parentContext.contentReplacementState)
            : undefined),
        // AbortController
        abortController: abortController,
        // AppState access
        getAppState: getAppState,
        setAppState: (overrides === null || overrides === void 0 ? void 0 : overrides.shareSetAppState)
            ? parentContext.setAppState
            : function () { },
        // Task registration/kill must always reach the root store, even when
        // setAppState is a no-op — otherwise async agents' background bash tasks
        // are never registered and never killed (PPID=1 zombie).
        setAppStateForTasks: (_d = parentContext.setAppStateForTasks) !== null && _d !== void 0 ? _d : parentContext.setAppState,
        // Async subagents whose setAppState is a no-op need local denial tracking
        // so the denial counter actually accumulates across retries.
        localDenialTracking: (overrides === null || overrides === void 0 ? void 0 : overrides.shareSetAppState)
            ? parentContext.localDenialTracking
            : (0, denialTracking_js_1.createDenialTrackingState)(),
        // Mutation callbacks - no-op by default
        setInProgressToolUseIDs: function () { },
        setResponseLength: (overrides === null || overrides === void 0 ? void 0 : overrides.shareSetResponseLength)
            ? parentContext.setResponseLength
            : function () { },
        pushApiMetricsEntry: (overrides === null || overrides === void 0 ? void 0 : overrides.shareSetResponseLength)
            ? parentContext.pushApiMetricsEntry
            : undefined,
        updateFileHistoryState: function () { },
        // Attribution is scoped and functional (prev => next) — safe to share even
        // when setAppState is stubbed. Concurrent calls compose via React's state queue.
        updateAttributionState: parentContext.updateAttributionState,
        // UI callbacks - undefined for subagents (can't control parent UI)
        addNotification: undefined,
        setToolJSX: undefined,
        setStreamMode: undefined,
        setSDKStatus: undefined,
        openMessageSelector: undefined,
        // Fields that can be overridden or copied from parent
        options: (_e = overrides === null || overrides === void 0 ? void 0 : overrides.options) !== null && _e !== void 0 ? _e : parentContext.options,
        messages: (_f = overrides === null || overrides === void 0 ? void 0 : overrides.messages) !== null && _f !== void 0 ? _f : parentContext.messages,
        // Generate new agentId for subagents (each subagent should have its own ID)
        agentId: (_g = overrides === null || overrides === void 0 ? void 0 : overrides.agentId) !== null && _g !== void 0 ? _g : (0, uuid_js_1.createAgentId)(),
        agentType: overrides === null || overrides === void 0 ? void 0 : overrides.agentType,
        // Create new query tracking chain for subagent with incremented depth
        queryTracking: {
            chainId: (0, crypto_1.randomUUID)(),
            depth: ((_j = (_h = parentContext.queryTracking) === null || _h === void 0 ? void 0 : _h.depth) !== null && _j !== void 0 ? _j : -1) + 1,
        },
        fileReadingLimits: parentContext.fileReadingLimits,
        userModified: parentContext.userModified,
        criticalSystemReminder_EXPERIMENTAL: overrides === null || overrides === void 0 ? void 0 : overrides.criticalSystemReminder_EXPERIMENTAL,
        requireCanUseTool: overrides === null || overrides === void 0 ? void 0 : overrides.requireCanUseTool,
    };
}
/**
 * Runs a forked agent query loop and tracks cache hit metrics.
 *
 * This function:
 * 1. Uses identical cache-safe params from parent to enable prompt caching
 * 2. Accumulates usage across all query iterations
 * 3. Logs tengu_fork_agent_query with full usage when complete
 *
 * @example
 * ```typescript
 * const result = await runForkedAgent({
 *   promptMessages: [createUserMessage({ content: userPrompt })],
 *   cacheSafeParams: {
 *     systemPrompt,
 *     userContext,
 *     systemContext,
 *     toolUseContext: clonedToolUseContext,
 *     forkContextMessages: messages,
 *   },
 *   canUseTool,
 *   querySource: 'session_memory',
 *   forkLabel: 'session_memory',
 * })
 * ```
 */
function runForkedAgent(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var startTime, outputMessages, totalUsage, systemPrompt, userContext, systemContext, toolUseContext, forkContextMessages, isolatedToolUseContext, initialMessages, agentId, lastRecordedUuid, _c, _d, _e, message, turnUsage, msg, e_1_1, durationMs;
        var _f, e_1, _g, _h;
        var _j;
        var promptMessages = _b.promptMessages, cacheSafeParams = _b.cacheSafeParams, canUseTool = _b.canUseTool, querySource = _b.querySource, forkLabel = _b.forkLabel, overrides = _b.overrides, maxOutputTokens = _b.maxOutputTokens, maxTurns = _b.maxTurns, onMessage = _b.onMessage, skipTranscript = _b.skipTranscript, skipCacheWrite = _b.skipCacheWrite;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0:
                    startTime = Date.now();
                    outputMessages = [];
                    totalUsage = __assign({}, logging_js_1.EMPTY_USAGE);
                    systemPrompt = cacheSafeParams.systemPrompt, userContext = cacheSafeParams.userContext, systemContext = cacheSafeParams.systemContext, toolUseContext = cacheSafeParams.toolUseContext, forkContextMessages = cacheSafeParams.forkContextMessages;
                    isolatedToolUseContext = createSubagentContext(toolUseContext, overrides);
                    initialMessages = __spreadArray(__spreadArray([], forkContextMessages, true), promptMessages, true);
                    agentId = skipTranscript ? undefined : (0, uuid_js_1.createAgentId)(forkLabel);
                    lastRecordedUuid = null;
                    if (!agentId) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, sessionStorage_js_1.recordSidechainTranscript)(initialMessages, agentId).catch(function (err) {
                            return (0, debug_js_1.logForDebugging)("Forked agent [".concat(forkLabel, "] failed to record initial transcript: ").concat(err));
                        })
                        // Track the last recorded message UUID for parent chain continuity
                    ];
                case 1:
                    _k.sent();
                    // Track the last recorded message UUID for parent chain continuity
                    lastRecordedUuid =
                        initialMessages.length > 0
                            ? initialMessages[initialMessages.length - 1].uuid
                            : null;
                    _k.label = 2;
                case 2:
                    _k.trys.push([2, , 16, 17]);
                    _k.label = 3;
                case 3:
                    _k.trys.push([3, 9, 10, 15]);
                    _c = true, _d = __asyncValues((0, query_js_1.query)({
                        messages: initialMessages,
                        systemPrompt: systemPrompt,
                        userContext: userContext,
                        systemContext: systemContext,
                        canUseTool: canUseTool,
                        toolUseContext: isolatedToolUseContext,
                        querySource: querySource,
                        maxOutputTokensOverride: maxOutputTokens,
                        maxTurns: maxTurns,
                        skipCacheWrite: skipCacheWrite,
                    }));
                    _k.label = 4;
                case 4: return [4 /*yield*/, _d.next()];
                case 5:
                    if (!(_e = _k.sent(), _f = _e.done, !_f)) return [3 /*break*/, 8];
                    _h = _e.value;
                    _c = false;
                    message = _h;
                    // Extract real usage from message_delta stream events (final usage per API call)
                    if (message.type === 'stream_event') {
                        if ('event' in message &&
                            ((_j = message.event) === null || _j === void 0 ? void 0 : _j.type) === 'message_delta' &&
                            message.event.usage) {
                            turnUsage = (0, claude_js_1.updateUsage)(__assign({}, logging_js_1.EMPTY_USAGE), message.event.usage);
                            totalUsage = (0, claude_js_1.accumulateUsage)(totalUsage, turnUsage);
                        }
                        return [3 /*break*/, 7];
                    }
                    if (message.type === 'stream_request_start') {
                        return [3 /*break*/, 7];
                    }
                    (0, debug_js_1.logForDebugging)("Forked agent [".concat(forkLabel, "] received message: type=").concat(message.type));
                    outputMessages.push(message);
                    onMessage === null || onMessage === void 0 ? void 0 : onMessage(message);
                    msg = message;
                    if (!(agentId &&
                        (msg.type === 'assistant' ||
                            msg.type === 'user' ||
                            msg.type === 'progress'))) return [3 /*break*/, 7];
                    return [4 /*yield*/, (0, sessionStorage_js_1.recordSidechainTranscript)([msg], agentId, lastRecordedUuid).catch(function (err) {
                            return (0, debug_js_1.logForDebugging)("Forked agent [".concat(forkLabel, "] failed to record transcript: ").concat(err));
                        })];
                case 6:
                    _k.sent();
                    if (msg.type !== 'progress') {
                        lastRecordedUuid = msg.uuid;
                    }
                    _k.label = 7;
                case 7:
                    _c = true;
                    return [3 /*break*/, 4];
                case 8: return [3 /*break*/, 15];
                case 9:
                    e_1_1 = _k.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 15];
                case 10:
                    _k.trys.push([10, , 13, 14]);
                    if (!(!_c && !_f && (_g = _d.return))) return [3 /*break*/, 12];
                    return [4 /*yield*/, _g.call(_d)];
                case 11:
                    _k.sent();
                    _k.label = 12;
                case 12: return [3 /*break*/, 14];
                case 13:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 14: return [7 /*endfinally*/];
                case 15: return [3 /*break*/, 17];
                case 16:
                    // Release cloned file state cache memory (same pattern as runAgent.ts)
                    isolatedToolUseContext.readFileState.clear();
                    // Release the cloned fork context messages
                    initialMessages.length = 0;
                    return [7 /*endfinally*/];
                case 17:
                    (0, debug_js_1.logForDebugging)("Forked agent [".concat(forkLabel, "] finished: ").concat(outputMessages.length, " messages, types=[").concat(outputMessages.map(function (m) { return m.type; }).join(', '), "], totalUsage: input=").concat(totalUsage.input_tokens, " output=").concat(totalUsage.output_tokens, " cacheRead=").concat(totalUsage.cache_read_input_tokens, " cacheCreate=").concat(totalUsage.cache_creation_input_tokens));
                    durationMs = Date.now() - startTime;
                    // Log the fork query metrics with full NonNullableUsage
                    logForkAgentQueryEvent({
                        forkLabel: forkLabel,
                        querySource: querySource,
                        durationMs: durationMs,
                        messageCount: outputMessages.length,
                        totalUsage: totalUsage,
                        queryTracking: toolUseContext.queryTracking,
                    });
                    return [2 /*return*/, {
                            messages: outputMessages,
                            totalUsage: totalUsage,
                        }];
            }
        });
    });
}
/**
 * Logs the tengu_fork_agent_query event with full NonNullableUsage fields.
 */
function logForkAgentQueryEvent(_a) {
    var forkLabel = _a.forkLabel, querySource = _a.querySource, durationMs = _a.durationMs, messageCount = _a.messageCount, totalUsage = _a.totalUsage, queryTracking = _a.queryTracking;
    // Calculate cache hit rate
    var totalInputTokens = totalUsage.input_tokens +
        totalUsage.cache_creation_input_tokens +
        totalUsage.cache_read_input_tokens;
    var cacheHitRate = totalInputTokens > 0
        ? totalUsage.cache_read_input_tokens / totalInputTokens
        : 0;
    (0, index_js_1.logEvent)('tengu_fork_agent_query', __assign({ 
        // Metadata
        forkLabel: forkLabel, querySource: querySource, durationMs: durationMs, messageCount: messageCount, 
        // NonNullableUsage fields
        inputTokens: totalUsage.input_tokens, outputTokens: totalUsage.output_tokens, cacheReadInputTokens: totalUsage.cache_read_input_tokens, cacheCreationInputTokens: totalUsage.cache_creation_input_tokens, serviceTier: totalUsage.service_tier, cacheCreationEphemeral1hTokens: totalUsage.cache_creation.ephemeral_1h_input_tokens, cacheCreationEphemeral5mTokens: totalUsage.cache_creation.ephemeral_5m_input_tokens, 
        // Derived metrics
        cacheHitRate: cacheHitRate }, (queryTracking
        ? {
            queryChainId: queryTracking.chainId,
            queryDepth: queryTracking.depth,
        }
        : {})));
}
