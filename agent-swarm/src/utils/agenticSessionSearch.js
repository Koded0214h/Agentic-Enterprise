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
exports.agenticSessionSearch = agenticSessionSearch;
var array_js_1 = require("./array.js");
var debug_js_1 = require("./debug.js");
var log_js_1 = require("./log.js");
var model_js_1 = require("./model/model.js");
var sessionStorage_js_1 = require("./sessionStorage.js");
var sideQuery_js_1 = require("./sideQuery.js");
var slowOperations_js_1 = require("./slowOperations.js");
// Limits for transcript extraction
var MAX_TRANSCRIPT_CHARS = 2000; // Max chars of transcript per session
var MAX_MESSAGES_TO_SCAN = 100; // Max messages to scan from start/end
var MAX_SESSIONS_TO_SEARCH = 100; // Max sessions to send to the API
var SESSION_SEARCH_SYSTEM_PROMPT = "Your goal is to find relevant sessions based on a user's search query.\n\nYou will be given a list of sessions with their metadata and a search query. Identify which sessions are most relevant to the query.\n\nEach session may include:\n- Title (display name or custom title)\n- Tag (user-assigned category, shown as [tag: name] - users tag sessions with /tag command to categorize them)\n- Branch (git branch name, shown as [branch: name])\n- Summary (AI-generated summary)\n- First message (beginning of the conversation)\n- Transcript (excerpt of conversation content)\n\nIMPORTANT: Tags are user-assigned labels that indicate the session's topic or category. If the query matches a tag exactly or partially, those sessions should be highly prioritized.\n\nFor each session, consider (in order of priority):\n1. Exact tag matches (highest priority - user explicitly categorized this session)\n2. Partial tag matches or tag-related terms\n3. Title matches (custom titles or first message content)\n4. Branch name matches\n5. Summary and transcript content matches\n6. Semantic similarity and related concepts\n\nCRITICAL: Be VERY inclusive in your matching. Include sessions that:\n- Contain the query term anywhere in any field\n- Are semantically related to the query (e.g., \"testing\" matches sessions about \"tests\", \"unit tests\", \"QA\", etc.)\n- Discuss topics that could be related to the query\n- Have transcripts that mention the concept even in passing\n\nWhen in doubt, INCLUDE the session. It's better to return too many results than too few. The user can easily scan through results, but missing relevant sessions is frustrating.\n\nReturn sessions ordered by relevance (most relevant first). If truly no sessions have ANY connection to the query, return an empty array - but this should be rare.\n\nRespond with ONLY the JSON object, no markdown formatting:\n{\"relevant_indices\": [2, 5, 0]}";
/**
 * Extracts searchable text content from a message.
 */
function extractMessageText(message) {
    var _a;
    if (message.type !== 'user' && message.type !== 'assistant') {
        return '';
    }
    var content = 'message' in message ? (_a = message.message) === null || _a === void 0 ? void 0 : _a.content : undefined;
    if (!content)
        return '';
    if (typeof content === 'string') {
        return content;
    }
    if (Array.isArray(content)) {
        return content
            .map(function (block) {
            if (typeof block === 'string')
                return block;
            if ('text' in block && typeof block.text === 'string')
                return block.text;
            return '';
        })
            .filter(Boolean)
            .join(' ');
    }
    return '';
}
/**
 * Extracts a truncated transcript from session messages.
 */
function extractTranscript(messages) {
    if (messages.length === 0)
        return '';
    // Take messages from start and end to get context
    var messagesToScan = messages.length <= MAX_MESSAGES_TO_SCAN
        ? messages
        : __spreadArray(__spreadArray([], messages.slice(0, MAX_MESSAGES_TO_SCAN / 2), true), messages.slice(-MAX_MESSAGES_TO_SCAN / 2), true);
    var text = messagesToScan
        .map(extractMessageText)
        .filter(Boolean)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
    return text.length > MAX_TRANSCRIPT_CHARS
        ? text.slice(0, MAX_TRANSCRIPT_CHARS) + '…'
        : text;
}
/**
 * Checks if a log contains the query term in any searchable field.
 */
