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
exports.hasPermissionsToUseTool = void 0;
exports.permissionRuleSourceDisplayString = permissionRuleSourceDisplayString;
exports.getAllowRules = getAllowRules;
exports.createPermissionRequestMessage = createPermissionRequestMessage;
exports.getDenyRules = getDenyRules;
exports.getAskRules = getAskRules;
exports.toolAlwaysAllowedRule = toolAlwaysAllowedRule;
exports.getDenyRuleForTool = getDenyRuleForTool;
exports.getAskRuleForTool = getAskRuleForTool;
exports.getDenyRuleForAgent = getDenyRuleForAgent;
exports.filterDeniedAgents = filterDeniedAgents;
exports.getRuleByContentsForTool = getRuleByContentsForTool;
exports.getRuleByContentsForToolName = getRuleByContentsForToolName;
exports.checkRuleBasedPermissions = checkRuleBasedPermissions;
exports.deletePermissionRule = deletePermissionRule;
exports.applyPermissionRulesToPermissionContext = applyPermissionRulesToPermissionContext;
exports.syncPermissionRulesFromDisk = syncPermissionRulesFromDisk;
var bun_bundle_1 = require("bun:bundle");
var sdk_1 = require("@anthropic-ai/sdk");
var mcpStringUtils_js_1 = require("../../services/mcp/mcpStringUtils.js");
var constants_js_1 = require("../../tools/AgentTool/constants.js");
var shouldUseSandbox_js_1 = require("../../tools/BashTool/shouldUseSandbox.js");
var toolName_js_1 = require("../../tools/BashTool/toolName.js");
var toolName_js_2 = require("../../tools/PowerShellTool/toolName.js");
var constants_js_2 = require("../../tools/REPLTool/constants.js");
var commands_js_1 = require("../bash/commands.js");
var debug_js_1 = require("../debug.js");
var errors_js_1 = require("../errors.js");
var log_js_1 = require("../log.js");
var sandbox_adapter_js_1 = require("../sandbox/sandbox-adapter.js");
var constants_js_3 = require("../settings/constants.js");
var stringUtils_js_1 = require("../stringUtils.js");
var PermissionMode_js_1 = require("./PermissionMode.js");
var PermissionUpdate_js_1 = require("./PermissionUpdate.js");
var permissionRuleParser_js_1 = require("./permissionRuleParser.js");
var permissionsLoader_js_1 = require("./permissionsLoader.js");
/* eslint-disable @typescript-eslint/no-require-imports */
var classifierDecisionModule = (0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER')
    ? require('./classifierDecision.js')
    : null;
var autoModeStateModule = (0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER')
    ? require('./autoModeState.js')
    : null;
var state_js_1 = require("../../bootstrap/state.js");
var growthbook_js_1 = require("../../services/analytics/growthbook.js");
var index_js_1 = require("../../services/analytics/index.js");
var metadata_js_1 = require("../../services/analytics/metadata.js");
var classifierApprovals_js_1 = require("../classifierApprovals.js");
var envUtils_js_1 = require("../envUtils.js");
var hooks_js_1 = require("../hooks.js");
var messages_js_1 = require("../messages.js");
var modelCost_js_1 = require("../modelCost.js");
/* eslint-enable @typescript-eslint/no-require-imports */
var slowOperations_js_1 = require("../slowOperations.js");
var denialTracking_js_1 = require("./denialTracking.js");
var yoloClassifier_js_1 = require("./yoloClassifier.js");
var CLASSIFIER_FAIL_CLOSED_REFRESH_MS = 30 * 60 * 1000; // 30 minutes
var PERMISSION_RULE_SOURCES = __spreadArray(__spreadArray([], constants_js_3.SETTING_SOURCES, true), [
    'cliArg',
    'command',
    'session',
], false);
function permissionRuleSourceDisplayString(source) {
    return (0, constants_js_3.getSettingSourceDisplayNameLowercase)(source);
}
function getAllowRules(context) {
    return PERMISSION_RULE_SOURCES.flatMap(function (source) {
        return (context.alwaysAllowRules[source] || []).map(function (ruleString) { return ({
            source: source,
            ruleBehavior: 'allow',
            ruleValue: (0, permissionRuleParser_js_1.permissionRuleValueFromString)(ruleString),
        }); });
    });
}
/**
 * Creates a permission request message that explain the permission request
 */
function createPermissionRequestMessage(toolName, decisionReason) {
    // Handle different decision reason types
    if (decisionReason) {
        if (((0, bun_bundle_1.feature)('BASH_CLASSIFIER') || (0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER')) &&
            decisionReason.type === 'classifier') {
            return "Classifier '".concat(decisionReason.classifier, "' requires approval for this ").concat(toolName, " command: ").concat(decisionReason.reason);
        }
        switch (decisionReason.type) {
            case 'hook': {
                var hookMessage = decisionReason.reason
                    ? "Hook '".concat(decisionReason.hookName, "' blocked this action: ").concat(decisionReason.reason)
                    : "Hook '".concat(decisionReason.hookName, "' requires approval for this ").concat(toolName, " command");
                return hookMessage;
            }
            case 'rule': {
                var ruleString = (0, permissionRuleParser_js_1.permissionRuleValueToString)(decisionReason.rule.ruleValue);
                var sourceString = permissionRuleSourceDisplayString(decisionReason.rule.source);
                return "Permission rule '".concat(ruleString, "' from ").concat(sourceString, " requires approval for this ").concat(toolName, " command");
            }
            case 'subcommandResults': {
                var needsApproval = [];
                for (var _i = 0, _a = decisionReason.reasons; _i < _a.length; _i++) {
                    var _b = _a[_i], cmd = _b[0], result = _b[1];
                    if (result.behavior === 'ask' || result.behavior === 'passthrough') {
                        // Strip output redirections for display to avoid showing filenames as commands
                        // Only do this for Bash tool to avoid affecting other tools
                        if (toolName === 'Bash') {
                            var _c = (0, commands_js_1.extractOutputRedirections)(cmd), commandWithoutRedirections = _c.commandWithoutRedirections, redirections = _c.redirections;
                            // Only use stripped version if there were actual redirections
                            var displayCmd = redirections.length > 0 ? commandWithoutRedirections : cmd;
                            needsApproval.push(displayCmd);
                        }
                        else {
                            needsApproval.push(cmd);
                        }
                    }
                }
                if (needsApproval.length > 0) {
                    var n = needsApproval.length;
                    return "This ".concat(toolName, " command contains multiple operations. The following ").concat((0, stringUtils_js_1.plural)(n, 'part'), " ").concat((0, stringUtils_js_1.plural)(n, 'requires', 'require'), " approval: ").concat(needsApproval.join(', '));
                }
                return "This ".concat(toolName, " command contains multiple operations that require approval");
            }
            case 'permissionPromptTool':
                return "Tool '".concat(decisionReason.permissionPromptToolName, "' requires approval for this ").concat(toolName, " command");
            case 'sandboxOverride':
                return 'Run outside of the sandbox';
            case 'workingDir':
                return decisionReason.reason;
            case 'safetyCheck':
            case 'other':
                return decisionReason.reason;
            case 'mode': {
                var modeTitle = (0, PermissionMode_js_1.permissionModeTitle)(decisionReason.mode);
                return "Current permission mode (".concat(modeTitle, ") requires approval for this ").concat(toolName, " command");
            }
            case 'asyncAgent':
                return decisionReason.reason;
        }
    }
    // Default message without listing allowed commands
    var message = "Claude requested permissions to use ".concat(toolName, ", but you haven't granted it yet.");
    return message;
}
function getDenyRules(context) {
    return PERMISSION_RULE_SOURCES.flatMap(function (source) {
        return (context.alwaysDenyRules[source] || []).map(function (ruleString) { return ({
            source: source,
            ruleBehavior: 'deny',
            ruleValue: (0, permissionRuleParser_js_1.permissionRuleValueFromString)(ruleString),
        }); });
    });
}
function getAskRules(context) {
    return PERMISSION_RULE_SOURCES.flatMap(function (source) {
        return (context.alwaysAskRules[source] || []).map(function (ruleString) { return ({
            source: source,
            ruleBehavior: 'ask',
            ruleValue: (0, permissionRuleParser_js_1.permissionRuleValueFromString)(ruleString),
        }); });
    });
}
/**
 * Check if the entire tool matches a rule
 * For example, this matches "Bash" but not "Bash(prefix:*)" for BashTool
 * This also matches MCP tools with a server name, e.g. the rule "mcp__server1"
 */
function toolMatchesRule(tool, rule) {
    // Rule must not have content to match the entire tool
    if (rule.ruleValue.ruleContent !== undefined) {
        return false;
    }
    // MCP tools are matched by their fully qualified mcp__server__tool name. In
    // skip-prefix mode (CLAUDE_AGENT_SDK_MCP_NO_PREFIX), MCP tools have unprefixed
    // display names (e.g., "Write") that collide with builtin names; rules targeting
    // builtins should not match their MCP replacements.
    var nameForRuleMatch = (0, mcpStringUtils_js_1.getToolNameForPermissionCheck)(tool);
    // Direct tool name match
    if (rule.ruleValue.toolName === nameForRuleMatch) {
        return true;
    }
    // MCP server-level permission: rule "mcp__server1" matches tool "mcp__server1__tool1"
    // Also supports wildcard: rule "mcp__server1__*" matches all tools from server1
    var ruleInfo = (0, mcpStringUtils_js_1.mcpInfoFromString)(rule.ruleValue.toolName);
    var toolInfo = (0, mcpStringUtils_js_1.mcpInfoFromString)(nameForRuleMatch);
    return (ruleInfo !== null &&
        toolInfo !== null &&
        (ruleInfo.toolName === undefined || ruleInfo.toolName === '*') &&
        ruleInfo.serverName === toolInfo.serverName);
}
/**
 * Check if the entire tool is listed in the always allow rules
 * For example, this finds "Bash" but not "Bash(prefix:*)" for BashTool
 */
function toolAlwaysAllowedRule(context, tool) {
    return (getAllowRules(context).find(function (rule) { return toolMatchesRule(tool, rule); }) || null);
}
/**
 * Check if the tool is listed in the always deny rules
 */
function getDenyRuleForTool(context, tool) {
    return getDenyRules(context).find(function (rule) { return toolMatchesRule(tool, rule); }) || null;
}
/**
 * Check if the tool is listed in the always ask rules
 */
function getAskRuleForTool(context, tool) {
    return getAskRules(context).find(function (rule) { return toolMatchesRule(tool, rule); }) || null;
}
/**
 * Check if a specific agent is denied via Agent(agentType) syntax.
 * For example, Agent(Explore) would deny the Explore agent.
 */
function getDenyRuleForAgent(context, agentToolName, agentType) {
    return (getDenyRules(context).find(function (rule) {
        return rule.ruleValue.toolName === agentToolName &&
            rule.ruleValue.ruleContent === agentType;
    }) || null);
}
/**
 * Filter agents to exclude those that are denied via Agent(agentType) syntax.
 */
function filterDeniedAgents(agents, context, agentToolName) {
    // Parse deny rules once and collect Agent(x) contents into a Set.
    // Previously this called getDenyRuleForAgent per agent, which re-parsed
    // every deny rule for every agent (O(agents×rules) parse calls).
    var deniedAgentTypes = new Set();
    for (var _i = 0, _a = getDenyRules(context); _i < _a.length; _i++) {
        var rule = _a[_i];
        if (rule.ruleValue.toolName === agentToolName &&
            rule.ruleValue.ruleContent !== undefined) {
            deniedAgentTypes.add(rule.ruleValue.ruleContent);
        }
    }
    return agents.filter(function (agent) { return !deniedAgentTypes.has(agent.agentType); });
}
/**
 * Map of rule contents to the associated rule for a given tool.
 * e.g. the string key is "prefix:*" from "Bash(prefix:*)" for BashTool
 */
function getRuleByContentsForTool(context, tool, behavior) {
    return getRuleByContentsForToolName(context, (0, mcpStringUtils_js_1.getToolNameForPermissionCheck)(tool), behavior);
}
// Used to break circular dependency where a Tool calls this function
function getRuleByContentsForToolName(context, toolName, behavior) {
    var ruleByContents = new Map();
    var rules = [];
    switch (behavior) {
        case 'allow':
            rules = getAllowRules(context);
            break;
        case 'deny':
            rules = getDenyRules(context);
            break;
        case 'ask':
            rules = getAskRules(context);
            break;
    }
    for (var _i = 0, rules_1 = rules; _i < rules_1.length; _i++) {
        var rule = rules_1[_i];
        if (rule.ruleValue.toolName === toolName &&
            rule.ruleValue.ruleContent !== undefined &&
            rule.ruleBehavior === behavior) {
            ruleByContents.set(rule.ruleValue.ruleContent, rule);
        }
    }
    return ruleByContents;
}
/**
 * Runs PermissionRequest hooks for headless/async agents that cannot show
 * permission prompts. This gives hooks an opportunity to allow or deny
 * tool use before the fallback auto-deny kicks in.
 *
 * Returns a PermissionDecision if a hook made a decision, or null if no
 * hook provided a decision (caller should proceed to auto-deny).
 */
function runPermissionRequestHooksForHeadlessAgent(tool, input, toolUseID, context, permissionMode, suggestions) {
    return __awaiter(this, void 0, void 0, function () {
        var _loop_1, _a, _b, _c, state_1, e_1_1, error_1;
        var _d, e_1, _e, _f;
        var _g, _h;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    _j.trys.push([0, 13, , 14]);
                    _j.label = 1;
                case 1:
                    _j.trys.push([1, 6, 7, 12]);
                    _loop_1 = function () {
                        _f = _c.value;
                        _a = false;
                        var hookResult = _f;
                        if (!hookResult.permissionRequestResult) {
                            return "continue";
                        }
                        var decision = hookResult.permissionRequestResult;
                        if (decision.behavior === 'allow') {
                            var finalInput = (_g = decision.updatedInput) !== null && _g !== void 0 ? _g : input;
                            // Persist permission updates if provided
                            if ((_h = decision.updatedPermissions) === null || _h === void 0 ? void 0 : _h.length) {
                                (0, PermissionUpdate_js_1.persistPermissionUpdates)(decision.updatedPermissions);
                                context.setAppState(function (prev) { return (__assign(__assign({}, prev), { toolPermissionContext: (0, PermissionUpdate_js_1.applyPermissionUpdates)(prev.toolPermissionContext, decision.updatedPermissions) })); });
                            }
                            return { value: {
                                    behavior: 'allow',
                                    updatedInput: finalInput,
                                    decisionReason: {
                                        type: 'hook',
                                        hookName: 'PermissionRequest',
                                    },
                                } };
                        }
                        if (decision.behavior === 'deny') {
                            if (decision.interrupt) {
                                (0, debug_js_1.logForDebugging)("Hook interrupt: tool=".concat(tool.name, " hookMessage=").concat(decision.message));
                                context.abortController.abort();
                            }
                            return { value: {
                                    behavior: 'deny',
                                    message: decision.message || 'Permission denied by hook',
                                    decisionReason: {
                                        type: 'hook',
                                        hookName: 'PermissionRequest',
                                        reason: decision.message,
                                    },
                                } };
                        }
                    };
                    _a = true, _b = __asyncValues((0, hooks_js_1.executePermissionRequestHooks)(tool.name, toolUseID, input, context, permissionMode, suggestions, context.abortController.signal));
                    _j.label = 2;
                case 2: return [4 /*yield*/, _b.next()];
                case 3:
                    if (!(_c = _j.sent(), _d = _c.done, !_d)) return [3 /*break*/, 5];
                    state_1 = _loop_1();
                    if (typeof state_1 === "object")
                        return [2 /*return*/, state_1.value];
                    _j.label = 4;
                case 4:
                    _a = true;
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 12];
                case 6:
                    e_1_1 = _j.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 12];
                case 7:
                    _j.trys.push([7, , 10, 11]);
                    if (!(!_a && !_d && (_e = _b.return))) return [3 /*break*/, 9];
                    return [4 /*yield*/, _e.call(_b)];
                case 8:
                    _j.sent();
                    _j.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 11: return [7 /*endfinally*/];
                case 12: return [3 /*break*/, 14];
                case 13:
                    error_1 = _j.sent();
                    // If hooks fail, fall through to auto-deny rather than crashing
                    (0, log_js_1.logError)(new Error('PermissionRequest hook failed for headless agent', {
                        cause: (0, errors_js_1.toError)(error_1),
                    }));
                    return [3 /*break*/, 14];
                case 14: return [2 /*return*/, null];
            }
        });
    });
}
var hasPermissionsToUseTool = function (tool, input, context, assistantMessage, toolUseID) { return __awaiter(void 0, void 0, void 0, function () {
    var result, appState, currentDenialState, newDenialState, appState, denialState, parsedInput, acceptEditsResult, newDenialState_1, e_2, newDenialState_2, action, classifierResult, yoloDecision, classifierCostUSD, newDenialState_3, denialLimitResult, newDenialState, hookDecision;
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
    return __generator(this, function (_y) {
        switch (_y.label) {
            case 0: return [4 /*yield*/, hasPermissionsToUseToolInner(tool, input, context)
                // Reset consecutive denials on any allowed tool use in auto mode.
                // This ensures that a successful tool use (even one auto-allowed by rules)
                // breaks the consecutive denial streak.
            ];
            case 1:
                result = _y.sent();
                // Reset consecutive denials on any allowed tool use in auto mode.
                // This ensures that a successful tool use (even one auto-allowed by rules)
                // breaks the consecutive denial streak.
                if (result.behavior === 'allow') {
                    appState = context.getAppState();
                    if ((0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER')) {
                        currentDenialState = (_a = context.localDenialTracking) !== null && _a !== void 0 ? _a : appState.denialTracking;
                        if (appState.toolPermissionContext.mode === 'auto' &&
                            currentDenialState &&
                            currentDenialState.consecutiveDenials > 0) {
                            newDenialState = (0, denialTracking_js_1.recordSuccess)(currentDenialState);
                            persistDenialState(context, newDenialState);
                        }
                    }
                    return [2 /*return*/, result];
                }
                if (!(result.behavior === 'ask')) return [3 /*break*/, 12];
                appState = context.getAppState();
                if (appState.toolPermissionContext.mode === 'dontAsk') {
                    return [2 /*return*/, {
                            behavior: 'deny',
                            decisionReason: {
                                type: 'mode',
                                mode: 'dontAsk',
                            },
                            message: (0, messages_js_1.DONT_ASK_REJECT_MESSAGE)(tool.name),
                        }];
                }
                if (!((0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER') &&
                    (appState.toolPermissionContext.mode === 'auto' ||
                        (appState.toolPermissionContext.mode === 'plan' &&
                            ((_b = autoModeStateModule === null || autoModeStateModule === void 0 ? void 0 : autoModeStateModule.isAutoModeActive()) !== null && _b !== void 0 ? _b : false))))) return [3 /*break*/, 10];
                // Non-classifier-approvable safetyCheck decisions stay immune to ALL
                // auto-approve paths: the acceptEdits fast-path, the safe-tool allowlist,
                // and the classifier. Step 1g only guards bypassPermissions; this guards
                // auto. classifierApprovable safetyChecks (sensitive-file paths) fall
                // through to the classifier — the fast-paths below naturally don't fire
                // because the tool's own checkPermissions still returns 'ask'.
                if (((_c = result.decisionReason) === null || _c === void 0 ? void 0 : _c.type) === 'safetyCheck' &&
                    !result.decisionReason.classifierApprovable) {
                    if (appState.toolPermissionContext.shouldAvoidPermissionPrompts) {
                        return [2 /*return*/, {
                                behavior: 'deny',
                                message: result.message,
                                decisionReason: {
                                    type: 'asyncAgent',
                                    reason: 'Safety check requires interactive approval and permission prompts are not available in this context',
                                },
                            }];
                    }
                    return [2 /*return*/, result];
                }
                if (((_d = tool.requiresUserInteraction) === null || _d === void 0 ? void 0 : _d.call(tool)) && result.behavior === 'ask') {
                    return [2 /*return*/, result];
                }
                denialState = (_f = (_e = context.localDenialTracking) !== null && _e !== void 0 ? _e : appState.denialTracking) !== null && _f !== void 0 ? _f : (0, denialTracking_js_1.createDenialTrackingState)();
                // PowerShell requires explicit user permission in auto mode unless
                // POWERSHELL_AUTO_MODE (ant-only build flag) is on. When disabled, this
                // guard keeps PS out of the classifier and skips the acceptEdits
                // fast-path below. When enabled, PS flows through to the classifier like
                // Bash — the classifier prompt gets POWERSHELL_DENY_GUIDANCE appended so
                // it recognizes `iex (iwr ...)` as download-and-execute, etc.
                // Note: this runs inside the behavior === 'ask' branch, so allow rules
                // that fire earlier (step 2b toolAlwaysAllowedRule, PS prefix allow)
                // return before reaching here. Allow-rule protection is handled by
                // permissionSetup.ts: isOverlyBroadPowerShellAllowRule strips PowerShell(*)
                // and isDangerousPowerShellPermission strips iex/pwsh/Start-Process
                // prefix rules for ant users and auto mode entry.
                if (tool.name === toolName_js_2.POWERSHELL_TOOL_NAME &&
                    !(0, bun_bundle_1.feature)('POWERSHELL_AUTO_MODE')) {
                    if (appState.toolPermissionContext.shouldAvoidPermissionPrompts) {
                        return [2 /*return*/, {
                                behavior: 'deny',
                                message: 'PowerShell tool requires interactive approval',
                                decisionReason: {
                                    type: 'asyncAgent',
                                    reason: 'PowerShell tool requires interactive approval and permission prompts are not available in this context',
                                },
                            }];
                    }
                    (0, debug_js_1.logForDebugging)("Skipping auto mode classifier for ".concat(tool.name, ": tool requires explicit user permission"));
                    return [2 /*return*/, result];
                }
                if (!(result.behavior === 'ask' &&
                    tool.name !== constants_js_1.AGENT_TOOL_NAME &&
                    tool.name !== constants_js_2.REPL_TOOL_NAME)) return [3 /*break*/, 5];
                _y.label = 2;
            case 2:
                _y.trys.push([2, 4, , 5]);
                parsedInput = tool.inputSchema.parse(input);
                return [4 /*yield*/, tool.checkPermissions(parsedInput, __assign(__assign({}, context), { getAppState: function () {
                            var state = context.getAppState();
                            return __assign(__assign({}, state), { toolPermissionContext: __assign(__assign({}, state.toolPermissionContext), { mode: 'acceptEdits' }) });
                        } }))];
            case 3:
                acceptEditsResult = _y.sent();
                if (acceptEditsResult.behavior === 'allow') {
                    newDenialState_1 = (0, denialTracking_js_1.recordSuccess)(denialState);
                    persistDenialState(context, newDenialState_1);
                    (0, debug_js_1.logForDebugging)("Skipping auto mode classifier for ".concat(tool.name, ": would be allowed in acceptEdits mode"));
                    (0, index_js_1.logEvent)('tengu_auto_mode_decision', {
                        decision: 'allowed',
                        toolName: (0, metadata_js_1.sanitizeToolNameForAnalytics)(tool.name),
                        inProtectedNamespace: (0, envUtils_js_1.isInProtectedNamespace)(),
                        // msg_id of the agent completion that produced this tool_use —
                        // the action at the bottom of the classifier transcript. Joins
                        // the decision back to the main agent's API response.
                        agentMsgId: assistantMessage.message
                            .id,
                        confidence: 'high',
                        fastPath: 'acceptEdits',
                    });
                    return [2 /*return*/, {
                            behavior: 'allow',
                            updatedInput: (_g = acceptEditsResult.updatedInput) !== null && _g !== void 0 ? _g : input,
                            decisionReason: {
                                type: 'mode',
                                mode: 'auto',
                            },
                        }];
                }
                return [3 /*break*/, 5];
            case 4:
                e_2 = _y.sent();
                if (e_2 instanceof errors_js_1.AbortError || e_2 instanceof sdk_1.APIUserAbortError) {
                    throw e_2;
                }
                return [3 /*break*/, 5];
            case 5:
                // Allowlisted tools are safe and don't need YOLO classification.
                // This uses the safe-tool allowlist to skip unnecessary classifier API calls.
                if (classifierDecisionModule.isAutoModeAllowlistedTool(tool.name)) {
                    newDenialState_2 = (0, denialTracking_js_1.recordSuccess)(denialState);
                    persistDenialState(context, newDenialState_2);
                    (0, debug_js_1.logForDebugging)("Skipping auto mode classifier for ".concat(tool.name, ": tool is on the safe allowlist"));
                    (0, index_js_1.logEvent)('tengu_auto_mode_decision', {
                        decision: 'allowed',
                        toolName: (0, metadata_js_1.sanitizeToolNameForAnalytics)(tool.name),
                        inProtectedNamespace: (0, envUtils_js_1.isInProtectedNamespace)(),
                        agentMsgId: assistantMessage.message
                            .id,
                        confidence: 'high',
                        fastPath: 'allowlist',
                    });
                    return [2 /*return*/, {
                            behavior: 'allow',
                            updatedInput: input,
                            decisionReason: {
                                type: 'mode',
                                mode: 'auto',
                            },
                        }];
                }
                action = (0, yoloClassifier_js_1.formatActionForClassifier)(tool.name, input);
                (0, classifierApprovals_js_1.setClassifierChecking)(toolUseID);
                classifierResult = void 0;
                _y.label = 6;
            case 6:
                _y.trys.push([6, , 8, 9]);
                return [4 /*yield*/, (0, yoloClassifier_js_1.classifyYoloAction)(context.messages, action, context.options.tools, appState.toolPermissionContext, context.abortController.signal)];
            case 7:
                classifierResult = _y.sent();
                return [3 /*break*/, 9];
            case 8:
                (0, classifierApprovals_js_1.clearClassifierChecking)(toolUseID);
                return [7 /*endfinally*/];
            case 9:
                // Notify ants when classifier error dumped prompts (will be in /share)
                if (process.env.USER_TYPE === 'ant' &&
                    classifierResult.errorDumpPath &&
                    context.addNotification) {
                    context.addNotification({
                        key: 'auto-mode-error-dump',
                        text: "Auto mode classifier error \u2014 prompts dumped to ".concat(classifierResult.errorDumpPath, " (included in /share)"),
                        priority: 'immediate',
                        color: 'error',
                    });
                }
                yoloDecision = classifierResult.unavailable
                    ? 'unavailable'
                    : classifierResult.shouldBlock
                        ? 'blocked'
                        : 'allowed';
                classifierCostUSD = classifierResult.usage && classifierResult.model
                    ? (0, modelCost_js_1.calculateCostFromTokens)(classifierResult.model, classifierResult.usage)
                    : undefined;
                (0, index_js_1.logEvent)('tengu_auto_mode_decision', {
                    decision: yoloDecision,
                    toolName: (0, metadata_js_1.sanitizeToolNameForAnalytics)(tool.name),
                    inProtectedNamespace: (0, envUtils_js_1.isInProtectedNamespace)(),
                    // msg_id of the agent completion that produced this tool_use —
                    // the action at the bottom of the classifier transcript.
                    agentMsgId: assistantMessage.message
                        .id,
                    classifierModel: classifierResult.model,
                    consecutiveDenials: classifierResult.shouldBlock
                        ? denialState.consecutiveDenials + 1
                        : 0,
                    totalDenials: classifierResult.shouldBlock
                        ? denialState.totalDenials + 1
                        : denialState.totalDenials,
                    // Overhead telemetry: token usage and latency for the classifier API call
                    classifierInputTokens: (_h = classifierResult.usage) === null || _h === void 0 ? void 0 : _h.inputTokens,
                    classifierOutputTokens: (_j = classifierResult.usage) === null || _j === void 0 ? void 0 : _j.outputTokens,
                    classifierCacheReadInputTokens: (_k = classifierResult.usage) === null || _k === void 0 ? void 0 : _k.cacheReadInputTokens,
                    classifierCacheCreationInputTokens: (_l = classifierResult.usage) === null || _l === void 0 ? void 0 : _l.cacheCreationInputTokens,
                    classifierDurationMs: classifierResult.durationMs,
                    // Character lengths of the prompt components sent to the classifier
                    classifierSystemPromptLength: (_m = classifierResult.promptLengths) === null || _m === void 0 ? void 0 : _m.systemPrompt,
                    classifierToolCallsLength: (_o = classifierResult.promptLengths) === null || _o === void 0 ? void 0 : _o.toolCalls,
                    classifierUserPromptsLength: (_p = classifierResult.promptLengths) === null || _p === void 0 ? void 0 : _p.userPrompts,
                    // Session totals at time of classifier call (for computing overhead %).
                    // These are main-transcript-only — sideQuery (used by the classifier)
                    // does NOT call addToTotalSessionCost, so classifier tokens are excluded.
                    sessionInputTokens: (0, state_js_1.getTotalInputTokens)(),
                    sessionOutputTokens: (0, state_js_1.getTotalOutputTokens)(),
                    sessionCacheReadInputTokens: (0, state_js_1.getTotalCacheReadInputTokens)(),
                    sessionCacheCreationInputTokens: (0, state_js_1.getTotalCacheCreationInputTokens)(),
                    classifierCostUSD: classifierCostUSD,
                    classifierStage: classifierResult.stage,
                    classifierStage1InputTokens: (_q = classifierResult.stage1Usage) === null || _q === void 0 ? void 0 : _q.inputTokens,
                    classifierStage1OutputTokens: (_r = classifierResult.stage1Usage) === null || _r === void 0 ? void 0 : _r.outputTokens,
                    classifierStage1CacheReadInputTokens: (_s = classifierResult.stage1Usage) === null || _s === void 0 ? void 0 : _s.cacheReadInputTokens,
                    classifierStage1CacheCreationInputTokens: (_t = classifierResult.stage1Usage) === null || _t === void 0 ? void 0 : _t.cacheCreationInputTokens,
                    classifierStage1DurationMs: classifierResult.stage1DurationMs,
                    classifierStage1RequestId: classifierResult.stage1RequestId,
                    classifierStage1MsgId: classifierResult.stage1MsgId,
                    classifierStage1CostUSD: classifierResult.stage1Usage && classifierResult.model
                        ? (0, modelCost_js_1.calculateCostFromTokens)(classifierResult.model, classifierResult.stage1Usage)
                        : undefined,
                    classifierStage2InputTokens: (_u = classifierResult.stage2Usage) === null || _u === void 0 ? void 0 : _u.inputTokens,
                    classifierStage2OutputTokens: (_v = classifierResult.stage2Usage) === null || _v === void 0 ? void 0 : _v.outputTokens,
                    classifierStage2CacheReadInputTokens: (_w = classifierResult.stage2Usage) === null || _w === void 0 ? void 0 : _w.cacheReadInputTokens,
                    classifierStage2CacheCreationInputTokens: (_x = classifierResult.stage2Usage) === null || _x === void 0 ? void 0 : _x.cacheCreationInputTokens,
                    classifierStage2DurationMs: classifierResult.stage2DurationMs,
                    classifierStage2RequestId: classifierResult.stage2RequestId,
                    classifierStage2MsgId: classifierResult.stage2MsgId,
                    classifierStage2CostUSD: classifierResult.stage2Usage && classifierResult.model
                        ? (0, modelCost_js_1.calculateCostFromTokens)(classifierResult.model, classifierResult.stage2Usage)
                        : undefined,
                });
                if (classifierResult.durationMs !== undefined) {
                    (0, state_js_1.addToTurnClassifierDuration)(classifierResult.durationMs);
                }
                if (classifierResult.shouldBlock) {
                    // Transcript exceeded the classifier's context window — deterministic
                    // error, won't recover on retry. Skip iron_gate and fall back to
                    // normal prompting so the user can approve/deny manually.
                    if (classifierResult.transcriptTooLong) {
                        if (appState.toolPermissionContext.shouldAvoidPermissionPrompts) {
                            // Permanent condition (transcript only grows) — deny-retry-deny
                            // wastes tokens without ever hitting the denial-limit abort.
                            throw new errors_js_1.AbortError('Agent aborted: auto mode classifier transcript exceeded context window in headless mode');
                        }
                        (0, debug_js_1.logForDebugging)('Auto mode classifier transcript too long, falling back to normal permission handling', { level: 'warn' });
                        return [2 /*return*/, __assign(__assign({}, result), { decisionReason: {
                                    type: 'other',
                                    reason: 'Auto mode classifier transcript exceeded context window — falling back to manual approval',
                                } })];
                    }
                    // When classifier is unavailable (API error), behavior depends on
                    // the tengu_iron_gate_closed gate.
                    if (classifierResult.unavailable) {
                        if ((0, growthbook_js_1.getFeatureValue_CACHED_WITH_REFRESH)('tengu_iron_gate_closed', true, CLASSIFIER_FAIL_CLOSED_REFRESH_MS)) {
                            (0, debug_js_1.logForDebugging)('Auto mode classifier unavailable, denying with retry guidance (fail closed)', { level: 'warn' });
                            return [2 /*return*/, {
                                    behavior: 'deny',
                                    decisionReason: {
                                        type: 'classifier',
                                        classifier: 'auto-mode',
                                        reason: 'Classifier unavailable',
                                    },
                                    message: (0, messages_js_1.buildClassifierUnavailableMessage)(tool.name, classifierResult.model),
                                }];
                        }
                        // Fail open: fall back to normal permission handling
                        (0, debug_js_1.logForDebugging)('Auto mode classifier unavailable, falling back to normal permission handling (fail open)', { level: 'warn' });
                        return [2 /*return*/, result];
                    }
                    newDenialState_3 = (0, denialTracking_js_1.recordDenial)(denialState);
                    persistDenialState(context, newDenialState_3);
                    (0, debug_js_1.logForDebugging)("Auto mode classifier blocked action: ".concat(classifierResult.reason), { level: 'warn' });
                    denialLimitResult = handleDenialLimitExceeded(newDenialState_3, appState, classifierResult.reason, assistantMessage, tool, result, context);
                    if (denialLimitResult) {
                        return [2 /*return*/, denialLimitResult];
                    }
                    return [2 /*return*/, {
                            behavior: 'deny',
                            decisionReason: {
                                type: 'classifier',
                                classifier: 'auto-mode',
                                reason: classifierResult.reason,
                            },
                            message: (0, messages_js_1.buildYoloRejectionMessage)(classifierResult.reason),
                        }];
                }
                newDenialState = (0, denialTracking_js_1.recordSuccess)(denialState);
                persistDenialState(context, newDenialState);
                return [2 /*return*/, {
                        behavior: 'allow',
                        updatedInput: input,
                        decisionReason: {
                            type: 'classifier',
                            classifier: 'auto-mode',
                            reason: classifierResult.reason,
                        },
                    }];
            case 10:
                if (!appState.toolPermissionContext.shouldAvoidPermissionPrompts) return [3 /*break*/, 12];
                return [4 /*yield*/, runPermissionRequestHooksForHeadlessAgent(tool, input, toolUseID, context, appState.toolPermissionContext.mode, result.suggestions)];
            case 11:
                hookDecision = _y.sent();
                if (hookDecision) {
                    return [2 /*return*/, hookDecision];
                }
                return [2 /*return*/, {
                        behavior: 'deny',
                        decisionReason: {
                            type: 'asyncAgent',
                            reason: 'Permission prompts are not available in this context',
                        },
                        message: (0, messages_js_1.AUTO_REJECT_MESSAGE)(tool.name),
                    }];
            case 12: return [2 /*return*/, result];
        }
    });
}); };
exports.hasPermissionsToUseTool = hasPermissionsToUseTool;
/**
 * Persist denial tracking state. For async subagents with localDenialTracking,
 * mutate the local state in place (since setAppState is a no-op). Otherwise,
 * write to appState as usual.
 */
function persistDenialState(context, newState) {
    if (context.localDenialTracking) {
        Object.assign(context.localDenialTracking, newState);
    }
    else {
        context.setAppState(function (prev) {
            // recordSuccess returns the same reference when state is
            // unchanged. Returning prev here lets store.setState's Object.is check
            // skip the listener loop entirely.
            if (prev.denialTracking === newState)
                return prev;
            return __assign(__assign({}, prev), { denialTracking: newState });
        });
    }
}
/**
 * Check if a denial limit was exceeded and return an 'ask' result
 * so the user can review. Returns null if no limit was hit.
 */
function handleDenialLimitExceeded(denialState, appState, classifierReason, assistantMessage, tool, result, context) {
    var _a;
    if (!(0, denialTracking_js_1.shouldFallbackToPrompting)(denialState)) {
        return null;
    }
    var hitTotalLimit = denialState.totalDenials >= denialTracking_js_1.DENIAL_LIMITS.maxTotal;
    var isHeadless = appState.toolPermissionContext.shouldAvoidPermissionPrompts;
    // Capture counts before persistDenialState, which may mutate denialState
    // in-place via Object.assign for subagents with localDenialTracking.
    var totalCount = denialState.totalDenials;
    var consecutiveCount = denialState.consecutiveDenials;
    var warning = hitTotalLimit
        ? "".concat(totalCount, " actions were blocked this session. Please review the transcript before continuing.")
        : "".concat(consecutiveCount, " consecutive actions were blocked. Please review the transcript before continuing.");
    (0, index_js_1.logEvent)('tengu_auto_mode_denial_limit_exceeded', {
        limit: (hitTotalLimit
            ? 'total'
            : 'consecutive'),
        mode: (isHeadless
            ? 'headless'
            : 'cli'),
        messageID: assistantMessage.message
            .id,
        consecutiveDenials: consecutiveCount,
        totalDenials: totalCount,
        toolName: (0, metadata_js_1.sanitizeToolNameForAnalytics)(tool.name),
    });
    if (isHeadless) {
        throw new errors_js_1.AbortError('Agent aborted: too many classifier denials in headless mode');
    }
    (0, debug_js_1.logForDebugging)("Classifier denial limit exceeded, falling back to prompting: ".concat(warning), { level: 'warn' });
    if (hitTotalLimit) {
        persistDenialState(context, __assign(__assign({}, denialState), { totalDenials: 0, consecutiveDenials: 0 }));
    }
    // Preserve the original classifier value (e.g. 'dangerous-agent-action')
    // so downstream analytics in interactiveHandler can log the correct
    // user override event.
    var originalClassifier = ((_a = result.decisionReason) === null || _a === void 0 ? void 0 : _a.type) === 'classifier'
        ? result.decisionReason.classifier
        : 'auto-mode';
    return __assign(__assign({}, result), { decisionReason: {
            type: 'classifier',
            classifier: originalClassifier,
            reason: "".concat(warning, "\n\nLatest blocked action: ").concat(classifierReason),
        } });
}
/**
 * Check only the rule-based steps of the permission pipeline — the subset
 * that bypassPermissions mode respects (everything that fires before step 2a).
 *
 * Returns a deny/ask decision if a rule blocks the tool, or null if no rule
 * objects. Unlike hasPermissionsToUseTool, this does NOT run the auto mode classifier,
 * mode-based transformations (dontAsk/auto/asyncAgent), PermissionRequest hooks,
 * or bypassPermissions / always-allowed checks.
 *
 * Caller must pre-check tool.requiresUserInteraction() — step 1e is not replicated.
 */
function checkRuleBasedPermissions(tool, input, context) {
    return __awaiter(this, void 0, void 0, function () {
        var appState, denyRule, askRule, canSandboxAutoAllow, toolPermissionResult, parsedInput, e_3;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    appState = context.getAppState();
                    denyRule = getDenyRuleForTool(appState.toolPermissionContext, tool);
                    if (denyRule) {
                        return [2 /*return*/, {
                                behavior: 'deny',
                                decisionReason: {
                                    type: 'rule',
                                    rule: denyRule,
                                },
                                message: "Permission to use ".concat(tool.name, " has been denied."),
                            }];
                    }
                    askRule = getAskRuleForTool(appState.toolPermissionContext, tool);
                    if (askRule) {
                        canSandboxAutoAllow = tool.name === toolName_js_1.BASH_TOOL_NAME &&
                            sandbox_adapter_js_1.SandboxManager.isSandboxingEnabled() &&
                            sandbox_adapter_js_1.SandboxManager.isAutoAllowBashIfSandboxedEnabled() &&
                            (0, shouldUseSandbox_js_1.shouldUseSandbox)(input);
                        if (!canSandboxAutoAllow) {
                            return [2 /*return*/, {
                                    behavior: 'ask',
                                    decisionReason: {
                                        type: 'rule',
                                        rule: askRule,
                                    },
                                    message: createPermissionRequestMessage(tool.name),
                                }];
                        }
                        // Fall through to let tool.checkPermissions handle command-specific rules
                    }
                    toolPermissionResult = {
                        behavior: 'passthrough',
                        message: createPermissionRequestMessage(tool.name),
                    };
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    parsedInput = tool.inputSchema.parse(input);
                    return [4 /*yield*/, tool.checkPermissions(parsedInput, context)];
                case 2:
                    toolPermissionResult = _c.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_3 = _c.sent();
                    if (e_3 instanceof errors_js_1.AbortError || e_3 instanceof sdk_1.APIUserAbortError) {
                        throw e_3;
                    }
                    (0, log_js_1.logError)(e_3);
                    return [3 /*break*/, 4];
                case 4:
                    // 1d. Tool implementation denied (catches bash subcommand denies wrapped
                    // in subcommandResults — no need to inspect decisionReason.type)
                    if ((toolPermissionResult === null || toolPermissionResult === void 0 ? void 0 : toolPermissionResult.behavior) === 'deny') {
                        return [2 /*return*/, toolPermissionResult];
                    }
                    // 1f. Content-specific ask rules from tool.checkPermissions
                    // (e.g. Bash(npm publish:*) → {ask, type:'rule', ruleBehavior:'ask'})
                    if ((toolPermissionResult === null || toolPermissionResult === void 0 ? void 0 : toolPermissionResult.behavior) === 'ask' &&
                        ((_a = toolPermissionResult.decisionReason) === null || _a === void 0 ? void 0 : _a.type) === 'rule' &&
                        toolPermissionResult.decisionReason.rule.ruleBehavior === 'ask') {
                        return [2 /*return*/, toolPermissionResult];
                    }
                    // 1g. Safety checks (e.g. .git/, .claude/, .vscode/, shell configs) are
                    // bypass-immune — they must prompt even when a PreToolUse hook returned
                    // allow. checkPathSafetyForAutoEdit returns {type:'safetyCheck'} for these.
                    if ((toolPermissionResult === null || toolPermissionResult === void 0 ? void 0 : toolPermissionResult.behavior) === 'ask' &&
                        ((_b = toolPermissionResult.decisionReason) === null || _b === void 0 ? void 0 : _b.type) === 'safetyCheck') {
                        return [2 /*return*/, toolPermissionResult];
                    }
                    // No rule-based objection
                    return [2 /*return*/, null];
            }
        });
    });
}
function hasPermissionsToUseToolInner(tool, input, context) {
    return __awaiter(this, void 0, void 0, function () {
        var appState, denyRule, askRule, canSandboxAutoAllow, toolPermissionResult, parsedInput, e_4, shouldBypassPermissions, alwaysAllowedRule, result;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (context.abortController.signal.aborted) {
                        throw new errors_js_1.AbortError();
                    }
                    appState = context.getAppState();
                    denyRule = getDenyRuleForTool(appState.toolPermissionContext, tool);
                    if (denyRule) {
                        return [2 /*return*/, {
                                behavior: 'deny',
                                decisionReason: {
                                    type: 'rule',
                                    rule: denyRule,
                                },
                                message: "Permission to use ".concat(tool.name, " has been denied."),
                            }];
                    }
                    askRule = getAskRuleForTool(appState.toolPermissionContext, tool);
                    if (askRule) {
                        canSandboxAutoAllow = tool.name === toolName_js_1.BASH_TOOL_NAME &&
                            sandbox_adapter_js_1.SandboxManager.isSandboxingEnabled() &&
                            sandbox_adapter_js_1.SandboxManager.isAutoAllowBashIfSandboxedEnabled() &&
                            (0, shouldUseSandbox_js_1.shouldUseSandbox)(input);
                        if (!canSandboxAutoAllow) {
                            return [2 /*return*/, {
                                    behavior: 'ask',
                                    decisionReason: {
                                        type: 'rule',
                                        rule: askRule,
                                    },
                                    message: createPermissionRequestMessage(tool.name),
                                }];
                        }
                        // Fall through to let Bash's checkPermissions handle command-specific rules
                    }
                    toolPermissionResult = {
                        behavior: 'passthrough',
                        message: createPermissionRequestMessage(tool.name),
                    };
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, , 4]);
                    parsedInput = tool.inputSchema.parse(input);
                    return [4 /*yield*/, tool.checkPermissions(parsedInput, context)];
                case 2:
                    toolPermissionResult = _d.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_4 = _d.sent();
                    // Rethrow abort errors so they propagate properly
                    if (e_4 instanceof errors_js_1.AbortError || e_4 instanceof sdk_1.APIUserAbortError) {
                        throw e_4;
                    }
                    (0, log_js_1.logError)(e_4);
                    return [3 /*break*/, 4];
                case 4:
                    // 1d. Tool implementation denied permission
                    if ((toolPermissionResult === null || toolPermissionResult === void 0 ? void 0 : toolPermissionResult.behavior) === 'deny') {
                        return [2 /*return*/, toolPermissionResult];
                    }
                    // 1e. Tool requires user interaction even in bypass mode
                    if (((_a = tool.requiresUserInteraction) === null || _a === void 0 ? void 0 : _a.call(tool)) &&
                        (toolPermissionResult === null || toolPermissionResult === void 0 ? void 0 : toolPermissionResult.behavior) === 'ask') {
                        return [2 /*return*/, toolPermissionResult];
                    }
                    // 1f. Content-specific ask rules from tool.checkPermissions take precedence
                    // over bypassPermissions mode. When a user explicitly configures a
                    // content-specific ask rule (e.g. Bash(npm publish:*)), the tool's
                    // checkPermissions returns {behavior:'ask', decisionReason:{type:'rule',
                    // rule:{ruleBehavior:'ask'}}}. This must be respected even in bypass mode,
                    // just as deny rules are respected at step 1d.
                    if ((toolPermissionResult === null || toolPermissionResult === void 0 ? void 0 : toolPermissionResult.behavior) === 'ask' &&
                        ((_b = toolPermissionResult.decisionReason) === null || _b === void 0 ? void 0 : _b.type) === 'rule' &&
                        toolPermissionResult.decisionReason.rule.ruleBehavior === 'ask') {
                        return [2 /*return*/, toolPermissionResult];
                    }
                    // 1g. Safety checks (e.g. .git/, .claude/, .vscode/, shell configs) are
                    // bypass-immune — they must prompt even in bypassPermissions mode.
                    // checkPathSafetyForAutoEdit returns {type:'safetyCheck'} for these paths.
                    if ((toolPermissionResult === null || toolPermissionResult === void 0 ? void 0 : toolPermissionResult.behavior) === 'ask' &&
                        ((_c = toolPermissionResult.decisionReason) === null || _c === void 0 ? void 0 : _c.type) === 'safetyCheck') {
                        return [2 /*return*/, toolPermissionResult];
                    }
                    // 2a. Check if mode allows the tool to run
                    // IMPORTANT: Call getAppState() to get the latest value
                    appState = context.getAppState();
                    shouldBypassPermissions = appState.toolPermissionContext.mode === 'bypassPermissions' ||
                        (appState.toolPermissionContext.mode === 'plan' &&
                            appState.toolPermissionContext.isBypassPermissionsModeAvailable);
                    if (shouldBypassPermissions) {
                        return [2 /*return*/, {
                                behavior: 'allow',
                                updatedInput: getUpdatedInputOrFallback(toolPermissionResult, input),
                                decisionReason: {
                                    type: 'mode',
                                    mode: appState.toolPermissionContext.mode,
                                },
                            }];
                    }
                    alwaysAllowedRule = toolAlwaysAllowedRule(appState.toolPermissionContext, tool);
                    if (alwaysAllowedRule) {
                        return [2 /*return*/, {
                                behavior: 'allow',
                                updatedInput: getUpdatedInputOrFallback(toolPermissionResult, input),
                                decisionReason: {
                                    type: 'rule',
                                    rule: alwaysAllowedRule,
                                },
                            }];
                    }
                    result = toolPermissionResult.behavior === 'passthrough'
                        ? __assign(__assign({}, toolPermissionResult), { behavior: 'ask', message: createPermissionRequestMessage(tool.name, toolPermissionResult.decisionReason) }) : toolPermissionResult;
                    if (result.behavior === 'ask' && result.suggestions) {
                        (0, debug_js_1.logForDebugging)("Permission suggestions for ".concat(tool.name, ": ").concat((0, slowOperations_js_1.jsonStringify)(result.suggestions, null, 2)));
                    }
                    return [2 /*return*/, result];
            }
        });
    });
}
/**
 * Delete a permission rule from the appropriate destination
 */
