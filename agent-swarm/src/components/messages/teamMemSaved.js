"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teamMemSavedPart = teamMemSavedPart;
/**
 * Returns the team-memory segment for the memory-saved UI, plus the count so
 * the caller can derive the private count without accessing teamCount itself.
 * Plain function (not a React component) so the React Compiler won't hoist
 * the teamCount property access for memoization. This module is only loaded
 * when feature('TEAMMEM') is true.
 */
function teamMemSavedPart(message) {
    var _a;
    var count = (_a = message.teamCount) !== null && _a !== void 0 ? _a : 0;
    if (count === 0)
        return null;
    return {
        segment: "".concat(count, " team ").concat(count === 1 ? 'memory' : 'memories'),
        count: count,
    };
}
