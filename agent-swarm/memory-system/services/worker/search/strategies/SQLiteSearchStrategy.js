"use strict";
/**
 * SQLiteSearchStrategy - Direct SQLite queries for filter-only searches
 *
 * This strategy handles searches without query text (filter-only):
 * - Date range filtering
 * - Project filtering
 * - Type filtering
 * - Concept/file filtering
 *
 * Used when: No query text is provided, or as a fallback when Chroma fails
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
exports.SQLiteSearchStrategy = void 0;
var SearchStrategy_js_1 = require("./SearchStrategy.js");
var types_js_1 = require("../types.js");
var logger_js_1 = require("../../../../utils/logger.js");
var SQLiteSearchStrategy = /** @class */ (function (_super) {
    __extends(SQLiteSearchStrategy, _super);
    function SQLiteSearchStrategy(sessionSearch) {
        var _this = _super.call(this) || this;
        _this.sessionSearch = sessionSearch;
        _this.name = 'sqlite';
        return _this;
    }
    SQLiteSearchStrategy.prototype.canHandle = function (options) {
        // Can handle filter-only queries (no query text)
        // Also used as fallback when Chroma is unavailable
        return !options.query || options.strategyHint === 'sqlite';
    };
    SQLiteSearchStrategy.prototype.search = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, searchType, obsType, concepts, files, _b, limit, _c, offset, project, dateRange, _d, orderBy, searchObservations, searchSessions, searchPrompts, observations, sessions, prompts, baseOptions, obsOptions;
            return __generator(this, function (_e) {
                _a = options.searchType, searchType = _a === void 0 ? 'all' : _a, obsType = options.obsType, concepts = options.concepts, files = options.files, _b = options.limit, limit = _b === void 0 ? types_js_1.SEARCH_CONSTANTS.DEFAULT_LIMIT : _b, _c = options.offset, offset = _c === void 0 ? 0 : _c, project = options.project, dateRange = options.dateRange, _d = options.orderBy, orderBy = _d === void 0 ? 'date_desc' : _d;
                searchObservations = searchType === 'all' || searchType === 'observations';
                searchSessions = searchType === 'all' || searchType === 'sessions';
                searchPrompts = searchType === 'all' || searchType === 'prompts';
                observations = [];
                sessions = [];
                prompts = [];
                baseOptions = { limit: limit, offset: offset, orderBy: orderBy, project: project, dateRange: dateRange };
                logger_js_1.logger.debug('SEARCH', 'SQLiteSearchStrategy: Filter-only query', {
                    searchType: searchType,
                    hasDateRange: !!dateRange,
                    hasProject: !!project
                });
                try {
                    if (searchObservations) {
                        obsOptions = __assign(__assign({}, baseOptions), { type: obsType, concepts: concepts, files: files });
                        observations = this.sessionSearch.searchObservations(undefined, obsOptions);
                    }
                    if (searchSessions) {
                        sessions = this.sessionSearch.searchSessions(undefined, baseOptions);
                    }
                    if (searchPrompts) {
                        prompts = this.sessionSearch.searchUserPrompts(undefined, baseOptions);
                    }
                    logger_js_1.logger.debug('SEARCH', 'SQLiteSearchStrategy: Results', {
                        observations: observations.length,
                        sessions: sessions.length,
                        prompts: prompts.length
                    });
                    return [2 /*return*/, {
                            results: { observations: observations, sessions: sessions, prompts: prompts },
                            usedChroma: false,
                            fellBack: false,
                            strategy: 'sqlite'
                        }];
                }
                catch (error) {
                    logger_js_1.logger.error('SEARCH', 'SQLiteSearchStrategy: Search failed', {}, error);
                    return [2 /*return*/, this.emptyResult('sqlite')];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Find observations by concept (used by findByConcept tool)
     */
    SQLiteSearchStrategy.prototype.findByConcept = function (concept, options) {
        var _a = options.limit, limit = _a === void 0 ? types_js_1.SEARCH_CONSTANTS.DEFAULT_LIMIT : _a, project = options.project, dateRange = options.dateRange, _b = options.orderBy, orderBy = _b === void 0 ? 'date_desc' : _b;
        return this.sessionSearch.findByConcept(concept, { limit: limit, project: project, dateRange: dateRange, orderBy: orderBy });
    };
    /**
     * Find observations by type (used by findByType tool)
     */
    SQLiteSearchStrategy.prototype.findByType = function (type, options) {
        var _a = options.limit, limit = _a === void 0 ? types_js_1.SEARCH_CONSTANTS.DEFAULT_LIMIT : _a, project = options.project, dateRange = options.dateRange, _b = options.orderBy, orderBy = _b === void 0 ? 'date_desc' : _b;
        return this.sessionSearch.findByType(type, { limit: limit, project: project, dateRange: dateRange, orderBy: orderBy });
    };
    /**
     * Find observations and sessions by file path (used by findByFile tool)
     */
    SQLiteSearchStrategy.prototype.findByFile = function (filePath, options) {
        var _a = options.limit, limit = _a === void 0 ? types_js_1.SEARCH_CONSTANTS.DEFAULT_LIMIT : _a, project = options.project, dateRange = options.dateRange, _b = options.orderBy, orderBy = _b === void 0 ? 'date_desc' : _b;
        return this.sessionSearch.findByFile(filePath, { limit: limit, project: project, dateRange: dateRange, orderBy: orderBy });
    };
    return SQLiteSearchStrategy;
}(SearchStrategy_js_1.BaseSearchStrategy));
exports.SQLiteSearchStrategy = SQLiteSearchStrategy;
