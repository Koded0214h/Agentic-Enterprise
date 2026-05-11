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
exports.DEFAULT_TASKS_MODE_TASK_LIST_ID = exports.TaskSchema = exports.TaskStatusSchema = exports.TASK_STATUSES = exports.onTasksUpdated = void 0;
exports.setLeaderTeamName = setLeaderTeamName;
exports.clearLeaderTeamName = clearLeaderTeamName;
exports.notifyTasksUpdated = notifyTasksUpdated;
exports.isTodoV2Enabled = isTodoV2Enabled;
exports.resetTaskList = resetTaskList;
exports.getTaskListId = getTaskListId;
exports.sanitizePathComponent = sanitizePathComponent;
exports.getTasksDir = getTasksDir;
exports.getTaskPath = getTaskPath;
exports.ensureTasksDir = ensureTasksDir;
exports.createTask = createTask;
exports.getTask = getTask;
exports.updateTask = updateTask;
exports.deleteTask = deleteTask;
exports.listTasks = listTasks;
exports.blockTask = blockTask;
exports.claimTask = claimTask;
exports.getAgentStatuses = getAgentStatuses;
exports.unassignTeammateTasks = unassignTeammateTasks;
var promises_1 = require("fs/promises");
var path_1 = require("path");
var v4_1 = require("zod/v4");
var state_js_1 = require("../bootstrap/state.js");
var array_js_1 = require("./array.js");
var debug_js_1 = require("./debug.js");
var envUtils_js_1 = require("./envUtils.js");
var errors_js_1 = require("./errors.js");
var lazySchema_js_1 = require("./lazySchema.js");
var lockfile = require("./lockfile.js");
var log_js_1 = require("./log.js");
var signal_js_1 = require("./signal.js");
var slowOperations_js_1 = require("./slowOperations.js");
var teammate_js_1 = require("./teammate.js");
var teammateContext_js_1 = require("./teammateContext.js");
// Listeners for task list updates (used for immediate UI refresh in same process)
var tasksUpdated = (0, signal_js_1.createSignal)();
/**
 * Team name set by the leader when creating a team.
 * Used by getTaskListId() so the leader's tasks are stored under the team name
 * (matching where tmux/iTerm2 teammates look), not under the session ID.
 */
var leaderTeamName;
/**
 * Sets the leader's team name for task list resolution.
 * Called by TeamCreateTool when a team is created.
 */
function setLeaderTeamName(teamName) {
    if (leaderTeamName === teamName)
        return;
    leaderTeamName = teamName;
    // Changing the task list ID is a "tasks updated" event for subscribers —
    // they're now looking at a different directory.
    notifyTasksUpdated();
}
/**
 * Clears the leader's team name.
 * Called when a team is deleted.
 */
function clearLeaderTeamName() {
    if (leaderTeamName === undefined)
        return;
    leaderTeamName = undefined;
    notifyTasksUpdated();
}
/**
 * Register a listener to be called when tasks are updated in this process.
 * Returns an unsubscribe function.
 */
exports.onTasksUpdated = tasksUpdated.subscribe;
/**
 * Notify listeners that tasks have been updated.
 * Called internally after createTask, updateTask, etc.
 * Wraps emit in try/catch so listener failures never propagate to callers
 * (task mutations must succeed from the caller's perspective).
 */
