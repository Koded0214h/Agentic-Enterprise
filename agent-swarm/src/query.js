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
var __addDisposableResource = (this && this.__addDisposableResource) || function (env, value, async) {
    if (value !== null && value !== void 0) {
        if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
        var dispose, inner;
        if (async) {
            if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
            dispose = value[Symbol.asyncDispose];
        }
        if (dispose === void 0) {
            if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
            dispose = value[Symbol.dispose];
            if (async) inner = dispose;
        }
        if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
        if (inner) dispose = function() { try { inner.call(this); } catch (e) { return Promise.reject(e); } };
        env.stack.push({ value: value, dispose: dispose, async: async });
    }
    else if (async) {
        env.stack.push({ async: true });
    }
    return value;
};
var __disposeResources = (this && this.__disposeResources) || (function (SuppressedError) {
    return function (env) {
        function fail(e) {
            env.error = env.hasError ? new SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
            env.hasError = true;
        }
        var r, s = 0;
        function next() {
            while (r = env.stack.pop()) {
                try {
                    if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
                    if (r.dispose) {
                        var result = r.dispose.call(r.value);
                        if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) { fail(e); return next(); });
                    }
                    else s |= 1;
                }
                catch (e) {
                    fail(e);
                }
            }
            if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
            if (env.hasError) throw env.error;
        }
        return next();
    };
})(typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
});
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncDelegator = (this && this.__asyncDelegator) || function (o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: false } : f ? f(v) : v; } : f; }
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = query;
var withRetry_js_1 = require("./services/api/withRetry.js");
var autoCompact_js_1 = require("./services/compact/autoCompact.js");
var compact_js_1 = require("./services/compact/compact.js");
/* eslint-disable @typescript-eslint/no-require-imports */
var reactiveCompact = (0, bun_bundle_1.feature)('REACTIVE_COMPACT')
    ? require('./services/compact/reactiveCompact.js')
    : null;
var contextCollapse = (0, bun_bundle_1.feature)('CONTEXT_COLLAPSE')
    ? require('./services/contextCollapse/index.js')
    : null;
/* eslint-enable @typescript-eslint/no-require-imports */
var index_js_1 = require("src/services/analytics/index.js");
var imageValidation_js_1 = require("./utils/imageValidation.js");
var imageResizer_js_1 = require("./utils/imageResizer.js");
var Tool_js_1 = require("./Tool.js");
var systemPromptType_js_1 = require("./utils/systemPromptType.js");
var log_js_1 = require("./utils/log.js");
var errors_js_1 = require("./services/api/errors.js");
var debug_js_1 = require("./utils/debug.js");
var messages_js_1 = require("./utils/messages.js");
var toolUseSummaryGenerator_js_1 = require("./services/toolUseSummary/toolUseSummaryGenerator.js");
var api_js_1 = require("./utils/api.js");
var attachments_js_1 = require("./utils/attachments.js");
/* eslint-disable @typescript-eslint/no-require-imports */
var skillPrefetch = (0, bun_bundle_1.feature)('EXPERIMENTAL_SKILL_SEARCH')
    ? require('./services/skillSearch/prefetch.js')
    : null;
var jobClassifier = (0, bun_bundle_1.feature)('TEMPLATES')
    ? require('./jobs/classifier.js')
    : null;
/* eslint-enable @typescript-eslint/no-require-imports */
var messageQueueManager_js_1 = require("./utils/messageQueueManager.js");
var commandLifecycle_js_1 = require("./utils/commandLifecycle.js");
var headlessProfiler_js_1 = require("./utils/headlessProfiler.js");
var model_js_1 = require("./utils/model/model.js");
var tokens_js_1 = require("./utils/tokens.js");
var context_js_1 = require("./utils/context.js");
var growthbook_js_1 = require("./services/analytics/growthbook.js");
var prompt_js_1 = require("./tools/SleepTool/prompt.js");
var postSamplingHooks_js_1 = require("./utils/hooks/postSamplingHooks.js");
var hooks_js_1 = require("./utils/hooks.js");
var dumpPrompts_js_1 = require("./services/api/dumpPrompts.js");
var StreamingToolExecutor_js_1 = require("./services/tools/StreamingToolExecutor.js");
var queryProfiler_js_1 = require("./utils/queryProfiler.js");
var toolOrchestration_js_1 = require("./services/tools/toolOrchestration.js");
var toolResultStorage_js_1 = require("./utils/toolResultStorage.js");
var sessionStorage_js_1 = require("./utils/sessionStorage.js");
var stopHooks_js_1 = require("./query/stopHooks.js");
var config_js_1 = require("./query/config.js");
var deps_js_1 = require("./query/deps.js");
var bun_bundle_1 = require("bun:bundle");
var state_js_1 = require("./bootstrap/state.js");
var tokenBudget_js_1 = require("./query/tokenBudget.js");
var array_js_1 = require("./utils/array.js");
/* eslint-disable @typescript-eslint/no-require-imports */
var snipModule = (0, bun_bundle_1.feature)('HISTORY_SNIP')
    ? require('./services/compact/snipCompact.js')
    : null;
var taskSummaryModule = (0, bun_bundle_1.feature)('BG_SESSIONS')
    ? require('./utils/taskSummary.js')
    : null;
/* eslint-enable @typescript-eslint/no-require-imports */
function yieldMissingToolResultBlocks(assistantMessages, errorMessage) {
    var _i, assistantMessages_1, assistantMessage, toolUseBlocks, _a, toolUseBlocks_1, toolUse;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _i = 0, assistantMessages_1 = assistantMessages;
                _b.label = 1;
            case 1:
                if (!(_i < assistantMessages_1.length)) return [3 /*break*/, 6];
                assistantMessage = assistantMessages_1[_i];
                toolUseBlocks = assistantMessage.message.content.filter(function (content) { return content.type === 'tool_use'; });
                _a = 0, toolUseBlocks_1 = toolUseBlocks;
                _b.label = 2;
            case 2:
                if (!(_a < toolUseBlocks_1.length)) return [3 /*break*/, 5];
                toolUse = toolUseBlocks_1[_a];
                return [4 /*yield*/, (0, messages_js_1.createUserMessage)({
                        content: [
                            {
                                type: 'tool_result',
                                content: errorMessage,
                                is_error: true,
                                tool_use_id: toolUse.id,
                            },
                        ],
                        toolUseResult: errorMessage,
                        sourceToolAssistantUUID: assistantMessage.uuid,
                    })];
            case 3:
                _b.sent();
                _b.label = 4;
            case 4:
                _a++;
                return [3 /*break*/, 2];
            case 5:
                _i++;
                return [3 /*break*/, 1];
            case 6: return [2 /*return*/];
        }
    });
}
/**
 * The rules of thinking are lengthy and fortuitous. They require plenty of thinking
 * of most long duration and deep meditation for a wizard to wrap one's noggin around.
 *
 * The rules follow:
 * 1. A message that contains a thinking or redacted_thinking block must be part of a query whose max_thinking_length > 0
 * 2. A thinking block may not be the last message in a block
 * 3. Thinking blocks must be preserved for the duration of an assistant trajectory (a single turn, or if that turn includes a tool_use block then also its subsequent tool_result and the following assistant message)
 *
 * Heed these rules well, young wizard. For they are the rules of thinking, and
 * the rules of thinking are the rules of the universe. If ye does not heed these
 * rules, ye will be punished with an entire day of debugging and hair pulling.
 */
var MAX_OUTPUT_TOKENS_RECOVERY_LIMIT = 3;
/**
 * Is this a max_output_tokens error message? If so, the streaming loop should
 * withhold it from SDK callers until we know whether the recovery loop can
 * continue. Yielding early leaks an intermediate error to SDK callers (e.g.
 * cowork/desktop) that terminate the session on any `error` field — the
 * recovery loop keeps running but nobody is listening.
 *
 * Mirrors reactiveCompact.isWithheldPromptTooLong.
 */
