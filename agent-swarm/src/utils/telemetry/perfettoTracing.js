"use strict";
/**
 * Perfetto Tracing for Claude Code (Ant-only)
 *
 * This module generates traces in the Chrome Trace Event format that can be
 * viewed in ui.perfetto.dev or Chrome's chrome://tracing.
 *
 * NOTE: This feature is ant-only and eliminated from external builds.
 *
 * The trace file includes:
 * - Agent hierarchy (parent-child relationships in a swarm)
 * - API requests with TTFT, TTLT, prompt length, cache stats, msg ID, speculative flag
 * - Tool executions with name, duration, and token usage
 * - User input waiting time
 *
 * Usage:
 * 1. Enable via CLAUDE_CODE_PERFETTO_TRACE=1 or CLAUDE_CODE_PERFETTO_TRACE=<path>
 * 2. Optionally set CLAUDE_CODE_PERFETTO_WRITE_INTERVAL_S=<positive integer> to write the
 *    trace file periodically (default: write only on exit).
 * 3. Run Claude Code normally
 * 4. Trace file is written to ~/.claude/traces/trace-<session-id>.json
 *    or to the specified path
 * 5. Open in ui.perfetto.dev to visualize
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_EVENTS_FOR_TESTING = void 0;
exports.initializePerfettoTracing = initializePerfettoTracing;
exports.isPerfettoTracingEnabled = isPerfettoTracingEnabled;
exports.registerAgent = registerAgent;
exports.unregisterAgent = unregisterAgent;
exports.startLLMRequestPerfettoSpan = startLLMRequestPerfettoSpan;
exports.endLLMRequestPerfettoSpan = endLLMRequestPerfettoSpan;
exports.startToolPerfettoSpan = startToolPerfettoSpan;
exports.endToolPerfettoSpan = endToolPerfettoSpan;
exports.startUserInputPerfettoSpan = startUserInputPerfettoSpan;
exports.endUserInputPerfettoSpan = endUserInputPerfettoSpan;
exports.emitPerfettoInstant = emitPerfettoInstant;
exports.emitPerfettoCounter = emitPerfettoCounter;
exports.startInteractionPerfettoSpan = startInteractionPerfettoSpan;
exports.endInteractionPerfettoSpan = endInteractionPerfettoSpan;
exports.getPerfettoEvents = getPerfettoEvents;
exports.resetPerfettoTracer = resetPerfettoTracer;
exports.triggerPeriodicWriteForTesting = triggerPeriodicWriteForTesting;
exports.evictStaleSpansForTesting = evictStaleSpansForTesting;
exports.evictOldestEventsForTesting = evictOldestEventsForTesting;
var bun_bundle_1 = require("bun:bundle");
var fs_1 = require("fs");
var promises_1 = require("fs/promises");
var path_1 = require("path");
var state_js_1 = require("../../bootstrap/state.js");
var cleanupRegistry_js_1 = require("../cleanupRegistry.js");
var debug_js_1 = require("../debug.js");
var envUtils_js_1 = require("../envUtils.js");
var errors_js_1 = require("../errors.js");
var hash_js_1 = require("../hash.js");
var slowOperations_js_1 = require("../slowOperations.js");
var teammate_js_1 = require("../teammate.js");
// Global state for the Perfetto tracer
var isEnabled = false;
var tracePath = null;
// Metadata events (ph: 'M' — process/thread names, parent links) are kept
// separate so they survive eviction — Perfetto UI needs them to label
// tracks. Bounded by agent count (~3 events per agent).
var metadataEvents = [];
var events = [];
// events[] cap. Cron-driven sessions run for days; 22 push sites × many
// turns would otherwise grow unboundedly (periodicWrite flushes to disk but
// does not truncate — it writes the full snapshot). At ~300B/event this is
// ~30MB, enough trace history for any debugging session. Eviction drops the
// oldest half when hit, amortized O(1).
var MAX_EVENTS = 100000;
var pendingSpans = new Map();
var agentRegistry = new Map();
var totalAgentCount = 0;
var startTimeMs = 0;
var spanIdCounter = 0;
var traceWritten = false; // Flag to avoid double writes
// Map agent IDs to numeric process IDs (Perfetto requires numeric IDs)
var processIdCounter = 1;
var agentIdToProcessId = new Map();
// Periodic write interval handle
var writeIntervalId = null;
var STALE_SPAN_TTL_MS = 30 * 60 * 1000; // 30 minutes
var STALE_SPAN_CLEANUP_INTERVAL_MS = 60 * 1000; // 1 minute
var staleSpanCleanupId = null;
/**
 * Convert a string to a numeric hash for use as thread ID
 */
