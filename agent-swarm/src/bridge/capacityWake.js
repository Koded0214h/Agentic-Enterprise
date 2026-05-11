"use strict";
/**
 * Shared capacity-wake primitive for bridge poll loops.
 *
 * Both replBridge.ts and bridgeMain.ts need to sleep while "at capacity"
 * but wake early when either (a) the outer loop signal aborts (shutdown),
 * or (b) capacity frees up (session done / transport lost). This module
 * encapsulates the mutable wake-controller + two-signal merger that both
 * poll loops previously duplicated byte-for-byte.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCapacityWake = createCapacityWake;
function createCapacityWake(outerSignal) {
    var wakeController = new AbortController();
    function wake() {
        wakeController.abort();
        wakeController = new AbortController();
    }
    function signal() {
        var merged = new AbortController();
        var abort = function () { return merged.abort(); };
        if (outerSignal.aborted || wakeController.signal.aborted) {
            merged.abort();
            return { signal: merged.signal, cleanup: function () { } };
        }
        outerSignal.addEventListener('abort', abort, { once: true });
        var capSig = wakeController.signal;
        capSig.addEventListener('abort', abort, { once: true });
        return {
            signal: merged.signal,
            cleanup: function () {
                outerSignal.removeEventListener('abort', abort);
                capSig.removeEventListener('abort', abort);
            },
        };
    }
    return { signal: signal, wake: wake };
}