function logContainsQuery(log, queryLower) {
    var _a, _b, _c, _d, _e;
    // Check title
    var title = (0, log_js_1.getLogDisplayTitle)(log).toLowerCase();
    if (title.includes(queryLower))
        return true;
    // Check custom title
    if ((_a = log.customTitle) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(queryLower))
        return true;
    // Check tag
    if ((_b = log.tag) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(queryLower))
        return true;
    // Check branch
    if ((_c = log.gitBranch) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(queryLower))
        return true;
    // Check summary
    if ((_d = log.summary) === null || _d === void 0 ? void 0 : _d.toLowerCase().includes(queryLower))
        return true;
    // Check first prompt
    if ((_e = log.firstPrompt) === null || _e === void 0 ? void 0 : _e.toLowerCase().includes(queryLower))
        return true;
    // Check transcript (more expensive, do last)
    if (log.messages && log.messages.length > 0) {
        var transcript = extractTranscript(log.messages).toLowerCase();
        if (transcript.includes(queryLower))
            return true;
    }
    return false;
}
/**
 * Performs an agentic search using Claude to find relevant sessions
 * based on semantic understanding of the query.
 */
function agenticSessionSearch(query, logs, signal) {
    return __awaiter(this, void 0, void 0, function () {
        var queryLower, matchingLogs, logsToSearch, nonMatchingLogs, remainingSlots, logsWithTranscriptsPromises, logsWithTranscripts, sessionList, userMessage, model, response, textContent, jsonMatch, result, relevantIndices, relevantLogs, error_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!query.trim() || logs.length === 0) {
                        return [2 /*return*/, []];
                    }
                    queryLower = query.toLowerCase();
                    matchingLogs = logs.filter(function (log) { return logContainsQuery(log, queryLower); });
                    if (matchingLogs.length >= MAX_SESSIONS_TO_SEARCH) {
                        logsToSearch = matchingLogs.slice(0, MAX_SESSIONS_TO_SEARCH);
                    }
                    else {
                        nonMatchingLogs = logs.filter(function (log) { return !logContainsQuery(log, queryLower); });
                        remainingSlots = MAX_SESSIONS_TO_SEARCH - matchingLogs.length;
                        logsToSearch = __spreadArray(__spreadArray([], matchingLogs, true), nonMatchingLogs.slice(0, remainingSlots), true);
                    }
                    // Debug: log what data we have
                    (0, debug_js_1.logForDebugging)("Agentic search: ".concat(logsToSearch.length, "/").concat(logs.length, " logs, query=\"").concat(query, "\", ") +
                        "matching: ".concat(matchingLogs.length, ", with messages: ").concat((0, array_js_1.count)(logsToSearch, function (l) { var _a; return ((_a = l.messages) === null || _a === void 0 ? void 0 : _a.length) > 0; })));
                    logsWithTranscriptsPromises = logsToSearch.map(function (log) { return __awaiter(_this, void 0, void 0, function () {
                        var error_2;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!(0, sessionStorage_js_1.isLiteLog)(log)) return [3 /*break*/, 4];
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, (0, sessionStorage_js_1.loadFullLog)(log)];
                                case 2: return [2 /*return*/, _a.sent()];
                                case 3:
                                    error_2 = _a.sent();
                                    (0, log_js_1.logError)(error_2);
                                    // If loading fails, use the lite log (no transcript)
                                    return [2 /*return*/, log];
                                case 4: return [2 /*return*/, log];
                            }
                        });
                    }); });
                    return [4 /*yield*/, Promise.all(logsWithTranscriptsPromises)];
                case 1:
                    logsWithTranscripts = _a.sent();
                    (0, debug_js_1.logForDebugging)("Agentic search: loaded ".concat((0, array_js_1.count)(logsWithTranscripts, function (l) { var _a; return ((_a = l.messages) === null || _a === void 0 ? void 0 : _a.length) > 0; }), "/").concat(logsToSearch.length, " logs with transcripts"));
                    sessionList = logsWithTranscripts
                        .map(function (log, index) {
                        var parts = ["".concat(index, ":")];
                        // Title (display title, may be custom or from first prompt)
                        var displayTitle = (0, log_js_1.getLogDisplayTitle)(log);
                        parts.push(displayTitle);
                        // Custom title if different from display title
                        if (log.customTitle && log.customTitle !== displayTitle) {
                            parts.push("[custom title: ".concat(log.customTitle, "]"));
                        }
                        // Tag
                        if (log.tag) {
                            parts.push("[tag: ".concat(log.tag, "]"));
                        }
                        // Git branch
                        if (log.gitBranch) {
                            parts.push("[branch: ".concat(log.gitBranch, "]"));
                        }
                        // Summary
                        if (log.summary) {
                            parts.push("- Summary: ".concat(log.summary));
                        }
                        // First prompt content (truncated)
                        if (log.firstPrompt && log.firstPrompt !== 'No prompt') {
                            parts.push("- First message: ".concat(log.firstPrompt.slice(0, 300)));
                        }
                        // Transcript excerpt (if messages are available)
                        if (log.messages && log.messages.length > 0) {
                            var transcript = extractTranscript(log.messages);
                            if (transcript) {
                                parts.push("- Transcript: ".concat(transcript));
                            }
                        }
                        return parts.join(' ');
                    })
                        .join('\n');
                    userMessage = "Sessions:\n".concat(sessionList, "\n\nSearch query: \"").concat(query, "\"\n\nFind the sessions that are most relevant to this query.");
                    // Debug: log first part of the session list
                    (0, debug_js_1.logForDebugging)("Agentic search prompt (first 500 chars): ".concat(userMessage.slice(0, 500), "..."));
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    model = (0, model_js_1.getSmallFastModel)();
                    (0, debug_js_1.logForDebugging)("Agentic search using model: ".concat(model));
                    return [4 /*yield*/, (0, sideQuery_js_1.sideQuery)({
                            model: model,
                            system: SESSION_SEARCH_SYSTEM_PROMPT,
                            messages: [{ role: 'user', content: userMessage }],
                            signal: signal,
                            querySource: 'session_search',
                        })
                        // Extract the text content from the response
                    ];
                case 3:
                    response = _a.sent();
                    textContent = response.content.find(function (block) { return block.type === 'text'; });
                    if (!textContent || textContent.type !== 'text') {
                        (0, debug_js_1.logForDebugging)('No text content in agentic search response');
                        return [2 /*return*/, []];
                    }
                    // Debug: log the response
                    (0, debug_js_1.logForDebugging)("Agentic search response: ".concat(textContent.text));
                    jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
                    if (!jsonMatch) {
                        (0, debug_js_1.logForDebugging)('Could not find JSON in agentic search response');
                        return [2 /*return*/, []];
                    }
                    result = (0, slowOperations_js_1.jsonParse)(jsonMatch[0]);
                    relevantIndices = result.relevant_indices || [];
                    relevantLogs = relevantIndices
                        .filter(function (index) { return index >= 0 && index < logsWithTranscripts.length; })
                        .map(function (index) { return logsWithTranscripts[index]; });
                    (0, debug_js_1.logForDebugging)("Agentic search found ".concat(relevantLogs.length, " relevant sessions"));
                    return [2 /*return*/, relevantLogs];
                case 4:
                    error_1 = _a.sent();
                    (0, log_js_1.logError)(error_1);
                    (0, debug_js_1.logForDebugging)("Agentic search error: ".concat(error_1));
                    return [2 /*return*/, []];
                case 5: return [2 /*return*/];
            }
        });
    });
}
