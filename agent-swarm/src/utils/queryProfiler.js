"use strict";
/**
 * Query profiling utility for measuring and reporting time spent in the query
 * pipeline from user input to first token arrival. Enable by setting CLAUDE_CODE_PROFILE_QUERY=1
 *
 * Uses Node.js built-in performance hooks API for standard timing measurement.
 * Tracks each query session with detailed checkpoints for identifying bottlenecks.
 *
 * Checkpoints tracked (in order):
 * - query_user_input_received: Start of profiling
 * - query_context_loading_start/end: Loading system prompts and contexts
 * - query_query_start: Entry to query call from REPL
 * - query_fn_entry: Entry to query() function
 * - query_microcompact_start/end: Microcompaction of messages
 * - query_autocompact_start/end: Autocompaction check
 * - query_setup_start/end: StreamingToolExecutor and model setup
 * - query_api_loop_start: Start of API retry loop
 * - query_api_streaming_start: Start of streaming API call
 * - query_tool_schema_build_start/end: Building tool schemas
 * - query_message_normalization_start/end: Normalizing messages
 * - query_client_creation_start/end: Creating Anthropic client
 * - query_api_request_sent: HTTP request dispatched (before await, inside retry body)
 * - query_response_headers_received: .withResponse() resolved (headers arrived)
 * - query_first_chunk_received: First streaming chunk received (TTFT)
 * - query_api_streaming_end: Streaming complete
 * - query_tool_execution_start/end: Tool execution
 * - query_recursive_call: Before recursive query call
 * - query_end: End of query
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.startQueryProfile = startQueryProfile;
exports.queryCheckpoint = queryCheckpoint;
exports.endQueryProfile = endQueryProfile;
exports.logQueryProfileReport = logQueryProfileReport;
var debug_js_1 = require("./debug.js");
var envUtils_js_1 = require("./envUtils.js");
var profilerBase_js_1 = require("./profilerBase.js");
// Module-level state - initialized once when the module loads
// eslint-disable-next-line custom-rules/no-process-env-top-level
var ENABLED = (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_PROFILE_QUERY);
// Track memory snapshots separately (perf_hooks doesn't track memory)
var memorySnapshots = new Map();
// Track query count for reporting
var queryCount = 0;
// Track first token received time separately for summary
var firstTokenTime = null;
/**
 * Start profiling a new query session
 */
function startQueryProfile() {
    if (!ENABLED)
        return;
    var perf = (0, profilerBase_js_1.getPerformance)();
    // Clear previous marks and memory snapshots
    perf.clearMarks();
    memorySnapshots.clear();
    firstTokenTime = null;
    queryCount++;
    // Record the start checkpoint
    queryCheckpoint('query_user_input_received');
}
/**
 * Record a checkpoint with the given name
 */
function queryCheckpoint(name) {
    var _a;
    if (!ENABLED)
        return;
    var perf = (0, profilerBase_js_1.getPerformance)();
    perf.mark(name);
    memorySnapshots.set(name, process.memoryUsage());
    // Track first token specially
    if (name === 'query_first_chunk_received' && firstTokenTime === null) {
        var marks = perf.getEntriesByType('mark');
        if (marks.length > 0) {
            var lastMark = marks[marks.length - 1];
            firstTokenTime = (_a = lastMark === null || lastMark === void 0 ? void 0 : lastMark.startTime) !== null && _a !== void 0 ? _a : 0;
        }
    }
}
/**
 * End the current query profiling session
 */
function endQueryProfile() {
    if (!ENABLED)
        return;
    queryCheckpoint('query_profile_end');
}
/**
 * Identify slow operations (> 100ms delta)
 */
function getSlowWarning(deltaMs, name) {
    // Don't flag the first checkpoint as slow - it measures time from process start,
    // not actual processing overhead
    if (name === 'query_user_input_received') {
        return '';
    }
    if (deltaMs > 1000) {
        return " \u26A0\uFE0F  VERY SLOW";
    }
    if (deltaMs > 100) {
        return " \u26A0\uFE0F  SLOW";
    }
    // Specific warnings for known bottlenecks
    if (name.includes('git_status') && deltaMs > 50) {
        return ' ⚠️  git status';
    }
    if (name.includes('tool_schema') && deltaMs > 50) {
        return ' ⚠️  tool schemas';
    }
    if (name.includes('client_creation') && deltaMs > 50) {
        return ' ⚠️  client creation';
    }
    return '';
}
/**
 * Get a formatted report of all checkpoints for the current/last query
 */
