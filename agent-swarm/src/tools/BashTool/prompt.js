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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultTimeoutMs = getDefaultTimeoutMs;
exports.getMaxTimeoutMs = getMaxTimeoutMs;
exports.getSimplePrompt = getSimplePrompt;
var bun_bundle_1 = require("bun:bundle");
var prompts_js_1 = require("../../constants/prompts.js");
var attribution_js_1 = require("../../utils/attribution.js");
var embeddedTools_js_1 = require("../../utils/embeddedTools.js");
var envUtils_js_1 = require("../../utils/envUtils.js");
var gitSettings_js_1 = require("../../utils/gitSettings.js");
var filesystem_js_1 = require("../../utils/permissions/filesystem.js");
var sandbox_adapter_js_1 = require("../../utils/sandbox/sandbox-adapter.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var timeouts_js_1 = require("../../utils/timeouts.js");
var undercover_js_1 = require("../../utils/undercover.js");
var constants_js_1 = require("../AgentTool/constants.js");
var constants_js_2 = require("../FileEditTool/constants.js");
var prompt_js_1 = require("../FileReadTool/prompt.js");
var prompt_js_2 = require("../FileWriteTool/prompt.js");
var prompt_js_3 = require("../GlobTool/prompt.js");
var prompt_js_4 = require("../GrepTool/prompt.js");
var TodoWriteTool_js_1 = require("../TodoWriteTool/TodoWriteTool.js");
var toolName_js_1 = require("./toolName.js");
function getDefaultTimeoutMs() {
    return (0, timeouts_js_1.getDefaultBashTimeoutMs)();
}
function getMaxTimeoutMs() {
    return (0, timeouts_js_1.getMaxBashTimeoutMs)();
}
function getBackgroundUsageNote() {
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_DISABLE_BACKGROUND_TASKS)) {
        return null;
    }
    return "You can use the `run_in_background` parameter to run the command in the background. Only use this if you don't need the result immediately and are OK being notified when the command completes later. You do not need to check the output right away - you'll be notified when it finishes. You do not need to use '&' at the end of the command when using this parameter.";
}
function getCommitAndPRInstructions() {
    // Defense-in-depth: undercover instructions must survive even if the user
    // has disabled git instructions entirely. Attribution stripping and model-ID
    // hiding are mechanical and work regardless, but the explicit "don't blow
    // your cover" instructions are the last line of defense against the model
    // volunteering an internal codename in a commit message.
    var undercoverSection = process.env.USER_TYPE === 'ant' && (0, undercover_js_1.isUndercover)()
        ? (0, undercover_js_1.getUndercoverInstructions)() + '\n'
        : '';
    if (!(0, gitSettings_js_1.shouldIncludeGitInstructions)())
        return undercoverSection;
    // For ant users, use the short version pointing to skills
    if (process.env.USER_TYPE === 'ant') {
        var skillsSection = !(0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_SIMPLE)
            ? "For git commits and pull requests, use the `/commit` and `/commit-push-pr` skills:\n- `/commit` - Create a git commit with staged changes\n- `/commit-push-pr` - Commit, push, and create a pull request\n\nThese skills handle git safety protocols, proper commit message formatting, and PR creation.\n\nBefore creating a pull request, run `/simplify` to review your changes, then test end-to-end (e.g. via `/tmux` for interactive features).\n\n"
            : '';
        return "".concat(undercoverSection, "# Git operations\n\n").concat(skillsSection, "IMPORTANT: NEVER skip hooks (--no-verify, --no-gpg-sign, etc) unless the user explicitly requests it.\n\nUse the gh command via the Bash tool for other GitHub-related tasks including working with issues, checks, and releases. If given a Github URL use the gh command to get the information needed.\n\n# Other common operations\n- View comments on a Github PR: gh api repos/foo/bar/pulls/123/comments");
    }
    // For external users, include full inline instructions
    var _a = (0, attribution_js_1.getAttributionTexts)(), commitAttribution = _a.commit, prAttribution = _a.pr;
    return "# Committing changes with git\n\nOnly create commits when requested by the user. If unclear, ask first. When the user asks you to create a new git commit, follow these steps carefully:\n\nYou can call multiple tools in a single response. When multiple independent pieces of information are requested and all commands are likely to succeed, run multiple tool calls in parallel for optimal performance. The numbered steps below indicate which commands should be batched in parallel.\n\nGit Safety Protocol:\n- NEVER update the git config\n- NEVER run destructive git commands (push --force, reset --hard, checkout ., restore ., clean -f, branch -D) unless the user explicitly requests these actions. Taking unauthorized destructive actions is unhelpful and can result in lost work, so it's best to ONLY run these commands when given direct instructions \n- NEVER skip hooks (--no-verify, --no-gpg-sign, etc) unless the user explicitly requests it\n- NEVER run force push to main/master, warn the user if they request it\n- CRITICAL: Always create NEW commits rather than amending, unless the user explicitly requests a git amend. When a pre-commit hook fails, the commit did NOT happen \u2014 so --amend would modify the PREVIOUS commit, which may result in destroying work or losing previous changes. Instead, after hook failure, fix the issue, re-stage, and create a NEW commit\n- When staging files, prefer adding specific files by name rather than using \"git add -A\" or \"git add .\", which can accidentally include sensitive files (.env, credentials) or large binaries\n- NEVER commit changes unless the user explicitly asks you to. It is VERY IMPORTANT to only commit when explicitly asked, otherwise the user will feel that you are being too proactive\n\n1. Run the following bash commands in parallel, each using the ".concat(toolName_js_1.BASH_TOOL_NAME, " tool:\n  - Run a git status command to see all untracked files. IMPORTANT: Never use the -uall flag as it can cause memory issues on large repos.\n  - Run a git diff command to see both staged and unstaged changes that will be committed.\n  - Run a git log command to see recent commit messages, so that you can follow this repository's commit message style.\n2. Analyze all staged changes (both previously staged and newly added) and draft a commit message:\n  - Summarize the nature of the changes (eg. new feature, enhancement to an existing feature, bug fix, refactoring, test, docs, etc.). Ensure the message accurately reflects the changes and their purpose (i.e. \"add\" means a wholly new feature, \"update\" means an enhancement to an existing feature, \"fix\" means a bug fix, etc.).\n  - Do not commit files that likely contain secrets (.env, credentials.json, etc). Warn the user if they specifically request to commit those files\n  - Draft a concise (1-2 sentences) commit message that focuses on the \"why\" rather than the \"what\"\n  - Ensure it accurately reflects the changes and their purpose\n3. Run the following commands in parallel:\n   - Add relevant untracked files to the staging area.\n   - Create the commit with a message").concat(commitAttribution ? " ending with:\n   ".concat(commitAttribution) : '.', "\n   - Run git status after the commit completes to verify success.\n   Note: git status depends on the commit completing, so run it sequentially after the commit.\n4. If the commit fails due to pre-commit hook: fix the issue and create a NEW commit\n\nImportant notes:\n- NEVER run additional commands to read or explore code, besides git bash commands\n- NEVER use the ").concat(TodoWriteTool_js_1.TodoWriteTool.name, " or ").concat(constants_js_1.AGENT_TOOL_NAME, " tools\n- DO NOT push to the remote repository unless the user explicitly asks you to do so\n- IMPORTANT: Never use git commands with the -i flag (like git rebase -i or git add -i) since they require interactive input which is not supported.\n- IMPORTANT: Do not use --no-edit with git rebase commands, as the --no-edit flag is not a valid option for git rebase.\n- If there are no changes to commit (i.e., no untracked files and no modifications), do not create an empty commit\n- In order to ensure good formatting, ALWAYS pass the commit message via a HEREDOC, a la this example:\n<example>\ngit commit -m \"$(cat <<'EOF'\n   Commit message here.").concat(commitAttribution ? "\n\n   ".concat(commitAttribution) : '', "\n   EOF\n   )\"\n</example>\n\n# Creating pull requests\nUse the gh command via the Bash tool for ALL GitHub-related tasks including working with issues, pull requests, checks, and releases. If given a Github URL use the gh command to get the information needed.\n\nIMPORTANT: When the user asks you to create a pull request, follow these steps carefully:\n\n1. Run the following bash commands in parallel using the ").concat(toolName_js_1.BASH_TOOL_NAME, " tool, in order to understand the current state of the branch since it diverged from the main branch:\n   - Run a git status command to see all untracked files (never use -uall flag)\n   - Run a git diff command to see both staged and unstaged changes that will be committed\n   - Check if the current branch tracks a remote branch and is up to date with the remote, so you know if you need to push to the remote\n   - Run a git log command and `git diff [base-branch]...HEAD` to understand the full commit history for the current branch (from the time it diverged from the base branch)\n2. Analyze all changes that will be included in the pull request, making sure to look at all relevant commits (NOT just the latest commit, but ALL commits that will be included in the pull request!!!), and draft a pull request title and summary:\n   - Keep the PR title short (under 70 characters)\n   - Use the description/body for details, not the title\n3. Run the following commands in parallel:\n   - Create new branch if needed\n   - Push to remote with -u flag if needed\n   - Create PR using gh pr create with the format below. Use a HEREDOC to pass the body to ensure correct formatting.\n<example>\ngh pr create --title \"the pr title\" --body \"$(cat <<'EOF'\n## Summary\n<1-3 bullet points>\n\n## Test plan\n[Bulleted markdown checklist of TODOs for testing the pull request...]").concat(prAttribution ? "\n\n".concat(prAttribution) : '', "\nEOF\n)\"\n</example>\n\nImportant:\n- DO NOT use the ").concat(TodoWriteTool_js_1.TodoWriteTool.name, " or ").concat(constants_js_1.AGENT_TOOL_NAME, " tools\n- Return the PR URL when you're done, so the user can see it\n\n# Other common operations\n- View comments on a Github PR: gh api repos/foo/bar/pulls/123/comments");
}
// SandboxManager merges config from multiple sources (settings layers, defaults,
// CLI flags) without deduping, so paths like ~/.cache appear 3× in allowOnly.
// Dedup here before inlining into the prompt — affects only what the model sees,
// not sandbox enforcement. Saves ~150-200 tokens/request when sandbox is enabled.
function dedup(arr) {
    if (!arr || arr.length === 0)
        return arr;
    return __spreadArray([], new Set(arr), true);
}
function getSimpleSandboxSection() {
    if (!sandbox_adapter_js_1.SandboxManager.isSandboxingEnabled()) {
        return '';
    }
    var fsReadConfig = sandbox_adapter_js_1.SandboxManager.getFsReadConfig();
    var fsWriteConfig = sandbox_adapter_js_1.SandboxManager.getFsWriteConfig();
    var networkRestrictionConfig = sandbox_adapter_js_1.SandboxManager.getNetworkRestrictionConfig();
    var allowUnixSockets = sandbox_adapter_js_1.SandboxManager.getAllowUnixSockets();
    var ignoreViolations = sandbox_adapter_js_1.SandboxManager.getIgnoreViolations();
    var allowUnsandboxedCommands = sandbox_adapter_js_1.SandboxManager.areUnsandboxedCommandsAllowed();
    // Replace the per-UID temp dir literal (e.g. /private/tmp/claude-1001/) with
    // "$TMPDIR" so the prompt is identical across users — avoids busting the
    // cross-user global prompt cache. The sandbox already sets $TMPDIR at runtime.
    var claudeTempDir = (0, filesystem_js_1.getClaudeTempDir)();
    var normalizeAllowOnly = function (paths) {
        return __spreadArray([], new Set(paths), true).map(function (p) { return (p === claudeTempDir ? '$TMPDIR' : p); });
    };
    var filesystemConfig = {
        read: __assign({ denyOnly: dedup(fsReadConfig.denyOnly) }, (fsReadConfig.allowWithinDeny && {
            allowWithinDeny: dedup(fsReadConfig.allowWithinDeny),
        })),
        write: {
            allowOnly: normalizeAllowOnly(fsWriteConfig.allowOnly),
            denyWithinAllow: dedup(fsWriteConfig.denyWithinAllow),
        },
    };
    var networkConfig = __assign(__assign(__assign({}, ((networkRestrictionConfig === null || networkRestrictionConfig === void 0 ? void 0 : networkRestrictionConfig.allowedHosts) && {
        allowedHosts: dedup(networkRestrictionConfig.allowedHosts),
    })), ((networkRestrictionConfig === null || networkRestrictionConfig === void 0 ? void 0 : networkRestrictionConfig.deniedHosts) && {
        deniedHosts: dedup(networkRestrictionConfig.deniedHosts),
    })), (allowUnixSockets && { allowUnixSockets: dedup(allowUnixSockets) }));
    var restrictionsLines = [];
    if (Object.keys(filesystemConfig).length > 0) {
        restrictionsLines.push("Filesystem: ".concat((0, slowOperations_js_1.jsonStringify)(filesystemConfig)));
    }
    if (Object.keys(networkConfig).length > 0) {
        restrictionsLines.push("Network: ".concat((0, slowOperations_js_1.jsonStringify)(networkConfig)));
    }
    if (ignoreViolations) {
        restrictionsLines.push("Ignored violations: ".concat((0, slowOperations_js_1.jsonStringify)(ignoreViolations)));
    }
    var sandboxOverrideItems = allowUnsandboxedCommands
        ? [
            'You should always default to running commands within the sandbox. Do NOT attempt to set `dangerouslyDisableSandbox: true` unless:',
            [
                'The user *explicitly* asks you to bypass sandbox',
                'A specific command just failed and you see evidence of sandbox restrictions causing the failure. Note that commands can fail for many reasons unrelated to the sandbox (missing files, wrong arguments, network issues, etc.).',
            ],
            'Evidence of sandbox-caused failures includes:',
            [
                '"Operation not permitted" errors for file/network operations',
                'Access denied to specific paths outside allowed directories',
                'Network connection failures to non-whitelisted hosts',
                'Unix socket connection errors',
            ],
            'When you see evidence of sandbox-caused failure:',
            [
                "Immediately retry with `dangerouslyDisableSandbox: true` (don't ask, just do it)",
                'Briefly explain what sandbox restriction likely caused the failure. Be sure to mention that the user can use the `/sandbox` command to manage restrictions.',
                'This will prompt the user for permission',
            ],
            'Treat each command you execute with `dangerouslyDisableSandbox: true` individually. Even if you have recently run a command with this setting, you should default to running future commands within the sandbox.',
            'Do not suggest adding sensitive paths like ~/.bashrc, ~/.zshrc, ~/.ssh/*, or credential files to the sandbox allowlist.',
        ]
        : [
            'All commands MUST run in sandbox mode - the `dangerouslyDisableSandbox` parameter is disabled by policy.',
            'Commands cannot run outside the sandbox under any circumstances.',
            'If a command fails due to sandbox restrictions, work with the user to adjust sandbox settings instead.',
        ];
    var items = __spreadArray(__spreadArray([], sandboxOverrideItems, true), [
        'For temporary files, always use the `$TMPDIR` environment variable. TMPDIR is automatically set to the correct sandbox-writable directory in sandbox mode. Do NOT use `/tmp` directly - use `$TMPDIR` instead.',
    ], false);
    return __spreadArray([
        '',
        '## Command sandbox',
        'By default, your command will be run in a sandbox. This sandbox controls which directories and network hosts commands may access or modify without an explicit override.',
        '',
        'The sandbox has the following restrictions:',
        restrictionsLines.join('\n'),
        ''
    ], (0, prompts_js_1.prependBullets)(items), true).join('\n');
}
function getSimplePrompt() {
    // Ant-native builds alias find/grep to embedded bfs/ugrep in Claude's shell,
    // so we don't steer away from them (and Glob/Grep tools are removed).
    var embedded = (0, embeddedTools_js_1.hasEmbeddedSearchTools)();
    var toolPreferenceItems = __spreadArray(__spreadArray([], (embedded
        ? []
        : [
            "File search: Use ".concat(prompt_js_3.GLOB_TOOL_NAME, " (NOT find or ls)"),
            "Content search: Use ".concat(prompt_js_4.GREP_TOOL_NAME, " (NOT grep or rg)"),
        ]), true), [
        "Read files: Use ".concat(prompt_js_1.FILE_READ_TOOL_NAME, " (NOT cat/head/tail)"),
        "Edit files: Use ".concat(constants_js_2.FILE_EDIT_TOOL_NAME, " (NOT sed/awk)"),
        "Write files: Use ".concat(prompt_js_2.FILE_WRITE_TOOL_NAME, " (NOT echo >/cat <<EOF)"),
        'Communication: Output text directly (NOT echo/printf)',
    ], false);
    var avoidCommands = embedded
        ? '`cat`, `head`, `tail`, `sed`, `awk`, or `echo`'
        : '`find`, `grep`, `cat`, `head`, `tail`, `sed`, `awk`, or `echo`';
    var multipleCommandsSubitems = [
        "If the commands are independent and can run in parallel, make multiple ".concat(toolName_js_1.BASH_TOOL_NAME, " tool calls in a single message. Example: if you need to run \"git status\" and \"git diff\", send a single message with two ").concat(toolName_js_1.BASH_TOOL_NAME, " tool calls in parallel."),
        "If the commands depend on each other and must run sequentially, use a single ".concat(toolName_js_1.BASH_TOOL_NAME, " call with '&&' to chain them together."),
        "Use ';' only when you need to run commands sequentially but don't care if earlier commands fail.",
        'DO NOT use newlines to separate commands (newlines are ok in quoted strings).',
    ];
    var gitSubitems = [
        'Prefer to create a new commit rather than amending an existing commit.',
        'Before running destructive operations (e.g., git reset --hard, git push --force, git checkout --), consider whether there is a safer alternative that achieves the same goal. Only use destructive operations when they are truly the best approach.',
        'Never skip hooks (--no-verify) or bypass signing (--no-gpg-sign, -c commit.gpgsign=false) unless the user has explicitly asked for it. If a hook fails, investigate and fix the underlying issue.',
    ];
    var sleepSubitems = __spreadArray(__spreadArray(__spreadArray([
        'Do not sleep between commands that can run immediately — just run them.'
    ], ((0, bun_bundle_1.feature)('MONITOR_TOOL')
        ? [
            'Use the Monitor tool to stream events from a background process (each stdout line is a notification). For one-shot "wait until done," use Bash with run_in_background instead.',
        ]
        : []), true), [
        'If your command is long running and you would like to be notified when it finishes — use `run_in_background`. No sleep needed.',
        'Do not retry failing commands in a sleep loop — diagnose the root cause.',
        'If waiting for a background task you started with `run_in_background`, you will be notified when it completes — do not poll.'
    ], false), ((0, bun_bundle_1.feature)('MONITOR_TOOL')
        ? [
            '`sleep N` as the first command with N ≥ 2 is blocked. If you need a delay (rate limiting, deliberate pacing), keep it under 2 seconds.',
        ]
        : [
            'If you must poll an external process, use a check command (e.g. `gh run view`) rather than sleeping first.',
            'If you must sleep, keep the duration short (1-5 seconds) to avoid blocking the user.',
        ]), true);
    var backgroundNote = getBackgroundUsageNote();
    var instructionItems = __spreadArray(__spreadArray(__spreadArray([
        'If your command will create new directories or files, first use this tool to run `ls` to verify the parent directory exists and is the correct location.',
        'Always quote file paths that contain spaces with double quotes in your command (e.g., cd "path with spaces/file.txt")',
        'Try to maintain your current working directory throughout the session by using absolute paths and avoiding usage of `cd`. You may use `cd` if the User explicitly requests it.',
        "You may specify an optional timeout in milliseconds (up to ".concat(getMaxTimeoutMs(), "ms / ").concat(getMaxTimeoutMs() / 60000, " minutes). By default, your command will timeout after ").concat(getDefaultTimeoutMs(), "ms (").concat(getDefaultTimeoutMs() / 60000, " minutes).")
    ], (backgroundNote !== null ? [backgroundNote] : []), true), [
        'When issuing multiple commands:',
        multipleCommandsSubitems,
        'For git commands:',
        gitSubitems,
        'Avoid unnecessary `sleep` commands:',
        sleepSubitems
    ], false), (embedded
        ? [
            // bfs (which backs `find`) uses Oniguruma for -regex, which picks the
            // FIRST matching alternative (leftmost-first), unlike GNU find's
            // POSIX leftmost-longest. This silently drops matches when a shorter
            // alternative is a prefix of a longer one.
            "When using `find -regex` with alternation, put the longest alternative first. Example: use `'.*\\.\\(tsx\\|ts\\)'` not `'.*\\.\\(ts\\|tsx\\)'` — the second form silently skips `.tsx` files.",
        ]
        : []), true);
    return __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([
        'Executes a given bash command and returns its output.',
        '',
        "The working directory persists between commands, but shell state does not. The shell environment is initialized from the user's profile (bash or zsh).",
        '',
        "IMPORTANT: Avoid using this tool to run ".concat(avoidCommands, " commands, unless explicitly instructed or after you have verified that a dedicated tool cannot accomplish your task. Instead, use the appropriate dedicated tool as this will provide a much better experience for the user:"),
        ''
    ], (0, prompts_js_1.prependBullets)(toolPreferenceItems), true), [
        "While the ".concat(toolName_js_1.BASH_TOOL_NAME, " tool can do similar things, it\u2019s better to use the built-in tools as they provide a better user experience and make it easier to review tool calls and give permission."),
        '',
        '# Instructions'
    ], false), (0, prompts_js_1.prependBullets)(instructionItems), true), [
        getSimpleSandboxSection()
    ], false), (getCommitAndPRInstructions() ? ['', getCommitAndPRInstructions()] : []), true).join('\n');
}
