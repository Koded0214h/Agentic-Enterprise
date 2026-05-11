"use strict";
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
exports.RIGHT_DOUBLE_CURLY_QUOTE = exports.LEFT_DOUBLE_CURLY_QUOTE = exports.RIGHT_SINGLE_CURLY_QUOTE = exports.LEFT_SINGLE_CURLY_QUOTE = void 0;
exports.normalizeQuotes = normalizeQuotes;
exports.stripTrailingWhitespace = stripTrailingWhitespace;
exports.findActualString = findActualString;
exports.preserveQuoteStyle = preserveQuoteStyle;
exports.applyEditToFile = applyEditToFile;
exports.getPatchForEdit = getPatchForEdit;
exports.getPatchForEdits = getPatchForEdits;
exports.getSnippetForTwoFileDiff = getSnippetForTwoFileDiff;
exports.getSnippetForPatch = getSnippetForPatch;
exports.getSnippet = getSnippet;
exports.getEditsForPatch = getEditsForPatch;
exports.normalizeFileEditInput = normalizeFileEditInput;
exports.areFileEditsEquivalent = areFileEditsEquivalent;
exports.areFileEditsInputsEquivalent = areFileEditsInputsEquivalent;
var diff_1 = require("diff");
var log_js_1 = require("src/utils/log.js");
var path_js_1 = require("src/utils/path.js");
var stringUtils_js_1 = require("src/utils/stringUtils.js");
var diff_js_1 = require("../../utils/diff.js");
var errors_js_1 = require("../../utils/errors.js");
var file_js_1 = require("../../utils/file.js");
// Claude can't output curly quotes, so we define them as constants here for Claude to use
// in the code. We do this because we normalize curly quotes to straight quotes
// when applying edits.
exports.LEFT_SINGLE_CURLY_QUOTE = '‘';
exports.RIGHT_SINGLE_CURLY_QUOTE = '’';
exports.LEFT_DOUBLE_CURLY_QUOTE = '“';
exports.RIGHT_DOUBLE_CURLY_QUOTE = '”';
/**
 * Normalizes quotes in a string by converting curly quotes to straight quotes
 * @param str The string to normalize
 * @returns The string with all curly quotes replaced by straight quotes
 */
function normalizeQuotes(str) {
    return str
        .replaceAll(exports.LEFT_SINGLE_CURLY_QUOTE, "'")
        .replaceAll(exports.RIGHT_SINGLE_CURLY_QUOTE, "'")
        .replaceAll(exports.LEFT_DOUBLE_CURLY_QUOTE, '"')
        .replaceAll(exports.RIGHT_DOUBLE_CURLY_QUOTE, '"');
}
/**
 * Strips trailing whitespace from each line in a string while preserving line endings
 * @param str The string to process
 * @returns The string with trailing whitespace removed from each line
 */
function stripTrailingWhitespace(str) {
    // Handle different line endings: CRLF, LF, CR
    // Use a regex that matches line endings and captures them
    var lines = str.split(/(\r\n|\n|\r)/);
    var result = '';
    for (var i = 0; i < lines.length; i++) {
        var part = lines[i];
        if (part !== undefined) {
            if (i % 2 === 0) {
                // Even indices are line content
                result += part.replace(/\s+$/, '');
            }
            else {
                // Odd indices are line endings
                result += part;
            }
        }
    }
    return result;
}
/**
 * Finds the actual string in the file content that matches the search string,
 * accounting for quote normalization
 * @param fileContent The file content to search in
 * @param searchString The string to search for
 * @returns The actual string found in the file, or null if not found
 */
function findActualString(fileContent, searchString) {
    // First try exact match
    if (fileContent.includes(searchString)) {
        return searchString;
    }
    // Try with normalized quotes
    var normalizedSearch = normalizeQuotes(searchString);
    var normalizedFile = normalizeQuotes(fileContent);
    var searchIndex = normalizedFile.indexOf(normalizedSearch);
    if (searchIndex !== -1) {
        // Find the actual string in the file that matches
        return fileContent.substring(searchIndex, searchIndex + searchString.length);
    }
    return null;
}
/**
 * When old_string matched via quote normalization (curly quotes in file,
 * straight quotes from model), apply the same curly quote style to new_string
 * so the edit preserves the file's typography.
 *
 * Uses a simple open/close heuristic: a quote character preceded by whitespace,
 * start of string, or opening punctuation is treated as an opening quote;
 * otherwise it's a closing quote.
 */
