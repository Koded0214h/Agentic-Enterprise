"use strict";
// Non-React scheduler core for .claude/scheduled_tasks.json.
// Shared by REPL (via useScheduledTasks) and SDK/-p mode (print.ts).
//
// Lifecycle: poll getScheduledTasksEnabled() until true (flag flips when
// CronCreate runs or a skill on: trigger fires) → load tasks + watch the
// file + start a 1s check timer → on fire, call onFire(prompt). stop()
// tears everything down.
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
exports.isRecurringTaskAged = isRecurringTaskAged;
exports.createCronScheduler = createCronScheduler;
exports.buildMissedTaskNotification = buildMissedTaskNotification;
var state_js_1 = require("../bootstrap/state.js");
var index_js_1 = require("../services/analytics/index.js");
var cron_js_1 = require("./cron.js");
var cronTasks_js_1 = require("./cronTasks.js");
var cronTasksLock_js_1 = require("./cronTasksLock.js");
var debug_js_1 = require("./debug.js");
var CHECK_INTERVAL_MS = 1000;
var FILE_STABILITY_MS = 300;
// How often a non-owning session re-probes the scheduler lock. Coarse
// because takeover only matters when the owning session has crashed.
var LOCK_PROBE_INTERVAL_MS = 5000;
/**
 * True when a recurring task was created more than `maxAgeMs` ago and should
 * be deleted on its next fire. Permanent tasks never age. `maxAgeMs === 0`
 * means unlimited (never ages out). Sourced from
 * {@link CronJitterConfig.recurringMaxAgeMs} at call time.
 * Extracted for testability — the scheduler's check() is buried under
 * setInterval/chokidar/lock machinery.
 */
