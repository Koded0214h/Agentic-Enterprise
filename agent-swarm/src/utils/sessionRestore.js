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
exports.restoreSessionStateFromLog = restoreSessionStateFromLog;
exports.computeRestoredAttributionState = computeRestoredAttributionState;
exports.computeStandaloneAgentContext = computeStandaloneAgentContext;
exports.restoreAgentFromSession = restoreAgentFromSession;
exports.refreshAgentDefinitionsForModeSwitch = refreshAgentDefinitionsForModeSwitch;
exports.restoreWorktreeForResume = restoreWorktreeForResume;
exports.exitRestoredWorktree = exitRestoredWorktree;
exports.processResumedConversation = processResumedConversation;
var bun_bundle_1 = require("bun:bundle");
var path_1 = require("path");
var state_js_1 = require("../bootstrap/state.js");
var systemPromptSections_js_1 = require("../constants/systemPromptSections.js");
var cost_tracker_js_1 = require("../cost-tracker.js");
var loadAgentsDir_js_1 = require("../tools/AgentTool/loadAgentsDir.js");
var constants_js_1 = require("../tools/TodoWriteTool/constants.js");
var ids_js_1 = require("../types/ids.js");
var asciicast_js_1 = require("./asciicast.js");
var claudemd_js_1 = require("./claudemd.js");
var commitAttribution_js_1 = require("./commitAttribution.js");
var concurrentSessions_js_1 = require("./concurrentSessions.js");
var cwd_js_1 = require("./cwd.js");
var debug_js_1 = require("./debug.js");
var fileHistory_js_1 = require("./fileHistory.js");
var messages_js_1 = require("./messages.js");
var model_js_1 = require("./model/model.js");
var plans_js_1 = require("./plans.js");
var Shell_js_1 = require("./Shell.js");
var sessionStorage_js_1 = require("./sessionStorage.js");
var tasks_js_1 = require("./tasks.js");
var types_js_1 = require("./todo/types.js");
var worktree_js_1 = require("./worktree.js");
/**
 * Scan the transcript for the last TodoWrite tool_use block and return its todos.
 * Used to hydrate AppState.todos on SDK --resume so the model's todo list
 * survives session restarts without file persistence.
 */
function extractTodosFromTranscript(messages) {
    for (var i = messages.length - 1; i >= 0; i--) {
        var msg = messages[i];
        if ((msg === null || msg === void 0 ? void 0 : msg.type) !== 'assistant')
            continue;
        var toolUse = msg.message.content.find(function (block) { return block.type === 'tool_use' && block.name === constants_js_1.TODO_WRITE_TOOL_NAME; });
        if (!toolUse || toolUse.type !== 'tool_use')
            continue;
        var input = toolUse.input;
        if (input === null || typeof input !== 'object')
            return [];
        var parsed = (0, types_js_1.TodoListSchema)().safeParse(input.todos);
        return parsed.success ? parsed.data : [];
    }
    return [];
}
/**
 * Restore session state (file history, attribution, todos) from log on resume.
 * Used by both SDK (print.ts) and interactive (REPL.tsx, main.tsx) resume paths.
 */
