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
exports.resumeAgentBackground = resumeAgentBackground;
var fs_1 = require("fs");
var state_js_1 = require("../../bootstrap/state.js");
var prompts_js_1 = require("../../constants/prompts.js");
var coordinatorMode_js_1 = require("../../coordinator/coordinatorMode.js");
var LocalAgentTask_js_1 = require("../../tasks/LocalAgentTask/LocalAgentTask.js");
var tools_js_1 = require("../../tools.js");
var ids_js_1 = require("../../types/ids.js");
var agentContext_js_1 = require("../../utils/agentContext.js");
var cwd_js_1 = require("../../utils/cwd.js");
var debug_js_1 = require("../../utils/debug.js");
var messages_js_1 = require("../../utils/messages.js");
var agent_js_1 = require("../../utils/model/agent.js");
var promptCategory_js_1 = require("../../utils/promptCategory.js");
var sessionStorage_js_1 = require("../../utils/sessionStorage.js");
var systemPrompt_js_1 = require("../../utils/systemPrompt.js");
var diskOutput_js_1 = require("../../utils/task/diskOutput.js");
var teammate_js_1 = require("../../utils/teammate.js");
var toolResultStorage_js_1 = require("../../utils/toolResultStorage.js");
var agentToolUtils_js_1 = require("./agentToolUtils.js");
var generalPurposeAgent_js_1 = require("./built-in/generalPurposeAgent.js");
var forkSubagent_js_1 = require("./forkSubagent.js");
var loadAgentsDir_js_1 = require("./loadAgentsDir.js");
var runAgent_js_1 = require("./runAgent.js");
function resumeAgentBackground(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var startTime, appState, rootSetAppState, permissionMode, _c, transcript, meta, resumedMessages, resumedReplacementState, resumedWorktreePath, _d, now, selectedAgent, isResumedFork, found, uiDescription, forkParentSystemPrompt, mainThreadAgentDefinition, additionalWorkingDirectories, defaultSystemPrompt, resolvedAgentModel, workerPermissionContext, workerTools, runAgentParams, agentBackgroundTask, metadata, asyncAgentContext, wrapWithCwd;
        var _this = this;
        var _e, _f, _g;
        var agentId = _b.agentId, prompt = _b.prompt, toolUseContext = _b.toolUseContext, canUseTool = _b.canUseTool, invokingRequestId = _b.invokingRequestId;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    startTime = Date.now();
                    appState = toolUseContext.getAppState();
                    rootSetAppState = (_e = toolUseContext.setAppStateForTasks) !== null && _e !== void 0 ? _e : toolUseContext.setAppState;
                    permissionMode = appState.toolPermissionContext.mode;
                    return [4 /*yield*/, Promise.all([
                            (0, sessionStorage_js_1.getAgentTranscript)((0, ids_js_1.asAgentId)(agentId)),
                            (0, sessionStorage_js_1.readAgentMetadata)((0, ids_js_1.asAgentId)(agentId)),
                        ])];
                case 1:
                    _c = _h.sent(), transcript = _c[0], meta = _c[1];
                    if (!transcript) {
                        throw new Error("No transcript found for agent ID: ".concat(agentId));
                    }
                    resumedMessages = (0, messages_js_1.filterWhitespaceOnlyAssistantMessages)((0, messages_js_1.filterOrphanedThinkingOnlyMessages)((0, messages_js_1.filterUnresolvedToolUses)(transcript.messages)));
                    resumedReplacementState = (0, toolResultStorage_js_1.reconstructForSubagentResume)(toolUseContext.contentReplacementState, resumedMessages, transcript.contentReplacements);
                    if (!(meta === null || meta === void 0 ? void 0 : meta.worktreePath)) return [3 /*break*/, 3];
                    return [4 /*yield*/, fs_1.promises.stat(meta.worktreePath).then(function (s) { return (s.isDirectory() ? meta.worktreePath : undefined); }, function () {
                            (0, debug_js_1.logForDebugging)("Resumed worktree ".concat(meta.worktreePath, " no longer exists; falling back to parent cwd"));
                            return undefined;
                        })];
                case 2:
                    _d = _h.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _d = undefined;
                    _h.label = 4;
                case 4:
                    resumedWorktreePath = _d;
                    if (!resumedWorktreePath) return [3 /*break*/, 6];
                    now = new Date();
                    return [4 /*yield*/, fs_1.promises.utimes(resumedWorktreePath, now, now)];
                case 5:
                    _h.sent();
                    _h.label = 6;
                case 6:
                    isResumedFork = false;
                    if ((meta === null || meta === void 0 ? void 0 : meta.agentType) === forkSubagent_js_1.FORK_AGENT.agentType) {
                        selectedAgent = forkSubagent_js_1.FORK_AGENT;
                        isResumedFork = true;
                    }
                    else if (meta === null || meta === void 0 ? void 0 : meta.agentType) {
                        found = toolUseContext.options.agentDefinitions.activeAgents.find(function (a) { return a.agentType === meta.agentType; });
                        selectedAgent = found !== null && found !== void 0 ? found : generalPurposeAgent_js_1.GENERAL_PURPOSE_AGENT;
                    }
                    else {
                        selectedAgent = generalPurposeAgent_js_1.GENERAL_PURPOSE_AGENT;
                    }
                    uiDescription = (_f = meta === null || meta === void 0 ? void 0 : meta.description) !== null && _f !== void 0 ? _f : '(resumed)';
                    if (!isResumedFork) return [3 /*break*/, 10];
                    if (!toolUseContext.renderedSystemPrompt) return [3 /*break*/, 7];
                    forkParentSystemPrompt = toolUseContext.renderedSystemPrompt;
                    return [3 /*break*/, 9];
                case 7:
                    mainThreadAgentDefinition = appState.agent
                        ? appState.agentDefinitions.activeAgents.find(function (a) { return a.agentType === appState.agent; })
                        : undefined;
                    additionalWorkingDirectories = Array.from(appState.toolPermissionContext.additionalWorkingDirectories.keys());
                    return [4 /*yield*/, (0, prompts_js_1.getSystemPrompt)(toolUseContext.options.tools, toolUseContext.options.mainLoopModel, additionalWorkingDirectories, toolUseContext.options.mcpClients)];
                case 8:
                    defaultSystemPrompt = _h.sent();
                    forkParentSystemPrompt = (0, systemPrompt_js_1.buildEffectiveSystemPrompt)({
                        mainThreadAgentDefinition: mainThreadAgentDefinition,
                        toolUseContext: toolUseContext,
                        customSystemPrompt: toolUseContext.options.customSystemPrompt,
                        defaultSystemPrompt: defaultSystemPrompt,
                        appendSystemPrompt: toolUseContext.options.appendSystemPrompt,
                    });
                    _h.label = 9;
                case 9:
                    if (!forkParentSystemPrompt) {
                        throw new Error('Cannot resume fork agent: unable to reconstruct parent system prompt');
                    }
                    _h.label = 10;
                case 10:
                    resolvedAgentModel = (0, agent_js_1.getAgentModel)(selectedAgent.model, toolUseContext.options.mainLoopModel, undefined, permissionMode);
                    workerPermissionContext = __assign(__assign({}, appState.toolPermissionContext), { mode: (_g = selectedAgent.permissionMode) !== null && _g !== void 0 ? _g : 'acceptEdits' });
                    workerTools = isResumedFork
                        ? toolUseContext.options.tools
                        : (0, tools_js_1.assembleToolPool)(workerPermissionContext, appState.mcp.tools);
                    runAgentParams = __assign(__assign({ agentDefinition: selectedAgent, promptMessages: __spreadArray(__spreadArray([], resumedMessages, true), [
                            (0, messages_js_1.createUserMessage)({ content: prompt }),
                        ], false), toolUseContext: toolUseContext, canUseTool: canUseTool, isAsync: true, querySource: (0, promptCategory_js_1.getQuerySourceForAgent)(selectedAgent.agentType, (0, loadAgentsDir_js_1.isBuiltInAgent)(selectedAgent)), model: undefined, 
                        // Fork resume: pass parent's system prompt (cache-identical prefix).
                        // Non-fork: undefined → runAgent recomputes under wrapWithCwd so
                        // getCwd() sees resumedWorktreePath.
                        override: isResumedFork
                            ? { systemPrompt: forkParentSystemPrompt }
                            : undefined, availableTools: workerTools, 
                        // Transcript already contains the parent context slice from the
                        // original fork. Re-supplying it would cause duplicate tool_use IDs.
                        forkContextMessages: undefined }, (isResumedFork && { useExactTools: true })), { 
                        // Re-persist so metadata survives runAgent's writeAgentMetadata overwrite
                        worktreePath: resumedWorktreePath, description: meta === null || meta === void 0 ? void 0 : meta.description, contentReplacementState: resumedReplacementState });
                    agentBackgroundTask = (0, LocalAgentTask_js_1.registerAsyncAgent)({
                        agentId: agentId,
                        description: uiDescription,
                        prompt: prompt,
                        selectedAgent: selectedAgent,
                        setAppState: rootSetAppState,
                        toolUseId: toolUseContext.toolUseId,
                    });
                    metadata = {
                        prompt: prompt,
                        resolvedAgentModel: resolvedAgentModel,
                        isBuiltInAgent: (0, loadAgentsDir_js_1.isBuiltInAgent)(selectedAgent),
                        startTime: startTime,
                        agentType: selectedAgent.agentType,
                        isAsync: true,
                    };
                    asyncAgentContext = {
                        agentId: agentId,
                        parentSessionId: (0, teammate_js_1.getParentSessionId)(),
                        agentType: 'subagent',
                        subagentName: selectedAgent.agentType,
                        isBuiltIn: (0, loadAgentsDir_js_1.isBuiltInAgent)(selectedAgent),
                        invokingRequestId: invokingRequestId,
                        invocationKind: 'resume',
                        invocationEmitted: false,
                    };
                    wrapWithCwd = function (fn) {
                        return resumedWorktreePath ? (0, cwd_js_1.runWithCwdOverride)(resumedWorktreePath, fn) : fn();
                    };
                    void (0, agentContext_js_1.runWithAgentContext)(asyncAgentContext, function () {
                        return wrapWithCwd(function () {
                            return (0, agentToolUtils_js_1.runAsyncAgentLifecycle)({
                                taskId: agentBackgroundTask.agentId,
                                abortController: agentBackgroundTask.abortController,
                                makeStream: function (onCacheSafeParams) {
                                    return (0, runAgent_js_1.runAgent)(__assign(__assign({}, runAgentParams), { override: __assign(__assign({}, runAgentParams.override), { agentId: (0, ids_js_1.asAgentId)(agentBackgroundTask.agentId), abortController: agentBackgroundTask.abortController }), onCacheSafeParams: onCacheSafeParams }));
                                },
                                metadata: metadata,
                                description: uiDescription,
                                toolUseContext: toolUseContext,
                                rootSetAppState: rootSetAppState,
                                agentIdForCleanup: agentId,
                                enableSummarization: (0, coordinatorMode_js_1.isCoordinatorMode)() ||
                                    (0, forkSubagent_js_1.isForkSubagentEnabled)() ||
                                    (0, state_js_1.getSdkAgentProgressSummariesEnabled)(),
                                getWorktreeResult: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                    return [2 /*return*/, resumedWorktreePath ? { worktreePath: resumedWorktreePath } : {}];
                                }); }); },
                            });
                        });
                    });
                    return [2 /*return*/, {
                            agentId: agentId,
                            description: uiDescription,
                            outputFile: (0, diskOutput_js_1.getTaskOutputPath)(agentId),
                        }];
            }
        });
    });
}
