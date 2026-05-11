"use strict";
/**
 * Server - Express app setup and route registration
 *
 * Extracted from worker-service.ts monolith to provide centralized HTTP server management.
 * Handles:
 * - Express app creation and configuration
 * - Middleware registration
 * - Route registration (delegates to route handlers)
 * - Core system endpoints (health, readiness, version, admin)
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
exports.Server = void 0;
var express_1 = require("express");
var fs = require("fs");
var path_1 = require("path");
var allowed_constants_js_1 = require("./allowed-constants.js");
var logger_js_1 = require("../../utils/logger.js");
var Middleware_js_1 = require("./Middleware.js");
var ErrorHandler_js_1 = require("./ErrorHandler.js");
var index_js_1 = require("../../supervisor/index.js");
var process_registry_js_1 = require("../../supervisor/process-registry.js");
var env_sanitizer_js_1 = require("../../supervisor/env-sanitizer.js");
var BUILT_IN_VERSION = typeof __DEFAULT_PACKAGE_VERSION__ !== 'undefined'
    ? __DEFAULT_PACKAGE_VERSION__
    : 'development';
/**
 * Express application and HTTP server wrapper
 * Provides centralized setup for middleware and routes
 */
var Server = /** @class */ (function () {
    function Server(options) {
        this.server = null;
        this.startTime = Date.now();
        this.options = options;
        this.app = (0, express_1.default)();
        this.setupMiddleware();
        this.setupCoreRoutes();
    }
    /**
     * Get the underlying HTTP server
     */
    Server.prototype.getHttpServer = function () {
        return this.server;
    };
    /**
     * Start listening on the specified host and port
     */
    Server.prototype.listen = function (port, host) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.server = _this.app.listen(port, host, function () {
                            logger_js_1.logger.info('SYSTEM', 'HTTP server started', { host: host, port: port, pid: process.pid });
                            resolve();
                        });
                        _this.server.on('error', reject);
                    })];
            });
        });
    };
    /**
     * Close the HTTP server
     */
    Server.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.server)
                            return [2 /*return*/];
                        // Close all active connections
                        this.server.closeAllConnections();
                        if (!(process.platform === 'win32')) return [3 /*break*/, 2];
                        return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 500); })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: 
                    // Close the server
                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                            _this.server.close(function (err) { return err ? reject(err) : resolve(); });
                        })];
                    case 3:
                        // Close the server
                        _a.sent();
                        if (!(process.platform === 'win32')) return [3 /*break*/, 5];
                        return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 500); })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        this.server = null;
                        logger_js_1.logger.info('SYSTEM', 'HTTP server closed');
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Register a route handler
     */
    Server.prototype.registerRoutes = function (handler) {
        handler.setupRoutes(this.app);
    };
    /**
     * Finalize route setup by adding error handlers
     * Call this after all routes have been registered
     */
    Server.prototype.finalizeRoutes = function () {
        // 404 handler for unmatched routes
        this.app.use(ErrorHandler_js_1.notFoundHandler);
        // Global error handler (must be last)
        this.app.use(ErrorHandler_js_1.errorHandler);
    };
    /**
     * Setup Express middleware
     */
    Server.prototype.setupMiddleware = function () {
        var _this = this;
        var middlewares = (0, Middleware_js_1.createMiddleware)(Middleware_js_1.summarizeRequestBody);
        middlewares.forEach(function (mw) { return _this.app.use(mw); });
    };
    /**
     * Setup core system routes (health, readiness, version, admin)
     */
    Server.prototype.setupCoreRoutes = function () {
        var _this = this;
        // Health check endpoint - always responds, even during initialization
        this.app.get('/api/health', function (_req, res) {
            res.status(200).json({
                status: 'ok',
                version: BUILT_IN_VERSION,
                workerPath: _this.options.workerPath,
                uptime: Date.now() - _this.startTime,
                managed: process.env.CLAUDE_MEM_MANAGED === 'true',
                hasIpc: typeof process.send === 'function',
                platform: process.platform,
                pid: process.pid,
                initialized: _this.options.getInitializationComplete(),
                mcpReady: _this.options.getMcpReady(),
                ai: _this.options.getAiStatus(),
            });
        });
        // Readiness check endpoint - returns 503 until full initialization completes
        this.app.get('/api/readiness', function (_req, res) {
            if (_this.options.getInitializationComplete()) {
                res.status(200).json({
                    status: 'ready',
                    mcpReady: _this.options.getMcpReady(),
                });
            }
            else {
                res.status(503).json({
                    status: 'initializing',
                    message: 'Worker is still initializing, please retry',
                });
            }
        });
        // Version endpoint - returns the worker's built-in version
        this.app.get('/api/version', function (_req, res) {
            res.status(200).json({ version: BUILT_IN_VERSION });
        });
        // Instructions endpoint - loads SKILL.md sections on-demand
        this.app.get('/api/instructions', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var topic, operation, content, OPERATIONS_BASE_DIR, operationPath, skillPath, fullContent, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        topic = req.query.topic || 'all';
                        operation = req.query.operation;
                        // Validate topic
                        if (topic && !allowed_constants_js_1.ALLOWED_TOPICS.includes(topic)) {
                            return [2 /*return*/, res.status(400).json({ error: 'Invalid topic' })];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        content = void 0;
                        if (!operation) return [3 /*break*/, 3];
                        // Validate operation
                        if (!allowed_constants_js_1.ALLOWED_OPERATIONS.includes(operation)) {
                            return [2 /*return*/, res.status(400).json({ error: 'Invalid operation' })];
                        }
                        OPERATIONS_BASE_DIR = path_1.default.resolve(__dirname, '../skills/mem-search/operations');
                        operationPath = path_1.default.resolve(OPERATIONS_BASE_DIR, "".concat(operation, ".md"));
                        if (!operationPath.startsWith(OPERATIONS_BASE_DIR + path_1.default.sep)) {
                            return [2 /*return*/, res.status(400).json({ error: 'Invalid request' })];
                        }
                        return [4 /*yield*/, fs.promises.readFile(operationPath, 'utf-8')];
                    case 2:
                        content = _a.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        skillPath = path_1.default.join(__dirname, '../skills/mem-search/SKILL.md');
                        return [4 /*yield*/, fs.promises.readFile(skillPath, 'utf-8')];
                    case 4:
                        fullContent = _a.sent();
                        content = this.extractInstructionSection(fullContent, topic);
                        _a.label = 5;
                    case 5:
                        res.json({
                            content: [{ type: 'text', text: content }]
                        });
                        return [3 /*break*/, 7];
                    case 6:
                        error_1 = _a.sent();
                        res.status(404).json({ error: 'Instruction not found' });
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        }); });
        // Admin endpoints for process management (localhost-only)
        this.app.post('/api/admin/restart', Middleware_js_1.requireLocalhost, function (_req, res) { return __awaiter(_this, void 0, void 0, function () {
            var isWindowsManaged;
            var _this = this;
            return __generator(this, function (_a) {
                res.json({ status: 'restarting' });
                isWindowsManaged = process.platform === 'win32' &&
                    process.env.CLAUDE_MEM_MANAGED === 'true' &&
                    process.send;
                if (isWindowsManaged) {
                    logger_js_1.logger.info('SYSTEM', 'Sending restart request to wrapper');
                    process.send({ type: 'restart' });
                }
                else {
                    // Unix or standalone Windows - handle restart ourselves
                    // The spawner (ensureWorkerStarted/restart command) handles spawning the new daemon.
                    // This process just needs to shut down and exit.
                    setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, , 2, 3]);
                                    return [4 /*yield*/, this.options.onRestart()];
                                case 1:
                                    _a.sent();
                                    return [3 /*break*/, 3];
                                case 2:
                                    process.exit(0);
                                    return [7 /*endfinally*/];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); }, 100);
                }
                return [2 /*return*/];
            });
        }); });
        this.app.post('/api/admin/shutdown', Middleware_js_1.requireLocalhost, function (_req, res) { return __awaiter(_this, void 0, void 0, function () {
            var isWindowsManaged;
            var _this = this;
            return __generator(this, function (_a) {
                res.json({ status: 'shutting_down' });
                isWindowsManaged = process.platform === 'win32' &&
                    process.env.CLAUDE_MEM_MANAGED === 'true' &&
                    process.send;
                if (isWindowsManaged) {
                    logger_js_1.logger.info('SYSTEM', 'Sending shutdown request to wrapper');
                    process.send({ type: 'shutdown' });
                }
                else {
                    // Unix or standalone Windows - handle shutdown ourselves
                    setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, , 2, 3]);
                                    return [4 /*yield*/, this.options.onShutdown()];
                                case 1:
                                    _a.sent();
                                    return [3 /*break*/, 3];
                                case 2:
                                    // CRITICAL: Exit the process after shutdown completes (or fails).
                                    // Without this, the daemon stays alive as a zombie — background tasks
                                    // (backfill, reconnects) keep running and respawn chroma-mcp subprocesses.
                                    process.exit(0);
                                    return [7 /*endfinally*/];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); }, 100);
                }
                return [2 /*return*/];
            });
        }); });
        // Doctor endpoint - diagnostic view of supervisor, processes, and health
        this.app.get('/api/admin/doctor', Middleware_js_1.requireLocalhost, function (_req, res) {
            var supervisor = (0, index_js_1.getSupervisor)();
            var registry = supervisor.getRegistry();
            var allRecords = registry.getAll();
            // Check each process liveness
            var processes = allRecords.map(function (record) { return ({
                id: record.id,
                pid: record.pid,
                type: record.type,
                status: (0, process_registry_js_1.isPidAlive)(record.pid) ? 'alive' : 'dead',
                startedAt: record.startedAt,
            }); });
            // Check for dead processes still in registry
            var deadProcessPids = processes.filter(function (p) { return p.status === 'dead'; }).map(function (p) { return p.pid; });
            // Check if CLAUDECODE_* env vars are leaking into this process
            var envClean = !Object.keys(process.env).some(function (key) {
                return env_sanitizer_js_1.ENV_EXACT_MATCHES.has(key) || env_sanitizer_js_1.ENV_PREFIXES.some(function (prefix) { return key.startsWith(prefix); });
            });
            // Format uptime
            var uptimeMs = Date.now() - _this.startTime;
            var uptimeSeconds = Math.floor(uptimeMs / 1000);
            var hours = Math.floor(uptimeSeconds / 3600);
            var minutes = Math.floor((uptimeSeconds % 3600) / 60);
            var formattedUptime = hours > 0 ? "".concat(hours, "h ").concat(minutes, "m") : "".concat(minutes, "m");
            res.json({
                supervisor: {
                    running: true,
                    pid: process.pid,
                    uptime: formattedUptime,
                },
                processes: processes,
                health: {
                    deadProcessPids: deadProcessPids,
                    envClean: envClean,
                },
            });
        });
    };
    /**
     * Extract a specific section from instruction content
     */
    Server.prototype.extractInstructionSection = function (content, topic) {
        var sections = {
            'workflow': this.extractBetween(content, '## The Workflow', '## Search Parameters'),
            'search_params': this.extractBetween(content, '## Search Parameters', '## Examples'),
            'examples': this.extractBetween(content, '## Examples', '## Why This Workflow'),
            'all': content
        };
        return sections[topic] || sections['all'];
    };
    /**
     * Extract text between two markers
     */
    Server.prototype.extractBetween = function (content, startMarker, endMarker) {
        var startIdx = content.indexOf(startMarker);
        var endIdx = content.indexOf(endMarker);
        if (startIdx === -1)
            return content;
        if (endIdx === -1)
            return content.substring(startIdx);
        return content.substring(startIdx, endIdx).trim();
    };
    return Server;
}());
exports.Server = Server;
