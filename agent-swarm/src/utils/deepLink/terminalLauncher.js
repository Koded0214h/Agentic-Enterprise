"use strict";
/**
 * Terminal Launcher
 *
 * Detects the user's preferred terminal emulator and launches Claude Code
 * inside it. Used by the deep link protocol handler when invoked by the OS
 * (i.e., not already running inside a terminal).
 *
 * Platform support:
 *   macOS  — Terminal.app, iTerm2, Ghostty, Kitty, Alacritty, WezTerm
 *   Linux  — $TERMINAL, x-terminal-emulator, gnome-terminal, konsole, etc.
 *   Windows — Windows Terminal (wt.exe), PowerShell, cmd.exe
 */
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
exports.detectTerminal = detectTerminal;
exports.launchInTerminal = launchInTerminal;
var child_process_1 = require("child_process");
var path_1 = require("path");
var config_js_1 = require("../config.js");
var debug_js_1 = require("../debug.js");
var execFileNoThrow_js_1 = require("../execFileNoThrow.js");
var which_js_1 = require("../which.js");
// macOS terminals in preference order.
// Each entry: [display name, app bundle name or CLI command, detection method]
var MACOS_TERMINALS = [
    { name: 'iTerm2', bundleId: 'com.googlecode.iterm2', app: 'iTerm' },
    { name: 'Ghostty', bundleId: 'com.mitchellh.ghostty', app: 'Ghostty' },
    { name: 'Kitty', bundleId: 'net.kovidgoyal.kitty', app: 'kitty' },
    { name: 'Alacritty', bundleId: 'org.alacritty', app: 'Alacritty' },
    { name: 'WezTerm', bundleId: 'com.github.wez.wezterm', app: 'WezTerm' },
    {
        name: 'Terminal.app',
        bundleId: 'com.apple.Terminal',
        app: 'Terminal',
    },
];
// Linux terminals in preference order (command name)
var LINUX_TERMINALS = [
    'ghostty',
    'kitty',
    'alacritty',
    'wezterm',
    'gnome-terminal',
    'konsole',
    'xfce4-terminal',
    'mate-terminal',
    'tilix',
    'xterm',
];
/**
 * Detect the user's preferred terminal on macOS.
 * Checks running processes first (most likely to be what the user prefers),
 * then falls back to checking installed .app bundles.
 */
function detectMacosTerminal() {
    return __awaiter(this, void 0, void 0, function () {
        var stored, match, termProgram, normalized_1, match, _i, MACOS_TERMINALS_1, terminal, _a, code, stdout, _b, MACOS_TERMINALS_2, terminal, lsCode;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    stored = (0, config_js_1.getGlobalConfig)().deepLinkTerminal;
                    if (stored) {
                        match = MACOS_TERMINALS.find(function (t) { return t.app === stored; });
                        if (match) {
                            return [2 /*return*/, { name: match.name, command: match.app }];
                        }
                    }
                    termProgram = process.env.TERM_PROGRAM;
                    if (termProgram) {
                        normalized_1 = termProgram.replace(/\.app$/i, '').toLowerCase();
                        match = MACOS_TERMINALS.find(function (t) {
                            return t.app.toLowerCase() === normalized_1 ||
                                t.name.toLowerCase() === normalized_1;
                        });
                        if (match) {
                            return [2 /*return*/, { name: match.name, command: match.app }];
                        }
                    }
                    _i = 0, MACOS_TERMINALS_1 = MACOS_TERMINALS;
                    _c.label = 1;
                case 1:
                    if (!(_i < MACOS_TERMINALS_1.length)) return [3 /*break*/, 4];
                    terminal = MACOS_TERMINALS_1[_i];
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('mdfind', ["kMDItemCFBundleIdentifier == \"".concat(terminal.bundleId, "\"")], { timeout: 5000, useCwd: false })];
                case 2:
                    _a = _c.sent(), code = _a.code, stdout = _a.stdout;
                    if (code === 0 && stdout.trim().length > 0) {
                        return [2 /*return*/, { name: terminal.name, command: terminal.app }];
                    }
                    _c.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    _b = 0, MACOS_TERMINALS_2 = MACOS_TERMINALS;
                    _c.label = 5;
                case 5:
                    if (!(_b < MACOS_TERMINALS_2.length)) return [3 /*break*/, 8];
                    terminal = MACOS_TERMINALS_2[_b];
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('ls', ["/Applications/".concat(terminal.app, ".app")], { timeout: 1000, useCwd: false })];
                case 6:
                    lsCode = (_c.sent()).code;
                    if (lsCode === 0) {
                        return [2 /*return*/, { name: terminal.name, command: terminal.app }];
                    }
                    _c.label = 7;
                case 7:
                    _b++;
                    return [3 /*break*/, 5];
                case 8: 
                // Terminal.app is always available on macOS
                return [2 /*return*/, { name: 'Terminal.app', command: 'Terminal' }];
            }
        });
    });
}
/**
 * Detect the user's preferred terminal on Linux.
 * Checks $TERMINAL, then x-terminal-emulator, then walks a priority list.
 */
