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
exports.settingsChangeDetector = exports.subscribe = void 0;
exports.initialize = initialize;
exports.dispose = dispose;
exports.notifyChange = notifyChange;
exports.resetForTesting = resetForTesting;
var chokidar_1 = require("chokidar");
var promises_1 = require("fs/promises");
var platformPath = require("path");
var state_js_1 = require("../../bootstrap/state.js");
var cleanupRegistry_js_1 = require("../cleanupRegistry.js");
var debug_js_1 = require("../debug.js");
var errors_js_1 = require("../errors.js");
var hooks_js_1 = require("../hooks.js");
var signal_js_1 = require("../signal.js");
var slowOperations_js_1 = require("../slowOperations.js");
var constants_js_1 = require("./constants.js");
var internalWrites_js_1 = require("./internalWrites.js");
var managedPath_js_1 = require("./managedPath.js");
var settings_js_1 = require("./mdm/settings.js");
var settings_js_2 = require("./settings.js");
var settingsCache_js_1 = require("./settingsCache.js");
/**
 * Time in milliseconds to wait for file writes to stabilize before processing.
 * This helps avoid processing partial writes or rapid successive changes.
 */
var FILE_STABILITY_THRESHOLD_MS = 1000;
/**
 * Polling interval in milliseconds for checking file stability.
 * Used by chokidar's awaitWriteFinish option.
 * Must be lower than FILE_STABILITY_THRESHOLD_MS.
 */
var FILE_STABILITY_POLL_INTERVAL_MS = 500;
/**
 * Time window in milliseconds to consider a file change as internal.
 * If a file change occurs within this window after markInternalWrite() is called,
 * it's assumed to be from Claude Code itself and won't trigger a notification.
 */
var INTERNAL_WRITE_WINDOW_MS = 5000;
/**
 * Poll interval for MDM settings (registry/plist) changes.
 * These can't be watched via filesystem events, so we poll periodically.
 */
var MDM_POLL_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
/**
 * Grace period in milliseconds before processing a settings file deletion.
 * Handles the common delete-and-recreate pattern during auto-updates or when
 * another session starts up. If an `add` or `change` event fires within this
 * window (file was recreated), the deletion is cancelled and treated as a change.
 *
 * Must exceed chokidar's awaitWriteFinish delay (stabilityThreshold + pollInterval)
 * so the grace window outlasts the write stability check on the recreated file.
 */
var DELETION_GRACE_MS = FILE_STABILITY_THRESHOLD_MS + FILE_STABILITY_POLL_INTERVAL_MS + 200;
var watcher = null;
var mdmPollTimer = null;
var lastMdmSnapshot = null;
var initialized = false;
var disposed = false;
var pendingDeletions = new Map();
var settingsChanged = (0, signal_js_1.createSignal)();
// Test overrides for timing constants
var testOverrides = null;
/**
 * Initialize file watching
 */
function initialize() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, dirs, settingsFiles, dropInDir;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if ((0, state_js_1.getIsRemoteMode)())
                        return [2 /*return*/];
                    if (initialized || disposed)
                        return [2 /*return*/];
                    initialized = true;
                    // Start MDM poll for registry/plist changes (independent of filesystem watching)
                    startMdmPoll();
                    // Register cleanup to properly dispose during graceful shutdown
                    (0, cleanupRegistry_js_1.registerCleanup)(dispose);
                    return [4 /*yield*/, getWatchTargets()];
                case 1:
                    _a = _d.sent(), dirs = _a.dirs, settingsFiles = _a.settingsFiles, dropInDir = _a.dropInDir;
                    if (disposed)
                        return [2 /*return*/]; // dispose() ran during the await
                    if (dirs.length === 0)
                        return [2 /*return*/];
                    (0, debug_js_1.logForDebugging)("Watching for changes in setting files ".concat(__spreadArray([], settingsFiles, true).join(', '), "...").concat(dropInDir ? " and drop-in directory ".concat(dropInDir) : ''));
                    watcher = chokidar_1.default.watch(dirs, {
                        persistent: true,
                        ignoreInitial: true,
                        depth: 0, // Only watch immediate children, not subdirectories
                        awaitWriteFinish: {
                            stabilityThreshold: (_b = testOverrides === null || testOverrides === void 0 ? void 0 : testOverrides.stabilityThreshold) !== null && _b !== void 0 ? _b : FILE_STABILITY_THRESHOLD_MS,
                            pollInterval: (_c = testOverrides === null || testOverrides === void 0 ? void 0 : testOverrides.pollInterval) !== null && _c !== void 0 ? _c : FILE_STABILITY_POLL_INTERVAL_MS,
                        },
                        ignored: function (path, stats) {
                            // Ignore special file types (sockets, FIFOs, devices) - they cannot be watched
                            // and will error with EOPNOTSUPP on macOS.
                            if (stats && !stats.isFile() && !stats.isDirectory())
                                return true;
                            // Ignore .git directories
                            if (path.split(platformPath.sep).some(function (dir) { return dir === '.git'; }))
                                return true;
                            // Allow directories (chokidar needs them for directory-level watching)
                            // and paths without stats (chokidar's initial check before stat)
                            if (!stats || stats.isDirectory())
                                return false;
                            // Only watch known settings files, ignore everything else in the directory
                            // Note: chokidar normalizes paths to forward slashes on Windows, so we
                            // normalize back to native format for comparison
                            var normalized = platformPath.normalize(path);
                            if (settingsFiles.has(normalized))
                                return false;
                            // Also accept .json files inside the managed-settings.d/ drop-in directory
                            if (dropInDir &&
                                normalized.startsWith(dropInDir + platformPath.sep) &&
                                normalized.endsWith('.json')) {
                                return false;
                            }
                            return true;
                        },
                        // Additional options for stability
                        ignorePermissionErrors: true,
                        usePolling: false, // Use native file system events
                        atomic: true, // Handle atomic writes better
                    });
                    watcher.on('change', handleChange);
                    watcher.on('unlink', handleDelete);
                    watcher.on('add', handleAdd);
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Clean up file watcher. Returns a promise that resolves when chokidar's
 * close() settles — callers that need the watcher fully stopped before
 * removing the watched directory (e.g. test teardown) must await this.
 * Fire-and-forget is still valid where timing doesn't matter.
 */
