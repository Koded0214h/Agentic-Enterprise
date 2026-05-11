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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
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
exports.getSessionEndHookTimeoutMs = getSessionEndHookTimeoutMs;
exports.shouldSkipHookDueToTrust = shouldSkipHookDueToTrust;
exports.createBaseHookInput = createBaseHookInput;
exports.getMatchingHooks = getMatchingHooks;
exports.getPreToolHookBlockingMessage = getPreToolHookBlockingMessage;
exports.getStopHookMessage = getStopHookMessage;
exports.getTeammateIdleHookMessage = getTeammateIdleHookMessage;
exports.getTaskCreatedHookMessage = getTaskCreatedHookMessage;
exports.getTaskCompletedHookMessage = getTaskCompletedHookMessage;
exports.getUserPromptSubmitHookBlockingMessage = getUserPromptSubmitHookBlockingMessage;
exports.hasBlockingResult = hasBlockingResult;
exports.executePreToolHooks = executePreToolHooks;
exports.executePostToolHooks = executePostToolHooks;
exports.executePostToolUseFailureHooks = executePostToolUseFailureHooks;
exports.executePermissionDeniedHooks = executePermissionDeniedHooks;
exports.executeNotificationHooks = executeNotificationHooks;
exports.executeStopFailureHooks = executeStopFailureHooks;
exports.executeStopHooks = executeStopHooks;
exports.executeTeammateIdleHooks = executeTeammateIdleHooks;
exports.executeTaskCreatedHooks = executeTaskCreatedHooks;
exports.executeTaskCompletedHooks = executeTaskCompletedHooks;
exports.executeUserPromptSubmitHooks = executeUserPromptSubmitHooks;
exports.executeSessionStartHooks = executeSessionStartHooks;
exports.executeSetupHooks = executeSetupHooks;
exports.executeSubagentStartHooks = executeSubagentStartHooks;
exports.executePreCompactHooks = executePreCompactHooks;
exports.executePostCompactHooks = executePostCompactHooks;
exports.executeSessionEndHooks = executeSessionEndHooks;
exports.executePermissionRequestHooks = executePermissionRequestHooks;
exports.executeConfigChangeHooks = executeConfigChangeHooks;
exports.executeCwdChangedHooks = executeCwdChangedHooks;
exports.executeFileChangedHooks = executeFileChangedHooks;
exports.hasInstructionsLoadedHook = hasInstructionsLoadedHook;
exports.executeInstructionsLoadedHooks = executeInstructionsLoadedHooks;
exports.executeElicitationHooks = executeElicitationHooks;
exports.executeElicitationResultHooks = executeElicitationResultHooks;
exports.executeStatusLineCommand = executeStatusLineCommand;
exports.executeFileSuggestionCommand = executeFileSuggestionCommand;
exports.hasWorktreeCreateHook = hasWorktreeCreateHook;
exports.executeWorktreeCreateHook = executeWorktreeCreateHook;
exports.executeWorktreeRemoveHook = executeWorktreeRemoveHook;
// biome-ignore-all assist/source/organizeImports: ANT-ONLY import markers must not be reordered
/**
 * Hooks are user-defined shell commands that can be executed at various points
 * in Claude Code's lifecycle.
 */
var path_1 = require("path");
var child_process_1 = require("child_process");
var file_js_1 = require("./file.js");
var ShellCommand_js_1 = require("./ShellCommand.js");
var TaskOutput_js_1 = require("./task/TaskOutput.js");
var cwd_js_1 = require("./cwd.js");
var crypto_1 = require("crypto");
var shellPrefix_js_1 = require("./bash/shellPrefix.js");
var sessionEnvironment_js_1 = require("./sessionEnvironment.js");
var subprocessEnv_js_1 = require("./subprocessEnv.js");
var platform_js_1 = require("./platform.js");
var windowsPaths_js_1 = require("./windowsPaths.js");
var powershellDetection_js_1 = require("./shell/powershellDetection.js");
var shellProvider_js_1 = require("./shell/shellProvider.js");
var powershellProvider_js_1 = require("./shell/powershellProvider.js");
var pluginOptionsStorage_js_1 = require("./plugins/pluginOptionsStorage.js");
var pluginDirectories_js_1 = require("./plugins/pluginDirectories.js");
var state_js_1 = require("../bootstrap/state.js");
var config_js_1 = require("./config.js");
var hooksConfigSnapshot_js_1 = require("./hooks/hooksConfigSnapshot.js");
var sessionStorage_js_1 = require("./sessionStorage.js");
var settings_js_1 = require("./settings/settings.js");
var index_js_1 = require("src/services/analytics/index.js");
var events_js_1 = require("./telemetry/events.js");
var schemas_js_1 = require("./plugins/schemas.js");
var sessionTracing_js_1 = require("./telemetry/sessionTracing.js");
var hooks_js_1 = require("../types/hooks.js");
var chalk_1 = require("chalk");
var hooksSettings_js_1 = require("./hooks/hooksSettings.js");
var debug_js_1 = require("./debug.js");
var diagLogs_js_1 = require("./diagLogs.js");
var stringUtils_js_1 = require("./stringUtils.js");
var permissionRuleParser_js_1 = require("./permissions/permissionRuleParser.js");
var log_js_1 = require("./log.js");
var combinedAbortSignal_js_1 = require("./combinedAbortSignal.js");
var AsyncHookRegistry_js_1 = require("./hooks/AsyncHookRegistry.js");
var messageQueueManager_js_1 = require("./messageQueueManager.js");
var messages_js_1 = require("./messages.js");
var hookEvents_js_1 = require("./hooks/hookEvents.js");
var attachments_js_1 = require("./attachments.js");
var generators_js_1 = require("./generators.js");
var Tool_js_1 = require("../Tool.js");
var execPromptHook_js_1 = require("./hooks/execPromptHook.js");
var execAgentHook_js_1 = require("./hooks/execAgentHook.js");
var execHttpHook_js_1 = require("./hooks/execHttpHook.js");
var sessionHooks_js_1 = require("./hooks/sessionHooks.js");
var slowOperations_js_1 = require("./slowOperations.js");
var envUtils_js_1 = require("./envUtils.js");
var errors_js_1 = require("./errors.js");
var TOOL_HOOK_EXECUTION_TIMEOUT_MS = 10 * 60 * 1000;
/**
 * SessionEnd hooks run during shutdown/clear and need a much tighter bound
 * than TOOL_HOOK_EXECUTION_TIMEOUT_MS. This value is used by callers as both
 * the per-hook default timeout AND the overall AbortSignal cap (hooks run in
 * parallel, so one value suffices). Overridable via env var for users whose
 * teardown scripts need more time.
 */
var SESSION_END_HOOK_TIMEOUT_MS_DEFAULT = 1500;
function getSessionEndHookTimeoutMs() {
    var raw = process.env.CLAUDE_CODE_SESSIONEND_HOOKS_TIMEOUT_MS;
    var parsed = raw ? parseInt(raw, 10) : NaN;
    return Number.isFinite(parsed) && parsed > 0
        ? parsed
        : SESSION_END_HOOK_TIMEOUT_MS_DEFAULT;
}
function executeInBackground(_a) {
    var _this = this;
    var processId = _a.processId, hookId = _a.hookId, shellCommand = _a.shellCommand, asyncResponse = _a.asyncResponse, hookEvent = _a.hookEvent, hookName = _a.hookName, command = _a.command, asyncRewake = _a.asyncRewake, pluginId = _a.pluginId;
    if (asyncRewake) {
        // asyncRewake hooks bypass the registry entirely. On completion, if exit
        // code 2 (blocking error), enqueue as a task-notification so it wakes the
        // model via useQueueProcessor (idle) or gets injected mid-query via
        // queued_command attachments (busy).
        //
        // NOTE: We deliberately do NOT call shellCommand.background() here, because
        // it calls taskOutput.spillToDisk() which breaks in-memory stdout/stderr
        // capture (getStderr() returns '' in disk mode). The StreamWrappers stay
        // attached and pipe data into the in-memory TaskOutput buffers. The abort
        // handler already no-ops on 'interrupt' reason (user submitted a new
        // message), so the hook survives new prompts. A hard cancel (Escape) WILL
        // kill the hook via the abort handler, which is the desired behavior.
        void shellCommand.result.then(function (result) { return __awaiter(_this, void 0, void 0, function () {
            var stdout, stderr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // result resolves on 'exit', but stdio 'data' events may still be
                    // pending. Yield to I/O so the StreamWrapper data handlers drain into
                    // TaskOutput before we read it.
                    return [4 /*yield*/, new Promise(function (resolve) { return setImmediate(resolve); })];
                    case 1:
                        // result resolves on 'exit', but stdio 'data' events may still be
                        // pending. Yield to I/O so the StreamWrapper data handlers drain into
                        // TaskOutput before we read it.
                        _a.sent();
                        return [4 /*yield*/, shellCommand.taskOutput.getStdout()];
                    case 2:
                        stdout = _a.sent();
                        stderr = shellCommand.taskOutput.getStderr();
                        shellCommand.cleanup();
                        (0, hookEvents_js_1.emitHookResponse)({
                            hookId: hookId,
                            hookName: hookName,
                            hookEvent: hookEvent,
                            output: stdout + stderr,
                            stdout: stdout,
                            stderr: stderr,
                            exitCode: result.code,
                            outcome: result.code === 0 ? 'success' : 'error',
                        });
                        if (result.code === 2) {
                            (0, messageQueueManager_js_1.enqueuePendingNotification)({
                                value: (0, messages_js_1.wrapInSystemReminder)("Stop hook blocking error from command \"".concat(hookName, "\": ").concat(stderr || stdout)),
                                mode: 'task-notification',
                            });
                        }
                        return [2 /*return*/];
                }
            });
        }); });
        return true;
    }
    // TaskOutput on the ShellCommand accumulates data — no stream listeners needed
    if (!shellCommand.background(processId)) {
        return false;
    }
    (0, AsyncHookRegistry_js_1.registerPendingAsyncHook)({
        processId: processId,
        hookId: hookId,
        asyncResponse: asyncResponse,
        hookEvent: hookEvent,
        hookName: hookName,
        command: command,
        shellCommand: shellCommand,
        pluginId: pluginId,
    });
    return true;
}
/**
 * Checks if a hook should be skipped due to lack of workspace trust.
 *
 * ALL hooks require workspace trust because they execute arbitrary commands from
 * .claude/settings.json. This is a defense-in-depth security measure.
 *
 * Context: Hooks are captured via captureHooksConfigSnapshot() before the trust
 * dialog is shown. While most hooks won't execute until after trust is established
 * through normal program flow, enforcing trust for ALL hooks prevents:
 * - Future bugs where a hook might accidentally execute before trust
 * - Any codepath that might trigger hooks before trust dialog
 * - Security issues from hook execution in untrusted workspaces
 *
 * Historical vulnerabilities that prompted this check:
 * - SessionEnd hooks executing when user declines trust dialog
 * - SubagentStop hooks executing when subagent completes before trust
 *
 * @returns true if hook should be skipped, false if it should execute
 */
function shouldSkipHookDueToTrust() {
    // In non-interactive mode (SDK), trust is implicit - always execute
    var isInteractive = !(0, state_js_1.getIsNonInteractiveSession)();
    if (!isInteractive) {
        return false;
    }
    // In interactive mode, ALL hooks require trust
    var hasTrust = (0, config_js_1.checkHasTrustDialogAccepted)();
    return !hasTrust;
}
/**
 * Creates the base hook input that's common to all hook types
 */
function createBaseHookInput(permissionMode, sessionId, 
// Typed narrowly (not ToolUseContext) so callers can pass toolUseContext
// directly via structural typing without this function depending on Tool.ts.
agentInfo) {
    var _a;
    var resolvedSessionId = sessionId !== null && sessionId !== void 0 ? sessionId : (0, state_js_1.getSessionId)();
    // agent_type: subagent's type (from toolUseContext) takes precedence over
    // the session's --agent flag. Hooks use agent_id presence to distinguish
    // subagent calls from main-thread calls in a --agent session.
    var resolvedAgentType = (_a = agentInfo === null || agentInfo === void 0 ? void 0 : agentInfo.agentType) !== null && _a !== void 0 ? _a : (0, state_js_1.getMainThreadAgentType)();
    return {
        session_id: resolvedSessionId,
        transcript_path: (0, sessionStorage_js_1.getTranscriptPathForSession)(resolvedSessionId),
        cwd: (0, cwd_js_1.getCwd)(),
        permission_mode: permissionMode,
        agent_id: agentInfo === null || agentInfo === void 0 ? void 0 : agentInfo.agentId,
        agent_type: resolvedAgentType,
    };
}
/**
 * Parse and validate a JSON string against the hook output Zod schema.
 * Returns the validated output or formatted validation errors.
 */
function validateHookJson(jsonString) {
    var parsed = (0, slowOperations_js_1.jsonParse)(jsonString);
    var validation = (0, hooks_js_1.hookJSONOutputSchema)().safeParse(parsed);
    if (validation.success) {
        (0, debug_js_1.logForDebugging)('Successfully parsed and validated hook JSON output');
        return { json: validation.data };
    }
    var errors = validation.error.issues
        .map(function (err) { return "  - ".concat(err.path.join('.'), ": ").concat(err.message); })
        .join('\n');
    return {
        validationError: "Hook JSON output validation failed:\n".concat(errors, "\n\nThe hook's output was: ").concat((0, slowOperations_js_1.jsonStringify)(parsed, null, 2)),
    };
}
function parseHookOutput(stdout) {
    var trimmed = stdout.trim();
    if (!trimmed.startsWith('{')) {
        (0, debug_js_1.logForDebugging)('Hook output does not start with {, treating as plain text');
        return { plainText: stdout };
    }
    try {
        var result = validateHookJson(trimmed);
        if ('json' in result) {
            return result;
        }
        // For command hooks, include the schema hint in the error message
        var errorMessage_1 = "".concat(result.validationError, "\n\nExpected schema:\n").concat((0, slowOperations_js_1.jsonStringify)({
            continue: 'boolean (optional)',
            suppressOutput: 'boolean (optional)',
            stopReason: 'string (optional)',
            decision: '"approve" | "block" (optional)',
            reason: 'string (optional)',
            systemMessage: 'string (optional)',
            permissionDecision: '"allow" | "deny" | "ask" (optional)',
            hookSpecificOutput: {
                'for PreToolUse': {
                    hookEventName: '"PreToolUse"',
                    permissionDecision: '"allow" | "deny" | "ask" (optional)',
                    permissionDecisionReason: 'string (optional)',
                    updatedInput: 'object (optional) - Modified tool input to use',
                },
                'for UserPromptSubmit': {
                    hookEventName: '"UserPromptSubmit"',
                    additionalContext: 'string (required)',
                },
                'for PostToolUse': {
                    hookEventName: '"PostToolUse"',
                    additionalContext: 'string (optional)',
                },
            },
        }, null, 2));
        (0, debug_js_1.logForDebugging)(errorMessage_1);
        return { plainText: stdout, validationError: errorMessage_1 };
    }
    catch (e) {
        (0, debug_js_1.logForDebugging)("Failed to parse hook output as JSON: ".concat(e));
        return { plainText: stdout };
    }
}
function parseHttpHookOutput(body) {
    var trimmed = body.trim();
    if (trimmed === '') {
        var validation = (0, hooks_js_1.hookJSONOutputSchema)().safeParse({});
        if (validation.success) {
            (0, debug_js_1.logForDebugging)('HTTP hook returned empty body, treating as empty JSON object');
            return { json: validation.data };
        }
    }
    if (!trimmed.startsWith('{')) {
        var validationError = "HTTP hook must return JSON, but got non-JSON response body: ".concat(trimmed.length > 200 ? trimmed.slice(0, 200) + '\u2026' : trimmed);
        (0, debug_js_1.logForDebugging)(validationError);
        return { validationError: validationError };
    }
    try {
        var result = validateHookJson(trimmed);
        if ('json' in result) {
            return result;
        }
        (0, debug_js_1.logForDebugging)(result.validationError);
        return result;
    }
    catch (e) {
        var validationError = "HTTP hook must return valid JSON, but parsing failed: ".concat(e);
        (0, debug_js_1.logForDebugging)(validationError);
        return { validationError: validationError };
    }
}
function processHookJSONOutput(_a) {
    var _b;
    var json = _a.json, command = _a.command, hookName = _a.hookName, toolUseID = _a.toolUseID, hookEvent = _a.hookEvent, expectedHookEvent = _a.expectedHookEvent, stdout = _a.stdout, stderr = _a.stderr, exitCode = _a.exitCode, durationMs = _a.durationMs;
    var result = {};
    // At this point we know it's a sync response
    var syncJson = json;
    // Handle common elements
    if (syncJson.continue === false) {
        result.preventContinuation = true;
        if (syncJson.stopReason) {
            result.stopReason = syncJson.stopReason;
        }
    }
    if (json.decision) {
        switch (json.decision) {
            case 'approve':
                result.permissionBehavior = 'allow';
                break;
            case 'block':
                result.permissionBehavior = 'deny';
                result.blockingError = {
                    blockingError: json.reason || 'Blocked by hook',
                    command: command,
                };
                break;
            default:
                // Handle unknown decision types as errors
                throw new Error("Unknown hook decision type: ".concat(json.decision, ". Valid types are: approve, block"));
        }
    }
    // Handle systemMessage field
    if (json.systemMessage) {
        result.systemMessage = json.systemMessage;
    }
    // Handle PreToolUse specific
    if (((_b = json.hookSpecificOutput) === null || _b === void 0 ? void 0 : _b.hookEventName) === 'PreToolUse' &&
        json.hookSpecificOutput.permissionDecision) {
        switch (json.hookSpecificOutput.permissionDecision) {
            case 'allow':
                result.permissionBehavior = 'allow';
                break;
            case 'deny':
                result.permissionBehavior = 'deny';
                result.blockingError = {
                    blockingError: json.reason || 'Blocked by hook',
                    command: command,
                };
                break;
            case 'ask':
                result.permissionBehavior = 'ask';
                break;
            default:
                // Handle unknown decision types as errors
                throw new Error("Unknown hook permissionDecision type: ".concat(json.hookSpecificOutput.permissionDecision, ". Valid types are: allow, deny, ask"));
        }
    }
    if (result.permissionBehavior !== undefined && json.reason !== undefined) {
        result.hookPermissionDecisionReason = json.reason;
    }
    // Handle hookSpecificOutput
    if (json.hookSpecificOutput) {
        // Validate hook event name matches expected if provided
        if (expectedHookEvent &&
            json.hookSpecificOutput.hookEventName !== expectedHookEvent) {
            throw new Error("Hook returned incorrect event name: expected '".concat(expectedHookEvent, "' but got '").concat(json.hookSpecificOutput.hookEventName, "'. Full stdout: ").concat((0, slowOperations_js_1.jsonStringify)(json, null, 2)));
        }
        switch (json.hookSpecificOutput.hookEventName) {
            case 'PreToolUse':
                // Override with more specific permission decision if provided
                if (json.hookSpecificOutput.permissionDecision) {
                    switch (json.hookSpecificOutput.permissionDecision) {
                        case 'allow':
                            result.permissionBehavior = 'allow';
                            break;
                        case 'deny':
                            result.permissionBehavior = 'deny';
                            result.blockingError = {
                                blockingError: json.hookSpecificOutput.permissionDecisionReason ||
                                    json.reason ||
                                    'Blocked by hook',
                                command: command,
                            };
                            break;
                        case 'ask':
                            result.permissionBehavior = 'ask';
                            break;
                    }
                }
                result.hookPermissionDecisionReason =
                    json.hookSpecificOutput.permissionDecisionReason;
                // Extract updatedInput if provided
                if (json.hookSpecificOutput.updatedInput) {
                    result.updatedInput = json.hookSpecificOutput.updatedInput;
                }
                // Extract additionalContext if provided
                result.additionalContext = json.hookSpecificOutput.additionalContext;
                break;
            case 'UserPromptSubmit':
                result.additionalContext = json.hookSpecificOutput.additionalContext;
                break;
            case 'SessionStart':
                result.additionalContext = json.hookSpecificOutput.additionalContext;
                result.initialUserMessage = json.hookSpecificOutput.initialUserMessage;
                if ('watchPaths' in json.hookSpecificOutput &&
                    json.hookSpecificOutput.watchPaths) {
                    result.watchPaths = json.hookSpecificOutput.watchPaths;
                }
                break;
            case 'Setup':
                result.additionalContext = json.hookSpecificOutput.additionalContext;
                break;
            case 'SubagentStart':
                result.additionalContext = json.hookSpecificOutput.additionalContext;
                break;
            case 'PostToolUse':
                result.additionalContext = json.hookSpecificOutput.additionalContext;
                // Extract updatedMCPToolOutput if provided
                if (json.hookSpecificOutput.updatedMCPToolOutput) {
                    result.updatedMCPToolOutput =
                        json.hookSpecificOutput.updatedMCPToolOutput;
                }
                break;
            case 'PostToolUseFailure':
                result.additionalContext = json.hookSpecificOutput.additionalContext;
                break;
            case 'PermissionDenied':
                result.retry = json.hookSpecificOutput.retry;
                break;
            case 'PermissionRequest':
                // Extract the permission request decision
                if (json.hookSpecificOutput.decision) {
                    result.permissionRequestResult = json.hookSpecificOutput.decision;
                    // Also update permissionBehavior for consistency
                    result.permissionBehavior =
                        json.hookSpecificOutput.decision.behavior === 'allow'
                            ? 'allow'
                            : 'deny';
                    if (json.hookSpecificOutput.decision.behavior === 'allow' &&
                        json.hookSpecificOutput.decision.updatedInput) {
                        result.updatedInput = json.hookSpecificOutput.decision.updatedInput;
                    }
                }
                break;
            case 'Elicitation':
                if (json.hookSpecificOutput.action) {
                    result.elicitationResponse = {
                        action: json.hookSpecificOutput.action,
                        content: json.hookSpecificOutput.content,
                    };
                    if (json.hookSpecificOutput.action === 'decline') {
                        result.blockingError = {
                            blockingError: json.reason || 'Elicitation denied by hook',
                            command: command,
                        };
                    }
                }
                break;
            case 'ElicitationResult':
                if (json.hookSpecificOutput.action) {
                    result.elicitationResultResponse = {
                        action: json.hookSpecificOutput.action,
                        content: json.hookSpecificOutput.content,
                    };
                    if (json.hookSpecificOutput.action === 'decline') {
                        result.blockingError = {
                            blockingError: json.reason || 'Elicitation result blocked by hook',
                            command: command,
                        };
                    }
                }
                break;
        }
    }
    return __assign(__assign({}, result), { message: result.blockingError
            ? (0, attachments_js_1.createAttachmentMessage)({
                type: 'hook_blocking_error',
                hookName: hookName,
                toolUseID: toolUseID,
                hookEvent: hookEvent,
                blockingError: result.blockingError,
            })
            : (0, attachments_js_1.createAttachmentMessage)({
                type: 'hook_success',
                hookName: hookName,
                toolUseID: toolUseID,
                hookEvent: hookEvent,
                // JSON-output hooks inject context via additionalContext →
                // hook_additional_context, not this field. Empty content suppresses
                // the trivial "X hook success: Success" system-reminder that
                // otherwise pollutes every turn (messages.ts:3577 skips on '').
                content: '',
                stdout: stdout,
                stderr: stderr,
                exitCode: exitCode,
                command: command,
                durationMs: durationMs,
            }) });
}
/**
 * Execute a command-based hook using bash or PowerShell.
 *
 * Shell resolution: hook.shell → 'bash'. PowerShell hooks spawn pwsh
 * with -NoProfile -NonInteractive -Command and skip bash-specific prep
 * (POSIX path conversion, .sh auto-prepend, CLAUDE_CODE_SHELL_PREFIX).
 * See docs/design/ps-shell-selection.md §5.1.
 */
