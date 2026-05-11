"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PendingMessageStore = void 0;
var logger_js_1 = require("../../utils/logger.js");
/** Messages processing longer than this are considered stale and reset to pending by self-healing */
var STALE_PROCESSING_THRESHOLD_MS = 60000;
/**
 * PendingMessageStore - Persistent work queue for SDK messages
 *
 * Messages are persisted before processing using a claim-confirm pattern.
 * This simplifies the lifecycle and eliminates duplicate processing bugs.
 *
 * Lifecycle:
 * 1. enqueue() - Message persisted with status 'pending'
 * 2. claimNextMessage() - Atomically claims next pending message (marks as 'processing')
 * 3. confirmProcessed() - Deletes message after successful processing
 *
 * Self-healing:
 * - claimNextMessage() resets stale 'processing' messages (>60s) back to 'pending' before claiming
 * - This eliminates stuck messages from generator crashes without external timers
 *
 * Recovery:
 * - getSessionsWithPendingMessages() - Find sessions that need recovery on startup
 */
var PendingMessageStore = /** @class */ (function () {
    function PendingMessageStore(db, maxRetries) {
        if (maxRetries === void 0) { maxRetries = 3; }
        this.db = db;
        this.maxRetries = maxRetries;
    }
    /**
     * Enqueue a new message (persist before processing)
     * @returns The database ID of the persisted message
     */
    PendingMessageStore.prototype.enqueue = function (sessionDbId, contentSessionId, message) {
        var now = Date.now();
        var stmt = this.db.prepare("\n      INSERT INTO pending_messages (\n        session_db_id, content_session_id, message_type,\n        tool_name, tool_input, tool_response, cwd,\n        last_assistant_message,\n        prompt_number, status, retry_count, created_at_epoch\n      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0, ?)\n    ");
        var result = stmt.run(sessionDbId, contentSessionId, message.type, message.tool_name || null, message.tool_input ? JSON.stringify(message.tool_input) : null, message.tool_response ? JSON.stringify(message.tool_response) : null, message.cwd || null, message.last_assistant_message || null, message.prompt_number || null, now);
        return result.lastInsertRowid;
    };
    /**
     * Atomically claim the next pending message by marking it as 'processing'.
     * Self-healing: resets any stale 'processing' messages (>60s) back to 'pending' first.
     * Message stays in DB until confirmProcessed() is called.
     * Uses a transaction to prevent race conditions.
     */
    PendingMessageStore.prototype.claimNextMessage = function (sessionDbId) {
        var _this = this;
        var claimTx = this.db.transaction(function (sessionId) {
            // Capture time inside transaction so it's fresh if WAL contention causes retry
            var now = Date.now();
            // Self-healing: reset stale 'processing' messages back to 'pending'
            // This recovers from generator crashes without external timers
            // Note: strict < means messages must be OLDER than threshold to be reset
            var staleCutoff = now - STALE_PROCESSING_THRESHOLD_MS;
            var resetStmt = _this.db.prepare("\n        UPDATE pending_messages\n        SET status = 'pending', started_processing_at_epoch = NULL\n        WHERE session_db_id = ? AND status = 'processing'\n          AND started_processing_at_epoch < ?\n      ");
            var resetResult = resetStmt.run(sessionId, staleCutoff);
            if (resetResult.changes > 0) {
                logger_js_1.logger.info('QUEUE', "SELF_HEAL | sessionDbId=".concat(sessionId, " | recovered ").concat(resetResult.changes, " stale processing message(s)"));
            }
            var peekStmt = _this.db.prepare("\n        SELECT * FROM pending_messages\n        WHERE session_db_id = ? AND status = 'pending'\n        ORDER BY id ASC\n        LIMIT 1\n      ");
            var msg = peekStmt.get(sessionId);
            if (msg) {
                // CRITICAL FIX: Mark as 'processing' instead of deleting
                // Message will be deleted by confirmProcessed() after successful store
                var updateStmt = _this.db.prepare("\n          UPDATE pending_messages\n          SET status = 'processing', started_processing_at_epoch = ?\n          WHERE id = ?\n        ");
                updateStmt.run(now, msg.id);
                // Log claim with minimal info (avoid logging full payload)
                logger_js_1.logger.info('QUEUE', "CLAIMED | sessionDbId=".concat(sessionId, " | messageId=").concat(msg.id, " | type=").concat(msg.message_type), {
                    sessionId: sessionId
                });
            }
            return msg;
        });
        return claimTx(sessionDbId);
    };
    /**
     * Confirm a message was successfully processed - DELETE it from the queue.
     * CRITICAL: Only call this AFTER the observation/summary has been stored to DB.
     * This prevents message loss on generator crash.
     */
    PendingMessageStore.prototype.confirmProcessed = function (messageId) {
        var stmt = this.db.prepare('DELETE FROM pending_messages WHERE id = ?');
        var result = stmt.run(messageId);
        if (result.changes > 0) {
            logger_js_1.logger.debug('QUEUE', "CONFIRMED | messageId=".concat(messageId, " | deleted from queue"));
        }
    };
    /**
     * Reset stale 'processing' messages back to 'pending' for retry.
     * Called on worker startup and periodically to recover from crashes.
     * @param thresholdMs Messages processing longer than this are considered stale (default: 5 minutes)
     * @returns Number of messages reset
     */
    PendingMessageStore.prototype.resetStaleProcessingMessages = function (thresholdMs, sessionDbId) {
        if (thresholdMs === void 0) { thresholdMs = 5 * 60 * 1000; }
        var cutoff = Date.now() - thresholdMs;
        var stmt;
        var result;
        if (sessionDbId !== undefined) {
            stmt = this.db.prepare("\n        UPDATE pending_messages\n        SET status = 'pending', started_processing_at_epoch = NULL\n        WHERE status = 'processing' AND started_processing_at_epoch < ? AND session_db_id = ?\n      ");
            result = stmt.run(cutoff, sessionDbId);
        }
        else {
            stmt = this.db.prepare("\n        UPDATE pending_messages\n        SET status = 'pending', started_processing_at_epoch = NULL\n        WHERE status = 'processing' AND started_processing_at_epoch < ?\n      ");
            result = stmt.run(cutoff);
        }
        if (result.changes > 0) {
            logger_js_1.logger.info('QUEUE', "RESET_STALE | count=".concat(result.changes, " | thresholdMs=").concat(thresholdMs).concat(sessionDbId !== undefined ? " | sessionDbId=".concat(sessionDbId) : ''));
        }
        return result.changes;
    };
    /**
     * Get all pending messages for session (ordered by creation time)
     */
    PendingMessageStore.prototype.getAllPending = function (sessionDbId) {
        var stmt = this.db.prepare("\n      SELECT * FROM pending_messages\n      WHERE session_db_id = ? AND status = 'pending'\n      ORDER BY id ASC\n    ");
        return stmt.all(sessionDbId);
    };
    /**
     * Get all queue messages (for UI display)
     * Returns pending, processing, and failed messages (not processed - they're deleted)
     * Joins with sdk_sessions to get project name
     */
    PendingMessageStore.prototype.getQueueMessages = function () {
        var stmt = this.db.prepare("\n      SELECT pm.*, ss.project\n      FROM pending_messages pm\n      LEFT JOIN sdk_sessions ss ON pm.content_session_id = ss.content_session_id\n      WHERE pm.status IN ('pending', 'processing', 'failed')\n      ORDER BY\n        CASE pm.status\n          WHEN 'failed' THEN 0\n          WHEN 'processing' THEN 1\n          WHEN 'pending' THEN 2\n        END,\n        pm.created_at_epoch ASC\n    ");
        return stmt.all();
    };
    /**
     * Get count of stuck messages (processing longer than threshold)
     */
    PendingMessageStore.prototype.getStuckCount = function (thresholdMs) {
        var cutoff = Date.now() - thresholdMs;
        var stmt = this.db.prepare("\n      SELECT COUNT(*) as count FROM pending_messages\n      WHERE status = 'processing' AND started_processing_at_epoch < ?\n    ");
        var result = stmt.get(cutoff);
        return result.count;
    };
    /**
     * Retry a specific message (reset to pending)
     * Works for pending (re-queue), processing (reset stuck), and failed messages
     */
    PendingMessageStore.prototype.retryMessage = function (messageId) {
        var stmt = this.db.prepare("\n      UPDATE pending_messages\n      SET status = 'pending', started_processing_at_epoch = NULL\n      WHERE id = ? AND status IN ('pending', 'processing', 'failed')\n    ");
        var result = stmt.run(messageId);
        return result.changes > 0;
    };
    /**
     * Reset all processing messages for a session to pending
     * Used when force-restarting a stuck session
     */
    PendingMessageStore.prototype.resetProcessingToPending = function (sessionDbId) {
        var stmt = this.db.prepare("\n      UPDATE pending_messages\n      SET status = 'pending', started_processing_at_epoch = NULL\n      WHERE session_db_id = ? AND status = 'processing'\n    ");
        var result = stmt.run(sessionDbId);
        return result.changes;
    };
    /**
     * Mark all processing messages for a session as failed
     * Used in error recovery when session generator crashes
     * @returns Number of messages marked failed
     */
    PendingMessageStore.prototype.markSessionMessagesFailed = function (sessionDbId) {
        var now = Date.now();
        // Atomic update - all processing messages for session → failed
        // Note: This bypasses retry logic since generator failures are session-level,
        // not message-level. Individual message failures use markFailed() instead.
        var stmt = this.db.prepare("\n      UPDATE pending_messages\n      SET status = 'failed', failed_at_epoch = ?\n      WHERE session_db_id = ? AND status = 'processing'\n    ");
        var result = stmt.run(now, sessionDbId);
        return result.changes;
    };
    /**
     * Mark all pending and processing messages for a session as failed (abandoned).
     * Used when SDK session is terminated and no fallback agent is available:
     * prevents the session from appearing in getSessionsWithPendingMessages forever.
     * @returns Number of messages marked failed
     */
    PendingMessageStore.prototype.markAllSessionMessagesAbandoned = function (sessionDbId) {
        var now = Date.now();
        var stmt = this.db.prepare("\n      UPDATE pending_messages\n      SET status = 'failed', failed_at_epoch = ?\n      WHERE session_db_id = ? AND status IN ('pending', 'processing')\n    ");
        var result = stmt.run(now, sessionDbId);
        return result.changes;
    };
    /**
     * Abort a specific message (delete from queue)
     */
    PendingMessageStore.prototype.abortMessage = function (messageId) {
        var stmt = this.db.prepare('DELETE FROM pending_messages WHERE id = ?');
        var result = stmt.run(messageId);
        return result.changes > 0;
    };
    /**
     * Retry all stuck messages at once
     */
    PendingMessageStore.prototype.retryAllStuck = function (thresholdMs) {
        var cutoff = Date.now() - thresholdMs;
        var stmt = this.db.prepare("\n      UPDATE pending_messages\n      SET status = 'pending', started_processing_at_epoch = NULL\n      WHERE status = 'processing' AND started_processing_at_epoch < ?\n    ");
        var result = stmt.run(cutoff);
        return result.changes;
    };
    /**
     * Get recently processed messages (for UI feedback)
     * Shows messages completed in the last N minutes so users can see their stuck items were processed
     */
    PendingMessageStore.prototype.getRecentlyProcessed = function (limit, withinMinutes) {
        if (limit === void 0) { limit = 10; }
        if (withinMinutes === void 0) { withinMinutes = 30; }
        var cutoff = Date.now() - (withinMinutes * 60 * 1000);
        var stmt = this.db.prepare("\n      SELECT pm.*, ss.project\n      FROM pending_messages pm\n      LEFT JOIN sdk_sessions ss ON pm.content_session_id = ss.content_session_id\n      WHERE pm.status = 'processed' AND pm.completed_at_epoch > ?\n      ORDER BY pm.completed_at_epoch DESC\n      LIMIT ?\n    ");
        return stmt.all(cutoff, limit);
    };
    /**
     * Mark message as failed (status: pending -> failed or back to pending for retry)
     * If retry_count < maxRetries, moves back to 'pending' for retry
     * Otherwise marks as 'failed' permanently
     */
    PendingMessageStore.prototype.markFailed = function (messageId) {
        var now = Date.now();
        // Get current retry count
        var msg = this.db.prepare('SELECT retry_count FROM pending_messages WHERE id = ?').get(messageId);
        if (!msg)
            return;
        if (msg.retry_count < this.maxRetries) {
            // Move back to pending for retry
            var stmt = this.db.prepare("\n        UPDATE pending_messages\n        SET status = 'pending', retry_count = retry_count + 1, started_processing_at_epoch = NULL\n        WHERE id = ?\n      ");
            stmt.run(messageId);
        }
        else {
            // Max retries exceeded, mark as permanently failed
            var stmt = this.db.prepare("\n        UPDATE pending_messages\n        SET status = 'failed', completed_at_epoch = ?\n        WHERE id = ?\n      ");
            stmt.run(now, messageId);
        }
    };
    /**
     * Reset stuck messages (processing -> pending if stuck longer than threshold)
     * @param thresholdMs Messages processing longer than this are considered stuck (0 = reset all)
     * @returns Number of messages reset
     */
    PendingMessageStore.prototype.resetStuckMessages = function (thresholdMs) {
        var cutoff = thresholdMs === 0 ? Date.now() : Date.now() - thresholdMs;
        var stmt = this.db.prepare("\n      UPDATE pending_messages\n      SET status = 'pending', started_processing_at_epoch = NULL\n      WHERE status = 'processing' AND started_processing_at_epoch < ?\n    ");
        var result = stmt.run(cutoff);
        return result.changes;
    };
    /**
     * Get count of pending messages for a session
     */
    PendingMessageStore.prototype.getPendingCount = function (sessionDbId) {
        var stmt = this.db.prepare("\n      SELECT COUNT(*) as count FROM pending_messages\n      WHERE session_db_id = ? AND status IN ('pending', 'processing')\n    ");
        var result = stmt.get(sessionDbId);
        return result.count;
    };
    /**
     * Check if any session has pending work.
     * Excludes 'processing' messages stuck for >5 minutes (resets them to 'pending' as a side effect).
     */
    PendingMessageStore.prototype.hasAnyPendingWork = function () {
        // Reset stuck 'processing' messages older than 5 minutes before checking
        var stuckCutoff = Date.now() - (5 * 60 * 1000);
        var resetStmt = this.db.prepare("\n      UPDATE pending_messages\n      SET status = 'pending', started_processing_at_epoch = NULL\n      WHERE status = 'processing' AND started_processing_at_epoch < ?\n    ");
        var resetResult = resetStmt.run(stuckCutoff);
        if (resetResult.changes > 0) {
            logger_js_1.logger.info('QUEUE', "STUCK_RESET | hasAnyPendingWork reset ".concat(resetResult.changes, " stuck processing message(s) older than 5 minutes"));
        }
        var stmt = this.db.prepare("\n      SELECT COUNT(*) as count FROM pending_messages\n      WHERE status IN ('pending', 'processing')\n    ");
        var result = stmt.get();
        return result.count > 0;
    };
    /**
     * Get all session IDs that have pending messages (for recovery on startup)
     */
    PendingMessageStore.prototype.getSessionsWithPendingMessages = function () {
        var stmt = this.db.prepare("\n      SELECT DISTINCT session_db_id FROM pending_messages\n      WHERE status IN ('pending', 'processing')\n    ");
        var results = stmt.all();
        return results.map(function (r) { return r.session_db_id; });
    };
    /**
     * Get session info for a pending message (for recovery)
     */
    PendingMessageStore.prototype.getSessionInfoForMessage = function (messageId) {
        var stmt = this.db.prepare("\n      SELECT session_db_id, content_session_id FROM pending_messages WHERE id = ?\n    ");
        var result = stmt.get(messageId);
        return result ? { sessionDbId: result.session_db_id, contentSessionId: result.content_session_id } : null;
    };
    /**
     * Clear all failed messages from the queue
     * @returns Number of messages deleted
     */
    PendingMessageStore.prototype.clearFailed = function () {
        var stmt = this.db.prepare("\n      DELETE FROM pending_messages\n      WHERE status = 'failed'\n    ");
        var result = stmt.run();
        return result.changes;
    };
    /**
     * Clear all pending, processing, and failed messages from the queue
     * Keeps only processed messages (for history)
     * @returns Number of messages deleted
     */
    PendingMessageStore.prototype.clearAll = function () {
        var stmt = this.db.prepare("\n      DELETE FROM pending_messages\n      WHERE status IN ('pending', 'processing', 'failed')\n    ");
        var result = stmt.run();
        return result.changes;
    };
    /**
     * Convert a PersistentPendingMessage back to PendingMessage format
     */
    PendingMessageStore.prototype.toPendingMessage = function (persistent) {
        return {
            type: persistent.message_type,
            tool_name: persistent.tool_name || undefined,
            tool_input: persistent.tool_input ? JSON.parse(persistent.tool_input) : undefined,
            tool_response: persistent.tool_response ? JSON.parse(persistent.tool_response) : undefined,
            prompt_number: persistent.prompt_number || undefined,
            cwd: persistent.cwd || undefined,
            last_assistant_message: persistent.last_assistant_message || undefined
        };
    };
    return PendingMessageStore;
}());
exports.PendingMessageStore = PendingMessageStore;
