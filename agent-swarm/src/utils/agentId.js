"use strict";
/**
 * Deterministic Agent ID System
 *
 * This module provides helper functions for formatting and parsing deterministic
 * agent IDs used in the swarm/teammate system.
 *
 * ## ID Formats
 *
 * **Agent IDs**: `agentName@teamName`
 * - Example: `team-lead@my-project`, `researcher@my-project`
 * - The @ symbol acts as a separator between agent name and team name
 *
 * **Request IDs**: `{requestType}-{timestamp}@{agentId}`
 * - Example: `shutdown-1702500000000@researcher@my-project`
 * - Used for shutdown requests, plan approvals, etc.
 *
 * ## Why Deterministic IDs?
 *
 * Deterministic IDs provide several benefits:
 *
 * 1. **Reproducibility**: The same agent spawned with the same name in the same team
 *    always gets the same ID, enabling reconnection after crashes/restarts.
 *
 * 2. **Human-readable**: IDs are meaningful and debuggable (e.g., `tester@my-project`).
 *
 * 3. **Predictable**: Team leads can compute a teammate's ID without looking it up,
 *    simplifying message routing and task assignment.
 *
 * ## Constraints
 *
 * - Agent names must NOT contain `@` (it's used as the separator)
 * - Use `sanitizeAgentName()` from TeammateTool.ts to strip @ from names
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatAgentId = formatAgentId;
exports.parseAgentId = parseAgentId;
exports.generateRequestId = generateRequestId;
exports.parseRequestId = parseRequestId;
/**
 * Formats an agent ID in the format `agentName@teamName`.
 */
function formatAgentId(agentName, teamName) {
    return "".concat(agentName, "@").concat(teamName);
}
/**
 * Parses an agent ID into its components.
 * Returns null if the ID doesn't contain the @ separator.
 */
function parseAgentId(agentId) {
    var atIndex = agentId.indexOf('@');
    if (atIndex === -1) {
        return null;
    }
    return {
        agentName: agentId.slice(0, atIndex),
        teamName: agentId.slice(atIndex + 1),
    };
}
/**
 * Formats a request ID in the format `{requestType}-{timestamp}@{agentId}`.
 */
function generateRequestId(requestType, agentId) {
    var timestamp = Date.now();
    return "".concat(requestType, "-").concat(timestamp, "@").concat(agentId);
}
/**
 * Parses a request ID into its components.
 * Returns null if the request ID doesn't match the expected format.
 */
function parseRequestId(requestId) {
    var atIndex = requestId.indexOf('@');
    if (atIndex === -1) {
        return null;
    }
    var prefix = requestId.slice(0, atIndex);
    var agentId = requestId.slice(atIndex + 1);
    var lastDashIndex = prefix.lastIndexOf('-');
    if (lastDashIndex === -1) {
        return null;
    }
    var requestType = prefix.slice(0, lastDashIndex);
    var timestampStr = prefix.slice(lastDashIndex + 1);
    var timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) {
        return null;
    }
    return { requestType: requestType, timestamp: timestamp, agentId: agentId };
}