function preserveQuoteStyle(oldString, actualOldString, newString) {
    // If they're the same, no normalization happened
    if (oldString === actualOldString) {
        return newString;
    }
    // Detect which curly quote types were in the file
    var hasDoubleQuotes = actualOldString.includes(exports.LEFT_DOUBLE_CURLY_QUOTE) ||
        actualOldString.includes(exports.RIGHT_DOUBLE_CURLY_QUOTE);
    var hasSingleQuotes = actualOldString.includes(exports.LEFT_SINGLE_CURLY_QUOTE) ||
        actualOldString.includes(exports.RIGHT_SINGLE_CURLY_QUOTE);
    if (!hasDoubleQuotes && !hasSingleQuotes) {
        return newString;
    }
    var result = newString;
    if (hasDoubleQuotes) {
        result = applyCurlyDoubleQuotes(result);
    }
    if (hasSingleQuotes) {
        result = applyCurlySingleQuotes(result);
    }
    return result;
}
function isOpeningContext(chars, index) {
    if (index === 0) {
        return true;
    }
    var prev = chars[index - 1];
    return (prev === ' ' ||
        prev === '\t' ||
        prev === '\n' ||
        prev === '\r' ||
        prev === '(' ||
        prev === '[' ||
        prev === '{' ||
        prev === '\u2014' || // em dash
        prev === '\u2013' // en dash
    );
}
function applyCurlyDoubleQuotes(str) {
    var chars = __spreadArray([], str, true);
    var result = [];
    for (var i = 0; i < chars.length; i++) {
        if (chars[i] === '"') {
            result.push(isOpeningContext(chars, i)
                ? exports.LEFT_DOUBLE_CURLY_QUOTE
                : exports.RIGHT_DOUBLE_CURLY_QUOTE);
        }
        else {
            result.push(chars[i]);
        }
    }
    return result.join('');
}
function applyCurlySingleQuotes(str) {
    var chars = __spreadArray([], str, true);
    var result = [];
    for (var i = 0; i < chars.length; i++) {
        if (chars[i] === "'") {
            // Don't convert apostrophes in contractions (e.g., "don't", "it's")
            // An apostrophe between two letters is a contraction, not a quote
            var prev = i > 0 ? chars[i - 1] : undefined;
            var next = i < chars.length - 1 ? chars[i + 1] : undefined;
            var prevIsLetter = prev !== undefined && /\p{L}/u.test(prev);
            var nextIsLetter = next !== undefined && /\p{L}/u.test(next);
            if (prevIsLetter && nextIsLetter) {
                // Apostrophe in a contraction — use right single curly quote
                result.push(exports.RIGHT_SINGLE_CURLY_QUOTE);
            }
            else {
                result.push(isOpeningContext(chars, i)
                    ? exports.LEFT_SINGLE_CURLY_QUOTE
                    : exports.RIGHT_SINGLE_CURLY_QUOTE);
            }
        }
        else {
            result.push(chars[i]);
        }
    }
    return result.join('');
}
/**
 * Transform edits to ensure replace_all always has a boolean value
 * @param edits Array of edits with optional replace_all
 * @returns Array of edits with replace_all guaranteed to be boolean
 */
function applyEditToFile(originalContent, oldString, newString, replaceAll) {
    if (replaceAll === void 0) { replaceAll = false; }
    var f = replaceAll
        ? function (content, search, replace) {
            return content.replaceAll(search, function () { return replace; });
        }
        : function (content, search, replace) {
            return content.replace(search, function () { return replace; });
        };
    if (newString !== '') {
        return f(originalContent, oldString, newString);
    }
    var stripTrailingNewline = !oldString.endsWith('\n') && originalContent.includes(oldString + '\n');
    return stripTrailingNewline
        ? f(originalContent, oldString + '\n', newString)
        : f(originalContent, oldString, newString);
}
/**
 * Applies an edit to a file and returns the patch and updated file.
 * Does not write the file to disk.
 */
