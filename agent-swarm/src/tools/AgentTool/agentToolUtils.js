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
exports.agentToolResultSchema = void 0;
exports.filterToolsForAgent = filterToolsForAgent;
exports.resolveAgentTools = resolveAgentTools;
exports.countToolUses = countToolUses;
exports.finalizeAgentTool = finalizeAgentTool;
exports.getLastToolUseName = getLastToolUseName;
exports.emitTaskProgress = emitTaskProgress;
exports.classifyHandoffIfNeeded = classifyHandoffIfNeeded;
exports.extractPartialResult = extractPartialResult;
exports.runAsyncAgentLifecycle = runAsyncAgentLifecycle;
var bun_bundle_1 = require("bun:bundle");
var v4_1 = require("zod/v4");
var state_js_1 = require("../../bootstrap/state.js");
var tools_js_1 = require("../../constants/tools.js");
var agentSummary_js_1 = require("../../services/AgentSummary/agentSummary.js");
var index_js_1 = require("../../services/analytics/index.js");
var dumpPrompts_js_1 = require("../../services/api/dumpPrompts.js");
var Tool_js_1 = require("../../Tool.js");
var LocalAgentTask_js_1 = require("../../tasks/LocalAgentTask/LocalAgentTask.js");
var ids_js_1 = require("../../types/ids.js");
var agentSwarmsEnabled_js_1 = require("../../utils/agentSwarmsEnabled.js");
var debug_js_1 = require("../../utils/debug.js");
var envUtils_js_1 = require("../../utils/envUtils.js");
var errors_js_1 = require("../../utils/errors.js");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
var messages_js_1 = require("../../utils/messages.js");
var permissionRuleParser_js_1 = require("../../utils/permissions/permissionRuleParser.js");
var yoloClassifier_js_1 = require("../../utils/permissions/yoloClassifier.js");
var sdkProgress_js_1 = require("../../utils/task/sdkProgress.js");
var teammateContext_js_1 = require("../../utils/teammateContext.js");
var tokens_js_1 = require("../../utils/tokens.js");
var constants_js_1 = require("../ExitPlanModeTool/constants.js");
var constants_js_2 = require("./constants.js");
function filterToolsForAgent(_a) {
    var tools = _a.tools, isBuiltIn = _a.isBuiltIn, _b = _a.isAsync, isAsync = _b === void 0 ? false : _b, permissionMode = _a.permissionMode;
    return tools.filter(function (tool) {
        // Allow MCP tools for all agents
        if (tool.name.startsWith('mcp__')) {
            return true;
        }
        // Allow ExitPlanMode for agents in plan mode (e.g., in-process teammates)
        // This bypasses both the ALL_AGENT_DISALLOWED_TOOLS and async tool filters
        if ((0, Tool_js_1.toolMatchesName)(tool, constants_js_1.EXIT_PLAN_MODE_V2_TOOL_NAME) &&
            permissionMode === 'plan') {
            return true;
        }
        if (tools_js_1.ALL_AGENT_DISALLOWED_TOOLS.has(tool.name)) {
            return false;
        }
        if (!isBuiltIn && tools_js_1.CUSTOM_AGENT_DISALLOWED_TOOLS.has(tool.name)) {
            return false;
        }
        if (isAsync && !tools_js_1.ASYNC_AGENT_ALLOWED_TOOLS.has(tool.name)) {
            if ((0, agentSwarmsEnabled_js_1.isAgentSwarmsEnabled)() && (0, teammateContext_js_1.isInProcessTeammate)()) {
                // Allow AgentTool for in-process teammates to spawn sync subagents.
                // Validation in AgentTool.call() prevents background agents and teammate spawning.
                if ((0, Tool_js_1.toolMatchesName)(tool, constants_js_2.AGENT_TOOL_NAME)) {
                    return true;
                }
                // Allow task tools for in-process teammates to coordinate via shared task list
                if (tools_js_1.IN_PROCESS_TEAMMATE_ALLOWED_TOOLS.has(tool.name)) {
                    return true;
                }
            }
            return false;
        }
        return true;
    });
}
/**
 * Resolves and validates agent tools against available tools
 * Handles wildcard expansion and validation in one place
 */
