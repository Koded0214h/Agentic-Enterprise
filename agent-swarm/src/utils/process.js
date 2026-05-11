"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerProcessOutputErrorHandlers = registerProcessOutputErrorHandlers;
exports.writeToStdout = writeToStdout;
exports.writeToStderr = writeToStderr;
exports.exitWithError = exitWithError;
exports.peekForStdinData = peekForStdinData;
function handleEPIPE(stream) {
    return function (err) {
        if (err.code === 'EPIPE') {
            stream.destroy();
        }
    };
}
// Prevents memory leak when pipe is broken (e.g., `claude -p | head -1`)
function registerProcessOutputErrorHandlers() {
    process.stdout.on('error', handleEPIPE(process.stdout));
    process.stderr.on('error', handleEPIPE(process.stderr));
}
function writeOut(stream, data) {
    if (stream.destroyed) {
        return;
    }
    // Note: we don't handle backpressure (write() returning false).
    //
    // We should consider handling the callback to ensure we wait for data to flush.
    stream.write(data /* callback to handle here */);
}
function writeToStdout(data) {
    writeOut(process.stdout, data);
}
function writeToStderr(data) {
    writeOut(process.stderr, data);
}
// Write error to stderr and exit with code 1. Consolidates the
// console.error + process.exit(1) pattern used in entrypoint fast-paths.
function exitWithError(message) {
    // biome-ignore lint/suspicious/noConsole:: intentional console output
    console.error(message);
    // eslint-disable-next-line custom-rules/no-process-exit
    process.exit(1);
}
// Wait for a stdin-like stream to close, but give up after ms if no data ever
// arrives. First data chunk cancels the timeout — after that, wait for end
// unconditionally (caller's accumulator needs all chunks, not just the first).
// Returns true on timeout, false on end. Used by -p mode to distinguish a
// real pipe producer from an inherited-but-idle parent stdin.
function peekForStdinData(stream, ms) {
    return new Promise(function (resolve) {
        var done = function (timedOut) {
            clearTimeout(peek);
            stream.off('end', onEnd);
            stream.off('data', onFirstData);
            void resolve(timedOut);
        };
        var onEnd = function () { return done(false); };
        var onFirstData = function () { return clearTimeout(peek); };
        // eslint-disable-next-line no-restricted-syntax -- not a sleep: races timeout against stream end/data events
        var peek = setTimeout(done, ms, true);
        stream.once('end', onEnd);
        stream.once('data', onFirstData);
    });
}
