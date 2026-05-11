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
exports.getExternalEditor = void 0;
exports.classifyGuiEditor = classifyGuiEditor;
exports.openFileInExternalEditor = openFileInExternalEditor;
var child_process_1 = require("child_process");
var memoize_js_1 = require("lodash-es/memoize.js");
var path_1 = require("path");
var instances_js_1 = require("../ink/instances.js");
var debug_js_1 = require("./debug.js");
var which_js_1 = require("./which.js");
function isCommandAvailable(command) {
    return !!(0, which_js_1.whichSync)(command);
}
// GUI editors that open in a separate window and can be spawned detached
// without fighting the TUI for stdin. VS Code forks (cursor, windsurf, codium)
// are listed explicitly since none contain 'code' as a substring.
var GUI_EDITORS = [
    'code',
    'cursor',
    'windsurf',
    'codium',
    'subl',
    'atom',
    'gedit',
    'notepad++',
    'notepad',
];
// Editors that accept +N as a goto-line argument. The Windows default
// ('start /wait notepad') does not — notepad treats +42 as a filename.
var PLUS_N_EDITORS = /\b(vi|vim|nvim|nano|emacs|pico|micro|helix|hx)\b/;
// VS Code and forks use -g file:line. subl uses bare file:line (no -g).
var VSCODE_FAMILY = new Set(['code', 'cursor', 'windsurf', 'codium']);
/**
 * Classify the editor as GUI or not. Returns the matched GUI family name
 * for goto-line argv selection, or undefined for terminal editors.
 * Note: this is classification only — spawn the user's actual binary, not
 * this return value, so `code-insiders` / absolute paths are preserved.
 *
 * Uses basename so /home/alice/code/bin/nvim doesn't match 'code' via the
 * directory component. code-insiders → still matches 'code', /usr/bin/code →
 * 'code' → matches.
 */
function classifyGuiEditor(editor) {
    var _a;
    var base = (0, path_1.basename)((_a = editor.split(' ')[0]) !== null && _a !== void 0 ? _a : '');
    return GUI_EDITORS.find(function (g) { return base.includes(g); });
}
/**
 * Build goto-line argv for a GUI editor. VS Code family uses -g file:line;
 * subl uses bare file:line; others don't support goto-line.
 */
function guiGotoArgv(guiFamily, filePath, line) {
    if (!line)
        return [filePath];
    if (VSCODE_FAMILY.has(guiFamily))
        return ['-g', "".concat(filePath, ":").concat(line)];
    if (guiFamily === 'subl')
        return ["".concat(filePath, ":").concat(line)];
    return [filePath];
}
/**
 * Launch a file in the user's external editor.
 *
 * For GUI editors (code, subl, etc.): spawns detached — the editor opens
 * in a separate window and Claude Code stays interactive.
 *
 * For terminal editors (vim, nvim, nano, etc.): blocks via Ink's alt-screen
 * handoff until the editor exits. This is the same dance as editFileInEditor()
 * in promptEditor.ts, minus the read-back.
 *
 * Returns true if the editor was launched, false if no editor is available.
 */
