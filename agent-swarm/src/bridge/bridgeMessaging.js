"use strict";
/**
 * Shared transport-layer helpers for bridge message handling.
 *
 * Extracted from replBridge.ts so both the env-based core (initBridgeCore)
 * and the env-less core (initEnvLessBridgeCore) can use the same ingress
 * parsing, control-request handling, and echo-dedup machinery.
 *
 * Everything here is pure — no closure over bridge-specific state. All
 * collaborators (transport, sessionId, UUID sets, callbacks) are passed
 * as params.
 */
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
exports.BoundedUUIDSet = void 0;
exports.isSDKMessage = isSDKMessage;
exports.isSDKControlResponse = isSDKControlResponse;
exports.isSDKControlRequest = isSDKControlRequest;
exports.isEligibleBridgeMessage = isEligibleBridgeMessage;
exports.extractTitleText = extractTitleText;
exports.handleIngressMessage = handleIngressMessage;
exports.handleServerControlRequest = handleServerControlRequest;
exports.makeResultMessage = makeResultMessage;
var crypto_1 = require("crypto");
var index_js_1 = require("../services/analytics/index.js");
var emptyUsage_js_1 = require("../services/api/emptyUsage.js");
var controlMessageCompat_js_1 = require("../utils/controlMessageCompat.js");
var debug_js_1 = require("../utils/debug.js");
var displayTags_js_1 = require("../utils/displayTags.js");
var errors_js_1 = require("../utils/errors.js");
var slowOperations_js_1 = require("../utils/slowOperations.js");
// ─── Type guards ─────────────────────────────────────────────────────────────
/** Type predicate for parsed WebSocket messages. SDKMessage is a
 *  discriminated union on `type` — validating the discriminant is
 *  sufficient for the predicate; callers narrow further via the union. */
function isSDKMessage(value) {
    return (value !== null &&
        typeof value === 'object' &&
        'type' in value &&
        typeof value.type === 'string');
}
/** Type predicate for control_response messages from the server. */
function isSDKControlResponse(value) {
    return (value !== null &&
        typeof value === 'object' &&
        'type' in value &&
        value.type === 'control_response' &&
        'response' in value);
}
/** Type predicate for control_request messages from the server. */
function isSDKControlRequest(value) {
    return (value !== null &&
        typeof value === 'object' &&
        'type' in value &&
        value.type === 'control_request' &&
        'request_id' in value &&
        'request' in value);
}
/**
 * True for message types that should be forwarded to the bridge transport.
 * The server only wants user/assistant turns and slash-command system events;
 * everything else (tool_result, progress, etc.) is internal REPL chatter.
 */
function isEligibleBridgeMessage(m) {
    // Virtual messages (REPL inner calls) are display-only — bridge/SDK
    // consumers see the REPL tool_use/result which summarizes the work.
    if ((m.type === 'user' || m.type === 'assistant') && m.isVirtual) {
        return false;
    }
    return (m.type === 'user' ||
        m.type === 'assistant' ||
        (m.type === 'system' && m.subtype === 'local_command'));
}
/**
 * Extract title-worthy text from a Message for onUserMessage. Returns
 * undefined for messages that shouldn't title the session: non-user, meta
 * (nudges), tool results, compact summaries, non-human origins (task
 * notifications, channel messages), or pure display-tag content
 * (<ide_opened_file>, <session-start-hook>, etc.).
 *
 * Synthetic interrupts ([Request interrupted by user]) are NOT filtered here —
 * isSyntheticMessage lives in messages.ts (heavy import, pulls command
 * registry). The initialMessages path in initReplBridge checks it; the
 * writeMessages path reaching an interrupt as the *first* message is
 * implausible (an interrupt implies a prior prompt already flowed through).
 */
function extractTitleText(m) {
    if (m.type !== 'user' || m.isMeta || m.toolUseResult || m.isCompactSummary)
        return undefined;
    if (m.origin && m.origin.kind !== 'human')
        return undefined;
    var content = m.message.content;
    var raw;
    if (typeof content === 'string') {
        raw = content;
    }
    else {
        for (var _i = 0, content_1 = content; _i < content_1.length; _i++) {
            var block = content_1[_i];
            if (block.type === 'text') {
                raw = block.text;
                break;
            }
        }
    }
    if (!raw)
        return undefined;
    var clean = (0, displayTags_js_1.stripDisplayTagsAllowEmpty)(raw);
    return clean || undefined;
}
// ─── Ingress routing ─────────────────────────────────────────────────────────
/**
 * Parse an ingress WebSocket message and route it to the appropriate handler.
 * Ignores messages whose UUID is in recentPostedUUIDs (echoes of what we sent)
 * or in recentInboundUUIDs (re-deliveries we've already forwarded — e.g.
 * server replayed history after a transport swap lost the seq-num cursor).
 */