function detectLinuxTerminal() {
    return __awaiter(this, void 0, void 0, function () {
        var termEnv, resolved, xte, _i, LINUX_TERMINALS_1, terminal, resolved;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    termEnv = process.env.TERMINAL;
                    if (!termEnv) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, which_js_1.which)(termEnv)];
                case 1:
                    resolved = _a.sent();
                    if (resolved) {
                        return [2 /*return*/, { name: (0, path_1.basename)(termEnv), command: resolved }];
                    }
                    _a.label = 2;
                case 2: return [4 /*yield*/, (0, which_js_1.which)('x-terminal-emulator')];
                case 3:
                    xte = _a.sent();
                    if (xte) {
                        return [2 /*return*/, { name: 'x-terminal-emulator', command: xte }];
                    }
                    _i = 0, LINUX_TERMINALS_1 = LINUX_TERMINALS;
                    _a.label = 4;
                case 4:
                    if (!(_i < LINUX_TERMINALS_1.length)) return [3 /*break*/, 7];
                    terminal = LINUX_TERMINALS_1[_i];
                    return [4 /*yield*/, (0, which_js_1.which)(terminal)];
                case 5:
                    resolved = _a.sent();
                    if (resolved) {
                        return [2 /*return*/, { name: terminal, command: resolved }];
                    }
                    _a.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 4];
                case 7: return [2 /*return*/, null];
            }
        });
    });
}
/**
 * Detect the user's preferred terminal on Windows.
 */
function detectWindowsTerminal() {
    return __awaiter(this, void 0, void 0, function () {
        var wt, pwsh, powershell;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, which_js_1.which)('wt.exe')];
                case 1:
                    wt = _a.sent();
                    if (wt) {
                        return [2 /*return*/, { name: 'Windows Terminal', command: wt }];
                    }
                    return [4 /*yield*/, (0, which_js_1.which)('pwsh.exe')];
                case 2:
                    pwsh = _a.sent();
                    if (pwsh) {
                        return [2 /*return*/, { name: 'PowerShell', command: pwsh }];
                    }
                    return [4 /*yield*/, (0, which_js_1.which)('powershell.exe')];
                case 3:
                    powershell = _a.sent();
                    if (powershell) {
                        return [2 /*return*/, { name: 'PowerShell', command: powershell }];
                    }
                    // cmd.exe is always available
                    return [2 /*return*/, { name: 'Command Prompt', command: 'cmd.exe' }];
            }
        });
    });
}
/**
 * Detect the user's preferred terminal emulator.
 */
function detectTerminal() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (process.platform) {
                case 'darwin':
                    return [2 /*return*/, detectMacosTerminal()];
                case 'linux':
                    return [2 /*return*/, detectLinuxTerminal()];
                case 'win32':
                    return [2 /*return*/, detectWindowsTerminal()];
                default:
                    return [2 /*return*/, null];
            }
            return [2 /*return*/];
        });
    });
}
/**
 * Launch Claude Code in the detected terminal emulator.
 *
 * Pure argv paths (no shell, user input never touches an interpreter):
 *   macOS — Ghostty, Alacritty, Kitty, WezTerm (via open -na --args)
 *   Linux — all ten in LINUX_TERMINALS
 *   Windows — Windows Terminal
 *
 * Shell-string paths (user input is shell-quoted and relied upon):
 *   macOS — iTerm2, Terminal.app (AppleScript `write text` / `do script`
 *           are inherently shell-interpreted; no argv interface exists)
 *   Windows — PowerShell -Command, cmd.exe /k (no argv exec mode)
 *
 * For pure-argv paths: claudePath, --prefill, query, cwd travel as distinct
 * argv elements end-to-end. No sh -c. No shellQuote(). The terminal does
 * chdir(cwd) and execvp(claude, argv). Spaces/quotes/metacharacters in
 * query or cwd are preserved by argv boundaries with zero interpretation.
 */
