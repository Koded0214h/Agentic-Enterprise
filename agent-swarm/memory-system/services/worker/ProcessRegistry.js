"use strict";
/**
 * ProcessRegistry: Track spawned Claude subprocesses
 *
 * Fixes Issue #737: Claude haiku subprocesses don't terminate properly,
 * causing zombie process accumulation (user reported 155 processes / 51GB RAM).
 *
 * Root causes:
 * 1. SDK's SpawnedProcess interface hides subprocess PIDs
 * 2. deleteSession() doesn't verify subprocess exit before cleanup
 * 3. abort() is fire-and-forget with no confirmation
 *
 * Solution:
 * - Use SDK's spawnClaudeCodeProcess option to capture PIDs
 * - Track all spawned processes with session association
 * - Verify exit on session deletion with timeout + SIGKILL escalation
 * - Safety net orphan reaper runs every 5 minutes
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
exports.registerProcess = registerProcess;
exports.unregisterProcess = unregisterProcess;
exports.getProcessBySession = getProcessBySession;
exports.getActiveCount = getActiveCount;
exports.waitForSlot = waitForSlot;
exports.getActiveProcesses = getActiveProcesses;
exports.ensureProcessExit = ensureProcessExit;
exports.reapOrphanedProcesses = reapOrphanedProcesses;
exports.createPidCapturingSpawn = createPidCapturingSpawn;
exports.startOrphanReaper = startOrphanReaper;
var child_process_1 = require("child_process");
var util_1 = require("util");
var logger_js_1 = require("../../utils/logger.js");
var env_sanitizer_js_1 = require("../../supervisor/env-sanitizer.js");
var index_js_1 = require("../../supervisor/index.js");
var execAsync = (0, util_1.promisify)(child_process_1.exec);
function getTrackedProcesses() {
    return (0, index_js_1.getSupervisor)().getRegistry()
        .getAll()
        .filter(function (record) { return record.type === 'sdk'; })
        .map(function (record) {
        var processRef = (0, index_js_1.getSupervisor)().getRegistry().getRuntimeProcess(record.id);
        if (!processRef) {
            return null;
        }
        return {
            pid: record.pid,
            sessionDbId: Number(record.sessionId),
            spawnedAt: Date.parse(record.startedAt),
            process: processRef
        };
    })
        .filter(function (value) { return value !== null; });
}
/**
 * Register a spawned process in the registry
 */
function registerProcess(pid, sessionDbId, process) {
    (0, index_js_1.getSupervisor)().registerProcess("sdk:".concat(sessionDbId, ":").concat(pid), {
        pid: pid,
        type: 'sdk',
        sessionId: sessionDbId,
        startedAt: new Date().toISOString()
    }, process);
    logger_js_1.logger.info('PROCESS', "Registered PID ".concat(pid, " for session ").concat(sessionDbId), { pid: pid, sessionDbId: sessionDbId });
}
/**
 * Unregister a process from the registry and notify pool waiters
 */
function unregisterProcess(pid) {
    for (var _i = 0, _a = (0, index_js_1.getSupervisor)().getRegistry().getByPid(pid); _i < _a.length; _i++) {
        var record = _a[_i];
        if (record.type === 'sdk') {
            (0, index_js_1.getSupervisor)().unregisterProcess(record.id);
        }
    }
    logger_js_1.logger.debug('PROCESS', "Unregistered PID ".concat(pid), { pid: pid });
    // Notify waiters that a pool slot may be available
    notifySlotAvailable();
}
/**
 * Get process info by session ID
 * Warns if multiple processes found (indicates race condition)
 */
function getProcessBySession(sessionDbId) {
    var matches = getTrackedProcesses().filter(function (info) { return info.sessionDbId === sessionDbId; });
    if (matches.length > 1) {
        logger_js_1.logger.warn('PROCESS', "Multiple processes found for session ".concat(sessionDbId), {
            count: matches.length,
            pids: matches.map(function (m) { return m.pid; })
        });
    }
    return matches[0];
}
/**
 * Get count of active processes in the registry
 */
function getActiveCount() {
    return (0, index_js_1.getSupervisor)().getRegistry().getAll().filter(function (record) { return record.type === 'sdk'; }).length;
}
// Waiters for pool slots - resolved when a process exits and frees a slot
var slotWaiters = [];
/**
 * Notify waiters that a slot has freed up
 */
function notifySlotAvailable() {
    var waiter = slotWaiters.shift();
    if (waiter)
        waiter();
}
/**
 * Wait for a pool slot to become available (promise-based, not polling)
 * @param maxConcurrent Max number of concurrent agents
 * @param timeoutMs Max time to wait before giving up
 */
