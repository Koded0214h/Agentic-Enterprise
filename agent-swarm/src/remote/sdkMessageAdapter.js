"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertSDKMessage = convertSDKMessage;
exports.isSessionEndMessage = isSessionEndMessage;
exports.isSuccessResult = isSuccessResult;
exports.getResultText = getResultText;
var debug_js_1 = require("../utils/debug.js");
var mappers_js_1 = require("../utils/messages/mappers.js");
var messages_js_1 = require("../utils/messages.js");
/**
 * Converts SDKMessage from CCR to REPL Message types.
 *
 * The CCR backend sends SDK-format messages via WebSocket. The REPL expects
 * internal Message types for rendering. This adapter bridges the two.
 */
/**
 * Convert an SDKAssistantMessage to an AssistantMessage
 */
function convertAssistantMessage(msg) {
    return {
        type: 'assistant',
        message: msg.message,
        uuid: msg.uuid,
        requestId: undefined,
        timestamp: new Date().toISOString(),
        error: msg.error,
    };
}
/**
 * Convert an SDKPartialAssistantMessage (streaming) to a StreamEvent
 */
function convertStreamEvent(msg) {
    return {
        type: 'stream_event',
        event: msg.event,
    };
}
/**
 * Convert an SDKResultMessage to a SystemMessage
 */
function convertResultMessage(msg) {
    var _a;
    var isError = msg.subtype !== 'success';
    var content = isError
        ? ((_a = msg.errors) === null || _a === void 0 ? void 0 : _a.join(', ')) || 'Unknown error'
        : 'Session completed successfully';
    return {
        type: 'system',
        subtype: 'informational',
        content: content,
        level: isError ? 'warning' : 'info',
        uuid: msg.uuid,
        timestamp: new Date().toISOString(),
    };
}
/**
 * Convert an SDKSystemMessage (init) to a SystemMessage
 */
function convertInitMessage(msg) {
    return {
        type: 'system',
        subtype: 'informational',
        content: "Remote session initialized (model: ".concat(msg.model, ")"),
        level: 'info',
        uuid: msg.uuid,
        timestamp: new Date().toISOString(),
    };
}
/**
 * Convert an SDKStatusMessage to a SystemMessage
 */
function convertStatusMessage(msg) {
    if (!msg.status) {
        return null;
    }
    return {
        type: 'system',
        subtype: 'informational',
        content: msg.status === 'compacting'
            ? 'Compacting conversation…'
            : "Status: ".concat(msg.status),
        level: 'info',
        uuid: msg.uuid,
        timestamp: new Date().toISOString(),
    };
}
/**
 * Convert an SDKToolProgressMessage to a SystemMessage.
 * We use a system message instead of ProgressMessage since the Progress type
 * is a complex union that requires tool-specific data we don't have from CCR.
 */
function convertToolProgressMessage(msg) {
    return {
        type: 'system',
        subtype: 'informational',
        content: "Tool ".concat(msg.tool_name, " running for ").concat(msg.elapsed_time_seconds, "s\u2026"),
        level: 'info',
        uuid: msg.uuid,
        timestamp: new Date().toISOString(),
        toolUseID: msg.tool_use_id,
    };
}
/**
 * Convert an SDKCompactBoundaryMessage to a SystemMessage
 */
function convertCompactBoundaryMessage(msg) {
    return {
        type: 'system',
        subtype: 'compact_boundary',
        content: 'Conversation compacted',
        level: 'info',
        uuid: msg.uuid,
        timestamp: new Date().toISOString(),
        compactMetadata: (0, mappers_js_1.fromSDKCompactMetadata)(msg.compact_metadata),
    };
}
/**
 * Convert an SDKMessage to REPL message format
 */
