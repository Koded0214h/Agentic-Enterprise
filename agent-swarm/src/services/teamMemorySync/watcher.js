"use strict";
/**
 * Team Memory File Watcher
 *
 * Watches the team memory directory for changes and triggers
 * a debounced push to the server when files are modified.
 * Performs an initial pull on startup, then starts a directory-level
 * fs.watch so first-time writes to a fresh repo get picked up.
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPermanentFailure = isPermanentFailure;
exports.startTeamMemoryWatcher = startTeamMemoryWatcher;
exports.notifyTeamMemoryWrite = notifyTeamMemoryWrite;
exports.stopTeamMemoryWatcher = stopTeamMemoryWatcher;
exports._resetWatcherStateForTesting = _resetWatcherStateForTesting;
exports._startFileWatcherForTesting = _startFileWatcherForTesting;
var bun_bundle_1 = require("bun:bundle");
var fs_1 = require("fs");
var promises_1 = require("fs/promises");
var path_1 = require("path");
var teamMemPaths_js_1 = require("../../memdir/teamMemPaths.js");
var cleanupRegistry_js_1 = require("../../utils/cleanupRegistry.js");
var debug_js_1 = require("../../utils/debug.js");
var errors_js_1 = require("../../utils/errors.js");
var git_js_1 = require("../../utils/git.js");
var index_js_1 = require("../analytics/index.js");
var index_js_2 = require("./index.js");
var DEBOUNCE_MS = 2000; // Wait 2s after last change before pushing
// ─── Watcher state ──────────────────────────────────────────
var watcher = null;
var debounceTimer = null;
var pushInProgress = false;
var hasPendingChanges = false;
var currentPushPromise = null;
var watcherStarted = false;
// Set after a push fails for a reason that can't self-heal on retry.
// Prevents watch events from other sessions' writes to the shared team
// dir driving an infinite retry loop (BQ Mar 14-16: one no_oauth device
// emitted 167K push events over 2.5 days). Cleared on unlink — file deletion
// is a recovery action for the too-many-entries case, and for no_oauth the
// suppression persisting until session restart is correct.
var pushSuppressedReason = null;
/**
 * Permanent = retry without user action will fail the same way.
 * - no_oauth / no_repo: pre-request client checks, no status code
 * - 4xx except 409/429: client error (404 missing repo, 413 too many
 *   entries, 403 permission). 409 is a transient conflict — server state
 *   changed under us, a fresh push after next pull can succeed. 429 is a
 *   rate limit — watcher-driven backoff is fine.
 */
function isPermanentFailure(r) {
    if (r.errorType === 'no_oauth' || r.errorType === 'no_repo')
        return true;
    if (r.httpStatus !== undefined &&
        r.httpStatus >= 400 &&
        r.httpStatus < 500 &&
        r.httpStatus !== 409 &&
        r.httpStatus !== 429) {
        return true;
    }
    return false;
}
// Sync state owned by the watcher — shared across all sync operations.
var syncState = null;
/**
 * Execute the push and track its lifecycle.
 * Push is read-only on disk (delta+probe, no merge writes), so no event
 * suppression is needed — edits arriving mid-push hit schedulePush() and
 * the debounce re-arms after this push completes.
 */
