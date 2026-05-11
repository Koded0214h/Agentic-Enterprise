"use strict";
/**
 * ProcessManager - PID files, signal handlers, and child process lifecycle management
 *
 * Extracted from worker-service.ts monolith to provide centralized process management.
 * Handles:
 * - PID file management for daemon coordination
 * - Signal handler registration for graceful shutdown
 * - Child process enumeration and cleanup (especially for Windows zombie port fix)
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
exports.resolveWorkerRuntimePath = resolveWorkerRuntimePath;
exports.writePidFile = writePidFile;
exports.readPidFile = readPidFile;
exports.removePidFile = removePidFile;
exports.getPlatformTimeout = getPlatformTimeout;
exports.getChildProcesses = getChildProcesses;
exports.forceKillProcess = forceKillProcess;
exports.waitForProcessesExit = waitForProcessesExit;
exports.parseElapsedTime = parseElapsedTime;
exports.cleanupOrphanedProcesses = cleanupOrphanedProcesses;
exports.aggressiveStartupCleanup = aggressiveStartupCleanup;
exports.runOneTimeChromaMigration = runOneTimeChromaMigration;
exports.spawnDaemon = spawnDaemon;
exports.isProcessAlive = isProcessAlive;
exports.isPidFileRecent = isPidFileRecent;
exports.touchPidFile = touchPidFile;
exports.cleanStalePidFile = cleanStalePidFile;
exports.createSignalHandler = createSignalHandler;
var path_1 = require("path");
var os_1 = require("os");
var fs_1 = require("fs");
var child_process_1 = require("child_process");
var util_1 = require("util");
var logger_js_1 = require("../../utils/logger.js");
var hook_constants_js_1 = require("../../shared/hook-constants.js");
var env_sanitizer_js_1 = require("../../supervisor/env-sanitizer.js");
var index_js_1 = require("../../supervisor/index.js");
var execAsync = (0, util_1.promisify)(child_process_1.exec);
// Standard paths for PID file management
var DATA_DIR = path_1.default.join((0, os_1.homedir)(), '.claude-mem');
var PID_FILE = path_1.default.join(DATA_DIR, 'worker.pid');
// Orphaned process cleanup patterns and thresholds
// These are claude-mem processes that can accumulate if not properly terminated
var ORPHAN_PROCESS_PATTERNS = [
    'mcp-server.cjs', // Main MCP server process
    'worker-service.cjs', // Background worker daemon
    'chroma-mcp' // ChromaDB MCP subprocess
];
// Only kill processes older than this to avoid killing the current session
var ORPHAN_MAX_AGE_MINUTES = 30;
function isBunExecutablePath(executablePath) {
    if (!executablePath)
        return false;
    return /(^|[\\/])bun(\.exe)?$/i.test(executablePath.trim());
}
function lookupBinaryInPath(binaryName, platform) {
    var command = platform === 'win32' ? "where ".concat(binaryName) : "which ".concat(binaryName);
    try {
        var output = (0, child_process_1.execSync)(command, {
            stdio: ['ignore', 'pipe', 'ignore'],
            encoding: 'utf-8',
            windowsHide: true
        });
        var firstMatch = output
            .split(/\r?\n/)
            .map(function (line) { return line.trim(); })
            .find(function (line) { return line.length > 0; });
        return firstMatch || null;
    }
    catch (_a) {
        return null;
    }
}
/**
 * Resolve the runtime executable for spawning the worker daemon.
 *
 * Windows must prefer Bun because worker-service.cjs imports bun:sqlite,
 * which is unavailable in Node.js.
 */