function stringToNumericHash(str) {
    return Math.abs((0, hash_js_1.djb2Hash)(str)) || 1; // Ensure non-zero
}
/**
 * Get or create a numeric process ID for an agent
 */
function getProcessIdForAgent(agentId) {
    var existing = agentIdToProcessId.get(agentId);
    if (existing !== undefined)
        return existing;
    processIdCounter++;
    agentIdToProcessId.set(agentId, processIdCounter);
    return processIdCounter;
}
/**
 * Get current agent info
 */
function getCurrentAgentInfo() {
    var _a, _b;
    var agentId = (_a = (0, teammate_js_1.getAgentId)()) !== null && _a !== void 0 ? _a : (0, state_js_1.getSessionId)();
    var agentName = (_b = (0, teammate_js_1.getAgentName)()) !== null && _b !== void 0 ? _b : 'main';
    var parentSessionId = (0, teammate_js_1.getParentSessionId)();
    // Check if we've already registered this agent
    var existing = agentRegistry.get(agentId);
    if (existing)
        return existing;
    var info = {
        agentId: agentId,
        agentName: agentName,
        parentAgentId: parentSessionId,
        processId: agentId === (0, state_js_1.getSessionId)() ? 1 : getProcessIdForAgent(agentId),
        threadId: stringToNumericHash(agentName),
    };
    agentRegistry.set(agentId, info);
    totalAgentCount++;
    return info;
}
/**
 * Get timestamp in microseconds relative to trace start
 */
function getTimestamp() {
    return (Date.now() - startTimeMs) * 1000;
}
/**
 * Generate a unique span ID
 */
function generateSpanId() {
    return "span_".concat(++spanIdCounter);
}
/**
 * Evict pending spans older than STALE_SPAN_TTL_MS.
 * Mirrors the TTL cleanup pattern in sessionTracing.ts.
 */
function evictStaleSpans() {
    var now = getTimestamp();
    var ttlUs = STALE_SPAN_TTL_MS * 1000; // Convert ms to microseconds
    for (var _i = 0, pendingSpans_1 = pendingSpans; _i < pendingSpans_1.length; _i++) {
        var _a = pendingSpans_1[_i], spanId = _a[0], span = _a[1];
        if (now - span.startTime > ttlUs) {
            // Emit an end event so the span shows up in the trace as incomplete
            events.push({
                name: span.name,
                cat: span.category,
                ph: 'E',
                ts: now,
                pid: span.agentInfo.processId,
                tid: span.agentInfo.threadId,
                args: __assign(__assign({}, span.args), { evicted: true, duration_ms: (now - span.startTime) / 1000 }),
            });
            pendingSpans.delete(spanId);
        }
    }
}
/**
 * Build the full trace document (Chrome Trace JSON format).
 */
function buildTraceDocument() {
    return (0, slowOperations_js_1.jsonStringify)({
        traceEvents: __spreadArray(__spreadArray([], metadataEvents, true), events, true),
        metadata: {
            session_id: (0, state_js_1.getSessionId)(),
            trace_start_time: new Date(startTimeMs).toISOString(),
            agent_count: totalAgentCount,
            total_event_count: metadataEvents.length + events.length,
        },
    });
}
/**
 * Drop the oldest half of events[] when over MAX_EVENTS. Called from the
 * stale-span cleanup interval (60s). The half-batch splice keeps this
 * amortized O(1) — we don't pay splice cost per-push. A synthetic marker
 * is inserted so the gap is visible in ui.perfetto.dev.
 */
