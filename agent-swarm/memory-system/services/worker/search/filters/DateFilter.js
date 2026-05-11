"use strict";
/**
 * DateFilter - Date range filtering for search results
 *
 * Provides utilities for filtering search results by date range.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDateRange = parseDateRange;
exports.isWithinDateRange = isWithinDateRange;
exports.isRecent = isRecent;
exports.filterResultsByDate = filterResultsByDate;
exports.getDateBoundaries = getDateBoundaries;
var types_js_1 = require("../types.js");
/**
 * Parse date range values to epoch milliseconds
 */
function parseDateRange(dateRange) {
    if (!dateRange) {
        return {};
    }
    var result = {};
    if (dateRange.start) {
        result.startEpoch = typeof dateRange.start === 'number'
            ? dateRange.start
            : new Date(dateRange.start).getTime();
    }
    if (dateRange.end) {
        result.endEpoch = typeof dateRange.end === 'number'
            ? dateRange.end
            : new Date(dateRange.end).getTime();
    }
    return result;
}
/**
 * Check if an epoch timestamp is within a date range
 */
function isWithinDateRange(epoch, dateRange) {
    if (!dateRange) {
        return true;
    }
    var _a = parseDateRange(dateRange), startEpoch = _a.startEpoch, endEpoch = _a.endEpoch;
    if (startEpoch && epoch < startEpoch) {
        return false;
    }
    if (endEpoch && epoch > endEpoch) {
        return false;
    }
    return true;
}
/**
 * Check if an epoch timestamp is within the recency window
 */
function isRecent(epoch) {
    var cutoff = Date.now() - types_js_1.SEARCH_CONSTANTS.RECENCY_WINDOW_MS;
    return epoch > cutoff;
}
/**
 * Filter combined results by date range
 */
function filterResultsByDate(results, dateRange) {
    if (!dateRange) {
        return results;
    }
    return results.filter(function (result) { return isWithinDateRange(result.epoch, dateRange); });
}
/**
 * Get date boundaries for common ranges
 */
function getDateBoundaries(range) {
    var now = Date.now();
    var startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    switch (range) {
        case 'today':
            return { start: startOfToday.getTime() };
        case 'week':
            return { start: now - 7 * 24 * 60 * 60 * 1000 };
        case 'month':
            return { start: now - 30 * 24 * 60 * 60 * 1000 };
        case '90days':
            return { start: now - types_js_1.SEARCH_CONSTANTS.RECENCY_WINDOW_MS };
    }
}
