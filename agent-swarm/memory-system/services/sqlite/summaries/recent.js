"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentSummaries = getRecentSummaries;
exports.getRecentSummariesWithSessionInfo = getRecentSummariesWithSessionInfo;
exports.getAllRecentSummaries = getAllRecentSummaries;
/**
 * Get recent session summaries for a project
 *
 * @param db - Database instance
 * @param project - Project name to filter by
 * @param limit - Maximum number of summaries to return (default 10)
 */
function getRecentSummaries(db, project, limit) {
    if (limit === void 0) { limit = 10; }
    var stmt = db.prepare("\n    SELECT\n      request, investigated, learned, completed, next_steps,\n      files_read, files_edited, notes, prompt_number, created_at\n    FROM session_summaries\n    WHERE project = ?\n    ORDER BY created_at_epoch DESC\n    LIMIT ?\n  ");
    return stmt.all(project, limit);
}
/**
 * Get recent summaries with session info for context display
 *
 * @param db - Database instance
 * @param project - Project name to filter by
 * @param limit - Maximum number of summaries to return (default 3)
 */
function getRecentSummariesWithSessionInfo(db, project, limit) {
    if (limit === void 0) { limit = 3; }
    var stmt = db.prepare("\n    SELECT\n      memory_session_id, request, learned, completed, next_steps,\n      prompt_number, created_at\n    FROM session_summaries\n    WHERE project = ?\n    ORDER BY created_at_epoch DESC\n    LIMIT ?\n  ");
    return stmt.all(project, limit);
}
/**
 * Get recent summaries across all projects (for web UI)
 *
 * @param db - Database instance
 * @param limit - Maximum number of summaries to return (default 50)
 */
function getAllRecentSummaries(db, limit) {
    if (limit === void 0) { limit = 50; }
    var stmt = db.prepare("\n    SELECT id, request, investigated, learned, completed, next_steps,\n           files_read, files_edited, notes, project, prompt_number,\n           created_at, created_at_epoch\n    FROM session_summaries\n    ORDER BY created_at_epoch DESC\n    LIMIT ?\n  ");
    return stmt.all(limit);
}