function notifyTasksUpdated() {
    try {
        tasksUpdated.emit();
    }
    catch (_a) {
        // Ignore listener errors — task mutations must not fail due to notification issues
    }
}
exports.TASK_STATUSES = ['pending', 'in_progress', 'completed'];
exports.TaskStatusSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.enum(['pending', 'in_progress', 'completed']);
});
exports.TaskSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        id: v4_1.z.string(),
        subject: v4_1.z.string(),
        description: v4_1.z.string(),
        activeForm: v4_1.z.string().optional(), // present continuous form for spinner (e.g., "Running tests")
        owner: v4_1.z.string().optional(), // agent ID
        status: (0, exports.TaskStatusSchema)(),
        blocks: v4_1.z.array(v4_1.z.string()), // task IDs this task blocks
        blockedBy: v4_1.z.array(v4_1.z.string()), // task IDs that block this task
        metadata: v4_1.z.record(v4_1.z.string(), v4_1.z.unknown()).optional(), // arbitrary metadata
    });
});
// High water mark file name - stores the maximum task ID ever assigned
var HIGH_WATER_MARK_FILE = '.highwatermark';
// Lock options: retry with backoff so concurrent callers (multiple Claudes
// in a swarm) wait for the lock instead of failing immediately. The sync
// lockSync API blocked the event loop; the async API needs explicit retries
// to achieve the same serialization semantics.
//
// Budget sized for ~10+ concurrent swarm agents: each critical section does
// readdir + N×readFile + writeFile (~50-100ms on slow disks), so the last
// caller in a 10-way race needs ~900ms. retries=30 gives ~2.6s total wait.
var LOCK_OPTIONS = {
    retries: {
        retries: 30,
        minTimeout: 5,
        maxTimeout: 100,
    },
};
function getHighWaterMarkPath(taskListId) {
    return (0, path_1.join)(getTasksDir(taskListId), HIGH_WATER_MARK_FILE);
}
function readHighWaterMark(taskListId) {
    return __awaiter(this, void 0, void 0, function () {
        var path, content, value, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    path = getHighWaterMarkPath(taskListId);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readFile)(path, 'utf-8')];
                case 2:
                    content = (_b.sent()).trim();
                    value = parseInt(content, 10);
                    return [2 /*return*/, isNaN(value) ? 0 : value];
                case 3:
                    _a = _b.sent();
                    return [2 /*return*/, 0];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function writeHighWaterMark(taskListId, value) {
    return __awaiter(this, void 0, void 0, function () {
        var path;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    path = getHighWaterMarkPath(taskListId);
                    return [4 /*yield*/, (0, promises_1.writeFile)(path, String(value))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function isTodoV2Enabled() {
    // Force-enable tasks in non-interactive mode (e.g. SDK users who want Task tools over TodoWrite)
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_ENABLE_TASKS)) {
        return true;
    }
    return !(0, state_js_1.getIsNonInteractiveSession)();
}
/**
 * Resets the task list for a new swarm - clears any existing tasks.
 * Writes a high water mark file to prevent ID reuse after reset.
 * Should be called when a new swarm is created to ensure task numbering starts at 1.
 * Uses file locking to prevent race conditions when multiple Claudes run in parallel.
 */
function resetTaskList(taskListId) {
    return __awaiter(this, void 0, void 0, function () {
        var dir, lockPath, release, currentHighest, existingMark, files, _a, _i, files_1, file, filePath, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    dir = getTasksDir(taskListId);
                    return [4 /*yield*/, ensureTaskListLockFile(taskListId)];
                case 1:
                    lockPath = _c.sent();
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, , 18, 21]);
                    return [4 /*yield*/, lockfile.lock(lockPath, LOCK_OPTIONS)
                        // Find the current highest ID and save it to the high water mark file
                    ];
                case 3:
                    // Acquire exclusive lock on the task list
                    release = _c.sent();
                    return [4 /*yield*/, findHighestTaskIdFromFiles(taskListId)];
                case 4:
                    currentHighest = _c.sent();
                    if (!(currentHighest > 0)) return [3 /*break*/, 7];
                    return [4 /*yield*/, readHighWaterMark(taskListId)];
                case 5:
                    existingMark = _c.sent();
                    if (!(currentHighest > existingMark)) return [3 /*break*/, 7];
                    return [4 /*yield*/, writeHighWaterMark(taskListId, currentHighest)];
                case 6:
                    _c.sent();
                    _c.label = 7;
                case 7:
                    files = void 0;
                    _c.label = 8;
                case 8:
                    _c.trys.push([8, 10, , 11]);
                    return [4 /*yield*/, (0, promises_1.readdir)(dir)];
                case 9:
                    files = _c.sent();
                    return [3 /*break*/, 11];
                case 10:
                    _a = _c.sent();
                    files = [];
                    return [3 /*break*/, 11];
                case 11:
                    _i = 0, files_1 = files;
                    _c.label = 12;
                case 12:
                    if (!(_i < files_1.length)) return [3 /*break*/, 17];
                    file = files_1[_i];
                    if (!(file.endsWith('.json') && !file.startsWith('.'))) return [3 /*break*/, 16];
                    filePath = (0, path_1.join)(dir, file);
                    _c.label = 13;
                case 13:
                    _c.trys.push([13, 15, , 16]);
                    return [4 /*yield*/, (0, promises_1.unlink)(filePath)];
                case 14:
                    _c.sent();
                    return [3 /*break*/, 16];
                case 15:
                    _b = _c.sent();
                    return [3 /*break*/, 16];
                case 16:
                    _i++;
                    return [3 /*break*/, 12];
                case 17:
                    notifyTasksUpdated();
                    return [3 /*break*/, 21];
                case 18:
                    if (!release) return [3 /*break*/, 20];
                    return [4 /*yield*/, release()];
                case 19:
                    _c.sent();
                    _c.label = 20;
                case 20: return [7 /*endfinally*/];
                case 21: return [2 /*return*/];
            }
        });
    });
}
/**
 * Gets the task list ID based on the current context.
 * Priority:
 * 1. CLAUDE_CODE_TASK_LIST_ID - explicit task list ID
 * 2. In-process teammate: leader's team name (so teammates share the leader's task list)
 * 3. CLAUDE_CODE_TEAM_NAME - set when running as a process-based teammate
 * 4. Leader team name - set when the leader creates a team via TeamCreate
 * 5. Session ID - fallback for standalone sessions
 */
