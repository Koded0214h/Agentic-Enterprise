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
exports.onSessionSwitch = void 0;
exports.getSessionId = getSessionId;
exports.regenerateSessionId = regenerateSessionId;
exports.getParentSessionId = getParentSessionId;
exports.switchSession = switchSession;
exports.getSessionProjectDir = getSessionProjectDir;
exports.getOriginalCwd = getOriginalCwd;
exports.getProjectRoot = getProjectRoot;
exports.setOriginalCwd = setOriginalCwd;
exports.setProjectRoot = setProjectRoot;
exports.getCwdState = getCwdState;
exports.setCwdState = setCwdState;
exports.getDirectConnectServerUrl = getDirectConnectServerUrl;
exports.setDirectConnectServerUrl = setDirectConnectServerUrl;
exports.addToTotalDurationState = addToTotalDurationState;
exports.resetTotalDurationStateAndCost_FOR_TESTS_ONLY = resetTotalDurationStateAndCost_FOR_TESTS_ONLY;
exports.addToTotalCostState = addToTotalCostState;
exports.getTotalCostUSD = getTotalCostUSD;
exports.getTotalAPIDuration = getTotalAPIDuration;
exports.getTotalDuration = getTotalDuration;
exports.getTotalAPIDurationWithoutRetries = getTotalAPIDurationWithoutRetries;
exports.getTotalToolDuration = getTotalToolDuration;
exports.addToToolDuration = addToToolDuration;
exports.getTurnHookDurationMs = getTurnHookDurationMs;
exports.addToTurnHookDuration = addToTurnHookDuration;
exports.resetTurnHookDuration = resetTurnHookDuration;
exports.getTurnHookCount = getTurnHookCount;
exports.getTurnToolDurationMs = getTurnToolDurationMs;
exports.resetTurnToolDuration = resetTurnToolDuration;
exports.getTurnToolCount = getTurnToolCount;
exports.getTurnClassifierDurationMs = getTurnClassifierDurationMs;
exports.addToTurnClassifierDuration = addToTurnClassifierDuration;
exports.resetTurnClassifierDuration = resetTurnClassifierDuration;
exports.getTurnClassifierCount = getTurnClassifierCount;
exports.getStatsStore = getStatsStore;
exports.setStatsStore = setStatsStore;
exports.updateLastInteractionTime = updateLastInteractionTime;
exports.flushInteractionTime = flushInteractionTime;
exports.addToTotalLinesChanged = addToTotalLinesChanged;
exports.getTotalLinesAdded = getTotalLinesAdded;
exports.getTotalLinesRemoved = getTotalLinesRemoved;
exports.getTotalInputTokens = getTotalInputTokens;
exports.getTotalOutputTokens = getTotalOutputTokens;
exports.getTotalCacheReadInputTokens = getTotalCacheReadInputTokens;
exports.getTotalCacheCreationInputTokens = getTotalCacheCreationInputTokens;
exports.getTotalWebSearchRequests = getTotalWebSearchRequests;
exports.getTurnOutputTokens = getTurnOutputTokens;
exports.getCurrentTurnTokenBudget = getCurrentTurnTokenBudget;
exports.snapshotOutputTokensForTurn = snapshotOutputTokensForTurn;
exports.getBudgetContinuationCount = getBudgetContinuationCount;
exports.incrementBudgetContinuationCount = incrementBudgetContinuationCount;
exports.setHasUnknownModelCost = setHasUnknownModelCost;
exports.hasUnknownModelCost = hasUnknownModelCost;
exports.getLastMainRequestId = getLastMainRequestId;
exports.setLastMainRequestId = setLastMainRequestId;
exports.getLastApiCompletionTimestamp = getLastApiCompletionTimestamp;
exports.setLastApiCompletionTimestamp = setLastApiCompletionTimestamp;
exports.markPostCompaction = markPostCompaction;
exports.consumePostCompaction = consumePostCompaction;
exports.getLastInteractionTime = getLastInteractionTime;
exports.markScrollActivity = markScrollActivity;
exports.getIsScrollDraining = getIsScrollDraining;
exports.waitForScrollIdle = waitForScrollIdle;
exports.getModelUsage = getModelUsage;
exports.getUsageForModel = getUsageForModel;
exports.getMainLoopModelOverride = getMainLoopModelOverride;
exports.getInitialMainLoopModel = getInitialMainLoopModel;
exports.setMainLoopModelOverride = setMainLoopModelOverride;
exports.setInitialMainLoopModel = setInitialMainLoopModel;
exports.getSdkBetas = getSdkBetas;
exports.setSdkBetas = setSdkBetas;
exports.resetCostState = resetCostState;
exports.setCostStateForRestore = setCostStateForRestore;
exports.resetStateForTests = resetStateForTests;
exports.getModelStrings = getModelStrings;
exports.setModelStrings = setModelStrings;
exports.resetModelStringsForTestingOnly = resetModelStringsForTestingOnly;
exports.setMeter = setMeter;
exports.getMeter = getMeter;
exports.getSessionCounter = getSessionCounter;
exports.getLocCounter = getLocCounter;
exports.getPrCounter = getPrCounter;
exports.getCommitCounter = getCommitCounter;
exports.getCostCounter = getCostCounter;
exports.getTokenCounter = getTokenCounter;
exports.getCodeEditToolDecisionCounter = getCodeEditToolDecisionCounter;
exports.getActiveTimeCounter = getActiveTimeCounter;
exports.getLoggerProvider = getLoggerProvider;
exports.setLoggerProvider = setLoggerProvider;
exports.getEventLogger = getEventLogger;
exports.setEventLogger = setEventLogger;
exports.getMeterProvider = getMeterProvider;
exports.setMeterProvider = setMeterProvider;
exports.getTracerProvider = getTracerProvider;
exports.setTracerProvider = setTracerProvider;
exports.getIsNonInteractiveSession = getIsNonInteractiveSession;
exports.getIsInteractive = getIsInteractive;
exports.setIsInteractive = setIsInteractive;
exports.getClientType = getClientType;
exports.setClientType = setClientType;
exports.getSdkAgentProgressSummariesEnabled = getSdkAgentProgressSummariesEnabled;
exports.setSdkAgentProgressSummariesEnabled = setSdkAgentProgressSummariesEnabled;
exports.getKairosActive = getKairosActive;
exports.setKairosActive = setKairosActive;
exports.getStrictToolResultPairing = getStrictToolResultPairing;
exports.setStrictToolResultPairing = setStrictToolResultPairing;
exports.getUserMsgOptIn = getUserMsgOptIn;
exports.setUserMsgOptIn = setUserMsgOptIn;
exports.getSessionSource = getSessionSource;
exports.setSessionSource = setSessionSource;
exports.getQuestionPreviewFormat = getQuestionPreviewFormat;
exports.setQuestionPreviewFormat = setQuestionPreviewFormat;
exports.getAgentColorMap = getAgentColorMap;
exports.getFlagSettingsPath = getFlagSettingsPath;
exports.setFlagSettingsPath = setFlagSettingsPath;
exports.getFlagSettingsInline = getFlagSettingsInline;
exports.setFlagSettingsInline = setFlagSettingsInline;
exports.getSessionIngressToken = getSessionIngressToken;
exports.setSessionIngressToken = setSessionIngressToken;
exports.getOauthTokenFromFd = getOauthTokenFromFd;
exports.setOauthTokenFromFd = setOauthTokenFromFd;
exports.getApiKeyFromFd = getApiKeyFromFd;
exports.setApiKeyFromFd = setApiKeyFromFd;
exports.setLastAPIRequest = setLastAPIRequest;
exports.getLastAPIRequest = getLastAPIRequest;
exports.setLastAPIRequestMessages = setLastAPIRequestMessages;
exports.getLastAPIRequestMessages = getLastAPIRequestMessages;
exports.setLastClassifierRequests = setLastClassifierRequests;
exports.getLastClassifierRequests = getLastClassifierRequests;
exports.setCachedClaudeMdContent = setCachedClaudeMdContent;
exports.getCachedClaudeMdContent = getCachedClaudeMdContent;
exports.addToInMemoryErrorLog = addToInMemoryErrorLog;
exports.getAllowedSettingSources = getAllowedSettingSources;
exports.setAllowedSettingSources = setAllowedSettingSources;
exports.preferThirdPartyAuthentication = preferThirdPartyAuthentication;
exports.setInlinePlugins = setInlinePlugins;
exports.getInlinePlugins = getInlinePlugins;
exports.setChromeFlagOverride = setChromeFlagOverride;
exports.getChromeFlagOverride = getChromeFlagOverride;
exports.setUseCoworkPlugins = setUseCoworkPlugins;
exports.getUseCoworkPlugins = getUseCoworkPlugins;
exports.setSessionBypassPermissionsMode = setSessionBypassPermissionsMode;
exports.getSessionBypassPermissionsMode = getSessionBypassPermissionsMode;
exports.setScheduledTasksEnabled = setScheduledTasksEnabled;
exports.getScheduledTasksEnabled = getScheduledTasksEnabled;
exports.getSessionCronTasks = getSessionCronTasks;
exports.addSessionCronTask = addSessionCronTask;
exports.removeSessionCronTasks = removeSessionCronTasks;
exports.setSessionTrustAccepted = setSessionTrustAccepted;
exports.getSessionTrustAccepted = getSessionTrustAccepted;
exports.setSessionPersistenceDisabled = setSessionPersistenceDisabled;
exports.isSessionPersistenceDisabled = isSessionPersistenceDisabled;
exports.hasExitedPlanModeInSession = hasExitedPlanModeInSession;
exports.setHasExitedPlanMode = setHasExitedPlanMode;
exports.needsPlanModeExitAttachment = needsPlanModeExitAttachment;
exports.setNeedsPlanModeExitAttachment = setNeedsPlanModeExitAttachment;
exports.handlePlanModeTransition = handlePlanModeTransition;
exports.needsAutoModeExitAttachment = needsAutoModeExitAttachment;
exports.setNeedsAutoModeExitAttachment = setNeedsAutoModeExitAttachment;
exports.handleAutoModeTransition = handleAutoModeTransition;
exports.hasShownLspRecommendationThisSession = hasShownLspRecommendationThisSession;
exports.setLspRecommendationShownThisSession = setLspRecommendationShownThisSession;
exports.setInitJsonSchema = setInitJsonSchema;
exports.getInitJsonSchema = getInitJsonSchema;
exports.registerHookCallbacks = registerHookCallbacks;
exports.getRegisteredHooks = getRegisteredHooks;
exports.clearRegisteredHooks = clearRegisteredHooks;
exports.clearRegisteredPluginHooks = clearRegisteredPluginHooks;
exports.resetSdkInitState = resetSdkInitState;
exports.getPlanSlugCache = getPlanSlugCache;
exports.getSessionCreatedTeams = getSessionCreatedTeams;
exports.setTeleportedSessionInfo = setTeleportedSessionInfo;
exports.getTeleportedSessionInfo = getTeleportedSessionInfo;
exports.markFirstTeleportMessageLogged = markFirstTeleportMessageLogged;
exports.addInvokedSkill = addInvokedSkill;
exports.getInvokedSkills = getInvokedSkills;
exports.getInvokedSkillsForAgent = getInvokedSkillsForAgent;
exports.clearInvokedSkills = clearInvokedSkills;
exports.clearInvokedSkillsForAgent = clearInvokedSkillsForAgent;
exports.addSlowOperation = addSlowOperation;
exports.getSlowOperations = getSlowOperations;
exports.getMainThreadAgentType = getMainThreadAgentType;
exports.setMainThreadAgentType = setMainThreadAgentType;
exports.getIsRemoteMode = getIsRemoteMode;
exports.setIsRemoteMode = setIsRemoteMode;
exports.getSystemPromptSectionCache = getSystemPromptSectionCache;
exports.setSystemPromptSectionCacheEntry = setSystemPromptSectionCacheEntry;
exports.clearSystemPromptSectionState = clearSystemPromptSectionState;
exports.getLastEmittedDate = getLastEmittedDate;
exports.setLastEmittedDate = setLastEmittedDate;
exports.getAdditionalDirectoriesForClaudeMd = getAdditionalDirectoriesForClaudeMd;
exports.setAdditionalDirectoriesForClaudeMd = setAdditionalDirectoriesForClaudeMd;
exports.getAllowedChannels = getAllowedChannels;
exports.setAllowedChannels = setAllowedChannels;
exports.getHasDevChannels = getHasDevChannels;
exports.setHasDevChannels = setHasDevChannels;
exports.getPromptCache1hAllowlist = getPromptCache1hAllowlist;
exports.setPromptCache1hAllowlist = setPromptCache1hAllowlist;
exports.getPromptCache1hEligible = getPromptCache1hEligible;
exports.setPromptCache1hEligible = setPromptCache1hEligible;
exports.getAfkModeHeaderLatched = getAfkModeHeaderLatched;
exports.setAfkModeHeaderLatched = setAfkModeHeaderLatched;
exports.getFastModeHeaderLatched = getFastModeHeaderLatched;
exports.setFastModeHeaderLatched = setFastModeHeaderLatched;
exports.getCacheEditingHeaderLatched = getCacheEditingHeaderLatched;
exports.setCacheEditingHeaderLatched = setCacheEditingHeaderLatched;
exports.getThinkingClearLatched = getThinkingClearLatched;
exports.setThinkingClearLatched = setThinkingClearLatched;
exports.clearBetaHeaderLatches = clearBetaHeaderLatches;
exports.getPromptId = getPromptId;
exports.setPromptId = setPromptId;
var fs_1 = require("fs");
var sumBy_js_1 = require("lodash-es/sumBy.js");
var process_1 = require("process");
// Indirection for browser-sdk build (package.json "browser" field swaps
// crypto.ts for crypto.browser.ts). Pure leaf re-export of node:crypto —
// zero circular-dep risk. Path-alias import bypasses bootstrap-isolation
// (rule only checks ./ and / prefixes); explicit disable documents intent.
// eslint-disable-next-line custom-rules/bootstrap-isolation
var crypto_js_1 = require("src/utils/crypto.js");
var settingsCache_js_1 = require("src/utils/settings/settingsCache.js");
var signal_js_1 = require("src/utils/signal.js");
// ALSO HERE - THINK THRICE BEFORE MODIFYING
function getInitialState() {
    // Resolve symlinks in cwd to match behavior of shell.ts setCwd
    // This ensures consistency with how paths are sanitized for session storage
    var resolvedCwd = '';
    if (typeof process !== 'undefined' &&
        typeof process.cwd === 'function' &&
        typeof fs_1.realpathSync === 'function') {
        var rawCwd = (0, process_1.cwd)();
        try {
            resolvedCwd = (0, fs_1.realpathSync)(rawCwd).normalize('NFC');
        }
        catch (_a) {
            // File Provider EPERM on CloudStorage mounts (lstat per path component).
            resolvedCwd = rawCwd.normalize('NFC');
        }
    }
    var state = __assign(__assign({ originalCwd: resolvedCwd, projectRoot: resolvedCwd, totalCostUSD: 0, totalAPIDuration: 0, totalAPIDurationWithoutRetries: 0, totalToolDuration: 0, turnHookDurationMs: 0, turnToolDurationMs: 0, turnClassifierDurationMs: 0, turnToolCount: 0, turnHookCount: 0, turnClassifierCount: 0, startTime: Date.now(), lastInteractionTime: Date.now(), totalLinesAdded: 0, totalLinesRemoved: 0, hasUnknownModelCost: false, cwd: resolvedCwd, modelUsage: {}, mainLoopModelOverride: undefined, initialMainLoopModel: null, modelStrings: null, isInteractive: false, kairosActive: false, strictToolResultPairing: false, sdkAgentProgressSummariesEnabled: false, userMsgOptIn: false, clientType: 'cli', sessionSource: undefined, questionPreviewFormat: undefined, sessionIngressToken: undefined, oauthTokenFromFd: undefined, apiKeyFromFd: undefined, flagSettingsPath: undefined, flagSettingsInline: null, allowedSettingSources: [
            'userSettings',
            'projectSettings',
            'localSettings',
            'flagSettings',
            'policySettings',
        ], 
        // Telemetry state
        meter: null, sessionCounter: null, locCounter: null, prCounter: null, commitCounter: null, costCounter: null, tokenCounter: null, codeEditToolDecisionCounter: null, activeTimeCounter: null, statsStore: null, sessionId: (0, crypto_js_1.randomUUID)(), parentSessionId: undefined, 
        // Logger state
        loggerProvider: null, eventLogger: null, 
        // Meter provider state
        meterProvider: null, tracerProvider: null, 
        // Agent color state
        agentColorMap: new Map(), agentColorIndex: 0, 
        // Last API request for bug reports
        lastAPIRequest: null, lastAPIRequestMessages: null, 
        // Last auto-mode classifier request(s) for /share transcript
        lastClassifierRequests: null, cachedClaudeMdContent: null, 
        // In-memory error log for recent errors
        inMemoryErrorLog: [], 
        // Session-only plugins from --plugin-dir flag
        inlinePlugins: [], 
        // Explicit --chrome / --no-chrome flag value (undefined = not set on CLI)
        chromeFlagOverride: undefined, 
        // Use cowork_plugins directory instead of plugins
        useCoworkPlugins: false, 
        // Session-only bypass permissions mode flag (not persisted)
        sessionBypassPermissionsMode: false, 
        // Scheduled tasks disabled until flag or dialog enables them
        scheduledTasksEnabled: false, sessionCronTasks: [], sessionCreatedTeams: new Set(), 
        // Session-only trust flag (not persisted to disk)
        sessionTrustAccepted: false, 
        // Session-only flag to disable session persistence to disk
        sessionPersistenceDisabled: false, 
        // Track if user has exited plan mode in this session
        hasExitedPlanMode: false, 
        // Track if we need to show the plan mode exit attachment
        needsPlanModeExitAttachment: false, 
        // Track if we need to show the auto mode exit attachment
        needsAutoModeExitAttachment: false, 
        // Track if LSP plugin recommendation has been shown this session
        lspRecommendationShownThisSession: false, 
        // SDK init event state
        initJsonSchema: null, registeredHooks: null, 
        // Cache for plan slugs
        planSlugCache: new Map(), 
        // Track teleported session for reliability logging
        teleportedSessionInfo: null, 
        // Track invoked skills for preservation across compaction
        invokedSkills: new Map(), 
        // Track slow operations for dev bar display
        slowOperations: [], 
        // SDK-provided betas
        sdkBetas: undefined, 
        // Main thread agent type
        mainThreadAgentType: undefined, 
        // Remote mode
        isRemoteMode: false }, (process.env.USER_TYPE === 'ant'
        ? {
            replBridgeActive: false,
        }
        : {})), { 
        // Direct connect server URL
        directConnectServerUrl: undefined, 
        // System prompt section cache state
        systemPromptSectionCache: new Map(), 
        // Last date emitted to the model
        lastEmittedDate: null, 
        // Additional directories from --add-dir flag (for CLAUDE.md loading)
        additionalDirectoriesForClaudeMd: [], 
        // Channel server allowlist from --channels flag
        allowedChannels: [], hasDevChannels: false, 
        // Session project dir (null = derive from originalCwd)
        sessionProjectDir: null, 
        // Prompt cache 1h allowlist (null = not yet fetched from GrowthBook)
        promptCache1hAllowlist: null, 
        // Prompt cache 1h eligibility (null = not yet evaluated)
        promptCache1hEligible: null, 
        // Beta header latches (null = not yet triggered)
        afkModeHeaderLatched: null, fastModeHeaderLatched: null, cacheEditingHeaderLatched: null, thinkingClearLatched: null, 
        // Current prompt ID
        promptId: null, lastMainRequestId: undefined, lastApiCompletionTimestamp: null, pendingPostCompaction: false });
    return state;
}
// AND ESPECIALLY HERE
var STATE = getInitialState();
function getSessionId() {
    return STATE.sessionId;
}
function regenerateSessionId(options) {
    if (options === void 0) { options = {}; }
    if (options.setCurrentAsParent) {
        STATE.parentSessionId = STATE.sessionId;
    }
    // Drop the outgoing session's plan-slug entry so the Map doesn't
    // accumulate stale keys. Callers that need to carry the slug across
    // (REPL.tsx clearContext) read it before calling clearConversation.
    STATE.planSlugCache.delete(STATE.sessionId);
    // Regenerated sessions live in the current project: reset projectDir to
    // null so getTranscriptPath() derives from originalCwd.
    STATE.sessionId = (0, crypto_js_1.randomUUID)();
    STATE.sessionProjectDir = null;
    return STATE.sessionId;
}
function getParentSessionId() {
    return STATE.parentSessionId;
}
/**
 * Atomically switch the active session. `sessionId` and `sessionProjectDir`
 * always change together — there is no separate setter for either, so they
 * cannot drift out of sync (CC-34).
 *
 * @param projectDir — directory containing `<sessionId>.jsonl`. Omit (or
 *   pass `null`) for sessions in the current project — the path will derive
 *   from originalCwd at read time. Pass `dirname(transcriptPath)` when the
 *   session lives in a different project directory (git worktrees,
 *   cross-project resume). Every call resets the project dir; it never
 *   carries over from the previous session.
 */
