"use strict";
/**
 * Session Event Broadcaster
 *
 * Provides semantic broadcast methods for session lifecycle events.
 * Consolidates SSE broadcasting and processing status updates.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionEventBroadcaster = void 0;
var SessionEventBroadcaster = /** @class */ (function () {
    function SessionEventBroadcaster(sseBroadcaster, workerService) {
        this.sseBroadcaster = sseBroadcaster;
        this.workerService = workerService;
    }
    /**
     * Broadcast new user prompt arrival
     * Starts activity indicator to show work is beginning
     */
    SessionEventBroadcaster.prototype.broadcastNewPrompt = function (prompt) {
        // Broadcast prompt details
        this.sseBroadcaster.broadcast({
            type: 'new_prompt',
            prompt: prompt
        });
        // Update processing status based on queue depth
        this.workerService.broadcastProcessingStatus();
    };
    /**
     * Broadcast session initialization
     */
    SessionEventBroadcaster.prototype.broadcastSessionStarted = function (sessionDbId, project) {
        this.sseBroadcaster.broadcast({
            type: 'session_started',
            sessionDbId: sessionDbId,
            project: project
        });
        // Update processing status
        this.workerService.broadcastProcessingStatus();
    };
    /**
     * Broadcast observation queued
     * Updates processing status to reflect new queue depth
     */
    SessionEventBroadcaster.prototype.broadcastObservationQueued = function (sessionDbId) {
        this.sseBroadcaster.broadcast({
            type: 'observation_queued',
            sessionDbId: sessionDbId
        });
        // Update processing status (queue depth changed)
        this.workerService.broadcastProcessingStatus();
    };
    /**
     * Broadcast session completion
     * Updates processing status to reflect session removal
     */
    SessionEventBroadcaster.prototype.broadcastSessionCompleted = function (sessionDbId) {
        this.sseBroadcaster.broadcast({
            type: 'session_completed',
            timestamp: Date.now(),
            sessionDbId: sessionDbId
        });
        // Update processing status (session removed from queue)
        this.workerService.broadcastProcessingStatus();
    };
    /**
     * Broadcast summarize request queued
     * Updates processing status to reflect new queue depth
     */
    SessionEventBroadcaster.prototype.broadcastSummarizeQueued = function () {
        // Update processing status (queue depth changed)
        this.workerService.broadcastProcessingStatus();
    };
    return SessionEventBroadcaster;
}());
exports.SessionEventBroadcaster = SessionEventBroadcaster;
