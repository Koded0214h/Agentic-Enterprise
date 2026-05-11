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
exports.HOOK_TIMING_DISPLAY_THRESHOLD_MS = void 0;
exports.classifyToolError = classifyToolError;
exports.runToolUse = runToolUse;
exports.buildSchemaNotSentHint = buildSchemaNotSentHint;
var bun_bundle_1 = require("bun:bundle");
var index_js_1 = require("src/services/analytics/index.js");
var metadata_js_1 = require("src/services/analytics/metadata.js");
var state_js_1 = require("../../bootstrap/state.js");
var permissionLogging_js_1 = require("../../hooks/toolPermission/permissionLogging.js");
var Tool_js_1 = require("../../Tool.js");
var bashPermissions_js_1 = require("../../tools/BashTool/bashPermissions.js");
var toolName_js_1 = require("../../tools/BashTool/toolName.js");
var constants_js_1 = require("../../tools/FileEditTool/constants.js");
var prompt_js_1 = require("../../tools/FileReadTool/prompt.js");
var prompt_js_2 = require("../../tools/FileWriteTool/prompt.js");
var constants_js_2 = require("../../tools/NotebookEditTool/constants.js");
var toolName_js_2 = require("../../tools/PowerShellTool/toolName.js");
var gitOperationTracking_js_1 = require("../../tools/shared/gitOperationTracking.js");
var prompt_js_3 = require("../../tools/ToolSearchTool/prompt.js");
var tools_js_1 = require("../../tools.js");
var array_js_1 = require("../../utils/array.js");
var attachments_js_1 = require("../../utils/attachments.js");
var debug_js_1 = require("../../utils/debug.js");
var errors_js_1 = require("../../utils/errors.js");
var hooks_js_1 = require("../../utils/hooks.js");
var log_js_1 = require("../../utils/log.js");
var messages_js_1 = require("../../utils/messages.js");
var sessionActivity_js_1 = require("../../utils/sessionActivity.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var stream_js_1 = require("../../utils/stream.js");
var events_js_1 = require("../../utils/telemetry/events.js");
var sessionTracing_js_1 = require("../../utils/telemetry/sessionTracing.js");
var toolErrors_js_1 = require("../../utils/toolErrors.js");
var toolResultStorage_js_1 = require("../../utils/toolResultStorage.js");
var toolSearch_js_1 = require("../../utils/toolSearch.js");
var client_js_1 = require("../mcp/client.js");
var mcpStringUtils_js_1 = require("../mcp/mcpStringUtils.js");
var normalization_js_1 = require("../mcp/normalization.js");
var utils_js_1 = require("../mcp/utils.js");
var toolHooks_js_1 = require("./toolHooks.js");
/** Minimum total hook duration (ms) to show inline timing summary */
exports.HOOK_TIMING_DISPLAY_THRESHOLD_MS = 500;
/** Log a debug warning when hooks/permission-decision block for this long. Matches
 * BashTool's PROGRESS_THRESHOLD_MS — the collapsed view feels stuck past this. */
var SLOW_PHASE_LOG_THRESHOLD_MS = 2000;
/**
 * Classify a tool execution error into a telemetry-safe string.
 *
 * In minified/external builds, `error.constructor.name` is mangled into
 * short identifiers like "nJT" or "Chq" — useless for diagnostics.
 * This function extracts structured, telemetry-safe information instead:
 * - TelemetrySafeError: use its telemetryMessage (already vetted)
 * - Node.js fs errors: log the error code (ENOENT, EACCES, etc.)
 * - Known error types: use their unminified name
 * - Fallback: "Error" (better than a mangled 3-char identifier)
 */
function classifyToolError(error) {
    if (error instanceof errors_js_1.TelemetrySafeError_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS) {
        return error.telemetryMessage.slice(0, 200);
    }
    if (error instanceof Error) {
        // Node.js filesystem errors have a `code` property (ENOENT, EACCES, etc.)
        // These are safe to log and much more useful than the constructor name.
        var errnoCode = (0, errors_js_1.getErrnoCode)(error);
        if (typeof errnoCode === 'string') {
            return "Error:".concat(errnoCode);
        }
        // ShellError, ImageSizeError, etc. have stable `.name` properties
        // that survive minification (they're set in the constructor).
        if (error.name && error.name !== 'Error' && error.name.length > 3) {
            return error.name.slice(0, 60);
        }
        return 'Error';
    }
    return 'UnknownError';
}
/**
 * Map a rule's origin to the documented OTel `source` vocabulary, matching
 * the interactive path's semantics (permissionLogging.ts:81): session-scoped
 * grants are temporary, on-disk grants are permanent, and user-authored
 * denies are user_reject regardless of persistence. Everything the user
 * didn't write (cliArg, policySettings, projectSettings, flagSettings) is
 * config.
 */
function ruleSourceToOTelSource(ruleSource, behavior) {
    switch (ruleSource) {
        case 'session':
            return behavior === 'allow' ? 'user_temporary' : 'user_reject';
        case 'localSettings':
        case 'userSettings':
            return behavior === 'allow' ? 'user_permanent' : 'user_reject';
        default:
            return 'config';
    }
}
/**
 * Map a PermissionDecisionReason to the OTel `source` label for the
 * non-interactive tool_decision path, staying within the documented
 * vocabulary (config, hook, user_permanent, user_temporary, user_reject).
 *
 * For permissionPromptTool, the SDK host may set decisionClassification on
 * the PermissionResult to tell us exactly what happened (once vs always vs
 * cache hit — the host knows, we can't tell from {behavior:'allow'} alone).
 * Without it, we fall back conservatively: allow → user_temporary,
 * deny → user_reject.
 */
function decisionReasonToOTelSource(reason, behavior) {
    if (!reason) {
        return 'config';
    }
    switch (reason.type) {
        case 'permissionPromptTool': {
            // toolResult is typed `unknown` on PermissionDecisionReason but carries
            // the parsed Output from PermissionPromptToolResultSchema. Narrow at
            // runtime rather than widen the cross-file type.
            var toolResult = reason.toolResult;
            var classified = toolResult === null || toolResult === void 0 ? void 0 : toolResult.decisionClassification;
            if (classified === 'user_temporary' ||
                classified === 'user_permanent' ||
                classified === 'user_reject') {
                return classified;
            }
            return behavior === 'allow' ? 'user_temporary' : 'user_reject';
        }
        case 'rule':
            return ruleSourceToOTelSource(reason.rule.source, behavior);
        case 'hook':
            return 'hook';
        case 'mode':
        case 'classifier':
        case 'subcommandResults':
        case 'asyncAgent':
        case 'sandboxOverride':
        case 'workingDir':
        case 'safetyCheck':
        case 'other':
            return 'config';
        default: {
            var _exhaustive = reason;
            return 'config';
        }
    }
}
function getNextImagePasteId(messages) {
    var maxId = 0;
    for (var _i = 0, messages_1 = messages; _i < messages_1.length; _i++) {
        var message = messages_1[_i];
        if (message.type === 'user' && message.imagePasteIds) {
            for (var _a = 0, _b = message.imagePasteIds; _a < _b.length; _a++) {
                var id = _b[_a];
                if (id > maxId)
                    maxId = id;
            }
        }
    }
    return maxId + 1;
}
function findMcpServerConnection(toolName, mcpClients) {
    if (!toolName.startsWith('mcp__')) {
        return undefined;
    }
    var mcpInfo = (0, mcpStringUtils_js_1.mcpInfoFromString)(toolName);
    if (!mcpInfo) {
        return undefined;
    }
    // mcpInfo.serverName is normalized (e.g., "claude_ai_Slack"), but client.name
    // is the original name (e.g., "claude.ai Slack"). Normalize both for comparison.
    return mcpClients.find(function (client) { return (0, normalization_js_1.normalizeNameForMCP)(client.name) === mcpInfo.serverName; });
}
/**
 * Extracts the MCP server transport type from a tool name.
 * Returns the server type (stdio, sse, http, ws, sdk, etc.) for MCP tools,
 * or undefined for built-in tools.
 */
function getMcpServerType(toolName, mcpClients) {
    var _a;
    var serverConnection = findMcpServerConnection(toolName, mcpClients);
    if ((serverConnection === null || serverConnection === void 0 ? void 0 : serverConnection.type) === 'connected') {
        // Handle stdio configs where type field is optional (defaults to 'stdio')
        return (_a = serverConnection.config.type) !== null && _a !== void 0 ? _a : 'stdio';
    }
    return undefined;
}
/**
 * Extracts the MCP server base URL for a tool by looking up its server connection.
 * Returns undefined for stdio servers, built-in tools, or if the server is not connected.
 */
function getMcpServerBaseUrlFromToolName(toolName, mcpClients) {
    var serverConnection = findMcpServerConnection(toolName, mcpClients);
    if ((serverConnection === null || serverConnection === void 0 ? void 0 : serverConnection.type) !== 'connected') {
        return undefined;
    }
    return (0, utils_js_1.getLoggingSafeMcpBaseUrl)(serverConnection.config);
}
function runToolUse(toolUse, assistantMessage, canUseTool, toolUseContext) {
    return __asyncGenerator(this, arguments, function runToolUse_1() {
        var toolName, tool, fallbackTool, messageId, requestId, mcpServerType, mcpServerBaseUrl, sanitizedToolName, toolInput, content, _a, _b, _c, update, e_1_1, error_1, errorMessage_1, toolInfo, detailedError;
        var _d, e_1, _e, _f;
        var _g, _h, _j, _k, _l, _m;
        return __generator(this, function (_o) {
            switch (_o.label) {
                case 0:
                    toolName = toolUse.name;
                    tool = (0, Tool_js_1.findToolByName)(toolUseContext.options.tools, toolName);
                    // If not found, check if it's a deprecated tool being called by alias
                    // (e.g., old transcripts calling "KillShell" which is now an alias for "TaskStop")
                    // Only fall back for tools where the name matches an alias, not the primary name
                    if (!tool) {
                        fallbackTool = (0, Tool_js_1.findToolByName)((0, tools_js_1.getAllBaseTools)(), toolName);
                        // Only use fallback if the tool was found via alias (deprecated name)
                        if (fallbackTool && ((_g = fallbackTool.aliases) === null || _g === void 0 ? void 0 : _g.includes(toolName))) {
                            tool = fallbackTool;
                        }
                    }
                    messageId = assistantMessage.message.id;
                    requestId = assistantMessage.requestId;
                    mcpServerType = getMcpServerType(toolName, toolUseContext.options.mcpClients);
                    mcpServerBaseUrl = getMcpServerBaseUrlFromToolName(toolName, toolUseContext.options.mcpClients);
                    if (!!tool) return [3 /*break*/, 4];
                    sanitizedToolName = (0, metadata_js_1.sanitizeToolNameForAnalytics)(toolName);
                    (0, debug_js_1.logForDebugging)("Unknown tool ".concat(toolName, ": ").concat(toolUse.id));
                    (0, index_js_1.logEvent)('tengu_tool_use_error', __assign(__assign(__assign(__assign({ error: "No such tool available: ".concat(sanitizedToolName), toolName: sanitizedToolName, toolUseID: toolUse.id, isMcp: toolName.startsWith('mcp__'), queryChainId: (_h = toolUseContext.queryTracking) === null || _h === void 0 ? void 0 : _h.chainId, queryDepth: (_j = toolUseContext.queryTracking) === null || _j === void 0 ? void 0 : _j.depth }, (mcpServerType && {
                        mcpServerType: mcpServerType,
                    })), (mcpServerBaseUrl && {
                        mcpServerBaseUrl: mcpServerBaseUrl,
                    })), (requestId && {
                        requestId: requestId,
                    })), (0, metadata_js_1.mcpToolDetailsForAnalytics)(toolName, mcpServerType, mcpServerBaseUrl)));
                    return [4 /*yield*/, __await({
                            message: (0, messages_js_1.createUserMessage)({
                                content: [
                                    {
                                        type: 'tool_result',
                                        content: "<tool_use_error>Error: No such tool available: ".concat(toolName, "</tool_use_error>"),
                                        is_error: true,
                                        tool_use_id: toolUse.id,
                                    },
                                ],
                                toolUseResult: "Error: No such tool available: ".concat(toolName),
                                sourceToolAssistantUUID: assistantMessage.uuid,
                            }),
                        })];
                case 1: return [4 /*yield*/, _o.sent()];
                case 2:
                    _o.sent();
                    return [4 /*yield*/, __await(void 0)];
                case 3: return [2 /*return*/, _o.sent()];
                case 4:
                    toolInput = toolUse.input;
                    _o.label = 5;
                case 5:
                    _o.trys.push([5, 23, , 26]);
                    if (!toolUseContext.abortController.signal.aborted) return [3 /*break*/, 9];
                    (0, index_js_1.logEvent)('tengu_tool_use_cancelled', __assign(__assign(__assign(__assign({ toolName: (0, metadata_js_1.sanitizeToolNameForAnalytics)(tool.name), toolUseID: toolUse.id, isMcp: (_k = tool.isMcp) !== null && _k !== void 0 ? _k : false, queryChainId: (_l = toolUseContext.queryTracking) === null || _l === void 0 ? void 0 : _l.chainId, queryDepth: (_m = toolUseContext.queryTracking) === null || _m === void 0 ? void 0 : _m.depth }, (mcpServerType && {
                        mcpServerType: mcpServerType,
                    })), (mcpServerBaseUrl && {
                        mcpServerBaseUrl: mcpServerBaseUrl,
                    })), (requestId && {
                        requestId: requestId,
                    })), (0, metadata_js_1.mcpToolDetailsForAnalytics)(tool.name, mcpServerType, mcpServerBaseUrl)));
                    content = (0, messages_js_1.createToolResultStopMessage)(toolUse.id);
                    content.content = (0, messages_js_1.withMemoryCorrectionHint)(messages_js_1.CANCEL_MESSAGE);
                    return [4 /*yield*/, __await({
                            message: (0, messages_js_1.createUserMessage)({
                                content: [content],
                                toolUseResult: messages_js_1.CANCEL_MESSAGE,
                                sourceToolAssistantUUID: assistantMessage.uuid,
                            }),
                        })];
                case 6: return [4 /*yield*/, _o.sent()];
                case 7:
                    _o.sent();
                    return [4 /*yield*/, __await(void 0)];
                case 8: return [2 /*return*/, _o.sent()];
                case 9:
                    _o.trys.push([9, 16, 17, 22]);
                    _a = true, _b = __asyncValues(streamedCheckPermissionsAndCallTool(tool, toolUse.id, toolInput, toolUseContext, canUseTool, assistantMessage, messageId, requestId, mcpServerType, mcpServerBaseUrl));
                    _o.label = 10;
                case 10: return [4 /*yield*/, __await(_b.next())];
                case 11:
                    if (!(_c = _o.sent(), _d = _c.done, !_d)) return [3 /*break*/, 15];
                    _f = _c.value;
                    _a = false;
                    update = _f;
                    return [4 /*yield*/, __await(update)];
                case 12: return [4 /*yield*/, _o.sent()];
                case 13:
                    _o.sent();
                    _o.label = 14;
                case 14:
                    _a = true;
                    return [3 /*break*/, 10];
                case 15: return [3 /*break*/, 22];
                case 16:
                    e_1_1 = _o.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 22];
                case 17:
                    _o.trys.push([17, , 20, 21]);
                    if (!(!_a && !_d && (_e = _b.return))) return [3 /*break*/, 19];
                    return [4 /*yield*/, __await(_e.call(_b))];
                case 18:
                    _o.sent();
                    _o.label = 19;
                case 19: return [3 /*break*/, 21];
                case 20:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 21: return [7 /*endfinally*/];
                case 22: return [3 /*break*/, 26];
                case 23:
                    error_1 = _o.sent();
                    (0, log_js_1.logError)(error_1);
                    errorMessage_1 = error_1 instanceof Error ? error_1.message : String(error_1);
                    toolInfo = tool ? " (".concat(tool.name, ")") : '';
                    detailedError = "Error calling tool".concat(toolInfo, ": ").concat(errorMessage_1);
                    return [4 /*yield*/, __await({
                            message: (0, messages_js_1.createUserMessage)({
                                content: [
                                    {
                                        type: 'tool_result',
                                        content: "<tool_use_error>".concat(detailedError, "</tool_use_error>"),
                                        is_error: true,
                                        tool_use_id: toolUse.id,
                                    },
                                ],
                                toolUseResult: detailedError,
                                sourceToolAssistantUUID: assistantMessage.uuid,
                            }),
                        })];
                case 24: return [4 /*yield*/, _o.sent()];
                case 25:
                    _o.sent();
                    return [3 /*break*/, 26];
                case 26: return [2 /*return*/];
            }
        });
    });
}
function streamedCheckPermissionsAndCallTool(tool, toolUseID, input, toolUseContext, canUseTool, assistantMessage, messageId, requestId, mcpServerType, mcpServerBaseUrl) {
    // This is a bit of a hack to get progress events and final results
    // into a single async iterable.
    //
    // Ideally the progress reporting and tool call reporting would
    // be via separate mechanisms.
    var stream = new stream_js_1.Stream();
    checkPermissionsAndCallTool(tool, toolUseID, input, toolUseContext, canUseTool, assistantMessage, messageId, requestId, mcpServerType, mcpServerBaseUrl, function (progress) {
        var _a, _b, _c;
        (0, index_js_1.logEvent)('tengu_tool_use_progress', __assign(__assign(__assign(__assign({ messageID: messageId, toolName: (0, metadata_js_1.sanitizeToolNameForAnalytics)(tool.name), isMcp: (_a = tool.isMcp) !== null && _a !== void 0 ? _a : false, queryChainId: (_b = toolUseContext.queryTracking) === null || _b === void 0 ? void 0 : _b.chainId, queryDepth: (_c = toolUseContext.queryTracking) === null || _c === void 0 ? void 0 : _c.depth }, (mcpServerType && {
            mcpServerType: mcpServerType,
        })), (mcpServerBaseUrl && {
            mcpServerBaseUrl: mcpServerBaseUrl,
        })), (requestId && {
            requestId: requestId,
        })), (0, metadata_js_1.mcpToolDetailsForAnalytics)(tool.name, mcpServerType, mcpServerBaseUrl)));
        stream.enqueue({
            message: (0, messages_js_1.createProgressMessage)({
                toolUseID: progress.toolUseID,
                parentToolUseID: toolUseID,
                data: progress.data,
            }),
        });
    })
        .then(function (results) {
        for (var _i = 0, results_1 = results; _i < results_1.length; _i++) {
            var result = results_1[_i];
            stream.enqueue(result);
        }
    })
        .catch(function (error) {
        stream.error(error);
    })
        .finally(function () {
        stream.done();
    });
    return stream;
}
/**
 * Appended to Zod errors when a deferred tool wasn't in the discovered-tool
 * set — re-runs the claude.ts schema-filter scan dispatch-time to detect the
 * mismatch. The raw Zod error ("expected array, got string") doesn't tell the
 * model to re-load the tool; this hint does. Null if the schema was sent.
 */
