"use strict";
/**
 * SessionCleanupHelper: Session state cleanup after response processing
 *
 * Responsibility:
 * - Reset earliest pending timestamp
 * - Broadcast processing status updates
 *
 * NOTE: With claim-and-delete queue pattern, messages are deleted on claim,
 * so there's no pendingProcessingIds tracking or processed message cleanup.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupProcessedMessages = cleanupProcessedMessages;
/**
 * Clean up session state after response processing
 *
 * With claim-and-delete queue pattern, this function simply:
 * 1. Resets the earliest pending timestamp
 * 2. Broadcasts updated processing status to SSE clients
 *
 * @param session - Active session to clean up
 * @param worker - Worker reference for status broadcasting (optional)
 */
function cleanupProcessedMessages(session, worker) {
    // Reset earliest pending timestamp for next batch
    session.earliestPendingTimestamp = null;
    // Broadcast activity status after processing (queue may have changed)
    if (worker && typeof worker.broadcastProcessingStatus === 'function') {
        worker.broadcastProcessingStatus();
    }
}
