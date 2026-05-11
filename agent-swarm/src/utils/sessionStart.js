"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.takeInitialUserMessage = takeInitialUserMessage;
exports.processSessionStartHooks = processSessionStartHooks;
exports.processSetupHooks = processSetupHooks;
var state_js_1 = require("../bootstrap/state.js");
var attachments_js_1 = require("./attachments.js");
var debug_js_1 = require("./debug.js");
var diagLogs_js_1 = require("./diagLogs.js");
var envUtils_js_1 = require("./envUtils.js");
var fileChangedWatcher_js_1 = require("./hooks/fileChangedWatcher.js");
var hooksConfigSnapshot_js_1 = require("./hooks/hooksConfigSnapshot.js");
var hooks_js_1 = require("./hooks.js");
var log_js_1 = require("./log.js");
var loadPluginHooks_js_1 = require("./plugins/loadPluginHooks.js");
// Set by processSessionStartHooks when a hook emits initialUserMessage;
// consumed once by takeInitialUserMessage. This side channel avoids changing
// the Promise<HookResultMessage[]> return type that main.tsx and print.ts
// both already await on (sessionStartHooksPromise is kicked in main.tsx and
// joined later — rippling a structural return-type change through that
// handoff would touch five callsites for what is a print-mode-only value).
var pendingInitialUserMessage;
function takeInitialUserMessage() {
    var v = pendingInitialUserMessage;
    pendingInitialUserMessage = undefined;
    return v;
}
// Note to CLAUDE: do not add ANY "warmup" logic. It is **CRITICAL** that you do not add extra work on startup.
function processSessionStartHooks(source_1) {
    return __awaiter(this, arguments, void 0, function (source, _a) {
        var hookMessages, additionalContexts, allWatchPaths, error_1, enhancedError, errorMessage, userGuidance, resolvedAgentType, _b, _c, _d, hookResult, e_1_1, contextMessage;
        var _e, e_1, _f, _g;
        var _h = _a === void 0 ? {} : _a, sessionId = _h.sessionId, agentType = _h.agentType, model = _h.model, forceSyncExecution = _h.forceSyncExecution;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    // --bare skips all hooks. executeHooks already early-returns under --bare
                    // (hooks.ts:1861), but this skips the loadPluginHooks() await below too —
                    // no point loading plugin hooks that'll never run.
                    if ((0, envUtils_js_1.isBareMode)()) {
                        return [2 /*return*/, []];
                    }
                    hookMessages = [];
                    additionalContexts = [];
                    allWatchPaths = [];
                    if (!(0, hooksConfigSnapshot_js_1.shouldAllowManagedHooksOnly)()) return [3 /*break*/, 1];
                    (0, debug_js_1.logForDebugging)('Skipping plugin hooks - allowManagedHooksOnly is enabled');
                    return [3 /*break*/, 4];
                case 1:
                    _j.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, diagLogs_js_1.withDiagnosticsTiming)('load_plugin_hooks', function () { return (0, loadPluginHooks_js_1.loadPluginHooks)(); })];
                case 2:
                    _j.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _j.sent();
                    enhancedError = error_1 instanceof Error
                        ? new Error("Failed to load plugin hooks during ".concat(source, ": ").concat(error_1.message))
                        : new Error("Failed to load plugin hooks during ".concat(source, ": ").concat(String(error_1)));
                    /* eslint-enable no-restricted-syntax */
                    if (error_1 instanceof Error && error_1.stack) {
                        enhancedError.stack = error_1.stack;
                    }
                    (0, log_js_1.logError)(enhancedError);
                    errorMessage = error_1 instanceof Error ? error_1.message : String(error_1);
                    userGuidance = '';
                    if (errorMessage.includes('Failed to clone') ||
                        errorMessage.includes('network') ||
                        errorMessage.includes('ETIMEDOUT') ||
                        errorMessage.includes('ENOTFOUND')) {
                        userGuidance =
                            'This appears to be a network issue. Check your internet connection and try again.';
                    }
                    else if (errorMessage.includes('Permission denied') ||
                        errorMessage.includes('EACCES') ||
                        errorMessage.includes('EPERM')) {
                        userGuidance =
                            'This appears to be a permissions issue. Check file permissions on ~/.claude/plugins/';
                    }
                    else if (errorMessage.includes('Invalid') ||
                        errorMessage.includes('parse') ||
                        errorMessage.includes('JSON') ||
                        errorMessage.includes('schema')) {
                        userGuidance =
                            'This appears to be a configuration issue. Check your plugin settings in .claude/settings.json';
                    }
                    else {
                        userGuidance =
                            'Please fix the plugin configuration or remove problematic plugins from your settings.';
                    }
                    (0, debug_js_1.logForDebugging)("Warning: Failed to load plugin hooks. SessionStart hooks from plugins will not execute. " +
                        "Error: ".concat(errorMessage, ". ").concat(userGuidance), { level: 'warn' });
                    return [3 /*break*/, 4];
                case 4:
                    resolvedAgentType = agentType !== null && agentType !== void 0 ? agentType : (0, state_js_1.getMainThreadAgentType)();
                    _j.label = 5;
                case 5:
                    _j.trys.push([5, 10, 11, 16]);
                    _b = true, _c = __asyncValues((0, hooks_js_1.executeSessionStartHooks)(source, sessionId, resolvedAgentType, model, undefined, undefined, forceSyncExecution));
                    _j.label = 6;
                case 6: return [4 /*yield*/, _c.next()];
                case 7:
                    if (!(_d = _j.sent(), _e = _d.done, !_e)) return [3 /*break*/, 9];
                    _g = _d.value;
                    _b = false;
                    hookResult = _g;
                    if (hookResult.message) {
                        hookMessages.push(hookResult.message);
                    }
                    if (hookResult.additionalContexts &&
                        hookResult.additionalContexts.length > 0) {
                        additionalContexts.push.apply(additionalContexts, hookResult.additionalContexts);
                    }
                    if (hookResult.initialUserMessage) {
                        pendingInitialUserMessage = hookResult.initialUserMessage;
                    }
                    if (hookResult.watchPaths && hookResult.watchPaths.length > 0) {
                        allWatchPaths.push.apply(allWatchPaths, hookResult.watchPaths);
                    }
                    _j.label = 8;
                case 8:
                    _b = true;
                    return [3 /*break*/, 6];
                case 9: return [3 /*break*/, 16];
                case 10:
                    e_1_1 = _j.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 16];
                case 11:
                    _j.trys.push([11, , 14, 15]);
                    if (!(!_b && !_e && (_f = _c.return))) return [3 /*break*/, 13];
                    return [4 /*yield*/, _f.call(_c)];
                case 12:
                    _j.sent();
                    _j.label = 13;
                case 13: return [3 /*break*/, 15];
                case 14:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 15: return [7 /*endfinally*/];
                case 16:
                    if (allWatchPaths.length > 0) {
                        (0, fileChangedWatcher_js_1.updateWatchPaths)(allWatchPaths);
                    }
                    // If hooks provided additional context, add it as a message
                    if (additionalContexts.length > 0) {
                        contextMessage = (0, attachments_js_1.createAttachmentMessage)({
                            type: 'hook_additional_context',
                            content: additionalContexts,
                            hookName: 'SessionStart',
                            toolUseID: 'SessionStart',
                            hookEvent: 'SessionStart',
                        });
                        hookMessages.push(contextMessage);
                    }
                    return [2 /*return*/, hookMessages];
            }
        });
    });
}
function processSetupHooks(trigger_1) {
    return __awaiter(this, arguments, void 0, function (trigger, _a) {
        var hookMessages, additionalContexts, error_2, errorMessage, _b, _c, _d, hookResult, e_2_1, contextMessage;
        var _e, e_2, _f, _g;
        var _h = _a === void 0 ? {} : _a, forceSyncExecution = _h.forceSyncExecution;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    // Same rationale as processSessionStartHooks above.
                    if ((0, envUtils_js_1.isBareMode)()) {
                        return [2 /*return*/, []];
                    }
                    hookMessages = [];
                    additionalContexts = [];
                    if (!(0, hooksConfigSnapshot_js_1.shouldAllowManagedHooksOnly)()) return [3 /*break*/, 1];
                    (0, debug_js_1.logForDebugging)('Skipping plugin hooks - allowManagedHooksOnly is enabled');
                    return [3 /*break*/, 4];
                case 1:
                    _j.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, loadPluginHooks_js_1.loadPluginHooks)()];
                case 2:
                    _j.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _j.sent();
                    errorMessage = error_2 instanceof Error ? error_2.message : String(error_2);
                    (0, debug_js_1.logForDebugging)("Warning: Failed to load plugin hooks. Setup hooks from plugins will not execute. Error: ".concat(errorMessage), { level: 'warn' });
                    return [3 /*break*/, 4];
                case 4:
                    _j.trys.push([4, 9, 10, 15]);
                    _b = true, _c = __asyncValues((0, hooks_js_1.executeSetupHooks)(trigger, undefined, undefined, forceSyncExecution));
                    _j.label = 5;
                case 5: return [4 /*yield*/, _c.next()];
                case 6:
                    if (!(_d = _j.sent(), _e = _d.done, !_e)) return [3 /*break*/, 8];
                    _g = _d.value;
                    _b = false;
                    hookResult = _g;
                    if (hookResult.message) {
                        hookMessages.push(hookResult.message);
                    }
                    if (hookResult.additionalContexts &&
                        hookResult.additionalContexts.length > 0) {
                        additionalContexts.push.apply(additionalContexts, hookResult.additionalContexts);
                    }
                    _j.label = 7;
                case 7:
                    _b = true;
                    return [3 /*break*/, 5];
                case 8: return [3 /*break*/, 15];
                case 9:
                    e_2_1 = _j.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 15];
                case 10:
                    _j.trys.push([10, , 13, 14]);
                    if (!(!_b && !_e && (_f = _c.return))) return [3 /*break*/, 12];
                    return [4 /*yield*/, _f.call(_c)];
                case 11:
                    _j.sent();
                    _j.label = 12;
                case 12: return [3 /*break*/, 14];
                case 13:
                    if (e_2) throw e_2.error;
                    return [7 /*endfinally*/];
                case 14: return [7 /*endfinally*/];
                case 15:
                    if (additionalContexts.length > 0) {
                        contextMessage = (0, attachments_js_1.createAttachmentMessage)({
                            type: 'hook_additional_context',
                            content: additionalContexts,
                            hookName: 'Setup',
                            toolUseID: 'Setup',
                            hookEvent: 'Setup',
                        });
                        hookMessages.push(contextMessage);
                    }
                    return [2 /*return*/, hookMessages];
            }
        });
    });
}
