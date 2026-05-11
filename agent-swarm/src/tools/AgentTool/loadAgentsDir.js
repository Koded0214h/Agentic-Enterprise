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
exports.getAgentDefinitionsWithOverrides = void 0;
exports.isBuiltInAgent = isBuiltInAgent;
exports.isCustomAgent = isCustomAgent;
exports.isPluginAgent = isPluginAgent;
exports.getActiveAgentsFromList = getActiveAgentsFromList;
exports.hasRequiredMcpServers = hasRequiredMcpServers;
exports.filterAgentsByMcpRequirements = filterAgentsByMcpRequirements;
exports.clearAgentDefinitionsCache = clearAgentDefinitionsCache;
exports.parseAgentFromJson = parseAgentFromJson;
exports.parseAgentsFromJson = parseAgentsFromJson;
exports.parseAgentFromMarkdown = parseAgentFromMarkdown;
var bun_bundle_1 = require("bun:bundle");
var memoize_js_1 = require("lodash-es/memoize.js");
var path_1 = require("path");
var v4_1 = require("zod/v4");
var paths_js_1 = require("../../memdir/paths.js");
var index_js_1 = require("../../services/analytics/index.js");
var types_js_1 = require("../../services/mcp/types.js");
var debug_js_1 = require("../../utils/debug.js");
var effort_js_1 = require("../../utils/effort.js");
var envUtils_js_1 = require("../../utils/envUtils.js");
var frontmatterParser_js_1 = require("../../utils/frontmatterParser.js");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
var log_js_1 = require("../../utils/log.js");
var markdownConfigLoader_js_1 = require("../../utils/markdownConfigLoader.js");
var PermissionMode_js_1 = require("../../utils/permissions/PermissionMode.js");
var loadPluginAgents_js_1 = require("../../utils/plugins/loadPluginAgents.js");
var types_js_2 = require("../../utils/settings/types.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var constants_js_1 = require("../FileEditTool/constants.js");
var prompt_js_1 = require("../FileReadTool/prompt.js");
var prompt_js_2 = require("../FileWriteTool/prompt.js");
var agentColorManager_js_1 = require("./agentColorManager.js");
var agentMemory_js_1 = require("./agentMemory.js");
var agentMemorySnapshot_js_1 = require("./agentMemorySnapshot.js");
var builtInAgents_js_1 = require("./builtInAgents.js");
// Zod schema for agent MCP server specs
var AgentMcpServerSpecSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.union([
        v4_1.z.string(), // Reference by name
        v4_1.z.record(v4_1.z.string(), (0, types_js_1.McpServerConfigSchema)()), // Inline as { name: config }
    ]);
});
// Zod schemas for JSON agent validation
// Note: HooksSchema is lazy so the circular chain AppState -> loadAgentsDir -> settings/types
// is broken at module load time
var AgentJsonSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        description: v4_1.z.string().min(1, 'Description cannot be empty'),
        tools: v4_1.z.array(v4_1.z.string()).optional(),
        disallowedTools: v4_1.z.array(v4_1.z.string()).optional(),
        prompt: v4_1.z.string().min(1, 'Prompt cannot be empty'),
        model: v4_1.z
            .string()
            .trim()
            .min(1, 'Model cannot be empty')
            .transform(function (m) { return (m.toLowerCase() === 'inherit' ? 'inherit' : m); })
            .optional(),
        effort: v4_1.z.union([v4_1.z.enum(effort_js_1.EFFORT_LEVELS), v4_1.z.number().int()]).optional(),
        permissionMode: v4_1.z.enum(PermissionMode_js_1.PERMISSION_MODES).optional(),
        mcpServers: v4_1.z.array(AgentMcpServerSpecSchema()).optional(),
        hooks: (0, types_js_2.HooksSchema)().optional(),
        maxTurns: v4_1.z.number().int().positive().optional(),
        skills: v4_1.z.array(v4_1.z.string()).optional(),
        initialPrompt: v4_1.z.string().optional(),
        memory: v4_1.z.enum(['user', 'project', 'local']).optional(),
        background: v4_1.z.boolean().optional(),
        isolation: (process.env.USER_TYPE === 'ant'
            ? v4_1.z.enum(['worktree', 'remote'])
            : v4_1.z.enum(['worktree'])).optional(),
    });
});
var AgentsJsonSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.record(v4_1.z.string(), AgentJsonSchema());
});
// Type guards for runtime type checking
function isBuiltInAgent(agent) {
    return agent.source === 'built-in';
}
function isCustomAgent(agent) {
    return agent.source !== 'built-in' && agent.source !== 'plugin';
}
function isPluginAgent(agent) {
    return agent.source === 'plugin';
}
function getActiveAgentsFromList(allAgents) {
    var builtInAgents = allAgents.filter(function (a) { return a.source === 'built-in'; });
    var pluginAgents = allAgents.filter(function (a) { return a.source === 'plugin'; });
    var userAgents = allAgents.filter(function (a) { return a.source === 'userSettings'; });
    var projectAgents = allAgents.filter(function (a) { return a.source === 'projectSettings'; });
    var managedAgents = allAgents.filter(function (a) { return a.source === 'policySettings'; });
    var flagAgents = allAgents.filter(function (a) { return a.source === 'flagSettings'; });
    var agentGroups = [
        builtInAgents,
        pluginAgents,
        userAgents,
        projectAgents,
        flagAgents,
        managedAgents,
    ];
    var agentMap = new Map();
    for (var _i = 0, agentGroups_1 = agentGroups; _i < agentGroups_1.length; _i++) {
        var agents = agentGroups_1[_i];
        for (var _a = 0, agents_1 = agents; _a < agents_1.length; _a++) {
            var agent = agents_1[_a];
            agentMap.set(agent.agentType, agent);
        }
    }
    return Array.from(agentMap.values());
}
/**
 * Checks if an agent's required MCP servers are available.
 * Returns true if no requirements or all requirements are met.
 * @param agent The agent to check
 * @param availableServers List of available MCP server names (e.g., from mcp.clients)
 */
