"use strict";
/**
 * Shared timeline formatting utilities
 *
 * Pure formatting and grouping functions extracted from context-generator.ts
 * to be reused by SearchManager and other services.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseJsonArray = parseJsonArray;
exports.formatDateTime = formatDateTime;
exports.formatTime = formatTime;
exports.formatDate = formatDate;
exports.toRelativePath = toRelativePath;
exports.extractFirstFile = extractFirstFile;
exports.estimateTokens = estimateTokens;
exports.groupByDate = groupByDate;
var path_1 = require("path");
var logger_js_1 = require("../utils/logger.js");
/**
 * Parse JSON array string, returning empty array on failure
 */
function parseJsonArray(json) {
    if (!json)
        return [];
    try {
        var parsed = JSON.parse(json);
        return Array.isArray(parsed) ? parsed : [];
    }
    catch (err) {
        logger_js_1.logger.debug('PARSER', 'Failed to parse JSON array, using empty fallback', {
            preview: json === null || json === void 0 ? void 0 : json.substring(0, 50)
        }, err);
        return [];
    }
}
/**
 * Format date with time (e.g., "Dec 14, 7:30 PM")
 * Accepts either ISO date string or epoch milliseconds
 */
function formatDateTime(dateInput) {
    var date = new Date(dateInput);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}
/**
 * Format just time, no date (e.g., "7:30 PM")
 * Accepts either ISO date string or epoch milliseconds
 */
function formatTime(dateInput) {
    var date = new Date(dateInput);
    return date.toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}
/**
 * Format just date (e.g., "Dec 14, 2025")
 * Accepts either ISO date string or epoch milliseconds
 */
function formatDate(dateInput) {
    var date = new Date(dateInput);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}
/**
 * Convert absolute paths to relative paths
 */
function toRelativePath(filePath, cwd) {
    if (path_1.default.isAbsolute(filePath)) {
        return path_1.default.relative(cwd, filePath);
    }
    return filePath;
}
/**
 * Extract first relevant file from files_modified OR files_read JSON arrays.
 * Prefers files_modified, falls back to files_read.
 * Returns 'General' only if both are empty.
 */
function extractFirstFile(filesModified, cwd, filesRead) {
    // Try files_modified first
    var modified = parseJsonArray(filesModified);
    if (modified.length > 0) {
        return toRelativePath(modified[0], cwd);
    }
    // Fall back to files_read
    if (filesRead) {
        var read = parseJsonArray(filesRead);
        if (read.length > 0) {
            return toRelativePath(read[0], cwd);
        }
    }
    return 'General';
}
/**
 * Estimate token count for text (rough approximation: ~4 chars per token)
 */
function estimateTokens(text) {
    if (!text)
        return 0;
    return Math.ceil(text.length / 4);
}
/**
 * Group items by date
 *
 * Generic function that works with any item type that has a date field.
 * Returns a Map of date string -> items array, sorted chronologically.
 *
 * @param items - Array of items to group
 * @param getDate - Function to extract date string from each item
 * @returns Map of formatted date strings to item arrays, sorted chronologically
 */
function groupByDate(items, getDate) {
    // Group by day
    var itemsByDay = new Map();
    for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
        var item = items_1[_i];
        var itemDate = getDate(item);
        var day = formatDate(itemDate);
        if (!itemsByDay.has(day)) {
            itemsByDay.set(day, []);
        }
        itemsByDay.get(day).push(item);
    }
    // Sort days chronologically
    var sortedEntries = Array.from(itemsByDay.entries()).sort(function (a, b) {
        var aDate = new Date(a[0]).getTime();
        var bDate = new Date(b[0]).getTime();
        return aDate - bDate;
    });
    return new Map(sortedEntries);
}
