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
exports.fileHistoryEnabled = fileHistoryEnabled;
exports.fileHistoryTrackEdit = fileHistoryTrackEdit;
exports.fileHistoryMakeSnapshot = fileHistoryMakeSnapshot;
exports.fileHistoryRewind = fileHistoryRewind;
exports.fileHistoryCanRestore = fileHistoryCanRestore;
exports.fileHistoryGetDiffStats = fileHistoryGetDiffStats;
exports.fileHistoryHasAnyChanges = fileHistoryHasAnyChanges;
exports.checkOriginFileChanged = checkOriginFileChanged;
exports.fileHistoryRestoreStateFromLog = fileHistoryRestoreStateFromLog;
exports.copyFileHistoryForResume = copyFileHistoryForResume;
var crypto_1 = require("crypto");
var diff_1 = require("diff");
var promises_1 = require("fs/promises");
var path_1 = require("path");
var state_js_1 = require("src/bootstrap/state.js");
var index_js_1 = require("src/services/analytics/index.js");
var vscodeSdkMcp_js_1 = require("src/services/mcp/vscodeSdkMcp.js");
var util_1 = require("util");
var config_js_1 = require("./config.js");
var debug_js_1 = require("./debug.js");
var envUtils_js_1 = require("./envUtils.js");
var errors_js_1 = require("./errors.js");
var file_js_1 = require("./file.js");
var log_js_1 = require("./log.js");
var sessionStorage_js_1 = require("./sessionStorage.js");
var MAX_SNAPSHOTS = 100;
function fileHistoryEnabled() {
    if ((0, state_js_1.getIsNonInteractiveSession)()) {
        return fileHistoryEnabledSdk();
    }
    return ((0, config_js_1.getGlobalConfig)().fileCheckpointingEnabled !== false &&
        !(0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_DISABLE_FILE_CHECKPOINTING));
}
function fileHistoryEnabledSdk() {
    return ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_ENABLE_SDK_FILE_CHECKPOINTING) &&
        !(0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_DISABLE_FILE_CHECKPOINTING));
}
/**
 * Tracks a file edit (and add) by creating a backup of its current contents (if necessary).
 *
 * This must be called before the file is actually added or edited, so we can save
 * its contents before the edit.
 */
