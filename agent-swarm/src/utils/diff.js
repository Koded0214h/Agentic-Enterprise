"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DIFF_TIMEOUT_MS = exports.CONTEXT_LINES = void 0;
exports.adjustHunkLineNumbers = adjustHunkLineNumbers;
exports.countLinesChanged = countLinesChanged;
exports.getPatchFromContents = getPatchFromContents;
exports.getPatchForDisplay = getPatchForDisplay;
var diff_1 = require("diff");
var index_js_1 = require("src/services/analytics/index.js");
var state_js_1 = require("../bootstrap/state.js");
var cost_tracker_js_1 = require("../cost-tracker.js");
var array_js_1 = require("./array.js");
var file_js_1 = require("./file.js");
exports.CONTEXT_LINES = 3;
exports.DIFF_TIMEOUT_MS = 5000;
/**
 * Shifts hunk line numbers by offset. Use when getPatchForDisplay received
 * a slice of the file (e.g. readEditContext) rather than the whole file —
 * callers pass `ctx.lineOffset - 1` to convert slice-relative to file-relative.
 */
function adjustHunkLineNumbers(hunks, offset) {
    if (offset === 0)
        return hunks;
    return hunks.map(function (h) { return (__assign(__assign({}, h), { oldStart: h.oldStart + offset, newStart: h.newStart + offset })); });
}
// For some reason, & confuses the diff library, so we replace it with a token,
// then substitute it back in after the diff is computed.
var AMPERSAND_TOKEN = '<<:AMPERSAND_TOKEN:>>';
var DOLLAR_TOKEN = '<<:DOLLAR_TOKEN:>>';
function escapeForDiff(s) {
    return s.replaceAll('&', AMPERSAND_TOKEN).replaceAll('$', DOLLAR_TOKEN);
}
function unescapeFromDiff(s) {
    return s.replaceAll(AMPERSAND_TOKEN, '&').replaceAll(DOLLAR_TOKEN, '$');
}
/**
 * Count lines added and removed in a patch and update the total
 * For new files, pass the content string as the second parameter
 * @param patch Array of diff hunks
 * @param newFileContent Optional content string for new files
 */
function countLinesChanged(patch, newFileContent) {
    var _a, _b;
    var numAdditions = 0;
    var numRemovals = 0;
    if (patch.length === 0 && newFileContent) {
        // For new files, count all lines as additions
        numAdditions = newFileContent.split(/\r?\n/).length;
    }
    else {
        numAdditions = patch.reduce(function (acc, hunk) { return acc + (0, array_js_1.count)(hunk.lines, function (_) { return _.startsWith('+'); }); }, 0);
        numRemovals = patch.reduce(function (acc, hunk) { return acc + (0, array_js_1.count)(hunk.lines, function (_) { return _.startsWith('-'); }); }, 0);
    }
    (0, cost_tracker_js_1.addToTotalLinesChanged)(numAdditions, numRemovals);
    (_a = (0, state_js_1.getLocCounter)()) === null || _a === void 0 ? void 0 : _a.add(numAdditions, { type: 'added' });
    (_b = (0, state_js_1.getLocCounter)()) === null || _b === void 0 ? void 0 : _b.add(numRemovals, { type: 'removed' });
    (0, index_js_1.logEvent)('tengu_file_changed', {
        lines_added: numAdditions,
        lines_removed: numRemovals,
    });
}
function getPatchFromContents(_a) {
    var filePath = _a.filePath, oldContent = _a.oldContent, newContent = _a.newContent, _b = _a.ignoreWhitespace, ignoreWhitespace = _b === void 0 ? false : _b, _c = _a.singleHunk, singleHunk = _c === void 0 ? false : _c;
    var result = (0, diff_1.structuredPatch)(filePath, filePath, escapeForDiff(oldContent), escapeForDiff(newContent), undefined, undefined, {
        ignoreWhitespace: ignoreWhitespace,
        context: singleHunk ? 100000 : exports.CONTEXT_LINES,
        timeout: exports.DIFF_TIMEOUT_MS,
    });
    if (!result) {
        return [];
    }
    return result.hunks.map(function (_) { return (__assign(__assign({}, _), { lines: _.lines.map(unescapeFromDiff) })); });
}
/**
 * Get a patch for display with edits applied
 * @param filePath The path to the file
 * @param fileContents The contents of the file
 * @param edits An array of edits to apply to the file
 * @param ignoreWhitespace Whether to ignore whitespace changes
 * @returns An array of hunks representing the diff
 *
 * NOTE: This function will return the diff with all leading tabs
 * rendered as spaces for display
 */
function getPatchForDisplay(_a) {
    var filePath = _a.filePath, fileContents = _a.fileContents, edits = _a.edits, _b = _a.ignoreWhitespace, ignoreWhitespace = _b === void 0 ? false : _b;
    var preparedFileContents = escapeForDiff((0, file_js_1.convertLeadingTabsToSpaces)(fileContents));
    var result = (0, diff_1.structuredPatch)(filePath, filePath, preparedFileContents, edits.reduce(function (p, edit) {
        var old_string = edit.old_string, new_string = edit.new_string;
        var replace_all = 'replace_all' in edit ? edit.replace_all : false;
        var escapedOldString = escapeForDiff((0, file_js_1.convertLeadingTabsToSpaces)(old_string));
        var escapedNewString = escapeForDiff((0, file_js_1.convertLeadingTabsToSpaces)(new_string));
        if (replace_all) {
            return p.replaceAll(escapedOldString, function () { return escapedNewString; });
        }
        else {
            return p.replace(escapedOldString, function () { return escapedNewString; });
        }
    }, preparedFileContents), undefined, undefined, {
        context: exports.CONTEXT_LINES,
        ignoreWhitespace: ignoreWhitespace,
        timeout: exports.DIFF_TIMEOUT_MS,
    });
    if (!result) {
        return [];
    }
    return result.hunks.map(function (_) { return (__assign(__assign({}, _), { lines: _.lines.map(unescapeFromDiff) })); });
}
