"use strict";
// biome-ignore-all assist/source/organizeImports: ANT-ONLY import markers must not be reordered
/**
 * Shared event metadata enrichment for analytics systems
 *
 * This module provides a single source of truth for collecting and formatting
 * event metadata across all analytics systems (Datadog, 1P).
 */
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
exports.sanitizeToolNameForAnalytics = sanitizeToolNameForAnalytics;
exports.isToolDetailsLoggingEnabled = isToolDetailsLoggingEnabled;
exports.isAnalyticsToolDetailsLoggingEnabled = isAnalyticsToolDetailsLoggingEnabled;
exports.mcpToolDetailsForAnalytics = mcpToolDetailsForAnalytics;
exports.extractMcpToolDetails = extractMcpToolDetails;
exports.extractSkillName = extractSkillName;
exports.extractToolInputForTelemetry = extractToolInputForTelemetry;
exports.getFileExtensionForAnalytics = getFileExtensionForAnalytics;
exports.getFileExtensionsFromBashCommand = getFileExtensionsFromBashCommand;
exports.getEventMetadata = getEventMetadata;
exports.to1PEventFormat = to1PEventFormat;
var path_1 = require("path");
var memoize_js_1 = require("lodash-es/memoize.js");
var env_js_1 = require("../../utils/env.js");
var envDynamic_js_1 = require("../../utils/envDynamic.js");
var betas_js_1 = require("../../utils/betas.js");
var model_js_1 = require("../../utils/model/model.js");
var state_js_1 = require("../../bootstrap/state.js");
var envUtils_js_1 = require("../../utils/envUtils.js");
var officialRegistry_js_1 = require("../mcp/officialRegistry.js");
var auth_js_1 = require("../../utils/auth.js");
var git_js_1 = require("../../utils/git.js");
var platform_js_1 = require("../../utils/platform.js");
var agentContext_js_1 = require("../../utils/agentContext.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var teammate_js_1 = require("../../utils/teammate.js");
var bun_bundle_1 = require("bun:bundle");
/**
 * Sanitizes tool names for analytics logging to avoid PII exposure.
 *
 * MCP tool names follow the format `mcp__<server>__<tool>` and can reveal
 * user-specific server configurations, which is considered PII-medium.
 * This function redacts MCP tool names while preserving built-in tool names
 * (Bash, Read, Write, etc.) which are safe to log.
 *
 * @param toolName - The tool name to sanitize
 * @returns The original name for built-in tools, or 'mcp_tool' for MCP tools
 */
function sanitizeToolNameForAnalytics(toolName) {
    if (toolName.startsWith('mcp__')) {
        return 'mcp_tool';
    }
    return toolName;
}
/**
 * Check if detailed tool name logging is enabled for OTLP events.
 * When enabled, MCP server/tool names and Skill names are logged.
 * Disabled by default to protect PII (user-specific server configurations).
 *
 * Enable with OTEL_LOG_TOOL_DETAILS=1
 */
function isToolDetailsLoggingEnabled() {
    return (0, envUtils_js_1.isEnvTruthy)(process.env.OTEL_LOG_TOOL_DETAILS);
}
/**
 * Check if detailed tool name logging (MCP server/tool names) is enabled
 * for analytics events.
 *
 * Per go/taxonomy, MCP names are medium PII. We log them for:
 * - Cowork (entrypoint=local-agent) — no ZDR concept, log all MCPs
 * - claude.ai-proxied connectors — always official (from claude.ai's list)
 * - Servers whose URL matches the official MCP registry — directory
 *   connectors added via `claude mcp add`, not customer-specific config
 *
 * Custom/user-configured MCPs stay sanitized (toolName='mcp_tool').
 */
function isAnalyticsToolDetailsLoggingEnabled(mcpServerType, mcpServerBaseUrl) {
    if (process.env.CLAUDE_CODE_ENTRYPOINT === 'local-agent') {
        return true;
    }
    if (mcpServerType === 'claudeai-proxy') {
        return true;
    }
    if (mcpServerBaseUrl && (0, officialRegistry_js_1.isOfficialMcpUrl)(mcpServerBaseUrl)) {
        return true;
    }
    return false;
}
/**
 * Built-in first-party MCP servers whose names are fixed reserved strings,
 * not user-configured — so logging them is not PII. Checked in addition to
 * isAnalyticsToolDetailsLoggingEnabled's transport/URL gates, which a stdio
 * built-in would otherwise fail.
 *
 * Feature-gated so the set is empty when the feature is off: the name
 * reservation (main.tsx, config.ts addMcpServer) is itself feature-gated, so
 * a user-configured 'computer-use' is possible in builds without the feature.
 */
/* eslint-disable @typescript-eslint/no-require-imports */
var BUILTIN_MCP_SERVER_NAMES = new Set((0, bun_bundle_1.feature)('CHICAGO_MCP')
    ? [
        require('../../utils/computerUse/common.js').COMPUTER_USE_MCP_SERVER_NAME,
    ]
    : []);
/* eslint-enable @typescript-eslint/no-require-imports */
/**
 * Spreadable helper for logEvent payloads — returns {mcpServerName, mcpToolName}
 * if the gate passes, empty object otherwise. Consolidates the identical IIFE
 * pattern at each tengu_tool_use_* call site.
 */
function mcpToolDetailsForAnalytics(toolName, mcpServerType, mcpServerBaseUrl) {
    var details = extractMcpToolDetails(toolName);
    if (!details) {
        return {};
    }
    if (!BUILTIN_MCP_SERVER_NAMES.has(details.serverName) &&
        !isAnalyticsToolDetailsLoggingEnabled(mcpServerType, mcpServerBaseUrl)) {
        return {};
    }
    return {
        mcpServerName: details.serverName,
        mcpToolName: details.mcpToolName,
    };
}
/**
 * Extract MCP server and tool names from a full MCP tool name.
 * MCP tool names follow the format: mcp__<server>__<tool>
 *
 * @param toolName - The full tool name (e.g., 'mcp__slack__read_channel')
 * @returns Object with serverName and toolName, or undefined if not an MCP tool
 */
function extractMcpToolDetails(toolName) {
    if (!toolName.startsWith('mcp__')) {
        return undefined;
    }
    // Format: mcp__<server>__<tool>
    var parts = toolName.split('__');
    if (parts.length < 3) {
        return undefined;
    }
    var serverName = parts[1];
    // Tool name may contain __ so rejoin remaining parts
    var mcpToolName = parts.slice(2).join('__');
    if (!serverName || !mcpToolName) {
        return undefined;
    }
    return {
        serverName: serverName,
        mcpToolName: mcpToolName,
    };
}
/**
 * Extract skill name from Skill tool input.
 *
 * @param toolName - The tool name (should be 'Skill')
 * @param input - The tool input containing the skill name
 * @returns The skill name if this is a Skill tool call, undefined otherwise
 */
function extractSkillName(toolName, input) {
    if (toolName !== 'Skill') {
        return undefined;
    }
    if (typeof input === 'object' &&
        input !== null &&
        'skill' in input &&
        typeof input.skill === 'string') {
        return input
            .skill;
    }
    return undefined;
}
var TOOL_INPUT_STRING_TRUNCATE_AT = 512;
var TOOL_INPUT_STRING_TRUNCATE_TO = 128;
var TOOL_INPUT_MAX_JSON_CHARS = 4 * 1024;
var TOOL_INPUT_MAX_COLLECTION_ITEMS = 20;
var TOOL_INPUT_MAX_DEPTH = 2;
function truncateToolInputValue(value, depth) {
    if (depth === void 0) { depth = 0; }
    if (typeof value === 'string') {
        if (value.length > TOOL_INPUT_STRING_TRUNCATE_AT) {
            return "".concat(value.slice(0, TOOL_INPUT_STRING_TRUNCATE_TO), "\u2026[").concat(value.length, " chars]");
        }
        return value;
    }
    if (typeof value === 'number' ||
        typeof value === 'boolean' ||
        value === null ||
        value === undefined) {
        return value;
    }
    if (depth >= TOOL_INPUT_MAX_DEPTH) {
        return '<nested>';
    }
    if (Array.isArray(value)) {
        var mapped = value
            .slice(0, TOOL_INPUT_MAX_COLLECTION_ITEMS)
            .map(function (v) { return truncateToolInputValue(v, depth + 1); });
        if (value.length > TOOL_INPUT_MAX_COLLECTION_ITEMS) {
            mapped.push("\u2026[".concat(value.length, " items]"));
        }
        return mapped;
    }
    if (typeof value === 'object') {
        var entries = Object.entries(value)
            // Skip internal marker keys (e.g. _simulatedSedEdit re-introduced by
            // SedEditPermissionRequest) so they don't leak into telemetry.
            .filter(function (_a) {
            var k = _a[0];
            return !k.startsWith('_');
        });
        var mapped = entries
            .slice(0, TOOL_INPUT_MAX_COLLECTION_ITEMS)
            .map(function (_a) {
            var k = _a[0], v = _a[1];
            return [k, truncateToolInputValue(v, depth + 1)];
        });
        if (entries.length > TOOL_INPUT_MAX_COLLECTION_ITEMS) {
            mapped.push(['…', "".concat(entries.length, " keys")]);
        }
        return Object.fromEntries(mapped);
    }
    return String(value);
}
/**
 * Serialize a tool's input arguments for the OTel tool_result event.
 * Truncates long strings and deep nesting to keep the output bounded while
 * preserving forensically useful fields like file paths, URLs, and MCP args.
 * Returns undefined when OTEL_LOG_TOOL_DETAILS is not enabled.
 */
function extractToolInputForTelemetry(input) {
    if (!isToolDetailsLoggingEnabled()) {
        return undefined;
    }
    var truncated = truncateToolInputValue(input);
    var json = (0, slowOperations_js_1.jsonStringify)(truncated);
    if (json.length > TOOL_INPUT_MAX_JSON_CHARS) {
        json = json.slice(0, TOOL_INPUT_MAX_JSON_CHARS) + '…[truncated]';
    }
    return json;
}
/**
 * Maximum length for file extensions to be logged.
 * Extensions longer than this are considered potentially sensitive
 * (e.g., hash-based filenames like "key-hash-abcd-123-456") and
 * will be replaced with 'other'.
 */
var MAX_FILE_EXTENSION_LENGTH = 10;
/**
 * Extracts and sanitizes a file extension for analytics logging.
 *
 * Uses Node's path.extname for reliable cross-platform extension extraction.
 * Returns 'other' for extensions exceeding MAX_FILE_EXTENSION_LENGTH to avoid
 * logging potentially sensitive data (like hash-based filenames).
 *
 * @param filePath - The file path to extract the extension from
 * @returns The sanitized extension, 'other' for long extensions, or undefined if no extension
 */
function getFileExtensionForAnalytics(filePath) {
    var ext = (0, path_1.extname)(filePath).toLowerCase();
    if (!ext || ext === '.') {
        return undefined;
    }
    var extension = ext.slice(1); // remove leading dot
    if (extension.length > MAX_FILE_EXTENSION_LENGTH) {
        return 'other';
    }
    return extension;
}
/** Allow list of commands we extract file extensions from. */
var FILE_COMMANDS = new Set([
    'rm',
    'mv',
    'cp',
    'touch',
    'mkdir',
    'chmod',
    'chown',
    'cat',
    'head',
    'tail',
    'sort',
    'stat',
    'diff',
    'wc',
    'grep',
    'rg',
    'sed',
]);
/** Regex to split bash commands on compound operators (&&, ||, ;, |). */
var COMPOUND_OPERATOR_REGEX = /\s*(?:&&|\|\||[;|])\s*/;
/** Regex to split on whitespace. */
var WHITESPACE_REGEX = /\s+/;
/**
 * Extracts file extensions from a bash command for analytics.
 * Best-effort: splits on operators and whitespace, extracts extensions
 * from non-flag args of allowed commands. No heavy shell parsing needed
 * because grep patterns and sed scripts rarely resemble file extensions.
 */
function getFileExtensionsFromBashCommand(command, simulatedSedEditFilePath) {
    if (!command.includes('.') && !simulatedSedEditFilePath)
        return undefined;
    var result;
    var seen = new Set();
    if (simulatedSedEditFilePath) {
        var ext = getFileExtensionForAnalytics(simulatedSedEditFilePath);
        if (ext) {
            seen.add(ext);
            result = ext;
        }
    }
    for (var _i = 0, _a = command.split(COMPOUND_OPERATOR_REGEX); _i < _a.length; _i++) {
        var subcmd = _a[_i];
        if (!subcmd)
            continue;
        var tokens = subcmd.split(WHITESPACE_REGEX);
        if (tokens.length < 2)
            continue;
        var firstToken = tokens[0];
        var slashIdx = firstToken.lastIndexOf('/');
        var baseCmd = slashIdx >= 0 ? firstToken.slice(slashIdx + 1) : firstToken;
        if (!FILE_COMMANDS.has(baseCmd))
            continue;
        for (var i = 1; i < tokens.length; i++) {
            var arg = tokens[i];
            if (arg.charCodeAt(0) === 45 /* - */)
                continue;
            var ext = getFileExtensionForAnalytics(arg);
            if (ext && !seen.has(ext)) {
                seen.add(ext);
                result = result ? result + ',' + ext : ext;
            }
        }
    }
    if (!result)
        return undefined;
    return result;
}
/**
 * Get agent identification for analytics.
 * Priority: AsyncLocalStorage context (subagents) > env vars (swarm teammates)
 */
function getAgentIdentification() {
    // Check AsyncLocalStorage first (for subagents running in same process)
    var agentContext = (0, agentContext_js_1.getAgentContext)();
    if (agentContext) {
        var result = {
            agentId: agentContext.agentId,
            parentSessionId: agentContext.parentSessionId,
            agentType: agentContext.agentType,
        };
        if (agentContext.agentType === 'teammate') {
            result.teamName = agentContext.teamName;
        }
        return result;
    }
    // Fall back to swarm helpers (for swarm agents)
    var agentId = (0, teammate_js_1.getAgentId)();
    var parentSessionId = (0, teammate_js_1.getParentSessionId)();
    var teamName = (0, teammate_js_1.getTeamName)();
    var isSwarmAgent = (0, teammate_js_1.isTeammate)();
    // For standalone agents (have agent ID but not a teammate), set agentType to 'standalone'
    var agentType = isSwarmAgent
        ? 'teammate'
        : agentId
            ? 'standalone'
            : undefined;
    if (agentId || agentType || parentSessionId || teamName) {
        return __assign(__assign(__assign(__assign({}, (agentId ? { agentId: agentId } : {})), (agentType ? { agentType: agentType } : {})), (parentSessionId ? { parentSessionId: parentSessionId } : {})), (teamName ? { teamName: teamName } : {}));
    }
    // Check bootstrap state for parent session ID (e.g., plan mode -> implementation)
    var stateParentSessionId = (0, state_js_1.getParentSessionId)();
    if (stateParentSessionId) {
        return { parentSessionId: stateParentSessionId };
    }
    return {};
}
/**
 * Extract base version from full version string. "2.0.36-dev.20251107.t174150.sha2709699" → "2.0.36-dev"
 */
var getVersionBase = (0, memoize_js_1.default)(function () {
    var match = MACRO.VERSION.match(/^\d+\.\d+\.\d+(?:-[a-z]+)?/);
    return match ? match[0] : undefined;
});
/**
 * Builds the environment context object
 */
var buildEnvContext = (0, memoize_js_1.default)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, packageManagers, runtimes, linuxDistroInfo, vcs;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, Promise.all([
                    env_js_1.env.getPackageManagers(),
                    env_js_1.env.getRuntimes(),
                    (0, platform_js_1.getLinuxDistroInfo)(),
                    (0, platform_js_1.detectVcs)(),
                ])];
            case 1:
                _a = _c.sent(), packageManagers = _a[0], runtimes = _a[1], linuxDistroInfo = _a[2], vcs = _a[3];
                return [2 /*return*/, __assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({ platform: (0, env_js_1.getHostPlatformForAnalytics)(), 
                        // Raw process.platform so freebsd/openbsd/aix/sunos are visible in BQ.
                        // getHostPlatformForAnalytics() buckets those into 'linux'; here we want
                        // the truth. CLAUDE_CODE_HOST_PLATFORM still overrides for container/remote.
                        platformRaw: process.env.CLAUDE_CODE_HOST_PLATFORM || process.platform, arch: env_js_1.env.arch, nodeVersion: env_js_1.env.nodeVersion, terminal: envDynamic_js_1.envDynamic.terminal, packageManagers: packageManagers.join(','), runtimes: runtimes.join(','), isRunningWithBun: env_js_1.env.isRunningWithBun(), isCi: (0, envUtils_js_1.isEnvTruthy)(process.env.CI), isClaubbit: (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUBBIT), isClaudeCodeRemote: (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_REMOTE), isLocalAgentMode: process.env.CLAUDE_CODE_ENTRYPOINT === 'local-agent', isConductor: env_js_1.env.isConductor() }, (process.env.CLAUDE_CODE_REMOTE_ENVIRONMENT_TYPE && {
                        remoteEnvironmentType: process.env.CLAUDE_CODE_REMOTE_ENVIRONMENT_TYPE,
                    })), ((0, bun_bundle_1.feature)('COWORKER_TYPE_TELEMETRY')
                        ? process.env.CLAUDE_CODE_COWORKER_TYPE
                            ? { coworkerType: process.env.CLAUDE_CODE_COWORKER_TYPE }
                            : {}
                        : {})), (process.env.CLAUDE_CODE_CONTAINER_ID && {
                        claudeCodeContainerId: process.env.CLAUDE_CODE_CONTAINER_ID,
                    })), (process.env.CLAUDE_CODE_REMOTE_SESSION_ID && {
                        claudeCodeRemoteSessionId: process.env.CLAUDE_CODE_REMOTE_SESSION_ID,
                    })), (process.env.CLAUDE_CODE_TAGS && {
                        tags: process.env.CLAUDE_CODE_TAGS,
                    })), { isGithubAction: (0, envUtils_js_1.isEnvTruthy)(process.env.GITHUB_ACTIONS), isClaudeCodeAction: (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_ACTION), isClaudeAiAuth: (0, auth_js_1.isClaudeAISubscriber)(), version: MACRO.VERSION, versionBase: getVersionBase(), buildTime: MACRO.BUILD_TIME, deploymentEnvironment: env_js_1.env.detectDeploymentEnvironment() }), ((0, envUtils_js_1.isEnvTruthy)(process.env.GITHUB_ACTIONS) && {
                        githubEventName: process.env.GITHUB_EVENT_NAME,
                        githubActionsRunnerEnvironment: process.env.RUNNER_ENVIRONMENT,
                        githubActionsRunnerOs: process.env.RUNNER_OS,
                        githubActionRef: ((_b = process.env.GITHUB_ACTION_PATH) === null || _b === void 0 ? void 0 : _b.includes('claude-code-action/'))
                            ? process.env.GITHUB_ACTION_PATH.split('claude-code-action/')[1]
                            : undefined,
                    })), ((0, platform_js_1.getWslVersion)() && { wslVersion: (0, platform_js_1.getWslVersion)() })), (linuxDistroInfo !== null && linuxDistroInfo !== void 0 ? linuxDistroInfo : {})), (vcs.length > 0 ? { vcs: vcs.join(',') } : {}))];
        }
    });
}); });
// --
// CPU% delta tracking — inherently process-global, same pattern as logBatch/flushTimer in datadog.ts
var prevCpuUsage = null;
var prevWallTimeMs = null;
/**
 * Builds process metrics object for all users.
 */
