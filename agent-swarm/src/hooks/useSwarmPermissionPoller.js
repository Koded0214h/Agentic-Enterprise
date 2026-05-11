"use strict";
/**
 * Swarm Permission Poller Hook
 *
 * This hook polls for permission responses from the team leader when running
 * as a worker agent in a swarm. When a response is received, it calls the
 * appropriate callback (onAllow/onReject) to continue execution.
 *
 * This hook should be used in conjunction with the worker-side integration
 * in useCanUseTool.ts, which creates pending requests that this hook monitors.
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
exports.registerPermissionCallback = registerPermissionCallback;
exports.unregisterPermissionCallback = unregisterPermissionCallback;
exports.hasPermissionCallback = hasPermissionCallback;
exports.clearAllPendingCallbacks = clearAllPendingCallbacks;
exports.processMailboxPermissionResponse = processMailboxPermissionResponse;
exports.registerSandboxPermissionCallback = registerSandboxPermissionCallback;
exports.hasSandboxPermissionCallback = hasSandboxPermissionCallback;
exports.processSandboxPermissionResponse = processSandboxPermissionResponse;
exports.useSwarmPermissionPoller = useSwarmPermissionPoller;
var react_1 = require("react");
var usehooks_ts_1 = require("usehooks-ts");
var debug_js_1 = require("../utils/debug.js");
var errors_js_1 = require("../utils/errors.js");
var PermissionUpdateSchema_js_1 = require("../utils/permissions/PermissionUpdateSchema.js");
var permissionSync_js_1 = require("../utils/swarm/permissionSync.js");
var teammate_js_1 = require("../utils/teammate.js");
var POLL_INTERVAL_MS = 500;
/**
 * Validate permissionUpdates from external sources (mailbox IPC, disk polling).
 * Malformed entries from buggy/old teammate processes are filtered out rather
 * than propagated unchecked into callback.onAllow().
 */
function parsePermissionUpdates(raw) {
    if (!Array.isArray(raw)) {
        return [];
    }
    var schema = (0, PermissionUpdateSchema_js_1.permissionUpdateSchema)();
    var valid = [];
    for (var _i = 0, raw_1 = raw; _i < raw_1.length; _i++) {
        var entry = raw_1[_i];
        var result = schema.safeParse(entry);
        if (result.success) {
            valid.push(result.data);
        }
        else {
            (0, debug_js_1.logForDebugging)("[SwarmPermissionPoller] Dropping malformed permissionUpdate entry: ".concat(result.error.message), { level: 'warn' });
        }
    }
    return valid;
}
// Module-level registry that persists across renders
var pendingCallbacks = new Map();
/**
 * Register a callback for a pending permission request
 * Called by useCanUseTool when a worker submits a permission request
 */
function registerPermissionCallback(callback) {
    pendingCallbacks.set(callback.requestId, callback);
    (0, debug_js_1.logForDebugging)("[SwarmPermissionPoller] Registered callback for request ".concat(callback.requestId));
}
/**
 * Unregister a callback (e.g., when the request is resolved locally or times out)
 */
function unregisterPermissionCallback(requestId) {
    pendingCallbacks.delete(requestId);
    (0, debug_js_1.logForDebugging)("[SwarmPermissionPoller] Unregistered callback for request ".concat(requestId));
}
/**
 * Check if a request has a registered callback
 */
function hasPermissionCallback(requestId) {
    return pendingCallbacks.has(requestId);
}
/**
 * Clear all pending callbacks (both permission and sandbox).
 * Called from clearSessionCaches() on /clear to reset stale state,
 * and also used in tests for isolation.
 */
function clearAllPendingCallbacks() {
    pendingCallbacks.clear();
    pendingSandboxCallbacks.clear();
}
/**
 * Process a permission response from a mailbox message.
 * This is called by the inbox poller when it detects a permission_response message.
 *
 * @returns true if the response was processed, false if no callback was registered
 */
function processMailboxPermissionResponse(params) {
    var callback = pendingCallbacks.get(params.requestId);
    if (!callback) {
        (0, debug_js_1.logForDebugging)("[SwarmPermissionPoller] No callback registered for mailbox response ".concat(params.requestId));
        return false;
    }
    (0, debug_js_1.logForDebugging)("[SwarmPermissionPoller] Processing mailbox response for request ".concat(params.requestId, ": ").concat(params.decision));
    // Remove from registry before invoking callback
    pendingCallbacks.delete(params.requestId);
    if (params.decision === 'approved') {
        var permissionUpdates = parsePermissionUpdates(params.permissionUpdates);
        var updatedInput = params.updatedInput;
        callback.onAllow(updatedInput, permissionUpdates);
    }
    else {
        callback.onReject(params.feedback);
    }
    return true;
}
// Module-level registry for sandbox permission callbacks
var pendingSandboxCallbacks = new Map();
/**
 * Register a callback for a pending sandbox permission request
 * Called when a worker sends a sandbox permission request to the leader
 */
