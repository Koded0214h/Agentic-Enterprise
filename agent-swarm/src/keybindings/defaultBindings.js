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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_BINDINGS = void 0;
var bun_bundle_1 = require("bun:bundle");
var semver_js_1 = require("src/utils/semver.js");
var bundledMode_js_1 = require("../utils/bundledMode.js");
var platform_js_1 = require("../utils/platform.js");
/**
 * Default keybindings that match current Claude Code behavior.
 * These are loaded first, then user keybindings.json overrides them.
 */
// Platform-specific image paste shortcut:
// - Windows: alt+v (ctrl+v is system paste)
// - Other platforms: ctrl+v
var IMAGE_PASTE_KEY = (0, platform_js_1.getPlatform)() === 'windows' ? 'alt+v' : 'ctrl+v';
// Modifier-only chords (like shift+tab) may fail on Windows Terminal without VT mode
// See: https://github.com/microsoft/terminal/issues/879#issuecomment-618801651
// Node enabled VT mode in 24.2.0 / 22.17.0: https://github.com/nodejs/node/pull/58358
// Bun enabled VT mode in 1.2.23: https://github.com/oven-sh/bun/pull/21161
var SUPPORTS_TERMINAL_VT_MODE = (0, platform_js_1.getPlatform)() !== 'windows' ||
    ((0, bundledMode_js_1.isRunningWithBun)()
        ? (0, semver_js_1.satisfies)(process.versions.bun, '>=1.2.23')
        : (0, semver_js_1.satisfies)(process.versions.node, '>=22.17.0 <23.0.0 || >=24.2.0'));
