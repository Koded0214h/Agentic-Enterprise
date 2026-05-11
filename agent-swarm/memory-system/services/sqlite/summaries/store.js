"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeSummary = storeSummary;
/**
 * Store a session summary (from SDK parsing)
 * Assumes session already exists - will fail with FK error if not
 *
 * @param db - Database instance
 * @param memorySessionId - SDK memory session ID
 * @param project - Project name
 * @param summary - Summary content from SDK parsing
 * @param promptNumber - Optional prompt number
 * @param discoveryTokens - Token count for discovery (default 0)
 * @param overrideTimestampEpoch - Optional timestamp override for backlog processing
 */
function storeSummary(db, memorySessionId, project, summary, promptNumber, discoveryTokens, overrideTimestampEpoch) {
    if (discoveryTokens === void 0) { discoveryTokens = 0; }
    // Use override timestamp if provided (for processing backlog messages with original timestamps)
    var timestampEpoch = overrideTimestampEpoch !== null && overrideTimestampEpoch !== void 0 ? overrideTimestampEpoch : Date.now();
    var timestampIso = new Date(timestampEpoch).toISOString();
    var stmt = db.prepare("\n    INSERT INTO session_summaries\n    (memory_session_id, project, request, investigated, learned, completed,\n     next_steps, notes, prompt_number, discovery_tokens, created_at, created_at_epoch)\n    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\n  ");
    var result = stmt.run(memorySessionId, project, summary.request, summary.investigated, summary.learned, summary.completed, summary.next_steps, summary.notes, promptNumber || null, discoveryTokens, timestampIso, timestampEpoch);
    return {
        id: Number(result.lastInsertRowid),
        createdAtEpoch: timestampEpoch
    };
}
