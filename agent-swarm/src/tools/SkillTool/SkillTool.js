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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
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
exports.SkillTool = exports.outputSchema = exports.inputSchema = void 0;
var bun_bundle_1 = require("bun:bundle");
var uniqBy_js_1 = require("lodash-es/uniqBy.js");
var path_1 = require("path");
var state_js_1 = require("src/bootstrap/state.js");
var commands_js_1 = require("src/commands.js");
var Tool_js_1 = require("src/Tool.js");
var debug_js_1 = require("src/utils/debug.js");
var permissions_js_1 = require("src/utils/permissions/permissions.js");
var pluginIdentifier_js_1 = require("src/utils/plugins/pluginIdentifier.js");
var pluginTelemetry_js_1 = require("src/utils/telemetry/pluginTelemetry.js");
var v4_1 = require("zod/v4");
var state_js_2 = require("../../bootstrap/state.js");
var xml_js_1 = require("../../constants/xml.js");
var index_js_1 = require("../../services/analytics/index.js");
var agentContext_js_1 = require("../../utils/agentContext.js");
var errors_js_1 = require("../../utils/errors.js");
var forkedAgent_js_1 = require("../../utils/forkedAgent.js");
var frontmatterParser_js_1 = require("../../utils/frontmatterParser.js");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
var messages_js_1 = require("../../utils/messages.js");
var model_js_1 = require("../../utils/model/model.js");
var skillUsageTracking_js_1 = require("../../utils/suggestions/skillUsageTracking.js");
var uuid_js_1 = require("../../utils/uuid.js");
var runAgent_js_1 = require("../AgentTool/runAgent.js");
var utils_js_1 = require("../utils.js");
var constants_js_1 = require("./constants.js");
var prompt_js_1 = require("./prompt.js");
var UI_js_1 = require("./UI.js");
/**
 * Gets all commands including MCP skills/prompts from AppState.
 * SkillTool needs this because getCommands() only returns local/bundled skills.
 */
function getAllCommands(context) {
    return __awaiter(this, void 0, void 0, function () {
        var mcpSkills, localCommands;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mcpSkills = context
                        .getAppState()
                        .mcp.commands.filter(function (cmd) { return cmd.type === 'prompt' && cmd.loadedFrom === 'mcp'; });
                    if (mcpSkills.length === 0)
                        return [2 /*return*/, (0, commands_js_1.getCommands)((0, state_js_1.getProjectRoot)())];
                    return [4 /*yield*/, (0, commands_js_1.getCommands)((0, state_js_1.getProjectRoot)())];
                case 1:
                    localCommands = _a.sent();
                    return [2 /*return*/, (0, uniqBy_js_1.default)(__spreadArray(__spreadArray([], localCommands, true), mcpSkills, true), 'name')];
            }
        });
    });
}
// Conditional require for remote skill modules — static imports here would
// pull in akiBackend.ts (via remoteSkillLoader → akiBackend), which has
// module-level memoize()/lazySchema() consts that survive tree-shaking as
// side-effecting initializers. All usages are inside
// feature('EXPERIMENTAL_SKILL_SEARCH') guards, so remoteSkillModules is
// non-null at every call site.
/* eslint-disable @typescript-eslint/no-require-imports */
var remoteSkillModules = (0, bun_bundle_1.feature)('EXPERIMENTAL_SKILL_SEARCH')
    ? __assign(__assign(__assign(__assign({}, require('../../services/skillSearch/remoteSkillState.js')), require('../../services/skillSearch/remoteSkillLoader.js')), require('../../services/skillSearch/telemetry.js')), require('../../services/skillSearch/featureCheck.js')) : null;
/* eslint-enable @typescript-eslint/no-require-imports */
/**
 * Executes a skill in a forked sub-agent context.
 * This runs the skill prompt in an isolated agent with its own token budget.
 */