function switchSession(sessionId, projectDir) {
    if (projectDir === void 0) { projectDir = null; }
    // Drop the outgoing session's plan-slug entry so the Map stays bounded
    // across repeated /resume. Only the current session's slug is ever read
    // (plans.ts getPlanSlug defaults to getSessionId()).
    STATE.planSlugCache.delete(STATE.sessionId);
    STATE.sessionId = sessionId;
    STATE.sessionProjectDir = projectDir;
    sessionSwitched.emit(sessionId);
}
var sessionSwitched = (0, signal_js_1.createSignal)();
/**
 * Register a callback that fires when switchSession changes the active
 * sessionId. bootstrap can't import listeners directly (DAG leaf), so
 * callers register themselves. concurrentSessions.ts uses this to keep the
 * PID file's sessionId in sync with --resume.
 */
exports.onSessionSwitch = sessionSwitched.subscribe;
/**
 * Project directory the current session's transcript lives in, or `null` if
 * the session was created in the current project (common case — derive from
 * originalCwd). See `switchSession()`.
 */
function getSessionProjectDir() {
    return STATE.sessionProjectDir;
}
function getOriginalCwd() {
    return STATE.originalCwd;
}
/**
 * Get the stable project root directory.
 * Unlike getOriginalCwd(), this is never updated by mid-session EnterWorktreeTool
 * (so skills/history stay stable when entering a throwaway worktree).
 * It IS set at startup by --worktree, since that worktree is the session's project.
 * Use for project identity (history, skills, sessions) not file operations.
 */