function fileHistoryTrackEdit(updateFileHistoryState, filePath, messageId) {
    return __awaiter(this, void 0, void 0, function () {
        var trackingPath, captured, mostRecent, backup, error_1, isAddingFile;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!fileHistoryEnabled()) {
                        return [2 /*return*/];
                    }
                    trackingPath = maybeShortenFilePath(filePath);
                    updateFileHistoryState(function (state) {
                        captured = state;
                        return state;
                    });
                    if (!captured)
                        return [2 /*return*/];
                    mostRecent = captured.snapshots.at(-1);
                    if (!mostRecent) {
                        (0, log_js_1.logError)(new Error('FileHistory: Missing most recent snapshot'));
                        (0, index_js_1.logEvent)('tengu_file_history_track_edit_failed', {});
                        return [2 /*return*/];
                    }
                    if (mostRecent.trackedFileBackups[trackingPath]) {
                        // Already tracked in the most recent snapshot; next makeSnapshot will
                        // re-check mtime and re-backup if changed. Do not touch v1 backup.
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, createBackup(filePath, 1)];
                case 2:
                    backup = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    (0, log_js_1.logError)(error_1);
                    (0, index_js_1.logEvent)('tengu_file_history_track_edit_failed', {});
                    return [2 /*return*/];
                case 4:
                    isAddingFile = backup.backupFileName === null;
                    // Phase 3: commit. Re-check tracked (another trackEdit may have raced).
                    updateFileHistoryState(function (state) {
                        var _a;
                        try {
                            var mostRecentSnapshot = state.snapshots.at(-1);
                            if (!mostRecentSnapshot ||
                                mostRecentSnapshot.trackedFileBackups[trackingPath]) {
                                return state;
                            }
                            // This file has not already been tracked in the most recent snapshot, so we
                            // need to retroactively track a backup there.
                            var updatedTrackedFiles = state.trackedFiles.has(trackingPath)
                                ? state.trackedFiles
                                : new Set(state.trackedFiles).add(trackingPath);
                            // Shallow-spread is sufficient: backup values are never mutated after
                            // insertion, so we only need fresh top-level + trackedFileBackups refs
                            // for React change detection. A deep clone would copy every existing
                            // backup's Date/string fields — O(n) cost to add one entry.
                            var updatedMostRecentSnapshot_1 = __assign(__assign({}, mostRecentSnapshot), { trackedFileBackups: __assign(__assign({}, mostRecentSnapshot.trackedFileBackups), (_a = {}, _a[trackingPath] = backup, _a)) });
                            var updatedState = __assign(__assign({}, state), { snapshots: (function () {
                                    var copy = state.snapshots.slice();
                                    copy[copy.length - 1] = updatedMostRecentSnapshot_1;
                                    return copy;
                                })(), trackedFiles: updatedTrackedFiles });
                            maybeDumpStateForDebug(updatedState);
                            // Record a snapshot update since it has changed.
                            void (0, sessionStorage_js_1.recordFileHistorySnapshot)(messageId, updatedMostRecentSnapshot_1, true).catch(function (error) {
                                (0, log_js_1.logError)(new Error("FileHistory: Failed to record snapshot: ".concat(error)));
                            });
                            (0, index_js_1.logEvent)('tengu_file_history_track_edit_success', {
                                isNewFile: isAddingFile,
                                version: backup.version,
                            });
                            (0, debug_js_1.logForDebugging)("FileHistory: Tracked file modification for ".concat(filePath));
                            return updatedState;
                        }
                        catch (error) {
                            (0, log_js_1.logError)(error);
                            (0, index_js_1.logEvent)('tengu_file_history_track_edit_failed', {});
                            return state;
                        }
                    });
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Adds a snapshot in the file history and backs up any modified tracked files.
 */
function fileHistoryMakeSnapshot(updateFileHistoryState, messageId) {
    return __awaiter(this, void 0, void 0, function () {
        var captured, trackedFileBackups, mostRecentSnapshot;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!fileHistoryEnabled()) {
                        return [2 /*return*/, undefined];
                    }
                    updateFileHistoryState(function (state) {
                        captured = state;
                        return state;
                    });
                    if (!captured)
                        return [2 /*return*/]; // updateFileHistoryState was a no-op stub (e.g. mcp.ts)
                    trackedFileBackups = {};
                    mostRecentSnapshot = captured.snapshots.at(-1);
                    if (!mostRecentSnapshot) return [3 /*break*/, 2];
                    (0, debug_js_1.logForDebugging)("FileHistory: Making snapshot for message ".concat(messageId));
                    return [4 /*yield*/, Promise.all(Array.from(captured.trackedFiles, function (trackingPath) { return __awaiter(_this, void 0, void 0, function () {
                            var filePath, latestBackup, nextVersion, fileStats, e_1, _a, _b, _c, error_2;
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0:
                                        _d.trys.push([0, 8, , 9]);
                                        filePath = maybeExpandFilePath(trackingPath);
                                        latestBackup = mostRecentSnapshot.trackedFileBackups[trackingPath];
                                        nextVersion = latestBackup ? latestBackup.version + 1 : 1;
                                        fileStats = void 0;
                                        _d.label = 1;
                                    case 1:
                                        _d.trys.push([1, 3, , 4]);
                                        return [4 /*yield*/, (0, promises_1.stat)(filePath)];
                                    case 2:
                                        fileStats = _d.sent();
                                        return [3 /*break*/, 4];
                                    case 3:
                                        e_1 = _d.sent();
                                        if (!(0, errors_js_1.isENOENT)(e_1))
                                            throw e_1;
                                        return [3 /*break*/, 4];
                                    case 4:
                                        if (!fileStats) {
                                            trackedFileBackups[trackingPath] = {
                                                backupFileName: null, // Use null to denote missing tracked file
                                                version: nextVersion,
                                                backupTime: new Date(),
                                            };
                                            (0, index_js_1.logEvent)('tengu_file_history_backup_deleted_file', {
                                                version: nextVersion,
                                            });
                                            (0, debug_js_1.logForDebugging)("FileHistory: Missing tracked file: ".concat(trackingPath));
                                            return [2 /*return*/];
                                        }
                                        _a = latestBackup &&
                                            latestBackup.backupFileName !== null;
                                        if (!_a) return [3 /*break*/, 6];
                                        return [4 /*yield*/, checkOriginFileChanged(filePath, latestBackup.backupFileName, fileStats)];
                                    case 5:
                                        _a = !(_d.sent());
                                        _d.label = 6;
                                    case 6:
                                        // File exists - check if it needs to be backed up
                                        if (_a) {
                                            // File hasn't been modified since the latest version, reuse it
                                            trackedFileBackups[trackingPath] = latestBackup;
                                            return [2 /*return*/];
                                        }
                                        // File is newer than the latest backup, create a new backup
                                        _b = trackedFileBackups;
                                        _c = trackingPath;
                                        return [4 /*yield*/, createBackup(filePath, nextVersion)];
                                    case 7:
                                        // File is newer than the latest backup, create a new backup
                                        _b[_c] = _d.sent();
                                        return [3 /*break*/, 9];
                                    case 8:
                                        error_2 = _d.sent();
                                        (0, log_js_1.logError)(error_2);
                                        (0, index_js_1.logEvent)('tengu_file_history_backup_file_failed', {});
                                        return [3 /*break*/, 9];
                                    case 9: return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    // Phase 3: commit the new snapshot to state. Read state.trackedFiles FRESH
                    // — if fileHistoryTrackEdit added a file during phase 2's async window, it
                    // wrote the backup to state.snapshots[-1].trackedFileBackups. Inherit those
                    // so the new snapshot covers every currently-tracked file.
                    updateFileHistoryState(function (state) {
                        var _a;
                        try {
                            var lastSnapshot = state.snapshots.at(-1);
                            if (lastSnapshot) {
                                for (var _i = 0, _b = state.trackedFiles; _i < _b.length; _i++) {
                                    var trackingPath = _b[_i];
                                    if (trackingPath in trackedFileBackups)
                                        continue;
                                    var inherited = lastSnapshot.trackedFileBackups[trackingPath];
                                    if (inherited)
                                        trackedFileBackups[trackingPath] = inherited;
                                }
                            }
                            var now = new Date();
                            var newSnapshot = {
                                messageId: messageId,
                                trackedFileBackups: trackedFileBackups,
                                timestamp: now,
                            };
                            var allSnapshots = __spreadArray(__spreadArray([], state.snapshots, true), [newSnapshot], false);
                            var updatedState = __assign(__assign({}, state), { snapshots: allSnapshots.length > MAX_SNAPSHOTS
                                    ? allSnapshots.slice(-MAX_SNAPSHOTS)
                                    : allSnapshots, snapshotSequence: ((_a = state.snapshotSequence) !== null && _a !== void 0 ? _a : 0) + 1 });
                            maybeDumpStateForDebug(updatedState);
                            void notifyVscodeSnapshotFilesUpdated(state, updatedState).catch(log_js_1.logError);
                            // Record the file history snapshot to session storage for resume support
                            void (0, sessionStorage_js_1.recordFileHistorySnapshot)(messageId, newSnapshot, false).catch(function (error) {
                                (0, log_js_1.logError)(new Error("FileHistory: Failed to record snapshot: ".concat(error)));
                            });
                            (0, debug_js_1.logForDebugging)("FileHistory: Added snapshot for ".concat(messageId, ", tracking ").concat(state.trackedFiles.size, " files"));
                            (0, index_js_1.logEvent)('tengu_file_history_snapshot_success', {
                                trackedFilesCount: state.trackedFiles.size,
                                snapshotCount: updatedState.snapshots.length,
                            });
                            return updatedState;
                        }
                        catch (error) {
                            (0, log_js_1.logError)(error);
                            (0, index_js_1.logEvent)('tengu_file_history_snapshot_failed', {});
                            return state;
                        }
                    });
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Rewinds the file system to a previous snapshot.
 */
function fileHistoryRewind(updateFileHistoryState, messageId) {
    return __awaiter(this, void 0, void 0, function () {
        var captured, targetSnapshot, filesChanged, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!fileHistoryEnabled()) {
                        return [2 /*return*/];
                    }
                    updateFileHistoryState(function (state) {
                        captured = state;
                        return state;
                    });
                    if (!captured)
                        return [2 /*return*/];
                    targetSnapshot = captured.snapshots.findLast(function (snapshot) { return snapshot.messageId === messageId; });
                    if (!targetSnapshot) {
                        (0, log_js_1.logError)(new Error("FileHistory: Snapshot for ".concat(messageId, " not found")));
                        (0, index_js_1.logEvent)('tengu_file_history_rewind_failed', {
                            trackedFilesCount: captured.trackedFiles.size,
                            snapshotFound: false,
                        });
                        throw new Error('The selected snapshot was not found');
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    (0, debug_js_1.logForDebugging)("FileHistory: [Rewind] Rewinding to snapshot for ".concat(messageId));
                    return [4 /*yield*/, applySnapshot(captured, targetSnapshot)];
                case 2:
                    filesChanged = _a.sent();
                    (0, debug_js_1.logForDebugging)("FileHistory: [Rewind] Finished rewinding to ".concat(messageId));
                    (0, index_js_1.logEvent)('tengu_file_history_rewind_success', {
                        trackedFilesCount: captured.trackedFiles.size,
                        filesChangedCount: filesChanged.length,
                    });
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    (0, log_js_1.logError)(error_3);
                    (0, index_js_1.logEvent)('tengu_file_history_rewind_failed', {
                        trackedFilesCount: captured.trackedFiles.size,
                        snapshotFound: true,
                    });
                    throw error_3;
                case 4: return [2 /*return*/];
            }
        });
    });
}
function fileHistoryCanRestore(state, messageId) {
    if (!fileHistoryEnabled()) {
        return false;
    }
    return state.snapshots.some(function (snapshot) { return snapshot.messageId === messageId; });
}
/**
 * Computes diff stats for a file snapshot by counting the number of files that would be changed
 * if reverting to that snapshot.
 */
function fileHistoryGetDiffStats(state, messageId) {
    return __awaiter(this, void 0, void 0, function () {
        var targetSnapshot, results, filesChanged, insertions, deletions, _i, results_1, r;
        var _this = this;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!fileHistoryEnabled()) {
                        return [2 /*return*/, undefined];
                    }
                    targetSnapshot = state.snapshots.findLast(function (snapshot) { return snapshot.messageId === messageId; });
                    if (!targetSnapshot) {
                        return [2 /*return*/, undefined];
                    }
                    return [4 /*yield*/, Promise.all(Array.from(state.trackedFiles, function (trackingPath) { return __awaiter(_this, void 0, void 0, function () {
                            var filePath, targetBackup, backupFileName, stats, _a, error_4;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _b.trys.push([0, 4, , 5]);
                                        filePath = maybeExpandFilePath(trackingPath);
                                        targetBackup = targetSnapshot.trackedFileBackups[trackingPath];
                                        backupFileName = targetBackup
                                            ? targetBackup.backupFileName
                                            : getBackupFileNameFirstVersion(trackingPath, state);
                                        if (backupFileName === undefined) {
                                            // Error resolving the backup, so don't touch the file
                                            (0, log_js_1.logError)(new Error('FileHistory: Error finding the backup file to apply'));
                                            (0, index_js_1.logEvent)('tengu_file_history_rewind_restore_file_failed', {
                                                dryRun: true,
                                            });
                                            return [2 /*return*/, null];
                                        }
                                        return [4 /*yield*/, computeDiffStatsForFile(filePath, backupFileName === null ? undefined : backupFileName)];
                                    case 1:
                                        stats = _b.sent();
                                        if ((stats === null || stats === void 0 ? void 0 : stats.insertions) || (stats === null || stats === void 0 ? void 0 : stats.deletions)) {
                                            return [2 /*return*/, { filePath: filePath, stats: stats }];
                                        }
                                        _a = backupFileName === null;
                                        if (!_a) return [3 /*break*/, 3];
                                        return [4 /*yield*/, (0, file_js_1.pathExists)(filePath)];
                                    case 2:
                                        _a = (_b.sent());
                                        _b.label = 3;
                                    case 3:
                                        if (_a) {
                                            // Zero-byte file created after snapshot: counts as changed even
                                            // though diffLines reports 0/0.
                                            return [2 /*return*/, { filePath: filePath, stats: stats }];
                                        }
                                        return [2 /*return*/, null];
                                    case 4:
                                        error_4 = _b.sent();
                                        (0, log_js_1.logError)(error_4);
                                        (0, index_js_1.logEvent)('tengu_file_history_rewind_restore_file_failed', {
                                            dryRun: true,
                                        });
                                        return [2 /*return*/, null];
                                    case 5: return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 1:
                    results = _c.sent();
                    filesChanged = [];
                    insertions = 0;
                    deletions = 0;
                    for (_i = 0, results_1 = results; _i < results_1.length; _i++) {
                        r = results_1[_i];
                        if (!r)
                            continue;
                        filesChanged.push(r.filePath);
                        insertions += ((_a = r.stats) === null || _a === void 0 ? void 0 : _a.insertions) || 0;
                        deletions += ((_b = r.stats) === null || _b === void 0 ? void 0 : _b.deletions) || 0;
                    }
                    return [2 /*return*/, { filesChanged: filesChanged, insertions: insertions, deletions: deletions }];
            }
        });
    });
}
/**
 * Lightweight boolean-only check: would rewinding to this message change any
 * file on disk? Uses the same stat/content comparison as the non-dry-run path
 * of applySnapshot (checkOriginFileChanged) instead of computeDiffStatsForFile,
 * so it never calls diffLines. Early-exits on the first changed file. Use when
 * the caller only needs a yes/no answer; fileHistoryGetDiffStats remains for
 * callers that display insertions/deletions.
 */
function fileHistoryHasAnyChanges(state, messageId) {
    return __awaiter(this, void 0, void 0, function () {
        var targetSnapshot, _i, _a, trackingPath, filePath, targetBackup, backupFileName, error_5;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!fileHistoryEnabled()) {
                        return [2 /*return*/, false];
                    }
                    targetSnapshot = state.snapshots.findLast(function (snapshot) { return snapshot.messageId === messageId; });
                    if (!targetSnapshot) {
                        return [2 /*return*/, false];
                    }
                    _i = 0, _a = state.trackedFiles;
                    _b.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 8];
                    trackingPath = _a[_i];
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 6, , 7]);
                    filePath = maybeExpandFilePath(trackingPath);
                    targetBackup = targetSnapshot.trackedFileBackups[trackingPath];
                    backupFileName = targetBackup
                        ? targetBackup.backupFileName
                        : getBackupFileNameFirstVersion(trackingPath, state);
                    if (backupFileName === undefined) {
                        return [3 /*break*/, 7];
                    }
                    if (!(backupFileName === null)) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, file_js_1.pathExists)(filePath)];
                case 3:
                    // Backup says file did not exist; probe via stat (operate-then-catch).
                    if (_b.sent())
                        return [2 /*return*/, true];
                    return [3 /*break*/, 7];
                case 4: return [4 /*yield*/, checkOriginFileChanged(filePath, backupFileName)];
                case 5:
                    if (_b.sent())
                        return [2 /*return*/, true];
                    return [3 /*break*/, 7];
                case 6:
                    error_5 = _b.sent();
                    (0, log_js_1.logError)(error_5);
                    return [3 /*break*/, 7];
                case 7:
                    _i++;
                    return [3 /*break*/, 1];
                case 8: return [2 /*return*/, false];
            }
        });
    });
}
/**
 * Applies the given file snapshot state to the tracked files (writes/deletes
 * on disk), returning the list of changed file paths. Async IO only.
 */
