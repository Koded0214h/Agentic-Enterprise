"use strict";
/**
 * MarkdownFormatter - Formats context output as compact markdown for LLM injection
 *
 * Optimized for token efficiency: flat lines instead of tables, no repeated headers.
 * The colored terminal formatter (ColorFormatter.ts) handles human-readable display separately.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderMarkdownHeader = renderMarkdownHeader;
exports.renderMarkdownLegend = renderMarkdownLegend;
exports.renderMarkdownColumnKey = renderMarkdownColumnKey;
exports.renderMarkdownContextIndex = renderMarkdownContextIndex;
exports.renderMarkdownContextEconomics = renderMarkdownContextEconomics;
exports.renderMarkdownDayHeader = renderMarkdownDayHeader;
exports.renderMarkdownFileHeader = renderMarkdownFileHeader;
exports.renderMarkdownTableRow = renderMarkdownTableRow;
exports.renderMarkdownFullObservation = renderMarkdownFullObservation;
exports.renderMarkdownSummaryItem = renderMarkdownSummaryItem;
exports.renderMarkdownSummaryField = renderMarkdownSummaryField;
exports.renderMarkdownPreviouslySection = renderMarkdownPreviouslySection;
exports.renderMarkdownFooter = renderMarkdownFooter;
exports.renderMarkdownEmptyState = renderMarkdownEmptyState;
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
 * Render markdown header
 */
function renderMarkdownHeader(project) {
    return [
        "# $CMEM ".concat(project, " ").concat(formatHeaderDateTime()),
        ''
    ];
}
/**
 * Render markdown legend
 */
function renderMarkdownLegend() {
    var mode = ModeManager_js_1.ModeManager.getInstance().getActiveMode();
    var typeLegendItems = mode.observation_types.map(function (t) { return "".concat(t.emoji).concat(t.id); }).join(' ');
    return [
        "Legend: \uD83C\uDFAFsession ".concat(typeLegendItems),
        "Format: ID TIME TYPE TITLE",
        "Fetch details: get_observations([IDs]) | Search: mem-search skill",
        ''
    ];
}
/**
 * Render markdown column key - no longer needed in compact format
 */
function renderMarkdownColumnKey() {
    return [];
}
/**
 * Render markdown context index instructions - folded into legend
 */
function renderMarkdownContextIndex() {
    return [];
}
/**
 * Render markdown context economics
 */
function renderMarkdownContextEconomics(economics, config) {
    var output = [];
    var parts = [
        "".concat(economics.totalObservations, " obs (").concat(economics.totalReadTokens.toLocaleString(), "t read)"),
        "".concat(economics.totalDiscoveryTokens.toLocaleString(), "t work")
    ];
    if (economics.totalDiscoveryTokens > 0 && (config.showSavingsAmount || config.showSavingsPercent)) {
        if (config.showSavingsPercent) {
            parts.push("".concat(economics.savingsPercent, "% savings"));
        }
        else if (config.showSavingsAmount) {
            parts.push("".concat(economics.savings.toLocaleString(), "t saved"));
        }
    }
    output.push("Stats: ".concat(parts.join(' | ')));
    output.push('');
    return output;
}
/**
 * Render markdown day header
 */
function renderMarkdownDayHeader(day) {
    return [
        "### ".concat(day),
    ];
}
/**
 * Render markdown file header - no longer renders table headers in compact format
 */
function renderMarkdownFileHeader(_file) {
    // File grouping eliminated in compact format - file context is in observation titles
    return [];
}
/**
 * Format compact time: "9:23 AM" → "9:23a", "12:05 PM" → "12:05p"
 */
function compactTime(time) {
    return time.toLowerCase().replace(' am', 'a').replace(' pm', 'p');
}
/**
 * Render compact flat line for observation (replaces table row)
 */
function renderMarkdownTableRow(obs, timeDisplay, _config) {
    var title = obs.title || 'Untitled';
    var icon = ModeManager_js_1.ModeManager.getInstance().getTypeIcon(obs.type);
    var time = timeDisplay ? compactTime(timeDisplay) : '"';
    return "".concat(obs.id, " ").concat(time, " ").concat(icon, " ").concat(title);
}
/**
 * Render markdown full observation
 */
function renderMarkdownFullObservation(obs, timeDisplay, detailField, config) {
    var output = [];
    var title = obs.title || 'Untitled';
    var icon = ModeManager_js_1.ModeManager.getInstance().getTypeIcon(obs.type);
    var time = timeDisplay ? compactTime(timeDisplay) : '"';
    var _a = (0, TokenCalculator_js_1.formatObservationTokenDisplay)(obs, config), readTokens = _a.readTokens, discoveryDisplay = _a.discoveryDisplay;
    output.push("**".concat(obs.id, "** ").concat(time, " ").concat(icon, " **").concat(title, "**"));
    if (detailField) {
        output.push(detailField);
    }
    var tokenParts = [];
    if (config.showReadTokens) {
        tokenParts.push("~".concat(readTokens, "t"));
    }
    if (config.showWorkTokens) {
        tokenParts.push(discoveryDisplay);
    }
    if (tokenParts.length > 0) {
        output.push(tokenParts.join(' '));
    }
    output.push('');
    return output;
}
/**
 * Render markdown summary item in timeline
 */
function renderMarkdownSummaryItem(summary, formattedTime) {
    return [
        "S".concat(summary.id, " ").concat(summary.request || 'Session started', " (").concat(formattedTime, ")"),
    ];
}
/**
 * Render markdown summary field
 */
function renderMarkdownSummaryField(label, value) {
    if (!value)
        return [];
    return ["**".concat(label, "**: ").concat(value), ''];
}
/**
 * Render markdown previously section
 */
function renderMarkdownPreviouslySection(priorMessages) {
    if (!priorMessages.assistantMessage)
        return [];
    return [
        '',
        '---',
        '',
        "**Previously**",
        '',
        "A: ".concat(priorMessages.assistantMessage),
        ''
    ];
}
/**
 * Render markdown footer
 */
function renderMarkdownFooter(totalDiscoveryTokens, totalReadTokens) {
    var workTokensK = Math.round(totalDiscoveryTokens / 1000);
    return [
        '',
        "Access ".concat(workTokensK, "k tokens of past work via get_observations([IDs]) or mem-search skill.")
    ];
}
/**
 * Render markdown empty state
 */
function renderMarkdownEmptyState(project) {
    return "# $CMEM ".concat(project, " ").concat(formatHeaderDateTime(), "\n\nNo previous sessions found.");
}
