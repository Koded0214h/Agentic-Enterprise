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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
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
exports.getProjectDir = exports.MAX_TRANSCRIPT_READ_BYTES = void 0;
exports.isTranscriptMessage = isTranscriptMessage;
exports.isChainParticipant = isChainParticipant;
exports.isEphemeralToolProgress = isEphemeralToolProgress;
exports.getProjectsDir = getProjectsDir;
exports.getTranscriptPath = getTranscriptPath;
exports.getTranscriptPathForSession = getTranscriptPathForSession;
exports.setAgentTranscriptSubdir = setAgentTranscriptSubdir;
exports.clearAgentTranscriptSubdir = clearAgentTranscriptSubdir;
exports.getAgentTranscriptPath = getAgentTranscriptPath;
exports.writeAgentMetadata = writeAgentMetadata;
exports.readAgentMetadata = readAgentMetadata;
exports.writeRemoteAgentMetadata = writeRemoteAgentMetadata;
exports.readRemoteAgentMetadata = readRemoteAgentMetadata;
exports.deleteRemoteAgentMetadata = deleteRemoteAgentMetadata;
exports.listRemoteAgentMetadata = listRemoteAgentMetadata;
exports.sessionIdExists = sessionIdExists;
exports.getNodeEnv = getNodeEnv;
exports.getUserType = getUserType;
exports.isCustomTitleEnabled = isCustomTitleEnabled;
exports.resetProjectFlushStateForTesting = resetProjectFlushStateForTesting;
exports.resetProjectForTesting = resetProjectForTesting;
exports.setSessionFileForTesting = setSessionFileForTesting;
exports.setInternalEventWriter = setInternalEventWriter;
exports.setInternalEventReader = setInternalEventReader;
exports.setRemoteIngressUrlForTesting = setRemoteIngressUrlForTesting;
exports.recordTranscript = recordTranscript;
exports.recordSidechainTranscript = recordSidechainTranscript;
exports.recordQueueOperation = recordQueueOperation;
exports.removeTranscriptMessage = removeTranscriptMessage;
exports.recordFileHistorySnapshot = recordFileHistorySnapshot;
exports.recordAttributionSnapshot = recordAttributionSnapshot;
exports.recordContentReplacement = recordContentReplacement;
exports.resetSessionFilePointer = resetSessionFilePointer;
exports.adoptResumedSessionFile = adoptResumedSessionFile;
exports.recordContextCollapseCommit = recordContextCollapseCommit;
exports.recordContextCollapseSnapshot = recordContextCollapseSnapshot;
exports.flushSessionStorage = flushSessionStorage;
exports.hydrateRemoteSession = hydrateRemoteSession;
exports.hydrateFromCCRv2InternalEvents = hydrateFromCCRv2InternalEvents;
exports.getFirstMeaningfulUserMessageTextContent = getFirstMeaningfulUserMessageTextContent;
exports.removeExtraFields = removeExtraFields;
exports.buildConversationChain = buildConversationChain;
exports.checkResumeConsistency = checkResumeConsistency;
exports.loadTranscriptFromFile = loadTranscriptFromFile;
exports.fetchLogs = fetchLogs;
exports.saveCustomTitle = saveCustomTitle;
exports.saveAiGeneratedTitle = saveAiGeneratedTitle;
exports.saveTaskSummary = saveTaskSummary;
exports.saveTag = saveTag;
exports.linkSessionToPR = linkSessionToPR;
exports.getCurrentSessionTag = getCurrentSessionTag;
exports.getCurrentSessionTitle = getCurrentSessionTitle;
exports.getCurrentSessionAgentColor = getCurrentSessionAgentColor;
exports.restoreSessionMetadata = restoreSessionMetadata;
exports.clearSessionMetadata = clearSessionMetadata;
exports.reAppendSessionMetadata = reAppendSessionMetadata;
exports.saveAgentName = saveAgentName;
exports.saveAgentColor = saveAgentColor;
exports.saveAgentSetting = saveAgentSetting;
exports.cacheSessionTitle = cacheSessionTitle;
exports.saveMode = saveMode;
exports.saveWorktreeState = saveWorktreeState;
exports.getSessionIdFromLog = getSessionIdFromLog;
exports.isLiteLog = isLiteLog;
exports.loadFullLog = loadFullLog;
exports.searchSessionsByCustomTitle = searchSessionsByCustomTitle;
exports.loadTranscriptFile = loadTranscriptFile;
exports.clearSessionMessagesCache = clearSessionMessagesCache;
exports.doesMessageExistInSession = doesMessageExistInSession;
exports.getLastSessionLog = getLastSessionLog;
exports.loadMessageLogs = loadMessageLogs;
exports.loadAllProjectsMessageLogs = loadAllProjectsMessageLogs;
exports.loadAllProjectsMessageLogsProgressive = loadAllProjectsMessageLogsProgressive;
exports.loadSameRepoMessageLogs = loadSameRepoMessageLogs;
exports.loadSameRepoMessageLogsProgressive = loadSameRepoMessageLogsProgressive;
exports.getAgentTranscript = getAgentTranscript;
exports.extractAgentIdsFromMessages = extractAgentIdsFromMessages;
exports.extractTeammateTranscriptsFromTasks = extractTeammateTranscriptsFromTasks;
exports.loadSubagentTranscripts = loadSubagentTranscripts;
exports.loadAllSubagentTranscriptsFromDisk = loadAllSubagentTranscriptsFromDisk;
exports.isLoggableMessage = isLoggableMessage;
exports.cleanMessagesForLogging = cleanMessagesForLogging;
exports.getLogByIndex = getLogByIndex;
exports.findUnresolvedToolUse = findUnresolvedToolUse;
exports.getSessionFilesWithMtime = getSessionFilesWithMtime;
exports.loadAllLogsFromSessionFile = loadAllLogsFromSessionFile;
exports.getSessionFilesLite = getSessionFilesLite;
exports.enrichLogs = enrichLogs;
var bun_bundle_1 = require("bun:bundle");
// Sync fs primitives for readFileTailSync — separate from fs/promises
// imports above. Named (not wildcard) per CLAUDE.md style; no collisions
// with the async-suffixed names.
var fs_1 = require("fs");
var promises_1 = require("fs/promises");
var memoize_js_1 = require("lodash-es/memoize.js");
var path_1 = require("path");
var index_js_1 = require("src/services/analytics/index.js");
var state_js_1 = require("../bootstrap/state.js");
var commands_js_1 = require("../commands.js");
var xml_js_1 = require("../constants/xml.js");
var growthbook_js_1 = require("../services/analytics/growthbook.js");
var sessionIngress = require("../services/api/sessionIngress.js");
var constants_js_1 = require("../tools/REPLTool/constants.js");
var ids_js_1 = require("../types/ids.js");
var logs_js_1 = require("../types/logs.js");
var array_js_1 = require("./array.js");
var cleanupRegistry_js_1 = require("./cleanupRegistry.js");
var concurrentSessions_js_1 = require("./concurrentSessions.js");
var cwd_js_1 = require("./cwd.js");
var debug_js_1 = require("./debug.js");
var diagLogs_js_1 = require("./diagLogs.js");
var envUtils_js_1 = require("./envUtils.js");
var errors_js_1 = require("./errors.js");
var format_js_1 = require("./format.js");
var fsOperations_js_1 = require("./fsOperations.js");
var getWorktreePaths_js_1 = require("./getWorktreePaths.js");
var git_js_1 = require("./git.js");
var gracefulShutdown_js_1 = require("./gracefulShutdown.js");
var json_js_1 = require("./json.js");
var log_js_1 = require("./log.js");
var messages_js_1 = require("./messages.js");
var path_js_1 = require("./path.js");
var sessionStoragePortable_js_1 = require("./sessionStoragePortable.js");
var settings_js_1 = require("./settings/settings.js");
var slowOperations_js_1 = require("./slowOperations.js");
var uuid_js_1 = require("./uuid.js");
// Cache MACRO.VERSION at module level to work around bun --define bug in async contexts
// See: https://github.com/oven-sh/bun/issues/26168
var VERSION = typeof MACRO !== 'undefined' ? MACRO.VERSION : 'unknown';
// Use getOriginalCwd() at each call site instead of capturing at module load
// time. getCwd() at import time may run before bootstrap resolves symlinks via
// realpathSync, causing a different sanitized project directory than what
// getOriginalCwd() returns after bootstrap. This split-brain made sessions
// saved under one path invisible when loaded via the other.
/**
 * Pre-compiled regex to skip non-meaningful messages when extracting first prompt.
 * Matches anything starting with a lowercase XML-like tag (IDE context, hook
 * output, task notifications, channel messages, etc.) or a synthetic interrupt
 * marker. Kept in sync with sessionStoragePortable.ts — generic pattern avoids
 * an ever-growing allowlist that falls behind as new notification types ship.
 */
// 50MB — prevents OOM in the tombstone slow path which reads + rewrites the
// entire session file. Session files can grow to multiple GB (inc-3930).
var MAX_TOMBSTONE_REWRITE_BYTES = 50 * 1024 * 1024;
var SKIP_FIRST_PROMPT_PATTERN = /^(?:\s*<[a-z][\w-]*[\s>]|\[Request interrupted by user[^\]]*\])/;
/**
 * Type guard to check if an entry is a transcript message.
 * Transcript messages include user, assistant, attachment, and system messages.
 * IMPORTANT: This is the single source of truth for what constitutes a transcript message.
 * loadTranscriptFile() uses this to determine which messages to load into the chain.
 *
 * Progress messages are NOT transcript messages. They are ephemeral UI state
 * and must not be persisted to the JSONL or participate in the parentUuid
 * chain. Including them caused chain forks that orphaned real conversation
 * messages on resume (see #14373, #23537).
 */
function isTranscriptMessage(entry) {
    return (entry.type === 'user' ||
        entry.type === 'assistant' ||
        entry.type === 'attachment' ||
        entry.type === 'system');
}
/**
 * Entries that participate in the parentUuid chain. Used on the write path
 * (insertMessageChain, useLogMessages) to skip progress when assigning
 * parentUuid. Old transcripts with progress already in the chain are handled
 * by the progressBridge rewrite in loadTranscriptFile.
 */
function isChainParticipant(m) {
    return m.type !== 'progress';
}
/**
 * Progress entries in transcripts written before PR #24099. They are not
 * in the Entry type union anymore but still exist on disk with uuid and
 * parentUuid fields. loadTranscriptFile bridges the chain across them.
 */
function isLegacyProgressEntry(entry) {
    return (typeof entry === 'object' &&
        entry !== null &&
        'type' in entry &&
        entry.type === 'progress' &&
        'uuid' in entry &&
        typeof entry.uuid === 'string');
}
/**
 * High-frequency tool progress ticks (1/sec for Sleep, per-chunk for Bash).
 * These are UI-only: not sent to the API, not rendered after the tool
 * completes. Used by REPL.tsx to replace-in-place instead of appending, and
 * by loadTranscriptFile to skip legacy entries from old transcripts.
 */
var EPHEMERAL_PROGRESS_TYPES = new Set(__spreadArray([
    'bash_progress',
    'powershell_progress',
    'mcp_progress'
], ((0, bun_bundle_1.feature)('PROACTIVE') || (0, bun_bundle_1.feature)('KAIROS')
    ? ['sleep_progress']
    : []), true));
function isEphemeralToolProgress(dataType) {
    return typeof dataType === 'string' && EPHEMERAL_PROGRESS_TYPES.has(dataType);
}
function getProjectsDir() {
    return (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), 'projects');
}
function getTranscriptPath() {
    var _a;
    var projectDir = (_a = (0, state_js_1.getSessionProjectDir)()) !== null && _a !== void 0 ? _a : (0, exports.getProjectDir)((0, state_js_1.getOriginalCwd)());
    return (0, path_1.join)(projectDir, "".concat((0, state_js_1.getSessionId)(), ".jsonl"));
}
function getTranscriptPathForSession(sessionId) {
    // When asking for the CURRENT session's transcript, honor sessionProjectDir
    // the same way getTranscriptPath() does. Without this, hooks get a
    // transcript_path computed from originalCwd while the actual file was
    // written to sessionProjectDir (set by switchActiveSession on resume/branch)
    // — different directories, so the hook sees MISSING (gh-30217). CC-34
    // made sessionId + sessionProjectDir atomic precisely to prevent this
    // kind of drift; this function just wasn't updated to read both.
    //
    // For OTHER session IDs we can only guess via originalCwd — we don't
    // track a sessionId→projectDir map. Callers wanting a specific other
    // session's path should pass fullPath explicitly (most save* functions
    // already accept this).
    if (sessionId === (0, state_js_1.getSessionId)()) {
        return getTranscriptPath();
    }
    var projectDir = (0, exports.getProjectDir)((0, state_js_1.getOriginalCwd)());
    return (0, path_1.join)(projectDir, "".concat(sessionId, ".jsonl"));
}
// 50 MB — session JSONL can grow to multiple GB (inc-3930). Callers that
// read the raw transcript must bail out above this threshold to avoid OOM.
exports.MAX_TRANSCRIPT_READ_BYTES = 50 * 1024 * 1024;
// In-memory map of agentId → subdirectory for grouping related subagent
// transcripts (e.g. workflow runs write to subagents/workflows/<runId>/).
// Populated before the agent runs; consulted by getAgentTranscriptPath.
var agentTranscriptSubdirs = new Map();
function setAgentTranscriptSubdir(agentId, subdir) {
    agentTranscriptSubdirs.set(agentId, subdir);
}
function clearAgentTranscriptSubdir(agentId) {
    agentTranscriptSubdirs.delete(agentId);
}
function getAgentTranscriptPath(agentId) {
    var _a;
    // Same sessionProjectDir consistency as getTranscriptPathForSession —
    // subagent transcripts live under the session dir, so if the session
    // transcript is at sessionProjectDir, subagent transcripts are too.
    var projectDir = (_a = (0, state_js_1.getSessionProjectDir)()) !== null && _a !== void 0 ? _a : (0, exports.getProjectDir)((0, state_js_1.getOriginalCwd)());
    var sessionId = (0, state_js_1.getSessionId)();
    var subdir = agentTranscriptSubdirs.get(agentId);
    var base = subdir
        ? (0, path_1.join)(projectDir, sessionId, 'subagents', subdir)
        : (0, path_1.join)(projectDir, sessionId, 'subagents');
    return (0, path_1.join)(base, "agent-".concat(agentId, ".jsonl"));
}
function getAgentMetadataPath(agentId) {
    return getAgentTranscriptPath(agentId).replace(/\.jsonl$/, '.meta.json');
}
/**
 * Persist the agentType used to launch a subagent. Read by resume to
 * route correctly when subagent_type is omitted — without this, resuming
 * a fork silently degrades to general-purpose (4KB system prompt, no
 * inherited history). Sidecar file avoids JSONL schema changes.
 *
 * Also stores the worktreePath when the agent was spawned with worktree
 * isolation, enabling resume to restore the correct cwd.
 */
function writeAgentMetadata(agentId, metadata) {
    return __awaiter(this, void 0, void 0, function () {
        var path;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    path = getAgentMetadataPath(agentId);
                    return [4 /*yield*/, (0, promises_1.mkdir)((0, path_1.dirname)(path), { recursive: true })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, promises_1.writeFile)(path, JSON.stringify(metadata))];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function readAgentMetadata(agentId) {
    return __awaiter(this, void 0, void 0, function () {
        var path, raw, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    path = getAgentMetadataPath(agentId);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readFile)(path, 'utf-8')];
                case 2:
                    raw = _a.sent();
                    return [2 /*return*/, JSON.parse(raw)];
                case 3:
                    e_1 = _a.sent();
                    if ((0, errors_js_1.isFsInaccessible)(e_1))
                        return [2 /*return*/, null];
                    throw e_1;
                case 4: return [2 /*return*/];
            }
        });
    });
}
function getRemoteAgentsDir() {
    var _a;
    // Same sessionProjectDir fallback as getAgentTranscriptPath — the project
    // dir (containing the .jsonl), not the session dir, so sessionId is joined.
    var projectDir = (_a = (0, state_js_1.getSessionProjectDir)()) !== null && _a !== void 0 ? _a : (0, exports.getProjectDir)((0, state_js_1.getOriginalCwd)());
    return (0, path_1.join)(projectDir, (0, state_js_1.getSessionId)(), 'remote-agents');
}
function getRemoteAgentMetadataPath(taskId) {
    return (0, path_1.join)(getRemoteAgentsDir(), "remote-agent-".concat(taskId, ".meta.json"));
}
/**
 * Persist metadata for a remote-agent task so it can be restored on session
 * resume. Per-task sidecar file (sibling dir to subagents/) survives
 * hydrateSessionFromRemote's .jsonl wipe; status is always fetched fresh
 * from CCR on restore — only identity is persisted locally.
 */
function writeRemoteAgentMetadata(taskId, metadata) {
    return __awaiter(this, void 0, void 0, function () {
        var path;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    path = getRemoteAgentMetadataPath(taskId);
                    return [4 /*yield*/, (0, promises_1.mkdir)((0, path_1.dirname)(path), { recursive: true })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, promises_1.writeFile)(path, JSON.stringify(metadata))];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function readRemoteAgentMetadata(taskId) {
    return __awaiter(this, void 0, void 0, function () {
        var path, raw, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    path = getRemoteAgentMetadataPath(taskId);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readFile)(path, 'utf-8')];
                case 2:
                    raw = _a.sent();
                    return [2 /*return*/, JSON.parse(raw)];
                case 3:
                    e_2 = _a.sent();
                    if ((0, errors_js_1.isFsInaccessible)(e_2))
                        return [2 /*return*/, null];
                    throw e_2;
                case 4: return [2 /*return*/];
            }
        });
    });
}
function deleteRemoteAgentMetadata(taskId) {
    return __awaiter(this, void 0, void 0, function () {
        var path, e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    path = getRemoteAgentMetadataPath(taskId);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.unlink)(path)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_3 = _a.sent();
                    if ((0, errors_js_1.isFsInaccessible)(e_3))
                        return [2 /*return*/];
                    throw e_3;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Scan the remote-agents/ directory for all persisted metadata files.
 * Used by restoreRemoteAgentTasks to reconnect to still-running CCR sessions.
 */
function listRemoteAgentMetadata() {
    return __awaiter(this, void 0, void 0, function () {
        var dir, entries, e_4, results, _i, entries_1, entry, raw, e_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dir = getRemoteAgentsDir();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readdir)(dir, { withFileTypes: true })];
                case 2:
                    entries = _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_4 = _a.sent();
                    if ((0, errors_js_1.isFsInaccessible)(e_4))
                        return [2 /*return*/, []];
                    throw e_4;
                case 4:
                    results = [];
                    _i = 0, entries_1 = entries;
                    _a.label = 5;
                case 5:
                    if (!(_i < entries_1.length)) return [3 /*break*/, 10];
                    entry = entries_1[_i];
                    if (!entry.isFile() || !entry.name.endsWith('.meta.json'))
                        return [3 /*break*/, 9];
                    _a.label = 6;
                case 6:
                    _a.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, (0, promises_1.readFile)((0, path_1.join)(dir, entry.name), 'utf-8')];
                case 7:
                    raw = _a.sent();
                    results.push(JSON.parse(raw));
                    return [3 /*break*/, 9];
                case 8:
                    e_5 = _a.sent();
                    // Skip unreadable or corrupt files — a partial write from a crashed
                    // fire-and-forget persist shouldn't take down the whole restore.
                    (0, debug_js_1.logForDebugging)("listRemoteAgentMetadata: skipping ".concat(entry.name, ": ").concat(String(e_5)));
                    return [3 /*break*/, 9];
                case 9:
                    _i++;
                    return [3 /*break*/, 5];
                case 10: return [2 /*return*/, results];
            }
        });
    });
}
function sessionIdExists(sessionId) {
    var projectDir = (0, exports.getProjectDir)((0, state_js_1.getOriginalCwd)());
    var sessionFile = (0, path_1.join)(projectDir, "".concat(sessionId, ".jsonl"));
    var fs = (0, fsOperations_js_1.getFsImplementation)();
    try {
        fs.statSync(sessionFile);
        return true;
    }
    catch (_a) {
        return false;
    }
}
// exported for testing
function getNodeEnv() {
    return process.env.NODE_ENV || 'development';
}
// exported for testing
function getUserType() {
    return process.env.USER_TYPE || 'external';
}
function getEntrypoint() {
    return process.env.CLAUDE_CODE_ENTRYPOINT;
}
function isCustomTitleEnabled() {
    return true;
}
// Memoized: called 12+ times per turn via hooks.ts createBaseHookInput
// (PostToolUse path, 5×/turn) + various save* functions. Input is a cwd
// string; homedir/env/regex are all session-invariant so the result is
// stable for a given input. Worktree switches just change the key — no
// cache clear needed.
exports.getProjectDir = (0, memoize_js_1.default)(function (projectDir) {
    return (0, path_1.join)(getProjectsDir(), (0, path_js_1.sanitizePath)(projectDir));
});
var project = null;
var cleanupRegistered = false;
function getProject() {
    var _this = this;
    if (!project) {
        project = new Project();
        // Register flush as a cleanup handler (only once)
        if (!cleanupRegistered) {
            (0, cleanupRegistry_js_1.registerCleanup)(function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: 
                        // Flush queued writes first, then re-append session metadata
                        // (customTitle, tag) so they always appear in the last 64KB tail
                        // window. readLiteMetadata only reads the tail to extract these
                        // fields — if enough messages are appended after a /rename, the
                        // custom-title entry gets pushed outside the window and --resume
                        // shows the auto-generated firstPrompt instead.
                        return [4 /*yield*/, (project === null || project === void 0 ? void 0 : project.flush())];
                        case 1:
                            // Flush queued writes first, then re-append session metadata
                            // (customTitle, tag) so they always appear in the last 64KB tail
                            // window. readLiteMetadata only reads the tail to extract these
                            // fields — if enough messages are appended after a /rename, the
                            // custom-title entry gets pushed outside the window and --resume
                            // shows the auto-generated firstPrompt instead.
                            _a.sent();
                            try {
                                project === null || project === void 0 ? void 0 : project.reAppendSessionMetadata();
                            }
                            catch (_b) {
                                // Best-effort — don't let metadata re-append crash the cleanup
                            }
                            return [2 /*return*/];
                    }
                });
            }); });
            cleanupRegistered = true;
        }
    }
    return project;
}
/**
 * Reset the Project singleton's flush state for testing.
 * This ensures tests don't interfere with each other via shared counter state.
 */
function resetProjectFlushStateForTesting() {
    project === null || project === void 0 ? void 0 : project._resetFlushState();
}
/**
 * Reset the entire Project singleton for testing.
 * This ensures tests with different CLAUDE_CONFIG_DIR values
 * don't share stale sessionFile paths.
 */
function resetProjectForTesting() {
    project = null;
}
function setSessionFileForTesting(path) {
    getProject().sessionFile = path;
}
/**
 * Register a CCR v2 internal event writer for transcript persistence.
 * When set, transcript messages are written as internal worker events
 * instead of going through v1 Session Ingress.
 */
function setInternalEventWriter(writer) {
    getProject().setInternalEventWriter(writer);
}
/**
 * Register a CCR v2 internal event reader for session resume.
 * When set, hydrateFromCCRv2InternalEvents() can fetch foreground and
 * subagent internal events to reconstruct conversation state on reconnection.
 */
function setInternalEventReader(reader, subagentReader) {
    getProject().setInternalEventReader(reader);
    getProject().setInternalSubagentEventReader(subagentReader);
}
/**
 * Set the remote ingress URL on the current Project for testing.
 * This simulates what hydrateRemoteSession does in production.
 */
