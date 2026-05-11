"use strict";
/**
 * Branded types for session and agent IDs.
 * These prevent accidentally mixing up session IDs and agent IDs at compile time.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.asSessionId = asSessionId;
exports.asAgentId = asAgentId;
exports.toAgentId = toAgentId;
/**
 * Cast a raw string to SessionId.
 * Use sparingly - prefer getSessionId() when possible.
 */
function asSessionId(id) {
    return id;
}
/**
 * Cast a raw string to AgentId.
 * Use sparingly - prefer createAgentId() when possible.
 */
function asAgentId(id) {
    return id;
}
var AGENT_ID_PATTERN = /^a(?:.+-)?[0-9a-f]{16}$/;
/**
 * Validate and brand a string as AgentId.
 * Matches the format produced by createAgentId(): `a` + optional `<label>-` + 16 hex chars.
 * Returns null if the string doesn't match (e.g. teammate names, team-addressing).
 */
function toAgentId(s) {
    return AGENT_ID_PATTERN.test(s) ? s : null;
}
