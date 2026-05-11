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
exports.loadPluginAgents = void 0;
exports.clearPluginAgentCache = clearPluginAgentCache;
var memoize_js_1 = require("lodash-es/memoize.js");
var path_1 = require("path");
var paths_js_1 = require("../../memdir/paths.js");
var agentMemory_js_1 = require("../../tools/AgentTool/agentMemory.js");
var constants_js_1 = require("../../tools/FileEditTool/constants.js");
var prompt_js_1 = require("../../tools/FileReadTool/prompt.js");
var prompt_js_2 = require("../../tools/FileWriteTool/prompt.js");
var plugin_js_1 = require("../../types/plugin.js");
var debug_js_1 = require("../debug.js");
var effort_js_1 = require("../effort.js");
var frontmatterParser_js_1 = require("../frontmatterParser.js");
var fsOperations_js_1 = require("../fsOperations.js");
var markdownConfigLoader_js_1 = require("../markdownConfigLoader.js");
var pluginLoader_js_1 = require("./pluginLoader.js");
var pluginOptionsStorage_js_1 = require("./pluginOptionsStorage.js");
var walkPluginMarkdown_js_1 = require("./walkPluginMarkdown.js");
var VALID_MEMORY_SCOPES = ['user', 'project', 'local'];
function loadAgentsFromDirectory(agentsPath, pluginName, sourceName, pluginPath, pluginManifest, loadedPaths) {
    return __awaiter(this, void 0, void 0, function () {
        var agents;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    agents = [];
                    return [4 /*yield*/, (0, walkPluginMarkdown_js_1.walkPluginMarkdown)(agentsPath, function (fullPath, namespace) { return __awaiter(_this, void 0, void 0, function () {
                            var agent;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, loadAgentFromFile(fullPath, pluginName, namespace, sourceName, pluginPath, pluginManifest, loadedPaths)];
                                    case 1:
                                        agent = _a.sent();
                                        if (agent)
                                            agents.push(agent);
                                        return [2 /*return*/];
                                }
                            });
                        }); }, { logLabel: 'agents' })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, agents];
            }
        });
    });
}
function loadAgentFromFile(filePath, pluginName, namespace, sourceName, pluginPath, pluginManifest, loadedPaths) {
    return __awaiter(this, void 0, void 0, function () {
        var fs, content, _a, frontmatter, markdownContent, baseAgentName, nameParts, agentType_1, whenToUse, tools, skills, color, modelRaw, model, trimmed, backgroundRaw, background, systemPrompt_1, memoryRaw, memory_1, isolationRaw, isolation, effortRaw, effort, _i, _b, field, maxTurnsRaw, maxTurns, disallowedTools, toolSet, _c, _d, tool, error_1;
        var _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    if ((0, fsOperations_js_1.isDuplicatePath)(fs, filePath, loadedPaths)) {
                        return [2 /*return*/, null];
                    }
                    _g.label = 1;
                case 1:
                    _g.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fs.readFile(filePath, { encoding: 'utf-8' })];
                case 2:
                    content = _g.sent();
                    _a = (0, frontmatterParser_js_1.parseFrontmatter)(content, filePath), frontmatter = _a.frontmatter, markdownContent = _a.content;
                    baseAgentName = frontmatter.name || (0, path_1.basename)(filePath).replace(/\.md$/, '');
                    nameParts = __spreadArray(__spreadArray([pluginName], namespace, true), [baseAgentName], false);
                    agentType_1 = nameParts.join(':');
                    whenToUse = (_f = (_e = (0, frontmatterParser_js_1.coerceDescriptionToString)(frontmatter.description, agentType_1)) !== null && _e !== void 0 ? _e : (0, frontmatterParser_js_1.coerceDescriptionToString)(frontmatter['when-to-use'], agentType_1)) !== null && _f !== void 0 ? _f : "Agent from ".concat(pluginName, " plugin");
                    tools = (0, markdownConfigLoader_js_1.parseAgentToolsFromFrontmatter)(frontmatter.tools);
                    skills = (0, markdownConfigLoader_js_1.parseSlashCommandToolsFromFrontmatter)(frontmatter.skills);
                    color = frontmatter.color;
                    modelRaw = frontmatter.model;
                    model = void 0;
                    if (typeof modelRaw === 'string' && modelRaw.trim().length > 0) {
                        trimmed = modelRaw.trim();
                        model = trimmed.toLowerCase() === 'inherit' ? 'inherit' : trimmed;
                    }
                    backgroundRaw = frontmatter.background;
                    background = backgroundRaw === 'true' || backgroundRaw === true ? true : undefined;
                    systemPrompt_1 = (0, pluginOptionsStorage_js_1.substitutePluginVariables)(markdownContent.trim(), {
                        path: pluginPath,
                        source: sourceName,
                    });
                    if (pluginManifest.userConfig) {
                        systemPrompt_1 = (0, pluginOptionsStorage_js_1.substituteUserConfigInContent)(systemPrompt_1, (0, pluginOptionsStorage_js_1.loadPluginOptions)(sourceName), pluginManifest.userConfig);
                    }
                    memoryRaw = frontmatter.memory;
                    if (memoryRaw !== undefined) {
                        if (VALID_MEMORY_SCOPES.includes(memoryRaw)) {
                            memory_1 = memoryRaw;
                        }
                        else {
                            (0, debug_js_1.logForDebugging)("Plugin agent file ".concat(filePath, " has invalid memory value '").concat(memoryRaw, "'. Valid options: ").concat(VALID_MEMORY_SCOPES.join(', ')));
                        }
                    }
                    isolationRaw = frontmatter.isolation;
                    isolation = isolationRaw === 'worktree' ? 'worktree' : undefined;
                    effortRaw = frontmatter.effort;
                    effort = effortRaw !== undefined ? (0, effort_js_1.parseEffortValue)(effortRaw) : undefined;
                    if (effortRaw !== undefined && effort === undefined) {
                        (0, debug_js_1.logForDebugging)("Plugin agent file ".concat(filePath, " has invalid effort '").concat(effortRaw, "'. Valid options: ").concat(effort_js_1.EFFORT_LEVELS.join(', '), " or an integer"));
                    }
                    // permissionMode, hooks, and mcpServers are intentionally NOT parsed for
                    // plugin agents. Plugins are third-party marketplace code; these fields
                    // escalate what the agent can do beyond what the user approved at install
                    // time. For this level of control, define the agent in .claude/agents/
                    // where the user explicitly wrote the frontmatter. (Note: plugins can
                    // still ship hooks and MCP servers at the manifest level — that's the
                    // install-time trust boundary. Per-agent declarations would let a single
                    // agent file buried in agents/ silently add them.) See PR #22558 review.
                    for (_i = 0, _b = ['permissionMode', 'hooks', 'mcpServers']; _i < _b.length; _i++) {
                        field = _b[_i];
                        if (frontmatter[field] !== undefined) {
                            (0, debug_js_1.logForDebugging)("Plugin agent file ".concat(filePath, " sets ").concat(field, ", which is ignored for plugin agents. Use .claude/agents/ for this level of control."), { level: 'warn' });
                        }
                    }
                    maxTurnsRaw = frontmatter.maxTurns;
                    maxTurns = (0, frontmatterParser_js_1.parsePositiveIntFromFrontmatter)(maxTurnsRaw);
                    if (maxTurnsRaw !== undefined && maxTurns === undefined) {
                        (0, debug_js_1.logForDebugging)("Plugin agent file ".concat(filePath, " has invalid maxTurns '").concat(maxTurnsRaw, "'. Must be a positive integer."));
                    }
                    disallowedTools = frontmatter.disallowedTools !== undefined
                        ? (0, markdownConfigLoader_js_1.parseAgentToolsFromFrontmatter)(frontmatter.disallowedTools)
                        : undefined;
                    // If memory is enabled, inject Write/Edit/Read tools for memory access
                    if ((0, paths_js_1.isAutoMemoryEnabled)() && memory_1 && tools !== undefined) {
                        toolSet = new Set(tools);
                        for (_c = 0, _d = [
                            prompt_js_2.FILE_WRITE_TOOL_NAME,
                            constants_js_1.FILE_EDIT_TOOL_NAME,
                            prompt_js_1.FILE_READ_TOOL_NAME,
                        ]; _c < _d.length; _c++) {
                            tool = _d[_c];
                            if (!toolSet.has(tool)) {
                                tools = __spreadArray(__spreadArray([], tools, true), [tool], false);
                            }
                        }
                    }
                    return [2 /*return*/, __assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({ agentType: agentType_1, whenToUse: whenToUse, tools: tools }, (disallowedTools !== undefined ? { disallowedTools: disallowedTools } : {})), (skills !== undefined ? { skills: skills } : {})), { getSystemPrompt: function () {
                                if ((0, paths_js_1.isAutoMemoryEnabled)() && memory_1) {
                                    var memoryPrompt = (0, agentMemory_js_1.loadAgentMemoryPrompt)(agentType_1, memory_1);
                                    return systemPrompt_1 + '\n\n' + memoryPrompt;
                                }
                                return systemPrompt_1;
                            }, source: 'plugin', color: color, model: model, filename: baseAgentName, plugin: sourceName }), (background ? { background: background } : {})), (memory_1 ? { memory: memory_1 } : {})), (isolation ? { isolation: isolation } : {})), (effort !== undefined ? { effort: effort } : {})), (maxTurns !== undefined ? { maxTurns: maxTurns } : {}))];
                case 3:
                    error_1 = _g.sent();
                    (0, debug_js_1.logForDebugging)("Failed to load agent from ".concat(filePath, ": ").concat(error_1), {
                        level: 'error',
                    });
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.loadPluginAgents = (0, memoize_js_1.default)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, enabled, errors, perPluginAgents, allAgents;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, (0, pluginLoader_js_1.loadAllPluginsCacheOnly)()];
            case 1:
                _a = _b.sent(), enabled = _a.enabled, errors = _a.errors;
                if (errors.length > 0) {
                    (0, debug_js_1.logForDebugging)("Plugin loading errors: ".concat(errors.map(function (e) { return (0, plugin_js_1.getPluginErrorMessage)(e); }).join(', ')));
                }
                return [4 /*yield*/, Promise.all(enabled.map(function (plugin) { return __awaiter(void 0, void 0, void 0, function () {
                        var loadedPaths, pluginAgents, agents, error_2, pathResults, _i, pathResults_1, agents;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    loadedPaths = new Set();
                                    pluginAgents = [];
                                    if (!plugin.agentsPath) return [3 /*break*/, 4];
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, loadAgentsFromDirectory(plugin.agentsPath, plugin.name, plugin.source, plugin.path, plugin.manifest, loadedPaths)];
                                case 2:
                                    agents = _a.sent();
                                    pluginAgents.push.apply(pluginAgents, agents);
                                    if (agents.length > 0) {
                                        (0, debug_js_1.logForDebugging)("Loaded ".concat(agents.length, " agents from plugin ").concat(plugin.name, " default directory"));
                                    }
                                    return [3 /*break*/, 4];
                                case 3:
                                    error_2 = _a.sent();
                                    (0, debug_js_1.logForDebugging)("Failed to load agents from plugin ".concat(plugin.name, " default directory: ").concat(error_2), { level: 'error' });
                                    return [3 /*break*/, 4];
                                case 4:
                                    if (!plugin.agentsPaths) return [3 /*break*/, 6];
                                    return [4 /*yield*/, Promise.all(plugin.agentsPaths.map(function (agentPath) { return __awaiter(void 0, void 0, void 0, function () {
                                            var fs, stats, agents, agent, error_3;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        _a.trys.push([0, 6, , 7]);
                                                        fs = (0, fsOperations_js_1.getFsImplementation)();
                                                        return [4 /*yield*/, fs.stat(agentPath)];
                                                    case 1:
                                                        stats = _a.sent();
                                                        if (!stats.isDirectory()) return [3 /*break*/, 3];
                                                        return [4 /*yield*/, loadAgentsFromDirectory(agentPath, plugin.name, plugin.source, plugin.path, plugin.manifest, loadedPaths)];
                                                    case 2:
                                                        agents = _a.sent();
                                                        if (agents.length > 0) {
                                                            (0, debug_js_1.logForDebugging)("Loaded ".concat(agents.length, " agents from plugin ").concat(plugin.name, " custom path: ").concat(agentPath));
                                                        }
                                                        return [2 /*return*/, agents];
                                                    case 3:
                                                        if (!(stats.isFile() && agentPath.endsWith('.md'))) return [3 /*break*/, 5];
                                                        return [4 /*yield*/, loadAgentFromFile(agentPath, plugin.name, [], plugin.source, plugin.path, plugin.manifest, loadedPaths)];
                                                    case 4:
                                                        agent = _a.sent();
                                                        if (agent) {
                                                            (0, debug_js_1.logForDebugging)("Loaded agent from plugin ".concat(plugin.name, " custom file: ").concat(agentPath));
                                                            return [2 /*return*/, [agent]];
                                                        }
                                                        _a.label = 5;
                                                    case 5: return [2 /*return*/, []];
                                                    case 6:
                                                        error_3 = _a.sent();
                                                        (0, debug_js_1.logForDebugging)("Failed to load agents from plugin ".concat(plugin.name, " custom path ").concat(agentPath, ": ").concat(error_3), { level: 'error' });
                                                        return [2 /*return*/, []];
                                                    case 7: return [2 /*return*/];
                                                }
                                            });
                                        }); }))];
                                case 5:
                                    pathResults = _a.sent();
                                    for (_i = 0, pathResults_1 = pathResults; _i < pathResults_1.length; _i++) {
                                        agents = pathResults_1[_i];
                                        pluginAgents.push.apply(pluginAgents, agents);
                                    }
                                    _a.label = 6;
                                case 6: return [2 /*return*/, pluginAgents];
                            }
                        });
                    }); }))];
            case 2:
                perPluginAgents = _b.sent();
                allAgents = perPluginAgents.flat();
                (0, debug_js_1.logForDebugging)("Total plugin agents loaded: ".concat(allAgents.length));
                return [2 /*return*/, allAgents];
        }
    });
}); });
function clearPluginAgentCache() {
    var _a, _b;
    (_b = (_a = exports.loadPluginAgents.cache) === null || _a === void 0 ? void 0 : _a.clear) === null || _b === void 0 ? void 0 : _b.call(_a);
}
