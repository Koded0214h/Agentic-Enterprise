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
exports.execAgentHook = execAgentHook;
var crypto_1 = require("crypto");
var query_js_1 = require("../../query.js");
var index_js_1 = require("../../services/analytics/index.js");
var Tool_js_1 = require("../../Tool.js");
var SyntheticOutputTool_js_1 = require("../../tools/SyntheticOutputTool/SyntheticOutputTool.js");
var tools_js_1 = require("../../tools.js");
var ids_js_1 = require("../../types/ids.js");
var abortController_js_1 = require("../abortController.js");
var attachments_js_1 = require("../attachments.js");
var combinedAbortSignal_js_1 = require("../combinedAbortSignal.js");
var debug_js_1 = require("../debug.js");
var errors_js_1 = require("../errors.js");
var messages_js_1 = require("../messages.js");
var model_js_1 = require("../model/model.js");
var permissions_js_1 = require("../permissions/permissions.js");
var sessionStorage_js_1 = require("../sessionStorage.js");
var slowOperations_js_1 = require("../slowOperations.js");
var systemPromptType_js_1 = require("../systemPromptType.js");
var hookHelpers_js_1 = require("./hookHelpers.js");
var sessionHooks_js_1 = require("./sessionHooks.js");
/**
 * Execute an agent-based hook using a multi-turn LLM query
 */
