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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InProcessBackend = void 0;
exports.createInProcessBackend = createInProcessBackend;
var InProcessTeammateTask_js_1 = require("../../../tasks/InProcessTeammateTask/InProcessTeammateTask.js");
var agentId_js_1 = require("../../../utils/agentId.js");
var debug_js_1 = require("../../../utils/debug.js");
var slowOperations_js_1 = require("../../../utils/slowOperations.js");
var teammateMailbox_js_1 = require("../../../utils/teammateMailbox.js");
var inProcessRunner_js_1 = require("../inProcessRunner.js");
var spawnInProcess_js_1 = require("../spawnInProcess.js");
/**
 * InProcessBackend implements TeammateExecutor for in-process teammates.
 *
 * Unlike pane-based backends (tmux/iTerm2), in-process teammates run in the
 * same Node.js process with isolated context via AsyncLocalStorage. They:
 * - Share resources (API client, MCP connections) with the leader
 * - Communicate via file-based mailbox (same as pane-based teammates)
 * - Are terminated via AbortController (not kill-pane)
 *
 * IMPORTANT: Before spawning, call setContext() to provide the ToolUseContext
 * needed for AppState access. This is intended for use via the TeammateExecutor
 * abstraction (getTeammateExecutor() in registry.ts).
 */
var InProcessBackend = /** @class */ (function () {
    function InProcessBackend() {
        this.type = 'in-process';
        /**
         * Tool use context for AppState access.
         * Must be set via setContext() before spawn() is called.
         */
        this.context = null;
    }
    /**
     * Sets the ToolUseContext for this backend.
     * Called by TeammateTool before spawning to provide AppState access.
     */
    InProcessBackend.prototype.setContext = function (context) {
        this.context = context;
    };
    /**
     * In-process backend is always available (no external dependencies).
     */
    InProcessBackend.prototype.isAvailable = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, true];
            });
        });
    };
    /**
     * Spawns an in-process teammate.
     *
     * Uses spawnInProcessTeammate() to:
     * 1. Create TeammateContext via createTeammateContext()
     * 2. Create independent AbortController (not linked to parent)
     * 3. Register teammate in AppState.tasks
     * 4. Start agent execution via startInProcessTeammate()
     * 5. Return spawn result with agentId, taskId, abortController
     */
    InProcessBackend.prototype.spawn = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!this.context) {
                            (0, debug_js_1.logForDebugging)("[InProcessBackend] spawn() called without context for ".concat(config.name));
                            return [2 /*return*/, {
                                    success: false,
                                    agentId: "".concat(config.name, "@").concat(config.teamName),
                                    error: 'InProcessBackend not initialized. Call setContext() before spawn().',
                                }];
                        }
                        (0, debug_js_1.logForDebugging)("[InProcessBackend] spawn() called for ".concat(config.name));
                        return [4 /*yield*/, (0, spawnInProcess_js_1.spawnInProcessTeammate)({
                                name: config.name,
                                teamName: config.teamName,
                                prompt: config.prompt,
                                color: config.color,
                                planModeRequired: (_a = config.planModeRequired) !== null && _a !== void 0 ? _a : false,
                            }, this.context)
                            // If spawn succeeded, start the agent execution loop
                        ];
                    case 1:
                        result = _c.sent();
                        // If spawn succeeded, start the agent execution loop
                        if (result.success &&
                            result.taskId &&
                            result.teammateContext &&
                            result.abortController) {
                            // Start the agent loop in the background (fire-and-forget)
                            // The prompt is passed through the task state and config
                            (0, inProcessRunner_js_1.startInProcessTeammate)({
                                identity: {
                                    agentId: result.agentId,
                                    agentName: config.name,
                                    teamName: config.teamName,
                                    color: config.color,
                                    planModeRequired: (_b = config.planModeRequired) !== null && _b !== void 0 ? _b : false,
                                    parentSessionId: result.teammateContext.parentSessionId,
                                },
                                taskId: result.taskId,
                                prompt: config.prompt,
                                teammateContext: result.teammateContext,
                                // Strip messages: the teammate never reads toolUseContext.messages
                                // (runAgent overrides it via createSubagentContext). Passing the
                                // parent's conversation would pin it for the teammate's lifetime.
                                toolUseContext: __assign(__assign({}, this.context), { messages: [] }),
                                abortController: result.abortController,
                                model: config.model,
                                systemPrompt: config.systemPrompt,
                                systemPromptMode: config.systemPromptMode,
                                allowedTools: config.permissions,
                                allowPermissionPrompts: config.allowPermissionPrompts,
                            });
                            (0, debug_js_1.logForDebugging)("[InProcessBackend] Started agent execution for ".concat(result.agentId));
                        }
                        return [2 /*return*/, {
                                success: result.success,
                                agentId: result.agentId,
                                taskId: result.taskId,
                                abortController: result.abortController,
                                error: result.error,
                            }];
                }
            });
        });
    };
    /**
     * Sends a message to an in-process teammate.
     *
     * All teammates use file-based mailboxes for simplicity.
     */
    InProcessBackend.prototype.sendMessage = function (agentId, message) {
        return __awaiter(this, void 0, void 0, function () {
            var parsed, agentName, teamName;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        (0, debug_js_1.logForDebugging)("[InProcessBackend] sendMessage() to ".concat(agentId, ": ").concat(message.text.substring(0, 50), "..."));
                        parsed = (0, agentId_js_1.parseAgentId)(agentId);
                        if (!parsed) {
                            (0, debug_js_1.logForDebugging)("[InProcessBackend] Invalid agentId format: ".concat(agentId));
                            throw new Error("Invalid agentId format: ".concat(agentId, ". Expected format: agentName@teamName"));
                        }
                        agentName = parsed.agentName, teamName = parsed.teamName;
                        // Write to file-based mailbox
                        return [4 /*yield*/, (0, teammateMailbox_js_1.writeToMailbox)(agentName, {
                                text: message.text,
                                from: message.from,
                                color: message.color,
                                timestamp: (_a = message.timestamp) !== null && _a !== void 0 ? _a : new Date().toISOString(),
                            }, teamName)];
                    case 1:
                        // Write to file-based mailbox
                        _b.sent();
                        (0, debug_js_1.logForDebugging)("[InProcessBackend] sendMessage() completed for ".concat(agentId));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Gracefully terminates an in-process teammate.
     *
     * Sends a shutdown request message to the teammate and sets the
     * shutdownRequested flag. The teammate processes the request and
     * either approves (exits) or rejects (continues working).
     *
     * Unlike pane-based teammates, in-process teammates handle their own
     * exit via the shutdown flow - no external killPane() is needed.
     */
    InProcessBackend.prototype.terminate = function (agentId, reason) {
        return __awaiter(this, void 0, void 0, function () {
            var state, task, requestId, shutdownRequest, teammateAgentName;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, debug_js_1.logForDebugging)("[InProcessBackend] terminate() called for ".concat(agentId, ": ").concat(reason));
                        if (!this.context) {
                            (0, debug_js_1.logForDebugging)("[InProcessBackend] terminate() failed: no context set for ".concat(agentId));
                            return [2 /*return*/, false];
                        }
                        state = this.context.getAppState();
                        task = (0, InProcessTeammateTask_js_1.findTeammateTaskByAgentId)(agentId, state.tasks);
                        if (!task) {
                            (0, debug_js_1.logForDebugging)("[InProcessBackend] terminate() failed: task not found for ".concat(agentId));
                            return [2 /*return*/, false];
                        }
                        // Don't send another shutdown request if one is already pending
                        if (task.shutdownRequested) {
                            (0, debug_js_1.logForDebugging)("[InProcessBackend] terminate(): shutdown already requested for ".concat(agentId));
                            return [2 /*return*/, true];
                        }
                        requestId = "shutdown-".concat(agentId, "-").concat(Date.now());
                        shutdownRequest = (0, teammateMailbox_js_1.createShutdownRequestMessage)({
                            requestId: requestId,
                            from: 'team-lead', // Terminate is always called by the leader
                            reason: reason,
                        });
                        teammateAgentName = task.identity.agentName;
                        return [4 /*yield*/, (0, teammateMailbox_js_1.writeToMailbox)(teammateAgentName, {
                                from: 'team-lead',
                                text: (0, slowOperations_js_1.jsonStringify)(shutdownRequest),
                                timestamp: new Date().toISOString(),
                            }, task.identity.teamName)
                            // Mark the task as shutdown requested
                        ];
                    case 1:
                        _a.sent();
                        // Mark the task as shutdown requested
                        (0, InProcessTeammateTask_js_1.requestTeammateShutdown)(task.id, this.context.setAppState);
                        (0, debug_js_1.logForDebugging)("[InProcessBackend] terminate() sent shutdown request to ".concat(agentId));
                        return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     * Force kills an in-process teammate immediately.
     *
     * Uses the teammate's AbortController to cancel all async operations
     * and updates the task state to 'killed'.
     */
    InProcessBackend.prototype.kill = function (agentId) {
        return __awaiter(this, void 0, void 0, function () {
            var state, task, killed;
            return __generator(this, function (_a) {
                (0, debug_js_1.logForDebugging)("[InProcessBackend] kill() called for ".concat(agentId));
                if (!this.context) {
                    (0, debug_js_1.logForDebugging)("[InProcessBackend] kill() failed: no context set for ".concat(agentId));
                    return [2 /*return*/, false];
                }
                state = this.context.getAppState();
                task = (0, InProcessTeammateTask_js_1.findTeammateTaskByAgentId)(agentId, state.tasks);
                if (!task) {
                    (0, debug_js_1.logForDebugging)("[InProcessBackend] kill() failed: task not found for ".concat(agentId));
                    return [2 /*return*/, false];
                }
                killed = (0, spawnInProcess_js_1.killInProcessTeammate)(task.id, this.context.setAppState);
                (0, debug_js_1.logForDebugging)("[InProcessBackend] kill() ".concat(killed ? 'succeeded' : 'failed', " for ").concat(agentId));
                return [2 /*return*/, killed];
            });
        });
    };
    /**
     * Checks if an in-process teammate is still active.
     *
     * Returns true if the teammate exists, has status 'running',
     * and its AbortController has not been aborted.
     */
    InProcessBackend.prototype.isActive = function (agentId) {
        return __awaiter(this, void 0, void 0, function () {
            var state, task, isRunning, isAborted, active;
            var _a, _b;
            return __generator(this, function (_c) {
                (0, debug_js_1.logForDebugging)("[InProcessBackend] isActive() called for ".concat(agentId));
                if (!this.context) {
                    (0, debug_js_1.logForDebugging)("[InProcessBackend] isActive() failed: no context set for ".concat(agentId));
                    return [2 /*return*/, false];
                }
                state = this.context.getAppState();
                task = (0, InProcessTeammateTask_js_1.findTeammateTaskByAgentId)(agentId, state.tasks);
                if (!task) {
                    (0, debug_js_1.logForDebugging)("[InProcessBackend] isActive(): task not found for ".concat(agentId));
                    return [2 /*return*/, false];
                }
                isRunning = task.status === 'running';
                isAborted = (_b = (_a = task.abortController) === null || _a === void 0 ? void 0 : _a.signal.aborted) !== null && _b !== void 0 ? _b : true;
                active = isRunning && !isAborted;
                (0, debug_js_1.logForDebugging)("[InProcessBackend] isActive() for ".concat(agentId, ": ").concat(active, " (running=").concat(isRunning, ", aborted=").concat(isAborted, ")"));
                return [2 /*return*/, active];
            });
        });
    };
    return InProcessBackend;
}());
exports.InProcessBackend = InProcessBackend;
/**
 * Factory function to create an InProcessBackend instance.
 * Used by the registry (Task #8) to get backend instances.
 */
function createInProcessBackend() {
    return new InProcessBackend();
}
