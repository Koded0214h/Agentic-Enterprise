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
exports.deserializeMessages = deserializeMessages;
exports.deserializeMessagesWithInterruptDetection = deserializeMessagesWithInterruptDetection;
exports.restoreSkillStateFromMessages = restoreSkillStateFromMessages;
exports.loadMessagesFromJsonlPath = loadMessagesFromJsonlPath;
exports.loadConversationForResume = loadConversationForResume;
var bun_bundle_1 = require("bun:bundle");
var path_1 = require("path");
var cwd_js_1 = require("src/utils/cwd.js");
var state_js_1 = require("../bootstrap/state.js");
var ids_js_1 = require("../types/ids.js");
var permissions_js_1 = require("../types/permissions.js");
var attachments_js_1 = require("./attachments.js");
var fileHistory_js_1 = require("./fileHistory.js");
var log_js_1 = require("./log.js");
var messages_js_1 = require("./messages.js");
var plans_js_1 = require("./plans.js");
var sessionStart_js_1 = require("./sessionStart.js");
var sessionStorage_js_1 = require("./sessionStorage.js");
// Dead code elimination: ant-only tool names are conditionally required so
// their strings don't leak into external builds. Static imports always bundle.
/* eslint-disable @typescript-eslint/no-require-imports */
var BRIEF_TOOL_NAME = (0, bun_bundle_1.feature)('KAIROS') || (0, bun_bundle_1.feature)('KAIROS_BRIEF')
    ? require('../tools/BriefTool/prompt.js').BRIEF_TOOL_NAME
    : null;
var LEGACY_BRIEF_TOOL_NAME = (0, bun_bundle_1.feature)('KAIROS') || (0, bun_bundle_1.feature)('KAIROS_BRIEF')
    ? require('../tools/BriefTool/prompt.js').LEGACY_BRIEF_TOOL_NAME
    : null;
var SEND_USER_FILE_TOOL_NAME = (0, bun_bundle_1.feature)('KAIROS')
    ? require('../tools/SendUserFileTool/prompt.js').SEND_USER_FILE_TOOL_NAME
    : null;
/* eslint-enable @typescript-eslint/no-require-imports */
/**
 * Transforms legacy attachment types to current types for backward compatibility
 */
function migrateLegacyAttachmentTypes(message) {
    if (message.type !== 'attachment') {
        return message;
    }
    var attachment = message.attachment; // Handle legacy types not in current type system
    // Transform legacy attachment types
    if (attachment.type === 'new_file') {
        return __assign(__assign({}, message), { attachment: __assign(__assign({}, attachment), { type: 'file', displayPath: (0, path_1.relative)((0, cwd_js_1.getCwd)(), attachment.filename) }) }); // Cast entire message since we know the structure is correct
    }
    if (attachment.type === 'new_directory') {
        return __assign(__assign({}, message), { attachment: __assign(__assign({}, attachment), { type: 'directory', displayPath: (0, path_1.relative)((0, cwd_js_1.getCwd)(), attachment.path) }) }); // Cast entire message since we know the structure is correct
    }
    // Backfill displayPath for attachments from old sessions
    if (!('displayPath' in attachment)) {
        var path = 'filename' in attachment
            ? attachment.filename
            : 'path' in attachment
                ? attachment.path
                : 'skillDir' in attachment
                    ? attachment.skillDir
                    : undefined;
        if (path) {
            return __assign(__assign({}, message), { attachment: __assign(__assign({}, attachment), { displayPath: (0, path_1.relative)((0, cwd_js_1.getCwd)(), path) }) });
        }
    }
    return message;
}
/**
 * Deserializes messages from a log file into the format expected by the REPL.
 * Filters unresolved tool uses, orphaned thinking messages, and appends a
 * synthetic assistant sentinel when the last message is from the user.
 * @internal Exported for testing - use loadConversationForResume instead
 */
function deserializeMessages(serializedMessages) {
    return deserializeMessagesWithInterruptDetection(serializedMessages).messages;
}
/**
 * Like deserializeMessages, but also detects whether the session was
 * interrupted mid-turn. Used by the SDK resume path to auto-continue
 * interrupted turns after a gateway-triggered restart.
 * @internal Exported for testing
 */
