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
exports.getTools = exports.TOOL_PRESETS = exports.REPL_ONLY_TOOLS = exports.COORDINATOR_MODE_ALLOWED_TOOLS = exports.ASYNC_AGENT_ALLOWED_TOOLS = exports.CUSTOM_AGENT_DISALLOWED_TOOLS = exports.ALL_AGENT_DISALLOWED_TOOLS = void 0;
exports.parseToolPreset = parseToolPreset;
exports.getToolsForDefaultPreset = getToolsForDefaultPreset;
exports.getAllBaseTools = getAllBaseTools;
exports.filterToolsByDenyRules = filterToolsByDenyRules;
exports.assembleToolPool = assembleToolPool;
exports.getMergedTools = getMergedTools;
// biome-ignore-all assist/source/organizeImports: ANT-ONLY import markers must not be reordered
var Tool_js_1 = require("./Tool.js");
var AgentTool_js_1 = require("./tools/AgentTool/AgentTool.js");
var SkillTool_js_1 = require("./tools/SkillTool/SkillTool.js");
var BashTool_js_1 = require("./tools/BashTool/BashTool.js");
var FileEditTool_js_1 = require("./tools/FileEditTool/FileEditTool.js");
var FileReadTool_js_1 = require("./tools/FileReadTool/FileReadTool.js");
var FileWriteTool_js_1 = require("./tools/FileWriteTool/FileWriteTool.js");
var GlobTool_js_1 = require("./tools/GlobTool/GlobTool.js");
var NotebookEditTool_js_1 = require("./tools/NotebookEditTool/NotebookEditTool.js");
var WebFetchTool_js_1 = require("./tools/WebFetchTool/WebFetchTool.js");
var TaskStopTool_js_1 = require("./tools/TaskStopTool/TaskStopTool.js");
var BriefTool_js_1 = require("./tools/BriefTool/BriefTool.js");
// Dead code elimination: conditional import for ant-only tools
/* eslint-disable custom-rules/no-process-env-top-level, @typescript-eslint/no-require-imports */
var REPLTool = process.env.USER_TYPE === 'ant'
    ? require('./tools/REPLTool/REPLTool.js').REPLTool
    : null;
var SuggestBackgroundPRTool = process.env.USER_TYPE === 'ant'
    ? require('./tools/SuggestBackgroundPRTool/SuggestBackgroundPRTool.js')
        .SuggestBackgroundPRTool
    : null;
var SleepTool = (0, bun_bundle_1.feature)('PROACTIVE') || (0, bun_bundle_1.feature)('KAIROS')
    ? require('./tools/SleepTool/SleepTool.js').SleepTool
    : null;
var cronTools = (0, bun_bundle_1.feature)('AGENT_TRIGGERS')
    ? [
        require('./tools/ScheduleCronTool/CronCreateTool.js').CronCreateTool,
        require('./tools/ScheduleCronTool/CronDeleteTool.js').CronDeleteTool,
        require('./tools/ScheduleCronTool/CronListTool.js').CronListTool,
    ]
    : [];
var RemoteTriggerTool = (0, bun_bundle_1.feature)('AGENT_TRIGGERS_REMOTE')
    ? require('./tools/RemoteTriggerTool/RemoteTriggerTool.js').RemoteTriggerTool
    : null;
var MonitorTool = (0, bun_bundle_1.feature)('MONITOR_TOOL')
    ? require('./tools/MonitorTool/MonitorTool.js').MonitorTool
    : null;
var SendUserFileTool = (0, bun_bundle_1.feature)('KAIROS')
    ? require('./tools/SendUserFileTool/SendUserFileTool.js').SendUserFileTool
    : null;
var PushNotificationTool = (0, bun_bundle_1.feature)('KAIROS') || (0, bun_bundle_1.feature)('KAIROS_PUSH_NOTIFICATION')
    ? require('./tools/PushNotificationTool/PushNotificationTool.js')
        .PushNotificationTool
    : null;
var SubscribePRTool = (0, bun_bundle_1.feature)('KAIROS_GITHUB_WEBHOOKS')
    ? require('./tools/SubscribePRTool/SubscribePRTool.js').SubscribePRTool
    : null;