function executePush() {
    return __awaiter(this, void 0, void 0, function () {
        var result, e_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!syncState) {
                        return [2 /*return*/];
                    }
                    pushInProgress = true;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, (0, index_js_2.pushTeamMemory)(syncState)];
                case 2:
                    result = _b.sent();
                    if (result.success) {
                        hasPendingChanges = false;
                    }
                    if (result.success && result.filesUploaded > 0) {
                        (0, debug_js_1.logForDebugging)("team-memory-watcher: pushed ".concat(result.filesUploaded, " files"), { level: 'info' });
                    }
                    else if (!result.success) {
                        (0, debug_js_1.logForDebugging)("team-memory-watcher: push failed: ".concat(result.error), {
                            level: 'warn',
                        });
                        if (isPermanentFailure(result) && pushSuppressedReason === null) {
                            pushSuppressedReason =
                                result.httpStatus !== undefined
                                    ? "http_".concat(result.httpStatus)
                                    : ((_a = result.errorType) !== null && _a !== void 0 ? _a : 'unknown');
                            (0, debug_js_1.logForDebugging)("team-memory-watcher: suppressing retry until next unlink or session restart (".concat(pushSuppressedReason, ")"), { level: 'warn' });
                            (0, index_js_1.logEvent)('tengu_team_mem_push_suppressed', __assign({ reason: pushSuppressedReason }, (result.httpStatus && { status: result.httpStatus })));
                        }
                    }
                    return [3 /*break*/, 5];
                case 3:
                    e_1 = _b.sent();
                    (0, debug_js_1.logForDebugging)("team-memory-watcher: push error: ".concat((0, errors_js_1.errorMessage)(e_1)), {
                        level: 'warn',
                    });
                    return [3 /*break*/, 5];
                case 4:
                    pushInProgress = false;
                    currentPushPromise = null;
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Debounced push: waits for writes to settle, then pushes once.
 */
function schedulePush() {
    if (pushSuppressedReason !== null)
        return;
    hasPendingChanges = true;
    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(function () {
        if (pushInProgress) {
            schedulePush();
            return;
        }
        currentPushPromise = executePush();
    }, DEBOUNCE_MS);
}
/**
 * Start watching the team memory directory for changes.
 *
 * Uses `fs.watch({recursive: true})` on the directory (not chokidar).
 * chokidar 4+ dropped fsevents, and Bun's `fs.watch` fallback uses kqueue,
 * which requires one open fd per watched file — with 500+ team memory files
 * that's 500+ permanently-held fds (confirmed via lsof + repro).
 *
 * `recursive: true` is required because team memory supports subdirs
 * (validateTeamMemKey, pushTeamMemory's walkDir). On macOS Bun uses
 * FSEvents for recursive — O(1) fds regardless of tree size (verified:
 * 2 fds for 60 files across 5 subdirs). On Linux inotify needs one watch
 * per directory — O(subdirs), still fine (team memory rarely nests).
 *
 * `fs.watch` on a directory doesn't distinguish add/change/unlink — all three
 * emit `rename`. To clear suppression on the too-many-entries recovery path
 * (user deletes files), we stat the filename on each event: ENOENT → treat as
 * unlink.  For `no_oauth` suppression this is correct: no_oauth users don't
 * delete team memory files to recover, they restart with auth.
 */
function startFileWatcher(teamDir) {
    return __awaiter(this, void 0, void 0, function () {
        var err_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (watcherStarted) {
                        return [2 /*return*/];
                    }
                    watcherStarted = true;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    // pullTeamMemory returns early without creating the dir for fresh repos
                    // with no server content (index.ts isEmpty path). mkdir with
                    // recursive:true is idempotent — no existence check needed.
                    return [4 /*yield*/, (0, promises_1.mkdir)(teamDir, { recursive: true })];
                case 2:
                    // pullTeamMemory returns early without creating the dir for fresh repos
                    // with no server content (index.ts isEmpty path). mkdir with
                    // recursive:true is idempotent — no existence check needed.
                    _a.sent();
                    watcher = (0, fs_1.watch)(teamDir, { persistent: true, recursive: true }, function (_eventType, filename) {
                        if (filename === null) {
                            schedulePush();
                            return;
                        }
                        if (pushSuppressedReason !== null) {
                            // Suppression is only cleared by unlink (recovery action for
                            // too-many-entries). fs.watch doesn't distinguish unlink from
                            // add/write — stat to disambiguate. ENOENT → file gone → clear.
                            void (0, promises_1.stat)((0, path_1.join)(teamDir, filename)).catch(function (err) {
                                if (err.code !== 'ENOENT')
                                    return;
                                if (pushSuppressedReason !== null) {
                                    (0, debug_js_1.logForDebugging)("team-memory-watcher: unlink cleared suppression (was: ".concat(pushSuppressedReason, ")"), { level: 'info' });
                                    pushSuppressedReason = null;
                                }
                                schedulePush();
                            });
                            return;
                        }
                        schedulePush();
                    });
                    watcher.on('error', function (err) {
                        (0, debug_js_1.logForDebugging)("team-memory-watcher: fs.watch error: ".concat((0, errors_js_1.errorMessage)(err)), { level: 'warn' });
                    });
                    (0, debug_js_1.logForDebugging)("team-memory-watcher: watching ".concat(teamDir), {
                        level: 'debug',
                    });
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    // fs.watch throws synchronously on ENOENT (race: dir deleted between
                    // mkdir and watch) or EACCES. watcherStarted is already true above,
                    // so notifyTeamMemoryWrite's explicit schedulePush path still works.
                    (0, debug_js_1.logForDebugging)("team-memory-watcher: failed to watch ".concat(teamDir, ": ").concat((0, errors_js_1.errorMessage)(err_1)), { level: 'warn' });
                    return [3 /*break*/, 4];
                case 4:
                    (0, cleanupRegistry_js_1.registerCleanup)(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/, stopTeamMemoryWatcher()];
                    }); }); });
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Start the team memory sync system.
 *
 * Returns early (before creating any state) if:
 *   - TEAMMEM build flag is off
 *   - team memory is disabled (isTeamMemoryEnabled)
 *   - OAuth is not available (isTeamMemorySyncAvailable)
 *   - the current repo has no github.com remote
 *
 * The early github.com check prevents a noisy failure mode where the
 * watcher starts, it fires on local edits, and every push/pull
 * logs `errorType: no_repo` forever. Team memory is GitHub-scoped on
 * the server side, so non-github.com remotes can never sync anyway.
 *
 * Pulls from server, then starts the file watcher unconditionally.
 * The watcher must start even when the server has no content yet
 * (fresh EAP repo) — otherwise Claude's first team-memory write
 * depends entirely on PostToolUse hooks firing notifyTeamMemoryWrite,
 * which is a chicken-and-egg: Claude's write rate is low enough that
 * a fresh partner can sit in the bootstrap dead zone for days.
 */
