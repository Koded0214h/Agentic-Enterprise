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
exports.TOOL_TOKEN_COUNT_OVERHEAD = void 0;
exports.countToolDefinitionTokens = countToolDefinitionTokens;
exports.countMcpToolTokens = countMcpToolTokens;
exports.analyzeContextUsage = analyzeContextUsage;
var bun_bundle_1 = require("bun:bundle");
var prompts_js_1 = require("src/constants/prompts.js");
var microCompact_js_1 = require("src/services/compact/microCompact.js");
var state_js_1 = require("../bootstrap/state.js");
var commands_js_1 = require("../commands.js");
var context_js_1 = require("../context.js");
var growthbook_js_1 = require("../services/analytics/growthbook.js");
var autoCompact_js_1 = require("../services/compact/autoCompact.js");
var tokenEstimation_js_1 = require("../services/tokenEstimation.js");
var loadSkillsDir_js_1 = require("../skills/loadSkillsDir.js");
var Tool_js_1 = require("../Tool.js");
var constants_js_1 = require("../tools/SkillTool/constants.js");
var prompt_js_1 = require("../tools/SkillTool/prompt.js");
var api_js_1 = require("./api.js");
var claudemd_js_1 = require("./claudemd.js");
var context_js_2 = require("./context.js");
var cwd_js_1 = require("./cwd.js");
var debug_js_1 = require("./debug.js");
var envUtils_js_1 = require("./envUtils.js");
var errors_js_1 = require("./errors.js");
var log_js_1 = require("./log.js");
var messages_js_1 = require("./messages.js");
var model_js_1 = require("./model/model.js");
var slowOperations_js_1 = require("./slowOperations.js");
var systemPrompt_js_1 = require("./systemPrompt.js");
var tokens_js_1 = require("./tokens.js");
var RESERVED_CATEGORY_NAME = 'Autocompact buffer';
var MANUAL_COMPACT_BUFFER_NAME = 'Compact buffer';
/**
 * Fixed token overhead added by the API when tools are present.
 * The API adds a tool prompt preamble (~500 tokens) once per API call when tools are present.
 * When we count tools individually via the token counting API, each call includes this overhead,
 * leading to N × overhead instead of 1 × overhead for N tools.
 * We subtract this overhead from per-tool counts to show accurate tool content sizes.
 */
