"use strict";
/**
 * Claude Code hints protocol.
 *
 * CLIs and SDKs running under Claude Code can emit a self-closing
 * `<claude-code-hint />` tag to stderr (merged into stdout by the shell
 * tools). The harness scans tool output for these tags, strips them before
 * the output reaches the model, and surfaces an install prompt to the
 * user — no inference, no proactive execution.
 *
 * This file provides both the parser and a small module-level store for
 * the pending hint. The store is a single slot (not a queue) — we surface
 * at most one prompt per session, so there's no reason to accumulate.
 * React subscribes via useSyncExternalStore.
 *
 * See docs/claude-code-hints.md for the vendor-facing spec.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports._test = exports.subscribeToPendingHint = void 0;
exports.extractClaudeCodeHints = extractClaudeCodeHints;
exports.setPendingHint = setPendingHint;
exports.clearPendingHint = clearPendingHint;
exports.markShownThisSession = markShownThisSession;
exports.getPendingHintSnapshot = getPendingHintSnapshot;
exports.hasShownHintThisSession = hasShownHintThisSession;
exports._resetClaudeCodeHintStore = _resetClaudeCodeHintStore;
var debug_js_1 = require("./debug.js");
var signal_js_1 = require("./signal.js");
/** Spec versions this harness understands. */
var SUPPORTED_VERSIONS = new Set([1]);
/** Hint types this harness understands at the supported versions. */
var SUPPORTED_TYPES = new Set(['plugin']);
/**
 * Outer tag match. Anchored to whole lines (multiline mode) so that a
 * hint marker buried in a larger line — e.g. a log statement quoting the
 * tag — is ignored. Leading and trailing whitespace on the line is
 * tolerated since some SDKs pad stderr.
 */
var HINT_TAG_RE = /^[ \t]*<claude-code-hint\s+([^>]*?)\s*\/>[ \t]*$/gm;
/**
 * Attribute matcher. Accepts `key="value"` and `key=value` (terminated by
 * whitespace or `/>` closing sequence). Values containing whitespace or `"` must use the quoted
 * form. The quoted form does not support escape sequences; raise the spec
 * version if that becomes necessary.
 */
var ATTR_RE = /(\w+)=(?:"([^"]*)"|([^\s/>]+))/g;
/**
 * Scan shell tool output for hint tags, returning the parsed hints and
 * the output with hint lines removed. The stripped output is what the
 * model sees — hints are a harness-only side channel.
 *
 * @param output - Raw command output (stdout with stderr interleaved).
 * @param command - The command that produced the output; its first
 *   whitespace-separated token is recorded as `sourceCommand`.
 */
function extractClaudeCodeHints(output, command) {
    // Fast path: no tag open sequence → no work, no allocation.
    if (!output.includes('<claude-code-hint')) {
        return { hints: [], stripped: output };
    }
    var sourceCommand = firstCommandToken(command);
    var hints = [];
    var stripped = output.replace(HINT_TAG_RE, function (rawLine) {
        var attrs = parseAttrs(rawLine);
        var v = Number(attrs.v);
        var type = attrs.type;
        var value = attrs.value;
        if (!SUPPORTED_VERSIONS.has(v)) {
            (0, debug_js_1.logForDebugging)("[claudeCodeHints] dropped hint with unsupported v=".concat(attrs.v));
            return '';
        }
        if (!type || !SUPPORTED_TYPES.has(type)) {
            (0, debug_js_1.logForDebugging)("[claudeCodeHints] dropped hint with unsupported type=".concat(type));
            return '';
        }
        if (!value) {
            (0, debug_js_1.logForDebugging)('[claudeCodeHints] dropped hint with empty value');
            return '';
        }
        hints.push({ v: v, type: type, value: value, sourceCommand: sourceCommand });
        return '';
    });
    // Dropping a matched line leaves a blank line (the surrounding newlines
    // remain). Collapse runs of blank lines introduced by the replace so the
    // model-visible output doesn't grow vertical whitespace.
    var collapsed = hints.length > 0 || stripped !== output
        ? stripped.replace(/\n{3,}/g, '\n\n')
        : stripped;
    return { hints: hints, stripped: collapsed };
}
function parseAttrs(tagBody) {
    var _a, _b;
    var attrs = {};
    for (var _i = 0, _c = tagBody.matchAll(ATTR_RE); _i < _c.length; _i++) {
        var m = _c[_i];
        attrs[m[1]] = (_b = (_a = m[2]) !== null && _a !== void 0 ? _a : m[3]) !== null && _b !== void 0 ? _b : '';
    }
    return attrs;
}
function firstCommandToken(command) {
    var trimmed = command.trim();
    var spaceIdx = trimmed.search(/\s/);
    return spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx);
}
// ============================================================================
// Pending-hint store (useSyncExternalStore interface)
//
// Single-slot: write wins if the slot is already full (a CLI that emits on
// every invocation would otherwise pile up). The dialog is shown at most
// once per session; after that, setPendingHint becomes a no-op.
//
// Callers should gate before writing (installed? already shown? cap hit?) —
// see maybeRecordPluginHint in hintRecommendation.ts for the plugin-type
// gate. This module stays plugin-agnostic so future hint types can reuse
// the same store.
// ============================================================================
var pendingHint = null;
var shownThisSession = false;
var pendingHintChanged = (0, signal_js_1.createSignal)();
var notify = pendingHintChanged.emit;
/** Raw store write. Callers should gate first (see module comment). */
function setPendingHint(hint) {
    if (shownThisSession)
        return;
    pendingHint = hint;
    notify();
}
/** Clear the slot without flipping the session flag — for rejected hints. */
function clearPendingHint() {
    if (pendingHint !== null) {
        pendingHint = null;
        notify();
    }
}
/** Flip the once-per-session flag. Call only when a dialog is actually shown. */
function markShownThisSession() {
    shownThisSession = true;
}
exports.subscribeToPendingHint = pendingHintChanged.subscribe;
function getPendingHintSnapshot() {
    return pendingHint;
}
function hasShownHintThisSession() {
    return shownThisSession;
}
/** Test-only reset. */
function _resetClaudeCodeHintStore() {
    pendingHint = null;
    shownThisSession = false;
}
exports._test = {
    parseAttrs: parseAttrs,
    firstCommandToken: firstCommandToken,
};
