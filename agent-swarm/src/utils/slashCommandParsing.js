"use strict";
/**
 * Centralized utilities for parsing slash commands
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSlashCommand = parseSlashCommand;
/**
 * Parses a slash command input string into its component parts
 *
 * @param input - The raw input string (should start with '/')
 * @returns Parsed command name, args, and MCP flag, or null if invalid
 *
 * @example
 * parseSlashCommand('/search foo bar')
 * // => { commandName: 'search', args: 'foo bar', isMcp: false }
 *
 * @example
 * parseSlashCommand('/mcp:tool (MCP) arg1 arg2')
 * // => { commandName: 'mcp:tool (MCP)', args: 'arg1 arg2', isMcp: true }
 */
function parseSlashCommand(input) {
    var trimmedInput = input.trim();
    // Check if input starts with '/'
    if (!trimmedInput.startsWith('/')) {
        return null;
    }
    // Remove the leading '/' and split by spaces
    var withoutSlash = trimmedInput.slice(1);
    var words = withoutSlash.split(' ');
    if (!words[0]) {
        return null;
    }
    var commandName = words[0];
    var isMcp = false;
    var argsStartIndex = 1;
    // Check for MCP commands (second word is '(MCP)')
    if (words.length > 1 && words[1] === '(MCP)') {
        commandName = commandName + ' (MCP)';
        isMcp = true;
        argsStartIndex = 2;
    }
    // Extract arguments (everything after command name)
    var args = words.slice(argsStartIndex).join(' ');
    return {
        commandName: commandName,
        args: args,
        isMcp: isMcp,
    };
}
