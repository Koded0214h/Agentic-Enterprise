#!/usr/bin/env node
"use strict";
/**
 * Cleanup duplicate observations and summaries from the database
 * Keeps the earliest entry (MIN(id)) for each duplicate group
 */
Object.defineProperty(exports, "__esModule", { value: true });
var SessionStore_js_1 = require("../services/sqlite/SessionStore.js");
function main() {
    console.log('Starting duplicate cleanup...\n');
    var db = new SessionStore_js_1.SessionStore();
    // Find and delete duplicate observations
    console.log('Finding duplicate observations...');
    var duplicateObsQuery = db['db'].prepare("\n    SELECT memory_session_id, title, subtitle, type, COUNT(*) as count, GROUP_CONCAT(id) as ids\n    FROM observations\n    GROUP BY memory_session_id, title, subtitle, type\n    HAVING count > 1\n  ");
    var duplicateObs = duplicateObsQuery.all();
    console.log("Found ".concat(duplicateObs.length, " duplicate observation groups\n"));
    var deletedObs = 0;
    var _loop_1 = function (dup) {
        var ids = dup.ids.split(',').map(function (id) { return parseInt(id, 10); });
        var keepId = Math.min.apply(Math, ids);
        var deleteIds = ids.filter(function (id) { return id !== keepId; });
        console.log("Observation \"".concat(dup.title.substring(0, 60), "...\""));
        console.log("  Found ".concat(dup.count, " copies, keeping ID ").concat(keepId, ", deleting ").concat(deleteIds.length, " duplicates"));
        var deleteStmt = db['db'].prepare("DELETE FROM observations WHERE id IN (".concat(deleteIds.join(','), ")"));
        deleteStmt.run();
        deletedObs += deleteIds.length;
    };
    for (var _i = 0, duplicateObs_1 = duplicateObs; _i < duplicateObs_1.length; _i++) {
        var dup = duplicateObs_1[_i];
        _loop_1(dup);
    }
    // Find and delete duplicate summaries
    console.log('\n\nFinding duplicate summaries...');
    var duplicateSumQuery = db['db'].prepare("\n    SELECT memory_session_id, request, completed, learned, COUNT(*) as count, GROUP_CONCAT(id) as ids\n    FROM session_summaries\n    GROUP BY memory_session_id, request, completed, learned\n    HAVING count > 1\n  ");
    var duplicateSum = duplicateSumQuery.all();
    console.log("Found ".concat(duplicateSum.length, " duplicate summary groups\n"));
    var deletedSum = 0;
    var _loop_2 = function (dup) {
        var ids = dup.ids.split(',').map(function (id) { return parseInt(id, 10); });
        var keepId = Math.min.apply(Math, ids);
        var deleteIds = ids.filter(function (id) { return id !== keepId; });
        console.log("Summary \"".concat(dup.request.substring(0, 60), "...\""));
        console.log("  Found ".concat(dup.count, " copies, keeping ID ").concat(keepId, ", deleting ").concat(deleteIds.length, " duplicates"));
        var deleteStmt = db['db'].prepare("DELETE FROM session_summaries WHERE id IN (".concat(deleteIds.join(','), ")"));
        deleteStmt.run();
        deletedSum += deleteIds.length;
    };
    for (var _a = 0, duplicateSum_1 = duplicateSum; _a < duplicateSum_1.length; _a++) {
        var dup = duplicateSum_1[_a];
        _loop_2(dup);
    }
    db.close();
    console.log('\n' + '='.repeat(60));
    console.log('Cleanup Complete!');
    console.log('='.repeat(60));
    console.log("\uD83D\uDDD1\uFE0F  Deleted: ".concat(deletedObs, " duplicate observations"));
    console.log("\uD83D\uDDD1\uFE0F  Deleted: ".concat(deletedSum, " duplicate summaries"));
    console.log("\uD83D\uDDD1\uFE0F  Total: ".concat(deletedObs + deletedSum, " duplicates removed"));
    console.log('='.repeat(60));
}
// Run if executed directly
if (import.meta.url === "file://".concat(process.argv[1])) {
    main();
}
