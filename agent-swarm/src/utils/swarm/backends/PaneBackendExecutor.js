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
exports.PaneBackendExecutor = void 0;
exports.createPaneBackendExecutor = createPaneBackendExecutor;
var state_js_1 = require("../../../bootstrap/state.js");
var agentId_js_1 = require("../../../utils/agentId.js");
var shellQuote_js_1 = require("../../../utils/bash/shellQuote.js");
var cleanupRegistry_js_1 = require("../../../utils/cleanupRegistry.js");
var debug_js_1 = require("../../../utils/debug.js");
var slowOperations_js_1 = require("../../../utils/slowOperations.js");
var teammateMailbox_js_1 = require("../../../utils/teammateMailbox.js");
var spawnUtils_js_1 = require("../spawnUtils.js");
var teammateLayoutManager_js_1 = require("../teammateLayoutManager.js");
var detection_js_1 = require("./detection.js");
/**
 * PaneBackendExecutor adapts a PaneBackend to the TeammateExecutor interface.
 *
 * This allows pane-based backends (tmux, iTerm2) to be used through the same
 * TeammateExecutor abstraction as InProcessBackend, making getTeammateExecutor()
 * return a meaningful executor regardless of execution mode.
 *
 * The adapter handles:
 * - spawn(): Creates a pane and sends the Claude CLI command to it
 * - sendMessage(): Writes to the teammate's file-based mailbox
 * - terminate(): Sends a shutdown request via mailbox
 * - kill(): Kills the pane via the backend
 * - isActive(): Checks if the pane is still running
 */
