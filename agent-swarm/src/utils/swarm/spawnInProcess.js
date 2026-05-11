"use strict";
/**
 * In-process teammate spawning
 *
 * Creates and registers an in-process teammate task. Unlike process-based
 * teammates (tmux/iTerm2), in-process teammates run in the same Node.js
 * process using AsyncLocalStorage for context isolation.
 *
 * The actual agent execution loop is handled by InProcessTeammateTask
 * component (Task #14). This module handles:
 * 1. Creating TeammateContext
 * 2. Creating linked AbortController
 * 3. Registering InProcessTeammateTaskState in AppState
 * 4. Returning spawn result for backend
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.spawnInProcessTeammate = spawnInProcessTeammate;
exports.killInProcessTeammate = killInProcessTeammate;
var sample_js_1 = require("lodash-es/sample.js");
var state_js_1 = require("../../bootstrap/state.js");
var spinnerVerbs_js_1 = require("../../constants/spinnerVerbs.js");
var turnCompletionVerbs_js_1 = require("../../constants/turnCompletionVerbs.js");
var Task_js_1 = require("../../Task.js");
var abortController_js_1 = require("../abortController.js");
var agentId_js_1 = require("../agentId.js");
var cleanupRegistry_js_1 = require("../cleanupRegistry.js");
var debug_js_1 = require("../debug.js");
var sdkEventQueue_js_1 = require("../sdkEventQueue.js");
var diskOutput_js_1 = require("../task/diskOutput.js");
var framework_js_1 = require("../task/framework.js");
var teammateContext_js_1 = require("../teammateContext.js");
var perfettoTracing_js_1 = require("../telemetry/perfettoTracing.js");
var teamHelpers_js_1 = require("./teamHelpers.js");
/**
 * Spawns an in-process teammate.
 *
 * Creates the teammate's context, registers the task in AppState, and returns
 * the spawn result. The actual agent execution is driven by the
 * InProcessTeammateTask component which uses runWithTeammateContext() to
 * execute the agent loop with proper identity isolation.
 *
 * @param config - Spawn configuration
 * @param context - Context with setAppState for registering task
 * @returns Spawn result with teammate info
 */
function spawnInProcessTeammate(config, context) {
    return __awaiter(this, void 0, void 0, function () {
        var name, teamName, prompt, color, planModeRequired, model, setAppState, agentId, taskId, abortController_1, parentSessionId, identity, teammateContext, description, taskState, unregisterCleanup, errorMessage;
        var _this = this;
        return __generator(this, function (_a) {
            name = config.name, teamName = config.teamName, prompt = config.prompt, color = config.color, planModeRequired = config.planModeRequired, model = config.model;
            setAppState = context.setAppState;
            agentId = (0, agentId_js_1.formatAgentId)(name, teamName);
            taskId = (0, Task_js_1.generateTaskId)('in_process_teammate');
            (0, debug_js_1.logForDebugging)("[spawnInProcessTeammate] Spawning ".concat(agentId, " (taskId: ").concat(taskId, ")"));
            try {
                abortController_1 = (0, abortController_js_1.createAbortController)();
                parentSessionId = (0, state_js_1.getSessionId)();
                identity = {
                    agentId: agentId,
                    agentName: name,
                    teamName: teamName,
                    color: color,
                    planModeRequired: planModeRequired,
                    parentSessionId: parentSessionId,
                };
                teammateContext = (0, teammateContext_js_1.createTeammateContext)({
                    agentId: agentId,
                    agentName: name,
                    teamName: teamName,
                    color: color,
                    planModeRequired: planModeRequired,
                    parentSessionId: parentSessionId,
                    abortController: abortController_1,
                });
                // Register agent in Perfetto trace for hierarchy visualization
                if ((0, perfettoTracing_js_1.isPerfettoTracingEnabled)()) {
                    (0, perfettoTracing_js_1.registerAgent)(agentId, name, parentSessionId);
                }
                description = "".concat(name, ": ").concat(prompt.substring(0, 50)).concat(prompt.length > 50 ? '...' : '');
                taskState = __assign(__assign({}, (0, Task_js_1.createTaskStateBase)(taskId, 'in_process_teammate', description, context.toolUseId)), { type: 'in_process_teammate', status: 'running', identity: identity, prompt: prompt, model: model, abortController: abortController_1, awaitingPlanApproval: false, spinnerVerb: (0, sample_js_1.default)((0, spinnerVerbs_js_1.getSpinnerVerbs)()), pastTenseVerb: (0, sample_js_1.default)(turnCompletionVerbs_js_1.TURN_COMPLETION_VERBS), permissionMode: planModeRequired ? 'plan' : 'default', isIdle: false, shutdownRequested: false, lastReportedToolCount: 0, lastReportedTokenCount: 0, pendingUserMessages: [], messages: [] });
                unregisterCleanup = (0, cleanupRegistry_js_1.registerCleanup)(function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        (0, debug_js_1.logForDebugging)("[spawnInProcessTeammate] Cleanup called for ".concat(agentId));
                        abortController_1.abort();
                        return [2 /*return*/];
                    });
                }); });
                taskState.unregisterCleanup = unregisterCleanup;
                // Register task in AppState
                (0, framework_js_1.registerTask)(taskState, setAppState);
                (0, debug_js_1.logForDebugging)("[spawnInProcessTeammate] Registered ".concat(agentId, " in AppState"));
                return [2 /*return*/, {
                        success: true,
                        agentId: agentId,
                        taskId: taskId,
                        abortController: abortController_1,
                        teammateContext: teammateContext,
                    }];
            }
            catch (error) {
                errorMessage = error instanceof Error ? error.message : 'Unknown error during spawn';
                (0, debug_js_1.logForDebugging)("[spawnInProcessTeammate] Failed to spawn ".concat(agentId, ": ").concat(errorMessage));
                return [2 /*return*/, {
                        success: false,
                        agentId: agentId,
                        error: errorMessage,
                    }];
            }
            return [2 /*return*/];
        });
    });
}
/**
 * Kills an in-process teammate by aborting its controller.
 *
 * Note: This is the implementation called by InProcessBackend.kill().
 *
 * @param taskId - Task ID of the teammate to kill
 * @param setAppState - AppState setter
 * @returns true if killed successfully
 */
