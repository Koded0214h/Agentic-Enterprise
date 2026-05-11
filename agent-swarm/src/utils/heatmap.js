"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateHeatmap = generateHeatmap;
var chalk_1 = require("chalk");
var statsCache_js_1 = require("./statsCache.js");
/**
 * Pre-calculates percentiles from activity data for use in intensity calculations
 */
function calculatePercentiles(dailyActivity) {
    var counts = dailyActivity
        .map(function (a) { return a.messageCount; })
        .filter(function (c) { return c > 0; })
        .sort(function (a, b) { return a - b; });
    if (counts.length === 0)
        return null;
    return {
        p25: counts[Math.floor(counts.length * 0.25)],
        p50: counts[Math.floor(counts.length * 0.5)],
        p75: counts[Math.floor(counts.length * 0.75)],
    };
}
/**
 * Generates a GitHub-style activity heatmap for the terminal
 */
function generateHeatmap(dailyActivity, options) {
    if (options === void 0) { options = {}; }
    var _a = options.terminalWidth, terminalWidth = _a === void 0 ? 80 : _a, _b = options.showMonthLabels, showMonthLabels = _b === void 0 ? true : _b;
    // Day labels take 4 characters ("Mon "), calculate weeks that fit
    // Cap at 52 weeks (1 year) to match GitHub style
    var dayLabelWidth = 4;
    var availableWidth = terminalWidth - dayLabelWidth;
    var width = Math.min(52, Math.max(10, availableWidth));
    // Build activity map by date
    var activityMap = new Map();
    for (var _i = 0, dailyActivity_1 = dailyActivity; _i < dailyActivity_1.length; _i++) {
        var activity = dailyActivity_1[_i];
        activityMap.set(activity.date, activity);
    }
    // Pre-calculate percentiles once for all intensity lookups
    var percentiles = calculatePercentiles(dailyActivity);
    // Calculate date range - end at today, go back N weeks
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    // Find the Sunday of the current week (start of the week containing today)
    var currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - today.getDay());
    // Go back (width - 1) weeks from the current week start
    var startDate = new Date(currentWeekStart);
    startDate.setDate(startDate.getDate() - (width - 1) * 7);
    // Generate grid (7 rows for days of week, width columns for weeks)
    // Also track which week each month starts for labels
    var grid = Array.from({ length: 7 }, function () {
        return Array(width).fill('');
    });
    var monthStarts = [];
    var lastMonth = -1;
    var currentDate = new Date(startDate);
    for (var week = 0; week < width; week++) {
        for (var day = 0; day < 7; day++) {
            // Don't show future dates
            if (currentDate > today) {
                grid[day][week] = ' ';
                currentDate.setDate(currentDate.getDate() + 1);
                continue;
            }
            var dateStr = (0, statsCache_js_1.toDateString)(currentDate);
            var activity = activityMap.get(dateStr);
            // Track month changes (on day 0 = Sunday of each week)
            if (day === 0) {
                var month = currentDate.getMonth();
                if (month !== lastMonth) {
                    monthStarts.push({ month: month, week: week });
                    lastMonth = month;
                }
            }
            // Determine intensity level based on message count
            var intensity = getIntensity((activity === null || activity === void 0 ? void 0 : activity.messageCount) || 0, percentiles);
            grid[day][week] = getHeatmapChar(intensity);
            currentDate.setDate(currentDate.getDate() + 1);
        }
    }
    // Build output
    var lines = [];
    // Month labels - evenly spaced across the grid
    if (showMonthLabels) {
        var monthNames_1 = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ];
        // Build label line with fixed-width month labels
        var uniqueMonths = monthStarts.map(function (m) { return m.month; });
        var labelWidth_1 = Math.floor(width / Math.max(uniqueMonths.length, 1));
        var monthLabels = uniqueMonths
            .map(function (month) { return monthNames_1[month].padEnd(labelWidth_1); })
            .join('');
        // 4 spaces for day label column prefix
        lines.push('    ' + monthLabels);
    }
    // Day labels
    var dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    // Grid
    for (var day = 0; day < 7; day++) {
        // Only show labels for Mon, Wed, Fri
        var label = [1, 3, 5].includes(day) ? dayLabels[day].padEnd(3) : '   ';
        var row = label + ' ' + grid[day].join('');
        lines.push(row);
    }
    // Legend
    lines.push('');
    lines.push('    Less ' +
        [
            claudeOrange('░'),
            claudeOrange('▒'),
            claudeOrange('▓'),
            claudeOrange('█'),
        ].join(' ') +
        ' More');
    return lines.join('\n');
}
function getIntensity(messageCount, percentiles) {
    if (messageCount === 0 || !percentiles)
        return 0;
    if (messageCount >= percentiles.p75)
        return 4;
    if (messageCount >= percentiles.p50)
        return 3;
    if (messageCount >= percentiles.p25)
        return 2;
    return 1;
}
// Claude orange color (hex #da7756)
var claudeOrange = chalk_1.default.hex('#da7756');
function getHeatmapChar(intensity) {
    switch (intensity) {
        case 0:
            return chalk_1.default.gray('·');
        case 1:
            return claudeOrange('░');
        case 2:
            return claudeOrange('▒');
        case 3:
            return claudeOrange('▓');
        case 4:
            return claudeOrange('█');
        default:
            return chalk_1.default.gray('·');
    }
}
