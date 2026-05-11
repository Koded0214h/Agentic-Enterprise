"use strict";
/**
 * Store observation function
 * Extracted from SessionStore.ts for modular organization
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeObservationContentHash = computeObservationContentHash;
exports.findDuplicateObservation = findDuplicateObservation;
exports.storeObservation = storeObservation;
var crypto_1 = require("crypto");
var logger_js_1 = require("../../../utils/logger.js");
var paths_js_1 = require("../../../shared/paths.js");
/** Deduplication window: observations with the same content hash within this window are skipped */
var DEDUP_WINDOW_MS = 30000;
/**
 * Compute a short content hash for deduplication.
 * Uses (memory_session_id, title, narrative) as the semantic identity of an observation.
 */
function computeObservationContentHash(memorySessionId, title, narrative) {
    return (0, crypto_1.createHash)('sha256')
        .update((memorySessionId || '') + (title || '') + (narrative || ''))
        .digest('hex')
        .slice(0, 16);
}
/**
 * Check if a duplicate observation exists within the dedup window.
 * Returns the existing observation's id and timestamp if found, null otherwise.
 */
function findDuplicateObservation(db, contentHash, timestampEpoch) {
    var windowStart = timestampEpoch - DEDUP_WINDOW_MS;
    var stmt = db.prepare('SELECT id, created_at_epoch FROM observations WHERE content_hash = ? AND created_at_epoch > ?');
    return stmt.get(contentHash, windowStart);
}
/**
 * Store an observation (from SDK parsing)
 * Assumes session already exists (created by hook)
 * Performs content-hash deduplication: skips INSERT if an identical observation exists within 30s
 */
function storeObservation(db, memorySessionId, project, observation, promptNumber, discoveryTokens, overrideTimestampEpoch) {
    if (discoveryTokens === void 0) { discoveryTokens = 0; }
    // Use override timestamp if provided (for processing backlog messages with original timestamps)
    var timestampEpoch = overrideTimestampEpoch !== null && overrideTimestampEpoch !== void 0 ? overrideTimestampEpoch : Date.now();
    var timestampIso = new Date(timestampEpoch).toISOString();
    // Guard against empty project string (race condition where project isn't set yet)
    var resolvedProject = project || (0, paths_js_1.getCurrentProjectName)();
    // Content-hash deduplication
    var contentHash = computeObservationContentHash(memorySessionId, observation.title, observation.narrative);
    var existing = findDuplicateObservation(db, contentHash, timestampEpoch);
    if (existing) {
        logger_js_1.logger.debug('DEDUP', "Skipped duplicate observation | contentHash=".concat(contentHash, " | existingId=").concat(existing.id));
        return { id: existing.id, createdAtEpoch: existing.created_at_epoch };
    }
    var stmt = db.prepare("\n    INSERT INTO observations\n    (memory_session_id, project, type, title, subtitle, facts, narrative, concepts,\n     files_read, files_modified, prompt_number, discovery_tokens, content_hash, created_at, created_at_epoch)\n    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\n  ");
    var result = stmt.run(memorySessionId, resolvedProject, observation.type, observation.title, observation.subtitle, JSON.stringify(observation.facts), observation.narrative, JSON.stringify(observation.concepts), JSON.stringify(observation.files_read), JSON.stringify(observation.files_modified), promptNumber || null, discoveryTokens, contentHash, timestampIso, timestampEpoch);
    return {
        id: Number(result.lastInsertRowid),
        createdAtEpoch: timestampEpoch
    };
}
