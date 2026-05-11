"use strict";
/**
 * TMUX SOCKET ISOLATION
 * =====================
 * This module manages an isolated tmux socket for Claude's operations.
 *
 * WHY THIS EXISTS:
 * Without isolation, Claude could accidentally affect the user's tmux sessions.
 * For example, running `tmux kill-session` via the Bash tool would kill the
 * user's current session if they started Claude from within tmux.
 *
 * HOW IT WORKS:
 * 1. Claude creates its own tmux socket: `claude-<PID>` (e.g., `claude-12345`)
 * 2. ALL Tmux tool commands use this socket via the `-L` flag
 * 3. ALL Bash tool commands inherit TMUX env var pointing to this socket
 *    (set in Shell.ts via getClaudeTmuxEnv())
 *
 * This means ANY tmux command run through Claude - whether via the Tmux tool
 * directly or via Bash - will operate on Claude's isolated socket, NOT the
 * user's tmux session.
 *
 * IMPORTANT: The user's original TMUX env var is NOT used. After socket
 * initialization, getClaudeTmuxEnv() returns a value that overrides the
 * user's TMUX in all child processes spawned by Shell.ts.
 */
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
exports.getClaudeSocketName = getClaudeSocketName;
exports.getClaudeSocketPath = getClaudeSocketPath;
exports.setClaudeSocketInfo = setClaudeSocketInfo;
exports.isSocketInitialized = isSocketInitialized;
exports.getClaudeTmuxEnv = getClaudeTmuxEnv;
exports.checkTmuxAvailable = checkTmuxAvailable;
exports.isTmuxAvailable = isTmuxAvailable;
exports.markTmuxToolUsed = markTmuxToolUsed;
exports.hasTmuxToolBeenUsed = hasTmuxToolBeenUsed;
exports.ensureSocketInitialized = ensureSocketInitialized;
exports.resetSocketState = resetSocketState;
var path_1 = require("path");
var cleanupRegistry_js_1 = require("./cleanupRegistry.js");
var debug_js_1 = require("./debug.js");
var errors_js_1 = require("./errors.js");
var execFileNoThrow_js_1 = require("./execFileNoThrow.js");
var log_js_1 = require("./log.js");
var platform_js_1 = require("./platform.js");
// Constants for tmux socket management
var TMUX_COMMAND = 'tmux';
var CLAUDE_SOCKET_PREFIX = 'claude';
/**
 * Executes a tmux command, routing through WSL on Windows.
 * On Windows, tmux only exists inside WSL — WSL interop lets the tmux session
 * launch .exe files as native Win32 processes while stdin/stdout flow through
 * the WSL pty.
 */
function execTmux(args, opts) {
    return __awaiter(this, void 0, void 0, function () {
        var result_1, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!((0, platform_js_1.getPlatform)() === 'windows')) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('wsl', __spreadArray(['-e', TMUX_COMMAND], args, true), __assign({ env: __assign(__assign({}, process.env), { WSL_UTF8: '1' }) }, opts))];
                case 1:
                    result_1 = _a.sent();
                    return [2 /*return*/, {
                            stdout: result_1.stdout || '',
                            stderr: result_1.stderr || '',
                            code: result_1.code || 0,
                        }];
                case 2: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)(TMUX_COMMAND, args, opts)];
                case 3:
                    result = _a.sent();
                    return [2 /*return*/, {
                            stdout: result.stdout || '',
                            stderr: result.stderr || '',
                            code: result.code || 0,
                        }];
            }
        });
    });
}
// Socket state - initialized lazily when Tmux tool is first used or a tmux command is run
var socketName = null;
var socketPath = null;
var serverPid = null;
var isInitializing = false;
var initPromise = null;
// tmux availability - checked once upfront
var tmuxAvailabilityChecked = false;
var tmuxAvailable = false;
// Track whether the Tmux tool has been used at least once
// Used to defer socket initialization until actually needed
var tmuxToolUsed = false;
/**
 * Gets the socket name for Claude's isolated tmux session.
 * Format: claude-<PID>
 */
