"use strict";
/**
 * Shared infrastructure for profiler modules (startupProfiler, queryProfiler,
 * headlessProfiler). All three use the same perf_hooks timeline and the same
 * line format for detailed reports.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPerformance = getPerformance;
exports.formatMs = formatMs;
exports.formatTimelineLine = formatTimelineLine;
var format_js_1 = require("./format.js");
// Lazy-load performance API only when profiling is enabled.
// Shared across all profilers — perf_hooks.performance is a process-wide singleton.
var performance = null;
function getPerformance() {
    if (!performance) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        performance = require('perf_hooks').performance;
    }
    return performance;
}
function formatMs(ms) {
    return ms.toFixed(3);
}
/**
 * Render a single timeline line in the shared profiler report format:
 *   [+  total.ms] (+  delta.ms) name [extra] [| RSS: .., Heap: ..]
 *
 * totalPad/deltaPad control the padStart width so callers can align columns
 * based on their expected magnitude (startup uses 8/7, query uses 10/9).
 */
function formatTimelineLine(totalMs, deltaMs, name, memory, totalPad, deltaPad, extra) {
    if (extra === void 0) { extra = ''; }
    var memInfo = memory
        ? " | RSS: ".concat((0, format_js_1.formatFileSize)(memory.rss), ", Heap: ").concat((0, format_js_1.formatFileSize)(memory.heapUsed))
        : '';
    return "[+".concat(formatMs(totalMs).padStart(totalPad), "ms] (+").concat(formatMs(deltaMs).padStart(deltaPad), "ms) ").concat(name).concat(extra).concat(memInfo);
}
