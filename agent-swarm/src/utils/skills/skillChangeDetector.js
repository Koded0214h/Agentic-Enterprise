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
exports.skillChangeDetector = exports.subscribe = void 0;
exports.initialize = initialize;
exports.dispose = dispose;
exports.resetForTesting = resetForTesting;
var chokidar_1 = require("chokidar");
var platformPath = require("path");
var state_js_1 = require("../../bootstrap/state.js");
var commands_js_1 = require("../../commands.js");
var index_js_1 = require("../../services/analytics/index.js");
var loadSkillsDir_js_1 = require("../../skills/loadSkillsDir.js");
var attachments_js_1 = require("../attachments.js");
var cleanupRegistry_js_1 = require("../cleanupRegistry.js");
var debug_js_1 = require("../debug.js");
var fsOperations_js_1 = require("../fsOperations.js");
var hooks_js_1 = require("../hooks.js");
var signal_js_1 = require("../signal.js");
/**
 * Time in milliseconds to wait for file writes to stabilize before processing.
 */
var FILE_STABILITY_THRESHOLD_MS = 1000;
/**
 * Polling interval in milliseconds for checking file stability.
 */
var FILE_STABILITY_POLL_INTERVAL_MS = 500;
/**
 * Time in milliseconds to debounce rapid skill change events into a single
 * reload. Prevents cascading reloads when many skill files change at once
 * (e.g. during auto-update or when another session modifies skill directories).
 * Without this, each file change triggers a full clearSkillCaches() +
 * clearCommandsCache() + listener notification cycle, which can deadlock the
 * event loop when dozens of events fire in rapid succession.
 */
var RELOAD_DEBOUNCE_MS = 300;
/**
 * Polling interval for chokidar when usePolling is enabled.
 * Skill files change rarely (manual edits, git operations), so a 2s interval
 * trades negligible latency for far fewer stat() calls than the default 100ms.
 */
var POLLING_INTERVAL_MS = 2000;
/**
 * Bun's native fs.watch() has a PathWatcherManager deadlock (oven-sh/bun#27469,
 * #26385): closing a watcher on the main thread while the File Watcher thread
 * is delivering events can hang both threads in __ulock_wait2 forever. Chokidar
 * with depth: 2 on large skill trees (hundreds of subdirs) triggers this
 * reliably when a git operation touches many directories at once — chokidar
 * internally closes/reopens per-directory FSWatchers as dirs are added/removed.
 *
 * Workaround: use stat() polling under Bun. No FSWatcher = no deadlock.
 * The fix is pending upstream; remove this once the Bun PR lands.
 */
var USE_POLLING = typeof Bun !== 'undefined';
var watcher = null;
var reloadTimer = null;
var pendingChangedPaths = new Set();
var initialized = false;
var disposed = false;
var dynamicSkillsCallbackRegistered = false;
var unregisterCleanup = null;
var skillsChanged = (0, signal_js_1.createSignal)();
// Test overrides for timing constants
var testOverrides = null;
/**
 * Initialize file watching for skill directories
 */
