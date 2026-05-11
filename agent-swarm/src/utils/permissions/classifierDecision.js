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
exports.isAutoModeAllowlistedTool = isAutoModeAllowlistedTool;
var bun_bundle_1 = require("bun:bundle");
var prompt_js_1 = require("../../tools/AskUserQuestionTool/prompt.js");
var constants_js_1 = require("../../tools/EnterPlanModeTool/constants.js");
var constants_js_2 = require("../../tools/ExitPlanModeTool/constants.js");
var prompt_js_2 = require("../../tools/FileReadTool/prompt.js");
var prompt_js_3 = require("../../tools/GlobTool/prompt.js");
var prompt_js_4 = require("../../tools/GrepTool/prompt.js");
var prompt_js_5 = require("../../tools/ListMcpResourcesTool/prompt.js");
var prompt_js_6 = require("../../tools/LSPTool/prompt.js");
var constants_js_3 = require("../../tools/SendMessageTool/constants.js");
var prompt_js_7 = require("../../tools/SleepTool/prompt.js");
var constants_js_4 = require("../../tools/TaskCreateTool/constants.js");
var constants_js_5 = require("../../tools/TaskGetTool/constants.js");
var constants_js_6 = require("../../tools/TaskListTool/constants.js");
var constants_js_7 = require("../../tools/TaskOutputTool/constants.js");
var prompt_js_8 = require("../../tools/TaskStopTool/prompt.js");
var constants_js_8 = require("../../tools/TaskUpdateTool/constants.js");
var constants_js_9 = require("../../tools/TeamCreateTool/constants.js");
var constants_js_10 = require("../../tools/TeamDeleteTool/constants.js");
var constants_js_11 = require("../../tools/TodoWriteTool/constants.js");
var prompt_js_9 = require("../../tools/ToolSearchTool/prompt.js");
var yoloClassifier_js_1 = require("./yoloClassifier.js");
// Ant-only tool names: conditional require so Bun can DCE these in external builds.
// Gates mirror tools.ts. Keeps the tool name strings out of cli.js.
/* eslint-disable @typescript-eslint/no-require-imports */
var TERMINAL_CAPTURE_TOOL_NAME = (0, bun_bundle_1.feature)('TERMINAL_PANEL')
    ? require('../../tools/TerminalCaptureTool/prompt.js').TERMINAL_CAPTURE_TOOL_NAME
    : null;
var OVERFLOW_TEST_TOOL_NAME = (0, bun_bundle_1.feature)('OVERFLOW_TEST_TOOL')
    ? require('../../tools/OverflowTestTool/OverflowTestTool.js').OVERFLOW_TEST_TOOL_NAME
    : null;
var VERIFY_PLAN_EXECUTION_TOOL_NAME = process.env.USER_TYPE === 'ant'
    ? require('../../tools/VerifyPlanExecutionTool/constants.js').VERIFY_PLAN_EXECUTION_TOOL_NAME
    : null;
var WORKFLOW_TOOL_NAME = (0, bun_bundle_1.feature)('WORKFLOW_SCRIPTS')
    ? require('../../tools/WorkflowTool/constants.js').WORKFLOW_TOOL_NAME
    : null;
/* eslint-enable @typescript-eslint/no-require-imports */
/**
 * Tools that are safe and don't need any classifier checking.
 * Used by the auto mode classifier to skip unnecessary API calls.
 * Does NOT include write/edit tools — those are handled by the
 * acceptEdits fast path (allowed in CWD, classified outside CWD).
 */
var SAFE_YOLO_ALLOWLISTED_TOOLS = new Set(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([
    // Read-only file operations
    prompt_js_2.FILE_READ_TOOL_NAME,
    // Search / read-only
    prompt_js_4.GREP_TOOL_NAME,
    prompt_js_3.GLOB_TOOL_NAME,
    prompt_js_6.LSP_TOOL_NAME,
    prompt_js_9.TOOL_SEARCH_TOOL_NAME,
    prompt_js_5.LIST_MCP_RESOURCES_TOOL_NAME,
    'ReadMcpResourceTool', // no exported constant
    // Task management (metadata only)
    constants_js_11.TODO_WRITE_TOOL_NAME,
    constants_js_4.TASK_CREATE_TOOL_NAME,
    constants_js_5.TASK_GET_TOOL_NAME,
    constants_js_8.TASK_UPDATE_TOOL_NAME,
    constants_js_6.TASK_LIST_TOOL_NAME,
    prompt_js_8.TASK_STOP_TOOL_NAME,
    constants_js_7.TASK_OUTPUT_TOOL_NAME,
    // Plan mode / UI
    prompt_js_1.ASK_USER_QUESTION_TOOL_NAME,
    constants_js_1.ENTER_PLAN_MODE_TOOL_NAME,
    constants_js_2.EXIT_PLAN_MODE_TOOL_NAME,
    // Swarm coordination (internal mailbox/team state only — teammates have
    // their own permission checks, so no actual security bypass).
    constants_js_9.TEAM_CREATE_TOOL_NAME,
    // Agent cleanup
    constants_js_10.TEAM_DELETE_TOOL_NAME,
    constants_js_3.SEND_MESSAGE_TOOL_NAME
], (WORKFLOW_TOOL_NAME ? [WORKFLOW_TOOL_NAME] : []), true), [
    // Misc safe
    prompt_js_7.SLEEP_TOOL_NAME
], false), (TERMINAL_CAPTURE_TOOL_NAME ? [TERMINAL_CAPTURE_TOOL_NAME] : []), true), (OVERFLOW_TEST_TOOL_NAME ? [OVERFLOW_TEST_TOOL_NAME] : []), true), (VERIFY_PLAN_EXECUTION_TOOL_NAME ? [VERIFY_PLAN_EXECUTION_TOOL_NAME] : []), true), [
    // Internal classifier tool
    yoloClassifier_js_1.YOLO_CLASSIFIER_TOOL_NAME,
], false));
function isAutoModeAllowlistedTool(toolName) {
    return SAFE_YOLO_ALLOWLISTED_TOOLS.has(toolName);
}