function getProjectRoot() {
    return STATE.projectRoot;
}
function setOriginalCwd(cwd) {
    STATE.originalCwd = cwd.normalize('NFC');
}
/**
 * Only for --worktree startup flag. Mid-session EnterWorktreeTool must NOT
 * call this — skills/history should stay anchored to where the session started.
 */
function setProjectRoot(cwd) {
    STATE.projectRoot = cwd.normalize('NFC');
}
function getCwdState() {
    return STATE.cwd;
}
function setCwdState(cwd) {
    STATE.cwd = cwd.normalize('NFC');
}
function getDirectConnectServerUrl() {
    return STATE.directConnectServerUrl;
}
function setDirectConnectServerUrl(url) {
    STATE.directConnectServerUrl = url;
}
function addToTotalDurationState(duration, durationWithoutRetries) {
    STATE.totalAPIDuration += duration;
    STATE.totalAPIDurationWithoutRetries += durationWithoutRetries;
}
function resetTotalDurationStateAndCost_FOR_TESTS_ONLY() {
    STATE.totalAPIDuration = 0;
    STATE.totalAPIDurationWithoutRetries = 0;
    STATE.totalCostUSD = 0;
}
function addToTotalCostState(cost, modelUsage, model) {
    STATE.modelUsage[model] = modelUsage;
    STATE.totalCostUSD += cost;
}
function getTotalCostUSD() {
    return STATE.totalCostUSD;
}
function getTotalAPIDuration() {
    return STATE.totalAPIDuration;
}
function getTotalDuration() {
    return Date.now() - STATE.startTime;
}
function getTotalAPIDurationWithoutRetries() {
    return STATE.totalAPIDurationWithoutRetries;
}
function getTotalToolDuration() {
    return STATE.totalToolDuration;
}
function addToToolDuration(duration) {
    STATE.totalToolDuration += duration;
    STATE.turnToolDurationMs += duration;
    STATE.turnToolCount++;
}
function getTurnHookDurationMs() {
    return STATE.turnHookDurationMs;
}
function addToTurnHookDuration(duration) {
    STATE.turnHookDurationMs += duration;
    STATE.turnHookCount++;
}
function resetTurnHookDuration() {
    STATE.turnHookDurationMs = 0;
    STATE.turnHookCount = 0;
}
function getTurnHookCount() {
    return STATE.turnHookCount;
}
function getTurnToolDurationMs() {
    return STATE.turnToolDurationMs;
}
function resetTurnToolDuration() {
    STATE.turnToolDurationMs = 0;
    STATE.turnToolCount = 0;
}
function getTurnToolCount() {
    return STATE.turnToolCount;
}
function getTurnClassifierDurationMs() {
    return STATE.turnClassifierDurationMs;
}
function addToTurnClassifierDuration(duration) {
    STATE.turnClassifierDurationMs += duration;
    STATE.turnClassifierCount++;
}
function resetTurnClassifierDuration() {
    STATE.turnClassifierDurationMs = 0;
    STATE.turnClassifierCount = 0;
}
function getTurnClassifierCount() {
    return STATE.turnClassifierCount;
}
function getStatsStore() {
    return STATE.statsStore;
}
function setStatsStore(store) {
    STATE.statsStore = store;
}
/**
 * Marks that an interaction occurred.
 *
 * By default the actual Date.now() call is deferred until the next Ink render
 * frame (via flushInteractionTime()) so we avoid calling Date.now() on every
 * single keypress.
 *
 * Pass `immediate = true` when calling from React useEffect callbacks or
 * other code that runs *after* the Ink render cycle has already flushed.
 * Without it the timestamp stays stale until the next render, which may never
 * come if the user is idle (e.g. permission dialog waiting for input).
 */
