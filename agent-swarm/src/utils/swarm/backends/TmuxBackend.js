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
exports.TmuxBackend = void 0;
var debug_js_1 = require("../../../utils/debug.js");
var execFileNoThrow_js_1 = require("../../../utils/execFileNoThrow.js");
var log_js_1 = require("../../../utils/log.js");
var array_js_1 = require("../../array.js");
var sleep_js_1 = require("../../sleep.js");
var constants_js_1 = require("../constants.js");
var detection_js_1 = require("./detection.js");
var registry_js_1 = require("./registry.js");
// Track whether the first pane has been used for external swarm session
var firstPaneUsedForExternal = false;
// Cached leader window target (session:window format) to avoid repeated queries
var cachedLeaderWindowTarget = null;
// Lock mechanism to prevent race conditions when spawning teammates in parallel
var paneCreationLock = Promise.resolve();
// Delay after pane creation to allow shell initialization (loading rc files, prompts, etc.)
// 200ms is enough for most shell configurations including slow ones like starship/oh-my-zsh
var PANE_SHELL_INIT_DELAY_MS = 200;
function waitForPaneShellReady() {
    return (0, sleep_js_1.sleep)(PANE_SHELL_INIT_DELAY_MS);
}
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
 * Gets the tmux color name for a given agent color.
 * These are tmux's built-in color names that work with pane-border-style.
 */
function getTmuxColorName(color) {
    var tmuxColors = {
        red: 'red',
        blue: 'blue',
        green: 'green',
        yellow: 'yellow',
        purple: 'magenta',
        orange: 'colour208',
        pink: 'colour205',
        cyan: 'cyan',
    };
    return tmuxColors[color];
}
/**
 * Runs a tmux command in the user's original tmux session (no socket override).
 * Use this for operations that interact with the user's tmux panes (split-pane with leader).
 */
function runTmuxInUserSession(args) {
    return (0, execFileNoThrow_js_1.execFileNoThrow)(constants_js_1.TMUX_COMMAND, args);
}
/**
 * Runs a tmux command in the external swarm socket.
 * Use this for operations in the standalone swarm session (when user is not in tmux).
 */
function runTmuxInSwarm(args) {
    return (0, execFileNoThrow_js_1.execFileNoThrow)(constants_js_1.TMUX_COMMAND, __spreadArray(['-L', (0, constants_js_1.getSwarmSocketName)()], args, true));
}
/**
 * TmuxBackend implements PaneBackend using tmux for pane management.
 *
 * When running INSIDE tmux (leader is in tmux):
 * - Splits the current window to add teammates alongside the leader
 * - Leader stays on left (30%), teammates on right (70%)
 *
 * When running OUTSIDE tmux (leader is in regular terminal):
 * - Creates a claude-swarm session with a swarm-view window
 * - All teammates are equally distributed (no leader pane)
 */
