"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inputSchema = void 0;
exports.sanitizeName = sanitizeName;
exports.sanitizeAgentName = sanitizeAgentName;
exports.getTeamDir = getTeamDir;
exports.getTeamFilePath = getTeamFilePath;
exports.readTeamFile = readTeamFile;
exports.readTeamFileAsync = readTeamFileAsync;
exports.writeTeamFileAsync = writeTeamFileAsync;
exports.removeTeammateFromTeamFile = removeTeammateFromTeamFile;
exports.addHiddenPaneId = addHiddenPaneId;
exports.removeHiddenPaneId = removeHiddenPaneId;
exports.removeMemberFromTeam = removeMemberFromTeam;
exports.removeMemberByAgentId = removeMemberByAgentId;
exports.setMemberMode = setMemberMode;
exports.syncTeammateMode = syncTeammateMode;
exports.setMultipleMemberModes = setMultipleMemberModes;
exports.setMemberActive = setMemberActive;
exports.registerTeamForSessionCleanup = registerTeamForSessionCleanup;
exports.unregisterTeamForSessionCleanup = unregisterTeamForSessionCleanup;
exports.cleanupSessionTeams = cleanupSessionTeams;
exports.cleanupTeamDirectories = cleanupTeamDirectories;
var fs_1 = require("fs");
var promises_1 = require("fs/promises");
var path_1 = require("path");
var v4_1 = require("zod/v4");
var state_js_1 = require("../../bootstrap/state.js");
var debug_js_1 = require("../debug.js");
var envUtils_js_1 = require("../envUtils.js");
var errors_js_1 = require("../errors.js");
var execFileNoThrow_js_1 = require("../execFileNoThrow.js");
var git_js_1 = require("../git.js");
var lazySchema_js_1 = require("../lazySchema.js");
var slowOperations_js_1 = require("../slowOperations.js");
var tasks_js_1 = require("../tasks.js");
var teammate_js_1 = require("../teammate.js");
var types_js_1 = require("./backends/types.js");
var constants_js_1 = require("./constants.js");
exports.inputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.strictObject({
        operation: v4_1.z
            .enum(['spawnTeam', 'cleanup'])
            .describe('Operation: spawnTeam to create a team, cleanup to remove team and task directories.'),
        agent_type: v4_1.z
            .string()
            .optional()
            .describe('Type/role of the team lead (e.g., "researcher", "test-runner"). ' +
            'Used for team file and inter-agent coordination.'),
        team_name: v4_1.z
            .string()
            .optional()
            .describe('Name for the new team to create (required for spawnTeam).'),
        description: v4_1.z
            .string()
            .optional()
            .describe('Team description/purpose (only used with spawnTeam).'),
    });
});
/**
 * Sanitizes a name for use in tmux window names, worktree paths, and file paths.
 * Replaces all non-alphanumeric characters with hyphens and lowercases.
 */
function sanitizeName(name) {
    return name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
}
/**
 * Sanitizes an agent name for use in deterministic agent IDs.
 * Replaces @ with - to prevent ambiguity in the agentName@teamName format.
 */
function sanitizeAgentName(name) {
    return name.replace(/@/g, '-');
}
/**
 * Gets the path to a team's directory
 */
function getTeamDir(teamName) {
    return (0, path_1.join)((0, envUtils_js_1.getTeamsDir)(), sanitizeName(teamName));
}
/**
 * Gets the path to a team's config.json file
 */
function getTeamFilePath(teamName) {
    return (0, path_1.join)(getTeamDir(teamName), 'config.json');
}
/**
 * Reads a team file by name (sync — for sync contexts like React render paths)
 * @internal Exported for team discovery UI
 */
// sync IO: called from sync context
function readTeamFile(teamName) {
    try {
        var content = (0, fs_1.readFileSync)(getTeamFilePath(teamName), 'utf-8');
        return (0, slowOperations_js_1.jsonParse)(content);
    }
    catch (e) {
        if ((0, errors_js_1.getErrnoCode)(e) === 'ENOENT')
            return null;
        (0, debug_js_1.logForDebugging)("[TeammateTool] Failed to read team file for ".concat(teamName, ": ").concat((0, errors_js_1.errorMessage)(e)));
        return null;
    }
}
/**
 * Reads a team file by name (async — for tool handlers and other async contexts)
 */
