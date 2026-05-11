"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTeamMemFile = void 0;
exports.isTeamMemorySearch = isTeamMemorySearch;
exports.isTeamMemoryWriteOrEdit = isTeamMemoryWriteOrEdit;
exports.appendTeamMemorySummaryParts = appendTeamMemorySummaryParts;
var teamMemPaths_js_1 = require("../memdir/teamMemPaths.js");
Object.defineProperty(exports, "isTeamMemFile", { enumerable: true, get: function () { return teamMemPaths_js_1.isTeamMemFile; } });
var constants_js_1 = require("../tools/FileEditTool/constants.js");
var prompt_js_1 = require("../tools/FileWriteTool/prompt.js");
/**
 * Check if a search tool use targets team memory files by examining its path.
 */
function isTeamMemorySearch(toolInput) {
    var input = toolInput;
    if (!input) {
        return false;
    }
    if (input.path && (0, teamMemPaths_js_1.isTeamMemFile)(input.path)) {
        return true;
    }
    return false;
}
/**
 * Check if a Write or Edit tool use targets a team memory file.
 */
function isTeamMemoryWriteOrEdit(toolName, toolInput) {
    var _a;
    if (toolName !== prompt_js_1.FILE_WRITE_TOOL_NAME && toolName !== constants_js_1.FILE_EDIT_TOOL_NAME) {
        return false;
    }
    var input = toolInput;
    var filePath = (_a = input === null || input === void 0 ? void 0 : input.file_path) !== null && _a !== void 0 ? _a : input === null || input === void 0 ? void 0 : input.path;
    return filePath !== undefined && (0, teamMemPaths_js_1.isTeamMemFile)(filePath);
}
/**
 * Append team memory summary parts to the parts array.
 * Encapsulates all team memory verb/string logic for getSearchReadSummaryText.
 */
function appendTeamMemorySummaryParts(memoryCounts, isActive, parts) {
    var _a, _b, _c;
    var teamReadCount = (_a = memoryCounts.teamMemoryReadCount) !== null && _a !== void 0 ? _a : 0;
    var teamSearchCount = (_b = memoryCounts.teamMemorySearchCount) !== null && _b !== void 0 ? _b : 0;
    var teamWriteCount = (_c = memoryCounts.teamMemoryWriteCount) !== null && _c !== void 0 ? _c : 0;
    if (teamReadCount > 0) {
        var verb = isActive
            ? parts.length === 0
                ? 'Recalling'
                : 'recalling'
            : parts.length === 0
                ? 'Recalled'
                : 'recalled';
        parts.push("".concat(verb, " ").concat(teamReadCount, " team ").concat(teamReadCount === 1 ? 'memory' : 'memories'));
    }
    if (teamSearchCount > 0) {
        var verb = isActive
            ? parts.length === 0
                ? 'Searching'
                : 'searching'
            : parts.length === 0
                ? 'Searched'
                : 'searched';
        parts.push("".concat(verb, " team memories"));
    }
    if (teamWriteCount > 0) {
        var verb = isActive
            ? parts.length === 0
                ? 'Writing'
                : 'writing'
            : parts.length === 0
                ? 'Wrote'
                : 'wrote';
        parts.push("".concat(verb, " ").concat(teamWriteCount, " team ").concat(teamWriteCount === 1 ? 'memory' : 'memories'));
    }
}
