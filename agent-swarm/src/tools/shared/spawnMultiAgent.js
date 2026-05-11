"use strict";
/**
 * Shared spawn module for teammate creation.
 * Extracted from TeammateTool to allow reuse by AgentTool.
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
exports.resolveTeammateModel = resolveTeammateModel;
exports.generateUniqueTeammateName = generateUniqueTeammateName;
exports.spawnTeammate = spawnTeammate;
var react_1 = require("react");
var state_js_1 = require("../../bootstrap/state.js");
var Task_js_1 = require("../../Task.js");
var agentId_js_1 = require("../../utils/agentId.js");
var shellQuote_js_1 = require("../../utils/bash/shellQuote.js");
var bundledMode_js_1 = require("../../utils/bundledMode.js");
var config_js_1 = require("../../utils/config.js");
var cwd_js_1 = require("../../utils/cwd.js");
var debug_js_1 = require("../../utils/debug.js");
var errors_js_1 = require("../../utils/errors.js");
var execFileNoThrow_js_1 = require("../../utils/execFileNoThrow.js");
var model_js_1 = require("../../utils/model/model.js");
var detection_js_1 = require("../../utils/swarm/backends/detection.js");
var registry_js_1 = require("../../utils/swarm/backends/registry.js");
var teammateModeSnapshot_js_1 = require("../../utils/swarm/backends/teammateModeSnapshot.js");
var types_js_1 = require("../../utils/swarm/backends/types.js");
var constants_js_1 = require("../../utils/swarm/constants.js");
var It2SetupPrompt_js_1 = require("../../utils/swarm/It2SetupPrompt.js");
var inProcessRunner_js_1 = require("../../utils/swarm/inProcessRunner.js");
var spawnInProcess_js_1 = require("../../utils/swarm/spawnInProcess.js");
var spawnUtils_js_1 = require("../../utils/swarm/spawnUtils.js");
var teamHelpers_js_1 = require("../../utils/swarm/teamHelpers.js");
var teammateLayoutManager_js_1 = require("../../utils/swarm/teammateLayoutManager.js");
var teammateModel_js_1 = require("../../utils/swarm/teammateModel.js");
var framework_js_1 = require("../../utils/task/framework.js");
var teammateMailbox_js_1 = require("../../utils/teammateMailbox.js");
var loadAgentsDir_js_1 = require("../AgentTool/loadAgentsDir.js");
function getDefaultTeammateModel(leaderModel) {
    var configured = (0, config_js_1.getGlobalConfig)().teammateDefaultModel;
    if (configured === null) {
        // User picked "Default" in the /config picker — follow the leader.
        return leaderModel !== null && leaderModel !== void 0 ? leaderModel : (0, teammateModel_js_1.getHardcodedTeammateModelFallback)();
    }
    if (configured !== undefined) {
        return (0, model_js_1.parseUserSpecifiedModel)(configured);
    }
    return (0, teammateModel_js_1.getHardcodedTeammateModelFallback)();
}
/**
 * Resolve a teammate model value. Handles the 'inherit' alias (from agent
 * frontmatter) by substituting the leader's model. gh-31069: 'inherit' was
 * passed literally to --model, producing "It may not exist or you may not
 * have access". If leader model is null (not yet set), falls through to the
 * default.
 *
 * Exported for testing.
 */
function resolveTeammateModel(inputModel, leaderModel) {
    if (inputModel === 'inherit') {
        return leaderModel !== null && leaderModel !== void 0 ? leaderModel : getDefaultTeammateModel(leaderModel);
    }
    return inputModel !== null && inputModel !== void 0 ? inputModel : getDefaultTeammateModel(leaderModel);
}
// ============================================================================
// Helper Functions
// ============================================================================
/**
 * Checks if a tmux session exists
 */
function hasSession(sessionName) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)(constants_js_1.TMUX_COMMAND, [
                        'has-session',
                        '-t',
                        sessionName,
                    ])];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result.code === 0];
            }
        });
    });
}
/**
 * Creates a new tmux session if it doesn't exist
 */
function ensureSession(sessionName) {
    return __awaiter(this, void 0, void 0, function () {
        var exists, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, hasSession(sessionName)];
                case 1:
                    exists = _a.sent();
                    if (!!exists) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)(constants_js_1.TMUX_COMMAND, [
                            'new-session',
                            '-d',
                            '-s',
                            sessionName,
                        ])];
                case 2:
                    result = _a.sent();
                    if (result.code !== 0) {
                        throw new Error("Failed to create tmux session '".concat(sessionName, "': ").concat(result.stderr || 'Unknown error'));
                    }
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Gets the command to spawn a teammate.
 * For native builds (compiled binaries), use process.execPath.
 * For non-native (node/bun running a script), use process.argv[1].
 */
function getTeammateCommand() {
    if (process.env[constants_js_1.TEAMMATE_COMMAND_ENV_VAR]) {
        return process.env[constants_js_1.TEAMMATE_COMMAND_ENV_VAR];
    }
    return (0, bundledMode_js_1.isInBundledMode)() ? process.execPath : process.argv[1];
}
/**
 * Builds CLI flags to propagate from the current session to spawned teammates.
 * This ensures teammates inherit important settings like permission mode,
 * model selection, and plugin configuration from their parent.
 *
 * @param options.planModeRequired - If true, don't inherit bypass permissions (plan mode takes precedence)
 * @param options.permissionMode - Permission mode to propagate
 */
