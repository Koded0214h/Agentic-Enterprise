"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLAN_MODE_REQUIRED_ENV_VAR = exports.TEAMMATE_COLOR_ENV_VAR = exports.TEAMMATE_COMMAND_ENV_VAR = exports.HIDDEN_SESSION_NAME = exports.TMUX_COMMAND = exports.SWARM_VIEW_WINDOW_NAME = exports.SWARM_SESSION_NAME = exports.TEAM_LEAD_NAME = void 0;
exports.getSwarmSocketName = getSwarmSocketName;
exports.TEAM_LEAD_NAME = 'team-lead';
exports.SWARM_SESSION_NAME = 'claude-swarm';
exports.SWARM_VIEW_WINDOW_NAME = 'swarm-view';
exports.TMUX_COMMAND = 'tmux';
exports.HIDDEN_SESSION_NAME = 'claude-hidden';
/**
 * Gets the socket name for external swarm sessions (when user is not in tmux).
 * Uses a separate socket to isolate swarm operations from user's tmux sessions.
 * Includes PID to ensure multiple Claude instances don't conflict.
 */
function getSwarmSocketName() {
    return "claude-swarm-".concat(process.pid);
}
/**
 * Environment variable to override the command used to spawn teammate instances.
 * If not set, defaults to process.execPath (the current Claude binary).
 * This allows customization for different environments or testing.
 */
exports.TEAMMATE_COMMAND_ENV_VAR = 'CLAUDE_CODE_TEAMMATE_COMMAND';
/**
 * Environment variable set on spawned teammates to indicate their assigned color.
 * Used for colored output and pane identification.
 */
exports.TEAMMATE_COLOR_ENV_VAR = 'CLAUDE_CODE_AGENT_COLOR';
/**
 * Environment variable set on spawned teammates to require plan mode before implementation.
 * When set to 'true', teammates must enter plan mode and get approval before writing code.
 */
exports.PLAN_MODE_REQUIRED_ENV_VAR = 'CLAUDE_CODE_PLAN_MODE_REQUIRED';
