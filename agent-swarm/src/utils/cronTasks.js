"use strict";
// Scheduled prompts, stored in <project>/.claude/scheduled_tasks.json.
//
// Tasks come in two flavors:
//   - One-shot (recurring: false/undefined) — fire once, then auto-delete.
//   - Recurring (recurring: true) — fire on schedule, reschedule from now,
//     persist until explicitly deleted via CronDelete or auto-expire after
//     a configurable limit (DEFAULT_CRON_JITTER_CONFIG.recurringMaxAgeMs).
//
// File format:
//   { "tasks": [{ id, cron, prompt, createdAt, recurring?, permanent? }] }
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
exports.DEFAULT_CRON_JITTER_CONFIG = void 0;
exports.getCronFilePath = getCronFilePath;
exports.readCronTasks = readCronTasks;
exports.hasCronTasksSync = hasCronTasksSync;
exports.writeCronTasks = writeCronTasks;
exports.addCronTask = addCronTask;
exports.removeCronTasks = removeCronTasks;
exports.markCronTasksFired = markCronTasksFired;
exports.listAllCronTasks = listAllCronTasks;
exports.nextCronRunMs = nextCronRunMs;
exports.jitteredNextCronRunMs = jitteredNextCronRunMs;
exports.oneShotJitteredNextCronRunMs = oneShotJitteredNextCronRunMs;
exports.findMissedTasks = findMissedTasks;
var crypto_1 = require("crypto");
var fs_1 = require("fs");
var promises_1 = require("fs/promises");
var path_1 = require("path");
var state_js_1 = require("../bootstrap/state.js");
var cron_js_1 = require("./cron.js");
var debug_js_1 = require("./debug.js");
var errors_js_1 = require("./errors.js");
var fsOperations_js_1 = require("./fsOperations.js");
var json_js_1 = require("./json.js");
var log_js_1 = require("./log.js");
var slowOperations_js_1 = require("./slowOperations.js");
var CRON_FILE_REL = (0, path_1.join)('.claude', 'scheduled_tasks.json');
/**
 * Path to the cron file. `dir` defaults to getProjectRoot() — pass it
 * explicitly from contexts that don't run through main.tsx (e.g. the Agent
 * SDK daemon, which has no bootstrap state).
 */
function getCronFilePath(dir) {
    return (0, path_1.join)(dir !== null && dir !== void 0 ? dir : (0, state_js_1.getProjectRoot)(), CRON_FILE_REL);
}
/**
 * Read and parse .claude/scheduled_tasks.json. Returns an empty task list if the file
 * is missing, empty, or malformed. Tasks with invalid cron strings are
 * silently dropped (logged at debug level) so a single bad entry never
 * blocks the whole file.
 */
function readCronTasks(dir) {
    return __awaiter(this, void 0, void 0, function () {
        var fs, raw, e_1, parsed, file, out, _i, _a, t;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fs.readFile(getCronFilePath(dir), { encoding: 'utf-8' })];
                case 2:
                    raw = _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _b.sent();
                    if ((0, errors_js_1.isFsInaccessible)(e_1))
                        return [2 /*return*/, []];
                    (0, log_js_1.logError)(e_1);
                    return [2 /*return*/, []];
                case 4:
                    parsed = (0, json_js_1.safeParseJSON)(raw, false);
                    if (!parsed || typeof parsed !== 'object')
                        return [2 /*return*/, []];
                    file = parsed;
                    if (!Array.isArray(file.tasks))
                        return [2 /*return*/, []];
                    out = [];
                    for (_i = 0, _a = file.tasks; _i < _a.length; _i++) {
                        t = _a[_i];
                        if (!t ||
                            typeof t.id !== 'string' ||
                            typeof t.cron !== 'string' ||
                            typeof t.prompt !== 'string' ||
                            typeof t.createdAt !== 'number') {
                            (0, debug_js_1.logForDebugging)("[ScheduledTasks] skipping malformed task: ".concat((0, slowOperations_js_1.jsonStringify)(t)));
                            continue;
                        }
                        if (!(0, cron_js_1.parseCronExpression)(t.cron)) {
                            (0, debug_js_1.logForDebugging)("[ScheduledTasks] skipping task ".concat(t.id, " with invalid cron '").concat(t.cron, "'"));
                            continue;
                        }
                        out.push(__assign(__assign(__assign({ id: t.id, cron: t.cron, prompt: t.prompt, createdAt: t.createdAt }, (typeof t.lastFiredAt === 'number'
                            ? { lastFiredAt: t.lastFiredAt }
                            : {})), (t.recurring ? { recurring: true } : {})), (t.permanent ? { permanent: true } : {})));
                    }
                    return [2 /*return*/, out];
            }
        });
    });
}
/**
 * Sync check for whether the cron file has any valid tasks. Used by
 * cronScheduler.start() to decide whether to auto-enable. One file read.
 */
