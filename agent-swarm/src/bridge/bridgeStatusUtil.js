"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FAILED_FOOTER_TEXT = exports.truncatePrompt = exports.formatDuration = exports.SHIMMER_INTERVAL_MS = exports.TOOL_DISPLAY_EXPIRY_MS = void 0;
exports.timestamp = timestamp;
exports.abbreviateActivity = abbreviateActivity;
exports.buildBridgeConnectUrl = buildBridgeConnectUrl;
exports.buildBridgeSessionUrl = buildBridgeSessionUrl;
exports.computeGlimmerIndex = computeGlimmerIndex;
exports.computeShimmerSegments = computeShimmerSegments;
exports.getBridgeStatus = getBridgeStatus;
exports.buildIdleFooterText = buildIdleFooterText;
exports.buildActiveFooterText = buildActiveFooterText;
exports.wrapWithOsc8Link = wrapWithOsc8Link;
var product_js_1 = require("../constants/product.js");
var stringWidth_js_1 = require("../ink/stringWidth.js");
var format_js_1 = require("../utils/format.js");
Object.defineProperty(exports, "formatDuration", { enumerable: true, get: function () { return format_js_1.formatDuration; } });
Object.defineProperty(exports, "truncatePrompt", { enumerable: true, get: function () { return format_js_1.truncateToWidth; } });
var intl_js_1 = require("../utils/intl.js");
/** How long a tool activity line stays visible after last tool_start (ms). */
exports.TOOL_DISPLAY_EXPIRY_MS = 30000;
/** Interval for the shimmer animation tick (ms). */
exports.SHIMMER_INTERVAL_MS = 150;
function timestamp() {
    var now = new Date();
    var h = String(now.getHours()).padStart(2, '0');
    var m = String(now.getMinutes()).padStart(2, '0');
    var s = String(now.getSeconds()).padStart(2, '0');
    return "".concat(h, ":").concat(m, ":").concat(s);
}
/** Abbreviate a tool activity summary for the trail display. */
function abbreviateActivity(summary) {
    return (0, format_js_1.truncateToWidth)(summary, 30);
}
/** Build the connect URL shown when the bridge is idle. */
function buildBridgeConnectUrl(environmentId, ingressUrl) {
    var baseUrl = (0, product_js_1.getClaudeAiBaseUrl)(undefined, ingressUrl);
    return "".concat(baseUrl, "/code?bridge=").concat(environmentId);
}
/**
 * Build the session URL shown when a session is attached. Delegates to
 * getRemoteSessionUrl for the cse_→session_ prefix translation, then appends
 * the v1-specific ?bridge={environmentId} query.
 */
function buildBridgeSessionUrl(sessionId, environmentId, ingressUrl) {
    return "".concat((0, product_js_1.getRemoteSessionUrl)(sessionId, ingressUrl), "?bridge=").concat(environmentId);
}
/** Compute the glimmer index for a reverse-sweep shimmer animation. */
function computeGlimmerIndex(tick, messageWidth) {
    var cycleLength = messageWidth + 20;
    return messageWidth + 10 - (tick % cycleLength);
}
/**
 * Split text into three segments by visual column position for shimmer rendering.
 *
 * Uses grapheme segmentation and `stringWidth` so the split is correct for
 * multi-byte characters, emoji, and CJK glyphs.
 *
 * Returns `{ before, shimmer, after }` strings. Both renderers (chalk in
 * bridgeUI.ts and React/Ink in bridge.tsx) apply their own coloring to
 * these segments.
 */
function computeShimmerSegments(text, glimmerIndex) {
    var messageWidth = (0, stringWidth_js_1.stringWidth)(text);
    var shimmerStart = glimmerIndex - 1;
    var shimmerEnd = glimmerIndex + 1;
    // When shimmer is offscreen, return all text as "before"
    if (shimmerStart >= messageWidth || shimmerEnd < 0) {
        return { before: text, shimmer: '', after: '' };
    }
    // Split into at most 3 segments by visual column position
    var clampedStart = Math.max(0, shimmerStart);
    var colPos = 0;
    var before = '';
    var shimmer = '';
    var after = '';
    for (var _i = 0, _a = (0, intl_js_1.getGraphemeSegmenter)().segment(text); _i < _a.length; _i++) {
        var segment = _a[_i].segment;
        var segWidth = (0, stringWidth_js_1.stringWidth)(segment);
        if (colPos + segWidth <= clampedStart) {
            before += segment;
        }
        else if (colPos > shimmerEnd) {
            after += segment;
        }
        else {
            shimmer += segment;
        }
        colPos += segWidth;
    }
    return { before: before, shimmer: shimmer, after: after };
}
/** Derive a status label and color from the bridge connection state. */
function getBridgeStatus(_a) {
    var error = _a.error, connected = _a.connected, sessionActive = _a.sessionActive, reconnecting = _a.reconnecting;
    if (error)
        return { label: 'Remote Control failed', color: 'error' };
    if (reconnecting)
        return { label: 'Remote Control reconnecting', color: 'warning' };
    if (sessionActive || connected)
        return { label: 'Remote Control active', color: 'success' };
    return { label: 'Remote Control connecting\u2026', color: 'warning' };
}
/** Footer text shown when bridge is idle (Ready state). */
function buildIdleFooterText(url) {
    return "Code everywhere with the Claude app or ".concat(url);
}
/** Footer text shown when a session is active (Connected state). */
function buildActiveFooterText(url) {
    return "Continue coding in the Claude app or ".concat(url);
}
/** Footer text shown when the bridge has failed. */
exports.FAILED_FOOTER_TEXT = 'Something went wrong, please try again';
/**
 * Wrap text in an OSC 8 terminal hyperlink. Zero visual width for layout purposes.
 * strip-ansi (used by stringWidth) correctly strips these sequences, so
 * countVisualLines in bridgeUI.ts remains accurate.
 */
function wrapWithOsc8Link(text, url) {
    return "\u001B]8;;".concat(url, "\u0007").concat(text, "\u001B]8;;\u0007");
}
