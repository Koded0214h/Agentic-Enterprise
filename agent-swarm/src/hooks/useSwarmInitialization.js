"use strict";
/**
 * Swarm Initialization Hook
 *
 * Initializes swarm features: teammate hooks and context.
 * Handles both fresh spawns and resumed teammate sessions.
 *
 * This hook is conditionally loaded to allow dead code elimination when swarms are disabled.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSwarmInitialization = useSwarmInitialization;
var react_1 = require("react");
var state_js_1 = require("../bootstrap/state.js");
var agentSwarmsEnabled_js_1 = require("../utils/agentSwarmsEnabled.js");
var reconnection_js_1 = require("../utils/swarm/reconnection.js");
var teamHelpers_js_1 = require("../utils/swarm/teamHelpers.js");
var teammateInit_js_1 = require("../utils/swarm/teammateInit.js");
var teammate_js_1 = require("../utils/teammate.js");
/**
 * Hook that initializes swarm features when ENABLE_AGENT_SWARMS is true.
 *
 * Handles both:
 * - Resumed teammate sessions (from --resume or /resume) where teamName/agentName
 *   are stored in transcript messages
 * - Fresh spawns where context is read from environment variables
 */
function useSwarmInitialization(setAppState, initialMessages, _a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.enabled, enabled = _c === void 0 ? true : _c;
    (0, react_1.useEffect)(function () {
        if (!enabled)
            return;
        if ((0, agentSwarmsEnabled_js_1.isAgentSwarmsEnabled)()) {
            // Check if this is a resumed agent session (from --resume or /resume)
            // Resumed sessions have teamName/agentName stored in transcript messages
            var firstMessage = initialMessages === null || initialMessages === void 0 ? void 0 : initialMessages[0];
            var teamName = firstMessage && 'teamName' in firstMessage
                ? firstMessage.teamName
                : undefined;
            var agentName_1 = firstMessage && 'agentName' in firstMessage
                ? firstMessage.agentName
                : undefined;
            if (teamName && agentName_1) {
                // Resumed agent session - set up team context from stored info
                (0, reconnection_js_1.initializeTeammateContextFromSession)(setAppState, teamName, agentName_1);
                // Get agentId from team file for hook initialization
                var teamFile = (0, teamHelpers_js_1.readTeamFile)(teamName);
                var member = teamFile === null || teamFile === void 0 ? void 0 : teamFile.members.find(function (m) { return m.name === agentName_1; });
                if (member) {
                    (0, teammateInit_js_1.initializeTeammateHooks)(setAppState, (0, state_js_1.getSessionId)(), {
                        teamName: teamName,
                        agentId: member.agentId,
                        agentName: agentName_1,
                    });
                }
            }
            else {
                // Fresh spawn or standalone session
                // teamContext is already computed in main.tsx via computeInitialTeamContext()
                // and included in initialState, so we only need to initialize hooks here
                var context = teammate_js_1.getDynamicTeamContext === null || teammate_js_1.getDynamicTeamContext === void 0 ? void 0 : (0, teammate_js_1.getDynamicTeamContext)();
                if ((context === null || context === void 0 ? void 0 : context.teamName) && (context === null || context === void 0 ? void 0 : context.agentId) && (context === null || context === void 0 ? void 0 : context.agentName)) {
                    (0, teammateInit_js_1.initializeTeammateHooks)(setAppState, (0, state_js_1.getSessionId)(), {
                        teamName: context.teamName,
                        agentId: context.agentId,
                        agentName: context.agentName,
                    });
                }
            }
        }
    }, [setAppState, initialMessages, enabled]);
}
