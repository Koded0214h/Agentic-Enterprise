"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AGENT_COLOR_TO_THEME_COLOR = exports.AGENT_COLORS = void 0;
exports.getAgentColor = getAgentColor;
exports.setAgentColor = setAgentColor;
var state_js_1 = require("../../bootstrap/state.js");
exports.AGENT_COLORS = [
    'red',
    'blue',
    'green',
    'yellow',
    'purple',
    'orange',
    'pink',
    'cyan',
];
exports.AGENT_COLOR_TO_THEME_COLOR = {
    red: 'red_FOR_SUBAGENTS_ONLY',
    blue: 'blue_FOR_SUBAGENTS_ONLY',
    green: 'green_FOR_SUBAGENTS_ONLY',
    yellow: 'yellow_FOR_SUBAGENTS_ONLY',
    purple: 'purple_FOR_SUBAGENTS_ONLY',
    orange: 'orange_FOR_SUBAGENTS_ONLY',
    pink: 'pink_FOR_SUBAGENTS_ONLY',
    cyan: 'cyan_FOR_SUBAGENTS_ONLY',
};
function getAgentColor(agentType) {
    if (agentType === 'general-purpose') {
        return undefined;
    }
    var agentColorMap = (0, state_js_1.getAgentColorMap)();
    // Check if color already assigned
    var existingColor = agentColorMap.get(agentType);
    if (existingColor && exports.AGENT_COLORS.includes(existingColor)) {
        return exports.AGENT_COLOR_TO_THEME_COLOR[existingColor];
    }
    return undefined;
}
function setAgentColor(agentType, color) {
    var agentColorMap = (0, state_js_1.getAgentColorMap)();
    if (!color) {
        agentColorMap.delete(agentType);
        return;
    }
    if (exports.AGENT_COLORS.includes(color)) {
        agentColorMap.set(agentType, color);
    }
}
