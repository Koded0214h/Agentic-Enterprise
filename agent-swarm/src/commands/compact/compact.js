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
exports.call = void 0;
var bun_bundle_1 = require("bun:bundle");
var chalk_1 = require("chalk");
var state_js_1 = require("src/bootstrap/state.js");
var prompts_js_1 = require("../../constants/prompts.js");
var context_js_1 = require("../../context.js");
var shortcutFormat_js_1 = require("../../keybindings/shortcutFormat.js");
var promptCacheBreakDetection_js_1 = require("../../services/api/promptCacheBreakDetection.js");
var compact_js_1 = require("../../services/compact/compact.js");
var compactWarningState_js_1 = require("../../services/compact/compactWarningState.js");
var microCompact_js_1 = require("../../services/compact/microCompact.js");
var postCompactCleanup_js_1 = require("../../services/compact/postCompactCleanup.js");
var sessionMemoryCompact_js_1 = require("../../services/compact/sessionMemoryCompact.js");
var sessionMemoryUtils_js_1 = require("../../services/SessionMemory/sessionMemoryUtils.js");
var errors_js_1 = require("../../utils/errors.js");
var hooks_js_1 = require("../../utils/hooks.js");
var log_js_1 = require("../../utils/log.js");
var messages_js_1 = require("../../utils/messages.js");
var contextWindowUpgradeCheck_js_1 = require("../../utils/model/contextWindowUpgradeCheck.js");
var systemPrompt_js_1 = require("../../utils/systemPrompt.js");
/* eslint-disable @typescript-eslint/no-require-imports */
var reactiveCompact = (0, bun_bundle_1.feature)('REACTIVE_COMPACT')
    ? require('../../services/compact/reactiveCompact.js')
    : null;
