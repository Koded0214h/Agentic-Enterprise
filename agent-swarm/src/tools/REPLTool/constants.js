"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REPL_ONLY_TOOLS = exports.REPL_TOOL_NAME = void 0;
exports.isReplModeEnabled = isReplModeEnabled;
var envUtils_js_1 = require("../../utils/envUtils.js");
var constants_js_1 = require("../AgentTool/constants.js");
var toolName_js_1 = require("../BashTool/toolName.js");
var constants_js_2 = require("../FileEditTool/constants.js");
var prompt_js_1 = require("../FileReadTool/prompt.js");
var prompt_js_2 = require("../FileWriteTool/prompt.js");
var prompt_js_3 = require("../GlobTool/prompt.js");
var prompt_js_4 = require("../GrepTool/prompt.js");
var constants_js_3 = require("../NotebookEditTool/constants.js");
exports.REPL_TOOL_NAME = 'REPL';
/**
 * REPL mode is default-on for ants in the interactive CLI (opt out with
 * CLAUDE_CODE_REPL=0). The legacy CLAUDE_REPL_MODE=1 also forces it on.
 *
 * SDK entrypoints (sdk-ts, sdk-py, sdk-cli) are NOT defaulted on — SDK
 * consumers script direct tool calls (Bash, Read, etc.) and REPL mode
 * hides those tools. USER_TYPE is a build-time --define, so the ant-native
 * binary would otherwise force REPL mode on every SDK subprocess regardless
 * of the env the caller passes.
 */
function isReplModeEnabled() {
    if ((0, envUtils_js_1.isEnvDefinedFalsy)(process.env.CLAUDE_CODE_REPL))
        return false;
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_REPL_MODE))
        return true;
    return (process.env.USER_TYPE === 'ant' &&
        process.env.CLAUDE_CODE_ENTRYPOINT === 'cli');
}
/**
 * Tools that are only accessible via REPL when REPL mode is enabled.
 * When REPL mode is on, these tools are hidden from Claude's direct use,
 * forcing Claude to use REPL for batch operations.
 */
exports.REPL_ONLY_TOOLS = new Set([
    prompt_js_1.FILE_READ_TOOL_NAME,
    prompt_js_2.FILE_WRITE_TOOL_NAME,
    constants_js_2.FILE_EDIT_TOOL_NAME,
    prompt_js_3.GLOB_TOOL_NAME,
    prompt_js_4.GREP_TOOL_NAME,
    toolName_js_1.BASH_TOOL_NAME,
    constants_js_3.NOTEBOOK_EDIT_TOOL_NAME,
    constants_js_1.AGENT_TOOL_NAME,
]);