function buildInheritedCliFlags(options) {
    var flags = [];
    var _a = options || {}, planModeRequired = _a.planModeRequired, permissionMode = _a.permissionMode;
    // Propagate permission mode to teammates, but NOT if plan mode is required
    // Plan mode takes precedence over bypass permissions for safety
    if (planModeRequired) {
        // Don't inherit bypass permissions when plan mode is required
    }
    else if (permissionMode === 'bypassPermissions' ||
        (0, state_js_1.getSessionBypassPermissionsMode)()) {
        flags.push('--dangerously-skip-permissions');
    }
    else if (permissionMode === 'acceptEdits') {
        flags.push('--permission-mode acceptEdits');
    }
    else if (permissionMode === 'auto') {
        // Teammates inherit auto mode so the classifier auto-approves their tool
        // calls too. The teammate's own startup (permissionSetup.ts) handles
        // GrowthBook gate checks and setAutoModeActive(true) independently.
        flags.push('--permission-mode auto');
    }
    // Propagate --model if explicitly set via CLI
    var modelOverride = (0, state_js_1.getMainLoopModelOverride)();
    if (modelOverride) {
        flags.push("--model ".concat((0, shellQuote_js_1.quote)([modelOverride])));
    }
    // Propagate --settings if set via CLI
    var settingsPath = (0, state_js_1.getFlagSettingsPath)();
    if (settingsPath) {
        flags.push("--settings ".concat((0, shellQuote_js_1.quote)([settingsPath])));
    }
    // Propagate --plugin-dir for each inline plugin
    var inlinePlugins = (0, state_js_1.getInlinePlugins)();
    for (var _i = 0, inlinePlugins_1 = inlinePlugins; _i < inlinePlugins_1.length; _i++) {
        var pluginDir = inlinePlugins_1[_i];
        flags.push("--plugin-dir ".concat((0, shellQuote_js_1.quote)([pluginDir])));
    }
    // Propagate --chrome / --no-chrome if explicitly set on the CLI
    var chromeFlagOverride = (0, state_js_1.getChromeFlagOverride)();
    if (chromeFlagOverride === true) {
        flags.push('--chrome');
    }
    else if (chromeFlagOverride === false) {
        flags.push('--no-chrome');
    }
    return flags.join(' ');
}
/**
 * Generates a unique teammate name by checking existing team members.
 * If the name already exists, appends a numeric suffix (e.g., tester-2, tester-3).
 * @internal Exported for testing
 */
function generateUniqueTeammateName(baseName, teamName) {
    return __awaiter(this, void 0, void 0, function () {
        var teamFile, existingNames, suffix;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!teamName) {
                        return [2 /*return*/, baseName];
                    }
                    return [4 /*yield*/, (0, teamHelpers_js_1.readTeamFileAsync)(teamName)];
                case 1:
                    teamFile = _a.sent();
                    if (!teamFile) {
                        return [2 /*return*/, baseName];
                    }
                    existingNames = new Set(teamFile.members.map(function (m) { return m.name.toLowerCase(); }));
                    // If the base name doesn't exist, use it as-is
                    if (!existingNames.has(baseName.toLowerCase())) {
                        return [2 /*return*/, baseName];
                    }
                    suffix = 2;
                    while (existingNames.has("".concat(baseName, "-").concat(suffix).toLowerCase())) {
                        suffix++;
                    }
                    return [2 /*return*/, "".concat(baseName, "-").concat(suffix)];
            }
        });
    });
}
// ============================================================================
// Spawn Handlers
// ============================================================================
/**
 * Handle spawn operation using split-pane view (default).
 * When inside tmux: Creates teammates in a shared window with leader on left, teammates on right.
 * When outside tmux: Creates a claude-swarm session with all teammates in a tiled layout.
 */
