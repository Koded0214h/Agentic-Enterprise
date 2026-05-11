"use strict";
/**
 * Session retrieval functions
 * Database-first parameter pattern for functional composition
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionById = getSessionById;
exports.getSdkSessionsBySessionIds = getSdkSessionsBySessionIds;
exports.getRecentSessionsWithStatus = getRecentSessionsWithStatus;
exports.getSessionSummaryById = getSessionSummaryById;
/**
 * Get session by ID (basic fields only)
 */
function getSessionById(db, id) {
    var stmt = db.prepare("\n    SELECT id, content_session_id, memory_session_id, project, user_prompt, custom_title\n    FROM sdk_sessions\n    WHERE id = ?\n    LIMIT 1\n  ");
    return stmt.get(id) || null;
}
/**
 * Get SDK sessions by memory session IDs
 * Used for exporting session metadata
 */
function getSdkSessionsBySessionIds(db, memorySessionIds) {
    if (memorySessionIds.length === 0)
        return [];
    var placeholders = memorySessionIds.map(function () { return '?'; }).join(',');
    var stmt = db.prepare("\n    SELECT id, content_session_id, memory_session_id, project, user_prompt, custom_title,\n           started_at, started_at_epoch, completed_at, completed_at_epoch, status\n    FROM sdk_sessions\n    WHERE memory_session_id IN (".concat(placeholders, ")\n    ORDER BY started_at_epoch DESC\n  "));
    return stmt.all.apply(stmt, memorySessionIds);
}
/**
 * Get recent sessions with their status and summary info
 * Returns sessions ordered oldest-first for display
 */
function getRecentSessionsWithStatus(db, project, limit) {
    if (limit === void 0) { limit = 3; }
    var stmt = db.prepare("\n    SELECT * FROM (\n      SELECT\n        s.memory_session_id,\n        s.status,\n        s.started_at,\n        s.started_at_epoch,\n        s.user_prompt,\n        CASE WHEN sum.memory_session_id IS NOT NULL THEN 1 ELSE 0 END as has_summary\n      FROM sdk_sessions s\n      LEFT JOIN session_summaries sum ON s.memory_session_id = sum.memory_session_id\n      WHERE s.project = ? AND s.memory_session_id IS NOT NULL\n      GROUP BY s.memory_session_id\n      ORDER BY s.started_at_epoch DESC\n      LIMIT ?\n    )\n    ORDER BY started_at_epoch ASC\n  ");
    return stmt.all(project, limit);
}
/**
 * Get full session summary by ID (includes request_summary and learned_summary)
 */
function getSessionSummaryById(db, id) {
    var stmt = db.prepare("\n    SELECT\n      id,\n      memory_session_id,\n      content_session_id,\n      project,\n      user_prompt,\n      request_summary,\n      learned_summary,\n      status,\n      created_at,\n      created_at_epoch\n    FROM sdk_sessions\n    WHERE id = ?\n    LIMIT 1\n  ");
    return stmt.get(id) || null;
}