var interactionTimeDirty = false;
function updateLastInteractionTime(immediate) {
    if (immediate) {
        flushInteractionTime_inner();
    }
    else {
        interactionTimeDirty = true;
    }
}
/**
 * If an interaction was recorded since the last flush, update the timestamp
 * now. Called by Ink before each render cycle so we batch many keypresses into
 * a single Date.now() call.
 */
function flushInteractionTime() {
    if (interactionTimeDirty) {
        flushInteractionTime_inner();
    }
}
function flushInteractionTime_inner() {
    STATE.lastInteractionTime = Date.now();
    interactionTimeDirty = false;
}
function addToTotalLinesChanged(added, removed) {
    STATE.totalLinesAdded += added;
    STATE.totalLinesRemoved += removed;
}
function getTotalLinesAdded() {
    return STATE.totalLinesAdded;
}
function getTotalLinesRemoved() {
    return STATE.totalLinesRemoved;
}
function getTotalInputTokens() {
    return (0, sumBy_js_1.default)(Object.values(STATE.modelUsage), 'inputTokens');
}
function getTotalOutputTokens() {
    return (0, sumBy_js_1.default)(Object.values(STATE.modelUsage), 'outputTokens');
}
function getTotalCacheReadInputTokens() {
    return (0, sumBy_js_1.default)(Object.values(STATE.modelUsage), 'cacheReadInputTokens');
}
function getTotalCacheCreationInputTokens() {
    return (0, sumBy_js_1.default)(Object.values(STATE.modelUsage), 'cacheCreationInputTokens');
}
function getTotalWebSearchRequests() {
    return (0, sumBy_js_1.default)(Object.values(STATE.modelUsage), 'webSearchRequests');
}
var outputTokensAtTurnStart = 0;
var currentTurnTokenBudget = null;
function getTurnOutputTokens() {
    return getTotalOutputTokens() - outputTokensAtTurnStart;
}
function getCurrentTurnTokenBudget() {
    return currentTurnTokenBudget;
}
var budgetContinuationCount = 0;
function snapshotOutputTokensForTurn(budget) {
    outputTokensAtTurnStart = getTotalOutputTokens();
    currentTurnTokenBudget = budget;
    budgetContinuationCount = 0;
}
function getBudgetContinuationCount() {
    return budgetContinuationCount;
}
function incrementBudgetContinuationCount() {
    budgetContinuationCount++;
}
function setHasUnknownModelCost() {
    STATE.hasUnknownModelCost = true;
}
function hasUnknownModelCost() {
    return STATE.hasUnknownModelCost;
}
function getLastMainRequestId() {
    return STATE.lastMainRequestId;
}
function setLastMainRequestId(requestId) {
    STATE.lastMainRequestId = requestId;
}
function getLastApiCompletionTimestamp() {
    return STATE.lastApiCompletionTimestamp;
}
function setLastApiCompletionTimestamp(timestamp) {
    STATE.lastApiCompletionTimestamp = timestamp;
}
/** Mark that a compaction just occurred. The next API success event will
 *  include isPostCompaction=true, then the flag auto-resets. */
