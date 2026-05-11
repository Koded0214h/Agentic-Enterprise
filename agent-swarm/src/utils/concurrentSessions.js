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
exports.isBgSession = isBgSession;
exports.registerSession = registerSession;
exports.updateSessionName = updateSessionName;
exports.updateSessionBridgeId = updateSessionBridgeId;
exports.updateSessionActivity = updateSessionActivity;
exports.countConcurrentSessions = countConcurrentSessions;
var bun_bundle_1 = require("bun:bundle");
var promises_1 = require("fs/promises");
var path_1 = require("path");
var state_js_1 = require("../bootstrap/state.js");
var cleanupRegistry_js_1 = require("./cleanupRegistry.js");
var debug_js_1 = require("./debug.js");
var envUtils_js_1 = require("./envUtils.js");
var errors_js_1 = require("./errors.js");
var genericProcessUtils_js_1 = require("./genericProcessUtils.js");
var platform_js_1 = require("./platform.js");
var slowOperations_js_1 = require("./slowOperations.js");
var teammate_js_1 = require("./teammate.js");
function getSessionsDir() {
    return (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), 'sessions');
}
/**
 * Kind override from env. Set by the spawner (`claude --bg`, daemon
 * supervisor) so the child can register without the parent having to
 * write the file for it — cleanup-on-exit wiring then works for free.
 * Gated so the env-var string is DCE'd from external builds.
 */
function envSessionKind() {
    if ((0, bun_bundle_1.feature)('BG_SESSIONS')) {
        var k = process.env.CLAUDE_CODE_SESSION_KIND;
        if (k === 'bg' || k === 'daemon' || k === 'daemon-worker')
            return k;
    }
    return undefined;
}
/**
 * True when this REPL is running inside a `claude --bg` tmux session.
 * Exit paths (/exit, ctrl+c, ctrl+d) should detach the attached client
 * instead of killing the process.
 */
function isBgSession() {
    return envSessionKind() === 'bg';
}
/**
 * Write a PID file for this session and register cleanup.
 *
 * Registers all top-level sessions — interactive CLI, SDK (vscode, desktop,
 * typescript, python, -p), bg/daemon spawns — so `claude ps` sees everything
 * the user might be running. Skips only teammates/subagents, which would
 * conflate swarm usage with genuine concurrency and pollute ps with noise.
 *
 * Returns true if registered, false if skipped.
 * Errors logged to debug, never thrown.
 */
function registerSession() {
    return __awaiter(this, void 0, void 0, function () {
        var kind, dir, pidFile, e_1;
        var _this = this;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if ((0, teammate_js_1.getAgentId)() != null)
                        return [2 /*return*/, false];
                    kind = (_a = envSessionKind()) !== null && _a !== void 0 ? _a : 'interactive';
                    dir = getSessionsDir();
                    pidFile = (0, path_1.join)(dir, "".concat(process.pid, ".json"));
                    (0, cleanupRegistry_js_1.registerCleanup)(function () { return __awaiter(_this, void 0, void 0, function () {
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, (0, promises_1.unlink)(pidFile)];
                                case 1:
                                    _b.sent();
                                    return [3 /*break*/, 3];
                                case 2:
                                    _a = _b.sent();
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, (0, promises_1.mkdir)(dir, { recursive: true, mode: 448 })];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, (0, promises_1.chmod)(dir, 448)];
                case 3:
                    _b.sent();
                    return [4 /*yield*/, (0, promises_1.writeFile)(pidFile, (0, slowOperations_js_1.jsonStringify)(__assign(__assign({ pid: process.pid, sessionId: (0, state_js_1.getSessionId)(), cwd: (0, state_js_1.getOriginalCwd)(), startedAt: Date.now(), kind: kind, entrypoint: process.env.CLAUDE_CODE_ENTRYPOINT }, ((0, bun_bundle_1.feature)('UDS_INBOX')
                            ? { messagingSocketPath: process.env.CLAUDE_CODE_MESSAGING_SOCKET }
                            : {})), ((0, bun_bundle_1.feature)('BG_SESSIONS')
                            ? {
                                name: process.env.CLAUDE_CODE_SESSION_NAME,
                                logPath: process.env.CLAUDE_CODE_SESSION_LOG,
                                agent: process.env.CLAUDE_CODE_AGENT,
                            }
                            : {}))))
                        // --resume / /resume mutates getSessionId() via switchSession. Without
                        // this, the PID file's sessionId goes stale and `claude ps` sparkline
                        // reads the wrong transcript.
                    ];
                case 4:
                    _b.sent();
                    // --resume / /resume mutates getSessionId() via switchSession. Without
                    // this, the PID file's sessionId goes stale and `claude ps` sparkline
                    // reads the wrong transcript.
                    (0, state_js_1.onSessionSwitch)(function (id) {
                        void updatePidFile({ sessionId: id });
                    });
                    return [2 /*return*/, true];
                case 5:
                    e_1 = _b.sent();
                    (0, debug_js_1.logForDebugging)("[concurrentSessions] register failed: ".concat((0, errors_js_1.errorMessage)(e_1)));
                    return [2 /*return*/, false];
                case 6: return [2 /*return*/];
            }
        });
    });
}
/**
 * Update this session's name in its PID registry file so ListPeers
 * can surface it. Best-effort: silently no-op if name is falsy, the
 * file doesn't exist (session not registered), or read/write fails.
 */