function readTeamFileAsync(teamName) {
    return __awaiter(this, void 0, void 0, function () {
        var content, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, promises_1.readFile)(getTeamFilePath(teamName), 'utf-8')];
                case 1:
                    content = _a.sent();
                    return [2 /*return*/, (0, slowOperations_js_1.jsonParse)(content)];
                case 2:
                    e_1 = _a.sent();
                    if ((0, errors_js_1.getErrnoCode)(e_1) === 'ENOENT')
                        return [2 /*return*/, null];
                    (0, debug_js_1.logForDebugging)("[TeammateTool] Failed to read team file for ".concat(teamName, ": ").concat((0, errors_js_1.errorMessage)(e_1)));
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Writes a team file (sync — for sync contexts)
 */
// sync IO: called from sync context
function writeTeamFile(teamName, teamFile) {
    var teamDir = getTeamDir(teamName);
    (0, fs_1.mkdirSync)(teamDir, { recursive: true });
    (0, fs_1.writeFileSync)(getTeamFilePath(teamName), (0, slowOperations_js_1.jsonStringify)(teamFile, null, 2));
}
/**
 * Writes a team file (async — for tool handlers)
 */
function writeTeamFileAsync(teamName, teamFile) {
    return __awaiter(this, void 0, void 0, function () {
        var teamDir;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    teamDir = getTeamDir(teamName);
                    return [4 /*yield*/, (0, promises_1.mkdir)(teamDir, { recursive: true })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, promises_1.writeFile)(getTeamFilePath(teamName), (0, slowOperations_js_1.jsonStringify)(teamFile, null, 2))];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Removes a teammate from the team file by agent ID or name.
 * Used by the leader when processing shutdown approvals.
 */
function removeTeammateFromTeamFile(teamName, identifier) {
    var identifierStr = identifier.agentId || identifier.name;
    if (!identifierStr) {
        (0, debug_js_1.logForDebugging)('[TeammateTool] removeTeammateFromTeamFile called with no identifier');
        return false;
    }
    var teamFile = readTeamFile(teamName);
    if (!teamFile) {
        (0, debug_js_1.logForDebugging)("[TeammateTool] Cannot remove teammate ".concat(identifierStr, ": failed to read team file for \"").concat(teamName, "\""));
        return false;
    }
    var originalLength = teamFile.members.length;
    teamFile.members = teamFile.members.filter(function (m) {
        if (identifier.agentId && m.agentId === identifier.agentId)
            return false;
        if (identifier.name && m.name === identifier.name)
            return false;
        return true;
    });
    if (teamFile.members.length === originalLength) {
        (0, debug_js_1.logForDebugging)("[TeammateTool] Teammate ".concat(identifierStr, " not found in team file for \"").concat(teamName, "\""));
        return false;
    }
    writeTeamFile(teamName, teamFile);
    (0, debug_js_1.logForDebugging)("[TeammateTool] Removed teammate from team file: ".concat(identifierStr));
    return true;
}
/**
 * Adds a pane ID to the hidden panes list in the team file.
 * @param teamName - The name of the team
 * @param paneId - The pane ID to hide
 * @returns true if the pane was added to hidden list, false if team doesn't exist
 */
function addHiddenPaneId(teamName, paneId) {
    var _a;
    var teamFile = readTeamFile(teamName);
    if (!teamFile) {
        return false;
    }
    var hiddenPaneIds = (_a = teamFile.hiddenPaneIds) !== null && _a !== void 0 ? _a : [];
    if (!hiddenPaneIds.includes(paneId)) {
        hiddenPaneIds.push(paneId);
        teamFile.hiddenPaneIds = hiddenPaneIds;
        writeTeamFile(teamName, teamFile);
        (0, debug_js_1.logForDebugging)("[TeammateTool] Added ".concat(paneId, " to hidden panes for team ").concat(teamName));
    }
    return true;
}
/**
 * Removes a pane ID from the hidden panes list in the team file.
 * @param teamName - The name of the team
 * @param paneId - The pane ID to show (remove from hidden list)
 * @returns true if the pane was removed from hidden list, false if team doesn't exist
 */
function removeHiddenPaneId(teamName, paneId) {
    var _a;
    var teamFile = readTeamFile(teamName);
    if (!teamFile) {
        return false;
    }
    var hiddenPaneIds = (_a = teamFile.hiddenPaneIds) !== null && _a !== void 0 ? _a : [];
    var index = hiddenPaneIds.indexOf(paneId);
    if (index !== -1) {
        hiddenPaneIds.splice(index, 1);
        teamFile.hiddenPaneIds = hiddenPaneIds;
        writeTeamFile(teamName, teamFile);
        (0, debug_js_1.logForDebugging)("[TeammateTool] Removed ".concat(paneId, " from hidden panes for team ").concat(teamName));
    }
    return true;
}
/**
 * Removes a teammate from the team config file by pane ID.
 * Also removes from hiddenPaneIds if present.
 * @param teamName - The name of the team
 * @param tmuxPaneId - The pane ID of the teammate to remove
 * @returns true if the member was removed, false if team or member doesn't exist
 */
function removeMemberFromTeam(teamName, tmuxPaneId) {
    var teamFile = readTeamFile(teamName);
    if (!teamFile) {
        return false;
    }
    var memberIndex = teamFile.members.findIndex(function (m) { return m.tmuxPaneId === tmuxPaneId; });
    if (memberIndex === -1) {
        return false;
    }
    // Remove from members array
    teamFile.members.splice(memberIndex, 1);
    // Also remove from hiddenPaneIds if present
    if (teamFile.hiddenPaneIds) {
        var hiddenIndex = teamFile.hiddenPaneIds.indexOf(tmuxPaneId);
        if (hiddenIndex !== -1) {
            teamFile.hiddenPaneIds.splice(hiddenIndex, 1);
        }
    }
    writeTeamFile(teamName, teamFile);
    (0, debug_js_1.logForDebugging)("[TeammateTool] Removed member with pane ".concat(tmuxPaneId, " from team ").concat(teamName));
    return true;
}
/**
 * Removes a teammate from a team's member list by agent ID.
 * Use this for in-process teammates which all share the same tmuxPaneId.
 * @param teamName - The name of the team
 * @param agentId - The agent ID of the teammate to remove (e.g., "researcher@my-team")
 * @returns true if the member was removed, false if team or member doesn't exist
 */
function removeMemberByAgentId(teamName, agentId) {
    var teamFile = readTeamFile(teamName);
    if (!teamFile) {
        return false;
    }
    var memberIndex = teamFile.members.findIndex(function (m) { return m.agentId === agentId; });
    if (memberIndex === -1) {
        return false;
    }
    // Remove from members array
    teamFile.members.splice(memberIndex, 1);
    writeTeamFile(teamName, teamFile);
    (0, debug_js_1.logForDebugging)("[TeammateTool] Removed member ".concat(agentId, " from team ").concat(teamName));
    return true;
}
/**
 * Sets a team member's permission mode.
 * Called when the team leader changes a teammate's mode via the TeamsDialog.
 * @param teamName - The name of the team
 * @param memberName - The name of the member to update
 * @param mode - The new permission mode
 */
function setMemberMode(teamName, memberName, mode) {
    var teamFile = readTeamFile(teamName);
    if (!teamFile) {
        return false;
    }
    var member = teamFile.members.find(function (m) { return m.name === memberName; });
    if (!member) {
        (0, debug_js_1.logForDebugging)("[TeammateTool] Cannot set member mode: member ".concat(memberName, " not found in team ").concat(teamName));
        return false;
    }
    // Only write if the value is actually changing
    if (member.mode === mode) {
        return true;
    }
    // Create updated members array immutably
    var updatedMembers = teamFile.members.map(function (m) {
        return m.name === memberName ? __assign(__assign({}, m), { mode: mode }) : m;
    });
    writeTeamFile(teamName, __assign(__assign({}, teamFile), { members: updatedMembers }));
    (0, debug_js_1.logForDebugging)("[TeammateTool] Set member ".concat(memberName, " in team ").concat(teamName, " to mode: ").concat(mode));
    return true;
}
/**
 * Sync the current teammate's mode to config.json so team lead sees it.
 * No-op if not running as a teammate.
 * @param mode - The permission mode to sync
 * @param teamNameOverride - Optional team name override (uses env var if not provided)
 */
function syncTeammateMode(mode, teamNameOverride) {
    if (!(0, teammate_js_1.isTeammate)())
        return;
    var teamName = teamNameOverride !== null && teamNameOverride !== void 0 ? teamNameOverride : (0, teammate_js_1.getTeamName)();
    var agentName = (0, teammate_js_1.getAgentName)();
    if (teamName && agentName) {
        setMemberMode(teamName, agentName, mode);
    }
}
/**
 * Sets multiple team members' permission modes in a single atomic operation.
 * Avoids race conditions when updating multiple teammates at once.
 * @param teamName - The name of the team
 * @param modeUpdates - Array of {memberName, mode} to update
 */
function setMultipleMemberModes(teamName, modeUpdates) {
    var teamFile = readTeamFile(teamName);
    if (!teamFile) {
        return false;
    }
    // Build a map of updates for efficient lookup
    var updateMap = new Map(modeUpdates.map(function (u) { return [u.memberName, u.mode]; }));
    // Create updated members array immutably
    var anyChanged = false;
    var updatedMembers = teamFile.members.map(function (member) {
        var newMode = updateMap.get(member.name);
        if (newMode !== undefined && member.mode !== newMode) {
            anyChanged = true;
            return __assign(__assign({}, member), { mode: newMode });
        }
        return member;
    });
    if (anyChanged) {
        writeTeamFile(teamName, __assign(__assign({}, teamFile), { members: updatedMembers }));
        (0, debug_js_1.logForDebugging)("[TeammateTool] Set ".concat(modeUpdates.length, " member modes in team ").concat(teamName));
    }
    return true;
}
/**
 * Sets a team member's active status.
 * Called when a teammate becomes idle (isActive=false) or starts a new turn (isActive=true).
 * @param teamName - The name of the team
 * @param memberName - The name of the member to update
 * @param isActive - Whether the member is active (true) or idle (false)
 */
function setMemberActive(teamName, memberName, isActive) {
    return __awaiter(this, void 0, void 0, function () {
        var teamFile, member;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, readTeamFileAsync(teamName)];
                case 1:
                    teamFile = _a.sent();
                    if (!teamFile) {
                        (0, debug_js_1.logForDebugging)("[TeammateTool] Cannot set member active: team ".concat(teamName, " not found"));
                        return [2 /*return*/];
                    }
                    member = teamFile.members.find(function (m) { return m.name === memberName; });
                    if (!member) {
                        (0, debug_js_1.logForDebugging)("[TeammateTool] Cannot set member active: member ".concat(memberName, " not found in team ").concat(teamName));
                        return [2 /*return*/];
                    }
                    // Only write if the value is actually changing
                    if (member.isActive === isActive) {
                        return [2 /*return*/];
                    }
                    member.isActive = isActive;
                    return [4 /*yield*/, writeTeamFileAsync(teamName, teamFile)];
                case 2:
                    _a.sent();
                    (0, debug_js_1.logForDebugging)("[TeammateTool] Set member ".concat(memberName, " in team ").concat(teamName, " to ").concat(isActive ? 'active' : 'idle'));
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Destroys a git worktree at the given path.
 * First attempts to use `git worktree remove`, then falls back to rm -rf.
 * Safe to call on non-existent paths.
 */
function destroyWorktree(worktreePath) {
    return __awaiter(this, void 0, void 0, function () {
        var gitFilePath, mainRepoPath, gitFileContent, match, worktreeGitDir, mainGitDir, _a, result, error_1;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    gitFilePath = (0, path_1.join)(worktreePath, '.git');
                    mainRepoPath = null;
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readFile)(gitFilePath, 'utf-8')];
                case 2:
                    gitFileContent = (_c.sent()).trim();
                    match = gitFileContent.match(/^gitdir:\s*(.+)$/);
                    if (match && match[1]) {
                        worktreeGitDir = match[1];
                        mainGitDir = (0, path_1.join)(worktreeGitDir, '..', '..');
                        mainRepoPath = (0, path_1.join)(mainGitDir, '..');
                    }
                    return [3 /*break*/, 4];
                case 3:
                    _a = _c.sent();
                    return [3 /*break*/, 4];
                case 4:
                    if (!mainRepoPath) return [3 /*break*/, 6];
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), ['worktree', 'remove', '--force', worktreePath], { cwd: mainRepoPath })];
                case 5:
                    result = _c.sent();
                    if (result.code === 0) {
                        (0, debug_js_1.logForDebugging)("[TeammateTool] Removed worktree via git: ".concat(worktreePath));
                        return [2 /*return*/];
                    }
                    // Check if the error is "not a working tree" (already removed)
                    if ((_b = result.stderr) === null || _b === void 0 ? void 0 : _b.includes('not a working tree')) {
                        (0, debug_js_1.logForDebugging)("[TeammateTool] Worktree already removed: ".concat(worktreePath));
                        return [2 /*return*/];
                    }
                    (0, debug_js_1.logForDebugging)("[TeammateTool] git worktree remove failed, falling back to rm: ".concat(result.stderr));
                    _c.label = 6;
                case 6:
                    _c.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, (0, promises_1.rm)(worktreePath, { recursive: true, force: true })];
                case 7:
                    _c.sent();
                    (0, debug_js_1.logForDebugging)("[TeammateTool] Removed worktree directory manually: ".concat(worktreePath));
                    return [3 /*break*/, 9];
                case 8:
                    error_1 = _c.sent();
                    (0, debug_js_1.logForDebugging)("[TeammateTool] Failed to remove worktree ".concat(worktreePath, ": ").concat((0, errors_js_1.errorMessage)(error_1)));
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
/**
 * Mark a team as created this session so it gets cleaned up on exit.
 * Call this right after the initial writeTeamFile. TeamDelete should
 * call unregisterTeamForSessionCleanup to prevent double-cleanup.
 * Backing Set lives in bootstrap/state.ts so resetStateForTests()
 * clears it between tests (avoids the PR #17615 cross-shard leak class).
 */
function registerTeamForSessionCleanup(teamName) {
    (0, state_js_1.getSessionCreatedTeams)().add(teamName);
}
/**
 * Remove a team from session cleanup tracking (e.g., after explicit
 * TeamDelete — already cleaned, don't try again on shutdown).
 */
function unregisterTeamForSessionCleanup(teamName) {
    (0, state_js_1.getSessionCreatedTeams)().delete(teamName);
}
/**
 * Clean up all teams created this session that weren't explicitly deleted.
 * Registered with gracefulShutdown from init.ts.
 */
function cleanupSessionTeams() {
    return __awaiter(this, void 0, void 0, function () {
        var sessionCreatedTeams, teams;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    sessionCreatedTeams = (0, state_js_1.getSessionCreatedTeams)();
                    if (sessionCreatedTeams.size === 0)
                        return [2 /*return*/];
                    teams = Array.from(sessionCreatedTeams);
                    (0, debug_js_1.logForDebugging)("cleanupSessionTeams: removing ".concat(teams.length, " orphan team dir(s): ").concat(teams.join(', ')));
                    // Kill panes first — on SIGINT the teammate processes are still running;
                    // deleting directories alone would orphan them in open tmux/iTerm2 panes.
                    // (TeamDeleteTool's path doesn't need this — by then teammates have
                    // gracefully exited and useInboxPoller has already closed their panes.)
                    return [4 /*yield*/, Promise.allSettled(teams.map(function (name) { return killOrphanedTeammatePanes(name); }))];
                case 1:
                    // Kill panes first — on SIGINT the teammate processes are still running;
                    // deleting directories alone would orphan them in open tmux/iTerm2 panes.
                    // (TeamDeleteTool's path doesn't need this — by then teammates have
                    // gracefully exited and useInboxPoller has already closed their panes.)
                    _a.sent();
                    return [4 /*yield*/, Promise.allSettled(teams.map(function (name) { return cleanupTeamDirectories(name); }))];
                case 2:
                    _a.sent();
                    sessionCreatedTeams.clear();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Best-effort kill of all pane-backed teammate panes for a team.
 * Called from cleanupSessionTeams on ungraceful leader exit (SIGINT/SIGTERM).
 * Dynamic imports avoid adding registry/detection to this module's static
 * dep graph — this only runs at shutdown, so the import cost is irrelevant.
 */
function killOrphanedTeammatePanes(teamName) {
    return __awaiter(this, void 0, void 0, function () {
        var teamFile, paneMembers, _a, _b, ensureBackendsRegistered, getBackendByType, isInsideTmux, useExternalSession;
        var _this = this;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    teamFile = readTeamFile(teamName);
                    if (!teamFile)
                        return [2 /*return*/];
                    paneMembers = teamFile.members.filter(function (m) {
                        return m.name !== constants_js_1.TEAM_LEAD_NAME &&
                            m.tmuxPaneId &&
                            m.backendType &&
                            (0, types_js_1.isPaneBackend)(m.backendType);
                    });
                    if (paneMembers.length === 0)
                        return [2 /*return*/];
                    return [4 /*yield*/, Promise.all([
                            Promise.resolve().then(function () { return require('./backends/registry.js'); }),
                            Promise.resolve().then(function () { return require('./backends/detection.js'); }),
                        ])];
                case 1:
                    _a = _c.sent(), _b = _a[0], ensureBackendsRegistered = _b.ensureBackendsRegistered, getBackendByType = _b.getBackendByType, isInsideTmux = _a[1].isInsideTmux;
                    return [4 /*yield*/, ensureBackendsRegistered()];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, isInsideTmux()];
                case 3:
                    useExternalSession = !(_c.sent());
                    return [4 /*yield*/, Promise.allSettled(paneMembers.map(function (m) { return __awaiter(_this, void 0, void 0, function () {
                            var ok;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        // filter above guarantees these; narrow for the type system
                                        if (!m.tmuxPaneId || !m.backendType || !(0, types_js_1.isPaneBackend)(m.backendType)) {
                                            return [2 /*return*/];
                                        }
                                        return [4 /*yield*/, getBackendByType(m.backendType).killPane(m.tmuxPaneId, useExternalSession)];
                                    case 1:
                                        ok = _a.sent();
                                        (0, debug_js_1.logForDebugging)("cleanupSessionTeams: killPane ".concat(m.name, " (").concat(m.backendType, " ").concat(m.tmuxPaneId, ") \u2192 ").concat(ok));
                                        return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 4:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Cleans up team and task directories for a given team name.
 * Also cleans up git worktrees created for teammates.
 * Called when a swarm session is terminated.
 */
function cleanupTeamDirectories(teamName) {
    return __awaiter(this, void 0, void 0, function () {
        var sanitizedName, teamFile, worktreePaths, _i, _a, member, _b, worktreePaths_1, worktreePath, teamDir, error_2, tasksDir, error_3;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    sanitizedName = sanitizeName(teamName);
                    teamFile = readTeamFile(teamName);
                    worktreePaths = [];
                    if (teamFile) {
                        for (_i = 0, _a = teamFile.members; _i < _a.length; _i++) {
                            member = _a[_i];
                            if (member.worktreePath) {
                                worktreePaths.push(member.worktreePath);
                            }
                        }
                    }
                    _b = 0, worktreePaths_1 = worktreePaths;
                    _c.label = 1;
                case 1:
                    if (!(_b < worktreePaths_1.length)) return [3 /*break*/, 4];
                    worktreePath = worktreePaths_1[_b];
                    return [4 /*yield*/, destroyWorktree(worktreePath)];
                case 2:
                    _c.sent();
                    _c.label = 3;
                case 3:
                    _b++;
                    return [3 /*break*/, 1];
                case 4:
                    teamDir = getTeamDir(teamName);
                    _c.label = 5;
                case 5:
                    _c.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, (0, promises_1.rm)(teamDir, { recursive: true, force: true })];
                case 6:
                    _c.sent();
                    (0, debug_js_1.logForDebugging)("[TeammateTool] Cleaned up team directory: ".concat(teamDir));
                    return [3 /*break*/, 8];
                case 7:
                    error_2 = _c.sent();
                    (0, debug_js_1.logForDebugging)("[TeammateTool] Failed to clean up team directory ".concat(teamDir, ": ").concat((0, errors_js_1.errorMessage)(error_2)));
                    return [3 /*break*/, 8];
                case 8:
                    tasksDir = (0, tasks_js_1.getTasksDir)(sanitizedName);
                    _c.label = 9;
                case 9:
                    _c.trys.push([9, 11, , 12]);
                    return [4 /*yield*/, (0, promises_1.rm)(tasksDir, { recursive: true, force: true })];
                case 10:
                    _c.sent();
                    (0, debug_js_1.logForDebugging)("[TeammateTool] Cleaned up tasks directory: ".concat(tasksDir));
                    (0, tasks_js_1.notifyTasksUpdated)();
                    return [3 /*break*/, 12];
                case 11:
                    error_3 = _c.sent();
                    (0, debug_js_1.logForDebugging)("[TeammateTool] Failed to clean up tasks directory ".concat(tasksDir, ": ").concat((0, errors_js_1.errorMessage)(error_3)));
                    return [3 /*break*/, 12];
                case 12: return [2 /*return*/];
            }
        });
    });
}