function dispose() {
    disposed = true;
    if (mdmPollTimer) {
        clearInterval(mdmPollTimer);
        mdmPollTimer = null;
    }
    for (var _i = 0, _a = pendingDeletions.values(); _i < _a.length; _i++) {
        var timer = _a[_i];
        clearTimeout(timer);
    }
    pendingDeletions.clear();
    lastMdmSnapshot = null;
    (0, internalWrites_js_1.clearInternalWrites)();
    settingsChanged.clear();
    var w = watcher;
    watcher = null;
    return w ? w.close() : Promise.resolve();
}
/**
 * Subscribe to settings changes
 */
exports.subscribe = settingsChanged.subscribe;
/**
 * Collect settings file paths and their deduplicated parent directories to watch.
 * Returns all potential settings file paths for watched directories, not just those
 * that exist at init time, so that newly-created files are also detected.
 */
function getWatchTargets() {
    return __awaiter(this, void 0, void 0, function () {
        var dirToSettingsFiles, dirsWithExistingFiles, _i, SETTING_SOURCES_1, source, path, dir, stats, _a, settingsFiles, _b, dirsWithExistingFiles_1, dir, filesInDir, _c, filesInDir_1, file, dropInDir, managedDropIn, stats, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    dirToSettingsFiles = new Map();
                    dirsWithExistingFiles = new Set();
                    _i = 0, SETTING_SOURCES_1 = constants_js_1.SETTING_SOURCES;
                    _e.label = 1;
                case 1:
                    if (!(_i < SETTING_SOURCES_1.length)) return [3 /*break*/, 6];
                    source = SETTING_SOURCES_1[_i];
                    // Skip flagSettings - they're provided via CLI and won't change during the session.
                    // Additionally, they may be temp files in $TMPDIR which can contain special files
                    // (FIFOs, sockets) that cause the file watcher to hang or error.
                    // See: https://github.com/anthropics/claude-code/issues/16469
                    if (source === 'flagSettings') {
                        return [3 /*break*/, 5];
                    }
                    path = (0, settings_js_2.getSettingsFilePathForSource)(source);
                    if (!path) {
                        return [3 /*break*/, 5];
                    }
                    dir = platformPath.dirname(path);
                    // Track all potential settings files in each directory
                    if (!dirToSettingsFiles.has(dir)) {
                        dirToSettingsFiles.set(dir, new Set());
                    }
                    dirToSettingsFiles.get(dir).add(path);
                    _e.label = 2;
                case 2:
                    _e.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, promises_1.stat)(path)];
                case 3:
                    stats = _e.sent();
                    if (stats.isFile()) {
                        dirsWithExistingFiles.add(dir);
                    }
                    return [3 /*break*/, 5];
                case 4:
                    _a = _e.sent();
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6:
                    settingsFiles = new Set();
                    for (_b = 0, dirsWithExistingFiles_1 = dirsWithExistingFiles; _b < dirsWithExistingFiles_1.length; _b++) {
                        dir = dirsWithExistingFiles_1[_b];
                        filesInDir = dirToSettingsFiles.get(dir);
                        if (filesInDir) {
                            for (_c = 0, filesInDir_1 = filesInDir; _c < filesInDir_1.length; _c++) {
                                file = filesInDir_1[_c];
                                settingsFiles.add(file);
                            }
                        }
                    }
                    dropInDir = null;
                    managedDropIn = (0, managedPath_js_1.getManagedSettingsDropInDir)();
                    _e.label = 7;
                case 7:
                    _e.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, (0, promises_1.stat)(managedDropIn)];
                case 8:
                    stats = _e.sent();
                    if (stats.isDirectory()) {
                        dirsWithExistingFiles.add(managedDropIn);
                        dropInDir = managedDropIn;
                    }
                    return [3 /*break*/, 10];
                case 9:
                    _d = _e.sent();
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/, { dirs: __spreadArray([], dirsWithExistingFiles, true), settingsFiles: settingsFiles, dropInDir: dropInDir }];
            }
        });
    });
}
function settingSourceToConfigChangeSource(source) {
    switch (source) {
        case 'userSettings':
            return 'user_settings';
        case 'projectSettings':
            return 'project_settings';
        case 'localSettings':
            return 'local_settings';
        case 'flagSettings':
        case 'policySettings':
            return 'policy_settings';
    }
}
function handleChange(path) {
    var source = getSourceForPath(path);
    if (!source)
        return;
    // If a deletion was pending for this path (delete-and-recreate pattern),
    // cancel the deletion — we'll process this as a change instead.
    var pendingTimer = pendingDeletions.get(path);
    if (pendingTimer) {
        clearTimeout(pendingTimer);
        pendingDeletions.delete(path);
        (0, debug_js_1.logForDebugging)("Cancelled pending deletion of ".concat(path, " \u2014 file was recreated"));
    }
    // Check if this was an internal write
    if ((0, internalWrites_js_1.consumeInternalWrite)(path, INTERNAL_WRITE_WINDOW_MS)) {
        return;
    }
    (0, debug_js_1.logForDebugging)("Detected change to ".concat(path));
    // Fire ConfigChange hook first — if blocked (exit code 2 or decision: 'block'),
    // skip applying the change to the session
    void (0, hooks_js_1.executeConfigChangeHooks)(settingSourceToConfigChangeSource(source), path).then(function (results) {
        if ((0, hooks_js_1.hasBlockingResult)(results)) {
            (0, debug_js_1.logForDebugging)("ConfigChange hook blocked change to ".concat(path));
            return;
        }
        fanOut(source);
    });
}
/**
 * Handle a file being re-added (e.g. after a delete-and-recreate). Cancels any
 * pending deletion grace timer and treats the event as a change.
 */
