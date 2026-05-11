"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLAUDE_CODE_GUIDE_AGENT = exports.CLAUDE_CODE_GUIDE_AGENT_TYPE = void 0;
var toolName_js_1 = require("src/tools/BashTool/toolName.js");
var prompt_js_1 = require("src/tools/FileReadTool/prompt.js");
var prompt_js_2 = require("src/tools/GlobTool/prompt.js");
var prompt_js_3 = require("src/tools/GrepTool/prompt.js");
var constants_js_1 = require("src/tools/SendMessageTool/constants.js");
var prompt_js_4 = require("src/tools/WebFetchTool/prompt.js");
var prompt_js_5 = require("src/tools/WebSearchTool/prompt.js");
var auth_js_1 = require("src/utils/auth.js");
var embeddedTools_js_1 = require("src/utils/embeddedTools.js");
var settings_js_1 = require("src/utils/settings/settings.js");
var slowOperations_js_1 = require("../../../utils/slowOperations.js");
var CLAUDE_CODE_DOCS_MAP_URL = 'https://code.claude.com/docs/en/claude_code_docs_map.md';
var CDP_DOCS_MAP_URL = 'https://platform.claude.com/llms.txt';
exports.CLAUDE_CODE_GUIDE_AGENT_TYPE = 'claude-code-guide';
function getClaudeCodeGuideBasePrompt() {
    // Ant-native builds alias find/grep to embedded bfs/ugrep and remove the
    // dedicated Glob/Grep tools, so point at find/grep instead.
    var localSearchHint = (0, embeddedTools_js_1.hasEmbeddedSearchTools)()
        ? "".concat(prompt_js_1.FILE_READ_TOOL_NAME, ", `find`, and `grep`")
        : "".concat(prompt_js_1.FILE_READ_TOOL_NAME, ", ").concat(prompt_js_2.GLOB_TOOL_NAME, ", and ").concat(prompt_js_3.GREP_TOOL_NAME);
    return "You are the Claude guide agent. Your primary responsibility is helping users understand and use Claude Code, the Claude Agent SDK, and the Claude API (formerly the Anthropic API) effectively.\n\n**Your expertise spans three domains:**\n\n1. **Claude Code** (the CLI tool): Installation, configuration, hooks, skills, MCP servers, keyboard shortcuts, IDE integrations, settings, and workflows.\n\n2. **Claude Agent SDK**: A framework for building custom AI agents based on Claude Code technology. Available for Node.js/TypeScript and Python.\n\n3. **Claude API**: The Claude API (formerly known as the Anthropic API) for direct model interaction, tool use, and integrations.\n\n**Documentation sources:**\n\n- **Claude Code docs** (".concat(CLAUDE_CODE_DOCS_MAP_URL, "): Fetch this for questions about the Claude Code CLI tool, including:\n  - Installation, setup, and getting started\n  - Hooks (pre/post command execution)\n  - Custom skills\n  - MCP server configuration\n  - IDE integrations (VS Code, JetBrains)\n  - Settings files and configuration\n  - Keyboard shortcuts and hotkeys\n  - Subagents and plugins\n  - Sandboxing and security\n\n- **Claude Agent SDK docs** (").concat(CDP_DOCS_MAP_URL, "): Fetch this for questions about building agents with the SDK, including:\n  - SDK overview and getting started (Python and TypeScript)\n  - Agent configuration + custom tools\n  - Session management and permissions\n  - MCP integration in agents\n  - Hosting and deployment\n  - Cost tracking and context management\n  Note: Agent SDK docs are part of the Claude API documentation at the same URL.\n\n- **Claude API docs** (").concat(CDP_DOCS_MAP_URL, "): Fetch this for questions about the Claude API (formerly the Anthropic API), including:\n  - Messages API and streaming\n  - Tool use (function calling) and Anthropic-defined tools (computer use, code execution, web search, text editor, bash, programmatic tool calling, tool search tool, context editing, Files API, structured outputs)\n  - Vision, PDF support, and citations\n  - Extended thinking and structured outputs\n  - MCP connector for remote MCP servers\n  - Cloud provider integrations (Bedrock, Vertex AI, Foundry)\n\n**Approach:**\n1. Determine which domain the user's question falls into\n2. Use ").concat(prompt_js_4.WEB_FETCH_TOOL_NAME, " to fetch the appropriate docs map\n3. Identify the most relevant documentation URLs from the map\n4. Fetch the specific documentation pages\n5. Provide clear, actionable guidance based on official documentation\n6. Use ").concat(prompt_js_5.WEB_SEARCH_TOOL_NAME, " if docs don't cover the topic\n7. Reference local project files (CLAUDE.md, .claude/ directory) when relevant using ").concat(localSearchHint, "\n\n**Guidelines:**\n- Always prioritize official documentation over assumptions\n- Keep responses concise and actionable\n- Include specific examples or code snippets when helpful\n- Reference exact documentation URLs in your responses\n- Help users discover features by proactively suggesting related commands, shortcuts, or capabilities\n\nComplete the user's request by providing accurate, documentation-based guidance.");
}
function getFeedbackGuideline() {
    // For 3P services (Bedrock/Vertex/Foundry), /feedback command is disabled
    // Direct users to the appropriate feedback channel instead
    if ((0, auth_js_1.isUsing3PServices)()) {
        return "- When you cannot find an answer or the feature doesn't exist, direct the user to ".concat(MACRO.ISSUES_EXPLAINER);
    }
    return "- When you cannot find an answer or the feature doesn't exist, direct the user to use /feedback to report a feature request or bug";
}
exports.CLAUDE_CODE_GUIDE_AGENT = {
    agentType: exports.CLAUDE_CODE_GUIDE_AGENT_TYPE,
    whenToUse: "Use this agent when the user asks questions (\"Can Claude...\", \"Does Claude...\", \"How do I...\") about: (1) Claude Code (the CLI tool) - features, hooks, slash commands, MCP servers, settings, IDE integrations, keyboard shortcuts; (2) Claude Agent SDK - building custom agents; (3) Claude API (formerly Anthropic API) - API usage, tool use, Anthropic SDK usage. **IMPORTANT:** Before spawning a new agent, check if there is already a running or recently completed claude-code-guide agent that you can continue via ".concat(constants_js_1.SEND_MESSAGE_TOOL_NAME, "."),
    // Ant-native builds: Glob/Grep tools are removed; use Bash (with embedded
    // bfs/ugrep via find/grep aliases) for local file search instead.
    tools: (0, embeddedTools_js_1.hasEmbeddedSearchTools)()
        ? [
            toolName_js_1.BASH_TOOL_NAME,
            prompt_js_1.FILE_READ_TOOL_NAME,
            prompt_js_4.WEB_FETCH_TOOL_NAME,
            prompt_js_5.WEB_SEARCH_TOOL_NAME,
        ]
        : [
            prompt_js_2.GLOB_TOOL_NAME,
            prompt_js_3.GREP_TOOL_NAME,
            prompt_js_1.FILE_READ_TOOL_NAME,
            prompt_js_4.WEB_FETCH_TOOL_NAME,
            prompt_js_5.WEB_SEARCH_TOOL_NAME,
        ],
    source: 'built-in',
    baseDir: 'built-in',
    model: 'haiku',
    permissionMode: 'dontAsk',
    getSystemPrompt: function (_a) {
        var toolUseContext = _a.toolUseContext;
        var commands = toolUseContext.options.commands;
        // Build context sections
        var contextSections = [];
        // 1. Custom skills
        var customCommands = commands.filter(function (cmd) { return cmd.type === 'prompt'; });
        if (customCommands.length > 0) {
            var commandList = customCommands
                .map(function (cmd) { return "- /".concat(cmd.name, ": ").concat(cmd.description); })
                .join('\n');
            contextSections.push("**Available custom skills in this project:**\n".concat(commandList));
        }
        // 2. Custom agents from .claude/agents/
        var customAgents = toolUseContext.options.agentDefinitions.activeAgents.filter(function (a) { return a.source !== 'built-in'; });
        if (customAgents.length > 0) {
            var agentList = customAgents
                .map(function (a) { return "- ".concat(a.agentType, ": ").concat(a.whenToUse); })
                .join('\n');
            contextSections.push("**Available custom agents configured:**\n".concat(agentList));
        }
        // 3. MCP servers
        var mcpClients = toolUseContext.options.mcpClients;
        if (mcpClients && mcpClients.length > 0) {
            var mcpList = mcpClients
                .map(function (client) { return "- ".concat(client.name); })
                .join('\n');
            contextSections.push("**Configured MCP servers:**\n".concat(mcpList));
        }
        // 4. Plugin commands
        var pluginCommands = commands.filter(function (cmd) { return cmd.type === 'prompt' && cmd.source === 'plugin'; });
        if (pluginCommands.length > 0) {
            var pluginList = pluginCommands
                .map(function (cmd) { return "- /".concat(cmd.name, ": ").concat(cmd.description); })
                .join('\n');
            contextSections.push("**Available plugin skills:**\n".concat(pluginList));
        }
        // 5. User settings
        var settings = (0, settings_js_1.getSettings_DEPRECATED)();
        if (Object.keys(settings).length > 0) {
            // eslint-disable-next-line no-restricted-syntax -- human-facing UI, not tool_result
            var settingsJson = (0, slowOperations_js_1.jsonStringify)(settings, null, 2);
            contextSections.push("**User's settings.json:**\n```json\n".concat(settingsJson, "\n```"));
        }
        // Add the feedback guideline (conditional based on whether user is using 3P services)
        var feedbackGuideline = getFeedbackGuideline();
        var basePromptWithFeedback = "".concat(getClaudeCodeGuideBasePrompt(), "\n").concat(feedbackGuideline);
        // If we have any context to add, append it to the base system prompt
        if (contextSections.length > 0) {
            return "".concat(basePromptWithFeedback, "\n\n---\n\n# User's Current Configuration\n\nThe user has the following custom setup in their environment:\n\n").concat(contextSections.join('\n\n'), "\n\nWhen answering questions, consider these configured features and proactively suggest them when relevant.");
        }
        // Return the base prompt if no context to add
        return basePromptWithFeedback;
    },
};
