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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExitPlanModeV2Tool = exports.outputSchema = exports._sdkInputSchema = void 0;
var bun_bundle_1 = require("bun:bundle");
var promises_1 = require("fs/promises");
var v4_1 = require("zod/v4");
var state_js_1 = require("../../bootstrap/state.js");
var index_js_1 = require("../../services/analytics/index.js");
var Tool_js_1 = require("../../Tool.js");
var agentId_js_1 = require("../../utils/agentId.js");
var agentSwarmsEnabled_js_1 = require("../../utils/agentSwarmsEnabled.js");
var debug_js_1 = require("../../utils/debug.js");
var inProcessTeammateHelpers_js_1 = require("../../utils/inProcessTeammateHelpers.js");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
var log_js_1 = require("../../utils/log.js");
var plans_js_1 = require("../../utils/plans.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var teammate_js_1 = require("../../utils/teammate.js");
var teammateMailbox_js_1 = require("../../utils/teammateMailbox.js");
var constants_js_1 = require("../AgentTool/constants.js");
var constants_js_2 = require("../TeamCreateTool/constants.js");
var constants_js_3 = require("./constants.js");
var prompt_js_1 = require("./prompt.js");
var UI_js_1 = require("./UI.js");
/* eslint-disable @typescript-eslint/no-require-imports */
var autoModeStateModule = (0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER')
    ? require('../../utils/permissions/autoModeState.js')
    : null;
var permissionSetupModule = (0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER')
    ? require('../../utils/permissions/permissionSetup.js')
    : null;
/* eslint-enable @typescript-eslint/no-require-imports */
/**
 * Schema for prompt-based permission requests.
 * Used by Claude to request semantic permissions when exiting plan mode.
 */
var allowedPromptSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        tool: v4_1.z.enum(['Bash']).describe('The tool this prompt applies to'),
        prompt: v4_1.z
            .string()
            .describe('Semantic description of the action, e.g. "run tests", "install dependencies"'),
    });
});
var inputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .strictObject({
        // Prompt-based permissions requested by the plan
        allowedPrompts: v4_1.z
            .array(allowedPromptSchema())
            .optional()
            .describe('Prompt-based permissions needed to implement the plan. These describe categories of actions rather than specific commands.'),
    })
        .passthrough();
});
/**
 * SDK-facing input schema - includes fields injected by normalizeToolInput.
 * The internal inputSchema doesn't have these fields because plan is read from disk,
 * but the SDK/hooks see the normalized version with plan and file path included.
 */