function convertSDKMessage(msg, opts) {
    var _a;
    switch (msg.type) {
        case 'assistant':
            return { type: 'message', message: convertAssistantMessage(msg) };
        case 'user': {
            var content = (_a = msg.message) === null || _a === void 0 ? void 0 : _a.content;
            // Tool result messages from the remote server need to be converted so
            // they render and collapse like local tool results. Detect via content
            // shape (tool_result blocks) — parent_tool_use_id is NOT reliable: the
            // agent-side normalizeMessage() hardcodes it to null for top-level
            // tool results, so it can't distinguish tool results from prompt echoes.
            var isToolResult = Array.isArray(content) && content.some(function (b) { return b.type === 'tool_result'; });
            if ((opts === null || opts === void 0 ? void 0 : opts.convertToolResults) && isToolResult) {
                return {
                    type: 'message',
                    message: (0, messages_js_1.createUserMessage)({
                        content: content,
                        toolUseResult: msg.tool_use_result,
                        uuid: msg.uuid,
                        timestamp: msg.timestamp,
                    }),
                };
            }
            // When converting historical events, user-typed messages need to be
            // rendered (they weren't added locally by the REPL). Skip tool_results
            // here — already handled above.
            if ((opts === null || opts === void 0 ? void 0 : opts.convertUserTextMessages) && !isToolResult) {
                if (typeof content === 'string' || Array.isArray(content)) {
                    return {
                        type: 'message',
                        message: (0, messages_js_1.createUserMessage)({
                            content: content,
                            toolUseResult: msg.tool_use_result,
                            uuid: msg.uuid,
                            timestamp: msg.timestamp,
                        }),
                    };
                }
            }
            // User-typed messages (string content) are already added locally by REPL.
            // In CCR mode, all user messages are ignored (tool results handled differently).
            return { type: 'ignored' };
        }
        case 'stream_event':
            return { type: 'stream_event', event: convertStreamEvent(msg) };
        case 'result':
            // Only show result messages for errors. Success results are noise
            // in multi-turn sessions (isLoading=false is sufficient signal).
            if (msg.subtype !== 'success') {
                return { type: 'message', message: convertResultMessage(msg) };
            }
            return { type: 'ignored' };
        case 'system':
            if (msg.subtype === 'init') {
                return { type: 'message', message: convertInitMessage(msg) };
            }
            if (msg.subtype === 'status') {
                var statusMsg = convertStatusMessage(msg);
                return statusMsg
                    ? { type: 'message', message: statusMsg }
                    : { type: 'ignored' };
            }
            if (msg.subtype === 'compact_boundary') {
                return {
                    type: 'message',
                    message: convertCompactBoundaryMessage(msg),
                };
            }
            // hook_response and other subtypes
            (0, debug_js_1.logForDebugging)("[sdkMessageAdapter] Ignoring system message subtype: ".concat(msg.subtype));
            return { type: 'ignored' };
        case 'tool_progress':
            return { type: 'message', message: convertToolProgressMessage(msg) };
        case 'auth_status':
            // Auth status is handled separately, not converted to a display message
            (0, debug_js_1.logForDebugging)('[sdkMessageAdapter] Ignoring auth_status message');
            return { type: 'ignored' };
        case 'tool_use_summary':
            // Tool use summaries are SDK-only events, not displayed in REPL
            (0, debug_js_1.logForDebugging)('[sdkMessageAdapter] Ignoring tool_use_summary message');
            return { type: 'ignored' };
        case 'rate_limit_event':
            // Rate limit events are SDK-only events, not displayed in REPL
            (0, debug_js_1.logForDebugging)('[sdkMessageAdapter] Ignoring rate_limit_event message');
            return { type: 'ignored' };
        default: {
            // Gracefully ignore unknown message types. The backend may send new
            // types before the client is updated; logging helps with debugging
            // without crashing or losing the session.
            (0, debug_js_1.logForDebugging)("[sdkMessageAdapter] Unknown message type: ".concat(msg.type));
            return { type: 'ignored' };
        }
    }
}
/**
 * Check if an SDKMessage indicates the session has ended
 */
function isSessionEndMessage(msg) {
    return msg.type === 'result';
}
/**
 * Check if an SDKResultMessage indicates success
 */
function isSuccessResult(msg) {
    return msg.subtype === 'success';
}
/**
 * Extract the result text from a successful SDKResultMessage
 */
function getResultText(msg) {
    if (msg.subtype === 'success') {
        return msg.result;
    }
    return null;
}
