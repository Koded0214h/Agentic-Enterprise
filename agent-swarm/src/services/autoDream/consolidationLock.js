"use strict";
// Lock file whose mtime IS lastConsolidatedAt. Body is the holder's PID.
//
// Lives inside the memory dir (getAutoMemPath) so it keys on git-root
// like memory does, and so it's writable even when the memory path comes
// from an env/settings override whose parent may not be.
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
exports.readLastConsolidatedAt = readLastConsolidatedAt;
exports.tryAcquireConsolidationLock = tryAcquireConsolidationLock;
exports.rollbackConsolidationLock = rollbackConsolidationLock;
exports.listSessionsTouchedSince = listSessionsTouchedSince;
exports.recordConsolidation = recordConsolidation;
var promises_1 = require("fs/promises");
var path_1 = require("path");
var state_js_1 = require("../../bootstrap/state.js");
var paths_js_1 = require("../../memdir/paths.js");
var debug_js_1 = require("../../utils/debug.js");
var genericProcessUtils_js_1 = require("../../utils/genericProcessUtils.js");
var listSessionsImpl_js_1 = require("../../utils/listSessionsImpl.js");
var sessionStorage_js_1 = require("../../utils/sessionStorage.js");
var LOCK_FILE = '.consolidate-lock';
// Stale past this even if the PID is live (PID reuse guard).
var HOLDER_STALE_MS = 60 * 60 * 1000;
function lockPath() {
    return (0, path_1.join)((0, paths_js_1.getAutoMemPath)(), LOCK_FILE);
}
/**
 * mtime of the lock file = lastConsolidatedAt. 0 if absent.
 * Per-turn cost: one stat.
 */
function readLastConsolidatedAt() {
    return __awaiter(this, void 0, void 0, function () {
        var s, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, promises_1.stat)(lockPath())];
                case 1:
                    s = _b.sent();
                    return [2 /*return*/, s.mtimeMs];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, 0];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Acquire: write PID → mtime = now. Returns the pre-acquire mtime
 * (for rollback), or null if blocked / lost a race.
 *
 *   Success → do nothing. mtime stays at now.
 *   Failure → rollbackConsolidationLock(priorMtime) rewinds mtime.
 *   Crash   → mtime stuck, dead PID → next process reclaims.
 */
function tryAcquireConsolidationLock() {
    return __awaiter(this, void 0, void 0, function () {
        var path, mtimeMs, holderPid, _a, s, raw, parsed, _b, verify, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    path = lockPath();
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, Promise.all([(0, promises_1.stat)(path), (0, promises_1.readFile)(path, 'utf8')])];
                case 2:
                    _a = _d.sent(), s = _a[0], raw = _a[1];
                    mtimeMs = s.mtimeMs;
                    parsed = parseInt(raw.trim(), 10);
                    holderPid = Number.isFinite(parsed) ? parsed : undefined;
                    return [3 /*break*/, 4];
                case 3:
                    _b = _d.sent();
                    return [3 /*break*/, 4];
                case 4:
                    if (mtimeMs !== undefined && Date.now() - mtimeMs < HOLDER_STALE_MS) {
                        if (holderPid !== undefined && (0, genericProcessUtils_js_1.isProcessRunning)(holderPid)) {
                            (0, debug_js_1.logForDebugging)("[autoDream] lock held by live PID ".concat(holderPid, " (mtime ").concat(Math.round((Date.now() - mtimeMs) / 1000), "s ago)"));
                            return [2 /*return*/, null];
                        }
                        // Dead PID or unparseable body — reclaim.
                    }
                    // Memory dir may not exist yet.
                    return [4 /*yield*/, (0, promises_1.mkdir)((0, paths_js_1.getAutoMemPath)(), { recursive: true })];
                case 5:
                    // Memory dir may not exist yet.
                    _d.sent();
                    return [4 /*yield*/, (0, promises_1.writeFile)(path, String(process.pid))
                        // Two reclaimers both write → last wins the PID. Loser bails on re-read.
                    ];
                case 6:
                    _d.sent();
                    _d.label = 7;
                case 7:
                    _d.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, (0, promises_1.readFile)(path, 'utf8')];
                case 8:
                    verify = _d.sent();
                    return [3 /*break*/, 10];
                case 9:
                    _c = _d.sent();
                    return [2 /*return*/, null];
                case 10:
                    if (parseInt(verify.trim(), 10) !== process.pid)
                        return [2 /*return*/, null];
                    return [2 /*return*/, mtimeMs !== null && mtimeMs !== void 0 ? mtimeMs : 0];
            }
        });
    });
}
/**
 * Rewind mtime to pre-acquire after a failed fork. Clears the PID body —
 * otherwise our still-running process would look like it's holding.
 * priorMtime 0 → unlink (restore no-file).
 */
function rollbackConsolidationLock(priorMtime) {
    return __awaiter(this, void 0, void 0, function () {
        var path, t, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    path = lockPath();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    if (!(priorMtime === 0)) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, promises_1.unlink)(path)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
                case 3: return [4 /*yield*/, (0, promises_1.writeFile)(path, '')];
                case 4:
                    _a.sent();
                    t = priorMtime / 1000 // utimes wants seconds
                    ;
                    return [4 /*yield*/, (0, promises_1.utimes)(path, t, t)];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 6:
                    e_1 = _a.sent();
                    (0, debug_js_1.logForDebugging)("[autoDream] rollback failed: ".concat(e_1.message, " \u2014 next trigger delayed to minHours"));
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
/**
 * Session IDs with mtime after sinceMs. listCandidates handles UUID
 * validation (excludes agent-*.jsonl) and parallel stat.
 *
 * Uses mtime (sessions TOUCHED since), not birthtime (0 on ext4).
 * Caller excludes the current session. Scans per-cwd transcripts — it's
 * a skip-gate, so undercounting worktree sessions is safe.
 */
function listSessionsTouchedSince(sinceMs) {
    return __awaiter(this, void 0, void 0, function () {
        var dir, candidates;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dir = (0, sessionStorage_js_1.getProjectDir)((0, state_js_1.getOriginalCwd)());
                    return [4 /*yield*/, (0, listSessionsImpl_js_1.listCandidates)(dir, true)];
                case 1:
                    candidates = _a.sent();
                    return [2 /*return*/, candidates.filter(function (c) { return c.mtime > sinceMs; }).map(function (c) { return c.sessionId; })];
            }
        });
    });
}
/**
 * Stamp from manual /dream. Optimistic — fires at prompt-build time,
 * no post-skill completion hook. Best-effort.
 */
function recordConsolidation() {
    return __awaiter(this, void 0, void 0, function () {
        var e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    // Memory dir may not exist yet (manual /dream before any auto-trigger).
                    return [4 /*yield*/, (0, promises_1.mkdir)((0, paths_js_1.getAutoMemPath)(), { recursive: true })];
                case 1:
                    // Memory dir may not exist yet (manual /dream before any auto-trigger).
                    _a.sent();
                    return [4 /*yield*/, (0, promises_1.writeFile)(lockPath(), String(process.pid))];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_2 = _a.sent();
                    (0, debug_js_1.logForDebugging)("[autoDream] recordConsolidation write failed: ".concat(e_2.message));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