function hasCronTasksSync(dir) {
    var raw;
    try {
        // eslint-disable-next-line custom-rules/no-sync-fs -- called once from cronScheduler.start()
        raw = (0, fs_1.readFileSync)(getCronFilePath(dir), 'utf-8');
    }
    catch (_a) {
        return false;
    }
    var parsed = (0, json_js_1.safeParseJSON)(raw, false);
    if (!parsed || typeof parsed !== 'object')
        return false;
    var tasks = parsed.tasks;
    return Array.isArray(tasks) && tasks.length > 0;
}
/**
 * Overwrite .claude/scheduled_tasks.json with the given tasks. Creates .claude/ if
 * missing. Empty task list writes an empty file (rather than deleting) so
 * the file watcher sees a change event on last-task-removed.
 */
function writeCronTasks(tasks, dir) {
    return __awaiter(this, void 0, void 0, function () {
        var root, body;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    root = dir !== null && dir !== void 0 ? dir : (0, state_js_1.getProjectRoot)();
                    return [4 /*yield*/, (0, promises_1.mkdir)((0, path_1.join)(root, '.claude'), { recursive: true })
                        // Strip the runtime-only `durable` flag — everything on disk is durable
                        // by definition, and keeping the flag out means readCronTasks() naturally
                        // yields durable: undefined without having to set it explicitly.
                    ];
                case 1:
                    _a.sent();
                    body = {
                        tasks: tasks.map(function (_a) {
                            var _durable = _a.durable, rest = __rest(_a, ["durable"]);
                            return rest;
                        }),
                    };
                    return [4 /*yield*/, (0, promises_1.writeFile)(getCronFilePath(root), (0, slowOperations_js_1.jsonStringify)(body, null, 2) + '\n', 'utf-8')];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Append a task. Returns the generated id. Caller is responsible for having
 * already validated the cron string (the tool does this via validateInput).
 *
 * When `durable` is false the task is held in process memory only
 * (bootstrap/state.ts) — it fires on schedule this session but is never
 * written to .claude/scheduled_tasks.json and dies with the process. The
 * scheduler merges session tasks into its tick loop directly, so no file
 * change event is needed.
 */
function addCronTask(cron, prompt, recurring, durable, agentId) {
    return __awaiter(this, void 0, void 0, function () {
        var id, task, tasks;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    id = (0, crypto_1.randomUUID)().slice(0, 8);
                    task = __assign({ id: id, cron: cron, prompt: prompt, createdAt: Date.now() }, (recurring ? { recurring: true } : {}));
                    if (!durable) {
                        (0, state_js_1.addSessionCronTask)(__assign(__assign({}, task), (agentId ? { agentId: agentId } : {})));
                        return [2 /*return*/, id];
                    }
                    return [4 /*yield*/, readCronTasks()];
                case 1:
                    tasks = _a.sent();
                    tasks.push(task);
                    return [4 /*yield*/, writeCronTasks(tasks)];
                case 2:
                    _a.sent();
                    return [2 /*return*/, id];
            }
        });
    });
}
/**
 * Remove tasks by id. No-op if none match (e.g. another session raced us).
 * Used for both fire-once cleanup and explicit CronDelete.
 *
 * When called with `dir` undefined (REPL path), also sweeps the in-memory
 * session store — the caller doesn't know which store an id lives in.
 * Daemon callers pass `dir` explicitly; they have no session, and the
 * `dir !== undefined` guard keeps this function from touching bootstrap
 * state on that path (tests enforce this).
 */