function deserializeMessagesWithInterruptDetection(serializedMessages) {
    try {
        // Transform legacy attachment types before processing
        var migratedMessages = serializedMessages.map(migrateLegacyAttachmentTypes);
        // Strip invalid permissionMode values from deserialized user messages.
        // The field is unvalidated JSON from disk and may contain modes from a different build.
        var validModes = new Set(permissions_js_1.PERMISSION_MODES);
        for (var _i = 0, migratedMessages_1 = migratedMessages; _i < migratedMessages_1.length; _i++) {
            var msg = migratedMessages_1[_i];
            if (msg.type === 'user' &&
                msg.permissionMode !== undefined &&
                !validModes.has(msg.permissionMode)) {
                msg.permissionMode = undefined;
            }
        }
        // Filter out unresolved tool uses and any synthetic messages that follow them
        var filteredToolUses = (0, messages_js_1.filterUnresolvedToolUses)(migratedMessages);
        // Filter out orphaned thinking-only assistant messages that can cause API errors
        // during resume. These occur when streaming yields separate messages per content
        // block and interleaved user messages prevent proper merging by message.id.
        var filteredThinking = (0, messages_js_1.filterOrphanedThinkingOnlyMessages)(filteredToolUses);
        // Filter out assistant messages with only whitespace text content.
        // This can happen when model outputs "\n\n" before thinking, user cancels mid-stream.
        var filteredMessages = (0, messages_js_1.filterWhitespaceOnlyAssistantMessages)(filteredThinking);
        var internalState = detectTurnInterruption(filteredMessages);
        // Transform mid-turn interruptions into interrupted_prompt by appending
        // a synthetic continuation message. This unifies both interruption kinds
        // so the consumer only needs to handle interrupted_prompt.
        var turnInterruptionState = void 0;
        if (internalState.kind === 'interrupted_turn') {
            var continuationMessage = (0, messages_js_1.normalizeMessages)([
                (0, messages_js_1.createUserMessage)({
                    content: 'Continue from where you left off.',
                    isMeta: true,
                }),
            ])[0];
            filteredMessages.push(continuationMessage);
            turnInterruptionState = {
                kind: 'interrupted_prompt',
                message: continuationMessage,
            };
        }
        else {
            turnInterruptionState = internalState;
        }
        // Append a synthetic assistant sentinel after the last user message so
        // the conversation is API-valid if no resume action is taken. Skip past
        // trailing system/progress messages and insert right after the user
        // message so removeInterruptedMessage's splice(idx, 2) removes the
        // correct pair.
        var lastRelevantIdx = filteredMessages.findLastIndex(function (m) { return m.type !== 'system' && m.type !== 'progress'; });
        if (lastRelevantIdx !== -1 &&
            filteredMessages[lastRelevantIdx].type === 'user') {
            filteredMessages.splice(lastRelevantIdx + 1, 0, (0, messages_js_1.createAssistantMessage)({
                content: messages_js_1.NO_RESPONSE_REQUESTED,
            }));
        }
        return { messages: filteredMessages, turnInterruptionState: turnInterruptionState };
    }
    catch (error) {
        (0, log_js_1.logError)(error);
        throw error;
    }
}
/**
 * Determines whether the conversation was interrupted mid-turn based on the
 * last message after filtering. An assistant as last message (after filtering
 * unresolved tool_uses) is treated as a completed turn because stop_reason is
 * always null on persisted messages in the streaming path.
 *
 * System and progress messages are skipped when finding the last turn-relevant
 * message — they are bookkeeping artifacts that should not mask a genuine
 * interruption. Attachments are kept as part of the turn.
 */
