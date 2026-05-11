"use strict";
/**
 * Session Tracing for Claude Code using OpenTelemetry (BETA)
 *
 * This module provides a high-level API for creating and managing spans
 * to trace Claude Code workflows. Each user interaction creates a root
 * interaction span, which contains operation spans (LLM requests, tool calls, etc.).
 *
 * Requirements:
 * - Enhanced telemetry is enabled via feature('ENHANCED_TELEMETRY_BETA')
 * - Configure OTEL_TRACES_EXPORTER (console, otlp, etc.)
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
exports.isBetaTracingEnabled = void 0;
exports.isEnhancedTelemetryEnabled = isEnhancedTelemetryEnabled;
exports.startInteractionSpan = startInteractionSpan;
exports.endInteractionSpan = endInteractionSpan;
exports.startLLMRequestSpan = startLLMRequestSpan;
exports.endLLMRequestSpan = endLLMRequestSpan;
exports.startToolSpan = startToolSpan;
exports.startToolBlockedOnUserSpan = startToolBlockedOnUserSpan;
exports.endToolBlockedOnUserSpan = endToolBlockedOnUserSpan;
exports.startToolExecutionSpan = startToolExecutionSpan;
exports.endToolExecutionSpan = endToolExecutionSpan;
exports.endToolSpan = endToolSpan;
exports.addToolContentEvent = addToolContentEvent;
exports.getCurrentSpan = getCurrentSpan;
exports.executeInSpan = executeInSpan;
exports.startHookSpan = startHookSpan;
exports.endHookSpan = endHookSpan;
var bun_bundle_1 = require("bun:bundle");
var api_1 = require("@opentelemetry/api");
var async_hooks_1 = require("async_hooks");
var growthbook_js_1 = require("../../services/analytics/growthbook.js");
var envUtils_js_1 = require("../envUtils.js");
var telemetryAttributes_js_1 = require("../telemetryAttributes.js");
var betaSessionTracing_js_1 = require("./betaSessionTracing.js");
Object.defineProperty(exports, "isBetaTracingEnabled", { enumerable: true, get: function () { return betaSessionTracing_js_1.isBetaTracingEnabled; } });
var perfettoTracing_js_1 = require("./perfettoTracing.js");
// ALS stores SpanContext directly so it holds a strong reference while a span
// is active. With that, activeSpans can use WeakRef — when ALS is cleared
// (enterWith(undefined)) and no other code holds the SpanContext, GC can collect
// it and the WeakRef goes stale.
var interactionContext = new async_hooks_1.AsyncLocalStorage();
var toolContext = new async_hooks_1.AsyncLocalStorage();
var activeSpans = new Map();
// Spans not stored in ALS (LLM request, blocked-on-user, tool execution, hook)
// need a strong reference to prevent GC from collecting the SpanContext before
// the corresponding end* function retrieves it.
var strongSpans = new Map();
var interactionSequence = 0;
var _cleanupIntervalStarted = false;
var SPAN_TTL_MS = 30 * 60 * 1000; // 30 minutes
function getSpanId(span) {
    return span.spanContext().spanId || '';
}
/**
 * Lazily start a background interval that evicts orphaned spans from activeSpans.
 *
 * Normal teardown calls endInteractionSpan / endToolSpan, which delete spans
 * immediately. This interval is a safety net for spans that were never ended
 * (e.g. aborted streams, uncaught exceptions mid-query) — without it they
 * accumulate in activeSpans indefinitely, holding references to Span objects
 * and the OpenTelemetry context chain.
 *
 * Initialized on the first startInteractionSpan call (not at module load) to
 * avoid triggering the no-top-level-side-effects lint rule and to keep the
 * interval from running in processes that never start a span.
 * unref() prevents the timer from keeping the process alive after all other
 * work is done.
 */
