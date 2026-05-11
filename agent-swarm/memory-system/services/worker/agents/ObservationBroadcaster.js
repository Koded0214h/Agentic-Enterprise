"use strict";
/**
 * ObservationBroadcaster: SSE broadcasting for observations and summaries
 *
 * Responsibility:
 * - Broadcast new observations to SSE clients
 * - Broadcast new summaries to SSE clients
 * - Handle worker reference safely (null checks)
 *
 * BUGFIX: This module fixes the incorrect field names in SDKAgent:
 * - SDKAgent used `obs.files` which doesn't exist - should be `obs.files_read`
 * - SDKAgent used hardcoded `files_modified: JSON.stringify([])` - should use `obs.files_modified`
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.broadcastObservation = broadcastObservation;
exports.broadcastSummary = broadcastSummary;
/**
 * Broadcast a new observation to SSE clients
 *
 * @param worker - Worker reference with SSE broadcaster (can be undefined)
 * @param payload - Observation data to broadcast
 */
function broadcastObservation(worker, payload) {
    if (!(worker === null || worker === void 0 ? void 0 : worker.sseBroadcaster)) {
        return;
    }
    worker.sseBroadcaster.broadcast({
        type: 'new_observation',
        observation: payload
    });
}
/**
 * Broadcast a new summary to SSE clients
 *
 * @param worker - Worker reference with SSE broadcaster (can be undefined)
 * @param payload - Summary data to broadcast
 */
function broadcastSummary(worker, payload) {
    if (!(worker === null || worker === void 0 ? void 0 : worker.sseBroadcaster)) {
        return;
    }
    worker.sseBroadcaster.broadcast({
        type: 'new_summary',
        summary: payload
    });
}
