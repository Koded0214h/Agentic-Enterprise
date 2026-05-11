"use strict";
/**
 * Data Routes
 *
 * Handles data retrieval operations: observations, summaries, prompts, stats, processing status.
 * All endpoints use direct database access via service layer.
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
exports.DataRoutes = void 0;
var path_1 = require("path");
var fs_1 = require("fs");
var logger_js_1 = require("../../../../utils/logger.js");
var os_1 = require("os");
var paths_js_1 = require("../../../../shared/paths.js");
var worker_utils_js_1 = require("../../../../shared/worker-utils.js");
var BaseRouteHandler_js_1 = require("../BaseRouteHandler.js");
var DataRoutes = /** @class */ (function (_super) {
    __extends(DataRoutes, _super);
    function DataRoutes(paginationHelper, dbManager, sessionManager, sseBroadcaster, workerService, startTime) {
        var _this = _super.call(this) || this;
        _this.paginationHelper = paginationHelper;
        _this.dbManager = dbManager;
        _this.sessionManager = sessionManager;
        _this.sseBroadcaster = sseBroadcaster;
        _this.workerService = workerService;
        _this.startTime = startTime;
        /**
         * Get paginated observations
         */
        _this.handleGetObservations = _this.wrapHandler(function (req, res) {
            var _a = _this.parsePaginationParams(req), offset = _a.offset, limit = _a.limit, project = _a.project;
            var result = _this.paginationHelper.getObservations(offset, limit, project);
            res.json(result);
        });
        /**
         * Get paginated summaries
         */
        _this.handleGetSummaries = _this.wrapHandler(function (req, res) {
            var _a = _this.parsePaginationParams(req), offset = _a.offset, limit = _a.limit, project = _a.project;
            var result = _this.paginationHelper.getSummaries(offset, limit, project);
            res.json(result);
        });
        /**
         * Get paginated user prompts
         */
        _this.handleGetPrompts = _this.wrapHandler(function (req, res) {
            var _a = _this.parsePaginationParams(req), offset = _a.offset, limit = _a.limit, project = _a.project;
            var result = _this.paginationHelper.getPrompts(offset, limit, project);
            res.json(result);
        });
        /**
         * Get observation by ID
         * GET /api/observation/:id
         */
        _this.handleGetObservationById = _this.wrapHandler(function (req, res) {
            var id = _this.parseIntParam(req, res, 'id');
            if (id === null)
                return;
            var store = _this.dbManager.getSessionStore();
            var observation = store.getObservationById(id);
            if (!observation) {
                _this.notFound(res, "Observation #".concat(id, " not found"));
                return;
            }
            res.json(observation);
        });
        /**
         * Get observations by array of IDs
         * POST /api/observations/batch
         * Body: { ids: number[], orderBy?: 'date_desc' | 'date_asc', limit?: number, project?: string }
         */
        _this.handleGetObservationsByIds = _this.wrapHandler(function (req, res) {
            var _a = req.body, ids = _a.ids, orderBy = _a.orderBy, limit = _a.limit, project = _a.project;
            // Coerce string-encoded arrays from MCP clients (e.g. "[1,2,3]" or "1,2,3")
            if (typeof ids === 'string') {
                try {
                    ids = JSON.parse(ids);
                }
                catch (_b) {
                    ids = ids.split(',').map(Number);
                }
            }
            if (!ids || !Array.isArray(ids)) {
                _this.badRequest(res, 'ids must be an array of numbers');
                return;
            }
            if (ids.length === 0) {
                res.json([]);
                return;
            }
            // Validate all IDs are numbers
            if (!ids.every(function (id) { return typeof id === 'number' && Number.isInteger(id); })) {
                _this.badRequest(res, 'All ids must be integers');
                return;
            }
            var store = _this.dbManager.getSessionStore();
            var observations = store.getObservationsByIds(ids, { orderBy: orderBy, limit: limit, project: project });
            res.json(observations);
        });
        /**
         * Get session by ID
         * GET /api/session/:id
         */
        _this.handleGetSessionById = _this.wrapHandler(function (req, res) {
            var id = _this.parseIntParam(req, res, 'id');
            if (id === null)
                return;
            var store = _this.dbManager.getSessionStore();
            var sessions = store.getSessionSummariesByIds([id]);
            if (sessions.length === 0) {
                _this.notFound(res, "Session #".concat(id, " not found"));
                return;
            }
            res.json(sessions[0]);
        });
        /**
         * Get SDK sessions by SDK session IDs
         * POST /api/sdk-sessions/batch
         * Body: { memorySessionIds: string[] }
         */
        _this.handleGetSdkSessionsByIds = _this.wrapHandler(function (req, res) {
            var memorySessionIds = req.body.memorySessionIds;
            // Coerce string-encoded arrays from MCP clients (e.g. '["a","b"]' or "a,b")
            if (typeof memorySessionIds === 'string') {
                try {
                    memorySessionIds = JSON.parse(memorySessionIds);
                }
                catch (_a) {
                    memorySessionIds = memorySessionIds.split(',').map(function (s) { return s.trim(); });
                }
            }
            if (!Array.isArray(memorySessionIds)) {
                _this.badRequest(res, 'memorySessionIds must be an array');
                return;
            }
            var store = _this.dbManager.getSessionStore();
            var sessions = store.getSdkSessionsBySessionIds(memorySessionIds);
            res.json(sessions);
        });
        /**
         * Get user prompt by ID
         * GET /api/prompt/:id
         */
        _this.handleGetPromptById = _this.wrapHandler(function (req, res) {
            var id = _this.parseIntParam(req, res, 'id');
            if (id === null)
                return;
            var store = _this.dbManager.getSessionStore();
            var prompts = store.getUserPromptsByIds([id]);
            if (prompts.length === 0) {
                _this.notFound(res, "Prompt #".concat(id, " not found"));
                return;
            }
            res.json(prompts[0]);
        });
        /**
         * Get database statistics (with worker metadata)
         */
        _this.handleGetStats = _this.wrapHandler(function (req, res) {
            var db = _this.dbManager.getSessionStore().db;
            // Read version from package.json
            var packageRoot = (0, paths_js_1.getPackageRoot)();
            var packageJsonPath = path_1.default.join(packageRoot, 'package.json');
            var packageJson = JSON.parse((0, fs_1.readFileSync)(packageJsonPath, 'utf-8'));
            var version = packageJson.version;
            // Get database stats
            var totalObservations = db.prepare('SELECT COUNT(*) as count FROM observations').get();
            var totalSessions = db.prepare('SELECT COUNT(*) as count FROM sdk_sessions').get();
            var totalSummaries = db.prepare('SELECT COUNT(*) as count FROM session_summaries').get();
            // Get database file size and path
            var dbPath = path_1.default.join((0, os_1.homedir)(), '.claude-mem', 'claude-mem.db');
            var dbSize = 0;
            if ((0, fs_1.existsSync)(dbPath)) {
                dbSize = (0, fs_1.statSync)(dbPath).size;
            }
            // Worker metadata
            var uptime = Math.floor((Date.now() - _this.startTime) / 1000);
            var activeSessions = _this.sessionManager.getActiveSessionCount();
            var sseClients = _this.sseBroadcaster.getClientCount();
            res.json({
                worker: {
                    version: version,
                    uptime: uptime,
                    activeSessions: activeSessions,
                    sseClients: sseClients,
                    port: (0, worker_utils_js_1.getWorkerPort)()
                },
                database: {
                    path: dbPath,
                    size: dbSize,
                    observations: totalObservations.count,
                    sessions: totalSessions.count,
                    summaries: totalSummaries.count
                }
            });
        });
        /**
         * Get list of distinct projects from observations
         * GET /api/projects
         */
        _this.handleGetProjects = _this.wrapHandler(function (req, res) {
            var db = _this.dbManager.getSessionStore().db;
            var rows = db.prepare("\n      SELECT DISTINCT project\n      FROM observations\n      WHERE project IS NOT NULL\n      GROUP BY project\n      ORDER BY MAX(created_at_epoch) DESC\n    ").all();
            var projects = rows.map(function (row) { return row.project; });
            res.json({ projects: projects });
        });
        /**
         * Get current processing status
         * GET /api/processing-status
         */
        _this.handleGetProcessingStatus = _this.wrapHandler(function (req, res) {
            var isProcessing = _this.sessionManager.isAnySessionProcessing();
            var queueDepth = _this.sessionManager.getTotalActiveWork(); // Includes queued + actively processing
            res.json({ isProcessing: isProcessing, queueDepth: queueDepth });
        });
        /**
         * Set processing status (called by hooks)
         * NOTE: This now broadcasts computed status based on active processing (ignores input)
         */
        _this.handleSetProcessing = _this.wrapHandler(function (req, res) {
            // Broadcast current computed status (ignores manual input)
            _this.workerService.broadcastProcessingStatus();
            var isProcessing = _this.sessionManager.isAnySessionProcessing();
            var queueDepth = _this.sessionManager.getTotalQueueDepth();
            var activeSessions = _this.sessionManager.getActiveSessionCount();
            res.json({ status: 'ok', isProcessing: isProcessing, queueDepth: queueDepth, activeSessions: activeSessions });
        });
        /**
         * Import memories from export file
         * POST /api/import
         * Body: { sessions: [], summaries: [], observations: [], prompts: [] }
         */
        _this.handleImport = _this.wrapHandler(function (req, res) {
            var _a = req.body, sessions = _a.sessions, summaries = _a.summaries, observations = _a.observations, prompts = _a.prompts;
            var stats = {
                sessionsImported: 0,
                sessionsSkipped: 0,
                summariesImported: 0,
                summariesSkipped: 0,
                observationsImported: 0,
                observationsSkipped: 0,
                promptsImported: 0,
                promptsSkipped: 0
            };
            var store = _this.dbManager.getSessionStore();
            // Import sessions first (dependency for everything else)
            if (Array.isArray(sessions)) {
                for (var _i = 0, sessions_1 = sessions; _i < sessions_1.length; _i++) {
                    var session = sessions_1[_i];
                    var result = store.importSdkSession(session);
                    if (result.imported) {
                        stats.sessionsImported++;
                    }
                    else {
                        stats.sessionsSkipped++;
                    }
                }
            }
            // Import summaries (depends on sessions)
            if (Array.isArray(summaries)) {
                for (var _b = 0, summaries_1 = summaries; _b < summaries_1.length; _b++) {
                    var summary = summaries_1[_b];
                    var result = store.importSessionSummary(summary);
                    if (result.imported) {
                        stats.summariesImported++;
                    }
                    else {
                        stats.summariesSkipped++;
                    }
                }
            }
            // Import observations (depends on sessions)
            if (Array.isArray(observations)) {
                for (var _c = 0, observations_1 = observations; _c < observations_1.length; _c++) {
                    var obs = observations_1[_c];
                    var result = store.importObservation(obs);
                    if (result.imported) {
                        stats.observationsImported++;
                    }
                    else {
                        stats.observationsSkipped++;
                    }
                }
            }
            // Import prompts (depends on sessions)
            if (Array.isArray(prompts)) {
                for (var _d = 0, prompts_1 = prompts; _d < prompts_1.length; _d++) {
                    var prompt_1 = prompts_1[_d];
                    var result = store.importUserPrompt(prompt_1);
                    if (result.imported) {
                        stats.promptsImported++;
                    }
                    else {
                        stats.promptsSkipped++;
                    }
                }
            }
            res.json({
                success: true,
                stats: stats
            });
        });
        /**
         * Get pending queue contents
         * GET /api/pending-queue
         * Returns all pending, processing, and failed messages with optional recently processed
         */
        _this.handleGetPendingQueue = _this.wrapHandler(function (req, res) {
            var PendingMessageStore = require('../../../sqlite/PendingMessageStore.js').PendingMessageStore;
            var pendingStore = new PendingMessageStore(_this.dbManager.getSessionStore().db, 3);
            // Get queue contents (pending, processing, failed)
            var queueMessages = pendingStore.getQueueMessages();
            // Get recently processed (last 30 min, up to 20)
            var recentlyProcessed = pendingStore.getRecentlyProcessed(20, 30);
            // Get stuck message count (processing > 5 min)
            var stuckCount = pendingStore.getStuckCount(5 * 60 * 1000);
            // Get sessions with pending work
            var sessionsWithPending = pendingStore.getSessionsWithPendingMessages();
            res.json({
                queue: {
                    messages: queueMessages,
                    totalPending: queueMessages.filter(function (m) { return m.status === 'pending'; }).length,
                    totalProcessing: queueMessages.filter(function (m) { return m.status === 'processing'; }).length,
                    totalFailed: queueMessages.filter(function (m) { return m.status === 'failed'; }).length,
                    stuckCount: stuckCount
                },
                recentlyProcessed: recentlyProcessed,
                sessionsWithPendingWork: sessionsWithPending
            });
        });
        /**
         * Process pending queue
         * POST /api/pending-queue/process
         * Body: { sessionLimit?: number } - defaults to 10
         * Starts SDK agents for sessions with pending messages
         */
        _this.handleProcessPendingQueue = _this.wrapHandler(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var sessionLimit, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sessionLimit = Math.min(Math.max(parseInt(req.body.sessionLimit, 10) || 10, 1), 100 // Max 100 sessions at once
                        );
                        return [4 /*yield*/, this.workerService.processPendingQueues(sessionLimit)];
                    case 1:
                        result = _a.sent();
                        res.json(__assign({ success: true }, result));
                        return [2 /*return*/];
                }
            });
        }); });
        /**
         * Clear all failed messages from the queue
         * DELETE /api/pending-queue/failed
         * Returns the number of messages cleared
         */
        _this.handleClearFailedQueue = _this.wrapHandler(function (req, res) {
            var PendingMessageStore = require('../../../sqlite/PendingMessageStore.js').PendingMessageStore;
            var pendingStore = new PendingMessageStore(_this.dbManager.getSessionStore().db, 3);
            var clearedCount = pendingStore.clearFailed();
            logger_js_1.logger.info('QUEUE', 'Cleared failed queue messages', { clearedCount: clearedCount });
            res.json({
                success: true,
                clearedCount: clearedCount
            });
        });
        /**
         * Clear all messages from the queue (pending, processing, and failed)
         * DELETE /api/pending-queue/all
         * Returns the number of messages cleared
         */
        _this.handleClearAllQueue = _this.wrapHandler(function (req, res) {
            var PendingMessageStore = require('../../../sqlite/PendingMessageStore.js').PendingMessageStore;
            var pendingStore = new PendingMessageStore(_this.dbManager.getSessionStore().db, 3);
            var clearedCount = pendingStore.clearAll();
            logger_js_1.logger.warn('QUEUE', 'Cleared ALL queue messages (pending, processing, failed)', { clearedCount: clearedCount });
            res.json({
                success: true,
                clearedCount: clearedCount
            });
        });
        return _this;
    }
    DataRoutes.prototype.setupRoutes = function (app) {
        // Pagination endpoints
        app.get('/api/observations', this.handleGetObservations.bind(this));
        app.get('/api/summaries', this.handleGetSummaries.bind(this));
        app.get('/api/prompts', this.handleGetPrompts.bind(this));
        // Fetch by ID endpoints
        app.get('/api/observation/:id', this.handleGetObservationById.bind(this));
        app.post('/api/observations/batch', this.handleGetObservationsByIds.bind(this));
        app.get('/api/session/:id', this.handleGetSessionById.bind(this));
        app.post('/api/sdk-sessions/batch', this.handleGetSdkSessionsByIds.bind(this));
        app.get('/api/prompt/:id', this.handleGetPromptById.bind(this));
        // Metadata endpoints
        app.get('/api/stats', this.handleGetStats.bind(this));
        app.get('/api/projects', this.handleGetProjects.bind(this));
        // Processing status endpoints
        app.get('/api/processing-status', this.handleGetProcessingStatus.bind(this));
        app.post('/api/processing', this.handleSetProcessing.bind(this));
        // Pending queue management endpoints
        app.get('/api/pending-queue', this.handleGetPendingQueue.bind(this));
        app.post('/api/pending-queue/process', this.handleProcessPendingQueue.bind(this));
        app.delete('/api/pending-queue/failed', this.handleClearFailedQueue.bind(this));
        app.delete('/api/pending-queue/all', this.handleClearAllQueue.bind(this));
        // Import endpoint
        app.post('/api/import', this.handleImport.bind(this));
    };
    /**
     * Parse pagination parameters from request query
     */
    DataRoutes.prototype.parsePaginationParams = function (req) {
        var offset = parseInt(req.query.offset, 10) || 0;
        var limit = Math.min(parseInt(req.query.limit, 10) || 20, 100); // Max 100
        var project = req.query.project;
        return { offset: offset, limit: limit, project: project };
    };
    return DataRoutes;
}(BaseRouteHandler_js_1.BaseRouteHandler));
exports.DataRoutes = DataRoutes;
