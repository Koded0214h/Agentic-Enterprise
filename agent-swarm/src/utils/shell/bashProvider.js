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
exports.createBashShellProvider = createBashShellProvider;
var bun_bundle_1 = require("bun:bundle");
var promises_1 = require("fs/promises");
var os_1 = require("os");
var path_1 = require("path");
var posix_1 = require("path/posix");
var bashPipeCommand_js_1 = require("../bash/bashPipeCommand.js");
var ShellSnapshot_js_1 = require("../bash/ShellSnapshot.js");
var shellPrefix_js_1 = require("../bash/shellPrefix.js");
var shellQuote_js_1 = require("../bash/shellQuote.js");
var shellQuoting_js_1 = require("../bash/shellQuoting.js");
var debug_js_1 = require("../debug.js");
var platform_js_1 = require("../platform.js");
var sessionEnvironment_js_1 = require("../sessionEnvironment.js");
var sessionEnvVars_js_1 = require("../sessionEnvVars.js");
var tmuxSocket_js_1 = require("../tmuxSocket.js");
var windowsPaths_js_1 = require("../windowsPaths.js");
/**
 * Returns a shell command to disable extended glob patterns for security.
 * Extended globs (bash extglob, zsh EXTENDED_GLOB) can be exploited via
 * malicious filenames that expand after our security validation.
 *
 * When CLAUDE_CODE_SHELL_PREFIX is set, the actual executing shell may differ
 * from shellPath (e.g., shellPath is zsh but the wrapper runs bash). In this
 * case, we include commands for BOTH shells. We redirect both stdout and stderr
 * to /dev/null because zsh's command_not_found_handler writes to STDOUT.
 *
 * When no shell prefix is set, we use the appropriate command for the detected shell.
 */
