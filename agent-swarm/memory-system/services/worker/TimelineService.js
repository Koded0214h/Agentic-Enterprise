"use strict";
/**
 * TimelineService - Handles timeline building, filtering, and formatting
 * Extracted from mcp-server.ts to follow worker service organization pattern
 */
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
exports.TimelineService = void 0;
var ModeManager_js_1 = require("../domain/ModeManager.js");
var TimelineService = /** @class */ (function () {
    function TimelineService() {
    }
    /**
     * Build timeline items from observations, sessions, and prompts
     */
    TimelineService.prototype.buildTimeline = function (data) {
        var items = __spreadArray(__spreadArray(__spreadArray([], data.observations.map(function (obs) { return ({ type: 'observation', data: obs, epoch: obs.created_at_epoch }); }), true), data.sessions.map(function (sess) { return ({ type: 'session', data: sess, epoch: sess.created_at_epoch }); }), true), data.prompts.map(function (prompt) { return ({ type: 'prompt', data: prompt, epoch: prompt.created_at_epoch }); }), true);
        items.sort(function (a, b) { return a.epoch - b.epoch; });
        return items;
    };
    /**
     * Filter timeline items to respect depth_before/depth_after window around anchor
     */
    TimelineService.prototype.filterByDepth = function (items, anchorId, anchorEpoch, depth_before, depth_after) {
        if (items.length === 0)
            return items;
        var anchorIndex = -1;
        if (typeof anchorId === 'number') {
            anchorIndex = items.findIndex(function (item) { return item.type === 'observation' && item.data.id === anchorId; });
        }
        else if (typeof anchorId === 'string' && anchorId.startsWith('S')) {
            var sessionNum_1 = parseInt(anchorId.slice(1), 10);
            anchorIndex = items.findIndex(function (item) { return item.type === 'session' && item.data.id === sessionNum_1; });
        }
        else {
            // Timestamp anchor - find closest item
            anchorIndex = items.findIndex(function (item) { return item.epoch >= anchorEpoch; });
            if (anchorIndex === -1)
                anchorIndex = items.length - 1;
        }
        if (anchorIndex === -1)
            return items;
        var startIndex = Math.max(0, anchorIndex - depth_before);
        var endIndex = Math.min(items.length, anchorIndex + depth_after + 1);
        return items.slice(startIndex, endIndex);
    };
    /**
     * Format timeline items as markdown with grouped days and tables
     */
    TimelineService.prototype.formatTimeline = function (items, anchorId, query, depth_before, depth_after) {
        if (items.length === 0) {
            return query
                ? "Found observation matching \"".concat(query, "\", but no timeline context available.")
                : 'No timeline items found';
        }
        var lines = [];
        // Header
        if (query && anchorId) {
            var anchorObs = items.find(function (item) { return item.type === 'observation' && item.data.id === anchorId; });
            var anchorTitle = anchorObs ? (anchorObs.data.title || 'Untitled') : 'Unknown';
            lines.push("# Timeline for query: \"".concat(query, "\""));
            lines.push("**Anchor:** Observation #".concat(anchorId, " - ").concat(anchorTitle));
        }
        else if (anchorId) {
            lines.push("# Timeline around anchor: ".concat(anchorId));
        }
        else {
            lines.push("# Timeline");
        }
        if (depth_before !== undefined && depth_after !== undefined) {
            lines.push("**Window:** ".concat(depth_before, " records before \u2192 ").concat(depth_after, " records after | **Items:** ").concat(items.length));
        }
        else {
            lines.push("**Items:** ".concat(items.length));
        }
        lines.push('');
        // Legend
        lines.push("**Legend:** \uD83C\uDFAF session-request | \uD83D\uDD34 bugfix | \uD83D\uDFE3 feature | \uD83D\uDD04 refactor | \u2705 change | \uD83D\uDD35 discovery | \uD83E\uDDE0 decision");
        lines.push('');
        // Group by day
        var dayMap = new Map();
        for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
            var item = items_1[_i];
            var day = this.formatDate(item.epoch);
            if (!dayMap.has(day)) {
                dayMap.set(day, []);
            }
            dayMap.get(day).push(item);
        }
        // Sort days chronologically
        var sortedDays = Array.from(dayMap.entries()).sort(function (a, b) {
            var aDate = new Date(a[0]).getTime();
            var bDate = new Date(b[0]).getTime();
            return aDate - bDate;
        });
        // Render each day
        for (var _a = 0, sortedDays_1 = sortedDays; _a < sortedDays_1.length; _a++) {
            var _b = sortedDays_1[_a], day = _b[0], dayItems = _b[1];
            lines.push("### ".concat(day));
            lines.push('');
            var currentFile = null;
            var lastTime = '';
            var tableOpen = false;
            for (var _c = 0, dayItems_1 = dayItems; _c < dayItems_1.length; _c++) {
                var item = dayItems_1[_c];
                var isAnchor = ((typeof anchorId === 'number' && item.type === 'observation' && item.data.id === anchorId) ||
                    (typeof anchorId === 'string' && anchorId.startsWith('S') && item.type === 'session' && "S".concat(item.data.id) === anchorId));
                if (item.type === 'session') {
                    if (tableOpen) {
                        lines.push('');
                        tableOpen = false;
                        currentFile = null;
                        lastTime = '';
                    }
                    var sess = item.data;
                    var title = sess.request || 'Session summary';
                    var marker = isAnchor ? ' ← **ANCHOR**' : '';
                    lines.push("**\uD83C\uDFAF #S".concat(sess.id, "** ").concat(title, " (").concat(this.formatDateTime(item.epoch), ")").concat(marker));
                    lines.push('');
                }
                else if (item.type === 'prompt') {
                    if (tableOpen) {
                        lines.push('');
                        tableOpen = false;
                        currentFile = null;
                        lastTime = '';
                    }
                    var prompt_1 = item.data;
                    var truncated = prompt_1.prompt_text.length > 100 ? prompt_1.prompt_text.substring(0, 100) + '...' : prompt_1.prompt_text;
                    lines.push("**\uD83D\uDCAC User Prompt #".concat(prompt_1.prompt_number, "** (").concat(this.formatDateTime(item.epoch), ")"));
                    lines.push("> ".concat(truncated));
                    lines.push('');
                }
                else if (item.type === 'observation') {
                    var obs = item.data;
                    var file = 'General';
                    if (file !== currentFile) {
                        if (tableOpen) {
                            lines.push('');
                        }
                        lines.push("**".concat(file, "**"));
                        lines.push("| ID | Time | T | Title | Tokens |");
                        lines.push("|----|------|---|-------|--------|");
                        currentFile = file;
                        tableOpen = true;
                        lastTime = '';
                    }
                    var icon = this.getTypeIcon(obs.type);
                    var time = this.formatTime(item.epoch);
                    var title = obs.title || 'Untitled';
                    var tokens = this.estimateTokens(obs.narrative);
                    var showTime = time !== lastTime;
                    var timeDisplay = showTime ? time : '″';
                    lastTime = time;
                    var anchorMarker = isAnchor ? ' ← **ANCHOR**' : '';
                    lines.push("| #".concat(obs.id, " | ").concat(timeDisplay, " | ").concat(icon, " | ").concat(title).concat(anchorMarker, " | ~").concat(tokens, " |"));
                }
            }
            if (tableOpen) {
                lines.push('');
            }
        }
        return lines.join('\n');
    };
    /**
     * Get icon for observation type
     */
    TimelineService.prototype.getTypeIcon = function (type) {
        return ModeManager_js_1.ModeManager.getInstance().getTypeIcon(type);
    };
    /**
     * Format date for grouping (e.g., "Dec 7, 2025")
     */
    TimelineService.prototype.formatDate = function (epochMs) {
        var date = new Date(epochMs);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };
    /**
     * Format time (e.g., "6:30 PM")
     */
    TimelineService.prototype.formatTime = function (epochMs) {
        var date = new Date(epochMs);
        return date.toLocaleString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };
    /**
     * Format date and time (e.g., "Dec 7, 6:30 PM")
     */
    TimelineService.prototype.formatDateTime = function (epochMs) {
        var date = new Date(epochMs);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };
    /**
     * Estimate tokens from text length (~4 chars per token)
     */
    TimelineService.prototype.estimateTokens = function (text) {
        if (!text)
            return 0;
        return Math.ceil(text.length / 4);
    };
    return TimelineService;
}());
exports.TimelineService = TimelineService;