function deletePermissionRule(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var updatedContext, destination;
        var rule = _b.rule, initialContext = _b.initialContext, setToolPermissionContext = _b.setToolPermissionContext;
        return __generator(this, function (_c) {
            if (rule.source === 'policySettings' ||
                rule.source === 'flagSettings' ||
                rule.source === 'command') {
                throw new Error('Cannot delete permission rules from read-only settings');
            }
            updatedContext = (0, PermissionUpdate_js_1.applyPermissionUpdate)(initialContext, {
                type: 'removeRules',
                rules: [rule.ruleValue],
                behavior: rule.ruleBehavior,
                destination: rule.source,
            });
            destination = rule.source;
            switch (destination) {
                case 'localSettings':
                case 'userSettings':
                case 'projectSettings': {
                    // Note: Typescript doesn't know that rule conforms to `PermissionRuleFromEditableSettings` even when we switch on `rule.source`
                    (0, permissionsLoader_js_1.deletePermissionRuleFromSettings)(rule);
                    break;
                }
                case 'cliArg':
                case 'session': {
                    // No action needed for in-memory sources - not persisted to disk
                    break;
                }
            }
            // Update React state with updated context
            setToolPermissionContext(updatedContext);
            return [2 /*return*/];
        });
    });
}
/**
 * Helper to convert PermissionRule array to PermissionUpdate array
 */
