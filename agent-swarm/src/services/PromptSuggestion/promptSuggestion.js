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
exports.getPromptVariant = getPromptVariant;
exports.shouldEnablePromptSuggestion = shouldEnablePromptSuggestion;
exports.abortPromptSuggestion = abortPromptSuggestion;
exports.getSuggestionSuppressReason = getSuggestionSuppressReason;
exports.tryGenerateSuggestion = tryGenerateSuggestion;
exports.executePromptSuggestion = executePromptSuggestion;
exports.getParentCacheSuppressReason = getParentCacheSuppressReason;
exports.generateSuggestion = generateSuggestion;
exports.shouldFilterSuggestion = shouldFilterSuggestion;
exports.logSuggestionOutcome = logSuggestionOutcome;
exports.logSuggestionSuppressed = logSuggestionSuppressed;
var state_js_1 = require("../../bootstrap/state.js");
var agentSwarmsEnabled_js_1 = require("../../utils/agentSwarmsEnabled.js");
var array_js_1 = require("../../utils/array.js");
var envUtils_js_1 = require("../../utils/envUtils.js");
var errors_js_1 = require("../../utils/errors.js");
var forkedAgent_js_1 = require("../../utils/forkedAgent.js");
var log_js_1 = require("../../utils/log.js");
var messages_js_1 = require("../../utils/messages.js");
var settings_js_1 = require("../../utils/settings/settings.js");
var teammate_js_1 = require("../../utils/teammate.js");
var growthbook_js_1 = require("../analytics/growthbook.js");
var index_js_1 = require("../analytics/index.js");
var claudeAiLimits_js_1 = require("../claudeAiLimits.js");
var speculation_js_1 = require("./speculation.js");
var currentAbortController = null;
function getPromptVariant() {
    return 'user_intent';
}
function shouldEnablePromptSuggestion() {
    var _a;
    // Env var overrides everything (for testing)
    var envOverride = process.env.CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION;
    if ((0, envUtils_js_1.isEnvDefinedFalsy)(envOverride)) {
        (0, index_js_1.logEvent)('tengu_prompt_suggestion_init', {
            enabled: false,
            source: 'env',
        });
        return false;
    }
    if ((0, envUtils_js_1.isEnvTruthy)(envOverride)) {
        (0, index_js_1.logEvent)('tengu_prompt_suggestion_init', {
            enabled: true,
            source: 'env',
        });
        return true;
    }
    // Keep default in sync with Config.tsx (settings toggle visibility)
    if (!(0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_chomp_inflection', false)) {
        (0, index_js_1.logEvent)('tengu_prompt_suggestion_init', {
            enabled: false,
            source: 'growthbook',
        });
        return false;
    }
    // Disable in non-interactive mode (print mode, piped input, SDK)
    if ((0, state_js_1.getIsNonInteractiveSession)()) {
        (0, index_js_1.logEvent)('tengu_prompt_suggestion_init', {
            enabled: false,
            source: 'non_interactive',
        });
        return false;
    }
    // Disable for swarm teammates (only leader should show suggestions)
    if ((0, agentSwarmsEnabled_js_1.isAgentSwarmsEnabled)() && (0, teammate_js_1.isTeammate)()) {
        (0, index_js_1.logEvent)('tengu_prompt_suggestion_init', {
            enabled: false,
            source: 'swarm_teammate',
        });
        return false;
    }
    var enabled = ((_a = (0, settings_js_1.getInitialSettings)()) === null || _a === void 0 ? void 0 : _a.promptSuggestionEnabled) !== false;
    (0, index_js_1.logEvent)('tengu_prompt_suggestion_init', {
        enabled: enabled,
        source: 'setting',
    });
    return enabled;
}
function abortPromptSuggestion() {
    if (currentAbortController) {
        currentAbortController.abort();
        currentAbortController = null;
    }
}
/**
 * Returns a suppression reason if suggestions should not be generated,
 * or null if generation is allowed. Shared by main and pipelined paths.
 */
function getSuggestionSuppressReason(appState) {
    if (!appState.promptSuggestionEnabled)
        return 'disabled';
    if (appState.pendingWorkerRequest || appState.pendingSandboxRequest)
        return 'pending_permission';
    if (appState.elicitation.queue.length > 0)
        return 'elicitation_active';
    if (appState.toolPermissionContext.mode === 'plan')
        return 'plan_mode';
    if (process.env.USER_TYPE === 'external' &&
        claudeAiLimits_js_1.currentLimits.status !== 'allowed')
        return 'rate_limit';
    return null;
}
/**
 * Shared guard + generation logic used by both CLI TUI and SDK push paths.
 * Returns the suggestion with metadata, or null if suppressed/filtered.
 */
function tryGenerateSuggestion(abortController, messages, getAppState, cacheSafeParams, source) {
    return __awaiter(this, void 0, void 0, function () {
        var assistantTurnCount, lastAssistantMessage, cacheReason, appState, suppressReason, promptId, _a, suggestion, generationRequestId;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (abortController.signal.aborted) {
                        logSuggestionSuppressed('aborted', undefined, undefined, source);
                        return [2 /*return*/, null];
                    }
                    assistantTurnCount = (0, array_js_1.count)(messages, function (m) { return m.type === 'assistant'; });
                    if (assistantTurnCount < 2) {
                        logSuggestionSuppressed('early_conversation', undefined, undefined, source);
                        return [2 /*return*/, null];
                    }
                    lastAssistantMessage = (0, messages_js_1.getLastAssistantMessage)(messages);
                    if (lastAssistantMessage === null || lastAssistantMessage === void 0 ? void 0 : lastAssistantMessage.isApiErrorMessage) {
                        logSuggestionSuppressed('last_response_error', undefined, undefined, source);
                        return [2 /*return*/, null];
                    }
                    cacheReason = getParentCacheSuppressReason(lastAssistantMessage);
                    if (cacheReason) {
                        logSuggestionSuppressed(cacheReason, undefined, undefined, source);
                        return [2 /*return*/, null];
                    }
                    appState = getAppState();
                    suppressReason = getSuggestionSuppressReason(appState);
                    if (suppressReason) {
                        logSuggestionSuppressed(suppressReason, undefined, undefined, source);
                        return [2 /*return*/, null];
                    }
                    promptId = getPromptVariant();
                    return [4 /*yield*/, generateSuggestion(abortController, promptId, cacheSafeParams)];
                case 1:
                    _a = _b.sent(), suggestion = _a.suggestion, generationRequestId = _a.generationRequestId;
                    if (abortController.signal.aborted) {
                        logSuggestionSuppressed('aborted', undefined, undefined, source);
                        return [2 /*return*/, null];
                    }
                    if (!suggestion) {
                        logSuggestionSuppressed('empty', undefined, promptId, source);
                        return [2 /*return*/, null];
                    }
                    if (shouldFilterSuggestion(suggestion, promptId, source))
                        return [2 /*return*/, null];
                    return [2 /*return*/, { suggestion: suggestion, promptId: promptId, generationRequestId: generationRequestId }];
            }
        });
    });
}
function executePromptSuggestion(context) {
    return __awaiter(this, void 0, void 0, function () {
        var abortController, cacheSafeParams, result_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (context.querySource !== 'repl_main_thread')
                        return [2 /*return*/];
                    currentAbortController = new AbortController();
                    abortController = currentAbortController;
                    cacheSafeParams = (0, forkedAgent_js_1.createCacheSafeParams)(context);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, tryGenerateSuggestion(abortController, context.messages, context.toolUseContext.getAppState, cacheSafeParams, 'cli')];
                case 2:
                    result_1 = _a.sent();
                    if (!result_1)
                        return [2 /*return*/];
                    context.toolUseContext.setAppState(function (prev) { return (__assign(__assign({}, prev), { promptSuggestion: {
                            text: result_1.suggestion,
                            promptId: result_1.promptId,
                            shownAt: 0,
                            acceptedAt: 0,
                            generationRequestId: result_1.generationRequestId,
                        } })); });
                    if ((0, speculation_js_1.isSpeculationEnabled)() && result_1.suggestion) {
                        void (0, speculation_js_1.startSpeculation)(result_1.suggestion, context, context.toolUseContext.setAppState, false, cacheSafeParams);
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    if (error_1 instanceof Error &&
                        (error_1.name === 'AbortError' || error_1.name === 'APIUserAbortError')) {
                        logSuggestionSuppressed('aborted', undefined, undefined, 'cli');
                        return [2 /*return*/];
                    }
                    (0, log_js_1.logError)((0, errors_js_1.toError)(error_1));
                    return [3 /*break*/, 5];
                case 4:
                    if (currentAbortController === abortController) {
                        currentAbortController = null;
                    }
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    });
}
var MAX_PARENT_UNCACHED_TOKENS = 10000;
function getParentCacheSuppressReason(lastAssistantMessage) {
    var _a, _b, _c;
    if (!lastAssistantMessage)
        return null;
    var usage = lastAssistantMessage.message.usage;
    var inputTokens = (_a = usage.input_tokens) !== null && _a !== void 0 ? _a : 0;
    var cacheWriteTokens = (_b = usage.cache_creation_input_tokens) !== null && _b !== void 0 ? _b : 0;
    // The fork re-processes the parent's output (never cached) plus its own prompt.
    var outputTokens = (_c = usage.output_tokens) !== null && _c !== void 0 ? _c : 0;
    return inputTokens + cacheWriteTokens + outputTokens >
        MAX_PARENT_UNCACHED_TOKENS
        ? 'cache_cold'
        : null;
}
var SUGGESTION_PROMPT = "[SUGGESTION MODE: Suggest what the user might naturally type next into Claude Code.]\n\nFIRST: Look at the user's recent messages and original request.\n\nYour job is to predict what THEY would type - not what you think they should do.\n\nTHE TEST: Would they think \"I was just about to type that\"?\n\nEXAMPLES:\nUser asked \"fix the bug and run tests\", bug is fixed \u2192 \"run the tests\"\nAfter code written \u2192 \"try it out\"\nClaude offers options \u2192 suggest the one the user would likely pick, based on conversation\nClaude asks to continue \u2192 \"yes\" or \"go ahead\"\nTask complete, obvious follow-up \u2192 \"commit this\" or \"push it\"\nAfter error or misunderstanding \u2192 silence (let them assess/correct)\n\nBe specific: \"run the tests\" beats \"continue\".\n\nNEVER SUGGEST:\n- Evaluative (\"looks good\", \"thanks\")\n- Questions (\"what about...?\")\n- Claude-voice (\"Let me...\", \"I'll...\", \"Here's...\")\n- New ideas they didn't ask about\n- Multiple sentences\n\nStay silent if the next step isn't obvious from what the user said.\n\nFormat: 2-12 words, match the user's style. Or nothing.\n\nReply with ONLY the suggestion, no quotes or explanation.";
var SUGGESTION_PROMPTS = {
    user_intent: SUGGESTION_PROMPT,
    stated_intent: SUGGESTION_PROMPT,
};
function generateSuggestion(abortController, promptId, cacheSafeParams) {
    return __awaiter(this, void 0, void 0, function () {
        var prompt, canUseTool, result, firstAssistantMsg, generationRequestId, _i, _a, msg, textBlock, suggestion;
        var _this = this;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    prompt = SUGGESTION_PROMPTS[promptId];
                    canUseTool = function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, ({
                                    behavior: 'deny',
                                    message: 'No tools needed for suggestion',
                                    decisionReason: { type: 'other', reason: 'suggestion only' },
                                })
                                // DO NOT override any API parameter that differs from the parent request.
                                // The fork piggybacks on the main thread's prompt cache by sending identical
                                // cache-key params. The billing cache key includes more than just
                                // system/tools/model/messages/thinking — empirically, setting effortValue
                                // or maxOutputTokens on the fork (even via output_config or getAppState)
                                // busts cache. PR #18143 tried effort:'low' and caused a 45x spike in cache
                                // writes (92.7% → 61% hit rate). The only safe overrides are:
                                //   - abortController (not sent to API)
                                //   - skipTranscript (client-side only)
                                //   - skipCacheWrite (controls cache_control markers, not the cache key)
                                //   - canUseTool (client-side permission check)
                            ];
                        });
                    }); };
                    return [4 /*yield*/, (0, forkedAgent_js_1.runForkedAgent)({
                            promptMessages: [(0, messages_js_1.createUserMessage)({ content: prompt })],
                            cacheSafeParams: cacheSafeParams, // Don't override tools/thinking settings - busts cache
                            canUseTool: canUseTool,
                            querySource: 'prompt_suggestion',
                            forkLabel: 'prompt_suggestion',
                            overrides: {
                                abortController: abortController,
                            },
                            skipTranscript: true,
                            skipCacheWrite: true,
                        })
                        // Check ALL messages - model may loop (try tool → denied → text in next message)
                        // Also extract the requestId from the first assistant message for RL dataset joins
                    ];
                case 1:
                    result = _c.sent();
                    firstAssistantMsg = result.messages.find(function (m) { return m.type === 'assistant'; });
                    generationRequestId = (firstAssistantMsg === null || firstAssistantMsg === void 0 ? void 0 : firstAssistantMsg.type) === 'assistant'
                        ? ((_b = firstAssistantMsg.requestId) !== null && _b !== void 0 ? _b : null)
                        : null;
                    for (_i = 0, _a = result.messages; _i < _a.length; _i++) {
                        msg = _a[_i];
                        if (msg.type !== 'assistant')
                            continue;
                        textBlock = msg.message.content.find(function (b) { return b.type === 'text'; });
                        if ((textBlock === null || textBlock === void 0 ? void 0 : textBlock.type) === 'text') {
                            suggestion = textBlock.text.trim();
                            if (suggestion) {
                                return [2 /*return*/, { suggestion: suggestion, generationRequestId: generationRequestId }];
                            }
                        }
                    }
                    return [2 /*return*/, { suggestion: null, generationRequestId: generationRequestId }];
            }
        });
    });
}
function shouldFilterSuggestion(suggestion, promptId, source) {
    if (!suggestion) {
        logSuggestionSuppressed('empty', undefined, promptId, source);
        return true;
    }
    var lower = suggestion.toLowerCase();
    var wordCount = suggestion.trim().split(/\s+/).length;
    var filters = [
        ['done', function () { return lower === 'done'; }],
        [
            'meta_text',
            function () {
                return lower === 'nothing found' ||
                    lower === 'nothing found.' ||
                    lower.startsWith('nothing to suggest') ||
                    lower.startsWith('no suggestion') ||
                    // Model spells out the prompt's "stay silent" instruction
                    /\bsilence is\b|\bstay(s|ing)? silent\b/.test(lower) ||
                    // Model outputs bare "silence" wrapped in punctuation/whitespace
                    /^\W*silence\W*$/.test(lower);
            },
        ],
        [
            'meta_wrapped',
            // Model wraps meta-reasoning in parens/brackets: (silence — ...), [no suggestion]
            function () { return /^\(.*\)$|^\[.*\]$/.test(suggestion); },
        ],
        [
            'error_message',
            function () {
                return lower.startsWith('api error:') ||
                    lower.startsWith('prompt is too long') ||
                    lower.startsWith('request timed out') ||
                    lower.startsWith('invalid api key') ||
                    lower.startsWith('image was too large');
            },
        ],
        ['prefixed_label', function () { return /^\w+:\s/.test(suggestion); }],
        [
            'too_few_words',
            function () {
                if (wordCount >= 2)
                    return false;
                // Allow slash commands — these are valid user commands
                if (suggestion.startsWith('/'))
                    return false;
                // Allow common single-word inputs that are valid user commands
                var ALLOWED_SINGLE_WORDS = new Set([
                    // Affirmatives
                    'yes',
                    'yeah',
                    'yep',
                    'yea',
                    'yup',
                    'sure',
                    'ok',
                    'okay',
                    // Actions
                    'push',
                    'commit',
                    'deploy',
                    'stop',
                    'continue',
                    'check',
                    'exit',
                    'quit',
                    // Negation
                    'no',
                ]);
                return !ALLOWED_SINGLE_WORDS.has(lower);
            },
        ],
        ['too_many_words', function () { return wordCount > 12; }],
        ['too_long', function () { return suggestion.length >= 100; }],
        ['multiple_sentences', function () { return /[.!?]\s+[A-Z]/.test(suggestion); }],
        ['has_formatting', function () { return /[\n*]|\*\*/.test(suggestion); }],
        [
            'evaluative',
            function () {
                return /thanks|thank you|looks good|sounds good|that works|that worked|that's all|nice|great|perfect|makes sense|awesome|excellent/.test(lower);
            },
        ],
        [
            'claude_voice',
            function () {
                return /^(let me|i'll|i've|i'm|i can|i would|i think|i notice|here's|here is|here are|that's|this is|this will|you can|you should|you could|sure,|of course|certainly)/i.test(suggestion);
            },
        ],
    ];
    for (var _i = 0, filters_1 = filters; _i < filters_1.length; _i++) {
        var _a = filters_1[_i], reason = _a[0], check = _a[1];
        if (check()) {
            logSuggestionSuppressed(reason, suggestion, promptId, source);
            return true;
        }
    }
    return false;
}
/**
 * Log acceptance/ignoring of a prompt suggestion. Used by the SDK push path
 * to track outcomes when the next user message arrives.
 */
function logSuggestionOutcome(suggestion, userInput, emittedAt, promptId, generationRequestId) {
    var similarity = Math.round((userInput.length / (suggestion.length || 1)) * 100) / 100;
    var wasAccepted = userInput === suggestion;
    var timeMs = Math.max(0, Date.now() - emittedAt);
    (0, index_js_1.logEvent)('tengu_prompt_suggestion', __assign(__assign(__assign(__assign(__assign({ source: 'sdk', outcome: (wasAccepted
            ? 'accepted'
            : 'ignored'), prompt_id: promptId }, (generationRequestId && {
        generationRequestId: generationRequestId,
    })), (wasAccepted && {
        timeToAcceptMs: timeMs,
    })), (!wasAccepted && { timeToIgnoreMs: timeMs })), { similarity: similarity }), (process.env.USER_TYPE === 'ant' && {
        suggestion: suggestion,
        userInput: userInput,
    })));
}
function logSuggestionSuppressed(reason, suggestion, promptId, source) {
    var resolvedPromptId = promptId !== null && promptId !== void 0 ? promptId : getPromptVariant();
    (0, index_js_1.logEvent)('tengu_prompt_suggestion', __assign(__assign(__assign({}, (source && {
        source: source,
    })), { outcome: 'suppressed', reason: reason, prompt_id: resolvedPromptId }), (process.env.USER_TYPE === 'ant' &&
        suggestion && {
        suggestion: suggestion,
    })));
}
