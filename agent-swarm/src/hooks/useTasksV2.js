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
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _TasksV2Store_instances, _TasksV2Store_tasks, _TasksV2Store_hidden, _TasksV2Store_watcher, _TasksV2Store_watchedDir, _TasksV2Store_hideTimer, _TasksV2Store_debounceTimer, _TasksV2Store_pollTimer, _TasksV2Store_unsubscribeTasksUpdated, _TasksV2Store_changed, _TasksV2Store_subscriberCount, _TasksV2Store_started, _TasksV2Store_notify, _TasksV2Store_rewatch, _TasksV2Store_debouncedFetch, _TasksV2Store_fetch, _TasksV2Store_onHideTimerFired, _TasksV2Store_clearHideTimer, _TasksV2Store_stop;
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTasksV2 = useTasksV2;
exports.useTasksV2WithCollapseEffect = useTasksV2WithCollapseEffect;
var fs_1 = require("fs");
var react_1 = require("react");
var AppState_js_1 = require("../state/AppState.js");
var signal_js_1 = require("../utils/signal.js");
var tasks_js_1 = require("../utils/tasks.js");
var teammate_js_1 = require("../utils/teammate.js");
var HIDE_DELAY_MS = 5000;
var DEBOUNCE_MS = 50;
var FALLBACK_POLL_MS = 5000; // Fallback in case fs.watch misses events
/**
 * Singleton store for the TodoV2 task list. Owns the file watcher, timers,
 * and cached task list. Multiple hook instances (REPL, Spinner,
 * PromptInputFooterLeftSide) subscribe to one shared store instead of each
 * setting up their own fs.watch on the same directory. The Spinner mounts/
 * unmounts every turn — per-hook watchers caused constant watch/unwatch churn.
 *
 * Implements the useSyncExternalStore contract: subscribe/getSnapshot.
 */