function detectTurnInterruption(messages) {
    if (messages.length === 0) {
        return { kind: 'none' };
    }
    // Find the last turn-relevant message, skipping system/progress and
    // synthetic API error assistants. Error assistants are already filtered
    // before API send (normalizeMessagesForAPI) — skipping them here lets
    // auto-resume fire after retry exhaustion instead of reading the error as
    // a completed turn.
    var lastMessageIdx = messages.findLastIndex(function (m) {
        return m.type !== 'system' &&
            m.type !== 'progress' &&
            !(m.type === 'assistant' && m.isApiErrorMessage);
    });
    var lastMessage = lastMessageIdx !== -1 ? messages[lastMessageIdx] : undefined;
    if (!lastMessage) {
        return { kind: 'none' };
    }
    if (lastMessage.type === 'assistant') {
        // In the streaming path, stop_reason is always null on persisted messages
        // because messages are recorded at content_block_stop time, before
        // message_delta delivers the stop_reason. After filterUnresolvedToolUses
        // has removed assistant messages with unmatched tool_uses, an assistant as
        // the last message means the turn most likely completed normally.
        return { kind: 'none' };
    }
    if (lastMessage.type === 'user') {
        if (lastMessage.isMeta || lastMessage.isCompactSummary) {
            return { kind: 'none' };
        }
        if ((0, messages_js_1.isToolUseResultMessage)(lastMessage)) {
            // Brief mode (#20467) drops the trailing assistant text block, so a
            // completed brief-mode turn legitimately ends on SendUserMessage's
            // tool_result. Without this check, resume misclassifies every
            // brief-mode session as interrupted mid-turn and injects a phantom
            // "Continue from where you left off." before the user's real next
            // prompt. Look back one step for the originating tool_use.
            if (isTerminalToolResult(lastMessage, messages, lastMessageIdx)) {
                return { kind: 'none' };
            }
            return { kind: 'interrupted_turn' };
        }
        // Plain text user prompt — CC hadn't started responding
        return { kind: 'interrupted_prompt', message: lastMessage };
    }
    if (lastMessage.type === 'attachment') {
        // Attachments are part of the user turn — the user provided context but
        // the assistant never responded.
        return { kind: 'interrupted_turn' };
    }
    return { kind: 'none' };
}
/**
 * Is this tool_result the output of a tool that legitimately terminates a
 * turn? SendUserMessage is the canonical case: in brief mode, calling it is
 * the turn's final act — there is no follow-up assistant text (#20467
 * removed it). A transcript ending here means the turn COMPLETED, not that
 * it was killed mid-tool.
 *
 * Walks back to find the assistant tool_use that this result belongs to and
 * checks its name. The matching tool_use is typically the immediately
 * preceding relevant message (filterUnresolvedToolUses has already dropped
 * unpaired ones), but we walk just in case system/progress noise is
 * interleaved.
 */
function isTerminalToolResult(result, messages, resultIdx) {
    var content = result.message.content;
    if (!Array.isArray(content))
        return false;
    var block = content[0];
    if ((block === null || block === void 0 ? void 0 : block.type) !== 'tool_result')
        return false;
    var toolUseId = block.tool_use_id;
    for (var i = resultIdx - 1; i >= 0; i--) {
        var msg = messages[i];
        if (msg.type !== 'assistant')
            continue;
        for (var _i = 0, _a = msg.message.content; _i < _a.length; _i++) {
            var b = _a[_i];
            if (b.type === 'tool_use' && b.id === toolUseId) {
                return (b.name === BRIEF_TOOL_NAME ||
                    b.name === LEGACY_BRIEF_TOOL_NAME ||
                    b.name === SEND_USER_FILE_TOOL_NAME);
            }
        }
    }
    return false;
}
/**
 * Restores skill state from invoked_skills attachments in messages.
 * This ensures that skills are preserved across resume after compaction.
 * Without this, if another compaction happens after resume, the skills would be lost
 * because STATE.invokedSkills would be empty.
 * @internal Exported for testing - use loadConversationForResume instead
 */
function restoreSkillStateFromMessages(messages) {
    for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
        var message = messages_1[_i];
        if (message.type !== 'attachment') {
            continue;
        }
        if (message.attachment.type === 'invoked_skills') {
            for (var _a = 0, _b = message.attachment.skills; _a < _b.length; _a++) {
                var skill = _b[_a];
                if (skill.name && skill.path && skill.content) {
                    // Resume only happens for the main session, so agentId is null
                    (0, state_js_1.addInvokedSkill)(skill.name, skill.path, skill.content, null);
                }
            }
        }
        // A prior process already injected the skills-available reminder — it's
        // in the transcript the model is about to see. sentSkillNames is
        // process-local, so without this every resume re-announces the same
        // ~600 tokens. Fire-once latch; consumed on the first attachment pass.
        if (message.attachment.type === 'skill_listing') {
            (0, attachments_js_1.suppressNextSkillListing)();
        }
    }
}
/**
 * Chain-walk a transcript jsonl by path.  Same sequence loadFullLog
 * runs internally — loadTranscriptFile → find newest non-sidechain
 * leaf → buildConversationChain → removeExtraFields — just starting
 * from an arbitrary path instead of the sid-derived one.
 *
 * leafUuids is populated by loadTranscriptFile as "uuids that no
 * other message's parentUuid points at" — the chain tips.  There can
 * be several (sidechains, orphans); newest non-sidechain is the main
 * conversation's end.
 */
