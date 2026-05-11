"use strict";
/**
 * Undercover mode — safety utilities for contributing to public/open-source repos.
 *
 * When active, Claude Code adds safety instructions to commit/PR prompts and
 * strips all attribution to avoid leaking internal model codenames, project
 * names, or other Anthropic-internal information. The model is not told what
 * model it is.
 *
 * Activation:
 *   - CLAUDE_CODE_UNDERCOVER=1 — force ON (even in internal repos)
 *   - Otherwise AUTO: active UNLESS the repo remote matches the internal
 *     allowlist (INTERNAL_MODEL_REPOS in commitAttribution.ts). Safe default
 *     is ON — Claude may push to public remotes from a CWD that isn't itself
 *     a git checkout (e.g. /tmp crash repro).
 *   - There is NO force-OFF. This guards against model codename leaks — if
 *     we're not confident we're in an internal repo, we stay undercover.
 *
 * All code paths are gated on process.env.USER_TYPE === 'ant'. Since USER_TYPE is
 * a build-time --define, the bundler constant-folds these checks and dead-code-
 * eliminates the ant-only branches from external builds. In external builds every
 * function in this file reduces to a trivial return.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUndercover = isUndercover;
exports.getUndercoverInstructions = getUndercoverInstructions;
exports.shouldShowUndercoverAutoNotice = shouldShowUndercoverAutoNotice;
var commitAttribution_js_1 = require("./commitAttribution.js");
var config_js_1 = require("./config.js");
var envUtils_js_1 = require("./envUtils.js");
function isUndercover() {
    if (process.env.USER_TYPE === 'ant') {
        if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_UNDERCOVER))
            return true;
        // Auto: active unless we've positively confirmed we're in an allowlisted
        // internal repo. 'external', 'none', and null (check not yet run) all
        // resolve to ON. The check is primed in setup.ts; only 'internal' → OFF.
        return (0, commitAttribution_js_1.getRepoClassCached)() !== 'internal';
    }
    return false;
}
function getUndercoverInstructions() {
    if (process.env.USER_TYPE === 'ant') {
        return "## UNDERCOVER MODE \u2014 CRITICAL\n\nYou are operating UNDERCOVER in a PUBLIC/OPEN-SOURCE repository. Your commit\nmessages, PR titles, and PR bodies MUST NOT contain ANY Anthropic-internal\ninformation. Do not blow your cover.\n\nNEVER include in commit messages or PR descriptions:\n- Internal model codenames (animal names like Capybara, Tengu, etc.)\n- Unreleased model version numbers (e.g., opus-4-7, sonnet-4-8)\n- Internal repo or project names (e.g., claude-cli-internal, anthropics/\u2026)\n- Internal tooling, Slack channels, or short links (e.g., go/cc, #claude-code-\u2026)\n- The phrase \"Claude Code\" or any mention that you are an AI\n- Any hint of what model or version you are\n- Co-Authored-By lines or any other attribution\n\nWrite commit messages as a human developer would \u2014 describe only what the code\nchange does.\n\nGOOD:\n- \"Fix race condition in file watcher initialization\"\n- \"Add support for custom key bindings\"\n- \"Refactor parser for better error messages\"\n\nBAD (never write these):\n- \"Fix bug found while testing with Claude Capybara\"\n- \"1-shotted by claude-opus-4-6\"\n- \"Generated with Claude Code\"\n- \"Co-Authored-By: Claude Opus 4.6 <\u2026>\"\n";
    }
    return '';
}
/**
 * Check whether to show the one-time explainer dialog for auto-undercover.
 * True when: undercover is active via auto-detection (not forced via env),
 * and the user hasn't seen the notice before. Pure — the component marks the
 * flag on mount.
 */
function shouldShowUndercoverAutoNotice() {
    if (process.env.USER_TYPE === 'ant') {
        // If forced via env, user already knows; don't nag.
        if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_UNDERCOVER))
            return false;
        if (!isUndercover())
            return false;
        if ((0, config_js_1.getGlobalConfig)().hasSeenUndercoverAutoNotice)
            return false;
        return true;
    }
    return false;
}