function handleAdd(path) {
    var source = getSourceForPath(path);
    if (!source)
        return;
    // Cancel any pending deletion — the file is back
    var pendingTimer = pendingDeletions.get(path);
    if (pendingTimer) {
        clearTimeout(pendingTimer);
        pendingDeletions.delete(path);
        (0, debug_js_1.logForDebugging)("Cancelled pending deletion of ".concat(path, " \u2014 file was re-added"));
    }
    // Treat as a change (re-read settings)
    handleChange(path);
}
/**
 * Handle a file being deleted. Uses a grace period to absorb delete-and-recreate
 * patterns (e.g. auto-updater, another session starting up). If the file is
 * recreated within the grace period (detected via 'add' or 'change' event),
 * the deletion is cancelled and treated as a normal change instead.
 */
function handleDelete(path) {
    var _a;
    var source = getSourceForPath(path);
    if (!source)
        return;
    (0, debug_js_1.logForDebugging)("Detected deletion of ".concat(path));
    // If there's already a pending deletion for this path, let it run
    if (pendingDeletions.has(path))
        return;
    var timer = setTimeout(function (p, src) {
        pendingDeletions.delete(p);
        // Fire ConfigChange hook first — if blocked, skip applying the deletion
        void (0, hooks_js_1.executeConfigChangeHooks)(settingSourceToConfigChangeSource(src), p).then(function (results) {
            if ((0, hooks_js_1.hasBlockingResult)(results)) {
                (0, debug_js_1.logForDebugging)("ConfigChange hook blocked deletion of ".concat(p));
                return;
            }
            fanOut(src);
        });
    }, (_a = testOverrides === null || testOverrides === void 0 ? void 0 : testOverrides.deletionGrace) !== null && _a !== void 0 ? _a : DELETION_GRACE_MS, path, source);
    pendingDeletions.set(path, timer);
}
function getSourceForPath(path) {
    // Normalize path because chokidar uses forward slashes on Windows
    var normalizedPath = platformPath.normalize(path);
    // Check if the path is inside the managed-settings.d/ drop-in directory
    var dropInDir = (0, managedPath_js_1.getManagedSettingsDropInDir)();
    if (normalizedPath.startsWith(dropInDir + platformPath.sep)) {
        return 'policySettings';
    }
    return constants_js_1.SETTING_SOURCES.find(function (source) { return (0, settings_js_2.getSettingsFilePathForSource)(source) === normalizedPath; });
}
/**
 * Start polling for MDM settings changes (registry/plist).
 * Takes a snapshot of current MDM settings and compares on each tick.
 */