function executeForkedSkill(command, commandName, args, context, canUseTool, parentMessage, onProgress) {
    return __awaiter(this, void 0, void 0, function () {
        var startTime, agentId, isBuiltIn, isOfficialSkill, isBundled, forkedSanitizedName, wasDiscoveredField, pluginMarketplace, queryDepth, parentAgentId, _a, modifiedGetAppState, baseAgent, promptMessages, skillContent, agentDefinition, agentMessages, _b, _c, _d, message, normalizedNew, _i, normalizedNew_1, m, hasToolContent, e_1_1, resultText, durationMs;
        var _e, e_1, _f, _g;
        var _h, _j, _k, _l, _m;
        return __generator(this, function (_o) {
            switch (_o.label) {
                case 0:
                    startTime = Date.now();
                    agentId = (0, uuid_js_1.createAgentId)();
                    isBuiltIn = (0, commands_js_1.builtInCommandNames)().has(commandName);
                    isOfficialSkill = isOfficialMarketplaceSkill(command);
                    isBundled = command.source === 'bundled';
                    forkedSanitizedName = isBuiltIn || isBundled || isOfficialSkill ? commandName : 'custom';
                    wasDiscoveredField = (0, bun_bundle_1.feature)('EXPERIMENTAL_SKILL_SEARCH') &&
                        remoteSkillModules.isSkillSearchEnabled()
                        ? {
                            was_discovered: (_j = (_h = context.discoveredSkillNames) === null || _h === void 0 ? void 0 : _h.has(commandName)) !== null && _j !== void 0 ? _j : false,
                        }
                        : {};
                    pluginMarketplace = command.pluginInfo
                        ? (0, pluginIdentifier_js_1.parsePluginIdentifier)(command.pluginInfo.repository).marketplace
                        : undefined;
                    queryDepth = (_l = (_k = context.queryTracking) === null || _k === void 0 ? void 0 : _k.depth) !== null && _l !== void 0 ? _l : 0;
                    parentAgentId = (_m = (0, agentContext_js_1.getAgentContext)()) === null || _m === void 0 ? void 0 : _m.agentId;
                    (0, index_js_1.logEvent)('tengu_skill_tool_invocation', __assign(__assign(__assign(__assign({ command_name: forkedSanitizedName, 
                        // _PROTO_skill_name routes to the privileged skill_name BQ column
                        // (unredacted, all users); command_name stays in additional_metadata as
                        // the redacted variant for general-access dashboards.
                        _PROTO_skill_name: commandName, execution_context: 'fork', invocation_trigger: (queryDepth > 0
                            ? 'nested-skill'
                            : 'claude-proactive'), query_depth: queryDepth }, (parentAgentId && {
                        parent_agent_id: parentAgentId,
                    })), wasDiscoveredField), (process.env.USER_TYPE === 'ant' && __assign(__assign({ skill_name: commandName, skill_source: command.source }, (command.loadedFrom && {
                        skill_loaded_from: command.loadedFrom,
                    })), (command.kind && {
                        skill_kind: command.kind,
                    })))), (command.pluginInfo && __assign(__assign(__assign({ 
                        // _PROTO_* routes to PII-tagged plugin_name/marketplace_name BQ columns
                        // (unredacted, all users); plugin_name/plugin_repository stay in
                        // additional_metadata as redacted variants.
                        _PROTO_plugin_name: command.pluginInfo.pluginManifest
                            .name }, (pluginMarketplace && {
                        _PROTO_marketplace_name: pluginMarketplace,
                    })), { plugin_name: (isOfficialSkill
                            ? command.pluginInfo.pluginManifest.name
                            : 'third-party'), plugin_repository: (isOfficialSkill
                            ? command.pluginInfo.repository
                            : 'third-party') }), (0, pluginTelemetry_js_1.buildPluginCommandTelemetryFields)(command.pluginInfo)))));
                    return [4 /*yield*/, (0, forkedAgent_js_1.prepareForkedCommandContext)(command, args || '', context)
                        // Merge skill's effort into the agent definition so runAgent applies it
                    ];
                case 1:
                    _a = _o.sent(), modifiedGetAppState = _a.modifiedGetAppState, baseAgent = _a.baseAgent, promptMessages = _a.promptMessages, skillContent = _a.skillContent;
                    agentDefinition = command.effort !== undefined
                        ? __assign(__assign({}, baseAgent), { effort: command.effort }) : baseAgent;
                    agentMessages = [];
                    (0, debug_js_1.logForDebugging)("SkillTool executing forked skill ".concat(commandName, " with agent ").concat(agentDefinition.agentType));
                    _o.label = 2;
                case 2:
                    _o.trys.push([2, , 15, 16]);
                    _o.label = 3;
                case 3:
                    _o.trys.push([3, 8, 9, 14]);
                    _b = true, _c = __asyncValues((0, runAgent_js_1.runAgent)({
                        agentDefinition: agentDefinition,
                        promptMessages: promptMessages,
                        toolUseContext: __assign(__assign({}, context), { getAppState: modifiedGetAppState }),
                        canUseTool: canUseTool,
                        isAsync: false,
                        querySource: 'agent:custom',
                        model: command.model,
                        availableTools: context.options.tools,
                        override: { agentId: agentId },
                    }));
                    _o.label = 4;
                case 4: return [4 /*yield*/, _c.next()];
                case 5:
                    if (!(_d = _o.sent(), _e = _d.done, !_e)) return [3 /*break*/, 7];
                    _g = _d.value;
                    _b = false;
                    message = _g;
                    agentMessages.push(message);
                    // Report progress for tool uses (like AgentTool does)
                    if ((message.type === 'assistant' || message.type === 'user') &&
                        onProgress) {
                        normalizedNew = (0, messages_js_1.normalizeMessages)([message]);
                        for (_i = 0, normalizedNew_1 = normalizedNew; _i < normalizedNew_1.length; _i++) {
                            m = normalizedNew_1[_i];
                            hasToolContent = m.message.content.some(function (c) { return c.type === 'tool_use' || c.type === 'tool_result'; });
                            if (hasToolContent) {
                                onProgress({
                                    toolUseID: "skill_".concat(parentMessage.message.id),
                                    data: {
                                        message: m,
                                        type: 'skill_progress',
                                        prompt: skillContent,
                                        agentId: agentId,
                                    },
                                });
                            }
                        }
                    }
                    _o.label = 6;
                case 6:
                    _b = true;
                    return [3 /*break*/, 4];
                case 7: return [3 /*break*/, 14];
                case 8:
                    e_1_1 = _o.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 14];
                case 9:
                    _o.trys.push([9, , 12, 13]);
                    if (!(!_b && !_e && (_f = _c.return))) return [3 /*break*/, 11];
                    return [4 /*yield*/, _f.call(_c)];
                case 10:
                    _o.sent();
                    _o.label = 11;
                case 11: return [3 /*break*/, 13];
                case 12:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 13: return [7 /*endfinally*/];
                case 14:
                    resultText = (0, forkedAgent_js_1.extractResultText)(agentMessages, 'Skill execution completed');
                    // Release message memory after extracting result
                    agentMessages.length = 0;
                    durationMs = Date.now() - startTime;
                    (0, debug_js_1.logForDebugging)("SkillTool forked skill ".concat(commandName, " completed in ").concat(durationMs, "ms"));
                    return [2 /*return*/, {
                            data: {
                                success: true,
                                commandName: commandName,
                                status: 'forked',
                                agentId: agentId,
                                result: resultText,
                            },
                        }];
                case 15:
                    // Release skill content from invokedSkills state
                    (0, state_js_2.clearInvokedSkillsForAgent)(agentId);
                    return [7 /*endfinally*/];
                case 16: return [2 /*return*/];
            }
        });
    });
}
exports.inputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        skill: v4_1.z
            .string()
            .describe('The skill name. E.g., "commit", "review-pr", or "pdf"'),
        args: v4_1.z.string().optional().describe('Optional arguments for the skill'),
    });
});
exports.outputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    // Output schema for inline skills (default)
    var inlineOutputSchema = v4_1.z.object({
        success: v4_1.z.boolean().describe('Whether the skill is valid'),
        commandName: v4_1.z.string().describe('The name of the skill'),
        allowedTools: v4_1.z
            .array(v4_1.z.string())
            .optional()
            .describe('Tools allowed by this skill'),
        model: v4_1.z.string().optional().describe('Model override if specified'),
        status: v4_1.z.literal('inline').optional().describe('Execution status'),
    });
    // Output schema for forked skills
    var forkedOutputSchema = v4_1.z.object({
        success: v4_1.z.boolean().describe('Whether the skill completed successfully'),
        commandName: v4_1.z.string().describe('The name of the skill'),
        status: v4_1.z.literal('forked').describe('Execution status'),
        agentId: v4_1.z
            .string()
            .describe('The ID of the sub-agent that executed the skill'),
        result: v4_1.z.string().describe('The result from the forked skill execution'),
    });
    return v4_1.z.union([inlineOutputSchema, forkedOutputSchema]);
});
exports.SkillTool = (0, Tool_js_1.buildTool)({
    name: constants_js_1.SKILL_TOOL_NAME,
    searchHint: 'invoke a slash-command skill',
    maxResultSizeChars: 100000,
    get inputSchema() {
        return (0, exports.inputSchema)();
    },
    get outputSchema() {
        return (0, exports.outputSchema)();
    },
    description: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var skill = _b.skill;
        return __generator(this, function (_c) {
            return [2 /*return*/, "Execute skill: ".concat(skill)];
        });
    }); },
    prompt: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, (0, prompt_js_1.getPrompt)((0, state_js_1.getProjectRoot)())];
    }); }); },
    // Only one skill/command should run at a time, since the tool expands the
    // command into a full prompt that Claude must process before continuing.
    // Skill-coach needs the skill name to avoid false-positive "you could have
    // used skill X" suggestions when X was actually invoked. Backseat classifies
    // downstream tool calls from the expanded prompt, not this wrapper, so the
    // name alone is sufficient — it just records that the skill fired.
    toAutoClassifierInput: function (_a) {
        var skill = _a.skill;
        return skill !== null && skill !== void 0 ? skill : '';
    },
    validateInput: function (_a, context_1) {
        return __awaiter(this, arguments, void 0, function (_b, context) {
            var trimmed, hasLeadingSlash, normalizedCommandName, slug, meta, commands, foundCommand;
            var skill = _b.skill;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        trimmed = skill.trim();
                        if (!trimmed) {
                            return [2 /*return*/, {
                                    result: false,
                                    message: "Invalid skill format: ".concat(skill),
                                    errorCode: 1,
                                }];
                        }
                        hasLeadingSlash = trimmed.startsWith('/');
                        if (hasLeadingSlash) {
                            (0, index_js_1.logEvent)('tengu_skill_tool_slash_prefix', {});
                        }
                        normalizedCommandName = hasLeadingSlash
                            ? trimmed.substring(1)
                            : trimmed;
                        // Remote canonical skill handling (ant-only experimental). Intercept
                        // `_canonical_<slug>` names before local command lookup since remote
                        // skills are not in the local command registry.
                        if ((0, bun_bundle_1.feature)('EXPERIMENTAL_SKILL_SEARCH') &&
                            process.env.USER_TYPE === 'ant') {
                            slug = remoteSkillModules.stripCanonicalPrefix(normalizedCommandName);
                            if (slug !== null) {
                                meta = remoteSkillModules.getDiscoveredRemoteSkill(slug);
                                if (!meta) {
                                    return [2 /*return*/, {
                                            result: false,
                                            message: "Remote skill ".concat(slug, " was not discovered in this session. Use DiscoverSkills to find remote skills first."),
                                            errorCode: 6,
                                        }];
                                }
                                // Discovered remote skill — valid. Loading happens in call().
                                return [2 /*return*/, { result: true }];
                            }
                        }
                        return [4 /*yield*/, getAllCommands(context)
                            // Check if command exists
                        ];
                    case 1:
                        commands = _c.sent();
                        foundCommand = (0, commands_js_1.findCommand)(normalizedCommandName, commands);
                        if (!foundCommand) {
                            return [2 /*return*/, {
                                    result: false,
                                    message: "Unknown skill: ".concat(normalizedCommandName),
                                    errorCode: 2,
                                }];
                        }
                        // Check if command has model invocation disabled
                        if (foundCommand.disableModelInvocation) {
                            return [2 /*return*/, {
                                    result: false,
                                    message: "Skill ".concat(normalizedCommandName, " cannot be used with ").concat(constants_js_1.SKILL_TOOL_NAME, " tool due to disable-model-invocation"),
                                    errorCode: 4,
                                }];
                        }
                        // Check if command is a prompt-based command
                        if (foundCommand.type !== 'prompt') {
                            return [2 /*return*/, {
                                    result: false,
                                    message: "Skill ".concat(normalizedCommandName, " is not a prompt-based skill"),
                                    errorCode: 5,
                                }];
                        }
                        return [2 /*return*/, { result: true }];
                }
            });
        });
    },
    checkPermissions: function (_a, context_1) {
        return __awaiter(this, arguments, void 0, function (_b, context) {
            var trimmed, commandName, appState, permissionContext, commands, commandObj, ruleMatches, denyRules, _i, _c, _d, ruleContent, rule, slug, allowRules, _e, _f, _g, ruleContent, rule, suggestions;
            var skill = _b.skill, args = _b.args;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        trimmed = skill.trim();
                        commandName = trimmed.startsWith('/') ? trimmed.substring(1) : trimmed;
                        appState = context.getAppState();
                        permissionContext = appState.toolPermissionContext;
                        return [4 /*yield*/, getAllCommands(context)];
                    case 1:
                        commands = _h.sent();
                        commandObj = (0, commands_js_1.findCommand)(commandName, commands);
                        ruleMatches = function (ruleContent) {
                            // Normalize rule content by stripping leading slash
                            var normalizedRule = ruleContent.startsWith('/')
                                ? ruleContent.substring(1)
                                : ruleContent;
                            // Check exact match (using normalized commandName)
                            if (normalizedRule === commandName) {
                                return true;
                            }
                            // Check prefix match (e.g., "review:*" matches "review-pr 123")
                            if (normalizedRule.endsWith(':*')) {
                                var prefix = normalizedRule.slice(0, -2); // Remove ':*'
                                return commandName.startsWith(prefix);
                            }
                            return false;
                        };
                        denyRules = (0, permissions_js_1.getRuleByContentsForTool)(permissionContext, exports.SkillTool, 'deny');
                        for (_i = 0, _c = denyRules.entries(); _i < _c.length; _i++) {
                            _d = _c[_i], ruleContent = _d[0], rule = _d[1];
                            if (ruleMatches(ruleContent)) {
                                return [2 /*return*/, {
                                        behavior: 'deny',
                                        message: "Skill execution blocked by permission rules",
                                        decisionReason: {
                                            type: 'rule',
                                            rule: rule,
                                        },
                                    }];
                            }
                        }
                        // Remote canonical skills are ant-only experimental — auto-grant.
                        // Placed AFTER the deny loop so a user-configured Skill(_canonical_:*)
                        // deny rule is honored (same pattern as safe-properties auto-allow below).
                        // The skill content itself is canonical/curated, not user-authored.
                        if ((0, bun_bundle_1.feature)('EXPERIMENTAL_SKILL_SEARCH') &&
                            process.env.USER_TYPE === 'ant') {
                            slug = remoteSkillModules.stripCanonicalPrefix(commandName);
                            if (slug !== null) {
                                return [2 /*return*/, {
                                        behavior: 'allow',
                                        updatedInput: { skill: skill, args: args },
                                        decisionReason: undefined,
                                    }];
                            }
                        }
                        allowRules = (0, permissions_js_1.getRuleByContentsForTool)(permissionContext, exports.SkillTool, 'allow');
                        for (_e = 0, _f = allowRules.entries(); _e < _f.length; _e++) {
                            _g = _f[_e], ruleContent = _g[0], rule = _g[1];
                            if (ruleMatches(ruleContent)) {
                                return [2 /*return*/, {
                                        behavior: 'allow',
                                        updatedInput: { skill: skill, args: args },
                                        decisionReason: {
                                            type: 'rule',
                                            rule: rule,
                                        },
                                    }];
                            }
                        }
                        // Auto-allow skills that only use safe properties.
                        // This is an allowlist: if a skill has any property NOT in this set with a
                        // meaningful value, it requires permission. This ensures new properties added
                        // in the future default to requiring permission.
                        if ((commandObj === null || commandObj === void 0 ? void 0 : commandObj.type) === 'prompt' &&
                            skillHasOnlySafeProperties(commandObj)) {
                            return [2 /*return*/, {
                                    behavior: 'allow',
                                    updatedInput: { skill: skill, args: args },
                                    decisionReason: undefined,
                                }];
                        }
                        suggestions = [
                            // Exact skill suggestion
                            {
                                type: 'addRules',
                                rules: [
                                    {
                                        toolName: constants_js_1.SKILL_TOOL_NAME,
                                        ruleContent: commandName,
                                    },
                                ],
                                behavior: 'allow',
                                destination: 'localSettings',
                            },
                            // Prefix suggestion to allow any args
                            {
                                type: 'addRules',
                                rules: [
                                    {
                                        toolName: constants_js_1.SKILL_TOOL_NAME,
                                        ruleContent: "".concat(commandName, ":*"),
                                    },
                                ],
                                behavior: 'allow',
                                destination: 'localSettings',
                            },
                        ];
                        // Default behavior: ask user for permission
                        return [2 /*return*/, {
                                behavior: 'ask',
                                message: "Execute skill: ".concat(commandName),
                                decisionReason: undefined,
                                suggestions: suggestions,
                                updatedInput: { skill: skill, args: args },
                                metadata: commandObj ? { command: commandObj } : undefined,
                            }];
                }
            });
        });
    },
    call: function (_a, context_1, canUseTool_1, parentMessage_1, onProgress_1) {
        return __awaiter(this, arguments, void 0, function (_b, context, canUseTool, parentMessage, onProgress) {
            var trimmed, commandName, slug, commands, command, processPromptSlashCommand, processedCommand, allowedTools, model, effort, isBuiltIn, isBundled, isOfficialSkill, sanitizedCommandName, wasDiscoveredField, pluginMarketplace, queryDepth, parentAgentId, toolUseID, newMessages;
            var _c, _d, _e, _f, _g;
            var skill = _b.skill, args = _b.args;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        trimmed = skill.trim();
                        commandName = trimmed.startsWith('/') ? trimmed.substring(1) : trimmed;
                        // Remote canonical skill execution (ant-only experimental). Intercepts
                        // `_canonical_<slug>` before local command lookup — loads SKILL.md from
                        // AKI/GCS (with local cache), injects content directly as a user message.
                        // Remote skills are declarative markdown so no slash-command expansion
                        // (no !command substitution, no $ARGUMENTS interpolation) is needed.
                        if ((0, bun_bundle_1.feature)('EXPERIMENTAL_SKILL_SEARCH') &&
                            process.env.USER_TYPE === 'ant') {
                            slug = remoteSkillModules.stripCanonicalPrefix(commandName);
                            if (slug !== null) {
                                return [2 /*return*/, executeRemoteSkill(slug, commandName, parentMessage, context)];
                            }
                        }
                        return [4 /*yield*/, getAllCommands(context)];
                    case 1:
                        commands = _h.sent();
                        command = (0, commands_js_1.findCommand)(commandName, commands);
                        // Track skill usage for ranking
                        (0, skillUsageTracking_js_1.recordSkillUsage)(commandName);
                        // Check if skill should run as a forked sub-agent
                        if ((command === null || command === void 0 ? void 0 : command.type) === 'prompt' && command.context === 'fork') {
                            return [2 /*return*/, executeForkedSkill(command, commandName, args, context, canUseTool, parentMessage, onProgress)];
                        }
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('src/utils/processUserInput/processSlashCommand.js'); })];
                    case 2:
                        processPromptSlashCommand = (_h.sent()).processPromptSlashCommand;
                        return [4 /*yield*/, processPromptSlashCommand(commandName, args || '', // Pass args if provided
                            commands, context)];
                    case 3:
                        processedCommand = _h.sent();
                        if (!processedCommand.shouldQuery) {
                            throw new Error('Command processing failed');
                        }
                        allowedTools = processedCommand.allowedTools || [];
                        model = processedCommand.model;
                        effort = (command === null || command === void 0 ? void 0 : command.type) === 'prompt' ? command.effort : undefined;
                        isBuiltIn = (0, commands_js_1.builtInCommandNames)().has(commandName);
                        isBundled = (command === null || command === void 0 ? void 0 : command.type) === 'prompt' && command.source === 'bundled';
                        isOfficialSkill = (command === null || command === void 0 ? void 0 : command.type) === 'prompt' && isOfficialMarketplaceSkill(command);
                        sanitizedCommandName = isBuiltIn || isBundled || isOfficialSkill ? commandName : 'custom';
                        wasDiscoveredField = (0, bun_bundle_1.feature)('EXPERIMENTAL_SKILL_SEARCH') &&
                            remoteSkillModules.isSkillSearchEnabled()
                            ? {
                                was_discovered: (_d = (_c = context.discoveredSkillNames) === null || _c === void 0 ? void 0 : _c.has(commandName)) !== null && _d !== void 0 ? _d : false,
                            }
                            : {};
                        pluginMarketplace = (command === null || command === void 0 ? void 0 : command.type) === 'prompt' && command.pluginInfo
                            ? (0, pluginIdentifier_js_1.parsePluginIdentifier)(command.pluginInfo.repository).marketplace
                            : undefined;
                        queryDepth = (_f = (_e = context.queryTracking) === null || _e === void 0 ? void 0 : _e.depth) !== null && _f !== void 0 ? _f : 0;
                        parentAgentId = (_g = (0, agentContext_js_1.getAgentContext)()) === null || _g === void 0 ? void 0 : _g.agentId;
                        (0, index_js_1.logEvent)('tengu_skill_tool_invocation', __assign(__assign(__assign(__assign({ command_name: sanitizedCommandName, 
                            // _PROTO_skill_name routes to the privileged skill_name BQ column
                            // (unredacted, all users); command_name stays in additional_metadata as
                            // the redacted variant for general-access dashboards.
                            _PROTO_skill_name: commandName, execution_context: 'inline', invocation_trigger: (queryDepth > 0
                                ? 'nested-skill'
                                : 'claude-proactive'), query_depth: queryDepth }, (parentAgentId && {
                            parent_agent_id: parentAgentId,
                        })), wasDiscoveredField), (process.env.USER_TYPE === 'ant' && __assign(__assign(__assign({ skill_name: commandName }, ((command === null || command === void 0 ? void 0 : command.type) === 'prompt' && {
                            skill_source: command.source,
                        })), ((command === null || command === void 0 ? void 0 : command.loadedFrom) && {
                            skill_loaded_from: command.loadedFrom,
                        })), ((command === null || command === void 0 ? void 0 : command.kind) && {
                            skill_kind: command.kind,
                        })))), ((command === null || command === void 0 ? void 0 : command.type) === 'prompt' &&
                            command.pluginInfo && __assign(__assign(__assign({ _PROTO_plugin_name: command.pluginInfo.pluginManifest
                                .name }, (pluginMarketplace && {
                            _PROTO_marketplace_name: pluginMarketplace,
                        })), { plugin_name: (isOfficialSkill
                                ? command.pluginInfo.pluginManifest.name
                                : 'third-party'), plugin_repository: (isOfficialSkill
                                ? command.pluginInfo.repository
                                : 'third-party') }), (0, pluginTelemetry_js_1.buildPluginCommandTelemetryFields)(command.pluginInfo)))));
                        toolUseID = (0, utils_js_1.getToolUseIDFromParentMessage)(parentMessage, constants_js_1.SKILL_TOOL_NAME);
                        newMessages = (0, utils_js_1.tagMessagesWithToolUseID)(processedCommand.messages.filter(function (m) {
                            if (m.type === 'progress') {
                                return false;
                            }
                            // Filter out command-message since SkillTool handles display
                            if (m.type === 'user' && 'message' in m) {
                                var content = m.message.content;
                                if (typeof content === 'string' &&
                                    content.includes("<".concat(xml_js_1.COMMAND_MESSAGE_TAG, ">"))) {
                                    return false;
                                }
                            }
                            return true;
                        }), toolUseID);
                        (0, debug_js_1.logForDebugging)("SkillTool returning ".concat(newMessages.length, " newMessages for skill ").concat(commandName));
                        // Note: addInvokedSkill and registerSkillHooks are called inside
                        // processPromptSlashCommand (via getMessagesForPromptSlashCommand), so
                        // calling them again here would double-register hooks and rebuild
                        // skillContent redundantly.
                        // Return success with newMessages and contextModifier
                        return [2 /*return*/, {
                                data: {
                                    success: true,
                                    commandName: commandName,
                                    allowedTools: allowedTools.length > 0 ? allowedTools : undefined,
                                    model: model,
                                },
                                newMessages: newMessages,
                                contextModifier: function (ctx) {
                                    var modifiedContext = ctx;
                                    // Update allowed tools if specified
                                    if (allowedTools.length > 0) {
                                        // Capture the current getAppState to chain modifications properly
                                        var previousGetAppState_1 = modifiedContext.getAppState;
                                        modifiedContext = __assign(__assign({}, modifiedContext), { getAppState: function () {
                                                // Use the previous getAppState, not the closure's context.getAppState,
                                                // to properly chain context modifications
                                                var appState = previousGetAppState_1();
                                                return __assign(__assign({}, appState), { toolPermissionContext: __assign(__assign({}, appState.toolPermissionContext), { alwaysAllowRules: __assign(__assign({}, appState.toolPermissionContext.alwaysAllowRules), { command: __spreadArray([], new Set(__spreadArray(__spreadArray([], (appState.toolPermissionContext.alwaysAllowRules
                                                                .command || []), true), allowedTools, true)), true) }) }) });
                                            } });
                                    }
                                    // Carry [1m] suffix over — otherwise a skill with `model: opus` on an
                                    // opus[1m] session drops the effective window to 200K and trips autocompact.
                                    if (model) {
                                        modifiedContext = __assign(__assign({}, modifiedContext), { options: __assign(__assign({}, modifiedContext.options), { mainLoopModel: (0, model_js_1.resolveSkillModelOverride)(model, ctx.options.mainLoopModel) }) });
                                    }
                                    // Override effort level if skill specifies one
                                    if (effort !== undefined) {
                                        var previousGetAppState_2 = modifiedContext.getAppState;
                                        modifiedContext = __assign(__assign({}, modifiedContext), { getAppState: function () {
                                                var appState = previousGetAppState_2();
                                                return __assign(__assign({}, appState), { effortValue: effort });
                                            } });
                                    }
                                    return modifiedContext;
                                },
                            }];
                }
            });
        });
    },
    mapToolResultToToolResultBlockParam: function (result, toolUseID) {
        // Handle forked skill result
        if ('status' in result && result.status === 'forked') {
            return {
                type: 'tool_result',
                tool_use_id: toolUseID,
                content: "Skill \"".concat(result.commandName, "\" completed (forked execution).\n\nResult:\n").concat(result.result),
            };
        }
        // Inline skill result (default)
        return {
            type: 'tool_result',
            tool_use_id: toolUseID,
            content: "Launching skill: ".concat(result.commandName),
        };
    },
    renderToolResultMessage: UI_js_1.renderToolResultMessage,
    renderToolUseMessage: UI_js_1.renderToolUseMessage,
    renderToolUseProgressMessage: UI_js_1.renderToolUseProgressMessage,
    renderToolUseRejectedMessage: UI_js_1.renderToolUseRejectedMessage,
    renderToolUseErrorMessage: UI_js_1.renderToolUseErrorMessage,
});
// Allowlist of PromptCommand property keys that are safe and don't require permission.
// If a skill has any property NOT in this set with a meaningful value, it requires
// permission. This ensures new properties added to PromptCommand in the future
// default to requiring permission until explicitly reviewed and added here.
var SAFE_SKILL_PROPERTIES = new Set([
    // PromptCommand properties
    'type',
    'progressMessage',
    'contentLength',
    'argNames',
    'model',
    'effort',
    'source',
    'pluginInfo',
    'disableNonInteractive',
    'skillRoot',
    'context',
    'agent',
    'getPromptForCommand',
    'frontmatterKeys',
    // CommandBase properties
    'name',
    'description',
    'hasUserSpecifiedDescription',
    'isEnabled',
    'isHidden',
    'aliases',
    'isMcp',
    'argumentHint',
    'whenToUse',
    'paths',
    'version',
    'disableModelInvocation',
    'userInvocable',
    'loadedFrom',
    'immediate',
    'userFacingName',
]);
function skillHasOnlySafeProperties(command) {
    for (var _i = 0, _a = Object.keys(command); _i < _a.length; _i++) {
        var key = _a[_i];
        if (SAFE_SKILL_PROPERTIES.has(key)) {
            continue;
        }
        // Property not in safe allowlist - check if it has a meaningful value
        var value = command[key];
        if (value === undefined || value === null) {
            continue;
        }
        if (Array.isArray(value) && value.length === 0) {
            continue;
        }
        if (typeof value === 'object' &&
            !Array.isArray(value) &&
            Object.keys(value).length === 0) {
            continue;
        }
        return false;
    }
    return true;
}
function isOfficialMarketplaceSkill(command) {
    var _a;
    if (command.source !== 'plugin' || !((_a = command.pluginInfo) === null || _a === void 0 ? void 0 : _a.repository)) {
        return false;
    }
    return (0, pluginIdentifier_js_1.isOfficialMarketplaceName)((0, pluginIdentifier_js_1.parsePluginIdentifier)(command.pluginInfo.repository).marketplace);
}
/**
 * Extract URL scheme for telemetry. Defaults to 'gs' for unrecognized schemes
 * since the AKI backend is the only production path and the loader throws on
 * unknown schemes before we reach telemetry anyway.
 */
