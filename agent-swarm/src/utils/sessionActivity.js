"use strict";
/**
 * Session activity tracking with refcount-based heartbeat timer.
 *
 * The transport registers its keep-alive sender via registerSessionActivityCallback().
 * Callers (API streaming, tool execution) bracket their work with
 * startSessionActivity() / stopSessionActivity(). When the refcount is >0 a
 * periodic timer fires the registered callback every 30 seconds to keep the
 * container alive.
 *
 * Sending keep-alives is gated behind CLAUDE_CODE_REMOTE_SEND_KEEPALIVES.
 * Diagnostic logging always fires to help diagnose idle gaps.
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
exports.registerSessionActivityCallback = registerSessionActivityCallback;
exports.unregisterSessionActivityCallback = unregisterSessionActivityCallback;
exports.sendSessionActivitySignal = sendSessionActivitySignal;
exports.isSessionActivityTrackingActive = isSessionActivityTrackingActive;
exports.startSessionActivity = startSessionActivity;
exports.stopSessionActivity = stopSessionActivity;
var cleanupRegistry_js_1 = require("./cleanupRegistry.js");
var diagLogs_js_1 = require("./diagLogs.js");
var envUtils_js_1 = require("./envUtils.js");
var SESSION_ACTIVITY_INTERVAL_MS = 30000;
var activityCallback = null;
var refcount = 0;
var activeReasons = new Map();
var oldestActivityStartedAt = null;
var heartbeatTimer = null;
var idleTimer = null;
var cleanupRegistered = false;
function startHeartbeatTimer() {
    clearIdleTimer();
    heartbeatTimer = setInterval(function () {
        (0, diagLogs_js_1.logForDiagnosticsNoPII)('debug', 'session_keepalive_heartbeat', {
            refcount: refcount,
        });
        if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_REMOTE_SEND_KEEPALIVES)) {
            activityCallback === null || activityCallback === void 0 ? void 0 : activityCallback();
        }
    }, SESSION_ACTIVITY_INTERVAL_MS);
}
function startIdleTimer() {
    clearIdleTimer();
    if (activityCallback === null) {
        return;
    }
    idleTimer = setTimeout(function () {
        (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'session_idle_30s');
        idleTimer = null;
    }, SESSION_ACTIVITY_INTERVAL_MS);
}
function clearIdleTimer() {
    if (idleTimer !== null) {
        clearTimeout(idleTimer);
        idleTimer = null;
    }
}
function registerSessionActivityCallback(cb) {
    activityCallback = cb;
    // Restart timer if work is already in progress (e.g. reconnect during streaming)
    if (refcount > 0 && heartbeatTimer === null) {
        startHeartbeatTimer();
    }
}
function unregisterSessionActivityCallback() {
    activityCallback = null;
    // Stop timer if the callback is removed
    if (heartbeatTimer !== null) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
    }
    clearIdleTimer();
}
function sendSessionActivitySignal() {
    if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_REMOTE_SEND_KEEPALIVES)) {
        activityCallback === null || activityCallback === void 0 ? void 0 : activityCallback();
    }
}
function isSessionActivityTrackingActive() {
    return activityCallback !== null;
}
/**
 * Increment the activity refcount. When it transitions from 0→1 and a callback
 * is registered, start a periodic heartbeat timer.
 */
function startSessionActivity(reason) {
    var _this = this;
    var _a;
    refcount++;
    activeReasons.set(reason, ((_a = activeReasons.get(reason)) !== null && _a !== void 0 ? _a : 0) + 1);
    if (refcount === 1) {
        oldestActivityStartedAt = Date.now();
        if (activityCallback !== null && heartbeatTimer === null) {
            startHeartbeatTimer();
        }
    }
    if (!cleanupRegistered) {
        cleanupRegistered = true;
        (0, cleanupRegistry_js_1.registerCleanup)(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'session_activity_at_shutdown', {
                    refcount: refcount,
                    active: Object.fromEntries(activeReasons),
                    // Only meaningful while work is in-flight; stale otherwise.
                    oldest_activity_ms: refcount > 0 && oldestActivityStartedAt !== null
                        ? Date.now() - oldestActivityStartedAt
                        : null,
                });
                return [2 /*return*/];
            });
        }); });
    }
}
/**
 * Decrement the activity refcount. When it reaches 0, stop the heartbeat timer
 * and start an idle timer that logs after 30s of inactivity.
 */
function stopSessionActivity(reason) {
    var _a;
    if (refcount > 0) {
        refcount--;
    }
    var n = ((_a = activeReasons.get(reason)) !== null && _a !== void 0 ? _a : 0) - 1;
    if (n > 0)
        activeReasons.set(reason, n);
    else
        activeReasons.delete(reason);
    if (refcount === 0 && heartbeatTimer !== null) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
        startIdleTimer();
    }
}
