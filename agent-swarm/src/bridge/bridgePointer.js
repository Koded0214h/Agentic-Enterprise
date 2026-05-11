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
exports.BRIDGE_POINTER_TTL_MS = void 0;
exports.getBridgePointerPath = getBridgePointerPath;
exports.writeBridgePointer = writeBridgePointer;
exports.readBridgePointer = readBridgePointer;
exports.readBridgePointerAcrossWorktrees = readBridgePointerAcrossWorktrees;
exports.clearBridgePointer = clearBridgePointer;
var promises_1 = require("fs/promises");
var path_1 = require("path");
var v4_1 = require("zod/v4");
var debug_js_1 = require("../utils/debug.js");
var errors_js_1 = require("../utils/errors.js");
var getWorktreePathsPortable_js_1 = require("../utils/getWorktreePathsPortable.js");
var lazySchema_js_1 = require("../utils/lazySchema.js");
var sessionStoragePortable_js_1 = require("../utils/sessionStoragePortable.js");
var slowOperations_js_1 = require("../utils/slowOperations.js");
/**
 * Upper bound on worktree fanout. git worktree list is naturally bounded
 * (50 is a LOT), but this caps the parallel stat() burst and guards against
 * pathological setups. Above this, --continue falls back to current-dir-only.
 */
var MAX_WORKTREE_FANOUT = 50;
/**
 * Crash-recovery pointer for Remote Control sessions.
 *
 * Written immediately after a bridge session is created, periodically
 * refreshed during the session, and cleared on clean shutdown. If the
 * process dies unclean (crash, kill -9, terminal closed), the pointer
 * persists. On next startup, `claude remote-control` detects it and offers
 * to resume via the --session-id flow from #20460.
 *
 * Staleness is checked against the file's mtime (not an embedded timestamp)
 * so that a periodic re-write with the same content serves as a refresh —
 * matches the backend's rolling BRIDGE_LAST_POLL_TTL (4h) semantics. A
 * bridge that's been polling for 5+ hours and then crashes still has a
 * fresh pointer as long as the refresh ran within the window.
 *
 * Scoped per working directory (alongside transcript JSONL files) so two
 * concurrent bridges in different repos don't clobber each other.
 */
exports.BRIDGE_POINTER_TTL_MS = 4 * 60 * 60 * 1000;
var BridgePointerSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        sessionId: v4_1.z.string(),
        environmentId: v4_1.z.string(),
        source: v4_1.z.enum(['standalone', 'repl']),
    });
});
function getBridgePointerPath(dir) {
    return (0, path_1.join)((0, sessionStoragePortable_js_1.getProjectsDir)(), (0, sessionStoragePortable_js_1.sanitizePath)(dir), 'bridge-pointer.json');
}
/**
 * Write the pointer. Also used to refresh mtime during long sessions —
 * calling with the same IDs is a cheap no-content-change write that bumps
 * the staleness clock. Best-effort — a crash-recovery file must never
 * itself cause a crash. Logs and swallows on error.
 */
function writeBridgePointer(dir, pointer) {
    return __awaiter(this, void 0, void 0, function () {
        var path, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    path = getBridgePointerPath(dir);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, (0, promises_1.mkdir)((0, path_1.dirname)(path), { recursive: true })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, promises_1.writeFile)(path, (0, slowOperations_js_1.jsonStringify)(pointer), 'utf8')];
                case 3:
                    _a.sent();
                    (0, debug_js_1.logForDebugging)("[bridge:pointer] wrote ".concat(path));
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    (0, debug_js_1.logForDebugging)("[bridge:pointer] write failed: ".concat(err_1), { level: 'warn' });
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Read the pointer and its age (ms since last write). Operates directly
 * and handles errors — no existence check (CLAUDE.md TOCTOU rule). Returns
 * null on any failure: missing file, corrupted JSON, schema mismatch, or
 * stale (mtime > 4h ago). Stale/invalid pointers are deleted so they don't
 * keep re-prompting after the backend has already GC'd the env.
 */
function readBridgePointer(dir) {
    return __awaiter(this, void 0, void 0, function () {
        var path, raw, mtimeMs, _a, parsed, ageMs;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    path = getBridgePointerPath(dir);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, (0, promises_1.stat)(path)];
                case 2:
                    // stat for mtime (staleness anchor), then read. Two syscalls, but both
                    // are needed — mtime IS the data we return, not a TOCTOU guard.
                    mtimeMs = (_b.sent()).mtimeMs;
                    return [4 /*yield*/, (0, promises_1.readFile)(path, 'utf8')];
                case 3:
                    raw = _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    return [2 /*return*/, null];
                case 5:
                    parsed = BridgePointerSchema().safeParse(safeJsonParse(raw));
                    if (!!parsed.success) return [3 /*break*/, 7];
                    (0, debug_js_1.logForDebugging)("[bridge:pointer] invalid schema, clearing: ".concat(path));
                    return [4 /*yield*/, clearBridgePointer(dir)];
                case 6:
                    _b.sent();
                    return [2 /*return*/, null];
                case 7:
                    ageMs = Math.max(0, Date.now() - mtimeMs);
                    if (!(ageMs > exports.BRIDGE_POINTER_TTL_MS)) return [3 /*break*/, 9];
                    (0, debug_js_1.logForDebugging)("[bridge:pointer] stale (>4h mtime), clearing: ".concat(path));
                    return [4 /*yield*/, clearBridgePointer(dir)];
                case 8:
                    _b.sent();
                    return [2 /*return*/, null];
                case 9: return [2 /*return*/, __assign(__assign({}, parsed.data), { ageMs: ageMs })];
            }
        });
    });
}
/**
 * Worktree-aware read for `--continue`. The REPL bridge writes its pointer
 * to `getOriginalCwd()` which EnterWorktreeTool/activeWorktreeSession can
 * mutate to a worktree path — but `claude remote-control --continue` runs
 * with `resolve('.')` = shell CWD. This fans out across git worktree
 * siblings to find the freshest pointer, matching /resume's semantics.
 *
 * Fast path: checks `dir` first. Only shells out to `git worktree list` if
 * that misses — the common case (pointer in launch dir) is one stat, zero
 * exec. Fanout reads run in parallel; capped at MAX_WORKTREE_FANOUT.
 *
 * Returns the pointer AND the dir it was found in, so the caller can clear
 * the right file on resume failure.
 */
