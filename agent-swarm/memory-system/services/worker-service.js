"use strict";
/**
 * Worker Service - Slim Orchestrator
 *
 * Refactored from 2000-line monolith to ~300-line orchestrator.
 * Delegates to specialized modules:
 * - src/services/server/ - HTTP server, middleware, error handling
 * - src/services/infrastructure/ - Process management, health monitoring, shutdown
 * - src/services/integrations/ - IDE integrations (Cursor)
 * - src/services/worker/ - Business logic, routes, agents
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkerService = exports.isPluginDisabledInClaudeSettings = void 0;
exports.buildStatusOutput = buildStatusOutput;
var path_1 = require("path");
var fs_1 = require("fs");
var index_js_1 = require("@modelcontextprotocol/sdk/client/index.js");
var stdio_js_1 = require("@modelcontextprotocol/sdk/client/stdio.js");
var worker_utils_js_1 = require("../shared/worker-utils.js");
var hook_constants_js_1 = require("../shared/hook-constants.js");
var SettingsDefaultsManager_js_1 = require("../shared/SettingsDefaultsManager.js");
var EnvManager_js_1 = require("../shared/EnvManager.js");
var logger_js_1 = require("../utils/logger.js");
var ChromaMcpManager_js_1 = require("./sync/ChromaMcpManager.js");
var ChromaSync_js_1 = require("./sync/ChromaSync.js");
var index_js_2 = require("../supervisor/index.js");
var env_sanitizer_js_1 = require("../supervisor/env-sanitizer.js");
// Windows: avoid repeated spawn popups when startup fails (issue #921)
var WINDOWS_SPAWN_COOLDOWN_MS = 2 * 60 * 1000;
function getWorkerSpawnLockPath() {
    return path_1.default.join(SettingsDefaultsManager_js_1.SettingsDefaultsManager.get('CLAUDE_MEM_DATA_DIR'), '.worker-start-attempted');
}
function shouldSkipSpawnOnWindows() {
    if (process.platform !== 'win32')
        return false;
    var lockPath = getWorkerSpawnLockPath();
    if (!(0, fs_1.existsSync)(lockPath))
        return false;
    try {
        var modifiedTimeMs = (0, fs_1.statSync)(lockPath).mtimeMs;
        return Date.now() - modifiedTimeMs < WINDOWS_SPAWN_COOLDOWN_MS;
    }
    catch (_a) {
        return false;
    }
}
function markWorkerSpawnAttempted() {
    if (process.platform !== 'win32')
        return;
    try {
        (0, fs_1.writeFileSync)(getWorkerSpawnLockPath(), '', 'utf-8');
    }
    catch (_a) {
        // Best-effort lock file — failure to write shouldn't block startup
    }
}
function clearWorkerSpawnAttempted() {
    if (process.platform !== 'win32')
        return;
    try {
        var lockPath = getWorkerSpawnLockPath();
        if ((0, fs_1.existsSync)(lockPath))
            (0, fs_1.unlinkSync)(lockPath);
    }
    catch (_a) {
        // Best-effort cleanup
    }
}
// Re-export for backward compatibility — canonical implementation in shared/plugin-state.ts
var plugin_state_js_1 = require("../shared/plugin-state.js");
Object.defineProperty(exports, "isPluginDisabledInClaudeSettings", { enumerable: true, get: function () { return plugin_state_js_1.isPluginDisabledInClaudeSettings; } });
var plugin_state_js_2 = require("../shared/plugin-state.js");
var packageVersion = typeof __DEFAULT_PACKAGE_VERSION__ !== 'undefined' ? __DEFAULT_PACKAGE_VERSION__ : '0.0.0-dev';
// Infrastructure imports
var ProcessManager_js_1 = require("./infrastructure/ProcessManager.js");
var HealthMonitor_js_1 = require("./infrastructure/HealthMonitor.js");
var GracefulShutdown_js_1 = require("./infrastructure/GracefulShutdown.js");
// Server imports
var Server_js_1 = require("./server/Server.js");
// Integration imports
var CursorHooksInstaller_js_1 = require("./integrations/CursorHooksInstaller.js");
// Service layer imports
var DatabaseManager_js_1 = require("./worker/DatabaseManager.js");
var SessionManager_js_1 = require("./worker/SessionManager.js");
var SSEBroadcaster_js_1 = require("./worker/SSEBroadcaster.js");
var SDKAgent_js_1 = require("./worker/SDKAgent.js");
var GeminiAgent_js_1 = require("./worker/GeminiAgent.js");
var OpenRouterAgent_js_1 = require("./worker/OpenRouterAgent.js");
var PaginationHelper_js_1 = require("./worker/PaginationHelper.js");
var SettingsManager_js_1 = require("./worker/SettingsManager.js");
var SearchManager_js_1 = require("./worker/SearchManager.js");
var FormattingService_js_1 = require("./worker/FormattingService.js");
var TimelineService_js_1 = require("./worker/TimelineService.js");
var SessionEventBroadcaster_js_1 = require("./worker/events/SessionEventBroadcaster.js");
// HTTP route handlers
var ViewerRoutes_js_1 = require("./worker/http/routes/ViewerRoutes.js");
var SessionRoutes_js_1 = require("./worker/http/routes/SessionRoutes.js");
var DataRoutes_js_1 = require("./worker/http/routes/DataRoutes.js");
var SearchRoutes_js_1 = require("./worker/http/routes/SearchRoutes.js");
var SettingsRoutes_js_1 = require("./worker/http/routes/SettingsRoutes.js");
var LogsRoutes_js_1 = require("./worker/http/routes/LogsRoutes.js");
var MemoryRoutes_js_1 = require("./worker/http/routes/MemoryRoutes.js");
// Process management for zombie cleanup (Issue #737)
var ProcessRegistry_js_1 = require("./worker/ProcessRegistry.js");
function buildStatusOutput(status, message) {
    return __assign({ continue: true, suppressOutput: true, status: status }, (message && { message: message }));
}
var WorkerService = /** @class */ (function () {
    function WorkerService() {
        var _this = this;
        this.startTime = Date.now();
        // Initialization flags
        this.mcpReady = false;
        this.initializationCompleteFlag = false;
        this.isShuttingDown = false;
        // Route handlers
        this.searchRoutes = null;
        // Chroma MCP manager (lazy - connects on first use)
        this.chromaMcpManager = null;
        // Orphan reaper cleanup function (Issue #737)
        this.stopOrphanReaper = null;
        // Stale session reaper interval (Issue #1168)
        this.staleSessionReaperInterval = null;
        // AI interaction tracking for health endpoint
        this.lastAiInteraction = null;
        // Initialize the promise that will resolve when background initialization completes
        this.initializationComplete = new Promise(function (resolve) {
            _this.resolveInitialization = resolve;
        });
        // Initialize service layer
        this.dbManager = new DatabaseManager_js_1.DatabaseManager();
        this.sessionManager = new SessionManager_js_1.SessionManager(this.dbManager);
        this.sseBroadcaster = new SSEBroadcaster_js_1.SSEBroadcaster();
        this.sdkAgent = new SDKAgent_js_1.SDKAgent(this.dbManager, this.sessionManager);
        this.geminiAgent = new GeminiAgent_js_1.GeminiAgent(this.dbManager, this.sessionManager);
        this.openRouterAgent = new OpenRouterAgent_js_1.OpenRouterAgent(this.dbManager, this.sessionManager);
        this.paginationHelper = new PaginationHelper_js_1.PaginationHelper(this.dbManager);
        this.settingsManager = new SettingsManager_js_1.SettingsManager(this.dbManager);
        this.sessionEventBroadcaster = new SessionEventBroadcaster_js_1.SessionEventBroadcaster(this.sseBroadcaster, this);
        // Set callback for when sessions are deleted
        this.sessionManager.setOnSessionDeleted(function () {
            _this.broadcastProcessingStatus();
        });
        // Initialize MCP client
        // Empty capabilities object: this client only calls tools, doesn't expose any
        this.mcpClient = new index_js_1.Client({
            name: 'worker-search-proxy',
            version: packageVersion
        }, { capabilities: {} });
        // Initialize HTTP server with core routes
        this.server = new Server_js_1.Server({
            getInitializationComplete: function () { return _this.initializationCompleteFlag; },
            getMcpReady: function () { return _this.mcpReady; },
            onShutdown: function () { return _this.shutdown(); },
            onRestart: function () { return _this.shutdown(); },
            workerPath: __filename,
            getAiStatus: function () {
                var provider = 'claude';
                if ((0, OpenRouterAgent_js_1.isOpenRouterSelected)() && (0, OpenRouterAgent_js_1.isOpenRouterAvailable)())
                    provider = 'openrouter';
                else if ((0, GeminiAgent_js_1.isGeminiSelected)() && (0, GeminiAgent_js_1.isGeminiAvailable)())
                    provider = 'gemini';
                return {
                    provider: provider,
                    authMethod: (0, EnvManager_js_1.getAuthMethodDescription)(),
                    lastInteraction: _this.lastAiInteraction
                        ? __assign({ timestamp: _this.lastAiInteraction.timestamp, success: _this.lastAiInteraction.success }, (_this.lastAiInteraction.error && { error: _this.lastAiInteraction.error })) : null,
                };
            },
        });
        // Register route handlers
        this.registerRoutes();
        // Register signal handlers early to ensure cleanup even if start() hasn't completed
        this.registerSignalHandlers();
    }
    /**
     * Register signal handlers for graceful shutdown
     */
    WorkerService.prototype.registerSignalHandlers = function () {
        var _this = this;
        (0, index_js_2.configureSupervisorSignalHandlers)(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.isShuttingDown = true;
                        return [4 /*yield*/, this.shutdown()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * Register all route handlers with the server
     */
    WorkerService.prototype.registerRoutes = function () {
        // IMPORTANT: Middleware must be registered BEFORE routes (Express processes in order)
        var _this = this;
        // Early handler for /api/context/inject — fail open if not yet initialized
        this.server.app.get('/api/context/inject', function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.initializationCompleteFlag || !this.searchRoutes) {
                    logger_js_1.logger.warn('SYSTEM', 'Context requested before initialization complete, returning empty');
                    res.status(200).json({ content: [{ type: 'text', text: '' }] });
                    return [2 /*return*/];
                }
                next(); // Delegate to SearchRoutes handler
                return [2 /*return*/];
            });
        }); });
        // Guard ALL /api/* routes during initialization — wait for DB with timeout
        // Exceptions: /api/health, /api/readiness, /api/version (handled by Server.ts core routes)
        // and /api/context/inject (handled above with fail-open)
        this.server.app.use('/api', function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var timeoutMs, timeoutPromise, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.initializationCompleteFlag) {
                            next();
                            return [2 /*return*/];
                        }
                        timeoutMs = 30000;
                        timeoutPromise = new Promise(function (_, reject) {
                            return setTimeout(function () { return reject(new Error('Database initialization timeout')); }, timeoutMs);
                        });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, Promise.race([this.initializationComplete, timeoutPromise])];
                    case 2:
                        _a.sent();
                        next();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        logger_js_1.logger.error('HTTP', "Request to ".concat(req.method, " ").concat(req.path, " rejected \u2014 DB not initialized"), {}, error_1);
                        res.status(503).json({
                            error: 'Service initializing',
                            message: 'Database is still initializing, please retry'
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        // Standard routes (registered AFTER guard middleware)
        this.server.registerRoutes(new ViewerRoutes_js_1.ViewerRoutes(this.sseBroadcaster, this.dbManager, this.sessionManager));
        this.server.registerRoutes(new SessionRoutes_js_1.SessionRoutes(this.sessionManager, this.dbManager, this.sdkAgent, this.geminiAgent, this.openRouterAgent, this.sessionEventBroadcaster, this));
        this.server.registerRoutes(new DataRoutes_js_1.DataRoutes(this.paginationHelper, this.dbManager, this.sessionManager, this.sseBroadcaster, this, this.startTime));
        this.server.registerRoutes(new SettingsRoutes_js_1.SettingsRoutes(this.settingsManager));
        this.server.registerRoutes(new LogsRoutes_js_1.LogsRoutes());
        this.server.registerRoutes(new MemoryRoutes_js_1.MemoryRoutes(this.dbManager, 'claude-mem'));
    };
    /**
     * Start the worker service
     */
    WorkerService.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var port, host;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        port = (0, worker_utils_js_1.getWorkerPort)();
                        host = (0, worker_utils_js_1.getWorkerHost)();
                        return [4 /*yield*/, (0, index_js_2.startSupervisor)()];
                    case 1:
                        _a.sent();
                        // Start HTTP server FIRST - make it available immediately
                        return [4 /*yield*/, this.server.listen(port, host)];
                    case 2:
                        // Start HTTP server FIRST - make it available immediately
                        _a.sent();
                        // Worker writes its own PID - reliable on all platforms
                        // This happens after listen() succeeds, ensuring the worker is actually ready
                        // On Windows, the spawner's PID is cmd.exe (useless), so worker must write its own
                        (0, ProcessManager_js_1.writePidFile)({
                            pid: process.pid,
                            port: port,
                            startedAt: new Date().toISOString()
                        });
                        (0, index_js_2.getSupervisor)().registerProcess('worker', {
                            pid: process.pid,
                            type: 'worker',
                            startedAt: new Date().toISOString()
                        });
                        logger_js_1.logger.info('SYSTEM', 'Worker started', { host: host, port: port, pid: process.pid });
                        // Do slow initialization in background (non-blocking)
                        this.initializeBackground().catch(function (error) {
                            logger_js_1.logger.error('SYSTEM', 'Background initialization failed', {}, error);
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Background initialization - runs after HTTP server is listening
     */
    WorkerService.prototype.initializeBackground = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ModeManager, SettingsDefaultsManager_1, USER_SETTINGS_PATH, settings, chromaEnabled, modeId, PendingMessageStore, pendingStore, resetCount, formattingService, timelineService, searchManager, mcpServerPath, transport, MCP_INIT_TIMEOUT_MS_1, mcpConnectionPromise, timeoutId_1, timeoutPromise, connectionError_1, _a, mcpProcess, error_2;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 15, , 16]);
                        return [4 /*yield*/, (0, ProcessManager_js_1.aggressiveStartupCleanup)()];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('./domain/ModeManager.js'); })];
                    case 2:
                        ModeManager = (_b.sent()).ModeManager;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../shared/SettingsDefaultsManager.js'); })];
                    case 3:
                        SettingsDefaultsManager_1 = (_b.sent()).SettingsDefaultsManager;
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../shared/paths.js'); })];
                    case 4:
                        USER_SETTINGS_PATH = (_b.sent()).USER_SETTINGS_PATH;
                        settings = SettingsDefaultsManager_1.loadFromFile(USER_SETTINGS_PATH);
                        // One-time chroma wipe for users upgrading from versions with duplicate worker bugs.
                        // Only runs in local mode (chroma is local-only). Backfill at line ~414 rebuilds from SQLite.
                        if (settings.CLAUDE_MEM_MODE === 'local' || !settings.CLAUDE_MEM_MODE) {
                            (0, ProcessManager_js_1.runOneTimeChromaMigration)();
                        }
                        chromaEnabled = settings.CLAUDE_MEM_CHROMA_ENABLED !== 'false';
                        if (chromaEnabled) {
                            this.chromaMcpManager = ChromaMcpManager_js_1.ChromaMcpManager.getInstance();
                            logger_js_1.logger.info('SYSTEM', 'ChromaMcpManager initialized (lazy - connects on first use)');
                        }
                        else {
                            logger_js_1.logger.info('SYSTEM', 'Chroma disabled via CLAUDE_MEM_CHROMA_ENABLED=false, skipping ChromaMcpManager');
                        }
                        modeId = settings.CLAUDE_MEM_MODE;
                        ModeManager.getInstance().loadMode(modeId);
                        logger_js_1.logger.info('SYSTEM', "Mode loaded: ".concat(modeId));
                        return [4 /*yield*/, this.dbManager.initialize()];
                    case 5:
                        _b.sent();
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('./sqlite/PendingMessageStore.js'); })];
                    case 6:
                        PendingMessageStore = (_b.sent()).PendingMessageStore;
                        pendingStore = new PendingMessageStore(this.dbManager.getSessionStore().db, 3);
                        resetCount = pendingStore.resetStaleProcessingMessages(0);
                        if (resetCount > 0) {
                            logger_js_1.logger.info('SYSTEM', "Reset ".concat(resetCount, " stale processing messages to pending"));
                        }
                        formattingService = new FormattingService_js_1.FormattingService();
                        timelineService = new TimelineService_js_1.TimelineService();
                        searchManager = new SearchManager_js_1.SearchManager(this.dbManager.getSessionSearch(), this.dbManager.getSessionStore(), this.dbManager.getChromaSync(), formattingService, timelineService);
                        this.searchRoutes = new SearchRoutes_js_1.SearchRoutes(searchManager);
                        this.server.registerRoutes(this.searchRoutes);
                        logger_js_1.logger.info('WORKER', 'SearchManager initialized and search routes registered');
                        // DB and search are ready — mark initialization complete so hooks can proceed.
                        // MCP connection is tracked separately via mcpReady and is NOT required for
                        // the worker to serve context/search requests.
                        this.initializationCompleteFlag = true;
                        this.resolveInitialization();
                        logger_js_1.logger.info('SYSTEM', 'Core initialization complete (DB + search ready)');
                        // Auto-backfill Chroma for all projects if out of sync with SQLite (fire-and-forget)
                        if (this.chromaMcpManager) {
                            ChromaSync_js_1.ChromaSync.backfillAllProjects().then(function () {
                                logger_js_1.logger.info('CHROMA_SYNC', 'Backfill check complete for all projects');
                            }).catch(function (error) {
                                logger_js_1.logger.error('CHROMA_SYNC', 'Backfill failed (non-blocking)', {}, error);
                            });
                        }
                        mcpServerPath = path_1.default.join(__dirname, 'mcp-server.cjs');
                        (0, index_js_2.getSupervisor)().assertCanSpawn('mcp server');
                        transport = new stdio_js_1.StdioClientTransport({
                            command: 'node',
                            args: [mcpServerPath],
                            env: (0, env_sanitizer_js_1.sanitizeEnv)(process.env)
                        });
                        MCP_INIT_TIMEOUT_MS_1 = 300000;
                        mcpConnectionPromise = this.mcpClient.connect(transport);
                        timeoutPromise = new Promise(function (_, reject) {
                            timeoutId_1 = setTimeout(function () { return reject(new Error('MCP connection timeout after 5 minutes')); }, MCP_INIT_TIMEOUT_MS_1);
                        });
                        _b.label = 7;
                    case 7:
                        _b.trys.push([7, 9, , 14]);
                        return [4 /*yield*/, Promise.race([mcpConnectionPromise, timeoutPromise])];
                    case 8:
                        _b.sent();
                        return [3 /*break*/, 14];
                    case 9:
                        connectionError_1 = _b.sent();
                        clearTimeout(timeoutId_1);
                        logger_js_1.logger.warn('WORKER', 'MCP server connection failed, cleaning up subprocess', {
                            error: connectionError_1 instanceof Error ? connectionError_1.message : String(connectionError_1)
                        });
                        _b.label = 10;
                    case 10:
                        _b.trys.push([10, 12, , 13]);
                        return [4 /*yield*/, transport.close()];
                    case 11:
                        _b.sent();
                        return [3 /*break*/, 13];
                    case 12:
                        _a = _b.sent();
                        return [3 /*break*/, 13];
                    case 13: throw connectionError_1;
                    case 14:
                        clearTimeout(timeoutId_1);
                        mcpProcess = transport._process;
                        if (mcpProcess === null || mcpProcess === void 0 ? void 0 : mcpProcess.pid) {
                            (0, index_js_2.getSupervisor)().registerProcess('mcp-server', {
                                pid: mcpProcess.pid,
                                type: 'mcp',
                                startedAt: new Date().toISOString()
                            }, mcpProcess);
                            mcpProcess.once('exit', function () {
                                (0, index_js_2.getSupervisor)().unregisterProcess('mcp-server');
                            });
                        }
                        this.mcpReady = true;
                        logger_js_1.logger.success('WORKER', 'MCP server connected');
                        // Start orphan reaper to clean up zombie processes (Issue #737)
                        this.stopOrphanReaper = (0, ProcessRegistry_js_1.startOrphanReaper)(function () {
                            var activeIds = new Set();
                            for (var _i = 0, _a = _this.sessionManager['sessions']; _i < _a.length; _i++) {
                                var id = _a[_i][0];
                                activeIds.add(id);
                            }
                            return activeIds;
                        });
                        logger_js_1.logger.info('SYSTEM', 'Started orphan reaper (runs every 30 seconds)');
                        // Reap stale sessions to unblock orphan process cleanup (Issue #1168)
                        this.staleSessionReaperInterval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                            var reaped, e_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, this.sessionManager.reapStaleSessions()];
                                    case 1:
                                        reaped = _a.sent();
                                        if (reaped > 0) {
                                            logger_js_1.logger.info('SYSTEM', "Reaped ".concat(reaped, " stale sessions"));
                                        }
                                        return [3 /*break*/, 3];
                                    case 2:
                                        e_1 = _a.sent();
                                        logger_js_1.logger.error('SYSTEM', 'Stale session reaper error', { error: e_1 instanceof Error ? e_1.message : String(e_1) });
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); }, 2 * 60 * 1000);
                        // Auto-recover orphaned queues (fire-and-forget with error logging)
                        this.processPendingQueues(50).then(function (result) {
                            if (result.sessionsStarted > 0) {
                                logger_js_1.logger.info('SYSTEM', "Auto-recovered ".concat(result.sessionsStarted, " sessions with pending work"), {
                                    totalPending: result.totalPendingSessions,
                                    started: result.sessionsStarted,
                                    sessionIds: result.startedSessionIds
                                });
                            }
                        }).catch(function (error) {
                            logger_js_1.logger.error('SYSTEM', 'Auto-recovery of pending queues failed', {}, error);
                        });
                        return [3 /*break*/, 16];
                    case 15:
                        error_2 = _b.sent();
                        logger_js_1.logger.error('SYSTEM', 'Background initialization failed', {}, error_2);
                        throw error_2;
                    case 16: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get the appropriate agent based on provider settings.
     * Same logic as SessionRoutes.getActiveAgent() for consistency.
     */
    WorkerService.prototype.getActiveAgent = function () {
        if ((0, OpenRouterAgent_js_1.isOpenRouterSelected)() && (0, OpenRouterAgent_js_1.isOpenRouterAvailable)()) {
            return this.openRouterAgent;
        }
        if ((0, GeminiAgent_js_1.isGeminiSelected)() && (0, GeminiAgent_js_1.isGeminiAvailable)()) {
            return this.geminiAgent;
        }
        return this.sdkAgent;
    };
    /**
     * Start a session processor
     * On SDK resume failure (terminated session), falls back to Gemini/OpenRouter if available,
     * otherwise marks messages abandoned and removes session so queue does not grow unbounded.
     */
    WorkerService.prototype.startSessionProcessor = function (session, source) {
        var _this = this;
        if (!session)
            return;
        var sid = session.sessionDbId;
        var agent = this.getActiveAgent();
        var providerName = agent.constructor.name;
        // Before starting generator, check if AbortController is already aborted
        // This can happen after a previous generator was aborted but the session still has pending work
        if (session.abortController.signal.aborted) {
            logger_js_1.logger.debug('SYSTEM', 'Replacing aborted AbortController before starting generator', {
                sessionId: session.sessionDbId
            });
            session.abortController = new AbortController();
        }
        // Track whether generator failed with an unrecoverable error to prevent infinite restart loops
        var hadUnrecoverableError = false;
        var sessionFailed = false;
        logger_js_1.logger.info('SYSTEM', "Starting generator (".concat(source, ") using ").concat(providerName), { sessionId: sid });
        // Track generator activity for stale detection (Issue #1099)
        session.lastGeneratorActivity = Date.now();
        session.generatorPromise = agent.startSession(session, this)
            .catch(function (error) { return __awaiter(_this, void 0, void 0, function () {
            var errorMessage, unrecoverablePatterns;
            return __generator(this, function (_a) {
                errorMessage = (error === null || error === void 0 ? void 0 : error.message) || '';
                unrecoverablePatterns = [
                    'Claude executable not found',
                    'CLAUDE_CODE_PATH',
                    'ENOENT',
                    'spawn',
                    'Invalid API key',
                    'API_KEY_INVALID',
                    'API key expired',
                    'API key not valid',
                    'PERMISSION_DENIED',
                    'Gemini API error: 400',
                    'Gemini API error: 401',
                    'Gemini API error: 403',
                    'FOREIGN KEY constraint failed',
                ];
                if (unrecoverablePatterns.some(function (pattern) { return errorMessage.includes(pattern); })) {
                    hadUnrecoverableError = true;
                    this.lastAiInteraction = {
                        timestamp: Date.now(),
                        success: false,
                        provider: providerName,
                        error: errorMessage,
                    };
                    logger_js_1.logger.error('SDK', 'Unrecoverable generator error - will NOT restart', {
                        sessionId: session.sessionDbId,
                        project: session.project,
                        errorMessage: errorMessage
                    });
                    return [2 /*return*/];
                }
                // Fallback for terminated SDK sessions (provider abstraction)
                if (this.isSessionTerminatedError(error)) {
                    logger_js_1.logger.warn('SDK', 'SDK resume failed, falling back to standalone processing', {
                        sessionId: session.sessionDbId,
                        project: session.project,
                        reason: error instanceof Error ? error.message : String(error)
                    });
                    return [2 /*return*/, this.runFallbackForTerminatedSession(session, error)];
                }
                // Detect stale resume failures - SDK session context was lost
                if ((errorMessage.includes('aborted by user') || errorMessage.includes('No conversation found'))
                    && session.memorySessionId) {
                    logger_js_1.logger.warn('SDK', 'Detected stale resume failure, clearing memorySessionId for fresh start', {
                        sessionId: session.sessionDbId,
                        memorySessionId: session.memorySessionId,
                        errorMessage: errorMessage
                    });
                    // Clear stale memorySessionId and force fresh init on next attempt
                    this.dbManager.getSessionStore().updateMemorySessionId(session.sessionDbId, null);
                    session.memorySessionId = null;
                    session.forceInit = true;
                }
                logger_js_1.logger.error('SDK', 'Session generator failed', {
                    sessionId: session.sessionDbId,
                    project: session.project,
                    provider: providerName
                }, error);
                sessionFailed = true;
                this.lastAiInteraction = {
                    timestamp: Date.now(),
                    success: false,
                    provider: providerName,
                    error: errorMessage,
                };
                throw error;
            });
        }); })
            .finally(function () { return __awaiter(_this, void 0, void 0, function () {
            var trackedProcess, pendingStore, pendingCount, MAX_PENDING_RESTARTS;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        trackedProcess = (0, ProcessRegistry_js_1.getProcessBySession)(session.sessionDbId);
                        if (!(trackedProcess && trackedProcess.process.exitCode === null)) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0, ProcessRegistry_js_1.ensureProcessExit)(trackedProcess, 5000)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        session.generatorPromise = null;
                        // Record successful AI interaction if no error occurred
                        if (!sessionFailed && !hadUnrecoverableError) {
                            this.lastAiInteraction = {
                                timestamp: Date.now(),
                                success: true,
                                provider: providerName,
                            };
                        }
                        // Do NOT restart after unrecoverable errors - prevents infinite loops
                        if (hadUnrecoverableError) {
                            this.terminateSession(session.sessionDbId, 'unrecoverable_error');
                            return [2 /*return*/];
                        }
                        pendingStore = this.sessionManager.getPendingMessageStore();
                        pendingCount = pendingStore.getPendingCount(session.sessionDbId);
                        // Idle timeout means no new work arrived for 3 minutes - don't restart
                        // But check pendingCount first: a message may have arrived between idle
                        // abort and .finally(), and we must not abandon it
                        if (session.idleTimedOut) {
                            session.idleTimedOut = false; // Reset flag
                            if (pendingCount === 0) {
                                this.terminateSession(session.sessionDbId, 'idle_timeout');
                                return [2 /*return*/];
                            }
                            // Fall through to pending-work restart below
                        }
                        MAX_PENDING_RESTARTS = 3;
                        if (pendingCount > 0) {
                            // Track consecutive pending-work restarts to prevent infinite loops (e.g. FK errors)
                            session.consecutiveRestarts = (session.consecutiveRestarts || 0) + 1;
                            if (session.consecutiveRestarts > MAX_PENDING_RESTARTS) {
                                logger_js_1.logger.error('SYSTEM', 'Exceeded max pending-work restarts, stopping to prevent infinite loop', {
                                    sessionId: session.sessionDbId,
                                    pendingCount: pendingCount,
                                    consecutiveRestarts: session.consecutiveRestarts
                                });
                                session.consecutiveRestarts = 0;
                                this.terminateSession(session.sessionDbId, 'max_restarts_exceeded');
                                return [2 /*return*/];
                            }
                            logger_js_1.logger.info('SYSTEM', 'Pending work remains after generator exit, restarting with fresh AbortController', {
                                sessionId: session.sessionDbId,
                                pendingCount: pendingCount,
                                attempt: session.consecutiveRestarts
                            });
                            // Reset AbortController for restart
                            session.abortController = new AbortController();
                            // Restart processor
                            this.startSessionProcessor(session, 'pending-work-restart');
                            this.broadcastProcessingStatus();
                        }
                        else {
                            // Successful completion with no pending work — clean up session
                            // removeSessionImmediate fires onSessionDeletedCallback → broadcastProcessingStatus()
                            session.consecutiveRestarts = 0;
                            this.sessionManager.removeSessionImmediate(session.sessionDbId);
                        }
                        return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * Match errors that indicate the Claude Code process/session is gone (resume impossible).
     * Used to trigger graceful fallback instead of leaving pending messages stuck forever.
     */
    WorkerService.prototype.isSessionTerminatedError = function (error) {
        var msg = error instanceof Error ? error.message : String(error);
        var normalized = msg.toLowerCase();
        return (normalized.includes('process aborted by user') ||
            normalized.includes('processtransport') ||
            normalized.includes('not ready for writing') ||
            normalized.includes('session generator failed') ||
            normalized.includes('claude code process'));
    };
    /**
     * When SDK resume fails due to terminated session: try Gemini then OpenRouter to drain
     * pending messages; if no fallback available, mark messages abandoned and remove session.
     */
    WorkerService.prototype.runFallbackForTerminatedSession = function (session, _originalError) {
        return __awaiter(this, void 0, void 0, function () {
            var sessionDbId, syntheticId, e_2, e_3, pendingStore, abandoned;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!session)
                            return [2 /*return*/];
                        sessionDbId = session.sessionDbId;
                        // Fallback agents need memorySessionId for storeObservations
                        if (!session.memorySessionId) {
                            syntheticId = "fallback-".concat(sessionDbId, "-").concat(Date.now());
                            session.memorySessionId = syntheticId;
                            this.dbManager.getSessionStore().updateMemorySessionId(sessionDbId, syntheticId);
                        }
                        if (!(0, GeminiAgent_js_1.isGeminiAvailable)()) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.geminiAgent.startSession(session, this)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                    case 3:
                        e_2 = _a.sent();
                        logger_js_1.logger.warn('SDK', 'Fallback Gemini failed, trying OpenRouter', {
                            sessionId: sessionDbId,
                            error: e_2 instanceof Error ? e_2.message : String(e_2)
                        });
                        return [3 /*break*/, 4];
                    case 4:
                        if (!(0, OpenRouterAgent_js_1.isOpenRouterAvailable)()) return [3 /*break*/, 8];
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, this.openRouterAgent.startSession(session, this)];
                    case 6:
                        _a.sent();
                        return [2 /*return*/];
                    case 7:
                        e_3 = _a.sent();
                        logger_js_1.logger.warn('SDK', 'Fallback OpenRouter failed', {
                            sessionId: sessionDbId,
                            error: e_3 instanceof Error ? e_3.message : String(e_3)
                        });
                        return [3 /*break*/, 8];
                    case 8:
                        pendingStore = this.sessionManager.getPendingMessageStore();
                        abandoned = pendingStore.markAllSessionMessagesAbandoned(sessionDbId);
                        if (abandoned > 0) {
                            logger_js_1.logger.warn('SDK', 'No fallback available; marked pending messages abandoned', {
                                sessionId: sessionDbId,
                                abandoned: abandoned
                            });
                        }
                        this.sessionManager.removeSessionImmediate(sessionDbId);
                        this.sessionEventBroadcaster.broadcastSessionCompleted(sessionDbId);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Terminate a session that will not restart.
     * Enforces the restart-or-terminate invariant: every generator exit
     * must either call startSessionProcessor() or terminateSession().
     * No zombie sessions allowed.
     *
     * GENERATOR EXIT INVARIANT:
     *   .finally() → restart? → startSessionProcessor()
     *                    no?  → terminateSession()
     */
    WorkerService.prototype.terminateSession = function (sessionDbId, reason) {
        var pendingStore = this.sessionManager.getPendingMessageStore();
        var abandoned = pendingStore.markAllSessionMessagesAbandoned(sessionDbId);
        logger_js_1.logger.info('SYSTEM', 'Session terminated', {
            sessionId: sessionDbId,
            reason: reason,
            abandonedMessages: abandoned
        });
        // removeSessionImmediate fires onSessionDeletedCallback → broadcastProcessingStatus()
        this.sessionManager.removeSessionImmediate(sessionDbId);
    };
    /**
     * Process pending session queues
     */
    WorkerService.prototype.processPendingQueues = function () {
        return __awaiter(this, arguments, void 0, function (sessionLimit) {
            var PendingMessageStore, pendingStore, sessionStore, STALE_SESSION_THRESHOLD_MS, staleThreshold, staleSessionIds, ids, placeholders, msgResult, orphanedSessionIds, result, _i, orphanedSessionIds_1, sessionDbId, existingSession, session, error_3;
            var _a, _b;
            if (sessionLimit === void 0) { sessionLimit = 10; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('./sqlite/PendingMessageStore.js'); })];
                    case 1:
                        PendingMessageStore = (_c.sent()).PendingMessageStore;
                        pendingStore = new PendingMessageStore(this.dbManager.getSessionStore().db, 3);
                        sessionStore = this.dbManager.getSessionStore();
                        STALE_SESSION_THRESHOLD_MS = 6 * 60 * 60 * 1000;
                        staleThreshold = Date.now() - STALE_SESSION_THRESHOLD_MS;
                        try {
                            staleSessionIds = sessionStore.db.prepare("\n        SELECT id FROM sdk_sessions\n        WHERE status = 'active' AND started_at_epoch < ?\n      ").all(staleThreshold);
                            if (staleSessionIds.length > 0) {
                                ids = staleSessionIds.map(function (r) { return r.id; });
                                placeholders = ids.map(function () { return '?'; }).join(',');
                                (_a = sessionStore.db.prepare("\n          UPDATE sdk_sessions\n          SET status = 'failed', completed_at_epoch = ?\n          WHERE id IN (".concat(placeholders, ")\n        "))).run.apply(_a, __spreadArray([Date.now()], ids, false));
                                logger_js_1.logger.info('SYSTEM', "Marked ".concat(ids.length, " stale sessions as failed"));
                                msgResult = (_b = sessionStore.db.prepare("\n          UPDATE pending_messages\n          SET status = 'failed', failed_at_epoch = ?\n          WHERE status = 'pending'\n          AND session_db_id IN (".concat(placeholders, ")\n        "))).run.apply(_b, __spreadArray([Date.now()], ids, false));
                                if (msgResult.changes > 0) {
                                    logger_js_1.logger.info('SYSTEM', "Marked ".concat(msgResult.changes, " pending messages from stale sessions as failed"));
                                }
                            }
                        }
                        catch (error) {
                            logger_js_1.logger.error('SYSTEM', 'Failed to clean up stale sessions', {}, error);
                        }
                        orphanedSessionIds = pendingStore.getSessionsWithPendingMessages();
                        result = {
                            totalPendingSessions: orphanedSessionIds.length,
                            sessionsStarted: 0,
                            sessionsSkipped: 0,
                            startedSessionIds: []
                        };
                        if (orphanedSessionIds.length === 0)
                            return [2 /*return*/, result];
                        logger_js_1.logger.info('SYSTEM', "Processing up to ".concat(sessionLimit, " of ").concat(orphanedSessionIds.length, " pending session queues"));
                        _i = 0, orphanedSessionIds_1 = orphanedSessionIds;
                        _c.label = 2;
                    case 2:
                        if (!(_i < orphanedSessionIds_1.length)) return [3 /*break*/, 7];
                        sessionDbId = orphanedSessionIds_1[_i];
                        if (result.sessionsStarted >= sessionLimit)
                            return [3 /*break*/, 7];
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 5, , 6]);
                        existingSession = this.sessionManager.getSession(sessionDbId);
                        if (existingSession === null || existingSession === void 0 ? void 0 : existingSession.generatorPromise) {
                            result.sessionsSkipped++;
                            return [3 /*break*/, 6];
                        }
                        session = this.sessionManager.initializeSession(sessionDbId);
                        logger_js_1.logger.info('SYSTEM', "Starting processor for session ".concat(sessionDbId), {
                            project: session.project,
                            pendingCount: pendingStore.getPendingCount(sessionDbId)
                        });
                        this.startSessionProcessor(session, 'startup-recovery');
                        result.sessionsStarted++;
                        result.startedSessionIds.push(sessionDbId);
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 100); })];
                    case 4:
                        _c.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_3 = _c.sent();
                        logger_js_1.logger.error('SYSTEM', "Failed to process session ".concat(sessionDbId), {}, error_3);
                        result.sessionsSkipped++;
                        return [3 /*break*/, 6];
                    case 6:
                        _i++;
                        return [3 /*break*/, 2];
                    case 7: return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Shutdown the worker service
     */
    WorkerService.prototype.shutdown = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Stop orphan reaper before shutdown (Issue #737)
                        if (this.stopOrphanReaper) {
                            this.stopOrphanReaper();
                            this.stopOrphanReaper = null;
                        }
                        // Stop stale session reaper (Issue #1168)
                        if (this.staleSessionReaperInterval) {
                            clearInterval(this.staleSessionReaperInterval);
                            this.staleSessionReaperInterval = null;
                        }
                        return [4 /*yield*/, (0, GracefulShutdown_js_1.performGracefulShutdown)({
                                server: this.server.getHttpServer(),
                                sessionManager: this.sessionManager,
                                mcpClient: this.mcpClient,
                                dbManager: this.dbManager,
                                chromaMcpManager: this.chromaMcpManager || undefined
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Broadcast processing status change to SSE clients
     */
    WorkerService.prototype.broadcastProcessingStatus = function () {
        var queueDepth = this.sessionManager.getTotalActiveWork();
        var isProcessing = queueDepth > 0;
        var activeSessions = this.sessionManager.getActiveSessionCount();
        logger_js_1.logger.info('WORKER', 'Broadcasting processing status', {
            isProcessing: isProcessing,
            queueDepth: queueDepth,
            activeSessions: activeSessions
        });
        this.sseBroadcaster.broadcast({
            type: 'processing_status',
            isProcessing: isProcessing,
            queueDepth: queueDepth
        });
    };
    return WorkerService;
}());
exports.WorkerService = WorkerService;
// ============================================================================
// Reusable Worker Startup Logic
// ============================================================================
/**
 * Ensures the worker is started and healthy.
 * This function can be called by both 'start' and 'hook' commands.
 *
 * @param port - The TCP port (used for port-in-use checks and daemon spawn)
 * @returns true if worker is healthy (existing or newly started), false on failure
 */
function ensureWorkerStarted(port) {
    return __awaiter(this, void 0, void 0, function () {
        var pidFileStatus, healthy_1, versionCheck, RESTART_COORDINATION_THRESHOLD_MS, healthy_2, freed, portInUse, healthy_3, pid, healthy, ready;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pidFileStatus = (0, ProcessManager_js_1.cleanStalePidFile)();
                    if (!(pidFileStatus === 'alive')) return [3 /*break*/, 2];
                    logger_js_1.logger.info('SYSTEM', 'Worker PID file points to a live process, skipping duplicate spawn');
                    return [4 /*yield*/, (0, HealthMonitor_js_1.waitForHealth)(port, (0, ProcessManager_js_1.getPlatformTimeout)(hook_constants_js_1.HOOK_TIMEOUTS.PORT_IN_USE_WAIT))];
                case 1:
                    healthy_1 = _a.sent();
                    if (healthy_1) {
                        logger_js_1.logger.info('SYSTEM', 'Worker became healthy while waiting on live PID');
                        return [2 /*return*/, true];
                    }
                    logger_js_1.logger.warn('SYSTEM', 'Live PID detected but worker did not become healthy before timeout');
                    return [2 /*return*/, false];
                case 2: return [4 /*yield*/, (0, HealthMonitor_js_1.waitForHealth)(port, 1000)];
                case 3:
                    if (!_a.sent()) return [3 /*break*/, 10];
                    return [4 /*yield*/, (0, HealthMonitor_js_1.checkVersionMatch)(port)];
                case 4:
                    versionCheck = _a.sent();
                    if (!!versionCheck.matches) return [3 /*break*/, 9];
                    RESTART_COORDINATION_THRESHOLD_MS = 15000;
                    if (!(0, ProcessManager_js_1.isPidFileRecent)(RESTART_COORDINATION_THRESHOLD_MS)) return [3 /*break*/, 6];
                    logger_js_1.logger.info('SYSTEM', 'Version mismatch detected but PID file is recent — another restart likely in progress, polling health', {
                        pluginVersion: versionCheck.pluginVersion,
                        workerVersion: versionCheck.workerVersion
                    });
                    return [4 /*yield*/, (0, HealthMonitor_js_1.waitForHealth)(port, RESTART_COORDINATION_THRESHOLD_MS)];
                case 5:
                    healthy_2 = _a.sent();
                    if (healthy_2) {
                        logger_js_1.logger.info('SYSTEM', 'Worker became healthy after waiting for concurrent restart');
                        return [2 /*return*/, true];
                    }
                    logger_js_1.logger.warn('SYSTEM', 'Worker did not become healthy after waiting — proceeding with own restart');
                    _a.label = 6;
                case 6:
                    logger_js_1.logger.info('SYSTEM', 'Worker version mismatch detected - auto-restarting', {
                        pluginVersion: versionCheck.pluginVersion,
                        workerVersion: versionCheck.workerVersion
                    });
                    return [4 /*yield*/, (0, HealthMonitor_js_1.httpShutdown)(port)];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, (0, HealthMonitor_js_1.waitForPortFree)(port, (0, ProcessManager_js_1.getPlatformTimeout)(hook_constants_js_1.HOOK_TIMEOUTS.PORT_IN_USE_WAIT))];
                case 8:
                    freed = _a.sent();
                    if (!freed) {
                        logger_js_1.logger.error('SYSTEM', 'Port did not free up after shutdown for version mismatch restart', { port: port });
                        return [2 /*return*/, false];
                    }
                    (0, ProcessManager_js_1.removePidFile)();
                    return [3 /*break*/, 10];
                case 9:
                    logger_js_1.logger.info('SYSTEM', 'Worker already running and healthy');
                    return [2 /*return*/, true];
                case 10: return [4 /*yield*/, (0, HealthMonitor_js_1.isPortInUse)(port)];
                case 11:
                    portInUse = _a.sent();
                    if (!portInUse) return [3 /*break*/, 13];
                    logger_js_1.logger.info('SYSTEM', 'Port in use, waiting for worker to become healthy');
                    return [4 /*yield*/, (0, HealthMonitor_js_1.waitForHealth)(port, (0, ProcessManager_js_1.getPlatformTimeout)(hook_constants_js_1.HOOK_TIMEOUTS.PORT_IN_USE_WAIT))];
                case 12:
                    healthy_3 = _a.sent();
                    if (healthy_3) {
                        logger_js_1.logger.info('SYSTEM', 'Worker is now healthy');
                        return [2 /*return*/, true];
                    }
                    logger_js_1.logger.error('SYSTEM', 'Port in use but worker not responding to health checks');
                    return [2 /*return*/, false];
                case 13:
                    // Windows: skip spawn if a recent attempt already failed (prevents repeated bun.exe popups, issue #921)
                    if (shouldSkipSpawnOnWindows()) {
                        logger_js_1.logger.warn('SYSTEM', 'Worker unavailable on Windows — skipping spawn (recent attempt failed within cooldown)');
                        return [2 /*return*/, false];
                    }
                    // Spawn new worker daemon
                    logger_js_1.logger.info('SYSTEM', 'Starting worker daemon');
                    markWorkerSpawnAttempted();
                    pid = (0, ProcessManager_js_1.spawnDaemon)(__filename, port);
                    if (pid === undefined) {
                        logger_js_1.logger.error('SYSTEM', 'Failed to spawn worker daemon');
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, (0, HealthMonitor_js_1.waitForHealth)(port, (0, ProcessManager_js_1.getPlatformTimeout)(hook_constants_js_1.HOOK_TIMEOUTS.POST_SPAWN_WAIT))];
                case 14:
                    healthy = _a.sent();
                    if (!healthy) {
                        (0, ProcessManager_js_1.removePidFile)();
                        logger_js_1.logger.error('SYSTEM', 'Worker failed to start (health check timeout)');
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, (0, HealthMonitor_js_1.waitForReadiness)(port, (0, ProcessManager_js_1.getPlatformTimeout)(hook_constants_js_1.HOOK_TIMEOUTS.READINESS_WAIT))];
                case 15:
                    ready = _a.sent();
                    if (!ready) {
                        logger_js_1.logger.warn('SYSTEM', 'Worker is alive but readiness timed out — proceeding anyway');
                    }
                    clearWorkerSpawnAttempted();
                    // Touch PID file to signal other sessions that a restart just completed.
                    // Other sessions checking isPidFileRecent() will see this and skip their own restart.
                    (0, ProcessManager_js_1.touchPidFile)();
                    logger_js_1.logger.info('SYSTEM', 'Worker started successfully');
                    return [2 /*return*/, true];
            }
        });
    });
}
// ============================================================================
// CLI Entry Point
// ============================================================================
function main() {
    return __awaiter(this, void 0, void 0, function () {
        // Helper for JSON status output in 'start' command
        // Exit code 0 ensures Windows Terminal doesn't keep tabs open
        function exitWithStatus(status, message) {
            var output = buildStatusOutput(status, message);
            console.log(JSON.stringify(output));
            process.exit(0);
        }
        var command, hookInitiatedCommands, port, _a, success, freed, restartFreed, pid, healthy, portInUse, pidInfo, subcommand, cursorResult, platform, event_1, workerReady, hookCommand, dryRun, generateClaudeMd, result, dryRun, cleanClaudeMd, result, existingPidInfo, worker;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    command = process.argv[2];
                    hookInitiatedCommands = ['start', 'hook', 'restart', '--daemon'];
                    if ((hookInitiatedCommands.includes(command) || command === undefined) && (0, plugin_state_js_2.isPluginDisabledInClaudeSettings)()) {
                        process.exit(0);
                    }
                    port = (0, worker_utils_js_1.getWorkerPort)();
                    _a = command;
                    switch (_a) {
                        case 'start': return [3 /*break*/, 1];
                        case 'stop': return [3 /*break*/, 3];
                        case 'restart': return [3 /*break*/, 6];
                        case 'status': return [3 /*break*/, 10];
                        case 'cursor': return [3 /*break*/, 12];
                        case 'hook': return [3 /*break*/, 14];
                        case 'generate': return [3 /*break*/, 18];
                        case 'clean': return [3 /*break*/, 21];
                        case '--daemon': return [3 /*break*/, 24];
                    }
                    return [3 /*break*/, 24];
                case 1: return [4 /*yield*/, ensureWorkerStarted(port)];
                case 2:
                    success = _b.sent();
                    if (success) {
                        exitWithStatus('ready');
                    }
                    else {
                        exitWithStatus('error', 'Failed to start worker');
                    }
                    return [3 /*break*/, 26];
                case 3: return [4 /*yield*/, (0, HealthMonitor_js_1.httpShutdown)(port)];
                case 4:
                    _b.sent();
                    return [4 /*yield*/, (0, HealthMonitor_js_1.waitForPortFree)(port, (0, ProcessManager_js_1.getPlatformTimeout)(15000))];
                case 5:
                    freed = _b.sent();
                    if (!freed) {
                        logger_js_1.logger.warn('SYSTEM', 'Port did not free up after shutdown', { port: port });
                    }
                    (0, ProcessManager_js_1.removePidFile)();
                    logger_js_1.logger.info('SYSTEM', 'Worker stopped successfully');
                    process.exit(0);
                    return [3 /*break*/, 26];
                case 6:
                    logger_js_1.logger.info('SYSTEM', 'Restarting worker');
                    return [4 /*yield*/, (0, HealthMonitor_js_1.httpShutdown)(port)];
                case 7:
                    _b.sent();
                    return [4 /*yield*/, (0, HealthMonitor_js_1.waitForPortFree)(port, (0, ProcessManager_js_1.getPlatformTimeout)(15000))];
                case 8:
                    restartFreed = _b.sent();
                    if (!restartFreed) {
                        logger_js_1.logger.error('SYSTEM', 'Port did not free up after shutdown, aborting restart', { port: port });
                        process.exit(0);
                    }
                    (0, ProcessManager_js_1.removePidFile)();
                    pid = (0, ProcessManager_js_1.spawnDaemon)(__filename, port);
                    if (pid === undefined) {
                        logger_js_1.logger.error('SYSTEM', 'Failed to spawn worker daemon during restart');
                        // Exit gracefully: Windows Terminal won't keep tab open on exit 0
                        // The wrapper/plugin will handle restart logic if needed
                        process.exit(0);
                    }
                    return [4 /*yield*/, (0, HealthMonitor_js_1.waitForHealth)(port, (0, ProcessManager_js_1.getPlatformTimeout)(hook_constants_js_1.HOOK_TIMEOUTS.POST_SPAWN_WAIT))];
                case 9:
                    healthy = _b.sent();
                    if (!healthy) {
                        (0, ProcessManager_js_1.removePidFile)();
                        logger_js_1.logger.error('SYSTEM', 'Worker failed to restart');
                        // Exit gracefully: Windows Terminal won't keep tab open on exit 0
                        // The wrapper/plugin will handle restart logic if needed
                        process.exit(0);
                    }
                    logger_js_1.logger.info('SYSTEM', 'Worker restarted successfully');
                    process.exit(0);
                    return [3 /*break*/, 26];
                case 10: return [4 /*yield*/, (0, HealthMonitor_js_1.isPortInUse)(port)];
                case 11:
                    portInUse = _b.sent();
                    pidInfo = (0, ProcessManager_js_1.readPidFile)();
                    if (portInUse && pidInfo) {
                        console.log('Worker is running');
                        console.log("  PID: ".concat(pidInfo.pid));
                        console.log("  Port: ".concat(pidInfo.port));
                        console.log("  Started: ".concat(pidInfo.startedAt));
                    }
                    else {
                        console.log('Worker is not running');
                    }
                    process.exit(0);
                    return [3 /*break*/, 26];
                case 12:
                    subcommand = process.argv[3];
                    return [4 /*yield*/, (0, CursorHooksInstaller_js_1.handleCursorCommand)(subcommand, process.argv.slice(4))];
                case 13:
                    cursorResult = _b.sent();
                    process.exit(cursorResult);
                    return [3 /*break*/, 26];
                case 14:
                    platform = process.argv[3];
                    event_1 = process.argv[4];
                    if (!platform || !event_1) {
                        console.error('Usage: claude-mem hook <platform> <event>');
                        console.error('Platforms: claude-code, cursor, raw');
                        console.error('Events: context, session-init, observation, summarize, session-complete');
                        process.exit(1);
                    }
                    return [4 /*yield*/, ensureWorkerStarted(port)];
                case 15:
                    workerReady = _b.sent();
                    if (!workerReady) {
                        logger_js_1.logger.warn('SYSTEM', 'Worker failed to start before hook, handler will proceed gracefully');
                    }
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../cli/hook-command.js'); })];
                case 16:
                    hookCommand = (_b.sent()).hookCommand;
                    return [4 /*yield*/, hookCommand(platform, event_1)];
                case 17:
                    _b.sent();
                    return [3 /*break*/, 26];
                case 18:
                    dryRun = process.argv.includes('--dry-run');
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../cli/claude-md-commands.js'); })];
                case 19:
                    generateClaudeMd = (_b.sent()).generateClaudeMd;
                    return [4 /*yield*/, generateClaudeMd(dryRun)];
                case 20:
                    result = _b.sent();
                    process.exit(result);
                    return [3 /*break*/, 26];
                case 21:
                    dryRun = process.argv.includes('--dry-run');
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../cli/claude-md-commands.js'); })];
                case 22:
                    cleanClaudeMd = (_b.sent()).cleanClaudeMd;
                    return [4 /*yield*/, cleanClaudeMd(dryRun)];
                case 23:
                    result = _b.sent();
                    process.exit(result);
                    return [3 /*break*/, 26];
                case 24:
                    existingPidInfo = (0, ProcessManager_js_1.readPidFile)();
                    if (existingPidInfo && (0, ProcessManager_js_1.isProcessAlive)(existingPidInfo.pid)) {
                        logger_js_1.logger.info('SYSTEM', 'Worker already running (PID alive), refusing to start duplicate', {
                            existingPid: existingPidInfo.pid,
                            existingPort: existingPidInfo.port,
                            startedAt: existingPidInfo.startedAt
                        });
                        process.exit(0);
                    }
                    return [4 /*yield*/, (0, HealthMonitor_js_1.isPortInUse)(port)];
                case 25:
                    // GUARD 2: Refuse to start if the port is already bound.
                    // Catches the race where two daemons start simultaneously before
                    // either writes a PID file. Must run BEFORE constructing WorkerService
                    // because the constructor registers signal handlers and timers that
                    // prevent the process from exiting even if listen() fails later.
                    if (_b.sent()) {
                        logger_js_1.logger.info('SYSTEM', 'Port already in use, refusing to start duplicate', { port: port });
                        process.exit(0);
                    }
                    // Prevent daemon from dying silently on unhandled errors.
                    // The HTTP server can continue serving even if a background task throws.
                    process.on('unhandledRejection', function (reason) {
                        logger_js_1.logger.error('SYSTEM', 'Unhandled rejection in daemon', {
                            reason: reason instanceof Error ? reason.message : String(reason)
                        });
                    });
                    process.on('uncaughtException', function (error) {
                        logger_js_1.logger.error('SYSTEM', 'Uncaught exception in daemon', {}, error);
                        // Don't exit — keep the HTTP server running
                    });
                    worker = new WorkerService();
                    worker.start().catch(function (error) {
                        logger_js_1.logger.failure('SYSTEM', 'Worker failed to start', {}, error);
                        (0, ProcessManager_js_1.removePidFile)();
                        // Exit gracefully: Windows Terminal won't keep tab open on exit 0
                        // The wrapper/plugin will handle restart logic if needed
                        process.exit(0);
                    });
                    _b.label = 26;
                case 26: return [2 /*return*/];
            }
        });
    });
}
// Check if running as main module in both ESM and CommonJS
var isMainModule = typeof require !== 'undefined' && typeof module !== 'undefined'
    ? require.main === module || !module.parent
    : import.meta.url === "file://".concat(process.argv[1])
        || ((_a = process.argv[1]) === null || _a === void 0 ? void 0 : _a.endsWith('worker-service'))
        || ((_b = process.argv[1]) === null || _b === void 0 ? void 0 : _b.endsWith('worker-service.cjs'))
        || ((_c = process.argv[1]) === null || _c === void 0 ? void 0 : _c.replaceAll('\\', '/')) === (__filename === null || __filename === void 0 ? void 0 : __filename.replaceAll('\\', '/'));
if (isMainModule) {
    main().catch(function (error) {
        logger_js_1.logger.error('SYSTEM', 'Fatal error in main', {}, error instanceof Error ? error : undefined);
        process.exit(0); // Exit 0: don't block Claude Code, don't leave Windows Terminal tabs open
    });
}
