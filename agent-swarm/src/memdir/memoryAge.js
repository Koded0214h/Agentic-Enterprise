"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoryAgeDays = memoryAgeDays;
exports.memoryAge = memoryAge;
exports.memoryFreshnessText = memoryFreshnessText;
exports.memoryFreshnessNote = memoryFreshnessNote;
/**
 * Days elapsed since mtime.  Floor-rounded — 0 for today, 1 for
 * yesterday, 2+ for older.  Negative inputs (future mtime, clock skew)
 * clamp to 0.
 */
function memoryAgeDays(mtimeMs) {
    return Math.max(0, Math.floor((Date.now() - mtimeMs) / 86400000));
}
/**
 * Human-readable age string.  Models are poor at date arithmetic —
 * a raw ISO timestamp doesn't trigger staleness reasoning the way
 * "47 days ago" does.
 */
function memoryAge(mtimeMs) {
    var d = memoryAgeDays(mtimeMs);
    if (d === 0)
        return 'today';
    if (d === 1)
        return 'yesterday';
    return "".concat(d, " days ago");
}
/**
 * Plain-text staleness caveat for memories >1 day old.  Returns ''
 * for fresh (today/yesterday) memories — warning there is noise.
 *
 * Use this when the consumer already provides its own wrapping
 * (e.g. messages.ts relevant_memories → wrapMessagesInSystemReminder).
 *
 * Motivated by user reports of stale code-state memories (file:line
 * citations to code that has since changed) being asserted as fact —
 * the citation makes the stale claim sound more authoritative, not less.
 */
function memoryFreshnessText(mtimeMs) {
    var d = memoryAgeDays(mtimeMs);
    if (d <= 1)
        return '';
    return ("This memory is ".concat(d, " days old. ") +
        "Memories are point-in-time observations, not live state \u2014 " +
        "claims about code behavior or file:line citations may be outdated. " +
        "Verify against current code before asserting as fact.");
}
/**
 * Per-memory staleness note wrapped in <system-reminder> tags.
 * Returns '' for memories ≤ 1 day old.  Use this for callers that
 * don't add their own system-reminder wrapper (e.g. FileReadTool output).
 */
function memoryFreshnessNote(mtimeMs) {
    var text = memoryFreshnessText(mtimeMs);
    if (!text)
        return '';
    return "<system-reminder>".concat(text, "</system-reminder>\n");
}
