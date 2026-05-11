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
exports.ITermBackend = void 0;
var debug_js_1 = require("../../../utils/debug.js");
var execFileNoThrow_js_1 = require("../../../utils/execFileNoThrow.js");
var detection_js_1 = require("./detection.js");
var registry_js_1 = require("./registry.js");
// Track session IDs for teammates
var teammateSessionIds = [];
// Track whether the first pane has been used
var firstPaneUsed = false;
// Lock mechanism to prevent race conditions when spawning teammates in parallel
var paneCreationLock = Promise.resolve();
/**
 * Acquires a lock for pane creation, ensuring sequential execution.
 * Returns a release function that must be called when done.
 */
function acquirePaneCreationLock() {
    var release;
    var newLock = new Promise(function (resolve) {
        release = resolve;
    });
    var previousLock = paneCreationLock;
    paneCreationLock = newLock;
    return previousLock.then(function () { return release; });
}
/**
 * Runs an it2 CLI command and returns the result.
 */
function runIt2(args) {
    return (0, execFileNoThrow_js_1.execFileNoThrow)(detection_js_1.IT2_COMMAND, args);
}
/**
 * Parses the session ID from `it2 session split` output.
 * Format: "Created new pane: <session-id>"
 *
 * NOTE: This UUID is only valid when splitting from a specific session
 * using the -s flag. When splitting from the "active" session, the UUID
 * may not be accessible if the split happened in a different window.
 */
function parseSplitOutput(output) {
    var match = output.match(/Created new pane:\s*(.+)/);
    if (match && match[1]) {
        return match[1].trim();
    }
    return '';
}
/**
 * Gets the leader's session ID from ITERM_SESSION_ID env var.
 * Format: "wXtYpZ:UUID" - we extract the UUID part after the colon.
 * Returns null if not in iTerm2 or env var not set.
 */
function getLeaderSessionId() {
    var itermSessionId = process.env.ITERM_SESSION_ID;
    if (!itermSessionId) {
        return null;
    }
    var colonIndex = itermSessionId.indexOf(':');
    if (colonIndex === -1) {
        return null;
    }
    return itermSessionId.slice(colonIndex + 1);
}
/**
 * ITermBackend implements pane management using iTerm2's native split panes
 * via the it2 CLI tool.
 */