function getDisableExtglobCommand(shellPath) {
    // When CLAUDE_CODE_SHELL_PREFIX is set, the wrapper may use a different shell
    // than shellPath, so we include both bash and zsh commands
    if (process.env.CLAUDE_CODE_SHELL_PREFIX) {
        // Redirect both stdout and stderr because zsh's command_not_found_handler
        // writes to stdout instead of stderr
        return '{ shopt -u extglob || setopt NO_EXTENDED_GLOB; } >/dev/null 2>&1 || true';
    }
    // No shell prefix - use shell-specific command
    if (shellPath.includes('bash')) {
        return 'shopt -u extglob 2>/dev/null || true';
    }
    else if (shellPath.includes('zsh')) {
        return 'setopt NO_EXTENDED_GLOB 2>/dev/null || true';
    }
    // Unknown shell - do nothing, we don't know the right command
    return null;
}
function createBashShellProvider(shellPath, options) {
    return __awaiter(this, void 0, void 0, function () {
        var currentSandboxTmpDir, snapshotPromise, lastSnapshotFilePath;
        return __generator(this, function (_a) {
            snapshotPromise = (options === null || options === void 0 ? void 0 : options.skipSnapshot)
                ? Promise.resolve(undefined)
                : (0, ShellSnapshot_js_1.createAndSaveSnapshot)(shellPath).catch(function (error) {
                    (0, debug_js_1.logForDebugging)("Failed to create shell snapshot: ".concat(error));
                    return undefined;
                });
            return [2 /*return*/, {
                    type: 'bash',
                    shellPath: shellPath,
                    detached: true,
                    buildExecCommand: function (command, opts) {
                        return __awaiter(this, void 0, void 0, function () {
                            var snapshotFilePath, _a, tmpdir, isWindows, shellTmpdir, shellCwdFilePath, cwdFilePath, normalizedCommand, addStdinRedirect, quotedCommand, commandParts, finalPath, sessionEnvScript, disableExtglobCmd, commandString;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, snapshotPromise
                                        // This access() check is NOT pure TOCTOU — it's the fallback decision
                                        // point for getSpawnArgs. When the snapshot disappears mid-session
                                        // (tmpdir cleanup), we must clear lastSnapshotFilePath so getSpawnArgs
                                        // adds -l and the command gets login-shell init. Without this check,
                                        // `source ... || true` silently fails and commands run with NO shell
                                        // init (neither snapshot env nor login profile). The `|| true` on source
                                        // still guards the race between this check and the spawned shell.
                                    ];
                                    case 1:
                                        snapshotFilePath = _b.sent();
                                        if (!snapshotFilePath) return [3 /*break*/, 5];
                                        _b.label = 2;
                                    case 2:
                                        _b.trys.push([2, 4, , 5]);
                                        return [4 /*yield*/, (0, promises_1.access)(snapshotFilePath)];
                                    case 3:
                                        _b.sent();
                                        return [3 /*break*/, 5];
                                    case 4:
                                        _a = _b.sent();
                                        (0, debug_js_1.logForDebugging)("Snapshot file missing, falling back to login shell: ".concat(snapshotFilePath));
                                        snapshotFilePath = undefined;
                                        return [3 /*break*/, 5];
                                    case 5:
                                        lastSnapshotFilePath = snapshotFilePath;
                                        // Stash sandboxTmpDir for use in getEnvironmentOverrides
                                        currentSandboxTmpDir = opts.sandboxTmpDir;
                                        tmpdir = (0, os_1.tmpdir)();
                                        isWindows = (0, platform_js_1.getPlatform)() === 'windows';
                                        shellTmpdir = isWindows ? (0, windowsPaths_js_1.windowsPathToPosixPath)(tmpdir) : tmpdir;
                                        shellCwdFilePath = opts.useSandbox
                                            ? (0, posix_1.join)(opts.sandboxTmpDir, "cwd-".concat(opts.id))
                                            : (0, posix_1.join)(shellTmpdir, "claude-".concat(opts.id, "-cwd"));
                                        cwdFilePath = opts.useSandbox
                                            ? (0, posix_1.join)(opts.sandboxTmpDir, "cwd-".concat(opts.id))
                                            : (0, path_1.join)(tmpdir, "claude-".concat(opts.id, "-cwd"));
                                        normalizedCommand = (0, shellQuoting_js_1.rewriteWindowsNullRedirect)(command);
                                        addStdinRedirect = (0, shellQuoting_js_1.shouldAddStdinRedirect)(normalizedCommand);
                                        quotedCommand = (0, shellQuoting_js_1.quoteShellCommand)(normalizedCommand, addStdinRedirect);
                                        // Debug logging for heredoc/multiline commands to trace trailer handling
                                        // Only log when commit attribution is enabled to avoid noise
                                        if ((0, bun_bundle_1.feature)('COMMIT_ATTRIBUTION') &&
                                            (command.includes('<<') || command.includes('\n'))) {
                                            (0, debug_js_1.logForDebugging)("Shell: Command before quoting (first 500 chars):\n".concat(command.slice(0, 500)));
                                            (0, debug_js_1.logForDebugging)("Shell: Quoted command (first 500 chars):\n".concat(quotedCommand.slice(0, 500)));
                                        }
                                        // Special handling for pipes: move stdin redirect after first command
                                        // This ensures the redirect applies to the first command, not to eval itself.
                                        // Without this, `eval 'rg foo | wc -l' \< /dev/null` becomes
                                        // `rg foo | wc -l < /dev/null` — wc reads /dev/null and outputs 0, and
                                        // rg (with no path arg) waits on the open spawn stdin pipe forever.
                                        // Applies to sandbox mode too: sandbox wraps the assembled commandString,
                                        // not the raw command (since PR #9189).
                                        if (normalizedCommand.includes('|') && addStdinRedirect) {
                                            quotedCommand = (0, bashPipeCommand_js_1.rearrangePipeCommand)(normalizedCommand);
                                        }
                                        commandParts = [];
                                        // Source the snapshot file. The `|| true` guards the race between the
                                        // access() check above and the spawned shell's `source` — if the file
                                        // vanishes in that window, the `&&` chain still continues.
                                        if (snapshotFilePath) {
                                            finalPath = (0, platform_js_1.getPlatform)() === 'windows'
                                                ? (0, windowsPaths_js_1.windowsPathToPosixPath)(snapshotFilePath)
                                                : snapshotFilePath;
                                            commandParts.push("source ".concat((0, shellQuote_js_1.quote)([finalPath]), " 2>/dev/null || true"));
                                        }
                                        return [4 /*yield*/, (0, sessionEnvironment_js_1.getSessionEnvironmentScript)()];
                                    case 6:
                                        sessionEnvScript = _b.sent();
                                        if (sessionEnvScript) {
                                            commandParts.push(sessionEnvScript);
                                        }
                                        disableExtglobCmd = getDisableExtglobCommand(shellPath);
                                        if (disableExtglobCmd) {
                                            commandParts.push(disableExtglobCmd);
                                        }
                                        // When sourcing a file with aliases, they won't be expanded in the same command line
                                        // because the shell parses the entire line before execution. Using eval after
                                        // sourcing causes a second parsing pass where aliases are now available for expansion.
                                        commandParts.push("eval ".concat(quotedCommand));
                                        // Use `pwd -P` to get the physical path of the current working directory for consistency with `process.cwd()`
                                        commandParts.push("pwd -P >| ".concat((0, shellQuote_js_1.quote)([shellCwdFilePath])));
                                        commandString = commandParts.join(' && ');
                                        // Apply CLAUDE_CODE_SHELL_PREFIX if set
                                        if (process.env.CLAUDE_CODE_SHELL_PREFIX) {
                                            commandString = (0, shellPrefix_js_1.formatShellPrefixCommand)(process.env.CLAUDE_CODE_SHELL_PREFIX, commandString);
                                        }
                                        return [2 /*return*/, { commandString: commandString, cwdFilePath: cwdFilePath }];
                                }
                            });
                        });
                    },
                    getSpawnArgs: function (commandString) {
                        var skipLoginShell = lastSnapshotFilePath !== undefined;
                        if (skipLoginShell) {
                            (0, debug_js_1.logForDebugging)('Spawning shell without login (-l flag skipped)');
                        }
                        return __spreadArray(__spreadArray(['-c'], (skipLoginShell ? [] : ['-l']), true), [commandString], false);
                    },
                    getEnvironmentOverrides: function (command) {
                        return __awaiter(this, void 0, void 0, function () {
                            var commandUsesTmux, claudeTmuxEnv, env, posixTmpDir, _i, _a, _b, key, value;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        commandUsesTmux = command.includes('tmux');
                                        if (!(process.env.USER_TYPE === 'ant' &&
                                            ((0, tmuxSocket_js_1.hasTmuxToolBeenUsed)() || commandUsesTmux))) return [3 /*break*/, 2];
                                        return [4 /*yield*/, (0, tmuxSocket_js_1.ensureSocketInitialized)()];
                                    case 1:
                                        _c.sent();
                                        _c.label = 2;
                                    case 2:
                                        claudeTmuxEnv = (0, tmuxSocket_js_1.getClaudeTmuxEnv)();
                                        env = {};
                                        // CRITICAL: Override TMUX to isolate ALL tmux commands to Claude's socket.
                                        // This is NOT the user's TMUX value - it points to Claude's isolated socket.
                                        // When null (before socket initializes), user's TMUX is preserved.
                                        if (claudeTmuxEnv) {
                                            env.TMUX = claudeTmuxEnv;
                                        }
                                        if (currentSandboxTmpDir) {
                                            posixTmpDir = currentSandboxTmpDir;
                                            if ((0, platform_js_1.getPlatform)() === 'windows') {
                                                posixTmpDir = (0, windowsPaths_js_1.windowsPathToPosixPath)(posixTmpDir);
                                            }
                                            env.TMPDIR = posixTmpDir;
                                            env.CLAUDE_CODE_TMPDIR = posixTmpDir;
                                            // Zsh uses TMPPREFIX (default /tmp/zsh) for heredoc temp files,
                                            // not TMPDIR. Set it to a path inside the sandbox tmp dir so
                                            // heredocs work in sandboxed zsh commands.
                                            // Safe to set unconditionally — non-zsh shells ignore TMPPREFIX.
                                            env.TMPPREFIX = (0, posix_1.join)(posixTmpDir, 'zsh');
                                        }
                                        // Apply session env vars set via /env (child processes only, not the REPL)
                                        for (_i = 0, _a = (0, sessionEnvVars_js_1.getSessionEnvVars)(); _i < _a.length; _i++) {
                                            _b = _a[_i], key = _b[0], value = _b[1];
                                            env[key] = value;
                                        }
                                        return [2 /*return*/, env];
                                }
                            });
                        });
                    },
                }];
        });
    });
}
