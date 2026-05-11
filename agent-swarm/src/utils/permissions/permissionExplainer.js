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
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPermissionExplainerEnabled = isPermissionExplainerEnabled;
exports.generatePermissionExplanation = generatePermissionExplanation;
var v4_1 = require("zod/v4");
var index_js_1 = require("../../services/analytics/index.js");
var metadata_js_1 = require("../../services/analytics/metadata.js");
var config_js_1 = require("../config.js");
var debug_js_1 = require("../debug.js");
var errors_js_1 = require("../errors.js");
var lazySchema_js_1 = require("../lazySchema.js");
var log_js_1 = require("../log.js");
var model_js_1 = require("../model/model.js");
var sideQuery_js_1 = require("../sideQuery.js");
var slowOperations_js_1 = require("../slowOperations.js");
// Map risk levels to numeric values for analytics
var RISK_LEVEL_NUMERIC = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
};
// Error type codes for analytics
var ERROR_TYPE_PARSE = 1;
var ERROR_TYPE_NETWORK = 2;
var ERROR_TYPE_UNKNOWN = 3;
var SYSTEM_PROMPT = "Analyze shell commands and explain what they do, why you're running them, and potential risks.";
// Tool definition for forced structured output (no beta required)
var EXPLAIN_COMMAND_TOOL = {
    name: 'explain_command',
    description: 'Provide an explanation of a shell command',
    input_schema: {
        type: 'object',
        properties: {
            explanation: {
                type: 'string',
                description: 'What this command does (1-2 sentences)',
            },
            reasoning: {
                type: 'string',
                description: 'Why YOU are running this command. Start with "I" - e.g. "I need to check the file contents"',
            },
            risk: {
                type: 'string',
                description: 'What could go wrong, under 15 words',
            },
            riskLevel: {
                type: 'string',
                enum: ['LOW', 'MEDIUM', 'HIGH'],
                description: 'LOW (safe dev workflows), MEDIUM (recoverable changes), HIGH (dangerous/irreversible)',
            },
        },
        required: ['explanation', 'reasoning', 'risk', 'riskLevel'],
    },
};
// Zod schema for parsing and validating the response
var RiskAssessmentSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        riskLevel: v4_1.z.enum(['LOW', 'MEDIUM', 'HIGH']),
        explanation: v4_1.z.string(),
        reasoning: v4_1.z.string(),
        risk: v4_1.z.string(),
    });
});
function formatToolInput(input) {
    if (typeof input === 'string') {
        return input;
    }
    try {
        return (0, slowOperations_js_1.jsonStringify)(input, null, 2);
    }
    catch (_a) {
        return String(input);
    }
}
/**
 * Extract recent conversation context from messages for the explainer.
 * Returns a summary of recent assistant messages to provide context
 * for "why" this command is being run.
 */
function extractConversationContext(messages, maxChars) {
    if (maxChars === void 0) { maxChars = 1000; }
    // Get recent assistant messages (they contain Claude's reasoning)
    var assistantMessages = messages
        .filter(function (m) { return m.type === 'assistant'; })
        .slice(-3); // Last 3 assistant messages
    var contextParts = [];
    var totalChars = 0;
    for (var _i = 0, _a = assistantMessages.reverse(); _i < _a.length; _i++) {
        var msg = _a[_i];
        // Extract text content from assistant message
        var textBlocks = msg.message.content
            .filter(function (c) { return c.type === 'text'; })
            .map(function (c) { return ('text' in c ? c.text : ''); })
            .join(' ');
        if (textBlocks && totalChars < maxChars) {
            var remaining = maxChars - totalChars;
            var truncated = textBlocks.length > remaining
                ? textBlocks.slice(0, remaining) + '...'
                : textBlocks;
            contextParts.unshift(truncated);
            totalChars += truncated.length;
        }
    }
    return contextParts.join('\n\n');
}
/**
 * Check if the permission explainer feature is enabled.
 * Enabled by default; users can opt out via config.
 */
function isPermissionExplainerEnabled() {
    return (0, config_js_1.getGlobalConfig)().permissionExplainerEnabled !== false;
}
/**
 * Generate a permission explanation using Haiku with structured output.
 * Returns null if the feature is disabled, request is aborted, or an error occurs.
 */
