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
exports.sideQuery = sideQuery;
var state_js_1 = require("../bootstrap/state.js");
var betas_js_1 = require("../constants/betas.js");
var system_js_1 = require("../constants/system.js");
var index_js_1 = require("../services/analytics/index.js");
var claude_js_1 = require("../services/api/claude.js");
var client_js_1 = require("../services/api/client.js");
var betas_js_2 = require("./betas.js");
var fingerprint_js_1 = require("./fingerprint.js");
var model_js_1 = require("./model/model.js");
/**
 * Extract text from first user message for fingerprint computation.
 */
function extractFirstUserMessageText(messages) {
    var firstUserMessage = messages.find(function (m) { return m.role === 'user'; });
    if (!firstUserMessage)
        return '';
    var content = firstUserMessage.content;
    if (typeof content === 'string')
        return content;
    // Array of content blocks - find first text block
    var textBlock = content.find(function (block) { return block.type === 'text'; });
    return (textBlock === null || textBlock === void 0 ? void 0 : textBlock.type) === 'text' ? textBlock.text : '';
}
/**
 * Lightweight API wrapper for "side queries" outside the main conversation loop.
 *
 * Use this instead of direct client.beta.messages.create() calls to ensure
 * proper OAuth token validation with fingerprint attribution headers.
 *
 * This handles:
 * - Fingerprint computation for OAuth validation
 * - Attribution header injection
 * - CLI system prompt prefix
 * - Proper betas for the model
 * - API metadata
 * - Model string normalization (strips [1m] suffix for API)
 *
 * @example
 * // Permission explainer
 * await sideQuery({ querySource: 'permission_explainer', model, system: SYSTEM_PROMPT, messages, tools, tool_choice })
 *
 * @example
 * // Session search
 * await sideQuery({ querySource: 'session_search', model, system: SEARCH_PROMPT, messages })
 *
 * @example
 * // Model validation
 * await sideQuery({ querySource: 'model_validation', model, max_tokens: 1, messages: [{ role: 'user', content: 'Hi' }] })
 */
function sideQuery(opts) {
    return __awaiter(this, void 0, void 0, function () {
        var model, system, messages, tools, tool_choice, output_format, _a, max_tokens, _b, maxRetries, signal, skipSystemPromptPrefix, temperature, thinking, stop_sequences, client, betas, messageText, fingerprint, attributionHeader, systemBlocks, thinkingConfig, normalizedModel, start, response, requestId, now, lastCompletion;
        var _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    model = opts.model, system = opts.system, messages = opts.messages, tools = opts.tools, tool_choice = opts.tool_choice, output_format = opts.output_format, _a = opts.max_tokens, max_tokens = _a === void 0 ? 1024 : _a, _b = opts.maxRetries, maxRetries = _b === void 0 ? 2 : _b, signal = opts.signal, skipSystemPromptPrefix = opts.skipSystemPromptPrefix, temperature = opts.temperature, thinking = opts.thinking, stop_sequences = opts.stop_sequences;
                    return [4 /*yield*/, (0, client_js_1.getAnthropicClient)({
                            maxRetries: maxRetries,
                            model: model,
                            source: 'side_query',
                        })];
                case 1:
                    client = _f.sent();
                    betas = __spreadArray([], (0, betas_js_2.getModelBetas)(model), true);
                    // Add structured-outputs beta if using output_format and provider supports it
                    if (output_format &&
                        (0, betas_js_2.modelSupportsStructuredOutputs)(model) &&
                        !betas.includes(betas_js_1.STRUCTURED_OUTPUTS_BETA_HEADER)) {
                        betas.push(betas_js_1.STRUCTURED_OUTPUTS_BETA_HEADER);
                    }
                    messageText = extractFirstUserMessageText(messages);
                    fingerprint = (0, fingerprint_js_1.computeFingerprint)(messageText, MACRO.VERSION);
                    attributionHeader = (0, system_js_1.getAttributionHeader)(fingerprint);
                    systemBlocks = __spreadArray(__spreadArray([
                        attributionHeader ? { type: 'text', text: attributionHeader } : null
                    ], (skipSystemPromptPrefix
                        ? []
                        : [
                            {
                                type: 'text',
                                text: (0, system_js_1.getCLISyspromptPrefix)({
                                    isNonInteractive: false,
                                    hasAppendSystemPrompt: false,
                                }),
                            },
                        ]), true), (Array.isArray(system)
                        ? system
                        : system
                            ? [{ type: 'text', text: system }]
                            : []), true).filter(function (block) { return block !== null; });
                    if (thinking === false) {
                        thinkingConfig = { type: 'disabled' };
                    }
                    else if (thinking !== undefined) {
                        thinkingConfig = {
                            type: 'enabled',
                            budget_tokens: Math.min(thinking, max_tokens - 1),
                        };
                    }
                    normalizedModel = (0, model_js_1.normalizeModelStringForAPI)(model);
                    start = Date.now();
                    return [4 /*yield*/, client.beta.messages.create(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({ model: normalizedModel, max_tokens: max_tokens, system: systemBlocks, messages: messages }, (tools && { tools: tools })), (tool_choice && { tool_choice: tool_choice })), (output_format && { output_config: { format: output_format } })), (temperature !== undefined && { temperature: temperature })), (stop_sequences && { stop_sequences: stop_sequences })), (thinkingConfig && { thinking: thinkingConfig })), (betas.length > 0 && { betas: betas })), { metadata: (0, claude_js_1.getAPIMetadata)() }), { signal: signal })];
                case 2:
                    response = _f.sent();
                    requestId = (_c = response._request_id) !== null && _c !== void 0 ? _c : undefined;
                    now = Date.now();
                    lastCompletion = (0, state_js_1.getLastApiCompletionTimestamp)();
                    (0, index_js_1.logEvent)('tengu_api_success', {
                        requestId: requestId,
                        querySource: opts.querySource,
                        model: normalizedModel,
                        inputTokens: response.usage.input_tokens,
                        outputTokens: response.usage.output_tokens,
                        cachedInputTokens: (_d = response.usage.cache_read_input_tokens) !== null && _d !== void 0 ? _d : 0,
                        uncachedInputTokens: (_e = response.usage.cache_creation_input_tokens) !== null && _e !== void 0 ? _e : 0,
                        durationMsIncludingRetries: now - start,
                        timeSinceLastApiCallMs: lastCompletion !== null ? now - lastCompletion : undefined,
                    });
                    (0, state_js_1.setLastApiCompletionTimestamp)(now);
                    return [2 /*return*/, response];
            }
        });
    });
}
