"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TIMING = void 0;
/**
 * Timing constants in milliseconds
 * All timeout and interval durations used throughout the UI
 */
exports.TIMING = {
    /** SSE reconnection delay after connection error */
    SSE_RECONNECT_DELAY_MS: 3000,
    /** Stats refresh interval for worker status polling */
    STATS_REFRESH_INTERVAL_MS: 10000,
    /** Duration to display save status message before clearing */
    SAVE_STATUS_DISPLAY_DURATION_MS: 3000,
};
