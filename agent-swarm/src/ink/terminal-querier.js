"use strict";
/**
 * Query the terminal and await responses without timeouts.
 *
 * Terminal queries (DECRQM, DA1, OSC 11, etc.) share the stdin stream
 * with keyboard input. Response sequences are syntactically
 * distinguishable from key events, so the input parser recognizes them
 * and dispatches them here.
 *
 * To avoid timeouts, each query batch is terminated by a DA1 sentinel
 * (CSI c) — every terminal since VT100 responds to DA1, and terminals
 * answer queries in order. So: if your query's response arrives before
 * DA1's, the terminal supports it; if DA1 arrives first, it doesn't.
 *
 * Usage:
 *   const [sync, grapheme] = await Promise.all([
 *     querier.send(decrqm(2026)),
 *     querier.send(decrqm(2027)),
 *     querier.flush(),
 *   ])
 *   // sync and grapheme are DECRPM responses or undefined if unsupported
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminalQuerier = void 0;
exports.decrqm = decrqm;
exports.da1 = da1;
exports.da2 = da2;
exports.kittyKeyboard = kittyKeyboard;
exports.cursorPosition = cursorPosition;
exports.oscColor = oscColor;
exports.xtversion = xtversion;
var csi_js_1 = require("./termio/csi.js");
var osc_js_1 = require("./termio/osc.js");
// -- Query builders --
/** DECRQM: request DEC private mode status (CSI ? mode $ p).
 *  Terminal replies with DECRPM (CSI ? mode ; status $ y) or ignores. */
function decrqm(mode) {
    return {
        request: (0, csi_js_1.csi)("?".concat(mode, "$p")),
        match: function (r) { return r.type === 'decrpm' && r.mode === mode; },
    };
}
/** Primary Device Attributes query (CSI c). Every terminal answers this —
 *  used internally by flush() as a universal sentinel. Call directly if
 *  you want the DA1 params. */
function da1() {
    return {
        request: (0, csi_js_1.csi)('c'),
        match: function (r) { return r.type === 'da1'; },
    };
}
/** Secondary Device Attributes query (CSI > c). Returns terminal version. */
function da2() {
    return {
        request: (0, csi_js_1.csi)('>c'),
        match: function (r) { return r.type === 'da2'; },
    };
}
/** Query current Kitty keyboard protocol flags (CSI ? u).
 *  Terminal replies with CSI ? flags u or ignores. */
function kittyKeyboard() {
    return {
        request: (0, csi_js_1.csi)('?u'),
        match: function (r) { return r.type === 'kittyKeyboard'; },
    };
}
/** DECXCPR: request cursor position with DEC-private marker (CSI ? 6 n).
 *  Terminal replies with CSI ? row ; col R. The `?` marker is critical —
 *  the plain DSR form (CSI 6 n → CSI row;col R) is ambiguous with
 *  modified F3 keys (Shift+F3 = CSI 1;2 R, etc.). */
function cursorPosition() {
    return {
        request: (0, csi_js_1.csi)('?6n'),
        match: function (r) { return r.type === 'cursorPosition'; },
    };
}
/** OSC dynamic color query (e.g. OSC 11 for bg color, OSC 10 for fg).
 *  The `?` data slot asks the terminal to reply with the current value. */
function oscColor(code) {
    return {
        request: (0, osc_js_1.osc)(code, '?'),
        match: function (r) { return r.type === 'osc' && r.code === code; },
    };
}
/** XTVERSION: request terminal name/version (CSI > 0 q).
 *  Terminal replies with DCS > | name ST (e.g. "xterm.js(5.5.0)") or ignores.
 *  This survives SSH — the query goes through the pty, not the environment,
 *  so it identifies the *client* terminal even when TERM_PROGRAM isn't
 *  forwarded. Used to detect xterm.js for wheel-scroll compensation. */
function xtversion() {
    return {
        request: (0, csi_js_1.csi)('>0q'),
        match: function (r) { return r.type === 'xtversion'; },
    };
}
// -- Querier --
/** Sentinel request sequence (DA1). Kept internal; flush() writes it. */
var SENTINEL = (0, csi_js_1.csi)('c');
var TerminalQuerier = /** @class */ (function () {
    function TerminalQuerier(stdout) {
        this.stdout = stdout;
        /**
         * Interleaved queue of queries and sentinels in send order. Terminals
         * respond in order, so each flush() barrier only drains queries queued
         * before it — concurrent batches from independent callers stay isolated.
         */
        this.queue = [];
    }
    /**
     * Send a query and wait for its response.
     *
     * Resolves with the response when `query.match` matches an incoming
     * TerminalResponse, or with `undefined` when a flush() sentinel arrives
     * before any matching response (meaning the terminal ignored the query).
     *
     * Never rejects; never times out on its own. If you never call flush()
     * and the terminal doesn't respond, the promise remains pending.
     */
    TerminalQuerier.prototype.send = function (query) {
        var _this = this;
        return new Promise(function (resolve) {
            _this.queue.push({
                kind: 'query',
                match: query.match,
                resolve: function (r) { return resolve(r); },
            });
            _this.stdout.write(query.request);
        });
    };
    /**
     * Send the DA1 sentinel. Resolves when DA1's response arrives.
     *
     * As a side effect, all queries still pending when DA1 arrives are
     * resolved with `undefined` (terminal didn't respond → doesn't support
     * the query). This is the barrier that makes send() timeout-free.
     *
     * Safe to call with no pending queries — still waits for a round-trip.
     */
    TerminalQuerier.prototype.flush = function () {
        var _this = this;
        return new Promise(function (resolve) {
            _this.queue.push({ kind: 'sentinel', resolve: resolve });
            _this.stdout.write(SENTINEL);
        });
    };
    /**
     * Dispatch a response parsed from stdin. Called by App.tsx's
     * processKeysInBatch for every `kind: 'response'` item.
     *
     * Matching strategy:
     * - First, try to match a pending query (FIFO, first match wins).
     *   This lets callers send(da1()) explicitly if they want the DA1
     *   params — a separate DA1 write means the terminal sends TWO DA1
     *   responses. The first matches the explicit query; the second
     *   (unmatched) fires the sentinel.
     * - Otherwise, if this is a DA1, fire the FIRST pending sentinel:
     *   resolve any queries queued before that sentinel with undefined
     *   (the terminal answered DA1 without answering them → unsupported)
     *   and signal its flush() completion. Only draining up to the first
     *   sentinel keeps later batches intact when multiple callers have
     *   concurrent queries in flight.
     * - Unsolicited responses (no match, no sentinel) are silently dropped.
     */
    TerminalQuerier.prototype.onResponse = function (r) {
        var idx = this.queue.findIndex(function (p) { return p.kind === 'query' && p.match(r); });
        if (idx !== -1) {
            var q = this.queue.splice(idx, 1)[0];
            if ((q === null || q === void 0 ? void 0 : q.kind) === 'query')
                q.resolve(r);
            return;
        }
        if (r.type === 'da1') {
            var s = this.queue.findIndex(function (p) { return p.kind === 'sentinel'; });
            if (s === -1)
                return;
            for (var _i = 0, _a = this.queue.splice(0, s + 1); _i < _a.length; _i++) {
                var p = _a[_i];
                if (p.kind === 'query')
                    p.resolve(undefined);
                else
                    p.resolve();
            }
        }
    };
    return TerminalQuerier;
}());
exports.TerminalQuerier = TerminalQuerier;