function markPostCompaction() {
    STATE.pendingPostCompaction = true;
}
/** Consume the post-compaction flag. Returns true once after compaction,
 *  then returns false until the next compaction. */
function consumePostCompaction() {
    var was = STATE.pendingPostCompaction;
    STATE.pendingPostCompaction = false;
    return was;
}
function getLastInteractionTime() {
    return STATE.lastInteractionTime;
}
// Scroll drain suspension — background intervals check this before doing work
// so they don't compete with scroll frames for the event loop. Set by
// ScrollBox scrollBy/scrollTo, cleared SCROLL_DRAIN_IDLE_MS after the last
// scroll event. Module-scope (not in STATE) — ephemeral hot-path flag, no
// test-reset needed since the debounce timer self-clears.
var scrollDraining = false;
var scrollDrainTimer;
var SCROLL_DRAIN_IDLE_MS = 150;
/** Mark that a scroll event just happened. Background intervals gate on
 *  getIsScrollDraining() and skip their work until the debounce clears. */
function markScrollActivity() {
    var _a;
    scrollDraining = true;
    if (scrollDrainTimer)
        clearTimeout(scrollDrainTimer);
    scrollDrainTimer = setTimeout(function () {
        scrollDraining = false;
        scrollDrainTimer = undefined;
    }, SCROLL_DRAIN_IDLE_MS);
    (_a = scrollDrainTimer.unref) === null || _a === void 0 ? void 0 : _a.call(scrollDrainTimer);
}
/** True while scroll is actively draining (within 150ms of last event).
 *  Intervals should early-return when this is set — the work picks up next
 *  tick after scroll settles. */
function getIsScrollDraining() {
    return scrollDraining;
}
/** Await this before expensive one-shot work (network, subprocess) that could
 *  coincide with scroll. Resolves immediately if not scrolling; otherwise
 *  polls at the idle interval until the flag clears. */
function waitForScrollIdle() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!scrollDraining) return [3 /*break*/, 2];
                    // bootstrap-isolation forbids importing sleep() from src/utils/
                    // eslint-disable-next-line no-restricted-syntax
                    return [4 /*yield*/, new Promise(function (r) { var _a, _b; return (_b = (_a = setTimeout(r, SCROLL_DRAIN_IDLE_MS)).unref) === null || _b === void 0 ? void 0 : _b.call(_a); })];
                case 1:
                    // bootstrap-isolation forbids importing sleep() from src/utils/
                    // eslint-disable-next-line no-restricted-syntax
                    _a.sent();
                    return [3 /*break*/, 0];
                case 2: return [2 /*return*/];
            }
        });
    });
}
function getModelUsage() {
    return STATE.modelUsage;
}
function getUsageForModel(model) {
    return STATE.modelUsage[model];
}
/**
 * Gets the model override set from the --model CLI flag or after the user
 * updates their configured model.
 */
function getMainLoopModelOverride() {
    return STATE.mainLoopModelOverride;
}
function getInitialMainLoopModel() {
    return STATE.initialMainLoopModel;
}
function setMainLoopModelOverride(model) {
    STATE.mainLoopModelOverride = model;
}
function setInitialMainLoopModel(model) {
    STATE.initialMainLoopModel = model;
}
function getSdkBetas() {
    return STATE.sdkBetas;
}
function setSdkBetas(betas) {
    STATE.sdkBetas = betas;
}
function resetCostState() {
    STATE.totalCostUSD = 0;
    STATE.totalAPIDuration = 0;
    STATE.totalAPIDurationWithoutRetries = 0;
    STATE.totalToolDuration = 0;
    STATE.startTime = Date.now();
    STATE.totalLinesAdded = 0;
    STATE.totalLinesRemoved = 0;
    STATE.hasUnknownModelCost = false;
    STATE.modelUsage = {};
    STATE.promptId = null;
}
/**
 * Sets cost state values for session restore.
 * Called by restoreCostStateForSession in cost-tracker.ts.
 */