/* eslint-enable custom-rules/no-process-env-top-level, @typescript-eslint/no-require-imports */
var TaskOutputTool_js_1 = require("./tools/TaskOutputTool/TaskOutputTool.js");
var WebSearchTool_js_1 = require("./tools/WebSearchTool/WebSearchTool.js");
var TodoWriteTool_js_1 = require("./tools/TodoWriteTool/TodoWriteTool.js");
var ExitPlanModeV2Tool_js_1 = require("./tools/ExitPlanModeTool/ExitPlanModeV2Tool.js");
var TestingPermissionTool_js_1 = require("./tools/testing/TestingPermissionTool.js");
var GrepTool_js_1 = require("./tools/GrepTool/GrepTool.js");
// import { TungstenTool } from './tools/TungstenTool/TungstenTool.js'
// Lazy require to break circular dependency: tools.ts -> TeamCreateTool/TeamDeleteTool -> ... -> tools.ts
/* eslint-disable @typescript-eslint/no-require-imports */
var getTeamCreateTool = function () {
    return require('./tools/TeamCreateTool/TeamCreateTool.js')
        .TeamCreateTool;
};
var getTeamDeleteTool = function () {
    return require('./tools/TeamDeleteTool/TeamDeleteTool.js')
        .TeamDeleteTool;
};
var getSendMessageTool = function () {
    return require('./tools/SendMessageTool/SendMessageTool.js')
        .SendMessageTool;
};
/* eslint-enable @typescript-eslint/no-require-imports */
var AskUserQuestionTool_js_1 = require("./tools/AskUserQuestionTool/AskUserQuestionTool.js");
var LSPTool_js_1 = require("./tools/LSPTool/LSPTool.js");
var ListMcpResourcesTool_js_1 = require("./tools/ListMcpResourcesTool/ListMcpResourcesTool.js");
var ReadMcpResourceTool_js_1 = require("./tools/ReadMcpResourceTool/ReadMcpResourceTool.js");
var ToolSearchTool_js_1 = require("./tools/ToolSearchTool/ToolSearchTool.js");
var EnterPlanModeTool_js_1 = require("./tools/EnterPlanModeTool/EnterPlanModeTool.js");
var EnterWorktreeTool_js_1 = require("./tools/EnterWorktreeTool/EnterWorktreeTool.js");
var ExitWorktreeTool_js_1 = require("./tools/ExitWorktreeTool/ExitWorktreeTool.js");
var ConfigTool_js_1 = require("./tools/ConfigTool/ConfigTool.js");
var TaskCreateTool_js_1 = require("./tools/TaskCreateTool/TaskCreateTool.js");
var TaskGetTool_js_1 = require("./tools/TaskGetTool/TaskGetTool.js");
var TaskUpdateTool_js_1 = require("./tools/TaskUpdateTool/TaskUpdateTool.js");
var TaskListTool_js_1 = require("./tools/TaskListTool/TaskListTool.js");
var uniqBy_js_1 = require("lodash-es/uniqBy.js");
var toolSearch_js_1 = require("./utils/toolSearch.js");
var tasks_js_1 = require("./utils/tasks.js");
// Dead code elimination: conditional import for CLAUDE_CODE_VERIFY_PLAN
/* eslint-disable custom-rules/no-process-env-top-level, @typescript-eslint/no-require-imports */
var VerifyPlanExecutionTool = process.env.CLAUDE_CODE_VERIFY_PLAN === 'true'
    ? require('./tools/VerifyPlanExecutionTool/VerifyPlanExecutionTool.js')
        .VerifyPlanExecutionTool
    : null;
/* eslint-enable custom-rules/no-process-env-top-level, @typescript-eslint/no-require-imports */
var SyntheticOutputTool_js_1 = require("./tools/SyntheticOutputTool/SyntheticOutputTool.js");
var tools_js_1 = require("./constants/tools.js");
Object.defineProperty(exports, "ALL_AGENT_DISALLOWED_TOOLS", { enumerable: true, get: function () { return tools_js_1.ALL_AGENT_DISALLOWED_TOOLS; } });
Object.defineProperty(exports, "CUSTOM_AGENT_DISALLOWED_TOOLS", { enumerable: true, get: function () { return tools_js_1.CUSTOM_AGENT_DISALLOWED_TOOLS; } });
Object.defineProperty(exports, "ASYNC_AGENT_ALLOWED_TOOLS", { enumerable: true, get: function () { return tools_js_1.ASYNC_AGENT_ALLOWED_TOOLS; } });
Object.defineProperty(exports, "COORDINATOR_MODE_ALLOWED_TOOLS", { enumerable: true, get: function () { return tools_js_1.COORDINATOR_MODE_ALLOWED_TOOLS; } });
var bun_bundle_1 = require("bun:bundle");
// Dead code elimination: conditional import for OVERFLOW_TEST_TOOL
/* eslint-disable custom-rules/no-process-env-top-level, @typescript-eslint/no-require-imports */
var OverflowTestTool = (0, bun_bundle_1.feature)('OVERFLOW_TEST_TOOL')
    ? require('./tools/OverflowTestTool/OverflowTestTool.js').OverflowTestTool
    : null;
