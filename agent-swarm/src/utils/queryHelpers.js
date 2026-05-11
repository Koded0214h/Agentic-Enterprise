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
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
    function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
    function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isResultSuccessful = isResultSuccessful;
exports.normalizeMessage = normalizeMessage;
exports.handleOrphanedPermission = handleOrphanedPermission;
exports.extractReadFilesFromMessages = extractReadFilesFromMessages;
exports.extractBashToolsFromMessages = extractBashToolsFromMessages;
var last_js_1 = require("lodash-es/last.js");
var state_js_1 = require("src/bootstrap/state.js");
var toolOrchestration_js_1 = require("../services/tools/toolOrchestration.js");
var Tool_js_1 = require("../Tool.js");
var toolName_js_1 = require("../tools/BashTool/toolName.js");
var constants_js_1 = require("../tools/FileEditTool/constants.js");
var prompt_js_1 = require("../tools/FileReadTool/prompt.js");
var prompt_js_2 = require("../tools/FileWriteTool/prompt.js");
var debug_js_1 = require("./debug.js");
var envUtils_js_1 = require("./envUtils.js");
var errors_js_1 = require("./errors.js");
var file_js_1 = require("./file.js");
var fileRead_js_1 = require("./fileRead.js");
var fileStateCache_js_1 = require("./fileStateCache.js");
var messages_js_1 = require("./messages.js");
var path_js_1 = require("./path.js");
var sessionStorage_js_1 = require("./sessionStorage.js");
// Small cache size for ask operations which typically access few files
// during permission prompts or limited tool operations
var ASK_READ_FILE_STATE_CACHE_SIZE = 10;
/**
 * Checks if the result should be considered successful based on the last message.
 * Returns true if:
 * - Last message is assistant with text/thinking content
 * - Last message is user with only tool_result blocks
 * - Last message is the user prompt but the API completed with end_turn
 *   (model chose to emit no content blocks)
 */
