"use strict";
/**
 * HeaderRenderer - Renders the context header sections
 *
 * Handles rendering of header, legend, column key, context index, and economics.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderHeader = renderHeader;
var TokenCalculator_js_1 = require("../TokenCalculator.js");
var Markdown = require("../formatters/MarkdownFormatter.js");
var Color = require("../formatters/ColorFormatter.js");
/**
 * Render the complete header section
 */
function renderHeader(project, economics, config, useColors) {
    var output = [];
    // Main header
    if (useColors) {
        output.push.apply(output, Color.renderColorHeader(project));
    }
    else {
        output.push.apply(output, Markdown.renderMarkdownHeader(project));
    }
    // Legend
    if (useColors) {
        output.push.apply(output, Color.renderColorLegend());
    }
    else {
        output.push.apply(output, Markdown.renderMarkdownLegend());
    }
    // Column key
    if (useColors) {
        output.push.apply(output, Color.renderColorColumnKey());
    }
    else {
        output.push.apply(output, Markdown.renderMarkdownColumnKey());
    }
    // Context index instructions
    if (useColors) {
        output.push.apply(output, Color.renderColorContextIndex());
    }
    else {
        output.push.apply(output, Markdown.renderMarkdownContextIndex());
    }
    // Context economics
    if ((0, TokenCalculator_js_1.shouldShowContextEconomics)(config)) {
        if (useColors) {
            output.push.apply(output, Color.renderColorContextEconomics(economics, config));
        }
        else {
            output.push.apply(output, Markdown.renderMarkdownContextEconomics(economics, config));
        }
    }
    return output;
}
