"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCombinedAbortSignal = createCombinedAbortSignal;
var abortController_js_1 = require("./abortController.js");
/**
 * Creates a combined AbortSignal that aborts when the input signal aborts,
 * an optional second signal aborts, or an optional timeout elapses.
 * Returns both the signal and a cleanup function that removes event listeners
 * and clears the internal timeout timer.
 *
 * Use `timeoutMs` instead of passing `AbortSignal.timeout(ms)` as a signal —
 * under Bun, `AbortSignal.timeout` timers are finalized lazily and accumulate
 * in native memory until they fire (measured ~2.4KB/call held for the full
 * timeout duration). This implementation uses `setTimeout` + `clearTimeout`
 * so the timer is freed immediately on cleanup.
 */
function createCombinedAbortSignal(signal, opts) {
    var _a;
    var _b = opts !== null && opts !== void 0 ? opts : {}, signalB = _b.signalB, timeoutMs = _b.timeoutMs;
    var combined = (0, abortController_js_1.createAbortController)();
    if ((signal === null || signal === void 0 ? void 0 : signal.aborted) || (signalB === null || signalB === void 0 ? void 0 : signalB.aborted)) {
        combined.abort();
        return { signal: combined.signal, cleanup: function () { } };
    }
    var timer;
    var abortCombined = function () {
        if (timer !== undefined)
            clearTimeout(timer);
        combined.abort();
    };
    if (timeoutMs !== undefined) {
        timer = setTimeout(abortCombined, timeoutMs);
        (_a = timer.unref) === null || _a === void 0 ? void 0 : _a.call(timer);
    }
    signal === null || signal === void 0 ? void 0 : signal.addEventListener('abort', abortCombined);
    signalB === null || signalB === void 0 ? void 0 : signalB.addEventListener('abort', abortCombined);
    var cleanup = function () {
        if (timer !== undefined)
            clearTimeout(timer);
        signal === null || signal === void 0 ? void 0 : signal.removeEventListener('abort', abortCombined);
        signalB === null || signalB === void 0 ? void 0 : signalB.removeEventListener('abort', abortCombined);
    };
    return { signal: combined.signal, cleanup: cleanup };
}