function resolveAgentTools(agentDefinition, availableTools, isAsync, isMainThread) {
    var _a;
    if (isAsync === void 0) { isAsync = false; }
    if (isMainThread === void 0) { isMainThread = false; }
    var agentTools = agentDefinition.tools, disallowedTools = agentDefinition.disallowedTools, source = agentDefinition.source, permissionMode = agentDefinition.permissionMode;
    // When isMainThread is true, skip filterToolsForAgent entirely — the main
    // thread's tool pool is already properly assembled by useMergedTools(), so
    // the sub-agent disallow lists shouldn't apply.
    var filteredAvailableTools = isMainThread
        ? availableTools
        : filterToolsForAgent({
            tools: availableTools,
            isBuiltIn: source === 'built-in',
            isAsync: isAsync,
            permissionMode: permissionMode,
        });
    // Create a set of disallowed tool names for quick lookup
    var disallowedToolSet = new Set((_a = disallowedTools === null || disallowedTools === void 0 ? void 0 : disallowedTools.map(function (toolSpec) {
        var toolName = (0, permissionRuleParser_js_1.permissionRuleValueFromString)(toolSpec).toolName;
        return toolName;
    })) !== null && _a !== void 0 ? _a : []);
    // Filter available tools based on disallowed list
    var allowedAvailableTools = filteredAvailableTools.filter(function (tool) { return !disallowedToolSet.has(tool.name); });
    // If tools is undefined or ['*'], allow all tools (after filtering disallowed)
    var hasWildcard = agentTools === undefined ||
        (agentTools.length === 1 && agentTools[0] === '*');
    if (hasWildcard) {
        return {
            hasWildcard: true,
            validTools: [],
            invalidTools: [],
            resolvedTools: allowedAvailableTools,
        };
    }
    var availableToolMap = new Map();
    for (var _i = 0, allowedAvailableTools_1 = allowedAvailableTools; _i < allowedAvailableTools_1.length; _i++) {
        var tool = allowedAvailableTools_1[_i];
        availableToolMap.set(tool.name, tool);
    }
    var validTools = [];
    var invalidTools = [];
    var resolved = [];
    var resolvedToolsSet = new Set();
    var allowedAgentTypes;
    for (var _b = 0, agentTools_1 = agentTools; _b < agentTools_1.length; _b++) {
        var toolSpec = agentTools_1[_b];
        // Parse the tool spec to extract the base tool name and any permission pattern
        var _c = (0, permissionRuleParser_js_1.permissionRuleValueFromString)(toolSpec), toolName = _c.toolName, ruleContent = _c.ruleContent;
        // Special case: Agent tool carries allowedAgentTypes metadata in its spec
        if (toolName === constants_js_2.AGENT_TOOL_NAME) {
            if (ruleContent) {
                // Parse comma-separated agent types: "worker, researcher" → ["worker", "researcher"]
                allowedAgentTypes = ruleContent.split(',').map(function (s) { return s.trim(); });
            }
            // For sub-agents, Agent is excluded by filterToolsForAgent — mark the spec
            // valid for allowedAgentTypes tracking but skip tool resolution.
            if (!isMainThread) {
                validTools.push(toolSpec);
                continue;
            }
            // For main thread, filtering was skipped so Agent is in availableToolMap —
            // fall through to normal resolution below.
        }
        var tool = availableToolMap.get(toolName);
        if (tool) {
            validTools.push(toolSpec);
            if (!resolvedToolsSet.has(tool)) {
                resolved.push(tool);
                resolvedToolsSet.add(tool);
            }
        }
        else {
            invalidTools.push(toolSpec);
        }
    }
    return {
        hasWildcard: false,
        validTools: validTools,
        invalidTools: invalidTools,
        resolvedTools: resolved,
        allowedAgentTypes: allowedAgentTypes,
    };
}
exports.agentToolResultSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        agentId: v4_1.z.string(),
        // Optional: older persisted sessions won't have this (resume replays
        // results verbatim without re-validation). Used to gate the sync
        // result trailer — one-shot built-ins skip the SendMessage hint.
        agentType: v4_1.z.string().optional(),
        content: v4_1.z.array(v4_1.z.object({ type: v4_1.z.literal('text'), text: v4_1.z.string() })),
        totalToolUseCount: v4_1.z.number(),
        totalDurationMs: v4_1.z.number(),
        totalTokens: v4_1.z.number(),
        usage: v4_1.z.object({
            input_tokens: v4_1.z.number(),
            output_tokens: v4_1.z.number(),
            cache_creation_input_tokens: v4_1.z.number().nullable(),
            cache_read_input_tokens: v4_1.z.number().nullable(),
            server_tool_use: v4_1.z
                .object({
                web_search_requests: v4_1.z.number(),
                web_fetch_requests: v4_1.z.number(),
            })
                .nullable(),
            service_tier: v4_1.z.enum(['standard', 'priority', 'batch']).nullable(),
            cache_creation: v4_1.z
                .object({
                ephemeral_1h_input_tokens: v4_1.z.number(),
                ephemeral_5m_input_tokens: v4_1.z.number(),
            })
                .nullable(),
        }),
    });
});
function countToolUses(messages) {
    var count = 0;
    for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
        var m = messages_1[_i];
        if (m.type === 'assistant') {
            for (var _a = 0, _b = m.message.content; _a < _b.length; _a++) {
                var block = _b[_a];
                if (block.type === 'tool_use') {
                    count++;
                }
            }
        }
    }
    return count;
}
function finalizeAgentTool(agentMessages, agentId, metadata) {
    var prompt = metadata.prompt, resolvedAgentModel = metadata.resolvedAgentModel, isBuiltInAgent = metadata.isBuiltInAgent, startTime = metadata.startTime, agentType = metadata.agentType, isAsync = metadata.isAsync;
    var lastAssistantMessage = (0, messages_js_1.getLastAssistantMessage)(agentMessages);
    if (lastAssistantMessage === undefined) {
        throw new Error('No assistant messages found');
    }
    // Extract text content from the agent's response. If the final assistant
    // message is a pure tool_use block (loop exited mid-turn), fall back to
    // the most recent assistant message that has text content.
    var content = lastAssistantMessage.message.content.filter(function (_) { return _.type === 'text'; });
    if (content.length === 0) {
        for (var i = agentMessages.length - 1; i >= 0; i--) {
            var m = agentMessages[i];
            if (m.type !== 'assistant')
                continue;
            var textBlocks = m.message.content.filter(function (_) { return _.type === 'text'; });
            if (textBlocks.length > 0) {
                content = textBlocks;
                break;
            }
        }
    }
    var totalTokens = (0, tokens_js_1.getTokenCountFromUsage)(lastAssistantMessage.message.usage);
    var totalToolUseCount = countToolUses(agentMessages);
    (0, index_js_1.logEvent)('tengu_agent_tool_completed', {
        agent_type: agentType,
        model: resolvedAgentModel,
        prompt_char_count: prompt.length,
        response_char_count: content.length,
        assistant_message_count: agentMessages.length,
        total_tool_uses: totalToolUseCount,
        duration_ms: Date.now() - startTime,
        total_tokens: totalTokens,
        is_built_in_agent: isBuiltInAgent,
        is_async: isAsync,
    });
    // Signal to inference that this subagent's cache chain can be evicted.
    var lastRequestId = lastAssistantMessage.requestId;
    if (lastRequestId) {
        (0, index_js_1.logEvent)('tengu_cache_eviction_hint', {
            scope: 'subagent_end',
            last_request_id: lastRequestId,
        });
    }
    return {
        agentId: agentId,
        agentType: agentType,
        content: content,
        totalDurationMs: Date.now() - startTime,
        totalTokens: totalTokens,
        totalToolUseCount: totalToolUseCount,
        usage: lastAssistantMessage.message.usage,
    };
}
/**
 * Returns the name of the last tool_use block in an assistant message,
 * or undefined if the message is not an assistant message with tool_use.
 */
