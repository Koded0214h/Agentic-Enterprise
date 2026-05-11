"use strict";
/**
 * PID-Based Version Locking
 *
 * This module provides PID-based locking for running Claude Code versions.
 * Unlike mtime-based locking (which can hold locks for 30 days after a crash),
 * PID-based locking can immediately detect when a process is no longer running.
 *
 * Lock files contain JSON with the PID and metadata, and staleness is determined
 * by checking if the process is still alive.
 */
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
exports.isPidBasedLockingEnabled = isPidBasedLockingEnabled;
exports.isProcessRunning = isProcessRunning;
exports.readLockContent = readLockContent;
exports.isLockActive = isLockActive;
exports.tryAcquireLock = tryAcquireLock;
exports.acquireProcessLifetimeLock = acquireProcessLifetimeLock;
exports.withLock = withLock;
exports.getAllLockInfo = getAllLockInfo;
exports.cleanupStaleLocks = cleanupStaleLocks;
var path_1 = require("path");
var growthbook_js_1 = require("../../services/analytics/growthbook.js");
var debug_js_1 = require("../debug.js");
var envUtils_js_1 = require("../envUtils.js");
var errors_js_1 = require("../errors.js");
var fsOperations_js_1 = require("../fsOperations.js");
var genericProcessUtils_js_1 = require("../genericProcessUtils.js");
var log_js_1 = require("../log.js");
var slowOperations_js_1 = require("../slowOperations.js");
/**
 * Check if PID-based version locking is enabled.
 * When disabled, falls back to mtime-based locking (30-day timeout).
 *
 * Controlled by GrowthBook gate with local override:
 * - Set ENABLE_PID_BASED_VERSION_LOCKING=true to force-enable
 * - Set ENABLE_PID_BASED_VERSION_LOCKING=false to force-disable
 * - If unset, GrowthBook gate (tengu_pid_based_version_locking) controls rollout
 */
