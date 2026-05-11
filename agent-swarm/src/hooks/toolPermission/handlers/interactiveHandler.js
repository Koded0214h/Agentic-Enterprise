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
exports.handleInteractivePermission = handleInteractivePermission;
var bun_bundle_1 = require("bun:bundle");
var crypto_1 = require("crypto");
var debug_js_1 = require("src/utils/debug.js");
var state_js_1 = require("../../../bootstrap/state.js");
var terminal_focus_state_js_1 = require("../../../ink/terminal-focus-state.js");
var channelNotification_js_1 = require("../../../services/mcp/channelNotification.js");
var channelPermissions_js_1 = require("../../../services/mcp/channelPermissions.js");
var bashPermissions_js_1 = require("../../../tools/BashTool/bashPermissions.js");
var toolName_js_1 = require("../../../tools/BashTool/toolName.js");
var classifierApprovals_js_1 = require("../../../utils/classifierApprovals.js");
var errors_js_1 = require("../../../utils/errors.js");
var permissions_js_1 = require("../../../utils/permissions/permissions.js");
var PermissionContext_js_1 = require("../PermissionContext.js");
/**
 * Handles the interactive (main-agent) permission flow.
 *
 * Pushes a ToolUseConfirm entry to the confirm queue with callbacks:
 * onAbort, onAllow, onReject, recheckPermission, onUserInteraction.
 *
 * Runs permission hooks and bash classifier checks asynchronously in the
 * background, racing them against user interaction. Uses a resolve-once
 * guard and `userInteracted` flag to prevent multiple resolutions.
 *
 * This function does NOT return a Promise -- it sets up callbacks that
 * eventually call `resolve()` to resolve the outer promise owned by
 * the caller.
 */
