"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectName = getProjectName;
exports.getProjectContext = getProjectContext;
var path_1 = require("path");
var logger_js_1 = require("./logger.js");
var worktree_js_1 = require("./worktree.js");
/**
 * Extract project name from working directory path
 * Handles edge cases: null/undefined cwd, drive roots, trailing slashes
 *
 * @param cwd - Current working directory (absolute path)
 * @returns Project name or "unknown-project" if extraction fails
 */
function getProjectName(cwd) {
    if (!cwd || cwd.trim() === '') {
        logger_js_1.logger.warn('PROJECT_NAME', 'Empty cwd provided, using fallback', { cwd: cwd });
        return 'unknown-project';
    }
    // Extract basename (handles trailing slashes automatically)
    var basename = path_1.default.basename(cwd);
    // Edge case: Drive roots on Windows (C:\, J:\) or Unix root (/)
    // path.basename('C:\') returns '' (empty string)
    if (basename === '') {
        // Extract drive letter on Windows, or use 'root' on Unix
        var isWindows = process.platform === 'win32';
        if (isWindows) {
            var driveMatch = cwd.match(/^([A-Z]):\\/i);
            if (driveMatch) {
                var driveLetter = driveMatch[1].toUpperCase();
                var projectName = "drive-".concat(driveLetter);
                logger_js_1.logger.info('PROJECT_NAME', 'Drive root detected', { cwd: cwd, projectName: projectName });
                return projectName;
            }
        }
        logger_js_1.logger.warn('PROJECT_NAME', 'Root directory detected, using fallback', { cwd: cwd });
        return 'unknown-project';
    }
    return basename;
}
/**
 * Get project context with worktree detection.
 *
 * When in a worktree, returns both the worktree project name and parent project name
 * for unified timeline queries.
 *
 * @param cwd - Current working directory (absolute path)
 * @returns ProjectContext with worktree info
 */
function getProjectContext(cwd) {
    var primary = getProjectName(cwd);
    if (!cwd) {
        return { primary: primary, parent: null, isWorktree: false, allProjects: [primary] };
    }
    var worktreeInfo = (0, worktree_js_1.detectWorktree)(cwd);
    if (worktreeInfo.isWorktree && worktreeInfo.parentProjectName) {
        // In a worktree: include parent first for chronological ordering
        return {
            primary: primary,
            parent: worktreeInfo.parentProjectName,
            isWorktree: true,
            allProjects: [worktreeInfo.parentProjectName, primary]
        };
    }
    return { primary: primary, parent: null, isWorktree: false, allProjects: [primary] };
}