function getTaskListId() {
    if (process.env.CLAUDE_CODE_TASK_LIST_ID) {
        return process.env.CLAUDE_CODE_TASK_LIST_ID;
    }
    // In-process teammates use the leader's team name so they share the same
    // task list that tmux/iTerm2 teammates also resolve to.
    var teammateCtx = (0, teammateContext_js_1.getTeammateContext)();
    if (teammateCtx) {
        return teammateCtx.teamName;
    }
    return (0, teammate_js_1.getTeamName)() || leaderTeamName || (0, state_js_1.getSessionId)();
}
/**
 * Sanitizes a string for safe use in file paths.
 * Removes path traversal characters and other potentially dangerous characters.
 * Only allows alphanumeric characters, hyphens, and underscores.
 */
function sanitizePathComponent(input) {
    return input.replace(/[^a-zA-Z0-9_-]/g, '-');
}
function getTasksDir(taskListId) {
    return (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), 'tasks', sanitizePathComponent(taskListId));
}
function getTaskPath(taskListId, taskId) {
    return (0, path_1.join)(getTasksDir(taskListId), "".concat(sanitizePathComponent(taskId), ".json"));
}
function ensureTasksDir(taskListId) {
    return __awaiter(this, void 0, void 0, function () {
        var dir, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    dir = getTasksDir(taskListId);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.mkdir)(dir, { recursive: true })];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Finds the highest task ID from existing task files (not including high water mark).
 */
function findHighestTaskIdFromFiles(taskListId) {
    return __awaiter(this, void 0, void 0, function () {
        var dir, files, _a, highest, _i, files_2, file, taskId;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    dir = getTasksDir(taskListId);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readdir)(dir)];
                case 2:
                    files = _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [2 /*return*/, 0];
                case 4:
                    highest = 0;
                    for (_i = 0, files_2 = files; _i < files_2.length; _i++) {
                        file = files_2[_i];
                        if (!file.endsWith('.json')) {
                            continue;
                        }
                        taskId = parseInt(file.replace('.json', ''), 10);
                        if (!isNaN(taskId) && taskId > highest) {
                            highest = taskId;
                        }
                    }
                    return [2 /*return*/, highest];
            }
        });
    });
}
/**
 * Finds the highest task ID ever assigned, considering both existing files
 * and the high water mark (for deleted/reset tasks).
 */
function findHighestTaskId(taskListId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, fromFiles, fromMark;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.all([
                        findHighestTaskIdFromFiles(taskListId),
                        readHighWaterMark(taskListId),
                    ])];
                case 1:
                    _a = _b.sent(), fromFiles = _a[0], fromMark = _a[1];
                    return [2 /*return*/, Math.max(fromFiles, fromMark)];
            }
        });
    });
}
/**
 * Creates a new task with a unique ID.
 * Uses file locking to prevent race conditions when multiple processes
 * create tasks concurrently.
 */