function startTeamMemoryWatcher() {
    return __awaiter(this, void 0, void 0, function () {
        var repoSlug, initialPullSuccess, initialFilesPulled, serverHasContent, pullResult, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(0, bun_bundle_1.feature)('TEAMMEM')) {
                        return [2 /*return*/];
                    }
                    if (!(0, teamMemPaths_js_1.isTeamMemoryEnabled)() || !(0, index_js_2.isTeamMemorySyncAvailable)()) {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, (0, git_js_1.getGithubRepo)()];
                case 1:
                    repoSlug = _a.sent();
                    if (!repoSlug) {
                        (0, debug_js_1.logForDebugging)('team-memory-watcher: no github.com remote, skipping sync', { level: 'debug' });
                        return [2 /*return*/];
                    }
                    syncState = (0, index_js_2.createSyncState)();
                    initialPullSuccess = false;
                    initialFilesPulled = 0;
                    serverHasContent = false;
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, index_js_2.pullTeamMemory)(syncState)];
                case 3:
                    pullResult = _a.sent();
                    initialPullSuccess = pullResult.success;
                    serverHasContent = pullResult.entryCount > 0;
                    if (pullResult.success && pullResult.filesWritten > 0) {
                        initialFilesPulled = pullResult.filesWritten;
                        (0, debug_js_1.logForDebugging)("team-memory-watcher: initial pull got ".concat(pullResult.filesWritten, " files"), { level: 'info' });
                    }
                    return [3 /*break*/, 5];
                case 4:
                    e_2 = _a.sent();
                    (0, debug_js_1.logForDebugging)("team-memory-watcher: initial pull failed: ".concat((0, errors_js_1.errorMessage)(e_2)), { level: 'warn' });
                    return [3 /*break*/, 5];
                case 5: 
                // Always start the watcher. Watching an empty dir is cheap,
                // and the alternative (lazy start on notifyTeamMemoryWrite) creates
                // a bootstrap dead zone for fresh repos.
                return [4 /*yield*/, startFileWatcher((0, teamMemPaths_js_1.getTeamMemPath)())];
                case 6:
                    // Always start the watcher. Watching an empty dir is cheap,
                    // and the alternative (lazy start on notifyTeamMemoryWrite) creates
                    // a bootstrap dead zone for fresh repos.
                    _a.sent();
                    (0, index_js_1.logEvent)('tengu_team_mem_sync_started', {
                        initial_pull_success: initialPullSuccess,
                        initial_files_pulled: initialFilesPulled,
                        // Kept for dashboard continuity; now always true when this event fires.
                        watcher_started: true,
                        server_has_content: serverHasContent,
                    });
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Call this when a team memory file is written (e.g. from PostToolUse hooks).
 * Schedules a push explicitly in case fs.watch misses the write —
 * a file written in the same tick the watcher starts may not fire an
 * event, and some platforms coalesce rapid successive writes.
 * If the watcher does fire, the debounce timer just resets.
 */