function execAgentHook(hook, hookName, hookEvent, jsonInput, signal, toolUseContext, toolUseID, 
// Kept for signature stability with the other exec*Hook functions.
// Was used by hook.prompt(messages) before the .transform() was removed
// (CC-79) — the only consumer of that was ExitPlanModeV2Tool's
// programmatic construction, since refactored into VerifyPlanExecutionTool.
_messages, agentName) {
    return __awaiter(this, void 0, void 0, function () {
        var effectiveToolUseID, transcriptPath, hookStartTime, processedPrompt, userMessage, agentMessages, hookTimeoutMs, hookAbortController_1, _a, parentTimeoutSignal, cleanupCombinedSignal, onParentTimeout, combinedSignal, structuredOutputTool, filteredTools, tools, systemPrompt, model, MAX_AGENT_TURNS, hookAgentId, agentToolUseContext, structuredOutputResult, turnCount, hitMaxTurns, _b, _c, _d, message, parsed, e_1_1, error_1, error_2, errorMsg;
        var _e, e_1, _f, _g;
        var _h, _j;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0:
                    effectiveToolUseID = toolUseID || "hook-".concat((0, crypto_1.randomUUID)());
                    transcriptPath = toolUseContext.agentId
                        ? (0, sessionStorage_js_1.getAgentTranscriptPath)(toolUseContext.agentId)
                        : (0, sessionStorage_js_1.getTranscriptPath)();
                    hookStartTime = Date.now();
                    _k.label = 1;
                case 1:
                    _k.trys.push([1, 17, , 18]);
                    processedPrompt = (0, hookHelpers_js_1.addArgumentsToPrompt)(hook.prompt, jsonInput);
                    (0, debug_js_1.logForDebugging)("Hooks: Processing agent hook with prompt: ".concat(processedPrompt));
                    userMessage = (0, messages_js_1.createUserMessage)({ content: processedPrompt });
                    agentMessages = [userMessage];
                    (0, debug_js_1.logForDebugging)("Hooks: Starting agent query with ".concat(agentMessages.length, " messages"));
                    hookTimeoutMs = hook.timeout ? hook.timeout * 1000 : 60000;
                    hookAbortController_1 = (0, abortController_js_1.createAbortController)();
                    _a = (0, combinedAbortSignal_js_1.createCombinedAbortSignal)(signal, { timeoutMs: hookTimeoutMs }), parentTimeoutSignal = _a.signal, cleanupCombinedSignal = _a.cleanup;
                    onParentTimeout = function () { return hookAbortController_1.abort(); };
                    parentTimeoutSignal.addEventListener('abort', onParentTimeout);
                    combinedSignal = hookAbortController_1.signal;
                    _k.label = 2;
                case 2:
                    _k.trys.push([2, 15, , 16]);
                    structuredOutputTool = (0, hookHelpers_js_1.createStructuredOutputTool)();
                    filteredTools = toolUseContext.options.tools.filter(function (tool) { return !(0, Tool_js_1.toolMatchesName)(tool, SyntheticOutputTool_js_1.SYNTHETIC_OUTPUT_TOOL_NAME); });
                    tools = __spreadArray(__spreadArray([], filteredTools.filter(function (tool) { return !tools_js_1.ALL_AGENT_DISALLOWED_TOOLS.has(tool.name); }), true), [
                        structuredOutputTool,
                    ], false);
                    systemPrompt = (0, systemPromptType_js_1.asSystemPrompt)([
                        "You are verifying a stop condition in Claude Code. Your task is to verify that the agent completed the given plan. The conversation transcript is available at: ".concat(transcriptPath, "\nYou can read this file to analyze the conversation history if needed.\n\nUse the available tools to inspect the codebase and verify the condition.\nUse as few steps as possible - be efficient and direct.\n\nWhen done, return your result using the ").concat(SyntheticOutputTool_js_1.SYNTHETIC_OUTPUT_TOOL_NAME, " tool with:\n- ok: true if the condition is met\n- ok: false with reason if the condition is not met"),
                    ]);
                    model = (_h = hook.model) !== null && _h !== void 0 ? _h : (0, model_js_1.getSmallFastModel)();
                    MAX_AGENT_TURNS = 50;
                    hookAgentId = (0, ids_js_1.asAgentId)("hook-agent-".concat((0, crypto_1.randomUUID)()));
                    agentToolUseContext = __assign(__assign({}, toolUseContext), { agentId: hookAgentId, abortController: hookAbortController_1, options: __assign(__assign({}, toolUseContext.options), { tools: tools, mainLoopModel: model, isNonInteractiveSession: true, thinkingConfig: { type: 'disabled' } }), setInProgressToolUseIDs: function () { }, getAppState: function () {
                            var _a;
                            var appState = toolUseContext.getAppState();
                            // Add session rule to allow reading transcript file
                            var existingSessionRules = (_a = appState.toolPermissionContext.alwaysAllowRules.session) !== null && _a !== void 0 ? _a : [];
                            return __assign(__assign({}, appState), { toolPermissionContext: __assign(__assign({}, appState.toolPermissionContext), { mode: 'dontAsk', alwaysAllowRules: __assign(__assign({}, appState.toolPermissionContext.alwaysAllowRules), { session: __spreadArray(__spreadArray([], existingSessionRules, true), ["Read(/".concat(transcriptPath, ")")], false) }) }) });
                        } });
                    // Register a session-level stop hook to enforce structured output
                    (0, hookHelpers_js_1.registerStructuredOutputEnforcement)(toolUseContext.setAppState, hookAgentId);
                    structuredOutputResult = null;
                    turnCount = 0;
                    hitMaxTurns = false;
                    _k.label = 3;
                case 3:
                    _k.trys.push([3, 8, 9, 14]);
                    _b = true, _c = __asyncValues((0, query_js_1.query)({
                        messages: agentMessages,
                        systemPrompt: systemPrompt,
                        userContext: {},
                        systemContext: {},
                        canUseTool: permissions_js_1.hasPermissionsToUseTool,
                        toolUseContext: agentToolUseContext,
                        querySource: 'hook_agent',
                    }));
                    _k.label = 4;
                case 4: return [4 /*yield*/, _c.next()];
                case 5:
                    if (!(_d = _k.sent(), _e = _d.done, !_e)) return [3 /*break*/, 7];
                    _g = _d.value;
                    _b = false;
                    message = _g;
                    // Process stream events to update response length in the spinner
                    (0, messages_js_1.handleMessageFromStream)(message, function () { }, // onMessage - we handle messages below
                    function (// onMessage - we handle messages below
                    newContent) {
                        return toolUseContext.setResponseLength(function (length) { return length + newContent.length; });
                    }, (_j = toolUseContext.setStreamMode) !== null && _j !== void 0 ? _j : (function () { }), function () { });
                    // Skip streaming events for further processing
                    if (message.type === 'stream_event' ||
                        message.type === 'stream_request_start') {
                        return [3 /*break*/, 6];
                    }
                    // Count assistant turns
                    if (message.type === 'assistant') {
                        turnCount++;
                        // Check if we've hit the turn limit
                        if (turnCount >= MAX_AGENT_TURNS) {
                            hitMaxTurns = true;
                            (0, debug_js_1.logForDebugging)("Hooks: Agent turn ".concat(turnCount, " hit max turns, aborting"));
                            hookAbortController_1.abort();
                            return [3 /*break*/, 7];
                        }
                    }
                    // Check for structured output in attachments
                    if (message.type === 'attachment' &&
                        message.attachment.type === 'structured_output') {
                        parsed = (0, hookHelpers_js_1.hookResponseSchema)().safeParse(message.attachment.data);
                        if (parsed.success) {
                            structuredOutputResult = parsed.data;
                            (0, debug_js_1.logForDebugging)("Hooks: Got structured output: ".concat((0, slowOperations_js_1.jsonStringify)(structuredOutputResult)));
                            // Got structured output, abort and exit
                            hookAbortController_1.abort();
                            return [3 /*break*/, 7];
                        }
                    }
                    _k.label = 6;
                case 6:
                    _b = true;
                    return [3 /*break*/, 4];
                case 7: return [3 /*break*/, 14];
                case 8:
                    e_1_1 = _k.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 14];
                case 9:
                    _k.trys.push([9, , 12, 13]);
                    if (!(!_b && !_e && (_f = _c.return))) return [3 /*break*/, 11];
                    return [4 /*yield*/, _f.call(_c)];
                case 10:
                    _k.sent();
                    _k.label = 11;
                case 11: return [3 /*break*/, 13];
                case 12:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 13: return [7 /*endfinally*/];
                case 14:
                    parentTimeoutSignal.removeEventListener('abort', onParentTimeout);
                    cleanupCombinedSignal();
                    // Clean up the session hook we registered for this agent
                    (0, sessionHooks_js_1.clearSessionHooks)(toolUseContext.setAppState, hookAgentId);
                    // Check if we got a result
                    if (!structuredOutputResult) {
                        // If we hit max turns, just log and return cancelled (no UI message)
                        if (hitMaxTurns) {
                            (0, debug_js_1.logForDebugging)("Hooks: Agent hook did not complete within ".concat(MAX_AGENT_TURNS, " turns"));
                            (0, index_js_1.logEvent)('tengu_agent_stop_hook_max_turns', {
                                durationMs: Date.now() - hookStartTime,
                                turnCount: turnCount,
                                agentName: agentName,
                            });
                            return [2 /*return*/, {
                                    hook: hook,
                                    outcome: 'cancelled',
                                }];
                        }
                        // For other cases (e.g., agent finished without calling structured output tool),
                        // just log and return cancelled (don't show error to user)
                        (0, debug_js_1.logForDebugging)("Hooks: Agent hook did not return structured output");
                        (0, index_js_1.logEvent)('tengu_agent_stop_hook_error', {
                            durationMs: Date.now() - hookStartTime,
                            turnCount: turnCount,
                            errorType: 1, // 1 = no structured output
                            agentName: agentName,
                        });
                        return [2 /*return*/, {
                                hook: hook,
                                outcome: 'cancelled',
                            }];
                    }
                    // Return result based on structured output
                    if (!structuredOutputResult.ok) {
                        (0, debug_js_1.logForDebugging)("Hooks: Agent hook condition was not met: ".concat(structuredOutputResult.reason));
                        return [2 /*return*/, {
                                hook: hook,
                                outcome: 'blocking',
                                blockingError: {
                                    blockingError: "Agent hook condition was not met: ".concat(structuredOutputResult.reason),
                                    command: hook.prompt,
                                },
                            }];
                    }
                    // Condition was met
                    (0, debug_js_1.logForDebugging)("Hooks: Agent hook condition was met");
                    (0, index_js_1.logEvent)('tengu_agent_stop_hook_success', {
                        durationMs: Date.now() - hookStartTime,
                        turnCount: turnCount,
                        agentName: agentName,
                    });
                    return [2 /*return*/, {
                            hook: hook,
                            outcome: 'success',
                            message: (0, attachments_js_1.createAttachmentMessage)({
                                type: 'hook_success',
                                hookName: hookName,
                                toolUseID: effectiveToolUseID,
                                hookEvent: hookEvent,
                                content: '',
                            }),
                        }];
                case 15:
                    error_1 = _k.sent();
                    parentTimeoutSignal.removeEventListener('abort', onParentTimeout);
                    cleanupCombinedSignal();
                    if (combinedSignal.aborted) {
                        return [2 /*return*/, {
                                hook: hook,
                                outcome: 'cancelled',
                            }];
                    }
                    throw error_1;
                case 16: return [3 /*break*/, 18];
                case 17:
                    error_2 = _k.sent();
                    errorMsg = (0, errors_js_1.errorMessage)(error_2);
                    (0, debug_js_1.logForDebugging)("Hooks: Agent hook error: ".concat(errorMsg));
                    (0, index_js_1.logEvent)('tengu_agent_stop_hook_error', {
                        durationMs: Date.now() - hookStartTime,
                        errorType: 2, // 2 = general error
                        agentName: agentName,
                    });
                    return [2 /*return*/, {
                            hook: hook,
                            outcome: 'non_blocking_error',
                            message: (0, attachments_js_1.createAttachmentMessage)({
                                type: 'hook_non_blocking_error',
                                hookName: hookName,
                                toolUseID: effectiveToolUseID,
                                hookEvent: hookEvent,
                                stderr: "Error executing agent hook: ".concat(errorMsg),
                                stdout: '',
                                exitCode: 1,
                            }),
                        }];
                case 18: return [2 /*return*/];
            }
        });
    });
}
