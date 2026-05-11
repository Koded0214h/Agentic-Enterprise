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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPsProvider = exports.getShellConfig = void 0;
exports.findSuitableShell = findSuitableShell;
exports.exec = exec;
exports.setCwd = setCwd;
var child_process_1 = require("child_process");
var fs_1 = require("fs");
var promises_1 = require("fs/promises");
var memoize_js_1 = require("lodash-es/memoize.js");
var path_1 = require("path");
var posix_1 = require("path/posix");
var index_js_1 = require("src/services/analytics/index.js");
var state_js_1 = require("../bootstrap/state.js");
var Task_js_1 = require("../Task.js");
var cwd_js_1 = require("./cwd.js");
var debug_js_1 = require("./debug.js");
var errors_js_1 = require("./errors.js");
var fsOperations_js_1 = require("./fsOperations.js");
var log_js_1 = require("./log.js");
var ShellCommand_js_1 = require("./ShellCommand.js");
var diskOutput_js_1 = require("./task/diskOutput.js");
var TaskOutput_js_1 = require("./task/TaskOutput.js");
var which_js_1 = require("./which.js");
var fs_2 = require("fs");
var fileChangedWatcher_js_1 = require("./hooks/fileChangedWatcher.js");
var filesystem_js_1 = require("./permissions/filesystem.js");
var platform_js_1 = require("./platform.js");
var sandbox_adapter_js_1 = require("./sandbox/sandbox-adapter.js");
var sessionEnvironment_js_1 = require("./sessionEnvironment.js");
var bashProvider_js_1 = require("./shell/bashProvider.js");
var powershellDetection_js_1 = require("./shell/powershellDetection.js");
var powershellProvider_js_1 = require("./shell/powershellProvider.js");
var subprocessEnv_js_1 = require("./subprocessEnv.js");
var windowsPaths_js_1 = require("./windowsPaths.js");
var DEFAULT_TIMEOUT = 30 * 60 * 1000; // 30 minutes
function isExecutable(shellPath) {
    try {
        (0, fs_2.accessSync)(shellPath, fs_1.constants.X_OK);
        return true;
    }
    catch (_err) {
        // Fallback for Nix and other environments where X_OK check might fail
        try {
            // Try to execute the shell with --version, which should exit quickly
            // Use execFileSync to avoid shell injection vulnerabilities
            (0, child_process_1.execFileSync)(shellPath, ['--version'], {
                timeout: 1000,
                stdio: 'ignore',
            });
            return true;
        }
        catch (_a) {
            return false;
        }
    }
}
/**
 * Determines the best available shell to use.
 */
