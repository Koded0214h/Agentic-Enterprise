"use strict";
/**
 * Shared utilities for displaying agent information.
 * Used by both the CLI `claude agents` handler and the interactive `/agents` command.
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
exports.AGENT_SOURCE_GROUPS = void 0;
exports.resolveAgentOverrides = resolveAgentOverrides;
exports.resolveAgentModelDisplay = resolveAgentModelDisplay;
exports.getOverrideSourceLabel = getOverrideSourceLabel;
exports.compareAgentsByName = compareAgentsByName;
var agent_js_1 = require("../../utils/model/agent.js");
var constants_js_1 = require("../../utils/settings/constants.js");
/**
 * Ordered list of agent source groups for display.
 * Both the CLI and interactive UI should use this to ensure consistent ordering.
 */
exports.AGENT_SOURCE_GROUPS = [
    { label: 'User agents', source: 'userSettings' },
    { label: 'Project agents', source: 'projectSettings' },
    { label: 'Local agents', source: 'localSettings' },
    { label: 'Managed agents', source: 'policySettings' },
    { label: 'Plugin agents', source: 'plugin' },
    { label: 'CLI arg agents', source: 'flagSettings' },
    { label: 'Built-in agents', source: 'built-in' },
];
/**
 * Annotate agents with override information by comparing against the active
 * (winning) agent list. An agent is "overridden" when another agent with the
 * same type from a higher-priority source takes precedence.
 *
 * Also deduplicates by (agentType, source) to handle git worktree duplicates
 * where the same agent file is loaded from both the worktree and main repo.
 */
function resolveAgentOverrides(allAgents, activeAgents) {
    var activeMap = new Map();
    for (var _i = 0, activeAgents_1 = activeAgents; _i < activeAgents_1.length; _i++) {
        var agent = activeAgents_1[_i];
        activeMap.set(agent.agentType, agent);
    }
    var seen = new Set();
    var resolved = [];
    // Iterate allAgents, annotating each with override info from activeAgents.
    // Deduplicate by (agentType, source) to handle git worktree duplicates.
    for (var _a = 0, allAgents_1 = allAgents; _a < allAgents_1.length; _a++) {
        var agent = allAgents_1[_a];
        var key = "".concat(agent.agentType, ":").concat(agent.source);
        if (seen.has(key))
            continue;
        seen.add(key);
        var active = activeMap.get(agent.agentType);
        var overriddenBy = active && active.source !== agent.source ? active.source : undefined;
        resolved.push(__assign(__assign({}, agent), { overriddenBy: overriddenBy }));
    }
    return resolved;
}
/**
 * Resolve the display model string for an agent.
 * Returns the model alias or 'inherit' for display purposes.
 */
function resolveAgentModelDisplay(agent) {
    var model = agent.model || (0, agent_js_1.getDefaultSubagentModel)();
    if (!model)
        return undefined;
    return model === 'inherit' ? 'inherit' : model;
}
/**
 * Get a human-readable label for the source that overrides an agent.
 * Returns lowercase, e.g. "user", "project", "managed".
 */
function getOverrideSourceLabel(source) {
    return (0, constants_js_1.getSourceDisplayName)(source).toLowerCase();
}
/**
 * Compare agents alphabetically by name (case-insensitive).
 */
function compareAgentsByName(a, b) {
    return a.agentType.localeCompare(b.agentType, undefined, {
        sensitivity: 'base',
    });
}