function evictOldestEvents() {
    var _a, _b;
    if (events.length < MAX_EVENTS)
        return;
    var dropped = events.splice(0, MAX_EVENTS / 2);
    events.unshift({
        name: 'trace_truncated',
        cat: '__metadata',
        ph: 'i',
        ts: (_b = (_a = dropped[dropped.length - 1]) === null || _a === void 0 ? void 0 : _a.ts) !== null && _b !== void 0 ? _b : 0,
        pid: 1,
        tid: 0,
        args: { dropped_events: dropped.length },
    });
    (0, debug_js_1.logForDebugging)("[Perfetto] Evicted ".concat(dropped.length, " oldest events (cap ").concat(MAX_EVENTS, ")"));
}
/**
 * Initialize Perfetto tracing
 * Call this early in the application lifecycle
 */
function initializePerfettoTracing() {
    var _this = this;
    var _a;
    var envValue = process.env.CLAUDE_CODE_PERFETTO_TRACE;
    (0, debug_js_1.logForDebugging)("[Perfetto] initializePerfettoTracing called, env value: ".concat(envValue));
    // Wrap in feature() for dead code elimination - entire block removed from external builds
    if ((0, bun_bundle_1.feature)('PERFETTO_TRACING')) {
        if (!envValue || (0, envUtils_js_1.isEnvDefinedFalsy)(envValue)) {
            (0, debug_js_1.logForDebugging)('[Perfetto] Tracing disabled (env var not set or disabled)');
            return;
        }
        isEnabled = true;
        startTimeMs = Date.now();
        // Determine trace file path
        if ((0, envUtils_js_1.isEnvTruthy)(envValue)) {
            var tracesDir = (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), 'traces');
            tracePath = (0, path_1.join)(tracesDir, "trace-".concat((0, state_js_1.getSessionId)(), ".json"));
        }
        else {
            // Use the provided path
            tracePath = envValue;
        }
        (0, debug_js_1.logForDebugging)("[Perfetto] Tracing enabled, will write to: ".concat(tracePath, ", isEnabled=").concat(isEnabled));
        // Start periodic full-trace write if CLAUDE_CODE_PERFETTO_WRITE_INTERVAL_S is a positive integer
        var intervalSec = parseInt((_a = process.env.CLAUDE_CODE_PERFETTO_WRITE_INTERVAL_S) !== null && _a !== void 0 ? _a : '', 10);
        if (intervalSec > 0) {
            writeIntervalId = setInterval(function () {
                void periodicWrite();
            }, intervalSec * 1000);
            // Don't let the interval keep the process alive on its own
            if (writeIntervalId.unref)
                writeIntervalId.unref();
            (0, debug_js_1.logForDebugging)("[Perfetto] Periodic write enabled, interval: ".concat(intervalSec, "s"));
        }
        // Start stale span cleanup interval
        staleSpanCleanupId = setInterval(function () {
            evictStaleSpans();
            evictOldestEvents();
        }, STALE_SPAN_CLEANUP_INTERVAL_MS);
        if (staleSpanCleanupId.unref)
            staleSpanCleanupId.unref();
        // Register cleanup to write final trace on exit
        (0, cleanupRegistry_js_1.registerCleanup)(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, debug_js_1.logForDebugging)('[Perfetto] Cleanup callback invoked');
                        return [4 /*yield*/, writePerfettoTrace()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        // Also register a beforeExit handler as a fallback
        // This ensures the trace is written even if cleanup registry is not called
        process.on('beforeExit', function () {
            (0, debug_js_1.logForDebugging)('[Perfetto] beforeExit handler invoked');
            void writePerfettoTrace();
        });
        // Register a synchronous exit handler as a last resort
        // This is the final fallback to ensure trace is written before process exits
        process.on('exit', function () {
            if (!traceWritten) {
                (0, debug_js_1.logForDebugging)('[Perfetto] exit handler invoked, writing trace synchronously');
                writePerfettoTraceSync();
            }
        });
        // Emit process metadata events for main process
        var mainAgent = getCurrentAgentInfo();
        emitProcessMetadata(mainAgent);
    }
}
/**
 * Emit metadata events for a process/agent
 */