function createTask(taskListId, taskData) {
    return __awaiter(this, void 0, void 0, function () {
        var lockPath, release, highestId, id, task, path;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ensureTaskListLockFile(taskListId)];
                case 1:
                    lockPath = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, , 6, 9]);
                    return [4 /*yield*/, lockfile.lock(lockPath, LOCK_OPTIONS)
                        // Read highest ID from disk while holding the lock
                    ];
                case 3:
                    // Acquire exclusive lock on the task list
                    release = _a.sent();
                    return [4 /*yield*/, findHighestTaskId(taskListId)];
                case 4:
                    highestId = _a.sent();
                    id = String(highestId + 1);
                    task = __assign({ id: id }, taskData);
                    path = getTaskPath(taskListId, id);
                    return [4 /*yield*/, (0, promises_1.writeFile)(path, (0, slowOperations_js_1.jsonStringify)(task, null, 2))];
                case 5:
                    _a.sent();
                    notifyTasksUpdated();
                    return [2 /*return*/, id];
                case 6:
                    if (!release) return [3 /*break*/, 8];
                    return [4 /*yield*/, release()];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8: return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    });
}
function getTask(taskListId, taskId) {
    return __awaiter(this, void 0, void 0, function () {
        var path, content, data, parsed, e_1, code;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    path = getTaskPath(taskListId, taskId);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readFile)(path, 'utf-8')];
                case 2:
                    content = _a.sent();
                    data = (0, slowOperations_js_1.jsonParse)(content);
                    // TEMPORARY: Migrate old status names for existing sessions (ant-only)
                    if (process.env.USER_TYPE === 'ant') {
                        if (data.status === 'open')
                            data.status = 'pending';
                        else if (data.status === 'resolved')
                            data.status = 'completed';
                        // Migrate development task statuses to in_progress
                        else if (data.status &&
                            ['planning', 'implementing', 'reviewing', 'verifying'].includes(data.status)) {
                            data.status = 'in_progress';
                        }
                    }
                    parsed = (0, exports.TaskSchema)().safeParse(data);
                    if (!parsed.success) {
                        (0, debug_js_1.logForDebugging)("[Tasks] Task ".concat(taskId, " failed schema validation: ").concat(parsed.error.message));
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, parsed.data];
                case 3:
                    e_1 = _a.sent();
                    code = (0, errors_js_1.getErrnoCode)(e_1);
                    if (code === 'ENOENT') {
                        return [2 /*return*/, null];
                    }
                    (0, debug_js_1.logForDebugging)("[Tasks] Failed to read task ".concat(taskId, ": ").concat((0, errors_js_1.errorMessage)(e_1)));
                    (0, log_js_1.logError)(e_1);
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Internal: no lock. Callers already holding a lock on taskPath must use this
// to avoid deadlock (claimTask, deleteTask cascade, etc.).
function updateTaskUnsafe(taskListId, taskId, updates) {
    return __awaiter(this, void 0, void 0, function () {
        var existing, updated, path;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getTask(taskListId, taskId)];
                case 1:
                    existing = _a.sent();
                    if (!existing) {
                        return [2 /*return*/, null];
                    }
                    updated = __assign(__assign(__assign({}, existing), updates), { id: taskId });
                    path = getTaskPath(taskListId, taskId);
                    return [4 /*yield*/, (0, promises_1.writeFile)(path, (0, slowOperations_js_1.jsonStringify)(updated, null, 2))];
                case 2:
                    _a.sent();
                    notifyTasksUpdated();
                    return [2 /*return*/, updated];
            }
        });
    });
}
function updateTask(taskListId, taskId, updates) {
    return __awaiter(this, void 0, void 0, function () {
        var path, taskBeforeLock, release;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    path = getTaskPath(taskListId, taskId);
                    return [4 /*yield*/, getTask(taskListId, taskId)];
                case 1:
                    taskBeforeLock = _a.sent();
                    if (!taskBeforeLock) {
                        return [2 /*return*/, null];
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, , 5, 7]);
                    return [4 /*yield*/, lockfile.lock(path, LOCK_OPTIONS)];
                case 3:
                    release = _a.sent();
                    return [4 /*yield*/, updateTaskUnsafe(taskListId, taskId, updates)];
                case 4: return [2 /*return*/, _a.sent()];
                case 5: return [4 /*yield*/, (release === null || release === void 0 ? void 0 : release())];
                case 6:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function deleteTask(taskListId, taskId) {
    return __awaiter(this, void 0, void 0, function () {
        var path, numericId, currentMark, e_2, code, allTasks, _i, allTasks_1, task, newBlocks, newBlockedBy, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    path = getTaskPath(taskListId, taskId);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 13, , 14]);
                    numericId = parseInt(taskId, 10);
                    if (!!isNaN(numericId)) return [3 /*break*/, 4];
                    return [4 /*yield*/, readHighWaterMark(taskListId)];
                case 2:
                    currentMark = _b.sent();
                    if (!(numericId > currentMark)) return [3 /*break*/, 4];
                    return [4 /*yield*/, writeHighWaterMark(taskListId, numericId)];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4:
                    _b.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, (0, promises_1.unlink)(path)];
                case 5:
                    _b.sent();
                    return [3 /*break*/, 7];
                case 6:
                    e_2 = _b.sent();
                    code = (0, errors_js_1.getErrnoCode)(e_2);
                    if (code === 'ENOENT') {
                        return [2 /*return*/, false];
                    }
                    throw e_2;
                case 7: return [4 /*yield*/, listTasks(taskListId)];
                case 8:
                    allTasks = _b.sent();
                    _i = 0, allTasks_1 = allTasks;
                    _b.label = 9;
                case 9:
                    if (!(_i < allTasks_1.length)) return [3 /*break*/, 12];
                    task = allTasks_1[_i];
                    newBlocks = task.blocks.filter(function (id) { return id !== taskId; });
                    newBlockedBy = task.blockedBy.filter(function (id) { return id !== taskId; });
                    if (!(newBlocks.length !== task.blocks.length ||
                        newBlockedBy.length !== task.blockedBy.length)) return [3 /*break*/, 11];
                    return [4 /*yield*/, updateTask(taskListId, task.id, {
                            blocks: newBlocks,
                            blockedBy: newBlockedBy,
                        })];
                case 10:
                    _b.sent();
                    _b.label = 11;
                case 11:
                    _i++;
                    return [3 /*break*/, 9];
                case 12:
                    notifyTasksUpdated();
                    return [2 /*return*/, true];
                case 13:
                    _a = _b.sent();
                    return [2 /*return*/, false];
                case 14: return [2 /*return*/];
            }
        });
    });
}
function listTasks(taskListId) {
    return __awaiter(this, void 0, void 0, function () {
        var dir, files, _a, taskIds, results;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    dir = getTasksDir(taskListId);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readdir)(dir)];
                case 2:
                    files = _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [2 /*return*/, []];
                case 4:
                    taskIds = files
                        .filter(function (f) { return f.endsWith('.json'); })
                        .map(function (f) { return f.replace('.json', ''); });
                    return [4 /*yield*/, Promise.all(taskIds.map(function (id) { return getTask(taskListId, id); }))];
                case 5:
                    results = _b.sent();
                    return [2 /*return*/, results.filter(function (t) { return t !== null; })];
            }
        });
    });
}
function blockTask(taskListId, fromTaskId, toTaskId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, fromTask, toTask;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.all([
                        getTask(taskListId, fromTaskId),
                        getTask(taskListId, toTaskId),
                    ])];
                case 1:
                    _a = _b.sent(), fromTask = _a[0], toTask = _a[1];
                    if (!fromTask || !toTask) {
                        return [2 /*return*/, false];
                    }
                    if (!!fromTask.blocks.includes(toTaskId)) return [3 /*break*/, 3];
                    return [4 /*yield*/, updateTask(taskListId, fromTaskId, {
                            blocks: __spreadArray(__spreadArray([], fromTask.blocks, true), [toTaskId], false),
                        })];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3:
                    if (!!toTask.blockedBy.includes(fromTaskId)) return [3 /*break*/, 5];
                    return [4 /*yield*/, updateTask(taskListId, toTaskId, {
                            blockedBy: __spreadArray(__spreadArray([], toTask.blockedBy, true), [fromTaskId], false),
                        })];
                case 4:
                    _b.sent();
                    _b.label = 5;
                case 5: return [2 /*return*/, true];
            }
        });
    });
}
/**
 * Gets the lock file path for a task list (used for list-level locking)
 */
