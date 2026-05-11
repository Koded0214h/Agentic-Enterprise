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
exports.TeamCreateTool = void 0;
var v4_1 = require("zod/v4");
var state_js_1 = require("../../bootstrap/state.js");
var index_js_1 = require("../../services/analytics/index.js");
var Tool_js_1 = require("../../Tool.js");
var agentId_js_1 = require("../../utils/agentId.js");
var agentSwarmsEnabled_js_1 = require("../../utils/agentSwarmsEnabled.js");
var cwd_js_1 = require("../../utils/cwd.js");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
var model_js_1 = require("../../utils/model/model.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var registry_js_1 = require("../../utils/swarm/backends/registry.js");
var constants_js_1 = require("../../utils/swarm/constants.js");
var teamHelpers_js_1 = require("../../utils/swarm/teamHelpers.js");
var teammateLayoutManager_js_1 = require("../../utils/swarm/teammateLayoutManager.js");
var tasks_js_1 = require("../../utils/tasks.js");
var words_js_1 = require("../../utils/words.js");
var constants_js_2 = require("./constants.js");
var prompt_js_1 = require("./prompt.js");
var UI_js_1 = require("./UI.js");
var inputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.strictObject({
        team_name: v4_1.z.string().describe('Name for the new team to create.'),
        description: v4_1.z.string().optional().describe('Team description/purpose.'),
        agent_type: v4_1.z
            .string()
            .optional()
            .describe('Type/role of the team lead (e.g., "researcher", "test-runner"). ' +
            'Used for team file and inter-agent coordination.'),
    });
});
/**
 * Generates a unique team name by checking if the provided name already exists.
 * If the name already exists, generates a new word slug.
 */