function getPatchForEdit(_a) {
    var filePath = _a.filePath, fileContents = _a.fileContents, oldString = _a.oldString, newString = _a.newString, _b = _a.replaceAll, replaceAll = _b === void 0 ? false : _b;
    return getPatchForEdits({
        filePath: filePath,
        fileContents: fileContents,
        edits: [
            { old_string: oldString, new_string: newString, replace_all: replaceAll },
        ],
    });
}
/**
 * Applies a list of edits to a file and returns the patch and updated file.
 * Does not write the file to disk.
 *
 * NOTE: The returned patch is to be used for display purposes only - it has spaces instead of tabs
 */
function getPatchForEdits(_a) {
    var filePath = _a.filePath, fileContents = _a.fileContents, edits = _a.edits;
    var updatedFile = fileContents;
    var appliedNewStrings = [];
    // Special case for empty files.
    if (!fileContents &&
        edits.length === 1 &&
        edits[0] &&
        edits[0].old_string === '' &&
        edits[0].new_string === '') {
        var patch_1 = (0, diff_js_1.getPatchForDisplay)({
            filePath: filePath,
            fileContents: fileContents,
            edits: [
                {
                    old_string: fileContents,
                    new_string: updatedFile,
                    replace_all: false,
                },
            ],
        });
        return { patch: patch_1, updatedFile: '' };
    }
    // Apply each edit and check if it actually changes the file
    for (var _i = 0, edits_1 = edits; _i < edits_1.length; _i++) {
        var edit = edits_1[_i];
        // Strip trailing newlines from old_string before checking
        var oldStringToCheck = edit.old_string.replace(/\n+$/, '');
        // Check if old_string is a substring of any previously applied new_string
        for (var _b = 0, appliedNewStrings_1 = appliedNewStrings; _b < appliedNewStrings_1.length; _b++) {
            var previousNewString = appliedNewStrings_1[_b];
            if (oldStringToCheck !== '' &&
                previousNewString.includes(oldStringToCheck)) {
                throw new Error('Cannot edit file: old_string is a substring of a new_string from a previous edit.');
            }
        }
        var previousContent = updatedFile;
        updatedFile =
            edit.old_string === ''
                ? edit.new_string
                : applyEditToFile(updatedFile, edit.old_string, edit.new_string, edit.replace_all);
        // If this edit didn't change anything, throw an error
        if (updatedFile === previousContent) {
            throw new Error('String not found in file. Failed to apply edit.');
        }
        // Track the new string that was applied
        appliedNewStrings.push(edit.new_string);
    }
    if (updatedFile === fileContents) {
        throw new Error('Original and edited file match exactly. Failed to apply edit.');
    }
    // We already have before/after content, so call getPatchFromContents directly.
    // Previously this went through getPatchForDisplay with edits=[{old:fileContents,new:updatedFile}],
    // which transforms fileContents twice (once as preparedFileContents, again as escapedOldString
    // inside the reduce) and runs a no-op full-content .replace(). This saves ~20% on large files.
    var patch = (0, diff_js_1.getPatchFromContents)({
        filePath: filePath,
        oldContent: (0, file_js_1.convertLeadingTabsToSpaces)(fileContents),
        newContent: (0, file_js_1.convertLeadingTabsToSpaces)(updatedFile),
    });
    return { patch: patch, updatedFile: updatedFile };
}
// Cap on edited_text_file attachment snippets. Format-on-save of a large file
// previously injected the entire file per turn (observed max 16.1KB, ~14K
// tokens/session). 8KB preserves meaningful context while bounding worst case.
var DIFF_SNIPPET_MAX_BYTES = 8192;
/**
 * Used for attachments, to show snippets when files change.
 *
 * TODO: Unify this with the other snippet logic.
 */