function getTaskListLockPath(taskListId) {
    return (0, path_1.join)(getTasksDir(taskListId), '.lock');
}
/**
 * Ensures the lock file exists for a task list
 */
function ensureTaskListLockFile(taskListId) {
    return __awaiter(this, void 0, void 0, function () {
        var lockPath, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, ensureTasksDir(taskListId)];
                case 1:
                    _b.sent();
                    lockPath = getTaskListLockPath(taskListId);
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, promises_1.writeFile)(lockPath, '', { flag: 'wx' })];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/, lockPath];
            }
        });
    });
}
/**
 * Attempts to claim a task for an agent with file locking to prevent race conditions.
 * Returns success if the task was claimed, or a reason if it wasn't.
 *
 * When checkAgentBusy is true, uses a task-list-level lock to atomically check
 * if the agent owns any other open tasks before claiming.
 */
function claimTask(taskListId_1, taskId_1, claimantAgentId_1) {
    return __awaiter(this, arguments, void 0, function (taskListId, taskId, claimantAgentId, options) {
        var taskPath, taskBeforeLock, release, task, allTasks, unresolvedTaskIds_1, blockedByTasks, updated, error_1;
        if (options === void 0) { options = {}; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    taskPath = getTaskPath(taskListId, taskId);
                    return [4 /*yield*/, getTask(taskListId, taskId)];
                case 1:
                    taskBeforeLock = _a.sent();
                    if (!taskBeforeLock) {
                        return [2 /*return*/, { success: false, reason: 'task_not_found' }];
                    }
                    // If we need to check agent busy status, use task-list-level lock
                    // to prevent TOCTOU race conditions
                    if (options.checkAgentBusy) {
                        return [2 /*return*/, claimTaskWithBusyCheck(taskListId, taskId, claimantAgentId)];
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 7, 8, 11]);
                    return [4 /*yield*/, lockfile.lock(taskPath, LOCK_OPTIONS)
                        // Read current task state
                    ];
                case 3:
                    // Acquire exclusive lock on the task file
                    release = _a.sent();
                    return [4 /*yield*/, getTask(taskListId, taskId)];
                case 4:
                    task = _a.sent();
                    if (!task) {
                        return [2 /*return*/, { success: false, reason: 'task_not_found' }];
                    }
                    // Check if already claimed by another agent
                    if (task.owner && task.owner !== claimantAgentId) {
                        return [2 /*return*/, { success: false, reason: 'already_claimed', task: task }];
                    }
                    // Check if already resolved
                    if (task.status === 'completed') {
                        return [2 /*return*/, { success: false, reason: 'already_resolved', task: task }];
                    }
                    return [4 /*yield*/, listTasks(taskListId)];
                case 5:
                    allTasks = _a.sent();
                    unresolvedTaskIds_1 = new Set(allTasks.filter(function (t) { return t.status !== 'completed'; }).map(function (t) { return t.id; }));
                    blockedByTasks = task.blockedBy.filter(function (id) {
                        return unresolvedTaskIds_1.has(id);
                    });
                    if (blockedByTasks.length > 0) {
                        return [2 /*return*/, { success: false, reason: 'blocked', task: task, blockedByTasks: blockedByTasks }];
                    }
                    return [4 /*yield*/, updateTaskUnsafe(taskListId, taskId, {
                            owner: claimantAgentId,
                        })];
                case 6:
                    updated = _a.sent();
                    return [2 /*return*/, { success: true, task: updated }];
                case 7:
                    error_1 = _a.sent();
                    (0, debug_js_1.logForDebugging)("[Tasks] Failed to claim task ".concat(taskId, ": ").concat((0, errors_js_1.errorMessage)(error_1)));
                    (0, log_js_1.logError)(error_1);
                    return [2 /*return*/, { success: false, reason: 'task_not_found' }];
                case 8:
                    if (!release) return [3 /*break*/, 10];
                    return [4 /*yield*/, release()];
                case 9:
                    _a.sent();
                    _a.label = 10;
                case 10: return [7 /*endfinally*/];
                case 11: return [2 /*return*/];
            }
        });
    });
}
/**
 * Claims a task with an atomic check for agent busy status.
 * Uses a task-list-level lock to ensure the busy check and claim are atomic.
 */
