"use strict";
/**
 * Data manipulation utility functions
 * Used for merging and deduplicating real-time and paginated data
 */
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeAndDeduplicateByProject = mergeAndDeduplicateByProject;
/**
 * Merge real-time SSE items with paginated items, removing duplicates by ID
 * Callers should pre-filter liveItems by project when a filter is active.
 *
 * @param liveItems - Items from SSE stream (pre-filtered if needed)
 * @param paginatedItems - Items from pagination API
 * @returns Merged and deduplicated array
 */
function mergeAndDeduplicateByProject(liveItems, paginatedItems) {
    // Deduplicate by ID
    var seen = new Set();
    return __spreadArray(__spreadArray([], liveItems, true), paginatedItems, true).filter(function (item) {
        if (seen.has(item.id))
            return false;
        seen.add(item.id);
        return true;
    });
}
