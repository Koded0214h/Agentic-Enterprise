"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWorktreeModeEnabled = isWorktreeModeEnabled;
/**
 * Worktree mode is now unconditionally enabled for all users.
 *
 * Previously gated by GrowthBook flag 'tengu_worktree_mode', but the
 * CACHED_MAY_BE_STALE pattern returns the default (false) on first launch
 * before the cache is populated, silently swallowing --worktree.
 * See https://github.com/anthropics/claude-code/issues/27044.
 */
function isWorktreeModeEnabled() {
    return true;
}
