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
exports.generateAwaySummary = generateAwaySummary;
var sdk_1 = require("@anthropic-ai/sdk");
var Tool_js_1 = require("../Tool.js");
var debug_js_1 = require("../utils/debug.js");
var messages_js_1 = require("../utils/messages.js");
var model_js_1 = require("../utils/model/model.js");
var systemPromptType_js_1 = require("../utils/systemPromptType.js");
var claude_js_1 = require("./api/claude.js");
var sessionMemoryUtils_js_1 = require("./SessionMemory/sessionMemoryUtils.js");
// Recap only needs recent context — truncate to avoid "prompt too long" on
// large sessions. 30 messages ≈ ~15 exchanges, plenty for "where we left off."
var RECENT_MESSAGE_WINDOW = 30;
function buildAwaySummaryPrompt(memory) {
    var memoryBlock = memory
        ? "Session memory (broader context):\n".concat(memory, "\n\n")
        : '';
    return "".concat(memoryBlock, "The user stepped away and is coming back. Write exactly 1-3 short sentences. Start by stating the high-level task \u2014 what they are building or debugging, not implementation details. Next: the concrete next step. Skip status reports and commit recaps.");
}
/**
 * Generates a short session recap for the "while you were away" card.
 * Returns null on abort, empty transcript, or error.
 */
function generateAwaySummary(messages, signal) {
    return __awaiter(this, void 0, void 0, function () {
        var memory, recent, response, err_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (messages.length === 0) {
                        return [2 /*return*/, null];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, (0, sessionMemoryUtils_js_1.getSessionMemoryContent)()];
                case 2:
                    memory = _a.sent();
                    recent = messages.slice(-RECENT_MESSAGE_WINDOW);
                    recent.push((0, messages_js_1.createUserMessage)({ content: buildAwaySummaryPrompt(memory) }));
                    return [4 /*yield*/, (0, claude_js_1.queryModelWithoutStreaming)({
                            messages: recent,
                            systemPrompt: (0, systemPromptType_js_1.asSystemPrompt)([]),
                            thinkingConfig: { type: 'disabled' },
                            tools: [],
                            signal: signal,
                            options: {
                                getToolPermissionContext: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                    return [2 /*return*/, (0, Tool_js_1.getEmptyToolPermissionContext)()];
                                }); }); },
                                model: (0, model_js_1.getSmallFastModel)(),
                                toolChoice: undefined,
                                isNonInteractiveSession: false,
                                hasAppendSystemPrompt: false,
                                agents: [],
                                querySource: 'away_summary',
                                mcpTools: [],
                                skipCacheWrite: true,
                            },
                        })];
                case 3:
                    response = _a.sent();
                    if (response.isApiErrorMessage) {
                        (0, debug_js_1.logForDebugging)("[awaySummary] API error: ".concat((0, messages_js_1.getAssistantMessageText)(response)));
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, (0, messages_js_1.getAssistantMessageText)(response)];
                case 4:
                    err_1 = _a.sent();
                    if (err_1 instanceof sdk_1.APIUserAbortError || signal.aborted) {
                        return [2 /*return*/, null];
                    }
                    (0, debug_js_1.logForDebugging)("[awaySummary] generation failed: ".concat(err_1));
                    return [2 /*return*/, null];
                case 5: return [2 /*return*/];
            }
        });
    });
}