function getLastToolUseName(message) {
    if (message.type !== 'assistant')
        return undefined;
    var block = message.message.content.findLast(function (b) { return b.type === 'tool_use'; });
    return (block === null || block === void 0 ? void 0 : block.type) === 'tool_use' ? block.name : undefined;
}
function emitTaskProgress(tracker, taskId, toolUseId, description, startTime, lastToolName) {
    var _a, _b;
    var progress = (0, LocalAgentTask_js_1.getProgressUpdate)(tracker);
    (0, sdkProgress_js_1.emitTaskProgress)({
        taskId: taskId,
        toolUseId: toolUseId,
        description: (_b = (_a = progress.lastActivity) === null || _a === void 0 ? void 0 : _a.activityDescription) !== null && _b !== void 0 ? _b : description,
        startTime: startTime,
        totalTokens: progress.tokenCount,
        toolUses: progress.toolUseCount,
        lastToolName: lastToolName,
    });
}
function classifyHandoffIfNeeded(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var agentTranscript, classifierResult, handoffDecision;
        var _c;
        var agentMessages = _b.agentMessages, tools = _b.tools, toolPermissionContext = _b.toolPermissionContext, abortSignal = _b.abortSignal, subagentType = _b.subagentType, totalToolUseCount = _b.totalToolUseCount;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!(0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER')) return [3 /*break*/, 2];
                    if (toolPermissionContext.mode !== 'auto')
                        return [2 /*return*/, null];
                    agentTranscript = (0, yoloClassifier_js_1.buildTranscriptForClassifier)(agentMessages, tools);
                    if (!agentTranscript)
                        return [2 /*return*/, null];
                    return [4 /*yield*/, (0, yoloClassifier_js_1.classifyYoloAction)(agentMessages, {
                            role: 'user',
                            content: [
                                {
                                    type: 'text',
                                    text: "Sub-agent has finished and is handing back control to the main agent. Review the sub-agent's work based on the block rules and let the main agent know if any file is dangerous (the main agent will see the reason).",
                                },
                            ],
                        }, tools, toolPermissionContext, abortSignal)];
                case 1:
                    classifierResult = _d.sent();
                    handoffDecision = classifierResult.unavailable
                        ? 'unavailable'
                        : classifierResult.shouldBlock
                            ? 'blocked'
                            : 'allowed';
                    (0, index_js_1.logEvent)('tengu_auto_mode_decision', {
                        decision: handoffDecision,
                        toolName: 
                        // Use legacy name for analytics continuity across the Task→Agent rename
                        constants_js_2.LEGACY_AGENT_TOOL_NAME,
                        inProtectedNamespace: (0, envUtils_js_1.isInProtectedNamespace)(),
                        classifierModel: classifierResult.model,
                        agentType: subagentType,
                        toolUseCount: totalToolUseCount,
                        isHandoff: true,
                        // For handoff, the relevant agent completion is the subagent's final
                        // assistant message — the last thing the classifier transcript shows
                        // before the handoff review prompt.
                        agentMsgId: (_c = (0, messages_js_1.getLastAssistantMessage)(agentMessages)) === null || _c === void 0 ? void 0 : _c.message.id,
                        classifierStage: classifierResult.stage,
                        classifierStage1RequestId: classifierResult.stage1RequestId,
                        classifierStage1MsgId: classifierResult.stage1MsgId,
                        classifierStage2RequestId: classifierResult.stage2RequestId,
                        classifierStage2MsgId: classifierResult.stage2MsgId,
                    });
                    if (classifierResult.shouldBlock) {
                        // When classifier is unavailable, still propagate the sub-agent's
                        // results but with a warning so the parent agent can verify the work.
                        if (classifierResult.unavailable) {
                            (0, debug_js_1.logForDebugging)('Handoff classifier unavailable, allowing sub-agent output with warning', { level: 'warn' });
                            return [2 /*return*/, "Note: The safety classifier was unavailable when reviewing this sub-agent's work. Please carefully verify the sub-agent's actions and output before acting on them."];
                        }
                        (0, debug_js_1.logForDebugging)("Handoff classifier flagged sub-agent output: ".concat(classifierResult.reason), { level: 'warn' });
                        return [2 /*return*/, "SECURITY WARNING: This sub-agent performed actions that may violate security policy. Reason: ".concat(classifierResult.reason, ". Review the sub-agent's actions carefully before acting on its output.")];
                    }
                    _d.label = 2;
                case 2: return [2 /*return*/, null];
            }
        });
    });
}
/**
 * Extract a partial result string from an agent's accumulated messages.
 * Used when an async agent is killed to preserve what it accomplished.
 * Returns undefined if no text content is found.
 */
