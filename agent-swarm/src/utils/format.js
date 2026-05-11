"use strict";
// Pure display formatters — leaf-safe (no Ink). Width-aware truncation lives in ./truncate.ts.
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
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
exports.wrapText = exports.truncateToWidthNoEllipsis = exports.truncateToWidth = exports.truncateStartToWidth = exports.truncatePathMiddle = exports.truncate = void 0;
exports.formatFileSize = formatFileSize;
exports.formatSecondsShort = formatSecondsShort;
exports.formatDuration = formatDuration;
exports.formatNumber = formatNumber;
exports.formatTokens = formatTokens;
exports.formatRelativeTime = formatRelativeTime;
exports.formatRelativeTimeAgo = formatRelativeTimeAgo;
exports.formatLogMetadata = formatLogMetadata;
exports.formatResetTime = formatResetTime;
exports.formatResetText = formatResetText;
var intl_js_1 = require("./intl.js");
/**
 * Formats a byte count to a human-readable string (KB, MB, GB).
 * @example formatFileSize(1536) → "1.5KB"
 */
function formatFileSize(sizeInBytes) {
    var kb = sizeInBytes / 1024;
    if (kb < 1) {
        return "".concat(sizeInBytes, " bytes");
    }
    if (kb < 1024) {
        return "".concat(kb.toFixed(1).replace(/\.0$/, ''), "KB");
    }
    var mb = kb / 1024;
    if (mb < 1024) {
        return "".concat(mb.toFixed(1).replace(/\.0$/, ''), "MB");
    }
    var gb = mb / 1024;
    return "".concat(gb.toFixed(1).replace(/\.0$/, ''), "GB");
}
/**
 * Formats milliseconds as seconds with 1 decimal place (e.g. `1234` → `"1.2s"`).
 * Unlike formatDuration, always keeps the decimal — use for sub-minute timings
 * where the fractional second is meaningful (TTFT, hook durations, etc.).
 */
