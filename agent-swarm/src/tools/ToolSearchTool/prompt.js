"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOOL_SEARCH_TOOL_NAME = void 0;
exports.isDeferredTool = isDeferredTool;
exports.formatDeferredToolLine = formatDeferredToolLine;
exports.getPrompt = getPrompt;
var bun_bundle_1 = require("bun:bundle");
var state_js_1 = require("../../bootstrap/state.js");
var growthbook_js_1 = require("../../services/analytics/growthbook.js");
var constants_js_1 = require("../AgentTool/constants.js");
// Dead code elimination: Brief tool name only needed when KAIROS or KAIROS_BRIEF is on
/* eslint-disable @typescript-eslint/no-require-imports */
var BRIEF_TOOL_NAME = (0, bun_bundle_1.feature)('KAIROS') || (0, bun_bundle_1.feature)('KAIROS_BRIEF')
    ? require('../BriefTool/prompt.js').BRIEF_TOOL_NAME
    : null;
var SEND_USER_FILE_TOOL_NAME = (0, bun_bundle_1.feature)('KAIROS')
    ? require('../SendUserFileTool/prompt.js').SEND_USER_FILE_TOOL_NAME
    : null;
/* eslint-enable @typescript-eslint/no-require-imports */
var constants_js_2 = require("./constants.js");
Object.defineProperty(exports, "TOOL_SEARCH_TOOL_NAME", { enumerable: true, get: function () { return constants_js_2.TOOL_SEARCH_TOOL_NAME; } });
var constants_js_3 = require("./constants.js");
var PROMPT_HEAD = "Fetches full schema definitions for deferred tools so they can be called.\n\n";
// Matches isDeferredToolsDeltaEnabled in toolSearch.ts (not imported —
// toolSearch.ts imports from this file). When enabled: tools announced
// via system-reminder attachments. When disabled: prepended
// <available-deferred-tools> block (pre-gate behavior).
function getToolLocationHint() {
    var deltaEnabled = process.env.USER_TYPE === 'ant' ||
        (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_glacier_2xr', false);
    return deltaEnabled
        ? 'Deferred tools appear by name in <system-reminder> messages.'
        : 'Deferred tools appear by name in <available-deferred-tools> messages.';
}
var PROMPT_TAIL = " Until fetched, only the name is known \u2014 there is no parameter schema, so the tool cannot be invoked. This tool takes a query, matches it against the deferred tool list, and returns the matched tools' complete JSONSchema definitions inside a <functions> block. Once a tool's schema appears in that result, it is callable exactly like any tool defined at the top of the prompt.\n\nResult format: each matched tool appears as one <function>{\"description\": \"...\", \"name\": \"...\", \"parameters\": {...}}</function> line inside the <functions> block \u2014 the same encoding as the tool list at the top of this prompt.\n\nQuery forms:\n- \"select:Read,Edit,Grep\" \u2014 fetch these exact tools by name\n- \"notebook jupyter\" \u2014 keyword search, up to max_results best matches\n- \"+slack send\" \u2014 require \"slack\" in the name, rank by remaining terms";
/**
 * Check if a tool should be deferred (requires ToolSearch to load).
 * A tool is deferred if:
 * - It's an MCP tool (always deferred - workflow-specific)
 * - It has shouldDefer: true
 *
 * A tool is NEVER deferred if it has alwaysLoad: true (MCP tools set this via
 * _meta['anthropic/alwaysLoad']). This check runs first, before any other rule.
 */
function isDeferredTool(tool) {
    // Explicit opt-out via _meta['anthropic/alwaysLoad'] — tool appears in the
    // initial prompt with full schema. Checked first so MCP tools can opt out.
    if (tool.alwaysLoad === true)
        return false;
    // MCP tools are always deferred (workflow-specific)
    if (tool.isMcp === true)
        return true;
    // Never defer ToolSearch itself — the model needs it to load everything else
    if (tool.name === constants_js_3.TOOL_SEARCH_TOOL_NAME)
        return false;
    // Fork-first experiment: Agent must be available turn 1, not behind ToolSearch.
    // Lazy require: static import of forkSubagent → coordinatorMode creates a cycle
    // through constants/tools.ts at module init.
    if ((0, bun_bundle_1.feature)('FORK_SUBAGENT') && tool.name === constants_js_1.AGENT_TOOL_NAME) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        var m = require('../AgentTool/forkSubagent.js');
        if (m.isForkSubagentEnabled())
            return false;
    }
    // Brief is the primary communication channel whenever the tool is present.
    // Its prompt contains the text-visibility contract, which the model must
    // see without a ToolSearch round-trip. No runtime gate needed here: this
    // tool's isEnabled() IS isBriefEnabled(), so being asked about its deferral
    // status implies the gate already passed.
    if (((0, bun_bundle_1.feature)('KAIROS') || (0, bun_bundle_1.feature)('KAIROS_BRIEF')) &&
        BRIEF_TOOL_NAME &&
        tool.name === BRIEF_TOOL_NAME) {
        return false;
    }
    // SendUserFile is a file-delivery communication channel (sibling of Brief).
    // Must be immediately available without a ToolSearch round-trip.
    if ((0, bun_bundle_1.feature)('KAIROS') &&
        SEND_USER_FILE_TOOL_NAME &&
        tool.name === SEND_USER_FILE_TOOL_NAME &&
        (0, state_js_1.isReplBridgeActive)()) {
        return false;
    }
    return tool.shouldDefer === true;
}
/**
 * Format one deferred-tool line for the <available-deferred-tools> user
 * message. Search hints (tool.searchHint) are not rendered — the
 * hints A/B (exp_xenhnnmn0smrx4, stopped Mar 21) showed no benefit.
 */
function formatDeferredToolLine(tool) {
    return tool.name;
}
function getPrompt() {
    return PROMPT_HEAD + getToolLocationHint() + PROMPT_TAIL;
}
