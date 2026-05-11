"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectContextData = collectContextData;
exports.call = call;
var bun_bundle_1 = require("bun:bundle");
var microCompact_js_1 = require("../../services/compact/microCompact.js");
var analyzeContext_js_1 = require("../../utils/analyzeContext.js");
var format_js_1 = require("../../utils/format.js");
var messages_js_1 = require("../../utils/messages.js");
var constants_js_1 = require("../../utils/settings/constants.js");
var stringUtils_js_1 = require("../../utils/stringUtils.js");
function collectContextData(context) {
    return __awaiter(this, void 0, void 0, function () {
        var messages, getAppState, _a, mainLoopModel, tools, agentDefinitions, customSystemPrompt, appendSystemPrompt, apiView, projectView, compactedMessages, appState;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    messages = context.messages, getAppState = context.getAppState, _a = context.options, mainLoopModel = _a.mainLoopModel, tools = _a.tools, agentDefinitions = _a.agentDefinitions, customSystemPrompt = _a.customSystemPrompt, appendSystemPrompt = _a.appendSystemPrompt;
                    apiView = (0, messages_js_1.getMessagesAfterCompactBoundary)(messages);
                    if ((0, bun_bundle_1.feature)('CONTEXT_COLLAPSE')) {
                        projectView = require('../../services/contextCollapse/operations.js').projectView;
                        /* eslint-enable @typescript-eslint/no-require-imports */
                        apiView = projectView(apiView);
                    }
                    return [4 /*yield*/, (0, microCompact_js_1.microcompactMessages)(apiView)];
                case 1:
                    compactedMessages = (_b.sent()).messages;
                    appState = getAppState();
                    return [2 /*return*/, (0, analyzeContext_js_1.analyzeContextUsage)(compactedMessages, mainLoopModel, function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, appState.toolPermissionContext];
                        }); }); }, tools, agentDefinitions, undefined, // terminalWidth
                        // analyzeContextUsage only reads options.{customSystemPrompt,appendSystemPrompt}
                        // but its signature declares the full Pick<ToolUseContext, 'options'>.
                        { options: { customSystemPrompt: customSystemPrompt, appendSystemPrompt: appendSystemPrompt } }, undefined, // mainThreadAgentDefinition
                        apiView)];
            }
        });
    });
}
function call(_args, context) {
    return __awaiter(this, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, collectContextData(context)];
                case 1:
                    data = _a.sent();
                    return [2 /*return*/, {
                            type: 'text',
                            value: formatContextAsMarkdownTable(data),
                        }];
            }
        });
    });
}
function formatContextAsMarkdownTable(data) {
    var categories = data.categories, totalTokens = data.totalTokens, rawMaxTokens = data.rawMaxTokens, percentage = data.percentage, model = data.model, memoryFiles = data.memoryFiles, mcpTools = data.mcpTools, agents = data.agents, skills = data.skills, messageBreakdown = data.messageBreakdown, systemTools = data.systemTools, systemPromptSections = data.systemPromptSections;
    var output = "## Context Usage\n\n";
    output += "**Model:** ".concat(model, "  \n");
    output += "**Tokens:** ".concat((0, format_js_1.formatTokens)(totalTokens), " / ").concat((0, format_js_1.formatTokens)(rawMaxTokens), " (").concat(percentage, "%)\n");
    // Context-collapse status. Always show when the runtime gate is on —
    // the user needs to know which strategy is managing their context
    // even before anything has fired.
    if ((0, bun_bundle_1.feature)('CONTEXT_COLLAPSE')) {
        /* eslint-disable @typescript-eslint/no-require-imports */
        var _a = require('../../services/contextCollapse/index.js'), getStats = _a.getStats, isContextCollapseEnabled = _a.isContextCollapseEnabled;
        /* eslint-enable @typescript-eslint/no-require-imports */
        if (isContextCollapseEnabled()) {
            var s = getStats();
            var h = s.health;
            var parts = [];
            if (s.collapsedSpans > 0) {
                parts.push("".concat(s.collapsedSpans, " ").concat((0, stringUtils_js_1.plural)(s.collapsedSpans, 'span'), " summarized (").concat(s.collapsedMessages, " messages)"));
            }
            if (s.stagedSpans > 0)
                parts.push("".concat(s.stagedSpans, " staged"));
            var summary = parts.length > 0
                ? parts.join(', ')
                : h.totalSpawns > 0
                    ? "".concat(h.totalSpawns, " ").concat((0, stringUtils_js_1.plural)(h.totalSpawns, 'spawn'), ", nothing staged yet")
                    : 'waiting for first trigger';
            output += "**Context strategy:** collapse (".concat(summary, ")\n");
            if (h.totalErrors > 0) {
                output += "**Collapse errors:** ".concat(h.totalErrors, "/").concat(h.totalSpawns, " spawns failed");
                if (h.lastError) {
                    output += " (last: ".concat(h.lastError.slice(0, 80), ")");
                }
                output += '\n';
            }
            else if (h.emptySpawnWarningEmitted) {
                output += "**Collapse idle:** ".concat(h.totalEmptySpawns, " consecutive empty runs\n");
            }
        }
    }
    output += '\n';
    // Main categories table
    var visibleCategories = categories.filter(function (cat) {
        return cat.tokens > 0 &&
            cat.name !== 'Free space' &&
            cat.name !== 'Autocompact buffer';
    });
    if (visibleCategories.length > 0) {
        output += "### Estimated usage by category\n\n";
        output += "| Category | Tokens | Percentage |\n";
        output += "|----------|--------|------------|\n";
        for (var _i = 0, visibleCategories_1 = visibleCategories; _i < visibleCategories_1.length; _i++) {
            var cat = visibleCategories_1[_i];
            var percentDisplay = ((cat.tokens / rawMaxTokens) * 100).toFixed(1);
            output += "| ".concat(cat.name, " | ").concat((0, format_js_1.formatTokens)(cat.tokens), " | ").concat(percentDisplay, "% |\n");
        }
        var freeSpaceCategory = categories.find(function (c) { return c.name === 'Free space'; });
        if (freeSpaceCategory && freeSpaceCategory.tokens > 0) {
            var percentDisplay = ((freeSpaceCategory.tokens / rawMaxTokens) *
                100).toFixed(1);
            output += "| Free space | ".concat((0, format_js_1.formatTokens)(freeSpaceCategory.tokens), " | ").concat(percentDisplay, "% |\n");
        }
        var autocompactCategory = categories.find(function (c) { return c.name === 'Autocompact buffer'; });
        if (autocompactCategory && autocompactCategory.tokens > 0) {
            var percentDisplay = ((autocompactCategory.tokens / rawMaxTokens) *
                100).toFixed(1);
            output += "| Autocompact buffer | ".concat((0, format_js_1.formatTokens)(autocompactCategory.tokens), " | ").concat(percentDisplay, "% |\n");
        }
        output += "\n";
    }
    // MCP tools
    if (mcpTools.length > 0) {
        output += "### MCP Tools\n\n";
        output += "| Tool | Server | Tokens |\n";
        output += "|------|--------|--------|\n";
        for (var _b = 0, mcpTools_1 = mcpTools; _b < mcpTools_1.length; _b++) {
            var tool = mcpTools_1[_b];
            output += "| ".concat(tool.name, " | ").concat(tool.serverName, " | ").concat((0, format_js_1.formatTokens)(tool.tokens), " |\n");
        }
        output += "\n";
    }
    // System tools (ant-only)
    if (systemTools &&
        systemTools.length > 0 &&
        process.env.USER_TYPE === 'ant') {
        output += "### [ANT-ONLY] System Tools\n\n";
        output += "| Tool | Tokens |\n";
        output += "|------|--------|\n";
        for (var _c = 0, systemTools_1 = systemTools; _c < systemTools_1.length; _c++) {
            var tool = systemTools_1[_c];
            output += "| ".concat(tool.name, " | ").concat((0, format_js_1.formatTokens)(tool.tokens), " |\n");
        }
        output += "\n";
    }
    // System prompt sections (ant-only)
    if (systemPromptSections &&
        systemPromptSections.length > 0 &&
        process.env.USER_TYPE === 'ant') {
        output += "### [ANT-ONLY] System Prompt Sections\n\n";
        output += "| Section | Tokens |\n";
        output += "|---------|--------|\n";
        for (var _d = 0, systemPromptSections_1 = systemPromptSections; _d < systemPromptSections_1.length; _d++) {
            var section = systemPromptSections_1[_d];
            output += "| ".concat(section.name, " | ").concat((0, format_js_1.formatTokens)(section.tokens), " |\n");
        }
        output += "\n";
    }
    // Custom agents
    if (agents.length > 0) {
        output += "### Custom Agents\n\n";
        output += "| Agent Type | Source | Tokens |\n";
        output += "|------------|--------|--------|\n";
        for (var _e = 0, agents_1 = agents; _e < agents_1.length; _e++) {
            var agent = agents_1[_e];
            var sourceDisplay = void 0;
            switch (agent.source) {
                case 'projectSettings':
                    sourceDisplay = 'Project';
                    break;
                case 'userSettings':
                    sourceDisplay = 'User';
                    break;
                case 'localSettings':
                    sourceDisplay = 'Local';
                    break;
                case 'flagSettings':
                    sourceDisplay = 'Flag';
                    break;
                case 'policySettings':
                    sourceDisplay = 'Policy';
                    break;
                case 'plugin':
                    sourceDisplay = 'Plugin';
                    break;
                case 'built-in':
                    sourceDisplay = 'Built-in';
                    break;
                default:
                    sourceDisplay = String(agent.source);
            }
            output += "| ".concat(agent.agentType, " | ").concat(sourceDisplay, " | ").concat((0, format_js_1.formatTokens)(agent.tokens), " |\n");
        }
        output += "\n";
    }
    // Memory files
    if (memoryFiles.length > 0) {
        output += "### Memory Files\n\n";
        output += "| Type | Path | Tokens |\n";
        output += "|------|------|--------|\n";
        for (var _f = 0, memoryFiles_1 = memoryFiles; _f < memoryFiles_1.length; _f++) {
            var file = memoryFiles_1[_f];
            output += "| ".concat(file.type, " | ").concat(file.path, " | ").concat((0, format_js_1.formatTokens)(file.tokens), " |\n");
        }
        output += "\n";
    }
    // Skills
    if (skills && skills.tokens > 0 && skills.skillFrontmatter.length > 0) {
        output += "### Skills\n\n";
        output += "| Skill | Source | Tokens |\n";
        output += "|-------|--------|--------|\n";
        for (var _g = 0, _h = skills.skillFrontmatter; _g < _h.length; _g++) {
            var skill = _h[_g];
            output += "| ".concat(skill.name, " | ").concat((0, constants_js_1.getSourceDisplayName)(skill.source), " | ").concat((0, format_js_1.formatTokens)(skill.tokens), " |\n");
        }
        output += "\n";
    }
    // Message breakdown (ant-only)
    if (messageBreakdown && process.env.USER_TYPE === 'ant') {
        output += "### [ANT-ONLY] Message Breakdown\n\n";
        output += "| Category | Tokens |\n";
        output += "|----------|--------|\n";
        output += "| Tool calls | ".concat((0, format_js_1.formatTokens)(messageBreakdown.toolCallTokens), " |\n");
        output += "| Tool results | ".concat((0, format_js_1.formatTokens)(messageBreakdown.toolResultTokens), " |\n");
        output += "| Attachments | ".concat((0, format_js_1.formatTokens)(messageBreakdown.attachmentTokens), " |\n");
        output += "| Assistant messages (non-tool) | ".concat((0, format_js_1.formatTokens)(messageBreakdown.assistantMessageTokens), " |\n");
        output += "| User messages (non-tool-result) | ".concat((0, format_js_1.formatTokens)(messageBreakdown.userMessageTokens), " |\n");
        output += "\n";
        if (messageBreakdown.toolCallsByType.length > 0) {
            output += "#### Top Tools\n\n";
            output += "| Tool | Call Tokens | Result Tokens |\n";
            output += "|------|-------------|---------------|\n";
            for (var _j = 0, _k = messageBreakdown.toolCallsByType; _j < _k.length; _j++) {
                var tool = _k[_j];
                output += "| ".concat(tool.name, " | ").concat((0, format_js_1.formatTokens)(tool.callTokens), " | ").concat((0, format_js_1.formatTokens)(tool.resultTokens), " |\n");
            }
            output += "\n";
        }
        if (messageBreakdown.attachmentsByType.length > 0) {
            output += "#### Top Attachments\n\n";
            output += "| Attachment | Tokens |\n";
            output += "|------------|--------|\n";
            for (var _l = 0, _m = messageBreakdown.attachmentsByType; _l < _m.length; _l++) {
                var attachment = _m[_l];
                output += "| ".concat(attachment.name, " | ").concat((0, format_js_1.formatTokens)(attachment.tokens), " |\n");
            }
            output += "\n";
        }
    }
    return output;
}
