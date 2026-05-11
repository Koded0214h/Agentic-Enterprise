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
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkComputerUseLock = checkComputerUseLock;
exports.isLockHeldLocally = isLockHeldLocally;
exports.tryAcquireComputerUseLock = tryAcquireComputerUseLock;
exports.releaseComputerUseLock = releaseComputerUseLock;
var promises_1 = require("fs/promises");
var path_1 = require("path");
var state_js_1 = require("../../bootstrap/state.js");
var cleanupRegistry_js_1 = require("../../utils/cleanupRegistry.js");
var debug_js_1 = require("../../utils/debug.js");
var envUtils_js_1 = require("../../utils/envUtils.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var errors_js_1 = require("../errors.js");
var LOCK_FILENAME = 'computer-use.lock';
// Holds the unregister function for the shutdown cleanup handler.
// Set when the lock is acquired, cleared when released.
var unregisterCleanup;
var FRESH = { kind: 'acquired', fresh: true };
var REENTRANT = { kind: 'acquired', fresh: false };
function isComputerUseLock(value) {
    if (typeof value !== 'object' || value === null)
        return false;
    return ('sessionId' in value &&
        typeof value.sessionId === 'string' &&
        'pid' in value &&
        typeof value.pid === 'number');
}
function getLockPath() {
    return (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), LOCK_FILENAME);
}
function readLock() {
    return __awaiter(this, void 0, void 0, function () {
        var raw, parsed, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, promises_1.readFile)(getLockPath(), 'utf8')];
                case 1:
                    raw = _b.sent();
                    parsed = (0, slowOperations_js_1.jsonParse)(raw);
                    return [2 /*return*/, isComputerUseLock(parsed) ? parsed : undefined];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, undefined];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Check whether a process is still running (signal 0 probe).
 *
 * Note: there is a small window for PID reuse — if the owning process
 * exits and an unrelated process is assigned the same PID, the check
 * will return true. This is extremely unlikely in practice.
 */
function isProcessRunning(pid) {
    try {
        process.kill(pid, 0);
        return true;
    }
    catch (_a) {
        return false;
    }
}
/**
 * Attempt to create the lock file atomically with O_EXCL.
 * Returns true on success, false if the file already exists.
 * Throws for other errors.
 */
function tryCreateExclusive(lock) {
    return __awaiter(this, void 0, void 0, function () {
        var e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, promises_1.writeFile)(getLockPath(), (0, slowOperations_js_1.jsonStringify)(lock), { flag: 'wx' })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, true];
                case 2:
                    e_1 = _a.sent();
                    if ((0, errors_js_1.getErrnoCode)(e_1) === 'EEXIST')
                        return [2 /*return*/, false];
                    throw e_1;
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Register a shutdown cleanup handler so the lock is released even if
 * turn-end cleanup is never reached (e.g. the user runs /exit while
 * a tool call is in progress).
 */
function registerLockCleanup() {
    var _this = this;
    unregisterCleanup === null || unregisterCleanup === void 0 ? void 0 : unregisterCleanup();
    unregisterCleanup = (0, cleanupRegistry_js_1.registerCleanup)(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, releaseComputerUseLock()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
}
/**
 * Check lock state without acquiring. Used for `request_access` /
 * `list_granted_applications` — the package's `defersLockAcquire` contract:
 * these tools check but don't take the lock, so the enter-notification and
 * overlay don't fire while the model is only asking for permission.
 *
 * Does stale-PID recovery (unlinks) so a dead session's lock doesn't block
 * `request_access`. Does NOT create — that's `tryAcquireComputerUseLock`'s job.
 */
function checkComputerUseLock() {
    return __awaiter(this, void 0, void 0, function () {
        var existing;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, readLock()];
                case 1:
                    existing = _a.sent();
                    if (!existing)
                        return [2 /*return*/, { kind: 'free' }];
                    if (existing.sessionId === (0, state_js_1.getSessionId)())
                        return [2 /*return*/, { kind: 'held_by_self' }];
                    if (isProcessRunning(existing.pid)) {
                        return [2 /*return*/, { kind: 'blocked', by: existing.sessionId }];
                    }
                    (0, debug_js_1.logForDebugging)("Recovering stale computer-use lock from session ".concat(existing.sessionId, " (PID ").concat(existing.pid, ")"));
                    return [4 /*yield*/, (0, promises_1.unlink)(getLockPath()).catch(function () { })];
                case 2:
                    _a.sent();
                    return [2 /*return*/, { kind: 'free' }];
            }
        });
    });
}
/**
 * Zero-syscall check: does THIS process believe it holds the lock?
 * True iff `tryAcquireComputerUseLock` succeeded and `releaseComputerUseLock`
 * hasn't run yet. Used to gate the per-turn release in `cleanup.ts` so
 * non-CU turns don't touch disk.
 */
