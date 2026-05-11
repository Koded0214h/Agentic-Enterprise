"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPollIntervalConfig = getPollIntervalConfig;
var v4_1 = require("zod/v4");
var growthbook_js_1 = require("../services/analytics/growthbook.js");
var lazySchema_js_1 = require("../utils/lazySchema.js");
var pollConfigDefaults_js_1 = require("./pollConfigDefaults.js");
// .min(100) on the seek-work intervals restores the old Math.max(..., 100)
// defense-in-depth floor against fat-fingered GrowthBook values. Unlike a
// clamp, Zod rejects the whole object on violation — a config with one bad
// field falls back to DEFAULT_POLL_CONFIG entirely rather than being
// partially trusted.
//
// The at_capacity intervals use a 0-or-≥100 refinement: 0 means "disabled"
// (heartbeat-only mode), ≥100 is the fat-finger floor. Values 1–99 are
// rejected so unit confusion (ops thinks seconds, enters 10) doesn't poll
// every 10ms against the VerifyEnvironmentSecretAuth DB path.
//
// The object-level refines require at least one at-capacity liveness
// mechanism enabled: heartbeat OR the relevant poll interval. Without this,
// the hb=0, atCapMs=0 drift config (ops disables heartbeat without
// restoring at_capacity) falls through every throttle site with no sleep —
// tight-looping /poll at HTTP-round-trip speed.
var zeroOrAtLeast100 = {
    message: 'must be 0 (disabled) or ≥100ms',
};
var pollIntervalConfigSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        poll_interval_ms_not_at_capacity: v4_1.z.number().int().min(100),
        // 0 = no at-capacity polling. Independent of heartbeat — both can be
        // enabled (heartbeat runs, periodically breaks out to poll).
        poll_interval_ms_at_capacity: v4_1.z
            .number()
            .int()
            .refine(function (v) { return v === 0 || v >= 100; }, zeroOrAtLeast100),
        // 0 = disabled; positive value = heartbeat at this interval while at
        // capacity. Runs alongside at-capacity polling, not instead of it.
        // Named non_exclusive to distinguish from the old heartbeat_interval_ms
        // (either-or semantics in pre-#22145 clients). .default(0) so existing
        // GrowthBook configs without this field parse successfully.
        non_exclusive_heartbeat_interval_ms: v4_1.z.number().int().min(0).default(0),
        // Multisession (bridgeMain.ts) intervals. Defaults match the
        // single-session values so existing configs without these fields
        // preserve current behavior.
        multisession_poll_interval_ms_not_at_capacity: v4_1.z
            .number()
            .int()
            .min(100)
            .default(pollConfigDefaults_js_1.DEFAULT_POLL_CONFIG.multisession_poll_interval_ms_not_at_capacity),
        multisession_poll_interval_ms_partial_capacity: v4_1.z
            .number()
            .int()
            .min(100)
            .default(pollConfigDefaults_js_1.DEFAULT_POLL_CONFIG.multisession_poll_interval_ms_partial_capacity),
        multisession_poll_interval_ms_at_capacity: v4_1.z
            .number()
            .int()
            .refine(function (v) { return v === 0 || v >= 100; }, zeroOrAtLeast100)
            .default(pollConfigDefaults_js_1.DEFAULT_POLL_CONFIG.multisession_poll_interval_ms_at_capacity),
        // .min(1) matches the server's ge=1 constraint (work_v1.py:230).
        reclaim_older_than_ms: v4_1.z.number().int().min(1).default(5000),
        session_keepalive_interval_v2_ms: v4_1.z
            .number()
            .int()
            .min(0)
            .default(120000),
    })
        .refine(function (cfg) {
        return cfg.non_exclusive_heartbeat_interval_ms > 0 ||
            cfg.poll_interval_ms_at_capacity > 0;
    }, {
        message: 'at-capacity liveness requires non_exclusive_heartbeat_interval_ms > 0 or poll_interval_ms_at_capacity > 0',
    })
        .refine(function (cfg) {
        return cfg.non_exclusive_heartbeat_interval_ms > 0 ||
            cfg.multisession_poll_interval_ms_at_capacity > 0;
    }, {
        message: 'at-capacity liveness requires non_exclusive_heartbeat_interval_ms > 0 or multisession_poll_interval_ms_at_capacity > 0',
    });
});
/**
 * Fetch the bridge poll interval config from GrowthBook with a 5-minute
 * refresh window. Validates the served JSON against the schema; falls back
 * to defaults if the flag is absent, malformed, or partially-specified.
 *
 * Shared by bridgeMain.ts (standalone) and replBridge.ts (REPL) so ops
 * can tune both poll rates fleet-wide with a single config push.
 */
function getPollIntervalConfig() {
    var raw = (0, growthbook_js_1.getFeatureValue_CACHED_WITH_REFRESH)('tengu_bridge_poll_interval_config', pollConfigDefaults_js_1.DEFAULT_POLL_CONFIG, 5 * 60 * 1000);
    var parsed = pollIntervalConfigSchema().safeParse(raw);
    return parsed.success ? parsed.data : pollConfigDefaults_js_1.DEFAULT_POLL_CONFIG;
}