function loadMessagesFromJsonlPath(path) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, byUuid, leafUuids, tip, tipTs, _i, _b, m, ts, chain;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, (0, sessionStorage_js_1.loadTranscriptFile)(path)];
                case 1:
                    _a = _c.sent(), byUuid = _a.messages, leafUuids = _a.leafUuids;
                    tip = null;
                    tipTs = 0;
                    for (_i = 0, _b = byUuid.values(); _i < _b.length; _i++) {
                        m = _b[_i];
                        if (m.isSidechain || !leafUuids.has(m.uuid))
                            continue;
                        ts = new Date(m.timestamp).getTime();
                        if (ts > tipTs) {
                            tipTs = ts;
                            tip = m;
                        }
                    }
                    if (!tip)
                        return [2 /*return*/, { messages: [], sessionId: undefined }];
                    chain = (0, sessionStorage_js_1.buildConversationChain)(byUuid, tip);
                    return [2 /*return*/, {
                            messages: (0, sessionStorage_js_1.removeExtraFields)(chain),
                            // Leaf's sessionId — forked sessions copy chain[0] from the source
                            // transcript, so the root retains the source session's ID. Matches
                            // loadFullLog's mostRecentLeaf.sessionId.
                            sessionId: tip.sessionId,
                        }];
            }
        });
    });
}
/**
 * Loads a conversation for resume from various sources.
 * This is the centralized function for loading and deserializing conversations.
 *
 * @param source - The source to load from:
 *   - undefined: load most recent conversation
 *   - string: session ID to load
 *   - LogOption: already loaded conversation
 * @param sourceJsonlFile - Alternate: path to a transcript jsonl.
 *   Used when --resume receives a .jsonl path (cli/print.ts routes
 *   on suffix), typically for cross-directory resume where the
 *   transcript lives outside the current project dir.
 * @returns Object containing the deserialized messages and the original log, or null if not found
 */
