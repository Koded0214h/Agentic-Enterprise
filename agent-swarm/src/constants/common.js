"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionStartDate = void 0;
exports.getLocalISODate = getLocalISODate;
exports.getLocalMonthYear = getLocalMonthYear;
var memoize_js_1 = require("lodash-es/memoize.js");
// This ensures you get the LOCAL date in ISO format
function getLocalISODate() {
    // Check for ant-only date override
    if (process.env.CLAUDE_CODE_OVERRIDE_DATE) {
        return process.env.CLAUDE_CODE_OVERRIDE_DATE;
    }
    var now = new Date();
    var year = now.getFullYear();
    var month = String(now.getMonth() + 1).padStart(2, '0');
    var day = String(now.getDate()).padStart(2, '0');
    return "".concat(year, "-").concat(month, "-").concat(day);
}
// Memoized for prompt-cache stability — captures the date once at session start.
// The main interactive path gets this behavior via memoize(getUserContext) in
// context.ts; simple mode (--bare) calls getSystemPrompt per-request and needs
// an explicit memoized date to avoid busting the cached prefix at midnight.
// When midnight rolls over, getDateChangeAttachments appends the new date at
// the tail (though simple mode disables attachments, so the trade-off there is:
// stale date after midnight vs. ~entire-conversation cache bust — stale wins).
exports.getSessionStartDate = (0, memoize_js_1.default)(getLocalISODate);
// Returns "Month YYYY" (e.g. "February 2026") in the user's local timezone.
// Changes monthly, not daily — used in tool prompts to minimize cache busting.
function getLocalMonthYear() {
    var date = process.env.CLAUDE_CODE_OVERRIDE_DATE
        ? new Date(process.env.CLAUDE_CODE_OVERRIDE_DATE)
        : new Date();
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}
