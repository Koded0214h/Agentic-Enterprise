"use strict";
/**
 * Bulk import functions for importing data with duplicate checking
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.importSdkSession = importSdkSession;
exports.importSessionSummary = importSessionSummary;
exports.importObservation = importObservation;
exports.importUserPrompt = importUserPrompt;
/**
 * Import SDK session with duplicate checking
 * Duplicates are identified by content_session_id
 */
function importSdkSession(db, session) {
    // Check if session already exists
    var existing = db
        .prepare('SELECT id FROM sdk_sessions WHERE content_session_id = ?')
        .get(session.content_session_id);
    if (existing) {
        return { imported: false, id: existing.id };
    }
    var stmt = db.prepare("\n    INSERT INTO sdk_sessions (\n      content_session_id, memory_session_id, project, user_prompt,\n      started_at, started_at_epoch, completed_at, completed_at_epoch, status\n    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)\n  ");
    var result = stmt.run(session.content_session_id, session.memory_session_id, session.project, session.user_prompt, session.started_at, session.started_at_epoch, session.completed_at, session.completed_at_epoch, session.status);
    return { imported: true, id: result.lastInsertRowid };
}
/**
 * Import session summary with duplicate checking
 * Duplicates are identified by memory_session_id
 */
function importSessionSummary(db, summary) {
    // Check if summary already exists for this session
    var existing = db
        .prepare('SELECT id FROM session_summaries WHERE memory_session_id = ?')
        .get(summary.memory_session_id);
    if (existing) {
        return { imported: false, id: existing.id };
    }
    var stmt = db.prepare("\n    INSERT INTO session_summaries (\n      memory_session_id, project, request, investigated, learned,\n      completed, next_steps, files_read, files_edited, notes,\n      prompt_number, discovery_tokens, created_at, created_at_epoch\n    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\n  ");
    var result = stmt.run(summary.memory_session_id, summary.project, summary.request, summary.investigated, summary.learned, summary.completed, summary.next_steps, summary.files_read, summary.files_edited, summary.notes, summary.prompt_number, summary.discovery_tokens || 0, summary.created_at, summary.created_at_epoch);
    return { imported: true, id: result.lastInsertRowid };
}
/**
 * Import observation with duplicate checking
 * Duplicates are identified by memory_session_id + title + created_at_epoch
 */
function importObservation(db, obs) {
    // Check if observation already exists
    var existing = db
        .prepare("\n      SELECT id FROM observations\n      WHERE memory_session_id = ? AND title = ? AND created_at_epoch = ?\n    ")
        .get(obs.memory_session_id, obs.title, obs.created_at_epoch);
    if (existing) {
        return { imported: false, id: existing.id };
    }
    var stmt = db.prepare("\n    INSERT INTO observations (\n      memory_session_id, project, text, type, title, subtitle,\n      facts, narrative, concepts, files_read, files_modified,\n      prompt_number, discovery_tokens, created_at, created_at_epoch\n    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\n  ");
    var result = stmt.run(obs.memory_session_id, obs.project, obs.text, obs.type, obs.title, obs.subtitle, obs.facts, obs.narrative, obs.concepts, obs.files_read, obs.files_modified, obs.prompt_number, obs.discovery_tokens || 0, obs.created_at, obs.created_at_epoch);
    return { imported: true, id: result.lastInsertRowid };
}
/**
 * Import user prompt with duplicate checking
 * Duplicates are identified by content_session_id + prompt_number
 */
function importUserPrompt(db, prompt) {
    // Check if prompt already exists
    var existing = db
        .prepare("\n      SELECT id FROM user_prompts\n      WHERE content_session_id = ? AND prompt_number = ?\n    ")
        .get(prompt.content_session_id, prompt.prompt_number);
    if (existing) {
        return { imported: false, id: existing.id };
    }
    var stmt = db.prepare("\n    INSERT INTO user_prompts (\n      content_session_id, prompt_number, prompt_text,\n      created_at, created_at_epoch\n    ) VALUES (?, ?, ?, ?, ?)\n  ");
    var result = stmt.run(prompt.content_session_id, prompt.prompt_number, prompt.prompt_text, prompt.created_at, prompt.created_at_epoch);
    return { imported: true, id: result.lastInsertRowid };
}