function isPidBasedLockingEnabled() {
    var envVar = process.env.ENABLE_PID_BASED_VERSION_LOCKING;
    // If env var is explicitly set, respect it
    if ((0, envUtils_js_1.isEnvTruthy)(envVar)) {
        return true;
    }
    if ((0, envUtils_js_1.isEnvDefinedFalsy)(envVar)) {
        return false;
    }
    // GrowthBook controls gradual rollout (returns false for external users)
    return (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_pid_based_version_locking', false);
}
// Fallback stale timeout (2 hours) - used when PID check is inconclusive
// This is much shorter than the previous 30-day timeout but still allows
// for edge cases like network filesystems where PID check might fail
var FALLBACK_STALE_MS = 2 * 60 * 60 * 1000;
/**
 * Check if a process with the given PID is currently running
 * Uses signal 0 which doesn't actually send a signal but checks if we can
 */
function isProcessRunning(pid) {
    // PID 0 is special - it refers to the current process group, not a real process
    // PID 1 is init/systemd and is always running but shouldn't be considered for locks
    if (pid <= 1) {
        return false;
    }
    try {
        process.kill(pid, 0);
        return true;
    }
    catch (_a) {
        return false;
    }
}
/**
 * Validate that a running process is actually a Claude process
 * This helps mitigate PID reuse issues
 */
function isClaudeProcess(pid, expectedExecPath) {
    if (!isProcessRunning(pid)) {
        return false;
    }
    // If the PID matches our current process, we know it's valid
    // This handles test environments where the command might not contain 'claude'
    if (pid === process.pid) {
        return true;
    }
    try {
        var command = (0, genericProcessUtils_js_1.getProcessCommand)(pid);
        if (!command) {
            // If we can't get the command, trust the PID check
            // This is conservative - we'd rather not delete a running version
            return true;
        }
        // Check if the command contains 'claude' or the expected exec path
        var normalizedCommand = command.toLowerCase();
        var normalizedExecPath = expectedExecPath.toLowerCase();
        return (normalizedCommand.includes('claude') ||
            normalizedCommand.includes(normalizedExecPath));
    }
    catch (_a) {
        // If command check fails, trust the PID check
        return true;
    }
}
/**
 * Read and parse a lock file's content
 */
function readLockContent(lockFilePath) {
    var fs = (0, fsOperations_js_1.getFsImplementation)();
    try {
        var content = fs.readFileSync(lockFilePath, { encoding: 'utf8' });
        if (!content || content.trim() === '') {
            return null;
        }
        var parsed = (0, slowOperations_js_1.jsonParse)(content);
        // Validate required fields
        if (typeof parsed.pid !== 'number' || !parsed.version || !parsed.execPath) {
            return null;
        }
        return parsed;
    }
    catch (_a) {
        return null;
    }
}
/**
 * Check if a lock file represents an active lock (process still running)
 */
function isLockActive(lockFilePath) {
    var content = readLockContent(lockFilePath);
    if (!content) {
        return false;
    }
    var pid = content.pid, execPath = content.execPath;
    // Primary check: is the process running?
    if (!isProcessRunning(pid)) {
        return false;
    }
    // Secondary validation: is it actually a Claude process?
    // This helps with PID reuse scenarios
    if (!isClaudeProcess(pid, execPath)) {
        (0, debug_js_1.logForDebugging)("Lock PID ".concat(pid, " is running but does not appear to be Claude - treating as stale"));
        return false;
    }
    // Fallback: if the lock is very old (> 2 hours) and we can't validate
    // the command, be conservative and consider it potentially stale
    // This handles edge cases like network filesystems
    var fs = (0, fsOperations_js_1.getFsImplementation)();
    try {
        var stats = fs.statSync(lockFilePath);
        var age = Date.now() - stats.mtimeMs;
        if (age > FALLBACK_STALE_MS) {
            // Double-check that we can still see the process
            if (!isProcessRunning(pid)) {
                return false;
            }
        }
    }
    catch (_a) {
        // If we can't stat the file, trust the PID check
    }
    return true;
}
/**
 * Write lock content to a file atomically
 */
function writeLockFile(lockFilePath, content) {
    var fs = (0, fsOperations_js_1.getFsImplementation)();
    var tempPath = "".concat(lockFilePath, ".tmp.").concat(process.pid, ".").concat(Date.now());
    try {
        (0, slowOperations_js_1.writeFileSync_DEPRECATED)(tempPath, (0, slowOperations_js_1.jsonStringify)(content, null, 2), {
            encoding: 'utf8',
            flush: true,
        });
        fs.renameSync(tempPath, lockFilePath);
    }
    catch (error) {
        // Clean up temp file on failure (best-effort)
        try {
            fs.unlinkSync(tempPath);
        }
        catch (_a) {
            // Ignore cleanup errors (ENOENT expected if write failed before file creation)
        }
        throw error;
    }
}
/**
 * Try to acquire a lock on a version file
 * Returns a release function if successful, null if the lock is already held
 */
function tryAcquireLock(versionPath, lockFilePath) {
    return __awaiter(this, void 0, void 0, function () {
        var fs, versionName, existingContent, lockContent, verifyContent;
        return __generator(this, function (_a) {
            fs = (0, fsOperations_js_1.getFsImplementation)();
            versionName = (0, path_1.basename)(versionPath);
            // Check if there's an existing active lock (including by our own process)
            // Use isLockActive for consistency with cleanup - it checks both PID running AND
            // validates it's actually a Claude process (to handle PID reuse scenarios)
            if (isLockActive(lockFilePath)) {
                existingContent = readLockContent(lockFilePath);
                (0, debug_js_1.logForDebugging)("Cannot acquire lock for ".concat(versionName, " - held by PID ").concat(existingContent === null || existingContent === void 0 ? void 0 : existingContent.pid));
                return [2 /*return*/, null];
            }
            lockContent = {
                pid: process.pid,
                version: versionName,
                execPath: process.execPath,
                acquiredAt: Date.now(),
            };
            try {
                writeLockFile(lockFilePath, lockContent);
                verifyContent = readLockContent(lockFilePath);
                if ((verifyContent === null || verifyContent === void 0 ? void 0 : verifyContent.pid) !== process.pid) {
                    // Another process won the race
                    return [2 /*return*/, null];
                }
                (0, debug_js_1.logForDebugging)("Acquired PID lock for ".concat(versionName, " (PID ").concat(process.pid, ")"));
                // Return release function
                return [2 /*return*/, function () {
                        try {
                            // Only release if we still own the lock
                            var currentContent = readLockContent(lockFilePath);
                            if ((currentContent === null || currentContent === void 0 ? void 0 : currentContent.pid) === process.pid) {
                                fs.unlinkSync(lockFilePath);
                                (0, debug_js_1.logForDebugging)("Released PID lock for ".concat(versionName));
                            }
                        }
                        catch (error) {
                            (0, debug_js_1.logForDebugging)("Failed to release lock for ".concat(versionName, ": ").concat(error));
                        }
                    }];
            }
            catch (error) {
                (0, debug_js_1.logForDebugging)("Failed to acquire lock for ".concat(versionName, ": ").concat(error));
                return [2 /*return*/, null];
            }
            return [2 /*return*/];
        });
    });
}
/**
 * Acquire a lock and hold it for the lifetime of the process
 * This is used for locking the currently running version
 */
function acquireProcessLifetimeLock(versionPath, lockFilePath) {
    return __awaiter(this, void 0, void 0, function () {
        var release, cleanup;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, tryAcquireLock(versionPath, lockFilePath)];
                case 1:
                    release = _a.sent();
                    if (!release) {
                        return [2 /*return*/, false];
                    }
                    cleanup = function () {
                        try {
                            release();
                        }
                        catch (_a) {
                            // Ignore errors during process exit
                        }
                    };
                    process.on('exit', cleanup);
                    process.on('SIGINT', cleanup);
                    process.on('SIGTERM', cleanup);
                    // Don't call release() - we want to hold the lock until process exits
                    return [2 /*return*/, true];
            }
        });
    });
}
/**
 * Execute a callback while holding a lock
 * Returns true if the callback executed, false if lock couldn't be acquired
 */
