"use strict";
/**
 * SearchStrategy - Interface for search strategy implementations
 *
 * Each strategy implements a different approach to searching:
 * - ChromaSearchStrategy: Vector-based semantic search via Chroma
 * - SQLiteSearchStrategy: Direct SQLite queries for filter-only searches
 * - HybridSearchStrategy: Metadata filtering + semantic ranking
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseSearchStrategy = void 0;
/**
 * Abstract base class providing common functionality for strategies
 */
var BaseSearchStrategy = /** @class */ (function () {
    function BaseSearchStrategy() {
    }
    /**
     * Create an empty search result
     */
    BaseSearchStrategy.prototype.emptyResult = function (strategy) {
        return {
            results: {
                observations: [],
                sessions: [],
                prompts: []
            },
            usedChroma: strategy === 'chroma' || strategy === 'hybrid',
            fellBack: false,
            strategy: strategy
        };
    };
    return BaseSearchStrategy;
}());
exports.BaseSearchStrategy = BaseSearchStrategy;