function restoreSessionStateFromLog(result, setAppState) {
    var _a;
    // Restore file history state
    if (result.fileHistorySnapshots && result.fileHistorySnapshots.length > 0) {
        (0, fileHistory_js_1.fileHistoryRestoreStateFromLog)(result.fileHistorySnapshots, function (newState) {
            setAppState(function (prev) { return (__assign(__assign({}, prev), { fileHistory: newState })); });
        });
    }
    // Restore attribution state (ant-only feature)
    if ((0, bun_bundle_1.feature)('COMMIT_ATTRIBUTION') &&
        result.attributionSnapshots &&
        result.attributionSnapshots.length > 0) {
        (0, commitAttribution_js_1.attributionRestoreStateFromLog)(result.attributionSnapshots, function (newState) {
            setAppState(function (prev) { return (__assign(__assign({}, prev), { attribution: newState })); });
        });
    }
    // Restore context-collapse commit log + staged snapshot. Must run before
    // the first query() so projectView() can rebuild the collapsed view from
    // the resumed Message[]. Called unconditionally (even with
    // undefined/empty entries) because restoreFromEntries resets the store
    // first — without that, an in-session /resume into a session with no
    // commits would leave the prior session's stale commit log intact.
    if ((0, bun_bundle_1.feature)('CONTEXT_COLLAPSE')) {
        /* eslint-disable @typescript-eslint/no-require-imports */
        ;
        require('../services/contextCollapse/persist.js').restoreFromEntries((_a = result.contextCollapseCommits) !== null && _a !== void 0 ? _a : [], result.contextCollapseSnapshot);
        /* eslint-enable @typescript-eslint/no-require-imports */
    }
    // Restore TodoWrite state from transcript (SDK/non-interactive only).
    // Interactive mode uses file-backed v2 tasks, so AppState.todos is unused there.
    if (!(0, tasks_js_1.isTodoV2Enabled)() && result.messages && result.messages.length > 0) {
        var todos_1 = extractTodosFromTranscript(result.messages);
        if (todos_1.length > 0) {
            var agentId_1 = (0, state_js_1.getSessionId)();
            setAppState(function (prev) {
                var _a;
                return (__assign(__assign({}, prev), { todos: __assign(__assign({}, prev.todos), (_a = {}, _a[agentId_1] = todos_1, _a)) }));
            });
        }
    }
}
/**
 * Compute restored attribution state from log snapshots.
 * Used for computing initial state before render (e.g., main.tsx --continue).
 * Returns undefined if attribution feature is disabled or no snapshots exist.
 */
function computeRestoredAttributionState(result) {
    if ((0, bun_bundle_1.feature)('COMMIT_ATTRIBUTION') &&
        result.attributionSnapshots &&
        result.attributionSnapshots.length > 0) {
        return (0, commitAttribution_js_1.restoreAttributionStateFromSnapshots)(result.attributionSnapshots);
    }
    return undefined;
}
/**
 * Compute standalone agent context (name/color) for session resume.
 * Used for computing initial state before render (per CLAUDE.md guidelines).
 * Returns undefined if no name/color is set on the session.
 */
function computeStandaloneAgentContext(agentName, agentColor) {
    if (!agentName && !agentColor) {
        return undefined;
    }
    return {
        name: agentName !== null && agentName !== void 0 ? agentName : '',
        color: (agentColor === 'default' ? undefined : agentColor),
    };
}
/**
 * Restore agent setting from a resumed session.
 *
 * When resuming a conversation that used a custom agent, this re-applies the
 * agent type and model override (unless the user specified --agent on the CLI).
 * Mutates bootstrap state via setMainThreadAgentType / setMainLoopModelOverride.
 *
 * Returns the restored agent definition and its agentType string, or undefined
 * if no agent was restored.
 */
function restoreAgentFromSession(agentSetting, currentAgentDefinition, agentDefinitions) {
    // If user already specified --agent on CLI, keep that definition
    if (currentAgentDefinition) {
        return { agentDefinition: currentAgentDefinition, agentType: undefined };
    }
    // If session had no agent, clear any stale bootstrap state
    if (!agentSetting) {
        (0, state_js_1.setMainThreadAgentType)(undefined);
        return { agentDefinition: undefined, agentType: undefined };
    }
    var resumedAgent = agentDefinitions.activeAgents.find(function (agent) { return agent.agentType === agentSetting; });
    if (!resumedAgent) {
        (0, debug_js_1.logForDebugging)("Resumed session had agent \"".concat(agentSetting, "\" but it is no longer available. Using default behavior."));
        (0, state_js_1.setMainThreadAgentType)(undefined);
        return { agentDefinition: undefined, agentType: undefined };
    }
    (0, state_js_1.setMainThreadAgentType)(resumedAgent.agentType);
    // Apply agent's model if user didn't specify one
    if (!(0, state_js_1.getMainLoopModelOverride)() &&
        resumedAgent.model &&
        resumedAgent.model !== 'inherit') {
        (0, state_js_1.setMainLoopModelOverride)((0, model_js_1.parseUserSpecifiedModel)(resumedAgent.model));
    }
    return { agentDefinition: resumedAgent, agentType: resumedAgent.agentType };
}
/**
 * Refresh agent definitions after a coordinator/normal mode switch.
 *
 * When resuming a session that was in a different mode (coordinator vs normal),
 * the built-in agents need to be re-derived to match the new mode. CLI-provided
 * agents (from --agents flag) are merged back in.
 */
