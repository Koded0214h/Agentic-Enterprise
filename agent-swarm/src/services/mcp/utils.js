"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterToolsByServer = filterToolsByServer;
exports.commandBelongsToServer = commandBelongsToServer;
exports.filterCommandsByServer = filterCommandsByServer;
exports.filterMcpPromptsByServer = filterMcpPromptsByServer;
exports.filterResourcesByServer = filterResourcesByServer;
exports.excludeToolsByServer = excludeToolsByServer;
exports.excludeCommandsByServer = excludeCommandsByServer;
exports.excludeResourcesByServer = excludeResourcesByServer;
exports.hashMcpConfig = hashMcpConfig;
exports.excludeStalePluginClients = excludeStalePluginClients;
exports.isToolFromMcpServer = isToolFromMcpServer;
exports.isMcpTool = isMcpTool;
exports.isMcpCommand = isMcpCommand;
exports.describeMcpConfigFilePath = describeMcpConfigFilePath;
exports.getScopeLabel = getScopeLabel;
exports.ensureConfigScope = ensureConfigScope;
exports.ensureTransport = ensureTransport;
exports.parseHeaders = parseHeaders;
exports.getProjectMcpServerStatus = getProjectMcpServerStatus;
exports.getMcpServerScopeFromToolName = getMcpServerScopeFromToolName;
exports.extractAgentMcpServers = extractAgentMcpServers;
exports.getLoggingSafeMcpBaseUrl = getLoggingSafeMcpBaseUrl;
var crypto_1 = require("crypto");
var path_1 = require("path");
var state_js_1 = require("../../bootstrap/state.js");
var cwd_js_1 = require("../../utils/cwd.js");
var env_js_1 = require("../../utils/env.js");
var constants_js_1 = require("../../utils/settings/constants.js");
var settings_js_1 = require("../../utils/settings/settings.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var config_js_1 = require("./config.js");
var mcpStringUtils_js_1 = require("./mcpStringUtils.js");
var normalization_js_1 = require("./normalization.js");
var types_js_1 = require("./types.js");
/**
 * Filters tools by MCP server name
 *
 * @param tools Array of tools to filter
 * @param serverName Name of the MCP server
 * @returns Tools belonging to the specified server
 */
function filterToolsByServer(tools, serverName) {
    var prefix = "mcp__".concat((0, normalization_js_1.normalizeNameForMCP)(serverName), "__");
    return tools.filter(function (tool) { var _a; return (_a = tool.name) === null || _a === void 0 ? void 0 : _a.startsWith(prefix); });
}
/**
 * True when a command belongs to the given MCP server.
 *
 * MCP **prompts** are named `mcp__<server>__<prompt>` (wire-format constraint);
 * MCP **skills** are named `<server>:<skill>` (matching plugin/nested-dir skill
 * naming). Both live in `mcp.commands`, so cleanup and filtering must match
 * either shape.
 */
function commandBelongsToServer(command, serverName) {
    var normalized = (0, normalization_js_1.normalizeNameForMCP)(serverName);
    var name = command.name;
    if (!name)
        return false;
    return (name.startsWith("mcp__".concat(normalized, "__")) || name.startsWith("".concat(normalized, ":")));
}
/**
 * Filters commands by MCP server name
 * @param commands Array of commands to filter
 * @param serverName Name of the MCP server
 * @returns Commands belonging to the specified server
 */
function filterCommandsByServer(commands, serverName) {
    return commands.filter(function (c) { return commandBelongsToServer(c, serverName); });
}
/**
 * Filters MCP **prompts** (not skills) by server. Used by the `/mcp` menu
 * capabilities display — skills are a separate feature shown in `/skills`,
 * so they mustn't inflate the "prompts" capability badge.
 *
 * The distinguisher is `loadedFrom === 'mcp'`: MCP skills set it, MCP
 * prompts don't (they use `isMcp: true` instead).
 */
function filterMcpPromptsByServer(commands, serverName) {
    return commands.filter(function (c) {
        return commandBelongsToServer(c, serverName) &&
            !(c.type === 'prompt' && c.loadedFrom === 'mcp');
    });
}
/**
 * Filters resources by MCP server name
 * @param resources Array of resources to filter
 * @param serverName Name of the MCP server
 * @returns Resources belonging to the specified server
 */
function filterResourcesByServer(resources, serverName) {
    return resources.filter(function (resource) { return resource.server === serverName; });
}
/**
 * Removes tools belonging to a specific MCP server
 * @param tools Array of tools
 * @param serverName Name of the MCP server to exclude
 * @returns Tools not belonging to the specified server
 */
function excludeToolsByServer(tools, serverName) {
    var prefix = "mcp__".concat((0, normalization_js_1.normalizeNameForMCP)(serverName), "__");
    return tools.filter(function (tool) { var _a; return !((_a = tool.name) === null || _a === void 0 ? void 0 : _a.startsWith(prefix)); });
}
/**
 * Removes commands belonging to a specific MCP server
 * @param commands Array of commands
 * @param serverName Name of the MCP server to exclude
 * @returns Commands not belonging to the specified server
 */
function excludeCommandsByServer(commands, serverName) {
    return commands.filter(function (c) { return !commandBelongsToServer(c, serverName); });
}
/**
 * Removes resources belonging to a specific MCP server
 * @param resources Map of server resources
 * @param serverName Name of the MCP server to exclude
 * @returns Resources map without the specified server
 */
function excludeResourcesByServer(resources, serverName) {
    var result = __assign({}, resources);
    delete result[serverName];
    return result;
}
/**
 * Stable hash of an MCP server config for change detection on /reload-plugins.
 * Excludes `scope` (provenance, not content — moving a server from .mcp.json
 * to settings.json shouldn't reconnect it). Keys sorted so `{a:1,b:2}` and
 * `{b:2,a:1}` hash the same.
 */
function hashMcpConfig(config) {
    var _scope = config.scope, rest = __rest(config, ["scope"]);
    var stable = (0, slowOperations_js_1.jsonStringify)(rest, function (_k, v) {
        if (v && typeof v === 'object' && !Array.isArray(v)) {
            var obj = v;
            var sorted = {};
            for (var _i = 0, _a = Object.keys(obj).sort(); _i < _a.length; _i++) {
                var k = _a[_i];
                sorted[k] = obj[k];
            }
            return sorted;
        }
        return v;
    });
    return (0, crypto_1.createHash)('sha256').update(stable).digest('hex').slice(0, 16);
}
/**
 * Remove stale MCP clients and their tools/commands/resources. A client is
 * stale if:
 *   - scope 'dynamic' and name no longer in configs (plugin disabled), or
 *   - config hash changed (args/url/env edited in .mcp.json) — any scope
 *
 * The removal case is scoped to 'dynamic' so /reload-plugins can't
 * accidentally disconnect a user-configured server that's just temporarily
 * absent from the in-memory config (e.g. during a partial reload). The
 * config-changed case applies to all scopes — if the config actually changed
 * on disk, reconnecting is what you want.
 *
 * Returns the stale clients so the caller can disconnect them (clearServerCache).
 */
function excludeStalePluginClients(mcp, configs) {
    var stale = mcp.clients.filter(function (c) {
        var fresh = configs[c.name];
        if (!fresh)
            return c.config.scope === 'dynamic';
        return hashMcpConfig(c.config) !== hashMcpConfig(fresh);
    });
    if (stale.length === 0) {
        return __assign(__assign({}, mcp), { stale: [] });
    }
    var tools = mcp.tools, commands = mcp.commands, resources = mcp.resources;
    for (var _i = 0, stale_1 = stale; _i < stale_1.length; _i++) {
        var s = stale_1[_i];
        tools = excludeToolsByServer(tools, s.name);
        commands = excludeCommandsByServer(commands, s.name);
        resources = excludeResourcesByServer(resources, s.name);
    }
    var staleNames = new Set(stale.map(function (c) { return c.name; }));
    return {
        clients: mcp.clients.filter(function (c) { return !staleNames.has(c.name); }),
        tools: tools,
        commands: commands,
        resources: resources,
        stale: stale,
    };
}
/**
 * Checks if a tool name belongs to a specific MCP server
 * @param toolName The tool name to check
 * @param serverName The server name to match against
 * @returns True if the tool belongs to the specified server
 */
function isToolFromMcpServer(toolName, serverName) {
    var info = (0, mcpStringUtils_js_1.mcpInfoFromString)(toolName);
    return (info === null || info === void 0 ? void 0 : info.serverName) === serverName;
}
/**
 * Checks if a tool belongs to any MCP server
 * @param tool The tool to check
 * @returns True if the tool is from an MCP server
 */
function isMcpTool(tool) {
    var _a;
    return ((_a = tool.name) === null || _a === void 0 ? void 0 : _a.startsWith('mcp__')) || tool.isMcp === true;
}
/**
 * Checks if a command belongs to any MCP server
 * @param command The command to check
 * @returns True if the command is from an MCP server
 */
function isMcpCommand(command) {
    var _a;
    return ((_a = command.name) === null || _a === void 0 ? void 0 : _a.startsWith('mcp__')) || command.isMcp === true;
}
/**
 * Describe the file path for a given MCP config scope.
 * @param scope The config scope ('user', 'project', 'local', or 'dynamic')
 * @returns A description of where the config is stored
 */
function describeMcpConfigFilePath(scope) {
    switch (scope) {
        case 'user':
            return (0, env_js_1.getGlobalClaudeFile)();
        case 'project':
            return (0, path_1.join)((0, cwd_js_1.getCwd)(), '.mcp.json');
        case 'local':
            return "".concat((0, env_js_1.getGlobalClaudeFile)(), " [project: ").concat((0, cwd_js_1.getCwd)(), "]");
        case 'dynamic':
            return 'Dynamically configured';
        case 'enterprise':
            return (0, config_js_1.getEnterpriseMcpFilePath)();
        case 'claudeai':
            return 'claude.ai';
        default:
            return scope;
    }
}
function getScopeLabel(scope) {
    switch (scope) {
        case 'local':
            return 'Local config (private to you in this project)';
        case 'project':
            return 'Project config (shared via .mcp.json)';
        case 'user':
            return 'User config (available in all your projects)';
        case 'dynamic':
            return 'Dynamic config (from command line)';
        case 'enterprise':
            return 'Enterprise config (managed by your organization)';
        case 'claudeai':
            return 'claude.ai config';
        default:
            return scope;
    }
}
function ensureConfigScope(scope) {
    if (!scope)
        return 'local';
    if (!(0, types_js_1.ConfigScopeSchema)().options.includes(scope)) {
        throw new Error("Invalid scope: ".concat(scope, ". Must be one of: ").concat((0, types_js_1.ConfigScopeSchema)().options.join(', ')));
    }
    return scope;
}
function ensureTransport(type) {
    if (!type)
        return 'stdio';
    if (type !== 'stdio' && type !== 'sse' && type !== 'http') {
        throw new Error("Invalid transport type: ".concat(type, ". Must be one of: stdio, sse, http"));
    }
    return type;
}
function parseHeaders(headerArray) {
    var headers = {};
    for (var _i = 0, headerArray_1 = headerArray; _i < headerArray_1.length; _i++) {
        var header = headerArray_1[_i];
        var colonIndex = header.indexOf(':');
        if (colonIndex === -1) {
            throw new Error("Invalid header format: \"".concat(header, "\". Expected format: \"Header-Name: value\""));
        }
        var key = header.substring(0, colonIndex).trim();
        var value = header.substring(colonIndex + 1).trim();
        if (!key) {
            throw new Error("Invalid header: \"".concat(header, "\". Header name cannot be empty."));
        }
        headers[key] = value;
    }
    return headers;
}
function getProjectMcpServerStatus(serverName) {
    var _a, _b;
    var settings = (0, settings_js_1.getSettings_DEPRECATED)();
    var normalizedName = (0, normalization_js_1.normalizeNameForMCP)(serverName);
    // TODO: This fails an e2e test if the ?. is not present. This is likely a bug in the e2e test.
    // Will fix this in a follow-up PR.
    if ((_a = settings === null || settings === void 0 ? void 0 : settings.disabledMcpjsonServers) === null || _a === void 0 ? void 0 : _a.some(function (name) { return (0, normalization_js_1.normalizeNameForMCP)(name) === normalizedName; })) {
        return 'rejected';
    }
    if (((_b = settings === null || settings === void 0 ? void 0 : settings.enabledMcpjsonServers) === null || _b === void 0 ? void 0 : _b.some(function (name) { return (0, normalization_js_1.normalizeNameForMCP)(name) === normalizedName; })) ||
        (settings === null || settings === void 0 ? void 0 : settings.enableAllProjectMcpServers)) {
        return 'approved';
    }
    // In bypass permissions mode (--dangerously-skip-permissions), there's no way
    // to show an approval popup. Auto-approve if projectSettings is enabled since
    // the user has explicitly chosen to bypass all permission checks.
    // SECURITY: We intentionally only check skipDangerousModePermissionPrompt via
    // hasSkipDangerousModePermissionPrompt(), which reads from userSettings/localSettings/
    // flagSettings/policySettings but NOT projectSettings (repo-level .claude/settings.json).
    // This is intentional: a repo should not be able to accept the bypass dialog on behalf of
    // users. We also do NOT check getSessionBypassPermissionsMode() here because
    // sessionBypassPermissionsMode can be set from project settings before the dialog is shown,
    // which would allow RCE attacks via malicious project settings.
    if ((0, settings_js_1.hasSkipDangerousModePermissionPrompt)() &&
        (0, constants_js_1.isSettingSourceEnabled)('projectSettings')) {
        return 'approved';
    }
    // In non-interactive mode (SDK, claude -p, piped input), there's no way to
    // show an approval popup. Auto-approve if projectSettings is enabled since:
    // 1. The user/developer explicitly chose to run in this mode
    // 2. For SDK, projectSettings is off by default - they must explicitly enable it
    // 3. For -p mode, the help text warns to only use in trusted directories
    if ((0, state_js_1.getIsNonInteractiveSession)() &&
        (0, constants_js_1.isSettingSourceEnabled)('projectSettings')) {
        return 'approved';
    }
    return 'pending';
}
/**
 * Get the scope/settings source for an MCP server from a tool name
 * @param toolName MCP tool name (format: mcp__serverName__toolName)
 * @returns ConfigScope or null if not an MCP tool or server not found
 */
function getMcpServerScopeFromToolName(toolName) {
    var _a;
    if (!isMcpTool({ name: toolName })) {
        return null;
    }
    // Extract server name from tool name (format: mcp__serverName__toolName)
    var mcpInfo = (0, mcpStringUtils_js_1.mcpInfoFromString)(toolName);
    if (!mcpInfo) {
        return null;
    }
    // Look up server config
    var serverConfig = (0, config_js_1.getMcpConfigByName)(mcpInfo.serverName);
    // Fallback: claude.ai servers have normalized names starting with "claude_ai_"
    // but aren't in getMcpConfigByName (they're fetched async separately)
    if (!serverConfig && mcpInfo.serverName.startsWith('claude_ai_')) {
        return 'claudeai';
    }
    return (_a = serverConfig === null || serverConfig === void 0 ? void 0 : serverConfig.scope) !== null && _a !== void 0 ? _a : null;
}
// Type guards for MCP server config types
function isStdioConfig(config) {
    return config.type === 'stdio' || config.type === undefined;
}
function isSSEConfig(config) {
    return config.type === 'sse';
}
function isHTTPConfig(config) {
    return config.type === 'http';
}
function isWebSocketConfig(config) {
    return config.type === 'ws';
}
/**
 * Extracts MCP server definitions from agent frontmatter and groups them by server name.
 * This is used to show agent-specific MCP servers in the /mcp command.
 *
 * @param agents Array of agent definitions
 * @returns Array of AgentMcpServerInfo, grouped by server name with list of source agents
 */
function extractAgentMcpServers(agents) {
    var _a;
    // Map: server name -> { config, sourceAgents }
    var serverMap = new Map();
    for (var _i = 0, agents_1 = agents; _i < agents_1.length; _i++) {
        var agent = agents_1[_i];
        if (!((_a = agent.mcpServers) === null || _a === void 0 ? void 0 : _a.length))
            continue;
        for (var _b = 0, _c = agent.mcpServers; _b < _c.length; _b++) {
            var spec = _c[_b];
            // Skip string references - these refer to servers already in global config
            if (typeof spec === 'string')
                continue;
            // Inline definition as { [name]: config }
            var entries = Object.entries(spec);
            if (entries.length !== 1)
                continue;
            var _d = entries[0], serverName = _d[0], serverConfig = _d[1];
            var existing = serverMap.get(serverName);
            if (existing) {
                // Add this agent as another source
                if (!existing.sourceAgents.includes(agent.agentType)) {
                    existing.sourceAgents.push(agent.agentType);
                }
            }
            else {
                // New server
                serverMap.set(serverName, {
                    config: __assign(__assign({}, serverConfig), { name: serverName }),
                    sourceAgents: [agent.agentType],
                });
            }
        }
    }
    // Convert map to array of AgentMcpServerInfo
    // Only include transport types supported by AgentMcpServerInfo
    var result = [];
    for (var _e = 0, serverMap_1 = serverMap; _e < serverMap_1.length; _e++) {
        var _f = serverMap_1[_e], name_1 = _f[0], _g = _f[1], config = _g.config, sourceAgents = _g.sourceAgents;
        // Use type guards to properly narrow the discriminated union type
        // Only include transport types that are supported by AgentMcpServerInfo
        if (isStdioConfig(config)) {
            result.push({
                name: name_1,
                sourceAgents: sourceAgents,
                transport: 'stdio',
                command: config.command,
                needsAuth: false,
            });
        }
        else if (isSSEConfig(config)) {
            result.push({
                name: name_1,
                sourceAgents: sourceAgents,
                transport: 'sse',
                url: config.url,
                needsAuth: true,
            });
        }
        else if (isHTTPConfig(config)) {
            result.push({
                name: name_1,
                sourceAgents: sourceAgents,
                transport: 'http',
                url: config.url,
                needsAuth: true,
            });
        }
        else if (isWebSocketConfig(config)) {
            result.push({
                name: name_1,
                sourceAgents: sourceAgents,
                transport: 'ws',
                url: config.url,
                needsAuth: false,
            });
        }
        // Skip unsupported transport types (sdk, claudeai-proxy, sse-ide, ws-ide)
        // These are internal types not meant for agent MCP server display
    }
    return result.sort(function (a, b) { return a.name.localeCompare(b.name); });
}
/**
 * Extracts the MCP server base URL (without query string) for analytics logging.
 * Query strings are stripped because they can contain access tokens.
 * Trailing slashes are also removed for normalization.
 * Returns undefined for stdio/sdk servers or if URL parsing fails.
 */
function getLoggingSafeMcpBaseUrl(config) {
    if (!('url' in config) || typeof config.url !== 'string') {
        return undefined;
    }
    try {
        var url = new URL(config.url);
        url.search = '';
        return url.toString().replace(/\/$/, '');
    }
    catch (_a) {
        return undefined;
    }
}