exports._sdkInputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return inputSchema().extend({
        plan: v4_1.z
            .string()
            .optional()
            .describe('The plan content (injected by normalizeToolInput from disk)'),
        planFilePath: v4_1.z
            .string()
            .optional()
            .describe('The plan file path (injected by normalizeToolInput)'),
    });
});
exports.outputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        plan: v4_1.z
            .string()
            .nullable()
            .describe('The plan that was presented to the user'),
        isAgent: v4_1.z.boolean(),
        filePath: v4_1.z
            .string()
            .optional()
            .describe('The file path where the plan was saved'),
        hasTaskTool: v4_1.z
            .boolean()
            .optional()
            .describe('Whether the Agent tool is available in the current context'),
        planWasEdited: v4_1.z
            .boolean()
            .optional()
            .describe('True when the user edited the plan (CCR web UI or Ctrl+G); determines whether the plan is echoed back in tool_result'),
        awaitingLeaderApproval: v4_1.z
            .boolean()
            .optional()
            .describe('When true, the teammate has sent a plan approval request to the team leader'),
        requestId: v4_1.z
            .string()
            .optional()
            .describe('Unique identifier for the plan approval request'),
    });
});
exports.ExitPlanModeV2Tool = (0, Tool_js_1.buildTool)({
    name: constants_js_3.EXIT_PLAN_MODE_V2_TOOL_NAME,
    searchHint: 'present plan for approval and start coding (plan mode only)',
    maxResultSizeChars: 100000,
    description: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, 'Prompts the user to exit plan mode and start coding'];
            });
        });
    },
    prompt: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, prompt_js_1.EXIT_PLAN_MODE_V2_TOOL_PROMPT];
            });
        });
    },
    get inputSchema() {
        return inputSchema();
    },
    get outputSchema() {
        return (0, exports.outputSchema)();
    },
    userFacingName: function () {
        return '';
    },
    shouldDefer: true,
    isEnabled: function () {
        // When --channels is active the user is likely on Telegram/Discord, not
        // watching the TUI. The plan-approval dialog would hang. Paired with the
        // same gate on EnterPlanMode so plan mode isn't a trap.
        if (((0, bun_bundle_1.feature)('KAIROS') || (0, bun_bundle_1.feature)('KAIROS_CHANNELS')) &&
            (0, state_js_1.getAllowedChannels)().length > 0) {
            return false;
        }
        return true;
    },
    isConcurrencySafe: function () {
        return true;
    },
    isReadOnly: function () {
        return false; // Now writes to disk
    },
    requiresUserInteraction: function () {
        // For ALL teammates, no local user interaction needed:
        // - If isPlanModeRequired(): team lead approves via mailbox
        // - Otherwise: exits locally without approval (voluntary plan mode)
        if ((0, teammate_js_1.isTeammate)()) {
            return false;
        }
        // For non-teammates, require user confirmation to exit plan mode
        return true;
    },
    validateInput: function (_input_1, _a) {
        return __awaiter(this, arguments, void 0, function (_input, _b) {
            var mode;
            var getAppState = _b.getAppState, options = _b.options;
            return __generator(this, function (_c) {
                // Teammate AppState may show leader's mode (runAgent.ts skips override in
                // acceptEdits/bypassPermissions/auto); isPlanModeRequired() is the real source
                if ((0, teammate_js_1.isTeammate)()) {
                    return [2 /*return*/, { result: true }];
                }
                mode = getAppState().toolPermissionContext.mode;
                if (mode !== 'plan') {
                    (0, index_js_1.logEvent)('tengu_exit_plan_mode_called_outside_plan', {
                        model: options.mainLoopModel,
                        mode: mode,
                        hasExitedPlanModeInSession: (0, state_js_1.hasExitedPlanModeInSession)(),
                    });
                    return [2 /*return*/, {
                            result: false,
                            message: 'You are not in plan mode. This tool is only for exiting plan mode after writing a plan. If your plan was already approved, continue with implementation.',
                            errorCode: 1,
                        }];
                }
                return [2 /*return*/, { result: true }];
            });
        });
    },
    checkPermissions: function (input, context) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // For ALL teammates, bypass the permission UI to avoid sending permission_request
                // The call() method handles the appropriate behavior:
                // - If isPlanModeRequired(): sends plan_approval_request to leader
                // - Otherwise: exits plan mode locally (voluntary plan mode)
                if ((0, teammate_js_1.isTeammate)()) {
                    return [2 /*return*/, {
                            behavior: 'allow',
                            updatedInput: input,
                        }];
                }
                // For non-teammates, require user confirmation to exit plan mode
                return [2 /*return*/, {
                        behavior: 'ask',
                        message: 'Exit plan mode?',
                        updatedInput: input,
                    }];
            });
        });
    },
    renderToolUseMessage: UI_js_1.renderToolUseMessage,
    renderToolResultMessage: UI_js_1.renderToolResultMessage,
    renderToolUseRejectedMessage: UI_js_1.renderToolUseRejectedMessage,
    call: function (input, context) {
        return __awaiter(this, void 0, void 0, function () {
            var isAgent, filePath, inputPlan, plan, agentName, teamName, requestId, approvalRequest, appState_1, agentTaskId, appState, gateFallbackNotification, prePlanRaw, reason, hasTaskTool;
            var _a, _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        isAgent = !!context.agentId;
                        filePath = (0, plans_js_1.getPlanFilePath)(context.agentId);
                        inputPlan = 'plan' in input && typeof input.plan === 'string' ? input.plan : undefined;
                        plan = inputPlan !== null && inputPlan !== void 0 ? inputPlan : (0, plans_js_1.getPlan)(context.agentId);
                        if (!(inputPlan !== undefined && filePath)) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0, promises_1.writeFile)(filePath, inputPlan, 'utf-8').catch(function (e) { return (0, log_js_1.logError)(e); })];
                    case 1:
                        _f.sent();
                        void (0, plans_js_1.persistFileSnapshotIfRemote)();
                        _f.label = 2;
                    case 2:
                        if (!((0, teammate_js_1.isTeammate)() && (0, teammate_js_1.isPlanModeRequired)())) return [3 /*break*/, 4];
                        // Plan is required for plan_mode_required teammates
                        if (!plan) {
                            throw new Error("No plan file found at ".concat(filePath, ". Please write your plan to this file before calling ExitPlanMode."));
                        }
                        agentName = (0, teammate_js_1.getAgentName)() || 'unknown';
                        teamName = (0, teammate_js_1.getTeamName)();
                        requestId = (0, agentId_js_1.generateRequestId)('plan_approval', (0, agentId_js_1.formatAgentId)(agentName, teamName || 'default'));
                        approvalRequest = {
                            type: 'plan_approval_request',
                            from: agentName,
                            timestamp: new Date().toISOString(),
                            planFilePath: filePath,
                            planContent: plan,
                            requestId: requestId,
                        };
                        return [4 /*yield*/, (0, teammateMailbox_js_1.writeToMailbox)('team-lead', {
                                from: agentName,
                                text: (0, slowOperations_js_1.jsonStringify)(approvalRequest),
                                timestamp: new Date().toISOString(),
                            }, teamName)
                            // Update task state to show awaiting approval (for in-process teammates)
                        ];
                    case 3:
                        _f.sent();
                        appState_1 = context.getAppState();
                        agentTaskId = (0, inProcessTeammateHelpers_js_1.findInProcessTeammateTaskId)(agentName, appState_1);
                        if (agentTaskId) {
                            (0, inProcessTeammateHelpers_js_1.setAwaitingPlanApproval)(agentTaskId, context.setAppState, true);
                        }
                        return [2 /*return*/, {
                                data: {
                                    plan: plan,
                                    isAgent: true,
                                    filePath: filePath,
                                    awaitingLeaderApproval: true,
                                    requestId: requestId,
                                },
                            }];
                    case 4:
                        appState = context.getAppState();
                        gateFallbackNotification = null;
                        if ((0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER')) {
                            prePlanRaw = (_a = appState.toolPermissionContext.prePlanMode) !== null && _a !== void 0 ? _a : 'default';
                            if (prePlanRaw === 'auto' &&
                                !((_b = permissionSetupModule === null || permissionSetupModule === void 0 ? void 0 : permissionSetupModule.isAutoModeGateEnabled()) !== null && _b !== void 0 ? _b : false)) {
                                reason = (_c = permissionSetupModule === null || permissionSetupModule === void 0 ? void 0 : permissionSetupModule.getAutoModeUnavailableReason()) !== null && _c !== void 0 ? _c : 'circuit-breaker';
                                gateFallbackNotification =
                                    (_d = permissionSetupModule === null || permissionSetupModule === void 0 ? void 0 : permissionSetupModule.getAutoModeUnavailableNotification(reason)) !== null && _d !== void 0 ? _d : 'auto mode unavailable';
                                (0, debug_js_1.logForDebugging)("[auto-mode gate @ ExitPlanModeV2Tool] prePlanMode=".concat(prePlanRaw, " ") +
                                    "but gate is off (reason=".concat(reason, ") \u2014 falling back to default on plan exit"), { level: 'warn' });
                            }
                        }
                        if (gateFallbackNotification) {
                            (_e = context.addNotification) === null || _e === void 0 ? void 0 : _e.call(context, {
                                key: 'auto-mode-gate-plan-exit-fallback',
                                text: "plan exit \u2192 default \u00B7 ".concat(gateFallbackNotification),
                                priority: 'immediate',
                                color: 'warning',
                                timeoutMs: 10000,
                            });
                        }
                        context.setAppState(function (prev) {
                            var _a, _b, _c, _d, _e;
                            if (prev.toolPermissionContext.mode !== 'plan')
                                return prev;
                            (0, state_js_1.setHasExitedPlanMode)(true);
                            (0, state_js_1.setNeedsPlanModeExitAttachment)(true);
                            var restoreMode = (_a = prev.toolPermissionContext.prePlanMode) !== null && _a !== void 0 ? _a : 'default';
                            if ((0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER')) {
                                if (restoreMode === 'auto' &&
                                    !((_b = permissionSetupModule === null || permissionSetupModule === void 0 ? void 0 : permissionSetupModule.isAutoModeGateEnabled()) !== null && _b !== void 0 ? _b : false)) {
                                    restoreMode = 'default';
                                }
                                var finalRestoringAuto = restoreMode === 'auto';
                                // Capture pre-restore state — isAutoModeActive() is the authoritative
                                // signal (prePlanMode/strippedDangerousRules are stale after
                                // transitionPlanAutoMode deactivates mid-plan).
                                var autoWasUsedDuringPlan = (_c = autoModeStateModule === null || autoModeStateModule === void 0 ? void 0 : autoModeStateModule.isAutoModeActive()) !== null && _c !== void 0 ? _c : false;
                                autoModeStateModule === null || autoModeStateModule === void 0 ? void 0 : autoModeStateModule.setAutoModeActive(finalRestoringAuto);
                                if (autoWasUsedDuringPlan && !finalRestoringAuto) {
                                    (0, state_js_1.setNeedsAutoModeExitAttachment)(true);
                                }
                            }
                            // If restoring to a non-auto mode and permissions were stripped (either
                            // from entering plan from auto, or from shouldPlanUseAutoMode),
                            // restore them. If restoring to auto, keep them stripped.
                            var restoringToAuto = restoreMode === 'auto';
                            var baseContext = prev.toolPermissionContext;
                            if (restoringToAuto) {
                                baseContext =
                                    (_d = permissionSetupModule === null || permissionSetupModule === void 0 ? void 0 : permissionSetupModule.stripDangerousPermissionsForAutoMode(baseContext)) !== null && _d !== void 0 ? _d : baseContext;
                            }
                            else if (prev.toolPermissionContext.strippedDangerousRules) {
                                baseContext =
                                    (_e = permissionSetupModule === null || permissionSetupModule === void 0 ? void 0 : permissionSetupModule.restoreDangerousPermissions(baseContext)) !== null && _e !== void 0 ? _e : baseContext;
                            }
                            return __assign(__assign({}, prev), { toolPermissionContext: __assign(__assign({}, baseContext), { mode: restoreMode, prePlanMode: undefined }) });
                        });
                        hasTaskTool = (0, agentSwarmsEnabled_js_1.isAgentSwarmsEnabled)() &&
                            context.options.tools.some(function (t) { return (0, Tool_js_1.toolMatchesName)(t, constants_js_1.AGENT_TOOL_NAME); });
                        return [2 /*return*/, {
                                data: {
                                    plan: plan,
                                    isAgent: isAgent,
                                    filePath: filePath,
                                    hasTaskTool: hasTaskTool || undefined,
                                    planWasEdited: inputPlan !== undefined || undefined,
                                },
                            }];
                }
            });
        });
    },
    mapToolResultToToolResultBlockParam: function (_a, toolUseID) {
        var isAgent = _a.isAgent, plan = _a.plan, filePath = _a.filePath, hasTaskTool = _a.hasTaskTool, planWasEdited = _a.planWasEdited, awaitingLeaderApproval = _a.awaitingLeaderApproval, requestId = _a.requestId;
        // Handle teammate awaiting leader approval
        if (awaitingLeaderApproval) {
            return {
                type: 'tool_result',
                content: "Your plan has been submitted to the team lead for approval.\n\nPlan file: ".concat(filePath, "\n\n**What happens next:**\n1. Wait for the team lead to review your plan\n2. You will receive a message in your inbox with approval/rejection\n3. If approved, you can proceed with implementation\n4. If rejected, refine your plan based on the feedback\n\n**Important:** Do NOT proceed until you receive approval. Check your inbox for response.\n\nRequest ID: ").concat(requestId),
                tool_use_id: toolUseID,
            };
        }
        if (isAgent) {
            return {
                type: 'tool_result',
                content: 'User has approved the plan. There is nothing else needed from you now. Please respond with "ok"',
                tool_use_id: toolUseID,
            };
        }
        // Handle empty plan
        if (!plan || plan.trim() === '') {
            return {
                type: 'tool_result',
                content: 'User has approved exiting plan mode. You can now proceed.',
                tool_use_id: toolUseID,
            };
        }
        var teamHint = hasTaskTool
            ? "\n\nIf this plan can be broken down into multiple independent tasks, consider using the ".concat(constants_js_2.TEAM_CREATE_TOOL_NAME, " tool to create a team and parallelize the work.")
            : '';
        // Always include the plan — extractApprovedPlan() in the Ultraplan CCR
        // flow parses the tool_result to retrieve the plan text for the local CLI.
        // Label edited plans so the model knows the user changed something.
        var planLabel = planWasEdited
            ? 'Approved Plan (edited by user)'
            : 'Approved Plan';
        return {
            type: 'tool_result',
            content: "User has approved your plan. You can now start coding. Start with updating your todo list if applicable\n\nYour plan has been saved to: ".concat(filePath, "\nYou can refer back to it if needed during implementation.").concat(teamHint, "\n\n## ").concat(planLabel, ":\n").concat(plan),
            tool_use_id: toolUseID,
        };
    },
});