function withLock(versionPath, lockFilePath, callback) {
    return __awaiter(this, void 0, void 0, function () {
        var release;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, tryAcquireLock(versionPath, lockFilePath)];
                case 1:
                    release = _a.sent();
                    if (!release) {
                        return [2 /*return*/, false];
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, , 4, 5]);
                    return [4 /*yield*/, callback()];
                case 3:
                    _a.sent();
                    return [2 /*return*/, true];
                case 4:
                    release();
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Get information about all version locks for diagnostics
 */
function getAllLockInfo(locksDir) {
    var fs = (0, fsOperations_js_1.getFsImplementation)();
    var lockInfos = [];
    try {
        var lockFiles = fs
            .readdirStringSync(locksDir)
            .filter(function (f) { return f.endsWith('.lock'); });
        for (var _i = 0, lockFiles_1 = lockFiles; _i < lockFiles_1.length; _i++) {
            var lockFile = lockFiles_1[_i];
            var lockFilePath = (0, path_1.join)(locksDir, lockFile);
            var content = readLockContent(lockFilePath);
            if (content) {
                lockInfos.push({
                    version: content.version,
                    pid: content.pid,
                    isProcessRunning: isProcessRunning(content.pid),
                    execPath: content.execPath,
                    acquiredAt: new Date(content.acquiredAt),
                    lockFilePath: lockFilePath,
                });
            }
        }
    }
    catch (error) {
        if ((0, errors_js_1.isENOENT)(error)) {
            return lockInfos;
        }
        (0, log_js_1.logError)((0, errors_js_1.toError)(error));
    }
    return lockInfos;
}
/**
 * Clean up stale locks (locks where the process is no longer running)
 * Returns the number of locks cleaned up
 *
 * Handles both:
 * - PID-based locks (files containing JSON with PID)
 * - Legacy proper-lockfile locks (directories created by mtime-based locking)
 */
function cleanupStaleLocks(locksDir) {
    var fs = (0, fsOperations_js_1.getFsImplementation)();
    var cleanedCount = 0;
    try {
        var lockEntries = fs
            .readdirStringSync(locksDir)
            .filter(function (f) { return f.endsWith('.lock'); });
        for (var _i = 0, lockEntries_1 = lockEntries; _i < lockEntries_1.length; _i++) {
            var lockEntry = lockEntries_1[_i];
            var lockFilePath = (0, path_1.join)(locksDir, lockEntry);
            try {
                var stats = fs.lstatSync(lockFilePath);
                if (stats.isDirectory()) {
                    // Legacy proper-lockfile directory lock - always remove when PID-based
                    // locking is enabled since these are from a different locking mechanism
                    fs.rmSync(lockFilePath, { recursive: true, force: true });
                    cleanedCount++;
                    (0, debug_js_1.logForDebugging)("Cleaned up legacy directory lock: ".concat(lockEntry));
                }
                else if (!isLockActive(lockFilePath)) {
                    // PID-based file lock with no running process
                    fs.unlinkSync(lockFilePath);
                    cleanedCount++;
                    (0, debug_js_1.logForDebugging)("Cleaned up stale lock: ".concat(lockEntry));
                }
            }
            catch (_a) {
                // Ignore individual cleanup errors
            }
        }
    }
    catch (error) {
        if ((0, errors_js_1.isENOENT)(error)) {
            return 0;
        }
        (0, log_js_1.logError)((0, errors_js_1.toError)(error));
    }
    return cleanedCount;
}
