"use strict";
/**
 * Utility functions for detecting code indexing tool usage.
 *
 * Tracks usage of common code indexing solutions like Sourcegraph, Cody, etc.
 * both via CLI commands and MCP server integrations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectCodeIndexingFromCommand = detectCodeIndexingFromCommand;
exports.detectCodeIndexingFromMcpTool = detectCodeIndexingFromMcpTool;
exports.detectCodeIndexingFromMcpServerName = detectCodeIndexingFromMcpServerName;
/**
 * Mapping of CLI command prefixes to code indexing tools.
 * The key is the command name (first word of the command).
 */
var CLI_COMMAND_MAPPING = {
    // Sourcegraph ecosystem
    src: 'sourcegraph',
    cody: 'cody',
    // AI coding assistants
    aider: 'aider',
    tabby: 'tabby',
    tabnine: 'tabnine',
    augment: 'augment',
    pieces: 'pieces',
    qodo: 'qodo',
    aide: 'aide',
    // Code search tools
    hound: 'hound',
    seagoat: 'seagoat',
    bloop: 'bloop',
    gitloop: 'gitloop',
    // Cloud provider AI assistants
    q: 'amazon-q',
    gemini: 'gemini',
};
/**
 * Mapping of MCP server name patterns to code indexing tools.
 * Patterns are matched case-insensitively against the server name.
 */
var MCP_SERVER_PATTERNS = [
    // Sourcegraph ecosystem
    { pattern: /^sourcegraph$/i, tool: 'sourcegraph' },
    { pattern: /^cody$/i, tool: 'cody' },
    { pattern: /^openctx$/i, tool: 'openctx' },
    // AI coding assistants
    { pattern: /^aider$/i, tool: 'aider' },
    { pattern: /^continue$/i, tool: 'continue' },
    { pattern: /^github[-_]?copilot$/i, tool: 'github-copilot' },
    { pattern: /^copilot$/i, tool: 'github-copilot' },
    { pattern: /^cursor$/i, tool: 'cursor' },
    { pattern: /^tabby$/i, tool: 'tabby' },
    { pattern: /^codeium$/i, tool: 'codeium' },
    { pattern: /^tabnine$/i, tool: 'tabnine' },
    { pattern: /^augment[-_]?code$/i, tool: 'augment' },
    { pattern: /^augment$/i, tool: 'augment' },
    { pattern: /^windsurf$/i, tool: 'windsurf' },
    { pattern: /^aide$/i, tool: 'aide' },
    { pattern: /^codestory$/i, tool: 'aide' },
    { pattern: /^pieces$/i, tool: 'pieces' },
    { pattern: /^qodo$/i, tool: 'qodo' },
    { pattern: /^amazon[-_]?q$/i, tool: 'amazon-q' },
    { pattern: /^gemini[-_]?code[-_]?assist$/i, tool: 'gemini' },
    { pattern: /^gemini$/i, tool: 'gemini' },
    // Code search tools
    { pattern: /^hound$/i, tool: 'hound' },
    { pattern: /^seagoat$/i, tool: 'seagoat' },
    { pattern: /^bloop$/i, tool: 'bloop' },
    { pattern: /^gitloop$/i, tool: 'gitloop' },
    // MCP code indexing servers
    { pattern: /^claude[-_]?context$/i, tool: 'claude-context' },
    { pattern: /^code[-_]?index[-_]?mcp$/i, tool: 'code-index-mcp' },
    { pattern: /^code[-_]?index$/i, tool: 'code-index-mcp' },
    { pattern: /^local[-_]?code[-_]?search$/i, tool: 'local-code-search' },
    { pattern: /^codebase$/i, tool: 'autodev-codebase' },
    { pattern: /^autodev[-_]?codebase$/i, tool: 'autodev-codebase' },
    { pattern: /^code[-_]?context$/i, tool: 'claude-context' },
];
/**
 * Detects if a bash command is using a code indexing CLI tool.
 *
 * @param command - The full bash command string
 * @returns The code indexing tool identifier, or undefined if not a code indexing command
 *
 * @example
 * detectCodeIndexingFromCommand('src search "pattern"') // returns 'sourcegraph'
 * detectCodeIndexingFromCommand('cody chat --message "help"') // returns 'cody'
 * detectCodeIndexingFromCommand('ls -la') // returns undefined
 */
function detectCodeIndexingFromCommand(command) {
    var _a, _b;
    // Extract the first word (command name)
    var trimmed = command.trim();
    var firstWord = (_a = trimmed.split(/\s+/)[0]) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    if (!firstWord) {
        return undefined;
    }
    // Check for npx/bunx prefixed commands
    if (firstWord === 'npx' || firstWord === 'bunx') {
        var secondWord = (_b = trimmed.split(/\s+/)[1]) === null || _b === void 0 ? void 0 : _b.toLowerCase();
        if (secondWord && secondWord in CLI_COMMAND_MAPPING) {
            return CLI_COMMAND_MAPPING[secondWord];
        }
    }
    return CLI_COMMAND_MAPPING[firstWord];
}
/**
 * Detects if an MCP tool is from a code indexing server.
 *
 * @param toolName - The MCP tool name (format: mcp__serverName__toolName)
 * @returns The code indexing tool identifier, or undefined if not a code indexing tool
 *
 * @example
 * detectCodeIndexingFromMcpTool('mcp__sourcegraph__search') // returns 'sourcegraph'
 * detectCodeIndexingFromMcpTool('mcp__cody__chat') // returns 'cody'
 * detectCodeIndexingFromMcpTool('mcp__filesystem__read') // returns undefined
 */
function detectCodeIndexingFromMcpTool(toolName) {
    // MCP tool names follow the format: mcp__serverName__toolName
    if (!toolName.startsWith('mcp__')) {
        return undefined;
    }
    var parts = toolName.split('__');
    if (parts.length < 3) {
        return undefined;
    }
    var serverName = parts[1];
    if (!serverName) {
        return undefined;
    }
    for (var _i = 0, MCP_SERVER_PATTERNS_1 = MCP_SERVER_PATTERNS; _i < MCP_SERVER_PATTERNS_1.length; _i++) {
        var _a = MCP_SERVER_PATTERNS_1[_i], pattern = _a.pattern, tool = _a.tool;
        if (pattern.test(serverName)) {
            return tool;
        }
    }
    return undefined;
}
/**
 * Detects if an MCP server name corresponds to a code indexing tool.
 *
 * @param serverName - The MCP server name
 * @returns The code indexing tool identifier, or undefined if not a code indexing server
 *
 * @example
 * detectCodeIndexingFromMcpServerName('sourcegraph') // returns 'sourcegraph'
 * detectCodeIndexingFromMcpServerName('filesystem') // returns undefined
 */
function detectCodeIndexingFromMcpServerName(serverName) {
    for (var _i = 0, MCP_SERVER_PATTERNS_2 = MCP_SERVER_PATTERNS; _i < MCP_SERVER_PATTERNS_2.length; _i++) {
        var _a = MCP_SERVER_PATTERNS_2[_i], pattern = _a.pattern, tool = _a.tool;
        if (pattern.test(serverName)) {
            return tool;
        }
    }
    return undefined;
}
