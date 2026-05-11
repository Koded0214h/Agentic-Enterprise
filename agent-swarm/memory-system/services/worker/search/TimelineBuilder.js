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
exports.TimelineBuilder = void 0;
var ModeManager_js_1 = require("../../domain/ModeManager.js");
var timeline_formatting_js_1 = require("../../../shared/timeline-formatting.js");
var TimelineBuilder = /** @class */ (function () {
    function TimelineBuilder() {
    }
    /**
     * Build timeline items from raw data
     */
    TimelineBuilder.prototype.buildTimeline = function (data) {
        var items = __spreadArray(__spreadArray(__spreadArray([], data.observations.map(function (obs) { return ({
            type: 'observation',
            data: obs,
            epoch: obs.created_at_epoch
        }); }), true), data.sessions.map(function (sess) { return ({
            type: 'session',
            data: sess,
            epoch: sess.created_at_epoch
        }); }), true), data.prompts.map(function (prompt) { return ({
            type: 'prompt',
            data: prompt,
            epoch: prompt.created_at_epoch
        }); }), true);
        // Sort chronologically
        items.sort(function (a, b) { return a.epoch - b.epoch; });
        return items;
    };
    /**
     * Filter timeline items to respect depth window around anchor
     */
    TimelineBuilder.prototype.filterByDepth = function (items, anchorId, anchorEpoch, depthBefore, depthAfter) {
        if (items.length === 0)
            return items;
        var anchorIndex = this.findAnchorIndex(items, anchorId, anchorEpoch);
        if (anchorIndex === -1)
            return items;
        var startIndex = Math.max(0, anchorIndex - depthBefore);
        var endIndex = Math.min(items.length, anchorIndex + depthAfter + 1);
        return items.slice(startIndex, endIndex);
    };
    /**
     * Find anchor index in timeline items
     */
    TimelineBuilder.prototype.findAnchorIndex = function (items, anchorId, anchorEpoch) {
        if (typeof anchorId === 'number') {
            // Observation ID
            return items.findIndex(function (item) { return item.type === 'observation' &&
                item.data.id === anchorId; });
        }
        if (typeof anchorId === 'string' && anchorId.startsWith('S')) {
            // Session ID
            var sessionNum_1 = parseInt(anchorId.slice(1), 10);
            return items.findIndex(function (item) { return item.type === 'session' &&
                item.data.id === sessionNum_1; });
        }
        // Timestamp anchor - find closest item
        var index = items.findIndex(function (item) { return item.epoch >= anchorEpoch; });
        return index === -1 ? items.length - 1 : index;
    };
    /**
     * Format timeline as markdown
     */
    TimelineBuilder.prototype.formatTimeline = function (items, anchorId, options) {
        if (options === void 0) { options = {}; }
        var query = options.query, depthBefore = options.depthBefore, depthAfter = options.depthAfter, _a = options.cwd, cwd = _a === void 0 ? process.cwd() : _a;
        if (items.length === 0) {
            return query
                ? "Found observation matching \"".concat(query, "\", but no timeline context available.")
                : 'No timeline items found';
        }
        var lines = [];
        // Header
        if (query && anchorId) {
            var anchorObs = items.find(function (item) { return item.type === 'observation' &&
                item.data.id === anchorId; });
            var anchorTitle = anchorObs
                ? (anchorObs.data.title || 'Untitled')
                : 'Unknown';
            lines.push("# Timeline for query: \"".concat(query, "\""));
            lines.push("**Anchor:** Observation #".concat(anchorId, " - ").concat(anchorTitle));
        }
        else if (anchorId) {
            lines.push("# Timeline around anchor: ".concat(anchorId));
        }
        else {
            lines.push("# Timeline");
        }
        if (depthBefore !== undefined && depthAfter !== undefined) {
            lines.push("**Window:** ".concat(depthBefore, " records before -> ").concat(depthAfter, " records after | **Items:** ").concat(items.length));
        }
        else {
            lines.push("**Items:** ".concat(items.length));
        }
        lines.push('');
        // Group by day
        var dayMap = this.groupByDay(items);
        var sortedDays = this.sortDaysChronologically(dayMap);
        // Render each day
        for (var _i = 0, sortedDays_1 = sortedDays; _i < sortedDays_1.length; _i++) {
            var _b = sortedDays_1[_i], day = _b[0], dayItems = _b[1];
            lines.push("### ".concat(day));
            lines.push('');
            var currentFile = null;
            var lastTime = '';
            var tableOpen = false;
            for (var _c = 0, dayItems_1 = dayItems; _c < dayItems_1.length; _c++) {
                var item = dayItems_1[_c];
                var isAnchor = this.isAnchorItem(item, anchorId);
                if (item.type === 'session') {
                    // Close any open table
                    if (tableOpen) {
                        lines.push('');
                        tableOpen = false;
                        currentFile = null;
                        lastTime = '';
                    }
                    var sess = item.data;
                    var title = sess.request || 'Session summary';
                    var marker = isAnchor ? ' <- **ANCHOR**' : '';
                    lines.push("**\uD83C\uDFAF #S".concat(sess.id, "** ").concat(title, " (").concat((0, timeline_formatting_js_1.formatDateTime)(item.epoch), ")").concat(marker));
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
                    var truncated = prompt_1.prompt_text.length > 100
                        ? prompt_1.prompt_text.substring(0, 100) + '...'
                        : prompt_1.prompt_text;
                    lines.push("**\uD83D\uDCAC User Prompt #".concat(prompt_1.prompt_number, "** (").concat((0, timeline_formatting_js_1.formatDateTime)(item.epoch), ")"));
                    lines.push("> ".concat(truncated));
                    lines.push('');
                }
                else if (item.type === 'observation') {
                    var obs = item.data;
                    var file = (0, timeline_formatting_js_1.extractFirstFile)(obs.files_modified, cwd, obs.files_read);
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
                    var icon = ModeManager_js_1.ModeManager.getInstance().getTypeIcon(obs.type);
                    var time = (0, timeline_formatting_js_1.formatTime)(item.epoch);
                    var title = obs.title || 'Untitled';
                    var tokens = (0, timeline_formatting_js_1.estimateTokens)(obs.narrative);
                    var showTime = time !== lastTime;
                    var timeDisplay = showTime ? time : '"';
                    lastTime = time;
                    var anchorMarker = isAnchor ? ' <- **ANCHOR**' : '';
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
     * Group timeline items by day
     */
    TimelineBuilder.prototype.groupByDay = function (items) {
        var dayMap = new Map();
        for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
            var item = items_1[_i];
            var day = (0, timeline_formatting_js_1.formatDate)(item.epoch);
            if (!dayMap.has(day)) {
                dayMap.set(day, []);
            }
            dayMap.get(day).push(item);
        }
        return dayMap;
    };
    /**
     * Sort days chronologically
     */
    TimelineBuilder.prototype.sortDaysChronologically = function (dayMap) {
        return Array.from(dayMap.entries()).sort(function (a, b) {
            var aDate = new Date(a[0]).getTime();
            var bDate = new Date(b[0]).getTime();
            return aDate - bDate;
        });
    };
    /**
     * Check if item is the anchor
     */
    TimelineBuilder.prototype.isAnchorItem = function (item, anchorId) {
        if (anchorId === null)
            return false;
        if (typeof anchorId === 'number' && item.type === 'observation') {
            return item.data.id === anchorId;
        }
        if (typeof anchorId === 'string' && anchorId.startsWith('S') && item.type === 'session') {
            return "S".concat(item.data.id) === anchorId;
        }
        return false;
    };
    return TimelineBuilder;
}());
exports.TimelineBuilder = TimelineBuilder;
