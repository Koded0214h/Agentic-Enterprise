"use strict";
/**
 * Session Routes
 *
 * Handles session lifecycle operations: initialization, observations, summarization, completion.
 * These routes manage the flow of work through the Claude Agent SDK.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.SessionRoutes = void 0;
var worker_utils_js_1 = require("../../../../shared/worker-utils.js");
var logger_js_1 = require("../../../../utils/logger.js");
var tag_stripping_js_1 = require("../../../../utils/tag-stripping.js");
var GeminiAgent_js_1 = require("../../GeminiAgent.js");
var OpenRouterAgent_js_1 = require("../../OpenRouterAgent.js");
var BaseRouteHandler_js_1 = require("../BaseRouteHandler.js");
var SessionCompletionHandler_js_1 = require("../../session/SessionCompletionHandler.js");
var PrivacyCheckValidator_js_1 = require("../../validation/PrivacyCheckValidator.js");
var SettingsDefaultsManager_js_1 = require("../../../../shared/SettingsDefaultsManager.js");
var paths_js_1 = require("../../../../shared/paths.js");
var ProcessRegistry_js_1 = require("../../ProcessRegistry.js");
var SessionRoutes = /** @class */ (function (_super) {
    __extends(SessionRoutes, _super);
    function SessionRoutes(sessionManager, dbManager, sdkAgent, geminiAgent, openRouterAgent, eventBroadcaster, workerService) {
        var _this = _super.call(this) || this;
        _this.sessionManager = sessionManager;
        _this.dbManager = dbManager;
        _this.sdkAgent = sdkAgent;
        _this.geminiAgent = geminiAgent;
        _this.openRouterAgent = openRouterAgent;
        _this.eventBroadcaster = eventBroadcaster;
        _this.workerService = workerService;
        _this.spawnInProgress = new Map();
        _this.crashRecoveryScheduled = new Set();
        /**
         * Initialize a new session
         */
        _this.handleSessionInit = _this.wrapHandler(function (req, res) {
            var _a;
            var sessionDbId = _this.parseIntParam(req, res, 'sessionDbId');
            if (sessionDbId === null)
                return;
            var _b = req.body, userPrompt = _b.userPrompt, promptNumber = _b.promptNumber;
            logger_js_1.logger.info('HTTP', 'SessionRoutes: handleSessionInit called', {
                sessionDbId: sessionDbId,
                promptNumber: promptNumber,
                has_userPrompt: !!userPrompt
            });
            var session = _this.sessionManager.initializeSession(sessionDbId, userPrompt, promptNumber);
            // Get the latest user_prompt for this session to sync to Chroma
            var latestPrompt = _this.dbManager.getSessionStore().getLatestUserPrompt(session.contentSessionId);
            // Broadcast new prompt to SSE clients (for web UI)
            if (latestPrompt) {
                _this.eventBroadcaster.broadcastNewPrompt({
                    id: latestPrompt.id,
                    content_session_id: latestPrompt.content_session_id,
                    project: latestPrompt.project,
                    prompt_number: latestPrompt.prompt_number,
                    prompt_text: latestPrompt.prompt_text,
                    created_at_epoch: latestPrompt.created_at_epoch
                });
                // Sync user prompt to Chroma
                var chromaStart_1 = Date.now();
                var promptText_1 = latestPrompt.prompt_text;
                (_a = _this.dbManager.getChromaSync()) === null || _a === void 0 ? void 0 : _a.syncUserPrompt(latestPrompt.id, latestPrompt.memory_session_id, latestPrompt.project, promptText_1, latestPrompt.prompt_number, latestPrompt.created_at_epoch).then(function () {
                    var chromaDuration = Date.now() - chromaStart_1;
                    var truncatedPrompt = promptText_1.length > 60
                        ? promptText_1.substring(0, 60) + '...'
                        : promptText_1;
                    logger_js_1.logger.debug('CHROMA', 'User prompt synced', {
                        promptId: latestPrompt.id,
                        duration: "".concat(chromaDuration, "ms"),
                        prompt: truncatedPrompt
                    });
                }).catch(function (error) {
                    logger_js_1.logger.error('CHROMA', 'User prompt sync failed, continuing without vector search', {
                        promptId: latestPrompt.id,
                        prompt: promptText_1.length > 60 ? promptText_1.substring(0, 60) + '...' : promptText_1
                    }, error);
                });
            }
            // Idempotent: ensure generator is running (matches handleObservations / handleSummarize)
            _this.ensureGeneratorRunning(sessionDbId, 'init');
            // Broadcast session started event
            _this.eventBroadcaster.broadcastSessionStarted(sessionDbId, session.project);
            res.json({ status: 'initialized', sessionDbId: sessionDbId, port: (0, worker_utils_js_1.getWorkerPort)() });
        });
        /**
         * Queue observations for processing
         * CRITICAL: Ensures SDK agent is running to process the queue (ALWAYS SAVE EVERYTHING)
         */
        _this.handleObservations = _this.wrapHandler(function (req, res) {
            var sessionDbId = _this.parseIntParam(req, res, 'sessionDbId');
            if (sessionDbId === null)
                return;
            var _a = req.body, tool_name = _a.tool_name, tool_input = _a.tool_input, tool_response = _a.tool_response, prompt_number = _a.prompt_number, cwd = _a.cwd;
            _this.sessionManager.queueObservation(sessionDbId, {
                tool_name: tool_name,
                tool_input: tool_input,
                tool_response: tool_response,
                prompt_number: prompt_number,
                cwd: cwd
            });
            // CRITICAL: Ensure SDK agent is running to consume the queue
            _this.ensureGeneratorRunning(sessionDbId, 'observation');
            // Broadcast observation queued event
            _this.eventBroadcaster.broadcastObservationQueued(sessionDbId);
            res.json({ status: 'queued' });
        });
        /**
         * Queue summarize request
         * CRITICAL: Ensures SDK agent is running to process the queue (ALWAYS SAVE EVERYTHING)
         */
        _this.handleSummarize = _this.wrapHandler(function (req, res) {
            var sessionDbId = _this.parseIntParam(req, res, 'sessionDbId');
            if (sessionDbId === null)
                return;
            var last_assistant_message = req.body.last_assistant_message;
            _this.sessionManager.queueSummarize(sessionDbId, last_assistant_message);
            // CRITICAL: Ensure SDK agent is running to consume the queue
            _this.ensureGeneratorRunning(sessionDbId, 'summarize');
            // Broadcast summarize queued event
            _this.eventBroadcaster.broadcastSummarizeQueued();
            res.json({ status: 'queued' });
        });
        /**
         * Get session status
         */
        _this.handleSessionStatus = _this.wrapHandler(function (req, res) {
            var sessionDbId = _this.parseIntParam(req, res, 'sessionDbId');
            if (sessionDbId === null)
                return;
            var session = _this.sessionManager.getSession(sessionDbId);
            if (!session) {
                res.json({ status: 'not_found' });
                return;
            }
            // Use database count for accurate queue length (in-memory array is always empty due to FK constraint fix)
            var pendingStore = _this.sessionManager.getPendingMessageStore();
            var queueLength = pendingStore.getPendingCount(sessionDbId);
            res.json({
                status: 'active',
                sessionDbId: sessionDbId,
                project: session.project,
                queueLength: queueLength,
                uptime: Date.now() - session.startTime
            });
        });
        /**
         * Delete a session
         */
        _this.handleSessionDelete = _this.wrapHandler(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var sessionDbId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sessionDbId = this.parseIntParam(req, res, 'sessionDbId');
                        if (sessionDbId === null)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.completionHandler.completeByDbId(sessionDbId)];
                    case 1:
                        _a.sent();
                        res.json({ status: 'deleted' });
                        return [2 /*return*/];
                }
            });
        }); });
        /**
         * Complete a session (backward compatibility for cleanup-hook)
         * cleanup-hook expects POST /sessions/:sessionDbId/complete instead of DELETE
         */
        _this.handleSessionComplete = _this.wrapHandler(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var sessionDbId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sessionDbId = this.parseIntParam(req, res, 'sessionDbId');
                        if (sessionDbId === null)
                            return [2 /*return*/];
                        return [4 /*yield*/, this.completionHandler.completeByDbId(sessionDbId)];
                    case 1:
                        _a.sent();
                        res.json({ success: true });
                        return [2 /*return*/];
                }
            });
        }); });
        /**
         * Queue observations by contentSessionId (post-tool-use-hook uses this)
         * POST /api/sessions/observations
         * Body: { contentSessionId, tool_name, tool_input, tool_response, cwd }
         */
        _this.handleObservationsByClaudeId = _this.wrapHandler(function (req, res) {
            var _a = req.body, contentSessionId = _a.contentSessionId, tool_name = _a.tool_name, tool_input = _a.tool_input, tool_response = _a.tool_response, cwd = _a.cwd;
            if (!contentSessionId) {
                return _this.badRequest(res, 'Missing contentSessionId');
            }
            // Load skip tools from settings
            var settings = SettingsDefaultsManager_js_1.SettingsDefaultsManager.loadFromFile(paths_js_1.USER_SETTINGS_PATH);
            var skipTools = new Set(settings.CLAUDE_MEM_SKIP_TOOLS.split(',').map(function (t) { return t.trim(); }).filter(Boolean));
            // Skip low-value or meta tools
            if (skipTools.has(tool_name)) {
                logger_js_1.logger.debug('SESSION', 'Skipping observation for tool', { tool_name: tool_name });
                res.json({ status: 'skipped', reason: 'tool_excluded' });
                return;
            }
            // Skip meta-observations: file operations on session-memory files
            var fileOperationTools = new Set(['Edit', 'Write', 'Read', 'NotebookEdit']);
            if (fileOperationTools.has(tool_name) && tool_input) {
                var filePath = tool_input.file_path || tool_input.notebook_path;
                if (filePath && filePath.includes('session-memory')) {
                    logger_js_1.logger.debug('SESSION', 'Skipping meta-observation for session-memory file', {
                        tool_name: tool_name,
                        file_path: filePath
                    });
                    res.json({ status: 'skipped', reason: 'session_memory_meta' });
                    return;
                }
            }
            try {
                var store = _this.dbManager.getSessionStore();
                // Get or create session
                var sessionDbId_1 = store.createSDKSession(contentSessionId, '', '');
                var promptNumber = store.getPromptNumberFromUserPrompts(contentSessionId);
                // Privacy check: skip if user prompt was entirely private
                var userPrompt = PrivacyCheckValidator_js_1.PrivacyCheckValidator.checkUserPromptPrivacy(store, contentSessionId, promptNumber, 'observation', sessionDbId_1, { tool_name: tool_name });
                if (!userPrompt) {
                    res.json({ status: 'skipped', reason: 'private' });
                    return;
                }
                // Strip memory tags from tool_input and tool_response
                var cleanedToolInput = tool_input !== undefined
                    ? (0, tag_stripping_js_1.stripMemoryTagsFromJson)(JSON.stringify(tool_input))
                    : '{}';
                var cleanedToolResponse = tool_response !== undefined
                    ? (0, tag_stripping_js_1.stripMemoryTagsFromJson)(JSON.stringify(tool_response))
                    : '{}';
                // Queue observation
                _this.sessionManager.queueObservation(sessionDbId_1, {
                    tool_name: tool_name,
                    tool_input: cleanedToolInput,
                    tool_response: cleanedToolResponse,
                    prompt_number: promptNumber,
                    cwd: cwd || (function () {
                        logger_js_1.logger.error('SESSION', 'Missing cwd when queueing observation in SessionRoutes', {
                            sessionId: sessionDbId_1,
                            tool_name: tool_name
                        });
                        return '';
                    })()
                });
                // Ensure SDK agent is running
                _this.ensureGeneratorRunning(sessionDbId_1, 'observation');
                // Broadcast observation queued event
                _this.eventBroadcaster.broadcastObservationQueued(sessionDbId_1);
                res.json({ status: 'queued' });
            }
            catch (error) {
                // Return 200 on recoverable errors so the hook doesn't break
                logger_js_1.logger.error('SESSION', 'Observation storage failed', { contentSessionId: contentSessionId, tool_name: tool_name }, error);
                res.json({ stored: false, reason: error.message });
            }
        });
        /**
         * Queue summarize by contentSessionId (summary-hook uses this)
         * POST /api/sessions/summarize
         * Body: { contentSessionId, last_assistant_message }
         *
         * Checks privacy, queues summarize request for SDK agent
         */
        _this.handleSummarizeByClaudeId = _this.wrapHandler(function (req, res) {
            var _a = req.body, contentSessionId = _a.contentSessionId, last_assistant_message = _a.last_assistant_message;
            if (!contentSessionId) {
                return _this.badRequest(res, 'Missing contentSessionId');
            }
            var store = _this.dbManager.getSessionStore();
            // Get or create session
            var sessionDbId = store.createSDKSession(contentSessionId, '', '');
            var promptNumber = store.getPromptNumberFromUserPrompts(contentSessionId);
            // Privacy check: skip if user prompt was entirely private
            var userPrompt = PrivacyCheckValidator_js_1.PrivacyCheckValidator.checkUserPromptPrivacy(store, contentSessionId, promptNumber, 'summarize', sessionDbId);
            if (!userPrompt) {
                res.json({ status: 'skipped', reason: 'private' });
                return;
            }
            // Queue summarize
            _this.sessionManager.queueSummarize(sessionDbId, last_assistant_message);
            // Ensure SDK agent is running
            _this.ensureGeneratorRunning(sessionDbId, 'summarize');
            // Broadcast summarize queued event
            _this.eventBroadcaster.broadcastSummarizeQueued();
            res.json({ status: 'queued' });
        });
        /**
         * Complete session by contentSessionId (session-complete hook uses this)
         * POST /api/sessions/complete
         * Body: { contentSessionId }
         *
         * Removes session from active sessions map, allowing orphan reaper to
         * clean up any remaining subprocesses.
         *
         * Fixes Issue #842: Sessions stay in map forever, reaper thinks all active.
         */
        _this.handleCompleteByClaudeId = _this.wrapHandler(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var contentSessionId, store, sessionDbId, activeSession;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contentSessionId = req.body.contentSessionId;
                        logger_js_1.logger.info('HTTP', '→ POST /api/sessions/complete', { contentSessionId: contentSessionId });
                        if (!contentSessionId) {
                            return [2 /*return*/, this.badRequest(res, 'Missing contentSessionId')];
                        }
                        store = this.dbManager.getSessionStore();
                        sessionDbId = store.createSDKSession(contentSessionId, '', '');
                        activeSession = this.sessionManager.getSession(sessionDbId);
                        if (!activeSession) {
                            // Session may not be in memory (already completed or never initialized)
                            logger_js_1.logger.debug('SESSION', 'session-complete: Session not in active map', {
                                contentSessionId: contentSessionId,
                                sessionDbId: sessionDbId
                            });
                            res.json({ status: 'skipped', reason: 'not_active' });
                            return [2 /*return*/];
                        }
                        // Complete the session (removes from active sessions map)
                        return [4 /*yield*/, this.completionHandler.completeByDbId(sessionDbId)];
                    case 1:
                        // Complete the session (removes from active sessions map)
                        _a.sent();
                        logger_js_1.logger.info('SESSION', 'Session completed via API', {
                            contentSessionId: contentSessionId,
                            sessionDbId: sessionDbId
                        });
                        res.json({ status: 'completed', sessionDbId: sessionDbId });
                        return [2 /*return*/];
                }
            });
        }); });
        /**
         * Initialize session by contentSessionId (new-hook uses this)
         * POST /api/sessions/init
         * Body: { contentSessionId, project, prompt }
         *
         * Performs all session initialization DB operations:
         * - Creates/gets SDK session (idempotent)
         * - Increments prompt counter
         * - Saves user prompt (with privacy tag stripping)
         *
         * Returns: { sessionDbId, promptNumber, skipped: boolean, reason?: string }
         */
        _this.handleSessionInitByClaudeId = _this.wrapHandler(function (req, res) {
            var contentSessionId = req.body.contentSessionId;
            // Only contentSessionId is truly required — Cursor and other platforms
            // may omit prompt/project in their payload (#838, #1049)
            var project = req.body.project || 'unknown';
            var prompt = req.body.prompt || '[media prompt]';
            var customTitle = req.body.customTitle || undefined;
            logger_js_1.logger.info('HTTP', 'SessionRoutes: handleSessionInitByClaudeId called', {
                contentSessionId: contentSessionId,
                project: project,
                prompt_length: prompt === null || prompt === void 0 ? void 0 : prompt.length,
                customTitle: customTitle
            });
            // Validate required parameters
            if (!_this.validateRequired(req, res, ['contentSessionId'])) {
                return;
            }
            var store = _this.dbManager.getSessionStore();
            // Step 1: Create/get SDK session (idempotent INSERT OR IGNORE)
            var sessionDbId = store.createSDKSession(contentSessionId, project, prompt, customTitle);
            // Verify session creation with DB lookup
            var dbSession = store.getSessionById(sessionDbId);
            var isNewSession = !(dbSession === null || dbSession === void 0 ? void 0 : dbSession.memory_session_id);
            logger_js_1.logger.info('SESSION', "CREATED | contentSessionId=".concat(contentSessionId, " \u2192 sessionDbId=").concat(sessionDbId, " | isNew=").concat(isNewSession, " | project=").concat(project), {
                sessionId: sessionDbId
            });
            // Step 2: Get next prompt number from user_prompts count
            var currentCount = store.getPromptNumberFromUserPrompts(contentSessionId);
            var promptNumber = currentCount + 1;
            // Debug-level alignment logs for detailed tracing
            var memorySessionId = (dbSession === null || dbSession === void 0 ? void 0 : dbSession.memory_session_id) || null;
            if (promptNumber > 1) {
                logger_js_1.logger.debug('HTTP', "[ALIGNMENT] DB Lookup Proof | contentSessionId=".concat(contentSessionId, " \u2192 memorySessionId=").concat(memorySessionId || '(not yet captured)', " | prompt#=").concat(promptNumber));
            }
            else {
                logger_js_1.logger.debug('HTTP', "[ALIGNMENT] New Session | contentSessionId=".concat(contentSessionId, " | prompt#=").concat(promptNumber, " | memorySessionId will be captured on first SDK response"));
            }
            // Step 3: Strip privacy tags from prompt
            var cleanedPrompt = (0, tag_stripping_js_1.stripMemoryTagsFromPrompt)(prompt);
            // Step 4: Check if prompt is entirely private
            if (!cleanedPrompt || cleanedPrompt.trim() === '') {
                logger_js_1.logger.debug('HOOK', 'Session init - prompt entirely private', {
                    sessionId: sessionDbId,
                    promptNumber: promptNumber,
                    originalLength: prompt.length
                });
                res.json({
                    sessionDbId: sessionDbId,
                    promptNumber: promptNumber,
                    skipped: true,
                    reason: 'private'
                });
                return;
            }
            // Step 5: Save cleaned user prompt
            store.saveUserPrompt(contentSessionId, promptNumber, cleanedPrompt);
            // Step 6: Check if SDK agent is already running for this session (#1079)
            // If contextInjected is true, the hook should skip re-initializing the SDK agent
            var contextInjected = _this.sessionManager.getSession(sessionDbId) !== undefined;
            // Debug-level log since CREATED already logged the key info
            logger_js_1.logger.debug('SESSION', 'User prompt saved', {
                sessionId: sessionDbId,
                promptNumber: promptNumber,
                contextInjected: contextInjected
            });
            res.json({
                sessionDbId: sessionDbId,
                promptNumber: promptNumber,
                skipped: false,
                contextInjected: contextInjected
            });
        });
        _this.completionHandler = new SessionCompletionHandler_js_1.SessionCompletionHandler(sessionManager, eventBroadcaster);
        return _this;
    }
    /**
     * Get the appropriate agent based on settings
     * Throws error if provider is selected but not configured (no silent fallback)
     *
     * Note: Session linking via contentSessionId allows provider switching mid-session.
     * The conversationHistory on ActiveSession maintains context across providers.
     */
    SessionRoutes.prototype.getActiveAgent = function () {
        if ((0, OpenRouterAgent_js_1.isOpenRouterSelected)()) {
            if ((0, OpenRouterAgent_js_1.isOpenRouterAvailable)()) {
                logger_js_1.logger.debug('SESSION', 'Using OpenRouter agent');
                return this.openRouterAgent;
            }
            else {
                throw new Error('OpenRouter provider selected but no API key configured. Set CLAUDE_MEM_OPENROUTER_API_KEY in settings or OPENROUTER_API_KEY environment variable.');
            }
        }
        if ((0, GeminiAgent_js_1.isGeminiSelected)()) {
            if ((0, GeminiAgent_js_1.isGeminiAvailable)()) {
                logger_js_1.logger.debug('SESSION', 'Using Gemini agent');
                return this.geminiAgent;
            }
            else {
                throw new Error('Gemini provider selected but no API key configured. Set CLAUDE_MEM_GEMINI_API_KEY in settings or GEMINI_API_KEY environment variable.');
            }
        }
        return this.sdkAgent;
    };
    /**
     * Get the currently selected provider name
     */
    SessionRoutes.prototype.getSelectedProvider = function () {
        if ((0, OpenRouterAgent_js_1.isOpenRouterSelected)() && (0, OpenRouterAgent_js_1.isOpenRouterAvailable)()) {
            return 'openrouter';
        }
        return ((0, GeminiAgent_js_1.isGeminiSelected)() && (0, GeminiAgent_js_1.isGeminiAvailable)()) ? 'gemini' : 'claude';
    };
    SessionRoutes.prototype.ensureGeneratorRunning = function (sessionDbId, source) {
        var session = this.sessionManager.getSession(sessionDbId);
        if (!session)
            return;
        // GUARD: Prevent duplicate spawns
        if (this.spawnInProgress.get(sessionDbId)) {
            logger_js_1.logger.debug('SESSION', 'Spawn already in progress, skipping', { sessionDbId: sessionDbId, source: source });
            return;
        }
        var selectedProvider = this.getSelectedProvider();
        // Start generator if not running
        if (!session.generatorPromise) {
            this.spawnInProgress.set(sessionDbId, true);
            this.startGeneratorWithProvider(session, selectedProvider, source);
            return;
        }
        // Generator is running - check if stale (no activity for 30s) to prevent queue stall (#1099)
        var timeSinceActivity = Date.now() - session.lastGeneratorActivity;
        if (timeSinceActivity > SessionRoutes.STALE_GENERATOR_THRESHOLD_MS) {
            logger_js_1.logger.warn('SESSION', 'Stale generator detected, aborting to prevent queue stall (#1099)', {
                sessionId: sessionDbId,
                timeSinceActivityMs: timeSinceActivity,
                thresholdMs: SessionRoutes.STALE_GENERATOR_THRESHOLD_MS,
                source: source
            });
            // Abort the stale generator and reset state
            session.abortController.abort();
            session.generatorPromise = null;
            session.abortController = new AbortController();
            session.lastGeneratorActivity = Date.now();
            // Start a fresh generator
            this.spawnInProgress.set(sessionDbId, true);
            this.startGeneratorWithProvider(session, selectedProvider, 'stale-recovery');
            return;
        }
        // Generator is running - check if provider changed
        if (session.currentProvider && session.currentProvider !== selectedProvider) {
            logger_js_1.logger.info('SESSION', "Provider changed, will switch after current generator finishes", {
                sessionId: sessionDbId,
                currentProvider: session.currentProvider,
                selectedProvider: selectedProvider,
                historyLength: session.conversationHistory.length
            });
            // Let current generator finish naturally, next one will use new provider
            // The shared conversationHistory ensures context is preserved
        }
    };
    /**
     * Start a generator with the specified provider
     */
    SessionRoutes.prototype.startGeneratorWithProvider = function (session, provider, source) {
        var _this = this;
        if (!session)
            return;
        // Reset AbortController if it was previously aborted
        // This fixes the bug where a session gets stuck in an infinite "Generator aborted" loop
        // after its AbortController was aborted (e.g., from a previous generator exit)
        if (session.abortController.signal.aborted) {
            logger_js_1.logger.debug('SESSION', 'Resetting aborted AbortController before starting generator', {
                sessionId: session.sessionDbId
            });
            session.abortController = new AbortController();
        }
        var agent = provider === 'openrouter' ? this.openRouterAgent : (provider === 'gemini' ? this.geminiAgent : this.sdkAgent);
        var agentName = provider === 'openrouter' ? 'OpenRouter' : (provider === 'gemini' ? 'Gemini' : 'Claude SDK');
        // Use database count for accurate telemetry (in-memory array is always empty due to FK constraint fix)
        var pendingStore = this.sessionManager.getPendingMessageStore();
        var actualQueueDepth = pendingStore.getPendingCount(session.sessionDbId);
        logger_js_1.logger.info('SESSION', "Generator auto-starting (".concat(source, ") using ").concat(agentName), {
            sessionId: session.sessionDbId,
            queueDepth: actualQueueDepth,
            historyLength: session.conversationHistory.length
        });
        // Track which provider is running and mark activity for stale detection (#1099)
        session.currentProvider = provider;
        session.lastGeneratorActivity = Date.now();
        session.generatorPromise = agent.startSession(session, this.workerService)
            .catch(function (error) {
            // Only log non-abort errors
            if (session.abortController.signal.aborted)
                return;
            logger_js_1.logger.error('SESSION', "Generator failed", {
                sessionId: session.sessionDbId,
                provider: provider,
                error: error.message
            }, error);
            // Mark all processing messages as failed so they can be retried or abandoned
            var pendingStore = _this.sessionManager.getPendingMessageStore();
            try {
                var failedCount = pendingStore.markSessionMessagesFailed(session.sessionDbId);
                if (failedCount > 0) {
                    logger_js_1.logger.error('SESSION', "Marked messages as failed after generator error", {
                        sessionId: session.sessionDbId,
                        failedCount: failedCount
                    });
                }
            }
            catch (dbError) {
                logger_js_1.logger.error('SESSION', 'Failed to mark messages as failed', {
                    sessionId: session.sessionDbId
                }, dbError);
            }
        })
            .finally(function () { return __awaiter(_this, void 0, void 0, function () {
            var tracked, sessionDbId, wasAborted, pendingStore_1, pendingCount, MAX_CONSECUTIVE_RESTARTS, oldController, backoffMs;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tracked = (0, ProcessRegistry_js_1.getProcessBySession)(session.sessionDbId);
                        if (!(tracked && !tracked.process.killed && tracked.process.exitCode === null)) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0, ProcessRegistry_js_1.ensureProcessExit)(tracked, 5000)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        sessionDbId = session.sessionDbId;
                        this.spawnInProgress.delete(sessionDbId);
                        wasAborted = session.abortController.signal.aborted;
                        if (wasAborted) {
                            logger_js_1.logger.info('SESSION', "Generator aborted", { sessionId: sessionDbId });
                        }
                        else {
                            logger_js_1.logger.error('SESSION', "Generator exited unexpectedly", { sessionId: sessionDbId });
                        }
                        session.generatorPromise = null;
                        session.currentProvider = null;
                        this.workerService.broadcastProcessingStatus();
                        // Crash recovery: If not aborted and still has work, restart (with limit)
                        if (!wasAborted) {
                            try {
                                pendingStore_1 = this.sessionManager.getPendingMessageStore();
                                pendingCount = pendingStore_1.getPendingCount(sessionDbId);
                                MAX_CONSECUTIVE_RESTARTS = 3;
                                if (pendingCount > 0) {
                                    // GUARD: Prevent duplicate crash recovery spawns
                                    if (this.crashRecoveryScheduled.has(sessionDbId)) {
                                        logger_js_1.logger.debug('SESSION', 'Crash recovery already scheduled', { sessionDbId: sessionDbId });
                                        return [2 /*return*/];
                                    }
                                    session.consecutiveRestarts = (session.consecutiveRestarts || 0) + 1;
                                    if (session.consecutiveRestarts > MAX_CONSECUTIVE_RESTARTS) {
                                        logger_js_1.logger.error('SESSION', "CRITICAL: Generator restart limit exceeded - stopping to prevent runaway costs", {
                                            sessionId: sessionDbId,
                                            pendingCount: pendingCount,
                                            consecutiveRestarts: session.consecutiveRestarts,
                                            maxRestarts: MAX_CONSECUTIVE_RESTARTS,
                                            action: 'Generator will NOT restart. Check logs for root cause. Messages remain in pending state.'
                                        });
                                        // Don't restart - abort to prevent further API calls
                                        session.abortController.abort();
                                        return [2 /*return*/];
                                    }
                                    logger_js_1.logger.info('SESSION', "Restarting generator after crash/exit with pending work", {
                                        sessionId: sessionDbId,
                                        pendingCount: pendingCount,
                                        consecutiveRestarts: session.consecutiveRestarts,
                                        maxRestarts: MAX_CONSECUTIVE_RESTARTS
                                    });
                                    oldController = session.abortController;
                                    session.abortController = new AbortController();
                                    oldController.abort();
                                    this.crashRecoveryScheduled.add(sessionDbId);
                                    backoffMs = Math.min(1000 * Math.pow(2, session.consecutiveRestarts - 1), 8000);
                                    // Delay before restart with exponential backoff
                                    setTimeout(function () {
                                        _this.crashRecoveryScheduled.delete(sessionDbId);
                                        var stillExists = _this.sessionManager.getSession(sessionDbId);
                                        if (stillExists && !stillExists.generatorPromise) {
                                            _this.startGeneratorWithProvider(stillExists, _this.getSelectedProvider(), 'crash-recovery');
                                        }
                                    }, backoffMs);
                                }
                                else {
                                    // No pending work - abort to kill the child process
                                    session.abortController.abort();
                                    // Reset restart counter on successful completion
                                    session.consecutiveRestarts = 0;
                                    logger_js_1.logger.debug('SESSION', 'Aborted controller after natural completion', {
                                        sessionId: sessionDbId
                                    });
                                }
                            }
                            catch (e) {
                                // Ignore errors during recovery check, but still abort to prevent leaks
                                logger_js_1.logger.debug('SESSION', 'Error during recovery check, aborting to prevent leaks', { sessionId: sessionDbId, error: e instanceof Error ? e.message : String(e) });
                                session.abortController.abort();
                            }
                        }
                        return [2 /*return*/];
                }
            });
        }); });
    };
    SessionRoutes.prototype.setupRoutes = function (app) {
        // Legacy session endpoints (use sessionDbId)
        app.post('/sessions/:sessionDbId/init', this.handleSessionInit.bind(this));
        app.post('/sessions/:sessionDbId/observations', this.handleObservations.bind(this));
        app.post('/sessions/:sessionDbId/summarize', this.handleSummarize.bind(this));
        app.get('/sessions/:sessionDbId/status', this.handleSessionStatus.bind(this));
        app.delete('/sessions/:sessionDbId', this.handleSessionDelete.bind(this));
        app.post('/sessions/:sessionDbId/complete', this.handleSessionComplete.bind(this));
        // New session endpoints (use contentSessionId)
        app.post('/api/sessions/init', this.handleSessionInitByClaudeId.bind(this));
        app.post('/api/sessions/observations', this.handleObservationsByClaudeId.bind(this));
        app.post('/api/sessions/summarize', this.handleSummarizeByClaudeId.bind(this));
        app.post('/api/sessions/complete', this.handleCompleteByClaudeId.bind(this));
    };
    /**
     * Ensures agent generator is running for a session
     * Auto-starts if not already running to process pending queue
     * Uses either Claude SDK or Gemini based on settings
     *
     * Provider switching: If provider setting changed while generator is running,
     * we let the current generator finish naturally (max 5s linger timeout).
     * The next generator will use the new provider with shared conversationHistory.
     */
    SessionRoutes.STALE_GENERATOR_THRESHOLD_MS = 30000; // 30 seconds (#1099)
    return SessionRoutes;
}(BaseRouteHandler_js_1.BaseRouteHandler));
exports.SessionRoutes = SessionRoutes;
