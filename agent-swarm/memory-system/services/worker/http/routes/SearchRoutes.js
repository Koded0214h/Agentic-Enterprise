"use strict";
/**
 * Search Routes
 *
 * Handles all search operations via SearchManager.
 * All endpoints call SearchManager methods directly.
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
exports.SearchRoutes = void 0;
var BaseRouteHandler_js_1 = require("../BaseRouteHandler.js");
var SearchRoutes = /** @class */ (function (_super) {
    __extends(SearchRoutes, _super);
    function SearchRoutes(searchManager) {
        var _this = _super.call(this) || this;
        _this.searchManager = searchManager;
        /**
         * Unified search (observations + sessions + prompts)
         * GET /api/search?query=...&type=observations&limit=20
         */
        _this.handleUnifiedSearch = _this.wrapHandler(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.searchManager.search(req.query)];
                    case 1:
                        result = _a.sent();
                        res.json(result);
                        return [2 /*return*/];
                }
            });
        }); });
        /**
         * Unified timeline (anchor or query-based)
         * GET /api/timeline?anchor=123 OR GET /api/timeline?query=...
         */
        _this.handleUnifiedTimeline = _this.wrapHandler(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.searchManager.timeline(req.query)];
                    case 1:
                        result = _a.sent();
                        res.json(result);
                        return [2 /*return*/];
                }
            });
        }); });
        /**
         * Semantic shortcut for finding decision observations
         * GET /api/decisions?limit=20
         */
        _this.handleDecisions = _this.wrapHandler(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.searchManager.decisions(req.query)];
                    case 1:
                        result = _a.sent();
                        res.json(result);
                        return [2 /*return*/];
                }
            });
        }); });
        /**
         * Semantic shortcut for finding change-related observations
         * GET /api/changes?limit=20
         */
        _this.handleChanges = _this.wrapHandler(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.searchManager.changes(req.query)];
                    case 1:
                        result = _a.sent();
                        res.json(result);
                        return [2 /*return*/];
                }
            });
        }); });
        /**
         * Semantic shortcut for finding "how it works" explanations
         * GET /api/how-it-works?limit=20
         */
        _this.handleHowItWorks = _this.wrapHandler(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.searchManager.howItWorks(req.query)];
                    case 1:
                        result = _a.sent();
                        res.json(result);
                        return [2 /*return*/];
                }
            });
        }); });
        /**
         * Search observations (use /api/search?type=observations instead)
         * GET /api/search/observations?query=...&limit=20&project=...
         */
        _this.handleSearchObservations = _this.wrapHandler(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.searchManager.searchObservations(req.query)];
                    case 1:
                        result = _a.sent();
                        res.json(result);
                        return [2 /*return*/];
                }
            });
        }); });
        /**
         * Search session summaries
         * GET /api/search/sessions?query=...&limit=20
         */
        _this.handleSearchSessions = _this.wrapHandler(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.searchManager.searchSessions(req.query)];
                    case 1:
                        result = _a.sent();
                        res.json(result);
                        return [2 /*return*/];
                }
            });
        }); });
        /**
         * Search user prompts
         * GET /api/search/prompts?query=...&limit=20
         */
        _this.handleSearchPrompts = _this.wrapHandler(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.searchManager.searchUserPrompts(req.query)];
                    case 1:
                        result = _a.sent();
                        res.json(result);
                        return [2 /*return*/];
                }
            });
        }); });
        /**
         * Search observations by concept
         * GET /api/search/by-concept?concept=discovery&limit=5
         */
        _this.handleSearchByConcept = _this.wrapHandler(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.searchManager.findByConcept(req.query)];
                    case 1:
                        result = _a.sent();
                        res.json(result);
                        return [2 /*return*/];
                }
            });
        }); });
        /**
         * Search by file path
         * GET /api/search/by-file?filePath=...&limit=10
         */
        _this.handleSearchByFile = _this.wrapHandler(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.searchManager.findByFile(req.query)];
                    case 1:
                        result = _a.sent();
                        res.json(result);
                        return [2 /*return*/];
                }
            });
        }); });
        /**
         * Search observations by type
         * GET /api/search/by-type?type=bugfix&limit=10
         */
        _this.handleSearchByType = _this.wrapHandler(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.searchManager.findByType(req.query)];
                    case 1:
                        result = _a.sent();
                        res.json(result);
                        return [2 /*return*/];
                }
            });
        }); });
        /**
         * Get recent context (summaries and observations for a project)
         * GET /api/context/recent?project=...&limit=3
         */
        _this.handleGetRecentContext = _this.wrapHandler(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.searchManager.getRecentContext(req.query)];
                    case 1:
                        result = _a.sent();
                        res.json(result);
                        return [2 /*return*/];
                }
            });
        }); });
        /**
         * Get context timeline around an anchor point
         * GET /api/context/timeline?anchor=123&depth_before=10&depth_after=10&project=...
         */
        _this.handleGetContextTimeline = _this.wrapHandler(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.searchManager.getContextTimeline(req.query)];
                    case 1:
                        result = _a.sent();
                        res.json(result);
                        return [2 /*return*/];
                }
            });
        }); });
        /**
         * Generate context preview for settings modal
         * GET /api/context/preview?project=...
         */
        _this.handleContextPreview = _this.wrapHandler(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var projectName, generateContext, cwd, contextText;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        projectName = req.query.project;
                        if (!projectName) {
                            this.badRequest(res, 'Project parameter is required');
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../../context-generator.js'); })];
                    case 1:
                        generateContext = (_a.sent()).generateContext;
                        cwd = "/preview/".concat(projectName);
                        return [4 /*yield*/, generateContext({
                                session_id: 'preview-' + Date.now(),
                                cwd: cwd
                            }, true // useColors=true for ANSI terminal output
                            )];
                    case 2:
                        contextText = _a.sent();
                        // Return as plain text
                        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                        res.send(contextText);
                        return [2 /*return*/];
                }
            });
        }); });
        /**
         * Context injection endpoint for hooks
         * GET /api/context/inject?projects=...&colors=true
         * GET /api/context/inject?project=...&colors=true (legacy, single project)
         *
         * Returns pre-formatted context string ready for display.
         * Use colors=true for ANSI-colored terminal output.
         *
         * For worktrees, pass comma-separated projects (e.g., "main,worktree-branch")
         * to get a unified timeline from both parent and worktree.
         */
        _this.handleContextInject = _this.wrapHandler(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var projectsParam, useColors, full, projects, generateContext, primaryProject, cwd, contextText;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        projectsParam = req.query.projects || req.query.project;
                        useColors = req.query.colors === 'true';
                        full = req.query.full === 'true';
                        if (!projectsParam) {
                            this.badRequest(res, 'Project(s) parameter is required');
                            return [2 /*return*/];
                        }
                        projects = projectsParam.split(',').map(function (p) { return p.trim(); }).filter(Boolean);
                        if (projects.length === 0) {
                            this.badRequest(res, 'At least one project is required');
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('../../../context-generator.js'); })];
                    case 1:
                        generateContext = (_a.sent()).generateContext;
                        primaryProject = projects[projects.length - 1];
                        cwd = "/context/".concat(primaryProject);
                        return [4 /*yield*/, generateContext({
                                session_id: 'context-inject-' + Date.now(),
                                cwd: cwd,
                                projects: projects,
                                full: full
                            }, useColors)];
                    case 2:
                        contextText = _a.sent();
                        // Return as plain text
                        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                        res.send(contextText);
                        return [2 /*return*/];
                }
            });
        }); });
        /**
         * Get timeline by query (search first, then get timeline around best match)
         * GET /api/timeline/by-query?query=...&mode=auto&depth_before=10&depth_after=10
         */
        _this.handleGetTimelineByQuery = _this.wrapHandler(function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.searchManager.getTimelineByQuery(req.query)];
                    case 1:
                        result = _a.sent();
                        res.json(result);
                        return [2 /*return*/];
                }
            });
        }); });
        /**
         * Get search help documentation
         * GET /api/search/help
         */
        _this.handleSearchHelp = _this.wrapHandler(function (req, res) {
            res.json({
                title: 'Claude-Mem Search API',
                description: 'HTTP API for searching persistent memory',
                endpoints: [
                    {
                        path: '/api/search/observations',
                        method: 'GET',
                        description: 'Search observations using full-text search',
                        parameters: {
                            query: 'Search query (required)',
                            limit: 'Number of results (default: 20)',
                            project: 'Filter by project name (optional)'
                        }
                    },
                    {
                        path: '/api/search/sessions',
                        method: 'GET',
                        description: 'Search session summaries using full-text search',
                        parameters: {
                            query: 'Search query (required)',
                            limit: 'Number of results (default: 20)'
                        }
                    },
                    {
                        path: '/api/search/prompts',
                        method: 'GET',
                        description: 'Search user prompts using full-text search',
                        parameters: {
                            query: 'Search query (required)',
                            limit: 'Number of results (default: 20)',
                            project: 'Filter by project name (optional)'
                        }
                    },
                    {
                        path: '/api/search/by-concept',
                        method: 'GET',
                        description: 'Find observations by concept tag',
                        parameters: {
                            concept: 'Concept tag (required): discovery, decision, bugfix, feature, refactor',
                            limit: 'Number of results (default: 10)',
                            project: 'Filter by project name (optional)'
                        }
                    },
                    {
                        path: '/api/search/by-file',
                        method: 'GET',
                        description: 'Find observations and sessions by file path',
                        parameters: {
                            filePath: 'File path or partial path (required)',
                            limit: 'Number of results per type (default: 10)',
                            project: 'Filter by project name (optional)'
                        }
                    },
                    {
                        path: '/api/search/by-type',
                        method: 'GET',
                        description: 'Find observations by type',
                        parameters: {
                            type: 'Observation type (required): discovery, decision, bugfix, feature, refactor',
                            limit: 'Number of results (default: 10)',
                            project: 'Filter by project name (optional)'
                        }
                    },
                    {
                        path: '/api/context/recent',
                        method: 'GET',
                        description: 'Get recent session context including summaries and observations',
                        parameters: {
                            project: 'Project name (default: current directory)',
                            limit: 'Number of recent sessions (default: 3)'
                        }
                    },
                    {
                        path: '/api/context/timeline',
                        method: 'GET',
                        description: 'Get unified timeline around a specific point in time',
                        parameters: {
                            anchor: 'Anchor point: observation ID, session ID (e.g., "S123"), or ISO timestamp (required)',
                            depth_before: 'Number of records before anchor (default: 10)',
                            depth_after: 'Number of records after anchor (default: 10)',
                            project: 'Filter by project name (optional)'
                        }
                    },
                    {
                        path: '/api/timeline/by-query',
                        method: 'GET',
                        description: 'Search for best match, then get timeline around it',
                        parameters: {
                            query: 'Search query (required)',
                            mode: 'Search mode: "auto", "observations", or "sessions" (default: "auto")',
                            depth_before: 'Number of records before match (default: 10)',
                            depth_after: 'Number of records after match (default: 10)',
                            project: 'Filter by project name (optional)'
                        }
                    },
                    {
                        path: '/api/search/help',
                        method: 'GET',
                        description: 'Get this help documentation'
                    }
                ],
                examples: [
                    'curl "http://localhost:37777/api/search/observations?query=authentication&limit=5"',
                    'curl "http://localhost:37777/api/search/by-type?type=bugfix&limit=10"',
                    'curl "http://localhost:37777/api/context/recent?project=claude-mem&limit=3"',
                    'curl "http://localhost:37777/api/context/timeline?anchor=123&depth_before=5&depth_after=5"'
                ]
            });
        });
        return _this;
    }
    SearchRoutes.prototype.setupRoutes = function (app) {
        // Unified endpoints (new consolidated API)
        app.get('/api/search', this.handleUnifiedSearch.bind(this));
        app.get('/api/timeline', this.handleUnifiedTimeline.bind(this));
        app.get('/api/decisions', this.handleDecisions.bind(this));
        app.get('/api/changes', this.handleChanges.bind(this));
        app.get('/api/how-it-works', this.handleHowItWorks.bind(this));
        // Backward compatibility endpoints
        app.get('/api/search/observations', this.handleSearchObservations.bind(this));
        app.get('/api/search/sessions', this.handleSearchSessions.bind(this));
        app.get('/api/search/prompts', this.handleSearchPrompts.bind(this));
        app.get('/api/search/by-concept', this.handleSearchByConcept.bind(this));
        app.get('/api/search/by-file', this.handleSearchByFile.bind(this));
        app.get('/api/search/by-type', this.handleSearchByType.bind(this));
        // Context endpoints
        app.get('/api/context/recent', this.handleGetRecentContext.bind(this));
        app.get('/api/context/timeline', this.handleGetContextTimeline.bind(this));
        app.get('/api/context/preview', this.handleContextPreview.bind(this));
        app.get('/api/context/inject', this.handleContextInject.bind(this));
        // Timeline and help endpoints
        app.get('/api/timeline/by-query', this.handleGetTimelineByQuery.bind(this));
        app.get('/api/search/help', this.handleSearchHelp.bind(this));
    };
    return SearchRoutes;
}(BaseRouteHandler_js_1.BaseRouteHandler));
exports.SearchRoutes = SearchRoutes;