function launchInTerminal(claudePath, action) {
    return __awaiter(this, void 0, void 0, function () {
        var terminal, claudeArgs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, detectTerminal()];
                case 1:
                    terminal = _a.sent();
                    if (!terminal) {
                        (0, debug_js_1.logForDebugging)('No terminal emulator detected', { level: 'error' });
                        return [2 /*return*/, false];
                    }
                    (0, debug_js_1.logForDebugging)("Launching in terminal: ".concat(terminal.name, " (").concat(terminal.command, ")"));
                    claudeArgs = ['--deep-link-origin'];
                    if (action.repo) {
                        claudeArgs.push('--deep-link-repo', action.repo);
                        if (action.lastFetchMs !== undefined) {
                            claudeArgs.push('--deep-link-last-fetch', String(action.lastFetchMs));
                        }
                    }
                    if (action.query) {
                        claudeArgs.push('--prefill', action.query);
                    }
                    switch (process.platform) {
                        case 'darwin':
                            return [2 /*return*/, launchMacosTerminal(terminal, claudePath, claudeArgs, action.cwd)];
                        case 'linux':
                            return [2 /*return*/, launchLinuxTerminal(terminal, claudePath, claudeArgs, action.cwd)];
                        case 'win32':
                            return [2 /*return*/, launchWindowsTerminal(terminal, claudePath, claudeArgs, action.cwd)];
                        default:
                            return [2 /*return*/, false];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function launchMacosTerminal(terminal, claudePath, claudeArgs, cwd) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, shCmd, script, code, shCmd, script, code, args, code, args, code, args, code, args, code;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = terminal.command;
                    switch (_a) {
                        case 'iTerm': return [3 /*break*/, 1];
                        case 'Terminal': return [3 /*break*/, 3];
                        case 'Ghostty': return [3 /*break*/, 5];
                        case 'Alacritty': return [3 /*break*/, 7];
                        case 'kitty': return [3 /*break*/, 9];
                        case 'WezTerm': return [3 /*break*/, 11];
                    }
                    return [3 /*break*/, 13];
                case 1:
                    shCmd = buildShellCommand(claudePath, claudeArgs, cwd);
                    script = "tell application \"iTerm\"\n  if running then\n    create window with default profile\n  else\n    activate\n  end if\n  tell current session of current window\n    write text ".concat(appleScriptQuote(shCmd), "\n  end tell\nend tell");
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('osascript', ['-e', script], {
                            useCwd: false,
                        })];
                case 2:
                    code = (_b.sent()).code;
                    if (code === 0)
                        return [2 /*return*/, true];
                    return [3 /*break*/, 13];
                case 3:
                    shCmd = buildShellCommand(claudePath, claudeArgs, cwd);
                    script = "tell application \"Terminal\"\n  do script ".concat(appleScriptQuote(shCmd), "\n  activate\nend tell");
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('osascript', ['-e', script], {
                            useCwd: false,
                        })];
                case 4:
                    code = (_b.sent()).code;
                    return [2 /*return*/, code === 0];
                case 5:
                    args = [
                        '-na',
                        terminal.command,
                        '--args',
                        '--window-save-state=never',
                    ];
                    if (cwd)
                        args.push("--working-directory=".concat(cwd));
                    args.push.apply(args, __spreadArray(['-e', claudePath], claudeArgs, false));
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('open', args, { useCwd: false })];
                case 6:
                    code = (_b.sent()).code;
                    if (code === 0)
                        return [2 /*return*/, true];
                    return [3 /*break*/, 13];
                case 7:
                    args = ['-na', terminal.command, '--args'];
                    if (cwd)
                        args.push('--working-directory', cwd);
                    args.push.apply(args, __spreadArray(['-e', claudePath], claudeArgs, false));
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('open', args, { useCwd: false })];
                case 8:
                    code = (_b.sent()).code;
                    if (code === 0)
                        return [2 /*return*/, true];
                    return [3 /*break*/, 13];
                case 9:
                    args = ['-na', terminal.command, '--args'];
                    if (cwd)
                        args.push('--directory', cwd);
                    args.push.apply(args, __spreadArray([claudePath], claudeArgs, false));
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('open', args, { useCwd: false })];
                case 10:
                    code = (_b.sent()).code;
                    if (code === 0)
                        return [2 /*return*/, true];
                    return [3 /*break*/, 13];
                case 11:
                    args = ['-na', terminal.command, '--args', 'start'];
                    if (cwd)
                        args.push('--cwd', cwd);
                    args.push.apply(args, __spreadArray(['--', claudePath], claudeArgs, false));
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('open', args, { useCwd: false })];
                case 12:
                    code = (_b.sent()).code;
                    if (code === 0)
                        return [2 /*return*/, true];
                    return [3 /*break*/, 13];
                case 13:
                    (0, debug_js_1.logForDebugging)("Failed to launch ".concat(terminal.name, ", falling back to Terminal.app"));
                    return [2 /*return*/, launchMacosTerminal({ name: 'Terminal.app', command: 'Terminal' }, claudePath, claudeArgs, cwd)];
            }
        });
    });
}
function launchLinuxTerminal(terminal, claudePath, claudeArgs, cwd) {
    return __awaiter(this, void 0, void 0, function () {
        var args, spawnCwd;
        return __generator(this, function (_a) {
            switch (terminal.name) {
                case 'gnome-terminal':
                    args = cwd ? ["--working-directory=".concat(cwd), '--'] : ['--'];
                    args.push.apply(args, __spreadArray([claudePath], claudeArgs, false));
                    break;
                case 'konsole':
                    args = cwd ? ['--workdir', cwd, '-e'] : ['-e'];
                    args.push.apply(args, __spreadArray([claudePath], claudeArgs, false));
                    break;
                case 'kitty':
                    args = cwd ? ['--directory', cwd] : [];
                    args.push.apply(args, __spreadArray([claudePath], claudeArgs, false));
                    break;
                case 'wezterm':
                    args = cwd ? ['start', '--cwd', cwd, '--'] : ['start', '--'];
                    args.push.apply(args, __spreadArray([claudePath], claudeArgs, false));
                    break;
                case 'alacritty':
                    args = cwd ? ['--working-directory', cwd, '-e'] : ['-e'];
                    args.push.apply(args, __spreadArray([claudePath], claudeArgs, false));
                    break;
                case 'ghostty':
                    args = cwd ? ["--working-directory=".concat(cwd), '-e'] : ['-e'];
                    args.push.apply(args, __spreadArray([claudePath], claudeArgs, false));
                    break;
                case 'xfce4-terminal':
                case 'mate-terminal':
                    args = cwd ? ["--working-directory=".concat(cwd), '-x'] : ['-x'];
                    args.push.apply(args, __spreadArray([claudePath], claudeArgs, false));
                    break;
                case 'tilix':
                    args = cwd ? ["--working-directory=".concat(cwd), '-e'] : ['-e'];
                    args.push.apply(args, __spreadArray([claudePath], claudeArgs, false));
                    break;
                default:
                    // xterm, x-terminal-emulator, $TERMINAL — no reliable cwd flag.
                    // spawn({cwd}) sets the terminal's own cwd; most inherit.
                    args = __spreadArray(['-e', claudePath], claudeArgs, true);
                    spawnCwd = cwd;
                    break;
            }
            return [2 /*return*/, spawnDetached(terminal.command, args, { cwd: spawnCwd })];
        });
    });
}
function launchWindowsTerminal(terminal, claudePath, claudeArgs, cwd) {
    return __awaiter(this, void 0, void 0, function () {
        var args, cdCmd, cdCmd;
        return __generator(this, function (_a) {
            args = [];
            switch (terminal.name) {
                // --- PURE ARGV PATH ---
                case 'Windows Terminal':
                    if (cwd)
                        args.push('-d', cwd);
                    args.push.apply(args, __spreadArray(['--', claudePath], claudeArgs, false));
                    break;
                // --- SHELL-STRING PATHS ---
                // PowerShell -Command and cmd /k take a command string. No argv exec
                // mode that also keeps the session interactive after claude exits.
                // User input is escaped per-shell; correctness of that escaping is
                // load-bearing here.
                case 'PowerShell': {
                    cdCmd = cwd ? "Set-Location ".concat(psQuote(cwd), "; ") : '';
                    args.push('-NoExit', '-Command', "".concat(cdCmd, "& ").concat(psQuote(claudePath), " ").concat(claudeArgs.map(psQuote).join(' ')));
                    break;
                }
                default: {
                    cdCmd = cwd ? "cd /d ".concat(cmdQuote(cwd), " && ") : '';
                    args.push('/k', "".concat(cdCmd).concat(cmdQuote(claudePath), " ").concat(claudeArgs.map(function (a) { return cmdQuote(a); }).join(' ')));
                    break;
                }
            }
            // cmd.exe does NOT use MSVCRT-style argument parsing. libuv's default
            // quoting for spawn() on Windows assumes MSVCRT rules and would double-
            // escape our already-cmdQuote'd string. Bypass it for cmd.exe only.
            return [2 /*return*/, spawnDetached(terminal.command, args, {
                    windowsVerbatimArguments: terminal.name === 'Command Prompt',
                })];
        });
    });
}
/**
 * Spawn a terminal detached so the handler process can exit without
 * waiting for the terminal to close. Resolves false on spawn failure
 * (ENOENT, EACCES) rather than crashing.
 */