function generatePermissionExplanation(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var startTime, formattedInput, conversationContext, userPrompt, model, response, latencyMs, toolUseBlock, result, explanation, error_1, latencyMs;
        var toolName = _b.toolName, toolInput = _b.toolInput, toolDescription = _b.toolDescription, messages = _b.messages, signal = _b.signal;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    // Check if feature is enabled
                    if (!isPermissionExplainerEnabled()) {
                        return [2 /*return*/, null];
                    }
                    startTime = Date.now();
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    formattedInput = formatToolInput(toolInput);
                    conversationContext = (messages === null || messages === void 0 ? void 0 : messages.length)
                        ? extractConversationContext(messages)
                        : '';
                    userPrompt = "Tool: ".concat(toolName, "\n").concat(toolDescription ? "Description: ".concat(toolDescription, "\n") : '', "\nInput:\n").concat(formattedInput, "\n").concat(conversationContext ? "\nRecent conversation context:\n".concat(conversationContext) : '', "\n\nExplain this command in context.");
                    model = (0, model_js_1.getMainLoopModel)();
                    return [4 /*yield*/, (0, sideQuery_js_1.sideQuery)({
                            model: model,
                            system: SYSTEM_PROMPT,
                            messages: [{ role: 'user', content: userPrompt }],
                            tools: [EXPLAIN_COMMAND_TOOL],
                            tool_choice: { type: 'tool', name: 'explain_command' },
                            signal: signal,
                            querySource: 'permission_explainer',
                        })];
                case 2:
                    response = _c.sent();
                    latencyMs = Date.now() - startTime;
                    (0, debug_js_1.logForDebugging)("Permission explainer: API returned in ".concat(latencyMs, "ms, stop_reason=").concat(response.stop_reason));
                    toolUseBlock = response.content.find(function (c) { return c.type === 'tool_use'; });
                    if (toolUseBlock && toolUseBlock.type === 'tool_use') {
                        (0, debug_js_1.logForDebugging)("Permission explainer: tool input: ".concat((0, slowOperations_js_1.jsonStringify)(toolUseBlock.input).slice(0, 500)));
                        result = RiskAssessmentSchema().safeParse(toolUseBlock.input);
                        if (result.success) {
                            explanation = {
                                riskLevel: result.data.riskLevel,
                                explanation: result.data.explanation,
                                reasoning: result.data.reasoning,
                                risk: result.data.risk,
                            };
                            (0, index_js_1.logEvent)('tengu_permission_explainer_generated', {
                                tool_name: (0, metadata_js_1.sanitizeToolNameForAnalytics)(toolName),
                                risk_level: RISK_LEVEL_NUMERIC[explanation.riskLevel],
                                latency_ms: latencyMs,
                            });
                            (0, debug_js_1.logForDebugging)("Permission explainer: ".concat(explanation.riskLevel, " risk for ").concat(toolName, " (").concat(latencyMs, "ms)"));
                            return [2 /*return*/, explanation];
                        }
                    }
                    // No valid JSON in response
                    (0, index_js_1.logEvent)('tengu_permission_explainer_error', {
                        tool_name: (0, metadata_js_1.sanitizeToolNameForAnalytics)(toolName),
                        error_type: ERROR_TYPE_PARSE,
                        latency_ms: latencyMs,
                    });
                    (0, debug_js_1.logForDebugging)("Permission explainer: no parsed output in response");
                    return [2 /*return*/, null];
                case 3:
                    error_1 = _c.sent();
                    latencyMs = Date.now() - startTime;
                    // Don't log aborted requests as errors
                    if (signal.aborted) {
                        (0, debug_js_1.logForDebugging)("Permission explainer: request aborted for ".concat(toolName));
                        return [2 /*return*/, null];
                    }
                    (0, debug_js_1.logForDebugging)("Permission explainer error: ".concat((0, errors_js_1.errorMessage)(error_1)));
                    (0, log_js_1.logError)(error_1);
                    (0, index_js_1.logEvent)('tengu_permission_explainer_error', {
                        tool_name: (0, metadata_js_1.sanitizeToolNameForAnalytics)(toolName),
                        error_type: error_1 instanceof Error && error_1.name === 'AbortError'
                            ? ERROR_TYPE_NETWORK
                            : ERROR_TYPE_UNKNOWN,
                        latency_ms: latencyMs,
                    });
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
