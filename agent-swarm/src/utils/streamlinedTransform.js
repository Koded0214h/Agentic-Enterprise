"use strict";
/**
 * Transforms SDK messages for streamlined output mode.
 *
 * Streamlined mode is a "distillation-resistant" output format that:
 * - Keeps text messages intact
 * - Summarizes tool calls with cumulative counts (resets when text appears)
 * - Omits thinking content
 * - Strips tool list and model info from init messages
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
exports.createStreamlinedTransformer = createStreamlinedTransformer;
exports.shouldIncludeInStreamlined = shouldIncludeInStreamlined;
var constants_js_1 = require("src/tools/FileEditTool/constants.js");
var prompt_js_1 = require("src/tools/FileReadTool/prompt.js");
var prompt_js_2 = require("src/tools/FileWriteTool/prompt.js");
var prompt_js_3 = require("src/tools/GlobTool/prompt.js");
var prompt_js_4 = require("src/tools/GrepTool/prompt.js");
var prompt_js_5 = require("src/tools/ListMcpResourcesTool/prompt.js");
var prompt_js_6 = require("src/tools/LSPTool/prompt.js");
var constants_js_2 = require("src/tools/NotebookEditTool/constants.js");
var prompt_js_7 = require("src/tools/TaskStopTool/prompt.js");
var prompt_js_8 = require("src/tools/WebSearchTool/prompt.js");
var messages_js_1 = require("src/utils/messages.js");
var shellToolUtils_js_1 = require("src/utils/shell/shellToolUtils.js");
var stringUtils_js_1 = require("src/utils/stringUtils.js");
/**
 * Tool categories for summarization.
 */
var SEARCH_TOOLS = [
    prompt_js_4.GREP_TOOL_NAME,
    prompt_js_3.GLOB_TOOL_NAME,
    prompt_js_8.WEB_SEARCH_TOOL_NAME,
    prompt_js_6.LSP_TOOL_NAME,
];
var READ_TOOLS = [prompt_js_1.FILE_READ_TOOL_NAME, prompt_js_5.LIST_MCP_RESOURCES_TOOL_NAME];
var WRITE_TOOLS = [
    prompt_js_2.FILE_WRITE_TOOL_NAME,
    constants_js_1.FILE_EDIT_TOOL_NAME,
    constants_js_2.NOTEBOOK_EDIT_TOOL_NAME,
];
var COMMAND_TOOLS = __spreadArray(__spreadArray([], shellToolUtils_js_1.SHELL_TOOL_NAMES, true), ['Tmux', prompt_js_7.TASK_STOP_TOOL_NAME], false);
function categorizeToolName(toolName) {
    if (SEARCH_TOOLS.some(function (t) { return toolName.startsWith(t); }))
        return 'searches';
    if (READ_TOOLS.some(function (t) { return toolName.startsWith(t); }))
        return 'reads';
    if (WRITE_TOOLS.some(function (t) { return toolName.startsWith(t); }))
        return 'writes';
    if (COMMAND_TOOLS.some(function (t) { return toolName.startsWith(t); }))
        return 'commands';
    return 'other';
}
function createEmptyToolCounts() {
    return {
        searches: 0,
        reads: 0,
        writes: 0,
        commands: 0,
        other: 0,
    };
}
/**
 * Generate a summary text for tool counts.
 */
function getToolSummaryText(counts) {
    var parts = [];
    // Use similar phrasing to collapseReadSearch.ts
    if (counts.searches > 0) {
        parts.push("searched ".concat(counts.searches, " ").concat(counts.searches === 1 ? 'pattern' : 'patterns'));
    }
    if (counts.reads > 0) {
        parts.push("read ".concat(counts.reads, " ").concat(counts.reads === 1 ? 'file' : 'files'));
    }
    if (counts.writes > 0) {
        parts.push("wrote ".concat(counts.writes, " ").concat(counts.writes === 1 ? 'file' : 'files'));
    }
    if (counts.commands > 0) {
        parts.push("ran ".concat(counts.commands, " ").concat(counts.commands === 1 ? 'command' : 'commands'));
    }
    if (counts.other > 0) {
        parts.push("".concat(counts.other, " other ").concat(counts.other === 1 ? 'tool' : 'tools'));
    }
    if (parts.length === 0) {
        return undefined;
    }
    return (0, stringUtils_js_1.capitalize)(parts.join(', '));
}
/**
 * Count tool uses in an assistant message and add to existing counts.
 */
function accumulateToolUses(message, counts) {
    var content = message.message.content;
    if (!Array.isArray(content)) {
        return;
    }
    for (var _i = 0, content_1 = content; _i < content_1.length; _i++) {
        var block = content_1[_i];
        if (block.type === 'tool_use' && 'name' in block) {
            var category = categorizeToolName(block.name);
            counts[category]++;
        }
    }
}
/**
 * Create a stateful transformer that accumulates tool counts between text messages.
 * Tool counts reset when a message with text content is encountered.
 */
function createStreamlinedTransformer() {
    var cumulativeCounts = createEmptyToolCounts();
    return function transformToStreamlined(message) {
        switch (message.type) {
            case 'assistant': {
                var content = message.message.content;
                var text = Array.isArray(content)
                    ? (0, messages_js_1.extractTextContent)(content, '\n').trim()
                    : '';
                // Accumulate tool counts from this message
                accumulateToolUses(message, cumulativeCounts);
                if (text.length > 0) {
                    // Text message: emit text only, reset counts
                    cumulativeCounts = createEmptyToolCounts();
                    return {
                        type: 'streamlined_text',
                        text: text,
                        session_id: message.session_id,
                        uuid: message.uuid,
                    };
                }
                // Tool-only message: emit cumulative tool summary
                var toolSummary = getToolSummaryText(cumulativeCounts);
                if (!toolSummary) {
                    return null;
                }
                return {
                    type: 'streamlined_tool_use_summary',
                    tool_summary: toolSummary,
                    session_id: message.session_id,
                    uuid: message.uuid,
                };
            }
            case 'result':
                // Keep result messages as-is (they have structured_output, permission_denials)
                return message;
            case 'system':
            case 'user':
            case 'stream_event':
            case 'tool_progress':
            case 'auth_status':
            case 'rate_limit_event':
            case 'control_response':
            case 'control_request':
            case 'control_cancel_request':
            case 'keep_alive':
                return null;
            default:
                return null;
        }
    };
}
/**
 * Check if a message should be included in streamlined output.
 * Useful for filtering before transformation.
 */
function shouldIncludeInStreamlined(message) {
    return message.type === 'assistant' || message.type === 'result';
}
