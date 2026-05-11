"use strict";
/**
 * ColorFormatter - Formats context output with ANSI colors for terminal
 *
 * Handles all colored formatting for context injection (terminal display).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderColorHeader = renderColorHeader;
exports.renderColorLegend = renderColorLegend;
exports.renderColorColumnKey = renderColorColumnKey;
exports.renderColorContextIndex = renderColorContextIndex;
exports.renderColorContextEconomics = renderColorContextEconomics;
exports.renderColorDayHeader = renderColorDayHeader;
exports.renderColorFileHeader = renderColorFileHeader;
exports.renderColorTableRow = renderColorTableRow;
exports.renderColorFullObservation = renderColorFullObservation;
exports.renderColorSummaryItem = renderColorSummaryItem;
exports.renderColorSummaryField = renderColorSummaryField;
exports.renderColorPreviouslySection = renderColorPreviouslySection;
exports.renderColorFooter = renderColorFooter;
exports.renderColorEmptyState = renderColorEmptyState;
var types_js_1 = require("../types.js");
var ModeManager_js_1 = require("../../domain/ModeManager.js");
var TokenCalculator_js_1 = require("../TokenCalculator.js");
/**
 * Format current date/time for header display
 */
function formatHeaderDateTime() {
    var now = new Date();
    var date = now.toLocaleDateString('en-CA'); // YYYY-MM-DD format
    var time = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }).toLowerCase().replace(' ', '');
    var tz = now.toLocaleTimeString('en-US', { timeZoneName: 'short' }).split(' ').pop();
    return "".concat(date, " ").concat(time, " ").concat(tz);
}
/**
 * Render colored header
 */
function renderColorHeader(project) {
    return [
        '',
        "".concat(types_js_1.colors.bright).concat(types_js_1.colors.cyan, "[").concat(project, "] recent context, ").concat(formatHeaderDateTime()).concat(types_js_1.colors.reset),
        "".concat(types_js_1.colors.gray).concat('─'.repeat(60)).concat(types_js_1.colors.reset),
        ''
    ];
}
/**
 * Render colored legend
 */
function renderColorLegend() {
    var mode = ModeManager_js_1.ModeManager.getInstance().getActiveMode();
    var typeLegendItems = mode.observation_types.map(function (t) { return "".concat(t.emoji, " ").concat(t.id); }).join(' | ');
    return [
        "".concat(types_js_1.colors.dim, "Legend: session-request | ").concat(typeLegendItems).concat(types_js_1.colors.reset),
        ''
    ];
}
/**
 * Render colored column key
 */
function renderColorColumnKey() {
    return [
        "".concat(types_js_1.colors.bright, "Column Key").concat(types_js_1.colors.reset),
        "".concat(types_js_1.colors.dim, "  Read: Tokens to read this observation (cost to learn it now)").concat(types_js_1.colors.reset),
        "".concat(types_js_1.colors.dim, "  Work: Tokens spent on work that produced this record ( research, building, deciding)").concat(types_js_1.colors.reset),
        ''
    ];
}
/**
 * Render colored context index instructions
 */
function renderColorContextIndex() {
    return [
        "".concat(types_js_1.colors.dim, "Context Index: This semantic index (titles, types, files, tokens) is usually sufficient to understand past work.").concat(types_js_1.colors.reset),
        '',
        "".concat(types_js_1.colors.dim, "When you need implementation details, rationale, or debugging context:").concat(types_js_1.colors.reset),
        "".concat(types_js_1.colors.dim, "  - Fetch by ID: get_observations([IDs]) for observations visible in this index").concat(types_js_1.colors.reset),
        "".concat(types_js_1.colors.dim, "  - Search history: Use the mem-search skill for past decisions, bugs, and deeper research").concat(types_js_1.colors.reset),
        "".concat(types_js_1.colors.dim, "  - Trust this index over re-reading code for past decisions and learnings").concat(types_js_1.colors.reset),
        ''
    ];
}
/**
 * Render colored context economics
 */
function renderColorContextEconomics(economics, config) {
    var output = [];
    output.push("".concat(types_js_1.colors.bright).concat(types_js_1.colors.cyan, "Context Economics").concat(types_js_1.colors.reset));
    output.push("".concat(types_js_1.colors.dim, "  Loading: ").concat(economics.totalObservations, " observations (").concat(economics.totalReadTokens.toLocaleString(), " tokens to read)").concat(types_js_1.colors.reset));
    output.push("".concat(types_js_1.colors.dim, "  Work investment: ").concat(economics.totalDiscoveryTokens.toLocaleString(), " tokens spent on research, building, and decisions").concat(types_js_1.colors.reset));
    if (economics.totalDiscoveryTokens > 0 && (config.showSavingsAmount || config.showSavingsPercent)) {
        var savingsLine = '  Your savings: ';
        if (config.showSavingsAmount && config.showSavingsPercent) {
            savingsLine += "".concat(economics.savings.toLocaleString(), " tokens (").concat(economics.savingsPercent, "% reduction from reuse)");
        }
        else if (config.showSavingsAmount) {
            savingsLine += "".concat(economics.savings.toLocaleString(), " tokens");
        }
        else {
            savingsLine += "".concat(economics.savingsPercent, "% reduction from reuse");
        }
        output.push("".concat(types_js_1.colors.green).concat(savingsLine).concat(types_js_1.colors.reset));
    }
    output.push('');
    return output;
}
/**
 * Render colored day header
 */