function applySnapshot(state, targetSnapshot) {
    return __awaiter(this, void 0, void 0, function () {
        var filesChanged, _i, _a, trackingPath, filePath, targetBackup, backupFileName, e_2, error_6;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    filesChanged = [];
                    _i = 0, _a = state.trackedFiles;
                    _b.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 13];
                    trackingPath = _a[_i];
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 11, , 12]);
                    filePath = maybeExpandFilePath(trackingPath);
                    targetBackup = targetSnapshot.trackedFileBackups[trackingPath];
                    backupFileName = targetBackup
                        ? targetBackup.backupFileName
                        : getBackupFileNameFirstVersion(trackingPath, state);
                    if (backupFileName === undefined) {
                        // Error resolving the backup, so don't touch the file
                        (0, log_js_1.logError)(new Error('FileHistory: Error finding the backup file to apply'));
                        (0, index_js_1.logEvent)('tengu_file_history_rewind_restore_file_failed', {
                            dryRun: false,
                        });
                        return [3 /*break*/, 12];
                    }
                    if (!(backupFileName === null)) return [3 /*break*/, 7];
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, (0, promises_1.unlink)(filePath)];
                case 4:
                    _b.sent();
                    (0, debug_js_1.logForDebugging)("FileHistory: [Rewind] Deleted ".concat(filePath));
                    filesChanged.push(filePath);
                    return [3 /*break*/, 6];
                case 5:
                    e_2 = _b.sent();
                    if (!(0, errors_js_1.isENOENT)(e_2))
                        throw e_2;
                    return [3 /*break*/, 6];
                case 6: return [3 /*break*/, 12];
                case 7: return [4 /*yield*/, checkOriginFileChanged(filePath, backupFileName)];
                case 8:
                    if (!_b.sent()) return [3 /*break*/, 10];
                    return [4 /*yield*/, restoreBackup(filePath, backupFileName)];
                case 9:
                    _b.sent();
                    (0, debug_js_1.logForDebugging)("FileHistory: [Rewind] Restored ".concat(filePath, " from ").concat(backupFileName));
                    filesChanged.push(filePath);
                    _b.label = 10;
                case 10: return [3 /*break*/, 12];
                case 11:
                    error_6 = _b.sent();
                    (0, log_js_1.logError)(error_6);
                    (0, index_js_1.logEvent)('tengu_file_history_rewind_restore_file_failed', {
                        dryRun: false,
                    });
                    return [3 /*break*/, 12];
                case 12:
                    _i++;
                    return [3 /*break*/, 1];
                case 13: return [2 /*return*/, filesChanged];
            }
        });
    });
}
/**
 * Checks if the original file has been changed compared to the backup file.
 * Optionally reuses a pre-fetched stat for the original file (when the caller
 * already stat'd it to check existence, we avoid a second syscall).
 *
 * Exported for testing.
 */
