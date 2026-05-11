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
Object.defineProperty(exports, "__esModule", { value: true });
exports.isProcessRunning = isProcessRunning;
exports.getAncestorPidsAsync = getAncestorPidsAsync;
exports.getProcessCommand = getProcessCommand;
exports.getAncestorCommandsAsync = getAncestorCommandsAsync;
exports.getChildPids = getChildPids;
var execFileNoThrow_js_1 = require("./execFileNoThrow.js");
// This file contains platform-agnostic implementations of common `ps` type commands.
// When adding new code to this file, make sure to handle:
// - Win32, as `ps` within cygwin and WSL may not behave as expected, particularly when attempting to access processes on the host.
// - Unix vs BSD-style `ps` have different options.
/**
 * Check if a process with the given PID is running (signal 0 probe).
 *
 * PID ≤ 1 returns false (0 is current process group, 1 is init).
 *
 * Note: `process.kill(pid, 0)` throws EPERM when the process exists but is
 * owned by another user. This reports such processes as NOT running, which
 * is conservative for lock recovery (we won't steal a live lock).
 */
function isProcessRunning(pid) {
    if (pid <= 1)
        return false;
    try {
        process.kill(pid, 0);
        return true;
    }
    catch (_a) {
        return false;
    }
}
/**
 * Gets the ancestor process chain for a given process (up to maxDepth levels)
 * @param pid - The starting process ID
 * @param maxDepth - Maximum number of ancestors to fetch (default: 10)
 * @returns Array of ancestor PIDs from immediate parent to furthest ancestor
 */
function getAncestorPidsAsync(pid_1) {
    return __awaiter(this, arguments, void 0, function (pid, maxDepth) {
        var script_1, result_1, script, result;
        var _a, _b;
        if (maxDepth === void 0) { maxDepth = 10; }
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!(process.platform === 'win32')) return [3 /*break*/, 2];
                    script_1 = "\n      $pid = ".concat(String(pid), "\n      $ancestors = @()\n      for ($i = 0; $i -lt ").concat(maxDepth, "; $i++) {\n        $proc = Get-CimInstance Win32_Process -Filter \"ProcessId=$pid\" -ErrorAction SilentlyContinue\n        if (-not $proc -or -not $proc.ParentProcessId -or $proc.ParentProcessId -eq 0) { break }\n        $pid = $proc.ParentProcessId\n        $ancestors += $pid\n      }\n      $ancestors -join ','\n    ").trim();
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)('powershell.exe', ['-NoProfile', '-Command', script_1], { timeout: 3000 })];
                case 1:
                    result_1 = _c.sent();
                    if (result_1.code !== 0 || !((_a = result_1.stdout) === null || _a === void 0 ? void 0 : _a.trim())) {
                        return [2 /*return*/, []];
                    }
                    return [2 /*return*/, result_1.stdout
                            .trim()
                            .split(',')
                            .filter(Boolean)
                            .map(function (p) { return parseInt(p, 10); })
                            .filter(function (p) { return !isNaN(p); })];
                case 2:
                    script = "pid=".concat(String(pid), "; for i in $(seq 1 ").concat(maxDepth, "); do ppid=$(ps -o ppid= -p $pid 2>/dev/null | tr -d ' '); if [ -z \"$ppid\" ] || [ \"$ppid\" = \"0\" ] || [ \"$ppid\" = \"1\" ]; then break; fi; echo $ppid; pid=$ppid; done");
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)('sh', ['-c', script], {
                            timeout: 3000,
                        })];
                case 3:
                    result = _c.sent();
                    if (result.code !== 0 || !((_b = result.stdout) === null || _b === void 0 ? void 0 : _b.trim())) {
                        return [2 /*return*/, []];
                    }
                    return [2 /*return*/, result.stdout
                            .trim()
                            .split('\n')
                            .filter(Boolean)
                            .map(function (p) { return parseInt(p, 10); })
                            .filter(function (p) { return !isNaN(p); })];
            }
        });
    });
}
/**
 * Gets the command line for a given process
 * @param pid - The process ID to get the command for
 * @returns The command line string, or null if not found
 * @deprecated Use getAncestorCommandsAsync instead
 */