function formatSecondsShort(ms) {
    return "".concat((ms / 1000).toFixed(1), "s");
}
function formatDuration(ms, options) {
    if (ms < 60000) {
        // Special case for 0
        if (ms === 0) {
            return '0s';
        }
        // For durations < 1s, show 1 decimal place (e.g., 0.5s)
        if (ms < 1) {
            var s_1 = (ms / 1000).toFixed(1);
            return "".concat(s_1, "s");
        }
        var s = Math.floor(ms / 1000).toString();
        return "".concat(s, "s");
    }
    var days = Math.floor(ms / 86400000);
    var hours = Math.floor((ms % 86400000) / 3600000);
    var minutes = Math.floor((ms % 3600000) / 60000);
    var seconds = Math.round((ms % 60000) / 1000);
    // Handle rounding carry-over (e.g., 59.5s rounds to 60s)
    if (seconds === 60) {
        seconds = 0;
        minutes++;
    }
    if (minutes === 60) {
        minutes = 0;
        hours++;
    }
    if (hours === 24) {
        hours = 0;
        days++;
    }
    var hide = options === null || options === void 0 ? void 0 : options.hideTrailingZeros;
    if (options === null || options === void 0 ? void 0 : options.mostSignificantOnly) {
        if (days > 0)
            return "".concat(days, "d");
        if (hours > 0)
            return "".concat(hours, "h");
        if (minutes > 0)
            return "".concat(minutes, "m");
        return "".concat(seconds, "s");
    }
    if (days > 0) {
        if (hide && hours === 0 && minutes === 0)
            return "".concat(days, "d");
        if (hide && minutes === 0)
            return "".concat(days, "d ").concat(hours, "h");
        return "".concat(days, "d ").concat(hours, "h ").concat(minutes, "m");
    }
    if (hours > 0) {
        if (hide && minutes === 0 && seconds === 0)
            return "".concat(hours, "h");
        if (hide && seconds === 0)
            return "".concat(hours, "h ").concat(minutes, "m");
        return "".concat(hours, "h ").concat(minutes, "m ").concat(seconds, "s");
    }
    if (minutes > 0) {
        if (hide && seconds === 0)
            return "".concat(minutes, "m");
        return "".concat(minutes, "m ").concat(seconds, "s");
    }
    return "".concat(seconds, "s");
}
// `new Intl.NumberFormat` is expensive, so cache formatters for reuse
var numberFormatterForConsistentDecimals = null;
var numberFormatterForInconsistentDecimals = null;
var getNumberFormatter = function (useConsistentDecimals) {
    if (useConsistentDecimals) {
        if (!numberFormatterForConsistentDecimals) {
            numberFormatterForConsistentDecimals = new Intl.NumberFormat('en-US', {
                notation: 'compact',
                maximumFractionDigits: 1,
                minimumFractionDigits: 1,
            });
        }
        return numberFormatterForConsistentDecimals;
    }
    else {
        if (!numberFormatterForInconsistentDecimals) {
            numberFormatterForInconsistentDecimals = new Intl.NumberFormat('en-US', {
                notation: 'compact',
                maximumFractionDigits: 1,
                minimumFractionDigits: 0,
            });
        }
        return numberFormatterForInconsistentDecimals;
    }
};
function formatNumber(number) {
    // Only use minimumFractionDigits for numbers that will be shown in compact notation
    var shouldUseConsistentDecimals = number >= 1000;
    return getNumberFormatter(shouldUseConsistentDecimals)
        .format(number) // eg. "1321" => "1.3K", "900" => "900"
        .toLowerCase(); // eg. "1.3K" => "1.3k", "1.0K" => "1.0k"
}
function formatTokens(count) {
    return formatNumber(count).replace('.0', '');
}
function formatRelativeTime(date, options) {
    if (options === void 0) { options = {}; }
    var _a = options.style, style = _a === void 0 ? 'narrow' : _a, _b = options.numeric, numeric = _b === void 0 ? 'always' : _b, _c = options.now, now = _c === void 0 ? new Date() : _c;
    var diffInMs = date.getTime() - now.getTime();
    // Use Math.trunc to truncate towards zero for both positive and negative values
    var diffInSeconds = Math.trunc(diffInMs / 1000);
    // Define time intervals with custom short units
    var intervals = [
        { unit: 'year', seconds: 31536000, shortUnit: 'y' },
        { unit: 'month', seconds: 2592000, shortUnit: 'mo' },
        { unit: 'week', seconds: 604800, shortUnit: 'w' },
        { unit: 'day', seconds: 86400, shortUnit: 'd' },
        { unit: 'hour', seconds: 3600, shortUnit: 'h' },
        { unit: 'minute', seconds: 60, shortUnit: 'm' },
        { unit: 'second', seconds: 1, shortUnit: 's' },
    ];
    // Find the appropriate unit
    for (var _i = 0, intervals_1 = intervals; _i < intervals_1.length; _i++) {
        var _d = intervals_1[_i], unit = _d.unit, intervalSeconds = _d.seconds, shortUnit = _d.shortUnit;
        if (Math.abs(diffInSeconds) >= intervalSeconds) {
            var value = Math.trunc(diffInSeconds / intervalSeconds);
            // For short style, use custom format
            if (style === 'narrow') {
                return diffInSeconds < 0
                    ? "".concat(Math.abs(value)).concat(shortUnit, " ago")
                    : "in ".concat(value).concat(shortUnit);
            }
            // For days and longer, use long style regardless of the style parameter
            return (0, intl_js_1.getRelativeTimeFormat)('long', numeric).format(value, unit);
        }
    }
    // For values less than 1 second
    if (style === 'narrow') {
        return diffInSeconds <= 0 ? '0s ago' : 'in 0s';
    }
    return (0, intl_js_1.getRelativeTimeFormat)(style, numeric).format(0, 'second');
}
function formatRelativeTimeAgo(date, options) {
    if (options === void 0) { options = {}; }
    var _a = options.now, now = _a === void 0 ? new Date() : _a, restOptions = __rest(options, ["now"]);
    if (date > now) {
        // For future dates, just return the relative time without "ago"
        return formatRelativeTime(date, __assign(__assign({}, restOptions), { now: now }));
    }
    // For past dates, force numeric: 'always' to ensure we get "X units ago"
    return formatRelativeTime(date, __assign(__assign({}, restOptions), { numeric: 'always', now: now }));
}
/**
 * Formats log metadata for display (time, size or message count, branch, tag, PR)
 */
