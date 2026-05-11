"use strict";
/**
 * Channel notifications — lets an MCP server push user messages into the
 * conversation. A "channel" (Discord, Slack, SMS, etc.) is just an MCP server
 * that:
 *   - exposes tools for outbound messages (e.g. `send_message`) — standard MCP
 *   - sends `notifications/claude/channel` notifications for inbound — this file
 *
 * The notification handler wraps the content in a <channel> tag and
 * enqueues it. SleepTool polls hasCommandsInQueue() and wakes within 1s.
 * The model sees where the message came from and decides which tool to reply
 * with (the channel's MCP tool, SendUserMessage, or both).
 *
 * feature('KAIROS') || feature('KAIROS_CHANNELS'). Runtime gate tengu_harbor.
 * Requires claude.ai OAuth auth — API key users are blocked until
 * console gets a channelsEnabled admin surface. Teams/Enterprise orgs
 * must explicitly opt in via channelsEnabled: true in managed settings.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHANNEL_PERMISSION_REQUEST_METHOD = exports.ChannelPermissionNotificationSchema = exports.CHANNEL_PERMISSION_METHOD = exports.ChannelMessageNotificationSchema = void 0;
exports.wrapChannelMessage = wrapChannelMessage;
exports.getEffectiveChannelAllowlist = getEffectiveChannelAllowlist;
exports.findChannelEntry = findChannelEntry;
exports.gateChannelServer = gateChannelServer;
var v4_1 = require("zod/v4");
var state_js_1 = require("../../bootstrap/state.js");
var xml_js_1 = require("../../constants/xml.js");
var auth_js_1 = require("../../utils/auth.js");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
var pluginIdentifier_js_1 = require("../../utils/plugins/pluginIdentifier.js");
var settings_js_1 = require("../../utils/settings/settings.js");
var xml_js_2 = require("../../utils/xml.js");
var channelAllowlist_js_1 = require("./channelAllowlist.js");
exports.ChannelMessageNotificationSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        method: v4_1.z.literal('notifications/claude/channel'),
        params: v4_1.z.object({
            content: v4_1.z.string(),
            // Opaque passthrough — thread_id, user, whatever the channel wants the
            // model to see. Rendered as attributes on the <channel> tag.
            meta: v4_1.z.record(v4_1.z.string(), v4_1.z.string()).optional(),
        }),
    });
});
/**
 * Structured permission reply from a channel server. Servers that support
 * this declare `capabilities.experimental['claude/channel/permission']` and
 * emit this event INSTEAD of relaying "yes tbxkq" as text via
 * notifications/claude/channel. Explicit opt-in per server — a channel that
 * just wants to relay text never becomes a permission surface by accident.
 *
 * The server parses the user's reply (spec: /^\s*(y|yes|n|no)\s+([a-km-z]{5})\s*$/i)
 * and emits {request_id, behavior}. CC matches request_id against its
 * pending map. Unlike the regex-intercept approach, text in the general
 * channel can never accidentally match — approval requires the server
 * to deliberately emit this specific event.
 */
exports.CHANNEL_PERMISSION_METHOD = 'notifications/claude/channel/permission';
exports.ChannelPermissionNotificationSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        method: v4_1.z.literal(exports.CHANNEL_PERMISSION_METHOD),
        params: v4_1.z.object({
            request_id: v4_1.z.string(),
            behavior: v4_1.z.enum(['allow', 'deny']),
        }),
    });
});
/**
 * Outbound: CC → server. Fired from interactiveHandler.ts when a
 * permission dialog opens and the server has declared the permission
 * capability. Server formats the message for its platform (Telegram
 * markdown, iMessage rich text, Discord embed) and sends it to the
 * human. When the human replies "yes tbxkq", the server parses that
 * against PERMISSION_REPLY_RE and emits the inbound schema above.
 *
 * Not a zod schema — CC SENDS this, doesn't validate it. A type here
 * keeps both halves of the protocol documented side by side.
 */
exports.CHANNEL_PERMISSION_REQUEST_METHOD = 'notifications/claude/channel/permission_request';
/**
 * Meta keys become XML attribute NAMES — a crafted key like
 * `x="" injected="y` would break out of the attribute structure. Only
 * accept keys that look like plain identifiers. This is stricter than
 * the XML spec (which allows `:`, `.`, `-`) but channel servers only
 * send `chat_id`, `user`, `thread_ts`, `message_id` in practice.
 */
