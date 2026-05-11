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
exports.clearConversation = clearConversation;
/**
 * Conversation clearing utility.
 * This module has heavier dependencies and should be lazy-loaded when possible.
 */
var bun_bundle_1 = require("bun:bundle");
var crypto_1 = require("crypto");
var state_js_1 = require("../../bootstrap/state.js");
var index_js_1 = require("../../services/analytics/index.js");
var types_js_1 = require("../../tasks/InProcessTeammateTask/types.js");
var LocalAgentTask_js_1 = require("../../tasks/LocalAgentTask/LocalAgentTask.js");
var guards_js_1 = require("../../tasks/LocalShellTask/guards.js");
var ids_js_1 = require("../../types/ids.js");
var commitAttribution_js_1 = require("../../utils/commitAttribution.js");
var hooks_js_1 = require("../../utils/hooks.js");
var log_js_1 = require("../../utils/log.js");
var plans_js_1 = require("../../utils/plans.js");
var Shell_js_1 = require("../../utils/Shell.js");
var sessionStart_js_1 = require("../../utils/sessionStart.js");
var sessionStorage_js_1 = require("../../utils/sessionStorage.js");
var diskOutput_js_1 = require("../../utils/task/diskOutput.js");
var worktree_js_1 = require("../../utils/worktree.js");
var caches_js_1 = require("./caches.js");
function clearConversation(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var sessionEndTimeoutMs, lastRequestId, preservedAgentIds, preservedLocalAgents, shouldKillTask, _i, _c, task, setContextBlocked, _d, preservedLocalAgents_1, task, saveMode, isCoordinatorMode, worktreeSession, hookMessages;
        var setMessages = _b.setMessages, readFileState = _b.readFileState, discoveredSkillNames = _b.discoveredSkillNames, loadedNestedMemoryPaths = _b.loadedNestedMemoryPaths, getAppState = _b.getAppState, setAppState = _b.setAppState, setConversationId = _b.setConversationId;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    sessionEndTimeoutMs = (0, hooks_js_1.getSessionEndHookTimeoutMs)();
                    return [4 /*yield*/, (0, hooks_js_1.executeSessionEndHooks)('clear', {
                            getAppState: getAppState,
                            setAppState: setAppState,
                            signal: AbortSignal.timeout(sessionEndTimeoutMs),
                            timeoutMs: sessionEndTimeoutMs,
                        })
                        // Signal to inference that this conversation's cache can be evicted.
                    ];
                case 1:
                    _e.sent();
                    lastRequestId = (0, state_js_1.getLastMainRequestId)();
                    if (lastRequestId) {
                        (0, index_js_1.logEvent)('tengu_cache_eviction_hint', {
                            scope: 'conversation_clear',
                            last_request_id: lastRequestId,
                        });
                    }
                    preservedAgentIds = new Set();
                    preservedLocalAgents = [];
                    shouldKillTask = function (task) {
                        return 'isBackgrounded' in task && task.isBackgrounded === false;
                    };
                    if (getAppState) {
                        for (_i = 0, _c = Object.values(getAppState().tasks); _i < _c.length; _i++) {
                            task = _c[_i];
                            if (shouldKillTask(task))
                                continue;
                            if ((0, LocalAgentTask_js_1.isLocalAgentTask)(task)) {
                                preservedAgentIds.add(task.agentId);
                                preservedLocalAgents.push(task);
                            }
                            else if ((0, types_js_1.isInProcessTeammateTask)(task)) {
                                preservedAgentIds.add(task.identity.agentId);
                            }
                        }
                    }
                    setMessages(function () { return []; });
                    // Clear context-blocked flag so proactive ticks resume after /clear
                    if ((0, bun_bundle_1.feature)('PROACTIVE') || (0, bun_bundle_1.feature)('KAIROS')) {
                        setContextBlocked = require('../../proactive/index.js').setContextBlocked;
                        /* eslint-enable @typescript-eslint/no-require-imports */
                        setContextBlocked(false);
                    }
                    // Force logo re-render by updating conversationId
                    if (setConversationId) {
                        setConversationId((0, crypto_1.randomUUID)());
                    }
                    // Clear all session-related caches. Per-agent state for preserved background
                    // tasks (invoked skills, pending permission callbacks, dump state, cache-break
                    // tracking) is retained so those agents keep functioning.
                    (0, caches_js_1.clearSessionCaches)(preservedAgentIds);
                    (0, Shell_js_1.setCwd)((0, state_js_1.getOriginalCwd)());
                    readFileState.clear();
                    discoveredSkillNames === null || discoveredSkillNames === void 0 ? void 0 : discoveredSkillNames.clear();
                    loadedNestedMemoryPaths === null || loadedNestedMemoryPaths === void 0 ? void 0 : loadedNestedMemoryPaths.clear();
                    // Clean out necessary items from App State
                    if (setAppState) {
                        setAppState(function (prev) {
                            var _a, _b, _c, _d;
                            // Partition tasks using the same predicate computed above:
                            // kill+remove foreground tasks, preserve everything else.
                            var nextTasks = {};
                            for (var _i = 0, _e = Object.entries(prev.tasks); _i < _e.length; _i++) {
                                var _f = _e[_i], taskId = _f[0], task = _f[1];
                                if (!shouldKillTask(task)) {
                                    nextTasks[taskId] = task;
                                    continue;
                                }
                                // Foreground task: kill it and drop from state
                                try {
                                    if (task.status === 'running') {
                                        if ((0, guards_js_1.isLocalShellTask)(task)) {
                                            (_a = task.shellCommand) === null || _a === void 0 ? void 0 : _a.kill();
                                            (_b = task.shellCommand) === null || _b === void 0 ? void 0 : _b.cleanup();
                                            if (task.cleanupTimeoutId) {
                                                clearTimeout(task.cleanupTimeoutId);
                                            }
                                        }
                                        if ('abortController' in task) {
                                            (_c = task.abortController) === null || _c === void 0 ? void 0 : _c.abort();
                                        }
                                        if ('unregisterCleanup' in task) {
                                            (_d = task.unregisterCleanup) === null || _d === void 0 ? void 0 : _d.call(task);
                                        }
                                    }
                                }
                                catch (error) {
                                    (0, log_js_1.logError)(error);
                                }
                                void (0, diskOutput_js_1.evictTaskOutput)(taskId);
                            }
                            return __assign(__assign({}, prev), { tasks: nextTasks, attribution: (0, commitAttribution_js_1.createEmptyAttributionState)(), 
                                // Clear standalone agent context (name/color set by /rename, /color)
                                // so the new session doesn't display the old session's identity badge
                                standaloneAgentContext: undefined, fileHistory: {
                                    snapshots: [],
                                    trackedFiles: new Set(),
                                    snapshotSequence: 0,
                                }, 
                                // Reset MCP state to default to trigger re-initialization.
                                // Preserve pluginReconnectKey so /clear doesn't cause a no-op
                                // (it's only bumped by /reload-plugins).
                                mcp: {
                                    clients: [],
                                    tools: [],
                                    commands: [],
                                    resources: {},
                                    pluginReconnectKey: prev.mcp.pluginReconnectKey,
                                } });
                        });
                    }
                    // Clear plan slug cache so a new plan file is used after /clear
                    (0, plans_js_1.clearAllPlanSlugs)();
                    // Clear cached session metadata (title, tag, agent name/color)
                    // so the new session doesn't inherit the previous session's identity
                    (0, sessionStorage_js_1.clearSessionMetadata)();
                    // Generate new session ID to provide fresh state
                    // Set the old session as parent for analytics lineage tracking
                    (0, state_js_1.regenerateSessionId)({ setCurrentAsParent: true });
                    // Update the environment variable so subprocesses use the new session ID
                    if (process.env.USER_TYPE === 'ant' && process.env.CLAUDE_CODE_SESSION_ID) {
                        process.env.CLAUDE_CODE_SESSION_ID = (0, state_js_1.getSessionId)();
                    }
                    return [4 /*yield*/, (0, sessionStorage_js_1.resetSessionFilePointer)()
                        // Preserved local_agent tasks had their TaskOutput symlink baked against the
                        // old session ID at spawn time, but post-clear transcript writes land under
                        // the new session directory (appendEntry re-reads getSessionId()). Re-point
                        // the symlinks so TaskOutput reads the live file instead of a frozen pre-clear
                        // snapshot. Only re-point running tasks — finished tasks will never write
                        // again, so re-pointing would replace a valid symlink with a dangling one.
                        // Main-session tasks use the same per-agent path (they write via
                        // recordSidechainTranscript to getAgentTranscriptPath), so no special case.
                    ];
                case 2:
                    _e.sent();
                    // Preserved local_agent tasks had their TaskOutput symlink baked against the
                    // old session ID at spawn time, but post-clear transcript writes land under
                    // the new session directory (appendEntry re-reads getSessionId()). Re-point
                    // the symlinks so TaskOutput reads the live file instead of a frozen pre-clear
                    // snapshot. Only re-point running tasks — finished tasks will never write
                    // again, so re-pointing would replace a valid symlink with a dangling one.
                    // Main-session tasks use the same per-agent path (they write via
                    // recordSidechainTranscript to getAgentTranscriptPath), so no special case.
                    for (_d = 0, preservedLocalAgents_1 = preservedLocalAgents; _d < preservedLocalAgents_1.length; _d++) {
                        task = preservedLocalAgents_1[_d];
                        if (task.status !== 'running')
                            continue;
                        void (0, diskOutput_js_1.initTaskOutputAsSymlink)(task.id, (0, sessionStorage_js_1.getAgentTranscriptPath)((0, ids_js_1.asAgentId)(task.agentId)));
                    }
                    // Re-persist mode and worktree state after the clear so future --resume
                    // knows what the new post-clear session was in. clearSessionMetadata
                    // wiped both from the cache, but the process is still in the same mode
                    // and (if applicable) the same worktree directory.
                    if ((0, bun_bundle_1.feature)('COORDINATOR_MODE')) {
                        saveMode = require('../../utils/sessionStorage.js').saveMode;
                        isCoordinatorMode = require('../../coordinator/coordinatorMode.js').isCoordinatorMode;
                        /* eslint-enable @typescript-eslint/no-require-imports */
                        saveMode(isCoordinatorMode() ? 'coordinator' : 'normal');
                    }
                    worktreeSession = (0, worktree_js_1.getCurrentWorktreeSession)();
                    if (worktreeSession) {
                        (0, sessionStorage_js_1.saveWorktreeState)(worktreeSession);
                    }
                    return [4 /*yield*/, (0, sessionStart_js_1.processSessionStartHooks)('clear')
                        // Update messages with hook results
                    ];
                case 3:
                    hookMessages = _e.sent();
                    // Update messages with hook results
                    if (hookMessages.length > 0) {
                        setMessages(function () { return hookMessages; });
                    }
                    return [2 /*return*/];
            }
        });
    });
}