function spawnDetached(command, args, opts) {
    if (opts === void 0) { opts = {}; }
    return new Promise(function (resolve) {
        var child = (0, child_process_1.spawn)(command, args, {
            detached: true,
            stdio: 'ignore',
            cwd: opts.cwd,
            windowsVerbatimArguments: opts.windowsVerbatimArguments,
        });
        child.once('error', function (err) {
            (0, debug_js_1.logForDebugging)("Failed to spawn ".concat(command, ": ").concat(err.message), {
                level: 'error',
            });
            void resolve(false);
        });
        child.once('spawn', function () {
            child.unref();
            void resolve(true);
        });
    });
}
/**
 * Build a single-quoted POSIX shell command string. ONLY used by the
 * AppleScript paths (iTerm, Terminal.app) which have no argv interface.
 */
function buildShellCommand(claudePath, claudeArgs, cwd) {
    var cdPrefix = cwd ? "cd ".concat(shellQuote(cwd), " && ") : '';
    return "".concat(cdPrefix).concat(__spreadArray([claudePath], claudeArgs, true).map(shellQuote).join(' '));
}
/**
 * POSIX single-quote escaping. Single-quoted strings have zero
 * interpretation except for the closing single quote itself.
 * Only used by buildShellCommand() for the AppleScript paths.
 */
