"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTokenBudget = parseTokenBudget;
exports.findTokenBudgetPositions = findTokenBudgetPositions;
exports.getBudgetContinuationMessage = getBudgetContinuationMessage;
// Shorthand (+500k) anchored to start/end to avoid false positives in natural language.
// Verbose (use/spend 2M tokens) matches anywhere.
var SHORTHAND_START_RE = /^\s*\+(\d+(?:\.\d+)?)\s*(k|m|b)\b/i;
// Lookbehind (?<=\s) is avoided — it defeats YARR JIT in JSC, and the
// interpreter scans O(n) even with the $ anchor. Capture the whitespace
// instead; callers offset match.index by 1 where position matters.
var SHORTHAND_END_RE = /\s\+(\d+(?:\.\d+)?)\s*(k|m|b)\s*[.!?]?\s*$/i;
var VERBOSE_RE = /\b(?:use|spend)\s+(\d+(?:\.\d+)?)\s*(k|m|b)\s*tokens?\b/i;
var VERBOSE_RE_G = new RegExp(VERBOSE_RE.source, 'gi');
var MULTIPLIERS = {
    k: 1000,
    m: 1000000,
    b: 1000000000,
};
function parseBudgetMatch(value, suffix) {
    return parseFloat(value) * MULTIPLIERS[suffix.toLowerCase()];
}
function parseTokenBudget(text) {
    var startMatch = text.match(SHORTHAND_START_RE);
    if (startMatch)
        return parseBudgetMatch(startMatch[1], startMatch[2]);
    var endMatch = text.match(SHORTHAND_END_RE);
    if (endMatch)
        return parseBudgetMatch(endMatch[1], endMatch[2]);
    var verboseMatch = text.match(VERBOSE_RE);
    if (verboseMatch)
        return parseBudgetMatch(verboseMatch[1], verboseMatch[2]);
    return null;
}
function findTokenBudgetPositions(text) {
    var positions = [];
    var startMatch = text.match(SHORTHAND_START_RE);
    if (startMatch) {
        var offset = startMatch.index +
            startMatch[0].length -
            startMatch[0].trimStart().length;
        positions.push({
            start: offset,
            end: startMatch.index + startMatch[0].length,
        });
    }
    var endMatch = text.match(SHORTHAND_END_RE);
    if (endMatch) {
        // Avoid double-counting when input is just "+500k"
        var endStart_1 = endMatch.index + 1; // +1: regex includes leading \s
        var alreadyCovered = positions.some(function (p) { return endStart_1 >= p.start && endStart_1 < p.end; });
        if (!alreadyCovered) {
            positions.push({
                start: endStart_1,
                end: endMatch.index + endMatch[0].length,
            });
        }
    }
    for (var _i = 0, _a = text.matchAll(VERBOSE_RE_G); _i < _a.length; _i++) {
        var match = _a[_i];
        positions.push({ start: match.index, end: match.index + match[0].length });
    }
    return positions;
}
function getBudgetContinuationMessage(pct, turnTokens, budget) {
    var fmt = function (n) { return new Intl.NumberFormat('en-US').format(n); };
    return "Stopped at ".concat(pct, "% of token target (").concat(fmt(turnTokens), " / ").concat(fmt(budget), "). Keep working \u2014 do not summarize.");
}
