"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SHELL_TOOL_NAMES = void 0;
exports.isPowerShellToolEnabled = isPowerShellToolEnabled;
var toolName_js_1 = require("../../tools/BashTool/toolName.js");
var toolName_js_2 = require("../../tools/PowerShellTool/toolName.js");
var envUtils_js_1 = require("../envUtils.js");
var platform_js_1 = require("../platform.js");
exports.SHELL_TOOL_NAMES = [toolName_js_1.BASH_TOOL_NAME, toolName_js_2.POWERSHELL_TOOL_NAME];
/**
 * Runtime gate for PowerShellTool. Windows-only (the permission engine uses
 * Win32-specific path normalizations). Ant defaults on (opt-out via env=0);
 * external defaults off (opt-in via env=1).
 *
 * Used by tools.ts (tool-list visibility), processBashCommand (! routing),
 * and promptShellExecution (skill frontmatter routing) so the gate is
 * consistent across all paths that invoke PowerShellTool.call().
 */
function isPowerShellToolEnabled() {
    if ((0, platform_js_1.getPlatform)() !== 'windows')
        return false;
    return process.env.USER_TYPE === 'ant'
        ? !(0, envUtils_js_1.isEnvDefinedFalsy)(process.env.CLAUDE_CODE_USE_POWERSHELL_TOOL)
        : (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_USE_POWERSHELL_TOOL);
}