function getClaudeSocketName() {
    if (!socketName) {
        socketName = "".concat(CLAUDE_SOCKET_PREFIX, "-").concat(process.pid);
    }
    return socketName;
}
/**
 * Gets the socket path if the socket has been initialized.
 * Returns null if not yet initialized.
 */
function getClaudeSocketPath() {
    return socketPath;
}
/**
 * Sets socket info after initialization.
 * Called after the tmux session is created.
 */
function setClaudeSocketInfo(path, pid) {
    socketPath = path;
    serverPid = pid;
}
/**
 * Returns whether the socket has been initialized.
 */
function isSocketInitialized() {
    return socketPath !== null && serverPid !== null;
}
/**
 * Gets the TMUX environment variable value for Claude's isolated socket.
 *
 * CRITICAL: This value is used by Shell.ts to override the TMUX env var
 * in ALL child processes. This ensures that any `tmux` command run via
 * the Bash tool will operate on Claude's socket, NOT the user's session.
 *
 * Format: "socket_path,server_pid,pane_index" (matches tmux's TMUX env var)
 * Example: "/tmp/tmux-501/claude-12345,54321,0"
 *
 * Returns null if socket is not yet initialized.
 * When null, Shell.ts does not override TMUX, preserving user's environment.
 */
function getClaudeTmuxEnv() {
    if (!socketPath || serverPid === null) {
        return null;
    }
    return "".concat(socketPath, ",").concat(serverPid, ",0");
}
/**
 * Checks if tmux is available on this system.
 * This is checked once and cached for the lifetime of the process.
 *
 * When tmux is not available:
 * - TungstenTool (Tmux) will not work
 * - TeammateTool will not work (it uses tmux for pane management)
 * - Bash commands will run without tmux isolation
 */
function checkTmuxAvailable() {
    return __awaiter(this, void 0, void 0, function () {
        var result, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!!tmuxAvailabilityChecked) return [3 /*break*/, 5];
                    if (!((0, platform_js_1.getPlatform)() === 'windows')) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('wsl', ['-e', TMUX_COMMAND, '-V'], {
                            env: __assign(__assign({}, process.env), { WSL_UTF8: '1' }),
                            useCwd: false,
                        })];
                case 1:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('which', [TMUX_COMMAND], {
                        useCwd: false,
                    })];
                case 3:
                    _a = _b.sent();
                    _b.label = 4;
                case 4:
                    result = _a;
                    tmuxAvailable = result.code === 0;
                    if (!tmuxAvailable) {
                        (0, debug_js_1.logForDebugging)("[Socket] tmux is not installed. The Tmux tool and Teammate tool will not be available.");
                    }
                    tmuxAvailabilityChecked = true;
                    _b.label = 5;
                case 5: return [2 /*return*/, tmuxAvailable];
            }
        });
    });
}
/**
 * Returns the cached tmux availability status.
 * Returns false if availability hasn't been checked yet.
 * Use checkTmuxAvailable() to perform the check.
 */
function isTmuxAvailable() {
    return tmuxAvailabilityChecked && tmuxAvailable;
}
/**
 * Marks that the Tmux tool has been used at least once.
 * Called by TungstenTool before initialization.
 * After this is called, Shell.ts will initialize the socket for subsequent Bash commands.
 */
function markTmuxToolUsed() {
    tmuxToolUsed = true;
}
/**
 * Returns whether the Tmux tool has been used at least once.
 * Used by Shell.ts to decide whether to initialize the socket.
 */
function hasTmuxToolBeenUsed() {
    return tmuxToolUsed;
}
/**
 * Ensures the socket is initialized with a tmux session.
 * Called by Shell.ts when the Tmux tool has been used or the command includes "tmux".
 * Safe to call multiple times; will only initialize once.
 *
 * If tmux is not installed, this function returns gracefully without
 * initializing the socket. getClaudeTmuxEnv() will return null, and
 * Bash commands will run without tmux isolation.
 */