function claimTaskWithBusyCheck(taskListId, taskId, claimantAgentId) {
    return __awaiter(this, void 0, void 0, function () {
        var lockPath, release, allTasks, task, unresolvedTaskIds_2, blockedByTasks, agentOpenTasks, updated, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ensureTaskListLockFile(taskListId)];
                case 1:
                    lockPath = _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 6, 7, 10]);
                    return [4 /*yield*/, lockfile.lock(lockPath, LOCK_OPTIONS)
                        // Read all tasks to check agent status and task state atomically
                    ];
                case 3:
                    // Acquire exclusive lock on the task list
                    release = _a.sent();
                    return [4 /*yield*/, listTasks(taskListId)
                        // Find the task we want to claim
                    ];
                case 4:
                    allTasks = _a.sent();
                    task = allTasks.find(function (t) { return t.id === taskId; });
                    if (!task) {
                        return [2 /*return*/, { success: false, reason: 'task_not_found' }];
                    }
                    // Check if already claimed by another agent
                    if (task.owner && task.owner !== claimantAgentId) {
                        return [2 /*return*/, { success: false, reason: 'already_claimed', task: task }];
                    }
                    // Check if already resolved
                    if (task.status === 'completed') {
                        return [2 /*return*/, { success: false, reason: 'already_resolved', task: task }];
                    }
                    unresolvedTaskIds_2 = new Set(allTasks.filter(function (t) { return t.status !== 'completed'; }).map(function (t) { return t.id; }));
                    blockedByTasks = task.blockedBy.filter(function (id) {
                        return unresolvedTaskIds_2.has(id);
                    });
                    if (blockedByTasks.length > 0) {
                        return [2 /*return*/, { success: false, reason: 'blocked', task: task, blockedByTasks: blockedByTasks }];
                    }
                    agentOpenTasks = allTasks.filter(function (t) {
                        return t.status !== 'completed' &&
                            t.owner === claimantAgentId &&
                            t.id !== taskId;
                    });
                    if (agentOpenTasks.length > 0) {
                        return [2 /*return*/, {
                                success: false,
                                reason: 'agent_busy',
                                task: task,
                                busyWithTasks: agentOpenTasks.map(function (t) { return t.id; }),
                            }];
                    }
                    return [4 /*yield*/, updateTask(taskListId, taskId, {
                            owner: claimantAgentId,
                        })];
                case 5:
                    updated = _a.sent();
                    return [2 /*return*/, { success: true, task: updated }];
                case 6:
                    error_2 = _a.sent();
                    (0, debug_js_1.logForDebugging)("[Tasks] Failed to claim task ".concat(taskId, " with busy check: ").concat((0, errors_js_1.errorMessage)(error_2)));
                    (0, log_js_1.logError)(error_2);
                    return [2 /*return*/, { success: false, reason: 'task_not_found' }];
                case 7:
                    if (!release) return [3 /*break*/, 9];
                    return [4 /*yield*/, release()];
                case 8:
                    _a.sent();
                    _a.label = 9;
                case 9: return [7 /*endfinally*/];
                case 10: return [2 /*return*/];
            }
        });
    });
}
/**
 * Sanitizes a name for use in file paths
 */
