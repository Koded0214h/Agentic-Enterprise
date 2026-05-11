"use strict";
/**
 * Team Discovery - Utilities for discovering teams and teammate status
 *
 * Scans ~/.claude/teams/ to find teams where the current session is the leader.
 * Used by the Teams UI in the footer to show team status.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTeammateStatuses = getTeammateStatuses;
var types_js_1 = require("./swarm/backends/types.js");
var teamHelpers_js_1 = require("./swarm/teamHelpers.js");
/**
 * Get detailed teammate statuses for a team
 * Reads isActive from config to determine status
 */
function getTeammateStatuses(teamName) {
    var _a;
    var teamFile = (0, teamHelpers_js_1.readTeamFile)(teamName);
    if (!teamFile) {
        return [];
    }
    var hiddenPaneIds = new Set((_a = teamFile.hiddenPaneIds) !== null && _a !== void 0 ? _a : []);
    var statuses = [];
    for (var _i = 0, _b = teamFile.members; _i < _b.length; _i++) {
        var member = _b[_i];
        // Exclude team-lead from the list
        if (member.name === 'team-lead') {
            continue;
        }
        // Read isActive from config, defaulting to true (active) if undefined
        var isActive = member.isActive !== false;
        var status_1 = isActive ? 'running' : 'idle';
        statuses.push({
            name: member.name,
            agentId: member.agentId,
            agentType: member.agentType,
            model: member.model,
            prompt: member.prompt,
            status: status_1,
            color: member.color,
            tmuxPaneId: member.tmuxPaneId,
            cwd: member.cwd,
            worktreePath: member.worktreePath,
            isHidden: hiddenPaneIds.has(member.tmuxPaneId),
            backendType: member.backendType && (0, types_js_1.isPaneBackend)(member.backendType)
                ? member.backendType
                : undefined,
            mode: member.mode,
        });
    }
    return statuses;
}
// Note: For time formatting, use formatRelativeTimeAgo from '../utils/format.js'