function updatePidFile(patch) {
    return __awaiter(this, void 0, void 0, function () {
        var pidFile, data, _a, e_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    pidFile = (0, path_1.join)(getSessionsDir(), "".concat(process.pid, ".json"));
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    _a = slowOperations_js_1.jsonParse;
                    return [4 /*yield*/, (0, promises_1.readFile)(pidFile, 'utf8')];
                case 2:
                    data = _a.apply(void 0, [_b.sent()]);
                    return [4 /*yield*/, (0, promises_1.writeFile)(pidFile, (0, slowOperations_js_1.jsonStringify)(__assign(__assign({}, data), patch)))];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    e_2 = _b.sent();
                    (0, debug_js_1.logForDebugging)("[concurrentSessions] updatePidFile failed: ".concat((0, errors_js_1.errorMessage)(e_2)));
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function updateSessionName(name) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!name)
                        return [2 /*return*/];
                    return [4 /*yield*/, updatePidFile({ name: name })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Record this session's Remote Control session ID so peer enumeration can
 * dedup: a session reachable over both UDS and bridge should only appear
 * once (local wins). Cleared on bridge teardown so stale IDs don't
 * suppress a legitimately-remote session after reconnect.
 */
function updateSessionBridgeId(bridgeSessionId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, updatePidFile({ bridgeSessionId: bridgeSessionId })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Push live activity state for `claude ps`. Fire-and-forget from REPL's
 * status-change effect — a dropped write just means ps falls back to
 * transcript-tail derivation for one refresh.
 */
function updateSessionActivity(patch) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(0, bun_bundle_1.feature)('BG_SESSIONS'))
                        return [2 /*return*/];
                    return [4 /*yield*/, updatePidFile(__assign(__assign({}, patch), { updatedAt: Date.now() }))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Count live concurrent CLI sessions (including this one).
 * Filters out stale PID files (crashed sessions) and deletes them.
 * Returns 0 on any error (conservative).
 */
function countConcurrentSessions() {
    return __awaiter(this, void 0, void 0, function () {
        var dir, files, e_3, count, _i, files_1, file, pid;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dir = getSessionsDir();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readdir)(dir)];
                case 2:
                    files = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_3 = _a.sent();
                    if (!(0, errors_js_1.isFsInaccessible)(e_3)) {
                        (0, debug_js_1.logForDebugging)("[concurrentSessions] readdir failed: ".concat((0, errors_js_1.errorMessage)(e_3)));
                    }
                    return [2 /*return*/, 0];
                case 4:
                    count = 0;
                    for (_i = 0, files_1 = files; _i < files_1.length; _i++) {
                        file = files_1[_i];
                        // Strict filename guard: only `<pid>.json` is a candidate. parseInt's
                        // lenient prefix-parsing means `2026-03-14_notes.md` would otherwise
                        // parse as PID 2026 and get swept as stale — silent user data loss.
                        // See anthropics/claude-code#34210.
                        if (!/^\d+\.json$/.test(file))
                            continue;
                        pid = parseInt(file.slice(0, -5), 10);
                        if (pid === process.pid) {
                            count++;
                            continue;
                        }
                        if ((0, genericProcessUtils_js_1.isProcessRunning)(pid)) {
                            count++;
                        }
                        else if ((0, platform_js_1.getPlatform)() !== 'wsl') {
                            // Stale file from a crashed session — sweep it. Skip on WSL: if
                            // ~/.claude/sessions/ is shared with Windows-native Claude (symlink
                            // or CLAUDE_CONFIG_DIR), a Windows PID won't be probeable from WSL
                            // and we'd falsely delete a live session's file. This is just
                            // telemetry so conservative undercount is acceptable.
                            void (0, promises_1.unlink)((0, path_1.join)(dir, file)).catch(function () { });
                        }
                    }
                    return [2 /*return*/, count];
            }
        });
    });
}
