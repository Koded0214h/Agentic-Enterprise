"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuerySourceForAgent = getQuerySourceForAgent;
exports.getQuerySourceForREPL = getQuerySourceForREPL;
var outputStyles_js_1 = require("../constants/outputStyles.js");
var settings_js_1 = require("./settings/settings.js");
/**
 * Determines the prompt category for agent usage.
 * Used for analytics to track different agent patterns.
 *
 * @param agentType - The type/name of the agent
 * @param isBuiltInAgent - Whether this is a built-in agent or custom
 * @returns The agent prompt category string
 */
function getQuerySourceForAgent(agentType, isBuiltInAgent) {
    if (isBuiltInAgent) {
        // TODO: avoid this cast
        return agentType
            ? "agent:builtin:".concat(agentType)
            : 'agent:default';
    }
    else {
        return 'agent:custom';
    }
}
/**
 * Determines the prompt category based on output style settings.
 * Used for analytics to track different output style usage.
 *
 * @returns The prompt category string or undefined for default
 */
function getQuerySourceForREPL() {
    var _a;
    var settings = (0, settings_js_1.getSettings_DEPRECATED)();
    var style = (_a = settings === null || settings === void 0 ? void 0 : settings.outputStyle) !== null && _a !== void 0 ? _a : outputStyles_js_1.DEFAULT_OUTPUT_STYLE_NAME;
    if (style === outputStyles_js_1.DEFAULT_OUTPUT_STYLE_NAME) {
        return 'repl_main_thread';
    }
    // All styles in OUTPUT_STYLE_CONFIG are built-in
    var isBuiltIn = style in outputStyles_js_1.OUTPUT_STYLE_CONFIG;
    return isBuiltIn
        ? "repl_main_thread:outputStyle:".concat(style)
        : 'repl_main_thread:outputStyle:custom';
}
