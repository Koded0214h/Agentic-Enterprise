"use strict";
/**
 * User prompt storage operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveUserPrompt = saveUserPrompt;
/**
 * Save a user prompt to the database
 * @returns The inserted row ID
 */
function saveUserPrompt(db, contentSessionId, promptNumber, promptText) {
    var now = new Date();
    var nowEpoch = now.getTime();
    var stmt = db.prepare("\n    INSERT INTO user_prompts\n    (content_session_id, prompt_number, prompt_text, created_at, created_at_epoch)\n    VALUES (?, ?, ?, ?, ?)\n  ");
    var result = stmt.run(contentSessionId, promptNumber, promptText, now.toISOString(), nowEpoch);
    return result.lastInsertRowid;
}