function isLockHeldLocally() {
    return unregisterCleanup !== undefined;
}
/**
 * Try to acquire the computer-use lock for the current session.
 *
 * `{kind: 'acquired', fresh: true}` — first tool call of a CU turn. Callers fire
 * enter notifications on this. `{kind: 'acquired', fresh: false}` — re-entrant,
 * same session already holds it. `{kind: 'blocked', by}` — another live session
 * holds it.
 *
 * Uses O_EXCL (open 'wx') for atomic test-and-set — the OS guarantees at
 * most one process sees the create succeed. If the file already exists,
 * we check ownership and PID liveness; for a stale lock we unlink and
 * retry the exclusive create once. If two sessions race to recover the
 * same stale lock, only one create succeeds (the other reads the winner).
 */
function tryAcquireComputerUseLock() {
    return __awaiter(this, void 0, void 0, function () {
        var sessionId, lock, existing;
        var _a, _b;
        var _c, _d, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    sessionId = (0, state_js_1.getSessionId)();
                    lock = {
                        sessionId: sessionId,
                        pid: process.pid,
                        acquiredAt: Date.now(),
                    };
                    return [4 /*yield*/, (0, promises_1.mkdir)((0, envUtils_js_1.getClaudeConfigHomeDir)(), { recursive: true })
                        // Fresh acquisition.
                    ];
                case 1:
                    _g.sent();
                    return [4 /*yield*/, tryCreateExclusive(lock)];
                case 2:
                    // Fresh acquisition.
                    if (_g.sent()) {
                        registerLockCleanup();
                        return [2 /*return*/, FRESH];
                    }
                    return [4 /*yield*/, readLock()
                        // Corrupt/unparseable — treat as stale (can't extract a blocking ID).
                    ];
                case 3:
                    existing = _g.sent();
                    if (!!existing) return [3 /*break*/, 7];
                    return [4 /*yield*/, (0, promises_1.unlink)(getLockPath()).catch(function () { })];
                case 4:
                    _g.sent();
                    return [4 /*yield*/, tryCreateExclusive(lock)];
                case 5:
                    if (_g.sent()) {
                        registerLockCleanup();
                        return [2 /*return*/, FRESH];
                    }
                    _a = { kind: 'blocked' };
                    return [4 /*yield*/, readLock()];
                case 6: return [2 /*return*/, (_a.by = (_d = (_c = (_g.sent())) === null || _c === void 0 ? void 0 : _c.sessionId) !== null && _d !== void 0 ? _d : 'unknown', _a)];
                case 7:
                    // Already held by this session.
                    if (existing.sessionId === sessionId)
                        return [2 /*return*/, REENTRANT
                            // Another live session holds it — blocked.
                        ];
                    // Another live session holds it — blocked.
                    if (isProcessRunning(existing.pid)) {
                        return [2 /*return*/, { kind: 'blocked', by: existing.sessionId }];
                    }
                    // Stale lock — recover. Unlink then retry the exclusive create.
                    // If another session is also recovering, one EEXISTs and reads the winner.
                    (0, debug_js_1.logForDebugging)("Recovering stale computer-use lock from session ".concat(existing.sessionId, " (PID ").concat(existing.pid, ")"));
                    return [4 /*yield*/, (0, promises_1.unlink)(getLockPath()).catch(function () { })];
                case 8:
                    _g.sent();
                    return [4 /*yield*/, tryCreateExclusive(lock)];
                case 9:
                    if (_g.sent()) {
                        registerLockCleanup();
                        return [2 /*return*/, FRESH];
                    }
                    _b = { kind: 'blocked' };
                    return [4 /*yield*/, readLock()];
                case 10: return [2 /*return*/, (_b.by = (_f = (_e = (_g.sent())) === null || _e === void 0 ? void 0 : _e.sessionId) !== null && _f !== void 0 ? _f : 'unknown', _b)];
            }
        });
    });
}
/**
 * Release the computer-use lock if the current session owns it. Returns
 * `true` if we actually unlinked the file (i.e., we held it) — callers fire
 * exit notifications on this. Idempotent: subsequent calls return `false`.
 */
function releaseComputerUseLock() {
    return __awaiter(this, void 0, void 0, function () {
        var existing, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    unregisterCleanup === null || unregisterCleanup === void 0 ? void 0 : unregisterCleanup();
                    unregisterCleanup = undefined;
                    return [4 /*yield*/, readLock()];
                case 1:
                    existing = _b.sent();
                    if (!existing || existing.sessionId !== (0, state_js_1.getSessionId)())
                        return [2 /*return*/, false];
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, promises_1.unlink)(getLockPath())];
                case 3:
                    _b.sent();
                    (0, debug_js_1.logForDebugging)('Released computer-use lock');
                    return [2 /*return*/, true];
                case 4:
                    _a = _b.sent();
                    return [2 /*return*/, false];
                case 5: return [2 /*return*/];
            }
        });
    });
}