function refreshAgentDefinitionsForModeSwitch(modeWasSwitched, currentCwd, cliAgents, currentAgentDefinitions) {
    return __awaiter(this, void 0, void 0, function () {
        var freshAgentDefs, freshAllAgents;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!(0, bun_bundle_1.feature)('COORDINATOR_MODE') || !modeWasSwitched) {
                        return [2 /*return*/, currentAgentDefinitions];
                    }
                    // Re-derive agent definitions after mode switch so built-in agents
                    // reflect the new coordinator/normal mode
                    (_b = (_a = loadAgentsDir_js_1.getAgentDefinitionsWithOverrides.cache).clear) === null || _b === void 0 ? void 0 : _b.call(_a);
                    return [4 /*yield*/, (0, loadAgentsDir_js_1.getAgentDefinitionsWithOverrides)(currentCwd)];
                case 1:
                    freshAgentDefs = _c.sent();
                    freshAllAgents = __spreadArray(__spreadArray([], freshAgentDefs.allAgents, true), cliAgents, true);
                    return [2 /*return*/, __assign(__assign({}, freshAgentDefs), { allAgents: freshAllAgents, activeAgents: (0, loadAgentsDir_js_1.getActiveAgentsFromList)(freshAllAgents) })];
            }
        });
    });
}
/**
 * Restore the worktree working directory on resume. The transcript records
 * the last worktree enter/exit; if the session crashed while inside a
 * worktree (last entry = session object, not null), cd back into it.
 *
 * process.chdir is the TOCTOU-safe existence check — it throws ENOENT if
 * the /exit dialog removed the directory, or if the user deleted it
 * manually between sessions.
 *
 * When --worktree already created a fresh worktree, that takes precedence
 * over the resumed session's state. restoreSessionMetadata just overwrote
 * project.currentSessionWorktree with the stale transcript value, so
 * re-assert the fresh worktree here before adoptResumedSessionFile writes
 * it back to disk.
 */
function restoreWorktreeForResume(worktreeSession) {
    var _a, _b;
    var fresh = (0, worktree_js_1.getCurrentWorktreeSession)();
    if (fresh) {
        (0, sessionStorage_js_1.saveWorktreeState)(fresh);
        return;
    }
    if (!worktreeSession)
        return;
    try {
        process.chdir(worktreeSession.worktreePath);
    }
    catch (_c) {
        // Directory is gone. Override the stale cache so the next
        // reAppendSessionMetadata records "exited" instead of re-persisting
        // a path that no longer exists.
        (0, sessionStorage_js_1.saveWorktreeState)(null);
        return;
    }
    (0, Shell_js_1.setCwd)(worktreeSession.worktreePath);
    (0, state_js_1.setOriginalCwd)((0, cwd_js_1.getCwd)());
    // projectRoot is intentionally NOT set here. The transcript doesn't record
    // whether the worktree was entered via --worktree (which sets projectRoot)
    // or EnterWorktreeTool (which doesn't). Leaving projectRoot stable matches
    // EnterWorktreeTool's behavior — skills/history stay anchored to the
    // original project.
    (0, worktree_js_1.restoreWorktreeSession)(worktreeSession);
    // The /resume slash command calls this mid-session after caches have been
    // populated against the old cwd. Cheap no-ops for the CLI-flag path
    // (caches aren't populated yet there).
    (0, claudemd_js_1.clearMemoryFileCaches)();
    (0, systemPromptSections_js_1.clearSystemPromptSections)();
    (_b = (_a = plans_js_1.getPlansDirectory.cache).clear) === null || _b === void 0 ? void 0 : _b.call(_a);
}
/**
 * Undo restoreWorktreeForResume before a mid-session /resume switches to
 * another session. Without this, /resume from a worktree session to a
 * non-worktree session leaves the user in the old worktree directory with
 * currentWorktreeSession still pointing at the prior session. /resume to a
 * *different* worktree fails entirely — the getCurrentWorktreeSession()
 * guard above blocks the switch.
 *
 * Not needed by CLI --resume/--continue: those run once at startup where
 * getCurrentWorktreeSession() is only truthy if --worktree was used (fresh
 * worktree that should take precedence, handled by the re-assert above).
 */
