"use strict";
/**
 * ResponseProcessor: Shared response processing for all agent implementations
 *
 * Responsibility:
 * - Parse observations and summaries from agent responses
 * - Execute atomic database transactions
 * - Orchestrate Chroma sync (fire-and-forget)
 * - Broadcast to SSE clients
 * - Clean up processed messages
 *
 * This module extracts 150+ lines of duplicate code from SDKAgent, GeminiAgent, and OpenRouterAgent.
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
exports.processAgentResponse = processAgentResponse;
var logger_js_1 = require("../../../utils/logger.js");
var parser_js_1 = require("../../../sdk/parser.js");
var CursorHooksInstaller_js_1 = require("../../integrations/CursorHooksInstaller.js");
var claude_md_utils_js_1 = require("../../../utils/claude-md-utils.js");
var worker_utils_js_1 = require("../../../shared/worker-utils.js");
var SettingsDefaultsManager_js_1 = require("../../../shared/SettingsDefaultsManager.js");
var paths_js_1 = require("../../../shared/paths.js");
var ObservationBroadcaster_js_1 = require("./ObservationBroadcaster.js");
var SessionCleanupHelper_js_1 = require("./SessionCleanupHelper.js");
/**
 * Process agent response text (parse XML, save to database, sync to Chroma, broadcast SSE)
 *
 * This is the unified response processor that handles:
 * 1. Adding response to conversation history (for provider interop)
 * 2. Parsing observations and summaries from XML
 * 3. Atomic database transaction to store observations + summary
 * 4. Async Chroma sync (fire-and-forget, failures are non-critical)
 * 5. SSE broadcast to web UI clients
 * 6. Session cleanup
 *
 * @param text - Response text from the agent
 * @param session - Active session being processed
 * @param dbManager - Database manager for storage operations
 * @param sessionManager - Session manager for message tracking
 * @param worker - Worker reference for SSE broadcasting (optional)
 * @param discoveryTokens - Token cost delta for this response
 * @param originalTimestamp - Original epoch when message was queued (for accurate timestamps)
 * @param agentName - Name of the agent for logging (e.g., 'SDK', 'Gemini', 'OpenRouter')
 */
