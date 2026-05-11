"use strict";
/**
 * Worktree Detection Utility
 *
 * Detects if the current working directory is a git worktree and extracts
 * information about the parent repository.
 *
 * Git worktrees have a `.git` file (not directory) containing:
 *   gitdir: /path/to/parent/.git/worktrees/<name>
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectWorktree = detectWorktree;
var fs_1 = require("fs");
var path_1 = require("path");
var NOT_A_WORKTREE = {
    isWorktree: false,
    worktreeName: null,
    parentRepoPath: null,
    parentProjectName: null
};
/**
 * Detect if a directory is a git worktree and extract parent info.
 *
 * @param cwd - Current working directory (absolute path)
 * @returns WorktreeInfo with parent details if worktree, otherwise isWorktree=false
 */
function detectWorktree(cwd) {
    var gitPath = path_1.default.join(cwd, '.git');
    // Check if .git is a file (worktree) or directory (main repo)
    var stat;
    try {
        stat = (0, fs_1.statSync)(gitPath);
    }
    catch (_a) {
        // No .git at all - not a git repo
        return NOT_A_WORKTREE;
    }
    if (!stat.isFile()) {
        // .git is a directory = main repo, not a worktree
        return NOT_A_WORKTREE;
    }
    // Parse .git file to find parent repo
    var content;
    try {
        content = (0, fs_1.readFileSync)(gitPath, 'utf-8').trim();
    }
    catch (_b) {
        return NOT_A_WORKTREE;
    }
    // Format: gitdir: /path/to/parent/.git/worktrees/<name>
    var match = content.match(/^gitdir:\s*(.+)$/);
    if (!match) {
        return NOT_A_WORKTREE;
    }
    var gitdirPath = match[1];
    // Extract: /path/to/parent from /path/to/parent/.git/worktrees/name
    // Handle both Unix and Windows paths
    var worktreesMatch = gitdirPath.match(/^(.+)[/\\]\.git[/\\]worktrees[/\\]([^/\\]+)$/);
    if (!worktreesMatch) {
        return NOT_A_WORKTREE;
    }
    var parentRepoPath = worktreesMatch[1];
    var worktreeName = path_1.default.basename(cwd);
    var parentProjectName = path_1.default.basename(parentRepoPath);
    return {
        isWorktree: true,
        worktreeName: worktreeName,
        parentRepoPath: parentRepoPath,
        parentProjectName: parentProjectName
    };
}