function exitRestoredWorktree() {
    var _a, _b;
    var current = (0, worktree_js_1.getCurrentWorktreeSession)();
    if (!current)
        return;
    (0, worktree_js_1.restoreWorktreeSession)(null);
    // Worktree state changed, so cached prompt sections that reference it are
    // stale whether or not chdir succeeds below.
    (0, claudemd_js_1.clearMemoryFileCaches)();
    (0, systemPromptSections_js_1.clearSystemPromptSections)();
    (_b = (_a = plans_js_1.getPlansDirectory.cache).clear) === null || _b === void 0 ? void 0 : _b.call(_a);
    try {
        process.chdir(current.originalCwd);
    }
    catch (_c) {
        // Original dir is gone (rare). Stay put — restoreWorktreeForResume
        // will cd into the target worktree next if there is one.
        return;
    }
    (0, Shell_js_1.setCwd)(current.originalCwd);
    (0, state_js_1.setOriginalCwd)((0, cwd_js_1.getCwd)());
}
/**
 * Process a loaded conversation for resume/continue.
 *
 * Handles coordinator mode matching, session ID setup, agent restoration,
 * mode persistence, and initial state computation. Called by both --continue
 * and --resume paths in main.tsx.
 */
function processResumedConversation(result, opts, context) {
    return __awaiter(this, void 0, void 0, function () {
        var modeWarning, sid, _a, restoredAgent, resumedAgentType, restoredAttribution, standaloneAgentContext, refreshedAgentDefs;
        var _b, _c, _d, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    if ((0, bun_bundle_1.feature)('COORDINATOR_MODE')) {
                        modeWarning = (_b = context.modeApi) === null || _b === void 0 ? void 0 : _b.matchSessionMode(result.mode);
                        if (modeWarning) {
                            result.messages.push((0, messages_js_1.createSystemMessage)(modeWarning, 'warning'));
                        }
                    }
                    if (!!opts.forkSession) return [3 /*break*/, 4];
                    sid = (_c = opts.sessionIdOverride) !== null && _c !== void 0 ? _c : result.sessionId;
                    if (!sid) return [3 /*break*/, 3];
                    // When resuming from a different project directory (git worktrees,
                    // cross-project), transcriptPath points to the actual file; its dirname
                    // is the project dir. Otherwise the session lives in the current project.
                    (0, state_js_1.switchSession)((0, ids_js_1.asSessionId)(sid), opts.transcriptPath ? (0, path_1.dirname)(opts.transcriptPath) : null);
                    // Rename asciicast recording to match the resumed session ID so
                    // getSessionRecordingPaths() can discover it during /share
                    return [4 /*yield*/, (0, asciicast_js_1.renameRecordingForSession)()];
                case 1:
                    // Rename asciicast recording to match the resumed session ID so
                    // getSessionRecordingPaths() can discover it during /share
                    _g.sent();
                    return [4 /*yield*/, (0, sessionStorage_js_1.resetSessionFilePointer)()];
                case 2:
                    _g.sent();
                    (0, cost_tracker_js_1.restoreCostStateForSession)(sid);
                    _g.label = 3;
                case 3: return [3 /*break*/, 6];
                case 4:
                    if (!((_d = result.contentReplacements) === null || _d === void 0 ? void 0 : _d.length)) return [3 /*break*/, 6];
                    // --fork-session keeps the fresh startup session ID. useLogMessages will
                    // copy source messages into the new JSONL via recordTranscript, but
                    // content-replacement entries are a separate entry type only written by
                    // recordContentReplacement (which query.ts calls for newlyReplaced, never
                    // the pre-loaded records). Without this seed, `claude -r {newSessionId}`
                    // finds source tool_use_ids in messages but no matching replacement records
                    // → they're classified as FROZEN → full content sent (cache miss, permanent
                    // overage). insertContentReplacement stamps sessionId = getSessionId() =
                    // the fresh ID, so loadTranscriptFile's keyed lookup will match.
                    return [4 /*yield*/, (0, sessionStorage_js_1.recordContentReplacement)(result.contentReplacements)];
                case 5:
                    // --fork-session keeps the fresh startup session ID. useLogMessages will
                    // copy source messages into the new JSONL via recordTranscript, but
                    // content-replacement entries are a separate entry type only written by
                    // recordContentReplacement (which query.ts calls for newlyReplaced, never
                    // the pre-loaded records). Without this seed, `claude -r {newSessionId}`
                    // finds source tool_use_ids in messages but no matching replacement records
                    // → they're classified as FROZEN → full content sent (cache miss, permanent
                    // overage). insertContentReplacement stamps sessionId = getSessionId() =
                    // the fresh ID, so loadTranscriptFile's keyed lookup will match.
                    _g.sent();
                    _g.label = 6;
                case 6:
                    // Restore session metadata so /status shows the saved name and metadata
                    // is re-appended on session exit. Fork doesn't take ownership of the
                    // original session's worktree — a "Remove" on the fork's exit dialog
                    // would delete a worktree the original session still references — so
                    // strip worktreeSession from the fork path so the cache stays unset.
                    (0, sessionStorage_js_1.restoreSessionMetadata)(opts.forkSession ? __assign(__assign({}, result), { worktreeSession: undefined }) : result);
                    if (!opts.forkSession) {
                        // Cd back into the worktree the session was in when it last exited.
                        // Done after restoreSessionMetadata (which caches the worktree state
                        // from the transcript) so if the directory is gone we can override
                        // the cache before adoptResumedSessionFile writes it.
                        restoreWorktreeForResume(result.worktreeSession);
                        // Point sessionFile at the resumed transcript and re-append metadata
                        // now. resetSessionFilePointer above nulled it (so the old fresh-session
                        // path doesn't leak), but that blocks reAppendSessionMetadata — which
                        // bails on null — from running in the exit cleanup handler. For fork,
                        // useLogMessages populates a *new* file via recordTranscript on REPL
                        // mount; the normal lazy-materialize path is correct there.
                        (0, sessionStorage_js_1.adoptResumedSessionFile)();
                    }
                    // Restore context-collapse commit log + staged snapshot. The interactive
                    // /resume path goes through restoreSessionStateFromLog (REPL.tsx); CLI
                    // --continue/--resume goes through here instead. Called unconditionally
                    // — see the restoreSessionStateFromLog callsite above for why.
                    if ((0, bun_bundle_1.feature)('CONTEXT_COLLAPSE')) {
                        /* eslint-disable @typescript-eslint/no-require-imports */
                        ;
                        require('../services/contextCollapse/persist.js').restoreFromEntries((_e = result.contextCollapseCommits) !== null && _e !== void 0 ? _e : [], result.contextCollapseSnapshot);
                        /* eslint-enable @typescript-eslint/no-require-imports */
                    }
                    _a = restoreAgentFromSession(result.agentSetting, context.mainThreadAgentDefinition, context.agentDefinitions), restoredAgent = _a.agentDefinition, resumedAgentType = _a.agentType;
                    // Persist the current mode so future resumes know what mode this session was in
                    if ((0, bun_bundle_1.feature)('COORDINATOR_MODE')) {
                        (0, sessionStorage_js_1.saveMode)(((_f = context.modeApi) === null || _f === void 0 ? void 0 : _f.isCoordinatorMode()) ? 'coordinator' : 'normal');
                    }
                    restoredAttribution = opts.includeAttribution
                        ? computeRestoredAttributionState(result)
                        : undefined;
                    standaloneAgentContext = computeStandaloneAgentContext(result.agentName, result.agentColor);
                    void (0, concurrentSessions_js_1.updateSessionName)(result.agentName);
                    return [4 /*yield*/, refreshAgentDefinitionsForModeSwitch(!!modeWarning, context.currentCwd, context.cliAgents, context.agentDefinitions)];
                case 7:
                    refreshedAgentDefs = _g.sent();
                    return [2 /*return*/, {
                            messages: result.messages,
                            fileHistorySnapshots: result.fileHistorySnapshots,
                            contentReplacements: result.contentReplacements,
                            agentName: result.agentName,
                            agentColor: (result.agentColor === 'default'
                                ? undefined
                                : result.agentColor),
                            restoredAgentDef: restoredAgent,
                            initialState: __assign(__assign(__assign(__assign(__assign({}, context.initialState), (resumedAgentType && { agent: resumedAgentType })), (restoredAttribution && { attribution: restoredAttribution })), (standaloneAgentContext && { standaloneAgentContext: standaloneAgentContext })), { agentDefinitions: refreshedAgentDefs }),
                        }];
            }
        });
    });
}
