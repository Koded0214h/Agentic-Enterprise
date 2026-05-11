"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ONE_SHOT_BUILTIN_AGENT_TYPES = exports.VERIFICATION_AGENT_TYPE = exports.LEGACY_AGENT_TOOL_NAME = exports.AGENT_TOOL_NAME = void 0;
exports.AGENT_TOOL_NAME = 'Agent';
// Legacy wire name for backward compat (permission rules, hooks, resumed sessions)
exports.LEGACY_AGENT_TOOL_NAME = 'Task';
exports.VERIFICATION_AGENT_TYPE = 'verification';
// Built-in agents that run once and return a report — the parent never
// SendMessages back to continue them. Skip the agentId/SendMessage/usage
// trailer for these to save tokens (~135 chars × 34M Explore runs/week).
exports.ONE_SHOT_BUILTIN_AGENT_TYPES = new Set([
    'Explore',
    'Plan',
]);