function renderColorDayHeader(day) {
    return [
        "".concat(types_js_1.colors.bright).concat(types_js_1.colors.cyan).concat(day).concat(types_js_1.colors.reset),
        ''
    ];
}
/**
 * Render colored file header
 */
function renderColorFileHeader(file) {
    return [
        "".concat(types_js_1.colors.dim).concat(file).concat(types_js_1.colors.reset)
    ];
}
/**
 * Render colored table row for observation
 */
function renderColorTableRow(obs, time, showTime, config) {
    var title = obs.title || 'Untitled';
    var icon = ModeManager_js_1.ModeManager.getInstance().getTypeIcon(obs.type);
    var _a = (0, TokenCalculator_js_1.formatObservationTokenDisplay)(obs, config), readTokens = _a.readTokens, discoveryTokens = _a.discoveryTokens, workEmoji = _a.workEmoji;
    var timePart = showTime ? "".concat(types_js_1.colors.dim).concat(time).concat(types_js_1.colors.reset) : ' '.repeat(time.length);
    var readPart = (config.showReadTokens && readTokens > 0) ? "".concat(types_js_1.colors.dim, "(~").concat(readTokens, "t)").concat(types_js_1.colors.reset) : '';
    var discoveryPart = (config.showWorkTokens && discoveryTokens > 0) ? "".concat(types_js_1.colors.dim, "(").concat(workEmoji, " ").concat(discoveryTokens.toLocaleString(), "t)").concat(types_js_1.colors.reset) : '';
    return "  ".concat(types_js_1.colors.dim, "#").concat(obs.id).concat(types_js_1.colors.reset, "  ").concat(timePart, "  ").concat(icon, "  ").concat(title, " ").concat(readPart, " ").concat(discoveryPart);
}
/**
 * Render colored full observation
 */
function renderColorFullObservation(obs, time, showTime, detailField, config) {
    var output = [];
    var title = obs.title || 'Untitled';
    var icon = ModeManager_js_1.ModeManager.getInstance().getTypeIcon(obs.type);
    var _a = (0, TokenCalculator_js_1.formatObservationTokenDisplay)(obs, config), readTokens = _a.readTokens, discoveryTokens = _a.discoveryTokens, workEmoji = _a.workEmoji;
    var timePart = showTime ? "".concat(types_js_1.colors.dim).concat(time).concat(types_js_1.colors.reset) : ' '.repeat(time.length);
    var readPart = (config.showReadTokens && readTokens > 0) ? "".concat(types_js_1.colors.dim, "(~").concat(readTokens, "t)").concat(types_js_1.colors.reset) : '';
    var discoveryPart = (config.showWorkTokens && discoveryTokens > 0) ? "".concat(types_js_1.colors.dim, "(").concat(workEmoji, " ").concat(discoveryTokens.toLocaleString(), "t)").concat(types_js_1.colors.reset) : '';
    output.push("  ".concat(types_js_1.colors.dim, "#").concat(obs.id).concat(types_js_1.colors.reset, "  ").concat(timePart, "  ").concat(icon, "  ").concat(types_js_1.colors.bright).concat(title).concat(types_js_1.colors.reset));
    if (detailField) {
        output.push("    ".concat(types_js_1.colors.dim).concat(detailField).concat(types_js_1.colors.reset));
    }
    if (readPart || discoveryPart) {
        output.push("    ".concat(readPart, " ").concat(discoveryPart));
    }
    output.push('');
    return output;
}
/**
 * Render colored summary item in timeline
 */
function renderColorSummaryItem(summary, formattedTime) {
    var summaryTitle = "".concat(summary.request || 'Session started', " (").concat(formattedTime, ")");
    return [
        "".concat(types_js_1.colors.yellow, "#S").concat(summary.id).concat(types_js_1.colors.reset, " ").concat(summaryTitle),
        ''
    ];
}
/**
 * Render colored summary field
 */
function renderColorSummaryField(label, value, color) {
    if (!value)
        return [];
    return ["".concat(color).concat(label, ":").concat(types_js_1.colors.reset, " ").concat(value), ''];
}
/**
 * Render colored previously section
 */
function renderColorPreviouslySection(priorMessages) {
    if (!priorMessages.assistantMessage)
        return [];
    return [
        '',
        '---',
        '',
        "".concat(types_js_1.colors.bright).concat(types_js_1.colors.magenta, "Previously").concat(types_js_1.colors.reset),
        '',
        "".concat(types_js_1.colors.dim, "A: ").concat(priorMessages.assistantMessage).concat(types_js_1.colors.reset),
        ''
    ];
}
/**
 * Render colored footer
 */
function renderColorFooter(totalDiscoveryTokens, totalReadTokens) {
    var workTokensK = Math.round(totalDiscoveryTokens / 1000);
    return [
        '',
        "".concat(types_js_1.colors.dim, "Access ").concat(workTokensK, "k tokens of past research & decisions for just ").concat(totalReadTokens.toLocaleString(), "t. Use the claude-mem skill to access memories by ID.").concat(types_js_1.colors.reset)
    ];
}
/**
 * Render colored empty state
 */
function renderColorEmptyState(project) {
    return "\n".concat(types_js_1.colors.bright).concat(types_js_1.colors.cyan, "[").concat(project, "] recent context, ").concat(formatHeaderDateTime()).concat(types_js_1.colors.reset, "\n").concat(types_js_1.colors.gray).concat('─'.repeat(60)).concat(types_js_1.colors.reset, "\n\n").concat(types_js_1.colors.dim, "No previous sessions found for this project yet.").concat(types_js_1.colors.reset, "\n");
}