/* eslint-enable @typescript-eslint/no-require-imports */
var call = function (args, context) { return __awaiter(void 0, void 0, void 0, function () {
    var abortController, messages, customInstructions, sessionMemoryResult, microcompactResult, messagesForCompact, result, _a, _b, error_1;
    var _c, _d, _e, _f, _g;
    return __generator(this, function (_h) {
        switch (_h.label) {
            case 0:
                abortController = context.abortController;
                messages = context.messages;
                // REPL keeps snipped messages for UI scrollback — project so the compact
                // model doesn't summarize content that was intentionally removed.
                messages = (0, messages_js_1.getMessagesAfterCompactBoundary)(messages);
                if (messages.length === 0) {
                    throw new Error('No messages to compact');
                }
                customInstructions = args.trim();
                _h.label = 1;
            case 1:
                _h.trys.push([1, 9, , 10]);
                if (!!customInstructions) return [3 /*break*/, 3];
                return [4 /*yield*/, (0, sessionMemoryCompact_js_1.trySessionMemoryCompaction)(messages, context.agentId)];
            case 2:
                sessionMemoryResult = _h.sent();
                if (sessionMemoryResult) {
                    (_d = (_c = context_js_1.getUserContext.cache).clear) === null || _d === void 0 ? void 0 : _d.call(_c);
                    (0, postCompactCleanup_js_1.runPostCompactCleanup)();
                    // Reset cache read baseline so the post-compact drop isn't flagged
                    // as a break. compactConversation does this internally; SM-compact doesn't.
                    if ((0, bun_bundle_1.feature)('PROMPT_CACHE_BREAK_DETECTION')) {
                        (0, promptCacheBreakDetection_js_1.notifyCompaction)((_e = context.options.querySource) !== null && _e !== void 0 ? _e : 'compact', context.agentId);
                    }
                    (0, state_js_1.markPostCompaction)();
                    // Suppress warning immediately after successful compaction
                    (0, compactWarningState_js_1.suppressCompactWarning)();
                    return [2 /*return*/, {
                            type: 'compact',
                            compactionResult: sessionMemoryResult,
                            displayText: buildDisplayText(context),
                        }];
                }
                _h.label = 3;
            case 3:
                if (!(reactiveCompact === null || reactiveCompact === void 0 ? void 0 : reactiveCompact.isReactiveOnlyMode())) return [3 /*break*/, 5];
                return [4 /*yield*/, compactViaReactive(messages, context, customInstructions, reactiveCompact)];
            case 4: return [2 /*return*/, _h.sent()];
            case 5: return [4 /*yield*/, (0, microCompact_js_1.microcompactMessages)(messages, context)];
            case 6:
                microcompactResult = _h.sent();
                messagesForCompact = microcompactResult.messages;
                _a = compact_js_1.compactConversation;
                _b = [messagesForCompact,
                    context];
                return [4 /*yield*/, getCacheSharingParams(context, messagesForCompact)];
            case 7: return [4 /*yield*/, _a.apply(void 0, _b.concat([_h.sent(), false,
                    customInstructions,
                    false]))
                // Reset lastSummarizedMessageId since legacy compaction replaces all messages
                // and the old message UUID will no longer exist in the new messages array
            ];
            case 8:
                result = _h.sent();
                // Reset lastSummarizedMessageId since legacy compaction replaces all messages
                // and the old message UUID will no longer exist in the new messages array
                (0, sessionMemoryUtils_js_1.setLastSummarizedMessageId)(undefined);
                // Suppress the "Context left until auto-compact" warning after successful compaction
                (0, compactWarningState_js_1.suppressCompactWarning)();
                (_g = (_f = context_js_1.getUserContext.cache).clear) === null || _g === void 0 ? void 0 : _g.call(_f);
                (0, postCompactCleanup_js_1.runPostCompactCleanup)();
                return [2 /*return*/, {
                        type: 'compact',
                        compactionResult: result,
                        displayText: buildDisplayText(context, result.userDisplayMessage),
                    }];
            case 9:
                error_1 = _h.sent();
                if (abortController.signal.aborted) {
                    throw new Error('Compaction canceled.');
                }
                else if ((0, errors_js_1.hasExactErrorMessage)(error_1, compact_js_1.ERROR_MESSAGE_NOT_ENOUGH_MESSAGES)) {
                    throw new Error(compact_js_1.ERROR_MESSAGE_NOT_ENOUGH_MESSAGES);
                }
                else if ((0, errors_js_1.hasExactErrorMessage)(error_1, compact_js_1.ERROR_MESSAGE_INCOMPLETE_RESPONSE)) {
                    throw new Error(compact_js_1.ERROR_MESSAGE_INCOMPLETE_RESPONSE);
                }
                else {
                    (0, log_js_1.logError)(error_1);
                    throw new Error("Error during compaction: ".concat(error_1));
                }
                return [3 /*break*/, 10];
            case 10: return [2 /*return*/];
        }
    });
}); };
exports.call = call;
function compactViaReactive(messages, context, customInstructions, reactive) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, hookResult, cacheSafeParams, mergedInstructions, outcome, combinedMessage;
        var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        return __generator(this, function (_o) {
            switch (_o.label) {
                case 0:
                    (_b = context.onCompactProgress) === null || _b === void 0 ? void 0 : _b.call(context, {
                        type: 'hooks_start',
                        hookType: 'pre_compact',
                    });
                    (_c = context.setSDKStatus) === null || _c === void 0 ? void 0 : _c.call(context, 'compacting');
                    _o.label = 1;
                case 1:
                    _o.trys.push([1, , 4, 5]);
                    return [4 /*yield*/, Promise.all([
                            (0, hooks_js_1.executePreCompactHooks)({ trigger: 'manual', customInstructions: customInstructions || null }, context.abortController.signal),
                            getCacheSharingParams(context, messages),
                        ])];
                case 2:
                    _a = _o.sent(), hookResult = _a[0], cacheSafeParams = _a[1];
                    mergedInstructions = (0, compact_js_1.mergeHookInstructions)(customInstructions, hookResult.newCustomInstructions);
                    (_d = context.setStreamMode) === null || _d === void 0 ? void 0 : _d.call(context, 'requesting');
                    (_e = context.setResponseLength) === null || _e === void 0 ? void 0 : _e.call(context, function () { return 0; });
                    (_f = context.onCompactProgress) === null || _f === void 0 ? void 0 : _f.call(context, { type: 'compact_start' });
                    return [4 /*yield*/, reactive.reactiveCompactOnPromptTooLong(messages, cacheSafeParams, { customInstructions: mergedInstructions, trigger: 'manual' })];
                case 3:
                    outcome = _o.sent();
                    if (!outcome.ok) {
                        // The outer catch in `call` translates these: aborted → "Compaction
                        // canceled." (via abortController.signal.aborted check), NOT_ENOUGH →
                        // re-thrown as-is, everything else → "Error during compaction: …".
                        switch (outcome.reason) {
                            case 'too_few_groups':
                                throw new Error(compact_js_1.ERROR_MESSAGE_NOT_ENOUGH_MESSAGES);
                            case 'aborted':
                                throw new Error(compact_js_1.ERROR_MESSAGE_USER_ABORT);
                            case 'exhausted':
                            case 'error':
                            case 'media_unstrippable':
                                throw new Error(compact_js_1.ERROR_MESSAGE_INCOMPLETE_RESPONSE);
                        }
                    }
                    // Mirrors the post-success cleanup in tryReactiveCompact, minus
                    // resetMicrocompactState — processSlashCommand calls that for all
                    // type:'compact' results.
                    (0, sessionMemoryUtils_js_1.setLastSummarizedMessageId)(undefined);
                    (0, postCompactCleanup_js_1.runPostCompactCleanup)();
                    (0, compactWarningState_js_1.suppressCompactWarning)();
                    (_h = (_g = context_js_1.getUserContext.cache).clear) === null || _h === void 0 ? void 0 : _h.call(_g);
                    combinedMessage = [hookResult.userDisplayMessage, outcome.result.userDisplayMessage]
                        .filter(Boolean)
                        .join('\n') || undefined;
                    return [2 /*return*/, {
                            type: 'compact',
                            compactionResult: __assign(__assign({}, outcome.result), { userDisplayMessage: combinedMessage }),
                            displayText: buildDisplayText(context, combinedMessage),
                        }];
                case 4:
                    (_j = context.setStreamMode) === null || _j === void 0 ? void 0 : _j.call(context, 'requesting');
                    (_k = context.setResponseLength) === null || _k === void 0 ? void 0 : _k.call(context, function () { return 0; });
                    (_l = context.onCompactProgress) === null || _l === void 0 ? void 0 : _l.call(context, { type: 'compact_end' });
                    (_m = context.setSDKStatus) === null || _m === void 0 ? void 0 : _m.call(context, null);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function buildDisplayText(context, userDisplayMessage) {
    var upgradeMessage = (0, contextWindowUpgradeCheck_js_1.getUpgradeMessage)('tip');
    var expandShortcut = (0, shortcutFormat_js_1.getShortcutDisplay)('app:toggleTranscript', 'Global', 'ctrl+o');
    var dimmed = __spreadArray(__spreadArray(__spreadArray([], (context.options.verbose
        ? []
        : ["(".concat(expandShortcut, " to see full summary)")]), true), (userDisplayMessage ? [userDisplayMessage] : []), true), (upgradeMessage ? [upgradeMessage] : []), true);
    return chalk_1.default.dim('Compacted ' + dimmed.join('\n'));
}
function getCacheSharingParams(context, forkContextMessages) {
    return __awaiter(this, void 0, void 0, function () {
        var appState, defaultSysPrompt, systemPrompt, _a, userContext, systemContext;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    appState = context.getAppState();
                    return [4 /*yield*/, (0, prompts_js_1.getSystemPrompt)(context.options.tools, context.options.mainLoopModel, Array.from(appState.toolPermissionContext.additionalWorkingDirectories.keys()), context.options.mcpClients)];
                case 1:
                    defaultSysPrompt = _b.sent();
                    systemPrompt = (0, systemPrompt_js_1.buildEffectiveSystemPrompt)({
                        mainThreadAgentDefinition: undefined,
                        toolUseContext: context,
                        customSystemPrompt: context.options.customSystemPrompt,
                        defaultSystemPrompt: defaultSysPrompt,
                        appendSystemPrompt: context.options.appendSystemPrompt,
                    });
                    return [4 /*yield*/, Promise.all([
                            (0, context_js_1.getUserContext)(),
                            (0, context_js_1.getSystemContext)(),
                        ])];
                case 2:
                    _a = _b.sent(), userContext = _a[0], systemContext = _a[1];
                    return [2 /*return*/, {
                            systemPrompt: systemPrompt,
                            userContext: userContext,
                            systemContext: systemContext,
                            toolUseContext: context,
                            forkContextMessages: forkContextMessages,
                        }];
            }
        });
    });
}