exports.TOOL_TOKEN_COUNT_OVERHEAD = 500;
function countTokensWithFallback(messages, tools) {
    return __awaiter(this, void 0, void 0, function () {
        var result, err_1, fallbackResult, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, tokenEstimation_js_1.countMessagesTokensWithAPI)(messages, tools)];
                case 1:
                    result = _a.sent();
                    if (result !== null) {
                        return [2 /*return*/, result];
                    }
                    (0, debug_js_1.logForDebugging)("countTokensWithFallback: API returned null, trying haiku fallback (".concat(tools.length, " tools)"));
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _a.sent();
                    (0, debug_js_1.logForDebugging)("countTokensWithFallback: API failed: ".concat((0, errors_js_1.errorMessage)(err_1)));
                    (0, log_js_1.logError)(err_1);
                    return [3 /*break*/, 3];
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, (0, tokenEstimation_js_1.countTokensViaHaikuFallback)(messages, tools)];
                case 4:
                    fallbackResult = _a.sent();
                    if (fallbackResult === null) {
                        (0, debug_js_1.logForDebugging)("countTokensWithFallback: haiku fallback also returned null (".concat(tools.length, " tools)"));
                    }
                    return [2 /*return*/, fallbackResult];
                case 5:
                    err_2 = _a.sent();
                    (0, debug_js_1.logForDebugging)("countTokensWithFallback: haiku fallback failed: ".concat((0, errors_js_1.errorMessage)(err_2)));
                    (0, log_js_1.logError)(err_2);
                    return [2 /*return*/, null];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function countToolDefinitionTokens(tools, getToolPermissionContext, agentInfo, model) {
    return __awaiter(this, void 0, void 0, function () {
        var toolSchemas, result, toolNames;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all(tools.map(function (tool) {
                        var _a;
                        return (0, api_js_1.toolToAPISchema)(tool, {
                            getToolPermissionContext: getToolPermissionContext,
                            tools: tools,
                            agents: (_a = agentInfo === null || agentInfo === void 0 ? void 0 : agentInfo.activeAgents) !== null && _a !== void 0 ? _a : [],
                            model: model,
                        });
                    }))];
                case 1:
                    toolSchemas = _a.sent();
                    return [4 /*yield*/, countTokensWithFallback([], toolSchemas)];
                case 2:
                    result = _a.sent();
                    if (result === null || result === 0) {
                        toolNames = tools.map(function (t) { return t.name; }).join(', ');
                        (0, debug_js_1.logForDebugging)("countToolDefinitionTokens returned ".concat(result, " for ").concat(tools.length, " tools: ").concat(toolNames.slice(0, 100)).concat(toolNames.length > 100 ? '...' : ''));
                    }
                    return [2 /*return*/, result !== null && result !== void 0 ? result : 0];
            }
        });
    });
}
/** Extract a human-readable name from a system prompt section's content */
function extractSectionName(content) {
    var _a;
    // Try to find first markdown heading
    var headingMatch = content.match(/^#+\s+(.+)$/m);
    if (headingMatch) {
        return headingMatch[1].trim();
    }
    // Fall back to a truncated preview of the first non-empty line
    var firstLine = (_a = content.split('\n').find(function (l) { return l.trim().length > 0; })) !== null && _a !== void 0 ? _a : '';
    return firstLine.length > 40 ? firstLine.slice(0, 40) + '…' : firstLine;
}
function countSystemTokens(effectiveSystemPrompt) {
    return __awaiter(this, void 0, void 0, function () {
        var systemContext, namedEntries, systemTokenCounts, systemPromptSections, systemPromptTokens;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, context_js_1.getSystemContext)()
                    // Build named entries: system prompt parts + system context values
                    // Skip empty strings and the global-cache boundary marker
                ];
                case 1:
                    systemContext = _a.sent();
                    namedEntries = __spreadArray(__spreadArray([], effectiveSystemPrompt
                        .filter(function (content) {
                        return content.length > 0 && content !== prompts_js_1.SYSTEM_PROMPT_DYNAMIC_BOUNDARY;
                    })
                        .map(function (content) { return ({ name: extractSectionName(content), content: content }); }), true), Object.entries(systemContext)
                        .filter(function (_a) {
                        var content = _a[1];
                        return content.length > 0;
                    })
                        .map(function (_a) {
                        var name = _a[0], content = _a[1];
                        return ({ name: name, content: content });
                    }), true);
                    if (namedEntries.length < 1) {
                        return [2 /*return*/, { systemPromptTokens: 0, systemPromptSections: [] }];
                    }
                    return [4 /*yield*/, Promise.all(namedEntries.map(function (_a) {
                            var content = _a.content;
                            return countTokensWithFallback([{ role: 'user', content: content }], []);
                        }))];
                case 2:
                    systemTokenCounts = _a.sent();
                    systemPromptSections = namedEntries.map(function (entry, i) { return ({
                        name: entry.name,
                        tokens: systemTokenCounts[i] || 0,
                    }); });
                    systemPromptTokens = systemTokenCounts.reduce(function (sum, tokens) { return sum + (tokens || 0); }, 0);
                    return [2 /*return*/, { systemPromptTokens: systemPromptTokens, systemPromptSections: systemPromptSections }];
            }
        });
    });
}
function countMemoryFileTokens() {
    return __awaiter(this, void 0, void 0, function () {
        var memoryFilesData, _a, memoryFileDetails, claudeMdTokens, claudeMdTokenCounts, _i, claudeMdTokenCounts_1, _b, file, tokens;
        var _this = this;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    // Simple mode disables CLAUDE.md loading, so don't report tokens for them
                    if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_SIMPLE)) {
                        return [2 /*return*/, { memoryFileDetails: [], claudeMdTokens: 0 }];
                    }
                    _a = claudemd_js_1.filterInjectedMemoryFiles;
                    return [4 /*yield*/, (0, claudemd_js_1.getMemoryFiles)()];
                case 1:
                    memoryFilesData = _a.apply(void 0, [_c.sent()]);
                    memoryFileDetails = [];
                    claudeMdTokens = 0;
                    if (memoryFilesData.length < 1) {
                        return [2 /*return*/, {
                                memoryFileDetails: [],
                                claudeMdTokens: 0,
                            }];
                    }
                    return [4 /*yield*/, Promise.all(memoryFilesData.map(function (file) { return __awaiter(_this, void 0, void 0, function () {
                            var tokens;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, countTokensWithFallback([{ role: 'user', content: file.content }], [])];
                                    case 1:
                                        tokens = _a.sent();
                                        return [2 /*return*/, { file: file, tokens: tokens || 0 }];
                                }
                            });
                        }); }))];
                case 2:
                    claudeMdTokenCounts = _c.sent();
                    for (_i = 0, claudeMdTokenCounts_1 = claudeMdTokenCounts; _i < claudeMdTokenCounts_1.length; _i++) {
                        _b = claudeMdTokenCounts_1[_i], file = _b.file, tokens = _b.tokens;
                        claudeMdTokens += tokens;
                        memoryFileDetails.push({
                            path: file.path,
                            type: file.type,
                            tokens: tokens,
                        });
                    }
                    return [2 /*return*/, { claudeMdTokens: claudeMdTokens, memoryFileDetails: memoryFileDetails }];
            }
        });
    });
}
function countBuiltInToolTokens(tools, getToolPermissionContext, agentInfo, model, messages) {
    return __awaiter(this, void 0, void 0, function () {
        var builtInTools, isToolSearchEnabled, isDeferredTool, isDeferred, alwaysLoadedTools, deferredBuiltinTools, alwaysLoadedTokens, _a, systemToolDetails, toolsForBreakdown, estimates_1, estimateTotal_1, distributable_1, deferredBuiltinDetails, loadedDeferredTokens, totalDeferredTokens, loadedToolNames, deferredToolNameSet, _i, messages_1, msg, _b, _c, block, tokensByTool, _d, _e, _f, i, tool, tokens, isLoaded, deferredTokens;
        var _g;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    builtInTools = tools.filter(function (tool) { return !tool.isMcp; });
                    if (builtInTools.length < 1) {
                        return [2 /*return*/, {
                                builtInToolTokens: 0,
                                deferredBuiltinDetails: [],
                                deferredBuiltinTokens: 0,
                                systemToolDetails: [],
                            }];
                    }
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./toolSearch.js'); })];
                case 1:
                    isToolSearchEnabled = (_h.sent()).isToolSearchEnabled;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../tools/ToolSearchTool/prompt.js'); })];
                case 2:
                    isDeferredTool = (_h.sent()).isDeferredTool;
                    return [4 /*yield*/, isToolSearchEnabled(model !== null && model !== void 0 ? model : '', tools, getToolPermissionContext, (_g = agentInfo === null || agentInfo === void 0 ? void 0 : agentInfo.activeAgents) !== null && _g !== void 0 ? _g : [], 'analyzeBuiltIn')
                        // Separate always-loaded and deferred builtin tools using dynamic isDeferredTool check
                    ];
                case 3:
                    isDeferred = _h.sent();
                    alwaysLoadedTools = builtInTools.filter(function (t) { return !isDeferredTool(t); });
                    deferredBuiltinTools = builtInTools.filter(function (t) { return isDeferredTool(t); });
                    if (!(alwaysLoadedTools.length > 0)) return [3 /*break*/, 5];
                    return [4 /*yield*/, countToolDefinitionTokens(alwaysLoadedTools, getToolPermissionContext, agentInfo, model)];
                case 4:
                    _a = _h.sent();
                    return [3 /*break*/, 6];
                case 5:
                    _a = 0;
                    _h.label = 6;
                case 6:
                    alwaysLoadedTokens = _a;
                    systemToolDetails = [];
                    if (process.env.USER_TYPE === 'ant') {
                        toolsForBreakdown = alwaysLoadedTools.filter(function (t) { return !(0, Tool_js_1.toolMatchesName)(t, constants_js_1.SKILL_TOOL_NAME); });
                        if (toolsForBreakdown.length > 0) {
                            estimates_1 = toolsForBreakdown.map(function (t) { var _a; return (0, tokenEstimation_js_1.roughTokenCountEstimation)((0, slowOperations_js_1.jsonStringify)((_a = t.inputSchema) !== null && _a !== void 0 ? _a : {})); });
                            estimateTotal_1 = estimates_1.reduce(function (s, e) { return s + e; }, 0) || 1;
                            distributable_1 = Math.max(0, alwaysLoadedTokens - exports.TOOL_TOKEN_COUNT_OVERHEAD);
                            systemToolDetails = toolsForBreakdown
                                .map(function (t, i) { return ({
                                name: t.name,
                                tokens: Math.round((estimates_1[i] / estimateTotal_1) * distributable_1),
                            }); })
                                .sort(function (a, b) { return b.tokens - a.tokens; });
                        }
                    }
                    deferredBuiltinDetails = [];
                    loadedDeferredTokens = 0;
                    totalDeferredTokens = 0;
                    if (!(deferredBuiltinTools.length > 0 && isDeferred)) return [3 /*break*/, 8];
                    loadedToolNames = new Set();
                    if (messages) {
                        deferredToolNameSet = new Set(deferredBuiltinTools.map(function (t) { return t.name; }));
                        for (_i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
                            msg = messages_1[_i];
                            if (msg.type === 'assistant') {
                                for (_b = 0, _c = msg.message.content; _b < _c.length; _b++) {
                                    block = _c[_b];
                                    if ('type' in block &&
                                        block.type === 'tool_use' &&
                                        'name' in block &&
                                        typeof block.name === 'string' &&
                                        deferredToolNameSet.has(block.name)) {
                                        loadedToolNames.add(block.name);
                                    }
                                }
                            }
                        }
                    }
                    return [4 /*yield*/, Promise.all(deferredBuiltinTools.map(function (t) {
                            return countToolDefinitionTokens([t], getToolPermissionContext, agentInfo, model);
                        }))];
                case 7:
                    tokensByTool = _h.sent();
                    for (_d = 0, _e = deferredBuiltinTools.entries(); _d < _e.length; _d++) {
                        _f = _e[_d], i = _f[0], tool = _f[1];
                        tokens = Math.max(0, (tokensByTool[i] || 0) - exports.TOOL_TOKEN_COUNT_OVERHEAD);
                        isLoaded = loadedToolNames.has(tool.name);
                        deferredBuiltinDetails.push({
                            name: tool.name,
                            tokens: tokens,
                            isLoaded: isLoaded,
                        });
                        totalDeferredTokens += tokens;
                        if (isLoaded) {
                            loadedDeferredTokens += tokens;
                        }
                    }
                    return [3 /*break*/, 10];
                case 8:
                    if (!(deferredBuiltinTools.length > 0)) return [3 /*break*/, 10];
                    return [4 /*yield*/, countToolDefinitionTokens(deferredBuiltinTools, getToolPermissionContext, agentInfo, model)];
                case 9:
                    deferredTokens = _h.sent();
                    return [2 /*return*/, {
                            builtInToolTokens: alwaysLoadedTokens + deferredTokens,
                            deferredBuiltinDetails: [],
                            deferredBuiltinTokens: 0,
                            systemToolDetails: systemToolDetails,
                        }];
                case 10: return [2 /*return*/, {
                        // When deferred, only count always-loaded tools + any loaded deferred tools
                        builtInToolTokens: alwaysLoadedTokens + loadedDeferredTokens,
                        deferredBuiltinDetails: deferredBuiltinDetails,
                        deferredBuiltinTokens: totalDeferredTokens - loadedDeferredTokens,
                        systemToolDetails: systemToolDetails,
                    }];
            }
        });
    });
}
function findSkillTool(tools) {
    return (0, Tool_js_1.findToolByName)(tools, constants_js_1.SKILL_TOOL_NAME);
}
function countSlashCommandTokens(tools, getToolPermissionContext, agentInfo) {
    return __awaiter(this, void 0, void 0, function () {
        var info, slashCommandTool, slashCommandTokens;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, prompt_js_1.getSkillToolInfo)((0, cwd_js_1.getCwd)())];
                case 1:
                    info = _a.sent();
                    slashCommandTool = findSkillTool(tools);
                    if (!slashCommandTool) {
                        return [2 /*return*/, {
                                slashCommandTokens: 0,
                                commandInfo: { totalCommands: 0, includedCommands: 0 },
                            }];
                    }
                    return [4 /*yield*/, countToolDefinitionTokens([slashCommandTool], getToolPermissionContext, agentInfo)];
                case 2:
                    slashCommandTokens = _a.sent();
                    return [2 /*return*/, {
                            slashCommandTokens: slashCommandTokens,
                            commandInfo: {
                                totalCommands: info.totalCommands,
                                includedCommands: info.includedCommands,
                            },
                        }];
            }
        });
    });
}
function countSkillTokens(tools, getToolPermissionContext, agentInfo) {
    return __awaiter(this, void 0, void 0, function () {
        var skills, slashCommandTool, skillTokens, skillFrontmatter, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, (0, prompt_js_1.getLimitedSkillToolCommands)((0, cwd_js_1.getCwd)())];
                case 1:
                    skills = _a.sent();
                    slashCommandTool = findSkillTool(tools);
                    if (!slashCommandTool) {
                        return [2 /*return*/, {
                                skillTokens: 0,
                                skillInfo: { totalSkills: 0, includedSkills: 0, skillFrontmatter: [] },
                            }];
                    }
                    return [4 /*yield*/, countToolDefinitionTokens([slashCommandTool], getToolPermissionContext, agentInfo)
                        // Calculate per-skill token estimates based on frontmatter only
                        // (name, description, whenToUse) since full content is only loaded on invocation
                    ];
                case 2:
                    skillTokens = _a.sent();
                    skillFrontmatter = skills.map(function (skill) { return ({
                        name: (0, commands_js_1.getCommandName)(skill),
                        source: (skill.type === 'prompt' ? skill.source : 'plugin'),
                        tokens: (0, loadSkillsDir_js_1.estimateSkillFrontmatterTokens)(skill),
                    }); });
                    return [2 /*return*/, {
                            skillTokens: skillTokens,
                            skillInfo: {
                                totalSkills: skills.length,
                                includedSkills: skills.length,
                                skillFrontmatter: skillFrontmatter,
                            },
                        }];
                case 3:
                    error_1 = _a.sent();
                    (0, log_js_1.logError)((0, errors_js_1.toError)(error_1));
                    // Return zero values rather than failing the entire context analysis
                    return [2 /*return*/, {
                            skillTokens: 0,
                            skillInfo: { totalSkills: 0, includedSkills: 0, skillFrontmatter: [] },
                        }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function countMcpToolTokens(tools, getToolPermissionContext, agentInfo, model, messages) {
    return __awaiter(this, void 0, void 0, function () {
        var mcpTools, mcpToolDetails, totalTokensRaw, totalTokens, estimates, estimateTotal, mcpToolTokensByTool, isToolSearchEnabled, isDeferredTool, isDeferred, loadedMcpToolNames, mcpToolNameSet, _i, messages_2, msg, _a, _b, block, _c, _d, _e, i, tool, loadedTokens, deferredTokens, _f, mcpToolDetails_1, detail;
        var _this = this;
        var _g;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    mcpTools = tools.filter(function (tool) { return tool.isMcp; });
                    mcpToolDetails = [];
                    return [4 /*yield*/, countToolDefinitionTokens(mcpTools, getToolPermissionContext, agentInfo, model)
                        // Subtract the single overhead since we made one bulk call
                    ];
                case 1:
                    totalTokensRaw = _h.sent();
                    totalTokens = Math.max(0, (totalTokensRaw || 0) - exports.TOOL_TOKEN_COUNT_OVERHEAD);
                    return [4 /*yield*/, Promise.all(mcpTools.map(function (t) { return __awaiter(_this, void 0, void 0, function () {
                            var _a, _b;
                            var _c;
                            var _d, _e;
                            return __generator(this, function (_f) {
                                switch (_f.label) {
                                    case 0:
                                        _a = tokenEstimation_js_1.roughTokenCountEstimation;
                                        _b = slowOperations_js_1.jsonStringify;
                                        _c = {
                                            name: t.name
                                        };
                                        return [4 /*yield*/, t.prompt({
                                                getToolPermissionContext: getToolPermissionContext,
                                                tools: tools,
                                                agents: (_d = agentInfo === null || agentInfo === void 0 ? void 0 : agentInfo.activeAgents) !== null && _d !== void 0 ? _d : [],
                                            })];
                                    case 1: return [2 /*return*/, _a.apply(void 0, [_b.apply(void 0, [(_c.description = _f.sent(),
                                                    _c.input_schema = (_e = t.inputJSONSchema) !== null && _e !== void 0 ? _e : {},
                                                    _c)])])];
                                }
                            });
                        }); }))];
                case 2:
                    estimates = _h.sent();
                    estimateTotal = estimates.reduce(function (s, e) { return s + e; }, 0) || 1;
                    mcpToolTokensByTool = estimates.map(function (e) {
                        return Math.round((e / estimateTotal) * totalTokens);
                    });
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./toolSearch.js'); })];
                case 3:
                    isToolSearchEnabled = (_h.sent()).isToolSearchEnabled;
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('../tools/ToolSearchTool/prompt.js'); })];
                case 4:
                    isDeferredTool = (_h.sent()).isDeferredTool;
                    return [4 /*yield*/, isToolSearchEnabled(model, tools, getToolPermissionContext, (_g = agentInfo === null || agentInfo === void 0 ? void 0 : agentInfo.activeAgents) !== null && _g !== void 0 ? _g : [], 'analyzeMcp')
                        // Find MCP tools that have been used in messages (loaded via ToolSearchTool)
                    ];
                case 5:
                    isDeferred = _h.sent();
                    loadedMcpToolNames = new Set();
                    if (isDeferred && messages) {
                        mcpToolNameSet = new Set(mcpTools.map(function (t) { return t.name; }));
                        for (_i = 0, messages_2 = messages; _i < messages_2.length; _i++) {
                            msg = messages_2[_i];
                            if (msg.type === 'assistant') {
                                for (_a = 0, _b = msg.message.content; _a < _b.length; _a++) {
                                    block = _b[_a];
                                    if ('type' in block &&
                                        block.type === 'tool_use' &&
                                        'name' in block &&
                                        typeof block.name === 'string' &&
                                        mcpToolNameSet.has(block.name)) {
                                        loadedMcpToolNames.add(block.name);
                                    }
                                }
                            }
                        }
                    }
                    // Build tool details with isLoaded flag
                    for (_c = 0, _d = mcpTools.entries(); _c < _d.length; _c++) {
                        _e = _d[_c], i = _e[0], tool = _e[1];
                        mcpToolDetails.push({
                            name: tool.name,
                            serverName: tool.name.split('__')[1] || 'unknown',
                            tokens: mcpToolTokensByTool[i],
                            isLoaded: loadedMcpToolNames.has(tool.name) || !isDeferredTool(tool),
                        });
                    }
                    loadedTokens = 0;
                    deferredTokens = 0;
                    for (_f = 0, mcpToolDetails_1 = mcpToolDetails; _f < mcpToolDetails_1.length; _f++) {
                        detail = mcpToolDetails_1[_f];
                        if (detail.isLoaded) {
                            loadedTokens += detail.tokens;
                        }
                        else if (isDeferred) {
                            deferredTokens += detail.tokens;
                        }
                    }
                    return [2 /*return*/, {
                            // When deferred but some tools are loaded, count loaded tokens
                            mcpToolTokens: isDeferred ? loadedTokens : totalTokens,
                            mcpToolDetails: mcpToolDetails,
                            // Track deferred tokens separately for display
                            deferredToolTokens: deferredTokens,
                            loadedMcpToolNames: loadedMcpToolNames,
                        }];
            }
        });
    });
}
function countCustomAgentTokens(agentDefinitions) {
    return __awaiter(this, void 0, void 0, function () {
        var customAgents, agentDetails, agentTokens, tokenCounts, _i, _a, _b, i, agent, tokens;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    customAgents = agentDefinitions.activeAgents.filter(function (a) { return a.source !== 'built-in'; });
                    agentDetails = [];
                    agentTokens = 0;
                    return [4 /*yield*/, Promise.all(customAgents.map(function (agent) {
                            return countTokensWithFallback([
                                {
                                    role: 'user',
                                    content: [agent.agentType, agent.whenToUse].join(' '),
                                },
                            ], []);
                        }))];
                case 1:
                    tokenCounts = _c.sent();
                    for (_i = 0, _a = customAgents.entries(); _i < _a.length; _i++) {
                        _b = _a[_i], i = _b[0], agent = _b[1];
                        tokens = tokenCounts[i] || 0;
                        agentTokens += tokens || 0;
                        agentDetails.push({
                            agentType: agent.agentType,
                            source: agent.source,
                            tokens: tokens || 0,
                        });
                    }
                    return [2 /*return*/, { agentTokens: agentTokens, agentDetails: agentDetails }];
            }
        });
    });
}
function processAssistantMessage(msg, breakdown) {
    // Process each content block individually
    for (var _i = 0, _a = msg.message.content; _i < _a.length; _i++) {
        var block = _a[_i];
        var blockStr = (0, slowOperations_js_1.jsonStringify)(block);
        var blockTokens = (0, tokenEstimation_js_1.roughTokenCountEstimation)(blockStr);
        if ('type' in block && block.type === 'tool_use') {
            breakdown.toolCallTokens += blockTokens;
            var toolName = ('name' in block ? block.name : undefined) || 'unknown';
            breakdown.toolCallsByType.set(toolName, (breakdown.toolCallsByType.get(toolName) || 0) + blockTokens);
        }
        else {
            // Text blocks or other non-tool content
            breakdown.assistantMessageTokens += blockTokens;
        }
    }
}
function processUserMessage(msg, breakdown, toolUseIdToName) {
    // Handle both string and array content
    if (typeof msg.message.content === 'string') {
        // Simple string content
        var tokens = (0, tokenEstimation_js_1.roughTokenCountEstimation)(msg.message.content);
        breakdown.userMessageTokens += tokens;
        return;
    }
    // Process each content block individually
    for (var _i = 0, _a = msg.message.content; _i < _a.length; _i++) {
        var block = _a[_i];
        var blockStr = (0, slowOperations_js_1.jsonStringify)(block);
        var blockTokens = (0, tokenEstimation_js_1.roughTokenCountEstimation)(blockStr);
        if ('type' in block && block.type === 'tool_result') {
            breakdown.toolResultTokens += blockTokens;
            var toolUseId = 'tool_use_id' in block ? block.tool_use_id : undefined;
            var toolName = (toolUseId ? toolUseIdToName.get(toolUseId) : undefined) || 'unknown';
            breakdown.toolResultsByType.set(toolName, (breakdown.toolResultsByType.get(toolName) || 0) + blockTokens);
        }
        else {
            // Text blocks or other non-tool content
            breakdown.userMessageTokens += blockTokens;
        }
    }
}
function processAttachment(msg, breakdown) {
    var contentStr = (0, slowOperations_js_1.jsonStringify)(msg.attachment);
    var tokens = (0, tokenEstimation_js_1.roughTokenCountEstimation)(contentStr);
    breakdown.attachmentTokens += tokens;
    var attachType = msg.attachment.type || 'unknown';
    breakdown.attachmentsByType.set(attachType, (breakdown.attachmentsByType.get(attachType) || 0) + tokens);
}
function approximateMessageTokens(messages) {
    return __awaiter(this, void 0, void 0, function () {
        var microcompactResult, breakdown, toolUseIdToName, _i, _a, msg, _b, _c, block, toolUseId, toolName, _d, _e, msg, approximateMessageTokens;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0: return [4 /*yield*/, (0, microCompact_js_1.microcompactMessages)(messages)
                    // Initialize tracking
                ];
                case 1:
                    microcompactResult = _f.sent();
                    breakdown = {
                        totalTokens: 0,
                        toolCallTokens: 0,
                        toolResultTokens: 0,
                        attachmentTokens: 0,
                        assistantMessageTokens: 0,
                        userMessageTokens: 0,
                        toolCallsByType: new Map(),
                        toolResultsByType: new Map(),
                        attachmentsByType: new Map(),
                    };
                    toolUseIdToName = new Map();
                    for (_i = 0, _a = microcompactResult.messages; _i < _a.length; _i++) {
                        msg = _a[_i];
                        if (msg.type === 'assistant') {
                            for (_b = 0, _c = msg.message.content; _b < _c.length; _b++) {
                                block = _c[_b];
                                if ('type' in block && block.type === 'tool_use') {
                                    toolUseId = 'id' in block ? block.id : undefined;
                                    toolName = ('name' in block ? block.name : undefined) || 'unknown';
                                    if (toolUseId) {
                                        toolUseIdToName.set(toolUseId, toolName);
                                    }
                                }
                            }
                        }
                    }
                    // Process each message for detailed breakdown
                    for (_d = 0, _e = microcompactResult.messages; _d < _e.length; _d++) {
                        msg = _e[_d];
                        if (msg.type === 'assistant') {
                            processAssistantMessage(msg, breakdown);
                        }
                        else if (msg.type === 'user') {
                            processUserMessage(msg, breakdown, toolUseIdToName);
                        }
                        else if (msg.type === 'attachment') {
                            processAttachment(msg, breakdown);
                        }
                    }
                    return [4 /*yield*/, countTokensWithFallback((0, messages_js_1.normalizeMessagesForAPI)(microcompactResult.messages).map(function (_) {
                            if (_.type === 'assistant') {
                                return {
                                    // Important: strip out fields like id, etc. -- the counting API errors if they're present
                                    role: 'assistant',
                                    content: _.message.content,
                                };
                            }
                            return _.message;
                        }), [])];
                case 2:
                    approximateMessageTokens = _f.sent();
                    breakdown.totalTokens = approximateMessageTokens !== null && approximateMessageTokens !== void 0 ? approximateMessageTokens : 0;
                    return [2 /*return*/, breakdown];
            }
        });
    });
}
function analyzeContextUsage(messages, model, getToolPermissionContext, tools, agentDefinitions, terminalWidth, toolUseContext, mainThreadAgentDefinition, 
/** Original messages before microcompact, used to extract API usage */
originalMessages) {
    return __awaiter(this, void 0, void 0, function () {
        // Helper function to create grid squares for a category
        function createCategorySquares(category) {
            var squares = [];
            var exactSquares = (category.tokens / contextWindow) * TOTAL_SQUARES;
            var wholeSquares = Math.floor(exactSquares);
            var fractionalPart = exactSquares - wholeSquares;
            for (var i = 0; i < category.squares; i++) {
                // Determine fullness: full squares get 1.0, partial square gets fractional amount
                var squareFullness = 1.0;
                if (i === wholeSquares && fractionalPart > 0) {
                    // This is the partial square
                    squareFullness = fractionalPart;
                }
                squares.push({
                    color: category.color,
                    isFilled: true,
                    categoryName: category.name,
                    tokens: category.tokens,
                    percentage: category.percentageOfTotal,
                    squareFullness: squareFullness,
                });
            }
            return squares;
        }
        var runtimeModel, _a, contextWindow, defaultSystemPrompt, effectiveSystemPrompt, _b, _c, systemPromptTokens, systemPromptSections, _d, claudeMdTokens, memoryFileDetails, _e, builtInToolTokens, deferredBuiltinDetails, deferredBuiltinTokens, systemToolDetails, _f, mcpToolTokens, mcpToolDetails, deferredToolTokens, _g, agentTokens, agentDetails, _h, slashCommandTokens, commandInfo, messageBreakdown, skillResult, skillInfo, skillFrontmatterTokens, messageTokens, isAutoCompact, autoCompactThreshold, cats, systemToolsTokens, actualUsage, reservedTokens, skipReservedBuffer, isContextCollapseEnabled, freeTokens, totalIncludingReserved, apiUsage, totalFromAPI, finalTotalTokens, isNarrowScreen, GRID_WIDTH, GRID_HEIGHT, TOTAL_SQUARES, nonDeferredCats, categorySquares, gridSquares, reservedCategory, nonReservedCategories, _i, nonReservedCategories_1, cat, squares, _j, squares_1, square, reservedSquareCount, freeSpaceCat, freeSpaceTarget, squares, _k, squares_2, square, gridRows, i, toolsMap, _l, _m, _o, name_1, tokens, existing, _p, _q, _r, name_2, tokens, existing, toolsByTypeArray, attachmentsByTypeArray, formattedMessageBreakdown;
        var _s;
        return __generator(this, function (_t) {
            switch (_t.label) {
                case 0:
                    _a = model_js_1.getRuntimeMainLoopModel;
                    _s = {};
                    return [4 /*yield*/, getToolPermissionContext()];
                case 1:
                    runtimeModel = _a.apply(void 0, [(_s.permissionMode = (_t.sent()).mode,
                            _s.mainLoopModel = model,
                            _s)]);
                    contextWindow = (0, context_js_2.getContextWindowForModel)(runtimeModel, (0, state_js_1.getSdkBetas)());
                    return [4 /*yield*/, (0, prompts_js_1.getSystemPrompt)(tools, runtimeModel)];
                case 2:
                    defaultSystemPrompt = _t.sent();
                    effectiveSystemPrompt = (0, systemPrompt_js_1.buildEffectiveSystemPrompt)({
                        mainThreadAgentDefinition: mainThreadAgentDefinition,
                        toolUseContext: toolUseContext !== null && toolUseContext !== void 0 ? toolUseContext : {
                            options: {},
                        },
                        customSystemPrompt: toolUseContext === null || toolUseContext === void 0 ? void 0 : toolUseContext.options.customSystemPrompt,
                        defaultSystemPrompt: defaultSystemPrompt,
                        appendSystemPrompt: toolUseContext === null || toolUseContext === void 0 ? void 0 : toolUseContext.options.appendSystemPrompt,
                    });
                    return [4 /*yield*/, Promise.all([
                            countSystemTokens(effectiveSystemPrompt),
                            countMemoryFileTokens(),
                            countBuiltInToolTokens(tools, getToolPermissionContext, agentDefinitions, runtimeModel, messages),
                            countMcpToolTokens(tools, getToolPermissionContext, agentDefinitions, runtimeModel, messages),
                            countCustomAgentTokens(agentDefinitions),
                            countSlashCommandTokens(tools, getToolPermissionContext, agentDefinitions),
                            approximateMessageTokens(messages),
                        ])
                        // Count skills separately with error isolation
                    ];
                case 3:
                    _b = _t.sent(), _c = _b[0], systemPromptTokens = _c.systemPromptTokens, systemPromptSections = _c.systemPromptSections, _d = _b[1], claudeMdTokens = _d.claudeMdTokens, memoryFileDetails = _d.memoryFileDetails, _e = _b[2], builtInToolTokens = _e.builtInToolTokens, deferredBuiltinDetails = _e.deferredBuiltinDetails, deferredBuiltinTokens = _e.deferredBuiltinTokens, systemToolDetails = _e.systemToolDetails, _f = _b[3], mcpToolTokens = _f.mcpToolTokens, mcpToolDetails = _f.mcpToolDetails, deferredToolTokens = _f.deferredToolTokens, _g = _b[4], agentTokens = _g.agentTokens, agentDetails = _g.agentDetails, _h = _b[5], slashCommandTokens = _h.slashCommandTokens, commandInfo = _h.commandInfo, messageBreakdown = _b[6];
                    return [4 /*yield*/, countSkillTokens(tools, getToolPermissionContext, agentDefinitions)];
                case 4:
                    skillResult = _t.sent();
                    skillInfo = skillResult.skillInfo;
                    skillFrontmatterTokens = skillInfo.skillFrontmatter.reduce(function (sum, skill) { return sum + skill.tokens; }, 0);
                    messageTokens = messageBreakdown.totalTokens;
                    isAutoCompact = (0, autoCompact_js_1.isAutoCompactEnabled)();
                    autoCompactThreshold = isAutoCompact
                        ? (0, autoCompact_js_1.getEffectiveContextWindowSize)(model) - autoCompact_js_1.AUTOCOMPACT_BUFFER_TOKENS
                        : undefined;
                    cats = [];
                    // System prompt is always shown first (fixed overhead)
                    if (systemPromptTokens > 0) {
                        cats.push({
                            name: 'System prompt',
                            tokens: systemPromptTokens,
                            color: 'promptBorder',
                        });
                    }
                    systemToolsTokens = builtInToolTokens - skillFrontmatterTokens;
                    if (systemToolsTokens > 0) {
                        cats.push({
                            name: process.env.USER_TYPE === 'ant'
                                ? '[ANT-ONLY] System tools'
                                : 'System tools',
                            tokens: systemToolsTokens,
                            color: 'inactive',
                        });
                    }
                    // MCP tools after system tools
                    if (mcpToolTokens > 0) {
                        cats.push({
                            name: 'MCP tools',
                            tokens: mcpToolTokens,
                            color: 'cyan_FOR_SUBAGENTS_ONLY',
                        });
                    }
                    // Show deferred MCP tools (when tool search is enabled)
                    // These don't count toward context usage but we show them for visibility
                    if (deferredToolTokens > 0) {
                        cats.push({
                            name: 'MCP tools (deferred)',
                            tokens: deferredToolTokens,
                            color: 'inactive',
                            isDeferred: true,
                        });
                    }
                    // Show deferred builtin tools (when tool search is enabled)
                    if (deferredBuiltinTokens > 0) {
                        cats.push({
                            name: 'System tools (deferred)',
                            tokens: deferredBuiltinTokens,
                            color: 'inactive',
                            isDeferred: true,
                        });
                    }
                    // Custom agents after MCP tools
                    if (agentTokens > 0) {
                        cats.push({
                            name: 'Custom agents',
                            tokens: agentTokens,
                            color: 'permission',
                        });
                    }
                    // Memory files after custom agents
                    if (claudeMdTokens > 0) {
                        cats.push({
                            name: 'Memory files',
                            tokens: claudeMdTokens,
                            color: 'claude',
                        });
                    }
                    // Skills after memory files
                    if (skillFrontmatterTokens > 0) {
                        cats.push({
                            name: 'Skills',
                            tokens: skillFrontmatterTokens,
                            color: 'warning',
                        });
                    }
                    if (messageTokens !== null && messageTokens > 0) {
                        cats.push({
                            name: 'Messages',
                            tokens: messageTokens,
                            color: 'purple_FOR_SUBAGENTS_ONLY',
                        });
                    }
                    actualUsage = cats.reduce(function (sum, cat) { return sum + (cat.isDeferred ? 0 : cat.tokens); }, 0);
                    reservedTokens = 0;
                    skipReservedBuffer = false;
                    if ((0, bun_bundle_1.feature)('REACTIVE_COMPACT')) {
                        if ((0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_cobalt_raccoon', false)) {
                            skipReservedBuffer = true;
                        }
                    }
                    if ((0, bun_bundle_1.feature)('CONTEXT_COLLAPSE')) {
                        isContextCollapseEnabled = require('../services/contextCollapse/index.js').isContextCollapseEnabled;
                        /* eslint-enable @typescript-eslint/no-require-imports */
                        if (isContextCollapseEnabled()) {
                            skipReservedBuffer = true;
                        }
                    }
                    if (skipReservedBuffer) {
                        // No buffer category pushed — reactive compaction is transparent and
                        // doesn't need a visible reservation in the grid.
                    }
                    else if (isAutoCompact && autoCompactThreshold !== undefined) {
                        // Autocompact buffer (from effective context)
                        reservedTokens = contextWindow - autoCompactThreshold;
                        cats.push({
                            name: RESERVED_CATEGORY_NAME,
                            tokens: reservedTokens,
                            color: 'inactive',
                        });
                    }
                    else if (!isAutoCompact) {
                        // Compact buffer reserve (3k from actual context limit)
                        reservedTokens = autoCompact_js_1.MANUAL_COMPACT_BUFFER_TOKENS;
                        cats.push({
                            name: MANUAL_COMPACT_BUFFER_NAME,
                            tokens: reservedTokens,
                            color: 'inactive',
                        });
                    }
                    freeTokens = Math.max(0, contextWindow - actualUsage - reservedTokens);
                    cats.push({
                        name: 'Free space',
                        tokens: freeTokens,
                        color: 'promptBorder',
                    });
                    totalIncludingReserved = actualUsage;
                    apiUsage = (0, tokens_js_1.getCurrentUsage)(originalMessages !== null && originalMessages !== void 0 ? originalMessages : messages);
                    totalFromAPI = apiUsage
                        ? apiUsage.input_tokens +
                            apiUsage.cache_creation_input_tokens +
                            apiUsage.cache_read_input_tokens
                        : null;
                    finalTotalTokens = totalFromAPI !== null && totalFromAPI !== void 0 ? totalFromAPI : totalIncludingReserved;
                    isNarrowScreen = terminalWidth && terminalWidth < 80;
                    GRID_WIDTH = contextWindow >= 1000000
                        ? isNarrowScreen
                            ? 5
                            : 20
                        : isNarrowScreen
                            ? 5
                            : 10;
                    GRID_HEIGHT = contextWindow >= 1000000 ? 10 : isNarrowScreen ? 5 : 10;
                    TOTAL_SQUARES = GRID_WIDTH * GRID_HEIGHT;
                    nonDeferredCats = cats.filter(function (cat) { return !cat.isDeferred; });
                    categorySquares = nonDeferredCats.map(function (cat) { return (__assign(__assign({}, cat), { squares: cat.name === 'Free space'
                            ? Math.round((cat.tokens / contextWindow) * TOTAL_SQUARES)
                            : Math.max(1, Math.round((cat.tokens / contextWindow) * TOTAL_SQUARES)), percentageOfTotal: Math.round((cat.tokens / contextWindow) * 100) })); });
                    gridSquares = [];
                    reservedCategory = categorySquares.find(function (cat) {
                        return cat.name === RESERVED_CATEGORY_NAME ||
                            cat.name === MANUAL_COMPACT_BUFFER_NAME;
                    });
                    nonReservedCategories = categorySquares.filter(function (cat) {
                        return cat.name !== RESERVED_CATEGORY_NAME &&
                            cat.name !== MANUAL_COMPACT_BUFFER_NAME &&
                            cat.name !== 'Free space';
                    });
                    // Add all non-reserved, non-free-space squares first
                    for (_i = 0, nonReservedCategories_1 = nonReservedCategories; _i < nonReservedCategories_1.length; _i++) {
                        cat = nonReservedCategories_1[_i];
                        squares = createCategorySquares(cat);
                        for (_j = 0, squares_1 = squares; _j < squares_1.length; _j++) {
                            square = squares_1[_j];
                            if (gridSquares.length < TOTAL_SQUARES) {
                                gridSquares.push(square);
                            }
                        }
                    }
                    reservedSquareCount = reservedCategory ? reservedCategory.squares : 0;
                    freeSpaceCat = cats.find(function (c) { return c.name === 'Free space'; });
                    freeSpaceTarget = TOTAL_SQUARES - reservedSquareCount;
                    while (gridSquares.length < freeSpaceTarget) {
                        gridSquares.push({
                            color: 'promptBorder',
                            isFilled: true,
                            categoryName: 'Free space',
                            tokens: (freeSpaceCat === null || freeSpaceCat === void 0 ? void 0 : freeSpaceCat.tokens) || 0,
                            percentage: freeSpaceCat
                                ? Math.round((freeSpaceCat.tokens / contextWindow) * 100)
                                : 0,
                            squareFullness: 1.0, // Free space is always "full"
                        });
                    }
                    // Add reserved squares at the end
                    if (reservedCategory) {
                        squares = createCategorySquares(reservedCategory);
                        for (_k = 0, squares_2 = squares; _k < squares_2.length; _k++) {
                            square = squares_2[_k];
                            if (gridSquares.length < TOTAL_SQUARES) {
                                gridSquares.push(square);
                            }
                        }
                    }
                    gridRows = [];
                    for (i = 0; i < GRID_HEIGHT; i++) {
                        gridRows.push(gridSquares.slice(i * GRID_WIDTH, (i + 1) * GRID_WIDTH));
                    }
                    toolsMap = new Map();
                    // Add call tokens
                    for (_l = 0, _m = messageBreakdown.toolCallsByType.entries(); _l < _m.length; _l++) {
                        _o = _m[_l], name_1 = _o[0], tokens = _o[1];
                        existing = toolsMap.get(name_1) || { callTokens: 0, resultTokens: 0 };
                        toolsMap.set(name_1, __assign(__assign({}, existing), { callTokens: tokens }));
                    }
                    // Add result tokens
                    for (_p = 0, _q = messageBreakdown.toolResultsByType.entries(); _p < _q.length; _p++) {
                        _r = _q[_p], name_2 = _r[0], tokens = _r[1];
                        existing = toolsMap.get(name_2) || { callTokens: 0, resultTokens: 0 };
                        toolsMap.set(name_2, __assign(__assign({}, existing), { resultTokens: tokens }));
                    }
                    toolsByTypeArray = Array.from(toolsMap.entries())
                        .map(function (_a) {
                        var name = _a[0], _b = _a[1], callTokens = _b.callTokens, resultTokens = _b.resultTokens;
                        return ({
                            name: name,
                            callTokens: callTokens,
                            resultTokens: resultTokens,
                        });
                    })
                        .sort(function (a, b) { return b.callTokens + b.resultTokens - (a.callTokens + a.resultTokens); });
                    attachmentsByTypeArray = Array.from(messageBreakdown.attachmentsByType.entries())
                        .map(function (_a) {
                        var name = _a[0], tokens = _a[1];
                        return ({ name: name, tokens: tokens });
                    })
                        .sort(function (a, b) { return b.tokens - a.tokens; });
                    formattedMessageBreakdown = {
                        toolCallTokens: messageBreakdown.toolCallTokens,
                        toolResultTokens: messageBreakdown.toolResultTokens,
                        attachmentTokens: messageBreakdown.attachmentTokens,
                        assistantMessageTokens: messageBreakdown.assistantMessageTokens,
                        userMessageTokens: messageBreakdown.userMessageTokens,
                        toolCallsByType: toolsByTypeArray,
                        attachmentsByType: attachmentsByTypeArray,
                    };
                    return [2 /*return*/, {
                            categories: cats,
                            totalTokens: finalTotalTokens,
                            maxTokens: contextWindow,
                            rawMaxTokens: contextWindow,
                            percentage: Math.round((finalTotalTokens / contextWindow) * 100),
                            gridRows: gridRows,
                            model: runtimeModel,
                            memoryFiles: memoryFileDetails,
                            mcpTools: mcpToolDetails,
                            deferredBuiltinTools: process.env.USER_TYPE === 'ant' ? deferredBuiltinDetails : undefined,
                            systemTools: process.env.USER_TYPE === 'ant' ? systemToolDetails : undefined,
                            systemPromptSections: process.env.USER_TYPE === 'ant' ? systemPromptSections : undefined,
                            agents: agentDetails,
                            slashCommands: slashCommandTokens > 0
                                ? {
                                    totalCommands: commandInfo.totalCommands,
                                    includedCommands: commandInfo.includedCommands,
                                    tokens: slashCommandTokens,
                                }
                                : undefined,
                            skills: skillFrontmatterTokens > 0
                                ? {
                                    totalSkills: skillInfo.totalSkills,
                                    includedSkills: skillInfo.includedSkills,
                                    tokens: skillFrontmatterTokens,
                                    skillFrontmatter: skillInfo.skillFrontmatter,
                                }
                                : undefined,
                            autoCompactThreshold: autoCompactThreshold,
                            isAutoCompactEnabled: isAutoCompact,
                            messageBreakdown: formattedMessageBreakdown,
                            apiUsage: apiUsage,
                        }];
            }
        });
    });
}