function getSnippetForTwoFileDiff(fileAContents, fileBContents) {
    var patch = (0, diff_1.structuredPatch)('file.txt', 'file.txt', fileAContents, fileBContents, undefined, undefined, {
        context: 8,
        timeout: diff_js_1.DIFF_TIMEOUT_MS,
    });
    if (!patch) {
        return '';
    }
    var full = patch.hunks
        .map(function (_) { return ({
        startLine: _.oldStart,
        content: _.lines
            // Filter out deleted lines AND diff metadata lines
            .filter(function (_) { return !_.startsWith('-') && !_.startsWith('\\'); })
            .map(function (_) { return _.slice(1); })
            .join('\n'),
    }); })
        .map(file_js_1.addLineNumbers)
        .join('\n...\n');
    if (full.length <= DIFF_SNIPPET_MAX_BYTES) {
        return full;
    }
    // Truncate at the last line boundary that fits within the cap.
    // Marker format matches BashTool/utils.ts.
    var cutoff = full.lastIndexOf('\n', DIFF_SNIPPET_MAX_BYTES);
    var kept = cutoff > 0 ? full.slice(0, cutoff) : full.slice(0, DIFF_SNIPPET_MAX_BYTES);
    var remaining = (0, stringUtils_js_1.countCharInString)(full, '\n', kept.length) + 1;
    return "".concat(kept, "\n\n... [").concat(remaining, " lines truncated] ...");
}
var CONTEXT_LINES = 4;
/**
 * Gets a snippet from a file showing the context around a patch with line numbers.
 * @param originalFile The original file content before applying the patch
 * @param patch The diff hunks to use for determining snippet location
 * @param newFile The file content after applying the patch
 * @returns The snippet text with line numbers and the starting line number
 */
function getSnippetForPatch(patch, newFile) {
    if (patch.length === 0) {
        // No changes, return empty snippet
        return { formattedSnippet: '', startLine: 1 };
    }
    // Find the first and last changed lines across all hunks
    var minLine = Infinity;
    var maxLine = -Infinity;
    for (var _i = 0, patch_2 = patch; _i < patch_2.length; _i++) {
        var hunk = patch_2[_i];
        if (hunk.oldStart < minLine) {
            minLine = hunk.oldStart;
        }
        // For the end line, we need to consider the new lines count since we're showing the new file
        var hunkEnd = hunk.oldStart + (hunk.newLines || 0) - 1;
        if (hunkEnd > maxLine) {
            maxLine = hunkEnd;
        }
    }
    // Calculate the range with context
    var startLine = Math.max(1, minLine - CONTEXT_LINES);
    var endLine = maxLine + CONTEXT_LINES;
    // Split the new file into lines and get the snippet
    var fileLines = newFile.split(/\r?\n/);
    var snippetLines = fileLines.slice(startLine - 1, endLine);
    var snippet = snippetLines.join('\n');
    // Add line numbers
    var formattedSnippet = (0, file_js_1.addLineNumbers)({
        content: snippet,
        startLine: startLine,
    });
    return { formattedSnippet: formattedSnippet, startLine: startLine };
}
/**
 * Gets a snippet from a file showing the context around a single edit.
 * This is a convenience function that uses the original algorithm.
 * @param originalFile The original file content
 * @param oldString The text to replace
 * @param newString The text to replace it with
 * @param contextLines The number of lines to show before and after the change
 * @returns The snippet and the starting line number
 */
