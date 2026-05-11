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
Object.defineProperty(exports, "__esModule", { value: true });
exports.countTokensWithAPI = countTokensWithAPI;
exports.countMessagesTokensWithAPI = countMessagesTokensWithAPI;
exports.roughTokenCountEstimation = roughTokenCountEstimation;
exports.bytesPerTokenForFileType = bytesPerTokenForFileType;
exports.roughTokenCountEstimationForFileType = roughTokenCountEstimationForFileType;
exports.countTokensViaHaikuFallback = countTokensViaHaikuFallback;
exports.roughTokenCountEstimationForMessages = roughTokenCountEstimationForMessages;
exports.roughTokenCountEstimationForMessage = roughTokenCountEstimationForMessage;
var providers_js_1 = require("src/utils/model/providers.js");
var betas_js_1 = require("../constants/betas.js");
var betas_js_2 = require("../utils/betas.js");
var envUtils_js_1 = require("../utils/envUtils.js");
var log_js_1 = require("../utils/log.js");
var messages_js_1 = require("../utils/messages.js");
var bedrock_js_1 = require("../utils/model/bedrock.js");
var model_js_1 = require("../utils/model/model.js");
var slowOperations_js_1 = require("../utils/slowOperations.js");
var toolSearch_js_1 = require("../utils/toolSearch.js");
var claude_js_1 = require("./api/claude.js");
var client_js_1 = require("./api/client.js");
var vcr_js_1 = require("./vcr.js");
// Minimal values for token counting with thinking enabled
// API constraint: max_tokens must be greater than thinking.budget_tokens
var TOKEN_COUNT_THINKING_BUDGET = 1024;
var TOKEN_COUNT_MAX_TOKENS = 2048;
/**
 * Check if messages contain thinking blocks
 */
function hasThinkingBlocks(messages) {
    for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
        var message = messages_1[_i];
        if (message.role === 'assistant' && Array.isArray(message.content)) {
            for (var _a = 0, _b = message.content; _a < _b.length; _a++) {
                var block = _b[_a];
                if (typeof block === 'object' &&
                    block !== null &&
                    'type' in block &&
                    (block.type === 'thinking' || block.type === 'redacted_thinking')) {
                    return true;
                }
            }
        }
    }
    return false;
}
/**
 * Strip tool search-specific fields from messages before sending for token counting.
 * This removes 'caller' from tool_use blocks and 'tool_reference' from tool_result content.
 * These fields are only valid with the tool search beta and will cause errors otherwise.
 *
 * Note: We use 'as unknown as' casts because the SDK types don't include tool search beta fields,
 * but at runtime these fields may exist from API responses when tool search was enabled.
 */