function handleInteractivePermission(params, resolve) {
    var _this = this;
    var _a, _b, _c;
    var ctx = params.ctx, description = params.description, result = params.result, awaitAutomatedChecksBeforeDialog = params.awaitAutomatedChecksBeforeDialog, bridgeCallbacks = params.bridgeCallbacks, channelCallbacks = params.channelCallbacks;
    var _d = (0, PermissionContext_js_1.createResolveOnce)(resolve), resolveOnce = _d.resolve, isResolved = _d.isResolved, claim = _d.claim;
    var userInteracted = false;
    var checkmarkTransitionTimer;
    // Hoisted so onDismissCheckmark (Esc during checkmark window) can also
    // remove the abort listener — not just the timer callback.
    var checkmarkAbortHandler;
    var bridgeRequestId = bridgeCallbacks ? (0, crypto_1.randomUUID)() : undefined;
    // Hoisted so local/hook/classifier wins can remove the pending channel
    // entry. No "tell remote to dismiss" equivalent — the text sits in your
    // phone, and a stale "yes abc123" after local-resolve falls through
    // tryConsumeReply (entry gone) and gets enqueued as normal chat.
    var channelUnsubscribe;
    var permissionPromptStartTimeMs = Date.now();
    var displayInput = (_a = result.updatedInput) !== null && _a !== void 0 ? _a : ctx.input;
    function clearClassifierIndicator() {
        if ((0, bun_bundle_1.feature)('BASH_CLASSIFIER')) {
            ctx.updateQueueItem({ classifierCheckInProgress: false });
        }
    }
    ctx.pushToQueue(__assign(__assign({ assistantMessage: ctx.assistantMessage, tool: ctx.tool, description: description, input: displayInput, toolUseContext: ctx.toolUseContext, toolUseID: ctx.toolUseID, permissionResult: result, permissionPromptStartTimeMs: permissionPromptStartTimeMs }, ((0, bun_bundle_1.feature)('BASH_CLASSIFIER')
        ? {
            classifierCheckInProgress: !!result.pendingClassifierCheck &&
                !awaitAutomatedChecksBeforeDialog,
        }
        : {})), { onUserInteraction: function () {
            // Called when user starts interacting with the permission dialog
            // (e.g., arrow keys, tab, typing feedback)
            // Hide the classifier indicator since auto-approve is no longer possible
            //
            // Grace period: ignore interactions in the first 200ms to prevent
            // accidental keypresses from canceling the classifier prematurely
            var GRACE_PERIOD_MS = 200;
            if (Date.now() - permissionPromptStartTimeMs < GRACE_PERIOD_MS) {
                return;
            }
            userInteracted = true;
            (0, classifierApprovals_js_1.clearClassifierChecking)(ctx.toolUseID);
            clearClassifierIndicator();
        }, onDismissCheckmark: function () {
            if (checkmarkTransitionTimer) {
                clearTimeout(checkmarkTransitionTimer);
                checkmarkTransitionTimer = undefined;
                if (checkmarkAbortHandler) {
                    ctx.toolUseContext.abortController.signal.removeEventListener('abort', checkmarkAbortHandler);
                    checkmarkAbortHandler = undefined;
                }
                ctx.removeFromQueue();
            }
        }, onAbort: function () {
            if (!claim())
                return;
            if (bridgeCallbacks && bridgeRequestId) {
                bridgeCallbacks.sendResponse(bridgeRequestId, {
                    behavior: 'deny',
                    message: 'User aborted',
                });
                bridgeCallbacks.cancelRequest(bridgeRequestId);
            }
            channelUnsubscribe === null || channelUnsubscribe === void 0 ? void 0 : channelUnsubscribe();
            ctx.logCancelled();
            ctx.logDecision({ decision: 'reject', source: { type: 'user_abort' } }, { permissionPromptStartTimeMs: permissionPromptStartTimeMs });
            resolveOnce(ctx.cancelAndAbort(undefined, true));
        }, onAllow: function (updatedInput, permissionUpdates, feedback, contentBlocks) {
            return __awaiter(this, void 0, void 0, function () {
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (!claim())
                                return [2 /*return*/]; // atomic check-and-mark before await
                            if (bridgeCallbacks && bridgeRequestId) {
                                bridgeCallbacks.sendResponse(bridgeRequestId, {
                                    behavior: 'allow',
                                    updatedInput: updatedInput,
                                    updatedPermissions: permissionUpdates,
                                });
                                bridgeCallbacks.cancelRequest(bridgeRequestId);
                            }
                            channelUnsubscribe === null || channelUnsubscribe === void 0 ? void 0 : channelUnsubscribe();
                            _a = resolveOnce;
                            return [4 /*yield*/, ctx.handleUserAllow(updatedInput, permissionUpdates, feedback, permissionPromptStartTimeMs, contentBlocks, result.decisionReason)];
                        case 1:
                            _a.apply(void 0, [_b.sent()]);
                            return [2 /*return*/];
                    }
                });
            });
        }, onReject: function (feedback, contentBlocks) {
            if (!claim())
                return;
            if (bridgeCallbacks && bridgeRequestId) {
                bridgeCallbacks.sendResponse(bridgeRequestId, {
                    behavior: 'deny',
                    message: feedback !== null && feedback !== void 0 ? feedback : 'User denied permission',
                });
                bridgeCallbacks.cancelRequest(bridgeRequestId);
            }
            channelUnsubscribe === null || channelUnsubscribe === void 0 ? void 0 : channelUnsubscribe();
            ctx.logDecision({
                decision: 'reject',
                source: { type: 'user_reject', hasFeedback: !!feedback },
            }, { permissionPromptStartTimeMs: permissionPromptStartTimeMs });
            resolveOnce(ctx.cancelAndAbort(feedback, undefined, contentBlocks));
        }, recheckPermission: function () {
            return __awaiter(this, void 0, void 0, function () {
                var freshResult;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (isResolved())
                                return [2 /*return*/];
                            return [4 /*yield*/, (0, permissions_js_1.hasPermissionsToUseTool)(ctx.tool, ctx.input, ctx.toolUseContext, ctx.assistantMessage, ctx.toolUseID)];
                        case 1:
                            freshResult = _b.sent();
                            if (freshResult.behavior === 'allow') {
                                // claim() (atomic check-and-mark), not isResolved() — the async
                                // hasPermissionsToUseTool call above opens a window where CCR
                                // could have responded in flight. Matches onAllow/onReject/hook
                                // paths. cancelRequest tells CCR to dismiss its prompt — without
                                // it, the web UI shows a stale prompt for a tool that's already
                                // executing (particularly visible when recheck is triggered by
                                // a CCR-initiated mode switch, the very case this callback exists
                                // for after useReplBridge started calling it).
                                if (!claim())
                                    return [2 /*return*/];
                                if (bridgeCallbacks && bridgeRequestId) {
                                    bridgeCallbacks.cancelRequest(bridgeRequestId);
                                }
                                channelUnsubscribe === null || channelUnsubscribe === void 0 ? void 0 : channelUnsubscribe();
                                ctx.removeFromQueue();
                                ctx.logDecision({ decision: 'accept', source: 'config' });
                                resolveOnce(ctx.buildAllow((_a = freshResult.updatedInput) !== null && _a !== void 0 ? _a : ctx.input));
                            }
                            return [2 /*return*/];
                    }
                });
            });
        } }));
    // Race 4: Bridge permission response from CCR (claude.ai)
    // When the bridge is connected, send the permission request to CCR and
    // subscribe for a response. Whichever side (CLI or CCR) responds first
    // wins via claim().
    //
    // All tools are forwarded — CCR's generic allow/deny modal handles any
    // tool, and can return `updatedInput` when it has a dedicated renderer
    // (e.g. plan edit). Tools whose local dialog injects fields (ReviewArtifact
    // `selected`, AskUserQuestion `answers`) tolerate the field being missing
    // so generic remote approval degrades gracefully instead of throwing.
    if (bridgeCallbacks && bridgeRequestId) {
        bridgeCallbacks.sendRequest(bridgeRequestId, ctx.tool.name, displayInput, ctx.toolUseID, description, result.suggestions, result.blockedPath);
        var signal_1 = ctx.toolUseContext.abortController.signal;
        var unsubscribe_1 = bridgeCallbacks.onResponse(bridgeRequestId, function (response) {
            var _a, _b, _c;
            if (!claim())
                return; // Local user/hook/classifier already responded
            signal_1.removeEventListener('abort', unsubscribe_1);
            (0, classifierApprovals_js_1.clearClassifierChecking)(ctx.toolUseID);
            clearClassifierIndicator();
            ctx.removeFromQueue();
            channelUnsubscribe === null || channelUnsubscribe === void 0 ? void 0 : channelUnsubscribe();
            if (response.behavior === 'allow') {
                if ((_a = response.updatedPermissions) === null || _a === void 0 ? void 0 : _a.length) {
                    void ctx.persistPermissions(response.updatedPermissions);
                }
                ctx.logDecision({
                    decision: 'accept',
                    source: {
                        type: 'user',
                        permanent: !!((_b = response.updatedPermissions) === null || _b === void 0 ? void 0 : _b.length),
                    },
                }, { permissionPromptStartTimeMs: permissionPromptStartTimeMs });
                resolveOnce(ctx.buildAllow((_c = response.updatedInput) !== null && _c !== void 0 ? _c : displayInput));
            }
            else {
                ctx.logDecision({
                    decision: 'reject',
                    source: {
                        type: 'user_reject',
                        hasFeedback: !!response.message,
                    },
                }, { permissionPromptStartTimeMs: permissionPromptStartTimeMs });
                resolveOnce(ctx.cancelAndAbort(response.message));
            }
        });
        signal_1.addEventListener('abort', unsubscribe_1, { once: true });
    }
    // Channel permission relay — races alongside the bridge block above. Send a
    // permission prompt to every active channel (Telegram, iMessage, etc.) via
    // its MCP send_message tool, then race the reply against local/bridge/hook/
    // classifier. The inbound "yes abc123" is intercepted in the notification
    // handler (useManageMCPConnections.ts) BEFORE enqueue, so it never reaches
    // Claude as a conversation turn.
    //
    // Unlike the bridge block, this still guards on `requiresUserInteraction` —
    // channel replies are pure yes/no with no `updatedInput` path. In practice
    // the guard is dead code today: all three `requiresUserInteraction` tools
    // (ExitPlanMode, AskUserQuestion, ReviewArtifact) return `isEnabled()===false`
    // when channels are configured, so they never reach this handler.
    //
    // Fire-and-forget send: if callTool fails (channel down, tool missing),
    // the subscription never fires and another racer wins. Graceful degradation
    // — the local dialog is always there as the floor.
    if (((0, bun_bundle_1.feature)('KAIROS') || (0, bun_bundle_1.feature)('KAIROS_CHANNELS')) &&
        channelCallbacks &&
        !((_c = (_b = ctx.tool).requiresUserInteraction) === null || _c === void 0 ? void 0 : _c.call(_b))) {
        var channelRequestId = (0, channelPermissions_js_1.shortRequestId)(ctx.toolUseID);
        var allowedChannels_1 = (0, state_js_1.getAllowedChannels)();
        var channelClients = (0, channelPermissions_js_1.filterPermissionRelayClients)(ctx.toolUseContext.getAppState().mcp.clients, function (name) { return (0, channelNotification_js_1.findChannelEntry)(name, allowedChannels_1) !== undefined; });
        if (channelClients.length > 0) {
            // Outbound is structured too (Kenneth's symmetry ask) — server owns
            // message formatting for its platform (Telegram markdown, iMessage
            // rich text, Discord embed). CC sends the RAW parts; server composes.
            // The old callTool('send_message', {text,content,message}) triple-key
            // hack is gone — no more guessing which arg name each plugin takes.
            var params_1 = {
                request_id: channelRequestId,
                tool_name: ctx.tool.name,
                description: description,
                input_preview: (0, channelPermissions_js_1.truncateForPreview)(displayInput),
            };
            var _loop_1 = function (client) {
                if (client.type !== 'connected')
                    return "continue"; // refine for TS
                void client.client
                    .notification({
                    method: channelNotification_js_1.CHANNEL_PERMISSION_REQUEST_METHOD,
                    params: params_1,
                })
                    .catch(function (e) {
                    (0, debug_js_1.logForDebugging)("Channel permission_request failed for ".concat(client.name, ": ").concat((0, errors_js_1.errorMessage)(e)), { level: 'error' });
                });
            };
            for (var _i = 0, channelClients_1 = channelClients; _i < channelClients_1.length; _i++) {
                var client = channelClients_1[_i];
                _loop_1(client);
            }
            var channelSignal_1 = ctx.toolUseContext.abortController.signal;
            // Wrap so BOTH the map delete AND the abort-listener teardown happen
            // at every call site. The 6 channelUnsubscribe?.() sites after local/
            // hook/classifier wins previously only deleted the map entry — the
            // dead closure stayed registered on the session-scoped abort signal
            // until the session ended. Not a functional bug (Map.delete is
            // idempotent), but it held the closure alive.
            var mapUnsub_1 = channelCallbacks.onResponse(channelRequestId, function (response) {
                if (!claim())
                    return; // Another racer won
                channelUnsubscribe === null || channelUnsubscribe === void 0 ? void 0 : channelUnsubscribe(); // both: map delete + listener remove
                (0, classifierApprovals_js_1.clearClassifierChecking)(ctx.toolUseID);
                clearClassifierIndicator();
                ctx.removeFromQueue();
                // Bridge is the other remote — tell it we're done.
                if (bridgeCallbacks && bridgeRequestId) {
                    bridgeCallbacks.cancelRequest(bridgeRequestId);
                }
                if (response.behavior === 'allow') {
                    ctx.logDecision({
                        decision: 'accept',
                        source: { type: 'user', permanent: false },
                    }, { permissionPromptStartTimeMs: permissionPromptStartTimeMs });
                    resolveOnce(ctx.buildAllow(displayInput));
                }
                else {
                    ctx.logDecision({
                        decision: 'reject',
                        source: { type: 'user_reject', hasFeedback: false },
                    }, { permissionPromptStartTimeMs: permissionPromptStartTimeMs });
                    resolveOnce(ctx.cancelAndAbort("Denied via channel ".concat(response.fromServer)));
                }
            });
            channelUnsubscribe = function () {
                mapUnsub_1();
                channelSignal_1.removeEventListener('abort', channelUnsubscribe);
            };
            channelSignal_1.addEventListener('abort', channelUnsubscribe, {
                once: true,
            });
        }
    }
    // Skip hooks if they were already awaited in the coordinator branch above
    if (!awaitAutomatedChecksBeforeDialog) {
        // Execute PermissionRequest hooks asynchronously
        // If hook returns a decision before user responds, apply it
        void (function () { return __awaiter(_this, void 0, void 0, function () {
            var currentAppState, hookDecision;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (isResolved())
                            return [2 /*return*/];
                        currentAppState = ctx.toolUseContext.getAppState();
                        return [4 /*yield*/, ctx.runHooks(currentAppState.toolPermissionContext.mode, result.suggestions, result.updatedInput, permissionPromptStartTimeMs)];
                    case 1:
                        hookDecision = _a.sent();
                        if (!hookDecision || !claim())
                            return [2 /*return*/];
                        if (bridgeCallbacks && bridgeRequestId) {
                            bridgeCallbacks.cancelRequest(bridgeRequestId);
                        }
                        channelUnsubscribe === null || channelUnsubscribe === void 0 ? void 0 : channelUnsubscribe();
                        ctx.removeFromQueue();
                        resolveOnce(hookDecision);
                        return [2 /*return*/];
                }
            });
        }); })();
    }
    // Execute bash classifier check asynchronously (if applicable)
    if ((0, bun_bundle_1.feature)('BASH_CLASSIFIER') &&
        result.pendingClassifierCheck &&
        ctx.tool.name === toolName_js_1.BASH_TOOL_NAME &&
        !awaitAutomatedChecksBeforeDialog) {
        // UI indicator for "classifier running" — set here (not in
        // toolExecution.ts) so commands that auto-allow via prefix rules
        // don't flash the indicator for a split second before allow returns.
        (0, classifierApprovals_js_1.setClassifierChecking)(ctx.toolUseID);
        void (0, bashPermissions_js_1.executeAsyncClassifierCheck)(result.pendingClassifierCheck, ctx.toolUseContext.abortController.signal, ctx.toolUseContext.options.isNonInteractiveSession, {
            shouldContinue: function () { return !isResolved() && !userInteracted; },
            onComplete: function () {
                (0, classifierApprovals_js_1.clearClassifierChecking)(ctx.toolUseID);
                clearClassifierIndicator();
            },
            onAllow: function (decisionReason) {
                var _a, _b;
                if (!claim())
                    return;
                if (bridgeCallbacks && bridgeRequestId) {
                    bridgeCallbacks.cancelRequest(bridgeRequestId);
                }
                channelUnsubscribe === null || channelUnsubscribe === void 0 ? void 0 : channelUnsubscribe();
                (0, classifierApprovals_js_1.clearClassifierChecking)(ctx.toolUseID);
                var matchedRule = decisionReason.type === 'classifier'
                    ? ((_b = (_a = decisionReason.reason.match(/^Allowed by prompt rule: "(.+)"$/)) === null || _a === void 0 ? void 0 : _a[1]) !== null && _b !== void 0 ? _b : decisionReason.reason)
                    : undefined;
                // Show auto-approved transition with dimmed options
                if ((0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER')) {
                    ctx.updateQueueItem({
                        classifierCheckInProgress: false,
                        classifierAutoApproved: true,
                        classifierMatchedRule: matchedRule,
                    });
                }
                if ((0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER') &&
                    decisionReason.type === 'classifier') {
                    if (decisionReason.classifier === 'auto-mode') {
                        (0, classifierApprovals_js_1.setYoloClassifierApproval)(ctx.toolUseID, decisionReason.reason);
                    }
                    else if (matchedRule) {
                        (0, classifierApprovals_js_1.setClassifierApproval)(ctx.toolUseID, matchedRule);
                    }
                }
                ctx.logDecision({ decision: 'accept', source: { type: 'classifier' } }, { permissionPromptStartTimeMs: permissionPromptStartTimeMs });
                resolveOnce(ctx.buildAllow(ctx.input, { decisionReason: decisionReason }));
                // Keep checkmark visible, then remove dialog.
                // 3s if terminal is focused (user can see it), 1s if not.
                // User can dismiss early with Esc via onDismissCheckmark.
                var signal = ctx.toolUseContext.abortController.signal;
                checkmarkAbortHandler = function () {
                    if (checkmarkTransitionTimer) {
                        clearTimeout(checkmarkTransitionTimer);
                        checkmarkTransitionTimer = undefined;
                        // Sibling Bash error can fire this (StreamingToolExecutor
                        // cascades via siblingAbortController) — must drop the
                        // cosmetic ✓ dialog or it blocks the next queued item.
                        ctx.removeFromQueue();
                    }
                };
                var checkmarkMs = (0, terminal_focus_state_js_1.getTerminalFocused)() ? 3000 : 1000;
                checkmarkTransitionTimer = setTimeout(function () {
                    checkmarkTransitionTimer = undefined;
                    if (checkmarkAbortHandler) {
                        signal.removeEventListener('abort', checkmarkAbortHandler);
                        checkmarkAbortHandler = undefined;
                    }
                    ctx.removeFromQueue();
                }, checkmarkMs);
                signal.addEventListener('abort', checkmarkAbortHandler, {
                    once: true,
                });
            },
        }).catch(function (error) {
            // Log classifier API errors for debugging but don't propagate them as interruptions
            // These errors can be network failures, rate limits, or model issues - not user cancellations
            (0, debug_js_1.logForDebugging)("Async classifier check failed: ".concat((0, errors_js_1.errorMessage)(error)), {
                level: 'error',
            });
        });
    }
}