function getSnippet(originalFile, oldString, newString, contextLines) {
    var _a;
    if (contextLines === void 0) { contextLines = 4; }
    // Use the original algorithm from FileEditTool.tsx
    var before = (_a = originalFile.split(oldString)[0]) !== null && _a !== void 0 ? _a : '';
    var replacementLine = before.split(/\r?\n/).length - 1;
    var newFileLines = applyEditToFile(originalFile, oldString, newString).split(/\r?\n/);
    // Calculate the start and end line numbers for the snippet
    var startLine = Math.max(0, replacementLine - contextLines);
    var endLine = replacementLine + contextLines + newString.split(/\r?\n/).length;
    // Get snippet
    var snippetLines = newFileLines.slice(startLine, endLine);
    var snippet = snippetLines.join('\n');
    return { snippet: snippet, startLine: startLine + 1 };
}
function getEditsForPatch(patch) {
    return patch.map(function (hunk) {
        // Extract the changes from this hunk
        var contextLines = [];
        var oldLines = [];
        var newLines = [];
        // Parse each line and categorize it
        for (var _i = 0, _a = hunk.lines; _i < _a.length; _i++) {
            var line = _a[_i];
            if (line.startsWith(' ')) {
                // Context line - appears in both versions
                contextLines.push(line.slice(1));
                oldLines.push(line.slice(1));
                newLines.push(line.slice(1));
            }
            else if (line.startsWith('-')) {
                // Deleted line - only in old version
                oldLines.push(line.slice(1));
            }
            else if (line.startsWith('+')) {
                // Added line - only in new version
                newLines.push(line.slice(1));
            }
        }
        return {
            old_string: oldLines.join('\n'),
            new_string: newLines.join('\n'),
            replace_all: false,
        };
    });
}
/**
 * Contains replacements to de-sanitize strings from Claude
 * Since Claude can't see any of these strings (sanitized in the API)
 * It'll output the sanitized versions in the edit response
 */
var DESANITIZATIONS = {
    '<fnr>': '<function_results>',
    '<n>': '<name>',
    '</n>': '</name>',
    '<o>': '<output>',
    '</o>': '</output>',
    '<e>': '<error>',
    '</e>': '</error>',
    '<s>': '<system>',
    '</s>': '</system>',
    '<r>': '<result>',
    '</r>': '</result>',
    '< META_START >': '<META_START>',
    '< META_END >': '<META_END>',
    '< EOT >': '<EOT>',
    '< META >': '<META>',
    '< SOS >': '<SOS>',
    '\n\nH:': '\n\nHuman:',
    '\n\nA:': '\n\nAssistant:',
};
/**
 * Normalizes a match string by applying specific replacements
 * This helps handle when exact matches fail due to formatting differences
 * @returns The normalized string and which replacements were applied
 */
function desanitizeMatchString(matchString) {
    var result = matchString;
    var appliedReplacements = [];
    for (var _i = 0, _a = Object.entries(DESANITIZATIONS); _i < _a.length; _i++) {
        var _b = _a[_i], from = _b[0], to = _b[1];
        var beforeReplace = result;
        result = result.replaceAll(from, to);
        if (beforeReplace !== result) {
            appliedReplacements.push({ from: from, to: to });
        }
    }
    return { result: result, appliedReplacements: appliedReplacements };
}
/**
 * Normalize the input for the FileEditTool
 * If the string to replace is not found in the file, try with a normalized version
 * Returns the normalized input if successful, or the original input if not
 */
