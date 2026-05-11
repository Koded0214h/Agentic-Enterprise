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
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
    function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
    function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
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
exports.runAgent = runAgent;
exports.filterIncompleteToolCalls = filterIncompleteToolCalls;
var bun_bundle_1 = require("bun:bundle");
var crypto_1 = require("crypto");
var uniqBy_js_1 = require("lodash-es/uniqBy.js");
var debug_js_1 = require("src/utils/debug.js");
var state_js_1 = require("../../bootstrap/state.js");
var commands_js_1 = require("../../commands.js");
var prompts_js_1 = require("../../constants/prompts.js");
var context_js_1 = require("../../context.js");
var query_js_1 = require("../../query.js");
var growthbook_js_1 = require("../../services/analytics/growthbook.js");
var dumpPrompts_js_1 = require("../../services/api/dumpPrompts.js");
var promptCacheBreakDetection_js_1 = require("../../services/api/promptCacheBreakDetection.js");
var client_js_1 = require("../../services/mcp/client.js");
var config_js_1 = require("../../services/mcp/config.js");
var killShellTasks_js_1 = require("../../tasks/LocalShellTask/killShellTasks.js");
var attachments_js_1 = require("../../utils/attachments.js");
var errors_js_1 = require("../../utils/errors.js");
var file_js_1 = require("../../utils/file.js");
var fileStateCache_js_1 = require("../../utils/fileStateCache.js");
var forkedAgent_js_1 = require("../../utils/forkedAgent.js");
var registerFrontmatterHooks_js_1 = require("../../utils/hooks/registerFrontmatterHooks.js");
var sessionHooks_js_1 = require("../../utils/hooks/sessionHooks.js");
var hooks_js_1 = require("../../utils/hooks.js");
var messages_js_1 = require("../../utils/messages.js");
var agent_js_1 = require("../../utils/model/agent.js");
var sessionStorage_js_1 = require("../../utils/sessionStorage.js");
var pluginOnlyPolicy_js_1 = require("../../utils/settings/pluginOnlyPolicy.js");
var systemPromptType_js_1 = require("../../utils/systemPromptType.js");
var perfettoTracing_js_1 = require("../../utils/telemetry/perfettoTracing.js");
var uuid_js_1 = require("../../utils/uuid.js");
var agentToolUtils_js_1 = require("./agentToolUtils.js");
var loadAgentsDir_js_1 = require("./loadAgentsDir.js");
/**
 * Initialize agent-specific MCP servers
 * Agents can define their own MCP servers in their frontmatter that are additive
 * to the parent's MCP clients. These servers are connected when the agent starts
 * and cleaned up when the agent finishes.
 *
 * @param agentDefinition The agent definition with optional mcpServers
 * @param parentClients MCP clients inherited from parent context
 * @returns Merged clients (parent + agent-specific), agent MCP tools, and cleanup function
 */
