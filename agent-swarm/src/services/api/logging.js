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
exports.EMPTY_USAGE = void 0;
exports.logAPIQuery = logAPIQuery;
exports.logAPIError = logAPIError;
exports.logAPISuccessAndDuration = logAPISuccessAndDuration;
var bun_bundle_1 = require("bun:bundle");
var sdk_1 = require("@anthropic-ai/sdk");
var state_js_1 = require("src/bootstrap/state.js");
var connectorText_js_1 = require("src/types/connectorText.js");
var debug_js_1 = require("src/utils/debug.js");
var log_js_1 = require("src/utils/log.js");
var providers_js_1 = require("src/utils/model/providers.js");
var slowOperations_js_1 = require("src/utils/slowOperations.js");
var events_js_1 = require("src/utils/telemetry/events.js");
var sessionTracing_js_1 = require("src/utils/telemetry/sessionTracing.js");
var agentContext_js_1 = require("../../utils/agentContext.js");
var index_js_1 = require("../analytics/index.js");
var metadata_js_1 = require("../analytics/metadata.js");
var emptyUsage_js_1 = require("./emptyUsage.js");
Object.defineProperty(exports, "EMPTY_USAGE", { enumerable: true, get: function () { return emptyUsage_js_1.EMPTY_USAGE; } });
var errors_js_1 = require("./errors.js");
var errorUtils_js_1 = require("./errorUtils.js");
function getErrorMessage(error) {
    var _a;
    if (error instanceof sdk_1.APIError) {
        var body = error.error;
        if ((_a = body === null || body === void 0 ? void 0 : body.error) === null || _a === void 0 ? void 0 : _a.message)
            return body.error.message;
    }
    return error instanceof Error ? error.message : String(error);
}
// Gateway fingerprints for detecting AI gateways from response headers
var GATEWAY_FINGERPRINTS = {
    // https://docs.litellm.ai/docs/proxy/response_headers
    litellm: {
        prefixes: ['x-litellm-'],
    },
    // https://docs.helicone.ai/helicone-headers/header-directory
    helicone: {
        prefixes: ['helicone-'],
    },
    // https://portkey.ai/docs/api-reference/response-schema
    portkey: {
        prefixes: ['x-portkey-'],
    },
    // https://developers.cloudflare.com/ai-gateway/evaluations/add-human-feedback-api/
    'cloudflare-ai-gateway': {
        prefixes: ['cf-aig-'],
    },
    // https://developer.konghq.com/ai-gateway/ — X-Kong-Upstream-Latency, X-Kong-Proxy-Latency
    kong: {
        prefixes: ['x-kong-'],
    },
    // https://www.braintrust.dev/docs/guides/proxy — x-bt-used-endpoint, x-bt-cached
    braintrust: {
        prefixes: ['x-bt-'],
    },
};
// Gateways that use provider-owned domains (not self-hosted), so the
// ANTHROPIC_BASE_URL hostname is a reliable signal even without a
// distinctive response header.
var GATEWAY_HOST_SUFFIXES = {
    // https://docs.databricks.com/aws/en/ai-gateway/
    databricks: [
        '.cloud.databricks.com',
        '.azuredatabricks.net',
        '.gcp.databricks.com',
    ],
};
function detectGateway(_a) {
    var headers = _a.headers, baseUrl = _a.baseUrl;
    if (headers) {
        // Header names are already lowercase from the Headers API
        var headerNames_1 = [];
        headers.forEach(function (_, key) { return headerNames_1.push(key); });
        for (var _i = 0, _b = Object.entries(GATEWAY_FINGERPRINTS); _i < _b.length; _i++) {
            var _c = _b[_i], gw = _c[0], prefixes = _c[1].prefixes;
            if (prefixes.some(function (p) { return headerNames_1.some(function (h) { return h.startsWith(p); }); })) {
                return gw;
            }
        }
    }
    if (baseUrl) {
        try {
            var host_1 = new URL(baseUrl).hostname.toLowerCase();
            for (var _d = 0, _e = Object.entries(GATEWAY_HOST_SUFFIXES); _d < _e.length; _d++) {
                var _f = _e[_d], gw = _f[0], suffixes = _f[1];
                if (suffixes.some(function (s) { return host_1.endsWith(s); })) {
                    return gw;
                }
            }
        }
        catch (_g) {
            // malformed URL — ignore
        }
    }
    return undefined;
}
function getAnthropicEnvMetadata() {
    return __assign(__assign(__assign({}, (process.env.ANTHROPIC_BASE_URL
        ? {
            baseUrl: process.env
                .ANTHROPIC_BASE_URL,
        }
        : {})), (process.env.ANTHROPIC_MODEL
        ? {
            envModel: process.env
                .ANTHROPIC_MODEL,
        }
        : {})), (process.env.ANTHROPIC_SMALL_FAST_MODEL
        ? {
            envSmallFastModel: process.env
                .ANTHROPIC_SMALL_FAST_MODEL,
        }
        : {}));
}
function getBuildAgeMinutes() {
    if (!MACRO.BUILD_TIME)
        return undefined;
    var buildTime = new Date(MACRO.BUILD_TIME).getTime();
    if (isNaN(buildTime))
        return undefined;
    return Math.floor((Date.now() - buildTime) / 60000);
}
function logAPIQuery(_a) {
    var model = _a.model, messagesLength = _a.messagesLength, temperature = _a.temperature, betas = _a.betas, permissionMode = _a.permissionMode, querySource = _a.querySource, queryTracking = _a.queryTracking, thinkingType = _a.thinkingType, effortValue = _a.effortValue, fastMode = _a.fastMode, previousRequestId = _a.previousRequestId;
    (0, index_js_1.logEvent)('tengu_api_query', __assign(__assign(__assign(__assign(__assign(__assign({ model: model, messagesLength: messagesLength, temperature: temperature, provider: (0, providers_js_1.getAPIProviderForStatsig)(), buildAgeMins: getBuildAgeMinutes() }, ((betas === null || betas === void 0 ? void 0 : betas.length)
        ? {
            betas: betas.join(','),
        }
        : {})), { permissionMode: permissionMode, querySource: querySource }), (queryTracking
        ? {
            queryChainId: queryTracking.chainId,
            queryDepth: queryTracking.depth,
        }
        : {})), { thinkingType: thinkingType, effortValue: effortValue, fastMode: fastMode }), (previousRequestId
        ? {
            previousRequestId: previousRequestId,
        }
        : {})), getAnthropicEnvMetadata()));
}
function logAPIError(_a) {
    var error = _a.error, model = _a.model, messageCount = _a.messageCount, messageTokens = _a.messageTokens, durationMs = _a.durationMs, durationMsIncludingRetries = _a.durationMsIncludingRetries, attempt = _a.attempt, requestId = _a.requestId, clientRequestId = _a.clientRequestId, didFallBackToNonStreaming = _a.didFallBackToNonStreaming, promptCategory = _a.promptCategory, headers = _a.headers, queryTracking = _a.queryTracking, querySource = _a.querySource, llmSpan = _a.llmSpan, fastMode = _a.fastMode, previousRequestId = _a.previousRequestId;
    var gateway = detectGateway({
        headers: error instanceof sdk_1.APIError && error.headers ? error.headers : headers,
        baseUrl: process.env.ANTHROPIC_BASE_URL,
    });
    var errStr = getErrorMessage(error);
    var status = error instanceof sdk_1.APIError ? String(error.status) : undefined;
    var errorType = (0, errors_js_1.classifyAPIError)(error);
    // Log detailed connection error info to debug logs (visible via --debug)
    var connectionDetails = (0, errorUtils_js_1.extractConnectionErrorDetails)(error);
    if (connectionDetails) {
        var sslLabel = connectionDetails.isSSLError ? ' (SSL error)' : '';
        (0, debug_js_1.logForDebugging)("Connection error details: code=".concat(connectionDetails.code).concat(sslLabel, ", message=").concat(connectionDetails.message), { level: 'error' });
    }
    var invocation = (0, agentContext_js_1.consumeInvokingRequestId)();
    if (clientRequestId) {
        (0, debug_js_1.logForDebugging)("API error x-client-request-id=".concat(clientRequestId, " (give this to the API team for server-log lookup)"), { level: 'error' });
    }
    (0, log_js_1.logError)(error);
    (0, index_js_1.logEvent)('tengu_api_error', __assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({ model: model, error: errStr, status: status, errorType: errorType, messageCount: messageCount, messageTokens: messageTokens, durationMs: durationMs, durationMsIncludingRetries: durationMsIncludingRetries, attempt: attempt, provider: (0, providers_js_1.getAPIProviderForStatsig)(), requestId: requestId ||
            undefined }, (invocation
        ? {
            invokingRequestId: invocation.invokingRequestId,
            invocationKind: invocation.invocationKind,
        }
        : {})), { clientRequestId: clientRequestId ||
            undefined, didFallBackToNonStreaming: didFallBackToNonStreaming }), (promptCategory
        ? {
            promptCategory: promptCategory,
        }
        : {})), (gateway
        ? {
            gateway: gateway,
        }
        : {})), (queryTracking
        ? {
            queryChainId: queryTracking.chainId,
            queryDepth: queryTracking.depth,
        }
        : {})), (querySource
        ? {
            querySource: querySource,
        }
        : {})), { fastMode: fastMode }), (previousRequestId
        ? {
            previousRequestId: previousRequestId,
        }
        : {})), getAnthropicEnvMetadata()));
    // Log API error event for OTLP
    void (0, events_js_1.logOTelEvent)('api_error', {
        model: model,
        error: errStr,
        status_code: String(status),
        duration_ms: String(durationMs),
        attempt: String(attempt),
        speed: fastMode ? 'fast' : 'normal',
    });
    // Pass the span to correctly match responses to requests when beta tracing is enabled
    (0, sessionTracing_js_1.endLLMRequestSpan)(llmSpan, {
        success: false,
        statusCode: status ? parseInt(status) : undefined,
        error: errStr,
        attempt: attempt,
    });
    // Log first error for teleported sessions (reliability tracking)
    var teleportInfo = (0, state_js_1.getTeleportedSessionInfo)();
    if ((teleportInfo === null || teleportInfo === void 0 ? void 0 : teleportInfo.isTeleported) && !teleportInfo.hasLoggedFirstMessage) {
        (0, index_js_1.logEvent)('tengu_teleport_first_message_error', {
            session_id: teleportInfo.sessionId,
            error_type: errorType,
        });
        (0, state_js_1.markFirstTeleportMessageLogged)();
    }
}
function logAPISuccess(_a) {
    var _b, _c, _d, _e, _f, _g;
    var model = _a.model, preNormalizedModel = _a.preNormalizedModel, messageCount = _a.messageCount, messageTokens = _a.messageTokens, usage = _a.usage, durationMs = _a.durationMs, durationMsIncludingRetries = _a.durationMsIncludingRetries, attempt = _a.attempt, ttftMs = _a.ttftMs, requestId = _a.requestId, stopReason = _a.stopReason, costUSD = _a.costUSD, didFallBackToNonStreaming = _a.didFallBackToNonStreaming, querySource = _a.querySource, gateway = _a.gateway, queryTracking = _a.queryTracking, permissionMode = _a.permissionMode, globalCacheStrategy = _a.globalCacheStrategy, textContentLength = _a.textContentLength, thinkingContentLength = _a.thinkingContentLength, toolUseContentLengths = _a.toolUseContentLengths, connectorTextBlockCount = _a.connectorTextBlockCount, fastMode = _a.fastMode, previousRequestId = _a.previousRequestId, betas = _a.betas;
    var isNonInteractiveSession = (0, state_js_1.getIsNonInteractiveSession)();
    var isPostCompaction = (0, state_js_1.consumePostCompaction)();
    var hasPrintFlag = process.argv.includes('-p') || process.argv.includes('--print');
    var now = Date.now();
    var lastCompletion = (0, state_js_1.getLastApiCompletionTimestamp)();
    var timeSinceLastApiCallMs = lastCompletion !== null ? now - lastCompletion : undefined;
    var invocation = (0, agentContext_js_1.consumeInvokingRequestId)();
    (0, index_js_1.logEvent)('tengu_api_success', __assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({ model: model }, (preNormalizedModel !== model
        ? {
            preNormalizedModel: preNormalizedModel,
        }
        : {})), ((betas === null || betas === void 0 ? void 0 : betas.length)
        ? {
            betas: betas.join(','),
        }
        : {})), { messageCount: messageCount, messageTokens: messageTokens, inputTokens: usage.input_tokens, outputTokens: usage.output_tokens, cachedInputTokens: (_b = usage.cache_read_input_tokens) !== null && _b !== void 0 ? _b : 0, uncachedInputTokens: (_c = usage.cache_creation_input_tokens) !== null && _c !== void 0 ? _c : 0, durationMs: durationMs, durationMsIncludingRetries: durationMsIncludingRetries, attempt: attempt, ttftMs: ttftMs !== null && ttftMs !== void 0 ? ttftMs : undefined, buildAgeMins: getBuildAgeMinutes(), provider: (0, providers_js_1.getAPIProviderForStatsig)(), requestId: (_d = requestId) !== null && _d !== void 0 ? _d : undefined }), (invocation
        ? {
            invokingRequestId: invocation.invokingRequestId,
            invocationKind: invocation.invocationKind,
        }
        : {})), { stop_reason: (_e = stopReason) !== null && _e !== void 0 ? _e : undefined, costUSD: costUSD, didFallBackToNonStreaming: didFallBackToNonStreaming, isNonInteractiveSession: isNonInteractiveSession, print: hasPrintFlag, isTTY: (_f = process.stdout.isTTY) !== null && _f !== void 0 ? _f : false, querySource: querySource }), (gateway
        ? {
            gateway: gateway,
        }
        : {})), (queryTracking
        ? {
            queryChainId: queryTracking.chainId,
            queryDepth: queryTracking.depth,
        }
        : {})), { permissionMode: permissionMode }), (globalCacheStrategy
        ? {
            globalCacheStrategy: globalCacheStrategy,
        }
        : {})), (textContentLength !== undefined
        ? {
            textContentLength: textContentLength,
        }
        : {})), (thinkingContentLength !== undefined
        ? {
            thinkingContentLength: thinkingContentLength,
        }
        : {})), (toolUseContentLengths !== undefined
        ? {
            toolUseContentLengths: (0, slowOperations_js_1.jsonStringify)(toolUseContentLengths),
        }
        : {})), (connectorTextBlockCount !== undefined
        ? {
            connectorTextBlockCount: connectorTextBlockCount,
        }
        : {})), { fastMode: fastMode }), ((0, bun_bundle_1.feature)('CACHED_MICROCOMPACT') &&
        ((_g = usage
            .cache_deleted_input_tokens) !== null && _g !== void 0 ? _g : 0) > 0
        ? {
            cacheDeletedInputTokens: usage.cache_deleted_input_tokens,
        }
        : {})), (previousRequestId
        ? {
            previousRequestId: previousRequestId,
        }
        : {})), (isPostCompaction ? { isPostCompaction: isPostCompaction } : {})), getAnthropicEnvMetadata()), { timeSinceLastApiCallMs: timeSinceLastApiCallMs }));
    (0, state_js_1.setLastApiCompletionTimestamp)(now);
}
function logAPISuccessAndDuration(_a) {
    var _b;
    var model = _a.model, preNormalizedModel = _a.preNormalizedModel, start = _a.start, startIncludingRetries = _a.startIncludingRetries, ttftMs = _a.ttftMs, usage = _a.usage, attempt = _a.attempt, messageCount = _a.messageCount, messageTokens = _a.messageTokens, requestId = _a.requestId, stopReason = _a.stopReason, didFallBackToNonStreaming = _a.didFallBackToNonStreaming, querySource = _a.querySource, headers = _a.headers, costUSD = _a.costUSD, queryTracking = _a.queryTracking, permissionMode = _a.permissionMode, newMessages = _a.newMessages, llmSpan = _a.llmSpan, globalCacheStrategy = _a.globalCacheStrategy, requestSetupMs = _a.requestSetupMs, attemptStartTimes = _a.attemptStartTimes, fastMode = _a.fastMode, previousRequestId = _a.previousRequestId, betas = _a.betas;
    var gateway = detectGateway({
        headers: headers,
        baseUrl: process.env.ANTHROPIC_BASE_URL,
    });
    var textContentLength;
    var thinkingContentLength;
    var toolUseContentLengths;
    var connectorTextBlockCount;
    if (newMessages) {
        var textLen = 0;
        var thinkingLen = 0;
        var hasToolUse = false;
        var toolLengths = {};
        var connectorCount = 0;
        for (var _i = 0, newMessages_1 = newMessages; _i < newMessages_1.length; _i++) {
            var msg = newMessages_1[_i];
            for (var _c = 0, _d = msg.message.content; _c < _d.length; _c++) {
                var block = _d[_c];
                if (block.type === 'text') {
                    textLen += block.text.length;
                }
                else if ((0, bun_bundle_1.feature)('CONNECTOR_TEXT') && (0, connectorText_js_1.isConnectorTextBlock)(block)) {
                    connectorCount++;
                }
                else if (block.type === 'thinking') {
                    thinkingLen += block.thinking.length;
                }
                else if (block.type === 'tool_use' ||
                    block.type === 'server_tool_use' ||
                    block.type === 'mcp_tool_use') {
                    var inputLen = (0, slowOperations_js_1.jsonStringify)(block.input).length;
                    var sanitizedName = (0, metadata_js_1.sanitizeToolNameForAnalytics)(block.name);
                    toolLengths[sanitizedName] =
                        ((_b = toolLengths[sanitizedName]) !== null && _b !== void 0 ? _b : 0) + inputLen;
                    hasToolUse = true;
                }
            }
        }
        textContentLength = textLen;
        thinkingContentLength = thinkingLen > 0 ? thinkingLen : undefined;
        toolUseContentLengths = hasToolUse ? toolLengths : undefined;
        connectorTextBlockCount = connectorCount > 0 ? connectorCount : undefined;
    }
    var durationMs = Date.now() - start;
    var durationMsIncludingRetries = Date.now() - startIncludingRetries;
    (0, state_js_1.addToTotalDurationState)(durationMsIncludingRetries, durationMs);
    logAPISuccess({
        model: model,
        preNormalizedModel: preNormalizedModel,
        messageCount: messageCount,
        messageTokens: messageTokens,
        usage: usage,
        durationMs: durationMs,
        durationMsIncludingRetries: durationMsIncludingRetries,
        attempt: attempt,
        ttftMs: ttftMs,
        requestId: requestId,
        stopReason: stopReason,
        costUSD: costUSD,
        didFallBackToNonStreaming: didFallBackToNonStreaming,
        querySource: querySource,
        gateway: gateway,
        queryTracking: queryTracking,
        permissionMode: permissionMode,
        globalCacheStrategy: globalCacheStrategy,
        textContentLength: textContentLength,
        thinkingContentLength: thinkingContentLength,
        toolUseContentLengths: toolUseContentLengths,
        connectorTextBlockCount: connectorTextBlockCount,
        fastMode: fastMode,
        previousRequestId: previousRequestId,
        betas: betas,
    });
    // Log API request event for OTLP
    void (0, events_js_1.logOTelEvent)('api_request', {
        model: model,
        input_tokens: String(usage.input_tokens),
        output_tokens: String(usage.output_tokens),
        cache_read_tokens: String(usage.cache_read_input_tokens),
        cache_creation_tokens: String(usage.cache_creation_input_tokens),
        cost_usd: String(costUSD),
        duration_ms: String(durationMs),
        speed: fastMode ? 'fast' : 'normal',
    });
    // Extract model output, thinking output, and tool call flag when beta tracing is enabled
    var modelOutput;
    var thinkingOutput;
    var hasToolCall;
    if ((0, sessionTracing_js_1.isBetaTracingEnabled)() && newMessages) {
        // Model output - visible to all users
        modelOutput =
            newMessages
                .flatMap(function (m) {
                return m.message.content
                    .filter(function (c) { return c.type === 'text'; })
                    .map(function (c) { return c.text; });
            })
                .join('\n') || undefined;
        // Thinking output - Ant-only (build-time gated)
        if (process.env.USER_TYPE === 'ant') {
            thinkingOutput =
                newMessages
                    .flatMap(function (m) {
                    return m.message.content
                        .filter(function (c) { return c.type === 'thinking'; })
                        .map(function (c) { return c.thinking; });
                })
                    .join('\n') || undefined;
        }
        // Check if any tool_use blocks were in the output
        hasToolCall = newMessages.some(function (m) {
            return m.message.content.some(function (c) { return c.type === 'tool_use'; });
        });
    }
    // Pass the span to correctly match responses to requests when beta tracing is enabled
    (0, sessionTracing_js_1.endLLMRequestSpan)(llmSpan, {
        success: true,
        inputTokens: usage.input_tokens,
        outputTokens: usage.output_tokens,
        cacheReadTokens: usage.cache_read_input_tokens,
        cacheCreationTokens: usage.cache_creation_input_tokens,
        attempt: attempt,
        modelOutput: modelOutput,
        thinkingOutput: thinkingOutput,
        hasToolCall: hasToolCall,
        ttftMs: ttftMs !== null && ttftMs !== void 0 ? ttftMs : undefined,
        requestSetupMs: requestSetupMs,
        attemptStartTimes: attemptStartTimes,
    });
    // Log first successful message for teleported sessions (reliability tracking)
    var teleportInfo = (0, state_js_1.getTeleportedSessionInfo)();
    if ((teleportInfo === null || teleportInfo === void 0 ? void 0 : teleportInfo.isTeleported) && !teleportInfo.hasLoggedFirstMessage) {
        (0, index_js_1.logEvent)('tengu_teleport_first_message_success', {
            session_id: teleportInfo.sessionId,
        });
        (0, state_js_1.markFirstTeleportMessageLogged)();
    }
}