function handleIngressMessage(data, recentPostedUUIDs, recentInboundUUIDs, onInboundMessage, onPermissionResponse, onControlRequest) {
    try {
        var parsed = (0, controlMessageCompat_js_1.normalizeControlMessageKeys)((0, slowOperations_js_1.jsonParse)(data));
        // control_response is not an SDKMessage — check before the type guard
        if (isSDKControlResponse(parsed)) {
            (0, debug_js_1.logForDebugging)('[bridge:repl] Ingress message type=control_response');
            onPermissionResponse === null || onPermissionResponse === void 0 ? void 0 : onPermissionResponse(parsed);
            return;
        }
        // control_request from the server (initialize, set_model, can_use_tool).
        // Must respond promptly or the server kills the WS (~10-14s timeout).
        if (isSDKControlRequest(parsed)) {
            (0, debug_js_1.logForDebugging)("[bridge:repl] Inbound control_request subtype=".concat(parsed.request.subtype));
            onControlRequest === null || onControlRequest === void 0 ? void 0 : onControlRequest(parsed);
            return;
        }
        if (!isSDKMessage(parsed))
            return;
        // Check for UUID to detect echoes of our own messages
        var uuid = 'uuid' in parsed && typeof parsed.uuid === 'string'
            ? parsed.uuid
            : undefined;
        if (uuid && recentPostedUUIDs.has(uuid)) {
            (0, debug_js_1.logForDebugging)("[bridge:repl] Ignoring echo: type=".concat(parsed.type, " uuid=").concat(uuid));
            return;
        }
        // Defensive dedup: drop inbound prompts we've already forwarded. The
        // SSE seq-num carryover (lastTransportSequenceNum) is the primary fix
        // for history-replay; this catches edge cases where that negotiation
        // fails (server ignores from_sequence_num, transport died before
        // receiving any frames, etc).
        if (uuid && recentInboundUUIDs.has(uuid)) {
            (0, debug_js_1.logForDebugging)("[bridge:repl] Ignoring re-delivered inbound: type=".concat(parsed.type, " uuid=").concat(uuid));
            return;
        }
        (0, debug_js_1.logForDebugging)("[bridge:repl] Ingress message type=".concat(parsed.type).concat(uuid ? " uuid=".concat(uuid) : ''));
        if (parsed.type === 'user') {
            if (uuid)
                recentInboundUUIDs.add(uuid);
            (0, index_js_1.logEvent)('tengu_bridge_message_received', {
                is_repl: true,
            });
            // Fire-and-forget — handler may be async (attachment resolution).
            void (onInboundMessage === null || onInboundMessage === void 0 ? void 0 : onInboundMessage(parsed));
        }
        else {
            (0, debug_js_1.logForDebugging)("[bridge:repl] Ignoring non-user inbound message: type=".concat(parsed.type));
        }
    }
    catch (err) {
        (0, debug_js_1.logForDebugging)("[bridge:repl] Failed to parse ingress message: ".concat((0, errors_js_1.errorMessage)(err)));
    }
}
var OUTBOUND_ONLY_ERROR = 'This session is outbound-only. Enable Remote Control locally to allow inbound control.';
/**
 * Respond to inbound control_request messages from the server. The server
 * sends these for session lifecycle events (initialize, set_model) and
 * for turn-level coordination (interrupt, set_max_thinking_tokens). If we
 * don't respond, the server hangs and kills the WS after ~10-14s.
 *
 * Previously a closure inside initBridgeCore's onWorkReceived; now takes
 * collaborators as params so both cores can use it.
 */