function emitProcessMetadata(agentInfo) {
    if (!isEnabled)
        return;
    // Process name
    metadataEvents.push({
        name: 'process_name',
        cat: '__metadata',
        ph: 'M',
        ts: 0,
        pid: agentInfo.processId,
        tid: 0,
        args: { name: agentInfo.agentName },
    });
    // Thread name (same as process for now)
    metadataEvents.push({
        name: 'thread_name',
        cat: '__metadata',
        ph: 'M',
        ts: 0,
        pid: agentInfo.processId,
        tid: agentInfo.threadId,
        args: { name: agentInfo.agentName },
    });
    // Add parent info if available
    if (agentInfo.parentAgentId) {
        metadataEvents.push({
            name: 'parent_agent',
            cat: '__metadata',
            ph: 'M',
            ts: 0,
            pid: agentInfo.processId,
            tid: 0,
            args: {
                parent_agent_id: agentInfo.parentAgentId,
            },
        });
    }
}
/**
 * Check if Perfetto tracing is enabled
 */
function isPerfettoTracingEnabled() {
    return isEnabled;
}
/**
 * Register a new agent in the trace
 * Call this when a subagent/teammate is spawned
 */
function registerAgent(agentId, agentName, parentAgentId) {
    if (!isEnabled)
        return;
    var info = {
        agentId: agentId,
        agentName: agentName,
        parentAgentId: parentAgentId,
        processId: getProcessIdForAgent(agentId),
        threadId: stringToNumericHash(agentName),
    };
    agentRegistry.set(agentId, info);
    totalAgentCount++;
    emitProcessMetadata(info);
}
/**
 * Unregister an agent from the trace.
 * Call this when an agent completes, fails, or is aborted to free memory.
 */
function unregisterAgent(agentId) {
    if (!isEnabled)
        return;
    agentRegistry.delete(agentId);
    agentIdToProcessId.delete(agentId);
}
/**
 * Start an API call span
 */
function startLLMRequestPerfettoSpan(args) {
    var _a;
    if (!isEnabled)
        return '';
    var spanId = generateSpanId();
    var agentInfo = getCurrentAgentInfo();
    pendingSpans.set(spanId, {
        name: 'API Call',
        category: 'api',
        startTime: getTimestamp(),
        agentInfo: agentInfo,
        args: {
            model: args.model,
            prompt_tokens: args.promptTokens,
            message_id: args.messageId,
            is_speculative: (_a = args.isSpeculative) !== null && _a !== void 0 ? _a : false,
            query_source: args.querySource,
        },
    });
    // Emit begin event
    events.push({
        name: 'API Call',
        cat: 'api',
        ph: 'B',
        ts: pendingSpans.get(spanId).startTime,
        pid: agentInfo.processId,
        tid: agentInfo.threadId,
        args: pendingSpans.get(spanId).args,
    });
    return spanId;
}
/**
 * End an API call span with response metadata
 */
