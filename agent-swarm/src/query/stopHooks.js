"use strict";
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
exports.handleStopHooks = handleStopHooks;
var bun_bundle_1 = require("bun:bundle");
var shortcutFormat_js_1 = require("../keybindings/shortcutFormat.js");
var paths_js_1 = require("../memdir/paths.js");
var index_js_1 = require("../services/analytics/index.js");
var attachments_js_1 = require("../utils/attachments.js");
var debug_js_1 = require("../utils/debug.js");
var errors_js_1 = require("../utils/errors.js");
var hooks_js_1 = require("../utils/hooks.js");
var messages_js_1 = require("../utils/messages.js");
var tasks_js_1 = require("../utils/tasks.js");
var teammate_js_1 = require("../utils/teammate.js");
/* eslint-disable @typescript-eslint/no-require-imports */
var extractMemoriesModule = (0, bun_bundle_1.feature)('EXTRACT_MEMORIES')
    ? require('../services/extractMemories/extractMemories.js')
    : null;
var jobClassifierModule = (0, bun_bundle_1.feature)('TEMPLATES')
    ? require('../jobs/classifier.js')
    : null;
var autoDream_js_1 = require("../services/autoDream/autoDream.js");
var promptSuggestion_js_1 = require("../services/PromptSuggestion/promptSuggestion.js");
var envUtils_js_1 = require("../utils/envUtils.js");
var forkedAgent_js_1 = require("../utils/forkedAgent.js");
function handleStopHooks(messagesForQuery, assistantMessages, systemPrompt, userContext, systemContext, toolUseContext, querySource, stopHookActive) {
    return __asyncGenerator(this, arguments, function handleStopHooks_1() {
        var hookStartTime, stopHookContext, turnAssistantMessages, p, cleanupComputerUseAfterTurn, _a, blockingErrors, appState, permissionMode, generator, stopHookToolUseID, hookCount, preventedContinuation, stopReason, hasOutput, hookErrors, hookInfos, _loop_1, _b, generator_1, generator_1_1, state_1, e_1_1, expandShortcut, teammateName_1, teamName, teammateBlockingErrors, teammatePreventedContinuation, teammateStopReason, teammateHookToolUseID, taskListId, tasks, inProgressTasks, _i, inProgressTasks_1, task, taskCompletedGenerator, _c, taskCompletedGenerator_1, taskCompletedGenerator_1_1, result, userMessage, e_2_1, teammateIdleGenerator, _d, teammateIdleGenerator_1, teammateIdleGenerator_1_1, result, userMessage, e_3_1, error_1, durationMs;
        var _e, e_1, _f, _g, _h, e_2, _j, _k, _l, e_3, _m, _o;
        var _p, _q, _r, _s, _t, _u, _v;
        return __generator(this, function (_w) {
            switch (_w.label) {
                case 0:
                    hookStartTime = Date.now();
                    stopHookContext = {
                        messages: __spreadArray(__spreadArray([], messagesForQuery, true), assistantMessages, true),
                        systemPrompt: systemPrompt,
                        userContext: userContext,
                        systemContext: systemContext,
                        toolUseContext: toolUseContext,
                        querySource: querySource,
                    };
                    // Only save params for main session queries — subagents must not overwrite.
                    // Outside the prompt-suggestion gate: the REPL /btw command and the
                    // side_question SDK control_request both read this snapshot, and neither
                    // depends on prompt suggestions being enabled.
                    if (querySource === 'repl_main_thread' || querySource === 'sdk') {
                        (0, forkedAgent_js_1.saveCacheSafeParams)((0, forkedAgent_js_1.createCacheSafeParams)(stopHookContext));
                    }
                    if (!((0, bun_bundle_1.feature)('TEMPLATES') &&
                        process.env.CLAUDE_JOB_DIR &&
                        querySource.startsWith('repl_main_thread') &&
                        !toolUseContext.agentId)) return [3 /*break*/, 2];
                    turnAssistantMessages = stopHookContext.messages.filter(function (m) { return m.type === 'assistant'; });
                    p = jobClassifierModule
                        .classifyAndWriteState(process.env.CLAUDE_JOB_DIR, turnAssistantMessages)
                        .catch(function (err) {
                        (0, debug_js_1.logForDebugging)("[job] classifier error: ".concat((0, errors_js_1.errorMessage)(err)), {
                            level: 'error',
                        });
                    });
                    return [4 /*yield*/, __await(Promise.race([
                            p,
                            // eslint-disable-next-line no-restricted-syntax -- sleep() has no .unref(); timer must not block exit
                            new Promise(function (r) { return setTimeout(r, 60000).unref(); }),
                        ]))];
                case 1:
                    _w.sent();
                    _w.label = 2;
                case 2:
                    // --bare / SIMPLE: skip background bookkeeping (prompt suggestion,
                    // memory extraction, auto-dream). Scripted -p calls don't want auto-memory
                    // or forked agents contending for resources during shutdown.
                    if (!(0, envUtils_js_1.isBareMode)()) {
                        // Inline env check for dead code elimination in external builds
                        if (!(0, envUtils_js_1.isEnvDefinedFalsy)(process.env.CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION)) {
                            void (0, promptSuggestion_js_1.executePromptSuggestion)(stopHookContext);
                        }
                        if ((0, bun_bundle_1.feature)('EXTRACT_MEMORIES') &&
                            !toolUseContext.agentId &&
                            (0, paths_js_1.isExtractModeActive)()) {
                            // Fire-and-forget in both interactive and non-interactive. For -p/SDK,
                            // print.ts drains the in-flight promise after flushing the response
                            // but before gracefulShutdownSync (see drainPendingExtraction).
                            void extractMemoriesModule.executeExtractMemories(stopHookContext, toolUseContext.appendSystemMessage);
                        }
                        if (!toolUseContext.agentId) {
                            void (0, autoDream_js_1.executeAutoDream)(stopHookContext, toolUseContext.appendSystemMessage);
                        }
                    }
                    if (!((0, bun_bundle_1.feature)('CHICAGO_MCP') && !toolUseContext.agentId)) return [3 /*break*/, 7];
                    _w.label = 3;
                case 3:
                    _w.trys.push([3, 6, , 7]);
                    return [4 /*yield*/, __await(Promise.resolve().then(function () { return require('../utils/computerUse/cleanup.js'); }))];
                case 4:
                    cleanupComputerUseAfterTurn = (_w.sent()).cleanupComputerUseAfterTurn;
                    return [4 /*yield*/, __await(cleanupComputerUseAfterTurn(toolUseContext))];
                case 5:
                    _w.sent();
                    return [3 /*break*/, 7];
                case 6:
                    _a = _w.sent();
                    return [3 /*break*/, 7];
                case 7:
                    _w.trys.push([7, 80, , 84]);
                    blockingErrors = [];
                    appState = toolUseContext.getAppState();
                    permissionMode = appState.toolPermissionContext.mode;
                    generator = (0, hooks_js_1.executeStopHooks)(permissionMode, toolUseContext.abortController.signal, undefined, stopHookActive !== null && stopHookActive !== void 0 ? stopHookActive : false, toolUseContext.agentId, toolUseContext, __spreadArray(__spreadArray([], messagesForQuery, true), assistantMessages, true), toolUseContext.agentType);
                    stopHookToolUseID = '';
                    hookCount = 0;
                    preventedContinuation = false;
                    stopReason = '';
                    hasOutput = false;
                    hookErrors = [];
                    hookInfos = [];
                    _w.label = 8;
                case 8:
                    _w.trys.push([8, 14, 15, 20]);
                    _loop_1 = function () {
                        var result, progressData, attachment_1, info, userMessage, _x;
                        return __generator(this, function (_y) {
                            switch (_y.label) {
                                case 0:
                                    _g = generator_1_1.value;
                                    _b = false;
                                    result = _g;
                                    if (!result.message) return [3 /*break*/, 3];
                                    return [4 /*yield*/, __await(result.message
                                        // Track toolUseID from progress messages and count hooks
                                        )];
                                case 1: return [4 /*yield*/, _y.sent()];
                                case 2:
                                    _y.sent();
                                    // Track toolUseID from progress messages and count hooks
                                    if (result.message.type === 'progress' && result.message.toolUseID) {
                                        stopHookToolUseID = result.message.toolUseID;
                                        hookCount++;
                                        progressData = result.message.data;
                                        if (progressData.command) {
                                            hookInfos.push({
                                                command: progressData.command,
                                                promptText: progressData.promptText,
                                            });
                                        }
                                    }
                                    // Track errors and output from attachments
                                    if (result.message.type === 'attachment') {
                                        attachment_1 = result.message.attachment;
                                        if ('hookEvent' in attachment_1 &&
                                            (attachment_1.hookEvent === 'Stop' ||
                                                attachment_1.hookEvent === 'SubagentStop')) {
                                            if (attachment_1.type === 'hook_non_blocking_error') {
                                                hookErrors.push(attachment_1.stderr || "Exit code ".concat(attachment_1.exitCode));
                                                // Non-blocking errors always have output
                                                hasOutput = true;
                                            }
                                            else if (attachment_1.type === 'hook_error_during_execution') {
                                                hookErrors.push(attachment_1.content);
                                                hasOutput = true;
                                            }
                                            else if (attachment_1.type === 'hook_success') {
                                                // Check if successful hook produced any stdout/stderr
                                                if ((attachment_1.stdout && attachment_1.stdout.trim()) ||
                                                    (attachment_1.stderr && attachment_1.stderr.trim())) {
                                                    hasOutput = true;
                                                }
                                            }
                                            // Extract per-hook duration for timing visibility.
                                            // Hooks run in parallel; match by command + first unassigned entry.
                                            if ('durationMs' in attachment_1 && 'command' in attachment_1) {
                                                info = hookInfos.find(function (i) {
                                                    return i.command === attachment_1.command &&
                                                        i.durationMs === undefined;
                                                });
                                                if (info) {
                                                    info.durationMs = attachment_1.durationMs;
                                                }
                                            }
                                        }
                                    }
                                    _y.label = 3;
                                case 3:
                                    if (!result.blockingError) return [3 /*break*/, 6];
                                    userMessage = (0, messages_js_1.createUserMessage)({
                                        content: (0, hooks_js_1.getStopHookMessage)(result.blockingError),
                                        isMeta: true, // Hide from UI (shown in summary message instead)
                                    });
                                    blockingErrors.push(userMessage);
                                    return [4 /*yield*/, __await(userMessage)];
                                case 4: return [4 /*yield*/, _y.sent()];
                                case 5:
                                    _y.sent();
                                    hasOutput = true;
                                    // Add to hookErrors so it appears in the summary
                                    hookErrors.push(result.blockingError.blockingError);
                                    _y.label = 6;
                                case 6:
                                    if (!result.preventContinuation) return [3 /*break*/, 9];
                                    preventedContinuation = true;
                                    stopReason = result.stopReason || 'Stop hook prevented continuation';
                                    return [4 /*yield*/, __await((0, attachments_js_1.createAttachmentMessage)({
                                            type: 'hook_stopped_continuation',
                                            message: stopReason,
                                            hookName: 'Stop',
                                            toolUseID: stopHookToolUseID,
                                            hookEvent: 'Stop',
                                        }))];
                                case 7: 
                                // Create attachment to track the stopped continuation (for structured data)
                                return [4 /*yield*/, _y.sent()];
                                case 8:
                                    // Create attachment to track the stopped continuation (for structured data)
                                    _y.sent();
                                    _y.label = 9;
                                case 9:
                                    if (!toolUseContext.abortController.signal.aborted) return [3 /*break*/, 13];
                                    (0, index_js_1.logEvent)('tengu_pre_stop_hooks_cancelled', {
                                        queryChainId: (_p = toolUseContext.queryTracking) === null || _p === void 0 ? void 0 : _p.chainId,
                                        queryDepth: (_q = toolUseContext.queryTracking) === null || _q === void 0 ? void 0 : _q.depth,
                                    });
                                    return [4 /*yield*/, __await((0, messages_js_1.createUserInterruptionMessage)({
                                            toolUse: false,
                                        }))];
                                case 10: return [4 /*yield*/, _y.sent()];
                                case 11:
                                    _y.sent();
                                    _x = {};
                                    return [4 /*yield*/, __await({ blockingErrors: [], preventContinuation: true })];
                                case 12: return [2 /*return*/, (_x.value = _y.sent(), _x)];
                                case 13: return [2 /*return*/];
                            }
                        });
                    };
                    _b = true, generator_1 = __asyncValues(generator);
                    _w.label = 9;
                case 9: return [4 /*yield*/, __await(generator_1.next())];
                case 10:
                    if (!(generator_1_1 = _w.sent(), _e = generator_1_1.done, !_e)) return [3 /*break*/, 13];
                    return [5 /*yield**/, _loop_1()];
                case 11:
                    state_1 = _w.sent();
                    if (typeof state_1 === "object")
                        return [2 /*return*/, state_1.value];
                    _w.label = 12;
                case 12:
                    _b = true;
                    return [3 /*break*/, 9];
                case 13: return [3 /*break*/, 20];
                case 14:
                    e_1_1 = _w.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 20];
                case 15:
                    _w.trys.push([15, , 18, 19]);
                    if (!(!_b && !_e && (_f = generator_1.return))) return [3 /*break*/, 17];
                    return [4 /*yield*/, __await(_f.call(generator_1))];
                case 16:
                    _w.sent();
                    _w.label = 17;
                case 17: return [3 /*break*/, 19];
                case 18:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 19: return [7 /*endfinally*/];
                case 20:
                    if (!(hookCount > 0)) return [3 /*break*/, 23];
                    return [4 /*yield*/, __await((0, messages_js_1.createStopHookSummaryMessage)(hookCount, hookInfos, hookErrors, preventedContinuation, stopReason, hasOutput, 'suggestion', stopHookToolUseID)
                        // Send notification about errors (shown in verbose/transcript mode via ctrl+o)
                        )];
                case 21: return [4 /*yield*/, _w.sent()];
                case 22:
                    _w.sent();
                    // Send notification about errors (shown in verbose/transcript mode via ctrl+o)
                    if (hookErrors.length > 0) {
                        expandShortcut = (0, shortcutFormat_js_1.getShortcutDisplay)('app:toggleTranscript', 'Global', 'ctrl+o');
                        (_r = toolUseContext.addNotification) === null || _r === void 0 ? void 0 : _r.call(toolUseContext, {
                            key: 'stop-hook-error',
                            text: "Stop hook error occurred \u00B7 ".concat(expandShortcut, " to see"),
                            priority: 'immediate',
                        });
                    }
                    _w.label = 23;
                case 23:
                    if (!preventedContinuation) return [3 /*break*/, 25];
                    return [4 /*yield*/, __await({ blockingErrors: [], preventContinuation: true })];
                case 24: return [2 /*return*/, _w.sent()];
                case 25:
                    if (!(blockingErrors.length > 0)) return [3 /*break*/, 27];
                    return [4 /*yield*/, __await({ blockingErrors: blockingErrors, preventContinuation: false })];
                case 26: return [2 /*return*/, _w.sent()];
                case 27:
                    if (!(0, teammate_js_1.isTeammate)()) return [3 /*break*/, 78];
                    teammateName_1 = (_s = (0, teammate_js_1.getAgentName)()) !== null && _s !== void 0 ? _s : '';
                    teamName = (_t = (0, teammate_js_1.getTeamName)()) !== null && _t !== void 0 ? _t : '';
                    teammateBlockingErrors = [];
                    teammatePreventedContinuation = false;
                    teammateStopReason = void 0;
                    teammateHookToolUseID = '';
                    taskListId = (0, tasks_js_1.getTaskListId)();
                    return [4 /*yield*/, __await((0, tasks_js_1.listTasks)(taskListId))];
                case 28:
                    tasks = _w.sent();
                    inProgressTasks = tasks.filter(function (t) { return t.status === 'in_progress' && t.owner === teammateName_1; });
                    _i = 0, inProgressTasks_1 = inProgressTasks;
                    _w.label = 29;
                case 29:
                    if (!(_i < inProgressTasks_1.length)) return [3 /*break*/, 52];
                    task = inProgressTasks_1[_i];
                    taskCompletedGenerator = (0, hooks_js_1.executeTaskCompletedHooks)(task.id, task.subject, task.description, teammateName_1, teamName, permissionMode, toolUseContext.abortController.signal, undefined, toolUseContext);
                    _w.label = 30;
                case 30:
                    _w.trys.push([30, 45, 46, 51]);
                    _c = true, taskCompletedGenerator_1 = (e_2 = void 0, __asyncValues(taskCompletedGenerator));
                    _w.label = 31;
                case 31: return [4 /*yield*/, __await(taskCompletedGenerator_1.next())];
                case 32:
                    if (!(taskCompletedGenerator_1_1 = _w.sent(), _h = taskCompletedGenerator_1_1.done, !_h)) return [3 /*break*/, 44];
                    _k = taskCompletedGenerator_1_1.value;
                    _c = false;
                    result = _k;
                    if (!result.message) return [3 /*break*/, 35];
                    if (result.message.type === 'progress' &&
                        result.message.toolUseID) {
                        teammateHookToolUseID = result.message.toolUseID;
                    }
                    return [4 /*yield*/, __await(result.message)];
                case 33: return [4 /*yield*/, _w.sent()];
                case 34:
                    _w.sent();
                    _w.label = 35;
                case 35:
                    if (!result.blockingError) return [3 /*break*/, 38];
                    userMessage = (0, messages_js_1.createUserMessage)({
                        content: (0, hooks_js_1.getTaskCompletedHookMessage)(result.blockingError),
                        isMeta: true,
                    });
                    teammateBlockingErrors.push(userMessage);
                    return [4 /*yield*/, __await(userMessage)];
                case 36: return [4 /*yield*/, _w.sent()];
                case 37:
                    _w.sent();
                    _w.label = 38;
                case 38:
                    if (!result.preventContinuation) return [3 /*break*/, 41];
                    teammatePreventedContinuation = true;
                    teammateStopReason =
                        result.stopReason || 'TaskCompleted hook prevented continuation';
                    return [4 /*yield*/, __await((0, attachments_js_1.createAttachmentMessage)({
                            type: 'hook_stopped_continuation',
                            message: teammateStopReason,
                            hookName: 'TaskCompleted',
                            toolUseID: teammateHookToolUseID,
                            hookEvent: 'TaskCompleted',
                        }))];
                case 39: return [4 /*yield*/, _w.sent()];
                case 40:
                    _w.sent();
                    _w.label = 41;
                case 41:
                    if (!toolUseContext.abortController.signal.aborted) return [3 /*break*/, 43];
                    return [4 /*yield*/, __await({ blockingErrors: [], preventContinuation: true })];
                case 42: return [2 /*return*/, _w.sent()];
                case 43:
                    _c = true;
                    return [3 /*break*/, 31];
                case 44: return [3 /*break*/, 51];
                case 45:
                    e_2_1 = _w.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 51];
                case 46:
                    _w.trys.push([46, , 49, 50]);
                    if (!(!_c && !_h && (_j = taskCompletedGenerator_1.return))) return [3 /*break*/, 48];
                    return [4 /*yield*/, __await(_j.call(taskCompletedGenerator_1))];
                case 47:
                    _w.sent();
                    _w.label = 48;
                case 48: return [3 /*break*/, 50];
                case 49:
                    if (e_2) throw e_2.error;
                    return [7 /*endfinally*/];
                case 50: return [7 /*endfinally*/];
                case 51:
                    _i++;
                    return [3 /*break*/, 29];
                case 52:
                    teammateIdleGenerator = (0, hooks_js_1.executeTeammateIdleHooks)(teammateName_1, teamName, permissionMode, toolUseContext.abortController.signal);
                    _w.label = 53;
                case 53:
                    _w.trys.push([53, 68, 69, 74]);
                    _d = true, teammateIdleGenerator_1 = __asyncValues(teammateIdleGenerator);
                    _w.label = 54;
                case 54: return [4 /*yield*/, __await(teammateIdleGenerator_1.next())];
                case 55:
                    if (!(teammateIdleGenerator_1_1 = _w.sent(), _l = teammateIdleGenerator_1_1.done, !_l)) return [3 /*break*/, 67];
                    _o = teammateIdleGenerator_1_1.value;
                    _d = false;
                    result = _o;
                    if (!result.message) return [3 /*break*/, 58];
                    if (result.message.type === 'progress' && result.message.toolUseID) {
                        teammateHookToolUseID = result.message.toolUseID;
                    }
                    return [4 /*yield*/, __await(result.message)];
                case 56: return [4 /*yield*/, _w.sent()];
                case 57:
                    _w.sent();
                    _w.label = 58;
                case 58:
                    if (!result.blockingError) return [3 /*break*/, 61];
                    userMessage = (0, messages_js_1.createUserMessage)({
                        content: (0, hooks_js_1.getTeammateIdleHookMessage)(result.blockingError),
                        isMeta: true,
                    });
                    teammateBlockingErrors.push(userMessage);
                    return [4 /*yield*/, __await(userMessage)];
                case 59: return [4 /*yield*/, _w.sent()];
                case 60:
                    _w.sent();
                    _w.label = 61;
                case 61:
                    if (!result.preventContinuation) return [3 /*break*/, 64];
                    teammatePreventedContinuation = true;
                    teammateStopReason =
                        result.stopReason || 'TeammateIdle hook prevented continuation';
                    return [4 /*yield*/, __await((0, attachments_js_1.createAttachmentMessage)({
                            type: 'hook_stopped_continuation',
                            message: teammateStopReason,
                            hookName: 'TeammateIdle',
                            toolUseID: teammateHookToolUseID,
                            hookEvent: 'TeammateIdle',
                        }))];
                case 62: return [4 /*yield*/, _w.sent()];
                case 63:
                    _w.sent();
                    _w.label = 64;
                case 64:
                    if (!toolUseContext.abortController.signal.aborted) return [3 /*break*/, 66];
                    return [4 /*yield*/, __await({ blockingErrors: [], preventContinuation: true })];
                case 65: return [2 /*return*/, _w.sent()];
                case 66:
                    _d = true;
                    return [3 /*break*/, 54];
                case 67: return [3 /*break*/, 74];
                case 68:
                    e_3_1 = _w.sent();
                    e_3 = { error: e_3_1 };
                    return [3 /*break*/, 74];
                case 69:
                    _w.trys.push([69, , 72, 73]);
                    if (!(!_d && !_l && (_m = teammateIdleGenerator_1.return))) return [3 /*break*/, 71];
                    return [4 /*yield*/, __await(_m.call(teammateIdleGenerator_1))];
                case 70:
                    _w.sent();
                    _w.label = 71;
                case 71: return [3 /*break*/, 73];
                case 72:
                    if (e_3) throw e_3.error;
                    return [7 /*endfinally*/];
                case 73: return [7 /*endfinally*/];
                case 74:
                    if (!teammatePreventedContinuation) return [3 /*break*/, 76];
                    return [4 /*yield*/, __await({ blockingErrors: [], preventContinuation: true })];
                case 75: return [2 /*return*/, _w.sent()];
                case 76:
                    if (!(teammateBlockingErrors.length > 0)) return [3 /*break*/, 78];
                    return [4 /*yield*/, __await({
                            blockingErrors: teammateBlockingErrors,
                            preventContinuation: false,
                        })];
                case 77: return [2 /*return*/, _w.sent()];
                case 78: return [4 /*yield*/, __await({ blockingErrors: [], preventContinuation: false })];
                case 79: return [2 /*return*/, _w.sent()];
                case 80:
                    error_1 = _w.sent();
                    durationMs = Date.now() - hookStartTime;
                    (0, index_js_1.logEvent)('tengu_stop_hook_error', {
                        duration: durationMs,
                        queryChainId: (_u = toolUseContext.queryTracking) === null || _u === void 0 ? void 0 : _u.chainId,
                        queryDepth: (_v = toolUseContext.queryTracking) === null || _v === void 0 ? void 0 : _v.depth,
                    });
                    return [4 /*yield*/, __await((0, messages_js_1.createSystemMessage)("Stop hook failed: ".concat((0, errors_js_1.errorMessage)(error_1)), 'warning'))];
                case 81: 
                // Yield a system message that is not visible to the model for the user
                // to debug their hook.
                return [4 /*yield*/, _w.sent()];
                case 82:
                    // Yield a system message that is not visible to the model for the user
                    // to debug their hook.
                    _w.sent();
                    return [4 /*yield*/, __await({ blockingErrors: [], preventContinuation: false })];
                case 83: return [2 /*return*/, _w.sent()];
                case 84: return [2 /*return*/];
            }
        });
    });
}
