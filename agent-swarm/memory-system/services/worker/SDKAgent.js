"use strict";
/**
 * SDKAgent: SDK query loop handler
 *
 * Responsibility:
 * - Spawn Claude subprocess via Agent SDK
 * - Run event-driven query loop (no polling)
 * - Process SDK responses (observations, summaries)
 * - Sync to database and Chroma
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
    function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
    function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SDKAgent = void 0;
var child_process_1 = require("child_process");
var os_1 = require("os");
var path_1 = require("path");
var logger_js_1 = require("../../utils/logger.js");
var prompts_js_1 = require("../../sdk/prompts.js");
var SettingsDefaultsManager_js_1 = require("../../shared/SettingsDefaultsManager.js");
var paths_js_1 = require("../../shared/paths.js");
var EnvManager_js_1 = require("../../shared/EnvManager.js");
var ModeManager_js_1 = require("../domain/ModeManager.js");
var index_js_1 = require("./agents/index.js");
var ProcessRegistry_js_1 = require("./ProcessRegistry.js");
var env_sanitizer_js_1 = require("../../supervisor/env-sanitizer.js");
// Import Agent SDK (assumes it's installed)
// @ts-ignore - Agent SDK types may not be available
var claude_agent_sdk_1 = require("@anthropic-ai/claude-agent-sdk");
var SDKAgent = /** @class */ (function () {
    function SDKAgent(dbManager, sessionManager) {
        this.dbManager = dbManager;
        this.sessionManager = sessionManager;
    }
    /**
     * Start SDK agent for a session (event-driven, no polling)
     * @param worker WorkerService reference for spinner control (optional)
     */
    SDKAgent.prototype.startSession = function (session, worker) {
        return __awaiter(this, void 0, void 0, function () {
            var cwdTracker, claudePath, modelId, disallowedTools, messageGenerator, hasRealMemorySessionId, shouldResume, settings, maxConcurrent, isolatedEnv, authMethod, hasStaleMemoryId, queryResult, _a, queryResult_1, queryResult_1_1, message, previousId, verification, dbVerified, logMessage, content, textContent, responseSize, tokensBeforeResponse, usage, discoveryTokens, originalTimestamp, truncatedResponse, e_1_1, tracked, sessionDuration;
            var _b, e_1, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        cwdTracker = { lastCwd: undefined };
                        claudePath = this.findClaudeExecutable();
                        modelId = this.getModelId();
                        disallowedTools = [
                            'Bash', // Prevent infinite loops
                            'Read', // No file reading
                            'Write', // No file writing
                            'Edit', // No file editing
                            'Grep', // No code searching
                            'Glob', // No file pattern matching
                            'WebFetch', // No web fetching
                            'WebSearch', // No web searching
                            'Task', // No spawning sub-agents
                            'NotebookEdit', // No notebook editing
                            'AskUserQuestion', // No asking questions
                            'TodoWrite' // No todo management
                        ];
                        messageGenerator = this.createMessageGenerator(session, cwdTracker);
                        hasRealMemorySessionId = !!session.memorySessionId;
                        shouldResume = hasRealMemorySessionId && session.lastPromptNumber > 1 && !session.forceInit;
                        // Clear forceInit after using it
                        if (session.forceInit) {
                            logger_js_1.logger.info('SDK', 'forceInit flag set, starting fresh SDK session', {
                                sessionDbId: session.sessionDbId,
                                previousMemorySessionId: session.memorySessionId
                            });
                            session.forceInit = false;
                        }
                        settings = SettingsDefaultsManager_js_1.SettingsDefaultsManager.loadFromFile(paths_js_1.USER_SETTINGS_PATH);
                        maxConcurrent = parseInt(settings.CLAUDE_MEM_MAX_CONCURRENT_AGENTS, 10) || 2;
                        return [4 /*yield*/, (0, ProcessRegistry_js_1.waitForSlot)(maxConcurrent)];
                    case 1:
                        _e.sent();
                        isolatedEnv = (0, env_sanitizer_js_1.sanitizeEnv)((0, EnvManager_js_1.buildIsolatedEnv)());
                        authMethod = (0, EnvManager_js_1.getAuthMethodDescription)();
                        logger_js_1.logger.info('SDK', 'Starting SDK query', {
                            sessionDbId: session.sessionDbId,
                            contentSessionId: session.contentSessionId,
                            memorySessionId: session.memorySessionId,
                            hasRealMemorySessionId: hasRealMemorySessionId,
                            shouldResume: shouldResume,
                            resume_parameter: shouldResume ? session.memorySessionId : '(none - fresh start)',
                            lastPromptNumber: session.lastPromptNumber,
                            authMethod: authMethod
                        });
                        // Debug-level alignment logs for detailed tracing
                        if (session.lastPromptNumber > 1) {
                            logger_js_1.logger.debug('SDK', "[ALIGNMENT] Resume Decision | contentSessionId=".concat(session.contentSessionId, " | memorySessionId=").concat(session.memorySessionId, " | prompt#=").concat(session.lastPromptNumber, " | hasRealMemorySessionId=").concat(hasRealMemorySessionId, " | shouldResume=").concat(shouldResume, " | resumeWith=").concat(shouldResume ? session.memorySessionId : 'NONE'));
                        }
                        else {
                            hasStaleMemoryId = hasRealMemorySessionId;
                            logger_js_1.logger.debug('SDK', "[ALIGNMENT] First Prompt (INIT) | contentSessionId=".concat(session.contentSessionId, " | prompt#=").concat(session.lastPromptNumber, " | hasStaleMemoryId=").concat(hasStaleMemoryId, " | action=START_FRESH | Will capture new memorySessionId from SDK response"));
                            if (hasStaleMemoryId) {
                                logger_js_1.logger.warn('SDK', "Skipping resume for INIT prompt despite existing memorySessionId=".concat(session.memorySessionId, " - SDK context was lost (worker restart or crash recovery)"));
                            }
                        }
                        // Run Agent SDK query loop
                        // Only resume if we have a captured memory session ID
                        // Use custom spawn to capture PIDs for zombie process cleanup (Issue #737)
                        // Use dedicated cwd to isolate observer sessions from user's `claude --resume` list
                        (0, paths_js_1.ensureDir)(paths_js_1.OBSERVER_SESSIONS_DIR);
                        queryResult = (0, claude_agent_sdk_1.query)({
                            prompt: messageGenerator,
                            options: __assign(__assign({ model: modelId, 
                                // Isolate observer sessions - they'll appear under project "observer-sessions"
                                // instead of polluting user's actual project resume lists
                                cwd: paths_js_1.OBSERVER_SESSIONS_DIR }, (shouldResume && { resume: session.memorySessionId })), { disallowedTools: disallowedTools, abortController: session.abortController, pathToClaudeCodeExecutable: claudePath, 
                                // Custom spawn function captures PIDs to fix zombie process accumulation
                                spawnClaudeCodeProcess: (0, ProcessRegistry_js_1.createPidCapturingSpawn)(session.sessionDbId), env: isolatedEnv // Use isolated credentials from ~/.claude-mem/.env, not process.env
                             })
                        });
                        _e.label = 2;
                    case 2:
                        _e.trys.push([2, , 17, 20]);
                        _e.label = 3;
                    case 3:
                        _e.trys.push([3, 10, 11, 16]);
                        _a = true, queryResult_1 = __asyncValues(queryResult);
                        _e.label = 4;
                    case 4: return [4 /*yield*/, queryResult_1.next()];
                    case 5:
                        if (!(queryResult_1_1 = _e.sent(), _b = queryResult_1_1.done, !_b)) return [3 /*break*/, 9];
                        _d = queryResult_1_1.value;
                        _a = false;
                        message = _d;
                        // Capture or update memory session ID from SDK message
                        // IMPORTANT: The SDK may return a DIFFERENT session_id on resume than what we sent!
                        // We must always sync the DB to match what the SDK actually uses.
                        //
                        // MULTI-TERMINAL COLLISION FIX (FK constraint bug):
                        // Use ensureMemorySessionIdRegistered() instead of updateMemorySessionId() because:
                        // 1. It's idempotent - safe to call multiple times
                        // 2. It verifies the update happened (SELECT before UPDATE)
                        // 3. Consistent with ResponseProcessor's usage pattern
                        // This ensures FK constraint compliance BEFORE any observations are stored.
                        if (message.session_id && message.session_id !== session.memorySessionId) {
                            previousId = session.memorySessionId;
                            session.memorySessionId = message.session_id;
                            // Persist to database IMMEDIATELY for FK constraint compliance
                            // This must happen BEFORE any observations referencing this ID are stored
                            this.dbManager.getSessionStore().ensureMemorySessionIdRegistered(session.sessionDbId, message.session_id);
                            verification = this.dbManager.getSessionStore().getSessionById(session.sessionDbId);
                            dbVerified = (verification === null || verification === void 0 ? void 0 : verification.memory_session_id) === message.session_id;
                            logMessage = previousId
                                ? "MEMORY_ID_CHANGED | sessionDbId=".concat(session.sessionDbId, " | from=").concat(previousId, " | to=").concat(message.session_id, " | dbVerified=").concat(dbVerified)
                                : "MEMORY_ID_CAPTURED | sessionDbId=".concat(session.sessionDbId, " | memorySessionId=").concat(message.session_id, " | dbVerified=").concat(dbVerified);
                            logger_js_1.logger.info('SESSION', logMessage, {
                                sessionId: session.sessionDbId,
                                memorySessionId: message.session_id,
                                previousId: previousId
                            });
                            if (!dbVerified) {
                                logger_js_1.logger.error('SESSION', "MEMORY_ID_MISMATCH | sessionDbId=".concat(session.sessionDbId, " | expected=").concat(message.session_id, " | got=").concat(verification === null || verification === void 0 ? void 0 : verification.memory_session_id), {
                                    sessionId: session.sessionDbId
                                });
                            }
                            // Debug-level alignment log for detailed tracing
                            logger_js_1.logger.debug('SDK', "[ALIGNMENT] ".concat(previousId ? 'Updated' : 'Captured', " | contentSessionId=").concat(session.contentSessionId, " \u2192 memorySessionId=").concat(message.session_id, " | Future prompts will resume with this ID"));
                        }
                        if (!(message.type === 'assistant')) return [3 /*break*/, 7];
                        content = message.message.content;
                        textContent = Array.isArray(content)
                            ? content.filter(function (c) { return c.type === 'text'; }).map(function (c) { return c.text; }).join('\n')
                            : typeof content === 'string' ? content : '';
                        // Check for context overflow - prevents infinite retry loops
                        if (textContent.includes('prompt is too long') ||
                            textContent.includes('context window')) {
                            logger_js_1.logger.error('SDK', 'Context overflow detected - terminating session');
                            session.abortController.abort();
                            return [2 /*return*/];
                        }
                        responseSize = textContent.length;
                        tokensBeforeResponse = session.cumulativeInputTokens + session.cumulativeOutputTokens;
                        usage = message.message.usage;
                        if (usage) {
                            session.cumulativeInputTokens += usage.input_tokens || 0;
                            session.cumulativeOutputTokens += usage.output_tokens || 0;
                            // Cache creation counts as discovery, cache read doesn't
                            if (usage.cache_creation_input_tokens) {
                                session.cumulativeInputTokens += usage.cache_creation_input_tokens;
                            }
                            logger_js_1.logger.debug('SDK', 'Token usage captured', {
                                sessionId: session.sessionDbId,
                                inputTokens: usage.input_tokens,
                                outputTokens: usage.output_tokens,
                                cacheCreation: usage.cache_creation_input_tokens || 0,
                                cacheRead: usage.cache_read_input_tokens || 0,
                                cumulativeInput: session.cumulativeInputTokens,
                                cumulativeOutput: session.cumulativeOutputTokens
                            });
                        }
                        discoveryTokens = (session.cumulativeInputTokens + session.cumulativeOutputTokens) - tokensBeforeResponse;
                        originalTimestamp = session.earliestPendingTimestamp;
                        if (responseSize > 0) {
                            truncatedResponse = responseSize > 100
                                ? textContent.substring(0, 100) + '...'
                                : textContent;
                            logger_js_1.logger.dataOut('SDK', "Response received (".concat(responseSize, " chars)"), {
                                sessionId: session.sessionDbId,
                                promptNumber: session.lastPromptNumber
                            }, truncatedResponse);
                        }
                        // Detect fatal context overflow and terminate gracefully (issue #870)
                        if (typeof textContent === 'string' && textContent.includes('Prompt is too long')) {
                            throw new Error('Claude session context overflow: prompt is too long');
                        }
                        // Detect invalid API key — SDK returns this as response text, not an error.
                        // Throw so it surfaces in health endpoint and prevents silent failures.
                        if (typeof textContent === 'string' && textContent.includes('Invalid API key')) {
                            throw new Error('Invalid API key: check your API key configuration in ~/.claude-mem/settings.json or ~/.claude-mem/.env');
                        }
                        // Parse and process response using shared ResponseProcessor
                        return [4 /*yield*/, (0, index_js_1.processAgentResponse)(textContent, session, this.dbManager, this.sessionManager, worker, discoveryTokens, originalTimestamp, 'SDK', cwdTracker.lastCwd)];
                    case 6:
                        // Parse and process response using shared ResponseProcessor
                        _e.sent();
                        _e.label = 7;
                    case 7:
                        // Log result messages
                        if (message.type === 'result' && message.subtype === 'success') {
                            // Usage telemetry is captured at SDK level
                        }
                        _e.label = 8;
                    case 8:
                        _a = true;
                        return [3 /*break*/, 4];
                    case 9: return [3 /*break*/, 16];
                    case 10:
                        e_1_1 = _e.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 16];
                    case 11:
                        _e.trys.push([11, , 14, 15]);
                        if (!(!_a && !_b && (_c = queryResult_1.return))) return [3 /*break*/, 13];
                        return [4 /*yield*/, _c.call(queryResult_1)];
                    case 12:
                        _e.sent();
                        _e.label = 13;
                    case 13: return [3 /*break*/, 15];
                    case 14:
                        if (e_1) throw e_1.error;
                        return [7 /*endfinally*/];
                    case 15: return [7 /*endfinally*/];
                    case 16: return [3 /*break*/, 20];
                    case 17:
                        tracked = (0, ProcessRegistry_js_1.getProcessBySession)(session.sessionDbId);
                        if (!(tracked && tracked.process.exitCode === null)) return [3 /*break*/, 19];
                        return [4 /*yield*/, (0, ProcessRegistry_js_1.ensureProcessExit)(tracked, 5000)];
                    case 18:
                        _e.sent();
                        _e.label = 19;
                    case 19: return [7 /*endfinally*/];
                    case 20:
                        sessionDuration = Date.now() - session.startTime;
                        logger_js_1.logger.success('SDK', 'Agent completed', {
                            sessionId: session.sessionDbId,
                            duration: "".concat((sessionDuration / 1000).toFixed(1), "s")
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create event-driven message generator (yields messages from SessionManager)
     *
     * CRITICAL: CONTINUATION PROMPT LOGIC
     * ====================================
     * This is where NEW hook's dual-purpose nature comes together:
     *
     * - Prompt #1 (lastPromptNumber === 1): buildInitPrompt
     *   - Full initialization prompt with instructions
     *   - Sets up the SDK agent's context
     *
     * - Prompt #2+ (lastPromptNumber > 1): buildContinuationPrompt
     *   - Continuation prompt for same session
     *   - Includes session context and prompt number
     *
     * BOTH prompts receive session.contentSessionId:
     * - This comes from the hook's session_id (see new-hook.ts)
     * - Same session_id used by SAVE hook to store observations
     * - This is how everything stays connected in one unified session
     *
     * NO SESSION EXISTENCE CHECKS NEEDED:
     * - SessionManager.initializeSession already fetched this from database
     * - Database row was created by new-hook's createSDKSession call
     * - We just use the session_id we're given - simple and reliable
     *
     * SHARED CONVERSATION HISTORY:
     * - Each user message is added to session.conversationHistory
     * - This allows provider switching (Claude→Gemini) with full context
     * - SDK manages its own internal state, but we mirror it for interop
     *
     * CWD TRACKING:
     * - cwdTracker is a mutable object shared with startSession
     * - As messages with cwd are processed, cwdTracker.lastCwd is updated
     * - This enables processAgentResponse to use the correct cwd for CLAUDE.md
     */
    SDKAgent.prototype.createMessageGenerator = function (session, cwdTracker) {
        return __asyncGenerator(this, arguments, function createMessageGenerator_1() {
            var mode, isInitPrompt, initPrompt, _a, _b, _c, message, obsPrompt, summaryPrompt, e_2_1;
            var _d, e_2, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        mode = ModeManager_js_1.ModeManager.getInstance().getActiveMode();
                        isInitPrompt = session.lastPromptNumber === 1;
                        logger_js_1.logger.info('SDK', 'Creating message generator', {
                            sessionDbId: session.sessionDbId,
                            contentSessionId: session.contentSessionId,
                            lastPromptNumber: session.lastPromptNumber,
                            isInitPrompt: isInitPrompt,
                            promptType: isInitPrompt ? 'INIT' : 'CONTINUATION'
                        });
                        initPrompt = isInitPrompt
                            ? (0, prompts_js_1.buildInitPrompt)(session.project, session.contentSessionId, session.userPrompt, mode)
                            : (0, prompts_js_1.buildContinuationPrompt)(session.userPrompt, session.lastPromptNumber, session.contentSessionId, mode);
                        // Add to shared conversation history for provider interop
                        session.conversationHistory.push({ role: 'user', content: initPrompt });
                        return [4 /*yield*/, __await({
                                type: 'user',
                                message: {
                                    role: 'user',
                                    content: initPrompt
                                },
                                session_id: session.contentSessionId,
                                parent_tool_use_id: null,
                                isSynthetic: true
                            })];
                    case 1: 
                    // Yield initial user prompt with context (or continuation if prompt #2+)
                    // CRITICAL: Both paths use session.contentSessionId from the hook
                    return [4 /*yield*/, _g.sent()];
                    case 2:
                        // Yield initial user prompt with context (or continuation if prompt #2+)
                        // CRITICAL: Both paths use session.contentSessionId from the hook
                        _g.sent();
                        _g.label = 3;
                    case 3:
                        _g.trys.push([3, 13, 14, 19]);
                        _a = true, _b = __asyncValues(this.sessionManager.getMessageIterator(session.sessionDbId));
                        _g.label = 4;
                    case 4: return [4 /*yield*/, __await(_b.next())];
                    case 5:
                        if (!(_c = _g.sent(), _d = _c.done, !_d)) return [3 /*break*/, 12];
                        _f = _c.value;
                        _a = false;
                        message = _f;
                        // CLAIM-CONFIRM: Track message ID for confirmProcessed() after successful storage
                        // The message is now in 'processing' status in DB until ResponseProcessor calls confirmProcessed()
                        session.processingMessageIds.push(message._persistentId);
                        // Capture cwd from each message for worktree support
                        if (message.cwd) {
                            cwdTracker.lastCwd = message.cwd;
                        }
                        if (!(message.type === 'observation')) return [3 /*break*/, 8];
                        // Update last prompt number
                        if (message.prompt_number !== undefined) {
                            session.lastPromptNumber = message.prompt_number;
                        }
                        obsPrompt = (0, prompts_js_1.buildObservationPrompt)({
                            id: 0, // Not used in prompt
                            tool_name: message.tool_name,
                            tool_input: JSON.stringify(message.tool_input),
                            tool_output: JSON.stringify(message.tool_response),
                            created_at_epoch: Date.now(),
                            cwd: message.cwd
                        });
                        // Add to shared conversation history for provider interop
                        session.conversationHistory.push({ role: 'user', content: obsPrompt });
                        return [4 /*yield*/, __await({
                                type: 'user',
                                message: {
                                    role: 'user',
                                    content: obsPrompt
                                },
                                session_id: session.contentSessionId,
                                parent_tool_use_id: null,
                                isSynthetic: true
                            })];
                    case 6: return [4 /*yield*/, _g.sent()];
                    case 7:
                        _g.sent();
                        return [3 /*break*/, 11];
                    case 8:
                        if (!(message.type === 'summarize')) return [3 /*break*/, 11];
                        summaryPrompt = (0, prompts_js_1.buildSummaryPrompt)({
                            id: session.sessionDbId,
                            memory_session_id: session.memorySessionId,
                            project: session.project,
                            user_prompt: session.userPrompt,
                            last_assistant_message: message.last_assistant_message || ''
                        }, mode);
                        // Add to shared conversation history for provider interop
                        session.conversationHistory.push({ role: 'user', content: summaryPrompt });
                        return [4 /*yield*/, __await({
                                type: 'user',
                                message: {
                                    role: 'user',
                                    content: summaryPrompt
                                },
                                session_id: session.contentSessionId,
                                parent_tool_use_id: null,
                                isSynthetic: true
                            })];
                    case 9: return [4 /*yield*/, _g.sent()];
                    case 10:
                        _g.sent();
                        _g.label = 11;
                    case 11:
                        _a = true;
                        return [3 /*break*/, 4];
                    case 12: return [3 /*break*/, 19];
                    case 13:
                        e_2_1 = _g.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 19];
                    case 14:
                        _g.trys.push([14, , 17, 18]);
                        if (!(!_a && !_d && (_e = _b.return))) return [3 /*break*/, 16];
                        return [4 /*yield*/, __await(_e.call(_b))];
                    case 15:
                        _g.sent();
                        _g.label = 16;
                    case 16: return [3 /*break*/, 18];
                    case 17:
                        if (e_2) throw e_2.error;
                        return [7 /*endfinally*/];
                    case 18: return [7 /*endfinally*/];
                    case 19: return [2 /*return*/];
                }
            });
        });
    };
    // ============================================================================
    // Configuration Helpers
    // ============================================================================
    /**
     * Find Claude executable (inline, called once per session)
     */
    SDKAgent.prototype.findClaudeExecutable = function () {
        var settings = SettingsDefaultsManager_js_1.SettingsDefaultsManager.loadFromFile(paths_js_1.USER_SETTINGS_PATH);
        // 1. Check configured path
        if (settings.CLAUDE_CODE_PATH) {
            // Lazy load fs to keep startup fast
            var existsSync = require('fs').existsSync;
            if (!existsSync(settings.CLAUDE_CODE_PATH)) {
                throw new Error("CLAUDE_CODE_PATH is set to \"".concat(settings.CLAUDE_CODE_PATH, "\" but the file does not exist."));
            }
            return settings.CLAUDE_CODE_PATH;
        }
        // 2. On Windows, prefer "claude.cmd" via PATH to avoid spawn issues with spaces in paths
        if (process.platform === 'win32') {
            try {
                (0, child_process_1.execSync)('where claude.cmd', { encoding: 'utf8', windowsHide: true, stdio: ['ignore', 'pipe', 'ignore'] });
                return 'claude.cmd'; // Let Windows resolve via PATHEXT
            }
            catch (_a) {
                // Fall through to generic error
            }
        }
        // 3. Try auto-detection for non-Windows platforms
        try {
            var claudePath = (0, child_process_1.execSync)(process.platform === 'win32' ? 'where claude' : 'which claude', { encoding: 'utf8', windowsHide: true, stdio: ['ignore', 'pipe', 'ignore'] }).trim().split('\n')[0].trim();
            if (claudePath)
                return claudePath;
        }
        catch (error) {
            // [ANTI-PATTERN IGNORED]: Fallback behavior - which/where failed, continue to throw clear error
            logger_js_1.logger.debug('SDK', 'Claude executable auto-detection failed', {}, error);
        }
        throw new Error('Claude executable not found. Please either:\n1. Add "claude" to your system PATH, or\n2. Set CLAUDE_CODE_PATH in ~/.claude-mem/settings.json');
    };
    /**
     * Get model ID from settings or environment
     */
    SDKAgent.prototype.getModelId = function () {
        var settingsPath = path_1.default.join((0, os_1.homedir)(), '.claude-mem', 'settings.json');
        var settings = SettingsDefaultsManager_js_1.SettingsDefaultsManager.loadFromFile(settingsPath);
        return settings.CLAUDE_MEM_MODEL;
    };
    return SDKAgent;
}());
exports.SDKAgent = SDKAgent;
