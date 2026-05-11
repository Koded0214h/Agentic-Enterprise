"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
exports.registerKeybindingsSkill = registerKeybindingsSkill;
var defaultBindings_js_1 = require("../../keybindings/defaultBindings.js");
var loadUserBindings_js_1 = require("../../keybindings/loadUserBindings.js");
var reservedShortcuts_js_1 = require("../../keybindings/reservedShortcuts.js");
var schema_js_1 = require("../../keybindings/schema.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var bundledSkills_js_1 = require("../bundledSkills.js");
/**
 * Build a markdown table of all contexts.
 */
function generateContextsTable() {
    return markdownTable(['Context', 'Description'], schema_js_1.KEYBINDING_CONTEXTS.map(function (ctx) { return [
        "`".concat(ctx, "`"),
        schema_js_1.KEYBINDING_CONTEXT_DESCRIPTIONS[ctx],
    ]; }));
}
/**
 * Build a markdown table of all actions with their default bindings and context.
 */
function generateActionsTable() {
    // Build a lookup: action -> { keys, context }
    var actionInfo = {};
    for (var _i = 0, DEFAULT_BINDINGS_1 = defaultBindings_js_1.DEFAULT_BINDINGS; _i < DEFAULT_BINDINGS_1.length; _i++) {
        var block = DEFAULT_BINDINGS_1[_i];
        for (var _a = 0, _b = Object.entries(block.bindings); _a < _b.length; _a++) {
            var _c = _b[_a], key = _c[0], action = _c[1];
            if (action) {
                if (!actionInfo[action]) {
                    actionInfo[action] = { keys: [], context: block.context };
                }
                actionInfo[action].keys.push(key);
            }
        }
    }
    return markdownTable(['Action', 'Default Key(s)', 'Context'], schema_js_1.KEYBINDING_ACTIONS.map(function (action) {
        var info = actionInfo[action];
        var keys = info ? info.keys.map(function (k) { return "`".concat(k, "`"); }).join(', ') : '(none)';
        var context = info ? info.context : inferContextFromAction(action);
        return ["`".concat(action, "`"), keys, context];
    }));
}
/**
 * Infer context from action prefix when not in DEFAULT_BINDINGS.
 */
function inferContextFromAction(action) {
    var _a;
    var prefix = action.split(':')[0];
    var prefixToContext = {
        app: 'Global',
        history: 'Global or Chat',
        chat: 'Chat',
        autocomplete: 'Autocomplete',
        confirm: 'Confirmation',
        tabs: 'Tabs',
        transcript: 'Transcript',
        historySearch: 'HistorySearch',
        task: 'Task',
        theme: 'ThemePicker',
        help: 'Help',
        attachments: 'Attachments',
        footer: 'Footer',
        messageSelector: 'MessageSelector',
        diff: 'DiffDialog',
        modelPicker: 'ModelPicker',
        select: 'Select',
        permission: 'Confirmation',
    };
    return (_a = prefixToContext[prefix !== null && prefix !== void 0 ? prefix : '']) !== null && _a !== void 0 ? _a : 'Unknown';
}
/**
 * Build a list of reserved shortcuts.
 */
function generateReservedShortcuts() {
    var lines = [];
    lines.push('### Non-rebindable (errors)');
    for (var _i = 0, NON_REBINDABLE_1 = reservedShortcuts_js_1.NON_REBINDABLE; _i < NON_REBINDABLE_1.length; _i++) {
        var s = NON_REBINDABLE_1[_i];
        lines.push("- `".concat(s.key, "` \u2014 ").concat(s.reason));
    }
    lines.push('');
    lines.push('### Terminal reserved (errors/warnings)');
    for (var _a = 0, TERMINAL_RESERVED_1 = reservedShortcuts_js_1.TERMINAL_RESERVED; _a < TERMINAL_RESERVED_1.length; _a++) {
        var s = TERMINAL_RESERVED_1[_a];
        lines.push("- `".concat(s.key, "` \u2014 ").concat(s.reason, " (").concat(s.severity === 'error' ? 'will not work' : 'may conflict', ")"));
    }
    lines.push('');
    lines.push('### macOS reserved (errors)');
    for (var _b = 0, MACOS_RESERVED_1 = reservedShortcuts_js_1.MACOS_RESERVED; _b < MACOS_RESERVED_1.length; _b++) {
        var s = MACOS_RESERVED_1[_b];
        lines.push("- `".concat(s.key, "` \u2014 ").concat(s.reason));
    }
    return lines.join('\n');
}
var FILE_FORMAT_EXAMPLE = {
    $schema: 'https://www.schemastore.org/claude-code-keybindings.json',
    $docs: 'https://code.claude.com/docs/en/keybindings',
    bindings: [
        {
            context: 'Chat',
            bindings: {
                'ctrl+e': 'chat:externalEditor',
            },
        },
    ],
};
var UNBIND_EXAMPLE = {
    context: 'Chat',
    bindings: {
        'ctrl+s': null,
    },
};
var REBIND_EXAMPLE = {
    context: 'Chat',
    bindings: {
        'ctrl+g': null,
        'ctrl+e': 'chat:externalEditor',
    },
};
var CHORD_EXAMPLE = {
    context: 'Global',
    bindings: {
        'ctrl+k ctrl+t': 'app:toggleTodos',
    },
};
var SECTION_INTRO = [
    '# Keybindings Skill',
    '',
    'Create or modify `~/.claude/keybindings.json` to customize keyboard shortcuts.',
    '',
    '## CRITICAL: Read Before Write',
    '',
    '**Always read `~/.claude/keybindings.json` first** (it may not exist yet). Merge changes with existing bindings — never replace the entire file.',
    '',
    '- Use **Edit** tool for modifications to existing files',
    '- Use **Write** tool only if the file does not exist yet',
].join('\n');
var SECTION_FILE_FORMAT = [
    '## File Format',
    '',
    '```json',
    (0, slowOperations_js_1.jsonStringify)(FILE_FORMAT_EXAMPLE, null, 2),
    '```',
    '',
    'Always include the `$schema` and `$docs` fields.',
].join('\n');
var SECTION_KEYSTROKE_SYNTAX = [
    '## Keystroke Syntax',
    '',
    '**Modifiers** (combine with `+`):',
    '- `ctrl` (alias: `control`)',
    '- `alt` (aliases: `opt`, `option`) — note: `alt` and `meta` are identical in terminals',
    '- `shift`',
    '- `meta` (aliases: `cmd`, `command`)',
    '',
    '**Special keys**: `escape`/`esc`, `enter`/`return`, `tab`, `space`, `backspace`, `delete`, `up`, `down`, `left`, `right`',
    '',
    '**Chords**: Space-separated keystrokes, e.g. `ctrl+k ctrl+s` (1-second timeout between keystrokes)',
    '',
    '**Examples**: `ctrl+shift+p`, `alt+enter`, `ctrl+k ctrl+n`',
].join('\n');
var SECTION_UNBINDING = [
    '## Unbinding Default Shortcuts',
    '',
    'Set a key to `null` to remove its default binding:',
    '',
    '```json',
    (0, slowOperations_js_1.jsonStringify)(UNBIND_EXAMPLE, null, 2),
    '```',
].join('\n');
var SECTION_INTERACTION = [
    '## How User Bindings Interact with Defaults',
    '',
    '- User bindings are **additive** — they are appended after the default bindings',
    '- To **move** a binding to a different key: unbind the old key (`null`) AND add the new binding',
    "- A context only needs to appear in the user's file if they want to change something in that context",
].join('\n');
var SECTION_COMMON_PATTERNS = [
    '## Common Patterns',
    '',
    '### Rebind a key',
    'To change the external editor shortcut from `ctrl+g` to `ctrl+e`:',
    '```json',
    (0, slowOperations_js_1.jsonStringify)(REBIND_EXAMPLE, null, 2),
    '```',
    '',
    '### Add a chord binding',
    '```json',
    (0, slowOperations_js_1.jsonStringify)(CHORD_EXAMPLE, null, 2),
    '```',
].join('\n');
var SECTION_BEHAVIORAL_RULES = [
    '## Behavioral Rules',
    '',
    '1. Only include contexts the user wants to change (minimal overrides)',
    '2. Validate that actions and contexts are from the known lists below',
    '3. Warn the user proactively if they choose a key that conflicts with reserved shortcuts or common tools like tmux (`ctrl+b`) and screen (`ctrl+a`)',
    '4. When adding a new binding for an existing action, the new binding is additive (existing default still works unless explicitly unbound)',
    '5. To fully replace a default binding, unbind the old key AND add the new one',
].join('\n');
var SECTION_DOCTOR = [
    '## Validation with /doctor',
    '',
    'The `/doctor` command includes a "Keybinding Configuration Issues" section that validates `~/.claude/keybindings.json`.',
    '',
    '### Common Issues and Fixes',
    '',
    markdownTable(['Issue', 'Cause', 'Fix'], [
        [
            '`keybindings.json must have a "bindings" array`',
            'Missing wrapper object',
            'Wrap bindings in `{ "bindings": [...] }`',
        ],
        [
            '`"bindings" must be an array`',
            '`bindings` is not an array',
            'Set `"bindings"` to an array: `[{ context: ..., bindings: ... }]`',
        ],
        [
            '`Unknown context "X"`',
            'Typo or invalid context name',
            'Use exact context names from the Available Contexts table',
        ],
        [
            '`Duplicate key "X" in Y bindings`',
            'Same key defined twice in one context',
            'Remove the duplicate; JSON uses only the last value',
        ],
        [
            '`"X" may not work: ...`',
            'Key conflicts with terminal/OS reserved shortcut',
            'Choose a different key (see Reserved Shortcuts section)',
        ],
        [
            '`Could not parse keystroke "X"`',
            'Invalid key syntax',
            'Check syntax: use `+` between modifiers, valid key names',
        ],
        [
            '`Invalid action for "X"`',
            'Action value is not a string or null',
            'Actions must be strings like `"app:help"` or `null` to unbind',
        ],
    ]),
    '',
    '### Example /doctor Output',
    '',
    '```',
    'Keybinding Configuration Issues',
    'Location: ~/.claude/keybindings.json',
    '  └ [Error] Unknown context "chat"',
    '    → Valid contexts: Global, Chat, Autocomplete, ...',
    '  └ [Warning] "ctrl+c" may not work: Terminal interrupt (SIGINT)',
    '```',
    '',
    '**Errors** prevent bindings from working and must be fixed. **Warnings** indicate potential conflicts but the binding may still work.',
].join('\n');
function registerKeybindingsSkill() {
    (0, bundledSkills_js_1.registerBundledSkill)({
        name: 'keybindings-help',
        description: 'Use when the user wants to customize keyboard shortcuts, rebind keys, add chord bindings, or modify ~/.claude/keybindings.json. Examples: "rebind ctrl+s", "add a chord shortcut", "change the submit key", "customize keybindings".',
        allowedTools: ['Read'],
        userInvocable: false,
        isEnabled: loadUserBindings_js_1.isKeybindingCustomizationEnabled,
        getPromptForCommand: function (args) {
            return __awaiter(this, void 0, void 0, function () {
                var contextsTable, actionsTable, reservedShortcuts, sections;
                return __generator(this, function (_a) {
                    contextsTable = generateContextsTable();
                    actionsTable = generateActionsTable();
                    reservedShortcuts = generateReservedShortcuts();
                    sections = [
                        SECTION_INTRO,
                        SECTION_FILE_FORMAT,
                        SECTION_KEYSTROKE_SYNTAX,
                        SECTION_UNBINDING,
                        SECTION_INTERACTION,
                        SECTION_COMMON_PATTERNS,
                        SECTION_BEHAVIORAL_RULES,
                        SECTION_DOCTOR,
                        "## Reserved Shortcuts\n\n".concat(reservedShortcuts),
                        "## Available Contexts\n\n".concat(contextsTable),
                        "## Available Actions\n\n".concat(actionsTable),
                    ];
                    if (args) {
                        sections.push("## User Request\n\n".concat(args));
                    }
                    return [2 /*return*/, [{ type: 'text', text: sections.join('\n\n') }]];
                });
            });
        },
    });
}
/**
 * Build a markdown table from headers and rows.
 */
function markdownTable(headers, rows) {
    var separator = headers.map(function () { return '---'; });
    return __spreadArray([
        "| ".concat(headers.join(' | '), " |"),
        "| ".concat(separator.join(' | '), " |")
    ], rows.map(function (row) { return "| ".concat(row.join(' | '), " |"); }), true).join('\n');
}