function openFileInExternalEditor(filePath, line) {
    var _a;
    var editor = (0, exports.getExternalEditor)();
    if (!editor)
        return false;
    // Spawn the user's actual binary (preserves code-insiders, abs paths, etc.).
    // Split into binary + extra args so multi-word values like 'start /wait
    // notepad' or 'code --wait' propagate all tokens to spawn.
    var parts = editor.split(' ');
    var base = (_a = parts[0]) !== null && _a !== void 0 ? _a : editor;
    var editorArgs = parts.slice(1);
    var guiFamily = classifyGuiEditor(editor);
    if (guiFamily) {
        var gotoArgv = guiGotoArgv(guiFamily, filePath, line);
        var detachedOpts = { detached: true, stdio: 'ignore' };
        var child = void 0;
        if (process.platform === 'win32') {
            // shell: true on win32 so code.cmd / cursor.cmd / windsurf.cmd resolve —
            // CreateProcess can't execute .cmd/.bat directly. Assemble quoted command
            // string; cmd.exe doesn't expand $() or backticks inside double quotes.
            // Quote each arg so paths with spaces survive the shell join.
            var gotoStr = gotoArgv.map(function (a) { return "\"".concat(a, "\""); }).join(' ');
            child = (0, child_process_1.spawn)("".concat(editor, " ").concat(gotoStr), __assign(__assign({}, detachedOpts), { shell: true }));
        }
        else {
            // POSIX: argv array with no shell — injection-safe. shell: true would
            // expand $() / backticks inside double quotes, and filePath is
            // filesystem-sourced (possible RCE from a malicious repo filename).
            child = (0, child_process_1.spawn)(base, __spreadArray(__spreadArray([], editorArgs, true), gotoArgv, true), detachedOpts);
        }
        // spawn() emits ENOENT asynchronously. ENOENT on $VISUAL/$EDITOR is a
        // user-config error, not an internal bug — don't pollute error telemetry.
        child.on('error', function (e) {
            return (0, debug_js_1.logForDebugging)("editor spawn failed: ".concat(e), { level: 'error' });
        });
        child.unref();
        return true;
    }
    // Terminal editor — needs alt-screen handoff since it takes over the
    // terminal. Blocks until the editor exits.
    var inkInstance = instances_js_1.default.get(process.stdout);
    if (!inkInstance)
        return false;
    // Only prepend +N for editors known to support it — notepad treats +42 as a
    // filename to open. Test basename so /home/vim/bin/kak doesn't match 'vim'
    // via the directory segment.
    var useGotoLine = line && PLUS_N_EDITORS.test((0, path_1.basename)(base));
    inkInstance.enterAlternateScreen();
    try {
        var syncOpts = { stdio: 'inherit' };
        var result = void 0;
        if (process.platform === 'win32') {
            // On Windows use shell: true so cmd.exe builtins like `start` resolve.
            // shell: true joins args unquoted, so assemble the command string with
            // explicit quoting ourselves (matching promptEditor.ts:74). spawnSync
            // returns errors in .error rather than throwing.
            var lineArg = useGotoLine ? "+".concat(line, " ") : '';
            result = (0, child_process_1.spawnSync)("".concat(editor, " ").concat(lineArg, "\"").concat(filePath, "\""), __assign(__assign({}, syncOpts), { shell: true }));
        }
        else {
            // POSIX: spawn directly (no shell), argv array is quote-safe.
            var args = __spreadArray(__spreadArray([], editorArgs, true), (useGotoLine ? ["+".concat(line), filePath] : [filePath]), true);
            result = (0, child_process_1.spawnSync)(base, args, syncOpts);
        }
        if (result.error) {
            (0, debug_js_1.logForDebugging)("editor spawn failed: ".concat(result.error), {
                level: 'error',
            });
            return false;
        }
        return true;
    }
    finally {
        inkInstance.exitAlternateScreen();
    }
}
exports.getExternalEditor = (0, memoize_js_1.default)(function () {
    var _a, _b;
    // Prioritize environment variables
    if ((_a = process.env.VISUAL) === null || _a === void 0 ? void 0 : _a.trim()) {
        return process.env.VISUAL.trim();
    }
    if ((_b = process.env.EDITOR) === null || _b === void 0 ? void 0 : _b.trim()) {
        return process.env.EDITOR.trim();
    }
    // `isCommandAvailable` breaks the claude process' stdin on Windows
    // as a bandaid, we skip it
    if (process.platform === 'win32') {
        return 'start /wait notepad';
    }
    // Search for available editors in order of preference
    var editors = ['code', 'vi', 'nano'];
    return editors.find(function (command) { return isCommandAvailable(command); });
});
