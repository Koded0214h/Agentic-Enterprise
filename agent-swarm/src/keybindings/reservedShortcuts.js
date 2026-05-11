"use strict";
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
exports.MACOS_RESERVED = exports.TERMINAL_RESERVED = exports.NON_REBINDABLE = void 0;
exports.getReservedShortcuts = getReservedShortcuts;
exports.normalizeKeyForComparison = normalizeKeyForComparison;
var platform_js_1 = require("../utils/platform.js");
/**
 * Shortcuts that cannot be rebound - they are hardcoded in Claude Code.
 */
exports.NON_REBINDABLE = [
    {
        key: 'ctrl+c',
        reason: 'Cannot be rebound - used for interrupt/exit (hardcoded)',
        severity: 'error',
    },
    {
        key: 'ctrl+d',
        reason: 'Cannot be rebound - used for exit (hardcoded)',
        severity: 'error',
    },
    {
        key: 'ctrl+m',
        reason: 'Cannot be rebound - identical to Enter in terminals (both send CR)',
        severity: 'error',
    },
];
/**
 * Terminal control shortcuts that are intercepted by the terminal/OS.
 * These will likely never reach the application.
 *
 * Note: ctrl+s (XOFF) and ctrl+q (XON) are NOT included here because:
 * - Most modern terminals disable flow control by default
 * - We use ctrl+s for the stash feature
 */
exports.TERMINAL_RESERVED = [
    {
        key: 'ctrl+z',
        reason: 'Unix process suspend (SIGTSTP)',
        severity: 'warning',
    },
    {
        key: 'ctrl+\\',
        reason: 'Terminal quit signal (SIGQUIT)',
        severity: 'error',
    },
];
/**
 * macOS-specific shortcuts that the OS intercepts.
 */
exports.MACOS_RESERVED = [
    { key: 'cmd+c', reason: 'macOS system copy', severity: 'error' },
    { key: 'cmd+v', reason: 'macOS system paste', severity: 'error' },
    { key: 'cmd+x', reason: 'macOS system cut', severity: 'error' },
    { key: 'cmd+q', reason: 'macOS quit application', severity: 'error' },
    { key: 'cmd+w', reason: 'macOS close window/tab', severity: 'error' },
    { key: 'cmd+tab', reason: 'macOS app switcher', severity: 'error' },
    { key: 'cmd+space', reason: 'macOS Spotlight', severity: 'error' },
];
/**
 * Get all reserved shortcuts for the current platform.
 * Includes non-rebindable shortcuts and terminal-reserved shortcuts.
 */
function getReservedShortcuts() {
    var platform = (0, platform_js_1.getPlatform)();
    // Non-rebindable shortcuts first (highest priority)
    var reserved = __spreadArray(__spreadArray([], exports.NON_REBINDABLE, true), exports.TERMINAL_RESERVED, true);
    if (platform === 'macos') {
        reserved.push.apply(reserved, exports.MACOS_RESERVED);
    }
    return reserved;
}
/**
 * Normalize a key string for comparison (lowercase, sorted modifiers).
 * Chords (space-separated steps like "ctrl+x ctrl+b") are normalized
 * per-step — splitting on '+' first would mangle "x ctrl" into a mainKey
 * overwritten by the next step, collapsing the chord into its last key.
 */
function normalizeKeyForComparison(key) {
    return key.trim().split(/\s+/).map(normalizeStep).join(' ');
}
function normalizeStep(step) {
    var parts = step.split('+');
    var modifiers = [];
    var mainKey = '';
    for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
        var part = parts_1[_i];
        var lower = part.trim().toLowerCase();
        if ([
            'ctrl',
            'control',
            'alt',
            'opt',
            'option',
            'meta',
            'cmd',
            'command',
            'shift',
        ].includes(lower)) {
            // Normalize modifier names
            if (lower === 'control')
                modifiers.push('ctrl');
            else if (lower === 'option' || lower === 'opt')
                modifiers.push('alt');
            else if (lower === 'command' || lower === 'cmd')
                modifiers.push('cmd');
            else
                modifiers.push(lower);
        }
        else {
            mainKey = lower;
        }
    }
    modifiers.sort();
    return __spreadArray(__spreadArray([], modifiers, true), [mainKey], false).join('+');
}
