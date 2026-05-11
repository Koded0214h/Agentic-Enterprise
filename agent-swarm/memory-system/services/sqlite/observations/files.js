"use strict";
/**
 * Session file retrieval functions
 * Extracted from SessionStore.ts for modular organization
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilesForSession = getFilesForSession;
/**
 * Get aggregated files from all observations for a session
 */
function getFilesForSession(db, memorySessionId) {
    var stmt = db.prepare("\n    SELECT files_read, files_modified\n    FROM observations\n    WHERE memory_session_id = ?\n  ");
    var rows = stmt.all(memorySessionId);
    var filesReadSet = new Set();
    var filesModifiedSet = new Set();
    for (var _i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
        var row = rows_1[_i];
        // Parse files_read
        if (row.files_read) {
            var files = JSON.parse(row.files_read);
            if (Array.isArray(files)) {
                files.forEach(function (f) { return filesReadSet.add(f); });
            }
        }
        // Parse files_modified
        if (row.files_modified) {
            var files = JSON.parse(row.files_modified);
            if (Array.isArray(files)) {
                files.forEach(function (f) { return filesModifiedSet.add(f); });
            }
        }
    }
    return {
        filesRead: Array.from(filesReadSet),
        filesModified: Array.from(filesModifiedSet)
    };
}