function initializeAgentMcpServers(agentDefinition, parentClients) {
    return __awaiter(this, void 0, void 0, function () {
        var agentIsAdminTrusted, agentClients, newlyCreatedClients, agentTools, _i, _a, spec, config, name_1, isNewlyCreated, entries, _b, serverName, serverConfig, client, tools, cleanup;
        var _this = this;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    // If no agent-specific servers defined, return parent clients as-is
                    if (!((_c = agentDefinition.mcpServers) === null || _c === void 0 ? void 0 : _c.length)) {
                        return [2 /*return*/, {
                                clients: parentClients,
                                tools: [],
                                cleanup: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                    return [2 /*return*/];
                                }); }); },
                            }];
                    }
                    agentIsAdminTrusted = (0, pluginOnlyPolicy_js_1.isSourceAdminTrusted)(agentDefinition.source);
                    if ((0, pluginOnlyPolicy_js_1.isRestrictedToPluginOnly)('mcp') && !agentIsAdminTrusted) {
                        (0, debug_js_1.logForDebugging)("[Agent: ".concat(agentDefinition.agentType, "] Skipping MCP servers: strictPluginOnlyCustomization locks MCP to plugin-only (agent source: ").concat(agentDefinition.source, ")"));
                        return [2 /*return*/, {
                                clients: parentClients,
                                tools: [],
                                cleanup: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                    return [2 /*return*/];
                                }); }); },
                            }];
                    }
                    agentClients = [];
                    newlyCreatedClients = [];
                    agentTools = [];
                    _i = 0, _a = agentDefinition.mcpServers;
                    _d.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 6];
                    spec = _a[_i];
                    config = null;
                    name_1 = void 0;
                    isNewlyCreated = false;
                    if (typeof spec === 'string') {
                        // Reference by name - look up in existing MCP configs
                        // This uses the memoized connectToServer, so we may get a shared client
                        name_1 = spec;
                        config = (0, config_js_1.getMcpConfigByName)(spec);
                        if (!config) {
                            (0, debug_js_1.logForDebugging)("[Agent: ".concat(agentDefinition.agentType, "] MCP server not found: ").concat(spec), { level: 'warn' });
                            return [3 /*break*/, 5];
                        }
                    }
                    else {
                        entries = Object.entries(spec);
                        if (entries.length !== 1) {
                            (0, debug_js_1.logForDebugging)("[Agent: ".concat(agentDefinition.agentType, "] Invalid MCP server spec: expected exactly one key"), { level: 'warn' });
                            return [3 /*break*/, 5];
                        }
                        _b = entries[0], serverName = _b[0], serverConfig = _b[1];
                        name_1 = serverName;
                        config = __assign(__assign({}, serverConfig), { scope: 'dynamic' });
                        isNewlyCreated = true;
                    }
                    return [4 /*yield*/, (0, client_js_1.connectToServer)(name_1, config)];
                case 2:
                    client = _d.sent();
                    agentClients.push(client);
                    if (isNewlyCreated) {
                        newlyCreatedClients.push(client);
                    }
                    if (!(client.type === 'connected')) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, client_js_1.fetchToolsForClient)(client)];
                case 3:
                    tools = _d.sent();
                    agentTools.push.apply(agentTools, tools);
                    (0, debug_js_1.logForDebugging)("[Agent: ".concat(agentDefinition.agentType, "] Connected to MCP server '").concat(name_1, "' with ").concat(tools.length, " tools"));
                    return [3 /*break*/, 5];
                case 4:
                    (0, debug_js_1.logForDebugging)("[Agent: ".concat(agentDefinition.agentType, "] Failed to connect to MCP server '").concat(name_1, "': ").concat(client.type), { level: 'warn' });
                    _d.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6:
                    cleanup = function () { return __awaiter(_this, void 0, void 0, function () {
                        var _i, newlyCreatedClients_1, client, error_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _i = 0, newlyCreatedClients_1 = newlyCreatedClients;
                                    _a.label = 1;
                                case 1:
                                    if (!(_i < newlyCreatedClients_1.length)) return [3 /*break*/, 6];
                                    client = newlyCreatedClients_1[_i];
                                    if (!(client.type === 'connected')) return [3 /*break*/, 5];
                                    _a.label = 2;
                                case 2:
                                    _a.trys.push([2, 4, , 5]);
                                    return [4 /*yield*/, client.cleanup()];
                                case 3:
                                    _a.sent();
                                    return [3 /*break*/, 5];
                                case 4:
                                    error_1 = _a.sent();
                                    (0, debug_js_1.logForDebugging)("[Agent: ".concat(agentDefinition.agentType, "] Error cleaning up MCP server '").concat(client.name, "': ").concat(error_1), { level: 'warn' });
                                    return [3 /*break*/, 5];
                                case 5:
                                    _i++;
                                    return [3 /*break*/, 1];
                                case 6: return [2 /*return*/];
                            }
                        });
                    }); };
                    // Return merged clients (parent + agent-specific) and agent tools
                    return [2 /*return*/, {
                            clients: __spreadArray(__spreadArray([], parentClients, true), agentClients, true),
                            tools: agentTools,
                            cleanup: cleanup,
                        }];
            }
        });
    });
}
/**
 * Type guard to check if a message from query() is a recordable Message type.
 * Matches the types we want to record: assistant, user, progress, or system compact_boundary.
 */