function convertRulesToUpdates(rules, updateType) {
    // Group rules by source and behavior
    var grouped = new Map();
    for (var _i = 0, rules_2 = rules; _i < rules_2.length; _i++) {
        var rule = rules_2[_i];
        var key = "".concat(rule.source, ":").concat(rule.ruleBehavior);
        if (!grouped.has(key)) {
            grouped.set(key, []);
        }
        grouped.get(key).push(rule.ruleValue);
    }
    // Convert to PermissionUpdate array
    var updates = [];
    for (var _a = 0, grouped_1 = grouped; _a < grouped_1.length; _a++) {
        var _b = grouped_1[_a], key = _b[0], ruleValues = _b[1];
        var _c = key.split(':'), source = _c[0], behavior = _c[1];
        updates.push({
            type: updateType,
            rules: ruleValues,
            behavior: behavior,
            destination: source,
        });
    }
    return updates;
}
/**
 * Apply permission rules to context (additive - for initial setup)
 */
function applyPermissionRulesToPermissionContext(toolPermissionContext, rules) {
    var updates = convertRulesToUpdates(rules, 'addRules');
    return (0, PermissionUpdate_js_1.applyPermissionUpdates)(toolPermissionContext, updates);
}
/**
 * Sync permission rules from disk (replacement - for settings changes)
 */
