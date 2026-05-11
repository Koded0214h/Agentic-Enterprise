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
exports.assignTeammateColor = assignTeammateColor;
exports.getTeammateColor = getTeammateColor;
exports.clearTeammateColors = clearTeammateColors;
exports.isInsideTmux = isInsideTmux;
exports.createTeammatePaneInSwarmView = createTeammatePaneInSwarmView;
exports.enablePaneBorderStatus = enablePaneBorderStatus;
exports.sendCommandToPane = sendCommandToPane;
var agentColorManager_js_1 = require("../../tools/AgentTool/agentColorManager.js");
var registry_js_1 = require("./backends/registry.js");
// Track color assignments for teammates (persisted per session)
var teammateColorAssignments = new Map();
var colorIndex = 0;
/**
 * Gets the appropriate backend for the current environment.
 * detectAndGetBackend() caches internally — no need for a second cache here.
 */
function getBackend() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, registry_js_1.detectAndGetBackend)()];
                case 1: return [2 /*return*/, (_a.sent()).backend];
            }
        });
    });
}
/**
 * Assigns a unique color to a teammate from the available palette.
 * Colors are assigned in round-robin order.
 */
function assignTeammateColor(teammateId) {
    var existing = teammateColorAssignments.get(teammateId);
    if (existing) {
        return existing;
    }
    var color = agentColorManager_js_1.AGENT_COLORS[colorIndex % agentColorManager_js_1.AGENT_COLORS.length];
    teammateColorAssignments.set(teammateId, color);
    colorIndex++;
    return color;
}
/**
 * Gets the assigned color for a teammate, if any.
 */
function getTeammateColor(teammateId) {
    return teammateColorAssignments.get(teammateId);
}
/**
 * Clears all teammate color assignments.
 * Called during team cleanup to reset state for potential new teams.
 */
function clearTeammateColors() {
    teammateColorAssignments.clear();
    colorIndex = 0;
}
/**
 * Checks if we're currently running inside a tmux session.
 * Uses the detection module directly for this check.
 */
function isInsideTmux() {
    return __awaiter(this, void 0, void 0, function () {
        var checkTmux;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('./backends/detection.js'); })];
                case 1:
                    checkTmux = (_a.sent()).isInsideTmux;
                    return [2 /*return*/, checkTmux()];
            }
        });
    });
}
/**
 * Creates a new teammate pane in the swarm view.
 * Automatically selects the appropriate backend (tmux or iTerm2) based on environment.
 *
 * When running INSIDE tmux:
 * - Uses TmuxBackend to split the current window
 * - Leader stays on left (30%), teammates on right (70%)
 *
 * When running in iTerm2 (not in tmux) with it2 CLI:
 * - Uses ITermBackend for native iTerm2 split panes
 *
 * When running OUTSIDE tmux/iTerm2:
 * - Falls back to TmuxBackend with external claude-swarm session
 */
function createTeammatePaneInSwarmView(teammateName, teammateColor) {
    return __awaiter(this, void 0, void 0, function () {
        var backend;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getBackend()];
                case 1:
                    backend = _a.sent();
                    return [2 /*return*/, backend.createTeammatePaneInSwarmView(teammateName, teammateColor)];
            }
        });
    });
}
/**
 * Enables pane border status for a window (shows pane titles).
 * Delegates to the detected backend.
 */
function enablePaneBorderStatus(windowTarget_1) {
    return __awaiter(this, arguments, void 0, function (windowTarget, useSwarmSocket) {
        var backend;
        if (useSwarmSocket === void 0) { useSwarmSocket = false; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getBackend()];
                case 1:
                    backend = _a.sent();
                    return [2 /*return*/, backend.enablePaneBorderStatus(windowTarget, useSwarmSocket)];
            }
        });
    });
}
/**
 * Sends a command to a specific pane.
 * Delegates to the detected backend.
 */
function sendCommandToPane(paneId_1, command_1) {
    return __awaiter(this, arguments, void 0, function (paneId, command, useSwarmSocket) {
        var backend;
        if (useSwarmSocket === void 0) { useSwarmSocket = false; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getBackend()];
                case 1:
                    backend = _a.sent();
                    return [2 /*return*/, backend.sendCommandToPane(paneId, command, useSwarmSocket)];
            }
        });
    });
}
