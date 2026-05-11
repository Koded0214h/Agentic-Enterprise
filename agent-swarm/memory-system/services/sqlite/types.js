"use strict";
/**
 * Database entity types for SQLite storage
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeTimestamp = normalizeTimestamp;
/**
 * Helper function to normalize timestamps from various formats
 */
function normalizeTimestamp(timestamp) {
    var date;
    if (!timestamp) {
        date = new Date();
    }
    else if (timestamp instanceof Date) {
        date = timestamp;
    }
    else if (typeof timestamp === 'number') {
        date = new Date(timestamp);
    }
    else if (typeof timestamp === 'string') {
        // Handle empty strings
        if (!timestamp.trim()) {
            date = new Date();
        }
        else {
            date = new Date(timestamp);
            // If invalid date, try to parse it differently
            if (isNaN(date.getTime())) {
                // Try common formats
                var cleaned = timestamp.replace(/\s+/g, 'T').replace(/T+/g, 'T');
                date = new Date(cleaned);
                // Still invalid? Use current time
                if (isNaN(date.getTime())) {
                    date = new Date();
                }
            }
        }
    }
    else {
        date = new Date();
    }
    return {
        isoString: date.toISOString(),
        epoch: date.getTime()
    };
}