var CtxInspectTool = (0, bun_bundle_1.feature)('CONTEXT_COLLAPSE')
    ? require('./tools/CtxInspectTool/CtxInspectTool.js').CtxInspectTool
    : null;
var TerminalCaptureTool = (0, bun_bundle_1.feature)('TERMINAL_PANEL')
    ? require('./tools/TerminalCaptureTool/TerminalCaptureTool.js')
        .TerminalCaptureTool
    : null;
var WebBrowserTool = (0, bun_bundle_1.feature)('WEB_BROWSER_TOOL')
    ? require('./tools/WebBrowserTool/WebBrowserTool.js').WebBrowserTool
    : null;
var coordinatorModeModule = (0, bun_bundle_1.feature)('COORDINATOR_MODE')
    ? require('./coordinator/coordinatorMode.js')
    : null;
var SnipTool = (0, bun_bundle_1.feature)('HISTORY_SNIP')
    ? require('./tools/SnipTool/SnipTool.js').SnipTool
    : null;
var ListPeersTool = (0, bun_bundle_1.feature)('UDS_INBOX')
    ? require('./tools/ListPeersTool/ListPeersTool.js').ListPeersTool
    : null;
var WorkflowTool = (0, bun_bundle_1.feature)('WORKFLOW_SCRIPTS')
    ? (function () {
        require('./tools/WorkflowTool/bundled/index.js').initBundledWorkflows();
        return require('./tools/WorkflowTool/WorkflowTool.js').WorkflowTool;
    })()
    : null;
var permissions_js_1 = require("./utils/permissions/permissions.js");
var embeddedTools_js_1 = require("./utils/embeddedTools.js");
var envUtils_js_1 = require("./utils/envUtils.js");
var shellToolUtils_js_1 = require("./utils/shell/shellToolUtils.js");
var agentSwarmsEnabled_js_1 = require("./utils/agentSwarmsEnabled.js");
var worktreeModeEnabled_js_1 = require("./utils/worktreeModeEnabled.js");
var constants_js_1 = require("./tools/REPLTool/constants.js");
Object.defineProperty(exports, "REPL_ONLY_TOOLS", { enumerable: true, get: function () { return constants_js_1.REPL_ONLY_TOOLS; } });
/* eslint-disable @typescript-eslint/no-require-imports */
var getPowerShellTool = function () {
    if (!(0, shellToolUtils_js_1.isPowerShellToolEnabled)())
        return null;
    return require('./tools/PowerShellTool/PowerShellTool.js').PowerShellTool;
};
/* eslint-enable @typescript-eslint/no-require-imports */
/**
 * Predefined tool presets that can be used with --tools flag
 */
exports.TOOL_PRESETS = ['default'];
function parseToolPreset(preset) {
    var presetString = preset.toLowerCase();
    if (!exports.TOOL_PRESETS.includes(presetString)) {
        return null;
    }
    return presetString;
}
/**
 * Get the list of tool names for a given preset
 * Filters out tools that are disabled via isEnabled() check
 * @param preset The preset name
 * @returns Array of tool names
 */
function getToolsForDefaultPreset() {
    var tools = getAllBaseTools();
    var isEnabled = tools.map(function (tool) { return tool.isEnabled(); });
    return tools.filter(function (_, i) { return isEnabled[i]; }).map(function (tool) { return tool.name; });
}
/**
 * Get the complete exhaustive list of all tools that could be available
 * in the current environment (respecting process.env flags).
 * This is the source of truth for ALL tools.
 */
/**
 * NOTE: This MUST stay in sync with https://console.statsig.com/4aF3Ewatb6xPVpCwxb5nA3/dynamic_configs/claude_code_global_system_caching, in order to cache the system prompt across users.
 */
