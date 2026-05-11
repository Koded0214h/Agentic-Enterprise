"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toInkColor = toInkColor;
var agentColorManager_js_1 = require("../tools/AgentTool/agentColorManager.js");
var DEFAULT_AGENT_THEME_COLOR = 'cyan_FOR_SUBAGENTS_ONLY';
/**
 * Convert a color string to Ink's TextProps['color'] format.
 * Colors are typically AgentColorName values like 'blue', 'green', etc.
 * This converts them to theme keys so they respect the current theme.
 * Falls back to the raw ANSI color if the color is not a known agent color.
 */
function toInkColor(color) {
    if (!color) {
        return DEFAULT_AGENT_THEME_COLOR;
    }
    // Try to map to a theme color if it's a known agent color
    var themeColor = agentColorManager_js_1.AGENT_COLOR_TO_THEME_COLOR[color];
    if (themeColor) {
        return themeColor;
    }
    // Fall back to raw ANSI color for unknown colors
    return "ansi:".concat(color);
}
