"use strict";
// Critical system constants extracted to break circular dependencies
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLI_SYSPROMPT_PREFIXES = void 0;
exports.getCLISyspromptPrefix = getCLISyspromptPrefix;
exports.getAttributionHeader = getAttributionHeader;
var bun_bundle_1 = require("bun:bundle");
var growthbook_js_1 = require("../services/analytics/growthbook.js");
var debug_js_1 = require("../utils/debug.js");
var envUtils_js_1 = require("../utils/envUtils.js");
var providers_js_1 = require("../utils/model/providers.js");
var workloadContext_js_1 = require("../utils/workloadContext.js");
var DEFAULT_PREFIX = "You are Claude Code, Anthropic's official CLI for Claude.";
var AGENT_SDK_CLAUDE_CODE_PRESET_PREFIX = "You are Claude Code, Anthropic's official CLI for Claude, running within the Claude Agent SDK.";
var AGENT_SDK_PREFIX = "You are a Claude agent, built on Anthropic's Claude Agent SDK.";
var CLI_SYSPROMPT_PREFIX_VALUES = [
    DEFAULT_PREFIX,
    AGENT_SDK_CLAUDE_CODE_PRESET_PREFIX,
    AGENT_SDK_PREFIX,
];
/**
 * All possible CLI sysprompt prefix values, used by splitSysPromptPrefix
 * to identify prefix blocks by content rather than position.
 */
exports.CLI_SYSPROMPT_PREFIXES = new Set(CLI_SYSPROMPT_PREFIX_VALUES);
function getCLISyspromptPrefix(options) {
    var apiProvider = (0, providers_js_1.getAPIProvider)();
    if (apiProvider === 'vertex') {
        return DEFAULT_PREFIX;
    }
    if (options === null || options === void 0 ? void 0 : options.isNonInteractive) {
        if (options.hasAppendSystemPrompt) {
            return AGENT_SDK_CLAUDE_CODE_PRESET_PREFIX;
        }
        return AGENT_SDK_PREFIX;
    }
    return DEFAULT_PREFIX;
}
/**
 * Check if attribution header is enabled.
 * Enabled by default, can be disabled via env var or GrowthBook killswitch.
 */
function isAttributionHeaderEnabled() {
    if ((0, envUtils_js_1.isEnvDefinedFalsy)(process.env.CLAUDE_CODE_ATTRIBUTION_HEADER)) {
        return false;
    }
    return (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_attribution_header', true);
}
/**
 * Get attribution header for API requests.
 * Returns a header string with cc_version (including fingerprint) and cc_entrypoint.
 * Enabled by default, can be disabled via env var or GrowthBook killswitch.
 *
 * When NATIVE_CLIENT_ATTESTATION is enabled, includes a `cch=00000` placeholder.
 * Before the request is sent, Bun's native HTTP stack finds this placeholder
 * in the request body and overwrites the zeros with a computed hash. The
 * server verifies this token to confirm the request came from a real Claude
 * Code client. See bun-anthropic/src/http/Attestation.zig for implementation.
 *
 * We use a placeholder (instead of injecting from Zig) because same-length
 * replacement avoids Content-Length changes and buffer reallocation.
 */
function getAttributionHeader(fingerprint) {
    var _a;
    if (!isAttributionHeaderEnabled()) {
        return '';
    }
    var version = "".concat(MACRO.VERSION, ".").concat(fingerprint);
    var entrypoint = (_a = process.env.CLAUDE_CODE_ENTRYPOINT) !== null && _a !== void 0 ? _a : 'unknown';
    // cch=00000 placeholder is overwritten by Bun's HTTP stack with attestation token
    var cch = (0, bun_bundle_1.feature)('NATIVE_CLIENT_ATTESTATION') ? ' cch=00000;' : '';
    // cc_workload: turn-scoped hint so the API can route e.g. cron-initiated
    // requests to a lower QoS pool. Absent = interactive default. Safe re:
    // fingerprint (computed from msg chars + version only, line 78 above) and
    // cch attestation (placeholder overwritten in serialized body bytes after
    // this string is built). Server _parse_cc_header tolerates unknown extra
    // fields so old API deploys silently ignore this.
    var workload = (0, workloadContext_js_1.getWorkload)();
    var workloadPair = workload ? " cc_workload=".concat(workload, ";") : '';
    var header = "x-anthropic-billing-header: cc_version=".concat(version, "; cc_entrypoint=").concat(entrypoint, ";").concat(cch).concat(workloadPair);
    (0, debug_js_1.logForDebugging)("attribution header ".concat(header));
    return header;
}
