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
exports.toInternalMessages = toInternalMessages;
exports.toSDKCompactMetadata = toSDKCompactMetadata;
exports.fromSDKCompactMetadata = fromSDKCompactMetadata;
exports.toSDKMessages = toSDKMessages;
exports.localCommandOutputToSDKAssistantMessage = localCommandOutputToSDKAssistantMessage;
exports.toSDKRateLimitInfo = toSDKRateLimitInfo;
var crypto_1 = require("crypto");
var state_js_1 = require("src/bootstrap/state.js");
var xml_js_1 = require("src/constants/xml.js");
var constants_js_1 = require("src/tools/ExitPlanModeTool/constants.js");
var strip_ansi_1 = require("strip-ansi");
var messages_js_1 = require("../messages.js");
var plans_js_1 = require("../plans.js");
function toInternalMessages(messages) {
    return messages.flatMap(function (message) {
        var _a, _b;
        switch (message.type) {
            case 'assistant':
                return [
                    {
                        type: 'assistant',
                        message: message.message,
                        uuid: message.uuid,
                        requestId: undefined,
                        timestamp: new Date().toISOString(),
                    },
                ];
            case 'user':
                return [
                    {
                        type: 'user',
                        message: message.message,
                        uuid: (_a = message.uuid) !== null && _a !== void 0 ? _a : (0, crypto_1.randomUUID)(),
                        timestamp: (_b = message.timestamp) !== null && _b !== void 0 ? _b : new Date().toISOString(),
                        isMeta: message.isSynthetic,
                    },
                ];
            case 'system':
                // Handle compact boundary messages
                if (message.subtype === 'compact_boundary') {
                    var compactMsg = message;
                    return [
                        {
                            type: 'system',
                            content: 'Conversation compacted',
                            level: 'info',
                            subtype: 'compact_boundary',
                            compactMetadata: fromSDKCompactMetadata(compactMsg.compact_metadata),
                            uuid: message.uuid,
                            timestamp: new Date().toISOString(),
                        },
                    ];
                }
                return [];
            default:
                return [];
        }
    });
}
function toSDKCompactMetadata(meta) {
    var seg = meta.preservedSegment;
    return __assign({ trigger: meta.trigger, pre_tokens: meta.preTokens }, (seg && {
        preserved_segment: {
            head_uuid: seg.headUuid,
            anchor_uuid: seg.anchorUuid,
            tail_uuid: seg.tailUuid,
        },
    }));
}
/**
 * Shared SDK→internal compact_metadata converter.
 */
function fromSDKCompactMetadata(meta) {
    var seg = meta.preserved_segment;
    return __assign({ trigger: meta.trigger, preTokens: meta.pre_tokens }, (seg && {
        preservedSegment: {
            headUuid: seg.head_uuid,
            anchorUuid: seg.anchor_uuid,
            tailUuid: seg.tail_uuid,
        },
    }));
}
function toSDKMessages(messages) {
    return messages.flatMap(function (message) {
        switch (message.type) {
            case 'assistant':
                return [
                    {
                        type: 'assistant',
                        message: normalizeAssistantMessageForSDK(message),
                        session_id: (0, state_js_1.getSessionId)(),
                        parent_tool_use_id: null,
                        uuid: message.uuid,
                        error: message.error,
                    },
                ];
            case 'user':
                return [
                    __assign({ type: 'user', message: message.message, session_id: (0, state_js_1.getSessionId)(), parent_tool_use_id: null, uuid: message.uuid, timestamp: message.timestamp, isSynthetic: message.isMeta || message.isVisibleInTranscriptOnly }, (message.toolUseResult !== undefined
                        ? { tool_use_result: message.toolUseResult }
                        : {})),
                ];
            case 'system':
                if (message.subtype === 'compact_boundary' && message.compactMetadata) {
                    return [
                        {
                            type: 'system',
                            subtype: 'compact_boundary',
                            session_id: (0, state_js_1.getSessionId)(),
                            uuid: message.uuid,
                            compact_metadata: toSDKCompactMetadata(message.compactMetadata),
                        },
                    ];
                }
                // Only convert local_command messages that contain actual command
                // output (stdout/stderr). The same subtype is also used for command
                // input metadata (e.g. <command-name>...</command-name>) which must
                // not leak to the RC web UI.
                if (message.subtype === 'local_command' &&
                    (message.content.includes("<".concat(xml_js_1.LOCAL_COMMAND_STDOUT_TAG, ">")) ||
                        message.content.includes("<".concat(xml_js_1.LOCAL_COMMAND_STDERR_TAG, ">")))) {
                    return [
                        localCommandOutputToSDKAssistantMessage(message.content, message.uuid),
                    ];
                }
                return [];
            default:
                return [];
        }
    });
}
/**
 * Converts local command output (e.g. /voice, /cost) to a well-formed
 * SDKAssistantMessage so downstream consumers (mobile apps, session-ingress
 * v1alpha→v1beta converter) can parse it without schema changes.
 *
 * Emitted as assistant instead of the dedicated SDKLocalCommandOutputMessage
 * because the system/local_command_output subtype is unknown to:
 *   - mobile-apps Android SdkMessageTypes.kt (no local_command_output handler)
 *   - api-go session-ingress convertSystemEvent (only init/compact_boundary)
 * See: https://anthropic.sentry.io/issues/7266299248/ (Android)
 *
 * Strips ANSI (e.g. chalk.dim() in /cost) then unwraps the XML wrapper tags.
 */
