"use strict";
/**
 * Teammate utilities for agent swarm coordination
 *
 * These helpers identify whether this Claude Code instance is running as a
 * spawned teammate in a swarm. Teammates receive their identity via CLI
 * arguments (--agent-id, --team-name, etc.) which are stored in dynamicTeamContext.
 *
 * For in-process teammates (running in the same process), AsyncLocalStorage
 * provides isolated context per teammate, preventing concurrent overwrites.
 *
 * Priority order for identity resolution:
 * 1. AsyncLocalStorage (in-process teammates) - via teammateContext.ts
 * 2. dynamicTeamContext (tmux teammates via CLI args)
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
exports.runWithTeammateContext = exports.isInProcessTeammate = exports.getTeammateContext = exports.createTeammateContext = void 0;
exports.getParentSessionId = getParentSessionId;
exports.setDynamicTeamContext = setDynamicTeamContext;
exports.clearDynamicTeamContext = clearDynamicTeamContext;
exports.getDynamicTeamContext = getDynamicTeamContext;
exports.getAgentId = getAgentId;
exports.getAgentName = getAgentName;
exports.getTeamName = getTeamName;
exports.isTeammate = isTeammate;
exports.getTeammateColor = getTeammateColor;
exports.isPlanModeRequired = isPlanModeRequired;
exports.isTeamLead = isTeamLead;
exports.hasActiveInProcessTeammates = hasActiveInProcessTeammates;
exports.hasWorkingInProcessTeammates = hasWorkingInProcessTeammates;
exports.waitForTeammatesToBecomeIdle = waitForTeammatesToBecomeIdle;
// Re-export in-process teammate utilities from teammateContext.ts
var teammateContext_js_1 = require("./teammateContext.js");
Object.defineProperty(exports, "createTeammateContext", { enumerable: true, get: function () { return teammateContext_js_1.createTeammateContext; } });
Object.defineProperty(exports, "getTeammateContext", { enumerable: true, get: function () { return teammateContext_js_1.getTeammateContext; } });
Object.defineProperty(exports, "isInProcessTeammate", { enumerable: true, get: function () { return teammateContext_js_1.isInProcessTeammate; } });
Object.defineProperty(exports, "runWithTeammateContext", { enumerable: true, get: function () { return teammateContext_js_1.runWithTeammateContext; } });
var envUtils_js_1 = require("./envUtils.js");
var teammateContext_js_2 = require("./teammateContext.js");
/**
 * Returns the parent session ID for this teammate.
 * For in-process teammates, this is the team lead's session ID.
 * Priority: AsyncLocalStorage (in-process) > dynamicTeamContext (tmux teammates).
 */
function getParentSessionId() {
    var inProcessCtx = (0, teammateContext_js_2.getTeammateContext)();
    if (inProcessCtx)
        return inProcessCtx.parentSessionId;
    return dynamicTeamContext === null || dynamicTeamContext === void 0 ? void 0 : dynamicTeamContext.parentSessionId;
}
/**
 * Dynamic team context for runtime team joining.
 * When set, these values take precedence over environment variables.
 */
var dynamicTeamContext = null;
/**
 * Set the dynamic team context (called when joining a team at runtime)
 */
function setDynamicTeamContext(context) {
    dynamicTeamContext = context;
}
/**
 * Clear the dynamic team context (called when leaving a team)
 */
function clearDynamicTeamContext() {
    dynamicTeamContext = null;
}
/**
 * Get the current dynamic team context (for inspection/debugging)
 */
function getDynamicTeamContext() {
    return dynamicTeamContext;
}
/**
 * Returns the agent ID if this session is running as a teammate in a swarm,
 * or undefined if running as a standalone session.
 * Priority: AsyncLocalStorage (in-process) > dynamicTeamContext (tmux via CLI args).
 */
function getAgentId() {
    var inProcessCtx = (0, teammateContext_js_2.getTeammateContext)();
    if (inProcessCtx)
        return inProcessCtx.agentId;
    return dynamicTeamContext === null || dynamicTeamContext === void 0 ? void 0 : dynamicTeamContext.agentId;
}
/**
 * Returns the agent name if this session is running as a teammate in a swarm.
 * Priority: AsyncLocalStorage (in-process) > dynamicTeamContext (tmux via CLI args).
 */
function getAgentName() {
    var inProcessCtx = (0, teammateContext_js_2.getTeammateContext)();
    if (inProcessCtx)
        return inProcessCtx.agentName;
    return dynamicTeamContext === null || dynamicTeamContext === void 0 ? void 0 : dynamicTeamContext.agentName;
}
/**
 * Returns the team name if this session is part of a team.
 * Priority: AsyncLocalStorage (in-process) > dynamicTeamContext (tmux via CLI args) > passed teamContext.
 * Pass teamContext from AppState to support leaders who don't have dynamicTeamContext set.
 *
 * @param teamContext - Optional team context from AppState (for leaders)
 */
function getTeamName(teamContext) {
    var inProcessCtx = (0, teammateContext_js_2.getTeammateContext)();
    if (inProcessCtx)
        return inProcessCtx.teamName;
    if (dynamicTeamContext === null || dynamicTeamContext === void 0 ? void 0 : dynamicTeamContext.teamName)
        return dynamicTeamContext.teamName;
    return teamContext === null || teamContext === void 0 ? void 0 : teamContext.teamName;
}
/**
 * Returns true if this session is running as a teammate in a swarm.
 * Priority: AsyncLocalStorage (in-process) > dynamicTeamContext (tmux via CLI args).
 * For tmux teammates, requires BOTH an agent ID AND a team name.
 */