function handleSpawnSplitPane(input, context) {
    return __awaiter(this, void 0, void 0, function () {
        var setAppState, getAppState, name, prompt, agent_type, cwd, plan_mode_required, model, appState, teamName, uniqueName, sanitizedName, teammateId, workingDir, detectionResult, tmuxAvailable_1, setupResult, insideTmux, teammateColor, _a, paneId, isFirstTeammate, binaryPath, teammateArgs, inheritedFlags, flagsStr, envStr, spawnCommand, sessionName, windowName, teamFile;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    setAppState = context.setAppState, getAppState = context.getAppState;
                    name = input.name, prompt = input.prompt, agent_type = input.agent_type, cwd = input.cwd, plan_mode_required = input.plan_mode_required;
                    model = resolveTeammateModel(input.model, getAppState().mainLoopModel);
                    if (!name || !prompt) {
                        throw new Error('name and prompt are required for spawn operation');
                    }
                    appState = getAppState();
                    teamName = input.team_name || ((_b = appState.teamContext) === null || _b === void 0 ? void 0 : _b.teamName);
                    if (!teamName) {
                        throw new Error('team_name is required for spawn operation. Either provide team_name in input or call spawnTeam first to establish team context.');
                    }
                    return [4 /*yield*/, generateUniqueTeammateName(name, teamName)
                        // Sanitize the name to prevent @ in agent IDs (would break agentName@teamName format)
                    ];
                case 1:
                    uniqueName = _c.sent();
                    sanitizedName = (0, teamHelpers_js_1.sanitizeAgentName)(uniqueName);
                    teammateId = (0, agentId_js_1.formatAgentId)(sanitizedName, teamName);
                    workingDir = cwd || (0, cwd_js_1.getCwd)();
                    return [4 /*yield*/, (0, registry_js_1.detectAndGetBackend)()
                        // If in iTerm2 but it2 isn't set up, prompt the user
                    ];
                case 2:
                    detectionResult = _c.sent();
                    if (!(detectionResult.needsIt2Setup && context.setToolJSX)) return [3 /*break*/, 6];
                    return [4 /*yield*/, (0, detection_js_1.isTmuxAvailable)()
                        // Show the setup prompt and wait for user decision
                    ];
                case 3:
                    tmuxAvailable_1 = _c.sent();
                    return [4 /*yield*/, new Promise(function (resolve) {
                            context.setToolJSX({
                                jsx: react_1.default.createElement(It2SetupPrompt_js_1.It2SetupPrompt, {
                                    onDone: resolve,
                                    tmuxAvailable: tmuxAvailable_1,
                                }),
                                shouldHidePromptInput: true,
                            });
                        })
                        // Clear the JSX
                    ];
                case 4:
                    setupResult = _c.sent();
                    // Clear the JSX
                    context.setToolJSX(null);
                    if (setupResult === 'cancelled') {
                        throw new Error('Teammate spawn cancelled - iTerm2 setup required');
                    }
                    if (!(setupResult === 'installed' || setupResult === 'use-tmux')) return [3 /*break*/, 6];
                    (0, registry_js_1.resetBackendDetection)();
                    return [4 /*yield*/, (0, registry_js_1.detectAndGetBackend)()];
                case 5:
                    detectionResult = _c.sent();
                    _c.label = 6;
                case 6: return [4 /*yield*/, (0, teammateLayoutManager_js_1.isInsideTmux)()
                    // Assign a unique color to this teammate
                ];
                case 7:
                    insideTmux = _c.sent();
                    teammateColor = (0, teammateLayoutManager_js_1.assignTeammateColor)(teammateId);
                    return [4 /*yield*/, (0, teammateLayoutManager_js_1.createTeammatePaneInSwarmView)(sanitizedName, teammateColor)
                        // Enable pane border status on first teammate when inside tmux
                        // (outside tmux, this is handled in createTeammatePaneInSwarmView)
                    ];
                case 8:
                    _a = _c.sent(), paneId = _a.paneId, isFirstTeammate = _a.isFirstTeammate;
                    if (!(isFirstTeammate && insideTmux)) return [3 /*break*/, 10];
                    return [4 /*yield*/, (0, teammateLayoutManager_js_1.enablePaneBorderStatus)()];
                case 9:
                    _c.sent();
                    _c.label = 10;
                case 10:
                    binaryPath = getTeammateCommand();
                    teammateArgs = [
                        "--agent-id ".concat((0, shellQuote_js_1.quote)([teammateId])),
                        "--agent-name ".concat((0, shellQuote_js_1.quote)([sanitizedName])),
                        "--team-name ".concat((0, shellQuote_js_1.quote)([teamName])),
                        "--agent-color ".concat((0, shellQuote_js_1.quote)([teammateColor])),
                        "--parent-session-id ".concat((0, shellQuote_js_1.quote)([(0, state_js_1.getSessionId)()])),
                        plan_mode_required ? '--plan-mode-required' : '',
                        agent_type ? "--agent-type ".concat((0, shellQuote_js_1.quote)([agent_type])) : '',
                    ]
                        .filter(Boolean)
                        .join(' ');
                    inheritedFlags = buildInheritedCliFlags({
                        planModeRequired: plan_mode_required,
                        permissionMode: appState.toolPermissionContext.mode,
                    });
                    // If teammate has a custom model, add --model flag (or replace inherited one)
                    if (model) {
                        // Remove any inherited --model flag first
                        inheritedFlags = inheritedFlags
                            .split(' ')
                            .filter(function (flag, i, arr) { return flag !== '--model' && arr[i - 1] !== '--model'; })
                            .join(' ');
                        // Add the teammate's model
                        inheritedFlags = inheritedFlags
                            ? "".concat(inheritedFlags, " --model ").concat((0, shellQuote_js_1.quote)([model]))
                            : "--model ".concat((0, shellQuote_js_1.quote)([model]));
                    }
                    flagsStr = inheritedFlags ? " ".concat(inheritedFlags) : '';
                    envStr = (0, spawnUtils_js_1.buildInheritedEnvVars)();
                    spawnCommand = "cd ".concat((0, shellQuote_js_1.quote)([workingDir]), " && env ").concat(envStr, " ").concat((0, shellQuote_js_1.quote)([binaryPath]), " ").concat(teammateArgs).concat(flagsStr);
                    // Send the command to the new pane
                    // Use swarm socket when running outside tmux (external swarm session)
                    return [4 /*yield*/, (0, teammateLayoutManager_js_1.sendCommandToPane)(paneId, spawnCommand, !insideTmux)
                        // Determine session/window names for output
                    ];
                case 11:
                    // Send the command to the new pane
                    // Use swarm socket when running outside tmux (external swarm session)
                    _c.sent();
                    sessionName = insideTmux ? 'current' : constants_js_1.SWARM_SESSION_NAME;
                    windowName = insideTmux ? 'current' : 'swarm-view';
                    // Track the teammate in AppState's teamContext with color
                    // If spawning without spawnTeam, set up the leader as team lead
                    setAppState(function (prev) {
                        var _a;
                        var _b, _c, _d, _e, _f, _g, _h;
                        return (__assign(__assign({}, prev), { teamContext: __assign(__assign({}, prev.teamContext), { teamName: (_c = teamName !== null && teamName !== void 0 ? teamName : (_b = prev.teamContext) === null || _b === void 0 ? void 0 : _b.teamName) !== null && _c !== void 0 ? _c : 'default', teamFilePath: (_e = (_d = prev.teamContext) === null || _d === void 0 ? void 0 : _d.teamFilePath) !== null && _e !== void 0 ? _e : '', leadAgentId: (_g = (_f = prev.teamContext) === null || _f === void 0 ? void 0 : _f.leadAgentId) !== null && _g !== void 0 ? _g : '', teammates: __assign(__assign({}, (((_h = prev.teamContext) === null || _h === void 0 ? void 0 : _h.teammates) || {})), (_a = {}, _a[teammateId] = {
                                    name: sanitizedName,
                                    agentType: agent_type,
                                    color: teammateColor,
                                    tmuxSessionName: sessionName,
                                    tmuxPaneId: paneId,
                                    cwd: workingDir,
                                    spawnedAt: Date.now(),
                                }, _a)) }) }));
                    });
                    // Register background task so teammates appear in the tasks pill/dialog
                    registerOutOfProcessTeammateTask(setAppState, {
                        teammateId: teammateId,
                        sanitizedName: sanitizedName,
                        teamName: teamName,
                        teammateColor: teammateColor,
                        prompt: prompt,
                        plan_mode_required: plan_mode_required,
                        paneId: paneId,
                        insideTmux: insideTmux,
                        backendType: detectionResult.backend.type,
                        toolUseId: context.toolUseId,
                    });
                    return [4 /*yield*/, (0, teamHelpers_js_1.readTeamFileAsync)(teamName)];
                case 12:
                    teamFile = _c.sent();
                    if (!teamFile) {
                        throw new Error("Team \"".concat(teamName, "\" does not exist. Call spawnTeam first to create the team."));
                    }
                    teamFile.members.push({
                        agentId: teammateId,
                        name: sanitizedName,
                        agentType: agent_type,
                        model: model,
                        prompt: prompt,
                        color: teammateColor,
                        planModeRequired: plan_mode_required,
                        joinedAt: Date.now(),
                        tmuxPaneId: paneId,
                        cwd: workingDir,
                        subscriptions: [],
                        backendType: detectionResult.backend.type,
                    });
                    return [4 /*yield*/, (0, teamHelpers_js_1.writeTeamFileAsync)(teamName, teamFile)
                        // Send initial instructions to teammate via mailbox
                        // The teammate's inbox poller will pick this up and submit it as their first turn
                    ];
                case 13:
                    _c.sent();
                    // Send initial instructions to teammate via mailbox
                    // The teammate's inbox poller will pick this up and submit it as their first turn
                    return [4 /*yield*/, (0, teammateMailbox_js_1.writeToMailbox)(sanitizedName, {
                            from: constants_js_1.TEAM_LEAD_NAME,
                            text: prompt,
                            timestamp: new Date().toISOString(),
                        }, teamName)];
                case 14:
                    // Send initial instructions to teammate via mailbox
                    // The teammate's inbox poller will pick this up and submit it as their first turn
                    _c.sent();
                    return [2 /*return*/, {
                            data: {
                                teammate_id: teammateId,
                                agent_id: teammateId,
                                agent_type: agent_type,
                                model: model,
                                name: sanitizedName,
                                color: teammateColor,
                                tmux_session_name: sessionName,
                                tmux_window_name: windowName,
                                tmux_pane_id: paneId,
                                team_name: teamName,
                                is_splitpane: true,
                                plan_mode_required: plan_mode_required,
                            },
                        }];
            }
        });
    });
}
/**
 * Handle spawn operation using separate windows (legacy behavior).
 * Creates each teammate in its own tmux window.
 */