function stripToolSearchFieldsFromMessages(messages) {
    return messages.map(function (message) {
        if (!Array.isArray(message.content)) {
            return message;
        }
        var normalizedContent = message.content.map(function (block) {
            // Strip 'caller' from tool_use blocks (assistant messages)
            if (block.type === 'tool_use') {
                // Destructure to exclude any extra fields like 'caller'
                var toolUse = block;
                return {
                    type: 'tool_use',
                    id: toolUse.id,
                    name: toolUse.name,
                    input: toolUse.input,
                };
            }
            // Strip tool_reference blocks from tool_result content (user messages)
            if (block.type === 'tool_result') {
                var toolResult = block;
                if (Array.isArray(toolResult.content)) {
                    var filteredContent = toolResult.content.filter(function (c) { return !(0, toolSearch_js_1.isToolReferenceBlock)(c); });
                    if (filteredContent.length === 0) {
                        return __assign(__assign({}, toolResult), { content: [{ type: 'text', text: '[tool references]' }] });
                    }
                    if (filteredContent.length !== toolResult.content.length) {
                        return __assign(__assign({}, toolResult), { content: filteredContent });
                    }
                }
            }
            return block;
        });
        return __assign(__assign({}, message), { content: normalizedContent });
    });
}
function countTokensWithAPI(content) {
    return __awaiter(this, void 0, void 0, function () {
        var message;
        return __generator(this, function (_a) {
            // Special case for empty content - API doesn't accept empty messages
            if (!content) {
                return [2 /*return*/, 0];
            }
            message = {
                role: 'user',
                content: content,
            };
            return [2 /*return*/, countMessagesTokensWithAPI([message], [])];
        });
    });
}
function countMessagesTokensWithAPI(messages, tools) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, (0, vcr_js_1.withTokenCountVCR)(messages, tools, function () { return __awaiter(_this, void 0, void 0, function () {
                    var model, betas, containsThinking, anthropic, filteredBetas, response, error_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 3, , 4]);
                                model = (0, model_js_1.getMainLoopModel)();
                                betas = (0, betas_js_2.getModelBetas)(model);
                                containsThinking = hasThinkingBlocks(messages);
                                if ((0, providers_js_1.getAPIProvider)() === 'bedrock') {
                                    // @anthropic-sdk/bedrock-sdk doesn't support countTokens currently
                                    return [2 /*return*/, countTokensWithBedrock({
                                            model: (0, model_js_1.normalizeModelStringForAPI)(model),
                                            messages: messages,
                                            tools: tools,
                                            betas: betas,
                                            containsThinking: containsThinking,
                                        })];
                                }
                                return [4 /*yield*/, (0, client_js_1.getAnthropicClient)({
                                        maxRetries: 1,
                                        model: model,
                                        source: 'count_tokens',
                                    })];
                            case 1:
                                anthropic = _a.sent();
                                filteredBetas = (0, providers_js_1.getAPIProvider)() === 'vertex'
                                    ? betas.filter(function (b) { return betas_js_1.VERTEX_COUNT_TOKENS_ALLOWED_BETAS.has(b); })
                                    : betas;
                                return [4 /*yield*/, anthropic.beta.messages.countTokens(__assign(__assign({ model: (0, model_js_1.normalizeModelStringForAPI)(model), messages: 
                                        // When we pass tools and no messages, we need to pass a dummy message
                                        // to get an accurate tool token count.
                                        messages.length > 0 ? messages : [{ role: 'user', content: 'foo' }], tools: tools }, (filteredBetas.length > 0 && { betas: filteredBetas })), (containsThinking && {
                                        thinking: {
                                            type: 'enabled',
                                            budget_tokens: TOKEN_COUNT_THINKING_BUDGET,
                                        },
                                    })))];
                            case 2:
                                response = _a.sent();
                                if (typeof response.input_tokens !== 'number') {
                                    // Vertex client throws
                                    // Bedrock client succeeds with { Output: { __type: 'com.amazon.coral.service#UnknownOperationException' }, Version: '1.0' }
                                    return [2 /*return*/, null];
                                }
                                return [2 /*return*/, response.input_tokens];
                            case 3:
                                error_1 = _a.sent();
                                (0, log_js_1.logError)(error_1);
                                return [2 /*return*/, null];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); })];
        });
    });
}
function roughTokenCountEstimation(content, bytesPerToken) {
    if (bytesPerToken === void 0) { bytesPerToken = 4; }
    return Math.round(content.length / bytesPerToken);
}
/**
 * Returns an estimated bytes-per-token ratio for a given file extension.
 * Dense JSON has many single-character tokens (`{`, `}`, `:`, `,`, `"`)
 * which makes the real ratio closer to 2 rather than the default 4.
 */
function bytesPerTokenForFileType(fileExtension) {
    switch (fileExtension) {
        case 'json':
        case 'jsonl':
        case 'jsonc':
            return 2;
        default:
            return 4;
    }
}
/**
 * Like {@link roughTokenCountEstimation} but uses a more accurate
 * bytes-per-token ratio when the file type is known.
 *
 * This matters when the API-based token count is unavailable (e.g. on
 * Bedrock) and we fall back to the rough estimate — an underestimate can
 * let an oversized tool result slip into the conversation.
 */
function roughTokenCountEstimationForFileType(content, fileExtension) {
    return roughTokenCountEstimation(content, bytesPerTokenForFileType(fileExtension));
}
/**
 * Estimates token count for a Message object by extracting and analyzing its text content.
 * This provides a more reliable estimate than getTokenUsage for messages that may have been compacted.
 * Uses Haiku for token counting (Haiku 4.5 supports thinking blocks), except:
 * - Vertex global region: uses Sonnet (Haiku not available)
 * - Bedrock with thinking blocks: uses Sonnet (Haiku 3.5 doesn't support thinking)
 */
