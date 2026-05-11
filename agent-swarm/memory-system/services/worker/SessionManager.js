"use strict";
/**
 * SessionManager: Event-driven session lifecycle
 *
 * Responsibility:
 * - Manage active session lifecycle
 * - Handle event-driven message queues
 * - Coordinate between HTTP requests and SDK agent
 * - Zero-latency event notification (no polling)
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
exports.SessionManager = void 0;
var events_1 = require("events");
var logger_js_1 = require("../../utils/logger.js");
var PendingMessageStore_js_1 = require("../sqlite/PendingMessageStore.js");
var SessionQueueProcessor_js_1 = require("../queue/SessionQueueProcessor.js");
var ProcessRegistry_js_1 = require("./ProcessRegistry.js");
var index_js_1 = require("../../supervisor/index.js");
var SessionManager = /** @class */ (function () {
    function SessionManager(dbManager) {
        this.sessions = new Map();
        this.sessionQueues = new Map();
        this.pendingStore = null;
        this.dbManager = dbManager;
    }
    /**
     * Get or create PendingMessageStore (lazy initialization to avoid circular dependency)
     */
    SessionManager.prototype.getPendingStore = function () {
        if (!this.pendingStore) {
            var sessionStore = this.dbManager.getSessionStore();
            this.pendingStore = new PendingMessageStore_js_1.PendingMessageStore(sessionStore.db, 3);
        }
        return this.pendingStore;
    };
    /**
     * Set callback to be called when a session is deleted (for broadcasting status)
     */
    SessionManager.prototype.setOnSessionDeleted = function (callback) {
        this.onSessionDeletedCallback = callback;
    };
    /**
     * Initialize a new session or return existing one
     */
    SessionManager.prototype.initializeSession = function (sessionDbId, currentUserPrompt, promptNumber) {
        logger_js_1.logger.debug('SESSION', 'initializeSession called', {
            sessionDbId: sessionDbId,
            promptNumber: promptNumber,
            has_currentUserPrompt: !!currentUserPrompt
        });
        // Check if already active
        var session = this.sessions.get(sessionDbId);
        if (session) {
            logger_js_1.logger.debug('SESSION', 'Returning cached session', {
                sessionDbId: sessionDbId,
                contentSessionId: session.contentSessionId,
                lastPromptNumber: session.lastPromptNumber
            });
            // Refresh project from database in case it was updated by new-hook
            // This fixes the bug where sessions created with empty project get updated
            // in the database but the in-memory session still has the stale empty value
            var dbSession_1 = this.dbManager.getSessionById(sessionDbId);
            if (dbSession_1.project && dbSession_1.project !== session.project) {
                logger_js_1.logger.debug('SESSION', 'Updating project from database', {
                    sessionDbId: sessionDbId,
                    oldProject: session.project,
                    newProject: dbSession_1.project
                });
                session.project = dbSession_1.project;
            }
            // Update userPrompt for continuation prompts
            if (currentUserPrompt) {
                logger_js_1.logger.debug('SESSION', 'Updating userPrompt for continuation', {
                    sessionDbId: sessionDbId,
                    promptNumber: promptNumber,
                    oldPrompt: session.userPrompt.substring(0, 80),
                    newPrompt: currentUserPrompt.substring(0, 80)
                });
                session.userPrompt = currentUserPrompt;
                session.lastPromptNumber = promptNumber || session.lastPromptNumber;
            }
            else {
                logger_js_1.logger.debug('SESSION', 'No currentUserPrompt provided for existing session', {
                    sessionDbId: sessionDbId,
                    promptNumber: promptNumber,
                    usingCachedPrompt: session.userPrompt.substring(0, 80)
                });
            }
            return session;
        }
        // Fetch from database
        var dbSession = this.dbManager.getSessionById(sessionDbId);
        logger_js_1.logger.debug('SESSION', 'Fetched session from database', {
            sessionDbId: sessionDbId,
            content_session_id: dbSession.content_session_id,
            memory_session_id: dbSession.memory_session_id
        });
        // Log warning if we're discarding a stale memory_session_id (Issue #817)
        if (dbSession.memory_session_id) {
            logger_js_1.logger.warn('SESSION', "Discarding stale memory_session_id from previous worker instance (Issue #817)", {
                sessionDbId: sessionDbId,
                staleMemorySessionId: dbSession.memory_session_id,
                reason: 'SDK context lost on worker restart - will capture new ID'
            });
        }
        // Use currentUserPrompt if provided, otherwise fall back to database (first prompt)
        var userPrompt = currentUserPrompt || dbSession.user_prompt;
        if (!currentUserPrompt) {
            logger_js_1.logger.debug('SESSION', 'No currentUserPrompt provided for new session, using database', {
                sessionDbId: sessionDbId,
                promptNumber: promptNumber,
                dbPrompt: dbSession.user_prompt.substring(0, 80)
            });
        }
        else {
            logger_js_1.logger.debug('SESSION', 'Initializing session with fresh userPrompt', {
                sessionDbId: sessionDbId,
                promptNumber: promptNumber,
                userPrompt: currentUserPrompt.substring(0, 80)
            });
        }
        // Create active session
        // CRITICAL: Do NOT load memorySessionId from database here (Issue #817)
        // When creating a new in-memory session, any database memory_session_id is STALE
        // because the SDK context was lost when the worker restarted. The SDK agent will
        // capture a new memorySessionId on the first response and persist it.
        // Loading stale memory_session_id causes "No conversation found" crashes on resume.
        session = {
            sessionDbId: sessionDbId,
            contentSessionId: dbSession.content_session_id,
            memorySessionId: null, // Always start fresh - SDK will capture new ID
            project: dbSession.project,
            userPrompt: userPrompt,
            pendingMessages: [],
            abortController: new AbortController(),
            generatorPromise: null,
            lastPromptNumber: promptNumber || this.dbManager.getSessionStore().getPromptNumberFromUserPrompts(dbSession.content_session_id),
            startTime: Date.now(),
            cumulativeInputTokens: 0,
            cumulativeOutputTokens: 0,
            earliestPendingTimestamp: null,
            conversationHistory: [], // Initialize empty - will be populated by agents
            currentProvider: null, // Will be set when generator starts
            consecutiveRestarts: 0, // Track consecutive restart attempts to prevent infinite loops
            processingMessageIds: [], // CLAIM-CONFIRM: Track message IDs for confirmProcessed()
            lastGeneratorActivity: Date.now() // Initialize for stale detection (Issue #1099)
        };
        logger_js_1.logger.debug('SESSION', 'Creating new session object (memorySessionId cleared to prevent stale resume)', {
            sessionDbId: sessionDbId,
            contentSessionId: dbSession.content_session_id,
            dbMemorySessionId: dbSession.memory_session_id || '(none in DB)',
            memorySessionId: '(cleared - will capture fresh from SDK)',
            lastPromptNumber: promptNumber || this.dbManager.getSessionStore().getPromptNumberFromUserPrompts(dbSession.content_session_id)
        });
        this.sessions.set(sessionDbId, session);
        // Create event emitter for queue notifications
        var emitter = new events_1.EventEmitter();
        this.sessionQueues.set(sessionDbId, emitter);
        logger_js_1.logger.info('SESSION', 'Session initialized', {
            sessionId: sessionDbId,
            project: session.project,
            contentSessionId: session.contentSessionId,
            queueDepth: 0,
            hasGenerator: false
        });
        return session;
    };
    /**
     * Get active session by ID
     */
    SessionManager.prototype.getSession = function (sessionDbId) {
        return this.sessions.get(sessionDbId);
    };
    /**
     * Queue an observation for processing (zero-latency notification)
     * Auto-initializes session if not in memory but exists in database
     *
     * CRITICAL: Persists to database FIRST before adding to in-memory queue.
     * This ensures observations survive worker crashes.
     */
    SessionManager.prototype.queueObservation = function (sessionDbId, data) {
        // Auto-initialize from database if needed (handles worker restarts)
        var session = this.sessions.get(sessionDbId);
        if (!session) {
            session = this.initializeSession(sessionDbId);
        }
        // CRITICAL: Persist to database FIRST
        var message = {
            type: 'observation',
            tool_name: data.tool_name,
            tool_input: data.tool_input,
            tool_response: data.tool_response,
            prompt_number: data.prompt_number,
            cwd: data.cwd
        };
        try {
            var messageId = this.getPendingStore().enqueue(sessionDbId, session.contentSessionId, message);
            var queueDepth = this.getPendingStore().getPendingCount(sessionDbId);
            var toolSummary = logger_js_1.logger.formatTool(data.tool_name, data.tool_input);
            logger_js_1.logger.info('QUEUE', "ENQUEUED | sessionDbId=".concat(sessionDbId, " | messageId=").concat(messageId, " | type=observation | tool=").concat(toolSummary, " | depth=").concat(queueDepth), {
                sessionId: sessionDbId
            });
        }
        catch (error) {
            logger_js_1.logger.error('SESSION', 'Failed to persist observation to DB', {
                sessionId: sessionDbId,
                tool: data.tool_name
            }, error);
            throw error; // Don't continue if we can't persist
        }
        // Notify generator immediately (zero latency)
        var emitter = this.sessionQueues.get(sessionDbId);
        emitter === null || emitter === void 0 ? void 0 : emitter.emit('message');
    };
    /**
     * Queue a summarize request (zero-latency notification)
     * Auto-initializes session if not in memory but exists in database
     *
     * CRITICAL: Persists to database FIRST before adding to in-memory queue.
     * This ensures summarize requests survive worker crashes.
     */
    SessionManager.prototype.queueSummarize = function (sessionDbId, lastAssistantMessage) {
        // Auto-initialize from database if needed (handles worker restarts)
        var session = this.sessions.get(sessionDbId);
        if (!session) {
            session = this.initializeSession(sessionDbId);
        }
        // CRITICAL: Persist to database FIRST
        var message = {
            type: 'summarize',
            last_assistant_message: lastAssistantMessage
        };
        try {
            var messageId = this.getPendingStore().enqueue(sessionDbId, session.contentSessionId, message);
            var queueDepth = this.getPendingStore().getPendingCount(sessionDbId);
            logger_js_1.logger.info('QUEUE', "ENQUEUED | sessionDbId=".concat(sessionDbId, " | messageId=").concat(messageId, " | type=summarize | depth=").concat(queueDepth), {
                sessionId: sessionDbId
            });
        }
        catch (error) {
            logger_js_1.logger.error('SESSION', 'Failed to persist summarize to DB', {
                sessionId: sessionDbId
            }, error);
            throw error; // Don't continue if we can't persist
        }
        var emitter = this.sessionQueues.get(sessionDbId);
        emitter === null || emitter === void 0 ? void 0 : emitter.emit('message');
    };
    /**
     * Delete a session (abort SDK agent and cleanup)
     * Verifies subprocess exit to prevent zombie process accumulation (Issue #737)
     */
    SessionManager.prototype.deleteSession = function (sessionDbId) {
        return __awaiter(this, void 0, void 0, function () {
            var session, sessionDuration, generatorDone, timeoutDone, tracked, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        session = this.sessions.get(sessionDbId);
                        if (!session) {
                            return [2 /*return*/]; // Already deleted
                        }
                        sessionDuration = Date.now() - session.startTime;
                        // 1. Abort the SDK agent
                        session.abortController.abort();
                        if (!session.generatorPromise) return [3 /*break*/, 2];
                        generatorDone = session.generatorPromise.catch(function () {
                            logger_js_1.logger.debug('SYSTEM', 'Generator already failed, cleaning up', { sessionId: session.sessionDbId });
                        });
                        timeoutDone = new Promise(function (resolve) {
                            AbortSignal.timeout(30000).addEventListener('abort', function () { return resolve(); }, { once: true });
                        });
                        return [4 /*yield*/, Promise.race([generatorDone, timeoutDone]).then(function () { }, function () {
                                logger_js_1.logger.warn('SESSION', 'Generator did not exit within 30s after abort, forcing cleanup (#1099)', { sessionDbId: sessionDbId });
                            })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        tracked = (0, ProcessRegistry_js_1.getProcessBySession)(sessionDbId);
                        if (!(tracked && tracked.process.exitCode === null)) return [3 /*break*/, 4];
                        logger_js_1.logger.debug('SESSION', "Waiting for subprocess PID ".concat(tracked.pid, " to exit"), {
                            sessionId: sessionDbId,
                            pid: tracked.pid
                        });
                        return [4 /*yield*/, (0, ProcessRegistry_js_1.ensureProcessExit)(tracked, 5000)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, (0, index_js_1.getSupervisor)().getRegistry().reapSession(sessionDbId)];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _a.sent();
                        logger_js_1.logger.warn('SESSION', 'Supervisor reapSession failed (non-blocking)', {
                            sessionId: sessionDbId
                        }, error_1);
                        return [3 /*break*/, 7];
                    case 7:
                        // 4. Cleanup
                        this.sessions.delete(sessionDbId);
                        this.sessionQueues.delete(sessionDbId);
                        logger_js_1.logger.info('SESSION', 'Session deleted', {
                            sessionId: sessionDbId,
                            duration: "".concat((sessionDuration / 1000).toFixed(1), "s"),
                            project: session.project
                        });
                        // Trigger callback to broadcast status update (spinner may need to stop)
                        if (this.onSessionDeletedCallback) {
                            this.onSessionDeletedCallback();
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Remove session from in-memory maps and notify without awaiting generator.
     * Used when SDK resume fails and we give up (no fallback): avoids deadlock
     * from deleteSession() awaiting the same generator promise we're inside.
     */
    SessionManager.prototype.removeSessionImmediate = function (sessionDbId) {
        var session = this.sessions.get(sessionDbId);
        if (!session)
            return;
        this.sessions.delete(sessionDbId);
        this.sessionQueues.delete(sessionDbId);
        logger_js_1.logger.info('SESSION', 'Session removed from active sessions', {
            sessionId: sessionDbId,
            project: session.project
        });
        if (this.onSessionDeletedCallback) {
            this.onSessionDeletedCallback();
        }
    };
    /**
     * Reap sessions with no active generator and no pending work that have been idle too long.
     * This unblocks the orphan reaper which skips processes for "active" sessions. (Issue #1168)
     */
    SessionManager.prototype.reapStaleSessions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var now, staleSessionIds, _i, _a, _b, sessionDbId, session, pendingCount, sessionAge, _c, staleSessionIds_1, sessionDbId;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        now = Date.now();
                        staleSessionIds = [];
                        for (_i = 0, _a = this.sessions; _i < _a.length; _i++) {
                            _b = _a[_i], sessionDbId = _b[0], session = _b[1];
                            // Skip sessions with active generators
                            if (session.generatorPromise)
                                continue;
                            pendingCount = this.getPendingStore().getPendingCount(sessionDbId);
                            if (pendingCount > 0)
                                continue;
                            sessionAge = now - session.startTime;
                            if (sessionAge > SessionManager.MAX_SESSION_IDLE_MS) {
                                staleSessionIds.push(sessionDbId);
                            }
                        }
                        _c = 0, staleSessionIds_1 = staleSessionIds;
                        _d.label = 1;
                    case 1:
                        if (!(_c < staleSessionIds_1.length)) return [3 /*break*/, 4];
                        sessionDbId = staleSessionIds_1[_c];
                        logger_js_1.logger.warn('SESSION', "Reaping stale session ".concat(sessionDbId, " (no activity for >").concat(Math.round(SessionManager.MAX_SESSION_IDLE_MS / 60000), "m)"), { sessionDbId: sessionDbId });
                        return [4 /*yield*/, this.deleteSession(sessionDbId)];
                    case 2:
                        _d.sent();
                        _d.label = 3;
                    case 3:
                        _c++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, staleSessionIds.length];
                }
            });
        });
    };
    /**
     * Shutdown all active sessions
     */
    SessionManager.prototype.shutdownAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            var sessionIds;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sessionIds = Array.from(this.sessions.keys());
                        return [4 /*yield*/, Promise.all(sessionIds.map(function (id) { return _this.deleteSession(id); }))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check if any active session has pending messages (for spinner tracking).
     * Scoped to in-memory sessions only.
     */
    SessionManager.prototype.hasPendingMessages = function () {
        return this.getTotalQueueDepth() > 0;
    };
    /**
     * Get number of active sessions (for stats)
     */
    SessionManager.prototype.getActiveSessionCount = function () {
        return this.sessions.size;
    };
    /**
     * Get total queue depth across all sessions (for activity indicator)
     */
    SessionManager.prototype.getTotalQueueDepth = function () {
        var total = 0;
        // We can iterate over active sessions to get their pending count
        for (var _i = 0, _a = this.sessions.values(); _i < _a.length; _i++) {
            var session = _a[_i];
            total += this.getPendingStore().getPendingCount(session.sessionDbId);
        }
        return total;
    };
    /**
     * Get total active work (queued + currently processing)
     * Counts both pending messages and items actively being processed by SDK agents
     */
    SessionManager.prototype.getTotalActiveWork = function () {
        // getPendingCount includes 'processing' status, so this IS the total active work
        return this.getTotalQueueDepth();
    };
    /**
     * Check if any active session has pending work.
     * Scoped to in-memory sessions only — orphaned DB messages from dead
     * sessions must not keep the spinner spinning forever.
     */
    SessionManager.prototype.isAnySessionProcessing = function () {
        return this.getTotalQueueDepth() > 0;
    };
    /**
     * Get message iterator for SDKAgent to consume (event-driven, no polling)
     * Auto-initializes session if not in memory but exists in database
     *
     * CRITICAL: Uses PendingMessageStore for crash-safe message persistence.
     * Messages are marked as 'processing' when yielded and must be marked 'processed'
     * by the SDK agent after successful completion.
     */
    SessionManager.prototype.getMessageIterator = function (sessionDbId) {
        return __asyncGenerator(this, arguments, function getMessageIterator_1() {
            var session, emitter, processor, _a, _b, _c, message, e_1_1;
            var _d, e_1, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        session = this.sessions.get(sessionDbId);
                        if (!session) {
                            session = this.initializeSession(sessionDbId);
                        }
                        emitter = this.sessionQueues.get(sessionDbId);
                        if (!emitter) {
                            throw new Error("No emitter for session ".concat(sessionDbId));
                        }
                        processor = new SessionQueueProcessor_js_1.SessionQueueProcessor(this.getPendingStore(), emitter);
                        _g.label = 1;
                    case 1:
                        _g.trys.push([1, 8, 9, 14]);
                        _a = true, _b = __asyncValues(processor.createIterator({
                            sessionDbId: sessionDbId,
                            signal: session.abortController.signal,
                            onIdleTimeout: function () {
                                logger_js_1.logger.info('SESSION', 'Triggering abort due to idle timeout to kill subprocess', { sessionDbId: sessionDbId });
                                session.idleTimedOut = true;
                                session.abortController.abort();
                            }
                        }));
                        _g.label = 2;
                    case 2: return [4 /*yield*/, __await(_b.next())];
                    case 3:
                        if (!(_c = _g.sent(), _d = _c.done, !_d)) return [3 /*break*/, 7];
                        _f = _c.value;
                        _a = false;
                        message = _f;
                        // Track earliest timestamp for accurate observation timestamps
                        // This ensures backlog messages get their original timestamps, not current time
                        if (session.earliestPendingTimestamp === null) {
                            session.earliestPendingTimestamp = message._originalTimestamp;
                        }
                        else {
                            session.earliestPendingTimestamp = Math.min(session.earliestPendingTimestamp, message._originalTimestamp);
                        }
                        // Update generator activity for stale detection (Issue #1099)
                        session.lastGeneratorActivity = Date.now();
                        return [4 /*yield*/, __await(message)];
                    case 4: return [4 /*yield*/, _g.sent()];
                    case 5:
                        _g.sent();
                        _g.label = 6;
                    case 6:
                        _a = true;
                        return [3 /*break*/, 2];
                    case 7: return [3 /*break*/, 14];
                    case 8:
                        e_1_1 = _g.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 14];
                    case 9:
                        _g.trys.push([9, , 12, 13]);
                        if (!(!_a && !_d && (_e = _b.return))) return [3 /*break*/, 11];
                        return [4 /*yield*/, __await(_e.call(_b))];
                    case 10:
                        _g.sent();
                        _g.label = 11;
                    case 11: return [3 /*break*/, 13];
                    case 12:
                        if (e_1) throw e_1.error;
                        return [7 /*endfinally*/];
                    case 13: return [7 /*endfinally*/];
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get the PendingMessageStore (for SDKAgent to mark messages as processed)
     */
    SessionManager.prototype.getPendingMessageStore = function () {
        return this.getPendingStore();
    };
    SessionManager.MAX_SESSION_IDLE_MS = 15 * 60 * 1000; // 15 minutes
    return SessionManager;
}());
exports.SessionManager = SessionManager;