function checkOriginFileChanged(originalFile, backupFileName, originalStatsHint) {
    return __awaiter(this, void 0, void 0, function () {
        var backupPath, originalStats, e_3, backupStats, e_4;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    backupPath = resolveBackupPath(backupFileName);
                    originalStats = originalStatsHint !== null && originalStatsHint !== void 0 ? originalStatsHint : null;
                    if (!!originalStats) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.stat)(originalFile)];
                case 2:
                    originalStats = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_3 = _a.sent();
                    if (!(0, errors_js_1.isENOENT)(e_3))
                        return [2 /*return*/, true];
                    return [3 /*break*/, 4];
                case 4:
                    backupStats = null;
                    _a.label = 5;
                case 5:
                    _a.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, (0, promises_1.stat)(backupPath)];
                case 6:
                    backupStats = _a.sent();
                    return [3 /*break*/, 8];
                case 7:
                    e_4 = _a.sent();
                    if (!(0, errors_js_1.isENOENT)(e_4))
                        return [2 /*return*/, true];
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/, compareStatsAndContent(originalStats, backupStats, function () { return __awaiter(_this, void 0, void 0, function () {
                        var _a, originalContent, backupContent, _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    _c.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, Promise.all([
                                            (0, promises_1.readFile)(originalFile, 'utf-8'),
                                            (0, promises_1.readFile)(backupPath, 'utf-8'),
                                        ])];
                                case 1:
                                    _a = _c.sent(), originalContent = _a[0], backupContent = _a[1];
                                    return [2 /*return*/, originalContent !== backupContent];
                                case 2:
                                    _b = _c.sent();
                                    // File deleted between stat and read -> treat as changed.
                                    return [2 /*return*/, true];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); })];
            }
        });
    });
}
/**
 * Shared stat/content comparison logic for sync and async change checks.
 * Returns true if the file has changed relative to the backup.
 */
