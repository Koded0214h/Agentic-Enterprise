"use strict";
/**
 * Session creation and update functions
 * Database-first parameter pattern for functional composition
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSDKSession = createSDKSession;
exports.updateMemorySessionId = updateMemorySessionId;
/**
 * Create a new SDK session (idempotent - returns existing session ID if already exists)
 *
 * IDEMPOTENCY via INSERT OR IGNORE pattern:
 * - Prompt #1: session_id not in database -> INSERT creates new row
 * - Prompt #2+: session_id exists -> INSERT ignored, fetch existing ID
 * - Result: Same database ID returned for all prompts in conversation
 *
 * Pure get-or-create: never modifies memory_session_id.
 * Multi-terminal isolation is handled by ON UPDATE CASCADE at the schema level.
 */
function createSDKSession(db, contentSessionId, project, userPrompt, customTitle) {
    var now = new Date();
    var nowEpoch = now.getTime();
    // Check for existing session
    var existing = db.prepare("\n    SELECT id FROM sdk_sessions WHERE content_session_id = ?\n  ").get(contentSessionId);
    if (existing) {
        // Backfill project if session was created by another hook with empty project
        if (project) {
            db.prepare("\n        UPDATE sdk_sessions SET project = ?\n        WHERE content_session_id = ? AND (project IS NULL OR project = '')\n      ").run(project, contentSessionId);
        }
        // Backfill custom_title if provided and not yet set
        if (customTitle) {
            db.prepare("\n        UPDATE sdk_sessions SET custom_title = ?\n        WHERE content_session_id = ? AND custom_title IS NULL\n      ").run(customTitle, contentSessionId);
        }
        return existing.id;
    }
    // New session - insert fresh row
    // NOTE: memory_session_id starts as NULL. It is captured by SDKAgent from the first SDK
    // response and stored via ensureMemorySessionIdRegistered(). CRITICAL: memory_session_id
    // must NEVER equal contentSessionId - that would inject memory messages into the user's transcript!
    db.prepare("\n    INSERT INTO sdk_sessions\n    (content_session_id, memory_session_id, project, user_prompt, custom_title, started_at, started_at_epoch, status)\n    VALUES (?, NULL, ?, ?, ?, ?, ?, 'active')\n  ").run(contentSessionId, project, userPrompt, customTitle || null, now.toISOString(), nowEpoch);
    // Return new ID
    var row = db.prepare('SELECT id FROM sdk_sessions WHERE content_session_id = ?')
        .get(contentSessionId);
    return row.id;
}
/**
 * Update the memory session ID for a session
 * Called by SDKAgent when it captures the session ID from the first SDK message
 * Also used to RESET to null on stale resume failures (worker-service.ts)
 */
function updateMemorySessionId(db, sessionDbId, memorySessionId) {
    db.prepare("\n    UPDATE sdk_sessions\n    SET memory_session_id = ?\n    WHERE id = ?\n  ").run(memorySessionId, sessionDbId);
}