function resolveWorkerRuntimePath(options) {
    var _a, _b, _c, _d, _e, _f;
    if (options === void 0) { options = {}; }
    var platform = (_a = options.platform) !== null && _a !== void 0 ? _a : process.platform;
    var execPath = (_b = options.execPath) !== null && _b !== void 0 ? _b : process.execPath;
    // Non-Windows currently relies on the runtime that launched worker-service.
    if (platform !== 'win32') {
        return execPath;
    }
    // If already running under Bun, reuse it directly.
    if (isBunExecutablePath(execPath)) {
        return execPath;
    }
    var env = (_c = options.env) !== null && _c !== void 0 ? _c : process.env;
    var homeDirectory = (_d = options.homeDirectory) !== null && _d !== void 0 ? _d : (0, os_1.homedir)();
    var pathExists = (_e = options.pathExists) !== null && _e !== void 0 ? _e : fs_1.existsSync;
    var lookupInPath = (_f = options.lookupInPath) !== null && _f !== void 0 ? _f : lookupBinaryInPath;
    var candidatePaths = [
        env.BUN,
        env.BUN_PATH,
        path_1.default.join(homeDirectory, '.bun', 'bin', 'bun.exe'),
        path_1.default.join(homeDirectory, '.bun', 'bin', 'bun'),
        env.USERPROFILE ? path_1.default.join(env.USERPROFILE, '.bun', 'bin', 'bun.exe') : undefined,
        env.LOCALAPPDATA ? path_1.default.join(env.LOCALAPPDATA, 'bun', 'bun.exe') : undefined,
        env.LOCALAPPDATA ? path_1.default.join(env.LOCALAPPDATA, 'bun', 'bin', 'bun.exe') : undefined,
    ];
    for (var _i = 0, candidatePaths_1 = candidatePaths; _i < candidatePaths_1.length; _i++) {
        var candidate = candidatePaths_1[_i];
        var normalized = candidate === null || candidate === void 0 ? void 0 : candidate.trim();
        if (!normalized)
            continue;
        if (isBunExecutablePath(normalized) && pathExists(normalized)) {
            return normalized;
        }
        // Allow command-style values from env (e.g. BUN=bun)
        if (normalized.toLowerCase() === 'bun') {
            return normalized;
        }
    }
    return lookupInPath('bun', platform);
}
/**
 * Write PID info to the standard PID file location
 */
function writePidFile(info) {
    (0, fs_1.mkdirSync)(DATA_DIR, { recursive: true });
    (0, fs_1.writeFileSync)(PID_FILE, JSON.stringify(info, null, 2));
}
/**
 * Read PID info from the standard PID file location
 * Returns null if file doesn't exist or is corrupted
 */
function readPidFile() {
    if (!(0, fs_1.existsSync)(PID_FILE))
        return null;
    try {
        return JSON.parse((0, fs_1.readFileSync)(PID_FILE, 'utf-8'));
    }
    catch (error) {
        logger_js_1.logger.warn('SYSTEM', 'Failed to parse PID file', { path: PID_FILE }, error);
        return null;
    }
}
/**
 * Remove the PID file (called during shutdown)
 */
function removePidFile() {
    if (!(0, fs_1.existsSync)(PID_FILE))
        return;
    try {
        (0, fs_1.unlinkSync)(PID_FILE);
    }
    catch (error) {
        // [ANTI-PATTERN IGNORED]: Cleanup function - PID file removal failure is non-critical
        logger_js_1.logger.warn('SYSTEM', 'Failed to remove PID file', { path: PID_FILE }, error);
    }
}
/**
 * Get platform-adjusted timeout for worker-side socket operations (2.0x on Windows).
 *
 * Note: Two platform multiplier functions exist intentionally:
 * - getTimeout() in hook-constants.ts uses 1.5x for hook-side operations (fast path)
 * - getPlatformTimeout() here uses 2.0x for worker-side socket operations (slower path)
 */
function getPlatformTimeout(baseMs) {
    var WINDOWS_MULTIPLIER = 2.0;
    return process.platform === 'win32' ? Math.round(baseMs * WINDOWS_MULTIPLIER) : baseMs;
}
/**
 * Get all child process PIDs (Windows-specific)
 * Used for cleanup to prevent zombie ports when parent exits
 */
