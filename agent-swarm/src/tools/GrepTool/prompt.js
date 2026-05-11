"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GREP_TOOL_NAME = void 0;
exports.getDescription = getDescription;
var constants_js_1 = require("../AgentTool/constants.js");
var toolName_js_1 = require("../BashTool/toolName.js");
exports.GREP_TOOL_NAME = 'Grep';
function getDescription() {
    return "A powerful search tool built on ripgrep\n\n  Usage:\n  - ALWAYS use ".concat(exports.GREP_TOOL_NAME, " for search tasks. NEVER invoke `grep` or `rg` as a ").concat(toolName_js_1.BASH_TOOL_NAME, " command. The ").concat(exports.GREP_TOOL_NAME, " tool has been optimized for correct permissions and access.\n  - Supports full regex syntax (e.g., \"log.*Error\", \"function\\s+\\w+\")\n  - Filter files with glob parameter (e.g., \"*.js\", \"**/*.tsx\") or type parameter (e.g., \"js\", \"py\", \"rust\")\n  - Output modes: \"content\" shows matching lines, \"files_with_matches\" shows only file paths (default), \"count\" shows match counts\n  - Use ").concat(constants_js_1.AGENT_TOOL_NAME, " tool for open-ended searches requiring multiple rounds\n  - Pattern syntax: Uses ripgrep (not grep) - literal braces need escaping (use `interface\\{\\}` to find `interface{}` in Go code)\n  - Multiline matching: By default patterns match within single lines only. For cross-line patterns like `struct \\{[\\s\\S]*?field`, use `multiline: true`\n");
}
