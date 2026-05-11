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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __asyncDelegator = (this && this.__asyncDelegator) || function (o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: false } : f ? f(v) : v; } : f; }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StructuredIO = exports.SANDBOX_NETWORK_ACCESS_TOOL_NAME = void 0;
var bun_bundle_1 = require("bun:bundle");
var crypto_1 = require("crypto");
var controlSchemas_js_1 = require("src/entrypoints/sdk/controlSchemas.js");
var hooks_js_1 = require("src/types/hooks.js");
var debug_js_1 = require("src/utils/debug.js");
var diagLogs_js_1 = require("src/utils/diagLogs.js");
var errors_js_1 = require("src/utils/errors.js");
var PermissionPromptToolResultSchema_js_1 = require("src/utils/permissions/PermissionPromptToolResultSchema.js");
var permissions_js_1 = require("src/utils/permissions/permissions.js");
var process_js_1 = require("src/utils/process.js");
var slowOperations_js_1 = require("src/utils/slowOperations.js");
var v4_1 = require("zod/v4");
var commandLifecycle_js_1 = require("../utils/commandLifecycle.js");
var controlMessageCompat_js_1 = require("../utils/controlMessageCompat.js");
var hooks_js_2 = require("../utils/hooks.js");
var PermissionUpdate_js_1 = require("../utils/permissions/PermissionUpdate.js");
var sessionState_js_1 = require("../utils/sessionState.js");
var slowOperations_js_2 = require("../utils/slowOperations.js");
var stream_js_1 = require("../utils/stream.js");
var ndjsonSafeStringify_js_1 = require("./ndjsonSafeStringify.js");
/**
 * Synthetic tool name used when forwarding sandbox network permission
 * requests via the can_use_tool control_request protocol. SDK hosts
 * see this as a normal tool permission prompt.
 */