var TOTAL_PROCESS_HARD_CAP = 10;
function waitForSlot(maxConcurrent_1) {
    return __awaiter(this, arguments, void 0, function (maxConcurrent, timeoutMs) {
        var activeCount;
        if (timeoutMs === void 0) { timeoutMs = 60000; }
        return __generator(this, function (_a) {
            activeCount = getActiveCount();
            if (activeCount >= TOTAL_PROCESS_HARD_CAP) {
                throw new Error("Hard cap exceeded: ".concat(activeCount, " processes in registry (cap=").concat(TOTAL_PROCESS_HARD_CAP, "). Refusing to spawn more."));
            }
            if (activeCount < maxConcurrent)
                return [2 /*return*/];
            logger_js_1.logger.info('PROCESS', "Pool limit reached (".concat(activeCount, "/").concat(maxConcurrent, "), waiting for slot..."));
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var timeout = setTimeout(function () {
                        var idx = slotWaiters.indexOf(onSlot);
                        if (idx >= 0)
                            slotWaiters.splice(idx, 1);
                        reject(new Error("Timed out waiting for agent pool slot after ".concat(timeoutMs, "ms")));
                    }, timeoutMs);
                    var onSlot = function () {
                        clearTimeout(timeout);
                        if (getActiveCount() < maxConcurrent) {
                            resolve();
                        }
                        else {
                            // Still full, re-queue
                            slotWaiters.push(onSlot);
                        }
                    };
                    slotWaiters.push(onSlot);
                })];
        });
    });
}
/**
 * Get all active PIDs (for debugging)
 */
function getActiveProcesses() {
    var now = Date.now();
    return getTrackedProcesses().map(function (info) { return ({
        pid: info.pid,
        sessionDbId: info.sessionDbId,
        ageMs: now - info.spawnedAt
    }); });
}
/**
 * Wait for a process to exit with timeout, escalating to SIGKILL if needed
 * Uses event-based waiting instead of polling to avoid CPU overhead
 */
function ensureProcessExit(tracked_1) {
    return __awaiter(this, arguments, void 0, function (tracked, timeoutMs) {
        var pid, proc, exitPromise, timeoutPromise, sigkillExitPromise, sigkillTimeout;
        if (timeoutMs === void 0) { timeoutMs = 5000; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pid = tracked.pid, proc = tracked.process;
                    // Already exited? Only trust exitCode, NOT proc.killed
                    // proc.killed only means Node sent a signal — the process can still be alive
                    if (proc.exitCode !== null) {
                        unregisterProcess(pid);
                        return [2 /*return*/];
                    }
                    exitPromise = new Promise(function (resolve) {
                        proc.once('exit', function () { return resolve(); });
                    });
                    timeoutPromise = new Promise(function (resolve) {
                        setTimeout(resolve, timeoutMs);
                    });
                    return [4 /*yield*/, Promise.race([exitPromise, timeoutPromise])];
                case 1:
                    _a.sent();
                    // Check if exited gracefully — only trust exitCode
                    if (proc.exitCode !== null) {
                        unregisterProcess(pid);
                        return [2 /*return*/];
                    }
                    // Timeout: escalate to SIGKILL
                    logger_js_1.logger.warn('PROCESS', "PID ".concat(pid, " did not exit after ").concat(timeoutMs, "ms, sending SIGKILL"), { pid: pid, timeoutMs: timeoutMs });
                    try {
                        proc.kill('SIGKILL');
                    }
                    catch (_b) {
                        // Already dead
                    }
                    sigkillExitPromise = new Promise(function (resolve) {
                        proc.once('exit', function () { return resolve(); });
                    });
                    sigkillTimeout = new Promise(function (resolve) {
                        setTimeout(resolve, 1000);
                    });
                    return [4 /*yield*/, Promise.race([sigkillExitPromise, sigkillTimeout])];
                case 2:
                    _a.sent();
                    unregisterProcess(pid);
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Kill idle daemon children (claude processes spawned by worker-service)
 *
 * These are SDK-spawned claude processes that completed their work but
 * didn't terminate properly. They remain as children of the worker-service
 * daemon, consuming memory without doing useful work.
 *
 * Criteria for cleanup:
 * - Process name is "claude"
 * - Parent PID is the worker-service daemon (this process)
 * - Process has 0% CPU (idle)
 * - Process has been running for more than 2 minutes
 */
function killIdleDaemonChildren() {
    return __awaiter(this, void 0, void 0, function () {
        var daemonPid, killed, stdout, _i, _a, line, parts, pidStr, ppidStr, cpuStr, etime, pid, ppid, cpu, minutes, dayMatch, hourMatch, minMatch, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (process.platform === 'win32') {
                        // Windows: Different process model, skip for now
                        return [2 /*return*/, 0];
                    }
                    daemonPid = process.pid;
                    killed = 0;
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, execAsync('ps -eo pid,ppid,%cpu,etime,comm 2>/dev/null | grep "claude$" || true')];
                case 2:
                    stdout = (_c.sent()).stdout;
                    for (_i = 0, _a = stdout.trim().split('\n'); _i < _a.length; _i++) {
                        line = _a[_i];
                        if (!line)
                            continue;
                        parts = line.trim().split(/\s+/);
                        if (parts.length < 5)
                            continue;
                        pidStr = parts[0], ppidStr = parts[1], cpuStr = parts[2], etime = parts[3];
                        pid = parseInt(pidStr, 10);
                        ppid = parseInt(ppidStr, 10);
                        cpu = parseFloat(cpuStr);
                        // Skip if not a child of this daemon
                        if (ppid !== daemonPid)
                            continue;
                        // Skip if actively using CPU
                        if (cpu > 0)
                            continue;
                        minutes = 0;
                        dayMatch = etime.match(/^(\d+)-(\d+):(\d+):(\d+)$/);
                        hourMatch = etime.match(/^(\d+):(\d+):(\d+)$/);
                        minMatch = etime.match(/^(\d+):(\d+)$/);
                        if (dayMatch) {
                            minutes = parseInt(dayMatch[1], 10) * 24 * 60 +
                                parseInt(dayMatch[2], 10) * 60 +
                                parseInt(dayMatch[3], 10);
                        }
                        else if (hourMatch) {
                            minutes = parseInt(hourMatch[1], 10) * 60 +
                                parseInt(hourMatch[2], 10);
                        }
                        else if (minMatch) {
                            minutes = parseInt(minMatch[1], 10);
                        }
                        // Kill if idle for more than 1 minute
                        if (minutes >= 1) {
                            logger_js_1.logger.info('PROCESS', "Killing idle daemon child PID ".concat(pid, " (idle ").concat(minutes, "m)"), { pid: pid, minutes: minutes });
                            try {
                                process.kill(pid, 'SIGKILL');
                                killed++;
                            }
                            catch (_d) {
                                // Already dead or permission denied
                            }
                        }
                    }
                    return [3 /*break*/, 4];
                case 3:
                    _b = _c.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, killed];
            }
        });
    });
}
/**
 * Kill system-level orphans (ppid=1 on Unix)
 * These are Claude processes whose parent died unexpectedly
 */