function setRemoteIngressUrlForTesting(url) {
    getProject().setRemoteIngressUrl(url);
}
var REMOTE_FLUSH_INTERVAL_MS = 10;
var Project = /** @class */ (function () {
    function Project() {
        this.sessionFile = null;
        // Entries buffered while sessionFile is null. Flushed by materializeSessionFile
        // on the first user/assistant message — prevents metadata-only session files.
        this.pendingEntries = [];
        this.remoteIngressUrl = null;
        this.internalEventWriter = null;
        this.internalEventReader = null;
        this.internalSubagentEventReader = null;
        this.pendingWriteCount = 0;
        this.flushResolvers = [];
        // Per-file write queues. Each entry carries a resolve callback so
        // callers of enqueueWrite can optionally await their specific write.
        this.writeQueues = new Map();
        this.flushTimer = null;
        this.activeDrain = null;
        this.FLUSH_INTERVAL_MS = 100;
        this.MAX_CHUNK_BYTES = 100 * 1024 * 1024;
        /**
         * Returns the session file path if it exists, null otherwise.
         * Used for writing to sessions other than the current one.
         * Caches positive results so we only stat once per session.
         */
        this.existingSessionFiles = new Map();
    }
    /** @internal Reset flush/queue state for testing. */
    Project.prototype._resetFlushState = function () {
        this.pendingWriteCount = 0;
        this.flushResolvers = [];
        if (this.flushTimer)
            clearTimeout(this.flushTimer);
        this.flushTimer = null;
        this.activeDrain = null;
        this.writeQueues = new Map();
    };
    Project.prototype.incrementPendingWrites = function () {
        this.pendingWriteCount++;
    };
    Project.prototype.decrementPendingWrites = function () {
        this.pendingWriteCount--;
        if (this.pendingWriteCount === 0) {
            // Resolve all waiting flush promises
            for (var _i = 0, _a = this.flushResolvers; _i < _a.length; _i++) {
                var resolve = _a[_i];
                resolve();
            }
            this.flushResolvers = [];
        }
    };
    Project.prototype.trackWrite = function (fn) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.incrementPendingWrites();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 4]);
                        return [4 /*yield*/, fn()];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        this.decrementPendingWrites();
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Project.prototype.enqueueWrite = function (filePath, entry) {
        var _this = this;
        return new Promise(function (resolve) {
            var queue = _this.writeQueues.get(filePath);
            if (!queue) {
                queue = [];
                _this.writeQueues.set(filePath, queue);
            }
            queue.push({ entry: entry, resolve: resolve });
            _this.scheduleDrain();
        });
    };
    Project.prototype.scheduleDrain = function () {
        var _this = this;
        if (this.flushTimer) {
            return;
        }
        this.flushTimer = setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.flushTimer = null;
                        this.activeDrain = this.drainWriteQueue();
                        return [4 /*yield*/, this.activeDrain];
                    case 1:
                        _a.sent();
                        this.activeDrain = null;
                        // If more items arrived during drain, schedule again
                        if (this.writeQueues.size > 0) {
                            this.scheduleDrain();
                        }
                        return [2 /*return*/];
                }
            });
        }); }, this.FLUSH_INTERVAL_MS);
    };
    Project.prototype.appendToFile = function (filePath, data) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 5]);
                        return [4 /*yield*/, (0, promises_1.appendFile)(filePath, data, { mode: 384 })];
                    case 1:
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 2:
                        _a = _b.sent();
                        // Directory may not exist — some NFS-like filesystems return
                        // unexpected error codes, so don't discriminate on code.
                        return [4 /*yield*/, (0, promises_1.mkdir)((0, path_1.dirname)(filePath), { recursive: true, mode: 448 })];
                    case 3:
                        // Directory may not exist — some NFS-like filesystems return
                        // unexpected error codes, so don't discriminate on code.
                        _b.sent();
                        return [4 /*yield*/, (0, promises_1.appendFile)(filePath, data, { mode: 384 })];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Project.prototype.drainWriteQueue = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, _b, filePath, queue, batch, content, resolvers, _c, batch_1, _d, entry, resolve, line, _e, resolvers_1, r, _f, resolvers_2, r, _g, _h, _j, filePath, queue;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        _i = 0, _a = this.writeQueues;
                        _k.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 9];
                        _b = _a[_i], filePath = _b[0], queue = _b[1];
                        if (queue.length === 0) {
                            return [3 /*break*/, 8];
                        }
                        batch = queue.splice(0);
                        content = '';
                        resolvers = [];
                        _c = 0, batch_1 = batch;
                        _k.label = 2;
                    case 2:
                        if (!(_c < batch_1.length)) return [3 /*break*/, 6];
                        _d = batch_1[_c], entry = _d.entry, resolve = _d.resolve;
                        line = (0, slowOperations_js_1.jsonStringify)(entry) + '\n';
                        if (!(content.length + line.length >= this.MAX_CHUNK_BYTES)) return [3 /*break*/, 4];
                        // Flush chunk and resolve its entries before starting a new one
                        return [4 /*yield*/, this.appendToFile(filePath, content)];
                    case 3:
                        // Flush chunk and resolve its entries before starting a new one
                        _k.sent();
                        for (_e = 0, resolvers_1 = resolvers; _e < resolvers_1.length; _e++) {
                            r = resolvers_1[_e];
                            r();
                        }
                        resolvers.length = 0;
                        content = '';
                        _k.label = 4;
                    case 4:
                        content += line;
                        resolvers.push(resolve);
                        _k.label = 5;
                    case 5:
                        _c++;
                        return [3 /*break*/, 2];
                    case 6:
                        if (!(content.length > 0)) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.appendToFile(filePath, content)];
                    case 7:
                        _k.sent();
                        for (_f = 0, resolvers_2 = resolvers; _f < resolvers_2.length; _f++) {
                            r = resolvers_2[_f];
                            r();
                        }
                        _k.label = 8;
                    case 8:
                        _i++;
                        return [3 /*break*/, 1];
                    case 9:
                        // Clean up empty queues
                        for (_g = 0, _h = this.writeQueues; _g < _h.length; _g++) {
                            _j = _h[_g], filePath = _j[0], queue = _j[1];
                            if (queue.length === 0) {
                                this.writeQueues.delete(filePath);
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Project.prototype.resetSessionFile = function () {
        this.sessionFile = null;
        this.pendingEntries = [];
    };
    /**
     * Re-append cached session metadata to the end of the transcript file.
     * This ensures metadata stays within the tail window that readLiteMetadata
     * reads during progressive loading.
     *
     * Called from two contexts with different file-ordering implications:
     * - During compaction (compact.ts, reactiveCompact.ts): writes metadata
     *   just before the boundary marker is emitted - these entries end up
     *   before the boundary and are recovered by scanPreBoundaryMetadata.
     * - On session exit (cleanup handler): writes metadata at EOF after all
     *   boundaries - this is what enables loadTranscriptFile's pre-compact
     *   skip to find metadata without a forward scan.
     *
     * External-writer safety for SDK-mutable fields (custom-title, tag):
     * before re-appending, refresh the cache from the tail scan window. If an
     * external process (SDK renameSession/tagSession) wrote a fresher value,
     * our stale cache absorbs it and the re-append below persists it — not
     * the stale CLI value. If no entry is in the tail (evicted, or never
     * written by the SDK), the cache is the only source of truth and is
     * re-appended as-is.
     *
     * Re-append is unconditional (even when the value is already in the
     * tail): during compaction, a title 40KB from EOF is inside the current
     * tail window but will fall out once the post-compaction session grows.
     * Skipping the re-append would defeat the purpose of this call. Fields
     * the SDK cannot touch (last-prompt, agent-*, mode, pr-link) have no
     * external-writer concern — their caches are authoritative.
     */
    Project.prototype.reAppendSessionMetadata = function (skipTitleRefresh) {
        if (skipTitleRefresh === void 0) { skipTitleRefresh = false; }
        if (!this.sessionFile)
            return;
        var sessionId = (0, state_js_1.getSessionId)();
        if (!sessionId)
            return;
        // One sync tail read to refresh SDK-mutable fields. Same
        // LITE_READ_BUF_SIZE window readLiteMetadata uses. Empty string on
        // failure → extract returns null → cache is the only source of truth.
        var tail = readFileTailSync(this.sessionFile);
        // Absorb any fresher SDK-written title/tag into our cache. If the SDK
        // wrote while we had the session open, our cache is stale — the tail
        // value is authoritative. If the tail has nothing (evicted or never
        // written externally), the cache stands.
        //
        // Filter with startsWith to match only top-level JSONL entries (col 0)
        // and not "type":"tag" appearing inside a nested tool_use input that
        // happens to be JSON-serialized into a message.
        var tailLines = tail.split('\n');
        if (!skipTitleRefresh) {
            var titleLine = tailLines.findLast(function (l) {
                return l.startsWith('{"type":"custom-title"');
            });
            if (titleLine) {
                var tailTitle = (0, sessionStoragePortable_js_1.extractLastJsonStringField)(titleLine, 'customTitle');
                // `!== undefined` distinguishes no-match from empty-string match.
                // renameSession rejects empty titles, but the CLI is defensive: an
                // external writer with customTitle:"" should clear the cache so the
                // re-append below skips it (instead of resurrecting a stale title).
                if (tailTitle !== undefined) {
                    this.currentSessionTitle = tailTitle || undefined;
                }
            }
        }
        var tagLine = tailLines.findLast(function (l) { return l.startsWith('{"type":"tag"'); });
        if (tagLine) {
            var tailTag = (0, sessionStoragePortable_js_1.extractLastJsonStringField)(tagLine, 'tag');
            // Same: tagSession(id, null) writes `tag:""` to clear.
            if (tailTag !== undefined) {
                this.currentSessionTag = tailTag || undefined;
            }
        }
        // lastPrompt is re-appended so readLiteMetadata can show what the
        // user was most recently doing. Written first so customTitle/tag/etc
        // land closer to EOF (they're the more critical fields for tail reads).
        if (this.currentSessionLastPrompt) {
            appendEntryToFile(this.sessionFile, {
                type: 'last-prompt',
                lastPrompt: this.currentSessionLastPrompt,
                sessionId: sessionId,
            });
        }
        // Unconditional: cache was refreshed from tail above; re-append keeps
        // the entry at EOF so compaction-pushed content doesn't evict it.
        if (this.currentSessionTitle) {
            appendEntryToFile(this.sessionFile, {
                type: 'custom-title',
                customTitle: this.currentSessionTitle,
                sessionId: sessionId,
            });
        }
        if (this.currentSessionTag) {
            appendEntryToFile(this.sessionFile, {
                type: 'tag',
                tag: this.currentSessionTag,
                sessionId: sessionId,
            });
        }
        if (this.currentSessionAgentName) {
            appendEntryToFile(this.sessionFile, {
                type: 'agent-name',
                agentName: this.currentSessionAgentName,
                sessionId: sessionId,
            });
        }
        if (this.currentSessionAgentColor) {
            appendEntryToFile(this.sessionFile, {
                type: 'agent-color',
                agentColor: this.currentSessionAgentColor,
                sessionId: sessionId,
            });
        }
        if (this.currentSessionAgentSetting) {
            appendEntryToFile(this.sessionFile, {
                type: 'agent-setting',
                agentSetting: this.currentSessionAgentSetting,
                sessionId: sessionId,
            });
        }
        if (this.currentSessionMode) {
            appendEntryToFile(this.sessionFile, {
                type: 'mode',
                mode: this.currentSessionMode,
                sessionId: sessionId,
            });
        }
        if (this.currentSessionWorktree !== undefined) {
            appendEntryToFile(this.sessionFile, {
                type: 'worktree-state',
                worktreeSession: this.currentSessionWorktree,
                sessionId: sessionId,
            });
        }
        if (this.currentSessionPrNumber !== undefined &&
            this.currentSessionPrUrl &&
            this.currentSessionPrRepository) {
            appendEntryToFile(this.sessionFile, {
                type: 'pr-link',
                sessionId: sessionId,
                prNumber: this.currentSessionPrNumber,
                prUrl: this.currentSessionPrUrl,
                prRepository: this.currentSessionPrRepository,
                timestamp: new Date().toISOString(),
            });
        }
    };
    Project.prototype.flush = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Cancel pending timer
                        if (this.flushTimer) {
                            clearTimeout(this.flushTimer);
                            this.flushTimer = null;
                        }
                        if (!this.activeDrain) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.activeDrain];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: 
                    // Drain anything remaining in the queues
                    return [4 /*yield*/, this.drainWriteQueue()
                        // Wait for non-queue tracked operations (e.g. removeMessageByUuid)
                    ];
                    case 3:
                        // Drain anything remaining in the queues
                        _a.sent();
                        // Wait for non-queue tracked operations (e.g. removeMessageByUuid)
                        if (this.pendingWriteCount === 0) {
                            return [2 /*return*/];
                        }
                        return [2 /*return*/, new Promise(function (resolve) {
                                _this.flushResolvers.push(resolve);
                            })];
                }
            });
        });
    };
    /**
     * Remove a message from the transcript by UUID.
     * Used for tombstoning orphaned messages from failed streaming attempts.
     *
     * The target is almost always the most recently appended entry, so we
     * read only the tail, locate the line, and splice it out with a
     * positional write + truncate instead of rewriting the whole file.
     */
    Project.prototype.removeMessageByUuid = function (targetUuid) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.trackWrite(function () { return __awaiter(_this, void 0, void 0, function () {
                        var fileSize, fh, size, chunkLen, tailStart, buf, bytesRead, tail, needle, matchIdx, prevNl, lineStart, nextNl, lineEnd, absLineStart, afterLen, content, lines, _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    if (this.sessionFile === null)
                                        return [2 /*return*/];
                                    _b.label = 1;
                                case 1:
                                    _b.trys.push([1, 15, , 16]);
                                    fileSize = 0;
                                    return [4 /*yield*/, (0, promises_1.open)(this.sessionFile, 'r+')];
                                case 2:
                                    fh = _b.sent();
                                    _b.label = 3;
                                case 3:
                                    _b.trys.push([3, , 10, 12]);
                                    return [4 /*yield*/, fh.stat()];
                                case 4:
                                    size = (_b.sent()).size;
                                    fileSize = size;
                                    if (size === 0)
                                        return [2 /*return*/];
                                    chunkLen = Math.min(size, sessionStoragePortable_js_1.LITE_READ_BUF_SIZE);
                                    tailStart = size - chunkLen;
                                    buf = Buffer.allocUnsafe(chunkLen);
                                    return [4 /*yield*/, fh.read(buf, 0, chunkLen, tailStart)];
                                case 5:
                                    bytesRead = (_b.sent()).bytesRead;
                                    tail = buf.subarray(0, bytesRead);
                                    needle = "\"uuid\":\"".concat(targetUuid, "\"");
                                    matchIdx = tail.lastIndexOf(needle);
                                    if (!(matchIdx >= 0)) return [3 /*break*/, 9];
                                    prevNl = tail.lastIndexOf(0x0a, matchIdx);
                                    if (!(prevNl >= 0 || tailStart === 0)) return [3 /*break*/, 9];
                                    lineStart = prevNl + 1 // 0 when prevNl === -1
                                    ;
                                    nextNl = tail.indexOf(0x0a, matchIdx + needle.length);
                                    lineEnd = nextNl >= 0 ? nextNl + 1 : bytesRead;
                                    absLineStart = tailStart + lineStart;
                                    afterLen = bytesRead - lineEnd;
                                    // Truncate first, then re-append the trailing lines. In the
                                    // common case (target is the last entry) afterLen is 0 and
                                    // this is a single ftruncate.
                                    return [4 /*yield*/, fh.truncate(absLineStart)];
                                case 6:
                                    // Truncate first, then re-append the trailing lines. In the
                                    // common case (target is the last entry) afterLen is 0 and
                                    // this is a single ftruncate.
                                    _b.sent();
                                    if (!(afterLen > 0)) return [3 /*break*/, 8];
                                    return [4 /*yield*/, fh.write(tail, lineEnd, afterLen, absLineStart)];
                                case 7:
                                    _b.sent();
                                    _b.label = 8;
                                case 8: return [2 /*return*/];
                                case 9: return [3 /*break*/, 12];
                                case 10: return [4 /*yield*/, fh.close()];
                                case 11:
                                    _b.sent();
                                    return [7 /*endfinally*/];
                                case 12:
                                    // Slow path: target was not in the last 64KB. Rare - requires many
                                    // large entries to have landed between the write and the tombstone.
                                    if (fileSize > MAX_TOMBSTONE_REWRITE_BYTES) {
                                        (0, debug_js_1.logForDebugging)("Skipping tombstone removal: session file too large (".concat((0, format_js_1.formatFileSize)(fileSize), ")"), { level: 'warn' });
                                        return [2 /*return*/];
                                    }
                                    return [4 /*yield*/, (0, promises_1.readFile)(this.sessionFile, { encoding: 'utf-8' })];
                                case 13:
                                    content = _b.sent();
                                    lines = content.split('\n').filter(function (line) {
                                        if (!line.trim())
                                            return true;
                                        try {
                                            var entry = (0, slowOperations_js_1.jsonParse)(line);
                                            return entry.uuid !== targetUuid;
                                        }
                                        catch (_a) {
                                            return true; // Keep malformed lines
                                        }
                                    });
                                    return [4 /*yield*/, (0, promises_1.writeFile)(this.sessionFile, lines.join('\n'), {
                                            encoding: 'utf8',
                                        })];
                                case 14:
                                    _b.sent();
                                    return [3 /*break*/, 16];
                                case 15:
                                    _a = _b.sent();
                                    return [3 /*break*/, 16];
                                case 16: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * True when test env / cleanupPeriodDays=0 / --no-session-persistence /
     * CLAUDE_CODE_SKIP_PROMPT_HISTORY should suppress all transcript writes.
     * Shared guard for appendEntry and materializeSessionFile so both skip
     * consistently. The env var is set by tmuxSocket.ts so Tungsten-spawned
     * test sessions don't pollute the user's --resume list.
     */
    Project.prototype.shouldSkipPersistence = function () {
        var _a;
        var allowTestPersistence = (0, envUtils_js_1.isEnvTruthy)(process.env.TEST_ENABLE_SESSION_PERSISTENCE);
        return ((getNodeEnv() === 'test' && !allowTestPersistence) ||
            ((_a = (0, settings_js_1.getSettings_DEPRECATED)()) === null || _a === void 0 ? void 0 : _a.cleanupPeriodDays) === 0 ||
            (0, state_js_1.isSessionPersistenceDisabled)() ||
            (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_SKIP_PROMPT_HISTORY));
    };
    /**
     * Create the session file, write cached startup metadata, and flush
     * buffered entries. Called on the first user/assistant message.
     */
    Project.prototype.materializeSessionFile = function () {
        return __awaiter(this, void 0, void 0, function () {
            var buffered, _i, buffered_1, entry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Guard here too — reAppendSessionMetadata writes via appendEntryToFile
                        // (not appendEntry) so it would bypass the per-entry persistence check
                        // and create a metadata-only file despite --no-session-persistence.
                        if (this.shouldSkipPersistence())
                            return [2 /*return*/];
                        this.ensureCurrentSessionFile();
                        // mode/agentSetting are cache-only pre-materialization; write them now.
                        this.reAppendSessionMetadata();
                        if (!(this.pendingEntries.length > 0)) return [3 /*break*/, 4];
                        buffered = this.pendingEntries;
                        this.pendingEntries = [];
                        _i = 0, buffered_1 = buffered;
                        _a.label = 1;
                    case 1:
                        if (!(_i < buffered_1.length)) return [3 /*break*/, 4];
                        entry = buffered_1[_i];
                        return [4 /*yield*/, this.appendEntry(entry)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Project.prototype.insertMessageChain = function (messages_1) {
        return __awaiter(this, arguments, void 0, function (messages, isSidechain, agentId, startingParentUuid, teamInfo) {
            var _this = this;
            if (isSidechain === void 0) { isSidechain = false; }
            return __generator(this, function (_a) {
                return [2 /*return*/, this.trackWrite(function () { return __awaiter(_this, void 0, void 0, function () {
                        var parentUuid, gitBranch, _a, sessionId, slug, _i, messages_2, message, isCompactBoundary, effectiveParentUuid, transcriptMessage, text, flat;
                        var _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    parentUuid = startingParentUuid !== null && startingParentUuid !== void 0 ? startingParentUuid : null;
                                    if (!(this.sessionFile === null &&
                                        messages.some(function (m) { return m.type === 'user' || m.type === 'assistant'; }))) return [3 /*break*/, 2];
                                    return [4 /*yield*/, this.materializeSessionFile()];
                                case 1:
                                    _c.sent();
                                    _c.label = 2;
                                case 2:
                                    _c.trys.push([2, 4, , 5]);
                                    return [4 /*yield*/, (0, git_js_1.getBranch)()];
                                case 3:
                                    gitBranch = _c.sent();
                                    return [3 /*break*/, 5];
                                case 4:
                                    _a = _c.sent();
                                    // Not in a git repo or git command failed
                                    gitBranch = undefined;
                                    return [3 /*break*/, 5];
                                case 5:
                                    sessionId = (0, state_js_1.getSessionId)();
                                    slug = (0, state_js_1.getPlanSlugCache)().get(sessionId);
                                    _i = 0, messages_2 = messages;
                                    _c.label = 6;
                                case 6:
                                    if (!(_i < messages_2.length)) return [3 /*break*/, 9];
                                    message = messages_2[_i];
                                    isCompactBoundary = (0, messages_js_1.isCompactBoundaryMessage)(message);
                                    effectiveParentUuid = parentUuid;
                                    if (message.type === 'user' &&
                                        'sourceToolAssistantUUID' in message &&
                                        message.sourceToolAssistantUUID) {
                                        effectiveParentUuid = message.sourceToolAssistantUUID;
                                    }
                                    transcriptMessage = __assign(__assign({ parentUuid: isCompactBoundary ? null : effectiveParentUuid, logicalParentUuid: isCompactBoundary ? parentUuid : undefined, isSidechain: isSidechain, teamName: teamInfo === null || teamInfo === void 0 ? void 0 : teamInfo.teamName, agentName: teamInfo === null || teamInfo === void 0 ? void 0 : teamInfo.agentName, promptId: message.type === 'user' ? ((_b = (0, state_js_1.getPromptId)()) !== null && _b !== void 0 ? _b : undefined) : undefined, agentId: agentId }, message), { 
                                        // Session-stamp fields MUST come after the spread. On --fork-session
                                        // and --resume, messages arrive as SerializedMessage (carries source
                                        // sessionId/cwd/etc. because removeExtraFields only strips parentUuid
                                        // and isSidechain). If sessionId isn't re-stamped, FRESH.jsonl ends up
                                        // with messages stamped sessionId=A but content-replacement entries
                                        // stamped sessionId=FRESH (from insertContentReplacement), and
                                        // loadFullLog's sessionId-keyed contentReplacements lookup misses →
                                        // replacement records lost → FROZEN misclassification.
                                        userType: getUserType(), entrypoint: getEntrypoint(), cwd: (0, cwd_js_1.getCwd)(), sessionId: sessionId, version: VERSION, gitBranch: gitBranch, slug: slug });
                                    return [4 /*yield*/, this.appendEntry(transcriptMessage)];
                                case 7:
                                    _c.sent();
                                    if (isChainParticipant(message)) {
                                        parentUuid = message.uuid;
                                    }
                                    _c.label = 8;
                                case 8:
                                    _i++;
                                    return [3 /*break*/, 6];
                                case 9:
                                    // Cache this turn's user prompt for reAppendSessionMetadata —
                                    // the --resume picker shows what the user was last doing.
                                    // Overwritten every turn by design.
                                    if (!isSidechain) {
                                        text = getFirstMeaningfulUserMessageTextContent(messages);
                                        if (text) {
                                            flat = text.replace(/\n/g, ' ').trim();
                                            this.currentSessionLastPrompt =
                                                flat.length > 200 ? flat.slice(0, 200).trim() + '…' : flat;
                                        }
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    Project.prototype.insertFileHistorySnapshot = function (messageId, snapshot, isSnapshotUpdate) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.trackWrite(function () { return __awaiter(_this, void 0, void 0, function () {
                        var fileHistoryMessage;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    fileHistoryMessage = {
                                        type: 'file-history-snapshot',
                                        messageId: messageId,
                                        snapshot: snapshot,
                                        isSnapshotUpdate: isSnapshotUpdate,
                                    };
                                    return [4 /*yield*/, this.appendEntry(fileHistoryMessage)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    Project.prototype.insertQueueOperation = function (queueOp) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.trackWrite(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, this.appendEntry(queueOp)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    Project.prototype.insertAttributionSnapshot = function (snapshot) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.trackWrite(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, this.appendEntry(snapshot)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    Project.prototype.insertContentReplacement = function (replacements, agentId) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.trackWrite(function () { return __awaiter(_this, void 0, void 0, function () {
                        var entry;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    entry = {
                                        type: 'content-replacement',
                                        sessionId: (0, state_js_1.getSessionId)(),
                                        agentId: agentId,
                                        replacements: replacements,
                                    };
                                    return [4 /*yield*/, this.appendEntry(entry)];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    Project.prototype.appendEntry = function (entry_1) {
        return __awaiter(this, arguments, void 0, function (entry, sessionId) {
            var currentSessionId, isCurrentSession, sessionFile, existing, targetFile, messageSet, isAgentSidechain, targetFile, isNewUuid;
            if (sessionId === void 0) { sessionId = (0, state_js_1.getSessionId)(); }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.shouldSkipPersistence()) {
                            return [2 /*return*/];
                        }
                        currentSessionId = (0, state_js_1.getSessionId)();
                        isCurrentSession = sessionId === currentSessionId;
                        if (!isCurrentSession) return [3 /*break*/, 1];
                        // Buffer until materializeSessionFile runs (first user/assistant message).
                        if (this.sessionFile === null) {
                            this.pendingEntries.push(entry);
                            return [2 /*return*/];
                        }
                        sessionFile = this.sessionFile;
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, this.getExistingSessionFile(sessionId)];
                    case 2:
                        existing = _a.sent();
                        if (!existing) {
                            (0, log_js_1.logError)(new Error("appendEntry: session file not found for other session ".concat(sessionId)));
                            return [2 /*return*/];
                        }
                        sessionFile = existing;
                        _a.label = 3;
                    case 3:
                        if (!(entry.type === 'summary')) return [3 /*break*/, 4];
                        // Summaries can always be appended
                        void this.enqueueWrite(sessionFile, entry);
                        return [3 /*break*/, 25];
                    case 4:
                        if (!(entry.type === 'custom-title')) return [3 /*break*/, 5];
                        // Custom titles can always be appended
                        void this.enqueueWrite(sessionFile, entry);
                        return [3 /*break*/, 25];
                    case 5:
                        if (!(entry.type === 'ai-title')) return [3 /*break*/, 6];
                        // AI titles can always be appended
                        void this.enqueueWrite(sessionFile, entry);
                        return [3 /*break*/, 25];
                    case 6:
                        if (!(entry.type === 'last-prompt')) return [3 /*break*/, 7];
                        void this.enqueueWrite(sessionFile, entry);
                        return [3 /*break*/, 25];
                    case 7:
                        if (!(entry.type === 'task-summary')) return [3 /*break*/, 8];
                        void this.enqueueWrite(sessionFile, entry);
                        return [3 /*break*/, 25];
                    case 8:
                        if (!(entry.type === 'tag')) return [3 /*break*/, 9];
                        // Tags can always be appended
                        void this.enqueueWrite(sessionFile, entry);
                        return [3 /*break*/, 25];
                    case 9:
                        if (!(entry.type === 'agent-name')) return [3 /*break*/, 10];
                        // Agent names can always be appended
                        void this.enqueueWrite(sessionFile, entry);
                        return [3 /*break*/, 25];
                    case 10:
                        if (!(entry.type === 'agent-color')) return [3 /*break*/, 11];
                        // Agent colors can always be appended
                        void this.enqueueWrite(sessionFile, entry);
                        return [3 /*break*/, 25];
                    case 11:
                        if (!(entry.type === 'agent-setting')) return [3 /*break*/, 12];
                        // Agent settings can always be appended
                        void this.enqueueWrite(sessionFile, entry);
                        return [3 /*break*/, 25];
                    case 12:
                        if (!(entry.type === 'pr-link')) return [3 /*break*/, 13];
                        // PR links can always be appended
                        void this.enqueueWrite(sessionFile, entry);
                        return [3 /*break*/, 25];
                    case 13:
                        if (!(entry.type === 'file-history-snapshot')) return [3 /*break*/, 14];
                        // File history snapshots can always be appended
                        void this.enqueueWrite(sessionFile, entry);
                        return [3 /*break*/, 25];
                    case 14:
                        if (!(entry.type === 'attribution-snapshot')) return [3 /*break*/, 15];
                        // Attribution snapshots can always be appended
                        void this.enqueueWrite(sessionFile, entry);
                        return [3 /*break*/, 25];
                    case 15:
                        if (!(entry.type === 'speculation-accept')) return [3 /*break*/, 16];
                        // Speculation accept entries can always be appended
                        void this.enqueueWrite(sessionFile, entry);
                        return [3 /*break*/, 25];
                    case 16:
                        if (!(entry.type === 'mode')) return [3 /*break*/, 17];
                        // Mode entries can always be appended
                        void this.enqueueWrite(sessionFile, entry);
                        return [3 /*break*/, 25];
                    case 17:
                        if (!(entry.type === 'worktree-state')) return [3 /*break*/, 18];
                        void this.enqueueWrite(sessionFile, entry);
                        return [3 /*break*/, 25];
                    case 18:
                        if (!(entry.type === 'content-replacement')) return [3 /*break*/, 19];
                        targetFile = entry.agentId
                            ? getAgentTranscriptPath(entry.agentId)
                            : sessionFile;
                        void this.enqueueWrite(targetFile, entry);
                        return [3 /*break*/, 25];
                    case 19:
                        if (!(entry.type === 'marble-origami-commit')) return [3 /*break*/, 20];
                        // Always append. Commit order matters for restore (later commits may
                        // reference earlier commits' summary messages), so these must be
                        // written in the order received and read back sequentially.
                        void this.enqueueWrite(sessionFile, entry);
                        return [3 /*break*/, 25];
                    case 20:
                        if (!(entry.type === 'marble-origami-snapshot')) return [3 /*break*/, 21];
                        // Always append. Last-wins on restore — later entries supersede.
                        void this.enqueueWrite(sessionFile, entry);
                        return [3 /*break*/, 25];
                    case 21: return [4 /*yield*/, getSessionMessages(sessionId)];
                    case 22:
                        messageSet = _a.sent();
                        if (!(entry.type === 'queue-operation')) return [3 /*break*/, 23];
                        // Queue operations are always appended to the session file
                        void this.enqueueWrite(sessionFile, entry);
                        return [3 /*break*/, 25];
                    case 23:
                        isAgentSidechain = entry.isSidechain && entry.agentId !== undefined;
                        targetFile = isAgentSidechain
                            ? getAgentTranscriptPath((0, ids_js_1.asAgentId)(entry.agentId))
                            : sessionFile;
                        isNewUuid = !messageSet.has(entry.uuid);
                        if (!(isAgentSidechain || isNewUuid)) return [3 /*break*/, 25];
                        // Enqueue write — appendToFile handles ENOENT by creating directories
                        void this.enqueueWrite(targetFile, entry);
                        if (!!isAgentSidechain) return [3 /*break*/, 25];
                        // messageSet is main-file-authoritative. Sidechain entries go to a
                        // separate agent file — adding their UUIDs here causes recordTranscript
                        // to skip them on the main thread (line ~1270), so the message is never
                        // written to the main session file. The next main-thread message then
                        // chains its parentUuid to a UUID that only exists in the agent file,
                        // and --resume's buildConversationChain terminates at the dangling ref.
                        // Same constraint for remote (inc-4718 above): sidechain persisting a
                        // UUID the main thread hasn't written yet → 409 when main writes it.
                        messageSet.add(entry.uuid);
                        if (!isTranscriptMessage(entry)) return [3 /*break*/, 25];
                        return [4 /*yield*/, this.persistToRemote(sessionId, entry)];
                    case 24:
                        _a.sent();
                        _a.label = 25;
                    case 25: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Loads the sessionFile variable.
     * Do not need to create session files until they are written to.
     */
    Project.prototype.ensureCurrentSessionFile = function () {
        if (this.sessionFile === null) {
            this.sessionFile = getTranscriptPath();
        }
        return this.sessionFile;
    };
    Project.prototype.getExistingSessionFile = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var cached, targetFile, e_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cached = this.existingSessionFiles.get(sessionId);
                        if (cached)
                            return [2 /*return*/, cached];
                        targetFile = getTranscriptPathForSession(sessionId);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, promises_1.stat)(targetFile)];
                    case 2:
                        _a.sent();
                        this.existingSessionFiles.set(sessionId, targetFile);
                        return [2 /*return*/, targetFile];
                    case 3:
                        e_6 = _a.sent();
                        if ((0, errors_js_1.isFsInaccessible)(e_6))
                            return [2 /*return*/, null];
                        throw e_6;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Project.prototype.persistToRemote = function (sessionId, entry) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, success;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if ((0, gracefulShutdown_js_1.isShuttingDown)()) {
                            return [2 /*return*/];
                        }
                        if (!this.internalEventWriter) return [3 /*break*/, 5];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.internalEventWriter('transcript', entry, __assign(__assign({}, ((0, messages_js_1.isCompactBoundaryMessage)(entry) && { isCompaction: true })), (entry.agentId && { agentId: entry.agentId })))];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        _a = _b.sent();
                        (0, index_js_1.logEvent)('tengu_session_persistence_failed', {});
                        (0, debug_js_1.logForDebugging)('Failed to write transcript as internal event');
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                    case 5:
                        // v1 Session Ingress path
                        if (!(0, envUtils_js_1.isEnvTruthy)(process.env.ENABLE_SESSION_PERSISTENCE) ||
                            !this.remoteIngressUrl) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, sessionIngress.appendSessionLog(sessionId, entry, this.remoteIngressUrl)];
                    case 6:
                        success = _b.sent();
                        if (!success) {
                            (0, index_js_1.logEvent)('tengu_session_persistence_failed', {});
                            (0, gracefulShutdown_js_1.gracefulShutdownSync)(1, 'other');
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    Project.prototype.setRemoteIngressUrl = function (url) {
        this.remoteIngressUrl = url;
        (0, debug_js_1.logForDebugging)("Remote persistence enabled with URL: ".concat(url));
        if (url) {
            // If using CCR, don't delay messages by any more than 10ms.
            this.FLUSH_INTERVAL_MS = REMOTE_FLUSH_INTERVAL_MS;
        }
    };
    Project.prototype.setInternalEventWriter = function (writer) {
        this.internalEventWriter = writer;
        (0, debug_js_1.logForDebugging)('CCR v2 internal event writer registered for transcript persistence');
        // Use fast flush interval for CCR v2
        this.FLUSH_INTERVAL_MS = REMOTE_FLUSH_INTERVAL_MS;
    };
    Project.prototype.setInternalEventReader = function (reader) {
        this.internalEventReader = reader;
        (0, debug_js_1.logForDebugging)('CCR v2 internal event reader registered for session resume');
    };
    Project.prototype.setInternalSubagentEventReader = function (reader) {
        this.internalSubagentEventReader = reader;
        (0, debug_js_1.logForDebugging)('CCR v2 subagent event reader registered for session resume');
    };
    Project.prototype.getInternalEventReader = function () {
        return this.internalEventReader;
    };
    Project.prototype.getInternalSubagentEventReader = function () {
        return this.internalSubagentEventReader;
    };
    return Project;
}());
// Filter out already-recorded messages before passing to insertMessageChain.
// Without this, after compaction messagesToKeep (same UUIDs as pre-compact
// messages) are dedup-skipped by appendEntry but still advance the parentUuid
// cursor in insertMessageChain, causing new messages to chain from pre-compact
// UUIDs instead of the post-compact summary — orphaning the compact boundary.
//
// `startingParentUuidHint`: used by useLogMessages to pass the parent from
// the previous incremental slice, avoiding an O(n) scan to rediscover it.
//
// Skip-tracking: already-recorded messages are tracked as the parent ONLY if
// they form a PREFIX (appear before any new message). This handles both cases:
//  - Growing-array callers (QueryEngine, queryHelpers, LocalMainSessionTask,
//    trajectory): recorded messages are always a prefix → tracked → correct
//    parent chain for new messages.
//  - Compaction (useLogMessages): new CB/summary appear FIRST, then recorded
//    messagesToKeep → not a prefix → not tracked → CB gets parentUuid=null
//    (correct: truncates --continue chain at compact boundary).
function recordTranscript(messages, teamInfo, startingParentUuidHint, allMessages) {
    return __awaiter(this, void 0, void 0, function () {
        var cleanedMessages, sessionId, messageSet, newMessages, startingParentUuid, seenNewMessage, _i, cleanedMessages_1, m, lastRecorded;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    cleanedMessages = cleanMessagesForLogging(messages, allMessages);
                    sessionId = (0, state_js_1.getSessionId)();
                    return [4 /*yield*/, getSessionMessages(sessionId)];
                case 1:
                    messageSet = _c.sent();
                    newMessages = [];
                    startingParentUuid = startingParentUuidHint;
                    seenNewMessage = false;
                    for (_i = 0, cleanedMessages_1 = cleanedMessages; _i < cleanedMessages_1.length; _i++) {
                        m = cleanedMessages_1[_i];
                        if (messageSet.has(m.uuid)) {
                            // Only track skipped messages that form a prefix. After compaction,
                            // messagesToKeep appear AFTER new CB/summary, so this skips them.
                            if (!seenNewMessage && isChainParticipant(m)) {
                                startingParentUuid = m.uuid;
                            }
                        }
                        else {
                            newMessages.push(m);
                            seenNewMessage = true;
                        }
                    }
                    if (!(newMessages.length > 0)) return [3 /*break*/, 3];
                    return [4 /*yield*/, getProject().insertMessageChain(newMessages, false, undefined, startingParentUuid, teamInfo)];
                case 2:
                    _c.sent();
                    _c.label = 3;
                case 3:
                    lastRecorded = newMessages.findLast(isChainParticipant);
                    return [2 /*return*/, (_b = (_a = lastRecorded === null || lastRecorded === void 0 ? void 0 : lastRecorded.uuid) !== null && _a !== void 0 ? _a : startingParentUuid) !== null && _b !== void 0 ? _b : null];
            }
        });
    });
}
function recordSidechainTranscript(messages, agentId, startingParentUuid) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getProject().insertMessageChain(cleanMessagesForLogging(messages), true, agentId, startingParentUuid)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function recordQueueOperation(queueOp) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getProject().insertQueueOperation(queueOp)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Remove a message from the transcript by UUID.
 * Used when a tombstone is received for an orphaned message.
 */
function removeTranscriptMessage(targetUuid) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getProject().removeMessageByUuid(targetUuid)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function recordFileHistorySnapshot(messageId, snapshot, isSnapshotUpdate) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getProject().insertFileHistorySnapshot(messageId, snapshot, isSnapshotUpdate)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function recordAttributionSnapshot(snapshot) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getProject().insertAttributionSnapshot(snapshot)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function recordContentReplacement(replacements, agentId) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getProject().insertContentReplacement(replacements, agentId)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Reset the session file pointer after switchSession/regenerateSessionId.
 * The new file is created lazily on the first user/assistant message.
 */
function resetSessionFilePointer() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            getProject().resetSessionFile();
            return [2 /*return*/];
        });
    });
}
/**
 * Adopt the existing session file after --continue/--resume (non-fork).
 * Call after switchSession + resetSessionFilePointer + restoreSessionMetadata:
 * getTranscriptPath() now derives the resumed file's path from the switched
 * sessionId, and the cache holds the final metadata (--name title, resumed
 * mode/tag/agent).
 *
 * Setting sessionFile here — instead of waiting for materializeSessionFile
 * on the first user message — lets the exit cleanup handler's
 * reAppendSessionMetadata run (it bails when sessionFile is null). Without
 * this, `-c -n foo` + quit-before-message drops the title on the floor:
 * the in-memory cache is correct but never written. The resumed file
 * already exists on disk (we loaded from it), so this can't create an
 * orphan the way a fresh --name session would.
 *
 * skipTitleRefresh: restoreSessionMetadata populated the cache from the
 * same disk read microseconds ago, so refreshing from the tail here is a
 * no-op — unless --name was used, in which case it would clobber the fresh
 * CLI title with the stale disk value. After this write, disk == cache and
 * later calls (compaction, exit cleanup) absorb SDK writes normally.
 */
function adoptResumedSessionFile() {
    var project = getProject();
    project.sessionFile = getTranscriptPath();
    project.reAppendSessionMetadata(true);
}
/**
 * Append a context-collapse commit entry to the transcript. One entry per
 * commit, in commit order. On resume these are collected into an ordered
 * array and handed to restoreFromEntries() which rebuilds the commit log.
 */
function recordContextCollapseCommit(commit) {
    return __awaiter(this, void 0, void 0, function () {
        var sessionId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    sessionId = (0, state_js_1.getSessionId)();
                    if (!sessionId)
                        return [2 /*return*/];
                    return [4 /*yield*/, getProject().appendEntry(__assign({ type: 'marble-origami-commit', sessionId: sessionId }, commit))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Snapshot the staged queue + spawn state. Written after each ctx-agent
 * spawn resolves (when staged contents may have changed). Last-wins on
 * restore — the loader keeps only the most recent snapshot entry.
 */
function recordContextCollapseSnapshot(snapshot) {
    return __awaiter(this, void 0, void 0, function () {
        var sessionId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    sessionId = (0, state_js_1.getSessionId)();
                    if (!sessionId)
                        return [2 /*return*/];
                    return [4 /*yield*/, getProject().appendEntry(__assign({ type: 'marble-origami-snapshot', sessionId: sessionId }, snapshot))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function flushSessionStorage() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getProject().flush()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function hydrateRemoteSession(sessionId, ingressUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var project, remoteLogs, projectDir, sessionFile, content, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, state_js_1.switchSession)((0, ids_js_1.asSessionId)(sessionId));
                    project = getProject();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 7]);
                    return [4 /*yield*/, sessionIngress.getSessionLogs(sessionId, ingressUrl)];
                case 2:
                    remoteLogs = (_a.sent()) || [];
                    projectDir = (0, exports.getProjectDir)((0, state_js_1.getOriginalCwd)());
                    return [4 /*yield*/, (0, promises_1.mkdir)(projectDir, { recursive: true, mode: 448 })];
                case 3:
                    _a.sent();
                    sessionFile = getTranscriptPathForSession(sessionId);
                    content = remoteLogs.map(function (e) { return (0, slowOperations_js_1.jsonStringify)(e) + '\n'; }).join('');
                    return [4 /*yield*/, (0, promises_1.writeFile)(sessionFile, content, { encoding: 'utf8', mode: 384 })];
                case 4:
                    _a.sent();
                    (0, debug_js_1.logForDebugging)("Hydrated ".concat(remoteLogs.length, " entries from remote"));
                    return [2 /*return*/, remoteLogs.length > 0];
                case 5:
                    error_1 = _a.sent();
                    (0, debug_js_1.logForDebugging)("Error hydrating session from remote: ".concat(error_1));
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'hydrate_remote_session_fail');
                    return [2 /*return*/, false];
                case 6:
                    // Set remote ingress URL after hydrating the remote session
                    // to ensure we've always synced with the remote session
                    // prior to enabling persistence
                    project.setRemoteIngressUrl(ingressUrl);
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    });
}
/**
 * Hydrate session state from CCR v2 internal events.
 * Fetches foreground and subagent events via the registered readers,
 * extracts transcript entries from payloads, and writes them to the
 * local transcript files (main + per-agent).
 * The server handles compaction filtering — it returns events starting
 * from the latest compaction boundary.
 */
function hydrateFromCCRv2InternalEvents(sessionId) {
    return __awaiter(this, void 0, void 0, function () {
        var startMs, project, reader, events, projectDir, sessionFile, fgContent, subagentEventCount, subagentReader, subagentEvents, byAgent, _i, subagentEvents_1, e, agentId, list, _a, byAgent_1, _b, agentId, entries, agentFile, agentContent, error_2;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    startMs = Date.now();
                    (0, state_js_1.switchSession)((0, ids_js_1.asSessionId)(sessionId));
                    project = getProject();
                    reader = project.getInternalEventReader();
                    if (!reader) {
                        (0, debug_js_1.logForDebugging)('No internal event reader registered for CCR v2 resume');
                        return [2 /*return*/, false];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 12, , 13]);
                    return [4 /*yield*/, reader()];
                case 2:
                    events = _c.sent();
                    if (!events) {
                        (0, debug_js_1.logForDebugging)('Failed to read internal events for resume');
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'hydrate_ccr_v2_read_fail');
                        return [2 /*return*/, false];
                    }
                    projectDir = (0, exports.getProjectDir)((0, state_js_1.getOriginalCwd)());
                    return [4 /*yield*/, (0, promises_1.mkdir)(projectDir, { recursive: true, mode: 448 })
                        // Write foreground transcript
                    ];
                case 3:
                    _c.sent();
                    sessionFile = getTranscriptPathForSession(sessionId);
                    fgContent = events.map(function (e) { return (0, slowOperations_js_1.jsonStringify)(e.payload) + '\n'; }).join('');
                    return [4 /*yield*/, (0, promises_1.writeFile)(sessionFile, fgContent, { encoding: 'utf8', mode: 384 })];
                case 4:
                    _c.sent();
                    (0, debug_js_1.logForDebugging)("Hydrated ".concat(events.length, " foreground entries from CCR v2 internal events"));
                    subagentEventCount = 0;
                    subagentReader = project.getInternalSubagentEventReader();
                    if (!subagentReader) return [3 /*break*/, 11];
                    return [4 /*yield*/, subagentReader()];
                case 5:
                    subagentEvents = _c.sent();
                    if (!(subagentEvents && subagentEvents.length > 0)) return [3 /*break*/, 11];
                    subagentEventCount = subagentEvents.length;
                    byAgent = new Map();
                    for (_i = 0, subagentEvents_1 = subagentEvents; _i < subagentEvents_1.length; _i++) {
                        e = subagentEvents_1[_i];
                        agentId = e.agent_id || '';
                        if (!agentId)
                            continue;
                        list = byAgent.get(agentId);
                        if (!list) {
                            list = [];
                            byAgent.set(agentId, list);
                        }
                        list.push(e.payload);
                    }
                    _a = 0, byAgent_1 = byAgent;
                    _c.label = 6;
                case 6:
                    if (!(_a < byAgent_1.length)) return [3 /*break*/, 10];
                    _b = byAgent_1[_a], agentId = _b[0], entries = _b[1];
                    agentFile = getAgentTranscriptPath((0, ids_js_1.asAgentId)(agentId));
                    return [4 /*yield*/, (0, promises_1.mkdir)((0, path_1.dirname)(agentFile), { recursive: true, mode: 448 })];
                case 7:
                    _c.sent();
                    agentContent = entries
                        .map(function (p) { return (0, slowOperations_js_1.jsonStringify)(p) + '\n'; })
                        .join('');
                    return [4 /*yield*/, (0, promises_1.writeFile)(agentFile, agentContent, {
                            encoding: 'utf8',
                            mode: 384,
                        })];
                case 8:
                    _c.sent();
                    _c.label = 9;
                case 9:
                    _a++;
                    return [3 /*break*/, 6];
                case 10:
                    (0, debug_js_1.logForDebugging)("Hydrated ".concat(subagentEvents.length, " subagent entries across ").concat(byAgent.size, " agents"));
                    _c.label = 11;
                case 11:
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'hydrate_ccr_v2_completed', {
                        duration_ms: Date.now() - startMs,
                        event_count: events.length,
                        subagent_event_count: subagentEventCount,
                    });
                    return [2 /*return*/, events.length > 0];
                case 12:
                    error_2 = _c.sent();
                    // Re-throw epoch mismatch so the worker doesn't race against gracefulShutdown
                    if (error_2 instanceof Error &&
                        error_2.message === 'CCRClient: Epoch mismatch (409)') {
                        throw error_2;
                    }
                    (0, debug_js_1.logForDebugging)("Error hydrating session from CCR v2: ".concat(error_2));
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'hydrate_ccr_v2_fail');
                    return [2 /*return*/, false];
                case 13: return [2 /*return*/];
            }
        });
    });
}
function extractFirstPrompt(transcript) {
    var textContent = getFirstMeaningfulUserMessageTextContent(transcript);
    if (textContent) {
        var result = textContent.replace(/\n/g, ' ').trim();
        // Store a reasonably long version for display-time truncation
        // The actual truncation will be applied at display time based on terminal width
        if (result.length > 200) {
            result = result.slice(0, 200).trim() + '…';
        }
        return result;
    }
    return 'No prompt';
}
/**
 * Gets the last user message that was processed (i.e., before any non-user message appears).
 * Used to determine if a session has valid user interaction.
 */
function getFirstMeaningfulUserMessageTextContent(transcript) {
    var _a, _b;
    for (var _i = 0, transcript_1 = transcript; _i < transcript_1.length; _i++) {
        var msg = transcript_1[_i];
        if (msg.type !== 'user' || msg.isMeta)
            continue;
        // Skip compact summary messages - they should not be treated as the first prompt
        if ('isCompactSummary' in msg && msg.isCompactSummary)
            continue;
        var content = (_a = msg.message) === null || _a === void 0 ? void 0 : _a.content;
        if (!content)
            continue;
        // Collect all text values. For array content (common in VS Code where
        // IDE metadata tags come before the user's actual prompt), iterate all
        // text blocks so we don't miss the real prompt hidden behind
        // <ide_selection>/<ide_opened_file> blocks.
        var texts = [];
        if (typeof content === 'string') {
            texts.push(content);
        }
        else if (Array.isArray(content)) {
            for (var _c = 0, content_1 = content; _c < content_1.length; _c++) {
                var block = content_1[_c];
                if (block.type === 'text' && block.text) {
                    texts.push(block.text);
                }
            }
        }
        for (var _d = 0, texts_1 = texts; _d < texts_1.length; _d++) {
            var textContent = texts_1[_d];
            if (!textContent)
                continue;
            var commandNameTag = (0, messages_js_1.extractTag)(textContent, xml_js_1.COMMAND_NAME_TAG);
            if (commandNameTag) {
                var commandName = commandNameTag.replace(/^\//, '');
                // If it's a built-in command, then it's unlikely to provide
                // meaningful context (e.g. `/model sonnet`)
                if ((0, commands_js_1.builtInCommandNames)().has(commandName)) {
                    continue;
                }
                else {
                    // Otherwise, for custom commands, then keep it only if it has
                    // arguments (e.g. `/review reticulate splines`)
                    var commandArgs = (_b = (0, messages_js_1.extractTag)(textContent, 'command-args')) === null || _b === void 0 ? void 0 : _b.trim();
                    if (!commandArgs) {
                        continue;
                    }
                    // Return clean formatted command instead of raw XML
                    return "".concat(commandNameTag, " ").concat(commandArgs);
                }
            }
            // Format bash input with ! prefix (as user typed it). Checked before
            // the generic XML skip so bash-mode sessions get a meaningful title.
            var bashInput = (0, messages_js_1.extractTag)(textContent, 'bash-input');
            if (bashInput) {
                return "! ".concat(bashInput);
            }
            // Skip non-meaningful messages (local command output, hook output,
            // autonomous tick prompts, task notifications, pure IDE metadata tags)
            if (SKIP_FIRST_PROMPT_PATTERN.test(textContent)) {
                continue;
            }
            return textContent;
        }
    }
    return undefined;
}
function removeExtraFields(transcript) {
    return transcript.map(function (m) {
        var isSidechain = m.isSidechain, parentUuid = m.parentUuid, serializedMessage = __rest(m, ["isSidechain", "parentUuid"]);
        return serializedMessage;
    });
}
/**
 * Splice the preserved segment back into the chain after compaction.
 *
 * Preserved messages exist in the JSONL with their ORIGINAL pre-compact
 * parentUuids (recordTranscript dedup-skipped them — can't rewrite).
 * The internal chain (keep[i+1]→keep[i]) is intact; only endpoints need
 * patching: head→anchor, and anchor's other children→tail. Anchor is the
 * last summary for suffix-preserving, boundary itself for prefix-preserving.
 *
 * Only the LAST seg-boundary is relinked — earlier segs were summarized
 * into it. Everything physically before the absolute-last boundary (except
 * preservedUuids) is deleted, which handles all multi-boundary shapes
 * without special-casing.
 *
 * Mutates the Map in place.
 */
function applyPreservedSegmentRelinks(messages) {
    var _a;
    // Find the absolute-last boundary and the last seg-boundary (can differ:
    // manual /compact after reactive compact → seg is stale).
    var lastSeg;
    var lastSegBoundaryIdx = -1;
    var absoluteLastBoundaryIdx = -1;
    var entryIndex = new Map();
    var i = 0;
    for (var _i = 0, _b = messages.values(); _i < _b.length; _i++) {
        var entry = _b[_i];
        entryIndex.set(entry.uuid, i);
        if ((0, messages_js_1.isCompactBoundaryMessage)(entry)) {
            absoluteLastBoundaryIdx = i;
            var seg = (_a = entry.compactMetadata) === null || _a === void 0 ? void 0 : _a.preservedSegment;
            if (seg) {
                lastSeg = seg;
                lastSegBoundaryIdx = i;
            }
        }
        i++;
    }
    // No seg anywhere → no-op. findUnresolvedToolUse etc. read the full map.
    if (!lastSeg)
        return;
    // Seg stale (no-seg boundary came after): skip relink, still prune at
    // absolute — otherwise the stale preserved chain becomes a phantom leaf.
    var segIsLive = lastSegBoundaryIdx === absoluteLastBoundaryIdx;
    // Validate tail→head BEFORE mutating so malformed metadata is a true
    // no-op (walk stops at headUuid, doesn't need the relink to run first).
    var preservedUuids = new Set();
    if (segIsLive) {
        var walkSeen = new Set();
        var cur = messages.get(lastSeg.tailUuid);
        var reachedHead = false;
        while (cur && !walkSeen.has(cur.uuid)) {
            walkSeen.add(cur.uuid);
            preservedUuids.add(cur.uuid);
            if (cur.uuid === lastSeg.headUuid) {
                reachedHead = true;
                break;
            }
            cur = cur.parentUuid ? messages.get(cur.parentUuid) : undefined;
        }
        if (!reachedHead) {
            // tail→head walk broke — a UUID in the preserved segment isn't in the
            // transcript. Returning here skips the prune below, so resume loads
            // the full pre-compact history. Known cause: mid-turn-yielded
            // attachment pushed to mutableMessages but never recordTranscript'd
            // (SDK subprocess restarted before next turn's qe:420 flush).
            (0, index_js_1.logEvent)('tengu_relink_walk_broken', {
                tailInTranscript: messages.has(lastSeg.tailUuid),
                headInTranscript: messages.has(lastSeg.headUuid),
                anchorInTranscript: messages.has(lastSeg.anchorUuid),
                walkSteps: walkSeen.size,
                transcriptSize: messages.size,
            });
            return;
        }
    }
    if (segIsLive) {
        var head = messages.get(lastSeg.headUuid);
        if (head) {
            messages.set(lastSeg.headUuid, __assign(__assign({}, head), { parentUuid: lastSeg.anchorUuid }));
        }
        // Tail-splice: anchor's other children → tail. No-op if already pointing
        // at tail (the useLogMessages race case).
        for (var _c = 0, messages_1 = messages; _c < messages_1.length; _c++) {
            var _d = messages_1[_c], uuid = _d[0], msg = _d[1];
            if (msg.parentUuid === lastSeg.anchorUuid && uuid !== lastSeg.headUuid) {
                messages.set(uuid, __assign(__assign({}, msg), { parentUuid: lastSeg.tailUuid }));
            }
        }
        // Zero stale usage: on-disk input_tokens reflect pre-compact context
        // (~190K) — stripStaleUsage only patched in-memory copies that were
        // dedup-skipped. Without this, resume → immediate autocompact spiral.
        for (var _e = 0, preservedUuids_1 = preservedUuids; _e < preservedUuids_1.length; _e++) {
            var uuid = preservedUuids_1[_e];
            var msg = messages.get(uuid);
            if ((msg === null || msg === void 0 ? void 0 : msg.type) !== 'assistant')
                continue;
            messages.set(uuid, __assign(__assign({}, msg), { message: __assign(__assign({}, msg.message), { usage: __assign(__assign({}, msg.message.usage), { input_tokens: 0, output_tokens: 0, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 }) }) }));
        }
    }
    // Prune everything physically before the absolute-last boundary that
    // isn't preserved. preservedUuids empty when !segIsLive → full prune.
    var toDelete = [];
    for (var _f = 0, messages_3 = messages; _f < messages_3.length; _f++) {
        var uuid = messages_3[_f][0];
        var idx = entryIndex.get(uuid);
        if (idx !== undefined &&
            idx < absoluteLastBoundaryIdx &&
            !preservedUuids.has(uuid)) {
            toDelete.push(uuid);
        }
    }
    for (var _g = 0, toDelete_1 = toDelete; _g < toDelete_1.length; _g++) {
        var uuid = toDelete_1[_g];
        messages.delete(uuid);
    }
}
/**
 * Delete messages that Snip executions removed from the in-memory array,
 * and relink parentUuid across the gaps.
 *
 * Unlike compact_boundary which truncates a prefix, snip removes
 * middle ranges. The JSONL is append-only, so removed messages stay on disk
 * and the surviving messages' parentUuid chains walk through them. Without
 * this filter, buildConversationChain reconstructs the full unsnipped history
 * and resume immediately PTLs (adamr-20260320-165831: 397K displayed → 1.65M
 * actual).
 *
 * Deleting alone is not enough: the surviving message AFTER a removed range
 * has parentUuid pointing INTO the gap. buildConversationChain would hit
 * messages.get(undefined) and stop, orphaning everything before the gap. So
 * after delete we relink: for each survivor with a dangling parentUuid, walk
 * backward through the removed region's own parent links to the first
 * non-removed ancestor.
 *
 * The boundary records removedUuids at execution time so we can replay the
 * exact removal on load. Older boundaries without removedUuids are skipped —
 * resume loads their pre-snip history (the pre-fix behavior).
 *
 * Mutates the Map in place.
 */
function applySnipRemovals(messages) {
    var _a;
    var toDelete = new Set();
    for (var _i = 0, _b = messages.values(); _i < _b.length; _i++) {
        var entry = _b[_i];
        var removedUuids = (_a = entry.snipMetadata) === null || _a === void 0 ? void 0 : _a.removedUuids;
        if (!removedUuids)
            continue;
        for (var _c = 0, removedUuids_1 = removedUuids; _c < removedUuids_1.length; _c++) {
            var uuid = removedUuids_1[_c];
            toDelete.add(uuid);
        }
    }
    if (toDelete.size === 0)
        return;
    // Capture each to-delete entry's own parentUuid BEFORE deleting so we can
    // walk backward through contiguous removed ranges. Entries not in the Map
    // (already absent, e.g. from a prior compact_boundary prune) contribute no
    // link; the relink walk will stop at the gap and pick up null (chain-root
    // behavior — same as if compact truncated there, which it did).
    var deletedParent = new Map();
    var removedCount = 0;
    for (var _d = 0, toDelete_2 = toDelete; _d < toDelete_2.length; _d++) {
        var uuid = toDelete_2[_d];
        var entry = messages.get(uuid);
        if (!entry)
            continue;
        deletedParent.set(uuid, entry.parentUuid);
        messages.delete(uuid);
        removedCount++;
    }
    // Relink survivors with dangling parentUuid. Walk backward through
    // deletedParent until we hit a UUID not in toDelete (or null). Path
    // compression: after resolving, seed the map with the resolved link so
    // subsequent survivors sharing the same chain segment don't re-walk.
    var resolve = function (start) {
        var path = [];
        var cur = start;
        while (cur && toDelete.has(cur)) {
            path.push(cur);
            cur = deletedParent.get(cur);
            if (cur === undefined) {
                cur = null;
                break;
            }
        }
        for (var _i = 0, path_2 = path; _i < path_2.length; _i++) {
            var p = path_2[_i];
            deletedParent.set(p, cur);
        }
        return cur;
    };
    var relinkedCount = 0;
    for (var _e = 0, messages_4 = messages; _e < messages_4.length; _e++) {
        var _f = messages_4[_e], uuid = _f[0], msg = _f[1];
        if (!msg.parentUuid || !toDelete.has(msg.parentUuid))
            continue;
        messages.set(uuid, __assign(__assign({}, msg), { parentUuid: resolve(msg.parentUuid) }));
        relinkedCount++;
    }
    (0, index_js_1.logEvent)('tengu_snip_resume_filtered', {
        removed_count: removedCount,
        relinked_count: relinkedCount,
    });
}
/**
 * O(n) single-pass: find the message with the latest timestamp matching a predicate.
 * Replaces the `[...values].filter(pred).sort((a,b) => Date(b)-Date(a))[0]` pattern
 * which is O(n log n) + 2n Date allocations.
 */
function findLatestMessage(messages, predicate) {
    var latest;
    var maxTime = -Infinity;
    for (var _i = 0, messages_5 = messages; _i < messages_5.length; _i++) {
        var m = messages_5[_i];
        if (!predicate(m))
            continue;
        var t = Date.parse(m.timestamp);
        if (t > maxTime) {
            maxTime = t;
            latest = m;
        }
    }
    return latest;
}
/**
 * Builds a conversation chain from a leaf message to root
 * @param messages Map of all messages
 * @param leafMessage The leaf message to start from
 * @returns Array of messages from root to leaf
 */
function buildConversationChain(messages, leafMessage) {
    var transcript = [];
    var seen = new Set();
    var currentMsg = leafMessage;
    while (currentMsg) {
        if (seen.has(currentMsg.uuid)) {
            (0, log_js_1.logError)(new Error("Cycle detected in parentUuid chain at message ".concat(currentMsg.uuid, ". Returning partial transcript.")));
            (0, index_js_1.logEvent)('tengu_chain_parent_cycle', {});
            break;
        }
        seen.add(currentMsg.uuid);
        transcript.push(currentMsg);
        currentMsg = currentMsg.parentUuid
            ? messages.get(currentMsg.parentUuid)
            : undefined;
    }
    transcript.reverse();
    return recoverOrphanedParallelToolResults(messages, transcript, seen);
}
/**
 * Post-pass for buildConversationChain: recover sibling assistant blocks and
 * tool_results that the single-parent walk orphaned.
 *
 * Streaming (claude.ts:~2024) emits one AssistantMessage per content_block_stop
 * — N parallel tool_uses → N messages, distinct uuid, same message.id. Each
 * tool_result's sourceToolAssistantUUID points to its own one-block assistant,
 * so insertMessageChain's override (line ~894) writes each TR's parentUuid to a
 * DIFFERENT assistant. The topology is a DAG; the walk above is a linked-list
 * traversal and keeps only one branch.
 *
 * Two loss modes observed in production (both fixed here):
 *   1. Sibling assistant orphaned: walk goes prev→asstA→TR_A→next, drops asstB
 *      (same message.id, chained off asstA) and TR_B.
 *   2. Progress-fork (legacy, pre-#23537): each tool_use asst had a progress
 *      child (continued the write chain) AND a TR child. Walk followed
 *      progress; TRs were dropped. No longer written (progress removed from
 *      transcript persistence), but old transcripts still have this shape.
 *
 * Read-side fix: the write topology is already on disk for old transcripts;
 * this recovery pass handles them.
 */
function recoverOrphanedParallelToolResults(messages, chain, seen) {
    var _a;
    var chainAssistants = chain.filter(function (m) { return m.type === 'assistant'; });
    if (chainAssistants.length === 0)
        return chain;
    // Anchor = last on-chain member of each sibling group. chainAssistants is
    // already in chain order, so later iterations overwrite → last wins.
    var anchorByMsgId = new Map();
    for (var _i = 0, chainAssistants_1 = chainAssistants; _i < chainAssistants_1.length; _i++) {
        var a = chainAssistants_1[_i];
        if (a.message.id)
            anchorByMsgId.set(a.message.id, a);
    }
    // O(n) precompute: sibling groups and TR index.
    // TRs indexed by parentUuid — insertMessageChain:~894 already wrote that
    // as the srcUUID, and --fork-session strips srcUUID but keeps parentUuid.
    var siblingsByMsgId = new Map();
    var toolResultsByAsst = new Map();
    for (var _b = 0, _c = messages.values(); _b < _c.length; _b++) {
        var m = _c[_b];
        if (m.type === 'assistant' && m.message.id) {
            var group = siblingsByMsgId.get(m.message.id);
            if (group)
                group.push(m);
            else
                siblingsByMsgId.set(m.message.id, [m]);
        }
        else if (m.type === 'user' &&
            m.parentUuid &&
            Array.isArray(m.message.content) &&
            m.message.content.some(function (b) { return b.type === 'tool_result'; })) {
            var group = toolResultsByAsst.get(m.parentUuid);
            if (group)
                group.push(m);
            else
                toolResultsByAsst.set(m.parentUuid, [m]);
        }
    }
    // For each message.id group touching the chain: collect off-chain siblings,
    // then off-chain TRs for ALL members. Splice right after the last on-chain
    // member so the group stays contiguous for normalizeMessagesForAPI's merge
    // and every TR lands after its tool_use.
    var processedGroups = new Set();
    var inserts = new Map();
    var recoveredCount = 0;
    for (var _d = 0, chainAssistants_2 = chainAssistants; _d < chainAssistants_2.length; _d++) {
        var asst = chainAssistants_2[_d];
        var msgId = asst.message.id;
        if (!msgId || processedGroups.has(msgId))
            continue;
        processedGroups.add(msgId);
        var group = (_a = siblingsByMsgId.get(msgId)) !== null && _a !== void 0 ? _a : [asst];
        var orphanedSiblings = group.filter(function (s) { return !seen.has(s.uuid); });
        var orphanedTRs = [];
        for (var _e = 0, group_1 = group; _e < group_1.length; _e++) {
            var member = group_1[_e];
            var trs = toolResultsByAsst.get(member.uuid);
            if (!trs)
                continue;
            for (var _f = 0, trs_1 = trs; _f < trs_1.length; _f++) {
                var tr = trs_1[_f];
                if (!seen.has(tr.uuid))
                    orphanedTRs.push(tr);
            }
        }
        if (orphanedSiblings.length === 0 && orphanedTRs.length === 0)
            continue;
        // Timestamp sort keeps content-block / completion order; stable-sort
        // preserves JSONL write order on ties.
        orphanedSiblings.sort(function (a, b) { return a.timestamp.localeCompare(b.timestamp); });
        orphanedTRs.sort(function (a, b) { return a.timestamp.localeCompare(b.timestamp); });
        var anchor = anchorByMsgId.get(msgId);
        var recovered = __spreadArray(__spreadArray([], orphanedSiblings, true), orphanedTRs, true);
        for (var _g = 0, recovered_1 = recovered; _g < recovered_1.length; _g++) {
            var r = recovered_1[_g];
            seen.add(r.uuid);
        }
        recoveredCount += recovered.length;
        inserts.set(anchor.uuid, recovered);
    }
    if (recoveredCount === 0)
        return chain;
    (0, index_js_1.logEvent)('tengu_chain_parallel_tr_recovered', {
        recovered_count: recoveredCount,
    });
    var result = [];
    for (var _h = 0, chain_1 = chain; _h < chain_1.length; _h++) {
        var m = chain_1[_h];
        result.push(m);
        var toInsert = inserts.get(m.uuid);
        if (toInsert)
            result.push.apply(result, toInsert);
    }
    return result;
}
/**
 * Find the latest turn_duration checkpoint in the reconstructed chain and
 * compare its recorded messageCount against the chain's position at that
 * point. Emits tengu_resume_consistency_delta for BigQuery monitoring of
 * write→load round-trip drift — the class of bugs where snip/compact/
 * parallel-TR operations mutate in-memory but the parentUuid walk on disk
 * reconstructs a different set (adamr-20260320-165831: 397K displayed →
 * 1.65M actual on resume).
 *
 * delta > 0: resume loaded MORE than in-session (the usual failure mode)
 * delta < 0: resume loaded FEWER (chain truncation — #22453 class)
 * delta = 0: round-trip consistent
 *
 * Called from loadConversationForResume — fires once per resume, not on
 * /share or log-listing chain rebuilds.
 */
function checkResumeConsistency(chain) {
    for (var i = chain.length - 1; i >= 0; i--) {
        var m = chain[i];
        if (m.type !== 'system' || m.subtype !== 'turn_duration')
            continue;
        var expected = m.messageCount;
        if (expected === undefined)
            return;
        // `i` is the 0-based index of the checkpoint in the reconstructed chain.
        // The checkpoint was appended AFTER messageCount messages, so its own
        // position should be messageCount (i.e., i === expected).
        var actual = i;
        (0, index_js_1.logEvent)('tengu_resume_consistency_delta', {
            expected: expected,
            actual: actual,
            delta: actual - expected,
            chain_length: chain.length,
            checkpoint_age_entries: chain.length - 1 - i,
        });
        return;
    }
}
/**
 * Builds a filie history snapshot chain from the conversation
 */
function buildFileHistorySnapshotChain(fileHistorySnapshots, conversation) {
    var snapshots = [];
    // messageId → last index in snapshots[] for O(1) update lookup
    var indexByMessageId = new Map();
    for (var _i = 0, conversation_1 = conversation; _i < conversation_1.length; _i++) {
        var message = conversation_1[_i];
        var snapshotMessage = fileHistorySnapshots.get(message.uuid);
        if (!snapshotMessage) {
            continue;
        }
        var snapshot = snapshotMessage.snapshot, isSnapshotUpdate = snapshotMessage.isSnapshotUpdate;
        var existingIndex = isSnapshotUpdate
            ? indexByMessageId.get(snapshot.messageId)
            : undefined;
        if (existingIndex === undefined) {
            indexByMessageId.set(snapshot.messageId, snapshots.length);
            snapshots.push(snapshot);
        }
        else {
            snapshots[existingIndex] = snapshot;
        }
    }
    return snapshots;
}
/**
 * Builds an attribution snapshot chain from the conversation.
 * Unlike file history snapshots, attribution snapshots are returned in full
 * because they use generated UUIDs (not message UUIDs) and represent
 * cumulative state that should be restored on session resume.
 */
function buildAttributionSnapshotChain(attributionSnapshots, _conversation) {
    // Return all attribution snapshots - they will be merged during restore
    return Array.from(attributionSnapshots.values());
}
/**
 * Loads a transcript from a JSON or JSONL file and converts it to LogOption format
 * @param filePath Path to the transcript file (.json or .jsonl)
 * @returns LogOption containing the transcript messages
 * @throws Error if file doesn't exist or contains invalid data
 */
function loadTranscriptFromFile(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, messages_6, summaries, customTitles, tags, fileHistorySnapshots, attributionSnapshots, contextCollapseCommits, contextCollapseSnapshot, leafUuids_1, contentReplacements, worktreeStates, leafMessage, transcript, summary, customTitle, tag, sessionId_1, content, parsed, messages;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!filePath.endsWith('.jsonl')) return [3 /*break*/, 2];
                    return [4 /*yield*/, loadTranscriptFile(filePath)];
                case 1:
                    _a = _c.sent(), messages_6 = _a.messages, summaries = _a.summaries, customTitles = _a.customTitles, tags = _a.tags, fileHistorySnapshots = _a.fileHistorySnapshots, attributionSnapshots = _a.attributionSnapshots, contextCollapseCommits = _a.contextCollapseCommits, contextCollapseSnapshot = _a.contextCollapseSnapshot, leafUuids_1 = _a.leafUuids, contentReplacements = _a.contentReplacements, worktreeStates = _a.worktreeStates;
                    if (messages_6.size === 0) {
                        throw new Error('No messages found in JSONL file');
                    }
                    leafMessage = findLatestMessage(messages_6.values(), function (msg) {
                        return leafUuids_1.has(msg.uuid);
                    });
                    if (!leafMessage) {
                        throw new Error('No valid conversation chain found in JSONL file');
                    }
                    transcript = buildConversationChain(messages_6, leafMessage);
                    summary = summaries.get(leafMessage.uuid);
                    customTitle = customTitles.get(leafMessage.sessionId);
                    tag = tags.get(leafMessage.sessionId);
                    sessionId_1 = leafMessage.sessionId;
                    return [2 /*return*/, __assign(__assign({}, convertToLogOption(transcript, 0, summary, customTitle, buildFileHistorySnapshotChain(fileHistorySnapshots, transcript), tag, filePath, buildAttributionSnapshotChain(attributionSnapshots, transcript), undefined, (_b = contentReplacements.get(sessionId_1)) !== null && _b !== void 0 ? _b : [])), { contextCollapseCommits: contextCollapseCommits.filter(function (e) { return e.sessionId === sessionId_1; }), contextCollapseSnapshot: (contextCollapseSnapshot === null || contextCollapseSnapshot === void 0 ? void 0 : contextCollapseSnapshot.sessionId) === sessionId_1
                                ? contextCollapseSnapshot
                                : undefined, worktreeSession: worktreeStates.has(sessionId_1)
                                ? worktreeStates.get(sessionId_1)
                                : undefined })];
                case 2: return [4 /*yield*/, (0, promises_1.readFile)(filePath, { encoding: 'utf-8' })];
                case 3:
                    content = _c.sent();
                    try {
                        parsed = (0, slowOperations_js_1.jsonParse)(content);
                    }
                    catch (error) {
                        throw new Error("Invalid JSON in transcript file: ".concat(error));
                    }
                    if (Array.isArray(parsed)) {
                        messages = parsed;
                    }
                    else if (parsed && typeof parsed === 'object' && 'messages' in parsed) {
                        if (!Array.isArray(parsed.messages)) {
                            throw new Error('Transcript messages must be an array');
                        }
                        messages = parsed.messages;
                    }
                    else {
                        throw new Error('Transcript must be an array of messages or an object with a messages array');
                    }
                    return [2 /*return*/, convertToLogOption(messages, 0, undefined, undefined, undefined, undefined, filePath)];
            }
        });
    });
}
/**
 * Checks if a user message has visible content (text or image, not just tool_result).
 * Tool results are displayed as part of collapsed groups, not as standalone messages.
 * Also excludes meta messages which are not shown to the user.
 */
function hasVisibleUserContent(message) {
    var _a;
    if (message.type !== 'user')
        return false;
    // Meta messages are not shown to the user
    if (message.isMeta)
        return false;
    var content = (_a = message.message) === null || _a === void 0 ? void 0 : _a.content;
    if (!content)
        return false;
    // String content is always visible
    if (typeof content === 'string') {
        return content.trim().length > 0;
    }
    // Array content: check for text or image blocks (not tool_result)
    if (Array.isArray(content)) {
        return content.some(function (block) {
            return block.type === 'text' ||
                block.type === 'image' ||
                block.type === 'document';
        });
    }
    return false;
}
/**
 * Checks if an assistant message has visible text content (not just tool_use blocks).
 * Tool uses are displayed as grouped/collapsed UI elements, not as standalone messages.
 */
function hasVisibleAssistantContent(message) {
    var _a;
    if (message.type !== 'assistant')
        return false;
    var content = (_a = message.message) === null || _a === void 0 ? void 0 : _a.content;
    if (!content || !Array.isArray(content))
        return false;
    // Check for text block (not just tool_use/thinking blocks)
    return content.some(function (block) {
        return block.type === 'text' &&
            typeof block.text === 'string' &&
            block.text.trim().length > 0;
    });
}
/**
 * Counts visible messages that would appear as conversation turns in the UI.
 * Excludes:
 * - System, attachment, and progress messages
 * - User messages with isMeta flag (hidden from user)
 * - User messages that only contain tool_result blocks (displayed as collapsed groups)
 * - Assistant messages that only contain tool_use blocks (displayed as collapsed groups)
 */
function countVisibleMessages(transcript) {
    var count = 0;
    for (var _i = 0, transcript_2 = transcript; _i < transcript_2.length; _i++) {
        var message = transcript_2[_i];
        switch (message.type) {
            case 'user':
                // Count user messages with visible content (text, image, not just tool_result or meta)
                if (hasVisibleUserContent(message)) {
                    count++;
                }
                break;
            case 'assistant':
                // Count assistant messages with text content (not just tool_use)
                if (hasVisibleAssistantContent(message)) {
                    count++;
                }
                break;
            case 'attachment':
            case 'system':
            case 'progress':
                // These message types are not counted as visible conversation turns
                break;
        }
    }
    return count;
}
function convertToLogOption(transcript, value, summary, customTitle, fileHistorySnapshots, tag, fullPath, attributionSnapshots, agentSetting, contentReplacements) {
    if (value === void 0) { value = 0; }
    var lastMessage = transcript.at(-1);
    var firstMessage = transcript[0];
    // Get the first user message for the prompt
    var firstPrompt = extractFirstPrompt(transcript);
    // Create timestamps from message timestamps
    var created = new Date(firstMessage.timestamp);
    var modified = new Date(lastMessage.timestamp);
    return {
        date: lastMessage.timestamp,
        messages: removeExtraFields(transcript),
        fullPath: fullPath,
        value: value,
        created: created,
        modified: modified,
        firstPrompt: firstPrompt,
        messageCount: countVisibleMessages(transcript),
        isSidechain: firstMessage.isSidechain,
        teamName: firstMessage.teamName,
        agentName: firstMessage.agentName,
        agentSetting: agentSetting,
        leafUuid: lastMessage.uuid,
        summary: summary,
        customTitle: customTitle,
        tag: tag,
        fileHistorySnapshots: fileHistorySnapshots,
        attributionSnapshots: attributionSnapshots,
        contentReplacements: contentReplacements,
        gitBranch: lastMessage.gitBranch,
        projectPath: firstMessage.cwd,
    };
}
function trackSessionBranchingAnalytics(logs) {
    return __awaiter(this, void 0, void 0, function () {
        var sessionIdCounts, maxCount, _i, logs_1, log, sessionId, newCount, branchCounts, sessionsWithBranches, totalBranches;
        return __generator(this, function (_a) {
            sessionIdCounts = new Map();
            maxCount = 0;
            for (_i = 0, logs_1 = logs; _i < logs_1.length; _i++) {
                log = logs_1[_i];
                sessionId = getSessionIdFromLog(log);
                if (sessionId) {
                    newCount = (sessionIdCounts.get(sessionId) || 0) + 1;
                    sessionIdCounts.set(sessionId, newCount);
                    maxCount = Math.max(newCount, maxCount);
                }
            }
            // Early exit if no duplicates detected
            if (maxCount <= 1) {
                return [2 /*return*/];
            }
            branchCounts = Array.from(sessionIdCounts.values()).filter(function (c) { return c > 1; });
            sessionsWithBranches = branchCounts.length;
            totalBranches = branchCounts.reduce(function (sum, count) { return sum + count; }, 0);
            (0, index_js_1.logEvent)('tengu_session_forked_branches_fetched', {
                total_sessions: sessionIdCounts.size,
                sessions_with_branches: sessionsWithBranches,
                max_branches_per_session: Math.max.apply(Math, branchCounts),
                avg_branches_per_session: Math.round(totalBranches / sessionsWithBranches),
                total_transcript_count: logs.length,
            });
            return [2 /*return*/];
        });
    });
}
function fetchLogs(limit) {
    return __awaiter(this, void 0, void 0, function () {
        var projectDir, logs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    projectDir = (0, exports.getProjectDir)((0, state_js_1.getOriginalCwd)());
                    return [4 /*yield*/, getSessionFilesLite(projectDir, limit, (0, state_js_1.getOriginalCwd)())];
                case 1:
                    logs = _a.sent();
                    return [4 /*yield*/, trackSessionBranchingAnalytics(logs)];
                case 2:
                    _a.sent();
                    return [2 /*return*/, logs];
            }
        });
    });
}
/**
 * Append an entry to a session file. Creates the parent dir if missing.
 */
/* eslint-disable custom-rules/no-sync-fs -- sync callers (exit cleanup, materialize) */
function appendEntryToFile(fullPath, entry) {
    var fs = (0, fsOperations_js_1.getFsImplementation)();
    var line = (0, slowOperations_js_1.jsonStringify)(entry) + '\n';
    try {
        fs.appendFileSync(fullPath, line, { mode: 384 });
    }
    catch (_a) {
        fs.mkdirSync((0, path_1.dirname)(fullPath), { mode: 448 });
        fs.appendFileSync(fullPath, line, { mode: 384 });
    }
}
/**
 * Sync tail read for reAppendSessionMetadata's external-writer check.
 * fstat on the already-open fd (no extra path lookup); reads the same
 * LITE_READ_BUF_SIZE window that readLiteMetadata scans. Returns empty
 * string on any error so callers fall through to unconditional behavior.
 */
function readFileTailSync(fullPath) {
    var fd;
    try {
        fd = (0, fs_1.openSync)(fullPath, 'r');
        var st = (0, fs_1.fstatSync)(fd);
        var tailOffset = Math.max(0, st.size - sessionStoragePortable_js_1.LITE_READ_BUF_SIZE);
        var buf = Buffer.allocUnsafe(Math.min(sessionStoragePortable_js_1.LITE_READ_BUF_SIZE, st.size - tailOffset));
        var bytesRead = (0, fs_1.readSync)(fd, buf, 0, buf.length, tailOffset);
        return buf.toString('utf8', 0, bytesRead);
    }
    catch (_a) {
        return '';
    }
    finally {
        if (fd !== undefined) {
            try {
                (0, fs_1.closeSync)(fd);
            }
            catch (_b) {
                // closeSync can throw; swallow to preserve return '' contract
            }
        }
    }
}
/* eslint-enable custom-rules/no-sync-fs */
function saveCustomTitle(sessionId_2, customTitle_1, fullPath_1) {
    return __awaiter(this, arguments, void 0, function (sessionId, customTitle, fullPath, source) {
        var resolvedPath;
        if (source === void 0) { source = 'user'; }
        return __generator(this, function (_a) {
            resolvedPath = fullPath !== null && fullPath !== void 0 ? fullPath : getTranscriptPathForSession(sessionId);
            appendEntryToFile(resolvedPath, {
                type: 'custom-title',
                customTitle: customTitle,
                sessionId: sessionId,
            });
            // Cache for current session only (for immediate visibility)
            if (sessionId === (0, state_js_1.getSessionId)()) {
                getProject().currentSessionTitle = customTitle;
            }
            (0, index_js_1.logEvent)('tengu_session_renamed', {
                source: source,
            });
            return [2 /*return*/];
        });
    });
}
/**
 * Persist an AI-generated title to the JSONL as a distinct `ai-title` entry.
 *
 * Writing a separate entry type (vs. reusing `custom-title`) is load-bearing:
 * - Read preference: readers prefer `customTitle` field over `aiTitle`, so
 *   a user rename always wins regardless of append order.
 * - Resume safety: `loadTranscriptFile` only populates the `customTitles`
 *   Map from `custom-title` entries, so `restoreSessionMetadata` never
 *   caches an AI title and `reAppendSessionMetadata` never re-appends one
 *   at EOF — avoiding the clobber-on-resume bug where a stale AI title
 *   overwrites a mid-session user rename.
 * - CAS semantics: VS Code's `onlyIfNoCustomTitle` check scans for the
 *   `customTitle` field only, so AI can overwrite its own previous AI
 *   title but never a user title.
 * - Metrics: `tengu_session_renamed` is not fired for AI titles.
 *
 * Because the entry is never re-appended, it scrolls out of the 64KB tail
 * window once enough messages accumulate. Readers (`readLiteMetadata`,
 * `listSessionsImpl`, VS Code `fetchSessions`) fall back to scanning the
 * head buffer for `aiTitle` in that case. Both head and tail reads are
 * bounded (64KB each via `extractLastJsonStringField`), never a full scan.
 *
 * Callers with a stale-write guard (e.g., VS Code client) should prefer
 * passing `persist: false` to the SDK control request and persisting
 * through their own rename path after the guard passes, to avoid a race
 * where the AI title lands after a mid-flight user rename.
 */
function saveAiGeneratedTitle(sessionId, aiTitle) {
    appendEntryToFile(getTranscriptPathForSession(sessionId), {
        type: 'ai-title',
        aiTitle: aiTitle,
        sessionId: sessionId,
    });
}
/**
 * Append a periodic task summary for `claude ps`. Unlike ai-title this is
 * not re-appended by reAppendSessionMetadata — it's a rolling snapshot of
 * what the agent is doing *now*, so staleness is fine; ps reads the most
 * recent one from the tail.
 */
function saveTaskSummary(sessionId, summary) {
    appendEntryToFile(getTranscriptPathForSession(sessionId), {
        type: 'task-summary',
        summary: summary,
        sessionId: sessionId,
        timestamp: new Date().toISOString(),
    });
}
function saveTag(sessionId, tag, fullPath) {
    return __awaiter(this, void 0, void 0, function () {
        var resolvedPath;
        return __generator(this, function (_a) {
            resolvedPath = fullPath !== null && fullPath !== void 0 ? fullPath : getTranscriptPathForSession(sessionId);
            appendEntryToFile(resolvedPath, { type: 'tag', tag: tag, sessionId: sessionId });
            // Cache for current session only (for immediate visibility)
            if (sessionId === (0, state_js_1.getSessionId)()) {
                getProject().currentSessionTag = tag;
            }
            (0, index_js_1.logEvent)('tengu_session_tagged', {});
            return [2 /*return*/];
        });
    });
}
/**
 * Link a session to a GitHub pull request.
 * This stores the PR number, URL, and repository for tracking and navigation.
 */
function linkSessionToPR(sessionId, prNumber, prUrl, prRepository, fullPath) {
    return __awaiter(this, void 0, void 0, function () {
        var resolvedPath, project_1;
        return __generator(this, function (_a) {
            resolvedPath = fullPath !== null && fullPath !== void 0 ? fullPath : getTranscriptPathForSession(sessionId);
            appendEntryToFile(resolvedPath, {
                type: 'pr-link',
                sessionId: sessionId,
                prNumber: prNumber,
                prUrl: prUrl,
                prRepository: prRepository,
                timestamp: new Date().toISOString(),
            });
            // Cache for current session so reAppendSessionMetadata can re-write after compaction
            if (sessionId === (0, state_js_1.getSessionId)()) {
                project_1 = getProject();
                project_1.currentSessionPrNumber = prNumber;
                project_1.currentSessionPrUrl = prUrl;
                project_1.currentSessionPrRepository = prRepository;
            }
            (0, index_js_1.logEvent)('tengu_session_linked_to_pr', { prNumber: prNumber });
            return [2 /*return*/];
        });
    });
}
function getCurrentSessionTag(sessionId) {
    // Only returns tag for current session (the only one we cache)
    if (sessionId === (0, state_js_1.getSessionId)()) {
        return getProject().currentSessionTag;
    }
    return undefined;
}
function getCurrentSessionTitle(sessionId) {
    // Only returns title for current session (the only one we cache)
    if (sessionId === (0, state_js_1.getSessionId)()) {
        return getProject().currentSessionTitle;
    }
    return undefined;
}
function getCurrentSessionAgentColor() {
    return getProject().currentSessionAgentColor;
}
/**
 * Restore session metadata into in-memory cache on resume.
 * Populates the cache so metadata is available for display (e.g. the
 * agent banner) and re-appended on session exit via reAppendSessionMetadata.
 */
function restoreSessionMetadata(meta) {
    var _a;
    var project = getProject();
    // ??= so --name (cacheSessionTitle) wins over the resumed
    // session's title. REPL.tsx clears before calling, so /resume is unaffected.
    if (meta.customTitle)
        (_a = project.currentSessionTitle) !== null && _a !== void 0 ? _a : (project.currentSessionTitle = meta.customTitle);
    if (meta.tag !== undefined)
        project.currentSessionTag = meta.tag || undefined;
    if (meta.agentName)
        project.currentSessionAgentName = meta.agentName;
    if (meta.agentColor)
        project.currentSessionAgentColor = meta.agentColor;
    if (meta.agentSetting)
        project.currentSessionAgentSetting = meta.agentSetting;
    if (meta.mode)
        project.currentSessionMode = meta.mode;
    if (meta.worktreeSession !== undefined)
        project.currentSessionWorktree = meta.worktreeSession;
    if (meta.prNumber !== undefined)
        project.currentSessionPrNumber = meta.prNumber;
    if (meta.prUrl)
        project.currentSessionPrUrl = meta.prUrl;
    if (meta.prRepository)
        project.currentSessionPrRepository = meta.prRepository;
}
/**
 * Clear all cached session metadata (title, tag, agent name/color).
 * Called when /clear creates a new session so stale metadata
 * from the previous session does not leak into the new one.
 */
function clearSessionMetadata() {
    var project = getProject();
    project.currentSessionTitle = undefined;
    project.currentSessionTag = undefined;
    project.currentSessionAgentName = undefined;
    project.currentSessionAgentColor = undefined;
    project.currentSessionLastPrompt = undefined;
    project.currentSessionAgentSetting = undefined;
    project.currentSessionMode = undefined;
    project.currentSessionWorktree = undefined;
    project.currentSessionPrNumber = undefined;
    project.currentSessionPrUrl = undefined;
    project.currentSessionPrRepository = undefined;
}
/**
 * Re-append cached session metadata (custom title, tag) to the end of the
 * transcript file. Call this after compaction so the metadata stays within
 * the 16KB tail window that readLiteMetadata reads during progressive loading.
 * Without this, enough post-compaction messages can push the metadata entry
 * out of the window, causing `--resume` to show the auto-generated firstPrompt
 * instead of the user-set session name.
 */
function reAppendSessionMetadata() {
    getProject().reAppendSessionMetadata();
}
function saveAgentName(sessionId_2, agentName_1, fullPath_1) {
    return __awaiter(this, arguments, void 0, function (sessionId, agentName, fullPath, source) {
        var resolvedPath;
        if (source === void 0) { source = 'user'; }
        return __generator(this, function (_a) {
            resolvedPath = fullPath !== null && fullPath !== void 0 ? fullPath : getTranscriptPathForSession(sessionId);
            appendEntryToFile(resolvedPath, { type: 'agent-name', agentName: agentName, sessionId: sessionId });
            // Cache for current session only (for immediate visibility)
            if (sessionId === (0, state_js_1.getSessionId)()) {
                getProject().currentSessionAgentName = agentName;
                void (0, concurrentSessions_js_1.updateSessionName)(agentName);
            }
            (0, index_js_1.logEvent)('tengu_agent_name_set', {
                source: source,
            });
            return [2 /*return*/];
        });
    });
}
function saveAgentColor(sessionId, agentColor, fullPath) {
    return __awaiter(this, void 0, void 0, function () {
        var resolvedPath;
        return __generator(this, function (_a) {
            resolvedPath = fullPath !== null && fullPath !== void 0 ? fullPath : getTranscriptPathForSession(sessionId);
            appendEntryToFile(resolvedPath, {
                type: 'agent-color',
                agentColor: agentColor,
                sessionId: sessionId,
            });
            // Cache for current session only (for immediate visibility)
            if (sessionId === (0, state_js_1.getSessionId)()) {
                getProject().currentSessionAgentColor = agentColor;
            }
            (0, index_js_1.logEvent)('tengu_agent_color_set', {});
            return [2 /*return*/];
        });
    });
}
/**
 * Cache the session agent setting. Written to disk by materializeSessionFile
 * on the first user message, and re-stamped by reAppendSessionMetadata on exit.
 * Cache-only here to avoid creating metadata-only session files at startup.
 */
function saveAgentSetting(agentSetting) {
    getProject().currentSessionAgentSetting = agentSetting;
}
/**
 * Cache a session title set at startup (--name). Written to disk by
 * materializeSessionFile on the first user message. Cache-only here so no
 * orphan metadata-only file is created before the session ID is finalized.
 */
function cacheSessionTitle(customTitle) {
    getProject().currentSessionTitle = customTitle;
}
/**
 * Cache the session mode. Written to disk by materializeSessionFile on the
 * first user message, and re-stamped by reAppendSessionMetadata on exit.
 * Cache-only here to avoid creating metadata-only session files at startup.
 */
function saveMode(mode) {
    getProject().currentSessionMode = mode;
}
/**
 * Record the session's worktree state for --resume. Written to disk by
 * materializeSessionFile on the first user message and re-stamped by
 * reAppendSessionMetadata on exit. Pass null when exiting a worktree
 * so --resume knows not to cd back into it.
 */
function saveWorktreeState(worktreeSession) {
    // Strip ephemeral fields (creationDurationMs, usedSparsePaths) that callers
    // may pass via full WorktreeSession objects — TypeScript structural typing
    // allows this, but we don't want them serialized to the transcript.
    var stripped = worktreeSession
        ? {
            originalCwd: worktreeSession.originalCwd,
            worktreePath: worktreeSession.worktreePath,
            worktreeName: worktreeSession.worktreeName,
            worktreeBranch: worktreeSession.worktreeBranch,
            originalBranch: worktreeSession.originalBranch,
            originalHeadCommit: worktreeSession.originalHeadCommit,
            sessionId: worktreeSession.sessionId,
            tmuxSessionName: worktreeSession.tmuxSessionName,
            hookBased: worktreeSession.hookBased,
        }
        : null;
    var project = getProject();
    project.currentSessionWorktree = stripped;
    // Write eagerly when the file already exists (mid-session enter/exit).
    // For --worktree startup, sessionFile is null — materializeSessionFile
    // will write it on the first message via reAppendSessionMetadata.
    if (project.sessionFile) {
        appendEntryToFile(project.sessionFile, {
            type: 'worktree-state',
            worktreeSession: stripped,
            sessionId: (0, state_js_1.getSessionId)(),
        });
    }
}
/**
 * Extracts the session ID from a log.
 * For lite logs, uses the sessionId field directly.
 * For full logs, extracts from the first message.
 */
function getSessionIdFromLog(log) {
    var _a;
    // For lite logs, use the direct sessionId field
    if (log.sessionId) {
        return log.sessionId;
    }
    // Fall back to extracting from first message (full logs)
    return (_a = log.messages[0]) === null || _a === void 0 ? void 0 : _a.sessionId;
}
/**
 * Checks if a log is a lite log that needs full loading.
 * Lite logs have messages: [] and sessionId set.
 */
function isLiteLog(log) {
    return log.messages.length === 0 && log.sessionId !== undefined;
}
/**
 * Loads full messages for a lite log by reading its JSONL file.
 * Returns a new LogOption with populated messages array.
 * If the log is already full or loading fails, returns the original log.
 */
function loadFullLog(log) {
    return __awaiter(this, void 0, void 0, function () {
        var sessionFile, _a, messages, summaries, customTitles, tags, agentNames, agentColors, agentSettings, prNumbers, prUrls, prRepositories, modes, worktreeStates, fileHistorySnapshots, attributionSnapshots, contentReplacements, contextCollapseCommits, contextCollapseSnapshot, leafUuids_2, mostRecentLeaf, transcript, sessionId_2, _b;
        var _c, _d, _e, _f, _g, _h, _j;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0:
                    // If already full, return as-is
                    if (!isLiteLog(log)) {
                        return [2 /*return*/, log];
                    }
                    sessionFile = log.fullPath;
                    if (!sessionFile) {
                        return [2 /*return*/, log];
                    }
                    _k.label = 1;
                case 1:
                    _k.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, loadTranscriptFile(sessionFile)];
                case 2:
                    _a = _k.sent(), messages = _a.messages, summaries = _a.summaries, customTitles = _a.customTitles, tags = _a.tags, agentNames = _a.agentNames, agentColors = _a.agentColors, agentSettings = _a.agentSettings, prNumbers = _a.prNumbers, prUrls = _a.prUrls, prRepositories = _a.prRepositories, modes = _a.modes, worktreeStates = _a.worktreeStates, fileHistorySnapshots = _a.fileHistorySnapshots, attributionSnapshots = _a.attributionSnapshots, contentReplacements = _a.contentReplacements, contextCollapseCommits = _a.contextCollapseCommits, contextCollapseSnapshot = _a.contextCollapseSnapshot, leafUuids_2 = _a.leafUuids;
                    if (messages.size === 0) {
                        return [2 /*return*/, log];
                    }
                    mostRecentLeaf = findLatestMessage(messages.values(), function (msg) {
                        return leafUuids_2.has(msg.uuid) &&
                            (msg.type === 'user' || msg.type === 'assistant');
                    });
                    if (!mostRecentLeaf) {
                        return [2 /*return*/, log];
                    }
                    transcript = buildConversationChain(messages, mostRecentLeaf);
                    sessionId_2 = mostRecentLeaf.sessionId;
                    return [2 /*return*/, __assign(__assign({}, log), { messages: removeExtraFields(transcript), firstPrompt: extractFirstPrompt(transcript), messageCount: countVisibleMessages(transcript), summary: mostRecentLeaf
                                ? summaries.get(mostRecentLeaf.uuid)
                                : log.summary, customTitle: sessionId_2 ? customTitles.get(sessionId_2) : log.customTitle, tag: sessionId_2 ? tags.get(sessionId_2) : log.tag, agentName: sessionId_2 ? agentNames.get(sessionId_2) : log.agentName, agentColor: sessionId_2 ? agentColors.get(sessionId_2) : log.agentColor, agentSetting: sessionId_2 ? agentSettings.get(sessionId_2) : log.agentSetting, mode: sessionId_2 ? modes.get(sessionId_2) : log.mode, worktreeSession: sessionId_2 && worktreeStates.has(sessionId_2)
                                ? worktreeStates.get(sessionId_2)
                                : log.worktreeSession, prNumber: sessionId_2 ? prNumbers.get(sessionId_2) : log.prNumber, prUrl: sessionId_2 ? prUrls.get(sessionId_2) : log.prUrl, prRepository: sessionId_2
                                ? prRepositories.get(sessionId_2)
                                : log.prRepository, gitBranch: (_c = mostRecentLeaf === null || mostRecentLeaf === void 0 ? void 0 : mostRecentLeaf.gitBranch) !== null && _c !== void 0 ? _c : log.gitBranch, isSidechain: (_e = (_d = transcript[0]) === null || _d === void 0 ? void 0 : _d.isSidechain) !== null && _e !== void 0 ? _e : log.isSidechain, teamName: (_g = (_f = transcript[0]) === null || _f === void 0 ? void 0 : _f.teamName) !== null && _g !== void 0 ? _g : log.teamName, leafUuid: (_h = mostRecentLeaf === null || mostRecentLeaf === void 0 ? void 0 : mostRecentLeaf.uuid) !== null && _h !== void 0 ? _h : log.leafUuid, fileHistorySnapshots: buildFileHistorySnapshotChain(fileHistorySnapshots, transcript), attributionSnapshots: buildAttributionSnapshotChain(attributionSnapshots, transcript), contentReplacements: sessionId_2
                                ? ((_j = contentReplacements.get(sessionId_2)) !== null && _j !== void 0 ? _j : [])
                                : log.contentReplacements, 
                            // Filter to the resumed session's entries. loadTranscriptFile reads
                            // the file sequentially so the array is already in commit order;
                            // filter preserves that.
                            contextCollapseCommits: sessionId_2
                                ? contextCollapseCommits.filter(function (e) { return e.sessionId === sessionId_2; })
                                : undefined, contextCollapseSnapshot: sessionId_2 && (contextCollapseSnapshot === null || contextCollapseSnapshot === void 0 ? void 0 : contextCollapseSnapshot.sessionId) === sessionId_2
                                ? contextCollapseSnapshot
                                : undefined })];
                case 3:
                    _b = _k.sent();
                    // If loading fails, return the original log
                    return [2 /*return*/, log];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Searches for sessions by custom title match.
 * Returns matches sorted by recency (newest first).
 * Uses case-insensitive matching for better UX.
 * Deduplicates by sessionId (keeps most recent per session).
 * Searches across same-repo worktrees by default.
 */
function searchSessionsByCustomTitle(query, options) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, limit, exact, worktreePaths, allStatLogs, logs, normalizedQuery, matchingLogs, sessionIdToLog, _i, matchingLogs_1, log, sessionId, existing, deduplicated;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = options || {}, limit = _a.limit, exact = _a.exact;
                    return [4 /*yield*/, (0, getWorktreePaths_js_1.getWorktreePaths)((0, state_js_1.getOriginalCwd)())];
                case 1:
                    worktreePaths = _b.sent();
                    return [4 /*yield*/, getStatOnlyLogsForWorktrees(worktreePaths)
                        // Enrich all logs to access customTitle metadata
                    ];
                case 2:
                    allStatLogs = _b.sent();
                    return [4 /*yield*/, enrichLogs(allStatLogs, 0, allStatLogs.length)];
                case 3:
                    logs = (_b.sent()).logs;
                    normalizedQuery = query.toLowerCase().trim();
                    matchingLogs = logs.filter(function (log) {
                        var _a;
                        var title = (_a = log.customTitle) === null || _a === void 0 ? void 0 : _a.toLowerCase().trim();
                        if (!title)
                            return false;
                        return exact ? title === normalizedQuery : title.includes(normalizedQuery);
                    });
                    sessionIdToLog = new Map();
                    for (_i = 0, matchingLogs_1 = matchingLogs; _i < matchingLogs_1.length; _i++) {
                        log = matchingLogs_1[_i];
                        sessionId = getSessionIdFromLog(log);
                        if (sessionId) {
                            existing = sessionIdToLog.get(sessionId);
                            if (!existing || log.modified > existing.modified) {
                                sessionIdToLog.set(sessionId, log);
                            }
                        }
                    }
                    deduplicated = Array.from(sessionIdToLog.values());
                    // Sort by recency
                    deduplicated.sort(function (a, b) { return b.modified.getTime() - a.modified.getTime(); });
                    // Apply limit if specified
                    if (limit) {
                        return [2 /*return*/, deduplicated.slice(0, limit)];
                    }
                    return [2 /*return*/, deduplicated];
            }
        });
    });
}
/**
 * Metadata entry types that can appear before a compact boundary but must
 * still be loaded (they're session-scoped, not message-scoped).
 * Kept as raw JSON string markers for cheap line filtering during streaming.
 */
var METADATA_TYPE_MARKERS = [
    '"type":"summary"',
    '"type":"custom-title"',
    '"type":"tag"',
    '"type":"agent-name"',
    '"type":"agent-color"',
    '"type":"agent-setting"',
    '"type":"mode"',
    '"type":"worktree-state"',
    '"type":"pr-link"',
];
var METADATA_MARKER_BUFS = METADATA_TYPE_MARKERS.map(function (m) { return Buffer.from(m); });
// Longest marker is 22 bytes; +1 for leading `{` = 23.
var METADATA_PREFIX_BOUND = 25;
// null = carry spans whole chunk. Skips concat when carry provably isn't
// a metadata line (markers sit at byte 1 after `{`).
function resolveMetadataBuf(carry, chunkBuf) {
    if (carry === null || carry.length === 0)
        return chunkBuf;
    if (carry.length < METADATA_PREFIX_BOUND) {
        return Buffer.concat([carry, chunkBuf]);
    }
    if (carry[0] === 0x7b /* { */) {
        for (var _i = 0, METADATA_MARKER_BUFS_1 = METADATA_MARKER_BUFS; _i < METADATA_MARKER_BUFS_1.length; _i++) {
            var m = METADATA_MARKER_BUFS_1[_i];
            if (carry.compare(m, 0, m.length, 1, 1 + m.length) === 0) {
                return Buffer.concat([carry, chunkBuf]);
            }
        }
    }
    var firstNl = chunkBuf.indexOf(0x0a);
    return firstNl === -1 ? null : chunkBuf.subarray(firstNl + 1);
}
/**
 * Lightweight forward scan of [0, endOffset) collecting only metadata-entry lines.
 * Uses raw Buffer chunks and byte-level marker matching — no readline, no per-line
 * string conversion for the ~99% of lines that are message content.
 *
 * Fast path: if a chunk contains zero markers (the common case — metadata entries
 * are <50 per session), the entire chunk is skipped without line splitting.
 */
function scanPreBoundaryMetadata(filePath, endOffset) {
    return __awaiter(this, void 0, void 0, function () {
        var createReadStream, NEWLINE, stream, metadataLines, carry, _a, stream_1, stream_1_1, chunk, chunkBuf, buf, hasAnyMarker, _i, METADATA_MARKER_BUFS_2, m, lineStart, nl, _b, METADATA_MARKER_BUFS_3, m, mIdx, lastNl, e_7_1, _c, METADATA_MARKER_BUFS_4, m;
        var _d, e_7, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0: return [4 /*yield*/, Promise.resolve().then(function () { return require('fs'); })];
                case 1:
                    createReadStream = (_g.sent()).createReadStream;
                    NEWLINE = 0x0a;
                    stream = createReadStream(filePath, { end: endOffset - 1 });
                    metadataLines = [];
                    carry = null;
                    _g.label = 2;
                case 2:
                    _g.trys.push([2, 7, 8, 13]);
                    _a = true, stream_1 = __asyncValues(stream);
                    _g.label = 3;
                case 3: return [4 /*yield*/, stream_1.next()];
                case 4:
                    if (!(stream_1_1 = _g.sent(), _d = stream_1_1.done, !_d)) return [3 /*break*/, 6];
                    _f = stream_1_1.value;
                    _a = false;
                    chunk = _f;
                    chunkBuf = chunk;
                    buf = resolveMetadataBuf(carry, chunkBuf);
                    if (buf === null) {
                        carry = null;
                        return [3 /*break*/, 5];
                    }
                    hasAnyMarker = false;
                    for (_i = 0, METADATA_MARKER_BUFS_2 = METADATA_MARKER_BUFS; _i < METADATA_MARKER_BUFS_2.length; _i++) {
                        m = METADATA_MARKER_BUFS_2[_i];
                        if (buf.includes(m)) {
                            hasAnyMarker = true;
                            break;
                        }
                    }
                    if (hasAnyMarker) {
                        lineStart = 0;
                        nl = buf.indexOf(NEWLINE);
                        while (nl !== -1) {
                            // Bounded marker check: only look within this line's byte range
                            for (_b = 0, METADATA_MARKER_BUFS_3 = METADATA_MARKER_BUFS; _b < METADATA_MARKER_BUFS_3.length; _b++) {
                                m = METADATA_MARKER_BUFS_3[_b];
                                mIdx = buf.indexOf(m, lineStart);
                                if (mIdx !== -1 && mIdx < nl) {
                                    metadataLines.push(buf.toString('utf-8', lineStart, nl));
                                    break;
                                }
                            }
                            lineStart = nl + 1;
                            nl = buf.indexOf(NEWLINE, lineStart);
                        }
                        carry = buf.subarray(lineStart);
                    }
                    else {
                        lastNl = buf.lastIndexOf(NEWLINE);
                        carry = lastNl >= 0 ? buf.subarray(lastNl + 1) : buf;
                    }
                    // Guard against quadratic carry growth for pathological huge lines
                    // (e.g., a 10 MB tool-output line with no newline). Real metadata entries
                    // are <1 KB, so if carry exceeds this we're mid-message-content — drop it.
                    if (carry.length > 64 * 1024)
                        carry = null;
                    _g.label = 5;
                case 5:
                    _a = true;
                    return [3 /*break*/, 3];
                case 6: return [3 /*break*/, 13];
                case 7:
                    e_7_1 = _g.sent();
                    e_7 = { error: e_7_1 };
                    return [3 /*break*/, 13];
                case 8:
                    _g.trys.push([8, , 11, 12]);
                    if (!(!_a && !_d && (_e = stream_1.return))) return [3 /*break*/, 10];
                    return [4 /*yield*/, _e.call(stream_1)];
                case 9:
                    _g.sent();
                    _g.label = 10;
                case 10: return [3 /*break*/, 12];
                case 11:
                    if (e_7) throw e_7.error;
                    return [7 /*endfinally*/];
                case 12: return [7 /*endfinally*/];
                case 13:
                    // Final incomplete line (no trailing newline at endOffset)
                    if (carry !== null && carry.length > 0) {
                        for (_c = 0, METADATA_MARKER_BUFS_4 = METADATA_MARKER_BUFS; _c < METADATA_MARKER_BUFS_4.length; _c++) {
                            m = METADATA_MARKER_BUFS_4[_c];
                            if (carry.includes(m)) {
                                metadataLines.push(carry.toString('utf-8'));
                                break;
                            }
                        }
                    }
                    return [2 /*return*/, metadataLines];
            }
        });
    });
}
/**
 * Byte-level pre-filter that excises dead fork branches before parseJSONL.
 *
 * Every rewind/ctrl-z leaves an orphaned chain branch in the append-only
 * JSONL forever. buildConversationChain walks parentUuid from the latest leaf
 * and discards everything else, but by then parseJSONL has already paid to
 * JSON.parse all of it. Measured on fork-heavy sessions:
 *
 *   41 MB, 99% dead: parseJSONL 56.0 ms -> 3.9 ms (-93%)
 *   151 MB, 92% dead: 47.3 ms -> 9.4 ms (-80%)
 *
 * Sessions with few dead branches (5-7%) see a small win from the overhead of
 * the index pass roughly canceling the parse savings, so this is gated on
 * buffer size (same threshold as SKIP_PRECOMPACT_THRESHOLD).
 *
 * Relies on two invariants verified across 25k+ message lines in local
 * sessions (0 violations):
 *
 *   1. Transcript messages always serialize with parentUuid as the first key.
 *      JSON.stringify emits keys in insertion order and recordTranscript's
 *      object literal puts parentUuid first. So `{"parentUuid":` is a stable
 *      line prefix that distinguishes transcript messages from metadata.
 *
 *   2. Top-level uuid detection is handled by a suffix check + depth check
 *      (see inline comment in the scan loop). toolUseResult/mcpMeta serialize
 *      AFTER uuid with arbitrary server-controlled objects, and agent_progress
 *      entries serialize a nested Message in data BEFORE uuid — both can
 *      produce nested `"uuid":"<36>","timestamp":"` bytes, so suffix alone
 *      is insufficient. When multiple suffix matches exist, a brace-depth
 *      scan disambiguates.
 *
 * The append-only write discipline guarantees parents appear at earlier file
 * offsets than children, so walking backward from EOF always finds them.
 */