function normalizeFileEditInput(_a) {
    var file_path = _a.file_path, edits = _a.edits;
    if (edits.length === 0) {
        return { file_path: file_path, edits: edits };
    }
    // Markdown uses two trailing spaces as a hard line break — stripping would
    // silently change semantics. Skip stripTrailingWhitespace for .md/.mdx.
    var isMarkdown = /\.(md|mdx)$/i.test(file_path);
    try {
        var fullPath = (0, path_js_1.expandPath)(file_path);
        // Use cached file read to avoid redundant I/O operations.
        // If the file doesn't exist, readFileSyncCached throws ENOENT which the
        // catch below handles by returning the original input (no TOCTOU pre-check).
        var fileContent_1 = (0, file_js_1.readFileSyncCached)(fullPath);
        return {
            file_path: file_path,
            edits: edits.map(function (_a) {
                var old_string = _a.old_string, new_string = _a.new_string, replace_all = _a.replace_all;
                var normalizedNewString = isMarkdown
                    ? new_string
                    : stripTrailingWhitespace(new_string);
                // If exact string match works, keep it as is
                if (fileContent_1.includes(old_string)) {
                    return {
                        old_string: old_string,
                        new_string: normalizedNewString,
                        replace_all: replace_all,
                    };
                }
                // Try de-sanitize string if exact match fails
                var _b = desanitizeMatchString(old_string), desanitizedOldString = _b.result, appliedReplacements = _b.appliedReplacements;
                if (fileContent_1.includes(desanitizedOldString)) {
                    // Apply the same exact replacements to new_string
                    var desanitizedNewString = normalizedNewString;
                    for (var _i = 0, appliedReplacements_1 = appliedReplacements; _i < appliedReplacements_1.length; _i++) {
                        var _c = appliedReplacements_1[_i], from = _c.from, to = _c.to;
                        desanitizedNewString = desanitizedNewString.replaceAll(from, to);
                    }
                    return {
                        old_string: desanitizedOldString,
                        new_string: desanitizedNewString,
                        replace_all: replace_all,
                    };
                }
                return {
                    old_string: old_string,
                    new_string: normalizedNewString,
                    replace_all: replace_all,
                };
            }),
        };
    }
    catch (error) {
        // If there's any error reading the file, just return original input.
        // ENOENT is expected when the file doesn't exist yet (e.g., new file).
        if (!(0, errors_js_1.isENOENT)(error)) {
            (0, log_js_1.logError)(error);
        }
    }
    return { file_path: file_path, edits: edits };
}
/**
 * Compare two sets of edits to determine if they are equivalent
 * by applying both sets to the original content and comparing results.
 * This handles cases where edits might be different but produce the same outcome.
 */
function areFileEditsEquivalent(edits1, edits2, originalContent) {
    // Fast path: check if edits are literally identical
    if (edits1.length === edits2.length &&
        edits1.every(function (edit1, index) {
            var edit2 = edits2[index];
            return (edit2 !== undefined &&
                edit1.old_string === edit2.old_string &&
                edit1.new_string === edit2.new_string &&
                edit1.replace_all === edit2.replace_all);
        })) {
        return true;
    }
    // Try applying both sets of edits
    var result1 = null;
    var error1 = null;
    var result2 = null;
    var error2 = null;
    try {
        result1 = getPatchForEdits({
            filePath: 'temp',
            fileContents: originalContent,
            edits: edits1,
        });
    }
    catch (e) {
        error1 = (0, errors_js_1.errorMessage)(e);
    }
    try {
        result2 = getPatchForEdits({
            filePath: 'temp',
            fileContents: originalContent,
            edits: edits2,
        });
    }
    catch (e) {
        error2 = (0, errors_js_1.errorMessage)(e);
    }
    // If both threw errors, they're equal only if the errors are the same
    if (error1 !== null && error2 !== null) {
        // Normalize error messages for comparison
        return error1 === error2;
    }
    // If one threw an error and the other didn't, they're not equal
    if (error1 !== null || error2 !== null) {
        return false;
    }
    // Both succeeded - compare the results
    return result1.updatedFile === result2.updatedFile;
}
/**
 * Unified function to check if two file edit inputs are equivalent.
 * Handles file edits (FileEditTool).
 */
function areFileEditsInputsEquivalent(input1, input2) {
    // Fast path: different files
    if (input1.file_path !== input2.file_path) {
        return false;
    }
    // Fast path: literal equality
    if (input1.edits.length === input2.edits.length &&
        input1.edits.every(function (edit1, index) {
            var edit2 = input2.edits[index];
            return (edit2 !== undefined &&
                edit1.old_string === edit2.old_string &&
                edit1.new_string === edit2.new_string &&
                edit1.replace_all === edit2.replace_all);
        })) {
        return true;
    }
    // Semantic comparison (requires file read). If the file doesn't exist,
    // compare against empty content (no TOCTOU pre-check).
    var fileContent = '';
    try {
        fileContent = (0, file_js_1.readFileSyncCached)(input1.file_path);
    }
    catch (error) {
        if (!(0, errors_js_1.isENOENT)(error)) {
            throw error;
        }
    }
    return areFileEditsEquivalent(input1.edits, input2.edits, fileContent);
}