function registerSandboxPermissionCallback(callback) {
    pendingSandboxCallbacks.set(callback.requestId, callback);
    (0, debug_js_1.logForDebugging)("[SwarmPermissionPoller] Registered sandbox callback for request ".concat(callback.requestId));
}
/**
 * Check if a sandbox request has a registered callback
 */
function hasSandboxPermissionCallback(requestId) {
    return pendingSandboxCallbacks.has(requestId);
}
/**
 * Process a sandbox permission response from a mailbox message.
 * Called by the inbox poller when it detects a sandbox_permission_response message.
 *
 * @returns true if the response was processed, false if no callback was registered
 */
function processSandboxPermissionResponse(params) {
    var callback = pendingSandboxCallbacks.get(params.requestId);
    if (!callback) {
        (0, debug_js_1.logForDebugging)("[SwarmPermissionPoller] No sandbox callback registered for request ".concat(params.requestId));
        return false;
    }
    (0, debug_js_1.logForDebugging)("[SwarmPermissionPoller] Processing sandbox response for request ".concat(params.requestId, ": allow=").concat(params.allow));
    // Remove from registry before invoking callback
    pendingSandboxCallbacks.delete(params.requestId);
    // Resolve the promise with the allow decision
    callback.resolve(params.allow);
    return true;
}
/**
 * Process a permission response by invoking the registered callback
 */
function processResponse(response) {
    var callback = pendingCallbacks.get(response.requestId);
    if (!callback) {
        (0, debug_js_1.logForDebugging)("[SwarmPermissionPoller] No callback registered for request ".concat(response.requestId));
        return false;
    }
    (0, debug_js_1.logForDebugging)("[SwarmPermissionPoller] Processing response for request ".concat(response.requestId, ": ").concat(response.decision));
    // Remove from registry before invoking callback
    pendingCallbacks.delete(response.requestId);
    if (response.decision === 'approved') {
        var permissionUpdates = parsePermissionUpdates(response.permissionUpdates);
        var updatedInput = response.updatedInput;
        callback.onAllow(updatedInput, permissionUpdates);
    }
    else {
        callback.onReject(response.feedback);
    }
    return true;
}
/**
 * Hook that polls for permission responses when running as a swarm worker.
 *
 * This hook:
 * 1. Only activates when isSwarmWorker() returns true
 * 2. Polls every 500ms for responses
 * 3. When a response is found, invokes the registered callback
 * 4. Cleans up the response file after processing
 */
function useSwarmPermissionPoller() {
    var _this = this;
    var isProcessingRef = (0, react_1.useRef)(false);
    var poll = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var agentName, teamName, _i, pendingCallbacks_1, _a, requestId, _callback, response, processed, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    // Don't poll if not a swarm worker
                    if (!(0, permissionSync_js_1.isSwarmWorker)()) {
                        return [2 /*return*/];
                    }
                    // Prevent concurrent polling
                    if (isProcessingRef.current) {
                        return [2 /*return*/];
                    }
                    // Don't poll if no callbacks are registered
                    if (pendingCallbacks.size === 0) {
                        return [2 /*return*/];
                    }
                    isProcessingRef.current = true;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 7, 8, 9]);
                    agentName = (0, teammate_js_1.getAgentName)();
                    teamName = (0, teammate_js_1.getTeamName)();
                    if (!agentName || !teamName) {
                        return [2 /*return*/];
                    }
                    _i = 0, pendingCallbacks_1 = pendingCallbacks;
                    _b.label = 2;
                case 2:
                    if (!(_i < pendingCallbacks_1.length)) return [3 /*break*/, 6];
                    _a = pendingCallbacks_1[_i], requestId = _a[0], _callback = _a[1];
                    return [4 /*yield*/, (0, permissionSync_js_1.pollForResponse)(requestId, agentName, teamName)];
                case 3:
                    response = _b.sent();
                    if (!response) return [3 /*break*/, 5];
                    processed = processResponse(response);
                    if (!processed) return [3 /*break*/, 5];
                    // Clean up the response from the worker's inbox
                    return [4 /*yield*/, (0, permissionSync_js_1.removeWorkerResponse)(requestId, agentName, teamName)];
                case 4:
                    // Clean up the response from the worker's inbox
                    _b.sent();
                    _b.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 2];
                case 6: return [3 /*break*/, 9];
                case 7:
                    error_1 = _b.sent();
                    (0, debug_js_1.logForDebugging)("[SwarmPermissionPoller] Error during poll: ".concat((0, errors_js_1.errorMessage)(error_1)));
                    return [3 /*break*/, 9];
                case 8:
                    isProcessingRef.current = false;
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    }); }, []);
    // Only poll if we're a swarm worker
    var shouldPoll = (0, permissionSync_js_1.isSwarmWorker)();
    (0, usehooks_ts_1.useInterval)(function () { return void poll(); }, shouldPoll ? POLL_INTERVAL_MS : null);
    // Initial poll on mount
    (0, react_1.useEffect)(function () {
        if ((0, permissionSync_js_1.isSwarmWorker)()) {
            void poll();
        }
    }, [poll]);
}
