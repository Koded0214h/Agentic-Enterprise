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
exports.prepareMessagesForInjection = prepareMessagesForInjection;
exports.isSpeculationEnabled = isSpeculationEnabled;
exports.startSpeculation = startSpeculation;
exports.acceptSpeculation = acceptSpeculation;
exports.abortSpeculation = abortSpeculation;
exports.handleSpeculationAccept = handleSpeculationAccept;
var crypto_1 = require("crypto");
var fs_1 = require("fs");
var promises_1 = require("fs/promises");
var path_1 = require("path");
var state_js_1 = require("../../bootstrap/state.js");
var AppStateStore_js_1 = require("../../state/AppStateStore.js");
var bashPermissions_js_1 = require("../../tools/BashTool/bashPermissions.js");
var readOnlyValidation_js_1 = require("../../tools/BashTool/readOnlyValidation.js");
var abortController_js_1 = require("../../utils/abortController.js");
var array_js_1 = require("../../utils/array.js");
var config_js_1 = require("../../utils/config.js");
var debug_js_1 = require("../../utils/debug.js");
var errors_js_1 = require("../../utils/errors.js");
var fileStateCache_js_1 = require("../../utils/fileStateCache.js");
var forkedAgent_js_1 = require("../../utils/forkedAgent.js");
var format_js_1 = require("../../utils/format.js");
var log_js_1 = require("../../utils/log.js");
var messages_js_1 = require("../../utils/messages.js");
var filesystem_js_1 = require("../../utils/permissions/filesystem.js");
var queryHelpers_js_1 = require("../../utils/queryHelpers.js");
var sessionStorage_js_1 = require("../../utils/sessionStorage.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var index_js_1 = require("../analytics/index.js");
var promptSuggestion_js_1 = require("./promptSuggestion.js");
var MAX_SPECULATION_TURNS = 20;
var MAX_SPECULATION_MESSAGES = 100;
var WRITE_TOOLS = new Set(['Edit', 'Write', 'NotebookEdit']);
var SAFE_READ_ONLY_TOOLS = new Set([
    'Read',
    'Glob',
    'Grep',
    'ToolSearch',
    'LSP',
    'TaskGet',
    'TaskList',
]);
function safeRemoveOverlay(overlayPath) {
    (0, fs_1.rm)(overlayPath, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }, function () { });
}
function getOverlayPath(id) {
    return (0, path_1.join)((0, filesystem_js_1.getClaudeTempDir)(), 'speculation', String(process.pid), id);
}
function denySpeculation(message, reason) {
    return {
        behavior: 'deny',
        message: message,
        decisionReason: { type: 'other', reason: reason },
    };
}
function copyOverlayToMain(overlayPath, writtenPaths, cwd) {
    return __awaiter(this, void 0, void 0, function () {
        var allCopied, _i, writtenPaths_1, rel, src, dest, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    allCopied = true;
                    _i = 0, writtenPaths_1 = writtenPaths;
                    _b.label = 1;
                case 1:
                    if (!(_i < writtenPaths_1.length)) return [3 /*break*/, 7];
                    rel = writtenPaths_1[_i];
                    src = (0, path_1.join)(overlayPath, rel);
                    dest = (0, path_1.join)(cwd, rel);
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, (0, promises_1.mkdir)((0, path_1.dirname)(dest), { recursive: true })];
                case 3:
                    _b.sent();
                    return [4 /*yield*/, (0, promises_1.copyFile)(src, dest)];
                case 4:
                    _b.sent();
                    return [3 /*break*/, 6];
                case 5:
                    _a = _b.sent();
                    allCopied = false;
                    (0, debug_js_1.logForDebugging)("[Speculation] Failed to copy ".concat(rel, " to main"));
                    return [3 /*break*/, 6];
                case 6:
                    _i++;
                    return [3 /*break*/, 1];
                case 7: return [2 /*return*/, allCopied];
            }
        });
    });
}
function logSpeculation(id, outcome, startTime, suggestionLength, messages, boundary, extras) {
    (0, index_js_1.logEvent)('tengu_speculation', __assign({ speculation_id: id, outcome: outcome, duration_ms: Date.now() - startTime, suggestion_length: suggestionLength, tools_executed: countToolsInMessages(messages), completed: boundary !== null, boundary_type: boundary === null || boundary === void 0 ? void 0 : boundary.type, boundary_tool: getBoundaryTool(boundary), boundary_detail: getBoundaryDetail(boundary) }, extras));
}
function countToolsInMessages(messages) {
    var blocks = messages
        .filter(isUserMessageWithArrayContent)
        .flatMap(function (m) { return m.message.content; })
        .filter(function (b) {
        return typeof b === 'object' && b !== null && 'type' in b;
    });
    return (0, array_js_1.count)(blocks, function (b) { return b.type === 'tool_result' && !b.is_error; });
}
function getBoundaryTool(boundary) {
    if (!boundary)
        return undefined;
    switch (boundary.type) {
        case 'bash':
            return 'Bash';
        case 'edit':
        case 'denied_tool':
            return boundary.toolName;
        case 'complete':
            return undefined;
    }
}
function getBoundaryDetail(boundary) {
    if (!boundary)
        return undefined;
    switch (boundary.type) {
        case 'bash':
            return boundary.command.slice(0, 200);
        case 'edit':
            return boundary.filePath;
        case 'denied_tool':
            return boundary.detail;
        case 'complete':
            return undefined;
    }
}
function isUserMessageWithArrayContent(m) {
    return m.type === 'user' && 'message' in m && Array.isArray(m.message.content);
}
function prepareMessagesForInjection(messages) {
    var isToolResult = function (b) {
        return typeof b === 'object' &&
            b !== null &&
            b.type === 'tool_result' &&
            typeof b.tool_use_id === 'string';
    };
    var isSuccessful = function (b) {
        return !b.is_error &&
            !(typeof b.content === 'string' &&
                b.content.includes(messages_js_1.INTERRUPT_MESSAGE_FOR_TOOL_USE));
    };
    var toolIdsWithSuccessfulResults = new Set(messages
        .filter(isUserMessageWithArrayContent)
        .flatMap(function (m) { return m.message.content; })
        .filter(isToolResult)
        .filter(isSuccessful)
        .map(function (b) { return b.tool_use_id; }));
    var keep = function (b) {
        return b.type !== 'thinking' &&
            b.type !== 'redacted_thinking' &&
            !(b.type === 'tool_use' && !toolIdsWithSuccessfulResults.has(b.id)) &&
            !(b.type === 'tool_result' &&
                !toolIdsWithSuccessfulResults.has(b.tool_use_id)) &&
            // Abort during speculation yields a standalone interrupt user message
            // (query.ts createUserInterruptionMessage). Strip it so it isn't surfaced
            // to the model as real user input.
            !(b.type === 'text' &&
                (b.text === messages_js_1.INTERRUPT_MESSAGE ||
                    b.text === messages_js_1.INTERRUPT_MESSAGE_FOR_TOOL_USE));
    };
    return messages
        .map(function (msg) {
        if (!('message' in msg) || !Array.isArray(msg.message.content))
            return msg;
        var content = msg.message.content.filter(keep);
        if (content.length === msg.message.content.length)
            return msg;
        if (content.length === 0)
            return null;
        // Drop messages where all remaining blocks are whitespace-only text
        // (API rejects these with 400: "text content blocks must contain non-whitespace text")
        var hasNonWhitespaceContent = content.some(function (b) {
            return b.type !== 'text' || (b.text !== undefined && b.text.trim() !== '');
        });
        if (!hasNonWhitespaceContent)
            return null;
        return __assign(__assign({}, msg), { message: __assign(__assign({}, msg.message), { content: content }) });
    })
        .filter(function (m) { return m !== null; });
}
function createSpeculationFeedbackMessage(messages, boundary, timeSavedMs, sessionTotalMs) {
    if (process.env.USER_TYPE !== 'ant')
        return null;
    if (messages.length === 0 || timeSavedMs === 0)
        return null;
    var toolUses = countToolsInMessages(messages);
    var tokens = (boundary === null || boundary === void 0 ? void 0 : boundary.type) === 'complete' ? boundary.outputTokens : null;
    var parts = [];
    if (toolUses > 0) {
        parts.push("Speculated ".concat(toolUses, " tool ").concat(toolUses === 1 ? 'use' : 'uses'));
    }
    else {
        var turns = messages.length;
        parts.push("Speculated ".concat(turns, " ").concat(turns === 1 ? 'turn' : 'turns'));
    }
    if (tokens !== null) {
        parts.push("".concat((0, format_js_1.formatNumber)(tokens), " tokens"));
    }
    var savedText = "+".concat((0, format_js_1.formatDuration)(timeSavedMs), " saved");
    var sessionSuffix = sessionTotalMs !== timeSavedMs
        ? " (".concat((0, format_js_1.formatDuration)(sessionTotalMs), " this session)")
        : '';
    return (0, messages_js_1.createSystemMessage)("[ANT-ONLY] ".concat(parts.join(' · '), " \u00B7 ").concat(savedText).concat(sessionSuffix), 'warning');
}
function updateActiveSpeculationState(setAppState, updater) {
    setAppState(function (prev) {
        if (prev.speculation.status !== 'active')
            return prev;
        var current = prev.speculation;
        var updates = updater(current);
        // Check if any values actually changed to avoid unnecessary re-renders
        var hasChanges = Object.entries(updates).some(function (_a) {
            var key = _a[0], value = _a[1];
            return current[key] !== value;
        });
        if (!hasChanges)
            return prev;
        return __assign(__assign({}, prev), { speculation: __assign(__assign({}, current), updates) });
    });
}
function resetSpeculationState(setAppState) {
    setAppState(function (prev) {
        if (prev.speculation.status === 'idle')
            return prev;
        return __assign(__assign({}, prev), { speculation: AppStateStore_js_1.IDLE_SPECULATION_STATE });
    });
}
function isSpeculationEnabled() {
    var _a;
    var enabled = process.env.USER_TYPE === 'ant' &&
        ((_a = (0, config_js_1.getGlobalConfig)().speculationEnabled) !== null && _a !== void 0 ? _a : true);
    (0, debug_js_1.logForDebugging)("[Speculation] enabled=".concat(enabled));
    return enabled;
}
function generatePipelinedSuggestion(context, suggestionText, speculatedMessages, setAppState, parentAbortController) {
    return __awaiter(this, void 0, void 0, function () {
        var appState, suppressReason, augmentedContext, pipelineAbortController, promptId_1, _a, suggestion_1, generationRequestId_1, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    appState = context.toolUseContext.getAppState();
                    suppressReason = (0, promptSuggestion_js_1.getSuggestionSuppressReason)(appState);
                    if (suppressReason) {
                        (0, promptSuggestion_js_1.logSuggestionSuppressed)("pipeline_".concat(suppressReason));
                        return [2 /*return*/];
                    }
                    augmentedContext = __assign(__assign({}, context), { messages: __spreadArray(__spreadArray(__spreadArray([], context.messages, true), [
                            (0, messages_js_1.createUserMessage)({ content: suggestionText })
                        ], false), speculatedMessages, true) });
                    pipelineAbortController = (0, abortController_js_1.createChildAbortController)(parentAbortController);
                    if (pipelineAbortController.signal.aborted)
                        return [2 /*return*/];
                    promptId_1 = (0, promptSuggestion_js_1.getPromptVariant)();
                    return [4 /*yield*/, (0, promptSuggestion_js_1.generateSuggestion)(pipelineAbortController, promptId_1, (0, forkedAgent_js_1.createCacheSafeParams)(augmentedContext))];
                case 1:
                    _a = _b.sent(), suggestion_1 = _a.suggestion, generationRequestId_1 = _a.generationRequestId;
                    if (pipelineAbortController.signal.aborted)
                        return [2 /*return*/];
                    if ((0, promptSuggestion_js_1.shouldFilterSuggestion)(suggestion_1, promptId_1))
                        return [2 /*return*/];
                    (0, debug_js_1.logForDebugging)("[Speculation] Pipelined suggestion: \"".concat(suggestion_1.slice(0, 50), "...\""));
                    updateActiveSpeculationState(setAppState, function () { return ({
                        pipelinedSuggestion: {
                            text: suggestion_1,
                            promptId: promptId_1,
                            generationRequestId: generationRequestId_1,
                        },
                    }); });
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _b.sent();
                    if (error_1 instanceof Error && error_1.name === 'AbortError')
                        return [2 /*return*/];
                    (0, debug_js_1.logForDebugging)("[Speculation] Pipelined suggestion failed: ".concat((0, errors_js_1.errorMessage)(error_1)));
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function startSpeculation(suggestionText_1, context_1, setAppState_1) {
    return __awaiter(this, arguments, void 0, function (suggestionText, context, setAppState, isPipelined, cacheSafeParams) {
        var id, abortController, startTime, messagesRef, writtenPathsRef, overlayPath, cwd, _a, contextRef, result_1, error_2;
        var _this = this;
        if (isPipelined === void 0) { isPipelined = false; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!isSpeculationEnabled())
                        return [2 /*return*/];
                    // Abort any existing speculation before starting a new one
                    abortSpeculation(setAppState);
                    id = (0, crypto_1.randomUUID)().slice(0, 8);
                    abortController = (0, abortController_js_1.createChildAbortController)(context.toolUseContext.abortController);
                    if (abortController.signal.aborted)
                        return [2 /*return*/];
                    startTime = Date.now();
                    messagesRef = { current: [] };
                    writtenPathsRef = { current: new Set() };
                    overlayPath = getOverlayPath(id);
                    cwd = (0, state_js_1.getCwdState)();
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.mkdir)(overlayPath, { recursive: true })];
                case 2:
                    _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    (0, debug_js_1.logForDebugging)('[Speculation] Failed to create overlay directory');
                    return [2 /*return*/];
                case 4:
                    contextRef = { current: context };
                    setAppState(function (prev) { return (__assign(__assign({}, prev), { speculation: {
                            status: 'active',
                            id: id,
                            abort: function () { return abortController.abort(); },
                            startTime: startTime,
                            messagesRef: messagesRef,
                            writtenPathsRef: writtenPathsRef,
                            boundary: null,
                            suggestionLength: suggestionText.length,
                            toolUseCount: 0,
                            isPipelined: isPipelined,
                            contextRef: contextRef,
                        } })); });
                    (0, debug_js_1.logForDebugging)("[Speculation] Starting speculation ".concat(id));
                    _b.label = 5;
                case 5:
                    _b.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, (0, forkedAgent_js_1.runForkedAgent)({
                            promptMessages: [(0, messages_js_1.createUserMessage)({ content: suggestionText })],
                            cacheSafeParams: cacheSafeParams !== null && cacheSafeParams !== void 0 ? cacheSafeParams : (0, forkedAgent_js_1.createCacheSafeParams)(context),
                            skipTranscript: true,
                            canUseTool: function (tool, input) { return __awaiter(_this, void 0, void 0, function () {
                                var isWriteTool, isSafeReadOnlyTool, appState, _a, mode, isBypassPermissionsModeAvailable, canAutoAcceptEdits, editPath_1, pathKey, filePath, rel, overlayFile, _b, command_1, detail;
                                var _c, _d;
                                return __generator(this, function (_e) {
                                    switch (_e.label) {
                                        case 0:
                                            isWriteTool = WRITE_TOOLS.has(tool.name);
                                            isSafeReadOnlyTool = SAFE_READ_ONLY_TOOLS.has(tool.name);
                                            // Check permission mode BEFORE allowing file edits
                                            if (isWriteTool) {
                                                appState = context.toolUseContext.getAppState();
                                                _a = appState.toolPermissionContext, mode = _a.mode, isBypassPermissionsModeAvailable = _a.isBypassPermissionsModeAvailable;
                                                canAutoAcceptEdits = mode === 'acceptEdits' ||
                                                    mode === 'bypassPermissions' ||
                                                    (mode === 'plan' && isBypassPermissionsModeAvailable);
                                                if (!canAutoAcceptEdits) {
                                                    (0, debug_js_1.logForDebugging)("[Speculation] Stopping at file edit: ".concat(tool.name));
                                                    editPath_1 = ('file_path' in input ? input.file_path : undefined);
                                                    updateActiveSpeculationState(setAppState, function () { return ({
                                                        boundary: {
                                                            type: 'edit',
                                                            toolName: tool.name,
                                                            filePath: editPath_1 !== null && editPath_1 !== void 0 ? editPath_1 : '',
                                                            completedAt: Date.now(),
                                                        },
                                                    }); });
                                                    abortController.abort();
                                                    return [2 /*return*/, denySpeculation('Speculation paused: file edit requires permission', 'speculation_edit_boundary')];
                                                }
                                            }
                                            if (!(isWriteTool || isSafeReadOnlyTool)) return [3 /*break*/, 10];
                                            pathKey = 'notebook_path' in input
                                                ? 'notebook_path'
                                                : 'path' in input
                                                    ? 'path'
                                                    : 'file_path';
                                            filePath = input[pathKey];
                                            if (!filePath) return [3 /*break*/, 9];
                                            rel = (0, path_1.relative)(cwd, filePath);
                                            if ((0, path_1.isAbsolute)(rel) || rel.startsWith('..')) {
                                                if (isWriteTool) {
                                                    (0, debug_js_1.logForDebugging)("[Speculation] Denied ".concat(tool.name, ": path outside cwd: ").concat(filePath));
                                                    return [2 /*return*/, denySpeculation('Write outside cwd not allowed during speculation', 'speculation_write_outside_root')];
                                                }
                                                return [2 /*return*/, {
                                                        behavior: 'allow',
                                                        updatedInput: input,
                                                        decisionReason: {
                                                            type: 'other',
                                                            reason: 'speculation_read_outside_root',
                                                        },
                                                    }];
                                            }
                                            if (!isWriteTool) return [3 /*break*/, 7];
                                            if (!!writtenPathsRef.current.has(rel)) return [3 /*break*/, 6];
                                            overlayFile = (0, path_1.join)(overlayPath, rel);
                                            return [4 /*yield*/, (0, promises_1.mkdir)((0, path_1.dirname)(overlayFile), { recursive: true })];
                                        case 1:
                                            _e.sent();
                                            _e.label = 2;
                                        case 2:
                                            _e.trys.push([2, 4, , 5]);
                                            return [4 /*yield*/, (0, promises_1.copyFile)((0, path_1.join)(cwd, rel), overlayFile)];
                                        case 3:
                                            _e.sent();
                                            return [3 /*break*/, 5];
                                        case 4:
                                            _b = _e.sent();
                                            return [3 /*break*/, 5];
                                        case 5:
                                            writtenPathsRef.current.add(rel);
                                            _e.label = 6;
                                        case 6:
                                            input = __assign(__assign({}, input), (_c = {}, _c[pathKey] = (0, path_1.join)(overlayPath, rel), _c));
                                            return [3 /*break*/, 8];
                                        case 7:
                                            // Read: redirect to overlay if file was previously written
                                            if (writtenPathsRef.current.has(rel)) {
                                                input = __assign(__assign({}, input), (_d = {}, _d[pathKey] = (0, path_1.join)(overlayPath, rel), _d));
                                            }
                                            _e.label = 8;
                                        case 8:
                                            (0, debug_js_1.logForDebugging)("[Speculation] ".concat(isWriteTool ? 'Write' : 'Read', " ").concat(filePath, " -> ").concat(input[pathKey]));
                                            return [2 /*return*/, {
                                                    behavior: 'allow',
                                                    updatedInput: input,
                                                    decisionReason: {
                                                        type: 'other',
                                                        reason: 'speculation_file_access',
                                                    },
                                                }];
                                        case 9:
                                            // Read tools without explicit path (e.g. Glob/Grep defaulting to CWD) are safe
                                            if (isSafeReadOnlyTool) {
                                                return [2 /*return*/, {
                                                        behavior: 'allow',
                                                        updatedInput: input,
                                                        decisionReason: {
                                                            type: 'other',
                                                            reason: 'speculation_read_default_cwd',
                                                        },
                                                    }];
                                            }
                                            _e.label = 10;
                                        case 10:
                                            // Stop at non-read-only bash commands
                                            if (tool.name === 'Bash') {
                                                command_1 = 'command' in input && typeof input.command === 'string'
                                                    ? input.command
                                                    : '';
                                                if (!command_1 ||
                                                    (0, readOnlyValidation_js_1.checkReadOnlyConstraints)({ command: command_1 }, (0, bashPermissions_js_1.commandHasAnyCd)(command_1))
                                                        .behavior !== 'allow') {
                                                    (0, debug_js_1.logForDebugging)("[Speculation] Stopping at bash: ".concat(command_1.slice(0, 50) || 'missing command'));
                                                    updateActiveSpeculationState(setAppState, function () { return ({
                                                        boundary: { type: 'bash', command: command_1, completedAt: Date.now() },
                                                    }); });
                                                    abortController.abort();
                                                    return [2 /*return*/, denySpeculation('Speculation paused: bash boundary', 'speculation_bash_boundary')];
                                                }
                                                // Read-only bash command — allow during speculation
                                                return [2 /*return*/, {
                                                        behavior: 'allow',
                                                        updatedInput: input,
                                                        decisionReason: {
                                                            type: 'other',
                                                            reason: 'speculation_readonly_bash',
                                                        },
                                                    }];
                                            }
                                            // Deny all other tools by default
                                            (0, debug_js_1.logForDebugging)("[Speculation] Stopping at denied tool: ".concat(tool.name));
                                            detail = String(('url' in input && input.url) ||
                                                ('file_path' in input && input.file_path) ||
                                                ('path' in input && input.path) ||
                                                ('command' in input && input.command) ||
                                                '').slice(0, 200);
                                            updateActiveSpeculationState(setAppState, function () { return ({
                                                boundary: {
                                                    type: 'denied_tool',
                                                    toolName: tool.name,
                                                    detail: detail,
                                                    completedAt: Date.now(),
                                                },
                                            }); });
                                            abortController.abort();
                                            return [2 /*return*/, denySpeculation("Tool ".concat(tool.name, " not allowed during speculation"), 'speculation_unknown_tool')];
                                    }
                                });
                            }); },
                            querySource: 'speculation',
                            forkLabel: 'speculation',
                            maxTurns: MAX_SPECULATION_TURNS,
                            overrides: { abortController: abortController, requireCanUseTool: true },
                            onMessage: function (msg) {
                                if (msg.type === 'assistant' || msg.type === 'user') {
                                    messagesRef.current.push(msg);
                                    if (messagesRef.current.length >= MAX_SPECULATION_MESSAGES) {
                                        abortController.abort();
                                    }
                                    if (isUserMessageWithArrayContent(msg)) {
                                        var newTools_1 = (0, array_js_1.count)(msg.message.content, function (b) { return b.type === 'tool_result' && !b.is_error; });
                                        if (newTools_1 > 0) {
                                            updateActiveSpeculationState(setAppState, function (prev) { return ({
                                                toolUseCount: prev.toolUseCount + newTools_1,
                                            }); });
                                        }
                                    }
                                }
                            },
                        })];
                case 6:
                    result_1 = _b.sent();
                    if (abortController.signal.aborted)
                        return [2 /*return*/];
                    updateActiveSpeculationState(setAppState, function () { return ({
                        boundary: {
                            type: 'complete',
                            completedAt: Date.now(),
                            outputTokens: result_1.totalUsage.output_tokens,
                        },
                    }); });
                    (0, debug_js_1.logForDebugging)("[Speculation] Complete: ".concat(countToolsInMessages(messagesRef.current), " tools"));
                    // Pipeline: generate the next suggestion while we wait for the user to accept
                    void generatePipelinedSuggestion(contextRef.current, suggestionText, messagesRef.current, setAppState, abortController);
                    return [3 /*break*/, 8];
                case 7:
                    error_2 = _b.sent();
                    abortController.abort();
                    if (error_2 instanceof Error && error_2.name === 'AbortError') {
                        safeRemoveOverlay(overlayPath);
                        resetSpeculationState(setAppState);
                        return [2 /*return*/];
                    }
                    safeRemoveOverlay(overlayPath);
                    // eslint-disable-next-line no-restricted-syntax -- custom fallback message, not toError(e)
                    (0, log_js_1.logError)(error_2 instanceof Error ? error_2 : new Error('Speculation failed'));
                    logSpeculation(id, 'error', startTime, suggestionText.length, messagesRef.current, null, {
                        error_type: error_2 instanceof Error ? error_2.name : 'Unknown',
                        error_message: (0, errors_js_1.errorMessage)(error_2).slice(0, 200),
                        error_phase: 'start',
                        is_pipelined: isPipelined,
                    });
                    resetSpeculationState(setAppState);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
function acceptSpeculation(state, setAppState, cleanMessageCount) {
    return __awaiter(this, void 0, void 0, function () {
        var id, messagesRef, writtenPathsRef, abort, startTime, suggestionLength, isPipelined, messages, overlayPath, acceptedAt, boundary, timeSavedMs, entry;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (state.status !== 'active')
                        return [2 /*return*/, null];
                    id = state.id, messagesRef = state.messagesRef, writtenPathsRef = state.writtenPathsRef, abort = state.abort, startTime = state.startTime, suggestionLength = state.suggestionLength, isPipelined = state.isPipelined;
                    messages = messagesRef.current;
                    overlayPath = getOverlayPath(id);
                    acceptedAt = Date.now();
                    abort();
                    if (!(cleanMessageCount > 0)) return [3 /*break*/, 2];
                    return [4 /*yield*/, copyOverlayToMain(overlayPath, writtenPathsRef.current, (0, state_js_1.getCwdState)())];
                case 1:
                    _b.sent();
                    _b.label = 2;
                case 2:
                    safeRemoveOverlay(overlayPath);
                    boundary = state.boundary;
                    timeSavedMs = Math.min(acceptedAt, (_a = boundary === null || boundary === void 0 ? void 0 : boundary.completedAt) !== null && _a !== void 0 ? _a : Infinity) - startTime;
                    setAppState(function (prev) {
                        var _a;
                        // Refine with latest React state if speculation is still active
                        if (prev.speculation.status === 'active' && prev.speculation.boundary) {
                            boundary = prev.speculation.boundary;
                            var endTime = Math.min(acceptedAt, (_a = boundary.completedAt) !== null && _a !== void 0 ? _a : Infinity);
                            timeSavedMs = endTime - startTime;
                        }
                        return __assign(__assign({}, prev), { speculation: AppStateStore_js_1.IDLE_SPECULATION_STATE, speculationSessionTimeSavedMs: prev.speculationSessionTimeSavedMs + timeSavedMs });
                    });
                    (0, debug_js_1.logForDebugging)(boundary === null
                        ? "[Speculation] Accept ".concat(id, ": still running, using ").concat(messages.length, " messages")
                        : "[Speculation] Accept ".concat(id, ": already complete"));
                    logSpeculation(id, 'accepted', startTime, suggestionLength, messages, boundary, {
                        message_count: messages.length,
                        time_saved_ms: timeSavedMs,
                        is_pipelined: isPipelined,
                    });
                    if (timeSavedMs > 0) {
                        entry = {
                            type: 'speculation-accept',
                            timestamp: new Date().toISOString(),
                            timeSavedMs: timeSavedMs,
                        };
                        void (0, promises_1.appendFile)((0, sessionStorage_js_1.getTranscriptPath)(), (0, slowOperations_js_1.jsonStringify)(entry) + '\n', {
                            mode: 384,
                        }).catch(function () {
                            (0, debug_js_1.logForDebugging)('[Speculation] Failed to write speculation-accept to transcript');
                        });
                    }
                    return [2 /*return*/, { messages: messages, boundary: boundary, timeSavedMs: timeSavedMs }];
            }
        });
    });
}
function abortSpeculation(setAppState) {
    setAppState(function (prev) {
        if (prev.speculation.status !== 'active')
            return prev;
        var _a = prev.speculation, id = _a.id, abort = _a.abort, startTime = _a.startTime, boundary = _a.boundary, suggestionLength = _a.suggestionLength, messagesRef = _a.messagesRef, isPipelined = _a.isPipelined;
        (0, debug_js_1.logForDebugging)("[Speculation] Aborting ".concat(id));
        logSpeculation(id, 'aborted', startTime, suggestionLength, messagesRef.current, boundary, { abort_reason: 'user_typed', is_pipelined: isPipelined });
        abort();
        safeRemoveOverlay(getOverlayPath(id));
        return __assign(__assign({}, prev), { speculation: AppStateStore_js_1.IDLE_SPECULATION_STATE });
    });
}
function handleSpeculationAccept(speculationState, speculationSessionTimeSavedMs, setAppState, input, deps) {
    return __awaiter(this, void 0, void 0, function () {
        var setMessages, readFileState, cwd, speculationMessages, cleanMessages_1, userMessage_1, result, isComplete, lastNonAssistant, timeSavedMs, newSessionTotal, feedbackMessage_1, extracted, _a, text_1, promptId_2, generationRequestId_2, augmentedContext, error_3;
        var _b, _c, _d, _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    _g.trys.push([0, 2, , 3]);
                    setMessages = deps.setMessages, readFileState = deps.readFileState, cwd = deps.cwd;
                    // Clear prompt suggestion state. logOutcomeAtSubmission logged the accept
                    // but was called with skipReset to avoid aborting speculation before we use it.
                    setAppState(function (prev) {
                        if (prev.promptSuggestion.text === null &&
                            prev.promptSuggestion.promptId === null) {
                            return prev;
                        }
                        return __assign(__assign({}, prev), { promptSuggestion: {
                                text: null,
                                promptId: null,
                                shownAt: 0,
                                acceptedAt: 0,
                                generationRequestId: null,
                            } });
                    });
                    speculationMessages = speculationState.messagesRef.current;
                    cleanMessages_1 = prepareMessagesForInjection(speculationMessages);
                    userMessage_1 = (0, messages_js_1.createUserMessage)({ content: input });
                    setMessages(function (prev) { return __spreadArray(__spreadArray([], prev, true), [userMessage_1], false); });
                    return [4 /*yield*/, acceptSpeculation(speculationState, setAppState, cleanMessages_1.length)];
                case 1:
                    result = _g.sent();
                    isComplete = ((_b = result === null || result === void 0 ? void 0 : result.boundary) === null || _b === void 0 ? void 0 : _b.type) === 'complete';
                    // When speculation didn't complete, the follow-up query needs the
                    // conversation to end with a user message. Drop trailing assistant
                    // messages — models that don't support prefill
                    // reject conversations ending with an assistant turn. The model will
                    // regenerate this content in the follow-up query.
                    if (!isComplete) {
                        lastNonAssistant = cleanMessages_1.findLastIndex(function (m) { return m.type !== 'assistant'; });
                        cleanMessages_1 = cleanMessages_1.slice(0, lastNonAssistant + 1);
                    }
                    timeSavedMs = (_c = result === null || result === void 0 ? void 0 : result.timeSavedMs) !== null && _c !== void 0 ? _c : 0;
                    newSessionTotal = speculationSessionTimeSavedMs + timeSavedMs;
                    feedbackMessage_1 = createSpeculationFeedbackMessage(cleanMessages_1, (_d = result === null || result === void 0 ? void 0 : result.boundary) !== null && _d !== void 0 ? _d : null, timeSavedMs, newSessionTotal);
                    // Inject speculated messages
                    setMessages(function (prev) { return __spreadArray(__spreadArray([], prev, true), cleanMessages_1, true); });
                    extracted = (0, queryHelpers_js_1.extractReadFilesFromMessages)(cleanMessages_1, cwd, fileStateCache_js_1.READ_FILE_STATE_CACHE_SIZE);
                    readFileState.current = (0, fileStateCache_js_1.mergeFileStateCaches)(readFileState.current, extracted);
                    if (feedbackMessage_1) {
                        setMessages(function (prev) { return __spreadArray(__spreadArray([], prev, true), [feedbackMessage_1], false); });
                    }
                    (0, debug_js_1.logForDebugging)("[Speculation] ".concat((_f = (_e = result === null || result === void 0 ? void 0 : result.boundary) === null || _e === void 0 ? void 0 : _e.type) !== null && _f !== void 0 ? _f : 'incomplete', ", injected ").concat(cleanMessages_1.length, " messages"));
                    // Promote pipelined suggestion if speculation completed fully
                    if (isComplete && speculationState.pipelinedSuggestion) {
                        _a = speculationState.pipelinedSuggestion, text_1 = _a.text, promptId_2 = _a.promptId, generationRequestId_2 = _a.generationRequestId;
                        (0, debug_js_1.logForDebugging)("[Speculation] Promoting pipelined suggestion: \"".concat(text_1.slice(0, 50), "...\""));
                        setAppState(function (prev) { return (__assign(__assign({}, prev), { promptSuggestion: {
                                text: text_1,
                                promptId: promptId_2,
                                shownAt: Date.now(),
                                acceptedAt: 0,
                                generationRequestId: generationRequestId_2,
                            } })); });
                        augmentedContext = __assign(__assign({}, speculationState.contextRef.current), { messages: __spreadArray(__spreadArray(__spreadArray([], speculationState.contextRef.current.messages, true), [
                                (0, messages_js_1.createUserMessage)({ content: input })
                            ], false), cleanMessages_1, true) });
                        void startSpeculation(text_1, augmentedContext, setAppState, true);
                    }
                    return [2 /*return*/, { queryRequired: !isComplete }];
                case 2:
                    error_3 = _g.sent();
                    // Fail open: log error and fall back to normal query flow
                    /* eslint-disable no-restricted-syntax -- custom fallback message, not toError(e) */
                    (0, log_js_1.logError)(error_3 instanceof Error
                        ? error_3
                        : new Error('handleSpeculationAccept failed'));
                    /* eslint-enable no-restricted-syntax */
                    logSpeculation(speculationState.id, 'error', speculationState.startTime, speculationState.suggestionLength, speculationState.messagesRef.current, speculationState.boundary, {
                        error_type: error_3 instanceof Error ? error_3.name : 'Unknown',
                        error_message: (0, errors_js_1.errorMessage)(error_3).slice(0, 200),
                        error_phase: 'accept',
                        is_pipelined: speculationState.isPipelined,
                    });
                    safeRemoveOverlay(getOverlayPath(speculationState.id));
                    resetSpeculationState(setAppState);
                    // Query required so user's message is processed normally (without speculated work)
                    return [2 /*return*/, { queryRequired: true }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