function syncPermissionRulesFromDisk(toolPermissionContext, rules) {
    var context = toolPermissionContext;
    // When allowManagedPermissionRulesOnly is enabled, clear all non-policy sources
    if ((0, permissionsLoader_js_1.shouldAllowManagedPermissionRulesOnly)()) {
        var sourcesToClear = [
            'userSettings',
            'projectSettings',
            'localSettings',
            'cliArg',
            'session',
        ];
        var behaviors = ['allow', 'deny', 'ask'];
        for (var _i = 0, sourcesToClear_1 = sourcesToClear; _i < sourcesToClear_1.length; _i++) {
            var source = sourcesToClear_1[_i];
            for (var _a = 0, behaviors_1 = behaviors; _a < behaviors_1.length; _a++) {
                var behavior = behaviors_1[_a];
                context = (0, PermissionUpdate_js_1.applyPermissionUpdate)(context, {
                    type: 'replaceRules',
                    rules: [],
                    behavior: behavior,
                    destination: source,
                });
            }
        }
    }
    // Clear all disk-based source:behavior combos before applying new rules.
    // Without this, removing a rule from settings (e.g. deleting a deny entry)
    // would leave the old rule in the context because convertRulesToUpdates
    // only generates replaceRules for source:behavior pairs that have rules —
    // an empty group produces no update, so stale rules persist.
    var diskSources = [
        'userSettings',
        'projectSettings',
        'localSettings',
    ];
    for (var _b = 0, diskSources_1 = diskSources; _b < diskSources_1.length; _b++) {
        var diskSource = diskSources_1[_b];
        for (var _c = 0, _d = ['allow', 'deny', 'ask']; _c < _d.length; _c++) {
            var behavior = _d[_c];
            context = (0, PermissionUpdate_js_1.applyPermissionUpdate)(context, {
                type: 'replaceRules',
                rules: [],
                behavior: behavior,
                destination: diskSource,
            });
        }
    }
    var updates = convertRulesToUpdates(rules, 'replaceRules');
    return (0, PermissionUpdate_js_1.applyPermissionUpdates)(context, updates);
}
/**
 * Extract updatedInput from a permission result, falling back to the original input.
 * Handles the case where some PermissionResult variants don't have updatedInput.
 */
function getUpdatedInputOrFallback(permissionResult, fallback) {
    var _a;
    return ((_a = ('updatedInput' in permissionResult
        ? permissionResult.updatedInput
        : undefined)) !== null && _a !== void 0 ? _a : fallback);
}