/**
 * Disambiguate multiple `"uuid":"<36>","timestamp":"` matches in one line by
 * finding the one at JSON nesting depth 1. String-aware brace counter:
 * `{`/`}` inside string values don't count; `\"` and `\\` inside strings are
 * handled. Candidates is sorted ascending (the scan loop produces them in
 * byte order). Returns the first depth-1 candidate, or the last candidate if
 * none are at depth 1 (shouldn't happen for well-formed JSONL — depth-1 is
 * where the top-level object's fields live).
 *
 * Only called when ≥2 suffix matches exist (agent_progress with a nested
 * Message, or mcpMeta with a coincidentally-suffixed object). Cost is
 * O(max(candidates) - lineStart) — one forward byte pass, stopping at the
 * first depth-1 hit.
 */
function pickDepthOneUuidCandidate(buf, lineStart, candidates) {
    var QUOTE = 0x22;
    var BACKSLASH = 0x5c;
    var OPEN_BRACE = 0x7b;
    var CLOSE_BRACE = 0x7d;
    var depth = 0;
    var inString = false;
    var escapeNext = false;
    var ci = 0;
    for (var i = lineStart; ci < candidates.length; i++) {
        if (i === candidates[ci]) {
            if (depth === 1 && !inString)
                return candidates[ci];
            ci++;
        }
        var b = buf[i];
        if (escapeNext) {
            escapeNext = false;
        }
        else if (inString) {
            if (b === BACKSLASH)
                escapeNext = true;
            else if (b === QUOTE)
                inString = false;
        }
        else if (b === QUOTE)
            inString = true;
        else if (b === OPEN_BRACE)
            depth++;
        else if (b === CLOSE_BRACE)
            depth--;
    }
    return candidates.at(-1);
}
function walkChainBeforeParse(buf) {
    var NEWLINE = 0x0a;
    var OPEN_BRACE = 0x7b;
    var QUOTE = 0x22;
    var PARENT_PREFIX = Buffer.from('{"parentUuid":');
    var UUID_KEY = Buffer.from('"uuid":"');
    var SIDECHAIN_TRUE = Buffer.from('"isSidechain":true');
    var UUID_LEN = 36;
    var TS_SUFFIX = Buffer.from('","timestamp":"');
    var TS_SUFFIX_LEN = TS_SUFFIX.length;
    var PREFIX_LEN = PARENT_PREFIX.length;
    var KEY_LEN = UUID_KEY.length;
    // Stride-3 flat index of transcript messages: [lineStart, lineEnd, parentStart].
    // parentStart is the byte offset of the parent uuid's first char, or -1 for null.
    // Metadata lines (summary, mode, file-history-snapshot, etc.) go in metaRanges
    // unfiltered - they lack the parentUuid prefix and downstream needs all of them.
    var msgIdx = [];
    var metaRanges = [];
    var uuidToSlot = new Map();
    var pos = 0;
    var len = buf.length;
    while (pos < len) {
        var nl = buf.indexOf(NEWLINE, pos);
        var lineEnd = nl === -1 ? len : nl + 1;
        if (lineEnd - pos > PREFIX_LEN &&
            buf[pos] === OPEN_BRACE &&
            buf.compare(PARENT_PREFIX, 0, PREFIX_LEN, pos, pos + PREFIX_LEN) === 0) {
            // `{"parentUuid":null,` or `{"parentUuid":"<36 chars>",`
            var parentStart = buf[pos + PREFIX_LEN] === QUOTE ? pos + PREFIX_LEN + 1 : -1;
            // The top-level uuid is immediately followed by `","timestamp":"` in
            // user/assistant/attachment entries (the create* helpers put them
            // adjacent; both always defined). But the suffix is NOT unique:
            //   - agent_progress entries carry a nested Message in data.message,
            //     serialized BEFORE top-level uuid — that inner Message has its
            //     own uuid,timestamp adjacent, so its bytes also satisfy the
            //     suffix check.
            //   - mcpMeta/toolUseResult come AFTER top-level uuid and hold
            //     server-controlled Record<string,unknown> — a server returning
            //     {uuid:"<36>",timestamp:"..."} would also match.
            // Collect all suffix matches; a single one is unambiguous (common
            // case), multiple need a brace-depth check to pick the one at
            // JSON nesting depth 1. Entries with NO suffix match (some progress
            // variants put timestamp BEFORE uuid → `"uuid":"<36>"}` at EOL)
            // have only one `"uuid":"` and the first-match fallback is sound.
            var firstAny = -1;
            var suffix0 = -1;
            var suffixN = void 0;
            var from = pos;
            for (;;) {
                var next = buf.indexOf(UUID_KEY, from);
                if (next < 0 || next >= lineEnd)
                    break;
                if (firstAny < 0)
                    firstAny = next;
                var after = next + KEY_LEN + UUID_LEN;
                if (after + TS_SUFFIX_LEN <= lineEnd &&
                    buf.compare(TS_SUFFIX, 0, TS_SUFFIX_LEN, after, after + TS_SUFFIX_LEN) === 0) {
                    if (suffix0 < 0)
                        suffix0 = next;
                    else
                        (suffixN !== null && suffixN !== void 0 ? suffixN : (suffixN = [suffix0])).push(next);
                }
                from = next + KEY_LEN;
            }
            var uk = suffixN
                ? pickDepthOneUuidCandidate(buf, pos, suffixN)
                : suffix0 >= 0
                    ? suffix0
                    : firstAny;
            if (uk >= 0) {
                var uuidStart = uk + KEY_LEN;
                // UUIDs are pure ASCII so latin1 avoids UTF-8 decode overhead.
                var uuid = buf.toString('latin1', uuidStart, uuidStart + UUID_LEN);
                uuidToSlot.set(uuid, msgIdx.length);
                msgIdx.push(pos, lineEnd, parentStart);
            }
            else {
                metaRanges.push(pos, lineEnd);
            }
        }
        else {
            metaRanges.push(pos, lineEnd);
        }
        pos = lineEnd;
    }
    // Leaf = last non-sidechain entry. isSidechain is the 2nd or 3rd key
    // (after parentUuid, maybe logicalParentUuid) so indexOf from lineStart
    // finds it within a few dozen bytes when present; when absent it spills
    // into the next line, caught by the bounds check.
    var leafSlot = -1;
    for (var i = msgIdx.length - 3; i >= 0; i -= 3) {
        var sc = buf.indexOf(SIDECHAIN_TRUE, msgIdx[i]);
        if (sc === -1 || sc >= msgIdx[i + 1]) {
            leafSlot = i;
            break;
        }
    }
    if (leafSlot < 0)
        return buf;
    // Walk parentUuid to root. Collect kept-message line starts and sum their
    // byte lengths so we can decide whether the concat is worth it. A dangling
    // parent (uuid not in file) is the normal termination for forked sessions
    // and post-boundary chains -- same semantics as buildConversationChain.
    // Correctness against index poisoning rests on the timestamp suffix check
    // above: a nested `"uuid":"` match without the suffix never becomes uk.
    var seen = new Set();
    var chain = new Set();
    var chainBytes = 0;
    var slot = leafSlot;
    while (slot !== undefined) {
        if (seen.has(slot))
            break;
        seen.add(slot);
        chain.add(msgIdx[slot]);
        chainBytes += msgIdx[slot + 1] - msgIdx[slot];
        var parentStart = msgIdx[slot + 2];
        if (parentStart < 0)
            break;
        var parent_1 = buf.toString('latin1', parentStart, parentStart + UUID_LEN);
        slot = uuidToSlot.get(parent_1);
    }
    // parseJSONL cost scales with bytes, not entry count. A session can have
    // thousands of dead entries by count but only single-digit-% of bytes if
    // the dead branches are short turns and the live chain holds the fat
    // assistant responses (measured: 107 MB session, 69% dead entries, 30%
    // dead bytes - index+concat overhead exceeded parse savings). Gate on
    // bytes: only stitch if we would drop at least half the buffer. Metadata
    // is tiny so len - chainBytes approximates dead bytes closely enough.
    // Near break-even the concat memcpy (copying chainBytes into a fresh
    // allocation) dominates, so a conservative 50% gate stays safely on the
    // winning side.
    if (len - chainBytes < len >> 1)
        return buf;
    // Merge chain entries with metadata in original file order. Both msgIdx and
    // metaRanges are already sorted by offset; interleave them into subarray
    // views and concat once.
    var parts = [];
    var m = 0;
    for (var i = 0; i < msgIdx.length; i += 3) {
        var start = msgIdx[i];
        while (m < metaRanges.length && metaRanges[m] < start) {
            parts.push(buf.subarray(metaRanges[m], metaRanges[m + 1]));
            m += 2;
        }
        if (chain.has(start)) {
            parts.push(buf.subarray(start, msgIdx[i + 1]));
        }
    }
    while (m < metaRanges.length) {
        parts.push(buf.subarray(metaRanges[m], metaRanges[m + 1]));
        m += 2;
    }
    return Buffer.concat(parts);
}
/**
 * Loads all messages, summaries, and file history snapshots from a transcript file.
 * Returns the messages, summaries, custom titles, tags, file history snapshots, and attribution snapshots.
 */