function countTokensViaHaikuFallback(messages, tools) {
    return __awaiter(this, void 0, void 0, function () {
        var containsThinking, isVertexGlobalEndpoint, isBedrockWithThinking, isVertexWithThinking, model, anthropic, normalizedMessages, messagesToSend, betas, filteredBetas, response, usage, inputTokens, cacheCreationTokens, cacheReadTokens;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    containsThinking = hasThinkingBlocks(messages);
                    isVertexGlobalEndpoint = (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_USE_VERTEX) &&
                        (0, envUtils_js_1.getVertexRegionForModel)((0, model_js_1.getSmallFastModel)()) === 'global';
                    isBedrockWithThinking = (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_USE_BEDROCK) && containsThinking;
                    isVertexWithThinking = (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_USE_VERTEX) && containsThinking;
                    model = isVertexGlobalEndpoint || isBedrockWithThinking || isVertexWithThinking
                        ? (0, model_js_1.getDefaultSonnetModel)()
                        : (0, model_js_1.getSmallFastModel)();
                    return [4 /*yield*/, (0, client_js_1.getAnthropicClient)({
                            maxRetries: 1,
                            model: model,
                            source: 'count_tokens',
                        })
                        // Strip tool search-specific fields (caller, tool_reference) before sending
                        // These fields are only valid with the tool search beta header
                    ];
                case 1:
                    anthropic = _a.sent();
                    normalizedMessages = stripToolSearchFieldsFromMessages(messages);
                    messagesToSend = normalizedMessages.length > 0
                        ? normalizedMessages
                        : [{ role: 'user', content: 'count' }];
                    betas = (0, betas_js_2.getModelBetas)(model);
                    filteredBetas = (0, providers_js_1.getAPIProvider)() === 'vertex'
                        ? betas.filter(function (b) { return betas_js_1.VERTEX_COUNT_TOKENS_ALLOWED_BETAS.has(b); })
                        : betas;
                    return [4 /*yield*/, anthropic.beta.messages.create(__assign(__assign(__assign(__assign({ model: (0, model_js_1.normalizeModelStringForAPI)(model), max_tokens: containsThinking ? TOKEN_COUNT_MAX_TOKENS : 1, messages: messagesToSend, tools: tools.length > 0 ? tools : undefined }, (filteredBetas.length > 0 && { betas: filteredBetas })), { metadata: (0, claude_js_1.getAPIMetadata)() }), (0, claude_js_1.getExtraBodyParams)()), (containsThinking && {
                            thinking: {
                                type: 'enabled',
                                budget_tokens: TOKEN_COUNT_THINKING_BUDGET,
                            },
                        })))];
                case 2:
                    response = _a.sent();
                    usage = response.usage;
                    inputTokens = usage.input_tokens;
                    cacheCreationTokens = usage.cache_creation_input_tokens || 0;
                    cacheReadTokens = usage.cache_read_input_tokens || 0;
                    return [2 /*return*/, inputTokens + cacheCreationTokens + cacheReadTokens];
            }
        });
    });
}
function roughTokenCountEstimationForMessages(messages) {
    var totalTokens = 0;
    for (var _i = 0, messages_2 = messages; _i < messages_2.length; _i++) {
        var message = messages_2[_i];
        totalTokens += roughTokenCountEstimationForMessage(message);
    }
    return totalTokens;
}
function roughTokenCountEstimationForMessage(message) {
    var _a, _b;
    if ((message.type === 'assistant' || message.type === 'user') &&
        ((_a = message.message) === null || _a === void 0 ? void 0 : _a.content)) {
        return roughTokenCountEstimationForContent((_b = message.message) === null || _b === void 0 ? void 0 : _b.content);
    }
    if (message.type === 'attachment' && message.attachment) {
        var userMessages = (0, messages_js_1.normalizeAttachmentForAPI)(message.attachment);
        var total = 0;
        for (var _i = 0, userMessages_1 = userMessages; _i < userMessages_1.length; _i++) {
            var userMsg = userMessages_1[_i];
            total += roughTokenCountEstimationForContent(userMsg.message.content);
        }
        return total;
    }
    return 0;
}
function roughTokenCountEstimationForContent(content) {
    if (!content) {
        return 0;
    }
    if (typeof content === 'string') {
        return roughTokenCountEstimation(content);
    }
    var totalTokens = 0;
    for (var _i = 0, content_1 = content; _i < content_1.length; _i++) {
        var block = content_1[_i];
        totalTokens += roughTokenCountEstimationForBlock(block);
    }
    return totalTokens;
}
function roughTokenCountEstimationForBlock(block) {
    var _a;
    if (typeof block === 'string') {
        return roughTokenCountEstimation(block);
    }
    if (block.type === 'text') {
        return roughTokenCountEstimation(block.text);
    }
    if (block.type === 'image' || block.type === 'document') {
        // https://platform.claude.com/docs/en/build-with-claude/vision#calculate-image-costs
        // tokens = (width px * height px)/750
        // Images are resized to max 2000x2000 (5333 tokens). Use a conservative
        // estimate that matches microCompact's IMAGE_MAX_TOKEN_SIZE to avoid
        // underestimating and triggering auto-compact too late.
        //
        // document: base64 PDF in source.data.  Must NOT reach the
        // jsonStringify catch-all — a 1MB PDF is ~1.33M base64 chars →
        // ~325k estimated tokens, vs the ~2000 the API actually charges.
        // Same constant as microCompact's calculateToolResultTokens.
        return 2000;
    }
    if (block.type === 'tool_result') {
        return roughTokenCountEstimationForContent(block.content);
    }
    if (block.type === 'tool_use') {
        // input is the JSON the model generated — arbitrarily large (bash
        // commands, Edit diffs, file contents).  Stringify once for the
        // char count; the API re-serializes anyway so this is what it sees.
        return roughTokenCountEstimation(block.name + (0, slowOperations_js_1.jsonStringify)((_a = block.input) !== null && _a !== void 0 ? _a : {}));
    }
    if (block.type === 'thinking') {
        return roughTokenCountEstimation(block.thinking);
    }
    if (block.type === 'redacted_thinking') {
        return roughTokenCountEstimation(block.data);
    }
    // server_tool_use, web_search_tool_result, mcp_tool_use, etc. —
    // text-like payloads (tool inputs, search results, no base64).
    // Stringify-length tracks the serialized form the API sees; the
    // key/bracket overhead is single-digit percent on real blocks.
    return roughTokenCountEstimation((0, slowOperations_js_1.jsonStringify)(block));
}
function countTokensWithBedrock(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var client, modelId, _c, requestBody, CountTokensCommand, input, response, tokenCount, error_2;
        var _d;
        var model = _b.model, messages = _b.messages, tools = _b.tools, betas = _b.betas, containsThinking = _b.containsThinking;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 7, , 8]);
                    return [4 /*yield*/, (0, bedrock_js_1.createBedrockRuntimeClient)()
                        // Bedrock CountTokens requires a model ID, not an inference profile / ARN
                    ];
                case 1:
                    client = _e.sent();
                    if (!(0, bedrock_js_1.isFoundationModel)(model)) return [3 /*break*/, 2];
                    _c = model;
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, (0, bedrock_js_1.getInferenceProfileBackingModel)(model)];
                case 3:
                    _c = _e.sent();
                    _e.label = 4;
                case 4:
                    modelId = _c;
                    if (!modelId) {
                        return [2 /*return*/, null];
                    }
                    requestBody = __assign(__assign(__assign({ anthropic_version: 'bedrock-2023-05-31', 
                        // When we pass tools and no messages, we need to pass a dummy message
                        // to get an accurate tool token count.
                        messages: messages.length > 0 ? messages : [{ role: 'user', content: 'foo' }], max_tokens: containsThinking ? TOKEN_COUNT_MAX_TOKENS : 1 }, (tools.length > 0 && { tools: tools })), (betas.length > 0 && { anthropic_beta: betas })), (containsThinking && {
                        thinking: {
                            type: 'enabled',
                            budget_tokens: TOKEN_COUNT_THINKING_BUDGET,
                        },
                    }));
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('@aws-sdk/client-bedrock-runtime'); })];
                case 5:
                    CountTokensCommand = (_e.sent()).CountTokensCommand;
                    input = {
                        modelId: modelId,
                        input: {
                            invokeModel: {
                                body: new TextEncoder().encode((0, slowOperations_js_1.jsonStringify)(requestBody)),
                            },
                        },
                    };
                    return [4 /*yield*/, client.send(new CountTokensCommand(input))];
                case 6:
                    response = _e.sent();
                    tokenCount = (_d = response.inputTokens) !== null && _d !== void 0 ? _d : null;
                    return [2 /*return*/, tokenCount];
                case 7:
                    error_2 = _e.sent();
                    (0, log_js_1.logError)(error_2);
                    return [2 /*return*/, null];
                case 8: return [2 /*return*/];
            }
        });
    });
}