function ensureSocketInitialized() {
    return __awaiter(this, void 0, void 0, function () {
        var available, _a, error_1, err;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    // Already initialized
                    if (isSocketInitialized()) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, checkTmuxAvailable()];
                case 1:
                    available = _b.sent();
                    if (!available) {
                        return [2 /*return*/];
                    }
                    if (!(isInitializing && initPromise)) return [3 /*break*/, 6];
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, initPromise];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
                case 6:
                    isInitializing = true;
                    initPromise = doInitialize();
                    _b.label = 7;
                case 7:
                    _b.trys.push([7, 9, 10, 11]);
                    return [4 /*yield*/, initPromise];
                case 8:
                    _b.sent();
                    return [3 /*break*/, 11];
                case 9:
                    error_1 = _b.sent();
                    err = (0, errors_js_1.toError)(error_1);
                    (0, log_js_1.logError)(err);
                    (0, debug_js_1.logForDebugging)("[Socket] Failed to initialize tmux socket: ".concat(err.message, ". Tmux isolation will be disabled."));
                    return [3 /*break*/, 11];
                case 10:
                    isInitializing = false;
                    return [7 /*endfinally*/];
                case 11: return [2 /*return*/];
            }
        });
    });
}
/**
 * Kills the tmux server for Claude's isolated socket.
 * Called during graceful shutdown to clean up resources.
 */
