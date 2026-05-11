"use strict";
// Minimal cron expression parsing and next-run calculation.
//
// Supports the standard 5-field cron subset:
//   minute hour day-of-month month day-of-week
//
// Field syntax: wildcard, N, step (star-slash-N), range (N-M), list (N,M,...).
// No L, W, ?, or name aliases. All times are interpreted in the process's
// local timezone — "0 9 * * *" means 9am wherever the CLI is running.
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCronExpression = parseCronExpression;
exports.computeNextCronRun = computeNextCronRun;
exports.cronToHuman = cronToHuman;
var FIELD_RANGES = [
    { min: 0, max: 59 }, // minute
    { min: 0, max: 23 }, // hour
    { min: 1, max: 31 }, // dayOfMonth
    { min: 1, max: 12 }, // month
    { min: 0, max: 6 }, // dayOfWeek (0=Sunday; 7 accepted as Sunday alias)
];
// Parse a single cron field into a sorted array of matching values.
// Supports: wildcard, N, star-slash-N (step), N-M (range), and comma-lists.
// Returns null if invalid.
function expandField(field, range) {
    var min = range.min, max = range.max;
    var out = new Set();
    for (var _i = 0, _a = field.split(','); _i < _a.length; _i++) {
        var part = _a[_i];
        // wildcard or star-slash-N
        var stepMatch = part.match(/^\*(?:\/(\d+))?$/);
        if (stepMatch) {
            var step = stepMatch[1] ? parseInt(stepMatch[1], 10) : 1;
            if (step < 1)
                return null;
            for (var i = min; i <= max; i += step)
                out.add(i);
            continue;
        }
        // N-M or N-M/S
        var rangeMatch = part.match(/^(\d+)-(\d+)(?:\/(\d+))?$/);
        if (rangeMatch) {
            var lo = parseInt(rangeMatch[1], 10);
            var hi = parseInt(rangeMatch[2], 10);
            var step = rangeMatch[3] ? parseInt(rangeMatch[3], 10) : 1;
            // dayOfWeek: accept 7 as Sunday alias in ranges (e.g. 5-7 = Fri,Sat,Sun → [5,6,0])
            var isDow = min === 0 && max === 6;
            var effMax = isDow ? 7 : max;
            if (lo > hi || step < 1 || lo < min || hi > effMax)
                return null;
            for (var i = lo; i <= hi; i += step) {
                out.add(isDow && i === 7 ? 0 : i);
            }
            continue;
        }
        // plain N
        var singleMatch = part.match(/^\d+$/);
        if (singleMatch) {
            var n = parseInt(part, 10);
            // dayOfWeek: accept 7 as Sunday alias → 0
            if (min === 0 && max === 6 && n === 7)
                n = 0;
            if (n < min || n > max)
                return null;
            out.add(n);
            continue;
        }
        return null;
    }
    if (out.size === 0)
        return null;
    return Array.from(out).sort(function (a, b) { return a - b; });
}
/**
 * Parse a 5-field cron expression into expanded number arrays.
 * Returns null if invalid or unsupported syntax.
 */
function parseCronExpression(expr) {
    var parts = expr.trim().split(/\s+/);
    if (parts.length !== 5)
        return null;
    var expanded = [];
    for (var i = 0; i < 5; i++) {
        var result = expandField(parts[i], FIELD_RANGES[i]);
        if (!result)
            return null;
        expanded.push(result);
    }
    return {
        minute: expanded[0],
        hour: expanded[1],
        dayOfMonth: expanded[2],
        month: expanded[3],
        dayOfWeek: expanded[4],
    };
}
/**
 * Compute the next Date strictly after `from` that matches the cron fields,
 * using the process's local timezone. Walks forward minute-by-minute. Bounded
 * at 366 days; returns null if no match (impossible for valid cron, but
 * satisfies the type).
 *
 * Standard cron semantics: when both dayOfMonth and dayOfWeek are constrained
 * (neither is the full range), a date matches if EITHER matches.
 *
 * DST: fixed-hour crons targeting a spring-forward gap (e.g. `30 2 * * *`
 * in a US timezone) skip the transition day — the gap hour never appears
 * in local time, so the hour-set check fails and the loop moves on.
 * Wildcard-hour crons (`30 * * * *`) fire at the first valid minute after
 * the gap. Fall-back repeats fire once (the step-forward logic jumps past
 * the second occurrence). This matches vixie-cron behavior.
 */
