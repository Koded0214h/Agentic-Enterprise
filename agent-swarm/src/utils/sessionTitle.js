"use strict";
/**
 * Session title generation via Haiku.
 *
 * Standalone module with minimal dependencies so it can be imported from
 * print.ts (SDK control request handler) without pulling in the React/chalk/
 * git dependency chain that teleport.tsx carries.
 *
 * This is the single source of truth for AI-generated session titles across
 * all surfaces. Previously there were separate Haiku title generators:
 * - teleport.tsx generateTitleAndBranch (6-word title + branch for CCR)
 * - rename/generateSessionName.ts (kebab-case name for /rename)
 * Each remains for backwards compat; new callers should use this module.
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
exports.extractConversationText = extractConversationText;
exports.generateSessionTitle = generateSessionTitle;
var v4_1 = require("zod/v4");
var state_js_1 = require("../bootstrap/state.js");
var index_js_1 = require("../services/analytics/index.js");
var claude_js_1 = require("../services/api/claude.js");
var debug_js_1 = require("./debug.js");
var json_js_1 = require("./json.js");
var lazySchema_js_1 = require("./lazySchema.js");
var messages_js_1 = require("./messages.js");
var systemPromptType_js_1 = require("./systemPromptType.js");
var MAX_CONVERSATION_TEXT = 1000;
/**
 * Flatten a message array into a single text string for Haiku title input.
 * Skips meta/non-human messages. Tail-slices to the last 1000 chars so
 * recent context wins when the conversation is long.
 */
function extractConversationText(messages) {
    var parts = [];
    for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
        var msg = messages_1[_i];
        if (msg.type !== 'user' && msg.type !== 'assistant')
            continue;
        if ('isMeta' in msg && msg.isMeta)
            continue;
        if ('origin' in msg && msg.origin && msg.origin.kind !== 'human')
            continue;
        var content = msg.message.content;
        if (typeof content === 'string') {
            parts.push(content);
        }
        else if (Array.isArray(content)) {
            for (var _a = 0, content_1 = content; _a < content_1.length; _a++) {
                var block = content_1[_a];
                if ('type' in block && block.type === 'text' && 'text' in block) {
                    parts.push(block.text);
                }
            }
        }
    }
    var text = parts.join('\n');
    return text.length > MAX_CONVERSATION_TEXT
        ? text.slice(-MAX_CONVERSATION_TEXT)
        : text;
}
var SESSION_TITLE_PROMPT = "Generate a concise, sentence-case title (3-7 words) that captures the main topic or goal of this coding session. The title should be clear enough that the user recognizes the session in a list. Use sentence case: capitalize only the first word and proper nouns.\n\nReturn JSON with a single \"title\" field.\n\nGood examples:\n{\"title\": \"Fix login button on mobile\"}\n{\"title\": \"Add OAuth authentication\"}\n{\"title\": \"Debug failing CI tests\"}\n{\"title\": \"Refactor API client error handling\"}\n\nBad (too vague): {\"title\": \"Code changes\"}\nBad (too long): {\"title\": \"Investigate and fix the issue where the login button does not respond on mobile devices\"}\nBad (wrong case): {\"title\": \"Fix Login Button On Mobile\"}";
var titleSchema = (0, lazySchema_js_1.lazySchema)(function () { return v4_1.z.object({ title: v4_1.z.string() }); });
/**
 * Generate a sentence-case session title from a description or first message.
 * Returns null on error or if Haiku returns an unparseable response.
 *
 * @param description - The user's first message or a description of the session
 * @param signal - Abort signal for cancellation
 */
function generateSessionTitle(description, signal) {
    return __awaiter(this, void 0, void 0, function () {
        var trimmed, result, text, parsed, title, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    trimmed = description.trim();
                    if (!trimmed)
                        return [2 /*return*/, null];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, claude_js_1.queryHaiku)({
                            systemPrompt: (0, systemPromptType_js_1.asSystemPrompt)([SESSION_TITLE_PROMPT]),
                            userPrompt: trimmed,
                            outputFormat: {
                                type: 'json_schema',
                                schema: {
                                    type: 'object',
                                    properties: {
                                        title: { type: 'string' },
                                    },
                                    required: ['title'],
                                    additionalProperties: false,
                                },
                            },
                            signal: signal,
                            options: {
                                querySource: 'generate_session_title',
                                agents: [],
                                // Reflect the actual session mode — this module is called from
                                // both the SDK print path (non-interactive) and the CCR remote
                                // session path via useRemoteSession (interactive).
                                isNonInteractiveSession: (0, state_js_1.getIsNonInteractiveSession)(),
                                hasAppendSystemPrompt: false,
                                mcpTools: [],
                            },
                        })];
                case 2:
                    result = _a.sent();
                    text = (0, messages_js_1.extractTextContent)(result.message.content);
                    parsed = titleSchema().safeParse((0, json_js_1.safeParseJSON)(text));
                    title = parsed.success ? parsed.data.title.trim() || null : null;
                    (0, index_js_1.logEvent)('tengu_session_title_generated', { success: title !== null });
                    return [2 /*return*/, title];
                case 3:
                    error_1 = _a.sent();
                    (0, debug_js_1.logForDebugging)("generateSessionTitle failed: ".concat(error_1), {
                        level: 'error',
                    });
                    (0, index_js_1.logEvent)('tengu_session_title_generated', { success: false });
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
