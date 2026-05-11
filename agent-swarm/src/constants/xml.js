"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMMON_INFO_ARGS = exports.COMMON_HELP_ARGS = exports.FORK_DIRECTIVE_PREFIX = exports.FORK_BOILERPLATE_TAG = exports.CROSS_SESSION_MESSAGE_TAG = exports.CHANNEL_TAG = exports.CHANNEL_MESSAGE_TAG = exports.TEAMMATE_MESSAGE_TAG = exports.REMOTE_REVIEW_PROGRESS_TAG = exports.REMOTE_REVIEW_TAG = exports.ULTRAPLAN_TAG = exports.WORKTREE_BRANCH_TAG = exports.WORKTREE_PATH_TAG = exports.WORKTREE_TAG = exports.REASON_TAG = exports.SUMMARY_TAG = exports.STATUS_TAG = exports.OUTPUT_FILE_TAG = exports.TASK_TYPE_TAG = exports.TOOL_USE_ID_TAG = exports.TASK_ID_TAG = exports.TASK_NOTIFICATION_TAG = exports.TICK_TAG = exports.TERMINAL_OUTPUT_TAGS = exports.LOCAL_COMMAND_CAVEAT_TAG = exports.LOCAL_COMMAND_STDERR_TAG = exports.LOCAL_COMMAND_STDOUT_TAG = exports.BASH_STDERR_TAG = exports.BASH_STDOUT_TAG = exports.BASH_INPUT_TAG = exports.COMMAND_ARGS_TAG = exports.COMMAND_MESSAGE_TAG = exports.COMMAND_NAME_TAG = void 0;
// XML tag names used to mark skill/command metadata in messages
exports.COMMAND_NAME_TAG = 'command-name';
exports.COMMAND_MESSAGE_TAG = 'command-message';
exports.COMMAND_ARGS_TAG = 'command-args';
// XML tag names for terminal/bash command input and output in user messages
// These wrap content that represents terminal activity, not actual user prompts
exports.BASH_INPUT_TAG = 'bash-input';
exports.BASH_STDOUT_TAG = 'bash-stdout';
exports.BASH_STDERR_TAG = 'bash-stderr';
exports.LOCAL_COMMAND_STDOUT_TAG = 'local-command-stdout';
exports.LOCAL_COMMAND_STDERR_TAG = 'local-command-stderr';
exports.LOCAL_COMMAND_CAVEAT_TAG = 'local-command-caveat';
// All terminal-related tags that indicate a message is terminal output, not a user prompt
exports.TERMINAL_OUTPUT_TAGS = [
    exports.BASH_INPUT_TAG,
    exports.BASH_STDOUT_TAG,
    exports.BASH_STDERR_TAG,
    exports.LOCAL_COMMAND_STDOUT_TAG,
    exports.LOCAL_COMMAND_STDERR_TAG,
    exports.LOCAL_COMMAND_CAVEAT_TAG,
];
exports.TICK_TAG = 'tick';
// XML tag names for task notifications (background task completions)
exports.TASK_NOTIFICATION_TAG = 'task-notification';
exports.TASK_ID_TAG = 'task-id';
exports.TOOL_USE_ID_TAG = 'tool-use-id';
exports.TASK_TYPE_TAG = 'task-type';
exports.OUTPUT_FILE_TAG = 'output-file';
exports.STATUS_TAG = 'status';
exports.SUMMARY_TAG = 'summary';
exports.REASON_TAG = 'reason';
exports.WORKTREE_TAG = 'worktree';
exports.WORKTREE_PATH_TAG = 'worktreePath';
exports.WORKTREE_BRANCH_TAG = 'worktreeBranch';
// XML tag names for ultraplan mode (remote parallel planning sessions)
exports.ULTRAPLAN_TAG = 'ultraplan';
// XML tag name for remote /review results (teleported review session output).
// Remote session wraps its final review in this tag; local poller extracts it.
exports.REMOTE_REVIEW_TAG = 'remote-review';
// run_hunt.sh's heartbeat echoes the orchestrator's progress.json inside this
// tag every ~10s. Local poller parses the latest for the task-status line.
exports.REMOTE_REVIEW_PROGRESS_TAG = 'remote-review-progress';
// XML tag name for teammate messages (swarm inter-agent communication)
exports.TEAMMATE_MESSAGE_TAG = 'teammate-message';
// XML tag name for external channel messages
exports.CHANNEL_MESSAGE_TAG = 'channel-message';
exports.CHANNEL_TAG = 'channel';
// XML tag name for cross-session UDS messages (another Claude session's inbox)
exports.CROSS_SESSION_MESSAGE_TAG = 'cross-session-message';
// XML tag wrapping the rules/format boilerplate in a fork child's first message.
// Lets the transcript renderer collapse the boilerplate and show only the directive.
exports.FORK_BOILERPLATE_TAG = 'fork-boilerplate';
// Prefix before the directive text, stripped by the renderer. Keep in sync
// across buildChildMessage (generates) and UserForkBoilerplateMessage (parses).
exports.FORK_DIRECTIVE_PREFIX = 'Your directive: ';
// Common argument patterns for slash commands that request help
exports.COMMON_HELP_ARGS = ['help', '-h', '--help'];
// Common argument patterns for slash commands that request current state/info
exports.COMMON_INFO_ARGS = [
    'list',
    'show',
    'display',
    'current',
    'view',
    'get',
    'check',
    'describe',
    'print',
    'version',
    'about',
    'status',
    '?',
];
