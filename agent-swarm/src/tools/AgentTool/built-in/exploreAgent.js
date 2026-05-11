"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EXPLORE_AGENT = exports.EXPLORE_AGENT_MIN_QUERIES = void 0;
var toolName_js_1 = require("src/tools/BashTool/toolName.js");
var constants_js_1 = require("src/tools/ExitPlanModeTool/constants.js");
var constants_js_2 = require("src/tools/FileEditTool/constants.js");
var prompt_js_1 = require("src/tools/FileReadTool/prompt.js");
var prompt_js_2 = require("src/tools/FileWriteTool/prompt.js");
var prompt_js_3 = require("src/tools/GlobTool/prompt.js");
var prompt_js_4 = require("src/tools/GrepTool/prompt.js");
var constants_js_3 = require("src/tools/NotebookEditTool/constants.js");
var embeddedTools_js_1 = require("src/utils/embeddedTools.js");
var constants_js_4 = require("../constants.js");
function getExploreSystemPrompt() {
    // Ant-native builds alias find/grep to embedded bfs/ugrep and remove the
    // dedicated Glob/Grep tools, so point at find/grep via Bash instead.
    var embedded = (0, embeddedTools_js_1.hasEmbeddedSearchTools)();
    var globGuidance = embedded
        ? "- Use `find` via ".concat(toolName_js_1.BASH_TOOL_NAME, " for broad file pattern matching")
        : "- Use ".concat(prompt_js_3.GLOB_TOOL_NAME, " for broad file pattern matching");
    var grepGuidance = embedded
        ? "- Use `grep` via ".concat(toolName_js_1.BASH_TOOL_NAME, " for searching file contents with regex")
        : "- Use ".concat(prompt_js_4.GREP_TOOL_NAME, " for searching file contents with regex");
    return "You are a file search specialist for Claude Code, Anthropic's official CLI for Claude. You excel at thoroughly navigating and exploring codebases.\n\n=== CRITICAL: READ-ONLY MODE - NO FILE MODIFICATIONS ===\nThis is a READ-ONLY exploration task. You are STRICTLY PROHIBITED from:\n- Creating new files (no Write, touch, or file creation of any kind)\n- Modifying existing files (no Edit operations)\n- Deleting files (no rm or deletion)\n- Moving or copying files (no mv or cp)\n- Creating temporary files anywhere, including /tmp\n- Using redirect operators (>, >>, |) or heredocs to write to files\n- Running ANY commands that change system state\n\nYour role is EXCLUSIVELY to search and analyze existing code. You do NOT have access to file editing tools - attempting to edit files will fail.\n\nYour strengths:\n- Rapidly finding files using glob patterns\n- Searching code and text with powerful regex patterns\n- Reading and analyzing file contents\n\nGuidelines:\n".concat(globGuidance, "\n").concat(grepGuidance, "\n- Use ").concat(prompt_js_1.FILE_READ_TOOL_NAME, " when you know the specific file path you need to read\n- Use ").concat(toolName_js_1.BASH_TOOL_NAME, " ONLY for read-only operations (ls, git status, git log, git diff, find").concat(embedded ? ', grep' : '', ", cat, head, tail)\n- NEVER use ").concat(toolName_js_1.BASH_TOOL_NAME, " for: mkdir, touch, rm, cp, mv, git add, git commit, npm install, pip install, or any file creation/modification\n- Adapt your search approach based on the thoroughness level specified by the caller\n- Communicate your final report directly as a regular message - do NOT attempt to create files\n\nNOTE: You are meant to be a fast agent that returns output as quickly as possible. In order to achieve this you must:\n- Make efficient use of the tools that you have at your disposal: be smart about how you search for files and implementations\n- Wherever possible you should try to spawn multiple parallel tool calls for grepping and reading files\n\nComplete the user's search request efficiently and report your findings clearly.");
}
exports.EXPLORE_AGENT_MIN_QUERIES = 3;
var EXPLORE_WHEN_TO_USE = 'Fast agent specialized for exploring codebases. Use this when you need to quickly find files by patterns (eg. "src/components/**/*.tsx"), search code for keywords (eg. "API endpoints"), or answer questions about the codebase (eg. "how do API endpoints work?"). When calling this agent, specify the desired thoroughness level: "quick" for basic searches, "medium" for moderate exploration, or "very thorough" for comprehensive analysis across multiple locations and naming conventions.';
exports.EXPLORE_AGENT = {
    agentType: 'Explore',
    whenToUse: EXPLORE_WHEN_TO_USE,
    disallowedTools: [
        constants_js_4.AGENT_TOOL_NAME,
        constants_js_1.EXIT_PLAN_MODE_TOOL_NAME,
        constants_js_2.FILE_EDIT_TOOL_NAME,
        prompt_js_2.FILE_WRITE_TOOL_NAME,
        constants_js_3.NOTEBOOK_EDIT_TOOL_NAME,
    ],
    source: 'built-in',
    baseDir: 'built-in',
    // Ants get inherit to use the main agent's model; external users get haiku for speed
    // Note: For ants, getAgentModel() checks tengu_explore_agent GrowthBook flag at runtime
    model: process.env.USER_TYPE === 'ant' ? 'inherit' : 'haiku',
    // Explore is a fast read-only search agent — it doesn't need commit/PR/lint
    // rules from CLAUDE.md. The main agent has full context and interprets results.
    omitClaudeMd: true,
    getSystemPrompt: function () { return getExploreSystemPrompt(); },
};
