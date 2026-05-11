"use strict";
/**
 * ChromaSearchStrategy - Vector-based semantic search via Chroma
 *
 * This strategy handles semantic search queries using ChromaDB:
 * 1. Query Chroma for semantically similar documents
 * 2. Filter by recency (90-day window)
 * 3. Categorize by document type
 * 4. Hydrate from SQLite
 *
 * Used when: Query text is provided and Chroma is available
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
exports.ChromaSearchStrategy = void 0;
var SearchStrategy_js_1 = require("./SearchStrategy.js");
var types_js_1 = require("../types.js");
var logger_js_1 = require("../../../../utils/logger.js");
var ChromaSearchStrategy = /** @class */ (function (_super) {
    __extends(ChromaSearchStrategy, _super);
    function ChromaSearchStrategy(chromaSync, sessionStore) {
        var _this = _super.call(this) || this;
        _this.chromaSync = chromaSync;
        _this.sessionStore = sessionStore;
        _this.name = 'chroma';
        return _this;
    }
    ChromaSearchStrategy.prototype.canHandle = function (options) {
        // Can handle when query text is provided and Chroma is available
        return !!options.query && !!this.chromaSync;
    };
    ChromaSearchStrategy.prototype.search = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var query, _a, searchType, obsType, concepts, files, _b, limit, project, _c, orderBy, searchObservations, searchSessions, searchPrompts, observations, sessions, prompts, whereFilter, chromaResults, recentItems, categorized, obsOptions, error_1;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        query = options.query, _a = options.searchType, searchType = _a === void 0 ? 'all' : _a, obsType = options.obsType, concepts = options.concepts, files = options.files, _b = options.limit, limit = _b === void 0 ? types_js_1.SEARCH_CONSTANTS.DEFAULT_LIMIT : _b, project = options.project, _c = options.orderBy, orderBy = _c === void 0 ? 'date_desc' : _c;
                        if (!query) {
                            return [2 /*return*/, this.emptyResult('chroma')];
                        }
                        searchObservations = searchType === 'all' || searchType === 'observations';
                        searchSessions = searchType === 'all' || searchType === 'sessions';
                        searchPrompts = searchType === 'all' || searchType === 'prompts';
                        observations = [];
                        sessions = [];
                        prompts = [];
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 3, , 4]);
                        whereFilter = this.buildWhereFilter(searchType, project);
                        // Step 1: Chroma semantic search
                        logger_js_1.logger.debug('SEARCH', 'ChromaSearchStrategy: Querying Chroma', { query: query, searchType: searchType });
                        return [4 /*yield*/, this.chromaSync.queryChroma(query, types_js_1.SEARCH_CONSTANTS.CHROMA_BATCH_SIZE, whereFilter)];
                    case 2:
                        chromaResults = _d.sent();
                        logger_js_1.logger.debug('SEARCH', 'ChromaSearchStrategy: Chroma returned matches', {
                            matchCount: chromaResults.ids.length
                        });
                        if (chromaResults.ids.length === 0) {
                            // No matches - this is the correct answer
                            return [2 /*return*/, {
                                    results: { observations: [], sessions: [], prompts: [] },
                                    usedChroma: true,
                                    fellBack: false,
                                    strategy: 'chroma'
                                }];
                        }
                        recentItems = this.filterByRecency(chromaResults);
                        logger_js_1.logger.debug('SEARCH', 'ChromaSearchStrategy: Filtered by recency', {
                            count: recentItems.length
                        });
                        categorized = this.categorizeByDocType(recentItems, {
                            searchObservations: searchObservations,
                            searchSessions: searchSessions,
                            searchPrompts: searchPrompts
                        });
                        // Step 4: Hydrate from SQLite with additional filters
                        if (categorized.obsIds.length > 0) {
                            obsOptions = { type: obsType, concepts: concepts, files: files, orderBy: orderBy, limit: limit, project: project };
                            observations = this.sessionStore.getObservationsByIds(categorized.obsIds, obsOptions);
                        }
                        if (categorized.sessionIds.length > 0) {
                            sessions = this.sessionStore.getSessionSummariesByIds(categorized.sessionIds, {
                                orderBy: orderBy,
                                limit: limit,
                                project: project
                            });
                        }
                        if (categorized.promptIds.length > 0) {
                            prompts = this.sessionStore.getUserPromptsByIds(categorized.promptIds, {
                                orderBy: orderBy,
                                limit: limit,
                                project: project
                            });
                        }
                        logger_js_1.logger.debug('SEARCH', 'ChromaSearchStrategy: Hydrated results', {
                            observations: observations.length,
                            sessions: sessions.length,
                            prompts: prompts.length
                        });
                        return [2 /*return*/, {
                                results: { observations: observations, sessions: sessions, prompts: prompts },
                                usedChroma: true,
                                fellBack: false,
                                strategy: 'chroma'
                            }];
                    case 3:
                        error_1 = _d.sent();
                        logger_js_1.logger.error('SEARCH', 'ChromaSearchStrategy: Search failed', {}, error_1);
                        // Return empty result - caller may try fallback strategy
                        return [2 /*return*/, {
                                results: { observations: [], sessions: [], prompts: [] },
                                usedChroma: false,
                                fellBack: false,
                                strategy: 'chroma'
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Build Chroma where filter for document type and project
     *
     * When a project is specified, includes it in the ChromaDB where clause
     * so that vector search is scoped to the target project. Without this,
     * larger projects dominate the top-N results and smaller projects get
     * crowded out before the post-hoc SQLite project filter can take effect.
     */
    ChromaSearchStrategy.prototype.buildWhereFilter = function (searchType, project) {
        var docTypeFilter;
        switch (searchType) {
            case 'observations':
                docTypeFilter = { doc_type: 'observation' };
                break;
            case 'sessions':
                docTypeFilter = { doc_type: 'session_summary' };
                break;
            case 'prompts':
                docTypeFilter = { doc_type: 'user_prompt' };
                break;
            default:
                docTypeFilter = undefined;
        }
        if (project) {
            var projectFilter = { project: project };
            if (docTypeFilter) {
                return { $and: [docTypeFilter, projectFilter] };
            }
            return projectFilter;
        }
        return docTypeFilter;
    };
    /**
     * Filter results by recency (90-day window)
     *
     * IMPORTANT: ChromaSync.queryChroma() returns deduplicated `ids` (unique sqlite_ids)
     * but the `metadatas` array may contain multiple entries per sqlite_id (e.g., one
     * observation can have narrative + multiple facts as separate Chroma documents).
     *
     * This method iterates over the deduplicated `ids` and finds the first matching
     * metadata for each ID to avoid array misalignment issues.
     */
    ChromaSearchStrategy.prototype.filterByRecency = function (chromaResults) {
        var cutoff = Date.now() - types_js_1.SEARCH_CONSTANTS.RECENCY_WINDOW_MS;
        // Build a map from sqlite_id to first metadata for efficient lookup
        var metadataByIdMap = new Map();
        for (var _i = 0, _a = chromaResults.metadatas; _i < _a.length; _i++) {
            var meta = _a[_i];
            if ((meta === null || meta === void 0 ? void 0 : meta.sqlite_id) !== undefined && !metadataByIdMap.has(meta.sqlite_id)) {
                metadataByIdMap.set(meta.sqlite_id, meta);
            }
        }
        // Iterate over deduplicated ids and get corresponding metadata
        return chromaResults.ids
            .map(function (id) { return ({
            id: id,
            meta: metadataByIdMap.get(id)
        }); })
            .filter(function (item) { return item.meta && item.meta.created_at_epoch > cutoff; });
    };
    /**
     * Categorize IDs by document type
     */
    ChromaSearchStrategy.prototype.categorizeByDocType = function (items, options) {
        var _a;
        var obsIds = [];
        var sessionIds = [];
        var promptIds = [];
        for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
            var item = items_1[_i];
            var docType = (_a = item.meta) === null || _a === void 0 ? void 0 : _a.doc_type;
            if (docType === 'observation' && options.searchObservations) {
                obsIds.push(item.id);
            }
            else if (docType === 'session_summary' && options.searchSessions) {
                sessionIds.push(item.id);
            }
            else if (docType === 'user_prompt' && options.searchPrompts) {
                promptIds.push(item.id);
            }
        }
        return { obsIds: obsIds, sessionIds: sessionIds, promptIds: promptIds };
    };
    return ChromaSearchStrategy;
}(SearchStrategy_js_1.BaseSearchStrategy));
exports.ChromaSearchStrategy = ChromaSearchStrategy;