function readBridgePointerAcrossWorktrees(dir) {
    return __awaiter(this, void 0, void 0, function () {
        var here, worktrees, dirKey, candidates, results, freshest, _i, results_1, r;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, readBridgePointer(dir)];
                case 1:
                    here = _a.sent();
                    if (here) {
                        return [2 /*return*/, { pointer: here, dir: dir }];
                    }
                    return [4 /*yield*/, (0, getWorktreePathsPortable_js_1.getWorktreePathsPortable)(dir)];
                case 2:
                    worktrees = _a.sent();
                    if (worktrees.length <= 1)
                        return [2 /*return*/, null];
                    if (worktrees.length > MAX_WORKTREE_FANOUT) {
                        (0, debug_js_1.logForDebugging)("[bridge:pointer] ".concat(worktrees.length, " worktrees exceeds fanout cap ").concat(MAX_WORKTREE_FANOUT, ", skipping"));
                        return [2 /*return*/, null];
                    }
                    dirKey = (0, sessionStoragePortable_js_1.sanitizePath)(dir);
                    candidates = worktrees.filter(function (wt) { return (0, sessionStoragePortable_js_1.sanitizePath)(wt) !== dirKey; });
                    return [4 /*yield*/, Promise.all(candidates.map(function (wt) { return __awaiter(_this, void 0, void 0, function () {
                            var p;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, readBridgePointer(wt)];
                                    case 1:
                                        p = _a.sent();
                                        return [2 /*return*/, p ? { pointer: p, dir: wt } : null];
                                }
                            });
                        }); }))
                        // Pick freshest (lowest ageMs). The pointer stores environmentId so
                        // resume reconnects to the right env regardless of which worktree
                        // --continue was invoked from.
                    ];
                case 3:
                    results = _a.sent();
                    freshest = null;
                    for (_i = 0, results_1 = results; _i < results_1.length; _i++) {
                        r = results_1[_i];
                        if (r && (!freshest || r.pointer.ageMs < freshest.pointer.ageMs)) {
                            freshest = r;
                        }
                    }
                    if (freshest) {
                        (0, debug_js_1.logForDebugging)("[bridge:pointer] fanout found pointer in worktree ".concat(freshest.dir, " (ageMs=").concat(freshest.pointer.ageMs, ")"));
                    }
                    return [2 /*return*/, freshest];
            }
        });
    });
}
/**
 * Delete the pointer. Idempotent — ENOENT is expected when the process
 * shut down clean previously.
 */
function clearBridgePointer(dir) {
    return __awaiter(this, void 0, void 0, function () {
        var path, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    path = getBridgePointerPath(dir);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.unlink)(path)];
                case 2:
                    _a.sent();
                    (0, debug_js_1.logForDebugging)("[bridge:pointer] cleared ".concat(path));
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _a.sent();
                    if (!(0, errors_js_1.isENOENT)(err_2)) {
                        (0, debug_js_1.logForDebugging)("[bridge:pointer] clear failed: ".concat(err_2), {
                            level: 'warn',
                        });
                    }
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function safeJsonParse(raw) {
    try {
        return (0, slowOperations_js_1.jsonParse)(raw);
    }
    catch (_a) {
        return null;
    }
}