function endLLMRequestPerfettoSpan(spanId, metadata) {
    var _a, _b, _c, _d;
    if (!isEnabled || !spanId)
        return;
    var pending = pendingSpans.get(spanId);
    if (!pending)
        return;
    var endTime = getTimestamp();
    var duration = endTime - pending.startTime;
    var promptTokens = (_a = metadata.promptTokens) !== null && _a !== void 0 ? _a : pending.args.prompt_tokens;
    var ttftMs = metadata.ttftMs;
    var ttltMs = metadata.ttltMs;
    var outputTokens = metadata.outputTokens;
    var cacheReadTokens = metadata.cacheReadTokens;
    // Compute derived metrics
    // ITPS: input tokens per second (prompt processing speed)
    var itps = ttftMs !== undefined && promptTokens !== undefined && ttftMs > 0
        ? Math.round((promptTokens / (ttftMs / 1000)) * 100) / 100
        : undefined;
    // OTPS: output tokens per second (sampling speed)
    var samplingMs = ttltMs !== undefined && ttftMs !== undefined ? ttltMs - ttftMs : undefined;
    var otps = samplingMs !== undefined && outputTokens !== undefined && samplingMs > 0
        ? Math.round((outputTokens / (samplingMs / 1000)) * 100) / 100
        : undefined;
    // Cache hit rate: percentage of prompt tokens from cache
    var cacheHitRate = cacheReadTokens !== undefined &&
        promptTokens !== undefined &&
        promptTokens > 0
        ? Math.round((cacheReadTokens / promptTokens) * 10000) / 100
        : undefined;
    var requestSetupMs = metadata.requestSetupMs;
    var attemptStartTimes = metadata.attemptStartTimes;
    // Merge metadata with original args
    var args = __assign(__assign({}, pending.args), { ttft_ms: ttftMs, ttlt_ms: ttltMs, prompt_tokens: promptTokens, output_tokens: outputTokens, cache_read_tokens: cacheReadTokens, cache_creation_tokens: metadata.cacheCreationTokens, message_id: (_b = metadata.messageId) !== null && _b !== void 0 ? _b : pending.args.message_id, success: (_c = metadata.success) !== null && _c !== void 0 ? _c : true, error: metadata.error, duration_ms: duration / 1000, request_setup_ms: requestSetupMs, 
        // Derived metrics
        itps: itps, otps: otps, cache_hit_rate_pct: cacheHitRate });
    // Emit Request Setup sub-span when there was measurable setup time
    // (client creation, param building, retries before the successful attempt)
    var setupUs = requestSetupMs !== undefined && requestSetupMs > 0
        ? requestSetupMs * 1000
        : 0;
    if (setupUs > 0) {
        var setupEndTs = pending.startTime + setupUs;
        events.push({
            name: 'Request Setup',
            cat: 'api,setup',
            ph: 'B',
            ts: pending.startTime,
            pid: pending.agentInfo.processId,
            tid: pending.agentInfo.threadId,
            args: {
                request_setup_ms: requestSetupMs,
                attempt_count: (_d = attemptStartTimes === null || attemptStartTimes === void 0 ? void 0 : attemptStartTimes.length) !== null && _d !== void 0 ? _d : 1,
            },
        });
        // Emit retry attempt sub-spans within Request Setup.
        // Each failed attempt runs from its start to the next attempt's start.
        if (attemptStartTimes && attemptStartTimes.length > 1) {
            // attemptStartTimes[0] is the reference point (first attempt).
            // Convert wall-clock deltas into Perfetto-relative microseconds.
            var baseWallMs = attemptStartTimes[0];
            for (var i = 0; i < attemptStartTimes.length - 1; i++) {
                var attemptStartUs = pending.startTime + (attemptStartTimes[i] - baseWallMs) * 1000;
                var attemptEndUs = pending.startTime + (attemptStartTimes[i + 1] - baseWallMs) * 1000;
                events.push({
                    name: "Attempt ".concat(i + 1, " (retry)"),
                    cat: 'api,retry',
                    ph: 'B',
                    ts: attemptStartUs,
                    pid: pending.agentInfo.processId,
                    tid: pending.agentInfo.threadId,
                    args: { attempt: i + 1 },
                });
                events.push({
                    name: "Attempt ".concat(i + 1, " (retry)"),
                    cat: 'api,retry',
                    ph: 'E',
                    ts: attemptEndUs,
                    pid: pending.agentInfo.processId,
                    tid: pending.agentInfo.threadId,
                });
            }
        }
        events.push({
            name: 'Request Setup',
            cat: 'api,setup',
            ph: 'E',
            ts: setupEndTs,
            pid: pending.agentInfo.processId,
            tid: pending.agentInfo.threadId,
        });
    }
    // Emit sub-spans for First Token and Sampling phases (before API Call end)
    // Using B/E pairs in proper nesting order for correct Perfetto visualization
    if (ttftMs !== undefined) {
        // First Token starts after request setup (if any)
        var firstTokenStartTs = pending.startTime + setupUs;
        var firstTokenEndTs = firstTokenStartTs + ttftMs * 1000;
        // First Token phase: from successful attempt start to first token
        events.push({
            name: 'First Token',
            cat: 'api,ttft',
            ph: 'B',
            ts: firstTokenStartTs,
            pid: pending.agentInfo.processId,
            tid: pending.agentInfo.threadId,
            args: {
                ttft_ms: ttftMs,
                prompt_tokens: promptTokens,
                itps: itps,
                cache_hit_rate_pct: cacheHitRate,
            },
        });
        events.push({
            name: 'First Token',
            cat: 'api,ttft',
            ph: 'E',
            ts: firstTokenEndTs,
            pid: pending.agentInfo.processId,
            tid: pending.agentInfo.threadId,
        });
        // Sampling phase: from first token to last token
        // Note: samplingMs = ttltMs - ttftMs still includes setup time in ttltMs,
        // so we compute the actual sampling duration for the span as the time from
        // first token to API call end (endTime), not samplingMs directly.
        var actualSamplingMs = ttltMs !== undefined ? ttltMs - ttftMs - setupUs / 1000 : undefined;
        if (actualSamplingMs !== undefined && actualSamplingMs > 0) {
            events.push({
                name: 'Sampling',
                cat: 'api,sampling',
                ph: 'B',
                ts: firstTokenEndTs,
                pid: pending.agentInfo.processId,
                tid: pending.agentInfo.threadId,
                args: {
                    sampling_ms: actualSamplingMs,
                    output_tokens: outputTokens,
                    otps: otps,
                },
            });
            events.push({
                name: 'Sampling',
                cat: 'api,sampling',
                ph: 'E',
                ts: firstTokenEndTs + actualSamplingMs * 1000,
                pid: pending.agentInfo.processId,
                tid: pending.agentInfo.threadId,
            });
        }
    }
    // Emit API Call end event (after sub-spans)
    events.push({
        name: pending.name,
        cat: pending.category,
        ph: 'E',
        ts: endTime,
        pid: pending.agentInfo.processId,
        tid: pending.agentInfo.threadId,
        args: args,
    });
    pendingSpans.delete(spanId);
}
/**
 * Start a tool execution span
 */