function handleSpawnSeparateWindow(input, context) {
    return __awaiter(this, void 0, void 0, function () {
        var setAppState, getAppState, name, prompt, agent_type, cwd, plan_mode_required, model, appState, teamName, uniqueName, sanitizedName, teammateId, windowName, workingDir, teammateColor, createWindowResult, paneId, binaryPath, teammateArgs, inheritedFlags, flagsStr, envStr, spawnCommand, sendKeysResult, teamFile;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setAppState = context.setAppState, getAppState = context.getAppState;
                    name = input.name, prompt = input.prompt, agent_type = input.agent_type, cwd = input.cwd, plan_mode_required = input.plan_mode_required;
                    model = resolveTeammateModel(input.model, getAppState().mainLoopModel);
                    if (!name || !prompt) {
                        throw new Error('name and prompt are required for spawn operation');
                    }
                    appState = getAppState();
                    teamName = input.team_name || ((_a = appState.teamContext) === null || _a === void 0 ? void 0 : _a.teamName);
                    if (!teamName) {
                        throw new Error('team_name is required for spawn operation. Either provide team_name in input or call spawnTeam first to establish team context.');
                    }
                    return [4 /*yield*/, generateUniqueTeammateName(name, teamName)
                        // Sanitize the name to prevent @ in agent IDs (would break agentName@teamName format)
                    ];
                case 1:
                    uniqueName = _b.sent();
                    sanitizedName = (0, teamHelpers_js_1.sanitizeAgentName)(uniqueName);
                    teammateId = (0, agentId_js_1.formatAgentId)(sanitizedName, teamName);
                    windowName = "teammate-".concat((0, teamHelpers_js_1.sanitizeName)(sanitizedName));
                    workingDir = cwd || (0, cwd_js_1.getCwd)();
                    // Ensure the swarm session exists
                    return [4 /*yield*/, ensureSession(constants_js_1.SWARM_SESSION_NAME)
                        // Assign a unique color to this teammate
                    ];
                case 2:
                    // Ensure the swarm session exists
                    _b.sent();
                    teammateColor = (0, teammateLayoutManager_js_1.assignTeammateColor)(teammateId);
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)(constants_js_1.TMUX_COMMAND, [
                            'new-window',
                            '-t',
                            constants_js_1.SWARM_SESSION_NAME,
                            '-n',
                            windowName,
                            '-P',
                            '-F',
                            '#{pane_id}',
                        ])];
                case 3:
                    createWindowResult = _b.sent();
                    if (createWindowResult.code !== 0) {
                        throw new Error("Failed to create tmux window: ".concat(createWindowResult.stderr));
                    }
                    paneId = createWindowResult.stdout.trim();
                    binaryPath = getTeammateCommand();
                    teammateArgs = [
                        "--agent-id ".concat((0, shellQuote_js_1.quote)([teammateId])),
                        "--agent-name ".concat((0, shellQuote_js_1.quote)([sanitizedName])),
                        "--team-name ".concat((0, shellQuote_js_1.quote)([teamName])),
                        "--agent-color ".concat((0, shellQuote_js_1.quote)([teammateColor])),
                        "--parent-session-id ".concat((0, shellQuote_js_1.quote)([(0, state_js_1.getSessionId)()])),
                        plan_mode_required ? '--plan-mode-required' : '',
                        agent_type ? "--agent-type ".concat((0, shellQuote_js_1.quote)([agent_type])) : '',
                    ]
                        .filter(Boolean)
                        .join(' ');
                    inheritedFlags = buildInheritedCliFlags({
                        planModeRequired: plan_mode_required,
                        permissionMode: appState.toolPermissionContext.mode,
                    });
                    // If teammate has a custom model, add --model flag (or replace inherited one)
                    if (model) {
                        // Remove any inherited --model flag first
                        inheritedFlags = inheritedFlags
                            .split(' ')
                            .filter(function (flag, i, arr) { return flag !== '--model' && arr[i - 1] !== '--model'; })
                            .join(' ');
                        // Add the teammate's model
                        inheritedFlags = inheritedFlags
                            ? "".concat(inheritedFlags, " --model ").concat((0, shellQuote_js_1.quote)([model]))
                            : "--model ".concat((0, shellQuote_js_1.quote)([model]));
                    }
                    flagsStr = inheritedFlags ? " ".concat(inheritedFlags) : '';
                    envStr = (0, spawnUtils_js_1.buildInheritedEnvVars)();
                    spawnCommand = "cd ".concat((0, shellQuote_js_1.quote)([workingDir]), " && env ").concat(envStr, " ").concat((0, shellQuote_js_1.quote)([binaryPath]), " ").concat(teammateArgs).concat(flagsStr);
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)(constants_js_1.TMUX_COMMAND, [
                            'send-keys',
                            '-t',
                            "".concat(constants_js_1.SWARM_SESSION_NAME, ":").concat(windowName),
                            spawnCommand,
                            'Enter',
                        ])];
                case 4:
                    sendKeysResult = _b.sent();
                    if (sendKeysResult.code !== 0) {
                        throw new Error("Failed to send command to tmux window: ".concat(sendKeysResult.stderr));
                    }
                    // Track the teammate in AppState's teamContext
                    setAppState(function (prev) {
                        var _a;
                        var _b, _c, _d, _e, _f, _g, _h;
                        return (__assign(__assign({}, prev), { teamContext: __assign(__assign({}, prev.teamContext), { teamName: (_c = teamName !== null && teamName !== void 0 ? teamName : (_b = prev.teamContext) === null || _b === void 0 ? void 0 : _b.teamName) !== null && _c !== void 0 ? _c : 'default', teamFilePath: (_e = (_d = prev.teamContext) === null || _d === void 0 ? void 0 : _d.teamFilePath) !== null && _e !== void 0 ? _e : '', leadAgentId: (_g = (_f = prev.teamContext) === null || _f === void 0 ? void 0 : _f.leadAgentId) !== null && _g !== void 0 ? _g : '', teammates: __assign(__assign({}, (((_h = prev.teamContext) === null || _h === void 0 ? void 0 : _h.teammates) || {})), (_a = {}, _a[teammateId] = {
                                    name: sanitizedName,
                                    agentType: agent_type,
                                    color: teammateColor,
                                    tmuxSessionName: constants_js_1.SWARM_SESSION_NAME,
                                    tmuxPaneId: paneId,
                                    cwd: workingDir,
                                    spawnedAt: Date.now(),
                                }, _a)) }) }));
                    });
                    // Register background task so tmux teammates appear in the tasks pill/dialog
                    // Separate window spawns are always outside tmux (external swarm session)
                    registerOutOfProcessTeammateTask(setAppState, {
                        teammateId: teammateId,
                        sanitizedName: sanitizedName,
                        teamName: teamName,
                        teammateColor: teammateColor,
                        prompt: prompt,
                        plan_mode_required: plan_mode_required,
                        paneId: paneId,
                        insideTmux: false,
                        backendType: 'tmux',
                        toolUseId: context.toolUseId,
                    });
                    return [4 /*yield*/, (0, teamHelpers_js_1.readTeamFileAsync)(teamName)];
                case 5:
                    teamFile = _b.sent();
                    if (!teamFile) {
                        throw new Error("Team \"".concat(teamName, "\" does not exist. Call spawnTeam first to create the team."));
                    }
                    teamFile.members.push({
                        agentId: teammateId,
                        name: sanitizedName,
                        agentType: agent_type,
                        model: model,
                        prompt: prompt,
                        color: teammateColor,
                        planModeRequired: plan_mode_required,
                        joinedAt: Date.now(),
                        tmuxPaneId: paneId,
                        cwd: workingDir,
                        subscriptions: [],
                        backendType: 'tmux', // This handler always uses tmux directly
                    });
                    return [4 /*yield*/, (0, teamHelpers_js_1.writeTeamFileAsync)(teamName, teamFile)
                        // Send initial instructions to teammate via mailbox
                        // The teammate's inbox poller will pick this up and submit it as their first turn
                    ];
                case 6:
                    _b.sent();
                    // Send initial instructions to teammate via mailbox
                    // The teammate's inbox poller will pick this up and submit it as their first turn
                    return [4 /*yield*/, (0, teammateMailbox_js_1.writeToMailbox)(sanitizedName, {
                            from: constants_js_1.TEAM_LEAD_NAME,
                            text: prompt,
                            timestamp: new Date().toISOString(),
                        }, teamName)];
                case 7:
                    // Send initial instructions to teammate via mailbox
                    // The teammate's inbox poller will pick this up and submit it as their first turn
                    _b.sent();
                    return [2 /*return*/, {
                            data: {
                                teammate_id: teammateId,
                                agent_id: teammateId,
                                agent_type: agent_type,
                                model: model,
                                name: sanitizedName,
                                color: teammateColor,
                                tmux_session_name: constants_js_1.SWARM_SESSION_NAME,
                                tmux_window_name: windowName,
                                tmux_pane_id: paneId,
                                team_name: teamName,
                                is_splitpane: false,
                                plan_mode_required: plan_mode_required,
                            },
                        }];
            }
        });
    });
}
/**
 * Register a background task entry for an out-of-process (tmux/iTerm2) teammate.
 * This makes tmux teammates visible in the background tasks pill and dialog,
 * matching how in-process teammates are tracked.
 */
