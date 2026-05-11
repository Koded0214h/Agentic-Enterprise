"use strict";
/**
 * GeminiAgent: Gemini-based observation extraction
 *
 * Alternative to SDKAgent that uses Google's Gemini API directly
 * for extracting observations from tool usage.
 *
 * Responsibility:
 * - Call Gemini REST API for observation extraction
 * - Parse XML responses (same format as Claude)
 * - Sync to database and Chroma
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
exports.GeminiAgent = void 0;
exports.isGeminiAvailable = isGeminiAvailable;
exports.isGeminiSelected = isGeminiSelected;
var path_1 = require("path");
var os_1 = require("os");
var logger_js_1 = require("../../utils/logger.js");
var prompts_js_1 = require("../../sdk/prompts.js");
var SettingsDefaultsManager_js_1 = require("../../shared/SettingsDefaultsManager.js");
var EnvManager_js_1 = require("../../shared/EnvManager.js");
var ModeManager_js_1 = require("../domain/ModeManager.js");
var index_js_1 = require("./agents/index.js");
// Gemini API endpoint — use v1 (stable), not v1beta.
// v1beta does not support newer models like gemini-3-flash.
var GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models';
// Free tier RPM limits by model (requests per minute)
var GEMINI_RPM_LIMITS = {
    'gemini-2.5-flash-lite': 10,
    'gemini-2.5-flash': 10,
    'gemini-2.5-pro': 5,
    'gemini-2.0-flash': 15,
    'gemini-2.0-flash-lite': 30,
    'gemini-3-flash': 10,
    'gemini-3-flash-preview': 5,
};
// Track last request time for rate limiting
var lastRequestTime = 0;
/**
 * Enforce RPM rate limit for Gemini free tier.
 * Waits the required time between requests based on model's RPM limit + 100ms safety buffer.
 * Skipped entirely if rate limiting is disabled (billing users with 1000+ RPM available).
 */
