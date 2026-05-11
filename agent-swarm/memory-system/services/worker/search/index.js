"use strict";
/**
 * Search Module - Named exports for search functionality
 *
 * This is the public API for the search module.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HybridSearchStrategy = exports.SQLiteSearchStrategy = exports.ChromaSearchStrategy = exports.BaseSearchStrategy = exports.TimelineBuilder = exports.ResultFormatter = exports.SearchOrchestrator = void 0;
// Main orchestrator
var SearchOrchestrator_js_1 = require("./SearchOrchestrator.js");
Object.defineProperty(exports, "SearchOrchestrator", { enumerable: true, get: function () { return SearchOrchestrator_js_1.SearchOrchestrator; } });
// Formatters
var ResultFormatter_js_1 = require("./ResultFormatter.js");
Object.defineProperty(exports, "ResultFormatter", { enumerable: true, get: function () { return ResultFormatter_js_1.ResultFormatter; } });
var TimelineBuilder_js_1 = require("./TimelineBuilder.js");
Object.defineProperty(exports, "TimelineBuilder", { enumerable: true, get: function () { return TimelineBuilder_js_1.TimelineBuilder; } });
var SearchStrategy_js_1 = require("./strategies/SearchStrategy.js");
Object.defineProperty(exports, "BaseSearchStrategy", { enumerable: true, get: function () { return SearchStrategy_js_1.BaseSearchStrategy; } });
var ChromaSearchStrategy_js_1 = require("./strategies/ChromaSearchStrategy.js");
Object.defineProperty(exports, "ChromaSearchStrategy", { enumerable: true, get: function () { return ChromaSearchStrategy_js_1.ChromaSearchStrategy; } });
var SQLiteSearchStrategy_js_1 = require("./strategies/SQLiteSearchStrategy.js");
Object.defineProperty(exports, "SQLiteSearchStrategy", { enumerable: true, get: function () { return SQLiteSearchStrategy_js_1.SQLiteSearchStrategy; } });
var HybridSearchStrategy_js_1 = require("./strategies/HybridSearchStrategy.js");
Object.defineProperty(exports, "HybridSearchStrategy", { enumerable: true, get: function () { return HybridSearchStrategy_js_1.HybridSearchStrategy; } });
// Filters
__exportStar(require("./filters/DateFilter.js"), exports);
__exportStar(require("./filters/ProjectFilter.js"), exports);
__exportStar(require("./filters/TypeFilter.js"), exports);
// Types
__exportStar(require("./types.js"), exports);
