"use strict";
/**
 * Startup profiling utility for measuring and reporting time spent in various
 * initialization phases.
 *
 * Two modes:
 * 1. Sampled logging: 100% of ant users, 0.1% of external users - logs phases to Statsig
 * 2. Detailed profiling: CLAUDE_CODE_PROFILE_STARTUP=1 - full report with memory snapshots
 *
 * Uses Node.js built-in performance hooks API for standard timing measurement.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileCheckpoint = profileCheckpoint;
exports.profileReport = profileReport;
exports.isDetailedProfilingEnabled = isDetailedProfilingEnabled;
exports.getStartupPerfLogPath = getStartupPerfLogPath;
exports.logStartupPerf = logStartupPerf;
var path_1 = require("path");
var state_js_1 = require("src/bootstrap/state.js");
var index_js_1 = require("../services/analytics/index.js");
var debug_js_1 = require("./debug.js");
var envUtils_js_1 = require("./envUtils.js");
var fsOperations_js_1 = require("./fsOperations.js");
var profilerBase_js_1 = require("./profilerBase.js");
var slowOperations_js_1 = require("./slowOperations.js");
// Module-level state - decided once at module load
// eslint-disable-next-line custom-rules/no-process-env-top-level
var DETAILED_PROFILING = (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_PROFILE_STARTUP);
// Sampling for Statsig logging: 100% ant, 0.5% external
// Decision made once at startup - non-sampled users pay no profiling cost
var STATSIG_SAMPLE_RATE = 0.005;
// eslint-disable-next-line custom-rules/no-process-env-top-level
var STATSIG_LOGGING_SAMPLED = process.env.USER_TYPE === 'ant' || Math.random() < STATSIG_SAMPLE_RATE;
// Enable profiling if either detailed mode OR sampled for Statsig
var SHOULD_PROFILE = DETAILED_PROFILING || STATSIG_LOGGING_SAMPLED;
// Track memory snapshots separately (perf_hooks doesn't track memory).
// Only used when DETAILED_PROFILING is enabled.
// Stored as an array that appends in the same order as perf.mark() calls, so
// memorySnapshots[i] corresponds to getEntriesByType('mark')[i]. Using a Map
// keyed by checkpoint name is wrong because some checkpoints fire more than
// once (e.g. loadSettingsFromDisk_start fires during init and again after
// plugins reset the settings cache), and the second call would overwrite the
// first's memory snapshot.
var memorySnapshots = [];
// Phase definitions for Statsig logging: [startCheckpoint, endCheckpoint]
var PHASE_DEFINITIONS = {
    import_time: ['cli_entry', 'main_tsx_imports_loaded'],
    init_time: ['init_function_start', 'init_function_end'],
    settings_time: ['eagerLoadSettings_start', 'eagerLoadSettings_end'],
    total_time: ['cli_entry', 'main_after_run'],
};
// Record initial checkpoint if profiling is enabled
if (SHOULD_PROFILE) {
    // eslint-disable-next-line custom-rules/no-top-level-side-effects
    profileCheckpoint('profiler_initialized');
}
/**
 * Record a checkpoint with the given name
 */
function profileCheckpoint(name) {
    if (!SHOULD_PROFILE)
        return;
    var perf = (0, profilerBase_js_1.getPerformance)();
    perf.mark(name);
    // Only capture memory when detailed profiling enabled (env var)
    if (DETAILED_PROFILING) {
        memorySnapshots.push(process.memoryUsage());
    }
}
/**
 * Get a formatted report of all checkpoints
 * Only available when DETAILED_PROFILING is enabled
 */
function getReport() {
    var _a;
    if (!DETAILED_PROFILING) {
        return 'Startup profiling not enabled';
    }
    var perf = (0, profilerBase_js_1.getPerformance)();
    var marks = perf.getEntriesByType('mark');
    if (marks.length === 0) {
        return 'No profiling checkpoints recorded';
    }
    var lines = [];
    lines.push('='.repeat(80));
    lines.push('STARTUP PROFILING REPORT');
    lines.push('='.repeat(80));
    lines.push('');
    var prevTime = 0;
    for (var _i = 0, _b = marks.entries(); _i < _b.length; _i++) {
        var _c = _b[_i], i = _c[0], mark = _c[1];
        lines.push((0, profilerBase_js_1.formatTimelineLine)(mark.startTime, mark.startTime - prevTime, mark.name, memorySnapshots[i], 8, 7));
        prevTime = mark.startTime;
    }
    var lastMark = marks[marks.length - 1];
    lines.push('');
    lines.push("Total startup time: ".concat((0, profilerBase_js_1.formatMs)((_a = lastMark === null || lastMark === void 0 ? void 0 : lastMark.startTime) !== null && _a !== void 0 ? _a : 0), "ms"));
    lines.push('='.repeat(80));
    return lines.join('\n');
}
var reported = false;
function profileReport() {
    if (reported)
        return;
    reported = true;
    // Log to Statsig (sampled: 100% ant, 0.1% external)
    logStartupPerf();
    // Output detailed report if CLAUDE_CODE_PROFILE_STARTUP=1
    if (DETAILED_PROFILING) {
        // Write to file
        var path = getStartupPerfLogPath();
        var dir = (0, path_1.dirname)(path);
        var fs = (0, fsOperations_js_1.getFsImplementation)();
        fs.mkdirSync(dir);
        (0, slowOperations_js_1.writeFileSync_DEPRECATED)(path, getReport(), {
            encoding: 'utf8',
            flush: true,
        });
        (0, debug_js_1.logForDebugging)('Startup profiling report:');
        (0, debug_js_1.logForDebugging)(getReport());
    }
}
function isDetailedProfilingEnabled() {
    return DETAILED_PROFILING;
}
function getStartupPerfLogPath() {
    return (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), 'startup-perf', "".concat((0, state_js_1.getSessionId)(), ".txt"));
}
/**
 * Log startup performance phases to Statsig.
 * Only logs if this session was sampled at startup.
 */
function logStartupPerf() {
    // Only log if we were sampled (decision made at module load)
    if (!STATSIG_LOGGING_SAMPLED)
        return;
    var perf = (0, profilerBase_js_1.getPerformance)();
    var marks = perf.getEntriesByType('mark');
    if (marks.length === 0)
        return;
    // Build checkpoint lookup
    var checkpointTimes = new Map();
    for (var _i = 0, marks_1 = marks; _i < marks_1.length; _i++) {
        var mark = marks_1[_i];
        checkpointTimes.set(mark.name, mark.startTime);
    }
    // Compute phase durations
    var metadata = {};
    for (var _a = 0, _b = Object.entries(PHASE_DEFINITIONS); _a < _b.length; _a++) {
        var _c = _b[_a], phaseName = _c[0], _d = _c[1], startCheckpoint = _d[0], endCheckpoint = _d[1];
        var startTime = checkpointTimes.get(startCheckpoint);
        var endTime = checkpointTimes.get(endCheckpoint);
        if (startTime !== undefined && endTime !== undefined) {
            metadata["".concat(phaseName, "_ms")] = Math.round(endTime - startTime);
        }
    }
    // Add checkpoint count for debugging
    metadata.checkpoint_count = marks.length;
    (0, index_js_1.logEvent)('tengu_startup_perf', metadata);
}