var TasksV2Store = /** @class */ (function () {
    function TasksV2Store() {
        var _this = this;
        _TasksV2Store_instances.add(this);
        /** Stable array reference; replaced only on fetch. undefined until started. */
        _TasksV2Store_tasks.set(this, undefined
        /**
         * Set when the hide timer has elapsed (all tasks completed for >5s), or
         * when the task list is empty. Starts false so the first fetch runs the
         * "all completed → schedule 5s hide" path (matches original behavior:
         * resuming a session with completed tasks shows them briefly).
         */
        );
        /**
         * Set when the hide timer has elapsed (all tasks completed for >5s), or
         * when the task list is empty. Starts false so the first fetch runs the
         * "all completed → schedule 5s hide" path (matches original behavior:
         * resuming a session with completed tasks shows them briefly).
         */
        _TasksV2Store_hidden.set(this, false);
        _TasksV2Store_watcher.set(this, null);
        _TasksV2Store_watchedDir.set(this, null);
        _TasksV2Store_hideTimer.set(this, null);
        _TasksV2Store_debounceTimer.set(this, null);
        _TasksV2Store_pollTimer.set(this, null);
        _TasksV2Store_unsubscribeTasksUpdated.set(this, null);
        _TasksV2Store_changed.set(this, (0, signal_js_1.createSignal)());
        _TasksV2Store_subscriberCount.set(this, 0);
        _TasksV2Store_started.set(this, false
        /**
         * useSyncExternalStore snapshot. Returns the same Task[] reference between
         * updates (required for Object.is stability). Returns undefined when hidden.
         */
        );
        /**
         * useSyncExternalStore snapshot. Returns the same Task[] reference between
         * updates (required for Object.is stability). Returns undefined when hidden.
         */
        this.getSnapshot = function () {
            return __classPrivateFieldGet(_this, _TasksV2Store_hidden, "f") ? undefined : __classPrivateFieldGet(_this, _TasksV2Store_tasks, "f");
        };
        this.subscribe = function (fn) {
            var _a;
            // Lazy init on first subscriber. useSyncExternalStore calls this
            // post-commit, so I/O here is safe (no render-phase side effects).
            // REPL.tsx keeps a subscription alive for the whole session, so
            // Spinner mount/unmount churn never drives the count to zero.
            var unsubscribe = __classPrivateFieldGet(_this, _TasksV2Store_changed, "f").subscribe(fn);
            __classPrivateFieldSet(_this, _TasksV2Store_subscriberCount, (_a = __classPrivateFieldGet(_this, _TasksV2Store_subscriberCount, "f"), _a++, _a), "f");
            if (!__classPrivateFieldGet(_this, _TasksV2Store_started, "f")) {
                __classPrivateFieldSet(_this, _TasksV2Store_started, true, "f");
                __classPrivateFieldSet(_this, _TasksV2Store_unsubscribeTasksUpdated, (0, tasks_js_1.onTasksUpdated)(__classPrivateFieldGet(_this, _TasksV2Store_debouncedFetch, "f")), "f");
                // Fire-and-forget: subscribe is called post-commit (not in render),
                // and the store notifies subscribers when the fetch resolves.
                void __classPrivateFieldGet(_this, _TasksV2Store_fetch, "f").call(_this);
            }
            var unsubscribed = false;
            return function () {
                var _a;
                if (unsubscribed)
                    return;
                unsubscribed = true;
                unsubscribe();
                __classPrivateFieldSet(_this, _TasksV2Store_subscriberCount, (_a = __classPrivateFieldGet(_this, _TasksV2Store_subscriberCount, "f"), _a--, _a), "f");
                if (__classPrivateFieldGet(_this, _TasksV2Store_subscriberCount, "f") === 0)
                    __classPrivateFieldGet(_this, _TasksV2Store_instances, "m", _TasksV2Store_stop).call(_this);
            };
        };
        _TasksV2Store_debouncedFetch.set(this, function () {
            if (__classPrivateFieldGet(_this, _TasksV2Store_debounceTimer, "f"))
                clearTimeout(__classPrivateFieldGet(_this, _TasksV2Store_debounceTimer, "f"));
            __classPrivateFieldSet(_this, _TasksV2Store_debounceTimer, setTimeout(function () { return void __classPrivateFieldGet(_this, _TasksV2Store_fetch, "f").call(_this); }, DEBOUNCE_MS), "f");
            __classPrivateFieldGet(_this, _TasksV2Store_debounceTimer, "f").unref();
        });
        _TasksV2Store_fetch.set(this, function () { return __awaiter(_this, void 0, void 0, function () {
            var taskListId, current, hasIncomplete;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskListId = (0, tasks_js_1.getTaskListId)();
                        // Task list ID can change mid-session (TeamCreateTool sets
                        // leaderTeamName) — point the watcher at the current dir.
                        __classPrivateFieldGet(this, _TasksV2Store_instances, "m", _TasksV2Store_rewatch).call(this, (0, tasks_js_1.getTasksDir)(taskListId));
                        return [4 /*yield*/, (0, tasks_js_1.listTasks)(taskListId)];
                    case 1:
                        current = (_a.sent()).filter(function (t) { var _a; return !((_a = t.metadata) === null || _a === void 0 ? void 0 : _a._internal); });
                        __classPrivateFieldSet(this, _TasksV2Store_tasks, current, "f");
                        hasIncomplete = current.some(function (t) { return t.status !== 'completed'; });
                        if (hasIncomplete || current.length === 0) {
                            // Has unresolved tasks (open/in_progress) or empty — reset hide state
                            __classPrivateFieldSet(this, _TasksV2Store_hidden, current.length === 0, "f");
                            __classPrivateFieldGet(this, _TasksV2Store_instances, "m", _TasksV2Store_clearHideTimer).call(this);
                        }
                        else if (__classPrivateFieldGet(this, _TasksV2Store_hideTimer, "f") === null && !__classPrivateFieldGet(this, _TasksV2Store_hidden, "f")) {
                            // All tasks just became completed — schedule clear
                            __classPrivateFieldSet(this, _TasksV2Store_hideTimer, setTimeout(__classPrivateFieldGet(this, _TasksV2Store_instances, "m", _TasksV2Store_onHideTimerFired).bind(this, taskListId), HIDE_DELAY_MS), "f");
                            __classPrivateFieldGet(this, _TasksV2Store_hideTimer, "f").unref();
                        }
                        __classPrivateFieldGet(this, _TasksV2Store_instances, "m", _TasksV2Store_notify).call(this);
                        // Schedule fallback poll only when there are incomplete tasks that
                        // need monitoring. When all tasks are completed (or there are none),
                        // the fs.watch watcher and onTasksUpdated callback are sufficient to
                        // detect new activity — no need to keep polling and re-rendering.
                        if (__classPrivateFieldGet(this, _TasksV2Store_pollTimer, "f")) {
                            clearTimeout(__classPrivateFieldGet(this, _TasksV2Store_pollTimer, "f"));
                            __classPrivateFieldSet(this, _TasksV2Store_pollTimer, null, "f");
                        }
                        if (hasIncomplete) {
                            __classPrivateFieldSet(this, _TasksV2Store_pollTimer, setTimeout(__classPrivateFieldGet(this, _TasksV2Store_debouncedFetch, "f"), FALLBACK_POLL_MS), "f");
                            __classPrivateFieldGet(this, _TasksV2Store_pollTimer, "f").unref();
                        }
                        return [2 /*return*/];
                }
            });
        }); });
    }
    return TasksV2Store;
}());
_TasksV2Store_tasks = new WeakMap(), _TasksV2Store_hidden = new WeakMap(), _TasksV2Store_watcher = new WeakMap(), _TasksV2Store_watchedDir = new WeakMap(), _TasksV2Store_hideTimer = new WeakMap(), _TasksV2Store_debounceTimer = new WeakMap(), _TasksV2Store_pollTimer = new WeakMap(), _TasksV2Store_unsubscribeTasksUpdated = new WeakMap(), _TasksV2Store_changed = new WeakMap(), _TasksV2Store_subscriberCount = new WeakMap(), _TasksV2Store_started = new WeakMap(), _TasksV2Store_debouncedFetch = new WeakMap(), _TasksV2Store_fetch = new WeakMap(), _TasksV2Store_instances = new WeakSet(), _TasksV2Store_notify = function _TasksV2Store_notify() {
    __classPrivateFieldGet(this, _TasksV2Store_changed, "f").emit();
}, _TasksV2Store_rewatch = function _TasksV2Store_rewatch(dir) {
    var _a;
    // Retry even on same dir if the previous watch attempt failed (dir
    // didn't exist yet). Once the watcher is established, same-dir is a no-op.
    if (dir === __classPrivateFieldGet(this, _TasksV2Store_watchedDir, "f") && __classPrivateFieldGet(this, _TasksV2Store_watcher, "f") !== null)
        return;
    (_a = __classPrivateFieldGet(this, _TasksV2Store_watcher, "f")) === null || _a === void 0 ? void 0 : _a.close();
    __classPrivateFieldSet(this, _TasksV2Store_watcher, null, "f");
    __classPrivateFieldSet(this, _TasksV2Store_watchedDir, dir, "f");
    try {
        __classPrivateFieldSet(this, _TasksV2Store_watcher, (0, fs_1.watch)(dir, __classPrivateFieldGet(this, _TasksV2Store_debouncedFetch, "f")), "f");
        __classPrivateFieldGet(this, _TasksV2Store_watcher, "f").unref();
    }
    catch (_b) {
        // Directory may not exist yet (ensureTasksDir is called by writers).
        // Not critical — onTasksUpdated covers in-process updates and the
        // poll timer covers cross-process updates.
    }
}, _TasksV2Store_onHideTimerFired = function _TasksV2Store_onHideTimerFired(scheduledForTaskListId) {
    var _this = this;
    __classPrivateFieldSet(this, _TasksV2Store_hideTimer, null, "f");
    // Bail if the task list ID changed since scheduling (team created/deleted
    // during the 5s window) — don't reset the wrong list.
    var currentId = (0, tasks_js_1.getTaskListId)();
    if (currentId !== scheduledForTaskListId)
        return;
    // Verify all tasks are still completed before clearing
    void (0, tasks_js_1.listTasks)(currentId).then(function (tasksToCheck) { return __awaiter(_this, void 0, void 0, function () {
        var allStillCompleted;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    allStillCompleted = tasksToCheck.length > 0 &&
                        tasksToCheck.every(function (t) { return t.status === 'completed'; });
                    if (!allStillCompleted) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, tasks_js_1.resetTaskList)(currentId)];
                case 1:
                    _a.sent();
                    __classPrivateFieldSet(this, _TasksV2Store_tasks, [], "f");
                    __classPrivateFieldSet(this, _TasksV2Store_hidden, true, "f");
                    _a.label = 2;
                case 2:
                    __classPrivateFieldGet(this, _TasksV2Store_instances, "m", _TasksV2Store_notify).call(this);
                    return [2 /*return*/];
            }
        });
    }); });
}, _TasksV2Store_clearHideTimer = function _TasksV2Store_clearHideTimer() {
    if (__classPrivateFieldGet(this, _TasksV2Store_hideTimer, "f")) {
        clearTimeout(__classPrivateFieldGet(this, _TasksV2Store_hideTimer, "f"));
        __classPrivateFieldSet(this, _TasksV2Store_hideTimer, null, "f");
    }
}, _TasksV2Store_stop = function _TasksV2Store_stop() {
    var _a, _b;
    (_a = __classPrivateFieldGet(this, _TasksV2Store_watcher, "f")) === null || _a === void 0 ? void 0 : _a.close();
    __classPrivateFieldSet(this, _TasksV2Store_watcher, null, "f");
    __classPrivateFieldSet(this, _TasksV2Store_watchedDir, null, "f");
    (_b = __classPrivateFieldGet(this, _TasksV2Store_unsubscribeTasksUpdated, "f")) === null || _b === void 0 ? void 0 : _b.call(this);
    __classPrivateFieldSet(this, _TasksV2Store_unsubscribeTasksUpdated, null, "f");
    __classPrivateFieldGet(this, _TasksV2Store_instances, "m", _TasksV2Store_clearHideTimer).call(this);
    if (__classPrivateFieldGet(this, _TasksV2Store_debounceTimer, "f"))
        clearTimeout(__classPrivateFieldGet(this, _TasksV2Store_debounceTimer, "f"));
    if (__classPrivateFieldGet(this, _TasksV2Store_pollTimer, "f"))
        clearTimeout(__classPrivateFieldGet(this, _TasksV2Store_pollTimer, "f"));
    __classPrivateFieldSet(this, _TasksV2Store_debounceTimer, null, "f");
    __classPrivateFieldSet(this, _TasksV2Store_pollTimer, null, "f");
    __classPrivateFieldSet(this, _TasksV2Store_started, false, "f");
};
var _store = null;
function getStore() {
    return (_store !== null && _store !== void 0 ? _store : (_store = new TasksV2Store()));
}
// Stable no-ops for the disabled path so useSyncExternalStore doesn't
// churn its subscription on every render.
var NOOP = function () { };
var NOOP_SUBSCRIBE = function () { return NOOP; };
var NOOP_SNAPSHOT = function () { return undefined; };
/**
 * Hook to get the current task list for the persistent UI display.
 * Returns tasks when TodoV2 is enabled, otherwise returns undefined.
 * All hook instances share a single file watcher via TasksV2Store.
 * Hides the list after 5 seconds if there are no open tasks.
 */
function useTasksV2() {
    var teamContext = (0, AppState_js_1.useAppState)(function (s) { return s.teamContext; });
    var enabled = (0, tasks_js_1.isTodoV2Enabled)() && (!teamContext || (0, teammate_js_1.isTeamLead)(teamContext));
    var store = enabled ? getStore() : null;
    return (0, react_1.useSyncExternalStore)(store ? store.subscribe : NOOP_SUBSCRIBE, store ? store.getSnapshot : NOOP_SNAPSHOT);
}
/**
 * Same as useTasksV2, plus collapses the expanded task view when the list
 * becomes hidden. Call this from exactly one always-mounted component (REPL)
 * so the collapse effect runs once instead of N× per consumer.
 */
function useTasksV2WithCollapseEffect() {
    var tasks = useTasksV2();
    var setAppState = (0, AppState_js_1.useSetAppState)();
    var hidden = tasks === undefined;
    (0, react_1.useEffect)(function () {
        if (!hidden)
            return;
        setAppState(function (prev) {
            if (prev.expandedView !== 'tasks')
                return prev;
            return __assign(__assign({}, prev), { expandedView: 'none' });
        });
    }, [hidden, setAppState]);
    return tasks;
}