function notifyTeamMemoryWrite() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!syncState) {
                return [2 /*return*/];
            }
            schedulePush();
            return [2 /*return*/];
        });
    });
}
/**
 * Stop the file watcher and flush pending changes.
 * Note: runs within the 2s graceful shutdown budget, so the flush
 * is best-effort — if the HTTP PUT doesn't complete in time,
 * process.exit() will kill it.
 */
function stopTeamMemoryWatcher() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (debounceTimer) {
                        clearTimeout(debounceTimer);
                        debounceTimer = null;
                    }
                    if (watcher) {
                        watcher.close();
                        watcher = null;
                    }
                    if (!currentPushPromise) return [3 /*break*/, 4];
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, currentPushPromise];
                case 2:
                    _c.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = _c.sent();
                    return [3 /*break*/, 4];
                case 4:
                    if (!(hasPendingChanges && syncState && pushSuppressedReason === null)) return [3 /*break*/, 8];
                    _c.label = 5;
                case 5:
                    _c.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, (0, index_js_2.pushTeamMemory)(syncState)];
                case 6:
                    _c.sent();
                    return [3 /*break*/, 8];
                case 7:
                    _b = _c.sent();
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
/**
 * Test-only: reset module state and optionally seed syncState.
 * The feature('TEAMMEM') gate at the top of startTeamMemoryWatcher() is
 * always false in bun test, so tests can't set syncState through the normal
 * path. This helper lets tests drive notifyTeamMemoryWrite() /
 * stopTeamMemoryWatcher() directly.
 *
 * `skipWatcher: true` marks the watcher as already-started without actually
 * starting it. Tests that only exercise the schedulePush/flush path don't
 * need a real watcher.
 */
function _resetWatcherStateForTesting(opts) {
    var _a, _b, _c;
    watcher = null;
    debounceTimer = null;
    pushInProgress = false;
    hasPendingChanges = false;
    currentPushPromise = null;
    watcherStarted = (_a = opts === null || opts === void 0 ? void 0 : opts.skipWatcher) !== null && _a !== void 0 ? _a : false;
    pushSuppressedReason = (_b = opts === null || opts === void 0 ? void 0 : opts.pushSuppressedReason) !== null && _b !== void 0 ? _b : null;
    syncState = (_c = opts === null || opts === void 0 ? void 0 : opts.syncState) !== null && _c !== void 0 ? _c : null;
}
/**
 * Test-only: start the real fs.watch on a specified directory.
 * Used by the fd-count regression test — startTeamMemoryWatcher() is gated
 * by feature('TEAMMEM') which is false under bun test.
 */
function _startFileWatcherForTesting(dir) {
    return startFileWatcher(dir);
}