function handleServerControlRequest(request, handlers) {
    var _a;
    var transport = handlers.transport, sessionId = handlers.sessionId, outboundOnly = handlers.outboundOnly, onInterrupt = handlers.onInterrupt, onSetModel = handlers.onSetModel, onSetMaxThinkingTokens = handlers.onSetMaxThinkingTokens, onSetPermissionMode = handlers.onSetPermissionMode;
    if (!transport) {
        (0, debug_js_1.logForDebugging)('[bridge:repl] Cannot respond to control_request: transport not configured');
        return;
    }
    var response;
    // Outbound-only: reply error for mutable requests so claude.ai doesn't show
    // false success. initialize must still succeed (server kills the connection
    // if it doesn't — see comment above).
    if (outboundOnly && request.request.subtype !== 'initialize') {
        response = {
            type: 'control_response',
            response: {
                subtype: 'error',
                request_id: request.request_id,
                error: OUTBOUND_ONLY_ERROR,
            },
        };
        var event_1 = __assign(__assign({}, response), { session_id: sessionId });
        void transport.write(event_1);
        (0, debug_js_1.logForDebugging)("[bridge:repl] Rejected ".concat(request.request.subtype, " (outbound-only) request_id=").concat(request.request_id));
        return;
    }
    switch (request.request.subtype) {
        case 'initialize':
            // Respond with minimal capabilities — the REPL handles
            // commands, models, and account info itself.
            response = {
                type: 'control_response',
                response: {
                    subtype: 'success',
                    request_id: request.request_id,
                    response: {
                        commands: [],
                        output_style: 'normal',
                        available_output_styles: ['normal'],
                        models: [],
                        account: {},
                        pid: process.pid,
                    },
                },
            };
            break;
        case 'set_model':
            onSetModel === null || onSetModel === void 0 ? void 0 : onSetModel(request.request.model);
            response = {
                type: 'control_response',
                response: {
                    subtype: 'success',
                    request_id: request.request_id,
                },
            };
            break;
        case 'set_max_thinking_tokens':
            onSetMaxThinkingTokens === null || onSetMaxThinkingTokens === void 0 ? void 0 : onSetMaxThinkingTokens(request.request.max_thinking_tokens);
            response = {
                type: 'control_response',
                response: {
                    subtype: 'success',
                    request_id: request.request_id,
                },
            };
            break;
        case 'set_permission_mode': {
            // The callback returns a policy verdict so we can send an error
            // control_response without importing isAutoModeGateEnabled /
            // isBypassPermissionsModeDisabled here (bootstrap-isolation). If no
            // callback is registered (daemon context, which doesn't wire this —
            // see daemonBridge.ts), return an error verdict rather than a silent
            // false-success: the mode is never actually applied in that context,
            // so success would lie to the client.
            var verdict = (_a = onSetPermissionMode === null || onSetPermissionMode === void 0 ? void 0 : onSetPermissionMode(request.request.mode)) !== null && _a !== void 0 ? _a : {
                ok: false,
                error: 'set_permission_mode is not supported in this context (onSetPermissionMode callback not registered)',
            };
            if (verdict.ok) {
                response = {
                    type: 'control_response',
                    response: {
                        subtype: 'success',
                        request_id: request.request_id,
                    },
                };
            }
            else {
                response = {
                    type: 'control_response',
                    response: {
                        subtype: 'error',
                        request_id: request.request_id,
                        error: verdict.error,
                    },
                };
            }
            break;
        }
        case 'interrupt':
            onInterrupt === null || onInterrupt === void 0 ? void 0 : onInterrupt();
            response = {
                type: 'control_response',
                response: {
                    subtype: 'success',
                    request_id: request.request_id,
                },
            };
            break;
        default:
            // Unknown subtype — respond with error so the server doesn't
            // hang waiting for a reply that never comes.
            response = {
                type: 'control_response',
                response: {
                    subtype: 'error',
                    request_id: request.request_id,
                    error: "REPL bridge does not handle control_request subtype: ".concat(request.request.subtype),
                },
            };
    }
    var event = __assign(__assign({}, response), { session_id: sessionId });
    void transport.write(event);
    (0, debug_js_1.logForDebugging)("[bridge:repl] Sent control_response for ".concat(request.request.subtype, " request_id=").concat(request.request_id, " result=").concat(response.response.subtype));
}
// ─── Result message (for session archival on teardown) ───────────────────────
/**
 * Build a minimal `SDKResultSuccess` message for session archival.
 * The server needs this event before a WS close to trigger archival.
 */
function makeResultMessage(sessionId) {
    return {
        type: 'result',
        subtype: 'success',
        duration_ms: 0,
        duration_api_ms: 0,
        is_error: false,
        num_turns: 0,
        result: '',
        stop_reason: null,
        total_cost_usd: 0,
        usage: __assign({}, emptyUsage_js_1.EMPTY_USAGE),
        modelUsage: {},
        permission_denials: [],
        session_id: sessionId,
        uuid: (0, crypto_1.randomUUID)(),
    };
}
// ─── BoundedUUIDSet (echo-dedup ring buffer) ─────────────────────────────────
/**
 * FIFO-bounded set backed by a circular buffer. Evicts the oldest entry
 * when capacity is reached, keeping memory usage constant at O(capacity).
 *
 * Messages are added in chronological order, so evicted entries are always
 * the oldest. The caller relies on external ordering (the hook's
 * lastWrittenIndexRef) as the primary dedup — this set is a secondary
 * safety net for echo filtering and race-condition dedup.
 */
var BoundedUUIDSet = /** @class */ (function () {
    function BoundedUUIDSet(capacity) {
        this.set = new Set();
        this.writeIdx = 0;
        this.capacity = capacity;
        this.ring = new Array(capacity);
    }
    BoundedUUIDSet.prototype.add = function (uuid) {
        if (this.set.has(uuid))
            return;
        // Evict the entry at the current write position (if occupied)
        var evicted = this.ring[this.writeIdx];
        if (evicted !== undefined) {
            this.set.delete(evicted);
        }
        this.ring[this.writeIdx] = uuid;
        this.set.add(uuid);
        this.writeIdx = (this.writeIdx + 1) % this.capacity;
    };
    BoundedUUIDSet.prototype.has = function (uuid) {
        return this.set.has(uuid);
    };
    BoundedUUIDSet.prototype.clear = function () {
        this.set.clear();
        this.ring.fill(undefined);
        this.writeIdx = 0;
    };
    return BoundedUUIDSet;
}());
exports.BoundedUUIDSet = BoundedUUIDSet;