function isResultSuccessful(message, stopReason) {
    if (stopReason === void 0) { stopReason = null; }
    if (!message)
        return false;
    if (message.type === 'assistant') {
        var lastContent = (0, last_js_1.default)(message.message.content);
        return ((lastContent === null || lastContent === void 0 ? void 0 : lastContent.type) === 'text' ||
            (lastContent === null || lastContent === void 0 ? void 0 : lastContent.type) === 'thinking' ||
            (lastContent === null || lastContent === void 0 ? void 0 : lastContent.type) === 'redacted_thinking');
    }
    if (message.type === 'user') {
        // Check if all content blocks are tool_result type
        var content = message.message.content;
        if (Array.isArray(content) &&
            content.length > 0 &&
            content.every(function (block) { return 'type' in block && block.type === 'tool_result'; })) {
            return true;
        }
    }
    // Carve-out: API completed (message_delta set stop_reason) but yielded
    // no assistant content — last(messages) is still this turn's prompt.
    // claude.ts:2026 recognizes end_turn-with-zero-content-blocks as
    // legitimate and passes through without throwing. Observed on
    // task_notification drain turns: model returns stop_reason=end_turn,
    // outputTokens=4, textContentLength=0 — it saw the subagent result
    // and decided nothing needed saying. Without this, QueryEngine emits
    // error_during_execution with errors[] = the entire process's
    // accumulated logError() buffer. Covers both string-content and
    // text-block-content user prompts, and any other non-passing shape.
    return stopReason === 'end_turn';
}
// Track last sent time for tool progress messages per tool use ID
// Keep only the last 100 entries to prevent unbounded growth
var MAX_TOOL_PROGRESS_TRACKING_ENTRIES = 100;
var TOOL_PROGRESS_THROTTLE_MS = 30000;
var toolProgressLastSentTime = new Map();
function normalizeMessage(message) {
    var _a, _i, _b, _1, _c, _d, _2, _e, trackingKey, now, lastSent, timeSinceLastSent, firstKey, _f, _g, _3;
    return __generator(this, function (_h) {
        switch (_h.label) {
            case 0:
                _a = message.type;
                switch (_a) {
                    case 'assistant': return [3 /*break*/, 1];
                    case 'progress': return [3 /*break*/, 6];
                    case 'user': return [3 /*break*/, 17];
                }
                return [3 /*break*/, 22];
            case 1:
                _i = 0, _b = (0, messages_js_1.normalizeMessages)([message]);
                _h.label = 2;
            case 2:
                if (!(_i < _b.length)) return [3 /*break*/, 5];
                _1 = _b[_i];
                // Skip empty messages (e.g., "(no content)") that shouldn't be output to SDK
                if (!(0, messages_js_1.isNotEmptyMessage)(_1)) {
                    return [3 /*break*/, 4];
                }
                return [4 /*yield*/, {
                        type: 'assistant',
                        message: _1.message,
                        parent_tool_use_id: null,
                        session_id: (0, state_js_1.getSessionId)(),
                        uuid: _1.uuid,
                        error: _1.error,
                    }];
            case 3:
                _h.sent();
                _h.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5: return [2 /*return*/];
            case 6:
                if (!(message.data.type === 'agent_progress' ||
                    message.data.type === 'skill_progress')) return [3 /*break*/, 14];
                _c = 0, _d = (0, messages_js_1.normalizeMessages)([message.data.message]);
                _h.label = 7;
            case 7:
                if (!(_c < _d.length)) return [3 /*break*/, 13];
                _2 = _d[_c];
                _e = _2.type;
                switch (_e) {
                    case 'assistant': return [3 /*break*/, 8];
                    case 'user': return [3 /*break*/, 10];
                }
                return [3 /*break*/, 12];
            case 8:
                // Skip empty messages (e.g., "(no content)") that shouldn't be output to SDK
                if (!(0, messages_js_1.isNotEmptyMessage)(_2)) {
                    return [3 /*break*/, 12];
                }
                return [4 /*yield*/, {
                        type: 'assistant',
                        message: _2.message,
                        parent_tool_use_id: message.parentToolUseID,
                        session_id: (0, state_js_1.getSessionId)(),
                        uuid: _2.uuid,
                        error: _2.error,
                    }];
            case 9:
                _h.sent();
                return [3 /*break*/, 12];
            case 10: return [4 /*yield*/, {
                    type: 'user',
                    message: _2.message,
                    parent_tool_use_id: message.parentToolUseID,
                    session_id: (0, state_js_1.getSessionId)(),
                    uuid: _2.uuid,
                    timestamp: _2.timestamp,
                    isSynthetic: _2.isMeta || _2.isVisibleInTranscriptOnly,
                    tool_use_result: _2.mcpMeta
                        ? __assign({ content: _2.toolUseResult }, _2.mcpMeta) : _2.toolUseResult,
                }];
            case 11:
                _h.sent();
                return [3 /*break*/, 12];
            case 12:
                _c++;
                return [3 /*break*/, 7];
            case 13: return [3 /*break*/, 16];
            case 14:
                if (!(message.data.type === 'bash_progress' ||
                    message.data.type === 'powershell_progress')) return [3 /*break*/, 16];
                // Filter bash progress to send only one per minute
                // Only emit for Claude Code Remote for now
                if (!(0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_REMOTE) &&
                    !process.env.CLAUDE_CODE_CONTAINER_ID) {
                    return [3 /*break*/, 22];
                }
                trackingKey = message.parentToolUseID;
                now = Date.now();
                lastSent = toolProgressLastSentTime.get(trackingKey) || 0;
                timeSinceLastSent = now - lastSent;
                if (!(timeSinceLastSent >= TOOL_PROGRESS_THROTTLE_MS)) return [3 /*break*/, 16];
                // Remove oldest entry if we're at capacity (LRU eviction)
                if (toolProgressLastSentTime.size >= MAX_TOOL_PROGRESS_TRACKING_ENTRIES) {
                    firstKey = toolProgressLastSentTime.keys().next().value;
                    if (firstKey !== undefined) {
                        toolProgressLastSentTime.delete(firstKey);
                    }
                }
                toolProgressLastSentTime.set(trackingKey, now);
                return [4 /*yield*/, {
                        type: 'tool_progress',
                        tool_use_id: message.toolUseID,
                        tool_name: message.data.type === 'bash_progress' ? 'Bash' : 'PowerShell',
                        parent_tool_use_id: message.parentToolUseID,
                        elapsed_time_seconds: message.data.elapsedTimeSeconds,
                        task_id: message.data.taskId,
                        session_id: (0, state_js_1.getSessionId)(),
                        uuid: message.uuid,
                    }];
            case 15:
                _h.sent();
                _h.label = 16;
            case 16: return [3 /*break*/, 22];
            case 17:
                _f = 0, _g = (0, messages_js_1.normalizeMessages)([message]);
                _h.label = 18;
            case 18:
                if (!(_f < _g.length)) return [3 /*break*/, 21];
                _3 = _g[_f];
                return [4 /*yield*/, {
                        type: 'user',
                        message: _3.message,
                        parent_tool_use_id: null,
                        session_id: (0, state_js_1.getSessionId)(),
                        uuid: _3.uuid,
                        timestamp: _3.timestamp,
                        isSynthetic: _3.isMeta || _3.isVisibleInTranscriptOnly,
                        tool_use_result: _3.mcpMeta
                            ? __assign({ content: _3.toolUseResult }, _3.mcpMeta) : _3.toolUseResult,
                    }];
            case 19:
                _h.sent();
                _h.label = 20;
            case 20:
                _f++;
                return [3 /*break*/, 18];
            case 21: return [2 /*return*/];
            case 22: return [2 /*return*/];
        }
    });
}
function handleOrphanedPermission(orphanedPermission, tools, mutableMessages, processUserInputContext) {
    return __asyncGenerator(this, arguments, function handleOrphanedPermission_1() {
        var persistSession, permissionResult, assistantMessage, toolUseID, content, toolUseBlock, _i, content_1, block, toolName, toolInput, toolDefinition, finalInput, finalToolUseBlock, canUseTool, alreadyPresent, sdkAssistantMessage, _a, _b, _c, update, sdkMessage, e_1_1;
        var _this = this;
        var _d, e_1, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    persistSession = !(0, state_js_1.isSessionPersistenceDisabled)();
                    permissionResult = orphanedPermission.permissionResult, assistantMessage = orphanedPermission.assistantMessage;
                    toolUseID = permissionResult.toolUseID;
                    if (!!toolUseID) return [3 /*break*/, 2];
                    return [4 /*yield*/, __await(void 0)];
                case 1: return [2 /*return*/, _g.sent()];
                case 2:
                    content = assistantMessage.message.content;
                    if (Array.isArray(content)) {
                        for (_i = 0, content_1 = content; _i < content_1.length; _i++) {
                            block = content_1[_i];
                            if (block.type === 'tool_use' && block.id === toolUseID) {
                                toolUseBlock = block;
                                break;
                            }
                        }
                    }
                    if (!!toolUseBlock) return [3 /*break*/, 4];
                    return [4 /*yield*/, __await(void 0)];
                case 3: return [2 /*return*/, _g.sent()];
                case 4:
                    toolName = toolUseBlock.name;
                    toolInput = toolUseBlock.input;
                    toolDefinition = (0, Tool_js_1.findToolByName)(tools, toolName);
                    if (!!toolDefinition) return [3 /*break*/, 6];
                    return [4 /*yield*/, __await(void 0)];
                case 5: return [2 /*return*/, _g.sent()];
                case 6:
                    finalInput = toolInput;
                    if (permissionResult.behavior === 'allow') {
                        if (permissionResult.updatedInput !== undefined) {
                            finalInput = permissionResult.updatedInput;
                        }
                        else {
                            (0, debug_js_1.logForDebugging)("Orphaned permission for ".concat(toolName, ": updatedInput is undefined, falling back to original tool input"), { level: 'warn' });
                        }
                    }
                    finalToolUseBlock = __assign(__assign({}, toolUseBlock), { input: finalInput });
                    canUseTool = function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, (__assign(__assign({}, permissionResult), { decisionReason: {
                                        type: 'mode',
                                        mode: 'default',
                                    } }))
                                // Add the assistant message with tool_use to messages BEFORE executing
                                // so the conversation history is complete (tool_use -> tool_result).
                                //
                                // On CCR resume, mutableMessages is seeded from the transcript and may already
                                // contain this tool_use. Pushing again would make normalizeMessagesForAPI merge
                                // same-ID assistants (concatenating content) and produce a duplicate tool_use
                                // ID, which the API rejects with "tool_use ids must be unique".
                                //
                                // Check for the specific tool_use_id rather than message.id: streaming yields
                                // each content block as a separate AssistantMessage sharing one message.id, so
                                // a [text, tool_use] response lands as two entries. filterUnresolvedToolUses may
                                // strip the tool_use entry but keep the text one; an id-based check would then
                                // wrongly skip the push while runTools below still executes, orphaning the result.
                            ];
                        });
                    }); };
                    alreadyPresent = mutableMessages.some(function (m) {
                        return m.type === 'assistant' &&
                            Array.isArray(m.message.content) &&
                            m.message.content.some(function (b) { return b.type === 'tool_use' && 'id' in b && b.id === toolUseID; });
                    });
                    if (!!alreadyPresent) return [3 /*break*/, 8];
                    mutableMessages.push(assistantMessage);
                    if (!persistSession) return [3 /*break*/, 8];
                    return [4 /*yield*/, __await((0, sessionStorage_js_1.recordTranscript)(mutableMessages))];
                case 7:
                    _g.sent();
                    _g.label = 8;
                case 8:
                    sdkAssistantMessage = __assign(__assign({}, assistantMessage), { session_id: (0, state_js_1.getSessionId)(), parent_tool_use_id: null });
                    return [4 /*yield*/, __await(sdkAssistantMessage
                        // Execute the tool - errors are handled internally by runToolUse
                        )];
                case 9: return [4 /*yield*/, _g.sent()];
                case 10:
                    _g.sent();
                    _g.label = 11;
                case 11:
                    _g.trys.push([11, 20, 21, 26]);
                    _a = true, _b = __asyncValues((0, toolOrchestration_js_1.runTools)([finalToolUseBlock], [assistantMessage], canUseTool, processUserInputContext));
                    _g.label = 12;
                case 12: return [4 /*yield*/, __await(_b.next())];
                case 13:
                    if (!(_c = _g.sent(), _d = _c.done, !_d)) return [3 /*break*/, 19];
                    _f = _c.value;
                    _a = false;
                    update = _f;
                    if (!update.message) return [3 /*break*/, 18];
                    mutableMessages.push(update.message);
                    if (!persistSession) return [3 /*break*/, 15];
                    return [4 /*yield*/, __await((0, sessionStorage_js_1.recordTranscript)(mutableMessages))];
                case 14:
                    _g.sent();
                    _g.label = 15;
                case 15:
                    sdkMessage = __assign(__assign({}, update.message), { session_id: (0, state_js_1.getSessionId)(), parent_tool_use_id: null });
                    return [4 /*yield*/, __await(sdkMessage)];
                case 16: return [4 /*yield*/, _g.sent()];
                case 17:
                    _g.sent();
                    _g.label = 18;
                case 18:
                    _a = true;
                    return [3 /*break*/, 12];
                case 19: return [3 /*break*/, 26];
                case 20:
                    e_1_1 = _g.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 26];
                case 21:
                    _g.trys.push([21, , 24, 25]);
                    if (!(!_a && !_d && (_e = _b.return))) return [3 /*break*/, 23];
                    return [4 /*yield*/, __await(_e.call(_b))];
                case 22:
                    _g.sent();
                    _g.label = 23;
                case 23: return [3 /*break*/, 25];
                case 24:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 25: return [7 /*endfinally*/];
                case 26: return [2 /*return*/];
            }
        });
    });
}
// Create a function to extract read files from messages
function extractReadFilesFromMessages(messages, cwd, maxSize) {
    if (maxSize === void 0) { maxSize = ASK_READ_FILE_STATE_CACHE_SIZE; }
    var cache = (0, fileStateCache_js_1.createFileStateCacheWithSizeLimit)(maxSize);
    // First pass: find all FileReadTool/FileWriteTool/FileEditTool uses in assistant messages
    var fileReadToolUseIds = new Map(); // toolUseId -> filePath
    var fileWriteToolUseIds = new Map(); // toolUseId -> { filePath, content }
    var fileEditToolUseIds = new Map(); // toolUseId -> filePath
    for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
        var message = messages_1[_i];
        if (message.type === 'assistant' &&
            Array.isArray(message.message.content)) {
            for (var _a = 0, _b = message.message.content; _a < _b.length; _a++) {
                var content = _b[_a];
                if (content.type === 'tool_use' &&
                    content.name === prompt_js_1.FILE_READ_TOOL_NAME) {
                    // Extract file_path from the tool use input
                    var input = content.input;
                    // Ranged reads are not added to the cache.
                    if ((input === null || input === void 0 ? void 0 : input.file_path) &&
                        (input === null || input === void 0 ? void 0 : input.offset) === undefined &&
                        (input === null || input === void 0 ? void 0 : input.limit) === undefined) {
                        // Normalize to absolute path for consistent cache lookups
                        var absolutePath = (0, path_js_1.expandPath)(input.file_path, cwd);
                        fileReadToolUseIds.set(content.id, absolutePath);
                    }
                }
                else if (content.type === 'tool_use' &&
                    content.name === prompt_js_2.FILE_WRITE_TOOL_NAME) {
                    // Extract file_path and content from the Write tool use input
                    var input = content.input;
                    if ((input === null || input === void 0 ? void 0 : input.file_path) && (input === null || input === void 0 ? void 0 : input.content)) {
                        // Normalize to absolute path for consistent cache lookups
                        var absolutePath = (0, path_js_1.expandPath)(input.file_path, cwd);
                        fileWriteToolUseIds.set(content.id, {
                            filePath: absolutePath,
                            content: input.content,
                        });
                    }
                }
                else if (content.type === 'tool_use' &&
                    content.name === constants_js_1.FILE_EDIT_TOOL_NAME) {
                    // Edit's input has old_string/new_string, not the resulting content.
                    // Track the path so the second pass can read current disk state.
                    var input = content.input;
                    if (input === null || input === void 0 ? void 0 : input.file_path) {
                        var absolutePath = (0, path_js_1.expandPath)(input.file_path, cwd);
                        fileEditToolUseIds.set(content.id, absolutePath);
                    }
                }
            }
        }
    }
    // Second pass: find corresponding tool results and extract content
    for (var _c = 0, messages_2 = messages; _c < messages_2.length; _c++) {
        var message = messages_2[_c];
        if (message.type === 'user' && Array.isArray(message.message.content)) {
            for (var _d = 0, _e = message.message.content; _d < _e.length; _d++) {
                var content = _e[_d];
                if (content.type === 'tool_result' && content.tool_use_id) {
                    // Handle Read tool results
                    var readFilePath = fileReadToolUseIds.get(content.tool_use_id);
                    if (readFilePath &&
                        typeof content.content === 'string' &&
                        // Dedup stubs contain no file content — the earlier real Read
                        // already cached it. Chronological last-wins would otherwise
                        // overwrite the real entry with stub text.
                        !content.content.startsWith(prompt_js_1.FILE_UNCHANGED_STUB)) {
                        // Remove system-reminder blocks from the content
                        var processedContent = content.content.replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, '');
                        // Extract the actual file content from the tool result
                        // Tool results for text files contain line numbers, we need to strip those
                        var fileContent = processedContent
                            .split('\n')
                            .map(file_js_1.stripLineNumberPrefix)
                            .join('\n')
                            .trim();
                        // Cache the file content with the message timestamp
                        if (message.timestamp) {
                            var timestamp = new Date(message.timestamp).getTime();
                            cache.set(readFilePath, {
                                content: fileContent,
                                timestamp: timestamp,
                                offset: undefined,
                                limit: undefined,
                            });
                        }
                    }
                    // Handle Write tool results - use content from the tool input
                    var writeToolData = fileWriteToolUseIds.get(content.tool_use_id);
                    if (writeToolData && message.timestamp) {
                        var timestamp = new Date(message.timestamp).getTime();
                        cache.set(writeToolData.filePath, {
                            content: writeToolData.content,
                            timestamp: timestamp,
                            offset: undefined,
                            limit: undefined,
                        });
                    }
                    // Handle Edit tool results — post-edit content isn't in the
                    // tool_use input (only old_string/new_string) nor fully in the
                    // result (only a snippet). Read from disk now, using actual mtime
                    // so getChangedFiles's mtime check passes on the next turn.
                    //
                    // Callers seed the cache once at process start (print.ts --resume,
                    // Cowork cold-restart per turn), so disk content at extraction time
                    // IS the post-edit state. No dedup: processing every Edit preserves
                    // last-wins semantics when Read/Write interleave (Edit→Read→Edit).
                    var editFilePath = fileEditToolUseIds.get(content.tool_use_id);
                    if (editFilePath && content.is_error !== true) {
                        try {
                            var diskContent = (0, fileRead_js_1.readFileSyncWithMetadata)(editFilePath).content;
                            cache.set(editFilePath, {
                                content: diskContent,
                                timestamp: (0, file_js_1.getFileModificationTime)(editFilePath),
                                offset: undefined,
                                limit: undefined,
                            });
                        }
                        catch (e) {
                            if (!(0, errors_js_1.isFsInaccessible)(e)) {
                                throw e;
                            }
                            // File deleted or inaccessible since the Edit — skip
                        }
                    }
                }
            }
        }
    }
    return cache;
}
/**
 * Extract the top-level CLI tools used in BashTool calls from message history.
 * Returns a deduplicated set of command names (e.g. 'vercel', 'aws', 'git').
 */
