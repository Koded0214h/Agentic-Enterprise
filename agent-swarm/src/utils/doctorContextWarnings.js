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
exports.checkContextWarnings = checkContextWarnings;
var tokenEstimation_js_1 = require("../services/tokenEstimation.js");
var analyzeContext_js_1 = require("./analyzeContext.js");
var claudemd_js_1 = require("./claudemd.js");
var model_js_1 = require("./model/model.js");
var permissionRuleParser_js_1 = require("./permissions/permissionRuleParser.js");
var shadowedRuleDetection_js_1 = require("./permissions/shadowedRuleDetection.js");
var sandbox_adapter_js_1 = require("./sandbox/sandbox-adapter.js");
var statusNoticeHelpers_js_1 = require("./statusNoticeHelpers.js");
var stringUtils_js_1 = require("./stringUtils.js");
// Thresholds (matching status notices and existing patterns)
var MCP_TOOLS_THRESHOLD = 25000; // 15k tokens
function checkClaudeMdFiles() {
    return __awaiter(this, void 0, void 0, function () {
        var largeFiles, _a, details, message;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = claudemd_js_1.getLargeMemoryFiles;
                    return [4 /*yield*/, (0, claudemd_js_1.getMemoryFiles)()];
                case 1:
                    largeFiles = _a.apply(void 0, [_b.sent()]);
                    // This already filters for files > 40k chars each
                    if (largeFiles.length === 0) {
                        return [2 /*return*/, null];
                    }
                    details = largeFiles
                        .sort(function (a, b) { return b.content.length - a.content.length; })
                        .map(function (file) { return "".concat(file.path, ": ").concat(file.content.length.toLocaleString(), " chars"); });
                    message = largeFiles.length === 1
                        ? "Large CLAUDE.md file detected (".concat(largeFiles[0].content.length.toLocaleString(), " chars > ").concat(claudemd_js_1.MAX_MEMORY_CHARACTER_COUNT.toLocaleString(), ")")
                        : "".concat(largeFiles.length, " large CLAUDE.md files detected (each > ").concat(claudemd_js_1.MAX_MEMORY_CHARACTER_COUNT.toLocaleString(), " chars)");
                    return [2 /*return*/, {
                            type: 'claudemd_files',
                            severity: 'warning',
                            message: message,
                            details: details,
                            currentValue: largeFiles.length, // Number of files exceeding threshold
                            threshold: claudemd_js_1.MAX_MEMORY_CHARACTER_COUNT,
                        }];
            }
        });
    });
}
/**
 * Check agent descriptions token count
 */
function checkAgentDescriptions(agentInfo) {
    return __awaiter(this, void 0, void 0, function () {
        var totalTokens, agentTokens, details;
        return __generator(this, function (_a) {
            if (!agentInfo) {
                return [2 /*return*/, null];
            }
            totalTokens = (0, statusNoticeHelpers_js_1.getAgentDescriptionsTotalTokens)(agentInfo);
            if (totalTokens <= statusNoticeHelpers_js_1.AGENT_DESCRIPTIONS_THRESHOLD) {
                return [2 /*return*/, null];
            }
            agentTokens = agentInfo.activeAgents
                .filter(function (a) { return a.source !== 'built-in'; })
                .map(function (agent) {
                var description = "".concat(agent.agentType, ": ").concat(agent.whenToUse);
                return {
                    name: agent.agentType,
                    tokens: (0, tokenEstimation_js_1.roughTokenCountEstimation)(description),
                };
            })
                .sort(function (a, b) { return b.tokens - a.tokens; });
            details = agentTokens
                .slice(0, 5)
                .map(function (agent) { return "".concat(agent.name, ": ~").concat(agent.tokens.toLocaleString(), " tokens"); });
            if (agentTokens.length > 5) {
                details.push("(".concat(agentTokens.length - 5, " more custom agents)"));
            }
            return [2 /*return*/, {
                    type: 'agent_descriptions',
                    severity: 'warning',
                    message: "Large agent descriptions (~".concat(totalTokens.toLocaleString(), " tokens > ").concat(statusNoticeHelpers_js_1.AGENT_DESCRIPTIONS_THRESHOLD.toLocaleString(), ")"),
                    details: details,
                    currentValue: totalTokens,
                    threshold: statusNoticeHelpers_js_1.AGENT_DESCRIPTIONS_THRESHOLD,
                }];
        });
    });
}
/**
 * Check MCP tools token count
 */