function killTmuxServer() {
    return __awaiter(this, void 0, void 0, function () {
        var socket, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    socket = getClaudeSocketName();
                    (0, debug_js_1.logForDebugging)("[Socket] Killing tmux server for socket: ".concat(socket));
                    return [4 /*yield*/, execTmux(['-L', socket, 'kill-server'])];
                case 1:
                    result = _a.sent();
                    if (result.code === 0) {
                        (0, debug_js_1.logForDebugging)("[Socket] Successfully killed tmux server");
                    }
                    else {
                        // Server may already be dead, which is fine
                        (0, debug_js_1.logForDebugging)("[Socket] Failed to kill tmux server (exit ".concat(result.code, "): ").concat(result.stderr));
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function doInitialize() {
    return __awaiter(this, void 0, void 0, function () {
        var socket, result, checkResult, infoResult, _a, path, pidStr, pid, uid, baseTmpDir, fallbackPath, pidResult, pid;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    socket = getClaudeSocketName();
                    return [4 /*yield*/, execTmux(__spreadArray([
                            '-L',
                            socket,
                            'new-session',
                            '-d',
                            '-s',
                            'base',
                            '-e',
                            'CLAUDE_CODE_SKIP_PROMPT_HISTORY=true'
                        ], ((0, platform_js_1.getPlatform)() === 'windows'
                            ? ['-e', 'WSL_INTEROP=/run/WSL/1_interop']
                            : []), true))];
                case 1:
                    result = _d.sent();
                    if (!(result.code !== 0)) return [3 /*break*/, 3];
                    return [4 /*yield*/, execTmux([
                            '-L',
                            socket,
                            'has-session',
                            '-t',
                            'base',
                        ])];
                case 2:
                    checkResult = _d.sent();
                    if (checkResult.code !== 0) {
                        throw new Error("Failed to create tmux session on socket ".concat(socket, ": ").concat(result.stderr));
                    }
                    _d.label = 3;
                case 3:
                    // Register cleanup to kill the tmux server on exit
                    (0, cleanupRegistry_js_1.registerCleanup)(killTmuxServer);
                    // Set CLAUDE_CODE_SKIP_PROMPT_HISTORY in the tmux GLOBAL environment (-g).
                    // Without -g this would only apply to the 'base' session, and new sessions
                    // created by TungstenTool (e.g. 'test', 'verify') would not inherit it.
                    // Any Claude Code instance spawned on this socket will inherit this env var,
                    // preventing test/verification sessions from polluting the user's real
                    // command history and --resume session list.
                    return [4 /*yield*/, execTmux([
                            '-L',
                            socket,
                            'set-environment',
                            '-g',
                            'CLAUDE_CODE_SKIP_PROMPT_HISTORY',
                            'true',
                        ])
                        // Same WSL_INTEROP pin as the new-session -e above, but in the GLOBAL env
                        // so sessions created by TungstenTool inherit it too. The -e on new-session
                        // only covers the base session's initial shell; a later `new-session -s cc`
                        // inherits the SERVER's env, which still holds the stale socket from the
                        // wsl.exe that spawned it.
                    ];
                case 4:
                    // Set CLAUDE_CODE_SKIP_PROMPT_HISTORY in the tmux GLOBAL environment (-g).
                    // Without -g this would only apply to the 'base' session, and new sessions
                    // created by TungstenTool (e.g. 'test', 'verify') would not inherit it.
                    // Any Claude Code instance spawned on this socket will inherit this env var,
                    // preventing test/verification sessions from polluting the user's real
                    // command history and --resume session list.
                    _d.sent();
                    if (!((0, platform_js_1.getPlatform)() === 'windows')) return [3 /*break*/, 6];
                    return [4 /*yield*/, execTmux([
                            '-L',
                            socket,
                            'set-environment',
                            '-g',
                            'WSL_INTEROP',
                            '/run/WSL/1_interop',
                        ])];
                case 5:
                    _d.sent();
                    _d.label = 6;
                case 6: return [4 /*yield*/, execTmux([
                        '-L',
                        socket,
                        'display-message',
                        '-p',
                        '#{socket_path},#{pid}',
                    ])];
                case 7:
                    infoResult = _d.sent();
                    if (infoResult.code === 0) {
                        _a = infoResult.stdout.trim().split(','), path = _a[0], pidStr = _a[1];
                        if (path && pidStr) {
                            pid = parseInt(pidStr, 10);
                            if (!isNaN(pid)) {
                                setClaudeSocketInfo(path, pid);
                                return [2 /*return*/];
                            }
                        }
                        // Parsing failed - log and fall through to fallback
                        (0, debug_js_1.logForDebugging)("[Socket] Failed to parse socket info from tmux output: \"".concat(infoResult.stdout.trim(), "\". Using fallback path."));
                    }
                    else {
                        // Command failed - log and fall through to fallback
                        (0, debug_js_1.logForDebugging)("[Socket] Failed to get socket info via display-message (exit ".concat(infoResult.code, "): ").concat(infoResult.stderr, ". Using fallback path."));
                    }
                    uid = (_c = (_b = process.getuid) === null || _b === void 0 ? void 0 : _b.call(process)) !== null && _c !== void 0 ? _c : 0;
                    baseTmpDir = process.env.TMPDIR || '/tmp';
                    fallbackPath = path_1.posix.join(baseTmpDir, "tmux-".concat(uid), socket);
                    return [4 /*yield*/, execTmux([
                            '-L',
                            socket,
                            'display-message',
                            '-p',
                            '#{pid}',
                        ])];
                case 8:
                    pidResult = _d.sent();
                    if (pidResult.code === 0) {
                        pid = parseInt(pidResult.stdout.trim(), 10);
                        if (!isNaN(pid)) {
                            (0, debug_js_1.logForDebugging)("[Socket] Using fallback socket path: ".concat(fallbackPath, " (server PID: ").concat(pid, ")"));
                            setClaudeSocketInfo(fallbackPath, pid);
                            return [2 /*return*/];
                        }
                        // PID parsing failed
                        (0, debug_js_1.logForDebugging)("[Socket] Failed to parse server PID from tmux output: \"".concat(pidResult.stdout.trim(), "\""));
                    }
                    else {
                        (0, debug_js_1.logForDebugging)("[Socket] Failed to get server PID (exit ".concat(pidResult.code, "): ").concat(pidResult.stderr));
                    }
                    throw new Error("Failed to get socket info for ".concat(socket, ": primary=\"").concat(infoResult.stderr, "\", fallback=\"").concat(pidResult.stderr, "\""));
            }
        });
    });
}
// For testing purposes
function resetSocketState() {
    socketName = null;
    socketPath = null;
    serverPid = null;
    isInitializing = false;
    initPromise = null;
    tmuxAvailabilityChecked = false;
    tmuxAvailable = false;
    tmuxToolUsed = false;
}
