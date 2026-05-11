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
exports.registerPendingAsyncHook = registerPendingAsyncHook;
exports.getPendingAsyncHooks = getPendingAsyncHooks;
exports.checkForAsyncHookResponses = checkForAsyncHookResponses;
exports.removeDeliveredAsyncHooks = removeDeliveredAsyncHooks;
exports.finalizePendingAsyncHooks = finalizePendingAsyncHooks;
exports.clearAllAsyncHooks = clearAllAsyncHooks;
var debug_js_1 = require("../debug.js");
var sessionEnvironment_js_1 = require("../sessionEnvironment.js");
var slowOperations_js_1 = require("../slowOperations.js");
var hookEvents_js_1 = require("./hookEvents.js");
// Global registry state
var pendingHooks = new Map();
function registerPendingAsyncHook(_a) {
    var _this = this;
    var processId = _a.processId, hookId = _a.hookId, asyncResponse = _a.asyncResponse, hookName = _a.hookName, hookEvent = _a.hookEvent, command = _a.command, shellCommand = _a.shellCommand, toolName = _a.toolName, pluginId = _a.pluginId;
    var timeout = asyncResponse.asyncTimeout || 15000; // Default 15s
    (0, debug_js_1.logForDebugging)("Hooks: Registering async hook ".concat(processId, " (").concat(hookName, ") with timeout ").concat(timeout, "ms"));
    var stopProgressInterval = (0, hookEvents_js_1.startHookProgressInterval)({
        hookId: hookId,
        hookName: hookName,
        hookEvent: hookEvent,
        getOutput: function () { return __awaiter(_this, void 0, void 0, function () {
            var taskOutput, stdout, stderr;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        taskOutput = (_b = (_a = pendingHooks.get(processId)) === null || _a === void 0 ? void 0 : _a.shellCommand) === null || _b === void 0 ? void 0 : _b.taskOutput;
                        if (!taskOutput) {
                            return [2 /*return*/, { stdout: '', stderr: '', output: '' }];
                        }
                        return [4 /*yield*/, taskOutput.getStdout()];
                    case 1:
                        stdout = _c.sent();
                        stderr = taskOutput.getStderr();
                        return [2 /*return*/, { stdout: stdout, stderr: stderr, output: stdout + stderr }];
                }
            });
        }); },
    });
    pendingHooks.set(processId, {
        processId: processId,
        hookId: hookId,
        hookName: hookName,
        hookEvent: hookEvent,
        toolName: toolName,
        pluginId: pluginId,
        command: command,
        startTime: Date.now(),
        timeout: timeout,
        responseAttachmentSent: false,
        shellCommand: shellCommand,
        stopProgressInterval: stopProgressInterval,
    });
}
function getPendingAsyncHooks() {
    return Array.from(pendingHooks.values()).filter(function (hook) { return !hook.responseAttachmentSent; });
}
function finalizeHook(hook, exitCode, outcome) {
    return __awaiter(this, void 0, void 0, function () {
        var taskOutput, stdout, _a, stderr;
        var _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    hook.stopProgressInterval();
                    taskOutput = (_b = hook.shellCommand) === null || _b === void 0 ? void 0 : _b.taskOutput;
                    if (!taskOutput) return [3 /*break*/, 2];
                    return [4 /*yield*/, taskOutput.getStdout()];
                case 1:
                    _a = _e.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _a = '';
                    _e.label = 3;
                case 3:
                    stdout = _a;
                    stderr = (_c = taskOutput === null || taskOutput === void 0 ? void 0 : taskOutput.getStderr()) !== null && _c !== void 0 ? _c : '';
                    (_d = hook.shellCommand) === null || _d === void 0 ? void 0 : _d.cleanup();
                    (0, hookEvents_js_1.emitHookResponse)({
                        hookId: hook.hookId,
                        hookName: hook.hookName,
                        hookEvent: hook.hookEvent,
                        output: stdout + stderr,
                        stdout: stdout,
                        stderr: stderr,
                        exitCode: exitCode,
                        outcome: outcome,
                    });
                    return [2 /*return*/];
            }
        });
    });
}
function checkForAsyncHookResponses() {
    return __awaiter(this, void 0, void 0, function () {
        var responses, pendingCount, hooks, settled, sessionStartCompleted, _i, settled_1, s, r;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    responses = [];
                    pendingCount = pendingHooks.size;
                    (0, debug_js_1.logForDebugging)("Hooks: Found ".concat(pendingCount, " total hooks in registry"));
                    hooks = Array.from(pendingHooks.values());
                    return [4 /*yield*/, Promise.allSettled(hooks.map(function (hook) { return __awaiter(_this, void 0, void 0, function () {
                            var stdout, stderr, lines, execResult, exitCode, response, _i, lines_1, line, parsed;
                            var _a, _b, _c, _d;
                            return __generator(this, function (_e) {
                                switch (_e.label) {
                                    case 0: return [4 /*yield*/, ((_a = hook.shellCommand) === null || _a === void 0 ? void 0 : _a.taskOutput.getStdout())];
                                    case 1:
                                        stdout = (_b = (_e.sent())) !== null && _b !== void 0 ? _b : '';
                                        stderr = (_d = (_c = hook.shellCommand) === null || _c === void 0 ? void 0 : _c.taskOutput.getStderr()) !== null && _d !== void 0 ? _d : '';
                                        (0, debug_js_1.logForDebugging)("Hooks: Checking hook ".concat(hook.processId, " (").concat(hook.hookName, ") - attachmentSent: ").concat(hook.responseAttachmentSent, ", stdout length: ").concat(stdout.length));
                                        if (!hook.shellCommand) {
                                            (0, debug_js_1.logForDebugging)("Hooks: Hook ".concat(hook.processId, " has no shell command, removing from registry"));
                                            hook.stopProgressInterval();
                                            return [2 /*return*/, { type: 'remove', processId: hook.processId }];
                                        }
                                        (0, debug_js_1.logForDebugging)("Hooks: Hook shell status ".concat(hook.shellCommand.status));
                                        if (hook.shellCommand.status === 'killed') {
                                            (0, debug_js_1.logForDebugging)("Hooks: Hook ".concat(hook.processId, " is ").concat(hook.shellCommand.status, ", removing from registry"));
                                            hook.stopProgressInterval();
                                            hook.shellCommand.cleanup();
                                            return [2 /*return*/, { type: 'remove', processId: hook.processId }];
                                        }
                                        if (hook.shellCommand.status !== 'completed') {
                                            return [2 /*return*/, { type: 'skip' }];
                                        }
                                        if (hook.responseAttachmentSent || !stdout.trim()) {
                                            (0, debug_js_1.logForDebugging)("Hooks: Skipping hook ".concat(hook.processId, " - already delivered/sent or no stdout"));
                                            hook.stopProgressInterval();
                                            return [2 /*return*/, { type: 'remove', processId: hook.processId }];
                                        }
                                        lines = stdout.split('\n');
                                        (0, debug_js_1.logForDebugging)("Hooks: Processing ".concat(lines.length, " lines of stdout for ").concat(hook.processId));
                                        return [4 /*yield*/, hook.shellCommand.result];
                                    case 2:
                                        execResult = _e.sent();
                                        exitCode = execResult.code;
                                        response = {};
                                        for (_i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
                                            line = lines_1[_i];
                                            if (line.trim().startsWith('{')) {
                                                (0, debug_js_1.logForDebugging)("Hooks: Found JSON line: ".concat(line.trim().substring(0, 100), "..."));
                                                try {
                                                    parsed = (0, slowOperations_js_1.jsonParse)(line.trim());
                                                    if (!('async' in parsed)) {
                                                        (0, debug_js_1.logForDebugging)("Hooks: Found sync response from ".concat(hook.processId, ": ").concat((0, slowOperations_js_1.jsonStringify)(parsed)));
                                                        response = parsed;
                                                        break;
                                                    }
                                                }
                                                catch (_f) {
                                                    (0, debug_js_1.logForDebugging)("Hooks: Failed to parse JSON from ".concat(hook.processId, ": ").concat(line.trim()));
                                                }
                                            }
                                        }
                                        hook.responseAttachmentSent = true;
                                        return [4 /*yield*/, finalizeHook(hook, exitCode, exitCode === 0 ? 'success' : 'error')];
                                    case 3:
                                        _e.sent();
                                        return [2 /*return*/, {
                                                type: 'response',
                                                processId: hook.processId,
                                                isSessionStart: hook.hookEvent === 'SessionStart',
                                                payload: {
                                                    processId: hook.processId,
                                                    response: response,
                                                    hookName: hook.hookName,
                                                    hookEvent: hook.hookEvent,
                                                    toolName: hook.toolName,
                                                    pluginId: hook.pluginId,
                                                    stdout: stdout,
                                                    stderr: stderr,
                                                    exitCode: exitCode,
                                                },
                                            }];
                                }
                            });
                        }); }))
                        // allSettled — isolate failures so one throwing callback doesn't orphan
                        // already-applied side effects (responseAttachmentSent, finalizeHook) from others.
                    ];
                case 1:
                    settled = _a.sent();
                    sessionStartCompleted = false;
                    for (_i = 0, settled_1 = settled; _i < settled_1.length; _i++) {
                        s = settled_1[_i];
                        if (s.status !== 'fulfilled') {
                            (0, debug_js_1.logForDebugging)("Hooks: checkForAsyncHookResponses callback rejected: ".concat(s.reason), { level: 'error' });
                            continue;
                        }
                        r = s.value;
                        if (r.type === 'remove') {
                            pendingHooks.delete(r.processId);
                        }
                        else if (r.type === 'response') {
                            responses.push(r.payload);
                            pendingHooks.delete(r.processId);
                            if (r.isSessionStart)
                                sessionStartCompleted = true;
                        }
                    }
                    if (sessionStartCompleted) {
                        (0, debug_js_1.logForDebugging)("Invalidating session env cache after SessionStart hook completed");
                        (0, sessionEnvironment_js_1.invalidateSessionEnvCache)();
                    }
                    (0, debug_js_1.logForDebugging)("Hooks: checkForNewResponses returning ".concat(responses.length, " responses"));
                    return [2 /*return*/, responses];
            }
        });
    });
}
function removeDeliveredAsyncHooks(processIds) {
    for (var _i = 0, processIds_1 = processIds; _i < processIds_1.length; _i++) {
        var processId = processIds_1[_i];
        var hook = pendingHooks.get(processId);
        if (hook && hook.responseAttachmentSent) {
            (0, debug_js_1.logForDebugging)("Hooks: Removing delivered hook ".concat(processId));
            hook.stopProgressInterval();
            pendingHooks.delete(processId);
        }
    }
}
function finalizePendingAsyncHooks() {
    return __awaiter(this, void 0, void 0, function () {
        var hooks;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    hooks = Array.from(pendingHooks.values());
                    return [4 /*yield*/, Promise.all(hooks.map(function (hook) { return __awaiter(_this, void 0, void 0, function () {
                            var result;
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        if (!(((_a = hook.shellCommand) === null || _a === void 0 ? void 0 : _a.status) === 'completed')) return [3 /*break*/, 3];
                                        return [4 /*yield*/, hook.shellCommand.result];
                                    case 1:
                                        result = _b.sent();
                                        return [4 /*yield*/, finalizeHook(hook, result.code, result.code === 0 ? 'success' : 'error')];
                                    case 2:
                                        _b.sent();
                                        return [3 /*break*/, 5];
                                    case 3:
                                        if (hook.shellCommand && hook.shellCommand.status !== 'killed') {
                                            hook.shellCommand.kill();
                                        }
                                        return [4 /*yield*/, finalizeHook(hook, 1, 'cancelled')];
                                    case 4:
                                        _b.sent();
                                        _b.label = 5;
                                    case 5: return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 1:
                    _a.sent();
                    pendingHooks.clear();
                    return [2 /*return*/];
            }
        });
    });
}
// Test utility function to clear all hooks
function clearAllAsyncHooks() {
    for (var _i = 0, _a = pendingHooks.values(); _i < _a.length; _i++) {
        var hook = _a[_i];
        hook.stopProgressInterval();
    }
    pendingHooks.clear();
}