function extractUrlScheme(url) {
    if (url.startsWith('gs://'))
        return 'gs';
    if (url.startsWith('https://'))
        return 'https';
    if (url.startsWith('http://'))
        return 'http';
    if (url.startsWith('s3://'))
        return 's3';
    return 'gs';
}
/**
 * Load a remote canonical skill and inject its SKILL.md content into the
 * conversation. Unlike local skills (which go through processPromptSlashCommand
 * for !command / $ARGUMENTS expansion), remote skills are declarative markdown
 * — we wrap the content directly in a user message.
 *
 * The skill is also registered with addInvokedSkill so it survives compaction
 * (same as local skills).
 *
 * Only called from within a feature('EXPERIMENTAL_SKILL_SEARCH') guard in
 * call() — remoteSkillModules is non-null here.
 */
function executeRemoteSkill(slug, commandName, parentMessage, context) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, getDiscoveredRemoteSkill, loadRemoteSkill, logRemoteSkillLoaded, meta, urlScheme, loadResult, e_2, msg, cacheHit, latencyMs, skillPath, content, fileCount, totalBytes, fetchMethod, queryDepth, parentAgentId, bodyContent, skillDir, normalizedDir, finalContent, toolUseID;
        var _b, _c, _d, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    _a = remoteSkillModules, getDiscoveredRemoteSkill = _a.getDiscoveredRemoteSkill, loadRemoteSkill = _a.loadRemoteSkill, logRemoteSkillLoaded = _a.logRemoteSkillLoaded;
                    meta = getDiscoveredRemoteSkill(slug);
                    if (!meta) {
                        throw new Error("Remote skill ".concat(slug, " was not discovered in this session. Use DiscoverSkills to find remote skills first."));
                    }
                    urlScheme = extractUrlScheme(meta.url);
                    _g.label = 1;
                case 1:
                    _g.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, loadRemoteSkill(slug, meta.url)];
                case 2:
                    loadResult = _g.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_2 = _g.sent();
                    msg = (0, errors_js_1.errorMessage)(e_2);
                    logRemoteSkillLoaded({
                        slug: slug,
                        cacheHit: false,
                        latencyMs: 0,
                        urlScheme: urlScheme,
                        error: msg,
                    });
                    throw new Error("Failed to load remote skill ".concat(slug, ": ").concat(msg));
                case 4:
                    cacheHit = loadResult.cacheHit, latencyMs = loadResult.latencyMs, skillPath = loadResult.skillPath, content = loadResult.content, fileCount = loadResult.fileCount, totalBytes = loadResult.totalBytes, fetchMethod = loadResult.fetchMethod;
                    logRemoteSkillLoaded({
                        slug: slug,
                        cacheHit: cacheHit,
                        latencyMs: latencyMs,
                        urlScheme: urlScheme,
                        fileCount: fileCount,
                        totalBytes: totalBytes,
                        fetchMethod: fetchMethod,
                    });
                    queryDepth = (_c = (_b = context.queryTracking) === null || _b === void 0 ? void 0 : _b.depth) !== null && _c !== void 0 ? _c : 0;
                    parentAgentId = (_d = (0, agentContext_js_1.getAgentContext)()) === null || _d === void 0 ? void 0 : _d.agentId;
                    (0, index_js_1.logEvent)('tengu_skill_tool_invocation', __assign(__assign(__assign({ command_name: 'remote_skill', 
                        // _PROTO_skill_name routes to the privileged skill_name BQ column
                        // (unredacted, all users); command_name stays in additional_metadata as
                        // the redacted variant.
                        _PROTO_skill_name: commandName, execution_context: 'remote', invocation_trigger: (queryDepth > 0
                            ? 'nested-skill'
                            : 'claude-proactive'), query_depth: queryDepth }, (parentAgentId && {
                        parent_agent_id: parentAgentId,
                    })), { was_discovered: true, is_remote: true, remote_cache_hit: cacheHit, remote_load_latency_ms: latencyMs }), (process.env.USER_TYPE === 'ant' && {
                        skill_name: commandName,
                        remote_slug: slug,
                    })));
                    (0, skillUsageTracking_js_1.recordSkillUsage)(commandName);
                    (0, debug_js_1.logForDebugging)("SkillTool loaded remote skill ".concat(slug, " (cacheHit=").concat(cacheHit, ", ").concat(latencyMs, "ms, ").concat(content.length, " chars)"));
                    bodyContent = (0, frontmatterParser_js_1.parseFrontmatter)(content, skillPath).content;
                    skillDir = (0, path_1.dirname)(skillPath);
                    normalizedDir = process.platform === 'win32' ? skillDir.replace(/\\/g, '/') : skillDir;
                    finalContent = "Base directory for this skill: ".concat(normalizedDir, "\n\n").concat(bodyContent);
                    finalContent = finalContent.replace(/\$\{CLAUDE_SKILL_DIR\}/g, normalizedDir);
                    finalContent = finalContent.replace(/\$\{CLAUDE_SESSION_ID\}/g, (0, state_js_2.getSessionId)());
                    // Register with compaction-preservation state. Use the cached file path so
                    // post-compact restoration knows where the content came from. Must use
                    // finalContent (not raw content) so the base directory header and
                    // ${CLAUDE_SKILL_DIR} substitutions survive compaction — matches how local
                    // skills store their already-transformed content via processSlashCommand.
                    (0, state_js_2.addInvokedSkill)(commandName, skillPath, finalContent, (_f = (_e = (0, agentContext_js_1.getAgentContext)()) === null || _e === void 0 ? void 0 : _e.agentId) !== null && _f !== void 0 ? _f : null);
                    toolUseID = (0, utils_js_1.getToolUseIDFromParentMessage)(parentMessage, constants_js_1.SKILL_TOOL_NAME);
                    return [2 /*return*/, {
                            data: { success: true, commandName: commandName, status: 'inline' },
                            newMessages: (0, utils_js_1.tagMessagesWithToolUseID)([(0, messages_js_1.createUserMessage)({ content: finalContent, isMeta: true })], toolUseID),
                        }];
            }
        });
    });
}
