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
exports.useTurnDiffs = useTurnDiffs;
var react_1 = require("react");
function isFileEditResult(result) {
    if (!result || typeof result !== 'object')
        return false;
    var r = result;
    // FileEditTool: has structuredPatch with content
    // FileWriteTool (update): has structuredPatch with content
    // FileWriteTool (create): has type='create' and content (structuredPatch is empty)
    var hasFilePath = typeof r.filePath === 'string';
    var hasStructuredPatch = Array.isArray(r.structuredPatch) && r.structuredPatch.length > 0;
    var isNewFile = r.type === 'create' && typeof r.content === 'string';
    return hasFilePath && (hasStructuredPatch || isNewFile);
}
function isFileWriteOutput(result) {
    return ('type' in result && (result.type === 'create' || result.type === 'update'));
}
function countHunkLines(hunks) {
    var added = 0;
    var removed = 0;
    for (var _i = 0, hunks_1 = hunks; _i < hunks_1.length; _i++) {
        var hunk = hunks_1[_i];
        for (var _a = 0, _b = hunk.lines; _a < _b.length; _a++) {
            var line = _b[_a];
            if (line.startsWith('+'))
                added++;
            else if (line.startsWith('-'))
                removed++;
        }
    }
    return { added: added, removed: removed };
}
function getUserPromptPreview(message) {
    if (message.type !== 'user')
        return '';
    var content = message.message.content;
    var text = typeof content === 'string' ? content : '';
    // Truncate to ~30 chars
    if (text.length <= 30)
        return text;
    return text.slice(0, 29) + '…';
}
function computeTurnStats(turn) {
    var totalAdded = 0;
    var totalRemoved = 0;
    for (var _i = 0, _a = turn.files.values(); _i < _a.length; _i++) {
        var file = _a[_i];
        totalAdded += file.linesAdded;
        totalRemoved += file.linesRemoved;
    }
    turn.stats = {
        filesChanged: turn.files.size,
        linesAdded: totalAdded,
        linesRemoved: totalRemoved,
    };
}
/**
 * Extract turn-based diffs from messages.
 * A turn is defined as a user prompt followed by assistant responses and tool results.
 * Each turn with file edits is included in the result.
 *
 * Uses incremental accumulation - only processes new messages since last render.
 */
function useTurnDiffs(messages) {
    var cache = (0, react_1.useRef)({
        completedTurns: [],
        currentTurn: null,
        lastProcessedIndex: 0,
        lastTurnIndex: 0,
    });
    return (0, react_1.useMemo)(function () {
        var _a;
        var _b;
        var c = cache.current;
        // Reset if messages shrunk (user rewound conversation)
        if (messages.length < c.lastProcessedIndex) {
            c.completedTurns = [];
            c.currentTurn = null;
            c.lastProcessedIndex = 0;
            c.lastTurnIndex = 0;
        }
        // Process only new messages
        for (var i = c.lastProcessedIndex; i < messages.length; i++) {
            var message = messages[i];
            if (!message || message.type !== 'user')
                continue;
            // Check if this is a user prompt (not a tool result)
            var isToolResult = message.toolUseResult ||
                (Array.isArray(message.message.content) &&
                    ((_b = message.message.content[0]) === null || _b === void 0 ? void 0 : _b.type) === 'tool_result');
            if (!isToolResult && !message.isMeta) {
                // Start a new turn on user prompt
                if (c.currentTurn && c.currentTurn.files.size > 0) {
                    computeTurnStats(c.currentTurn);
                    c.completedTurns.push(c.currentTurn);
                }
                c.lastTurnIndex++;
                c.currentTurn = {
                    turnIndex: c.lastTurnIndex,
                    userPromptPreview: getUserPromptPreview(message),
                    timestamp: message.timestamp,
                    files: new Map(),
                    stats: { filesChanged: 0, linesAdded: 0, linesRemoved: 0 },
                };
            }
            else if (c.currentTurn && message.toolUseResult) {
                // Collect file edits from tool results
                var result_1 = message.toolUseResult;
                if (isFileEditResult(result_1)) {
                    var filePath = result_1.filePath, structuredPatch = result_1.structuredPatch;
                    var isNewFile = 'type' in result_1 && result_1.type === 'create';
                    // Get or create file entry
                    var fileEntry = c.currentTurn.files.get(filePath);
                    if (!fileEntry) {
                        fileEntry = {
                            filePath: filePath,
                            hunks: [],
                            isNewFile: isNewFile,
                            linesAdded: 0,
                            linesRemoved: 0,
                        };
                        c.currentTurn.files.set(filePath, fileEntry);
                    }
                    // For new files, generate synthetic hunk from content
                    if (isNewFile &&
                        structuredPatch.length === 0 &&
                        isFileWriteOutput(result_1)) {
                        var content = result_1.content;
                        var lines = content.split('\n');
                        var syntheticHunk = {
                            oldStart: 0,
                            oldLines: 0,
                            newStart: 1,
                            newLines: lines.length,
                            lines: lines.map(function (l) { return '+' + l; }),
                        };
                        fileEntry.hunks.push(syntheticHunk);
                        fileEntry.linesAdded += lines.length;
                    }
                    else {
                        // Append hunks (same file may be edited multiple times in a turn)
                        (_a = fileEntry.hunks).push.apply(_a, structuredPatch);
                        // Update line counts
                        var _c = countHunkLines(structuredPatch), added = _c.added, removed = _c.removed;
                        fileEntry.linesAdded += added;
                        fileEntry.linesRemoved += removed;
                    }
                    // If file was created and then edited, it's still a new file
                    if (isNewFile) {
                        fileEntry.isNewFile = true;
                    }
                }
            }
        }
        c.lastProcessedIndex = messages.length;
        // Build result: completed turns + current turn if it has files
        var result = __spreadArray([], c.completedTurns, true);
        if (c.currentTurn && c.currentTurn.files.size > 0) {
            // Compute stats for current turn before including
            computeTurnStats(c.currentTurn);
            result.push(c.currentTurn);
        }
        // Return in reverse order (most recent first)
        return result.reverse();
    }, [messages]);
}
