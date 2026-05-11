"use strict";
/**
 * Teammate Initialization Module
 *
 * Handles initialization for Claude Code instances running as teammates in a swarm.
 * Registers a Stop hook to notify the team leader when the teammate becomes idle.
 */
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
exports.initializeTeammateHooks = initializeTeammateHooks;
var debug_js_1 = require("../debug.js");
var sessionHooks_js_1 = require("../hooks/sessionHooks.js");
var PermissionUpdate_js_1 = require("../permissions/PermissionUpdate.js");
var slowOperations_js_1 = require("../slowOperations.js");
var teammate_js_1 = require("../teammate.js");
var teammateMailbox_js_1 = require("../teammateMailbox.js");
var teamHelpers_js_1 = require("./teamHelpers.js");
/**
 * Initializes hooks for a teammate running in a swarm.
 * Should be called early in session startup after AppState is available.
 *
 * Registers a Stop hook that sends an idle notification to the team leader
 * when this teammate's session stops.
 */
function initializeTeammateHooks(setAppState, sessionId, teamInfo) {
    var _this = this;
    var teamName = teamInfo.teamName, agentId = teamInfo.agentId, agentName = teamInfo.agentName;
    // Read team file to get leader ID
    var teamFile = (0, teamHelpers_js_1.readTeamFile)(teamName);
    if (!teamFile) {
        (0, debug_js_1.logForDebugging)("[TeammateInit] Team file not found for team: ".concat(teamName));
        return;
    }
    var leadAgentId = teamFile.leadAgentId;
    // Apply team-wide allowed paths if any exist
    if (teamFile.teamAllowedPaths && teamFile.teamAllowedPaths.length > 0) {
        (0, debug_js_1.logForDebugging)("[TeammateInit] Found ".concat(teamFile.teamAllowedPaths.length, " team-wide allowed path(s)"));
        var _loop_1 = function (allowedPath) {
            // For absolute paths (starting with /), prepend one / to create //path/** pattern
            // For relative paths, just use path/**
            var ruleContent = allowedPath.path.startsWith('/')
                ? "/".concat(allowedPath.path, "/**")
                : "".concat(allowedPath.path, "/**");
            (0, debug_js_1.logForDebugging)("[TeammateInit] Applying team permission: ".concat(allowedPath.toolName, " allowed in ").concat(allowedPath.path, " (rule: ").concat(ruleContent, ")"));
            setAppState(function (prev) { return (__assign(__assign({}, prev), { toolPermissionContext: (0, PermissionUpdate_js_1.applyPermissionUpdate)(prev.toolPermissionContext, {
                    type: 'addRules',
                    rules: [
                        {
                            toolName: allowedPath.toolName,
                            ruleContent: ruleContent,
                        },
                    ],
                    behavior: 'allow',
                    destination: 'session',
                }) })); });
        };
        for (var _i = 0, _a = teamFile.teamAllowedPaths; _i < _a.length; _i++) {
            var allowedPath = _a[_i];
            _loop_1(allowedPath);
        }
    }
    // Find the leader's name from the members array
    var leadMember = teamFile.members.find(function (m) { return m.agentId === leadAgentId; });
    var leadAgentName = (leadMember === null || leadMember === void 0 ? void 0 : leadMember.name) || 'team-lead';
    // Don't register hook if this agent is the leader
    if (agentId === leadAgentId) {
        (0, debug_js_1.logForDebugging)('[TeammateInit] This agent is the team leader - skipping idle notification hook');
        return;
    }
    (0, debug_js_1.logForDebugging)("[TeammateInit] Registering Stop hook for teammate ".concat(agentName, " to notify leader ").concat(leadAgentName));
    // Register Stop hook to notify leader when this teammate stops
    (0, sessionHooks_js_1.addFunctionHook)(setAppState, sessionId, 'Stop', '', // No matcher - applies to all Stop events
    function (messages, _signal) { return __awaiter(_this, void 0, void 0, function () {
        var notification;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Mark this teammate as idle in the team config (fire and forget)
                    void (0, teamHelpers_js_1.setMemberActive)(teamName, agentName, false);
                    notification = (0, teammateMailbox_js_1.createIdleNotification)(agentName, {
                        idleReason: 'available',
                        summary: (0, teammateMailbox_js_1.getLastPeerDmSummary)(messages),
                    });
                    return [4 /*yield*/, (0, teammateMailbox_js_1.writeToMailbox)(leadAgentName, {
                            from: agentName,
                            text: (0, slowOperations_js_1.jsonStringify)(notification),
                            timestamp: new Date().toISOString(),
                            color: (0, teammate_js_1.getTeammateColor)(),
                        })];
                case 1:
                    _a.sent();
                    (0, debug_js_1.logForDebugging)("[TeammateInit] Sent idle notification to leader ".concat(leadAgentName));
                    return [2 /*return*/, true]; // Don't block the Stop
            }
        });
    }); }, 'Failed to send idle notification to team leader', {
        timeout: 10000,
    });
}
