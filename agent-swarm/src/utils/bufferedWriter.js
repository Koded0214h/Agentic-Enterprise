"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBufferedWriter = createBufferedWriter;
function createBufferedWriter(_a) {
    var writeFn = _a.writeFn, _b = _a.flushIntervalMs, flushIntervalMs = _b === void 0 ? 1000 : _b, _c = _a.maxBufferSize, maxBufferSize = _c === void 0 ? 100 : _c, _d = _a.maxBufferBytes, maxBufferBytes = _d === void 0 ? Infinity : _d, _e = _a.immediateMode, immediateMode = _e === void 0 ? false : _e;
    var buffer = [];
    var bufferBytes = 0;
    var flushTimer = null;
    // Batch detached by overflow that hasn't been written yet. Tracked so
    // flush()/dispose() can drain it synchronously if the process exits
    // before the setImmediate fires.
    var pendingOverflow = null;
    function clearTimer() {
        if (flushTimer) {
            clearTimeout(flushTimer);
            flushTimer = null;
        }
    }
    function flush() {
        if (pendingOverflow) {
            writeFn(pendingOverflow.join(''));
            pendingOverflow = null;
        }
        if (buffer.length === 0)
            return;
        writeFn(buffer.join(''));
        buffer = [];
        bufferBytes = 0;
        clearTimer();
    }
    function scheduleFlush() {
        if (!flushTimer) {
            flushTimer = setTimeout(flush, flushIntervalMs);
        }
    }
    // Detach the buffer synchronously so the caller never waits on writeFn.
    // writeFn may block (e.g. errorLogSink.ts appendFileSync) — if overflow fires
    // mid-render or mid-keystroke, deferring the write keeps the current tick
    // short. Timer-based flushes already run outside user code paths so they
    // stay synchronous.
    function flushDeferred() {
        if (pendingOverflow) {
            // A previous overflow write is still queued. Coalesce into it to
            // preserve ordering — writes land in a single setImmediate-ordered batch.
            pendingOverflow.push.apply(pendingOverflow, buffer);
            buffer = [];
            bufferBytes = 0;
            clearTimer();
            return;
        }
        var detached = buffer;
        buffer = [];
        bufferBytes = 0;
        clearTimer();
        pendingOverflow = detached;
        setImmediate(function () {
            var toWrite = pendingOverflow;
            pendingOverflow = null;
            if (toWrite)
                writeFn(toWrite.join(''));
        });
    }
    return {
        write: function (content) {
            if (immediateMode) {
                writeFn(content);
                return;
            }
            buffer.push(content);
            bufferBytes += content.length;
            scheduleFlush();
            if (buffer.length >= maxBufferSize || bufferBytes >= maxBufferBytes) {
                flushDeferred();
            }
        },
        flush: flush,
        dispose: function () {
            flush();
        },
    };
}
