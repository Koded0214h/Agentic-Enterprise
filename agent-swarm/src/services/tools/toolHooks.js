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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.runPostToolUseHooks = runPostToolUseHooks;
exports.runPostToolUseFailureHooks = runPostToolUseFailureHooks;
exports.resolveHookPermissionDecision = resolveHookPermissionDecision;
exports.runPreToolUseHooks = runPreToolUseHooks;
var index_js_1 = require("src/services/analytics/index.js");
var metadata_js_1 = require("src/services/analytics/metadata.js");
var attachments_js_1 = require("../../utils/attachments.js");
var debug_js_1 = require("../../utils/debug.js");
var hooks_js_1 = require("../../utils/hooks.js");
var log_js_1 = require("../../utils/log.js");
var PermissionResult_js_1 = require("../../utils/permissions/PermissionResult.js");
var permissions_js_1 = require("../../utils/permissions/permissions.js");
var toolErrors_js_1 = require("../../utils/toolErrors.js");
var utils_js_1 = require("../mcp/utils.js");
function runPostToolUseHooks(toolUseContext, tool, toolUseID, messageId, toolInput, toolResponse, requestId, mcpServerType, mcpServerBaseUrl) {
    return __asyncGenerator(this, arguments, function runPostToolUseHooks_1() {
        var postToolStartTime, appState, permissionMode, toolOutput, _a, _b, _c, result, error_1, postToolDurationMs, e_1_1, error_2;
        var _d, e_1, _e, _f;
        var _g, _h, _j, _k, _l, _m;
        return __generator(this, function (_o) {
            switch (_o.label) {
                case 0:
                    postToolStartTime = Date.now();
                    _o.label = 1;
                case 1:
                    _o.trys.push([1, 37, , 38]);
                    appState = toolUseContext.getAppState();
                    permissionMode = appState.toolPermissionContext.mode;
                    toolOutput = toolResponse;
                    _o.label = 2;
                case 2:
                    _o.trys.push([2, 30, 31, 36]);
                    _a = true, _b = __asyncValues((0, hooks_js_1.executePostToolHooks)(tool.name, toolUseID, toolInput, toolOutput, toolUseContext, permissionMode, toolUseContext.abortController.signal));
                    _o.label = 3;
                case 3: return [4 /*yield*/, __await(_b.next())];
                case 4:
                    if (!(_c = _o.sent(), _d = _c.done, !_d)) return [3 /*break*/, 29];
                    _f = _c.value;
                    _a = false;
                    result = _f;
                    _o.label = 5;
                case 5:
                    _o.trys.push([5, 25, , 28]);
                    if (!(((_g = result.message) === null || _g === void 0 ? void 0 : _g.type) === 'attachment' &&
                        result.message.attachment.type === 'hook_cancelled')) return [3 /*break*/, 8];
                    (0, index_js_1.logEvent)('tengu_post_tool_hooks_cancelled', {
                        toolName: (0, metadata_js_1.sanitizeToolNameForAnalytics)(tool.name),
                        queryChainId: (_h = toolUseContext.queryTracking) === null || _h === void 0 ? void 0 : _h.chainId,
                        queryDepth: (_j = toolUseContext.queryTracking) === null || _j === void 0 ? void 0 : _j.depth,
                    });
                    return [4 /*yield*/, __await({
                            message: (0, attachments_js_1.createAttachmentMessage)({
                                type: 'hook_cancelled',
                                hookName: "PostToolUse:".concat(tool.name),
                                toolUseID: toolUseID,
                                hookEvent: 'PostToolUse',
                            }),
                        })];
                case 6: return [4 /*yield*/, _o.sent()];
                case 7:
                    _o.sent();
                    return [3 /*break*/, 28];
                case 8:
                    if (!(result.message &&
                        !(result.message.type === 'attachment' &&
                            result.message.attachment.type === 'hook_blocking_error'))) return [3 /*break*/, 11];
                    return [4 /*yield*/, __await({ message: result.message })];
                case 9: return [4 /*yield*/, _o.sent()];
                case 10:
                    _o.sent();
                    _o.label = 11;
                case 11:
                    if (!result.blockingError) return [3 /*break*/, 14];
                    return [4 /*yield*/, __await({
                            message: (0, attachments_js_1.createAttachmentMessage)({
                                type: 'hook_blocking_error',
                                hookName: "PostToolUse:".concat(tool.name),
                                toolUseID: toolUseID,
                                hookEvent: 'PostToolUse',
                                blockingError: result.blockingError,
                            }),
                        })];
                case 12: return [4 /*yield*/, _o.sent()];
                case 13:
                    _o.sent();
                    _o.label = 14;
                case 14:
                    if (!result.preventContinuation) return [3 /*break*/, 18];
                    return [4 /*yield*/, __await({
                            message: (0, attachments_js_1.createAttachmentMessage)({
                                type: 'hook_stopped_continuation',
                                message: result.stopReason || 'Execution stopped by PostToolUse hook',
                                hookName: "PostToolUse:".concat(tool.name),
                                toolUseID: toolUseID,
                                hookEvent: 'PostToolUse',
                            }),
                        })];
                case 15: return [4 /*yield*/, _o.sent()];
                case 16:
                    _o.sent();
                    return [4 /*yield*/, __await(void 0)];
                case 17: return [2 /*return*/, _o.sent()];
                case 18:
                    if (!(result.additionalContexts && result.additionalContexts.length > 0)) return [3 /*break*/, 21];
                    return [4 /*yield*/, __await({
                            message: (0, attachments_js_1.createAttachmentMessage)({
                                type: 'hook_additional_context',
                                content: result.additionalContexts,
                                hookName: "PostToolUse:".concat(tool.name),
                                toolUseID: toolUseID,
                                hookEvent: 'PostToolUse',
                            }),
                        })];
                case 19: return [4 /*yield*/, _o.sent()];
                case 20:
                    _o.sent();
                    _o.label = 21;
                case 21:
                    if (!(result.updatedMCPToolOutput && (0, utils_js_1.isMcpTool)(tool))) return [3 /*break*/, 24];
                    toolOutput = result.updatedMCPToolOutput;
                    return [4 /*yield*/, __await({
                            updatedMCPToolOutput: toolOutput,
                        })];
                case 22: return [4 /*yield*/, _o.sent()];
                case 23:
                    _o.sent();
                    _o.label = 24;
                case 24: return [3 /*break*/, 28];
                case 25:
                    error_1 = _o.sent();
                    postToolDurationMs = Date.now() - postToolStartTime;
                    (0, index_js_1.logEvent)('tengu_post_tool_hook_error', __assign(__assign({ messageID: messageId, toolName: (0, metadata_js_1.sanitizeToolNameForAnalytics)(tool.name), isMcp: (_k = tool.isMcp) !== null && _k !== void 0 ? _k : false, duration: postToolDurationMs, queryChainId: (_l = toolUseContext.queryTracking) === null || _l === void 0 ? void 0 : _l.chainId, queryDepth: (_m = toolUseContext.queryTracking) === null || _m === void 0 ? void 0 : _m.depth }, (mcpServerType
                        ? {
                            mcpServerType: mcpServerType,
                        }
                        : {})), (requestId
                        ? {
                            requestId: requestId,
                        }
                        : {})));
                    return [4 /*yield*/, __await({
                            message: (0, attachments_js_1.createAttachmentMessage)({
                                type: 'hook_error_during_execution',
                                content: (0, toolErrors_js_1.formatError)(error_1),
                                hookName: "PostToolUse:".concat(tool.name),
                                toolUseID: toolUseID,
                                hookEvent: 'PostToolUse',
                            }),
                        })];
                case 26: return [4 /*yield*/, _o.sent()];
                case 27:
                    _o.sent();
                    return [3 /*break*/, 28];
                case 28:
                    _a = true;
                    return [3 /*break*/, 3];
                case 29: return [3 /*break*/, 36];
                case 30:
                    e_1_1 = _o.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 36];
                case 31:
                    _o.trys.push([31, , 34, 35]);
                    if (!(!_a && !_d && (_e = _b.return))) return [3 /*break*/, 33];
                    return [4 /*yield*/, __await(_e.call(_b))];
                case 32:
                    _o.sent();
                    _o.label = 33;
                case 33: return [3 /*break*/, 35];
                case 34:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 35: return [7 /*endfinally*/];
                case 36: return [3 /*break*/, 38];
                case 37:
                    error_2 = _o.sent();
                    (0, log_js_1.logError)(error_2);
                    return [3 /*break*/, 38];
                case 38: return [2 /*return*/];
            }
        });
    });
}
function runPostToolUseFailureHooks(toolUseContext, tool, toolUseID, messageId, processedInput, error, isInterrupt, requestId, mcpServerType, mcpServerBaseUrl) {
    return __asyncGenerator(this, arguments, function runPostToolUseFailureHooks_1() {
        var postToolStartTime, appState, permissionMode, _a, _b, _c, result, hookError_1, postToolDurationMs, e_2_1, outerError_1;
        var _d, e_2, _e, _f;
        var _g, _h, _j, _k, _l, _m;
        return __generator(this, function (_o) {
            switch (_o.label) {
                case 0:
                    postToolStartTime = Date.now();
                    _o.label = 1;
                case 1:
                    _o.trys.push([1, 30, , 31]);
                    appState = toolUseContext.getAppState();
                    permissionMode = appState.toolPermissionContext.mode;
                    _o.label = 2;
                case 2:
                    _o.trys.push([2, 23, 24, 29]);
                    _a = true, _b = __asyncValues((0, hooks_js_1.executePostToolUseFailureHooks)(tool.name, toolUseID, processedInput, error, toolUseContext, isInterrupt, permissionMode, toolUseContext.abortController.signal));
                    _o.label = 3;
                case 3: return [4 /*yield*/, __await(_b.next())];
                case 4:
                    if (!(_c = _o.sent(), _d = _c.done, !_d)) return [3 /*break*/, 22];
                    _f = _c.value;
                    _a = false;
                    result = _f;
                    _o.label = 5;
                case 5:
                    _o.trys.push([5, 18, , 21]);
                    if (!(((_g = result.message) === null || _g === void 0 ? void 0 : _g.type) === 'attachment' &&
                        result.message.attachment.type === 'hook_cancelled')) return [3 /*break*/, 8];
                    (0, index_js_1.logEvent)('tengu_post_tool_failure_hooks_cancelled', {
                        toolName: (0, metadata_js_1.sanitizeToolNameForAnalytics)(tool.name),
                        queryChainId: (_h = toolUseContext.queryTracking) === null || _h === void 0 ? void 0 : _h.chainId,
                        queryDepth: (_j = toolUseContext.queryTracking) === null || _j === void 0 ? void 0 : _j.depth,
                    });
                    return [4 /*yield*/, __await({
                            message: (0, attachments_js_1.createAttachmentMessage)({
                                type: 'hook_cancelled',
                                hookName: "PostToolUseFailure:".concat(tool.name),
                                toolUseID: toolUseID,
                                hookEvent: 'PostToolUseFailure',
                            }),
                        })];
                case 6: return [4 /*yield*/, _o.sent()];
                case 7:
                    _o.sent();
                    return [3 /*break*/, 21];
                case 8:
                    if (!(result.message &&
                        !(result.message.type === 'attachment' &&
                            result.message.attachment.type === 'hook_blocking_error'))) return [3 /*break*/, 11];
                    return [4 /*yield*/, __await({ message: result.message })];
                case 9: return [4 /*yield*/, _o.sent()];
                case 10:
                    _o.sent();
                    _o.label = 11;
                case 11:
                    if (!result.blockingError) return [3 /*break*/, 14];
                    return [4 /*yield*/, __await({
                            message: (0, attachments_js_1.createAttachmentMessage)({
                                type: 'hook_blocking_error',
                                hookName: "PostToolUseFailure:".concat(tool.name),
                                toolUseID: toolUseID,
                                hookEvent: 'PostToolUseFailure',
                                blockingError: result.blockingError,
                            }),
                        })];
                case 12: return [4 /*yield*/, _o.sent()];
                case 13:
                    _o.sent();
                    _o.label = 14;
                case 14:
                    if (!(result.additionalContexts && result.additionalContexts.length > 0)) return [3 /*break*/, 17];
                    return [4 /*yield*/, __await({
                            message: (0, attachments_js_1.createAttachmentMessage)({
                                type: 'hook_additional_context',
                                content: result.additionalContexts,
                                hookName: "PostToolUseFailure:".concat(tool.name),
                                toolUseID: toolUseID,
                                hookEvent: 'PostToolUseFailure',
                            }),
                        })];
                case 15: return [4 /*yield*/, _o.sent()];
                case 16:
                    _o.sent();
                    _o.label = 17;
                case 17: return [3 /*break*/, 21];
                case 18:
                    hookError_1 = _o.sent();
                    postToolDurationMs = Date.now() - postToolStartTime;
                    (0, index_js_1.logEvent)('tengu_post_tool_failure_hook_error', __assign(__assign({ messageID: messageId, toolName: (0, metadata_js_1.sanitizeToolNameForAnalytics)(tool.name), isMcp: (_k = tool.isMcp) !== null && _k !== void 0 ? _k : false, duration: postToolDurationMs, queryChainId: (_l = toolUseContext.queryTracking) === null || _l === void 0 ? void 0 : _l.chainId, queryDepth: (_m = toolUseContext.queryTracking) === null || _m === void 0 ? void 0 : _m.depth }, (mcpServerType
                        ? {
                            mcpServerType: mcpServerType,
                        }
                        : {})), (requestId
                        ? {
                            requestId: requestId,
                        }
                        : {})));
                    return [4 /*yield*/, __await({
                            message: (0, attachments_js_1.createAttachmentMessage)({
                                type: 'hook_error_during_execution',
                                content: (0, toolErrors_js_1.formatError)(hookError_1),
                                hookName: "PostToolUseFailure:".concat(tool.name),
                                toolUseID: toolUseID,
                                hookEvent: 'PostToolUseFailure',
                            }),
                        })];
                case 19: return [4 /*yield*/, _o.sent()];
                case 20:
                    _o.sent();
                    return [3 /*break*/, 21];
                case 21:
                    _a = true;
                    return [3 /*break*/, 3];
                case 22: return [3 /*break*/, 29];
                case 23:
                    e_2_1 = _o.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 29];
                case 24:
                    _o.trys.push([24, , 27, 28]);
                    if (!(!_a && !_d && (_e = _b.return))) return [3 /*break*/, 26];
                    return [4 /*yield*/, __await(_e.call(_b))];
                case 25:
                    _o.sent();
                    _o.label = 26;
                case 26: return [3 /*break*/, 28];
                case 27:
                    if (e_2) throw e_2.error;
                    return [7 /*endfinally*/];
                case 28: return [7 /*endfinally*/];
                case 29: return [3 /*break*/, 31];
                case 30:
                    outerError_1 = _o.sent();
                    (0, log_js_1.logError)(outerError_1);
                    return [3 /*break*/, 31];
                case 31: return [2 /*return*/];
            }
        });
    });
}
/**
 * Resolve a PreToolUse hook's permission result into a final PermissionDecision.
 *
 * Encapsulates the invariant that hook 'allow' does NOT bypass settings.json
 * deny/ask rules — checkRuleBasedPermissions still applies (inc-4788 analog).
 * Also handles the requiresUserInteraction/requireCanUseTool guards and the
 * 'ask' forceDecision passthrough.
 *
 * Shared by toolExecution.ts (main query loop) and REPLTool/toolWrappers.ts
 * (REPL inner calls) so the permission semantics stay in lockstep.
 */