function ensureCleanupInterval() {
    if (_cleanupIntervalStarted)
        return;
    _cleanupIntervalStarted = true;
    var interval = setInterval(function () {
        var cutoff = Date.now() - SPAN_TTL_MS;
        for (var _i = 0, activeSpans_1 = activeSpans; _i < activeSpans_1.length; _i++) {
            var _a = activeSpans_1[_i], spanId = _a[0], weakRef = _a[1];
            var ctx = weakRef.deref();
            if (ctx === undefined) {
                activeSpans.delete(spanId);
                strongSpans.delete(spanId);
            }
            else if (ctx.startTime < cutoff) {
                if (!ctx.ended)
                    ctx.span.end(); // flush any recorded attributes to the exporter
                activeSpans.delete(spanId);
                strongSpans.delete(spanId);
            }
        }
    }, 60000);
    if (typeof interval.unref === 'function') {
        interval.unref(); // Node.js / Bun: don't block process exit
    }
}
/**
 * Check if enhanced telemetry is enabled.
 * Priority: env var override > ant build > GrowthBook gate
 */
function isEnhancedTelemetryEnabled() {
    var _a;
    if ((0, bun_bundle_1.feature)('ENHANCED_TELEMETRY_BETA')) {
        var env = (_a = process.env.CLAUDE_CODE_ENHANCED_TELEMETRY_BETA) !== null && _a !== void 0 ? _a : process.env.ENABLE_ENHANCED_TELEMETRY_BETA;
        if ((0, envUtils_js_1.isEnvTruthy)(env)) {
            return true;
        }
        if ((0, envUtils_js_1.isEnvDefinedFalsy)(env)) {
            return false;
        }
        return (process.env.USER_TYPE === 'ant' ||
            (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('enhanced_telemetry_beta', false));
    }
    return false;
}
/**
 * Check if any tracing is enabled (either standard enhanced telemetry OR beta tracing)
 */
function isAnyTracingEnabled() {
    return isEnhancedTelemetryEnabled() || (0, betaSessionTracing_js_1.isBetaTracingEnabled)();
}
function getTracer() {
    return api_1.trace.getTracer('com.anthropic.claude_code.tracing', '1.0.0');
}
function createSpanAttributes(spanType, customAttributes) {
    if (customAttributes === void 0) { customAttributes = {}; }
    var baseAttributes = (0, telemetryAttributes_js_1.getTelemetryAttributes)();
    var attributes = __assign(__assign(__assign({}, baseAttributes), { 'span.type': spanType }), customAttributes);
    return attributes;
}
/**
 * Start an interaction span. This wraps a user request -> Claude response cycle.
 * This is now a root span that includes all session-level attributes.
 * Sets the interaction context for all subsequent operations.
 */
function startInteractionSpan(userPrompt) {
    ensureCleanupInterval();
    // Start Perfetto span regardless of OTel tracing state
    var perfettoSpanId = (0, perfettoTracing_js_1.isPerfettoTracingEnabled)()
        ? (0, perfettoTracing_js_1.startInteractionPerfettoSpan)(userPrompt)
        : undefined;
    if (!isAnyTracingEnabled()) {
        // Still track Perfetto span even if OTel is disabled
        if (perfettoSpanId) {
            var dummySpan = api_1.trace.getActiveSpan() || getTracer().startSpan('dummy');
            var spanId_1 = getSpanId(dummySpan);
            var spanContextObj_1 = {
                span: dummySpan,
                startTime: Date.now(),
                attributes: {},
                perfettoSpanId: perfettoSpanId,
            };
            activeSpans.set(spanId_1, new WeakRef(spanContextObj_1));
            interactionContext.enterWith(spanContextObj_1);
            return dummySpan;
        }
        return api_1.trace.getActiveSpan() || getTracer().startSpan('dummy');
    }
    var tracer = getTracer();
    var isUserPromptLoggingEnabled = (0, envUtils_js_1.isEnvTruthy)(process.env.OTEL_LOG_USER_PROMPTS);
    var promptToLog = isUserPromptLoggingEnabled ? userPrompt : '<REDACTED>';
    interactionSequence++;
    var attributes = createSpanAttributes('interaction', {
        user_prompt: promptToLog,
        user_prompt_length: userPrompt.length,
        'interaction.sequence': interactionSequence,
    });
    var span = tracer.startSpan('claude_code.interaction', {
        attributes: attributes,
    });
    // Add experimental attributes (new_context)
    (0, betaSessionTracing_js_1.addBetaInteractionAttributes)(span, userPrompt);
    var spanId = getSpanId(span);
    var spanContextObj = {
        span: span,
        startTime: Date.now(),
        attributes: attributes,
        perfettoSpanId: perfettoSpanId,
    };
    activeSpans.set(spanId, new WeakRef(spanContextObj));
    interactionContext.enterWith(spanContextObj);
    return span;
}
function endInteractionSpan() {
    var spanContext = interactionContext.getStore();
    if (!spanContext) {
        return;
    }
    if (spanContext.ended) {
        return;
    }
    // End Perfetto span
    if (spanContext.perfettoSpanId) {
        (0, perfettoTracing_js_1.endInteractionPerfettoSpan)(spanContext.perfettoSpanId);
    }
    if (!isAnyTracingEnabled()) {
        spanContext.ended = true;
        activeSpans.delete(getSpanId(spanContext.span));
        // Clear the store so async continuations created after this point (timers,
        // promise callbacks, I/O) do not inherit a reference to the ended span.
        // enterWith(undefined) is intentional: exit(() => {}) is a no-op because it
        // only suppresses the store inside the callback and returns immediately.
        interactionContext.enterWith(undefined);
        return;
    }
    var duration = Date.now() - spanContext.startTime;
    spanContext.span.setAttributes({
        'interaction.duration_ms': duration,
    });
    spanContext.span.end();
    spanContext.ended = true;
    activeSpans.delete(getSpanId(spanContext.span));
    interactionContext.enterWith(undefined);
}
function startLLMRequestSpan(model, newContext, messagesForAPI, fastMode) {
    // Start Perfetto span regardless of OTel tracing state
    var perfettoSpanId = (0, perfettoTracing_js_1.isPerfettoTracingEnabled)()
        ? (0, perfettoTracing_js_1.startLLMRequestPerfettoSpan)({
            model: model,
            querySource: newContext === null || newContext === void 0 ? void 0 : newContext.querySource,
            messageId: undefined, // Will be set in endLLMRequestSpan
        })
        : undefined;
    if (!isAnyTracingEnabled()) {
        // Still track Perfetto span even if OTel is disabled
        if (perfettoSpanId) {
            var dummySpan = api_1.trace.getActiveSpan() || getTracer().startSpan('dummy');
            var spanId_2 = getSpanId(dummySpan);
            var spanContextObj_2 = {
                span: dummySpan,
                startTime: Date.now(),
                attributes: { model: model },
                perfettoSpanId: perfettoSpanId,
            };
            activeSpans.set(spanId_2, new WeakRef(spanContextObj_2));
            strongSpans.set(spanId_2, spanContextObj_2);
            return dummySpan;
        }
        return api_1.trace.getActiveSpan() || getTracer().startSpan('dummy');
    }
    var tracer = getTracer();
    var parentSpanCtx = interactionContext.getStore();
    var attributes = createSpanAttributes('llm_request', {
        model: model,
        'llm_request.context': parentSpanCtx ? 'interaction' : 'standalone',
        speed: fastMode ? 'fast' : 'normal',
    });
    var ctx = parentSpanCtx
        ? api_1.trace.setSpan(api_1.context.active(), parentSpanCtx.span)
        : api_1.context.active();
    var span = tracer.startSpan('claude_code.llm_request', { attributes: attributes }, ctx);
    // Add query_source (agent name) if provided
    if (newContext === null || newContext === void 0 ? void 0 : newContext.querySource) {
        span.setAttribute('query_source', newContext.querySource);
    }
    // Add experimental attributes (system prompt, new_context)
    (0, betaSessionTracing_js_1.addBetaLLMRequestAttributes)(span, newContext, messagesForAPI);
    var spanId = getSpanId(span);
    var spanContextObj = {
        span: span,
        startTime: Date.now(),
        attributes: attributes,
        perfettoSpanId: perfettoSpanId,
    };
    activeSpans.set(spanId, new WeakRef(spanContextObj));
    strongSpans.set(spanId, spanContextObj);
    return span;
}
/**
 * End an LLM request span and attach response metadata.
 *
 * @param span - Optional. The exact span returned by startLLMRequestSpan().
 *   IMPORTANT: When multiple LLM requests run in parallel (e.g., warmup requests,
 *   topic classifier, file path extractor, main thread), you MUST pass the specific span
 *   to ensure responses are attached to the correct request. Without it, responses may be
 *   incorrectly attached to whichever span happens to be "last" in the activeSpans map.
 *
 *   If not provided, falls back to finding the most recent llm_request span (legacy behavior).
 */
function endLLMRequestSpan(span, metadata) {
    var _a, _b;
    var llmSpanContext;
    if (span) {
        // Use the provided span directly - this is the correct approach for parallel requests
        var spanId_3 = getSpanId(span);
        llmSpanContext = (_a = activeSpans.get(spanId_3)) === null || _a === void 0 ? void 0 : _a.deref();
    }
    else {
        // Legacy fallback: find the most recent llm_request span
        // WARNING: This can cause mismatched responses when multiple requests are in flight
        llmSpanContext = (_b = Array.from(activeSpans.values())
            .findLast(function (r) {
            var ctx = r.deref();
            return ((ctx === null || ctx === void 0 ? void 0 : ctx.attributes['span.type']) === 'llm_request' ||
                (ctx === null || ctx === void 0 ? void 0 : ctx.attributes['model']));
        })) === null || _b === void 0 ? void 0 : _b.deref();
    }
    if (!llmSpanContext) {
        // Span was already ended or never tracked
        return;
    }
    var duration = Date.now() - llmSpanContext.startTime;
    // End Perfetto span with full metadata
    if (llmSpanContext.perfettoSpanId) {
        (0, perfettoTracing_js_1.endLLMRequestPerfettoSpan)(llmSpanContext.perfettoSpanId, {
            ttftMs: metadata === null || metadata === void 0 ? void 0 : metadata.ttftMs,
            ttltMs: duration, // Time to last token is the total duration
            promptTokens: metadata === null || metadata === void 0 ? void 0 : metadata.inputTokens,
            outputTokens: metadata === null || metadata === void 0 ? void 0 : metadata.outputTokens,
            cacheReadTokens: metadata === null || metadata === void 0 ? void 0 : metadata.cacheReadTokens,
            cacheCreationTokens: metadata === null || metadata === void 0 ? void 0 : metadata.cacheCreationTokens,
            success: metadata === null || metadata === void 0 ? void 0 : metadata.success,
            error: metadata === null || metadata === void 0 ? void 0 : metadata.error,
            requestSetupMs: metadata === null || metadata === void 0 ? void 0 : metadata.requestSetupMs,
            attemptStartTimes: metadata === null || metadata === void 0 ? void 0 : metadata.attemptStartTimes,
        });
    }
    if (!isAnyTracingEnabled()) {
        var spanId_4 = getSpanId(llmSpanContext.span);
        activeSpans.delete(spanId_4);
        strongSpans.delete(spanId_4);
        return;
    }
    var endAttributes = {
        duration_ms: duration,
    };
    if (metadata) {
        if (metadata.inputTokens !== undefined)
            endAttributes['input_tokens'] = metadata.inputTokens;
        if (metadata.outputTokens !== undefined)
            endAttributes['output_tokens'] = metadata.outputTokens;
        if (metadata.cacheReadTokens !== undefined)
            endAttributes['cache_read_tokens'] = metadata.cacheReadTokens;
        if (metadata.cacheCreationTokens !== undefined)
            endAttributes['cache_creation_tokens'] = metadata.cacheCreationTokens;
        if (metadata.success !== undefined)
            endAttributes['success'] = metadata.success;
        if (metadata.statusCode !== undefined)
            endAttributes['status_code'] = metadata.statusCode;
        if (metadata.error !== undefined)
            endAttributes['error'] = metadata.error;
        if (metadata.attempt !== undefined)
            endAttributes['attempt'] = metadata.attempt;
        if (metadata.hasToolCall !== undefined)
            endAttributes['response.has_tool_call'] = metadata.hasToolCall;
        if (metadata.ttftMs !== undefined)
            endAttributes['ttft_ms'] = metadata.ttftMs;
        // Add experimental response attributes (model_output, thinking_output)
        (0, betaSessionTracing_js_1.addBetaLLMResponseAttributes)(endAttributes, metadata);
    }
    llmSpanContext.span.setAttributes(endAttributes);
    llmSpanContext.span.end();
    var spanId = getSpanId(llmSpanContext.span);
    activeSpans.delete(spanId);
    strongSpans.delete(spanId);
}
function startToolSpan(toolName, toolAttributes, toolInput) {
    // Start Perfetto span regardless of OTel tracing state
    var perfettoSpanId = (0, perfettoTracing_js_1.isPerfettoTracingEnabled)()
        ? (0, perfettoTracing_js_1.startToolPerfettoSpan)(toolName, toolAttributes)
        : undefined;
    if (!isAnyTracingEnabled()) {
        // Still track Perfetto span even if OTel is disabled
        if (perfettoSpanId) {
            var dummySpan = api_1.trace.getActiveSpan() || getTracer().startSpan('dummy');
            var spanId_5 = getSpanId(dummySpan);
            var spanContextObj_3 = {
                span: dummySpan,
                startTime: Date.now(),
                attributes: { 'span.type': 'tool', tool_name: toolName },
                perfettoSpanId: perfettoSpanId,
            };
            activeSpans.set(spanId_5, new WeakRef(spanContextObj_3));
            toolContext.enterWith(spanContextObj_3);
            return dummySpan;
        }
        return api_1.trace.getActiveSpan() || getTracer().startSpan('dummy');
    }
    var tracer = getTracer();
    var parentSpanCtx = interactionContext.getStore();
    var attributes = createSpanAttributes('tool', __assign({ tool_name: toolName }, toolAttributes));
    var ctx = parentSpanCtx
        ? api_1.trace.setSpan(api_1.context.active(), parentSpanCtx.span)
        : api_1.context.active();
    var span = tracer.startSpan('claude_code.tool', { attributes: attributes }, ctx);
    // Add experimental tool input attributes
    if (toolInput) {
        (0, betaSessionTracing_js_1.addBetaToolInputAttributes)(span, toolName, toolInput);
    }
    var spanId = getSpanId(span);
    var spanContextObj = {
        span: span,
        startTime: Date.now(),
        attributes: attributes,
        perfettoSpanId: perfettoSpanId,
    };
    activeSpans.set(spanId, new WeakRef(spanContextObj));
    toolContext.enterWith(spanContextObj);
    return span;
}
function startToolBlockedOnUserSpan() {
    // Start Perfetto span regardless of OTel tracing state
    var perfettoSpanId = (0, perfettoTracing_js_1.isPerfettoTracingEnabled)()
        ? (0, perfettoTracing_js_1.startUserInputPerfettoSpan)('tool_permission')
        : undefined;
    if (!isAnyTracingEnabled()) {
        // Still track Perfetto span even if OTel is disabled
        if (perfettoSpanId) {
            var dummySpan = api_1.trace.getActiveSpan() || getTracer().startSpan('dummy');
            var spanId_6 = getSpanId(dummySpan);
            var spanContextObj_4 = {
                span: dummySpan,
                startTime: Date.now(),
                attributes: { 'span.type': 'tool.blocked_on_user' },
                perfettoSpanId: perfettoSpanId,
            };
            activeSpans.set(spanId_6, new WeakRef(spanContextObj_4));
            strongSpans.set(spanId_6, spanContextObj_4);
            return dummySpan;
        }
        return api_1.trace.getActiveSpan() || getTracer().startSpan('dummy');
    }
    var tracer = getTracer();
    var parentSpanCtx = toolContext.getStore();
    var attributes = createSpanAttributes('tool.blocked_on_user');
    var ctx = parentSpanCtx
        ? api_1.trace.setSpan(api_1.context.active(), parentSpanCtx.span)
        : api_1.context.active();
    var span = tracer.startSpan('claude_code.tool.blocked_on_user', { attributes: attributes }, ctx);
    var spanId = getSpanId(span);
    var spanContextObj = {
        span: span,
        startTime: Date.now(),
        attributes: attributes,
        perfettoSpanId: perfettoSpanId,
    };
    activeSpans.set(spanId, new WeakRef(spanContextObj));
    strongSpans.set(spanId, spanContextObj);
    return span;
}
function endToolBlockedOnUserSpan(decision, source) {
    var _a;
    var blockedSpanContext = (_a = Array.from(activeSpans.values())
        .findLast(function (r) { var _a; return ((_a = r.deref()) === null || _a === void 0 ? void 0 : _a.attributes['span.type']) === 'tool.blocked_on_user'; })) === null || _a === void 0 ? void 0 : _a.deref();
    if (!blockedSpanContext) {
        return;
    }
    // End Perfetto span
    if (blockedSpanContext.perfettoSpanId) {
        (0, perfettoTracing_js_1.endUserInputPerfettoSpan)(blockedSpanContext.perfettoSpanId, {
            decision: decision,
            source: source,
        });
    }
    if (!isAnyTracingEnabled()) {
        var spanId_7 = getSpanId(blockedSpanContext.span);
        activeSpans.delete(spanId_7);
        strongSpans.delete(spanId_7);
        return;
    }
    var duration = Date.now() - blockedSpanContext.startTime;
    var attributes = {
        duration_ms: duration,
    };
    if (decision) {
        attributes['decision'] = decision;
    }
    if (source) {
        attributes['source'] = source;
    }
    blockedSpanContext.span.setAttributes(attributes);
    blockedSpanContext.span.end();
    var spanId = getSpanId(blockedSpanContext.span);
    activeSpans.delete(spanId);
    strongSpans.delete(spanId);
}
function startToolExecutionSpan() {
    if (!isAnyTracingEnabled()) {
        return api_1.trace.getActiveSpan() || getTracer().startSpan('dummy');
    }
    var tracer = getTracer();
    var parentSpanCtx = toolContext.getStore();
    var attributes = createSpanAttributes('tool.execution');
    var ctx = parentSpanCtx
        ? api_1.trace.setSpan(api_1.context.active(), parentSpanCtx.span)
        : api_1.context.active();
    var span = tracer.startSpan('claude_code.tool.execution', { attributes: attributes }, ctx);
    var spanId = getSpanId(span);
    var spanContextObj = {
        span: span,
        startTime: Date.now(),
        attributes: attributes,
    };
    activeSpans.set(spanId, new WeakRef(spanContextObj));
    strongSpans.set(spanId, spanContextObj);
    return span;
}
function endToolExecutionSpan(metadata) {
    var _a;
    if (!isAnyTracingEnabled()) {
        return;
    }
    var executionSpanContext = (_a = Array.from(activeSpans.values())
        .findLast(function (r) { var _a; return ((_a = r.deref()) === null || _a === void 0 ? void 0 : _a.attributes['span.type']) === 'tool.execution'; })) === null || _a === void 0 ? void 0 : _a.deref();
    if (!executionSpanContext) {
        return;
    }
    var duration = Date.now() - executionSpanContext.startTime;
    var attributes = {
        duration_ms: duration,
    };
    if (metadata) {
        if (metadata.success !== undefined)
            attributes['success'] = metadata.success;
        if (metadata.error !== undefined)
            attributes['error'] = metadata.error;
    }
    executionSpanContext.span.setAttributes(attributes);
    executionSpanContext.span.end();
    var spanId = getSpanId(executionSpanContext.span);
    activeSpans.delete(spanId);
    strongSpans.delete(spanId);
}
function endToolSpan(toolResult, resultTokens) {
    var toolSpanContext = toolContext.getStore();
    if (!toolSpanContext) {
        return;
    }
    // End Perfetto span
    if (toolSpanContext.perfettoSpanId) {
        (0, perfettoTracing_js_1.endToolPerfettoSpan)(toolSpanContext.perfettoSpanId, {
            success: true,
            resultTokens: resultTokens,
        });
    }
    if (!isAnyTracingEnabled()) {
        var spanId_8 = getSpanId(toolSpanContext.span);
        activeSpans.delete(spanId_8);
        // Same reasoning as interactionContext above: clear so subsequent async
        // work doesn't hold a stale reference to the ended tool span.
        toolContext.enterWith(undefined);
        return;
    }
    var duration = Date.now() - toolSpanContext.startTime;
    var endAttributes = {
        duration_ms: duration,
    };
    // Add experimental tool result attributes (new_context)
    if (toolResult) {
        var toolName = toolSpanContext.attributes['tool_name'] || 'unknown';
        (0, betaSessionTracing_js_1.addBetaToolResultAttributes)(endAttributes, toolName, toolResult);
    }
    if (resultTokens !== undefined) {
        endAttributes['result_tokens'] = resultTokens;
    }
    toolSpanContext.span.setAttributes(endAttributes);
    toolSpanContext.span.end();
    var spanId = getSpanId(toolSpanContext.span);
    activeSpans.delete(spanId);
    toolContext.enterWith(undefined);
}
function isToolContentLoggingEnabled() {
    return (0, envUtils_js_1.isEnvTruthy)(process.env.OTEL_LOG_TOOL_CONTENT);
}
/**
 * Add a span event with tool content/output data.
 * Only logs if OTEL_LOG_TOOL_CONTENT=1 is set.
 * Truncates content if it exceeds MAX_CONTENT_SIZE.
 */
function addToolContentEvent(eventName, attributes) {
    if (!isAnyTracingEnabled() || !isToolContentLoggingEnabled()) {
        return;
    }
    var currentSpanCtx = toolContext.getStore();
    if (!currentSpanCtx) {
        return;
    }
    // Truncate string attributes that might be large
    var processedAttributes = {};
    for (var _i = 0, _a = Object.entries(attributes); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        if (typeof value === 'string') {
            var _c = (0, betaSessionTracing_js_1.truncateContent)(value), content = _c.content, truncated = _c.truncated;
            processedAttributes[key] = content;
            if (truncated) {
                processedAttributes["".concat(key, "_truncated")] = true;
                processedAttributes["".concat(key, "_original_length")] = value.length;
            }
        }
        else {
            processedAttributes[key] = value;
        }
    }
    currentSpanCtx.span.addEvent(eventName, processedAttributes);
}
function getCurrentSpan() {
    var _a, _b, _c, _d;
    if (!isAnyTracingEnabled()) {
        return null;
    }
    return ((_d = (_b = (_a = toolContext.getStore()) === null || _a === void 0 ? void 0 : _a.span) !== null && _b !== void 0 ? _b : (_c = interactionContext.getStore()) === null || _c === void 0 ? void 0 : _c.span) !== null && _d !== void 0 ? _d : null);
}
function executeInSpan(spanName, fn, attributes) {
    return __awaiter(this, void 0, void 0, function () {
        var tracer, parentSpanCtx, finalAttributes, ctx, span, spanId, spanContextObj, result, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!isAnyTracingEnabled()) {
                        return [2 /*return*/, fn(api_1.trace.getActiveSpan() || getTracer().startSpan('dummy'))];
                    }
                    tracer = getTracer();
                    parentSpanCtx = (_a = toolContext.getStore()) !== null && _a !== void 0 ? _a : interactionContext.getStore();
                    finalAttributes = createSpanAttributes('tool', __assign({}, attributes));
                    ctx = parentSpanCtx
                        ? api_1.trace.setSpan(api_1.context.active(), parentSpanCtx.span)
                        : api_1.context.active();
                    span = tracer.startSpan(spanName, { attributes: finalAttributes }, ctx);
                    spanId = getSpanId(span);
                    spanContextObj = {
                        span: span,
                        startTime: Date.now(),
                        attributes: finalAttributes,
                    };
                    activeSpans.set(spanId, new WeakRef(spanContextObj));
                    strongSpans.set(spanId, spanContextObj);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, fn(span)];
                case 2:
                    result = _b.sent();
                    span.end();
                    activeSpans.delete(spanId);
                    strongSpans.delete(spanId);
                    return [2 /*return*/, result];
                case 3:
                    error_1 = _b.sent();
                    if (error_1 instanceof Error) {
                        span.recordException(error_1);
                    }
                    span.end();
                    activeSpans.delete(spanId);
                    strongSpans.delete(spanId);
                    throw error_1;
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Start a hook execution span.
 * Only creates a span when beta tracing is enabled.
 * @param hookEvent The hook event type (e.g., 'PreToolUse', 'PostToolUse')
 * @param hookName The full hook name (e.g., 'PreToolUse:Write')
 * @param numHooks The number of hooks being executed
 * @param hookDefinitions JSON string of hook definitions for tracing
 * @returns The span (or a dummy span if tracing is disabled)
 */
function startHookSpan(hookEvent, hookName, numHooks, hookDefinitions) {
    var _a;
    if (!(0, betaSessionTracing_js_1.isBetaTracingEnabled)()) {
        return api_1.trace.getActiveSpan() || getTracer().startSpan('dummy');
    }
    var tracer = getTracer();
    var parentSpanCtx = (_a = toolContext.getStore()) !== null && _a !== void 0 ? _a : interactionContext.getStore();
    var attributes = createSpanAttributes('hook', {
        hook_event: hookEvent,
        hook_name: hookName,
        num_hooks: numHooks,
        hook_definitions: hookDefinitions,
    });
    var ctx = parentSpanCtx
        ? api_1.trace.setSpan(api_1.context.active(), parentSpanCtx.span)
        : api_1.context.active();
    var span = tracer.startSpan('claude_code.hook', { attributes: attributes }, ctx);
    var spanId = getSpanId(span);
    var spanContextObj = {
        span: span,
        startTime: Date.now(),
        attributes: attributes,
    };
    activeSpans.set(spanId, new WeakRef(spanContextObj));
    strongSpans.set(spanId, spanContextObj);
    return span;
}
/**
 * End a hook execution span with outcome metadata.
 * Only does work when beta tracing is enabled.
 * @param span The span to end (returned from startHookSpan)
 * @param metadata The outcome metadata for the hook execution
 */
function endHookSpan(span, metadata) {
    var _a;
    if (!(0, betaSessionTracing_js_1.isBetaTracingEnabled)()) {
        return;
    }
    var spanId = getSpanId(span);
    var spanContext = (_a = activeSpans.get(spanId)) === null || _a === void 0 ? void 0 : _a.deref();
    if (!spanContext) {
        return;
    }
    var duration = Date.now() - spanContext.startTime;
    var endAttributes = {
        duration_ms: duration,
    };
    if (metadata) {
        if (metadata.numSuccess !== undefined)
            endAttributes['num_success'] = metadata.numSuccess;
        if (metadata.numBlocking !== undefined)
            endAttributes['num_blocking'] = metadata.numBlocking;
        if (metadata.numNonBlockingError !== undefined)
            endAttributes['num_non_blocking_error'] = metadata.numNonBlockingError;
        if (metadata.numCancelled !== undefined)
            endAttributes['num_cancelled'] = metadata.numCancelled;
    }
    spanContext.span.setAttributes(endAttributes);
    spanContext.span.end();
    activeSpans.delete(spanId);
    strongSpans.delete(spanId);
}
