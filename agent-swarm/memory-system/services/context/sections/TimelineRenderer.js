"use strict";
/**
 * TimelineRenderer - Renders the chronological timeline of observations and summaries
 *
 * Handles day grouping and rendering. In markdown (LLM) mode, uses flat compact lines.
 * In color (terminal) mode, uses file grouping with visual formatting.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupTimelineByDay = groupTimelineByDay;
exports.renderDayTimeline = renderDayTimeline;
exports.renderTimeline = renderTimeline;
var timeline_formatting_js_1 = require("../../../shared/timeline-formatting.js");
var Markdown = require("../formatters/MarkdownFormatter.js");
var Color = require("../formatters/ColorFormatter.js");
/**
 * Group timeline items by day
 */
function groupTimelineByDay(timeline) {
    var itemsByDay = new Map();
    for (var _i = 0, timeline_1 = timeline; _i < timeline_1.length; _i++) {
        var item = timeline_1[_i];
        var itemDate = item.type === 'observation' ? item.data.created_at : item.data.displayTime;
        var day = (0, timeline_formatting_js_1.formatDate)(itemDate);
        if (!itemsByDay.has(day)) {
            itemsByDay.set(day, []);
        }
        itemsByDay.get(day).push(item);
    }
    // Sort days chronologically
    var sortedEntries = Array.from(itemsByDay.entries()).sort(function (a, b) {
        var aDate = new Date(a[0]).getTime();
        var bDate = new Date(b[0]).getTime();
        return aDate - bDate;
    });
    return new Map(sortedEntries);
}
/**
 * Get detail field content for full observation display
 */
function getDetailField(obs, config) {
    if (config.fullObservationField === 'narrative') {
        return obs.narrative;
    }
    return obs.facts ? (0, timeline_formatting_js_1.parseJsonArray)(obs.facts).join('\n') : null;
}
/**
 * Render a single day's timeline items (markdown/LLM mode - flat compact lines)
 */
function renderDayTimelineMarkdown(day, dayItems, fullObservationIds, config) {
    var output = [];
    output.push.apply(output, Markdown.renderMarkdownDayHeader(day));
    var lastTime = '';
    for (var _i = 0, dayItems_1 = dayItems; _i < dayItems_1.length; _i++) {
        var item = dayItems_1[_i];
        if (item.type === 'summary') {
            lastTime = '';
            var summary = item.data;
            var formattedTime = (0, timeline_formatting_js_1.formatDateTime)(summary.displayTime);
            output.push.apply(output, Markdown.renderMarkdownSummaryItem(summary, formattedTime));
        }
        else {
            var obs = item.data;
            var time = (0, timeline_formatting_js_1.formatTime)(obs.created_at);
            var showTime = time !== lastTime;
            var timeDisplay = showTime ? time : '';
            lastTime = time;
            var shouldShowFull = fullObservationIds.has(obs.id);
            if (shouldShowFull) {
                var detailField = getDetailField(obs, config);
                output.push.apply(output, Markdown.renderMarkdownFullObservation(obs, timeDisplay, detailField, config));
            }
            else {
                output.push(Markdown.renderMarkdownTableRow(obs, timeDisplay, config));
            }
        }
    }
    return output;
}
/**
 * Render a single day's timeline items (color/terminal mode - file grouped with tables)
 */
function renderDayTimelineColor(day, dayItems, fullObservationIds, config, cwd) {
    var output = [];
    output.push.apply(output, Color.renderColorDayHeader(day));
    var currentFile = null;
    var lastTime = '';
    for (var _i = 0, dayItems_2 = dayItems; _i < dayItems_2.length; _i++) {
        var item = dayItems_2[_i];
        if (item.type === 'summary') {
            currentFile = null;
            lastTime = '';
            var summary = item.data;
            var formattedTime = (0, timeline_formatting_js_1.formatDateTime)(summary.displayTime);
            output.push.apply(output, Color.renderColorSummaryItem(summary, formattedTime));
        }
        else {
            var obs = item.data;
            var file = (0, timeline_formatting_js_1.extractFirstFile)(obs.files_modified, cwd, obs.files_read);
            var time = (0, timeline_formatting_js_1.formatTime)(obs.created_at);
            var showTime = time !== lastTime;
            lastTime = time;
            var shouldShowFull = fullObservationIds.has(obs.id);
            // Check if we need a new file section
            if (file !== currentFile) {
                output.push.apply(output, Color.renderColorFileHeader(file));
                currentFile = file;
            }
            if (shouldShowFull) {
                var detailField = getDetailField(obs, config);
                output.push.apply(output, Color.renderColorFullObservation(obs, time, showTime, detailField, config));
            }
            else {
                output.push(Color.renderColorTableRow(obs, time, showTime, config));
            }
        }
    }
    output.push('');
    return output;
}
/**
 * Render a single day's timeline items
 */
function renderDayTimeline(day, dayItems, fullObservationIds, config, cwd, useColors) {
    if (useColors) {
        return renderDayTimelineColor(day, dayItems, fullObservationIds, config, cwd);
    }
    return renderDayTimelineMarkdown(day, dayItems, fullObservationIds, config);
}
/**
 * Render the complete timeline
 */
function renderTimeline(timeline, fullObservationIds, config, cwd, useColors) {
    var output = [];
    var itemsByDay = groupTimelineByDay(timeline);
    for (var _i = 0, itemsByDay_1 = itemsByDay; _i < itemsByDay_1.length; _i++) {
        var _a = itemsByDay_1[_i], day = _a[0], dayItems = _a[1];
        output.push.apply(output, renderDayTimeline(day, dayItems, fullObservationIds, config, cwd, useColors));
    }
    return output;
}