exports.SANDBOX_NETWORK_ACCESS_TOOL_NAME = 'SandboxNetworkAccess';
function serializeDecisionReason(reason) {
    if (!reason) {
        return undefined;
    }
    if (((0, bun_bundle_1.feature)('BASH_CLASSIFIER') || (0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER')) &&
        reason.type === 'classifier') {
        return reason.reason;
    }
    switch (reason.type) {
        case 'rule':
        case 'mode':
        case 'subcommandResults':
        case 'permissionPromptTool':
            return undefined;
        case 'hook':
        case 'asyncAgent':
        case 'sandboxOverride':
        case 'workingDir':
        case 'safetyCheck':
        case 'other':
            return reason.reason;
    }
}
function buildRequiresActionDetails(tool, input, toolUseID, requestId) {
    var _a, _b, _c, _d;
    // Per-tool summary methods may throw on malformed input; permission
    // handling must not break because of a bad description.
    var description;
    try {
        description =
            (_d = (_b = (_a = tool.getActivityDescription) === null || _a === void 0 ? void 0 : _a.call(tool, input)) !== null && _b !== void 0 ? _b : (_c = tool.getToolUseSummary) === null || _c === void 0 ? void 0 : _c.call(tool, input)) !== null && _d !== void 0 ? _d : tool.userFacingName(input);
    }
    catch (_e) {
        description = tool.name;
    }
    return {
        tool_name: tool.name,
        action_description: description,
        tool_use_id: toolUseID,
        request_id: requestId,
        input: input,
    };
}
/**
 * Provides a structured way to read and write SDK messages from stdio,
 * capturing the SDK protocol.
 */
// Maximum number of resolved tool_use IDs to track. Once exceeded, the oldest
// entry is evicted. This bounds memory in very long sessions while keeping
// enough history to catch duplicate control_response deliveries.
var MAX_RESOLVED_TOOL_USE_IDS = 1000;
var StructuredIO = /** @class */ (function () {
    function StructuredIO(input, replayUserMessages) {
        this.input = input;
        this.replayUserMessages = replayUserMessages;
        this.pendingRequests = new Map();
        // CCR external_metadata read back on worker start; null when the
        // transport doesn't restore. Assigned by RemoteIO.
        this.restoredWorkerState = Promise.resolve(null);
        this.inputClosed = false;
        // Tracks tool_use IDs that have been resolved through the normal permission
        // flow (or aborted by a hook). When a duplicate control_response arrives
        // after the original was already handled, this Set prevents the orphan
        // handler from re-processing it — which would push duplicate assistant
        // messages into mutableMessages and cause a 400 "tool_use ids must be unique"
        // error from the API.
        this.resolvedToolUseIds = new Set();
        this.prependedLines = [];
        // sendRequest() and print.ts both enqueue here; the drain loop is the
        // only writer. Prevents control_request from overtaking queued stream_events.
        this.outbound = new stream_js_1.Stream();
        this.input = input;
        this.structuredInput = this.read();
    }
    /**
     * Records a tool_use ID as resolved so that late/duplicate control_response
     * messages for the same tool are ignored by the orphan handler.
     */
    StructuredIO.prototype.trackResolvedToolUseId = function (request) {
        if (request.request.subtype === 'can_use_tool') {
            this.resolvedToolUseIds.add(request.request.tool_use_id);
            if (this.resolvedToolUseIds.size > MAX_RESOLVED_TOOL_USE_IDS) {
                // Evict the oldest entry (Sets iterate in insertion order)
                var first = this.resolvedToolUseIds.values().next().value;
                if (first !== undefined) {
                    this.resolvedToolUseIds.delete(first);
                }
            }
        }
    };
    /** Flush pending internal events. No-op for non-remote IO. Overridden by RemoteIO. */
    StructuredIO.prototype.flushInternalEvents = function () {
        return Promise.resolve();
    };
    Object.defineProperty(StructuredIO.prototype, "internalEventsPending", {
        /** Internal-event queue depth. Overridden by RemoteIO; zero otherwise. */
        get: function () {
            return 0;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Queue a user turn to be yielded before the next message from this.input.
     * Works before iteration starts and mid-stream — read() re-checks
     * prependedLines between each yielded message.
     */
    StructuredIO.prototype.prependUserMessage = function (content) {
        this.prependedLines.push((0, slowOperations_js_1.jsonStringify)({
            type: 'user',
            session_id: '',
            message: { role: 'user', content: content },
            parent_tool_use_id: null,
        }) + '\n');
    };
    StructuredIO.prototype.read = function () {
        return __asyncGenerator(this, arguments, function read_1() {
            var content, splitAndProcess, _a, _b, _c, block, e_1_1, message, _i, _d, request;
            var _e, e_1, _f, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        content = '';
                        splitAndProcess = function () {
                            return __asyncGenerator(this, arguments, function () {
                                var newline, line, message;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (this.prependedLines.length > 0) {
                                                content = this.prependedLines.join('') + content;
                                                this.prependedLines = [];
                                            }
                                            newline = content.indexOf('\n');
                                            if (newline === -1)
                                                return [3 /*break*/, 5];
                                            line = content.slice(0, newline);
                                            content = content.slice(newline + 1);
                                            return [4 /*yield*/, __await(this.processLine(line))];
                                        case 1:
                                            message = _a.sent();
                                            if (!message) return [3 /*break*/, 4];
                                            (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'cli_stdin_message_parsed', {
                                                type: message.type,
                                            });
                                            return [4 /*yield*/, __await(message)];
                                        case 2: return [4 /*yield*/, _a.sent()];
                                        case 3:
                                            _a.sent();
                                            _a.label = 4;
                                        case 4: return [3 /*break*/, 0];
                                        case 5: return [2 /*return*/];
                                    }
                                });
                            });
                        }.bind(this);
                        return [5 /*yield**/, __values(__asyncDelegator(__asyncValues(splitAndProcess())))];
                    case 1: return [4 /*yield*/, __await.apply(void 0, [_h.sent()])];
                    case 2:
                        _h.sent();
                        _h.label = 3;
                    case 3:
                        _h.trys.push([3, 10, 11, 16]);
                        _a = true, _b = __asyncValues(this.input);
                        _h.label = 4;
                    case 4: return [4 /*yield*/, __await(_b.next())];
                    case 5:
                        if (!(_c = _h.sent(), _e = _c.done, !_e)) return [3 /*break*/, 9];
                        _g = _c.value;
                        _a = false;
                        block = _g;
                        content += block;
                        return [5 /*yield**/, __values(__asyncDelegator(__asyncValues(splitAndProcess())))];
                    case 6: return [4 /*yield*/, __await.apply(void 0, [_h.sent()])];
                    case 7:
                        _h.sent();
                        _h.label = 8;
                    case 8:
                        _a = true;
                        return [3 /*break*/, 4];
                    case 9: return [3 /*break*/, 16];
                    case 10:
                        e_1_1 = _h.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 16];
                    case 11:
                        _h.trys.push([11, , 14, 15]);
                        if (!(!_a && !_e && (_f = _b.return))) return [3 /*break*/, 13];
                        return [4 /*yield*/, __await(_f.call(_b))];
                    case 12:
                        _h.sent();
                        _h.label = 13;
                    case 13: return [3 /*break*/, 15];
                    case 14:
                        if (e_1) throw e_1.error;
                        return [7 /*endfinally*/];
                    case 15: return [7 /*endfinally*/];
                    case 16:
                        if (!content) return [3 /*break*/, 20];
                        return [4 /*yield*/, __await(this.processLine(content))];
                    case 17:
                        message = _h.sent();
                        if (!message) return [3 /*break*/, 20];
                        return [4 /*yield*/, __await(message)];
                    case 18: return [4 /*yield*/, _h.sent()];
                    case 19:
                        _h.sent();
                        _h.label = 20;
                    case 20:
                        this.inputClosed = true;
                        for (_i = 0, _d = this.pendingRequests.values(); _i < _d.length; _i++) {
                            request = _d[_i];
                            // Reject all pending requests if the input stream
                            request.reject(new Error('Tool permission stream closed before response received'));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    StructuredIO.prototype.getPendingPermissionRequests = function () {
        return Array.from(this.pendingRequests.values())
            .map(function (entry) { return entry.request; })
            .filter(function (pr) { return pr.request.subtype === 'can_use_tool'; });
    };
    StructuredIO.prototype.setUnexpectedResponseCallback = function (callback) {
        this.unexpectedResponseCallback = callback;
    };
    /**
     * Inject a control_response message to resolve a pending permission request.
     * Used by the bridge to feed permission responses from claude.ai into the
     * SDK permission flow.
     *
     * Also sends a control_cancel_request to the SDK consumer so its canUseTool
     * callback is aborted via the signal — otherwise the callback hangs.
     */
    StructuredIO.prototype.injectControlResponse = function (response) {
        var _a;
        var requestId = (_a = response.response) === null || _a === void 0 ? void 0 : _a.request_id;
        if (!requestId)
            return;
        var request = this.pendingRequests.get(requestId);
        if (!request)
            return;
        this.trackResolvedToolUseId(request.request);
        this.pendingRequests.delete(requestId);
        // Cancel the SDK consumer's canUseTool callback — the bridge won.
        void this.write({
            type: 'control_cancel_request',
            request_id: requestId,
        });
        if (response.response.subtype === 'error') {
            request.reject(new Error(response.response.error));
        }
        else {
            var result = response.response.response;
            if (request.schema) {
                try {
                    request.resolve(request.schema.parse(result));
                }
                catch (error) {
                    request.reject(error);
                }
            }
            else {
                request.resolve({});
            }
        }
    };
    /**
     * Register a callback invoked whenever a can_use_tool control_request
     * is written to stdout. Used by the bridge to forward permission
     * requests to claude.ai.
     */
    StructuredIO.prototype.setOnControlRequestSent = function (callback) {
        this.onControlRequestSent = callback;
    };
    /**
     * Register a callback invoked when a can_use_tool control_response arrives
     * from the SDK consumer (via stdin). Used by the bridge to cancel the
     * stale permission prompt on claude.ai when the SDK consumer wins the race.
     */
    StructuredIO.prototype.setOnControlRequestResolved = function (callback) {
        this.onControlRequestResolved = callback;
    };
    StructuredIO.prototype.processLine = function (line) {
        return __awaiter(this, void 0, void 0, function () {
            var message, keys, _i, _a, _b, key, value, uuid, request, responsePayload, toolUseID, result, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        // Skip empty lines (e.g. from double newlines in piped stdin)
                        if (!line) {
                            return [2 /*return*/, undefined];
                        }
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 6, , 7]);
                        message = (0, controlMessageCompat_js_1.normalizeControlMessageKeys)((0, slowOperations_js_2.jsonParse)(line));
                        if (message.type === 'keep_alive') {
                            // Silently ignore keep-alive messages
                            return [2 /*return*/, undefined];
                        }
                        if (message.type === 'update_environment_variables') {
                            keys = Object.keys(message.variables);
                            for (_i = 0, _a = Object.entries(message.variables); _i < _a.length; _i++) {
                                _b = _a[_i], key = _b[0], value = _b[1];
                                process.env[key] = value;
                            }
                            (0, debug_js_1.logForDebugging)("[structuredIO] applied update_environment_variables: ".concat(keys.join(', ')));
                            return [2 /*return*/, undefined];
                        }
                        if (!(message.type === 'control_response')) return [3 /*break*/, 5];
                        uuid = 'uuid' in message && typeof message.uuid === 'string'
                            ? message.uuid
                            : undefined;
                        if (uuid) {
                            (0, commandLifecycle_js_1.notifyCommandLifecycle)(uuid, 'completed');
                        }
                        request = this.pendingRequests.get(message.response.request_id);
                        if (!!request) return [3 /*break*/, 4];
                        responsePayload = message.response.subtype === 'success'
                            ? message.response.response
                            : undefined;
                        toolUseID = responsePayload === null || responsePayload === void 0 ? void 0 : responsePayload.toolUseID;
                        if (typeof toolUseID === 'string' &&
                            this.resolvedToolUseIds.has(toolUseID)) {
                            (0, debug_js_1.logForDebugging)("Ignoring duplicate control_response for already-resolved toolUseID=".concat(toolUseID, " request_id=").concat(message.response.request_id));
                            return [2 /*return*/, undefined];
                        }
                        if (!this.unexpectedResponseCallback) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.unexpectedResponseCallback(message)];
                    case 2:
                        _c.sent();
                        _c.label = 3;
                    case 3: return [2 /*return*/, undefined]; // Ignore responses for requests we don't know about
                    case 4:
                        this.trackResolvedToolUseId(request.request);
                        this.pendingRequests.delete(message.response.request_id);
                        // Notify the bridge when the SDK consumer resolves a can_use_tool
                        // request, so it can cancel the stale permission prompt on claude.ai.
                        if (request.request.request.subtype === 'can_use_tool' &&
                            this.onControlRequestResolved) {
                            this.onControlRequestResolved(message.response.request_id);
                        }
                        if (message.response.subtype === 'error') {
                            request.reject(new Error(message.response.error));
                            return [2 /*return*/, undefined];
                        }
                        result = message.response.response;
                        if (request.schema) {
                            try {
                                request.resolve(request.schema.parse(result));
                            }
                            catch (error) {
                                request.reject(error);
                            }
                        }
                        else {
                            request.resolve({});
                        }
                        // Propagate control responses when replay is enabled
                        if (this.replayUserMessages) {
                            return [2 /*return*/, message];
                        }
                        return [2 /*return*/, undefined];
                    case 5:
                        if (message.type !== 'user' &&
                            message.type !== 'control_request' &&
                            message.type !== 'assistant' &&
                            message.type !== 'system') {
                            (0, debug_js_1.logForDebugging)("Ignoring unknown message type: ".concat(message.type), {
                                level: 'warn',
                            });
                            return [2 /*return*/, undefined];
                        }
                        if (message.type === 'control_request') {
                            if (!message.request) {
                                exitWithMessage("Error: Missing request on control_request");
                            }
                            return [2 /*return*/, message];
                        }
                        if (message.type === 'assistant' || message.type === 'system') {
                            return [2 /*return*/, message];
                        }
                        if (message.message.role !== 'user') {
                            exitWithMessage("Error: Expected message role 'user', got '".concat(message.message.role, "'"));
                        }
                        return [2 /*return*/, message];
                    case 6:
                        error_1 = _c.sent();
                        // biome-ignore lint/suspicious/noConsole:: intentional console output
                        console.error("Error parsing streaming input line: ".concat(line, ": ").concat(error_1));
                        // eslint-disable-next-line custom-rules/no-process-exit
                        process.exit(1);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    StructuredIO.prototype.write = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                (0, process_js_1.writeToStdout)((0, ndjsonSafeStringify_js_1.ndjsonSafeStringify)(message) + '\n');
                return [2 /*return*/];
            });
        });
    };
    StructuredIO.prototype.sendRequest = function (request_1, schema_1, signal_1) {
        return __awaiter(this, arguments, void 0, function (request, schema, signal, requestId) {
            var message, aborted;
            var _this = this;
            if (requestId === void 0) { requestId = (0, crypto_1.randomUUID)(); }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        message = {
                            type: 'control_request',
                            request_id: requestId,
                            request: request,
                        };
                        if (this.inputClosed) {
                            throw new Error('Stream closed');
                        }
                        if (signal === null || signal === void 0 ? void 0 : signal.aborted) {
                            throw new Error('Request aborted');
                        }
                        this.outbound.enqueue(message);
                        if (request.subtype === 'can_use_tool' && this.onControlRequestSent) {
                            this.onControlRequestSent(message);
                        }
                        aborted = function () {
                            _this.outbound.enqueue({
                                type: 'control_cancel_request',
                                request_id: requestId,
                            });
                            // Immediately reject the outstanding promise, without
                            // waiting for the host to acknowledge the cancellation.
                            var request = _this.pendingRequests.get(requestId);
                            if (request) {
                                // Track the tool_use ID as resolved before rejecting, so that a
                                // late response from the host is ignored by the orphan handler.
                                _this.trackResolvedToolUseId(request.request);
                                request.reject(new errors_js_1.AbortError());
                            }
                        };
                        if (signal) {
                            signal.addEventListener('abort', aborted, {
                                once: true,
                            });
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 4]);
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                _this.pendingRequests.set(requestId, {
                                    request: {
                                        type: 'control_request',
                                        request_id: requestId,
                                        request: request,
                                    },
                                    resolve: function (result) {
                                        resolve(result);
                                    },
                                    reject: reject,
                                    schema: schema,
                                });
                            })];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        if (signal) {
                            signal.removeEventListener('abort', aborted);
                        }
                        this.pendingRequests.delete(requestId);
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    StructuredIO.prototype.createCanUseTool = function (onPermissionPrompt) {
        var _this = this;
        return function (tool, input, toolUseContext, assistantMessage, toolUseID, forceDecision) { return __awaiter(_this, void 0, void 0, function () {
            var mainPermissionResult, _a, hookAbortController, parentSignal, onParentAbort, hookPromise, requestId, sdkPromise, winner, sdkResult, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(forceDecision !== null && forceDecision !== void 0)) return [3 /*break*/, 1];
                        _a = forceDecision;
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, (0, permissions_js_1.hasPermissionsToUseTool)(tool, input, toolUseContext, assistantMessage, toolUseID)];
                    case 2:
                        _a = (_b.sent());
                        _b.label = 3;
                    case 3:
                        mainPermissionResult = _a;
                        // If the tool is allowed or denied, return the result
                        if (mainPermissionResult.behavior === 'allow' ||
                            mainPermissionResult.behavior === 'deny') {
                            return [2 /*return*/, mainPermissionResult];
                        }
                        hookAbortController = new AbortController();
                        parentSignal = toolUseContext.abortController.signal;
                        onParentAbort = function () { return hookAbortController.abort(); };
                        parentSignal.addEventListener('abort', onParentAbort, { once: true });
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 8, 9, 10]);
                        hookPromise = executePermissionRequestHooksForSDK(tool.name, toolUseID, input, toolUseContext, mainPermissionResult.suggestions).then(function (decision) { return ({ source: 'hook', decision: decision }); });
                        requestId = (0, crypto_1.randomUUID)();
                        onPermissionPrompt === null || onPermissionPrompt === void 0 ? void 0 : onPermissionPrompt(buildRequiresActionDetails(tool, input, toolUseID, requestId));
                        sdkPromise = this.sendRequest({
                            subtype: 'can_use_tool',
                            tool_name: tool.name,
                            input: input,
                            permission_suggestions: mainPermissionResult.suggestions,
                            blocked_path: mainPermissionResult.blockedPath,
                            decision_reason: serializeDecisionReason(mainPermissionResult.decisionReason),
                            tool_use_id: toolUseID,
                            agent_id: toolUseContext.agentId,
                        }, (0, PermissionPromptToolResultSchema_js_1.outputSchema)(), hookAbortController.signal, requestId).then(function (result) { return ({ source: 'sdk', result: result }); });
                        return [4 /*yield*/, Promise.race([hookPromise, sdkPromise])];
                    case 5:
                        winner = _b.sent();
                        if (!(winner.source === 'hook')) return [3 /*break*/, 7];
                        if (winner.decision) {
                            // Hook decided — abort the pending SDK request.
                            // Suppress the expected AbortError rejection from sdkPromise.
                            sdkPromise.catch(function () { });
                            hookAbortController.abort();
                            return [2 /*return*/, winner.decision];
                        }
                        return [4 /*yield*/, sdkPromise];
                    case 6:
                        sdkResult = _b.sent();
                        return [2 /*return*/, (0, PermissionPromptToolResultSchema_js_1.permissionPromptToolResultToPermissionDecision)(sdkResult.result, tool, input, toolUseContext)];
                    case 7: 
                    // SDK prompt responded first — use its result (hook still running
                    // in background but its result will be ignored)
                    return [2 /*return*/, (0, PermissionPromptToolResultSchema_js_1.permissionPromptToolResultToPermissionDecision)(winner.result, tool, input, toolUseContext)];
                    case 8:
                        error_2 = _b.sent();
                        return [2 /*return*/, (0, PermissionPromptToolResultSchema_js_1.permissionPromptToolResultToPermissionDecision)({
                                behavior: 'deny',
                                message: "Tool permission request failed: ".concat(error_2),
                                toolUseID: toolUseID,
                            }, tool, input, toolUseContext)];
                    case 9:
                        // Only transition back to 'running' if no other permission prompts
                        // are pending (concurrent tool execution can have multiple in-flight).
                        if (this.getPendingPermissionRequests().length === 0) {
                            (0, sessionState_js_1.notifySessionStateChanged)('running');
                        }
                        parentSignal.removeEventListener('abort', onParentAbort);
                        return [7 /*endfinally*/];
                    case 10: return [2 /*return*/];
                }
            });
        }); };
    };
    StructuredIO.prototype.createHookCallback = function (callbackId, timeout) {
        var _this = this;
        return {
            type: 'callback',
            timeout: timeout,
            callback: function (input, toolUseID, abort) { return __awaiter(_this, void 0, void 0, function () {
                var result, error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, this.sendRequest({
                                    subtype: 'hook_callback',
                                    callback_id: callbackId,
                                    input: input,
                                    tool_use_id: toolUseID || undefined,
                                }, (0, hooks_js_1.hookJSONOutputSchema)(), abort)];
                        case 1:
                            result = _a.sent();
                            return [2 /*return*/, result];
                        case 2:
                            error_3 = _a.sent();
                            // biome-ignore lint/suspicious/noConsole:: intentional console output
                            console.error("Error in hook callback ".concat(callbackId, ":"), error_3);
                            return [2 /*return*/, {}];
                        case 3: return [2 /*return*/];
                    }
                });
            }); },
        };
    };
    /**
     * Sends an elicitation request to the SDK consumer and returns the response.
     */
    StructuredIO.prototype.handleElicitation = function (serverName, message, requestedSchema, signal, mode, url, elicitationId) {
        return __awaiter(this, void 0, void 0, function () {
            var result, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.sendRequest({
                                subtype: 'elicitation',
                                mcp_server_name: serverName,
                                message: message,
                                mode: mode,
                                url: url,
                                elicitation_id: elicitationId,
                                requested_schema: requestedSchema,
                            }, (0, controlSchemas_js_1.SDKControlElicitationResponseSchema)(), signal)];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, result];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, { action: 'cancel' }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Creates a SandboxAskCallback that forwards sandbox network permission
     * requests to the SDK host as can_use_tool control_requests.
     *
     * This piggybacks on the existing can_use_tool protocol with a synthetic
     * tool name so that SDK hosts (VS Code, CCR, etc.) can prompt the user
     * for network access without requiring a new protocol subtype.
     */
    StructuredIO.prototype.createSandboxAskCallback = function () {
        var _this = this;
        return function (hostPattern) { return __awaiter(_this, void 0, void 0, function () {
            var result, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.sendRequest({
                                subtype: 'can_use_tool',
                                tool_name: exports.SANDBOX_NETWORK_ACCESS_TOOL_NAME,
                                input: { host: hostPattern.host },
                                tool_use_id: (0, crypto_1.randomUUID)(),
                                description: "Allow network connection to ".concat(hostPattern.host, "?"),
                            }, (0, PermissionPromptToolResultSchema_js_1.outputSchema)())];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, result.behavior === 'allow'];
                    case 2:
                        _a = _b.sent();
                        // If the request fails (stream closed, abort, etc.), deny the connection
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
    };
    /**
     * Sends an MCP message to an SDK server and waits for the response
     */
    StructuredIO.prototype.sendMcpMessage = function (serverName, message) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.sendRequest({
                            subtype: 'mcp_message',
                            server_name: serverName,
                            message: message,
                        }, v4_1.z.object({
                            mcp_response: v4_1.z.any(),
                        }))];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response.mcp_response];
                }
            });
        });
    };
    return StructuredIO;
}());
exports.StructuredIO = StructuredIO;
function exitWithMessage(message) {
    // biome-ignore lint/suspicious/noConsole:: intentional console output
    console.error(message);
    // eslint-disable-next-line custom-rules/no-process-exit
    process.exit(1);
}
/**
 * Execute PermissionRequest hooks and return a decision if one is made.
 * Returns undefined if no hook made a decision.
 */
