"use strict";
/**
 * SummaryRenderer - Renders the summary section at the end of context
 *
 * Handles rendering of the most recent session summary fields.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldShowSummary = shouldShowSummary;
exports.renderSummaryFields = renderSummaryFields;
var types_js_1 = require("../types.js");
var Markdown = require("../formatters/MarkdownFormatter.js");
var Color = require("../formatters/ColorFormatter.js");
/**
 * Check if summary should be displayed
 */
function shouldShowSummary(config, mostRecentSummary, mostRecentObservation) {
    if (!config.showLastSummary || !mostRecentSummary) {
        return false;
    }
    var hasContent = !!(mostRecentSummary.investigated ||
        mostRecentSummary.learned ||
        mostRecentSummary.completed ||
        mostRecentSummary.next_steps);
    if (!hasContent) {
        return false;
    }
    // Only show if summary is more recent than observations
    if (mostRecentObservation && mostRecentSummary.created_at_epoch <= mostRecentObservation.created_at_epoch) {
        return false;
    }
    return true;
}
/**
 * Render summary fields
 */
function renderSummaryFields(summary, useColors) {
    var output = [];
    if (useColors) {
        output.push.apply(output, Color.renderColorSummaryField('Investigated', summary.investigated, types_js_1.colors.blue));
        output.push.apply(output, Color.renderColorSummaryField('Learned', summary.learned, types_js_1.colors.yellow));
        output.push.apply(output, Color.renderColorSummaryField('Completed', summary.completed, types_js_1.colors.green));
        output.push.apply(output, Color.renderColorSummaryField('Next Steps', summary.next_steps, types_js_1.colors.magenta));
    }
    else {
        output.push.apply(output, Markdown.renderMarkdownSummaryField('Investigated', summary.investigated));
        output.push.apply(output, Markdown.renderMarkdownSummaryField('Learned', summary.learned));
        output.push.apply(output, Markdown.renderMarkdownSummaryField('Completed', summary.completed));
        output.push.apply(output, Markdown.renderMarkdownSummaryField('Next Steps', summary.next_steps));
    }
    return output;
}