function getChildProcesses(parentPid) {
    return __awaiter(this, void 0, void 0, function () {
        var cmd, stdout, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (process.platform !== 'win32') {
                        return [2 /*return*/, []];
                    }
                    // SECURITY: Validate PID is a positive integer to prevent command injection
                    if (!Number.isInteger(parentPid) || parentPid <= 0) {
                        logger_js_1.logger.warn('SYSTEM', 'Invalid parent PID for child process enumeration', { parentPid: parentPid });
                        return [2 /*return*/, []];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    cmd = "powershell -NoProfile -NonInteractive -Command \"Get-CimInstance Win32_Process -Filter 'ParentProcessId=".concat(parentPid, "' | Select-Object -ExpandProperty ProcessId\"");
                    return [4 /*yield*/, execAsync(cmd, { timeout: hook_constants_js_1.HOOK_TIMEOUTS.POWERSHELL_COMMAND, windowsHide: true })];
                case 2:
                    stdout = (_a.sent()).stdout;
                    return [2 /*return*/, stdout
                            .split('\n')
                            .map(function (line) { return line.trim(); })
                            .filter(function (line) { return line.length > 0 && /^\d+$/.test(line); })
                            .map(function (line) { return parseInt(line, 10); })
                            .filter(function (pid) { return pid > 0; })];
                case 3:
                    error_1 = _a.sent();
                    // Shutdown cleanup - failure is non-critical, continue without child process cleanup
                    logger_js_1.logger.error('SYSTEM', 'Failed to enumerate child processes', { parentPid: parentPid }, error_1);
                    return [2 /*return*/, []];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Force kill a process by PID
 * Windows: uses taskkill /F /T to kill process tree
 * Unix: uses SIGKILL
 */
function forceKillProcess(pid) {
    return __awaiter(this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // SECURITY: Validate PID is a positive integer to prevent command injection
                    if (!Number.isInteger(pid) || pid <= 0) {
                        logger_js_1.logger.warn('SYSTEM', 'Invalid PID for force kill', { pid: pid });
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    if (!(process.platform === 'win32')) return [3 /*break*/, 3];
                    // /T kills entire process tree, /F forces termination
                    return [4 /*yield*/, execAsync("taskkill /PID ".concat(pid, " /T /F"), { timeout: hook_constants_js_1.HOOK_TIMEOUTS.POWERSHELL_COMMAND, windowsHide: true })];
                case 2:
                    // /T kills entire process tree, /F forces termination
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    process.kill(pid, 'SIGKILL');
                    _a.label = 4;
                case 4:
                    logger_js_1.logger.info('SYSTEM', 'Killed process', { pid: pid });
                    return [3 /*break*/, 6];
                case 5:
                    error_2 = _a.sent();
                    // [ANTI-PATTERN IGNORED]: Shutdown cleanup - process already exited, continue
                    logger_js_1.logger.debug('SYSTEM', 'Process already exited during force kill', { pid: pid }, error_2);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}
/**
 * Wait for processes to fully exit
 */
function waitForProcessesExit(pids, timeoutMs) {
    return __awaiter(this, void 0, void 0, function () {
        var start, stillAlive;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    start = Date.now();
                    _a.label = 1;
                case 1:
                    if (!(Date.now() - start < timeoutMs)) return [3 /*break*/, 3];
                    stillAlive = pids.filter(function (pid) {
                        try {
                            process.kill(pid, 0);
                            return true;
                        }
                        catch (error) {
                            // [ANTI-PATTERN IGNORED]: Tight loop checking 100s of PIDs every 100ms during cleanup
                            return false;
                        }
                    });
                    if (stillAlive.length === 0) {
                        logger_js_1.logger.info('SYSTEM', 'All child processes exited');
                        return [2 /*return*/];
                    }
                    logger_js_1.logger.debug('SYSTEM', 'Waiting for processes to exit', { stillAlive: stillAlive });
                    return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 100); })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 1];
                case 3:
                    logger_js_1.logger.warn('SYSTEM', 'Timeout waiting for child processes to exit');
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Parse process elapsed time from ps etime format: [[DD-]HH:]MM:SS
 * Returns age in minutes, or -1 if parsing fails
 */
function parseElapsedTime(etime) {
    if (!etime || etime.trim() === '')
        return -1;
    var cleaned = etime.trim();
    var totalMinutes = 0;
    // DD-HH:MM:SS format
    var dayMatch = cleaned.match(/^(\d+)-(\d+):(\d+):(\d+)$/);
    if (dayMatch) {
        totalMinutes = parseInt(dayMatch[1], 10) * 24 * 60 +
            parseInt(dayMatch[2], 10) * 60 +
            parseInt(dayMatch[3], 10);
        return totalMinutes;
    }
    // HH:MM:SS format
    var hourMatch = cleaned.match(/^(\d+):(\d+):(\d+)$/);
    if (hourMatch) {
        totalMinutes = parseInt(hourMatch[1], 10) * 60 + parseInt(hourMatch[2], 10);
        return totalMinutes;
    }
    // MM:SS format
    var minMatch = cleaned.match(/^(\d+):(\d+)$/);
    if (minMatch) {
        return parseInt(minMatch[1], 10);
    }
    return -1;
}
/**
 * Clean up orphaned claude-mem processes from previous worker sessions
 *
 * Targets mcp-server.cjs, worker-service.cjs, and chroma-mcp processes
 * that survived a previous daemon crash. Only kills processes older than
 * ORPHAN_MAX_AGE_MINUTES to avoid killing the current session.
 *
 * The periodic ProcessRegistry reaper handles in-session orphans;
 * this function handles cross-session orphans at startup.
 */
function cleanupOrphanedProcesses() {
    return __awaiter(this, void 0, void 0, function () {
        var isWindows, currentPid, pidsToKill, wqlPatternConditions, cmd, stdout, processes, processList, now, _i, processList_1, proc, pid, creationMatch, creationTime, ageMinutes, patternRegex, stdout, lines, _a, lines_1, line, match, pid, etime, ageMinutes, error_3, _b, pidsToKill_1, pid, _c, pidsToKill_2, pid;
        var _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    isWindows = process.platform === 'win32';
                    currentPid = process.pid;
                    pidsToKill = [];
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 6, , 7]);
                    if (!isWindows) return [3 /*break*/, 3];
                    wqlPatternConditions = ORPHAN_PROCESS_PATTERNS
                        .map(function (p) { return "CommandLine LIKE '%".concat(p, "%'"); })
                        .join(' OR ');
                    cmd = "powershell -NoProfile -NonInteractive -Command \"Get-CimInstance Win32_Process -Filter '(".concat(wqlPatternConditions, ") AND ProcessId != ").concat(currentPid, "' | Select-Object ProcessId, CreationDate | ConvertTo-Json\"");
                    return [4 /*yield*/, execAsync(cmd, { timeout: hook_constants_js_1.HOOK_TIMEOUTS.POWERSHELL_COMMAND, windowsHide: true })];
                case 2:
                    stdout = (_e.sent()).stdout;
                    if (!stdout.trim() || stdout.trim() === 'null') {
                        logger_js_1.logger.debug('SYSTEM', 'No orphaned claude-mem processes found (Windows)');
                        return [2 /*return*/];
                    }
                    processes = JSON.parse(stdout);
                    processList = Array.isArray(processes) ? processes : [processes];
                    now = Date.now();
                    for (_i = 0, processList_1 = processList; _i < processList_1.length; _i++) {
                        proc = processList_1[_i];
                        pid = proc.ProcessId;
                        // SECURITY: Validate PID is positive integer and not current process
                        if (!Number.isInteger(pid) || pid <= 0 || pid === currentPid)
                            continue;
                        creationMatch = (_d = proc.CreationDate) === null || _d === void 0 ? void 0 : _d.match(/\/Date\((\d+)\)\//);
                        if (creationMatch) {
                            creationTime = parseInt(creationMatch[1], 10);
                            ageMinutes = (now - creationTime) / (1000 * 60);
                            if (ageMinutes >= ORPHAN_MAX_AGE_MINUTES) {
                                pidsToKill.push(pid);
                                logger_js_1.logger.debug('SYSTEM', 'Found orphaned process', { pid: pid, ageMinutes: Math.round(ageMinutes) });
                            }
                        }
                    }
                    return [3 /*break*/, 5];
                case 3:
                    patternRegex = ORPHAN_PROCESS_PATTERNS.join('|');
                    return [4 /*yield*/, execAsync("ps -eo pid,etime,command | grep -E \"".concat(patternRegex, "\" | grep -v grep || true"))];
                case 4:
                    stdout = (_e.sent()).stdout;
                    if (!stdout.trim()) {
                        logger_js_1.logger.debug('SYSTEM', 'No orphaned claude-mem processes found (Unix)');
                        return [2 /*return*/];
                    }
                    lines = stdout.trim().split('\n');
                    for (_a = 0, lines_1 = lines; _a < lines_1.length; _a++) {
                        line = lines_1[_a];
                        match = line.trim().match(/^(\d+)\s+(\S+)\s+(.*)$/);
                        if (!match)
                            continue;
                        pid = parseInt(match[1], 10);
                        etime = match[2];
                        // SECURITY: Validate PID is positive integer and not current process
                        if (!Number.isInteger(pid) || pid <= 0 || pid === currentPid)
                            continue;
                        ageMinutes = parseElapsedTime(etime);
                        if (ageMinutes >= ORPHAN_MAX_AGE_MINUTES) {
                            pidsToKill.push(pid);
                            logger_js_1.logger.debug('SYSTEM', 'Found orphaned process', { pid: pid, ageMinutes: ageMinutes, command: match[3].substring(0, 80) });
                        }
                    }
                    _e.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_3 = _e.sent();
                    // Orphan cleanup is non-critical - log and continue
                    logger_js_1.logger.error('SYSTEM', 'Failed to enumerate orphaned processes', {}, error_3);
                    return [2 /*return*/];
                case 7:
                    if (pidsToKill.length === 0) {
                        return [2 /*return*/];
                    }
                    logger_js_1.logger.info('SYSTEM', 'Cleaning up orphaned claude-mem processes', {
                        platform: isWindows ? 'Windows' : 'Unix',
                        count: pidsToKill.length,
                        pids: pidsToKill,
                        maxAgeMinutes: ORPHAN_MAX_AGE_MINUTES
                    });
                    // Kill all found processes
                    if (isWindows) {
                        for (_b = 0, pidsToKill_1 = pidsToKill; _b < pidsToKill_1.length; _b++) {
                            pid = pidsToKill_1[_b];
                            // SECURITY: Double-check PID validation before using in taskkill command
                            if (!Number.isInteger(pid) || pid <= 0) {
                                logger_js_1.logger.warn('SYSTEM', 'Skipping invalid PID', { pid: pid });
                                continue;
                            }
                            try {
                                (0, child_process_1.execSync)("taskkill /PID ".concat(pid, " /T /F"), { timeout: hook_constants_js_1.HOOK_TIMEOUTS.POWERSHELL_COMMAND, stdio: 'ignore', windowsHide: true });
                            }
                            catch (error) {
                                // [ANTI-PATTERN IGNORED]: Cleanup loop - process may have exited, continue to next PID
                                logger_js_1.logger.debug('SYSTEM', 'Failed to kill process, may have already exited', { pid: pid }, error);
                            }
                        }
                    }
                    else {
                        for (_c = 0, pidsToKill_2 = pidsToKill; _c < pidsToKill_2.length; _c++) {
                            pid = pidsToKill_2[_c];
                            try {
                                process.kill(pid, 'SIGKILL');
                            }
                            catch (error) {
                                // [ANTI-PATTERN IGNORED]: Cleanup loop - process may have exited, continue to next PID
                                logger_js_1.logger.debug('SYSTEM', 'Process already exited', { pid: pid }, error);
                            }
                        }
                    }
                    logger_js_1.logger.info('SYSTEM', 'Orphaned processes cleaned up', { count: pidsToKill.length });
                    return [2 /*return*/];
            }
        });
    });
}
// Patterns that should be killed immediately at startup (no age gate)
// These are child processes that should not outlive their parent worker
var AGGRESSIVE_CLEANUP_PATTERNS = ['worker-service.cjs', 'chroma-mcp'];
// Patterns that keep the age-gated threshold (may be legitimately running)
var AGE_GATED_CLEANUP_PATTERNS = ['mcp-server.cjs'];
/**
 * Aggressive startup cleanup for orphaned claude-mem processes.
 *
 * Unlike cleanupOrphanedProcesses() which age-gates everything at 30 minutes,
 * this function kills worker-service.cjs and chroma-mcp processes immediately
 * (they should not outlive their parent worker). Only mcp-server.cjs keeps
 * the age threshold since it may be legitimately running.
 *
 * Called once at daemon startup.
 */
function aggressiveStartupCleanup() {
    return __awaiter(this, void 0, void 0, function () {
        var isWindows, currentPid, pidsToKill, allPatterns, wqlPatternConditions, cmd, stdout, processes, processList, now, _loop_1, _i, processList_2, proc, patternRegex, stdout, lines, _loop_2, _a, lines_2, line, error_4, _b, pidsToKill_3, pid, _c, pidsToKill_4, pid;
        var _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    isWindows = process.platform === 'win32';
                    currentPid = process.pid;
                    pidsToKill = [];
                    allPatterns = __spreadArray(__spreadArray([], AGGRESSIVE_CLEANUP_PATTERNS, true), AGE_GATED_CLEANUP_PATTERNS, true);
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 6, , 7]);
                    if (!isWindows) return [3 /*break*/, 3];
                    wqlPatternConditions = allPatterns
                        .map(function (p) { return "CommandLine LIKE '%".concat(p, "%'"); })
                        .join(' OR ');
                    cmd = "powershell -NoProfile -NonInteractive -Command \"Get-CimInstance Win32_Process -Filter '(".concat(wqlPatternConditions, ") AND ProcessId != ").concat(currentPid, "' | Select-Object ProcessId, CommandLine, CreationDate | ConvertTo-Json\"");
                    return [4 /*yield*/, execAsync(cmd, { timeout: hook_constants_js_1.HOOK_TIMEOUTS.POWERSHELL_COMMAND, windowsHide: true })];
                case 2:
                    stdout = (_e.sent()).stdout;
                    if (!stdout.trim() || stdout.trim() === 'null') {
                        logger_js_1.logger.debug('SYSTEM', 'No orphaned claude-mem processes found (Windows)');
                        return [2 /*return*/];
                    }
                    processes = JSON.parse(stdout);
                    processList = Array.isArray(processes) ? processes : [processes];
                    now = Date.now();
                    _loop_1 = function (proc) {
                        var pid = proc.ProcessId;
                        if (!Number.isInteger(pid) || pid <= 0 || pid === currentPid)
                            return "continue";
                        var commandLine = proc.CommandLine || '';
                        var isAggressive = AGGRESSIVE_CLEANUP_PATTERNS.some(function (p) { return commandLine.includes(p); });
                        if (isAggressive) {
                            // Kill immediately — no age check
                            pidsToKill.push(pid);
                            logger_js_1.logger.debug('SYSTEM', 'Found orphaned process (aggressive)', { pid: pid, commandLine: commandLine.substring(0, 80) });
                        }
                        else {
                            // Age-gated: only kill if older than threshold
                            var creationMatch = (_d = proc.CreationDate) === null || _d === void 0 ? void 0 : _d.match(/\/Date\((\d+)\)\//);
                            if (creationMatch) {
                                var creationTime = parseInt(creationMatch[1], 10);
                                var ageMinutes = (now - creationTime) / (1000 * 60);
                                if (ageMinutes >= ORPHAN_MAX_AGE_MINUTES) {
                                    pidsToKill.push(pid);
                                    logger_js_1.logger.debug('SYSTEM', 'Found orphaned process (age-gated)', { pid: pid, ageMinutes: Math.round(ageMinutes) });
                                }
                            }
                        }
                    };
                    for (_i = 0, processList_2 = processList; _i < processList_2.length; _i++) {
                        proc = processList_2[_i];
                        _loop_1(proc);
                    }
                    return [3 /*break*/, 5];
                case 3:
                    patternRegex = allPatterns.join('|');
                    return [4 /*yield*/, execAsync("ps -eo pid,etime,command | grep -E \"".concat(patternRegex, "\" | grep -v grep || true"))];
                case 4:
                    stdout = (_e.sent()).stdout;
                    if (!stdout.trim()) {
                        logger_js_1.logger.debug('SYSTEM', 'No orphaned claude-mem processes found (Unix)');
                        return [2 /*return*/];
                    }
                    lines = stdout.trim().split('\n');
                    _loop_2 = function (line) {
                        var match = line.trim().match(/^(\d+)\s+(\S+)\s+(.*)$/);
                        if (!match)
                            return "continue";
                        var pid = parseInt(match[1], 10);
                        var etime = match[2];
                        var command = match[3];
                        if (!Number.isInteger(pid) || pid <= 0 || pid === currentPid)
                            return "continue";
                        var isAggressive = AGGRESSIVE_CLEANUP_PATTERNS.some(function (p) { return command.includes(p); });
                        if (isAggressive) {
                            // Kill immediately — no age check
                            pidsToKill.push(pid);
                            logger_js_1.logger.debug('SYSTEM', 'Found orphaned process (aggressive)', { pid: pid, command: command.substring(0, 80) });
                        }
                        else {
                            // Age-gated: only kill if older than threshold
                            var ageMinutes = parseElapsedTime(etime);
                            if (ageMinutes >= ORPHAN_MAX_AGE_MINUTES) {
                                pidsToKill.push(pid);
                                logger_js_1.logger.debug('SYSTEM', 'Found orphaned process (age-gated)', { pid: pid, ageMinutes: ageMinutes, command: command.substring(0, 80) });
                            }
                        }
                    };
                    for (_a = 0, lines_2 = lines; _a < lines_2.length; _a++) {
                        line = lines_2[_a];
                        _loop_2(line);
                    }
                    _e.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_4 = _e.sent();
                    logger_js_1.logger.error('SYSTEM', 'Failed to enumerate orphaned processes during aggressive cleanup', {}, error_4);
                    return [2 /*return*/];
                case 7:
                    if (pidsToKill.length === 0) {
                        return [2 /*return*/];
                    }
                    logger_js_1.logger.info('SYSTEM', 'Aggressive startup cleanup: killing orphaned processes', {
                        platform: isWindows ? 'Windows' : 'Unix',
                        count: pidsToKill.length,
                        pids: pidsToKill
                    });
                    if (isWindows) {
                        for (_b = 0, pidsToKill_3 = pidsToKill; _b < pidsToKill_3.length; _b++) {
                            pid = pidsToKill_3[_b];
                            if (!Number.isInteger(pid) || pid <= 0)
                                continue;
                            try {
                                (0, child_process_1.execSync)("taskkill /PID ".concat(pid, " /T /F"), { timeout: hook_constants_js_1.HOOK_TIMEOUTS.POWERSHELL_COMMAND, stdio: 'ignore', windowsHide: true });
                            }
                            catch (error) {
                                logger_js_1.logger.debug('SYSTEM', 'Failed to kill process, may have already exited', { pid: pid }, error);
                            }
                        }
                    }
                    else {
                        for (_c = 0, pidsToKill_4 = pidsToKill; _c < pidsToKill_4.length; _c++) {
                            pid = pidsToKill_4[_c];
                            try {
                                process.kill(pid, 'SIGKILL');
                            }
                            catch (error) {
                                logger_js_1.logger.debug('SYSTEM', 'Process already exited', { pid: pid }, error);
                            }
                        }
                    }
                    logger_js_1.logger.info('SYSTEM', 'Aggressive startup cleanup complete', { count: pidsToKill.length });
                    return [2 /*return*/];
            }
        });
    });
}
var CHROMA_MIGRATION_MARKER_FILENAME = '.chroma-cleaned-v10.3';
/**
 * One-time chroma data wipe for users upgrading from versions with duplicate
 * worker bugs that could corrupt chroma data. Since chroma is always rebuildable
 * from SQLite (via backfillAllProjects), this is safe.
 *
 * Checks for a marker file. If absent, wipes ~/.claude-mem/chroma/ and writes
 * the marker. If present, skips. Idempotent.
 *
 * @param dataDirectory - Override for DATA_DIR (used in tests)
 */