function enforceRateLimitForModel(model, rateLimitingEnabled) {
    return __awaiter(this, void 0, void 0, function () {
        var rpm, minimumDelayMs, now, timeSinceLastRequest, waitTime_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Skip rate limiting if disabled (billing users with 1000+ RPM)
                    if (!rateLimitingEnabled) {
                        return [2 /*return*/];
                    }
                    rpm = GEMINI_RPM_LIMITS[model] || 5;
                    minimumDelayMs = Math.ceil(60000 / rpm) + 100;
                    now = Date.now();
                    timeSinceLastRequest = now - lastRequestTime;
                    if (!(timeSinceLastRequest < minimumDelayMs)) return [3 /*break*/, 2];
                    waitTime_1 = minimumDelayMs - timeSinceLastRequest;
                    logger_js_1.logger.debug('SDK', "Rate limiting: waiting ".concat(waitTime_1, "ms before Gemini request"), { model: model, rpm: rpm });
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, waitTime_1); })];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    lastRequestTime = Date.now();
                    return [2 /*return*/];
            }
        });
    });
}
var GeminiAgent = /** @class */ (function () {
    function GeminiAgent(dbManager, sessionManager) {
        this.fallbackAgent = null;
        this.dbManager = dbManager;
        this.sessionManager = sessionManager;
    }
    /**
     * Set the fallback agent (Claude SDK) for when Gemini API fails
     * Must be set after construction to avoid circular dependency
     */
    GeminiAgent.prototype.setFallbackAgent = function (agent) {
        this.fallbackAgent = agent;
    };
    /**
     * Start Gemini agent for a session
     * Uses multi-turn conversation to maintain context across messages
     */
    GeminiAgent.prototype.startSession = function (session, worker) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, apiKey, model, rateLimitingEnabled, syntheticMemorySessionId, mode, initPrompt, initResponse, tokensUsed, lastCwd, _b, _c, _d, message, originalTimestamp, obsPrompt, obsResponse, tokensUsed, summaryPrompt, summaryResponse, tokensUsed, e_1_1, sessionDuration, error_1;
            var _e, e_1, _f, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        _h.trys.push([0, 25, , 26]);
                        _a = this.getGeminiConfig(), apiKey = _a.apiKey, model = _a.model, rateLimitingEnabled = _a.rateLimitingEnabled;
                        if (!apiKey) {
                            throw new Error('Gemini API key not configured. Set CLAUDE_MEM_GEMINI_API_KEY in settings or GEMINI_API_KEY environment variable.');
                        }
                        // Generate synthetic memorySessionId (Gemini is stateless, doesn't return session IDs)
                        if (!session.memorySessionId) {
                            syntheticMemorySessionId = "gemini-".concat(session.contentSessionId, "-").concat(Date.now());
                            session.memorySessionId = syntheticMemorySessionId;
                            this.dbManager.getSessionStore().updateMemorySessionId(session.sessionDbId, syntheticMemorySessionId);
                            logger_js_1.logger.info('SESSION', "MEMORY_ID_GENERATED | sessionDbId=".concat(session.sessionDbId, " | provider=Gemini"));
                        }
                        mode = ModeManager_js_1.ModeManager.getInstance().getActiveMode();
                        initPrompt = session.lastPromptNumber === 1
                            ? (0, prompts_js_1.buildInitPrompt)(session.project, session.contentSessionId, session.userPrompt, mode)
                            : (0, prompts_js_1.buildContinuationPrompt)(session.userPrompt, session.lastPromptNumber, session.contentSessionId, mode);
                        // Add to conversation history and query Gemini with full context
                        session.conversationHistory.push({ role: 'user', content: initPrompt });
                        return [4 /*yield*/, this.queryGeminiMultiTurn(session.conversationHistory, apiKey, model, rateLimitingEnabled)];
                    case 1:
                        initResponse = _h.sent();
                        if (!initResponse.content) return [3 /*break*/, 3];
                        // Add response to conversation history
                        session.conversationHistory.push({ role: 'assistant', content: initResponse.content });
                        tokensUsed = initResponse.tokensUsed || 0;
                        session.cumulativeInputTokens += Math.floor(tokensUsed * 0.7); // Rough estimate
                        session.cumulativeOutputTokens += Math.floor(tokensUsed * 0.3);
                        // Process response using shared ResponseProcessor (no original timestamp for init - not from queue)
                        return [4 /*yield*/, (0, index_js_1.processAgentResponse)(initResponse.content, session, this.dbManager, this.sessionManager, worker, tokensUsed, null, 'Gemini')];
                    case 2:
                        // Process response using shared ResponseProcessor (no original timestamp for init - not from queue)
                        _h.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        logger_js_1.logger.error('SDK', 'Empty Gemini init response - session may lack context', {
                            sessionId: session.sessionDbId,
                            model: model
                        });
                        _h.label = 4;
                    case 4:
                        lastCwd = void 0;
                        _h.label = 5;
                    case 5:
                        _h.trys.push([5, 18, 19, 24]);
                        _b = true, _c = __asyncValues(this.sessionManager.getMessageIterator(session.sessionDbId));
                        _h.label = 6;
                    case 6: return [4 /*yield*/, _c.next()];
                    case 7:
                        if (!(_d = _h.sent(), _e = _d.done, !_e)) return [3 /*break*/, 17];
                        _g = _d.value;
                        _b = false;
                        message = _g;
                        // CLAIM-CONFIRM: Track message ID for confirmProcessed() after successful storage
                        // The message is now in 'processing' status in DB until ResponseProcessor calls confirmProcessed()
                        session.processingMessageIds.push(message._persistentId);
                        // Capture cwd from each message for worktree support
                        if (message.cwd) {
                            lastCwd = message.cwd;
                        }
                        originalTimestamp = session.earliestPendingTimestamp;
                        if (!(message.type === 'observation')) return [3 /*break*/, 12];
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
                        // Add to conversation history and query Gemini with full context
                        session.conversationHistory.push({ role: 'user', content: obsPrompt });
                        return [4 /*yield*/, this.queryGeminiMultiTurn(session.conversationHistory, apiKey, model, rateLimitingEnabled)];
                    case 8:
                        obsResponse = _h.sent();
                        tokensUsed = 0;
                        if (obsResponse.content) {
                            // Add response to conversation history
                            session.conversationHistory.push({ role: 'assistant', content: obsResponse.content });
                            tokensUsed = obsResponse.tokensUsed || 0;
                            session.cumulativeInputTokens += Math.floor(tokensUsed * 0.7);
                            session.cumulativeOutputTokens += Math.floor(tokensUsed * 0.3);
                        }
                        if (!obsResponse.content) return [3 /*break*/, 10];
                        return [4 /*yield*/, (0, index_js_1.processAgentResponse)(obsResponse.content, session, this.dbManager, this.sessionManager, worker, tokensUsed, originalTimestamp, 'Gemini', lastCwd)];
                    case 9:
                        _h.sent();
                        return [3 /*break*/, 11];
                    case 10:
                        logger_js_1.logger.warn('SDK', 'Empty Gemini observation response, skipping processing to preserve message', {
                            sessionId: session.sessionDbId,
                            messageId: session.processingMessageIds[session.processingMessageIds.length - 1]
                        });
                        _h.label = 11;
                    case 11: return [3 /*break*/, 16];
                    case 12:
                        if (!(message.type === 'summarize')) return [3 /*break*/, 16];
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
                        // Add to conversation history and query Gemini with full context
                        session.conversationHistory.push({ role: 'user', content: summaryPrompt });
                        return [4 /*yield*/, this.queryGeminiMultiTurn(session.conversationHistory, apiKey, model, rateLimitingEnabled)];
                    case 13:
                        summaryResponse = _h.sent();
                        tokensUsed = 0;
                        if (summaryResponse.content) {
                            // Add response to conversation history
                            session.conversationHistory.push({ role: 'assistant', content: summaryResponse.content });
                            tokensUsed = summaryResponse.tokensUsed || 0;
                            session.cumulativeInputTokens += Math.floor(tokensUsed * 0.7);
                            session.cumulativeOutputTokens += Math.floor(tokensUsed * 0.3);
                        }
                        if (!summaryResponse.content) return [3 /*break*/, 15];
                        return [4 /*yield*/, (0, index_js_1.processAgentResponse)(summaryResponse.content, session, this.dbManager, this.sessionManager, worker, tokensUsed, originalTimestamp, 'Gemini', lastCwd)];
                    case 14:
                        _h.sent();
                        return [3 /*break*/, 16];
                    case 15:
                        logger_js_1.logger.warn('SDK', 'Empty Gemini summary response, skipping processing to preserve message', {
                            sessionId: session.sessionDbId,
                            messageId: session.processingMessageIds[session.processingMessageIds.length - 1]
                        });
                        _h.label = 16;
                    case 16:
                        _b = true;
                        return [3 /*break*/, 6];
                    case 17: return [3 /*break*/, 24];
                    case 18:
                        e_1_1 = _h.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 24];
                    case 19:
                        _h.trys.push([19, , 22, 23]);
                        if (!(!_b && !_e && (_f = _c.return))) return [3 /*break*/, 21];
                        return [4 /*yield*/, _f.call(_c)];
                    case 20:
                        _h.sent();
                        _h.label = 21;
                    case 21: return [3 /*break*/, 23];
                    case 22:
                        if (e_1) throw e_1.error;
                        return [7 /*endfinally*/];
                    case 23: return [7 /*endfinally*/];
                    case 24:
                        sessionDuration = Date.now() - session.startTime;
                        logger_js_1.logger.success('SDK', 'Gemini agent completed', {
                            sessionId: session.sessionDbId,
                            duration: "".concat((sessionDuration / 1000).toFixed(1), "s"),
                            historyLength: session.conversationHistory.length
                        });
                        return [3 /*break*/, 26];
                    case 25:
                        error_1 = _h.sent();
                        if ((0, index_js_1.isAbortError)(error_1)) {
                            logger_js_1.logger.warn('SDK', 'Gemini agent aborted', { sessionId: session.sessionDbId });
                            throw error_1;
                        }
                        // Check if we should fall back to Claude
                        if ((0, index_js_1.shouldFallbackToClaude)(error_1) && this.fallbackAgent) {
                            logger_js_1.logger.warn('SDK', 'Gemini API failed, falling back to Claude SDK', {
                                sessionDbId: session.sessionDbId,
                                error: error_1 instanceof Error ? error_1.message : String(error_1),
                                historyLength: session.conversationHistory.length
                            });
                            // Fall back to Claude - it will use the same session with shared conversationHistory
                            // Note: With claim-and-delete queue pattern, messages are already deleted on claim
                            return [2 /*return*/, this.fallbackAgent.startSession(session, worker)];
                        }
                        logger_js_1.logger.failure('SDK', 'Gemini agent error', { sessionDbId: session.sessionDbId }, error_1);
                        throw error_1;
                    case 26: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Convert shared ConversationMessage array to Gemini's contents format
     * Maps 'assistant' role to 'model' for Gemini API compatibility
     */
    GeminiAgent.prototype.conversationToGeminiContents = function (history) {
        return history.map(function (msg) { return ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }); });
    };
    /**
     * Query Gemini via REST API with full conversation history (multi-turn)
     * Sends the entire conversation context for coherent responses
     */
    GeminiAgent.prototype.queryGeminiMultiTurn = function (history, apiKey, model, rateLimitingEnabled) {
        return __awaiter(this, void 0, void 0, function () {
            var contents, totalChars, url, response, error, data, content, tokensUsed;
            var _a, _b, _c, _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        contents = this.conversationToGeminiContents(history);
                        totalChars = history.reduce(function (sum, m) { return sum + m.content.length; }, 0);
                        logger_js_1.logger.debug('SDK', "Querying Gemini multi-turn (".concat(model, ")"), {
                            turns: history.length,
                            totalChars: totalChars
                        });
                        url = "".concat(GEMINI_API_URL, "/").concat(model, ":generateContent?key=").concat(apiKey);
                        // Enforce RPM rate limit for free tier (skipped if rate limiting disabled)
                        return [4 /*yield*/, enforceRateLimitForModel(model, rateLimitingEnabled)];
                    case 1:
                        // Enforce RPM rate limit for free tier (skipped if rate limiting disabled)
                        _g.sent();
                        return [4 /*yield*/, fetch(url, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    contents: contents,
                                    generationConfig: {
                                        temperature: 0.3, // Lower temperature for structured extraction
                                        maxOutputTokens: 4096,
                                    },
                                }),
                            })];
                    case 2:
                        response = _g.sent();
                        if (!!response.ok) return [3 /*break*/, 4];
                        return [4 /*yield*/, response.text()];
                    case 3:
                        error = _g.sent();
                        throw new Error("Gemini API error: ".concat(response.status, " - ").concat(error));
                    case 4: return [4 /*yield*/, response.json()];
                    case 5:
                        data = _g.sent();
                        if (!((_e = (_d = (_c = (_b = (_a = data.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.text)) {
                            logger_js_1.logger.error('SDK', 'Empty response from Gemini');
                            return [2 /*return*/, { content: '' }];
                        }
                        content = data.candidates[0].content.parts[0].text;
                        tokensUsed = (_f = data.usageMetadata) === null || _f === void 0 ? void 0 : _f.totalTokenCount;
                        return [2 /*return*/, { content: content, tokensUsed: tokensUsed }];
                }
            });
        });
    };
    /**
     * Get Gemini configuration from settings or environment
     * Issue #733: Uses centralized ~/.claude-mem/.env for credentials, not random project .env files
     */
    GeminiAgent.prototype.getGeminiConfig = function () {
        var settingsPath = path_1.default.join((0, os_1.homedir)(), '.claude-mem', 'settings.json');
        var settings = SettingsDefaultsManager_js_1.SettingsDefaultsManager.loadFromFile(settingsPath);
        // API key: check settings first, then centralized claude-mem .env (NOT process.env)
        // This prevents Issue #733 where random project .env files could interfere
        var apiKey = settings.CLAUDE_MEM_GEMINI_API_KEY || (0, EnvManager_js_1.getCredential)('GEMINI_API_KEY') || '';
        // Model: from settings or default, with validation
        var defaultModel = 'gemini-2.5-flash';
        var configuredModel = settings.CLAUDE_MEM_GEMINI_MODEL || defaultModel;
        var validModels = [
            'gemini-2.5-flash-lite',
            'gemini-2.5-flash',
            'gemini-2.5-pro',
            'gemini-2.0-flash',
            'gemini-2.0-flash-lite',
            'gemini-3-flash',
            'gemini-3-flash-preview',
        ];
        var model;
        if (validModels.includes(configuredModel)) {
            model = configuredModel;
        }
        else {
            logger_js_1.logger.warn('SDK', "Invalid Gemini model \"".concat(configuredModel, "\", falling back to ").concat(defaultModel), {
                configured: configuredModel,
                validModels: validModels,
            });
            model = defaultModel;
        }
        // Rate limiting: enabled by default for free tier users
        var rateLimitingEnabled = settings.CLAUDE_MEM_GEMINI_RATE_LIMITING_ENABLED !== 'false';
        return { apiKey: apiKey, model: model, rateLimitingEnabled: rateLimitingEnabled };
    };
    return GeminiAgent;
}());
exports.GeminiAgent = GeminiAgent;
/**
 * Check if Gemini is available (has API key configured)
 * Issue #733: Uses centralized ~/.claude-mem/.env, not random project .env files
 */
function isGeminiAvailable() {
    var settingsPath = path_1.default.join((0, os_1.homedir)(), '.claude-mem', 'settings.json');
    var settings = SettingsDefaultsManager_js_1.SettingsDefaultsManager.loadFromFile(settingsPath);
    return !!(settings.CLAUDE_MEM_GEMINI_API_KEY || (0, EnvManager_js_1.getCredential)('GEMINI_API_KEY'));
}
/**
 * Check if Gemini is the selected provider
 */
function isGeminiSelected() {
    var settingsPath = path_1.default.join((0, os_1.homedir)(), '.claude-mem', 'settings.json');
    var settings = SettingsDefaultsManager_js_1.SettingsDefaultsManager.loadFromFile(settingsPath);
    return settings.CLAUDE_MEM_PROVIDER === 'gemini';
}
