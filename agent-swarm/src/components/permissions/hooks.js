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
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePermissionRequestLogging = usePermissionRequestLogging;
var bun_bundle_1 = require("bun:bundle");
var react_1 = require("react");
var index_js_1 = require("src/services/analytics/index.js");
var metadata_js_1 = require("src/services/analytics/metadata.js");
var BashTool_js_1 = require("src/tools/BashTool/BashTool.js");
var commands_js_1 = require("src/utils/bash/commands.js");
var PermissionUpdate_js_1 = require("src/utils/permissions/PermissionUpdate.js");
var permissionRuleParser_js_1 = require("src/utils/permissions/permissionRuleParser.js");
var sandbox_adapter_js_1 = require("src/utils/sandbox/sandbox-adapter.js");
var AppState_js_1 = require("../../state/AppState.js");
var env_js_1 = require("../../utils/env.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var unaryLogging_js_1 = require("../../utils/unaryLogging.js");
function permissionResultToLog(permissionResult) {
    switch (permissionResult.behavior) {
        case 'allow':
            return 'allow';
        case 'ask': {
            var rules = (0, PermissionUpdate_js_1.extractRules)(permissionResult.suggestions);
            var suggestions = rules.length > 0
                ? rules.map(function (r) { return (0, permissionRuleParser_js_1.permissionRuleValueToString)(r); }).join(', ')
                : 'none';
            return "ask: ".concat(permissionResult.message, ", \nsuggestions: ").concat(suggestions, "\nreason: ").concat(decisionReasonToString(permissionResult.decisionReason));
        }
        case 'deny':
            return "deny: ".concat(permissionResult.message, ",\nreason: ").concat(decisionReasonToString(permissionResult.decisionReason));
        case 'passthrough': {
            var rules = (0, PermissionUpdate_js_1.extractRules)(permissionResult.suggestions);
            var suggestions = rules.length > 0
                ? rules.map(function (r) { return (0, permissionRuleParser_js_1.permissionRuleValueToString)(r); }).join(', ')
                : 'none';
            return "passthrough: ".concat(permissionResult.message, ",\nsuggestions: ").concat(suggestions, "\nreason: ").concat(decisionReasonToString(permissionResult.decisionReason));
        }
    }
}
function decisionReasonToString(decisionReason) {
    if (!decisionReason) {
        return 'No decision reason';
    }
    if (((0, bun_bundle_1.feature)('BASH_CLASSIFIER') || (0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER')) &&
        decisionReason.type === 'classifier') {
        return "Classifier: ".concat(decisionReason.classifier, ", Reason: ").concat(decisionReason.reason);
    }
    switch (decisionReason.type) {
        case 'rule':
            return "Rule: ".concat((0, permissionRuleParser_js_1.permissionRuleValueToString)(decisionReason.rule.ruleValue));
        case 'mode':
            return "Mode: ".concat(decisionReason.mode);
        case 'subcommandResults':
            return "Subcommand Results: ".concat(Array.from(decisionReason.reasons.entries())
                .map(function (_a) {
                var key = _a[0], value = _a[1];
                return "".concat(key, ": ").concat(permissionResultToLog(value));
            })
                .join(', \n'));
        case 'permissionPromptTool':
            return "Permission Tool: ".concat(decisionReason.permissionPromptToolName, ", Result: ").concat((0, slowOperations_js_1.jsonStringify)(decisionReason.toolResult));
        case 'hook':
            return "Hook: ".concat(decisionReason.hookName).concat(decisionReason.reason ? ", Reason: ".concat(decisionReason.reason) : '');
        case 'workingDir':
            return "Working Directory: ".concat(decisionReason.reason);
        case 'safetyCheck':
            return "Safety check: ".concat(decisionReason.reason);
        case 'other':
            return "Other: ".concat(decisionReason.reason);
        default:
            return (0, slowOperations_js_1.jsonStringify)(decisionReason, null, 2);
    }
}
/**
 * Logs permission request events using analytics and unary logging.
 * Handles both the analytics event and the unary event logging.
 */
function usePermissionRequestLogging(toolUseConfirm, unaryEvent) {
    var setAppState = (0, AppState_js_1.useSetAppState)();
    // Guard against effect re-firing if toolUseConfirm's object reference
    // changes during a single dialog's lifetime (e.g., parent re-renders with a
    // fresh object). Without this, the unconditional setAppState below can
    // cascade into an infinite microtask loop — each re-fire does another
    // setAppState spread + (ant builds) splitCommand → shell-quote regex,
    // pegging CPU at 100% and leaking ~500MB/min in JSRopeString/RegExp allocs.
    // The component is keyed by toolUseID, so this ref resets on remount —
    // we only need to dedupe re-fires WITHIN one dialog instance.
    var loggedToolUseID = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        var _a, _b, _c, _d, _e, _f;
        if (loggedToolUseID.current === toolUseConfirm.toolUseID) {
            return;
        }
        loggedToolUseID.current = toolUseConfirm.toolUseID;
        // Increment permission prompt count for attribution tracking
        setAppState(function (prev) { return (__assign(__assign({}, prev), { attribution: __assign(__assign({}, prev.attribution), { permissionPromptCount: prev.attribution.permissionPromptCount + 1 }) })); });
        // Log analytics event
        (0, index_js_1.logEvent)('tengu_tool_use_show_permission_request', {
            messageID: toolUseConfirm.assistantMessage.message
                .id,
            toolName: (0, metadata_js_1.sanitizeToolNameForAnalytics)(toolUseConfirm.tool.name),
            isMcp: (_a = toolUseConfirm.tool.isMcp) !== null && _a !== void 0 ? _a : false,
            decisionReasonType: (_b = toolUseConfirm.permissionResult.decisionReason) === null || _b === void 0 ? void 0 : _b.type,
            sandboxEnabled: sandbox_adapter_js_1.SandboxManager.isSandboxingEnabled(),
        });
        if (process.env.USER_TYPE === 'ant') {
            var permissionResult = toolUseConfirm.permissionResult;
            if (toolUseConfirm.tool.name === BashTool_js_1.BashTool.name &&
                permissionResult.behavior === 'ask' &&
                !(0, PermissionUpdate_js_1.hasRules)(permissionResult.suggestions)) {
                // Log if no rule suggestions ("always allow") are provided
                (0, index_js_1.logEvent)('tengu_internal_tool_use_permission_request_no_always_allow', {
                    messageID: toolUseConfirm.assistantMessage.message
                        .id,
                    toolName: (0, metadata_js_1.sanitizeToolNameForAnalytics)(toolUseConfirm.tool.name),
                    isMcp: (_c = toolUseConfirm.tool.isMcp) !== null && _c !== void 0 ? _c : false,
                    decisionReasonType: ((_e = (_d = permissionResult.decisionReason) === null || _d === void 0 ? void 0 : _d.type) !== null && _e !== void 0 ? _e : 'unknown'),
                    sandboxEnabled: sandbox_adapter_js_1.SandboxManager.isSandboxingEnabled(),
                    // This DOES contain code/filepaths and should not be logged in the public build!
                    decisionReasonDetails: decisionReasonToString(permissionResult.decisionReason),
                });
            }
        }
        // [ANT-ONLY] Log bash tool calls, so we can categorize
        // & burn down calls that should have been allowed
        if (process.env.USER_TYPE === 'ant') {
            var parsedInput = BashTool_js_1.BashTool.inputSchema.safeParse(toolUseConfirm.input);
            if (toolUseConfirm.tool.name === BashTool_js_1.BashTool.name &&
                toolUseConfirm.permissionResult.behavior === 'ask' &&
                parsedInput.success) {
                // Note: All metadata fields in this event contain code/filepaths
                var split = [parsedInput.data.command];
                try {
                    split = (0, commands_js_1.splitCommand_DEPRECATED)(parsedInput.data.command);
                }
                catch (_g) {
                    // Ignore parse errors here - just log the full command
                }
                (0, index_js_1.logEvent)('tengu_internal_bash_tool_use_permission_request', {
                    parts: (0, slowOperations_js_1.jsonStringify)(split),
                    input: (0, slowOperations_js_1.jsonStringify)(toolUseConfirm.input),
                    decisionReasonType: (_f = toolUseConfirm.permissionResult.decisionReason) === null || _f === void 0 ? void 0 : _f.type,
                    decisionReason: decisionReasonToString(toolUseConfirm.permissionResult.decisionReason),
                });
            }
        }
        void (0, unaryLogging_js_1.logUnaryEvent)({
            completion_type: unaryEvent.completion_type,
            event: 'response',
            metadata: {
                language_name: unaryEvent.language_name,
                message_id: toolUseConfirm.assistantMessage.message.id,
                platform: env_js_1.env.platform,
            },
        });
    }, [toolUseConfirm, unaryEvent, setAppState]);
}
