"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSinkKilled = isSinkKilled;
var growthbook_js_1 = require("./growthbook.js");
// Mangled name: per-sink analytics killswitch
var SINK_KILLSWITCH_CONFIG_NAME = 'tengu_frond_boric';
/**
 * GrowthBook JSON config that disables individual analytics sinks.
 * Shape: { datadog?: boolean, firstParty?: boolean }
 * A value of true for a key stops all dispatch to that sink.
 * Default {} (nothing killed). Fail-open: missing/malformed config = sink stays on.
 *
 * NOTE: Must NOT be called from inside is1PEventLoggingEnabled() -
 * growthbook.ts:isGrowthBookEnabled() calls that, so a lookup here would recurse.
 * Call at per-event dispatch sites instead.
 */
function isSinkKilled(sink) {
    var config = (0, growthbook_js_1.getDynamicConfig_CACHED_MAY_BE_STALE)(SINK_KILLSWITCH_CONFIG_NAME, {});
    // getFeatureValue_CACHED_MAY_BE_STALE guards on `!== undefined`, so a
    // cached JSON null leaks through instead of falling back to {}.
    return (config === null || config === void 0 ? void 0 : config[sink]) === true;
}