function isTeammate() {
    // In-process teammates run within the same process
    var inProcessCtx = (0, teammateContext_js_2.getTeammateContext)();
    if (inProcessCtx)
        return true;
    // Tmux teammates require both agent ID and team name
    return !!((dynamicTeamContext === null || dynamicTeamContext === void 0 ? void 0 : dynamicTeamContext.agentId) && (dynamicTeamContext === null || dynamicTeamContext === void 0 ? void 0 : dynamicTeamContext.teamName));
}
/**
 * Returns the teammate's assigned color,
 * or undefined if not running as a teammate or no color assigned.
 * Priority: AsyncLocalStorage (in-process) > dynamicTeamContext (tmux teammates).
 */
function getTeammateColor() {
    var inProcessCtx = (0, teammateContext_js_2.getTeammateContext)();
    if (inProcessCtx)
        return inProcessCtx.color;
    return dynamicTeamContext === null || dynamicTeamContext === void 0 ? void 0 : dynamicTeamContext.color;
}
/**
 * Returns true if this teammate session requires plan mode before implementation.
 * When enabled, the teammate must enter plan mode and get approval before writing code.
 * Priority: AsyncLocalStorage > dynamicTeamContext > env var.
 */
function isPlanModeRequired() {
    var inProcessCtx = (0, teammateContext_js_2.getTeammateContext)();
    if (inProcessCtx)
        return inProcessCtx.planModeRequired;
    if (dynamicTeamContext !== null) {
        return dynamicTeamContext.planModeRequired;
    }
    return (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_PLAN_MODE_REQUIRED);
}
/**
 * Check if this session is a team lead.
 *
 * A session is considered a team lead if:
 * 1. A team context exists with a leadAgentId, AND
 * 2. Either:
 *    - Our CLAUDE_CODE_AGENT_ID matches the leadAgentId, OR
 *    - We have no CLAUDE_CODE_AGENT_ID set (backwards compat: the original
 *      session that created the team before agent IDs were standardized)
 *
 * @param teamContext - The team context from AppState, if any
 * @returns true if this session is the team lead
 */
function isTeamLead(teamContext) {
    if (!(teamContext === null || teamContext === void 0 ? void 0 : teamContext.leadAgentId)) {
        return false;
    }
    // Use getAgentId() for AsyncLocalStorage support (in-process teammates)
    var myAgentId = getAgentId();
    var leadAgentId = teamContext.leadAgentId;
    // If my agent ID matches the lead agent ID, I'm the lead
    if (myAgentId === leadAgentId) {
        return true;
    }
    // Backwards compat: if no agent ID is set and we have a team context,
    // this is the original session that created the team (the lead)
    if (!myAgentId) {
        return true;
    }
    return false;
}
/**
 * Checks if there are any active in-process teammates running.
 * Used by headless/print mode to determine if we should wait for teammates
 * before exiting.
 */
function hasActiveInProcessTeammates(appState) {
    // Check for running in-process teammate tasks
    for (var _i = 0, _a = Object.values(appState.tasks); _i < _a.length; _i++) {
        var task = _a[_i];
        if (task.type === 'in_process_teammate' && task.status === 'running') {
            return true;
        }
    }
    return false;
}
/**
 * Checks if there are in-process teammates still actively working on tasks.
 * Returns true if any teammate is running but NOT idle (still processing).
 * Used to determine if we should wait before sending shutdown prompts.
 */
function hasWorkingInProcessTeammates(appState) {
    for (var _i = 0, _a = Object.values(appState.tasks); _i < _a.length; _i++) {
        var task = _a[_i];
        if (task.type === 'in_process_teammate' &&
            task.status === 'running' &&
            !task.isIdle) {
            return true;
        }
    }
    return false;
}
/**
 * Returns a promise that resolves when all working in-process teammates become idle.
 * Registers callbacks on each working teammate's task - they call these when idle.
 * Returns immediately if no teammates are working.
 */
function waitForTeammatesToBecomeIdle(setAppState, appState) {
    var workingTaskIds = [];
    for (var _i = 0, _a = Object.entries(appState.tasks); _i < _a.length; _i++) {
        var _b = _a[_i], taskId = _b[0], task = _b[1];
        if (task.type === 'in_process_teammate' &&
            task.status === 'running' &&
            !task.isIdle) {
            workingTaskIds.push(taskId);
        }
    }
    if (workingTaskIds.length === 0) {
        return Promise.resolve();
    }
    // Create a promise that resolves when all working teammates become idle
    return new Promise(function (resolve) {
        var remaining = workingTaskIds.length;
        var onIdle = function () {
            remaining--;
            if (remaining === 0) {
                // biome-ignore lint/nursery/noFloatingPromises: resolve is a callback, not a Promise
                resolve();
            }
        };
        // Register callback on each working teammate
        // Check current isIdle state to handle race where teammate became idle
        // between our initial snapshot and this callback registration
        setAppState(function (prev) {
            var _a;
            var newTasks = __assign({}, prev.tasks);
            for (var _i = 0, workingTaskIds_1 = workingTaskIds; _i < workingTaskIds_1.length; _i++) {
                var taskId = workingTaskIds_1[_i];
                var task = newTasks[taskId];
                if (task && task.type === 'in_process_teammate') {
                    // If task is already idle, call onIdle immediately
                    if (task.isIdle) {
                        onIdle();
                    }
                    else {
                        newTasks[taskId] = __assign(__assign({}, task), { onIdleCallbacks: __spreadArray(__spreadArray([], ((_a = task.onIdleCallbacks) !== null && _a !== void 0 ? _a : []), true), [onIdle], false) });
                    }
                }
            }
            return __assign(__assign({}, prev), { tasks: newTasks });
        });
    });
}