function hasRequiredMcpServers(agent, availableServers) {
    if (!agent.requiredMcpServers || agent.requiredMcpServers.length === 0) {
        return true;
    }
    // Each required pattern must match at least one available server (case-insensitive)
    return agent.requiredMcpServers.every(function (pattern) {
        return availableServers.some(function (server) {
            return server.toLowerCase().includes(pattern.toLowerCase());
        });
    });
}
/**
 * Filters agents based on MCP server requirements.
 * Only returns agents whose required MCP servers are available.
 * @param agents List of agents to filter
 * @param availableServers List of available MCP server names
 */
function filterAgentsByMcpRequirements(agents, availableServers) {
    return agents.filter(function (agent) { return hasRequiredMcpServers(agent, availableServers); });
}
/**
 * Check for and initialize agent memory from project snapshots.
 * For agents with memory enabled, copies snapshot to local if no local memory exists.
 * For agents with newer snapshots, logs a debug message (user prompt TODO).
 */
function initializeAgentMemorySnapshots(agents) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all(agents.map(function (agent) { return __awaiter(_this, void 0, void 0, function () {
                        var result, _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    if (agent.memory !== 'user')
                                        return [2 /*return*/];
                                    return [4 /*yield*/, (0, agentMemorySnapshot_js_1.checkAgentMemorySnapshot)(agent.agentType, agent.memory)];
                                case 1:
                                    result = _b.sent();
                                    _a = result.action;
                                    switch (_a) {
                                        case 'initialize': return [3 /*break*/, 2];
                                        case 'prompt-update': return [3 /*break*/, 4];
                                    }
                                    return [3 /*break*/, 5];
                                case 2:
                                    (0, debug_js_1.logForDebugging)("Initializing ".concat(agent.agentType, " memory from project snapshot"));
                                    return [4 /*yield*/, (0, agentMemorySnapshot_js_1.initializeFromSnapshot)(agent.agentType, agent.memory, result.snapshotTimestamp)];
                                case 3:
                                    _b.sent();
                                    return [3 /*break*/, 5];
                                case 4:
                                    agent.pendingSnapshotUpdate = {
                                        snapshotTimestamp: result.snapshotTimestamp,
                                    };
                                    (0, debug_js_1.logForDebugging)("Newer snapshot available for ".concat(agent.agentType, " memory (snapshot: ").concat(result.snapshotTimestamp, ")"));
                                    return [3 /*break*/, 5];
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); }))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.getAgentDefinitionsWithOverrides = (0, memoize_js_1.default)(function (cwd) { return __awaiter(void 0, void 0, void 0, function () {
    var builtInAgents, markdownFiles, failedFiles_1, customAgents, pluginAgentsPromise, pluginAgents_, pluginAgents, builtInAgents, allAgentsList, activeAgents, _i, activeAgents_1, agent, error_1, errorMessage, builtInAgents;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // Simple mode: skip custom agents, only return built-ins
                if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_SIMPLE)) {
                    builtInAgents = (0, builtInAgents_js_1.getBuiltInAgents)();
                    return [2 /*return*/, {
                            activeAgents: builtInAgents,
                            allAgents: builtInAgents,
                        }];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 6, , 7]);
                return [4 /*yield*/, (0, markdownConfigLoader_js_1.loadMarkdownFilesForSubdir)('agents', cwd)];
            case 2:
                markdownFiles = _a.sent();
                failedFiles_1 = [];
                customAgents = markdownFiles
                    .map(function (_a) {
                    var filePath = _a.filePath, baseDir = _a.baseDir, frontmatter = _a.frontmatter, content = _a.content, source = _a.source;
                    var agent = parseAgentFromMarkdown(filePath, baseDir, frontmatter, content, source);
                    if (!agent) {
                        // Skip non-agent markdown files silently (e.g., reference docs
                        // co-located with agent definitions). Only report errors for files
                        // that look like agent attempts (have a 'name' field in frontmatter).
                        if (!frontmatter['name']) {
                            return null;
                        }
                        var errorMsg = getParseError(frontmatter);
                        failedFiles_1.push({ path: filePath, error: errorMsg });
                        (0, debug_js_1.logForDebugging)("Failed to parse agent from ".concat(filePath, ": ").concat(errorMsg));
                        (0, index_js_1.logEvent)('tengu_agent_parse_error', {
                            error: errorMsg,
                            location: source,
                        });
                        return null;
                    }
                    return agent;
                })
                    .filter(function (agent) { return agent !== null; });
                pluginAgentsPromise = (0, loadPluginAgents_js_1.loadPluginAgents)();
                if (!((0, bun_bundle_1.feature)('AGENT_MEMORY_SNAPSHOT') && (0, paths_js_1.isAutoMemoryEnabled)())) return [3 /*break*/, 4];
                return [4 /*yield*/, Promise.all([
                        pluginAgentsPromise,
                        initializeAgentMemorySnapshots(customAgents),
                    ])];
            case 3:
                pluginAgents_ = (_a.sent())[0];
                pluginAgentsPromise = Promise.resolve(pluginAgents_);
                _a.label = 4;
            case 4: return [4 /*yield*/, pluginAgentsPromise];
            case 5:
                pluginAgents = _a.sent();
                builtInAgents = (0, builtInAgents_js_1.getBuiltInAgents)();
                allAgentsList = __spreadArray(__spreadArray(__spreadArray([], builtInAgents, true), pluginAgents, true), customAgents, true);
                activeAgents = getActiveAgentsFromList(allAgentsList);
                // Initialize colors for all active agents
                for (_i = 0, activeAgents_1 = activeAgents; _i < activeAgents_1.length; _i++) {
                    agent = activeAgents_1[_i];
                    if (agent.color) {
                        (0, agentColorManager_js_1.setAgentColor)(agent.agentType, agent.color);
                    }
                }
                return [2 /*return*/, {
                        activeAgents: activeAgents,
                        allAgents: allAgentsList,
                        failedFiles: failedFiles_1.length > 0 ? failedFiles_1 : undefined,
                    }];
            case 6:
                error_1 = _a.sent();
                errorMessage = error_1 instanceof Error ? error_1.message : String(error_1);
                (0, debug_js_1.logForDebugging)("Error loading agent definitions: ".concat(errorMessage));
                (0, log_js_1.logError)(error_1);
                builtInAgents = (0, builtInAgents_js_1.getBuiltInAgents)();
                return [2 /*return*/, {
                        activeAgents: builtInAgents,
                        allAgents: builtInAgents,
                        failedFiles: [{ path: 'unknown', error: errorMessage }],
                    }];
            case 7: return [2 /*return*/];
        }
    });
}); });
function clearAgentDefinitionsCache() {
    var _a, _b;
    (_b = (_a = exports.getAgentDefinitionsWithOverrides.cache).clear) === null || _b === void 0 ? void 0 : _b.call(_a);
    (0, loadPluginAgents_js_1.clearPluginAgentCache)();
}
/**
 * Helper to determine the specific parsing error for an agent file
 */