function checkMcpTools(tools, getToolPermissionContext, agentInfo) {
    return __awaiter(this, void 0, void 0, function () {
        var mcpTools, model, _a, mcpToolTokens, mcpToolDetails, toolsByServer, _i, mcpToolDetails_1, tool, parts, serverName, current, sortedServers, details, _error_1, estimatedTokens;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    mcpTools = tools.filter(function (tool) { return tool.isMcp; });
                    // Note: MCP tools are loaded asynchronously and may not be available
                    // when doctor command runs, as it executes before MCP connections are established
                    if (mcpTools.length === 0) {
                        return [2 /*return*/, null];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    model = (0, model_js_1.getMainLoopModel)();
                    return [4 /*yield*/, (0, analyzeContext_js_1.countMcpToolTokens)(tools, getToolPermissionContext, agentInfo, model)];
                case 2:
                    _a = _b.sent(), mcpToolTokens = _a.mcpToolTokens, mcpToolDetails = _a.mcpToolDetails;
                    if (mcpToolTokens <= MCP_TOOLS_THRESHOLD) {
                        return [2 /*return*/, null];
                    }
                    toolsByServer = new Map();
                    for (_i = 0, mcpToolDetails_1 = mcpToolDetails; _i < mcpToolDetails_1.length; _i++) {
                        tool = mcpToolDetails_1[_i];
                        parts = tool.name.split('__');
                        serverName = parts[1] || 'unknown';
                        current = toolsByServer.get(serverName) || { count: 0, tokens: 0 };
                        toolsByServer.set(serverName, {
                            count: current.count + 1,
                            tokens: current.tokens + tool.tokens,
                        });
                    }
                    sortedServers = Array.from(toolsByServer.entries()).sort(function (a, b) { return b[1].tokens - a[1].tokens; });
                    details = sortedServers
                        .slice(0, 5)
                        .map(function (_a) {
                        var name = _a[0], info = _a[1];
                        return "".concat(name, ": ").concat(info.count, " tools (~").concat(info.tokens.toLocaleString(), " tokens)");
                    });
                    if (sortedServers.length > 5) {
                        details.push("(".concat(sortedServers.length - 5, " more servers)"));
                    }
                    return [2 /*return*/, {
                            type: 'mcp_tools',
                            severity: 'warning',
                            message: "Large MCP tools context (~".concat(mcpToolTokens.toLocaleString(), " tokens > ").concat(MCP_TOOLS_THRESHOLD.toLocaleString(), ")"),
                            details: details,
                            currentValue: mcpToolTokens,
                            threshold: MCP_TOOLS_THRESHOLD,
                        }];
                case 3:
                    _error_1 = _b.sent();
                    estimatedTokens = mcpTools.reduce(function (total, tool) {
                        var _a;
                        var chars = (((_a = tool.name) === null || _a === void 0 ? void 0 : _a.length) || 0) + tool.description.length;
                        return total + (0, tokenEstimation_js_1.roughTokenCountEstimation)(chars.toString());
                    }, 0);
                    if (estimatedTokens <= MCP_TOOLS_THRESHOLD) {
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, {
                            type: 'mcp_tools',
                            severity: 'warning',
                            message: "Large MCP tools context (~".concat(estimatedTokens.toLocaleString(), " tokens estimated > ").concat(MCP_TOOLS_THRESHOLD.toLocaleString(), ")"),
                            details: [
                                "".concat(mcpTools.length, " MCP tools detected (token count estimated)"),
                            ],
                            currentValue: estimatedTokens,
                            threshold: MCP_TOOLS_THRESHOLD,
                        }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Check for unreachable permission rules (e.g., specific allow rules shadowed by tool-wide ask rules)
 */
function checkUnreachableRules(getToolPermissionContext) {
    return __awaiter(this, void 0, void 0, function () {
        var context, sandboxAutoAllowEnabled, unreachable, details;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getToolPermissionContext()];
                case 1:
                    context = _a.sent();
                    sandboxAutoAllowEnabled = sandbox_adapter_js_1.SandboxManager.isSandboxingEnabled() &&
                        sandbox_adapter_js_1.SandboxManager.isAutoAllowBashIfSandboxedEnabled();
                    unreachable = (0, shadowedRuleDetection_js_1.detectUnreachableRules)(context, {
                        sandboxAutoAllowEnabled: sandboxAutoAllowEnabled,
                    });
                    if (unreachable.length === 0) {
                        return [2 /*return*/, null];
                    }
                    details = unreachable.flatMap(function (r) { return [
                        "".concat((0, permissionRuleParser_js_1.permissionRuleValueToString)(r.rule.ruleValue), ": ").concat(r.reason),
                        "  Fix: ".concat(r.fix),
                    ]; });
                    return [2 /*return*/, {
                            type: 'unreachable_rules',
                            severity: 'warning',
                            message: "".concat(unreachable.length, " ").concat((0, stringUtils_js_1.plural)(unreachable.length, 'unreachable permission rule'), " detected"),
                            details: details,
                            currentValue: unreachable.length,
                            threshold: 0,
                        }];
            }
        });
    });
}
/**
 * Check all context warnings for the doctor command
 */
function checkContextWarnings(tools, agentInfo, getToolPermissionContext) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, claudeMdWarning, agentWarning, mcpWarning, unreachableRulesWarning;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.all([
                        checkClaudeMdFiles(),
                        checkAgentDescriptions(agentInfo),
                        checkMcpTools(tools, getToolPermissionContext, agentInfo),
                        checkUnreachableRules(getToolPermissionContext),
                    ])];
                case 1:
                    _a = _b.sent(), claudeMdWarning = _a[0], agentWarning = _a[1], mcpWarning = _a[2], unreachableRulesWarning = _a[3];
                    return [2 /*return*/, {
                            claudeMdWarning: claudeMdWarning,
                            agentWarning: agentWarning,
                            mcpWarning: mcpWarning,
                            unreachableRulesWarning: unreachableRulesWarning,
                        }];
            }
        });
    });
}