function initialize() {
    return __awaiter(this, void 0, void 0, function () {
        var paths;
        var _this = this;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (initialized || disposed)
                        return [2 /*return*/];
                    initialized = true;
                    // Register callback for when dynamic skills are loaded (only once)
                    if (!dynamicSkillsCallbackRegistered) {
                        dynamicSkillsCallbackRegistered = true;
                        (0, loadSkillsDir_js_1.onDynamicSkillsLoaded)(function () {
                            // Clear memoization caches so new skills are picked up
                            // Note: we use clearCommandMemoizationCaches (not clearCommandsCache)
                            // because clearCommandsCache would call clearSkillCaches which
                            // wipes out the dynamic skills we just loaded
                            (0, commands_js_1.clearCommandMemoizationCaches)();
                            // Notify listeners that skills changed
                            skillsChanged.emit();
                        });
                    }
                    return [4 /*yield*/, getWatchablePaths()];
                case 1:
                    paths = _d.sent();
                    if (paths.length === 0)
                        return [2 /*return*/];
                    (0, debug_js_1.logForDebugging)("Watching for changes in skill/command directories: ".concat(paths.join(', '), "..."));
                    watcher = chokidar_1.default.watch(paths, {
                        persistent: true,
                        ignoreInitial: true,
                        depth: 2, // Skills use skill-name/SKILL.md format
                        awaitWriteFinish: {
                            stabilityThreshold: (_a = testOverrides === null || testOverrides === void 0 ? void 0 : testOverrides.stabilityThreshold) !== null && _a !== void 0 ? _a : FILE_STABILITY_THRESHOLD_MS,
                            pollInterval: (_b = testOverrides === null || testOverrides === void 0 ? void 0 : testOverrides.pollInterval) !== null && _b !== void 0 ? _b : FILE_STABILITY_POLL_INTERVAL_MS,
                        },
                        // Ignore special file types (sockets, FIFOs, devices) - they cannot be watched
                        // and will error with EOPNOTSUPP on macOS. Only allow regular files and directories.
                        ignored: function (path, stats) {
                            if (stats && !stats.isFile() && !stats.isDirectory())
                                return true;
                            // Ignore .git directories
                            return path.split(platformPath.sep).some(function (dir) { return dir === '.git'; });
                        },
                        ignorePermissionErrors: true,
                        usePolling: USE_POLLING,
                        interval: (_c = testOverrides === null || testOverrides === void 0 ? void 0 : testOverrides.chokidarInterval) !== null && _c !== void 0 ? _c : POLLING_INTERVAL_MS,
                        atomic: true,
                    });
                    watcher.on('add', handleChange);
                    watcher.on('change', handleChange);
                    watcher.on('unlink', handleChange);
                    // Register cleanup to properly dispose of the file watcher during graceful shutdown
                    unregisterCleanup = (0, cleanupRegistry_js_1.registerCleanup)(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, dispose()];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Clean up file watcher
 */
function dispose() {
    disposed = true;
    if (unregisterCleanup) {
        unregisterCleanup();
        unregisterCleanup = null;
    }
    var closePromise = Promise.resolve();
    if (watcher) {
        closePromise = watcher.close();
        watcher = null;
    }
    if (reloadTimer) {
        clearTimeout(reloadTimer);
        reloadTimer = null;
    }
    pendingChangedPaths.clear();
    skillsChanged.clear();
    return closePromise;
}
/**
 * Subscribe to skill changes
 */
exports.subscribe = skillsChanged.subscribe;
function getWatchablePaths() {
    return __awaiter(this, void 0, void 0, function () {
        var fs, paths, userSkillsPath, _a, userCommandsPath, _b, projectSkillsPath, absolutePath, _c, projectCommandsPath, absolutePath, _d, _i, _e, dir, additionalSkillsPath, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    fs = (0, fsOperations_js_1.getFsImplementation)();
                    paths = [];
                    userSkillsPath = (0, loadSkillsDir_js_1.getSkillsPath)('userSettings', 'skills');
                    if (!userSkillsPath) return [3 /*break*/, 4];
                    _g.label = 1;
                case 1:
                    _g.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fs.stat(userSkillsPath)];
                case 2:
                    _g.sent();
                    paths.push(userSkillsPath);
                    return [3 /*break*/, 4];
                case 3:
                    _a = _g.sent();
                    return [3 /*break*/, 4];
                case 4:
                    userCommandsPath = (0, loadSkillsDir_js_1.getSkillsPath)('userSettings', 'commands');
                    if (!userCommandsPath) return [3 /*break*/, 8];
                    _g.label = 5;
                case 5:
                    _g.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, fs.stat(userCommandsPath)];
                case 6:
                    _g.sent();
                    paths.push(userCommandsPath);
                    return [3 /*break*/, 8];
                case 7:
                    _b = _g.sent();
                    return [3 /*break*/, 8];
                case 8:
                    projectSkillsPath = (0, loadSkillsDir_js_1.getSkillsPath)('projectSettings', 'skills');
                    if (!projectSkillsPath) return [3 /*break*/, 12];
                    _g.label = 9;
                case 9:
                    _g.trys.push([9, 11, , 12]);
                    absolutePath = platformPath.resolve(projectSkillsPath);
                    return [4 /*yield*/, fs.stat(absolutePath)];
                case 10:
                    _g.sent();
                    paths.push(absolutePath);
                    return [3 /*break*/, 12];
                case 11:
                    _c = _g.sent();
                    return [3 /*break*/, 12];
                case 12:
                    projectCommandsPath = (0, loadSkillsDir_js_1.getSkillsPath)('projectSettings', 'commands');
                    if (!projectCommandsPath) return [3 /*break*/, 16];
                    _g.label = 13;
                case 13:
                    _g.trys.push([13, 15, , 16]);
                    absolutePath = platformPath.resolve(projectCommandsPath);
                    return [4 /*yield*/, fs.stat(absolutePath)];
                case 14:
                    _g.sent();
                    paths.push(absolutePath);
                    return [3 /*break*/, 16];
                case 15:
                    _d = _g.sent();
                    return [3 /*break*/, 16];
                case 16:
                    _i = 0, _e = (0, state_js_1.getAdditionalDirectoriesForClaudeMd)();
                    _g.label = 17;
                case 17:
                    if (!(_i < _e.length)) return [3 /*break*/, 22];
                    dir = _e[_i];
                    additionalSkillsPath = platformPath.join(dir, '.claude', 'skills');
                    _g.label = 18;
                case 18:
                    _g.trys.push([18, 20, , 21]);
                    return [4 /*yield*/, fs.stat(additionalSkillsPath)];
                case 19:
                    _g.sent();
                    paths.push(additionalSkillsPath);
                    return [3 /*break*/, 21];
                case 20:
                    _f = _g.sent();
                    return [3 /*break*/, 21];
                case 21:
                    _i++;
                    return [3 /*break*/, 17];
                case 22: return [2 /*return*/, paths];
            }
        });
    });
}
function handleChange(path) {
    (0, debug_js_1.logForDebugging)("Detected skill change: ".concat(path));
    (0, index_js_1.logEvent)('tengu_skill_file_changed', {
        source: 'chokidar',
    });
    scheduleReload(path);
}
/**
 * Debounce rapid skill changes into a single reload. When many skill files
 * change at once (e.g. auto-update installs a new binary and a new session
 * touches skill directories), each file fires its own chokidar event. Without
 * debouncing, each event triggers clearSkillCaches() + clearCommandsCache() +
 * listener notification — 30 events means 30 full reload cycles, which can
 * deadlock the Bun event loop via rapid FSWatcher watch/unwatch churn.
 */