function setCostStateForRestore(_a) {
    var totalCostUSD = _a.totalCostUSD, totalAPIDuration = _a.totalAPIDuration, totalAPIDurationWithoutRetries = _a.totalAPIDurationWithoutRetries, totalToolDuration = _a.totalToolDuration, totalLinesAdded = _a.totalLinesAdded, totalLinesRemoved = _a.totalLinesRemoved, lastDuration = _a.lastDuration, modelUsage = _a.modelUsage;
    STATE.totalCostUSD = totalCostUSD;
    STATE.totalAPIDuration = totalAPIDuration;
    STATE.totalAPIDurationWithoutRetries = totalAPIDurationWithoutRetries;
    STATE.totalToolDuration = totalToolDuration;
    STATE.totalLinesAdded = totalLinesAdded;
    STATE.totalLinesRemoved = totalLinesRemoved;
    // Restore per-model usage breakdown
    if (modelUsage) {
        STATE.modelUsage = modelUsage;
    }
    // Adjust startTime to make wall duration accumulate
    if (lastDuration) {
        STATE.startTime = Date.now() - lastDuration;
    }
}
// Only used in tests
function resetStateForTests() {
    if (process.env.NODE_ENV !== 'test') {
        throw new Error('resetStateForTests can only be called in tests');
    }
    Object.entries(getInitialState()).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        STATE[key] = value;
    });
    outputTokensAtTurnStart = 0;
    currentTurnTokenBudget = null;
    budgetContinuationCount = 0;
    sessionSwitched.clear();
}
// You shouldn't use this directly. See src/utils/model/modelStrings.ts::getModelStrings()
function getModelStrings() {
    return STATE.modelStrings;
}
// You shouldn't use this directly. See src/utils/model/modelStrings.ts
function setModelStrings(modelStrings) {
    STATE.modelStrings = modelStrings;
}
// Test utility function to reset model strings for re-initialization.
// Separate from setModelStrings because we only want to accept 'null' in tests.
function resetModelStringsForTestingOnly() {
    STATE.modelStrings = null;
}
function setMeter(meter, createCounter) {
    STATE.meter = meter;
    // Initialize all counters using the provided factory
    STATE.sessionCounter = createCounter('claude_code.session.count', {
        description: 'Count of CLI sessions started',
    });
    STATE.locCounter = createCounter('claude_code.lines_of_code.count', {
        description: "Count of lines of code modified, with the 'type' attribute indicating whether lines were added or removed",
    });
    STATE.prCounter = createCounter('claude_code.pull_request.count', {
        description: 'Number of pull requests created',
    });
    STATE.commitCounter = createCounter('claude_code.commit.count', {
        description: 'Number of git commits created',
    });
    STATE.costCounter = createCounter('claude_code.cost.usage', {
        description: 'Cost of the Claude Code session',
        unit: 'USD',
    });
    STATE.tokenCounter = createCounter('claude_code.token.usage', {
        description: 'Number of tokens used',
        unit: 'tokens',
    });
    STATE.codeEditToolDecisionCounter = createCounter('claude_code.code_edit_tool.decision', {
        description: 'Count of code editing tool permission decisions (accept/reject) for Edit, Write, and NotebookEdit tools',
    });
    STATE.activeTimeCounter = createCounter('claude_code.active_time.total', {
        description: 'Total active time in seconds',
        unit: 's',
    });
}
function getMeter() {
    return STATE.meter;
}
function getSessionCounter() {
    return STATE.sessionCounter;
}
function getLocCounter() {
    return STATE.locCounter;
}
function getPrCounter() {
    return STATE.prCounter;
}
function getCommitCounter() {
    return STATE.commitCounter;
}
function getCostCounter() {
    return STATE.costCounter;
}
function getTokenCounter() {
    return STATE.tokenCounter;
}
function getCodeEditToolDecisionCounter() {
    return STATE.codeEditToolDecisionCounter;
}
function getActiveTimeCounter() {
    return STATE.activeTimeCounter;
}
function getLoggerProvider() {
    return STATE.loggerProvider;
}
function setLoggerProvider(provider) {
    STATE.loggerProvider = provider;
}
function getEventLogger() {
    return STATE.eventLogger;
}
function setEventLogger(logger) {
    STATE.eventLogger = logger;
}
function getMeterProvider() {
    return STATE.meterProvider;
}
function setMeterProvider(provider) {
    STATE.meterProvider = provider;
}
function getTracerProvider() {
    return STATE.tracerProvider;
}
function setTracerProvider(provider) {
    STATE.tracerProvider = provider;
}
function getIsNonInteractiveSession() {
    return !STATE.isInteractive;
}
function getIsInteractive() {
    return STATE.isInteractive;
}
function setIsInteractive(value) {
    STATE.isInteractive = value;
}
function getClientType() {
    return STATE.clientType;
}
function setClientType(type) {
    STATE.clientType = type;
}
function getSdkAgentProgressSummariesEnabled() {
    return STATE.sdkAgentProgressSummariesEnabled;
}
function setSdkAgentProgressSummariesEnabled(value) {
    STATE.sdkAgentProgressSummariesEnabled = value;
}
function getKairosActive() {
    return STATE.kairosActive;
}
function setKairosActive(value) {
    STATE.kairosActive = value;
}
function getStrictToolResultPairing() {
    return STATE.strictToolResultPairing;
}
function setStrictToolResultPairing(value) {
    STATE.strictToolResultPairing = value;
}
// Field name 'userMsgOptIn' avoids excluded-string substrings ('BriefTool',
// 'SendUserMessage' — case-insensitive). All callers are inside feature()
// guards so these accessors don't need their own (matches getKairosActive).
function getUserMsgOptIn() {
    return STATE.userMsgOptIn;
}
function setUserMsgOptIn(value) {
    STATE.userMsgOptIn = value;
}
function getSessionSource() {
    return STATE.sessionSource;
}
function setSessionSource(source) {
    STATE.sessionSource = source;
}
function getQuestionPreviewFormat() {
    return STATE.questionPreviewFormat;
}
function setQuestionPreviewFormat(format) {
    STATE.questionPreviewFormat = format;
}
function getAgentColorMap() {
    return STATE.agentColorMap;
}
function getFlagSettingsPath() {
    return STATE.flagSettingsPath;
}
function setFlagSettingsPath(path) {
    STATE.flagSettingsPath = path;
}
function getFlagSettingsInline() {
    return STATE.flagSettingsInline;
}
function setFlagSettingsInline(settings) {
    STATE.flagSettingsInline = settings;
}
function getSessionIngressToken() {
    return STATE.sessionIngressToken;
}
function setSessionIngressToken(token) {
    STATE.sessionIngressToken = token;
}
function getOauthTokenFromFd() {
    return STATE.oauthTokenFromFd;
}
function setOauthTokenFromFd(token) {
    STATE.oauthTokenFromFd = token;
}
function getApiKeyFromFd() {
    return STATE.apiKeyFromFd;
}
function setApiKeyFromFd(key) {
    STATE.apiKeyFromFd = key;
}
function setLastAPIRequest(params) {
    STATE.lastAPIRequest = params;
}
function getLastAPIRequest() {
    return STATE.lastAPIRequest;
}
function setLastAPIRequestMessages(messages) {
    STATE.lastAPIRequestMessages = messages;
}
function getLastAPIRequestMessages() {
    return STATE.lastAPIRequestMessages;
}
function setLastClassifierRequests(requests) {
    STATE.lastClassifierRequests = requests;
}
function getLastClassifierRequests() {
    return STATE.lastClassifierRequests;
}
function setCachedClaudeMdContent(content) {
    STATE.cachedClaudeMdContent = content;
}
function getCachedClaudeMdContent() {
    return STATE.cachedClaudeMdContent;
}
function addToInMemoryErrorLog(errorInfo) {
    var MAX_IN_MEMORY_ERRORS = 100;
    if (STATE.inMemoryErrorLog.length >= MAX_IN_MEMORY_ERRORS) {
        STATE.inMemoryErrorLog.shift(); // Remove oldest error
    }
    STATE.inMemoryErrorLog.push(errorInfo);
}
function getAllowedSettingSources() {
    return STATE.allowedSettingSources;
}
function setAllowedSettingSources(sources) {
    STATE.allowedSettingSources = sources;
}
function preferThirdPartyAuthentication() {
    // IDE extension should behave as 1P for authentication reasons.
    return getIsNonInteractiveSession() && STATE.clientType !== 'claude-vscode';
}
function setInlinePlugins(plugins) {
    STATE.inlinePlugins = plugins;
}
function getInlinePlugins() {
    return STATE.inlinePlugins;
}
function setChromeFlagOverride(value) {
    STATE.chromeFlagOverride = value;
}
function getChromeFlagOverride() {
    return STATE.chromeFlagOverride;
}
function setUseCoworkPlugins(value) {
    STATE.useCoworkPlugins = value;
    (0, settingsCache_js_1.resetSettingsCache)();
}
function getUseCoworkPlugins() {
    return STATE.useCoworkPlugins;
}
function setSessionBypassPermissionsMode(enabled) {
    STATE.sessionBypassPermissionsMode = enabled;
}
function getSessionBypassPermissionsMode() {
    return STATE.sessionBypassPermissionsMode;
}
function setScheduledTasksEnabled(enabled) {
    STATE.scheduledTasksEnabled = enabled;
}
function getScheduledTasksEnabled() {
    return STATE.scheduledTasksEnabled;
}
function getSessionCronTasks() {
    return STATE.sessionCronTasks;
}
function addSessionCronTask(task) {
    STATE.sessionCronTasks.push(task);
}
/**
 * Returns the number of tasks actually removed. Callers use this to skip
 * downstream work (e.g. the disk read in removeCronTasks) when all ids
 * were accounted for here.
 */
