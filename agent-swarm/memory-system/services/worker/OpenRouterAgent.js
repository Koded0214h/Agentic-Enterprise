"use strict";
/**
 * OpenRouterAgent: OpenRouter-based observation extraction
 *
 * Alternative to SDKAgent that uses OpenRouter's unified API
 * for accessing 100+ models from different providers.
 *
 * Responsibility:
 * - Call OpenRouter REST API for observation extraction
 * - Parse XML responses (same format as Claude/Gemini)
 * - Sync to database and Chroma
 * - Support dynamic model selection across providers
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenRouterAgent = void 0;
exports.isOpenRouterAvailable = isOpenRouterAvailable;
exports.isOpenRouterSelected = isOpenRouterSelected;
var prompts_js_1 = require("../../sdk/prompts.js");
var EnvManager_js_1 = require("../../shared/EnvManager.js");
var SettingsDefaultsManager_js_1 = require("../../shared/SettingsDefaultsManager.js");
var paths_js_1 = require("../../shared/paths.js");
var logger_js_1 = require("../../utils/logger.js");
var ModeManager_js_1 = require("../domain/ModeManager.js");
var index_js_1 = require("./agents/index.js");
// OpenRouter API endpoint
var OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
// Context window management constants (defaults, overridable via settings)
var DEFAULT_MAX_CONTEXT_MESSAGES = 20; // Maximum messages to keep in conversation history
var DEFAULT_MAX_ESTIMATED_TOKENS = 100000; // ~100k tokens max context (safety limit)
var CHARS_PER_TOKEN_ESTIMATE = 4; // Conservative estimate: 1 token = 4 chars
var OpenRouterAgent = /** @class */ (function () {
    function OpenRouterAgent(dbManager, sessionManager) {
        this.fallbackAgent = null;
        this.dbManager = dbManager;
        this.sessionManager = sessionManager;
    }
    /**
     * Set the fallback agent (Claude SDK) for when OpenRouter API fails
     * Must be set after construction to avoid circular dependency
     */
    OpenRouterAgent.prototype.setFallbackAgent = function (agent) {
        this.fallbackAgent = agent;
    };
    /**
     * Start OpenRouter agent for a session
     * Uses multi-turn conversation to maintain context across messages
     */
    OpenRouterAgent.prototype.startSession = function (session, worker) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, apiKey, model, siteUrl, appName, syntheticMemorySessionId, mode, initPrompt, initResponse, tokensUsed, lastCwd, _b, _c, _d, message, originalTimestamp, obsPrompt, obsResponse, tokensUsed, summaryPrompt, summaryResponse, tokensUsed, e_1_1, sessionDuration, error_1;
            var _e, e_1, _f, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        _h.trys.push([0, 22, , 23]);
                        _a = this.getOpenRouterConfig(), apiKey = _a.apiKey, model = _a.model, siteUrl = _a.siteUrl, appName = _a.appName;
                        if (!apiKey) {
                            throw new Error('OpenRouter API key not configured. Set CLAUDE_MEM_OPENROUTER_API_KEY in settings or OPENROUTER_API_KEY environment variable.');
                        }
                        // Generate synthetic memorySessionId (OpenRouter is stateless, doesn't return session IDs)
                        if (!session.memorySessionId) {
                            syntheticMemorySessionId = "openrouter-".concat(session.contentSessionId, "-").concat(Date.now());
                            session.memorySessionId = syntheticMemorySessionId;
                            this.dbManager.getSessionStore().updateMemorySessionId(session.sessionDbId, syntheticMemorySessionId);
                            logger_js_1.logger.info('SESSION', "MEMORY_ID_GENERATED | sessionDbId=".concat(session.sessionDbId, " | provider=OpenRouter"));
                        }
                        mode = ModeManager_js_1.ModeManager.getInstance().getActiveMode();
                        initPrompt = session.lastPromptNumber === 1
                            ? (0, prompts_js_1.buildInitPrompt)(session.project, session.contentSessionId, session.userPrompt, mode)
                            : (0, prompts_js_1.buildContinuationPrompt)(session.userPrompt, session.lastPromptNumber, session.contentSessionId, mode);
                        // Add to conversation history and query OpenRouter with full context
                        session.conversationHistory.push({ role: 'user', content: initPrompt });
                        return [4 /*yield*/, this.queryOpenRouterMultiTurn(session.conversationHistory, apiKey, model, siteUrl, appName)];
                    case 1:
                        initResponse = _h.sent();
                        if (!initResponse.content) return [3 /*break*/, 3];
                        tokensUsed = initResponse.tokensUsed || 0;
                        session.cumulativeInputTokens += Math.floor(tokensUsed * 0.7); // Rough estimate
                        session.cumulativeOutputTokens += Math.floor(tokensUsed * 0.3);
                        // Process response using shared ResponseProcessor (no original timestamp for init - not from queue)
                        return [4 /*yield*/, (0, index_js_1.processAgentResponse)(initResponse.content, session, this.dbManager, this.sessionManager, worker, tokensUsed, null, 'OpenRouter', undefined // No lastCwd yet - before message processing
                            )];
                    case 2:
                        // Process response using shared ResponseProcessor (no original timestamp for init - not from queue)
                        _h.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        logger_js_1.logger.error('SDK', 'Empty OpenRouter init response - session may lack context', {
                            sessionId: session.sessionDbId,
                            model: model
                        });
                        _h.label = 4;
                    case 4:
                        lastCwd = void 0;
                        _h.label = 5;
                    case 5:
                        _h.trys.push([5, 15, 16, 21]);
                        _b = true, _c = __asyncValues(this.sessionManager.getMessageIterator(session.sessionDbId));
                        _h.label = 6;
                    case 6: return [4 /*yield*/, _c.next()];
                    case 7:
                        if (!(_d = _h.sent(), _e = _d.done, !_e)) return [3 /*break*/, 14];
                        _g = _d.value;
                        _b = false;
                        message = _g;
                        // CLAIM-CONFIRM: Track message ID for confirmProcessed() after successful storage
                        // The message is now in 'processing' status in DB until ResponseProcessor calls confirmProcessed()
                        session.processingMessageIds.push(message._persistentId);
                        // Capture cwd from messages for proper worktree support
                        if (message.cwd) {
                            lastCwd = message.cwd;
                        }
                        originalTimestamp = session.earliestPendingTimestamp;
                        if (!(message.type === 'observation')) return [3 /*break*/, 10];
                        // Update last prompt number
                        if (message.prompt_number !== undefined) {
                            session.lastPromptNumber = message.prompt_number;
                        }
                        // CRITICAL: Check memorySessionId BEFORE making expensive LLM call
                        // This prevents wasting tokens when we won't be able to store the result anyway
                        if (!session.memorySessionId) {
                            throw new Error('Cannot process observations: memorySessionId not yet captured. This session may need to be reinitialized.');
                        }
                        obsPrompt = (0, prompts_js_1.buildObservationPrompt)({
                            id: 0,
                            tool_name: message.tool_name,
                            tool_input: JSON.stringify(message.tool_input),
                            tool_output: JSON.stringify(message.tool_response),
                            created_at_epoch: originalTimestamp !== null && originalTimestamp !== void 0 ? originalTimestamp : Date.now(),
                            cwd: message.cwd
                        });
                        // Add to conversation history and query OpenRouter with full context
                        session.conversationHistory.push({ role: 'user', content: obsPrompt });
                        return [4 /*yield*/, this.queryOpenRouterMultiTurn(session.conversationHistory, apiKey, model, siteUrl, appName)];
                    case 8:
                        obsResponse = _h.sent();
                        tokensUsed = 0;
                        if (obsResponse.content) {
                            // Add response to conversation history
                            // session.conversationHistory.push({ role: 'assistant', content: obsResponse.content });
                            tokensUsed = obsResponse.tokensUsed || 0;
                            session.cumulativeInputTokens += Math.floor(tokensUsed * 0.7);
                            session.cumulativeOutputTokens += Math.floor(tokensUsed * 0.3);
                        }
                        // Process response using shared ResponseProcessor
                        return [4 /*yield*/, (0, index_js_1.processAgentResponse)(obsResponse.content || '', session, this.dbManager, this.sessionManager, worker, tokensUsed, originalTimestamp, 'OpenRouter', lastCwd)];
                    case 9:
                        // Process response using shared ResponseProcessor
                        _h.sent();
                        return [3 /*break*/, 13];
                    case 10:
                        if (!(message.type === 'summarize')) return [3 /*break*/, 13];
                        // CRITICAL: Check memorySessionId BEFORE making expensive LLM call
                        if (!session.memorySessionId) {
                            throw new Error('Cannot process summary: memorySessionId not yet captured. This session may need to be reinitialized.');
                        }
                        summaryPrompt = (0, prompts_js_1.buildSummaryPrompt)({
                            id: session.sessionDbId,
                            memory_session_id: session.memorySessionId,
                            project: session.project,
                            user_prompt: session.userPrompt,
                            last_assistant_message: message.last_assistant_message || ''
                        }, mode);
                        // Add to conversation history and query OpenRouter with full context
                        session.conversationHistory.push({ role: 'user', content: summaryPrompt });
                        return [4 /*yield*/, this.queryOpenRouterMultiTurn(session.conversationHistory, apiKey, model, siteUrl, appName)];
                    case 11:
                        summaryResponse = _h.sent();
                        tokensUsed = 0;
                        if (summaryResponse.content) {
                            // Add response to conversation history
                            // session.conversationHistory.push({ role: 'assistant', content: summaryResponse.content });
                            tokensUsed = summaryResponse.tokensUsed || 0;
                            session.cumulativeInputTokens += Math.floor(tokensUsed * 0.7);
                            session.cumulativeOutputTokens += Math.floor(tokensUsed * 0.3);
                        }
                        // Process response using shared ResponseProcessor
                        return [4 /*yield*/, (0, index_js_1.processAgentResponse)(summaryResponse.content || '', session, this.dbManager, this.sessionManager, worker, tokensUsed, originalTimestamp, 'OpenRouter', lastCwd)];
                    case 12:
                        // Process response using shared ResponseProcessor
                        _h.sent();
                        _h.label = 13;
                    case 13:
                        _b = true;
                        return [3 /*break*/, 6];
                    case 14: return [3 /*break*/, 21];
                    case 15:
                        e_1_1 = _h.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 21];
                    case 16:
                        _h.trys.push([16, , 19, 20]);
                        if (!(!_b && !_e && (_f = _c.return))) return [3 /*break*/, 18];
                        return [4 /*yield*/, _f.call(_c)];
                    case 17:
                        _h.sent();
                        _h.label = 18;
                    case 18: return [3 /*break*/, 20];
                    case 19:
                        if (e_1) throw e_1.error;
                        return [7 /*endfinally*/];
                    case 20: return [7 /*endfinally*/];
                    case 21:
                        sessionDuration = Date.now() - session.startTime;
                        logger_js_1.logger.success('SDK', 'OpenRouter agent completed', {
                            sessionId: session.sessionDbId,
                            duration: "".concat((sessionDuration / 1000).toFixed(1), "s"),
                            historyLength: session.conversationHistory.length,
                            model: model
                        });
                        return [3 /*break*/, 23];
                    case 22:
                        error_1 = _h.sent();
                        if ((0, index_js_1.isAbortError)(error_1)) {
                            logger_js_1.logger.warn('SDK', 'OpenRouter agent aborted', { sessionId: session.sessionDbId });
                            throw error_1;
                        }
                        // Check if we should fall back to Claude
                        if ((0, index_js_1.shouldFallbackToClaude)(error_1) && this.fallbackAgent) {
                            logger_js_1.logger.warn('SDK', 'OpenRouter API failed, falling back to Claude SDK', {
                                sessionDbId: session.sessionDbId,
                                error: error_1 instanceof Error ? error_1.message : String(error_1),
                                historyLength: session.conversationHistory.length
                            });
                            // Fall back to Claude - it will use the same session with shared conversationHistory
                            // Note: With claim-and-delete queue pattern, messages are already deleted on claim
                            return [2 /*return*/, this.fallbackAgent.startSession(session, worker)];
                        }
                        logger_js_1.logger.failure('SDK', 'OpenRouter agent error', { sessionDbId: session.sessionDbId }, error_1);
                        throw error_1;
                    case 23: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Estimate token count from text (conservative estimate)
     */
    OpenRouterAgent.prototype.estimateTokens = function (text) {
        return Math.ceil(text.length / CHARS_PER_TOKEN_ESTIMATE);
    };
    /**
     * Truncate conversation history to prevent runaway context costs
     * Keeps most recent messages within token budget
     */
    OpenRouterAgent.prototype.truncateHistory = function (history) {
        var _this = this;
        var settings = SettingsDefaultsManager_js_1.SettingsDefaultsManager.loadFromFile(paths_js_1.USER_SETTINGS_PATH);
        var MAX_CONTEXT_MESSAGES = parseInt(settings.CLAUDE_MEM_OPENROUTER_MAX_CONTEXT_MESSAGES) || DEFAULT_MAX_CONTEXT_MESSAGES;
        var MAX_ESTIMATED_TOKENS = parseInt(settings.CLAUDE_MEM_OPENROUTER_MAX_TOKENS) || DEFAULT_MAX_ESTIMATED_TOKENS;
        if (history.length <= MAX_CONTEXT_MESSAGES) {
            // Check token count even if message count is ok
            var totalTokens = history.reduce(function (sum, m) { return sum + _this.estimateTokens(m.content); }, 0);
            if (totalTokens <= MAX_ESTIMATED_TOKENS) {
                return history;
            }
        }
        // Sliding window: keep most recent messages within limits
        var truncated = [];
        var tokenCount = 0;
        // Process messages in reverse (most recent first)
        for (var i = history.length - 1; i >= 0; i--) {
            var msg = history[i];
            var msgTokens = this.estimateTokens(msg.content);
            if (truncated.length >= MAX_CONTEXT_MESSAGES || tokenCount + msgTokens > MAX_ESTIMATED_TOKENS) {
                logger_js_1.logger.warn('SDK', 'Context window truncated to prevent runaway costs', {
                    originalMessages: history.length,
                    keptMessages: truncated.length,
                    droppedMessages: i + 1,
                    estimatedTokens: tokenCount,
                    tokenLimit: MAX_ESTIMATED_TOKENS
                });
                break;
            }
            truncated.unshift(msg); // Add to beginning
            tokenCount += msgTokens;
        }
        return truncated;
    };
    /**
     * Convert shared ConversationMessage array to OpenAI-compatible message format
     */
    OpenRouterAgent.prototype.conversationToOpenAIMessages = function (history) {
        return history.map(function (msg) { return ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
        }); });
    };
    /**
     * Query OpenRouter via REST API with full conversation history (multi-turn)
     * Sends the entire conversation context for coherent responses
     */
    OpenRouterAgent.prototype.queryOpenRouterMultiTurn = function (history, apiKey, model, siteUrl, appName) {
        return __awaiter(this, void 0, void 0, function () {
            var truncatedHistory, messages, totalChars, estimatedTokens, response, errorText, data, content, tokensUsed, inputTokens, outputTokens, estimatedCost;
            var _a, _b, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        truncatedHistory = this.truncateHistory(history);
                        messages = this.conversationToOpenAIMessages(truncatedHistory);
                        totalChars = truncatedHistory.reduce(function (sum, m) { return sum + m.content.length; }, 0);
                        estimatedTokens = this.estimateTokens(truncatedHistory.map(function (m) { return m.content; }).join(''));
                        logger_js_1.logger.debug('SDK', "Querying OpenRouter multi-turn (".concat(model, ")"), {
                            turns: truncatedHistory.length,
                            totalChars: totalChars,
                            estimatedTokens: estimatedTokens
                        });
                        return [4 /*yield*/, fetch(OPENROUTER_API_URL, {
                                method: 'POST',
                                headers: {
                                    'Authorization': "Bearer ".concat(apiKey),
                                    'HTTP-Referer': siteUrl || 'https://github.com/thedotmack/claude-mem',
                                    'X-Title': appName || 'claude-mem',
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    model: model,
                                    messages: messages,
                                    temperature: 0.3, // Lower temperature for structured extraction
                                    max_tokens: 4096,
                                }),
                            })];
                    case 1:
                        response = _g.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.text()];
                    case 2:
                        errorText = _g.sent();
                        throw new Error("OpenRouter API error: ".concat(response.status, " - ").concat(errorText));
                    case 3: return [4 /*yield*/, response.json()];
                    case 4:
                        data = _g.sent();
                        // Check for API error in response body
                        if (data.error) {
                            throw new Error("OpenRouter API error: ".concat(data.error.code, " - ").concat(data.error.message));
                        }
                        if (!((_c = (_b = (_a = data.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content)) {
                            logger_js_1.logger.error('SDK', 'Empty response from OpenRouter');
                            return [2 /*return*/, { content: '' }];
                        }
                        content = data.choices[0].message.content;
                        tokensUsed = (_d = data.usage) === null || _d === void 0 ? void 0 : _d.total_tokens;
                        // Log actual token usage for cost tracking
                        if (tokensUsed) {
                            inputTokens = ((_e = data.usage) === null || _e === void 0 ? void 0 : _e.prompt_tokens) || 0;
                            outputTokens = ((_f = data.usage) === null || _f === void 0 ? void 0 : _f.completion_tokens) || 0;
                            estimatedCost = (inputTokens / 1000000 * 3) + (outputTokens / 1000000 * 15);
                            logger_js_1.logger.info('SDK', 'OpenRouter API usage', {
                                model: model,
                                inputTokens: inputTokens,
                                outputTokens: outputTokens,
                                totalTokens: tokensUsed,
                                estimatedCostUSD: estimatedCost.toFixed(4),
                                messagesInContext: truncatedHistory.length
                            });
                            // Warn if costs are getting high
                            if (tokensUsed > 50000) {
                                logger_js_1.logger.warn('SDK', 'High token usage detected - consider reducing context', {
                                    totalTokens: tokensUsed,
                                    estimatedCost: estimatedCost.toFixed(4)
                                });
                            }
                        }
                        return [2 /*return*/, { content: content, tokensUsed: tokensUsed }];
                }
            });
        });
    };
    /**
     * Get OpenRouter configuration from settings or environment
     * Issue #733: Uses centralized ~/.claude-mem/.env for credentials, not random project .env files
     */
    OpenRouterAgent.prototype.getOpenRouterConfig = function () {
        var settingsPath = paths_js_1.USER_SETTINGS_PATH;
        var settings = SettingsDefaultsManager_js_1.SettingsDefaultsManager.loadFromFile(settingsPath);
        // API key: check settings first, then centralized claude-mem .env (NOT process.env)
        // This prevents Issue #733 where random project .env files could interfere
        var apiKey = settings.CLAUDE_MEM_OPENROUTER_API_KEY || (0, EnvManager_js_1.getCredential)('OPENROUTER_API_KEY') || '';
        // Model: from settings or default
        var model = settings.CLAUDE_MEM_OPENROUTER_MODEL || 'xiaomi/mimo-v2-flash:free';
        // Optional analytics headers
        var siteUrl = settings.CLAUDE_MEM_OPENROUTER_SITE_URL || '';
        var appName = settings.CLAUDE_MEM_OPENROUTER_APP_NAME || 'claude-mem';
        return { apiKey: apiKey, model: model, siteUrl: siteUrl, appName: appName };
    };
    return OpenRouterAgent;
}());
exports.OpenRouterAgent = OpenRouterAgent;
/**
 * Check if OpenRouter is available (has API key configured)
 * Issue #733: Uses centralized ~/.claude-mem/.env, not random project .env files
 */
function isOpenRouterAvailable() {
    var settingsPath = paths_js_1.USER_SETTINGS_PATH;
    var settings = SettingsDefaultsManager_js_1.SettingsDefaultsManager.loadFromFile(settingsPath);
    return !!(settings.CLAUDE_MEM_OPENROUTER_API_KEY || (0, EnvManager_js_1.getCredential)('OPENROUTER_API_KEY'));
}
/**
 * Check if OpenRouter is the selected provider
 */
function isOpenRouterSelected() {
    var settingsPath = paths_js_1.USER_SETTINGS_PATH;
    var settings = SettingsDefaultsManager_js_1.SettingsDefaultsManager.loadFromFile(settingsPath);
    return settings.CLAUDE_MEM_PROVIDER === 'openrouter';
}
