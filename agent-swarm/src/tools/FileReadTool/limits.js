"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultFileReadingLimits = exports.DEFAULT_MAX_OUTPUT_TOKENS = void 0;
/**
 * Read tool output limits.  Two caps apply to text reads:
 *
 *   | limit         | default | checks                    | cost          | on overflow     |
 *   |---------------|---------|---------------------------|---------------|-----------------|
 *   | maxSizeBytes  | 256 KB  | TOTAL FILE SIZE (not out) | 1 stat        | throws pre-read |
 *   | maxTokens     | 25000   | actual output tokens      | API roundtrip | throws post-read|
 *
 * Known mismatch: maxSizeBytes gates on total file size, not the slice.
 * Tested truncating instead of throwing for explicit-limit reads that
 * exceed the byte cap (#21841, Mar 2026).  Reverted: tool error rate
 * dropped but mean tokens rose — the throw path yields a ~100-byte error
 * tool-result while truncation yields ~25K tokens of content at the cap.
 */
var memoize_js_1 = require("lodash-es/memoize.js");
var growthbook_js_1 = require("src/services/analytics/growthbook.js");
var file_js_1 = require("src/utils/file.js");
exports.DEFAULT_MAX_OUTPUT_TOKENS = 25000;
/**
 * Env var override for max output tokens. Returns undefined when unset/invalid
 * so the caller can fall through to the next precedence tier.
 */
function getEnvMaxTokens() {
    var override = process.env.CLAUDE_CODE_FILE_READ_MAX_OUTPUT_TOKENS;
    if (override) {
        var parsed = parseInt(override, 10);
        if (!isNaN(parsed) && parsed > 0) {
            return parsed;
        }
    }
    return undefined;
}
/**
 * Default limits for Read tool when the ToolUseContext doesn't supply an
 * override. Memoized so the GrowthBook value is fixed at first call — avoids
 * the cap changing mid-session as the flag refreshes in the background.
 *
 * Precedence for maxTokens: env var > GrowthBook > DEFAULT_MAX_OUTPUT_TOKENS.
 * (Env var is a user-set override, should beat experiment infrastructure.)
 *
 * Defensive: each field is individually validated; invalid values fall
 * through to the hardcoded defaults (no route to cap=0).
 */
exports.getDefaultFileReadingLimits = (0, memoize_js_1.default)(function () {
    var override = (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_amber_wren', {});
    var maxSizeBytes = typeof (override === null || override === void 0 ? void 0 : override.maxSizeBytes) === 'number' &&
        Number.isFinite(override.maxSizeBytes) &&
        override.maxSizeBytes > 0
        ? override.maxSizeBytes
        : file_js_1.MAX_OUTPUT_SIZE;
    var envMaxTokens = getEnvMaxTokens();
    var maxTokens = envMaxTokens !== null && envMaxTokens !== void 0 ? envMaxTokens : (typeof (override === null || override === void 0 ? void 0 : override.maxTokens) === 'number' &&
        Number.isFinite(override.maxTokens) &&
        override.maxTokens > 0
        ? override.maxTokens
        : exports.DEFAULT_MAX_OUTPUT_TOKENS);
    var includeMaxSizeInPrompt = typeof (override === null || override === void 0 ? void 0 : override.includeMaxSizeInPrompt) === 'boolean'
        ? override.includeMaxSizeInPrompt
        : undefined;
    var targetedRangeNudge = typeof (override === null || override === void 0 ? void 0 : override.targetedRangeNudge) === 'boolean'
        ? override.targetedRangeNudge
        : undefined;
    return {
        maxSizeBytes: maxSizeBytes,
        maxTokens: maxTokens,
        includeMaxSizeInPrompt: includeMaxSizeInPrompt,
        targetedRangeNudge: targetedRangeNudge,
    };
});
