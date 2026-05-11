"use strict";
// Scheduler lease lock for .claude/scheduled_tasks.json.
//
// When multiple Claude sessions run in the same project directory, only one
// should drive the cron scheduler. The first session to acquire this lock
// becomes the scheduler; others stay passive and periodically probe the lock.
// If the owner dies (PID no longer running), a passive session takes over.
//
// Pattern mirrors computerUseLock.ts: O_EXCL atomic create, PID liveness
// probe, stale-lock recovery, cleanup-on-exit.
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
exports.tryAcquireSchedulerLock = tryAcquireSchedulerLock;
exports.releaseSchedulerLock = releaseSchedulerLock;
var promises_1 = require("fs/promises");
var path_1 = require("path");
var v4_1 = require("zod/v4");
var state_js_1 = require("../bootstrap/state.js");
var cleanupRegistry_js_1 = require("./cleanupRegistry.js");
var debug_js_1 = require("./debug.js");
var errors_js_1 = require("./errors.js");
var genericProcessUtils_js_1 = require("./genericProcessUtils.js");
var json_js_1 = require("./json.js");
var lazySchema_js_1 = require("./lazySchema.js");
var slowOperations_js_1 = require("./slowOperations.js");
var LOCK_FILE_REL = (0, path_1.join)('.claude', 'scheduled_tasks.lock');
var schedulerLockSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        sessionId: v4_1.z.string(),
        pid: v4_1.z.number(),
        acquiredAt: v4_1.z.number(),
    });
});
var unregisterCleanup;
// Suppress repeat "held by X" log lines when polling a live owner.
var lastBlockedBy;
function getLockPath(dir) {
    return (0, path_1.join)(dir !== null && dir !== void 0 ? dir : (0, state_js_1.getProjectRoot)(), LOCK_FILE_REL);
}
function readLock(dir) {
    return __awaiter(this, void 0, void 0, function () {
        var raw, _a, result;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, promises_1.readFile)(getLockPath(dir), 'utf8')];
                case 1:
                    raw = _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, undefined];
                case 3:
                    result = schedulerLockSchema().safeParse((0, json_js_1.safeParseJSON)(raw, false));
                    return [2 /*return*/, result.success ? result.data : undefined];
            }
        });
    });
}
function tryCreateExclusive(lock, dir) {
    return __awaiter(this, void 0, void 0, function () {
        var path, body, e_1, code, retryErr_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    path = getLockPath(dir);
                    body = (0, slowOperations_js_1.jsonStringify)(lock);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 9]);
                    return [4 /*yield*/, (0, promises_1.writeFile)(path, body, { flag: 'wx' })];
                case 2:
                    _a.sent();
                    return [2 /*return*/, true];
                case 3:
                    e_1 = _a.sent();
                    code = (0, errors_js_1.getErrnoCode)(e_1);
                    if (code === 'EEXIST')
                        return [2 /*return*/, false];
                    if (!(code === 'ENOENT')) return [3 /*break*/, 8];
                    // .claude/ doesn't exist yet — create it and retry once. In steady
                    // state the dir already exists (scheduled_tasks.json lives there),
                    // so this path is hit at most once.
                    return [4 /*yield*/, (0, promises_1.mkdir)((0, path_1.dirname)(path), { recursive: true })];
                case 4:
                    // .claude/ doesn't exist yet — create it and retry once. In steady
                    // state the dir already exists (scheduled_tasks.json lives there),
                    // so this path is hit at most once.
                    _a.sent();
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, (0, promises_1.writeFile)(path, body, { flag: 'wx' })];
                case 6:
                    _a.sent();
                    return [2 /*return*/, true];
                case 7:
                    retryErr_1 = _a.sent();
                    if ((0, errors_js_1.getErrnoCode)(retryErr_1) === 'EEXIST')
                        return [2 /*return*/, false];
                    throw retryErr_1;
                case 8: throw e_1;
                case 9: return [2 /*return*/];
            }
        });
    });
}
function registerLockCleanup(opts) {
    var _this = this;
    unregisterCleanup === null || unregisterCleanup === void 0 ? void 0 : unregisterCleanup();
    unregisterCleanup = (0, cleanupRegistry_js_1.registerCleanup)(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, releaseSchedulerLock(opts)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
}
/**
 * Try to acquire the scheduler lock for the current session.
 * Returns true on success, false if another live session holds it.
 *
 * Uses O_EXCL ('wx') for atomic test-and-set. If the file exists:
 *   - Already ours → true (idempotent re-acquire)
 *   - Another live PID → false
 *   - Stale (PID dead / corrupt) → unlink and retry exclusive create once
 *
 * If two sessions race to recover a stale lock, only one create succeeds.
 */
function tryAcquireSchedulerLock(opts) {
    return __awaiter(this, void 0, void 0, function () {
        var dir, sessionId, lock, existing;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    dir = opts === null || opts === void 0 ? void 0 : opts.dir;
                    sessionId = (_a = opts === null || opts === void 0 ? void 0 : opts.lockIdentity) !== null && _a !== void 0 ? _a : (0, state_js_1.getSessionId)();
                    lock = {
                        sessionId: sessionId,
                        pid: process.pid,
                        acquiredAt: Date.now(),
                    };
                    return [4 /*yield*/, tryCreateExclusive(lock, dir)];
                case 1:
                    if (_b.sent()) {
                        lastBlockedBy = undefined;
                        registerLockCleanup(opts);
                        (0, debug_js_1.logForDebugging)("[ScheduledTasks] acquired scheduler lock (PID ".concat(process.pid, ")"));
                        return [2 /*return*/, true];
                    }
                    return [4 /*yield*/, readLock(dir)
                        // Already ours (idempotent). After --resume the session ID is restored
                        // but the process has a new PID — update the lock file so other sessions
                        // see a live PID and don't steal it.
                    ];
                case 2:
                    existing = _b.sent();
                    if (!((existing === null || existing === void 0 ? void 0 : existing.sessionId) === sessionId)) return [3 /*break*/, 5];
                    if (!(existing.pid !== process.pid)) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, promises_1.writeFile)(getLockPath(dir), (0, slowOperations_js_1.jsonStringify)(lock))];
                case 3:
                    _b.sent();
                    registerLockCleanup(opts);
                    _b.label = 4;
                case 4: return [2 /*return*/, true];
                case 5:
                    // Corrupt or unparseable — treat as stale.
                    // Another live session — blocked.
                    if (existing && (0, genericProcessUtils_js_1.isProcessRunning)(existing.pid)) {
                        if (lastBlockedBy !== existing.sessionId) {
                            lastBlockedBy = existing.sessionId;
                            (0, debug_js_1.logForDebugging)("[ScheduledTasks] scheduler lock held by session ".concat(existing.sessionId, " (PID ").concat(existing.pid, ")"));
                        }
                        return [2 /*return*/, false];
                    }
                    // Stale — unlink and retry the exclusive create once.
                    if (existing) {
                        (0, debug_js_1.logForDebugging)("[ScheduledTasks] recovering stale scheduler lock from PID ".concat(existing.pid));
                    }
                    return [4 /*yield*/, (0, promises_1.unlink)(getLockPath(dir)).catch(function () { })];
                case 6:
                    _b.sent();
                    return [4 /*yield*/, tryCreateExclusive(lock, dir)];
                case 7:
                    if (_b.sent()) {
                        lastBlockedBy = undefined;
                        registerLockCleanup(opts);
                        return [2 /*return*/, true];
                    }
                    // Another session won the recovery race.
                    return [2 /*return*/, false];
            }
        });
    });
}
/**
 * Release the scheduler lock if the current session owns it.
 */
function releaseSchedulerLock(opts) {
    return __awaiter(this, void 0, void 0, function () {
        var dir, sessionId, existing, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    unregisterCleanup === null || unregisterCleanup === void 0 ? void 0 : unregisterCleanup();
                    unregisterCleanup = undefined;
                    lastBlockedBy = undefined;
                    dir = opts === null || opts === void 0 ? void 0 : opts.dir;
                    sessionId = (_b = opts === null || opts === void 0 ? void 0 : opts.lockIdentity) !== null && _b !== void 0 ? _b : (0, state_js_1.getSessionId)();
                    return [4 /*yield*/, readLock(dir)];
                case 1:
                    existing = _c.sent();
                    if (!existing || existing.sessionId !== sessionId)
                        return [2 /*return*/];
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, promises_1.unlink)(getLockPath(dir))];
                case 3:
                    _c.sent();
                    (0, debug_js_1.logForDebugging)('[ScheduledTasks] released scheduler lock');
                    return [3 /*break*/, 5];
                case 4:
                    _a = _c.sent();
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