function sanitizeName(name) {
    return name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
}
/**
 * Reads team members from the team file
 */
function readTeamMembers(teamName) {
    return __awaiter(this, void 0, void 0, function () {
        var teamsDir, teamFilePath, content, teamFile, e_3, code;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    teamsDir = (0, envUtils_js_1.getTeamsDir)();
                    teamFilePath = (0, path_1.join)(teamsDir, sanitizeName(teamName), 'config.json');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readFile)(teamFilePath, 'utf-8')];
                case 2:
                    content = _a.sent();
                    teamFile = (0, slowOperations_js_1.jsonParse)(content);
                    return [2 /*return*/, {
                            leadAgentId: teamFile.leadAgentId,
                            members: teamFile.members.map(function (m) { return ({
                                agentId: m.agentId,
                                name: m.name,
                                agentType: m.agentType,
                            }); }),
                        }];
                case 3:
                    e_3 = _a.sent();
                    code = (0, errors_js_1.getErrnoCode)(e_3);
                    if (code === 'ENOENT') {
                        return [2 /*return*/, null];
                    }
                    (0, debug_js_1.logForDebugging)("[Tasks] Failed to read team file for ".concat(teamName, ": ").concat((0, errors_js_1.errorMessage)(e_3)));
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Gets the status of all agents in a team based on task ownership.
 * An agent is considered "idle" if they don't own any open tasks.
 * An agent is considered "busy" if they own at least one open task.
 *
 * @param teamName - The name of the team (also used as taskListId)
 * @returns Array of agent statuses, or null if team not found
 */
function getAgentStatuses(teamName) {
    return __awaiter(this, void 0, void 0, function () {
        var teamData, taskListId, allTasks, unresolvedTasksByOwner, _i, allTasks_2, task, existing;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, readTeamMembers(teamName)];
                case 1:
                    teamData = _a.sent();
                    if (!teamData) {
                        return [2 /*return*/, null];
                    }
                    taskListId = sanitizeName(teamName);
                    return [4 /*yield*/, listTasks(taskListId)
                        // Get unresolved tasks grouped by owner (open or in_progress)
                    ];
                case 2:
                    allTasks = _a.sent();
                    unresolvedTasksByOwner = new Map();
                    for (_i = 0, allTasks_2 = allTasks; _i < allTasks_2.length; _i++) {
                        task = allTasks_2[_i];
                        if (task.status !== 'completed' && task.owner) {
                            existing = unresolvedTasksByOwner.get(task.owner) || [];
                            existing.push(task.id);
                            unresolvedTasksByOwner.set(task.owner, existing);
                        }
                    }
                    // Build status for each agent (leader is already in members)
                    return [2 /*return*/, teamData.members.map(function (member) {
                            // Check both name (new) and agentId (legacy) for backwards compatibility
                            var tasksByName = unresolvedTasksByOwner.get(member.name) || [];
                            var tasksById = unresolvedTasksByOwner.get(member.agentId) || [];
                            var currentTasks = (0, array_js_1.uniq)(__spreadArray(__spreadArray([], tasksByName, true), tasksById, true));
                            return {
                                agentId: member.agentId,
                                name: member.name,
                                agentType: member.agentType,
                                status: currentTasks.length === 0 ? 'idle' : 'busy',
                                currentTasks: currentTasks,
                            };
                        })];
            }
        });
    });
}
/**
 * Unassigns all open tasks from a teammate and builds a notification message.
 * Used when a teammate is killed or gracefully shuts down.
 *
 * @param teamName - The team/task list name
 * @param teammateId - The teammate's agent ID
 * @param teammateName - The teammate's display name
 * @param reason - How the teammate exited ('terminated' | 'shutdown')
 * @returns The unassigned tasks and a formatted notification message
 */
