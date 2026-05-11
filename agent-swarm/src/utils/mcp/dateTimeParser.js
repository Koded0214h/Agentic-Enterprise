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
exports.parseNaturalLanguageDateTime = parseNaturalLanguageDateTime;
exports.looksLikeISO8601 = looksLikeISO8601;
var claude_js_1 = require("../../services/api/claude.js");
var log_js_1 = require("../log.js");
var messages_js_1 = require("../messages.js");
var systemPromptType_js_1 = require("../systemPromptType.js");
/**
 * Parse natural language date/time input into ISO 8601 format using Haiku.
 *
 * Examples:
 * - "tomorrow at 3pm" → "2025-10-15T15:00:00-07:00"
 * - "next Monday" → "2025-10-20"
 * - "in 2 hours" → "2025-10-14T12:30:00-07:00"
 *
 * @param input The natural language date/time string from the user
 * @param format Whether to parse as 'date' (YYYY-MM-DD) or 'date-time' (full ISO 8601 with time)
 * @param signal AbortSignal for cancellation
 * @returns Parsed ISO 8601 string or error message
 */
function parseNaturalLanguageDateTime(input, format, signal) {
    return __awaiter(this, void 0, void 0, function () {
        var now, currentDateTime, timezoneOffset, tzHours, tzMinutes, tzSign, timezone, dayOfWeek, systemPrompt, formatDescription, userPrompt, result, parsedText, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    now = new Date();
                    currentDateTime = now.toISOString();
                    timezoneOffset = -now.getTimezoneOffset() // minutes, inverted sign
                    ;
                    tzHours = Math.floor(Math.abs(timezoneOffset) / 60);
                    tzMinutes = Math.abs(timezoneOffset) % 60;
                    tzSign = timezoneOffset >= 0 ? '+' : '-';
                    timezone = "".concat(tzSign).concat(String(tzHours).padStart(2, '0'), ":").concat(String(tzMinutes).padStart(2, '0'));
                    dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
                    systemPrompt = (0, systemPromptType_js_1.asSystemPrompt)([
                        'You are a date/time parser that converts natural language into ISO 8601 format.',
                        'You MUST respond with ONLY the ISO 8601 formatted string, with no explanation or additional text.',
                        'If the input is ambiguous, prefer future dates over past dates.',
                        "For times without dates, use today's date.",
                        'For dates without times, do not include a time component.',
                        'If the input is incomplete or you cannot confidently parse it into a valid date, respond with exactly "INVALID" (nothing else).',
                        'Examples of INVALID input: partial dates like "2025-01-", lone numbers like "13", gibberish.',
                        'Examples of valid natural language: "tomorrow", "next Monday", "jan 1st 2025", "in 2 hours", "yesterday".',
                    ]);
                    formatDescription = format === 'date'
                        ? 'YYYY-MM-DD (date only, no time)'
                        : "YYYY-MM-DDTHH:MM:SS".concat(timezone, " (full date-time with timezone)");
                    userPrompt = "Current context:\n- Current date and time: ".concat(currentDateTime, " (UTC)\n- Local timezone: ").concat(timezone, "\n- Day of week: ").concat(dayOfWeek, "\n\nUser input: \"").concat(input, "\"\n\nOutput format: ").concat(formatDescription, "\n\nParse the user's input into ISO 8601 format. Return ONLY the formatted string, or \"INVALID\" if the input is incomplete or unparseable.");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, claude_js_1.queryHaiku)({
                            systemPrompt: systemPrompt,
                            userPrompt: userPrompt,
                            signal: signal,
                            options: {
                                querySource: 'mcp_datetime_parse',
                                agents: [],
                                isNonInteractiveSession: false,
                                hasAppendSystemPrompt: false,
                                mcpTools: [],
                                enablePromptCaching: false,
                            },
                        })
                        // Extract text from result
                    ];
                case 2:
                    result = _a.sent();
                    parsedText = (0, messages_js_1.extractTextContent)(result.message.content).trim();
                    // Validate that we got something usable
                    if (!parsedText || parsedText === 'INVALID') {
                        return [2 /*return*/, {
                                success: false,
                                error: 'Unable to parse date/time from input',
                            }];
                    }
                    // Basic sanity check - should start with a digit (year)
                    if (!/^\d{4}/.test(parsedText)) {
                        return [2 /*return*/, {
                                success: false,
                                error: 'Unable to parse date/time from input',
                            }];
                    }
                    return [2 /*return*/, { success: true, value: parsedText }];
                case 3:
                    error_1 = _a.sent();
                    // Log error but don't expose details to user
                    (0, log_js_1.logError)(error_1);
                    return [2 /*return*/, {
                            success: false,
                            error: 'Unable to parse date/time. Please enter in ISO 8601 format manually.',
                        }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Check if a string looks like it might be an ISO 8601 date/time.
 * Used to decide whether to attempt NL parsing.
 */
function looksLikeISO8601(input) {
    // ISO 8601 date: YYYY-MM-DD
    // ISO 8601 datetime: YYYY-MM-DDTHH:MM:SS...
    return /^\d{4}-\d{2}-\d{2}(T|$)/.test(input.trim());
}
