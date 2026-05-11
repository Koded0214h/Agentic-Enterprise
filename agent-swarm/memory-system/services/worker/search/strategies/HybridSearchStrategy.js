"use strict";
/**
 * HybridSearchStrategy - Combines metadata filtering with semantic ranking
 *
 * This strategy provides the best of both worlds:
 * 1. SQLite metadata filter (get all IDs matching criteria)
 * 2. Chroma semantic ranking (rank by relevance)
 * 3. Intersection (keep only IDs from step 1, in rank order from step 2)
 * 4. Hydrate from SQLite in semantic rank order
 *
 * Used for: findByConcept, findByFile, findByType with Chroma available
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
exports.HybridSearchStrategy = void 0;
var SearchStrategy_js_1 = require("./SearchStrategy.js");
var types_js_1 = require("../types.js");
var logger_js_1 = require("../../../../utils/logger.js");
var HybridSearchStrategy = /** @class */ (function (_super) {
    __extends(HybridSearchStrategy, _super);
    function HybridSearchStrategy(chromaSync, sessionStore, sessionSearch) {
        var _this = _super.call(this) || this;
        _this.chromaSync = chromaSync;
        _this.sessionStore = sessionStore;
        _this.sessionSearch = sessionSearch;
        _this.name = 'hybrid';
        return _this;
    }
    HybridSearchStrategy.prototype.canHandle = function (options) {
        // Can handle when we have metadata filters and Chroma is available
        return !!this.chromaSync && (!!options.concepts ||
            !!options.files ||
            (!!options.type && !!options.query) ||
            options.strategyHint === 'hybrid');
    };
    HybridSearchStrategy.prototype.search = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var query, _a, limit, project;
            return __generator(this, function (_b) {
                query = options.query, _a = options.limit, limit = _a === void 0 ? types_js_1.SEARCH_CONSTANTS.DEFAULT_LIMIT : _a, project = options.project;
                if (!query) {
                    return [2 /*return*/, this.emptyResult('hybrid')];
                }
                // For generic hybrid search, use the standard Chroma path
                // More specific operations (findByConcept, etc.) have dedicated methods
                return [2 /*return*/, this.emptyResult('hybrid')];
            });
        });
    };
    /**
     * Find observations by concept with semantic ranking
     * Pattern: Metadata filter -> Chroma ranking -> Intersection -> Hydrate
     */
    HybridSearchStrategy.prototype.findByConcept = function (concept, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, limit, project, dateRange, orderBy, filterOptions, metadataResults, ids, chromaResults, rankedIds_1, observations, error_1, results;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = options.limit, limit = _a === void 0 ? types_js_1.SEARCH_CONSTANTS.DEFAULT_LIMIT : _a, project = options.project, dateRange = options.dateRange, orderBy = options.orderBy;
                        filterOptions = { limit: limit, project: project, dateRange: dateRange, orderBy: orderBy };
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        logger_js_1.logger.debug('SEARCH', 'HybridSearchStrategy: findByConcept', { concept: concept });
                        metadataResults = this.sessionSearch.findByConcept(concept, filterOptions);
                        logger_js_1.logger.debug('SEARCH', 'HybridSearchStrategy: Found metadata matches', {
                            count: metadataResults.length
                        });
                        if (metadataResults.length === 0) {
                            return [2 /*return*/, this.emptyResult('hybrid')];
                        }
                        ids = metadataResults.map(function (obs) { return obs.id; });
                        return [4 /*yield*/, this.chromaSync.queryChroma(concept, Math.min(ids.length, types_js_1.SEARCH_CONSTANTS.CHROMA_BATCH_SIZE))];
                    case 2:
                        chromaResults = _b.sent();
                        rankedIds_1 = this.intersectWithRanking(ids, chromaResults.ids);
                        logger_js_1.logger.debug('SEARCH', 'HybridSearchStrategy: Ranked by semantic relevance', {
                            count: rankedIds_1.length
                        });
                        // Step 4: Hydrate in semantic rank order
                        if (rankedIds_1.length > 0) {
                            observations = this.sessionStore.getObservationsByIds(rankedIds_1, { limit: limit });
                            // Restore semantic ranking order
                            observations.sort(function (a, b) { return rankedIds_1.indexOf(a.id) - rankedIds_1.indexOf(b.id); });
                            return [2 /*return*/, {
                                    results: { observations: observations, sessions: [], prompts: [] },
                                    usedChroma: true,
                                    fellBack: false,
                                    strategy: 'hybrid'
                                }];
                        }
                        return [2 /*return*/, this.emptyResult('hybrid')];
                    case 3:
                        error_1 = _b.sent();
                        logger_js_1.logger.error('SEARCH', 'HybridSearchStrategy: findByConcept failed', {}, error_1);
                        results = this.sessionSearch.findByConcept(concept, filterOptions);
                        return [2 /*return*/, {
                                results: { observations: results, sessions: [], prompts: [] },
                                usedChroma: false,
                                fellBack: true,
                                strategy: 'hybrid'
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Find observations by type with semantic ranking
     */
    HybridSearchStrategy.prototype.findByType = function (type, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, limit, project, dateRange, orderBy, filterOptions, typeStr, metadataResults, ids, chromaResults, rankedIds_2, observations, error_2, results;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = options.limit, limit = _a === void 0 ? types_js_1.SEARCH_CONSTANTS.DEFAULT_LIMIT : _a, project = options.project, dateRange = options.dateRange, orderBy = options.orderBy;
                        filterOptions = { limit: limit, project: project, dateRange: dateRange, orderBy: orderBy };
                        typeStr = Array.isArray(type) ? type.join(', ') : type;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        logger_js_1.logger.debug('SEARCH', 'HybridSearchStrategy: findByType', { type: typeStr });
                        metadataResults = this.sessionSearch.findByType(type, filterOptions);
                        logger_js_1.logger.debug('SEARCH', 'HybridSearchStrategy: Found metadata matches', {
                            count: metadataResults.length
                        });
                        if (metadataResults.length === 0) {
                            return [2 /*return*/, this.emptyResult('hybrid')];
                        }
                        ids = metadataResults.map(function (obs) { return obs.id; });
                        return [4 /*yield*/, this.chromaSync.queryChroma(typeStr, Math.min(ids.length, types_js_1.SEARCH_CONSTANTS.CHROMA_BATCH_SIZE))];
                    case 2:
                        chromaResults = _b.sent();
                        rankedIds_2 = this.intersectWithRanking(ids, chromaResults.ids);
                        logger_js_1.logger.debug('SEARCH', 'HybridSearchStrategy: Ranked by semantic relevance', {
                            count: rankedIds_2.length
                        });
                        // Step 4: Hydrate in rank order
                        if (rankedIds_2.length > 0) {
                            observations = this.sessionStore.getObservationsByIds(rankedIds_2, { limit: limit });
                            observations.sort(function (a, b) { return rankedIds_2.indexOf(a.id) - rankedIds_2.indexOf(b.id); });
                            return [2 /*return*/, {
                                    results: { observations: observations, sessions: [], prompts: [] },
                                    usedChroma: true,
                                    fellBack: false,
                                    strategy: 'hybrid'
                                }];
                        }
                        return [2 /*return*/, this.emptyResult('hybrid')];
                    case 3:
                        error_2 = _b.sent();
                        logger_js_1.logger.error('SEARCH', 'HybridSearchStrategy: findByType failed', {}, error_2);
                        results = this.sessionSearch.findByType(type, filterOptions);
                        return [2 /*return*/, {
                                results: { observations: results, sessions: [], prompts: [] },
                                usedChroma: false,
                                fellBack: true,
                                strategy: 'hybrid'
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Find observations and sessions by file path with semantic ranking
     */
    HybridSearchStrategy.prototype.findByFile = function (filePath, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, limit, project, dateRange, orderBy, filterOptions, metadataResults, sessions, ids, chromaResults, rankedIds_3, observations, error_3, results;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = options.limit, limit = _a === void 0 ? types_js_1.SEARCH_CONSTANTS.DEFAULT_LIMIT : _a, project = options.project, dateRange = options.dateRange, orderBy = options.orderBy;
                        filterOptions = { limit: limit, project: project, dateRange: dateRange, orderBy: orderBy };
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        logger_js_1.logger.debug('SEARCH', 'HybridSearchStrategy: findByFile', { filePath: filePath });
                        metadataResults = this.sessionSearch.findByFile(filePath, filterOptions);
                        logger_js_1.logger.debug('SEARCH', 'HybridSearchStrategy: Found file matches', {
                            observations: metadataResults.observations.length,
                            sessions: metadataResults.sessions.length
                        });
                        sessions = metadataResults.sessions;
                        if (metadataResults.observations.length === 0) {
                            return [2 /*return*/, { observations: [], sessions: sessions, usedChroma: false }];
                        }
                        ids = metadataResults.observations.map(function (obs) { return obs.id; });
                        return [4 /*yield*/, this.chromaSync.queryChroma(filePath, Math.min(ids.length, types_js_1.SEARCH_CONSTANTS.CHROMA_BATCH_SIZE))];
                    case 2:
                        chromaResults = _b.sent();
                        rankedIds_3 = this.intersectWithRanking(ids, chromaResults.ids);
                        logger_js_1.logger.debug('SEARCH', 'HybridSearchStrategy: Ranked observations', {
                            count: rankedIds_3.length
                        });
                        // Step 4: Hydrate in rank order
                        if (rankedIds_3.length > 0) {
                            observations = this.sessionStore.getObservationsByIds(rankedIds_3, { limit: limit });
                            observations.sort(function (a, b) { return rankedIds_3.indexOf(a.id) - rankedIds_3.indexOf(b.id); });
                            return [2 /*return*/, { observations: observations, sessions: sessions, usedChroma: true }];
                        }
                        return [2 /*return*/, { observations: [], sessions: sessions, usedChroma: false }];
                    case 3:
                        error_3 = _b.sent();
                        logger_js_1.logger.error('SEARCH', 'HybridSearchStrategy: findByFile failed', {}, error_3);
                        results = this.sessionSearch.findByFile(filePath, filterOptions);
                        return [2 /*return*/, {
                                observations: results.observations,
                                sessions: results.sessions,
                                usedChroma: false
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Intersect metadata IDs with Chroma IDs, preserving Chroma's rank order
     */
    HybridSearchStrategy.prototype.intersectWithRanking = function (metadataIds, chromaIds) {
        var metadataSet = new Set(metadataIds);
        var rankedIds = [];
        for (var _i = 0, chromaIds_1 = chromaIds; _i < chromaIds_1.length; _i++) {
            var chromaId = chromaIds_1[_i];
            if (metadataSet.has(chromaId) && !rankedIds.includes(chromaId)) {
                rankedIds.push(chromaId);
            }
        }
        return rankedIds;
    };
    return HybridSearchStrategy;
}(SearchStrategy_js_1.BaseSearchStrategy));
exports.HybridSearchStrategy = HybridSearchStrategy;