function executePermissionRequestHooksForSDK(toolName, toolUseID, input, toolUseContext, suggestions) {
    return __awaiter(this, void 0, void 0, function () {
        var appState, permissionMode, hookGenerator, _loop_1, _a, hookGenerator_1, hookGenerator_1_1, state_1, e_2_1;
        var _b, e_2, _c, _d;
        var _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    appState = toolUseContext.getAppState();
                    permissionMode = appState.toolPermissionContext.mode;
                    hookGenerator = (0, hooks_js_2.executePermissionRequestHooks)(toolName, toolUseID, input, toolUseContext, permissionMode, suggestions, toolUseContext.abortController.signal);
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, 6, 7, 12]);
                    _loop_1 = function () {
                        _d = hookGenerator_1_1.value;
                        _a = false;
                        var hookResult = _d;
                        if (hookResult.permissionRequestResult &&
                            (hookResult.permissionRequestResult.behavior === 'allow' ||
                                hookResult.permissionRequestResult.behavior === 'deny')) {
                            var decision = hookResult.permissionRequestResult;
                            if (decision.behavior === 'allow') {
                                var finalInput = decision.updatedInput || input;
                                // Apply permission updates if provided by hook ("always allow")
                                var permissionUpdates = (_e = decision.updatedPermissions) !== null && _e !== void 0 ? _e : [];
                                if (permissionUpdates.length > 0) {
                                    (0, PermissionUpdate_js_1.persistPermissionUpdates)(permissionUpdates);
                                    var currentAppState = toolUseContext.getAppState();
                                    var updatedContext_1 = (0, PermissionUpdate_js_1.applyPermissionUpdates)(currentAppState.toolPermissionContext, permissionUpdates);
                                    // Update permission context via setAppState
                                    toolUseContext.setAppState(function (prev) {
                                        if (prev.toolPermissionContext === updatedContext_1)
                                            return prev;
                                        return __assign(__assign({}, prev), { toolPermissionContext: updatedContext_1 });
                                    });
                                }
                                return { value: {
                                        behavior: 'allow',
                                        updatedInput: finalInput,
                                        userModified: false,
                                        decisionReason: {
                                            type: 'hook',
                                            hookName: 'PermissionRequest',
                                        },
                                    } };
                            }
                            else {
                                return { value: {
                                        behavior: 'deny',
                                        message: decision.message || 'Permission denied by PermissionRequest hook',
                                        decisionReason: {
                                            type: 'hook',
                                            hookName: 'PermissionRequest',
                                        },
                                    } };
                            }
                        }
                    };
                    _a = true, hookGenerator_1 = __asyncValues(hookGenerator);
                    _f.label = 2;
                case 2: return [4 /*yield*/, hookGenerator_1.next()];
                case 3:
                    if (!(hookGenerator_1_1 = _f.sent(), _b = hookGenerator_1_1.done, !_b)) return [3 /*break*/, 5];
                    state_1 = _loop_1();
                    if (typeof state_1 === "object")
                        return [2 /*return*/, state_1.value];
                    _f.label = 4;
                case 4:
                    _a = true;
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 12];
                case 6:
                    e_2_1 = _f.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 12];
                case 7:
                    _f.trys.push([7, , 10, 11]);
                    if (!(!_a && !_b && (_c = hookGenerator_1.return))) return [3 /*break*/, 9];
                    return [4 /*yield*/, _c.call(hookGenerator_1)];
                case 8:
                    _f.sent();
                    _f.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    if (e_2) throw e_2.error;
                    return [7 /*endfinally*/];
                case 11: return [7 /*endfinally*/];
                case 12: return [2 /*return*/, undefined];
            }
        });
    });
}