function isRecordableMessage(msg) {
    return (msg.type === 'assistant' ||
        msg.type === 'user' ||
        msg.type === 'progress' ||
        (msg.type === 'system' &&
            'subtype' in msg &&
            msg.subtype === 'compact_boundary'));
}
function runAgent(_a) {
    return __asyncGenerator(this, arguments, function runAgent_1(_b) {
        var appState, permissionMode, rootSetAppState, resolvedAgentModel, agentId, parentId, contextMessages, initialMessages, agentReadFileState, _c, baseUserContext, baseSystemContext, shouldOmitClaudeMd, _omittedClaudeMd, userContextNoClaudeMd, resolvedUserContext, _omittedGitStatus, systemContextNoGit, resolvedSystemContext, agentPermissionMode, agentGetAppState, resolvedTools, additionalWorkingDirectories, agentSystemPrompt, _d, _e, agentAbortController, additionalContexts, _f, _g, _h, hookResult, e_1_1, contextMessage, hooksAllowedForThisAgent, skillsToPreload, allSkills, validSkills, _i, skillsToPreload_1, skillName, resolvedName, skill, formatSkillLoadingMetadata, loaded, _j, loaded_1, _k, skillName, skill, content, metadata, _l, mergedMcpClients, agentMcpTools, mcpCleanup, allTools, agentOptions, agentToolUseContext, lastRecordedUuid, _m, _o, _p, message, e_2_1, mcpMod;
        var _this = this;
        var _q, e_1, _r, _s, _t, e_2, _u, _v;
        var _w, _x, _y, _z, _0, _1, _2, _3, _4;
        var agentDefinition = _b.agentDefinition, promptMessages = _b.promptMessages, toolUseContext = _b.toolUseContext, canUseTool = _b.canUseTool, isAsync = _b.isAsync, canShowPermissionPrompts = _b.canShowPermissionPrompts, forkContextMessages = _b.forkContextMessages, querySource = _b.querySource, override = _b.override, model = _b.model, maxTurns = _b.maxTurns, preserveToolUseResults = _b.preserveToolUseResults, availableTools = _b.availableTools, allowedTools = _b.allowedTools, onCacheSafeParams = _b.onCacheSafeParams, contentReplacementState = _b.contentReplacementState, useExactTools = _b.useExactTools, worktreePath = _b.worktreePath, description = _b.description, transcriptSubdir = _b.transcriptSubdir, onQueryProgress = _b.onQueryProgress;
        return __generator(this, function (_5) {
            switch (_5.label) {
                case 0:
                    appState = toolUseContext.getAppState();
                    permissionMode = appState.toolPermissionContext.mode;
                    rootSetAppState = (_w = toolUseContext.setAppStateForTasks) !== null && _w !== void 0 ? _w : toolUseContext.setAppState;
                    resolvedAgentModel = (0, agent_js_1.getAgentModel)(agentDefinition.model, toolUseContext.options.mainLoopModel, model, permissionMode);
                    agentId = (override === null || override === void 0 ? void 0 : override.agentId) ? override.agentId : (0, uuid_js_1.createAgentId)();
                    // Route this agent's transcript into a grouping subdirectory if requested
                    // (e.g. workflow subagents write to subagents/workflows/<runId>/).
                    if (transcriptSubdir) {
                        (0, sessionStorage_js_1.setAgentTranscriptSubdir)(agentId, transcriptSubdir);
                    }
                    // Register agent in Perfetto trace for hierarchy visualization
                    if ((0, perfettoTracing_js_1.isPerfettoTracingEnabled)()) {
                        parentId = (_x = toolUseContext.agentId) !== null && _x !== void 0 ? _x : (0, state_js_1.getSessionId)();
                        (0, perfettoTracing_js_1.registerAgent)(agentId, agentDefinition.agentType, parentId);
                    }
                    // Log API calls path for subagents (ant-only)
                    if (process.env.USER_TYPE === 'ant') {
                        (0, debug_js_1.logForDebugging)("[Subagent ".concat(agentDefinition.agentType, "] API calls: ").concat((0, file_js_1.getDisplayPath)((0, dumpPrompts_js_1.getDumpPromptsPath)(agentId))));
                    }
                    contextMessages = forkContextMessages
                        ? filterIncompleteToolCalls(forkContextMessages)
                        : [];
                    initialMessages = __spreadArray(__spreadArray([], contextMessages, true), promptMessages, true);
                    agentReadFileState = forkContextMessages !== undefined
                        ? (0, fileStateCache_js_1.cloneFileStateCache)(toolUseContext.readFileState)
                        : (0, fileStateCache_js_1.createFileStateCacheWithSizeLimit)(fileStateCache_js_1.READ_FILE_STATE_CACHE_SIZE);
                    return [4 /*yield*/, __await(Promise.all([
                            (_y = override === null || override === void 0 ? void 0 : override.userContext) !== null && _y !== void 0 ? _y : (0, context_js_1.getUserContext)(),
                            (_z = override === null || override === void 0 ? void 0 : override.systemContext) !== null && _z !== void 0 ? _z : (0, context_js_1.getSystemContext)(),
                        ])
                        // Read-only agents (Explore, Plan) don't act on commit/PR/lint rules from
                        // CLAUDE.md — the main agent has full context and interprets their output.
                        // Dropping claudeMd here saves ~5-15 Gtok/week across 34M+ Explore spawns.
                        // Explicit override.userContext from callers is preserved untouched.
                        // Kill-switch defaults true; flip tengu_slim_subagent_claudemd=false to revert.
                        )];
                case 1:
                    _c = _5.sent(), baseUserContext = _c[0], baseSystemContext = _c[1];
                    shouldOmitClaudeMd = agentDefinition.omitClaudeMd &&
                        !(override === null || override === void 0 ? void 0 : override.userContext) &&
                        (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_slim_subagent_claudemd', true);
                    _omittedClaudeMd = baseUserContext.claudeMd, userContextNoClaudeMd = __rest(baseUserContext, ["claudeMd"]);
                    resolvedUserContext = shouldOmitClaudeMd
                        ? userContextNoClaudeMd
                        : baseUserContext;
                    _omittedGitStatus = baseSystemContext.gitStatus, systemContextNoGit = __rest(baseSystemContext, ["gitStatus"]);
                    resolvedSystemContext = agentDefinition.agentType === 'Explore' ||
                        agentDefinition.agentType === 'Plan'
                        ? systemContextNoGit
                        : baseSystemContext;
                    agentPermissionMode = agentDefinition.permissionMode;
                    agentGetAppState = function () {
                        var state = toolUseContext.getAppState();
                        var toolPermissionContext = state.toolPermissionContext;
                        // Override permission mode if agent defines one (unless parent is bypassPermissions, acceptEdits, or auto)
                        if (agentPermissionMode &&
                            state.toolPermissionContext.mode !== 'bypassPermissions' &&
                            state.toolPermissionContext.mode !== 'acceptEdits' &&
                            !((0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER') &&
                                state.toolPermissionContext.mode === 'auto')) {
                            toolPermissionContext = __assign(__assign({}, toolPermissionContext), { mode: agentPermissionMode });
                        }
                        // Set flag to auto-deny prompts for agents that can't show UI
                        // Use explicit canShowPermissionPrompts if provided, otherwise:
                        //   - bubble mode: always show prompts (bubbles to parent terminal)
                        //   - default: !isAsync (sync agents show prompts, async agents don't)
                        var shouldAvoidPrompts = canShowPermissionPrompts !== undefined
                            ? !canShowPermissionPrompts
                            : agentPermissionMode === 'bubble'
                                ? false
                                : isAsync;
                        if (shouldAvoidPrompts) {
                            toolPermissionContext = __assign(__assign({}, toolPermissionContext), { shouldAvoidPermissionPrompts: true });
                        }
                        // For background agents that can show prompts, await automated checks
                        // (classifier, permission hooks) before showing the permission dialog.
                        // Since these are background agents, waiting is fine — the user should
                        // only be interrupted when automated checks can't resolve the permission.
                        // This applies to bubble mode (always) and explicit canShowPermissionPrompts.
                        if (isAsync && !shouldAvoidPrompts) {
                            toolPermissionContext = __assign(__assign({}, toolPermissionContext), { awaitAutomatedChecksBeforeDialog: true });
                        }
                        // Scope tool permissions: when allowedTools is provided, use them as session rules.
                        // IMPORTANT: Preserve cliArg rules (from SDK's --allowedTools) since those are
                        // explicit permissions from the SDK consumer that should apply to all agents.
                        // Only clear session-level rules from the parent to prevent unintended leakage.
                        if (allowedTools !== undefined) {
                            toolPermissionContext = __assign(__assign({}, toolPermissionContext), { alwaysAllowRules: {
                                    // Preserve SDK-level permissions from --allowedTools
                                    cliArg: state.toolPermissionContext.alwaysAllowRules.cliArg,
                                    // Use the provided allowedTools as session-level permissions
                                    session: __spreadArray([], allowedTools, true),
                                } });
                        }
                        // Override effort level if agent defines one
                        var effortValue = agentDefinition.effort !== undefined
                            ? agentDefinition.effort
                            : state.effortValue;
                        if (toolPermissionContext === state.toolPermissionContext &&
                            effortValue === state.effortValue) {
                            return state;
                        }
                        return __assign(__assign({}, state), { toolPermissionContext: toolPermissionContext, effortValue: effortValue });
                    };
                    resolvedTools = useExactTools
                        ? availableTools
                        : (0, agentToolUtils_js_1.resolveAgentTools)(agentDefinition, availableTools, isAsync).resolvedTools;
                    additionalWorkingDirectories = Array.from(appState.toolPermissionContext.additionalWorkingDirectories.keys());
                    if (!(override === null || override === void 0 ? void 0 : override.systemPrompt)) return [3 /*break*/, 2];
                    _d = override.systemPrompt;
                    return [3 /*break*/, 4];
                case 2:
                    _e = systemPromptType_js_1.asSystemPrompt;
                    return [4 /*yield*/, __await(getAgentSystemPrompt(agentDefinition, toolUseContext, resolvedAgentModel, additionalWorkingDirectories, resolvedTools))];
                case 3:
                    _d = _e.apply(void 0, [_5.sent()]);
                    _5.label = 4;
                case 4:
                    agentSystemPrompt = _d;
                    agentAbortController = (override === null || override === void 0 ? void 0 : override.abortController)
                        ? override.abortController
                        : isAsync
                            ? new AbortController()
                            : toolUseContext.abortController;
                    additionalContexts = [];
                    _5.label = 5;
                case 5:
                    _5.trys.push([5, 10, 11, 16]);
                    _f = true, _g = __asyncValues((0, hooks_js_1.executeSubagentStartHooks)(agentId, agentDefinition.agentType, agentAbortController.signal));
                    _5.label = 6;
                case 6: return [4 /*yield*/, __await(_g.next())];
                case 7:
                    if (!(_h = _5.sent(), _q = _h.done, !_q)) return [3 /*break*/, 9];
                    _s = _h.value;
                    _f = false;
                    hookResult = _s;
                    if (hookResult.additionalContexts &&
                        hookResult.additionalContexts.length > 0) {
                        additionalContexts.push.apply(additionalContexts, hookResult.additionalContexts);
                    }
                    _5.label = 8;
                case 8:
                    _f = true;
                    return [3 /*break*/, 6];
                case 9: return [3 /*break*/, 16];
                case 10:
                    e_1_1 = _5.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 16];
                case 11:
                    _5.trys.push([11, , 14, 15]);
                    if (!(!_f && !_q && (_r = _g.return))) return [3 /*break*/, 13];
                    return [4 /*yield*/, __await(_r.call(_g))];
                case 12:
                    _5.sent();
                    _5.label = 13;
                case 13: return [3 /*break*/, 15];
                case 14:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 15: return [7 /*endfinally*/];
                case 16:
                    // Add SubagentStart hook context as a user message (consistent with SessionStart/UserPromptSubmit)
                    if (additionalContexts.length > 0) {
                        contextMessage = (0, attachments_js_1.createAttachmentMessage)({
                            type: 'hook_additional_context',
                            content: additionalContexts,
                            hookName: 'SubagentStart',
                            toolUseID: (0, crypto_1.randomUUID)(),
                            hookEvent: 'SubagentStart',
                        });
                        initialMessages.push(contextMessage);
                    }
                    hooksAllowedForThisAgent = !(0, pluginOnlyPolicy_js_1.isRestrictedToPluginOnly)('hooks') ||
                        (0, pluginOnlyPolicy_js_1.isSourceAdminTrusted)(agentDefinition.source);
                    if (agentDefinition.hooks && hooksAllowedForThisAgent) {
                        (0, registerFrontmatterHooks_js_1.registerFrontmatterHooks)(rootSetAppState, agentId, agentDefinition.hooks, "agent '".concat(agentDefinition.agentType, "'"), true);
                    }
                    skillsToPreload = (_0 = agentDefinition.skills) !== null && _0 !== void 0 ? _0 : [];
                    if (!(skillsToPreload.length > 0)) return [3 /*break*/, 20];
                    return [4 /*yield*/, __await((0, commands_js_1.getSkillToolCommands)((0, state_js_1.getProjectRoot)())
                        // Filter valid skills and warn about missing ones
                        )];
                case 17:
                    allSkills = _5.sent();
                    validSkills = [];
                    for (_i = 0, skillsToPreload_1 = skillsToPreload; _i < skillsToPreload_1.length; _i++) {
                        skillName = skillsToPreload_1[_i];
                        resolvedName = resolveSkillName(skillName, allSkills, agentDefinition);
                        if (!resolvedName) {
                            (0, debug_js_1.logForDebugging)("[Agent: ".concat(agentDefinition.agentType, "] Warning: Skill '").concat(skillName, "' specified in frontmatter was not found"), { level: 'warn' });
                            continue;
                        }
                        skill = (0, commands_js_1.getCommand)(resolvedName, allSkills);
                        if (skill.type !== 'prompt') {
                            (0, debug_js_1.logForDebugging)("[Agent: ".concat(agentDefinition.agentType, "] Warning: Skill '").concat(skillName, "' is not a prompt-based skill"), { level: 'warn' });
                            continue;
                        }
                        validSkills.push({ skillName: skillName, skill: skill });
                    }
                    return [4 /*yield*/, __await(Promise.resolve().then(function () { return require('../../utils/processUserInput/processSlashCommand.js'); }))];
                case 18:
                    formatSkillLoadingMetadata = (_5.sent()).formatSkillLoadingMetadata;
                    return [4 /*yield*/, __await(Promise.all(validSkills.map(function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
                            var _c;
                            var skillName = _b.skillName, skill = _b.skill;
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0:
                                        _c = {
                                            skillName: skillName,
                                            skill: skill
                                        };
                                        return [4 /*yield*/, skill.getPromptForCommand('', toolUseContext)];
                                    case 1: return [2 /*return*/, (_c.content = _d.sent(),
                                            _c)];
                                }
                            });
                        }); })))];
                case 19:
                    loaded = _5.sent();
                    for (_j = 0, loaded_1 = loaded; _j < loaded_1.length; _j++) {
                        _k = loaded_1[_j], skillName = _k.skillName, skill = _k.skill, content = _k.content;
                        (0, debug_js_1.logForDebugging)("[Agent: ".concat(agentDefinition.agentType, "] Preloaded skill '").concat(skillName, "'"));
                        metadata = formatSkillLoadingMetadata(skillName, skill.progressMessage);
                        initialMessages.push((0, messages_js_1.createUserMessage)({
                            content: __spreadArray([{ type: 'text', text: metadata }], content, true),
                            isMeta: true,
                        }));
                    }
                    _5.label = 20;
                case 20: return [4 /*yield*/, __await(initializeAgentMcpServers(agentDefinition, toolUseContext.options.mcpClients)
                    // Merge agent MCP tools with resolved agent tools, deduplicating by name.
                    // resolvedTools is already deduplicated (see resolveAgentTools), so skip
                    // the spread + uniqBy overhead when there are no agent-specific MCP tools.
                    )];
                case 21:
                    _l = _5.sent(), mergedMcpClients = _l.clients, agentMcpTools = _l.tools, mcpCleanup = _l.cleanup;
                    allTools = agentMcpTools.length > 0
                        ? (0, uniqBy_js_1.default)(__spreadArray(__spreadArray([], resolvedTools, true), agentMcpTools, true), 'name')
                        : resolvedTools;
                    agentOptions = __assign({ isNonInteractiveSession: useExactTools
                            ? toolUseContext.options.isNonInteractiveSession
                            : isAsync
                                ? true
                                : ((_1 = toolUseContext.options.isNonInteractiveSession) !== null && _1 !== void 0 ? _1 : false), appendSystemPrompt: toolUseContext.options.appendSystemPrompt, tools: allTools, commands: [], debug: toolUseContext.options.debug, verbose: toolUseContext.options.verbose, mainLoopModel: resolvedAgentModel, 
                        // For fork children (useExactTools), inherit thinking config to match the
                        // parent's API request prefix for prompt cache hits. For regular
                        // sub-agents, disable thinking to control output token costs.
                        thinkingConfig: useExactTools
                            ? toolUseContext.options.thinkingConfig
                            : { type: 'disabled' }, mcpClients: mergedMcpClients, mcpResources: toolUseContext.options.mcpResources, agentDefinitions: toolUseContext.options.agentDefinitions }, (useExactTools && { querySource: querySource }));
                    agentToolUseContext = (0, forkedAgent_js_1.createSubagentContext)(toolUseContext, {
                        options: agentOptions,
                        agentId: agentId,
                        agentType: agentDefinition.agentType,
                        messages: initialMessages,
                        readFileState: agentReadFileState,
                        abortController: agentAbortController,
                        getAppState: agentGetAppState,
                        // Sync agents share these callbacks with parent
                        shareSetAppState: !isAsync,
                        shareSetResponseLength: true, // Both sync and async contribute to response metrics
                        criticalSystemReminder_EXPERIMENTAL: agentDefinition.criticalSystemReminder_EXPERIMENTAL,
                        contentReplacementState: contentReplacementState,
                    });
                    // Preserve tool use results for subagents with viewable transcripts (in-process teammates)
                    if (preserveToolUseResults) {
                        agentToolUseContext.preserveToolUseResults = true;
                    }
                    // Expose cache-safe params for background summarization (prompt cache sharing)
                    if (onCacheSafeParams) {
                        onCacheSafeParams({
                            systemPrompt: agentSystemPrompt,
                            userContext: resolvedUserContext,
                            systemContext: resolvedSystemContext,
                            toolUseContext: agentToolUseContext,
                            forkContextMessages: initialMessages,
                        });
                    }
                    // Record initial messages before the query loop starts, plus the agentType
                    // so resume can route correctly when subagent_type is omitted. Both writes
                    // are fire-and-forget — persistence failure shouldn't block the agent.
                    void (0, sessionStorage_js_1.recordSidechainTranscript)(initialMessages, agentId).catch(function (_err) {
                        return (0, debug_js_1.logForDebugging)("Failed to record sidechain transcript: ".concat(_err));
                    });
                    void (0, sessionStorage_js_1.writeAgentMetadata)(agentId, __assign(__assign({ agentType: agentDefinition.agentType }, (worktreePath && { worktreePath: worktreePath })), (description && { description: description }))).catch(function (_err) { return (0, debug_js_1.logForDebugging)("Failed to write agent metadata: ".concat(_err)); });
                    lastRecordedUuid = (_3 = (_2 = initialMessages.at(-1)) === null || _2 === void 0 ? void 0 : _2.uuid) !== null && _3 !== void 0 ? _3 : null;
                    _5.label = 22;
                case 22:
                    _5.trys.push([22, , 41, 43]);
                    _5.label = 23;
                case 23:
                    _5.trys.push([23, 34, 35, 40]);
                    _m = true, _o = __asyncValues((0, query_js_1.query)({
                        messages: initialMessages,
                        systemPrompt: agentSystemPrompt,
                        userContext: resolvedUserContext,
                        systemContext: resolvedSystemContext,
                        canUseTool: canUseTool,
                        toolUseContext: agentToolUseContext,
                        querySource: querySource,
                        maxTurns: maxTurns !== null && maxTurns !== void 0 ? maxTurns : agentDefinition.maxTurns,
                    }));
                    _5.label = 24;
                case 24: return [4 /*yield*/, __await(_o.next())];
                case 25:
                    if (!(_p = _5.sent(), _t = _p.done, !_t)) return [3 /*break*/, 33];
                    _v = _p.value;
                    _m = false;
                    message = _v;
                    onQueryProgress === null || onQueryProgress === void 0 ? void 0 : onQueryProgress();
                    // Forward subagent API request starts to parent's metrics display
                    // so TTFT/OTPS update during subagent execution.
                    if (message.type === 'stream_event' &&
                        message.event.type === 'message_start' &&
                        message.ttftMs != null) {
                        (_4 = toolUseContext.pushApiMetricsEntry) === null || _4 === void 0 ? void 0 : _4.call(toolUseContext, message.ttftMs);
                        return [3 /*break*/, 32];
                    }
                    if (!(message.type === 'attachment')) return [3 /*break*/, 28];
                    // Handle max turns reached signal from query.ts
                    if (message.attachment.type === 'max_turns_reached') {
                        (0, debug_js_1.logForDebugging)("[Agent\n: $\n{\n  agentDefinition.agentType\n}\n] Reached max turns limit ($\n{\n  message.attachment.maxTurns\n}\n)");
                        return [3 /*break*/, 33];
                    }
                    return [4 /*yield*/, __await(message)];
                case 26: return [4 /*yield*/, _5.sent()];
                case 27:
                    _5.sent();
                    return [3 /*break*/, 32];
                case 28:
                    if (!isRecordableMessage(message)) return [3 /*break*/, 32];
                    // Record only the new message with correct parent (O(1) per message)
                    return [4 /*yield*/, __await((0, sessionStorage_js_1.recordSidechainTranscript)([message], agentId, lastRecordedUuid).catch(function (err) {
                            return (0, debug_js_1.logForDebugging)("Failed to record sidechain transcript: ".concat(err));
                        }))];
                case 29:
                    // Record only the new message with correct parent (O(1) per message)
                    _5.sent();
                    if (message.type !== 'progress') {
                        lastRecordedUuid = message.uuid;
                    }
                    return [4 /*yield*/, __await(message)];
                case 30: return [4 /*yield*/, _5.sent()];
                case 31:
                    _5.sent();
                    _5.label = 32;
                case 32:
                    _m = true;
                    return [3 /*break*/, 24];
                case 33: return [3 /*break*/, 40];
                case 34:
                    e_2_1 = _5.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 40];
                case 35:
                    _5.trys.push([35, , 38, 39]);
                    if (!(!_m && !_t && (_u = _o.return))) return [3 /*break*/, 37];
                    return [4 /*yield*/, __await(_u.call(_o))];
                case 36:
                    _5.sent();
                    _5.label = 37;
                case 37: return [3 /*break*/, 39];
                case 38:
                    if (e_2) throw e_2.error;
                    return [7 /*endfinally*/];
                case 39: return [7 /*endfinally*/];
                case 40:
                    if (agentAbortController.signal.aborted) {
                        throw new errors_js_1.AbortError();
                    }
                    // Run callback if provided (only built-in agents have callbacks)
                    if ((0, loadAgentsDir_js_1.isBuiltInAgent)(agentDefinition) && agentDefinition.callback) {
                        agentDefinition.callback();
                    }
                    return [3 /*break*/, 43];
                case 41: 
                // Clean up agent-specific MCP servers (runs on normal completion, abort, or error)
                return [4 /*yield*/, __await(mcpCleanup()
                    // Clean up agent's session hooks
                    )];
                case 42:
                    // Clean up agent-specific MCP servers (runs on normal completion, abort, or error)
                    _5.sent();
                    // Clean up agent's session hooks
                    if (agentDefinition.hooks) {
                        (0, sessionHooks_js_1.clearSessionHooks)(rootSetAppState, agentId);
                    }
                    // Clean up prompt cache tracking state for this agent
                    if ((0, bun_bundle_1.feature)('PROMPT_CACHE_BREAK_DETECTION')) {
                        (0, promptCacheBreakDetection_js_1.cleanupAgentTracking)(agentId);
                    }
                    // Release cloned file state cache memory
                    agentToolUseContext.readFileState.clear();
                    // Release the cloned fork context messages
                    initialMessages.length = 0;
                    // Release perfetto agent registry entry
                    (0, perfettoTracing_js_1.unregisterAgent)(agentId);
                    // Release transcript subdir mapping
                    (0, sessionStorage_js_1.clearAgentTranscriptSubdir)(agentId);
                    // Release this agent's todos entry. Without this, every subagent that
                    // called TodoWrite leaves a key in AppState.todos forever (even after all
                    // items complete, the value is [] but the key stays). Whale sessions
                    // spawn hundreds of agents; each orphaned key is a small leak that adds up.
                    rootSetAppState(function (prev) {
                        if (!(agentId in prev.todos))
                            return prev;
                        var _a = prev.todos, _b = agentId, _removed = _a[_b], todos = __rest(_a, [typeof _b === "symbol" ? _b : _b + ""]);
                        return __assign(__assign({}, prev), { todos: todos });
                    });
                    // Kill any background bash tasks this agent spawned. Without this, a
                    // `run_in_background` shell loop (e.g. test fixture fake-logs.sh) outlives
                    // the agent as a PPID=1 zombie once the main session eventually exits.
                    (0, killShellTasks_js_1.killShellTasksForAgent)(agentId, toolUseContext.getAppState, rootSetAppState);
                    /* eslint-disable @typescript-eslint/no-require-imports */
                    if ((0, bun_bundle_1.feature)('MONITOR_TOOL')) {
                        mcpMod = require('../../tasks/MonitorMcpTask/MonitorMcpTask.js');
                        mcpMod.killMonitorMcpTasksForAgent(agentId, toolUseContext.getAppState, rootSetAppState);
                    }
                    return [7 /*endfinally*/];
                case 43: return [2 /*return*/];
            }
        });
    });
}
/**
 * Filters out assistant messages with incomplete tool calls (tool uses without results).
 * This prevents API errors when sending messages with orphaned tool calls.
 */