function loadTranscriptFile(filePath, opts) {
    return __awaiter(this, void 0, void 0, function () {
        var messages, summaries, customTitles, tags, agentNames, agentColors, agentSettings, prNumbers, prUrls, prRepositories, modes, worktreeStates, fileHistorySnapshots, attributionSnapshots, contentReplacements, agentContentReplacements, contextCollapseCommits, contextCollapseSnapshot, buf, metadataLines, hasPreservedSegment, size, scan, _a, metaEntries, _i, metaEntries_1, entry, entries, progressBridge, _b, entries_2, entry, parent_2, existing, existing, _c, allMessages, parentUuids, terminalMessages, leafUuids, hasCycle, hasUserAssistantChild, _d, allMessages_1, msg, _e, terminalMessages_1, terminal, seen, current, _f, terminalMessages_2, terminal, seen, current;
        var _g, _h, _j, _k;
        return __generator(this, function (_l) {
            switch (_l.label) {
                case 0:
                    messages = new Map();
                    summaries = new Map();
                    customTitles = new Map();
                    tags = new Map();
                    agentNames = new Map();
                    agentColors = new Map();
                    agentSettings = new Map();
                    prNumbers = new Map();
                    prUrls = new Map();
                    prRepositories = new Map();
                    modes = new Map();
                    worktreeStates = new Map();
                    fileHistorySnapshots = new Map();
                    attributionSnapshots = new Map();
                    contentReplacements = new Map();
                    agentContentReplacements = new Map();
                    contextCollapseCommits = [];
                    _l.label = 1;
                case 1:
                    _l.trys.push([1, 9, , 10]);
                    buf = null;
                    metadataLines = null;
                    hasPreservedSegment = false;
                    if (!!(0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_DISABLE_PRECOMPACT_SKIP)) return [3 /*break*/, 5];
                    return [4 /*yield*/, (0, promises_1.stat)(filePath)];
                case 2:
                    size = (_l.sent()).size;
                    if (!(size > sessionStoragePortable_js_1.SKIP_PRECOMPACT_THRESHOLD)) return [3 /*break*/, 5];
                    return [4 /*yield*/, (0, sessionStoragePortable_js_1.readTranscriptForLoad)(filePath, size)];
                case 3:
                    scan = _l.sent();
                    buf = scan.postBoundaryBuf;
                    hasPreservedSegment = scan.hasPreservedSegment;
                    if (!(scan.boundaryStartOffset > 0)) return [3 /*break*/, 5];
                    return [4 /*yield*/, scanPreBoundaryMetadata(filePath, scan.boundaryStartOffset)];
                case 4:
                    metadataLines = _l.sent();
                    _l.label = 5;
                case 5:
                    if (!(buf !== null && buf !== void 0)) return [3 /*break*/, 6];
                    _a = buf;
                    return [3 /*break*/, 8];
                case 6: return [4 /*yield*/, (0, promises_1.readFile)(filePath)
                    // For large buffers (which here means readTranscriptForLoad output with
                    // attr-snaps already stripped at the fd level — the <5MB readFile path
                    // falls through the size gate below), the dominant cost is parsing dead
                    // fork branches that buildConversationChain would discard anyway. Skip
                    // when the caller needs all
                    // leaves (loadAllLogsFromSessionFile for /insights picks the branch with
                    // most user messages, not the latest), when the boundary has a
                    // preservedSegment (those messages keep their pre-compact parentUuid on
                    // disk -- applyPreservedSegmentRelinks splices them in-memory AFTER
                    // parse, so a pre-parse chain walk would drop them as orphans), and when
                    // CLAUDE_CODE_DISABLE_PRECOMPACT_SKIP is set (that kill switch means
                    // "load everything, skip nothing"; this is another skip-before-parse
                    // optimization and the scan it depends on for hasPreservedSegment did
                    // not run).
                ];
                case 7:
                    _a = (buf = _l.sent());
                    _l.label = 8;
                case 8:
                    _a;
                    // For large buffers (which here means readTranscriptForLoad output with
                    // attr-snaps already stripped at the fd level — the <5MB readFile path
                    // falls through the size gate below), the dominant cost is parsing dead
                    // fork branches that buildConversationChain would discard anyway. Skip
                    // when the caller needs all
                    // leaves (loadAllLogsFromSessionFile for /insights picks the branch with
                    // most user messages, not the latest), when the boundary has a
                    // preservedSegment (those messages keep their pre-compact parentUuid on
                    // disk -- applyPreservedSegmentRelinks splices them in-memory AFTER
                    // parse, so a pre-parse chain walk would drop them as orphans), and when
                    // CLAUDE_CODE_DISABLE_PRECOMPACT_SKIP is set (that kill switch means
                    // "load everything, skip nothing"; this is another skip-before-parse
                    // optimization and the scan it depends on for hasPreservedSegment did
                    // not run).
                    if (!(opts === null || opts === void 0 ? void 0 : opts.keepAllLeaves) &&
                        !hasPreservedSegment &&
                        !(0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_DISABLE_PRECOMPACT_SKIP) &&
                        buf.length > sessionStoragePortable_js_1.SKIP_PRECOMPACT_THRESHOLD) {
                        buf = walkChainBeforeParse(buf);
                    }
                    // First pass: process metadata-only lines collected during the boundary scan.
                    // These populate the session-scoped maps (agentSettings, modes, prNumbers,
                    // etc.) for entries written before the compact boundary. Any overlap with
                    // the post-boundary buffer is harmless — later values overwrite earlier ones.
                    if (metadataLines && metadataLines.length > 0) {
                        metaEntries = (0, json_js_1.parseJSONL)(Buffer.from(metadataLines.join('\n')));
                        for (_i = 0, metaEntries_1 = metaEntries; _i < metaEntries_1.length; _i++) {
                            entry = metaEntries_1[_i];
                            if (entry.type === 'summary' && entry.leafUuid) {
                                summaries.set(entry.leafUuid, entry.summary);
                            }
                            else if (entry.type === 'custom-title' && entry.sessionId) {
                                customTitles.set(entry.sessionId, entry.customTitle);
                            }
                            else if (entry.type === 'tag' && entry.sessionId) {
                                tags.set(entry.sessionId, entry.tag);
                            }
                            else if (entry.type === 'agent-name' && entry.sessionId) {
                                agentNames.set(entry.sessionId, entry.agentName);
                            }
                            else if (entry.type === 'agent-color' && entry.sessionId) {
                                agentColors.set(entry.sessionId, entry.agentColor);
                            }
                            else if (entry.type === 'agent-setting' && entry.sessionId) {
                                agentSettings.set(entry.sessionId, entry.agentSetting);
                            }
                            else if (entry.type === 'mode' && entry.sessionId) {
                                modes.set(entry.sessionId, entry.mode);
                            }
                            else if (entry.type === 'worktree-state' && entry.sessionId) {
                                worktreeStates.set(entry.sessionId, entry.worktreeSession);
                            }
                            else if (entry.type === 'pr-link' && entry.sessionId) {
                                prNumbers.set(entry.sessionId, entry.prNumber);
                                prUrls.set(entry.sessionId, entry.prUrl);
                                prRepositories.set(entry.sessionId, entry.prRepository);
                            }
                        }
                    }
                    entries = (0, json_js_1.parseJSONL)(buf);
                    progressBridge = new Map();
                    for (_b = 0, entries_2 = entries; _b < entries_2.length; _b++) {
                        entry = entries_2[_b];
                        // Legacy progress check runs before the Entry-typed else-if chain —
                        // progress is not in the Entry union, so checking it after TypeScript
                        // has narrowed `entry` intersects to `never`.
                        if (isLegacyProgressEntry(entry)) {
                            parent_2 = entry.parentUuid;
                            progressBridge.set(entry.uuid, parent_2 && progressBridge.has(parent_2)
                                ? ((_g = progressBridge.get(parent_2)) !== null && _g !== void 0 ? _g : null)
                                : parent_2);
                            continue;
                        }
                        if (isTranscriptMessage(entry)) {
                            if (entry.parentUuid && progressBridge.has(entry.parentUuid)) {
                                entry.parentUuid = (_h = progressBridge.get(entry.parentUuid)) !== null && _h !== void 0 ? _h : null;
                            }
                            messages.set(entry.uuid, entry);
                            // Compact boundary: prior marble-origami-commit entries reference
                            // messages that won't be in the post-boundary chain. The >5MB
                            // backward-scan path discards them naturally by never reading the
                            // pre-boundary bytes; the <5MB path reads everything, so discard
                            // here. Without this, getStats().collapsedSpans in /context
                            // overcounts (projectView silently skips the stale commits but
                            // they're still in the log).
                            if ((0, messages_js_1.isCompactBoundaryMessage)(entry)) {
                                contextCollapseCommits.length = 0;
                                contextCollapseSnapshot = undefined;
                            }
                        }
                        else if (entry.type === 'summary' && entry.leafUuid) {
                            summaries.set(entry.leafUuid, entry.summary);
                        }
                        else if (entry.type === 'custom-title' && entry.sessionId) {
                            customTitles.set(entry.sessionId, entry.customTitle);
                        }
                        else if (entry.type === 'tag' && entry.sessionId) {
                            tags.set(entry.sessionId, entry.tag);
                        }
                        else if (entry.type === 'agent-name' && entry.sessionId) {
                            agentNames.set(entry.sessionId, entry.agentName);
                        }
                        else if (entry.type === 'agent-color' && entry.sessionId) {
                            agentColors.set(entry.sessionId, entry.agentColor);
                        }
                        else if (entry.type === 'agent-setting' && entry.sessionId) {
                            agentSettings.set(entry.sessionId, entry.agentSetting);
                        }
                        else if (entry.type === 'mode' && entry.sessionId) {
                            modes.set(entry.sessionId, entry.mode);
                        }
                        else if (entry.type === 'worktree-state' && entry.sessionId) {
                            worktreeStates.set(entry.sessionId, entry.worktreeSession);
                        }
                        else if (entry.type === 'pr-link' && entry.sessionId) {
                            prNumbers.set(entry.sessionId, entry.prNumber);
                            prUrls.set(entry.sessionId, entry.prUrl);
                            prRepositories.set(entry.sessionId, entry.prRepository);
                        }
                        else if (entry.type === 'file-history-snapshot') {
                            fileHistorySnapshots.set(entry.messageId, entry);
                        }
                        else if (entry.type === 'attribution-snapshot') {
                            attributionSnapshots.set(entry.messageId, entry);
                        }
                        else if (entry.type === 'content-replacement') {
                            // Subagent decisions key by agentId (sidechain resume); main-thread
                            // decisions key by sessionId (/resume).
                            if (entry.agentId) {
                                existing = (_j = agentContentReplacements.get(entry.agentId)) !== null && _j !== void 0 ? _j : [];
                                agentContentReplacements.set(entry.agentId, existing);
                                existing.push.apply(existing, entry.replacements);
                            }
                            else {
                                existing = (_k = contentReplacements.get(entry.sessionId)) !== null && _k !== void 0 ? _k : [];
                                contentReplacements.set(entry.sessionId, existing);
                                existing.push.apply(existing, entry.replacements);
                            }
                        }
                        else if (entry.type === 'marble-origami-commit') {
                            contextCollapseCommits.push(entry);
                        }
                        else if (entry.type === 'marble-origami-snapshot') {
                            contextCollapseSnapshot = entry;
                        }
                    }
                    return [3 /*break*/, 10];
                case 9:
                    _c = _l.sent();
                    return [3 /*break*/, 10];
                case 10:
                    applyPreservedSegmentRelinks(messages);
                    applySnipRemovals(messages);
                    allMessages = __spreadArray([], messages.values(), true);
                    parentUuids = new Set(allMessages
                        .map(function (msg) { return msg.parentUuid; })
                        .filter(function (uuid) { return uuid !== null; }));
                    terminalMessages = allMessages.filter(function (msg) { return !parentUuids.has(msg.uuid); });
                    leafUuids = new Set();
                    hasCycle = false;
                    if ((0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_pebble_leaf_prune', false)) {
                        hasUserAssistantChild = new Set();
                        for (_d = 0, allMessages_1 = allMessages; _d < allMessages_1.length; _d++) {
                            msg = allMessages_1[_d];
                            if (msg.parentUuid && (msg.type === 'user' || msg.type === 'assistant')) {
                                hasUserAssistantChild.add(msg.parentUuid);
                            }
                        }
                        // For each terminal message, walk back to find the nearest user/assistant ancestor.
                        // Skip ancestors that already have user/assistant children - those are mid-conversation
                        // nodes where the conversation continued (e.g., an assistant tool_use message whose
                        // progress child is terminal, but whose tool_result child continues the conversation).
                        for (_e = 0, terminalMessages_1 = terminalMessages; _e < terminalMessages_1.length; _e++) {
                            terminal = terminalMessages_1[_e];
                            seen = new Set();
                            current = terminal;
                            while (current) {
                                if (seen.has(current.uuid)) {
                                    hasCycle = true;
                                    break;
                                }
                                seen.add(current.uuid);
                                if (current.type === 'user' || current.type === 'assistant') {
                                    if (!hasUserAssistantChild.has(current.uuid)) {
                                        leafUuids.add(current.uuid);
                                    }
                                    break;
                                }
                                current = current.parentUuid
                                    ? messages.get(current.parentUuid)
                                    : undefined;
                            }
                        }
                    }
                    else {
                        // Original leaf computation: walk back from terminal messages to find
                        // the nearest user/assistant ancestor unconditionally
                        for (_f = 0, terminalMessages_2 = terminalMessages; _f < terminalMessages_2.length; _f++) {
                            terminal = terminalMessages_2[_f];
                            seen = new Set();
                            current = terminal;
                            while (current) {
                                if (seen.has(current.uuid)) {
                                    hasCycle = true;
                                    break;
                                }
                                seen.add(current.uuid);
                                if (current.type === 'user' || current.type === 'assistant') {
                                    leafUuids.add(current.uuid);
                                    break;
                                }
                                current = current.parentUuid
                                    ? messages.get(current.parentUuid)
                                    : undefined;
                            }
                        }
                    }
                    if (hasCycle) {
                        (0, index_js_1.logEvent)('tengu_transcript_parent_cycle', {});
                    }
                    return [2 /*return*/, {
                            messages: messages,
                            summaries: summaries,
                            customTitles: customTitles,
                            tags: tags,
                            agentNames: agentNames,
                            agentColors: agentColors,
                            agentSettings: agentSettings,
                            prNumbers: prNumbers,
                            prUrls: prUrls,
                            prRepositories: prRepositories,
                            modes: modes,
                            worktreeStates: worktreeStates,
                            fileHistorySnapshots: fileHistorySnapshots,
                            attributionSnapshots: attributionSnapshots,
                            contentReplacements: contentReplacements,
                            agentContentReplacements: agentContentReplacements,
                            contextCollapseCommits: contextCollapseCommits,
                            contextCollapseSnapshot: contextCollapseSnapshot,
                            leafUuids: leafUuids,
                        }];
            }
        });
    });
}
/**
 * Loads all messages, summaries, file history snapshots, and attribution snapshots from a specific session file.
 */
function loadSessionFile(sessionId) {
    return __awaiter(this, void 0, void 0, function () {
        var sessionFile;
        var _a;
        return __generator(this, function (_b) {
            sessionFile = (0, path_1.join)((_a = (0, state_js_1.getSessionProjectDir)()) !== null && _a !== void 0 ? _a : (0, exports.getProjectDir)((0, state_js_1.getOriginalCwd)()), "".concat(sessionId, ".jsonl"));
            return [2 /*return*/, loadTranscriptFile(sessionFile)];
        });
    });
}
/**
 * Gets message UUIDs for a specific session without loading all sessions.
 * Memoized to avoid re-reading the same session file multiple times.
 */
var getSessionMessages = (0, memoize_js_1.default)(function (sessionId) { return __awaiter(void 0, void 0, void 0, function () {
    var messages;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, loadSessionFile(sessionId)];
            case 1:
                messages = (_a.sent()).messages;
                return [2 /*return*/, new Set(messages.keys())];
        }
    });
}); }, function (sessionId) { return sessionId; });
/**
 * Clear the memoized session messages cache.
 * Call after compaction when old message UUIDs are no longer valid.
 */
