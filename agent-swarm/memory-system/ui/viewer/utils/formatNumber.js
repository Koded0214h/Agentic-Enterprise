"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatStarCount = formatStarCount;
/**
 * Formats a number into compact notation with k/M suffixes
 * Examples:
 *   999 → "999"
 *   1234 → "1.2k"
 *   45678 → "45.7k"
 *   1234567 → "1.2M"
 */
function formatStarCount(count) {
    if (count < 1000) {
        return count.toString();
    }
    if (count < 1000000) {
        // Format as k (thousands)
        var thousands = count / 1000;
        return "".concat(thousands.toFixed(1), "k");
    }
    // Format as M (millions)
    var millions = count / 1000000;
    return "".concat(millions.toFixed(1), "M");
}