function removeSessionCronTasks(ids) {
    if (ids.length === 0)
        return 0;
    var idSet = new Set(ids);
    var remaining = STATE.sessionCronTasks.filter(function (t) { return !idSet.has(t.id); });
    var removed = STATE.sessionCronTasks.length - remaining.length;
    if (removed === 0)
        return 0;
    STATE.sessionCronTasks = remaining;
    return removed;
}
function setSessionTrustAccepted(accepted) {
    STATE.sessionTrustAccepted = accepted;
}
function getSessionTrustAccepted() {
    return STATE.sessionTrustAccepted;
}
function setSessionPersistenceDisabled(disabled) {
    STATE.sessionPersistenceDisabled = disabled;
}
function isSessionPersistenceDisabled() {
    return STATE.sessionPersistenceDisabled;
}
function hasExitedPlanModeInSession() {
    return STATE.hasExitedPlanMode;
}
function setHasExitedPlanMode(value) {
    STATE.hasExitedPlanMode = value;
}
function needsPlanModeExitAttachment() {
    return STATE.needsPlanModeExitAttachment;
}
function setNeedsPlanModeExitAttachment(value) {
    STATE.needsPlanModeExitAttachment = value;
}
function handlePlanModeTransition(fromMode, toMode) {
    // If switching TO plan mode, clear any pending exit attachment
    // This prevents sending both plan_mode and plan_mode_exit when user toggles quickly
    if (toMode === 'plan' && fromMode !== 'plan') {
        STATE.needsPlanModeExitAttachment = false;
    }
    // If switching out of plan mode, trigger the plan_mode_exit attachment
    if (fromMode === 'plan' && toMode !== 'plan') {
        STATE.needsPlanModeExitAttachment = true;
    }
}
function needsAutoModeExitAttachment() {
    return STATE.needsAutoModeExitAttachment;
}
function setNeedsAutoModeExitAttachment(value) {
    STATE.needsAutoModeExitAttachment = value;
}
function handleAutoModeTransition(fromMode, toMode) {
    // Auto↔plan transitions are handled by prepareContextForPlanMode (auto may
    // stay active through plan if opted in) and ExitPlanMode (restores mode).
    // Skip both directions so this function only handles direct auto transitions.
    if ((fromMode === 'auto' && toMode === 'plan') ||
        (fromMode === 'plan' && toMode === 'auto')) {
        return;
    }
    var fromIsAuto = fromMode === 'auto';
    var toIsAuto = toMode === 'auto';
    // If switching TO auto mode, clear any pending exit attachment
    // This prevents sending both auto_mode and auto_mode_exit when user toggles quickly
    if (toIsAuto && !fromIsAuto) {
        STATE.needsAutoModeExitAttachment = false;
    }
    // If switching out of auto mode, trigger the auto_mode_exit attachment
    if (fromIsAuto && !toIsAuto) {
        STATE.needsAutoModeExitAttachment = true;
    }
}
// LSP plugin recommendation session tracking
function hasShownLspRecommendationThisSession() {
    return STATE.lspRecommendationShownThisSession;
}
function setLspRecommendationShownThisSession(value) {
    STATE.lspRecommendationShownThisSession = value;
}
// SDK init event state
function setInitJsonSchema(schema) {
    STATE.initJsonSchema = schema;
}
function getInitJsonSchema() {
    return STATE.initJsonSchema;
}
function registerHookCallbacks(hooks) {
    var _a;
    if (!STATE.registeredHooks) {
        STATE.registeredHooks = {};
    }
    // `registerHookCallbacks` may be called multiple times, so we need to merge (not overwrite)
    for (var _i = 0, _b = Object.entries(hooks); _i < _b.length; _i++) {
        var _c = _b[_i], event_1 = _c[0], matchers = _c[1];
        var eventKey = event_1;
        if (!STATE.registeredHooks[eventKey]) {
            STATE.registeredHooks[eventKey] = [];
        }
        (_a = STATE.registeredHooks[eventKey]).push.apply(_a, matchers);
    }
}
function getRegisteredHooks() {
    return STATE.registeredHooks;
}
function clearRegisteredHooks() {
    STATE.registeredHooks = null;
}
function clearRegisteredPluginHooks() {
    if (!STATE.registeredHooks) {
        return;
    }
    var filtered = {};
    for (var _i = 0, _a = Object.entries(STATE.registeredHooks); _i < _a.length; _i++) {
        var _b = _a[_i], event_2 = _b[0], matchers = _b[1];
        // Keep only callback hooks (those without pluginRoot)
        var callbackHooks = matchers.filter(function (m) { return !('pluginRoot' in m); });
        if (callbackHooks.length > 0) {
            filtered[event_2] = callbackHooks;
        }
    }
    STATE.registeredHooks = Object.keys(filtered).length > 0 ? filtered : null;
}
function resetSdkInitState() {
    STATE.initJsonSchema = null;
    STATE.registeredHooks = null;
}
function getPlanSlugCache() {
    return STATE.planSlugCache;
}
function getSessionCreatedTeams() {
    return STATE.sessionCreatedTeams;
}
// Teleported session tracking for reliability logging
function setTeleportedSessionInfo(info) {
    STATE.teleportedSessionInfo = {
        isTeleported: true,
        hasLoggedFirstMessage: false,
        sessionId: info.sessionId,
    };
}
function getTeleportedSessionInfo() {
    return STATE.teleportedSessionInfo;
}
function markFirstTeleportMessageLogged() {
    if (STATE.teleportedSessionInfo) {
        STATE.teleportedSessionInfo.hasLoggedFirstMessage = true;
    }
}
function addInvokedSkill(skillName, skillPath, content, agentId) {
    if (agentId === void 0) { agentId = null; }
    var key = "".concat(agentId !== null && agentId !== void 0 ? agentId : '', ":").concat(skillName);
    STATE.invokedSkills.set(key, {
        skillName: skillName,
        skillPath: skillPath,
        content: content,
        invokedAt: Date.now(),
        agentId: agentId,
    });
}
function getInvokedSkills() {
    return STATE.invokedSkills;
}
function getInvokedSkillsForAgent(agentId) {
    var normalizedId = agentId !== null && agentId !== void 0 ? agentId : null;
    var filtered = new Map();
    for (var _i = 0, _a = STATE.invokedSkills; _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], skill = _b[1];
        if (skill.agentId === normalizedId) {
            filtered.set(key, skill);
        }
    }
    return filtered;
}
function clearInvokedSkills(preservedAgentIds) {
    if (!preservedAgentIds || preservedAgentIds.size === 0) {
        STATE.invokedSkills.clear();
        return;
    }
    for (var _i = 0, _a = STATE.invokedSkills; _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], skill = _b[1];
        if (skill.agentId === null || !preservedAgentIds.has(skill.agentId)) {
            STATE.invokedSkills.delete(key);
        }
    }
}
function clearInvokedSkillsForAgent(agentId) {
    for (var _i = 0, _a = STATE.invokedSkills; _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], skill = _b[1];
        if (skill.agentId === agentId) {
            STATE.invokedSkills.delete(key);
        }
    }
}
// Slow operations tracking for dev bar
var MAX_SLOW_OPERATIONS = 10;
var SLOW_OPERATION_TTL_MS = 10000;
function addSlowOperation(operation, durationMs) {
    if (process.env.USER_TYPE !== 'ant')
        return;
    // Skip tracking for editor sessions (user editing a prompt file in $EDITOR)
    // These are intentionally slow since the user is drafting text
    if (operation.includes('exec') && operation.includes('claude-prompt-')) {
        return;
    }
    var now = Date.now();
    // Remove stale operations
    STATE.slowOperations = STATE.slowOperations.filter(function (op) { return now - op.timestamp < SLOW_OPERATION_TTL_MS; });
    // Add new operation
    STATE.slowOperations.push({ operation: operation, durationMs: durationMs, timestamp: now });
    // Keep only the most recent operations
    if (STATE.slowOperations.length > MAX_SLOW_OPERATIONS) {
        STATE.slowOperations = STATE.slowOperations.slice(-MAX_SLOW_OPERATIONS);
    }
}
var EMPTY_SLOW_OPERATIONS = [];
function getSlowOperations() {
    // Most common case: nothing tracked. Return a stable reference so the
    // caller's setState() can bail via Object.is instead of re-rendering at 2fps.
    if (STATE.slowOperations.length === 0) {
        return EMPTY_SLOW_OPERATIONS;
    }
    var now = Date.now();
    // Only allocate a new array when something actually expired; otherwise keep
    // the reference stable across polls while ops are still fresh.
    if (STATE.slowOperations.some(function (op) { return now - op.timestamp >= SLOW_OPERATION_TTL_MS; })) {
        STATE.slowOperations = STATE.slowOperations.filter(function (op) { return now - op.timestamp < SLOW_OPERATION_TTL_MS; });
        if (STATE.slowOperations.length === 0) {
            return EMPTY_SLOW_OPERATIONS;
        }
    }
    // Safe to return directly: addSlowOperation() reassigns STATE.slowOperations
    // before pushing, so the array held in React state is never mutated.
    return STATE.slowOperations;
}
function getMainThreadAgentType() {
    return STATE.mainThreadAgentType;
}
function setMainThreadAgentType(agentType) {
    STATE.mainThreadAgentType = agentType;
}
function getIsRemoteMode() {
    return STATE.isRemoteMode;
}
function setIsRemoteMode(value) {
    STATE.isRemoteMode = value;
}
// System prompt section accessors
function getSystemPromptSectionCache() {
    return STATE.systemPromptSectionCache;
}
function setSystemPromptSectionCacheEntry(name, value) {
    STATE.systemPromptSectionCache.set(name, value);
}
function clearSystemPromptSectionState() {
    STATE.systemPromptSectionCache.clear();
}
// Last emitted date accessors (for detecting midnight date changes)
function getLastEmittedDate() {
    return STATE.lastEmittedDate;
}
function setLastEmittedDate(date) {
    STATE.lastEmittedDate = date;
}
function getAdditionalDirectoriesForClaudeMd() {
    return STATE.additionalDirectoriesForClaudeMd;
}
function setAdditionalDirectoriesForClaudeMd(directories) {
    STATE.additionalDirectoriesForClaudeMd = directories;
}
function getAllowedChannels() {
    return STATE.allowedChannels;
}
function setAllowedChannels(entries) {
    STATE.allowedChannels = entries;
}
function getHasDevChannels() {
    return STATE.hasDevChannels;
}
function setHasDevChannels(value) {
    STATE.hasDevChannels = value;
}
function getPromptCache1hAllowlist() {
    return STATE.promptCache1hAllowlist;
}
function setPromptCache1hAllowlist(allowlist) {
    STATE.promptCache1hAllowlist = allowlist;
}
function getPromptCache1hEligible() {
    return STATE.promptCache1hEligible;
}
function setPromptCache1hEligible(eligible) {
    STATE.promptCache1hEligible = eligible;
}
function getAfkModeHeaderLatched() {
    return STATE.afkModeHeaderLatched;
}
function setAfkModeHeaderLatched(v) {
    STATE.afkModeHeaderLatched = v;
}
function getFastModeHeaderLatched() {
    return STATE.fastModeHeaderLatched;
}
function setFastModeHeaderLatched(v) {
    STATE.fastModeHeaderLatched = v;
}
function getCacheEditingHeaderLatched() {
    return STATE.cacheEditingHeaderLatched;
}
function setCacheEditingHeaderLatched(v) {
    STATE.cacheEditingHeaderLatched = v;
}
function getThinkingClearLatched() {
    return STATE.thinkingClearLatched;
}
function setThinkingClearLatched(v) {
    STATE.thinkingClearLatched = v;
}
/**
 * Reset beta header latches to null. Called on /clear and /compact so a
 * fresh conversation gets fresh header evaluation.
 */
function clearBetaHeaderLatches() {
    STATE.afkModeHeaderLatched = null;
    STATE.fastModeHeaderLatched = null;
    STATE.cacheEditingHeaderLatched = null;
    STATE.thinkingClearLatched = null;
}
function getPromptId() {
    return STATE.promptId;
}
function setPromptId(id) {
    STATE.promptId = id;
}
