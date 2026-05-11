"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PERMISSION_HANDLERS = void 0;
var index_js_1 = require("../../../services/analytics/index.js");
var metadata_js_1 = require("../../../services/analytics/metadata.js");
var constants_js_1 = require("../../../tools/FileEditTool/constants.js");
var env_js_1 = require("../../../utils/env.js");
var filesystem_js_1 = require("../../../utils/permissions/filesystem.js");
var unaryLogging_js_1 = require("../../../utils/unaryLogging.js");
function logPermissionEvent(event, completionType, languageName, messageId, hasFeedback) {
    void (0, unaryLogging_js_1.logUnaryEvent)({
        completion_type: completionType,
        event: event,
        metadata: {
            language_name: languageName,
            message_id: messageId,
            platform: env_js_1.env.platform,
            hasFeedback: hasFeedback !== null && hasFeedback !== void 0 ? hasFeedback : false,
        },
    });
}
function handleAcceptOnce(params, options) {
    var _a, _b, _c, _d;
    var messageId = params.messageId, toolUseConfirm = params.toolUseConfirm, onDone = params.onDone, completionType = params.completionType, languageName = params.languageName;
    logPermissionEvent('accept', completionType, languageName, messageId);
    // Log accept submission with feedback context
    (0, index_js_1.logEvent)('tengu_accept_submitted', {
        toolName: (0, metadata_js_1.sanitizeToolNameForAnalytics)(toolUseConfirm.tool.name),
        isMcp: (_a = toolUseConfirm.tool.isMcp) !== null && _a !== void 0 ? _a : false,
        has_instructions: !!(options === null || options === void 0 ? void 0 : options.feedback),
        instructions_length: (_c = (_b = options === null || options === void 0 ? void 0 : options.feedback) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0,
        entered_feedback_mode: (_d = options === null || options === void 0 ? void 0 : options.enteredFeedbackMode) !== null && _d !== void 0 ? _d : false,
    });
    onDone();
    toolUseConfirm.onAllow(toolUseConfirm.input, [], options === null || options === void 0 ? void 0 : options.feedback);
}
function handleAcceptSession(params, options) {
    var messageId = params.messageId, path = params.path, toolUseConfirm = params.toolUseConfirm, toolPermissionContext = params.toolPermissionContext, onDone = params.onDone, completionType = params.completionType, languageName = params.languageName, operationType = params.operationType;
    logPermissionEvent('accept', completionType, languageName, messageId);
    // For claude-folder scope, grant session-level access to all .claude/ files
    if ((options === null || options === void 0 ? void 0 : options.scope) === 'claude-folder' ||
        (options === null || options === void 0 ? void 0 : options.scope) === 'global-claude-folder') {
        var pattern = options.scope === 'global-claude-folder'
            ? constants_js_1.GLOBAL_CLAUDE_FOLDER_PERMISSION_PATTERN
            : constants_js_1.CLAUDE_FOLDER_PERMISSION_PATTERN;
        var suggestions_1 = [
            {
                type: 'addRules',
                rules: [
                    {
                        toolName: constants_js_1.FILE_EDIT_TOOL_NAME,
                        ruleContent: pattern,
                    },
                ],
                behavior: 'allow',
                destination: 'session',
            },
        ];
        onDone();
        toolUseConfirm.onAllow(toolUseConfirm.input, suggestions_1);
        return;
    }
    // Generate permission updates if path is provided
    var suggestions = path
        ? (0, filesystem_js_1.generateSuggestions)(path, operationType, toolPermissionContext)
        : [];
    onDone();
    // Pass permission updates directly to onAllow
    toolUseConfirm.onAllow(toolUseConfirm.input, suggestions);
}
function handleReject(params, options) {
    var _a, _b, _c, _d;
    var messageId = params.messageId, toolUseConfirm = params.toolUseConfirm, onDone = params.onDone, onReject = params.onReject, completionType = params.completionType, languageName = params.languageName;
    logPermissionEvent('reject', completionType, languageName, messageId, options === null || options === void 0 ? void 0 : options.hasFeedback);
    // Log reject submission with feedback context
    (0, index_js_1.logEvent)('tengu_reject_submitted', {
        toolName: (0, metadata_js_1.sanitizeToolNameForAnalytics)(toolUseConfirm.tool.name),
        isMcp: (_a = toolUseConfirm.tool.isMcp) !== null && _a !== void 0 ? _a : false,
        has_instructions: !!(options === null || options === void 0 ? void 0 : options.feedback),
        instructions_length: (_c = (_b = options === null || options === void 0 ? void 0 : options.feedback) === null || _b === void 0 ? void 0 : _b.length) !== null && _c !== void 0 ? _c : 0,
        entered_feedback_mode: (_d = options === null || options === void 0 ? void 0 : options.enteredFeedbackMode) !== null && _d !== void 0 ? _d : false,
    });
    onDone();
    onReject();
    toolUseConfirm.onReject(options === null || options === void 0 ? void 0 : options.feedback);
}
exports.PERMISSION_HANDLERS = {
    'accept-once': handleAcceptOnce,
    'accept-session': handleAcceptSession,
    reject: handleReject,
};
