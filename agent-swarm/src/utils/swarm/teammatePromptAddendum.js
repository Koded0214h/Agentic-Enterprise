"use strict";
/**
 * Teammate-specific system prompt addendum.
 *
 * This is appended to the full main agent system prompt for teammates.
 * It explains visibility constraints and communication requirements.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEAMMATE_SYSTEM_PROMPT_ADDENDUM = void 0;
exports.TEAMMATE_SYSTEM_PROMPT_ADDENDUM = "\n# Agent Teammate Communication\n\nIMPORTANT: You are running as an agent in a team. To communicate with anyone on your team:\n- Use the SendMessage tool with `to: \"<name>\"` to send messages to specific teammates\n- Use the SendMessage tool with `to: \"*\"` sparingly for team-wide broadcasts\n\nJust writing a response in text is not visible to others on your team - you MUST use the SendMessage tool.\n\nThe user interacts primarily with the team lead. Your work is coordinated through the task system and teammate messaging.\n";
