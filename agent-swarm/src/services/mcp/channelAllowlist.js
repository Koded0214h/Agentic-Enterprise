"use strict";
/**
 * Approved channel plugins allowlist. --channels plugin:name@marketplace
 * entries only register if {marketplace, plugin} is on this list. server:
 * entries always fail (schema is plugin-only). The
 * --dangerously-load-development-channels flag bypasses for both kinds.
 * Lives in GrowthBook so it can be updated without a release.
 *
 * Plugin-level granularity: if a plugin is approved, all its channel
 * servers are. Per-server gating was overengineering — a plugin that
 * sprouts a malicious second server is already compromised, and per-server
 * entries would break on harmless plugin refactors.
 *
 * The allowlist check is a pure {marketplace, plugin} comparison against
 * the user's typed tag. The gate's separate 'marketplace' step verifies
 * the tag matches what's actually installed before this check runs.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChannelAllowlist = getChannelAllowlist;
exports.isChannelsEnabled = isChannelsEnabled;
exports.isChannelAllowlisted = isChannelAllowlisted;
var v4_1 = require("zod/v4");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
var pluginIdentifier_js_1 = require("../../utils/plugins/pluginIdentifier.js");
var growthbook_js_1 = require("../analytics/growthbook.js");
var ChannelAllowlistSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.array(v4_1.z.object({
        marketplace: v4_1.z.string(),
        plugin: v4_1.z.string(),
    }));
});
function getChannelAllowlist() {
    var raw = (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_harbor_ledger', []);
    var parsed = ChannelAllowlistSchema().safeParse(raw);
    return parsed.success ? parsed.data : [];
}
/**
 * Overall channels on/off. Checked before any per-server gating —
 * when false, --channels is a no-op and no handlers register.
 * Default false; GrowthBook 5-min refresh.
 */
function isChannelsEnabled() {
    return (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_harbor', false);
}
/**
 * Pure allowlist check keyed off the connection's pluginSource — for UI
 * pre-filtering so the IDE only shows "Enable channel?" for servers that will
 * actually pass the gate. Not a security boundary: channel_enable still runs
 * the full gate. Matches the allowlist comparison inside gateChannelServer()
 * but standalone (no session/marketplace coupling — those are tautologies
 * when the entry is derived from pluginSource).
 *
 * Returns false for undefined pluginSource (non-plugin server — can never
 * match the {marketplace, plugin}-keyed ledger) and for @-less sources
 * (builtin/inline — same reason).
 */
function isChannelAllowlisted(pluginSource) {
    if (!pluginSource)
        return false;
    var _a = (0, pluginIdentifier_js_1.parsePluginIdentifier)(pluginSource), name = _a.name, marketplace = _a.marketplace;
    if (!marketplace)
        return false;
    return getChannelAllowlist().some(function (e) { return e.plugin === name && e.marketplace === marketplace; });
}
