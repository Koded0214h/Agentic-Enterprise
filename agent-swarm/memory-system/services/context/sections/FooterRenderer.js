"use strict";
/**
 * FooterRenderer - Renders the context footer sections
 *
 * Handles rendering of previously section and token savings footer.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderPreviouslySection = renderPreviouslySection;
exports.renderFooter = renderFooter;
var TokenCalculator_js_1 = require("../TokenCalculator.js");
var Markdown = require("../formatters/MarkdownFormatter.js");
var Color = require("../formatters/ColorFormatter.js");
/**
 * Render the previously section (prior assistant message)
 */
function renderPreviouslySection(priorMessages, useColors) {
    if (useColors) {
        return Color.renderColorPreviouslySection(priorMessages);
    }
    return Markdown.renderMarkdownPreviouslySection(priorMessages);
}
/**
 * Render the footer with token savings info
 */
function renderFooter(economics, config, useColors) {
    // Only show footer if we have savings to display
    if (!(0, TokenCalculator_js_1.shouldShowContextEconomics)(config) || economics.totalDiscoveryTokens <= 0 || economics.savings <= 0) {
        return [];
    }
    if (useColors) {
        return Color.renderColorFooter(economics.totalDiscoveryTokens, economics.totalReadTokens);
    }
    return Markdown.renderMarkdownFooter(economics.totalDiscoveryTokens, economics.totalReadTokens);
}