function clearSessionMessagesCache() {
    var _a, _b;
    (_b = (_a = getSessionMessages.cache).clear) === null || _b === void 0 ? void 0 : _b.call(_a);
}
/**
 * Check if a message UUID exists in the session storage
 */
function doesMessageExistInSession(sessionId, messageUuid) {
    return __awaiter(this, void 0, void 0, function () {
        var messageSet;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getSessionMessages(sessionId)];
                case 1:
                    messageSet = _a.sent();
                    return [2 /*return*/, messageSet.has(messageUuid)];
            }
        });
    });
}
function getLastSessionLog(sessionId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, messages, summaries, customTitles, tags, agentSettings, worktreeStates, fileHistorySnapshots, attributionSnapshots, contentReplacements, contextCollapseCommits, contextCollapseSnapshot, lastMessage, transcript, summary, customTitle, tag, agentSetting;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, loadSessionFile(sessionId)];
                case 1:
                    _a = _c.sent(), messages = _a.messages, summaries = _a.summaries, customTitles = _a.customTitles, tags = _a.tags, agentSettings = _a.agentSettings, worktreeStates = _a.worktreeStates, fileHistorySnapshots = _a.fileHistorySnapshots, attributionSnapshots = _a.attributionSnapshots, contentReplacements = _a.contentReplacements, contextCollapseCommits = _a.contextCollapseCommits, contextCollapseSnapshot = _a.contextCollapseSnapshot;
                    if (messages.size === 0)
                        return [2 /*return*/, null
                            // Prime getSessionMessages cache so recordTranscript (called after REPL
                            // mount on --resume) skips a second full file load. -170~227ms on large sessions.
                            // Guard: only prime if cache is empty. Mid-session callers (e.g. IssueFeedback)
                            // may call getLastSessionLog on the current session — overwriting a live cache
                            // with a stale disk snapshot would lose unflushed UUIDs and break dedup.
                        ];
                    // Prime getSessionMessages cache so recordTranscript (called after REPL
                    // mount on --resume) skips a second full file load. -170~227ms on large sessions.
                    // Guard: only prime if cache is empty. Mid-session callers (e.g. IssueFeedback)
                    // may call getLastSessionLog on the current session — overwriting a live cache
                    // with a stale disk snapshot would lose unflushed UUIDs and break dedup.
                    if (!getSessionMessages.cache.has(sessionId)) {
                        getSessionMessages.cache.set(sessionId, Promise.resolve(new Set(messages.keys())));
                    }
                    lastMessage = findLatestMessage(messages.values(), function (m) { return !m.isSidechain; });
                    if (!lastMessage)
                        return [2 /*return*/, null
                            // Build the transcript chain from the last message
                        ];
                    transcript = buildConversationChain(messages, lastMessage);
                    summary = summaries.get(lastMessage.uuid);
                    customTitle = customTitles.get(lastMessage.sessionId);
                    tag = tags.get(lastMessage.sessionId);
                    agentSetting = agentSettings.get(sessionId);
                    return [2 /*return*/, __assign(__assign({}, convertToLogOption(transcript, 0, summary, customTitle, buildFileHistorySnapshotChain(fileHistorySnapshots, transcript), tag, getTranscriptPathForSession(sessionId), buildAttributionSnapshotChain(attributionSnapshots, transcript), agentSetting, (_b = contentReplacements.get(sessionId)) !== null && _b !== void 0 ? _b : [])), { worktreeSession: worktreeStates.get(sessionId), contextCollapseCommits: contextCollapseCommits.filter(function (e) { return e.sessionId === sessionId; }), contextCollapseSnapshot: (contextCollapseSnapshot === null || contextCollapseSnapshot === void 0 ? void 0 : contextCollapseSnapshot.sessionId) === sessionId
                                ? contextCollapseSnapshot
                                : undefined })];
            }
        });
    });
}
/**
 * Loads the list of message logs
 * @param limit Optional limit on number of session files to load
 * @returns List of message logs sorted by date
 */
