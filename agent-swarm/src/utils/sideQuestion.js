"use strict";
/**
 * Side Question ("/btw") feature - allows asking quick questions without
 * interrupting the main agent context.
 *
 * Uses runForkedAgent to leverage prompt caching from the parent context
 * while keeping the side question response separate from main conversation.
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
exports.findBtwTriggerPositions = findBtwTriggerPositions;
exports.runSideQuestion = runSideQuestion;
var errorUtils_js_1 = require("../services/api/errorUtils.js");
var forkedAgent_js_1 = require("./forkedAgent.js");
var messages_js_1 = require("./messages.js");
// Pattern to detect "/btw" at start of input (case-insensitive, word boundary)
var BTW_PATTERN = /^\/btw\b/gi;
/**
 * Find positions of "/btw" keyword at the start of text for highlighting.
 * Similar to findThinkingTriggerPositions in thinking.ts.
 */
function findBtwTriggerPositions(text) {
    var positions = [];
    var matches = text.matchAll(BTW_PATTERN);
    for (var _i = 0, matches_1 = matches; _i < matches_1.length; _i++) {
        var match = matches_1[_i];
        if (match.index !== undefined) {
            positions.push({
                word: match[0],
                start: match.index,
                end: match.index + match[0].length,
            });
        }
    }
    return positions;
}
/**
 * Run a side question using a forked agent.
 * Shares the parent's prompt cache — no thinking override, no cache write.
 * All tools are blocked and we cap at 1 turn.
 */
function runSideQuestion(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var wrappedQuestion, agentResult;
        var _this = this;
        var question = _b.question, cacheSafeParams = _b.cacheSafeParams;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    wrappedQuestion = "<system-reminder>This is a side question from the user. You must answer this question directly in a single response.\n\nIMPORTANT CONTEXT:\n- You are a separate, lightweight agent spawned to answer this one question\n- The main agent is NOT interrupted - it continues working independently in the background\n- You share the conversation context but are a completely separate instance\n- Do NOT reference being interrupted or what you were \"previously doing\" - that framing is incorrect\n\nCRITICAL CONSTRAINTS:\n- You have NO tools available - you cannot read files, run commands, search, or take any actions\n- This is a one-off response - there will be no follow-up turns\n- You can ONLY provide information based on what you already know from the conversation context\n- NEVER say things like \"Let me try...\", \"I'll now...\", \"Let me check...\", or promise to take any action\n- If you don't know the answer, say so - do not offer to look it up or investigate\n\nSimply answer the question with the information you have.</system-reminder>\n\n".concat(question);
                    return [4 /*yield*/, (0, forkedAgent_js_1.runForkedAgent)({
                            promptMessages: [(0, messages_js_1.createUserMessage)({ content: wrappedQuestion })],
                            // Do NOT override thinkingConfig — thinking is part of the API cache key,
                            // and diverging from the main thread's config busts the prompt cache.
                            // Adaptive thinking on a quick Q&A has negligible overhead.
                            cacheSafeParams: cacheSafeParams,
                            canUseTool: function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2 /*return*/, ({
                                            behavior: 'deny',
                                            message: 'Side questions cannot use tools',
                                            decisionReason: { type: 'other', reason: 'side_question' },
                                        })];
                                });
                            }); },
                            querySource: 'side_question',
                            forkLabel: 'side_question',
                            maxTurns: 1, // Single turn only - no tool use loops
                            // No future request shares this suffix; skip writing cache entries.
                            skipCacheWrite: true,
                        })];
                case 1:
                    agentResult = _c.sent();
                    return [2 /*return*/, {
                            response: extractSideQuestionResponse(agentResult.messages),
                            usage: agentResult.totalUsage,
                        }];
            }
        });
    });
}
/**
 * Extract a display string from forked agent messages.
 *
 * IMPORTANT: claude.ts yields one AssistantMessage PER CONTENT BLOCK, not one
 * per API response. With adaptive thinking enabled (inherited from the main
 * thread to preserve the cache key), a thinking response arrives as:
 *   messages[0] = assistant { content: [thinking_block] }
 *   messages[1] = assistant { content: [text_block] }
 *
 * The old code used `.find(m => m.type === 'assistant')` which grabbed the
 * first (thinking-only) message, found no text block, and returned null →
 * "No response received". Repos with large context (many skills, big CLAUDE.md)
 * trigger thinking more often, which is why this reproduced in the monorepo
 * but not here.
 *
 * Secondary failure modes also surfaced as "No response received":
 *   - Model attempts tool_use → content = [thinking, tool_use], no text.
 *     Rare — the system-reminder usually prevents this, but handled here.
 *   - API error exhausts retries → query yields system api_error + user
 *     interruption, no assistant message at all.
 */
function extractSideQuestionResponse(messages) {
    // Flatten all assistant content blocks across the per-block messages.
    var assistantBlocks = messages.flatMap(function (m) {
        return m.type === 'assistant' ? m.message.content : [];
    });
    if (assistantBlocks.length > 0) {
        // Concatenate all text blocks (there's normally at most one, but be safe).
        var text = (0, messages_js_1.extractTextContent)(assistantBlocks, '\n\n').trim();
        if (text)
            return text;
        // No text — check if the model tried to call a tool despite instructions.
        var toolUse = assistantBlocks.find(function (b) { return b.type === 'tool_use'; });
        if (toolUse) {
            var toolName = 'name' in toolUse ? toolUse.name : 'a tool';
            return "(The model tried to call ".concat(toolName, " instead of answering directly. Try rephrasing or ask in the main conversation.)");
        }
    }
    // No assistant content — likely API error exhausted retries. Surface the
    // first system api_error message so the user sees what happened.
    var apiErr = messages.find(function (m) {
        return m.type === 'system' && 'subtype' in m && m.subtype === 'api_error';
    });
    if (apiErr) {
        return "(API error: ".concat((0, errorUtils_js_1.formatAPIError)(apiErr.error), ")");
    }
    return null;
}