function compareStatsAndContent(originalStats, backupStats, compareContent) {
    // One exists, one missing -> changed
    if ((originalStats === null) !== (backupStats === null)) {
        return true;
    }
    // Both missing -> no change
    if (originalStats === null || backupStats === null) {
        return false;
    }
    // Check file stats like permission and file size
    if (originalStats.mode !== backupStats.mode ||
        originalStats.size !== backupStats.size) {
        return true;
    }
    // This is an optimization that depends on the correct setting of the modified
    // time. If the original file's modified time was before the backup time, then
    // we can skip the file content comparison.
    if (originalStats.mtimeMs < backupStats.mtimeMs) {
        return false;
    }
    // Use the more expensive file content comparison. The callback handles its
    // own read errors — a try/catch here is dead for async callbacks anyway.
    return compareContent();
}
/**
 * Computes the number of lines changed in the diff.
 */
function computeDiffStatsForFile(originalFile, backupFileName) {
    return __awaiter(this, void 0, void 0, function () {
        var filesChanged, insertions, deletions, backupPath, _a, originalContent, backupContent, changes, error_7;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    filesChanged = [];
                    insertions = 0;
                    deletions = 0;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    backupPath = backupFileName
                        ? resolveBackupPath(backupFileName)
                        : undefined;
                    return [4 /*yield*/, Promise.all([
                            readFileAsyncOrNull(originalFile),
                            backupPath ? readFileAsyncOrNull(backupPath) : null,
                        ])];
                case 2:
                    _a = _b.sent(), originalContent = _a[0], backupContent = _a[1];
                    if (originalContent === null && backupContent === null) {
                        return [2 /*return*/, {
                                filesChanged: filesChanged,
                                insertions: insertions,
                                deletions: deletions,
                            }];
                    }
                    filesChanged.push(originalFile);
                    changes = (0, diff_1.diffLines)(originalContent !== null && originalContent !== void 0 ? originalContent : '', backupContent !== null && backupContent !== void 0 ? backupContent : '');
                    changes.forEach(function (c) {
                        if (c.added) {
                            insertions += c.count || 0;
                        }
                        if (c.removed) {
                            deletions += c.count || 0;
                        }
                    });
                    return [3 /*break*/, 4];
                case 3:
                    error_7 = _b.sent();
                    (0, log_js_1.logError)(new Error("FileHistory: Error generating diffStats: ".concat(error_7)));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, {
                        filesChanged: filesChanged,
                        insertions: insertions,
                        deletions: deletions,
                    }];
            }
        });
    });
}
function getBackupFileName(filePath, version) {
    var fileNameHash = (0, crypto_1.createHash)('sha256')
        .update(filePath)
        .digest('hex')
        .slice(0, 16);
    return "".concat(fileNameHash, "@v").concat(version);
}
function resolveBackupPath(backupFileName, sessionId) {
    var configDir = (0, envUtils_js_1.getClaudeConfigHomeDir)();
    return (0, path_1.join)(configDir, 'file-history', sessionId || (0, state_js_1.getSessionId)(), backupFileName);
}
/**
 * Creates a backup of the file at filePath. If the file does not exist
 * (ENOENT), records a null backup (file-did-not-exist marker). All IO is
 * async. Lazy mkdir: tries copyFile first, creates the directory on ENOENT.
 */