function startToolPerfettoSpan(toolName, args) {
    if (!isEnabled)
        return '';
    var spanId = generateSpanId();
    var agentInfo = getCurrentAgentInfo();
    pendingSpans.set(spanId, {
        name: "Tool: ".concat(toolName),
        category: 'tool',
        startTime: getTimestamp(),
        agentInfo: agentInfo,
        args: __assign({ tool_name: toolName }, args),
    });
    // Emit begin event
    events.push({
        name: "Tool: ".concat(toolName),
        cat: 'tool',
        ph: 'B',
        ts: pendingSpans.get(spanId).startTime,
        pid: agentInfo.processId,
        tid: agentInfo.threadId,
        args: pendingSpans.get(spanId).args,
    });
    return spanId;
}
/**
 * End a tool execution span
 */
function endToolPerfettoSpan(spanId, metadata) {
    var _a;
    if (!isEnabled || !spanId)
        return;
    var pending = pendingSpans.get(spanId);
    if (!pending)
        return;
    var endTime = getTimestamp();
    var duration = endTime - pending.startTime;
    var args = __assign(__assign({}, pending.args), { success: (_a = metadata === null || metadata === void 0 ? void 0 : metadata.success) !== null && _a !== void 0 ? _a : true, error: metadata === null || metadata === void 0 ? void 0 : metadata.error, result_tokens: metadata === null || metadata === void 0 ? void 0 : metadata.resultTokens, duration_ms: duration / 1000 });
    // Emit end event
    events.push({
        name: pending.name,
        cat: pending.category,
        ph: 'E',
        ts: endTime,
        pid: pending.agentInfo.processId,
        tid: pending.agentInfo.threadId,
        args: args,
    });
    pendingSpans.delete(spanId);
}
/**
 * Start a user input waiting span
 */
function startUserInputPerfettoSpan(context) {
    if (!isEnabled)
        return '';
    var spanId = generateSpanId();
    var agentInfo = getCurrentAgentInfo();
    pendingSpans.set(spanId, {
        name: 'Waiting for User Input',
        category: 'user_input',
        startTime: getTimestamp(),
        agentInfo: agentInfo,
        args: {
            context: context,
        },
    });
    // Emit begin event
    events.push({
        name: 'Waiting for User Input',
        cat: 'user_input',
        ph: 'B',
        ts: pendingSpans.get(spanId).startTime,
        pid: agentInfo.processId,
        tid: agentInfo.threadId,
        args: pendingSpans.get(spanId).args,
    });
    return spanId;
}
/**
 * End a user input waiting span
 */
function endUserInputPerfettoSpan(spanId, metadata) {
    if (!isEnabled || !spanId)
        return;
    var pending = pendingSpans.get(spanId);
    if (!pending)
        return;
    var endTime = getTimestamp();
    var duration = endTime - pending.startTime;
    var args = __assign(__assign({}, pending.args), { decision: metadata === null || metadata === void 0 ? void 0 : metadata.decision, source: metadata === null || metadata === void 0 ? void 0 : metadata.source, duration_ms: duration / 1000 });
    // Emit end event
    events.push({
        name: pending.name,
        cat: pending.category,
        ph: 'E',
        ts: endTime,
        pid: pending.agentInfo.processId,
        tid: pending.agentInfo.threadId,
        args: args,
    });
    pendingSpans.delete(spanId);
}
/**
 * Emit an instant event (marker)
 */