function runOneTimeChromaMigration(dataDirectory) {
    var effectiveDataDir = dataDirectory !== null && dataDirectory !== void 0 ? dataDirectory : DATA_DIR;
    var markerPath = path_1.default.join(effectiveDataDir, CHROMA_MIGRATION_MARKER_FILENAME);
    var chromaDir = path_1.default.join(effectiveDataDir, 'chroma');
    if ((0, fs_1.existsSync)(markerPath)) {
        logger_js_1.logger.debug('SYSTEM', 'Chroma migration marker exists, skipping wipe');
        return;
    }
    logger_js_1.logger.warn('SYSTEM', 'Running one-time chroma data wipe (upgrade from pre-v10.3)', { chromaDir: chromaDir });
    if ((0, fs_1.existsSync)(chromaDir)) {
        (0, fs_1.rmSync)(chromaDir, { recursive: true, force: true });
        logger_js_1.logger.info('SYSTEM', 'Chroma data directory removed', { chromaDir: chromaDir });
    }
    // Write marker file to prevent future wipes
    (0, fs_1.mkdirSync)(effectiveDataDir, { recursive: true });
    (0, fs_1.writeFileSync)(markerPath, new Date().toISOString());
    logger_js_1.logger.info('SYSTEM', 'Chroma migration marker written', { markerPath: markerPath });
}
/**
 * Spawn a detached daemon process
 * Returns the child PID or undefined if spawn failed
 *
 * On Windows, uses PowerShell Start-Process with -WindowStyle Hidden to spawn
 * a truly independent process without console popups. Unlike WMIC, PowerShell
 * inherits environment variables from the parent process.
 *
 * On Unix, uses standard detached spawn.
 *
 * PID file is written by the worker itself after listen() succeeds,
 * not by the spawner (race-free, works on all platforms).
 */
