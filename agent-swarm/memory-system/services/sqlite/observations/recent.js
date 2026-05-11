"use strict";
/**
 * Recent observation retrieval functions
 * Extracted from SessionStore.ts for modular organization
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentObservations = getRecentObservations;
exports.getAllRecentObservations = getAllRecentObservations;
/**
 * Get recent observations for a project
 */
function getRecentObservations(db, project, limit) {
    if (limit === void 0) { limit = 20; }
    var stmt = db.prepare("\n    SELECT type, text, prompt_number, created_at\n    FROM observations\n    WHERE project = ?\n    ORDER BY created_at_epoch DESC\n    LIMIT ?\n  ");
    return stmt.all(project, limit);
}
/**
 * Get recent observations across all projects (for web UI)
 */
function getAllRecentObservations(db, limit) {
    if (limit === void 0) { limit = 100; }
    var stmt = db.prepare("\n    SELECT id, type, title, subtitle, text, project, prompt_number, created_at, created_at_epoch\n    FROM observations\n    ORDER BY created_at_epoch DESC\n    LIMIT ?\n  ");
    return stmt.all(limit);
}
