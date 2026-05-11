"use strict";
/**
 * Cross-boundary database transactions
 *
 * This module contains atomic transactions that span multiple domains
 * (observations, summaries, pending messages). These functions ensure
 * data consistency across domain boundaries.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeObservationsAndMarkComplete = storeObservationsAndMarkComplete;
exports.storeObservations = storeObservations;
var store_js_1 = require("./observations/store.js");
/**
 * ATOMIC: Store observations + summary + mark pending message as processed
 *
 * This function wraps observation storage, summary storage, and message completion
 * in a single database transaction to prevent race conditions. If the worker crashes
 * during processing, either all operations succeed together or all fail together.
 *
 * This fixes the observation duplication bug where observations were stored but
 * the message wasn't marked complete, causing reprocessing on crash recovery.
 *
 * @param db - Database instance
 * @param memorySessionId - SDK memory session ID
 * @param project - Project name
 * @param observations - Array of observations to store (can be empty)
 * @param summary - Optional summary to store
 * @param messageId - Pending message ID to mark as processed
 * @param promptNumber - Optional prompt number
 * @param discoveryTokens - Discovery tokens count
 * @param overrideTimestampEpoch - Optional override timestamp
 * @returns Object with observation IDs, optional summary ID, and timestamp
 */
function storeObservationsAndMarkComplete(db, memorySessionId, project, observations, summary, messageId, promptNumber, discoveryTokens, overrideTimestampEpoch) {
    if (discoveryTokens === void 0) { discoveryTokens = 0; }
    // Use override timestamp if provided
    var timestampEpoch = overrideTimestampEpoch !== null && overrideTimestampEpoch !== void 0 ? overrideTimestampEpoch : Date.now();
    var timestampIso = new Date(timestampEpoch).toISOString();
    // Create transaction that wraps all operations
    var storeAndMarkTx = db.transaction(function () {
        var observationIds = [];
        // 1. Store all observations (with content-hash deduplication)
        var obsStmt = db.prepare("\n      INSERT INTO observations\n      (memory_session_id, project, type, title, subtitle, facts, narrative, concepts,\n       files_read, files_modified, prompt_number, discovery_tokens, content_hash, created_at, created_at_epoch)\n      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\n    ");
        for (var _i = 0, observations_1 = observations; _i < observations_1.length; _i++) {
            var observation = observations_1[_i];
            var contentHash = (0, store_js_1.computeObservationContentHash)(memorySessionId, observation.title, observation.narrative);
            var existing = (0, store_js_1.findDuplicateObservation)(db, contentHash, timestampEpoch);
            if (existing) {
                observationIds.push(existing.id);
                continue;
            }
            var result = obsStmt.run(memorySessionId, project, observation.type, observation.title, observation.subtitle, JSON.stringify(observation.facts), observation.narrative, JSON.stringify(observation.concepts), JSON.stringify(observation.files_read), JSON.stringify(observation.files_modified), promptNumber || null, discoveryTokens, contentHash, timestampIso, timestampEpoch);
            observationIds.push(Number(result.lastInsertRowid));
        }
        // 2. Store summary if provided
        var summaryId = null;
        if (summary) {
            var summaryStmt = db.prepare("\n        INSERT INTO session_summaries\n        (memory_session_id, project, request, investigated, learned, completed,\n         next_steps, notes, prompt_number, discovery_tokens, created_at, created_at_epoch)\n        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\n      ");
            var result = summaryStmt.run(memorySessionId, project, summary.request, summary.investigated, summary.learned, summary.completed, summary.next_steps, summary.notes, promptNumber || null, discoveryTokens, timestampIso, timestampEpoch);
            summaryId = Number(result.lastInsertRowid);
        }
        // 3. Mark pending message as processed
        // This UPDATE is part of the same transaction, so if it fails,
        // observations and summary will be rolled back
        var updateStmt = db.prepare("\n      UPDATE pending_messages\n      SET\n        status = 'processed',\n        completed_at_epoch = ?,\n        tool_input = NULL,\n        tool_response = NULL\n      WHERE id = ? AND status = 'processing'\n    ");
        updateStmt.run(timestampEpoch, messageId);
        return { observationIds: observationIds, summaryId: summaryId, createdAtEpoch: timestampEpoch };
    });
    // Execute the transaction and return results
    return storeAndMarkTx();
}
/**
 * ATOMIC: Store observations + summary (no message tracking)
 *
 * Simplified version for use with claim-and-delete queue pattern.
 * Messages are deleted from queue immediately on claim, so there's no
 * message completion to track. This just stores observations and summary.
 *
 * @param db - Database instance
 * @param memorySessionId - SDK memory session ID
 * @param project - Project name
 * @param observations - Array of observations to store (can be empty)
 * @param summary - Optional summary to store
 * @param promptNumber - Optional prompt number
 * @param discoveryTokens - Discovery tokens count
 * @param overrideTimestampEpoch - Optional override timestamp
 * @returns Object with observation IDs, optional summary ID, and timestamp
 */
function storeObservations(db, memorySessionId, project, observations, summary, promptNumber, discoveryTokens, overrideTimestampEpoch) {
    if (discoveryTokens === void 0) { discoveryTokens = 0; }
    // Use override timestamp if provided
    var timestampEpoch = overrideTimestampEpoch !== null && overrideTimestampEpoch !== void 0 ? overrideTimestampEpoch : Date.now();
    var timestampIso = new Date(timestampEpoch).toISOString();
    // Create transaction that wraps all operations
    var storeTx = db.transaction(function () {
        var observationIds = [];
        // 1. Store all observations (with content-hash deduplication)
        var obsStmt = db.prepare("\n      INSERT INTO observations\n      (memory_session_id, project, type, title, subtitle, facts, narrative, concepts,\n       files_read, files_modified, prompt_number, discovery_tokens, content_hash, created_at, created_at_epoch)\n      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\n    ");
        for (var _i = 0, observations_2 = observations; _i < observations_2.length; _i++) {
            var observation = observations_2[_i];
            var contentHash = (0, store_js_1.computeObservationContentHash)(memorySessionId, observation.title, observation.narrative);
            var existing = (0, store_js_1.findDuplicateObservation)(db, contentHash, timestampEpoch);
            if (existing) {
                observationIds.push(existing.id);
                continue;
            }
            var result = obsStmt.run(memorySessionId, project, observation.type, observation.title, observation.subtitle, JSON.stringify(observation.facts), observation.narrative, JSON.stringify(observation.concepts), JSON.stringify(observation.files_read), JSON.stringify(observation.files_modified), promptNumber || null, discoveryTokens, contentHash, timestampIso, timestampEpoch);
            observationIds.push(Number(result.lastInsertRowid));
        }
        // 2. Store summary if provided
        var summaryId = null;
        if (summary) {
            var summaryStmt = db.prepare("\n        INSERT INTO session_summaries\n        (memory_session_id, project, request, investigated, learned, completed,\n         next_steps, notes, prompt_number, discovery_tokens, created_at, created_at_epoch)\n        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)\n      ");
            var result = summaryStmt.run(memorySessionId, project, summary.request, summary.investigated, summary.learned, summary.completed, summary.next_steps, summary.notes, promptNumber || null, discoveryTokens, timestampIso, timestampEpoch);
            summaryId = Number(result.lastInsertRowid);
        }
        return { observationIds: observationIds, summaryId: summaryId, createdAtEpoch: timestampEpoch };
    });
    // Execute the transaction and return results
    return storeTx();
}