function computeNextCronRun(fields, from) {
    var minuteSet = new Set(fields.minute);
    var hourSet = new Set(fields.hour);
    var domSet = new Set(fields.dayOfMonth);
    var monthSet = new Set(fields.month);
    var dowSet = new Set(fields.dayOfWeek);
    // Is the field wildcarded (full range)?
    var domWild = fields.dayOfMonth.length === 31;
    var dowWild = fields.dayOfWeek.length === 7;
    // Round up to the next whole minute (strictly after `from`)
    var t = new Date(from.getTime());
    t.setSeconds(0, 0);
    t.setMinutes(t.getMinutes() + 1);
    var maxIter = 366 * 24 * 60;
    for (var i = 0; i < maxIter; i++) {
        var month = t.getMonth() + 1;
        if (!monthSet.has(month)) {
            // Jump to start of next month
            t.setMonth(t.getMonth() + 1, 1);
            t.setHours(0, 0, 0, 0);
            continue;
        }
        var dom = t.getDate();
        var dow = t.getDay();
        // When both dom/dow are constrained, either match is sufficient (OR semantics)
        var dayMatches = domWild && dowWild
            ? true
            : domWild
                ? dowSet.has(dow)
                : dowWild
                    ? domSet.has(dom)
                    : domSet.has(dom) || dowSet.has(dow);
        if (!dayMatches) {
            // Jump to start of next day
            t.setDate(t.getDate() + 1);
            t.setHours(0, 0, 0, 0);
            continue;
        }
        if (!hourSet.has(t.getHours())) {
            t.setHours(t.getHours() + 1, 0, 0, 0);
            continue;
        }
        if (!minuteSet.has(t.getMinutes())) {
            t.setMinutes(t.getMinutes() + 1);
            continue;
        }
        return t;
    }
    return null;
}
// --- cronToHuman ------------------------------------------------------------
// Intentionally narrow: covers common patterns; falls through to the raw cron
// string for anything else. The `utc` option exists for CCR remote triggers
// (agents-platform.tsx), which run on servers and always use UTC cron strings
// — that path translates UTC→local for display and needs midnight-crossing
// logic for the weekday case. Local scheduled tasks (the default) need neither.
var DAY_NAMES = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];
function formatLocalTime(minute, hour) {
    // January 1 — no DST gap anywhere. Using `new Date()` (today) would roll
    // 2am→3am on the one spring-forward day per year.
    var d = new Date(2000, 0, 1, hour, minute);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
function formatUtcTimeAsLocal(minute, hour) {
    // Create a date in UTC and format in user's local timezone
    var d = new Date();
    d.setUTCHours(hour, minute, 0, 0);
    return d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
    });
}
function cronToHuman(cron, opts) {
    var _a;
    var utc = (_a = opts === null || opts === void 0 ? void 0 : opts.utc) !== null && _a !== void 0 ? _a : false;
    var parts = cron.trim().split(/\s+/);
    if (parts.length !== 5)
        return cron;
    var _b = parts, minute = _b[0], hour = _b[1], dayOfMonth = _b[2], month = _b[3], dayOfWeek = _b[4];
    // Every N minutes: step/N * * * *
    var everyMinMatch = minute.match(/^\*\/(\d+)$/);
    if (everyMinMatch &&
        hour === '*' &&
        dayOfMonth === '*' &&
        month === '*' &&
        dayOfWeek === '*') {
        var n = parseInt(everyMinMatch[1], 10);
        return n === 1 ? 'Every minute' : "Every ".concat(n, " minutes");
    }
    // Every hour: 0 * * * *
    if (minute.match(/^\d+$/) &&
        hour === '*' &&
        dayOfMonth === '*' &&
        month === '*' &&
        dayOfWeek === '*') {
        var m_1 = parseInt(minute, 10);
        if (m_1 === 0)
            return 'Every hour';
        return "Every hour at :".concat(m_1.toString().padStart(2, '0'));
    }
    // Every N hours: 0 step/N * * *
    var everyHourMatch = hour.match(/^\*\/(\d+)$/);
    if (minute.match(/^\d+$/) &&
        everyHourMatch &&
        dayOfMonth === '*' &&
        month === '*' &&
        dayOfWeek === '*') {
        var n = parseInt(everyHourMatch[1], 10);
        var m_2 = parseInt(minute, 10);
        var suffix = m_2 === 0 ? '' : " at :".concat(m_2.toString().padStart(2, '0'));
        return n === 1 ? "Every hour".concat(suffix) : "Every ".concat(n, " hours").concat(suffix);
    }
    // --- Remaining cases reference hour+minute: branch on utc ----------------
    if (!minute.match(/^\d+$/) || !hour.match(/^\d+$/))
        return cron;
    var m = parseInt(minute, 10);
    var h = parseInt(hour, 10);
    var fmtTime = utc ? formatUtcTimeAsLocal : formatLocalTime;
    // Daily at specific time: M H * * *
    if (dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
        return "Every day at ".concat(fmtTime(m, h));
    }
    // Specific day of week: M H * * D
    if (dayOfMonth === '*' && month === '*' && dayOfWeek.match(/^\d$/)) {
        var dayIndex = parseInt(dayOfWeek, 10) % 7; // normalize 7 (Sunday alias) -> 0
        var dayName = void 0;
        if (utc) {
            // UTC day+time may land on a different local day (midnight crossing).
            // Compute the actual local weekday by constructing the UTC instant.
            var ref = new Date();
            var daysToAdd = (dayIndex - ref.getUTCDay() + 7) % 7;
            ref.setUTCDate(ref.getUTCDate() + daysToAdd);
            ref.setUTCHours(h, m, 0, 0);
            dayName = DAY_NAMES[ref.getDay()];
        }
        else {
            dayName = DAY_NAMES[dayIndex];
        }
        if (dayName)
            return "Every ".concat(dayName, " at ").concat(fmtTime(m, h));
    }
    // Weekdays: M H * * 1-5
    if (dayOfMonth === '*' && month === '*' && dayOfWeek === '1-5') {
        return "Weekdays at ".concat(fmtTime(m, h));
    }
    return cron;
}