function registerOutOfProcessTeammateTask(setAppState, _a) {
    var teammateId = _a.teammateId, sanitizedName = _a.sanitizedName, teamName = _a.teamName, teammateColor = _a.teammateColor, prompt = _a.prompt, plan_mode_required = _a.plan_mode_required, paneId = _a.paneId, insideTmux = _a.insideTmux, backendType = _a.backendType, toolUseId = _a.toolUseId;
    var taskId = (0, Task_js_1.generateTaskId)('in_process_teammate');
    var description = "".concat(sanitizedName, ": ").concat(prompt.substring(0, 50)).concat(prompt.length > 50 ? '...' : '');
    var abortController = new AbortController();
    var taskState = __assign(__assign({}, (0, Task_js_1.createTaskStateBase)(taskId, 'in_process_teammate', description, toolUseId)), { type: 'in_process_teammate', status: 'running', identity: {
            agentId: teammateId,
            agentName: sanitizedName,
            teamName: teamName,
            color: teammateColor,
            planModeRequired: plan_mode_required !== null && plan_mode_required !== void 0 ? plan_mode_required : false,
            parentSessionId: (0, state_js_1.getSessionId)(),
        }, prompt: prompt, abortController: abortController, awaitingPlanApproval: false, permissionMode: plan_mode_required ? 'plan' : 'default', isIdle: false, shutdownRequested: false, lastReportedToolCount: 0, lastReportedTokenCount: 0, pendingUserMessages: [] });
    (0, framework_js_1.registerTask)(taskState, setAppState);
    // When abort is signaled, kill the pane using the backend that created it
    // (tmux kill-pane for tmux panes, it2 session close for iTerm2 native panes).
    // SDK task_notification bookend is emitted by killInProcessTeammate (the
    // sole abort trigger for this controller).
    abortController.signal.addEventListener('abort', function () {
        if ((0, types_js_1.isPaneBackend)(backendType)) {
            void (0, registry_js_1.getBackendByType)(backendType).killPane(paneId, !insideTmux);
        }
    }, { once: true });
}
/**
 * Handle spawn operation for in-process teammates.
 * In-process teammates run in the same Node.js process using AsyncLocalStorage.
 */