function emitPerfettoInstant(name, category, args) {
    if (!isEnabled)
        return;
    var agentInfo = getCurrentAgentInfo();
    events.push({
        name: name,
        cat: category,
        ph: 'i',
        ts: getTimestamp(),
        pid: agentInfo.processId,
        tid: agentInfo.threadId,
        args: args,
    });
}
/**
 * Emit a counter event for tracking metrics over time
 */
function emitPerfettoCounter(name, values) {
    if (!isEnabled)
        return;
    var agentInfo = getCurrentAgentInfo();
    events.push({
        name: name,
        cat: 'counter',
        ph: 'C',
        ts: getTimestamp(),
        pid: agentInfo.processId,
        tid: agentInfo.threadId,
        args: values,
    });
}
/**
 * Start an interaction span (wraps a full user request cycle)
 */
function startInteractionPerfettoSpan(userPrompt) {
    if (!isEnabled)
        return '';
    var spanId = generateSpanId();
    var agentInfo = getCurrentAgentInfo();
    pendingSpans.set(spanId, {
        name: 'Interaction',
        category: 'interaction',
        startTime: getTimestamp(),
        agentInfo: agentInfo,
        args: {
            user_prompt_length: userPrompt === null || userPrompt === void 0 ? void 0 : userPrompt.length,
        },
    });
    // Emit begin event
    events.push({
        name: 'Interaction',
        cat: 'interaction',
        ph: 'B',
        ts: pendingSpans.get(spanId).startTime,
        pid: agentInfo.processId,
        tid: agentInfo.threadId,
        args: pendingSpans.get(spanId).args,
    });
    return spanId;
}
/**
 * End an interaction span
 */
function endInteractionPerfettoSpan(spanId) {
    if (!isEnabled || !spanId)
        return;
    var pending = pendingSpans.get(spanId);
    if (!pending)
        return;
    var endTime = getTimestamp();
    var duration = endTime - pending.startTime;
    // Emit end event
    events.push({
        name: pending.name,
        cat: pending.category,
        ph: 'E',
        ts: endTime,
        pid: pending.agentInfo.processId,
        tid: pending.agentInfo.threadId,
        args: __assign(__assign({}, pending.args), { duration_ms: duration / 1000 }),
    });
    pendingSpans.delete(spanId);
}
// ---------------------------------------------------------------------------
// Periodic write helpers
// ---------------------------------------------------------------------------
/**
 * Stop the periodic write timer.
 */
function stopWriteInterval() {
    if (staleSpanCleanupId) {
        clearInterval(staleSpanCleanupId);
        staleSpanCleanupId = null;
    }
    if (writeIntervalId) {
        clearInterval(writeIntervalId);
        writeIntervalId = null;
    }
}
/**
 * Force-close any remaining open spans at session end.
 */
function closeOpenSpans() {
    for (var _i = 0, pendingSpans_2 = pendingSpans; _i < pendingSpans_2.length; _i++) {
        var _a = pendingSpans_2[_i], spanId = _a[0], pending = _a[1];
        var endTime = getTimestamp();
        events.push({
            name: pending.name,
            cat: pending.category,
            ph: 'E',
            ts: endTime,
            pid: pending.agentInfo.processId,
            tid: pending.agentInfo.threadId,
            args: __assign(__assign({}, pending.args), { incomplete: true, duration_ms: (endTime - pending.startTime) / 1000 }),
        });
        pendingSpans.delete(spanId);
    }
}
/**
 * Write the full trace to disk.  Errors are logged but swallowed so that a
 * transient I/O problem does not crash the session — the next periodic tick
 * (or the final exit write) will retry with a complete snapshot.
 */