function getAllBaseTools() {
    return __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([
        AgentTool_js_1.AgentTool,
        TaskOutputTool_js_1.TaskOutputTool,
        BashTool_js_1.BashTool
    ], ((0, embeddedTools_js_1.hasEmbeddedSearchTools)() ? [] : [GlobTool_js_1.GlobTool, GrepTool_js_1.GrepTool]), true), [
        ExitPlanModeV2Tool_js_1.ExitPlanModeV2Tool,
        FileReadTool_js_1.FileReadTool,
        FileEditTool_js_1.FileEditTool,
        FileWriteTool_js_1.FileWriteTool,
        NotebookEditTool_js_1.NotebookEditTool,
        WebFetchTool_js_1.WebFetchTool,
        TodoWriteTool_js_1.TodoWriteTool,
        WebSearchTool_js_1.WebSearchTool,
        TaskStopTool_js_1.TaskStopTool,
        AskUserQuestionTool_js_1.AskUserQuestionTool,
        SkillTool_js_1.SkillTool,
        EnterPlanModeTool_js_1.EnterPlanModeTool
    ], false), (process.env.USER_TYPE === 'ant' ? [ConfigTool_js_1.ConfigTool] : []), true), (SuggestBackgroundPRTool ? [SuggestBackgroundPRTool] : []), true), (WebBrowserTool ? [WebBrowserTool] : []), true), ((0, tasks_js_1.isTodoV2Enabled)()
        ? [TaskCreateTool_js_1.TaskCreateTool, TaskGetTool_js_1.TaskGetTool, TaskUpdateTool_js_1.TaskUpdateTool, TaskListTool_js_1.TaskListTool]
        : []), true), (OverflowTestTool ? [OverflowTestTool] : []), true), (CtxInspectTool ? [CtxInspectTool] : []), true), (TerminalCaptureTool ? [TerminalCaptureTool] : []), true), ((0, envUtils_js_1.isEnvTruthy)(process.env.ENABLE_LSP_TOOL) ? [LSPTool_js_1.LSPTool] : []), true), ((0, worktreeModeEnabled_js_1.isWorktreeModeEnabled)() ? [EnterWorktreeTool_js_1.EnterWorktreeTool, ExitWorktreeTool_js_1.ExitWorktreeTool] : []), true), [
        getSendMessageTool()
    ], false), (ListPeersTool ? [ListPeersTool] : []), true), ((0, agentSwarmsEnabled_js_1.isAgentSwarmsEnabled)()
        ? [getTeamCreateTool(), getTeamDeleteTool()]
        : []), true), (VerifyPlanExecutionTool ? [VerifyPlanExecutionTool] : []), true), (process.env.USER_TYPE === 'ant' && REPLTool ? [REPLTool] : []), true), (WorkflowTool ? [WorkflowTool] : []), true), (SleepTool ? [SleepTool] : []), true), cronTools, true), (RemoteTriggerTool ? [RemoteTriggerTool] : []), true), (MonitorTool ? [MonitorTool] : []), true), [
        BriefTool_js_1.BriefTool
    ], false), (SendUserFileTool ? [SendUserFileTool] : []), true), (PushNotificationTool ? [PushNotificationTool] : []), true), (SubscribePRTool ? [SubscribePRTool] : []), true), (getPowerShellTool() ? [getPowerShellTool()] : []), true), (SnipTool ? [SnipTool] : []), true), (process.env.NODE_ENV === 'test' ? [TestingPermissionTool_js_1.TestingPermissionTool] : []), true), [
        ListMcpResourcesTool_js_1.ListMcpResourcesTool,
        ReadMcpResourceTool_js_1.ReadMcpResourceTool
    ], false), ((0, toolSearch_js_1.isToolSearchEnabledOptimistic)() ? [ToolSearchTool_js_1.ToolSearchTool] : []), true);
}
/**
 * Filters out tools that are blanket-denied by the permission context.
 * A tool is filtered out if there's a deny rule matching its name with no
 * ruleContent (i.e., a blanket deny for that tool).
 *
 * Uses the same matcher as the runtime permission check (step 1a), so MCP
 * server-prefix rules like `mcp__server` strip all tools from that server
 * before the model sees them — not just at call time.
 */