function processAgentResponse(text, session, dbManager, sessionManager, worker, discoveryTokens, originalTimestamp, agentName, projectRoot) {
    return __awaiter(this, void 0, void 0, function () {
        var observations, summary, summaryForStore, sessionStore, result, pendingStore, _i, _a, messageId;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    // Track generator activity for stale detection (Issue #1099)
                    session.lastGeneratorActivity = Date.now();
                    // Add assistant response to shared conversation history for provider interop
                    if (text) {
                        session.conversationHistory.push({ role: 'assistant', content: text });
                    }
                    observations = (0, parser_js_1.parseObservations)(text, session.contentSessionId);
                    summary = (0, parser_js_1.parseSummary)(text, session.sessionDbId);
                    summaryForStore = normalizeSummaryForStorage(summary);
                    sessionStore = dbManager.getSessionStore();
                    // CRITICAL: Must use memorySessionId (not contentSessionId) for FK constraint
                    if (!session.memorySessionId) {
                        throw new Error('Cannot store observations: memorySessionId not yet captured');
                    }
                    // SAFETY NET (Issue #846 / Multi-terminal FK fix):
                    // The PRIMARY fix is in SDKAgent.ts where ensureMemorySessionIdRegistered() is called
                    // immediately when the SDK returns a memory_session_id. This call is a defensive safety net
                    // in case the DB was somehow not updated (race condition, crash, etc.).
                    // In multi-terminal scenarios, createSDKSession() now resets memory_session_id to NULL
                    // for each new generator, ensuring clean isolation.
                    sessionStore.ensureMemorySessionIdRegistered(session.sessionDbId, session.memorySessionId);
                    // Log pre-storage with session ID chain for verification
                    logger_js_1.logger.info('DB', "STORING | sessionDbId=".concat(session.sessionDbId, " | memorySessionId=").concat(session.memorySessionId, " | obsCount=").concat(observations.length, " | hasSummary=").concat(!!summaryForStore), {
                        sessionId: session.sessionDbId,
                        memorySessionId: session.memorySessionId
                    });
                    result = sessionStore.storeObservations(session.memorySessionId, session.project, observations, summaryForStore, session.lastPromptNumber, discoveryTokens, originalTimestamp !== null && originalTimestamp !== void 0 ? originalTimestamp : undefined);
                    // Log storage result with IDs for end-to-end traceability
                    logger_js_1.logger.info('DB', "STORED | sessionDbId=".concat(session.sessionDbId, " | memorySessionId=").concat(session.memorySessionId, " | obsCount=").concat(result.observationIds.length, " | obsIds=[").concat(result.observationIds.join(','), "] | summaryId=").concat(result.summaryId || 'none'), {
                        sessionId: session.sessionDbId,
                        memorySessionId: session.memorySessionId
                    });
                    pendingStore = sessionManager.getPendingMessageStore();
                    for (_i = 0, _a = session.processingMessageIds; _i < _a.length; _i++) {
                        messageId = _a[_i];
                        pendingStore.confirmProcessed(messageId);
                    }
                    if (session.processingMessageIds.length > 0) {
                        logger_js_1.logger.debug('QUEUE', "CONFIRMED_BATCH | sessionDbId=".concat(session.sessionDbId, " | count=").concat(session.processingMessageIds.length, " | ids=[").concat(session.processingMessageIds.join(','), "]"));
                    }
                    // Clear the tracking array after confirmation
                    session.processingMessageIds = [];
                    // AFTER transaction commits - async operations (can fail safely without data loss)
                    return [4 /*yield*/, syncAndBroadcastObservations(observations, result, session, dbManager, worker, discoveryTokens, agentName, projectRoot)];
                case 1:
                    // AFTER transaction commits - async operations (can fail safely without data loss)
                    _b.sent();
                    // Sync and broadcast summary if present
                    return [4 /*yield*/, syncAndBroadcastSummary(summary, summaryForStore, result, session, dbManager, worker, discoveryTokens, agentName)];
                case 2:
                    // Sync and broadcast summary if present
                    _b.sent();
                    // Clean up session state
                    (0, SessionCleanupHelper_js_1.cleanupProcessedMessages)(session, worker);
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Normalize summary for storage (convert null fields to empty strings)
 */
function normalizeSummaryForStorage(summary) {
    if (!summary)
        return null;
    return {
        request: summary.request || '',
        investigated: summary.investigated || '',
        learned: summary.learned || '',
        completed: summary.completed || '',
        next_steps: summary.next_steps || '',
        notes: summary.notes
    };
}
/**
 * Sync observations to Chroma and broadcast to SSE clients
 */
function syncAndBroadcastObservations(observations, result, session, dbManager, worker, discoveryTokens, agentName, projectRoot) {
    return __awaiter(this, void 0, void 0, function () {
        var _loop_1, i, settings, settingValue, folderClaudeMdEnabled, allFilePaths, _i, observations_1, obs;
        var _a;
        return __generator(this, function (_b) {
            _loop_1 = function (i) {
                var obsId = result.observationIds[i];
                var obs = observations[i];
                var chromaStart = Date.now();
                // Sync to Chroma (fire-and-forget, skipped if Chroma is disabled)
                (_a = dbManager.getChromaSync()) === null || _a === void 0 ? void 0 : _a.syncObservation(obsId, session.contentSessionId, session.project, obs, session.lastPromptNumber, result.createdAtEpoch, discoveryTokens).then(function () {
                    var chromaDuration = Date.now() - chromaStart;
                    logger_js_1.logger.debug('CHROMA', 'Observation synced', {
                        obsId: obsId,
                        duration: "".concat(chromaDuration, "ms"),
                        type: obs.type,
                        title: obs.title || '(untitled)'
                    });
                }).catch(function (error) {
                    logger_js_1.logger.error('CHROMA', "".concat(agentName, " chroma sync failed, continuing without vector search"), {
                        obsId: obsId,
                        type: obs.type,
                        title: obs.title || '(untitled)'
                    }, error);
                });
                // Broadcast to SSE clients (for web UI)
                // BUGFIX: Use obs.files_read and obs.files_modified (not obs.files)
                (0, ObservationBroadcaster_js_1.broadcastObservation)(worker, {
                    id: obsId,
                    memory_session_id: session.memorySessionId,
                    session_id: session.contentSessionId,
                    type: obs.type,
                    title: obs.title,
                    subtitle: obs.subtitle,
                    text: null, // text field is not in ParsedObservation
                    narrative: obs.narrative || null,
                    facts: JSON.stringify(obs.facts || []),
                    concepts: JSON.stringify(obs.concepts || []),
                    files_read: JSON.stringify(obs.files_read || []),
                    files_modified: JSON.stringify(obs.files_modified || []),
                    project: session.project,
                    prompt_number: session.lastPromptNumber,
                    created_at_epoch: result.createdAtEpoch
                });
            };
            for (i = 0; i < observations.length; i++) {
                _loop_1(i);
            }
            settings = SettingsDefaultsManager_js_1.SettingsDefaultsManager.loadFromFile(paths_js_1.USER_SETTINGS_PATH);
            settingValue = settings.CLAUDE_MEM_FOLDER_CLAUDEMD_ENABLED;
            folderClaudeMdEnabled = settingValue === 'true' || settingValue === true;
            if (folderClaudeMdEnabled) {
                allFilePaths = [];
                for (_i = 0, observations_1 = observations; _i < observations_1.length; _i++) {
                    obs = observations_1[_i];
                    allFilePaths.push.apply(allFilePaths, (obs.files_modified || []));
                    allFilePaths.push.apply(allFilePaths, (obs.files_read || []));
                }
                if (allFilePaths.length > 0) {
                    (0, claude_md_utils_js_1.updateFolderClaudeMdFiles)(allFilePaths, session.project, (0, worker_utils_js_1.getWorkerPort)(), projectRoot).catch(function (error) {
                        logger_js_1.logger.warn('FOLDER_INDEX', 'CLAUDE.md update failed (non-critical)', { project: session.project }, error);
                    });
                }
            }
            return [2 /*return*/];
        });
    });
}
/**
 * Sync summary to Chroma and broadcast to SSE clients
 */
function syncAndBroadcastSummary(summary, summaryForStore, result, session, dbManager, worker, discoveryTokens, agentName) {
    return __awaiter(this, void 0, void 0, function () {
        var chromaStart;
        var _a;
        return __generator(this, function (_b) {
            if (!summaryForStore || !result.summaryId) {
                return [2 /*return*/];
            }
            chromaStart = Date.now();
            // Sync to Chroma (fire-and-forget, skipped if Chroma is disabled)
            (_a = dbManager.getChromaSync()) === null || _a === void 0 ? void 0 : _a.syncSummary(result.summaryId, session.contentSessionId, session.project, summaryForStore, session.lastPromptNumber, result.createdAtEpoch, discoveryTokens).then(function () {
                var chromaDuration = Date.now() - chromaStart;
                logger_js_1.logger.debug('CHROMA', 'Summary synced', {
                    summaryId: result.summaryId,
                    duration: "".concat(chromaDuration, "ms"),
                    request: summaryForStore.request || '(no request)'
                });
            }).catch(function (error) {
                logger_js_1.logger.error('CHROMA', "".concat(agentName, " chroma sync failed, continuing without vector search"), {
                    summaryId: result.summaryId,
                    request: summaryForStore.request || '(no request)'
                }, error);
            });
            // Broadcast to SSE clients (for web UI)
            (0, ObservationBroadcaster_js_1.broadcastSummary)(worker, {
                id: result.summaryId,
                session_id: session.contentSessionId,
                request: summary.request,
                investigated: summary.investigated,
                learned: summary.learned,
                completed: summary.completed,
                next_steps: summary.next_steps,
                notes: summary.notes,
                project: session.project,
                prompt_number: session.lastPromptNumber,
                created_at_epoch: result.createdAtEpoch
            });
            // Update Cursor context file for registered projects (fire-and-forget)
            (0, CursorHooksInstaller_js_1.updateCursorContextForProject)(session.project, (0, worker_utils_js_1.getWorkerPort)()).catch(function (error) {
                logger_js_1.logger.warn('CURSOR', 'Context update failed (non-critical)', { project: session.project }, error);
            });
            return [2 /*return*/];
        });
    });
}
