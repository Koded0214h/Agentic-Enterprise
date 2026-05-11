"use strict";
/**
 * User prompt retrieval operations
 */
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
exports.getUserPrompt = getUserPrompt;
exports.getPromptNumberFromUserPrompts = getPromptNumberFromUserPrompts;
exports.getLatestUserPrompt = getLatestUserPrompt;
exports.getAllRecentUserPrompts = getAllRecentUserPrompts;
exports.getPromptById = getPromptById;
exports.getPromptsByIds = getPromptsByIds;
exports.getUserPromptsByIds = getUserPromptsByIds;
/**
 * Get user prompt by session ID and prompt number
 * @returns The prompt text, or null if not found
 */
function getUserPrompt(db, contentSessionId, promptNumber) {
    var _a;
    var stmt = db.prepare("\n    SELECT prompt_text\n    FROM user_prompts\n    WHERE content_session_id = ? AND prompt_number = ?\n    LIMIT 1\n  ");
    var result = stmt.get(contentSessionId, promptNumber);
    return (_a = result === null || result === void 0 ? void 0 : result.prompt_text) !== null && _a !== void 0 ? _a : null;
}
/**
 * Get current prompt number by counting user_prompts for this session
 * Replaces the prompt_counter column which is no longer maintained
 */
function getPromptNumberFromUserPrompts(db, contentSessionId) {
    var result = db.prepare("\n    SELECT COUNT(*) as count FROM user_prompts WHERE content_session_id = ?\n  ").get(contentSessionId);
    return result.count;
}
/**
 * Get latest user prompt with session info for a Claude session
 * Used for syncing prompts to Chroma during session initialization
 */
function getLatestUserPrompt(db, contentSessionId) {
    var stmt = db.prepare("\n    SELECT\n      up.*,\n      s.memory_session_id,\n      s.project\n    FROM user_prompts up\n    JOIN sdk_sessions s ON up.content_session_id = s.content_session_id\n    WHERE up.content_session_id = ?\n    ORDER BY up.created_at_epoch DESC\n    LIMIT 1\n  ");
    return stmt.get(contentSessionId);
}
/**
 * Get recent user prompts across all sessions (for web UI)
 */
function getAllRecentUserPrompts(db, limit) {
    if (limit === void 0) { limit = 100; }
    var stmt = db.prepare("\n    SELECT\n      up.id,\n      up.content_session_id,\n      s.project,\n      up.prompt_number,\n      up.prompt_text,\n      up.created_at,\n      up.created_at_epoch\n    FROM user_prompts up\n    LEFT JOIN sdk_sessions s ON up.content_session_id = s.content_session_id\n    ORDER BY up.created_at_epoch DESC\n    LIMIT ?\n  ");
    return stmt.all(limit);
}
/**
 * Get a single user prompt by ID
 */
function getPromptById(db, id) {
    var stmt = db.prepare("\n    SELECT\n      p.id,\n      p.content_session_id,\n      p.prompt_number,\n      p.prompt_text,\n      s.project,\n      p.created_at,\n      p.created_at_epoch\n    FROM user_prompts p\n    LEFT JOIN sdk_sessions s ON p.content_session_id = s.content_session_id\n    WHERE p.id = ?\n    LIMIT 1\n  ");
    return stmt.get(id) || null;
}
/**
 * Get multiple user prompts by IDs
 */
function getPromptsByIds(db, ids) {
    if (ids.length === 0)
        return [];
    var placeholders = ids.map(function () { return '?'; }).join(',');
    var stmt = db.prepare("\n    SELECT\n      p.id,\n      p.content_session_id,\n      p.prompt_number,\n      p.prompt_text,\n      s.project,\n      p.created_at,\n      p.created_at_epoch\n    FROM user_prompts p\n    LEFT JOIN sdk_sessions s ON p.content_session_id = s.content_session_id\n    WHERE p.id IN (".concat(placeholders, ")\n    ORDER BY p.created_at_epoch DESC\n  "));
    return stmt.all.apply(stmt, ids);
}
/**
 * Get user prompts by IDs (for hybrid Chroma search)
 * Returns prompts in specified temporal order with optional project filter
 */
function getUserPromptsByIds(db, ids, options) {
    if (options === void 0) { options = {}; }
    if (ids.length === 0)
        return [];
    var _a = options.orderBy, orderBy = _a === void 0 ? 'date_desc' : _a, limit = options.limit, project = options.project;
    var orderClause = orderBy === 'date_asc' ? 'ASC' : 'DESC';
    var limitClause = limit ? "LIMIT ".concat(limit) : '';
    var placeholders = ids.map(function () { return '?'; }).join(',');
    var params = __spreadArray([], ids, true);
    var projectFilter = project ? 'AND s.project = ?' : '';
    if (project)
        params.push(project);
    var stmt = db.prepare("\n    SELECT\n      up.*,\n      s.project,\n      s.memory_session_id\n    FROM user_prompts up\n    JOIN sdk_sessions s ON up.content_session_id = s.content_session_id\n    WHERE up.id IN (".concat(placeholders, ") ").concat(projectFilter, "\n    ORDER BY up.created_at_epoch ").concat(orderClause, "\n    ").concat(limitClause, "\n  "));
    return stmt.all.apply(stmt, params);
}
