"use strict";
/**
 * Periodic background summarization for coordinator mode sub-agents.
 *
 * Forks the sub-agent's conversation every ~30s using runForkedAgent()
 * to generate a 1-2 sentence progress summary. The summary is stored
 * on AgentProgress for UI display.
 *
 * Cache sharing: uses the same CacheSafeParams as the parent agent
 * to share the prompt cache. Tools are kept in the request for cache
 * key matching but denied via canUseTool callback.
 */
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startAgentSummarization = startAgentSummarization;
var LocalAgentTask_js_1 = require("../../tasks/LocalAgentTask/LocalAgentTask.js");
var runAgent_js_1 = require("../../tools/AgentTool/runAgent.js");
var debug_js_1 = require("../../utils/debug.js");
var forkedAgent_js_1 = require("../../utils/forkedAgent.js");
var log_js_1 = require("../../utils/log.js");
var messages_js_1 = require("../../utils/messages.js");
var sessionStorage_js_1 = require("../../utils/sessionStorage.js");
var SUMMARY_INTERVAL_MS = 30000;
function buildSummaryPrompt(previousSummary) {
    var prevLine = previousSummary
        ? "\nPrevious: \"".concat(previousSummary, "\" \u2014 say something NEW.\n")
        : '';
    return "Describe your most recent action in 3-5 words using present tense (-ing). Name the file or function, not the branch. Do not use tools.\n".concat(prevLine, "\nGood: \"Reading runAgent.ts\"\nGood: \"Fixing null check in validate.ts\"\nGood: \"Running auth module tests\"\nGood: \"Adding retry logic to fetchUser\"\n\nBad (past tense): \"Analyzed the branch diff\"\nBad (too vague): \"Investigating the issue\"\nBad (too long): \"Reviewing full branch diff and AgentTool.tsx integration\"\nBad (branch name): \"Analyzed adam/background-summary branch diff\"");
}
function startAgentSummarization(taskId, agentId, cacheSafeParams, setAppState) {
    // Drop forkContextMessages from the closure — runSummary rebuilds it each
    // tick from getAgentTranscript(). Without this, the original fork messages
    // (passed from AgentTool.tsx) are pinned for the lifetime of the timer.
    var _drop = cacheSafeParams.forkContextMessages, baseParams = __rest(cacheSafeParams, ["forkContextMessages"]);
    var summaryAbortController = null;
    var timeoutId = null;
    var stopped = false;
    var previousSummary = null;
    function runSummary() {
        return __awaiter(this, void 0, void 0, function () {
            var transcript, cleanMessages, forkParams, canUseTool, result, _i, _a, msg, textBlock, summaryText, e_1;
            var _this = this;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (stopped)
                            return [2 /*return*/];
                        (0, debug_js_1.logForDebugging)("[AgentSummary] Timer fired for agent ".concat(agentId));
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, (0, sessionStorage_js_1.getAgentTranscript)(agentId)];
                    case 2:
                        transcript = _c.sent();
                        if (!transcript || transcript.messages.length < 3) {
                            // Not enough context yet — finally block will schedule next attempt
                            (0, debug_js_1.logForDebugging)("[AgentSummary] Skipping summary for ".concat(taskId, ": not enough messages (").concat((_b = transcript === null || transcript === void 0 ? void 0 : transcript.messages.length) !== null && _b !== void 0 ? _b : 0, ")"));
                            return [2 /*return*/];
                        }
                        cleanMessages = (0, runAgent_js_1.filterIncompleteToolCalls)(transcript.messages);
                        forkParams = __assign(__assign({}, baseParams), { forkContextMessages: cleanMessages });
                        (0, debug_js_1.logForDebugging)("[AgentSummary] Forking for summary, ".concat(cleanMessages.length, " messages in context"));
                        // Create abort controller for this summary
                        summaryAbortController = new AbortController();
                        canUseTool = function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                return [2 /*return*/, ({
                                        behavior: 'deny',
                                        message: 'No tools needed for summary',
                                        decisionReason: { type: 'other', reason: 'summary only' },
                                    })
                                    // DO NOT set maxOutputTokens here. The fork piggybacks on the main
                                    // thread's prompt cache by sending identical cache-key params (system,
                                    // tools, model, messages prefix, thinking config). Setting maxOutputTokens
                                    // would clamp budget_tokens, creating a thinking config mismatch that
                                    // invalidates the cache.
                                    //
                                    // ContentReplacementState is cloned by default in createSubagentContext
                                    // from forkParams.toolUseContext (the subagent's LIVE state captured at
                                    // onCacheSafeParams time). No explicit override needed.
                                ];
                            });
                        }); };
                        return [4 /*yield*/, (0, forkedAgent_js_1.runForkedAgent)({
                                promptMessages: [
                                    (0, messages_js_1.createUserMessage)({ content: buildSummaryPrompt(previousSummary) }),
                                ],
                                cacheSafeParams: forkParams,
                                canUseTool: canUseTool,
                                querySource: 'agent_summary',
                                forkLabel: 'agent_summary',
                                overrides: { abortController: summaryAbortController },
                                skipTranscript: true,
                            })];
                    case 3:
                        result = _c.sent();
                        if (stopped)
                            return [2 /*return*/];
                        // Extract summary text from result
                        for (_i = 0, _a = result.messages; _i < _a.length; _i++) {
                            msg = _a[_i];
                            if (msg.type !== 'assistant')
                                continue;
                            // Skip API error messages
                            if (msg.isApiErrorMessage) {
                                (0, debug_js_1.logForDebugging)("[AgentSummary] Skipping API error message for ".concat(taskId));
                                continue;
                            }
                            textBlock = msg.message.content.find(function (b) { return b.type === 'text'; });
                            if ((textBlock === null || textBlock === void 0 ? void 0 : textBlock.type) === 'text' && textBlock.text.trim()) {
                                summaryText = textBlock.text.trim();
                                (0, debug_js_1.logForDebugging)("[AgentSummary] Summary result for ".concat(taskId, ": ").concat(summaryText));
                                previousSummary = summaryText;
                                (0, LocalAgentTask_js_1.updateAgentSummary)(taskId, summaryText, setAppState);
                                break;
                            }
                        }
                        return [3 /*break*/, 6];
                    case 4:
                        e_1 = _c.sent();
                        if (!stopped && e_1 instanceof Error) {
                            (0, log_js_1.logError)(e_1);
                        }
                        return [3 /*break*/, 6];
                    case 5:
                        summaryAbortController = null;
                        // Reset timer on completion (not initiation) to prevent overlapping summaries
                        if (!stopped) {
                            scheduleNext();
                        }
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    }
    function scheduleNext() {
        if (stopped)
            return;
        timeoutId = setTimeout(runSummary, SUMMARY_INTERVAL_MS);
    }
    function stop() {
        (0, debug_js_1.logForDebugging)("[AgentSummary] Stopping summarization for ".concat(taskId));
        stopped = true;
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
        if (summaryAbortController) {
            summaryAbortController.abort();
            summaryAbortController = null;
        }
    }
    // Start the first timer
    scheduleNext();
    return { stop: stop };
}