var TmuxBackend = /** @class */ (function () {
    function TmuxBackend() {
        this.type = 'tmux';
        this.displayName = 'tmux';
        this.supportsHideShow = true;
    }
    /**
     * Checks if tmux is installed and available.
     * Delegates to detection.ts for consistent detection logic.
     */
    TmuxBackend.prototype.isAvailable = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, detection_js_1.isTmuxAvailable)()];
            });
        });
    };
    /**
     * Checks if we're currently running inside a tmux session.
     * Delegates to detection.ts for consistent detection logic.
     */
    TmuxBackend.prototype.isRunningInside = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, detection_js_1.isInsideTmux)()];
            });
        });
    };
    /**
     * Creates a new teammate pane in the swarm view.
     * Uses a lock to prevent race conditions when multiple teammates are spawned in parallel.
     */
    TmuxBackend.prototype.createTeammatePaneInSwarmView = function (name, color) {
        return __awaiter(this, void 0, void 0, function () {
            var releaseLock, insideTmux;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, acquirePaneCreationLock()];
                    case 1:
                        releaseLock = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, , 7, 8]);
                        return [4 /*yield*/, this.isRunningInside()];
                    case 3:
                        insideTmux = _a.sent();
                        if (!insideTmux) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.createTeammatePaneWithLeader(name, color)];
                    case 4: return [2 /*return*/, _a.sent()];
                    case 5: return [4 /*yield*/, this.createTeammatePaneExternal(name, color)];
                    case 6: return [2 /*return*/, _a.sent()];
                    case 7:
                        releaseLock();
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Sends a command to a specific pane.
     */
    TmuxBackend.prototype.sendCommandToPane = function (paneId_1, command_1) {
        return __awaiter(this, arguments, void 0, function (paneId, command, useExternalSession) {
            var runTmux, result;
            if (useExternalSession === void 0) { useExternalSession = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        runTmux = useExternalSession ? runTmuxInSwarm : runTmuxInUserSession;
                        return [4 /*yield*/, runTmux(['send-keys', '-t', paneId, command, 'Enter'])];
                    case 1:
                        result = _a.sent();
                        if (result.code !== 0) {
                            throw new Error("Failed to send command to pane ".concat(paneId, ": ").concat(result.stderr));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Sets the border color for a specific pane.
     */
    TmuxBackend.prototype.setPaneBorderColor = function (paneId_1, color_1) {
        return __awaiter(this, arguments, void 0, function (paneId, color, useExternalSession) {
            var tmuxColor, runTmux;
            if (useExternalSession === void 0) { useExternalSession = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tmuxColor = getTmuxColorName(color);
                        runTmux = useExternalSession ? runTmuxInSwarm : runTmuxInUserSession;
                        // Set pane-specific border style using pane options (requires tmux 3.2+)
                        return [4 /*yield*/, runTmux([
                                'select-pane',
                                '-t',
                                paneId,
                                '-P',
                                "bg=default,fg=".concat(tmuxColor),
                            ])];
                    case 1:
                        // Set pane-specific border style using pane options (requires tmux 3.2+)
                        _a.sent();
                        return [4 /*yield*/, runTmux([
                                'set-option',
                                '-p',
                                '-t',
                                paneId,
                                'pane-border-style',
                                "fg=".concat(tmuxColor),
                            ])];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, runTmux([
                                'set-option',
                                '-p',
                                '-t',
                                paneId,
                                'pane-active-border-style',
                                "fg=".concat(tmuxColor),
                            ])];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Sets the title for a pane (shown in pane border if pane-border-status is set).
     */
    TmuxBackend.prototype.setPaneTitle = function (paneId_1, name_1, color_1) {
        return __awaiter(this, arguments, void 0, function (paneId, name, color, useExternalSession) {
            var tmuxColor, runTmux;
            if (useExternalSession === void 0) { useExternalSession = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tmuxColor = getTmuxColorName(color);
                        runTmux = useExternalSession ? runTmuxInSwarm : runTmuxInUserSession;
                        // Set the pane title
                        return [4 /*yield*/, runTmux(['select-pane', '-t', paneId, '-T', name])
                            // Enable pane border status with colored format
                        ];
                    case 1:
                        // Set the pane title
                        _a.sent();
                        // Enable pane border status with colored format
                        return [4 /*yield*/, runTmux([
                                'set-option',
                                '-p',
                                '-t',
                                paneId,
                                'pane-border-format',
                                "#[fg=".concat(tmuxColor, ",bold] #{pane_title} #[default]"),
                            ])];
                    case 2:
                        // Enable pane border status with colored format
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Enables pane border status for a window (shows pane titles).
     */
    TmuxBackend.prototype.enablePaneBorderStatus = function (windowTarget_1) {
        return __awaiter(this, arguments, void 0, function (windowTarget, useExternalSession) {
            var target, _a, runTmux;
            if (useExternalSession === void 0) { useExternalSession = false; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = windowTarget;
                        if (_a) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getCurrentWindowTarget()];
                    case 1:
                        _a = (_b.sent());
                        _b.label = 2;
                    case 2:
                        target = _a;
                        if (!target) {
                            return [2 /*return*/];
                        }
                        runTmux = useExternalSession ? runTmuxInSwarm : runTmuxInUserSession;
                        return [4 /*yield*/, runTmux([
                                'set-option',
                                '-w',
                                '-t',
                                target,
                                'pane-border-status',
                                'top',
                            ])];
                    case 3:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Rebalances panes to achieve the desired layout.
     */
    TmuxBackend.prototype.rebalancePanes = function (windowTarget, hasLeader) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!hasLeader) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.rebalancePanesWithLeader(windowTarget)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.rebalancePanesTiled(windowTarget)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Kills/closes a specific pane.
     */
    TmuxBackend.prototype.killPane = function (paneId_1) {
        return __awaiter(this, arguments, void 0, function (paneId, useExternalSession) {
            var runTmux, result;
            if (useExternalSession === void 0) { useExternalSession = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        runTmux = useExternalSession ? runTmuxInSwarm : runTmuxInUserSession;
                        return [4 /*yield*/, runTmux(['kill-pane', '-t', paneId])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.code === 0];
                }
            });
        });
    };
    /**
     * Hides a pane by moving it to a detached hidden session.
     * Creates the hidden session if it doesn't exist, then uses break-pane to move the pane there.
     */
    TmuxBackend.prototype.hidePane = function (paneId_1) {
        return __awaiter(this, arguments, void 0, function (paneId, useExternalSession) {
            var runTmux, result;
            if (useExternalSession === void 0) { useExternalSession = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        runTmux = useExternalSession ? runTmuxInSwarm : runTmuxInUserSession;
                        // Create hidden session if it doesn't exist (detached, not visible)
                        return [4 /*yield*/, runTmux(['new-session', '-d', '-s', constants_js_1.HIDDEN_SESSION_NAME])
                            // Move the pane to the hidden session
                        ];
                    case 1:
                        // Create hidden session if it doesn't exist (detached, not visible)
                        _a.sent();
                        return [4 /*yield*/, runTmux([
                                'break-pane',
                                '-d',
                                '-s',
                                paneId,
                                '-t',
                                "".concat(constants_js_1.HIDDEN_SESSION_NAME, ":"),
                            ])];
                    case 2:
                        result = _a.sent();
                        if (result.code === 0) {
                            (0, debug_js_1.logForDebugging)("[TmuxBackend] Hidden pane ".concat(paneId));
                        }
                        else {
                            (0, debug_js_1.logForDebugging)("[TmuxBackend] Failed to hide pane ".concat(paneId, ": ").concat(result.stderr));
                        }
                        return [2 /*return*/, result.code === 0];
                }
            });
        });
    };
    /**
     * Shows a previously hidden pane by joining it back into the target window.
     * Uses `tmux join-pane` to move the pane back, then reapplies main-vertical layout
     * with leader at 30%.
     */
    TmuxBackend.prototype.showPane = function (paneId_1, targetWindowOrPane_1) {
        return __awaiter(this, arguments, void 0, function (paneId, targetWindowOrPane, useExternalSession) {
            var runTmux, result, panesResult, panes;
            if (useExternalSession === void 0) { useExternalSession = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        runTmux = useExternalSession ? runTmuxInSwarm : runTmuxInUserSession;
                        return [4 /*yield*/, runTmux([
                                'join-pane',
                                '-h',
                                '-s',
                                paneId,
                                '-t',
                                targetWindowOrPane,
                            ])];
                    case 1:
                        result = _a.sent();
                        if (result.code !== 0) {
                            (0, debug_js_1.logForDebugging)("[TmuxBackend] Failed to show pane ".concat(paneId, ": ").concat(result.stderr));
                            return [2 /*return*/, false];
                        }
                        (0, debug_js_1.logForDebugging)("[TmuxBackend] Showed pane ".concat(paneId, " in ").concat(targetWindowOrPane));
                        // Reapply main-vertical layout with leader at 30%
                        return [4 /*yield*/, runTmux(['select-layout', '-t', targetWindowOrPane, 'main-vertical'])
                            // Get the first pane (leader) and resize to 30%
                        ];
                    case 2:
                        // Reapply main-vertical layout with leader at 30%
                        _a.sent();
                        return [4 /*yield*/, runTmux([
                                'list-panes',
                                '-t',
                                targetWindowOrPane,
                                '-F',
                                '#{pane_id}',
                            ])];
                    case 3:
                        panesResult = _a.sent();
                        panes = panesResult.stdout.trim().split('\n').filter(Boolean);
                        if (!panes[0]) return [3 /*break*/, 5];
                        return [4 /*yield*/, runTmux(['resize-pane', '-t', panes[0], '-x', '30%'])];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/, true];
                }
            });
        });
    };
    // Private helper methods
    /**
     * Gets the leader's pane ID.
     * Uses the TMUX_PANE env var captured at module load to ensure we always
     * get the leader's original pane, even if the user has switched panes.
     */
    TmuxBackend.prototype.getCurrentPaneId = function () {
        return __awaiter(this, void 0, void 0, function () {
            var leaderPane, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        leaderPane = (0, detection_js_1.getLeaderPaneId)();
                        if (leaderPane) {
                            return [2 /*return*/, leaderPane];
                        }
                        return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)(constants_js_1.TMUX_COMMAND, [
                                'display-message',
                                '-p',
                                '#{pane_id}',
                            ])];
                    case 1:
                        result = _a.sent();
                        if (result.code !== 0) {
                            (0, debug_js_1.logForDebugging)("[TmuxBackend] Failed to get current pane ID (exit ".concat(result.code, "): ").concat(result.stderr));
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, result.stdout.trim()];
                }
            });
        });
    };
    /**
     * Gets the leader's window target (session:window format).
     * Uses the leader's pane ID to query for its window, ensuring we get the
     * correct window even if the user has switched to a different window.
     * Caches the result since the leader's window won't change.
     */
    TmuxBackend.prototype.getCurrentWindowTarget = function () {
        return __awaiter(this, void 0, void 0, function () {
            var leaderPane, args, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Return cached value if available
                        if (cachedLeaderWindowTarget) {
                            return [2 /*return*/, cachedLeaderWindowTarget];
                        }
                        leaderPane = (0, detection_js_1.getLeaderPaneId)();
                        args = ['display-message'];
                        if (leaderPane) {
                            args.push('-t', leaderPane);
                        }
                        args.push('-p', '#{session_name}:#{window_index}');
                        return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)(constants_js_1.TMUX_COMMAND, args)];
                    case 1:
                        result = _a.sent();
                        if (result.code !== 0) {
                            (0, debug_js_1.logForDebugging)("[TmuxBackend] Failed to get current window target (exit ".concat(result.code, "): ").concat(result.stderr));
                            return [2 /*return*/, null];
                        }
                        cachedLeaderWindowTarget = result.stdout.trim();
                        return [2 /*return*/, cachedLeaderWindowTarget];
                }
            });
        });
    };
    /**
     * Gets the number of panes in a window.
     */
    TmuxBackend.prototype.getCurrentWindowPaneCount = function (windowTarget_1) {
        return __awaiter(this, arguments, void 0, function (windowTarget, useSwarmSocket) {
            var target, _a, args, result, _b;
            if (useSwarmSocket === void 0) { useSwarmSocket = false; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = windowTarget;
                        if (_a) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getCurrentWindowTarget()];
                    case 1:
                        _a = (_c.sent());
                        _c.label = 2;
                    case 2:
                        target = _a;
                        if (!target) {
                            return [2 /*return*/, null];
                        }
                        args = ['list-panes', '-t', target, '-F', '#{pane_id}'];
                        if (!useSwarmSocket) return [3 /*break*/, 4];
                        return [4 /*yield*/, runTmuxInSwarm(args)];
                    case 3:
                        _b = _c.sent();
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, runTmuxInUserSession(args)];
                    case 5:
                        _b = _c.sent();
                        _c.label = 6;
                    case 6:
                        result = _b;
                        if (result.code !== 0) {
                            (0, log_js_1.logError)(new Error("[TmuxBackend] Failed to get pane count for ".concat(target, " (exit ").concat(result.code, "): ").concat(result.stderr)));
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, (0, array_js_1.count)(result.stdout.trim().split('\n'), Boolean)];
                }
            });
        });
    };
    /**
     * Checks if a tmux session exists in the swarm socket.
     */
    TmuxBackend.prototype.hasSessionInSwarm = function (sessionName) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, runTmuxInSwarm(['has-session', '-t', sessionName])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.code === 0];
                }
            });
        });
    };
    /**
     * Creates the swarm session with a single window for teammates when running outside tmux.
     */
    TmuxBackend.prototype.createExternalSwarmSession = function () {
        return __awaiter(this, void 0, void 0, function () {
            var sessionExists, result, paneId, windowTarget_1, listResult, windows, windowTarget, paneResult, panes, createResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.hasSessionInSwarm(constants_js_1.SWARM_SESSION_NAME)];
                    case 1:
                        sessionExists = _a.sent();
                        if (!!sessionExists) return [3 /*break*/, 3];
                        return [4 /*yield*/, runTmuxInSwarm([
                                'new-session',
                                '-d',
                                '-s',
                                constants_js_1.SWARM_SESSION_NAME,
                                '-n',
                                constants_js_1.SWARM_VIEW_WINDOW_NAME,
                                '-P',
                                '-F',
                                '#{pane_id}',
                            ])];
                    case 2:
                        result = _a.sent();
                        if (result.code !== 0) {
                            throw new Error("Failed to create swarm session: ".concat(result.stderr || 'Unknown error'));
                        }
                        paneId = result.stdout.trim();
                        windowTarget_1 = "".concat(constants_js_1.SWARM_SESSION_NAME, ":").concat(constants_js_1.SWARM_VIEW_WINDOW_NAME);
                        (0, debug_js_1.logForDebugging)("[TmuxBackend] Created external swarm session with window ".concat(windowTarget_1, ", pane ").concat(paneId));
                        return [2 /*return*/, { windowTarget: windowTarget_1, paneId: paneId }];
                    case 3: return [4 /*yield*/, runTmuxInSwarm([
                            'list-windows',
                            '-t',
                            constants_js_1.SWARM_SESSION_NAME,
                            '-F',
                            '#{window_name}',
                        ])];
                    case 4:
                        listResult = _a.sent();
                        windows = listResult.stdout.trim().split('\n').filter(Boolean);
                        windowTarget = "".concat(constants_js_1.SWARM_SESSION_NAME, ":").concat(constants_js_1.SWARM_VIEW_WINDOW_NAME);
                        if (!windows.includes(constants_js_1.SWARM_VIEW_WINDOW_NAME)) return [3 /*break*/, 6];
                        return [4 /*yield*/, runTmuxInSwarm([
                                'list-panes',
                                '-t',
                                windowTarget,
                                '-F',
                                '#{pane_id}',
                            ])];
                    case 5:
                        paneResult = _a.sent();
                        panes = paneResult.stdout.trim().split('\n').filter(Boolean);
                        return [2 /*return*/, { windowTarget: windowTarget, paneId: panes[0] || '' }];
                    case 6: return [4 /*yield*/, runTmuxInSwarm([
                            'new-window',
                            '-t',
                            constants_js_1.SWARM_SESSION_NAME,
                            '-n',
                            constants_js_1.SWARM_VIEW_WINDOW_NAME,
                            '-P',
                            '-F',
                            '#{pane_id}',
                        ])];
                    case 7:
                        createResult = _a.sent();
                        if (createResult.code !== 0) {
                            throw new Error("Failed to create swarm-view window: ".concat(createResult.stderr || 'Unknown error'));
                        }
                        return [2 /*return*/, { windowTarget: windowTarget, paneId: createResult.stdout.trim() }];
                }
            });
        });
    };
    /**
     * Creates a teammate pane when running inside tmux (with leader).
     */
    TmuxBackend.prototype.createTeammatePaneWithLeader = function (teammateName, teammateColor) {
        return __awaiter(this, void 0, void 0, function () {
            var currentPaneId, windowTarget, paneCount, isFirstTeammate, splitResult, listResult, panes, teammatePanes, teammateCount, splitVertically, targetPaneIndex, targetPane, paneId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCurrentPaneId()];
                    case 1:
                        currentPaneId = _a.sent();
                        return [4 /*yield*/, this.getCurrentWindowTarget()];
                    case 2:
                        windowTarget = _a.sent();
                        if (!currentPaneId || !windowTarget) {
                            throw new Error('Could not determine current tmux pane/window');
                        }
                        return [4 /*yield*/, this.getCurrentWindowPaneCount(windowTarget)];
                    case 3:
                        paneCount = _a.sent();
                        if (paneCount === null) {
                            throw new Error('Could not determine pane count for current window');
                        }
                        isFirstTeammate = paneCount === 1;
                        if (!isFirstTeammate) return [3 /*break*/, 5];
                        return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)(constants_js_1.TMUX_COMMAND, [
                                'split-window',
                                '-t',
                                currentPaneId,
                                '-h',
                                '-l',
                                '70%',
                                '-P',
                                '-F',
                                '#{pane_id}',
                            ])];
                    case 4:
                        // First teammate: split horizontally from the leader pane
                        splitResult = _a.sent();
                        return [3 /*break*/, 8];
                    case 5: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)(constants_js_1.TMUX_COMMAND, [
                            'list-panes',
                            '-t',
                            windowTarget,
                            '-F',
                            '#{pane_id}',
                        ])];
                    case 6:
                        listResult = _a.sent();
                        panes = listResult.stdout.trim().split('\n').filter(Boolean);
                        teammatePanes = panes.slice(1);
                        teammateCount = teammatePanes.length;
                        splitVertically = teammateCount % 2 === 1;
                        targetPaneIndex = Math.floor((teammateCount - 1) / 2);
                        targetPane = teammatePanes[targetPaneIndex] ||
                            teammatePanes[teammatePanes.length - 1];
                        return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)(constants_js_1.TMUX_COMMAND, [
                                'split-window',
                                '-t',
                                targetPane,
                                splitVertically ? '-v' : '-h',
                                '-P',
                                '-F',
                                '#{pane_id}',
                            ])];
                    case 7:
                        splitResult = _a.sent();
                        _a.label = 8;
                    case 8:
                        if (splitResult.code !== 0) {
                            throw new Error("Failed to create teammate pane: ".concat(splitResult.stderr));
                        }
                        paneId = splitResult.stdout.trim();
                        (0, debug_js_1.logForDebugging)("[TmuxBackend] Created teammate pane for ".concat(teammateName, ": ").concat(paneId));
                        return [4 /*yield*/, this.setPaneBorderColor(paneId, teammateColor)];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, this.setPaneTitle(paneId, teammateName, teammateColor)];
                    case 10:
                        _a.sent();
                        return [4 /*yield*/, this.rebalancePanesWithLeader(windowTarget)
                            // Wait for shell to initialize before returning, so commands can be sent immediately
                        ];
                    case 11:
                        _a.sent();
                        // Wait for shell to initialize before returning, so commands can be sent immediately
                        return [4 /*yield*/, waitForPaneShellReady()];
                    case 12:
                        // Wait for shell to initialize before returning, so commands can be sent immediately
                        _a.sent();
                        return [2 /*return*/, { paneId: paneId, isFirstTeammate: isFirstTeammate }];
                }
            });
        });
    };
    /**
     * Creates a teammate pane when running outside tmux (no leader in tmux).
     */
    TmuxBackend.prototype.createTeammatePaneExternal = function (teammateName, teammateColor) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, windowTarget, firstPaneId, paneCount, isFirstTeammate, paneId, listResult, panes, teammateCount, splitVertically, targetPaneIndex, targetPane, splitResult;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.createExternalSwarmSession()];
                    case 1:
                        _a = _b.sent(), windowTarget = _a.windowTarget, firstPaneId = _a.paneId;
                        return [4 /*yield*/, this.getCurrentWindowPaneCount(windowTarget, true)];
                    case 2:
                        paneCount = _b.sent();
                        if (paneCount === null) {
                            throw new Error('Could not determine pane count for swarm window');
                        }
                        isFirstTeammate = !firstPaneUsedForExternal && paneCount === 1;
                        if (!isFirstTeammate) return [3 /*break*/, 4];
                        paneId = firstPaneId;
                        firstPaneUsedForExternal = true;
                        (0, debug_js_1.logForDebugging)("[TmuxBackend] Using initial pane for first teammate ".concat(teammateName, ": ").concat(paneId));
                        return [4 /*yield*/, this.enablePaneBorderStatus(windowTarget, true)];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 4: return [4 /*yield*/, runTmuxInSwarm([
                            'list-panes',
                            '-t',
                            windowTarget,
                            '-F',
                            '#{pane_id}',
                        ])];
                    case 5:
                        listResult = _b.sent();
                        panes = listResult.stdout.trim().split('\n').filter(Boolean);
                        teammateCount = panes.length;
                        splitVertically = teammateCount % 2 === 1;
                        targetPaneIndex = Math.floor((teammateCount - 1) / 2);
                        targetPane = panes[targetPaneIndex] || panes[panes.length - 1];
                        return [4 /*yield*/, runTmuxInSwarm([
                                'split-window',
                                '-t',
                                targetPane,
                                splitVertically ? '-v' : '-h',
                                '-P',
                                '-F',
                                '#{pane_id}',
                            ])];
                    case 6:
                        splitResult = _b.sent();
                        if (splitResult.code !== 0) {
                            throw new Error("Failed to create teammate pane: ".concat(splitResult.stderr));
                        }
                        paneId = splitResult.stdout.trim();
                        (0, debug_js_1.logForDebugging)("[TmuxBackend] Created teammate pane for ".concat(teammateName, ": ").concat(paneId));
                        _b.label = 7;
                    case 7: return [4 /*yield*/, this.setPaneBorderColor(paneId, teammateColor, true)];
                    case 8:
                        _b.sent();
                        return [4 /*yield*/, this.setPaneTitle(paneId, teammateName, teammateColor, true)];
                    case 9:
                        _b.sent();
                        return [4 /*yield*/, this.rebalancePanesTiled(windowTarget)
                            // Wait for shell to initialize before returning, so commands can be sent immediately
                        ];
                    case 10:
                        _b.sent();
                        // Wait for shell to initialize before returning, so commands can be sent immediately
                        return [4 /*yield*/, waitForPaneShellReady()];
                    case 11:
                        // Wait for shell to initialize before returning, so commands can be sent immediately
                        _b.sent();
                        return [2 /*return*/, { paneId: paneId, isFirstTeammate: isFirstTeammate }];
                }
            });
        });
    };
    /**
     * Rebalances panes in a window with a leader.
     */
    TmuxBackend.prototype.rebalancePanesWithLeader = function (windowTarget) {
        return __awaiter(this, void 0, void 0, function () {
            var listResult, panes, leaderPane;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, runTmuxInUserSession([
                            'list-panes',
                            '-t',
                            windowTarget,
                            '-F',
                            '#{pane_id}',
                        ])];
                    case 1:
                        listResult = _a.sent();
                        panes = listResult.stdout.trim().split('\n').filter(Boolean);
                        if (panes.length <= 2) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, runTmuxInUserSession([
                                'select-layout',
                                '-t',
                                windowTarget,
                                'main-vertical',
                            ])];
                    case 2:
                        _a.sent();
                        leaderPane = panes[0];
                        return [4 /*yield*/, runTmuxInUserSession(['resize-pane', '-t', leaderPane, '-x', '30%'])];
                    case 3:
                        _a.sent();
                        (0, debug_js_1.logForDebugging)("[TmuxBackend] Rebalanced ".concat(panes.length - 1, " teammate panes with leader"));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Rebalances panes in a window without a leader (tiled layout).
     */
    TmuxBackend.prototype.rebalancePanesTiled = function (windowTarget) {
        return __awaiter(this, void 0, void 0, function () {
            var listResult, panes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, runTmuxInSwarm([
                            'list-panes',
                            '-t',
                            windowTarget,
                            '-F',
                            '#{pane_id}',
                        ])];
                    case 1:
                        listResult = _a.sent();
                        panes = listResult.stdout.trim().split('\n').filter(Boolean);
                        if (panes.length <= 1) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, runTmuxInSwarm(['select-layout', '-t', windowTarget, 'tiled'])];
                    case 2:
                        _a.sent();
                        (0, debug_js_1.logForDebugging)("[TmuxBackend] Rebalanced ".concat(panes.length, " teammate panes with tiled layout"));
                        return [2 /*return*/];
                }
            });
        });
    };
    return TmuxBackend;
}());
exports.TmuxBackend = TmuxBackend;
// Register the backend with the registry when this module is imported.
// This side effect is intentional - the registry needs backends to self-register to avoid circular dependencies.
// eslint-disable-next-line custom-rules/no-top-level-side-effects
(0, registry_js_1.registerTmuxBackend)(TmuxBackend);