var PaneBackendExecutor = /** @class */ (function () {
    function PaneBackendExecutor(backend) {
        this.context = null;
        this.cleanupRegistered = false;
        this.backend = backend;
        this.type = backend.type;
        this.spawnedTeammates = new Map();
    }
    /**
     * Sets the ToolUseContext for this executor.
     * Must be called before spawn() to provide access to AppState and permissions.
     */
    PaneBackendExecutor.prototype.setContext = function (context) {
        this.context = context;
    };
    /**
     * Checks if the underlying pane backend is available.
     */
    PaneBackendExecutor.prototype.isAvailable = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.backend.isAvailable()];
            });
        });
    };
    /**
     * Spawns a teammate in a new pane.
     *
     * Creates a pane via the backend, builds the CLI command with teammate
     * identity flags, and sends it to the pane.
     */
    PaneBackendExecutor.prototype.spawn = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var agentId, teammateColor, _a, paneId, isFirstTeammate, insideTmux, binaryPath, teammateArgs, appState, inheritedFlags, flagsStr, workingDir, envStr, spawnCommand, error_1, errorMessage;
            var _this = this;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        agentId = (0, agentId_js_1.formatAgentId)(config.name, config.teamName);
                        if (!this.context) {
                            (0, debug_js_1.logForDebugging)("[PaneBackendExecutor] spawn() called without context for ".concat(config.name));
                            return [2 /*return*/, {
                                    success: false,
                                    agentId: agentId,
                                    error: 'PaneBackendExecutor not initialized. Call setContext() before spawn().',
                                }];
                        }
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 8, , 9]);
                        teammateColor = (_b = config.color) !== null && _b !== void 0 ? _b : (0, teammateLayoutManager_js_1.assignTeammateColor)(agentId);
                        return [4 /*yield*/, this.backend.createTeammatePaneInSwarmView(config.name, teammateColor)
                            // Check if we're inside tmux to determine how to send commands
                        ];
                    case 2:
                        _a = _c.sent(), paneId = _a.paneId, isFirstTeammate = _a.isFirstTeammate;
                        return [4 /*yield*/, (0, detection_js_1.isInsideTmux)()
                            // Enable pane border status on first teammate when inside tmux
                        ];
                    case 3:
                        insideTmux = _c.sent();
                        if (!(isFirstTeammate && insideTmux)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.backend.enablePaneBorderStatus()];
                    case 4:
                        _c.sent();
                        _c.label = 5;
                    case 5:
                        binaryPath = (0, spawnUtils_js_1.getTeammateCommand)();
                        teammateArgs = [
                            "--agent-id ".concat((0, shellQuote_js_1.quote)([agentId])),
                            "--agent-name ".concat((0, shellQuote_js_1.quote)([config.name])),
                            "--team-name ".concat((0, shellQuote_js_1.quote)([config.teamName])),
                            "--agent-color ".concat((0, shellQuote_js_1.quote)([teammateColor])),
                            "--parent-session-id ".concat((0, shellQuote_js_1.quote)([config.parentSessionId || (0, state_js_1.getSessionId)()])),
                            config.planModeRequired ? '--plan-mode-required' : '',
                        ]
                            .filter(Boolean)
                            .join(' ');
                        appState = this.context.getAppState();
                        inheritedFlags = (0, spawnUtils_js_1.buildInheritedCliFlags)({
                            planModeRequired: config.planModeRequired,
                            permissionMode: appState.toolPermissionContext.mode,
                        });
                        // If teammate has a custom model, add --model flag (or replace inherited one)
                        if (config.model) {
                            inheritedFlags = inheritedFlags
                                .split(' ')
                                .filter(function (flag, i, arr) { return flag !== '--model' && arr[i - 1] !== '--model'; })
                                .join(' ');
                            inheritedFlags = inheritedFlags
                                ? "".concat(inheritedFlags, " --model ").concat((0, shellQuote_js_1.quote)([config.model]))
                                : "--model ".concat((0, shellQuote_js_1.quote)([config.model]));
                        }
                        flagsStr = inheritedFlags ? " ".concat(inheritedFlags) : '';
                        workingDir = config.cwd;
                        envStr = (0, spawnUtils_js_1.buildInheritedEnvVars)();
                        spawnCommand = "cd ".concat((0, shellQuote_js_1.quote)([workingDir]), " && env ").concat(envStr, " ").concat((0, shellQuote_js_1.quote)([binaryPath]), " ").concat(teammateArgs).concat(flagsStr);
                        // Send the command to the new pane
                        // Use swarm socket when running outside tmux (external swarm session)
                        return [4 /*yield*/, this.backend.sendCommandToPane(paneId, spawnCommand, !insideTmux)
                            // Track the spawned teammate
                        ];
                    case 6:
                        // Send the command to the new pane
                        // Use swarm socket when running outside tmux (external swarm session)
                        _c.sent();
                        // Track the spawned teammate
                        this.spawnedTeammates.set(agentId, { paneId: paneId, insideTmux: insideTmux });
                        // Register cleanup to kill all panes on leader exit (e.g., SIGHUP)
                        if (!this.cleanupRegistered) {
                            this.cleanupRegistered = true;
                            (0, cleanupRegistry_js_1.registerCleanup)(function () { return __awaiter(_this, void 0, void 0, function () {
                                var _i, _a, _b, id, info;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            _i = 0, _a = this.spawnedTeammates;
                                            _c.label = 1;
                                        case 1:
                                            if (!(_i < _a.length)) return [3 /*break*/, 4];
                                            _b = _a[_i], id = _b[0], info = _b[1];
                                            (0, debug_js_1.logForDebugging)("[PaneBackendExecutor] Cleanup: killing pane for ".concat(id));
                                            return [4 /*yield*/, this.backend.killPane(info.paneId, !info.insideTmux)];
                                        case 2:
                                            _c.sent();
                                            _c.label = 3;
                                        case 3:
                                            _i++;
                                            return [3 /*break*/, 1];
                                        case 4:
                                            this.spawnedTeammates.clear();
                                            return [2 /*return*/];
                                    }
                                });
                            }); });
                        }
                        // Send initial instructions to teammate via mailbox
                        return [4 /*yield*/, (0, teammateMailbox_js_1.writeToMailbox)(config.name, {
                                from: 'team-lead',
                                text: config.prompt,
                                timestamp: new Date().toISOString(),
                            }, config.teamName)];
                    case 7:
                        // Send initial instructions to teammate via mailbox
                        _c.sent();
                        (0, debug_js_1.logForDebugging)("[PaneBackendExecutor] Spawned teammate ".concat(agentId, " in pane ").concat(paneId));
                        return [2 /*return*/, {
                                success: true,
                                agentId: agentId,
                                paneId: paneId,
                            }];
                    case 8:
                        error_1 = _c.sent();
                        errorMessage = error_1 instanceof Error ? error_1.message : String(error_1);
                        (0, debug_js_1.logForDebugging)("[PaneBackendExecutor] Failed to spawn ".concat(agentId, ": ").concat(errorMessage));
                        return [2 /*return*/, {
                                success: false,
                                agentId: agentId,
                                error: errorMessage,
                            }];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Sends a message to a pane-based teammate via file-based mailbox.
     *
     * All teammates (pane and in-process) use the same mailbox mechanism.
     */
    PaneBackendExecutor.prototype.sendMessage = function (agentId, message) {
        return __awaiter(this, void 0, void 0, function () {
            var parsed, agentName, teamName;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        (0, debug_js_1.logForDebugging)("[PaneBackendExecutor] sendMessage() to ".concat(agentId, ": ").concat(message.text.substring(0, 50), "..."));
                        parsed = (0, agentId_js_1.parseAgentId)(agentId);
                        if (!parsed) {
                            throw new Error("Invalid agentId format: ".concat(agentId, ". Expected format: agentName@teamName"));
                        }
                        agentName = parsed.agentName, teamName = parsed.teamName;
                        return [4 /*yield*/, (0, teammateMailbox_js_1.writeToMailbox)(agentName, {
                                text: message.text,
                                from: message.from,
                                color: message.color,
                                timestamp: (_a = message.timestamp) !== null && _a !== void 0 ? _a : new Date().toISOString(),
                            }, teamName)];
                    case 1:
                        _b.sent();
                        (0, debug_js_1.logForDebugging)("[PaneBackendExecutor] sendMessage() completed for ".concat(agentId));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Gracefully terminates a pane-based teammate.
     *
     * For pane-based teammates, we send a shutdown request via mailbox and
     * let the teammate process handle exit gracefully.
     */
    PaneBackendExecutor.prototype.terminate = function (agentId, reason) {
        return __awaiter(this, void 0, void 0, function () {
            var parsed, agentName, teamName, shutdownRequest;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, debug_js_1.logForDebugging)("[PaneBackendExecutor] terminate() called for ".concat(agentId, ": ").concat(reason));
                        parsed = (0, agentId_js_1.parseAgentId)(agentId);
                        if (!parsed) {
                            (0, debug_js_1.logForDebugging)("[PaneBackendExecutor] terminate() failed: invalid agentId format");
                            return [2 /*return*/, false];
                        }
                        agentName = parsed.agentName, teamName = parsed.teamName;
                        shutdownRequest = {
                            type: 'shutdown_request',
                            requestId: "shutdown-".concat(agentId, "-").concat(Date.now()),
                            from: 'team-lead',
                            reason: reason,
                        };
                        return [4 /*yield*/, (0, teammateMailbox_js_1.writeToMailbox)(agentName, {
                                from: 'team-lead',
                                text: (0, slowOperations_js_1.jsonStringify)(shutdownRequest),
                                timestamp: new Date().toISOString(),
                            }, teamName)];
                    case 1:
                        _a.sent();
                        (0, debug_js_1.logForDebugging)("[PaneBackendExecutor] terminate() sent shutdown request to ".concat(agentId));
                        return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     * Force kills a pane-based teammate by killing its pane.
     */
    PaneBackendExecutor.prototype.kill = function (agentId) {
        return __awaiter(this, void 0, void 0, function () {
            var teammateInfo, paneId, insideTmux, killed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, debug_js_1.logForDebugging)("[PaneBackendExecutor] kill() called for ".concat(agentId));
                        teammateInfo = this.spawnedTeammates.get(agentId);
                        if (!teammateInfo) {
                            (0, debug_js_1.logForDebugging)("[PaneBackendExecutor] kill() failed: teammate ".concat(agentId, " not found in spawned map"));
                            return [2 /*return*/, false];
                        }
                        paneId = teammateInfo.paneId, insideTmux = teammateInfo.insideTmux;
                        return [4 /*yield*/, this.backend.killPane(paneId, !insideTmux)];
                    case 1:
                        killed = _a.sent();
                        if (killed) {
                            this.spawnedTeammates.delete(agentId);
                            (0, debug_js_1.logForDebugging)("[PaneBackendExecutor] kill() succeeded for ".concat(agentId));
                        }
                        else {
                            (0, debug_js_1.logForDebugging)("[PaneBackendExecutor] kill() failed for ".concat(agentId));
                        }
                        return [2 /*return*/, killed];
                }
            });
        });
    };
    /**
     * Checks if a pane-based teammate is still active.
     *
     * For pane-based teammates, we check if the pane still exists.
     * This is a best-effort check - the pane may exist but the process inside
     * may have exited.
     */
    PaneBackendExecutor.prototype.isActive = function (agentId) {
        return __awaiter(this, void 0, void 0, function () {
            var teammateInfo;
            return __generator(this, function (_a) {
                (0, debug_js_1.logForDebugging)("[PaneBackendExecutor] isActive() called for ".concat(agentId));
                teammateInfo = this.spawnedTeammates.get(agentId);
                if (!teammateInfo) {
                    (0, debug_js_1.logForDebugging)("[PaneBackendExecutor] isActive(): teammate ".concat(agentId, " not found"));
                    return [2 /*return*/, false];
                }
                // For now, assume active if we have a record of it
                // A more robust check would query the backend for pane existence
                // but that would require adding a new method to PaneBackend
                return [2 /*return*/, true];
            });
        });
    };
    return PaneBackendExecutor;
}());
exports.PaneBackendExecutor = PaneBackendExecutor;
/**
 * Creates a PaneBackendExecutor wrapping the given PaneBackend.
 */
function createPaneBackendExecutor(backend) {
    return new PaneBackendExecutor(backend);
}