function shellQuote(s) {
    return "'".concat(s.replace(/'/g, "'\\''"), "'");
}
/**
 * AppleScript string literal escaping (backslash then double-quote).
 */
function appleScriptQuote(s) {
    return "\"".concat(s.replace(/\\/g, '\\\\').replace(/"/g, '\\"'), "\"");
}
/**
 * PowerShell single-quoted string. The ONLY special sequence is '' for a
 * literal single quote — no backtick escapes, no variable expansion, no
 * subexpressions. This is the safe PowerShell quoting; double-quoted
 * strings interpret `n `t `" etc. and can be escaped out of.
 */
function psQuote(s) {
    return "'".concat(s.replace(/'/g, "''"), "'");
}
/**
 * cmd.exe argument quoting. cmd.exe does NOT use CommandLineToArgvW-style
 * backslash escaping — it toggles its quoting state on every raw "
 * character, so an embedded " breaks out of the quoted region and exposes
 * metacharacters (& | < > ^) to cmd.exe interpretation = command injection.
 *
 * Strategy: strip " from the input (it cannot be safely represented in a
 * cmd.exe double-quoted string). Escape % as %% to prevent environment
 * variable expansion (%PATH% etc.) which cmd.exe performs even inside
 * double quotes. Trailing backslashes are still doubled because the
 * *child process* (claude.exe) uses CommandLineToArgvW, where a trailing
 * \ before our closing " would eat the close-quote.
 */
function cmdQuote(arg) {
    var stripped = arg.replace(/"/g, '').replace(/%/g, '%%');
    var escaped = stripped.replace(/(\\+)$/, '$1$1');
    return "\"".concat(escaped, "\"");
}
