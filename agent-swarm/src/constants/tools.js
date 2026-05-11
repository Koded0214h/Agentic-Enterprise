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
exports.COORDINATOR_MODE_ALLOWED_TOOLS = exports.IN_PROCESS_TEAMMATE_ALLOWED_TOOLS = exports.ASYNC_AGENT_ALLOWED_TOOLS = exports.CUSTOM_AGENT_DISALLOWED_TOOLS = exports.ALL_AGENT_DISALLOWED_TOOLS = void 0;
// biome-ignore-all assist/source/organizeImports: ANT-ONLY import markers must not be reordered
var bun_bundle_1 = require("bun:bundle");
var constants_js_1 = require("../tools/TaskOutputTool/constants.js");
var constants_js_2 = require("../tools/ExitPlanModeTool/constants.js");
var constants_js_3 = require("../tools/EnterPlanModeTool/constants.js");
var constants_js_4 = require("../tools/AgentTool/constants.js");
var prompt_js_1 = require("../tools/AskUserQuestionTool/prompt.js");
var prompt_js_2 = require("../tools/TaskStopTool/prompt.js");
var prompt_js_3 = require("../tools/FileReadTool/prompt.js");
var prompt_js_4 = require("../tools/WebSearchTool/prompt.js");
var constants_js_5 = require("../tools/TodoWriteTool/constants.js");
var prompt_js_5 = require("../tools/GrepTool/prompt.js");
var prompt_js_6 = require("../tools/WebFetchTool/prompt.js");
var prompt_js_7 = require("../tools/GlobTool/prompt.js");
var shellToolUtils_js_1 = require("../utils/shell/shellToolUtils.js");
var constants_js_6 = require("../tools/FileEditTool/constants.js");
var prompt_js_8 = require("../tools/FileWriteTool/prompt.js");
var constants_js_7 = require("../tools/NotebookEditTool/constants.js");
var constants_js_8 = require("../tools/SkillTool/constants.js");
var constants_js_9 = require("../tools/SendMessageTool/constants.js");
var constants_js_10 = require("../tools/TaskCreateTool/constants.js");
var constants_js_11 = require("../tools/TaskGetTool/constants.js");
var constants_js_12 = require("../tools/TaskListTool/constants.js");
var constants_js_13 = require("../tools/TaskUpdateTool/constants.js");
var prompt_js_9 = require("../tools/ToolSearchTool/prompt.js");
var SyntheticOutputTool_js_1 = require("../tools/SyntheticOutputTool/SyntheticOutputTool.js");
var constants_js_14 = require("../tools/EnterWorktreeTool/constants.js");
var constants_js_15 = require("../tools/ExitWorktreeTool/constants.js");
var constants_js_16 = require("../tools/WorkflowTool/constants.js");
var prompt_js_10 = require("../tools/ScheduleCronTool/prompt.js");
exports.ALL_AGENT_DISALLOWED_TOOLS = new Set(__spreadArray(__spreadArray(__spreadArray([
    constants_js_1.TASK_OUTPUT_TOOL_NAME,
    constants_js_2.EXIT_PLAN_MODE_V2_TOOL_NAME,
    constants_js_3.ENTER_PLAN_MODE_TOOL_NAME
], (process.env.USER_TYPE === 'ant' ? [] : [constants_js_4.AGENT_TOOL_NAME]), true), [
    prompt_js_1.ASK_USER_QUESTION_TOOL_NAME,
    prompt_js_2.TASK_STOP_TOOL_NAME
], false), ((0, bun_bundle_1.feature)('WORKFLOW_SCRIPTS') ? [constants_js_16.WORKFLOW_TOOL_NAME] : []), true));
exports.CUSTOM_AGENT_DISALLOWED_TOOLS = new Set(__spreadArray([], exports.ALL_AGENT_DISALLOWED_TOOLS, true));
/*
 * Async Agent Tool Availability Status (Source of Truth)
 */
exports.ASYNC_AGENT_ALLOWED_TOOLS = new Set(__spreadArray(__spreadArray([
    prompt_js_3.FILE_READ_TOOL_NAME,
    prompt_js_4.WEB_SEARCH_TOOL_NAME,
    constants_js_5.TODO_WRITE_TOOL_NAME,
    prompt_js_5.GREP_TOOL_NAME,
    prompt_js_6.WEB_FETCH_TOOL_NAME,
    prompt_js_7.GLOB_TOOL_NAME
], shellToolUtils_js_1.SHELL_TOOL_NAMES, true), [
    constants_js_6.FILE_EDIT_TOOL_NAME,
    prompt_js_8.FILE_WRITE_TOOL_NAME,
    constants_js_7.NOTEBOOK_EDIT_TOOL_NAME,
    constants_js_8.SKILL_TOOL_NAME,
    SyntheticOutputTool_js_1.SYNTHETIC_OUTPUT_TOOL_NAME,
    prompt_js_9.TOOL_SEARCH_TOOL_NAME,
    constants_js_14.ENTER_WORKTREE_TOOL_NAME,
    constants_js_15.EXIT_WORKTREE_TOOL_NAME,
], false));
/**
 * Tools allowed only for in-process teammates (not general async agents).
 * These are injected by inProcessRunner.ts and allowed through filterToolsForAgent
 * via isInProcessTeammate() check.
 */
exports.IN_PROCESS_TEAMMATE_ALLOWED_TOOLS = new Set(__spreadArray([
    constants_js_10.TASK_CREATE_TOOL_NAME,
    constants_js_11.TASK_GET_TOOL_NAME,
    constants_js_12.TASK_LIST_TOOL_NAME,
    constants_js_13.TASK_UPDATE_TOOL_NAME,
    constants_js_9.SEND_MESSAGE_TOOL_NAME
], ((0, bun_bundle_1.feature)('AGENT_TRIGGERS')
    ? [prompt_js_10.CRON_CREATE_TOOL_NAME, prompt_js_10.CRON_DELETE_TOOL_NAME, prompt_js_10.CRON_LIST_TOOL_NAME]
    : []), true));
/*
 * BLOCKED FOR ASYNC AGENTS:
 * - AgentTool: Blocked to prevent recursion
 * - TaskOutputTool: Blocked to prevent recursion
 * - ExitPlanModeTool: Plan mode is a main thread abstraction.
 * - TaskStopTool: Requires access to main thread task state.
 * - TungstenTool: Uses singleton virtual terminal abstraction that conflicts between agents.
 *
 * ENABLE LATER (NEED WORK):
 * - MCPTool: TBD
 * - ListMcpResourcesTool: TBD
 * - ReadMcpResourceTool: TBD
 */
/**
 * Tools allowed in coordinator mode - only output and agent management tools for the coordinator
 */
exports.COORDINATOR_MODE_ALLOWED_TOOLS = new Set([
    constants_js_4.AGENT_TOOL_NAME,
    prompt_js_2.TASK_STOP_TOOL_NAME,
    constants_js_9.SEND_MESSAGE_TOOL_NAME,
    SyntheticOutputTool_js_1.SYNTHETIC_OUTPUT_TOOL_NAME,
]);