function handleSpawnInProcess(input, context) {
    return __awaiter(this, void 0, void 0, function () {
        var setAppState, getAppState, name, prompt, agent_type, plan_mode_required, model, appState, teamName, uniqueName, sanitizedName, teammateId, teammateColor, agentDefinition, allAgents, foundAgent, config, result, teamFile;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    setAppState = context.setAppState, getAppState = context.getAppState;
                    name = input.name, prompt = input.prompt, agent_type = input.agent_type, plan_mode_required = input.plan_mode_required;
                    model = resolveTeammateModel(input.model, getAppState().mainLoopModel);
                    if (!name || !prompt) {
                        throw new Error('name and prompt are required for spawn operation');
                    }
                    appState = getAppState();
                    teamName = input.team_name || ((_a = appState.teamContext) === null || _a === void 0 ? void 0 : _a.teamName);
                    if (!teamName) {
                        throw new Error('team_name is required for spawn operation. Either provide team_name in input or call spawnTeam first to establish team context.');
                    }
                    return [4 /*yield*/, generateUniqueTeammateName(name, teamName)
                        // Sanitize the name to prevent @ in agent IDs
                    ];
                case 1:
                    uniqueName = _c.sent();
                    sanitizedName = (0, teamHelpers_js_1.sanitizeAgentName)(uniqueName);
                    teammateId = (0, agentId_js_1.formatAgentId)(sanitizedName, teamName);
                    teammateColor = (0, teammateLayoutManager_js_1.assignTeammateColor)(teammateId);
                    if (agent_type) {
                        allAgents = context.options.agentDefinitions.activeAgents;
                        foundAgent = allAgents.find(function (a) { return a.agentType === agent_type; });
                        if (foundAgent && (0, loadAgentsDir_js_1.isCustomAgent)(foundAgent)) {
                            agentDefinition = foundAgent;
                        }
                        (0, debug_js_1.logForDebugging)("[handleSpawnInProcess] agent_type=".concat(agent_type, ", found=").concat(!!agentDefinition));
                    }
                    config = {
                        name: sanitizedName,
                        teamName: teamName,
                        prompt: prompt,
                        color: teammateColor,
                        planModeRequired: plan_mode_required !== null && plan_mode_required !== void 0 ? plan_mode_required : false,
                        model: model,
                    };
                    return [4 /*yield*/, (0, spawnInProcess_js_1.spawnInProcessTeammate)(config, context)];
                case 2:
                    result = _c.sent();
                    if (!result.success) {
                        throw new Error((_b = result.error) !== null && _b !== void 0 ? _b : 'Failed to spawn in-process teammate');
                    }
                    // Debug: log what spawn returned
                    (0, debug_js_1.logForDebugging)("[handleSpawnInProcess] spawn result: taskId=".concat(result.taskId, ", hasContext=").concat(!!result.teammateContext, ", hasAbort=").concat(!!result.abortController));
                    // Start the agent execution loop (fire-and-forget)
                    if (result.taskId && result.teammateContext && result.abortController) {
                        (0, inProcessRunner_js_1.startInProcessTeammate)({
                            identity: {
                                agentId: teammateId,
                                agentName: sanitizedName,
                                teamName: teamName,
                                color: teammateColor,
                                planModeRequired: plan_mode_required !== null && plan_mode_required !== void 0 ? plan_mode_required : false,
                                parentSessionId: result.teammateContext.parentSessionId,
                            },
                            taskId: result.taskId,
                            prompt: prompt,
                            description: input.description,
                            model: model,
                            agentDefinition: agentDefinition,
                            teammateContext: result.teammateContext,
                            // Strip messages: the teammate never reads toolUseContext.messages
                            // (it builds its own history via allMessages in inProcessRunner).
                            // Passing the parent's full conversation here would pin it for the
                            // teammate's lifetime, surviving /clear and auto-compact.
                            toolUseContext: __assign(__assign({}, context), { messages: [] }),
                            abortController: result.abortController,
                            invokingRequestId: input.invokingRequestId,
                        });
                        (0, debug_js_1.logForDebugging)("[handleSpawnInProcess] Started agent execution for ".concat(teammateId));
                    }
                    // Track the teammate in AppState's teamContext
                    // Auto-register leader if spawning without prior spawnTeam call
                    setAppState(function (prev) {
                        var _a, _b;
                        var _c, _d, _e, _f, _g, _h;
                        var needsLeaderSetup = !((_c = prev.teamContext) === null || _c === void 0 ? void 0 : _c.leadAgentId);
                        var leadAgentId = needsLeaderSetup
                            ? (0, agentId_js_1.formatAgentId)(constants_js_1.TEAM_LEAD_NAME, teamName)
                            : prev.teamContext.leadAgentId;
                        // Build teammates map, including leader if needed for inbox polling
                        var existingTeammates = ((_d = prev.teamContext) === null || _d === void 0 ? void 0 : _d.teammates) || {};
                        var leadEntry = needsLeaderSetup
                            ? (_a = {},
                                _a[leadAgentId] = {
                                    name: constants_js_1.TEAM_LEAD_NAME,
                                    agentType: constants_js_1.TEAM_LEAD_NAME,
                                    color: (0, teammateLayoutManager_js_1.assignTeammateColor)(leadAgentId),
                                    tmuxSessionName: 'in-process',
                                    tmuxPaneId: 'leader',
                                    cwd: (0, cwd_js_1.getCwd)(),
                                    spawnedAt: Date.now(),
                                },
                                _a) : {};
                        return __assign(__assign({}, prev), { teamContext: __assign(__assign({}, prev.teamContext), { teamName: (_f = teamName !== null && teamName !== void 0 ? teamName : (_e = prev.teamContext) === null || _e === void 0 ? void 0 : _e.teamName) !== null && _f !== void 0 ? _f : 'default', teamFilePath: (_h = (_g = prev.teamContext) === null || _g === void 0 ? void 0 : _g.teamFilePath) !== null && _h !== void 0 ? _h : '', leadAgentId: leadAgentId, teammates: __assign(__assign(__assign({}, existingTeammates), leadEntry), (_b = {}, _b[teammateId] = {
                                    name: sanitizedName,
                                    agentType: agent_type,
                                    color: teammateColor,
                                    tmuxSessionName: 'in-process',
                                    tmuxPaneId: 'in-process',
                                    cwd: (0, cwd_js_1.getCwd)(),
                                    spawnedAt: Date.now(),
                                }, _b)) }) });
                    });
                    return [4 /*yield*/, (0, teamHelpers_js_1.readTeamFileAsync)(teamName)];
                case 3:
                    teamFile = _c.sent();
                    if (!teamFile) {
                        throw new Error("Team \"".concat(teamName, "\" does not exist. Call spawnTeam first to create the team."));
                    }
                    teamFile.members.push({
                        agentId: teammateId,
                        name: sanitizedName,
                        agentType: agent_type,
                        model: model,
                        prompt: prompt,
                        color: teammateColor,
                        planModeRequired: plan_mode_required,
                        joinedAt: Date.now(),
                        tmuxPaneId: 'in-process',
                        cwd: (0, cwd_js_1.getCwd)(),
                        subscriptions: [],
                        backendType: 'in-process',
                    });
                    return [4 /*yield*/, (0, teamHelpers_js_1.writeTeamFileAsync)(teamName, teamFile)
                        // Note: Do NOT send the prompt via mailbox for in-process teammates.
                        // In-process teammates receive the prompt directly via startInProcessTeammate().
                        // The mailbox is only needed for tmux-based teammates which poll for their initial message.
                        // Sending via both paths would cause duplicate welcome messages.
                    ];
                case 4:
                    _c.sent();
                    // Note: Do NOT send the prompt via mailbox for in-process teammates.
                    // In-process teammates receive the prompt directly via startInProcessTeammate().
                    // The mailbox is only needed for tmux-based teammates which poll for their initial message.
                    // Sending via both paths would cause duplicate welcome messages.
                    return [2 /*return*/, {
                            data: {
                                teammate_id: teammateId,
                                agent_id: teammateId,
                                agent_type: agent_type,
                                model: model,
                                name: sanitizedName,
                                color: teammateColor,
                                tmux_session_name: 'in-process',
                                tmux_window_name: 'in-process',
                                tmux_pane_id: 'in-process',
                                team_name: teamName,
                                is_splitpane: false,
                                plan_mode_required: plan_mode_required,
                            },
                        }];
            }
        });
    });
}
/**
 * Handle spawn operation - creates a new Claude Code instance.
 * Uses in-process mode when enabled, otherwise uses tmux/iTerm2 split-pane view.
 * Falls back to in-process if pane backend detection fails (e.g., iTerm2 without
 * it2 CLI or tmux installed).
 */