function isRecurringTaskAged(t, nowMs, maxAgeMs) {
    if (maxAgeMs === 0)
        return false;
    return Boolean(t.recurring && !t.permanent && nowMs - t.createdAt >= maxAgeMs);
}
function createCronScheduler(options) {
    var onFire = options.onFire, isLoading = options.isLoading, _a = options.assistantMode, assistantMode = _a === void 0 ? false : _a, onFireTask = options.onFireTask, onMissed = options.onMissed, dir = options.dir, lockIdentity = options.lockIdentity, getJitterConfig = options.getJitterConfig, isKilled = options.isKilled, filter = options.filter;
    var lockOpts = dir || lockIdentity ? { dir: dir, lockIdentity: lockIdentity } : undefined;
    // File-backed tasks only. Session tasks (durable: false) are NOT loaded
    // here — they can be added/removed mid-session with no file event, so
    // check() reads them fresh from bootstrap state on every tick instead.
    var tasks = [];
    // Per-task next-fire times (epoch ms).
    var nextFireAt = new Map();
    // Ids we've already enqueued a "missed task" prompt for — prevents
    // re-asking on every file change before the user answers.
    var missedAsked = new Set();
    // Tasks currently enqueued but not yet removed from the file. Prevents
    // double-fire if the interval ticks again before removeCronTasks lands.
    var inFlight = new Set();
    var enablePoll = null;
    var checkTimer = null;
    var lockProbeTimer = null;
    var watcher = null;
    var stopped = false;
    var isOwner = false;
    function load(initial) {
        return __awaiter(this, void 0, void 0, function () {
            var next, now, missed, _i, missed_1, t;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, cronTasks_js_1.readCronTasks)(dir)];
                    case 1:
                        next = _a.sent();
                        if (stopped)
                            return [2 /*return*/];
                        tasks = next;
                        // Only surface missed tasks on initial load. Chokidar-triggered
                        // reloads leave overdue tasks to check() (which anchors from createdAt
                        // and fires immediately). This avoids a misleading "missed while Claude
                        // was not running" prompt for tasks that became overdue mid-session.
                        //
                        // Recurring tasks are NOT surfaced or deleted — check() handles them
                        // correctly (fires on first tick, reschedules forward). Only one-shot
                        // missed tasks need user input (run once now, or discard forever).
                        if (!initial)
                            return [2 /*return*/];
                        now = Date.now();
                        missed = (0, cronTasks_js_1.findMissedTasks)(next, now).filter(function (t) { return !t.recurring && !missedAsked.has(t.id) && (!filter || filter(t)); });
                        if (missed.length > 0) {
                            for (_i = 0, missed_1 = missed; _i < missed_1.length; _i++) {
                                t = missed_1[_i];
                                missedAsked.add(t.id);
                                // Prevent check() from re-firing the raw prompt while the async
                                // removeCronTasks + chokidar reload chain is in progress.
                                nextFireAt.set(t.id, Infinity);
                            }
                            (0, index_js_1.logEvent)('tengu_scheduled_task_missed', {
                                count: missed.length,
                                taskIds: missed
                                    .map(function (t) { return t.id; })
                                    .join(','),
                            });
                            if (onMissed) {
                                onMissed(missed);
                            }
                            else {
                                onFire(buildMissedTaskNotification(missed));
                            }
                            void (0, cronTasks_js_1.removeCronTasks)(missed.map(function (t) { return t.id; }), dir).catch(function (e) {
                                return (0, debug_js_1.logForDebugging)("[ScheduledTasks] failed to remove missed tasks: ".concat(e));
                            });
                            (0, debug_js_1.logForDebugging)("[ScheduledTasks] surfaced ".concat(missed.length, " missed one-shot task(s)"));
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    function check() {
        var _a;
        if (isKilled === null || isKilled === void 0 ? void 0 : isKilled())
            return;
        if (isLoading() && !assistantMode)
            return;
        var now = Date.now();
        var seen = new Set();
        // File-backed recurring tasks that fired this tick. Batched into one
        // markCronTasksFired call after the loop so N fires = one write. Session
        // tasks excluded — they die with the process, no point persisting.
        var firedFileRecurring = [];
        // Read once per tick. REPL callers pass getJitterConfig backed by
        // GrowthBook so a config push takes effect without restart. Daemon and
        // SDK callers omit it and get DEFAULT_CRON_JITTER_CONFIG (safe — jitter
        // is an ops lever for REPL fleet load-shedding, not a daemon concern).
        var jitterCfg = (_a = getJitterConfig === null || getJitterConfig === void 0 ? void 0 : getJitterConfig()) !== null && _a !== void 0 ? _a : cronTasks_js_1.DEFAULT_CRON_JITTER_CONFIG;
        // Shared loop body. `isSession` routes the one-shot cleanup path:
        // session tasks are removed synchronously from memory, file tasks go
        // through the async removeCronTasks + chokidar reload.
        function process(t, isSession) {
            var _a, _b, _c, _d, _e;
            if (filter && !filter(t))
                return;
            seen.add(t.id);
            if (inFlight.has(t.id))
                return;
            var next = nextFireAt.get(t.id);
            if (next === undefined) {
                // First sight — anchor from lastFiredAt (recurring) or createdAt.
                // Never-fired recurring tasks use createdAt: if isLoading delayed
                // this tick past the fire time, anchoring from `now` would compute
                // next-year for pinned crons (`30 14 27 2 *`). Fired-before tasks
                // use lastFiredAt: the reschedule below writes `now` back to disk,
                // so on next process spawn first-sight computes the SAME newNext we
                // set in-memory here. Without this, a daemon child despawning on
                // idle loses nextFireAt and the next spawn re-anchors from 10-day-
                // old createdAt → fires every task every cycle.
                next = t.recurring
                    ? ((_b = (0, cronTasks_js_1.jitteredNextCronRunMs)(t.cron, (_a = t.lastFiredAt) !== null && _a !== void 0 ? _a : t.createdAt, t.id, jitterCfg)) !== null && _b !== void 0 ? _b : Infinity)
                    : ((_c = (0, cronTasks_js_1.oneShotJitteredNextCronRunMs)(t.cron, t.createdAt, t.id, jitterCfg)) !== null && _c !== void 0 ? _c : Infinity);
                nextFireAt.set(t.id, next);
                (0, debug_js_1.logForDebugging)("[ScheduledTasks] scheduled ".concat(t.id, " for ").concat(next === Infinity ? 'never' : new Date(next).toISOString()));
            }
            if (now < next)
                return;
            (0, debug_js_1.logForDebugging)("[ScheduledTasks] firing ".concat(t.id).concat(t.recurring ? ' (recurring)' : ''));
            (0, index_js_1.logEvent)('tengu_scheduled_task_fire', {
                recurring: (_d = t.recurring) !== null && _d !== void 0 ? _d : false,
                taskId: t.id,
            });
            if (onFireTask) {
                onFireTask(t);
            }
            else {
                onFire(t.prompt);
            }
            // Aged-out recurring tasks fall through to the one-shot delete paths
            // below (session tasks get synchronous removal; file tasks get the
            // async inFlight/chokidar path). Fires one last time, then is removed.
            var aged = isRecurringTaskAged(t, now, jitterCfg.recurringMaxAgeMs);
            if (aged) {
                var ageHours = Math.floor((now - t.createdAt) / 1000 / 60 / 60);
                (0, debug_js_1.logForDebugging)("[ScheduledTasks] recurring task ".concat(t.id, " aged out (").concat(ageHours, "h since creation), deleting after final fire"));
                (0, index_js_1.logEvent)('tengu_scheduled_task_expired', {
                    taskId: t.id,
                    ageHours: ageHours,
                });
            }
            if (t.recurring && !aged) {
                // Recurring: reschedule from now (not from next) to avoid rapid
                // catch-up if the session was blocked. Jitter keeps us off the
                // exact :00 wall-clock boundary every cycle.
                var newNext = (_e = (0, cronTasks_js_1.jitteredNextCronRunMs)(t.cron, now, t.id, jitterCfg)) !== null && _e !== void 0 ? _e : Infinity;
                nextFireAt.set(t.id, newNext);
                // Persist lastFiredAt=now so next process spawn reconstructs this
                // same newNext on first-sight. Session tasks skip — process-local.
                if (!isSession)
                    firedFileRecurring.push(t.id);
            }
            else if (isSession) {
                // One-shot (or aged-out recurring) session task: synchronous memory
                // removal. No inFlight window — the next tick will read a session
                // store without this id.
                (0, state_js_1.removeSessionCronTasks)([t.id]);
                nextFireAt.delete(t.id);
            }
            else {
                // One-shot (or aged-out recurring) file task: delete from disk.
                // inFlight guards against double-fire during the async
                // removeCronTasks + chokidar reload.
                inFlight.add(t.id);
                void (0, cronTasks_js_1.removeCronTasks)([t.id], dir)
                    .catch(function (e) {
                    return (0, debug_js_1.logForDebugging)("[ScheduledTasks] failed to remove task ".concat(t.id, ": ").concat(e));
                })
                    .finally(function () { return inFlight.delete(t.id); });
                nextFireAt.delete(t.id);
            }
        }
        // File-backed tasks: only when we own the scheduler lock. The lock
        // exists to stop two Claude sessions in the same cwd from double-firing
        // the same on-disk task.
        if (isOwner) {
            for (var _i = 0, tasks_1 = tasks; _i < tasks_1.length; _i++) {
                var t = tasks_1[_i];
                process(t, false);
            }
            // Batched lastFiredAt write. inFlight guards against double-fire
            // during the chokidar-triggered reload (same pattern as removeCronTasks
            // below) — the reload re-seeds `tasks` with the just-written
            // lastFiredAt, and first-sight on that yields the same newNext we
            // already set in-memory, so it's idempotent even without inFlight.
            // Guarding anyway keeps the semantics obvious.
            if (firedFileRecurring.length > 0) {
                for (var _b = 0, firedFileRecurring_1 = firedFileRecurring; _b < firedFileRecurring_1.length; _b++) {
                    var id = firedFileRecurring_1[_b];
                    inFlight.add(id);
                }
                void (0, cronTasks_js_1.markCronTasksFired)(firedFileRecurring, now, dir)
                    .catch(function (e) {
                    return (0, debug_js_1.logForDebugging)("[ScheduledTasks] failed to persist lastFiredAt: ".concat(e));
                })
                    .finally(function () {
                    for (var _i = 0, firedFileRecurring_2 = firedFileRecurring; _i < firedFileRecurring_2.length; _i++) {
                        var id = firedFileRecurring_2[_i];
                        inFlight.delete(id);
                    }
                });
            }
        }
        // Session-only tasks: process-private, the lock does not apply — the
        // other session cannot see them and there is no double-fire risk. Read
        // fresh from bootstrap state every tick (no chokidar, no load()). This
        // is skipped on the daemon path (`dir !== undefined`) which never
        // touches bootstrap state.
        if (dir === undefined) {
            for (var _c = 0, _d = (0, state_js_1.getSessionCronTasks)(); _c < _d.length; _c++) {
                var t = _d[_c];
                process(t, true);
            }
        }
        if (seen.size === 0) {
            // No live tasks this tick — clear the whole schedule so
            // getNextFireTime() returns null. The eviction loop below is
            // unreachable here (seen is empty), so stale entries would
            // otherwise survive indefinitely and keep the daemon agent warm.
            nextFireAt.clear();
            return;
        }
        // Evict schedule entries for tasks no longer present. When !isOwner,
        // file-task ids aren't in `seen` and get evicted — harmless: they
        // re-anchor from createdAt on the first owned tick.
        for (var _e = 0, _f = nextFireAt.keys(); _e < _f.length; _e++) {
            var id = _f[_e];
            if (!seen.has(id))
                nextFireAt.delete(id);
        }
    }
    function enable() {
        return __awaiter(this, void 0, void 0, function () {
            var chokidar, path;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (stopped)
                            return [2 /*return*/];
                        if (enablePoll) {
                            clearInterval(enablePoll);
                            enablePoll = null;
                        }
                        return [4 /*yield*/, Promise.resolve().then(function () { return require('chokidar'); })];
                    case 1:
                        chokidar = (_c.sent()).default;
                        if (stopped)
                            return [2 /*return*/];
                        return [4 /*yield*/, (0, cronTasksLock_js_1.tryAcquireSchedulerLock)(lockOpts).catch(function () { return false; })];
                    case 2:
                        // Acquire the per-project scheduler lock. Only the owning session runs
                        // check(). Other sessions probe periodically to take over if the owner
                        // dies. Prevents double-firing when multiple Claudes share a cwd.
                        isOwner = _c.sent();
                        if (stopped) {
                            if (isOwner) {
                                isOwner = false;
                                void (0, cronTasksLock_js_1.releaseSchedulerLock)(lockOpts);
                            }
                            return [2 /*return*/];
                        }
                        if (!isOwner) {
                            lockProbeTimer = setInterval(function () {
                                void (0, cronTasksLock_js_1.tryAcquireSchedulerLock)(lockOpts)
                                    .then(function (owned) {
                                    if (stopped) {
                                        if (owned)
                                            void (0, cronTasksLock_js_1.releaseSchedulerLock)(lockOpts);
                                        return;
                                    }
                                    if (owned) {
                                        isOwner = true;
                                        if (lockProbeTimer) {
                                            clearInterval(lockProbeTimer);
                                            lockProbeTimer = null;
                                        }
                                    }
                                })
                                    .catch(function (e) { return (0, debug_js_1.logForDebugging)(String(e), { level: 'error' }); });
                            }, LOCK_PROBE_INTERVAL_MS);
                            (_a = lockProbeTimer.unref) === null || _a === void 0 ? void 0 : _a.call(lockProbeTimer);
                        }
                        void load(true);
                        path = (0, cronTasks_js_1.getCronFilePath)(dir);
                        watcher = chokidar.watch(path, {
                            persistent: false,
                            ignoreInitial: true,
                            awaitWriteFinish: { stabilityThreshold: FILE_STABILITY_MS },
                            ignorePermissionErrors: true,
                        });
                        watcher.on('add', function () { return void load(false); });
                        watcher.on('change', function () { return void load(false); });
                        watcher.on('unlink', function () {
                            if (!stopped) {
                                tasks = [];
                                nextFireAt.clear();
                            }
                        });
                        checkTimer = setInterval(check, CHECK_INTERVAL_MS);
                        // Don't keep the process alive for the scheduler alone — in -p text mode
                        // the process should exit after the single turn even if a cron was created.
                        (_b = checkTimer.unref) === null || _b === void 0 ? void 0 : _b.call(checkTimer);
                        return [2 /*return*/];
                }
            });
        });
    }
    return {
        start: function () {
            var _a;
            stopped = false;
            // Daemon path (dir explicitly given): don't touch bootstrap state —
            // getScheduledTasksEnabled() would read a never-initialized flag. The
            // daemon is asking to schedule; just enable.
            if (dir !== undefined) {
                (0, debug_js_1.logForDebugging)("[ScheduledTasks] scheduler start() \u2014 dir=".concat(dir, ", hasTasks=").concat((0, cronTasks_js_1.hasCronTasksSync)(dir)));
                void enable();
                return;
            }
            (0, debug_js_1.logForDebugging)("[ScheduledTasks] scheduler start() \u2014 enabled=".concat((0, state_js_1.getScheduledTasksEnabled)(), ", hasTasks=").concat((0, cronTasks_js_1.hasCronTasksSync)()));
            // Auto-enable when scheduled_tasks.json has entries. CronCreateTool
            // also sets this when a task is created mid-session.
            if (!(0, state_js_1.getScheduledTasksEnabled)() &&
                (assistantMode || (0, cronTasks_js_1.hasCronTasksSync)())) {
                (0, state_js_1.setScheduledTasksEnabled)(true);
            }
            if ((0, state_js_1.getScheduledTasksEnabled)()) {
                void enable();
                return;
            }
            enablePoll = setInterval(function (en) {
                if ((0, state_js_1.getScheduledTasksEnabled)())
                    void en();
            }, CHECK_INTERVAL_MS, enable);
            (_a = enablePoll.unref) === null || _a === void 0 ? void 0 : _a.call(enablePoll);
        },
        stop: function () {
            stopped = true;
            if (enablePoll) {
                clearInterval(enablePoll);
                enablePoll = null;
            }
            if (checkTimer) {
                clearInterval(checkTimer);
                checkTimer = null;
            }
            if (lockProbeTimer) {
                clearInterval(lockProbeTimer);
                lockProbeTimer = null;
            }
            void (watcher === null || watcher === void 0 ? void 0 : watcher.close());
            watcher = null;
            if (isOwner) {
                isOwner = false;
                void (0, cronTasksLock_js_1.releaseSchedulerLock)(lockOpts);
            }
        },
        getNextFireTime: function () {
            // nextFireAt uses Infinity for "never" (in-flight one-shots, bad cron
            // strings). Filter those out so callers can distinguish "soon" from
            // "nothing pending".
            var min = Infinity;
            for (var _i = 0, _a = nextFireAt.values(); _i < _a.length; _i++) {
                var t = _a[_i];
                if (t < min)
                    min = t;
            }
            return min === Infinity ? null : min;
        },
    };
}
/**
 * Build the missed-task notification text. Guidance precedes the task list
 * and the list is wrapped in a code fence so a multi-line imperative prompt
 * is not interpreted as immediate instructions to avoid self-inflicted
 * prompt injection. The full prompt body is preserved — this path DOES
 * need the model to execute the prompt after user
 * confirmation, and tasks are already deleted from JSON before the model
 * sees this notification.
 */