function extractPartialResult(messages) {
    for (var i = messages.length - 1; i >= 0; i--) {
        var m = messages[i];
        if (m.type !== 'assistant')
            continue;
        var text = (0, messages_js_1.extractTextContent)(m.message.content, '\n');
        if (text) {
            return text;
        }
    }
    return undefined;
}
/**
 * Drives a background agent from spawn to terminal notification.
 * Shared between AgentTool's async-from-start path and resumeAgentBackground.
 */
function runAsyncAgentLifecycle(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var stopSummarization, agentMessages, tracker, resolveActivity, onCacheSafeParams, _loop_1, _c, _d, _e, e_1_1, agentResult, finalMessage, handoffWarning, worktreeResult, error_1, worktreeResult_1, partialResult, msg, worktreeResult;
        var _f, e_1, _g, _h;
        var taskId = _b.taskId, abortController = _b.abortController, makeStream = _b.makeStream, metadata = _b.metadata, description = _b.description, toolUseContext = _b.toolUseContext, rootSetAppState = _b.rootSetAppState, agentIdForCleanup = _b.agentIdForCleanup, enableSummarization = _b.enableSummarization, getWorktreeResult = _b.getWorktreeResult;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    agentMessages = [];
                    _j.label = 1;
                case 1:
                    _j.trys.push([1, 17, 21, 22]);
                    tracker = (0, LocalAgentTask_js_1.createProgressTracker)();
                    resolveActivity = (0, LocalAgentTask_js_1.createActivityDescriptionResolver)(toolUseContext.options.tools);
                    onCacheSafeParams = enableSummarization
                        ? function (params) {
                            var stop = (0, agentSummary_js_1.startAgentSummarization)(taskId, (0, ids_js_1.asAgentId)(taskId), params, rootSetAppState).stop;
                            stopSummarization = stop;
                        }
                        : undefined;
                    _j.label = 2;
                case 2:
                    _j.trys.push([2, 7, 8, 13]);
                    _loop_1 = function () {
                        _h = _e.value;
                        _c = false;
                        var message = _h;
                        agentMessages.push(message);
                        // Append immediately when UI holds the task (retain). Bootstrap reads
                        // disk in parallel and UUID-merges the prefix — disk-write-before-yield
                        // means live is always a suffix of disk, so merge is order-correct.
                        rootSetAppState(function (prev) {
                            var _a;
                            var _b;
                            var t = prev.tasks[taskId];
                            if (!(0, LocalAgentTask_js_1.isLocalAgentTask)(t) || !t.retain)
                                return prev;
                            var base = (_b = t.messages) !== null && _b !== void 0 ? _b : [];
                            return __assign(__assign({}, prev), { tasks: __assign(__assign({}, prev.tasks), (_a = {}, _a[taskId] = __assign(__assign({}, t), { messages: __spreadArray(__spreadArray([], base, true), [message], false) }), _a)) });
                        });
                        (0, LocalAgentTask_js_1.updateProgressFromMessage)(tracker, message, resolveActivity, toolUseContext.options.tools);
                        (0, LocalAgentTask_js_1.updateAgentProgress)(taskId, (0, LocalAgentTask_js_1.getProgressUpdate)(tracker), rootSetAppState);
                        var lastToolName = getLastToolUseName(message);
                        if (lastToolName) {
                            emitTaskProgress(tracker, taskId, toolUseContext.toolUseId, description, metadata.startTime, lastToolName);
                        }
                    };
                    _c = true, _d = __asyncValues(makeStream(onCacheSafeParams));
                    _j.label = 3;
                case 3: return [4 /*yield*/, _d.next()];
                case 4:
                    if (!(_e = _j.sent(), _f = _e.done, !_f)) return [3 /*break*/, 6];
                    _loop_1();
                    _j.label = 5;
                case 5:
                    _c = true;
                    return [3 /*break*/, 3];
                case 6: return [3 /*break*/, 13];
                case 7:
                    e_1_1 = _j.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 13];
                case 8:
                    _j.trys.push([8, , 11, 12]);
                    if (!(!_c && !_f && (_g = _d.return))) return [3 /*break*/, 10];
                    return [4 /*yield*/, _g.call(_d)];
                case 9:
                    _j.sent();
                    _j.label = 10;
                case 10: return [3 /*break*/, 12];
                case 11:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 12: return [7 /*endfinally*/];
                case 13:
                    stopSummarization === null || stopSummarization === void 0 ? void 0 : stopSummarization();
                    agentResult = finalizeAgentTool(agentMessages, taskId, metadata);
                    // Mark task completed FIRST so TaskOutput(block=true) unblocks
                    // immediately. classifyHandoffIfNeeded (API call) and getWorktreeResult
                    // (git exec) are notification embellishments that can hang — they must
                    // not gate the status transition (gh-20236).
                    (0, LocalAgentTask_js_1.completeAgentTask)(agentResult, rootSetAppState);
                    finalMessage = (0, messages_js_1.extractTextContent)(agentResult.content, '\n');
                    if (!(0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER')) return [3 /*break*/, 15];
                    return [4 /*yield*/, classifyHandoffIfNeeded({
                            agentMessages: agentMessages,
                            tools: toolUseContext.options.tools,
                            toolPermissionContext: toolUseContext.getAppState().toolPermissionContext,
                            abortSignal: abortController.signal,
                            subagentType: metadata.agentType,
                            totalToolUseCount: agentResult.totalToolUseCount,
                        })];
                case 14:
                    handoffWarning = _j.sent();
                    if (handoffWarning) {
                        finalMessage = "".concat(handoffWarning, "\n\n").concat(finalMessage);
                    }
                    _j.label = 15;
                case 15: return [4 /*yield*/, getWorktreeResult()];
                case 16:
                    worktreeResult = _j.sent();
                    (0, LocalAgentTask_js_1.enqueueAgentNotification)(__assign({ taskId: taskId, description: description, status: 'completed', setAppState: rootSetAppState, finalMessage: finalMessage, usage: {
                            totalTokens: (0, LocalAgentTask_js_1.getTokenCountFromTracker)(tracker),
                            toolUses: agentResult.totalToolUseCount,
                            durationMs: agentResult.totalDurationMs,
                        }, toolUseId: toolUseContext.toolUseId }, worktreeResult));
                    return [3 /*break*/, 22];
                case 17:
                    error_1 = _j.sent();
                    stopSummarization === null || stopSummarization === void 0 ? void 0 : stopSummarization();
                    if (!(error_1 instanceof errors_js_1.AbortError)) return [3 /*break*/, 19];
                    // killAsyncAgent is a no-op if TaskStop already set status='killed' —
                    // but only this catch handler has agentMessages, so the notification
                    // must fire unconditionally. Transition status BEFORE worktree cleanup
                    // so TaskOutput unblocks even if git hangs (gh-20236).
                    (0, LocalAgentTask_js_1.killAsyncAgent)(taskId, rootSetAppState);
                    (0, index_js_1.logEvent)('tengu_agent_tool_terminated', {
                        agent_type: metadata.agentType,
                        model: metadata.resolvedAgentModel,
                        duration_ms: Date.now() - metadata.startTime,
                        is_async: true,
                        is_built_in_agent: metadata.isBuiltInAgent,
                        reason: 'user_kill_async',
                    });
                    return [4 /*yield*/, getWorktreeResult()];
                case 18:
                    worktreeResult_1 = _j.sent();
                    partialResult = extractPartialResult(agentMessages);
                    (0, LocalAgentTask_js_1.enqueueAgentNotification)(__assign({ taskId: taskId, description: description, status: 'killed', setAppState: rootSetAppState, toolUseId: toolUseContext.toolUseId, finalMessage: partialResult }, worktreeResult_1));
                    return [2 /*return*/];
                case 19:
                    msg = (0, errors_js_1.errorMessage)(error_1);
                    (0, LocalAgentTask_js_1.failAgentTask)(taskId, msg, rootSetAppState);
                    return [4 /*yield*/, getWorktreeResult()];
                case 20:
                    worktreeResult = _j.sent();
                    (0, LocalAgentTask_js_1.enqueueAgentNotification)(__assign({ taskId: taskId, description: description, status: 'failed', error: msg, setAppState: rootSetAppState, toolUseId: toolUseContext.toolUseId }, worktreeResult));
                    return [3 /*break*/, 22];
                case 21:
                    (0, state_js_1.clearInvokedSkillsForAgent)(agentIdForCleanup);
                    (0, dumpPrompts_js_1.clearDumpState)(agentIdForCleanup);
                    return [7 /*endfinally*/];
                case 22: return [2 /*return*/];
            }
        });
    });
}