function buildProcessMetrics() {
    try {
        var mem = process.memoryUsage();
        var cpu = process.cpuUsage();
        var now = Date.now();
        var cpuPercent = void 0;
        if (prevCpuUsage && prevWallTimeMs) {
            var wallDeltaMs = now - prevWallTimeMs;
            if (wallDeltaMs > 0) {
                var userDeltaUs = cpu.user - prevCpuUsage.user;
                var systemDeltaUs = cpu.system - prevCpuUsage.system;
                cpuPercent =
                    ((userDeltaUs + systemDeltaUs) / (wallDeltaMs * 1000)) * 100;
            }
        }
        prevCpuUsage = cpu;
        prevWallTimeMs = now;
        return {
            uptime: process.uptime(),
            rss: mem.rss,
            heapTotal: mem.heapTotal,
            heapUsed: mem.heapUsed,
            external: mem.external,
            arrayBuffers: mem.arrayBuffers,
            // eslint-disable-next-line eslint-plugin-n/no-unsupported-features/node-builtins
            constrainedMemory: process.constrainedMemory(),
            cpuUsage: cpu,
            cpuPercent: cpuPercent,
        };
    }
    catch (_a) {
        return undefined;
    }
}
/**
 * Get core event metadata shared across all analytics systems.
 *
 * This function collects environment, runtime, and context information
 * that should be included with all analytics events.
 *
 * @param options - Configuration options
 * @returns Promise resolving to enriched metadata object
 */
