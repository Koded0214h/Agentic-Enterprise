"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = sleep;
exports.withTimeout = withTimeout;
/**
 * Abort-responsive sleep. Resolves after `ms` milliseconds, or immediately
 * when `signal` aborts (so backoff loops don't block shutdown).
 *
 * By default, abort resolves silently; the caller should check
 * `signal.aborted` after the await. Pass `throwOnAbort: true` to have
 * abort reject — useful when the sleep is deep inside a retry loop
 * and you want the rejection to bubble up and cancel the whole operation.
 *
 * Pass `abortError` to customize the rejection error (implies
 * `throwOnAbort: true`). Useful for retry loops that catch a specific
 * error class (e.g. `APIUserAbortError`).
 */
function sleep(ms, signal, opts) {
    return new Promise(function (resolve, reject) {
        var _a, _b;
        // Check aborted state BEFORE setting up the timer. If we defined
        // onAbort first and called it synchronously here, it would reference
        // `timer` while still in the Temporal Dead Zone.
        if (signal === null || signal === void 0 ? void 0 : signal.aborted) {
            if ((opts === null || opts === void 0 ? void 0 : opts.throwOnAbort) || (opts === null || opts === void 0 ? void 0 : opts.abortError)) {
                void reject((_b = (_a = opts.abortError) === null || _a === void 0 ? void 0 : _a.call(opts)) !== null && _b !== void 0 ? _b : new Error('aborted'));
            }
            else {
                void resolve();
            }
            return;
        }
        var timer = setTimeout(function (signal, onAbort, resolve) {
            signal === null || signal === void 0 ? void 0 : signal.removeEventListener('abort', onAbort);
            void resolve();
        }, ms, signal, onAbort, resolve);
        function onAbort() {
            var _a, _b;
            clearTimeout(timer);
            if ((opts === null || opts === void 0 ? void 0 : opts.throwOnAbort) || (opts === null || opts === void 0 ? void 0 : opts.abortError)) {
                void reject((_b = (_a = opts.abortError) === null || _a === void 0 ? void 0 : _a.call(opts)) !== null && _b !== void 0 ? _b : new Error('aborted'));
            }
            else {
                void resolve();
            }
        }
        signal === null || signal === void 0 ? void 0 : signal.addEventListener('abort', onAbort, { once: true });
        if (opts === null || opts === void 0 ? void 0 : opts.unref) {
            timer.unref();
        }
    });
}
function rejectWithTimeout(reject, message) {
    reject(new Error(message));
}
/**
 * Race a promise against a timeout. Rejects with `Error(message)` if the
 * promise doesn't settle within `ms`. The timeout timer is cleared when
 * the promise settles (no dangling timer) and unref'd so it doesn't
 * block process exit.
 *
 * Note: this doesn't cancel the underlying work — if the promise is
 * backed by a runaway async operation, that keeps running. This just
 * returns control to the caller.
 */
function withTimeout(promise, ms, message) {
    var timer;
    var timeoutPromise = new Promise(function (_, reject) {
        var _a;
        // eslint-disable-next-line no-restricted-syntax -- not a sleep: REJECTS after ms (timeout guard)
        timer = setTimeout(rejectWithTimeout, ms, reject, message);
        if (typeof timer === 'object')
            (_a = timer.unref) === null || _a === void 0 ? void 0 : _a.call(timer);
    });
    return Promise.race([promise, timeoutPromise]).finally(function () {
        if (timer !== undefined)
            clearTimeout(timer);
    });
}