function getQueryProfileReport() {
    var _a, _b;
    if (!ENABLED) {
        return 'Query profiling not enabled (set CLAUDE_CODE_PROFILE_QUERY=1)';
    }
    var perf = (0, profilerBase_js_1.getPerformance)();
    var marks = perf.getEntriesByType('mark');
    if (marks.length === 0) {
        return 'No query profiling checkpoints recorded';
    }
    var lines = [];
    lines.push('='.repeat(80));
    lines.push("QUERY PROFILING REPORT - Query #".concat(queryCount));
    lines.push('='.repeat(80));
    lines.push('');
    // Use first mark as baseline (query start time) to show relative times
    var baselineTime = (_b = (_a = marks[0]) === null || _a === void 0 ? void 0 : _a.startTime) !== null && _b !== void 0 ? _b : 0;
    var prevTime = baselineTime;
    var apiRequestSentTime = 0;
    var firstChunkTime = 0;
    for (var _i = 0, marks_1 = marks; _i < marks_1.length; _i++) {
        var mark = marks_1[_i];
        var relativeTime = mark.startTime - baselineTime;
        var deltaMs = mark.startTime - prevTime;
        lines.push((0, profilerBase_js_1.formatTimelineLine)(relativeTime, deltaMs, mark.name, memorySnapshots.get(mark.name), 10, 9, getSlowWarning(deltaMs, mark.name)));
        // Track key milestones for summary (use relative times)
        if (mark.name === 'query_api_request_sent') {
            apiRequestSentTime = relativeTime;
        }
        if (mark.name === 'query_first_chunk_received') {
            firstChunkTime = relativeTime;
        }
        prevTime = mark.startTime;
    }
    // Calculate summary statistics (relative to baseline)
    var lastMark = marks[marks.length - 1];
    var totalTime = lastMark ? lastMark.startTime - baselineTime : 0;
    lines.push('');
    lines.push('-'.repeat(80));
    if (firstChunkTime > 0) {
        var preRequestOverhead = apiRequestSentTime;
        var networkLatency = firstChunkTime - apiRequestSentTime;
        var preRequestPercent = ((preRequestOverhead / firstChunkTime) *
            100).toFixed(1);
        var networkPercent = ((networkLatency / firstChunkTime) * 100).toFixed(1);
        lines.push("Total TTFT: ".concat((0, profilerBase_js_1.formatMs)(firstChunkTime), "ms"));
        lines.push("  - Pre-request overhead: ".concat((0, profilerBase_js_1.formatMs)(preRequestOverhead), "ms (").concat(preRequestPercent, "%)"));
        lines.push("  - Network latency: ".concat((0, profilerBase_js_1.formatMs)(networkLatency), "ms (").concat(networkPercent, "%)"));
    }
    else {
        lines.push("Total time: ".concat((0, profilerBase_js_1.formatMs)(totalTime), "ms"));
    }
    // Add phase summary
    lines.push(getPhaseSummary(marks, baselineTime));
    lines.push('='.repeat(80));
    return lines.join('\n');
}
/**
 * Get phase-based summary showing time spent in each major phase
 */
function getPhaseSummary(marks, baselineTime) {
    var phases = [
        {
            name: 'Context loading',
            start: 'query_context_loading_start',
            end: 'query_context_loading_end',
        },
        {
            name: 'Microcompact',
            start: 'query_microcompact_start',
            end: 'query_microcompact_end',
        },
        {
            name: 'Autocompact',
            start: 'query_autocompact_start',
            end: 'query_autocompact_end',
        },
        { name: 'Query setup', start: 'query_setup_start', end: 'query_setup_end' },
        {
            name: 'Tool schemas',
            start: 'query_tool_schema_build_start',
            end: 'query_tool_schema_build_end',
        },
        {
            name: 'Message normalization',
            start: 'query_message_normalization_start',
            end: 'query_message_normalization_end',
        },
        {
            name: 'Client creation',
            start: 'query_client_creation_start',
            end: 'query_client_creation_end',
        },
        {
            name: 'Network TTFB',
            start: 'query_api_request_sent',
            end: 'query_first_chunk_received',
        },
        {
            name: 'Tool execution',
            start: 'query_tool_execution_start',
            end: 'query_tool_execution_end',
        },
    ];
    var markMap = new Map(marks.map(function (m) { return [m.name, m.startTime - baselineTime]; }));
    var lines = [];
    lines.push('');
    lines.push('PHASE BREAKDOWN:');
    for (var _i = 0, phases_1 = phases; _i < phases_1.length; _i++) {
        var phase = phases_1[_i];
        var startTime = markMap.get(phase.start);
        var endTime = markMap.get(phase.end);
        if (startTime !== undefined && endTime !== undefined) {
            var duration = endTime - startTime;
            var bar = '█'.repeat(Math.min(Math.ceil(duration / 10), 50)); // 1 block per 10ms, max 50
            lines.push("  ".concat(phase.name.padEnd(22), " ").concat((0, profilerBase_js_1.formatMs)(duration).padStart(10), "ms ").concat(bar));
        }
    }
    // Calculate pre-API overhead (everything before api_request_sent)
    var apiRequestSent = markMap.get('query_api_request_sent');
    if (apiRequestSent !== undefined) {
        lines.push('');
        lines.push("  ".concat('Total pre-API overhead'.padEnd(22), " ").concat((0, profilerBase_js_1.formatMs)(apiRequestSent).padStart(10), "ms"));
    }
    return lines.join('\n');
}
/**
 * Log the query profile report to debug output
 */
function logQueryProfileReport() {
    if (!ENABLED)
        return;
    (0, debug_js_1.logForDebugging)(getQueryProfileReport());
}
