"use strict";
/**
 * Tool Use Summary Generator
 *
 * Generates human-readable summaries of completed tool batches using Haiku.
 * Used by the SDK to provide high-level progress updates to clients.
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
exports.generateToolUseSummary = generateToolUseSummary;
var errorIds_js_1 = require("../../constants/errorIds.js");
var errors_js_1 = require("../../utils/errors.js");
var log_js_1 = require("../../utils/log.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var systemPromptType_js_1 = require("../../utils/systemPromptType.js");
var claude_js_1 = require("../api/claude.js");
var TOOL_USE_SUMMARY_SYSTEM_PROMPT = "Write a short summary label describing what these tool calls accomplished. It appears as a single-line row in a mobile app and truncates around 30 characters, so think git-commit-subject, not sentence.\n\nKeep the verb in past tense and the most distinctive noun. Drop articles, connectors, and long location context first.\n\nExamples:\n- Searched in auth/\n- Fixed NPE in UserService\n- Created signup endpoint\n- Read config.json\n- Ran failing tests";
/**
 * Generates a human-readable summary of completed tools.
 *
 * @param params - Parameters including tools executed and their results
 * @returns A brief summary string, or null if generation fails
 */
function generateToolUseSummary(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var toolSummaries, contextPrefix, response, summary, error_1, err;
        var tools = _b.tools, signal = _b.signal, isNonInteractiveSession = _b.isNonInteractiveSession, lastAssistantText = _b.lastAssistantText;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (tools.length === 0) {
                        return [2 /*return*/, null];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    toolSummaries = tools
                        .map(function (tool) {
                        var inputStr = truncateJson(tool.input, 300);
                        var outputStr = truncateJson(tool.output, 300);
                        return "Tool: ".concat(tool.name, "\nInput: ").concat(inputStr, "\nOutput: ").concat(outputStr);
                    })
                        .join('\n\n');
                    contextPrefix = lastAssistantText
                        ? "User's intent (from assistant's last message): ".concat(lastAssistantText.slice(0, 200), "\n\n")
                        : '';
                    return [4 /*yield*/, (0, claude_js_1.queryHaiku)({
                            systemPrompt: (0, systemPromptType_js_1.asSystemPrompt)([TOOL_USE_SUMMARY_SYSTEM_PROMPT]),
                            userPrompt: "".concat(contextPrefix, "Tools completed:\n\n").concat(toolSummaries, "\n\nLabel:"),
                            signal: signal,
                            options: {
                                querySource: 'tool_use_summary_generation',
                                enablePromptCaching: true,
                                agents: [],
                                isNonInteractiveSession: isNonInteractiveSession,
                                hasAppendSystemPrompt: false,
                                mcpTools: [],
                            },
                        })];
                case 2:
                    response = _c.sent();
                    summary = response.message.content
                        .filter(function (block) { return block.type === 'text'; })
                        .map(function (block) { return (block.type === 'text' ? block.text : ''); })
                        .join('')
                        .trim();
                    return [2 /*return*/, summary || null];
                case 3:
                    error_1 = _c.sent();
                    err = (0, errors_js_1.toError)(error_1);
                    err.cause = { errorId: errorIds_js_1.E_TOOL_USE_SUMMARY_GENERATION_FAILED };
                    (0, log_js_1.logError)(err);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Truncates a JSON value to a maximum length for the prompt.
 */
function truncateJson(value, maxLength) {
    try {
        var str = (0, slowOperations_js_1.jsonStringify)(value);
        if (str.length <= maxLength) {
            return str;
        }
        return str.slice(0, maxLength - 3) + '...';
    }
    catch (_a) {
        return '[unable to serialize]';
    }
}
