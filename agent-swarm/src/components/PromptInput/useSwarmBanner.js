"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSwarmBanner = useSwarmBanner;
var React = require("react");
var AppState_js_1 = require("../../state/AppState.js");
var selectors_js_1 = require("../../state/selectors.js");
var agentColorManager_js_1 = require("../../tools/AgentTool/agentColorManager.js");
var standaloneAgent_js_1 = require("../../utils/standaloneAgent.js");
var detection_js_1 = require("../../utils/swarm/backends/detection.js");
var registry_js_1 = require("../../utils/swarm/backends/registry.js");
var constants_js_1 = require("../../utils/swarm/constants.js");
var teammate_js_1 = require("../../utils/teammate.js");
var teammateContext_js_1 = require("../../utils/teammateContext.js");
/**
 * Hook that returns banner information for swarm, standalone agent, or --agent CLI context.
 * - Leader (not in tmux): Returns "tmux -L ... attach" command with cyan background
 * - Leader (in tmux / in-process): Falls through to standalone-agent check — shows
 *   /rename name + /color background if set, else null
 * - Teammate: Returns "teammate@team" format with their assigned color background
 * - Viewing a background agent (CoordinatorTaskPanel): Returns agent name with its color
 * - Standalone agent: Returns agent name with their color background (no @team)
 * - --agent CLI flag: Returns "@agentName" with cyan background
 */
function useSwarmBanner() {
    var _a, _b, _c, _d;
    var teamContext = (0, AppState_js_1.useAppState)(function (s) { return s.teamContext; });
    var standaloneAgentContext = (0, AppState_js_1.useAppState)(function (s) { return s.standaloneAgentContext; });
    var agent = (0, AppState_js_1.useAppState)(function (s) { return s.agent; });
    // Subscribe so the banner updates on enter/exit teammate view even though
    // getActiveAgentForInput reads it from store.getState().
    (0, AppState_js_1.useAppState)(function (s) { return s.viewingAgentTaskId; });
    var store = (0, AppState_js_1.useAppStateStore)();
    var _e = React.useState(null), insideTmux = _e[0], setInsideTmux = _e[1];
    React.useEffect(function () {
        void (0, detection_js_1.isInsideTmux)().then(setInsideTmux);
    }, []);
    var state = store.getState();
    // Teammate process: show @agentName with assigned color.
    // In-process teammates run headless — their banner shows in the leader UI instead.
    if ((0, teammate_js_1.isTeammate)() && !(0, teammateContext_js_1.isInProcessTeammate)()) {
        var agentName = (0, teammate_js_1.getAgentName)();
        if (agentName && (0, teammate_js_1.getTeamName)()) {
            return {
                text: "@".concat(agentName),
                bgColor: toThemeColor((_a = teamContext === null || teamContext === void 0 ? void 0 : teamContext.selfAgentColor) !== null && _a !== void 0 ? _a : (0, teammate_js_1.getTeammateColor)()),
            };
        }
    }
    // Leader with spawned teammates: tmux-attach hint when external, else show
    // the viewed teammate's name when inside tmux / native panes / in-process.
    var hasTeammates = (teamContext === null || teamContext === void 0 ? void 0 : teamContext.teamName) &&
        teamContext.teammates &&
        Object.keys(teamContext.teammates).length > 0;
    if (hasTeammates) {
        var viewedTeammate = (0, selectors_js_1.getViewedTeammateTask)(state);
        var viewedColor = toThemeColor(viewedTeammate === null || viewedTeammate === void 0 ? void 0 : viewedTeammate.identity.color);
        var inProcessMode = (0, registry_js_1.isInProcessEnabled)();
        var nativePanes = (_c = (_b = (0, registry_js_1.getCachedDetectionResult)()) === null || _b === void 0 ? void 0 : _b.isNative) !== null && _c !== void 0 ? _c : false;
        if (insideTmux === false && !inProcessMode && !nativePanes) {
            return {
                text: "View teammates: `tmux -L ".concat((0, constants_js_1.getSwarmSocketName)(), " a`"),
                bgColor: viewedColor,
            };
        }
        if ((insideTmux === true || inProcessMode || nativePanes) &&
            viewedTeammate) {
            return {
                text: "@".concat(viewedTeammate.identity.agentName),
                bgColor: viewedColor,
            };
        }
        // insideTmux === null: still loading — fall through.
        // Not viewing a teammate: fall through so /rename and /color are honored.
    }
    // Viewing a background agent (CoordinatorTaskPanel): local_agent tasks aren't
    // InProcessTeammates, so getViewedTeammateTask misses them. Reverse-lookup the
    // name from agentNameRegistry the same way CoordinatorAgentStatus does.
    var active = (0, selectors_js_1.getActiveAgentForInput)(state);
    if (active.type === 'named_agent') {
        var task = active.task;
        var name_1;
        for (var _i = 0, _f = state.agentNameRegistry; _i < _f.length; _i++) {
            var _g = _f[_i], n = _g[0], id = _g[1];
            if (id === task.id) {
                name_1 = n;
                break;
            }
        }
        return {
            text: name_1 ? "@".concat(name_1) : task.description,
            bgColor: (_d = (0, agentColorManager_js_1.getAgentColor)(task.agentType)) !== null && _d !== void 0 ? _d : 'cyan_FOR_SUBAGENTS_ONLY',
        };
    }
    // Standalone agent (/rename, /color): name and/or custom color, no @team.
    var standaloneName = (0, standaloneAgent_js_1.getStandaloneAgentName)(state);
    var standaloneColor = standaloneAgentContext === null || standaloneAgentContext === void 0 ? void 0 : standaloneAgentContext.color;
    if (standaloneName || standaloneColor) {
        return {
            text: standaloneName !== null && standaloneName !== void 0 ? standaloneName : '',
            bgColor: toThemeColor(standaloneColor),
        };
    }
    // --agent CLI flag (when not handled above).
    if (agent) {
        var agentDef = state.agentDefinitions.activeAgents.find(function (a) { return a.agentType === agent; });
        return {
            text: agent,
            bgColor: toThemeColor(agentDef === null || agentDef === void 0 ? void 0 : agentDef.color, 'promptBorder'),
        };
    }
    return null;
}
function toThemeColor(colorName, fallback) {
    if (fallback === void 0) { fallback = 'cyan_FOR_SUBAGENTS_ONLY'; }
    return colorName && agentColorManager_js_1.AGENT_COLORS.includes(colorName)
        ? agentColorManager_js_1.AGENT_COLOR_TO_THEME_COLOR[colorName]
        : fallback;
}