function loadMessageLogs(limit) {
    return __awaiter(this, void 0, void 0, function () {
        var sessionLogs, enriched, sorted;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetchLogs(limit)
                    // fetchLogs returns lite (stat-only) logs — enrich them to get metadata.
                    // enrichLogs already filters out sidechains, empty sessions, etc.
                ];
                case 1:
                    sessionLogs = _a.sent();
                    return [4 /*yield*/, enrichLogs(sessionLogs, 0, sessionLogs.length)
                        // enrichLogs returns fresh unshared objects — mutate in place to avoid
                        // re-spreading every 30-field LogOption just to renumber the index.
                    ];
                case 2:
                    enriched = (_a.sent()).logs;
                    sorted = (0, logs_js_1.sortLogs)(enriched);
                    sorted.forEach(function (log, i) {
                        log.value = i;
                    });
                    return [2 /*return*/, sorted];
            }
        });
    });
}
/**
 * Loads message logs from all project directories.
 * @param limit Optional limit on number of session files to load per project (used when no index exists)
 * @returns List of message logs sorted by date
 */
function loadAllProjectsMessageLogs(limit, options) {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (options === null || options === void 0 ? void 0 : options.skipIndex) {
                        // Load all sessions with full message data (e.g. for /insights analysis)
                        return [2 /*return*/, loadAllProjectsMessageLogsFull(limit)];
                    }
                    return [4 /*yield*/, loadAllProjectsMessageLogsProgressive(limit, (_a = options === null || options === void 0 ? void 0 : options.initialEnrichCount) !== null && _a !== void 0 ? _a : INITIAL_ENRICH_COUNT)];
                case 1:
                    result = _b.sent();
                    return [2 /*return*/, result.logs];
            }
        });
    });
}
function loadAllProjectsMessageLogsFull(limit) {
    return __awaiter(this, void 0, void 0, function () {
        var projectsDir, dirents, _a, projectDirs, logsPerProject, allLogs, deduped, _i, allLogs_1, log, key, existing, sorted;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    projectsDir = getProjectsDir();
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readdir)(projectsDir, { withFileTypes: true })];
                case 2:
                    dirents = _d.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = _d.sent();
                    return [2 /*return*/, []];
                case 4:
                    projectDirs = dirents
                        .filter(function (dirent) { return dirent.isDirectory(); })
                        .map(function (dirent) { return (0, path_1.join)(projectsDir, dirent.name); });
                    return [4 /*yield*/, Promise.all(projectDirs.map(function (projectDir) { return getLogsWithoutIndex(projectDir, limit); }))];
                case 5:
                    logsPerProject = _d.sent();
                    allLogs = logsPerProject.flat();
                    deduped = new Map();
                    for (_i = 0, allLogs_1 = allLogs; _i < allLogs_1.length; _i++) {
                        log = allLogs_1[_i];
                        key = "".concat((_b = log.sessionId) !== null && _b !== void 0 ? _b : '', ":").concat((_c = log.leafUuid) !== null && _c !== void 0 ? _c : '');
                        existing = deduped.get(key);
                        if (!existing || log.modified.getTime() > existing.modified.getTime()) {
                            deduped.set(key, log);
                        }
                    }
                    sorted = (0, logs_js_1.sortLogs)(__spreadArray([], deduped.values(), true));
                    sorted.forEach(function (log, i) {
                        log.value = i;
                    });
                    return [2 /*return*/, sorted];
            }
        });
    });
}
function loadAllProjectsMessageLogsProgressive(limit_1) {
    return __awaiter(this, arguments, void 0, function (limit, initialEnrichCount) {
        var projectsDir, dirents, _a, projectDirs, rawLogs, _i, projectDirs_1, projectDir, _b, _c, _d, sorted, _e, logs, nextIndex;
        if (initialEnrichCount === void 0) { initialEnrichCount = INITIAL_ENRICH_COUNT; }
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    projectsDir = getProjectsDir();
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readdir)(projectsDir, { withFileTypes: true })];
                case 2:
                    dirents = _f.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = _f.sent();
                    return [2 /*return*/, { logs: [], allStatLogs: [], nextIndex: 0 }];
                case 4:
                    projectDirs = dirents
                        .filter(function (dirent) { return dirent.isDirectory(); })
                        .map(function (dirent) { return (0, path_1.join)(projectsDir, dirent.name); });
                    rawLogs = [];
                    _i = 0, projectDirs_1 = projectDirs;
                    _f.label = 5;
                case 5:
                    if (!(_i < projectDirs_1.length)) return [3 /*break*/, 8];
                    projectDir = projectDirs_1[_i];
                    _c = (_b = rawLogs.push).apply;
                    _d = [rawLogs];
                    return [4 /*yield*/, getSessionFilesLite(projectDir, limit)];
                case 6:
                    _c.apply(_b, _d.concat([(_f.sent())]));
                    _f.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 5];
                case 8:
                    sorted = deduplicateLogsBySessionId(rawLogs);
                    return [4 /*yield*/, enrichLogs(sorted, 0, initialEnrichCount)
                        // enrichLogs returns fresh unshared objects — safe to mutate in place
                    ];
                case 9:
                    _e = _f.sent(), logs = _e.logs, nextIndex = _e.nextIndex;
                    // enrichLogs returns fresh unshared objects — safe to mutate in place
                    logs.forEach(function (log, i) {
                        log.value = i;
                    });
                    return [2 /*return*/, { logs: logs, allStatLogs: sorted, nextIndex: nextIndex }];
            }
        });
    });
}
function loadSameRepoMessageLogs(worktreePaths_1, limit_1) {
    return __awaiter(this, arguments, void 0, function (worktreePaths, limit, initialEnrichCount) {
        var result;
        if (initialEnrichCount === void 0) { initialEnrichCount = INITIAL_ENRICH_COUNT; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadSameRepoMessageLogsProgressive(worktreePaths, limit, initialEnrichCount)];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result.logs];
            }
        });
    });
}
function loadSameRepoMessageLogsProgressive(worktreePaths_1, limit_1) {
    return __awaiter(this, arguments, void 0, function (worktreePaths, limit, initialEnrichCount) {
        var allStatLogs, _a, logs, nextIndex;
        if (initialEnrichCount === void 0) { initialEnrichCount = INITIAL_ENRICH_COUNT; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    (0, debug_js_1.logForDebugging)("/resume: loading sessions for cwd=".concat((0, state_js_1.getOriginalCwd)(), ", worktrees=[").concat(worktreePaths.join(', '), "]"));
                    return [4 /*yield*/, getStatOnlyLogsForWorktrees(worktreePaths, limit)];
                case 1:
                    allStatLogs = _b.sent();
                    (0, debug_js_1.logForDebugging)("/resume: found ".concat(allStatLogs.length, " session files on disk"));
                    return [4 /*yield*/, enrichLogs(allStatLogs, 0, initialEnrichCount)
                        // enrichLogs returns fresh unshared objects — safe to mutate in place
                    ];
                case 2:
                    _a = _b.sent(), logs = _a.logs, nextIndex = _a.nextIndex;
                    // enrichLogs returns fresh unshared objects — safe to mutate in place
                    logs.forEach(function (log, i) {
                        log.value = i;
                    });
                    return [2 /*return*/, { logs: logs, allStatLogs: allStatLogs, nextIndex: nextIndex }];
            }
        });
    });
}
/**
 * Gets stat-only logs for worktree paths (no file reads).
 */
