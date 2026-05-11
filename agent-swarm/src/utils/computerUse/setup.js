"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupComputerUseMCP = setupComputerUseMCP;
var buildComputerUseTools = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return [];
};
var path_1 = require("path");
var url_1 = require("url");
var mcpStringUtils_js_1 = require("../../services/mcp/mcpStringUtils.js");
var bundledMode_js_1 = require("../bundledMode.js");
var common_js_1 = require("./common.js");
var gates_js_1 = require("./gates.js");
/**
 * Build the dynamic MCP config + allowed tool names. Mirror of
 * `setupClaudeInChrome`. The `mcp__computer-use__*` tools are added to
 * `allowedTools` so they bypass the normal permission prompt — the package's
 * `request_access` handles approval for the whole session.
 *
 * The MCP layer isn't ceremony: the API backend detects `mcp__computer-use__*`
 * tool names and emits a CU availability hint into the system prompt
 * (COMPUTER_USE_MCP_AVAILABILITY_HINT in the anthropic repo). Built-in tools
 * with different names wouldn't trigger it. Cowork uses the same names for the
 * same reason (apps/desktop/src/main/local-agent-mode/systemPrompt.ts:314).
 */
function setupComputerUseMCP() {
    var _a;
    var allowedTools = buildComputerUseTools(common_js_1.CLI_CU_CAPABILITIES, (0, gates_js_1.getChicagoCoordinateMode)()).map(function (t) { return (0, mcpStringUtils_js_1.buildMcpToolName)(common_js_1.COMPUTER_USE_MCP_SERVER_NAME, t.name); });
    // command/args are never spawned — client.ts intercepts by name and
    // uses the in-process server. The config just needs to exist with
    // type 'stdio' to hit the right branch. Mirrors Chrome's setup.
    var args = (0, bundledMode_js_1.isInBundledMode)()
        ? ['--computer-use-mcp']
        : [
            (0, path_1.join)((0, url_1.fileURLToPath)(import.meta.url), '..', 'cli.js'),
            '--computer-use-mcp',
        ];
    return {
        mcpConfig: (_a = {},
            _a[common_js_1.COMPUTER_USE_MCP_SERVER_NAME] = {
                type: 'stdio',
                command: process.execPath,
                args: args,
                scope: 'dynamic',
            },
            _a),
        allowedTools: allowedTools,
    };
}