function execCommandHook(hook, hookEvent, hookName, jsonInput, signal, hookId, hookIndex, pluginRoot, pluginId, skillRoot, forceSyncExecution, requestPrompt) {
    return __awaiter(this, void 0, void 0, function () {
        var shouldEmitDiag, diagStartMs, diagExitCode, diagAborted, isWindows, shellType, isPowerShell, toHookPath, projectDir, command, pluginOpts, rootPath_1, dataPath_1, finalCommand, hookTimeoutMs, envVars, _i, _a, _b, key, value, envKey, _c, hookCwd, safeCwd, child, pwshPath, shell, hookTaskOutput, shellCommand, shellCommandTransferred, stdinWritten, processId, backgrounded, stdout, stderr, output, initialResponseChecked, asyncResolve, childIsAsyncPromise, processedPromptLines, promptChain, lineBuffer, stopProgressInterval, stdoutEndPromise, stderrEndPromise, stdinWritePromise, childErrorPromise, childClosePromise, result, error_1, code, errMsg, errorMsg, errOutput;
        var _this = this;
        var _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    shouldEmitDiag = hookEvent === 'SessionStart' ||
                        hookEvent === 'Setup' ||
                        hookEvent === 'SessionEnd';
                    diagStartMs = Date.now();
                    diagAborted = false;
                    isWindows = (0, platform_js_1.getPlatform)() === 'windows';
                    shellType = (_d = hook.shell) !== null && _d !== void 0 ? _d : shellProvider_js_1.DEFAULT_HOOK_SHELL;
                    isPowerShell = shellType === 'powershell';
                    toHookPath = isWindows && !isPowerShell
                        ? function (p) { return (0, windowsPaths_js_1.windowsPathToPosixPath)(p); }
                        : function (p) { return p; };
                    projectDir = (0, state_js_1.getProjectRoot)();
                    command = hook.command;
                    if (!pluginRoot) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, file_js_1.pathExists)(pluginRoot)];
                case 1:
                    // Plugin directory gone (orphan GC race, concurrent session deleted it):
                    // throw so callers yield a non-blocking error. Running would fail — and
                    // `python3 <missing>.py` exits 2, the hook protocol's "block" code, which
                    // bricks UserPromptSubmit/Stop until restart. The pre-check is necessary
                    // because exit-2-from-missing-script is indistinguishable from an
                    // intentional block after spawn.
                    if (!(_f.sent())) {
                        throw new Error("Plugin directory does not exist: ".concat(pluginRoot) +
                            (pluginId ? " (".concat(pluginId, " \u2014 run /plugin to reinstall)") : ''));
                    }
                    rootPath_1 = toHookPath(pluginRoot);
                    command = command.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, function () { return rootPath_1; });
                    if (pluginId) {
                        dataPath_1 = toHookPath((0, pluginDirectories_js_1.getPluginDataDir)(pluginId));
                        command = command.replace(/\$\{CLAUDE_PLUGIN_DATA\}/g, function () { return dataPath_1; });
                    }
                    if (pluginId) {
                        pluginOpts = (0, pluginOptionsStorage_js_1.loadPluginOptions)(pluginId);
                        // Throws if a referenced key is missing — that means the hook uses a key
                        // that's either not declared in manifest.userConfig or not yet configured.
                        // Caught upstream like any other hook exec failure.
                        command = (0, pluginOptionsStorage_js_1.substituteUserConfigVariables)(command, pluginOpts);
                    }
                    _f.label = 2;
                case 2:
                    // On Windows (bash only), auto-prepend `bash` for .sh scripts so they
                    // execute instead of opening in the default file handler. PowerShell
                    // runs .ps1 files natively — no prepend needed.
                    if (isWindows && !isPowerShell && command.trim().match(/\.sh(\s|$|")/)) {
                        if (!command.trim().startsWith('bash ')) {
                            command = "bash ".concat(command);
                        }
                    }
                    finalCommand = !isPowerShell && process.env.CLAUDE_CODE_SHELL_PREFIX
                        ? (0, shellPrefix_js_1.formatShellPrefixCommand)(process.env.CLAUDE_CODE_SHELL_PREFIX, command)
                        : command;
                    hookTimeoutMs = hook.timeout
                        ? hook.timeout * 1000
                        : TOOL_HOOK_EXECUTION_TIMEOUT_MS;
                    envVars = __assign(__assign({}, (0, subprocessEnv_js_1.subprocessEnv)()), { CLAUDE_PROJECT_DIR: toHookPath(projectDir) });
                    // Plugin and skill hooks both set CLAUDE_PLUGIN_ROOT (skills use the same
                    // name for consistency — skills can migrate to plugins without code changes)
                    if (pluginRoot) {
                        envVars.CLAUDE_PLUGIN_ROOT = toHookPath(pluginRoot);
                        if (pluginId) {
                            envVars.CLAUDE_PLUGIN_DATA = toHookPath((0, pluginDirectories_js_1.getPluginDataDir)(pluginId));
                        }
                    }
                    // Expose plugin options as env vars too, so hooks can read them without
                    // ${user_config.X} in the command string. Sensitive values included — hooks
                    // run the user's own code, same trust boundary as reading keychain directly.
                    if (pluginOpts) {
                        for (_i = 0, _a = Object.entries(pluginOpts); _i < _a.length; _i++) {
                            _b = _a[_i], key = _b[0], value = _b[1];
                            envKey = key.replace(/[^A-Za-z0-9_]/g, '_').toUpperCase();
                            envVars["CLAUDE_PLUGIN_OPTION_".concat(envKey)] = String(value);
                        }
                    }
                    if (skillRoot) {
                        envVars.CLAUDE_PLUGIN_ROOT = toHookPath(skillRoot);
                    }
                    if (!(!isPowerShell &&
                        (hookEvent === 'SessionStart' ||
                            hookEvent === 'Setup' ||
                            hookEvent === 'CwdChanged' ||
                            hookEvent === 'FileChanged') &&
                        hookIndex !== undefined)) return [3 /*break*/, 4];
                    _c = envVars;
                    return [4 /*yield*/, (0, sessionEnvironment_js_1.getHookEnvFilePath)(hookEvent, hookIndex)];
                case 3:
                    _c.CLAUDE_ENV_FILE = _f.sent();
                    _f.label = 4;
                case 4:
                    hookCwd = (0, cwd_js_1.getCwd)();
                    return [4 /*yield*/, (0, file_js_1.pathExists)(hookCwd)];
                case 5:
                    safeCwd = (_f.sent()) ? hookCwd : (0, state_js_1.getOriginalCwd)();
                    if (safeCwd !== hookCwd) {
                        (0, debug_js_1.logForDebugging)("Hooks: cwd ".concat(hookCwd, " not found, falling back to original cwd"), { level: 'warn' });
                    }
                    if (!(shellType === 'powershell')) return [3 /*break*/, 7];
                    return [4 /*yield*/, (0, powershellDetection_js_1.getCachedPowerShellPath)()];
                case 6:
                    pwshPath = _f.sent();
                    if (!pwshPath) {
                        throw new Error("Hook \"".concat(hook.command, "\" has shell: 'powershell' but no PowerShell ") +
                            "executable (pwsh or powershell) was found on PATH. Install " +
                            "PowerShell, or remove \"shell\": \"powershell\" to use bash.");
                    }
                    child = (0, child_process_1.spawn)(pwshPath, (0, powershellProvider_js_1.buildPowerShellArgs)(finalCommand), {
                        env: envVars,
                        cwd: safeCwd,
                        // Prevent visible console window on Windows (no-op on other platforms)
                        windowsHide: true,
                    });
                    return [3 /*break*/, 8];
                case 7:
                    shell = isWindows ? (0, windowsPaths_js_1.findGitBashPath)() : true;
                    child = (0, child_process_1.spawn)(finalCommand, [], {
                        env: envVars,
                        cwd: safeCwd,
                        shell: shell,
                        // Prevent visible console window on Windows (no-op on other platforms)
                        windowsHide: true,
                    });
                    _f.label = 8;
                case 8:
                    hookTaskOutput = new TaskOutput_js_1.TaskOutput("hook_".concat(child.pid), null);
                    shellCommand = (0, ShellCommand_js_1.wrapSpawn)(child, signal, hookTimeoutMs, hookTaskOutput);
                    shellCommandTransferred = false;
                    stdinWritten = false;
                    if ((hook.async || hook.asyncRewake) && !forceSyncExecution) {
                        processId = "async_hook_".concat(child.pid);
                        (0, debug_js_1.logForDebugging)("Hooks: Config-based async hook, backgrounding process ".concat(processId));
                        // Write stdin before backgrounding so the hook receives its input.
                        // The trailing newline matches the sync path (L1000). Without it,
                        // bash `read -r line` returns exit 1 (EOF before delimiter) — the
                        // variable IS populated but `if read -r line; then ...` skips the
                        // branch. See gh-30509 / CC-161.
                        child.stdin.write(jsonInput + '\n', 'utf8');
                        child.stdin.end();
                        stdinWritten = true;
                        backgrounded = executeInBackground({
                            processId: processId,
                            hookId: hookId,
                            shellCommand: shellCommand,
                            asyncResponse: { async: true, asyncTimeout: hookTimeoutMs },
                            hookEvent: hookEvent,
                            hookName: hookName,
                            command: hook.command,
                            asyncRewake: hook.asyncRewake,
                            pluginId: pluginId,
                        });
                        if (backgrounded) {
                            return [2 /*return*/, {
                                    stdout: '',
                                    stderr: '',
                                    output: '',
                                    status: 0,
                                    backgrounded: true,
                                }];
                        }
                    }
                    stdout = '';
                    stderr = '';
                    output = '';
                    // Set up output data collection with explicit UTF-8 encoding
                    child.stdout.setEncoding('utf8');
                    child.stderr.setEncoding('utf8');
                    initialResponseChecked = false;
                    asyncResolve = null;
                    childIsAsyncPromise = new Promise(function (resolve) {
                        asyncResolve = resolve;
                    });
                    processedPromptLines = new Set();
                    promptChain = Promise.resolve();
                    lineBuffer = '';
                    child.stdout.on('data', function (data) {
                        var _a;
                        stdout += data;
                        output += data;
                        // When requestPrompt is provided, parse stdout line-by-line for prompt requests
                        if (requestPrompt) {
                            lineBuffer += data;
                            var lines = lineBuffer.split('\n');
                            lineBuffer = (_a = lines.pop()) !== null && _a !== void 0 ? _a : ''; // last element is an incomplete line
                            var _loop_1 = function (line) {
                                var trimmed = line.trim();
                                if (!trimmed)
                                    return "continue";
                                try {
                                    var parsed = (0, slowOperations_js_1.jsonParse)(trimmed);
                                    var validation = (0, hooks_js_1.promptRequestSchema)().safeParse(parsed);
                                    if (validation.success) {
                                        processedPromptLines.add(trimmed);
                                        (0, debug_js_1.logForDebugging)("Hooks: Detected prompt request from hook: ".concat(trimmed));
                                        // Chain the async handling to serialize prompt responses
                                        var promptReq_1 = validation.data;
                                        var reqPrompt_1 = requestPrompt;
                                        promptChain = promptChain.then(function () { return __awaiter(_this, void 0, void 0, function () {
                                            var response, err_1;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        _a.trys.push([0, 2, , 3]);
                                                        return [4 /*yield*/, reqPrompt_1(promptReq_1)];
                                                    case 1:
                                                        response = _a.sent();
                                                        child.stdin.write((0, slowOperations_js_1.jsonStringify)(response) + '\n', 'utf8');
                                                        return [3 /*break*/, 3];
                                                    case 2:
                                                        err_1 = _a.sent();
                                                        (0, debug_js_1.logForDebugging)("Hooks: Prompt request handling failed: ".concat(err_1));
                                                        // User cancelled or prompt failed — close stdin so the hook
                                                        // process doesn't hang waiting for input
                                                        child.stdin.destroy();
                                                        return [3 /*break*/, 3];
                                                    case 3: return [2 /*return*/];
                                                }
                                            });
                                        }); });
                                        return "continue";
                                    }
                                }
                                catch (_b) {
                                    // Not JSON, just a normal line
                                }
                            };
                            for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
                                var line = lines_1[_i];
                                _loop_1(line);
                            }
                        }
                        // Check for async response on first line of output. The async protocol is:
                        // hook emits {"async":true,...} as its FIRST line, then its normal output.
                        // We must parse ONLY the first line — if the process is fast and writes more
                        // before this 'data' event fires, parsing the full accumulated stdout fails
                        // and an async hook blocks for its full duration instead of backgrounding.
                        if (!initialResponseChecked) {
                            var firstLine = (0, stringUtils_js_1.firstLineOf)(stdout).trim();
                            if (!firstLine.includes('}'))
                                return;
                            initialResponseChecked = true;
                            (0, debug_js_1.logForDebugging)("Hooks: Checking first line for async: ".concat(firstLine));
                            try {
                                var parsed = (0, slowOperations_js_1.jsonParse)(firstLine);
                                (0, debug_js_1.logForDebugging)("Hooks: Parsed initial response: ".concat((0, slowOperations_js_1.jsonStringify)(parsed)));
                                if ((0, hooks_js_1.isAsyncHookJSONOutput)(parsed) && !forceSyncExecution) {
                                    var processId = "async_hook_".concat(child.pid);
                                    (0, debug_js_1.logForDebugging)("Hooks: Detected async hook, backgrounding process ".concat(processId));
                                    var backgrounded = executeInBackground({
                                        processId: processId,
                                        hookId: hookId,
                                        shellCommand: shellCommand,
                                        asyncResponse: parsed,
                                        hookEvent: hookEvent,
                                        hookName: hookName,
                                        command: hook.command,
                                        pluginId: pluginId,
                                    });
                                    if (backgrounded) {
                                        shellCommandTransferred = true;
                                        asyncResolve === null || asyncResolve === void 0 ? void 0 : asyncResolve({
                                            stdout: stdout,
                                            stderr: stderr,
                                            output: output,
                                            status: 0,
                                        });
                                    }
                                }
                                else if ((0, hooks_js_1.isAsyncHookJSONOutput)(parsed) && forceSyncExecution) {
                                    (0, debug_js_1.logForDebugging)("Hooks: Detected async hook but forceSyncExecution is true, waiting for completion");
                                }
                                else {
                                    (0, debug_js_1.logForDebugging)("Hooks: Initial response is not async, continuing normal processing");
                                }
                            }
                            catch (e) {
                                (0, debug_js_1.logForDebugging)("Hooks: Failed to parse initial response as JSON: ".concat(e));
                            }
                        }
                    });
                    child.stderr.on('data', function (data) {
                        stderr += data;
                        output += data;
                    });
                    stopProgressInterval = (0, hookEvents_js_1.startHookProgressInterval)({
                        hookId: hookId,
                        hookName: hookName,
                        hookEvent: hookEvent,
                        getOutput: function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, ({ stdout: stdout, stderr: stderr, output: output })];
                        }); }); },
                    });
                    stdoutEndPromise = new Promise(function (resolve) {
                        child.stdout.on('end', function () { return resolve(); });
                    });
                    stderrEndPromise = new Promise(function (resolve) {
                        child.stderr.on('end', function () { return resolve(); });
                    });
                    stdinWritePromise = stdinWritten
                        ? Promise.resolve()
                        : new Promise(function (resolve, reject) {
                            child.stdin.on('error', function (err) {
                                // When requestPrompt is provided, stdin stays open for prompt responses.
                                // EPIPE errors from later writes (after process exits) are expected -- suppress them.
                                if (!requestPrompt) {
                                    reject(err);
                                }
                                else {
                                    (0, debug_js_1.logForDebugging)("Hooks: stdin error during prompt flow (likely process exited): ".concat(err));
                                }
                            });
                            // Explicitly specify UTF-8 encoding to ensure proper handling of Unicode characters
                            child.stdin.write(jsonInput + '\n', 'utf8');
                            // When requestPrompt is provided, keep stdin open for prompt responses
                            if (!requestPrompt) {
                                child.stdin.end();
                            }
                            resolve();
                        });
                    childErrorPromise = new Promise(function (_, reject) {
                        child.on('error', reject);
                    });
                    childClosePromise = new Promise(function (resolve) {
                        var exitCode = null;
                        child.on('close', function (code) {
                            exitCode = code !== null && code !== void 0 ? code : 1;
                            // Wait for both streams to end before resolving with the final output
                            void Promise.all([stdoutEndPromise, stderrEndPromise]).then(function () {
                                // Strip lines we processed as prompt requests so parseHookOutput
                                // only sees the final hook result. Content-matching against the set
                                // of actually-processed lines means prompt JSON can never leak
                                // through (fail-closed), regardless of line positioning.
                                var finalStdout = processedPromptLines.size === 0
                                    ? stdout
                                    : stdout
                                        .split('\n')
                                        .filter(function (line) { return !processedPromptLines.has(line.trim()); })
                                        .join('\n');
                                resolve({
                                    stdout: finalStdout,
                                    stderr: stderr,
                                    output: output,
                                    status: exitCode,
                                    aborted: signal.aborted,
                                });
                            });
                        });
                    });
                    _f.label = 9;
                case 9:
                    _f.trys.push([9, 13, 14, 15]);
                    if (shouldEmitDiag) {
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'hook_spawn_started', {
                            hook_event_name: hookEvent,
                            index: hookIndex,
                        });
                    }
                    return [4 /*yield*/, Promise.race([stdinWritePromise, childErrorPromise])
                        // Wait for any pending prompt responses before resolving
                    ];
                case 10:
                    _f.sent();
                    return [4 /*yield*/, Promise.race([
                            childIsAsyncPromise,
                            childClosePromise,
                            childErrorPromise,
                        ])
                        // Ensure all queued prompt responses have been sent
                    ];
                case 11:
                    result = _f.sent();
                    // Ensure all queued prompt responses have been sent
                    return [4 /*yield*/, promptChain];
                case 12:
                    // Ensure all queued prompt responses have been sent
                    _f.sent();
                    diagExitCode = result.status;
                    diagAborted = (_e = result.aborted) !== null && _e !== void 0 ? _e : false;
                    return [2 /*return*/, result];
                case 13:
                    error_1 = _f.sent();
                    code = (0, errors_js_1.getErrnoCode)(error_1);
                    diagExitCode = 1;
                    if (code === 'EPIPE') {
                        (0, debug_js_1.logForDebugging)('EPIPE error while writing to hook stdin (hook command likely closed early)');
                        errMsg = 'Hook command closed stdin before hook input was fully written (EPIPE)';
                        return [2 /*return*/, {
                                stdout: '',
                                stderr: errMsg,
                                output: errMsg,
                                status: 1,
                            }];
                    }
                    else if (code === 'ABORT_ERR') {
                        diagAborted = true;
                        return [2 /*return*/, {
                                stdout: '',
                                stderr: 'Hook cancelled',
                                output: 'Hook cancelled',
                                status: 1,
                                aborted: true,
                            }];
                    }
                    else {
                        errorMsg = (0, errors_js_1.errorMessage)(error_1);
                        errOutput = "Error occurred while executing hook command: ".concat(errorMsg);
                        return [2 /*return*/, {
                                stdout: '',
                                stderr: errOutput,
                                output: errOutput,
                                status: 1,
                            }];
                    }
                    return [3 /*break*/, 15];
                case 14:
                    if (shouldEmitDiag) {
                        (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'hook_spawn_completed', {
                            hook_event_name: hookEvent,
                            index: hookIndex,
                            duration_ms: Date.now() - diagStartMs,
                            exit_code: diagExitCode,
                            aborted: diagAborted,
                        });
                    }
                    stopProgressInterval();
                    // Clean up stream resources unless ownership was transferred (e.g., to async hook registry)
                    if (!shellCommandTransferred) {
                        shellCommand.cleanup();
                    }
                    return [7 /*endfinally*/];
                case 15: return [2 /*return*/];
            }
        });
    });
}
/**
 * Check if a match query matches a hook matcher pattern
 * @param matchQuery The query to match (e.g., 'Write', 'Edit', 'Bash')
 * @param matcher The matcher pattern - can be:
 *   - Simple string for exact match (e.g., 'Write')
 *   - Pipe-separated list for multiple exact matches (e.g., 'Write|Edit')
 *   - Regex pattern (e.g., '^Write.*', '.*', '^(Write|Edit)$')
 * @returns true if the query matches the pattern
 */
function matchesPattern(matchQuery, matcher) {
    if (!matcher || matcher === '*') {
        return true;
    }
    // Check if it's a simple string or pipe-separated list (no regex special chars except |)
    if (/^[a-zA-Z0-9_|]+$/.test(matcher)) {
        // Handle pipe-separated exact matches
        if (matcher.includes('|')) {
            var patterns = matcher
                .split('|')
                .map(function (p) { return (0, permissionRuleParser_js_1.normalizeLegacyToolName)(p.trim()); });
            return patterns.includes(matchQuery);
        }
        // Simple exact match
        return matchQuery === (0, permissionRuleParser_js_1.normalizeLegacyToolName)(matcher);
    }
    // Otherwise treat as regex
    try {
        var regex = new RegExp(matcher);
        if (regex.test(matchQuery)) {
            return true;
        }
        // Also test against legacy names so patterns like "^Task$" still match
        for (var _i = 0, _a = (0, permissionRuleParser_js_1.getLegacyToolNames)(matchQuery); _i < _a.length; _i++) {
            var legacyName = _a[_i];
            if (regex.test(legacyName)) {
                return true;
            }
        }
        return false;
    }
    catch (_b) {
        // If the regex is invalid, log error and return false
        (0, debug_js_1.logForDebugging)("Invalid regex pattern in hook matcher: ".concat(matcher));
        return false;
    }
}
/**
 * Prepare a matcher for hook `if` conditions. Expensive work (tool lookup,
 * Zod validation, tree-sitter parsing for Bash) happens once here; the
 * returned closure is called per hook. Returns undefined for non-tool events.
 */
