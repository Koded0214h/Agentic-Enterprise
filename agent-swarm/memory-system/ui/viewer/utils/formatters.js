"use strict";
/**
 * Formatting utility functions
 * Used across UI components for consistent display
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDate = formatDate;
exports.formatUptime = formatUptime;
exports.formatBytes = formatBytes;
/**
 * Format epoch timestamp to locale string
 * @param epoch - Timestamp in milliseconds since epoch
 * @returns Formatted date string
 */
function formatDate(epoch) {
    return new Date(epoch).toLocaleString();
}
/**
 * Format seconds into hours and minutes
 * @param seconds - Uptime in seconds
 * @returns Formatted string like "12h 34m" or "-" if no value
 */
function formatUptime(seconds) {
    if (!seconds)
        return '-';
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    return "".concat(hours, "h ").concat(minutes, "m");
}
/**
 * Format bytes into human-readable size
 * @param bytes - Size in bytes
 * @returns Formatted string like "1.5 MB" or "-" if no value
 */
function formatBytes(bytes) {
    if (!bytes)
        return '-';
    if (bytes < 1024)
        return bytes + ' B';
    if (bytes < 1024 * 1024)
        return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