var ITermBackend = /** @class */ (function () {
    function ITermBackend() {
        this.type = 'iterm2';
        this.displayName = 'iTerm2';
        this.supportsHideShow = false;
    }
    /**
     * Checks if iTerm2 backend is available (in iTerm2 with it2 CLI installed).
     */
    ITermBackend.prototype.isAvailable = function () {
        return __awaiter(this, void 0, void 0, function () {
            var inITerm2, it2Available;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        inITerm2 = (0, detection_js_1.isInITerm2)();
                        (0, debug_js_1.logForDebugging)("[ITermBackend] isAvailable check: inITerm2=".concat(inITerm2));
                        if (!inITerm2) {
                            (0, debug_js_1.logForDebugging)('[ITermBackend] isAvailable: false (not in iTerm2)');
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, (0, detection_js_1.isIt2CliAvailable)()];
                    case 1:
                        it2Available = _a.sent();
                        (0, debug_js_1.logForDebugging)("[ITermBackend] isAvailable: ".concat(it2Available, " (it2 CLI ").concat(it2Available ? 'found' : 'not found', ")"));
                        return [2 /*return*/, it2Available];
                }
            });
        });
    };
    /**
     * Checks if we're currently running inside iTerm2.
     */
    ITermBackend.prototype.isRunningInside = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                result = (0, detection_js_1.isInITerm2)();
                (0, debug_js_1.logForDebugging)("[ITermBackend] isRunningInside: ".concat(result));
                return [2 /*return*/, result];
            });
        });
    };
    /**
     * Creates a new teammate pane in the swarm view.
     * Uses a lock to prevent race conditions when multiple teammates are spawned in parallel.
     */
    ITermBackend.prototype.createTeammatePaneInSwarmView = function (name, color) {
        return __awaiter(this, void 0, void 0, function () {
            var releaseLock, isFirstTeammate, splitArgs, targetedTeammateId, leaderSessionId, splitResult, listResult, idx, paneId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, debug_js_1.logForDebugging)("[ITermBackend] createTeammatePaneInSwarmView called for ".concat(name, " with color ").concat(color));
                        return [4 /*yield*/, acquirePaneCreationLock()];
                    case 1:
                        releaseLock = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 9, 10]);
                        _a.label = 3;
                    case 3:
                        if (!true) return [3 /*break*/, 8];
                        isFirstTeammate = !firstPaneUsed;
                        (0, debug_js_1.logForDebugging)("[ITermBackend] Creating pane: isFirstTeammate=".concat(isFirstTeammate, ", existingPanes=").concat(teammateSessionIds.length));
                        splitArgs = void 0;
                        targetedTeammateId = void 0;
                        if (isFirstTeammate) {
                            leaderSessionId = getLeaderSessionId();
                            if (leaderSessionId) {
                                splitArgs = ['session', 'split', '-v', '-s', leaderSessionId];
                                (0, debug_js_1.logForDebugging)("[ITermBackend] First split from leader session: ".concat(leaderSessionId));
                            }
                            else {
                                // Fallback to active session if we can't get leader's ID
                                splitArgs = ['session', 'split', '-v'];
                                (0, debug_js_1.logForDebugging)('[ITermBackend] First split from active session (no leader ID)');
                            }
                        }
                        else {
                            // Split from the last teammate's session to stack vertically
                            targetedTeammateId = teammateSessionIds[teammateSessionIds.length - 1];
                            if (targetedTeammateId) {
                                splitArgs = ['session', 'split', '-s', targetedTeammateId];
                                (0, debug_js_1.logForDebugging)("[ITermBackend] Subsequent split from teammate session: ".concat(targetedTeammateId));
                            }
                            else {
                                // Fallback to active session
                                splitArgs = ['session', 'split'];
                                (0, debug_js_1.logForDebugging)('[ITermBackend] Subsequent split from active session (no teammate ID)');
                            }
                        }
                        return [4 /*yield*/, runIt2(splitArgs)];
                    case 4:
                        splitResult = _a.sent();
                        if (!(splitResult.code !== 0)) return [3 /*break*/, 7];
                        if (!targetedTeammateId) return [3 /*break*/, 6];
                        return [4 /*yield*/, runIt2(['session', 'list'])];
                    case 5:
                        listResult = _a.sent();
                        if (listResult.code === 0 &&
                            !listResult.stdout.includes(targetedTeammateId)) {
                            // Confirmed dead — prune and retry with next-to-last (or leader).
                            (0, debug_js_1.logForDebugging)("[ITermBackend] Split failed targeting dead session ".concat(targetedTeammateId, ", pruning and retrying: ").concat(splitResult.stderr));
                            idx = teammateSessionIds.indexOf(targetedTeammateId);
                            if (idx !== -1) {
                                teammateSessionIds.splice(idx, 1);
                            }
                            if (teammateSessionIds.length === 0) {
                                firstPaneUsed = false;
                            }
                            return [3 /*break*/, 3];
                        }
                        _a.label = 6;
                    case 6: throw new Error("Failed to create iTerm2 split pane: ".concat(splitResult.stderr));
                    case 7:
                        if (isFirstTeammate) {
                            firstPaneUsed = true;
                        }
                        paneId = parseSplitOutput(splitResult.stdout);
                        if (!paneId) {
                            throw new Error("Failed to parse session ID from split output: ".concat(splitResult.stdout));
                        }
                        (0, debug_js_1.logForDebugging)("[ITermBackend] Created teammate pane for ".concat(name, ": ").concat(paneId));
                        teammateSessionIds.push(paneId);
                        // Set pane color and title
                        // Skip color and title for now - each it2 call is slow (Python process + API)
                        // The pane is functional without these cosmetic features
                        // TODO: Consider batching these or making them async/fire-and-forget
                        return [2 /*return*/, { paneId: paneId, isFirstTeammate: isFirstTeammate }];
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        releaseLock();
                        return [7 /*endfinally*/];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Sends a command to a specific pane.
     */
    ITermBackend.prototype.sendCommandToPane = function (paneId, command, _useExternalSession) {
        return __awaiter(this, void 0, void 0, function () {
            var args, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        args = paneId
                            ? ['session', 'run', '-s', paneId, command]
                            : ['session', 'run', command];
                        return [4 /*yield*/, runIt2(args)];
                    case 1:
                        result = _a.sent();
                        if (result.code !== 0) {
                            throw new Error("Failed to send command to iTerm2 pane ".concat(paneId, ": ").concat(result.stderr));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * No-op for iTerm2 - tab colors would require escape sequences but we skip
     * them for performance (each it2 call is slow).
     */
    ITermBackend.prototype.setPaneBorderColor = function (_paneId, _color, _useExternalSession) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    /**
     * No-op for iTerm2 - titles would require escape sequences but we skip
     * them for performance (each it2 call is slow).
     */
    ITermBackend.prototype.setPaneTitle = function (_paneId, _name, _color, _useExternalSession) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    /**
     * No-op for iTerm2 - pane titles are shown in tabs automatically.
     */
    ITermBackend.prototype.enablePaneBorderStatus = function (_windowTarget, _useExternalSession) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    /**
     * No-op for iTerm2 - pane balancing is handled automatically.
     */
    ITermBackend.prototype.rebalancePanes = function (_windowTarget, _hasLeader) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // iTerm2 handles pane balancing automatically
                (0, debug_js_1.logForDebugging)('[ITermBackend] Pane rebalancing not implemented for iTerm2');
                return [2 /*return*/];
            });
        });
    };
    /**
     * Kills/closes a specific pane using the it2 CLI.
     * Also removes the pane from tracked session IDs so subsequent spawns
     * don't try to split from a dead session.
     */
    ITermBackend.prototype.killPane = function (paneId, _useExternalSession) {
        return __awaiter(this, void 0, void 0, function () {
            var result, idx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, runIt2(['session', 'close', '-f', '-s', paneId])
                        // Clean up module state regardless of close result — even if the pane is
                        // already gone (e.g., user closed it manually), removing the stale ID is correct.
                    ];
                    case 1:
                        result = _a.sent();
                        idx = teammateSessionIds.indexOf(paneId);
                        if (idx !== -1) {
                            teammateSessionIds.splice(idx, 1);
                        }
                        if (teammateSessionIds.length === 0) {
                            firstPaneUsed = false;
                        }
                        return [2 /*return*/, result.code === 0];
                }
            });
        });
    };
    /**
     * Stub for hiding a pane - not supported in iTerm2 backend.
     * iTerm2 doesn't have a direct equivalent to tmux's break-pane.
     */
    ITermBackend.prototype.hidePane = function (_paneId, _useExternalSession) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                (0, debug_js_1.logForDebugging)('[ITermBackend] hidePane not supported in iTerm2');
                return [2 /*return*/, false];
            });
        });
    };
    /**
     * Stub for showing a hidden pane - not supported in iTerm2 backend.
     * iTerm2 doesn't have a direct equivalent to tmux's join-pane.
     */
    ITermBackend.prototype.showPane = function (_paneId, _targetWindowOrPane, _useExternalSession) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                (0, debug_js_1.logForDebugging)('[ITermBackend] showPane not supported in iTerm2');
                return [2 /*return*/, false];
            });
        });
    };
    return ITermBackend;
}());
exports.ITermBackend = ITermBackend;
// Register the backend with the registry when this module is imported.
// This side effect is intentional - the registry needs backends to self-register to avoid circular dependencies.
// eslint-disable-next-line custom-rules/no-top-level-side-effects
(0, registry_js_1.registerITermBackend)(ITermBackend);