function prepareIfConditionMatcher(hookInput, tools) {
    return __awaiter(this, void 0, void 0, function () {
        var toolName, tool, input, patternMatcher, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (hookInput.hook_event_name !== 'PreToolUse' &&
                        hookInput.hook_event_name !== 'PostToolUse' &&
                        hookInput.hook_event_name !== 'PostToolUseFailure' &&
                        hookInput.hook_event_name !== 'PermissionRequest') {
                        return [2 /*return*/, undefined];
                    }
                    toolName = (0, permissionRuleParser_js_1.normalizeLegacyToolName)(hookInput.tool_name);
                    tool = tools && (0, Tool_js_1.findToolByName)(tools, hookInput.tool_name);
                    input = tool === null || tool === void 0 ? void 0 : tool.inputSchema.safeParse(hookInput.tool_input);
                    if (!((input === null || input === void 0 ? void 0 : input.success) && (tool === null || tool === void 0 ? void 0 : tool.preparePermissionMatcher))) return [3 /*break*/, 2];
                    return [4 /*yield*/, tool.preparePermissionMatcher(input.data)];
                case 1:
                    _a = _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _a = undefined;
                    _b.label = 3;
                case 3:
                    patternMatcher = _a;
                    return [2 /*return*/, function (ifCondition) {
                            var parsed = (0, permissionRuleParser_js_1.permissionRuleValueFromString)(ifCondition);
                            if ((0, permissionRuleParser_js_1.normalizeLegacyToolName)(parsed.toolName) !== toolName) {
                                return false;
                            }
                            if (!parsed.ruleContent) {
                                return true;
                            }
                            return patternMatcher ? patternMatcher(parsed.ruleContent) : false;
                        }];
            }
        });
    });
}
function isInternalHook(matched) {
    return matched.hook.type === 'callback' && matched.hook.internal === true;
}
/**
 * Build a dedup key for a matched hook, namespaced by source context.
 *
 * Settings-file hooks (no pluginRoot/skillRoot) share the '' prefix so the
 * same command defined in user/project/local still collapses to one — the
 * original intent of the dedup. Plugin/skill hooks get their root as the
 * prefix, so two plugins sharing an unexpanded `${CLAUDE_PLUGIN_ROOT}/hook.sh`
 * template don't collapse: after expansion they point to different files.
 */
function hookDedupKey(m, payload) {
    var _a, _b;
    return "".concat((_b = (_a = m.pluginRoot) !== null && _a !== void 0 ? _a : m.skillRoot) !== null && _b !== void 0 ? _b : '', "\0").concat(payload);
}
/**
 * Build a map of {sanitizedPluginName: hookCount} from matched hooks.
 * Only logs actual names for official marketplace plugins; others become 'third-party'.
 */
function getPluginHookCounts(hooks) {
    var pluginHooks = hooks.filter(function (h) { return h.pluginId; });
    if (pluginHooks.length === 0) {
        return undefined;
    }
    var counts = {};
    for (var _i = 0, pluginHooks_1 = pluginHooks; _i < pluginHooks_1.length; _i++) {
        var h = pluginHooks_1[_i];
        var atIndex = h.pluginId.lastIndexOf('@');
        var isOfficial = atIndex > 0 &&
            schemas_js_1.ALLOWED_OFFICIAL_MARKETPLACE_NAMES.has(h.pluginId.slice(atIndex + 1));
        var key = isOfficial ? h.pluginId : 'third-party';
        counts[key] = (counts[key] || 0) + 1;
    }
    return counts;
}
/**
 * Build a map of {hookType: count} from matched hooks.
 */
function getHookTypeCounts(hooks) {
    var counts = {};
    for (var _i = 0, hooks_1 = hooks; _i < hooks_1.length; _i++) {
        var h = hooks_1[_i];
        counts[h.hook.type] = (counts[h.hook.type] || 0) + 1;
    }
    return counts;
}
function getHooksConfig(appState, sessionId, hookEvent) {
    var _a, _b, _c;
    // HookMatcher is a zod-stripped {matcher, hooks} so snapshot matchers can be
    // pushed directly without re-wrapping.
    var hooks = __spreadArray([], ((_b = (_a = (0, hooksConfigSnapshot_js_1.getHooksConfigFromSnapshot)()) === null || _a === void 0 ? void 0 : _a[hookEvent]) !== null && _b !== void 0 ? _b : []), true);
    // Check if only managed hooks should run (used for both registered and session hooks)
    var managedOnly = (0, hooksConfigSnapshot_js_1.shouldAllowManagedHooksOnly)();
    // Process registered hooks (SDK callbacks and plugin native hooks)
    var registeredHooks = (_c = (0, state_js_1.getRegisteredHooks)()) === null || _c === void 0 ? void 0 : _c[hookEvent];
    if (registeredHooks) {
        for (var _i = 0, registeredHooks_1 = registeredHooks; _i < registeredHooks_1.length; _i++) {
            var matcher = registeredHooks_1[_i];
            // Skip plugin hooks when restricted to managed hooks only
            // Plugin hooks have pluginRoot set, SDK callbacks do not
            if (managedOnly && 'pluginRoot' in matcher) {
                continue;
            }
            hooks.push(matcher);
        }
    }
    // Merge session hooks for the current session only
    // Function hooks (like structured output enforcement) must be scoped to their session
    // to prevent hooks from one agent leaking to another (e.g., verification agent to main agent)
    // Skip session hooks entirely when allowManagedHooksOnly is set —
    // this prevents frontmatter hooks from agents/skills from bypassing the policy.
    // strictPluginOnlyCustomization does NOT block here — it gates at the
    // REGISTRATION sites (runAgent.ts:526 for agent frontmatter hooks) where
    // agentDefinition.source is known. A blanket block here would also kill
    // plugin-provided agents' frontmatter hooks, which is too broad.
    // Also skip if appState not provided (for backwards compatibility)
    if (!managedOnly && appState !== undefined) {
        var sessionHooks = (0, sessionHooks_js_1.getSessionHooks)(appState, sessionId, hookEvent).get(hookEvent);
        if (sessionHooks) {
            // SessionDerivedHookMatcher already includes optional skillRoot
            for (var _d = 0, sessionHooks_1 = sessionHooks; _d < sessionHooks_1.length; _d++) {
                var matcher = sessionHooks_1[_d];
                hooks.push(matcher);
            }
        }
        // Merge session function hooks separately (can't be persisted to HookMatcher format)
        var sessionFunctionHooks = (0, sessionHooks_js_1.getSessionFunctionHooks)(appState, sessionId, hookEvent).get(hookEvent);
        if (sessionFunctionHooks) {
            for (var _e = 0, sessionFunctionHooks_1 = sessionFunctionHooks; _e < sessionFunctionHooks_1.length; _e++) {
                var matcher = sessionFunctionHooks_1[_e];
                hooks.push(matcher);
            }
        }
    }
    return hooks;
}
/**
 * Lightweight existence check for hooks on a given event. Mirrors the sources
 * assembled by getHooksConfig() but stops at the first hit without building
 * the full merged config.
 *
 * Intentionally over-approximates: returns true if any matcher exists for the
 * event, even if managed-only filtering or pattern matching would later
 * discard it. A false positive just means we proceed to the full matching
 * path; a false negative would skip a hook, so we err on the side of true.
 *
 * Used to skip createBaseHookInput (getTranscriptPathForSession path joins)
 * and getMatchingHooks on hot paths where hooks are typically unconfigured.
 * See hasInstructionsLoadedHook / hasWorktreeCreateHook for the same pattern.
 */
function hasHookForEvent(hookEvent, appState, sessionId) {
    var _a, _b, _c;
    var snap = (_a = (0, hooksConfigSnapshot_js_1.getHooksConfigFromSnapshot)()) === null || _a === void 0 ? void 0 : _a[hookEvent];
    if (snap && snap.length > 0)
        return true;
    var reg = (_b = (0, state_js_1.getRegisteredHooks)()) === null || _b === void 0 ? void 0 : _b[hookEvent];
    if (reg && reg.length > 0)
        return true;
    if ((_c = appState === null || appState === void 0 ? void 0 : appState.sessionHooks.get(sessionId)) === null || _c === void 0 ? void 0 : _c.hooks[hookEvent])
        return true;
    return false;
}
/**
 * Get hook commands that match the given query
 * @param appState The current app state (optional for backwards compatibility)
 * @param sessionId The current session ID (main session or agent ID)
 * @param hookEvent The hook event
 * @param hookInput The hook input for matching
 * @returns Array of matched hooks with optional plugin context
 */
function getMatchingHooks(appState, sessionId, hookEvent, hookInput, tools) {
    return __awaiter(this, void 0, void 0, function () {
        var hookMatchers, matchQuery_1, filteredMatchers, matchedHooks, getIfCondition_1, uniqueCommandHooks, uniquePromptHooks, uniqueAgentHooks, uniqueHttpHooks, callbackHooks, functionHooks, uniqueHooks, hasIfCondition, ifMatcher_1, _a, ifFilteredHooks, filteredHooks, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 4, , 5]);
                    hookMatchers = getHooksConfig(appState, sessionId, hookEvent);
                    matchQuery_1 = undefined;
                    switch (hookInput.hook_event_name) {
                        case 'PreToolUse':
                        case 'PostToolUse':
                        case 'PostToolUseFailure':
                        case 'PermissionRequest':
                        case 'PermissionDenied':
                            matchQuery_1 = hookInput.tool_name;
                            break;
                        case 'SessionStart':
                            matchQuery_1 = hookInput.source;
                            break;
                        case 'Setup':
                            matchQuery_1 = hookInput.trigger;
                            break;
                        case 'PreCompact':
                        case 'PostCompact':
                            matchQuery_1 = hookInput.trigger;
                            break;
                        case 'Notification':
                            matchQuery_1 = hookInput.notification_type;
                            break;
                        case 'SessionEnd':
                            matchQuery_1 = hookInput.reason;
                            break;
                        case 'StopFailure':
                            matchQuery_1 = hookInput.error;
                            break;
                        case 'SubagentStart':
                            matchQuery_1 = hookInput.agent_type;
                            break;
                        case 'SubagentStop':
                            matchQuery_1 = hookInput.agent_type;
                            break;
                        case 'TeammateIdle':
                        case 'TaskCreated':
                        case 'TaskCompleted':
                            break;
                        case 'Elicitation':
                            matchQuery_1 = hookInput.mcp_server_name;
                            break;
                        case 'ElicitationResult':
                            matchQuery_1 = hookInput.mcp_server_name;
                            break;
                        case 'ConfigChange':
                            matchQuery_1 = hookInput.source;
                            break;
                        case 'InstructionsLoaded':
                            matchQuery_1 = hookInput.load_reason;
                            break;
                        case 'FileChanged':
                            matchQuery_1 = (0, path_1.basename)(hookInput.file_path);
                            break;
                        default:
                            break;
                    }
                    (0, debug_js_1.logForDebugging)("Getting matching hook commands for ".concat(hookEvent, " with query: ").concat(matchQuery_1), { level: 'verbose' });
                    (0, debug_js_1.logForDebugging)("Found ".concat(hookMatchers.length, " hook matchers in settings"), {
                        level: 'verbose',
                    });
                    filteredMatchers = matchQuery_1
                        ? hookMatchers.filter(function (matcher) {
                            return !matcher.matcher || matchesPattern(matchQuery_1, matcher.matcher);
                        })
                        : hookMatchers;
                    matchedHooks = filteredMatchers.flatMap(function (matcher) {
                        // Check if this is a PluginHookMatcher (has pluginRoot) or SkillHookMatcher (has skillRoot)
                        var pluginRoot = 'pluginRoot' in matcher ? matcher.pluginRoot : undefined;
                        var pluginId = 'pluginId' in matcher ? matcher.pluginId : undefined;
                        var skillRoot = 'skillRoot' in matcher ? matcher.skillRoot : undefined;
                        var hookSource = pluginRoot
                            ? 'pluginName' in matcher
                                ? "plugin:".concat(matcher.pluginName)
                                : 'plugin'
                            : skillRoot
                                ? 'skillName' in matcher
                                    ? "skill:".concat(matcher.skillName)
                                    : 'skill'
                                : 'settings';
                        return matcher.hooks.map(function (hook) { return ({
                            hook: hook,
                            pluginRoot: pluginRoot,
                            pluginId: pluginId,
                            skillRoot: skillRoot,
                            hookSource: hookSource,
                        }); });
                    });
                    // Deduplicate hooks by command/prompt/url within the same source context.
                    // Key is namespaced by pluginRoot/skillRoot (see hookDedupKey above) so
                    // cross-plugin template collisions don't drop hooks (gh-29724).
                    //
                    // Note: new Map(entries) keeps the LAST entry on key collision, not first.
                    // For settings hooks this means the last-merged scope wins; for
                    // same-plugin duplicates the pluginRoot is identical so it doesn't matter.
                    // Fast-path: callback/function hooks don't need dedup (each is unique).
                    // Skip the 6-pass filter + 4×Map + 4×Array.from below when all hooks are
                    // callback/function — the common case for internal hooks like
                    // sessionFileAccessHooks/attributionHooks (44x faster in microbench).
                    if (matchedHooks.every(function (m) { return m.hook.type === 'callback' || m.hook.type === 'function'; })) {
                        return [2 /*return*/, matchedHooks];
                    }
                    getIfCondition_1 = function (hook) { var _a; return (_a = hook.if) !== null && _a !== void 0 ? _a : ''; };
                    uniqueCommandHooks = Array.from(new Map(matchedHooks
                        .filter(function (m) {
                        return m.hook.type === 'command';
                    })
                        // shell is part of identity: {command:'echo x', shell:'bash'}
                        // and {command:'echo x', shell:'powershell'} are distinct hooks,
                        // not duplicates. Default to 'bash' so legacy configs (no shell
                        // field) still dedup against explicit shell:'bash'.
                        .map(function (m) {
                        var _a;
                        return [
                            hookDedupKey(m, "".concat((_a = m.hook.shell) !== null && _a !== void 0 ? _a : shellProvider_js_1.DEFAULT_HOOK_SHELL, "\0").concat(m.hook.command, "\0").concat(getIfCondition_1(m.hook))),
                            m,
                        ];
                    })).values());
                    uniquePromptHooks = Array.from(new Map(matchedHooks
                        .filter(function (m) { return m.hook.type === 'prompt'; })
                        .map(function (m) { return [
                        hookDedupKey(m, "".concat(m.hook.prompt, "\0").concat(getIfCondition_1(m.hook))),
                        m,
                    ]; })).values());
                    uniqueAgentHooks = Array.from(new Map(matchedHooks
                        .filter(function (m) { return m.hook.type === 'agent'; })
                        .map(function (m) { return [
                        hookDedupKey(m, "".concat(m.hook.prompt, "\0").concat(getIfCondition_1(m.hook))),
                        m,
                    ]; })).values());
                    uniqueHttpHooks = Array.from(new Map(matchedHooks
                        .filter(function (m) { return m.hook.type === 'http'; })
                        .map(function (m) { return [
                        hookDedupKey(m, "".concat(m.hook.url, "\0").concat(getIfCondition_1(m.hook))),
                        m,
                    ]; })).values());
                    callbackHooks = matchedHooks.filter(function (m) { return m.hook.type === 'callback'; });
                    functionHooks = matchedHooks.filter(function (m) { return m.hook.type === 'function'; });
                    uniqueHooks = __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], uniqueCommandHooks, true), uniquePromptHooks, true), uniqueAgentHooks, true), uniqueHttpHooks, true), callbackHooks, true), functionHooks, true);
                    hasIfCondition = uniqueHooks.some(function (h) {
                        return (h.hook.type === 'command' ||
                            h.hook.type === 'prompt' ||
                            h.hook.type === 'agent' ||
                            h.hook.type === 'http') &&
                            h.hook.if;
                    });
                    if (!hasIfCondition) return [3 /*break*/, 2];
                    return [4 /*yield*/, prepareIfConditionMatcher(hookInput, tools)];
                case 1:
                    _a = _c.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _a = undefined;
                    _c.label = 3;
                case 3:
                    ifMatcher_1 = _a;
                    ifFilteredHooks = uniqueHooks.filter(function (h) {
                        if (h.hook.type !== 'command' &&
                            h.hook.type !== 'prompt' &&
                            h.hook.type !== 'agent' &&
                            h.hook.type !== 'http') {
                            return true;
                        }
                        var ifCondition = h.hook.if;
                        if (!ifCondition) {
                            return true;
                        }
                        if (!ifMatcher_1) {
                            (0, debug_js_1.logForDebugging)("Hook if condition \"".concat(ifCondition, "\" cannot be evaluated for non-tool event ").concat(hookInput.hook_event_name));
                            return false;
                        }
                        if (ifMatcher_1(ifCondition)) {
                            return true;
                        }
                        (0, debug_js_1.logForDebugging)("Skipping hook due to if condition \"".concat(ifCondition, "\" not matching"));
                        return false;
                    });
                    filteredHooks = hookEvent === 'SessionStart' || hookEvent === 'Setup'
                        ? ifFilteredHooks.filter(function (h) {
                            if (h.hook.type === 'http') {
                                (0, debug_js_1.logForDebugging)("Skipping HTTP hook ".concat(h.hook.url, " \u2014 HTTP hooks are not supported for ").concat(hookEvent));
                                return false;
                            }
                            return true;
                        })
                        : ifFilteredHooks;
                    (0, debug_js_1.logForDebugging)("Matched ".concat(filteredHooks.length, " unique hooks for query \"").concat(matchQuery_1 || 'no match query', "\" (").concat(matchedHooks.length, " before deduplication)"), { level: 'verbose' });
                    return [2 /*return*/, filteredHooks];
                case 4:
                    _b = _c.sent();
                    return [2 /*return*/, []];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Format a list of blocking errors from a PreTool hook's configured commands.
 * @param hookName The name of the hook (e.g., 'PreToolUse:Write', 'PreToolUse:Edit', 'PreToolUse:Bash')
 * @param blockingErrors Array of blocking errors from hooks
 * @returns Formatted blocking message
 */
function getPreToolHookBlockingMessage(hookName, blockingError) {
    return "".concat(hookName, " hook error: ").concat(blockingError.blockingError);
}
/**
 * Format a list of blocking errors from a Stop hook's configured commands.
 * @param blockingErrors Array of blocking errors from hooks
 * @returns Formatted message to give feedback to the model
 */
function getStopHookMessage(blockingError) {
    return "Stop hook feedback:\n".concat(blockingError.blockingError);
}
/**
 * Format a blocking error from a TeammateIdle hook.
 * @param blockingError The blocking error from the hook
 * @returns Formatted message to give feedback to the model
 */
function getTeammateIdleHookMessage(blockingError) {
    return "TeammateIdle hook feedback:\n".concat(blockingError.blockingError);
}
/**
 * Format a blocking error from a TaskCreated hook.
 * @param blockingError The blocking error from the hook
 * @returns Formatted message to give feedback to the model
 */
function getTaskCreatedHookMessage(blockingError) {
    return "TaskCreated hook feedback:\n".concat(blockingError.blockingError);
}
/**
 * Format a blocking error from a TaskCompleted hook.
 * @param blockingError The blocking error from the hook
 * @returns Formatted message to give feedback to the model
 */
function getTaskCompletedHookMessage(blockingError) {
    return "TaskCompleted hook feedback:\n".concat(blockingError.blockingError);
}
/**
 * Format a list of blocking errors from a UserPromptSubmit hook's configured commands.
 * @param blockingErrors Array of blocking errors from hooks
 * @returns Formatted blocking message
 */
function getUserPromptSubmitHookBlockingMessage(blockingError) {
    return "UserPromptSubmit operation blocked by hook:\n".concat(blockingError.blockingError);
}
/**
 * Common logic for executing hooks
 * @param hookInput The structured hook input that will be validated and converted to JSON
 * @param toolUseID The ID for tracking this hook execution
 * @param matchQuery The query to match against hook matchers
 * @param signal Optional AbortSignal to cancel hook execution
 * @param timeoutMs Optional timeout in milliseconds for hook execution
 * @param toolUseContext Optional ToolUseContext for prompt-based hooks (required if using prompt hooks)
 * @param messages Optional conversation history for prompt/function hooks
 * @returns Async generator that yields progress messages and hook results
 */