function createBackup(filePath, version) {
    return __awaiter(this, void 0, void 0, function () {
        var backupFileName, backupPath, srcStats, e_5, e_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (filePath === null) {
                        return [2 /*return*/, { backupFileName: null, version: version, backupTime: new Date() }];
                    }
                    backupFileName = getBackupFileName(filePath, version);
                    backupPath = resolveBackupPath(backupFileName);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.stat)(filePath)];
                case 2:
                    srcStats = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_5 = _a.sent();
                    if ((0, errors_js_1.isENOENT)(e_5)) {
                        return [2 /*return*/, { backupFileName: null, version: version, backupTime: new Date() }];
                    }
                    throw e_5;
                case 4:
                    _a.trys.push([4, 6, , 9]);
                    return [4 /*yield*/, (0, promises_1.copyFile)(filePath, backupPath)];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 9];
                case 6:
                    e_6 = _a.sent();
                    if (!(0, errors_js_1.isENOENT)(e_6))
                        throw e_6;
                    return [4 /*yield*/, (0, promises_1.mkdir)((0, path_1.dirname)(backupPath), { recursive: true })];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, (0, promises_1.copyFile)(filePath, backupPath)];
                case 8:
                    _a.sent();
                    return [3 /*break*/, 9];
                case 9: 
                // Preserve file permissions on the backup.
                return [4 /*yield*/, (0, promises_1.chmod)(backupPath, srcStats.mode)];
                case 10:
                    // Preserve file permissions on the backup.
                    _a.sent();
                    (0, index_js_1.logEvent)('tengu_file_history_backup_file_created', {
                        version: version,
                        fileSize: srcStats.size,
                    });
                    return [2 /*return*/, {
                            backupFileName: backupFileName,
                            version: version,
                            backupTime: new Date(),
                        }];
            }
        });
    });
}
/**
 * Restores a file from its backup path with proper directory creation and permissions.
 * Lazy mkdir: tries copyFile first, creates the directory on ENOENT.
 */
function restoreBackup(filePath, backupFileName) {
    return __awaiter(this, void 0, void 0, function () {
        var backupPath, backupStats, e_7, e_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    backupPath = resolveBackupPath(backupFileName);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.stat)(backupPath)];
                case 2:
                    backupStats = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_7 = _a.sent();
                    if ((0, errors_js_1.isENOENT)(e_7)) {
                        (0, index_js_1.logEvent)('tengu_file_history_rewind_restore_file_failed', {});
                        (0, log_js_1.logError)(new Error("FileHistory: [Rewind] Backup file not found: ".concat(backupPath)));
                        return [2 /*return*/];
                    }
                    throw e_7;
                case 4:
                    _a.trys.push([4, 6, , 9]);
                    return [4 /*yield*/, (0, promises_1.copyFile)(backupPath, filePath)];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 9];
                case 6:
                    e_8 = _a.sent();
                    if (!(0, errors_js_1.isENOENT)(e_8))
                        throw e_8;
                    return [4 /*yield*/, (0, promises_1.mkdir)((0, path_1.dirname)(filePath), { recursive: true })];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, (0, promises_1.copyFile)(backupPath, filePath)];
                case 8:
                    _a.sent();
                    return [3 /*break*/, 9];
                case 9: 
                // Restore the file permissions
                return [4 /*yield*/, (0, promises_1.chmod)(filePath, backupStats.mode)];
                case 10:
                    // Restore the file permissions
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Gets the first (earliest) backup version for a file, used when rewinding
 * to a target backup point where the file has not been tracked yet.
 *
 * @returns The backup file name for the first version, or null if the file
 * did not exist in the first version, or undefined if we cannot find a
 * first version at all
 */