function getEventMetadata() {
    return __awaiter(this, arguments, void 0, function (options) {
        var model, betas, _a, envContext, repoRemoteHash, processMetrics, metadata;
        if (options === void 0) { options = {}; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    model = options.model ? String(options.model) : (0, model_js_1.getMainLoopModel)();
                    betas = typeof options.betas === 'string'
                        ? options.betas
                        : (0, betas_js_1.getModelBetas)(model).join(',');
                    return [4 /*yield*/, Promise.all([
                            buildEnvContext(),
                            (0, git_js_1.getRepoRemoteHash)(),
                        ])];
                case 1:
                    _a = _b.sent(), envContext = _a[0], repoRemoteHash = _a[1];
                    processMetrics = buildProcessMetrics();
                    metadata = __assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({ model: model, sessionId: (0, state_js_1.getSessionId)(), userType: process.env.USER_TYPE || '' }, (betas.length > 0 ? { betas: betas } : {})), { envContext: envContext }), (process.env.CLAUDE_CODE_ENTRYPOINT && {
                        entrypoint: process.env.CLAUDE_CODE_ENTRYPOINT,
                    })), (process.env.CLAUDE_AGENT_SDK_VERSION && {
                        agentSdkVersion: process.env.CLAUDE_AGENT_SDK_VERSION,
                    })), { isInteractive: String((0, state_js_1.getIsInteractive)()), clientType: (0, state_js_1.getClientType)() }), (processMetrics && { processMetrics: processMetrics })), { sweBenchRunId: process.env.SWE_BENCH_RUN_ID || '', sweBenchInstanceId: process.env.SWE_BENCH_INSTANCE_ID || '', sweBenchTaskId: process.env.SWE_BENCH_TASK_ID || '' }), getAgentIdentification()), ((0, auth_js_1.getSubscriptionType)() && {
                        subscriptionType: (0, auth_js_1.getSubscriptionType)(),
                    })), ((0, bun_bundle_1.feature)('KAIROS') && (0, state_js_1.getKairosActive)()
                        ? { kairosActive: true }
                        : {})), (repoRemoteHash && { rh: repoRemoteHash }));
                    return [2 /*return*/, metadata];
            }
        });
    });
}
/**
 * Convert metadata to 1P event logging format (snake_case fields).
 *
 * The /api/event_logging/batch endpoint expects snake_case field names
 * for environment and core metadata.
 *
 * @param metadata - Core event metadata
 * @param additionalMetadata - Additional metadata to include
 * @returns Metadata formatted for 1P event logging
 */
