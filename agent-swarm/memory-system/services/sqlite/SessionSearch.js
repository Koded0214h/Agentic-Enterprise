"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionSearch = void 0;
var bun_sqlite_1 = require("bun:sqlite");
var paths_js_1 = require("../../shared/paths.js");
var logger_js_1 = require("../../utils/logger.js");
var path_utils_js_1 = require("../../shared/path-utils.js");
/**
 * Search interface for session-based memory
 * Provides filter-only structured queries for sessions, observations, and user prompts
 * Vector search is handled by ChromaDB - this class only supports filtering without query text
 */
var SessionSearch = /** @class */ (function () {
    function SessionSearch(dbPath) {
        if (!dbPath) {
            (0, paths_js_1.ensureDir)(paths_js_1.DATA_DIR);
            dbPath = paths_js_1.DB_PATH;
        }
        this.db = new bun_sqlite_1.Database(dbPath);
        this.db.run('PRAGMA journal_mode = WAL');
        // Ensure FTS tables exist
        this.ensureFTSTables();
    }
    /**
     * Ensure FTS5 tables exist (backward compatibility only - no longer used for search)
     *
     * FTS5 tables are maintained for backward compatibility but not used for search.
     * Vector search (Chroma) is now the primary search mechanism.
     *
     * Retention Rationale:
     * - Prevents breaking existing installations with FTS5 tables
     * - Allows graceful migration path for users
     * - Tables maintained but search paths removed
     * - Triggers still fire to keep tables synchronized
     *
     * FTS5 may be unavailable on some platforms (e.g., Bun on Windows #791).
     * When unavailable, we skip FTS table creation — search falls back to
     * ChromaDB (vector) and LIKE queries (structured filters) which are unaffected.
     *
     * TODO: Remove FTS5 infrastructure in future major version (v7.0.0)
     */
    SessionSearch.prototype.ensureFTSTables = function () {
        // Check if FTS tables already exist
        var tables = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%_fts'").all();
        var hasFTS = tables.some(function (t) { return t.name === 'observations_fts' || t.name === 'session_summaries_fts'; });
        if (hasFTS) {
            // Already migrated
            return;
        }
        // Runtime check: verify FTS5 is available before attempting to create tables.
        // bun:sqlite on Windows may not include the FTS5 extension (#791).
        if (!this.isFts5Available()) {
            logger_js_1.logger.warn('DB', 'FTS5 not available on this platform — skipping FTS table creation (search uses ChromaDB)');
            return;
        }
        logger_js_1.logger.info('DB', 'Creating FTS5 tables');
        try {
            // Create observations_fts virtual table
            this.db.run("\n        CREATE VIRTUAL TABLE IF NOT EXISTS observations_fts USING fts5(\n          title,\n          subtitle,\n          narrative,\n          text,\n          facts,\n          concepts,\n          content='observations',\n          content_rowid='id'\n        );\n      ");
            // Populate with existing data
            this.db.run("\n        INSERT INTO observations_fts(rowid, title, subtitle, narrative, text, facts, concepts)\n        SELECT id, title, subtitle, narrative, text, facts, concepts\n        FROM observations;\n      ");
            // Create triggers for observations
            this.db.run("\n        CREATE TRIGGER IF NOT EXISTS observations_ai AFTER INSERT ON observations BEGIN\n          INSERT INTO observations_fts(rowid, title, subtitle, narrative, text, facts, concepts)\n          VALUES (new.id, new.title, new.subtitle, new.narrative, new.text, new.facts, new.concepts);\n        END;\n\n        CREATE TRIGGER IF NOT EXISTS observations_ad AFTER DELETE ON observations BEGIN\n          INSERT INTO observations_fts(observations_fts, rowid, title, subtitle, narrative, text, facts, concepts)\n          VALUES('delete', old.id, old.title, old.subtitle, old.narrative, old.text, old.facts, old.concepts);\n        END;\n\n        CREATE TRIGGER IF NOT EXISTS observations_au AFTER UPDATE ON observations BEGIN\n          INSERT INTO observations_fts(observations_fts, rowid, title, subtitle, narrative, text, facts, concepts)\n          VALUES('delete', old.id, old.title, old.subtitle, old.narrative, old.text, old.facts, old.concepts);\n          INSERT INTO observations_fts(rowid, title, subtitle, narrative, text, facts, concepts)\n          VALUES (new.id, new.title, new.subtitle, new.narrative, new.text, new.facts, new.concepts);\n        END;\n      ");
            // Create session_summaries_fts virtual table
            this.db.run("\n        CREATE VIRTUAL TABLE IF NOT EXISTS session_summaries_fts USING fts5(\n          request,\n          investigated,\n          learned,\n          completed,\n          next_steps,\n          notes,\n          content='session_summaries',\n          content_rowid='id'\n        );\n      ");
            // Populate with existing data
            this.db.run("\n        INSERT INTO session_summaries_fts(rowid, request, investigated, learned, completed, next_steps, notes)\n        SELECT id, request, investigated, learned, completed, next_steps, notes\n        FROM session_summaries;\n      ");
            // Create triggers for session_summaries
            this.db.run("\n        CREATE TRIGGER IF NOT EXISTS session_summaries_ai AFTER INSERT ON session_summaries BEGIN\n          INSERT INTO session_summaries_fts(rowid, request, investigated, learned, completed, next_steps, notes)\n          VALUES (new.id, new.request, new.investigated, new.learned, new.completed, new.next_steps, new.notes);\n        END;\n\n        CREATE TRIGGER IF NOT EXISTS session_summaries_ad AFTER DELETE ON session_summaries BEGIN\n          INSERT INTO session_summaries_fts(session_summaries_fts, rowid, request, investigated, learned, completed, next_steps, notes)\n          VALUES('delete', old.id, old.request, old.investigated, old.learned, old.completed, old.next_steps, old.notes);\n        END;\n\n        CREATE TRIGGER IF NOT EXISTS session_summaries_au AFTER UPDATE ON session_summaries BEGIN\n          INSERT INTO session_summaries_fts(session_summaries_fts, rowid, request, investigated, learned, completed, next_steps, notes)\n          VALUES('delete', old.id, old.request, old.investigated, old.learned, old.completed, old.next_steps, old.notes);\n          INSERT INTO session_summaries_fts(rowid, request, investigated, learned, completed, next_steps, notes)\n          VALUES (new.id, new.request, new.investigated, new.learned, new.completed, new.next_steps, new.notes);\n        END;\n      ");
            logger_js_1.logger.info('DB', 'FTS5 tables created successfully');
        }
        catch (error) {
            // FTS5 creation failed at runtime despite probe succeeding — degrade gracefully
            logger_js_1.logger.warn('DB', 'FTS5 table creation failed — search will use ChromaDB and LIKE queries', {}, error);
        }
    };
    /**
     * Probe whether the FTS5 extension is available in the current SQLite build.
     * Creates and immediately drops a temporary FTS5 table.
     */
    SessionSearch.prototype.isFts5Available = function () {
        try {
            this.db.run('CREATE VIRTUAL TABLE _fts5_probe USING fts5(test_column)');
            this.db.run('DROP TABLE _fts5_probe');
            return true;
        }
        catch (_a) {
            return false;
        }
    };
    /**
     * Build WHERE clause for structured filters
     */
    SessionSearch.prototype.buildFilterClause = function (filters, params, tableAlias) {
        if (tableAlias === void 0) { tableAlias = 'o'; }
        var conditions = [];
        // Project filter
        if (filters.project) {
            conditions.push("".concat(tableAlias, ".project = ?"));
            params.push(filters.project);
        }
        // Type filter (for observations only)
        if (filters.type) {
            if (Array.isArray(filters.type)) {
                var placeholders = filters.type.map(function () { return '?'; }).join(',');
                conditions.push("".concat(tableAlias, ".type IN (").concat(placeholders, ")"));
                params.push.apply(params, filters.type);
            }
            else {
                conditions.push("".concat(tableAlias, ".type = ?"));
                params.push(filters.type);
            }
        }
        // Date range filter
        if (filters.dateRange) {
            var _a = filters.dateRange, start = _a.start, end = _a.end;
            if (start) {
                var startEpoch = typeof start === 'number' ? start : new Date(start).getTime();
                conditions.push("".concat(tableAlias, ".created_at_epoch >= ?"));
                params.push(startEpoch);
            }
            if (end) {
                var endEpoch = typeof end === 'number' ? end : new Date(end).getTime();
                conditions.push("".concat(tableAlias, ".created_at_epoch <= ?"));
                params.push(endEpoch);
            }
        }
        // Concepts filter (JSON array search)
        if (filters.concepts) {
            var concepts = Array.isArray(filters.concepts) ? filters.concepts : [filters.concepts];
            var conceptConditions = concepts.map(function () {
                return "EXISTS (SELECT 1 FROM json_each(".concat(tableAlias, ".concepts) WHERE value = ?)");
            });
            if (conceptConditions.length > 0) {
                conditions.push("(".concat(conceptConditions.join(' OR '), ")"));
                params.push.apply(params, concepts);
            }
        }
        // Files filter (JSON array search)
        if (filters.files) {
            var files = Array.isArray(filters.files) ? filters.files : [filters.files];
            var fileConditions = files.map(function () {
                return "(\n          EXISTS (SELECT 1 FROM json_each(".concat(tableAlias, ".files_read) WHERE value LIKE ?)\n          OR EXISTS (SELECT 1 FROM json_each(").concat(tableAlias, ".files_modified) WHERE value LIKE ?)\n        )");
            });
            if (fileConditions.length > 0) {
                conditions.push("(".concat(fileConditions.join(' OR '), ")"));
                files.forEach(function (file) {
                    params.push("%".concat(file, "%"), "%".concat(file, "%"));
                });
            }
        }
        return conditions.length > 0 ? conditions.join(' AND ') : '';
    };
    /**
     * Build ORDER BY clause
     */
    SessionSearch.prototype.buildOrderClause = function (orderBy, hasFTS, ftsTable) {
        if (orderBy === void 0) { orderBy = 'relevance'; }
        if (hasFTS === void 0) { hasFTS = true; }
        if (ftsTable === void 0) { ftsTable = 'observations_fts'; }
        switch (orderBy) {
            case 'relevance':
                return hasFTS ? "ORDER BY ".concat(ftsTable, ".rank ASC") : 'ORDER BY o.created_at_epoch DESC';
            case 'date_desc':
                return 'ORDER BY o.created_at_epoch DESC';
            case 'date_asc':
                return 'ORDER BY o.created_at_epoch ASC';
            default:
                return 'ORDER BY o.created_at_epoch DESC';
        }
    };
    /**
     * Search observations using filter-only direct SQLite query.
     * Vector search is handled by ChromaDB - this only supports filtering without query text.
     */
    SessionSearch.prototype.searchObservations = function (query, options) {
        var _a;
        if (options === void 0) { options = {}; }
        var params = [];
        var _b = options.limit, limit = _b === void 0 ? 50 : _b, _c = options.offset, offset = _c === void 0 ? 0 : _c, _d = options.orderBy, orderBy = _d === void 0 ? 'relevance' : _d, filters = __rest(options, ["limit", "offset", "orderBy"]);
        // FILTER-ONLY PATH: When no query text, query table directly
        // This enables date filtering which Chroma cannot do (requires direct SQLite access)
        if (!query) {
            var filterClause = this.buildFilterClause(filters, params, 'o');
            if (!filterClause) {
                throw new Error('Either query or filters required for search');
            }
            var orderClause = this.buildOrderClause(orderBy, false);
            var sql = "\n        SELECT o.*, o.discovery_tokens\n        FROM observations o\n        WHERE ".concat(filterClause, "\n        ").concat(orderClause, "\n        LIMIT ? OFFSET ?\n      ");
            params.push(limit, offset);
            return (_a = this.db.prepare(sql)).all.apply(_a, params);
        }
        // Vector search with query text should be handled by ChromaDB
        // This method only supports filter-only queries (query=undefined)
        logger_js_1.logger.warn('DB', 'Text search not supported - use ChromaDB for vector search');
        return [];
    };
    /**
     * Search session summaries using filter-only direct SQLite query.
     * Vector search is handled by ChromaDB - this only supports filtering without query text.
     */
    SessionSearch.prototype.searchSessions = function (query, options) {
        var _a;
        if (options === void 0) { options = {}; }
        var params = [];
        var _b = options.limit, limit = _b === void 0 ? 50 : _b, _c = options.offset, offset = _c === void 0 ? 0 : _c, _d = options.orderBy, orderBy = _d === void 0 ? 'relevance' : _d, filters = __rest(options, ["limit", "offset", "orderBy"]);
        // FILTER-ONLY PATH: When no query text, query session_summaries table directly
        if (!query) {
            var filterOptions = __assign({}, filters);
            delete filterOptions.type;
            var filterClause = this.buildFilterClause(filterOptions, params, 's');
            if (!filterClause) {
                throw new Error('Either query or filters required for search');
            }
            var orderClause = orderBy === 'date_asc'
                ? 'ORDER BY s.created_at_epoch ASC'
                : 'ORDER BY s.created_at_epoch DESC';
            var sql = "\n        SELECT s.*, s.discovery_tokens\n        FROM session_summaries s\n        WHERE ".concat(filterClause, "\n        ").concat(orderClause, "\n        LIMIT ? OFFSET ?\n      ");
            params.push(limit, offset);
            return (_a = this.db.prepare(sql)).all.apply(_a, params);
        }
        // Vector search with query text should be handled by ChromaDB
        // This method only supports filter-only queries (query=undefined)
        logger_js_1.logger.warn('DB', 'Text search not supported - use ChromaDB for vector search');
        return [];
    };
    /**
     * Find observations by concept tag
     */
    SessionSearch.prototype.findByConcept = function (concept, options) {
        var _a;
        if (options === void 0) { options = {}; }
        var params = [];
        var _b = options.limit, limit = _b === void 0 ? 50 : _b, _c = options.offset, offset = _c === void 0 ? 0 : _c, _d = options.orderBy, orderBy = _d === void 0 ? 'date_desc' : _d, filters = __rest(options, ["limit", "offset", "orderBy"]);
        // Add concept to filters
        var conceptFilters = __assign(__assign({}, filters), { concepts: concept });
        var filterClause = this.buildFilterClause(conceptFilters, params, 'o');
        var orderClause = this.buildOrderClause(orderBy, false);
        var sql = "\n      SELECT o.*, o.discovery_tokens\n      FROM observations o\n      WHERE ".concat(filterClause, "\n      ").concat(orderClause, "\n      LIMIT ? OFFSET ?\n    ");
        params.push(limit, offset);
        return (_a = this.db.prepare(sql)).all.apply(_a, params);
    };
    /**
     * Check if an observation has any files that are direct children of the folder
     */
    SessionSearch.prototype.hasDirectChildFile = function (obs, folderPath) {
        var checkFiles = function (filesJson) {
            if (!filesJson)
                return false;
            try {
                var files = JSON.parse(filesJson);
                if (Array.isArray(files)) {
                    return files.some(function (f) { return (0, path_utils_js_1.isDirectChild)(f, folderPath); });
                }
            }
            catch (_a) { }
            return false;
        };
        return checkFiles(obs.files_modified) || checkFiles(obs.files_read);
    };
    /**
     * Check if a session has any files that are direct children of the folder
     */
    SessionSearch.prototype.hasDirectChildFileSession = function (session, folderPath) {
        var checkFiles = function (filesJson) {
            if (!filesJson)
                return false;
            try {
                var files = JSON.parse(filesJson);
                if (Array.isArray(files)) {
                    return files.some(function (f) { return (0, path_utils_js_1.isDirectChild)(f, folderPath); });
                }
            }
            catch (_a) { }
            return false;
        };
        return checkFiles(session.files_read) || checkFiles(session.files_edited);
    };
    /**
     * Find observations and summaries by file path
     * When isFolder=true, only returns results with files directly in the folder (not subfolders)
     */
    SessionSearch.prototype.findByFile = function (filePath, options) {
        var _a, _b;
        var _this = this;
        if (options === void 0) { options = {}; }
        var params = [];
        var _c = options.limit, limit = _c === void 0 ? 50 : _c, _d = options.offset, offset = _d === void 0 ? 0 : _d, _e = options.orderBy, orderBy = _e === void 0 ? 'date_desc' : _e, _f = options.isFolder, isFolder = _f === void 0 ? false : _f, filters = __rest(options, ["limit", "offset", "orderBy", "isFolder"]);
        // Query more results if we're filtering to direct children
        var queryLimit = isFolder ? limit * 3 : limit;
        // Add file to filters
        var fileFilters = __assign(__assign({}, filters), { files: filePath });
        var filterClause = this.buildFilterClause(fileFilters, params, 'o');
        var orderClause = this.buildOrderClause(orderBy, false);
        var observationsSql = "\n      SELECT o.*, o.discovery_tokens\n      FROM observations o\n      WHERE ".concat(filterClause, "\n      ").concat(orderClause, "\n      LIMIT ? OFFSET ?\n    ");
        params.push(queryLimit, offset);
        var observations = (_a = this.db.prepare(observationsSql)).all.apply(_a, params);
        // Post-filter to direct children if isFolder mode
        if (isFolder) {
            observations = observations.filter(function (obs) { return _this.hasDirectChildFile(obs, filePath); }).slice(0, limit);
        }
        // For session summaries, search files_read and files_edited
        var sessionParams = [];
        var sessionFilters = __assign({}, filters);
        delete sessionFilters.type; // Remove type filter for sessions
        var baseConditions = [];
        if (sessionFilters.project) {
            baseConditions.push('s.project = ?');
            sessionParams.push(sessionFilters.project);
        }
        if (sessionFilters.dateRange) {
            var _g = sessionFilters.dateRange, start = _g.start, end = _g.end;
            if (start) {
                var startEpoch = typeof start === 'number' ? start : new Date(start).getTime();
                baseConditions.push('s.created_at_epoch >= ?');
                sessionParams.push(startEpoch);
            }
            if (end) {
                var endEpoch = typeof end === 'number' ? end : new Date(end).getTime();
                baseConditions.push('s.created_at_epoch <= ?');
                sessionParams.push(endEpoch);
            }
        }
        // File condition
        baseConditions.push("(\n      EXISTS (SELECT 1 FROM json_each(s.files_read) WHERE value LIKE ?)\n      OR EXISTS (SELECT 1 FROM json_each(s.files_edited) WHERE value LIKE ?)\n    )");
        sessionParams.push("%".concat(filePath, "%"), "%".concat(filePath, "%"));
        var sessionsSql = "\n      SELECT s.*, s.discovery_tokens\n      FROM session_summaries s\n      WHERE ".concat(baseConditions.join(' AND '), "\n      ORDER BY s.created_at_epoch DESC\n      LIMIT ? OFFSET ?\n    ");
        sessionParams.push(queryLimit, offset);
        var sessions = (_b = this.db.prepare(sessionsSql)).all.apply(_b, sessionParams);
        // Post-filter to direct children if isFolder mode
        if (isFolder) {
            sessions = sessions.filter(function (s) { return _this.hasDirectChildFileSession(s, filePath); }).slice(0, limit);
        }
        return { observations: observations, sessions: sessions };
    };
    /**
     * Find observations by type
     */
    SessionSearch.prototype.findByType = function (type, options) {
        var _a;
        if (options === void 0) { options = {}; }
        var params = [];
        var _b = options.limit, limit = _b === void 0 ? 50 : _b, _c = options.offset, offset = _c === void 0 ? 0 : _c, _d = options.orderBy, orderBy = _d === void 0 ? 'date_desc' : _d, filters = __rest(options, ["limit", "offset", "orderBy"]);
        // Add type to filters
        var typeFilters = __assign(__assign({}, filters), { type: type });
        var filterClause = this.buildFilterClause(typeFilters, params, 'o');
        var orderClause = this.buildOrderClause(orderBy, false);
        var sql = "\n      SELECT o.*, o.discovery_tokens\n      FROM observations o\n      WHERE ".concat(filterClause, "\n      ").concat(orderClause, "\n      LIMIT ? OFFSET ?\n    ");
        params.push(limit, offset);
        return (_a = this.db.prepare(sql)).all.apply(_a, params);
    };
    /**
     * Search user prompts using filter-only direct SQLite query.
     * Vector search is handled by ChromaDB - this only supports filtering without query text.
     */
    SessionSearch.prototype.searchUserPrompts = function (query, options) {
        var _a;
        if (options === void 0) { options = {}; }
        var params = [];
        var _b = options.limit, limit = _b === void 0 ? 20 : _b, _c = options.offset, offset = _c === void 0 ? 0 : _c, _d = options.orderBy, orderBy = _d === void 0 ? 'relevance' : _d, filters = __rest(options, ["limit", "offset", "orderBy"]);
        // Build filter conditions (join with sdk_sessions for project filtering)
        var baseConditions = [];
        if (filters.project) {
            baseConditions.push('s.project = ?');
            params.push(filters.project);
        }
        if (filters.dateRange) {
            var _e = filters.dateRange, start = _e.start, end = _e.end;
            if (start) {
                var startEpoch = typeof start === 'number' ? start : new Date(start).getTime();
                baseConditions.push('up.created_at_epoch >= ?');
                params.push(startEpoch);
            }
            if (end) {
                var endEpoch = typeof end === 'number' ? end : new Date(end).getTime();
                baseConditions.push('up.created_at_epoch <= ?');
                params.push(endEpoch);
            }
        }
        // FILTER-ONLY PATH: When no query text, query user_prompts table directly
        if (!query) {
            if (baseConditions.length === 0) {
                throw new Error('Either query or filters required for search');
            }
            var whereClause = "WHERE ".concat(baseConditions.join(' AND '));
            var orderClause = orderBy === 'date_asc'
                ? 'ORDER BY up.created_at_epoch ASC'
                : 'ORDER BY up.created_at_epoch DESC';
            var sql = "\n        SELECT up.*\n        FROM user_prompts up\n        JOIN sdk_sessions s ON up.content_session_id = s.content_session_id\n        ".concat(whereClause, "\n        ").concat(orderClause, "\n        LIMIT ? OFFSET ?\n      ");
            params.push(limit, offset);
            return (_a = this.db.prepare(sql)).all.apply(_a, params);
        }
        // Vector search with query text should be handled by ChromaDB
        // This method only supports filter-only queries (query=undefined)
        logger_js_1.logger.warn('DB', 'Text search not supported - use ChromaDB for vector search');
        return [];
    };
    /**
     * Get all prompts for a session by content_session_id
     */
    SessionSearch.prototype.getUserPromptsBySession = function (contentSessionId) {
        var stmt = this.db.prepare("\n      SELECT\n        id,\n        content_session_id,\n        prompt_number,\n        prompt_text,\n        created_at,\n        created_at_epoch\n      FROM user_prompts\n      WHERE content_session_id = ?\n      ORDER BY prompt_number ASC\n    ");
        return stmt.all(contentSessionId);
    };
    /**
     * Close the database connection
     */
    SessionSearch.prototype.close = function () {
        this.db.close();
    };
    return SessionSearch;
}());
exports.SessionSearch = SessionSearch;