function getBackupFileNameFirstVersion(trackingPath, state) {
    for (var _i = 0, _a = state.snapshots; _i < _a.length; _i++) {
        var snapshot = _a[_i];
        var backup = snapshot.trackedFileBackups[trackingPath];
        if (backup !== undefined && backup.version === 1) {
            // This can be either a file name or null, with null meaning the file
            // did not exist in the first version.
            return backup.backupFileName;
        }
    }
    // The undefined means there was an error resolving the first version.
    return undefined;
}
/**
 * Use the relative path as the key to reduce session storage space for tracking.
 */
function maybeShortenFilePath(filePath) {
    if (!(0, path_1.isAbsolute)(filePath)) {
        return filePath;
    }
    var cwd = (0, state_js_1.getOriginalCwd)();
    if (filePath.startsWith(cwd)) {
        return (0, path_1.relative)(cwd, filePath);
    }
    return filePath;
}
function maybeExpandFilePath(filePath) {
    if ((0, path_1.isAbsolute)(filePath)) {
        return filePath;
    }
    return (0, path_1.join)((0, state_js_1.getOriginalCwd)(), filePath);
}
/**
 * Restores file history snapshot state for a given log option.
 */
function fileHistoryRestoreStateFromLog(fileHistorySnapshots, onUpdateState) {
    if (!fileHistoryEnabled()) {
        return;
    }
    // Make a copy of the snapshots as we migrate from absolute path to
    // shortened relative tracking path.
    var snapshots = [];
    // Rebuild the tracked files from the snapshots
    var trackedFiles = new Set();
    for (var _i = 0, fileHistorySnapshots_1 = fileHistorySnapshots; _i < fileHistorySnapshots_1.length; _i++) {
        var snapshot = fileHistorySnapshots_1[_i];
        var trackedFileBackups = {};
        for (var _a = 0, _b = Object.entries(snapshot.trackedFileBackups); _a < _b.length; _a++) {
            var _c = _b[_a], path = _c[0], backup = _c[1];
            var trackingPath = maybeShortenFilePath(path);
            trackedFiles.add(trackingPath);
            trackedFileBackups[trackingPath] = backup;
        }
        snapshots.push(__assign(__assign({}, snapshot), { trackedFileBackups: trackedFileBackups }));
    }
    onUpdateState({
        snapshots: snapshots,
        trackedFiles: trackedFiles,
        snapshotSequence: snapshots.length,
    });
}
/**
 * Copy file history snapshots for a given log option.
 */
