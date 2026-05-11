"use strict";
/**
 * PaginationHelper: DRY pagination utility
 *
 * Responsibility:
 * - DRY helper for paginated queries
 * - Eliminates copy-paste across observations/summaries/prompts endpoints
 * - Efficient LIMIT+1 trick to avoid COUNT(*) query
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationHelper = void 0;
var logger_js_1 = require("../../utils/logger.js");
var PaginationHelper = /** @class */ (function () {
    function PaginationHelper(dbManager) {
        this.dbManager = dbManager;
    }
    /**
     * Strip project path from file paths using heuristic
     * Converts "/Users/user/project/src/file.ts" -> "src/file.ts"
     * Uses first occurrence of project name from left (project root)
     */
    PaginationHelper.prototype.stripProjectPath = function (filePath, projectName) {
        var marker = "/".concat(projectName, "/");
        var index = filePath.indexOf(marker);
        if (index !== -1) {
            // Strip everything before and including the project name
            return filePath.substring(index + marker.length);
        }
        // Fallback: return original path if project name not found
        return filePath;
    };
    /**
     * Strip project path from JSON array of file paths
     */
    PaginationHelper.prototype.stripProjectPaths = function (filePathsStr, projectName) {
        var _this = this;
        if (!filePathsStr)
            return filePathsStr;
        try {
            // Parse JSON array
            var paths = JSON.parse(filePathsStr);
            // Strip project path from each file
            var strippedPaths = paths.map(function (p) { return _this.stripProjectPath(p, projectName); });
            // Return as JSON string
            return JSON.stringify(strippedPaths);
        }
        catch (err) {
            logger_js_1.logger.debug('WORKER', 'File paths is plain string, using as-is', {}, err);
            return filePathsStr;
        }
    };
    /**
     * Sanitize observation by stripping project paths from files
     */
    PaginationHelper.prototype.sanitizeObservation = function (obs) {
        return __assign(__assign({}, obs), { files_read: this.stripProjectPaths(obs.files_read, obs.project), files_modified: this.stripProjectPaths(obs.files_modified, obs.project) });
    };
    /**
     * Get paginated observations
     */
    PaginationHelper.prototype.getObservations = function (offset, limit, project) {
        var _this = this;
        var result = this.paginate('observations', 'id, memory_session_id, project, type, title, subtitle, narrative, text, facts, concepts, files_read, files_modified, prompt_number, created_at, created_at_epoch', offset, limit, project);
        // Strip project paths from file paths before returning
        return __assign(__assign({}, result), { items: result.items.map(function (obs) { return _this.sanitizeObservation(obs); }) });
    };
    /**
     * Get paginated summaries
     */
    PaginationHelper.prototype.getSummaries = function (offset, limit, project) {
        var db = this.dbManager.getSessionStore().db;
        var query = "\n      SELECT\n        ss.id,\n        s.content_session_id as session_id,\n        ss.request,\n        ss.investigated,\n        ss.learned,\n        ss.completed,\n        ss.next_steps,\n        ss.project,\n        ss.created_at,\n        ss.created_at_epoch\n      FROM session_summaries ss\n      JOIN sdk_sessions s ON ss.memory_session_id = s.memory_session_id\n    ";
        var params = [];
        if (project) {
            query += ' WHERE ss.project = ?';
            params.push(project);
        }
        query += ' ORDER BY ss.created_at_epoch DESC LIMIT ? OFFSET ?';
        params.push(limit + 1, offset);
        var stmt = db.prepare(query);
        var results = stmt.all.apply(stmt, params);
        return {
            items: results.slice(0, limit),
            hasMore: results.length > limit,
            offset: offset,
            limit: limit
        };
    };
    /**
     * Get paginated user prompts
     */
    PaginationHelper.prototype.getPrompts = function (offset, limit, project) {
        var db = this.dbManager.getSessionStore().db;
        var query = "\n      SELECT up.id, up.content_session_id, s.project, up.prompt_number, up.prompt_text, up.created_at, up.created_at_epoch\n      FROM user_prompts up\n      JOIN sdk_sessions s ON up.content_session_id = s.content_session_id\n    ";
        var params = [];
        if (project) {
            query += ' WHERE s.project = ?';
            params.push(project);
        }
        query += ' ORDER BY up.created_at_epoch DESC LIMIT ? OFFSET ?';
        params.push(limit + 1, offset);
        var stmt = db.prepare(query);
        var results = stmt.all.apply(stmt, params);
        return {
            items: results.slice(0, limit),
            hasMore: results.length > limit,
            offset: offset,
            limit: limit
        };
    };
    /**
     * Generic pagination implementation (DRY)
     */
    PaginationHelper.prototype.paginate = function (table, columns, offset, limit, project) {
        var db = this.dbManager.getSessionStore().db;
        var query = "SELECT ".concat(columns, " FROM ").concat(table);
        var params = [];
        if (project) {
            query += ' WHERE project = ?';
            params.push(project);
        }
        query += ' ORDER BY created_at_epoch DESC LIMIT ? OFFSET ?';
        params.push(limit + 1, offset); // Fetch one extra to check hasMore
        var stmt = db.prepare(query);
        var results = stmt.all.apply(stmt, params);
        return {
            items: results.slice(0, limit),
            hasMore: results.length > limit,
            offset: offset,
            limit: limit
        };
    };
    return PaginationHelper;
}());
exports.PaginationHelper = PaginationHelper;