function executeHooks(_a) {
    return __asyncGenerator(this, arguments, function executeHooks_1(_b) {
        function getJsonInput() {
            if (jsonInputResult !== undefined) {
                return jsonInputResult;
            }
            try {
                return (jsonInputResult = { ok: true, value: (0, slowOperations_js_1.jsonStringify)(hookInput) });
            }
            catch (error) {
                (0, log_js_1.logError)(Error("Failed to stringify hook ".concat(hookName, " input"), { cause: error }));
                return (jsonInputResult = { ok: false, error: error });
            }
        }
        var hookEvent, hookName, boundRequestPrompt, appState, sessionId, matchingHooks, userHooks, pluginHookCounts, hookTypeCounts, batchStartTime_1, context, _i, _c, _d, i, hook, totalDurationMs_1, hookDefinitionsJson, hookSpan, _e, matchingHooks_1, hook, batchStartTime, jsonInputResult, hookPromises, outcomes, permissionBehavior, _loop_2, _f, _g, _h, e_1_1, totalDurationMs, hookDefinitionsComplete;
        var _j, e_1, _k, _l;
        var _m, _o, _p, _q, _r;
        var hookInput = _b.hookInput, toolUseID = _b.toolUseID, matchQuery = _b.matchQuery, signal = _b.signal, _s = _b.timeoutMs, timeoutMs = _s === void 0 ? TOOL_HOOK_EXECUTION_TIMEOUT_MS : _s, toolUseContext = _b.toolUseContext, messages = _b.messages, forceSyncExecution = _b.forceSyncExecution, requestPrompt = _b.requestPrompt, toolInputSummary = _b.toolInputSummary;
        return __generator(this, function (_t) {
            switch (_t.label) {
                case 0:
                    if (!(0, hooksConfigSnapshot_js_1.shouldDisableAllHooksIncludingManaged)()) return [3 /*break*/, 2];
                    return [4 /*yield*/, __await(void 0)];
                case 1: return [2 /*return*/, _t.sent()];
                case 2:
                    if (!(0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_SIMPLE)) return [3 /*break*/, 4];
                    return [4 /*yield*/, __await(void 0)];
                case 3: return [2 /*return*/, _t.sent()];
                case 4:
                    hookEvent = hookInput.hook_event_name;
                    hookName = matchQuery ? "".concat(hookEvent, ":").concat(matchQuery) : hookEvent;
                    boundRequestPrompt = requestPrompt === null || requestPrompt === void 0 ? void 0 : requestPrompt(hookName, toolInputSummary);
                    if (!shouldSkipHookDueToTrust()) return [3 /*break*/, 6];
                    (0, debug_js_1.logForDebugging)("Skipping ".concat(hookName, " hook execution - workspace trust not accepted"));
                    return [4 /*yield*/, __await(void 0)];
                case 5: return [2 /*return*/, _t.sent()];
                case 6:
                    appState = toolUseContext ? toolUseContext.getAppState() : undefined;
                    sessionId = (_m = toolUseContext === null || toolUseContext === void 0 ? void 0 : toolUseContext.agentId) !== null && _m !== void 0 ? _m : (0, state_js_1.getSessionId)();
                    return [4 /*yield*/, __await(getMatchingHooks(appState, sessionId, hookEvent, hookInput, (_o = toolUseContext === null || toolUseContext === void 0 ? void 0 : toolUseContext.options) === null || _o === void 0 ? void 0 : _o.tools))];
                case 7:
                    matchingHooks = _t.sent();
                    if (!(matchingHooks.length === 0)) return [3 /*break*/, 9];
                    return [4 /*yield*/, __await(void 0)];
                case 8: return [2 /*return*/, _t.sent()];
                case 9:
                    if (!(signal === null || signal === void 0 ? void 0 : signal.aborted)) return [3 /*break*/, 11];
                    return [4 /*yield*/, __await(void 0)];
                case 10: return [2 /*return*/, _t.sent()];
                case 11:
                    userHooks = matchingHooks.filter(function (h) { return !isInternalHook(h); });
                    if (!(userHooks.length > 0)) return [3 /*break*/, 12];
                    pluginHookCounts = getPluginHookCounts(userHooks);
                    hookTypeCounts = getHookTypeCounts(userHooks);
                    (0, index_js_1.logEvent)("tengu_run_hook", __assign({ hookName: hookName, numCommands: userHooks.length, hookTypeCounts: (0, slowOperations_js_1.jsonStringify)(hookTypeCounts) }, (pluginHookCounts && {
                        pluginHookCounts: (0, slowOperations_js_1.jsonStringify)(pluginHookCounts),
                    })));
                    return [3 /*break*/, 18];
                case 12:
                    batchStartTime_1 = Date.now();
                    context = toolUseContext
                        ? {
                            getAppState: toolUseContext.getAppState,
                            updateAttributionState: toolUseContext.updateAttributionState,
                        }
                        : undefined;
                    _i = 0, _c = matchingHooks.entries();
                    _t.label = 13;
                case 13:
                    if (!(_i < _c.length)) return [3 /*break*/, 16];
                    _d = _c[_i], i = _d[0], hook = _d[1].hook;
                    if (!(hook.type === 'callback')) return [3 /*break*/, 15];
                    return [4 /*yield*/, __await(hook.callback(hookInput, toolUseID, signal, i, context))];
                case 14:
                    _t.sent();
                    _t.label = 15;
                case 15:
                    _i++;
                    return [3 /*break*/, 13];
                case 16:
                    totalDurationMs_1 = Date.now() - batchStartTime_1;
                    (_p = (0, state_js_1.getStatsStore)()) === null || _p === void 0 ? void 0 : _p.observe('hook_duration_ms', totalDurationMs_1);
                    (0, state_js_1.addToTurnHookDuration)(totalDurationMs_1);
                    (0, index_js_1.logEvent)("tengu_repl_hook_finished", {
                        hookName: hookName,
                        numCommands: matchingHooks.length,
                        numSuccess: matchingHooks.length,
                        numBlocking: 0,
                        numNonBlockingError: 0,
                        numCancelled: 0,
                        totalDurationMs: totalDurationMs_1,
                    });
                    return [4 /*yield*/, __await(void 0)];
                case 17: return [2 /*return*/, _t.sent()];
                case 18:
                    hookDefinitionsJson = (0, sessionTracing_js_1.isBetaTracingEnabled)()
                        ? (0, slowOperations_js_1.jsonStringify)(getHookDefinitionsForTelemetry(matchingHooks))
                        : '[]';
                    // Log hook execution start to OTEL (only for beta tracing)
                    if ((0, sessionTracing_js_1.isBetaTracingEnabled)()) {
                        void (0, events_js_1.logOTelEvent)('hook_execution_start', {
                            hook_event: hookEvent,
                            hook_name: hookName,
                            num_hooks: String(matchingHooks.length),
                            managed_only: String((0, hooksConfigSnapshot_js_1.shouldAllowManagedHooksOnly)()),
                            hook_definitions: hookDefinitionsJson,
                            hook_source: (0, hooksConfigSnapshot_js_1.shouldAllowManagedHooksOnly)() ? 'policySettings' : 'merged',
                        });
                    }
                    hookSpan = (0, sessionTracing_js_1.startHookSpan)(hookEvent, hookName, matchingHooks.length, hookDefinitionsJson);
                    _e = 0, matchingHooks_1 = matchingHooks;
                    _t.label = 19;
                case 19:
                    if (!(_e < matchingHooks_1.length)) return [3 /*break*/, 23];
                    hook = matchingHooks_1[_e].hook;
                    return [4 /*yield*/, __await({
                            message: {
                                type: 'progress',
                                data: __assign(__assign({ type: 'hook_progress', hookEvent: hookEvent, hookName: hookName, command: (0, hooksSettings_js_1.getHookDisplayText)(hook) }, (hook.type === 'prompt' && { promptText: hook.prompt })), ('statusMessage' in hook &&
                                    hook.statusMessage != null && {
                                    statusMessage: hook.statusMessage,
                                })),
                                parentToolUseID: toolUseID,
                                toolUseID: toolUseID,
                                timestamp: new Date().toISOString(),
                                uuid: (0, crypto_1.randomUUID)(),
                            },
                        })];
                case 20: return [4 /*yield*/, _t.sent()];
                case 21:
                    _t.sent();
                    _t.label = 22;
                case 22:
                    _e++;
                    return [3 /*break*/, 19];
                case 23:
                    batchStartTime = Date.now();
                    hookPromises = matchingHooks.map(function (_a, hookIndex_1) {
                        return __asyncGenerator(this, arguments, function (_b, hookIndex) {
                            var callbackTimeoutMs, _c, abortSignal_1, cleanup_1, commandTimeoutMs, _d, abortSignal, cleanup, hookId, hookStartMs, hookCommand, jsonInputRes, jsonInput, promptResult, att, agentResult, att, httpResult, stderr, _e, httpJson, httpValidationError, processed, result, durationMs, _f, json, plainText, validationError, processed, content, error_2, errorMessage_2;
                            var _g, _h, _j, _k;
                            var hook = _b.hook, pluginRoot = _b.pluginRoot, pluginId = _b.pluginId, skillRoot = _b.skillRoot;
                            return __generator(this, function (_l) {
                                switch (_l.label) {
                                    case 0:
                                        if (!(hook.type === 'callback')) return [3 /*break*/, 4];
                                        callbackTimeoutMs = hook.timeout ? hook.timeout * 1000 : timeoutMs;
                                        _c = (0, combinedAbortSignal_js_1.createCombinedAbortSignal)(signal, { timeoutMs: callbackTimeoutMs }), abortSignal_1 = _c.signal, cleanup_1 = _c.cleanup;
                                        return [4 /*yield*/, __await(executeHookCallback({
                                                toolUseID: toolUseID,
                                                hook: hook,
                                                hookEvent: hookEvent,
                                                hookInput: hookInput,
                                                signal: abortSignal_1,
                                                hookIndex: hookIndex,
                                                toolUseContext: toolUseContext,
                                            }).finally(cleanup_1))];
                                    case 1: return [4 /*yield*/, _l.sent()];
                                    case 2:
                                        _l.sent();
                                        return [4 /*yield*/, __await(void 0)];
                                    case 3: return [2 /*return*/, _l.sent()];
                                    case 4:
                                        if (!(hook.type === 'function')) return [3 /*break*/, 12];
                                        if (!!messages) return [3 /*break*/, 8];
                                        return [4 /*yield*/, __await({
                                                message: (0, attachments_js_1.createAttachmentMessage)({
                                                    type: 'hook_error_during_execution',
                                                    hookName: hookName,
                                                    toolUseID: toolUseID,
                                                    hookEvent: hookEvent,
                                                    content: 'Messages not provided for function hook',
                                                }),
                                                outcome: 'non_blocking_error',
                                                hook: hook,
                                            })];
                                    case 5: return [4 /*yield*/, _l.sent()];
                                    case 6:
                                        _l.sent();
                                        return [4 /*yield*/, __await(void 0)];
                                    case 7: return [2 /*return*/, _l.sent()];
                                    case 8: return [4 /*yield*/, __await(executeFunctionHook({
                                            hook: hook,
                                            messages: messages,
                                            hookName: hookName,
                                            toolUseID: toolUseID,
                                            hookEvent: hookEvent,
                                            timeoutMs: timeoutMs,
                                            signal: signal,
                                        }))];
                                    case 9: 
                                    // Function hooks only come from session storage with callback embedded
                                    return [4 /*yield*/, _l.sent()];
                                    case 10:
                                        // Function hooks only come from session storage with callback embedded
                                        _l.sent();
                                        return [4 /*yield*/, __await(void 0)];
                                    case 11: return [2 /*return*/, _l.sent()];
                                    case 12:
                                        commandTimeoutMs = hook.timeout ? hook.timeout * 1000 : timeoutMs;
                                        _d = (0, combinedAbortSignal_js_1.createCombinedAbortSignal)(signal, {
                                            timeoutMs: commandTimeoutMs,
                                        }), abortSignal = _d.signal, cleanup = _d.cleanup;
                                        hookId = (0, crypto_1.randomUUID)();
                                        hookStartMs = Date.now();
                                        hookCommand = (0, hooksSettings_js_1.getHookDisplayText)(hook);
                                        _l.label = 13;
                                    case 13:
                                        _l.trys.push([13, 87, , 91]);
                                        jsonInputRes = getJsonInput();
                                        if (!!jsonInputRes.ok) return [3 /*break*/, 17];
                                        return [4 /*yield*/, __await({
                                                message: (0, attachments_js_1.createAttachmentMessage)({
                                                    type: 'hook_error_during_execution',
                                                    hookName: hookName,
                                                    toolUseID: toolUseID,
                                                    hookEvent: hookEvent,
                                                    content: "Failed to prepare hook input: ".concat((0, errors_js_1.errorMessage)(jsonInputRes.error)),
                                                    command: hookCommand,
                                                    durationMs: Date.now() - hookStartMs,
                                                }),
                                                outcome: 'non_blocking_error',
                                                hook: hook,
                                            })];
                                    case 14: return [4 /*yield*/, _l.sent()];
                                    case 15:
                                        _l.sent();
                                        cleanup();
                                        return [4 /*yield*/, __await(void 0)];
                                    case 16: return [2 /*return*/, _l.sent()];
                                    case 17:
                                        jsonInput = jsonInputRes.value;
                                        if (!(hook.type === 'prompt')) return [3 /*break*/, 22];
                                        if (!toolUseContext) {
                                            throw new Error('ToolUseContext is required for prompt hooks. This is a bug.');
                                        }
                                        return [4 /*yield*/, __await((0, execPromptHook_js_1.execPromptHook)(hook, hookName, hookEvent, jsonInput, abortSignal, toolUseContext, messages, toolUseID)
                                            // Inject timing fields for hook visibility
                                            )];
                                    case 18:
                                        promptResult = _l.sent();
                                        // Inject timing fields for hook visibility
                                        if (((_g = promptResult.message) === null || _g === void 0 ? void 0 : _g.type) === 'attachment') {
                                            att = promptResult.message.attachment;
                                            if (att.type === 'hook_success' ||
                                                att.type === 'hook_non_blocking_error') {
                                                att.command = hookCommand;
                                                att.durationMs = Date.now() - hookStartMs;
                                            }
                                        }
                                        return [4 /*yield*/, __await(promptResult)];
                                    case 19: return [4 /*yield*/, _l.sent()];
                                    case 20:
                                        _l.sent();
                                        cleanup === null || cleanup === void 0 ? void 0 : cleanup();
                                        return [4 /*yield*/, __await(void 0)];
                                    case 21: return [2 /*return*/, _l.sent()];
                                    case 22:
                                        if (!(hook.type === 'agent')) return [3 /*break*/, 27];
                                        if (!toolUseContext) {
                                            throw new Error('ToolUseContext is required for agent hooks. This is a bug.');
                                        }
                                        if (!messages) {
                                            throw new Error('Messages are required for agent hooks. This is a bug.');
                                        }
                                        return [4 /*yield*/, __await((0, execAgentHook_js_1.execAgentHook)(hook, hookName, hookEvent, jsonInput, abortSignal, toolUseContext, toolUseID, messages, 'agent_type' in hookInput
                                                ? hookInput.agent_type
                                                : undefined)
                                            // Inject timing fields for hook visibility
                                            )];
                                    case 23:
                                        agentResult = _l.sent();
                                        // Inject timing fields for hook visibility
                                        if (((_h = agentResult.message) === null || _h === void 0 ? void 0 : _h.type) === 'attachment') {
                                            att = agentResult.message.attachment;
                                            if (att.type === 'hook_success' ||
                                                att.type === 'hook_non_blocking_error') {
                                                att.command = hookCommand;
                                                att.durationMs = Date.now() - hookStartMs;
                                            }
                                        }
                                        return [4 /*yield*/, __await(agentResult)];
                                    case 24: return [4 /*yield*/, _l.sent()];
                                    case 25:
                                        _l.sent();
                                        cleanup === null || cleanup === void 0 ? void 0 : cleanup();
                                        return [4 /*yield*/, __await(void 0)];
                                    case 26: return [2 /*return*/, _l.sent()];
                                    case 27:
                                        if (!(hook.type === 'http')) return [3 /*break*/, 50];
                                        (0, hookEvents_js_1.emitHookStarted)(hookId, hookName, hookEvent);
                                        return [4 /*yield*/, __await((0, execHttpHook_js_1.execHttpHook)(hook, hookEvent, jsonInput, signal))];
                                    case 28:
                                        httpResult = _l.sent();
                                        cleanup === null || cleanup === void 0 ? void 0 : cleanup();
                                        if (!httpResult.aborted) return [3 /*break*/, 32];
                                        (0, hookEvents_js_1.emitHookResponse)({
                                            hookId: hookId,
                                            hookName: hookName,
                                            hookEvent: hookEvent,
                                            output: 'Hook cancelled',
                                            stdout: '',
                                            stderr: '',
                                            exitCode: undefined,
                                            outcome: 'cancelled',
                                        });
                                        return [4 /*yield*/, __await({
                                                message: (0, attachments_js_1.createAttachmentMessage)({
                                                    type: 'hook_cancelled',
                                                    hookName: hookName,
                                                    toolUseID: toolUseID,
                                                    hookEvent: hookEvent,
                                                }),
                                                outcome: 'cancelled',
                                                hook: hook,
                                            })];
                                    case 29: return [4 /*yield*/, _l.sent()];
                                    case 30:
                                        _l.sent();
                                        return [4 /*yield*/, __await(void 0)];
                                    case 31: return [2 /*return*/, _l.sent()];
                                    case 32:
                                        if (!(httpResult.error || !httpResult.ok)) return [3 /*break*/, 36];
                                        stderr = httpResult.error || "HTTP ".concat(httpResult.statusCode, " from ").concat(hook.url);
                                        (0, hookEvents_js_1.emitHookResponse)({
                                            hookId: hookId,
                                            hookName: hookName,
                                            hookEvent: hookEvent,
                                            output: stderr,
                                            stdout: '',
                                            stderr: stderr,
                                            exitCode: httpResult.statusCode,
                                            outcome: 'error',
                                        });
                                        return [4 /*yield*/, __await({
                                                message: (0, attachments_js_1.createAttachmentMessage)({
                                                    type: 'hook_non_blocking_error',
                                                    hookName: hookName,
                                                    toolUseID: toolUseID,
                                                    hookEvent: hookEvent,
                                                    stderr: stderr,
                                                    stdout: '',
                                                    exitCode: (_j = httpResult.statusCode) !== null && _j !== void 0 ? _j : 0,
                                                }),
                                                outcome: 'non_blocking_error',
                                                hook: hook,
                                            })];
                                    case 33: return [4 /*yield*/, _l.sent()];
                                    case 34:
                                        _l.sent();
                                        return [4 /*yield*/, __await(void 0)];
                                    case 35: return [2 /*return*/, _l.sent()];
                                    case 36:
                                        _e = parseHttpHookOutput(httpResult.body), httpJson = _e.json, httpValidationError = _e.validationError;
                                        if (!httpValidationError) return [3 /*break*/, 40];
                                        (0, hookEvents_js_1.emitHookResponse)({
                                            hookId: hookId,
                                            hookName: hookName,
                                            hookEvent: hookEvent,
                                            output: httpResult.body,
                                            stdout: httpResult.body,
                                            stderr: "JSON validation failed: ".concat(httpValidationError),
                                            exitCode: httpResult.statusCode,
                                            outcome: 'error',
                                        });
                                        return [4 /*yield*/, __await({
                                                message: (0, attachments_js_1.createAttachmentMessage)({
                                                    type: 'hook_non_blocking_error',
                                                    hookName: hookName,
                                                    toolUseID: toolUseID,
                                                    hookEvent: hookEvent,
                                                    stderr: "JSON validation failed: ".concat(httpValidationError),
                                                    stdout: httpResult.body,
                                                    exitCode: (_k = httpResult.statusCode) !== null && _k !== void 0 ? _k : 0,
                                                }),
                                                outcome: 'non_blocking_error',
                                                hook: hook,
                                            })];
                                    case 37: return [4 /*yield*/, _l.sent()];
                                    case 38:
                                        _l.sent();
                                        return [4 /*yield*/, __await(void 0)];
                                    case 39: return [2 /*return*/, _l.sent()];
                                    case 40:
                                        if (!(httpJson && (0, hooks_js_1.isAsyncHookJSONOutput)(httpJson))) return [3 /*break*/, 44];
                                        // Async response: treat as success (no further processing)
                                        (0, hookEvents_js_1.emitHookResponse)({
                                            hookId: hookId,
                                            hookName: hookName,
                                            hookEvent: hookEvent,
                                            output: httpResult.body,
                                            stdout: httpResult.body,
                                            stderr: '',
                                            exitCode: httpResult.statusCode,
                                            outcome: 'success',
                                        });
                                        return [4 /*yield*/, __await({
                                                outcome: 'success',
                                                hook: hook,
                                            })];
                                    case 41: return [4 /*yield*/, _l.sent()];
                                    case 42:
                                        _l.sent();
                                        return [4 /*yield*/, __await(void 0)];
                                    case 43: return [2 /*return*/, _l.sent()];
                                    case 44:
                                        if (!httpJson) return [3 /*break*/, 48];
                                        processed = processHookJSONOutput({
                                            json: httpJson,
                                            command: hook.url,
                                            hookName: hookName,
                                            toolUseID: toolUseID,
                                            hookEvent: hookEvent,
                                            expectedHookEvent: hookEvent,
                                            stdout: httpResult.body,
                                            stderr: '',
                                            exitCode: httpResult.statusCode,
                                        });
                                        (0, hookEvents_js_1.emitHookResponse)({
                                            hookId: hookId,
                                            hookName: hookName,
                                            hookEvent: hookEvent,
                                            output: httpResult.body,
                                            stdout: httpResult.body,
                                            stderr: '',
                                            exitCode: httpResult.statusCode,
                                            outcome: 'success',
                                        });
                                        return [4 /*yield*/, __await(__assign(__assign({}, processed), { outcome: 'success', hook: hook }))];
                                    case 45: return [4 /*yield*/, _l.sent()];
                                    case 46:
                                        _l.sent();
                                        return [4 /*yield*/, __await(void 0)];
                                    case 47: return [2 /*return*/, _l.sent()];
                                    case 48: return [4 /*yield*/, __await(void 0)];
                                    case 49: return [2 /*return*/, _l.sent()];
                                    case 50:
                                        (0, hookEvents_js_1.emitHookStarted)(hookId, hookName, hookEvent);
                                        return [4 /*yield*/, __await(execCommandHook(hook, hookEvent, hookName, jsonInput, abortSignal, hookId, hookIndex, pluginRoot, pluginId, skillRoot, forceSyncExecution, boundRequestPrompt))];
                                    case 51:
                                        result = _l.sent();
                                        cleanup === null || cleanup === void 0 ? void 0 : cleanup();
                                        durationMs = Date.now() - hookStartMs;
                                        if (!result.backgrounded) return [3 /*break*/, 55];
                                        return [4 /*yield*/, __await({
                                                outcome: 'success',
                                                hook: hook,
                                            })];
                                    case 52: return [4 /*yield*/, _l.sent()];
                                    case 53:
                                        _l.sent();
                                        return [4 /*yield*/, __await(void 0)];
                                    case 54: return [2 /*return*/, _l.sent()];
                                    case 55:
                                        if (!result.aborted) return [3 /*break*/, 59];
                                        (0, hookEvents_js_1.emitHookResponse)({
                                            hookId: hookId,
                                            hookName: hookName,
                                            hookEvent: hookEvent,
                                            output: result.output,
                                            stdout: result.stdout,
                                            stderr: result.stderr,
                                            exitCode: result.status,
                                            outcome: 'cancelled',
                                        });
                                        return [4 /*yield*/, __await({
                                                message: (0, attachments_js_1.createAttachmentMessage)({
                                                    type: 'hook_cancelled',
                                                    hookName: hookName,
                                                    toolUseID: toolUseID,
                                                    hookEvent: hookEvent,
                                                    command: hookCommand,
                                                    durationMs: durationMs,
                                                }),
                                                outcome: 'cancelled',
                                                hook: hook,
                                            })];
                                    case 56: return [4 /*yield*/, _l.sent()];
                                    case 57:
                                        _l.sent();
                                        return [4 /*yield*/, __await(void 0)];
                                    case 58: return [2 /*return*/, _l.sent()];
                                    case 59:
                                        _f = parseHookOutput(result.stdout), json = _f.json, plainText = _f.plainText, validationError = _f.validationError;
                                        if (!validationError) return [3 /*break*/, 63];
                                        (0, hookEvents_js_1.emitHookResponse)({
                                            hookId: hookId,
                                            hookName: hookName,
                                            hookEvent: hookEvent,
                                            output: result.output,
                                            stdout: result.stdout,
                                            stderr: "JSON validation failed: ".concat(validationError),
                                            exitCode: 1,
                                            outcome: 'error',
                                        });
                                        return [4 /*yield*/, __await({
                                                message: (0, attachments_js_1.createAttachmentMessage)({
                                                    type: 'hook_non_blocking_error',
                                                    hookName: hookName,
                                                    toolUseID: toolUseID,
                                                    hookEvent: hookEvent,
                                                    stderr: "JSON validation failed: ".concat(validationError),
                                                    stdout: result.stdout,
                                                    exitCode: 1,
                                                    command: hookCommand,
                                                    durationMs: durationMs,
                                                }),
                                                outcome: 'non_blocking_error',
                                                hook: hook,
                                            })];
                                    case 60: return [4 /*yield*/, _l.sent()];
                                    case 61:
                                        _l.sent();
                                        return [4 /*yield*/, __await(void 0)];
                                    case 62: return [2 /*return*/, _l.sent()];
                                    case 63:
                                        if (!json) return [3 /*break*/, 75];
                                        if (!(0, hooks_js_1.isAsyncHookJSONOutput)(json)) return [3 /*break*/, 67];
                                        return [4 /*yield*/, __await({
                                                outcome: 'success',
                                                hook: hook,
                                            })];
                                    case 64: return [4 /*yield*/, _l.sent()];
                                    case 65:
                                        _l.sent();
                                        return [4 /*yield*/, __await(void 0)];
                                    case 66: return [2 /*return*/, _l.sent()];
                                    case 67:
                                        processed = processHookJSONOutput({
                                            json: json,
                                            command: hookCommand,
                                            hookName: hookName,
                                            toolUseID: toolUseID,
                                            hookEvent: hookEvent,
                                            expectedHookEvent: hookEvent,
                                            stdout: result.stdout,
                                            stderr: result.stderr,
                                            exitCode: result.status,
                                            durationMs: durationMs,
                                        });
                                        if (!((0, hooks_js_1.isSyncHookJSONOutput)(json) &&
                                            !json.suppressOutput &&
                                            plainText &&
                                            result.status === 0)) return [3 /*break*/, 71];
                                        content = "".concat(chalk_1.default.bold(hookName), " completed");
                                        (0, hookEvents_js_1.emitHookResponse)({
                                            hookId: hookId,
                                            hookName: hookName,
                                            hookEvent: hookEvent,
                                            output: result.output,
                                            stdout: result.stdout,
                                            stderr: result.stderr,
                                            exitCode: result.status,
                                            outcome: 'success',
                                        });
                                        return [4 /*yield*/, __await(__assign(__assign({}, processed), { message: processed.message ||
                                                    (0, attachments_js_1.createAttachmentMessage)({
                                                        type: 'hook_success',
                                                        hookName: hookName,
                                                        toolUseID: toolUseID,
                                                        hookEvent: hookEvent,
                                                        content: content,
                                                        stdout: result.stdout,
                                                        stderr: result.stderr,
                                                        exitCode: result.status,
                                                        command: hookCommand,
                                                        durationMs: durationMs,
                                                    }), outcome: 'success', hook: hook }))];
                                    case 68: return [4 /*yield*/, _l.sent()];
                                    case 69:
                                        _l.sent();
                                        return [4 /*yield*/, __await(void 0)];
                                    case 70: return [2 /*return*/, _l.sent()];
                                    case 71:
                                        (0, hookEvents_js_1.emitHookResponse)({
                                            hookId: hookId,
                                            hookName: hookName,
                                            hookEvent: hookEvent,
                                            output: result.output,
                                            stdout: result.stdout,
                                            stderr: result.stderr,
                                            exitCode: result.status,
                                            outcome: result.status === 0 ? 'success' : 'error',
                                        });
                                        return [4 /*yield*/, __await(__assign(__assign({}, processed), { outcome: 'success', hook: hook }))];
                                    case 72: return [4 /*yield*/, _l.sent()];
                                    case 73:
                                        _l.sent();
                                        return [4 /*yield*/, __await(void 0)];
                                    case 74: return [2 /*return*/, _l.sent()];
                                    case 75:
                                        if (!(result.status === 0)) return [3 /*break*/, 79];
                                        (0, hookEvents_js_1.emitHookResponse)({
                                            hookId: hookId,
                                            hookName: hookName,
                                            hookEvent: hookEvent,
                                            output: result.output,
                                            stdout: result.stdout,
                                            stderr: result.stderr,
                                            exitCode: result.status,
                                            outcome: 'success',
                                        });
                                        return [4 /*yield*/, __await({
                                                message: (0, attachments_js_1.createAttachmentMessage)({
                                                    type: 'hook_success',
                                                    hookName: hookName,
                                                    toolUseID: toolUseID,
                                                    hookEvent: hookEvent,
                                                    content: result.stdout.trim(),
                                                    stdout: result.stdout,
                                                    stderr: result.stderr,
                                                    exitCode: result.status,
                                                    command: hookCommand,
                                                    durationMs: durationMs,
                                                }),
                                                outcome: 'success',
                                                hook: hook,
                                            })];
                                    case 76: return [4 /*yield*/, _l.sent()];
                                    case 77:
                                        _l.sent();
                                        return [4 /*yield*/, __await(void 0)];
                                    case 78: return [2 /*return*/, _l.sent()];
                                    case 79:
                                        if (!(result.status === 2)) return [3 /*break*/, 83];
                                        (0, hookEvents_js_1.emitHookResponse)({
                                            hookId: hookId,
                                            hookName: hookName,
                                            hookEvent: hookEvent,
                                            output: result.output,
                                            stdout: result.stdout,
                                            stderr: result.stderr,
                                            exitCode: result.status,
                                            outcome: 'error',
                                        });
                                        return [4 /*yield*/, __await({
                                                blockingError: {
                                                    blockingError: "[".concat(hook.command, "]: ").concat(result.stderr || 'No stderr output'),
                                                    command: hook.command,
                                                },
                                                outcome: 'blocking',
                                                hook: hook,
                                            })];
                                    case 80: return [4 /*yield*/, _l.sent()];
                                    case 81:
                                        _l.sent();
                                        return [4 /*yield*/, __await(void 0)];
                                    case 82: return [2 /*return*/, _l.sent()];
                                    case 83:
                                        // Any other non-zero exit code is a non-critical error that should just
                                        // be shown to the user.
                                        (0, hookEvents_js_1.emitHookResponse)({
                                            hookId: hookId,
                                            hookName: hookName,
                                            hookEvent: hookEvent,
                                            output: result.output,
                                            stdout: result.stdout,
                                            stderr: result.stderr,
                                            exitCode: result.status,
                                            outcome: 'error',
                                        });
                                        return [4 /*yield*/, __await({
                                                message: (0, attachments_js_1.createAttachmentMessage)({
                                                    type: 'hook_non_blocking_error',
                                                    hookName: hookName,
                                                    toolUseID: toolUseID,
                                                    hookEvent: hookEvent,
                                                    stderr: "Failed with non-blocking status code: ".concat(result.stderr.trim() || 'No stderr output'),
                                                    stdout: result.stdout,
                                                    exitCode: result.status,
                                                    command: hookCommand,
                                                    durationMs: durationMs,
                                                }),
                                                outcome: 'non_blocking_error',
                                                hook: hook,
                                            })];
                                    case 84: return [4 /*yield*/, _l.sent()];
                                    case 85:
                                        _l.sent();
                                        return [4 /*yield*/, __await(void 0)];
                                    case 86: return [2 /*return*/, _l.sent()];
                                    case 87:
                                        error_2 = _l.sent();
                                        // Clean up on error
                                        cleanup === null || cleanup === void 0 ? void 0 : cleanup();
                                        errorMessage_2 = error_2 instanceof Error ? error_2.message : String(error_2);
                                        (0, hookEvents_js_1.emitHookResponse)({
                                            hookId: hookId,
                                            hookName: hookName,
                                            hookEvent: hookEvent,
                                            output: "Failed to run: ".concat(errorMessage_2),
                                            stdout: '',
                                            stderr: "Failed to run: ".concat(errorMessage_2),
                                            exitCode: 1,
                                            outcome: 'error',
                                        });
                                        return [4 /*yield*/, __await({
                                                message: (0, attachments_js_1.createAttachmentMessage)({
                                                    type: 'hook_non_blocking_error',
                                                    hookName: hookName,
                                                    toolUseID: toolUseID,
                                                    hookEvent: hookEvent,
                                                    stderr: "Failed to run: ".concat(errorMessage_2),
                                                    stdout: '',
                                                    exitCode: 1,
                                                    command: hookCommand,
                                                    durationMs: Date.now() - hookStartMs,
                                                }),
                                                outcome: 'non_blocking_error',
                                                hook: hook,
                                            })];
                                    case 88: return [4 /*yield*/, _l.sent()];
                                    case 89:
                                        _l.sent();
                                        return [4 /*yield*/, __await(void 0)];
                                    case 90: return [2 /*return*/, _l.sent()];
                                    case 91: return [2 /*return*/];
                                }
                            });
                        });
                    });
                    outcomes = {
                        success: 0,
                        blocking: 0,
                        non_blocking_error: 0,
                        cancelled: 0,
                    };
                    _t.label = 24;
                case 24:
                    _t.trys.push([24, 30, 31, 36]);
                    _loop_2 = function () {
                        var result, updatedInput, sessionId_1, matcher, hookEntry;
                        return __generator(this, function (_u) {
                            switch (_u.label) {
                                case 0:
                                    _l = _h.value;
                                    _f = false;
                                    result = _l;
                                    outcomes[result.outcome]++;
                                    if (!result.preventContinuation) return [3 /*break*/, 3];
                                    (0, debug_js_1.logForDebugging)("Hook ".concat(hookEvent, " (").concat((0, hooksSettings_js_1.getHookDisplayText)(result.hook), ") requested preventContinuation"));
                                    return [4 /*yield*/, __await({
                                            preventContinuation: true,
                                            stopReason: result.stopReason,
                                        })];
                                case 1: return [4 /*yield*/, _u.sent()];
                                case 2:
                                    _u.sent();
                                    _u.label = 3;
                                case 3:
                                    if (!result.blockingError) return [3 /*break*/, 6];
                                    return [4 /*yield*/, __await({
                                            blockingError: result.blockingError,
                                        })];
                                case 4: return [4 /*yield*/, _u.sent()];
                                case 5:
                                    _u.sent();
                                    _u.label = 6;
                                case 6:
                                    if (!result.message) return [3 /*break*/, 9];
                                    return [4 /*yield*/, __await({ message: result.message })];
                                case 7: return [4 /*yield*/, _u.sent()];
                                case 8:
                                    _u.sent();
                                    _u.label = 9;
                                case 9:
                                    if (!result.systemMessage) return [3 /*break*/, 12];
                                    return [4 /*yield*/, __await({
                                            message: (0, attachments_js_1.createAttachmentMessage)({
                                                type: 'hook_system_message',
                                                content: result.systemMessage,
                                                hookName: hookName,
                                                toolUseID: toolUseID,
                                                hookEvent: hookEvent,
                                            }),
                                        })];
                                case 10: return [4 /*yield*/, _u.sent()];
                                case 11:
                                    _u.sent();
                                    _u.label = 12;
                                case 12:
                                    if (!result.additionalContext) return [3 /*break*/, 15];
                                    (0, debug_js_1.logForDebugging)("Hook ".concat(hookEvent, " (").concat((0, hooksSettings_js_1.getHookDisplayText)(result.hook), ") provided additionalContext (").concat(result.additionalContext.length, " chars)"));
                                    return [4 /*yield*/, __await({
                                            additionalContexts: [result.additionalContext],
                                        })];
                                case 13: return [4 /*yield*/, _u.sent()];
                                case 14:
                                    _u.sent();
                                    _u.label = 15;
                                case 15:
                                    if (!result.initialUserMessage) return [3 /*break*/, 18];
                                    (0, debug_js_1.logForDebugging)("Hook ".concat(hookEvent, " (").concat((0, hooksSettings_js_1.getHookDisplayText)(result.hook), ") provided initialUserMessage (").concat(result.initialUserMessage.length, " chars)"));
                                    return [4 /*yield*/, __await({
                                            initialUserMessage: result.initialUserMessage,
                                        })];
                                case 16: return [4 /*yield*/, _u.sent()];
                                case 17:
                                    _u.sent();
                                    _u.label = 18;
                                case 18:
                                    if (!(result.watchPaths && result.watchPaths.length > 0)) return [3 /*break*/, 21];
                                    (0, debug_js_1.logForDebugging)("Hook ".concat(hookEvent, " (").concat((0, hooksSettings_js_1.getHookDisplayText)(result.hook), ") provided ").concat(result.watchPaths.length, " watchPaths"));
                                    return [4 /*yield*/, __await({
                                            watchPaths: result.watchPaths,
                                        })];
                                case 19: return [4 /*yield*/, _u.sent()];
                                case 20:
                                    _u.sent();
                                    _u.label = 21;
                                case 21:
                                    if (!result.updatedMCPToolOutput) return [3 /*break*/, 24];
                                    (0, debug_js_1.logForDebugging)("Hook ".concat(hookEvent, " (").concat((0, hooksSettings_js_1.getHookDisplayText)(result.hook), ") replaced MCP tool output"));
                                    return [4 /*yield*/, __await({
                                            updatedMCPToolOutput: result.updatedMCPToolOutput,
                                        })];
                                case 22: return [4 /*yield*/, _u.sent()];
                                case 23:
                                    _u.sent();
                                    _u.label = 24;
                                case 24:
                                    // Check for permission behavior with precedence: deny > ask > allow
                                    if (result.permissionBehavior) {
                                        (0, debug_js_1.logForDebugging)("Hook ".concat(hookEvent, " (").concat((0, hooksSettings_js_1.getHookDisplayText)(result.hook), ") returned permissionDecision: ").concat(result.permissionBehavior).concat(result.hookPermissionDecisionReason ? " (reason: ".concat(result.hookPermissionDecisionReason, ")") : ''));
                                        // Apply precedence rules
                                        switch (result.permissionBehavior) {
                                            case 'deny':
                                                // deny always takes precedence
                                                permissionBehavior = 'deny';
                                                break;
                                            case 'ask':
                                                // ask takes precedence over allow but not deny
                                                if (permissionBehavior !== 'deny') {
                                                    permissionBehavior = 'ask';
                                                }
                                                break;
                                            case 'allow':
                                                // allow only if no other behavior set
                                                if (!permissionBehavior) {
                                                    permissionBehavior = 'allow';
                                                }
                                                break;
                                            case 'passthrough':
                                                // passthrough doesn't set permission behavior
                                                break;
                                        }
                                    }
                                    if (!(permissionBehavior !== undefined)) return [3 /*break*/, 27];
                                    updatedInput = result.updatedInput &&
                                        (result.permissionBehavior === 'allow' ||
                                            result.permissionBehavior === 'ask')
                                        ? result.updatedInput
                                        : undefined;
                                    if (updatedInput) {
                                        (0, debug_js_1.logForDebugging)("Hook ".concat(hookEvent, " (").concat((0, hooksSettings_js_1.getHookDisplayText)(result.hook), ") modified tool input keys: [").concat(Object.keys(updatedInput).join(', '), "]"));
                                    }
                                    return [4 /*yield*/, __await({
                                            permissionBehavior: permissionBehavior,
                                            hookPermissionDecisionReason: result.hookPermissionDecisionReason,
                                            hookSource: (_q = matchingHooks.find(function (m) { return m.hook === result.hook; })) === null || _q === void 0 ? void 0 : _q.hookSource,
                                            updatedInput: updatedInput,
                                        })];
                                case 25: return [4 /*yield*/, _u.sent()];
                                case 26:
                                    _u.sent();
                                    _u.label = 27;
                                case 27:
                                    if (!(result.updatedInput && result.permissionBehavior === undefined)) return [3 /*break*/, 30];
                                    (0, debug_js_1.logForDebugging)("Hook ".concat(hookEvent, " (").concat((0, hooksSettings_js_1.getHookDisplayText)(result.hook), ") modified tool input keys: [").concat(Object.keys(result.updatedInput).join(', '), "]"));
                                    return [4 /*yield*/, __await({
                                            updatedInput: result.updatedInput,
                                        })];
                                case 28: return [4 /*yield*/, _u.sent()];
                                case 29:
                                    _u.sent();
                                    _u.label = 30;
                                case 30:
                                    if (!result.permissionRequestResult) return [3 /*break*/, 33];
                                    return [4 /*yield*/, __await({
                                            permissionRequestResult: result.permissionRequestResult,
                                        })];
                                case 31: return [4 /*yield*/, _u.sent()];
                                case 32:
                                    _u.sent();
                                    _u.label = 33;
                                case 33:
                                    if (!result.retry) return [3 /*break*/, 36];
                                    return [4 /*yield*/, __await({
                                            retry: result.retry,
                                        })];
                                case 34: return [4 /*yield*/, _u.sent()];
                                case 35:
                                    _u.sent();
                                    _u.label = 36;
                                case 36:
                                    if (!result.elicitationResponse) return [3 /*break*/, 39];
                                    return [4 /*yield*/, __await({
                                            elicitationResponse: result.elicitationResponse,
                                        })];
                                case 37: return [4 /*yield*/, _u.sent()];
                                case 38:
                                    _u.sent();
                                    _u.label = 39;
                                case 39:
                                    if (!result.elicitationResultResponse) return [3 /*break*/, 42];
                                    return [4 /*yield*/, __await({
                                            elicitationResultResponse: result.elicitationResultResponse,
                                        })];
                                case 40: return [4 /*yield*/, _u.sent()];
                                case 41:
                                    _u.sent();
                                    _u.label = 42;
                                case 42:
                                    // Invoke session hook callback if this is a command/prompt/function hook (not a callback hook)
                                    if (appState && result.hook.type !== 'callback') {
                                        sessionId_1 = (0, state_js_1.getSessionId)();
                                        matcher = matchQuery !== null && matchQuery !== void 0 ? matchQuery : '';
                                        hookEntry = (0, sessionHooks_js_1.getSessionHookCallback)(appState, sessionId_1, hookEvent, matcher, result.hook);
                                        // Invoke onHookSuccess only on success outcome
                                        if ((hookEntry === null || hookEntry === void 0 ? void 0 : hookEntry.onHookSuccess) && result.outcome === 'success') {
                                            try {
                                                hookEntry.onHookSuccess(result.hook, result);
                                            }
                                            catch (error) {
                                                (0, log_js_1.logError)(Error('Session hook success callback failed', { cause: error }));
                                            }
                                        }
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _f = true, _g = __asyncValues((0, generators_js_1.all)(hookPromises));
                    _t.label = 25;
                case 25: return [4 /*yield*/, __await(_g.next())];
                case 26:
                    if (!(_h = _t.sent(), _j = _h.done, !_j)) return [3 /*break*/, 29];
                    return [5 /*yield**/, _loop_2()];
                case 27:
                    _t.sent();
                    _t.label = 28;
                case 28:
                    _f = true;
                    return [3 /*break*/, 25];
                case 29: return [3 /*break*/, 36];
                case 30:
                    e_1_1 = _t.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 36];
                case 31:
                    _t.trys.push([31, , 34, 35]);
                    if (!(!_f && !_j && (_k = _g.return))) return [3 /*break*/, 33];
                    return [4 /*yield*/, __await(_k.call(_g))];
                case 32:
                    _t.sent();
                    _t.label = 33;
                case 33: return [3 /*break*/, 35];
                case 34:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 35: return [7 /*endfinally*/];
                case 36:
                    totalDurationMs = Date.now() - batchStartTime;
                    (_r = (0, state_js_1.getStatsStore)()) === null || _r === void 0 ? void 0 : _r.observe('hook_duration_ms', totalDurationMs);
                    (0, state_js_1.addToTurnHookDuration)(totalDurationMs);
                    (0, index_js_1.logEvent)("tengu_repl_hook_finished", {
                        hookName: hookName,
                        numCommands: matchingHooks.length,
                        numSuccess: outcomes.success,
                        numBlocking: outcomes.blocking,
                        numNonBlockingError: outcomes.non_blocking_error,
                        numCancelled: outcomes.cancelled,
                        totalDurationMs: totalDurationMs,
                    });
                    // Log hook execution completion to OTEL (only for beta tracing)
                    if ((0, sessionTracing_js_1.isBetaTracingEnabled)()) {
                        hookDefinitionsComplete = getHookDefinitionsForTelemetry(matchingHooks);
                        void (0, events_js_1.logOTelEvent)('hook_execution_complete', {
                            hook_event: hookEvent,
                            hook_name: hookName,
                            num_hooks: String(matchingHooks.length),
                            num_success: String(outcomes.success),
                            num_blocking: String(outcomes.blocking),
                            num_non_blocking_error: String(outcomes.non_blocking_error),
                            num_cancelled: String(outcomes.cancelled),
                            managed_only: String((0, hooksConfigSnapshot_js_1.shouldAllowManagedHooksOnly)()),
                            hook_definitions: (0, slowOperations_js_1.jsonStringify)(hookDefinitionsComplete),
                            hook_source: (0, hooksConfigSnapshot_js_1.shouldAllowManagedHooksOnly)() ? 'policySettings' : 'merged',
                        });
                    }
                    // End hook span for beta tracing
                    (0, sessionTracing_js_1.endHookSpan)(hookSpan, {
                        numSuccess: outcomes.success,
                        numBlocking: outcomes.blocking,
                        numNonBlockingError: outcomes.non_blocking_error,
                        numCancelled: outcomes.cancelled,
                    });
                    return [2 /*return*/];
            }
        });
    });
}
function hasBlockingResult(results) {
    return results.some(function (r) { return r.blocked; });
}
/**
 * Execute hooks outside of the REPL (e.g. notifications, session end)
 *
 * Unlike executeHooks() which yields messages that are exposed to the model as
 * system messages, this function only logs errors via logForDebugging (visible
 * with --debug). Callers that need to surface errors to users should handle
 * the returned results appropriately (e.g. executeSessionEndHooks writes to
 * stderr during shutdown).
 *
 * @param getAppState Optional function to get the current app state (for session hooks)
 * @param hookInput The structured hook input that will be validated and converted to JSON
 * @param matchQuery The query to match against hook matchers
 * @param signal Optional AbortSignal to cancel hook execution
 * @param timeoutMs Optional timeout in milliseconds for hook execution
 * @returns Array of HookOutsideReplResult objects containing command, succeeded, and output
 */
function executeHooksOutsideREPL(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var hookEvent, hookName, appState, sessionId, matchingHooks, userHooks, pluginHookCounts, hookTypeCounts, jsonInput, hookPromises;
        var _this = this;
        var getAppState = _b.getAppState, hookInput = _b.hookInput, matchQuery = _b.matchQuery, signal = _b.signal, _c = _b.timeoutMs, timeoutMs = _c === void 0 ? TOOL_HOOK_EXECUTION_TIMEOUT_MS : _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if ((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_SIMPLE)) {
                        return [2 /*return*/, []];
                    }
                    hookEvent = hookInput.hook_event_name;
                    hookName = matchQuery ? "".concat(hookEvent, ":").concat(matchQuery) : hookEvent;
                    if ((0, hooksConfigSnapshot_js_1.shouldDisableAllHooksIncludingManaged)()) {
                        (0, debug_js_1.logForDebugging)("Skipping hooks for ".concat(hookName, " due to 'disableAllHooks' managed setting"));
                        return [2 /*return*/, []];
                    }
                    // SECURITY: ALL hooks require workspace trust in interactive mode
                    // This centralized check prevents RCE vulnerabilities for all current and future hooks
                    if (shouldSkipHookDueToTrust()) {
                        (0, debug_js_1.logForDebugging)("Skipping ".concat(hookName, " hook execution - workspace trust not accepted"));
                        return [2 /*return*/, []];
                    }
                    appState = getAppState ? getAppState() : undefined;
                    sessionId = (0, state_js_1.getSessionId)();
                    return [4 /*yield*/, getMatchingHooks(appState, sessionId, hookEvent, hookInput)];
                case 1:
                    matchingHooks = _d.sent();
                    if (matchingHooks.length === 0) {
                        return [2 /*return*/, []];
                    }
                    if (signal === null || signal === void 0 ? void 0 : signal.aborted) {
                        return [2 /*return*/, []];
                    }
                    userHooks = matchingHooks.filter(function (h) { return !isInternalHook(h); });
                    if (userHooks.length > 0) {
                        pluginHookCounts = getPluginHookCounts(userHooks);
                        hookTypeCounts = getHookTypeCounts(userHooks);
                        (0, index_js_1.logEvent)("tengu_run_hook", __assign({ hookName: hookName, numCommands: userHooks.length, hookTypeCounts: (0, slowOperations_js_1.jsonStringify)(hookTypeCounts) }, (pluginHookCounts && {
                            pluginHookCounts: (0, slowOperations_js_1.jsonStringify)(pluginHookCounts),
                        })));
                    }
                    try {
                        jsonInput = (0, slowOperations_js_1.jsonStringify)(hookInput);
                    }
                    catch (error) {
                        (0, log_js_1.logError)(error);
                        return [2 /*return*/, []];
                    }
                    hookPromises = matchingHooks.map(function (_a, hookIndex_1) { return __awaiter(_this, [_a, hookIndex_1], void 0, function (_b, hookIndex) {
                        var callbackTimeoutMs, _c, abortSignal_2, cleanup_2, toolUseID, json, output, blocked, error_3, errorMessage_3, httpResult, errMsg, _d, httpJson, httpValidationError, jsonBlocked, output, error_4, errorMessage_4, commandTimeoutMs, _e, abortSignal, cleanup, result, _f, json, validationError, jsonBlocked, blocked, output, watchPaths, systemMessage, error_5, errorMessage_5;
                        var _g, _h;
                        var hook = _b.hook, pluginRoot = _b.pluginRoot, pluginId = _b.pluginId;
                        return __generator(this, function (_j) {
                            switch (_j.label) {
                                case 0:
                                    if (!(hook.type === 'callback')) return [3 /*break*/, 4];
                                    callbackTimeoutMs = hook.timeout ? hook.timeout * 1000 : timeoutMs;
                                    _c = (0, combinedAbortSignal_js_1.createCombinedAbortSignal)(signal, { timeoutMs: callbackTimeoutMs }), abortSignal_2 = _c.signal, cleanup_2 = _c.cleanup;
                                    _j.label = 1;
                                case 1:
                                    _j.trys.push([1, 3, , 4]);
                                    toolUseID = (0, crypto_1.randomUUID)();
                                    return [4 /*yield*/, hook.callback(hookInput, toolUseID, abortSignal_2, hookIndex)];
                                case 2:
                                    json = _j.sent();
                                    cleanup_2 === null || cleanup_2 === void 0 ? void 0 : cleanup_2();
                                    if ((0, hooks_js_1.isAsyncHookJSONOutput)(json)) {
                                        (0, debug_js_1.logForDebugging)("".concat(hookName, " [callback] returned async response, returning empty output"));
                                        return [2 /*return*/, {
                                                command: 'callback',
                                                succeeded: true,
                                                output: '',
                                                blocked: false,
                                            }];
                                    }
                                    output = hookEvent === 'WorktreeCreate' &&
                                        (0, hooks_js_1.isSyncHookJSONOutput)(json) &&
                                        ((_g = json.hookSpecificOutput) === null || _g === void 0 ? void 0 : _g.hookEventName) === 'WorktreeCreate'
                                        ? json.hookSpecificOutput.worktreePath
                                        : json.systemMessage || '';
                                    blocked = (0, hooks_js_1.isSyncHookJSONOutput)(json) && json.decision === 'block';
                                    (0, debug_js_1.logForDebugging)("".concat(hookName, " [callback] completed successfully"));
                                    return [2 /*return*/, {
                                            command: 'callback',
                                            succeeded: true,
                                            output: output,
                                            blocked: blocked,
                                        }];
                                case 3:
                                    error_3 = _j.sent();
                                    cleanup_2 === null || cleanup_2 === void 0 ? void 0 : cleanup_2();
                                    errorMessage_3 = error_3 instanceof Error ? error_3.message : String(error_3);
                                    (0, debug_js_1.logForDebugging)("".concat(hookName, " [callback] failed to run: ").concat(errorMessage_3), { level: 'error' });
                                    return [2 /*return*/, {
                                            command: 'callback',
                                            succeeded: false,
                                            output: errorMessage_3,
                                            blocked: false,
                                        }];
                                case 4:
                                    // TODO: Implement prompt stop hooks outside REPL
                                    if (hook.type === 'prompt') {
                                        return [2 /*return*/, {
                                                command: hook.prompt,
                                                succeeded: false,
                                                output: 'Prompt stop hooks are not yet supported outside REPL',
                                                blocked: false,
                                            }];
                                    }
                                    // TODO: Implement agent stop hooks outside REPL
                                    if (hook.type === 'agent') {
                                        return [2 /*return*/, {
                                                command: hook.prompt,
                                                succeeded: false,
                                                output: 'Agent stop hooks are not yet supported outside REPL',
                                                blocked: false,
                                            }];
                                    }
                                    // Function hooks require messages array (only available in REPL context)
                                    // For -p mode Stop hooks, use executeStopHooks which supports function hooks
                                    if (hook.type === 'function') {
                                        (0, log_js_1.logError)(new Error("Function hook reached executeHooksOutsideREPL for ".concat(hookEvent, ". Function hooks should only be used in REPL context (Stop hooks).")));
                                        return [2 /*return*/, {
                                                command: 'function',
                                                succeeded: false,
                                                output: 'Internal error: function hook executed outside REPL context',
                                                blocked: false,
                                            }];
                                    }
                                    if (!(hook.type === 'http')) return [3 /*break*/, 8];
                                    _j.label = 5;
                                case 5:
                                    _j.trys.push([5, 7, , 8]);
                                    return [4 /*yield*/, (0, execHttpHook_js_1.execHttpHook)(hook, hookEvent, jsonInput, signal)];
                                case 6:
                                    httpResult = _j.sent();
                                    if (httpResult.aborted) {
                                        (0, debug_js_1.logForDebugging)("".concat(hookName, " [").concat(hook.url, "] cancelled"));
                                        return [2 /*return*/, {
                                                command: hook.url,
                                                succeeded: false,
                                                output: 'Hook cancelled',
                                                blocked: false,
                                            }];
                                    }
                                    if (httpResult.error || !httpResult.ok) {
                                        errMsg = httpResult.error ||
                                            "HTTP ".concat(httpResult.statusCode, " from ").concat(hook.url);
                                        (0, debug_js_1.logForDebugging)("".concat(hookName, " [").concat(hook.url, "] failed: ").concat(errMsg), {
                                            level: 'error',
                                        });
                                        return [2 /*return*/, {
                                                command: hook.url,
                                                succeeded: false,
                                                output: errMsg,
                                                blocked: false,
                                            }];
                                    }
                                    _d = parseHttpHookOutput(httpResult.body), httpJson = _d.json, httpValidationError = _d.validationError;
                                    if (httpValidationError) {
                                        throw new Error(httpValidationError);
                                    }
                                    if (httpJson && !(0, hooks_js_1.isAsyncHookJSONOutput)(httpJson)) {
                                        (0, debug_js_1.logForDebugging)("Parsed JSON output from HTTP hook: ".concat((0, slowOperations_js_1.jsonStringify)(httpJson)), { level: 'verbose' });
                                    }
                                    jsonBlocked = httpJson &&
                                        !(0, hooks_js_1.isAsyncHookJSONOutput)(httpJson) &&
                                        (0, hooks_js_1.isSyncHookJSONOutput)(httpJson) &&
                                        httpJson.decision === 'block';
                                    output = hookEvent === 'WorktreeCreate'
                                        ? httpJson &&
                                            (0, hooks_js_1.isSyncHookJSONOutput)(httpJson) &&
                                            ((_h = httpJson.hookSpecificOutput) === null || _h === void 0 ? void 0 : _h.hookEventName) === 'WorktreeCreate'
                                            ? httpJson.hookSpecificOutput.worktreePath
                                            : ''
                                        : httpResult.body;
                                    return [2 /*return*/, {
                                            command: hook.url,
                                            succeeded: true,
                                            output: output,
                                            blocked: !!jsonBlocked,
                                        }];
                                case 7:
                                    error_4 = _j.sent();
                                    errorMessage_4 = error_4 instanceof Error ? error_4.message : String(error_4);
                                    (0, debug_js_1.logForDebugging)("".concat(hookName, " [").concat(hook.url, "] failed to run: ").concat(errorMessage_4), { level: 'error' });
                                    return [2 /*return*/, {
                                            command: hook.url,
                                            succeeded: false,
                                            output: errorMessage_4,
                                            blocked: false,
                                        }];
                                case 8:
                                    commandTimeoutMs = hook.timeout ? hook.timeout * 1000 : timeoutMs;
                                    _e = (0, combinedAbortSignal_js_1.createCombinedAbortSignal)(signal, { timeoutMs: commandTimeoutMs }), abortSignal = _e.signal, cleanup = _e.cleanup;
                                    _j.label = 9;
                                case 9:
                                    _j.trys.push([9, 11, , 12]);
                                    return [4 /*yield*/, execCommandHook(hook, hookEvent, hookName, jsonInput, abortSignal, (0, crypto_1.randomUUID)(), hookIndex, pluginRoot, pluginId)
                                        // Clear timeout if hook completes
                                    ];
                                case 10:
                                    result = _j.sent();
                                    // Clear timeout if hook completes
                                    cleanup === null || cleanup === void 0 ? void 0 : cleanup();
                                    if (result.aborted) {
                                        (0, debug_js_1.logForDebugging)("".concat(hookName, " [").concat(hook.command, "] cancelled"));
                                        return [2 /*return*/, {
                                                command: hook.command,
                                                succeeded: false,
                                                output: 'Hook cancelled',
                                                blocked: false,
                                            }];
                                    }
                                    (0, debug_js_1.logForDebugging)("".concat(hookName, " [").concat(hook.command, "] completed with status ").concat(result.status));
                                    _f = parseHookOutput(result.stdout), json = _f.json, validationError = _f.validationError;
                                    if (validationError) {
                                        // Validation error is logged via logForDebugging and returned in output
                                        throw new Error(validationError);
                                    }
                                    if (json && !(0, hooks_js_1.isAsyncHookJSONOutput)(json)) {
                                        (0, debug_js_1.logForDebugging)("Parsed JSON output from hook: ".concat((0, slowOperations_js_1.jsonStringify)(json)), { level: 'verbose' });
                                    }
                                    jsonBlocked = json &&
                                        !(0, hooks_js_1.isAsyncHookJSONOutput)(json) &&
                                        (0, hooks_js_1.isSyncHookJSONOutput)(json) &&
                                        json.decision === 'block';
                                    blocked = result.status === 2 || !!jsonBlocked;
                                    output = result.status === 0 ? result.stdout || '' : result.stderr || '';
                                    watchPaths = json &&
                                        (0, hooks_js_1.isSyncHookJSONOutput)(json) &&
                                        json.hookSpecificOutput &&
                                        'watchPaths' in json.hookSpecificOutput
                                        ? json.hookSpecificOutput.watchPaths
                                        : undefined;
                                    systemMessage = json && (0, hooks_js_1.isSyncHookJSONOutput)(json) ? json.systemMessage : undefined;
                                    return [2 /*return*/, {
                                            command: hook.command,
                                            succeeded: result.status === 0,
                                            output: output,
                                            blocked: blocked,
                                            watchPaths: watchPaths,
                                            systemMessage: systemMessage,
                                        }];
                                case 11:
                                    error_5 = _j.sent();
                                    // Clean up on error
                                    cleanup === null || cleanup === void 0 ? void 0 : cleanup();
                                    errorMessage_5 = error_5 instanceof Error ? error_5.message : String(error_5);
                                    (0, debug_js_1.logForDebugging)("".concat(hookName, " [").concat(hook.command, "] failed to run: ").concat(errorMessage_5), { level: 'error' });
                                    return [2 /*return*/, {
                                            command: hook.command,
                                            succeeded: false,
                                            output: errorMessage_5,
                                            blocked: false,
                                        }];
                                case 12: return [2 /*return*/];
                            }
                        });
                    }); });
                    return [4 /*yield*/, Promise.all(hookPromises)];
                case 2: 
                // Wait for all hooks to complete and collect results
                return [2 /*return*/, _d.sent()];
            }
        });
    });
}
/**
 * Execute pre-tool hooks if configured
 * @param toolName The name of the tool (e.g., 'Write', 'Edit', 'Bash')
 * @param toolUseID The ID of the tool use
 * @param toolInput The input that will be passed to the tool
 * @param permissionMode Optional permission mode from toolPermissionContext
 * @param signal Optional AbortSignal to cancel hook execution
 * @param timeoutMs Optional timeout in milliseconds for hook execution
 * @param toolUseContext Optional ToolUseContext for prompt-based hooks
 * @returns Async generator that yields progress messages and returns blocking errors
 */
