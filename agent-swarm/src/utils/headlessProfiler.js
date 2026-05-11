"use strict";
/**
 * Headless mode profiling utility for measuring per-turn latency in -p (print) mode.
 *
 * Tracks key timing phases per turn:
 * - Time to system message output (turn 0 only)
 * - Time to first query started
 * - Time to first API response (TTFT)
 *
 * Uses Node.js built-in performance hooks API for standard timing measurement.
 * Sampled logging: 100% of ant users, 5% of external users.
 *
 * Set CLAUDE_CODE_PROFILE_STARTUP=1 for detailed logging output.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.headlessProfilerStartTurn = headlessProfilerStartTurn;
exports.headlessProfilerCheckpoint = headlessProfilerCheckpoint;
exports.logHeadlessProfilerTurn = logHeadlessProfilerTurn;
var state_js_1 = require("../bootstrap/state.js");
var index_js_1 = require("../services/analytics/index.js");
var debug_js_1 = require("./debug.js");
var envUtils_js_1 = require("./envUtils.js");
var profilerBase_js_1 = require("./profilerBase.js");
var slowOperations_js_1 = require("./slowOperations.js");
// Detailed profiling mode - same env var as startupProfiler
// eslint-disable-next-line custom-rules/no-process-env-top-level
var DETAILED_PROFILING = (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_PROFILE_STARTUP);
// Sampling for Statsig logging: 100% ant, 5% external
// Decision made once at module load - non-sampled users pay no profiling cost
var STATSIG_SAMPLE_RATE = 0.05;
// eslint-disable-next-line custom-rules/no-process-env-top-level
var STATSIG_LOGGING_SAMPLED = process.env.USER_TYPE === 'ant' || Math.random() < STATSIG_SAMPLE_RATE;
// Enable profiling if either detailed mode OR sampled for Statsig
var SHOULD_PROFILE = DETAILED_PROFILING || STATSIG_LOGGING_SAMPLED;
// Use a unique prefix to avoid conflicts with other profiler marks
var MARK_PREFIX = 'headless_';
// Track current turn number (auto-incremented by headlessProfilerStartTurn)
var currentTurnNumber = -1;
/**
 * Clear all headless profiler marks from performance timeline
 */
function clearHeadlessMarks() {
    var perf = (0, profilerBase_js_1.getPerformance)();
    var allMarks = perf.getEntriesByType('mark');
    for (var _i = 0, allMarks_1 = allMarks; _i < allMarks_1.length; _i++) {
        var mark = allMarks_1[_i];
        if (mark.name.startsWith(MARK_PREFIX)) {
            perf.clearMarks(mark.name);
        }
    }
}
/**
 * Start a new turn for profiling. Clears previous marks, increments turn number,
 * and records turn_start. Call this at the beginning of each user message processing.
 */
function headlessProfilerStartTurn() {
    // Only profile in headless/non-interactive mode
    if (!(0, state_js_1.getIsNonInteractiveSession)())
        return;
    // Only profile if enabled
    if (!SHOULD_PROFILE)
        return;
    currentTurnNumber++;
    clearHeadlessMarks();
    var perf = (0, profilerBase_js_1.getPerformance)();
    perf.mark("".concat(MARK_PREFIX, "turn_start"));
    if (DETAILED_PROFILING) {
        (0, debug_js_1.logForDebugging)("[headlessProfiler] Started turn ".concat(currentTurnNumber));
    }
}
/**
 * Record a checkpoint with the given name.
 * Only records if in headless mode and profiling is enabled.
 */
function headlessProfilerCheckpoint(name) {
    // Only profile in headless/non-interactive mode
    if (!(0, state_js_1.getIsNonInteractiveSession)())
        return;
    // Only profile if enabled
    if (!SHOULD_PROFILE)
        return;
    var perf = (0, profilerBase_js_1.getPerformance)();
    perf.mark("".concat(MARK_PREFIX).concat(name));
    if (DETAILED_PROFILING) {
        (0, debug_js_1.logForDebugging)("[headlessProfiler] Checkpoint: ".concat(name, " at ").concat(perf.now().toFixed(1), "ms"));
    }
}
/**
 * Log headless latency metrics for the current turn to Statsig.
 * Call this at the end of each turn (before processing next user message).
 */
function logHeadlessProfilerTurn() {
    // Only log in headless mode
    if (!(0, state_js_1.getIsNonInteractiveSession)())
        return;
    // Only log if enabled
    if (!SHOULD_PROFILE)
        return;
    var perf = (0, profilerBase_js_1.getPerformance)();
    var allMarks = perf.getEntriesByType('mark');
    // Filter to only our headless marks
    var marks = allMarks.filter(function (mark) { return mark.name.startsWith(MARK_PREFIX); });
    if (marks.length === 0)
        return;
    // Build checkpoint lookup (strip prefix for easier access)
    var checkpointTimes = new Map();
    for (var _i = 0, marks_1 = marks; _i < marks_1.length; _i++) {
        var mark = marks_1[_i];
        var name_1 = mark.name.slice(MARK_PREFIX.length);
        checkpointTimes.set(name_1, mark.startTime);
    }
    var turnStart = checkpointTimes.get('turn_start');
    if (turnStart === undefined)
        return;
    // Compute phase durations relative to turn_start
    var metadata = {
        turn_number: currentTurnNumber,
    };
    // Time to system message from process start (only meaningful for turn 0)
    // Use absolute time since perf_hooks startTime is relative to process start
    var systemMessageTime = checkpointTimes.get('system_message_yielded');
    if (systemMessageTime !== undefined && currentTurnNumber === 0) {
        metadata.time_to_system_message_ms = Math.round(systemMessageTime);
    }
    // Time to query start
    var queryStartTime = checkpointTimes.get('query_started');
    if (queryStartTime !== undefined) {
        metadata.time_to_query_start_ms = Math.round(queryStartTime - turnStart);
    }
    // Time to first response (first chunk from API)
    var firstChunkTime = checkpointTimes.get('first_chunk');
    if (firstChunkTime !== undefined) {
        metadata.time_to_first_response_ms = Math.round(firstChunkTime - turnStart);
    }
    // Query overhead (time between query start and API request sent)
    var apiRequestTime = checkpointTimes.get('api_request_sent');
    if (queryStartTime !== undefined && apiRequestTime !== undefined) {
        metadata.query_overhead_ms = Math.round(apiRequestTime - queryStartTime);
    }
    // Add checkpoint count for debugging
    metadata.checkpoint_count = marks.length;
    // Add entrypoint for segmentation (sdk-ts, sdk-py, sdk-cli, or undefined)
    if (process.env.CLAUDE_CODE_ENTRYPOINT) {
        metadata.entrypoint = process.env.CLAUDE_CODE_ENTRYPOINT;
    }
    // Log to Statsig if sampled
    if (STATSIG_LOGGING_SAMPLED) {
        (0, index_js_1.logEvent)('tengu_headless_latency', metadata);
    }
    // Log detailed output if CLAUDE_CODE_PROFILE_STARTUP=1
    if (DETAILED_PROFILING) {
        (0, debug_js_1.logForDebugging)("[headlessProfiler] Turn ".concat(currentTurnNumber, " metrics: ").concat((0, slowOperations_js_1.jsonStringify)(metadata)));
    }
}
