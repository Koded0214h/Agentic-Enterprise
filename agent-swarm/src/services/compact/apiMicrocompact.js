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
exports.getAPIContextManagement = getAPIContextManagement;
var constants_js_1 = require("src/tools/FileEditTool/constants.js");
var prompt_js_1 = require("src/tools/FileReadTool/prompt.js");
var prompt_js_2 = require("src/tools/FileWriteTool/prompt.js");
var prompt_js_3 = require("src/tools/GlobTool/prompt.js");
var prompt_js_4 = require("src/tools/GrepTool/prompt.js");
var constants_js_2 = require("src/tools/NotebookEditTool/constants.js");
var prompt_js_5 = require("src/tools/WebFetchTool/prompt.js");
var prompt_js_6 = require("src/tools/WebSearchTool/prompt.js");
var shellToolUtils_js_1 = require("src/utils/shell/shellToolUtils.js");
var envUtils_js_1 = require("../../utils/envUtils.js");
// docs: https://docs.google.com/document/d/1oCT4evvWTh3P6z-kcfNQwWTCxAhkoFndSaNS9Gm40uw/edit?tab=t.0
// Default values for context management strategies
// Match client-side microcompact token values
var DEFAULT_MAX_INPUT_TOKENS = 180000; // Typical warning threshold
var DEFAULT_TARGET_INPUT_TOKENS = 40000; // Keep last 40k tokens like client-side
var TOOLS_CLEARABLE_RESULTS = __spreadArray(__spreadArray([], shellToolUtils_js_1.SHELL_TOOL_NAMES, true), [
    prompt_js_3.GLOB_TOOL_NAME,
    prompt_js_4.GREP_TOOL_NAME,
    prompt_js_1.FILE_READ_TOOL_NAME,
    prompt_js_5.WEB_FETCH_TOOL_NAME,
    prompt_js_6.WEB_SEARCH_TOOL_NAME,
], false);
var TOOLS_CLEARABLE_USES = [
    constants_js_1.FILE_EDIT_TOOL_NAME,
    prompt_js_2.FILE_WRITE_TOOL_NAME,
    constants_js_2.NOTEBOOK_EDIT_TOOL_NAME,
];
// API-based microcompact implementation that uses native context management
function getAPIContextManagement(options) {
    var _a = options !== null && options !== void 0 ? options : {}, _b = _a.hasThinking, hasThinking = _b === void 0 ? false : _b, _c = _a.isRedactThinkingActive, isRedactThinkingActive = _c === void 0 ? false : _c, _d = _a.clearAllThinking, clearAllThinking = _d === void 0 ? false : _d;
    var strategies = [];
    // Preserve thinking blocks in previous assistant turns. Skip when
    // redact-thinking is active — redacted blocks have no model-visible content.
    // When clearAllThinking is set (>1h idle = cache miss), keep only the last
    // thinking turn — the API schema requires value >= 1, and omitting the edit
    // falls back to the model-policy default (often "all"), which wouldn't clear.
    if (hasThinking && !isRedactThinkingActive) {
        strategies.push({
            type: 'clear_thinking_20251015',
            keep: clearAllThinking ? { type: 'thinking_turns', value: 1 } : 'all',
        });
    }
    // Tool clearing strategies are ant-only
    if (process.env.USER_TYPE !== 'ant') {
        return strategies.length > 0 ? { edits: strategies } : undefined;
    }
    var useClearToolResults = (0, envUtils_js_1.isEnvTruthy)(process.env.USE_API_CLEAR_TOOL_RESULTS);
    var useClearToolUses = (0, envUtils_js_1.isEnvTruthy)(process.env.USE_API_CLEAR_TOOL_USES);
    // If no tool clearing strategy is enabled, return early
    if (!useClearToolResults && !useClearToolUses) {
        return strategies.length > 0 ? { edits: strategies } : undefined;
    }
    if (useClearToolResults) {
        var triggerThreshold = process.env.API_MAX_INPUT_TOKENS
            ? parseInt(process.env.API_MAX_INPUT_TOKENS)
            : DEFAULT_MAX_INPUT_TOKENS;
        var keepTarget = process.env.API_TARGET_INPUT_TOKENS
            ? parseInt(process.env.API_TARGET_INPUT_TOKENS)
            : DEFAULT_TARGET_INPUT_TOKENS;
        var strategy = {
            type: 'clear_tool_uses_20250919',
            trigger: {
                type: 'input_tokens',
                value: triggerThreshold,
            },
            clear_at_least: {
                type: 'input_tokens',
                value: triggerThreshold - keepTarget,
            },
            clear_tool_inputs: TOOLS_CLEARABLE_RESULTS,
        };
        strategies.push(strategy);
    }
    if (useClearToolUses) {
        var triggerThreshold = process.env.API_MAX_INPUT_TOKENS
            ? parseInt(process.env.API_MAX_INPUT_TOKENS)
            : DEFAULT_MAX_INPUT_TOKENS;
        var keepTarget = process.env.API_TARGET_INPUT_TOKENS
            ? parseInt(process.env.API_TARGET_INPUT_TOKENS)
            : DEFAULT_TARGET_INPUT_TOKENS;
        var strategy = {
            type: 'clear_tool_uses_20250919',
            trigger: {
                type: 'input_tokens',
                value: triggerThreshold,
            },
            clear_at_least: {
                type: 'input_tokens',
                value: triggerThreshold - keepTarget,
            },
            exclude_tools: TOOLS_CLEARABLE_USES,
        };
        strategies.push(strategy);
    }
    return strategies.length > 0 ? { edits: strategies } : undefined;
}