function getParseError(frontmatter) {
    var agentType = frontmatter['name'];
    var description = frontmatter['description'];
    if (!agentType || typeof agentType !== 'string') {
        return 'Missing required "name" field in frontmatter';
    }
    if (!description || typeof description !== 'string') {
        return 'Missing required "description" field in frontmatter';
    }
    return 'Unknown parsing error';
}
/**
 * Parse hooks from frontmatter using the HooksSchema
 * @param frontmatter The frontmatter object containing potential hooks
 * @param agentType The agent type for logging purposes
 * @returns Parsed hooks settings or undefined if invalid/missing
 */
function parseHooksFromFrontmatter(frontmatter, agentType) {
    if (!frontmatter.hooks) {
        return undefined;
    }
    var result = (0, types_js_2.HooksSchema)().safeParse(frontmatter.hooks);
    if (!result.success) {
        (0, debug_js_1.logForDebugging)("Invalid hooks in agent '".concat(agentType, "': ").concat(result.error.message));
        return undefined;
    }
    return result.data;
}
/**
 * Parses agent definition from JSON data
 */
function parseAgentFromJson(name, definition, source) {
    if (source === void 0) { source = 'flagSettings'; }
    try {
        var parsed_1 = AgentJsonSchema().parse(definition);
        var tools = (0, markdownConfigLoader_js_1.parseAgentToolsFromFrontmatter)(parsed_1.tools);
        // If memory is enabled, inject Write/Edit/Read tools for memory access
        if ((0, paths_js_1.isAutoMemoryEnabled)() && parsed_1.memory && tools !== undefined) {
            var toolSet = new Set(tools);
            for (var _i = 0, _a = [
                prompt_js_2.FILE_WRITE_TOOL_NAME,
                constants_js_1.FILE_EDIT_TOOL_NAME,
                prompt_js_1.FILE_READ_TOOL_NAME,
            ]; _i < _a.length; _i++) {
                var tool = _a[_i];
                if (!toolSet.has(tool)) {
                    tools = __spreadArray(__spreadArray([], tools, true), [tool], false);
                }
            }
        }
        var disallowedTools = parsed_1.disallowedTools !== undefined
            ? (0, markdownConfigLoader_js_1.parseAgentToolsFromFrontmatter)(parsed_1.disallowedTools)
            : undefined;
        var systemPrompt_1 = parsed_1.prompt;
        var agent = __assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({ agentType: name, whenToUse: parsed_1.description }, (tools !== undefined ? { tools: tools } : {})), (disallowedTools !== undefined ? { disallowedTools: disallowedTools } : {})), { getSystemPrompt: function () {
                if ((0, paths_js_1.isAutoMemoryEnabled)() && parsed_1.memory) {
                    return (systemPrompt_1 + '\n\n' + (0, agentMemory_js_1.loadAgentMemoryPrompt)(name, parsed_1.memory));
                }
                return systemPrompt_1;
            }, source: source }), (parsed_1.model ? { model: parsed_1.model } : {})), (parsed_1.effort !== undefined ? { effort: parsed_1.effort } : {})), (parsed_1.permissionMode
            ? { permissionMode: parsed_1.permissionMode }
            : {})), (parsed_1.mcpServers && parsed_1.mcpServers.length > 0
            ? { mcpServers: parsed_1.mcpServers }
            : {})), (parsed_1.hooks ? { hooks: parsed_1.hooks } : {})), (parsed_1.maxTurns !== undefined ? { maxTurns: parsed_1.maxTurns } : {})), (parsed_1.skills && parsed_1.skills.length > 0
            ? { skills: parsed_1.skills }
            : {})), (parsed_1.initialPrompt ? { initialPrompt: parsed_1.initialPrompt } : {})), (parsed_1.background ? { background: parsed_1.background } : {})), (parsed_1.memory ? { memory: parsed_1.memory } : {})), (parsed_1.isolation ? { isolation: parsed_1.isolation } : {}));
        return agent;
    }
    catch (error) {
        var errorMessage = error instanceof Error ? error.message : String(error);
        (0, debug_js_1.logForDebugging)("Error parsing agent '".concat(name, "' from JSON: ").concat(errorMessage));
        (0, log_js_1.logError)(error);
        return null;
    }
}
/**
 * Parses multiple agents from a JSON object
 */
