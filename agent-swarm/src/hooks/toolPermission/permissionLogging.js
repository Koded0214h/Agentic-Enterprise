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
exports.isCodeEditingTool = isCodeEditingTool;
exports.buildCodeEditToolAttributes = buildCodeEditToolAttributes;
exports.logPermissionDecision = logPermissionDecision;
// Centralized analytics/telemetry logging for tool permission decisions.
// All permission approve/reject events flow through logPermissionDecision(),
// which fans out to Statsig analytics, OTel telemetry, and code-edit metrics.
var bun_bundle_1 = require("bun:bundle");
var index_js_1 = require("src/services/analytics/index.js");
var metadata_js_1 = require("src/services/analytics/metadata.js");
var state_js_1 = require("../../bootstrap/state.js");
var cliHighlight_js_1 = require("../../utils/cliHighlight.js");
var sandbox_adapter_js_1 = require("../../utils/sandbox/sandbox-adapter.js");
var events_js_1 = require("../../utils/telemetry/events.js");
var CODE_EDITING_TOOLS = ['Edit', 'Write', 'NotebookEdit'];
function isCodeEditingTool(toolName) {
    return CODE_EDITING_TOOLS.includes(toolName);
}
// Builds OTel counter attributes for code editing tools, enriching with
// language when the tool's target file path can be extracted from input
function buildCodeEditToolAttributes(tool, input, decision, source) {
    return __awaiter(this, void 0, void 0, function () {
        var language, parseResult, filePath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(tool.getPath && input)) return [3 /*break*/, 2];
                    parseResult = tool.inputSchema.safeParse(input);
                    if (!parseResult.success) return [3 /*break*/, 2];
                    filePath = tool.getPath(parseResult.data);
                    if (!filePath) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, cliHighlight_js_1.getLanguageName)(filePath)];
                case 1:
                    language = _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/, __assign({ decision: decision, source: source, tool_name: tool.name }, (language && { language: language }))];
            }
        });
    });
}
// Flattens structured source into a string label for analytics/OTel events
function sourceToString(source) {
    if (((0, bun_bundle_1.feature)('BASH_CLASSIFIER') || (0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER')) &&
        source.type === 'classifier') {
        return 'classifier';
    }
    switch (source.type) {
        case 'hook':
            return 'hook';
        case 'user':
            return source.permanent ? 'user_permanent' : 'user_temporary';
        case 'user_abort':
            return 'user_abort';
        case 'user_reject':
            return 'user_reject';
        default:
            return 'unknown';
    }
}
function baseMetadata(messageId, toolName, waitMs) {
    return __assign({ messageID: messageId, toolName: (0, metadata_js_1.sanitizeToolNameForAnalytics)(toolName), sandboxEnabled: sandbox_adapter_js_1.SandboxManager.isSandboxingEnabled() }, (waitMs !== undefined && { waiting_for_user_permission_ms: waitMs }));
}
// Emits a distinct analytics event name per approval source for funnel analysis
function logApprovalEvent(tool, messageId, source, waitMs) {
    var _a;
    if (source === 'config') {
        // Auto-approved by allowlist in settings -- no user wait time
        (0, index_js_1.logEvent)('tengu_tool_use_granted_in_config', baseMetadata(messageId, tool.name, undefined));
        return;
    }
    if (((0, bun_bundle_1.feature)('BASH_CLASSIFIER') || (0, bun_bundle_1.feature)('TRANSCRIPT_CLASSIFIER')) &&
        source.type === 'classifier') {
        (0, index_js_1.logEvent)('tengu_tool_use_granted_by_classifier', baseMetadata(messageId, tool.name, waitMs));
        return;
    }
    switch (source.type) {
        case 'user':
            (0, index_js_1.logEvent)(source.permanent
                ? 'tengu_tool_use_granted_in_prompt_permanent'
                : 'tengu_tool_use_granted_in_prompt_temporary', baseMetadata(messageId, tool.name, waitMs));
            break;
        case 'hook':
            (0, index_js_1.logEvent)('tengu_tool_use_granted_by_permission_hook', __assign(__assign({}, baseMetadata(messageId, tool.name, waitMs)), { permanent: (_a = source.permanent) !== null && _a !== void 0 ? _a : false }));
            break;
        default:
            break;
    }
}
// Rejections share a single event name, differentiated by metadata fields
function logRejectionEvent(tool, messageId, source, waitMs) {
    if (source === 'config') {
        // Denied by denylist in settings
        (0, index_js_1.logEvent)('tengu_tool_use_denied_in_config', baseMetadata(messageId, tool.name, undefined));
        return;
    }
    (0, index_js_1.logEvent)('tengu_tool_use_rejected_in_prompt', __assign(__assign({}, baseMetadata(messageId, tool.name, waitMs)), (source.type === 'hook'
        ? { isHook: true }
        : {
            hasFeedback: source.type === 'user_reject' ? source.hasFeedback : false,
        })));
}
// Single entry point for all permission decision logging. Called by permission
// handlers after every approve/reject. Fans out to: analytics events, OTel
// telemetry, code-edit OTel counters, and toolUseContext decision storage.
function logPermissionDecision(ctx, args, permissionPromptStartTimeMs) {
    var tool = ctx.tool, input = ctx.input, toolUseContext = ctx.toolUseContext, messageId = ctx.messageId, toolUseID = ctx.toolUseID;
    var decision = args.decision, source = args.source;
    var waiting_for_user_permission_ms = permissionPromptStartTimeMs !== undefined
        ? Date.now() - permissionPromptStartTimeMs
        : undefined;
    // Log the analytics event
    if (args.decision === 'accept') {
        logApprovalEvent(tool, messageId, args.source, waiting_for_user_permission_ms);
    }
    else {
        logRejectionEvent(tool, messageId, args.source, waiting_for_user_permission_ms);
    }
    var sourceString = source === 'config' ? 'config' : sourceToString(source);
    // Track code editing tool metrics
    if (isCodeEditingTool(tool.name)) {
        void buildCodeEditToolAttributes(tool, input, decision, sourceString).then(function (attributes) { var _a; return (_a = (0, state_js_1.getCodeEditToolDecisionCounter)()) === null || _a === void 0 ? void 0 : _a.add(1, attributes); });
    }
    // Persist decision on the context so downstream code can inspect what happened
    if (!toolUseContext.toolDecisions) {
        toolUseContext.toolDecisions = new Map();
    }
    toolUseContext.toolDecisions.set(toolUseID, {
        source: sourceString,
        decision: decision,
        timestamp: Date.now(),
    });
    void (0, events_js_1.logOTelEvent)('tool_decision', {
        decision: decision,
        source: sourceString,
        tool_name: (0, metadata_js_1.sanitizeToolNameForAnalytics)(tool.name),
    });
}