// Platform-specific mode cycle shortcut:
// - Windows without VT mode: meta+m (shift+tab doesn't work reliably)
// - Other platforms: shift+tab
var MODE_CYCLE_KEY = SUPPORTS_TERMINAL_VT_MODE ? 'shift+tab' : 'meta+m';
exports.DEFAULT_BINDINGS = __spreadArray(__spreadArray([
    {
        context: 'Global',
        bindings: __assign(__assign(__assign(__assign({ 
            // ctrl+c and ctrl+d use special time-based double-press handling.
            // They ARE defined here so the resolver can find them, but they
            // CANNOT be rebound by users - validation in reservedShortcuts.ts
            // will show an error if users try to override these keys.
            'ctrl+c': 'app:interrupt', 'ctrl+d': 'app:exit', 'ctrl+l': 'app:redraw', 'ctrl+t': 'app:toggleTodos', 'ctrl+o': 'app:toggleTranscript' }, ((0, bun_bundle_1.feature)('KAIROS') || (0, bun_bundle_1.feature)('KAIROS_BRIEF')
            ? { 'ctrl+shift+b': 'app:toggleBrief' }
            : {})), { 'ctrl+shift+o': 'app:toggleTeammatePreview', 'ctrl+r': 'history:search' }), ((0, bun_bundle_1.feature)('QUICK_SEARCH')
            ? {
                'ctrl+shift+f': 'app:globalSearch',
                'cmd+shift+f': 'app:globalSearch',
                'ctrl+shift+p': 'app:quickOpen',
                'cmd+shift+p': 'app:quickOpen',
            }
            : {})), ((0, bun_bundle_1.feature)('TERMINAL_PANEL') ? { 'meta+j': 'app:toggleTerminal' } : {})),
    },
    {
        context: 'Chat',
        bindings: __assign(__assign((_a = { escape: 'chat:cancel', 
                // ctrl+x chord prefix avoids shadowing readline editing keys (ctrl+a/b/e/f/...).
                'ctrl+x ctrl+k': 'chat:killAgents' }, _a[MODE_CYCLE_KEY] = 'chat:cycleMode', _a['meta+p'] = 'chat:modelPicker', _a['meta+o'] = 'chat:fastMode', _a['meta+t'] = 'chat:thinkingToggle', _a.enter = 'chat:submit', _a.up = 'history:previous', _a.down = 'history:next', 
        // Editing shortcuts (defined here, migration in progress)
        // Undo has two bindings to support different terminal behaviors:
        // - ctrl+_ for legacy terminals (send \x1f control char)
        // - ctrl+shift+- for Kitty protocol (sends physical key with modifiers)
        _a['ctrl+_'] = 'chat:undo', _a['ctrl+shift+-'] = 'chat:undo', 
        // ctrl+x ctrl+e is the readline-native edit-and-execute-command binding.
        _a['ctrl+x ctrl+e'] = 'chat:externalEditor', _a['ctrl+g'] = 'chat:externalEditor', _a['ctrl+s'] = 'chat:stash', _a[IMAGE_PASTE_KEY] = 'chat:imagePaste', _a), ((0, bun_bundle_1.feature)('MESSAGE_ACTIONS')
            ? { 'shift+up': 'chat:messageActions' }
            : {})), ((0, bun_bundle_1.feature)('VOICE_MODE') ? { space: 'voice:pushToTalk' } : {})),
    },
    {
        context: 'Autocomplete',
        bindings: {
            tab: 'autocomplete:accept',
            escape: 'autocomplete:dismiss',
            up: 'autocomplete:previous',
            down: 'autocomplete:next',
        },
    },
    {
        context: 'Settings',
        bindings: {
            // Settings menu uses escape only (not 'n') to dismiss
            escape: 'confirm:no',
            // Config panel list navigation (reuses Select actions)
            up: 'select:previous',
            down: 'select:next',
            k: 'select:previous',
            j: 'select:next',
            'ctrl+p': 'select:previous',
            'ctrl+n': 'select:next',
            // Toggle/activate the selected setting (space only — enter saves & closes)
            space: 'select:accept',
            // Save and close the config panel
            enter: 'settings:close',
            // Enter search mode
            '/': 'settings:search',
            // Retry loading usage data (only active on error)
            r: 'settings:retry',
        },
    },
    {
        context: 'Confirmation',
        bindings: {
            y: 'confirm:yes',
            n: 'confirm:no',
            enter: 'confirm:yes',
            escape: 'confirm:no',
            // Navigation for dialogs with lists
            up: 'confirm:previous',
            down: 'confirm:next',
            tab: 'confirm:nextField',
            space: 'confirm:toggle',
            // Cycle modes (used in file permission dialogs and teams dialog)
            'shift+tab': 'confirm:cycleMode',
            // Toggle permission explanation in permission dialogs
            'ctrl+e': 'confirm:toggleExplanation',
            // Toggle permission debug info
            'ctrl+d': 'permission:toggleDebug',
        },
    },
    {
        context: 'Tabs',
        bindings: {
            // Tab cycling navigation
            tab: 'tabs:next',
            'shift+tab': 'tabs:previous',
            right: 'tabs:next',
            left: 'tabs:previous',
        },
    },
    {
        context: 'Transcript',
        bindings: {
            'ctrl+e': 'transcript:toggleShowAll',
            'ctrl+c': 'transcript:exit',
            escape: 'transcript:exit',
            // q — pager convention (less, tmux copy-mode). Transcript is a modal
            // reading view with no prompt, so q-as-literal-char has no owner.
            q: 'transcript:exit',
        },
    },
    {
        context: 'HistorySearch',
        bindings: {
            'ctrl+r': 'historySearch:next',
            escape: 'historySearch:accept',
            tab: 'historySearch:accept',
            'ctrl+c': 'historySearch:cancel',
            enter: 'historySearch:execute',
        },
    },
    {
        context: 'Task',
        bindings: {
            // Background running foreground tasks (bash commands, agents)
            // In tmux, users must press ctrl+b twice (tmux prefix escape)
            'ctrl+b': 'task:background',
        },
    },
    {
        context: 'ThemePicker',
        bindings: {
            'ctrl+t': 'theme:toggleSyntaxHighlighting',
        },
    },
    {
        context: 'Scroll',
        bindings: {
            pageup: 'scroll:pageUp',
            pagedown: 'scroll:pageDown',
            wheelup: 'scroll:lineUp',
            wheeldown: 'scroll:lineDown',
            'ctrl+home': 'scroll:top',
            'ctrl+end': 'scroll:bottom',
            // Selection copy. ctrl+shift+c is standard terminal copy.
            // cmd+c only fires on terminals using the kitty keyboard
            // protocol (kitty/WezTerm/ghostty/iTerm2) where the super
            // modifier actually reaches the pty — inert elsewhere.
            // Esc-to-clear and contextual ctrl+c are handled via raw
            // useInput so they can conditionally propagate.
            'ctrl+shift+c': 'selection:copy',
            'cmd+c': 'selection:copy',
        },
    },
    {
        context: 'Help',
        bindings: {
            escape: 'help:dismiss',
        },
    },
    // Attachment navigation (select dialog image attachments)
    {
        context: 'Attachments',
        bindings: {
            right: 'attachments:next',
            left: 'attachments:previous',
            backspace: 'attachments:remove',
            delete: 'attachments:remove',
            down: 'attachments:exit',
            escape: 'attachments:exit',
        },
    },
    // Footer indicator navigation (tasks, teams, diff, loop)
    {
        context: 'Footer',
        bindings: {
            up: 'footer:up',
            'ctrl+p': 'footer:up',
            down: 'footer:down',
            'ctrl+n': 'footer:down',
            right: 'footer:next',
            left: 'footer:previous',
            enter: 'footer:openSelected',
            escape: 'footer:clearSelection',
        },
    },
    // Message selector (rewind dialog) navigation
    {
        context: 'MessageSelector',
        bindings: {
            up: 'messageSelector:up',
            down: 'messageSelector:down',
            k: 'messageSelector:up',
            j: 'messageSelector:down',
            'ctrl+p': 'messageSelector:up',
            'ctrl+n': 'messageSelector:down',
            'ctrl+up': 'messageSelector:top',
            'shift+up': 'messageSelector:top',
            'meta+up': 'messageSelector:top',
            'shift+k': 'messageSelector:top',
            'ctrl+down': 'messageSelector:bottom',
            'shift+down': 'messageSelector:bottom',
            'meta+down': 'messageSelector:bottom',
            'shift+j': 'messageSelector:bottom',
            enter: 'messageSelector:select',
        },
    }
], ((0, bun_bundle_1.feature)('MESSAGE_ACTIONS')
    ? [
        {
            context: 'MessageActions',
            bindings: {
                up: 'messageActions:prev',
                down: 'messageActions:next',
                k: 'messageActions:prev',
                j: 'messageActions:next',
                // meta = cmd on macOS; super for kitty keyboard-protocol — bind both.
                'meta+up': 'messageActions:top',
                'meta+down': 'messageActions:bottom',
                'super+up': 'messageActions:top',
                'super+down': 'messageActions:bottom',
                // Mouse selection extends on shift+arrow (ScrollKeybindingHandler:573) when present —
                // correct layered UX: esc clears selection, then shift+↑ jumps.
                'shift+up': 'messageActions:prevUser',
                'shift+down': 'messageActions:nextUser',
                escape: 'messageActions:escape',
                'ctrl+c': 'messageActions:ctrlc',
                // Mirror MESSAGE_ACTIONS. Not imported — would pull React/ink into this config module.
                enter: 'messageActions:enter',
                c: 'messageActions:c',
                p: 'messageActions:p',
            },
        },
    ]
    : []), true), [
    // Diff dialog navigation
    {
        context: 'DiffDialog',
        bindings: {
            escape: 'diff:dismiss',
            left: 'diff:previousSource',
            right: 'diff:nextSource',
            up: 'diff:previousFile',
            down: 'diff:nextFile',
            enter: 'diff:viewDetails',
            // Note: diff:back is handled by left arrow in detail mode
        },
    },
    // Model picker effort cycling (ant-only)
    {
        context: 'ModelPicker',
        bindings: {
            left: 'modelPicker:decreaseEffort',
            right: 'modelPicker:increaseEffort',
        },
    },
    // Select component navigation (used by /model, /resume, permission prompts, etc.)
    {
        context: 'Select',
        bindings: {
            up: 'select:previous',
            down: 'select:next',
            j: 'select:next',
            k: 'select:previous',
            'ctrl+n': 'select:next',
            'ctrl+p': 'select:previous',
            enter: 'select:accept',
            escape: 'select:cancel',
        },
    },
    // Plugin dialog actions (manage, browse, discover plugins)
    // Navigation (select:*) uses the Select context above
    {
        context: 'Plugin',
        bindings: {
            space: 'plugin:toggle',
            i: 'plugin:install',
        },
    },
], false);
