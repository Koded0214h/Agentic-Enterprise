"use strict";
// These constants are in a separate file to avoid circular dependency issues.
// Do NOT add imports to this file - it must remain dependency-free.
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEAMMATE_MODES = exports.EDITOR_MODES = exports.NOTIFICATION_CHANNELS = void 0;
exports.NOTIFICATION_CHANNELS = [
    'auto',
    'iterm2',
    'iterm2_with_bell',
    'terminal_bell',
    'kitty',
    'ghostty',
    'notifications_disabled',
];
// Valid editor modes (excludes deprecated 'emacs' which is auto-migrated to 'normal')
exports.EDITOR_MODES = ['normal', 'vim'];
// Valid teammate modes for spawning
// 'tmux' = traditional tmux-based teammates
// 'in-process' = in-process teammates running in same process
// 'auto' = automatically choose based on context (default)
exports.TEAMMATE_MODES = ['auto', 'tmux', 'in-process'];
