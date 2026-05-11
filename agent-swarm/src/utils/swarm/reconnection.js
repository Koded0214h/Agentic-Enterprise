"use strict";
/**
 * Swarm Reconnection Module
 *
 * Handles initialization of swarm context for teammates.
 * - Fresh spawns: Initialize from CLI args (set in main.tsx via dynamicTeamContext)
 * - Resumed sessions: Initialize from teamName/agentName stored in the transcript
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeInitialTeamContext = computeInitialTeamContext;
exports.initializeTeammateContextFromSession = initializeTeammateContextFromSession;
var debug_js_1 = require("../debug.js");
var log_js_1 = require("../log.js");
var teammate_js_1 = require("../teammate.js");
var teamHelpers_js_1 = require("./teamHelpers.js");
/**
 * Computes the initial teamContext for AppState.
 *
 * This is called synchronously in main.tsx to compute the teamContext
 * BEFORE the first render, eliminating the need for useEffect workarounds.
 *
 * @returns The teamContext object to include in initialState, or undefined if not a teammate
 */
function computeInitialTeamContext() {
    // dynamicTeamContext is set in main.tsx from CLI args
    var context = (0, teammate_js_1.getDynamicTeamContext)();
    if (!(context === null || context === void 0 ? void 0 : context.teamName) || !(context === null || context === void 0 ? void 0 : context.agentName)) {
        (0, debug_js_1.logForDebugging)('[Reconnection] computeInitialTeamContext: No teammate context set (not a teammate)');
        return undefined;
    }
    var teamName = context.teamName, agentId = context.agentId, agentName = context.agentName;
    // Read team file to get lead agent ID
    var teamFile = (0, teamHelpers_js_1.readTeamFile)(teamName);
    if (!teamFile) {
        (0, log_js_1.logError)(new Error("[computeInitialTeamContext] Could not read team file for ".concat(teamName)));
        return undefined;
    }
    var teamFilePath = (0, teamHelpers_js_1.getTeamFilePath)(teamName);
    var isLeader = !agentId;
    (0, debug_js_1.logForDebugging)("[Reconnection] Computed initial team context for ".concat(isLeader ? 'leader' : "teammate ".concat(agentName), " in team ").concat(teamName));
    return {
        teamName: teamName,
        teamFilePath: teamFilePath,
        leadAgentId: teamFile.leadAgentId,
        selfAgentId: agentId,
        selfAgentName: agentName,
        isLeader: isLeader,
        teammates: {},
    };
}
/**
 * Initialize teammate context from a resumed session.
 *
 * This is called when resuming a session that has teamName/agentName stored
 * in the transcript. It sets up teamContext in AppState so that heartbeat
 * and other swarm features work correctly.
 */
function initializeTeammateContextFromSession(setAppState, teamName, agentName) {
    // Read team file to get lead agent ID
    var teamFile = (0, teamHelpers_js_1.readTeamFile)(teamName);
    if (!teamFile) {
        (0, log_js_1.logError)(new Error("[initializeTeammateContextFromSession] Could not read team file for ".concat(teamName, " (agent: ").concat(agentName, ")")));
        return;
    }
    // Find the member in the team file to get their agentId
    var member = teamFile.members.find(function (m) { return m.name === agentName; });
    if (!member) {
        (0, debug_js_1.logForDebugging)("[Reconnection] Member ".concat(agentName, " not found in team ").concat(teamName, " - may have been removed"));
    }
    var agentId = member === null || member === void 0 ? void 0 : member.agentId;
    var teamFilePath = (0, teamHelpers_js_1.getTeamFilePath)(teamName);
    // Set teamContext in AppState
    setAppState(function (prev) { return (__assign(__assign({}, prev), { teamContext: {
            teamName: teamName,
            teamFilePath: teamFilePath,
            leadAgentId: teamFile.leadAgentId,
            selfAgentId: agentId,
            selfAgentName: agentName,
            isLeader: false,
            teammates: {},
        } })); });
    (0, debug_js_1.logForDebugging)("[Reconnection] Initialized agent context from session for ".concat(agentName, " in team ").concat(teamName));
}
