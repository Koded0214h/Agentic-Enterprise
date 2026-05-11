"use strict";
/**
 * SearchOrchestrator - Coordinates search strategies and handles fallback logic
 *
 * This is the main entry point for search operations. It:
 * 1. Normalizes input parameters
 * 2. Selects the appropriate strategy
 * 3. Executes the search
 * 4. Handles fallbacks on failure
 * 5. Delegates to formatters for output
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchOrchestrator = void 0;
var ChromaSearchStrategy_js_1 = require("./strategies/ChromaSearchStrategy.js");
var SQLiteSearchStrategy_js_1 = require("./strategies/SQLiteSearchStrategy.js");
var HybridSearchStrategy_js_1 = require("./strategies/HybridSearchStrategy.js");
var ResultFormatter_js_1 = require("./ResultFormatter.js");
var TimelineBuilder_js_1 = require("./TimelineBuilder.js");
var logger_js_1 = require("../../../utils/logger.js");
var SearchOrchestrator = /** @class */ (function () {
    function SearchOrchestrator(sessionSearch, sessionStore, chromaSync) {
        this.sessionSearch = sessionSearch;
        this.sessionStore = sessionStore;
        this.chromaSync = chromaSync;
        this.chromaStrategy = null;
        this.hybridStrategy = null;
        // Initialize strategies
        this.sqliteStrategy = new SQLiteSearchStrategy_js_1.SQLiteSearchStrategy(sessionSearch);
        if (chromaSync) {
            this.chromaStrategy = new ChromaSearchStrategy_js_1.ChromaSearchStrategy(chromaSync, sessionStore);
            this.hybridStrategy = new HybridSearchStrategy_js_1.HybridSearchStrategy(chromaSync, sessionStore, sessionSearch);
        }
        this.resultFormatter = new ResultFormatter_js_1.ResultFormatter();
        this.timelineBuilder = new TimelineBuilder_js_1.TimelineBuilder();
    }
    /**
     * Main search entry point
     */
    SearchOrchestrator.prototype.search = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var options;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = this.normalizeParams(args);
                        return [4 /*yield*/, this.executeWithFallback(options)];
                    case 1: 
                    // Decision tree for strategy selection
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Execute search with fallback logic
     */
    SearchOrchestrator.prototype.executeWithFallback = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var result, fallbackResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!options.query) return [3 /*break*/, 2];
                        logger_js_1.logger.debug('SEARCH', 'Orchestrator: Filter-only query, using SQLite', {});
                        return [4 /*yield*/, this.sqliteStrategy.search(options)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        if (!this.chromaStrategy) return [3 /*break*/, 5];
                        logger_js_1.logger.debug('SEARCH', 'Orchestrator: Using Chroma semantic search', {});
                        return [4 /*yield*/, this.chromaStrategy.search(options)];
                    case 3:
                        result = _a.sent();
                        // If Chroma succeeded (even with 0 results), return
                        if (result.usedChroma) {
                            return [2 /*return*/, result];
                        }
                        // Chroma failed - fall back to SQLite for filter-only
                        logger_js_1.logger.debug('SEARCH', 'Orchestrator: Chroma failed, falling back to SQLite', {});
                        return [4 /*yield*/, this.sqliteStrategy.search(__assign(__assign({}, options), { query: undefined // Remove query for SQLite fallback
                             }))];
                    case 4:
                        fallbackResult = _a.sent();
                        return [2 /*return*/, __assign(__assign({}, fallbackResult), { fellBack: true })];
                    case 5:
                        // PATH 3: No Chroma available
                        logger_js_1.logger.debug('SEARCH', 'Orchestrator: Chroma not available', {});
                        return [2 /*return*/, {
                                results: { observations: [], sessions: [], prompts: [] },
                                usedChroma: false,
                                fellBack: false,
                                strategy: 'sqlite'
                            }];
                }
            });
        });
    };
    /**
     * Find by concept with hybrid search
     */
    SearchOrchestrator.prototype.findByConcept = function (concept, args) {
        return __awaiter(this, void 0, void 0, function () {
            var options, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = this.normalizeParams(args);
                        if (!this.hybridStrategy) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.hybridStrategy.findByConcept(concept, options)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        results = this.sqliteStrategy.findByConcept(concept, options);
                        return [2 /*return*/, {
                                results: { observations: results, sessions: [], prompts: [] },
                                usedChroma: false,
                                fellBack: false,
                                strategy: 'sqlite'
                            }];
                }
            });
        });
    };
    /**
     * Find by type with hybrid search
     */
    SearchOrchestrator.prototype.findByType = function (type, args) {
        return __awaiter(this, void 0, void 0, function () {
            var options, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = this.normalizeParams(args);
                        if (!this.hybridStrategy) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.hybridStrategy.findByType(type, options)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        results = this.sqliteStrategy.findByType(type, options);
                        return [2 /*return*/, {
                                results: { observations: results, sessions: [], prompts: [] },
                                usedChroma: false,
                                fellBack: false,
                                strategy: 'sqlite'
                            }];
                }
            });
        });
    };
    /**
     * Find by file with hybrid search
     */
    SearchOrchestrator.prototype.findByFile = function (filePath, args) {
        return __awaiter(this, void 0, void 0, function () {
            var options, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = this.normalizeParams(args);
                        if (!this.hybridStrategy) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.hybridStrategy.findByFile(filePath, options)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        results = this.sqliteStrategy.findByFile(filePath, options);
                        return [2 /*return*/, __assign(__assign({}, results), { usedChroma: false })];
                }
            });
        });
    };
    /**
     * Get timeline around anchor
     */
    SearchOrchestrator.prototype.getTimeline = function (timelineData, anchorId, anchorEpoch, depthBefore, depthAfter) {
        var items = this.timelineBuilder.buildTimeline(timelineData);
        return this.timelineBuilder.filterByDepth(items, anchorId, anchorEpoch, depthBefore, depthAfter);
    };
    /**
     * Format timeline for display
     */
    SearchOrchestrator.prototype.formatTimeline = function (items, anchorId, options) {
        if (options === void 0) { options = {}; }
        return this.timelineBuilder.formatTimeline(items, anchorId, options);
    };
    /**
     * Format search results for display
     */
    SearchOrchestrator.prototype.formatSearchResults = function (results, query, chromaFailed) {
        if (chromaFailed === void 0) { chromaFailed = false; }
        return this.resultFormatter.formatSearchResults(results, query, chromaFailed);
    };
    /**
     * Get result formatter for direct access
     */
    SearchOrchestrator.prototype.getFormatter = function () {
        return this.resultFormatter;
    };
    /**
     * Get timeline builder for direct access
     */
    SearchOrchestrator.prototype.getTimelineBuilder = function () {
        return this.timelineBuilder;
    };
    /**
     * Normalize query parameters from URL-friendly format
     */
    SearchOrchestrator.prototype.normalizeParams = function (args) {
        var normalized = __assign({}, args);
        // Parse comma-separated concepts into array
        if (normalized.concepts && typeof normalized.concepts === 'string') {
            normalized.concepts = normalized.concepts.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
        }
        // Parse comma-separated files into array
        if (normalized.files && typeof normalized.files === 'string') {
            normalized.files = normalized.files.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
        }
        // Parse comma-separated obs_type into array
        if (normalized.obs_type && typeof normalized.obs_type === 'string') {
            normalized.obsType = normalized.obs_type.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
            delete normalized.obs_type;
        }
        // Parse comma-separated type (for filterSchema) into array
        if (normalized.type && typeof normalized.type === 'string' && normalized.type.includes(',')) {
            normalized.type = normalized.type.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
        }
        // Map 'type' param to 'searchType' for API consistency
        if (normalized.type && !normalized.searchType) {
            if (['observations', 'sessions', 'prompts'].includes(normalized.type)) {
                normalized.searchType = normalized.type;
                delete normalized.type;
            }
        }
        // Flatten dateStart/dateEnd into dateRange object
        if (normalized.dateStart || normalized.dateEnd) {
            normalized.dateRange = {
                start: normalized.dateStart,
                end: normalized.dateEnd
            };
            delete normalized.dateStart;
            delete normalized.dateEnd;
        }
        return normalized;
    };
    /**
     * Check if Chroma is available
     */
    SearchOrchestrator.prototype.isChromaAvailable = function () {
        return !!this.chromaSync;
    };
    return SearchOrchestrator;
}());
exports.SearchOrchestrator = SearchOrchestrator;