function buildMissedTaskNotification(missed) {
    var plural = missed.length > 1;
    var header = "The following one-shot scheduled task".concat(plural ? 's were' : ' was', " missed while Claude was not running. ") +
        "".concat(plural ? 'They have' : 'It has', " already been removed from .claude/scheduled_tasks.json.\n\n") +
        "Do NOT execute ".concat(plural ? 'these prompts' : 'this prompt', " yet. ") +
        "First use the AskUserQuestion tool to ask whether to run ".concat(plural ? 'each one' : 'it', " now. ") +
        "Only execute if the user confirms.";
    var blocks = missed.map(function (t) {
        var _a;
        var meta = "[".concat((0, cron_js_1.cronToHuman)(t.cron), ", created ").concat(new Date(t.createdAt).toLocaleString(), "]");
        // Use a fence one longer than any backtick run in the prompt so a
        // prompt containing ``` cannot close the fence early and un-wrap the
        // trailing text (CommonMark fence-matching rule).
        var longestRun = ((_a = t.prompt.match(/`+/g)) !== null && _a !== void 0 ? _a : []).reduce(function (max, run) { return Math.max(max, run.length); }, 0);
        var fence = '`'.repeat(Math.max(3, longestRun + 1));
        return "".concat(meta, "\n").concat(fence, "\n").concat(t.prompt, "\n").concat(fence);
    });
    return "".concat(header, "\n\n").concat(blocks.join('\n\n'));
}