function killInProcessTeammate(taskId, setAppState) {
    var killed = false;
    var teamName = null;
    var agentId = null;
    var toolUseId;
    var description;
    setAppState(function (prev) {
        var _a;
        var _b, _c, _d, _e;
        var task = prev.tasks[taskId];
        if (!task || task.type !== 'in_process_teammate') {
            return prev;
        }
        var teammateTask = task;
        if (teammateTask.status !== 'running') {
            return prev;
        }
        // Capture identity for cleanup after state update
        teamName = teammateTask.identity.teamName;
        agentId = teammateTask.identity.agentId;
        toolUseId = teammateTask.toolUseId;
        description = teammateTask.description;
        // Abort the controller to stop execution
        (_b = teammateTask.abortController) === null || _b === void 0 ? void 0 : _b.abort();
        // Call cleanup handler
        (_c = teammateTask.unregisterCleanup) === null || _c === void 0 ? void 0 : _c.call(teammateTask);
        // Update task state and remove from teamContext.teammates
        killed = true;
        // Call pending idle callbacks to unblock any waiters (e.g., engine.waitForIdle)
        (_d = teammateTask.onIdleCallbacks) === null || _d === void 0 ? void 0 : _d.forEach(function (cb) { return cb(); });
        // Remove from teamContext.teammates using the agentId
        var updatedTeamContext = prev.teamContext;
        if (prev.teamContext && prev.teamContext.teammates && agentId) {
            var _f = prev.teamContext.teammates, _g = agentId, _1 = _f[_g], remainingTeammates = __rest(_f, [typeof _g === "symbol" ? _g : _g + ""]);
            updatedTeamContext = __assign(__assign({}, prev.teamContext), { teammates: remainingTeammates });
        }
        return __assign(__assign({}, prev), { teamContext: updatedTeamContext, tasks: __assign(__assign({}, prev.tasks), (_a = {}, _a[taskId] = __assign(__assign({}, teammateTask), { status: 'killed', notified: true, endTime: Date.now(), onIdleCallbacks: [], messages: ((_e = teammateTask.messages) === null || _e === void 0 ? void 0 : _e.length)
                    ? [teammateTask.messages[teammateTask.messages.length - 1]]
                    : undefined, pendingUserMessages: [], inProgressToolUseIDs: undefined, abortController: undefined, unregisterCleanup: undefined, currentWorkAbortController: undefined }), _a)) });
    });
    // Remove from team file (outside state updater to avoid file I/O in callback)
    if (teamName && agentId) {
        (0, teamHelpers_js_1.removeMemberByAgentId)(teamName, agentId);
    }
    if (killed) {
        void (0, diskOutput_js_1.evictTaskOutput)(taskId);
        // notified:true was pre-set so no XML notification fires; close the SDK
        // task_started bookend directly. The in-process runner's own
        // completion/failure emit guards on status==='running' so it won't
        // double-emit after seeing status:killed.
        (0, sdkEventQueue_js_1.emitTaskTerminatedSdk)(taskId, 'stopped', {
            toolUseId: toolUseId,
            summary: description,
        });
        setTimeout(framework_js_1.evictTerminalTask.bind(null, taskId, setAppState), framework_js_1.STOPPED_DISPLAY_MS);
    }
    // Release perfetto agent registry entry
    if (agentId) {
        (0, perfettoTracing_js_1.unregisterAgent)(agentId);
    }
    return killed;
}