function to1PEventFormat(metadata, userMetadata, additionalMetadata) {
    if (additionalMetadata === void 0) { additionalMetadata = {}; }
    var envContext = metadata.envContext, processMetrics = metadata.processMetrics, rh = metadata.rh, kairosActive = metadata.kairosActive, skillMode = metadata.skillMode, observerMode = metadata.observerMode, coreFields = __rest(metadata
    // Convert envContext to snake_case.
    // IMPORTANT: env is typed as the proto-generated EnvironmentMetadata so that
    // adding a field here that the proto doesn't define is a compile error. The
    // generated toJSON() serializer silently drops unknown keys — a hand-written
    // parallel type previously let #11318, #13924, #19448, and coworker_type all
    // ship fields that never reached BQ.
    // Adding a field? Update the monorepo proto first (go/cc-logging):
    //   event_schemas/.../claude_code/v1/claude_code_internal_event.proto
    // then run `bun run generate:proto` here.
    , ["envContext", "processMetrics", "rh", "kairosActive", "skillMode", "observerMode"]);
    // Convert envContext to snake_case.
    // IMPORTANT: env is typed as the proto-generated EnvironmentMetadata so that
    // adding a field here that the proto doesn't define is a compile error. The
    // generated toJSON() serializer silently drops unknown keys — a hand-written
    // parallel type previously let #11318, #13924, #19448, and coworker_type all
    // ship fields that never reached BQ.
    // Adding a field? Update the monorepo proto first (go/cc-logging):
    //   event_schemas/.../claude_code/v1/claude_code_internal_event.proto
    // then run `bun run generate:proto` here.
    var env = {
        platform: envContext.platform,
        platform_raw: envContext.platformRaw,
        arch: envContext.arch,
        node_version: envContext.nodeVersion,
        terminal: envContext.terminal || 'unknown',
        package_managers: envContext.packageManagers,
        runtimes: envContext.runtimes,
        is_running_with_bun: envContext.isRunningWithBun,
        is_ci: envContext.isCi,
        is_claubbit: envContext.isClaubbit,
        is_claude_code_remote: envContext.isClaudeCodeRemote,
        is_local_agent_mode: envContext.isLocalAgentMode,
        is_conductor: envContext.isConductor,
        is_github_action: envContext.isGithubAction,
        is_claude_code_action: envContext.isClaudeCodeAction,
        is_claude_ai_auth: envContext.isClaudeAiAuth,
        version: envContext.version,
        build_time: envContext.buildTime,
        deployment_environment: envContext.deploymentEnvironment,
    };
    // Add optional env fields
    if (envContext.remoteEnvironmentType) {
        env.remote_environment_type = envContext.remoteEnvironmentType;
    }
    if ((0, bun_bundle_1.feature)('COWORKER_TYPE_TELEMETRY') && envContext.coworkerType) {
        env.coworker_type = envContext.coworkerType;
    }
    if (envContext.claudeCodeContainerId) {
        env.claude_code_container_id = envContext.claudeCodeContainerId;
    }
    if (envContext.claudeCodeRemoteSessionId) {
        env.claude_code_remote_session_id = envContext.claudeCodeRemoteSessionId;
    }
    if (envContext.tags) {
        env.tags = envContext.tags
            .split(',')
            .map(function (t) { return t.trim(); })
            .filter(Boolean);
    }
    if (envContext.githubEventName) {
        env.github_event_name = envContext.githubEventName;
    }
    if (envContext.githubActionsRunnerEnvironment) {
        env.github_actions_runner_environment =
            envContext.githubActionsRunnerEnvironment;
    }
    if (envContext.githubActionsRunnerOs) {
        env.github_actions_runner_os = envContext.githubActionsRunnerOs;
    }
    if (envContext.githubActionRef) {
        env.github_action_ref = envContext.githubActionRef;
    }
    if (envContext.wslVersion) {
        env.wsl_version = envContext.wslVersion;
    }
    if (envContext.linuxDistroId) {
        env.linux_distro_id = envContext.linuxDistroId;
    }
    if (envContext.linuxDistroVersion) {
        env.linux_distro_version = envContext.linuxDistroVersion;
    }
    if (envContext.linuxKernel) {
        env.linux_kernel = envContext.linuxKernel;
    }
    if (envContext.vcs) {
        env.vcs = envContext.vcs;
    }
    if (envContext.versionBase) {
        env.version_base = envContext.versionBase;
    }
    // Convert core fields to snake_case
    var core = {
        session_id: coreFields.sessionId,
        model: coreFields.model,
        user_type: coreFields.userType,
        is_interactive: coreFields.isInteractive === 'true',
        client_type: coreFields.clientType,
    };
    // Add other core fields
    if (coreFields.betas) {
        core.betas = coreFields.betas;
    }
    if (coreFields.entrypoint) {
        core.entrypoint = coreFields.entrypoint;
    }
    if (coreFields.agentSdkVersion) {
        core.agent_sdk_version = coreFields.agentSdkVersion;
    }
    if (coreFields.sweBenchRunId) {
        core.swe_bench_run_id = coreFields.sweBenchRunId;
    }
    if (coreFields.sweBenchInstanceId) {
        core.swe_bench_instance_id = coreFields.sweBenchInstanceId;
    }
    if (coreFields.sweBenchTaskId) {
        core.swe_bench_task_id = coreFields.sweBenchTaskId;
    }
    // Swarm/team agent identification
    if (coreFields.agentId) {
        core.agent_id = coreFields.agentId;
    }
    if (coreFields.parentSessionId) {
        core.parent_session_id = coreFields.parentSessionId;
    }
    if (coreFields.agentType) {
        core.agent_type = coreFields.agentType;
    }
    if (coreFields.teamName) {
        core.team_name = coreFields.teamName;
    }
    // Map userMetadata to output fields.
    // Based on src/utils/user.ts getUser(), but with fields present in other
    // parts of ClaudeCodeInternalEvent deduplicated.
    // Convert camelCase GitHubActionsMetadata to snake_case for 1P API
    // Note: github_actions_metadata is placed inside env (EnvironmentMetadata)
    // rather than at the top level of ClaudeCodeInternalEvent
    if (userMetadata.githubActionsMetadata) {
        var ghMeta = userMetadata.githubActionsMetadata;
        env.github_actions_metadata = {
            actor_id: ghMeta.actorId,
            repository_id: ghMeta.repositoryId,
            repository_owner_id: ghMeta.repositoryOwnerId,
        };
    }
    var auth;
    if (userMetadata.accountUuid || userMetadata.organizationUuid) {
        auth = {
            account_uuid: userMetadata.accountUuid,
            organization_uuid: userMetadata.organizationUuid,
        };
    }
    return __assign(__assign(__assign({ env: env }, (processMetrics && {
        process: Buffer.from((0, slowOperations_js_1.jsonStringify)(processMetrics)).toString('base64'),
    })), (auth && { auth: auth })), { core: core, additional: __assign(__assign(__assign(__assign(__assign({}, (rh && { rh: rh })), (kairosActive && { is_assistant_mode: true })), (skillMode && { skill_mode: skillMode })), (observerMode && { observer_mode: observerMode })), additionalMetadata) });
}