function filterToolsByDenyRules(tools, permissionContext) {
    return tools.filter(function (tool) { return !(0, permissions_js_1.getDenyRuleForTool)(permissionContext, tool); });
}
var getTools = function (permissionContext) {
    // Simple mode: only Bash, Read, and Edit tools
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_SIMPLE)) {
        // --bare + REPL mode: REPL wraps Bash/Read/Edit/etc inside the VM, so
        // return REPL instead of the raw primitives. Matches the non-bare path
        // below which also hides REPL_ONLY_TOOLS when REPL is enabled.
        if ((0, constants_js_1.isReplModeEnabled)() && REPLTool) {
            var replSimple = [REPLTool];
            if ((0, bun_bundle_1.feature)('COORDINATOR_MODE') &&
                (coordinatorModeModule === null || coordinatorModeModule === void 0 ? void 0 : coordinatorModeModule.isCoordinatorMode())) {
                replSimple.push(TaskStopTool_js_1.TaskStopTool, getSendMessageTool());
            }
            return filterToolsByDenyRules(replSimple, permissionContext);
        }
        var simpleTools = [BashTool_js_1.BashTool, FileReadTool_js_1.FileReadTool, FileEditTool_js_1.FileEditTool];
        // When coordinator mode is also active, include AgentTool and TaskStopTool
        // so the coordinator gets Task+TaskStop (via useMergedTools filtering) and
        // workers get Bash/Read/Edit (via filterToolsForAgent filtering).
        if ((0, bun_bundle_1.feature)('COORDINATOR_MODE') &&
            (coordinatorModeModule === null || coordinatorModeModule === void 0 ? void 0 : coordinatorModeModule.isCoordinatorMode())) {
            simpleTools.push(AgentTool_js_1.AgentTool, TaskStopTool_js_1.TaskStopTool, getSendMessageTool());
        }
        return filterToolsByDenyRules(simpleTools, permissionContext);
    }
    // Get all base tools and filter out special tools that get added conditionally
    var specialTools = new Set([
        ListMcpResourcesTool_js_1.ListMcpResourcesTool.name,
        ReadMcpResourceTool_js_1.ReadMcpResourceTool.name,
        SyntheticOutputTool_js_1.SYNTHETIC_OUTPUT_TOOL_NAME,
    ]);
    var tools = getAllBaseTools().filter(function (tool) { return !specialTools.has(tool.name); });
    // Filter out tools that are denied by the deny rules
    var allowedTools = filterToolsByDenyRules(tools, permissionContext);
    // When REPL mode is enabled, hide primitive tools from direct use.
    // They're still accessible inside REPL via the VM context.
    if ((0, constants_js_1.isReplModeEnabled)()) {
        var replEnabled = allowedTools.some(function (tool) {
            return (0, Tool_js_1.toolMatchesName)(tool, constants_js_1.REPL_TOOL_NAME);
        });
        if (replEnabled) {
            allowedTools = allowedTools.filter(function (tool) { return !constants_js_1.REPL_ONLY_TOOLS.has(tool.name); });
        }
    }
    var isEnabled = allowedTools.map(function (_) { return _.isEnabled(); });
    return allowedTools.filter(function (_, i) { return isEnabled[i]; });
};
exports.getTools = getTools;
/**
 * Assemble the full tool pool for a given permission context and MCP tools.
 *
 * This is the single source of truth for combining built-in tools with MCP tools.
 * Both REPL.tsx (via useMergedTools hook) and runAgent.ts (for coordinator workers)
 * use this function to ensure consistent tool pool assembly.
 *
 * The function:
 * 1. Gets built-in tools via getTools() (respects mode filtering)
 * 2. Filters MCP tools by deny rules
 * 3. Deduplicates by tool name (built-in tools take precedence)
 *
 * @param permissionContext - Permission context for filtering built-in tools
 * @param mcpTools - MCP tools from appState.mcp.tools
 * @returns Combined, deduplicated array of built-in and MCP tools
 */
function assembleToolPool(permissionContext, mcpTools) {
    var builtInTools = (0, exports.getTools)(permissionContext);
    // Filter out MCP tools that are in the deny list
    var allowedMcpTools = filterToolsByDenyRules(mcpTools, permissionContext);
    // Sort each partition for prompt-cache stability, keeping built-ins as a
    // contiguous prefix. The server's claude_code_system_cache_policy places a
    // global cache breakpoint after the last prefix-matched built-in tool; a flat
    // sort would interleave MCP tools into built-ins and invalidate all downstream
    // cache keys whenever an MCP tool sorts between existing built-ins. uniqBy
    // preserves insertion order, so built-ins win on name conflict.
    // Avoid Array.toSorted (Node 20+) — we support Node 18. builtInTools is
    // readonly so copy-then-sort; allowedMcpTools is a fresh .filter() result.
    var byName = function (a, b) { return a.name.localeCompare(b.name); };
    return (0, uniqBy_js_1.default)(__spreadArray([], builtInTools, true).sort(byName).concat(allowedMcpTools.sort(byName)), 'name');
}
/**
 * Get all tools including both built-in tools and MCP tools.
 *
 * This is the preferred function when you need the complete tools list for:
 * - Tool search threshold calculations (isToolSearchEnabled)
 * - Token counting that includes MCP tools
 * - Any context where MCP tools should be considered
 *
 * Use getTools() only when you specifically need just built-in tools.
 *
 * @param permissionContext - Permission context for filtering built-in tools
 * @param mcpTools - MCP tools from appState.mcp.tools
 * @returns Combined array of built-in and MCP tools
 */
function getMergedTools(permissionContext, mcpTools) {
    var builtInTools = (0, exports.getTools)(permissionContext);
    return __spreadArray(__spreadArray([], builtInTools, true), mcpTools, true);
}