function getStatOnlyLogsForWorktrees(worktreePaths, limit) {
    return __awaiter(this, void 0, void 0, function () {
        var projectsDir, cwd, projectDir, caseInsensitive, indexed, allLogs, seenDirs, allDirents, e_8, projectDir, _i, allDirents_1, dirent, dirName, _a, indexed_1, _b, wtPath, prefix, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    projectsDir = getProjectsDir();
                    if (worktreePaths.length <= 1) {
                        cwd = (0, state_js_1.getOriginalCwd)();
                        projectDir = (0, exports.getProjectDir)(cwd);
                        return [2 /*return*/, getSessionFilesLite(projectDir, undefined, cwd)];
                    }
                    caseInsensitive = process.platform === 'win32';
                    indexed = worktreePaths.map(function (wt) {
                        var sanitized = (0, path_js_1.sanitizePath)(wt);
                        return {
                            path: wt,
                            prefix: caseInsensitive ? sanitized.toLowerCase() : sanitized,
                        };
                    });
                    indexed.sort(function (a, b) { return b.prefix.length - a.prefix.length; });
                    allLogs = [];
                    seenDirs = new Set();
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readdir)(projectsDir, { withFileTypes: true })];
                case 2:
                    allDirents = _f.sent();
                    return [3 /*break*/, 4];
                case 3:
                    e_8 = _f.sent();
                    // Fall back to current project
                    (0, debug_js_1.logForDebugging)("Failed to read projects dir ".concat(projectsDir, ", falling back to current project: ").concat(e_8));
                    projectDir = (0, exports.getProjectDir)((0, state_js_1.getOriginalCwd)());
                    return [2 /*return*/, getSessionFilesLite(projectDir, limit, (0, state_js_1.getOriginalCwd)())];
                case 4:
                    _i = 0, allDirents_1 = allDirents;
                    _f.label = 5;
                case 5:
                    if (!(_i < allDirents_1.length)) return [3 /*break*/, 10];
                    dirent = allDirents_1[_i];
                    if (!dirent.isDirectory())
                        return [3 /*break*/, 9];
                    dirName = caseInsensitive ? dirent.name.toLowerCase() : dirent.name;
                    if (seenDirs.has(dirName))
                        return [3 /*break*/, 9];
                    _a = 0, indexed_1 = indexed;
                    _f.label = 6;
                case 6:
                    if (!(_a < indexed_1.length)) return [3 /*break*/, 9];
                    _b = indexed_1[_a], wtPath = _b.path, prefix = _b.prefix;
                    if (!(dirName === prefix || dirName.startsWith(prefix + '-'))) return [3 /*break*/, 8];
                    seenDirs.add(dirName);
                    _d = (_c = allLogs.push).apply;
                    _e = [allLogs];
                    return [4 /*yield*/, getSessionFilesLite((0, path_1.join)(projectsDir, dirent.name), undefined, wtPath)];
                case 7:
                    _d.apply(_c, _e.concat([(_f.sent())]));
                    return [3 /*break*/, 9];
                case 8:
                    _a++;
                    return [3 /*break*/, 6];
                case 9:
                    _i++;
                    return [3 /*break*/, 5];
                case 10: 
                // Deduplicate by sessionId — the same session can appear in multiple
                // worktree project dirs. Keep the entry with the newest modified time.
                return [2 /*return*/, deduplicateLogsBySessionId(allLogs)];
            }
        });
    });
}
/**
 * Retrieves the transcript for a specific agent by agentId.
 * Directly loads the agent-specific transcript file.
 * @param agentId The agent ID to search for
 * @returns The conversation chain and budget replacement records for the agent,
 *          or null if not found
 */
function getAgentTranscript(agentId) {
    return __awaiter(this, void 0, void 0, function () {
        var agentFile, _a, messages, agentContentReplacements, agentMessages, parentUuids_1, leafMessage, transcript, agentTranscript, _b;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    agentFile = getAgentTranscriptPath(agentId);
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, loadTranscriptFile(agentFile)
                        // Find messages with matching agentId
                    ];
                case 2:
                    _a = _d.sent(), messages = _a.messages, agentContentReplacements = _a.agentContentReplacements;
                    agentMessages = Array.from(messages.values()).filter(function (msg) { return msg.agentId === agentId && msg.isSidechain; });
                    if (agentMessages.length === 0) {
                        return [2 /*return*/, null];
                    }
                    parentUuids_1 = new Set(agentMessages.map(function (msg) { return msg.parentUuid; }));
                    leafMessage = findLatestMessage(agentMessages, function (msg) { return !parentUuids_1.has(msg.uuid); });
                    if (!leafMessage) {
                        return [2 /*return*/, null];
                    }
                    transcript = buildConversationChain(messages, leafMessage);
                    agentTranscript = transcript.filter(function (msg) { return msg.agentId === agentId; });
                    return [2 /*return*/, {
                            // Convert TranscriptMessage[] to Message[]
                            messages: agentTranscript.map(function (_a) {
                                var isSidechain = _a.isSidechain, parentUuid = _a.parentUuid, msg = __rest(_a, ["isSidechain", "parentUuid"]);
                                return msg;
                            }),
                            contentReplacements: (_c = agentContentReplacements.get(agentId)) !== null && _c !== void 0 ? _c : [],
                        }];
                case 3:
                    _b = _d.sent();
                    return [2 /*return*/, null];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Extract agent IDs from progress messages in the conversation.
 * Agent/skill progress messages have type 'progress' with data.type
 * 'agent_progress' or 'skill_progress' and data.agentId.
 * This captures sync agents that emit progress messages during execution.
 */
function extractAgentIdsFromMessages(messages) {
    var agentIds = [];
    for (var _i = 0, messages_7 = messages; _i < messages_7.length; _i++) {
        var message = messages_7[_i];
        if (message.type === 'progress' &&
            message.data &&
            typeof message.data === 'object' &&
            'type' in message.data &&
            (message.data.type === 'agent_progress' ||
                message.data.type === 'skill_progress') &&
            'agentId' in message.data &&
            typeof message.data.agentId === 'string') {
            agentIds.push(message.data.agentId);
        }
    }
    return (0, array_js_1.uniq)(agentIds);
}
/**
 * Extract teammate transcripts directly from AppState tasks.
 * In-process teammates store their messages in task.messages,
 * which is more reliable than loading from disk since each teammate turn
 * uses a random agentId for transcript storage.
 */
function extractTeammateTranscriptsFromTasks(tasks) {
    var _a;
    var transcripts = {};
    for (var _i = 0, _b = Object.values(tasks); _i < _b.length; _i++) {
        var task = _b[_i];
        if (task.type === 'in_process_teammate' &&
            ((_a = task.identity) === null || _a === void 0 ? void 0 : _a.agentId) &&
            task.messages &&
            task.messages.length > 0) {
            transcripts[task.identity.agentId] = task.messages;
        }
    }
    return transcripts;
}
/**
 * Load subagent transcripts for the given agent IDs
 */
function loadSubagentTranscripts(agentIds) {
    return __awaiter(this, void 0, void 0, function () {
        var results, transcripts, _i, results_1, result;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all(agentIds.map(function (agentId) { return __awaiter(_this, void 0, void 0, function () {
                        var result, _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, getAgentTranscript((0, ids_js_1.asAgentId)(agentId))];
                                case 1:
                                    result = _b.sent();
                                    if (result && result.messages.length > 0) {
                                        return [2 /*return*/, { agentId: agentId, transcript: result.messages }];
                                    }
                                    return [2 /*return*/, null];
                                case 2:
                                    _a = _b.sent();
                                    // Skip if transcript can't be loaded
                                    return [2 /*return*/, null];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); }))];
                case 1:
                    results = _a.sent();
                    transcripts = {};
                    for (_i = 0, results_1 = results; _i < results_1.length; _i++) {
                        result = results_1[_i];
                        if (result) {
                            transcripts[result.agentId] = result.transcript;
                        }
                    }
                    return [2 /*return*/, transcripts];
            }
        });
    });
}
// Globs the session's subagents dir directly — unlike AppState.tasks, this survives task eviction.
function loadAllSubagentTranscriptsFromDisk() {
    return __awaiter(this, void 0, void 0, function () {
        var subagentsDir, entries, _a, agentIds;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    subagentsDir = (0, path_1.join)((_b = (0, state_js_1.getSessionProjectDir)()) !== null && _b !== void 0 ? _b : (0, exports.getProjectDir)((0, state_js_1.getOriginalCwd)()), (0, state_js_1.getSessionId)(), 'subagents');
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readdir)(subagentsDir, { withFileTypes: true })];
                case 2:
                    entries = _c.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = _c.sent();
                    return [2 /*return*/, {}];
                case 4:
                    agentIds = entries
                        .filter(function (d) {
                        return d.isFile() && d.name.startsWith('agent-') && d.name.endsWith('.jsonl');
                    })
                        .map(function (d) { return d.name.slice('agent-'.length, -'.jsonl'.length); });
                    return [2 /*return*/, loadSubagentTranscripts(agentIds)];
            }
        });
    });
}
// Exported so useLogMessages can sync-compute the last loggable uuid
// without awaiting recordTranscript's return value (race-free hint tracking).
function isLoggableMessage(m) {
    if (m.type === 'progress')
        return false;
    // IMPORTANT: We deliberately filter out most attachments for non-ants because
    // they have sensitive info for training that we don't want exposed to the public.
    // When enabled, we allow hook_additional_context through since it contains
    // user-configured hook output that is useful for session context on resume.
    if (m.type === 'attachment' && getUserType() !== 'ant') {
        if (m.attachment.type === 'hook_additional_context' &&
            (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_SAVE_HOOK_ADDITIONAL_CONTEXT)) {
            return true;
        }
        return false;
    }
    return true;
}
function collectReplIds(messages) {
    var ids = new Set();
    for (var _i = 0, messages_8 = messages; _i < messages_8.length; _i++) {
        var m = messages_8[_i];
        if (m.type === 'assistant' && Array.isArray(m.message.content)) {
            for (var _a = 0, _b = m.message.content; _a < _b.length; _a++) {
                var b = _b[_a];
                if (b.type === 'tool_use' && b.name === constants_js_1.REPL_TOOL_NAME) {
                    ids.add(b.id);
                }
            }
        }
    }
    return ids;
}
/**
 * For external users, make REPL invisible in the persisted transcript: strip
 * REPL tool_use/tool_result pairs and promote isVirtual messages to real. On
 * --resume the model then sees a coherent native-tool-call history (assistant
 * called Bash, got result, called Read, got result) without the REPL wrapper.
 * Ant transcripts keep the wrapper so /share training data sees REPL usage.
 *
 * replIds is pre-collected from the FULL session array, not the slice being
 * transformed — recordTranscript receives incremental slices where the REPL
 * tool_use (earlier render) and its tool_result (later render, after async
 * execution) land in separate calls. A fresh per-call Set would miss the id
 * and leave an orphaned tool_result on disk.
 */
function transformMessagesForExternalTranscript(messages, replIds) {
    return messages.flatMap(function (m) {
        if (m.type === 'assistant' && Array.isArray(m.message.content)) {
            var content = m.message.content;
            var hasRepl = content.some(function (b) { return b.type === 'tool_use' && b.name === constants_js_1.REPL_TOOL_NAME; });
            var filtered = hasRepl
                ? content.filter(function (b) { return !(b.type === 'tool_use' && b.name === constants_js_1.REPL_TOOL_NAME); })
                : content;
            if (filtered.length === 0)
                return [];
            if (m.isVirtual) {
                var _omit = m.isVirtual, rest = __rest(m, ["isVirtual"]);
                return [__assign(__assign({}, rest), { message: __assign(__assign({}, m.message), { content: filtered }) })];
            }
            if (filtered !== content) {
                return [__assign(__assign({}, m), { message: __assign(__assign({}, m.message), { content: filtered }) })];
            }
            return [m];
        }
        if (m.type === 'user' && Array.isArray(m.message.content)) {
            var content = m.message.content;
            var hasRepl = content.some(function (b) { return b.type === 'tool_result' && replIds.has(b.tool_use_id); });
            var filtered = hasRepl
                ? content.filter(function (b) { return !(b.type === 'tool_result' && replIds.has(b.tool_use_id)); })
                : content;
            if (filtered.length === 0)
                return [];
            if (m.isVirtual) {
                var _omit = m.isVirtual, rest = __rest(m, ["isVirtual"]);
                return [__assign(__assign({}, rest), { message: __assign(__assign({}, m.message), { content: filtered }) })];
            }
            if (filtered !== content) {
                return [__assign(__assign({}, m), { message: __assign(__assign({}, m.message), { content: filtered }) })];
            }
            return [m];
        }
        // string-content user, system, attachment
        if ('isVirtual' in m && m.isVirtual) {
            var _omit = m.isVirtual, rest = __rest(m, ["isVirtual"]);
            return [rest];
        }
        return [m];
    });
}
function cleanMessagesForLogging(messages, allMessages) {
    if (allMessages === void 0) { allMessages = messages; }
    var filtered = messages.filter(isLoggableMessage);
    return getUserType() !== 'ant'
        ? transformMessagesForExternalTranscript(filtered, collectReplIds(allMessages))
        : filtered;
}
/**
 * Gets a log by its index
 * @param index Index in the sorted list of logs (0-based)
 * @returns Log data or null if not found
 */
