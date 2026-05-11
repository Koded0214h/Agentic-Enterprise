"use strict";
// GrowthBook-backed cron jitter configuration.
//
// Separated from cronScheduler.ts so the scheduler can be bundled in the
// Agent SDK public build without pulling in analytics/growthbook.ts and
// its large transitive dependency set (settings/hooks/config cycle).
//
// Usage:
//   REPL (useScheduledTasks.ts): pass `getJitterConfig: getCronJitterConfig`
//   Daemon/SDK: omit getJitterConfig → DEFAULT_CRON_JITTER_CONFIG applies.
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCronJitterConfig = getCronJitterConfig;
var v4_1 = require("zod/v4");
var growthbook_js_1 = require("../services/analytics/growthbook.js");
var cronTasks_js_1 = require("./cronTasks.js");
var lazySchema_js_1 = require("./lazySchema.js");
// How often to re-fetch tengu_kairos_cron_config from GrowthBook. Short because
// this is an incident lever — when we push a config change to shed :00 load,
// we want the fleet to converge within a minute, not on the next process
// restart. The underlying call is a synchronous cache read; the refresh just
// clears the memoized entry so the next read triggers a background fetch.
var JITTER_CONFIG_REFRESH_MS = 60 * 1000;
// Upper bounds here are defense-in-depth against fat-fingered GrowthBook
// pushes. Like pollConfig.ts, Zod rejects the whole object on any violation
// rather than partially trusting it — a config with one bad field falls back
// to DEFAULT_CRON_JITTER_CONFIG entirely. oneShotFloorMs shares oneShotMaxMs's
// ceiling (floor > max would invert the jitter range) and is cross-checked in
// the refine; the shared ceiling keeps the individual bound explicit in the
// error path. recurringMaxAgeMs uses .default() so a pre-existing GB config
// without the field doesn't get wholesale-rejected — the other fields were
// added together at config inception and don't need this.
var HALF_HOUR_MS = 30 * 60 * 1000;
var THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
var cronJitterConfigSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z
        .object({
        recurringFrac: v4_1.z.number().min(0).max(1),
        recurringCapMs: v4_1.z.number().int().min(0).max(HALF_HOUR_MS),
        oneShotMaxMs: v4_1.z.number().int().min(0).max(HALF_HOUR_MS),
        oneShotFloorMs: v4_1.z.number().int().min(0).max(HALF_HOUR_MS),
        oneShotMinuteMod: v4_1.z.number().int().min(1).max(60),
        recurringMaxAgeMs: v4_1.z
            .number()
            .int()
            .min(0)
            .max(THIRTY_DAYS_MS)
            .default(cronTasks_js_1.DEFAULT_CRON_JITTER_CONFIG.recurringMaxAgeMs),
    })
        .refine(function (c) { return c.oneShotFloorMs <= c.oneShotMaxMs; });
});
/**
 * Read `tengu_kairos_cron_config` from GrowthBook, validate, fall back to
 * defaults on absent/malformed/out-of-bounds config. Called from check()
 * every tick via the `getJitterConfig` callback — cheap (synchronous cache
 * hit). Refresh window: JITTER_CONFIG_REFRESH_MS.
 *
 * Exported so ops runbooks can point at a single function when documenting
 * the lever, and so tests can spy on it without mocking GrowthBook itself.
 *
 * Pass this as `getJitterConfig` when calling createCronScheduler in REPL
 * contexts. Daemon/SDK callers omit getJitterConfig and get defaults.
 */
function getCronJitterConfig() {
    var raw = (0, growthbook_js_1.getFeatureValue_CACHED_WITH_REFRESH)('tengu_kairos_cron_config', cronTasks_js_1.DEFAULT_CRON_JITTER_CONFIG, JITTER_CONFIG_REFRESH_MS);
    var parsed = cronJitterConfigSchema().safeParse(raw);
    return parsed.success ? parsed.data : cronTasks_js_1.DEFAULT_CRON_JITTER_CONFIG;
}