function killSystemOrphans() {
    return __awaiter(this, void 0, void 0, function () {
        var stdout, killed, _i, _a, line, match, orphanPid, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (process.platform === 'win32') {
                        return [2 /*return*/, 0]; // Windows doesn't have ppid=1 orphan concept
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, execAsync('ps -eo pid,ppid,args 2>/dev/null | grep -E "claude.*haiku|claude.*output-format" | grep -v grep')];
                case 2:
                    stdout = (_c.sent()).stdout;
                    killed = 0;
                    for (_i = 0, _a = stdout.trim().split('\n'); _i < _a.length; _i++) {
                        line = _a[_i];
                        if (!line)
                            continue;
                        match = line.trim().match(/^(\d+)\s+(\d+)/);
                        if (match && parseInt(match[2]) === 1) { // ppid=1 = orphan
                            orphanPid = parseInt(match[1]);
                            logger_js_1.logger.warn('PROCESS', "Killing system orphan PID ".concat(orphanPid), { pid: orphanPid });
                            try {
                                process.kill(orphanPid, 'SIGKILL');
                                killed++;
                            }
                            catch (_d) {
                                // Already dead or permission denied
                            }
                        }
                    }
                    return [2 /*return*/, killed];
                case 3:
                    _b = _c.sent();
                    return [2 /*return*/, 0]; // No matches or error
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Reap orphaned processes - both registry-tracked and system-level
 */
function reapOrphanedProcesses(activeSessionIds) {
    return __awaiter(this, void 0, void 0, function () {
        var killed, _i, _a, record, pid, sessionDbId, processRef, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    killed = 0;
                    // Registry-based: kill processes for dead sessions
                    for (_i = 0, _a = (0, index_js_1.getSupervisor)().getRegistry().getAll().filter(function (entry) { return entry.type === 'sdk'; }); _i < _a.length; _i++) {
                        record = _a[_i];
                        pid = record.pid;
                        sessionDbId = Number(record.sessionId);
                        processRef = (0, index_js_1.getSupervisor)().getRegistry().getRuntimeProcess(record.id);
                        if (activeSessionIds.has(sessionDbId))
                            continue; // Active = safe
                        logger_js_1.logger.warn('PROCESS', "Killing orphan PID ".concat(pid, " (session ").concat(sessionDbId, " gone)"), { pid: pid, sessionDbId: sessionDbId });
                        try {
                            if (processRef) {
                                processRef.kill('SIGKILL');
                            }
                            else {
                                process.kill(pid, 'SIGKILL');
                            }
                            killed++;
                        }
                        catch (_e) {
                            // Already dead
                        }
                        (0, index_js_1.getSupervisor)().unregisterProcess(record.id);
                        notifySlotAvailable();
                    }
                    // System-level: find ppid=1 orphans
                    _b = killed;
                    return [4 /*yield*/, killSystemOrphans()];
                case 1:
                    // System-level: find ppid=1 orphans
                    killed = _b + _d.sent();
                    // Daemon children: find idle SDK processes that didn't terminate
                    _c = killed;
                    return [4 /*yield*/, killIdleDaemonChildren()];
                case 2:
                    // Daemon children: find idle SDK processes that didn't terminate
                    killed = _c + _d.sent();
                    return [2 /*return*/, killed];
            }
        });
    });
}
/**
 * Create a custom spawn function for SDK that captures PIDs
 *
 * The SDK's spawnClaudeCodeProcess option allows us to intercept subprocess
 * creation and capture the PID before the SDK hides it.
 *
 * NOTE: Session isolation is handled via the `cwd` option in SDKAgent.ts,
 * NOT via CLAUDE_CONFIG_DIR (which breaks authentication).
 */
