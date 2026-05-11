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
exports.registerElicitationHandler = registerElicitationHandler;
exports.runElicitationHooks = runElicitationHooks;
exports.runElicitationResultHooks = runElicitationResultHooks;
var types_js_1 = require("@modelcontextprotocol/sdk/types.js");
var hooks_js_1 = require("../../utils/hooks.js");
var log_js_1 = require("../../utils/log.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var index_js_1 = require("../analytics/index.js");
function getElicitationMode(params) {
    return params.mode === 'url' ? 'url' : 'form';
}
/** Find a queued elicitation event by server name and elicitationId. */
function findElicitationInQueue(queue, serverName, elicitationId) {
    return queue.findIndex(function (e) {
        return e.serverName === serverName &&
            e.params.mode === 'url' &&
            'elicitationId' in e.params &&
            e.params.elicitationId === elicitationId;
    });
}
function registerElicitationHandler(client, serverName, setAppState) {
    var _this = this;
    // Register the elicitation request handler.
    // Wrapped in try/catch because setRequestHandler throws if the client wasn't
    // created with elicitation capability declared.
    try {
        client.setRequestHandler(types_js_1.ElicitRequestSchema, function (request, extra) { return __awaiter(_this, void 0, void 0, function () {
            var mode, hookResponse, elicitationId_1, response, rawResult, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, log_js_1.logMCPDebug)(serverName, "Received elicitation request: ".concat((0, slowOperations_js_1.jsonStringify)(request)));
                        mode = getElicitationMode(request.params);
                        (0, index_js_1.logEvent)('tengu_mcp_elicitation_shown', {
                            mode: mode,
                        });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, runElicitationHooks(serverName, request.params, extra.signal)];
                    case 2:
                        hookResponse = _a.sent();
                        if (hookResponse) {
                            (0, log_js_1.logMCPDebug)(serverName, "Elicitation resolved by hook: ".concat((0, slowOperations_js_1.jsonStringify)(hookResponse)));
                            (0, index_js_1.logEvent)('tengu_mcp_elicitation_response', {
                                mode: mode,
                                action: hookResponse.action,
                            });
                            return [2 /*return*/, hookResponse];
                        }
                        elicitationId_1 = mode === 'url' && 'elicitationId' in request.params
                            ? request.params.elicitationId
                            : undefined;
                        response = new Promise(function (resolve) {
                            var onAbort = function () {
                                resolve({ action: 'cancel' });
                            };
                            if (extra.signal.aborted) {
                                onAbort();
                                return;
                            }
                            var waitingState = elicitationId_1 ? { actionLabel: 'Skip confirmation' } : undefined;
                            setAppState(function (prev) { return (__assign(__assign({}, prev), { elicitation: {
                                    queue: __spreadArray(__spreadArray([], prev.elicitation.queue, true), [
                                        {
                                            serverName: serverName,
                                            requestId: extra.requestId,
                                            params: request.params,
                                            signal: extra.signal,
                                            waitingState: waitingState,
                                            respond: function (result) {
                                                extra.signal.removeEventListener('abort', onAbort);
                                                (0, index_js_1.logEvent)('tengu_mcp_elicitation_response', {
                                                    mode: mode,
                                                    action: result.action,
                                                });
                                                resolve(result);
                                            },
                                        },
                                    ], false),
                                } })); });
                            extra.signal.addEventListener('abort', onAbort, { once: true });
                        });
                        return [4 /*yield*/, response];
                    case 3:
                        rawResult = _a.sent();
                        (0, log_js_1.logMCPDebug)(serverName, "Elicitation response: ".concat((0, slowOperations_js_1.jsonStringify)(rawResult)));
                        return [4 /*yield*/, runElicitationResultHooks(serverName, rawResult, extra.signal, mode, elicitationId_1)];
                    case 4:
                        result = _a.sent();
                        return [2 /*return*/, result];
                    case 5:
                        error_1 = _a.sent();
                        (0, log_js_1.logMCPError)(serverName, "Elicitation error: ".concat(error_1));
                        return [2 /*return*/, { action: 'cancel' }];
                    case 6: return [2 /*return*/];
                }
            });
        }); });
        // Register handler for elicitation completion notifications (URL mode).
        // Sets `completed: true` on the matching queue event; the dialog reacts to this flag.
        client.setNotificationHandler(types_js_1.ElicitationCompleteNotificationSchema, function (notification) {
            var elicitationId = notification.params.elicitationId;
            (0, log_js_1.logMCPDebug)(serverName, "Received elicitation completion notification: ".concat(elicitationId));
            void (0, hooks_js_1.executeNotificationHooks)({
                message: "MCP server \"".concat(serverName, "\" confirmed elicitation ").concat(elicitationId, " complete"),
                notificationType: 'elicitation_complete',
            });
            var found = false;
            setAppState(function (prev) {
                var idx = findElicitationInQueue(prev.elicitation.queue, serverName, elicitationId);
                if (idx === -1)
                    return prev;
                found = true;
                var queue = __spreadArray([], prev.elicitation.queue, true);
                queue[idx] = __assign(__assign({}, queue[idx]), { completed: true });
                return __assign(__assign({}, prev), { elicitation: { queue: queue } });
            });
            if (!found) {
                (0, log_js_1.logMCPDebug)(serverName, "Ignoring completion notification for unknown elicitation: ".concat(elicitationId));
            }
        });
    }
    catch (_a) {
        // Client wasn't created with elicitation capability - nothing to register
        return;
    }
}
function runElicitationHooks(serverName, params, signal) {
    return __awaiter(this, void 0, void 0, function () {
        var mode, url, elicitationId, _a, elicitationResponse, blockingError, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    mode = params.mode === 'url' ? 'url' : 'form';
                    url = 'url' in params ? params.url : undefined;
                    elicitationId = 'elicitationId' in params
                        ? params.elicitationId
                        : undefined;
                    return [4 /*yield*/, (0, hooks_js_1.executeElicitationHooks)({
                            serverName: serverName,
                            message: params.message,
                            requestedSchema: 'requestedSchema' in params
                                ? params.requestedSchema
                                : undefined,
                            signal: signal,
                            mode: mode,
                            url: url,
                            elicitationId: elicitationId,
                        })];
                case 1:
                    _a = _b.sent(), elicitationResponse = _a.elicitationResponse, blockingError = _a.blockingError;
                    if (blockingError) {
                        return [2 /*return*/, { action: 'decline' }];
                    }
                    if (elicitationResponse) {
                        return [2 /*return*/, {
                                action: elicitationResponse.action,
                                content: elicitationResponse.content,
                            }];
                    }
                    return [2 /*return*/, undefined];
                case 2:
                    error_2 = _b.sent();
                    (0, log_js_1.logMCPError)(serverName, "Elicitation hook error: ".concat(error_2));
                    return [2 /*return*/, undefined];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Run ElicitationResult hooks after the user has responded, then fire a
 * `elicitation_response` notification. Returns a (potentially modified)
 * ElicitResult — hooks may override the action/content or block the response.
 */
function runElicitationResultHooks(serverName, result, signal, mode, elicitationId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, elicitationResultResponse, blockingError, finalResult, error_3;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, hooks_js_1.executeElicitationResultHooks)({
                            serverName: serverName,
                            action: result.action,
                            content: result.content,
                            signal: signal,
                            mode: mode,
                            elicitationId: elicitationId,
                        })];
                case 1:
                    _a = _c.sent(), elicitationResultResponse = _a.elicitationResultResponse, blockingError = _a.blockingError;
                    if (blockingError) {
                        void (0, hooks_js_1.executeNotificationHooks)({
                            message: "Elicitation response for server \"".concat(serverName, "\": decline"),
                            notificationType: 'elicitation_response',
                        });
                        return [2 /*return*/, { action: 'decline' }];
                    }
                    finalResult = elicitationResultResponse
                        ? {
                            action: elicitationResultResponse.action,
                            content: (_b = elicitationResultResponse.content) !== null && _b !== void 0 ? _b : result.content,
                        }
                        : result;
                    // Fire a notification for observability
                    void (0, hooks_js_1.executeNotificationHooks)({
                        message: "Elicitation response for server \"".concat(serverName, "\": ").concat(finalResult.action),
                        notificationType: 'elicitation_response',
                    });
                    return [2 /*return*/, finalResult];
                case 2:
                    error_3 = _c.sent();
                    (0, log_js_1.logMCPError)(serverName, "ElicitationResult hook error: ".concat(error_3));
                    // Fire notification even on error
                    void (0, hooks_js_1.executeNotificationHooks)({
                        message: "Elicitation response for server \"".concat(serverName, "\": ").concat(result.action),
                        notificationType: 'elicitation_response',
                    });
                    return [2 /*return*/, result];
                case 3: return [2 /*return*/];
            }
        });
    });
}