function parseAgentsFromJson(agentsJson, source) {
    if (source === void 0) { source = 'flagSettings'; }
    try {
        var parsed = AgentsJsonSchema().parse(agentsJson);
        return Object.entries(parsed)
            .map(function (_a) {
            var name = _a[0], def = _a[1];
            return parseAgentFromJson(name, def, source);
        })
            .filter(function (agent) { return agent !== null; });
    }
    catch (error) {
        var errorMessage = error instanceof Error ? error.message : String(error);
        (0, debug_js_1.logForDebugging)("Error parsing agents from JSON: ".concat(errorMessage));
        (0, log_js_1.logError)(error);
        return [];
    }
}
/**
 * Parses agent definition from markdown file data
 */
function parseAgentFromMarkdown(filePath, baseDir, frontmatter, content, source) {
    try {
        var agentType_1 = frontmatter['name'];
        var whenToUse = frontmatter['description'];
        // Fallback for Agent Swarm agents that might not have frontmatter
        if (!agentType_1 || typeof agentType_1 !== 'string') {
            agentType_1 = (0, path_1.basename)(filePath, '.md');
        }
        if (!whenToUse || typeof whenToUse !== 'string') {
            whenToUse = "Agent for ".concat(agentType_1);
        }
        // Unescape newlines in whenToUse that were escaped for YAML parsing
        whenToUse = whenToUse.replace(/\\n/g, '\n');
        var color = frontmatter['color'];
        var modelRaw = frontmatter['model'];
        var model = void 0;
        if (typeof modelRaw === 'string' && modelRaw.trim().length > 0) {
            var trimmed = modelRaw.trim();
            model = trimmed.toLowerCase() === 'inherit' ? 'inherit' : trimmed;
        }
        // Parse background flag
        var backgroundRaw = frontmatter['background'];
        if (backgroundRaw !== undefined &&
            backgroundRaw !== 'true' &&
            backgroundRaw !== 'false' &&
            backgroundRaw !== true &&
            backgroundRaw !== false) {
            (0, debug_js_1.logForDebugging)("Agent file ".concat(filePath, " has invalid background value '").concat(backgroundRaw, "'. Must be 'true', 'false', or omitted."));
        }
        var background = backgroundRaw === 'true' || backgroundRaw === true ? true : undefined;
        // Parse memory scope
        var VALID_MEMORY_SCOPES = ['user', 'project', 'local'];
        var memoryRaw = frontmatter['memory'];
        var memory_1;
        if (memoryRaw !== undefined) {
            if (VALID_MEMORY_SCOPES.includes(memoryRaw)) {
                memory_1 = memoryRaw;
            }
            else {
                (0, debug_js_1.logForDebugging)("Agent file ".concat(filePath, " has invalid memory value '").concat(memoryRaw, "'. Valid options: ").concat(VALID_MEMORY_SCOPES.join(', ')));
            }
        }
        var VALID_ISOLATION_MODES = process.env.USER_TYPE === 'ant' ? ['worktree', 'remote'] : ['worktree'];
        var isolationRaw = frontmatter['isolation'];
        var isolation = void 0;
        if (isolationRaw !== undefined) {
            if (VALID_ISOLATION_MODES.includes(isolationRaw)) {
                isolation = isolationRaw;
            }
            else {
                (0, debug_js_1.logForDebugging)("Agent file ".concat(filePath, " has invalid isolation value '").concat(isolationRaw, "'. Valid options: ").concat(VALID_ISOLATION_MODES.join(', ')));
            }
        }
        // Parse effort from frontmatter (supports string levels and integers)
        var effortRaw = frontmatter['effort'];
        var parsedEffort = effortRaw !== undefined ? (0, effort_js_1.parseEffortValue)(effortRaw) : undefined;
        if (effortRaw !== undefined && parsedEffort === undefined) {
            (0, debug_js_1.logForDebugging)("Agent file ".concat(filePath, " has invalid effort '").concat(effortRaw, "'. Valid options: ").concat(effort_js_1.EFFORT_LEVELS.join(', '), " or an integer"));
        }
        // Parse permissionMode from frontmatter
        var permissionModeRaw = frontmatter['permissionMode'];
        var isValidPermissionMode = permissionModeRaw &&
            PermissionMode_js_1.PERMISSION_MODES.includes(permissionModeRaw);
        if (permissionModeRaw && !isValidPermissionMode) {
            var errorMsg = "Agent file ".concat(filePath, " has invalid permissionMode '").concat(permissionModeRaw, "'. Valid options: ").concat(PermissionMode_js_1.PERMISSION_MODES.join(', '));
            (0, debug_js_1.logForDebugging)(errorMsg);
        }
        // Parse maxTurns from frontmatter
        var maxTurnsRaw = frontmatter['maxTurns'];
        var maxTurns = (0, frontmatterParser_js_1.parsePositiveIntFromFrontmatter)(maxTurnsRaw);
        if (maxTurnsRaw !== undefined && maxTurns === undefined) {
            (0, debug_js_1.logForDebugging)("Agent file ".concat(filePath, " has invalid maxTurns '").concat(maxTurnsRaw, "'. Must be a positive integer."));
        }
        // Extract filename without extension
        var filename = (0, path_1.basename)(filePath, '.md');
        // Parse tools from frontmatter
        var tools = (0, markdownConfigLoader_js_1.parseAgentToolsFromFrontmatter)(frontmatter['tools']);
        // If memory is enabled, inject Write/Edit/Read tools for memory access
        if ((0, paths_js_1.isAutoMemoryEnabled)() && memory_1 && tools !== undefined) {
            var toolSet = new Set(tools);
            for (var _i = 0, _a = [
                prompt_js_2.FILE_WRITE_TOOL_NAME,
                constants_js_1.FILE_EDIT_TOOL_NAME,
                prompt_js_1.FILE_READ_TOOL_NAME,
            ]; _i < _a.length; _i++) {
                var tool = _a[_i];
                if (!toolSet.has(tool)) {
                    tools = __spreadArray(__spreadArray([], tools, true), [tool], false);
                }
            }
        }
        // Parse disallowedTools from frontmatter
        var disallowedToolsRaw = frontmatter['disallowedTools'];
        var disallowedTools = disallowedToolsRaw !== undefined
            ? (0, markdownConfigLoader_js_1.parseAgentToolsFromFrontmatter)(disallowedToolsRaw)
            : undefined;
        // Parse skills from frontmatter
        var skills = (0, markdownConfigLoader_js_1.parseSlashCommandToolsFromFrontmatter)(frontmatter['skills']);
        var initialPromptRaw = frontmatter['initialPrompt'];
        var initialPrompt = typeof initialPromptRaw === 'string' && initialPromptRaw.trim()
            ? initialPromptRaw
            : undefined;
        // Parse mcpServers from frontmatter using same Zod validation as JSON agents
        var mcpServersRaw = frontmatter['mcpServers'];
        var mcpServers = void 0;
        if (Array.isArray(mcpServersRaw)) {
            mcpServers = mcpServersRaw
                .map(function (item) {
                var result = AgentMcpServerSpecSchema().safeParse(item);
                if (result.success) {
                    return result.data;
                }
                (0, debug_js_1.logForDebugging)("Agent file ".concat(filePath, " has invalid mcpServers item: ").concat((0, slowOperations_js_1.jsonStringify)(item), ". Error: ").concat(result.error.message));
                return null;
            })
                .filter(function (item) { return item !== null; });
        }
        // Parse hooks from frontmatter
        var hooks = parseHooksFromFrontmatter(frontmatter, agentType_1);
        var systemPrompt_2 = content.trim();
        var agentDef = __assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({ baseDir: baseDir, agentType: agentType_1, whenToUse: whenToUse }, (tools !== undefined ? { tools: tools } : {})), (disallowedTools !== undefined ? { disallowedTools: disallowedTools } : {})), (skills !== undefined ? { skills: skills } : {})), (initialPrompt !== undefined ? { initialPrompt: initialPrompt } : {})), (mcpServers !== undefined && mcpServers.length > 0
            ? { mcpServers: mcpServers }
            : {})), (hooks !== undefined ? { hooks: hooks } : {})), { getSystemPrompt: function () {
                if ((0, paths_js_1.isAutoMemoryEnabled)() && memory_1) {
                    var memoryPrompt = (0, agentMemory_js_1.loadAgentMemoryPrompt)(agentType_1, memory_1);
                    return systemPrompt_2 + '\n\n' + memoryPrompt;
                }
                return systemPrompt_2;
            }, source: source, filename: filename }), (color && typeof color === 'string' && agentColorManager_js_1.AGENT_COLORS.includes(color)
            ? { color: color }
            : {})), (model !== undefined ? { model: model } : {})), (parsedEffort !== undefined ? { effort: parsedEffort } : {})), (isValidPermissionMode
            ? { permissionMode: permissionModeRaw }
            : {})), (maxTurns !== undefined ? { maxTurns: maxTurns } : {})), (background ? { background: background } : {})), (memory_1 ? { memory: memory_1 } : {})), (isolation ? { isolation: isolation } : {}));
        return agentDef;
    }
    catch (error) {
        var errorMessage = error instanceof Error ? error.message : String(error);
        (0, debug_js_1.logForDebugging)("Error parsing agent from ".concat(filePath, ": ").concat(errorMessage));
        (0, log_js_1.logError)(error);
        return null;
    }
}