function startMdmPoll() {
    var _this = this;
    var _a;
    // Capture initial snapshot (includes both admin MDM and user-writable HKCU)
    var initial = (0, settings_js_1.getMdmSettings)();
    var initialHkcu = (0, settings_js_1.getHkcuSettings)();
    lastMdmSnapshot = (0, slowOperations_js_1.jsonStringify)({
        mdm: initial.settings,
        hkcu: initialHkcu.settings,
    });
    mdmPollTimer = setInterval(function () {
        if (disposed)
            return;
        void (function () { return __awaiter(_this, void 0, void 0, function () {
            var _a, current, currentHkcu, currentSnapshot, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, settings_js_1.refreshMdmSettings)()];
                    case 1:
                        _a = _b.sent(), current = _a.mdm, currentHkcu = _a.hkcu;
                        if (disposed)
                            return [2 /*return*/];
                        currentSnapshot = (0, slowOperations_js_1.jsonStringify)({
                            mdm: current.settings,
                            hkcu: currentHkcu.settings,
                        });
                        if (currentSnapshot !== lastMdmSnapshot) {
                            lastMdmSnapshot = currentSnapshot;
                            // Update the cache so sync readers pick up new values
                            (0, settings_js_1.setMdmSettingsCache)(current, currentHkcu);
                            (0, debug_js_1.logForDebugging)('Detected MDM settings change via poll');
                            fanOut('policySettings');
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _b.sent();
                        (0, debug_js_1.logForDebugging)("MDM poll error: ".concat((0, errors_js_1.errorMessage)(error_1)));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); })();
    }, (_a = testOverrides === null || testOverrides === void 0 ? void 0 : testOverrides.mdmPollInterval) !== null && _a !== void 0 ? _a : MDM_POLL_INTERVAL_MS);
    // Don't let the timer keep the process alive
    mdmPollTimer.unref();
}
/**
 * Reset the settings cache, then notify all listeners.
 *
 * The cache reset MUST happen here (single producer), not in each listener
 * (N consumers). Previously, listeners like useSettingsChange and
 * applySettingsChange reset defensively because some notification paths
 * (file-watch at :289/340, MDM poll at :385) did not reset before iterating
 * listeners. That defense caused N-way thrashing when N listeners were
 * subscribed: each listener cleared the cache, re-read from disk (populating
 * it), then the next listener cleared it again — N full disk reloads per
 * notification. Profile showed 5 loadSettingsFromDisk calls in 12ms when
 * remote managed settings resolved at startup.
 *
 * With the reset centralized here, one notification = one disk reload: the
 * first listener to call getSettingsWithErrors() pays the miss and
 * repopulates; all subsequent listeners hit the cache.
 */
function fanOut(source) {
    (0, settingsCache_js_1.resetSettingsCache)();
    settingsChanged.emit(source);
}
/**
 * Manually notify listeners of a settings change.
 * Used for programmatic settings changes (e.g., remote managed settings refresh)
 * that don't involve file system changes.
 */
function notifyChange(source) {
    (0, debug_js_1.logForDebugging)("Programmatic settings change notification for ".concat(source));
    fanOut(source);
}
/**
 * Reset internal state for testing purposes only.
 * This allows re-initialization after dispose().
 * Optionally accepts timing overrides for faster test execution.
 *
 * Closes the watcher and returns the close promise so preload's afterEach
 * can await it BEFORE nuking perTestSettingsDir. Without this, chokidar's
 * pending awaitWriteFinish poll fires on the deleted dir → ENOENT (#25253).
 */
function resetForTesting(overrides) {
    if (mdmPollTimer) {
        clearInterval(mdmPollTimer);
        mdmPollTimer = null;
    }
    for (var _i = 0, _a = pendingDeletions.values(); _i < _a.length; _i++) {
        var timer = _a[_i];
        clearTimeout(timer);
    }
    pendingDeletions.clear();
    lastMdmSnapshot = null;
    initialized = false;
    disposed = false;
    testOverrides = overrides !== null && overrides !== void 0 ? overrides : null;
    var w = watcher;
    watcher = null;
    return w ? w.close() : Promise.resolve();
}
exports.settingsChangeDetector = {
    initialize: initialize,
    dispose: dispose,
    subscribe: exports.subscribe,
    notifyChange: notifyChange,
    resetForTesting: resetForTesting,
};
