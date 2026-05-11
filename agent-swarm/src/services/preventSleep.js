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
exports.startPreventSleep = startPreventSleep;
exports.stopPreventSleep = stopPreventSleep;
exports.forceStopPreventSleep = forceStopPreventSleep;
/**
 * Prevents macOS from sleeping while Claude is working.
 *
 * Uses the built-in `caffeinate` command to create a power assertion that
 * prevents idle sleep. This keeps the Mac awake during API requests and
 * tool execution so long-running operations don't get interrupted.
 *
 * The caffeinate process is spawned with a timeout and periodically restarted.
 * This provides self-healing behavior: if the Node process is killed with
 * SIGKILL (which doesn't run cleanup handlers), the orphaned caffeinate will
 * automatically exit after the timeout expires.
 *
 * Only runs on macOS - no-op on other platforms.
 */
var child_process_1 = require("child_process");
var cleanupRegistry_js_1 = require("../utils/cleanupRegistry.js");
var debug_js_1 = require("../utils/debug.js");
// Caffeinate timeout in seconds. Process auto-exits after this duration.
// We restart it before expiry to maintain continuous sleep prevention.
var CAFFEINATE_TIMEOUT_SECONDS = 300; // 5 minutes
// Restart interval - restart caffeinate before it expires.
// Use 4 minutes to give plenty of buffer before the 5 minute timeout.
var RESTART_INTERVAL_MS = 4 * 60 * 1000;
var caffeinateProcess = null;
var restartInterval = null;
var refCount = 0;
var cleanupRegistered = false;
/**
 * Increment the reference count and start preventing sleep if needed.
 * Call this when starting work that should keep the Mac awake.
 */
function startPreventSleep() {
    refCount++;
    if (refCount === 1) {
        spawnCaffeinate();
        startRestartInterval();
    }
}
/**
 * Decrement the reference count and allow sleep if no more work is pending.
 * Call this when work completes.
 */
function stopPreventSleep() {
    if (refCount > 0) {
        refCount--;
    }
    if (refCount === 0) {
        stopRestartInterval();
        killCaffeinate();
    }
}
/**
 * Force stop preventing sleep, regardless of reference count.
 * Use this for cleanup on exit.
 */
function forceStopPreventSleep() {
    refCount = 0;
    stopRestartInterval();
    killCaffeinate();
}
function startRestartInterval() {
    // Only run on macOS
    if (process.platform !== 'darwin') {
        return;
    }
    // Already running
    if (restartInterval !== null) {
        return;
    }
    restartInterval = setInterval(function () {
        // Only restart if we still need sleep prevention
        if (refCount > 0) {
            (0, debug_js_1.logForDebugging)('Restarting caffeinate to maintain sleep prevention');
            killCaffeinate();
            spawnCaffeinate();
        }
    }, RESTART_INTERVAL_MS);
    // Don't let the interval keep the Node process alive
    restartInterval.unref();
}
function stopRestartInterval() {
    if (restartInterval !== null) {
        clearInterval(restartInterval);
        restartInterval = null;
    }
}
function spawnCaffeinate() {
    var _this = this;
    // Only run on macOS
    if (process.platform !== 'darwin') {
        return;
    }
    // Already running
    if (caffeinateProcess !== null) {
        return;
    }
    // Register cleanup on first use to ensure caffeinate is killed on exit
    if (!cleanupRegistered) {
        cleanupRegistered = true;
        (0, cleanupRegistry_js_1.registerCleanup)(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                forceStopPreventSleep();
                return [2 /*return*/];
            });
        }); });
    }
    try {
        // -i: Create an assertion to prevent idle sleep
        //     This is the least aggressive option - display can still sleep
        // -t: Timeout in seconds - caffeinate exits automatically after this
        //     This provides self-healing if Node is killed with SIGKILL
        caffeinateProcess = (0, child_process_1.spawn)('caffeinate', ['-i', '-t', String(CAFFEINATE_TIMEOUT_SECONDS)], {
            stdio: 'ignore',
        });
        // Don't let caffeinate keep the Node process alive
        caffeinateProcess.unref();
        var thisProc_1 = caffeinateProcess;
        caffeinateProcess.on('error', function (err) {
            (0, debug_js_1.logForDebugging)("caffeinate spawn error: ".concat(err.message));
            if (caffeinateProcess === thisProc_1)
                caffeinateProcess = null;
        });
        caffeinateProcess.on('exit', function () {
            if (caffeinateProcess === thisProc_1)
                caffeinateProcess = null;
        });
        (0, debug_js_1.logForDebugging)('Started caffeinate to prevent sleep');
    }
    catch (_a) {
        // Silently fail - caffeinate not available or spawn failed
        caffeinateProcess = null;
    }
}
function killCaffeinate() {
    if (caffeinateProcess !== null) {
        var proc = caffeinateProcess;
        caffeinateProcess = null;
        try {
            // SIGKILL for immediate termination - SIGTERM could be delayed
            proc.kill('SIGKILL');
            (0, debug_js_1.logForDebugging)('Stopped caffeinate, allowing sleep');
        }
        catch (_a) {
            // Process may have already exited
        }
    }
}