function removeCronTasks(ids, dir) {
    return __awaiter(this, void 0, void 0, function () {
        var idSet, tasks, remaining;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (ids.length === 0)
                        return [2 /*return*/];
                    // Sweep session store first. If every id was accounted for there, we're
                    // done — skip the file read entirely. removeSessionCronTasks is a no-op
                    // (returns 0) on miss, so pre-existing durable-delete paths fall through
                    // without allocating.
                    if (dir === undefined && (0, state_js_1.removeSessionCronTasks)(ids) === ids.length) {
                        return [2 /*return*/];
                    }
                    idSet = new Set(ids);
                    return [4 /*yield*/, readCronTasks(dir)];
                case 1:
                    tasks = _a.sent();
                    remaining = tasks.filter(function (t) { return !idSet.has(t.id); });
                    if (remaining.length === tasks.length)
                        return [2 /*return*/];
                    return [4 /*yield*/, writeCronTasks(remaining, dir)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Stamp `lastFiredAt` on the given recurring tasks and write back. Batched
 * so N fires in one scheduler tick = one read-modify-write, not N. Only
 * touches file-backed tasks — session tasks die with the process, no point
 * persisting their fire time. No-op if none of the ids match (task was
 * deleted between fire and write — e.g. user ran CronDelete mid-tick).
 *
 * Scheduler lock means at most one process calls this; chokidar picks up
 * the write and triggers a reload which re-seeds `nextFireAt` from the
 * just-written `lastFiredAt` — idempotent (same computation, same answer).
 */
function markCronTasksFired(ids, firedAt, dir) {
    return __awaiter(this, void 0, void 0, function () {
        var idSet, tasks, changed, _i, tasks_1, t;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (ids.length === 0)
                        return [2 /*return*/];
                    idSet = new Set(ids);
                    return [4 /*yield*/, readCronTasks(dir)];
                case 1:
                    tasks = _a.sent();
                    changed = false;
                    for (_i = 0, tasks_1 = tasks; _i < tasks_1.length; _i++) {
                        t = tasks_1[_i];
                        if (idSet.has(t.id)) {
                            t.lastFiredAt = firedAt;
                            changed = true;
                        }
                    }
                    if (!changed)
                        return [2 /*return*/];
                    return [4 /*yield*/, writeCronTasks(tasks, dir)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * File-backed tasks + session-only tasks, merged. Session tasks get
 * `durable: false` so callers can distinguish them. File tasks are
 * returned as-is (durable undefined → truthy).
 *
 * Only merges when `dir` is undefined — daemon callers (explicit `dir`)
 * have no session store to merge with.
 */
function listAllCronTasks(dir) {
    return __awaiter(this, void 0, void 0, function () {
        var fileTasks, sessionTasks;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, readCronTasks(dir)];
                case 1:
                    fileTasks = _a.sent();
                    if (dir !== undefined)
                        return [2 /*return*/, fileTasks];
                    sessionTasks = (0, state_js_1.getSessionCronTasks)().map(function (t) { return (__assign(__assign({}, t), { durable: false })); });
                    return [2 /*return*/, __spreadArray(__spreadArray([], fileTasks, true), sessionTasks, true)];
            }
        });
    });
}
/**
 * Next fire time in epoch ms for a cron string, strictly after `fromMs`.
 * Returns null if invalid or no match in the next 366 days.
 */
function nextCronRunMs(cron, fromMs) {
    var fields = (0, cron_js_1.parseCronExpression)(cron);
    if (!fields)
        return null;
    var next = (0, cron_js_1.computeNextCronRun)(fields, new Date(fromMs));
    return next ? next.getTime() : null;
}
exports.DEFAULT_CRON_JITTER_CONFIG = {
    recurringFrac: 0.1,
    recurringCapMs: 15 * 60 * 1000,
    oneShotMaxMs: 90 * 1000,
    oneShotFloorMs: 0,
    oneShotMinuteMod: 30,
    recurringMaxAgeMs: 7 * 24 * 60 * 60 * 1000,
};
/**
 * taskId is an 8-hex-char UUID slice (see {@link addCronTask}) → parse as
 * u32 → [0, 1). Stable across restarts, uniformly distributed across the
 * fleet. Non-hex ids (hand-edited JSON) fall back to 0 = no jitter.
 */
function jitterFrac(taskId) {
    var frac = parseInt(taskId.slice(0, 8), 16) / 4294967296;
    return Number.isFinite(frac) ? frac : 0;
}
/**
 * Same as {@link nextCronRunMs}, plus a deterministic per-task delay to
 * avoid a thundering herd when many sessions schedule the same cron string
 * (e.g. `0 * * * *` → everyone hits inference at :00).
 *
 * The delay is proportional to the current gap between fires
 * ({@link CronJitterConfig.recurringFrac}, capped at
 * {@link CronJitterConfig.recurringCapMs}) so at defaults an hourly task
 * spreads across [:00, :06) but a per-minute task only spreads by a few
 * seconds.
 *
 * Only used for recurring tasks. One-shot tasks use
 * {@link oneShotJitteredNextCronRunMs} (backward jitter, minute-gated).
 */
function jitteredNextCronRunMs(cron, fromMs, taskId, cfg) {
    if (cfg === void 0) { cfg = exports.DEFAULT_CRON_JITTER_CONFIG; }
    var t1 = nextCronRunMs(cron, fromMs);
    if (t1 === null)
        return null;
    var t2 = nextCronRunMs(cron, t1);
    // No second match in the next year (e.g. pinned date) → nothing to
    // proportion against, and near-certainly not a herd risk. Fire on t1.
    if (t2 === null)
        return t1;
    var jitter = Math.min(jitterFrac(taskId) * cfg.recurringFrac * (t2 - t1), cfg.recurringCapMs);
    return t1 + jitter;
}
/**
 * Same as {@link nextCronRunMs}, minus a deterministic per-task lead time
 * when the fire time lands on a minute boundary matching
 * {@link CronJitterConfig.oneShotMinuteMod}.
 *
 * One-shot tasks are user-pinned ("remind me at 3pm") so delaying them
 * breaks the contract — but firing slightly early is invisible and spreads
 * the inference spike from everyone picking the same round wall-clock time.
 * At defaults (mod 30, max 90 s, floor 0) only :00 and :30 get jitter,
 * because humans round to the half-hour.
 *
 * During an incident, ops can push `tengu_kairos_cron_config` with e.g.
 * `{oneShotMinuteMod: 15, oneShotMaxMs: 300000, oneShotFloorMs: 30000}` to
 * spread :00/:15/:30/:45 fires across a [t-5min, t-30s] window — every task
 * gets at least 30 s of lead, so nobody lands on the exact mark.
 *
 * Checks the computed fire time rather than the cron string so
 * `0 15 * * *`, step expressions, and `0,30 9 * * *` all get jitter
 * when they land on a matching minute. Clamped to `fromMs` so a task created
 * inside its own jitter window doesn't fire before it was created.
 */
function oneShotJitteredNextCronRunMs(cron, fromMs, taskId, cfg) {
    if (cfg === void 0) { cfg = exports.DEFAULT_CRON_JITTER_CONFIG; }
    var t1 = nextCronRunMs(cron, fromMs);
    if (t1 === null)
        return null;
    // Cron resolution is 1 minute → computed times always have :00 seconds,
    // so a minute-field check is sufficient to identify the hot marks.
    // getMinutes() (local), not getUTCMinutes(): cron is evaluated in local
    // time, and "user picked a round time" means round in *their* TZ. In
    // half-hour-offset zones (India UTC+5:30) local :00 is UTC :30 — the
    // UTC check would jitter the wrong marks.
    if (new Date(t1).getMinutes() % cfg.oneShotMinuteMod !== 0)
        return t1;
    // floor + frac * (max - floor) → uniform over [floor, max). With floor=0
    // this reduces to the original frac * max. With floor>0, even a taskId
    // hashing to 0 gets `floor` ms of lead — nobody fires on the exact mark.
    var lead = cfg.oneShotFloorMs +
        jitterFrac(taskId) * (cfg.oneShotMaxMs - cfg.oneShotFloorMs);
    // t1 > fromMs is guaranteed by nextCronRunMs (strictly after), so the
    // max() only bites when the task was created inside its own lead window.
    return Math.max(t1 - lead, fromMs);
}
/**
 * A task is "missed" when its next scheduled run (computed from createdAt)
 * is in the past. Surfaced to the user at startup. Works for both one-shot
 * and recurring tasks — a recurring task whose window passed while Claude
 * was down is still "missed".
 */
function findMissedTasks(tasks, nowMs) {
    return tasks.filter(function (t) {
        var next = nextCronRunMs(t.cron, t.createdAt);
        return next !== null && next < nowMs;
    });
}