var SAFE_META_KEY = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
function wrapChannelMessage(serverName, content, meta) {
    var attrs = Object.entries(meta !== null && meta !== void 0 ? meta : {})
        .filter(function (_a) {
        var k = _a[0];
        return SAFE_META_KEY.test(k);
    })
        .map(function (_a) {
        var k = _a[0], v = _a[1];
        return " ".concat(k, "=\"").concat((0, xml_js_2.escapeXmlAttr)(v), "\"");
    })
        .join('');
    return "<".concat(xml_js_1.CHANNEL_TAG, " source=\"").concat((0, xml_js_2.escapeXmlAttr)(serverName), "\"").concat(attrs, ">\n").concat(content, "\n</").concat(xml_js_1.CHANNEL_TAG, ">");
}
/**
 * Effective allowlist for the current session. Team/enterprise orgs can set
 * allowedChannelPlugins in managed settings — when set, it REPLACES the
 * GrowthBook ledger (admin owns the trust decision). Undefined falls back
 * to the ledger. Unmanaged users always get the ledger.
 *
 * Callers already read sub/policy for the policy gate — pass them in to
 * avoid double-reading getSettingsForSource (uncached).
 */
function getEffectiveChannelAllowlist(sub, orgList) {
    if ((sub === 'team' || sub === 'enterprise') && orgList) {
        return { entries: orgList, source: 'org' };
    }
    return { entries: (0, channelAllowlist_js_1.getChannelAllowlist)(), source: 'ledger' };
}
/**
 * Match a connected MCP server against the user's parsed --channels entries.
 * server-kind is exact match on bare name; plugin-kind matches on the second
 * segment of plugin:X:Y. Returns the matching entry so callers can read its
 * kind — that's the user's trust declaration, not inferred from runtime shape.
 */
function findChannelEntry(serverName, channels) {
    // split unconditionally — for a bare name like 'slack', parts is ['slack']
    // and the plugin-kind branch correctly never matches (parts[0] !== 'plugin').
    var parts = serverName.split(':');
    return channels.find(function (c) {
        return c.kind === 'server'
            ? serverName === c.name
            : parts[0] === 'plugin' && parts[1] === c.name;
    });
}
/**
 * Gate an MCP server's channel-notification path. Caller checks
 * feature('KAIROS') || feature('KAIROS_CHANNELS') first (build-time
 * elimination). Gate order: capability → runtime gate (tengu_harbor) →
 * auth (OAuth only) → org policy → session --channels → allowlist.
 * API key users are blocked at the auth layer — channels requires
 * claude.ai auth; console orgs have no admin opt-in surface yet.
 *
 *   skip      Not a channel server, or managed org hasn't opted in, or
 *             not in session --channels. Connection stays up; handler
 *             not registered.
 *   register  Subscribe to notifications/claude/channel.
 *
 * Which servers can connect at all is governed by allowedMcpServers —
 * this gate only decides whether the notification handler registers.
 */
