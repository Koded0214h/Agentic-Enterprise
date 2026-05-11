"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkCrossProjectResume = checkCrossProjectResume;
var path_1 = require("path");
var state_js_1 = require("../bootstrap/state.js");
var shellQuote_js_1 = require("./bash/shellQuote.js");
var sessionStorage_js_1 = require("./sessionStorage.js");
/**
 * Check if a log is from a different project directory and determine
 * whether it's a related worktree or a completely different project.
 *
 * For same-repo worktrees, we can resume directly without requiring cd.
 * For different projects, we generate the cd command.
 */
function checkCrossProjectResume(log, showAllProjects, worktreePaths) {
    var currentCwd = (0, state_js_1.getOriginalCwd)();
    if (!showAllProjects || !log.projectPath || log.projectPath === currentCwd) {
        return { isCrossProject: false };
    }
    // Gate worktree detection to ants only for staged rollout
    if (process.env.USER_TYPE !== 'ant') {
        var sessionId_1 = (0, sessionStorage_js_1.getSessionIdFromLog)(log);
        var command_1 = "cd ".concat((0, shellQuote_js_1.quote)([log.projectPath]), " && claude --resume ").concat(sessionId_1);
        return {
            isCrossProject: true,
            isSameRepoWorktree: false,
            command: command_1,
            projectPath: log.projectPath,
        };
    }
    // Check if log.projectPath is under a worktree of the same repo
    var isSameRepo = worktreePaths.some(function (wt) { return log.projectPath === wt || log.projectPath.startsWith(wt + path_1.sep); });
    if (isSameRepo) {
        return {
            isCrossProject: true,
            isSameRepoWorktree: true,
            projectPath: log.projectPath,
        };
    }
    // Different repo - generate cd command
    var sessionId = (0, sessionStorage_js_1.getSessionIdFromLog)(log);
    var command = "cd ".concat((0, shellQuote_js_1.quote)([log.projectPath]), " && claude --resume ").concat(sessionId);
    return {
        isCrossProject: true,
        isSameRepoWorktree: false,
        command: command,
        projectPath: log.projectPath,
    };
}