function createPidCapturingSpawn(sessionDbId) {
    return function (spawnOptions) {
        var _a;
        (0, index_js_1.getSupervisor)().assertCanSpawn('claude sdk');
        // On Windows, use cmd.exe wrapper for .cmd files to properly handle paths with spaces
        var useCmdWrapper = process.platform === 'win32' && spawnOptions.command.endsWith('.cmd');
        var env = (0, env_sanitizer_js_1.sanitizeEnv)((_a = spawnOptions.env) !== null && _a !== void 0 ? _a : process.env);
        var child = useCmdWrapper
            ? (0, child_process_1.spawn)('cmd.exe', __spreadArray(['/d', '/c', spawnOptions.command], spawnOptions.args, true), {
                cwd: spawnOptions.cwd,
                env: env,
                stdio: ['pipe', 'pipe', 'pipe'],
                signal: spawnOptions.signal,
                windowsHide: true
            })
            : (0, child_process_1.spawn)(spawnOptions.command, spawnOptions.args, {
                cwd: spawnOptions.cwd,
                env: env,
                stdio: ['pipe', 'pipe', 'pipe'],
                signal: spawnOptions.signal, // CRITICAL: Pass signal for AbortController integration
                windowsHide: true
            });
        // Capture stderr for debugging spawn failures
        if (child.stderr) {
            child.stderr.on('data', function (data) {
                logger_js_1.logger.debug('SDK_SPAWN', "[session-".concat(sessionDbId, "] stderr: ").concat(data.toString().trim()));
            });
        }
        // Register PID
        if (child.pid) {
            registerProcess(child.pid, sessionDbId, child);
            // Auto-unregister on exit
            child.on('exit', function (code, signal) {
                if (code !== 0) {
                    logger_js_1.logger.warn('SDK_SPAWN', "[session-".concat(sessionDbId, "] Claude process exited"), { code: code, signal: signal, pid: child.pid });
                }
                if (child.pid) {
                    unregisterProcess(child.pid);
                }
            });
        }
        // Return SDK-compatible interface
        return {
            stdin: child.stdin,
            stdout: child.stdout,
            stderr: child.stderr,
            get killed() { return child.killed; },
            get exitCode() { return child.exitCode; },
            kill: child.kill.bind(child),
            on: child.on.bind(child),
            once: child.once.bind(child),
            off: child.off.bind(child)
        };
    };
}
/**
 * Start the orphan reaper interval
 * Returns cleanup function to stop the interval
 */
function startOrphanReaper(getActiveSessionIds, intervalMs) {
    var _this = this;
    if (intervalMs === void 0) { intervalMs = 30 * 1000; }
    var interval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
        var activeIds, killed, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    activeIds = getActiveSessionIds();
                    return [4 /*yield*/, reapOrphanedProcesses(activeIds)];
                case 1:
                    killed = _a.sent();
                    if (killed > 0) {
                        logger_js_1.logger.info('PROCESS', "Reaper cleaned up ".concat(killed, " orphaned processes"), { killed: killed });
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    logger_js_1.logger.error('PROCESS', 'Reaper error', {}, error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, intervalMs);
    // Return cleanup function
    return function () { return clearInterval(interval); };
}