function getLogByIndex(index) {
    return __awaiter(this, void 0, void 0, function () {
        var logs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, loadMessageLogs()];
                case 1:
                    logs = _a.sent();
                    return [2 /*return*/, logs[index] || null];
            }
        });
    });
}
/**
 * Looks up unresolved tool uses in the transcript by tool_use_id.
 * Returns the assistant message containing the tool_use, or null if not found
 * or the tool call already has a tool_result.
 */
function findUnresolvedToolUse(toolUseId) {
    return __awaiter(this, void 0, void 0, function () {
        var transcriptPath, messages, toolUseMessage, _i, _a, message, content, _b, content_2, block, content, _c, content_3, block, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 2, , 3]);
                    transcriptPath = getTranscriptPath();
                    return [4 /*yield*/, loadTranscriptFile(transcriptPath)];
                case 1:
                    messages = (_e.sent()).messages;
                    toolUseMessage = null;
                    // Find the tool use but make sure there's not also a result
                    for (_i = 0, _a = messages.values(); _i < _a.length; _i++) {
                        message = _a[_i];
                        if (message.type === 'assistant') {
                            content = message.message.content;
                            if (Array.isArray(content)) {
                                for (_b = 0, content_2 = content; _b < content_2.length; _b++) {
                                    block = content_2[_b];
                                    if (block.type === 'tool_use' && block.id === toolUseId) {
                                        toolUseMessage = message;
                                        break;
                                    }
                                }
                            }
                        }
                        else if (message.type === 'user') {
                            content = message.message.content;
                            if (Array.isArray(content)) {
                                for (_c = 0, content_3 = content; _c < content_3.length; _c++) {
                                    block = content_3[_c];
                                    if (block.type === 'tool_result' &&
                                        block.tool_use_id === toolUseId) {
                                        // Found tool result, bail out
                                        return [2 /*return*/, null];
                                    }
                                }
                            }
                        }
                    }
                    return [2 /*return*/, toolUseMessage];
                case 2:
                    _d = _e.sent();
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Gets all session JSONL files in a project directory with their stats.
 * Returns a map of sessionId → {path, mtime, ctime, size}.
 * Stats are batched via Promise.all to avoid serial syscalls in the hot loop.
 */
function getSessionFilesWithMtime(projectDir) {
    return __awaiter(this, void 0, void 0, function () {
        var sessionFilesMap, dirents, _a, candidates, _i, dirents_1, dirent, sessionId;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    sessionFilesMap = new Map();
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.readdir)(projectDir, { withFileTypes: true })];
                case 2:
                    dirents = _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    // Directory doesn't exist - return empty map
                    return [2 /*return*/, sessionFilesMap];
                case 4:
                    candidates = [];
                    for (_i = 0, dirents_1 = dirents; _i < dirents_1.length; _i++) {
                        dirent = dirents_1[_i];
                        if (!dirent.isFile() || !dirent.name.endsWith('.jsonl'))
                            continue;
                        sessionId = (0, uuid_js_1.validateUuid)((0, path_1.basename)(dirent.name, '.jsonl'));
                        if (!sessionId)
                            continue;
                        candidates.push({ sessionId: sessionId, filePath: (0, path_1.join)(projectDir, dirent.name) });
                    }
                    return [4 /*yield*/, Promise.all(candidates.map(function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
                            var st, _c;
                            var sessionId = _b.sessionId, filePath = _b.filePath;
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0:
                                        _d.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, (0, promises_1.stat)(filePath)];
                                    case 1:
                                        st = _d.sent();
                                        sessionFilesMap.set(sessionId, {
                                            path: filePath,
                                            mtime: st.mtime.getTime(),
                                            ctime: st.birthtime.getTime(),
                                            size: st.size,
                                        });
                                        return [3 /*break*/, 3];
                                    case 2:
                                        _c = _d.sent();
                                        (0, debug_js_1.logForDebugging)("Failed to stat session file: ".concat(filePath));
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 5:
                    _b.sent();
                    return [2 /*return*/, sessionFilesMap];
            }
        });
    });
}
/**
 * Number of sessions to enrich on the initial load of the resume picker.
 * Each enrichment reads up to 128 KB per file (head + tail), so 50 sessions
 * means ~6.4 MB of I/O — fast on any modern filesystem while giving users
 * a much better initial view than the previous default of 10.
 */
var INITIAL_ENRICH_COUNT = 50;
/**
 * Loads all logs from a single session file with full message data.
 * Builds a LogOption for each leaf message in the file.
 */
function loadAllLogsFromSessionFile(sessionFile, projectPathOverride) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, messages, summaries, customTitles, tags, agentNames, agentColors, agentSettings, prNumbers, prUrls, prRepositories, modes, fileHistorySnapshots, attributionSnapshots, contentReplacements, leafUuids, leafMessages, childrenByParent, _i, _b, msg, siblings, logs, _c, leafMessages_1, leafMessage, chain, trailingMessages, firstMessage, sessionId;
        var _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0: return [4 /*yield*/, loadTranscriptFile(sessionFile, { keepAllLeaves: true })];
                case 1:
                    _a = _f.sent(), messages = _a.messages, summaries = _a.summaries, customTitles = _a.customTitles, tags = _a.tags, agentNames = _a.agentNames, agentColors = _a.agentColors, agentSettings = _a.agentSettings, prNumbers = _a.prNumbers, prUrls = _a.prUrls, prRepositories = _a.prRepositories, modes = _a.modes, fileHistorySnapshots = _a.fileHistorySnapshots, attributionSnapshots = _a.attributionSnapshots, contentReplacements = _a.contentReplacements, leafUuids = _a.leafUuids;
                    if (messages.size === 0)
                        return [2 /*return*/, []];
                    leafMessages = [];
                    childrenByParent = new Map();
                    for (_i = 0, _b = messages.values(); _i < _b.length; _i++) {
                        msg = _b[_i];
                        if (leafUuids.has(msg.uuid)) {
                            leafMessages.push(msg);
                        }
                        else if (msg.parentUuid) {
                            siblings = childrenByParent.get(msg.parentUuid);
                            if (siblings) {
                                siblings.push(msg);
                            }
                            else {
                                childrenByParent.set(msg.parentUuid, [msg]);
                            }
                        }
                    }
                    logs = [];
                    for (_c = 0, leafMessages_1 = leafMessages; _c < leafMessages_1.length; _c++) {
                        leafMessage = leafMessages_1[_c];
                        chain = buildConversationChain(messages, leafMessage);
                        if (chain.length === 0)
                            continue;
                        trailingMessages = childrenByParent.get(leafMessage.uuid);
                        if (trailingMessages) {
                            // ISO-8601 UTC timestamps are lexically sortable
                            trailingMessages.sort(function (a, b) {
                                return a.timestamp < b.timestamp ? -1 : a.timestamp > b.timestamp ? 1 : 0;
                            });
                            chain.push.apply(chain, trailingMessages);
                        }
                        firstMessage = chain[0];
                        sessionId = leafMessage.sessionId;
                        logs.push({
                            date: leafMessage.timestamp,
                            messages: removeExtraFields(chain),
                            fullPath: sessionFile,
                            value: 0,
                            created: new Date(firstMessage.timestamp),
                            modified: new Date(leafMessage.timestamp),
                            firstPrompt: extractFirstPrompt(chain),
                            messageCount: countVisibleMessages(chain),
                            isSidechain: (_d = firstMessage.isSidechain) !== null && _d !== void 0 ? _d : false,
                            sessionId: sessionId,
                            leafUuid: leafMessage.uuid,
                            summary: summaries.get(leafMessage.uuid),
                            customTitle: customTitles.get(sessionId),
                            tag: tags.get(sessionId),
                            agentName: agentNames.get(sessionId),
                            agentColor: agentColors.get(sessionId),
                            agentSetting: agentSettings.get(sessionId),
                            mode: modes.get(sessionId),
                            prNumber: prNumbers.get(sessionId),
                            prUrl: prUrls.get(sessionId),
                            prRepository: prRepositories.get(sessionId),
                            gitBranch: leafMessage.gitBranch,
                            projectPath: projectPathOverride !== null && projectPathOverride !== void 0 ? projectPathOverride : firstMessage.cwd,
                            fileHistorySnapshots: buildFileHistorySnapshotChain(fileHistorySnapshots, chain),
                            attributionSnapshots: buildAttributionSnapshotChain(attributionSnapshots, chain),
                            contentReplacements: (_e = contentReplacements.get(sessionId)) !== null && _e !== void 0 ? _e : [],
                        });
                    }
                    return [2 /*return*/, logs];
            }
        });
    });
}
/**
 * Gets logs by loading all session files fully, bypassing the session index.
 * Use this when you need full message data (e.g., for /insights analysis).

 */
function getLogsWithoutIndex(projectDir, limit) {
    return __awaiter(this, void 0, void 0, function () {
        var sessionFilesMap, filesToProcess, logs, _i, filesToProcess_1, fileInfo, fileLogOptions, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getSessionFilesWithMtime(projectDir)];
                case 1:
                    sessionFilesMap = _b.sent();
                    if (sessionFilesMap.size === 0)
                        return [2 /*return*/, []
                            // If limit specified, only load N most recent files by mtime
                        ];
                    if (limit && sessionFilesMap.size > limit) {
                        filesToProcess = __spreadArray([], sessionFilesMap.values(), true).sort(function (a, b) { return b.mtime - a.mtime; })
                            .slice(0, limit);
                    }
                    else {
                        filesToProcess = __spreadArray([], sessionFilesMap.values(), true);
                    }
                    logs = [];
                    _i = 0, filesToProcess_1 = filesToProcess;
                    _b.label = 2;
                case 2:
                    if (!(_i < filesToProcess_1.length)) return [3 /*break*/, 7];
                    fileInfo = filesToProcess_1[_i];
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, loadAllLogsFromSessionFile(fileInfo.path)];
                case 4:
                    fileLogOptions = _b.sent();
                    logs.push.apply(logs, fileLogOptions);
                    return [3 /*break*/, 6];
                case 5:
                    _a = _b.sent();
                    (0, debug_js_1.logForDebugging)("Failed to load session file: ".concat(fileInfo.path));
                    return [3 /*break*/, 6];
                case 6:
                    _i++;
                    return [3 /*break*/, 2];
                case 7: return [2 /*return*/, logs];
            }
        });
    });
}
/**
 * Reads the first and last ~64KB of a JSONL file and extracts lite metadata.
 *
 * Head (first 64KB): isSidechain, projectPath, teamName, firstPrompt.
 * Tail (last 64KB): customTitle, tag, PR link, latest gitBranch.
 *
 * Accepts a shared buffer to avoid per-file allocation overhead.
 */
function readLiteMetadata(filePath, fileSize, buf) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, head, tail, isSidechain, projectPath, teamName, agentSetting, firstPrompt, customTitle, summary, tag, gitBranch, prUrl, prRepository, prNumber, prNumStr, prNumMatch, afterColon, num;
        var _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0: return [4 /*yield*/, (0, sessionStoragePortable_js_1.readHeadAndTail)(filePath, fileSize, buf)];
                case 1:
                    _a = _f.sent(), head = _a.head, tail = _a.tail;
                    if (!head)
                        return [2 /*return*/, { firstPrompt: '', isSidechain: false }
                            // Extract stable metadata from the first line via string search.
                            // Works even when the first line is truncated (>64KB message).
                        ];
                    isSidechain = head.includes('"isSidechain":true') || head.includes('"isSidechain": true');
                    projectPath = (0, sessionStoragePortable_js_1.extractJsonStringField)(head, 'cwd');
                    teamName = (0, sessionStoragePortable_js_1.extractJsonStringField)(head, 'teamName');
                    agentSetting = (0, sessionStoragePortable_js_1.extractJsonStringField)(head, 'agentSetting');
                    firstPrompt = (0, sessionStoragePortable_js_1.extractLastJsonStringField)(tail, 'lastPrompt') ||
                        extractFirstPromptFromChunk(head) ||
                        extractJsonStringFieldPrefix(head, 'content', 200) ||
                        extractJsonStringFieldPrefix(head, 'text', 200) ||
                        '';
                    customTitle = (_d = (_c = (_b = (0, sessionStoragePortable_js_1.extractLastJsonStringField)(tail, 'customTitle')) !== null && _b !== void 0 ? _b : (0, sessionStoragePortable_js_1.extractLastJsonStringField)(head, 'customTitle')) !== null && _c !== void 0 ? _c : (0, sessionStoragePortable_js_1.extractLastJsonStringField)(tail, 'aiTitle')) !== null && _d !== void 0 ? _d : (0, sessionStoragePortable_js_1.extractLastJsonStringField)(head, 'aiTitle');
                    summary = (0, sessionStoragePortable_js_1.extractLastJsonStringField)(tail, 'summary');
                    tag = (0, sessionStoragePortable_js_1.extractLastJsonStringField)(tail, 'tag');
                    gitBranch = (_e = (0, sessionStoragePortable_js_1.extractLastJsonStringField)(tail, 'gitBranch')) !== null && _e !== void 0 ? _e : (0, sessionStoragePortable_js_1.extractJsonStringField)(head, 'gitBranch');
                    prUrl = (0, sessionStoragePortable_js_1.extractLastJsonStringField)(tail, 'prUrl');
                    prRepository = (0, sessionStoragePortable_js_1.extractLastJsonStringField)(tail, 'prRepository');
                    prNumStr = (0, sessionStoragePortable_js_1.extractLastJsonStringField)(tail, 'prNumber');
                    if (prNumStr) {
                        prNumber = parseInt(prNumStr, 10) || undefined;
                    }
                    if (!prNumber) {
                        prNumMatch = tail.lastIndexOf('"prNumber":');
                        if (prNumMatch >= 0) {
                            afterColon = tail.slice(prNumMatch + 11, prNumMatch + 25);
                            num = parseInt(afterColon.trim(), 10);
                            if (num > 0)
                                prNumber = num;
                        }
                    }
                    return [2 /*return*/, {
                            firstPrompt: firstPrompt,
                            gitBranch: gitBranch,
                            isSidechain: isSidechain,
                            projectPath: projectPath,
                            teamName: teamName,
                            customTitle: customTitle,
                            summary: summary,
                            tag: tag,
                            agentSetting: agentSetting,
                            prNumber: prNumber,
                            prUrl: prUrl,
                            prRepository: prRepository,
                        }];
            }
        });
    });
}
/**
 * Scans a chunk of text for the first meaningful user prompt.
 */
function extractFirstPromptFromChunk(chunk) {
    var _a;
    var start = 0;
    var hasTickMessages = false;
    var firstCommandFallback = '';
    while (start < chunk.length) {
        var newlineIdx = chunk.indexOf('\n', start);
        var line = newlineIdx >= 0 ? chunk.slice(start, newlineIdx) : chunk.slice(start);
        start = newlineIdx >= 0 ? newlineIdx + 1 : chunk.length;
        if (!line.includes('"type":"user"') && !line.includes('"type": "user"')) {
            continue;
        }
        if (line.includes('"tool_result"'))
            continue;
        if (line.includes('"isMeta":true') || line.includes('"isMeta": true'))
            continue;
        try {
            var entry = (0, slowOperations_js_1.jsonParse)(line);
            if (entry.type !== 'user')
                continue;
            var message = entry.message;
            if (!message)
                continue;
            var content = message.content;
            // Collect all text values from the message content. For array content
            // (common in VS Code where IDE metadata tags come before the user's
            // actual prompt), iterate all text blocks so we don't miss the real
            // prompt hidden behind <ide_selection>/<ide_opened_file> blocks.
            var texts = [];
            if (typeof content === 'string') {
                texts.push(content);
            }
            else if (Array.isArray(content)) {
                for (var _i = 0, content_4 = content; _i < content_4.length; _i++) {
                    var block = content_4[_i];
                    var b = block;
                    if (b.type === 'text' && typeof b.text === 'string') {
                        texts.push(b.text);
                    }
                }
            }
            for (var _b = 0, texts_2 = texts; _b < texts_2.length; _b++) {
                var text = texts_2[_b];
                if (!text)
                    continue;
                var result = text.replace(/\n/g, ' ').trim();
                // Skip command messages (slash commands) but remember the first one
                // as a fallback title. Matches skip logic in
                // getFirstMeaningfulUserMessageTextContent, but instead of discarding
                // command messages entirely, we format them cleanly (e.g. "/clear")
                // so the session still appears in the resume picker.
                var commandNameTag = (0, messages_js_1.extractTag)(result, xml_js_1.COMMAND_NAME_TAG);
                if (commandNameTag) {
                    var name_1 = commandNameTag.replace(/^\//, '');
                    var commandArgs = ((_a = (0, messages_js_1.extractTag)(result, 'command-args')) === null || _a === void 0 ? void 0 : _a.trim()) || '';
                    if ((0, commands_js_1.builtInCommandNames)().has(name_1) || !commandArgs) {
                        if (!firstCommandFallback) {
                            firstCommandFallback = commandNameTag;
                        }
                        continue;
                    }
                    // Custom command with meaningful args — use clean display
                    return commandArgs
                        ? "".concat(commandNameTag, " ").concat(commandArgs)
                        : commandNameTag;
                }
                // Format bash input with ! prefix before the generic XML skip
                var bashInput = (0, messages_js_1.extractTag)(result, 'bash-input');
                if (bashInput)
                    return "! ".concat(bashInput);
                if (SKIP_FIRST_PROMPT_PATTERN.test(result)) {
                    if (((0, bun_bundle_1.feature)('PROACTIVE') || (0, bun_bundle_1.feature)('KAIROS')) &&
                        result.startsWith("<".concat(xml_js_1.TICK_TAG, ">")))
                        hasTickMessages = true;
                    continue;
                }
                if (result.length > 200) {
                    result = result.slice(0, 200).trim() + '…';
                }
                return result;
            }
        }
        catch (_c) {
            continue;
        }
    }
    // Session started with a slash command but had no subsequent real message —
    // use the clean command name so the session still appears in the resume picker
    if (firstCommandFallback)
        return firstCommandFallback;
    // Proactive sessions have only tick messages — give them a synthetic prompt
    // so they're not filtered out by enrichLogs
    if (((0, bun_bundle_1.feature)('PROACTIVE') || (0, bun_bundle_1.feature)('KAIROS')) && hasTickMessages)
        return 'Proactive session';
    return '';
}
/**
 * Like extractJsonStringField but returns the first `maxLen` characters of the
 * value even when the closing quote is missing (truncated buffer). Newline
 * escapes are replaced with spaces and the result is trimmed.
 */
function extractJsonStringFieldPrefix(text, key, maxLen) {
    var patterns = ["\"".concat(key, "\":\""), "\"".concat(key, "\": \"")];
    for (var _i = 0, patterns_1 = patterns; _i < patterns_1.length; _i++) {
        var pattern = patterns_1[_i];
        var idx = text.indexOf(pattern);
        if (idx < 0)
            continue;
        var valueStart = idx + pattern.length;
        // Grab up to maxLen characters from the value, stopping at closing quote
        var i = valueStart;
        var collected = 0;
        while (i < text.length && collected < maxLen) {
            if (text[i] === '\\') {
                i += 2; // skip escaped char
                collected++;
                continue;
            }
            if (text[i] === '"')
                break;
            i++;
            collected++;
        }
        var raw = text.slice(valueStart, i);
        return raw.replace(/\\n/g, ' ').replace(/\\t/g, ' ').trim();
    }
    return '';
}
/**
 * Deduplicates logs by sessionId, keeping the entry with the newest
 * modified time. Returns sorted logs with sequential value indices.
 */
function deduplicateLogsBySessionId(logs) {
    var deduped = new Map();
    for (var _i = 0, logs_2 = logs; _i < logs_2.length; _i++) {
        var log = logs_2[_i];
        if (!log.sessionId)
            continue;
        var existing = deduped.get(log.sessionId);
        if (!existing || log.modified.getTime() > existing.modified.getTime()) {
            deduped.set(log.sessionId, log);
        }
    }
    return (0, logs_js_1.sortLogs)(__spreadArray([], deduped.values(), true)).map(function (log, i) { return (__assign(__assign({}, log), { value: i })); });
}
/**
 * Returns lite LogOption[] from pure filesystem metadata (stat only).
 * No file reads — instant. Call `enrichLogs` to enrich
 * visible sessions with firstPrompt, gitBranch, customTitle, etc.
 */
function getSessionFilesLite(projectDir, limit, projectPath) {
    return __awaiter(this, void 0, void 0, function () {
        var sessionFilesMap, entries, logs, _i, entries_3, _a, sessionId, fileInfo, sorted;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, getSessionFilesWithMtime(projectDir)
                    // Sort by mtime descending and apply limit
                ];
                case 1:
                    sessionFilesMap = _b.sent();
                    entries = __spreadArray([], sessionFilesMap.entries(), true).sort(function (a, b) { return b[1].mtime - a[1].mtime; });
                    if (limit && entries.length > limit) {
                        entries = entries.slice(0, limit);
                    }
                    logs = [];
                    for (_i = 0, entries_3 = entries; _i < entries_3.length; _i++) {
                        _a = entries_3[_i], sessionId = _a[0], fileInfo = _a[1];
                        logs.push({
                            date: new Date(fileInfo.mtime).toISOString(),
                            messages: [],
                            isLite: true,
                            fullPath: fileInfo.path,
                            value: 0,
                            created: new Date(fileInfo.ctime),
                            modified: new Date(fileInfo.mtime),
                            firstPrompt: '',
                            messageCount: 0,
                            fileSize: fileInfo.size,
                            isSidechain: false,
                            sessionId: sessionId,
                            projectPath: projectPath,
                        });
                    }
                    sorted = (0, logs_js_1.sortLogs)(logs);
                    sorted.forEach(function (log, i) {
                        log.value = i;
                    });
                    return [2 /*return*/, sorted];
            }
        });
    });
}
/**
 * Enriches a lite log with metadata from its JSONL file.
 * Returns the enriched log, or null if the log has no meaningful content
 * (no firstPrompt, no customTitle — e.g., metadata-only session files).
 */
function enrichLog(log, readBuf) {
    return __awaiter(this, void 0, void 0, function () {
        var meta, enriched;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (!log.isLite || !log.fullPath)
                        return [2 /*return*/, log];
                    return [4 /*yield*/, readLiteMetadata(log.fullPath, (_a = log.fileSize) !== null && _a !== void 0 ? _a : 0, readBuf)];
                case 1:
                    meta = _c.sent();
                    enriched = __assign(__assign({}, log), { isLite: false, firstPrompt: meta.firstPrompt, gitBranch: meta.gitBranch, isSidechain: meta.isSidechain, teamName: meta.teamName, customTitle: meta.customTitle, summary: meta.summary, tag: meta.tag, agentSetting: meta.agentSetting, prNumber: meta.prNumber, prUrl: meta.prUrl, prRepository: meta.prRepository, projectPath: (_b = meta.projectPath) !== null && _b !== void 0 ? _b : log.projectPath });
                    // Provide a fallback title for sessions where we couldn't extract the first
                    // prompt (e.g., large first messages that exceed the 16KB read buffer).
                    // Previously these sessions were silently dropped, making them inaccessible
                    // via /resume after crashes or large-context sessions.
                    if (!enriched.firstPrompt && !enriched.customTitle) {
                        enriched.firstPrompt = '(session)';
                    }
                    // Filter: skip sidechains and agent sessions
                    if (enriched.isSidechain) {
                        (0, debug_js_1.logForDebugging)("Session ".concat(log.sessionId, " filtered from /resume: isSidechain=true"));
                        return [2 /*return*/, null];
                    }
                    if (enriched.teamName) {
                        (0, debug_js_1.logForDebugging)("Session ".concat(log.sessionId, " filtered from /resume: teamName=").concat(enriched.teamName));
                        return [2 /*return*/, null];
                    }
                    return [2 /*return*/, enriched];
            }
        });
    });
}
/**
 * Enriches enough lite logs from `allLogs` (starting at `startIndex`) to
 * produce `count` valid results. Returns the valid enriched logs and the
 * index where scanning stopped (for progressive loading to continue from).
 */
function enrichLogs(allLogs, startIndex, count) {
    return __awaiter(this, void 0, void 0, function () {
        var result, readBuf, i, log, enriched, scanned, filtered;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    result = [];
                    readBuf = Buffer.alloc(sessionStoragePortable_js_1.LITE_READ_BUF_SIZE);
                    i = startIndex;
                    _a.label = 1;
                case 1:
                    if (!(i < allLogs.length && result.length < count)) return [3 /*break*/, 3];
                    log = allLogs[i];
                    i++;
                    return [4 /*yield*/, enrichLog(log, readBuf)];
                case 2:
                    enriched = _a.sent();
                    if (enriched) {
                        result.push(enriched);
                    }
                    return [3 /*break*/, 1];
                case 3:
                    scanned = i - startIndex;
                    filtered = scanned - result.length;
                    if (filtered > 0) {
                        (0, debug_js_1.logForDebugging)("/resume: enriched ".concat(scanned, " sessions, ").concat(filtered, " filtered out, ").concat(result.length, " visible (").concat(allLogs.length - i, " remaining on disk)"));
                    }
                    return [2 /*return*/, { logs: result, nextIndex: i }];
            }
        });
    });
}