function copyFileHistoryForResume(log) {
    return __awaiter(this, void 0, void 0, function () {
        var fileHistorySnapshots, lastMessage, previousSessionId, sessionId, newBackupDir_1, failedSnapshots_1, error_8;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!fileHistoryEnabled()) {
                        return [2 /*return*/];
                    }
                    fileHistorySnapshots = log.fileHistorySnapshots;
                    if (!fileHistorySnapshots || log.messages.length === 0) {
                        return [2 /*return*/];
                    }
                    lastMessage = log.messages[log.messages.length - 1];
                    previousSessionId = lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.sessionId;
                    if (!previousSessionId) {
                        (0, log_js_1.logError)(new Error("FileHistory: Failed to copy backups on restore (no previous session id)"));
                        return [2 /*return*/];
                    }
                    sessionId = (0, state_js_1.getSessionId)();
                    if (previousSessionId === sessionId) {
                        (0, debug_js_1.logForDebugging)("FileHistory: No need to copy file history for resuming with same session id: ".concat(sessionId));
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    newBackupDir_1 = (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), 'file-history', sessionId);
                    return [4 /*yield*/, (0, promises_1.mkdir)(newBackupDir_1, { recursive: true })
                        // Migrate all backup files from the previous session to current session.
                        // Process all snapshots in parallel; within each snapshot, links also run in parallel.
                    ];
                case 2:
                    _a.sent();
                    failedSnapshots_1 = 0;
                    return [4 /*yield*/, Promise.allSettled(fileHistorySnapshots.map(function (snapshot) { return __awaiter(_this, void 0, void 0, function () {
                            var backupEntries, results, copyFailed;
                            var _this = this;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        backupEntries = Object.values(snapshot.trackedFileBackups).filter(function (backup) {
                                            return backup.backupFileName !== null;
                                        });
                                        return [4 /*yield*/, Promise.allSettled(backupEntries.map(function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
                                                var oldBackupPath, newBackupPath, e_9, code, copyErr_1;
                                                var backupFileName = _b.backupFileName;
                                                return __generator(this, function (_c) {
                                                    switch (_c.label) {
                                                        case 0:
                                                            oldBackupPath = resolveBackupPath(backupFileName, previousSessionId);
                                                            newBackupPath = (0, path_1.join)(newBackupDir_1, backupFileName);
                                                            _c.label = 1;
                                                        case 1:
                                                            _c.trys.push([1, 3, , 8]);
                                                            return [4 /*yield*/, (0, promises_1.link)(oldBackupPath, newBackupPath)];
                                                        case 2:
                                                            _c.sent();
                                                            return [3 /*break*/, 8];
                                                        case 3:
                                                            e_9 = _c.sent();
                                                            code = (0, errors_js_1.getErrnoCode)(e_9);
                                                            if (code === 'EEXIST') {
                                                                // Already migrated, skip
                                                                return [2 /*return*/];
                                                            }
                                                            if (code === 'ENOENT') {
                                                                (0, log_js_1.logError)(new Error("FileHistory: Failed to copy backup ".concat(backupFileName, " on restore (backup file does not exist in ").concat(previousSessionId, ")")));
                                                                throw e_9;
                                                            }
                                                            (0, log_js_1.logError)(new Error("FileHistory: Error hard linking backup file from previous session"));
                                                            _c.label = 4;
                                                        case 4:
                                                            _c.trys.push([4, 6, , 7]);
                                                            return [4 /*yield*/, (0, promises_1.copyFile)(oldBackupPath, newBackupPath)];
                                                        case 5:
                                                            _c.sent();
                                                            return [3 /*break*/, 7];
                                                        case 6:
                                                            copyErr_1 = _c.sent();
                                                            (0, log_js_1.logError)(new Error("FileHistory: Error copying over backup from previous session"));
                                                            throw copyErr_1;
                                                        case 7: return [3 /*break*/, 8];
                                                        case 8:
                                                            (0, debug_js_1.logForDebugging)("FileHistory: Copied backup ".concat(backupFileName, " from session ").concat(previousSessionId, " to ").concat(sessionId));
                                                            return [2 /*return*/];
                                                    }
                                                });
                                            }); }))];
                                    case 1:
                                        results = _a.sent();
                                        copyFailed = results.some(function (r) { return r.status === 'rejected'; });
                                        // Record the snapshot only if we have successfully migrated the backup files
                                        if (!copyFailed) {
                                            void (0, sessionStorage_js_1.recordFileHistorySnapshot)(snapshot.messageId, snapshot, false).catch(function (_) {
                                                (0, log_js_1.logError)(new Error("FileHistory: Failed to record copy backup snapshot"));
                                            });
                                        }
                                        else {
                                            failedSnapshots_1++;
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 3:
                    _a.sent();
                    if (failedSnapshots_1 > 0) {
                        (0, index_js_1.logEvent)('tengu_file_history_resume_copy_failed', {
                            numSnapshots: fileHistorySnapshots.length,
                            failedSnapshots: failedSnapshots_1,
                        });
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_8 = _a.sent();
                    (0, log_js_1.logError)(error_8);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Notifies VSCode about files that have changed between snapshots.
 * Compares the previous snapshot with the new snapshot and sends file_updated
 * notifications for any files whose content has changed.
 * Fire-and-forget (void-dispatched from fileHistoryMakeSnapshot).
 */
function notifyVscodeSnapshotFilesUpdated(oldState, newState) {
    return __awaiter(this, void 0, void 0, function () {
        var oldSnapshot, newSnapshot, _i, _a, trackingPath, filePath, oldBackup, newBackup, oldContent, backupPath, newContent, backupPath;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    oldSnapshot = oldState.snapshots.at(-1);
                    newSnapshot = newState.snapshots.at(-1);
                    if (!newSnapshot) {
                        return [2 /*return*/];
                    }
                    _i = 0, _a = newState.trackedFiles;
                    _b.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 7];
                    trackingPath = _a[_i];
                    filePath = maybeExpandFilePath(trackingPath);
                    oldBackup = oldSnapshot === null || oldSnapshot === void 0 ? void 0 : oldSnapshot.trackedFileBackups[trackingPath];
                    newBackup = newSnapshot.trackedFileBackups[trackingPath];
                    // Skip if both backups reference the same version (no change)
                    if ((oldBackup === null || oldBackup === void 0 ? void 0 : oldBackup.backupFileName) === (newBackup === null || newBackup === void 0 ? void 0 : newBackup.backupFileName) &&
                        (oldBackup === null || oldBackup === void 0 ? void 0 : oldBackup.version) === (newBackup === null || newBackup === void 0 ? void 0 : newBackup.version)) {
                        return [3 /*break*/, 6];
                    }
                    oldContent = null;
                    if (!(oldBackup === null || oldBackup === void 0 ? void 0 : oldBackup.backupFileName)) return [3 /*break*/, 3];
                    backupPath = resolveBackupPath(oldBackup.backupFileName);
                    return [4 /*yield*/, readFileAsyncOrNull(backupPath)];
                case 2:
                    oldContent = _b.sent();
                    _b.label = 3;
                case 3:
                    newContent = null;
                    if (!(newBackup === null || newBackup === void 0 ? void 0 : newBackup.backupFileName)) return [3 /*break*/, 5];
                    backupPath = resolveBackupPath(newBackup.backupFileName);
                    return [4 /*yield*/, readFileAsyncOrNull(backupPath)];
                case 4:
                    newContent = _b.sent();
                    _b.label = 5;
                case 5:
                    // If newBackup?.backupFileName === null, the file was deleted; newContent stays null.
                    // Only notify if content actually changed
                    if (oldContent !== newContent) {
                        (0, vscodeSdkMcp_js_1.notifyVscodeFileUpdated)(filePath, oldContent, newContent);
                    }
                    _b.label = 6;
                case 6:
                    _i++;
                    return [3 /*break*/, 1];
                case 7: return [2 /*return*/];
            }
        });
    });
}
/** Async read that swallows all errors and returns null (best-effort). */
function readFileAsyncOrNull(path) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, promises_1.readFile)(path, 'utf-8')];
                case 1: return [2 /*return*/, _b.sent()];
                case 2:
                    _a = _b.sent();
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
var ENABLE_DUMP_STATE = false;
function maybeDumpStateForDebug(state) {
    if (ENABLE_DUMP_STATE) {
        // biome-ignore lint/suspicious/noConsole:: intentional console output
        console.error((0, util_1.inspect)(state, false, 5));
    }
}
