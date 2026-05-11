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
exports.TeamDeleteTool = void 0;
var v4_1 = require("zod/v4");
var index_js_1 = require("../../services/analytics/index.js");
var Tool_js_1 = require("../../Tool.js");
var agentSwarmsEnabled_js_1 = require("../../utils/agentSwarmsEnabled.js");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var constants_js_1 = require("../../utils/swarm/constants.js");
var teamHelpers_js_1 = require("../../utils/swarm/teamHelpers.js");
var teammateLayoutManager_js_1 = require("../../utils/swarm/teammateLayoutManager.js");
var tasks_js_1 = require("../../utils/tasks.js");
var constants_js_2 = require("./constants.js");
var prompt_js_1 = require("./prompt.js");
var UI_js_1 = require("./UI.js");
var inputSchema = (0, lazySchema_js_1.lazySchema)(function () { return v4_1.z.strictObject({}); });
exports.TeamDeleteTool = (0, Tool_js_1.buildTool)({
    name: constants_js_2.TEAM_DELETE_TOOL_NAME,
    searchHint: 'disband a swarm team and clean up',
    maxResultSizeChars: 100000,
    shouldDefer: true,
    userFacingName: function () {
        return '';
    },
    get inputSchema() {
        return inputSchema();
    },
    isEnabled: function () {
        return (0, agentSwarmsEnabled_js_1.isAgentSwarmsEnabled)();
    },
    description: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, 'Clean up team and task directories when the swarm is complete'];
            });
        });
    },
    prompt: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, prompt_js_1.getPrompt)()];
            });
        });
    },
    mapToolResultToToolResultBlockParam: function (data, toolUseID) {
        return {
            tool_use_id: toolUseID,
            type: 'tool_result',
            content: [
                {
                    type: 'text',
                    text: (0, slowOperations_js_1.jsonStringify)(data),
                },
            ],
        };
    },
    call: function (_input, context) {
        return __awaiter(this, void 0, void 0, function () {
            var setAppState, getAppState, appState, teamName, teamFile, nonLeadMembers, activeMembers, memberNames;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        setAppState = context.setAppState, getAppState = context.getAppState;
                        appState = getAppState();
                        teamName = (_a = appState.teamContext) === null || _a === void 0 ? void 0 : _a.teamName;
                        if (!teamName) return [3 /*break*/, 2];
                        teamFile = (0, teamHelpers_js_1.readTeamFile)(teamName);
                        if (teamFile) {
                            nonLeadMembers = teamFile.members.filter(function (m) { return m.name !== constants_js_1.TEAM_LEAD_NAME; });
                            activeMembers = nonLeadMembers.filter(function (m) { return m.isActive !== false; });
                            if (activeMembers.length > 0) {
                                memberNames = activeMembers.map(function (m) { return m.name; }).join(', ');
                                return [2 /*return*/, {
                                        data: {
                                            success: false,
                                            message: "Cannot cleanup team with ".concat(activeMembers.length, " active member(s): ").concat(memberNames, ". Use requestShutdown to gracefully terminate teammates first."),
                                            team_name: teamName,
                                        },
                                    }];
                            }
                        }
                        return [4 /*yield*/, (0, teamHelpers_js_1.cleanupTeamDirectories)(teamName)
                            // Already cleaned — don't try again on gracefulShutdown.
                        ];
                    case 1:
                        _b.sent();
                        // Already cleaned — don't try again on gracefulShutdown.
                        (0, teamHelpers_js_1.unregisterTeamForSessionCleanup)(teamName);
                        // Clear color assignments so new teams start fresh
                        (0, teammateLayoutManager_js_1.clearTeammateColors)();
                        // Clear leader team name so getTaskListId() falls back to session ID
                        (0, tasks_js_1.clearLeaderTeamName)();
                        (0, index_js_1.logEvent)('tengu_team_deleted', {
                            team_name: teamName,
                        });
                        _b.label = 2;
                    case 2:
                        // Clear team context and inbox from app state
                        setAppState(function (prev) { return (__assign(__assign({}, prev), { teamContext: undefined, inbox: {
                                messages: [], // Clear any queued messages
                            } })); });
                        return [2 /*return*/, {
                                data: {
                                    success: true,
                                    message: teamName
                                        ? "Cleaned up directories and worktrees for team \"".concat(teamName, "\"")
                                        : 'No team name found, nothing to clean up',
                                    team_name: teamName,
                                },
                            }];
                }
            });
        });
    },
    renderToolUseMessage: UI_js_1.renderToolUseMessage,
    renderToolResultMessage: UI_js_1.renderToolResultMessage,
});
