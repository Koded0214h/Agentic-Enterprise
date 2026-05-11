"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortLogs = sortLogs;
function sortLogs(logs) {
    return logs.sort(function (a, b) {
        // Sort by modified date (newest first)
        var modifiedDiff = b.modified.getTime() - a.modified.getTime();
        if (modifiedDiff !== 0) {
            return modifiedDiff;
        }
        // If modified dates are equal, sort by created date (newest first)
        return b.created.getTime() - a.created.getTime();
    });
}