function extractBashToolsFromMessages(messages) {
    var tools = new Set();
    for (var _i = 0, messages_3 = messages; _i < messages_3.length; _i++) {
        var message = messages_3[_i];
        if (message.type === 'assistant' &&
            Array.isArray(message.message.content)) {
            for (var _a = 0, _b = message.message.content; _a < _b.length; _a++) {
                var content = _b[_a];
                if (content.type === 'tool_use' && content.name === toolName_js_1.BASH_TOOL_NAME) {
                    var input = content.input;
                    if (typeof input !== 'object' ||
                        input === null ||
                        !('command' in input))
                        continue;
                    var cmd = extractCliName(typeof input.command === 'string' ? input.command : undefined);
                    if (cmd) {
                        tools.add(cmd);
                    }
                }
            }
        }
    }
    return tools;
}
var STRIPPED_COMMANDS = new Set(['sudo']);
/**
 * Extract the actual CLI name from a bash command string, skipping
 * env var assignments (e.g. `FOO=bar vercel` → `vercel`) and prefixes
 * in STRIPPED_COMMANDS.
 */
function extractCliName(command) {
    if (!command)
        return undefined;
    var tokens = command.trim().split(/\s+/);
    for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
        var token = tokens_1[_i];
        if (/^[A-Za-z_]\w*=/.test(token))
            continue;
        if (STRIPPED_COMMANDS.has(token))
            continue;
        return token;
    }
    return undefined;
}