function spawnDaemon(scriptPath, port, extraEnv) {
    if (extraEnv === void 0) { extraEnv = {}; }
    var isWindows = process.platform === 'win32';
    (0, index_js_1.getSupervisor)().assertCanSpawn('worker daemon');
    var env = (0, env_sanitizer_js_1.sanitizeEnv)(__assign(__assign(__assign({}, process.env), { CLAUDE_MEM_WORKER_PORT: String(port) }), extraEnv));
    if (isWindows) {
        // Use PowerShell Start-Process to spawn a hidden, independent process
        // Unlike WMIC, PowerShell inherits environment variables from parent
        // -WindowStyle Hidden prevents console popup
        var runtimePath = resolveWorkerRuntimePath();
        if (!runtimePath) {
            logger_js_1.logger.error('SYSTEM', 'Failed to locate Bun runtime for Windows worker spawn');
            return undefined;
        }
        // Use -EncodedCommand to avoid all shell quoting issues with spaces in paths
        var psScript = "Start-Process -FilePath '".concat(runtimePath.replace(/'/g, "''"), "' -ArgumentList @('").concat(scriptPath.replace(/'/g, "''"), "','--daemon') -WindowStyle Hidden");
        var encodedCommand = Buffer.from(psScript, 'utf16le').toString('base64');
        try {
            (0, child_process_1.execSync)("powershell -NoProfile -EncodedCommand ".concat(encodedCommand), {
                stdio: 'ignore',
                windowsHide: true,
                env: env
            });
            return 0;
        }
        catch (error) {
            // APPROVED OVERRIDE: Windows daemon spawn is best-effort; log and let callers fall back to health checks/retry flow.
            logger_js_1.logger.error('SYSTEM', 'Failed to spawn worker daemon on Windows', { runtimePath: runtimePath }, error);
            return undefined;
        }
    }
    // Unix: Use setsid to create a new session, fully detaching from the
    // controlling terminal. This prevents SIGHUP from reaching the daemon
    // even if the in-process SIGHUP handler somehow fails (belt-and-suspenders).
    // Fall back to standard detached spawn if setsid is not available.
    var setsidPath = '/usr/bin/setsid';
    if ((0, fs_1.existsSync)(setsidPath)) {
        var child_1 = (0, child_process_1.spawn)(setsidPath, [process.execPath, scriptPath, '--daemon'], {
            detached: true,
            stdio: 'ignore',
            env: env
        });
        if (child_1.pid === undefined) {
            return undefined;
        }
        child_1.unref();
        return child_1.pid;
    }
    // Fallback: standard detached spawn (macOS, systems without setsid)
    var child = (0, child_process_1.spawn)(process.execPath, [scriptPath, '--daemon'], {
        detached: true,
        stdio: 'ignore',
        env: env
    });
    if (child.pid === undefined) {
        return undefined;
    }
    child.unref();
    return child.pid;
}
/**
 * Check if a process with the given PID is alive.
 *
 * Uses the process.kill(pid, 0) idiom: signal 0 doesn't send a signal,
 * it just checks if the process exists and is reachable.
 *
 * EPERM is treated as "alive" because it means the process exists but
 * belongs to a different user/session (common in multi-user setups).
 * PID 0 (Windows sentinel for unknown PID) is treated as alive.
 */
function isProcessAlive(pid) {
    // PID 0 is the Windows sentinel value — process was spawned but PID unknown
    if (pid === 0)
        return true;
    // Invalid PIDs are not alive
    if (!Number.isInteger(pid) || pid < 0)
        return false;
    try {
        process.kill(pid, 0);
        return true;
    }
    catch (error) {
        var code = error.code;
        // EPERM = process exists but different user/session — treat as alive
        if (code === 'EPERM')
            return true;
        // ESRCH = no such process — it's dead
        return false;
    }
}
/**
 * Check if the PID file was written recently (within thresholdMs).
 *
 * Used to coordinate restarts across concurrent sessions: if the PID file
 * was recently written, another session likely just restarted the worker.
 * Callers should poll /api/health instead of attempting their own restart.
 *
 * @param thresholdMs - Maximum age in ms to consider "recent" (default: 15000)
 * @returns true if the PID file exists and was modified within thresholdMs
 */
function isPidFileRecent(thresholdMs) {
    if (thresholdMs === void 0) { thresholdMs = 15000; }
    try {
        var stats = (0, fs_1.statSync)(PID_FILE);
        return (Date.now() - stats.mtimeMs) < thresholdMs;
    }
    catch (_a) {
        return false;
    }
}
/**
 * Touch the PID file to update its mtime without changing contents.
 * Used after a restart to signal other sessions that a restart just completed.
 */
function touchPidFile() {
    try {
        if (!(0, fs_1.existsSync)(PID_FILE))
            return;
        var now = new Date();
        (0, fs_1.utimesSync)(PID_FILE, now, now);
    }
    catch (_a) {
        // Best-effort — failure to touch doesn't affect correctness
    }
}
/**
 * Read the PID file and remove it if the recorded process is dead (stale).
 *
 * This is a cheap operation: one filesystem read + one signal-0 check.
 * Called at the top of ensureWorkerStarted() to clean up after WSL2
 * hibernate, OOM kills, or other ungraceful worker deaths.
 */
function cleanStalePidFile() {
    return (0, index_js_1.validateWorkerPidFile)({ logAlive: false });
}
/**
 * Create signal handler factory for graceful shutdown
 * Returns a handler function that can be passed to process.on('SIGTERM') etc.
 */
function createSignalHandler(shutdownFn, isShuttingDownRef) {
    var _this = this;
    return function (signal) { return __awaiter(_this, void 0, void 0, function () {
        var error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (isShuttingDownRef.value) {
                        logger_js_1.logger.warn('SYSTEM', "Received ".concat(signal, " but shutdown already in progress"));
                        return [2 /*return*/];
                    }
                    isShuttingDownRef.value = true;
                    logger_js_1.logger.info('SYSTEM', "Received ".concat(signal, ", shutting down..."));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, shutdownFn()];
                case 2:
                    _a.sent();
                    process.exit(0);
                    return [3 /*break*/, 4];
                case 3:
                    error_5 = _a.sent();
                    // Top-level signal handler - log any shutdown error and exit
                    logger_js_1.logger.error('SYSTEM', 'Error during shutdown', {}, error_5);
                    // Exit gracefully: Windows Terminal won't keep tab open on exit 0
                    // Even on shutdown errors, exit cleanly to prevent tab accumulation
                    process.exit(0);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
}
