"use strict";
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
exports.execPromptHook = execPromptHook;
var crypto_1 = require("crypto");
var claude_js_1 = require("../../services/api/claude.js");
var attachments_js_1 = require("../attachments.js");
var combinedAbortSignal_js_1 = require("../combinedAbortSignal.js");
var debug_js_1 = require("../debug.js");
var errors_js_1 = require("../errors.js");
var json_js_1 = require("../json.js");
var messages_js_1 = require("../messages.js");
var model_js_1 = require("../model/model.js");
var systemPromptType_js_1 = require("../systemPromptType.js");
var hookHelpers_js_1 = require("./hookHelpers.js");
/**
 * Execute a prompt-based hook using an LLM
 */
function execPromptHook(hook, hookName, hookEvent, jsonInput, signal, toolUseContext, messages, toolUseID) {
    return __awaiter(this, void 0, void 0, function () {
        var effectiveToolUseID, processedPrompt, userMessage, messagesToQuery, hookTimeoutMs, _a, combinedSignal, cleanupSignal, response, content_1, fullResponse, json, parsed, error_1, error_2, errorMsg;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    effectiveToolUseID = toolUseID || "hook-".concat((0, crypto_1.randomUUID)());
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 6, , 7]);
                    processedPrompt = (0, hookHelpers_js_1.addArgumentsToPrompt)(hook.prompt, jsonInput);
                    (0, debug_js_1.logForDebugging)("Hooks: Processing prompt hook with prompt: ".concat(processedPrompt));
                    userMessage = (0, messages_js_1.createUserMessage)({ content: processedPrompt });
                    messagesToQuery = messages && messages.length > 0
                        ? __spreadArray(__spreadArray([], messages, true), [userMessage], false) : [userMessage];
                    (0, debug_js_1.logForDebugging)("Hooks: Querying model with ".concat(messagesToQuery.length, " messages"));
                    hookTimeoutMs = hook.timeout ? hook.timeout * 1000 : 30000;
                    _a = (0, combinedAbortSignal_js_1.createCombinedAbortSignal)(signal, { timeoutMs: hookTimeoutMs }), combinedSignal = _a.signal, cleanupSignal = _a.cleanup;
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, claude_js_1.queryModelWithoutStreaming)({
                            messages: messagesToQuery,
                            systemPrompt: (0, systemPromptType_js_1.asSystemPrompt)([
                                "You are evaluating a hook in Claude Code.\n\nYour response must be a JSON object matching one of the following schemas:\n1. If the condition is met, return: {\"ok\": true}\n2. If the condition is not met, return: {\"ok\": false, \"reason\": \"Reason for why it is not met\"}",
                            ]),
                            thinkingConfig: { type: 'disabled' },
                            tools: toolUseContext.options.tools,
                            signal: combinedSignal,
                            options: {
                                getToolPermissionContext: function () {
                                    return __awaiter(this, void 0, void 0, function () {
                                        var appState;
                                        return __generator(this, function (_a) {
                                            appState = toolUseContext.getAppState();
                                            return [2 /*return*/, appState.toolPermissionContext];
                                        });
                                    });
                                },
                                model: (_b = hook.model) !== null && _b !== void 0 ? _b : (0, model_js_1.getSmallFastModel)(),
                                toolChoice: undefined,
                                isNonInteractiveSession: true,
                                hasAppendSystemPrompt: false,
                                agents: [],
                                querySource: 'hook_prompt',
                                mcpTools: [],
                                agentId: toolUseContext.agentId,
                                outputFormat: {
                                    type: 'json_schema',
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            ok: { type: 'boolean' },
                                            reason: { type: 'string' },
                                        },
                                        required: ['ok'],
                                        additionalProperties: false,
                                    },
                                },
                            },
                        })];
                case 3:
                    response = _c.sent();
                    cleanupSignal();
                    content_1 = (0, messages_js_1.extractTextContent)(response.message.content);
                    // Update response length for spinner display
                    toolUseContext.setResponseLength(function (length) { return length + content_1.length; });
                    fullResponse = content_1.trim();
                    (0, debug_js_1.logForDebugging)("Hooks: Model response: ".concat(fullResponse));
                    json = (0, json_js_1.safeParseJSON)(fullResponse);
                    if (!json) {
                        (0, debug_js_1.logForDebugging)("Hooks: error parsing response as JSON: ".concat(fullResponse));
                        return [2 /*return*/, {
                                hook: hook,
                                outcome: 'non_blocking_error',
                                message: (0, attachments_js_1.createAttachmentMessage)({
                                    type: 'hook_non_blocking_error',
                                    hookName: hookName,
                                    toolUseID: effectiveToolUseID,
                                    hookEvent: hookEvent,
                                    stderr: 'JSON validation failed',
                                    stdout: fullResponse,
                                    exitCode: 1,
                                }),
                            }];
                    }
                    parsed = (0, hookHelpers_js_1.hookResponseSchema)().safeParse(json);
                    if (!parsed.success) {
                        (0, debug_js_1.logForDebugging)("Hooks: model response does not conform to expected schema: ".concat(parsed.error.message));
                        return [2 /*return*/, {
                                hook: hook,
                                outcome: 'non_blocking_error',
                                message: (0, attachments_js_1.createAttachmentMessage)({
                                    type: 'hook_non_blocking_error',
                                    hookName: hookName,
                                    toolUseID: effectiveToolUseID,
                                    hookEvent: hookEvent,
                                    stderr: "Schema validation failed: ".concat(parsed.error.message),
                                    stdout: fullResponse,
                                    exitCode: 1,
                                }),
                            }];
                    }
                    // Failed to meet condition
                    if (!parsed.data.ok) {
                        (0, debug_js_1.logForDebugging)("Hooks: Prompt hook condition was not met: ".concat(parsed.data.reason));
                        return [2 /*return*/, {
                                hook: hook,
                                outcome: 'blocking',
                                blockingError: {
                                    blockingError: "Prompt hook condition was not met: ".concat(parsed.data.reason),
                                    command: hook.prompt,
                                },
                                preventContinuation: true,
                                stopReason: parsed.data.reason,
                            }];
                    }
                    // Condition was met
                    (0, debug_js_1.logForDebugging)("Hooks: Prompt hook condition was met");
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
                case 4:
                    error_1 = _c.sent();
                    cleanupSignal();
                    if (combinedSignal.aborted) {
                        return [2 /*return*/, {
                                hook: hook,
                                outcome: 'cancelled',
                            }];
                    }
                    throw error_1;
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_2 = _c.sent();
                    errorMsg = (0, errors_js_1.errorMessage)(error_2);
                    (0, debug_js_1.logForDebugging)("Hooks: Prompt hook error: ".concat(errorMsg));
                    return [2 /*return*/, {
                            hook: hook,
                            outcome: 'non_blocking_error',
                            message: (0, attachments_js_1.createAttachmentMessage)({
                                type: 'hook_non_blocking_error',
                                hookName: hookName,
                                toolUseID: effectiveToolUseID,
                                hookEvent: hookEvent,
                                stderr: "Error executing prompt hook: ".concat(errorMsg),
                                stdout: '',
                                exitCode: 1,
                            }),
                        }];
                case 7: return [2 /*return*/];
            }
        });
    });
}