function isWithheldMaxOutputTokens(msg) {
    return (msg === null || msg === void 0 ? void 0 : msg.type) === 'assistant' && msg.apiError === 'max_output_tokens';
}
function query(params) {
    return __asyncGenerator(this, arguments, function query_1() {
        var consumedCommandUuids, terminal, _i, consumedCommandUuids_1, uuid;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    consumedCommandUuids = [];
                    return [5 /*yield**/, __values(__asyncDelegator(__asyncValues(queryLoop(params, consumedCommandUuids))))
                        // Only reached if queryLoop returned normally. Skipped on throw (error
                        // propagates through yield*) and on .return() (Return completion closes
                        // both generators). This gives the same asymmetric started-without-completed
                        // signal as print.ts's drainCommandQueue when the turn fails.
                    ];
                case 1: return [4 /*yield*/, __await.apply(void 0, [_a.sent()
                        // Only reached if queryLoop returned normally. Skipped on throw (error
                        // propagates through yield*) and on .return() (Return completion closes
                        // both generators). This gives the same asymmetric started-without-completed
                        // signal as print.ts's drainCommandQueue when the turn fails.
                    ])];
                case 2:
                    terminal = _a.sent();
                    // Only reached if queryLoop returned normally. Skipped on throw (error
                    // propagates through yield*) and on .return() (Return completion closes
                    // both generators). This gives the same asymmetric started-without-completed
                    // signal as print.ts's drainCommandQueue when the turn fails.
                    for (_i = 0, consumedCommandUuids_1 = consumedCommandUuids; _i < consumedCommandUuids_1.length; _i++) {
                        uuid = consumedCommandUuids_1[_i];
                        (0, commandLifecycle_js_1.notifyCommandLifecycle)(uuid, 'completed');
                    }
                    return [4 /*yield*/, __await(terminal)];
                case 3: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function queryLoop(params, consumedCommandUuids) {
    return __asyncGenerator(this, arguments, function queryLoop_1() {
        var env_1, systemPrompt, userContext, systemContext, canUseTool, fallbackModel, querySource, maxTurns, skipCacheWrite, deps, state, budgetTracker, taskBudgetRemaining, config, pendingMemoryPrefetch, _loop_1, state_1, e_1;
        var _a, e_2, _b, _c, _d, e_3, _e, _f, _g, e_4, _h, _j, _k, e_5, _l, _m;
        var _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y;
        return __generator(this, function (_z) {
            switch (_z.label) {
                case 0:
                    env_1 = { stack: [], error: void 0, hasError: false };
                    _z.label = 1;
                case 1:
                    _z.trys.push([1, 5, 6, 7]);
                    systemPrompt = params.systemPrompt, userContext = params.userContext, systemContext = params.systemContext, canUseTool = params.canUseTool, fallbackModel = params.fallbackModel, querySource = params.querySource, maxTurns = params.maxTurns, skipCacheWrite = params.skipCacheWrite;
                    deps = (_o = params.deps) !== null && _o !== void 0 ? _o : (0, deps_js_1.productionDeps)();
                    state = {
                        messages: params.messages,
                        toolUseContext: params.toolUseContext,
                        maxOutputTokensOverride: params.maxOutputTokensOverride,
                        autoCompactTracking: undefined,
                        stopHookActive: undefined,
                        maxOutputTokensRecoveryCount: 0,
                        hasAttemptedReactiveCompact: false,
                        turnCount: 1,
                        pendingToolUseSummary: undefined,
                        transition: undefined,
                    };
                    budgetTracker = (0, bun_bundle_1.feature)('TOKEN_BUDGET') ? (0, tokenBudget_js_1.createBudgetTracker)() : null;
                    taskBudgetRemaining = undefined;
                    config = (0, config_js_1.buildQueryConfig)();
                    pendingMemoryPrefetch = __addDisposableResource(env_1, (0, attachments_js_1.startRelevantMemoryPrefetch)(state.messages, state.toolUseContext)
                    // eslint-disable-next-line no-constant-condition
                    , false);
                    _loop_1 = function () {
                        var toolUseContext, messages, autoCompactTracking, maxOutputTokensRecoveryCount, hasAttemptedReactiveCompact, maxOutputTokensOverride, pendingToolUseSummary, stopHookActive, turnCount, pendingSkillPrefetch, queryTracking, queryChainIdForAnalytics, messagesForQuery, tracking, persistReplacements, snipTokensFreed, snipResult, microcompactResult, pendingCacheEdits, collapseResult, fullSystemPrompt, _0, compactionResult, consecutiveFailures, preCompactTokenCount, postCompactTokenCount, truePostCompactTokenCount, compactionUsage, preCompactContext, postCompactMessages, _i, postCompactMessages_1, message, assistantMessages, toolResults, toolUseBlocks, needsFollowUp, useStreamingToolExecution, streamingToolExecutor, appState, permissionMode, currentModel, dumpPromptsFetch, collapseOwnsIt, mediaRecoveryEnabled, isAtBlockingLimit, _1, attemptWithFallback, _loop_2, error_1, errorMessage, _2, _3, _4, _5, _6, update, e_3_1, cleanupComputerUseAfterTurn, _7, _8, summary, lastMessage, isWithheld413, isWithheldMedia, drained, next_1, compacted, preCompactContext, postCompactMessages, _9, postCompactMessages_2, msg, next_2, _10, _11, capEnabled, next_3, recoveryMessage, next_4, _12, stopHookResult, _13, next_5, decision, _14, shouldPreventContinuation, updatedToolUseContext, toolUpdates, _15, toolUpdates_1, toolUpdates_1_1, update, e_4_1, nextPendingToolUseSummary, lastAssistantMessage, lastAssistantText, textBlocks, lastTextBlock, toolUseIds_1, toolInfoForSummary, cleanupComputerUseAfterTurn, _16, nextTurnCountOnAbort, _17, _18, sleepRan, isMainThread, currentAgentId, queuedCommandsSnapshot, _19, _20, _21, attachment, e_5_1, memoryAttachments, _22, _23, memoryAttachments_1, memAttachment, msg, skillAttachments, _24, skillAttachments_1, att, msg, consumedCommands, _25, consumedCommands_1, cmd, fileChangeAttachmentCount, refreshedTools, toolUseContextWithQueryTracking, nextTurnCount, _26, next;
                        return __generator(this, function (_27) {
                            switch (_27.label) {
                                case 0:
                                    toolUseContext = state.toolUseContext;
                                    messages = state.messages, autoCompactTracking = state.autoCompactTracking, maxOutputTokensRecoveryCount = state.maxOutputTokensRecoveryCount, hasAttemptedReactiveCompact = state.hasAttemptedReactiveCompact, maxOutputTokensOverride = state.maxOutputTokensOverride, pendingToolUseSummary = state.pendingToolUseSummary, stopHookActive = state.stopHookActive, turnCount = state.turnCount;
                                    pendingSkillPrefetch = skillPrefetch === null || skillPrefetch === void 0 ? void 0 : skillPrefetch.startSkillDiscoveryPrefetch(null, messages, toolUseContext);
                                    return [4 /*yield*/, __await({ type: 'stream_request_start' })];
                                case 1: return [4 /*yield*/, _27.sent()];
                                case 2:
                                    _27.sent();
                                    (0, queryProfiler_js_1.queryCheckpoint)('query_fn_entry');
                                    // Record query start for headless latency tracking (skip for subagents)
                                    if (!toolUseContext.agentId) {
                                        (0, headlessProfiler_js_1.headlessProfilerCheckpoint)('query_started');
                                    }
                                    queryTracking = toolUseContext.queryTracking
                                        ? {
                                            chainId: toolUseContext.queryTracking.chainId,
                                            depth: toolUseContext.queryTracking.depth + 1,
                                        }
                                        : {
                                            chainId: deps.uuid(),
                                            depth: 0,
                                        };
                                    queryChainIdForAnalytics = queryTracking.chainId;
                                    toolUseContext = __assign(__assign({}, toolUseContext), { queryTracking: queryTracking });
                                    messagesForQuery = __spreadArray([], (0, messages_js_1.getMessagesAfterCompactBoundary)(messages), true);
                                    tracking = autoCompactTracking;
                                    persistReplacements = querySource.startsWith('agent:') ||
                                        querySource.startsWith('repl_main_thread');
                                    return [4 /*yield*/, __await((0, toolResultStorage_js_1.applyToolResultBudget)(messagesForQuery, toolUseContext.contentReplacementState, persistReplacements
                                            ? function (records) {
                                                return void (0, sessionStorage_js_1.recordContentReplacement)(records, toolUseContext.agentId).catch(log_js_1.logError);
                                            }
                                            : undefined, new Set(toolUseContext.options.tools
                                            .filter(function (t) { return !Number.isFinite(t.maxResultSizeChars); })
                                            .map(function (t) { return t.name; })))
                                        // Apply snip before microcompact (both may run — they are not mutually exclusive).
                                        // snipTokensFreed is plumbed to autocompact so its threshold check reflects
                                        // what snip removed; tokenCountWithEstimation alone can't see it (reads usage
                                        // from the protected-tail assistant, which survives snip unchanged).
                                        )];
                                case 3:
                                    messagesForQuery = _27.sent();
                                    snipTokensFreed = 0;
                                    if (!(0, bun_bundle_1.feature)('HISTORY_SNIP')) return [3 /*break*/, 7];
                                    (0, queryProfiler_js_1.queryCheckpoint)('query_snip_start');
                                    snipResult = snipModule.snipCompactIfNeeded(messagesForQuery);
                                    messagesForQuery = snipResult.messages;
                                    snipTokensFreed = snipResult.tokensFreed;
                                    if (!snipResult.boundaryMessage) return [3 /*break*/, 6];
                                    return [4 /*yield*/, __await(snipResult.boundaryMessage)];
                                case 4: return [4 /*yield*/, _27.sent()];
                                case 5:
                                    _27.sent();
                                    _27.label = 6;
                                case 6:
                                    (0, queryProfiler_js_1.queryCheckpoint)('query_snip_end');
                                    _27.label = 7;
                                case 7:
                                    // Apply microcompact before autocompact
                                    (0, queryProfiler_js_1.queryCheckpoint)('query_microcompact_start');
                                    return [4 /*yield*/, __await(deps.microcompact(messagesForQuery, toolUseContext, querySource))];
                                case 8:
                                    microcompactResult = _27.sent();
                                    messagesForQuery = microcompactResult.messages;
                                    pendingCacheEdits = (0, bun_bundle_1.feature)('CACHED_MICROCOMPACT')
                                        ? (_p = microcompactResult.compactionInfo) === null || _p === void 0 ? void 0 : _p.pendingCacheEdits
                                        : undefined;
                                    (0, queryProfiler_js_1.queryCheckpoint)('query_microcompact_end');
                                    if (!((0, bun_bundle_1.feature)('CONTEXT_COLLAPSE') && contextCollapse)) return [3 /*break*/, 10];
                                    return [4 /*yield*/, __await(contextCollapse.applyCollapsesIfNeeded(messagesForQuery, toolUseContext, querySource))];
                                case 9:
                                    collapseResult = _27.sent();
                                    messagesForQuery = collapseResult.messages;
                                    _27.label = 10;
                                case 10:
                                    fullSystemPrompt = (0, systemPromptType_js_1.asSystemPrompt)((0, api_js_1.appendSystemContext)(systemPrompt, systemContext));
                                    (0, queryProfiler_js_1.queryCheckpoint)('query_autocompact_start');
                                    return [4 /*yield*/, __await(deps.autocompact(messagesForQuery, toolUseContext, {
                                            systemPrompt: systemPrompt,
                                            userContext: userContext,
                                            systemContext: systemContext,
                                            toolUseContext: toolUseContext,
                                            forkContextMessages: messagesForQuery,
                                        }, querySource, tracking, snipTokensFreed))];
                                case 11:
                                    _0 = _27.sent(), compactionResult = _0.compactionResult, consecutiveFailures = _0.consecutiveFailures;
                                    (0, queryProfiler_js_1.queryCheckpoint)('query_autocompact_end');
                                    if (!compactionResult) return [3 /*break*/, 17];
                                    preCompactTokenCount = compactionResult.preCompactTokenCount, postCompactTokenCount = compactionResult.postCompactTokenCount, truePostCompactTokenCount = compactionResult.truePostCompactTokenCount, compactionUsage = compactionResult.compactionUsage;
                                    (0, index_js_1.logEvent)('tengu_auto_compact_succeeded', {
                                        originalMessageCount: messages.length,
                                        compactedMessageCount: compactionResult.summaryMessages.length +
                                            compactionResult.attachments.length +
                                            compactionResult.hookResults.length,
                                        preCompactTokenCount: preCompactTokenCount,
                                        postCompactTokenCount: postCompactTokenCount,
                                        truePostCompactTokenCount: truePostCompactTokenCount,
                                        compactionInputTokens: compactionUsage === null || compactionUsage === void 0 ? void 0 : compactionUsage.input_tokens,
                                        compactionOutputTokens: compactionUsage === null || compactionUsage === void 0 ? void 0 : compactionUsage.output_tokens,
                                        compactionCacheReadTokens: (_q = compactionUsage === null || compactionUsage === void 0 ? void 0 : compactionUsage.cache_read_input_tokens) !== null && _q !== void 0 ? _q : 0,
                                        compactionCacheCreationTokens: (_r = compactionUsage === null || compactionUsage === void 0 ? void 0 : compactionUsage.cache_creation_input_tokens) !== null && _r !== void 0 ? _r : 0,
                                        compactionTotalTokens: compactionUsage
                                            ? compactionUsage.input_tokens +
                                                ((_s = compactionUsage.cache_creation_input_tokens) !== null && _s !== void 0 ? _s : 0) +
                                                ((_t = compactionUsage.cache_read_input_tokens) !== null && _t !== void 0 ? _t : 0) +
                                                compactionUsage.output_tokens
                                            : 0,
                                        queryChainId: queryChainIdForAnalytics,
                                        queryDepth: queryTracking.depth,
                                    });
                                    // task_budget: capture pre-compact final context window before
                                    // messagesForQuery is replaced with postCompactMessages below.
                                    // iterations[-1] is the authoritative final window (post server tool
                                    // loops); see #304930.
                                    if (params.taskBudget) {
                                        preCompactContext = (0, tokens_js_1.finalContextTokensFromLastResponse)(messagesForQuery);
                                        taskBudgetRemaining = Math.max(0, (taskBudgetRemaining !== null && taskBudgetRemaining !== void 0 ? taskBudgetRemaining : params.taskBudget.total) - preCompactContext);
                                    }
                                    // Reset on every compact so turnCounter/turnId reflect the MOST RECENT
                                    // compact. recompactionInfo (autoCompact.ts:190) already captured the
                                    // old values for turnsSincePreviousCompact/previousCompactTurnId before
                                    // the call, so this reset doesn't lose those.
                                    tracking = {
                                        compacted: true,
                                        turnId: deps.uuid(),
                                        turnCounter: 0,
                                        consecutiveFailures: 0,
                                    };
                                    postCompactMessages = (0, compact_js_1.buildPostCompactMessages)(compactionResult);
                                    _i = 0, postCompactMessages_1 = postCompactMessages;
                                    _27.label = 12;
                                case 12:
                                    if (!(_i < postCompactMessages_1.length)) return [3 /*break*/, 16];
                                    message = postCompactMessages_1[_i];
                                    return [4 /*yield*/, __await(message)];
                                case 13: return [4 /*yield*/, _27.sent()];
                                case 14:
                                    _27.sent();
                                    _27.label = 15;
                                case 15:
                                    _i++;
                                    return [3 /*break*/, 12];
                                case 16:
                                    // Continue on with the current query call using the post compact messages
                                    messagesForQuery = postCompactMessages;
                                    return [3 /*break*/, 18];
                                case 17:
                                    if (consecutiveFailures !== undefined) {
                                        // Autocompact failed — propagate failure count so the circuit breaker
                                        // can stop retrying on the next iteration.
                                        tracking = __assign(__assign({}, (tracking !== null && tracking !== void 0 ? tracking : { compacted: false, turnId: '', turnCounter: 0 })), { consecutiveFailures: consecutiveFailures });
                                    }
                                    _27.label = 18;
                                case 18:
                                    //TODO: no need to set toolUseContext.messages during set-up since it is updated here
                                    toolUseContext = __assign(__assign({}, toolUseContext), { messages: messagesForQuery });
                                    assistantMessages = [];
                                    toolResults = [];
                                    toolUseBlocks = [];
                                    needsFollowUp = false;
                                    (0, queryProfiler_js_1.queryCheckpoint)('query_setup_start');
                                    useStreamingToolExecution = config.gates.streamingToolExecution;
                                    streamingToolExecutor = useStreamingToolExecution
                                        ? new StreamingToolExecutor_js_1.StreamingToolExecutor(toolUseContext.options.tools, canUseTool, toolUseContext)
                                        : null;
                                    appState = toolUseContext.getAppState();
                                    permissionMode = appState.toolPermissionContext.mode;
                                    currentModel = (0, model_js_1.getRuntimeMainLoopModel)({
                                        permissionMode: permissionMode,
                                        mainLoopModel: toolUseContext.options.mainLoopModel,
                                        exceeds200kTokens: permissionMode === 'plan' &&
                                            (0, tokens_js_1.doesMostRecentAssistantMessageExceed200k)(messagesForQuery),
                                    });
                                    (0, queryProfiler_js_1.queryCheckpoint)('query_setup_end');
                                    dumpPromptsFetch = config.gates.isAnt
                                        ? (0, dumpPrompts_js_1.createDumpPromptsFetch)((_u = toolUseContext.agentId) !== null && _u !== void 0 ? _u : config.sessionId)
                                        : undefined;
                                    collapseOwnsIt = false;
                                    if ((0, bun_bundle_1.feature)('CONTEXT_COLLAPSE')) {
                                        collapseOwnsIt =
                                            ((_v = contextCollapse === null || contextCollapse === void 0 ? void 0 : contextCollapse.isContextCollapseEnabled()) !== null && _v !== void 0 ? _v : false) &&
                                                (0, autoCompact_js_1.isAutoCompactEnabled)();
                                    }
                                    mediaRecoveryEnabled = (_w = reactiveCompact === null || reactiveCompact === void 0 ? void 0 : reactiveCompact.isReactiveCompactEnabled()) !== null && _w !== void 0 ? _w : false;
                                    if (!(!compactionResult &&
                                        querySource !== 'compact' &&
                                        querySource !== 'session_memory' &&
                                        !((reactiveCompact === null || reactiveCompact === void 0 ? void 0 : reactiveCompact.isReactiveCompactEnabled()) && (0, autoCompact_js_1.isAutoCompactEnabled)()) &&
                                        !collapseOwnsIt)) return [3 /*break*/, 22];
                                    isAtBlockingLimit = (0, autoCompact_js_1.calculateTokenWarningState)((0, tokens_js_1.tokenCountWithEstimation)(messagesForQuery) - snipTokensFreed, toolUseContext.options.mainLoopModel).isAtBlockingLimit;
                                    if (!isAtBlockingLimit) return [3 /*break*/, 22];
                                    return [4 /*yield*/, __await((0, messages_js_1.createAssistantAPIErrorMessage)({
                                            content: errors_js_1.PROMPT_TOO_LONG_ERROR_MESSAGE,
                                            error: 'invalid_request',
                                        }))];
                                case 19: return [4 /*yield*/, _27.sent()];
                                case 20:
                                    _27.sent();
                                    _1 = {};
                                    return [4 /*yield*/, __await({ reason: 'blocking_limit' })];
                                case 21: return [2 /*return*/, (_1.value = _27.sent(), _1)];
                                case 22:
                                    attemptWithFallback = true;
                                    (0, queryProfiler_js_1.queryCheckpoint)('query_api_loop_start');
                                    _27.label = 23;
                                case 23:
                                    _27.trys.push([23, 27, , 37]);
                                    _loop_2 = function () {
                                        var streamingFallbackOccured_1, _28, _29, _30, message, _31, assistantMessages_2, msg, yieldMessage, clonedContent, _loop_3, i, withheld, msgToolUseBlocks, _32, msgToolUseBlocks_1, toolBlock, _33, _34, result, e_2_1, lastAssistant, usage, cumulativeDeleted, deletedTokens, innerError_1;
                                        return __generator(this, function (_35) {
                                            switch (_35.label) {
                                                case 0:
                                                    attemptWithFallback = false;
                                                    _35.label = 1;
                                                case 1:
                                                    _35.trys.push([1, 30, , 36]);
                                                    streamingFallbackOccured_1 = false;
                                                    (0, queryProfiler_js_1.queryCheckpoint)('query_api_streaming_start');
                                                    _35.label = 2;
                                                case 2:
                                                    _35.trys.push([2, 20, 21, 26]);
                                                    _28 = true, _29 = (e_2 = void 0, __asyncValues(deps.callModel({
                                                        messages: (0, api_js_1.prependUserContext)(messagesForQuery, userContext),
                                                        systemPrompt: fullSystemPrompt,
                                                        thinkingConfig: toolUseContext.options.thinkingConfig,
                                                        tools: toolUseContext.options.tools,
                                                        signal: toolUseContext.abortController.signal,
                                                        options: __assign(__assign(__assign({ getToolPermissionContext: function () {
                                                                return __awaiter(this, void 0, void 0, function () {
                                                                    var appState;
                                                                    return __generator(this, function (_a) {
                                                                        appState = toolUseContext.getAppState();
                                                                        return [2 /*return*/, appState.toolPermissionContext];
                                                                    });
                                                                });
                                                            }, model: currentModel }, (config.gates.fastModeEnabled && {
                                                            fastMode: appState.fastMode,
                                                        })), { toolChoice: undefined, isNonInteractiveSession: toolUseContext.options.isNonInteractiveSession, fallbackModel: fallbackModel, onStreamingFallback: function () {
                                                                streamingFallbackOccured_1 = true;
                                                            }, querySource: querySource, agents: toolUseContext.options.agentDefinitions.activeAgents, allowedAgentTypes: toolUseContext.options.agentDefinitions.allowedAgentTypes, hasAppendSystemPrompt: !!toolUseContext.options.appendSystemPrompt, maxOutputTokensOverride: maxOutputTokensOverride, fetchOverride: dumpPromptsFetch, mcpTools: appState.mcp.tools, hasPendingMcpServers: appState.mcp.clients.some(function (c) { return c.type === 'pending'; }), queryTracking: queryTracking, effortValue: appState.effortValue, advisorModel: appState.advisorModel, skipCacheWrite: skipCacheWrite, agentId: toolUseContext.agentId, addNotification: toolUseContext.addNotification }), (params.taskBudget && {
                                                            taskBudget: __assign({ total: params.taskBudget.total }, (taskBudgetRemaining !== undefined && {
                                                                remaining: taskBudgetRemaining,
                                                            })),
                                                        })),
                                                    })));
                                                    _35.label = 3;
                                                case 3: return [4 /*yield*/, __await(_29.next())];
                                                case 4:
                                                    if (!(_30 = _35.sent(), _a = _30.done, !_a)) return [3 /*break*/, 19];
                                                    _c = _30.value;
                                                    _28 = false;
                                                    message = _c;
                                                    if (!streamingFallbackOccured_1) return [3 /*break*/, 10];
                                                    _31 = 0, assistantMessages_2 = assistantMessages;
                                                    _35.label = 5;
                                                case 5:
                                                    if (!(_31 < assistantMessages_2.length)) return [3 /*break*/, 9];
                                                    msg = assistantMessages_2[_31];
                                                    return [4 /*yield*/, __await({ type: 'tombstone', message: msg })];
                                                case 6: return [4 /*yield*/, _35.sent()];
                                                case 7:
                                                    _35.sent();
                                                    _35.label = 8;
                                                case 8:
                                                    _31++;
                                                    return [3 /*break*/, 5];
                                                case 9:
                                                    (0, index_js_1.logEvent)('tengu_orphaned_messages_tombstoned', {
                                                        orphanedMessageCount: assistantMessages.length,
                                                        queryChainId: queryChainIdForAnalytics,
                                                        queryDepth: queryTracking.depth,
                                                    });
                                                    assistantMessages.length = 0;
                                                    toolResults.length = 0;
                                                    toolUseBlocks.length = 0;
                                                    needsFollowUp = false;
                                                    // Discard pending results from the failed streaming attempt and create
                                                    // a fresh executor. This prevents orphan tool_results (with old tool_use_ids)
                                                    // from being yielded after the fallback response arrives.
                                                    if (streamingToolExecutor) {
                                                        streamingToolExecutor.discard();
                                                        streamingToolExecutor = new StreamingToolExecutor_js_1.StreamingToolExecutor(toolUseContext.options.tools, canUseTool, toolUseContext);
                                                    }
                                                    _35.label = 10;
                                                case 10:
                                                    yieldMessage = message;
                                                    if (message.type === 'assistant') {
                                                        clonedContent = void 0;
                                                        _loop_3 = function (i) {
                                                            var block = message.message.content[i];
                                                            if (block.type === 'tool_use' &&
                                                                typeof block.input === 'object' &&
                                                                block.input !== null) {
                                                                var tool = (0, Tool_js_1.findToolByName)(toolUseContext.options.tools, block.name);
                                                                if (tool === null || tool === void 0 ? void 0 : tool.backfillObservableInput) {
                                                                    var originalInput_1 = block.input;
                                                                    var inputCopy = __assign({}, originalInput_1);
                                                                    tool.backfillObservableInput(inputCopy);
                                                                    // Only yield a clone when backfill ADDED fields; skip if
                                                                    // it only OVERWROTE existing ones (e.g. file tools
                                                                    // expanding file_path). Overwrites change the serialized
                                                                    // transcript and break VCR fixture hashes on resume,
                                                                    // while adding nothing the SDK stream needs — hooks get
                                                                    // the expanded path via toolExecution.ts separately.
                                                                    var addedFields = Object.keys(inputCopy).some(function (k) { return !(k in originalInput_1); });
                                                                    if (addedFields) {
                                                                        clonedContent !== null && clonedContent !== void 0 ? clonedContent : (clonedContent = __spreadArray([], message.message.content, true));
                                                                        clonedContent[i] = __assign(__assign({}, block), { input: inputCopy });
                                                                    }
                                                                }
                                                            }
                                                        };
                                                        for (i = 0; i < message.message.content.length; i++) {
                                                            _loop_3(i);
                                                        }
                                                        if (clonedContent) {
                                                            yieldMessage = __assign(__assign({}, message), { message: __assign(__assign({}, message.message), { content: clonedContent }) });
                                                        }
                                                    }
                                                    withheld = false;
                                                    if ((0, bun_bundle_1.feature)('CONTEXT_COLLAPSE')) {
                                                        if (contextCollapse === null || contextCollapse === void 0 ? void 0 : contextCollapse.isWithheldPromptTooLong(message, errors_js_1.isPromptTooLongMessage, querySource)) {
                                                            withheld = true;
                                                        }
                                                    }
                                                    if (reactiveCompact === null || reactiveCompact === void 0 ? void 0 : reactiveCompact.isWithheldPromptTooLong(message)) {
                                                        withheld = true;
                                                    }
                                                    if (mediaRecoveryEnabled &&
                                                        (reactiveCompact === null || reactiveCompact === void 0 ? void 0 : reactiveCompact.isWithheldMediaSizeError(message))) {
                                                        withheld = true;
                                                    }
                                                    if (isWithheldMaxOutputTokens(message)) {
                                                        withheld = true;
                                                    }
                                                    if (!!withheld) return [3 /*break*/, 13];
                                                    return [4 /*yield*/, __await(yieldMessage)];
                                                case 11: return [4 /*yield*/, _35.sent()];
                                                case 12:
                                                    _35.sent();
                                                    _35.label = 13;
                                                case 13:
                                                    if (message.type === 'assistant') {
                                                        assistantMessages.push(message);
                                                        msgToolUseBlocks = message.message.content.filter(function (content) { return content.type === 'tool_use'; });
                                                        if (msgToolUseBlocks.length > 0) {
                                                            toolUseBlocks.push.apply(toolUseBlocks, msgToolUseBlocks);
                                                            needsFollowUp = true;
                                                        }
                                                        if (streamingToolExecutor &&
                                                            !toolUseContext.abortController.signal.aborted) {
                                                            for (_32 = 0, msgToolUseBlocks_1 = msgToolUseBlocks; _32 < msgToolUseBlocks_1.length; _32++) {
                                                                toolBlock = msgToolUseBlocks_1[_32];
                                                                streamingToolExecutor.addTool(toolBlock, message);
                                                            }
                                                        }
                                                    }
                                                    if (!(streamingToolExecutor &&
                                                        !toolUseContext.abortController.signal.aborted)) return [3 /*break*/, 18];
                                                    _33 = 0, _34 = streamingToolExecutor.getCompletedResults();
                                                    _35.label = 14;
                                                case 14:
                                                    if (!(_33 < _34.length)) return [3 /*break*/, 18];
                                                    result = _34[_33];
                                                    if (!result.message) return [3 /*break*/, 17];
                                                    return [4 /*yield*/, __await(result.message)];
                                                case 15: return [4 /*yield*/, _35.sent()];
                                                case 16:
                                                    _35.sent();
                                                    toolResults.push.apply(toolResults, (0, messages_js_1.normalizeMessagesForAPI)([result.message], toolUseContext.options.tools).filter(function (_) { return _.type === 'user'; }));
                                                    _35.label = 17;
                                                case 17:
                                                    _33++;
                                                    return [3 /*break*/, 14];
                                                case 18:
                                                    _28 = true;
                                                    return [3 /*break*/, 3];
                                                case 19: return [3 /*break*/, 26];
                                                case 20:
                                                    e_2_1 = _35.sent();
                                                    e_2 = { error: e_2_1 };
                                                    return [3 /*break*/, 26];
                                                case 21:
                                                    _35.trys.push([21, , 24, 25]);
                                                    if (!(!_28 && !_a && (_b = _29.return))) return [3 /*break*/, 23];
                                                    return [4 /*yield*/, __await(_b.call(_29))];
                                                case 22:
                                                    _35.sent();
                                                    _35.label = 23;
                                                case 23: return [3 /*break*/, 25];
                                                case 24:
                                                    if (e_2) throw e_2.error;
                                                    return [7 /*endfinally*/];
                                                case 25: return [7 /*endfinally*/];
                                                case 26:
                                                    (0, queryProfiler_js_1.queryCheckpoint)('query_api_streaming_end');
                                                    if (!((0, bun_bundle_1.feature)('CACHED_MICROCOMPACT') && pendingCacheEdits)) return [3 /*break*/, 29];
                                                    lastAssistant = assistantMessages.at(-1);
                                                    usage = lastAssistant === null || lastAssistant === void 0 ? void 0 : lastAssistant.message.usage;
                                                    cumulativeDeleted = usage
                                                        ? ((_x = usage
                                                            .cache_deleted_input_tokens) !== null && _x !== void 0 ? _x : 0)
                                                        : 0;
                                                    deletedTokens = Math.max(0, cumulativeDeleted - pendingCacheEdits.baselineCacheDeletedTokens);
                                                    if (!(deletedTokens > 0)) return [3 /*break*/, 29];
                                                    return [4 /*yield*/, __await((0, messages_js_1.createMicrocompactBoundaryMessage)(pendingCacheEdits.trigger, 0, deletedTokens, pendingCacheEdits.deletedToolIds, []))];
                                                case 27: return [4 /*yield*/, _35.sent()];
                                                case 28:
                                                    _35.sent();
                                                    _35.label = 29;
                                                case 29: return [3 /*break*/, 36];
                                                case 30:
                                                    innerError_1 = _35.sent();
                                                    if (!(innerError_1 instanceof withRetry_js_1.FallbackTriggeredError && fallbackModel)) return [3 /*break*/, 35];
                                                    // Fallback was triggered - switch model and retry
                                                    currentModel = fallbackModel;
                                                    attemptWithFallback = true;
                                                    // Clear assistant messages since we'll retry the entire request
                                                    return [5 /*yield**/, __values(__asyncDelegator(__asyncValues(yieldMissingToolResultBlocks(assistantMessages, 'Model fallback triggered'))))];
                                                case 31: 
                                                // Clear assistant messages since we'll retry the entire request
                                                return [4 /*yield*/, __await.apply(void 0, [_35.sent()])];
                                                case 32:
                                                    // Clear assistant messages since we'll retry the entire request
                                                    _35.sent();
                                                    assistantMessages.length = 0;
                                                    toolResults.length = 0;
                                                    toolUseBlocks.length = 0;
                                                    needsFollowUp = false;
                                                    // Discard pending results from the failed attempt and create a
                                                    // fresh executor. This prevents orphan tool_results (with old
                                                    // tool_use_ids) from leaking into the retry.
                                                    if (streamingToolExecutor) {
                                                        streamingToolExecutor.discard();
                                                        streamingToolExecutor = new StreamingToolExecutor_js_1.StreamingToolExecutor(toolUseContext.options.tools, canUseTool, toolUseContext);
                                                    }
                                                    // Update tool use context with new model
                                                    toolUseContext.options.mainLoopModel = fallbackModel;
                                                    // Thinking signatures are model-bound: replaying a protected-thinking
                                                    // block (e.g. capybara) to an unprotected fallback (e.g. opus) 400s.
                                                    // Strip before retry so the fallback model gets clean history.
                                                    if (process.env.USER_TYPE === 'ant') {
                                                        messagesForQuery = (0, messages_js_1.stripSignatureBlocks)(messagesForQuery);
                                                    }
                                                    // Log the fallback event
                                                    (0, index_js_1.logEvent)('tengu_model_fallback_triggered', {
                                                        original_model: innerError_1.originalModel,
                                                        fallback_model: fallbackModel,
                                                        entrypoint: 'cli',
                                                        queryChainId: queryChainIdForAnalytics,
                                                        queryDepth: queryTracking.depth,
                                                    });
                                                    return [4 /*yield*/, __await((0, messages_js_1.createSystemMessage)("Switched to ".concat((0, model_js_1.renderModelName)(innerError_1.fallbackModel), " due to high demand for ").concat((0, model_js_1.renderModelName)(innerError_1.originalModel)), 'warning'))];
                                                case 33: 
                                                // Yield system message about fallback — use 'warning' level so
                                                // users see the notification without needing verbose mode
                                                return [4 /*yield*/, _35.sent()];
                                                case 34:
                                                    // Yield system message about fallback — use 'warning' level so
                                                    // users see the notification without needing verbose mode
                                                    _35.sent();
                                                    return [2 /*return*/, "continue"];
                                                case 35: throw innerError_1;
                                                case 36: return [2 /*return*/];
                                            }
                                        });
                                    };
                                    _27.label = 24;
                                case 24:
                                    if (!attemptWithFallback) return [3 /*break*/, 26];
                                    return [5 /*yield**/, _loop_2()];
                                case 25:
                                    _27.sent();
                                    return [3 /*break*/, 24];
                                case 26: return [3 /*break*/, 37];
                                case 27:
                                    error_1 = _27.sent();
                                    (0, log_js_1.logError)(error_1);
                                    errorMessage = error_1 instanceof Error ? error_1.message : String(error_1);
                                    (0, index_js_1.logEvent)('tengu_query_error', {
                                        assistantMessages: assistantMessages.length,
                                        toolUses: assistantMessages.flatMap(function (_) {
                                            return _.message.content.filter(function (content) { return content.type === 'tool_use'; });
                                        }).length,
                                        queryChainId: queryChainIdForAnalytics,
                                        queryDepth: queryTracking.depth,
                                    });
                                    if (!(error_1 instanceof imageValidation_js_1.ImageSizeError ||
                                        error_1 instanceof imageResizer_js_1.ImageResizeError)) return [3 /*break*/, 31];
                                    return [4 /*yield*/, __await((0, messages_js_1.createAssistantAPIErrorMessage)({
                                            content: error_1.message,
                                        }))];
                                case 28: return [4 /*yield*/, _27.sent()];
                                case 29:
                                    _27.sent();
                                    _2 = {};
                                    return [4 /*yield*/, __await({ reason: 'image_error' })];
                                case 30: return [2 /*return*/, (_2.value = _27.sent(), _2)];
                                case 31: 
                                // Generally queryModelWithStreaming should not throw errors but instead
                                // yield them as synthetic assistant messages. However if it does throw
                                // due to a bug, we may end up in a state where we have already emitted
                                // a tool_use block but will stop before emitting the tool_result.
                                return [5 /*yield**/, __values(__asyncDelegator(__asyncValues(yieldMissingToolResultBlocks(assistantMessages, errorMessage))))
                                    // Surface the real error instead of a misleading "[Request interrupted
                                    // by user]" — this path is a model/runtime failure, not a user action.
                                    // SDK consumers were seeing phantom interrupts on e.g. Node 18's missing
                                    // Array.prototype.with(), masking the actual cause.
                                ];
                                case 32: 
                                // Generally queryModelWithStreaming should not throw errors but instead
                                // yield them as synthetic assistant messages. However if it does throw
                                // due to a bug, we may end up in a state where we have already emitted
                                // a tool_use block but will stop before emitting the tool_result.
                                return [4 /*yield*/, __await.apply(void 0, [_27.sent()
                                        // Surface the real error instead of a misleading "[Request interrupted
                                        // by user]" — this path is a model/runtime failure, not a user action.
                                        // SDK consumers were seeing phantom interrupts on e.g. Node 18's missing
                                        // Array.prototype.with(), masking the actual cause.
                                    ])];
                                case 33:
                                    // Generally queryModelWithStreaming should not throw errors but instead
                                    // yield them as synthetic assistant messages. However if it does throw
                                    // due to a bug, we may end up in a state where we have already emitted
                                    // a tool_use block but will stop before emitting the tool_result.
                                    _27.sent();
                                    return [4 /*yield*/, __await((0, messages_js_1.createAssistantAPIErrorMessage)({
                                            content: errorMessage,
                                        })
                                        // To help track down bugs, log loudly for ants
                                        )];
                                case 34: 
                                // Surface the real error instead of a misleading "[Request interrupted
                                // by user]" — this path is a model/runtime failure, not a user action.
                                // SDK consumers were seeing phantom interrupts on e.g. Node 18's missing
                                // Array.prototype.with(), masking the actual cause.
                                return [4 /*yield*/, _27.sent()];
                                case 35:
                                    // Surface the real error instead of a misleading "[Request interrupted
                                    // by user]" — this path is a model/runtime failure, not a user action.
                                    // SDK consumers were seeing phantom interrupts on e.g. Node 18's missing
                                    // Array.prototype.with(), masking the actual cause.
                                    _27.sent();
                                    // To help track down bugs, log loudly for ants
                                    (0, debug_js_1.logAntError)('Query error', error_1);
                                    _3 = {};
                                    return [4 /*yield*/, __await({ reason: 'model_error', error: error_1 })];
                                case 36: return [2 /*return*/, (_3.value = _27.sent(), _3)];
                                case 37:
                                    // Execute post-sampling hooks after model response is complete
                                    if (assistantMessages.length > 0) {
                                        void (0, postSamplingHooks_js_1.executePostSamplingHooks)(__spreadArray(__spreadArray([], messagesForQuery, true), assistantMessages, true), systemPrompt, userContext, systemContext, toolUseContext, querySource);
                                    }
                                    if (!toolUseContext.abortController.signal.aborted) return [3 /*break*/, 65];
                                    if (!streamingToolExecutor) return [3 /*break*/, 52];
                                    _27.label = 38;
                                case 38:
                                    _27.trys.push([38, 45, 46, 51]);
                                    _4 = true, _5 = (e_3 = void 0, __asyncValues(streamingToolExecutor.getRemainingResults()));
                                    _27.label = 39;
                                case 39: return [4 /*yield*/, __await(_5.next())];
                                case 40:
                                    if (!(_6 = _27.sent(), _d = _6.done, !_d)) return [3 /*break*/, 44];
                                    _f = _6.value;
                                    _4 = false;
                                    update = _f;
                                    if (!update.message) return [3 /*break*/, 43];
                                    return [4 /*yield*/, __await(update.message)];
                                case 41: return [4 /*yield*/, _27.sent()];
                                case 42:
                                    _27.sent();
                                    _27.label = 43;
                                case 43:
                                    _4 = true;
                                    return [3 /*break*/, 39];
                                case 44: return [3 /*break*/, 51];
                                case 45:
                                    e_3_1 = _27.sent();
                                    e_3 = { error: e_3_1 };
                                    return [3 /*break*/, 51];
                                case 46:
                                    _27.trys.push([46, , 49, 50]);
                                    if (!(!_4 && !_d && (_e = _5.return))) return [3 /*break*/, 48];
                                    return [4 /*yield*/, __await(_e.call(_5))];
                                case 47:
                                    _27.sent();
                                    _27.label = 48;
                                case 48: return [3 /*break*/, 50];
                                case 49:
                                    if (e_3) throw e_3.error;
                                    return [7 /*endfinally*/];
                                case 50: return [7 /*endfinally*/];
                                case 51: return [3 /*break*/, 55];
                                case 52: return [5 /*yield**/, __values(__asyncDelegator(__asyncValues(yieldMissingToolResultBlocks(assistantMessages, 'Interrupted by user'))))];
                                case 53: return [4 /*yield*/, __await.apply(void 0, [_27.sent()])];
                                case 54:
                                    _27.sent();
                                    _27.label = 55;
                                case 55:
                                    if (!((0, bun_bundle_1.feature)('CHICAGO_MCP') && !toolUseContext.agentId)) return [3 /*break*/, 60];
                                    _27.label = 56;
                                case 56:
                                    _27.trys.push([56, 59, , 60]);
                                    return [4 /*yield*/, __await(Promise.resolve().then(function () { return require('./utils/computerUse/cleanup.js'); }))];
                                case 57:
                                    cleanupComputerUseAfterTurn = (_27.sent()).cleanupComputerUseAfterTurn;
                                    return [4 /*yield*/, __await(cleanupComputerUseAfterTurn(toolUseContext))];
                                case 58:
                                    _27.sent();
                                    return [3 /*break*/, 60];
                                case 59:
                                    _7 = _27.sent();
                                    return [3 /*break*/, 60];
                                case 60:
                                    if (!(toolUseContext.abortController.signal.reason !== 'interrupt')) return [3 /*break*/, 63];
                                    return [4 /*yield*/, __await((0, messages_js_1.createUserInterruptionMessage)({
                                            toolUse: false,
                                        }))];
                                case 61: return [4 /*yield*/, _27.sent()];
                                case 62:
                                    _27.sent();
                                    _27.label = 63;
                                case 63:
                                    _8 = {};
                                    return [4 /*yield*/, __await({ reason: 'aborted_streaming' })];
                                case 64: return [2 /*return*/, (_8.value = _27.sent(), _8)];
                                case 65:
                                    if (!pendingToolUseSummary) return [3 /*break*/, 69];
                                    return [4 /*yield*/, __await(pendingToolUseSummary)];
                                case 66:
                                    summary = _27.sent();
                                    if (!summary) return [3 /*break*/, 69];
                                    return [4 /*yield*/, __await(summary)];
                                case 67: return [4 /*yield*/, _27.sent()];
                                case 68:
                                    _27.sent();
                                    _27.label = 69;
                                case 69:
                                    if (!!needsFollowUp) return [3 /*break*/, 95];
                                    lastMessage = assistantMessages.at(-1);
                                    isWithheld413 = (lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.type) === 'assistant' &&
                                        lastMessage.isApiErrorMessage &&
                                        (0, errors_js_1.isPromptTooLongMessage)(lastMessage);
                                    isWithheldMedia = mediaRecoveryEnabled &&
                                        (reactiveCompact === null || reactiveCompact === void 0 ? void 0 : reactiveCompact.isWithheldMediaSizeError(lastMessage));
                                    if (isWithheld413) {
                                        // First: drain all staged context-collapses. Gated on the PREVIOUS
                                        // transition not being collapse_drain_retry — if we already drained
                                        // and the retry still 413'd, fall through to reactive compact.
                                        if ((0, bun_bundle_1.feature)('CONTEXT_COLLAPSE') &&
                                            contextCollapse &&
                                            ((_y = state.transition) === null || _y === void 0 ? void 0 : _y.reason) !== 'collapse_drain_retry') {
                                            drained = contextCollapse.recoverFromOverflow(messagesForQuery, querySource);
                                            if (drained.committed > 0) {
                                                next_1 = {
                                                    messages: drained.messages,
                                                    toolUseContext: toolUseContext,
                                                    autoCompactTracking: tracking,
                                                    maxOutputTokensRecoveryCount: maxOutputTokensRecoveryCount,
                                                    hasAttemptedReactiveCompact: hasAttemptedReactiveCompact,
                                                    maxOutputTokensOverride: undefined,
                                                    pendingToolUseSummary: undefined,
                                                    stopHookActive: undefined,
                                                    turnCount: turnCount,
                                                    transition: {
                                                        reason: 'collapse_drain_retry',
                                                        committed: drained.committed,
                                                    },
                                                };
                                                state = next_1;
                                                return [2 /*return*/, "continue"];
                                            }
                                        }
                                    }
                                    if (!((isWithheld413 || isWithheldMedia) && reactiveCompact)) return [3 /*break*/, 80];
                                    return [4 /*yield*/, __await(reactiveCompact.tryReactiveCompact({
                                            hasAttempted: hasAttemptedReactiveCompact,
                                            querySource: querySource,
                                            aborted: toolUseContext.abortController.signal.aborted,
                                            messages: messagesForQuery,
                                            cacheSafeParams: {
                                                systemPrompt: systemPrompt,
                                                userContext: userContext,
                                                systemContext: systemContext,
                                                toolUseContext: toolUseContext,
                                                forkContextMessages: messagesForQuery,
                                            },
                                        }))];
                                case 70:
                                    compacted = _27.sent();
                                    if (!compacted) return [3 /*break*/, 76];
                                    // task_budget: same carryover as the proactive path above.
                                    // messagesForQuery still holds the pre-compact array here (the
                                    // 413-failed attempt's input).
                                    if (params.taskBudget) {
                                        preCompactContext = (0, tokens_js_1.finalContextTokensFromLastResponse)(messagesForQuery);
                                        taskBudgetRemaining = Math.max(0, (taskBudgetRemaining !== null && taskBudgetRemaining !== void 0 ? taskBudgetRemaining : params.taskBudget.total) -
                                            preCompactContext);
                                    }
                                    postCompactMessages = (0, compact_js_1.buildPostCompactMessages)(compacted);
                                    _9 = 0, postCompactMessages_2 = postCompactMessages;
                                    _27.label = 71;
                                case 71:
                                    if (!(_9 < postCompactMessages_2.length)) return [3 /*break*/, 75];
                                    msg = postCompactMessages_2[_9];
                                    return [4 /*yield*/, __await(msg)];
                                case 72: return [4 /*yield*/, _27.sent()];
                                case 73:
                                    _27.sent();
                                    _27.label = 74;
                                case 74:
                                    _9++;
                                    return [3 /*break*/, 71];
                                case 75:
                                    next_2 = {
                                        messages: postCompactMessages,
                                        toolUseContext: toolUseContext,
                                        autoCompactTracking: undefined,
                                        maxOutputTokensRecoveryCount: maxOutputTokensRecoveryCount,
                                        hasAttemptedReactiveCompact: true,
                                        maxOutputTokensOverride: undefined,
                                        pendingToolUseSummary: undefined,
                                        stopHookActive: undefined,
                                        turnCount: turnCount,
                                        transition: { reason: 'reactive_compact_retry' },
                                    };
                                    state = next_2;
                                    return [2 /*return*/, "continue"];
                                case 76: return [4 /*yield*/, __await(lastMessage)];
                                case 77: 
                                // No recovery — surface the withheld error and exit. Do NOT fall
                                // through to stop hooks: the model never produced a valid response,
                                // so hooks have nothing meaningful to evaluate. Running stop hooks
                                // on prompt-too-long creates a death spiral: error → hook blocking
                                // → retry → error → … (the hook injects more tokens each cycle).
                                return [4 /*yield*/, _27.sent()];
                                case 78:
                                    // No recovery — surface the withheld error and exit. Do NOT fall
                                    // through to stop hooks: the model never produced a valid response,
                                    // so hooks have nothing meaningful to evaluate. Running stop hooks
                                    // on prompt-too-long creates a death spiral: error → hook blocking
                                    // → retry → error → … (the hook injects more tokens each cycle).
                                    _27.sent();
                                    void (0, hooks_js_1.executeStopFailureHooks)(lastMessage, toolUseContext);
                                    _10 = {};
                                    return [4 /*yield*/, __await({ reason: isWithheldMedia ? 'image_error' : 'prompt_too_long' })];
                                case 79: return [2 /*return*/, (_10.value = _27.sent(), _10)];
                                case 80:
                                    if (!((0, bun_bundle_1.feature)('CONTEXT_COLLAPSE') && isWithheld413)) return [3 /*break*/, 84];
                                    return [4 /*yield*/, __await(lastMessage)];
                                case 81: 
                                // reactiveCompact compiled out but contextCollapse withheld and
                                // couldn't recover (staged queue empty/stale). Surface. Same
                                // early-return rationale — don't fall through to stop hooks.
                                return [4 /*yield*/, _27.sent()];
                                case 82:
                                    // reactiveCompact compiled out but contextCollapse withheld and
                                    // couldn't recover (staged queue empty/stale). Surface. Same
                                    // early-return rationale — don't fall through to stop hooks.
                                    _27.sent();
                                    void (0, hooks_js_1.executeStopFailureHooks)(lastMessage, toolUseContext);
                                    _11 = {};
                                    return [4 /*yield*/, __await({ reason: 'prompt_too_long' })];
                                case 83: return [2 /*return*/, (_11.value = _27.sent(), _11)];
                                case 84:
                                    if (!isWithheldMaxOutputTokens(lastMessage)) return [3 /*break*/, 87];
                                    capEnabled = (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_otk_slot_v1', false);
                                    if (capEnabled &&
                                        maxOutputTokensOverride === undefined &&
                                        !process.env.CLAUDE_CODE_MAX_OUTPUT_TOKENS) {
                                        (0, index_js_1.logEvent)('tengu_max_tokens_escalate', {
                                            escalatedTo: context_js_1.ESCALATED_MAX_TOKENS,
                                        });
                                        next_3 = {
                                            messages: messagesForQuery,
                                            toolUseContext: toolUseContext,
                                            autoCompactTracking: tracking,
                                            maxOutputTokensRecoveryCount: maxOutputTokensRecoveryCount,
                                            hasAttemptedReactiveCompact: hasAttemptedReactiveCompact,
                                            maxOutputTokensOverride: context_js_1.ESCALATED_MAX_TOKENS,
                                            pendingToolUseSummary: undefined,
                                            stopHookActive: undefined,
                                            turnCount: turnCount,
                                            transition: { reason: 'max_output_tokens_escalate' },
                                        };
                                        state = next_3;
                                        return [2 /*return*/, "continue"];
                                    }
                                    if (maxOutputTokensRecoveryCount < MAX_OUTPUT_TOKENS_RECOVERY_LIMIT) {
                                        recoveryMessage = (0, messages_js_1.createUserMessage)({
                                            content: "Output token limit hit. Resume directly \u2014 no apology, no recap of what you were doing. " +
                                                "Pick up mid-thought if that is where the cut happened. Break remaining work into smaller pieces.",
                                            isMeta: true,
                                        });
                                        next_4 = {
                                            messages: __spreadArray(__spreadArray(__spreadArray([], messagesForQuery, true), assistantMessages, true), [
                                                recoveryMessage,
                                            ], false),
                                            toolUseContext: toolUseContext,
                                            autoCompactTracking: tracking,
                                            maxOutputTokensRecoveryCount: maxOutputTokensRecoveryCount + 1,
                                            hasAttemptedReactiveCompact: hasAttemptedReactiveCompact,
                                            maxOutputTokensOverride: undefined,
                                            pendingToolUseSummary: undefined,
                                            stopHookActive: undefined,
                                            turnCount: turnCount,
                                            transition: {
                                                reason: 'max_output_tokens_recovery',
                                                attempt: maxOutputTokensRecoveryCount + 1,
                                            },
                                        };
                                        state = next_4;
                                        return [2 /*return*/, "continue"];
                                    }
                                    return [4 /*yield*/, __await(lastMessage)];
                                case 85: 
                                // Recovery exhausted — surface the withheld error now.
                                return [4 /*yield*/, _27.sent()];
                                case 86:
                                    // Recovery exhausted — surface the withheld error now.
                                    _27.sent();
                                    _27.label = 87;
                                case 87:
                                    if (!(lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.isApiErrorMessage)) return [3 /*break*/, 89];
                                    void (0, hooks_js_1.executeStopFailureHooks)(lastMessage, toolUseContext);
                                    _12 = {};
                                    return [4 /*yield*/, __await({ reason: 'completed' })];
                                case 88: return [2 /*return*/, (_12.value = _27.sent(), _12)];
                                case 89: return [5 /*yield**/, __values(__asyncDelegator(__asyncValues((0, stopHooks_js_1.handleStopHooks)(messagesForQuery, assistantMessages, systemPrompt, userContext, systemContext, toolUseContext, querySource, stopHookActive))))];
                                case 90: return [4 /*yield*/, __await.apply(void 0, [_27.sent()])];
                                case 91:
                                    stopHookResult = _27.sent();
                                    if (!stopHookResult.preventContinuation) return [3 /*break*/, 93];
                                    _13 = {};
                                    return [4 /*yield*/, __await({ reason: 'stop_hook_prevented' })];
                                case 92: return [2 /*return*/, (_13.value = _27.sent(), _13)];
                                case 93:
                                    if (stopHookResult.blockingErrors.length > 0) {
                                        next_5 = {
                                            messages: __spreadArray(__spreadArray(__spreadArray([], messagesForQuery, true), assistantMessages, true), stopHookResult.blockingErrors, true),
                                            toolUseContext: toolUseContext,
                                            autoCompactTracking: tracking,
                                            maxOutputTokensRecoveryCount: 0,
                                            // Preserve the reactive compact guard — if compact already ran and
                                            // couldn't recover from prompt-too-long, retrying after a stop-hook
                                            // blocking error will produce the same result. Resetting to false
                                            // here caused an infinite loop: compact → still too long → error →
                                            // stop hook blocking → compact → … burning thousands of API calls.
                                            hasAttemptedReactiveCompact: hasAttemptedReactiveCompact,
                                            maxOutputTokensOverride: undefined,
                                            pendingToolUseSummary: undefined,
                                            stopHookActive: true,
                                            turnCount: turnCount,
                                            transition: { reason: 'stop_hook_blocking' },
                                        };
                                        state = next_5;
                                        return [2 /*return*/, "continue"];
                                    }
                                    if ((0, bun_bundle_1.feature)('TOKEN_BUDGET')) {
                                        decision = (0, tokenBudget_js_1.checkTokenBudget)(budgetTracker, toolUseContext.agentId, (0, state_js_1.getCurrentTurnTokenBudget)(), (0, state_js_1.getTurnOutputTokens)());
                                        if (decision.action === 'continue') {
                                            (0, state_js_1.incrementBudgetContinuationCount)();
                                            (0, debug_js_1.logForDebugging)("Token budget continuation #".concat(decision.continuationCount, ": ").concat(decision.pct, "% (").concat(decision.turnTokens.toLocaleString(), " / ").concat(decision.budget.toLocaleString(), ")"));
                                            state = {
                                                messages: __spreadArray(__spreadArray(__spreadArray([], messagesForQuery, true), assistantMessages, true), [
                                                    (0, messages_js_1.createUserMessage)({
                                                        content: decision.nudgeMessage,
                                                        isMeta: true,
                                                    }),
                                                ], false),
                                                toolUseContext: toolUseContext,
                                                autoCompactTracking: tracking,
                                                maxOutputTokensRecoveryCount: 0,
                                                hasAttemptedReactiveCompact: false,
                                                maxOutputTokensOverride: undefined,
                                                pendingToolUseSummary: undefined,
                                                stopHookActive: undefined,
                                                turnCount: turnCount,
                                                transition: { reason: 'token_budget_continuation' },
                                            };
                                            return [2 /*return*/, "continue"];
                                        }
                                        if (decision.completionEvent) {
                                            if (decision.completionEvent.diminishingReturns) {
                                                (0, debug_js_1.logForDebugging)("Token budget early stop: diminishing returns at ".concat(decision.completionEvent.pct, "%"));
                                            }
                                            (0, index_js_1.logEvent)('tengu_token_budget_completed', __assign(__assign({}, decision.completionEvent), { queryChainId: queryChainIdForAnalytics, queryDepth: queryTracking.depth }));
                                        }
                                    }
                                    _14 = {};
                                    return [4 /*yield*/, __await({ reason: 'completed' })];
                                case 94: return [2 /*return*/, (_14.value = _27.sent(), _14)];
                                case 95:
                                    shouldPreventContinuation = false;
                                    updatedToolUseContext = toolUseContext;
                                    (0, queryProfiler_js_1.queryCheckpoint)('query_tool_execution_start');
                                    if (streamingToolExecutor) {
                                        (0, index_js_1.logEvent)('tengu_streaming_tool_execution_used', {
                                            tool_count: toolUseBlocks.length,
                                            queryChainId: queryChainIdForAnalytics,
                                            queryDepth: queryTracking.depth,
                                        });
                                    }
                                    else {
                                        (0, index_js_1.logEvent)('tengu_streaming_tool_execution_not_used', {
                                            tool_count: toolUseBlocks.length,
                                            queryChainId: queryChainIdForAnalytics,
                                            queryDepth: queryTracking.depth,
                                        });
                                    }
                                    toolUpdates = streamingToolExecutor
                                        ? streamingToolExecutor.getRemainingResults()
                                        : (0, toolOrchestration_js_1.runTools)(toolUseBlocks, assistantMessages, canUseTool, toolUseContext);
                                    _27.label = 96;
                                case 96:
                                    _27.trys.push([96, 104, 105, 110]);
                                    _15 = true, toolUpdates_1 = (e_4 = void 0, __asyncValues(toolUpdates));
                                    _27.label = 97;
                                case 97: return [4 /*yield*/, __await(toolUpdates_1.next())];
                                case 98:
                                    if (!(toolUpdates_1_1 = _27.sent(), _g = toolUpdates_1_1.done, !_g)) return [3 /*break*/, 103];
                                    _j = toolUpdates_1_1.value;
                                    _15 = false;
                                    update = _j;
                                    if (!update.message) return [3 /*break*/, 101];
                                    return [4 /*yield*/, __await(update.message)];
                                case 99: return [4 /*yield*/, _27.sent()];
                                case 100:
                                    _27.sent();
                                    if (update.message.type === 'attachment' &&
                                        update.message.attachment.type === 'hook_stopped_continuation') {
                                        shouldPreventContinuation = true;
                                    }
                                    toolResults.push.apply(toolResults, (0, messages_js_1.normalizeMessagesForAPI)([update.message], toolUseContext.options.tools).filter(function (_) { return _.type === 'user'; }));
                                    _27.label = 101;
                                case 101:
                                    if (update.newContext) {
                                        updatedToolUseContext = __assign(__assign({}, update.newContext), { queryTracking: queryTracking });
                                    }
                                    _27.label = 102;
                                case 102:
                                    _15 = true;
                                    return [3 /*break*/, 97];
                                case 103: return [3 /*break*/, 110];
                                case 104:
                                    e_4_1 = _27.sent();
                                    e_4 = { error: e_4_1 };
                                    return [3 /*break*/, 110];
                                case 105:
                                    _27.trys.push([105, , 108, 109]);
                                    if (!(!_15 && !_g && (_h = toolUpdates_1.return))) return [3 /*break*/, 107];
                                    return [4 /*yield*/, __await(_h.call(toolUpdates_1))];
                                case 106:
                                    _27.sent();
                                    _27.label = 107;
                                case 107: return [3 /*break*/, 109];
                                case 108:
                                    if (e_4) throw e_4.error;
                                    return [7 /*endfinally*/];
                                case 109: return [7 /*endfinally*/];
                                case 110:
                                    (0, queryProfiler_js_1.queryCheckpoint)('query_tool_execution_end');
                                    nextPendingToolUseSummary = void 0;
                                    if (config.gates.emitToolUseSummaries &&
                                        toolUseBlocks.length > 0 &&
                                        !toolUseContext.abortController.signal.aborted &&
                                        !toolUseContext.agentId // subagents don't surface in mobile UI — skip the Haiku call
                                    ) {
                                        lastAssistantMessage = assistantMessages.at(-1);
                                        lastAssistantText = void 0;
                                        if (lastAssistantMessage) {
                                            textBlocks = lastAssistantMessage.message.content.filter(function (block) { return block.type === 'text'; });
                                            if (textBlocks.length > 0) {
                                                lastTextBlock = textBlocks.at(-1);
                                                if (lastTextBlock && 'text' in lastTextBlock) {
                                                    lastAssistantText = lastTextBlock.text;
                                                }
                                            }
                                        }
                                        toolUseIds_1 = toolUseBlocks.map(function (block) { return block.id; });
                                        toolInfoForSummary = toolUseBlocks.map(function (block) {
                                            // Find the corresponding tool result
                                            var toolResult = toolResults.find(function (result) {
                                                return result.type === 'user' &&
                                                    Array.isArray(result.message.content) &&
                                                    result.message.content.some(function (content) {
                                                        return content.type === 'tool_result' &&
                                                            content.tool_use_id === block.id;
                                                    });
                                            });
                                            var resultContent = (toolResult === null || toolResult === void 0 ? void 0 : toolResult.type) === 'user' &&
                                                Array.isArray(toolResult.message.content)
                                                ? toolResult.message.content.find(function (c) {
                                                    return c.type === 'tool_result' && c.tool_use_id === block.id;
                                                })
                                                : undefined;
                                            return {
                                                name: block.name,
                                                input: block.input,
                                                output: resultContent && 'content' in resultContent
                                                    ? resultContent.content
                                                    : null,
                                            };
                                        });
                                        // Fire off summary generation without blocking the next API call
                                        nextPendingToolUseSummary = (0, toolUseSummaryGenerator_js_1.generateToolUseSummary)({
                                            tools: toolInfoForSummary,
                                            signal: toolUseContext.abortController.signal,
                                            isNonInteractiveSession: toolUseContext.options.isNonInteractiveSession,
                                            lastAssistantText: lastAssistantText,
                                        })
                                            .then(function (summary) {
                                            if (summary) {
                                                return (0, messages_js_1.createToolUseSummaryMessage)(summary, toolUseIds_1);
                                            }
                                            return null;
                                        })
                                            .catch(function () { return null; });
                                    }
                                    if (!toolUseContext.abortController.signal.aborted) return [3 /*break*/, 123];
                                    if (!((0, bun_bundle_1.feature)('CHICAGO_MCP') && !toolUseContext.agentId)) return [3 /*break*/, 115];
                                    _27.label = 111;
                                case 111:
                                    _27.trys.push([111, 114, , 115]);
                                    return [4 /*yield*/, __await(Promise.resolve().then(function () { return require('./utils/computerUse/cleanup.js'); }))];
                                case 112:
                                    cleanupComputerUseAfterTurn = (_27.sent()).cleanupComputerUseAfterTurn;
                                    return [4 /*yield*/, __await(cleanupComputerUseAfterTurn(toolUseContext))];
                                case 113:
                                    _27.sent();
                                    return [3 /*break*/, 115];
                                case 114:
                                    _16 = _27.sent();
                                    return [3 /*break*/, 115];
                                case 115:
                                    if (!(toolUseContext.abortController.signal.reason !== 'interrupt')) return [3 /*break*/, 118];
                                    return [4 /*yield*/, __await((0, messages_js_1.createUserInterruptionMessage)({
                                            toolUse: true,
                                        }))];
                                case 116: return [4 /*yield*/, _27.sent()];
                                case 117:
                                    _27.sent();
                                    _27.label = 118;
                                case 118:
                                    nextTurnCountOnAbort = turnCount + 1;
                                    if (!(maxTurns && nextTurnCountOnAbort > maxTurns)) return [3 /*break*/, 121];
                                    return [4 /*yield*/, __await((0, attachments_js_1.createAttachmentMessage)({
                                            type: 'max_turns_reached',
                                            maxTurns: maxTurns,
                                            turnCount: nextTurnCountOnAbort,
                                        }))];
                                case 119: return [4 /*yield*/, _27.sent()];
                                case 120:
                                    _27.sent();
                                    _27.label = 121;
                                case 121:
                                    _17 = {};
                                    return [4 /*yield*/, __await({ reason: 'aborted_tools' })];
                                case 122: return [2 /*return*/, (_17.value = _27.sent(), _17)];
                                case 123:
                                    if (!shouldPreventContinuation) return [3 /*break*/, 125];
                                    _18 = {};
                                    return [4 /*yield*/, __await({ reason: 'hook_stopped' })];
                                case 124: return [2 /*return*/, (_18.value = _27.sent(), _18)];
                                case 125:
                                    if (tracking === null || tracking === void 0 ? void 0 : tracking.compacted) {
                                        tracking.turnCounter++;
                                        (0, index_js_1.logEvent)('tengu_post_autocompact_turn', {
                                            turnId: tracking.turnId,
                                            turnCounter: tracking.turnCounter,
                                            queryChainId: queryChainIdForAnalytics,
                                            queryDepth: queryTracking.depth,
                                        });
                                    }
                                    // Be careful to do this after tool calls are done, because the API
                                    // will error if we interleave tool_result messages with regular user messages.
                                    // Instrumentation: Track message count before attachments
                                    (0, index_js_1.logEvent)('tengu_query_before_attachments', {
                                        messagesForQueryCount: messagesForQuery.length,
                                        assistantMessagesCount: assistantMessages.length,
                                        toolResultsCount: toolResults.length,
                                        queryChainId: queryChainIdForAnalytics,
                                        queryDepth: queryTracking.depth,
                                    });
                                    sleepRan = toolUseBlocks.some(function (b) { return b.name === prompt_js_1.SLEEP_TOOL_NAME; });
                                    isMainThread = querySource.startsWith('repl_main_thread') || querySource === 'sdk';
                                    currentAgentId = toolUseContext.agentId;
                                    queuedCommandsSnapshot = (0, messageQueueManager_js_1.getCommandsByMaxPriority)(sleepRan ? 'later' : 'next').filter(function (cmd) {
                                        if ((0, messageQueueManager_js_1.isSlashCommand)(cmd))
                                            return false;
                                        if (isMainThread)
                                            return cmd.agentId === undefined;
                                        // Subagents only drain task-notifications addressed to them — never
                                        // user prompts, even if someone stamps an agentId on one.
                                        return cmd.mode === 'task-notification' && cmd.agentId === currentAgentId;
                                    });
                                    _27.label = 126;
                                case 126:
                                    _27.trys.push([126, 133, 134, 139]);
                                    _19 = true, _20 = (e_5 = void 0, __asyncValues((0, attachments_js_1.getAttachmentMessages)(null, updatedToolUseContext, null, queuedCommandsSnapshot, __spreadArray(__spreadArray(__spreadArray([], messagesForQuery, true), assistantMessages, true), toolResults, true), querySource)));
                                    _27.label = 127;
                                case 127: return [4 /*yield*/, __await(_20.next())];
                                case 128:
                                    if (!(_21 = _27.sent(), _k = _21.done, !_k)) return [3 /*break*/, 132];
                                    _m = _21.value;
                                    _19 = false;
                                    attachment = _m;
                                    return [4 /*yield*/, __await(attachment)];
                                case 129: return [4 /*yield*/, _27.sent()];
                                case 130:
                                    _27.sent();
                                    toolResults.push(attachment);
                                    _27.label = 131;
                                case 131:
                                    _19 = true;
                                    return [3 /*break*/, 127];
                                case 132: return [3 /*break*/, 139];
                                case 133:
                                    e_5_1 = _27.sent();
                                    e_5 = { error: e_5_1 };
                                    return [3 /*break*/, 139];
                                case 134:
                                    _27.trys.push([134, , 137, 138]);
                                    if (!(!_19 && !_k && (_l = _20.return))) return [3 /*break*/, 136];
                                    return [4 /*yield*/, __await(_l.call(_20))];
                                case 135:
                                    _27.sent();
                                    _27.label = 136;
                                case 136: return [3 /*break*/, 138];
                                case 137:
                                    if (e_5) throw e_5.error;
                                    return [7 /*endfinally*/];
                                case 138: return [7 /*endfinally*/];
                                case 139:
                                    if (!(pendingMemoryPrefetch &&
                                        pendingMemoryPrefetch.settledAt !== null &&
                                        pendingMemoryPrefetch.consumedOnIteration === -1)) return [3 /*break*/, 146];
                                    _22 = attachments_js_1.filterDuplicateMemoryAttachments;
                                    return [4 /*yield*/, __await(pendingMemoryPrefetch.promise)];
                                case 140:
                                    memoryAttachments = _22.apply(void 0, [_27.sent(), toolUseContext.readFileState]);
                                    _23 = 0, memoryAttachments_1 = memoryAttachments;
                                    _27.label = 141;
                                case 141:
                                    if (!(_23 < memoryAttachments_1.length)) return [3 /*break*/, 145];
                                    memAttachment = memoryAttachments_1[_23];
                                    msg = (0, attachments_js_1.createAttachmentMessage)(memAttachment);
                                    return [4 /*yield*/, __await(msg)];
                                case 142: return [4 /*yield*/, _27.sent()];
                                case 143:
                                    _27.sent();
                                    toolResults.push(msg);
                                    _27.label = 144;
                                case 144:
                                    _23++;
                                    return [3 /*break*/, 141];
                                case 145:
                                    pendingMemoryPrefetch.consumedOnIteration = turnCount - 1;
                                    _27.label = 146;
                                case 146:
                                    if (!(skillPrefetch && pendingSkillPrefetch)) return [3 /*break*/, 152];
                                    return [4 /*yield*/, __await(skillPrefetch.collectSkillDiscoveryPrefetch(pendingSkillPrefetch))];
                                case 147:
                                    skillAttachments = _27.sent();
                                    _24 = 0, skillAttachments_1 = skillAttachments;
                                    _27.label = 148;
                                case 148:
                                    if (!(_24 < skillAttachments_1.length)) return [3 /*break*/, 152];
                                    att = skillAttachments_1[_24];
                                    msg = (0, attachments_js_1.createAttachmentMessage)(att);
                                    return [4 /*yield*/, __await(msg)];
                                case 149: return [4 /*yield*/, _27.sent()];
                                case 150:
                                    _27.sent();
                                    toolResults.push(msg);
                                    _27.label = 151;
                                case 151:
                                    _24++;
                                    return [3 /*break*/, 148];
                                case 152:
                                    consumedCommands = queuedCommandsSnapshot.filter(function (cmd) { return cmd.mode === 'prompt' || cmd.mode === 'task-notification'; });
                                    if (consumedCommands.length > 0) {
                                        for (_25 = 0, consumedCommands_1 = consumedCommands; _25 < consumedCommands_1.length; _25++) {
                                            cmd = consumedCommands_1[_25];
                                            if (cmd.uuid) {
                                                consumedCommandUuids.push(cmd.uuid);
                                                (0, commandLifecycle_js_1.notifyCommandLifecycle)(cmd.uuid, 'started');
                                            }
                                        }
                                        (0, messageQueueManager_js_1.remove)(consumedCommands);
                                    }
                                    fileChangeAttachmentCount = (0, array_js_1.count)(toolResults, function (tr) {
                                        return tr.type === 'attachment' && tr.attachment.type === 'edited_text_file';
                                    });
                                    (0, index_js_1.logEvent)('tengu_query_after_attachments', {
                                        totalToolResultsCount: toolResults.length,
                                        fileChangeAttachmentCount: fileChangeAttachmentCount,
                                        queryChainId: queryChainIdForAnalytics,
                                        queryDepth: queryTracking.depth,
                                    });
                                    // Refresh tools between turns so newly-connected MCP servers become available
                                    if (updatedToolUseContext.options.refreshTools) {
                                        refreshedTools = updatedToolUseContext.options.refreshTools();
                                        if (refreshedTools !== updatedToolUseContext.options.tools) {
                                            updatedToolUseContext = __assign(__assign({}, updatedToolUseContext), { options: __assign(__assign({}, updatedToolUseContext.options), { tools: refreshedTools }) });
                                        }
                                    }
                                    toolUseContextWithQueryTracking = __assign(__assign({}, updatedToolUseContext), { queryTracking: queryTracking });
                                    nextTurnCount = turnCount + 1;
                                    // Periodic task summary for `claude ps` — fires mid-turn so a
                                    // long-running agent still refreshes what it's working on. Gated
                                    // only on !agentId so every top-level conversation (REPL, SDK, HFI,
                                    // remote) generates summaries; subagents/forks don't.
                                    if ((0, bun_bundle_1.feature)('BG_SESSIONS')) {
                                        if (!toolUseContext.agentId &&
                                            taskSummaryModule.shouldGenerateTaskSummary()) {
                                            taskSummaryModule.maybeGenerateTaskSummary({
                                                systemPrompt: systemPrompt,
                                                userContext: userContext,
                                                systemContext: systemContext,
                                                toolUseContext: toolUseContext,
                                                forkContextMessages: __spreadArray(__spreadArray(__spreadArray([], messagesForQuery, true), assistantMessages, true), toolResults, true),
                                            });
                                        }
                                    }
                                    if (!(maxTurns && nextTurnCount > maxTurns)) return [3 /*break*/, 156];
                                    return [4 /*yield*/, __await((0, attachments_js_1.createAttachmentMessage)({
                                            type: 'max_turns_reached',
                                            maxTurns: maxTurns,
                                            turnCount: nextTurnCount,
                                        }))];
                                case 153: return [4 /*yield*/, _27.sent()];
                                case 154:
                                    _27.sent();
                                    _26 = {};
                                    return [4 /*yield*/, __await({ reason: 'max_turns', turnCount: nextTurnCount })];
                                case 155: return [2 /*return*/, (_26.value = _27.sent(), _26)];
                                case 156:
                                    (0, queryProfiler_js_1.queryCheckpoint)('query_recursive_call');
                                    next = {
                                        messages: __spreadArray(__spreadArray(__spreadArray([], messagesForQuery, true), assistantMessages, true), toolResults, true),
                                        toolUseContext: toolUseContextWithQueryTracking,
                                        autoCompactTracking: tracking,
                                        turnCount: nextTurnCount,
                                        maxOutputTokensRecoveryCount: 0,
                                        hasAttemptedReactiveCompact: false,
                                        pendingToolUseSummary: nextPendingToolUseSummary,
                                        maxOutputTokensOverride: undefined,
                                        stopHookActive: stopHookActive,
                                        transition: { reason: 'next_turn' },
                                    };
                                    state = next;
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _z.label = 2;
                case 2:
                    if (!true) return [3 /*break*/, 4];
                    return [5 /*yield**/, _loop_1()];
                case 3:
                    state_1 = _z.sent();
                    if (typeof state_1 === "object")
                        return [2 /*return*/, state_1.value];
                    return [3 /*break*/, 2];
                case 4: return [3 /*break*/, 7];
                case 5:
                    e_1 = _z.sent();
                    env_1.error = e_1;
                    env_1.hasError = true;
                    return [3 /*break*/, 7];
                case 6:
                    __disposeResources(env_1);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    });
}