function unassignTeammateTasks(teamName, teammateId, teammateName, reason) {
    return __awaiter(this, void 0, void 0, function () {
        var tasks, unresolvedAssignedTasks, _i, unresolvedAssignedTasks_1, task, actionVerb, notificationMessage, taskList;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, listTasks(teamName)];
                case 1:
                    tasks = _a.sent();
                    unresolvedAssignedTasks = tasks.filter(function (t) {
                        return t.status !== 'completed' &&
                            (t.owner === teammateId || t.owner === teammateName);
                    });
                    _i = 0, unresolvedAssignedTasks_1 = unresolvedAssignedTasks;
                    _a.label = 2;
                case 2:
                    if (!(_i < unresolvedAssignedTasks_1.length)) return [3 /*break*/, 5];
                    task = unresolvedAssignedTasks_1[_i];
                    return [4 /*yield*/, updateTask(teamName, task.id, { owner: undefined, status: 'pending' })];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    if (unresolvedAssignedTasks.length > 0) {
                        (0, debug_js_1.logForDebugging)("[Tasks] Unassigned ".concat(unresolvedAssignedTasks.length, " task(s) from ").concat(teammateName));
                    }
                    actionVerb = reason === 'terminated' ? 'was terminated' : 'has shut down';
                    notificationMessage = "".concat(teammateName, " ").concat(actionVerb, ".");
                    if (unresolvedAssignedTasks.length > 0) {
                        taskList = unresolvedAssignedTasks
                            .map(function (t) { return "#".concat(t.id, " \"").concat(t.subject, "\""); })
                            .join(', ');
                        notificationMessage += " ".concat(unresolvedAssignedTasks.length, " task(s) were unassigned: ").concat(taskList, ". Use TaskList to check availability and TaskUpdate with owner to reassign them to idle teammates.");
                    }
                    return [2 /*return*/, {
                            unassignedTasks: unresolvedAssignedTasks.map(function (t) { return ({
                                id: t.id,
                                subject: t.subject,
                            }); }),
                            notificationMessage: notificationMessage,
                        }];
            }
        });
    });
}
exports.DEFAULT_TASKS_MODE_TASK_LIST_ID = 'tasklist';