function loadConversationForResume(source, sourceJsonlFile) {
    return __awaiter(this, void 0, void 0, function () {
        var log, messages, sessionId, logsPromise, skip_1, listAllLiveSessions, live, _a, logs, loaded, deserialized, hookMessages, error_1;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 19, , 20]);
                    log = null;
                    messages = null;
                    sessionId = void 0;
                    if (!(source === undefined)) return [3 /*break*/, 7];
                    logsPromise = (0, sessionStorage_js_1.loadMessageLogs)();
                    skip_1 = new Set();
                    if (!(0, bun_bundle_1.feature)('BG_SESSIONS')) return [3 /*break*/, 5];
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./udsClient.js'); })];
                case 2:
                    listAllLiveSessions = (_c.sent()).listAllLiveSessions;
                    return [4 /*yield*/, listAllLiveSessions()];
                case 3:
                    live = _c.sent();
                    skip_1 = new Set(live.flatMap(function (s) {
                        return s.kind && s.kind !== 'interactive' && s.sessionId
                            ? [s.sessionId]
                            : [];
                    }));
                    return [3 /*break*/, 5];
                case 4:
                    _a = _c.sent();
                    return [3 /*break*/, 5];
                case 5: return [4 /*yield*/, logsPromise];
                case 6:
                    logs = _c.sent();
                    log =
                        (_b = logs.find(function (l) {
                            var id = (0, sessionStorage_js_1.getSessionIdFromLog)(l);
                            return !id || !skip_1.has(id);
                        })) !== null && _b !== void 0 ? _b : null;
                    return [3 /*break*/, 12];
                case 7:
                    if (!sourceJsonlFile) return [3 /*break*/, 9];
                    return [4 /*yield*/, loadMessagesFromJsonlPath(sourceJsonlFile)];
                case 8:
                    loaded = _c.sent();
                    messages = loaded.messages;
                    sessionId = loaded.sessionId;
                    return [3 /*break*/, 12];
                case 9:
                    if (!(typeof source === 'string')) return [3 /*break*/, 11];
                    return [4 /*yield*/, (0, sessionStorage_js_1.getLastSessionLog)(source)];
                case 10:
                    // Load specific session by ID
                    log = _c.sent();
                    sessionId = source;
                    return [3 /*break*/, 12];
                case 11:
                    // Already have a LogOption
                    log = source;
                    _c.label = 12;
                case 12:
                    if (!log && !messages) {
                        return [2 /*return*/, null];
                    }
                    if (!log) return [3 /*break*/, 17];
                    if (!(0, sessionStorage_js_1.isLiteLog)(log)) return [3 /*break*/, 14];
                    return [4 /*yield*/, (0, sessionStorage_js_1.loadFullLog)(log)];
                case 13:
                    log = _c.sent();
                    _c.label = 14;
                case 14:
                    // Determine sessionId first so we can pass it to copy functions
                    if (!sessionId) {
                        sessionId = (0, sessionStorage_js_1.getSessionIdFromLog)(log);
                    }
                    if (!sessionId) return [3 /*break*/, 16];
                    return [4 /*yield*/, (0, plans_js_1.copyPlanForResume)(log, (0, ids_js_1.asSessionId)(sessionId))];
                case 15:
                    _c.sent();
                    _c.label = 16;
                case 16:
                    // Copy file history for resume
                    void (0, fileHistory_js_1.copyFileHistoryForResume)(log);
                    messages = log.messages;
                    (0, sessionStorage_js_1.checkResumeConsistency)(messages);
                    _c.label = 17;
                case 17:
                    // Restore skill state from invoked_skills attachments before deserialization.
                    // This ensures skills survive multiple compaction cycles after resume.
                    restoreSkillStateFromMessages(messages);
                    deserialized = deserializeMessagesWithInterruptDetection(messages);
                    messages = deserialized.messages;
                    return [4 /*yield*/, (0, sessionStart_js_1.processSessionStartHooks)('resume', { sessionId: sessionId })
                        // Append hook messages to the conversation
                    ];
                case 18:
                    hookMessages = _c.sent();
                    // Append hook messages to the conversation
                    messages.push.apply(messages, hookMessages);
                    return [2 /*return*/, {
                            messages: messages,
                            turnInterruptionState: deserialized.turnInterruptionState,
                            fileHistorySnapshots: log === null || log === void 0 ? void 0 : log.fileHistorySnapshots,
                            attributionSnapshots: log === null || log === void 0 ? void 0 : log.attributionSnapshots,
                            contentReplacements: log === null || log === void 0 ? void 0 : log.contentReplacements,
                            contextCollapseCommits: log === null || log === void 0 ? void 0 : log.contextCollapseCommits,
                            contextCollapseSnapshot: log === null || log === void 0 ? void 0 : log.contextCollapseSnapshot,
                            sessionId: sessionId,
                            // Include session metadata for restoring agent context on resume
                            agentName: log === null || log === void 0 ? void 0 : log.agentName,
                            agentColor: log === null || log === void 0 ? void 0 : log.agentColor,
                            agentSetting: log === null || log === void 0 ? void 0 : log.agentSetting,
                            customTitle: log === null || log === void 0 ? void 0 : log.customTitle,
                            tag: log === null || log === void 0 ? void 0 : log.tag,
                            mode: log === null || log === void 0 ? void 0 : log.mode,
                            worktreeSession: log === null || log === void 0 ? void 0 : log.worktreeSession,
                            prNumber: log === null || log === void 0 ? void 0 : log.prNumber,
                            prUrl: log === null || log === void 0 ? void 0 : log.prUrl,
                            prRepository: log === null || log === void 0 ? void 0 : log.prRepository,
                            // Include full path for cross-directory resume
                            fullPath: log === null || log === void 0 ? void 0 : log.fullPath,
                        }];
                case 19:
                    error_1 = _c.sent();
                    (0, log_js_1.logError)(error_1);
                    throw error_1;
                case 20: return [2 /*return*/];
            }
        });
    });
}
