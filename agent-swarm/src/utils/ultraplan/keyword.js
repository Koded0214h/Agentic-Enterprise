"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUltraplanTriggerPositions = findUltraplanTriggerPositions;
exports.findUltrareviewTriggerPositions = findUltrareviewTriggerPositions;
exports.hasUltraplanKeyword = hasUltraplanKeyword;
exports.hasUltrareviewKeyword = hasUltrareviewKeyword;
exports.replaceUltraplanKeyword = replaceUltraplanKeyword;
var OPEN_TO_CLOSE = {
    '`': '`',
    '"': '"',
    '<': '>',
    '{': '}',
    '[': ']',
    '(': ')',
    "'": "'",
};
/**
 * Find keyword positions, skipping occurrences that are clearly not a
 * launch directive:
 *
 * - Inside paired delimiters: backticks, double quotes, angle brackets
 *   (tag-like only, so `n < 5 ultraplan n > 10` is not a phantom range),
 *   curly braces, square brackets (innermost — preExpansionInput has
 *   `[Pasted text #N]` placeholders), parentheses. Single quotes are
 *   delimiters only when not an apostrophe — the opening quote must be
 *   preceded by a non-word char (or start) and the closing quote must be
 *   followed by a non-word char (or end), so "let's ultraplan it's"
 *   still triggers.
 *
 * - Path/identifier-like context: immediately preceded or followed by
 *   `/`, `\`, or `-`, or followed by `.` + word char (file extension).
 *   `\b` sees a boundary at `-`, so `ultraplan-s` would otherwise
 *   match. This keeps `src/ultraplan/foo.ts`, `ultraplan.tsx`, and
 *   `--ultraplan-mode` from triggering while `ultraplan.` at a sentence
 *   end still does.
 *
 * - Followed by `?`: a question about the feature shouldn't invoke it.
 *   Other sentence punctuation (`.`, `,`, `!`) still triggers.
 *
 * - Slash command input: text starting with `/` is a slash command
 *   invocation (processUserInput.ts routes it to processSlashCommand,
 *   not keyword detection), so `/rename ultraplan foo` never triggers.
 *   Without this, PromptInput would rainbow-highlight the word and show
 *   the "will launch ultraplan" notification even though submitting the
 *   input runs /rename, not /ultraplan.
 *
 * Shape matches findThinkingTriggerPositions (thinking.ts) so
 * PromptInput treats both trigger types uniformly.
 */
function findKeywordTriggerPositions(text, keyword) {
    var re = new RegExp(keyword, 'i');
    if (!re.test(text))
        return [];
    if (text.startsWith('/'))
        return [];
    var quotedRanges = [];
    var openQuote = null;
    var openAt = 0;
    var isWord = function (ch) { return !!ch && /[\p{L}\p{N}_]/u.test(ch); };
    for (var i = 0; i < text.length; i++) {
        var ch = text[i];
        if (openQuote) {
            if (openQuote === '[' && ch === '[') {
                openAt = i;
                continue;
            }
            if (ch !== OPEN_TO_CLOSE[openQuote])
                continue;
            if (openQuote === "'" && isWord(text[i + 1]))
                continue;
            quotedRanges.push({ start: openAt, end: i + 1 });
            openQuote = null;
        }
        else if ((ch === '<' && i + 1 < text.length && /[a-zA-Z/]/.test(text[i + 1])) ||
            (ch === "'" && !isWord(text[i - 1])) ||
            (ch !== '<' && ch !== "'" && ch in OPEN_TO_CLOSE)) {
            openQuote = ch;
            openAt = i;
        }
    }
    var positions = [];
    var wordRe = new RegExp("\\b".concat(keyword, "\\b"), 'gi');
    var matches = text.matchAll(wordRe);
    var _loop_1 = function (match) {
        if (match.index === undefined)
            return "continue";
        var start = match.index;
        var end = start + match[0].length;
        if (quotedRanges.some(function (r) { return start >= r.start && start < r.end; }))
            return "continue";
        var before = text[start - 1];
        var after = text[end];
        if (before === '/' || before === '\\' || before === '-')
            return "continue";
        if (after === '/' || after === '\\' || after === '-' || after === '?')
            return "continue";
        if (after === '.' && isWord(text[end + 1]))
            return "continue";
        positions.push({ word: match[0], start: start, end: end });
    };
    for (var _i = 0, matches_1 = matches; _i < matches_1.length; _i++) {
        var match = matches_1[_i];
        _loop_1(match);
    }
    return positions;
}
function findUltraplanTriggerPositions(text) {
    return findKeywordTriggerPositions(text, 'ultraplan');
}
function findUltrareviewTriggerPositions(text) {
    return findKeywordTriggerPositions(text, 'ultrareview');
}
function hasUltraplanKeyword(text) {
    return findUltraplanTriggerPositions(text).length > 0;
}
function hasUltrareviewKeyword(text) {
    return findUltrareviewTriggerPositions(text).length > 0;
}
/**
 * Replace the first triggerable "ultraplan" with "plan" so the forwarded
 * prompt stays grammatical ("please ultraplan this" → "please plan this").
 * Preserves the user's casing of the "plan" suffix.
 */
function replaceUltraplanKeyword(text) {
    var trigger = findUltraplanTriggerPositions(text)[0];
    if (!trigger)
        return text;
    var before = text.slice(0, trigger.start);
    var after = text.slice(trigger.end);
    if (!(before + after).trim())
        return '';
    return before + trigger.word.slice('ultra'.length) + after;
}
