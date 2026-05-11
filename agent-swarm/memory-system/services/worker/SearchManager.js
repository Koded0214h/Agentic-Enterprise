"use strict";
/**
 * SearchManager - Core search orchestration for claude-mem
 *
 * This class is a thin wrapper that delegates to the modular search infrastructure.
 * It maintains the same public interface for backward compatibility.
 *
 * The actual search logic is now in:
 * - SearchOrchestrator: Strategy selection and coordination
 * - ChromaSearchStrategy: Vector-based semantic search
 * - SQLiteSearchStrategy: Filter-only queries
 * - HybridSearchStrategy: Metadata filtering + semantic ranking
 * - ResultFormatter: Output formatting
 * - TimelineBuilder: Timeline construction
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchManager = void 0;
var path_1 = require("path");
var logger_js_1 = require("../../utils/logger.js");
var timeline_formatting_js_1 = require("../../shared/timeline-formatting.js");
var ModeManager_js_1 = require("../domain/ModeManager.js");
var index_js_1 = require("./search/index.js");
var SearchManager = /** @class */ (function () {
    function SearchManager(sessionSearch, sessionStore, chromaSync, formatter, timelineService) {
        this.sessionSearch = sessionSearch;
        this.sessionStore = sessionStore;
        this.chromaSync = chromaSync;
        this.formatter = formatter;
        this.timelineService = timelineService;
        // Initialize the new modular search infrastructure
        this.orchestrator = new index_js_1.SearchOrchestrator(sessionSearch, sessionStore, chromaSync);
        this.timelineBuilder = new index_js_1.TimelineBuilder();
    }
    /**
     * Query Chroma vector database via ChromaSync
     * @deprecated Use orchestrator.search() instead
     */
    SearchManager.prototype.queryChroma = function (query, limit, whereFilter) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.chromaSync) {
                            return [2 /*return*/, { ids: [], distances: [], metadatas: [] }];
                        }
                        return [4 /*yield*/, this.chromaSync.queryChroma(query, limit, whereFilter)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Helper to normalize query parameters from URL-friendly format
     * Converts comma-separated strings to arrays and flattens date params
     */
    SearchManager.prototype.normalizeParams = function (args) {
        var normalized = __assign({}, args);
        // Map filePath to files (API uses filePath, internal uses files)
        if (normalized.filePath && !normalized.files) {
            normalized.files = normalized.filePath;
            delete normalized.filePath;
        }
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
            normalized.obs_type = normalized.obs_type.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
        }
        // Parse comma-separated type (for filterSchema) into array
        if (normalized.type && typeof normalized.type === 'string' && normalized.type.includes(',')) {
            normalized.type = normalized.type.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
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
        // Parse isFolder boolean from string
        if (normalized.isFolder === 'true') {
            normalized.isFolder = true;
        }
        else if (normalized.isFolder === 'false') {
            normalized.isFolder = false;
        }
        return normalized;
    };
    /**
     * Tool handler: search
     */
    SearchManager.prototype.search = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var normalized, query, type, obs_type, concepts, files, format, options, observations, sessions, prompts, chromaFailed, searchObservations, searchSessions, searchPrompts, obsOptions, chromaSucceeded, whereFilter, projectFilter, chromaResults_1, dateRange, startEpoch_1, endEpoch_1, recentMetadata, obsIds, sessionIds, promptIds, _i, recentMetadata_1, item, docType, obsOptions, totalResults, allResults, limitedResults, cwd, resultsByDate, lines, _a, resultsByDate_1, _b, day, dayResults, resultsByFile, _c, dayResults_1, result, file, _d, resultsByFile_1, _e, file, fileResults, lastTime, _f, fileResults_1, result, formatted, formatted, formatted;
            var _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        normalized = this.normalizeParams(args);
                        query = normalized.query, type = normalized.type, obs_type = normalized.obs_type, concepts = normalized.concepts, files = normalized.files, format = normalized.format, options = __rest(normalized, ["query", "type", "obs_type", "concepts", "files", "format"]);
                        observations = [];
                        sessions = [];
                        prompts = [];
                        chromaFailed = false;
                        searchObservations = !type || type === 'observations';
                        searchSessions = !type || type === 'sessions';
                        searchPrompts = !type || type === 'prompts';
                        if (!!query) return [3 /*break*/, 1];
                        logger_js_1.logger.debug('SEARCH', 'Filter-only query (no query text), using direct SQLite filtering', { enablesDateFilters: true });
                        obsOptions = __assign(__assign({}, options), { type: obs_type, concepts: concepts, files: files });
                        if (searchObservations) {
                            observations = this.sessionSearch.searchObservations(undefined, obsOptions);
                        }
                        if (searchSessions) {
                            sessions = this.sessionSearch.searchSessions(undefined, options);
                        }
                        if (searchPrompts) {
                            prompts = this.sessionSearch.searchUserPrompts(undefined, options);
                        }
                        return [3 /*break*/, 4];
                    case 1:
                        if (!this.chromaSync) return [3 /*break*/, 3];
                        chromaSucceeded = false;
                        logger_js_1.logger.debug('SEARCH', 'Using ChromaDB semantic search', { typeFilter: type || 'all' });
                        whereFilter = void 0;
                        if (type === 'observations') {
                            whereFilter = { doc_type: 'observation' };
                        }
                        else if (type === 'sessions') {
                            whereFilter = { doc_type: 'session_summary' };
                        }
                        else if (type === 'prompts') {
                            whereFilter = { doc_type: 'user_prompt' };
                        }
                        // Include project in the Chroma where clause to scope vector search.
                        // Without this, larger projects dominate the top-N results and smaller
                        // projects get crowded out before the post-hoc SQLite filter.
                        if (options.project) {
                            projectFilter = { project: options.project };
                            whereFilter = whereFilter
                                ? { $and: [whereFilter, projectFilter] }
                                : projectFilter;
                        }
                        return [4 /*yield*/, this.queryChroma(query, 100, whereFilter)];
                    case 2:
                        chromaResults_1 = _h.sent();
                        chromaSucceeded = true; // Chroma didn't throw error
                        logger_js_1.logger.debug('SEARCH', 'ChromaDB returned semantic matches', { matchCount: chromaResults_1.ids.length });
                        if (chromaResults_1.ids.length > 0) {
                            dateRange = options.dateRange;
                            if (dateRange) {
                                if (dateRange.start) {
                                    startEpoch_1 = typeof dateRange.start === 'number'
                                        ? dateRange.start
                                        : new Date(dateRange.start).getTime();
                                }
                                if (dateRange.end) {
                                    endEpoch_1 = typeof dateRange.end === 'number'
                                        ? dateRange.end
                                        : new Date(dateRange.end).getTime();
                                }
                            }
                            else {
                                // Default: 90-day recency window
                                startEpoch_1 = Date.now() - index_js_1.SEARCH_CONSTANTS.RECENCY_WINDOW_MS;
                            }
                            recentMetadata = chromaResults_1.metadatas.map(function (meta, idx) { return ({
                                id: chromaResults_1.ids[idx],
                                meta: meta,
                                isRecent: meta && meta.created_at_epoch != null
                                    && (!startEpoch_1 || meta.created_at_epoch >= startEpoch_1)
                                    && (!endEpoch_1 || meta.created_at_epoch <= endEpoch_1)
                            }); }).filter(function (item) { return item.isRecent; });
                            logger_js_1.logger.debug('SEARCH', dateRange ? 'Results within user date range' : 'Results within 90-day window', { count: recentMetadata.length });
                            obsIds = [];
                            sessionIds = [];
                            promptIds = [];
                            for (_i = 0, recentMetadata_1 = recentMetadata; _i < recentMetadata_1.length; _i++) {
                                item = recentMetadata_1[_i];
                                docType = (_g = item.meta) === null || _g === void 0 ? void 0 : _g.doc_type;
                                if (docType === 'observation' && searchObservations) {
                                    obsIds.push(item.id);
                                }
                                else if (docType === 'session_summary' && searchSessions) {
                                    sessionIds.push(item.id);
                                }
                                else if (docType === 'user_prompt' && searchPrompts) {
                                    promptIds.push(item.id);
                                }
                            }
                            logger_js_1.logger.debug('SEARCH', 'Categorized results by type', { observations: obsIds.length, sessions: sessionIds.length, prompts: prompts.length });
                            // Step 4: Hydrate from SQLite with additional filters
                            if (obsIds.length > 0) {
                                obsOptions = __assign(__assign({}, options), { type: obs_type, concepts: concepts, files: files });
                                observations = this.sessionStore.getObservationsByIds(obsIds, obsOptions);
                            }
                            if (sessionIds.length > 0) {
                                sessions = this.sessionStore.getSessionSummariesByIds(sessionIds, { orderBy: 'date_desc', limit: options.limit, project: options.project });
                            }
                            if (promptIds.length > 0) {
                                prompts = this.sessionStore.getUserPromptsByIds(promptIds, { orderBy: 'date_desc', limit: options.limit, project: options.project });
                            }
                            logger_js_1.logger.debug('SEARCH', 'Hydrated results from SQLite', { observations: observations.length, sessions: sessions.length, prompts: prompts.length });
                        }
                        else {
                            // Chroma returned 0 results - this is the correct answer, don't fall back to FTS5
                            logger_js_1.logger.debug('SEARCH', 'ChromaDB found no matches (final result, no FTS5 fallback)', {});
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        if (query) {
                            chromaFailed = true;
                            logger_js_1.logger.debug('SEARCH', 'ChromaDB not initialized - semantic search unavailable', {});
                            logger_js_1.logger.debug('SEARCH', 'Install UVX/Python to enable vector search', { url: 'https://docs.astral.sh/uv/getting-started/installation/' });
                            observations = [];
                            sessions = [];
                            prompts = [];
                        }
                        _h.label = 4;
                    case 4:
                        totalResults = observations.length + sessions.length + prompts.length;
                        // JSON format: return raw data for programmatic access (e.g., export scripts)
                        if (format === 'json') {
                            return [2 /*return*/, {
                                    observations: observations,
                                    sessions: sessions,
                                    prompts: prompts,
                                    totalResults: totalResults,
                                    query: query || ''
                                }];
                        }
                        if (totalResults === 0) {
                            if (chromaFailed) {
                                return [2 /*return*/, {
                                        content: [{
                                                type: 'text',
                                                text: "Vector search failed - semantic search unavailable.\n\nTo enable semantic search:\n1. Install uv: https://docs.astral.sh/uv/getting-started/installation/\n2. Restart the worker: npm run worker:restart\n\nNote: You can still use filter-only searches (date ranges, types, files) without a query term."
                                            }]
                                    }];
                            }
                            return [2 /*return*/, {
                                    content: [{
                                            type: 'text',
                                            text: "No results found matching \"".concat(query, "\"")
                                        }]
                                }];
                        }
                        allResults = __spreadArray(__spreadArray(__spreadArray([], observations.map(function (obs) { return ({
                            type: 'observation',
                            data: obs,
                            epoch: obs.created_at_epoch,
                            created_at: obs.created_at
                        }); }), true), sessions.map(function (sess) { return ({
                            type: 'session',
                            data: sess,
                            epoch: sess.created_at_epoch,
                            created_at: sess.created_at
                        }); }), true), prompts.map(function (prompt) { return ({
                            type: 'prompt',
                            data: prompt,
                            epoch: prompt.created_at_epoch,
                            created_at: prompt.created_at
                        }); }), true);
                        // Sort by date
                        if (options.orderBy === 'date_desc') {
                            allResults.sort(function (a, b) { return b.epoch - a.epoch; });
                        }
                        else if (options.orderBy === 'date_asc') {
                            allResults.sort(function (a, b) { return a.epoch - b.epoch; });
                        }
                        limitedResults = allResults.slice(0, options.limit || 20);
                        cwd = process.cwd();
                        resultsByDate = (0, timeline_formatting_js_1.groupByDate)(limitedResults, function (item) { return item.created_at; });
                        lines = [];
                        lines.push("Found ".concat(totalResults, " result(s) matching \"").concat(query, "\" (").concat(observations.length, " obs, ").concat(sessions.length, " sessions, ").concat(prompts.length, " prompts)"));
                        lines.push('');
                        for (_a = 0, resultsByDate_1 = resultsByDate; _a < resultsByDate_1.length; _a++) {
                            _b = resultsByDate_1[_a], day = _b[0], dayResults = _b[1];
                            lines.push("### ".concat(day));
                            lines.push('');
                            resultsByFile = new Map();
                            for (_c = 0, dayResults_1 = dayResults; _c < dayResults_1.length; _c++) {
                                result = dayResults_1[_c];
                                file = 'General';
                                if (result.type === 'observation') {
                                    file = (0, timeline_formatting_js_1.extractFirstFile)(result.data.files_modified, cwd, result.data.files_read);
                                }
                                if (!resultsByFile.has(file)) {
                                    resultsByFile.set(file, []);
                                }
                                resultsByFile.get(file).push(result);
                            }
                            // Render each file section
                            for (_d = 0, resultsByFile_1 = resultsByFile; _d < resultsByFile_1.length; _d++) {
                                _e = resultsByFile_1[_d], file = _e[0], fileResults = _e[1];
                                lines.push("**".concat(file, "**"));
                                lines.push(this.formatter.formatSearchTableHeader());
                                lastTime = '';
                                for (_f = 0, fileResults_1 = fileResults; _f < fileResults_1.length; _f++) {
                                    result = fileResults_1[_f];
                                    if (result.type === 'observation') {
                                        formatted = this.formatter.formatObservationSearchRow(result.data, lastTime);
                                        lines.push(formatted.row);
                                        lastTime = formatted.time;
                                    }
                                    else if (result.type === 'session') {
                                        formatted = this.formatter.formatSessionSearchRow(result.data, lastTime);
                                        lines.push(formatted.row);
                                        lastTime = formatted.time;
                                    }
                                    else {
                                        formatted = this.formatter.formatUserPromptSearchRow(result.data, lastTime);
                                        lines.push(formatted.row);
                                        lastTime = formatted.time;
                                    }
                                }
                                lines.push('');
                            }
                        }
                        return [2 /*return*/, {
                                content: [{
                                        type: 'text',
                                        text: lines.join('\n')
                                    }]
                            }];
                }
            });
        });
    };
    /**
     * Tool handler: timeline
     */
    SearchManager.prototype.timeline = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var anchor, query, _a, depth_before, _b, depth_after, project, cwd, anchorId, anchorEpoch, timelineData, results, chromaResults_2, ninetyDaysAgo_1, recentIds, chromaError_1, topResult, obs, sessionId, sessionNum, sessions, date, items, filteredItems, lines, anchorObs, anchorTitle, dayMap, _i, filteredItems_1, item, day, sortedDays, _c, sortedDays_1, _d, day, dayItems, currentFile, lastTime, tableOpen, _e, dayItems_1, item, isAnchor, sess, title, marker, prompt_1, truncated, obs, file, icon, time, title, tokens, showTime, timeDisplay, anchorMarker;
            var _f, _g, _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        anchor = args.anchor, query = args.query, _a = args.depth_before, depth_before = _a === void 0 ? 10 : _a, _b = args.depth_after, depth_after = _b === void 0 ? 10 : _b, project = args.project;
                        cwd = process.cwd();
                        // Validate: must provide either anchor or query, not both
                        if (!anchor && !query) {
                            return [2 /*return*/, {
                                    content: [{
                                            type: 'text',
                                            text: 'Error: Must provide either "anchor" or "query" parameter'
                                        }],
                                    isError: true
                                }];
                        }
                        if (anchor && query) {
                            return [2 /*return*/, {
                                    content: [{
                                            type: 'text',
                                            text: 'Error: Cannot provide both "anchor" and "query" parameters. Use one or the other.'
                                        }],
                                    isError: true
                                }];
                        }
                        if (!query) return [3 /*break*/, 5];
                        results = [];
                        if (!this.chromaSync) return [3 /*break*/, 4];
                        _j.label = 1;
                    case 1:
                        _j.trys.push([1, 3, , 4]);
                        logger_js_1.logger.debug('SEARCH', 'Using hybrid semantic search for timeline query', {});
                        return [4 /*yield*/, this.queryChroma(query, 100)];
                    case 2:
                        chromaResults_2 = _j.sent();
                        logger_js_1.logger.debug('SEARCH', 'Chroma returned semantic matches for timeline', { matchCount: (_g = (_f = chromaResults_2 === null || chromaResults_2 === void 0 ? void 0 : chromaResults_2.ids) === null || _f === void 0 ? void 0 : _f.length) !== null && _g !== void 0 ? _g : 0 });
                        if ((chromaResults_2 === null || chromaResults_2 === void 0 ? void 0 : chromaResults_2.ids) && chromaResults_2.ids.length > 0) {
                            ninetyDaysAgo_1 = Date.now() - index_js_1.SEARCH_CONSTANTS.RECENCY_WINDOW_MS;
                            recentIds = chromaResults_2.ids.filter(function (_id, idx) {
                                var meta = chromaResults_2.metadatas[idx];
                                return meta && meta.created_at_epoch > ninetyDaysAgo_1;
                            });
                            if (recentIds.length > 0) {
                                results = this.sessionStore.getObservationsByIds(recentIds, { orderBy: 'date_desc', limit: 1 });
                            }
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        chromaError_1 = _j.sent();
                        logger_js_1.logger.error('SEARCH', 'Chroma search failed for timeline, continuing without semantic results', {}, chromaError_1);
                        return [3 /*break*/, 4];
                    case 4:
                        if (results.length === 0) {
                            return [2 /*return*/, {
                                    content: [{
                                            type: 'text',
                                            text: "No observations found matching \"".concat(query, "\". Try a different search query.")
                                        }]
                                }];
                        }
                        topResult = results[0];
                        anchorId = topResult.id;
                        anchorEpoch = topResult.created_at_epoch;
                        logger_js_1.logger.debug('SEARCH', 'Query mode: Using observation as timeline anchor', { observationId: topResult.id });
                        timelineData = this.sessionStore.getTimelineAroundObservation(topResult.id, topResult.created_at_epoch, depth_before, depth_after, project);
                        return [3 /*break*/, 6];
                    case 5:
                        if (typeof anchor === 'number') {
                            obs = this.sessionStore.getObservationById(anchor);
                            if (!obs) {
                                return [2 /*return*/, {
                                        content: [{
                                                type: 'text',
                                                text: "Observation #".concat(anchor, " not found")
                                            }],
                                        isError: true
                                    }];
                            }
                            anchorId = anchor;
                            anchorEpoch = obs.created_at_epoch;
                            timelineData = this.sessionStore.getTimelineAroundObservation(anchor, anchorEpoch, depth_before, depth_after, project);
                        }
                        else if (typeof anchor === 'string') {
                            // Session ID or ISO timestamp
                            if (anchor.startsWith('S') || anchor.startsWith('#S')) {
                                sessionId = anchor.replace(/^#?S/, '');
                                sessionNum = parseInt(sessionId, 10);
                                sessions = this.sessionStore.getSessionSummariesByIds([sessionNum]);
                                if (sessions.length === 0) {
                                    return [2 /*return*/, {
                                            content: [{
                                                    type: 'text',
                                                    text: "Session #".concat(sessionNum, " not found")
                                                }],
                                            isError: true
                                        }];
                                }
                                anchorEpoch = sessions[0].created_at_epoch;
                                anchorId = "S".concat(sessionNum);
                                timelineData = this.sessionStore.getTimelineAroundTimestamp(anchorEpoch, depth_before, depth_after, project);
                            }
                            else {
                                date = new Date(anchor);
                                if (isNaN(date.getTime())) {
                                    return [2 /*return*/, {
                                            content: [{
                                                    type: 'text',
                                                    text: "Invalid timestamp: ".concat(anchor)
                                                }],
                                            isError: true
                                        }];
                                }
                                anchorEpoch = date.getTime();
                                anchorId = anchor;
                                timelineData = this.sessionStore.getTimelineAroundTimestamp(anchorEpoch, depth_before, depth_after, project);
                            }
                        }
                        else {
                            return [2 /*return*/, {
                                    content: [{
                                            type: 'text',
                                            text: 'Invalid anchor: must be observation ID (number), session ID (e.g., "S123"), or ISO timestamp'
                                        }],
                                    isError: true
                                }];
                        }
                        _j.label = 6;
                    case 6:
                        items = __spreadArray(__spreadArray(__spreadArray([], (timelineData.observations || []).map(function (obs) { return ({ type: 'observation', data: obs, epoch: obs.created_at_epoch }); }), true), (timelineData.sessions || []).map(function (sess) { return ({ type: 'session', data: sess, epoch: sess.created_at_epoch }); }), true), (timelineData.prompts || []).map(function (prompt) { return ({ type: 'prompt', data: prompt, epoch: prompt.created_at_epoch }); }), true);
                        items.sort(function (a, b) { return a.epoch - b.epoch; });
                        filteredItems = this.timelineService.filterByDepth(items, anchorId, anchorEpoch, depth_before, depth_after);
                        if (!filteredItems || filteredItems.length === 0) {
                            return [2 /*return*/, {
                                    content: [{
                                            type: 'text',
                                            text: query
                                                ? "Found observation matching \"".concat(query, "\", but no timeline context available (").concat(depth_before, " records before, ").concat(depth_after, " records after).")
                                                : "No context found around anchor (".concat(depth_before, " records before, ").concat(depth_after, " records after)")
                                        }]
                                }];
                        }
                        lines = [];
                        // Header
                        if (query) {
                            anchorObs = filteredItems.find(function (item) { return item.type === 'observation' && item.data.id === anchorId; });
                            anchorTitle = anchorObs && anchorObs.type === 'observation' ? (anchorObs.data.title || 'Untitled') : 'Unknown';
                            lines.push("# Timeline for query: \"".concat(query, "\""));
                            lines.push("**Anchor:** Observation #".concat(anchorId, " - ").concat(anchorTitle));
                        }
                        else {
                            lines.push("# Timeline around anchor: ".concat(anchorId));
                        }
                        lines.push("**Window:** ".concat(depth_before, " records before -> ").concat(depth_after, " records after | **Items:** ").concat((_h = filteredItems === null || filteredItems === void 0 ? void 0 : filteredItems.length) !== null && _h !== void 0 ? _h : 0));
                        lines.push('');
                        dayMap = new Map();
                        for (_i = 0, filteredItems_1 = filteredItems; _i < filteredItems_1.length; _i++) {
                            item = filteredItems_1[_i];
                            day = (0, timeline_formatting_js_1.formatDate)(item.epoch);
                            if (!dayMap.has(day)) {
                                dayMap.set(day, []);
                            }
                            dayMap.get(day).push(item);
                        }
                        sortedDays = Array.from(dayMap.entries()).sort(function (a, b) {
                            var aDate = new Date(a[0]).getTime();
                            var bDate = new Date(b[0]).getTime();
                            return aDate - bDate;
                        });
                        // Render each day
                        for (_c = 0, sortedDays_1 = sortedDays; _c < sortedDays_1.length; _c++) {
                            _d = sortedDays_1[_c], day = _d[0], dayItems = _d[1];
                            lines.push("### ".concat(day));
                            lines.push('');
                            currentFile = null;
                            lastTime = '';
                            tableOpen = false;
                            for (_e = 0, dayItems_1 = dayItems; _e < dayItems_1.length; _e++) {
                                item = dayItems_1[_e];
                                isAnchor = ((typeof anchorId === 'number' && item.type === 'observation' && item.data.id === anchorId) ||
                                    (typeof anchorId === 'string' && anchorId.startsWith('S') && item.type === 'session' && "S".concat(item.data.id) === anchorId));
                                if (item.type === 'session') {
                                    if (tableOpen) {
                                        lines.push('');
                                        tableOpen = false;
                                        currentFile = null;
                                        lastTime = '';
                                    }
                                    sess = item.data;
                                    title = sess.request || 'Session summary';
                                    marker = isAnchor ? ' <- **ANCHOR**' : '';
                                    lines.push("**\uD83C\uDFAF #S".concat(sess.id, "** ").concat(title, " (").concat((0, timeline_formatting_js_1.formatDateTime)(item.epoch), ")").concat(marker));
                                    lines.push('');
                                }
                                else if (item.type === 'prompt') {
                                    if (tableOpen) {
                                        lines.push('');
                                        tableOpen = false;
                                        currentFile = null;
                                        lastTime = '';
                                    }
                                    prompt_1 = item.data;
                                    truncated = prompt_1.prompt_text.length > 100 ? prompt_1.prompt_text.substring(0, 100) + '...' : prompt_1.prompt_text;
                                    lines.push("**\uD83D\uDCAC User Prompt #".concat(prompt_1.prompt_number, "** (").concat((0, timeline_formatting_js_1.formatDateTime)(item.epoch), ")"));
                                    lines.push("> ".concat(truncated));
                                    lines.push('');
                                }
                                else if (item.type === 'observation') {
                                    obs = item.data;
                                    file = (0, timeline_formatting_js_1.extractFirstFile)(obs.files_modified, cwd, obs.files_read);
                                    if (file !== currentFile) {
                                        if (tableOpen) {
                                            lines.push('');
                                        }
                                        lines.push("**".concat(file, "**"));
                                        lines.push("| ID | Time | T | Title | Tokens |");
                                        lines.push("|----|------|---|-------|--------|");
                                        currentFile = file;
                                        tableOpen = true;
                                        lastTime = '';
                                    }
                                    icon = ModeManager_js_1.ModeManager.getInstance().getTypeIcon(obs.type);
                                    time = (0, timeline_formatting_js_1.formatTime)(item.epoch);
                                    title = obs.title || 'Untitled';
                                    tokens = (0, timeline_formatting_js_1.estimateTokens)(obs.narrative);
                                    showTime = time !== lastTime;
                                    timeDisplay = showTime ? time : '"';
                                    lastTime = time;
                                    anchorMarker = isAnchor ? ' <- **ANCHOR**' : '';
                                    lines.push("| #".concat(obs.id, " | ").concat(timeDisplay, " | ").concat(icon, " | ").concat(title).concat(anchorMarker, " | ~").concat(tokens, " |"));
                                }
                            }
                            if (tableOpen) {
                                lines.push('');
                            }
                        }
                        return [2 /*return*/, {
                                content: [{
                                        type: 'text',
                                        text: lines.join('\n')
                                    }]
                            }];
                }
            });
        });
    };
    /**
     * Tool handler: decisions
     */
    SearchManager.prototype.decisions = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var normalized, query, filters, results, chromaResults, obsIds_1, metadataResults, ids, chromaResults, rankedIds_1, _i, _a, chromaId, chromaError_2, header, formattedResults;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        normalized = this.normalizeParams(args);
                        query = normalized.query, filters = __rest(normalized, ["query"]);
                        results = [];
                        if (!this.chromaSync) return [3 /*break*/, 7];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, , 7]);
                        if (!query) return [3 /*break*/, 3];
                        // Semantic search filtered to decision type
                        logger_js_1.logger.debug('SEARCH', 'Using Chroma semantic search with type=decision filter', {});
                        return [4 /*yield*/, this.queryChroma(query, Math.min((filters.limit || 20) * 2, 100), { type: 'decision' })];
                    case 2:
                        chromaResults = _b.sent();
                        obsIds_1 = chromaResults.ids;
                        if (obsIds_1.length > 0) {
                            results = this.sessionStore.getObservationsByIds(obsIds_1, __assign(__assign({}, filters), { type: 'decision' }));
                            // Preserve Chroma ranking order
                            results.sort(function (a, b) { return obsIds_1.indexOf(a.id) - obsIds_1.indexOf(b.id); });
                        }
                        return [3 /*break*/, 5];
                    case 3:
                        // No query: get all decisions, rank by "decision" keyword
                        logger_js_1.logger.debug('SEARCH', 'Using metadata-first + semantic ranking for decisions', {});
                        metadataResults = this.sessionSearch.findByType('decision', filters);
                        if (!(metadataResults.length > 0)) return [3 /*break*/, 5];
                        ids = metadataResults.map(function (obs) { return obs.id; });
                        return [4 /*yield*/, this.queryChroma('decision', Math.min(ids.length, 100))];
                    case 4:
                        chromaResults = _b.sent();
                        rankedIds_1 = [];
                        for (_i = 0, _a = chromaResults.ids; _i < _a.length; _i++) {
                            chromaId = _a[_i];
                            if (ids.includes(chromaId) && !rankedIds_1.includes(chromaId)) {
                                rankedIds_1.push(chromaId);
                            }
                        }
                        if (rankedIds_1.length > 0) {
                            results = this.sessionStore.getObservationsByIds(rankedIds_1, { limit: filters.limit || 20 });
                            results.sort(function (a, b) { return rankedIds_1.indexOf(a.id) - rankedIds_1.indexOf(b.id); });
                        }
                        _b.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        chromaError_2 = _b.sent();
                        logger_js_1.logger.error('SEARCH', 'Chroma search failed for decisions, falling back to metadata search', {}, chromaError_2);
                        return [3 /*break*/, 7];
                    case 7:
                        if (results.length === 0) {
                            results = this.sessionSearch.findByType('decision', filters);
                        }
                        if (results.length === 0) {
                            return [2 /*return*/, {
                                    content: [{
                                            type: 'text',
                                            text: 'No decision observations found'
                                        }]
                                }];
                        }
                        header = "Found ".concat(results.length, " decision(s)\n\n").concat(this.formatter.formatTableHeader());
                        formattedResults = results.map(function (obs, i) { return _this.formatter.formatObservationIndex(obs, i); });
                        return [2 /*return*/, {
                                content: [{
                                        type: 'text',
                                        text: header + '\n' + formattedResults.join('\n')
                                    }]
                            }];
                }
            });
        });
    };
    /**
     * Tool handler: changes
     */
    SearchManager.prototype.changes = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var normalized, filters, results, typeResults, conceptChangeResults, conceptWhatChangedResults, allIds_1, idsArray, chromaResults, rankedIds_2, _i, _a, chromaId, chromaError_3, typeResults_1, conceptResults_1, whatChangedResults_1, allIds_2, header, formattedResults;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        normalized = this.normalizeParams(args);
                        filters = __rest(normalized, []);
                        results = [];
                        if (!this.chromaSync) return [3 /*break*/, 5];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        logger_js_1.logger.debug('SEARCH', 'Using hybrid search for change-related observations', {});
                        typeResults = this.sessionSearch.findByType('change', filters);
                        conceptChangeResults = this.sessionSearch.findByConcept('change', filters);
                        conceptWhatChangedResults = this.sessionSearch.findByConcept('what-changed', filters);
                        allIds_1 = new Set();
                        __spreadArray(__spreadArray(__spreadArray([], typeResults, true), conceptChangeResults, true), conceptWhatChangedResults, true).forEach(function (obs) { return allIds_1.add(obs.id); });
                        if (!(allIds_1.size > 0)) return [3 /*break*/, 3];
                        idsArray = Array.from(allIds_1);
                        return [4 /*yield*/, this.queryChroma('what changed', Math.min(idsArray.length, 100))];
                    case 2:
                        chromaResults = _b.sent();
                        rankedIds_2 = [];
                        for (_i = 0, _a = chromaResults.ids; _i < _a.length; _i++) {
                            chromaId = _a[_i];
                            if (idsArray.includes(chromaId) && !rankedIds_2.includes(chromaId)) {
                                rankedIds_2.push(chromaId);
                            }
                        }
                        if (rankedIds_2.length > 0) {
                            results = this.sessionStore.getObservationsByIds(rankedIds_2, { limit: filters.limit || 20 });
                            results.sort(function (a, b) { return rankedIds_2.indexOf(a.id) - rankedIds_2.indexOf(b.id); });
                        }
                        _b.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        chromaError_3 = _b.sent();
                        logger_js_1.logger.error('SEARCH', 'Chroma search failed for changes, falling back to metadata search', {}, chromaError_3);
                        return [3 /*break*/, 5];
                    case 5:
                        if (results.length === 0) {
                            typeResults_1 = this.sessionSearch.findByType('change', filters);
                            conceptResults_1 = this.sessionSearch.findByConcept('change', filters);
                            whatChangedResults_1 = this.sessionSearch.findByConcept('what-changed', filters);
                            allIds_2 = new Set();
                            __spreadArray(__spreadArray(__spreadArray([], typeResults_1, true), conceptResults_1, true), whatChangedResults_1, true).forEach(function (obs) { return allIds_2.add(obs.id); });
                            results = Array.from(allIds_2).map(function (id) {
                                return typeResults_1.find(function (obs) { return obs.id === id; }) ||
                                    conceptResults_1.find(function (obs) { return obs.id === id; }) ||
                                    whatChangedResults_1.find(function (obs) { return obs.id === id; });
                            }).filter(Boolean);
                            results.sort(function (a, b) { return b.created_at_epoch - a.created_at_epoch; });
                            results = results.slice(0, filters.limit || 20);
                        }
                        if (results.length === 0) {
                            return [2 /*return*/, {
                                    content: [{
                                            type: 'text',
                                            text: 'No change-related observations found'
                                        }]
                                }];
                        }
                        header = "Found ".concat(results.length, " change-related observation(s)\n\n").concat(this.formatter.formatTableHeader());
                        formattedResults = results.map(function (obs, i) { return _this.formatter.formatObservationIndex(obs, i); });
                        return [2 /*return*/, {
                                content: [{
                                        type: 'text',
                                        text: header + '\n' + formattedResults.join('\n')
                                    }]
                            }];
                }
            });
        });
    };
    /**
     * Tool handler: how_it_works
     */
    SearchManager.prototype.howItWorks = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var normalized, filters, results, metadataResults, ids, chromaResults, rankedIds_3, _i, _a, chromaId, header, formattedResults;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        normalized = this.normalizeParams(args);
                        filters = __rest(normalized, []);
                        results = [];
                        if (!this.chromaSync) return [3 /*break*/, 2];
                        logger_js_1.logger.debug('SEARCH', 'Using metadata-first + semantic ranking for how-it-works', {});
                        metadataResults = this.sessionSearch.findByConcept('how-it-works', filters);
                        if (!(metadataResults.length > 0)) return [3 /*break*/, 2];
                        ids = metadataResults.map(function (obs) { return obs.id; });
                        return [4 /*yield*/, this.queryChroma('how it works architecture', Math.min(ids.length, 100))];
                    case 1:
                        chromaResults = _b.sent();
                        rankedIds_3 = [];
                        for (_i = 0, _a = chromaResults.ids; _i < _a.length; _i++) {
                            chromaId = _a[_i];
                            if (ids.includes(chromaId) && !rankedIds_3.includes(chromaId)) {
                                rankedIds_3.push(chromaId);
                            }
                        }
                        if (rankedIds_3.length > 0) {
                            results = this.sessionStore.getObservationsByIds(rankedIds_3, { limit: filters.limit || 20 });
                            results.sort(function (a, b) { return rankedIds_3.indexOf(a.id) - rankedIds_3.indexOf(b.id); });
                        }
                        _b.label = 2;
                    case 2:
                        if (results.length === 0) {
                            results = this.sessionSearch.findByConcept('how-it-works', filters);
                        }
                        if (results.length === 0) {
                            return [2 /*return*/, {
                                    content: [{
                                            type: 'text',
                                            text: 'No "how it works" observations found'
                                        }]
                                }];
                        }
                        header = "Found ".concat(results.length, " \"how it works\" observation(s)\n\n").concat(this.formatter.formatTableHeader());
                        formattedResults = results.map(function (obs, i) { return _this.formatter.formatObservationIndex(obs, i); });
                        return [2 /*return*/, {
                                content: [{
                                        type: 'text',
                                        text: header + '\n' + formattedResults.join('\n')
                                    }]
                            }];
                }
            });
        });
    };
    /**
     * Tool handler: search_observations
     */
    SearchManager.prototype.searchObservations = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var normalized, query, options, results, chromaResults_3, ninetyDaysAgo_2, recentIds, limit, header, formattedResults;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        normalized = this.normalizeParams(args);
                        query = normalized.query, options = __rest(normalized, ["query"]);
                        results = [];
                        if (!this.chromaSync) return [3 /*break*/, 2];
                        logger_js_1.logger.debug('SEARCH', 'Using hybrid semantic search (Chroma + SQLite)', {});
                        return [4 /*yield*/, this.queryChroma(query, 100)];
                    case 1:
                        chromaResults_3 = _a.sent();
                        logger_js_1.logger.debug('SEARCH', 'Chroma returned semantic matches', { matchCount: chromaResults_3.ids.length });
                        if (chromaResults_3.ids.length > 0) {
                            ninetyDaysAgo_2 = Date.now() - index_js_1.SEARCH_CONSTANTS.RECENCY_WINDOW_MS;
                            recentIds = chromaResults_3.ids.filter(function (_id, idx) {
                                var meta = chromaResults_3.metadatas[idx];
                                return meta && meta.created_at_epoch > ninetyDaysAgo_2;
                            });
                            logger_js_1.logger.debug('SEARCH', 'Results within 90-day window', { count: recentIds.length });
                            // Step 3: Hydrate from SQLite in temporal order
                            if (recentIds.length > 0) {
                                limit = options.limit || 20;
                                results = this.sessionStore.getObservationsByIds(recentIds, { orderBy: 'date_desc', limit: limit });
                                logger_js_1.logger.debug('SEARCH', 'Hydrated observations from SQLite', { count: results.length });
                            }
                        }
                        _a.label = 2;
                    case 2:
                        if (results.length === 0) {
                            return [2 /*return*/, {
                                    content: [{
                                            type: 'text',
                                            text: "No observations found matching \"".concat(query, "\"")
                                        }]
                                }];
                        }
                        header = "Found ".concat(results.length, " observation(s) matching \"").concat(query, "\"\n\n").concat(this.formatter.formatTableHeader());
                        formattedResults = results.map(function (obs, i) { return _this.formatter.formatObservationIndex(obs, i); });
                        return [2 /*return*/, {
                                content: [{
                                        type: 'text',
                                        text: header + '\n' + formattedResults.join('\n')
                                    }]
                            }];
                }
            });
        });
    };
    /**
     * Tool handler: search_sessions
     */
    SearchManager.prototype.searchSessions = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var normalized, query, options, results, chromaResults_4, ninetyDaysAgo_3, recentIds, limit, header, formattedResults;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        normalized = this.normalizeParams(args);
                        query = normalized.query, options = __rest(normalized, ["query"]);
                        results = [];
                        if (!this.chromaSync) return [3 /*break*/, 2];
                        logger_js_1.logger.debug('SEARCH', 'Using hybrid semantic search for sessions', {});
                        return [4 /*yield*/, this.queryChroma(query, 100, { doc_type: 'session_summary' })];
                    case 1:
                        chromaResults_4 = _a.sent();
                        logger_js_1.logger.debug('SEARCH', 'Chroma returned semantic matches for sessions', { matchCount: chromaResults_4.ids.length });
                        if (chromaResults_4.ids.length > 0) {
                            ninetyDaysAgo_3 = Date.now() - index_js_1.SEARCH_CONSTANTS.RECENCY_WINDOW_MS;
                            recentIds = chromaResults_4.ids.filter(function (_id, idx) {
                                var meta = chromaResults_4.metadatas[idx];
                                return meta && meta.created_at_epoch > ninetyDaysAgo_3;
                            });
                            logger_js_1.logger.debug('SEARCH', 'Results within 90-day window', { count: recentIds.length });
                            // Step 3: Hydrate from SQLite in temporal order
                            if (recentIds.length > 0) {
                                limit = options.limit || 20;
                                results = this.sessionStore.getSessionSummariesByIds(recentIds, { orderBy: 'date_desc', limit: limit });
                                logger_js_1.logger.debug('SEARCH', 'Hydrated sessions from SQLite', { count: results.length });
                            }
                        }
                        _a.label = 2;
                    case 2:
                        if (results.length === 0) {
                            return [2 /*return*/, {
                                    content: [{
                                            type: 'text',
                                            text: "No sessions found matching \"".concat(query, "\"")
                                        }]
                                }];
                        }
                        header = "Found ".concat(results.length, " session(s) matching \"").concat(query, "\"\n\n").concat(this.formatter.formatTableHeader());
                        formattedResults = results.map(function (session, i) { return _this.formatter.formatSessionIndex(session, i); });
                        return [2 /*return*/, {
                                content: [{
                                        type: 'text',
                                        text: header + '\n' + formattedResults.join('\n')
                                    }]
                            }];
                }
            });
        });
    };
    /**
     * Tool handler: search_user_prompts
     */
    SearchManager.prototype.searchUserPrompts = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var normalized, query, options, results, chromaResults_5, ninetyDaysAgo_4, recentIds, limit, header, formattedResults;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        normalized = this.normalizeParams(args);
                        query = normalized.query, options = __rest(normalized, ["query"]);
                        results = [];
                        if (!this.chromaSync) return [3 /*break*/, 2];
                        logger_js_1.logger.debug('SEARCH', 'Using hybrid semantic search for user prompts', {});
                        return [4 /*yield*/, this.queryChroma(query, 100, { doc_type: 'user_prompt' })];
                    case 1:
                        chromaResults_5 = _a.sent();
                        logger_js_1.logger.debug('SEARCH', 'Chroma returned semantic matches for prompts', { matchCount: chromaResults_5.ids.length });
                        if (chromaResults_5.ids.length > 0) {
                            ninetyDaysAgo_4 = Date.now() - index_js_1.SEARCH_CONSTANTS.RECENCY_WINDOW_MS;
                            recentIds = chromaResults_5.ids.filter(function (_id, idx) {
                                var meta = chromaResults_5.metadatas[idx];
                                return meta && meta.created_at_epoch > ninetyDaysAgo_4;
                            });
                            logger_js_1.logger.debug('SEARCH', 'Results within 90-day window', { count: recentIds.length });
                            // Step 3: Hydrate from SQLite in temporal order
                            if (recentIds.length > 0) {
                                limit = options.limit || 20;
                                results = this.sessionStore.getUserPromptsByIds(recentIds, { orderBy: 'date_desc', limit: limit });
                                logger_js_1.logger.debug('SEARCH', 'Hydrated user prompts from SQLite', { count: results.length });
                            }
                        }
                        _a.label = 2;
                    case 2:
                        if (results.length === 0) {
                            return [2 /*return*/, {
                                    content: [{
                                            type: 'text',
                                            text: query ? "No user prompts found matching \"".concat(query, "\"") : 'No user prompts found'
                                        }]
                                }];
                        }
                        header = "Found ".concat(results.length, " user prompt(s) matching \"").concat(query, "\"\n\n").concat(this.formatter.formatTableHeader());
                        formattedResults = results.map(function (prompt, i) { return _this.formatter.formatUserPromptIndex(prompt, i); });
                        return [2 /*return*/, {
                                content: [{
                                        type: 'text',
                                        text: header + '\n' + formattedResults.join('\n')
                                    }]
                            }];
                }
            });
        });
    };
    /**
     * Tool handler: find_by_concept
     */
    SearchManager.prototype.findByConcept = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var normalized, concept, filters, results, metadataResults, ids, chromaResults, rankedIds_4, _i, _a, chromaId, header, formattedResults;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        normalized = this.normalizeParams(args);
                        concept = normalized.concepts, filters = __rest(normalized, ["concepts"]);
                        results = [];
                        if (!this.chromaSync) return [3 /*break*/, 2];
                        logger_js_1.logger.debug('SEARCH', 'Using metadata-first + semantic ranking for concept search', {});
                        metadataResults = this.sessionSearch.findByConcept(concept, filters);
                        logger_js_1.logger.debug('SEARCH', 'Found observations with concept', { concept: concept, count: metadataResults.length });
                        if (!(metadataResults.length > 0)) return [3 /*break*/, 2];
                        ids = metadataResults.map(function (obs) { return obs.id; });
                        return [4 /*yield*/, this.queryChroma(concept, Math.min(ids.length, 100))];
                    case 1:
                        chromaResults = _b.sent();
                        rankedIds_4 = [];
                        for (_i = 0, _a = chromaResults.ids; _i < _a.length; _i++) {
                            chromaId = _a[_i];
                            if (ids.includes(chromaId) && !rankedIds_4.includes(chromaId)) {
                                rankedIds_4.push(chromaId);
                            }
                        }
                        logger_js_1.logger.debug('SEARCH', 'Chroma ranked results by semantic relevance', { count: rankedIds_4.length });
                        // Step 3: Hydrate in semantic rank order
                        if (rankedIds_4.length > 0) {
                            results = this.sessionStore.getObservationsByIds(rankedIds_4, { limit: filters.limit || 20 });
                            // Restore semantic ranking order
                            results.sort(function (a, b) { return rankedIds_4.indexOf(a.id) - rankedIds_4.indexOf(b.id); });
                        }
                        _b.label = 2;
                    case 2:
                        // Fall back to SQLite-only if Chroma unavailable or failed
                        if (results.length === 0) {
                            logger_js_1.logger.debug('SEARCH', 'Using SQLite-only concept search', {});
                            results = this.sessionSearch.findByConcept(concept, filters);
                        }
                        if (results.length === 0) {
                            return [2 /*return*/, {
                                    content: [{
                                            type: 'text',
                                            text: "No observations found with concept \"".concat(concept, "\"")
                                        }]
                                }];
                        }
                        header = "Found ".concat(results.length, " observation(s) with concept \"").concat(concept, "\"\n\n").concat(this.formatter.formatTableHeader());
                        formattedResults = results.map(function (obs, i) { return _this.formatter.formatObservationIndex(obs, i); });
                        return [2 /*return*/, {
                                content: [{
                                        type: 'text',
                                        text: header + '\n' + formattedResults.join('\n')
                                    }]
                            }];
                }
            });
        });
    };
    /**
     * Tool handler: find_by_file
     */
    SearchManager.prototype.findByFile = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var normalized, rawFilePath, filters, filePath, observations, sessions, metadataResults, ids, chromaResults, rankedIds_5, _i, _a, chromaId, results, totalResults, combined, resultsByDate, lines, _b, resultsByDate_2, _c, day, dayResults, _d, dayResults_2, result;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        normalized = this.normalizeParams(args);
                        rawFilePath = normalized.files, filters = __rest(normalized, ["files"]);
                        filePath = Array.isArray(rawFilePath) ? rawFilePath[0] : rawFilePath;
                        observations = [];
                        sessions = [];
                        if (!this.chromaSync) return [3 /*break*/, 2];
                        logger_js_1.logger.debug('SEARCH', 'Using metadata-first + semantic ranking for file search', {});
                        metadataResults = this.sessionSearch.findByFile(filePath, filters);
                        logger_js_1.logger.debug('SEARCH', 'Found results for file', { file: filePath, observations: metadataResults.observations.length, sessions: metadataResults.sessions.length });
                        // Sessions: Keep as-is (already summarized, no semantic ranking needed)
                        sessions = metadataResults.sessions;
                        if (!(metadataResults.observations.length > 0)) return [3 /*break*/, 2];
                        ids = metadataResults.observations.map(function (obs) { return obs.id; });
                        return [4 /*yield*/, this.queryChroma(filePath, Math.min(ids.length, 100))];
                    case 1:
                        chromaResults = _e.sent();
                        rankedIds_5 = [];
                        for (_i = 0, _a = chromaResults.ids; _i < _a.length; _i++) {
                            chromaId = _a[_i];
                            if (ids.includes(chromaId) && !rankedIds_5.includes(chromaId)) {
                                rankedIds_5.push(chromaId);
                            }
                        }
                        logger_js_1.logger.debug('SEARCH', 'Chroma ranked observations by semantic relevance', { count: rankedIds_5.length });
                        // Step 3: Hydrate in semantic rank order
                        if (rankedIds_5.length > 0) {
                            observations = this.sessionStore.getObservationsByIds(rankedIds_5, { limit: filters.limit || 20 });
                            // Restore semantic ranking order
                            observations.sort(function (a, b) { return rankedIds_5.indexOf(a.id) - rankedIds_5.indexOf(b.id); });
                        }
                        _e.label = 2;
                    case 2:
                        // Fall back to SQLite-only if Chroma unavailable or failed
                        if (observations.length === 0 && sessions.length === 0) {
                            logger_js_1.logger.debug('SEARCH', 'Using SQLite-only file search', {});
                            results = this.sessionSearch.findByFile(filePath, filters);
                            observations = results.observations;
                            sessions = results.sessions;
                        }
                        totalResults = observations.length + sessions.length;
                        if (totalResults === 0) {
                            return [2 /*return*/, {
                                    content: [{
                                            type: 'text',
                                            text: "No results found for file \"".concat(filePath, "\"")
                                        }]
                                }];
                        }
                        combined = __spreadArray(__spreadArray([], observations.map(function (obs) { return ({
                            type: 'observation',
                            data: obs,
                            epoch: obs.created_at_epoch,
                            created_at: obs.created_at
                        }); }), true), sessions.map(function (sess) { return ({
                            type: 'session',
                            data: sess,
                            epoch: sess.created_at_epoch,
                            created_at: sess.created_at
                        }); }), true);
                        // Sort by date (most recent first)
                        combined.sort(function (a, b) { return b.epoch - a.epoch; });
                        resultsByDate = (0, timeline_formatting_js_1.groupByDate)(combined, function (item) { return item.created_at; });
                        lines = [];
                        lines.push("Found ".concat(totalResults, " result(s) for file \"").concat(filePath, "\""));
                        lines.push('');
                        for (_b = 0, resultsByDate_2 = resultsByDate; _b < resultsByDate_2.length; _b++) {
                            _c = resultsByDate_2[_b], day = _c[0], dayResults = _c[1];
                            lines.push("### ".concat(day));
                            lines.push('');
                            lines.push(this.formatter.formatTableHeader());
                            for (_d = 0, dayResults_2 = dayResults; _d < dayResults_2.length; _d++) {
                                result = dayResults_2[_d];
                                if (result.type === 'observation') {
                                    lines.push(this.formatter.formatObservationIndex(result.data, 0));
                                }
                                else {
                                    lines.push(this.formatter.formatSessionIndex(result.data, 0));
                                }
                            }
                            lines.push('');
                        }
                        return [2 /*return*/, {
                                content: [{
                                        type: 'text',
                                        text: lines.join('\n')
                                    }]
                            }];
                }
            });
        });
    };
    /**
     * Tool handler: find_by_type
     */
    SearchManager.prototype.findByType = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var normalized, type, filters, typeStr, results, metadataResults, ids, chromaResults, rankedIds_6, _i, _a, chromaId, header, formattedResults;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        normalized = this.normalizeParams(args);
                        type = normalized.type, filters = __rest(normalized, ["type"]);
                        typeStr = Array.isArray(type) ? type.join(', ') : type;
                        results = [];
                        if (!this.chromaSync) return [3 /*break*/, 2];
                        logger_js_1.logger.debug('SEARCH', 'Using metadata-first + semantic ranking for type search', {});
                        metadataResults = this.sessionSearch.findByType(type, filters);
                        logger_js_1.logger.debug('SEARCH', 'Found observations with type', { type: typeStr, count: metadataResults.length });
                        if (!(metadataResults.length > 0)) return [3 /*break*/, 2];
                        ids = metadataResults.map(function (obs) { return obs.id; });
                        return [4 /*yield*/, this.queryChroma(typeStr, Math.min(ids.length, 100))];
                    case 1:
                        chromaResults = _b.sent();
                        rankedIds_6 = [];
                        for (_i = 0, _a = chromaResults.ids; _i < _a.length; _i++) {
                            chromaId = _a[_i];
                            if (ids.includes(chromaId) && !rankedIds_6.includes(chromaId)) {
                                rankedIds_6.push(chromaId);
                            }
                        }
                        logger_js_1.logger.debug('SEARCH', 'Chroma ranked results by semantic relevance', { count: rankedIds_6.length });
                        // Step 3: Hydrate in semantic rank order
                        if (rankedIds_6.length > 0) {
                            results = this.sessionStore.getObservationsByIds(rankedIds_6, { limit: filters.limit || 20 });
                            // Restore semantic ranking order
                            results.sort(function (a, b) { return rankedIds_6.indexOf(a.id) - rankedIds_6.indexOf(b.id); });
                        }
                        _b.label = 2;
                    case 2:
                        // Fall back to SQLite-only if Chroma unavailable or failed
                        if (results.length === 0) {
                            logger_js_1.logger.debug('SEARCH', 'Using SQLite-only type search', {});
                            results = this.sessionSearch.findByType(type, filters);
                        }
                        if (results.length === 0) {
                            return [2 /*return*/, {
                                    content: [{
                                            type: 'text',
                                            text: "No observations found with type \"".concat(typeStr, "\"")
                                        }]
                                }];
                        }
                        header = "Found ".concat(results.length, " observation(s) with type \"").concat(typeStr, "\"\n\n").concat(this.formatter.formatTableHeader());
                        formattedResults = results.map(function (obs, i) { return _this.formatter.formatObservationIndex(obs, i); });
                        return [2 /*return*/, {
                                content: [{
                                        type: 'text',
                                        text: header + '\n' + formattedResults.join('\n')
                                    }]
                            }];
                }
            });
        });
    };
    /**
     * Tool handler: get_recent_context
     */
    SearchManager.prototype.getRecentContext = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var project, limit, sessions, lines, _i, sessions_1, session, summary, promptLabel, filesRead, filesEdited, date, observations, _a, observations_1, obs, date, date;
            return __generator(this, function (_b) {
                project = args.project || (0, path_1.basename)(process.cwd());
                limit = args.limit || 3;
                sessions = this.sessionStore.getRecentSessionsWithStatus(project, limit);
                if (sessions.length === 0) {
                    return [2 /*return*/, {
                            content: [{
                                    type: 'text',
                                    text: "# Recent Session Context\n\nNo previous sessions found for project \"".concat(project, "\".")
                                }]
                        }];
                }
                lines = [];
                lines.push('# Recent Session Context');
                lines.push('');
                lines.push("Showing last ".concat(sessions.length, " session(s) for **").concat(project, "**:"));
                lines.push('');
                for (_i = 0, sessions_1 = sessions; _i < sessions_1.length; _i++) {
                    session = sessions_1[_i];
                    if (!session.memory_session_id)
                        continue;
                    lines.push('---');
                    lines.push('');
                    if (session.has_summary) {
                        summary = this.sessionStore.getSummaryForSession(session.memory_session_id);
                        if (summary) {
                            promptLabel = summary.prompt_number ? " (Prompt #".concat(summary.prompt_number, ")") : '';
                            lines.push("**Summary".concat(promptLabel, "**"));
                            lines.push('');
                            if (summary.request)
                                lines.push("**Request:** ".concat(summary.request));
                            if (summary.completed)
                                lines.push("**Completed:** ".concat(summary.completed));
                            if (summary.learned)
                                lines.push("**Learned:** ".concat(summary.learned));
                            if (summary.next_steps)
                                lines.push("**Next Steps:** ".concat(summary.next_steps));
                            // Handle files_read
                            if (summary.files_read) {
                                try {
                                    filesRead = JSON.parse(summary.files_read);
                                    if (Array.isArray(filesRead) && filesRead.length > 0) {
                                        lines.push("**Files Read:** ".concat(filesRead.join(', ')));
                                    }
                                }
                                catch (error) {
                                    logger_js_1.logger.debug('WORKER', 'files_read is plain string, using as-is', {}, error);
                                    if (summary.files_read.trim()) {
                                        lines.push("**Files Read:** ".concat(summary.files_read));
                                    }
                                }
                            }
                            // Handle files_edited
                            if (summary.files_edited) {
                                try {
                                    filesEdited = JSON.parse(summary.files_edited);
                                    if (Array.isArray(filesEdited) && filesEdited.length > 0) {
                                        lines.push("**Files Edited:** ".concat(filesEdited.join(', ')));
                                    }
                                }
                                catch (error) {
                                    logger_js_1.logger.debug('WORKER', 'files_edited is plain string, using as-is', {}, error);
                                    if (summary.files_edited.trim()) {
                                        lines.push("**Files Edited:** ".concat(summary.files_edited));
                                    }
                                }
                            }
                            date = new Date(summary.created_at).toLocaleString();
                            lines.push("**Date:** ".concat(date));
                        }
                    }
                    else if (session.status === 'active') {
                        lines.push('**In Progress**');
                        lines.push('');
                        if (session.user_prompt) {
                            lines.push("**Request:** ".concat(session.user_prompt));
                        }
                        observations = this.sessionStore.getObservationsForSession(session.memory_session_id);
                        if (observations.length > 0) {
                            lines.push('');
                            lines.push("**Observations (".concat(observations.length, "):**"));
                            for (_a = 0, observations_1 = observations; _a < observations_1.length; _a++) {
                                obs = observations_1[_a];
                                lines.push("- ".concat(obs.title));
                            }
                        }
                        else {
                            lines.push('');
                            lines.push('*No observations yet*');
                        }
                        lines.push('');
                        lines.push('**Status:** Active - summary pending');
                        date = new Date(session.started_at).toLocaleString();
                        lines.push("**Date:** ".concat(date));
                    }
                    else {
                        lines.push("**".concat(session.status.charAt(0).toUpperCase() + session.status.slice(1), "**"));
                        lines.push('');
                        if (session.user_prompt) {
                            lines.push("**Request:** ".concat(session.user_prompt));
                        }
                        lines.push('');
                        lines.push("**Status:** ".concat(session.status, " - no summary available"));
                        date = new Date(session.started_at).toLocaleString();
                        lines.push("**Date:** ".concat(date));
                    }
                    lines.push('');
                }
                return [2 /*return*/, {
                        content: [{
                                type: 'text',
                                text: lines.join('\n')
                            }]
                    }];
            });
        });
    };
    /**
     * Tool handler: get_context_timeline
     */
    SearchManager.prototype.getContextTimeline = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var anchor, _a, depth_before, _b, depth_after, project, cwd, anchorEpoch, anchorId, timelineData, obs, sessionId, sessionNum, sessions, date, items, filteredItems, anchorDate, lines, dayMap, _i, filteredItems_2, item, day, sortedDays, _c, sortedDays_2, _d, day, dayItems, currentFile, lastTime, tableOpen, _e, dayItems_2, item, isAnchor, sess, title, marker, prompt_2, truncated, obs, file, icon, time, title, tokens, showTime, timeDisplay, anchorMarker;
            var _f;
            return __generator(this, function (_g) {
                anchor = args.anchor, _a = args.depth_before, depth_before = _a === void 0 ? 10 : _a, _b = args.depth_after, depth_after = _b === void 0 ? 10 : _b, project = args.project;
                cwd = process.cwd();
                anchorId = anchor;
                if (typeof anchor === 'number') {
                    obs = this.sessionStore.getObservationById(anchor);
                    if (!obs) {
                        return [2 /*return*/, {
                                content: [{
                                        type: 'text',
                                        text: "Observation #".concat(anchor, " not found")
                                    }],
                                isError: true
                            }];
                    }
                    anchorEpoch = obs.created_at_epoch;
                    timelineData = this.sessionStore.getTimelineAroundObservation(anchor, anchorEpoch, depth_before, depth_after, project);
                }
                else if (typeof anchor === 'string') {
                    // Session ID or ISO timestamp
                    if (anchor.startsWith('S') || anchor.startsWith('#S')) {
                        sessionId = anchor.replace(/^#?S/, '');
                        sessionNum = parseInt(sessionId, 10);
                        sessions = this.sessionStore.getSessionSummariesByIds([sessionNum]);
                        if (sessions.length === 0) {
                            return [2 /*return*/, {
                                    content: [{
                                            type: 'text',
                                            text: "Session #".concat(sessionNum, " not found")
                                        }],
                                    isError: true
                                }];
                        }
                        anchorEpoch = sessions[0].created_at_epoch;
                        anchorId = "S".concat(sessionNum);
                        timelineData = this.sessionStore.getTimelineAroundTimestamp(anchorEpoch, depth_before, depth_after, project);
                    }
                    else {
                        date = new Date(anchor);
                        if (isNaN(date.getTime())) {
                            return [2 /*return*/, {
                                    content: [{
                                            type: 'text',
                                            text: "Invalid timestamp: ".concat(anchor)
                                        }],
                                    isError: true
                                }];
                        }
                        anchorEpoch = date.getTime(); // Keep as milliseconds
                        timelineData = this.sessionStore.getTimelineAroundTimestamp(anchorEpoch, depth_before, depth_after, project);
                    }
                }
                else {
                    return [2 /*return*/, {
                            content: [{
                                    type: 'text',
                                    text: 'Invalid anchor: must be observation ID (number), session ID (e.g., "S123"), or ISO timestamp'
                                }],
                            isError: true
                        }];
                }
                items = __spreadArray(__spreadArray(__spreadArray([], timelineData.observations.map(function (obs) { return ({ type: 'observation', data: obs, epoch: obs.created_at_epoch }); }), true), timelineData.sessions.map(function (sess) { return ({ type: 'session', data: sess, epoch: sess.created_at_epoch }); }), true), timelineData.prompts.map(function (prompt) { return ({ type: 'prompt', data: prompt, epoch: prompt.created_at_epoch }); }), true);
                items.sort(function (a, b) { return a.epoch - b.epoch; });
                filteredItems = this.timelineService.filterByDepth(items, anchorId, anchorEpoch, depth_before, depth_after);
                if (!filteredItems || filteredItems.length === 0) {
                    anchorDate = new Date(anchorEpoch).toLocaleString();
                    return [2 /*return*/, {
                            content: [{
                                    type: 'text',
                                    text: "No context found around ".concat(anchorDate, " (").concat(depth_before, " records before, ").concat(depth_after, " records after)")
                                }]
                        }];
                }
                lines = [];
                // Header
                lines.push("# Timeline around anchor: ".concat(anchorId));
                lines.push("**Window:** ".concat(depth_before, " records before -> ").concat(depth_after, " records after | **Items:** ").concat((_f = filteredItems === null || filteredItems === void 0 ? void 0 : filteredItems.length) !== null && _f !== void 0 ? _f : 0));
                lines.push('');
                dayMap = new Map();
                for (_i = 0, filteredItems_2 = filteredItems; _i < filteredItems_2.length; _i++) {
                    item = filteredItems_2[_i];
                    day = (0, timeline_formatting_js_1.formatDate)(item.epoch);
                    if (!dayMap.has(day)) {
                        dayMap.set(day, []);
                    }
                    dayMap.get(day).push(item);
                }
                sortedDays = Array.from(dayMap.entries()).sort(function (a, b) {
                    var aDate = new Date(a[0]).getTime();
                    var bDate = new Date(b[0]).getTime();
                    return aDate - bDate;
                });
                // Render each day
                for (_c = 0, sortedDays_2 = sortedDays; _c < sortedDays_2.length; _c++) {
                    _d = sortedDays_2[_c], day = _d[0], dayItems = _d[1];
                    lines.push("### ".concat(day));
                    lines.push('');
                    currentFile = null;
                    lastTime = '';
                    tableOpen = false;
                    for (_e = 0, dayItems_2 = dayItems; _e < dayItems_2.length; _e++) {
                        item = dayItems_2[_e];
                        isAnchor = ((typeof anchorId === 'number' && item.type === 'observation' && item.data.id === anchorId) ||
                            (typeof anchorId === 'string' && anchorId.startsWith('S') && item.type === 'session' && "S".concat(item.data.id) === anchorId));
                        if (item.type === 'session') {
                            // Close any open table
                            if (tableOpen) {
                                lines.push('');
                                tableOpen = false;
                                currentFile = null;
                                lastTime = '';
                            }
                            sess = item.data;
                            title = sess.request || 'Session summary';
                            marker = isAnchor ? ' <- **ANCHOR**' : '';
                            lines.push("**\uD83C\uDFAF #S".concat(sess.id, "** ").concat(title, " (").concat((0, timeline_formatting_js_1.formatDateTime)(item.epoch), ")").concat(marker));
                            lines.push('');
                        }
                        else if (item.type === 'prompt') {
                            // Close any open table
                            if (tableOpen) {
                                lines.push('');
                                tableOpen = false;
                                currentFile = null;
                                lastTime = '';
                            }
                            prompt_2 = item.data;
                            truncated = prompt_2.prompt_text.length > 100 ? prompt_2.prompt_text.substring(0, 100) + '...' : prompt_2.prompt_text;
                            lines.push("**\uD83D\uDCAC User Prompt #".concat(prompt_2.prompt_number, "** (").concat((0, timeline_formatting_js_1.formatDateTime)(item.epoch), ")"));
                            lines.push("> ".concat(truncated));
                            lines.push('');
                        }
                        else if (item.type === 'observation') {
                            obs = item.data;
                            file = (0, timeline_formatting_js_1.extractFirstFile)(obs.files_modified, cwd, obs.files_read);
                            // Check if we need a new file section
                            if (file !== currentFile) {
                                // Close previous table
                                if (tableOpen) {
                                    lines.push('');
                                }
                                // File header
                                lines.push("**".concat(file, "**"));
                                lines.push("| ID | Time | T | Title | Tokens |");
                                lines.push("|----|------|---|-------|--------|");
                                currentFile = file;
                                tableOpen = true;
                                lastTime = '';
                            }
                            icon = ModeManager_js_1.ModeManager.getInstance().getTypeIcon(obs.type);
                            time = (0, timeline_formatting_js_1.formatTime)(item.epoch);
                            title = obs.title || 'Untitled';
                            tokens = (0, timeline_formatting_js_1.estimateTokens)(obs.narrative);
                            showTime = time !== lastTime;
                            timeDisplay = showTime ? time : '"';
                            lastTime = time;
                            anchorMarker = isAnchor ? ' <- **ANCHOR**' : '';
                            lines.push("| #".concat(obs.id, " | ").concat(timeDisplay, " | ").concat(icon, " | ").concat(title).concat(anchorMarker, " | ~").concat(tokens, " |"));
                        }
                    }
                    // Close final table if open
                    if (tableOpen) {
                        lines.push('');
                    }
                }
                return [2 /*return*/, {
                        content: [{
                                type: 'text',
                                text: lines.join('\n')
                            }]
                    }];
            });
        });
    };
    /**
     * Tool handler: get_timeline_by_query
     */
    SearchManager.prototype.getTimelineByQuery = function (args) {
        return __awaiter(this, void 0, void 0, function () {
            var query, _a, mode, _b, depth_before, _c, depth_after, _d, limit, project, cwd, results, chromaResults_6, ninetyDaysAgo_5, recentIds, lines, i, obs, title, date, type, topResult, timelineData, items, filteredItems, lines, dayMap, _i, filteredItems_3, item, day, sortedDays, _e, sortedDays_3, _f, day, dayItems, currentFile, lastTime, tableOpen, _g, dayItems_3, item, isAnchor, sess, title, prompt_3, truncated, obs, file, icon, time, title, tokens, showTime, timeDisplay, anchorMarker;
            var _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        query = args.query, _a = args.mode, mode = _a === void 0 ? 'auto' : _a, _b = args.depth_before, depth_before = _b === void 0 ? 10 : _b, _c = args.depth_after, depth_after = _c === void 0 ? 10 : _c, _d = args.limit, limit = _d === void 0 ? 5 : _d, project = args.project;
                        cwd = process.cwd();
                        results = [];
                        if (!this.chromaSync) return [3 /*break*/, 2];
                        logger_js_1.logger.debug('SEARCH', 'Using hybrid semantic search for timeline query', {});
                        return [4 /*yield*/, this.queryChroma(query, 100)];
                    case 1:
                        chromaResults_6 = _j.sent();
                        logger_js_1.logger.debug('SEARCH', 'Chroma returned semantic matches for timeline', { matchCount: chromaResults_6.ids.length });
                        if (chromaResults_6.ids.length > 0) {
                            ninetyDaysAgo_5 = Date.now() - index_js_1.SEARCH_CONSTANTS.RECENCY_WINDOW_MS;
                            recentIds = chromaResults_6.ids.filter(function (_id, idx) {
                                var meta = chromaResults_6.metadatas[idx];
                                return meta && meta.created_at_epoch > ninetyDaysAgo_5;
                            });
                            logger_js_1.logger.debug('SEARCH', 'Results within 90-day window', { count: recentIds.length });
                            if (recentIds.length > 0) {
                                results = this.sessionStore.getObservationsByIds(recentIds, { orderBy: 'date_desc', limit: mode === 'auto' ? 1 : limit });
                                logger_js_1.logger.debug('SEARCH', 'Hydrated observations from SQLite', { count: results.length });
                            }
                        }
                        _j.label = 2;
                    case 2:
                        if (results.length === 0) {
                            return [2 /*return*/, {
                                    content: [{
                                            type: 'text',
                                            text: "No observations found matching \"".concat(query, "\". Try a different search query.")
                                        }]
                                }];
                        }
                        // Step 2: Handle based on mode
                        if (mode === 'interactive') {
                            lines = [];
                            lines.push("# Timeline Anchor Search Results");
                            lines.push('');
                            lines.push("Found ".concat(results.length, " observation(s) matching \"").concat(query, "\""));
                            lines.push('');
                            lines.push("To get timeline context around any of these observations, use the `get_context_timeline` tool with the observation ID as the anchor.");
                            lines.push('');
                            lines.push("**Top ".concat(results.length, " matches:**"));
                            lines.push('');
                            for (i = 0; i < results.length; i++) {
                                obs = results[i];
                                title = obs.title || "Observation #".concat(obs.id);
                                date = new Date(obs.created_at_epoch).toLocaleString();
                                type = obs.type ? "[".concat(obs.type, "]") : '';
                                lines.push("".concat(i + 1, ". **").concat(type, " ").concat(title, "**"));
                                lines.push("   - ID: ".concat(obs.id));
                                lines.push("   - Date: ".concat(date));
                                if (obs.subtitle) {
                                    lines.push("   - ".concat(obs.subtitle));
                                }
                                lines.push('');
                            }
                            return [2 /*return*/, {
                                    content: [{
                                            type: 'text',
                                            text: lines.join('\n')
                                        }]
                                }];
                        }
                        else {
                            topResult = results[0];
                            logger_js_1.logger.debug('SEARCH', 'Auto mode: Using observation as timeline anchor', { observationId: topResult.id });
                            timelineData = this.sessionStore.getTimelineAroundObservation(topResult.id, topResult.created_at_epoch, depth_before, depth_after, project);
                            items = __spreadArray(__spreadArray(__spreadArray([], (timelineData.observations || []).map(function (obs) { return ({ type: 'observation', data: obs, epoch: obs.created_at_epoch }); }), true), (timelineData.sessions || []).map(function (sess) { return ({ type: 'session', data: sess, epoch: sess.created_at_epoch }); }), true), (timelineData.prompts || []).map(function (prompt) { return ({ type: 'prompt', data: prompt, epoch: prompt.created_at_epoch }); }), true);
                            items.sort(function (a, b) { return a.epoch - b.epoch; });
                            filteredItems = this.timelineService.filterByDepth(items, topResult.id, 0, depth_before, depth_after);
                            if (!filteredItems || filteredItems.length === 0) {
                                return [2 /*return*/, {
                                        content: [{
                                                type: 'text',
                                                text: "Found observation #".concat(topResult.id, " matching \"").concat(query, "\", but no timeline context available (").concat(depth_before, " records before, ").concat(depth_after, " records after).")
                                            }]
                                    }];
                            }
                            lines = [];
                            // Header
                            lines.push("# Timeline for query: \"".concat(query, "\""));
                            lines.push("**Anchor:** Observation #".concat(topResult.id, " - ").concat(topResult.title || 'Untitled'));
                            lines.push("**Window:** ".concat(depth_before, " records before -> ").concat(depth_after, " records after | **Items:** ").concat((_h = filteredItems === null || filteredItems === void 0 ? void 0 : filteredItems.length) !== null && _h !== void 0 ? _h : 0));
                            lines.push('');
                            dayMap = new Map();
                            for (_i = 0, filteredItems_3 = filteredItems; _i < filteredItems_3.length; _i++) {
                                item = filteredItems_3[_i];
                                day = (0, timeline_formatting_js_1.formatDate)(item.epoch);
                                if (!dayMap.has(day)) {
                                    dayMap.set(day, []);
                                }
                                dayMap.get(day).push(item);
                            }
                            sortedDays = Array.from(dayMap.entries()).sort(function (a, b) {
                                var aDate = new Date(a[0]).getTime();
                                var bDate = new Date(b[0]).getTime();
                                return aDate - bDate;
                            });
                            // Render each day
                            for (_e = 0, sortedDays_3 = sortedDays; _e < sortedDays_3.length; _e++) {
                                _f = sortedDays_3[_e], day = _f[0], dayItems = _f[1];
                                lines.push("### ".concat(day));
                                lines.push('');
                                currentFile = null;
                                lastTime = '';
                                tableOpen = false;
                                for (_g = 0, dayItems_3 = dayItems; _g < dayItems_3.length; _g++) {
                                    item = dayItems_3[_g];
                                    isAnchor = (item.type === 'observation' && item.data.id === topResult.id);
                                    if (item.type === 'session') {
                                        // Close any open table
                                        if (tableOpen) {
                                            lines.push('');
                                            tableOpen = false;
                                            currentFile = null;
                                            lastTime = '';
                                        }
                                        sess = item.data;
                                        title = sess.request || 'Session summary';
                                        lines.push("**\uD83C\uDFAF #S".concat(sess.id, "** ").concat(title, " (").concat((0, timeline_formatting_js_1.formatDateTime)(item.epoch), ")"));
                                        lines.push('');
                                    }
                                    else if (item.type === 'prompt') {
                                        // Close any open table
                                        if (tableOpen) {
                                            lines.push('');
                                            tableOpen = false;
                                            currentFile = null;
                                            lastTime = '';
                                        }
                                        prompt_3 = item.data;
                                        truncated = prompt_3.prompt_text.length > 100 ? prompt_3.prompt_text.substring(0, 100) + '...' : prompt_3.prompt_text;
                                        lines.push("**\uD83D\uDCAC User Prompt #".concat(prompt_3.prompt_number, "** (").concat((0, timeline_formatting_js_1.formatDateTime)(item.epoch), ")"));
                                        lines.push("> ".concat(truncated));
                                        lines.push('');
                                    }
                                    else if (item.type === 'observation') {
                                        obs = item.data;
                                        file = (0, timeline_formatting_js_1.extractFirstFile)(obs.files_modified, cwd, obs.files_read);
                                        // Check if we need a new file section
                                        if (file !== currentFile) {
                                            // Close previous table
                                            if (tableOpen) {
                                                lines.push('');
                                            }
                                            // File header
                                            lines.push("**".concat(file, "**"));
                                            lines.push("| ID | Time | T | Title | Tokens |");
                                            lines.push("|----|------|---|-------|--------|");
                                            currentFile = file;
                                            tableOpen = true;
                                            lastTime = '';
                                        }
                                        icon = ModeManager_js_1.ModeManager.getInstance().getTypeIcon(obs.type);
                                        time = (0, timeline_formatting_js_1.formatTime)(item.epoch);
                                        title = obs.title || 'Untitled';
                                        tokens = (0, timeline_formatting_js_1.estimateTokens)(obs.narrative);
                                        showTime = time !== lastTime;
                                        timeDisplay = showTime ? time : '"';
                                        lastTime = time;
                                        anchorMarker = isAnchor ? ' <- **ANCHOR**' : '';
                                        lines.push("| #".concat(obs.id, " | ").concat(timeDisplay, " | ").concat(icon, " | ").concat(title).concat(anchorMarker, " | ~").concat(tokens, " |"));
                                    }
                                }
                                // Close final table if open
                                if (tableOpen) {
                                    lines.push('');
                                }
                            }
                            return [2 /*return*/, {
                                    content: [{
                                            type: 'text',
                                            text: lines.join('\n')
                                        }]
                                }];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return SearchManager;
}());
exports.SearchManager = SearchManager;