function findSuitableShell() {
    return __awaiter(this, void 0, void 0, function () {
        var shellOverride, isSupported, env_shell, isEnvShellSupported, preferBash, _a, zshPath, bashPath, shellPaths, shellOrder, supportedShells, shellPath, errorMsg;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    shellOverride = process.env.CLAUDE_CODE_SHELL;
                    if (shellOverride) {
                        isSupported = shellOverride.includes('bash') || shellOverride.includes('zsh');
                        if (isSupported && isExecutable(shellOverride)) {
                            (0, debug_js_1.logForDebugging)("Using shell override: ".concat(shellOverride));
                            return [2 /*return*/, shellOverride];
                        }
                        else {
                            // Note, if we ever want to add support for new shells here we'll need to update or Bash tool parsing to account for this
                            (0, debug_js_1.logForDebugging)("CLAUDE_CODE_SHELL=\"".concat(shellOverride, "\" is not a valid bash/zsh path, falling back to detection"));
                        }
                    }
                    env_shell = process.env.SHELL;
                    isEnvShellSupported = env_shell && (env_shell.includes('bash') || env_shell.includes('zsh'));
                    preferBash = env_shell === null || env_shell === void 0 ? void 0 : env_shell.includes('bash');
                    return [4 /*yield*/, Promise.all([(0, which_js_1.which)('zsh'), (0, which_js_1.which)('bash')])
                        // Populate shell paths from which results and fallback locations
                    ];
                case 1:
                    _a = _b.sent(), zshPath = _a[0], bashPath = _a[1];
                    shellPaths = ['/bin', '/usr/bin', '/usr/local/bin', '/opt/homebrew/bin'];
                    shellOrder = preferBash ? ['bash', 'zsh'] : ['zsh', 'bash'];
                    supportedShells = shellOrder.flatMap(function (shell) {
                        return shellPaths.map(function (path) { return "".concat(path, "/").concat(shell); });
                    });
                    // Add discovered paths to the beginning of our search list
                    // Put the user's preferred shell type first
                    if (preferBash) {
                        if (bashPath)
                            supportedShells.unshift(bashPath);
                        if (zshPath)
                            supportedShells.push(zshPath);
                    }
                    else {
                        if (zshPath)
                            supportedShells.unshift(zshPath);
                        if (bashPath)
                            supportedShells.push(bashPath);
                    }
                    // Always prioritize SHELL env variable if it's a supported shell type
                    if (isEnvShellSupported && isExecutable(env_shell)) {
                        supportedShells.unshift(env_shell);
                    }
                    shellPath = supportedShells.find(function (shell) { return shell && isExecutable(shell); });
                    // If no valid shell found, throw a helpful error
                    if (!shellPath) {
                        errorMsg = 'No suitable shell found. Claude CLI requires a Posix shell environment. ' +
                            'Please ensure you have a valid shell installed and the SHELL environment variable set.';
                        (0, log_js_1.logError)(new Error(errorMsg));
                        throw new Error(errorMsg);
                    }
                    return [2 /*return*/, shellPath];
            }
        });
    });
}
function getShellConfigImpl() {
    return __awaiter(this, void 0, void 0, function () {
        var binShell, provider;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, findSuitableShell()];
                case 1:
                    binShell = _a.sent();
                    return [4 /*yield*/, (0, bashProvider_js_1.createBashShellProvider)(binShell)];
                case 2:
                    provider = _a.sent();
                    return [2 /*return*/, { provider: provider }];
            }
        });
    });
}
// Memoize the entire shell config so it only happens once per session
exports.getShellConfig = (0, memoize_js_1.default)(getShellConfigImpl);
exports.getPsProvider = (0, memoize_js_1.default)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var psPath;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, powershellDetection_js_1.getCachedPowerShellPath)()];
            case 1:
                psPath = _a.sent();
                if (!psPath) {
                    throw new Error('PowerShell is not available');
                }
                return [2 /*return*/, (0, powershellProvider_js_1.createPowerShellProvider)(psPath)];
        }
    });
}); });
var resolveProvider = {
    bash: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.getShellConfig)()];
            case 1: return [2 /*return*/, (_a.sent()).provider];
        }
    }); }); },
    powershell: exports.getPsProvider,
};
/**
 * Execute a shell command using the environment snapshot
 * Creates a new shell process for each command execution
 */