function formatLogMetadata(log) {
    var sizeOrCount = log.fileSize !== undefined
        ? formatFileSize(log.fileSize)
        : "".concat(log.messageCount, " messages");
    var parts = __spreadArray(__spreadArray([
        formatRelativeTimeAgo(log.modified, { style: 'short' })
    ], (log.gitBranch ? [log.gitBranch] : []), true), [
        sizeOrCount,
    ], false);
    if (log.tag) {
        parts.push("#".concat(log.tag));
    }
    if (log.agentSetting) {
        parts.push("@".concat(log.agentSetting));
    }
    if (log.prNumber) {
        parts.push(log.prRepository
            ? "".concat(log.prRepository, "#").concat(log.prNumber)
            : "#".concat(log.prNumber));
    }
    return parts.join(' · ');
}
function formatResetTime(timestampInSeconds, showTimezone, showTime) {
    if (showTimezone === void 0) { showTimezone = false; }
    if (showTime === void 0) { showTime = true; }
    if (!timestampInSeconds)
        return undefined;
    var date = new Date(timestampInSeconds * 1000);
    var now = new Date();
    var minutes = date.getMinutes();
    // Calculate hours until reset
    var hoursUntilReset = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
    // If reset is more than 24 hours away, show the date as well
    if (hoursUntilReset > 24) {
        // Show date and time for resets more than a day away
        var dateOptions = {
            month: 'short',
            day: 'numeric',
            hour: showTime ? 'numeric' : undefined,
            minute: !showTime || minutes === 0 ? undefined : '2-digit',
            hour12: showTime ? true : undefined,
        };
        // Add year if it's not the current year
        if (date.getFullYear() !== now.getFullYear()) {
            dateOptions.year = 'numeric';
        }
        var dateString = date.toLocaleString('en-US', dateOptions);
        // Remove the space before AM/PM and make it lowercase
        return (dateString.replace(/ ([AP]M)/i, function (_match, ampm) { return ampm.toLowerCase(); }) +
            (showTimezone ? " (".concat((0, intl_js_1.getTimeZone)(), ")") : ''));
    }
    // For resets within 24 hours, show just the time (existing behavior)
    var timeString = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: minutes === 0 ? undefined : '2-digit',
        hour12: true,
    });
    // Remove the space before AM/PM and make it lowercase, then add timezone
    return (timeString.replace(/ ([AP]M)/i, function (_match, ampm) { return ampm.toLowerCase(); }) +
        (showTimezone ? " (".concat((0, intl_js_1.getTimeZone)(), ")") : ''));
}
function formatResetText(resetsAt, showTimezone, showTime) {
    if (showTimezone === void 0) { showTimezone = false; }
    if (showTime === void 0) { showTime = true; }
    var dt = new Date(resetsAt);
    return "".concat(formatResetTime(Math.floor(dt.getTime() / 1000), showTimezone, showTime));
}
// Back-compat: truncate helpers moved to ./truncate.ts (needs ink/stringWidth)
var truncate_js_1 = require("./truncate.js");
Object.defineProperty(exports, "truncate", { enumerable: true, get: function () { return truncate_js_1.truncate; } });
Object.defineProperty(exports, "truncatePathMiddle", { enumerable: true, get: function () { return truncate_js_1.truncatePathMiddle; } });
Object.defineProperty(exports, "truncateStartToWidth", { enumerable: true, get: function () { return truncate_js_1.truncateStartToWidth; } });
Object.defineProperty(exports, "truncateToWidth", { enumerable: true, get: function () { return truncate_js_1.truncateToWidth; } });
Object.defineProperty(exports, "truncateToWidthNoEllipsis", { enumerable: true, get: function () { return truncate_js_1.truncateToWidthNoEllipsis; } });
Object.defineProperty(exports, "wrapText", { enumerable: true, get: function () { return truncate_js_1.wrapText; } });
