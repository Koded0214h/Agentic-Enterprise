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
exports.createPermissionContext = createPermissionContext;
exports.createPermissionQueueOps = createPermissionQueueOps;
exports.createResolveOnce = createResolveOnce;
var bun_bundle_1 = require("bun:bundle");
var index_js_1 = require("src/services/analytics/index.js");
var metadata_js_1 = require("src/services/analytics/metadata.js");
var bashPermissions_js_1 = require("../../tools/BashTool/bashPermissions.js");
var toolName_js_1 = require("../../tools/BashTool/toolName.js");
var classifierApprovals_js_1 = require("../../utils/classifierApprovals.js");
var debug_js_1 = require("../../utils/debug.js");
var hooks_js_1 = require("../../utils/hooks.js");
var messages_js_1 = require("../../utils/messages.js");
var PermissionUpdate_js_1 = require("../../utils/permissions/PermissionUpdate.js");
var permissionLogging_js_1 = require("./permissionLogging.js");
function createResolveOnce(resolve) {
    var claimed = false;
    var delivered = false;
    return {
        resolve: function (value) {
            if (delivered)
                return;
            delivered = true;
            claimed = true;
            resolve(value);
        },
        isResolved: function () {
            return claimed;
        },
        claim: function () {
            if (claimed)
                return false;
            claimed = true;
            return true;
        },
    };
}
function createPermissionContext(tool, input, toolUseContext, assistantMessage, toolUseID, setToolPermissionContext, queueOps) {
    var messageId = assistantMessage.message.id;
    var ctx = __assign(__assign({ tool: tool, input: input, toolUseContext: toolUseContext, assistantMessage: assistantMessage, messageId: messageId, toolUseID: toolUseID, logDecision: function (args, opts) {
            var _a;
            (0, permissionLogging_js_1.logPermissionDecision)({
                tool: tool,
                input: (_a = opts === null || opts === void 0 ? void 0 : opts.input) !== null && _a !== void 0 ? _a : input,
                toolUseContext: toolUseContext,
                messageId: messageId,
                toolUseID: toolUseID,
            }, args, opts === null || opts === void 0 ? void 0 : opts.permissionPromptStartTimeMs);
        }, logCancelled: function () {
            (0, index_js_1.logEvent)('tengu_tool_use_cancelled', {
                messageID: messageId,
                toolName: (0, metadata_js_1.sanitizeToolNameForAnalytics)(tool.name),
            });
        }, persistPermissions: function (updates) {
            return __awaiter(this, void 0, void 0, function () {
                var appState;
                return __generator(this, function (_a) {
                    if (updates.length === 0)
                        return [2 /*return*/, false];
                    (0, PermissionUpdate_js_1.persistPermissionUpdates)(updates);
                    appState = toolUseContext.getAppState();
                    setToolPermissionContext((0, PermissionUpdate_js_1.applyPermissionUpdates)(appState.toolPermissionContext, updates));
                    return [2 /*return*/, updates.some(function (update) { return (0, PermissionUpdate_js_1.supportsPersistence)(update.destination); })];
                });
            });
        }, resolveIfAborted: function (resolve) {
            if (!toolUseContext.abortController.signal.aborted)
                return false;
            this.logCancelled();
            resolve(this.cancelAndAbort(undefined, true));
            return true;
        }, cancelAndAbort: function (feedback, isAbort, contentBlocks) {
            var sub = !!toolUseContext.agentId;
            var baseMessage = feedback
                ? "".concat(sub ? messages_js_1.SUBAGENT_REJECT_MESSAGE_WITH_REASON_PREFIX : messages_js_1.REJECT_MESSAGE_WITH_REASON_PREFIX).concat(feedback)
                : sub
                    ? messages_js_1.SUBAGENT_REJECT_MESSAGE
                    : messages_js_1.REJECT_MESSAGE;
            var message = sub ? baseMessage : (0, messages_js_1.withMemoryCorrectionHint)(baseMessage);
            if (isAbort || (!feedback && !(contentBlocks === null || contentBlocks === void 0 ? void 0 : contentBlocks.length) && !sub)) {
                (0, debug_js_1.logForDebugging)("Aborting: tool=".concat(tool.name, " isAbort=").concat(isAbort, " hasFeedback=").concat(!!feedback, " isSubagent=").concat(sub));
                toolUseContext.abortController.abort();
            }
            return { behavior: 'ask', message: message, contentBlocks: contentBlocks };
        } }, ((0, bun_bundle_1.feature)('BASH_CLASSIFIER')
        ? {
            tryClassifier: function (pendingClassifierCheck, updatedInput) {
                return __awaiter(this, void 0, void 0, function () {
                    var classifierDecision, matchedRule;
                    var _a;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                if (tool.name !== toolName_js_1.BASH_TOOL_NAME || !pendingClassifierCheck) {
                                    return [2 /*return*/, null];
                                }
                                return [4 /*yield*/, (0, bashPermissions_js_1.awaitClassifierAutoApproval)(pendingClassifierCheck, toolUseContext.abortController.signal, toolUseContext.options.isNonInteractiveSession)];
                            case 1:
                                classifierDecision = _b.sent();
                                if (!classifierDecision) {
                                    return [2 /*return*/, null];
                                }
                                if ((0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER') &&
                                    classifierDecision.type === 'classifier') {
                                    matchedRule = (_a = classifierDecision.reason.match(/^Allowed by prompt rule: "(.+)"$/)) === null || _a === void 0 ? void 0 : _a[1];
                                    if (matchedRule) {
                                        (0, classifierApprovals_js_1.setClassifierApproval)(toolUseID, matchedRule);
                                    }
                                }
                                (0, permissionLogging_js_1.logPermissionDecision)({ tool: tool, input: input, toolUseContext: toolUseContext, messageId: messageId, toolUseID: toolUseID }, { decision: 'accept', source: { type: 'classifier' } }, undefined);
                                return [2 /*return*/, {
                                        behavior: 'allow',
                                        updatedInput: updatedInput !== null && updatedInput !== void 0 ? updatedInput : input,
                                        userModified: false,
                                        decisionReason: classifierDecision,
                                    }];
                        }
                    });
                });
            },
        }
        : {})), { runHooks: function (permissionMode, suggestions, updatedInput, permissionPromptStartTimeMs) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, _b, _c, hookResult, decision, finalInput, e_1_1;
                var _d, e_1, _e, _f;
                var _g, _h, _j;
                return __generator(this, function (_k) {
                    switch (_k.label) {
                        case 0:
                            _k.trys.push([0, 7, 8, 13]);
                            _a = true, _b = __asyncValues((0, hooks_js_1.executePermissionRequestHooks)(tool.name, toolUseID, input, toolUseContext, permissionMode, suggestions, toolUseContext.abortController.signal));
                            _k.label = 1;
                        case 1: return [4 /*yield*/, _b.next()];
                        case 2:
                            if (!(_c = _k.sent(), _d = _c.done, !_d)) return [3 /*break*/, 6];
                            _f = _c.value;
                            _a = false;
                            hookResult = _f;
                            if (!hookResult.permissionRequestResult) return [3 /*break*/, 5];
                            decision = hookResult.permissionRequestResult;
                            if (!(decision.behavior === 'allow')) return [3 /*break*/, 4];
                            finalInput = (_h = (_g = decision.updatedInput) !== null && _g !== void 0 ? _g : updatedInput) !== null && _h !== void 0 ? _h : input;
                            return [4 /*yield*/, this.handleHookAllow(finalInput, (_j = decision.updatedPermissions) !== null && _j !== void 0 ? _j : [], permissionPromptStartTimeMs)];
                        case 3: return [2 /*return*/, _k.sent()];
                        case 4:
                            if (decision.behavior === 'deny') {
                                this.logDecision({ decision: 'reject', source: { type: 'hook' } }, { permissionPromptStartTimeMs: permissionPromptStartTimeMs });
                                if (decision.interrupt) {
                                    (0, debug_js_1.logForDebugging)("Hook interrupt: tool=".concat(tool.name, " hookMessage=").concat(decision.message));
                                    toolUseContext.abortController.abort();
                                }
                                return [2 /*return*/, this.buildDeny(decision.message || 'Permission denied by hook', {
                                        type: 'hook',
                                        hookName: 'PermissionRequest',
                                        reason: decision.message,
                                    })];
                            }
                            _k.label = 5;
                        case 5:
                            _a = true;
                            return [3 /*break*/, 1];
                        case 6: return [3 /*break*/, 13];
                        case 7:
                            e_1_1 = _k.sent();
                            e_1 = { error: e_1_1 };
                            return [3 /*break*/, 13];
                        case 8:
                            _k.trys.push([8, , 11, 12]);
                            if (!(!_a && !_d && (_e = _b.return))) return [3 /*break*/, 10];
                            return [4 /*yield*/, _e.call(_b)];
                        case 9:
                            _k.sent();
                            _k.label = 10;
                        case 10: return [3 /*break*/, 12];
                        case 11:
                            if (e_1) throw e_1.error;
                            return [7 /*endfinally*/];
                        case 12: return [7 /*endfinally*/];
                        case 13: return [2 /*return*/, null];
                    }
                });
            });
        }, buildAllow: function (updatedInput, opts) {
            var _a;
            return __assign(__assign(__assign({ behavior: 'allow', updatedInput: updatedInput, userModified: (_a = opts === null || opts === void 0 ? void 0 : opts.userModified) !== null && _a !== void 0 ? _a : false }, ((opts === null || opts === void 0 ? void 0 : opts.decisionReason) && { decisionReason: opts.decisionReason })), ((opts === null || opts === void 0 ? void 0 : opts.acceptFeedback) && { acceptFeedback: opts.acceptFeedback })), ((opts === null || opts === void 0 ? void 0 : opts.contentBlocks) &&
                opts.contentBlocks.length > 0 && {
                contentBlocks: opts.contentBlocks,
            }));
        }, buildDeny: function (message, decisionReason) {
            return { behavior: 'deny', message: message, decisionReason: decisionReason };
        }, handleUserAllow: function (updatedInput, permissionUpdates, feedback, permissionPromptStartTimeMs, contentBlocks, decisionReason) {
            return __awaiter(this, void 0, void 0, function () {
                var acceptedPermanentUpdates, userModified, trimmedFeedback;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.persistPermissions(permissionUpdates)];
                        case 1:
                            acceptedPermanentUpdates = _a.sent();
                            this.logDecision({
                                decision: 'accept',
                                source: { type: 'user', permanent: acceptedPermanentUpdates },
                            }, { input: updatedInput, permissionPromptStartTimeMs: permissionPromptStartTimeMs });
                            userModified = tool.inputsEquivalent
                                ? !tool.inputsEquivalent(input, updatedInput)
                                : false;
                            trimmedFeedback = feedback === null || feedback === void 0 ? void 0 : feedback.trim();
                            return [2 /*return*/, this.buildAllow(updatedInput, {
                                    userModified: userModified,
                                    decisionReason: decisionReason,
                                    acceptFeedback: trimmedFeedback || undefined,
                                    contentBlocks: contentBlocks,
                                })];
                    }
                });
            });
        }, handleHookAllow: function (finalInput, permissionUpdates, permissionPromptStartTimeMs) {
            return __awaiter(this, void 0, void 0, function () {
                var acceptedPermanentUpdates;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.persistPermissions(permissionUpdates)];
                        case 1:
                            acceptedPermanentUpdates = _a.sent();
                            this.logDecision({
                                decision: 'accept',
                                source: { type: 'hook', permanent: acceptedPermanentUpdates },
                            }, { input: finalInput, permissionPromptStartTimeMs: permissionPromptStartTimeMs });
                            return [2 /*return*/, this.buildAllow(finalInput, {
                                    decisionReason: { type: 'hook', hookName: 'PermissionRequest' },
                                })];
                    }
                });
            });
        }, pushToQueue: function (item) {
            queueOps === null || queueOps === void 0 ? void 0 : queueOps.push(item);
        }, removeFromQueue: function () {
            queueOps === null || queueOps === void 0 ? void 0 : queueOps.remove(toolUseID);
        }, updateQueueItem: function (patch) {
            queueOps === null || queueOps === void 0 ? void 0 : queueOps.update(toolUseID, patch);
        } });
    return Object.freeze(ctx);
}
/**
 * Create a PermissionQueueOps backed by a React state setter.
 * This is the bridge between React's `setToolUseConfirmQueue` and the
 * generic queue interface used by PermissionContext.
 */
function createPermissionQueueOps(setToolUseConfirmQueue) {
    return {
        push: function (item) {
            setToolUseConfirmQueue(function (queue) { return __spreadArray(__spreadArray([], queue, true), [item], false); });
        },
        remove: function (toolUseID) {
            setToolUseConfirmQueue(function (queue) {
                return queue.filter(function (item) { return item.toolUseID !== toolUseID; });
            });
        },
        update: function (toolUseID, patch) {
            setToolUseConfirmQueue(function (queue) {
                return queue.map(function (item) {
                    return item.toolUseID === toolUseID ? __assign(__assign({}, item), patch) : item;
                });
            });
        },
    };
}