function exec(command, abortSignal, shellType, options) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, timeout, onProgress, preventCwdChanges, shouldUseSandbox, shouldAutoBackground, onStdout, commandTimeout, provider, id, sandboxTmpDir, _b, builtCommand, cwdFilePath, commandString, cwd, _c, fallback, _d, binShell, isSandboxedPowerShell, sandboxBinShell, fs, error_1, spawnBinary, shellArgs, envOverrides, usePipeMode, taskId, taskOutput, outputHandle, O_NOFOLLOW, childProcess, shellCommand, _e, nativeCwdFilePath_1, error_2, _f;
        var _this = this;
        var _g;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    _a = options !== null && options !== void 0 ? options : {}, timeout = _a.timeout, onProgress = _a.onProgress, preventCwdChanges = _a.preventCwdChanges, shouldUseSandbox = _a.shouldUseSandbox, shouldAutoBackground = _a.shouldAutoBackground, onStdout = _a.onStdout;
                    commandTimeout = timeout || DEFAULT_TIMEOUT;
                    return [4 /*yield*/, resolveProvider[shellType]()];
                case 1:
                    provider = _h.sent();
                    id = Math.floor(Math.random() * 0x10000)
                        .toString(16)
                        .padStart(4, '0');
                    sandboxTmpDir = (0, posix_1.join)(process.env.CLAUDE_CODE_TMPDIR || '/tmp', (0, filesystem_js_1.getClaudeTempDirName)());
                    return [4 /*yield*/, provider.buildExecCommand(command, {
                            id: id,
                            sandboxTmpDir: shouldUseSandbox ? sandboxTmpDir : undefined,
                            useSandbox: shouldUseSandbox !== null && shouldUseSandbox !== void 0 ? shouldUseSandbox : false,
                        })];
                case 2:
                    _b = _h.sent(), builtCommand = _b.commandString, cwdFilePath = _b.cwdFilePath;
                    commandString = builtCommand;
                    cwd = (0, cwd_js_1.pwd)();
                    _h.label = 3;
                case 3:
                    _h.trys.push([3, 5, , 10]);
                    return [4 /*yield*/, (0, promises_1.realpath)(cwd)];
                case 4:
                    _h.sent();
                    return [3 /*break*/, 10];
                case 5:
                    _c = _h.sent();
                    fallback = (0, state_js_1.getOriginalCwd)();
                    (0, debug_js_1.logForDebugging)("Shell CWD \"".concat(cwd, "\" no longer exists, recovering to \"").concat(fallback, "\""));
                    _h.label = 6;
                case 6:
                    _h.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, (0, promises_1.realpath)(fallback)];
                case 7:
                    _h.sent();
                    (0, state_js_1.setCwdState)(fallback);
                    cwd = fallback;
                    return [3 /*break*/, 9];
                case 8:
                    _d = _h.sent();
                    return [2 /*return*/, (0, ShellCommand_js_1.createFailedCommand)("Working directory \"".concat(cwd, "\" no longer exists. Please restart Claude from an existing directory."))];
                case 9: return [3 /*break*/, 10];
                case 10:
                    // If already aborted, don't spawn the process at all
                    if (abortSignal.aborted) {
                        return [2 /*return*/, (0, ShellCommand_js_1.createAbortedCommand)()];
                    }
                    binShell = provider.shellPath;
                    isSandboxedPowerShell = shouldUseSandbox && shellType === 'powershell';
                    sandboxBinShell = isSandboxedPowerShell ? '/bin/sh' : binShell;
                    if (!shouldUseSandbox) return [3 /*break*/, 15];
                    return [4 /*yield*/, sandbox_adapter_js_1.SandboxManager.wrapWithSandbox(commandString, sandboxBinShell, undefined, abortSignal)
                        // Create sandbox temp directory for sandboxed processes with secure permissions
                    ];
                case 11:
                    commandString = _h.sent();
                    _h.label = 12;
                case 12:
                    _h.trys.push([12, 14, , 15]);
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    return [4 /*yield*/, fs.mkdir(sandboxTmpDir, { mode: 448 })];
                case 13:
                    _h.sent();
                    return [3 /*break*/, 15];
                case 14:
                    error_1 = _h.sent();
                    (0, debug_js_1.logForDebugging)("Failed to create ".concat(sandboxTmpDir, " directory: ").concat(error_1));
                    return [3 /*break*/, 15];
                case 15:
                    spawnBinary = isSandboxedPowerShell ? '/bin/sh' : binShell;
                    shellArgs = isSandboxedPowerShell
                        ? ['-c', commandString]
                        : provider.getSpawnArgs(commandString);
                    return [4 /*yield*/, provider.getEnvironmentOverrides(command)
                        // When onStdout is provided, use pipe mode: stdout flows through
                        // StreamWrapper → TaskOutput in-memory buffer instead of a file fd.
                        // This lets callers receive real-time stdout callbacks.
                    ];
                case 16:
                    envOverrides = _h.sent();
                    usePipeMode = !!onStdout;
                    taskId = (0, Task_js_1.generateTaskId)('local_bash');
                    taskOutput = new TaskOutput_js_1.TaskOutput(taskId, onProgress !== null && onProgress !== void 0 ? onProgress : null, !usePipeMode);
                    return [4 /*yield*/, (0, promises_1.mkdir)((0, diskOutput_js_1.getTaskOutputDir)(), { recursive: true })
                        // In file mode, both stdout and stderr go to the same file fd.
                        // On POSIX, O_APPEND makes each write atomic (seek-to-end + write), so
                        // stdout and stderr are interleaved chronologically without tearing.
                        // On Windows, 'a' mode strips FILE_WRITE_DATA (only grants FILE_APPEND_DATA)
                        // via libuv's fs__open. MSYS2/Cygwin probes inherited handles with
                        // NtQueryInformationFile(FileAccessInformation) and treats handles without
                        // FILE_WRITE_DATA as read-only, silently discarding all output. Using 'w'
                        // grants FILE_GENERIC_WRITE. Atomicity is preserved because duplicated
                        // handles share the same FILE_OBJECT with FILE_SYNCHRONOUS_IO_NONALERT,
                        // which serializes all I/O through a single kernel lock.
                        // SECURITY: O_NOFOLLOW prevents symlink-following attacks from the sandbox.
                        // On Windows, use string flags — numeric flags can produce EINVAL through libuv.
                    ];
                case 17:
                    _h.sent();
                    if (!!usePipeMode) return [3 /*break*/, 19];
                    O_NOFOLLOW = (_g = fs_1.constants.O_NOFOLLOW) !== null && _g !== void 0 ? _g : 0;
                    return [4 /*yield*/, (0, promises_1.open)(taskOutput.path, process.platform === 'win32'
                            ? 'w'
                            : fs_1.constants.O_WRONLY |
                                fs_1.constants.O_CREAT |
                                fs_1.constants.O_APPEND |
                                O_NOFOLLOW)];
                case 18:
                    outputHandle = _h.sent();
                    _h.label = 19;
                case 19:
                    _h.trys.push([19, 24, , 29]);
                    childProcess = (0, child_process_1.spawn)(spawnBinary, shellArgs, {
                        env: __assign(__assign(__assign(__assign({}, (0, subprocessEnv_js_1.subprocessEnv)()), { SHELL: shellType === 'bash' ? binShell : undefined, GIT_EDITOR: 'true', CLAUDECODE: '1' }), envOverrides), (process.env.USER_TYPE === 'ant'
                            ? {
                                CLAUDE_CODE_SESSION_ID: (0, state_js_1.getSessionId)(),
                            }
                            : {})),
                        cwd: cwd,
                        stdio: usePipeMode
                            ? ['pipe', 'pipe', 'pipe']
                            : ['pipe', outputHandle === null || outputHandle === void 0 ? void 0 : outputHandle.fd, outputHandle === null || outputHandle === void 0 ? void 0 : outputHandle.fd],
                        // Don't pass the signal - we'll handle termination ourselves with tree-kill
                        detached: provider.detached,
                        // Prevent visible console window on Windows (no-op on other platforms)
                        windowsHide: true,
                    });
                    shellCommand = (0, ShellCommand_js_1.wrapSpawn)(childProcess, abortSignal, commandTimeout, taskOutput, shouldAutoBackground);
                    if (!(outputHandle !== undefined)) return [3 /*break*/, 23];
                    _h.label = 20;
                case 20:
                    _h.trys.push([20, 22, , 23]);
                    return [4 /*yield*/, outputHandle.close()];
                case 21:
                    _h.sent();
                    return [3 /*break*/, 23];
                case 22:
                    _e = _h.sent();
                    return [3 /*break*/, 23];
                case 23:
                    // In pipe mode, attach the caller's callbacks alongside StreamWrapper.
                    // Both listeners receive the same data chunks (Node.js ReadableStream supports
                    // multiple 'data' listeners). StreamWrapper feeds TaskOutput for persistence;
                    // these callbacks give the caller real-time access.
                    if (childProcess.stdout && onStdout) {
                        childProcess.stdout.on('data', function (chunk) {
                            onStdout(typeof chunk === 'string' ? chunk : chunk.toString());
                        });
                    }
                    nativeCwdFilePath_1 = (0, platform_js_1.getPlatform)() === 'windows'
                        ? (0, windowsPaths_js_1.posixPathToWindowsPath)(cwdFilePath)
                        : cwdFilePath;
                    void shellCommand.result.then(function (result) { return __awaiter(_this, void 0, void 0, function () {
                        var newCwd;
                        return __generator(this, function (_a) {
                            // On Linux, bwrap creates 0-byte mount-point files on the host to deny
                            // writes to non-existent paths (.bashrc, HEAD, etc.). These persist after
                            // bwrap exits as ghost dotfiles in cwd. Cleanup is synchronous and a no-op
                            // on macOS. Keep before any await so callers awaiting .result see a clean
                            // working tree in the same microtask.
                            if (shouldUseSandbox) {
                                sandbox_adapter_js_1.SandboxManager.cleanupAfterCommand();
                            }
                            // Only foreground tasks update the cwd
                            if (result && !preventCwdChanges && !result.backgroundTaskId) {
                                try {
                                    newCwd = (0, fs_1.readFileSync)(nativeCwdFilePath_1, {
                                        encoding: 'utf8',
                                    }).trim();
                                    if ((0, platform_js_1.getPlatform)() === 'windows') {
                                        newCwd = (0, windowsPaths_js_1.posixPathToWindowsPath)(newCwd);
                                    }
                                    // cwd is NFC-normalized (setCwdState); newCwd from `pwd -P` may be
                                    // NFD on macOS APFS. Normalize before comparing so Unicode paths
                                    // don't false-positive as "changed" on every command.
                                    if (newCwd.normalize('NFC') !== cwd) {
                                        setCwd(newCwd, cwd);
                                        (0, sessionEnvironment_js_1.invalidateSessionEnvCache)();
                                        void (0, fileChangedWatcher_js_1.onCwdChangedForHooks)(cwd, newCwd);
                                    }
                                }
                                catch (_b) {
                                    (0, index_js_1.logEvent)('tengu_shell_set_cwd', { success: false });
                                }
                            }
                            // Clean up the temp file used for cwd tracking
                            try {
                                (0, fs_1.unlinkSync)(nativeCwdFilePath_1);
                            }
                            catch (_c) {
                                // File may not exist if command failed before pwd -P ran
                            }
                            return [2 /*return*/];
                        });
                    }); });
                    return [2 /*return*/, shellCommand];
                case 24:
                    error_2 = _h.sent();
                    if (!(outputHandle !== undefined)) return [3 /*break*/, 28];
                    _h.label = 25;
                case 25:
                    _h.trys.push([25, 27, , 28]);
                    return [4 /*yield*/, outputHandle.close()];
                case 26:
                    _h.sent();
                    return [3 /*break*/, 28];
                case 27:
                    _f = _h.sent();
                    return [3 /*break*/, 28];
                case 28:
                    taskOutput.clear();
                    (0, debug_js_1.logForDebugging)("Shell exec error: ".concat((0, errors_js_1.errorMessage)(error_2)));
                    return [2 /*return*/, (0, ShellCommand_js_1.createAbortedCommand)(undefined, {
                            code: 126, // Standard Unix code for execution errors
                            stderr: (0, errors_js_1.errorMessage)(error_2),
                        })];
                case 29: return [2 /*return*/];
            }
        });
    });
}
/**
 * Set the current working directory
 */
function setCwd(path, relativeTo) {
    var resolved = (0, path_1.isAbsolute)(path)
        ? path
        : (0, path_1.resolve)(relativeTo || (0, fsOperations_js_1.getFsImplementation)().cwd(), path);
    // Resolve symlinks to match the behavior of pwd -P.
    // realpathSync throws ENOENT if the path doesn't exist - convert to a
    // friendlier error message instead of a separate existsSync pre-check (TOCTOU).
    var physicalPath;
    try {
        physicalPath = (0, fsOperations_js_1.getFsImplementation)().realpathSync(resolved);
    }
    catch (e) {
        if ((0, errors_js_1.isENOENT)(e)) {
            throw new Error("Path \"".concat(resolved, "\" does not exist"));
        }
        throw e;
    }
    (0, state_js_1.setCwdState)(physicalPath);
    if (process.env.NODE_ENV !== 'test') {
        try {
            (0, index_js_1.logEvent)('tengu_shell_set_cwd', {
                success: true,
            });
        }
        catch (_error) {
            // Ignore logging errors to prevent test failures
        }
    }
}