function buildSchemaNotSentHint(tool, messages, tools) {
    // Optimistic gating — reconstructing claude.ts's full useToolSearch
    // computation is fragile. These two gates prevent pointing at a ToolSearch
    // that isn't callable; occasional misfires (Haiku, tst-auto below threshold)
    // cost one extra round-trip on an already-failing path.
    if (!(0, toolSearch_js_1.isToolSearchEnabledOptimistic)())
        return null;
    if (!(0, toolSearch_js_1.isToolSearchToolAvailable)(tools))
        return null;
    if (!(0, prompt_js_3.isDeferredTool)(tool))
        return null;
    var discovered = (0, toolSearch_js_1.extractDiscoveredToolNames)(messages);
    if (discovered.has(tool.name))
        return null;
    return ("\n\nThis tool's schema was not sent to the API \u2014 it was not in the discovered-tool set derived from message history. " +
        "Without the schema in your prompt, typed parameters (arrays, numbers, booleans) get emitted as strings and the client-side parser rejects them. " +
        "Load the tool first: call ".concat(prompt_js_3.TOOL_SEARCH_TOOL_NAME, " with query \"select:").concat(tool.name, "\", then retry this call."));
}
function checkPermissionsAndCallTool(tool, toolUseID, input, toolUseContext, canUseTool, assistantMessage, messageId, requestId, mcpServerType, mcpServerBaseUrl, onToolProgress) {
    return __awaiter(this, void 0, void 0, function () {
        function addToolResult(toolUseResult, preMappedBlock) {
            return __awaiter(this, void 0, void 0, function () {
                var toolResultBlock, _a, contentBlocks, allowContentBlocks, allowImageIds, imageCount, startId_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!preMappedBlock) return [3 /*break*/, 2];
                            return [4 /*yield*/, (0, toolResultStorage_js_1.processPreMappedToolResultBlock)(preMappedBlock, tool.name, tool.maxResultSizeChars)];
                        case 1:
                            _a = _b.sent();
                            return [3 /*break*/, 4];
                        case 2: return [4 /*yield*/, (0, toolResultStorage_js_1.processToolResultBlock)(tool, toolUseResult, toolUseID)
                            // Build content blocks - tool result first, then optional feedback
                        ];
                        case 3:
                            _a = _b.sent();
                            _b.label = 4;
                        case 4:
                            toolResultBlock = _a;
                            contentBlocks = [toolResultBlock];
                            // Add accept feedback if user provided feedback when approving
                            // (acceptFeedback only exists on PermissionAllowDecision, which is guaranteed here)
                            if ('acceptFeedback' in permissionDecision &&
                                permissionDecision.acceptFeedback) {
                                contentBlocks.push({
                                    type: 'text',
                                    text: permissionDecision.acceptFeedback,
                                });
                            }
                            allowContentBlocks = 'contentBlocks' in permissionDecision
                                ? permissionDecision.contentBlocks
                                : undefined;
                            if (allowContentBlocks === null || allowContentBlocks === void 0 ? void 0 : allowContentBlocks.length) {
                                contentBlocks.push.apply(contentBlocks, allowContentBlocks);
                            }
                            if (allowContentBlocks === null || allowContentBlocks === void 0 ? void 0 : allowContentBlocks.length) {
                                imageCount = (0, array_js_1.count)(allowContentBlocks, function (b) { return b.type === 'image'; });
                                if (imageCount > 0) {
                                    startId_1 = getNextImagePasteId(toolUseContext.messages);
                                    allowImageIds = Array.from({ length: imageCount }, function (_, i) { return startId_1 + i; });
                                }
                            }
                            resultingMessages.push({
                                message: (0, messages_js_1.createUserMessage)({
                                    content: contentBlocks,
                                    imagePasteIds: allowImageIds,
                                    toolUseResult: toolUseContext.agentId && !toolUseContext.preserveToolUseResults
                                        ? undefined
                                        : toolUseResult,
                                    mcpMeta: toolUseContext.agentId ? undefined : mcpMeta_1,
                                    sourceToolAssistantUUID: assistantMessage.uuid,
                                }),
                                contextModifier: toolContextModifier_1
                                    ? {
                                        toolUseID: toolUseID,
                                        modifyContext: toolContextModifier_1,
                                    }
                                    : undefined,
                            });
                            return [2 /*return*/];
                    }
                });
            });
        }
        var parsedInput, errorContent, schemaHint, isValidCall, appState, resultingMessages, processedInput, _a, _1, rest, callInput, backfilledClone, shouldPreventContinuation, stopReason, hookPermissionResult, preToolHookInfos, preToolHookStart, _b, _c, _d, result, att, e_2_1, preToolHookDurationMs, toolAttributes, bashInput, permissionMode, permissionStart, resolved, permissionDecision, permissionDurationMs, decision, source, decisionInfo_1, errorMessage_2, messageContent, rejectContentBlocks, rejectImageIds, imageCount, startId_2, hookSaysRetry, _e, _f, _g, result, e_3_1, telemetryToolInput, toolParameters, bashInput, commandParts, bashCommand, mcpDetails, skillName, decisionInfo, startTime, result, durationMs, contentAttributes, bashInput, toolResultStr, mappedToolResultBlock, mappedContent, toolResultSizeBytes, fileExtension, bashInput, gitCommitId, mcpServerScope, toolOutput, hookResults, toolContextModifier_1, mcpMeta_1, postToolHookInfos, postToolHookStart, _h, _j, _k, hookResult, att, att, e_4_1, postToolHookDurationMs, _i, _l, message, _m, hookResults_1, hookResult, error_2, durationMs, errorMsg, mcpServerScope, content, isInterrupt, hookMessages, _o, _p, _q, hookResult, e_5_1;
        var _r, e_2, _s, _t, _u, e_3, _v, _w, _x, e_4, _y, _z, _0, e_5, _1, _2;
        var _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32, _33;
        return __generator(this, function (_34) {
            switch (_34.label) {
                case 0:
                    parsedInput = tool.inputSchema.safeParse(input);
                    if (!parsedInput.success) {
                        errorContent = (0, toolErrors_js_1.formatZodValidationError)(tool.name, parsedInput.error);
                        schemaHint = buildSchemaNotSentHint(tool, toolUseContext.messages, toolUseContext.options.tools);
                        if (schemaHint) {
                            (0, index_js_1.logEvent)('tengu_deferred_tool_schema_not_sent', {
                                toolName: (0, metadata_js_1.sanitizeToolNameForAnalytics)(tool.name),
                                isMcp: (_3 = tool.isMcp) !== null && _3 !== void 0 ? _3 : false,
                            });
                            errorContent += schemaHint;
                        }
                        (0, debug_js_1.logForDebugging)("".concat(tool.name, " tool input error: ").concat(errorContent.slice(0, 200)));
                        (0, index_js_1.logEvent)('tengu_tool_use_error', __assign(__assign(__assign(__assign({ error: 'InputValidationError', errorDetails: errorContent.slice(0, 2000), messageID: messageId, toolName: (0, metadata_js_1.sanitizeToolNameForAnalytics)(tool.name), isMcp: (_4 = tool.isMcp) !== null && _4 !== void 0 ? _4 : false, queryChainId: (_5 = toolUseContext.queryTracking) === null || _5 === void 0 ? void 0 : _5.chainId, queryDepth: (_6 = toolUseContext.queryTracking) === null || _6 === void 0 ? void 0 : _6.depth }, (mcpServerType && {
                            mcpServerType: mcpServerType,
                        })), (mcpServerBaseUrl && {
                            mcpServerBaseUrl: mcpServerBaseUrl,
                        })), (requestId && {
                            requestId: requestId,
                        })), (0, metadata_js_1.mcpToolDetailsForAnalytics)(tool.name, mcpServerType, mcpServerBaseUrl)));
                        return [2 /*return*/, [
                                {
                                    message: (0, messages_js_1.createUserMessage)({
                                        content: [
                                            {
                                                type: 'tool_result',
                                                content: "<tool_use_error>InputValidationError: ".concat(errorContent, "</tool_use_error>"),
                                                is_error: true,
                                                tool_use_id: toolUseID,
                                            },
                                        ],
                                        toolUseResult: "InputValidationError: ".concat(parsedInput.error.message),
                                        sourceToolAssistantUUID: assistantMessage.uuid,
                                    }),
                                },
                            ]];
                    }
                    return [4 /*yield*/, ((_7 = tool.validateInput) === null || _7 === void 0 ? void 0 : _7.call(tool, parsedInput.data, toolUseContext))];
                case 1:
                    isValidCall = _34.sent();
                    if ((isValidCall === null || isValidCall === void 0 ? void 0 : isValidCall.result) === false) {
                        (0, debug_js_1.logForDebugging)("".concat(tool.name, " tool validation error: ").concat((_8 = isValidCall.message) === null || _8 === void 0 ? void 0 : _8.slice(0, 200)));
                        (0, index_js_1.logEvent)('tengu_tool_use_error', __assign(__assign(__assign(__assign({ messageID: messageId, toolName: (0, metadata_js_1.sanitizeToolNameForAnalytics)(tool.name), error: isValidCall.message, errorCode: isValidCall.errorCode, isMcp: (_9 = tool.isMcp) !== null && _9 !== void 0 ? _9 : false, queryChainId: (_10 = toolUseContext.queryTracking) === null || _10 === void 0 ? void 0 : _10.chainId, queryDepth: (_11 = toolUseContext.queryTracking) === null || _11 === void 0 ? void 0 : _11.depth }, (mcpServerType && {
                            mcpServerType: mcpServerType,
                        })), (mcpServerBaseUrl && {
                            mcpServerBaseUrl: mcpServerBaseUrl,
                        })), (requestId && {
                            requestId: requestId,
                        })), (0, metadata_js_1.mcpToolDetailsForAnalytics)(tool.name, mcpServerType, mcpServerBaseUrl)));
                        return [2 /*return*/, [
                                {
                                    message: (0, messages_js_1.createUserMessage)({
                                        content: [
                                            {
                                                type: 'tool_result',
                                                content: "<tool_use_error>".concat(isValidCall.message, "</tool_use_error>"),
                                                is_error: true,
                                                tool_use_id: toolUseID,
                                            },
                                        ],
                                        toolUseResult: "Error: ".concat(isValidCall.message),
                                        sourceToolAssistantUUID: assistantMessage.uuid,
                                    }),
                                },
                            ]];
                    }
                    // Speculatively start the bash allow classifier check early so it runs in
                    // parallel with pre-tool hooks, deny/ask classifiers, and permission dialog
                    // setup. The UI indicator (setClassifierChecking) is NOT set here — it's
                    // set in interactiveHandler.ts only when the permission check returns `ask`
                    // with a pendingClassifierCheck. This avoids flashing "classifier running"
                    // for commands that auto-allow via prefix rules.
                    if (tool.name === toolName_js_1.BASH_TOOL_NAME &&
                        parsedInput.data &&
                        'command' in parsedInput.data) {
                        appState = toolUseContext.getAppState();
                        (0, bashPermissions_js_1.startSpeculativeClassifierCheck)(parsedInput.data.command, appState.toolPermissionContext, toolUseContext.abortController.signal, toolUseContext.options.isNonInteractiveSession);
                    }
                    resultingMessages = [];
                    processedInput = parsedInput.data;
                    if (tool.name === toolName_js_1.BASH_TOOL_NAME &&
                        processedInput &&
                        typeof processedInput === 'object' &&
                        '_simulatedSedEdit' in processedInput) {
                        _a = processedInput, _1 = _a._simulatedSedEdit, rest = __rest(_a, ["_simulatedSedEdit"]);
                        processedInput = rest;
                    }
                    callInput = processedInput;
                    backfilledClone = tool.backfillObservableInput &&
                        typeof processedInput === 'object' &&
                        processedInput !== null
                        ? __assign({}, processedInput)
                        : null;
                    if (backfilledClone) {
                        tool.backfillObservableInput(backfilledClone);
                        processedInput = backfilledClone;
                    }
                    shouldPreventContinuation = false;
                    preToolHookInfos = [];
                    preToolHookStart = Date.now();
                    _34.label = 2;
                case 2:
                    _34.trys.push([2, 7, 8, 13]);
                    _b = true, _c = __asyncValues((0, toolHooks_js_1.runPreToolUseHooks)(toolUseContext, tool, processedInput, toolUseID, assistantMessage.message.id, requestId, mcpServerType, mcpServerBaseUrl));
                    _34.label = 3;
                case 3: return [4 /*yield*/, _c.next()];
                case 4:
                    if (!(_d = _34.sent(), _r = _d.done, !_r)) return [3 /*break*/, 6];
                    _t = _d.value;
                    _b = false;
                    result = _t;
                    switch (result.type) {
                        case 'message':
                            if (result.message.message.type === 'progress') {
                                onToolProgress(result.message.message);
                            }
                            else {
                                resultingMessages.push(result.message);
                                att = result.message.message.attachment;
                                if (att &&
                                    'command' in att &&
                                    att.command !== undefined &&
                                    'durationMs' in att &&
                                    att.durationMs !== undefined) {
                                    preToolHookInfos.push({
                                        command: att.command,
                                        durationMs: att.durationMs,
                                    });
                                }
                            }
                            break;
                        case 'hookPermissionResult':
                            hookPermissionResult = result.hookPermissionResult;
                            break;
                        case 'hookUpdatedInput':
                            // Hook provided updatedInput without making a permission decision (passthrough)
                            // Update processedInput so it's used in the normal permission flow
                            processedInput = result.updatedInput;
                            break;
                        case 'preventContinuation':
                            shouldPreventContinuation = result.shouldPreventContinuation;
                            break;
                        case 'stopReason':
                            stopReason = result.stopReason;
                            break;
                        case 'additionalContext':
                            resultingMessages.push(result.message);
                            break;
                        case 'stop':
                            (_12 = (0, state_js_1.getStatsStore)()) === null || _12 === void 0 ? void 0 : _12.observe('pre_tool_hook_duration_ms', Date.now() - preToolHookStart);
                            resultingMessages.push({
                                message: (0, messages_js_1.createUserMessage)({
                                    content: [(0, messages_js_1.createToolResultStopMessage)(toolUseID)],
                                    toolUseResult: "Error: ".concat(stopReason),
                                    sourceToolAssistantUUID: assistantMessage.uuid,
                                }),
                            });
                            return [2 /*return*/, resultingMessages];
                    }
                    _34.label = 5;
                case 5:
                    _b = true;
                    return [3 /*break*/, 3];
                case 6: return [3 /*break*/, 13];
                case 7:
                    e_2_1 = _34.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 13];
                case 8:
                    _34.trys.push([8, , 11, 12]);
                    if (!(!_b && !_r && (_s = _c.return))) return [3 /*break*/, 10];
                    return [4 /*yield*/, _s.call(_c)];
                case 9:
                    _34.sent();
                    _34.label = 10;
                case 10: return [3 /*break*/, 12];
                case 11:
                    if (e_2) throw e_2.error;
                    return [7 /*endfinally*/];
                case 12: return [7 /*endfinally*/];
                case 13:
                    preToolHookDurationMs = Date.now() - preToolHookStart;
                    (_13 = (0, state_js_1.getStatsStore)()) === null || _13 === void 0 ? void 0 : _13.observe('pre_tool_hook_duration_ms', preToolHookDurationMs);
                    if (preToolHookDurationMs >= SLOW_PHASE_LOG_THRESHOLD_MS) {
                        (0, debug_js_1.logForDebugging)("Slow PreToolUse hooks: ".concat(preToolHookDurationMs, "ms for ").concat(tool.name, " (").concat(preToolHookInfos.length, " hooks)"), { level: 'info' });
                    }
                    // Emit PreToolUse summary immediately so it's visible while the tool executes.
                    // Use wall-clock time (not sum of individual durations) since hooks run in parallel.
                    if (process.env.USER_TYPE === 'ant' && preToolHookInfos.length > 0) {
                        if (preToolHookDurationMs > exports.HOOK_TIMING_DISPLAY_THRESHOLD_MS) {
                            resultingMessages.push({
                                message: (0, messages_js_1.createStopHookSummaryMessage)(preToolHookInfos.length, preToolHookInfos, [], false, undefined, false, 'suggestion', undefined, 'PreToolUse', preToolHookDurationMs),
                            });
                        }
                    }
                    toolAttributes = {};
                    if (processedInput && typeof processedInput === 'object') {
                        if (tool.name === prompt_js_1.FILE_READ_TOOL_NAME && 'file_path' in processedInput) {
                            toolAttributes.file_path = String(processedInput.file_path);
                        }
                        else if ((tool.name === constants_js_1.FILE_EDIT_TOOL_NAME ||
                            tool.name === prompt_js_2.FILE_WRITE_TOOL_NAME) &&
                            'file_path' in processedInput) {
                            toolAttributes.file_path = String(processedInput.file_path);
                        }
                        else if (tool.name === toolName_js_1.BASH_TOOL_NAME && 'command' in processedInput) {
                            bashInput = processedInput;
                            toolAttributes.full_command = bashInput.command;
                        }
                    }
                    (0, sessionTracing_js_1.startToolSpan)(tool.name, toolAttributes, (0, sessionTracing_js_1.isBetaTracingEnabled)() ? (0, slowOperations_js_1.jsonStringify)(processedInput) : undefined);
                    (0, sessionTracing_js_1.startToolBlockedOnUserSpan)();
                    permissionMode = toolUseContext.getAppState().toolPermissionContext.mode;
                    permissionStart = Date.now();
                    return [4 /*yield*/, (0, toolHooks_js_1.resolveHookPermissionDecision)(hookPermissionResult, tool, processedInput, toolUseContext, canUseTool, assistantMessage, toolUseID)];
                case 14:
                    resolved = _34.sent();
                    permissionDecision = resolved.decision;
                    processedInput = resolved.input;
                    permissionDurationMs = Date.now() - permissionStart;
                    // In auto mode, canUseTool awaits the classifier (side_query) — if that's
                    // slow the collapsed view shows "Running…" with no (Ns) tick since
                    // bash_progress hasn't started yet. Auto-only: in default mode this timer
                    // includes interactive-dialog wait (user think time), which is just noise.
                    if (permissionDurationMs >= SLOW_PHASE_LOG_THRESHOLD_MS &&
                        permissionMode === 'auto') {
                        (0, debug_js_1.logForDebugging)("Slow permission decision: ".concat(permissionDurationMs, "ms for ").concat(tool.name, " ") +
                            "(mode=".concat(permissionMode, ", behavior=").concat(permissionDecision.behavior, ")"), { level: 'info' });
                    }
                    // Emit tool_decision OTel event and code-edit counter if the interactive
                    // permission path didn't already log it (headless mode bypasses permission
                    // logging, so we need to emit both the generic event and the code-edit
                    // counter here)
                    if (permissionDecision.behavior !== 'ask' &&
                        !((_14 = toolUseContext.toolDecisions) === null || _14 === void 0 ? void 0 : _14.has(toolUseID))) {
                        decision = permissionDecision.behavior === 'allow' ? 'accept' : 'reject';
                        source = decisionReasonToOTelSource(permissionDecision.decisionReason, permissionDecision.behavior);
                        void (0, events_js_1.logOTelEvent)('tool_decision', {
                            decision: decision,
                            source: source,
                            tool_name: (0, metadata_js_1.sanitizeToolNameForAnalytics)(tool.name),
                        });
                        // Increment code-edit tool decision counter for headless mode
                        if ((0, permissionLogging_js_1.isCodeEditingTool)(tool.name)) {
                            void (0, permissionLogging_js_1.buildCodeEditToolAttributes)(tool, processedInput, decision, source).then(function (attributes) { var _a; return (_a = (0, state_js_1.getCodeEditToolDecisionCounter)()) === null || _a === void 0 ? void 0 : _a.add(1, attributes); });
                        }
                    }
                    // Add message if permission was granted/denied by PermissionRequest hook
                    if (((_15 = permissionDecision.decisionReason) === null || _15 === void 0 ? void 0 : _15.type) === 'hook' &&
                        permissionDecision.decisionReason.hookName === 'PermissionRequest' &&
                        permissionDecision.behavior !== 'ask') {
                        resultingMessages.push({
                            message: (0, attachments_js_1.createAttachmentMessage)({
                                type: 'hook_permission_decision',
                                decision: permissionDecision.behavior,
                                toolUseID: toolUseID,
                                hookEvent: 'PermissionRequest',
                            }),
                        });
                    }
                    if (!(permissionDecision.behavior !== 'allow')) return [3 /*break*/, 28];
                    (0, debug_js_1.logForDebugging)("".concat(tool.name, " tool permission denied"));
                    decisionInfo_1 = (_16 = toolUseContext.toolDecisions) === null || _16 === void 0 ? void 0 : _16.get(toolUseID);
                    (0, sessionTracing_js_1.endToolBlockedOnUserSpan)('reject', (decisionInfo_1 === null || decisionInfo_1 === void 0 ? void 0 : decisionInfo_1.source) || 'unknown');
                    (0, sessionTracing_js_1.endToolSpan)();
                    (0, index_js_1.logEvent)('tengu_tool_use_can_use_tool_rejected', __assign(__assign(__assign(__assign({ messageID: messageId, toolName: (0, metadata_js_1.sanitizeToolNameForAnalytics)(tool.name), queryChainId: (_17 = toolUseContext.queryTracking) === null || _17 === void 0 ? void 0 : _17.chainId, queryDepth: (_18 = toolUseContext.queryTracking) === null || _18 === void 0 ? void 0 : _18.depth }, (mcpServerType && {
                        mcpServerType: mcpServerType,
                    })), (mcpServerBaseUrl && {
                        mcpServerBaseUrl: mcpServerBaseUrl,
                    })), (requestId && {
                        requestId: requestId,
                    })), (0, metadata_js_1.mcpToolDetailsForAnalytics)(tool.name, mcpServerType, mcpServerBaseUrl)));
                    errorMessage_2 = permissionDecision.message;
                    // Only use generic "Execution stopped" message if we don't have a detailed hook message
                    if (shouldPreventContinuation && !errorMessage_2) {
                        errorMessage_2 = "Execution stopped by PreToolUse hook".concat(stopReason ? ": ".concat(stopReason) : '');
                    }
                    messageContent = [
                        {
                            type: 'tool_result',
                            content: errorMessage_2,
                            is_error: true,
                            tool_use_id: toolUseID,
                        },
                    ];
                    rejectContentBlocks = permissionDecision.behavior === 'ask'
                        ? permissionDecision.contentBlocks
                        : undefined;
                    if (rejectContentBlocks === null || rejectContentBlocks === void 0 ? void 0 : rejectContentBlocks.length) {
                        messageContent.push.apply(messageContent, rejectContentBlocks);
                    }
                    rejectImageIds = void 0;
                    if (rejectContentBlocks === null || rejectContentBlocks === void 0 ? void 0 : rejectContentBlocks.length) {
                        imageCount = (0, array_js_1.count)(rejectContentBlocks, function (b) { return b.type === 'image'; });
                        if (imageCount > 0) {
                            startId_2 = getNextImagePasteId(toolUseContext.messages);
                            rejectImageIds = Array.from({ length: imageCount }, function (_, i) { return startId_2 + i; });
                        }
                    }
                    resultingMessages.push({
                        message: (0, messages_js_1.createUserMessage)({
                            content: messageContent,
                            imagePasteIds: rejectImageIds,
                            toolUseResult: "Error: ".concat(errorMessage_2),
                            sourceToolAssistantUUID: assistantMessage.uuid,
                        }),
                    });
                    if (!((0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER') &&
                        ((_19 = permissionDecision.decisionReason) === null || _19 === void 0 ? void 0 : _19.type) === 'classifier' &&
                        permissionDecision.decisionReason.classifier === 'auto-mode')) return [3 /*break*/, 27];
                    hookSaysRetry = false;
                    _34.label = 15;
                case 15:
                    _34.trys.push([15, 20, 21, 26]);
                    _e = true, _f = __asyncValues((0, hooks_js_1.executePermissionDeniedHooks)(tool.name, toolUseID, processedInput, (_20 = permissionDecision.decisionReason.reason) !== null && _20 !== void 0 ? _20 : 'Permission denied', toolUseContext, permissionMode, toolUseContext.abortController.signal));
                    _34.label = 16;
                case 16: return [4 /*yield*/, _f.next()];
                case 17:
                    if (!(_g = _34.sent(), _u = _g.done, !_u)) return [3 /*break*/, 19];
                    _w = _g.value;
                    _e = false;
                    result = _w;
                    if (result.retry)
                        hookSaysRetry = true;
                    _34.label = 18;
                case 18:
                    _e = true;
                    return [3 /*break*/, 16];
                case 19: return [3 /*break*/, 26];
                case 20:
                    e_3_1 = _34.sent();
                    e_3 = { error: e_3_1 };
                    return [3 /*break*/, 26];
                case 21:
                    _34.trys.push([21, , 24, 25]);
                    if (!(!_e && !_u && (_v = _f.return))) return [3 /*break*/, 23];
                    return [4 /*yield*/, _v.call(_f)];
                case 22:
                    _34.sent();
                    _34.label = 23;
                case 23: return [3 /*break*/, 25];
                case 24:
                    if (e_3) throw e_3.error;
                    return [7 /*endfinally*/];
                case 25: return [7 /*endfinally*/];
                case 26:
                    if (hookSaysRetry) {
                        resultingMessages.push({
                            message: (0, messages_js_1.createUserMessage)({
                                content: 'The PermissionDenied hook indicated this command is now approved. You may retry it if you would like.',
                                isMeta: true,
                            }),
                        });
                    }
                    _34.label = 27;
                case 27: return [2 /*return*/, resultingMessages];
                case 28:
                    (0, index_js_1.logEvent)('tengu_tool_use_can_use_tool_allowed', __assign(__assign(__assign(__assign({ messageID: messageId, toolName: (0, metadata_js_1.sanitizeToolNameForAnalytics)(tool.name), queryChainId: (_21 = toolUseContext.queryTracking) === null || _21 === void 0 ? void 0 : _21.chainId, queryDepth: (_22 = toolUseContext.queryTracking) === null || _22 === void 0 ? void 0 : _22.depth }, (mcpServerType && {
                        mcpServerType: mcpServerType,
                    })), (mcpServerBaseUrl && {
                        mcpServerBaseUrl: mcpServerBaseUrl,
                    })), (requestId && {
                        requestId: requestId,
                    })), (0, metadata_js_1.mcpToolDetailsForAnalytics)(tool.name, mcpServerType, mcpServerBaseUrl)));
                    // Use the updated input from permissions if provided
                    // (Don't overwrite if undefined - processedInput may have been modified by passthrough hooks)
                    if (permissionDecision.updatedInput !== undefined) {
                        processedInput = permissionDecision.updatedInput;
                    }
                    telemetryToolInput = (0, metadata_js_1.extractToolInputForTelemetry)(processedInput);
                    toolParameters = {};
                    if ((0, metadata_js_1.isToolDetailsLoggingEnabled)()) {
                        if (tool.name === toolName_js_1.BASH_TOOL_NAME && 'command' in processedInput) {
                            bashInput = processedInput;
                            commandParts = bashInput.command.trim().split(/\s+/);
                            bashCommand = commandParts[0] || '';
                            toolParameters = __assign(__assign(__assign({ bash_command: bashCommand, full_command: bashInput.command }, (bashInput.timeout !== undefined && {
                                timeout: bashInput.timeout,
                            })), (bashInput.description !== undefined && {
                                description: bashInput.description,
                            })), ('dangerouslyDisableSandbox' in bashInput && {
                                dangerouslyDisableSandbox: bashInput.dangerouslyDisableSandbox,
                            }));
                        }
                        mcpDetails = (0, metadata_js_1.extractMcpToolDetails)(tool.name);
                        if (mcpDetails) {
                            toolParameters.mcp_server_name = mcpDetails.serverName;
                            toolParameters.mcp_tool_name = mcpDetails.mcpToolName;
                        }
                        skillName = (0, metadata_js_1.extractSkillName)(tool.name, processedInput);
                        if (skillName) {
                            toolParameters.skill_name = skillName;
                        }
                    }
                    decisionInfo = (_23 = toolUseContext.toolDecisions) === null || _23 === void 0 ? void 0 : _23.get(toolUseID);
                    (0, sessionTracing_js_1.endToolBlockedOnUserSpan)((decisionInfo === null || decisionInfo === void 0 ? void 0 : decisionInfo.decision) || 'unknown', (decisionInfo === null || decisionInfo === void 0 ? void 0 : decisionInfo.source) || 'unknown');
                    (0, sessionTracing_js_1.startToolExecutionSpan)();
                    startTime = Date.now();
                    (0, sessionActivity_js_1.startSessionActivity)('tool_exec');
                    // If processedInput still points at the backfill clone, no hook/permission
                    // replaced it — pass the pre-backfill callInput so call() sees the model's
                    // original field values. Otherwise converge on the hook-supplied input.
                    // Permission/hook flows may return a fresh object derived from the
                    // backfilled clone (e.g. via inputSchema.parse). If its file_path matches
                    // the backfill-expanded value, restore the model's original so the tool
                    // result string embeds the path the model emitted — keeps transcript/VCR
                    // hashes stable. Other hook modifications flow through unchanged.
                    if (backfilledClone &&
                        processedInput !== callInput &&
                        typeof processedInput === 'object' &&
                        processedInput !== null &&
                        'file_path' in processedInput &&
                        'file_path' in callInput &&
                        processedInput.file_path ===
                            backfilledClone.file_path) {
                        callInput = __assign(__assign({}, processedInput), { file_path: callInput.file_path });
                    }
                    else if (processedInput !== backfilledClone) {
                        callInput = processedInput;
                    }
                    _34.label = 29;
                case 29:
                    _34.trys.push([29, 47, 60, 61]);
                    return [4 /*yield*/, tool.call(callInput, __assign(__assign({}, toolUseContext), { toolUseId: toolUseID, userModified: (_24 = permissionDecision.userModified) !== null && _24 !== void 0 ? _24 : false }), canUseTool, assistantMessage, function (progress) {
                            onToolProgress({
                                toolUseID: progress.toolUseID,
                                data: progress.data,
                            });
                        })];
                case 30:
                    result = _34.sent();
                    durationMs = Date.now() - startTime;
                    (0, state_js_1.addToToolDuration)(durationMs);
                    // Log tool content/output as span event if enabled
                    if (result.data && typeof result.data === 'object') {
                        contentAttributes = {};
                        // Read tool: capture file_path and content
                        if (tool.name === prompt_js_1.FILE_READ_TOOL_NAME && 'content' in result.data) {
                            if ('file_path' in processedInput) {
                                contentAttributes.file_path = String(processedInput.file_path);
                            }
                            contentAttributes.content = String(result.data.content);
                        }
                        // Edit/Write tools: capture file_path and diff
                        if ((tool.name === constants_js_1.FILE_EDIT_TOOL_NAME ||
                            tool.name === prompt_js_2.FILE_WRITE_TOOL_NAME) &&
                            'file_path' in processedInput) {
                            contentAttributes.file_path = String(processedInput.file_path);
                            // For Edit, capture the actual changes made
                            if (tool.name === constants_js_1.FILE_EDIT_TOOL_NAME && 'diff' in result.data) {
                                contentAttributes.diff = String(result.data.diff);
                            }
                            // For Write, capture the written content
                            if (tool.name === prompt_js_2.FILE_WRITE_TOOL_NAME && 'content' in processedInput) {
                                contentAttributes.content = String(processedInput.content);
                            }
                        }
                        // Bash tool: capture command
                        if (tool.name === toolName_js_1.BASH_TOOL_NAME && 'command' in processedInput) {
                            bashInput = processedInput;
                            contentAttributes.bash_command = bashInput.command;
                            // Also capture output if available
                            if ('output' in result.data) {
                                contentAttributes.output = String(result.data.output);
                            }
                        }
                        if (Object.keys(contentAttributes).length > 0) {
                            (0, sessionTracing_js_1.addToolContentEvent)('tool.output', contentAttributes);
                        }
                    }
                    // Capture structured output from tool result if present
                    if (typeof result === 'object' && 'structured_output' in result) {
                        // Store the structured output in an attachment message
                        resultingMessages.push({
                            message: (0, attachments_js_1.createAttachmentMessage)({
                                type: 'structured_output',
                                data: result.structured_output,
                            }),
                        });
                    }
                    (0, sessionTracing_js_1.endToolExecutionSpan)({ success: true });
                    toolResultStr = result.data && typeof result.data === 'object'
                        ? (0, slowOperations_js_1.jsonStringify)(result.data)
                        : String((_25 = result.data) !== null && _25 !== void 0 ? _25 : '');
                    (0, sessionTracing_js_1.endToolSpan)(toolResultStr);
                    mappedToolResultBlock = tool.mapToolResultToToolResultBlockParam(result.data, toolUseID);
                    mappedContent = mappedToolResultBlock.content;
                    toolResultSizeBytes = !mappedContent
                        ? 0
                        : typeof mappedContent === 'string'
                            ? mappedContent.length
                            : (0, slowOperations_js_1.jsonStringify)(mappedContent).length;
                    fileExtension = void 0;
                    if (processedInput && typeof processedInput === 'object') {
                        if ((tool.name === prompt_js_1.FILE_READ_TOOL_NAME ||
                            tool.name === constants_js_1.FILE_EDIT_TOOL_NAME ||
                            tool.name === prompt_js_2.FILE_WRITE_TOOL_NAME) &&
                            'file_path' in processedInput) {
                            fileExtension = (0, metadata_js_1.getFileExtensionForAnalytics)(String(processedInput.file_path));
                        }
                        else if (tool.name === constants_js_2.NOTEBOOK_EDIT_TOOL_NAME &&
                            'notebook_path' in processedInput) {
                            fileExtension = (0, metadata_js_1.getFileExtensionForAnalytics)(String(processedInput.notebook_path));
                        }
                        else if (tool.name === toolName_js_1.BASH_TOOL_NAME && 'command' in processedInput) {
                            bashInput = processedInput;
                            fileExtension = (0, metadata_js_1.getFileExtensionsFromBashCommand)(bashInput.command, (_26 = bashInput._simulatedSedEdit) === null || _26 === void 0 ? void 0 : _26.filePath);
                        }
                    }
                    (0, index_js_1.logEvent)('tengu_tool_use_success', __assign(__assign(__assign(__assign(__assign(__assign({ messageID: messageId, toolName: (0, metadata_js_1.sanitizeToolNameForAnalytics)(tool.name), isMcp: (_27 = tool.isMcp) !== null && _27 !== void 0 ? _27 : false, durationMs: durationMs, preToolHookDurationMs: preToolHookDurationMs, toolResultSizeBytes: toolResultSizeBytes }, (fileExtension !== undefined && { fileExtension: fileExtension })), { queryChainId: (_28 = toolUseContext.queryTracking) === null || _28 === void 0 ? void 0 : _28.chainId, queryDepth: (_29 = toolUseContext.queryTracking) === null || _29 === void 0 ? void 0 : _29.depth }), (mcpServerType && {
                        mcpServerType: mcpServerType,
                    })), (mcpServerBaseUrl && {
                        mcpServerBaseUrl: mcpServerBaseUrl,
                    })), (requestId && {
                        requestId: requestId,
                    })), (0, metadata_js_1.mcpToolDetailsForAnalytics)(tool.name, mcpServerType, mcpServerBaseUrl)));
                    // Enrich tool parameters with git commit ID from successful git commit output
                    if ((0, metadata_js_1.isToolDetailsLoggingEnabled)() &&
                        (tool.name === toolName_js_1.BASH_TOOL_NAME || tool.name === toolName_js_2.POWERSHELL_TOOL_NAME) &&
                        'command' in processedInput &&
                        typeof processedInput.command === 'string' &&
                        processedInput.command.match(/\bgit\s+commit\b/) &&
                        result.data &&
                        typeof result.data === 'object' &&
                        'stdout' in result.data) {
                        gitCommitId = (0, gitOperationTracking_js_1.parseGitCommitId)(String(result.data.stdout));
                        if (gitCommitId) {
                            toolParameters.git_commit_id = gitCommitId;
                        }
                    }
                    mcpServerScope = (0, utils_js_1.isMcpTool)(tool)
                        ? (0, utils_js_1.getMcpServerScopeFromToolName)(tool.name)
                        : null;
                    void (0, events_js_1.logOTelEvent)('tool_result', __assign(__assign(__assign(__assign(__assign({ tool_name: (0, metadata_js_1.sanitizeToolNameForAnalytics)(tool.name), success: 'true', duration_ms: String(durationMs) }, (Object.keys(toolParameters).length > 0 && {
                        tool_parameters: (0, slowOperations_js_1.jsonStringify)(toolParameters),
                    })), (telemetryToolInput && { tool_input: telemetryToolInput })), { tool_result_size_bytes: String(toolResultSizeBytes) }), (decisionInfo && {
                        decision_source: decisionInfo.source,
                        decision_type: decisionInfo.decision,
                    })), (mcpServerScope && { mcp_server_scope: mcpServerScope })));
                    toolOutput = result.data;
                    hookResults = [];
                    toolContextModifier_1 = result.contextModifier;
                    mcpMeta_1 = result.mcpMeta;
                    if (!!(0, utils_js_1.isMcpTool)(tool)) return [3 /*break*/, 32];
                    return [4 /*yield*/, addToolResult(toolOutput, mappedToolResultBlock)];
                case 31:
                    _34.sent();
                    _34.label = 32;
                case 32:
                    postToolHookInfos = [];
                    postToolHookStart = Date.now();
                    _34.label = 33;
                case 33:
                    _34.trys.push([33, 38, 39, 44]);
                    _h = true, _j = __asyncValues((0, toolHooks_js_1.runPostToolUseHooks)(toolUseContext, tool, toolUseID, assistantMessage.message.id, processedInput, toolOutput, requestId, mcpServerType, mcpServerBaseUrl));
                    _34.label = 34;
                case 34: return [4 /*yield*/, _j.next()];
                case 35:
                    if (!(_k = _34.sent(), _x = _k.done, !_x)) return [3 /*break*/, 37];
                    _z = _k.value;
                    _h = false;
                    hookResult = _z;
                    if ('updatedMCPToolOutput' in hookResult) {
                        if ((0, utils_js_1.isMcpTool)(tool)) {
                            toolOutput = hookResult.updatedMCPToolOutput;
                        }
                    }
                    else if ((0, utils_js_1.isMcpTool)(tool)) {
                        hookResults.push(hookResult);
                        if (hookResult.message.type === 'attachment') {
                            att = hookResult.message.attachment;
                            if ('command' in att &&
                                att.command !== undefined &&
                                'durationMs' in att &&
                                att.durationMs !== undefined) {
                                postToolHookInfos.push({
                                    command: att.command,
                                    durationMs: att.durationMs,
                                });
                            }
                        }
                    }
                    else {
                        resultingMessages.push(hookResult);
                        if (hookResult.message.type === 'attachment') {
                            att = hookResult.message.attachment;
                            if ('command' in att &&
                                att.command !== undefined &&
                                'durationMs' in att &&
                                att.durationMs !== undefined) {
                                postToolHookInfos.push({
                                    command: att.command,
                                    durationMs: att.durationMs,
                                });
                            }
                        }
                    }
                    _34.label = 36;
                case 36:
                    _h = true;
                    return [3 /*break*/, 34];
                case 37: return [3 /*break*/, 44];
                case 38:
                    e_4_1 = _34.sent();
                    e_4 = { error: e_4_1 };
                    return [3 /*break*/, 44];
                case 39:
                    _34.trys.push([39, , 42, 43]);
                    if (!(!_h && !_x && (_y = _j.return))) return [3 /*break*/, 41];
                    return [4 /*yield*/, _y.call(_j)];
                case 40:
                    _34.sent();
                    _34.label = 41;
                case 41: return [3 /*break*/, 43];
                case 42:
                    if (e_4) throw e_4.error;
                    return [7 /*endfinally*/];
                case 43: return [7 /*endfinally*/];
                case 44:
                    postToolHookDurationMs = Date.now() - postToolHookStart;
                    if (postToolHookDurationMs >= SLOW_PHASE_LOG_THRESHOLD_MS) {
                        (0, debug_js_1.logForDebugging)("Slow PostToolUse hooks: ".concat(postToolHookDurationMs, "ms for ").concat(tool.name, " (").concat(postToolHookInfos.length, " hooks)"), { level: 'info' });
                    }
                    if (!(0, utils_js_1.isMcpTool)(tool)) return [3 /*break*/, 46];
                    return [4 /*yield*/, addToolResult(toolOutput)];
                case 45:
                    _34.sent();
                    _34.label = 46;
                case 46:
                    // Show PostToolUse hook timing inline below tool result when > 500ms.
                    // Use wall-clock time (not sum of individual durations) since hooks run in parallel.
                    if (process.env.USER_TYPE === 'ant' && postToolHookInfos.length > 0) {
                        if (postToolHookDurationMs > exports.HOOK_TIMING_DISPLAY_THRESHOLD_MS) {
                            resultingMessages.push({
                                message: (0, messages_js_1.createStopHookSummaryMessage)(postToolHookInfos.length, postToolHookInfos, [], false, undefined, false, 'suggestion', undefined, 'PostToolUse', postToolHookDurationMs),
                            });
                        }
                    }
                    // If the tool provided new messages, add them to the list to return.
                    if (result.newMessages && result.newMessages.length > 0) {
                        for (_i = 0, _l = result.newMessages; _i < _l.length; _i++) {
                            message = _l[_i];
                            resultingMessages.push({ message: message });
                        }
                    }
                    // If hook indicated to prevent continuation after successful execution, yield a stop reason message
                    if (shouldPreventContinuation) {
                        resultingMessages.push({
                            message: (0, attachments_js_1.createAttachmentMessage)({
                                type: 'hook_stopped_continuation',
                                message: stopReason || 'Execution stopped by hook',
                                hookName: "PreToolUse:".concat(tool.name),
                                toolUseID: toolUseID,
                                hookEvent: 'PreToolUse',
                            }),
                        });
                    }
                    // Yield the remaining hook results after the other messages are sent
                    for (_m = 0, hookResults_1 = hookResults; _m < hookResults_1.length; _m++) {
                        hookResult = hookResults_1[_m];
                        resultingMessages.push(hookResult);
                    }
                    return [2 /*return*/, resultingMessages];
                case 47:
                    error_2 = _34.sent();
                    durationMs = Date.now() - startTime;
                    (0, state_js_1.addToToolDuration)(durationMs);
                    (0, sessionTracing_js_1.endToolExecutionSpan)({
                        success: false,
                        error: (0, errors_js_1.errorMessage)(error_2),
                    });
                    (0, sessionTracing_js_1.endToolSpan)();
                    // Handle MCP auth errors by updating the client status to 'needs-auth'
                    // This updates the /mcp display to show the server needs re-authorization
                    if (error_2 instanceof client_js_1.McpAuthError) {
                        toolUseContext.setAppState(function (prevState) {
                            var serverName = error_2.serverName;
                            var existingClientIndex = prevState.mcp.clients.findIndex(function (c) { return c.name === serverName; });
                            if (existingClientIndex === -1) {
                                return prevState;
                            }
                            var existingClient = prevState.mcp.clients[existingClientIndex];
                            // Only update if client was connected (don't overwrite other states)
                            if (!existingClient || existingClient.type !== 'connected') {
                                return prevState;
                            }
                            var updatedClients = __spreadArray([], prevState.mcp.clients, true);
                            updatedClients[existingClientIndex] = {
                                name: serverName,
                                type: 'needs-auth',
                                config: existingClient.config,
                            };
                            return __assign(__assign({}, prevState), { mcp: __assign(__assign({}, prevState.mcp), { clients: updatedClients }) });
                        });
                    }
                    if (!(error_2 instanceof errors_js_1.AbortError)) {
                        errorMsg = (0, errors_js_1.errorMessage)(error_2);
                        (0, debug_js_1.logForDebugging)("".concat(tool.name, " tool error (").concat(durationMs, "ms): ").concat(errorMsg.slice(0, 200)));
                        if (!(error_2 instanceof errors_js_1.ShellError)) {
                            (0, log_js_1.logError)(error_2);
                        }
                        (0, index_js_1.logEvent)('tengu_tool_use_error', __assign(__assign(__assign(__assign({ messageID: messageId, toolName: (0, metadata_js_1.sanitizeToolNameForAnalytics)(tool.name), error: classifyToolError(error_2), isMcp: (_30 = tool.isMcp) !== null && _30 !== void 0 ? _30 : false, queryChainId: (_31 = toolUseContext.queryTracking) === null || _31 === void 0 ? void 0 : _31.chainId, queryDepth: (_32 = toolUseContext.queryTracking) === null || _32 === void 0 ? void 0 : _32.depth }, (mcpServerType && {
                            mcpServerType: mcpServerType,
                        })), (mcpServerBaseUrl && {
                            mcpServerBaseUrl: mcpServerBaseUrl,
                        })), (requestId && {
                            requestId: requestId,
                        })), (0, metadata_js_1.mcpToolDetailsForAnalytics)(tool.name, mcpServerType, mcpServerBaseUrl)));
                        mcpServerScope = (0, utils_js_1.isMcpTool)(tool)
                            ? (0, utils_js_1.getMcpServerScopeFromToolName)(tool.name)
                            : null;
                        void (0, events_js_1.logOTelEvent)('tool_result', __assign(__assign(__assign(__assign({ tool_name: (0, metadata_js_1.sanitizeToolNameForAnalytics)(tool.name), use_id: toolUseID, success: 'false', duration_ms: String(durationMs), error: (0, errors_js_1.errorMessage)(error_2) }, (Object.keys(toolParameters).length > 0 && {
                            tool_parameters: (0, slowOperations_js_1.jsonStringify)(toolParameters),
                        })), (telemetryToolInput && { tool_input: telemetryToolInput })), (decisionInfo && {
                            decision_source: decisionInfo.source,
                            decision_type: decisionInfo.decision,
                        })), (mcpServerScope && { mcp_server_scope: mcpServerScope })));
                    }
                    content = (0, toolErrors_js_1.formatError)(error_2);
                    isInterrupt = error_2 instanceof errors_js_1.AbortError;
                    hookMessages = [];
                    _34.label = 48;
                case 48:
                    _34.trys.push([48, 53, 54, 59]);
                    _o = true, _p = __asyncValues((0, toolHooks_js_1.runPostToolUseFailureHooks)(toolUseContext, tool, toolUseID, messageId, processedInput, content, isInterrupt, requestId, mcpServerType, mcpServerBaseUrl));
                    _34.label = 49;
                case 49: return [4 /*yield*/, _p.next()];
                case 50:
                    if (!(_q = _34.sent(), _0 = _q.done, !_0)) return [3 /*break*/, 52];
                    _2 = _q.value;
                    _o = false;
                    hookResult = _2;
                    hookMessages.push(hookResult);
                    _34.label = 51;
                case 51:
                    _o = true;
                    return [3 /*break*/, 49];
                case 52: return [3 /*break*/, 59];
                case 53:
                    e_5_1 = _34.sent();
                    e_5 = { error: e_5_1 };
                    return [3 /*break*/, 59];
                case 54:
                    _34.trys.push([54, , 57, 58]);
                    if (!(!_o && !_0 && (_1 = _p.return))) return [3 /*break*/, 56];
                    return [4 /*yield*/, _1.call(_p)];
                case 55:
                    _34.sent();
                    _34.label = 56;
                case 56: return [3 /*break*/, 58];
                case 57:
                    if (e_5) throw e_5.error;
                    return [7 /*endfinally*/];
                case 58: return [7 /*endfinally*/];
                case 59: return [2 /*return*/, __spreadArray([
                        {
                            message: (0, messages_js_1.createUserMessage)({
                                content: [
                                    {
                                        type: 'tool_result',
                                        content: content,
                                        is_error: true,
                                        tool_use_id: toolUseID,
                                    },
                                ],
                                toolUseResult: "Error: ".concat(content),
                                mcpMeta: toolUseContext.agentId
                                    ? undefined
                                    : error_2 instanceof
                                        client_js_1.McpToolCallError_I_VERIFIED_THIS_IS_NOT_CODE_OR_FILEPATHS
                                        ? error_2.mcpMeta
                                        : undefined,
                                sourceToolAssistantUUID: assistantMessage.uuid,
                            }),
                        }
                    ], hookMessages, true)];
                case 60:
                    (0, sessionActivity_js_1.stopSessionActivity)('tool_exec');
                    // Clean up decision info after logging
                    if (decisionInfo) {
                        (_33 = toolUseContext.toolDecisions) === null || _33 === void 0 ? void 0 : _33.delete(toolUseID);
                    }
                    return [7 /*endfinally*/];
                case 61: return [2 /*return*/];
            }
        });
    });
}
