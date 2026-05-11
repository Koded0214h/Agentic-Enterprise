"use strict";
/**
 * Zod schema for keybindings.json configuration.
 * Used for validation and JSON schema generation.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeybindingsSchema = exports.KeybindingBlockSchema = exports.KEYBINDING_ACTIONS = exports.KEYBINDING_CONTEXT_DESCRIPTIONS = exports.KEYBINDING_CONTEXTS = void 0;
var v4_1 = require("zod/v4");
var lazySchema_js_1 = require("../utils/lazySchema.js");
/**
 * Valid context names where keybindings can be applied.
 */
exports.KEYBINDING_CONTEXTS = [
    'Global',
    'Chat',
    'Autocomplete',
    'Confirmation',
    'Help',
    'Transcript',
    'HistorySearch',
    'Task',
    'ThemePicker',
    'Settings',
    'Tabs',
    // New contexts for keybindings migration
    'Attachments',
    'Footer',
    'MessageSelector',
    'DiffDialog',
    'ModelPicker',
    'Select',
    'Plugin',
];
/**
 * Human-readable descriptions for each keybinding context.
 */
exports.KEYBINDING_CONTEXT_DESCRIPTIONS = {
    Global: 'Active everywhere, regardless of focus',
    Chat: 'When the chat input is focused',
    Autocomplete: 'When autocomplete menu is visible',
    Confirmation: 'When a confirmation/permission dialog is shown',
    Help: 'When the help overlay is open',
    Transcript: 'When viewing the transcript',
    HistorySearch: 'When searching command history (ctrl+r)',
    Task: 'When a task/agent is running in the foreground',
    ThemePicker: 'When the theme picker is open',
    Settings: 'When the settings menu is open',
    Tabs: 'When tab navigation is active',
    Attachments: 'When navigating image attachments in a select dialog',
    Footer: 'When footer indicators are focused',
    MessageSelector: 'When the message selector (rewind) is open',
    DiffDialog: 'When the diff dialog is open',
    ModelPicker: 'When the model picker is open',
    Select: 'When a select/list component is focused',
    Plugin: 'When the plugin dialog is open',
};
/**
 * All valid keybinding action identifiers.
 */
exports.KEYBINDING_ACTIONS = [
    // App-level actions (Global context)
    'app:interrupt',
    'app:exit',
    'app:toggleTodos',
    'app:toggleTranscript',
    'app:toggleBrief',
    'app:toggleTeammatePreview',
    'app:toggleTerminal',
    'app:redraw',
    'app:globalSearch',
    'app:quickOpen',
    // History navigation
    'history:search',
    'history:previous',
    'history:next',
    // Chat input actions
    'chat:cancel',
    'chat:killAgents',
    'chat:cycleMode',
    'chat:modelPicker',
    'chat:fastMode',
    'chat:thinkingToggle',
    'chat:submit',
    'chat:newline',
    'chat:undo',
    'chat:externalEditor',
    'chat:stash',
    'chat:imagePaste',
    'chat:messageActions',
    // Autocomplete menu actions
    'autocomplete:accept',
    'autocomplete:dismiss',
    'autocomplete:previous',
    'autocomplete:next',
    // Confirmation dialog actions
    'confirm:yes',
    'confirm:no',
    'confirm:previous',
    'confirm:next',
    'confirm:nextField',
    'confirm:previousField',
    'confirm:cycleMode',
    'confirm:toggle',
    'confirm:toggleExplanation',
    // Tabs navigation actions
    'tabs:next',
    'tabs:previous',
    // Transcript viewer actions
    'transcript:toggleShowAll',
    'transcript:exit',
    // History search actions
    'historySearch:next',
    'historySearch:accept',
    'historySearch:cancel',
    'historySearch:execute',
    // Task/agent actions
    'task:background',
    // Theme picker actions
    'theme:toggleSyntaxHighlighting',
    // Help menu actions
    'help:dismiss',
    // Attachment navigation (select dialog image attachments)
    'attachments:next',
    'attachments:previous',
    'attachments:remove',
    'attachments:exit',
    // Footer indicator actions
    'footer:up',
    'footer:down',
    'footer:next',
    'footer:previous',
    'footer:openSelected',
    'footer:clearSelection',
    'footer:close',
    // Message selector (rewind) actions
    'messageSelector:up',
    'messageSelector:down',
    'messageSelector:top',
    'messageSelector:bottom',
    'messageSelector:select',
    // Diff dialog actions
    'diff:dismiss',
    'diff:previousSource',
    'diff:nextSource',
    'diff:back',
    'diff:viewDetails',
    'diff:previousFile',
    'diff:nextFile',
    // Model picker actions (ant-only)
    'modelPicker:decreaseEffort',
    'modelPicker:increaseEffort',
    // Select component actions (distinct from confirm: to avoid collisions)
    'select:next',
    'select:previous',
    'select:accept',
    'select:cancel',
    // Plugin dialog actions
    'plugin:toggle',
    'plugin:install',
    // Permission dialog actions
    'permission:toggleDebug',
    // Settings config panel actions
    'settings:search',
    'settings:retry',
    'settings:close',
    // Voice actions
    'voice:pushToTalk',
];
/**
 * Schema for a single keybinding block.
 */
exports.KeybindingBlockSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        context: v4_1.z
            .enum(exports.KEYBINDING_CONTEXTS)
            .describe('UI context where these bindings apply. Global bindings work everywhere.'),
        bindings: v4_1.z
            .record(v4_1.z
            .string()
            .describe('Keystroke pattern (e.g., "ctrl+k", "shift+tab")'), v4_1.z
            .union([
            v4_1.z.enum(exports.KEYBINDING_ACTIONS),
            v4_1.z
                .string()
                .regex(/^command:[a-zA-Z0-9:\-_]+$/)
                .describe('Command binding (e.g., "command:help", "command:compact"). Executes the slash command as if typed.'),
            v4_1.z.null().describe('Set to null to unbind a default shortcut'),
        ])
            .describe('Action to trigger, command to invoke, or null to unbind'))
            .describe('Map of keystroke patterns to actions'),
    })
        .describe('A block of keybindings for a specific context');
});
/**
 * Schema for the entire keybindings.json file.
 * Uses object wrapper format with optional $schema and $docs metadata.
 */
exports.KeybindingsSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        $schema: v4_1.z
            .string()
            .optional()
            .describe('JSON Schema URL for editor validation'),
        $docs: v4_1.z.string().optional().describe('Documentation URL'),
        bindings: v4_1.z
            .array((0, exports.KeybindingBlockSchema)())
            .describe('Array of keybinding blocks by context'),
    })
        .describe('Claude Code keybindings configuration. Customize keyboard shortcuts by context.');
});