function handleSpawn(input, context) {
    return __awaiter(this, void 0, void 0, function () {
        var error_1, useSplitPane;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Check if in-process mode is enabled via feature flag
                    if ((0, registry_js_1.isInProcessEnabled)()) {
                        return [2 /*return*/, handleSpawnInProcess(input, context)];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, registry_js_1.detectAndGetBackend)()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    // Auto mode, or tmux mode on native Windows (no tmux panes) falls back in-process.
                    var mode = (0, teammateModeSnapshot_js_1.getTeammateModeFromSnapshot)();
                    var nativeWindowsTmuxFallback = mode === 'tmux' && process.platform === 'win32';
                    if (mode !== 'auto' && !nativeWindowsTmuxFallback) {
                        throw error_1;
                    }
                    if (nativeWindowsTmuxFallback) {
                        (0, debug_js_1.logForDebugging)('[handleSpawn] Native Windows: no pane backend — using in-process teammates');
                    }
                    (0, debug_js_1.logForDebugging)("[handleSpawn] No pane backend available, falling back to in-process: ".concat((0, errors_js_1.errorMessage)(error_1)));
                    // Record the fallback so isInProcessEnabled() reflects the actual mode
                    // (fixes banner and other UI that would otherwise show tmux attach commands).
                    (0, registry_js_1.markInProcessFallback)();
                    return [2 /*return*/, handleSpawnInProcess(input, context)];
                case 4:
                    useSplitPane = input.use_splitpane !== false;
                    if (useSplitPane) {
                        return [2 /*return*/, handleSpawnSplitPane(input, context)];
                    }
                    return [2 /*return*/, handleSpawnSeparateWindow(input, context)];
            }
        });
    });
}
// ============================================================================
// Main Export
// ============================================================================
/**
 * Spawns a new teammate with the given configuration.
 * This is the main entry point for teammate spawning, used by both TeammateTool and AgentTool.
 */
function spawnTeammate(config, context) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, handleSpawn(config, context)];
        });
    });
}