function getProcessCommand(pid) {
    try {
        var pidStr = String(pid);
        var command = process.platform === 'win32'
            ? "powershell.exe -NoProfile -Command \"(Get-CimInstance Win32_Process -Filter \\\"ProcessId=".concat(pidStr, "\\\").CommandLine\"")
            : "ps -o command= -p ".concat(pidStr);
        var result = (0, execFileNoThrow_js_1.execSyncWithDefaults_DEPRECATED)(command, { timeout: 1000 });
        return result ? result.trim() : null;
    }
    catch (_a) {
        return null;
    }
}
/**
 * Gets the command lines for a process and its ancestors in a single call
 * @param pid - The starting process ID
 * @param maxDepth - Maximum depth to traverse (default: 10)
 * @returns Array of command strings for the process chain
 */
function getAncestorCommandsAsync(pid_1) {
    return __awaiter(this, arguments, void 0, function (pid, maxDepth) {
        var script_2, result_2, script, result;
        var _a, _b;
        if (maxDepth === void 0) { maxDepth = 10; }
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!(process.platform === 'win32')) return [3 /*break*/, 2];
                    script_2 = "\n      $currentPid = ".concat(String(pid), "\n      $commands = @()\n      for ($i = 0; $i -lt ").concat(maxDepth, "; $i++) {\n        $proc = Get-CimInstance Win32_Process -Filter \"ProcessId=$currentPid\" -ErrorAction SilentlyContinue\n        if (-not $proc) { break }\n        if ($proc.CommandLine) { $commands += $proc.CommandLine }\n        if (-not $proc.ParentProcessId -or $proc.ParentProcessId -eq 0) { break }\n        $currentPid = $proc.ParentProcessId\n      }\n      $commands -join [char]0\n    ").trim();
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)('powershell.exe', ['-NoProfile', '-Command', script_2], { timeout: 3000 })];
                case 1:
                    result_2 = _c.sent();
                    if (result_2.code !== 0 || !((_a = result_2.stdout) === null || _a === void 0 ? void 0 : _a.trim())) {
                        return [2 /*return*/, []];
                    }
                    return [2 /*return*/, result_2.stdout.split('\0').filter(Boolean)];
                case 2:
                    script = "currentpid=".concat(String(pid), "; for i in $(seq 1 ").concat(maxDepth, "); do cmd=$(ps -o command= -p $currentpid 2>/dev/null); if [ -n \"$cmd\" ]; then printf '%s\\0' \"$cmd\"; fi; ppid=$(ps -o ppid= -p $currentpid 2>/dev/null | tr -d ' '); if [ -z \"$ppid\" ] || [ \"$ppid\" = \"0\" ] || [ \"$ppid\" = \"1\" ]; then break; fi; currentpid=$ppid; done");
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)('sh', ['-c', script], {
                            timeout: 3000,
                        })];
                case 3:
                    result = _c.sent();
                    if (result.code !== 0 || !((_b = result.stdout) === null || _b === void 0 ? void 0 : _b.trim())) {
                        return [2 /*return*/, []];
                    }
                    return [2 /*return*/, result.stdout.split('\0').filter(Boolean)];
            }
        });
    });
}
/**
 * Gets the child process IDs for a given process
 * @param pid - The parent process ID
 * @returns Array of child process IDs as numbers
 */
function getChildPids(pid) {
    try {
        var pidStr = String(pid);
        var command = process.platform === 'win32'
            ? "powershell.exe -NoProfile -Command \"(Get-CimInstance Win32_Process -Filter \\\"ParentProcessId=".concat(pidStr, "\\\").ProcessId\"")
            : "pgrep -P ".concat(pidStr);
        var result = (0, execFileNoThrow_js_1.execSyncWithDefaults_DEPRECATED)(command, { timeout: 1000 });
        if (!result) {
            return [];
        }
        return result
            .trim()
            .split('\n')
            .filter(Boolean)
            .map(function (p) { return parseInt(p, 10); })
            .filter(function (p) { return !isNaN(p); });
    }
    catch (_a) {
        return [];
    }
}
