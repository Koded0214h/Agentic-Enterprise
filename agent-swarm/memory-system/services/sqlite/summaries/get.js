"use strict";
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
exports.getSummaryForSession = getSummaryForSession;
exports.getSummaryById = getSummaryById;
exports.getSummariesByIds = getSummariesByIds;
/**
 * Get summary for a specific session
 *
 * @param db - Database instance
 * @param memorySessionId - SDK memory session ID
 * @returns Most recent summary for the session, or null if none exists
 */
function getSummaryForSession(db, memorySessionId) {
    var stmt = db.prepare("\n    SELECT\n      request, investigated, learned, completed, next_steps,\n      files_read, files_edited, notes, prompt_number, created_at,\n      created_at_epoch\n    FROM session_summaries\n    WHERE memory_session_id = ?\n    ORDER BY created_at_epoch DESC\n    LIMIT 1\n  ");
    return stmt.get(memorySessionId) || null;
}
/**
 * Get a single session summary by ID
 *
 * @param db - Database instance
 * @param id - Summary ID
 * @returns Full summary record or null if not found
 */
function getSummaryById(db, id) {
    var stmt = db.prepare("\n    SELECT * FROM session_summaries WHERE id = ?\n  ");
    return stmt.get(id) || null;
}
/**
 * Get session summaries by IDs (for hybrid Chroma search)
 * Returns summaries in specified temporal order
 *
 * @param db - Database instance
 * @param ids - Array of summary IDs
 * @param options - Query options (orderBy, limit, project)
 */
function getSummariesByIds(db, ids, options) {
    if (options === void 0) { options = {}; }
    if (ids.length === 0)
        return [];
    var _a = options.orderBy, orderBy = _a === void 0 ? 'date_desc' : _a, limit = options.limit, project = options.project;
    var orderClause = orderBy === 'date_asc' ? 'ASC' : 'DESC';
    var limitClause = limit ? "LIMIT ".concat(limit) : '';
    var placeholders = ids.map(function () { return '?'; }).join(',');
    var params = __spreadArray([], ids, true);
    // Apply project filter
    var whereClause = project
        ? "WHERE id IN (".concat(placeholders, ") AND project = ?")
        : "WHERE id IN (".concat(placeholders, ")");
    if (project)
        params.push(project);
    var stmt = db.prepare("\n    SELECT * FROM session_summaries\n    ".concat(whereClause, "\n    ORDER BY created_at_epoch ").concat(orderClause, "\n    ").concat(limitClause, "\n  "));
    return stmt.all.apply(stmt, params);
}