function executePreToolHooks(toolName_1, toolUseID_1, toolInput_1, toolUseContext_1, permissionMode_1, signal_1) {
    return __asyncGenerator(this, arguments, function executePreToolHooks_1(toolName, toolUseID, toolInput, toolUseContext, permissionMode, signal, timeoutMs, requestPrompt, toolInputSummary) {
        var appState, sessionId, hookInput;
        var _a;
        if (timeoutMs === void 0) { timeoutMs = TOOL_HOOK_EXECUTION_TIMEOUT_MS; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    appState = toolUseContext.getAppState();
                    sessionId = (_a = toolUseContext.agentId) !== null && _a !== void 0 ? _a : (0, state_js_1.getSessionId)();
                    if (!!hasHookForEvent('PreToolUse', appState, sessionId)) return [3 /*break*/, 2];
                    return [4 /*yield*/, __await(void 0)];
                case 1: return [2 /*return*/, _b.sent()];
                case 2:
                    (0, debug_js_1.logForDebugging)("executePreToolHooks called for tool: ".concat(toolName), {
                        level: 'verbose',
                    });
                    hookInput = __assign(__assign({}, createBaseHookInput(permissionMode, undefined, toolUseContext)), { hook_event_name: 'PreToolUse', tool_name: toolName, tool_input: toolInput, tool_use_id: toolUseID });
                    return [5 /*yield**/, __values(__asyncDelegator(__asyncValues(executeHooks({
                            hookInput: hookInput,
                            toolUseID: toolUseID,
                            matchQuery: toolName,
                            signal: signal,
                            timeoutMs: timeoutMs,
                            toolUseContext: toolUseContext,
                            requestPrompt: requestPrompt,
                            toolInputSummary: toolInputSummary,
                        }))))];
                case 3: return [4 /*yield*/, __await.apply(void 0, [_b.sent()])];
                case 4:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Execute post-tool hooks if configured
 * @param toolName The name of the tool (e.g., 'Write', 'Edit', 'Bash')
 * @param toolUseID The ID of the tool use
 * @param toolInput The input that was passed to the tool
 * @param toolResponse The response from the tool
 * @param toolUseContext ToolUseContext for prompt-based hooks
 * @param permissionMode Optional permission mode from toolPermissionContext
 * @param signal Optional AbortSignal to cancel hook execution
 * @param timeoutMs Optional timeout in milliseconds for hook execution
 * @returns Async generator that yields progress messages and blocking errors for automated feedback
 */
function executePostToolHooks(toolName_1, toolUseID_1, toolInput_1, toolResponse_1, toolUseContext_1, permissionMode_1, signal_1) {
    return __asyncGenerator(this, arguments, function executePostToolHooks_1(toolName, toolUseID, toolInput, toolResponse, toolUseContext, permissionMode, signal, timeoutMs) {
        var hookInput;
        if (timeoutMs === void 0) { timeoutMs = TOOL_HOOK_EXECUTION_TIMEOUT_MS; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    hookInput = __assign(__assign({}, createBaseHookInput(permissionMode, undefined, toolUseContext)), { hook_event_name: 'PostToolUse', tool_name: toolName, tool_input: toolInput, tool_response: toolResponse, tool_use_id: toolUseID });
                    return [5 /*yield**/, __values(__asyncDelegator(__asyncValues(executeHooks({
                            hookInput: hookInput,
                            toolUseID: toolUseID,
                            matchQuery: toolName,
                            signal: signal,
                            timeoutMs: timeoutMs,
                            toolUseContext: toolUseContext,
                        }))))];
                case 1: return [4 /*yield*/, __await.apply(void 0, [_a.sent()])];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Execute post-tool-use-failure hooks if configured
 * @param toolName The name of the tool (e.g., 'Write', 'Edit', 'Bash')
 * @param toolUseID The ID of the tool use
 * @param toolInput The input that was passed to the tool
 * @param error The error message from the failed tool call
 * @param toolUseContext ToolUseContext for prompt-based hooks
 * @param isInterrupt Whether the tool was interrupted by user
 * @param permissionMode Optional permission mode from toolPermissionContext
 * @param signal Optional AbortSignal to cancel hook execution
 * @param timeoutMs Optional timeout in milliseconds for hook execution
 * @returns Async generator that yields progress messages and blocking errors
 */
function executePostToolUseFailureHooks(toolName_1, toolUseID_1, toolInput_1, error_6, toolUseContext_1, isInterrupt_1, permissionMode_1, signal_1) {
    return __asyncGenerator(this, arguments, function executePostToolUseFailureHooks_1(toolName, toolUseID, toolInput, error, toolUseContext, isInterrupt, permissionMode, signal, timeoutMs) {
        var appState, sessionId, hookInput;
        var _a;
        if (timeoutMs === void 0) { timeoutMs = TOOL_HOOK_EXECUTION_TIMEOUT_MS; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    appState = toolUseContext.getAppState();
                    sessionId = (_a = toolUseContext.agentId) !== null && _a !== void 0 ? _a : (0, state_js_1.getSessionId)();
                    if (!!hasHookForEvent('PostToolUseFailure', appState, sessionId)) return [3 /*break*/, 2];
                    return [4 /*yield*/, __await(void 0)];
                case 1: return [2 /*return*/, _b.sent()];
                case 2:
                    hookInput = __assign(__assign({}, createBaseHookInput(permissionMode, undefined, toolUseContext)), { hook_event_name: 'PostToolUseFailure', tool_name: toolName, tool_input: toolInput, tool_use_id: toolUseID, error: error, is_interrupt: isInterrupt });
                    return [5 /*yield**/, __values(__asyncDelegator(__asyncValues(executeHooks({
                            hookInput: hookInput,
                            toolUseID: toolUseID,
                            matchQuery: toolName,
                            signal: signal,
                            timeoutMs: timeoutMs,
                            toolUseContext: toolUseContext,
                        }))))];
                case 3: return [4 /*yield*/, __await.apply(void 0, [_b.sent()])];
                case 4:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function executePermissionDeniedHooks(toolName_1, toolUseID_1, toolInput_1, reason_1, toolUseContext_1, permissionMode_1, signal_1) {
    return __asyncGenerator(this, arguments, function executePermissionDeniedHooks_1(toolName, toolUseID, toolInput, reason, toolUseContext, permissionMode, signal, timeoutMs) {
        var appState, sessionId, hookInput;
        var _a;
        if (timeoutMs === void 0) { timeoutMs = TOOL_HOOK_EXECUTION_TIMEOUT_MS; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    appState = toolUseContext.getAppState();
                    sessionId = (_a = toolUseContext.agentId) !== null && _a !== void 0 ? _a : (0, state_js_1.getSessionId)();
                    if (!!hasHookForEvent('PermissionDenied', appState, sessionId)) return [3 /*break*/, 2];
                    return [4 /*yield*/, __await(void 0)];
                case 1: return [2 /*return*/, _b.sent()];
                case 2:
                    hookInput = __assign(__assign({}, createBaseHookInput(permissionMode, undefined, toolUseContext)), { hook_event_name: 'PermissionDenied', tool_name: toolName, tool_input: toolInput, tool_use_id: toolUseID, reason: reason });
                    return [5 /*yield**/, __values(__asyncDelegator(__asyncValues(executeHooks({
                            hookInput: hookInput,
                            toolUseID: toolUseID,
                            matchQuery: toolName,
                            signal: signal,
                            timeoutMs: timeoutMs,
                            toolUseContext: toolUseContext,
                        }))))];
                case 3: return [4 /*yield*/, __await.apply(void 0, [_b.sent()])];
                case 4:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Execute notification hooks if configured
 * @param notificationData The notification data to pass to hooks
 * @param timeoutMs Optional timeout in milliseconds for hook execution
 * @returns Promise that resolves when all hooks complete
 */
function executeNotificationHooks(notificationData_1) {
    return __awaiter(this, arguments, void 0, function (notificationData, timeoutMs) {
        var message, title, notificationType, hookInput;
        if (timeoutMs === void 0) { timeoutMs = TOOL_HOOK_EXECUTION_TIMEOUT_MS; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    message = notificationData.message, title = notificationData.title, notificationType = notificationData.notificationType;
                    hookInput = __assign(__assign({}, createBaseHookInput(undefined)), { hook_event_name: 'Notification', message: message, title: title, notification_type: notificationType });
                    return [4 /*yield*/, executeHooksOutsideREPL({
                            hookInput: hookInput,
                            timeoutMs: timeoutMs,
                            matchQuery: notificationType,
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function executeStopFailureHooks(lastMessage_1, toolUseContext_1) {
    return __awaiter(this, arguments, void 0, function (lastMessage, toolUseContext, timeoutMs) {
        var appState, sessionId, lastAssistantText, error, hookInput;
        var _a;
        if (timeoutMs === void 0) { timeoutMs = TOOL_HOOK_EXECUTION_TIMEOUT_MS; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    appState = toolUseContext === null || toolUseContext === void 0 ? void 0 : toolUseContext.getAppState();
                    sessionId = (0, state_js_1.getSessionId)();
                    if (!hasHookForEvent('StopFailure', appState, sessionId))
                        return [2 /*return*/];
                    lastAssistantText = (0, messages_js_1.extractTextContent)(lastMessage.message.content, '\n').trim() || undefined;
                    error = (_a = lastMessage.error) !== null && _a !== void 0 ? _a : 'unknown';
                    hookInput = __assign(__assign({}, createBaseHookInput(undefined, undefined, toolUseContext)), { hook_event_name: 'StopFailure', error: error, error_details: lastMessage.errorDetails, last_assistant_message: lastAssistantText });
                    return [4 /*yield*/, executeHooksOutsideREPL({
                            getAppState: toolUseContext === null || toolUseContext === void 0 ? void 0 : toolUseContext.getAppState,
                            hookInput: hookInput,
                            timeoutMs: timeoutMs,
                            matchQuery: error,
                        })];
                case 1:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Execute stop hooks if configured
 * @param toolUseContext ToolUseContext for prompt-based hooks
 * @param permissionMode permission mode from toolPermissionContext
 * @param signal AbortSignal to cancel hook execution
 * @param stopHookActive Whether this call is happening within another stop hook
 * @param isSubagent Whether the current execution context is a subagent
 * @param messages Optional conversation history for prompt/function hooks
 * @returns Async generator that yields progress messages and blocking errors
 */
function executeStopHooks(permissionMode_1, signal_1) {
    return __asyncGenerator(this, arguments, function executeStopHooks_1(permissionMode, signal, timeoutMs, stopHookActive, subagentId, toolUseContext, messages, agentType, requestPrompt) {
        var hookEvent, appState, sessionId, lastAssistantMessage, lastAssistantText, hookInput;
        var _a;
        if (timeoutMs === void 0) { timeoutMs = TOOL_HOOK_EXECUTION_TIMEOUT_MS; }
        if (stopHookActive === void 0) { stopHookActive = false; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    hookEvent = subagentId ? 'SubagentStop' : 'Stop';
                    appState = toolUseContext === null || toolUseContext === void 0 ? void 0 : toolUseContext.getAppState();
                    sessionId = (_a = toolUseContext === null || toolUseContext === void 0 ? void 0 : toolUseContext.agentId) !== null && _a !== void 0 ? _a : (0, state_js_1.getSessionId)();
                    if (!!hasHookForEvent(hookEvent, appState, sessionId)) return [3 /*break*/, 2];
                    return [4 /*yield*/, __await(void 0)];
                case 1: return [2 /*return*/, _b.sent()];
                case 2:
                    lastAssistantMessage = messages
                        ? (0, messages_js_1.getLastAssistantMessage)(messages)
                        : undefined;
                    lastAssistantText = lastAssistantMessage
                        ? (0, messages_js_1.extractTextContent)(lastAssistantMessage.message.content, '\n').trim() ||
                            undefined
                        : undefined;
                    hookInput = subagentId
                        ? __assign(__assign({}, createBaseHookInput(permissionMode)), { hook_event_name: 'SubagentStop', stop_hook_active: stopHookActive, agent_id: subagentId, agent_transcript_path: (0, sessionStorage_js_1.getAgentTranscriptPath)(subagentId), agent_type: agentType !== null && agentType !== void 0 ? agentType : '', last_assistant_message: lastAssistantText }) : __assign(__assign({}, createBaseHookInput(permissionMode)), { hook_event_name: 'Stop', stop_hook_active: stopHookActive, last_assistant_message: lastAssistantText });
                    // Trust check is now centralized in executeHooks()
                    return [5 /*yield**/, __values(__asyncDelegator(__asyncValues(executeHooks({
                            hookInput: hookInput,
                            toolUseID: (0, crypto_1.randomUUID)(),
                            signal: signal,
                            timeoutMs: timeoutMs,
                            toolUseContext: toolUseContext,
                            messages: messages,
                            requestPrompt: requestPrompt,
                        }))))];
                case 3: 
                // Trust check is now centralized in executeHooks()
                return [4 /*yield*/, __await.apply(void 0, [_b.sent()])];
                case 4:
                    // Trust check is now centralized in executeHooks()
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Execute TeammateIdle hooks when a teammate is about to go idle.
 * If a hook blocks (exit code 2), the teammate should continue working instead of going idle.
 * @param teammateName The name of the teammate going idle
 * @param teamName The team this teammate belongs to
 * @param permissionMode Optional permission mode
 * @param signal Optional AbortSignal to cancel hook execution
 * @param timeoutMs Optional timeout in milliseconds for hook execution
 * @returns Async generator that yields progress messages and blocking errors
 */
function executeTeammateIdleHooks(teammateName_1, teamName_1, permissionMode_1, signal_1) {
    return __asyncGenerator(this, arguments, function executeTeammateIdleHooks_1(teammateName, teamName, permissionMode, signal, timeoutMs) {
        var hookInput;
        if (timeoutMs === void 0) { timeoutMs = TOOL_HOOK_EXECUTION_TIMEOUT_MS; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    hookInput = __assign(__assign({}, createBaseHookInput(permissionMode)), { hook_event_name: 'TeammateIdle', teammate_name: teammateName, team_name: teamName });
                    return [5 /*yield**/, __values(__asyncDelegator(__asyncValues(executeHooks({
                            hookInput: hookInput,
                            toolUseID: (0, crypto_1.randomUUID)(),
                            signal: signal,
                            timeoutMs: timeoutMs,
                        }))))];
                case 1: return [4 /*yield*/, __await.apply(void 0, [_a.sent()])];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Execute TaskCreated hooks when a task is being created.
 * If a hook blocks (exit code 2), the task creation should be prevented and feedback returned.
 * @param taskId The ID of the task being created
 * @param taskSubject The subject/title of the task
 * @param taskDescription Optional description of the task
 * @param teammateName Optional name of the teammate creating the task
 * @param teamName Optional team name
 * @param permissionMode Optional permission mode
 * @param signal Optional AbortSignal to cancel hook execution
 * @param timeoutMs Optional timeout in milliseconds for hook execution
 * @param toolUseContext Optional ToolUseContext for resolving appState and sessionId
 * @returns Async generator that yields progress messages and blocking errors
 */
function executeTaskCreatedHooks(taskId_1, taskSubject_1, taskDescription_1, teammateName_1, teamName_1, permissionMode_1, signal_1) {
    return __asyncGenerator(this, arguments, function executeTaskCreatedHooks_1(taskId, taskSubject, taskDescription, teammateName, teamName, permissionMode, signal, timeoutMs, toolUseContext) {
        var hookInput;
        if (timeoutMs === void 0) { timeoutMs = TOOL_HOOK_EXECUTION_TIMEOUT_MS; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    hookInput = __assign(__assign({}, createBaseHookInput(permissionMode)), { hook_event_name: 'TaskCreated', task_id: taskId, task_subject: taskSubject, task_description: taskDescription, teammate_name: teammateName, team_name: teamName });
                    return [5 /*yield**/, __values(__asyncDelegator(__asyncValues(executeHooks({
                            hookInput: hookInput,
                            toolUseID: (0, crypto_1.randomUUID)(),
                            signal: signal,
                            timeoutMs: timeoutMs,
                            toolUseContext: toolUseContext,
                        }))))];
                case 1: return [4 /*yield*/, __await.apply(void 0, [_a.sent()])];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Execute TaskCompleted hooks when a task is being marked as completed.
 * If a hook blocks (exit code 2), the task completion should be prevented and feedback returned.
 * @param taskId The ID of the task being completed
 * @param taskSubject The subject/title of the task
 * @param taskDescription Optional description of the task
 * @param teammateName Optional name of the teammate completing the task
 * @param teamName Optional team name
 * @param permissionMode Optional permission mode
 * @param signal Optional AbortSignal to cancel hook execution
 * @param timeoutMs Optional timeout in milliseconds for hook execution
 * @param toolUseContext Optional ToolUseContext for resolving appState and sessionId
 * @returns Async generator that yields progress messages and blocking errors
 */
function executeTaskCompletedHooks(taskId_1, taskSubject_1, taskDescription_1, teammateName_1, teamName_1, permissionMode_1, signal_1) {
    return __asyncGenerator(this, arguments, function executeTaskCompletedHooks_1(taskId, taskSubject, taskDescription, teammateName, teamName, permissionMode, signal, timeoutMs, toolUseContext) {
        var hookInput;
        if (timeoutMs === void 0) { timeoutMs = TOOL_HOOK_EXECUTION_TIMEOUT_MS; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    hookInput = __assign(__assign({}, createBaseHookInput(permissionMode)), { hook_event_name: 'TaskCompleted', task_id: taskId, task_subject: taskSubject, task_description: taskDescription, teammate_name: teammateName, team_name: teamName });
                    return [5 /*yield**/, __values(__asyncDelegator(__asyncValues(executeHooks({
                            hookInput: hookInput,
                            toolUseID: (0, crypto_1.randomUUID)(),
                            signal: signal,
                            timeoutMs: timeoutMs,
                            toolUseContext: toolUseContext,
                        }))))];
                case 1: return [4 /*yield*/, __await.apply(void 0, [_a.sent()])];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Execute start hooks if configured
 * @param prompt The user prompt that will be passed to the tool
 * @param permissionMode Permission mode from toolPermissionContext
 * @param toolUseContext ToolUseContext for prompt-based hooks
 * @returns Async generator that yields progress messages and hook results
 */
function executeUserPromptSubmitHooks(prompt, permissionMode, toolUseContext, requestPrompt) {
    return __asyncGenerator(this, arguments, function executeUserPromptSubmitHooks_1() {
        var appState, sessionId, hookInput;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    appState = toolUseContext.getAppState();
                    sessionId = (_a = toolUseContext.agentId) !== null && _a !== void 0 ? _a : (0, state_js_1.getSessionId)();
                    if (!!hasHookForEvent('UserPromptSubmit', appState, sessionId)) return [3 /*break*/, 2];
                    return [4 /*yield*/, __await(void 0)];
                case 1: return [2 /*return*/, _b.sent()];
                case 2:
                    hookInput = __assign(__assign({}, createBaseHookInput(permissionMode)), { hook_event_name: 'UserPromptSubmit', prompt: prompt });
                    return [5 /*yield**/, __values(__asyncDelegator(__asyncValues(executeHooks({
                            hookInput: hookInput,
                            toolUseID: (0, crypto_1.randomUUID)(),
                            signal: toolUseContext.abortController.signal,
                            timeoutMs: TOOL_HOOK_EXECUTION_TIMEOUT_MS,
                            toolUseContext: toolUseContext,
                            requestPrompt: requestPrompt,
                        }))))];
                case 3: return [4 /*yield*/, __await.apply(void 0, [_b.sent()])];
                case 4:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Execute session start hooks if configured
 * @param source The source of the session start (startup, resume, clear)
 * @param sessionId Optional The session id to use as hook input
 * @param agentType Optional The agent type (from --agent flag) running this session
 * @param model Optional The model being used for this session
 * @param signal Optional AbortSignal to cancel hook execution
 * @param timeoutMs Optional timeout in milliseconds for hook execution
 * @returns Async generator that yields progress messages and hook results
 */
function executeSessionStartHooks(source_1, sessionId_2, agentType_1, model_1, signal_1) {
    return __asyncGenerator(this, arguments, function executeSessionStartHooks_1(source, sessionId, agentType, model, signal, timeoutMs, forceSyncExecution) {
        var hookInput;
        if (timeoutMs === void 0) { timeoutMs = TOOL_HOOK_EXECUTION_TIMEOUT_MS; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    hookInput = __assign(__assign({}, createBaseHookInput(undefined, sessionId)), { hook_event_name: 'SessionStart', source: source, agent_type: agentType, model: model });
                    return [5 /*yield**/, __values(__asyncDelegator(__asyncValues(executeHooks({
                            hookInput: hookInput,
                            toolUseID: (0, crypto_1.randomUUID)(),
                            matchQuery: source,
                            signal: signal,
                            timeoutMs: timeoutMs,
                            forceSyncExecution: forceSyncExecution,
                        }))))];
                case 1: return [4 /*yield*/, __await.apply(void 0, [_a.sent()])];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Execute setup hooks if configured
 * @param trigger The trigger type ('init' or 'maintenance')
 * @param signal Optional AbortSignal to cancel hook execution
 * @param timeoutMs Optional timeout in milliseconds for hook execution
 * @param forceSyncExecution If true, async hooks will not be backgrounded
 * @returns Async generator that yields progress messages and hook results
 */
function executeSetupHooks(trigger_1, signal_1) {
    return __asyncGenerator(this, arguments, function executeSetupHooks_1(trigger, signal, timeoutMs, forceSyncExecution) {
        var hookInput;
        if (timeoutMs === void 0) { timeoutMs = TOOL_HOOK_EXECUTION_TIMEOUT_MS; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    hookInput = __assign(__assign({}, createBaseHookInput(undefined)), { hook_event_name: 'Setup', trigger: trigger });
                    return [5 /*yield**/, __values(__asyncDelegator(__asyncValues(executeHooks({
                            hookInput: hookInput,
                            toolUseID: (0, crypto_1.randomUUID)(),
                            matchQuery: trigger,
                            signal: signal,
                            timeoutMs: timeoutMs,
                            forceSyncExecution: forceSyncExecution,
                        }))))];
                case 1: return [4 /*yield*/, __await.apply(void 0, [_a.sent()])];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Execute subagent start hooks if configured
 * @param agentId The unique identifier for the subagent
 * @param agentType The type/name of the subagent being started
 * @param signal Optional AbortSignal to cancel hook execution
 * @param timeoutMs Optional timeout in milliseconds for hook execution
 * @returns Async generator that yields progress messages and hook results
 */
function executeSubagentStartHooks(agentId_1, agentType_1, signal_1) {
    return __asyncGenerator(this, arguments, function executeSubagentStartHooks_1(agentId, agentType, signal, timeoutMs) {
        var hookInput;
        if (timeoutMs === void 0) { timeoutMs = TOOL_HOOK_EXECUTION_TIMEOUT_MS; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    hookInput = __assign(__assign({}, createBaseHookInput(undefined)), { hook_event_name: 'SubagentStart', agent_id: agentId, agent_type: agentType });
                    return [5 /*yield**/, __values(__asyncDelegator(__asyncValues(executeHooks({
                            hookInput: hookInput,
                            toolUseID: (0, crypto_1.randomUUID)(),
                            matchQuery: agentType,
                            signal: signal,
                            timeoutMs: timeoutMs,
                        }))))];
                case 1: return [4 /*yield*/, __await.apply(void 0, [_a.sent()])];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Execute pre-compact hooks if configured
 * @param compactData The compact data to pass to hooks
 * @param signal Optional AbortSignal to cancel hook execution
 * @param timeoutMs Optional timeout in milliseconds for hook execution
 * @returns Object with optional newCustomInstructions and userDisplayMessage
 */
function executePreCompactHooks(compactData_1, signal_1) {
    return __awaiter(this, arguments, void 0, function (compactData, signal, timeoutMs) {
        var hookInput, results, successfulOutputs, displayMessages, _i, results_1, result;
        if (timeoutMs === void 0) { timeoutMs = TOOL_HOOK_EXECUTION_TIMEOUT_MS; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    hookInput = __assign(__assign({}, createBaseHookInput(undefined)), { hook_event_name: 'PreCompact', trigger: compactData.trigger, custom_instructions: compactData.customInstructions });
                    return [4 /*yield*/, executeHooksOutsideREPL({
                            hookInput: hookInput,
                            matchQuery: compactData.trigger,
                            signal: signal,
                            timeoutMs: timeoutMs,
                        })];
                case 1:
                    results = _a.sent();
                    if (results.length === 0) {
                        return [2 /*return*/, {}];
                    }
                    successfulOutputs = results
                        .filter(function (result) { return result.succeeded && result.output.trim().length > 0; })
                        .map(function (result) { return result.output.trim(); });
                    displayMessages = [];
                    for (_i = 0, results_1 = results; _i < results_1.length; _i++) {
                        result = results_1[_i];
                        if (result.succeeded) {
                            if (result.output.trim()) {
                                displayMessages.push("PreCompact [".concat(result.command, "] completed successfully: ").concat(result.output.trim()));
                            }
                            else {
                                displayMessages.push("PreCompact [".concat(result.command, "] completed successfully"));
                            }
                        }
                        else {
                            if (result.output.trim()) {
                                displayMessages.push("PreCompact [".concat(result.command, "] failed: ").concat(result.output.trim()));
                            }
                            else {
                                displayMessages.push("PreCompact [".concat(result.command, "] failed"));
                            }
                        }
                    }
                    return [2 /*return*/, {
                            newCustomInstructions: successfulOutputs.length > 0 ? successfulOutputs.join('\n\n') : undefined,
                            userDisplayMessage: displayMessages.length > 0 ? displayMessages.join('\n') : undefined,
                        }];
            }
        });
    });
}
/**
 * Execute post-compact hooks if configured
 * @param compactData The compact data to pass to hooks, including the summary
 * @param signal Optional AbortSignal to cancel hook execution
 * @param timeoutMs Optional timeout in milliseconds for hook execution
 * @returns Object with optional userDisplayMessage
 */
function executePostCompactHooks(compactData_1, signal_1) {
    return __awaiter(this, arguments, void 0, function (compactData, signal, timeoutMs) {
        var hookInput, results, displayMessages, _i, results_2, result;
        if (timeoutMs === void 0) { timeoutMs = TOOL_HOOK_EXECUTION_TIMEOUT_MS; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    hookInput = __assign(__assign({}, createBaseHookInput(undefined)), { hook_event_name: 'PostCompact', trigger: compactData.trigger, compact_summary: compactData.compactSummary });
                    return [4 /*yield*/, executeHooksOutsideREPL({
                            hookInput: hookInput,
                            matchQuery: compactData.trigger,
                            signal: signal,
                            timeoutMs: timeoutMs,
                        })];
                case 1:
                    results = _a.sent();
                    if (results.length === 0) {
                        return [2 /*return*/, {}];
                    }
                    displayMessages = [];
                    for (_i = 0, results_2 = results; _i < results_2.length; _i++) {
                        result = results_2[_i];
                        if (result.succeeded) {
                            if (result.output.trim()) {
                                displayMessages.push("PostCompact [".concat(result.command, "] completed successfully: ").concat(result.output.trim()));
                            }
                            else {
                                displayMessages.push("PostCompact [".concat(result.command, "] completed successfully"));
                            }
                        }
                        else {
                            if (result.output.trim()) {
                                displayMessages.push("PostCompact [".concat(result.command, "] failed: ").concat(result.output.trim()));
                            }
                            else {
                                displayMessages.push("PostCompact [".concat(result.command, "] failed"));
                            }
                        }
                    }
                    return [2 /*return*/, {
                            userDisplayMessage: displayMessages.length > 0 ? displayMessages.join('\n') : undefined,
                        }];
            }
        });
    });
}
/**
 * Execute session end hooks if configured
 * @param reason The reason for ending the session
 * @param options Optional parameters including app state functions and signal
 * @returns Promise that resolves when all hooks complete
 */
function executeSessionEndHooks(reason, options) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, getAppState, setAppState, signal, _b, timeoutMs, hookInput, results, _i, results_3, result, sessionId;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _a = options || {}, getAppState = _a.getAppState, setAppState = _a.setAppState, signal = _a.signal, _b = _a.timeoutMs, timeoutMs = _b === void 0 ? TOOL_HOOK_EXECUTION_TIMEOUT_MS : _b;
                    hookInput = __assign(__assign({}, createBaseHookInput(undefined)), { hook_event_name: 'SessionEnd', reason: reason });
                    return [4 /*yield*/, executeHooksOutsideREPL({
                            getAppState: getAppState,
                            hookInput: hookInput,
                            matchQuery: reason,
                            signal: signal,
                            timeoutMs: timeoutMs,
                        })
                        // During shutdown, Ink is unmounted so we can write directly to stderr
                    ];
                case 1:
                    results = _c.sent();
                    // During shutdown, Ink is unmounted so we can write directly to stderr
                    for (_i = 0, results_3 = results; _i < results_3.length; _i++) {
                        result = results_3[_i];
                        if (!result.succeeded && result.output) {
                            process.stderr.write("SessionEnd hook [".concat(result.command, "] failed: ").concat(result.output, "\n"));
                        }
                    }
                    // Clear session hooks after execution
                    if (setAppState) {
                        sessionId = (0, state_js_1.getSessionId)();
                        (0, sessionHooks_js_1.clearSessionHooks)(setAppState, sessionId);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Execute permission request hooks if configured
 * These hooks are called when a permission dialog would be displayed to the user.
 * Hooks can approve or deny the permission request programmatically.
 * @param toolName The name of the tool requesting permission
 * @param toolUseID The ID of the tool use
 * @param toolInput The input that would be passed to the tool
 * @param toolUseContext ToolUseContext for the request
 * @param permissionMode Optional permission mode from toolPermissionContext
 * @param permissionSuggestions Optional permission suggestions (the "always allow" options)
 * @param signal Optional AbortSignal to cancel hook execution
 * @param timeoutMs Optional timeout in milliseconds for hook execution
 * @returns Async generator that yields progress messages and returns aggregated result
 */
function executePermissionRequestHooks(toolName_1, toolUseID_1, toolInput_1, toolUseContext_1, permissionMode_1, permissionSuggestions_1, signal_1) {
    return __asyncGenerator(this, arguments, function executePermissionRequestHooks_1(toolName, toolUseID, toolInput, toolUseContext, permissionMode, permissionSuggestions, signal, timeoutMs, requestPrompt, toolInputSummary) {
        var hookInput;
        if (timeoutMs === void 0) { timeoutMs = TOOL_HOOK_EXECUTION_TIMEOUT_MS; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, debug_js_1.logForDebugging)("executePermissionRequestHooks called for tool: ".concat(toolName));
                    hookInput = __assign(__assign({}, createBaseHookInput(permissionMode, undefined, toolUseContext)), { hook_event_name: 'PermissionRequest', tool_name: toolName, tool_input: toolInput, permission_suggestions: permissionSuggestions });
                    return [5 /*yield**/, __values(__asyncDelegator(__asyncValues(executeHooks({
                            hookInput: hookInput,
                            toolUseID: toolUseID,
                            matchQuery: toolName,
                            signal: signal,
                            timeoutMs: timeoutMs,
                            toolUseContext: toolUseContext,
                            requestPrompt: requestPrompt,
                            toolInputSummary: toolInputSummary,
                        }))))];
                case 1: return [4 /*yield*/, __await.apply(void 0, [_a.sent()])];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Execute config change hooks when configuration files change during a session.
 * Fired by file watchers when settings, skills, or commands change on disk.
 * Enables enterprise admins to audit/log configuration changes for security.
 *
 * Policy settings are enterprise-managed and must never be blockable by hooks.
 * Hooks still fire (for audit logging) but blocking results are ignored — callers
 * will always see an empty result for policy sources.
 *
 * @param source The type of config that changed
 * @param filePath Optional path to the changed file
 * @param timeoutMs Optional timeout in milliseconds for hook execution
 */
function executeConfigChangeHooks(source_1, filePath_1) {
    return __awaiter(this, arguments, void 0, function (source, filePath, timeoutMs) {
        var hookInput, results;
        if (timeoutMs === void 0) { timeoutMs = TOOL_HOOK_EXECUTION_TIMEOUT_MS; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    hookInput = __assign(__assign({}, createBaseHookInput(undefined)), { hook_event_name: 'ConfigChange', source: source, file_path: filePath });
                    return [4 /*yield*/, executeHooksOutsideREPL({
                            hookInput: hookInput,
                            timeoutMs: timeoutMs,
                            matchQuery: source,
                        })
                        // Policy settings are enterprise-managed — hooks fire for audit logging
                        // but must never block policy changes from being applied
                    ];
                case 1:
                    results = _a.sent();
                    // Policy settings are enterprise-managed — hooks fire for audit logging
                    // but must never block policy changes from being applied
                    if (source === 'policy_settings') {
                        return [2 /*return*/, results.map(function (r) { return (__assign(__assign({}, r), { blocked: false })); })];
                    }
                    return [2 /*return*/, results];
            }
        });
    });
}
function executeEnvHooks(hookInput, timeoutMs) {
    return __awaiter(this, void 0, void 0, function () {
        var results, watchPaths, systemMessages;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, executeHooksOutsideREPL({ hookInput: hookInput, timeoutMs: timeoutMs })];
                case 1:
                    results = _a.sent();
                    if (results.length > 0) {
                        (0, sessionEnvironment_js_1.invalidateSessionEnvCache)();
                    }
                    watchPaths = results.flatMap(function (r) { var _a; return (_a = r.watchPaths) !== null && _a !== void 0 ? _a : []; });
                    systemMessages = results
                        .map(function (r) { return r.systemMessage; })
                        .filter(function (m) { return !!m; });
                    return [2 /*return*/, { results: results, watchPaths: watchPaths, systemMessages: systemMessages }];
            }
        });
    });
}
function executeCwdChangedHooks(oldCwd, newCwd, timeoutMs) {
    if (timeoutMs === void 0) { timeoutMs = TOOL_HOOK_EXECUTION_TIMEOUT_MS; }
    var hookInput = __assign(__assign({}, createBaseHookInput(undefined)), { hook_event_name: 'CwdChanged', old_cwd: oldCwd, new_cwd: newCwd });
    return executeEnvHooks(hookInput, timeoutMs);
}
function executeFileChangedHooks(filePath, event, timeoutMs) {
    if (timeoutMs === void 0) { timeoutMs = TOOL_HOOK_EXECUTION_TIMEOUT_MS; }
    var hookInput = __assign(__assign({}, createBaseHookInput(undefined)), { hook_event_name: 'FileChanged', file_path: filePath, event: event });
    return executeEnvHooks(hookInput, timeoutMs);
}
/**
 * Check if InstructionsLoaded hooks are configured (without executing them).
 * Callers should check this before invoking executeInstructionsLoadedHooks to avoid
 * building hook inputs for every instruction file when no hook is configured.
 *
 * Checks both settings-file hooks (getHooksConfigFromSnapshot) and registered
 * hooks (plugin hooks + SDK callback hooks via registerHookCallbacks). Session-
 * derived hooks (structured output enforcement etc.) are internal and not checked.
 */
function hasInstructionsLoadedHook() {
    var _a, _b;
    var snapshotHooks = (_a = (0, hooksConfigSnapshot_js_1.getHooksConfigFromSnapshot)()) === null || _a === void 0 ? void 0 : _a['InstructionsLoaded'];
    if (snapshotHooks && snapshotHooks.length > 0)
        return true;
    var registeredHooks = (_b = (0, state_js_1.getRegisteredHooks)()) === null || _b === void 0 ? void 0 : _b['InstructionsLoaded'];
    if (registeredHooks && registeredHooks.length > 0)
        return true;
    return false;
}
/**
 * Execute InstructionsLoaded hooks when an instruction file (CLAUDE.md or
 * .claude/rules/*.md) is loaded into context. Fire-and-forget — this hook is
 * for observability/audit only and does not support blocking.
 *
 * Dispatch sites:
 * - Eager load at session start (getMemoryFiles in claudemd.ts)
 * - Eager reload after compaction (getMemoryFiles cache cleared by
 *   runPostCompactCleanup; next call reports load_reason: 'compact')
 * - Lazy load when Claude touches a file that triggers nested CLAUDE.md or
 *   conditional rules with paths: frontmatter (memoryFilesToAttachments in
 *   attachments.ts)
 */
function executeInstructionsLoadedHooks(filePath, memoryType, loadReason, options) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, globs, triggerFilePath, parentFilePath, _b, timeoutMs, hookInput;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _a = options !== null && options !== void 0 ? options : {}, globs = _a.globs, triggerFilePath = _a.triggerFilePath, parentFilePath = _a.parentFilePath, _b = _a.timeoutMs, timeoutMs = _b === void 0 ? TOOL_HOOK_EXECUTION_TIMEOUT_MS : _b;
                    hookInput = __assign(__assign({}, createBaseHookInput(undefined)), { hook_event_name: 'InstructionsLoaded', file_path: filePath, memory_type: memoryType, load_reason: loadReason, globs: globs, trigger_file_path: triggerFilePath, parent_file_path: parentFilePath });
                    return [4 /*yield*/, executeHooksOutsideREPL({
                            hookInput: hookInput,
                            timeoutMs: timeoutMs,
                            matchQuery: loadReason,
                        })];
                case 1:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Parse elicitation-specific fields from a HookOutsideReplResult.
 * Mirrors the relevant branches of processHookJSONOutput for Elicitation
 * and ElicitationResult hook events.
 */
function parseElicitationHookOutput(result, expectedEventName) {
    // Exit code 2 = blocking (same as executeHooks path)
    if (result.blocked && !result.succeeded) {
        return {
            blockingError: {
                blockingError: result.output || "Elicitation blocked by hook",
                command: result.command,
            },
        };
    }
    if (!result.output.trim()) {
        return {};
    }
    // Try to parse JSON output for structured elicitation response
    var trimmed = result.output.trim();
    if (!trimmed.startsWith('{')) {
        return {};
    }
    try {
        var parsed = (0, hooks_js_1.hookJSONOutputSchema)().parse(JSON.parse(trimmed));
        if ((0, hooks_js_1.isAsyncHookJSONOutput)(parsed)) {
            return {};
        }
        if (!(0, hooks_js_1.isSyncHookJSONOutput)(parsed)) {
            return {};
        }
        // Check for top-level decision: 'block' (exit code 0 + JSON block)
        if (parsed.decision === 'block' || result.blocked) {
            return {
                blockingError: {
                    blockingError: parsed.reason || 'Elicitation blocked by hook',
                    command: result.command,
                },
            };
        }
        var specific = parsed.hookSpecificOutput;
        if (!specific || specific.hookEventName !== expectedEventName) {
            return {};
        }
        if (!specific.action) {
            return {};
        }
        var response = {
            action: specific.action,
            content: specific.content,
        };
        var out = { response: response };
        if (specific.action === 'decline') {
            out.blockingError = {
                blockingError: parsed.reason ||
                    (expectedEventName === 'Elicitation'
                        ? 'Elicitation denied by hook'
                        : 'Elicitation result blocked by hook'),
                command: result.command,
            };
        }
        return out;
    }
    catch (_a) {
        return {};
    }
}
function executeElicitationHooks(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var hookInput, results, elicitationResponse, blockingError, _i, results_4, result, parsed;
        var serverName = _b.serverName, message = _b.message, requestedSchema = _b.requestedSchema, permissionMode = _b.permissionMode, signal = _b.signal, _c = _b.timeoutMs, timeoutMs = _c === void 0 ? TOOL_HOOK_EXECUTION_TIMEOUT_MS : _c, mode = _b.mode, url = _b.url, elicitationId = _b.elicitationId;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    hookInput = __assign(__assign({}, createBaseHookInput(permissionMode)), { hook_event_name: 'Elicitation', mcp_server_name: serverName, message: message, mode: mode, url: url, elicitation_id: elicitationId, requested_schema: requestedSchema });
                    return [4 /*yield*/, executeHooksOutsideREPL({
                            hookInput: hookInput,
                            matchQuery: serverName,
                            signal: signal,
                            timeoutMs: timeoutMs,
                        })];
                case 1:
                    results = _d.sent();
                    for (_i = 0, results_4 = results; _i < results_4.length; _i++) {
                        result = results_4[_i];
                        parsed = parseElicitationHookOutput(result, 'Elicitation');
                        if (parsed.blockingError) {
                            blockingError = parsed.blockingError;
                        }
                        if (parsed.response) {
                            elicitationResponse = parsed.response;
                        }
                    }
                    return [2 /*return*/, { elicitationResponse: elicitationResponse, blockingError: blockingError }];
            }
        });
    });
}
function executeElicitationResultHooks(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var hookInput, results, elicitationResultResponse, blockingError, _i, results_5, result, parsed;
        var serverName = _b.serverName, action = _b.action, content = _b.content, permissionMode = _b.permissionMode, signal = _b.signal, _c = _b.timeoutMs, timeoutMs = _c === void 0 ? TOOL_HOOK_EXECUTION_TIMEOUT_MS : _c, mode = _b.mode, elicitationId = _b.elicitationId;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    hookInput = __assign(__assign({}, createBaseHookInput(permissionMode)), { hook_event_name: 'ElicitationResult', mcp_server_name: serverName, elicitation_id: elicitationId, mode: mode, action: action, content: content });
                    return [4 /*yield*/, executeHooksOutsideREPL({
                            hookInput: hookInput,
                            matchQuery: serverName,
                            signal: signal,
                            timeoutMs: timeoutMs,
                        })];
                case 1:
                    results = _d.sent();
                    for (_i = 0, results_5 = results; _i < results_5.length; _i++) {
                        result = results_5[_i];
                        parsed = parseElicitationHookOutput(result, 'ElicitationResult');
                        if (parsed.blockingError) {
                            blockingError = parsed.blockingError;
                        }
                        if (parsed.response) {
                            elicitationResultResponse = parsed.response;
                        }
                    }
                    return [2 /*return*/, { elicitationResultResponse: elicitationResultResponse, blockingError: blockingError }];
            }
        });
    });
}
/**
 * Execute status line command if configured
 * @param statusLineInput The structured status input that will be converted to JSON
 * @param signal Optional AbortSignal to cancel hook execution
 * @param timeoutMs Optional timeout in milliseconds for hook execution
 * @returns The status line text to display, or undefined if no command configured
 */
function executeStatusLineCommand(statusLineInput_1, signal_1) {
    return __awaiter(this, arguments, void 0, function (statusLineInput, signal, timeoutMs, // Short timeout for status line
    logResult) {
        var statusLine, abortSignal, jsonInput, result, output, error_6;
        var _a, _b;
        if (timeoutMs === void 0) { timeoutMs = 5000; }
        if (logResult === void 0) { logResult = false; }
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    // Check if all hooks (including statusLine) are disabled by managed settings
                    if ((0, hooksConfigSnapshot_js_1.shouldDisableAllHooksIncludingManaged)()) {
                        return [2 /*return*/, undefined];
                    }
                    // SECURITY: ALL hooks require workspace trust in interactive mode
                    // This centralized check prevents RCE vulnerabilities for all current and future hooks
                    if (shouldSkipHookDueToTrust()) {
                        (0, debug_js_1.logForDebugging)("Skipping StatusLine command execution - workspace trust not accepted");
                        return [2 /*return*/, undefined];
                    }
                    if ((0, hooksConfigSnapshot_js_1.shouldAllowManagedHooksOnly)()) {
                        statusLine = (_a = (0, settings_js_1.getSettingsForSource)('policySettings')) === null || _a === void 0 ? void 0 : _a.statusLine;
                    }
                    else {
                        statusLine = (_b = (0, settings_js_1.getSettings_DEPRECATED)()) === null || _b === void 0 ? void 0 : _b.statusLine;
                    }
                    if (!statusLine || statusLine.type !== 'command') {
                        return [2 /*return*/, undefined];
                    }
                    abortSignal = signal || AbortSignal.timeout(timeoutMs);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    jsonInput = (0, slowOperations_js_1.jsonStringify)(statusLineInput);
                    return [4 /*yield*/, execCommandHook(statusLine, 'StatusLine', 'statusLine', jsonInput, abortSignal, (0, crypto_1.randomUUID)())];
                case 2:
                    result = _c.sent();
                    if (result.aborted) {
                        return [2 /*return*/, undefined];
                    }
                    // For successful hooks (exit code 0), use stdout
                    if (result.status === 0) {
                        output = result.stdout
                            .trim()
                            .split('\n')
                            .flatMap(function (line) { return line.trim() || []; })
                            .join('\n');
                        if (output) {
                            if (logResult) {
                                (0, debug_js_1.logForDebugging)("StatusLine [".concat(statusLine.command, "] completed with status ").concat(result.status));
                            }
                            return [2 /*return*/, output];
                        }
                    }
                    else if (logResult) {
                        (0, debug_js_1.logForDebugging)("StatusLine [".concat(statusLine.command, "] completed with status ").concat(result.status), { level: 'warn' });
                    }
                    return [2 /*return*/, undefined];
                case 3:
                    error_6 = _c.sent();
                    (0, debug_js_1.logForDebugging)("Status hook failed: ".concat(error_6), { level: 'error' });
                    return [2 /*return*/, undefined];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Execute file suggestion command if configured
 * @param fileSuggestionInput The structured input that will be converted to JSON
 * @param signal Optional AbortSignal to cancel hook execution
 * @param timeoutMs Optional timeout in milliseconds for hook execution
 * @returns Array of file paths, or empty array if no command configured
 */
function executeFileSuggestionCommand(fileSuggestionInput_1, signal_1) {
    return __awaiter(this, arguments, void 0, function (fileSuggestionInput, signal, timeoutMs) {
        var fileSuggestion, abortSignal, jsonInput, hook, result, error_7;
        var _a, _b;
        if (timeoutMs === void 0) { timeoutMs = 5000; }
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    // Check if all hooks are disabled by managed settings
                    if ((0, hooksConfigSnapshot_js_1.shouldDisableAllHooksIncludingManaged)()) {
                        return [2 /*return*/, []];
                    }
                    // SECURITY: ALL hooks require workspace trust in interactive mode
                    // This centralized check prevents RCE vulnerabilities for all current and future hooks
                    if (shouldSkipHookDueToTrust()) {
                        (0, debug_js_1.logForDebugging)("Skipping FileSuggestion command execution - workspace trust not accepted");
                        return [2 /*return*/, []];
                    }
                    if ((0, hooksConfigSnapshot_js_1.shouldAllowManagedHooksOnly)()) {
                        fileSuggestion = (_a = (0, settings_js_1.getSettingsForSource)('policySettings')) === null || _a === void 0 ? void 0 : _a.fileSuggestion;
                    }
                    else {
                        fileSuggestion = (_b = (0, settings_js_1.getSettings_DEPRECATED)()) === null || _b === void 0 ? void 0 : _b.fileSuggestion;
                    }
                    if (!fileSuggestion || fileSuggestion.type !== 'command') {
                        return [2 /*return*/, []];
                    }
                    abortSignal = signal || AbortSignal.timeout(timeoutMs);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    jsonInput = (0, slowOperations_js_1.jsonStringify)(fileSuggestionInput);
                    hook = { type: 'command', command: fileSuggestion.command };
                    return [4 /*yield*/, execCommandHook(hook, 'FileSuggestion', 'FileSuggestion', jsonInput, abortSignal, (0, crypto_1.randomUUID)())];
                case 2:
                    result = _c.sent();
                    if (result.aborted || result.status !== 0) {
                        return [2 /*return*/, []];
                    }
                    return [2 /*return*/, result.stdout
                            .split('\n')
                            .map(function (line) { return line.trim(); })
                            .filter(Boolean)];
                case 3:
                    error_7 = _c.sent();
                    (0, debug_js_1.logForDebugging)("File suggestion helper failed: ".concat(error_7), {
                        level: 'error',
                    });
                    return [2 /*return*/, []];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function executeFunctionHook(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var callbackTimeoutMs, _c, abortSignal, cleanup, passed, error_8;
        var _d;
        var hook = _b.hook, messages = _b.messages, hookName = _b.hookName, toolUseID = _b.toolUseID, hookEvent = _b.hookEvent, timeoutMs = _b.timeoutMs, signal = _b.signal;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    callbackTimeoutMs = (_d = hook.timeout) !== null && _d !== void 0 ? _d : timeoutMs;
                    _c = (0, combinedAbortSignal_js_1.createCombinedAbortSignal)(signal, {
                        timeoutMs: callbackTimeoutMs,
                    }), abortSignal = _c.signal, cleanup = _c.cleanup;
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 3, , 4]);
                    // Check if already aborted
                    if (abortSignal.aborted) {
                        cleanup();
                        return [2 /*return*/, {
                                outcome: 'cancelled',
                                hook: hook,
                            }];
                    }
                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                            // Handle abort signal
                            var onAbort = function () { return reject(new Error('Function hook cancelled')); };
                            abortSignal.addEventListener('abort', onAbort);
                            // Execute callback
                            Promise.resolve(hook.callback(messages, abortSignal))
                                .then(function (result) {
                                abortSignal.removeEventListener('abort', onAbort);
                                resolve(result);
                            })
                                .catch(function (error) {
                                abortSignal.removeEventListener('abort', onAbort);
                                reject(error);
                            });
                        })];
                case 2:
                    passed = _e.sent();
                    cleanup();
                    if (passed) {
                        return [2 /*return*/, {
                                outcome: 'success',
                                hook: hook,
                            }];
                    }
                    return [2 /*return*/, {
                            blockingError: {
                                blockingError: hook.errorMessage,
                                command: 'function',
                            },
                            outcome: 'blocking',
                            hook: hook,
                        }];
                case 3:
                    error_8 = _e.sent();
                    cleanup();
                    // Handle cancellation
                    if (error_8 instanceof Error &&
                        (error_8.message === 'Function hook cancelled' ||
                            error_8.name === 'AbortError')) {
                        return [2 /*return*/, {
                                outcome: 'cancelled',
                                hook: hook,
                            }];
                    }
                    // Log for monitoring
                    (0, log_js_1.logError)(error_8);
                    return [2 /*return*/, {
                            message: (0, attachments_js_1.createAttachmentMessage)({
                                type: 'hook_error_during_execution',
                                hookName: hookName,
                                toolUseID: toolUseID,
                                hookEvent: hookEvent,
                                content: error_8 instanceof Error
                                    ? error_8.message
                                    : 'Function hook execution error',
                            }),
                            outcome: 'non_blocking_error',
                            hook: hook,
                        }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function executeHookCallback(_a) {
    return __awaiter(this, arguments, void 0, function (_b) {
        var context, json, processed;
        var toolUseID = _b.toolUseID, hook = _b.hook, hookEvent = _b.hookEvent, hookInput = _b.hookInput, signal = _b.signal, hookIndex = _b.hookIndex, toolUseContext = _b.toolUseContext;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    context = toolUseContext
                        ? {
                            getAppState: toolUseContext.getAppState,
                            updateAttributionState: toolUseContext.updateAttributionState,
                        }
                        : undefined;
                    return [4 /*yield*/, hook.callback(hookInput, toolUseID, signal, hookIndex, context)];
                case 1:
                    json = _c.sent();
                    if ((0, hooks_js_1.isAsyncHookJSONOutput)(json)) {
                        return [2 /*return*/, {
                                outcome: 'success',
                                hook: hook,
                            }];
                    }
                    processed = processHookJSONOutput({
                        json: json,
                        command: 'callback',
                        // TODO: If the hook came from a plugin, use the full path to the plugin for easier debugging
                        hookName: "".concat(hookEvent, ":Callback"),
                        toolUseID: toolUseID,
                        hookEvent: hookEvent,
                        expectedHookEvent: hookEvent,
                        // Callbacks don't have stdout/stderr/exitCode
                        stdout: undefined,
                        stderr: undefined,
                        exitCode: undefined,
                    });
                    return [2 /*return*/, __assign(__assign({}, processed), { outcome: 'success', hook: hook })];
            }
        });
    });
}
/**
 * Check if WorktreeCreate hooks are configured (without executing them).
 *
 * Checks both settings-file hooks (getHooksConfigFromSnapshot) and registered
 * hooks (plugin hooks + SDK callback hooks via registerHookCallbacks).
 *
 * Must mirror the managedOnly filtering in getHooksConfig() — when
 * shouldAllowManagedHooksOnly() is true, plugin hooks (pluginRoot set) are
 * skipped at execution, so we must also skip them here. Otherwise this returns
 * true but executeWorktreeCreateHook() finds no matching hooks and throws,
 * blocking the git-worktree fallback.
 */
function hasWorktreeCreateHook() {
    var _a, _b;
    var snapshotHooks = (_a = (0, hooksConfigSnapshot_js_1.getHooksConfigFromSnapshot)()) === null || _a === void 0 ? void 0 : _a['WorktreeCreate'];
    if (snapshotHooks && snapshotHooks.length > 0)
        return true;
    var registeredHooks = (_b = (0, state_js_1.getRegisteredHooks)()) === null || _b === void 0 ? void 0 : _b['WorktreeCreate'];
    if (!registeredHooks || registeredHooks.length === 0)
        return false;
    // Mirror getHooksConfig(): skip plugin hooks in managed-only mode
    var managedOnly = (0, hooksConfigSnapshot_js_1.shouldAllowManagedHooksOnly)();
    return registeredHooks.some(function (matcher) { return !(managedOnly && 'pluginRoot' in matcher); });
}
/**
 * Execute WorktreeCreate hooks.
 * Returns the worktree path from hook stdout.
 * Throws if hooks fail or produce no output.
 * Callers should check hasWorktreeCreateHook() before calling this.
 */
function executeWorktreeCreateHook(name) {
    return __awaiter(this, void 0, void 0, function () {
        var hookInput, results, successfulResult, failedOutputs, worktreePath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    hookInput = __assign(__assign({}, createBaseHookInput(undefined)), { hook_event_name: 'WorktreeCreate', name: name });
                    return [4 /*yield*/, executeHooksOutsideREPL({
                            hookInput: hookInput,
                            timeoutMs: TOOL_HOOK_EXECUTION_TIMEOUT_MS,
                        })
                        // Find the first successful result with non-empty output
                    ];
                case 1:
                    results = _a.sent();
                    successfulResult = results.find(function (r) { return r.succeeded && r.output.trim().length > 0; });
                    if (!successfulResult) {
                        failedOutputs = results
                            .filter(function (r) { return !r.succeeded; })
                            .map(function (r) { return "".concat(r.command, ": ").concat(r.output.trim() || 'no output'); });
                        throw new Error("WorktreeCreate hook failed: ".concat(failedOutputs.join('; ') || 'no successful output'));
                    }
                    worktreePath = successfulResult.output.trim();
                    return [2 /*return*/, { worktreePath: worktreePath }];
            }
        });
    });
}
/**
 * Execute WorktreeRemove hooks if configured.
 * Returns true if hooks were configured and ran, false if no hooks are configured.
 *
 * Checks both settings-file hooks (getHooksConfigFromSnapshot) and registered
 * hooks (plugin hooks + SDK callback hooks via registerHookCallbacks).
 */
function executeWorktreeRemoveHook(worktreePath) {
    return __awaiter(this, void 0, void 0, function () {
        var snapshotHooks, registeredHooks, hasSnapshotHooks, hasRegisteredHooks, hookInput, results, _i, results_6, result;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    snapshotHooks = (_a = (0, hooksConfigSnapshot_js_1.getHooksConfigFromSnapshot)()) === null || _a === void 0 ? void 0 : _a['WorktreeRemove'];
                    registeredHooks = (_b = (0, state_js_1.getRegisteredHooks)()) === null || _b === void 0 ? void 0 : _b['WorktreeRemove'];
                    hasSnapshotHooks = snapshotHooks && snapshotHooks.length > 0;
                    hasRegisteredHooks = registeredHooks && registeredHooks.length > 0;
                    if (!hasSnapshotHooks && !hasRegisteredHooks) {
                        return [2 /*return*/, false];
                    }
                    hookInput = __assign(__assign({}, createBaseHookInput(undefined)), { hook_event_name: 'WorktreeRemove', worktree_path: worktreePath });
                    return [4 /*yield*/, executeHooksOutsideREPL({
                            hookInput: hookInput,
                            timeoutMs: TOOL_HOOK_EXECUTION_TIMEOUT_MS,
                        })];
                case 1:
                    results = _c.sent();
                    if (results.length === 0) {
                        return [2 /*return*/, false];
                    }
                    for (_i = 0, results_6 = results; _i < results_6.length; _i++) {
                        result = results_6[_i];
                        if (!result.succeeded) {
                            (0, debug_js_1.logForDebugging)("WorktreeRemove hook failed [".concat(result.command, "]: ").concat(result.output.trim()), { level: 'error' });
                        }
                    }
                    return [2 /*return*/, true];
            }
        });
    });
}
function getHookDefinitionsForTelemetry(matchedHooks) {
    return matchedHooks.map(function (_a) {
        var hook = _a.hook;
        if (hook.type === 'command') {
            return { type: 'command', command: hook.command };
        }
        else if (hook.type === 'prompt') {
            return { type: 'prompt', prompt: hook.prompt };
        }
        else if (hook.type === 'http') {
            return { type: 'http', command: hook.url };
        }
        else if (hook.type === 'function') {
            return { type: 'function', name: 'function' };
        }
        else if (hook.type === 'callback') {
            return { type: 'callback', name: 'callback' };
        }
        return { type: 'unknown' };
    });
}