function resolveHookPermissionDecision(hookPermissionResult, tool, input, toolUseContext, canUseTool, assistantMessage, toolUseID) {
    return __awaiter(this, void 0, void 0, function () {
        var requiresInteraction, requireCanUseTool, hookInput, interactionSatisfied, ruleCheck, forceDecision, askInput;
        var _a, _b, _c;
        var _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    requiresInteraction = (_d = tool.requiresUserInteraction) === null || _d === void 0 ? void 0 : _d.call(tool);
                    requireCanUseTool = toolUseContext.requireCanUseTool;
                    if (!((hookPermissionResult === null || hookPermissionResult === void 0 ? void 0 : hookPermissionResult.behavior) === 'allow')) return [3 /*break*/, 5];
                    hookInput = (_e = hookPermissionResult.updatedInput) !== null && _e !== void 0 ? _e : input;
                    interactionSatisfied = requiresInteraction && hookPermissionResult.updatedInput !== undefined;
                    if (!((requiresInteraction && !interactionSatisfied) || requireCanUseTool)) return [3 /*break*/, 2];
                    (0, debug_js_1.logForDebugging)("Hook approved tool use for ".concat(tool.name, ", but canUseTool is required"));
                    _a = {};
                    return [4 /*yield*/, canUseTool(tool, hookInput, toolUseContext, assistantMessage, toolUseID)];
                case 1: return [2 /*return*/, (_a.decision = _f.sent(),
                        _a.input = hookInput,
                        _a)];
                case 2: return [4 /*yield*/, (0, permissions_js_1.checkRuleBasedPermissions)(tool, hookInput, toolUseContext)];
                case 3:
                    ruleCheck = _f.sent();
                    if (ruleCheck === null) {
                        (0, debug_js_1.logForDebugging)(interactionSatisfied
                            ? "Hook satisfied user interaction for ".concat(tool.name, " via updatedInput")
                            : "Hook approved tool use for ".concat(tool.name, ", bypassing permission prompt"));
                        return [2 /*return*/, { decision: hookPermissionResult, input: hookInput }];
                    }
                    if (ruleCheck.behavior === 'deny') {
                        (0, debug_js_1.logForDebugging)("Hook approved tool use for ".concat(tool.name, ", but deny rule overrides: ").concat(ruleCheck.message));
                        return [2 /*return*/, { decision: ruleCheck, input: hookInput }];
                    }
                    // ask rule — dialog required despite hook approval
                    (0, debug_js_1.logForDebugging)("Hook approved tool use for ".concat(tool.name, ", but ask rule requires prompt"));
                    _b = {};
                    return [4 /*yield*/, canUseTool(tool, hookInput, toolUseContext, assistantMessage, toolUseID)];
                case 4: return [2 /*return*/, (_b.decision = _f.sent(),
                        _b.input = hookInput,
                        _b)];
                case 5:
                    if ((hookPermissionResult === null || hookPermissionResult === void 0 ? void 0 : hookPermissionResult.behavior) === 'deny') {
                        (0, debug_js_1.logForDebugging)("Hook denied tool use for ".concat(tool.name));
                        return [2 /*return*/, { decision: hookPermissionResult, input: input }];
                    }
                    forceDecision = (hookPermissionResult === null || hookPermissionResult === void 0 ? void 0 : hookPermissionResult.behavior) === 'ask' ? hookPermissionResult : undefined;
                    askInput = (hookPermissionResult === null || hookPermissionResult === void 0 ? void 0 : hookPermissionResult.behavior) === 'ask' &&
                        hookPermissionResult.updatedInput
                        ? hookPermissionResult.updatedInput
                        : input;
                    _c = {};
                    return [4 /*yield*/, canUseTool(tool, askInput, toolUseContext, assistantMessage, toolUseID, forceDecision)];
                case 6: return [2 /*return*/, (_c.decision = _f.sent(),
                        _c.input = askInput,
                        _c)];
            }
        });
    });
}
function runPreToolUseHooks(toolUseContext, tool, processedInput, toolUseID, messageId, requestId, mcpServerType, mcpServerBaseUrl) {
    return __asyncGenerator(this, arguments, function runPreToolUseHooks_1() {
        var hookStartTime, appState, _a, _b, _c, result, denialMessage, decisionReason, error_3, durationMs, e_3_1, error_4;
        var _d, e_3, _e, _f;
        var _g, _h, _j, _k, _l, _m;
        return __generator(this, function (_o) {
            switch (_o.label) {
                case 0:
                    hookStartTime = Date.now();
                    _o.label = 1;
                case 1:
                    _o.trys.push([1, 52, , 56]);
                    appState = toolUseContext.getAppState();
                    _o.label = 2;
                case 2:
                    _o.trys.push([2, 45, 46, 51]);
                    _a = true, _b = __asyncValues((0, hooks_js_1.executePreToolHooks)(tool.name, toolUseID, processedInput, toolUseContext, appState.toolPermissionContext.mode, toolUseContext.abortController.signal, undefined, // timeoutMs - use default
                    toolUseContext.requestPrompt, (_g = tool.getToolUseSummary) === null || _g === void 0 ? void 0 : _g.call(tool, processedInput)));
                    _o.label = 3;
                case 3: return [4 /*yield*/, __await(_b.next())];
                case 4:
                    if (!(_c = _o.sent(), _d = _c.done, !_d)) return [3 /*break*/, 44];
                    _f = _c.value;
                    _a = false;
                    result = _f;
                    _o.label = 5;
                case 5:
                    _o.trys.push([5, 38, , 43]);
                    if (!result.message) return [3 /*break*/, 8];
                    return [4 /*yield*/, __await({ type: 'message', message: { message: result.message } })];
                case 6: return [4 /*yield*/, _o.sent()];
                case 7:
                    _o.sent();
                    _o.label = 8;
                case 8:
                    if (!result.blockingError) return [3 /*break*/, 11];
                    denialMessage = (0, hooks_js_1.getPreToolHookBlockingMessage)("PreToolUse:".concat(tool.name), result.blockingError);
                    return [4 /*yield*/, __await({
                            type: 'hookPermissionResult',
                            hookPermissionResult: {
                                behavior: 'deny',
                                message: denialMessage,
                                decisionReason: {
                                    type: 'hook',
                                    hookName: "PreToolUse:".concat(tool.name),
                                    reason: denialMessage,
                                },
                            },
                        })];
                case 9: return [4 /*yield*/, _o.sent()];
                case 10:
                    _o.sent();
                    _o.label = 11;
                case 11:
                    if (!result.preventContinuation) return [3 /*break*/, 16];
                    return [4 /*yield*/, __await({
                            type: 'preventContinuation',
                            shouldPreventContinuation: true,
                        })];
                case 12: return [4 /*yield*/, _o.sent()];
                case 13:
                    _o.sent();
                    if (!result.stopReason) return [3 /*break*/, 16];
                    return [4 /*yield*/, __await({ type: 'stopReason', stopReason: result.stopReason })];
                case 14: return [4 /*yield*/, _o.sent()];
                case 15:
                    _o.sent();
                    _o.label = 16;
                case 16:
                    if (!(result.permissionBehavior !== undefined)) return [3 /*break*/, 25];
                    (0, debug_js_1.logForDebugging)("Hook result has permissionBehavior=".concat(result.permissionBehavior));
                    decisionReason = {
                        type: 'hook',
                        hookName: "PreToolUse:".concat(tool.name),
                        hookSource: result.hookSource,
                        reason: result.hookPermissionDecisionReason,
                    };
                    if (!(result.permissionBehavior === 'allow')) return [3 /*break*/, 19];
                    return [4 /*yield*/, __await({
                            type: 'hookPermissionResult',
                            hookPermissionResult: {
                                behavior: 'allow',
                                updatedInput: result.updatedInput,
                                decisionReason: decisionReason,
                            },
                        })];
                case 17: return [4 /*yield*/, _o.sent()];
                case 18:
                    _o.sent();
                    return [3 /*break*/, 25];
                case 19:
                    if (!(result.permissionBehavior === 'ask')) return [3 /*break*/, 22];
                    return [4 /*yield*/, __await({
                            type: 'hookPermissionResult',
                            hookPermissionResult: {
                                behavior: 'ask',
                                updatedInput: result.updatedInput,
                                message: result.hookPermissionDecisionReason ||
                                    "Hook PreToolUse:".concat(tool.name, " ").concat((0, PermissionResult_js_1.getRuleBehaviorDescription)(result.permissionBehavior), " this tool"),
                                decisionReason: decisionReason,
                            },
                        })];
                case 20: return [4 /*yield*/, _o.sent()];
                case 21:
                    _o.sent();
                    return [3 /*break*/, 25];
                case 22: return [4 /*yield*/, __await({
                        type: 'hookPermissionResult',
                        hookPermissionResult: {
                            behavior: result.permissionBehavior,
                            message: result.hookPermissionDecisionReason ||
                                "Hook PreToolUse:".concat(tool.name, " ").concat((0, PermissionResult_js_1.getRuleBehaviorDescription)(result.permissionBehavior), " this tool"),
                            decisionReason: decisionReason,
                        },
                    })];
                case 23: 
                // deny - updatedInput is irrelevant since tool won't run
                return [4 /*yield*/, _o.sent()];
                case 24:
                    // deny - updatedInput is irrelevant since tool won't run
                    _o.sent();
                    _o.label = 25;
                case 25:
                    if (!(result.updatedInput && result.permissionBehavior === undefined)) return [3 /*break*/, 28];
                    return [4 /*yield*/, __await({
                            type: 'hookUpdatedInput',
                            updatedInput: result.updatedInput,
                        })];
                case 26: return [4 /*yield*/, _o.sent()];
                case 27:
                    _o.sent();
                    _o.label = 28;
                case 28:
                    if (!(result.additionalContexts && result.additionalContexts.length > 0)) return [3 /*break*/, 31];
                    return [4 /*yield*/, __await({
                            type: 'additionalContext',
                            message: {
                                message: (0, attachments_js_1.createAttachmentMessage)({
                                    type: 'hook_additional_context',
                                    content: result.additionalContexts,
                                    hookName: "PreToolUse:".concat(tool.name),
                                    toolUseID: toolUseID,
                                    hookEvent: 'PreToolUse',
                                }),
                            },
                        })];
                case 29: return [4 /*yield*/, _o.sent()];
                case 30:
                    _o.sent();
                    _o.label = 31;
                case 31:
                    if (!toolUseContext.abortController.signal.aborted) return [3 /*break*/, 37];
                    (0, index_js_1.logEvent)('tengu_pre_tool_hooks_cancelled', {
                        toolName: (0, metadata_js_1.sanitizeToolNameForAnalytics)(tool.name),
                        queryChainId: (_h = toolUseContext.queryTracking) === null || _h === void 0 ? void 0 : _h.chainId,
                        queryDepth: (_j = toolUseContext.queryTracking) === null || _j === void 0 ? void 0 : _j.depth,
                    });
                    return [4 /*yield*/, __await({
                            type: 'message',
                            message: {
                                message: (0, attachments_js_1.createAttachmentMessage)({
                                    type: 'hook_cancelled',
                                    hookName: "PreToolUse:".concat(tool.name),
                                    toolUseID: toolUseID,
                                    hookEvent: 'PreToolUse',
                                }),
                            },
                        })];
                case 32: return [4 /*yield*/, _o.sent()];
                case 33:
                    _o.sent();
                    return [4 /*yield*/, __await({ type: 'stop' })];
                case 34: return [4 /*yield*/, _o.sent()];
                case 35:
                    _o.sent();
                    return [4 /*yield*/, __await(void 0)];
                case 36: return [2 /*return*/, _o.sent()];
                case 37: return [3 /*break*/, 43];
                case 38:
                    error_3 = _o.sent();
                    (0, log_js_1.logError)(error_3);
                    durationMs = Date.now() - hookStartTime;
                    (0, index_js_1.logEvent)('tengu_pre_tool_hook_error', __assign(__assign({ messageID: messageId, toolName: (0, metadata_js_1.sanitizeToolNameForAnalytics)(tool.name), isMcp: (_k = tool.isMcp) !== null && _k !== void 0 ? _k : false, duration: durationMs, queryChainId: (_l = toolUseContext.queryTracking) === null || _l === void 0 ? void 0 : _l.chainId, queryDepth: (_m = toolUseContext.queryTracking) === null || _m === void 0 ? void 0 : _m.depth }, (mcpServerType
                        ? {
                            mcpServerType: mcpServerType,
                        }
                        : {})), (requestId
                        ? {
                            requestId: requestId,
                        }
                        : {})));
                    return [4 /*yield*/, __await({
                            type: 'message',
                            message: {
                                message: (0, attachments_js_1.createAttachmentMessage)({
                                    type: 'hook_error_during_execution',
                                    content: (0, toolErrors_js_1.formatError)(error_3),
                                    hookName: "PreToolUse:".concat(tool.name),
                                    toolUseID: toolUseID,
                                    hookEvent: 'PreToolUse',
                                }),
                            },
                        })];
                case 39: return [4 /*yield*/, _o.sent()];
                case 40:
                    _o.sent();
                    return [4 /*yield*/, __await({ type: 'stop' })];
                case 41: return [4 /*yield*/, _o.sent()];
                case 42:
                    _o.sent();
                    return [3 /*break*/, 43];
                case 43:
                    _a = true;
                    return [3 /*break*/, 3];
                case 44: return [3 /*break*/, 51];
                case 45:
                    e_3_1 = _o.sent();
                    e_3 = { error: e_3_1 };
                    return [3 /*break*/, 51];
                case 46:
                    _o.trys.push([46, , 49, 50]);
                    if (!(!_a && !_d && (_e = _b.return))) return [3 /*break*/, 48];
                    return [4 /*yield*/, __await(_e.call(_b))];
                case 47:
                    _o.sent();
                    _o.label = 48;
                case 48: return [3 /*break*/, 50];
                case 49:
                    if (e_3) throw e_3.error;
                    return [7 /*endfinally*/];
                case 50: return [7 /*endfinally*/];
                case 51: return [3 /*break*/, 56];
                case 52:
                    error_4 = _o.sent();
                    (0, log_js_1.logError)(error_4);
                    return [4 /*yield*/, __await({ type: 'stop' })];
                case 53: return [4 /*yield*/, _o.sent()];
                case 54:
                    _o.sent();
                    return [4 /*yield*/, __await(void 0)];
                case 55: return [2 /*return*/, _o.sent()];
                case 56: return [2 /*return*/];
            }
        });
    });
}