function filterIncompleteToolCalls(messages) {
    // Build a set of tool use IDs that have results
    var toolUseIdsWithResults = new Set();
    for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
        var message = messages_1[_i];
        if ((message === null || message === void 0 ? void 0 : message.type) === 'user') {
            var userMessage = message;
            var content = userMessage.message.content;
            if (Array.isArray(content)) {
                for (var _a = 0, content_1 = content; _a < content_1.length; _a++) {
                    var block = content_1[_a];
                    if (block.type === 'tool_result' && block.tool_use_id) {
                        toolUseIdsWithResults.add(block.tool_use_id);
                    }
                }
            }
        }
    }
    // Filter out assistant messages that contain tool calls without results
    return messages.filter(function (message) {
        if ((message === null || message === void 0 ? void 0 : message.type) === 'assistant') {
            var assistantMessage = message;
            var content = assistantMessage.message.content;
            if (Array.isArray(content)) {
                // Check if this assistant message has any tool uses without results
                var hasIncompleteToolCall = content.some(function (block) {
                    return block.type === 'tool_use' &&
                        block.id &&
                        !toolUseIdsWithResults.has(block.id);
                });
                // Exclude messages with incomplete tool calls
                return !hasIncompleteToolCall;
            }
        }
        // Keep all non-assistant messages and assistant messages without tool calls
        return true;
    });
}
function getAgentSystemPrompt(agentDefinition, toolUseContext, resolvedAgentModel, additionalWorkingDirectories, resolvedTools) {
    return __awaiter(this, void 0, void 0, function () {
        var enabledToolNames, agentPrompt, prompts, _error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    enabledToolNames = new Set(resolvedTools.map(function (t) { return t.name; }));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    agentPrompt = agentDefinition.getSystemPrompt({ toolUseContext: toolUseContext });
                    prompts = [agentPrompt];
                    return [4 /*yield*/, (0, prompts_js_1.enhanceSystemPromptWithEnvDetails)(prompts, resolvedAgentModel, additionalWorkingDirectories, enabledToolNames)];
                case 2: return [2 /*return*/, _a.sent()];
                case 3:
                    _error_1 = _a.sent();
                    return [2 /*return*/, (0, prompts_js_1.enhanceSystemPromptWithEnvDetails)([prompts_js_1.DEFAULT_AGENT_PROMPT], resolvedAgentModel, additionalWorkingDirectories, enabledToolNames)];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Resolve a skill name from agent frontmatter to a registered command name.
 *
 * Plugin skills are registered with namespaced names (e.g., "my-plugin:my-skill")
 * but agents reference them with bare names (e.g., "my-skill"). This function
 * tries multiple resolution strategies:
 *
 * 1. Exact match via hasCommand (name, userFacingName, aliases)
 * 2. Prefix with agent's plugin name (e.g., "my-skill" → "my-plugin:my-skill")
 * 3. Suffix match — find any command whose name ends with ":skillName"
 */
function resolveSkillName(skillName, allSkills, agentDefinition) {
    // 1. Direct match
    if ((0, commands_js_1.hasCommand)(skillName, allSkills)) {
        return skillName;
    }
    // 2. Try prefixing with the agent's plugin name
    // Plugin agents have agentType like "pluginName:agentName"
    var pluginPrefix = agentDefinition.agentType.split(':')[0];
    if (pluginPrefix) {
        var qualifiedName = "".concat(pluginPrefix, ":").concat(skillName);
        if ((0, commands_js_1.hasCommand)(qualifiedName, allSkills)) {
            return qualifiedName;
        }
    }
    // 3. Suffix match — find a skill whose name ends with ":skillName"
    var suffix = ":".concat(skillName);
    var match = allSkills.find(function (cmd) { return cmd.name.endsWith(suffix); });
    if (match) {
        return match.name;
    }
    return null;
}