function scheduleReload(changedPath) {
    var _this = this;
    var _a;
    pendingChangedPaths.add(changedPath);
    if (reloadTimer)
        clearTimeout(reloadTimer);
    reloadTimer = setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
        var paths, results;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    reloadTimer = null;
                    paths = __spreadArray([], pendingChangedPaths, true);
                    pendingChangedPaths.clear();
                    return [4 /*yield*/, (0, hooks_js_1.executeConfigChangeHooks)('skills', paths[0])];
                case 1:
                    results = _a.sent();
                    if ((0, hooks_js_1.hasBlockingResult)(results)) {
                        (0, debug_js_1.logForDebugging)("ConfigChange hook blocked skill reload (".concat(paths.length, " paths)"));
                        return [2 /*return*/];
                    }
                    (0, loadSkillsDir_js_1.clearSkillCaches)();
                    (0, commands_js_1.clearCommandsCache)();
                    (0, attachments_js_1.resetSentSkillNames)();
                    skillsChanged.emit();
                    return [2 /*return*/];
            }
        });
    }); }, (_a = testOverrides === null || testOverrides === void 0 ? void 0 : testOverrides.reloadDebounce) !== null && _a !== void 0 ? _a : RELOAD_DEBOUNCE_MS);
}
/**
 * Reset internal state for testing purposes only.
 */
function resetForTesting(overrides) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!watcher) return [3 /*break*/, 2];
                    return [4 /*yield*/, watcher.close()];
                case 1:
                    _a.sent();
                    watcher = null;
                    _a.label = 2;
                case 2:
                    if (reloadTimer) {
                        clearTimeout(reloadTimer);
                        reloadTimer = null;
                    }
                    pendingChangedPaths.clear();
                    skillsChanged.clear();
                    initialized = false;
                    disposed = false;
                    testOverrides = overrides !== null && overrides !== void 0 ? overrides : null;
                    return [2 /*return*/];
            }
        });
    });
}
exports.skillChangeDetector = {
    initialize: initialize,
    dispose: dispose,
    subscribe: exports.subscribe,
    resetForTesting: resetForTesting,
};