function localCommandOutputToSDKAssistantMessage(rawContent, uuid) {
    var cleanContent = (0, strip_ansi_1.default)(rawContent)
        .replace(/<local-command-stdout>([\s\S]*?)<\/local-command-stdout>/, '$1')
        .replace(/<local-command-stderr>([\s\S]*?)<\/local-command-stderr>/, '$1')
        .trim();
    // createAssistantMessage builds a complete APIAssistantMessage with id, type,
    // model: SYNTHETIC_MODEL, role, stop_reason, usage — all fields required by
    // downstream deserializers like Android's SdkAssistantMessage.
    var synthetic = (0, messages_js_1.createAssistantMessage)({ content: cleanContent });
    return {
        type: 'assistant',
        message: synthetic.message,
        parent_tool_use_id: null,
        session_id: (0, state_js_1.getSessionId)(),
        uuid: uuid,
    };
}
/**
 * Maps internal ClaudeAILimits to the SDK-facing SDKRateLimitInfo type,
 * stripping internal-only fields like unifiedRateLimitFallbackAvailable.
 */
function toSDKRateLimitInfo(limits) {
    if (!limits) {
        return undefined;
    }
    return __assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({ status: limits.status }, (limits.resetsAt !== undefined && { resetsAt: limits.resetsAt })), (limits.rateLimitType !== undefined && {
        rateLimitType: limits.rateLimitType,
    })), (limits.utilization !== undefined && {
        utilization: limits.utilization,
    })), (limits.overageStatus !== undefined && {
        overageStatus: limits.overageStatus,
    })), (limits.overageResetsAt !== undefined && {
        overageResetsAt: limits.overageResetsAt,
    })), (limits.overageDisabledReason !== undefined && {
        overageDisabledReason: limits.overageDisabledReason,
    })), (limits.isUsingOverage !== undefined && {
        isUsingOverage: limits.isUsingOverage,
    })), (limits.surpassedThreshold !== undefined && {
        surpassedThreshold: limits.surpassedThreshold,
    }));
}
/**
 * Normalizes tool inputs in assistant message content for SDK consumption.
 * Specifically injects plan content into ExitPlanModeV2 tool inputs since
 * the V2 tool reads plan from file instead of input, but SDK users expect
 * tool_input.plan to exist.
 */
function normalizeAssistantMessageForSDK(message) {
    var content = message.message.content;
    if (!Array.isArray(content)) {
        return message.message;
    }
    var normalizedContent = content.map(function (block) {
        if (block.type !== 'tool_use') {
            return block;
        }
        if (block.name === constants_js_1.EXIT_PLAN_MODE_V2_TOOL_NAME) {
            var plan = (0, plans_js_1.getPlan)();
            if (plan) {
                return __assign(__assign({}, block), { input: __assign(__assign({}, block.input), { plan: plan }) });
            }
        }
        return block;
    });
    return __assign(__assign({}, message.message), { content: normalizedContent });
}