function generateUniqueTeamName(providedName) {
    // If the team doesn't exist, use the provided name
    if (!(0, teamHelpers_js_1.readTeamFile)(providedName)) {
        return providedName;
    }
    // Team exists, generate a new unique name
    return (0, words_js_1.generateWordSlug)();
}
exports.TeamCreateTool = (0, Tool_js_1.buildTool)({
    name: constants_js_2.TEAM_CREATE_TOOL_NAME,
    searchHint: 'create a multi-agent swarm team',
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
    toAutoClassifierInput: function (input) {
        return input.team_name;
    },
    validateInput: function (input, _context) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!input.team_name || input.team_name.trim().length === 0) {
                    return [2 /*return*/, {
                            result: false,
                            message: 'team_name is required for TeamCreate',
                            errorCode: 9,
                        }];
                }
                return [2 /*return*/, { result: true }];
            });
        });
    },
    description: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, 'Create a new team for coordinating multiple agents'];
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
    call: function (input, context) {
        return __awaiter(this, void 0, void 0, function () {
            var setAppState, getAppState, team_name, _description, agent_type, appState, existingTeam, finalTeamName, leadAgentId, leadAgentType, leadModel, teamFilePath, teamFile, taskListId;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        setAppState = context.setAppState, getAppState = context.getAppState;
                        team_name = input.team_name, _description = input.description, agent_type = input.agent_type;
                        appState = getAppState();
                        existingTeam = (_a = appState.teamContext) === null || _a === void 0 ? void 0 : _a.teamName;
                        if (existingTeam) {
                            throw new Error("Already leading team \"".concat(existingTeam, "\". A leader can only manage one team at a time. Use TeamDelete to end the current team before creating a new one."));
                        }
                        finalTeamName = generateUniqueTeamName(team_name);
                        leadAgentId = (0, agentId_js_1.formatAgentId)(constants_js_1.TEAM_LEAD_NAME, finalTeamName);
                        leadAgentType = agent_type || constants_js_1.TEAM_LEAD_NAME;
                        leadModel = (0, model_js_1.parseUserSpecifiedModel)((_c = (_b = appState.mainLoopModelForSession) !== null && _b !== void 0 ? _b : appState.mainLoopModel) !== null && _c !== void 0 ? _c : (0, model_js_1.getDefaultMainLoopModel)());
                        teamFilePath = (0, teamHelpers_js_1.getTeamFilePath)(finalTeamName);
                        teamFile = {
                            name: finalTeamName,
                            description: _description,
                            createdAt: Date.now(),
                            leadAgentId: leadAgentId,
                            leadSessionId: (0, state_js_1.getSessionId)(), // Store actual session ID for team discovery
                            members: [
                                {
                                    agentId: leadAgentId,
                                    name: constants_js_1.TEAM_LEAD_NAME,
                                    agentType: leadAgentType,
                                    model: leadModel,
                                    joinedAt: Date.now(),
                                    tmuxPaneId: '',
                                    cwd: (0, cwd_js_1.getCwd)(),
                                    subscriptions: [],
                                },
                            ],
                        };
                        return [4 /*yield*/, (0, teamHelpers_js_1.writeTeamFileAsync)(finalTeamName, teamFile)
                            // Track for session-end cleanup — teams were left on disk forever
                            // unless explicitly TeamDelete'd (gh-32730).
                        ];
                    case 1:
                        _d.sent();
                        // Track for session-end cleanup — teams were left on disk forever
                        // unless explicitly TeamDelete'd (gh-32730).
                        (0, teamHelpers_js_1.registerTeamForSessionCleanup)(finalTeamName);
                        taskListId = (0, teamHelpers_js_1.sanitizeName)(finalTeamName);
                        return [4 /*yield*/, (0, tasks_js_1.resetTaskList)(taskListId)];
                    case 2:
                        _d.sent();
                        return [4 /*yield*/, (0, tasks_js_1.ensureTasksDir)(taskListId)
                            // Register the team name so getTaskListId() returns it for the leader.
                            // Without this, the leader falls through to getSessionId() and writes tasks
                            // to a different directory than tmux/iTerm2 teammates expect.
                        ];
                    case 3:
                        _d.sent();
                        // Register the team name so getTaskListId() returns it for the leader.
                        // Without this, the leader falls through to getSessionId() and writes tasks
                        // to a different directory than tmux/iTerm2 teammates expect.
                        (0, tasks_js_1.setLeaderTeamName)((0, teamHelpers_js_1.sanitizeName)(finalTeamName));
                        // Update AppState with team context
                        setAppState(function (prev) {
                            var _a;
                            return (__assign(__assign({}, prev), { teamContext: {
                                    teamName: finalTeamName,
                                    teamFilePath: teamFilePath,
                                    leadAgentId: leadAgentId,
                                    teammates: (_a = {},
                                        _a[leadAgentId] = {
                                            name: constants_js_1.TEAM_LEAD_NAME,
                                            agentType: leadAgentType,
                                            color: (0, teammateLayoutManager_js_1.assignTeammateColor)(leadAgentId),
                                            tmuxSessionName: '',
                                            tmuxPaneId: '',
                                            cwd: (0, cwd_js_1.getCwd)(),
                                            spawnedAt: Date.now(),
                                        },
                                        _a),
                                } }));
                        });
                        (0, index_js_1.logEvent)('tengu_team_created', {
                            team_name: finalTeamName,
                            teammate_count: 1,
                            lead_agent_type: leadAgentType,
                            teammate_mode: (0, registry_js_1.getResolvedTeammateMode)(),
                        });
                        // Note: We intentionally don't set CLAUDE_CODE_AGENT_ID for the team lead because:
                        // 1. The lead is not a "teammate" - isTeammate() should return false for them
                        // 2. Their ID is deterministic (team-lead@teamName) and can be derived when needed
                        // 3. Setting it would cause isTeammate() to return true, breaking inbox polling
                        // Team name is stored in AppState.teamContext, not process.env
                        return [2 /*return*/, {
                                data: {
                                    team_name: finalTeamName,
                                    team_file_path: teamFilePath,
                                    lead_agent_id: leadAgentId,
                                },
                            }];
                }
            });
        });
    },
    renderToolUseMessage: UI_js_1.renderToolUseMessage,
});
