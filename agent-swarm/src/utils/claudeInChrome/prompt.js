"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLAUDE_IN_CHROME_SKILL_HINT_WITH_WEBBROWSER = exports.CLAUDE_IN_CHROME_SKILL_HINT = exports.CHROME_TOOL_SEARCH_INSTRUCTIONS = exports.BASE_CHROME_PROMPT = void 0;
exports.getChromeSystemPrompt = getChromeSystemPrompt;
exports.BASE_CHROME_PROMPT = "# Claude in Chrome browser automation\n\nYou have access to browser automation tools (mcp__claude-in-chrome__*) for interacting with web pages in Chrome. Follow these guidelines for effective browser automation.\n\n## GIF recording\n\nWhen performing multi-step browser interactions that the user may want to review or share, use mcp__claude-in-chrome__gif_creator to record them.\n\nYou must ALWAYS:\n* Capture extra frames before and after taking actions to ensure smooth playback\n* Name the file meaningfully to help the user identify it later (e.g., \"login_process.gif\")\n\n## Console log debugging\n\nYou can use mcp__claude-in-chrome__read_console_messages to read console output. Console output may be verbose. If you are looking for specific log entries, use the 'pattern' parameter with a regex-compatible pattern. This filters results efficiently and avoids overwhelming output. For example, use pattern: \"[MyApp]\" to filter for application-specific logs rather than reading all console output.\n\n## Alerts and dialogs\n\nIMPORTANT: Do not trigger JavaScript alerts, confirms, prompts, or browser modal dialogs through your actions. These browser dialogs block all further browser events and will prevent the extension from receiving any subsequent commands. Instead, when possible, use console.log for debugging and then use the mcp__claude-in-chrome__read_console_messages tool to read those log messages. If a page has dialog-triggering elements:\n1. Avoid clicking buttons or links that may trigger alerts (e.g., \"Delete\" buttons with confirmation dialogs)\n2. If you must interact with such elements, warn the user first that this may interrupt the session\n3. Use mcp__claude-in-chrome__javascript_tool to check for and dismiss any existing dialogs before proceeding\n\nIf you accidentally trigger a dialog and lose responsiveness, inform the user they need to manually dismiss it in the browser.\n\n## Avoid rabbit holes and loops\n\nWhen using browser automation tools, stay focused on the specific task. If you encounter any of the following, stop and ask the user for guidance:\n- Unexpected complexity or tangential browser exploration\n- Browser tool calls failing or returning errors after 2-3 attempts\n- No response from the browser extension\n- Page elements not responding to clicks or input\n- Pages not loading or timing out\n- Unable to complete the browser task despite multiple approaches\n\nExplain what you attempted, what went wrong, and ask how the user would like to proceed. Do not keep retrying the same failing browser action or explore unrelated pages without checking in first.\n\n## Tab context and session startup\n\nIMPORTANT: At the start of each browser automation session, call mcp__claude-in-chrome__tabs_context_mcp first to get information about the user's current browser tabs. Use this context to understand what the user might want to work with before creating new tabs.\n\nNever reuse tab IDs from a previous/other session. Follow these guidelines:\n1. Only reuse an existing tab if the user explicitly asks to work with it\n2. Otherwise, create a new tab with mcp__claude-in-chrome__tabs_create_mcp\n3. If a tool returns an error indicating the tab doesn't exist or is invalid, call tabs_context_mcp to get fresh tab IDs\n4. When a tab is closed by the user or a navigation error occurs, call tabs_context_mcp to see what tabs are available";
/**
 * Additional instructions for chrome tools when tool search is enabled.
 * These instruct the model to load chrome tools via ToolSearch before using them.
 * Only injected when tool search is actually enabled (not just optimistically possible).
 */
exports.CHROME_TOOL_SEARCH_INSTRUCTIONS = "**IMPORTANT: Before using any chrome browser tools, you MUST first load them using ToolSearch.**\n\nChrome browser tools are MCP tools that require loading before use. Before calling any mcp__claude-in-chrome__* tool:\n1. Use ToolSearch with `select:mcp__claude-in-chrome__<tool_name>` to load the specific tool\n2. Then call the tool\n\nFor example, to get tab context:\n1. First: ToolSearch with query \"select:mcp__claude-in-chrome__tabs_context_mcp\"\n2. Then: Call mcp__claude-in-chrome__tabs_context_mcp";
/**
 * Get the base chrome system prompt (without tool search instructions).
 * Tool search instructions are injected separately at request time in claude.ts
 * based on the actual tool search enabled state.
 */
function getChromeSystemPrompt() {
    return exports.BASE_CHROME_PROMPT;
}
/**
 * Minimal hint about Claude in Chrome skill availability. This is injected at startup when the extension is installed
 * to guide the model to invoke the skill before using the MCP tools.
 */
exports.CLAUDE_IN_CHROME_SKILL_HINT = "**Browser Automation**: Chrome browser tools are available via the \"claude-in-chrome\" skill. CRITICAL: Before using any mcp__claude-in-chrome__* tools, invoke the skill by calling the Skill tool with skill: \"claude-in-chrome\". The skill provides browser automation instructions and enables the tools.";
/**
 * Variant when the built-in WebBrowser tool is also available — steer
 * dev-loop tasks to WebBrowser and reserve the extension for the user's
 * authenticated Chrome (logged-in sites, OAuth, computer-use).
 */
exports.CLAUDE_IN_CHROME_SKILL_HINT_WITH_WEBBROWSER = "**Browser Automation**: Use WebBrowser for development (dev servers, JS eval, console, screenshots). Use claude-in-chrome for the user's real Chrome when you need logged-in sessions, OAuth, or computer-use \u2014 invoke Skill(skill: \"claude-in-chrome\") before any mcp__claude-in-chrome__* tool.";