function gateChannelServer(serverName, capabilities, pluginSource) {
    var _a, _b;
    // Channel servers declare `experimental['claude/channel']: {}` (MCP's
    // presence-signal idiom — same as `tools: {}`). Truthy covers `{}` and
    // `true`; absent/undefined/explicit-`false` all fail. Key matches the
    // notification method namespace (notifications/claude/channel).
    if (!((_a = capabilities === null || capabilities === void 0 ? void 0 : capabilities.experimental) === null || _a === void 0 ? void 0 : _a['claude/channel'])) {
        return {
            action: 'skip',
            kind: 'capability',
            reason: 'server did not declare claude/channel capability',
        };
    }
    // Overall runtime gate. After capability so normal MCP servers never hit
    // this path. Before auth/policy so the killswitch works regardless of
    // session state.
    if (!(0, channelAllowlist_js_1.isChannelsEnabled)()) {
        return {
            action: 'skip',
            kind: 'disabled',
            reason: 'channels feature is not currently available',
        };
    }
    // OAuth-only. API key users (console) are blocked — there's no
    // channelsEnabled admin surface in console yet, so the policy opt-in
    // flow doesn't exist for them. Drop this when console parity lands.
    if (!((_b = (0, auth_js_1.getClaudeAIOAuthTokens)()) === null || _b === void 0 ? void 0 : _b.accessToken)) {
        return {
            action: 'skip',
            kind: 'auth',
            reason: 'channels requires claude.ai authentication (run /login)',
        };
    }
    // Teams/Enterprise opt-in. Managed orgs must explicitly enable channels.
    // Default OFF — absent or false blocks. Keyed off subscription tier, not
    // "policy settings exist" — a team org with zero configured policy keys
    // (remote endpoint returns 404) is still a managed org and must not fall
    // through to the unmanaged path.
    var sub = (0, auth_js_1.getSubscriptionType)();
    var managed = sub === 'team' || sub === 'enterprise';
    var policy = managed ? (0, settings_js_1.getSettingsForSource)('policySettings') : undefined;
    if (managed && (policy === null || policy === void 0 ? void 0 : policy.channelsEnabled) !== true) {
        return {
            action: 'skip',
            kind: 'policy',
            reason: 'channels not enabled by org policy (set channelsEnabled: true in managed settings)',
        };
    }
    // User-level session opt-in. A server must be explicitly listed in
    // --channels to push inbound this session — protects against a trusted
    // server surprise-adding the capability.
    var entry = findChannelEntry(serverName, (0, state_js_1.getAllowedChannels)());
    if (!entry) {
        return {
            action: 'skip',
            kind: 'session',
            reason: "server ".concat(serverName, " not in --channels list for this session"),
        };
    }
    if (entry.kind === 'plugin') {
        // Marketplace verification: the tag is intent (plugin:slack@anthropic),
        // the runtime name is just plugin:slack:X — could be slack@anthropic or
        // slack@evil depending on what's installed. Verify they match before
        // trusting the tag for the allowlist check below. Source is stashed on
        // the config at addPluginScopeToServers — undefined (non-plugin server,
        // shouldn't happen for plugin-kind entry) or @-less (builtin/inline)
        // both fail the comparison.
        var actual = pluginSource
            ? (0, pluginIdentifier_js_1.parsePluginIdentifier)(pluginSource).marketplace
            : undefined;
        if (actual !== entry.marketplace) {
            return {
                action: 'skip',
                kind: 'marketplace',
                reason: "you asked for plugin:".concat(entry.name, "@").concat(entry.marketplace, " but the installed ").concat(entry.name, " plugin is from ").concat(actual !== null && actual !== void 0 ? actual : 'an unknown source'),
            };
        }
        // Approved-plugin allowlist. Marketplace gate already verified
        // tag == reality, so this is a pure entry check. entry.dev (per-entry,
        // not the session-wide bit) bypasses — so accepting the dev dialog for
        // one entry doesn't leak allowlist-bypass to --channels entries.
        if (!entry.dev) {
            var _c = getEffectiveChannelAllowlist(sub, policy === null || policy === void 0 ? void 0 : policy.allowedChannelPlugins), entries = _c.entries, source = _c.source;
            if (!entries.some(function (e) { return e.plugin === entry.name && e.marketplace === entry.marketplace; })) {
                return {
                    action: 'skip',
                    kind: 'allowlist',
                    reason: source === 'org'
                        ? "plugin ".concat(entry.name, "@").concat(entry.marketplace, " is not on your org's approved channels list (set allowedChannelPlugins in managed settings)")
                        : "plugin ".concat(entry.name, "@").concat(entry.marketplace, " is not on the approved channels allowlist (use --dangerously-load-development-channels for local dev)"),
                };
            }
        }
    }
    else {
        // server-kind: allowlist schema is {marketplace, plugin} — a server entry
        // can never match. Without this, --channels server:plugin:foo:bar would
        // match a plugin's runtime name and register with no allowlist check.
        if (!entry.dev) {
            return {
                action: 'skip',
                kind: 'allowlist',
                reason: "server ".concat(entry.name, " is not on the approved channels allowlist (use --dangerously-load-development-channels for local dev)"),
            };
        }
    }
    return { action: 'register' };
}