function periodicWrite() {
    return __awaiter(this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!isEnabled || !tracePath || traceWritten)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, (0, promises_1.mkdir)((0, path_1.dirname)(tracePath), { recursive: true })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, promises_1.writeFile)(tracePath, buildTraceDocument())];
                case 3:
                    _a.sent();
                    (0, debug_js_1.logForDebugging)("[Perfetto] Periodic write: ".concat(events.length, " events to ").concat(tracePath));
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    (0, debug_js_1.logForDebugging)("[Perfetto] Periodic write failed: ".concat((0, errors_js_1.errorMessage)(error_1)), { level: 'error' });
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Final async write: close open spans and write the complete trace.
 * Idempotent — sets `traceWritten` on success so subsequent calls are no-ops.
 */
function writePerfettoTrace() {
    return __awaiter(this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!isEnabled || !tracePath || traceWritten) {
                        (0, debug_js_1.logForDebugging)("[Perfetto] Skipping final write: isEnabled=".concat(isEnabled, ", tracePath=").concat(tracePath, ", traceWritten=").concat(traceWritten));
                        return [2 /*return*/];
                    }
                    stopWriteInterval();
                    closeOpenSpans();
                    (0, debug_js_1.logForDebugging)("[Perfetto] writePerfettoTrace called: events=".concat(events.length));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, (0, promises_1.mkdir)((0, path_1.dirname)(tracePath), { recursive: true })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, promises_1.writeFile)(tracePath, buildTraceDocument())];
                case 3:
                    _a.sent();
                    traceWritten = true;
                    (0, debug_js_1.logForDebugging)("[Perfetto] Trace finalized at: ".concat(tracePath));
                    return [3 /*break*/, 5];
                case 4:
                    error_2 = _a.sent();
                    (0, debug_js_1.logForDebugging)("[Perfetto] Failed to write final trace: ".concat((0, errors_js_1.errorMessage)(error_2)), { level: 'error' });
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Final synchronous write (fallback for process 'exit' handler where async is forbidden).
 */
function writePerfettoTraceSync() {
    if (!isEnabled || !tracePath || traceWritten) {
        (0, debug_js_1.logForDebugging)("[Perfetto] Skipping final sync write: isEnabled=".concat(isEnabled, ", tracePath=").concat(tracePath, ", traceWritten=").concat(traceWritten));
        return;
    }
    stopWriteInterval();
    closeOpenSpans();
    (0, debug_js_1.logForDebugging)("[Perfetto] writePerfettoTraceSync called: events=".concat(events.length));
    try {
        var dir = (0, path_1.dirname)(tracePath);
        // eslint-disable-next-line custom-rules/no-sync-fs -- Only called from process.on('exit') handler
        (0, fs_1.mkdirSync)(dir, { recursive: true });
        // eslint-disable-next-line custom-rules/no-sync-fs, eslint-plugin-n/no-sync -- Required for process 'exit' handler which doesn't support async
        (0, fs_1.writeFileSync)(tracePath, buildTraceDocument());
        traceWritten = true;
        (0, debug_js_1.logForDebugging)("[Perfetto] Trace finalized synchronously at: ".concat(tracePath));
    }
    catch (error) {
        (0, debug_js_1.logForDebugging)("[Perfetto] Failed to write final trace synchronously: ".concat((0, errors_js_1.errorMessage)(error)), { level: 'error' });
    }
}
/**
 * Get all recorded events (for testing)
 */
function getPerfettoEvents() {
    return __spreadArray(__spreadArray([], metadataEvents, true), events, true);
}
/**
 * Reset the tracer state (for testing)
 */
function resetPerfettoTracer() {
    if (staleSpanCleanupId) {
        clearInterval(staleSpanCleanupId);
        staleSpanCleanupId = null;
    }
    stopWriteInterval();
    metadataEvents.length = 0;
    events.length = 0;
    pendingSpans.clear();
    agentRegistry.clear();
    agentIdToProcessId.clear();
    totalAgentCount = 0;
    processIdCounter = 1;
    spanIdCounter = 0;
    isEnabled = false;
    tracePath = null;
    startTimeMs = 0;
    traceWritten = false;
}
/**
 * Trigger a periodic write immediately (for testing)
 */
function triggerPeriodicWriteForTesting() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, periodicWrite()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Evict stale spans immediately (for testing)
 */
function evictStaleSpansForTesting() {
    evictStaleSpans();
}
exports.MAX_EVENTS_FOR_TESTING = MAX_EVENTS;
function evictOldestEventsForTesting() {
    evictOldestEvents();
}
